/**
 * COMMUNITY BUILDS LOADER  (Maxroll build guides -> community_* tables)
 * =============================================================================
 *
 * export function loadCommunity(ctx: LoaderContext): CommunityReport
 *
 * Reads data/raw/<version>/maxroll-guides/ (written by the guides fetch):
 *   index.json               { fetched_at, list_url, guides: [ { slug, title, url, author, updated, season,
 *                              playstyle, style_tags[], class, mastery, planner_id, profile_ids[],
 *                              tiers: {corruption, speed, bossing} } ], tier_lists }
 *   profiles/<profileId>.json  verbatim https://planners.maxroll.gg/profiles/le/<id> response
 *                              { id, date, name, class, mainset, ..., data } with `data` a JSON string
 * and resolves every id against the game tables of the same build (classes, masteries, abilities,
 * trees, tree_nodes, uniques, item_subtypes, item_base_types, affixes, affix_tiers, blessings,
 * timelines). Unlike the three game loaders it READS those tables, so it runs after world, items
 * and skills (`--only community` alone loads the rows but cannot resolve anything; the report then
 * says resolution 'skipped'). Without the maxroll-guides/ folder it is a no-op with one log line.
 *
 * Decoding rules (docs/data-sources/maxroll.md, "Planner profiles"):
 *   - PD = JSON.parse(profile.data); PD.profiles[] are the tabs (Starter / Endgame / Aspirational),
 *     PD.activeProfile is the index of the tab the planner opens on (is_default).
 *   - TAB.items maps slot -> key into PD.items; TAB.idols[25] are keys too, index = y * 5 + x of
 *     the idol's top-left cell in the 5x5 altar grid. A slot / idol entry can also be the item OBJECT
 *     itself (inline item, same shape as PD.items[k]; 212 entries in 12 of the 74 1.5.2 profiles):
 *     it is decoded the same way and stored with item_key 'inline'.
 *   - item: itemType = base_type_id, subType = sub_type_id, uniqueID = unique_id, uniqueRolls[rollID],
 *     implicits[] (0..1 rolls), affixes[] / sealedAffix / corruptedAffixes[] = {id: affix_id,
 *     tier: 1-based, roll: 0..1 with 1 = max of the tier range}, corrupted.
 *     Affixes on a unique are 'extra' (legendary potential or a slam; the data does not say which).
 *   - TAB.blessings[i] = {itemType 34, subType = blessings.sub_type_id, implicits[0] = roll},
 *     slot i = timeline i + 1.
 *   - TAB.passives.history = class tree node id per point (tree = classes.tree_id of TAB.class);
 *     TAB.weaver.history the same for the Weaver tree; only history[0:position] is applied.
 *   - TAB.skillTrees = { <tree id>: {history, position} }; the tree id is the LE Tools ability id
 *     (Maxroll abilities[*].playerAbilityID). TAB.activeSkills / specializedSkills hold Maxroll
 *     ability KEYS ('ErasingStrike'), mapped through raw.maxroll.abilities[key].playerAbilityID.
 *   - profile .mainset is normally the Maxroll ability key of the main skill; a numeric mainset is a
 *     unique_id (the build's centrepiece item, e.g. 430 Chorus of the Anurok): it is stored as
 *     main_unique_id (warning 'mainset_unique') and the main skill falls back to the title / points rules.
 *
 * Class rule: the build row takes class / mastery from the profile's default tab. The guide card's
 * mastery is kept as guide_mastery_index; when the class agrees but the mastery differs (leveling
 * guides open on a base-class 'Starting Setup' tab) that is a warning ('guide_mastery'), not an
 * unresolved id. A card CLASS that disagrees with the profile is still unresolved 'guide_class'.
 *
 * Removed nodes: a history entry for a node id that is a hole in the tree's numbering (below its
 * highest node id) and that neither LE Tools nor Maxroll data.json has in that tree (e.g. vr53sl:3,
 * also absent from the 1.5.0 lastepochbuilder trees) is a leftover of a node removed in an older patch. It is a warning ('removed_node'), is not stored and does not count as a point.
 *
 * Determinism: guides in index.json order, profile ids in (planner_id, ...profile_ids) order,
 * tabs in array order, gear slots in SLOT_ORDER then other keys in code-point order, idols by
 * grid index, nodes by first allocation.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { LoaderContext } from "../lib/context.js";
import { count, type ExpectedCount } from "../lib/expected.js";
import { insertRow } from "../lib/sqlite.js";
import { bool, int, num, rawJson, sortedKeys, str, type JsonObject } from "../lib/util.js";

export const tables = [
  "community_builds",
  "community_build_profiles",
  "community_build_items",
  "community_build_item_affixes",
  "community_build_blessings",
  "community_build_passives",
  "community_build_skills",
  "community_build_skill_nodes",
] as const;
export const sharedTables: readonly string[] = [];
export const modSourceKinds: readonly string[] = [];

/** Folder name under data/raw/<version>/. */
export const GUIDES_DIR = "maxroll-guides";

/** Gear slots in display order; other TAB.items keys follow in code-point order. */
export const SLOT_ORDER = ["weapon", "offhand", "head", "body", "waist", "hands", "feet", "neck", "finger1", "finger2", "relic", "altar"];

/** Unresolved-id kinds counted in the report. */
export const UNRESOLVED_KINDS = [
  "class", "mastery", "guide_class", "ability", "skill_tree", "skill_node", "passive_tree", "passive_node",
  "unique", "item_subtype", "affix", "affix_tier", "blessing", "timeline", "blessing_timeline", "item_key",
] as const;
export type UnresolvedKind = (typeof UNRESOLVED_KINDS)[number];

/** Known, explained data quirks: counted in the report under `community.warnings`, not as unresolved. */
export const WARNING_KINDS = ["guide_mastery", "mainset_unique", "removed_node"] as const;
export type WarningKind = (typeof WARNING_KINDS)[number];

/** What each warning kind means (log lines and docs/community-builds.md). */
export const WARNING_TEXT: Record<WarningKind, string> = {
  guide_mastery: "guide card mastery differs from the profile's default tab; the profile's class/mastery is used and the card's kept as guide_mastery_index",
  mainset_unique: "profile mainset is a unique_id, not a skill; stored as main_unique_id, main skill taken from the title / points rules",
  removed_node: "tree history names a node id that is a hole in the tree numbering in both LE Tools and Maxroll (removed in an older patch); not stored, not counted",
};

/** Item key stored for an inline item object (a TAB.items / TAB.idols entry that is the item itself). */
export const INLINE_ITEM_KEY = "inline";

export interface UnresolvedEntry {
  /** Occurrences (one per row that carries the id). */
  count: number;
  /** Distinct ids. */
  distinct: number;
  /** Up to 5 distinct ids with where they were first seen, sorted by id. */
  examples: string[];
}

export interface CommunityReport {
  /** True when maxroll-guides/index.json exists. */
  present: boolean;
  guides: number;
  builds: number;
  profiles_loaded: number;
  profiles_missing: number;
  tabs: number;
  items: number;
  affixes: number;
  /** 'ok' when the game tables were available to resolve against, 'skipped' otherwise. */
  resolution: "ok" | "skipped" | "none";
  unresolved_total: number;
  unresolved: Partial<Record<UnresolvedKind, UnresolvedEntry>>;
  /** Items given inline in TAB.items / TAB.idols instead of as a PD.items key. */
  inline_items: number;
  warnings_total: number;
  /** Explained quirks (WARNING_KINDS), same shape as `unresolved`. */
  warnings: Partial<Record<WarningKind, UnresolvedEntry>>;
  /** Stat properties used by the referenced affix tiers / unique mods / implicits that have no display name (known data gaps). */
  unnamed_properties: { property: number; enum_name: string | null; lines: number }[];
}

// ---------------------------------------------------------------------------
// Raw shapes
// ---------------------------------------------------------------------------

export interface GuideRecord extends JsonObject {
  slug: string;
  title?: string;
  url?: string;
  author?: string;
  updated?: string;
  season?: string | number;
  playstyle?: string;
  style_tags?: string[];
  class?: string;
  mastery?: string;
  planner_id?: string | null;
  profile_ids?: string[];
  tiers?: { corruption?: string | null; speed?: string | null; bossing?: string | null };
}

export interface GuidesIndex extends JsonObject {
  fetched_at?: string;
  list_url?: string;
  guides: GuideRecord[];
}

interface History {
  history?: number[];
  position?: number;
}

interface ProfileAffix {
  id: number;
  tier: number;
  roll?: number;
}

interface ProfileItem extends JsonObject {
  itemType: number;
  subType: number;
  uniqueID?: number;
  uniqueRolls?: number[];
  implicits?: number[];
  affixes?: ProfileAffix[];
  sealedAffix?: ProfileAffix;
  corruptedAffixes?: ProfileAffix[];
  corrupted?: boolean;
}

interface ProfileTab extends JsonObject {
  name?: string;
  class?: number;
  mastery?: number;
  level?: number;
  season?: number;
  items?: Record<string, number | string | ProfileItem | null>;
  idols?: (number | string | ProfileItem | null)[];
  blessings?: ({ itemType: number; subType: number; implicits?: number[] } | null)[];
  passives?: History;
  weaver?: History;
  skillTrees?: Record<string, History>;
  activeSkills?: (string | null)[];
  specializedSkills?: (string | null)[];
  widgetNotes?: Record<string, unknown>;
}

interface ProfileData extends JsonObject {
  profiles?: ProfileTab[];
  items?: Record<string, ProfileItem>;
  activeProfile?: number;
  globalNotes?: Record<string, unknown>;
  strAndWeak?: { strengths?: string[]; weaknesses?: string[] };
}

// ---------------------------------------------------------------------------
// Reading the folder
// ---------------------------------------------------------------------------

/** The guides folder of the version being built. */
export const guidesDir = (ctx: LoaderContext): string => join(ctx.raw.dir, GUIDES_DIR);

/** index.json of a guides folder, or null when the folder / file is absent. */
export function readIndex(dir: string): GuidesIndex | null {
  const p = join(dir, "index.json");
  if (!existsSync(p)) return null;
  const idx = JSON.parse(readFileSync(p, "utf8")) as GuidesIndex;
  if (!idx || !Array.isArray(idx.guides)) throw new Error(`${p}: expected { guides: [...] }`);
  return idx;
}

/** Profile ids of a guide in build order: planner_id first, then profile_ids[] (deduplicated). */
export function guideProfileIds(g: GuideRecord): string[] {
  const ids: string[] = [];
  for (const id of [g.planner_id, ...(g.profile_ids ?? [])]) {
    const s = str(id);
    if (s && !ids.includes(s)) ids.push(s);
  }
  return ids;
}

/** Number of community_builds rows an index produces (one per guide x profile id, at least one per guide). */
export function plannedBuildCount(index: GuidesIndex | null): number {
  if (!index) return 0;
  return index.guides.reduce((n, g) => n + Math.max(1, guideProfileIds(g).length), 0);
}

// ---------------------------------------------------------------------------
// Expected counts
// ---------------------------------------------------------------------------

/** Invariants that hold with or without the guides folder. */
export const expected: ExpectedCount[] = [
  count("community_builds", 0, "profile_status = 'ok' AND class_id IS NULL", "community_builds[ok without class]"),
  {
    name: "community_builds[ok without exactly one default tab]",
    sql: `SELECT count(*) FROM community_builds b WHERE b.profile_status = 'ok'
            AND (SELECT count(*) FROM community_build_profiles p WHERE p.build_id = b.build_id AND p.is_default = 1) <> 1`,
    expected: 0,
  },
  count("community_build_item_affixes", 0, "tier < 1", "community_build_item_affixes[tier < 1]"),
];

/** Expected counts for a guides folder: one build per guide x profile; at least one when the folder exists. */
export function expectedFor(dir: string): ExpectedCount[] {
  let index: GuidesIndex | null = null;
  try {
    index = readIndex(dir);
  } catch {
    index = null;
  }
  const n = plannedBuildCount(index);
  const list: ExpectedCount[] = [count("community_builds", n, undefined, undefined, `${GUIDES_DIR}/index.json guides x profile ids`)];
  if (index) {
    list.push({ ...count("community_builds", 1, undefined, "community_builds[>= 1]"), op: ">=" });
    const files = index.guides.flatMap(guideProfileIds).filter((id) => existsSync(join(dir, "profiles", `${id}.json`)));
    if (files.length) list.push({ ...count("community_build_profiles", 1, undefined, "community_build_profiles[>= 1]"), op: ">=" });
  }
  return [...list, ...expected];
}

// ---------------------------------------------------------------------------
// Resolution against the game tables
// ---------------------------------------------------------------------------

interface Lookups {
  available: boolean;
  classes: Map<number, { name: string; tree_id: string }>;
  classByName: Map<string, number>;
  masteries: Map<string, string>; // 'c:m' -> name
  masteryByName: Map<string, [number, number]>;
  abilities: Map<string, string | null>; // id -> name
  abilityByInternal: Map<string, string>;
  trees: Map<string, string | null>; // tree_id -> ability_id
  nodes: Set<string>; // 'tree:node'
  maxNode: Map<string, number>; // tree_id -> highest node_id
  uniques: Map<number, { set_id: number | null; is_set_item: number; name: string | null }>;
  subtypes: Set<string>;
  baseTypes: Map<number, { size_x: number | null; size_y: number | null; is_idol: number }>;
  affixes: Map<number, { affix_type: number; name: string | null }>;
  affixTiers: Set<string>;
  blessings: Map<number, { timeline_id: number | null; is_grand: number }>;
  timelines: Set<number>;
  /** Maxroll ability key -> LE ability id (raw.maxroll.abilities[key].playerAbilityID). */
  maxrollKeys: Map<string, string>;
  /** Maxroll data.json skillTrees[tree].nodes keys as 'tree:node' (to tell removed nodes from data gaps). */
  maxrollNodes: Set<string>;
  maxrollTrees: Set<string>;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function loadLookups(ctx: LoaderContext): Lookups {
  const db = ctx.db;
  const all = <T>(sql: string) => db.prepare(sql).all() as T[];
  const L: Lookups = {
    available: false,
    classes: new Map(),
    classByName: new Map(),
    masteries: new Map(),
    masteryByName: new Map(),
    abilities: new Map(),
    abilityByInternal: new Map(),
    trees: new Map(),
    nodes: new Set(),
    maxNode: new Map(),
    uniques: new Map(),
    subtypes: new Set(),
    baseTypes: new Map(),
    affixes: new Map(),
    affixTiers: new Set(),
    blessings: new Map(),
    timelines: new Set(),
    maxrollKeys: new Map(),
    maxrollNodes: new Set(),
    maxrollTrees: new Set(),
  };
  for (const r of all<{ class_id: number; name: string; tree_id: string }>(`SELECT class_id, name, tree_id FROM classes ORDER BY class_id`)) {
    L.classes.set(r.class_id, r);
    L.classByName.set(norm(r.name), r.class_id);
  }
  for (const r of all<{ class_id: number; mastery_index: number; name: string }>(`SELECT class_id, mastery_index, name FROM masteries ORDER BY class_id, mastery_index`)) {
    L.masteries.set(`${r.class_id}:${r.mastery_index}`, r.name);
    L.masteryByName.set(norm(r.name), [r.class_id, r.mastery_index]);
  }
  for (const r of all<{ ability_id: string; name: string | null; internal_name: string | null }>(`SELECT ability_id, name, internal_name FROM abilities ORDER BY ability_id`)) {
    L.abilities.set(r.ability_id, r.name);
    if (r.internal_name && !L.abilityByInternal.has(norm(r.internal_name))) L.abilityByInternal.set(norm(r.internal_name), r.ability_id);
  }
  for (const r of all<{ tree_id: string; ability_id: string | null }>(`SELECT tree_id, ability_id FROM trees ORDER BY tree_id`)) L.trees.set(r.tree_id, r.ability_id);
  for (const r of all<{ k: string; tree_id: string; node_id: number }>(`SELECT tree_id || ':' || node_id AS k, tree_id, node_id FROM tree_nodes`)) {
    L.nodes.add(r.k);
    if (r.node_id > (L.maxNode.get(r.tree_id) ?? -1)) L.maxNode.set(r.tree_id, r.node_id);
  }
  for (const r of all<{ unique_id: number; set_id: number | null; is_set_item: number; name: string | null }>(`SELECT unique_id, set_id, is_set_item, name FROM uniques`)) {
    L.uniques.set(r.unique_id, r);
  }
  for (const r of all<{ k: string }>(`SELECT base_type_id || ':' || sub_type_id AS k FROM item_subtypes`)) L.subtypes.add(r.k);
  for (const r of all<{ base_type_id: number; size_x: number | null; size_y: number | null; is_idol: number }>(`SELECT base_type_id, size_x, size_y, is_idol FROM item_base_types`)) {
    L.baseTypes.set(r.base_type_id, r);
  }
  for (const r of all<{ affix_id: number; affix_type: number; name: string | null }>(`SELECT affix_id, affix_type, name FROM affixes`)) L.affixes.set(r.affix_id, r);
  for (const r of all<{ k: string }>(`SELECT affix_id || ':' || tier AS k FROM affix_tiers`)) L.affixTiers.add(r.k);
  for (const r of all<{ sub_type_id: number; timeline_id: number | null; is_grand: number }>(`SELECT sub_type_id, timeline_id, is_grand FROM blessings`)) {
    L.blessings.set(r.sub_type_id, r);
  }
  for (const r of all<{ timeline_id: number }>(`SELECT timeline_id FROM timelines`)) L.timelines.add(r.timeline_id);
  const mr = ctx.raw.maxroll;
  if (mr?.abilities) {
    for (const k of sortedKeys(mr.abilities)) {
      const id = str(mr.abilities[k]?.playerAbilityID);
      if (id) L.maxrollKeys.set(k, id);
    }
  }
  const mrTrees = (mr as { skillTrees?: Record<string, { nodes?: Record<string, unknown> } | null> } | null | undefined)?.skillTrees;
  if (mrTrees && typeof mrTrees === "object") {
    for (const t of sortedKeys(mrTrees)) {
      L.maxrollTrees.add(t);
      for (const n of Object.keys(mrTrees[t]?.nodes ?? {})) L.maxrollNodes.add(`${t}:${n}`);
    }
  }
  L.available = L.classes.size > 0 && L.affixes.size > 0 && L.trees.size > 0;
  return L;
}

/** Occurrence / distinct-id counter per kind (unresolved ids and warnings). */
class Tally<K extends string> {
  private seen = new Map<K, Map<string, string>>();
  private counts = new Map<K, number>();
  constructor(
    private readonly enabled: boolean,
    private readonly kinds: readonly K[],
  ) {}
  add(kind: K, id: string, where: string): void {
    if (!this.enabled) return;
    this.counts.set(kind, (this.counts.get(kind) ?? 0) + 1);
    let m = this.seen.get(kind);
    if (!m) this.seen.set(kind, (m = new Map()));
    if (!m.has(id)) m.set(id, where);
  }
  get total(): number {
    let n = 0;
    for (const v of this.counts.values()) n += v;
    return n;
  }
  toReport(): Partial<Record<K, UnresolvedEntry>> {
    const out: Partial<Record<K, UnresolvedEntry>> = {};
    for (const kind of this.kinds) {
      const m = this.seen.get(kind);
      if (!m) continue;
      const ids = [...m.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      out[kind] = { count: this.counts.get(kind) ?? 0, distinct: ids.length, examples: ids.slice(0, 5).map((id) => `${id} (${m.get(id)})`) };
    }
    return out;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Flatten a Lexical rich-text JSON tree ({root: {children: [...]}}) to plain text. */
export function lexicalText(node: unknown): string {
  const BLOCK = new Set(["root", "paragraph", "heading", "list", "listitem", "quote", "code", "table", "tablerow", "tablecell"]);
  const walk = (n: unknown): string => {
    if (!n || typeof n !== "object") return "";
    const o = n as JsonObject;
    if (o.type === "linebreak") return "\n";
    const kids: unknown[] = Array.isArray(o.children) ? o.children : [];
    if (!kids.length && typeof o.text === "string") return o.text;
    let out = "";
    for (const c of kids) {
      const t = walk(c);
      const co = (c ?? {}) as JsonObject;
      const block = typeof co.type === "string" && (BLOCK.has(co.type) || /-(container|title|content)$/.test(co.type));
      if (block) {
        if (out && !out.endsWith("\n")) out += "\n";
        out += (co.type === "listitem" ? "- " : "") + t;
        if (!out.endsWith("\n")) out += "\n";
      } else out += t;
    }
    return out;
  };
  const root = node && typeof node === "object" && "root" in (node as JsonObject) ? (node as JsonObject).root : node;
  return walk(root)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** {section: text} for a notes object, sections in key order, empty sections dropped; null when empty. */
function notesJson(notes: Record<string, unknown> | undefined): string | null {
  if (!notes || typeof notes !== "object") return null;
  const out: Record<string, string> = {};
  for (const k of sortedKeys(notes)) {
    const t = lexicalText(notes[k]);
    if (t) out[k] = t;
  }
  return Object.keys(out).length ? JSON.stringify(out) : null;
}

/** node id -> {points, first_ord} for history[0:position], in first-allocation order. */
function countHistory(h: History | undefined, skip?: (node: number) => boolean): { node: number; points: number; first: number }[] {
  const hist = Array.isArray(h?.history) ? h!.history! : [];
  const pos = typeof h?.position === "number" ? Math.min(Math.max(0, h.position), hist.length) : hist.length;
  const m = new Map<number, { node: number; points: number; first: number }>();
  for (let i = 0; i < pos; i++) {
    const node = int(hist[i]);
    if (node === null || skip?.(node)) continue;
    const e = m.get(node);
    if (e) e.points++;
    else m.set(node, { node, points: 1, first: i });
  }
  return [...m.values()];
}

function parseProfile(path: string): { envelope: JsonObject; data: ProfileData } {
  const envelope = JSON.parse(readFileSync(path, "utf8")) as JsonObject;
  const d = envelope.data;
  const data = (typeof d === "string" ? JSON.parse(d) : d) as ProfileData;
  if (!data || typeof data !== "object" || !Array.isArray(data.profiles)) throw new Error("profile data has no profiles[]");
  return { envelope, data };
}

// ---------------------------------------------------------------------------
// The loader
// ---------------------------------------------------------------------------

/** Load data/raw/<version>/maxroll-guides/ (no-op when absent). */
export function loadCommunity(ctx: LoaderContext): CommunityReport {
  return loadCommunityFrom(ctx, guidesDir(ctx));
}

/** Load a guides folder (index.json + profiles/) into the community tables of ctx.db. */
export function loadCommunityFrom(ctx: LoaderContext, dir: string): CommunityReport {
  const report: CommunityReport = {
    present: false,
    guides: 0,
    builds: 0,
    profiles_loaded: 0,
    profiles_missing: 0,
    tabs: 0,
    items: 0,
    affixes: 0,
    resolution: "none",
    unresolved_total: 0,
    unresolved: {},
    inline_items: 0,
    warnings_total: 0,
    warnings: {},
    unnamed_properties: [],
  };
  const index = readIndex(dir);
  if (!index) {
    ctx.log.info(`community: no ${GUIDES_DIR}/index.json in ${ctx.raw.dir}, skipped (0 builds)`);
    return report;
  }
  report.present = true;
  report.guides = index.guides.length;

  const L = loadLookups(ctx);
  report.resolution = L.available ? "ok" : "skipped";
  if (!L.available) ctx.log.warn("community: game tables are empty (build with world,items,skills); ids not resolved");
  const U = new Tally<UnresolvedKind>(L.available, UNRESOLVED_KINDS);
  const W = new Tally<WarningKind>(L.available, WARNING_KINDS);
  /**
   * A removed node: a hole in a known tree's node numbering (below its highest node id) that neither the LE Tools
   * tree nor the Maxroll tree has. Ids above the highest node, or present in only one source, stay unresolved.
   */
  const isRemovedNode = (treeId: string, node: number): boolean =>
    L.available &&
    L.trees.has(treeId) &&
    node >= 0 &&
    node < (L.maxNode.get(treeId) ?? -1) &&
    !L.nodes.has(`${treeId}:${node}`) &&
    L.maxrollTrees.has(treeId) &&
    !L.maxrollNodes.has(`${treeId}:${node}`);
  const removedSkip = (treeId: string | null) => (treeId ? (node: number) => isRemovedNode(treeId, node) : undefined);
  const usedAffixTiers = new Set<string>();
  const usedUniques = new Set<number>();
  const usedSubtypes = new Set<string>();

  const resolveAbility = (key: string): string | null => {
    const viaMaxroll = L.maxrollKeys.get(key);
    if (viaMaxroll && L.abilities.has(viaMaxroll)) return viaMaxroll;
    if (L.abilities.has(key)) return key;
    return L.abilityByInternal.get(norm(key)) ?? null;
  };

  let buildId = 0;
  let profileRow = 0;
  let itemRow = 0;
  for (const g of index.guides) {
    const ids = guideProfileIds(g);
    const primary = ids[0] ?? null;
    for (const profileId of ids.length ? ids : [null]) {
      buildId++;
      report.builds++;
      const where = `${g.slug}${profileId ? `/${profileId}` : ""}`;
      let status = profileId ? "ok" : "none";
      let envelope: JsonObject | null = null;
      let data: ProfileData | null = null;
      if (profileId) {
        const p = join(dir, "profiles", `${profileId}.json`);
        if (!existsSync(p)) {
          status = "missing";
          report.profiles_missing++;
          ctx.log.warn(`community: ${where}: profile file profiles/${profileId}.json missing`);
        } else {
          try {
            ({ envelope, data } = parseProfile(p));
            report.profiles_loaded++;
          } catch (e) {
            status = "invalid";
            ctx.log.warn(`community: ${where}: cannot parse profile: ${(e as Error).message}`);
          }
        }
      }
      const tabs = data?.profiles ?? [];
      const activeIdx = int(data?.activeProfile);
      const defaultOrd = tabs.length ? (activeIdx !== null && activeIdx >= 0 && activeIdx < tabs.length ? activeIdx : 0) : null;
      const defTab = defaultOrd !== null ? tabs[defaultOrd]! : null;

      // class / mastery: the default tab's numeric ids, else the guide's names
      let classId: number | null = int(defTab?.class);
      let masteryIndex: number | null = int(defTab?.mastery);
      const guideMastery = str(g.mastery) ? L.masteryByName.get(norm(g.mastery!)) : undefined;
      const guideClass = str(g.class) ? L.classByName.get(norm(g.class!)) : undefined;
      if (classId === null) {
        classId = guideMastery?.[0] ?? guideClass ?? null;
        masteryIndex = guideMastery?.[1] ?? (guideClass !== undefined ? 0 : null);
        if (classId === null && (g.class || g.mastery)) U.add("guide_class", `${g.class ?? ""}/${g.mastery ?? ""}`, where);
      }
      if (classId !== null && !L.classes.has(classId)) U.add("class", String(classId), where);
      if (classId !== null && masteryIndex !== null && !L.masteries.has(`${classId}:${masteryIndex}`)) U.add("mastery", `${classId}:${masteryIndex}`, where);
      // the card's mastery resolved to a mastery_index of the card's class (0 when the card names the base class)
      let guideMasteryIndex: number | null = null;
      if (guideMastery) guideMasteryIndex = guideMastery[1];
      else if (guideClass !== undefined && str(g.mastery) && norm(g.mastery!) === norm(L.classes.get(guideClass)?.name ?? "")) guideMasteryIndex = 0;
      if (defTab && classId !== null && L.available) {
        // the published class / mastery must agree with the profile: a class mismatch is unresolved,
        // a mastery mismatch within the same class is a warning (the profile's own mastery is used)
        const mName = L.masteries.get(`${classId}:${masteryIndex}`);
        const cName = L.classes.get(classId)?.name;
        const cardClass = guideMastery?.[0] ?? guideClass;
        const classMismatch = (str(g.class) && cName && norm(g.class!) !== norm(cName)) || (cardClass !== undefined && cardClass !== classId);
        const masteryMismatch =
          str(g.mastery) && mName && norm(g.mastery!) !== norm(mName) && !(masteryIndex === 0 && cName && norm(g.mastery!) === norm(cName));
        if (classMismatch) U.add("guide_class", `${g.class ?? ""}/${g.mastery ?? ""} vs ${cName}/${mName}`, where);
        else if (masteryMismatch) W.add("guide_mastery", `${g.class ?? ""}/${g.mastery ?? ""} vs ${cName}/${mName}`, where);
      }

      // skills per tab (needed for main_ability)
      const tabSkills = tabs.map((tab) => collectSkills(tab, resolveAbility, L, removedSkip));

      // main ability: profile .mainset, else a specialized skill named in the title, else the most points
      let mainAbility: string | null = null;
      let mainSource: string | null = null;
      let mainUnique: number | null = null;
      const mainset = str(envelope?.mainset);
      if (mainset) {
        mainAbility = resolveAbility(mainset);
        if (mainAbility) mainSource = "mainset";
        else if (/^\d+$/.test(mainset) && L.uniques.has(Number(mainset))) {
          // a numeric mainset is a unique_id (the build's centrepiece item), not a skill
          mainUnique = Number(mainset);
          W.add("mainset_unique", `${mainset} = ${L.uniques.get(mainUnique)!.name ?? "?"}`, `${where} mainset`);
        } else U.add("ability", mainset, `${where} mainset`);
      }
      const defSkills = defaultOrd !== null ? tabSkills[defaultOrd]! : [];
      if (!mainAbility && defSkills.length) {
        const title = norm(`${g.title ?? ""} ${str(envelope?.name) ?? ""}`);
        const named = defSkills.filter((s) => s.is_specialized && s.ability_id && L.abilities.get(s.ability_id) && title.includes(norm(L.abilities.get(s.ability_id)!)));
        if (named.length) {
          mainAbility = named.sort((a, b) => b.name_len - a.name_len)[0]!.ability_id;
          mainSource = "title";
        } else {
          const spec = defSkills.filter((s) => s.is_specialized && s.ability_id).sort((a, b) => b.points - a.points || a.ord - b.ord);
          if (spec.length) {
            mainAbility = spec[0]!.ability_id;
            mainSource = "points";
          }
        }
      }

      const envelopeNoData: JsonObject | null = envelope ? Object.fromEntries(Object.entries(envelope).filter(([k]) => k !== "data")) : null;
      const tiers = g.tiers ?? {};
      insertRow(ctx.db, "community_builds", {
        build_id: buildId,
        source: "maxroll",
        slug: g.slug,
        title: str(g.title),
        url: str(g.url),
        author: str(g.author),
        updated_at: str(g.updated),
        season: str(g.season) ?? (defTab?.season !== undefined ? str(defTab.season) : null),
        playstyle: str(g.playstyle),
        style_tags: Array.isArray(g.style_tags) ? JSON.stringify(g.style_tags) : null,
        class_id: classId,
        mastery_index: masteryIndex,
        class_name: str(g.class),
        mastery_name: str(g.mastery),
        guide_mastery_index: guideMasteryIndex,
        main_ability_id: mainAbility,
        main_ability_source: mainSource,
        main_unique_id: mainUnique,
        tier_corruption: str(tiers.corruption),
        tier_speed: str(tiers.speed),
        tier_bossing: str(tiers.bossing),
        planner_id: str(g.planner_id),
        profile_id: profileId,
        is_primary: profileId === primary,
        profile_status: status,
        profile_name: str(envelope?.name),
        profile_date: str(envelope?.date),
        profile_name_default: defTab ? str(defTab.name) : null,
        strengths: Array.isArray(data?.strAndWeak?.strengths) ? JSON.stringify(data!.strAndWeak!.strengths) : null,
        weaknesses: Array.isArray(data?.strAndWeak?.weaknesses) ? JSON.stringify(data!.strAndWeak!.weaknesses) : null,
        notes_json: notesJson(data?.globalNotes),
        raw_json: JSON.stringify({ guide: g, profile: envelopeNoData }),
      });

      // tabs
      tabs.forEach((tab, ord) => {
        profileRow++;
        report.tabs++;
        const tw = `${where}/${tab.name ?? ord}`;
        const tClass = int(tab.class);
        const tree = tClass !== null ? L.classes.get(tClass)?.tree_id ?? (ctx.raw.maxroll?.classes?.find((c) => c.classID === tClass)?.treeID as string | undefined) ?? null : null;
        if (tClass !== null && !L.classes.has(tClass)) U.add("class", String(tClass), tw);
        const passives = countHistory(tab.passives, removedSkip(tree));
        const weaver = countHistory(tab.weaver, removedSkip("weaver"));
        for (const [treeId, h] of [[tree, tab.passives], ["weaver", tab.weaver]] as const) {
          if (treeId) for (const r of countHistory(h)) if (isRemovedNode(treeId, r.node)) W.add("removed_node", `${treeId}:${r.node}`, tw);
        }
        const skills = tabSkills[ord]!;
        insertRow(ctx.db, "community_build_profiles", {
          build_profile_id: profileRow,
          build_id: buildId,
          ord,
          name: str(tab.name),
          is_default: ord === defaultOrd,
          class_id: tClass,
          mastery_index: int(tab.mastery),
          level: int(tab.level),
          season: int(tab.season),
          passive_points: passives.reduce((n, p) => n + p.points, 0),
          skill_points: skills.filter((s) => s.is_specialized).reduce((n, s) => n + s.points, 0),
          notes_json: notesJson(tab.widgetNotes),
          raw_json: rawJson(tab, ["items", "idols", "blessings", "passives", "weaver", "skillTrees", "activeSkills", "specializedSkills", "widgetNotes"]),
        });

        // gear + idols
        const slotKeys = sortedKeys(tab.items ?? {}).sort((a, b) => {
          const ia = SLOT_ORDER.indexOf(a);
          const ib = SLOT_ORDER.indexOf(b);
          if (ia >= 0 && ib >= 0) return ia - ib;
          if (ia >= 0) return -1;
          if (ib >= 0) return 1;
          return a < b ? -1 : a > b ? 1 : 0;
        });
        const entries: { slot: string; key: string; grid: number | null; inline?: ProfileItem }[] = [];
        const entry = (slot: string, k: unknown, grid: number | null) => {
          if (k === null || k === undefined || k === "") return;
          // normally a PD.items key; some profiles put the item object itself in the slot (inline item)
          if (typeof k === "object") entries.push({ slot, key: INLINE_ITEM_KEY, grid, inline: k as ProfileItem });
          else entries.push({ slot, key: String(k), grid });
        };
        for (const slot of slotKeys) entry(slot, tab.items![slot], null);
        (tab.idols ?? []).forEach((k, i) => entry("idol", k, i));
        for (const e of entries) {
          const it = e.inline ?? data!.items?.[e.key];
          const iw = `${tw}/${e.slot}${e.grid !== null ? `#${e.grid}` : ""}`;
          if (!it || typeof it !== "object") {
            U.add("item_key", e.key, iw);
            continue;
          }
          itemRow++;
          report.items++;
          if (e.inline) report.inline_items++;
          insertItem(ctx, L, U, itemRow, profileRow, e, it, iw, report, usedAffixTiers, usedUniques, usedSubtypes);
        }

        // blessings
        (tab.blessings ?? []).forEach((b, slot) => {
          if (!b || typeof b !== "object") return;
          const bw = `${tw}/blessing#${slot}`;
          const blessingId = int(b.subType);
          const timelineId = slot + 1;
          if (blessingId === null) {
            U.add("blessing", JSON.stringify(b), bw);
            return;
          }
          const bl = L.blessings.get(blessingId);
          if (int(b.itemType) !== 34 || !bl) U.add("blessing", `${b.itemType}:${b.subType}`, bw);
          if (!L.timelines.has(timelineId)) U.add("timeline", String(timelineId), bw);
          else if (bl && bl.timeline_id !== timelineId) U.add("blessing_timeline", `${blessingId}@${timelineId} (data: ${bl.timeline_id})`, bw);
          insertRow(ctx.db, "community_build_blessings", {
            build_profile_id: profileRow,
            slot,
            timeline_id: timelineId,
            blessing_id: blessingId,
            roll: num(b.implicits?.[0]),
            is_grand: bl ? bl.is_grand : null,
          });
        });

        // passives (class tree + Weaver tree)
        const passiveTrees: [string | null, typeof passives][] = [[tree, passives], ["weaver", weaver]];
        for (const [treeId, rows] of passiveTrees) {
          if (!rows.length) continue;
          if (!treeId || !L.trees.has(treeId)) {
            U.add("passive_tree", String(treeId), tw);
            if (!treeId) continue;
          }
          for (const r of rows) {
            if (L.trees.has(treeId) && !L.nodes.has(`${treeId}:${r.node}`)) U.add("passive_node", `${treeId}:${r.node}`, tw);
            insertRow(ctx.db, "community_build_passives", { build_profile_id: profileRow, tree_id: treeId, node_id: r.node, points: r.points, first_ord: r.first });
          }
        }

        // skills + skill nodes
        for (const s of skills) {
          if (s.maxroll_key && !s.ability_id) U.add("ability", s.maxroll_key, tw);
          insertRow(ctx.db, "community_build_skills", {
            build_profile_id: profileRow,
            ord: s.ord,
            ability_id: s.ability_id,
            maxroll_key: s.maxroll_key,
            tree_id: s.tree_id,
            is_specialized: s.is_specialized,
            spec_slot: s.spec_slot,
            on_bar: s.on_bar,
            bar_slot: s.bar_slot,
            points: s.points,
            has_tree_points: s.points > 0,
          });
        }
        for (const treeId of sortedKeys(tab.skillTrees ?? {})) {
          const known = L.trees.has(treeId);
          if (!known) U.add("skill_tree", treeId, tw);
          for (const r of countHistory(tab.skillTrees![treeId])) {
            if (isRemovedNode(treeId, r.node)) {
              W.add("removed_node", `${treeId}:${r.node}`, tw);
              continue;
            }
            if (known && !L.nodes.has(`${treeId}:${r.node}`)) U.add("skill_node", `${treeId}:${r.node}`, tw);
            insertRow(ctx.db, "community_build_skill_nodes", {
              build_profile_id: profileRow,
              tree_id: treeId,
              ability_id: L.trees.get(treeId) ?? null,
              node_id: r.node,
              points: r.points,
              first_ord: r.first,
            });
          }
        }
        // node_count: allocated nodes of each skill's tree in this tab (also for leftover trees of non-specialized skills)
        ctx.db
          .prepare(
            "UPDATE community_build_skills SET node_count = (SELECT count(*) FROM community_build_skill_nodes n WHERE n.build_profile_id = community_build_skills.build_profile_id AND n.tree_id = community_build_skills.tree_id) WHERE build_profile_id = ? AND tree_id IS NOT NULL",
          )
          .run(profileRow);
      });
    }
  }

  report.unresolved = U.toReport();
  report.unresolved_total = U.total;
  report.warnings = W.toReport();
  report.warnings_total = W.total;
  if (L.available) report.unnamed_properties = unnamedProperties(ctx, usedAffixTiers, usedUniques, usedSubtypes);
  for (const [kind, e] of Object.entries(report.unresolved)) {
    ctx.log.warn(`community: ${e!.count} unresolved ${kind} id(s) (${e!.distinct} distinct), e.g. ${e!.examples.slice(0, 3).join(", ")}`);
  }
  for (const [kind, e] of Object.entries(report.warnings)) {
    ctx.log.warn(`community: ${e!.count} ${kind} (${WARNING_TEXT[kind as WarningKind]}; ${e!.distinct} distinct), e.g. ${e!.examples.slice(0, 3).join(", ")}`);
  }
  ctx.log.info(
    `community: ${report.guides} guides, ${report.builds} builds, ${report.profiles_loaded} profiles, ${report.tabs} tabs, ${report.items} items, unresolved ${report.unresolved_total}`,
  );
  return report;
}

interface SkillRow {
  ord: number;
  ability_id: string | null;
  maxroll_key: string | null;
  tree_id: string | null;
  is_specialized: boolean;
  spec_slot: number | null;
  on_bar: boolean;
  bar_slot: number | null;
  points: number;
  name_len: number;
}

/** Skills of a tab: specializedSkills, then the rest of activeSkills, then other skillTrees keys. */
function collectSkills(
  tab: ProfileTab,
  resolveAbility: (key: string) => string | null,
  L: Lookups,
  removedSkip: (treeId: string | null) => ((node: number) => boolean) | undefined,
): SkillRow[] {
  const rows: SkillRow[] = [];
  const byKey = new Map<string, SkillRow>();
  const treeKeys = sortedKeys(tab.skillTrees ?? {});
  const treePoints = (treeId: string | null) =>
    treeId ? countHistory(tab.skillTrees?.[treeId], removedSkip(treeId)).reduce((n, r) => n + r.points, 0) : 0;
  const treeFor = (abilityId: string | null): string | null => {
    if (!abilityId) return null;
    if (treeKeys.includes(abilityId)) return abilityId;
    return treeKeys.find((t) => L.trees.get(t) === abilityId) ?? null;
  };
  const add = (key: string): SkillRow => {
    let r = byKey.get(key);
    if (r) return r;
    const abilityId = resolveAbility(key);
    const treeId = treeFor(abilityId);
    r = {
      ord: rows.length,
      ability_id: abilityId,
      maxroll_key: key,
      tree_id: treeId,
      is_specialized: false,
      spec_slot: null,
      on_bar: false,
      bar_slot: null,
      points: treePoints(treeId),
      name_len: (abilityId && L.abilities.get(abilityId)?.length) || 0,
    };
    byKey.set(key, r);
    rows.push(r);
    return r;
  };
  (tab.specializedSkills ?? []).forEach((k, i) => {
    const key = str(k);
    if (!key) return;
    const r = add(key);
    r.is_specialized = true;
    r.spec_slot ??= i;
  });
  (tab.activeSkills ?? []).forEach((k, i) => {
    const key = str(k);
    if (!key) return;
    const r = add(key);
    r.on_bar = true;
    r.bar_slot ??= i;
  });
  const covered = new Set(rows.map((r) => r.tree_id).filter(Boolean));
  for (const t of treeKeys) {
    if (covered.has(t)) continue;
    const abilityId = L.trees.get(t) ?? (L.abilities.has(t) ? t : null);
    rows.push({
      ord: rows.length,
      ability_id: abilityId,
      maxroll_key: null,
      tree_id: t,
      is_specialized: false,
      spec_slot: null,
      on_bar: false,
      bar_slot: null,
      points: treePoints(t),
      name_len: 0,
    });
  }
  return rows;
}

function insertItem(
  ctx: LoaderContext,
  L: Lookups,
  U: Tally<UnresolvedKind>,
  itemRow: number,
  profileRow: number,
  e: { slot: string; key: string; grid: number | null },
  it: ProfileItem,
  where: string,
  report: CommunityReport,
  usedAffixTiers: Set<string>,
  usedUniques: Set<number>,
  usedSubtypes: Set<string>,
): void {
  const base = int(it.itemType);
  const sub = int(it.subType);
  const uniqueId = it.uniqueID === undefined || it.uniqueID === null ? null : int(it.uniqueID);
  const u = uniqueId !== null ? L.uniques.get(uniqueId) : undefined;
  if (uniqueId !== null) {
    if (!u) U.add("unique", String(uniqueId), where);
    else usedUniques.add(uniqueId);
  }
  if (base !== null && sub !== null) {
    if (!L.subtypes.has(`${base}:${sub}`)) U.add("item_subtype", `${base}:${sub}`, where);
    else usedSubtypes.add(`${base}:${sub}`);
  }
  const bt = base !== null ? L.baseTypes.get(base) : undefined;
  const isIdol = bt ? bt.is_idol === 1 : base !== null && base >= 25 && base <= 33;
  const affixes = Array.isArray(it.affixes) ? it.affixes : [];
  const lines: { origin: string; a: ProfileAffix }[] = [
    ...affixes.map((a) => ({ origin: uniqueId !== null ? "extra" : "normal", a })),
    ...(it.sealedAffix && typeof it.sealedAffix === "object" ? [{ origin: "sealed", a: it.sealedAffix }] : []),
    ...(Array.isArray(it.corruptedAffixes) ? it.corruptedAffixes.map((a) => ({ origin: "corruption", a })) : []),
  ];
  let kind: string;
  if (uniqueId !== null) kind = u?.is_set_item ? "set" : affixes.length ? "legendary" : "unique";
  else if (isIdol) kind = "idol";
  else if (lines.some((l) => l.origin !== "corruption" && (int(l.a.tier) ?? 0) >= 6)) kind = "exalted";
  else kind = affixes.length >= 3 ? "rare" : affixes.length >= 1 ? "magic" : "normal";

  insertRow(ctx.db, "community_build_items", {
    item_row_id: itemRow,
    build_profile_id: profileRow,
    slot: e.slot,
    grid_index: e.grid,
    grid_x: e.grid !== null ? e.grid % 5 : null,
    grid_y: e.grid !== null ? Math.floor(e.grid / 5) : null,
    item_key: e.key,
    kind,
    base_type_id: base,
    sub_type_id: sub,
    unique_id: uniqueId,
    set_id: u?.is_set_item ? u.set_id : null,
    is_corrupted: bool(it.corrupted) ?? 0,
    size_x: bt?.size_x ?? null,
    size_y: bt?.size_y ?? null,
    affix_count: affixes.length,
    implicit_rolls: Array.isArray(it.implicits) ? JSON.stringify(it.implicits) : null,
    unique_rolls: Array.isArray(it.uniqueRolls) ? JSON.stringify(it.uniqueRolls) : null,
    raw_json: rawJson(it),
  });
  let ord = 0;
  for (const { origin, a } of lines) {
    const affixId = int(a?.id);
    const tier = int(a?.tier);
    if (affixId === null || tier === null) {
      U.add("affix", JSON.stringify(a ?? null), where);
      continue;
    }
    const af = L.affixes.get(affixId);
    if (!af) U.add("affix", String(affixId), where);
    else if (!L.affixTiers.has(`${affixId}:${tier}`)) U.add("affix_tier", `${affixId}:T${tier}`, where);
    else usedAffixTiers.add(`${affixId}:${tier}`);
    report.affixes++;
    insertRow(ctx.db, "community_build_item_affixes", {
      item_row_id: itemRow,
      ord: ord++,
      origin,
      affix_id: affixId,
      tier,
      roll: num(a.roll),
      is_prefix: af ? (af.affix_type === 0 ? 1 : 0) : null,
    });
  }
}

/** Properties without a display name used by the referenced stat lines (excluding indirect and skill-local ids). */
function unnamedProperties(ctx: LoaderContext, affixTiers: Set<string>, uniques: Set<number>, subtypes: Set<string>): CommunityReport["unnamed_properties"] {
  const counts = new Map<number, number>();
  const stmt = ctx.db.prepare(
    `SELECT m.property AS property FROM mods m JOIN stat_properties sp ON sp.property = m.property
      WHERE m.source_kind = ? AND m.source_id = ? AND (? IS NULL OR m.tier = ?) AND sp.name IS NULL AND coalesce(sp.is_indirect, 0) = 0`,
  );
  const scan = (kind: string, id: string, tier: number | null) => {
    for (const r of stmt.all(kind, id, tier, tier) as { property: number }[]) counts.set(r.property, (counts.get(r.property) ?? 0) + 1);
  };
  for (const k of [...affixTiers].sort()) {
    const [a, t] = k.split(":");
    scan("affix_tier", a!, Number(t));
  }
  for (const u of [...uniques].sort((a, b) => a - b)) scan("unique_mod", String(u), null);
  for (const s of [...subtypes].sort()) scan(s.startsWith("34:") ? "blessing" : s.startsWith("41:") ? "idol_altar" : "implicit", s, null);
  const enumName = ctx.db.prepare(`SELECT enum_name FROM stat_properties WHERE property = ?`);
  return [...counts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([property, lines]) => ({ property, enum_name: (enumName.get(property) as { enum_name: string | null } | undefined)?.enum_name ?? null, lines }));
}

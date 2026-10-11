/**
 * Community build tools: `builds`, `build`, `item_usage`, `slot_meta` (and `get` kind `build`).
 *
 * Data: the community_* tables (docs/schema.md section 3.9, docs/community-builds.md), i.e. Maxroll
 * community build guides for game 1.5.2 and their planner profiles. These are community-authored
 * choices, not game truth: use them for "what do people run", never as a source for mechanics.
 *
 * Tabs: a profile has several tabs (Starter / Endgame / Aspirational, leveling guides use
 * 'Starting Setup (lvl 1 - 9)' ...). A tab argument is matched against the trimmed tab name, case
 * insensitively: exact name first, then names starting with it, then names containing it (the
 * build's default tab first among equals). 'default' = the tab the planner opens on, 'any' / 'all'
 * = every tab.
 */
import { all, one, ToolError, type Ctx, type Row } from "./context.js";
import { classIdOf, dropNulls } from "./get.js";
import { affixSummary, nodeDisplay, statLine, uniqueDisplay } from "./display.js";

// ---------------------------------------------------------------- shared lookups

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const round = (v: number, d = 4) => Math.round(v * 10 ** d) / 10 ** d;
const pct = (n: number, of: number) => (of ? Math.round((n / of) * 1000) / 10 : 0);
const MODIFIER = ["added", "increased", "more"];

/** Gear slot aliases -> stored slot names (community_build_items.slot). */
const SLOT_ALIASES: Record<string, string[]> = {
  weapon: ["weapon"],
  mainhand: ["weapon"],
  offhand: ["offhand"],
  shield: ["offhand"],
  quiver: ["offhand"],
  catalyst: ["offhand"],
  head: ["head"],
  helmet: ["head"],
  helm: ["head"],
  body: ["body"],
  chest: ["body"],
  bodyarmor: ["body"],
  bodyarmour: ["body"],
  waist: ["waist"],
  belt: ["waist"],
  hands: ["hands"],
  gloves: ["hands"],
  feet: ["feet"],
  boots: ["feet"],
  neck: ["neck"],
  amulet: ["neck"],
  ring: ["finger1", "finger2"],
  rings: ["finger1", "finger2"],
  finger: ["finger1", "finger2"],
  finger1: ["finger1"],
  finger2: ["finger2"],
  relic: ["relic"],
  altar: ["altar"],
  idol: ["idol"],
  idols: ["idol"],
};
export const SLOT_NAMES = Object.keys(SLOT_ALIASES);

export function resolveSlot(slot: string): string[] {
  const s = SLOT_ALIASES[norm(slot)];
  if (!s) throw new ToolError(`Unknown slot '${slot}'. Valid: weapon, offhand, head (helmet), body (chest), waist (belt), hands (gloves), feet (boots), neck (amulet), finger1, finger2, ring (both fingers), relic, altar, idol`);
  return s;
}

interface Mastery {
  class_id: number;
  mastery_index: number;
  name: string;
}
function masteries(ctx: Ctx): Mastery[] {
  return all(ctx, "SELECT class_id, mastery_index, name FROM masteries ORDER BY class_id, mastery_index") as unknown as Mastery[];
}
const masteryName = (ms: Mastery[], c: unknown, m: unknown): string | undefined =>
  ms.find((x) => x.class_id === c && x.mastery_index === m)?.name;

function resolveClassArg(ctx: Ctx, v: string | number): number {
  const id = classIdOf(ctx, v);
  if (id === undefined) throw new ToolError(`Unknown class '${v}'. Use 0-4 or Primalist, Mage, Sentinel, Acolyte, Rogue`);
  return id;
}

/** Mastery by name ('Void Knight', 'void-knight') or 'class:index'. A base class name resolves to mastery 0. */
function resolveMasteryArg(ctx: Ctx, v: string): Mastery {
  const ms = masteries(ctx);
  const m = /^(\d+):(\d+)$/.exec(v.trim());
  const hit = m ? ms.find((x) => x.class_id === Number(m[1]) && x.mastery_index === Number(m[2])) : ms.find((x) => norm(x.name) === norm(v));
  if (!hit) throw new ToolError(`Unknown mastery '${v}'. Valid: ${ms.filter((x) => x.mastery_index > 0).map((x) => x.name).join(", ")}`);
  return hit;
}

/** Ability id ('es6ai') or name (player skills preferred). */
function resolveAbilityArg(ctx: Ctx, v: string): { ability_id: string; name: string } {
  const s = v.trim();
  const byId = one(ctx, "SELECT ability_id, name FROM abilities WHERE ability_id = ?", s);
  if (byId) return byId as { ability_id: string; name: string };
  const rows = all(
    ctx,
    "SELECT ability_id, name FROM abilities WHERE lower(name) = lower(?) ORDER BY CASE kind WHEN 'player' THEN 0 WHEN 'player_sub' THEN 1 ELSE 2 END, ability_id",
    s,
  );
  if (rows.length) return rows[0] as { ability_id: string; name: string };
  const n = norm(s);
  const loose = all(ctx, "SELECT ability_id, name, kind FROM abilities WHERE kind = 'player' AND name IS NOT NULL").find((r) => norm(r.name as string) === n);
  if (loose) return loose as { ability_id: string; name: string };
  throw new ToolError(`Unknown ability '${v}'. Use lookup({name, kinds:["ability"]}) to find the id.`);
}

/** Unique / set item by unique_id or name (exact, then normalized, then prefix); a set name gives its members. */
function resolveUniqueArg(ctx: Ctx, v: string | number): { ids: number[]; name: string } {
  const s = String(v).trim();
  if (/^\d+$/.test(s)) {
    const u = one(ctx, "SELECT unique_id, name FROM uniques WHERE unique_id = ?", Number(s));
    if (!u) throw new ToolError(`No unique with id ${s}`);
    return { ids: [u.unique_id as number], name: u.name as string };
  }
  const exact = all(ctx, "SELECT unique_id, name FROM uniques WHERE lower(name) = lower(?) ORDER BY unique_id", s);
  if (exact.length) return { ids: exact.map((r) => r.unique_id as number), name: exact[0]!.name as string };
  const n = norm(s);
  const loose = all(ctx, "SELECT unique_id, name FROM uniques WHERE name IS NOT NULL ORDER BY unique_id").filter((r) => norm(r.name as string) === n);
  if (loose.length) return { ids: loose.map((r) => r.unique_id as number), name: loose[0]!.name as string };
  const set = one(ctx, "SELECT set_id, name FROM sets WHERE lower(name) = lower(?) AND set_id > 0", s);
  if (set) {
    const members = all(ctx, "SELECT unique_id FROM uniques WHERE set_id = ? ORDER BY unique_id", set.set_id).map((r) => r.unique_id as number);
    if (members.length) return { ids: members, name: set.name as string };
  }
  const prefix = all(ctx, "SELECT unique_id, name FROM uniques WHERE lower(name) LIKE lower(?) ORDER BY length(name), unique_id LIMIT 2", s.replace(/[%_]/g, "") + "%");
  if (prefix.length === 1) return { ids: [prefix[0]!.unique_id as number], name: prefix[0]!.name as string };
  throw new ToolError(`Unknown unique / set item '${v}'. Use lookup({name, kinds:["unique","set"]}).`);
}

/** Affix by id or name (every affix carrying that name, e.g. gear and idol variants). */
function resolveAffixArg(ctx: Ctx, v: string | number): { ids: number[]; name: string } {
  const s = String(v).trim();
  if (/^\d+$/.test(s)) {
    const a = one(ctx, "SELECT affix_id, name FROM affixes WHERE affix_id = ?", Number(s));
    if (!a) throw new ToolError(`No affix with id ${s}`);
    return { ids: [a.affix_id as number], name: a.name as string };
  }
  let rows = all(ctx, "SELECT affix_id, name FROM affixes WHERE lower(name) = lower(?) ORDER BY affix_id", s);
  if (!rows.length) {
    const n = norm(s);
    rows = all(ctx, "SELECT affix_id, name FROM affixes WHERE name IS NOT NULL ORDER BY affix_id").filter((r) => norm(r.name as string) === n);
  }
  if (!rows.length) throw new ToolError(`Unknown affix '${v}'. Use lookup({name, kinds:["affix"]}).`);
  return { ids: rows.map((r) => r.affix_id as number), name: rows[0]!.name as string };
}

// ---------------------------------------------------------------- builds and tabs

interface BuildRow extends Row {
  build_id: number;
  slug: string;
  class_id: number | null;
  mastery_index: number | null;
  guide_mastery_index: number | null;
  main_ability_id: string | null;
}
interface TabRow extends Row {
  build_profile_id: number;
  build_id: number;
  ord: number;
  name: string | null;
  is_default: number;
}

const BUILD_SQL = `
  SELECT b.build_id, b.slug, b.title, b.url, b.author, b.updated_at, b.season, b.playstyle, b.style_tags,
         b.class_id, b.mastery_index, b.guide_mastery_index, c.name AS class_name, b.main_ability_id, ab.name AS main_skill,
         b.main_ability_source, b.main_unique_id, mu.name AS main_unique_name,
         b.tier_corruption, b.tier_speed, b.tier_bossing, b.is_primary, b.profile_id, b.profile_status
    FROM community_builds b
    LEFT JOIN classes c ON c.class_id = b.class_id
    LEFT JOIN abilities ab ON ab.ability_id = b.main_ability_id
    LEFT JOIN uniques mu ON mu.unique_id = b.main_unique_id`;

function loadBuilds(ctx: Ctx): BuildRow[] {
  return all(ctx, `${BUILD_SQL} ORDER BY b.build_id`) as BuildRow[];
}
function loadTabs(ctx: Ctx): Map<number, TabRow[]> {
  const out = new Map<number, TabRow[]>();
  for (const t of all(ctx, "SELECT build_profile_id, build_id, ord, name, is_default, level, class_id, mastery_index, passive_points, skill_points FROM community_build_profiles ORDER BY build_id, ord") as TabRow[]) {
    (out.get(t.build_id) ?? out.set(t.build_id, []).get(t.build_id)!).push(t);
  }
  return out;
}

/**
 * Tabs of one build selected by a tab argument. undefined -> `dflt` ('default' | 'any');
 * 'default' -> the default tab; 'any' / 'all' -> every tab; else exact / prefix / substring name match.
 * fallback: when a named tab matches nothing, use the default tab instead (slot_meta's Endgame default).
 */
export function pickTabs(tabs: TabRow[], spec: string | undefined, dflt: "default" | "any", fallback = false): TabRow[] {
  const s = (spec ?? dflt).trim();
  const key = norm(s);
  const def = tabs.filter((t) => t.is_default === 1);
  if (key === "default" || key === "") return def.length ? def : tabs.slice(0, 1);
  if (key === "any" || key === "all") return tabs;
  const order = (xs: TabRow[]) => [...xs].sort((a, b) => b.is_default - a.is_default || a.ord - b.ord);
  const name = (t: TabRow) => norm(t.name ?? "");
  for (const test of [(t: TabRow) => name(t) === key, (t: TabRow) => name(t).startsWith(key), (t: TabRow) => name(t).includes(key)]) {
    const hit = order(tabs.filter(test));
    if (hit.length) return hit.slice(0, 1);
  }
  return fallback ? (def.length ? def : tabs.slice(0, 1)) : [];
}

function buildHeader(b: BuildRow, ms: Mastery[], tabs: TabRow[]): Row {
  const mastery = masteryName(ms, b.class_id, b.mastery_index);
  const guideMastery = b.guide_mastery_index !== null && b.guide_mastery_index !== b.mastery_index ? masteryName(ms, b.class_id, b.guide_mastery_index) : undefined;
  return dropNulls({
    build_id: b.build_id,
    slug: b.slug,
    title: b.title,
    url: b.url,
    author: b.author,
    updated: b.updated_at,
    season: b.season,
    playstyle: b.playstyle,
    class: b.class_name,
    mastery,
    guide_mastery: guideMastery,
    main_skill: b.main_skill,
    main_ability_id: b.main_ability_id,
    main_unique: b.main_unique_id !== null ? { unique_id: b.main_unique_id, name: b.main_unique_name } : undefined,
    tiers: { corruption: b.tier_corruption ?? null, speed: b.tier_speed ?? null, bossing: b.tier_bossing ?? null },
    tabs: tabs.map((t) => t.name),
    is_primary: b.is_primary === 1,
  });
}

/**
 * True when a build is of that mastery (the profile's own, or the guide card's for leveling guides).
 * A base class name given as mastery ('Sentinel') matches every build of the class (callers check index 0).
 */
function isMastery(b: BuildRow, m: Mastery): boolean {
  return b.class_id === m.class_id && (b.mastery_index === m.mastery_index || b.guide_mastery_index === m.mastery_index);
}

const inList = (n: number) => `(${new Array(n).fill("?").join(",")})`;

/** build_profile_id set of the tabs that equip any of these uniques / carry any of these affixes. */
function profilesWith(ctx: Ctx, what: "unique" | "affix", ids: number[]): Set<number> {
  const sql =
    what === "unique"
      ? `SELECT DISTINCT build_profile_id AS p FROM community_build_items WHERE unique_id IN ${inList(ids.length)}`
      : `SELECT DISTINCT i.build_profile_id AS p FROM community_build_item_affixes x JOIN community_build_items i ON i.item_row_id = x.item_row_id WHERE x.affix_id IN ${inList(ids.length)}`;
  return new Set(all(ctx, sql, ...ids).map((r) => r.p as number));
}

// ---------------------------------------------------------------- builds

export interface BuildsArgs {
  class?: string | number;
  mastery?: string;
  ability?: string;
  any_skill?: boolean;
  item?: string | number;
  affix?: string | number;
  tab?: string;
  tier?: string;
  tier_list?: "corruption" | "speed" | "bossing";
  playstyle?: string;
  season?: string;
  limit?: number;
}

export function builds(ctx: Ctx, a: BuildsArgs = {}): Row {
  const ms = masteries(ctx);
  const tabsBy = loadTabs(ctx);
  let rows = loadBuilds(ctx);
  const applied: Row = {};
  if (a.class !== undefined && a.class !== "") {
    const cid = resolveClassArg(ctx, a.class);
    rows = rows.filter((b) => b.class_id === cid);
    applied.class = cid;
  }
  const byGuideCard = new Set<number>();
  if (a.mastery) {
    const m = resolveMasteryArg(ctx, a.mastery);
    rows = rows.filter((b) => (m.mastery_index === 0 ? b.class_id === m.class_id : isMastery(b, m)));
    // leveling guides open on a base-class tab: they match through the guide card's mastery
    if (m.mastery_index !== 0) for (const b of rows) if (b.mastery_index !== m.mastery_index) byGuideCard.add(b.build_id);
    applied.mastery = m.name;
  }
  // tabs considered by the ability (any_skill) / item / affix filters
  const tabsOf = (b: BuildRow) => pickTabs(tabsBy.get(b.build_id) ?? [], a.tab, "any");
  let abilityId: string | undefined;
  if (a.ability) {
    const ab = resolveAbilityArg(ctx, a.ability);
    abilityId = ab.ability_id;
    applied.ability = ab.name;
    if (a.any_skill) {
      const spec = new Set(
        all(ctx, "SELECT DISTINCT build_profile_id AS p FROM community_build_skills WHERE ability_id = ? AND is_specialized = 1", ab.ability_id).map((r) => r.p as number),
      );
      rows = rows.filter((b) => b.main_ability_id === ab.ability_id || tabsOf(b).some((t) => spec.has(t.build_profile_id)));
    } else rows = rows.filter((b) => b.main_ability_id === ab.ability_id);
  }
  if (a.item !== undefined && a.item !== "") {
    const u = resolveUniqueArg(ctx, a.item);
    applied.item = u.name;
    const ps = profilesWith(ctx, "unique", u.ids);
    rows = rows.filter((b) => tabsOf(b).some((t) => ps.has(t.build_profile_id)));
  }
  if (a.affix !== undefined && a.affix !== "") {
    const af = resolveAffixArg(ctx, a.affix);
    applied.affix = { name: af.name, affix_ids: af.ids };
    const ps = profilesWith(ctx, "affix", af.ids);
    rows = rows.filter((b) => tabsOf(b).some((t) => ps.has(t.build_profile_id)));
  }
  if (a.tier) {
    const list = a.tier_list ?? "corruption";
    const col = `tier_${list}` as const;
    const want = a.tier.trim().toUpperCase();
    rows = rows.filter((b) => String(b[col] ?? "").toUpperCase() === want);
    applied.tier = `${want} (${list})`;
  }
  if (a.playstyle) {
    const p = norm(a.playstyle);
    rows = rows.filter((b) => norm(String(b.playstyle ?? "")) === p);
  }
  if (a.season) {
    const s = a.season.trim().toLowerCase();
    rows = rows.filter((b) => String(b.season ?? "").toLowerCase().includes(s));
  }
  const lim = Math.max(1, Math.min(a.limit ?? 50, 500));
  // with an ability filter: how every tab of the build uses that skill (specialized, on the bar, tree points / nodes;
  // a tree with points on a non-specialized skill is a planner leftover with no effect in game)
  const skillRows = abilityId
    ? all(
        ctx,
        `SELECT s.build_profile_id, s.is_specialized, s.on_bar, s.points, s.node_count FROM community_build_skills s WHERE s.ability_id = ?`,
        abilityId,
      )
    : [];
  const skillBy = new Map<number, Row>(skillRows.map((r) => [r.build_profile_id as number, r]));
  const out = rows.slice(0, lim).map((b) => {
    const h = buildHeader(b, ms, tabsBy.get(b.build_id) ?? []);
    if (byGuideCard.has(b.build_id)) h.mastery_match = "guide card (the profile opens on another tab, e.g. a leveling guide's base-class tab)";
    if (abilityId) {
      const uses = (tabsBy.get(b.build_id) ?? [])
        .filter((t) => skillBy.has(t.build_profile_id))
        .map((t) => {
          const s = skillBy.get(t.build_profile_id)!;
          return dropNulls({
            tab: t.name,
            specialized: s.is_specialized === 1,
            on_bar: s.on_bar === 1,
            points: s.points,
            node_count: s.node_count,
            leftover_tree: s.is_specialized !== 1 && (s.points as number) > 0 ? true : undefined,
          });
        });
      if (uses.length) h.ability_tabs = uses;
    }
    return h;
  });
  return {
    builds: out,
    count: out.length,
    total_matching: rows.length,
    truncated: rows.length > out.length,
    ...(Object.keys(applied).length ? { resolved: applied } : {}),
    source: SOURCE_NOTE,
  };
}

export const SOURCE_NOTE = "Maxroll community build guides (planner profiles) for game 1.5.2: community choices, not game truth.";

// ---------------------------------------------------------------- build

export const BUILD_SECTIONS = ["gear", "idols", "blessings", "passives", "skills", "notes"] as const;
export type BuildSection = (typeof BUILD_SECTIONS)[number];

export interface BuildArgs {
  id?: number | string;
  slug?: string;
  tab?: string;
  sections?: string[];
}

function findBuild(ctx: Ctx, id: number | string | undefined, slug: string | undefined): BuildRow {
  if (id !== undefined && id !== "") {
    if (!/^\d+$/.test(String(id).trim())) return findBuild(ctx, undefined, String(id));
    const b = one(ctx, `${BUILD_SQL} WHERE b.build_id = ?`, Number(id)) as BuildRow | undefined;
    if (!b) throw new ToolError(`No community build with build_id ${id}. Use builds() to list them.`);
    return b;
  }
  if (!slug) throw new ToolError("Pass id (build_id) or slug");
  const s = slug.trim();
  const rows = all(ctx, `${BUILD_SQL} WHERE b.slug = ? OR lower(b.title) = lower(?) ORDER BY b.is_primary DESC, b.build_id`, s, s) as BuildRow[];
  if (rows.length) return rows[0]!;
  const near = all(ctx, "SELECT slug FROM community_builds WHERE slug LIKE ? OR title LIKE ? ORDER BY build_id LIMIT 5", `%${s}%`, `%${s}%`).map((r) => r.slug);
  throw new ToolError(`No community build with slug '${slug}'.${near.length ? ` Did you mean: ${near.join(", ")}?` : " Use builds() or lookup({name, kinds:[\"build\"]})."}`);
}

interface AffixLine extends Row {
  item_row_id: number;
  ord: number;
  origin: string;
  affix_id: number;
  tier: number;
  roll: number | null;
  is_prefix: number | null;
  name: string | null;
}

/**
 * Affix scaling by item base (AffixList+Affix.getModifier, D; docs/schema.md v_affix_values): the stored tier range is
 * authored for the affix's standard_affix_effect_modifier (std); on an item with affix effect modifier aem it is
 * multiplied by (1 + aem) / (1 + std) (1 when equal) and rounded to the stat's grid (affix_stats.rounding_scale).
 */
export function affixScaleFactor(itemAem: number | null | undefined, std: number | null | undefined): number {
  const a = itemAem ?? 0;
  const b = std ?? 0;
  return a === b ? 1 : (1 + a) / (1 + b);
}
/** Round half away from zero on a grid of 1/scale (SQLite round(); the game rounds half to even in float32). */
export function roundToGrid(v: number, scale: number): number {
  const x = v * scale;
  return (Math.sign(x) * Math.round(Math.abs(x))) / scale;
}

function modValue(m: Row, roll: number | null | undefined, factor = 1): number {
  const sc = (m.rounding_scale as number | null | undefined) ?? 0;
  let lo = m.value_min as number;
  let hi = (m.value_max as number | null) ?? lo;
  if (factor !== 1 && sc) {
    lo = roundToGrid(lo * factor, sc);
    hi = roundToGrid(hi * factor, sc);
  }
  return round(lo + (hi - lo) * (roll ?? 1));
}
function modLine(ctx: Ctx, m: Row, roll: number | null | undefined, factor = 1): Row {
  const value = modValue(m, roll, factor);
  const stored = factor !== 1 ? modValue(m, roll) : undefined;
  return dropNulls({
    stat: (m.label as string | null) ?? [m.tag_names, m.property_name].filter(Boolean).join(" "),
    line: statLine(ctx, { ...m, value_min: value, value_max: value }),
    value,
    stored_value: stored !== undefined && stored !== value ? stored : undefined,
    modifier: m.modifier_type === null || m.modifier_type === undefined ? undefined : MODIFIER[m.modifier_type as number],
  });
}

/** Affix lines of a set of items, each with name, tier, prefix/suffix, origin, roll and rolled stat values. */
function affixesFor(ctx: Ctx, itemIds: number[]): Map<number, Row[]> {
  const out = new Map<number, Row[]>();
  if (!itemIds.length) return out;
  const lines = all(
    ctx,
    `SELECT x.item_row_id, x.ord, x.origin, x.affix_id, x.tier, x.roll, x.is_prefix, af.name,
            af.standard_affix_effect_modifier AS std_aem, coalesce(st.affix_effect_modifier, bt.affix_effect_modifier, 0) AS item_aem
       FROM community_build_item_affixes x
       LEFT JOIN affixes af ON af.affix_id = x.affix_id
       JOIN community_build_items i ON i.item_row_id = x.item_row_id
       LEFT JOIN item_subtypes st ON st.base_type_id = i.base_type_id AND st.sub_type_id = i.sub_type_id
       LEFT JOIN item_base_types bt ON bt.base_type_id = i.base_type_id
      WHERE x.item_row_id IN ${inList(itemIds.length)} ORDER BY x.item_row_id, x.ord`,
    ...itemIds,
  ) as AffixLine[];
  const keys = [...new Set(lines.map((l) => String(l.affix_id)))];
  const mods = new Map<string, Row[]>();
  if (keys.length) {
    for (const m of all(
      ctx,
      `SELECT m.source_id, m.tier, m.label, m.property, m.special_tag, m.tags, m.property_name, m.tag_names, m.modifier_type, m.value_min, m.value_max, s.rounding_scale
         FROM mods m LEFT JOIN affix_stats s ON s.affix_id = CAST(m.source_id AS INTEGER) AND s.ord = m.source_ord
        WHERE m.source_kind = 'affix_tier' AND m.source_id IN ${inList(keys.length)} ORDER BY m.source_id, m.tier, m.source_ord, m.sub_ord`,
      ...keys,
    )) {
      const k = `${m.source_id}:${m.tier}`;
      (mods.get(k) ?? mods.set(k, []).get(k)!).push(m);
    }
  }
  for (const l of lines) {
    const factor = affixScaleFactor(l.item_aem as number | null, l.std_aem as number | null);
    const values = (mods.get(`${l.affix_id}:${l.tier}`) ?? []).map((m) => modLine(ctx, m, l.roll, factor));
    const row = dropNulls({
      affix_id: l.affix_id,
      name: l.name ?? `affix ${l.affix_id}`,
      // the affix as the item tooltip shows it, with the rolled value(s) and tier
      display: values.length ? `${values.map((v) => v.line ?? v.stat).join("; ")} (T${l.tier})` : undefined,
      tier: l.tier,
      type: l.is_prefix === null ? undefined : l.is_prefix ? "prefix" : "suffix",
      origin: l.origin,
      roll: l.roll,
      scale_factor: factor !== 1 ? round(factor, 4) : undefined,
      values,
    });
    (out.get(l.item_row_id) ?? out.set(l.item_row_id, []).get(l.item_row_id)!).push(row);
  }
  return out;
}

function itemsDoc(ctx: Ctx, profileId: number, idols: boolean): Row[] {
  const items = all(
    ctx,
    `SELECT i.item_row_id, i.slot, i.grid_x, i.grid_y, i.kind, i.base_type_id, i.sub_type_id, i.unique_id, i.set_id, i.is_corrupted,
            i.size_x, i.size_y, i.implicit_rolls, u.name AS unique_name, st.name AS base, bt.name AS base_type, s.name AS set_name
       FROM community_build_items i
       LEFT JOIN uniques u ON u.unique_id = i.unique_id
       LEFT JOIN item_subtypes st ON st.base_type_id = i.base_type_id AND st.sub_type_id = i.sub_type_id
       LEFT JOIN item_base_types bt ON bt.base_type_id = i.base_type_id
       LEFT JOIN sets s ON s.set_id = i.set_id
      WHERE i.build_profile_id = ? AND ${idols ? "i.slot = 'idol'" : "i.slot <> 'idol'"}
      ORDER BY ${idols ? "i.grid_index" : "i.item_row_id"}`,
    profileId,
  );
  const affixes = affixesFor(ctx, items.map((i) => i.item_row_id as number));
  const implicitStmt = ctx.db.prepare(
    "SELECT source_ord, label, property, special_tag, tags, property_name, tag_names, modifier_type, value_min, value_max FROM mods WHERE source_kind = 'implicit' AND source_id = ? ORDER BY source_ord, sub_ord",
  );
  return items.map((i) => {
    let rolls: number[] = [];
    try {
      rolls = i.implicit_rolls ? (JSON.parse(i.implicit_rolls as string) as number[]) : [];
    } catch {
      rolls = [];
    }
    const implicits = (implicitStmt.all(`${i.base_type_id}:${i.sub_type_id}`) as Row[]).map((m) => modLine(ctx, m, rolls[m.source_ord as number]));
    return dropNulls({
      slot: idols ? undefined : i.slot,
      grid_x: idols ? i.grid_x : undefined,
      grid_y: idols ? i.grid_y : undefined,
      size: idols && i.size_x ? `${i.size_x}x${i.size_y}` : undefined,
      name: (i.unique_name as string | null) ?? i.base,
      display: i.unique_id !== null ? uniqueDisplay(ctx, i.unique_id as number) : i.base ? `${i.kind ?? "rare"} ${i.base}` : undefined,
      kind: i.kind,
      unique_id: i.unique_id,
      set: i.set_id !== null ? { set_id: i.set_id, name: i.set_name } : undefined,
      base: i.base,
      base_type: i.base_type,
      base_type_id: i.base_type_id,
      sub_type_id: i.sub_type_id,
      corrupted: i.is_corrupted === 1 ? true : undefined,
      implicits: implicits.length ? implicits : undefined,
      affixes: affixes.get(i.item_row_id as number) ?? [],
    });
  });
}

function nodeList(ctx: Ctx, rows: Row[]): Row[] {
  return rows.map((n) =>
    dropNulls({
      node_id: n.node_id,
      name: n.node_name ?? `node ${n.node_id}`,
      display: n.tree_id ? nodeDisplay(ctx, n.tree_id as string, n.node_id as number) : undefined,
      points: n.points,
      max_points: n.max_points,
    }),
  );
}

function parseJson<T>(s: unknown): T | undefined {
  if (typeof s !== "string" || !s) return undefined;
  try {
    return JSON.parse(s) as T;
  } catch {
    return undefined;
  }
}

export function build(ctx: Ctx, a: BuildArgs = {}): Row {
  const b = findBuild(ctx, a.id, a.slug);
  const ms = masteries(ctx);
  const tabs = loadTabs(ctx).get(b.build_id) ?? [];
  const tab = pickTabs(tabs, a.tab, "default")[0];
  if (!tab) throw new ToolError(`Build ${b.slug} has no tab matching '${a.tab}'. Tabs: ${tabs.map((t) => t.name).join(", ")}`);
  const sections = new Set<string>(a.sections?.length ? a.sections : BUILD_SECTIONS);
  const bad = [...sections].filter((s) => !(BUILD_SECTIONS as readonly string[]).includes(s));
  if (bad.length) throw new ToolError(`Unknown section(s) ${bad.join(", ")}. Valid: ${BUILD_SECTIONS.join(", ")}`);
  const full = one(ctx, "SELECT strengths, weaknesses, notes_json, profile_name, profile_date FROM community_builds WHERE build_id = ?", b.build_id)!;
  const pid = tab.build_profile_id;
  const out: Row = {
    build: { ...buildHeader(b, ms, tabs), profile_id: b.profile_id, profile_name: full.profile_name, profile_date: full.profile_date },
    tab: dropNulls({
      name: tab.name,
      ord: tab.ord,
      is_default: tab.is_default === 1,
      level: tab.level,
      class: one(ctx, "SELECT name FROM classes WHERE class_id = ?", tab.class_id)?.name,
      mastery: masteryName(ms, tab.class_id, tab.mastery_index),
      passive_points: tab.passive_points,
      skill_points: tab.skill_points,
    }),
    strengths: parseJson<string[]>(full.strengths) ?? [],
    weaknesses: parseJson<string[]>(full.weaknesses) ?? [],
  };
  if (sections.has("gear")) out.gear = itemsDoc(ctx, pid, false);
  if (sections.has("idols")) out.idols = itemsDoc(ctx, pid, true);
  if (sections.has("blessings")) {
    out.blessings = all(
      ctx,
      `SELECT cb.timeline_id, tl.name AS timeline, cb.blessing_id, bl.name, cb.is_grand, cb.roll
         FROM community_build_blessings cb
         LEFT JOIN timelines tl ON tl.timeline_id = cb.timeline_id
         LEFT JOIN blessings bl ON bl.sub_type_id = cb.blessing_id
        WHERE cb.build_profile_id = ? ORDER BY cb.slot`,
      pid,
    ).map((r) => dropNulls({ ...r, is_grand: r.is_grand === null ? undefined : r.is_grand === 1 }));
  }
  if (sections.has("passives")) {
    const nodes = all(
      ctx,
      `SELECT a.tree_id, a.node_id, n.name AS node_name, a.points, n.max_points, n.mastery, a.first_ord
         FROM community_build_passives a LEFT JOIN tree_nodes n ON n.tree_id = a.tree_id AND n.node_id = a.node_id
        WHERE a.build_profile_id = ? ORDER BY a.tree_id = 'weaver', n.mastery, a.first_ord`,
      pid,
    );
    const groups = new Map<string, Row & { nodes: Row[] }>();
    for (const n of nodes) {
      const weaver = n.tree_id === "weaver";
      const key = weaver ? "weaver" : `${n.tree_id}:${n.mastery ?? "?"}`;
      let g = groups.get(key);
      if (!g) {
        g = {
          tree_id: n.tree_id,
          mastery_index: weaver ? undefined : (n.mastery as number | null),
          mastery: weaver ? "Weaver" : masteryName(ms, tab.class_id, n.mastery) ?? `mastery ${n.mastery}`,
          points: 0,
          nodes: [],
        } as Row & { nodes: Row[] };
        groups.set(key, g);
      }
      g.points = (g.points as number) + (n.points as number);
      g.nodes.push(n);
    }
    out.passives = [...groups.values()].map((g) => dropNulls({ ...g, nodes: nodeList(ctx, g.nodes) }));
  }
  if (sections.has("skills")) {
    const skillNodes = all(
      ctx,
      `SELECT s.tree_id, s.node_id, n.name AS node_name, s.points, n.max_points FROM community_build_skill_nodes s
         LEFT JOIN tree_nodes n ON n.tree_id = s.tree_id AND n.node_id = s.node_id
        WHERE s.build_profile_id = ? ORDER BY s.tree_id, s.first_ord`,
      pid,
    );
    out.skills = all(
      ctx,
      `SELECT s.ability_id, a.name, s.maxroll_key, s.tree_id, s.is_specialized, s.spec_slot, s.on_bar, s.bar_slot, s.points, s.node_count
         FROM community_build_skills s LEFT JOIN abilities a ON a.ability_id = s.ability_id
        WHERE s.build_profile_id = ? ORDER BY s.is_specialized DESC, coalesce(s.spec_slot, 99), s.on_bar DESC, coalesce(s.bar_slot, 99), s.ord`,
      pid,
    ).map((s) =>
      dropNulls({
        ability_id: s.ability_id,
        name: s.name ?? s.maxroll_key,
        specialized: s.is_specialized === 1,
        spec_slot: s.spec_slot,
        on_bar: s.on_bar === 1,
        bar_slot: s.bar_slot,
        tree_id: s.tree_id,
        points: s.points,
        node_count: s.node_count,
        // trees of non-specialized skills are planner leftovers with no in-game effect: listed only for specialized skills
        nodes: s.is_specialized === 1 && s.tree_id ? nodeList(ctx, skillNodes.filter((n) => n.tree_id === s.tree_id)) : undefined,
        note: s.is_specialized !== 1 && (s.points as number) > 0 ? `not specialized: its ${s.node_count} allocated tree nodes (${s.points} points) are a planner leftover (no effect in game)` : undefined,
      }),
    );
  }
  if (sections.has("notes")) {
    out.notes = dropNulls({
      guide: parseJson<Row>(full.notes_json),
      tab: parseJson<Row>(one(ctx, "SELECT notes_json FROM community_build_profiles WHERE build_profile_id = ?", pid)?.notes_json),
    });
  }
  out.units =
    "affix / implicit values are the rolled in-game values: 'increased' and 'more' are fractions (0.08 = 8%); roll 0..1 within the tier range (1 = max). Affix ranges are scaled by the item's affix effect modifier ((1 + item aem) / (1 + affix standard aem), e.g. x0.67 for a std-0 affix on a Grand Idol, x1.5 on Body Armor): such affixes carry scale_factor and each line stored_value (the unscaled data value)";
  out.source = SOURCE_NOTE;
  return out;
}

// ---------------------------------------------------------------- item_usage

export interface ItemUsageArgs {
  name?: string;
  unique_id?: number | string;
  affix?: string | number;
  slot?: string;
  tab?: string;
  class?: string | number;
  mastery?: string;
  limit?: number;
}

/** Builds after the class / mastery filters, with their tabs. */
function scope(ctx: Ctx, a: { class?: string | number; mastery?: string; ability?: string }) {
  let rows = loadBuilds(ctx);
  if (a.class !== undefined && a.class !== "") {
    const cid = resolveClassArg(ctx, a.class);
    rows = rows.filter((b) => b.class_id === cid);
  }
  if (a.mastery) {
    const m = resolveMasteryArg(ctx, a.mastery);
    rows = rows.filter((b) => (m.mastery_index === 0 ? b.class_id === m.class_id : isMastery(b, m)));
  }
  if (a.ability) {
    const ab = resolveAbilityArg(ctx, a.ability);
    rows = rows.filter((b) => b.main_ability_id === ab.ability_id);
  }
  return rows;
}

function typicalTier(tiers: number[]): number | null {
  if (!tiers.length) return null;
  const c = new Map<number, number>();
  for (const t of tiers) c.set(t, (c.get(t) ?? 0) + 1);
  return [...c.entries()].sort((x, y) => y[1] - x[1] || y[0] - x[0])[0]![0];
}

const tabPref = (t: TabRow) => (t.is_default === 1 ? 0 : 1) * 1000 + t.ord;

export function itemUsage(ctx: Ctx, a: ItemUsageArgs = {}): Row {
  const isAffix = a.affix !== undefined && a.affix !== "";
  const hasItem = (a.name !== undefined && a.name !== "") || (a.unique_id !== undefined && a.unique_id !== "");
  if (isAffix === hasItem) throw new ToolError("Pass exactly one of: name / unique_id (a unique or set item), or affix (affix id or name)");
  const ms = masteries(ctx);
  const tabsBy = loadTabs(ctx);
  const rows = scope(ctx, a);
  const byId = new Map(rows.map((b) => [b.build_id, b]));
  const slots = a.slot ? resolveSlot(a.slot) : undefined;
  // allowed profiles: the selected tab(s) of every in-scope build
  const allowed = new Map<number, TabRow>();
  for (const b of rows) for (const t of pickTabs(tabsBy.get(b.build_id) ?? [], a.tab, "any")) allowed.set(t.build_profile_id, t);
  const lim = Math.max(1, Math.min(a.limit ?? 100, 500));
  const mName = (b: BuildRow) => masteryName(ms, b.class_id, b.mastery_index);

  if (!isAffix) {
    const u = resolveUniqueArg(ctx, (a.unique_id ?? a.name)!);
    const items = all(
      ctx,
      `SELECT i.item_row_id, i.build_profile_id, i.slot, i.unique_id, u.name FROM community_build_items i JOIN uniques u ON u.unique_id = i.unique_id
        WHERE i.unique_id IN ${inList(u.ids.length)} ORDER BY i.item_row_id`,
      ...u.ids,
    ).filter((i) => allowed.has(i.build_profile_id as number) && (!slots || slots.includes(i.slot as string)));
    const extras = affixesFor(ctx, items.map((i) => i.item_row_id as number));
    // one entry per build: its preferred tab (default tab first)
    const perBuild = new Map<number, { item: Row; tab: TabRow; tabs: Set<string> }>();
    for (const i of items) {
      const t = allowed.get(i.build_profile_id as number)!;
      const cur = perBuild.get(t.build_id);
      if (!cur) perBuild.set(t.build_id, { item: i, tab: t, tabs: new Set([t.name ?? ""]) });
      else {
        cur.tabs.add(t.name ?? "");
        if (tabPref(t) < tabPref(cur.tab)) Object.assign(cur, { item: i, tab: t });
      }
    }
    const bySlot: Record<string, number> = {};
    const byMastery: Record<string, number> = {};
    const extraCount = new Map<string, { affix_id: number; name: string; builds: Set<number>; tiers: number[] }>();
    const list: Row[] = [];
    for (const [bid, e] of perBuild) {
      const b = byId.get(bid)!;
      bySlot[e.item.slot as string] = (bySlot[e.item.slot as string] ?? 0) + 1;
      const mn = mName(b) ?? "?";
      byMastery[mn] = (byMastery[mn] ?? 0) + 1;
      const ex = (extras.get(e.item.item_row_id as number) ?? []).map((x) => dropNulls({ affix_id: x.affix_id, name: x.name, display: x.display, tier: x.tier, origin: x.origin }));
      for (const x of ex) {
        const k = String(x.affix_id);
        const c = extraCount.get(k) ?? extraCount.set(k, { affix_id: x.affix_id as number, name: x.name as string, builds: new Set(), tiers: [] }).get(k)!;
        c.builds.add(bid);
        c.tiers.push(x.tier as number);
      }
      list.push(
        dropNulls({
          build_id: bid,
          slug: b.slug,
          title: b.title,
          mastery: mn,
          main_skill: b.main_skill,
          tab: e.tab.name,
          tabs: e.tabs.size > 1 ? [...e.tabs] : undefined,
          slot: e.item.slot,
          name: u.ids.length > 1 ? e.item.name : undefined,
          extra_affixes: ex,
        }),
      );
    }
    return {
      item: dropNulls({ kind: "unique", name: u.name, unique_ids: u.ids, display: u.ids.length === 1 ? uniqueDisplay(ctx, u.ids[0]!) : undefined }),
      total_builds: perBuild.size,
      matched_builds: rows.length,
      by_slot: bySlot,
      by_mastery: byMastery,
      common_extra_affixes: [...extraCount.values()]
        .sort((x, y) => y.builds.size - x.builds.size || x.affix_id - y.affix_id)
        .slice(0, 15)
        .map((c) => {
          const tt = typicalTier(c.tiers);
          return dropNulls({ affix_id: c.affix_id, name: c.name, builds: c.builds.size, typical_tier: tt, ...affixSummary(ctx, c.affix_id, tt ?? undefined) });
        }),
      builds: list.slice(0, lim),
      truncated: list.length > lim,
      source: SOURCE_NOTE,
    };
  }

  const af = resolveAffixArg(ctx, a.affix!);
  const lines = all(
    ctx,
    `SELECT x.item_row_id, x.affix_id, x.tier, x.origin, x.is_prefix, af.name AS affix_name, i.build_profile_id, i.slot, i.kind,
            coalesce(u.name, st.name) AS item_name
       FROM community_build_item_affixes x
       JOIN community_build_items i ON i.item_row_id = x.item_row_id
       LEFT JOIN affixes af ON af.affix_id = x.affix_id
       LEFT JOIN uniques u ON u.unique_id = i.unique_id
       LEFT JOIN item_subtypes st ON st.base_type_id = i.base_type_id AND st.sub_type_id = i.sub_type_id
      WHERE x.affix_id IN ${inList(af.ids.length)} ORDER BY x.item_row_id, x.ord`,
    ...af.ids,
  ).filter((l) => allowed.has(l.build_profile_id as number) && (!slots || slots.includes(l.slot as string)));
  const slotAgg = new Map<string, { builds: Set<number>; items: Set<number>; tiers: number[]; origins: Record<string, number> }>();
  const byMastery = new Map<string, Set<number>>();
  const perBuild = new Map<string, { line: Row; tab: TabRow }>(); // key build:slot
  for (const l of lines) {
    const t = allowed.get(l.build_profile_id as number)!;
    const slot = l.slot as string;
    const s = slotAgg.get(slot) ?? slotAgg.set(slot, { builds: new Set(), items: new Set(), tiers: [], origins: {} }).get(slot)!;
    s.builds.add(t.build_id);
    s.items.add(l.item_row_id as number);
    s.tiers.push(l.tier as number);
    s.origins[l.origin as string] = (s.origins[l.origin as string] ?? 0) + 1;
    const b = byId.get(t.build_id)!;
    const mn = mName(b) ?? "?";
    (byMastery.get(mn) ?? byMastery.set(mn, new Set()).get(mn)!).add(t.build_id);
    const k = `${t.build_id}:${slot}`;
    const cur = perBuild.get(k);
    if (!cur || tabPref(t) < tabPref(cur.tab) || (t === cur.tab && (l.tier as number) > (cur.line.tier as number))) perBuild.set(k, { line: l, tab: t });
  }
  const builds = new Set([...perBuild.values()].map((e) => e.tab.build_id));
  const list = [...perBuild.values()]
    .sort((x, y) => x.tab.build_id - y.tab.build_id || String(x.line.slot).localeCompare(String(y.line.slot)))
    .map(({ line, tab }) => {
      const b = byId.get(tab.build_id)!;
      return dropNulls({
        build_id: b.build_id,
        slug: b.slug,
        title: b.title,
        mastery: mName(b),
        main_skill: b.main_skill,
        tab: tab.name,
        slot: line.slot,
        item: line.item_name,
        item_kind: line.kind,
        affix_id: af.ids.length > 1 ? line.affix_id : undefined,
        tier: line.tier,
        origin: line.origin,
      });
    });
  const types = all(ctx, `SELECT affix_id, affix_type_name AS type, name FROM affixes WHERE affix_id IN ${inList(af.ids.length)} ORDER BY affix_id`, ...af.ids);
  return {
    item: { kind: "affix", name: af.name, affix_ids: af.ids, affixes: types.map((t) => dropNulls({ ...t, ...affixSummary(ctx, t.affix_id as number) })) },
    total_builds: builds.size,
    matched_builds: rows.length,
    by_slot: Object.fromEntries(
      [...slotAgg.entries()]
        .sort((x, y) => y[1].builds.size - x[1].builds.size || x[0].localeCompare(y[0]))
        .map(([slot, s]) => [
          slot,
          { builds: s.builds.size, items: s.items.size, typical_tier: typicalTier(s.tiers), min_tier: Math.min(...s.tiers), max_tier: Math.max(...s.tiers), origins: s.origins },
        ]),
    ),
    by_mastery: Object.fromEntries([...byMastery.entries()].map(([k, v]) => [k, v.size]).sort((x, y) => (y[1] as number) - (x[1] as number))),
    builds: list.slice(0, lim),
    truncated: list.length > lim,
    source: SOURCE_NOTE,
  };
}

// ---------------------------------------------------------------- slot_meta

export interface SlotMetaArgs {
  slot: string;
  class?: string | number;
  mastery?: string;
  ability?: string;
  tab?: string;
  kind?: "unique" | "rare" | "all";
  limit?: number;
}

const UNIQUE_KINDS = new Set(["unique", "legendary", "set"]);

export function slotMeta(ctx: Ctx, a: SlotMetaArgs): Row {
  if (!a?.slot) throw new ToolError("slot is required (weapon, offhand, head, body, waist, hands, feet, neck, ring / finger1 / finger2, relic, altar, idol)");
  const slots = resolveSlot(a.slot);
  const kind = a.kind ?? "all";
  if (!["unique", "rare", "all"].includes(kind)) throw new ToolError(`kind must be unique, rare or all, got '${kind}'`);
  const tabsBy = loadTabs(ctx);
  const rows = scope(ctx, a);
  const tabSpec = a.tab ?? "Endgame";
  const chosen = new Map<number, TabRow>(); // build_profile_id -> tab
  let fellBack = 0;
  for (const b of rows) {
    const tabs = tabsBy.get(b.build_id) ?? [];
    let t = pickTabs(tabs, tabSpec, "default", false);
    if (!t.length && a.tab === undefined) {
      t = pickTabs(tabs, "default", "default");
      if (t.length) fellBack++;
    }
    for (const x of t) chosen.set(x.build_profile_id, x);
  }
  const matched = new Set([...chosen.values()].map((t) => t.build_id));
  const items = all(
    ctx,
    `SELECT i.item_row_id, i.build_profile_id, i.kind, i.unique_id, coalesce(u.name, st.name) AS name, st.name AS base
       FROM community_build_items i
       LEFT JOIN uniques u ON u.unique_id = i.unique_id
       LEFT JOIN item_subtypes st ON st.base_type_id = i.base_type_id AND st.sub_type_id = i.sub_type_id
      WHERE i.slot IN ${inList(slots.length)} ORDER BY i.item_row_id`,
    ...slots,
  ).filter(
    (i) => chosen.has(i.build_profile_id as number) && (kind === "all" || (kind === "unique") === UNIQUE_KINDS.has(i.kind as string)),
  );
  const slugOf = new Map(rows.map((b) => [b.build_id, b.slug]));
  const itemAgg = new Map<string, { name: string; kind: Set<string>; unique_id: number | null; builds: Set<number> }>();
  for (const i of items) {
    const bid = chosen.get(i.build_profile_id as number)!.build_id;
    const isU = i.unique_id !== null;
    const key = isU ? `u${i.unique_id}` : `b${i.name}`;
    const g =
      itemAgg.get(key) ??
      itemAgg.set(key, { name: (i.name as string) ?? "?", kind: new Set(), unique_id: isU ? (i.unique_id as number) : null, builds: new Set() }).get(key)!;
    g.kind.add(i.kind as string);
    g.builds.add(bid);
  }
  const n = matched.size;
  const lim = Math.max(1, Math.min(a.limit ?? 25, 200));
  const itemList = [...itemAgg.values()]
    .sort((x, y) => y.builds.size - x.builds.size || x.name.localeCompare(y.name))
    .slice(0, lim)
    .map((g) =>
      dropNulls({
        name: g.name,
        display: g.unique_id !== null ? uniqueDisplay(ctx, g.unique_id) : undefined,
        kind: [...g.kind].sort().join("|"),
        unique_id: g.unique_id ?? undefined,
        base: g.unique_id === null ? g.name : undefined,
        count: g.builds.size,
        pct: pct(g.builds.size, n),
        example_builds: [...g.builds].slice(0, 3).map((b) => slugOf.get(b)),
      }),
    );
  const affixLines = items.length
    ? all(
        ctx,
        `SELECT x.item_row_id, x.affix_id, x.tier, x.origin, x.is_prefix, af.name FROM community_build_item_affixes x LEFT JOIN affixes af ON af.affix_id = x.affix_id
          WHERE x.item_row_id IN ${inList(items.length)}`,
        ...items.map((i) => i.item_row_id),
      )
    : [];
  const profileOf = new Map(items.map((i) => [i.item_row_id as number, i.build_profile_id as number]));
  const affAgg = new Map<number, { name: string; is_prefix: number | null; builds: Set<number>; tiers: number[]; origins: Set<string> }>();
  for (const l of affixLines) {
    const bid = chosen.get(profileOf.get(l.item_row_id as number)!)!.build_id;
    const id = l.affix_id as number;
    const g =
      affAgg.get(id) ??
      affAgg.set(id, { name: (l.name as string) ?? `affix ${id}`, is_prefix: l.is_prefix as number | null, builds: new Set(), tiers: [], origins: new Set() }).get(id)!;
    g.builds.add(bid);
    g.tiers.push(l.tier as number);
    g.origins.add(l.origin as string);
  }
  const affixList = [...affAgg.entries()]
    .sort((x, y) => y[1].builds.size - x[1].builds.size || x[0] - y[0])
    .slice(0, lim)
    .map(([id, g]) => {
      const tt = typicalTier(g.tiers);
      const info = affixSummary(ctx, id, tt ?? undefined) ?? {};
      return dropNulls({
        affix_id: id,
        affix: g.name,
        count: g.builds.size,
        pct: pct(g.builds.size, n),
        typical_tier: tt,
        type: g.is_prefix === null ? undefined : g.is_prefix ? "prefix" : "suffix",
        origins: [...g.origins].sort(),
        display: info.display,
        line_names: info.line_names,
        class_restriction: info.class_restriction,
        rolls_on: info.rolls_on,
        typical_tier_lines: info.tier_lines,
      });
    });
  return {
    slot: slots.length > 1 ? slots : slots[0],
    tab: tabSpec,
    kind,
    matched_builds: n,
    ...(fellBack ? { tab_fallback_builds: fellBack, tab_note: `${fellBack} build(s) have no tab matching '${tabSpec}' (e.g. leveling guides); their default tab was used` } : {}),
    items: itemList,
    affixes: affixList,
    note: "count = builds (not items); pct = count / matched_builds. Affix origins: normal (rare / idol / altar), extra (on a unique: LP or slam), sealed, corruption.",
    source: SOURCE_NOTE,
  };
}

/**
 * `planner` tool: an LE Tools planner build (share link, id, pasted JSON or a file) -> the build fully named, with every
 * rolled value, resolved against the game tables (docs/planner-import.md).
 *
 * Planner build JSON (LE Tools planner.js serializer, observed for data version152):
 *   bio {level, characterClass (class_id), chosenMastery (mastery_index)}
 *   equipment {<slot>: item}   slots weapon1 weapon2 head chest waist hands feet ring1 ring2 amulet relic idol_altar
 *   idols [{x, y, ...item}]    top-left cell on the altar grid
 *   blessings {<key>: {id, ir}}
 *   charTree {selected: {<node_id>: points}}   class tree (classes.tree_id)
 *   skillTrees [{treeID, selected: {<node_id>: points}, level?, slotNumber?}]
 *   weaverTree {selected} | null
 *   item = {id, affixes: [{id, tier, r}], sealedAffix?, primordialAffix?, corruptedAffix?, ir: [bytes], ur: [bytes], faction?}
 * Ids are LE Tools compact ids (kind letter + lz-string compressToEncodedURIComponent of a decimal string,
 * docs/data-sources/ids.md): A<affix_id>; I'1'<base 3><sub 3><3 digits> for a base item / idol / blessing; U<sub 3><unique 3>
 * for a unique. Tiers are 1-based like affix_tiers.tier. r / ir / ur are roll bytes 0..255: affixes use r, implicits
 * ir[implicit ord], unique mods ur[rollId] (mods sharing a rollId roll together).
 *
 * Rolled value (decompiled, knowledge/mechanics/stat-model.md "Affixes"; D):
 *   a = RHE(lo x f x s), b = RHE(hi x f x s), v = min(floor((b - a + 1) x byte / 255 + a), b) / s
 * f = the affix effect modifier factor of the item (1 for implicits, uniques, blessings), s = the rounding grid
 * (affix_stats.rounding_scale; otherwise INCREASED -> 100, ADDED -> 1 when the property rounds added values to integers
 * else 100, MORE -> stat_properties.rounding_for_more).
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { all, one, ToolError, type Ctx, type Row } from "./context.js";
import { affixScaleFactor } from "./builds.js";
import { blessingDisplay, fillPlaceholders, nodeDisplay, statLine, uniqueDisplay } from "./display.js";
import { dropNulls } from "./get.js";
import { fetchPlanner, parsePlannerRef, type PlannerFetch } from "./planner-fetch.js";

const LZ = createRequire(import.meta.url)("lz-string") as typeof import("lz-string");

const MODIFIER = ["added", "increased", "more"];
const round = (v: number, d = 4) => Math.round(v * 10 ** d) / 10 ** d;

// ---------------------------------------------------------------- ids and rolls

export interface PlannerId {
  kind: "A" | "U" | "I";
  value: string;
  affix_id?: number;
  unique_id?: number;
  base_type_id?: number;
  sub_type_id?: number;
}

/** Decode a planner compact id; null when it is not one. */
export function decodePlannerId(id: unknown): PlannerId | null {
  if (typeof id !== "string" || id.length < 2) return null;
  const kind = id[0];
  if (kind !== "A" && kind !== "U" && kind !== "I") return null;
  const value = LZ.decompressFromEncodedURIComponent(id.slice(1));
  if (!value || !/^\d+$/.test(value)) return null;
  if (kind === "A") return { kind, value, affix_id: Number(value) };
  if (kind === "U") {
    if (value.length < 4) return { kind, value, unique_id: Number(value) };
    return { kind, value, unique_id: Number(value.slice(-3)), sub_type_id: Number(value.slice(0, -3)) };
  }
  if (value.length !== 10 || value[0] !== "1") return null;
  return { kind, value, base_type_id: Number(value.slice(1, 4)), sub_type_id: Number(value.slice(4, 7)) };
}

/** Round half to even (the game's RoundHalfEven). */
export function rhe(x: number): number {
  return Math.abs(x - Math.trunc(x)) === 0.5 ? 2 * Math.round(x / 2) : Math.round(x);
}

/** Rolled value of a range [lo, hi] for a roll byte 0..255 on the grid 1/scale, range scaled by factor (D). */
export function rollValue(lo: number, hi: number, scale: number, byte: number, factor = 1): number {
  const s = scale > 0 ? scale : 100;
  let a = rhe(lo * factor * s);
  let b = rhe(hi * factor * s);
  if (a > b) [a, b] = [b, a];
  const r = Math.max(0, Math.min(255, Math.round(byte)));
  return Math.min(Math.floor(((b - a + 1) * r) / 255 + a), b) / s;
}

const GRID = [100, 1, 10, 1000]; // PropertyRounding: Hundredth, Integer, Tenth, Thousandth

// ---------------------------------------------------------------- lookups (cached per ctx)

interface Rounding {
  int: boolean;
  more: number | null;
}
interface Lookups {
  props: Map<number, Rounding>;
  /** SP 98 player properties by index, SP 58 ability properties by 'ability_index:prop_index', SP 130 altar properties by index. */
  indirect: Map<string, Rounding>;
  meta: Map<string, string>;
}
const cache = new WeakMap<Ctx, Lookups>();
function lookups(ctx: Ctx): Lookups {
  let L = cache.get(ctx);
  if (L) return L;
  L = {
    props: new Map(
      all(ctx, "SELECT property, round_added_to_int, rounding_for_more FROM stat_properties").map((r) => [
        r.property as number,
        { int: r.round_added_to_int === 1, more: (r.rounding_for_more as number | null) ?? null },
      ]),
    ),
    indirect: new Map(),
    meta: new Map(all(ctx, "SELECT key, value FROM meta").map((r) => [r.key as string, r.value as string])),
  };
  const rd = (r: Row): Rounding => ({ int: r.round_added_to_int === 1, more: (r.rounding_for_more as number | null | undefined) ?? null });
  for (const r of all(ctx, "SELECT idx, round_added_to_int, rounding_for_more FROM player_properties")) L.indirect.set(`98:${r.idx}`, rd(r));
  for (const r of all(ctx, "SELECT ability_index, prop_index, round_added_to_int, rounding_for_more FROM ability_properties")) L.indirect.set(`58:${r.ability_index}:${r.prop_index}`, rd(r));
  for (const r of all(ctx, "SELECT idx, round_added_to_int FROM idol_altar_properties")) L.indirect.set(`130:${r.idx}`, rd(r));
  cache.set(ctx, L);
  return L;
}

/** Rounding grid of a non-affix stat line (implicit, unique mod, blessing). */
function propScale(ctx: Ctx, m: Row): number {
  if (m.modifier_type === 1) return 100;
  const L = lookups(ctx);
  const prop = m.property as number;
  // indirect properties carry their own rounding (PropertyInfo of the list entry the line points at)
  const p =
    prop === 98 || prop === 130
      ? L.indirect.get(`${prop}:${m.tags}`)
      : prop === 58
        ? L.indirect.get(`58:${m.tags}:${m.special_tag}`)
        : L.props.get(prop);
  if (m.modifier_type === 2) return GRID[p?.more ?? 0] ?? 100;
  return p?.int ? 1 : 100;
}

/** A stat line with its rolled value, worded as the tooltip words it. */
function rolledLine(ctx: Ctx, m: Row, value: number, extra: Row = {}): Row {
  return dropNulls({
    line: statLine(ctx, { ...m, value_min: value, value_max: value }),
    value,
    range: (m.value_max as number | null) !== null && m.value_max !== m.value_min ? [m.value_min, m.value_max] : undefined,
    modifier: m.modifier_type === null || m.modifier_type === undefined ? undefined : MODIFIER[m.modifier_type as number],
    ...extra,
  });
}

const byte = (bytes: unknown, i: number | undefined): number | undefined => {
  if (!Array.isArray(bytes) || i === undefined) return undefined;
  const b = bytes[i];
  return typeof b === "number" ? b : undefined;
};

// ---------------------------------------------------------------- items

const SLOT_ORDER = ["weapon1", "weapon2", "head", "chest", "waist", "hands", "feet", "amulet", "ring1", "ring2", "relic", "idol_altar"];
/** Planner slot -> the slot names of the community-build tools. */
const SLOT_NAME: Record<string, string> = {
  weapon1: "weapon",
  weapon2: "offhand",
  head: "head",
  chest: "body",
  waist: "waist",
  hands: "hands",
  feet: "feet",
  amulet: "neck",
  ring1: "finger1",
  ring2: "finger2",
  relic: "relic",
  idol_altar: "altar",
};

interface Warn {
  (kind: string, message: string): void;
}

interface RawAffix {
  id?: unknown;
  tier?: unknown;
  r?: unknown;
}
interface RawItem {
  id?: unknown;
  affixes?: RawAffix[];
  sealedAffix?: RawAffix;
  primordialAffix?: RawAffix;
  corruptedAffix?: RawAffix;
  ir?: number[];
  ur?: number[];
  faction?: unknown;
  x?: number;
  y?: number;
}

interface ItemBase {
  base_type_id: number;
  sub_type_id: number;
  base: string | null;
  base_type: string | null;
  is_idol: boolean;
  size: string | undefined;
  aem: number;
  class_requirement: number | null;
  class_requirement_names: string | null;
  level_requirement: number | null;
}

function itemBase(ctx: Ctx, base: number, sub: number): ItemBase | undefined {
  const r = one(
    ctx,
    `SELECT st.name, bt.name AS base_type, bt.is_idol, bt.size_x, bt.size_y, coalesce(st.affix_effect_modifier, bt.affix_effect_modifier, 0) AS aem,
            st.class_requirement, st.class_requirement_names, st.level_requirement
       FROM item_subtypes st JOIN item_base_types bt ON bt.base_type_id = st.base_type_id
      WHERE st.base_type_id = ? AND st.sub_type_id = ?`,
    base,
    sub,
  );
  if (!r) return undefined;
  return {
    base_type_id: base,
    sub_type_id: sub,
    base: r.name as string | null,
    base_type: r.base_type as string | null,
    is_idol: r.is_idol === 1,
    size: r.is_idol === 1 && r.size_x ? `${r.size_x}x${r.size_y}` : undefined,
    aem: (r.aem as number) ?? 0,
    class_requirement: r.class_requirement as number | null,
    class_requirement_names: (r.class_requirement_names as string | null) || null,
    level_requirement: r.level_requirement as number | null,
  };
}

/** Implicit (or blessing) lines of a sub type, rolled with the ir bytes. */
function implicitLines(ctx: Ctx, kind: "implicit" | "blessing" | "idol_altar", key: string, ir: unknown): Row[] {
  const rows = all(
    ctx,
    `SELECT source_ord, property, property_name, special_tag, tags, tag_names, modifier_type, value_min, value_max, label, hidden
       FROM mods WHERE source_kind = ? AND source_id = ? ORDER BY source_ord, sub_ord`,
    kind,
    key,
  );
  return rows.map((m) => {
    const b = byte(ir, m.source_ord as number);
    const lo = m.value_min as number;
    const hi = (m.value_max as number | null) ?? lo;
    const v = hi !== lo && b !== undefined ? rollValue(lo, hi, propScale(ctx, m), b) : lo;
    return rolledLine(ctx, m, v, { roll: hi !== lo ? b : undefined });
  });
}

/** Unique mods rolled with the ur bytes (by rollId; only mods with canRoll and a range roll). */
function uniqueLines(ctx: Ctx, uniqueId: number, ur: unknown): { mods: Row[]; effects: string[] } {
  const raw = one(ctx, "SELECT raw_json FROM uniques WHERE unique_id = ?", uniqueId)?.raw_json;
  let rawMods: { canRoll?: number; rollId?: number }[] = [];
  try {
    rawMods = (JSON.parse(String(raw)).mods ?? []) as typeof rawMods;
  } catch {
    rawMods = [];
  }
  const rows = all(
    ctx,
    `SELECT source_ord, sub_ord, property, property_name, special_tag, tags, tag_names, modifier_type, value_min, value_max, label, hidden
       FROM mods WHERE source_kind = 'unique_mod' AND source_id = ? ORDER BY source_ord, sub_ord`,
    String(uniqueId),
  );
  const byOrd = new Map<number, string[]>();
  const mods = rows.map((m) => {
    const rm = rawMods[m.source_ord as number];
    const lo = m.value_min as number;
    const hi = (m.value_max as number | null) ?? lo;
    const b = rm?.canRoll ? byte(ur, rm.rollId ?? 0) : undefined;
    const v = rm?.canRoll && hi > lo && b !== undefined ? rollValue(lo, hi, propScale(ctx, m), b) : lo;
    const line = rolledLine(ctx, m, v, { roll: rm?.canRoll && hi > lo ? b : undefined, hidden: m.hidden ? true : undefined });
    if (!m.hidden && typeof line.line === "string") {
      const k = m.source_ord as number;
      (byOrd.get(k) ?? byOrd.set(k, []).get(k)!).push(line.line);
    }
    return line;
  });
  // tooltip order: rolled stat lines for mod entries, the tooltip text (ranges) for special effects
  const tips = new Map(all(ctx, "SELECT ord, text FROM unique_tooltips WHERE unique_id = ?", uniqueId).map((t) => [t.ord as number, t.text as string | null]));
  let effects = all(ctx, "SELECT ref_kind, ref_index FROM unique_tooltip_entries WHERE unique_id = ? ORDER BY ord", uniqueId)
    .map((e) => (e.ref_kind === "mod" ? (byOrd.get(e.ref_index as number) ?? []).join("; ") : fillPlaceholders(tips.get(e.ref_index as number) ?? "")))
    .filter(Boolean);
  if (!effects.length) effects = [...[...byOrd.values()].map((l) => l.join("; ")), ...[...tips.values()].map((t) => fillPlaceholders(t ?? ""))].filter(Boolean);
  return { mods, effects };
}

/** One affix line: name, tier, prefix/suffix, origin, roll byte and the rolled stat values on this item. */
function affixLine(ctx: Ctx, a: RawAffix, origin: string, base: ItemBase | undefined, classId: number | null, warn: Warn, where: string): Row | null {
  const id = decodePlannerId(a?.id);
  const tier = typeof a?.tier === "number" ? a.tier : Number(a?.tier);
  if (!id?.affix_id && id?.affix_id !== 0) {
    warn("unresolved", `${where}: undecodable affix id ${JSON.stringify(a?.id)}`);
    return null;
  }
  const af = one(ctx, "SELECT affix_id, name, affix_type_name, class_specificity, class_names, standard_affix_effect_modifier AS std FROM affixes WHERE affix_id = ?", id.affix_id);
  if (!af) {
    warn("unresolved", `${where}: unknown affix ${id.affix_id}`);
    return { affix_id: id.affix_id, tier, origin, unresolved: true };
  }
  const rows = all(
    ctx,
    `SELECT m.source_ord, m.property, m.property_name, m.special_tag, m.tags, m.tag_names, m.modifier_type, m.value_min, m.value_max, m.label, s.rounding_scale
       FROM mods m LEFT JOIN affix_stats s ON s.affix_id = ? AND s.ord = m.source_ord
      WHERE m.source_kind = 'affix_tier' AND m.source_id = ? AND m.tier = ? ORDER BY m.source_ord, m.sub_ord`,
    id.affix_id,
    String(id.affix_id),
    tier,
  );
  if (!rows.length) warn("unresolved", `${where}: ${af.name} has no tier ${tier}`);
  const factor = affixScaleFactor(base?.aem, af.std as number | null);
  const b = typeof a.r === "number" ? a.r : undefined;
  const values = rows.map((m) => {
    const lo = m.value_min as number;
    const hi = (m.value_max as number | null) ?? lo;
    const v = rollValue(lo, hi, (m.rounding_scale as number | null) ?? propScale(ctx, m), b ?? 255, factor);
    return rolledLine(ctx, m, v, { range: undefined, tier_range: factor === 1 ? [lo, hi] : [round(lo * factor), round(hi * factor)] });
  });
  // class_specificity: bit 1 << (class_id + 1) per class; bit 0 marks Weaver idol affixes (docs/data-sources/enums.md)
  const classBits = ((af.class_specificity as number | null) ?? 0) & ~1;
  const restricted = classBits !== 0 && classId !== null && (classBits & (1 << (classId + 1))) === 0;
  const classes = restricted ? String(af.class_names ?? "").split(",").filter((c) => c !== "Weaver").join(", ") : "";
  if (restricted) warn("class_affix", `${where}: ${af.name} is a ${classes} class affix: this class cannot craft it (the item can still come from another class's drop or trade; a hand-typed planner may hold an item that does not exist)`);
  return dropNulls({
    affix_id: id.affix_id,
    name: af.name,
    display: values.length ? `${values.map((v) => v.line).filter(Boolean).join("; ")} (T${tier})` : undefined,
    tier,
    type: af.affix_type_name ? String(af.affix_type_name).toLowerCase() : undefined,
    origin,
    roll: b,
    roll_assumed_max: b === undefined ? true : undefined,
    scale_factor: factor !== 1 ? round(factor) : undefined,
    class_restriction: af.class_names ?? undefined,
    not_for_build_class: restricted ? true : undefined,
    values,
  });
}

function decodeItem(ctx: Ctx, it: RawItem, slot: string | null, classId: number | null, warn: Warn): Row | null {
  const where = slot ?? `idol (${it.x},${it.y})`;
  const id = decodePlannerId(it?.id);
  if (!id || id.kind === "A") {
    warn("unresolved", `${where}: undecodable item id ${JSON.stringify(it?.id)}`);
    return null;
  }
  let uniqueId: number | undefined;
  let u: Row | undefined;
  let base: ItemBase | undefined;
  if (id.kind === "U") {
    uniqueId = id.unique_id!;
    u = one(ctx, "SELECT unique_id, name, base_type_id, sub_type_id, is_set_item, set_id, weavers_will, legendary_type FROM uniques WHERE unique_id = ?", uniqueId);
    if (!u) {
      warn("unresolved", `${where}: unknown unique ${uniqueId}`);
      return { slot: slot ? SLOT_NAME[slot] ?? slot : undefined, unique_id: uniqueId, unresolved: true };
    }
    // the U id's leading digits are the sub type (checked against the unique's sub types)
    const subs = all(ctx, "SELECT sub_type_id FROM unique_subtypes WHERE unique_id = ?", uniqueId).map((r) => r.sub_type_id as number);
    const sub = id.sub_type_id !== undefined && subs.includes(id.sub_type_id) ? id.sub_type_id : (u.sub_type_id as number);
    base = itemBase(ctx, u.base_type_id as number, sub);
  } else {
    base = itemBase(ctx, id.base_type_id!, id.sub_type_id!);
    if (!base) warn("unresolved", `${where}: unknown base item ${id.base_type_id}:${id.sub_type_id}`);
  }
  if (base && classId !== null && base.class_requirement && (base.class_requirement & (1 << classId)) === 0) {
    warn("class_item", `${where}: ${base.base} requires ${base.class_requirement_names}`);
  }
  const isUnique = uniqueId !== undefined;
  const extraOrigin = !isUnique ? "normal" : u?.weavers_will === 1 ? "weavers_will" : "legendary_potential";
  const lines: Row[] = [];
  for (const a of it.affixes ?? []) {
    const l = affixLine(ctx, a, extraOrigin, base, classId, warn, where);
    if (l) lines.push(l);
  }
  for (const [k, origin] of [
    ["sealedAffix", "sealed"],
    ["primordialAffix", "primordial"],
    ["corruptedAffix", "corruption"],
  ] as const) {
    const a = it[k];
    if (a && typeof a === "object") {
      const l = affixLine(ctx, a, origin, base, classId, warn, where);
      if (l) lines.push(l);
    }
  }
  const implicits = base ? implicitLines(ctx, base.base_type_id === 41 ? "idol_altar" : "implicit", `${base.base_type_id}:${base.sub_type_id}`, it.ir) : [];
  const uniq = isUnique ? uniqueLines(ctx, uniqueId!, it.ur) : undefined;
  let kind: string;
  if (isUnique) kind = u!.is_set_item === 1 ? "set" : u!.weavers_will === 1 ? "weavers_will" : (it.affixes ?? []).length ? "legendary" : "unique";
  else if (base?.is_idol) kind = "idol";
  else if (base?.base_type_id === 41) kind = "altar";
  else if (lines.some((l) => l.origin !== "corruption" && (l.tier as number) >= 6)) kind = "exalted";
  else {
    const n = (it.affixes ?? []).length;
    kind = n >= 3 ? "rare" : n >= 1 ? "magic" : "normal";
  }
  return dropNulls({
    slot: slot ? SLOT_NAME[slot] ?? slot : undefined,
    name: (u?.name as string | undefined) ?? base?.base ?? undefined,
    display: isUnique ? uniqueDisplay(ctx, uniqueId!) : base?.base ? `${kind} ${base.base}` : undefined,
    kind,
    unique_id: uniqueId,
    base: base?.base,
    base_type: base?.base_type,
    base_type_id: base?.base_type_id,
    sub_type_id: base?.sub_type_id,
    size: base?.size,
    grid_x: typeof it.x === "number" ? it.x : undefined,
    grid_y: typeof it.y === "number" ? it.y : undefined,
    corrupted: it.corruptedAffix ? true : undefined,
    faction: it.faction ?? undefined,
    implicits: implicits.length ? implicits : undefined,
    effects: uniq?.effects.length ? uniq.effects : undefined,
    unique_mods: uniq?.mods.length ? uniq.mods : undefined,
    affixes: lines,
  });
}

// ---------------------------------------------------------------- trees

interface NodeRow extends Row {
  node_id: number;
  name: string | null;
  max_points: number | null;
  mastery: number | null;
}

function selectedNodes(ctx: Ctx, treeId: string, selected: unknown, warn: Warn, where: string): (NodeRow & { points: number })[] {
  if (!selected || typeof selected !== "object") return [];
  const nodes = new Map(
    all(ctx, "SELECT node_id, name, max_points, mastery FROM tree_nodes WHERE tree_id = ?", treeId).map((n) => [n.node_id as number, n as NodeRow]),
  );
  const out: (NodeRow & { points: number })[] = [];
  for (const [k, v] of Object.entries(selected as Record<string, unknown>)) {
    const pts = Number(v);
    if (!pts) continue;
    const n = nodes.get(Number(k));
    if (!n) {
      warn("unresolved", `${where}: unknown node ${treeId}:${k} (${pts} points)`);
      out.push({ node_id: Number(k), name: null, max_points: null, mastery: null, points: pts });
      continue;
    }
    if (n.max_points !== null && pts > n.max_points) warn("over_max", `${where}: ${n.name} has ${pts} points (max ${n.max_points})`);
    out.push({ ...n, points: pts });
  }
  return out;
}

const nodeOut = (ctx: Ctx, treeId: string, n: NodeRow & { points: number }) =>
  dropNulls({ node_id: n.node_id, name: n.name ?? `node ${n.node_id}`, display: nodeDisplay(ctx, treeId, n.node_id), points: n.points, max_points: n.max_points });

// ---------------------------------------------------------------- decode

export const PLANNER_SECTIONS = ["gear", "idols", "blessings", "passives", "skills", "weaver"] as const;

export interface PlannerSource {
  id?: string;
  url?: string;
  title?: string;
  data_version?: string;
  fetched_at?: string;
  from?: string;
  cache_path?: string;
  file?: string;
}

/** Unwrap {data: build} (the planner_data response or a cache file) to the build JSON. */
export function unwrapPlannerJson(v: unknown): { data: Record<string, unknown>; meta: PlannerSource } {
  let o = v;
  if (typeof o === "string") {
    try {
      o = JSON.parse(o);
    } catch (e) {
      throw new ToolError(`json is not valid JSON: ${(e as Error).message}`);
    }
  }
  if (!o || typeof o !== "object" || Array.isArray(o)) throw new ToolError("planner JSON must be an object");
  const r = o as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && !r.bio) {
    const meta: PlannerSource = {};
    for (const k of ["id", "url", "title", "data_version", "fetched_at"] as const) if (typeof r[k] === "string") meta[k] = r[k] as string;
    return { data: r.data as Record<string, unknown>, meta };
  }
  return { data: r, meta: {} };
}

export function decodePlanner(ctx: Ctx, data: Record<string, unknown>, source: PlannerSource = {}, sectionsArg?: string[]): Row {
  if (!data.bio || typeof data.bio !== "object") throw new ToolError("Not an LE Tools planner build: no bio {level, characterClass, chosenMastery}");
  const sections = new Set<string>(sectionsArg?.length ? sectionsArg : PLANNER_SECTIONS);
  const bad = [...sections].filter((s) => !(PLANNER_SECTIONS as readonly string[]).includes(s));
  if (bad.length) throw new ToolError(`Unknown section(s) ${bad.join(", ")}. Valid: ${PLANNER_SECTIONS.join(", ")}`);
  const warnings: Row[] = [];
  const warn: Warn = (kind, message) => warnings.push({ kind, message });

  const bio = data.bio as { level?: number; characterClass?: number; chosenMastery?: number };
  const classId = typeof bio.characterClass === "number" ? bio.characterClass : null;
  const cls = classId !== null ? one(ctx, "SELECT class_id, name, tree_id FROM classes WHERE class_id = ?", classId) : undefined;
  if (classId !== null && !cls) warn("unresolved", `unknown class ${classId}`);
  const masteryIndex = typeof bio.chosenMastery === "number" ? bio.chosenMastery : 0;
  const masteryNames = new Map(
    all(ctx, "SELECT mastery_index, name FROM masteries WHERE class_id = ?", classId).map((r) => [r.mastery_index as number, r.name as string]),
  );
  const mastery = masteryNames.get(masteryIndex);

  // data version: the planner page's LE Tools data vs the database
  const dbFolder = lookups(ctx).meta.get("data_version_folder");
  if (source.data_version && dbFolder && source.data_version !== dbFolder) {
    warn("data_version", `planner page uses LE Tools data ${source.data_version}, the database is ${dbFolder} (${lookups(ctx).meta.get("data_version")}): ids may have moved; rebuild with yarn fetch && yarn db:build`);
  }

  const out: Row = {};
  const equipment = (data.equipment ?? {}) as Record<string, RawItem>;
  const slotKeys = Object.keys(equipment).sort((a, b) => {
    const ia = SLOT_ORDER.indexOf(a);
    const ib = SLOT_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || (a < b ? -1 : a > b ? 1 : 0);
  });
  const gear = slotKeys.map((s) => (equipment[s] ? decodeItem(ctx, equipment[s]!, s, classId, warn) : null)).filter((x): x is Row => !!x);
  const idolsRaw = Array.isArray(data.idols) ? (data.idols as RawItem[]) : [];
  const idols = idolsRaw
    .map((i) => decodeItem(ctx, i, null, classId, warn))
    .filter((x): x is Row => !!x)
    .sort((a, b) => ((a.grid_y as number) ?? 0) - ((b.grid_y as number) ?? 0) || ((a.grid_x as number) ?? 0) - ((b.grid_x as number) ?? 0));

  // blessings
  const blessings: Row[] = [];
  for (const [key, b] of Object.entries((data.blessings ?? {}) as Record<string, { id?: unknown; ir?: number[] }>)) {
    if (!b) continue;
    const id = decodePlannerId(b.id);
    if (!id || id.kind !== "I" || id.base_type_id !== 34) {
      warn("unresolved", `blessing slot ${key}: undecodable id ${JSON.stringify(b.id)}`);
      continue;
    }
    const bl = one(ctx, "SELECT b.sub_type_id, b.name, b.is_grand, t.timeline_id, t.name AS timeline FROM blessings b LEFT JOIN timelines t ON t.timeline_id = b.timeline_id WHERE b.sub_type_id = ?", id.sub_type_id);
    if (!bl) warn("unresolved", `blessing slot ${key}: unknown blessing ${id.sub_type_id}`);
    const values = implicitLines(ctx, "blessing", `34:${id.sub_type_id}`, b.ir);
    blessings.push(
      dropNulls({
        timeline_id: bl?.timeline_id,
        timeline: bl?.timeline,
        blessing_id: id.sub_type_id,
        name: bl?.name,
        display: bl ? blessingDisplay(ctx, id.sub_type_id!) : undefined,
        is_grand: bl ? bl.is_grand === 1 : undefined,
        lines: values.map((v) => v.line).filter(Boolean),
        values,
      }),
    );
  }
  blessings.sort((a, b) => ((a.timeline_id as number) ?? 99) - ((b.timeline_id as number) ?? 99));

  // passives grouped by mastery (0 = base class)
  const treeId = (cls?.tree_id as string | undefined) ?? null;
  const charTree = (data.charTree ?? {}) as { selected?: unknown };
  const passiveNodes = treeId ? selectedNodes(ctx, treeId, charTree.selected, warn, "passives") : [];
  const groups = new Map<number, { mastery_index: number; mastery: string; points: number; nodes: Row[] }>();
  for (const n of passiveNodes) {
    const m = n.mastery ?? -1;
    const g = groups.get(m) ?? groups.set(m, { mastery_index: m, mastery: masteryNames.get(m) ?? `mastery ${m}`, points: 0, nodes: [] }).get(m)!;
    g.points += n.points;
    g.nodes.push(nodeOut(ctx, treeId!, n));
  }
  const passives = [...groups.values()].sort((a, b) => a.mastery_index - b.mastery_index);
  const passivePoints = passiveNodes.reduce((s, n) => s + n.points, 0);
  for (const g of passives) {
    if (g.mastery_index > 0 && g.mastery_index !== masteryIndex && g.points > 20) warn("mastery_points", `${g.points} points in ${g.mastery}, which is not the chosen mastery (an unchosen mastery tree is capped at 20 points, X)`);
  }

  // skills
  const skillsRaw = Array.isArray(data.skillTrees) ? (data.skillTrees as { treeID?: string; selected?: unknown; level?: number; slotNumber?: number }[]) : [];
  const skills = skillsRaw.map((s, i) => {
    const t = s.treeID ? one(ctx, "SELECT t.tree_id, t.ability_id, a.name FROM trees t LEFT JOIN abilities a ON a.ability_id = t.ability_id WHERE t.tree_id = ?", s.treeID) : undefined;
    if (!t) warn("unresolved", `skill slot ${i}: unknown skill tree ${JSON.stringify(s.treeID)}`);
    const nodes = t ? selectedNodes(ctx, t.tree_id as string, s.selected, warn, `${t.name ?? t.tree_id} tree`) : [];
    return dropNulls({
      slot: typeof s.slotNumber === "number" ? s.slotNumber : i,
      ability_id: t?.ability_id,
      name: t?.name ?? s.treeID,
      tree_id: s.treeID,
      level: s.level,
      points: nodes.reduce((n, x) => n + x.points, 0),
      nodes: nodes.map((n) => nodeOut(ctx, s.treeID!, n)),
    });
  });
  if (skills.length > 5) warn("skills", `${skills.length} specialized skill trees (the game allows 5)`);

  const weaverSel = (data.weaverTree as { selected?: unknown } | null)?.selected;
  const weaverNodes = weaverSel ? selectedNodes(ctx, "weaver", weaverSel, warn, "Weaver tree") : [];

  const uniquesWorn = [...gear, ...idols].filter((g) => g.unique_id !== undefined).map((g) => g.name as string);
  out.character = dropNulls({
    class: cls?.name,
    class_id: classId,
    mastery,
    mastery_index: masteryIndex,
    level: bio.level,
    passive_points: passivePoints,
    skill_points: skills.reduce((n, s) => n + ((s.points as number) ?? 0), 0),
    skills: skills.map((s) => s.name),
    uniques: uniquesWorn,
    summary: `${mastery ?? cls?.name ?? "?"} level ${bio.level ?? "?"}; skills: ${skills.map((s) => s.name).join(", ") || "none"}; uniques: ${uniquesWorn.join(", ") || "none"}`,
  });
  if (sections.has("gear")) out.gear = gear;
  if (sections.has("idols")) out.idols = idols;
  if (sections.has("blessings")) out.blessings = blessings;
  if (sections.has("passives")) out.passives = passives;
  if (sections.has("skills")) out.skills = skills;
  if (sections.has("weaver")) out.weaver = weaverNodes.map((n) => nodeOut(ctx, "weaver", n));
  out.warnings = warnings;
  out.units =
    "Values are rolled in-game values from the planner's roll bytes (0..255; roll_assumed_max when the planner stored none): 'increased' / 'more' and percent stats are fractions (0.08 = 8%), line is the tooltip wording. Affix ranges are scaled by the item's affix effect modifier (scale_factor; tier_range is the scaled tier range). Rolled values follow the decompiled roll formula (D); unique special-effect text (effects without a stat line) shows the range, not the roll. Origins: normal (rare / idol), legendary_potential or weavers_will (affixes on a unique), sealed, primordial, corruption.";
  out.source = "LE Tools planner build: planner state typed or imported by its author (planner.from_save_file 2 = imported from a game save, which LE Tools marks verified), resolved against the game tables of this database.";
  return out;
}

// ---------------------------------------------------------------- tool

export interface PlannerArgs {
  url?: string;
  json?: unknown;
  file?: string;
  refresh?: boolean;
  sections?: string[];
}

export async function planner(ctx: Ctx, a: PlannerArgs = {}): Promise<Row> {
  const given = [a.url, a.json, a.file].filter((x) => x !== undefined && x !== null && x !== "").length;
  if (given !== 1) throw new ToolError("Pass exactly one of: url (an LE Tools planner link or build id), json (the planner build JSON), file (a path to it)");
  let data: Record<string, unknown>;
  let src: PlannerSource;
  if (a.url) {
    const ref = parsePlannerRef(a.url);
    const f: PlannerFetch = await fetchPlanner(ref, { refresh: a.refresh });
    data = f.data;
    src = { id: f.id, url: f.url, title: f.title, data_version: f.data_version, fetched_at: f.fetched_at, from: f.from, cache_path: f.cache_path };
  } else if (a.file) {
    let text: string;
    try {
      text = readFileSync(a.file, "utf8");
    } catch (e) {
      throw new ToolError(`Cannot read ${a.file}: ${(e as Error).message}`);
    }
    const u = unwrapPlannerJson(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
    data = u.data;
    src = { ...u.meta, from: "file", file: a.file };
  } else {
    const u = unwrapPlannerJson(a.json);
    data = u.data;
    src = { ...u.meta, from: "json" };
  }
  const res = decodePlanner(ctx, data, src, a.sections);
  return { planner: dropNulls({ ...src, from_save_file: typeof data.fromSaveFile === "number" ? data.fromSaveFile : undefined }), ...res };
}

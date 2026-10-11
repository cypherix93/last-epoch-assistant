/**
 * In-game display names for tool replies, so a caller can quote what the player sees in the game UI
 * instead of internal ids (`mg-1:88` -> "Circle of Elements (Runemaster passive)", uid 307 -> "Crest of Unity
 * (unique helmet)", affix 392 at T7 -> "+116-140% Chance to Shock on Lightning Hit").
 *
 * Every helper is additive: it reads the database through small per-connection caches and returns strings or
 * undefined; it never changes an existing field.
 *
 * Stat lines are rebuilt from the game's own pieces (the affix line label `affix_stats.label` / `mods.label`,
 * the stat property display flags, ailment names for ailment-keyed properties, the ConditionalDamageProperty
 * descriptions for SP 117 / 131-133, the resolved names of indirect properties). The database holds no rendered
 * tooltip string, so capitalisation and a few special lines can differ from the screen.
 */
import { all, type Ctx, type Row } from "./context.js";

interface NodeInfo {
  name: string;
  mastery: number | null;
  max_points: number | null;
}
interface TreeInfo {
  kind: string;
  name: string | null;
  class_id: number | null;
}
interface UniqueInfo {
  name: string;
  base_type: string | null;
  sub_type: string | null;
  is_set: boolean;
  class_requirement: string | null;
}
interface AffixInfo {
  name: string;
  type: string | null;
  class_names: string | null;
  slots: string[];
  labels: string[];
  special_affix_type: number | null;
}
interface Caches {
  trees: Map<string, TreeInfo>;
  masteries: Map<string, string>;
  nodes: Map<string, NodeInfo>;
  conditions: Map<number, { damage: string | null; nonDamage: string | null }>;
  ailments: Map<number, string>;
  props: Map<number, { pct: boolean; noPlus: boolean; includesModifier: boolean; name: string | null }>;
  pp: Map<number, boolean>;
  ap: Map<string, boolean>;
  altar: Map<number, boolean>;
  abilityByIndex: Map<number, { ability_id: string; name: string | null }>;
  uniques?: Map<number, UniqueInfo>;
  affixes?: Map<number, AffixInfo>;
  blessings?: Map<number, { name: string; timeline: string | null }>;
  sets?: Map<number, string>;
  subtypes?: Map<string, string>;
}

const caches = new WeakMap<Ctx, Caches>();

function safeAll(ctx: Ctx, sql: string): Row[] {
  try {
    return all(ctx, sql);
  } catch {
    return []; // older database without the table / column
  }
}

function core(ctx: Ctx): Caches {
  let c = caches.get(ctx);
  if (c) return c;
  c = {
    trees: new Map(
      safeAll(ctx, "SELECT tree_id, tree_kind, name, class_id FROM trees").map((r) => [
        r.tree_id as string,
        { kind: r.tree_kind as string, name: r.name as string | null, class_id: r.class_id as number | null },
      ]),
    ),
    masteries: new Map(safeAll(ctx, "SELECT class_id, mastery_index, name FROM masteries").map((r) => [`${r.class_id}:${r.mastery_index}`, r.name as string])),
    nodes: new Map(
      safeAll(ctx, "SELECT tree_id, node_id, name, mastery, max_points FROM tree_nodes").map((r) => [
        `${r.tree_id}:${r.node_id}`,
        { name: r.name as string, mastery: r.mastery as number | null, max_points: r.max_points as number | null },
      ]),
    ),
    conditions: new Map(
      safeAll(ctx, "SELECT idx, damage_description, non_damage_description FROM conditional_properties").map((r) => [
        r.idx as number,
        { damage: r.damage_description as string | null, nonDamage: r.non_damage_description as string | null },
      ]),
    ),
    ailments: new Map(safeAll(ctx, "SELECT ailment_id, name FROM ailments").map((r) => [r.ailment_id as number, r.name as string])),
    props: new Map(
      safeAll(ctx, "SELECT property, name, display_added_as_percentage, dont_display_plus, name_includes_modifier FROM stat_properties").map((r) => [
        r.property as number,
        { pct: r.display_added_as_percentage === 1, noPlus: r.dont_display_plus === 1, includesModifier: r.name_includes_modifier === 1, name: r.name as string | null },
      ]),
    ),
    pp: new Map(safeAll(ctx, "SELECT idx, display_added_as_percentage FROM player_properties").map((r) => [r.idx as number, r.display_added_as_percentage === 1])),
    ap: new Map(
      safeAll(ctx, "SELECT ability_index, prop_index, display_added_as_percentage FROM ability_properties").map((r) => [`${r.ability_index}:${r.prop_index}`, r.display_added_as_percentage === 1]),
    ),
    altar: new Map(safeAll(ctx, "SELECT idx, display_added_as_percentage FROM idol_altar_properties").map((r) => [r.idx as number, r.display_added_as_percentage === 1])),
    abilityByIndex: new Map(),
  };
  // an ability index can be shared; the first row wins (player abilities first)
  for (const r of safeAll(ctx, "SELECT ability_index, ability_id, name FROM abilities WHERE ability_index IS NOT NULL ORDER BY is_player_ability DESC, ability_id")) {
    if (!c.abilityByIndex.has(r.ability_index as number)) c.abilityByIndex.set(r.ability_index as number, { ability_id: r.ability_id as string, name: r.name as string | null });
  }
  caches.set(ctx, c);
  return c;
}

const lc = (s: string | null | undefined) => (s ?? "").toLowerCase();

// ---------------------------------------------------------------- trees and nodes

/** "Lightning Blast node", "Runemaster passive" (class name for the base tree), "Weaver tree". */
export function treeOwnerLabel(ctx: Ctx, treeId: string, mastery?: number | null): string | undefined {
  const c = core(ctx);
  const t = c.trees.get(treeId);
  if (!t) return undefined;
  if (t.kind === "skill") return `${t.name ?? treeId} node`;
  if (t.kind === "weaver") return "Weaver tree";
  const m = mastery !== undefined && mastery !== null ? c.masteries.get(`${t.class_id}:${mastery}`) : undefined;
  return `${m ?? t.name ?? treeId} passive`;
}

/** In-game name of a tree node: "Circle of Elements (Runemaster passive)", "Melting Nova (Elemental Nova node)". */
export function nodeDisplay(ctx: Ctx, treeId: string, nodeId: number | string): string | undefined {
  const n = core(ctx).nodes.get(`${treeId}:${nodeId}`);
  if (!n) return undefined;
  const owner = treeOwnerLabel(ctx, treeId, n.mastery);
  return owner ? `${n.name} (${owner})` : n.name;
}

/** nodeDisplay for a "tree:node" key (the mods.source_id form). */
export function nodeKeyDisplay(ctx: Ctx, key: string): string | undefined {
  const i = key.lastIndexOf(":");
  if (i < 0) return undefined;
  return nodeDisplay(ctx, key.slice(0, i), key.slice(i + 1));
}

// ---------------------------------------------------------------- items

function uniques(ctx: Ctx): Map<number, UniqueInfo> {
  const c = core(ctx);
  if (!c.uniques) {
    c.uniques = new Map(
      safeAll(
        ctx,
        `SELECT u.unique_id, u.name, u.is_set_item, b.name AS base_type, s.name AS sub_type, s.class_requirement_names
           FROM uniques u
           LEFT JOIN item_base_types b ON b.base_type_id = u.base_type_id
           LEFT JOIN item_subtypes s ON s.base_type_id = u.base_type_id AND s.sub_type_id = u.sub_type_id`,
      ).map((r) => [
        r.unique_id as number,
        {
          name: r.name as string,
          base_type: r.base_type as string | null,
          sub_type: r.sub_type as string | null,
          is_set: r.is_set_item === 1,
          class_requirement: (r.class_requirement_names as string | null) || null,
        },
      ]),
    );
  }
  return c.uniques;
}

export function uniqueInfo(ctx: Ctx, uniqueId: number): UniqueInfo | undefined {
  return uniques(ctx).get(uniqueId);
}

/** "Crest of Unity (unique helmet)", "Bastion of Honour (set shield)". */
export function uniqueDisplay(ctx: Ctx, uniqueId: number): string | undefined {
  const u = uniqueInfo(ctx, uniqueId);
  if (!u) return undefined;
  return `${u.name} (${u.is_set ? "set" : "unique"}${u.base_type ? " " + lc(u.base_type) : ""})`;
}

function affixes(ctx: Ctx): Map<number, AffixInfo> {
  const c = core(ctx);
  if (!c.affixes) {
    const slots = new Map<number, string[]>();
    for (const r of safeAll(ctx, "SELECT r.affix_id, b.name FROM affix_can_roll_on r JOIN item_base_types b ON b.base_type_id = r.base_type_id ORDER BY r.affix_id, r.ord")) {
      (slots.get(r.affix_id as number) ?? slots.set(r.affix_id as number, []).get(r.affix_id as number)!).push(r.name as string);
    }
    const labels = new Map<number, string[]>();
    for (const r of safeAll(ctx, "SELECT affix_id, label FROM affix_stats ORDER BY affix_id, ord")) {
      if (r.label) (labels.get(r.affix_id as number) ?? labels.set(r.affix_id as number, []).get(r.affix_id as number)!).push(String(r.label).trim());
    }
    c.affixes = new Map(
      safeAll(ctx, "SELECT affix_id, name, affix_type_name, class_names, special_affix_type FROM affixes").map((r) => [
        r.affix_id as number,
        {
          name: r.name as string,
          type: r.affix_type_name as string | null,
          class_names: (r.class_names as string | null) || null,
          slots: slots.get(r.affix_id as number) ?? [],
          labels: labels.get(r.affix_id as number) ?? [],
          special_affix_type: r.special_affix_type as number | null,
        },
      ]),
    );
  }
  return c.affixes;
}

export function affixInfo(ctx: Ctx, affixId: number): AffixInfo | undefined {
  return affixes(ctx).get(affixId);
}

/** "Chance to Shock on Hit with Lightning Skills (prefix)", "Ward Per Second (suffix, Mage only)". */
export function affixDisplay(ctx: Ctx, affixId: number): string | undefined {
  const a = affixInfo(ctx, affixId);
  if (!a) return undefined;
  const bits = [a.type, a.class_names ? `${a.class_names} only` : undefined].filter(Boolean);
  return bits.length ? `${a.name} (${bits.join(", ")})` : a.name;
}

/**
 * Summary of an affix for a caller that must describe it to a player: the in-game line names (affix_stats.label),
 * prefix / suffix, class restriction, the item slots it rolls on, and optionally the stat lines of one tier
 * (stored values, i.e. on a base with the affix's standard affix effect modifier; scale per base with v_affix_values).
 */
export function affixSummary(ctx: Ctx, affixId: number, tier?: number): Row | undefined {
  const a = affixInfo(ctx, affixId);
  if (!a) return undefined;
  const out: Row = {
    display: affixDisplay(ctx, affixId),
    line_names: a.labels,
    type: a.type ?? undefined,
    class_restriction: a.class_names ?? undefined,
    rolls_on: a.slots,
  };
  if (tier !== undefined) {
    const lines = affixTierLines(ctx, affixId, tier);
    if (lines.length) out.tier_lines = lines;
  }
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined));
}

const tierLineCache = new WeakMap<Ctx, Map<string, string[]>>();
/** Stat lines of one affix tier ("+60-77% Chance to Shock on Lightning Hit"), stored (unscaled) values. */
export function affixTierLines(ctx: Ctx, affixId: number, tier: number): string[] {
  let m = tierLineCache.get(ctx);
  if (!m) tierLineCache.set(ctx, (m = new Map()));
  const k = `${affixId}:${tier}`;
  const hit = m.get(k);
  if (hit) return hit;
  const rows = safeAll(
    ctx,
    `SELECT property, special_tag, tags, tag_names, modifier_type, value_min, value_max, label FROM mods
      WHERE source_kind = 'affix_tier' AND source_id = '${Number(affixId)}' AND tier = ${Number(tier)} ORDER BY source_ord, sub_ord`,
  );
  const lines = rows.map((r) => statLine(ctx, r)).filter((s): s is string => !!s);
  m.set(k, lines);
  return lines;
}

function blessings(ctx: Ctx): Map<number, { name: string; timeline: string | null }> {
  const c = core(ctx);
  if (!c.blessings) {
    c.blessings = new Map(
      safeAll(ctx, "SELECT b.sub_type_id, b.name, t.name AS timeline FROM blessings b LEFT JOIN timelines t ON t.timeline_id = b.timeline_id").map((r) => [
        r.sub_type_id as number,
        { name: r.name as string, timeline: r.timeline as string | null },
      ]),
    );
  }
  return c.blessings;
}

/** "Grand Bastion of Divinity (Ending the Storm blessing)". */
export function blessingDisplay(ctx: Ctx, subTypeId: number): string | undefined {
  const b = blessings(ctx).get(subTypeId);
  if (!b) return undefined;
  return b.timeline ? `${b.name} (${b.timeline} blessing)` : `${b.name} (blessing)`;
}

function setName(ctx: Ctx, setId: number): string | undefined {
  const c = core(ctx);
  if (!c.sets) c.sets = new Map(safeAll(ctx, "SELECT set_id, name FROM sets").map((r) => [r.set_id as number, r.name as string]));
  return c.sets.get(setId);
}
function subtypeName(ctx: Ctx, key: string): string | undefined {
  const c = core(ctx);
  if (!c.subtypes) c.subtypes = new Map(safeAll(ctx, "SELECT base_type_id, sub_type_id, name FROM item_subtypes").map((r) => [`${r.base_type_id}:${r.sub_type_id}`, r.name as string]));
  return c.subtypes.get(key);
}

/** In-game name of the owner of a mods row (source_kind + source_id), for find_mods. */
export function sourceDisplay(ctx: Ctx, kind: string, id: string, fallback?: string | null, tier?: number | null): string | undefined {
  switch (kind) {
    case "skill_node":
    case "passive_node":
    case "weaver_node":
      return nodeKeyDisplay(ctx, id) ?? fallback ?? undefined;
    case "unique_mod":
      return uniqueDisplay(ctx, Number(id)) ?? fallback ?? undefined;
    case "affix_tier": {
      const d = affixDisplay(ctx, Number(id));
      return d ? (tier ? `${d} T${tier}` : d) : (fallback ?? undefined);
    }
    case "set_bonus": {
      const n = setName(ctx, Number(id));
      return n ? `${n} (set bonus)` : (fallback ?? undefined);
    }
    case "blessing": {
      const sub = Number(id.split(":")[1]);
      return blessingDisplay(ctx, sub) ?? fallback ?? undefined;
    }
    case "implicit": {
      const n = subtypeName(ctx, id);
      return n ? `${n} (base item implicit)` : (fallback ?? undefined);
    }
    case "idol_altar": {
      const n = subtypeName(ctx, id);
      return n ? `${n} (idol altar)` : (fallback ?? undefined);
    }
    case "ailment_buff": {
      const n = core(ctx).ailments.get(Number(id));
      return n ? `${n} (ailment / buff)` : (fallback ?? undefined);
    }
    default:
      return fallback ?? undefined;
  }
}

// ---------------------------------------------------------------- stat lines

/** Properties whose special_tag is an ailment id, with the in-game wording of the stat for ailment `a`. */
const AILMENT_STAT: Record<number, (a: string) => string> = {
  1: (a) => `${a} Chance`,
  42: (a) => `Increased ${a} Duration`,
  43: (a) => `Increased ${a} Effect`,
  115: (a) => `Damage Per Stack of ${a}`,
  120: (a) => `Effect of ${a} on You`,
  128: (a) => `${a} Immunity`,
};
/** SP 117 / 131-133: stat word; the condition comes from conditional_properties[special_tag]. */
const CONDITIONAL_STAT: Record<number, { stat: string; damage: boolean }> = {
  117: { stat: "Damage", damage: true },
  131: { stat: "Penetration", damage: false },
  132: { stat: "Critical Strike Chance", damage: false },
  133: { stat: "Critical Strike Multiplier", damage: false },
};

export function ailmentNameOf(ctx: Ctx, id: number): string | undefined {
  return core(ctx).ailments.get(id);
}

/** The ConditionalDamageProperty description of a SP 117 / 131-133 line ("to Moving Enemies"). */
export function conditionOf(ctx: Ctx, m: Row): string | undefined {
  const p = m.property as number;
  const spec = CONDITIONAL_STAT[p];
  if (!spec || typeof m.special_tag !== "number") return undefined;
  const c = core(ctx).conditions.get(m.special_tag);
  if (!c) return undefined;
  return (spec.damage ? c.damage : c.nonDamage) ?? c.damage ?? c.nonDamage ?? undefined;
}

/** The ability an SP 58 (AbilityProperty) or SP 88 single-skill line belongs to (its `tags` is an ability index). */
export function abilityOfIndex(ctx: Ctx, index: number): { ability_id: string; name: string | null } | undefined {
  return core(ctx).abilityByIndex.get(index);
}

const tagWords = (m: Row) => (typeof m.tag_names === "string" && m.tag_names ? m.tag_names.split(",").join(" ") + " " : "");

/** The stat a mods row grants, in readable words (no value): "Shock Chance", "Damage to Moving Enemies". */
export function statName(ctx: Ctx, m: Row): string | undefined {
  const p = m.property as number | undefined;
  // single-skill levels: the affix label is only the skill name ("Erasing Strike"); the game line reads "Level of ..."
  if (p === 88 && m.special_tag === 1 && typeof m.property_name === "string" && /^Level of /.test(m.property_name)) return m.property_name;
  const label = typeof m.label === "string" ? m.label.trim() : "";
  if (label) return label;
  if (p === undefined || p === null) return undefined;
  const c = core(ctx);
  if (p === 100) {
    const from = c.ailments.get(m.special_tag as number);
    const to = c.ailments.get(m.tags as number);
    if (from && to) return `${from} Chance Converted to ${to} Chance`;
  }
  if (CONDITIONAL_STAT[p]) {
    const cond = conditionOf(ctx, m);
    return `${tagWords(m)}${CONDITIONAL_STAT[p]!.stat}${cond ? " " + cond : ""}`;
  }
  if (AILMENT_STAT[p] && typeof m.special_tag === "number" && m.special_tag > 0) {
    const a = c.ailments.get(m.special_tag);
    if (a) return tagWords(m) + AILMENT_STAT[p]!(a);
  }
  const name = (m.property_name as string | null) ?? c.props.get(p)?.name ?? null;
  if (!name) return undefined;
  if (p === 58 || p === 98 || p === 130 || p === 104 || p === 105 || (p === 88 && m.special_tag === 1)) return name;
  return tagWords(m) + name;
}

function isPercent(ctx: Ctx, m: Row): boolean {
  const p = m.property as number;
  const mt = m.modifier_type;
  if (mt === 1 || mt === 2) return true;
  if (p === 100) return true;
  const c = core(ctx);
  if (p === 98) return c.pp.get(m.tags as number) ?? false;
  if (p === 58) return c.ap.get(`${m.tags}:${m.special_tag}`) ?? false;
  if (p === 130) return c.altar.get(m.tags as number) ?? false;
  return c.props.get(p)?.pct ?? false;
}

const num = (v: number, pct: boolean) => {
  const x = pct ? v * 100 : v;
  return String(Math.round(x * 100) / 100);
};

/**
 * One stat line as the game tooltip words it: "+116-140% Chance to Shock on Lightning Hit", "+90% increased Lightning
 * Spell Damage", "9-18% less Damage Taken from Ignited Shocked or Chilled Enemies". Tree-node rows use their own
 * `display` value. Flag lines of indirect properties ("Elemental Nova is always Tri-Elemental") have no number.
 */
export function statLine(ctx: Ctx, m: Row): string | undefined {
  const name = statName(ctx, m);
  if (!name) return undefined;
  if (typeof m.display === "string" && m.display.trim()) return `${m.display.trim()} ${name}`;
  const p = m.property as number;
  let lo = m.value_min as number | null | undefined;
  let hi = m.value_max as number | null | undefined;
  if (typeof lo !== "number") return name;
  // SP 98 / 58: value_max is often 0 or below value_min; value_min is the magnitude
  if (typeof hi !== "number" || ((p === 98 || p === 58) && (hi === 0 || hi < lo))) hi = lo;
  const mt = m.modifier_type as number | null | undefined;
  const indirect = p === 58 || p === 98 || p === 130;
  if (indirect && lo === 1 && hi === 1 && /\b(is|are|always|cannot|can't|no longer|instead|has|have)\b/i.test(name)) return name;
  const pct = isPercent(ctx, m);
  const neg = lo < 0 && hi <= 0;
  const a = Math.min(Math.abs(lo), Math.abs(hi));
  const b = Math.max(Math.abs(lo), Math.abs(hi));
  const range = neg || (mt === 2 || mt === 1) ? (a === b ? num(a, pct) : `${num(a, pct)}-${num(b, pct)}`) : lo === hi ? num(lo, pct) : `${num(lo, pct)}-${num(hi, pct)}`;
  const value = range + (pct ? "%" : "");
  const props = core(ctx).props.get(p);
  const lname = lc(name);
  const hasWord = (w: string) => new RegExp(`(^|\\s)${w}(\\s|$)`).test(lname);
  let word = "";
  if (mt === 1 && !props?.includesModifier && !hasWord("increased") && !hasWord("reduced")) word = neg ? "reduced " : "increased ";
  if (mt === 2 && !props?.includesModifier && !hasWord("more") && !hasWord("less")) word = neg ? "less " : "more ";
  let sign = "";
  if (mt !== 2 && !props?.noPlus && p !== 100) sign = neg ? (mt === 1 ? "" : "-") : "+";
  if (mt === 2 && neg && word === "") sign = "-";
  return `${sign}${value} ${word}${name}`.replace(/\s+/g, " ").trim();
}

/** Substitute `[min,max,x]` roll placeholders of tooltip text with "min-max". */
export function fillPlaceholders(text: string): string {
  return text.replace(/\[(-?[\d.]+),(-?[\d.]+)(?:,[^\]]*)?\]/g, (_s, a: string, b: string) => (a === b ? a : `${a}-${b}`));
}

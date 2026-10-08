/**
 * `get` tool: kind -> table mapping and children.
 *
 * kind            table(s)                         natural id
 * unique          uniques                          unique_id (int)
 * affix           affixes                          affix_id (int)
 * subtype         item_subtypes                    "base:sub" | {base,sub}
 * base_type       item_base_types                  base_type_id (int)
 * set             sets                             set_id (int)
 * blessing        blessings                        sub_type_id (int) | "34:sub"
 * ability         abilities                        ability_id (text, e.g. "fi9")
 * skill_tree      trees (tree_kind skill)          tree_id or ability_id
 * passive_tree    trees (tree_kind class/weaver)   tree_id ("mg-1") | class id 0-4 | class name
 * skill_node / passive_node / weaver_node
 *                 tree_nodes (+tree_kind check)    "tree:node" | {tree,node}
 * ailment         ailments                         ailment_id (int)
 * property        stat_properties                  property (int, SP id)
 * player_property player_properties                idx (int)
 * ability_property ability_properties              "ability_index:prop_index"
 * class           classes                          class_id 0-4 | name
 * mastery         masteries                        "class:mastery_index"
 * monster_mod     monster_mods                     mod_id (int)
 * timeline        timelines                        timeline_id (int)
 * dungeon         dungeons                         dungeon_id (int)
 */
import { all, clean, cleanAll, one, ToolError, type Ctx, type Row } from "./context.js";

export const MOD_COLS =
  "source_ord, sub_ord, tier, property, property_name, special_tag, tags, tag_names, modifier_type, value_min, value_max, display, label, context, set_requirement, hidden, is_downside";

export type Id = string | number | { [k: string]: string | number };

export function dropNulls(r: Row): Row {
  const o: Row = {};
  for (const [k, v] of Object.entries(r)) if (v !== null && v !== undefined) o[k] = v;
  return o;
}

/** Stat properties whose `special_tag` is an ailment id (docs/data-sources/enums.md). */
export const AILMENT_SPECIAL_TAG_PROPS = new Set([1, 42, 43, 100, 115, 120, 128]);
const INDIRECT_PROP_KIND: Record<number, string> = { 98: "player_property", 58: "ability_property", 130: "idol_altar_property" };

const ailmentNameCache = new WeakMap<Ctx, Map<number, string>>();
export function ailmentName(ctx: Ctx, id: number): string | undefined {
  let m = ailmentNameCache.get(ctx);
  if (!m) {
    m = new Map(all(ctx, "SELECT ailment_id, name FROM ailments").map((r) => [r.ailment_id as number, r.name as string]));
    ailmentNameCache.set(ctx, m);
  }
  return m.get(id);
}

/** Add special_tag_name (ailment properties) and property_kind (indirect properties) to a mod row. */
export function decorateMod<T extends Row>(ctx: Ctx, m: T): T {
  const p = m.property as number | undefined;
  if (p === undefined) return m;
  const out: Row = { ...m };
  if (AILMENT_SPECIAL_TAG_PROPS.has(p) && typeof m.special_tag === "number" && m.special_tag > 0) {
    const n = ailmentName(ctx, m.special_tag);
    if (n) out.special_tag_name = n;
  }
  if (INDIRECT_PROP_KIND[p]) out.property_kind = INDIRECT_PROP_KIND[p];
  return out as T;
}

export function modsFor(ctx: Ctx, sourceKind: string, sourceId: string | number): Row[] {
  return all(
    ctx,
    `SELECT ${MOD_COLS} FROM mods WHERE source_kind = ? AND source_id = ? ORDER BY tier, source_ord, sub_ord`,
    sourceKind,
    String(sourceId),
  )
    .map(dropNulls)
    .map((m) => decorateMod(ctx, m));
}

const DAMAGE_NAMES = ["physical", "fire", "cold", "lightning", "necrotic", "void", "poison"];

/** Names of the single-bit tags set in an AT tag mask (from tag_bits). */
export function tagNames(ctx: Ctx, mask: number | null | undefined): string[] {
  if (!mask) return [];
  return ctx.tagList.filter((t) => t.value !== 0 && (t.value & (t.value - 1)) === 0 && (t.value & mask) !== 0).map((t) => t.name);
}

function scalarFields(raw: Row): Row {
  const o: Row = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k === "type") continue;
    if (v === null || typeof v === "number" || typeof v === "string" || typeof v === "boolean") o[k] = v;
  }
  return o;
}

/** Decode the components we understand; undefined for the rest (callers still get `fields`). */
export function decodeComponent(ctx: Ctx, type: string, raw: Row): Row | undefined {
  if (raw.baseDamageStats && typeof raw.baseDamageStats === "object") {
    const b = raw.baseDamageStats as Row;
    const damage: Row = {};
    ((b.damage as number[]) ?? []).forEach((v, i) => {
      if (v) damage[DAMAGE_NAMES[i] ?? `type${i}`] = v;
    });
    const out: Row = {
      damage,
      damage_total: Math.round(Object.values(damage).reduce((s: number, v) => s + (v as number), 0) * 1e6) / 1e6,
      crit_chance: b.critChance,
      crit_multiplier: b.critMultiplier,
      added_damage_scaling: b.addedDamageScaling,
      hit: b.hit,
      damage_tags: tagNames(ctx, raw.damageTags as number),
    };
    if (Array.isArray(b.penetration) && b.penetration.length) out.penetration = b.penetration;
    for (const k of ["cullPercent", "flatCull", "increasedStunChance", "increasedStunDuration", "additionalLeech", "freezeRate"]) {
      if (b[k]) out[k] = b[k];
    }
    return out;
  }
  if (type === "ChanceToApplyAilmentsOnHit" && Array.isArray(raw.ailments)) {
    return {
      ailments: (raw.ailments as Row[]).map((a) => ({
        id: a.ailment,
        name: ailmentName(ctx, a.ailment as number),
        chance: a.chance,
        rolled_separately: a.rolledSeparately,
        ...(a.increasedDuration ? { increased_duration: a.increasedDuration } : {}),
        ...(a.increasedEffect ? { increased_effect: a.increasedEffect } : {}),
      })),
    };
  }
  if (type === "DestroyAfterDuration") return { duration: raw.duration };
  return undefined;
}

function int(id: Id, what: string): number {
  const n = typeof id === "number" ? id : typeof id === "string" ? Number(id) : NaN;
  if (!Number.isFinite(n)) throw new ToolError(`${what} id must be an integer, got ${JSON.stringify(id)}`);
  return n;
}
function pair(id: Id, a: string, b: string, what: string): [string, string] {
  if (typeof id === "object" && id) {
    const x = (id as Row)[a];
    const y = (id as Row)[b];
    if (x !== undefined && y !== undefined) return [String(x), String(y)];
  }
  if (typeof id === "string" && id.includes(":")) {
    const i = id.lastIndexOf(":");
    return [id.slice(0, i), id.slice(i + 1)];
  }
  throw new ToolError(`${what} id must be "${a}:${b}" or {${a},${b}}, got ${JSON.stringify(id)}`);
}
function str(id: Id): string {
  if (typeof id === "object") throw new ToolError(`id must be a string or number, got ${JSON.stringify(id)}`);
  return String(id);
}

/** Class id from 0-4, a class name, or a class tree id like "mg-1". */
export function classIdOf(ctx: Ctx, id: Id): number | undefined {
  const s = str(id).trim();
  if (/^\d+$/.test(s)) {
    const r = one(ctx, "SELECT class_id FROM classes WHERE class_id = ?", Number(s));
    return r ? (r.class_id as number) : undefined;
  }
  const r = one(ctx, "SELECT class_id FROM classes WHERE lower(name) = lower(?) OR tree_id = ?", s, s);
  return r ? (r.class_id as number) : undefined;
}

type Getter = (ctx: Ctx, id: Id, raw: boolean) => Row;

function need<T>(v: T | undefined, kind: string, id: Id): T {
  if (v === undefined) throw new ToolError(`No ${kind} with id ${JSON.stringify(id)}`);
  return v;
}

function nodeGetter(treeKind: string): Getter {
  return (ctx, id, raw) => {
    const [tree, node] = pair(id, "tree", "node", treeKind + "_node");
    const n = need(
      one(ctx, "SELECT * FROM tree_nodes WHERE tree_id = ? AND node_id = ?", tree, Number(node)),
      treeKind + "_node",
      id,
    );
    const expected = treeKind === "passive" ? "class" : treeKind;
    if (n.tree_kind !== expected) {
      const right = n.tree_kind === "class" ? "passive" : n.tree_kind;
      throw new ToolError(`Node ${tree}:${node} is a ${n.tree_kind} node; use kind '${right}_node'`);
    }
    const t = one(ctx, "SELECT tree_id, tree_kind, name, ability_id, class_id FROM trees WHERE tree_id = ?", tree);
    return {
      node: clean(n, raw),
      tree: t,
      mods: modsFor(ctx, `${treeKind}_node`, `${tree}:${node}`),
      requirements: all(
        ctx,
        "SELECT r.required_node_id, r.required_points, n.name AS required_name FROM tree_node_requirements r LEFT JOIN tree_nodes n ON n.tree_id = r.tree_id AND n.node_id = r.required_node_id WHERE r.tree_id = ? AND r.node_id = ? ORDER BY r.ord",
        tree,
        Number(node),
      ),
    };
  };
}

function treeSummary(ctx: Ctx, row: Row, raw: boolean): Row {
  const n = one(ctx, "SELECT count(*) n FROM tree_nodes WHERE tree_id = ?", row.tree_id)!.n;
  return { tree: clean(row, raw), node_count: n, note: "Full nodes: use the skill_tree / passive_tree tool." };
}

export const GETTERS: Record<string, Getter> = {
  unique(ctx, id, raw) {
    const u = need(one(ctx, "SELECT * FROM uniques WHERE unique_id = ?", int(id, "unique")), "unique", id);
    const bt = u.base_type_id == null ? undefined : one(ctx, "SELECT name FROM item_base_types WHERE base_type_id = ?", u.base_type_id);
    const st = u.sub_type_id == null ? undefined : one(ctx, "SELECT name FROM item_subtypes WHERE base_type_id = ? AND sub_type_id = ?", u.base_type_id, u.sub_type_id);
    const sn = u.set_id == null ? undefined : one(ctx, "SELECT name FROM sets WHERE set_id = ?", u.set_id);
    return {
      unique: {
        ...clean(u, raw),
        ...(bt ? { base_type_name: bt.name } : {}),
        ...(st ? { sub_type_name: st.name } : {}),
        ...(sn ? { set_name: sn.name } : {}),
      },
      mods: modsFor(ctx, "unique_mod", u.unique_id as number),
      tooltips: all(ctx, "SELECT ord, text, alt_text, set_mod, set_requirement FROM unique_tooltips WHERE unique_id = ? ORDER BY ord", u.unique_id).map(dropNulls),
      subtypes: all(
        ctx,
        "SELECT us.ord, us.base_type_id, us.sub_type_id, s.name AS sub_name, b.name AS base_name FROM unique_subtypes us LEFT JOIN item_subtypes s ON s.base_type_id = us.base_type_id AND s.sub_type_id = us.sub_type_id LEFT JOIN item_base_types b ON b.base_type_id = us.base_type_id WHERE us.unique_id = ? ORDER BY us.ord",
        u.unique_id,
      ),
      set: u.set_id == null ? null : one(ctx, "SELECT set_id, name, item_count FROM sets WHERE set_id = ?", u.set_id),
    };
  },
  affix(ctx, id, raw) {
    const a = need(one(ctx, "SELECT * FROM affixes WHERE affix_id = ?", int(id, "affix")), "affix", id);
    const tiers = all(ctx, "SELECT tier, required_level, tier_name FROM affix_tiers WHERE affix_id = ? ORDER BY tier", a.affix_id);
    const tierMods = all(
      ctx,
      `SELECT ${MOD_COLS} FROM mods WHERE source_kind = 'affix_tier' AND source_id = ? ORDER BY tier, source_ord, sub_ord`,
      String(a.affix_id),
    )
      .map(dropNulls)
      .map((m) => decorateMod(ctx, m));
    const compact = (m: Row): Row => {
      const { tier: _t, source_ord: _o, sub_ord: _s, hidden, is_downside, ...rest } = m;
      return { ...rest, ...(hidden ? { hidden } : {}), ...(is_downside ? { is_downside } : {}) };
    };
    return {
      affix: { ...clean(a, raw), type_name: a.affix_type_name },
      stats: all(ctx, "SELECT * FROM affix_stats WHERE affix_id = ? ORDER BY ord", a.affix_id).map(dropNulls),
      tiers: tiers.map((t) => ({
        ...dropNulls(t),
        mods: tierMods.filter((m) => m.tier === t.tier).map(compact),
      })),
      can_roll_on: all(
        ctx,
        "SELECT c.base_type_id, b.name FROM affix_can_roll_on c LEFT JOIN item_base_types b ON b.base_type_id = c.base_type_id WHERE c.affix_id = ? ORDER BY c.ord",
        a.affix_id,
      ),
    };
  },
  subtype(ctx, id, raw) {
    const [b, s] = pair(id, "base", "sub", "subtype");
    const r = need(
      one(ctx, "SELECT * FROM item_subtypes WHERE base_type_id = ? AND sub_type_id = ?", Number(b), Number(s)),
      "subtype",
      id,
    );
    return {
      subtype: clean(r, raw),
      base_type: one(ctx, "SELECT base_type_id, name, category, max_affixes, is_weapon FROM item_base_types WHERE base_type_id = ?", Number(b)),
      implicits: modsFor(ctx, "implicit", `${b}:${s}`),
    };
  },
  base_type(ctx, id, raw) {
    const r = need(one(ctx, "SELECT * FROM item_base_types WHERE base_type_id = ?", int(id, "base_type")), "base_type", id);
    return {
      base_type: clean(r, raw),
      subtype_count: one(ctx, "SELECT count(*) n FROM item_subtypes WHERE base_type_id = ?", r.base_type_id)!.n,
    };
  },
  set(ctx, id, raw) {
    const s = need(one(ctx, "SELECT * FROM sets WHERE set_id = ?", int(id, "set")), "set", id);
    return {
      set: clean(s, raw),
      bonus_mods: modsFor(ctx, "set_bonus", s.set_id as number),
      tooltips: all(ctx, "SELECT ord, set_requirement, set_mod, text, alt_text FROM set_tooltips WHERE set_id = ? ORDER BY ord", s.set_id).map(dropNulls),
      members: all(ctx, "SELECT unique_id, name, base_type_id, sub_type_id FROM uniques WHERE set_id = ? ORDER BY unique_id", s.set_id),
    };
  },
  blessing(ctx, id, raw) {
    const sub = typeof id === "string" && id.includes(":") ? Number(id.split(":")[1]) : int(id, "blessing");
    const b = need(one(ctx, "SELECT * FROM blessings WHERE sub_type_id = ?", sub), "blessing", id);
    return {
      blessing: clean(b, raw),
      mods: modsFor(ctx, "blessing", `34:${sub}`),
      timeline: one(ctx, "SELECT timeline_id, name, boss_name FROM timelines WHERE timeline_id = ?", b.timeline_id),
      timeline_slots: all(
        ctx,
        "SELECT timeline_id, difficulty_index, slot_kind, ord FROM timeline_blessings WHERE blessing_sub_type_id = ?",
        sub,
      ),
    };
  },
  ability(ctx, id, raw) {
    const a = need(one(ctx, "SELECT * FROM abilities WHERE ability_id = ?", str(id)), "ability", id);
    const cps = (a.charges_gained_per_second as number | null) ?? 0;
    const extra: Row = { tags_names: tagNames(ctx, a.tags as number) };
    if (cps > 0) {
      extra.cooldown_seconds = Math.round(1e6 / cps) / 1e6;
      extra.notes =
        "cooldown_seconds = 1 / charges_gained_per_second (seconds per charge regenerated). attack_speed (`as`) is the animation speed multiplier, not uses/second.";
    }
    const components = all(
      ctx,
      "SELECT ord, component_type, damage_tags, ref_ability_id, raw_json FROM ability_components WHERE ability_id = ? ORDER BY ord",
      a.ability_id,
    ).map((c) => {
      let rawObj: Row = {};
      try {
        rawObj = JSON.parse(c.raw_json as string);
      } catch {
        /* keep empty */
      }
      const { raw_json: _r, ...head } = c;
      const decoded = decodeComponent(ctx, c.component_type as string, rawObj);
      return dropNulls({ ...head, decoded, fields: scalarFields(rawObj) });
    });
    return {
      ability: { ...clean(a, raw), ...extra },
      components,
      links: all(ctx, "SELECT link_kind, ord, target_ability_id FROM ability_links WHERE ability_id = ? ORDER BY link_kind, ord", a.ability_id),
      attribute_scaling: modsFor(ctx, "ability_attribute_scaling", a.ability_id as string),
      level_scaling: modsFor(ctx, "ability_level_scaling", a.ability_id as string),
      properties: all(ctx, "SELECT ability_index, prop_index, name, alt_text FROM ability_properties WHERE ability_id = ? ORDER BY prop_index", a.ability_id).map(dropNulls),
      has_tree: !!one(ctx, "SELECT 1 x FROM trees WHERE ability_id = ?", a.ability_id),
    };
  },
  skill_tree(ctx, id, raw) {
    const s = str(id);
    const t = need(
      one(ctx, "SELECT * FROM trees WHERE tree_kind = 'skill' AND (tree_id = ? OR ability_id = ?)", s, s),
      "skill_tree",
      id,
    );
    return treeSummary(ctx, t, raw);
  },
  passive_tree(ctx, id, raw) {
    const cid = classIdOf(ctx, id);
    const t =
      cid !== undefined
        ? one(ctx, "SELECT * FROM trees WHERE tree_kind = 'class' AND class_id = ?", cid)
        : one(ctx, "SELECT * FROM trees WHERE tree_kind IN ('class','weaver') AND tree_id = ?", str(id));
    return treeSummary(ctx, need(t, "passive_tree", id), raw);
  },
  skill_node: nodeGetter("skill"),
  passive_node: nodeGetter("passive"),
  weaver_node: nodeGetter("weaver"),
  ailment(ctx, id, raw) {
    const a = need(one(ctx, "SELECT * FROM ailments WHERE ailment_id = ?", int(id, "ailment")), "ailment", id);
    return { ailment: clean(a, raw), buff_mods: modsFor(ctx, "ailment_buff", a.ailment_id as number) };
  },
  property(ctx, id, raw) {
    const p = need(one(ctx, "SELECT * FROM stat_properties WHERE property = ?", int(id, "property")), "property", id);
    return {
      property: clean(p, raw),
      alt_texts: all(ctx, "SELECT ord, modifier_type, special_tag, tags, tag_names, dont_display_plus, alt_text FROM stat_property_alt_texts WHERE property = ? ORDER BY ord", p.property).map(dropNulls),
    };
  },
  player_property(ctx, id, raw) {
    return { player_property: clean(need(one(ctx, "SELECT * FROM player_properties WHERE idx = ?", int(id, "player_property")), "player_property", id), raw) };
  },
  ability_property(ctx, id, raw) {
    const [a, p] = pair(id, "ability_index", "prop_index", "ability_property");
    return {
      ability_property: clean(
        need(one(ctx, "SELECT * FROM ability_properties WHERE ability_index = ? AND prop_index = ?", Number(a), Number(p)), "ability_property", id),
        raw,
      ),
    };
  },
  class(ctx, id, raw) {
    const cid = need(classIdOf(ctx, id), "class", id);
    const c = one(ctx, "SELECT * FROM classes WHERE class_id = ?", cid)!;
    return {
      class: clean(c, raw),
      masteries: all(ctx, "SELECT mastery_index, name, mastery_ability_id FROM masteries WHERE class_id = ? ORDER BY mastery_index", cid),
      abilities: all(ctx, "SELECT kind, mastery_index, ord, ability_id, level FROM class_abilities WHERE class_id = ? ORDER BY kind, mastery_index, ord", cid),
    };
  },
  mastery(ctx, id, raw) {
    const [c, m] = pair(id, "class", "mastery", "mastery");
    const r = need(one(ctx, "SELECT * FROM masteries WHERE class_id = ? AND mastery_index = ?", Number(c), Number(m)), "mastery", id);
    return {
      mastery: clean(r, raw),
      abilities: all(ctx, "SELECT kind, ord, ability_id, level FROM class_abilities WHERE class_id = ? AND mastery_index = ? ORDER BY kind, ord", Number(c), Number(m)),
    };
  },
  monster_mod(ctx, id, raw) {
    const m = need(one(ctx, "SELECT * FROM monster_mods WHERE mod_id = ?", int(id, "monster_mod")), "monster_mod", id);
    return { monster_mod: clean(m, raw), mods: modsFor(ctx, "monster_mod", m.mod_id as number) };
  },
  timeline(ctx, id, raw) {
    const t = need(one(ctx, "SELECT * FROM timelines WHERE timeline_id = ?", int(id, "timeline")), "timeline", id);
    return {
      timeline: clean(t, raw),
      difficulties: cleanAll(all(ctx, "SELECT * FROM timeline_difficulties WHERE timeline_id = ? ORDER BY difficulty_index", t.timeline_id), raw),
      blessings: all(
        ctx,
        "SELECT tb.difficulty_index, tb.slot_kind, tb.ord, tb.blessing_sub_type_id, b.name FROM timeline_blessings tb LEFT JOIN blessings b ON b.sub_type_id = tb.blessing_sub_type_id WHERE tb.timeline_id = ? ORDER BY tb.difficulty_index, tb.slot_kind, tb.ord",
        t.timeline_id,
      ),
    };
  },
  dungeon(ctx, id, raw) {
    const d = need(one(ctx, "SELECT * FROM dungeons WHERE dungeon_id = ?", int(id, "dungeon")), "dungeon", id);
    return { dungeon: clean(d, raw), tiers: cleanAll(all(ctx, "SELECT * FROM dungeon_tiers WHERE dungeon_id = ? ORDER BY tier", d.dungeon_id), raw) };
  },
};

export function getTool(ctx: Ctx, kind: string, id: Id, includeRaw = false): Row {
  const g = GETTERS[kind];
  if (!g) throw new ToolError(`Unknown kind '${kind}'. Valid kinds: ${Object.keys(GETTERS).join(", ")}`);
  return { kind, ...g(ctx, id, includeRaw) };
}

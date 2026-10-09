/**
 * SKILLS LOADER  (owner: skills agent; nobody else edits this file)
 * =============================================================================
 *
 * export function loadSkills(ctx: LoaderContext): void
 *
 * Runs after loadItems (but must not READ world/items tables: `--only skills` builds run it alone).
 * Everything it needs comes from ctx.raw; names come from ctx.t; stat lines go through
 * ctx.mods.insert(...) / ctx.mods.insertStatBlock(...); other rows through insertRow(ctx.db, ...).
 * Iterate keyed collections with sortedEntries(); arrays in array order. No randomness, no clock.
 *
 * Tables filled (in this order), with raw sources:
 *
 *  1. abilities             LEAbilities.abilityList.<id> (1228). name = t(nameKey) ?? .name;
 *                           description = t(descriptionKey) ?? .description; alt_text = t(altTextKey) ??
 *                           .altText; lore = t(skillLoreKey) ?? .skillLore; is_player_ability /
 *                           player_list_ord from LEAbilities.playerAbilityIdList (183); has_skill_tree =
 *                           LESkillTrees.<id> exists (136); tag_names = ctx.mods.describeTags(tags);
 *                           attack_speed = num(.as); raw_json = rawJson(record, ['prefab']).
 *  2. ability_components    .prefab.components[] (2516), component_type = .type, damage_tags,
 *                           ref_ability_id = first of abilityToInstantiate / ability / abilityToCast /
 *                           alternateAbility; raw_json = the component.
 *  3. ability_links         .comboAbilities[] ('combo', 82) + .sharedCooldownAbilities[] ('shared_cooldown', 47)
 *  4. mods (scaling)        .attributeScaling.<attributeId>[] (885 blocks) -> insertStatBlock with
 *                           sourceKind 'ability_attribute_scaling', sourceId ability id, sourceOrd = running
 *                           index over all attributes (attributes in sortedEntries order), context
 *                           'attribute:<attributeId>' (885 rows);
 *                           .levelScaling[] (145 blocks) -> 'ability_level_scaling', context 'per_level' (179 rows).
 *                           (Optional, no expected count: prefab component `stats[]` / `buffs[].stat` as
 *                           'ability_component', sourceId '<ability>:<ord>'.)
 *  5. ailments              LEAbilities.ailmentList.<id> (148). name = t(displayNameKey) ?? displayName;
 *                           dmg_* = baseDamage.damage[0..6] (DAMAGE_TYPES order), damage_types = names of
 *                           non-zero slots; in_maxroll = MR:ailments[] has a record with that id
 *                           (ctx.raw.maxroll may be null -> NULL).
 *  6. mods (ailment buffs)  .buffs[] (160 blocks) -> insertStatBlock, sourceKind 'ailment_buff',
 *                           sourceId ailment id (161 rows).
 *  7. ui_buffs              UIBuffs.<k> (264); enum_name = key of UIBuffIds with that value.
 *  8. entities              LEAbilities.entityList.<k> (96). (abilities.kind / parent_ability_id are filled just before it, lib/ability-kind.ts)
 *  9. trees                 LESkillTrees.<treeID> (136, kind 'skill', name = ability name, ability_id = .ability),
 *                           LECharTrees.trees[i].characterTree (5, kind 'class', class_id =
 *                           characterClass.classID, name = t(characterClass.classNameKey)),
 *                           LEWeaverTree (1, kind 'weaver', name = t('Skills.Skill_weaver_0_Name'));
 *                           raw_json without `nodes` (and without `characterClass`, which world loads).
 * 10. tree_nodes            .nodes.<id> of each tree (3956 + 541 + 80); names via t(nodeNameKey) etc.;
 *                           UI geometry ui_x/ui_y/ui_w/ui_h = rect[0..3], icon, node_size from
 *                             skill:  LESkillTreesUI.<treeID>.children[] (match nodeId)
 *                             class:  LECharTreesUI.<treeID>.nodes[].children[] (match nodeId)
 *                             weaver: LEWeaverTreeUI.weaver.children[] entries that have nodeId
 *                           (every node has a UI entry in 1.5.2).
 * 11. tree_node_requirements .requirements[] (4577 + 196 + 155 = 4928): required_node_id = .nodeId,
 *                           required_points = .requirement.
 * 12. mods (node stats)     .stats[] -> insertMod per line: sourceKind 'skill_node' (6528) | 'passive_node'
 *                           (1440) | 'weaver_node' (70), sourceId '<treeID>:<nodeId>', sourceOrd = index,
 *                           property = .property, tags = .tags, modifierType null (display-only),
 *                           display = .value, value = parseDisplayValue(.value), label = t(statNameKey),
 *                           labelKey = statNameKey, isDownside = .downside, raw = the stat.
 *                           property_name stays the default (null for 5000+ skill-local ids; label carries the text).
 * 13. relations             node .relatedAbilities[] ('mod_ability', target ability), .relatedAilments[]
 *                           ('mod_ailment'), .triggeredAbilities{id: v} ('triggered_ability', value v),
 *                           .triggeredAilments{id: stacks} ('triggered_ailment', value stacks);
 *                           source_kind = 'skill_node' | 'passive_node' | 'weaver_node', source_id
 *                           '<treeID>:<nodeId>', compact_id NULL. 2775 + 461 + 0 = 3236 rows.
 *
 * mods source kinds written: skill_node, passive_node, weaver_node, ailment_buff,
 * ability_attribute_scaling, ability_level_scaling (+ optional ability_component).
 */
import { classifyAbilities } from "../lib/ability-kind.js";
import { count, modsCount, type ExpectedCount } from "../lib/expected.js";
import type { LoaderContext } from "../lib/context.js";
import { insertRow } from "../lib/sqlite.js";
import { parseDisplayValue } from "../lib/stat-lines.js";
import { DAMAGE_TYPES, bool, int, num, rawJson, sortedEntries, str, type JsonObject } from "../lib/util.js";

/** Tables this loader owns (the build and tests check they exist in schema.sql). */
export const tables = [
  "abilities",
  "ability_components",
  "ability_links",
  "ailments",
  "ui_buffs",
  "entities",
  "trees",
  "tree_nodes",
  "tree_node_requirements",
] as const;

/** Shared tables this loader writes rows into (rows identified by source_kind). */
export const sharedTables = ["mods", "relations"] as const;

/** mods.source_kind values this loader writes. */
export const modSourceKinds = [
  "skill_node",
  "passive_node",
  "weaver_node",
  "ailment_buff",
  "ability_attribute_scaling",
  "ability_level_scaling",
  "ability_component",
] as const;

/** Acceptance counts (docs/data-sources/counts.md; mods counts computed from the 1.5.2 raw data). */
export const expected: ExpectedCount[] = [
  count("abilities", 1228),
  count("abilities", 182, "is_player_ability = 1", "abilities[player]", "playerAbilityIdList has 183 entries but one id is listed twice"),
  count("abilities", 136, "has_skill_tree = 1", "abilities[with tree]"),
  count("ability_components", 2516),
  count("ability_links", 129, undefined, undefined, "combo 82 + shared cooldown 47"),
  count("ailments", 148),
  count("ui_buffs", 264),
  count("entities", 96),
  count("trees", 142),
  count("trees", 136, "tree_kind = 'skill'"),
  count("trees", 5, "tree_kind = 'class'"),
  count("trees", 1, "tree_kind = 'weaver'"),
  count("tree_nodes", 3956, "tree_kind = 'skill'"),
  count("tree_nodes", 541, "tree_kind = 'class'"),
  count("tree_nodes", 80, "tree_kind = 'weaver'"),
  count("tree_nodes", 4577, "ui_x IS NOT NULL", "tree_nodes[with UI position]"),
  count("tree_node_requirements", 4928, undefined, undefined, "4577 + 196 + 155"),
  modsCount("skill_node", 6528),
  modsCount("passive_node", 1440),
  modsCount("weaver_node", 70),
  modsCount("ailment_buff", 161, "160 buff blocks expanded"),
  modsCount("ability_attribute_scaling", 885),
  modsCount("ability_level_scaling", 179, "145 blocks expanded"),
  count("relations", 3236, "source_kind IN ('skill_node','passive_node','weaver_node')", "relations[tree nodes]"),
];

type NodeKind = "skill" | "class" | "weaver";
const NODE_MOD_KIND = { skill: "skill_node", class: "passive_node", weaver: "weaver_node" } as const;

const firstStr = (...vs: unknown[]): string | null => {
  for (const v of vs) if (typeof v === "string" && v !== "") return v;
  return null;
};

export function loadSkills(ctx: LoaderContext): void {
  const { db, t, mods } = ctx;
  const LA = ctx.raw.letools.LEAbilities as JsonObject;
  const skillTrees = ctx.raw.letools.LESkillTrees as Record<string, JsonObject>;

  // 1-3. abilities, components, links
  const playerOrd = new Map<string, number>();
  (LA.playerAbilityIdList as string[]).forEach((id, i) => {
    if (!playerOrd.has(id)) playerOrd.set(id, i); // one id is listed twice: keep the first position
  });
  const abilityEntries = sortedEntries(LA.abilityList as Record<string, JsonObject>);
  for (const [key, a] of abilityEntries) {
    const id = String(a.id ?? key);
    insertRow(db, "abilities", {
      ability_id: id,
      name: t(a.nameKey) ?? str(a.name),
      name_key: str(a.nameKey),
      description: t(a.descriptionKey) ?? str(a.description),
      description_key: str(a.descriptionKey),
      alt_text: t(a.altTextKey) ?? str(a.altText),
      alt_text_key: str(a.altTextKey),
      lore: t(a.skillLoreKey) ?? str(a.skillLore),
      internal_name: str(a.internalName),
      ability_index: int(a.index),
      is_player_ability: playerOrd.has(id) ? 1 : 0,
      player_list_ord: playerOrd.get(id) ?? null,
      has_skill_tree: Object.prototype.hasOwnProperty.call(skillTrees, id) ? 1 : 0,
      tags: int(a.tags),
      tag_names: mods.describeTags(int(a.tags)),
      fake_tags: int(a.fakeTags),
      minion_tags_display: int(a.minionTagsDisplay),
      area_tag_display: int(a.areaTagDisplay),
      conversion_damage_tags: int(a.skillTreeConversionDamageTags),
      mana_cost: num(a.manaCost),
      channel_cost: num(a.channelCost),
      minimum_mana_cost: num(a.minimumManaCost),
      attack_speed: num(a.as),
      use_delay: num(a.useDelay),
      use_duration: num(a.useDuration),
      speed_scaler: int(a.speedScaler),
      speed_multiplier: num(a.speedMultiplier),
      max_charges: num(a.maxCharges),
      charges_gained_per_second: num(a.chargesGainedPerSecond),
      channelled: bool(a.channelled),
      instant_cast: bool(a.instantCastForPlayer),
      is_transform: bool(a.transform),
      is_companion: bool(a.companion),
      is_traversal: bool(a.traversalSkill),
      counts_as_movement: bool(a.countsAsMovementAbility),
      is_combo: bool(a.comboAbility),
      combo_time_limit: num(a.comboTimeLimit),
      sprite: str(a.abilitySprite),
      raw_json: rawJson(a, ["prefab"]),
    });
  }
  for (const [key, a] of abilityEntries) {
    const id = String(a.id ?? key);
    const comps: JsonObject[] = a.prefab?.components ?? [];
    comps.forEach((c, ord) => {
      insertRow(db, "ability_components", {
        ability_id: id,
        ord,
        component_type: String(c.type),
        damage_tags: int(c.damageTags),
        ref_ability_id: firstStr(c.abilityToInstantiate, c.ability, c.abilityToCast, c.alternateAbility),
        raw_json: rawJson(c),
      });
    });
    (a.comboAbilities as string[] | undefined)?.forEach((target, ord) =>
      insertRow(db, "ability_links", { ability_id: id, link_kind: "combo", ord, target_ability_id: target }),
    );
    (a.sharedCooldownAbilities as string[] | undefined)?.forEach((target, ord) =>
      insertRow(db, "ability_links", { ability_id: id, link_kind: "shared_cooldown", ord, target_ability_id: target }),
    );
  }

  // 4. scaling mods
  for (const [key, a] of abilityEntries) {
    const id = String(a.id ?? key);
    let ord = 0;
    for (const [attr, blocks] of sortedEntries(a.attributeScaling as Record<string, JsonObject[]>)) {
      for (const b of blocks) {
        mods.insertStatBlock({ sourceKind: "ability_attribute_scaling", sourceId: id, sourceOrd: ord++, context: `attribute:${attr}` }, b as never);
      }
    }
    ((a.levelScaling as JsonObject[] | undefined) ?? []).forEach((b, i) =>
      mods.insertStatBlock({ sourceKind: "ability_level_scaling", sourceId: id, sourceOrd: i, context: "per_level" }, b as never),
    );
  }

  // 5-6. ailments + buffs
  const mrAilments = (ctx.raw.maxroll as JsonObject | null)?.ailments as JsonObject[] | undefined;
  const mrIds = mrAilments ? new Set(mrAilments.map((x) => Number(x.id))) : null;
  for (const [key, al] of sortedEntries(LA.ailmentList as Record<string, JsonObject>)) {
    const id = int(al.id ?? key) as number;
    const dmg: number[] = al.baseDamage?.damage ?? [];
    insertRow(db, "ailments", {
      ailment_id: id,
      internal_name: String(al.internalName),
      name: t(al.displayNameKey) ?? str(al.displayName),
      name_key: str(al.displayNameKey),
      description: t(al.descriptionKey),
      description_key: str(al.descriptionKey),
      duration: num(al.duration),
      max_instances: int(al.maxInstances),
      positive: bool(al.positive),
      is_curse: bool(al.curse),
      deals_damage: bool(al.dealsDamage),
      tags: int(al.tags),
      tag_names: mods.describeTags(int(al.tags)),
      dmg_physical: num(dmg[0]),
      dmg_fire: num(dmg[1]),
      dmg_cold: num(dmg[2]),
      dmg_lightning: num(dmg[3]),
      dmg_necrotic: num(dmg[4]),
      dmg_void: num(dmg[5]),
      dmg_poison: num(dmg[6]),
      damage_types: DAMAGE_TYPES.filter((_, i) => dmg[i]).join(",") || null,
      shows_in_buff_ui: bool(al.showsInBuffUI),
      spreads: bool(al.spreads),
      max_stacks_that_apply_buffs: int(al.maxStacksThatApplyBuffs),
      icon: str(al.icon),
      in_maxroll: mrIds ? (mrIds.has(id) ? 1 : 0) : null,
      raw_json: rawJson(al),
    });
    ((al.buffs as JsonObject[] | undefined) ?? []).forEach((b, i) =>
      mods.insertStatBlock({ sourceKind: "ailment_buff", sourceId: id, sourceOrd: i }, b as never),
    );
  }

  // 7. ui buffs
  const enumByValue = new Map<number, string>();
  for (const [name, v] of sortedEntries(ctx.raw.letools.UIBuffIds as Record<string, number>)) if (!enumByValue.has(v)) enumByValue.set(v, name);
  for (const [key, b] of sortedEntries(ctx.raw.letools.UIBuffs as Record<string, JsonObject>)) {
    const id = int(b.id ?? key) as number;
    insertRow(db, "ui_buffs", {
      buff_id: id,
      enum_name: enumByValue.get(id) ?? null,
      name: t(b.displayNameKey),
      name_key: str(b.displayNameKey),
      description: t(b.descriptionKey),
      description_key: str(b.descriptionKey),
      positive: bool(b.positive),
      max_instances: int(b.maxInstances),
      icon: str(b.icon),
      raw_json: rawJson(b),
    });
  }

  // 1b. abilities.kind / parent_ability_id (derived, see lib/ability-kind.ts)
  {
    const classes = classifyAbilities(LA.abilityList as Record<string, JsonObject>, (LA.playerAbilityIdList as string[]) ?? [], (LA.entityList ?? {}) as Record<string, JsonObject>);
    const upd = db.prepare("UPDATE abilities SET kind = ?, parent_ability_id = ? WHERE ability_id = ?");
    for (const [abilityId, c] of classes) upd.run(c.kind, c.parent, abilityId);
  }

  // 8. entities
  for (const [key, e] of sortedEntries(LA.entityList as Record<string, JsonObject>)) {
    const d = e.actor?.data ?? {};
    insertRow(db, "entities", {
      entity_id: int(key),
      gen_id: str(d.genId),
      name: t(d.nameKey),
      name_key: str(d.nameKey),
      raw_json: rawJson(e),
    });
  }

  // 9-13. trees, nodes, requirements, node stats, node relations
  const abilityName = new Map<string, string | null>();
  for (const [key, a] of abilityEntries) abilityName.set(String(a.id ?? key), t(a.nameKey) ?? str(a.name));

  const skillUi = ctx.raw.letools.LESkillTreesUI as Record<string, JsonObject>;
  const charUi = ctx.raw.letools.LECharTreesUI as Record<string, JsonObject>;
  const weaverUi = ctx.raw.letools.LEWeaverTreeUI as JsonObject;

  const addTree = (kind: NodeKind, tree: JsonObject, name: string | null, extra: JsonObject, omit: string[], ui: Map<number, JsonObject>): void => {
    const treeId = String(tree.treeID);
    const nodes = sortedEntries((tree.nodes ?? {}) as Record<string, JsonObject>);
    insertRow(db, "trees", {
      tree_id: treeId,
      tree_kind: kind,
      name,
      ability_id: extra.ability_id ?? null,
      class_id: extra.class_id ?? null,
      version: int(tree.version),
      node_count: nodes.length,
      raw_json: rawJson(tree, ["nodes", ...omit]),
    });
    for (const [key, n] of nodes) {
      const nodeId = int(n.id ?? key) as number;
      const u = ui.get(nodeId);
      const rect: number[] = u?.rect ?? [];
      const stats: JsonObject[] = n.stats ?? [];
      insertRow(db, "tree_nodes", {
        tree_id: treeId,
        node_id: nodeId,
        tree_kind: kind,
        name: t(n.nodeNameKey),
        name_key: str(n.nodeNameKey),
        description: t(n.descriptionKey),
        description_key: str(n.descriptionKey),
        alt_text: t(n.altTextKey),
        lore: t(n.loreTextKey),
        point_bonus_description: t(n.pointBonusDescriptionKey),
        max_points: int(n.maxPoints),
        mastery: int(n.mastery),
        mastery_requirement: int(n.masteryRequirement),
        no_scaling_type: bool(n.noScalingType),
        no_scaling_point_threshold: int(n.noScalingPointThreshold),
        lock_node: bool(n.lockNode),
        base_lock_node: bool(n.baseLockNode),
        ui_x: u ? num(rect[0]) : null,
        ui_y: u ? num(rect[1]) : null,
        ui_w: u ? num(rect[2]) : null,
        ui_h: u ? num(rect[3]) : null,
        icon: str(u?.icon),
        node_size: int(u?.nodeSize),
        stat_count: stats.length,
        raw_json: rawJson(n),
      });
    }
    const sourceKind = NODE_MOD_KIND[kind];
    for (const [key, n] of nodes) {
      const nodeId = int(n.id ?? key) as number;
      const sourceId = `${treeId}:${nodeId}`;
      ((n.requirements as JsonObject[] | undefined) ?? []).forEach((r, ord) =>
        insertRow(db, "tree_node_requirements", {
          tree_id: treeId,
          node_id: nodeId,
          ord,
          required_node_id: int(r.nodeId),
          required_points: int(r.requirement),
        }),
      );
      ((n.stats as JsonObject[] | undefined) ?? []).forEach((s, i) =>
        mods.insert({
          sourceKind,
          sourceId,
          sourceOrd: i,
          property: int(s.property),
          tags: int(s.tags) ?? 0,
          modifierType: null,
          display: str(s.value),
          value: parseDisplayValue(s.value),
          label: t(s.statNameKey),
          labelKey: str(s.statNameKey),
          isDownside: bool(s.downside),
          noScaling: bool(s.noScaling),
          raw: s,
        }),
      );
      const rel = (relation: string, targetKind: "ability" | "ailment", target: unknown, value: number | null): void => {
        insertRow(db, "relations", {
          source_kind: sourceKind,
          source_id: sourceId,
          source_sub: null,
          relation,
          target_kind: targetKind,
          target_id: String(target),
          value,
          compact_id: null,
        });
      };
      for (const x of (n.relatedAbilities as unknown[] | undefined) ?? []) rel("mod_ability", "ability", x, null);
      for (const x of (n.relatedAilments as unknown[] | undefined) ?? []) rel("mod_ailment", "ailment", x, null);
      for (const [k, v] of sortedEntries((n.triggeredAbilities ?? {}) as Record<string, unknown>)) rel("triggered_ability", "ability", k, int(v));
      for (const [k, v] of sortedEntries((n.triggeredAilments ?? {}) as Record<string, unknown>)) rel("triggered_ailment", "ailment", k, int(v));
    }
  };

  for (const [, tree] of sortedEntries(skillTrees)) {
    const ui = new Map<number, JsonObject>();
    for (const c of (skillUi[String(tree.treeID)]?.children ?? []) as JsonObject[]) if (c.nodeId !== undefined) ui.set(Number(c.nodeId), c);
    const abilityId = str(tree.ability);
    addTree("skill", tree, abilityId ? (abilityName.get(abilityId) ?? null) : null, { ability_id: abilityId }, [], ui);
  }

  const charTrees = (ctx.raw.letools.LECharTrees as JsonObject).trees as JsonObject[];
  for (const entry of charTrees) {
    const tree = entry.characterTree as JsonObject;
    const cc = (tree.characterClass ?? {}) as JsonObject;
    const ui = new Map<number, JsonObject>();
    for (const grp of (charUi[String(tree.treeID)]?.nodes ?? []) as JsonObject[])
      for (const c of (grp.children ?? []) as JsonObject[]) if (c.nodeId !== undefined) ui.set(Number(c.nodeId), c);
    addTree("class", tree, t(cc.classNameKey), { class_id: int(cc.classID) }, ["characterClass"], ui);
  }

  const weaver = ctx.raw.letools.LEWeaverTree as JsonObject;
  const wui = new Map<number, JsonObject>();
  for (const c of (weaverUi.weaver?.children ?? []) as JsonObject[]) if (c.nodeId !== undefined) wui.set(Number(c.nodeId), c);
  addTree("weaver", weaver, t("Skills.Skill_weaver_0_Name"), {}, [], wui);
}

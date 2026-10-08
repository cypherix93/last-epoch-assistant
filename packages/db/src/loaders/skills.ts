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
 *  8. entities              LEAbilities.entityList.<k> (96).
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
import { count, modsCount, type ExpectedCount } from "../lib/expected.js";
import type { LoaderContext } from "../lib/context.js";

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
  count("abilities", 183, "is_player_ability = 1", "abilities[player]"),
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

export function loadSkills(ctx: LoaderContext): void {
  void ctx;
  throw new Error("not implemented: skills");
}

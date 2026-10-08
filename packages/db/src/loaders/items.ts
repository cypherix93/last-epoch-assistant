/**
 * ITEMS LOADER  (owner: items agent; nobody else edits this file)
 * =============================================================================
 *
 * export function loadItems(ctx: LoaderContext): void
 *
 * Runs after loadWorld (but must not READ world tables: `--only items` builds run it alone).
 * Everything it needs comes from ctx.raw; names come from ctx.t; stat lines go through
 * ctx.mods.insert(...) / ctx.mods.insertStatBlock(...); other rows through insertRow(ctx.db, ...).
 * Iterate keyed collections with sortedEntries(); arrays in array order. No randomness, no clock.
 *
 * Tables filled (in this order), with raw sources:
 *
 *  1. item_base_types       itemDB.itemList.equippable.<k> (39) + itemDB.itemList.nonEquippable.<k> (9)
 *                           name = t(displayNameKey); category from itemList.lootFilterVisualCategories
 *                           (header names via t(categories[].nameKey)); 'Blessing' for 34, 'Lens' for 35..39
 *                           and 109, 'Idol Altar' for 41; is_idol = 25..33; disabled_to_roll from
 *                           itemList.disabledBaseTypesToRoll; raw_json = rawJson(record, ['subItems']).
 *                           Non-equippable records have no baseTypeId field: use the object key.
 *  2. item_subtypes         <baseType>.subItems.<k> (918 + 640 = 1558); class_requirement_names via
 *                           classRequirementNames(); letools_compact_id = implicitCompactId(base, sub, 0);
 *                           lens_effect = t(lensEffectKey) ?? lensEffect; implicit_count.
 *  3. mods (implicits)      subItems[].implicits[] (1529 lines): one insertMod per line with
 *                           modifierType = .type, valueMin = .implicitValue, valueMax = .implicitMaxValue,
 *                           sourceId '<base>:<sub>', sourceOrd = index, sourceKind:
 *                             'blessing'   for base type 34 (234 lines)
 *                             'idol_altar' for base type 41 (11 lines)
 *                             'implicit'   otherwise (1284 lines)
 *  4. affix_display_categories  itemDB.affixList.displayCategoryKeys[] (45) + categoryHeaders[] (12)
 *  5. affixes               itemDB.affixList.singleAffixes.<k> (616, kind 'single') and
 *                           .multiAffixes.<k> (540, kind 'multi'), merged and sorted by affix_id (1156);
 *                           name = t(affixDisplayNameKey), title = t(affixTitleKey), filter_name =
 *                           t(lootFilterOverrideNameKey); affix_type_name 'prefix'/'suffix' from .type;
 *                           class_names via classSpecificityNames(); letools_compact_id = affixCompactId(id);
 *                           for_unique_id 0 -> NULL.
 *  6. affix_stats           .affixProperties[] (1696): label = t(modDisplayNameKey),
 *                           property_name = ctx.mods.lineName(property, tags, specialTag)
 *  7. affix_tiers           .tiers[] (6238), tier = index + 1
 *  8. mods (affix rolls)    .tiers[t].rolls[i] (9711 rows): sourceKind 'affix_tier', sourceId affix_id,
 *                           sourceOrd i (== affix_stats.ord), tier t+1, property/specialTag/tags/extraTag/
 *                           modifierType from affixProperties[i], valueMin = roll.min, valueMax = roll.max,
 *                           label = t(affixProperties[i].modDisplayNameKey), raw = the roll object
 *                           merged with the property line ({...affixProperties[i], ...roll}).
 *  9. affix_can_roll_on     .canRollOn[] (2539)
 * 10. affix_reroll_chances  .specificRerollChances[] (201)
 * 11. sets                  itemDB.setBonusList[] (25, includes set 0); set_name = .setName ??
 *                           itemDB.setNames.<id>; letools_compact_id = setCompactId(id); item_count
 *                           filled after uniques (UPDATE ... count of uniques.set_id).
 * 12. mods (set bonuses)    setBonusList[].mods[] (54): sourceKind 'set_bonus', sourceId set_id,
 *                           modifierType = .type, value = .value, setRequirement = .setRequirement,
 *                           hidden = .hideInTooltip
 * 13. set_tooltips          setBonusList[].tooltipDescriptions[] (18)
 * 14. uniques               itemDB.uniqueList.uniques.<k> (486); set_id NULL unless isSetItem;
 *                           sub_type_id = subTypeIds[0]; mod_count.
 * 15. unique_subtypes       .subTypeIds[] (486)
 * 16. mods (unique mods)    .mods[] (2440): sourceKind 'unique_mod', sourceId unique_id, sourceOrd =
 *                           index (tooltipEntries modDisplay < 128 refers to it), modifierType = .type,
 *                           valueMin = .value, valueMax = .maxValue, hidden = .hideInTooltip
 * 17. unique_tooltips       .tooltipDescriptions[] (562)
 * 18. unique_tooltip_entries .tooltipEntries[] (2459); ref_kind 'mod' when modDisplay < 128 else
 *                           'description' with ref_index = modDisplay - 128
 * 19. idol_altars           equippable.41.subItems (13), grid_index = position in ascending sub type
 *                           order into itemDB.altarGrids.grids[] (13), default_grid_json = defaultGrid
 * 20. blessings             equippable.34.subItems (224); timeline_id / difficulty_index / slot_kind
 *                           from the FIRST occurrence when scanning timelineData in sortedEntries order,
 *                           difficulties[] in order, lists in the order first, other, any;
 *                           is_grand = difficulty_index = 1. (Every blessing is in exactly one timeline.)
 * 21. relations             itemDB.relModAbilities ('mod_ability'), relModAilments ('mod_ailment'),
 *                           relIncLevelAbilities ('inc_level_ability'), triggeredAbilities
 *                           ('triggered_ability', value = map value), triggeredAilments
 *                           ('triggered_ailment', value = stacks). Keys decoded with decodeCompactId():
 *                           source_kind 'affix' (A) | 'unique' (U, source_sub = line digits) |
 *                           'set' (S) | 'implicit' (I, source_id '<base>:<sub>', source_sub = implicit index);
 *                           compact_id = the key. Skip itemDB.relatedAbilities (identical to relModAbilities).
 *                           2207 rows.
 * 22. compact_ids           every distinct key of the five maps above (1014): decodeCompactId(),
 *                           resolves = target row exists. Use insertRow(..., { conflict: 'ignore' }).
 *
 * mods source kinds written: affix_tier, implicit, blessing, idol_altar, unique_mod, set_bonus.
 */
import { count, modsCount, type ExpectedCount } from "../lib/expected.js";
import type { LoaderContext } from "../lib/context.js";

/** Tables this loader owns (the build and tests check they exist in schema.sql). */
export const tables = [
  "item_base_types",
  "item_subtypes",
  "affix_display_categories",
  "affixes",
  "affix_stats",
  "affix_tiers",
  "affix_can_roll_on",
  "affix_reroll_chances",
  "sets",
  "set_tooltips",
  "uniques",
  "unique_subtypes",
  "unique_tooltips",
  "unique_tooltip_entries",
  "idol_altars",
  "blessings",
] as const;

/** Shared tables this loader writes rows into (rows identified by source_kind / kind). */
export const sharedTables = ["mods", "relations", "compact_ids"] as const;

/** mods.source_kind values this loader writes. */
export const modSourceKinds = ["affix_tier", "implicit", "blessing", "idol_altar", "unique_mod", "set_bonus"] as const;

/** Acceptance counts (docs/data-sources/counts.md; mods counts computed from the 1.5.2 raw data). */
export const expected: ExpectedCount[] = [
  count("item_base_types", 48, undefined, undefined, "equippable 39 + nonEquippable 9"),
  count("item_subtypes", 1558, undefined, undefined, "918 + 640"),
  count("affix_display_categories", 45),
  count("affixes", 1156, undefined, undefined, "single 616 + multi 540"),
  count("affixes", 616, "kind = 'single'"),
  count("affix_stats", 1696),
  count("affix_tiers", 6238),
  count("affix_can_roll_on", 2539),
  count("affix_reroll_chances", 201),
  count("sets", 25, undefined, undefined, "setBonusList incl. set 0"),
  count("set_tooltips", 18),
  count("uniques", 486),
  count("uniques", 61, "is_set_item = 1"),
  count("unique_subtypes", 486),
  count("unique_tooltips", 562),
  count("unique_tooltip_entries", 2459),
  count("idol_altars", 13),
  count("blessings", 224),
  count("blessings", 224, "timeline_id IS NOT NULL", "blessings[with timeline]"),
  modsCount("affix_tier", 9711, "sum of tiers[].rolls[]"),
  modsCount("implicit", 1284),
  modsCount("blessing", 234),
  modsCount("idol_altar", 11),
  {
    name: "implicits (all kinds)",
    sql: "SELECT count(*) FROM mods WHERE source_kind IN ('implicit','blessing','idol_altar')",
    expected: 1529,
    source: "counts.md implicits",
  },
  modsCount("unique_mod", 2440),
  modsCount("set_bonus", 54),
  count("relations", 2207, "source_kind IN ('affix','unique','set','implicit')", "relations[items]"),
  { name: "compact_ids[A,U,S,I]", sql: "SELECT count(*) FROM compact_ids WHERE kind IN ('A','U','S','I')", expected: 1014, op: ">=" },
];

export function loadItems(ctx: LoaderContext): void {
  void ctx;
  throw new Error("not implemented: items");
}

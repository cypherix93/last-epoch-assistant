/**
 * WORLD LOADER  (owner: world agent; nobody else edits this file, nor src/crosscheck.ts)
 * =============================================================================
 *
 * export function loadWorld(ctx: LoaderContext): void
 *
 * Runs FIRST (before items and skills). Everything it needs comes from ctx.raw; names come from
 * ctx.t; stat lines go through ctx.mods.insertStatBlock(...); other rows through insertRow(ctx.db, ...).
 * Iterate keyed collections with sortedEntries(); arrays in array order. No randomness, no clock.
 *
 * Tables filled (in this order), with raw sources:
 *
 *  1. i18n                  i18n.en.json (34,993 keys, sorted by key): section = text before the first
 *                           '.', text = unescapeIcu(value), raw_text = value when it differs, else NULL.
 *                           Empty strings are kept (text '').
 *  2. enums                 AT, SP, LocalSP, AilmentID, UIBuffIds, BuffId, BuffPropId, CustomConditionType
 *                           (910 rows = 30+134+17+151+265+95+195+23).
 *  3. tag_bits              AT (30): bit = log2(value), NULL for None.
 *  4. stat_properties       one row per SP (134) and LocalSP (17) id = 151 rows; display fields from
 *                           coreDB.propertyList (113, matched on .property; has_display_rule = 1, list_index);
 *                           name = t(propertyNameKey); is_indirect = 1 for 58, 98, 130 (and 88, see the
 *                           column comment); maxroll_name = MR:properties[].propertyName (matched on
 *                           .property, NULL when Maxroll absent); raw_json = the propertyList entry or
 *                           {"enum": name, "value": id} for ids without display rules.
 *  5. stat_property_alt_texts coreDB.propertyList[].altTextOverrides[] (162); alt_text =
 *                           t('Properties.' + altTextKey) ?? t(altTextKey).
 *  6. player_properties     coreDB.playerPropertyList[] (713)
 *  7. ability_properties    coreDB.abilityPropertyList[].properties[] (2344 rows over 177 abilities);
 *                           ability_id = id of the LEAbilities.abilityList record whose .index == abilityID.
 *  8. idol_altar_properties coreDB.idolAltarPropertyList.list[] (31)
 *  9. conditional_properties coreDB.conditionalDamagePropertyDescriptionKeys[] + ...NonDamage...[] (48)
 * 10. attributes            coreDB.coreAttributes.<k> (5): name = SP name of 19 + k.
 * 11. mods (attributes)     coreAttributes[k].stats[] -> insertStatBlock sourceKind 'attribute' (7 rows),
 *                           .corruptedStats[] -> 'attribute_corrupted' (10 rows); sourceId k.
 * 12. classes               LECharTrees.trees[].characterTree.characterClass (5). LE Tools HAS the base
 *                           stats (baseHealth, baseMana, ...), so Maxroll is used only for
 *                           endurance_threshold_per_health (MR:classes[classID].enduranceThresholdPerHealth).
 *                           description = t(LECharTreesUI.<treeID>.info[0].classDescriptionKey).
 * 13. masteries             characterClass.masteries[] (20); description from LECharTreesUI.<tree>.info[i];
 *                           passive_bonus_labels = t() of info[i].passiveBonusKeys joined by '\n'.
 * 14. class_abilities       characterClass.defaultAbilities[] ('default'), knownAbilities[] ('known'),
 *                           unlockableAbilities[] ('unlockable', level), masteries[i].abilities[]
 *                           ('mastery', mastery_index i, level) = 156 rows.
 * 15. monster_mods          monsterMods.<compactId> (287), mod_id = decodeCompactId(key).value.
 * 16. mods (monster mods)   monsterMods[].stats[] -> insertStatBlock sourceKind 'monster_mod', sourceId mod_id (432 rows).
 * 17. compact_ids           kind M for every monsterMods key (287) + every other compact id seen in
 *                           timelineData / dungeonData / arenaData / checklist (conflict 'ignore').
 * 18. timelines             timelineData.<id> (10), raw_json without difficulties/mods/empoweredMods.
 * 19. timeline_difficulties timelineData[].difficulties[] (20); corruption_mod_id = decoded modFromCorruption.
 * 20. timeline_blessings    difficulties[].firstSlotBlessings ('first') / otherSlotBlessings ('other') /
 *                           anySlotBlessings ('any') (224 refs).
 * 21. endgame_mod_refs      timelineData[].mods[] ('mods', 238) and .empoweredMods[] ('empoweredMods', 215);
 *                           dungeonData[].tiers[t].{startingMods, otherFloorExitMods, penultimateFloorExitMods}
 *                           (283); arenaData[].tiers[t].startingMods + .modPools[i].{first,second,any}OptionMods
 *                           (119, list_name 'modPools[<i>].firstOptionMods' etc., wave_offered_after) = 855.
 * 22. dungeons, dungeon_tiers   dungeonData.<id> (3) / .tiers[] (12)
 * 23. arenas, arena_tiers       arenaData.<id> (2) / .tiers[] (5)
 * 24. monolith_rewards          monolithRewards.monolithRewards[] (57)
 * 25. monolith_reward_groups    monolithRewards.monolithRewardRollGroups[] (25)
 * 26. woven_echoes              wovenEchoList[] (47)
 * 27. factions, faction_ranks   factionList[] (4) / .reputationReqForNextRanks[] (44, rank = index + 1)
 * 28. prophecy_unlocks          prophecyData.slotUnlockRanks[] ('slot', 4), .lensUnlockRanks[] ('lens', 12),
 *                               merchantsGuildBagData.bagUnlockRanks[] ('bag', 12) = 28
 * 29. scenes                    itemDB.sceneList.<code> (385)
 * 30. maxroll_quests            MR:quests[] (145) + LE Tools checklist.questList.<id> (36) columns.
 *                               Skip (0 rows) when ctx.raw.maxroll is null.
 * 31. raw_globals               globals without a normalized table (34 rows):
 *                               letools: LEHUD, LETooltipIcons, passiveBonuses, skillBonuses, partialSkillBonuses,
 *                                 vaultsOfUncertainFate, dropBossLoot, checklist, lootFilterIcons,
 *                                 lootFilterIconColors, lootFilterRuleColors, lootFilterBeamColors, masterColors;
 *                               'itemDB.<k>' for monsterItemDrops, oneShotCaches, championDataList,
 *                                 randomEncounterData, factionGamblerItems, customDrops, customPersonalItems,
 *                                 bagContents, questRewards, fracturedUniques;
 *                               'coreDB.<k>' for defaultProperty, extraStatData, corruptionOutcomeConfig;
 *                               'LEAbilities.<k>' for invocations, runeIcons, ailmentTriggeredAilments,
 *                                 ailmentTriggeredAbilities, passivePointsFromQuests, attributePointsFromQuests;
 *                               maxroll (source 'maxroll'): 'maxroll.stats', 'maxroll.lootFilterData'.
 *
 * Also owned by the world agent: src/crosscheck.ts (runCrosscheck), which fills maxroll_crosscheck.
 *
 * mods source kinds written: monster_mod, attribute, attribute_corrupted.
 */
import { count, modsCount, type ExpectedCount } from "../lib/expected.js";
import type { LoaderContext } from "../lib/context.js";

/** Tables this loader owns (the build and tests check they exist in schema.sql). */
export const tables = [
  "i18n",
  "enums",
  "tag_bits",
  "stat_properties",
  "stat_property_alt_texts",
  "player_properties",
  "ability_properties",
  "idol_altar_properties",
  "conditional_properties",
  "attributes",
  "classes",
  "masteries",
  "class_abilities",
  "monster_mods",
  "timelines",
  "timeline_difficulties",
  "timeline_blessings",
  "endgame_mod_refs",
  "dungeons",
  "dungeon_tiers",
  "arenas",
  "arena_tiers",
  "monolith_rewards",
  "monolith_reward_groups",
  "woven_echoes",
  "factions",
  "faction_ranks",
  "prophecy_unlocks",
  "scenes",
  "maxroll_quests",
  "maxroll_crosscheck",
  "raw_globals",
] as const;

/** Shared tables this loader writes rows into. */
export const sharedTables = ["mods", "compact_ids"] as const;

/** mods.source_kind values this loader writes. */
export const modSourceKinds = ["monster_mod", "attribute", "attribute_corrupted"] as const;

/** Acceptance counts (docs/data-sources/counts.md; derived counts computed from the 1.5.2 raw data). */
export const expected: ExpectedCount[] = [
  count("i18n", 34993),
  count("enums", 910),
  count("tag_bits", 30),
  count("stat_properties", 151, undefined, undefined, "SP 134 + LocalSP 17"),
  count("stat_properties", 113, "has_display_rule = 1", "stat_properties[with display rule]"),
  count("stat_property_alt_texts", 162),
  count("player_properties", 713),
  count("ability_properties", 2344),
  { name: "ability_properties[abilities]", sql: "SELECT count(DISTINCT ability_index) FROM ability_properties", expected: 177 },
  count("idol_altar_properties", 31),
  count("conditional_properties", 48),
  count("attributes", 5),
  modsCount("attribute", 7),
  modsCount("attribute_corrupted", 10),
  count("classes", 5),
  count("masteries", 20),
  count("class_abilities", 156),
  count("monster_mods", 287),
  modsCount("monster_mod", 432),
  count("compact_ids", 287, "kind = 'M'", "compact_ids[M]"),
  count("timelines", 10),
  count("timeline_difficulties", 20),
  count("timeline_blessings", 224),
  count("endgame_mod_refs", 855, undefined, undefined, "timeline 453 + dungeon 283 + arena 119"),
  count("dungeons", 3),
  count("dungeon_tiers", 12),
  count("arenas", 2),
  count("arena_tiers", 5),
  count("monolith_rewards", 57),
  count("monolith_reward_groups", 25),
  count("woven_echoes", 47),
  count("factions", 4),
  count("faction_ranks", 44),
  count("prophecy_unlocks", 28),
  count("scenes", 385),
  count("maxroll_quests", 145),
  count("raw_globals", 34),
];

export function loadWorld(ctx: LoaderContext): void {
  void ctx;
  throw new Error("not implemented: world");
}

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
import { decodeCompactId } from "../lib/ids.js";
import { unescapeIcu } from "../lib/raw.js";
import { insertRow } from "../lib/sqlite.js";
import { bool, int, num, rawJson, sortedEntries, sortedKeys, str, type JsonObject } from "../lib/util.js";

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
  { name: "ability_properties[abilities]", sql: "SELECT count(DISTINCT ability_index) FROM ability_properties", expected: 175, source: "177 abilityPropertyList entries, 2 (abilityID 0 and 803) have no properties" },
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

type Obj = JsonObject;

const joinNonEmpty = (parts: (string | null)[], sep: string): string | null => {
  const p = parts.filter((x): x is string => x !== null);
  return p.length ? p.join(sep) : null;
};

/** Decode a monster-mod compact id to its numeric mod id (null when it is not an 'M' id). */
function modIdOf(compact: string | null | undefined): number | null {
  if (!compact) return null;
  try {
    const d = decodeCompactId(compact);
    return d.kind === "M" ? Number(d.value) : null;
  } catch {
    return null;
  }
}

export function loadWorld(ctx: LoaderContext): void {
  const { db, raw, t } = ctx;
  const L = raw.letools;
  const core = L.coreDB;

  // 1. i18n -----------------------------------------------------------------
  for (const k of sortedKeys(raw.i18n)) {
    const v = raw.i18n[k]!;
    const text = unescapeIcu(v);
    const dot = k.indexOf(".");
    insertRow(db, "i18n", { key: k, section: dot < 0 ? k : k.slice(0, dot), text, raw_text: text !== v ? v : null });
  }

  // 2. enums, 3. tag_bits ---------------------------------------------------
  const enumGlobals = ["AT", "SP", "LocalSP", "AilmentID", "UIBuffIds", "BuffId", "BuffPropId", "CustomConditionType"] as const;
  for (const g of enumGlobals) {
    for (const [name, value] of sortedEntries(L[g] as Record<string, number>)) {
      insertRow(db, "enums", { enum_name: g, name, value });
    }
  }
  for (const [name, value] of Object.entries(L.AT).sort((a, b) => a[1] - b[1])) {
    insertRow(db, "tag_bits", { value, bit: value > 0 ? Math.round(Math.log2(value)) : null, name });
  }

  // 4. stat_properties ------------------------------------------------------
  const propByIdx = new Map<number, Obj>();
  core.propertyList.forEach((p, i) => propByIdx.set(p.property, { ...p, _index: i }));
  const mrProps = new Map<number, string>();
  for (const p of raw.maxroll?.properties ?? []) mrProps.set(p.property as number, p.propertyName as string);
  const spNames = new Map<number, string>();
  const spRows: { id: number; name: string; source: "SP" | "LocalSP" }[] = [];
  for (const [name, id] of sortedEntries(L.SP)) spRows.push({ id, name, source: "SP" });
  for (const [name, id] of sortedEntries(L.LocalSP)) spRows.push({ id, name, source: "LocalSP" });
  spRows.sort((a, b) => a.id - b.id);
  for (const r of spRows) spNames.set(r.id, r.name);
  for (const r of spRows) {
    const p = propByIdx.get(r.id);
    const rawP = p ? Object.fromEntries(Object.entries(p).filter(([k]) => k !== "_index")) : null;
    insertRow(db, "stat_properties", {
      property: r.id,
      enum_name: r.name,
      enum_source: r.source,
      name: p ? t(p.propertyNameKey) : null,
      name_key: p ? str(p.propertyNameKey) : null,
      alt_text: p ? t(p.altTextKey) : null,
      alt_text_key: p ? str(p.altTextKey) : null,
      has_display_rule: p ? 1 : 0,
      list_index: p ? p._index : null,
      is_indirect: r.id === 58 || r.id === 98 || r.id === 130 ? 1 : 0,
      round_added_to_int: p ? int(p.roundAddedToInt) : null,
      rounding_for_more: p ? int(p.roundingForMore) : null,
      display_added_as_percentage: p ? int(p.displayAddedAsPercentage) : null,
      display_as_percentage_of: p ? int(p.displayAsPercentageOf) : null,
      display_added_as_tenth_of_value: p ? int(p.displayAddedAsTenthOfValue) : null,
      display_as_added_to: p ? int(p.displayAsAddedTo) : null,
      dont_display_plus: p ? int(p.dontDisplayPlus) : null,
      hide_modifier_value: p ? int(p.hideModifierValue) : null,
      name_includes_modifier: p ? int(p.nameIncludesModifier) : null,
      maxroll_name: mrProps.get(r.id) ?? null,
      raw_json: rawP ? rawJson(rawP) : JSON.stringify({ enum: r.name, value: r.id }),
    });
  }

  // 5. stat_property_alt_texts (override texts are not in i18n; Maxroll carries the resolved English) --
  const mrAlt = new Map<string, string>();
  for (const p of raw.maxroll?.properties ?? []) {
    for (const o of (p.altTextOverrides as Obj[] | undefined) ?? []) {
      if (o.overrideAltTextKey && o.overrideAltText) mrAlt.set(String(o.overrideAltTextKey), String(o.overrideAltText));
    }
  }
  for (const p of core.propertyList) {
    (p.altTextOverrides ?? []).forEach((o, i) => {
      const key = str(o.altTextKey);
      insertRow(db, "stat_property_alt_texts", {
        property: p.property,
        ord: i,
        modifier_type: o.modType,
        special_tag: o.specialTag,
        tags: o.tags,
        tag_names: ctx.mods.describeTags(o.tags),
        dont_display_plus: int(o.dontDisplayPlus),
        alt_text_key: key,
        alt_text: key ? (t(`Properties.${key}`) ?? t(key) ?? mrAlt.get(key) ?? null) : null,
      });
    });
  }

  // 6. player_properties ----------------------------------------------------
  core.playerPropertyList.forEach((p, idx) => {
    insertRow(db, "player_properties", {
      idx,
      name: t(p.propertyNameKey),
      name_key: str(p.propertyNameKey),
      alt_text: t(p.altTextKey),
      alt_text_key: str(p.altTextKey),
      round_added_to_int: int(p.roundAddedToInt),
      rounding_for_more: int(p.roundingForMore),
      display_added_as_percentage: int(p.displayAddedAsPercentage),
      less_is_better: int((p as Obj).lessIsBetter),
      raw_json: rawJson(p),
    });
  });

  // 7. ability_properties ---------------------------------------------------
  const abilityIdByIndex = new Map<number, string>();
  for (const [id, a] of sortedEntries(L.LEAbilities.abilityList)) {
    if (a.index !== null && a.index !== undefined && !abilityIdByIndex.has(a.index)) abilityIdByIndex.set(a.index, id);
  }
  for (const ap of core.abilityPropertyList) {
    ap.properties.forEach((p, i) => {
      insertRow(db, "ability_properties", {
        ability_index: ap.abilityID,
        prop_index: i,
        ability_id: abilityIdByIndex.get(ap.abilityID) ?? null,
        name: t(p.propertyNameKey),
        name_key: str(p.propertyNameKey),
        alt_text: t(p.altTextKey),
        alt_text_key: str(p.altTextKey),
        round_added_to_int: int(p.roundAddedToInt),
        rounding_for_more: int(p.roundingForMore),
        display_added_as_percentage: int(p.displayAddedAsPercentage),
        less_is_better: int((p as Obj).lessIsBetter),
        raw_json: rawJson(p),
      });
    });
  }

  // 8. idol_altar_properties ------------------------------------------------
  core.idolAltarPropertyList.list.forEach((p, idx) => {
    insertRow(db, "idol_altar_properties", {
      idx,
      name: t(p.propertyNameKey),
      name_key: str(p.propertyNameKey),
      alt_text: t(p.altTextKey),
      alt_text_key: str(p.altTextKey),
      round_added_to_int: int(p.roundAddedToInt),
      display_added_as_percentage: int(p.displayAddedAsPercentage),
      raw_json: rawJson(p),
    });
  });

  // 9. conditional_properties -----------------------------------------------
  const dmgKeys = core.conditionalDamagePropertyDescriptionKeys;
  const nonKeys = core.conditionalNonDamagePropertyDescriptionKeys;
  for (let i = 0; i < Math.max(dmgKeys.length, nonKeys.length); i++) {
    insertRow(db, "conditional_properties", {
      idx: i,
      damage_description_key: str(dmgKeys[i]),
      damage_description: t(dmgKeys[i]),
      non_damage_description_key: str(nonKeys[i]),
      non_damage_description: t(nonKeys[i]),
      raw_json: JSON.stringify({ damage: dmgKeys[i] ?? null, nonDamage: nonKeys[i] ?? null }),
    });
  }

  // 10-11. attributes + their mods -------------------------------------------
  for (const [k, a] of sortedEntries(core.coreAttributes)) {
    const id = Number(k);
    insertRow(db, "attributes", {
      attribute_id: id,
      name: spNames.get(19 + id) ?? `Attribute${id}`,
      property: 19 + id,
      raw_json: rawJson(a),
    });
    (a.stats ?? []).forEach((s, i) => ctx.mods.insertStatBlock({ sourceKind: "attribute", sourceId: k, sourceOrd: i, raw: s }, s));
    (a.corruptedStats ?? []).forEach((s, i) =>
      ctx.mods.insertStatBlock({ sourceKind: "attribute_corrupted", sourceId: k, sourceOrd: i, raw: s }, s),
    );
  }

  // 12-14. classes, masteries, class_abilities -------------------------------
  const mrClasses = new Map<number, Obj>();
  for (const c of raw.maxroll?.classes ?? []) mrClasses.set(c.classID as number, c);
  for (const tree of L.LECharTrees.trees) {
    const c = tree.characterTree.characterClass as Obj;
    const ui = L.LECharTreesUI[c.treeID as string];
    const classId = c.classID as number;
    insertRow(db, "classes", {
      class_id: classId,
      name: t(c.classNameKey) ?? String(c.classNameKey),
      name_key: str(c.classNameKey),
      description: t(ui?.info?.[0]?.classDescriptionKey),
      tree_id: c.treeID,
      base_health: num(c.baseHealth),
      base_mana: num(c.baseMana),
      health_per_level: num(c.healthPerLevel),
      mana_per_level: num(c.manaPerLevel),
      health_regen: num(c.healthRegen),
      mana_regen: num(c.manaRegen),
      health_regen_per_level: num(c.healthRegenPerLevel),
      base_strength: int(c.baseStrength),
      base_vitality: int(c.baseVitality),
      base_intelligence: int(c.baseIntelligence),
      base_dexterity: int(c.baseDexterity),
      base_attunement: int(c.baseAttunement),
      base_stun_avoidance: num(c.baseStunAvoidance),
      base_endurance: num(c.baseEndurance),
      base_endurance_threshold: num(c.baseEnduranceThreshold),
      endurance_threshold_per_level: num(c.enduranceThresholdPerLevel),
      endurance_threshold_per_health: num(mrClasses.get(classId)?.enduranceThresholdPerHealth),
      first_level_for_minion_scaling: int(c.firstLevelForMinionScaling),
      more_minion_damage_per_level: num(c.moreMinionDamagePerLevel),
      less_minion_damage_taken_per_level: num(c.lessMinionDamageTakenPerLevel),
      basic_attack_replacer: str(c.basicAttackReplacer),
      icon: str(c.baseClassIcon),
      raw_json: rawJson(c),
    });
    (c.masteries as Obj[]).forEach((m, i) => {
      const info = ui?.info?.[i];
      const labels = (info?.passiveBonusKeys ?? []).map((k: string) => t(k)).filter((x: string | null): x is string => x !== null);
      insertRow(db, "masteries", {
        class_id: classId,
        mastery_index: i,
        name: t(m.nameKey) ?? String(m.name),
        name_key: str(m.nameKey),
        description: t(info?.classDescriptionKey),
        description_key: str(info?.classDescriptionKey),
        mastery_ability_id: str(m.masteryAbility),
        passive_bonus_labels: labels.length ? labels.join("\n") : null,
        raw_json: rawJson(m),
      });
    });
    const abil = (kind: string, list: unknown[] | undefined, mastery: number | null) =>
      (list ?? []).forEach((a, ord) => {
        const o = typeof a === "string" ? { ability: a } : (a as Obj);
        insertRow(db, "class_abilities", {
          class_id: classId,
          kind,
          mastery_index: mastery,
          ord,
          ability_id: o.ability,
          level: int(o.level),
        });
      });
    abil("default", c.defaultAbilities, null);
    abil("known", c.knownAbilities, null);
    abil("unlockable", c.unlockableAbilities, null);
    (c.masteries as Obj[]).forEach((m, i) => abil("mastery", m.abilities, i));
  }

  // 15-17. monster_mods + mods + compact_ids ---------------------------------
  const modIdSet = new Set<number>();
  for (const [key] of sortedEntries(L.monsterMods)) modIdSet.add(Number(decodeCompactId(key).value));
  const resolves = (d: ReturnType<typeof decodeCompactId>): boolean => {
    switch (d.targetTable) {
      case "monster_mods":
        return modIdSet.has(Number(d.targetKey));
      case "affixes":
        return !!(L.itemDB.affixList.singleAffixes[d.targetKey] ?? L.itemDB.affixList.multiAffixes[d.targetKey]);
      case "uniques":
        return !!L.itemDB.uniqueList.uniques[d.targetKey];
      case "sets":
        return L.itemDB.setBonusList.some((s) => String(s.setID) === d.targetKey);
      case "item_subtypes": {
        const bt = L.itemDB.itemList.equippable[String(d.baseTypeId)] ?? L.itemDB.itemList.nonEquippable[String(d.baseTypeId)];
        return !!bt?.subItems?.[String(d.subTypeId)];
      }
    }
  };
  const noteCompact = (id: string | null | undefined): void => {
    if (!id) return;
    let d;
    try {
      d = decodeCompactId(id);
    } catch {
      return;
    }
    insertRow(
      db,
      "compact_ids",
      {
        compact_id: id,
        kind: d.kind,
        decoded: d.value,
        target_table: d.targetTable,
        target_key: d.targetKey,
        sub_index: d.subIndex,
        resolves: resolves(d) ? 1 : 0,
      },
      { conflict: "ignore" },
    );
  };

  for (const [key, m] of sortedEntries(L.monsterMods)) {
    const modId = Number(decodeCompactId(key).value);
    insertRow(db, "monster_mods", {
      mod_id: modId,
      letools_compact_id: key,
      title: t(m.titleKey),
      title_key: str(m.titleKey),
      description: t(m.descriptionKey),
      description_key: str(m.descriptionKey),
      objective_text: t(m.minilithDescriptionKey),
      objective_text_key: str(m.minilithDescriptionKey),
      mod_type: int(m.modType),
      type: int(m.type),
      increased_item_rarity: num(m.increasedItemRarity),
      increased_experience: num(m.increasedExperience),
      rarity_requirement: int(m.rarityRequirement),
      minimum_level: int(m.minimumLevel),
      can_spawn_in_arena: bool(m.canSpawnInArena),
      mod_ability_id: str(m.modAbility ?? m.abilityToCast),
      raw_json: rawJson(m),
    });
    (m.stats ?? []).forEach((s, i) => ctx.mods.insertStatBlock({ sourceKind: "monster_mod", sourceId: modId, sourceOrd: i, raw: s }, s));
    noteCompact(key);
    for (const inc of (m.incompatibleMods as string[] | undefined) ?? []) noteCompact(inc);
  }

  // 18-21. timelines ----------------------------------------------------------
  const refInsert = (row: Obj): void => {
    insertRow(db, "endgame_mod_refs", { monster_mod_id: modIdOf(row.compact_id as string), ...row });
    noteCompact(row.compact_id as string);
  };
  for (const [, tl] of sortedEntries(L.timelineData)) {
    insertRow(db, "timelines", {
      timeline_id: tl.id,
      slug: str(tl.slug),
      name: t(tl.nameKey),
      name_key: str(tl.nameKey),
      boss_name: t((tl as Obj).bossNameKey),
      harbinger_name: t((tl as Obj).harbingerNameKey),
      raw_json: rawJson(tl, ["difficulties", "mods", "empoweredMods"]),
    });
    tl.difficulties.forEach((d, di) => {
      const dd = d as Obj;
      noteCompact(dd.modFromCorruption);
      insertRow(db, "timeline_difficulties", {
        timeline_id: tl.id,
        difficulty_index: di,
        level: int(dd.level),
        max_stability: int(dd.maxStability),
        has_corruption_mod: bool(dd.hasCorruptionMod),
        corruption_mod_id: modIdOf(dd.modFromCorruption),
        minimum_corruption: int(dd.minimumCorruption),
        maximum_corruption: dd.hasMaxCorruption ? int(dd.maximumCorruption) : null,
        corruption_required_per_level: int(dd.corruptionRequiredPerLevel),
        requirements_json: dd.requirements === undefined ? null : JSON.stringify(dd.requirements),
        raw_json: rawJson(dd),
      });
      const lists: [string, number[]][] = [
        ["first", dd.firstSlotBlessings],
        ["other", dd.otherSlotBlessings],
        ["any", dd.anySlotBlessings],
      ];
      for (const [kind, list] of lists) {
        (list ?? []).forEach((b, ord) =>
          insertRow(db, "timeline_blessings", {
            timeline_id: tl.id,
            difficulty_index: di,
            slot_kind: kind,
            ord,
            blessing_sub_type_id: b,
          }),
        );
      }
    });
    for (const listName of ["mods", "empoweredMods"] as const) {
      ((tl as Obj)[listName] as Obj[] | undefined)?.forEach((m, ord) =>
        refInsert({
          content_kind: "timeline",
          content_id: tl.id,
          tier: null,
          list_name: listName,
          ord,
          compact_id: m.mod,
          minimum_depth: int(m.minimumDepth),
          maximum_depth: m.hasMaximumDepth ? int(m.maximumDepth) : null,
        }),
      );
    }
  }

  // 22. dungeons ----------------------------------------------------------------
  for (const [, dg] of sortedEntries(L.dungeonData)) {
    const keys = (dg.key as string[] | undefined) ?? [];
    keys.forEach(noteCompact);
    insertRow(db, "dungeons", {
      dungeon_id: dg.id,
      slug: str(dg.slug),
      name: t(dg.nameKey),
      name_key: str(dg.nameKey),
      boss_name: t(dg.bossNameKey),
      area_name: t(dg.location?.areaKey),
      era_name: t(dg.location?.eraKey),
      key_compact_ids: keys.length ? keys.join(",") : null,
      raw_json: rawJson(dg, ["tiers"]),
    });
    (dg.tiers as Obj[]).forEach((tr, ti) => {
      insertRow(db, "dungeon_tiers", {
        dungeon_id: dg.id,
        tier: ti,
        level: int(tr.level),
        character_level_required: int(tr.characterLevelRequiredToUnlock),
        raw_json: rawJson(tr),
      });
      for (const listName of ["startingMods", "otherFloorExitMods", "penultimateFloorExitMods"]) {
        ((tr[listName] as string[] | undefined) ?? []).forEach((cid, ord) =>
          refInsert({ content_kind: "dungeon", content_id: dg.id, tier: ti, list_name: listName, ord, compact_id: cid }),
        );
      }
    });
  }

  // 23. arenas ------------------------------------------------------------------
  for (const [, ar] of sortedEntries(L.arenaData)) {
    ((ar.key as string[] | undefined) ?? []).forEach(noteCompact);
    insertRow(db, "arenas", {
      arena_id: ar.id,
      slug: str(ar.slug),
      name: t(ar.nameKey),
      name_key: str(ar.nameKey),
      boss_names: joinNonEmpty(((ar.bossNameKeys as string[] | undefined) ?? []).map((k) => t(k)), ", "),
      area_name: t(ar.location?.areaKey),
      raw_json: rawJson(ar, ["tiers"]),
    });
    (ar.tiers as Obj[]).forEach((tr, ti) => {
      insertRow(db, "arena_tiers", {
        arena_id: ar.id,
        tier: ti,
        level: int(tr.level),
        tier_type: int(tr.tierType),
        raw_json: rawJson(tr),
      });
      ((tr.startingMods as string[] | undefined) ?? []).forEach((cid, ord) =>
        refInsert({ content_kind: "arena", content_id: ar.id, tier: ti, list_name: "startingMods", ord, compact_id: cid }),
      );
      ((tr.modPools as Obj[] | undefined) ?? []).forEach((pool, pi) => {
        for (const which of ["firstOptionMods", "secondOptionMods", "anyOptionMods"]) {
          ((pool[which] as string[] | undefined) ?? []).forEach((cid, ord) =>
            refInsert({
              content_kind: "arena",
              content_id: ar.id,
              tier: ti,
              list_name: `modPools[${pi}].${which}`,
              ord,
              compact_id: cid,
              wave_offered_after: int(pool.waveOfferedAfter),
            }),
          );
        }
      });
    });
  }

  // 24-25. monolith rewards -------------------------------------------------------
  const mono = L.monolithRewards as Obj;
  (mono.monolithRewards as Obj[]).forEach((r, idx) =>
    insertRow(db, "monolith_rewards", {
      idx,
      title: t(r.titleKey),
      title_key: str(r.titleKey),
      reward_type: int(r.rewardType),
      weighting: num(r.weighting),
      minimum_tier: int(r.minimumTier),
      sprite: str(r.sprite),
      raw_json: rawJson(r),
    }),
  );
  (mono.monolithRewardRollGroups as Obj[]).forEach((g, idx) =>
    insertRow(db, "monolith_reward_groups", {
      idx,
      title: t(g.titleKey),
      title_key: str(g.titleKey),
      weighting: num(g.weighting),
      minimum_tier: int(g.minimumTier),
      minimum_level: int(g.minimumLevel),
      droppable_rewards: g.droppableRewards === undefined ? null : JSON.stringify(g.droppableRewards),
      timeline_ids: g.timelineCompatibility === undefined ? null : JSON.stringify(g.timelineCompatibility),
      raw_json: rawJson(g),
    }),
  );

  // 26. woven echoes ---------------------------------------------------------------
  for (const e of L.wovenEchoList as Obj[]) {
    insertRow(db, "woven_echoes", {
      echo_id: e.id,
      slug: str(e.slug),
      name: t(e.displayNameKey),
      name_key: str(e.displayNameKey),
      description: t(e.descriptionKey),
      description_key: str(e.descriptionKey),
      content_type: int(e.contentType),
      weaver_points: int(e.weaverPointsForCompletion),
      woven_echo_cost: int(e.wovenEchoCost),
      raw_json: rawJson(e),
    });
  }

  // 27. factions ---------------------------------------------------------------------
  for (const f of L.factionList as Obj[]) {
    insertRow(db, "factions", {
      faction_id: f.factionId,
      name: t(f.factionNameKey),
      name_key: str(f.factionNameKey),
      scene_name: t(f.factionSceneNameKey),
      main_color: f.mainColor === undefined || f.mainColor === null ? null : typeof f.mainColor === "string" ? str(f.mainColor) : JSON.stringify(f.mainColor),
      raw_json: rawJson(f, ["reputationReqForNextRanks"]),
    });
    ((f.reputationReqForNextRanks as Obj[]) ?? []).forEach((r, i) =>
      insertRow(db, "faction_ranks", {
        faction_id: f.factionId,
        rank: i + 1,
        reputation_required: int(r.reputationRequired),
        title: t(r.rankTitleKey),
        description: t(r.rankDescriptionKey),
        raw_json: rawJson(r),
      }),
    );
  }

  // 28. prophecy_unlocks -----------------------------------------------------------------
  const pd = L.prophecyData;
  pd.slotUnlockRanks.forEach((rank, ord) => insertRow(db, "prophecy_unlocks", { kind: "slot", ord, rank }));
  pd.lensUnlockRanks.forEach((r, ord) =>
    insertRow(db, "prophecy_unlocks", { kind: "lens", ord, rank: r.rank, base_type_id: r.baseTypeId, sub_type_id: r.subTypeId }),
  );
  ((L.merchantsGuildBagData as Obj).bagUnlockRanks as Obj[]).forEach((r, ord) =>
    insertRow(db, "prophecy_unlocks", { kind: "bag", ord, rank: r.rank, base_type_id: r.baseTypeId, sub_type_id: r.subTypeId }),
  );

  // 29. scenes ------------------------------------------------------------------------------
  for (const [code, s] of sortedEntries(L.itemDB.sceneList)) {
    insertRow(db, "scenes", {
      scene_code: code,
      name: t(s.nameKey),
      name_key: str(s.nameKey),
      level: int(s.level),
      era: int(s.era),
      type: int(s.type),
      raw_json: rawJson(s),
    });
  }

  // 30. maxroll_quests ---------------------------------------------------------------------------
  if (raw.maxroll) {
    const questList = ((L.checklist as Obj).questList ?? {}) as Record<string, Obj>;
    for (const q of raw.maxroll.quests) {
      const lq = questList[String(q.id)];
      const key = `Quests.Quest_${q.id}_Name`;
      insertRow(db, "maxroll_quests", {
        quest_id: q.id,
        name: str(q.name),
        name_key: raw.i18n[key] !== undefined ? key : null,
        chapter: int(q.chapter),
        main_line: bool(q.mainLineQuest),
        idol_unlock_reward: int(q.idolUnlockReward),
        passive_points_reward: int(q.passivePointsReward),
        all_attributes_reward: int(q.allAttributesReward),
        completed_step: int(q.completed),
        experience_reward: lq ? int(lq.experienceReward) : null,
        gold_reward: lq ? int(lq.goldReward) : null,
        letools_json: lq ? rawJson(lq) : null,
        raw_json: rawJson(q),
      });
    }
  }

  // 31. raw_globals -----------------------------------------------------------------------------------
  const rg = (name: string, source: string, v: unknown): void => {
    insertRow(db, "raw_globals", { name, source, json: JSON.stringify(v ?? null) });
  };
  const topLevel = [
    "LEHUD", "LETooltipIcons", "passiveBonuses", "skillBonuses", "partialSkillBonuses", "vaultsOfUncertainFate",
    "dropBossLoot", "checklist", "lootFilterIcons", "lootFilterIconColors", "lootFilterRuleColors",
    "lootFilterBeamColors", "masterColors",
  ] as const;
  for (const g of topLevel) rg(g, "letools", L[g]);
  const nested: [string, readonly string[]][] = [
    ["itemDB", ["monsterItemDrops", "oneShotCaches", "championDataList", "randomEncounterData", "factionGamblerItems", "customDrops", "customPersonalItems", "bagContents", "questRewards", "fracturedUniques"]],
    ["coreDB", ["defaultProperty", "extraStatData", "corruptionOutcomeConfig"]],
    ["LEAbilities", ["invocations", "runeIcons", "ailmentTriggeredAilments", "ailmentTriggeredAbilities", "passivePointsFromQuests", "attributePointsFromQuests"]],
  ];
  for (const [g, keys] of nested) {
    const obj = (L as unknown as Record<string, Obj>)[g]!;
    for (const k of keys) {
      if (obj[k] === undefined) ctx.log.warn(`raw_globals: ${g}.${k} missing`);
      rg(`${g}.${k}`, "letools", obj[k]);
    }
  }
  if (raw.maxroll) {
    rg("maxroll.stats", "maxroll", raw.maxroll.stats);
    rg("maxroll.lootFilterData", "maxroll", raw.maxroll.lootFilterData);
  }
}

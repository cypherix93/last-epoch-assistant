# Community game-data sources: schema study

Snapshot taken **2026-10-08**. This folder documents the record shapes, enums, bitmasks and id spaces of the two community Last Epoch data sources so that a database schema can be designed without re-reading the raw files:

| document | contents |
|---|---|
| [README.md](README.md) | this overview: where the data comes from, versions, decode method, concept mapping |
| [letools.md](letools.md) | every collection in the Last Epoch Tools (LE Tools) data: keying, counts, field tables with presence and ranges, one example each |
| [maxroll.md](maxroll.md) | the same for the Maxroll `data.json` |
| [enums.md](enums.md) | enums and bitmasks (damage slots, `tags`, stat property ids, ailments, classes, base types, ...) with evidence |
| [ids.md](ids.md) | id spaces, the compact string id encoding, i18n key patterns, which joins are lossless |
| [counts.md](counts.md) | record counts side by side with explanations of the differences |

## 1. Sources and fetch URLs

### LE Tools (https://www.lastepochtools.com)

1. `GET https://www.lastepochtools.com/planner/` returns HTML that references the data files.
2. The data version string is in the HTML as `window["dataVersion"]="version152"` (the game version string inside the data is the global `gameVersion` = `"Version 1.5.2"`).
3. Seven JavaScript data files, found with the regex `data/version152/[a-z-]+/js/[a-f0-9]+\.js` in the HTML, fetched from `https://www.lastepochtools.com/<path>`:

   | section | path | notes |
   |---|---|---|
   | planner | `data/version152/planner/js/f7a1497b3bf199db6f5b2499da7747a2.js` | abilities, skill trees, class trees, Weaver tree, UI layout, buffs |
   | db (item/affix/unique) | `data/version152/db/js/8e688d145b13a6e9719c917369f90558.js` | `itemDB` plus `AT`, `SP`, `AilmentID`, `LocalSP`, `gameVersion` |
   | db (core) | `data/version152/db/js/9d545bd4db57e5107f2f89cc0caef27c.js` | `coreDB` (property definitions) |
   | endgame | `data/version152/endgame/js/16c34242d7f7f6f084a12be298a8eb29.js` | monster mods, timelines, dungeons, arena, vaults, woven echoes |
   | factions | `data/version152/factions/js/f5bb42e841ce979654460cd7a3f8e612.js` | factions, prophecy, merchant guild bags |
   | checklist | `data/version152/checklist/js/5375ff60b6ceae3e33b048008f7ca0eb.js` | quest checklist |
   | loot-filters | `data/version152/loot-filters/js/5a3e67d79ddb7bd88126a54ab6f4c6c3.js` | loot filter colors / icons |

   The file names are md5-like content hashes and change with each data version, so always re-extract them from the HTML.
4. Localisation: `GET https://www.lastepochtools.com/data/version152/i18n/full/en.json` (flat key -> English string map).
5. The HTML also references `data/version152/{db,planner,factions}/res/<md5>.{webp,css}`: sprite sheets and styles, not data (the `.webp`/`.css` URLs were not downloaded; a HEAD request on the extension-less hash returns 404).

All requests used a browser `User-Agent` (`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36`).

### Maxroll (https://assets-ng.maxroll.gg)

1. `GET https://assets-ng.maxroll.gg/leplanner/static/js/planner.js` (5.8 MB webpack bundle).
2. In it, the manifest entry `"data.json":"1b325e38"` gives an 8-hex cache-busting hash. (It is the first 8 hex digits of the md5/ETag of the file.)
3. `GET https://assets-ng.maxroll.gg/leplanner/game/data.json?1b325e38` returns the 10 MB JSON.

Observed response headers: `Content-Length: 10089878`, `ETag: "1b325e3819f59f0f0c2b1b240cda92ec"` (equals the md5 of the body, verified with `md5sum`), `Last-Modified: Wed, 30 Sep 2026 11:34:57 GMT`, `Cache-Control: public, max-age=31536000`. There is no game-version string inside `data.json`.

Downloaded sizes:

| file | bytes |
|---|---|
| planner.html | 49,511 |
| mr_planner.js | 5,837,467 |
| mr_data.json | 10,089,878 |
| en.json | 3,155,578 |

## 2. Version strings discovered

| source | version evidence |
|---|---|
| LE Tools | `dataVersion` = `version152` (HTML, 3 occurrences); global `gameVersion` = `"Version 1.5.2"` in the db and checklist files; `LEWeaverTree.version = 10`; ability skill trees carry their own `version` ints (0..8), class trees 12/7/12/3/0 |
| Maxroll | `data.json` hash `1b325e38`; ETag `1b325e3819f59f0f0c2b1b240cda92ec`; Last-Modified 2026-09-30 11:34:57 GMT; `skillTrees.<id>.version` ints (0..12; class trees 12/7/12/3/0, weaver 10, same as LE Tools) |

The two sources describe the same game state to a high degree: all 486 uniques, 1,156 affixes, 136 skill trees (3,956 nodes) and the class and Weaver trees are identical in ids and, apart from the small documented exceptions (float32 noise, `null` vs `""`, one requirement), in content (see [counts.md](counts.md) and [ids.md](ids.md)).

## 3. Decode method (LE Tools)

Each LE Tools data file is JavaScript that assigns globals (`window.itemDB={...}`, `window['LEAbilities']=...`, several globals per file). Each file was executed in a Node `vm` context with a fake `window` object, and every global created (on `window` or in the sandbox scope) was serialised with `JSON.stringify` to its own `<name>.json` (script `decode.js`). Keys in the JS source are unquoted/numeric, so object keys come out as strings of integers (`"0"`, `"1"`); numeric ids therefore have to be parsed. Maxroll's file is plain JSON. Globals found per file:

| file (under `data/version152/<section>/js/`) | bytes | global | JS type | JSON bytes |
|---|---|---|---|---|
| `checklist/js/5375ff60b6ceae3e33b048008f7ca0eb.js` | 20,533 | `checklist` | object | 23,838 |
|  |  | `gameVersion` | string | 15 |
| `db/js/8e688d145b13a6e9719c917369f90558.js` | 3,124,396 | `itemDB` | object | 3,537,433 |
|  |  | `gameVersion` | string | 15 |
|  |  | `AT` | object | 474 |
|  |  | `SP` | object | 3,204 |
|  |  | `AilmentID` | object | 2,796 |
|  |  | `LocalSP` | object | 426 |
| `db/js/9d545bd4db57e5107f2f89cc0caef27c.js` | 1,049,597 | `coreDB` | object | 1,133,379 |
| `endgame/js/16c34242d7f7f6f084a12be298a8eb29.js` | 592,554 | `monsterMods` | object | 213,300 |
|  |  | `monolithRewards` | object | 51,435 |
|  |  | `timelineData` | object | 54,617 |
|  |  | `arenaData` | object | 4,487 |
|  |  | `dungeonData` | object | 5,488 |
|  |  | `vaultsOfUncertainFate` | object | 35,616 |
|  |  | `dropBossLoot` | array | 275,493 |
|  |  | `wovenEchoList` | array | 29,776 |
| `factions/js/f5bb42e841ce979654460cd7a3f8e612.js` | 9,026 | `factionList` | array | 8,488 |
|  |  | `prophecyData` | object | 555 |
|  |  | `merchantsGuildBagData` | object | 539 |
| `loot-filters/js/5a3e67d79ddb7bd88126a54ab6f4c6c3.js` | 41,208 | `lootFilterIcons` | array | 202 |
|  |  | `lootFilterIconColors` | array | 181 |
|  |  | `lootFilterRuleColors` | array | 14,178 |
|  |  | `lootFilterBeamColors` | array | 17,631 |
|  |  | `masterColors` | array | 11,166 |
| `planner/js/f7a1497b3bf199db6f5b2499da7747a2.js` | 5,831,685 | `LEAbilities` | object | 2,402,316 |
|  |  | `LECharTrees` | object | 488,671 |
|  |  | `LECharTreesUI` | object | 60,001 |
|  |  | `LESkillTrees` | object | 2,948,892 |
|  |  | `LESkillTreesUI` | object | 427,500 |
|  |  | `LEWeaverTree` | object | 52,535 |
|  |  | `LEWeaverTreeUI` | object | 13,779 |
|  |  | `LEHUD` | object | 242 |
|  |  | `LETooltipIcons` | object | 14,970 |
|  |  | `passiveBonuses` | object | 112,034 |
|  |  | `skillBonuses` | object | 16,907 |
|  |  | `LocalSP` | object | 426 |
|  |  | `partialSkillBonuses` | object | 23,181 |
|  |  | `UIBuffs` | object | 64,989 |
|  |  | `UIBuffIds` | object | 5,257 |
|  |  | `BuffId` | object | 1,762 |
|  |  | `BuffPropId` | object | 6,198 |
|  |  | `CustomConditionType` | object | 666 |

Total decoded: 41 globals (the prompt expected 25-30; additional globals found are `passiveBonuses`, `skillBonuses`, `partialSkillBonuses`, `UIBuffs`, `UIBuffIds`, `BuffId`, `BuffPropId`, `CustomConditionType`, `monolithRewards`, `vaultsOfUncertainFate`, `dropBossLoot`, `merchantsGuildBagData`, `LocalSP`, `AT`, `SP`, `AilmentID`, `gameVersion`, `checklist`, loot-filter color tables). `prophecyData` lives in the **factions** file, not in endgame.

## 4. Concept map: where each concept lives

Paths are relative to the decoded globals (LE Tools) or the `data.json` top level (Maxroll). Counts in parentheses are verified record counts.

| concept | LE Tools | Maxroll |
|---|---|---|
| item base types | `itemDB.itemList.equippable` (39) and `.nonEquippable` (9), keyed by `baseTypeId` | `itemTypes[]` (51), `baseTypeID`; grouping in `itemCategories` (4) |
| item sub types | `...<baseTypeId>.subItems.<subTypeId>` (918 + 640 = 1,558) | `itemTypes[].subItems[]` (1,571) |
| implicits | `subItems.<id>.implicits[]` (1,529) | `itemTypes[].subItems[].implicits[]` (1,536) |
| affixes and tiers | `itemDB.affixList.singleAffixes` (616) + `.multiAffixes` (540); `tiers[].rolls[]` (6,238 tiers); categories `affixList.displayCategoryKeys` (45), `categoryHeaders` (12) | `affixes[]` (1,156; single-stat inline, multi-stat via `affixProperties[]` + `tiers[].extraRolls[]`); `affixDisplayCategories` (45), `affixCategoryHeaders` (12) |
| uniques, their mods, tooltip descriptions, set membership | `itemDB.uniqueList.uniques` (486): `mods[]`, `tooltipDescriptions[]` (i18n keys), `tooltipEntries[]`, `isSetItem`, `setId` | `uniques[]` (486): same plus inline English description, `loreText`, `setID` |
| set bonuses | `itemDB.setBonusList` (25) + `itemDB.setNames` (24) | `setBonuses[]` (25) with `itemsInSet` (61 embedded uniques) |
| idols | base types 25..33 in `equippable`; idol affixes = affixes with `rollsOn = 1` (472), enchanted idols `specialAffixType 4`, Weaver idols `specialAffixType 5` | same, in `itemTypes` and `affixes` |
| blessings | `equippable[34].subItems` (224); timeline difficulties reference them in `firstSlotBlessings` / `otherSlotBlessings` / `anySlotBlessings` | `itemTypes[34].subItems` and `timelines[].difficulties[]` |
| idol altar | base type 41, `coreDB.idolAltarPropertyList.list` (31), `itemDB.altarGrids` (default grid + 13 grids), affixes with SP 130 | `idolAltarProperties` (31); no grid layouts |
| abilities / skills | `LEAbilities.abilityList` (1,228, keyed by id string), `allAbilityIdList` (994), `playerAbilityIdList` (183 entries, 182 distinct) | `abilities` (1,054, keyed by name), `abilityList` (992 names), `playerAbilityList` (184) |
| ability prefab components | `abilityList.<id>.prefab.components[]` (2,516 components, 87 `type` names in PascalCase) | `abilities.<name>.components[]` (915 components, only 6 lower-camel `type` names: damageOnHit, chanceToApplyAilmentsOnHit, createAbilityObjectOnDeath, castAfterDuration, castAtRandomPointAfterDuration, damageWithBeam) |
| skill trees, nodes, node stats | `LESkillTrees.<treeID>` (136) `.nodes.<n>` (3,956), `.stats[]` (6,528) | `skillTrees.<treeID>` (136 of the 142), same node counts |
| skill tree UI positions | `LESkillTreesUI.<treeID>.children[]` (`rect`, `icon`, `nodeSize`) | inline `nodes.<n>.transform {x,y}` and `icon` |
| class passive trees and nodes | `LECharTrees.trees[0..4].characterTree.nodes` (541); layout `LECharTreesUI.<pr-1|mg-1|kn-1|ac-1|rg-1>` | `skillTrees['pr-1'|'mg-1'|'kn-1'|'ac-1'|'rg-1']` |
| Weaver tree | `LEWeaverTree` (80 nodes) + `LEWeaverTreeUI.weaver` | `skillTrees.weaver` (80 nodes) |
| ailments | `LEAbilities.ailmentList` (148), enum `AilmentID` (151), non-ailment buffs `UIBuffs` (264) | `ailments[]` (128 records) |
| stat properties | `coreDB.propertyList` (113) with enum `SP` (134) | `properties[]` (113), `stats[]` (184 display rules) |
| player properties | `coreDB.playerPropertyList` (713) | `playerProperties[]` (712) |
| ability properties | `coreDB.abilityPropertyList` (177) | `abilityProperties[]` (177) |
| conditional damage properties | `coreDB.conditionalDamagePropertyDescriptionKeys` (48) + `conditionalNonDamagePropertyDescriptionKeys` (48) | `conditionalProperties[]` (48, both forms) |
| classes / masteries | `LECharTrees.trees` (5), mastery labels in `LECharTreesUI.<tree>.info[]`; class abilities in `LEAbilities` | `classes[]` (5): stats, abilities, 4 masteries each |
| monster mods | `monsterMods` (287) | not present |
| timelines (and blessings per timeline) | `timelineData` (10): `difficulties[]` (20), `mods[]` (238), `empoweredMods[]` | `timelines[]` (11, includes id 99): `difficulties[]` (21) |
| dungeons | `dungeonData` (3) | not present |
| arena | `arenaData` (2) | not present |
| quests | `checklist` (`questList` 36, `chapterKeyList`, `sceneList` 30, `questSceneList`) | `quests[]` (145) |
| factions, monolith rewards, vaults, woven echoes, boss loot | `factionList`, `monolithRewards`, `vaultsOfUncertainFate`, `wovenEchoList` (47), `dropBossLoot` (71), `prophecyData`, `merchantsGuildBagData` | not present |
| localisation (i18n keys) | `i18n/full/en.json` (34,993 keys, 17 sections) | none; strings inline in English. `textKey` / `localizationKey` give the key stem for properties and masteries |
| icons / sprites | `a-r-<n>`, `I<n>`, `j-r-<n>`, `k-r-<n>`, `g-r-<n>` (atlas ids) | md5 hashes (`treeAtlas`, `icon`, `sprite`), icon name lists in `icons` |
| loot filter | `lootFilterIcons`, `lootFilterIconColors`, `lootFilterRuleColors`, `lootFilterBeamColors`, `masterColors` | `lootFilterData.sounds` (16), `.beams` (9) |

## 5. Differences that matter for schema design

- **Normalisation**: LE Tools stores i18n keys (`nameKey`, `descriptionKey`, ...) and ids; Maxroll stores resolved English strings and mostly the same ids. Names and descriptions in Maxroll can be dropped when `en.json` is imported.
- **Flags**: LE Tools `itemDB`/`coreDB` use `0/1` numbers for booleans; `LEAbilities`, tree and endgame files and Maxroll use `true/false`. Normalise on import.
- **Object keys are strings of ints** in LE Tools (`"0"`, `"12"`); parse before use. Several collections are *sparse* (uniques 0..488 with 486 present; affixes 0..1156 with 1139 absent; equippable base types miss 11, 24, 40).
- **Float noise**: LE Tools has float32 artefacts (`0.29000002`, `1.46667`) in 8 affixes' rolls; round to the intended precision.
- **ICU escaping** in `en.json`: apostrophes are doubled (`Artor''s`), markup braces are quoted (`'{'1'}'`).
- **Compact ids**: the LE Tools `rel*`/`triggered*` maps and `monsterMods` use lz-string-compressed ids (decoded in [ids.md](ids.md)).
- **Indirect properties**: stat property 98 (`PlayerProperty`), 58 (`AbilityProperty`), 130 (`IdolAltarProperty`) carry the real stat in `tags`/`specialTag` (see [enums.md](enums.md) section 3).
- **Shapes that differ**: affixes (Maxroll flattens single-stat affixes), abilities (keyed by id vs by name), `attributeScaling` (LE Tools object keyed by attribute id, Maxroll array of `{attribute, stats}`), tree requirements (`nodeId` vs `node`), `tree node stat.value` (`null` vs `""`), timelines (LE Tools holds the mod lists; Maxroll only blessing lists), node positions (separate vs inline). Field-name level differences for the equivalent records:

| record | fields only in LE Tools | fields only in Maxroll |
|---|---|---|
| unique | `sprite`, `uniqueId`, `setId`, `unknownDrop`, `notTimelineExclusive`, `baseTypeId`, `subTypeIds`, `oldSubTypeId`, `oldUniqueId`, `useCustomDropLevel`, `customDropLevel`, `legacySubTypeVersions`, `displayNameKey`, `loreTextKey`, `alternativeSearchNameKey`, `rarityTier` | `name`, `displayName`, `alternativeSearchName`, `uniqueID`, `setID`, `abilityTooltipToShowInAltTooltip`, `itemModelType`, `subTypeForIM`, `baseType`, `subTypes`, `loreText`, `oldSubTypeID`, `oldUniqueID` |
| affix | `singleSetAffix`, `rerollChance`, `useGeneratedName`, `forUniqueId`, `lootFilterOverrideNameKey`, `affixDisplayNameKey`, `affixTitleKey`, `rarityTier` | `affixName`, `affixDisplayName`, `affixLootFilterOverrideName`, `affixTitle`, `uniqueId`, `weaponEffect`, `shardHueShift`, `shardSaturationModifier`, `convertOnIncompatibleItemType`, `affixIDToConvertTo`, `maximumAffixEffectModifierForT6`, `abilityTooltipToShowInAltTooltip`, `property`, `specialTag`, `tags`, `extraTag`, `modifierType`, `setProperty`, `useGeneratedNameForDisplayName` |
| base type | `baseTypeId`, `maxAffixes`, `size`, `obsoleteItemType`, `usePerClassIncompatibilityDropLists`, `perClassIncompatibilityDropLists`, `displayNameKey` | `BaseTypeName`, `displayName`, `lootFilterNameOverride`, `baseTypeID`, `maximumAffixes`, `gridSize`, `goldCostModifier`, `addedGambleCost`, `subTypeDropUpgradeChanceMultiplier`, `subTypeDropUpgradeChanceMultiplierPerLevel`, `usePreClassIncompatibilityDropLists`, `preClassIncompatibilityDropLists` |
| sub type | `sprite`, `subTypeId`, `cannotEquipOnPickup`, `isLegacySubType`, `obsoleteItem`, `displayNameKey`, `isStartingItem`, `uniques`, `lensEffect`, `descriptionKey`, `lensEffectKey` | `name`, `displayName`, `subTypeID`, `hideSubTypeInLootFilter`, `cannotBeUpgradedOnDrop`, `IMSetOverrides`, `description` |
| set bonus | `nameKey` | `itemsInSet` |
| ailment | `internalName`, `duration`, `maxInstances`, `positive`, `displayNameKey`, `showsInBuffUI`, `descriptionKey`, `dealsAllDamageAtEnd`, `buffScalingType`, `maxStacksThatApplyBuffs`, `buffs`, `spreads`, `spreadRange`, `spreadDelay`, `spreadIfDiedBeforeDelay`, `maxSpreadPerInstance`, `effectOfEffectivenessOnProc`, `procsAbilityWhenStacksReached`, `abilityToProcWhenStacksReached`, `stacksRequiredForProc`, `procsAbilityOnExpiration`, `abilityToProcOnExpiration`, `expirationAbilityProcsOnDeath`, `stopsWhenHit`, `blinds`, `roots`, `moreBuffEffectAgainstBosses`, `moreBuffEffectAgainstPlayers`, `mutationType`, `abilityForMutation`, `movementAilment`, `movementAilmentDistance`, `movementAilmentIgnoresDistancePerStack`, `movementAilmentDoesNotExpire`, `movementAilmentRemovesOnNextMove`, `curse` | `instanceName`, `description` |
| property (SP) | `roundAddedToInt`, `propertyNameKey`, `altTextKey` | `roundingForAdded`, `lessIsBetter`, `textKey`, `propertyName`, `defaultAltText` |
| player property | `roundAddedToInt`, `propertyNameKey`, `altTextKey` | `roundingForAdded`, `textKey`, `propertyName`, `altText` |
| ability property | `roundAddedToInt`, `propertyNameKey`, `altTextKey` | `roundingForAdded`, `textKey`, `propertyName`, `altText` |
| ability (top level) | `internalName`, `index`, `id`, `name`, `nameKey`, `descriptionKey`, `altTextKey`, `skillLoreKey`, `areaTagDisplay`, `minimumManaCost`, `as`, `useDelay`, `abilitySprite`, `stopMovementOnKeyRelease`, `transform`, `transformHasMovementSkill`, `movementDuringUse`, `comboAbility`, `comboTimeLimit`, `traversalSkill`, `prefab`, `comboAbilities`, `sharedCooldownAbilities` | `abilityName`, `playerAbilityID`, `displayAlternateDamageDescriptorInTooltip`, `components`, `sprite` |
| tree node | `id`, `nodeNameKey`, `descriptionKey`, `altTextKey`, `loreTextKey`, `pointBonusDescriptionKey`, `baseLockNode`, `lockNode`, `relatedAbilities`, `relatedAilments`, `triggeredAbilities`, `triggeredAilments` | `nodeName`, `description`, `altText`, `loreText`, `pointBonusDescription`, `transform`, `abilityGrantedByNode`, `icon` |
| node stat | `statNameKey` | `statName` |
| node requirement | `nodeId` | `node` |
| timeline difficulty | `requirements` | `sufficientRequirements`, `timelineProgressionPointsNeeded`, `tutorialise`, `minTierForTombsOfTheErased` |

## Scripts

All counts, tables and cross-checks in these documents were produced by Node scripts kept in the session scratchpad (`.../scratchpad/schema-study/scripts/`, not part of the repository), run against the decoded data in `.../scratchpad/schema-study/out/`:

| script | purpose |
|---|---|
| `decode.js` | runs each LE Tools data file in a `vm` sandbox and writes one JSON per global |
| `profile.js`, `coll_letools.js`, `coll_maxroll.js`, `notes.js`, `overrides.js`, `gen_collections.js` | field profiler (presence, types, ranges, examples) and the collection definitions behind [letools.md](letools.md) / [maxroll.md](maxroll.md) |
| `counts.js` | record counts for [counts.md](counts.md) |
| `join_checks.js`, `relkeys.js`, `lzdec.js`, `verify_relkeys.js` | cross-source joins and compact-id decoding for [ids.md](ids.md) |
| `i18n_check.js` | i18n key pattern verification |
| `enum_tables.js`, `tag_check.js`, `misc_frag.js`, `dist.js`, `xtab.js`, `dmg.js`, `probe2.js` | enum evidence for [enums.md](enums.md) |
| `fielddiff.js`, `build_docs.js` | field-name diff table and document assembly |

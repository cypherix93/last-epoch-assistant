# LE Tools data (Last Epoch Tools, `dataVersion` `version152`, game "Version 1.5.2")

See [README.md](README.md) for the fetch method. This document describes **every collection** of the decoded LE Tools globals: how it is keyed, how many records it has, and a field table computed by script (`profile.js`) over all records. Field tables list, for each path:

- **type**: JavaScript JSON type(s); when several appear the count per type is given.
- **presence**: `always`, or `n/N (pct)` when the field is optional/sparse; paths inside arrays (`[]`) or maps (`<key>`) show the number of occurrences instead.
- **range / values**: observed numeric `min..max` (with the number of distinct values when > 12), or the exact list of values when <= 12 distinct; `len a..b` is the array length range.
- **example**: first value seen. **meaning**: inferred from names and cross-checks (blank when not inferable). Enum meanings are in [enums.md](enums.md), id encodings in [ids.md](ids.md).

Tables show nested objects up to three levels; deeper structures are noted in the `example` blocks. Examples are verbatim from the data, trimmed (arrays cut to 2 elements, long strings cut, `...` markers).

## 1. Files and globals

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

## 2. Top-level structure of every global

| global | JS type | size | top-level members (name: type, count) |
|---|---|---|---|
| `itemDB` | object | 24 | `itemList`: object{5}; `affixList`: object{4}; `uniqueList`: object{1}; `setBonusList`: array[25]; `relIncLevelAbilities`: object{195}; `relModAbilities`: object{509}; `relModAilments`: object{485}; `triggeredAbilities`: object{150}; `triggeredAilments`: object{389}; `fracturedUniques`: object{1}; `questRewards`: object{1}; `setNames`: object{24}; `monsterItemDrops`: array[341]; `oneShotCaches`: array[40]; `championDataList`: object{2}; `randomEncounterData`: object{11}; `sceneList`: object{385}; `minGridSize2x2`: boolean; `factionGamblerItems`: object{2}; `customDrops`: array[1]; `customPersonalItems`: array[1]; `bagContents`: object{5}; `altarGrids`: object{2}; `relatedAbilities`: object{509} |
| `coreDB` | object | 10 | `propertyList`: array[113]; `coreAttributes`: object{5}; `playerPropertyList`: array[713]; `abilityPropertyList`: array[177]; `defaultProperty`: object{14}; `extraStatData`: object{1}; `idolAltarPropertyList`: object{2}; `corruptionOutcomeConfig`: object{2}; `conditionalDamagePropertyDescriptionKeys`: array[48]; `conditionalNonDamagePropertyDescriptionKeys`: array[48] |
| `LEAbilities` | object | 11 | `abilityList`: object{1228}; `allAbilityIdList`: array[994]; `playerAbilityIdList`: array[183] (182 distinct); `ailmentList`: object{148}; `entityList`: object{96}; `ailmentTriggeredAbilities`: object{0}; `ailmentTriggeredAilments`: object{4}; `passivePointsFromQuests`: number; `attributePointsFromQuests`: number; `invocations`: object{1}; `runeIcons`: object{3} |
| `LESkillTrees` | object | 136 | 136 keys (`av75ch`, `wb8fo`, `eq5s`, `er6no`, ...); value: object |
| `LESkillTreesUI` | object | 136 | 136 keys (`av75ch`, `wb8fo`, `eq5s`, `er6no`, ...); value: object |
| `LECharTrees` | object | 1 | `trees`: array[5] |
| `LECharTreesUI` | object | 5 | `pr-1`: object{2}; `mg-1`: object{2}; `kn-1`: object{2}; `ac-1`: object{2}; `rg-1`: object{2} |
| `LEWeaverTree` | object | 3 | `version`: number; `treeID`: string; `nodes`: object{80} |
| `LEWeaverTreeUI` | object | 1 | `weaver`: object{4} |
| `LEHUD` | object | 7 | `move`: string; `potions`: array[9]; `portal`: string; `bottomMenu`: string; `fireRuneIcon`: string; `coldRuneIcon`: string; `lightningRuneIcon`: string |
| `LETooltipIcons` | object | 2 | `defaultSprite`: string; `entries`: array[328] |
| `passiveBonuses` | object | 5 | `pr-1`: object{7}; `mg-1`: object{7}; `kn-1`: object{7}; `ac-1`: object{7}; `rg-1`: object{7} |
| `skillBonuses` | object | 8 | `sb44eQ`: object{7}; `fi9`: object{7}; `gl14`: object{7}; `lb23il`: object{7}; `me27`: object{7}; `en6`: object{7}; `ah443`: object{7}; `si4lgl`: object{7} |
| `partialSkillBonuses` | object | 128 | 128 keys (`av75ch`, `wb8fo`, `eq5s`, `er6no`, ...); value: object |
| `UIBuffs` | object | 264 | 264 keys (`1`, `2`, `3`, `4`, ...); value: object |
| `UIBuffIds` | object | 265 | 265 keys (`None`, `IronMastery`, `ReactiveWard`, `Insight`, ...); value: number |
| `BuffId` | object | 95 | 95 keys (`AbyssalRite`, `VoidBarrier`, `ReensIre`, `Viscera`, ...); value: number |
| `BuffPropId` | object | 195 | 195 keys (`EternalEclipseFire_MeleeVoidDamage`, `EternalEclipseFire_TimeRotChance`, `EternalEclipseVoid_MeleeFireDamage`, `EternalEclipseVoid_IgniteChance`, ...); value: number |
| `CustomConditionType` | object | 23 | `EnemyKilledWithMeleeAttackRecently`: number; `EnemyHitWithMeleeAttackRecently`: number; `EnemyHitWithZeroManaSkill`: number; `UsedSkillThatCost40Mana`: number; `UsedMinionSkillRecently`: number; `UsedSpellRecently`: number; `UsedSkillThatCostMana`: number; `HealedSelfOrMinionsRecently`: number; `ReceivedBleedFromPenanceRecently`: number; `CastDevouringOrbRecently`: number; `DirectlyCastPhysicalSpellRecently`: number; `DirectlyCastColdSpellRecently`: number; `UsedBowAttackRecently`: number; `SkillEchoedRecently`: number; `HaveMoreThan400ManaBeforeCast`: number; `CastElementalNovaRecently`: number; `CastElementalNova6Times`: number; `HaveHaste`: number; `FalconHitEnemyRecently`: number; `EnemyIsBossOrMoving`: number; `DirectlyCastElementalNova`: number; `AboveHalfMana`: number; `BelowHalfMana`: number |
| `AT` | object | 30 | `None`: number; `Physical`: number; `Lightning`: number; `Cold`: number; `Fire`: number; `Void`: number; `Necrotic`: number; `Poison`: number; `Elemental`: number; `Spell`: number; `Melee`: number; `Throwing`: number; `Bow`: number; `DoT`: number; `Minion`: number; `Totem`: number; `PetResisted`: number; `Potion`: number; `Buff`: number; `Channelling`: number; `Transform`: number; `LowLife`: number; `HighLife`: number; `FullLife`: number; `Hit`: number; `Curse`: number; `Ailment`: number; `Crit_deprecated`: number; `Kill_deprecated`: number; `Die_deprecated`: number |
| `SP` | object | 134 | 134 keys (`Damage`, `AilmentChance`, `AttackSpeed`, `CastSpeed`, ...); value: number |
| `LocalSP` | object | 17 | `NoDodge`: number; `OnlyOneCompanion`: number; `NoLeech`: number; `NoCritChance`: number; `NoCritMulti`: number; `NoHealthRegen`: number; `IntEqualsStr`: number; `DodgeChance`: number; `AilmentDamage`: number; `NoManaRegen`: number; `ExtraProjectile`: number; `MaximumAdditionalChain`: number; `ManaCostPerSecond`: number; `FreezeRate`: number; `MaximumHealthGainedAsWardDecayThreshold`: number; `MaximumHealthGainedAsWardRegen`: number; `EnduranceThresholdAddedAsWardDecayThreshold`: number |
| `AilmentID` | object | 151 | 151 keys (`None`, `Ignite`, `Bleed`, `Chill`, ...); value: number |
| `monsterMods` | object | 287 | 287 keys (`MAxA`, `MIxA`, `MExA`, `MMxA`, ...); value: object |
| `monolithRewards` | object | 4 | `monolithRewards`: array[57]; `monolithRewardRollGroups`: array[25]; `backgroundRewardSlotTypes`: array[4]; `backgroundRewardSlotColors`: array[12] |
| `timelineData` | object | 10 | `1`: object{36}; `2`: object{36}; `3`: object{36}; `4`: object{36}; `5`: object{36}; `6`: object{36}; `7`: object{36}; `8`: object{36}; `9`: object{36}; `10`: object{36} |
| `arenaData` | object | 2 | `1`: object{7}; `2`: object{7} |
| `dungeonData` | object | 3 | `1`: object{7}; `2`: object{7}; `3`: object{7} |
| `vaultsOfUncertainFate` | object | 9 | `allMods`: array[46]; `addedCostPerRerollForTiers`: array[4]; `maximumModsForTiers`: array[4]; `roundGoldCostsTo`: number; `maxGoldCost`: number; `firstModGoldCostMultiplier`: number; `secondModGoldCostMultiplier`: number; `thirdModGoldCostMultiplier`: number; `increasedCostPerReroll`: number |
| `dropBossLoot` | array | 71 | array of 71; element: object {source, bossLoot} |
| `wovenEchoList` | array | 47 | array of 47; element: object {id, slug, displayNameKey, descriptionKey, specialObjectiveText, contentType, ...} |
| `factionList` | array | 4 | array of 4; element: object {factionId, factionNameKey, excludedFactions, reputationGainMultiplierFromGainingExperience, reputationGainMultiplierFromSpendingFavor, increasedFavorPerRank, ...} |
| `prophecyData` | object | 2 | `slotUnlockRanks`: array[4]; `lensUnlockRanks`: array[12] |
| `merchantsGuildBagData` | object | 1 | `bagUnlockRanks`: array[12] |
| `checklist` | object | 4 | `questList`: object{36}; `chapterKeyList`: object{13}; `sceneList`: object{30}; `questSceneList`: object{36} |
| `lootFilterIcons` | array | 24 | array of 24; element: string |
| `lootFilterIconColors` | array | 18 | array of 18; element: string |
| `lootFilterRuleColors` | array | 18 | array of 18; element: object {primary, secondary} |
| `lootFilterBeamColors` | array | 22 | array of 22; element: object {primary, secondary} |
| `masterColors` | array | 27 | array of 27; element: object {color, lightColor, buttonColor, highlightColor, borderColor, shineColor, ...} |
| `gameVersion` | string | - | "Version 1.5.2" |

## 3. Notes on shapes not profiled in section 4

These globals are small configuration/UI tables; their full shape is visible in the structure table above.

- `AT`, `SP`, `LocalSP`, `AilmentID`, `UIBuffIds`, `BuffId`, `BuffPropId`, `CustomConditionType`: name -> integer enum maps (documented in [enums.md](enums.md)). `AT` has 30 entries (bit flags), `SP` 134, `LocalSP` 17, `AilmentID` 151, `UIBuffIds` 265, `BuffId` 95, `BuffPropId` 195, `CustomConditionType` 23.
- `gameVersion`: the string `"Version 1.5.2"`.
- `LEHUD`: sprite ids of HUD elements (`move`, `potions[9]`, `portal`, `bottomMenu`, three rune icons).
- `LETooltipIcons`: `{defaultSprite, entries[328]}`, each entry `{sprite, property, tags}` mapping a stat property (+ tag mask) to a tooltip icon sprite (`a-r-<n>`).
- `prophecyData` (factions file): `slotUnlockRanks` (4 ints) and `lensUnlockRanks[12]` (`{baseTypeId: 109, subTypeId, rank}`). `merchantsGuildBagData.bagUnlockRanks[12]` (`{baseTypeId: 108, subTypeId, rank}`).
- `itemDB.championDataList`, `randomEncounterData`, `factionGamblerItems`, `customDrops`, `customPersonalItems`, `oneShotCaches`, `bagContents`, `altarGrids`: drop-table and world-content configuration. `altarGrids` = `{defaultGrid: 5x5, grids: 13 x 5x5}` of ints (cell codes such as 1..8, 99 and 101..108; meaning not decoded).
- `itemDB.relModAbilities`, `relModAilments`, `relIncLevelAbilities`, `triggeredAbilities`, `triggeredAilments`, `relatedAbilities` (identical to `relModAbilities`): maps keyed by compact string ids, see [ids.md section 2](ids.md#2-le-tools-compact-string-ids).
- `loot-filters` file: `lootFilterIcons` (24 sprite ids), `lootFilterIconColors`, `lootFilterRuleColors` (18 colour sets), `lootFilterBeamColors`, `masterColors` (27): UI colour tables (CSS `rgba()` strings).
- `monolithRewards`: `{monolithRewards[57], monolithRewardRollGroups, backgroundRewardSlotTypes, backgroundRewardSlotColors}`.
- `vaultsOfUncertainFate`: `{allMods[46], addedCostPerRerollForTiers, maximumModsForTiers, roundGoldCostsTo, maxGoldCost, ...CostMultiplier, increasedCostPerReroll}`.
- `dropBossLoot[71]`: `{source, bossLoot: {lootGroups[...]}}` per boss/harbinger.
- `LEAbilities.invocations` (`{<id>: {abilityId: [3 ints]}}`) and `runeIcons` (`{1,2,3}` -> sprite): rune invocation combinations (runemaster) and rune sprites; `passivePointsFromQuests` = 30, `attributePointsFromQuests` = 2.
- `LEAbilities.ailmentTriggeredAilments` (`{4 entries}`) and `ailmentTriggeredAbilities` (empty).

## 4. Collections

Sub-sections are named after the path they flatten. "Flattened" means records were gathered from every parent (e.g. all sub types of all base types) so counts are totals.

### `itemDB.itemList.equippable`

- **Location:** `itemDB.itemList.equippable` (file: db-A)
- **Keying:** object keyed by baseTypeId (string of int)
- **Record count:** 39
- **Key space:** 39 keys, numeric 0..41
- **Notes:** Equippable base types (gear, weapons, idols, altar, lenses, blessings). `subItems` is a nested object keyed by subTypeId.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `baseTypeId` | number | always | 0..41 (>12 distinct) | `0` | Base item type id (see enums.md "base types"). |
| `maxAffixes` | number | always | values 0,2,4 | `4` | Max affixes an item of this base type may have. |
| `affixEffectModifier` | number | always | values -0.83,-0.62,-0.33,-0.05,0,0.17,0.5,0.75,2.2 | `0` | Base affix effectiveness modifier for the base type (idols/relics >0). |
| `size` | object | always |  | `{"x":2,"y":2}` | Inventory grid size {x,y}. |
| `size.x` | number | always | values 1,2,3,4 | `2` |  |
| `size.y` | number | always | values 1,2,3,4 | `2` |  |
| `obsoleteItemType` | number | always | values 0,1 | `0` |  |
| `type` | number | always | 0..41 (>12 distinct) | `0` | Equal to baseTypeId for every equippable base type (verified). |
| `isWeapon` | number | always | values 0,1 | `0` | 1/true if base type is a weapon. |
| `maxSockets` | number | always | values 0 | `0` | Max sockets. |
| `minimumDropLevel` | number | always | values 0,5,11,20,25,30 | `0` | Min area level for drops. |
| `rerollChance` | number | always | values 0,0.25,0.5,0.8,0.88,0.89,0.9,0.91,0.95,1 | `0` | Chance for the drop to be re-rolled to another type. |
| `subTypeClassSpecificity` | number | always | values 0,1,2 | `1` | Class specificity mode for sub types (0/1/2). |
| `classAffinity` | number | always | values 0,5,10,13,15,16,21,26 | `0` | Class affinity (class bit mask, see enums.md). |
| `affinityRerollChance` | number | always | values 0 | `0` | Reroll chance when affinity mismatches. |
| `usePerClassIncompatibilityDropLists` | number | always | values 0,1 | `1` |  |
| `subItems` | object | always |  | `{"1":{"sprite":"I0","subTypeId":1,"levelRequirement":7,"c...` | Sub types (individual base items). |
| `subItems.<key>` | object | 918 occurrences |  | `{"sprite":"I0","subTypeId":1,"levelRequirement":7,"cannot...` |  |
| `subItems.<key>.sprite` | string(912)\|null(6) | 918 occurrences | >12 distinct | `"I0"` | Sprite id (LE Tools) or md5 hash (Maxroll). |
| `subItems.<key>.subTypeId` | number | 918 occurrences | 0..223 (>12 distinct) | `1` | Sub type id within base type. |
| `subItems.<key>.levelRequirement` | number | 918 occurrences | 0..91 (>12 distinct) | `7` | Level required to equip/use. |
| `subItems.<key>.cannotDrop` | number | 918 occurrences | values 0,1 | `1` | 1 if the sub type never drops randomly. |
| `subItems.<key>.onlyDropWhenRequiringAffixEffectiveness` | number | 918 occurrences | values 0,1 | `0` | Drop only where affix effectiveness is required. |
| `subItems.<key>.cannotEquipOnPickup` | number | 918 occurrences | values 0 | `0` | 1 = cannot be auto-equipped on pickup. |
| `subItems.<key>.isCorruptedSubtype` | number | 918 occurrences | values 0,1 | `0` | 1 for corrupted-only sub types. |
| `subItems.<key>.itemTags` | number | 918 occurrences | values 0 | `0` | Item tag bit mask (always 0 in this data). |
| `subItems.<key>.isLegacySubType` | number | 918 occurrences | values 0 | `0` | Legacy (removed) sub type. |
| `subItems.<key>.obsoleteItem` | number | 918 occurrences | values 0 | `0` | Obsolete item flag. |
| `subItems.<key>.displayNameKey` | string | 918 occurrences | >12 distinct | `"Item_Names.Item_SubType_Name_0_1"` | i18n key for the display name. |
| `subItems.<key>.implicits` | array | 918 occurrences | len 0..3 | `[{"property":10,"specialTag":0,"tags":0,"extraTag":0,"typ...` | Implicit stat lines of the sub type. |
| `subItems.<key>.affixEffectiveness` | number | 918 occurrences | values 0,1 | `0` | Affix effectiveness granted by the sub type. |
| `subItems.<key>.addedWeaponRange` | number | 918 occurrences | values -0.2,-0.1,0,0.1,0.3,0.5,0.6,0.7,0.9,1.1 | `0` | Added weapon range. |
| `subItems.<key>.attackRate` | number | 918 occurrences | 0.76..1.24 (>12 distinct) | `1` | Weapon attacks per second. |
| `subItems.<key>.classRequirement` | number | 918 occurrences | values 0,1,2,4,8,16 | `0` | Class requirement bit mask: 1<<classID (1 Primalist, 2 Mage, 4 Sentinel, 8 Acolyte, 16 Rogue). |
| `subItems.<key>.subClassRequirement` | number | 918 occurrences | values 0 | `0` | Mastery requirement. |
| `subItems.<key>.IMSetTier` | number | 918 occurrences | values 0,1,2,3,4,5,6,7,8,9 | `7` | Item-model set tier (visual). |
| `subItems.<key>.isStartingItem` | boolean | 918 occurrences | values false,true | `false` | Starting item flag. |
| `subItems.<key>.uniques` | object | 918 occurrences |  | `{}` |  |
| `perClassIncompatibilityDropLists` | array | always | len 0..5 | `[[53,24,25],[16,17,18],[32,33,59],[8,9,10],[72,42,43,44]]` |  |
| `perClassIncompatibilityDropLists[]` | array | 15 occurrences | len 3..4 | `[53,24,25]` |  |
| `perClassIncompatibilityDropLists[][]` | number | 48 occurrences | 3..72 (>12 distinct) | `53` |  |
| `displayNameKey` | string | always | >12 distinct | `"Item_Names.Item_BaseType_Name_0"` | i18n key for the display name. |

Example (key `0`, record #0, trimmed):

```json
{
  "baseTypeId": 0,
  "maxAffixes": 4,
  "affixEffectModifier": 0,
  "size": {"x": 2, "y": 2},
  "obsoleteItemType": 0,
  "type": 0,
  "isWeapon": 0,
  "maxSockets": 0,
  "minimumDropLevel": 0,
  "rerollChance": 0,
  "subTypeClassSpecificity": 1,
  "classAffinity": 0,
  "affinityRerollChance": 0,
  "usePerClassIncompatibilityDropLists": 1,
  "subItems": {
    "1": {
      "sprite": "I0",
      "subTypeId": 1,
      "levelRequirement": 7,
      "cannotDrop": 1,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_1",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 5,
          "implicitMaxValue": 5
        },
        {
          "property": 8,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 10,
          "implicitMaxValue": 35
        },
        "...(+1 more)"
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 0,
      "subClassRequirement": 0,
      "IMSetTier": 7,
      "isStartingItem": false,
      "uniques": {}
    },
    "2": {
      "sprite": "I1",
      "subTypeId": 2,
      "levelRequirement": 10,
      "cannotDrop": 1,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_2",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 40,
          "implicitMaxValue": 40
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 0,
      "subClassRequirement": 0,
      "IMSetTier": 8,
      "isStartingItem": false,
      "uniques": {}
    },
    "4": {
      "sprite": "I2",
      "subTypeId": 4,
      "levelRequirement": 24,
      "cannotDrop": 1,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_4",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 50,
          "implicitMaxValue": 50
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 0,
      "subClassRequirement": 0,
      "IMSetTier": 7,
      "isStartingItem": false,
      "uniques": {}
    },
    "5": {
      "sprite": "I3",
      "subTypeId": 5,
      "levelRequirement": 39,
      "cannotDrop": 1,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_5",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 75,
          "implicitMaxValue": 75
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 0,
      "subClassRequirement": 0,
      "IMSetTier": 8,
      "isStartingItem": false,
      "uniques": {}
    },
    "6": {
      "sprite": "I4",
      "subTypeId": 6,
      "levelRequirement": 65,
      "cannotDrop": 1,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_6",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 130,
          "implicitMaxValue": 130
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 0,
      "subClassRequirement": 0,
      "IMSetTier": 8,
      "isStartingItem": false,
      "uniques": {}
    },
    "7": {
      "sprite": "I5",
      "subTypeId": 7,
      "levelRequirement": 35,
      "cannotDrop": 1,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_7",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 50,
          "implicitMaxValue": 50
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 0,
      "subClassRequirement": 0,
      "IMSetTier": 7,
      "isStartingItem": false,
      "uniques": {}
    },
    "8": {
      "sprite": "I6",
      "subTypeId": 8,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_8",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 6,
          "implicitMaxValue": 6
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 8,
      "subClassRequirement": 0,
      "IMSetTier": 0,
      "isStartingItem": false,
      "uniques": {}
    },
    "9": {
      "sprite": "I7",
      "subTypeId": 9,
      "levelRequirement": 3,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_9",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 13,
          "implicitMaxValue": 13
        },
        {
          "property": 28,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 0.05,
          "implicitMaxValue": 0.19
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 8,
      "subClassRequirement": 0,
      "IMSetTier": 1,
      "isStartingItem": false,
      "uniques": {}
    },
    "10": {
      "sprite": "I8",
      "subTypeId": 10,
      "levelRequirement": 6,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_10",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 9,
          "implicitMaxValue": 9
        },
        {
          "property": 0,
          "specialTag": 0,
          "tags": 256,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 2,
          "implicitMaxValue": 3
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 8,
      "subClassRequirement": 0,
      "IMSetTier": 7,
      "isStartingItem": false,
      "uniques": {}
    },
    "11": {
      "sprite": "I9",
      "subTypeId": 11,
      "levelRequirement": 16,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_11",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 61,
          "implicitMaxValue": 61
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 8,
      "subClassRequirement": 0,
      "IMSetTier": 4,
      "isStartingItem": false,
      "uniques": {}
    },
    "12": {
      "sprite": "I10",
      "subTypeId": 12,
      "levelRequirement": 29,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_12",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 49,
          "implicitMaxValue": 49
        },
        {
          "property": 27,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 0.07,
          "implicitMaxValue": 0.41
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 8,
      "subClassRequirement": 0,
      "IMSetTier": 3,
      "isStartingItem": false,
      "uniques": {}
    },
    "13": {
      "sprite": "I11",
      "subTypeId": 13,
      "levelRequirement": 51,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_13",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 151,
          "implicitMaxValue": 151
        },
        {
          "property": 75,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 0.11,
          "implicitMaxValue": 0.15
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 8,
      "subClassRequirement": 0,
      "IMSetTier": 5,
      "isStartingItem": false,
      "uniques": {}
    },
    "14": {
      "sprite": "I12",
      "subTypeId": 14,
      "levelRequirement": 60,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_14",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 129,
          "implicitMaxValue": 129
        },
        {
          "property": 116,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 0.09,
          "implicitMaxValue": 0.23
        },
        "...(+1 more)"
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 8,
      "subClassRequirement": 0,
      "IMSetTier": 6,
      "isStartingItem": false,
      "uniques": {}
    },
    "15": {
      "sprite": "I13",
      "subTypeId": 15,
      "levelRequirement": 66,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_15",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 163,
          "implicitMaxValue": 163
        },
        {
          "property": 75,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 0.11,
          "implicitMaxValue": 0.16
        },
        "...(+1 more)"
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 8,
      "subClassRequirement": 0,
      "IMSetTier": 8,
      "isStartingItem": false,
      "uniques": {}
    },
    "16": {
      "sprite": "I14",
      "subTypeId": 16,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_16",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 8,
          "implicitMaxValue": 8
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 2,
      "subClassRequirement": 0,
      "IMSetTier": 0,
      "isStartingItem": false,
      "uniques": {}
    },
    "17": {
      "sprite": "I15",
      "subTypeId": 17,
      "levelRequirement": 3,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_17",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 20,
          "implicitMaxValue": 20
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 2,
      "subClassRequirement": 0,
      "IMSetTier": 4,
      "isStartingItem": false,
      "uniques": {}
    },
    "18": {
      "sprite": "I16",
      "subTypeId": 18,
      "levelRequirement": 6,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_18",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 28,
          "implicitMaxValue": 28
        },
        {
          "property": 8,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 6,
          "implicitMaxValue": 28
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 2,
      "subClassRequirement": 0,
      "IMSetTier": 2,
      "isStartingItem": false,
      "uniques": {}
    },
    "19": {
      "sprite": "I17",
      "subTypeId": 19,
      "levelRequirement": 22,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_19",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 35,
          "implicitMaxValue": 35
        },
        {
          "property": 92,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 3,
          "implicitMaxValue": 15
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 2,
      "subClassRequirement": 0,
      "IMSetTier": 3,
      "isStartingItem": false,
      "uniques": {}
    },
    "20": {
      "sprite": "I18",
      "subTypeId": 20,
      "levelRequirement": 33,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_20",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 63,
          "implicitMaxValue": 63
        },
        {
          "property": 18,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 1,
          "implicitValue": 0.09,
          "implicitMaxValue": 0.18
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 2,
      "subClassRequirement": 0,
      "IMSetTier": 3,
      "isStartingItem": false,
      "uniques": {}
    },
    "21": {
      "sprite": "I19",
      "subTypeId": 21,
      "levelRequirement": 50,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_21",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 184,
          "implicitMaxValue": 184
        },
        {
          "property": 89,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 0.2,
          "implicitMaxValue": 0.4
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 2,
      "subClassRequirement": 0,
      "IMSetTier": 7,
      "isStartingItem": false,
      "uniques": {}
    },
    "22": {
      "sprite": "I20",
      "subTypeId": 22,
      "levelRequirement": 56,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_22",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 96,
          "implicitMaxValue": 96
        },
        {
          "property": 4,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 1,
          "implicitValue": 0.4,
          "implicitMaxValue": 0.72
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 2,
      "subClassRequirement": 0,
      "IMSetTier": 7,
      "isStartingItem": false,
      "uniques": {}
    },
    "23": {
      "sprite": "I21",
      "subTypeId": 23,
      "levelRequirement": 63,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_23",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 77,
          "implicitMaxValue": 77
        },
        {
          "property": 99,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 0.3,
          "implicitMaxValue": 0.77
        },
        "...(+1 more)"
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 2,
      "subClassRequirement": 0,
      "IMSetTier": 6,
      "isStartingItem": false,
      "uniques": {}
    },
    "24": {
      "sprite": "I22",
      "subTypeId": 24,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_24",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 15,
          "implicitMaxValue": 15
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 1,
      "subClassRequirement": 0,
      "IMSetTier": 1,
      "isStartingItem": false,
      "uniques": {}
    },
    "25": {
      "sprite": "I23",
      "subTypeId": 25,
      "levelRequirement": 7,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_25",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 18,
          "implicitMaxValue": 18
        },
        {
          "property": 19,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 1,
          "implicitMaxValue": 4
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 1,
      "subClassRequirement": 0,
      "IMSetTier": 0,
      "isStartingItem": false,
      "uniques": {}
    },
    "26": {
      "sprite": "I24",
      "subTypeId": 26,
      "levelRequirement": 13,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_26",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 36,
          "implicitMaxValue": 36
        },
        {
          "property": 17,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 1,
          "implicitValue": 0.1,
          "implicitMaxValue": 0.16
        },
        "...(+1 more)"
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 1,
      "subClassRequirement": 0,
      "IMSetTier": 4,
      "isStartingItem": false,
      "uniques": {}
    },
    "27": {
      "sprite": "I25",
      "subTypeId": 27,
      "levelRequirement": 21,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_27",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 86,
          "implicitMaxValue": 86
        },
        {
          "property": 28,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 0.1,
          "implicitMaxValue": 0.4
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 1,
      "subClassRequirement": 0,
      "IMSetTier": 3,
      "isStartingItem": false,
      "uniques": {}
    },
    "28": {
      "sprite": "I26",
      "subTypeId": 28,
      "levelRequirement": 30,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_28",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 65,
          "implicitMaxValue": 65
        },
        {
          "property": 4,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 0.02,
          "implicitMaxValue": 0.03
        },
        "...(+1 more)"
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 1,
      "subClassRequirement": 0,
      "IMSetTier": 7,
      "isStartingItem": false,
      "uniques": {}
    },
    "29": {
      "sprite": "I27",
      "subTypeId": 29,
      "levelRequirement": 58,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_29",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 84,
          "implicitMaxValue": 84
        },
        {
          "property": 14,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 0.32,
          "implicitMaxValue": 0.44
        },
        "...(+1 more)"
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 1,
      "subClassRequirement": 0,
      "IMSetTier": 8,
      "isStartingItem": false,
      "uniques": {}
    },
    "30": {
      "sprite": "I28",
      "subTypeId": 30,
      "levelRequirement": 58,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_30",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 84,
          "implicitMaxValue": 84
        },
        {
          "property": 0,
          "specialTag": 0,
          "tags": 1,
          "extraTag": 0,
          "type": 1,
          "implicitValue": 0.32,
          "implicitMaxValue": 0.64
        },
        "...(+1 more)"
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 1,
      "subClassRequirement": 0,
      "IMSetTier": 5,
      "isStartingItem": false,
      "uniques": {}
    },
    "31": {
      "sprite": "I29",
      "subTypeId": 31,
      "levelRequirement": 64,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_31",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 142,
          "implicitMaxValue": 142
        },
        {
          "property": 8,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 24,
          "implicitMaxValue": 64
        },
        "...(+1 more)"
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 1,
      "subClassRequirement": 0,
      "IMSetTier": 2,
      "isStartingItem": false,
      "uniques": {}
    },
    "32": {
      "sprite": "I30",
      "subTypeId": 32,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_32",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 35,
          "implicitMaxValue": 35
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 4,
      "subClassRequirement": 0,
      "IMSetTier": 0,
      "isStartingItem": false,
      "uniques": {}
    },
    "33": {
      "sprite": "I31",
      "subTypeId": 33,
      "levelRequirement": 3,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_33",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 40,
          "implicitMaxValue": 40
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 4,
      "subClassRequirement": 0,
      "IMSetTier": 1,
      "isStartingItem": false,
      "uniques": {}
    },
    "34": {
      "sprite": "I32",
      "subTypeId": 34,
      "levelRequirement": 12,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_34",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 56,
          "implicitMaxValue": 56
        },
        {
          "property": 45,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 0.1,
          "implicitMaxValue": 0.25
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 4,
      "subClassRequirement": 0,
      "IMSetTier": 2,
      "isStartingItem": false,
      "uniques": {}
    },
    "35": {
      "sprite": "I33",
      "subTypeId": 35,
      "levelRequirement": 20,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_0_35",
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 95,
          "implicitMaxValue": 95
        }
      ],
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "classRequirement": 4,
      "subClassRequirement": 0,
      "IMSetTier": 3,
      "isStartingItem": false,
      "uniques": {}
    },
    "...": "+37 more keys"
  },
  "perClassIncompatibilityDropLists": [
    [53, 24, "...(+1 more)"],
    [16, 17, "...(+1 more)"],
    "...(+3 more)"
  ],
  "displayNameKey": "Item_Names.Item_BaseType_Name_0"
}
```

### `itemDB.itemList.nonEquippable`

- **Location:** `itemDB.itemList.nonEquippable` (file: db-A)
- **Keying:** object keyed by baseTypeId (101..109)
- **Record count:** 9
- **Key space:** 9 keys, numeric 101..109
- **Notes:** Non-equippable base types (shards, runes, glyphs, keys, lost memories, resonances, woven echoes, bags, lenses).

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `baseTypeId` | number | always | values 101,102,103,104,105,106,107,108,109 | `101` | Base item type id (see enums.md "base types"). |
| `maxAffixes` | number | always | values 0 | `0` | Max affixes an item of this base type may have. |
| `affixEffectModifier` | number | always | values 0 | `0` | Base affix effectiveness modifier for the base type (idols/relics >0). |
| `size` | object | always |  | `{"x":1,"y":1}` | Inventory grid size {x,y}. |
| `size.x` | number | always | values 1,2 | `1` |  |
| `size.y` | number | always | values 1,2 | `1` |  |
| `obsoleteItemType` | number | always | values 0 | `0` |  |
| `maxSockets` | number | always | values 0 | `0` | Max sockets. |
| `subItems` | object | always |  | `{"0":{"sprite":"I912","lensEffect":null,"subTypeId":0,"le...` | Sub types (individual base items). |
| `subItems.<key>` | object | 640 occurrences |  | `{"sprite":"I912","lensEffect":null,"subTypeId":0,"levelRe...` |  |
| `subItems.<key>.sprite` | string | 640 occurrences | >12 distinct | `"I912"` | Sprite id (LE Tools) or md5 hash (Maxroll). |
| `subItems.<key>.lensEffect` | null(627)\|string(13) | 640 occurrences | >12 distinct | `null` |  |
| `subItems.<key>.subTypeId` | number | 640 occurrences | 0..1156 (>12 distinct) | `0` | Sub type id within base type. |
| `subItems.<key>.levelRequirement` | number | 640 occurrences | 0..100 (>12 distinct) | `42` | Level required to equip/use. |
| `subItems.<key>.cannotDrop` | number | 640 occurrences | values 0,1 | `0` | 1 if the sub type never drops randomly. |
| `subItems.<key>.onlyDropWhenRequiringAffixEffectiveness` | number | 640 occurrences | values 0 | `0` | Drop only where affix effectiveness is required. |
| `subItems.<key>.cannotEquipOnPickup` | number | 640 occurrences | values 0 | `0` | 1 = cannot be auto-equipped on pickup. |
| `subItems.<key>.isCorruptedSubtype` | number | 640 occurrences | values 0 | `0` | 1 for corrupted-only sub types. |
| `subItems.<key>.itemTags` | number | 640 occurrences | values 0 | `0` | Item tag bit mask (always 0 in this data). |
| `subItems.<key>.isLegacySubType` | number | 640 occurrences | values 0,1 | `0` | Legacy (removed) sub type. |
| `subItems.<key>.obsoleteItem` | number | 640 occurrences | values 0,1 | `0` | Obsolete item flag. |
| `subItems.<key>.displayNameKey` | string | 640 occurrences | >12 distinct | `"Item_Names.Item_SubType_Name_101_0"` | i18n key for the display name. |
| `subItems.<key>.rerollChance` | number | 640 occurrences | values 0,0.15,0.2,0.35,0.75,0.85,0.9,0.95,0.975,0.99,0.995,1 | `0` | Chance for the drop to be re-rolled to another type. |
| `subItems.<key>.descriptionKey` | string | 640 occurrences | >12 distinct | `"Item_Names.Item_SubType_Description_101_0"` | i18n key for the description. |
| `displayNameKey` | string | always | values "Item_Names.Item_BaseType_Name_101","Item_Names.Item_BaseType_Name_102","Item_Names.Item_BaseType_Name_103","Item_Names.Item_BaseType_Name_104","Item_Names.Item_BaseType_Name_105","Item_Names.Item_BaseType_Name_106","Item_Names.Item_BaseType_Name_107","Item_Names.Item_BaseType_Name_108","Item_Names.Item_BaseType_Name_109" | `"Item_Names.Item_BaseType_Name_101"` | i18n key for the display name. |
| `subItems.<key>.lensEffectKey` | string | 12 occurrences | values "Common.CircleOfFortune_Lens_0_Effect","Common.CircleOfFortune_Lens_1_Effect","Common.CircleOfFortune_Lens_2_Effect","Common.CircleOfFortune_Lens_3_Effect","Common.CircleOfFortune_Lens_4_Effect","Common.CircleOfFortune_Lens_5_Effect","Common.CircleOfFortune_Lens_6_Effect","Common.CircleOfFortune_Lens_7_Effect","Common.CircleOfFortune_Lens_8_Effect","Common.CircleOfFortune_Lens_9_Effect","Common.CircleOfFortune_Lens_10_Effect","Common.CircleOfFortune_Lens_11_Effect" | `"Common.CircleOfFortune_Lens_0_Effect"` |  |

Example (key `101`, record #0, trimmed):

```json
{
  "baseTypeId": 101,
  "maxAffixes": 0,
  "affixEffectModifier": 0,
  "size": {"x": 1, "y": 1},
  "obsoleteItemType": 0,
  "maxSockets": 0,
  "subItems": {
    "0": {
      "sprite": "I912",
      "lensEffect": null,
      "subTypeId": 0,
      "levelRequirement": 42,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_0",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_0"
    },
    "1": {
      "sprite": "I913",
      "lensEffect": null,
      "subTypeId": 1,
      "levelRequirement": 14,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_1",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_1"
    },
    "2": {
      "sprite": "I914",
      "lensEffect": null,
      "subTypeId": 2,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_2",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_2"
    },
    "3": {
      "sprite": "I915",
      "lensEffect": null,
      "subTypeId": 3,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_3",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_3"
    },
    "4": {
      "sprite": "I916",
      "lensEffect": null,
      "subTypeId": 4,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_4",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_4"
    },
    "5": {
      "sprite": "I917",
      "lensEffect": null,
      "subTypeId": 5,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_5",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_5"
    },
    "6": {
      "sprite": "I918",
      "lensEffect": null,
      "subTypeId": 6,
      "levelRequirement": 20,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_6",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_6"
    },
    "7": {
      "sprite": "I919",
      "lensEffect": null,
      "subTypeId": 7,
      "levelRequirement": 6,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_7",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_7"
    },
    "8": {
      "sprite": "I920",
      "lensEffect": null,
      "subTypeId": 8,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_8",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_8"
    },
    "9": {
      "sprite": "I921",
      "lensEffect": null,
      "subTypeId": 9,
      "levelRequirement": 8,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_9",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_9"
    },
    "10": {
      "sprite": "I922",
      "lensEffect": null,
      "subTypeId": 10,
      "levelRequirement": 19,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_10",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_10"
    },
    "11": {
      "sprite": "I923",
      "lensEffect": null,
      "subTypeId": 11,
      "levelRequirement": 10,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_11",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_11"
    },
    "12": {
      "sprite": "I924",
      "lensEffect": null,
      "subTypeId": 12,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_12",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_12"
    },
    "13": {
      "sprite": "I925",
      "lensEffect": null,
      "subTypeId": 13,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_13",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_13"
    },
    "14": {
      "sprite": "I1159",
      "lensEffect": null,
      "subTypeId": 14,
      "levelRequirement": 15,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_14",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_14"
    },
    "15": {
      "sprite": "I926",
      "lensEffect": null,
      "subTypeId": 15,
      "levelRequirement": 15,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_15",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_15"
    },
    "16": {
      "sprite": "I927",
      "lensEffect": null,
      "subTypeId": 16,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_16",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_16"
    },
    "17": {
      "sprite": "I928",
      "lensEffect": null,
      "subTypeId": 17,
      "levelRequirement": 8,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_17",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_17"
    },
    "18": {
      "sprite": "I929",
      "lensEffect": null,
      "subTypeId": 18,
      "levelRequirement": 6,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_18",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_18"
    },
    "19": {
      "sprite": "I930",
      "lensEffect": null,
      "subTypeId": 19,
      "levelRequirement": 10,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_19",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_19"
    },
    "20": {
      "sprite": "I931",
      "lensEffect": null,
      "subTypeId": 20,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_20",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_20"
    },
    "21": {
      "sprite": "I932",
      "lensEffect": null,
      "subTypeId": 21,
      "levelRequirement": 26,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_21",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_21"
    },
    "22": {
      "sprite": "I933",
      "lensEffect": null,
      "subTypeId": 22,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_22",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_22"
    },
    "23": {
      "sprite": "I934",
      "lensEffect": null,
      "subTypeId": 23,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_23",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_23"
    },
    "24": {
      "sprite": "I935",
      "lensEffect": null,
      "subTypeId": 24,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_24",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_24"
    },
    "25": {
      "sprite": "I936",
      "lensEffect": null,
      "subTypeId": 25,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_25",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_25"
    },
    "26": {
      "sprite": "I937",
      "lensEffect": null,
      "subTypeId": 26,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_26",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_26"
    },
    "27": {
      "sprite": "I938",
      "lensEffect": null,
      "subTypeId": 27,
      "levelRequirement": 6,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_27",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_27"
    },
    "28": {
      "sprite": "I939",
      "lensEffect": null,
      "subTypeId": 28,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_28",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_28"
    },
    "29": {
      "sprite": "I1160",
      "lensEffect": null,
      "subTypeId": 29,
      "levelRequirement": 46,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_29",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_29"
    },
    "30": {
      "sprite": "I940",
      "lensEffect": null,
      "subTypeId": 30,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_30",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_30"
    },
    "31": {
      "sprite": "I941",
      "lensEffect": null,
      "subTypeId": 31,
      "levelRequirement": 0,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_31",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_31"
    },
    "32": {
      "sprite": "I942",
      "lensEffect": null,
      "subTypeId": 32,
      "levelRequirement": 42,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_32",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_32"
    },
    "33": {
      "sprite": "I943",
      "lensEffect": null,
      "subTypeId": 33,
      "levelRequirement": 42,
      "cannotDrop": 0,
      "onlyDropWhenRequiringAffixEffectiveness": 0,
      "cannotEquipOnPickup": 0,
      "isCorruptedSubtype": 0,
      "itemTags": 0,
      "isLegacySubType": 0,
      "obsoleteItem": 0,
      "displayNameKey": "Item_Names.Item_SubType_Name_101_33",
      "rerollChance": 0,
      "descriptionKey": "Item_Names.Item_SubType_Description_101_33"
    },
    "...": "+474 more keys"
  },
  "displayNameKey": "Item_Names.Item_BaseType_Name_101"
}
```

### `equippable[*].subItems`

- **Location:** `itemDB.itemList.equippable.<baseTypeId>.subItems.<subTypeId>` (file: db-A)
- **Keying:** nested object keyed by subTypeId inside each base type
- **Record count:** 918
- **Key space:** 918 keys, e.g. `0/1`, `0/2`, `0/4`, `0/5`
- **Notes:** Item sub types (the individual base items such as "Oak Helm"). Flattened here; the pair (baseTypeId, subTypeId) is the identity.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `sprite` | string(912)\|null(6) | always | >12 distinct | `"I0"` | Sprite id (LE Tools) or md5 hash (Maxroll). |
| `subTypeId` | number | always | 0..223 (>12 distinct) | `1` | Sub type id within base type. |
| `levelRequirement` | number | always | 0..91 (>12 distinct) | `7` | Level required to equip/use. |
| `cannotDrop` | number | always | values 0,1 | `1` | 1 if the sub type never drops randomly. |
| `onlyDropWhenRequiringAffixEffectiveness` | number | always | values 0,1 | `0` | Drop only where affix effectiveness is required. |
| `cannotEquipOnPickup` | number | always | values 0 | `0` | 1 = cannot be auto-equipped on pickup. |
| `isCorruptedSubtype` | number | always | values 0,1 | `0` | 1 for corrupted-only sub types. |
| `itemTags` | number | always | values 0 | `0` | Item tag bit mask (always 0 in this data). |
| `isLegacySubType` | number | always | values 0 | `0` | Legacy (removed) sub type. |
| `obsoleteItem` | number | always | values 0 | `0` | Obsolete item flag. |
| `displayNameKey` | string | always | >12 distinct | `"Item_Names.Item_SubType_Name_0_1"` | i18n key for the display name. |
| `implicits` | array | always | len 0..3 | `[{"property":10,"specialTag":0,"tags":0,"extraTag":0,"typ...` | Implicit stat lines of the sub type. |
| `implicits[]` | object | 1529 occurrences |  | `{"property":10,"specialTag":0,"tags":0,"extraTag":0,"type...` | Implicit stat lines of the sub type. |
| `implicits[].property` | number | 1529 occurrences | 0..133 (>12 distinct) | `10` | Stat property id (SP enum, see enums.md). |
| `implicits[].specialTag` | number | 1529 occurrences | 0..85 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `implicits[].tags` | number | 1529 occurrences | 0..16777216 (>12 distinct) | `0` | Tag bit mask (AT enum, see enums.md). |
| `implicits[].extraTag` | number | 1529 occurrences | values 0 | `0` | Tertiary selector (e.g. extra tag); mostly 0. |
| `implicits[].type` | number | 1529 occurrences | values 0,1,2 | `0` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `implicits[].implicitValue` | number | 1529 occurrences | -4..750 (>12 distinct) | `5` | Implicit roll min value. |
| `implicits[].implicitMaxValue` | number | 1529 occurrences | -5..1000 (>12 distinct) | `5` | Implicit roll max value. |
| `affixEffectiveness` | number | always | values 0,1 | `0` | Affix effectiveness granted by the sub type. |
| `addedWeaponRange` | number | always | values -0.2,-0.1,0,0.1,0.3,0.5,0.6,0.7,0.9,1.1 | `0` | Added weapon range. |
| `attackRate` | number | always | 0.76..1.24 (>12 distinct) | `1` | Weapon attacks per second. |
| `classRequirement` | number | always | values 0,1,2,4,8,16 | `0` | Class requirement bit mask: 1<<classID (1 Primalist, 2 Mage, 4 Sentinel, 8 Acolyte, 16 Rogue). |
| `subClassRequirement` | number | always | values 0 | `0` | Mastery requirement. |
| `IMSetTier` | number | always | values 0,1,2,3,4,5,6,7,8,9 | `7` | Item-model set tier (visual). |
| `isStartingItem` | boolean | always | values false,true | `false` | Starting item flag. |
| `uniques` | object | always |  | `{}` |  |

Example (key `0/1`, record #0, trimmed):

```json
{
  "sprite": "I0",
  "subTypeId": 1,
  "levelRequirement": 7,
  "cannotDrop": 1,
  "onlyDropWhenRequiringAffixEffectiveness": 0,
  "cannotEquipOnPickup": 0,
  "isCorruptedSubtype": 0,
  "itemTags": 0,
  "isLegacySubType": 0,
  "obsoleteItem": 0,
  "displayNameKey": "Item_Names.Item_SubType_Name_0_1",
  "implicits": [
    {
      "property": 10,
      "specialTag": 0,
      "tags": 0,
      "extraTag": 0,
      "type": 0,
      "implicitValue": 5,
      "implicitMaxValue": 5
    },
    {
      "property": 8,
      "specialTag": 0,
      "tags": 0,
      "extraTag": 0,
      "type": 0,
      "implicitValue": 10,
      "implicitMaxValue": 35
    },
    "...(+1 more)"
  ],
  "affixEffectiveness": 0,
  "addedWeaponRange": 0,
  "attackRate": 1,
  "classRequirement": 0,
  "subClassRequirement": 0,
  "IMSetTier": 7,
  "isStartingItem": false,
  "uniques": {}
}
```

### `nonEquippable[*].subItems`

- **Location:** `itemDB.itemList.nonEquippable.<baseTypeId>.subItems.<subTypeId>` (file: db-A)
- **Keying:** nested object keyed by subTypeId
- **Record count:** 640
- **Key space:** 640 keys, e.g. `101/0`, `101/1`, `101/2`, `101/3`
- **Notes:** Sub types of non-equippable base types.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `sprite` | string | always | >12 distinct | `"I912"` | Sprite id (LE Tools) or md5 hash (Maxroll). |
| `lensEffect` | null(627)\|string(13) | always | >12 distinct | `null` |  |
| `subTypeId` | number | always | 0..1156 (>12 distinct) | `0` | Sub type id within base type. |
| `levelRequirement` | number | always | 0..100 (>12 distinct) | `42` | Level required to equip/use. |
| `cannotDrop` | number | always | values 0,1 | `0` | 1 if the sub type never drops randomly. |
| `onlyDropWhenRequiringAffixEffectiveness` | number | always | values 0 | `0` | Drop only where affix effectiveness is required. |
| `cannotEquipOnPickup` | number | always | values 0 | `0` | 1 = cannot be auto-equipped on pickup. |
| `isCorruptedSubtype` | number | always | values 0 | `0` | 1 for corrupted-only sub types. |
| `itemTags` | number | always | values 0 | `0` | Item tag bit mask (always 0 in this data). |
| `isLegacySubType` | number | always | values 0,1 | `0` | Legacy (removed) sub type. |
| `obsoleteItem` | number | always | values 0,1 | `0` | Obsolete item flag. |
| `displayNameKey` | string | always | >12 distinct | `"Item_Names.Item_SubType_Name_101_0"` | i18n key for the display name. |
| `rerollChance` | number | always | values 0,0.15,0.2,0.35,0.75,0.85,0.9,0.95,0.975,0.99,0.995,1 | `0` | Chance for the drop to be re-rolled to another type. |
| `descriptionKey` | string | always | >12 distinct | `"Item_Names.Item_SubType_Description_101_0"` | i18n key for the description. |
| `lensEffectKey` | string | 12/640 (1.9%) | values "Common.CircleOfFortune_Lens_0_Effect","Common.CircleOfFortune_Lens_1_Effect","Common.CircleOfFortune_Lens_2_Effect","Common.CircleOfFortune_Lens_3_Effect","Common.CircleOfFortune_Lens_4_Effect","Common.CircleOfFortune_Lens_5_Effect","Common.CircleOfFortune_Lens_6_Effect","Common.CircleOfFortune_Lens_7_Effect","Common.CircleOfFortune_Lens_8_Effect","Common.CircleOfFortune_Lens_9_Effect","Common.CircleOfFortune_Lens_10_Effect","Common.CircleOfFortune_Lens_11_Effect" | `"Common.CircleOfFortune_Lens_0_Effect"` |  |

Example (key `101/10`, record #10, trimmed):

```json
{
  "sprite": "I922",
  "lensEffect": null,
  "subTypeId": 10,
  "levelRequirement": 19,
  "cannotDrop": 0,
  "onlyDropWhenRequiringAffixEffectiveness": 0,
  "cannotEquipOnPickup": 0,
  "isCorruptedSubtype": 0,
  "itemTags": 0,
  "isLegacySubType": 0,
  "obsoleteItem": 0,
  "displayNameKey": "Item_Names.Item_SubType_Name_101_10",
  "rerollChance": 0,
  "descriptionKey": "Item_Names.Item_SubType_Description_101_10"
}
```

### `equippable[*].subItems[*].implicits[]`

- **Location:** `itemDB.itemList.equippable.<b>.subItems.<s>.implicits[]` (file: db-A)
- **Keying:** array inside each equippable sub type
- **Record count:** 1529
- **Notes:** Implicit mods of a sub type (flattened).

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `property` | number | always | 0..133 (>12 distinct) | `10` | Stat property id (SP enum, see enums.md). |
| `specialTag` | number | always | 0..85 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `tags` | number | always | 0..16777216 (>12 distinct) | `0` | Tag bit mask (AT enum, see enums.md). |
| `extraTag` | number | always | values 0 | `0` | Tertiary selector (e.g. extra tag); mostly 0. |
| `type` | number | always | values 0,1,2 | `0` | modifierType: 0 added, 1 increased, 2 more (enums.md). |
| `implicitValue` | number | always | -4..750 (>12 distinct) | `5` | Implicit roll min value. |
| `implicitMaxValue` | number | always | -5..1000 (>12 distinct) | `5` | Implicit roll max value. |

Example (record #2, trimmed):

```json
{
  "property": 0,
  "specialTag": 0,
  "tags": 256,
  "extraTag": 0,
  "type": 1,
  "implicitValue": 0.05,
  "implicitMaxValue": 0.25
}
```

### `equippable[*].subItems[*].uniques`

- **Location:** `itemDB.itemList.equippable.<b>.subItems.<s>.uniques` (file: db-A)
- **Keying:** object (uniqueId -> value), usually empty
- **Record count:** 0
- **Notes:** Present on every equippable sub type.

_No records._

### `itemDB.affixList.singleAffixes`

- **Location:** `itemDB.affixList.singleAffixes` (file: db-A)
- **Keying:** object keyed by affixId
- **Record count:** 616
- **Key space:** 616 keys, numeric 0..1152
- **Notes:** Affixes with exactly one stat line (affixProperties length 1) and one roll per tier.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `singleSetAffix` | boolean | always | values false | `false` | Always false. |
| `affixId` | number | always | 0..1152 (>12 distinct) | `0` | Affix numeric id (0..1155). |
| `levelRequirement` | number | always | 0..80 (>12 distinct) | `42` | Level required to equip/use. |
| `type` | number | always | values 0,1 | `0` | Affix type: 0 prefix, 1 suffix (enums.md). |
| `standardAffixEffectModifier` | number | always | values -0.83,-0.62,-0.33,-0.05,0,0.17,0.5,0.75,2.2 | `0.17` | Affix effectiveness modifier. |
| `rerollChance` | number | always | values 0 | `0` | Chance for the drop to be re-rolled to another type. |
| `weighting` | number | always | 0.06..2 (>12 distinct) | `0.3` | Roll weight. |
| `group` | number | always | values 0,1,2,3,4,5,6,7 | `2` | Group id 0..7 (semantics not confirmed; sample affixes per group in enums.md). |
| `canRollOn` | array | always | len 1..20 | `[20]` | Base type ids the affix can roll on. |
| `canRollOn[]` | number | 1583 occurrences | 0..41 (>12 distinct) | `20` | Base type ids the affix can roll on. |
| `specificRerollChances` | array | always | len 0..14 | `[]` | Per-equipment-type reroll overrides. |
| `rollsOn` | number | always | values 0,1 | `0` | 0 = rolls on gear/altar, 1 = rolls on idols (472/472 affixes with canRollOn in idol base types 25..33 have rollsOn=1; no other affix does). |
| `classSpecificity` | number | always | 0..59 (>12 distinct) | `0` | Class bit mask for the affix: 1<<(classID+1); bit 0 (=1) used by Weaver idol affixes. |
| `tiers` | array | always | len 1..8 | `[{"tierName":null,"requiredLevel":0,"rolls":[{"min":0.04,...` | Tier list. |
| `tiers[]` | object | 2765 occurrences |  | `{"tierName":null,"requiredLevel":0,"rolls":[{"min":0.04,"...` | Tier list. |
| `tiers[].tierName` | null | 2765 occurrences | values null | `null` | Optional tier name (null). |
| `tiers[].requiredLevel` | number | 2765 occurrences | values 0 | `0` | Required level for the tier (0 = none). |
| `tiers[].rolls` | array | 2765 occurrences | len 1..1 | `[{"min":0.04,"max":0.04}]` | Per-stat-line {min,max} for this tier. |
| `displayCategory` | number | always | 0..44 (>12 distinct) | `3` | Index into displayCategoryKeys / affixDisplayCategories. |
| `titleType` | number | always | values 0,1 | `0` | 0 = ordinary title, 1 = title is the class name possessive (e.g. Primalist possessive) -- 303/303 are class-specific affixes (enums.md). |
| `t6Compatibility` | number | always | values 0,1,2 | `0` | 0 normal, 1..2 special T6/exalted compatibility. |
| `useGeneratedName` | number | always | values 0,1 | `1` | Title text is generated from the stat. |
| `specialAffixType` | number | always | values 0,2,6,7 | `0` | 0 normal, 1 experimental, 2 personal, 3 set (reforged), 4 enchanted idol, 5 weaver idol, 6 corrupted / idol altar, 7 variant (see enums.md). |
| `affixMorphology` | number | always | values 0,1,2,3 | `2` | Grammatical shape of the title (enums.md): 0 noun possessive (e.g. Guardian possessive), 1 class possessive, 2 adjective prefix ("Inevitable"), 3 suffix phrase ("of Defense"). |
| `forUniqueId` | number | always | values 0 | `0` | For set/personal affixes: the unique id this affix belongs to. |
| `lootFilterOverrideNameKey` | null(608)\|string(8) | always | values null,"Item_Affixes.Item_Affix_1_FilterOver...","Item_Affixes.Item_Affix_8_FilterOver...","Item_Affixes.Item_Affix_25_FilterOve...","Item_Affixes.Item_Affix_31_FilterOve...","Item_Affixes.Item_Affix_52_FilterOve...","Item_Affixes.Item_Affix_59_FilterOve...","Item_Affixes.Item_Affix_96_FilterOve...","Item_Affixes.Item_Affix_331_FilterOv..." | `null` | i18n key. |
| `affixDisplayNameKey` | string | always | >12 distinct | `"Item_Affixes.Item_Affix_0_DisplayName"` | i18n key. |
| `affixTitleKey` | string(525)\|null(91) | always | >12 distinct | `"Item_Affixes.Item_Affix_0_Title"` | i18n key for the title. |
| `affixProperties` | array | always | len 1..1 | `[{"modDisplayNameKey":"Item_Affixes.ItemAffix_0_Affix_A",...` | Stat lines granted by the affix. |
| `affixProperties[]` | object | 616 occurrences |  | `{"modDisplayNameKey":"Item_Affixes.ItemAffix_0_Affix_A","...` | Stat lines granted by the affix. |
| `affixProperties[].modDisplayNameKey` | string | 616 occurrences | >12 distinct | `"Item_Affixes.ItemAffix_0_Affix_A"` | i18n key for the stat-line text. |
| `affixProperties[].property` | number | 616 occurrences | 0..130 (>12 distinct) | `59` | Stat property id (SP enum, see enums.md). |
| `affixProperties[].specialTag` | number | 616 occurrences | 0..93 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `affixProperties[].tags` | number | 616 occurrences | 0..16777472 (>12 distinct) | `16` | Tag bit mask (AT enum, see enums.md). |
| `affixProperties[].extraTag` | number | 616 occurrences | values 0,143 | `0` | Tertiary selector (e.g. extra tag); mostly 0. |
| `affixProperties[].modifierType` | number | 616 occurrences | values 0,1,2 | `0` | 0 added, 1 increased, 2 more (see enums.md). |
| `affixProperties[].setProperty` | number | 616 occurrences | values 0 | `0` | 1 if the stat line is a set-bonus style property (1 case). |
| `affixProperties[].useGeneratedName` | number | 616 occurrences | values 0 | `0` | Title text is generated from the stat. |
| `affixProperties[].disableAltText` | number | 616 occurrences | values 0 | `0` | Suppress alt tooltip. |
| `rarityTier` | string | always | values "T4" | `"T4"` | Always "T4" in this data. |
| `specificRerollChances[]` | object | 218 occurrences |  | `{"equipmentType":2,"rerollChance":0.5,"weighting":0.5}` | Per-equipment-type reroll overrides. |
| `specificRerollChances[].equipmentType` | number | 218 occurrences | 2..33 (>12 distinct) | `2` | Base type id the override applies to. |
| `specificRerollChances[].rerollChance` | number | 218 occurrences | values 0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.75,0.8,0.9 | `0.5` | Chance for the drop to be re-rolled to another type. |
| `specificRerollChances[].weighting` | number | 218 occurrences | values 0.100000024,0.19999999,0.25,0.3,0.39999998,0.5,0.6,0.7,0.8,0.9,1 | `0.5` | Roll weight. |

Example (key `1`, record #1, trimmed):

```json
{
  "singleSetAffix": false,
  "affixId": 1,
  "levelRequirement": 14,
  "type": 1,
  "standardAffixEffectModifier": 0,
  "rerollChance": 0,
  "weighting": 0.6,
  "group": 0,
  "canRollOn": [0, 1, "...(+2 more)"],
  "specificRerollChances": [
    {"equipmentType": 2, "rerollChance": 0.5, "weighting": 0.5}
  ],
  "rollsOn": 0,
  "classSpecificity": 0,
  "tiers": [
    {
      "tierName": null,
      "requiredLevel": 0,
      "rolls": [
        {"min": 0.1, "max": 0.12}
      ]
    },
    {
      "tierName": null,
      "requiredLevel": 0,
      "rolls": [
        {"min": 0.13, "max": 0.16}
      ]
    },
    "...(+6 more)"
  ],
  "displayCategory": 8,
  "titleType": 0,
  "t6Compatibility": 0,
  "useGeneratedName": 0,
  "specialAffixType": 0,
  "affixMorphology": 3,
  "forUniqueId": 0,
  "lootFilterOverrideNameKey": "Item_Affixes.Item_Affix_1_FilterOverride",
  "affixDisplayNameKey": "Item_Affixes.Item_Affix_1_DisplayName",
  "affixTitleKey": "Item_Affixes.Item_Affix_1_Title",
  "affixProperties": [
    {
      "modDisplayNameKey": "Item_Affixes.ItemAffix_1_Affix_A",
      "property": 10,
      "specialTag": 0,
      "tags": 0,
      "extraTag": 0,
      "modifierType": 1,
      "setProperty": 0,
      "useGeneratedName": 0,
      "disableAltText": 0
    }
  ],
  "rarityTier": "T4"
}
```

### `itemDB.affixList.multiAffixes`

- **Location:** `itemDB.affixList.multiAffixes` (file: db-A)
- **Keying:** object keyed by affixId
- **Record count:** 540
- **Key space:** 540 keys, numeric 14..1156
- **Notes:** Affixes with 2+ stat lines (hybrid); each tier has one roll per stat line.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `singleSetAffix` | boolean | always | values false | `false` | Always false. |
| `affixId` | number | always | 14..1156 (>12 distinct) | `14` | Affix numeric id (0..1155). |
| `levelRequirement` | number | always | 0..75 (>12 distinct) | `15` | Level required to equip/use. |
| `type` | number | always | values 0,1 | `0` | Affix type: 0 prefix, 1 suffix (enums.md). |
| `standardAffixEffectModifier` | number | always | values -0.83,-0.62,-0.33,-0.05,0,0.17,0.5,0.75,2.2 | `0` | Affix effectiveness modifier. |
| `rerollChance` | number | always | values 0 | `0` | Chance for the drop to be re-rolled to another type. |
| `weighting` | number | always | 0.07999998..2 (>12 distinct) | `1` | Roll weight. |
| `group` | number | always | values 0,1,2,3,4,5,6 | `4` | Group id 0..7 (semantics not confirmed; sample affixes per group in enums.md). |
| `canRollOn` | array | always | len 1..14 | `[21,22,20,4]` | Base type ids the affix can roll on. |
| `canRollOn[]` | number | 956 occurrences | 0..41 (>12 distinct) | `21` | Base type ids the affix can roll on. |
| `specificRerollChances` | array | always | len 0..2 | `[]` | Per-equipment-type reroll overrides. |
| `rollsOn` | number | always | values 0,1 | `0` | 0 = rolls on gear/altar, 1 = rolls on idols (472/472 affixes with canRollOn in idol base types 25..33 have rollsOn=1; no other affix does). |
| `classSpecificity` | number | always | 0..61 (>12 distinct) | `0` | Class bit mask for the affix: 1<<(classID+1); bit 0 (=1) used by Weaver idol affixes. |
| `tiers` | array | always | len 1..8 | `[{"tierName":null,"requiredLevel":0,"rolls":[{"min":0.2,"...` | Tier list. |
| `tiers[]` | object | 3473 occurrences |  | `{"tierName":null,"requiredLevel":0,"rolls":[{"min":0.2,"m...` | Tier list. |
| `tiers[].tierName` | null | 3473 occurrences | values null | `null` | Optional tier name (null). |
| `tiers[].requiredLevel` | number | 3473 occurrences | values 0 | `0` | Required level for the tier (0 = none). |
| `tiers[].rolls` | array | 3473 occurrences | len 2..2 | `[{"min":0.2,"max":0.4},{"min":0.05,"max":0.05}]` | Per-stat-line {min,max} for this tier. |
| `displayCategory` | number | always | 1..43 (>12 distinct) | `23` | Index into displayCategoryKeys / affixDisplayCategories. |
| `titleType` | number | always | values 0,1 | `0` | 0 = ordinary title, 1 = title is the class name possessive (e.g. Primalist possessive) -- 303/303 are class-specific affixes (enums.md). |
| `t6Compatibility` | number | always | values 0 | `0` | 0 normal, 1..2 special T6/exalted compatibility. |
| `useGeneratedName` | number | always | values 0 | `0` | Title text is generated from the stat. |
| `specialAffixType` | number | always | values 0,1,2,3,4,5,6 | `0` | 0 normal, 1 experimental, 2 personal, 3 set (reforged), 4 enchanted idol, 5 weaver idol, 6 corrupted / idol altar, 7 variant (see enums.md). |
| `affixMorphology` | number | always | values 0,1,2,3 | `2` | Grammatical shape of the title (enums.md): 0 noun possessive (e.g. Guardian possessive), 1 class possessive, 2 adjective prefix ("Inevitable"), 3 suffix phrase ("of Defense"). |
| `forUniqueId` | number | always | 0..482 (>12 distinct) | `0` | For set/personal affixes: the unique id this affix belongs to. |
| `lootFilterOverrideNameKey` | null(538)\|string(2) | always | values null,"Item_Affixes.Item_Affix_760_FilterOv...","Item_Affixes.Item_Affix_1156_FilterO..." | `null` | i18n key. |
| `affixDisplayNameKey` | string | always | >12 distinct | `"Item_Affixes.Item_Affix_14_DisplayName"` | i18n key. |
| `affixTitleKey` | string(409)\|null(131) | always | >12 distinct | `"Item_Affixes.Item_Affix_14_Title"` | i18n key for the title. |
| `affixProperties` | array | always | len 2..2 | `[{"modDisplayNameKey":"Item_Affixes.ItemAffix_14_Affix_A"...` | Stat lines granted by the affix. |
| `affixProperties[]` | object | 1080 occurrences |  | `{"modDisplayNameKey":"Item_Affixes.ItemAffix_14_Affix_A",...` | Stat lines granted by the affix. |
| `affixProperties[].modDisplayNameKey` | string | 1080 occurrences | >12 distinct | `"Item_Affixes.ItemAffix_14_Affix_A"` | i18n key for the stat-line text. |
| `affixProperties[].property` | number | 1080 occurrences | 0..130 (>12 distinct) | `67` | Stat property id (SP enum, see enums.md). |
| `affixProperties[].specialTag` | number | 1080 occurrences | 0..93 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `affixProperties[].tags` | number | 1080 occurrences | 0..33554432 (>12 distinct) | `0` | Tag bit mask (AT enum, see enums.md). |
| `affixProperties[].extraTag` | number | 1080 occurrences | values 0,220,263,267,353 | `0` | Tertiary selector (e.g. extra tag); mostly 0. |
| `affixProperties[].modifierType` | number | 1080 occurrences | values 0,1,2 | `0` | 0 added, 1 increased, 2 more (see enums.md). |
| `affixProperties[].setProperty` | number | 1080 occurrences | values 0,1 | `0` | 1 if the stat line is a set-bonus style property (1 case). |
| `affixProperties[].useGeneratedName` | number | 1080 occurrences | values 0,1 | `1` | Title text is generated from the stat. |
| `affixProperties[].disableAltText` | number | 1080 occurrences | values 0,1 | `0` | Suppress alt tooltip. |
| `rarityTier` | string | always | values "T4" | `"T4"` | Always "T4" in this data. |
| `specificRerollChances[]` | object | 17 occurrences |  | `{"equipmentType":29,"rerollChance":0.6,"weighting":0.3999...` | Per-equipment-type reroll overrides. |
| `specificRerollChances[].equipmentType` | number | 17 occurrences | values 4,10,15,29,30,31,32 | `29` | Base type id the override applies to. |
| `specificRerollChances[].rerollChance` | number | 17 occurrences | values 0,0.3,0.45,0.6 | `0.6` | Chance for the drop to be re-rolled to another type. |
| `specificRerollChances[].weighting` | number | 17 occurrences | values 0.39999998,0.55,0.7,1 | `0.39999998` | Roll weight. |

Example (key `14`, record #0, trimmed):

```json
{
  "singleSetAffix": false,
  "affixId": 14,
  "levelRequirement": 15,
  "type": 0,
  "standardAffixEffectModifier": 0,
  "rerollChance": 0,
  "weighting": 1,
  "group": 4,
  "canRollOn": [21, 22, "...(+2 more)"],
  "specificRerollChances": [],
  "rollsOn": 0,
  "classSpecificity": 0,
  "tiers": [
    {
      "tierName": null,
      "requiredLevel": 0,
      "rolls": [
        {"min": 0.2, "max": 0.4},
        {"min": 0.05, "max": 0.05}
      ]
    },
    {
      "tierName": null,
      "requiredLevel": 0,
      "rolls": [
        {"min": 0.41, "max": 0.65},
        {"min": 0.06, "max": 0.06}
      ]
    },
    "...(+6 more)"
  ],
  "displayCategory": 23,
  "titleType": 0,
  "t6Compatibility": 0,
  "useGeneratedName": 0,
  "specialAffixType": 0,
  "affixMorphology": 2,
  "forUniqueId": 0,
  "lootFilterOverrideNameKey": null,
  "affixDisplayNameKey": "Item_Affixes.Item_Affix_14_DisplayName",
  "affixTitleKey": "Item_Affixes.Item_Affix_14_Title",
  "affixProperties": [
    {
      "modDisplayNameKey": "Item_Affixes.ItemAffix_14_Affix_A",
      "property": 67,
      "specialTag": 0,
      "tags": 0,
      "extraTag": 0,
      "modifierType": 0,
      "setProperty": 0,
      "useGeneratedName": 1,
      "disableAltText": 0
    },
    {
      "modDisplayNameKey": "Item_Affixes.ItemAffix_14_Affix_B",
      "property": 14,
      "specialTag": 0,
      "tags": 0,
      "extraTag": 0,
      "modifierType": 0,
      "setProperty": 0,
      "useGeneratedName": 1,
      "disableAltText": 0
    }
  ],
  "rarityTier": "T4"
}
```

### `affix.tiers[]`

- **Location:** `itemDB.affixList.{single,multi}Affixes.<id>.tiers[]` (file: db-A)
- **Keying:** array, index = tier
- **Record count:** 6238
- **Notes:** Flattened tiers of all affixes.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `tierName` | null | always | values null | `null` | Optional tier name (null). |
| `requiredLevel` | number | always | values 0 | `0` | Required level for the tier (0 = none). |
| `rolls` | array | always | len 1..2 | `[{"min":0.04,"max":0.04}]` | Per-stat-line {min,max} for this tier. |
| `rolls[]` | object | 9711 occurrences |  | `{"min":0.04,"max":0.04}` | Per-stat-line {min,max} for this tier. |
| `rolls[].min` | number | 9711 occurrences | -100..3200 (>12 distinct) | `0.04` | Roll min. |
| `rolls[].max` | number | 9711 occurrences | -91..4000 (>12 distinct) | `0.04` | Roll max. |

Example (record #0, trimmed):

```json
{
  "tierName": null,
  "requiredLevel": 0,
  "rolls": [
    {"min": 0.04, "max": 0.04}
  ]
}
```

### `affix.tiers[].rolls[]`

- **Location:** `...tiers[].rolls[]` (file: db-A)
- **Keying:** array, one per affixProperties entry
- **Record count:** 9711
- **Notes:** Roll ranges per tier.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `min` | number | always | -100..3200 (>12 distinct) | `0.04` | Roll min. |
| `max` | number | always | -91..4000 (>12 distinct) | `0.04` | Roll max. |

Example (record #0, trimmed):

```json
{"min": 0.04, "max": 0.04}
```

### `affix.affixProperties[]`

- **Location:** `...affixProperties[]` (file: db-A)
- **Keying:** array
- **Record count:** 1696
- **Notes:** Stat lines of an affix.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `modDisplayNameKey` | string | always | >12 distinct | `"Item_Affixes.ItemAffix_0_Affix_A"` | i18n key for the stat-line text. |
| `property` | number | always | 0..130 (>12 distinct) | `59` | Stat property id (SP enum, see enums.md). |
| `specialTag` | number | always | 0..93 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `tags` | number | always | 0..33554432 (>12 distinct) | `16` | Tag bit mask (AT enum, see enums.md). |
| `extraTag` | number | always | values 0,143,220,263,267,353 | `0` | Tertiary selector (e.g. extra tag); mostly 0. |
| `modifierType` | number | always | values 0,1,2 | `0` | 0 added, 1 increased, 2 more (see enums.md). |
| `setProperty` | number | always | values 0,1 | `0` | 1 if the stat line is a set-bonus style property (1 case). |
| `useGeneratedName` | number | always | values 0,1 | `0` | Title text is generated from the stat. |
| `disableAltText` | number | always | values 0,1 | `0` | Suppress alt tooltip. |

Example (record #0, trimmed):

```json
{
  "modDisplayNameKey": "Item_Affixes.ItemAffix_0_Affix_A",
  "property": 59,
  "specialTag": 0,
  "tags": 16,
  "extraTag": 0,
  "modifierType": 0,
  "setProperty": 0,
  "useGeneratedName": 0,
  "disableAltText": 0
}
```

### `affix.specificRerollChances[]`

- **Location:** `...specificRerollChances[]` (file: db-A)
- **Keying:** array
- **Record count:** 218
- **Notes:** Per-equipment-type reroll overrides.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `equipmentType` | number | always | 2..33 (>12 distinct) | `2` | Base type id the override applies to. |
| `rerollChance` | number | always | values 0,0.1,0.2,0.3,0.4,0.45,0.5,0.6,0.7,0.75,0.8,0.9 | `0.5` | Chance for the drop to be re-rolled to another type. |
| `weighting` | number | always | values 0.100000024,0.19999999,0.25,0.3,0.39999998,0.5,0.55,0.6,0.7,0.8,0.9,1 | `0.5` | Roll weight. |

Example (record #5, trimmed):

```json
{"equipmentType": 5, "rerollChance": 0.6, "weighting": 0.39999998}
```

### `itemDB.uniqueList.uniques`

- **Location:** `itemDB.uniqueList.uniques` (file: db-A)
- **Keying:** object keyed by uniqueId (sparse: 486 entries, ids up to 488)
- **Record count:** 486
- **Key space:** 486 keys, numeric 0..488
- **Notes:** All unique / set / legendary-base items.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `sprite` | string | always | >12 distinct | `"I1552"` | Sprite id (LE Tools) or md5 hash (Maxroll). |
| `uniqueId` | number | always | 0..488 (>12 distinct) | `0` | Unique item id (0..488). |
| `isSetItem` | number | always | values 0,1 | `0` | 1 if set item. |
| `setId` | number | always | 0..24 (>12 distinct) | `0` | Set id. |
| `overrideLevelRequirement` | number | always | values 0,1 | `0` | Level requirement overridden. |
| `levelRequirement` | number | always | 0..87 (>12 distinct) | `0` | Level required to equip/use. |
| `rerollChance` | number | always | 0..0.999 (>12 distinct) | `0` | Chance for the drop to be re-rolled to another type. |
| `canDropRandomly` | number | always | values 0,1 | `1` | Can drop randomly. |
| `unknownDrop` | number | always | values 0,1 | `0` | Unknown-drop flag. |
| `hideFromPlayers` | number | always | values 0,1 | `0` | Hidden from players (internal). |
| `notTimelineExclusive` | number | always | values 0,1 | `0` | Not timeline-exclusive flag. |
| `baseTypeId` | number | always | 0..33 (>12 distinct) | `0` | Base item type id (see enums.md "base types"). |
| `legendaryType` | number | always | values 0,1 | `0` | 0 normal unique, 1 legendary-capable (see enums.md). |
| `subTypeIds` | array | always | len 1..1 | `[1]` | Allowed sub type ids. |
| `subTypeIds[]` | number | 486 occurrences | 0..72 (>12 distinct) | `1` | Allowed sub type ids. |
| `oldSubTypeId` | number | always | values 0,1,2,3,4,5,6,7,8 | `1` | Legacy sub type id. |
| `oldUniqueId` | number | always | values 0,1,2 | `1` | Legacy unique id. |
| `mods` | array | always | len 0..11 | `[{"value":1,"maxValue":1.5,"property":1,"specialTag":1,"t...` | Mod list. |
| `mods[]` | object | 2440 occurrences |  | `{"value":1,"maxValue":1.5,"property":1,"specialTag":1,"ta...` | Mod list. |
| `mods[].value` | number | 2440 occurrences | -16..600 (>12 distinct) | `1` | Stat value (number) or roll min for unique mods / display string on tree nodes. |
| `mods[].maxValue` | number | 2440 occurrences | -1000000..2000 (>12 distinct) | `1.5` | Roll max for unique mods; only meaningful when `canRoll` is 1 (see the rule below the table). |
| `mods[].property` | number | 2440 occurrences | 0..130 (>12 distinct) | `1` | Stat property id (SP enum, see enums.md). |
| `mods[].specialTag` | number | 2440 occurrences | 0..118 (>12 distinct) | `1` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `mods[].tags` | number | 2440 occurrences | 0..33554433 (>12 distinct) | `8` | Tag bit mask (AT enum, see enums.md). |
| `mods[].extraTag` | number | 2440 occurrences | values 0,71,143,353 | `0` | Tertiary selector (e.g. extra tag); mostly 0. |
| `mods[].type` | number | 2440 occurrences | values 0,1,2 | `0` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `mods[].hideInTooltip` | number | 2440 occurrences | values 0,1 | `1` | 1 if the line is not shown in the tooltip. |
| `mods[].canRoll` | number | 2440 occurrences | values 0,1 | `1` | 1 if the unique mod value is rollable; 0 = fixed at `value` and `maxValue` is ignored. |
| `mods[].rollId` | number | 2440 occurrences | values 0,1,2,3,4,5,6,7 | `0` | Roll slot id. |
| `tooltipDescriptions` | array | always | len 0..7 | `[{"altText":null,"setMod":0,"setRequirement":0,"descripti...` | Free-text description lines. |
| `tooltipDescriptions[]` | object | 562 occurrences |  | `{"altText":null,"setMod":0,"setRequirement":0,"descriptio...` | Free-text description lines. |
| `tooltipDescriptions[].altText` | null(358)\|string(204) | 562 occurrences | >12 distinct | `null` | English alt tooltip text. |
| `tooltipDescriptions[].setMod` | number | 562 occurrences | values 0 | `0` | 1 if line belongs to a set bonus. |
| `tooltipDescriptions[].setRequirement` | number | 562 occurrences | values 0 | `0` | Number of set pieces required for the line. |
| `tooltipDescriptions[].descriptionKey` | string | 562 occurrences | >12 distinct | `"Item_Names.Unique_Tooltip_0_0"` | i18n key for the description. |
| `tooltipEntries` | array | always | len 1..9 | `[{"modDisplay":1},{"modDisplay":128},{"modDisplay":129},{...` | Display order of mods/descriptions. |
| `tooltipEntries[]` | object | 2459 occurrences |  | `{"modDisplay":1}` | Display order of mods/descriptions. |
| `tooltipEntries[].modDisplay` | number | 2459 occurrences | 0..134 (>12 distinct) | `1` | Encoded reference: <128 = mod index, 128+n = tooltipDescriptions[n] (see enums.md). |
| `effectiveLevelForLegendaryPotential` | number | always | 0..200 (>12 distinct) | `40` | Effective level used for legendary potential. |
| `overrideEffectiveLevelForLegendaryPotential` | number | always | values 0,1 | `1` | Flag. |
| `isPrimordialItem` | number | always | values 0,1 | `0` | Primordial (Weaver) item. |
| `isCocoonedItem` | number | always | values 0,1 | `0` | Cocooned item. |
| `unifiedType` | number | always | values 0,1,2 | `0` | 0 normal, 1/2 special unified types. |
| `canDropAsLegendary` | number | always | values 0,1 | `0` | Flag. |
| `dropsSpecificLegendaryAffixes` | number | always | values 0,1 | `0` | Flag. |
| `droppableLegendaryAffixCount` | number | always | values 1,2 | `1` | Count. |
| `droppableLegendaryAffixes` | array | always | len 0..27 | `[]` | Affix ids. |
| `excludeSpecificAffixesFromPrefixSuffixLimits` | number | always | values 0,1 | `0` | Flag. |
| `convertPotentialToLegendaryAffixes` | number | always | values 0 | `0` | Flag. |
| `additionalRandomLegendaryAffixes` | number | always | values 0,1 | `0` | Count. |
| `isPreCorrupted` | number | always | values 0,1 | `0` | Pre-corrupted flag. |
| `preCorruptPositiveChance` | number | always | values 0,1 | `1` | Chance of positive pre-corruption. |
| `useCustomDropLevel` | number | always | values 0,1 | `0` | Flag. |
| `customDropLevel` | number | always | values 0,80 | `0` | Level. |
| `validPreCorrupts` | array | always | len 0..3 | `[]` | List. |
| `legacySubTypeVersions` | object | always |  | `{}` |  |
| `displayNameKey` | string | always | >12 distinct | `"Item_Names.Unique_Name_0"` | i18n key for the display name. |
| `loreTextKey` | string(355)\|null(131) | always | >12 distinct | `"Item_Names.Unique_Lore_0"` | i18n key for lore text. |
| `alternativeSearchNameKey` | null(480)\|string(6) | always | values null,"Item_Names.Unique_Name_Alt_195","Item_Names.Unique_Name_Alt_196","Item_Names.Unique_Name_Alt_197","Item_Names.Unique_Name_Alt_374","Item_Names.Unique_Name_Alt_375","Item_Names.Unique_Name_Alt_376" | `null` |  |
| `rarityTier` | string | always | values "T4","T2","T1","T3","T0" | `"T4"` | Always "T4" in this data. |
| `legacySubTypeVersions.<key>` | string | 81 occurrences | values "Beta 0.8.1","Version 1.0.0","Version 1.1.0","Beta 0.7.8","Beta 0.8.3","Beta 0.8.2","Beta 0.8.4","Beta 0.7.9","Beta 0.8.5e","Beta 0.9.0","Beta 0.8.5","Beta 0.9.2" | `"Beta 0.8.1"` |  |
| `primordialPetalCost` | number | 6/486 (1.2%) | values 3,21,26,30,34,35 | `35` | Weaver crafting cost. |
| `crystallisedHeartCost` | number | 13/486 (2.7%) | values 1,2,5 | `1` | Weaver crafting cost. |
| `ancientBoneCost` | number | 25/486 (5.1%) | 12500..50000 (>12 distinct) | `19500` | Weaver crafting cost. |
| `primordialFangCost` | number | 10/486 (2.1%) | values 11,15,18,19,20,21,24,25,26 | `15` | Weaver crafting cost. |
| `primordialHornCost` | number | 12/486 (2.5%) | values 10,11,13,16,18,19,20,27,28,40 | `10` | Weaver crafting cost. |
| `primordialFeatherCost` | number | 8/486 (1.6%) | values 15,17,20,25,26,29,30,32 | `32` | Weaver crafting cost. |
| `droppableLegendaryAffixes[]` | number | 43 occurrences | 1083..1152 (>12 distinct) | `1083` | Affix ids. |
| `validPreCorrupts[]` | number | 3 occurrences | values 5,9,12 | `9` | List. |

**Unique mod ranges (`mods[].value` / `maxValue` / `canRoll`) - RULE.** `canRoll = 1` (1737 of 2440 mods): the mod rolls between `value` (min) and `maxValue` (max); `value <= maxValue` always holds. `canRoll = 0` (703 mods): the mod is FIXED at `value`; `maxValue` is an unused leftover that is often 0, a smaller number (`40` with `maxValue 25`), or a different scale (`0.75` with `maxValue 90`, `0.4` with `maxValue 125`) - 612 of the 703 fixed mods have `maxValue != value`. Reading `value..maxValue` blindly gives nonsense such as "Void Resistance added 0.75..90" (Trident of the Last Abyss), "Damage 40..25" and "Penetration 0.4..125" (Dreamthorn). The loader stores `value_min = value_max = value` for `canRoll = 0` (the raw line stays in `mods.raw_json`); the raw data is internally consistent once `canRoll` is honoured. The game shows a fixed mod as its single value.

Example (key `2`, record #2, trimmed):

```json
{
  "sprite": "I1554",
  "uniqueId": 2,
  "isSetItem": 0,
  "setId": 0,
  "overrideLevelRequirement": 1,
  "levelRequirement": 10,
  "rerollChance": 0,
  "canDropRandomly": 1,
  "unknownDrop": 0,
  "hideFromPlayers": 0,
  "notTimelineExclusive": 0,
  "baseTypeId": 0,
  "legendaryType": 0,
  "subTypeIds": [6],
  "oldSubTypeId": 2,
  "oldUniqueId": 1,
  "mods": [
    {
      "value": 0.2,
      "maxValue": 0.4,
      "property": 14,
      "specialTag": 0,
      "tags": 0,
      "extraTag": 0,
      "type": 0,
      "hideInTooltip": 0,
      "canRoll": 1,
      "rollId": 0
    },
    {
      "value": 0.4,
      "maxValue": 2,
      "property": 67,
      "specialTag": 0,
      "tags": 0,
      "extraTag": 0,
      "type": 0,
      "hideInTooltip": 0,
      "canRoll": 1,
      "rollId": 1
    },
    "...(+6 more)"
  ],
  "tooltipDescriptions": [
    {
      "altText": null,
      "setMod": 0,
      "setRequirement": 0,
      "descriptionKey": "Item_Names.Unique_Tooltip_0_2"
    },
    {
      "altText": null,
      "setMod": 0,
      "setRequirement": 0,
      "descriptionKey": "Item_Names.Unique_Tooltip_1_2"
    },
    "...(+1 more)"
  ],
  "tooltipEntries": [
    {"modDisplay": 0},
    {"modDisplay": 1},
    "...(+5 more)"
  ],
  "effectiveLevelForLegendaryPotential": 0,
  "overrideEffectiveLevelForLegendaryPotential": 0,
  "isPrimordialItem": 0,
  "isCocoonedItem": 0,
  "unifiedType": 0,
  "canDropAsLegendary": 0,
  "dropsSpecificLegendaryAffixes": 0,
  "droppableLegendaryAffixCount": 1,
  "droppableLegendaryAffixes": [],
  "excludeSpecificAffixesFromPrefixSuffixLimits": 0,
  "convertPotentialToLegendaryAffixes": 0,
  "additionalRandomLegendaryAffixes": 0,
  "isPreCorrupted": 0,
  "preCorruptPositiveChance": 1,
  "useCustomDropLevel": 0,
  "...": "+7 more keys"
}
```

### `unique.mods[]`

- **Location:** `itemDB.uniqueList.uniques.<id>.mods[]` (file: db-A)
- **Keying:** array
- **Record count:** 2440
- **Notes:** Unique stat lines. value..maxValue is the roll range.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `value` | number | always | -16..600 (>12 distinct) | `1` | Stat value (number) or roll min for unique mods / display string on tree nodes. |
| `maxValue` | number | always | -1000000..2000 (>12 distinct) | `1.5` | Roll max for unique mods. |
| `property` | number | always | 0..130 (>12 distinct) | `1` | Stat property id (SP enum, see enums.md). |
| `specialTag` | number | always | 0..118 (>12 distinct) | `1` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `tags` | number | always | 0..33554433 (>12 distinct) | `8` | Tag bit mask (AT enum, see enums.md). |
| `extraTag` | number | always | values 0,71,143,353 | `0` | Tertiary selector (e.g. extra tag); mostly 0. |
| `type` | number | always | values 0,1,2 | `0` | modifierType: 0 added, 1 increased, 2 more (enums.md). |
| `hideInTooltip` | number | always | values 0,1 | `1` | 1 if the line is not shown in the tooltip. |
| `canRoll` | number | always | values 0,1 | `1` | 1 if the unique mod value is rollable. |
| `rollId` | number | always | values 0,1,2,3,4,5,6,7 | `0` | Roll slot id. |

Example (record #2, trimmed):

```json
{
  "value": 0.05,
  "maxValue": 0.1,
  "property": 3,
  "specialTag": 0,
  "tags": 8,
  "extraTag": 0,
  "type": 1,
  "hideInTooltip": 0,
  "canRoll": 1,
  "rollId": 2
}
```

### `unique.tooltipDescriptions[]`

- **Location:** `...tooltipDescriptions[]` (file: db-A)
- **Keying:** array
- **Record count:** 562
- **Notes:** Free-text description lines (i18n keys).

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `altText` | null(358)\|string(204) | always | >12 distinct | `null` | English alt tooltip text. |
| `setMod` | number | always | values 0 | `0` | 1 if line belongs to a set bonus. |
| `setRequirement` | number | always | values 0 | `0` | Number of set pieces required for the line. |
| `descriptionKey` | string | always | >12 distinct | `"Item_Names.Unique_Tooltip_0_0"` | i18n key for the description. |

Example (record #12, trimmed):

```json
{
  "altText": null,
  "setMod": 0,
  "setRequirement": 0,
  "descriptionKey": "Item_Names.Unique_Tooltip_0_10"
}
```

### `unique.tooltipEntries[]`

- **Location:** `...tooltipEntries[]` (file: db-A)
- **Keying:** array
- **Record count:** 2459
- **Notes:** Display-order list; modDisplay is an encoded reference (see enums.md).

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `modDisplay` | number | always | 0..134 (>12 distinct) | `1` | Encoded reference: <128 = mod index, 128+n = tooltipDescriptions[n] (see enums.md). |

Example (record #0, trimmed):

```json
{"modDisplay": 1}
```

### `itemDB.setBonusList`

- **Location:** `itemDB.setBonusList` (file: db-A)
- **Keying:** array, index = setID
- **Record count:** 25

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `setID` | number | always | 0..24 (>12 distinct) | `0` | Set id. |
| `mods` | array | always | len 0..7 | `[]` | Mod list. |
| `tooltipDescriptions` | array | always | len 0..3 | `[]` | Free-text description lines. |
| `tooltipEntries` | array | always | len 0..4 | `[]` | Display order of mods/descriptions. |
| `setName` | null(1)\|string(24) | always | >12 distinct | `null` | Set name. |
| `nameKey` | string | always | >12 distinct | `"Item_Names.ItemSet_0_Name"` | i18n key (en.json) for the name. |
| `mods[]` | object | 54 occurrences |  | `{"value":0.3,"property":69,"specialTag":0,"tags":288,"ext...` | Mod list. |
| `mods[].value` | number | 54 occurrences | -1..54 (>12 distinct) | `0.3` | Stat value (number) or roll min for unique mods / display string on tree nodes. |
| `mods[].property` | number | 54 occurrences | 0..117 (>12 distinct) | `69` | Stat property id (SP enum, see enums.md). |
| `mods[].specialTag` | number | 54 occurrences | 0..39 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `mods[].tags` | number | 54 occurrences | 0..16777216 (>12 distinct) | `288` | Tag bit mask (AT enum, see enums.md). |
| `mods[].extraTag` | number | 54 occurrences | values 0 | `0` | Tertiary selector (e.g. extra tag); mostly 0. |
| `mods[].type` | number | 54 occurrences | values 0,1,2 | `0` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `mods[].setRequirement` | number | 54 occurrences | values 1,2,3 | `3` | Number of set pieces required for the line. |
| `mods[].hideInTooltip` | number | 54 occurrences | values 0,1 | `1` | 1 if the line is not shown in the tooltip. |
| `tooltipDescriptions[]` | object | 18 occurrences |  | `{"setMod":0,"setRequirement":3,"descriptionKey":"Item_Nam...` | Free-text description lines. |
| `tooltipDescriptions[].setMod` | number | 18 occurrences | values 0 | `0` | 1 if line belongs to a set bonus. |
| `tooltipDescriptions[].setRequirement` | number | 18 occurrences | values 1,2,3 | `3` | Number of set pieces required for the line. |
| `tooltipDescriptions[].descriptionKey` | string | 18 occurrences | >12 distinct | `"Item_Names.ItemSet_1_Description_Base_0"` | i18n key for the description. |
| `tooltipDescriptions[].altTextKey` | null(12)\|string(6) | 18 occurrences | values null,"Item_Names.ItemSet_1_Description_Alt_1","Item_Names.ItemSet_3_Description_Alt_1","Item_Names.ItemSet_10_Description_Al...","Item_Names.ItemSet_11_Description_Al...","Item_Names.ItemSet_11_Description_Al...","Item_Names.ItemSet_23_Description_Al..." | `null` | i18n key for the alt (secondary) tooltip text. |
| `tooltipEntries[]` | object | 46 occurrences |  | `{"modDisplay":129}` | Display order of mods/descriptions. |
| `tooltipEntries[].modDisplay` | number | 46 occurrences | values 0,1,2,3,128,129,130 | `129` | Encoded reference: <128 = mod index, 128+n = tooltipDescriptions[n] (see enums.md). |

Example (record #1, trimmed):

```json
{
  "setID": 1,
  "mods": [
    {
      "value": 0.3,
      "property": 69,
      "specialTag": 0,
      "tags": 288,
      "extraTag": 0,
      "type": 0,
      "setRequirement": 3,
      "hideInTooltip": 1
    },
    {
      "value": 1,
      "property": 1,
      "specialTag": 39,
      "tags": 288,
      "extraTag": 0,
      "type": 0,
      "setRequirement": 2,
      "hideInTooltip": 1
    },
    "...(+1 more)"
  ],
  "tooltipDescriptions": [
    {
      "setMod": 0,
      "setRequirement": 3,
      "descriptionKey": "Item_Names.ItemSet_1_Description_Base_0",
      "altTextKey": null
    },
    {
      "setMod": 0,
      "setRequirement": 2,
      "descriptionKey": "Item_Names.ItemSet_1_Description_Base_1",
      "altTextKey": "Item_Names.ItemSet_1_Description_Alt_1"
    }
  ],
  "tooltipEntries": [
    {"modDisplay": 129},
    {"modDisplay": 2},
    "...(+1 more)"
  ],
  "setName": "Isadora's",
  "nameKey": "Item_Names.ItemSet_1_Name"
}
```

### `setBonusList[].mods[]`

- **Location:** `itemDB.setBonusList[].mods[]` (file: db-A)
- **Keying:** array
- **Record count:** 54

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `value` | number | always | -1..54 (>12 distinct) | `0.3` | Stat value (number) or roll min for unique mods / display string on tree nodes. |
| `property` | number | always | 0..117 (>12 distinct) | `69` | Stat property id (SP enum, see enums.md). |
| `specialTag` | number | always | 0..39 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `tags` | number | always | 0..16777216 (>12 distinct) | `288` | Tag bit mask (AT enum, see enums.md). |
| `extraTag` | number | always | values 0 | `0` | Tertiary selector (e.g. extra tag); mostly 0. |
| `type` | number | always | values 0,1,2 | `0` | modifierType: 0 added, 1 increased, 2 more (enums.md). |
| `setRequirement` | number | always | values 1,2,3 | `3` | Number of set pieces required for the line. |
| `hideInTooltip` | number | always | values 0,1 | `1` | 1 if the line is not shown in the tooltip. |

Example (record #0, trimmed):

```json
{
  "value": 0.3,
  "property": 69,
  "specialTag": 0,
  "tags": 288,
  "extraTag": 0,
  "type": 0,
  "setRequirement": 3,
  "hideInTooltip": 1
}
```

### `itemDB.setNames`

- **Location:** `itemDB.setNames` (file: db-A)
- **Keying:** object setId -> hard-coded English display string
- **Record count:** 24
- **Key space:** 24 keys, numeric 1..24
- **Notes:** 24 entries (1..24); setBonusList has 25 (index 0 = no set).

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `name` | string | always | >12 distinct | `"Isadora's Set"` | Internal / English name. |

Example (key `1`, record #0, trimmed):

```json
{"name": "Isadora's Set"}
```

### `itemDB.monsterItemDrops`

- **Location:** `itemDB.monsterItemDrops` (file: db-A)
- **Keying:** array
- **Record count:** 341
- **Notes:** Which monster drops which unique.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `uniqueId` | number | 173/341 (50.7%) | 72..488 (>12 distinct) | `72` | Unique item id (0..488). |
| `monsterNameKey` | string | 313/341 (91.8%) | >12 distinct | `"Actors.Actor_Name_Orchirian The Rampant"` |  |
| `chanceModifier` | number | always | values 0,1,2,3,4,1001,1002,1003,1004,1005 | `0` |  |
| `chancePerTier` | array | 18/341 (5.3%) | len 4..5 | `[0.03,0.04,0.05,0.06]` |  |
| `chancePerTier[]` | number | 75 occurrences | 0..1 (>12 distinct) | `0.03` |  |
| `dungeonInfo` | object | 15/341 (4.4%) |  | `{"id":3,"gamble":true}` |  |
| `dungeonInfo.id` | number | 15/341 (4.4%) | values 1,2,3 | `3` | Record identifier (type depends on collection; see ids.md). |
| `dungeonInfo.gamble` | boolean | 15/341 (4.4%) | values true,false | `true` |  |
| `soulGambler` | boolean | 3/341 (0.9%) | values true | `true` |  |
| `chance` | number | 322/341 (94.4%) | 0..1.5 (>12 distinct) | `0.1` | Chance (0..1). |
| `maxChance` | number | 322/341 (94.4%) | 0..2.0833333 (>12 distinct) | `0.22` |  |
| `rarityForMaxChance` | number | 145/341 (42.5%) | 0..21 (>12 distinct) | `12` |  |
| `timelineInfo` | object | 162/341 (47.5%) |  | `{"id":6,"empoweredOnly":true}` |  |
| `timelineInfo.id` | number | 162/341 (47.5%) | values 1,2,3,4,5,6,7,8,9,10 | `6` | Record identifier (type depends on collection; see ids.md). |
| `timelineInfo.empoweredOnly` | boolean | 162/341 (47.5%) | values true,false | `true` |  |
| `minCorruption` | number | 337/341 (98.8%) | values 0,50,100,120,150,200 | `0` |  |
| `harbinger` | boolean | 50/341 (14.7%) | values true | `true` |  |
| `itemType` | number | 168/341 (49.3%) | values 102,103,104,107 | `104` |  |
| `subType` | number | 168/341 (49.3%) | 0..47 (>12 distinct) | `22` |  |
| `corruptionForMaxChance` | number | 32/341 (9.4%) | values 300,600 | `600` |  |
| `lizardColor` | number | 13/341 (3.8%) | values 0,1,2,3,4 | `0` |  |
| `lootLizard` | boolean | 13/341 (3.8%) | values true | `true` |  |
| `wovenEcho` | number | 94/341 (27.6%) | 5..49 (>12 distinct) | `47` |  |
| `hostOnly` | boolean | 48/341 (14.1%) | values true | `true` |  |
| `minCharLevel` | number | 1/341 (0.3%) | values 60 | `60` |  |
| `nemesis` | boolean | 1/341 (0.3%) | values true | `true` |  |
| `arena` | boolean | 3/341 (0.9%) | values true | `true` |  |
| `aberroth` | boolean | 29/341 (8.5%) | values true | `true` |  |
| `sceneId` | string | 1/341 (0.3%) | values "PCG_Cemetery" | `"PCG_Cemetery"` |  |
| `orobyss` | boolean | 12/341 (3.5%) | values true | `true` |  |
| `zoneLevel` | object | 2/341 (0.6%) |  | `{"from":100,"to":null}` |  |
| `zoneLevel.from` | number | 2/341 (0.6%) | values 90,100 | `100` |  |
| `zoneLevel.to` | null | 2/341 (0.6%) | values null | `null` |  |
| `runePrison` | boolean | 5/341 (1.5%) | values true | `true` |  |

Example (record #4, trimmed):

```json
{
  "uniqueId": 354,
  "monsterNameKey": "Actors.Actor_Name_Harbinger of Treason",
  "chanceModifier": 0,
  "chance": 0.1,
  "maxChance": 0.22,
  "rarityForMaxChance": 12,
  "timelineInfo": {"id": 6, "empoweredOnly": true},
  "minCorruption": 0,
  "harbinger": true
}
```

### `itemDB.oneShotCaches`

- **Location:** `itemDB.oneShotCaches` (file: db-A)
- **Keying:** array
- **Record count:** 40
- **Notes:** One-time world chests with guaranteed items.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `id` | number | always | -2056742390..2044604578 (>12 distinct) | `359666994` | Record identifier (type depends on collection; see ids.md). |
| `displayNameKey` | string | always | >12 distinct | `"Actors.Actor_Name_Cave Druid's Tomb"` | i18n key for the display name. |
| `description` | string | always | >12 distinct | `"None now tend to the gardens below"` | English description text. |
| `cacheType` | number | always | values 0,1 | `0` |  |
| `scene` | string(15)\|null(25) | always | >12 distinct | `"C20"` | Scene code. |
| `rerollChance` | number | always | values 0,0.5,0.6,0.75,0.99,1 | `0` | Chance for the drop to be re-rolled to another type. |
| `lowLevelRerollChance` | number | always | values 0,0.1,0.3,0.9,1,1.1,1.2,1.4,1.6,2.4,2.5,2.8 | `0` |  |
| `guaranteedItems` | array | always | len 0..19 | `[{"itemTypeType":0,"itemType":1,"itemTypeGroup":0,"subTyp...` |  |
| `guaranteedItems[]` | object | 408 occurrences |  | `{"itemTypeType":0,"itemType":1,"itemTypeGroup":0,"subType...` |  |
| `guaranteedItems[].itemTypeType` | number | 408 occurrences | values 0,1 | `0` |  |
| `guaranteedItems[].itemType` | number | 408 occurrences | -1..104 (>12 distinct) | `1` |  |
| `guaranteedItems[].itemTypeGroup` | number | 408 occurrences | values 0,1,2,3,4,5,6,7 | `0` |  |
| `guaranteedItems[].subType` | number | 408 occurrences | -1..560 (>12 distinct) | `25` |  |
| `guaranteedItems[].ilvl` | number | 408 occurrences | values -1,20,80 | `-1` |  |
| `guaranteedItems[].rarityType` | number | 408 occurrences | values 0,1 | `1` |  |
| `guaranteedItems[].rarity` | number | 408 occurrences | values 0,2,3,7 | `0` |  |
| `guaranteedItems[].rarityGroup` | number | 408 occurrences | values 0,1,2,3,5,6 | `2` |  |
| `guaranteedItems[].uniqueID` | number | 408 occurrences | values -1,246 | `-1` | Unique item id. |
| `guaranteedItems[].alwaysRequireClassCompatibility` | boolean | 408 occurrences | values false,true | `false` |  |
| `guaranteedItems[].cannotBeGifted` | boolean | 408 occurrences | values false | `false` |  |
| `guaranteedItems[].hostOnly` | boolean | 408 occurrences | values false,true | `false` |  |
| `guaranteedSpecificItems` | array | always | len 0..2 | `[{"itemType":15,"subType":1,"rarity":3,"uniqueID":0,"forg...` |  |
| `guaranteedSpecificItems[]` | object | 13 occurrences |  | `{"itemType":15,"subType":1,"rarity":3,"uniqueID":0,"forgi...` |  |
| `guaranteedSpecificItems[].itemType` | number | 13 occurrences | values 1,2,3,6,14,15,17,18,19,20 | `15` |  |
| `guaranteedSpecificItems[].subType` | number | 13 occurrences | values 0,1,3,6,7,8,57 | `1` |  |
| `guaranteedSpecificItems[].rarity` | number | 13 occurrences | values 3,4 | `3` |  |
| `guaranteedSpecificItems[].uniqueID` | number | 13 occurrences | values 0 | `0` | Unique item id. |
| `guaranteedSpecificItems[].forgingPotential` | number | 13 occurrences | values 0 | `0` |  |
| `guaranteedSpecificItems[].legendaryPotential` | number | 13 occurrences | values 0 | `0` |  |
| `guaranteedSpecificItems[].affixes` | array | 13 occurrences | len 3..5 | `[{"id":700,"tier":2,"roll":0,"sealed":false},{"id":4,"tie...` |  |
| `guaranteedSpecificItems[].hasClassRequirement` | boolean | 13 occurrences | values false | `false` |  |
| `guaranteedSpecificItems[].classRequirement` | number | 13 occurrences | values 0 | `0` | Class requirement bit mask: 1<<classID (1 Primalist, 2 Mage, 4 Sentinel, 8 Acolyte, 16 Rogue). |
| `guaranteedSpecificItems[].hasSubClassRequirement` | boolean | 13 occurrences | values false | `false` |  |
| `guaranteedSpecificItems[].subClassRequirement` | number | 13 occurrences | values 0 | `0` | Mastery requirement. |
| `guaranteedSpecificItems[].cannotBeGifted` | boolean | 13 occurrences | values false | `false` |  |

Example (record #3, trimmed):

```json
{
  "id": -867411941,
  "displayNameKey": "Actors.Actor_Name_Warrior Queen's Cache",
  "description": "A horde of weapons stand testament to conquests long past",
  "cacheType": 1,
  "scene": null,
  "rerollChance": 0,
  "lowLevelRerollChance": 2.4,
  "guaranteedItems": [
    {
      "itemTypeType": 1,
      "itemType": -1,
      "itemTypeGroup": 6,
      "subType": -1,
      "ilvl": -1,
      "rarityType": 1,
      "rarity": 0,
      "rarityGroup": 2,
      "uniqueID": -1,
      "alwaysRequireClassCompatibility": false,
      "cannotBeGifted": false,
      "hostOnly": false
    },
    {
      "itemTypeType": 1,
      "itemType": -1,
      "itemTypeGroup": 6,
      "subType": -1,
      "ilvl": -1,
      "rarityType": 1,
      "rarity": 0,
      "rarityGroup": 5,
      "uniqueID": -1,
      "alwaysRequireClassCompatibility": false,
      "cannotBeGifted": false,
      "hostOnly": false
    },
    "...(+10 more)"
  ],
  "guaranteedSpecificItems": []
}
```

### `itemDB.sceneList`

- **Location:** `itemDB.sceneList` (file: db-A)
- **Keying:** object keyed by scene code ("A10", "Arena_1_Desert", ...)
- **Record count:** 385
- **Key space:** 385 keys, e.g. `A10`, `A30`, `A40`, `A50`

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `type` | number | always | values 0,1,2,3,5,6 | `0` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `level` | number | always | 0..100 (>12 distinct) | `10` | Level. |
| `era` | number | always | values 0,1,2,3,4 | `3` | Era id. |
| `nameKey` | string | always | >12 distinct | `"Scenes.Scene_Name_A10"` | i18n key (en.json) for the name. |

Example (key `A10`, record #0, trimmed):

```json
{"type": 0, "level": 10, "era": 3, "nameKey": "Scenes.Scene_Name_A10"}
```

### `itemDB.questRewards`

- **Location:** `itemDB.questRewards` (file: db-A)
- **Keying:** object keyed by id
- **Record count:** 1
- **Key space:** 1 keys, numeric 131..131

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `titleKey` | string | always | values "Quests.Quest_3_Name" | `"Quests.Quest_3_Name"` | i18n key for a title. |

Example (key `131`, record #0, trimmed):

```json
{"titleKey": "Quests.Quest_3_Name"}
```

### `itemDB.fracturedUniques`

- **Location:** `itemDB.fracturedUniques` (file: db-A)
- **Keying:** object keyed by uniqueId
- **Record count:** 1
- **Key space:** 1 keys, numeric 1..1

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `chance` | number | always | values 100 | `100` | Chance (0..1). |
| `type` | number | always | values 3 | `3` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |

Example (key `1`, record #0, trimmed):

```json
{"chance": 100, "type": 3}
```

### `itemDB.bagContents.bags[]`

- **Location:** `itemDB.bagContents.bags[]` (file: db-A)
- **Keying:** array
- **Record count:** 32
- **Notes:** Bag (baseType 108) contents.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `subTypeId` | number | always | 0..31 (>12 distinct) | `0` | Sub type id within base type. |
| `drops` | array | always | len 1..4 | `[{"kind":"items","min":3,"max":5,"rarity":7}]` |  |
| `drops[]` | object | 49 occurrences |  | `{"kind":"items","min":3,"max":5,"rarity":7}` |  |
| `drops[].kind` | string | 49 occurrences | values "items","pool","gold","amber","weighted","chance","class_crate","ancient_bones" | `"items"` |  |
| `drops[].min` | number | 34 occurrences | values 2,3,4,6,10,11,16 | `3` | Roll min. |
| `drops[].max` | number | 34 occurrences | values 4,5,6,7,8,9,11,13,14,15,16,20 | `5` | Roll max. |
| `drops[].rarity` | number | 2 occurrences | values 7 | `7` |  |
| `drops[].baseTypeId` | number | 38 occurrences | values 20,101,102,103,104,108 | `103` | Base item type id (see enums.md "base types"). |
| `drops[].tier` | string | 18 occurrences | values "any","common","uncommon" | `"any"` |  |
| `drops[].amount` | number | 1 occurrences | values 5000 | `5000` |  |
| `drops[].weights` | array | 9 occurrences | len 2..20 | `[{"id":15,"weight":1},{"id":16,"weight":1},{"id":17,"weig...` |  |
| `drops[].subTypeId` | number | 15 occurrences | values 19,22,23,28 | `19` | Sub type id within base type. |
| `drops[].chance` | number | 13 occurrences | values 0.0005,0.001,0.002,0.005,0.015,0.025,0.05 | `0.025` | Chance (0..1). |
| `drops[].corrupted` | boolean | 3 occurrences | values true | `true` |  |
| `drops[].classId` | number | 5 occurrences | values 0,1,2,3,4 | `0` |  |
| `drops[].uniqueChance` | number | 5 occurrences | values 0.07 | `0.07` |  |
| `drops[].exaltedChance` | number | 5 occurrences | values 0.65 | `0.65` |  |
| `drops[].amounts` | array | 1 occurrences | len 5..5 | `[1000,1200,1400,1600,2000]` |  |

Example (record #6, trimmed):

```json
{
  "subTypeId": 6,
  "drops": [
    {
      "kind": "weighted",
      "min": 4,
      "max": 6,
      "baseTypeId": 104,
      "weights": [
        {"id": 15, "weight": 1},
        {"id": 16, "weight": 1},
        "...(+2 more)"
      ]
    },
    {"kind": "chance", "baseTypeId": 104, "subTypeId": 19, "chance": 0.025}
  ]
}
```

### `coreDB.propertyList`

- **Location:** `coreDB.propertyList` (file: db-B)
- **Keying:** array; each record carries `property` = SP enum id (array index != id in general)
- **Record count:** 113
- **Notes:** Display rules for the "master" stat properties (SP enum).

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `property` | number | always | 0..133 (>12 distinct) | `0` | Stat property id (SP enum, see enums.md). |
| `roundAddedToInt` | number | always | values 0,1 | `1` | Rounding mode for added values (0 none, 1 integer, 2/3 other; see enums.md). |
| `roundingForMore` | number | always | values 0,3 | `0` | Rounding mode for "more" values. |
| `displayAddedAsPercentage` | number | always | values 0,1 | `0` | Display added value as a percentage. |
| `displayAsPercentageOf` | number | always | values 0,1 | `0` | Display as "% of ...". |
| `displayAddedAsTenthOfValue` | number | always | values 0,1 | `0` | Display added value as tenth. |
| `displayAsAddedTo` | number | always | values 0,1 | `0` | Display as "added to ...". |
| `dontDisplayPlus` | number | always | values 0,1 | `0` | Do not prefix + sign. |
| `altTextOverrides` | array | always | len 0..50 | `[{"dontDisplayPlus":0,"modType":0,"specialTag":0,"tags":5...` | Alternate texts by (modType,specialTag,tags). |
| `altTextOverrides[]` | object | 162 occurrences |  | `{"dontDisplayPlus":0,"modType":0,"specialTag":0,"tags":51...` | Alternate texts by (modType,specialTag,tags). |
| `altTextOverrides[].dontDisplayPlus` | number | 162 occurrences | 0..117 (>12 distinct) | `0` | Do not prefix + sign. |
| `altTextOverrides[].modType` | number | 162 occurrences | values 0,1,2 | `0` | Monster mod type enum. |
| `altTextOverrides[].specialTag` | number | 162 occurrences | 0..144 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `altTextOverrides[].tags` | number | 162 occurrences | 0..33554433 (>12 distinct) | `513` | Tag bit mask (AT enum, see enums.md). |
| `altTextOverrides[].altTextKey` | string(161)\|null(1) | 162 occurrences | >12 distinct | `"Property_Master_Damage_AltText_Override_1"` | i18n key for the alt (secondary) tooltip text. |
| `moreRoundingOverrides` | array | always | len 0..2 | `[]` | Per (property,specialTag) rounding overrides. |
| `hideModifierValue` | number | always | values 0 | `0` | Hide the numeric value. |
| `nameIncludesModifier` | number | always | values 0,1 | `0` | Name already includes the modifier word. |
| `propertyNameKey` | string | always | >12 distinct | `"Properties.Property_Master_Damage_Name"` | i18n key of the property name. |
| `altTextKey` | string(100)\|null(13) | always | >12 distinct | `"Properties.Property_Master_Damage_AltText"` | i18n key for the alt (secondary) tooltip text. |
| `moreRoundingOverrides[]` | object | 4 occurrences |  | `{"property":6,"specialTag":0,"roundingForMore":3}` | Per (property,specialTag) rounding overrides. |
| `moreRoundingOverrides[].property` | number | 4 occurrences | values 6,115,117 | `6` | Stat property id (SP enum, see enums.md). |
| `moreRoundingOverrides[].specialTag` | number | 4 occurrences | values 0,16,43,44 | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `moreRoundingOverrides[].roundingForMore` | number | 4 occurrences | values 3 | `3` | Rounding mode for "more" values. |

Example (record #0, trimmed):

```json
{
  "property": 0,
  "roundAddedToInt": 1,
  "roundingForMore": 0,
  "displayAddedAsPercentage": 0,
  "displayAsPercentageOf": 0,
  "displayAddedAsTenthOfValue": 0,
  "displayAsAddedTo": 0,
  "dontDisplayPlus": 0,
  "altTextOverrides": [
    {
      "dontDisplayPlus": 0,
      "modType": 0,
      "specialTag": 0,
      "tags": 513,
      "altTextKey": "Property_Master_Damage_AltText_Override_1"
    },
    {
      "dontDisplayPlus": 0,
      "modType": 1,
      "specialTag": 0,
      "tags": 256,
      "altTextKey": "Property_Master_Damage_AltText_Override_2"
    },
    "...(+43 more)"
  ],
  "moreRoundingOverrides": [],
  "hideModifierValue": 0,
  "nameIncludesModifier": 0,
  "propertyNameKey": "Properties.Property_Master_Damage_Name",
  "altTextKey": "Properties.Property_Master_Damage_AltText"
}
```

### `propertyList[].altTextOverrides[]`

- **Location:** `coreDB.propertyList[].altTextOverrides[]` (file: db-B)
- **Keying:** array
- **Record count:** 162

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `dontDisplayPlus` | number | always | 0..117 (>12 distinct) | `0` | Do not prefix + sign. |
| `modType` | number | always | values 0,1,2 | `0` | Monster mod type enum. |
| `specialTag` | number | always | 0..144 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `tags` | number | always | 0..33554433 (>12 distinct) | `513` | Tag bit mask (AT enum, see enums.md). |
| `altTextKey` | string(161)\|null(1) | always | >12 distinct | `"Property_Master_Damage_AltText_Override_1"` | i18n key for the alt (secondary) tooltip text. |

Example (record #23, trimmed):

```json
{
  "dontDisplayPlus": 0,
  "modType": 1,
  "specialTag": 0,
  "tags": 4096,
  "altTextKey": "Property_Master_Damage_AltText_Override_24"
}
```

### `propertyList[].moreRoundingOverrides[]`

- **Location:** `coreDB.propertyList[].moreRoundingOverrides[]` (file: db-B)
- **Keying:** array
- **Record count:** 4

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `property` | number | always | values 6,115,117 | `6` | Stat property id (SP enum, see enums.md). |
| `specialTag` | number | always | values 0,16,43,44 | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `roundingForMore` | number | always | values 3 | `3` | Rounding mode for "more" values. |

Example (record #1, trimmed):

```json
{"property": 115, "specialTag": 16, "roundingForMore": 3}
```

### `coreDB.playerPropertyList`

- **Location:** `coreDB.playerPropertyList` (file: db-B)
- **Keying:** array; index = PlayerProperty id (the `tags` value of SP.PlayerProperty(98) stats)
- **Record count:** 713

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `roundAddedToInt` | number | always | values 0,1,2,3 | `0` | Rounding mode for added values (0 none, 1 integer, 2/3 other; see enums.md). |
| `roundingForMore` | number | always | values 0,3 | `0` | Rounding mode for "more" values. |
| `displayAddedAsPercentage` | number | always | values 0,1 | `1` | Display added value as a percentage. |
| `displayAsPercentageOf` | number | always | values 0,1 | `0` | Display as "% of ...". |
| `displayAddedAsTenthOfValue` | number | always | values 0,1 | `0` | Display added value as tenth. |
| `displayAsAddedTo` | number | always | values 0,1 | `0` | Display as "added to ...". |
| `dontDisplayPlus` | number | always | values 0,1 | `1` | Do not prefix + sign. |
| `lessIsBetter` | number | always | values 0,1 | `0` | Lower value is beneficial. |
| `hideModifierValue` | number | always | values 0,1 | `0` | Hide the numeric value. |
| `nameIncludesModifier` | number | always | values 0 | `0` | Name already includes the modifier word. |
| `propertyNameKey` | string | always | >12 distinct | `"Properties.Property_Player_0_Name"` | i18n key of the property name. |
| `altTextKey` | string(227)\|null(486) | always | >12 distinct | `"Properties.Property_Player_0_AltText"` | i18n key for the alt (secondary) tooltip text. |

Example (record #0, trimmed):

```json
{
  "roundAddedToInt": 0,
  "roundingForMore": 0,
  "displayAddedAsPercentage": 1,
  "displayAsPercentageOf": 0,
  "displayAddedAsTenthOfValue": 0,
  "displayAsAddedTo": 0,
  "dontDisplayPlus": 1,
  "lessIsBetter": 0,
  "hideModifierValue": 0,
  "nameIncludesModifier": 0,
  "propertyNameKey": "Properties.Property_Player_0_Name",
  "altTextKey": "Properties.Property_Player_0_AltText"
}
```

### `coreDB.abilityPropertyList`

- **Location:** `coreDB.abilityPropertyList` (file: db-B)
- **Keying:** array of {abilityID, properties[]}
- **Record count:** 177

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `abilityID` | number | always | 0..950 (>12 distinct) | `1` | Ability index (position in abilityList). |
| `properties` | array | always | len 0..48 | `[{"roundAddedToInt":0,"roundingForMore":0,"displayAddedAs...` |  |
| `properties[]` | object | 2344 occurrences |  | `{"roundAddedToInt":0,"roundingForMore":0,"displayAddedAsP...` |  |
| `properties[].roundAddedToInt` | number | 2344 occurrences | values 0,1,2,3 | `0` | Rounding mode for added values (0 none, 1 integer, 2/3 other; see enums.md). |
| `properties[].roundingForMore` | number | 2344 occurrences | values 0,1,3 | `0` | Rounding mode for "more" values. |
| `properties[].displayAddedAsPercentage` | number | 2344 occurrences | values 0,1 | `1` | Display added value as a percentage. |
| `properties[].displayAsPercentageOf` | number | 2344 occurrences | values 0,1 | `0` | Display as "% of ...". |
| `properties[].displayAddedAsTenthOfValue` | number | 2344 occurrences | values 0,1 | `0` | Display added value as tenth. |
| `properties[].displayAsAddedTo` | number | 2344 occurrences | values 0,1 | `0` | Display as "added to ...". |
| `properties[].dontDisplayPlus` | number | 2344 occurrences | values 0,1 | `0` | Do not prefix + sign. |
| `properties[].lessIsBetter` | number | 2344 occurrences | values 0,1 | `0` | Lower value is beneficial. |
| `properties[].hideModifierValue` | number | 2344 occurrences | values 0,1 | `0` | Hide the numeric value. |
| `properties[].nameIncludesModifier` | number | 2344 occurrences | values 0 | `0` | Name already includes the modifier word. |
| `properties[].propertyNameKey` | string | 2344 occurrences | >12 distinct | `"Properties.Property_Ability_fireball_1_Name"` | i18n key of the property name. |
| `properties[].altTextKey` | string(473)\|null(1871) | 2344 occurrences | >12 distinct | `"Properties.Property_Ability_fireball_1_AltText"` | i18n key for the alt (secondary) tooltip text. |

Example (record #0, trimmed):

```json
{
  "abilityID": 1,
  "properties": [
    {
      "roundAddedToInt": 0,
      "roundingForMore": 0,
      "displayAddedAsPercentage": 1,
      "displayAsPercentageOf": 0,
      "displayAddedAsTenthOfValue": 0,
      "displayAsAddedTo": 0,
      "dontDisplayPlus": 0,
      "lessIsBetter": 0,
      "hideModifierValue": 0,
      "nameIncludesModifier": 0,
      "propertyNameKey": "Properties.Property_Ability_fireball_1_Name",
      "altTextKey": "Properties.Property_Ability_fireball_1_AltText"
    },
    {
      "roundAddedToInt": 1,
      "roundingForMore": 0,
      "displayAddedAsPercentage": 0,
      "displayAsPercentageOf": 0,
      "displayAddedAsTenthOfValue": 0,
      "displayAsAddedTo": 0,
      "dontDisplayPlus": 0,
      "lessIsBetter": 0,
      "hideModifierValue": 0,
      "nameIncludesModifier": 0,
      "propertyNameKey": "Properties.Property_Ability_fireball_2_Name",
      "altTextKey": "Properties.Property_Ability_fireball_2_AltText"
    },
    "...(+15 more)"
  ]
}
```

### `abilityPropertyList[].properties[]`

- **Location:** `coreDB.abilityPropertyList[].properties[]` (file: db-B)
- **Keying:** array; index = specialTag of SP.AbilityProperty(58) stats
- **Record count:** 2344

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `roundAddedToInt` | number | always | values 0,1,2,3 | `0` | Rounding mode for added values (0 none, 1 integer, 2/3 other; see enums.md). |
| `roundingForMore` | number | always | values 0,1,3 | `0` | Rounding mode for "more" values. |
| `displayAddedAsPercentage` | number | always | values 0,1 | `1` | Display added value as a percentage. |
| `displayAsPercentageOf` | number | always | values 0,1 | `0` | Display as "% of ...". |
| `displayAddedAsTenthOfValue` | number | always | values 0,1 | `0` | Display added value as tenth. |
| `displayAsAddedTo` | number | always | values 0,1 | `0` | Display as "added to ...". |
| `dontDisplayPlus` | number | always | values 0,1 | `0` | Do not prefix + sign. |
| `lessIsBetter` | number | always | values 0,1 | `0` | Lower value is beneficial. |
| `hideModifierValue` | number | always | values 0,1 | `0` | Hide the numeric value. |
| `nameIncludesModifier` | number | always | values 0 | `0` | Name already includes the modifier word. |
| `propertyNameKey` | string | always | >12 distinct | `"Properties.Property_Ability_fireball_1_Name"` | i18n key of the property name. |
| `altTextKey` | string(473)\|null(1871) | always | >12 distinct | `"Properties.Property_Ability_fireball_1_AltText"` | i18n key for the alt (secondary) tooltip text. |

Example (record #0, trimmed):

```json
{
  "roundAddedToInt": 0,
  "roundingForMore": 0,
  "displayAddedAsPercentage": 1,
  "displayAsPercentageOf": 0,
  "displayAddedAsTenthOfValue": 0,
  "displayAsAddedTo": 0,
  "dontDisplayPlus": 0,
  "lessIsBetter": 0,
  "hideModifierValue": 0,
  "nameIncludesModifier": 0,
  "propertyNameKey": "Properties.Property_Ability_fireball_1_Name",
  "altTextKey": "Properties.Property_Ability_fireball_1_AltText"
}
```

### `coreDB.coreAttributes`

- **Location:** `coreDB.coreAttributes` (file: db-B)
- **Keying:** object keyed 0..4 (attribute id)
- **Record count:** 5
- **Key space:** 5 keys, numeric 0..4

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `attributeName` | number | always | values 0,1,2,3,4 | `0` |  |
| `stats` | array | always | len 1..3 | `[{"property":10,"specialTag":0,"tags":0,"addedValue":0,"i...` | Stat lines. |
| `stats[]` | object | 7 occurrences |  | `{"property":10,"specialTag":0,"tags":0,"addedValue":0,"in...` | Stat lines. |
| `stats[].property` | number | 7 occurrences | values 7,8,10,11,16,27,28 | `10` | Stat property id (SP enum, see enums.md). |
| `stats[].specialTag` | number | 7 occurrences | values 0 | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `stats[].tags` | number | 7 occurrences | values 0 | `0` | Tag bit mask (AT enum, see enums.md). |
| `stats[].addedValue` | number | 7 occurrences | values 0,0.01,0.02,2,4,6 | `0` | Flat added value. |
| `stats[].increasedValue` | number | 7 occurrences | values 0,0.04 | `0.04` | Increased (%) value as fraction. |
| `stats[].moreValues` | array | 7 occurrences | len 0..0 | `[]` | List of "more" multipliers as fractions. |
| `corruptedStats` | array | always | len 2..2 | `[{"property":98,"specialTag":0,"tags":636,"addedValue":0,...` |  |
| `corruptedStats[]` | object | 10 occurrences |  | `{"property":98,"specialTag":0,"tags":636,"addedValue":0,"...` |  |
| `corruptedStats[].property` | number | 10 occurrences | values 5,10,18,51,58,98,114,120 | `98` | Stat property id (SP enum, see enums.md). |
| `corruptedStats[].specialTag` | number | 10 occurrences | values 0,9,34 | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `corruptedStats[].tags` | number | 10 occurrences | values 0,256,636,637,638,782 | `636` | Tag bit mask (AT enum, see enums.md). |
| `corruptedStats[].addedValue` | number | 10 occurrences | values -0.01,0,0.002,0.003,0.01 | `0` | Flat added value. |
| `corruptedStats[].increasedValue` | number | 10 occurrences | values -0.01,-0.005,0,0.02,0.03 | `0` | Increased (%) value as fraction. |
| `corruptedStats[].moreValues` | array | 10 occurrences | len 0..1 | `[0.0002]` | List of "more" multipliers as fractions. |

Example (key `0`, record #0, trimmed):

```json
{
  "attributeName": 0,
  "stats": [
    {
      "property": 10,
      "specialTag": 0,
      "tags": 0,
      "addedValue": 0,
      "increasedValue": 0.04,
      "moreValues": []
    }
  ],
  "corruptedStats": [
    {
      "property": 98,
      "specialTag": 0,
      "tags": 636,
      "addedValue": 0,
      "increasedValue": 0,
      "moreValues": [0.0002]
    },
    {
      "property": 51,
      "specialTag": 0,
      "tags": 0,
      "addedValue": 0,
      "increasedValue": -0.005,
      "moreValues": []
    }
  ]
}
```

### `coreAttributes[*].stats[]`

- **Location:** `coreDB.coreAttributes.<n>.stats[]` (file: db-B)
- **Keying:** array
- **Record count:** 7

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `property` | number | always | values 7,8,10,11,16,27,28 | `10` | Stat property id (SP enum, see enums.md). |
| `specialTag` | number | always | values 0 | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `tags` | number | always | values 0 | `0` | Tag bit mask (AT enum, see enums.md). |
| `addedValue` | number | always | values 0,0.01,0.02,2,4,6 | `0` | Flat added value. |
| `increasedValue` | number | always | values 0,0.04 | `0.04` | Increased (%) value as fraction. |
| `moreValues` | array | always | len 0..0 | `[]` | List of "more" multipliers as fractions. |

Example (record #0, trimmed):

```json
{
  "property": 10,
  "specialTag": 0,
  "tags": 0,
  "addedValue": 0,
  "increasedValue": 0.04,
  "moreValues": []
}
```

### `coreDB.defaultProperty`

- **Location:** `coreDB.defaultProperty` (file: db-B)
- **Keying:** single object (defaults)
- **Record count:** 1

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `property` | number | always | values 0 | `0` | Stat property id (SP enum, see enums.md). |
| `roundAddedToInt` | number | always | values 0 | `0` | Rounding mode for added values (0 none, 1 integer, 2/3 other; see enums.md). |
| `roundingForMore` | number | always | values 0 | `0` | Rounding mode for "more" values. |
| `displayAddedAsPercentage` | number | always | values 0 | `0` | Display added value as a percentage. |
| `displayAsPercentageOf` | number | always | values 0 | `0` | Display as "% of ...". |
| `displayAddedAsTenthOfValue` | number | always | values 0 | `0` | Display added value as tenth. |
| `displayAsAddedTo` | number | always | values 0 | `0` | Display as "added to ...". |
| `dontDisplayPlus` | number | always | values 0 | `0` | Do not prefix + sign. |
| `altTextOverrides` | array | always | len 0..0 | `[]` | Alternate texts by (modType,specialTag,tags). |
| `moreRoundingOverrides` | array | always | len 0..0 | `[]` | Per (property,specialTag) rounding overrides. |
| `hideModifierValue` | number | always | values 0 | `0` | Hide the numeric value. |
| `nameIncludesModifier` | number | always | values 0 | `0` | Name already includes the modifier word. |
| `propertyNameKey` | null | always | values null | `null` | i18n key of the property name. |
| `altTextKey` | null | always | values null | `null` | i18n key for the alt (secondary) tooltip text. |

Example (record #0, trimmed):

```json
{
  "property": 0,
  "roundAddedToInt": 0,
  "roundingForMore": 0,
  "displayAddedAsPercentage": 0,
  "displayAsPercentageOf": 0,
  "displayAddedAsTenthOfValue": 0,
  "displayAsAddedTo": 0,
  "dontDisplayPlus": 0,
  "altTextOverrides": [],
  "moreRoundingOverrides": [],
  "hideModifierValue": 0,
  "nameIncludesModifier": 0,
  "propertyNameKey": null,
  "altTextKey": null
}
```

### `coreDB.extraStatData.data`

- **Location:** `coreDB.extraStatData.data` (file: db-B)
- **Keying:** array
- **Record count:** 3
- **Notes:** Proc-limit data for specific stats.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `property` | number | always | values 126,127 | `127` | Stat property id (SP enum, see enums.md). |
| `specialTag` | number | always | values 1,3 | `1` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `tags` | number | always | values 0,39,512 | `512` | Tag bit mask (AT enum, see enums.md). |
| `extraTag` | number | always | values 1,220 | `220` | Tertiary selector (e.g. extra tag); mostly 0. |
| `hasProcLimit` | boolean | always | values true | `true` |  |
| `procsPerInterval` | number | always | values 1,2,3 | `3` |  |
| `interval` | number | always | values 2,6,7 | `2` |  |
| `delay` | number | always | values 0 | `0` |  |

Example (record #0, trimmed):

```json
{
  "property": 127,
  "specialTag": 1,
  "tags": 512,
  "extraTag": 220,
  "hasProcLimit": true,
  "procsPerInterval": 3,
  "interval": 2,
  "delay": 0
}
```

### `coreDB.idolAltarPropertyList.list`

- **Location:** `coreDB.idolAltarPropertyList.list` (file: db-B)
- **Keying:** array; index = idol-altar property id
- **Record count:** 31

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `roundAddedToInt` | number | always | values 0,1 | `1` | Rounding mode for added values (0 none, 1 integer, 2/3 other; see enums.md). |
| `roundingForMore` | number | always | values 0 | `0` | Rounding mode for "more" values. |
| `displayAddedAsPercentage` | number | always | values 0,1 | `0` | Display added value as a percentage. |
| `displayAsPercentageOf` | number | always | values 0 | `0` | Display as "% of ...". |
| `displayAddedAsTenthOfValue` | number | always | values 0 | `0` | Display added value as tenth. |
| `displayAsAddedTo` | number | always | values 0 | `0` | Display as "added to ...". |
| `dontDisplayPlus` | number | always | values 0,1 | `0` | Do not prefix + sign. |
| `lessIsBetter` | number | always | values 0 | `0` | Lower value is beneficial. |
| `hideModifierValue` | number | always | values 0 | `0` | Hide the numeric value. |
| `nameIncludesModifier` | number | always | values 0 | `0` | Name already includes the modifier word. |
| `propertyNameKey` | string | always | >12 distinct | `"Properties.Property_IdolAltar_0_Name"` | i18n key of the property name. |
| `altTextKey` | null(14)\|string(17) | always | >12 distinct | `null` | i18n key for the alt (secondary) tooltip text. |

Example (record #1, trimmed):

```json
{
  "roundAddedToInt": 0,
  "roundingForMore": 0,
  "displayAddedAsPercentage": 0,
  "displayAsPercentageOf": 0,
  "displayAddedAsTenthOfValue": 0,
  "displayAsAddedTo": 0,
  "dontDisplayPlus": 1,
  "lessIsBetter": 0,
  "hideModifierValue": 0,
  "nameIncludesModifier": 0,
  "propertyNameKey": "Properties.Property_IdolAltar_1_Name",
  "altTextKey": "Properties.Property_IdolAltar_1_AltText"
}
```

### `coreDB.corruptionOutcomeConfig.corruptionCategoryConfig`

- **Location:** `coreDB.corruptionOutcomeConfig.corruptionCategoryConfig` (file: db-B)
- **Keying:** array
- **Record count:** 8

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `category` | number | always | values 1,2,3,4,5,6,7,8 | `1` |  |
| `cannotCombineWithType` | boolean | always | values false,true | `false` |  |
| `positiveChance` | number | always | values 0.75,0.9 | `0.75` |  |
| `positiveOutcomes` | array | always | len 1..8 | `[{"corruptionOutcome":9,"weight":1,"maximumChanceType":0,...` |  |
| `positiveOutcomes[]` | object | 33 occurrences |  | `{"corruptionOutcome":9,"weight":1,"maximumChanceType":0,"...` |  |
| `positiveOutcomes[].corruptionOutcome` | number | 33 occurrences | values 5,8,9,10,11,12,13,16,17,21 | `9` |  |
| `positiveOutcomes[].weight` | number | 33 occurrences | values 0.01,0.25,0.4,0.5,1,1.1,2,3,6,8,10 | `1` |  |
| `positiveOutcomes[].maximumChanceType` | number | 33 occurrences | values 0 | `0` |  |
| `positiveOutcomes[].maximumChance` | number | 33 occurrences | values 0.025,0.04,0.05,0.1,0.11,0.2,0.25,0.9,1 | `0.1` |  |
| `positiveOutcomes[].tierWeights` | array | 33 occurrences | len 7..7 | `[1,1,1,1,1,1,1]` |  |
| `positiveOutcomes[].replacesAffix` | boolean | 33 occurrences | values false,true | `false` |  |
| `positiveOutcomes[].minAffixesForReplace` | number | 33 occurrences | values 4,6 | `4` |  |
| `positiveOutcomes[].minRemovableTiers` | number | 33 occurrences | values 0 | `0` |  |
| `positiveOutcomes[].maxRemovableTiers` | number | 33 occurrences | values 0 | `0` |  |
| `positiveOutcomes[].normalizedRollValue` | number | 33 occurrences | values 0,0.5,1 | `0.5` |  |
| `positiveOutcomes[].canSetRollOnAffixes` | boolean | 33 occurrences | values false,true | `false` |  |
| `positiveOutcomes[].canSetRollOnUniqueMod` | boolean | 33 occurrences | values false,true | `false` |  |
| `positiveOutcomes[].canSetRollOnImplicits` | boolean | 33 occurrences | values false,true | `false` |  |
| `positiveOutcomes[].randomizeSubType` | boolean | 33 occurrences | values false | `false` |  |
| `positiveOutcomes[].randomizeAffixes` | boolean | 33 occurrences | values false | `false` |  |
| `positiveOutcomes[].rarityToSet` | number | 33 occurrences | values 0 | `0` |  |
| `positiveOutcomes[].extraCorruptions` | number | 33 occurrences | values 0,1 | `0` |  |
| `positiveOutcomes[].extraCorruptionOutcomes` | array | 33 occurrences | len 0..5 | `[]` |  |
| `positiveOutcomes[].nemesisIterations` | number | 33 occurrences | values 2,3 | `3` |  |
| `negativeOutcomes` | array | always | len 1..5 | `[{"corruptionOutcome":1,"weight":1,"maximumChanceType":0,...` |  |
| `negativeOutcomes[]` | object | 23 occurrences |  | `{"corruptionOutcome":1,"weight":1,"maximumChanceType":0,"...` |  |
| `negativeOutcomes[].corruptionOutcome` | number | 23 occurrences | values 0,1,3,6,8,14,19,22,23 | `1` |  |
| `negativeOutcomes[].weight` | number | 23 occurrences | values 1 | `1` |  |
| `negativeOutcomes[].maximumChanceType` | number | 23 occurrences | values 0 | `0` |  |
| `negativeOutcomes[].maximumChance` | number | 23 occurrences | values 1 | `1` |  |
| `negativeOutcomes[].tierWeights` | array | 23 occurrences | len 7..7 | `[1,1,1,1,1,1,1]` |  |
| `negativeOutcomes[].replacesAffix` | boolean | 23 occurrences | values false | `false` |  |
| `negativeOutcomes[].minAffixesForReplace` | number | 23 occurrences | values 4 | `4` |  |
| `negativeOutcomes[].minRemovableTiers` | number | 23 occurrences | values 0,5,99 | `0` |  |
| `negativeOutcomes[].maxRemovableTiers` | number | 23 occurrences | values 0,15,99 | `0` |  |
| `negativeOutcomes[].normalizedRollValue` | number | 23 occurrences | values 0,0.5 | `0.5` |  |
| `negativeOutcomes[].canSetRollOnAffixes` | boolean | 23 occurrences | values false,true | `false` |  |
| `negativeOutcomes[].canSetRollOnUniqueMod` | boolean | 23 occurrences | values false,true | `false` |  |
| `negativeOutcomes[].canSetRollOnImplicits` | boolean | 23 occurrences | values false,true | `false` |  |
| `negativeOutcomes[].randomizeSubType` | boolean | 23 occurrences | values false,true | `false` |  |
| `negativeOutcomes[].randomizeAffixes` | boolean | 23 occurrences | values false,true | `false` |  |
| `negativeOutcomes[].rarityToSet` | number | 23 occurrences | values 0,2,7 | `0` |  |
| `negativeOutcomes[].extraCorruptions` | number | 23 occurrences | values 0 | `0` |  |
| `negativeOutcomes[].extraCorruptionOutcomes` | array | 23 occurrences | len 0..0 | `[]` |  |
| `negativeOutcomes[].nemesisIterations` | number | 23 occurrences | values 2,3 | `3` |  |

Example (record #0, trimmed):

```json
{
  "category": 1,
  "cannotCombineWithType": false,
  "positiveChance": 0.75,
  "positiveOutcomes": [
    {
      "corruptionOutcome": 9,
      "weight": 1,
      "maximumChanceType": 0,
      "maximumChance": 0.1,
      "tierWeights": [1, 1, "...(+5 more)"],
      "replacesAffix": false,
      "minAffixesForReplace": 4,
      "minRemovableTiers": 0,
      "maxRemovableTiers": 0,
      "normalizedRollValue": 0.5,
      "canSetRollOnAffixes": false,
      "canSetRollOnUniqueMod": false,
      "canSetRollOnImplicits": false,
      "randomizeSubType": false,
      "randomizeAffixes": false,
      "rarityToSet": 0,
      "extraCorruptions": 0,
      "extraCorruptionOutcomes": [],
      "nemesisIterations": 3
    },
    {
      "corruptionOutcome": 10,
      "weight": 1,
      "maximumChanceType": 0,
      "maximumChance": 0.1,
      "tierWeights": [1, 1, "...(+5 more)"],
      "replacesAffix": false,
      "minAffixesForReplace": 4,
      "minRemovableTiers": 0,
      "maxRemovableTiers": 0,
      "normalizedRollValue": 0.5,
      "canSetRollOnAffixes": false,
      "canSetRollOnUniqueMod": false,
      "canSetRollOnImplicits": false,
      "randomizeSubType": false,
      "randomizeAffixes": false,
      "rarityToSet": 0,
      "extraCorruptions": 0,
      "extraCorruptionOutcomes": [],
      "nemesisIterations": 3
    },
    "...(+6 more)"
  ],
  "negativeOutcomes": [
    {
      "corruptionOutcome": 1,
      "weight": 1,
      "maximumChanceType": 0,
      "maximumChance": 1,
      "tierWeights": [1, 1, "...(+5 more)"],
      "replacesAffix": false,
      "minAffixesForReplace": 4,
      "minRemovableTiers": 0,
      "maxRemovableTiers": 0,
      "normalizedRollValue": 0.5,
      "canSetRollOnAffixes": false,
      "canSetRollOnUniqueMod": false,
      "canSetRollOnImplicits": false,
      "randomizeSubType": false,
      "randomizeAffixes": false,
      "rarityToSet": 0,
      "extraCorruptions": 0,
      "extraCorruptionOutcomes": [],
      "nemesisIterations": 3
    },
    {
      "corruptionOutcome": 6,
      "weight": 1,
      "maximumChanceType": 0,
      "maximumChance": 1,
      "tierWeights": [1, 1, "...(+5 more)"],
      "replacesAffix": false,
      "minAffixesForReplace": 4,
      "minRemovableTiers": 5,
      "maxRemovableTiers": 15,
      "normalizedRollValue": 0.5,
      "canSetRollOnAffixes": false,
      "canSetRollOnUniqueMod": false,
      "canSetRollOnImplicits": false,
      "randomizeSubType": false,
      "randomizeAffixes": false,
      "rarityToSet": 0,
      "extraCorruptions": 0,
      "extraCorruptionOutcomes": [],
      "nemesisIterations": 3
    },
    "...(+3 more)"
  ]
}
```

### `LEAbilities.abilityList`

- **Location:** `LEAbilities.abilityList` (file: planner)
- **Keying:** object keyed by `id` string (e.g. "fi9", "ability_gen172", "ailment_6")
- **Record count:** 1228
- **Key space:** 1228 keys, e.g. `hs18gu`, `ab0lh`, `st31et`, `ailment_md26kh_1`
- **Notes:** Every ability: player skills, monster abilities, internal procs.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `internalName` | string(981)\|null(247) | always | >12 distinct | `"hungeringSouls"` | Game-internal (Unity) name. |
| `index` | number(981)\|null(247) | always | 1..993 (>12 distinct) | `153` | Ability index (position in abilityList). |
| `id` | string | always | >12 distinct | `"hs18gu"` | Record identifier (type depends on collection; see ids.md). |
| `name` | null(522)\|string(706) | always | >12 distinct | `null` | Internal / English name. |
| `nameKey` | string(521)\|null(707) | always | >12 distinct | `"Abilities.Ability_HungeringSouls_Name"` | i18n key (en.json) for the name. |
| `descriptionKey` | string(494)\|null(734) | always | >12 distinct | `"Abilities.Ability_HungeringSouls_Description"` | i18n key for the description. |
| `altTextKey` | string(317)\|null(911) | always | >12 distinct | `"Abilities.Ability_HungeringSouls_AltText"` | i18n key for the alt (secondary) tooltip text. |
| `skillLoreKey` | null(1222)\|string(6) | always | values null,"Abilities.Ability_Meteor_Lore","Abilities.Ability_TimeTravelTeleport...","Abilities.Ability_Soulfire Shield_Lore","Abilities.Ability_Amber Lantern_Lore","Abilities.Ability_Falconer 00 Falcon...","Abilities.Ability_TimeTravel AoE Tel..." | `null` | i18n key. |
| `tags` | number | always | 0..33591624 (>12 distinct) | `4384` | Tag bit mask (AT enum, see enums.md). |
| `fakeTags` | number | always | 0..155905 (>12 distinct) | `0` | Display-only tag mask. |
| `minionTagsDisplay` | number | always | 0..131329 (>12 distinct) | `0` | Minion tag display mask. |
| `areaTagDisplay` | number | always | values 0,1,2,3 | `0` | Area tag display. |
| `skillTreeConversionDamageTags` | number | always | 0..105 (>12 distinct) | `40` | Damage-type tag mask for tree conversions. |
| `manaCost` | number | always | 0..70 (>12 distinct) | `11` | Mana cost. |
| `channelCost` | number | always | values 0,13,15,18,20,23,24,48 | `0` | Channel mana cost per second. |
| `minimumManaCost` | number | always | values 0,1,2 | `0` |  |
| `as` | number(1225)\|string(3) | always | 0.14102596..110.00025 (>12 distinct) | `1.46667` | Animation speed. |
| `useDelay` | number | always | 0..3 (>12 distinct) | `0.1` | Use delay (s). |
| `useDuration` | number | always | 0..7.8 (>12 distinct) | `0.75` | Use duration (s). |
| `speedScaler` | number | always | values 2,3,9,54 | `3` | Speed scaler. |
| `speedMultiplier` | number | always | 0.3..5 (>12 distinct) | `1` | Speed multiplier. |
| `maxCharges` | number | always | values 0,1,2,3 | `0` | Max charges. |
| `chargesGainedPerSecond` | number | always | 0..2 (>12 distinct) | `0` | Charge regen. |
| `attributeScaling` | object | always |  | `{"2":[{"property":0,"specialTag":0,"tags":0,"addedValue":...` | Scaling by attribute id (0 Str..4 Att). |
| `levelScaling` | array | always | len 0..3 | `[]` | Per-level scaling stats. |
| `abilitySprite` | string(962)\|null(266) | always | >12 distinct | `"a-r-4"` | Sprite id. |
| `instantCastForPlayer` | boolean | always | values false,true | `false` | Instant cast. |
| `stopMovementOnKeyRelease` | boolean | always | values false,true | `false` |  |
| `channelled` | boolean | always | values false,true | `false` | Channelled ability. |
| `transform` | boolean | always | values false,true | `false` |  |
| `companion` | boolean | always | values false,true | `false` | Companion skill. |
| `transformHasMovementSkill` | boolean | always | values false,true | `false` |  |
| `countsAsMovementAbility` | boolean | always | values false,true | `false` | Movement skill. |
| `movementDuringUse` | number | always | values 0,1,3,4,5,7,9,10,11 | `0` |  |
| `comboAbility` | boolean | always | values false,true | `false` | Is combo ability. |
| `comboTimeLimit` | number | always | 0..999 (>12 distinct) | `0` | Combo window. |
| `traversalSkill` | boolean | always | values false,true | `false` | Traversal skill. |
| `prefab` | object | always |  | `{"components":[{"type":"DamageEnemyOnHit","baseDamageStat...` | Component list (polymorphic). |
| `prefab.components` | array | always | len 0..7 | `[{"type":"DamageEnemyOnHit","baseDamageStats":{"damage":[...` | Component list (polymorphic). |
| `comboAbilities` | array | always | len 0..3 | `[]` | Combo follow-ups. |
| `sharedCooldownAbilities` | array | always | len 0..3 | `[]` | Abilities sharing cooldown. |
| `description` | string | 443/1228 (36.1%) | >12 distinct | `"A burst of flame that deals high damage in an area aroun...` | English description text. |
| `altText` | string | 142/1228 (11.6%) | >12 distinct | `"Added damage is applied at 500% effectiveness."` | English alt tooltip text. |
| `sharedCooldownAbilities[]` | string | 47 occurrences | >12 distinct | `"fw3d"` | Abilities sharing cooldown. |
| `comboAbilities[]` | string | 82 occurrences | >12 distinct | `"ch4bo_me27_2_me27_1"` | Combo follow-ups. |
| `skillLore` | string | 3/1228 (0.2%) | values "A cunning mage can use the power of ...","This is used by the thorn burst tree" | `"A cunning mage can use the power of gravity in more ways...` | Lore text. |

Example (key `hs18gu`, record #0, trimmed):

```json
{
  "internalName": "hungeringSouls",
  "index": 153,
  "id": "hs18gu",
  "name": null,
  "nameKey": "Abilities.Ability_HungeringSouls_Name",
  "descriptionKey": "Abilities.Ability_HungeringSouls_Description",
  "altTextKey": "Abilities.Ability_HungeringSouls_AltText",
  "skillLoreKey": null,
  "tags": 4384,
  "fakeTags": 0,
  "minionTagsDisplay": 0,
  "areaTagDisplay": 0,
  "skillTreeConversionDamageTags": 40,
  "manaCost": 11,
  "channelCost": 0,
  "minimumManaCost": 0,
  "as": 1.46667,
  "useDelay": 0.1,
  "useDuration": 0.75,
  "speedScaler": 3,
  "speedMultiplier": 1,
  "maxCharges": 0,
  "chargesGainedPerSecond": 0,
  "attributeScaling": {
    "2": [
      {
        "property": 0,
        "specialTag": 0,
        "tags": 0,
        "addedValue": 0,
        "increasedValue": 0.04,
        "moreValues": []
      }
    ]
  },
  "levelScaling": [],
  "abilitySprite": "a-r-4",
  "instantCastForPlayer": false,
  "stopMovementOnKeyRelease": false,
  "channelled": false,
  "transform": false,
  "companion": false,
  "transformHasMovementSkill": false,
  "countsAsMovementAbility": false,
  "movementDuringUse": 0,
  "...": "+6 more keys"
}
```

#### Ability prefab components (2516 components, 87 distinct `type` values)

| component `type` | count | fields (presence >=50% bold) |
|---|---|---|
| `DestroyAfterDuration` | 687 | **type**, **duration** |
| `DamageEnemyOnHit` | 577 | **type**, **baseDamageStats**, **damageTags**, **damageModifier**, **highPriorityDoT**, **canDamageSameEnemyAgain**, **canDamageSameEnemyAgainAfterDuration** |
| `ChanceToApplyAilmentsOnHit` | 201 | **type**, **targetType**, **ailments**, **chanceModifier**, **canApplyToSameEnemyAgain**, **cannotApply** |
| `CastAfterDuration` | 164 | **type**, **ability**, **abilitiesSequence**, **randomAbilitiesToCast**, **preventDuplicateAbilitiesInARow**, **interval**, **castOnStartAsWell**, **limitCasts**, **remainingCasts**, **randomExtraCasts**, **castRemainingExtrasAllOnDeath**, **castChance**, **manaToPayOnCast**, **alternateAbility**, **chanceToUseAlternateAbility**, **playerCanCastOnlyInCombat** |
| `CreateAbilityObjectOnDeath` | 144 | **type**, **abilityToInstantiate**, **aimingMethod**, **aimingDistance**, **createAtTarget**, **createAtStartLocation**, **createAtCastLocation**, **failsIfFailedAbility**, **additionalCasts**, **randomExtraCasts**, **fireInCircle**, **fireInLine**, **alsoCastAfterDelay**, **delay**, **failsIfAbilityFailsToHit**, **chanceToCast** |
| `SummonEntityOnDeath` | 107 | **type**, **entity**, **randomActorInstead**, **randomActors**, **numberToSummon**, **limitDuration**, **duration**, **followsCreator**, **statList**, **limit**, **limitNumber**, **companion**, **summonIsASummoner** |
| `BuffParent` | 95 | **type**, **onlyApplyToMinions**, **onlyApplyToCreatorMinions**, **orCreatorCreatorMinions**, **increasedStatEffectOnMinions**, **scalesWithAreaLevel**, **increasedSize**, **ward**, **wardRegen**, **cantGainWard**, **forceZeroWard**, **wardPercentage**, **cantHeal**, **capHealthAtCurrent**, **cappedHealthMaxPercent**, **stats**, **reapplyQuantity**, **reapplyInterval** |
| `RepeatedlyDamageEnemiesWithinRadius` | 60 | **type**, **baseDamageStats**, **damageTags**, **damageModifier**, **highPriorityDoT**, **radius**, **minRadius**, **damageInterval**, **damageIncreasePerInterval**, **maxDamageIncreaseFromInterval**, **limitMaxDamageIncreaseFromInterval**, **damageAtStart**, **undodgeable**, **maxTargets**, **alsoDamageParent**, **delay** |
| `ExtraProjectiles` | 47 | **type**, **angle**, **numberOfExtraProjectiles**, **randomAngles**, **delayExtraProjectiles**, **delayWindow**, **randomiseDelay**, **lineMode**, **autoTarget** |
| `RepeatedlyApplyAilmentsInRadius` | 39 | **type**, **ailments**, **targetType**, **radius**, **applicationInterval**, **applyOnStart**, **applyOutsideRadiusInstead**, **delay** |
| `Pierce` | 39 | **type**, **pierceStyle**, **pierceChance**, **objectsToPierce** |
| `DamageEnemiesWithBeam` | 29 | **type**, **baseDamageStats**, **damageTags**, **damageModifier**, **highPriorityDoT**, **damageAtStart**, **damageInterval** |
| `HitsTargets` | 26 | **type**, **hitNearest**, **requiredLifeState**, **targetAllies**, **minDistanceFromCentre**, **maxDistanceFromCentre**, **accountForRadius**, **enemyMustBeCursed**, **requiredAilment**, **spreadType**, **spreadRange**, **minSpreadDistance**, **extraTargets**, **limitTargetsToArcInFront**, **arcDegrees** |
| `HomingMovement` | 15 | **type**, **targetType** |
| `BuffOnAllyHit` | 13 | **type**, **canApplyToSameAllyAgain**, **onlyApplyToCreatorsMinions**, **onlyApplyToCreatorsTotems**, **onlyApplyToCreatorsCompanions**, **onlyApplyToCreatorsCreatorsMinions**, **onlyApplyToCreatorsCreatorsCompanions**, **onlyApplyToMinions**, **onlyApplyToMinionFromAbility**, **cannotApplyToCreator**, **onlyApplyToCreatorSummoner**, **requiredAbility**, **requiresSpecificTagForSummonedAbility**, **requiredTags**, **otherSufficientAbilties**, **buffs**, **cycleBuffsEachHit** |
| `CastAtRandomPointAfterDuration` | 12 | **type**, **ability**, **duration**, **limitCasts**, **remainingCasts**, **castsAtStart**, **radius** |
| `MoveCreatorToTargetOnDeath` | 12 | **type**, **dontMoveCreatorIfDeath**, **moveToExactPosition** |
| `KillSelf` | 11 | **type** |
| `CreateAbilityObjectOnNewEnemyHit` | 10 | **type**, **abilityToInstantiate**, **spawnAtHit**, **limit**, **chance**, **active** |
| `HealAlliesOnHit` | 10 | **type**, **canHealSameAllyAgain**, **healAmount**, **healPercentOfMaxHealthInstead**, **healAmountToLowLifeTargets**, **onlyApplyToCreatorMinions**, **onlyApplyToMinionFromAbility**, **modifierForCreatorMinions**, **modifierForMinions**, **requiredAbility**, **singleUse**, **countsAsHealOverTime**, **noHealCreator**, **noHealCreatorSummoner** |
| `Stance` | 10 | **type**, **ability** |
| `MineTrigger` | 10 | **type**, **ability**, **triggerType**, **castDelay** |
| `BuffCreator` | 9 | **type**, **lifeRegen**, **wardRegen**, **speed**, **percentageSpeed**, **reducedStunDuration**, **manaCostDivider**, **ward**, **wardPercentage**, **increasedSize**, **stats** |
| `CreateAbilityObjectOnStart` | 8 | **type**, **abilityToInstantiate**, **aimingMethod**, **aimingDistance**, **createAtTarget**, **createAtStartLocation**, **active** |
| `MoveCreatorToPositionOnDeath` | 7 | **type**, **dontMoveCreatorIfDeath** |
| `RepeatedlyPullEnemiesWithinRadius` | 7 | **type**, **distanceMultiplier**, **limitDistanceToMax**, **maxDistance**, **radius**, **minimumRadius**, **interval**, **pullOnStart** |
| `ApplyAilmentToParent` | 7 | **type**, **ailments**, **applyRepeatedly**, **interval**, **scaleWithStats**, **requireCasterMinion** |
| `BuffCreatorOnCreation` | 7 | **type**, **runOnCreation**, **buffs** |
| `RepeatedlyBuffInRadius` | 7 | **type**, **buffs**, **radius**, **applicationInterval**, **targetType**, **applyOnStart**, **increasedBuffEffectPerNearbyAlly**, **distanceForNearbyAllyToCount**, **maxNumberOfAlliesCountingForBuff** |
| `ApplyAilmentToCreator` | 7 | **type**, **ailments**, **applyRepeatedly**, **interval**, **scaleWithStats**, **increaseSpeedOverTime**, **accelerationPerInterval**, **increaseSpeedInterval**, **maxSpeedup** |
| `StunEnemyOnHit` | 6 | **type**, **duration**, **useDifferentDurationForRareAndBoss**, **rareAndBossDuration**, **canStunSameEnemyAgain**, **failChanceAgainstBosses** |
| `KnockBackOnHit` | 6 | **type**, **chance**, **distance**, **knockBackFromCaster**, **hitsAlliesInstead**, **canHitSameActorTwice** |
| `ChanceToCreateAbilityObjectOnNewEnemyHit` | 6 | **type**, **abilityToInstantiate**, **aimingMethod**, **aimingDistance**, **spawnAtHit**, **spawnAtCreator**, **canOnlyTriggerOnce**, **chance**, **addedChanceAgainstRaresAndBosses**, **additionalCasts**, **fireInCircle**, **castOnDeathIfNeverCast** |
| `RepeatedlyHitsTargets` | 6 | **type**, **maxTargets**, **hitNearest**, **interval**, **hitImmediately**, **requiredLifeState**, **targetAllies**, **maxDistanceFromCentre**, **maxDistanceFromCentreForCurrentTargets**, **maxTargettingDistanceChangePerSecond**, **minDistanceFromCentre**, **minDistanceFromCentreForCurrentTargets**, **minTargettingDistanceChangePerSecond**, **spreadType**, **spreadRange**, **limitTargetsToArcInFront**, **arcDegrees** |
| `HealParent` | 6 | **type**, **healInterval**, **healAmount**, **healAmountOnStart**, **healAmountOnDeath**, **wardAmountOnStart**, **wardGainBenefitsFromHealEffectiveness**, **modifierForCreatorMinions**, **healMultiplierForCreator**, **healCreatorToo**, **restoreManaInsteadOfHealing** |
| `RetaliateWhenParentHit` | 5 | **type**, **ability**, **healthRelativity**, **sourceOfAbility**, **damageTakenTrigger**, **damageTakenSinceTrigger**, **limitRetaliations**, **retaliationsRemaining**, **destroyAfterLastRetaliation**, **onlyCountHitDamage**, **countsOverkillDamage**, **chanceBasedRetaliation**, **retaliationChance**, **chanceModifierForAllies**, **cooldown** |
| `HitsParent` | 5 | **type**, **hitsOnStart**, **repeatedlyHits**, **initialDelay**, **interval** |
| `FreezeEnemyOnHit` | 4 | **type**, **duration**, **canFreezeSameEnemyAgain**, **timeLockInstead**, **failChanceAgainstBosses**, **ignoreImmunity** |
| `RepeatedlyHealAlliesWithinRadius` | 4 | **type**, **radius**, **interval**, **healAmount**, **increasedHealingPerInterval**, **modifierForMinions**, **modifierForCreatorMinions**, **healAtStart**, **healAtEnd**, **healPerCasterMissingHealth**, **manaAmount**, **noHealCreator**, **increasedRadius**, **increasedAreaPerSecond** |
| `RepeatedlyDamageParent` | 4 | **type**, **baseDamageStats**, **damageTags**, **damageModifier**, **highPriorityDoT**, **damageOnDeath**, **detachOnParentDeath**, **damageInterval** |
| `CreateResourceReturnAbilityObjectOnEnemyHit` | 4 | **type**, **health**, **mana**, **ward**, **healthScalesWithIncreasedHealing**, **doubleEffectChance**, **addedHeathPerHit**, **addedManaPerHit**, **addedWardPerHit**, **increasedHeathFromRareOrBoss**, **increasedManaFromRareOrBoss**, **increasedWardFromRareOrBoss**, **addedHeathFromRareOrBoss**, **addedManaFromRareOrBoss**, **addedWardFromRareOrBoss**, **spawnAtHit**, **increasedTravelSpeed**, **limitProcs**, **maxProcs** |
| `BuffCreatorOnDeathPerHit` | 4 | **type**, **maxHits**, **buffs** |
| `BuffCreatorOnDeath` | 4 | **type**, **durationIsRelativeToAge**, **durationToAgeRatio**, **showUIBuff**, **uiBuffId**, **buffs** |
| `GiveCreatorResourcesOnCollisionWithCreator` | 4 | **type**, **healthOnHit**, **manaOnHit**, **wardOnHit**, **destroyAfterCollidingWithCreator**, **destructionDelay**, **healthScalesWithIncreasedHealing** |
| `FormChanger` | 4 | **type**, **transformAbility**, **transformBackAbility**, **replaceSkills**, **transformAbilityList**, **replaceTransformSkill**, **transformReplacementSkill**, **setStartingMana**, **startingManaPercentage**, **autoTransformBackOnZeroMana**, **autoTransformBackAfterDuration**, **autoTransformBackOnCheatDeath**, **allowBleedThrough**, **autoTransformBackBelowHealthPercent**, **saveUntransformedCooldowns**, **continueUntransformedCooldowns**, **replacesManaWithRage** |
| `TransformBackToHumanOnDeath` | 4 | **type**, **manaRegained** |
| `ExitStance` | 4 | **type** |
| `AcceleratingHealthDrain` | 4 | **type**, **baseHealthDrain**, **baseHealthDrainAcceleration**, **healthDrainJerk**, **basePercentHealthDrain**, **basePercentHealthDrainAcceleration**, **percentHealthDrainJerk**, **baseCurrentHealthPercentDrain**, **baseCurrentHealthPercentDrainAcceleration**, **currentHealthPercentDrainJerk**, **drainMultiplier**, **minHealthPercentThreshold**, **drainedHealthHealsCreatorRatio**, **drainedHealthWardsCreatorRatio**, **drainParent**, **drainCreator** |
| `CullFrozenTargetsOnHit` | 3 | **type**, **onCullAbility**, **flatCullThreshold**, **percentageCullThreshold**, **eraseOnKill**, **ailmentsForCreatorOnCull** |
| `GiveCreatorResourcesOnHit` | 3 | **type**, **healthOnHit**, **manaOnHit**, **wardOnHit**, **healthScalesWithIncreasedHealing**, **canHitSameEnemyTwice**, **limittedTimes**, **remainingTimes**, **requireFrozenTarget**, **canHitAllies**, **onlyHitAllies**, **canHitSameAllyTwice** |
| `DamageCreatorOnCreation` | 3 | **type**, **percentCurrentHealthTaken**, **percentMaximumHealthTaken**, **flatDamage** |
| `RicochetMovement` | 3 | **type**, **speed**, **remainingRicochets**, **returnToCasterAfterLastRicochet**, **destroyAfterMovementFinished**, **maxRicochetRange**, **preferredMinRicochetRange**, **targetType**, **healthGainedOnRicochetHit**, **wardGainedOnRicochetHit**, **manaGainedOnRicochetHit** |
| `RepeatedlyGiveCreatorResources` | 2 | **type**, **interval**, **health**, **mana**, **ward**, **maxApplications**, **healthScalesWithIncreasedHealing**, **applyOnStart**, **requiresTransform** |
| `BuffCreatorAfterDuration` | 2 | **type**, **lifeRegen**, **wardRegen**, **speed**, **percentageSpeed**, **reducedStunDuration**, **manaCostDivider**, **ward**, **wardPercentage**, **increasedSize**, **stats**, **interval**, **age**, **maxSteps**, **buffAtStart** |
| `ModifyDamageOnRotation` | 2 | **type**, **damageModifierPerDegree**, **updateInterval**, **resetInterval** |
| `ChanceToCastOnKill` | 2 | **type**, **ability**, **castChance**, **summonerCasts**, **castFromTarget**, **eraseTarget**, **requireKillingBlowFromAbility**, **requiredKillingBlowAbility**, **requireFrozenTarget**, **useType** |
| `HitsTargetsOverTime` | 2 | **type**, **hitNearest**, **requiredLifeState**, **targetAllies**, **minDistanceFromCentre**, **maxDistanceFromCentre**, **accountForRadius**, **enemyMustBeCursed**, **requiredAilment**, **spreadType**, **spreadRange**, **minSpreadDistance**, **extraTargets**, **limitTargetsToArcInFront**, **arcDegrees**, **durationBetweenHits** |
| `GiveCreatorResourcesOnDeath` | 2 | **type**, **health**, **mana**, **ward**, **delayAfterDeath**, **healthScalesWithIncreasedHealing**, **setValueInstead**, **giveResourcesToParentInstead**, **healthAddedPerSecond**, **maxHitsDealt** |
| `CreateRandomAbilityObjectOnDeath` | 2 | **type**, **possibleAbilities**, **weights**, **abilityToInstantiate**, **aimingMethod**, **createAtTarget** |
| `RepeatedlyDamageEnemiesWithinArc` | 2 | **type**, **baseDamageStats**, **damageTags**, **damageModifier**, **highPriorityDoT**, **maxRadius**, **minRadius**, **arcDegrees**, **damageInterval**, **damageIncreasePerInterval**, **maxDamageIncreaseFromInterval**, **limitMaxDamageIncreaseFromInterval**, **damageAtStart**, **undodgeable**, **maxTargets**, **alsoDamageParent**, **delay** |
| `TauntOnHit` | 1 | **type**, **duration** |
| `PullEnemiesAfterCollision` | 1 | **type**, **distanceMultiplier**, **limitDistanceToMax**, **maxDistance**, **useRangeLimit**, **rangeLimit** |
| `SendEnemiesForwardInTimeOnHit` | 1 | **type**, **duration**, **excludeBossesAndMinibosses** |
| `CastAtCorpseOnKill` | 1 | **type**, **abilityToCast**, **castFromCorpse**, **eraseCorpse**, **chance** |
| `FearNearbyEnemies` | 1 | **type**, **range**, **updateInterval**, **fearOnStart**, **rangeCheckType**, **fearOrigin**, **fearChancePerUpdate**, **increasedFearDuration** |
| `MinionUsesAbilityOnStart` | 1 | **type**, **ability**, **minionsToUseAbility**, **requiresCanUseMovementAbilities** |
| `RepeatedlyGiveParentResources` | 1 | **type**, **interval**, **health**, **mana**, **ward**, **maxApplications**, **healthScalesWithIncreasedHealing**, **applyOnStart**, **instantMana**, **instantWard**, **requiresTransform** |
| `TransformSkillBuffParent` | 1 | **type**, **onlyApplyToMinions**, **onlyApplyToCreatorMinions**, **orCreatorCreatorMinions**, **increasedStatEffectOnMinions**, **scalesWithAreaLevel**, **increasedSize**, **ward**, **wardRegen**, **cantGainWard**, **forceZeroWard**, **wardPercentage**, **cantHeal**, **capHealthAtCurrent**, **cappedHealthMaxPercent**, **stats**, **reapplyQuantity**, **reapplyInterval**, **transformStatConversions** |
| `PushEnemiesOnHit` | 1 | **type**, **useRangeLimit**, **rangeLimit** |
| `CleanseAilmentsOnDeath` | 1 | **type**, **ailmentIDsToCleanse**, **cleanseAllNegative**, **cleanseFromParent** |
| `RepeatedlyAbsorbMinion` | 1 | **type**, **statsToGainOnAbsorb**, **maxRadius**, **absorbInterval**, **limitAbsorbs**, **maxAbsorbs**, **minionsAbsorbed**, **destroyOnFailToAbsorb**, **destroyDelay** |
| `CreatorTakesDamageOnSkillUse` | 1 | **type**, **canKill**, **percentCurrentHealthTaken**, **flatHealthTaken** |
| `ExchangeParentAndCreatorLocationOnDeath` | 1 | **type**, **dontMoveCreatorIfDeath**, **moveToExactPosition** |
| `SpreadAilmentsOnHit` | 1 | **type**, **targetType**, **ailmentsToSpread**, **canApplyToSameEnemyAgain** |
| `IncreaseDamageOnHit` | 1 | **type**, **damageIncreasePerHit**, **maximumTotalChange** |
| `CreateAbilityObjectOnRicochet` | 1 | **type**, **abilityToInstantiate**, **limit**, **aimingDistance** |
| `GiveCreatorResourcesOnStart` | 1 | **type**, **health**, **mana**, **ward**, **healthScalesWithIncreasedHealing**, **creatorIsParentsCreatorToo** |
| `ApplyAilmentToCreatorOnDeath` | 1 | **type**, **ailments**, **scaleWithStats**, **capDurationBasedOnLifetime**, **capLifetimeRatio**, **cleanseNegativeAilments** |
| `GiveResourcesOnHit` | 1 | **type**, **healthOnHit**, **manaOnHit**, **wardOnHit**, **healthScalesWithIncreasedHealing**, **canHitSameAllyTwice**, **limittedTimes**, **remainingTimes**, **requireFrozenTarget** |
| `MoveActorToPositionOnDeath` | 1 | **type**, **dontMoveCreatorIfDeath** |
| `FearOnHit` | 1 | **type**, **fearOrigin**, **increasedFearDuration** |
| `ResetCooldownForSpecificAbilitiesOnStart` | 1 | **type**, **resetCondition**, **chance**, **abilitiesToReset** |
| `ChanceToCastOnHit` | 1 | **type**, **ability**, **castChance**, **requiredAilmentIds**, **cooldownDuration**, **startsOffCooldown**, **requiresMelee**, **requiresCrit**, **requiresKill**, **requireRareOrBoss**, **requiresPlayer**, **limitCasts**, **castsRemaining** |
| `RepeatedlyCastAbility` | 1 | **type**, **abilityToCast**, **radius**, **castInterval**, **limitCasts**, **castsRemaining**, **updateIntervalWithAge**, **maxUpdateAge**, **intervalAtMaxAge** |
| `RepeatedlyCastAtNearestEnemyWithinRadius` | 1 | **type**, **abilityToCast**, **radius**, **castInterval**, **failChance**, **castFromTargetPosition**, **castAtRandomInRadiusInstead** |
| `KillActorOnHit` | 1 | **type**, **unsummon**, **excludeAllies**, **excludeEnemies** |
| `BuffCreatorMinionsWhileActive` | 1 | **type**, **stats** |

##### Component `DestroyAfterDuration` (687)

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `type` | string | always | values "DestroyAfterDuration" | `"DestroyAfterDuration"` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `duration` | number | always | 0..100000000 (>12 distinct) | `2.5` | Duration in seconds. |

Example:

```json
{"type": "DestroyAfterDuration", "duration": 2.5}
```

##### Component `DamageEnemyOnHit` (577)

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `type` | string | always | values "DamageEnemyOnHit" | `"DamageEnemyOnHit"` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `baseDamageStats` | object | always |  | `{"damage":[0,0,0,0,9,0,0],"critChance":0.05,"critMultipli...` | Base damage block: damage[7] = [physical, fire, cold, lightning, necrotic, void, poison]. |
| `baseDamageStats.damage` | array | always | len 7..7 | `[0,0,0,0,9,0,0]` | Per-damage-type values: [physical, fire, cold, lightning, necrotic, void, poison] (enums.md). |
| `baseDamageStats.critChance` | number | always | values 0,0.05,0.06,0.1,1 | `0.05` | Base crit chance. |
| `baseDamageStats.critMultiplier` | number | always | values 0,1,1.5,2 | `2` | Base crit multiplier. |
| `baseDamageStats.critType` | number | always | values 0,1 | `0` |  |
| `baseDamageStats.hit` | boolean | always | values true,false | `true` |  |
| `baseDamageStats.cullPercent` | number | always | values 0 | `0` |  |
| `baseDamageStats.flatCull` | number | always | values 0 | `0` |  |
| `baseDamageStats.increasedStunChance` | number | always | values 0,0.5,1 | `0` |  |
| `baseDamageStats.increasedStunDuration` | number | always | values 0 | `0` |  |
| `baseDamageStats.addedDamageScaling` | number | always | 0..100 (>12 distinct) | `0.45` | Scaling of added damage. |
| `baseDamageStats.additionalLeech` | number | always | values 0,0.3 | `0` |  |
| `baseDamageStats.freezeRate` | number | always | 0..400 (>12 distinct) | `0` |  |
| `baseDamageStats.convertAllAddedDamage` | boolean | always | values false | `false` |  |
| `baseDamageStats.damageTypeToConvertTo` | number | always | values 0 | `0` |  |
| `baseDamageStats.penetration` | array | always | len 0..2 | `[]` |  |
| `damageTags` | number | always | 0..33824 (>12 distinct) | `256` | Damage tag mask (AT). |
| `damageModifier` | number | always | values 0 | `0` |  |
| `highPriorityDoT` | boolean | always | values false,true | `false` |  |
| `canDamageSameEnemyAgain` | boolean | always | values false,true | `false` |  |
| `canDamageSameEnemyAgainAfterDuration` | number | always | values 0,0.25,0.3,0.5,1,2 | `0` |  |

Example:

```json
{
  "type": "DamageEnemyOnHit",
  "baseDamageStats": {
    "damage": [0, 0, "...(+5 more)"],
    "critChance": 0.05,
    "critMultiplier": 2,
    "critType": 0,
    "hit": true,
    "cullPercent": 0,
    "flatCull": 0,
    "increasedStunChance": 0,
    "increasedStunDuration": 0,
    "addedDamageScaling": 0.45,
    "additionalLeech": 0,
    "freezeRate": 0,
    "convertAllAddedDamage": false,
    "damageTypeToConvertTo": 0,
    "penetration": []
  },
  "damageTags": 256,
  "damageModifier": 0,
  "highPriorityDoT": false,
  "canDamageSameEnemyAgain": false,
  "canDamageSameEnemyAgainAfterDuration": 0
}
```

##### Component `ChanceToApplyAilmentsOnHit` (201)

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `type` | string | always | values "ChanceToApplyAilmentsOnHit" | `"ChanceToApplyAilmentsOnHit"` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `targetType` | number | always | values 0,1 | `0` |  |
| `ailments` | array | always | len 0..3 | `[{"ailment":4,"chance":1,"rolledSeparately":false,"increa...` | Ailment list. |
| `ailments[]` | object | 110 occurrences |  | `{"ailment":4,"chance":1,"rolledSeparately":false,"increas...` | Ailment list. |
| `chanceModifier` | number | always | values -0.4,0,1 | `0` |  |
| `canApplyToSameEnemyAgain` | boolean | always | values false,true | `false` |  |
| `cannotApply` | array | always | len 0..1 | `[]` |  |
| `cannotApply[]` | number | 2 occurrences | values 27,79 | `27` |  |

Example:

```json
{
  "type": "ChanceToApplyAilmentsOnHit",
  "targetType": 0,
  "ailments": [
    {"ailment": 4, "chance": 1, "rolledSeparately": false, "increasedDuration": 0, "increasedEffect": 0}
  ],
  "chanceModifier": 0,
  "canApplyToSameEnemyAgain": false,
  "cannotApply": []
}
```

##### Component `CastAfterDuration` (164)

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `type` | string | always | values "CastAfterDuration" | `"CastAfterDuration"` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `ability` | string | always | >12 distinct | `"ch4bo_me27_2"` |  |
| `abilitiesSequence` | array | always | len 0..0 | `[]` |  |
| `randomAbilitiesToCast` | array | always | len 0..0 | `[]` |  |
| `preventDuplicateAbilitiesInARow` | boolean | always | values false | `false` |  |
| `interval` | number | always | 0..10000 (>12 distinct) | `1` |  |
| `castOnStartAsWell` | boolean | always | values true,false | `true` |  |
| `limitCasts` | boolean | always | values true,false | `true` |  |
| `remainingCasts` | number | always | values 0,1,2,3,4,5,6,7,8,15,20 | `1` |  |
| `randomExtraCasts` | number | always | values 0,2,10 | `0` |  |
| `castRemainingExtrasAllOnDeath` | number | always | values 0,1,2 | `0` |  |
| `castChance` | number | always | values 0.1,1 | `1` |  |
| `manaToPayOnCast` | number | always | values 0 | `0` |  |
| `alternateAbility` | string | always | values "","fl44_te44_2" | `""` |  |
| `chanceToUseAlternateAbility` | number | always | values 0 | `0` |  |
| `playerCanCastOnlyInCombat` | boolean | always | values false,true | `false` |  |

Example:

```json
{
  "type": "CastAfterDuration",
  "ability": "ch0fs_am0hr_1",
  "abilitiesSequence": [],
  "randomAbilitiesToCast": [],
  "preventDuplicateAbilitiesInARow": false,
  "interval": 0.5,
  "castOnStartAsWell": false,
  "limitCasts": false,
  "remainingCasts": 0,
  "randomExtraCasts": 0,
  "castRemainingExtrasAllOnDeath": 0,
  "castChance": 1,
  "manaToPayOnCast": 0,
  "alternateAbility": "",
  "chanceToUseAlternateAbility": 0,
  "playerCanCastOnlyInCombat": false
}
```

### `LEAbilities.ailmentList`

- **Location:** `LEAbilities.ailmentList` (file: planner)
- **Keying:** object keyed by numeric ailment id (string)
- **Record count:** 148
- **Key space:** 148 keys, numeric 1..150

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `internalName` | string | always | >12 distinct | `"Ignite"` | Game-internal (Unity) name. |
| `id` | number | always | 1..150 (>12 distinct) | `1` | Record identifier (type depends on collection; see ids.md). |
| `duration` | number | always | 0..1000000 (>12 distinct) | `2.5` | Duration in seconds. |
| `maxInstances` | number | always | values 0,1,2,3,4,5,6,10,12,100 | `0` | Max stacks (0 = unlimited). |
| `positive` | boolean | always | values false,true | `false` | Beneficial effect. |
| `displayName` | string | always | >12 distinct | `"Ignite"` | English display name. |
| `displayNameKey` | string | always | >12 distinct | `"Ailments.Ailment_Ignite_Name"` | i18n key for the display name. |
| `applyPrefix` | number | always | values 0,1,2,3 | `0` | Grammar prefix enum for "applied" text. |
| `showsInBuffUI` | boolean | always | values true,false | `true` | Shown in buff UI. |
| `icon` | string(130)\|null(18) | always | >12 distinct | `"a-r-1"` | Icon sprite/hash. |
| `descriptionKey` | string(125)\|null(23) | always | >12 distinct | `"Ailments.Ailment_Ignite_Description"` | i18n key for the description. |
| `dealsDamage` | boolean | always | values true,false | `true` | Ailment deals damage. |
| `baseDamage` | object | always |  | `{"damage":[0,40,0,0,0,0,0],"critChance":0,"critMultiplier...` | Damage block (same shape as baseDamageStats). |
| `baseDamage.damage` | array | always | len 7..7 | `[0,40,0,0,0,0,0]` | Per-damage-type values: [physical, fire, cold, lightning, necrotic, void, poison] (enums.md). |
| `baseDamage.damage[]` | number | 1036 occurrences | 0..1000 (>12 distinct) | `0` | Per-damage-type values: [physical, fire, cold, lightning, necrotic, void, poison] (enums.md). |
| `baseDamage.critChance` | number | always | values 0,0.05 | `0` | Base crit chance. |
| `baseDamage.critMultiplier` | number | always | values 1,2 | `1` | Base crit multiplier. |
| `baseDamage.critType` | number | always | values 0,1 | `1` |  |
| `baseDamage.hit` | boolean | always | values false,true | `false` |  |
| `baseDamage.cullPercent` | number | always | values 0 | `0` |  |
| `baseDamage.flatCull` | number | always | values 0 | `0` |  |
| `baseDamage.increasedStunChance` | number | always | values 0 | `0` |  |
| `baseDamage.increasedStunDuration` | number | always | values 0 | `0` |  |
| `baseDamage.addedDamageScaling` | number | always | values 0,0.2,1,1.5,2,3,4,4.5,5,6,10 | `0` | Scaling of added damage. |
| `baseDamage.additionalLeech` | number | always | values 0 | `0` |  |
| `baseDamage.freezeRate` | number | always | values 0 | `0` |  |
| `baseDamage.convertAllAddedDamage` | boolean | always | values false | `false` |  |
| `baseDamage.damageTypeToConvertTo` | number | always | values 0 | `0` |  |
| `baseDamage.penetration` | array | always | len 0..0 | `[]` |  |
| `tags` | number | always | values 0,1,4096,4352,4608,16777472,16781312,16781568 | `4096` | Tag bit mask (AT enum, see enums.md). |
| `dealsAllDamageAtEnd` | boolean | always | values false,true | `false` |  |
| `effectOfIncreasedEffectiveness` | number | always | values 0,1 | `1` | Effect of increased effectiveness. |
| `additionalPenetrationDamageType` | number | always | values 0,1,2,3,4,5,6 | `1` | Damage type index penetrated (see damage order). |
| `buffScalingType` | number | always | values 0,1,2 | `0` | Scaling type for buffs. |
| `maxStacksThatApplyBuffs` | number | always | values 0,1,15,30 | `0` |  |
| `buffs` | array | always | len 0..7 | `[]` | Buff list. |
| `spreads` | boolean | always | values false,true | `false` | Ailment spreads. |
| `spreadRange` | number | always | values 0,5,6,9 | `0` |  |
| `spreadDelay` | number | always | values 0,0.6,99999 | `0` |  |
| `spreadIfDiedBeforeDelay` | boolean | always | values false,true | `false` |  |
| `maxSpreadPerInstance` | number | always | values 0,1 | `0` |  |
| `effectOfEffectivenessOnProc` | number | always | values 0,1,2 | `0` |  |
| `procsAbilityWhenStacksReached` | boolean | always | values false,true | `false` |  |
| `abilityToProcWhenStacksReached` | string | always | values "","ailment_2","ailment_3","ailment_pn32_4","ailment_fs47re_5","ailment_6","ailment_9","ailment_10","ailment_td46_12","ailment_13" | `""` |  |
| `stacksRequiredForProc` | number | always | values 0,4,5,8,20,60 | `0` |  |
| `procsAbilityOnExpiration` | boolean | always | values false,true | `false` |  |
| `abilityToProcOnExpiration` | string | always | values "","ailment_ln24_7","ailment_8","pa67ju" | `""` |  |
| `expirationAbilityProcsOnDeath` | boolean | always | values false,true | `false` |  |
| `stopsWhenHit` | boolean | always | values false,true | `false` |  |
| `blinds` | boolean | always | values false,true | `false` |  |
| `roots` | boolean | always | values false,true | `false` |  |
| `moreBuffEffectAgainstBosses` | number | always | values -0.6,-0.5,-0.06,0 | `0` |  |
| `moreBuffEffectAgainstPlayers` | number | always | values -0.6,-0.5,0 | `0` |  |
| `mutationType` | number | always | values 0,1,2 | `0` |  |
| `abilityForMutation` | string | always | >12 distinct | `""` |  |
| `movementAilment` | boolean | always | values false,true | `false` |  |
| `movementAilmentDistance` | number | always | values 0,0.1,1,5 | `0` |  |
| `movementAilmentIgnoresDistancePerStack` | boolean | always | values false | `false` |  |
| `movementAilmentDoesNotExpire` | boolean | always | values false,true | `false` |  |
| `movementAilmentRemovesOnNextMove` | boolean | always | values false,true | `false` |  |
| `curse` | boolean | always | values false,true | `false` |  |
| `buffs[]` | object | 160 occurrences |  | `{"property":2,"specialTag":0,"tags":0,"addedValue":0,"inc...` | Buff list. |
| `buffs[].property` | number | 160 occurrences | 0..118 (>12 distinct) | `2` | Stat property id (SP enum, see enums.md). |
| `buffs[].specialTag` | number | 160 occurrences | values 0,1,2,3,6,9 | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `buffs[].tags` | number | 160 occurrences | 0..16777216 (>12 distinct) | `0` | Tag bit mask (AT enum, see enums.md). |
| `buffs[].addedValue` | number | 160 occurrences | -100..200 (>12 distinct) | `0` | Flat added value. |
| `buffs[].increasedValue` | number | 160 occurrences | -0.2..1 (>12 distinct) | `0` | Increased (%) value as fraction. |
| `buffs[].moreValues` | array | 160 occurrences | len 0..1 | `[-0.12]` | List of "more" multipliers as fractions. |

Example (key `3`, record #2, trimmed):

```json
{
  "internalName": "Chill",
  "id": 3,
  "duration": 4,
  "maxInstances": 3,
  "positive": false,
  "displayName": "Chill",
  "displayNameKey": "Ailments.Ailment_Chill_Name",
  "applyPrefix": 0,
  "showsInBuffUI": true,
  "icon": "a-r-3",
  "descriptionKey": "Ailments.Ailment_Chill_Description",
  "dealsDamage": false,
  "baseDamage": {
    "damage": [0, 0, "...(+5 more)"],
    "critChance": 0,
    "critMultiplier": 1,
    "critType": 0,
    "hit": false,
    "cullPercent": 0,
    "flatCull": 0,
    "increasedStunChance": 0,
    "increasedStunDuration": 0,
    "addedDamageScaling": 1,
    "additionalLeech": 0,
    "freezeRate": 0,
    "convertAllAddedDamage": false,
    "damageTypeToConvertTo": 0,
    "penetration": []
  },
  "tags": 0,
  "dealsAllDamageAtEnd": false,
  "effectOfIncreasedEffectiveness": 0,
  "additionalPenetrationDamageType": 0,
  "buffScalingType": 0,
  "maxStacksThatApplyBuffs": 0,
  "buffs": [
    {
      "property": 2,
      "specialTag": 0,
      "tags": 0,
      "addedValue": 0,
      "increasedValue": 0,
      "moreValues": [-0.12]
    },
    {
      "property": 3,
      "specialTag": 0,
      "tags": 0,
      "addedValue": 0,
      "increasedValue": 0,
      "moreValues": [-0.12]
    },
    "...(+1 more)"
  ],
  "spreads": false,
  "spreadRange": 0,
  "spreadDelay": 0,
  "spreadIfDiedBeforeDelay": false,
  "maxSpreadPerInstance": 0,
  "effectOfEffectivenessOnProc": 0,
  "procsAbilityWhenStacksReached": false,
  "abilityToProcWhenStacksReached": "",
  "stacksRequiredForProc": 0,
  "procsAbilityOnExpiration": false,
  "abilityToProcOnExpiration": "",
  "expirationAbilityProcsOnDeath": false,
  "stopsWhenHit": false,
  "blinds": false,
  "...": "+11 more keys"
}
```

### `LEAbilities.entityList`

- **Location:** `LEAbilities.entityList` (file: planner)
- **Keying:** object keyed by 100000+n
- **Record count:** 96
- **Key space:** 96 keys, numeric 100000..100095
- **Notes:** Minion/summon actor definitions.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `actor` | object | always |  | `{"data":{"id":-1710676233,"genId":"primal_wolf","nameKey"...` |  |
| `abilityList` | object(94)\|null(2) | always | values null | `{"abilities":["entity_fm8_1"]}` |  |
| `abilityMutators` | object | always |  | `{}` |  |
| `abilityRangeList` | object(92)\|null(4) | always | values null | `{"ranges":[{"minRange":0,"engageRange":0.5,"maxRange":0.9...` |  |
| `castSpeedManager` | object(89)\|null(7) | always | values null | `{"overrides":[{"ability":"entity_fm8_2","useDelay":0.4,"u...` |  |
| `timeUntilDeath` | null(95)\|number(1) | always | values 10,null | `null` |  |
| `threat` | number | always | 0.0001..16.666668 (>12 distinct) | `1` |  |
| `abilityOnDeath` | null(92)\|object(4) | always | values null | `null` |  |
| `retaliateWhenParentHit` | null(93)\|object(3) | always | values null | `null` |  |
| `id` | number | always | 100000..100095 (>12 distinct) | `100000` | Record identifier (type depends on collection; see ids.md). |
| `retaliateWhenParentHit.type` | string | 3/96 (3.1%) | values "RetaliateWhenParentHit" | `"RetaliateWhenParentHit"` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `retaliateWhenParentHit.ability` | string | 3/96 (3.1%) | values "entity_bn2nv_26","entity_fn10_35","bn2nv" | `"entity_bn2nv_26"` |  |
| `retaliateWhenParentHit.healthRelativity` | number | 3/96 (3.1%) | values 0 | `0` |  |
| `retaliateWhenParentHit.sourceOfAbility` | number | 3/96 (3.1%) | values 1 | `1` |  |
| `retaliateWhenParentHit.damageTakenTrigger` | number | 3/96 (3.1%) | values 1 | `1` |  |
| `retaliateWhenParentHit.damageTakenSinceTrigger` | number | 3/96 (3.1%) | values 0 | `0` |  |
| `retaliateWhenParentHit.limitRetaliations` | boolean | 3/96 (3.1%) | values false | `false` |  |
| `retaliateWhenParentHit.retaliationsRemaining` | number | 3/96 (3.1%) | values 1 | `1` |  |
| `retaliateWhenParentHit.destroyAfterLastRetaliation` | boolean | 3/96 (3.1%) | values false | `false` |  |
| `retaliateWhenParentHit.onlyCountHitDamage` | boolean | 3/96 (3.1%) | values true,false | `true` |  |
| `retaliateWhenParentHit.countsOverkillDamage` | boolean | 3/96 (3.1%) | values false | `false` |  |
| `retaliateWhenParentHit.chanceBasedRetaliation` | boolean | 3/96 (3.1%) | values true | `true` |  |
| `retaliateWhenParentHit.retaliationChance` | number | 3/96 (3.1%) | values 0.15,0.3 | `0.15` |  |
| `retaliateWhenParentHit.chanceModifierForAllies` | number | 3/96 (3.1%) | values 0 | `0` |  |
| `retaliateWhenParentHit.cooldown` | number | 3/96 (3.1%) | values 0,2 | `0` |  |
| `abilityOnDeath.type` | string | 4/96 (4.2%) | values "UseAbilityOnActorDeath" | `"UseAbilityOnActorDeath"` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `abilityOnDeath.ability` | string | 4/96 (4.2%) | values "entity_ln24_41","entity_52","entity_59","entity_61" | `"entity_ln24_41"` |  |
| `abilityOnDeath.chance` | number | 4/96 (4.2%) | values 1 | `1` | Chance (0..1). |
| `abilityOnDeath.delay` | number | 4/96 (4.2%) | values 0 | `0` |  |

Example (key `100001`, record #1, trimmed):

```json
{
  "actor": {
    "data": {"id": -1929825805, "genId": "poisonous_vine", "nameKey": "Actors.Actor_Name_Poisonous Vine"},
    "health": {
      "maxHealth": 50,
      "currentHealth": 50,
      "damageable": true,
      "canDie": true,
      "baseHealthRegenPerSecond": 0,
      "addedHealthRegenPerSecond": 0,
      "effectiveHealthModifier": 0,
      "startingHealthPercentage": 1
    },
    "mana": null,
    "protection": {
      "fixedDamageReduction": 0,
      "armour": 0,
      "wardRetention": 0,
      "wardRegen": 0,
      "wardRegenFromStats": 0,
      "dodgeRating": 0,
      "blockChance": 0,
      "blockProtection": 0,
      "stunAvoidance": 0,
      "increasedChanceToBeStunned": 0,
      "glancingBlowChance": 0,
      "manaBeforeHealthPercent": 0,
      "critAvoidance": 0,
      "moreDamageTakenFromNearbyEnemies": 0,
      "blockChanceAgainstDistantEnemies": 0,
      "overkillLeech": 0,
      "chanceToGain30WardWhenHit": 0,
      "chillRetaliationChance": 0,
      "slowRetaliationChance": 0,
      "increasedChillDuration": 0,
      "increasedSlowDuration": 0,
      "thorns": 0,
      "percentReflect": 0,
      "shockRetaliationChance": 0,
      "increasedShockDuration": 0,
      "increasedShockEffect": 0,
      "noWardGain": false,
      "canBeUnableToBlock": false
    },
    "stats": {
      "level": 1,
      "stats": [
        {
          "property": 12,
          "specialTag": 0,
          "tags": 0,
          "addedValue": 200,
          "increasedValue": 0,
          "moreValues": []
        },
        {"property": 17, "specialTag": 0, "tags": 0, "addedValue": 2, "increasedValue": 0, "moreValues": []},
        "...(+3 more)"
      ]
    }
  },
  "abilityList": {"abilities": ["entity_fm8_3"]},
  "abilityMutators": {},
  "abilityRangeList": {
    "ranges": [
      {"minRange": 0, "engageRange": 1.8, "maxRange": 2, "persuitRange": 3}
    ]
  },
  "castSpeedManager": {
    "overrides": [
      {"ability": "entity_tb47_4", "useDelay": 0.5, "useDuration": 1.1, "as": 1.0000023},
      {"ability": "entity_fm8_3", "useDelay": 0.4, "useDuration": 0.7, "as": 1.5714321}
    ]
  },
  "timeUntilDeath": null,
  "threat": 0.33333334,
  "abilityOnDeath": null,
  "retaliateWhenParentHit": null,
  "id": 100001
}
```

### `LEAbilities.allAbilityIdList`

- **Location:** `LEAbilities.allAbilityIdList` (file: planner)
- **Keying:** array of ability id strings (index 0 = null)
- **Record count:** 994

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `id` | null(4)\|string(990) | always | >12 distinct | `null` | Record identifier (type depends on collection; see ids.md). |

Example (record #2, trimmed):

```json
{"id": "ability_gen1"}
```

### `LEAbilities.playerAbilityIdList`

- **Location:** `LEAbilities.playerAbilityIdList` (file: planner)
- **Keying:** array of ability id strings
- **Record count:** 183 (182 distinct; `vm53dx` appears twice)

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `id` | string | always | >12 distinct | `"ba1"` | Record identifier (type depends on collection; see ids.md). |

Example (record #21, trimmed):

```json
{"id": "be36ar"}
```

### `LESkillTrees`

- **Location:** `LESkillTrees` (file: planner)
- **Keying:** object keyed by treeID (= player ability id, e.g. "fi9")
- **Record count:** 136
- **Key space:** 136 keys, e.g. `av75ch`, `wb8fo`, `eq5s`, `er6no`
- **Notes:** One tree per player skill (nodes shown separately).

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `version` | number | always | values 0,1,2,3,4,5,7,8 | `2` | Tree data version. |
| `treeID` | string | always | >12 distinct | `"av75ch"` | Tree id. |
| `ability` | string | always | >12 distinct | `"av75ch"` |  |

Example (key `av75ch`, record #0, trimmed):

```json
{"version": 2, "treeID": "av75ch", "ability": "av75ch"}
```

### `LESkillTrees[*].nodes`

- **Location:** `LESkillTrees.<treeID>.nodes.<nodeId>` (file: planner)
- **Keying:** object keyed by nodeId
- **Record count:** 3956
- **Notes:** Flattened across all skill trees.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `id` | number | always | 0..37 (>12 distinct) | `0` | Record identifier (type depends on collection; see ids.md). |
| `maxPoints` | number | always | values 0,1,2,3,4,5,6,7,8 | `0` | Maximum points in the node (0 = free/root). |
| `mastery` | number | always | values 0 | `0` | Mastery gate (0 base class, 1..3 mastery; see enums.md). |
| `masteryRequirement` | number | always | values 0 | `0` | Points that must be spent in the class tree before the node unlocks (class trees: multiples of 5 up to 45; always 0 in ability and weaver trees). |
| `nodeNameKey` | string | always | >12 distinct | `"Skills.Skill_av75ch_0_Name"` |  |
| `descriptionKey` | null(110)\|string(3846) | always | >12 distinct | `null` | i18n key for the description. |
| `stats` | array | always | len 0..6 | `[]` | Stat lines. |
| `altTextKey` | null(3218)\|string(738) | always | >12 distinct | `null` | i18n key for the alt (secondary) tooltip text. |
| `loreTextKey` | string(86)\|null(3870) | always | >12 distinct | `"Skills.Skill_av75ch_0_LoreText"` | i18n key for lore text. |
| `requirements` | array | always | len 0..4 | `[]` | Prerequisites: [{nodeId, requirement}] (see enums.md). |
| `noScalingType` | boolean | always | values false | `false` | No-scaling type. |
| `noScalingPointThreshold` | number | always | values 0 | `0` | No-scaling point threshold. |
| `pointBonusDescriptionKey` | null | always | values null | `null` | i18n key. |
| `baseLockNode` | boolean | always | values false | `false` | Lock node base flag. |
| `lockNode` | boolean | always | values false | `false` | Lock node flag. |
| `relatedAbilities` | array | always | len 0..9 | `[]` | Related ability ids (tooltip links). |
| `relatedAilments` | array | always | len 0..11 | `[]` | Related ailment ids. |
| `triggeredAbilities` | object | always |  | `{}` | Triggered abilities {id:1}. |
| `triggeredAilments` | object | always |  | `{}` | Triggered ailments {ailmentId:stacks}. |
| `stats[]` | object | 6528 occurrences |  | `{"statNameKey":"Skills.Skill_av75ch_2_0_Stat","value":nul...` | Stat lines. |
| `stats[].statNameKey` | string | 6528 occurrences | >12 distinct | `"Skills.Skill_av75ch_2_0_Stat"` | i18n key of the stat label. |
| `stats[].value` | null(1335)\|string(5193) | 6528 occurrences | >12 distinct | `null` | Stat value (number) or roll min for unique mods / display string on tree nodes. |
| `stats[].noScaling` | boolean | 6528 occurrences | values false,true | `false` | Stat does not scale with points. |
| `stats[].downside` | boolean | 6528 occurrences | values false,true | `false` | Stat is a downside (red). |
| `stats[].sprite` | string(6527)\|null(1) | 6528 occurrences | >12 distinct | `"a-r-553"` | Sprite id (LE Tools) or md5 hash (Maxroll). |
| `stats[].property` | number | 6528 occurrences | 0..25206 (>12 distinct) | `5009` | Stat property id (SP enum, see enums.md). |
| `stats[].tags` | number | 6528 occurrences | 0..4104 (>12 distinct) | `0` | Tag bit mask (AT enum, see enums.md). |
| `stats[].overrideSprite` | boolean | 6528 occurrences | values false,true | `false` | Uses custom sprite. |
| `requirements[]` | object | 4577 occurrences |  | `{"nodeId":0,"requirement":0}` | Prerequisites: [{nodeId, requirement}] (see enums.md). |
| `requirements[].nodeId` | number | 4577 occurrences | 0..37 (>12 distinct) | `0` | Node id within the tree. |
| `requirements[].requirement` | number | 4577 occurrences | values 0,1,2,3,4,5 | `0` | Points that must be allocated in node nodeId before this node unlocks (0 = plain link; 1..5; see enums.md). |
| `relatedAbilities[]` | string | 1510 occurrences | >12 distinct | `"eq5s"` | Related ability ids (tooltip links). |
| `relatedAilments[]` | number | 1265 occurrences | 1..144 (>12 distinct) | `37` | Related ailment ids. |

Example (record #1, trimmed):

```json
{
  "id": 2,
  "maxPoints": 1,
  "mastery": 0,
  "masteryRequirement": 0,
  "nodeNameKey": "Skills.Skill_av75ch_2_Name",
  "descriptionKey": "Skills.Skill_av75ch_2_Description",
  "stats": [
    {
      "statNameKey": "Skills.Skill_av75ch_2_0_Stat",
      "value": null,
      "noScaling": false,
      "downside": false,
      "sprite": "a-r-553",
      "property": 5009,
      "tags": 0,
      "overrideSprite": false
    },
    {
      "statNameKey": "Skills.Skill_av75ch_2_1_Stat",
      "value": "24",
      "noScaling": false,
      "downside": true,
      "sprite": "a-r-547",
      "property": 66,
      "tags": 0,
      "overrideSprite": false
    }
  ],
  "altTextKey": null,
  "loreTextKey": null,
  "requirements": [
    {"nodeId": 0, "requirement": 0}
  ],
  "noScalingType": false,
  "noScalingPointThreshold": 0,
  "pointBonusDescriptionKey": null,
  "baseLockNode": false,
  "lockNode": false,
  "relatedAbilities": [],
  "relatedAilments": [],
  "triggeredAbilities": {},
  "triggeredAilments": {}
}
```

### `skillTree.node.stats[]`

- **Location:** `...nodes.<id>.stats[]` (file: planner)
- **Keying:** array
- **Record count:** 6528

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `statNameKey` | string | always | >12 distinct | `"Skills.Skill_av75ch_2_0_Stat"` | i18n key of the stat label. |
| `value` | null(1335)\|string(5193) | always | >12 distinct | `null` | Stat value (number) or roll min for unique mods / display string on tree nodes. |
| `noScaling` | boolean | always | values false,true | `false` | Stat does not scale with points. |
| `downside` | boolean | always | values false,true | `false` | Stat is a downside (red). |
| `sprite` | string(6527)\|null(1) | always | >12 distinct | `"a-r-553"` | Sprite id (LE Tools) or md5 hash (Maxroll). |
| `property` | number | always | 0..25206 (>12 distinct) | `5009` | Stat property id (SP enum, see enums.md). |
| `tags` | number | always | 0..4104 (>12 distinct) | `0` | Tag bit mask (AT enum, see enums.md). |
| `overrideSprite` | boolean | always | values false,true | `false` | Uses custom sprite. |

Example (record #0, trimmed):

```json
{
  "statNameKey": "Skills.Skill_av75ch_2_0_Stat",
  "value": null,
  "noScaling": false,
  "downside": false,
  "sprite": "a-r-553",
  "property": 5009,
  "tags": 0,
  "overrideSprite": false
}
```

### `skillTree.node.requirements[]`

- **Location:** `...nodes.<id>.requirements[]` (file: planner)
- **Keying:** array
- **Record count:** 4577

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `nodeId` | number | always | 0..37 (>12 distinct) | `0` | Node id within the tree. |
| `requirement` | number | always | values 0,1,2,3,4,5 | `0` | Points that must be allocated in node nodeId before this node unlocks (0 = plain link; 1..5; see enums.md). |

Example (record #11, trimmed):

```json
{"nodeId": 12, "requirement": 2}
```

### `LESkillTrees[*].ability`

- **Location:** `LESkillTrees.<treeID>.ability` (file: planner)
- **Keying:** object (ability summary copy)
- **Record count:** 136

_Scalar records._ Example: `["av75ch","wb8fo","eq5s"]`

### `LESkillTreesUI`

- **Location:** `LESkillTreesUI` (file: planner)
- **Keying:** object keyed by treeID
- **Record count:** 136
- **Key space:** 136 keys, e.g. `av75ch`, `wb8fo`, `eq5s`, `er6no`
- **Notes:** UI container per tree.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `name` | string | always | values "Tree" | `"Tree"` | Internal / English name. |
| `rect` | array | always | len 4..4 | `[0,0,0,-180.00012]` | [x, y, w, h] layout rectangle in tree canvas pixels. |
| `rect[]` | number | 544 occurrences | values -180.00012,-180,-6,0,120.00001 | `0` | [x, y, w, h] layout rectangle in tree canvas pixels. |
| `order` | number | always | values 0 | `0` | Z order. |
| `inactive` | boolean | always | values true | `true` | Container inactive. |

Example (key `av75ch`, record #0, trimmed):

```json
{"name": "Tree", "rect": [0,0,"...(+2 more)"], "order": 0, "inactive": true}
```

### `LESkillTreesUI[*].children[]`

- **Location:** `LESkillTreesUI.<treeID>.children[]` (file: planner)
- **Keying:** array
- **Record count:** 3956
- **Notes:** Node layout: rect=[x,y,w,h].

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `rect` | array | always | len 4..4 | `[0,0,84,84]` | [x, y, w, h] layout rectangle in tree canvas pixels. |
| `rect[]` | number | 15824 occurrences | -823.56..822.48 (>12 distinct) | `0` | [x, y, w, h] layout rectangle in tree canvas pixels. |
| `icon` | string | always | >12 distinct | `"a-r-272"` | Icon sprite/hash. |
| `nodeSize` | number | always | values 0,1,2 | `0` | Node size class. |
| `treeId` | string | always | >12 distinct | `"av75ch"` | Tree id. |
| `nodeId` | number | always | 0..37 (>12 distinct) | `0` | Node id within the tree. |

Example (record #1, trimmed):

```json
{
  "rect": [-238.8, 75.84002, "...(+2 more)"],
  "icon": "a-r-149",
  "nodeSize": 2,
  "treeId": "av75ch",
  "nodeId": 2
}
```

### `LECharTrees.trees[*].characterTree`

- **Location:** `LECharTrees.trees[].characterTree` (file: planner)
- **Keying:** array of 5 {ref, characterTree}; index = classID
- **Record count:** 5
- **Notes:** Header of each class passive tree (nodes shown separately).

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `version` | number | always | values 0,3,7,12 | `12` | Tree data version. |
| `treeID` | string | always | values "pr-1","mg-1","kn-1","ac-1","rg-1" | `"pr-1"` | Tree id. |
| `thirdMasteryUnlocked` | boolean | always | values true | `true` | Third mastery unlock flag. |
| `characterClass` | object | always |  | `{"classNameKey":"Common.Class_Primalist","baseClassIcon":...` |  |
| `characterClass.classNameKey` | string | always | values "Common.Class_Primalist","Common.Class_Mage","Common.Class_Sentinel","Common.Class_Acolyte","Common.Class_Rogue" | `"Common.Class_Primalist"` |  |
| `characterClass.baseClassIcon` | string | always | values "a-r-657","a-r-667","a-r-677","a-r-687","a-r-697" | `"a-r-657"` |  |
| `characterClass.baseClassIconLarge` | string | always | values "a-r-658","a-r-668","a-r-678","a-r-688","a-r-698" | `"a-r-658"` |  |
| `characterClass.classID` | number | always | values 0,1,2,3,4 | `0` | Class id 0..4. |
| `characterClass.treeID` | string | always | values "pr-1","mg-1","kn-1","ac-1","rg-1" | `"pr-1"` | Tree id. |
| `characterClass.baseHealth` | number | always | values 100 | `100` | Base health. |
| `characterClass.baseMana` | number | always | values 50 | `50` | Base mana. |
| `characterClass.healthPerLevel` | number | always | values 10 | `10` | Health per level. |
| `characterClass.manaPerLevel` | number | always | values 0.50506 | `0.50506` | Mana per level. |
| `characterClass.healthRegen` | number | always | values 6 | `6` | Base health regen. |
| `characterClass.manaRegen` | number | always | values 8 | `8` | Base mana regen. |
| `characterClass.healthRegenPerLevel` | number | always | values 0.14 | `0.14` | Health regen per level. |
| `characterClass.baseIntelligence` | number | always | values 0,2,3 | `0` | Base Intelligence. |
| `characterClass.baseStrength` | number | always | values 0,2 | `2` | Base Strength. |
| `characterClass.baseDexterity` | number | always | values 0,3 | `0` | Base Dexterity. |
| `characterClass.baseAttunement` | number | always | values 0,1 | `1` | Base Attunement. |
| `characterClass.baseVitality` | number | always | values 0,1 | `0` | Base Vitality. |
| `characterClass.firstLevelForMinionScaling` | number | always | values 26 | `26` |  |
| `characterClass.moreMinionDamagePerLevel` | number | always | values 0.008 | `0.008` |  |
| `characterClass.lessMinionDamageTakenPerLevel` | number | always | values 0.008 | `0.008` |  |
| `characterClass.baseStunAvoidance` | number | always | values 250 | `250` | Base stun avoidance. |
| `characterClass.baseEndurance` | number | always | values 0.2 | `0.2` | Base endurance. |
| `characterClass.baseEnduranceThreshold` | number | always | values 0 | `0` |  |
| `characterClass.enduranceThresholdPerLevel` | number | always | values 0 | `0` |  |
| `characterClass.basicAttackReplacer` | string | always | values "sw43","ms26","sndr1","ha84","pun22" | `"sw43"` | Basic attack replacement. |
| `characterClass.defaultAbilities` | array | always | len 6..6 | `["wo42","na28","na28","na28","ba1","evade3"]` | Default ability bar. |
| `characterClass.defaultAbilities[]` | string | 30 occurrences | values "wo42","na28","ba1","evade3","lb23il","evade2","gs15de","evade5","rb31pl","evade1","flur3","evade4" | `"wo42"` | Default ability bar. |
| `characterClass.knownAbilities` | array | always | len 2..2 | `["ba1","wo42"]` | Abilities known at level 1. |
| `characterClass.knownAbilities[]` | string | 10 occurrences | values "ba1","wo42","lb23il","gs15de","rb31pl","flur3" | `"ba1"` | Abilities known at level 1. |
| `characterClass.unlockableAbilities` | array | always | len 7..8 | `[{"ability":"ga2st","level":2},{"ability":"fl13","level":...` | [{ability, level}] unlocks. |
| `characterClass.unlockableAbilities[]` | object | 36 occurrences |  | `{"ability":"ga2st","level":2}` | [{ability, level}] unlocks. |
| `characterClass.masteries` | array | always | len 4..4 | `[{"name":"Primalist","nameKey":"Common.Mastery_Primalist"...` | Mastery definitions. |
| `characterClass.masteries[]` | object | 20 occurrences |  | `{"name":"Primalist","nameKey":"Common.Mastery_Primalist",...` | Mastery definitions. |
| `characterClass.startingItems` | array | always | len 4..5 | `[{"baseType":5,"subtype":0},{"baseType":1,"subtype":24},{...` |  |
| `characterClass.startingItems[]` | object | 21 occurrences |  | `{"baseType":5,"subtype":0}` |  |
| `characterClass.allIcons` | object | always |  | `{"0":"a-r-659","1":"a-r-661","2":"a-r-663","3":"a-r-665"}` |  |
| `characterClass.allIcons.<key>` | string | 20 occurrences | >12 distinct | `"a-r-659"` |  |
| `unspentPointsText` | string | always | values "114256069497284392" | `"114256069497284392"` |  |
| `masteries` | array | always | len 0..0 | `[]` | Mastery definitions. |
| `masteryButtons` | array | always | len 0..0 | `[]` |  |
| `masteryBars` | array | always | len 0..0 | `[]` |  |

Example (record #1, trimmed):

```json
{
  "version": 7,
  "treeID": "mg-1",
  "thirdMasteryUnlocked": true,
  "characterClass": {
    "classNameKey": "Common.Class_Mage",
    "baseClassIcon": "a-r-667",
    "baseClassIconLarge": "a-r-668",
    "classID": 1,
    "treeID": "mg-1",
    "baseHealth": 100,
    "baseMana": 50,
    "healthPerLevel": 10,
    "manaPerLevel": 0.50506,
    "healthRegen": 6,
    "manaRegen": 8,
    "healthRegenPerLevel": 0.14,
    "baseIntelligence": 3,
    "baseStrength": 0,
    "baseDexterity": 0,
    "baseAttunement": 0,
    "baseVitality": 0,
    "firstLevelForMinionScaling": 26,
    "moreMinionDamagePerLevel": 0.008,
    "lessMinionDamageTakenPerLevel": 0.008,
    "baseStunAvoidance": 250,
    "baseEndurance": 0.2,
    "baseEnduranceThreshold": 0,
    "enduranceThresholdPerLevel": 0,
    "basicAttackReplacer": "ms26",
    "defaultAbilities": ["lb23il", "na28", "...(+4 more)"],
    "knownAbilities": ["ba1", "lb23il"],
    "unlockableAbilities": [
      {"ability": "fi9", "level": 2},
      {"ability": "sw31a", "level": 3},
      "...(+6 more)"
    ],
    "masteries": [
      {
        "name": "Mage",
        "nameKey": "Common.Mastery_Mage",
        "icon": "a-r-669",
        "iconLarge": "a-r-670",
        "masteryAbility": "",
        "abilities": ["{...}", "{...}", "...(+2 more)"]
      },
      {
        "name": "Sorcerer",
        "nameKey": "Common.Mastery_Sorcerer",
        "icon": "a-r-671",
        "iconLarge": "a-r-672",
        "masteryAbility": "me27",
        "abilities": ["{...}", "{...}", "...(+2 more)"]
      },
      "...(+2 more)"
    ],
    "startingItems": [
      {"baseType": 8, "subtype": 0},
      {"baseType": 1, "subtype": 16},
      "...(+2 more)"
    ],
    "allIcons": {"0": "a-r-669", "1": "a-r-671", "2": "a-r-673", "3": "a-r-675"}
  },
  "unspentPointsText": "114256069497284392",
  "masteries": [],
  "masteryButtons": [],
  "masteryBars": []
}
```

### `LECharTrees...nodes`

- **Location:** `LECharTrees.trees[].characterTree.nodes.<id>` (file: planner)
- **Keying:** object keyed by nodeId
- **Record count:** 541
- **Notes:** Class passive tree nodes (flattened over 5 classes).

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `id` | number | always | 0..120 (>12 distinct) | `0` | Record identifier (type depends on collection; see ids.md). |
| `maxPoints` | number | always | values 1,2,3,4,5,6,7,8,10,12 | `8` | Maximum points in the node (0 = free/root). |
| `mastery` | number | always | values 0,1,2,3 | `0` | Mastery gate (0 base class, 1..3 mastery; see enums.md). |
| `masteryRequirement` | number | always | values 0,5,10,15,20,25,30,35,40,45 | `0` | Points that must be spent in the class tree before the node unlocks (class trees: multiples of 5 up to 45; always 0 in ability and weaver trees). |
| `nodeNameKey` | string | always | >12 distinct | `"Skills.Skill_pr-1_0_Name"` |  |
| `descriptionKey` | null(208)\|string(333) | always | >12 distinct | `null` | i18n key for the description. |
| `stats` | array | always | len 1..7 | `[{"statNameKey":"Skills.Skill_pr-1_0_0_Stat","value":"+1"...` | Stat lines. |
| `stats[]` | object | 1440 occurrences |  | `{"statNameKey":"Skills.Skill_pr-1_0_0_Stat","value":"+1",...` | Stat lines. |
| `stats[].statNameKey` | string | 1440 occurrences | >12 distinct | `"Skills.Skill_pr-1_0_0_Stat"` | i18n key of the stat label. |
| `stats[].value` | string(1353)\|null(87) | 1440 occurrences | >12 distinct | `"+1"` | Stat value (number) or roll min for unique mods / display string on tree nodes. |
| `stats[].noScaling` | boolean | 1440 occurrences | values false,true | `false` | Stat does not scale with points. |
| `stats[].downside` | boolean | 1440 occurrences | values false,true | `false` | Stat is a downside (red). |
| `stats[].sprite` | string | 1440 occurrences | >12 distinct | `"a-r-586"` | Sprite id (LE Tools) or md5 hash (Maxroll). |
| `stats[].property` | number | 1440 occurrences | 0..25203 (>12 distinct) | `19` | Stat property id (SP enum, see enums.md). |
| `stats[].tags` | number | 1440 occurrences | 0..1048576 (>12 distinct) | `0` | Tag bit mask (AT enum, see enums.md). |
| `stats[].overrideSprite` | boolean | 1440 occurrences | values false,true | `false` | Uses custom sprite. |
| `altTextKey` | string(129)\|null(412) | always | >12 distinct | `"Skills.Skill_pr-1_0_AltText"` | i18n key for the alt (secondary) tooltip text. |
| `loreTextKey` | null | always | values null | `null` | i18n key for lore text. |
| `requirements` | array | always | len 0..3 | `[]` | Prerequisites: [{nodeId, requirement}] (see enums.md). |
| `noScalingType` | boolean | always | values false,true | `false` | No-scaling type. |
| `noScalingPointThreshold` | number | always | values 0,2,3,4,5,6,7,8 | `0` | No-scaling point threshold. |
| `pointBonusDescriptionKey` | null(362)\|string(179) | always | >12 distinct | `null` | i18n key. |
| `baseLockNode` | boolean | always | values false | `false` | Lock node base flag. |
| `lockNode` | boolean | always | values false | `false` | Lock node flag. |
| `relatedAbilities` | array | always | len 0..4 | `[]` | Related ability ids (tooltip links). |
| `relatedAilments` | array | always | len 0..4 | `[]` | Related ailment ids. |
| `triggeredAbilities` | object | always |  | `{}` | Triggered abilities {id:1}. |
| `triggeredAilments` | object | always |  | `{}` | Triggered ailments {ailmentId:stacks}. |
| `requirements[]` | object | 196 occurrences |  | `{"nodeId":0,"requirement":1}` | Prerequisites: [{nodeId, requirement}] (see enums.md). |
| `requirements[].nodeId` | number | 196 occurrences | 0..119 (>12 distinct) | `0` | Node id within the tree. |
| `requirements[].requirement` | number | 196 occurrences | values 1,2,3,4,5 | `1` | Points that must be allocated in node nodeId before this node unlocks (0 = plain link; 1..5; see enums.md). |
| `relatedAilments[]` | number | 181 occurrences | 1..123 (>12 distinct) | `2` | Related ailment ids. |
| `triggeredAilments.<key>` | number | 131 occurrences | values 1,2,4,5,9 | `1` |  |
| `relatedAbilities[]` | string | 121 occurrences | >12 distinct | `"fl13"` | Related ability ids (tooltip links). |
| `triggeredAbilities.mas54` | number | 1/541 (0.2%) | values 1 | `1` |  |
| `triggeredAbilities.ability_gen10` | number | 3/541 (0.6%) | values 1 | `1` |  |
| `triggeredAbilities.eb5656` | number | 1/541 (0.2%) | values 1 | `1` |  |
| `triggeredAbilities.ability_gen11` | number | 1/541 (0.2%) | values 1 | `1` |  |
| `triggeredAbilities.ability_gen209` | number | 1/541 (0.2%) | values 1 | `1` |  |
| `triggeredAbilities.sbf4m_sh1v3_2` | number | 1/541 (0.2%) | values 5 | `5` |  |
| `triggeredAbilities.ability_gen18` | number | 1/541 (0.2%) | values 1 | `1` |  |
| `triggeredAbilities.lb23il` | number | 1/541 (0.2%) | values 1 | `1` |  |
| `triggeredAbilities.ability_gen98` | number | 2/541 (0.4%) | values 1 | `1` |  |
| `triggeredAbilities.frc87w` | number | 1/541 (0.2%) | values 1 | `1` |  |
| `triggeredAbilities.cg5_sl33_1` | number | 1/541 (0.2%) | values 1 | `1` |  |
| `triggeredAbilities.ability_gen105` | number | 1/541 (0.2%) | values 1 | `1` |  |
| `triggeredAbilities.ability_gen59` | number | 1/541 (0.2%) | values 1 | `1` |  |
| `triggeredAbilities.rs31hi` | number | 1/541 (0.2%) | values 1 | `1` |  |
| `triggeredAbilities.ability_gen104` | number | 1/541 (0.2%) | values 1 | `1` |  |
| `triggeredAbilities.ability_gen122` | number | 1/541 (0.2%) | values 1 | `1` |  |
| `triggeredAbilities.ability_gen121` | number | 1/541 (0.2%) | values 1 | `1` |  |
| `triggeredAbilities.ability_gen88` | number | 1/541 (0.2%) | values 1 | `1` |  |
| `triggeredAbilities.ability_gen212` | number | 2/541 (0.4%) | values 1 | `1` |  |
| `triggeredAbilities.rb31pl` | number | 2/541 (0.4%) | values 1 | `1` |  |
| `triggeredAbilities.ability_gen402` | number | 1/541 (0.2%) | values 1 | `1` |  |
| `triggeredAbilities.ability_gen403` | number | 2/541 (0.4%) | values 1 | `1` |  |

Example (record #1, trimmed):

```json
{
  "id": 1,
  "maxPoints": 8,
  "mastery": 0,
  "masteryRequirement": 0,
  "nodeNameKey": "Skills.Skill_pr-1_1_Name",
  "descriptionKey": null,
  "stats": [
    {
      "statNameKey": "Skills.Skill_pr-1_1_0_Stat",
      "value": "+1",
      "noScaling": false,
      "downside": false,
      "sprite": "a-r-257",
      "property": 23,
      "tags": 0,
      "overrideSprite": false
    },
    {
      "statNameKey": "Skills.Skill_pr-1_1_1_Stat",
      "value": "+3%",
      "noScaling": false,
      "downside": false,
      "sprite": "a-r-595",
      "property": 15,
      "tags": 0,
      "overrideSprite": false
    },
    "...(+1 more)"
  ],
  "altTextKey": "Skills.Skill_pr-1_1_AltText",
  "loreTextKey": null,
  "requirements": [],
  "noScalingType": false,
  "noScalingPointThreshold": 0,
  "pointBonusDescriptionKey": null,
  "baseLockNode": false,
  "lockNode": false,
  "relatedAbilities": [],
  "relatedAilments": [],
  "triggeredAbilities": {},
  "triggeredAilments": {}
}
```

### `LECharTreesUI[*].nodes[*].children`

- **Location:** `LECharTreesUI.<treeID>.nodes[].children[]` (file: planner)
- **Keying:** array
- **Record count:** 541

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `rect` | array | always | len 4..4 | `[-533.74,-184.56003,62.52,79.68001]` | [x, y, w, h] layout rectangle in tree canvas pixels. |
| `rect[]` | number | 2164 occurrences | -533.74..520.74 (>12 distinct) | `-533.74` | [x, y, w, h] layout rectangle in tree canvas pixels. |
| `icon` | string | always | >12 distinct | `"a-r-300"` | Icon sprite/hash. |
| `nodeSize` | number | always | values 2 | `2` | Node size class. |
| `treeId` | string | always | values "pr-1","mg-1","kn-1","ac-1","rg-1" | `"pr-1"` | Tree id. |
| `nodeId` | number | always | 0..120 (>12 distinct) | `0` | Node id within the tree. |

Example (record #0, trimmed):

```json
{
  "rect": [-533.74, -184.56003, "...(+2 more)"],
  "icon": "a-r-300",
  "nodeSize": 2,
  "treeId": "pr-1",
  "nodeId": 0
}
```

### `LEWeaverTree.nodes`

- **Location:** `LEWeaverTree.nodes` (file: planner)
- **Keying:** object keyed by nodeId
- **Record count:** 80
- **Key space:** 80 keys, numeric 0..191

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `id` | number | always | 0..191 (>12 distinct) | `0` | Record identifier (type depends on collection; see ids.md). |
| `maxPoints` | number | always | values 0,1,2,3,4,5 | `0` | Maximum points in the node (0 = free/root). |
| `mastery` | number | always | values 0 | `0` | Mastery gate (0 base class, 1..3 mastery; see enums.md). |
| `masteryRequirement` | number | always | values 0 | `0` | Points that must be spent in the class tree before the node unlocks (class trees: multiples of 5 up to 45; always 0 in ability and weaver trees). |
| `nodeNameKey` | string | always | >12 distinct | `"Skills.Skill_weaver_0_Name"` |  |
| `descriptionKey` | string | always | >12 distinct | `"Skills.Skill_weaver_0_Description"` | i18n key for the description. |
| `stats` | array | always | len 0..3 | `[]` | Stat lines. |
| `altTextKey` | null(29)\|string(51) | always | >12 distinct | `null` | i18n key for the alt (secondary) tooltip text. |
| `loreTextKey` | null | always | values null | `null` | i18n key for lore text. |
| `requirements` | array | always | len 0..5 | `[]` | Prerequisites: [{nodeId, requirement}] (see enums.md). |
| `noScalingType` | boolean | always | values false | `false` | No-scaling type. |
| `noScalingPointThreshold` | number | always | values 0 | `0` | No-scaling point threshold. |
| `pointBonusDescriptionKey` | null | always | values null | `null` | i18n key. |
| `baseLockNode` | boolean | always | values false | `false` | Lock node base flag. |
| `lockNode` | boolean | always | values false | `false` | Lock node flag. |
| `relatedAbilities` | array | always | len 0..0 | `[]` | Related ability ids (tooltip links). |
| `relatedAilments` | array | always | len 0..0 | `[]` | Related ailment ids. |
| `triggeredAbilities` | object | always |  | `{}` | Triggered abilities {id:1}. |
| `triggeredAilments` | object | always |  | `{}` | Triggered ailments {ailmentId:stacks}. |
| `requirements[]` | object | 155 occurrences |  | `{"nodeId":151,"requirement":1}` | Prerequisites: [{nodeId, requirement}] (see enums.md). |
| `requirements[].nodeId` | number | 155 occurrences | 0..191 (>12 distinct) | `151` | Node id within the tree. |
| `requirements[].requirement` | number | 155 occurrences | values 0,1 | `1` | Points that must be allocated in node nodeId before this node unlocks (0 = plain link; 1..5; see enums.md). |
| `stats[]` | object | 70 occurrences |  | `{"statNameKey":"Skills.Skill_weaver_6_0_Stat","value":"80...` | Stat lines. |
| `stats[].statNameKey` | string | 70 occurrences | >12 distinct | `"Skills.Skill_weaver_6_0_Stat"` | i18n key of the stat label. |
| `stats[].value` | string(67)\|null(3) | 70 occurrences | >12 distinct | `"80%"` | Stat value (number) or roll min for unique mods / display string on tree nodes. |
| `stats[].noScaling` | boolean | 70 occurrences | values false | `false` | Stat does not scale with points. |
| `stats[].downside` | boolean | 70 occurrences | values false,true | `false` | Stat is a downside (red). |
| `stats[].sprite` | string | 70 occurrences | >12 distinct | `"a-r-867"` | Sprite id (LE Tools) or md5 hash (Maxroll). |
| `stats[].property` | number | 70 occurrences | values 0,7,54,181,183 | `54` | Stat property id (SP enum, see enums.md). |
| `stats[].tags` | number | 70 occurrences | values 0 | `0` | Tag bit mask (AT enum, see enums.md). |
| `stats[].overrideSprite` | boolean | 70 occurrences | values true,false | `true` | Uses custom sprite. |

Example (key `7`, record #7, trimmed):

```json
{
  "id": 7,
  "maxPoints": 3,
  "mastery": 0,
  "masteryRequirement": 0,
  "nodeNameKey": "Skills.Skill_weaver_7_Name",
  "descriptionKey": "Skills.Skill_weaver_7_Description",
  "stats": [
    {
      "statNameKey": "Skills.Skill_weaver_7_0_Stat",
      "value": "50%",
      "noScaling": false,
      "downside": false,
      "sprite": "a-r-850",
      "property": 54,
      "tags": 0,
      "overrideSprite": true
    }
  ],
  "altTextKey": "Skills.Skill_weaver_7_AltText",
  "loreTextKey": null,
  "requirements": [
    {"nodeId": 130, "requirement": 1},
    {"nodeId": 8, "requirement": 1}
  ],
  "noScalingType": false,
  "noScalingPointThreshold": 0,
  "pointBonusDescriptionKey": null,
  "baseLockNode": false,
  "lockNode": false,
  "relatedAbilities": [],
  "relatedAilments": [],
  "triggeredAbilities": {},
  "triggeredAilments": {}
}
```

### `LEWeaverTreeUI.weaver.children`

- **Location:** `LEWeaverTreeUI.weaver.children[]` (file: planner)
- **Keying:** array
- **Record count:** 87

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `name` | string | 7/87 (8.0%) | values "Background","ItemSlot (3)","ItemSlot (2)","ItemSlotSmall","ItemSlotSmall (1)","ItemSlot (1)","ItemSlot" | `"Background"` | Internal / English name. |
| `rect` | array | always | len 4..4 | `[103.37012,45.811035,1761,951]` | [x, y, w, h] layout rectangle in tree canvas pixels. |
| `rect[]` | number | 348 occurrences | -1082.4..1761 (>12 distinct) | `103.37012` | [x, y, w, h] layout rectangle in tree canvas pixels. |
| `order` | number | 7/87 (8.0%) | values 0 | `0` | Z order. |
| `sprite` | string | 1/87 (1.1%) | values "g-r-793" | `"g-r-793"` | Sprite id (LE Tools) or md5 hash (Maxroll). |
| `spriteAlpha` | number | 1/87 (1.1%) | values 0.011764706 | `0.011764706` |  |
| `icon` | string | 80/87 (92.0%) | >12 distinct | `"a-r-96"` | Icon sprite/hash. |
| `nodeSize` | number | 80/87 (92.0%) | values 10,11 | `11` | Node size class. |
| `treeId` | string | 80/87 (92.0%) | values "weaver" | `"weaver"` | Tree id. |
| `nodeId` | number | 80/87 (92.0%) | 0..191 (>12 distinct) | `0` | Node id within the tree. |
| `children` | array | 6/87 (6.9%) | len 5..5 | `[{"name":"Border","rect":[0,0,109,174],"order":0,"childre...` | UI child elements. |
| `children[]` | object | 30 occurrences |  | `{"name":"Border","rect":[0,0,109,174],"order":0,"children...` | UI child elements. |
| `children[].name` | string | 30 occurrences | values "Border","Locked","Highlight Container","Connector","Gamepad Info" | `"Border"` | Internal / English name. |
| `children[].rect` | array | 30 occurrences | len 4..4 | `[0,0,109,174]` | [x, y, w, h] layout rectangle in tree canvas pixels. |
| `children[].order` | number | 30 occurrences | values 0 | `0` | Z order. |
| `children[].children` | array | 12 occurrences | len 1..1 | `[{"name":"BorderActive","rect":[0,0,109,174],"order":0,"s...` | UI child elements. |
| `children[].sprite` | string | 24 occurrences | values "g-r-817","h-r-819","f-r-820","g-r-822","f-r-829","h-r-831" | `"g-r-817"` | Sprite id (LE Tools) or md5 hash (Maxroll). |
| `children[].pixelsPerUnitMultiplier` | number | 6 occurrences | values 1.6666666 | `1.6666666` |  |
| `children[].inactive` | boolean | 12 occurrences | values true | `true` | Container inactive. |
| `children[].scaleX` | number | 6 occurrences | values 0.5 | `0.5` |  |
| `children[].scaleY` | number | 6 occurrences | values 0.5 | `0.5` |  |

Example (record #0, trimmed):

```json
{
  "name": "Background",
  "rect": [103.37012, 45.811035, "...(+2 more)"],
  "order": 0,
  "sprite": "g-r-793",
  "spriteAlpha": 0.011764706
}
```

### `LETooltipIcons.entries`

- **Location:** `LETooltipIcons.entries[]` (file: planner)
- **Keying:** array
- **Record count:** 328
- **Notes:** property/tags -> sprite for tooltips.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `sprite` | string | always | >12 distinct | `"a-r-538"` | Sprite id (LE Tools) or md5 hash (Maxroll). |
| `property` | number | always | 0..25206 (>12 distinct) | `29` | Stat property id (SP enum, see enums.md). |
| `tags` | number | always | 0..1048576 (>12 distinct) | `0` | Tag bit mask (AT enum, see enums.md). |

Example (record #1, trimmed):

```json
{"sprite": "a-r-350", "property": 5000, "tags": 0}
```

### `passiveBonuses`

- **Location:** `passiveBonuses.<treeID>` (file: planner)
- **Keying:** object keyed by class tree id
- **Record count:** 5
- **Key space:** 5 keys, e.g. `pr-1`, `mg-1`, `kn-1`, `ac-1`

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `stats` | object | always |  | `{"0":[{"value":1,"type":0,"property":19,"tags":0},{"value...` | Stat lines. |
| `stats.<key>` | array | 541 occurrences | len 0..11 | `[{"value":1,"type":0,"property":19,"tags":0},{"value":0.0...` |  |
| `stats.<key>[]` | object | 1398 occurrences |  | `{"value":1,"type":0,"property":19,"tags":0}` |  |
| `damageTags` | number | always | values 0 | `0` | Damage tag mask (AT). |
| `mods` | object | always |  | `{}` | Mod list. |
| `abilityMods` | object | always |  | `{}` |  |
| `buffs` | object | always |  | `{"3":[{"id":48,"mods":[{"prop":0,"value":8,"noScaling":fa...` | Buff list. |
| `buffs.<key>` | array | 64 occurrences | len 1..8 | `[{"id":48,"mods":[{"prop":0,"value":8,"noScaling":false,"...` |  |
| `buffs.<key>[]` | object | 129 occurrences |  | `{"id":48,"mods":[{"prop":0,"value":8,"noScaling":false,"p...` |  |
| `buffAbilities` | object | always |  | `{"77":["ability_gen11"]}` |  |
| `buffAbilities.<key>` | array | 2 occurrences | len 1..1 | `["ability_gen11"]` |  |
| `buffAbilities.<key>[]` | string | 2 occurrences | values "ability_gen11","ability_gen59" | `"ability_gen11"` |  |
| `masteryBuffs` | object | always |  | `{}` |  |
| `masteryBuffs.<key>` | array | 2 occurrences | len 1..2 | `[{"id":93,"mods":[]}]` |  |
| `masteryBuffs.<key>[]` | object | 3 occurrences |  | `{"id":93,"mods":[]}` |  |

Example (key `pr-1`, record #0, trimmed):

```json
{
  "stats": {
    "0": [
      {"value": 1, "type": 0, "property": 19, "tags": 0},
      {"value": 0.04, "type": 1, "property": 17, "tags": 0}
    ],
    "1": [
      {"value": 1, "type": 0, "property": 23, "tags": 0},
      {"value": 0.03, "type": 0, "property": 15, "tags": 0},
      "...(+1 more)"
    ],
    "2": [
      {"value": 10, "type": 0, "property": 7, "tags": 0},
      {"value": 0.05, "type": 1, "property": 7, "tags": 8192}
    ],
    "3": [
      {"value": 0.02, "type": 1, "property": 7, "tags": 0}
    ],
    "4": [
      {"value": 0.05, "type": 1, "property": 0, "tags": 8192},
      {"value": 50, "type": 0, "property": -1, "tags": 0}
    ],
    "5": [
      {"value": 0.05, "type": 1, "property": 0, "tags": 512},
      {"value": 0.05, "type": 0, "property": 51, "tags": 512},
      "...(+2 more)"
    ],
    "6": [
      {"value": 0.07, "type": 1, "property": 0, "tags": 256},
      {"value": 0.07, "type": 1, "property": 0, "tags": 8448}
    ],
    "7": [
      {"value": 0.04, "type": 1, "property": 0, "modConditions": ["{...}"], "tags": 1},
      {"value": 0.04, "type": 1, "property": 0, "modConditions": ["{...}"], "tags": 4},
      "...(+1 more)"
    ],
    "8": [],
    "9": [
      {"value": 10, "type": 0, "property": 7, "tags": 0},
      {"value": 0.1, "type": 1, "property": -1, "tags": 0},
      "...(+1 more)"
    ],
    "10": [
      {"value": "", "type": 0, "property": -1, "tags": 0},
      {"value": "", "type": 0, "property": -1, "tags": 0},
      "...(+3 more)"
    ],
    "12": [
      {"value": 1, "type": 0, "property": 19, "tags": 0},
      {"value": -0.02, "type": 2, "property": 110, "tags": 0}
    ],
    "13": [
      {"value": 0.07, "type": 1, "property": 0, "tags": 512},
      {"value": 0.07, "type": 1, "property": 0, "tags": 8192}
    ],
    "14": [
      {"value": 0.15, "type": 0, "property": -1, "tags": 0},
      {"value": 0.85, "type": 2, "property": -1, "tags": 0},
      "...(+1 more)"
    ],
    "15": [],
    "16": [
      {"value": 0.15, "type": 0, "property": 51, "tags": 512},
      {"value": 0.15, "type": 0, "property": 51, "tags": 8192},
      "...(+1 more)"
    ],
    "17": [
      {"value": 10, "type": 0, "property": 11, "tags": 0},
      {"value": 10, "type": 0, "property": -1, "tags": 0},
      "...(+1 more)"
    ],
    "18": [],
    "19": [
      {"value": 0.02, "type": 0, "property": 75, "tags": 0}
    ],
    "20": [
      {"value": 0.1, "type": 1, "property": 11, "tags": 0},
      {"value": 0.1, "type": 1, "property": 11, "tags": 8192},
      "...(+2 more)"
    ],
    "21": [
      {"value": "", "type": 0, "property": -1, "noScaling": true, "tags": 0},
      {"value": 0.05, "type": 1, "property": 4, "tags": 0}
    ],
    "22": [
      {"value": 0.04, "type": 1, "property": 2, "tags": 8192},
      {"value": 0.04, "type": 1, "property": 3, "tags": 8192},
      "...(+3 more)"
    ],
    "23": [
      {"value": 0.08, "type": 0, "property": 1, "specialTag": 7, "tags": 512},
      {"value": 0.08, "type": 0, "property": 1, "specialTag": 7, "tags": 8704},
      "...(+1 more)"
    ],
    "24": [
      {"value": 12, "type": 0, "property": 7, "tags": 0},
      {"value": 12, "type": 0, "property": -1, "tags": 0},
      "...(+1 more)"
    ],
    "25": [],
    "26": [],
    "27": [
      {"value": 1, "type": 0, "property": 20, "tags": 0},
      {"value": 10, "type": 0, "property": 76, "tags": 0},
      "...(+1 more)"
    ],
    "28": [
      {"value": 0.1, "type": 0, "property": 5, "tags": 0},
      {"value": 10, "type": 0, "property": -1, "tags": 0}
    ],
    "29": [
      {"value": 14, "type": 0, "property": 76, "tags": 0},
      {"value": 0.04, "type": 0, "property": 64, "tags": 0},
      "...(+1 more)"
    ],
    "30": [],
    "31": [
      {"value": 2, "type": 0, "property": 19, "tags": 0},
      {"value": 2, "type": 0, "property": 22, "tags": 0},
      "...(+1 more)"
    ],
    "32": [
      {"value": 0.75, "type": 2, "property": -1, "tags": 0},
      {"value": 0.75, "type": 2, "property": -1, "tags": 0},
      "...(+1 more)"
    ],
    "33": [
      {"value": 1, "type": 0, "property": -1, "tags": 0}
    ],
    "34": [
      {"value": 10, "type": 0, "property": 7, "tags": 0},
      {"value": 10, "type": 0, "property": 7, "tags": 8192},
      "...(+3 more)"
    ],
    "...": "+77 more keys"
  },
  "damageTags": 0,
  "mods": {},
  "abilityMods": {},
  "buffs": {
    "3": [
      {"id": 48, "mods": ["{...}"]}
    ],
    "8": [
      {"id": 48, "mods": ["{...}"]},
      {"id": 48, "mods": ["{...}"]}
    ],
    "15": [
      {"id": 53, "mods": ["{...}"]},
      {"id": 57, "mods": []}
    ],
    "18": [
      {"id": 54, "mods": ["{...}"]},
      {"id": 54, "mods": ["{...}"]}
    ],
    "19": [
      {"id": 54, "mods": ["{...}"]}
    ],
    "21": [
      {"id": 56, "mods": ["{...}"]}
    ],
    "25": [
      {"id": 57, "mods": ["{...}"]}
    ],
    "26": [
      {"id": 55, "mods": ["{...}"]},
      {"id": 55, "mods": ["{...}"]}
    ],
    "28": [
      {"id": 56, "mods": ["{...}"]},
      {"id": 56, "mods": ["{...}"]}
    ],
    "30": [
      {"id": 57, "mods": ["{...}"]},
      {"id": 57, "mods": ["{...}"]}
    ],
    "33": [
      {"id": 54, "mods": ["{...}"]},
      {"id": 55, "mods": ["{...}"]},
      "...(+2 more)"
    ],
    "39": [
      {"id": 50, "mods": ["{...}"]}
    ],
    "56": [
      {"id": 54, "mods": ["{...}"]},
      {"id": 54, "mods": ["{...}"]}
    ],
    "57": [
      {"id": 57, "mods": []}
    ],
    "58": [
      {"id": 55, "mods": []}
    ],
    "59": [
      {"id": 54, "mods": ["{...}"]},
      {"id": 55, "mods": ["{...}"]},
      "...(+5 more)"
    ],
    "85": [
      {"id": 51, "mods": ["{...}"]}
    ],
    "92": [
      {"id": 51, "mods": ["{...}"]},
      {"id": 51, "mods": ["{...}"]}
    ],
    "93": [
      {"id": 51, "mods": ["{...}"]},
      {"id": 51, "mods": ["{...}"]},
      "...(+1 more)"
    ],
    "94": [
      {"id": 52, "mods": ["{...}"]},
      {"id": 52, "mods": ["{...}"]}
    ],
    "109": [
      {"id": 57, "mods": ["{...}"]},
      {"id": 57, "mods": ["{...}"]}
    ]
  },
  "buffAbilities": {"77": ["ability_gen11"]},
  "masteryBuffs": {}
}
```

### `skillBonuses`

- **Location:** `skillBonuses.<abilityId>` (file: planner)
- **Keying:** object keyed by ability id
- **Record count:** 8
- **Key space:** 8 keys, e.g. `sb44eQ`, `fi9`, `gl14`, `lb23il`

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `stats` | object | always |  | `{"0":[],"1":[],"2":[],"3":[],"4":[],"5":[],"6":[],"7":[],...` | Stat lines. |
| `stats.<key>` | array | 224 occurrences | len 0..4 | `[]` |  |
| `stats.<key>[]` | object | 103 occurrences |  | `{"value":-5,"type":0,"property":66,"tags":0}` |  |
| `damageTags` | number | always | values 0,2,4,6,10,14 | `0` | Damage tag mask (AT). |
| `mods` | object | always |  | `{"1":{"activeMeleeAttackSpeed":0.1},"2":{"passiveMeleeSho...` | Mod list. |
| `mods.<key>` | object | 173 occurrences |  | `{"activeMeleeAttackSpeed":0.1}` |  |
| `mods.<key>.activeMeleeAttackSpeed` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.passiveMeleeShockChance` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.activeAddedMeleeLightningDamage` | number | 1 occurrences | values 5 | `5` |  |
| `mods.<key>.activeIncreasedMeleeLightningDamage` | number | 1 occurrences | values 0.2 | `0.2` |  |
| `mods.<key>.passiveChanceToZapOnMeleeHit` | number | 1 occurrences | values 0.25 | `0.25` |  |
| `mods.<key>.activeZapCooldown` | number | 1 occurrences | values 0.5 | `0.5` |  |
| `mods.<key>.chanceToReplaceZapWithLB` | number | 1 occurrences | values 0.25 | `0.25` |  |
| `mods.<key>.activeMeleeFireLeech` | number | 1 occurrences | values 0.005 | `0.005` |  |
| `mods.<key>.activeMeleeLightningLeech` | number | 1 occurrences | values 0.005 | `0.005` |  |
| `mods.<key>.activeAddedMeleeFireDamage` | number | 1 occurrences | values 5 | `5` |  |
| `mods.<key>.activeIncreasedMeleeFireDamage` | number | 1 occurrences | values 0.2 | `0.2` |  |
| `mods.<key>.passiveMeleeIgniteChance` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.passiveIgniteDuration` | number | 1 occurrences | values 0.05 | `0.05` |  |
| `mods.<key>.instantIgniteDamage` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.conflagrateDamage` | number | 1 occurrences | values 0.5 | `0.5` |  |
| `mods.<key>.activeFireBurstVsIgnited` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.passiveFireBurstLimit` | number | 1 occurrences | values 2 | `2` |  |
| `mods.<key>.activeFireBurstLimit` | number | 1 occurrences | values 4 | `4` |  |
| `mods.<key>.activeFireBurstDamage` | number | 1 occurrences | values 0.3 | `0.3` |  |
| `mods.<key>.activeIncreasedFireBurstArea` | number | 1 occurrences | values 0.5 | `0.5` |  |
| `mods.<key>.addedDuration` | number | 1 occurrences | values 1 | `1` |  |
| `mods.<key>.activeMeleeElementalDamagePerMissingMana` | number | 1 occurrences | values 0.01 | `0.01` |  |
| `mods.<key>.activeIncreasedMeleeElementalDamage` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.autoRecast` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.fireAuraStacksPerSecond` | number | 1 occurrences | values 1 | `1` |  |
| `mods.<key>.passiveMeleeChillChance` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.passiveChillToFrostbiteChancePercent` | number | 1 occurrences | values 0.2 | `0.2` |  |
| `mods.<key>.passiveIceShardsChance` | number | 1 occurrences | values 0.02 | `0.02` |  |
| `mods.<key>.passiveIceShardsLimit` | number | 1 occurrences | values 2 | `2` |  |
| `mods.<key>.activeIceShardsTripled` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.extraIceShardsProjectiles` | number | 1 occurrences | values 2 | `2` |  |
| `mods.<key>.activeAddedMeleeColdDamage` | number | 1 occurrences | values 5 | `5` |  |
| `mods.<key>.activeIncreasedMeleeColdDamage` | number | 1 occurrences | values 0.2 | `0.2` |  |
| `mods.<key>.freeMeleeElementalAttack` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.cleanseAilments` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.increasedCooldown` | number | 1 occurrences | values -0.25 | `-0.25` |  |
| `mods.<key>.castElementalNova` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.increasedDuration` | number | 3 occurrences | values -0.25,0.1,0.5 | `-0.25` | Increased duration. |
| `mods.<key>.manaConsumptionOnElementalNovaCast` | number | 1 occurrences | values 1 | `1` |  |
| `abilityMods` | object | always |  | `{}` |  |
| `buffs` | object | always |  | `{}` | Buff list. |
| `buffAbilities` | object | always |  | `{}` |  |
| `masteryBuffs` | object | always |  | `{}` |  |
| `mods.<key>.pierceChance` | number | 2 occurrences | values 0.25,0.5 | `0.25` |  |
| `mods.<key>.critChance` | number | 1 occurrences | values 0.015 | `0.015` | Base crit chance. |
| `mods.<key>.baseDamageToLightningPercent` | number | 1 occurrences | values 0.5 | `0.5` |  |
| `mods.<key>.increasedSpeed` | number | 1 occurrences | values 0.07 | `0.07` |  |
| `mods.<key>.increasedRange` | number | 3 occurrences | values -0.7,0.07,0.1 | `0.07` |  |
| `mods.<key>.extraProjectiles` | number | 2 occurrences | values 2 | `2` |  |
| `mods.<key>.critChanceToStunChance` | number | 1 occurrences | values 20 | `20` |  |
| `mods.<key>.fireInSequence` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.canHitSameTarget` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.extraProjectilesMod` | number | 1 occurrences | values -0.5 | `-0.5` |  |
| `mods.<key>.extraProjectilesWithoutPenalty` | number | 1 occurrences | values 1 | `1` |  |
| `mods.<key>.igniteChance` | number | 1 occurrences | values 0.3 | `0.3` |  |
| `mods.<key>.homing` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.flameBurstProc` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.flameBurstProcStacks` | number | 1 occurrences | values -1 | `-1` |  |
| `mods.<key>.moreDamagePerExtraProjectile` | number | 1 occurrences | values 0.12 | `0.12` |  |
| `mods.<key>.singleProjectile` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.isChanneled` | boolean | 3 occurrences | values true | `true` |  |
| `abilityMods.<key>` | object | 13 occurrences |  | `{"extraProjectiles":0}` |  |
| `abilityMods.<key>.extraProjectiles` | number | 1 occurrences | values 0 | `0` |  |
| `abilityMods.<key>.baseDamageToLightningPercent` | number | 1 occurrences | values 0 | `0` |  |
| `abilityMods.<key>.chanceToApplySparkOnHit` | number | 1 occurrences | values 0 | `0` |  |
| `abilityMods.<key>.igniteToShock` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.chillChance` | number | 1 occurrences | values 0.25 | `0.25` |  |
| `mods.<key>.g1MoreDamage` | number | 1 occurrences | values 0.5 | `0.5` |  |
| `mods.<key>.g2MoreDamage` | number | 3 occurrences | values 0.25,0.35,1 | `0.35` |  |
| `mods.<key>.g3MoreDamage` | number | 2 occurrences | values 0.15,0.2 | `0.2` |  |
| `mods.<key>.g1ChillChance` | number | 1 occurrences | values 0.5 | `0.5` |  |
| `mods.<key>.g2ChillChance` | number | 1 occurrences | values 0.25 | `0.25` |  |
| `mods.<key>.g3ChillChance` | number | 1 occurrences | values 0.25 | `0.25` |  |
| `mods.<key>.g1VortexChance` | number | 1 occurrences | values 0.4 | `0.4` |  |
| `mods.<key>.g2VortexChance` | number | 1 occurrences | values 0.2 | `0.2` |  |
| `mods.<key>.g3VortexChance` | number | 1 occurrences | values 0.2 | `0.2` |  |
| `mods.<key>.vortexChance` | number | 1 occurrences | values 0.15 | `0.15` |  |
| `mods.<key>.g3Disabled` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.percentOfMaxManaGainedOnCrit` | number | 1 occurrences | values 0.01 | `0.01` |  |
| `mods.<key>.percentOfMaxManaGainedOnCritPerSecond` | number | 1 occurrences | values 10 | `10` |  |
| `mods.<key>.percentOfMaxManaGainedOnKill` | number | 1 occurrences | values 0.01 | `0.01` |  |
| `mods.<key>.reverseExplosions` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.castAtTarget` | boolean | 2 occurrences | values true | `true` |  |
| `mods.<key>.noCritMulti` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.greaterVortexChance` | number | 1 occurrences | values 0.2 | `0.2` |  |
| `mods.<key>.greaterVortexDamage` | number | 1 occurrences | values 1.5 | `1.5` |  |
| `mods.<key>.greaterVortexRadius` | number | 1 occurrences | values 0.6 | `0.6` |  |
| `mods.<key>.doubleChillChance` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.wardGainedOnCrit` | number | 1 occurrences | values 5 | `5` |  |
| `mods.<key>.teleportToTarget` | boolean | 1 occurrences | values true | `true` |  |
| `buffs.<key>` | array | 5 occurrences | len 1..3 | `[{"id":60,"mods":[{"prop":2,"value":1,"noScaling":false,"...` |  |
| `buffs.<key>[]` | object | 8 occurrences |  | `{"id":60,"mods":[{"prop":2,"value":1,"noScaling":false,"p...` |  |
| `mods.<key>.extraChains` | number | 2 occurrences | values 1 | `1` |  |
| `mods.<key>.extraChainsPerRecentCast` | number | 1 occurrences | values 1 | `1` |  |
| `mods.<key>.increasedChainRange` | number | 1 occurrences | values 0.5 | `0.5` |  |
| `mods.<key>.chainsToAllies` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.sparkNovaChance` | number | 1 occurrences | values 0.25 | `0.25` |  |
| `mods.<key>.shockChance` | number | 1 occurrences | values 0.15 | `0.15` |  |
| `mods.<key>.lightningToCold` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.shockToChill` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.wardGainedOnHit` | number | 1 occurrences | values 2 | `2` |  |
| `mods.<key>.castsBetweenChaining` | number | 1 occurrences | values 4 | `4` |  |
| `mods.<key>.increasedWardGainedOnHit` | number | 1 occurrences | values -0.5 | `-0.5` |  |
| `mods.<key>.wardGainedPerManaSpent` | number | 1 occurrences | values 1 | `1` |  |
| `mods.<key>.damageInLine` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.moreDamagePerMaxAdditionalChains` | number | 1 occurrences | values 0.3 | `0.3` |  |
| `mods.<key>.chainToFirstTarget` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.extraChainsHalved` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.canFork` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.lightningAegisChance` | number | 1 occurrences | values 0.05 | `0.05` |  |
| `mods.<key>.doubleCastChance` | number | 1 occurrences | values 0.08 | `0.08` |  |
| `mods.<key>.lessBonusDamagePerChain` | number | 1 occurrences | values 0.25 | `0.25` |  |
| `mods.<key>.explosionChance` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.explosionDamage` | number | 1 occurrences | values 0.4 | `0.4` |  |
| `mods.<key>.detonateSparkCharges` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.outOfManaCost` | number | 1 occurrences | values 0 | `0` |  |
| `mods.<key>.cannotChain` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.quadCastChance` | number | 1 occurrences | values 0.3 | `0.3` |  |
| `mods.<key>.channelCostIfCannotChain` | number | 1 occurrences | values -10 | `-10` |  |
| `abilityMods.<key>.lightningToCold` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.shockToChill` | boolean | 1 occurrences | values true | `true` |  |
| `buffAbilities.<key>` | array | 1 occurrences | len 1..1 | `["ability_gen42"]` |  |
| `buffAbilities.<key>[]` | string | 1 occurrences | values "ability_gen42" | `"ability_gen42"` |  |
| `mods.<key>.increasedFallSpeed` | number | 2 occurrences | values 0.2,0.25 | `0.2` |  |
| `mods.<key>.shrapnelChance` | number | 1 occurrences | values 0.5 | `0.5` |  |
| `mods.<key>.shrapnelDamage` | number | 1 occurrences | values 0.6 | `0.6` |  |
| `mods.<key>.increasedShrapnelSpeed` | number | 2 occurrences | values -0.2,0.4 | `0.4` |  |
| `mods.<key>.increasedShrapnelRange` | number | 2 occurrences | values -0.2,0.4 | `0.4` |  |
| `mods.<key>.shrapnelPierce` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.moreNonFireDamage` | number | 1 occurrences | values 0.2 | `0.2` |  |
| `mods.<key>.extraMeteors` | number | 3 occurrences | values 1 | `1` |  |
| `mods.<key>.increasedFallRadius` | number | 1 occurrences | values 0.15 | `0.15` |  |
| `mods.<key>.increasedRadius` | number | 1 occurrences | values -0.15 | `-0.15` |  |
| `mods.<key>.increasedFallFrequency` | number | 1 occurrences | values 0.35 | `0.35` |  |
| `mods.<key>.fallInLine` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.increasedArea` | number | 5 occurrences | values -0.4,0.05,0.2,0.25,2.5 | `0.25` |  |
| `mods.<key>.largeMeteorChance` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.largeMeteorArea` | number | 1 occurrences | values 1 | `1` |  |
| `mods.<key>.manaCostRecovered` | number | 1 occurrences | values 0.2 | `0.2` |  |
| `mods.<key>.craterbornDuration` | number | 1 occurrences | values 6 | `6` |  |
| `mods.<key>.craterbornWardGain` | number | 1 occurrences | values 10 | `10` |  |
| `mods.<key>.craterbornManaGain` | number | 1 occurrences | values 2 | `2` |  |
| `mods.<key>.frostClaws` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.fireToLightning` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.useColdNova` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.freezingCascadeChance` | number | 1 occurrences | values 1 | `1` |  |
| `mods.<key>.freezingCascadeCooldown` | number | 1 occurrences | values 3 | `3` |  |
| `mods.<key>.repeatChanceOnDirectCast` | number | 1 occurrences | values 0.04 | `0.04` |  |
| `mods.<key>.repeatChanceMultiByType` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.repeatChanceIn12mRadius` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.useLightningNova` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.wardGainedOnKill` | number | 1 occurrences | values 8 | `8` |  |
| `mods.<key>.wardGainedOnBossRareHit` | number | 1 occurrences | values 8 | `8` |  |
| `mods.<key>.useFireNova` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.increasedChannelledArea` | number | 1 occurrences | values 0.25 | `0.25` |  |
| `mods.<key>.cooldown` | number | 3 occurrences | values 4,5 | `4` |  |
| `mods.<key>.charges` | number | 1 occurrences | values 1 | `1` |  |
| `mods.<key>.overchargeChance` | number | 1 occurrences | values 0.12 | `0.12` |  |
| `mods.<key>.overchargeShockChance` | number | 1 occurrences | values 2 | `2` |  |
| `mods.<key>.increasedOverchargeArea` | number | 1 occurrences | values 0.75 | `0.75` |  |
| `mods.<key>.overchargeDamage` | number | 1 occurrences | values 0.25 | `0.25` |  |
| `mods.<key>.overchargeStunChance` | number | 1 occurrences | values 0.4 | `0.4` |  |
| `mods.<key>.iceNovaFreezeRateMultiplier` | number | 1 occurrences | values 0.4 | `0.4` |  |
| `mods.<key>.lightningNovaShockChance` | number | 1 occurrences | values 0.2 | `0.2` |  |
| `mods.<key>.fireNovaIgniteChance` | number | 1 occurrences | values 0.2 | `0.2` |  |
| `mods.<key>.novasPerSecond` | number | 1 occurrences | values 5 | `5` |  |
| `mods.<key>.disableLightningNova` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.spellDamageWithSupernova` | number | 1 occurrences | values 0 | `0` |  |
| `abilityMods.<key>.triElemental` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.castFlameBurst` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.flameBurstDamage` | number | 1 occurrences | values 0.5 | `0.5` |  |
| `mods.<key>.buffAttackSpeed` | number | 1 occurrences | values 0.03 | `0.03` |  |
| `mods.<key>.buffCastSpeed` | number | 1 occurrences | values 0.03 | `0.03` |  |
| `mods.<key>.buffIncreasedCritChance` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.buffCritMulti` | number | 1 occurrences | values 0.05 | `0.05` |  |
| `mods.<key>.buffIncreasedFireDamage` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.buffIgniteChance` | number | 1 occurrences | values 0.05 | `0.05` |  |
| `mods.<key>.buffElectrifyChance` | number | 1 occurrences | values 0.05 | `0.05` |  |
| `mods.<key>.buffFirePenetration` | number | 1 occurrences | values 0.05 | `0.05` |  |
| `mods.<key>.buffIncreasedPhysicalDamage` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.buffIncreasedThrowingAttackDamage` | number | 1 occurrences | values 0.12 | `0.12` |  |
| `mods.<key>.buffIncreasedThrowingAttackStunChance` | number | 1 occurrences | values 0.12 | `0.12` |  |
| `mods.<key>.buffElementalResistance` | number | 1 occurrences | values 0.05 | `0.05` |  |
| `mods.<key>.buffEndurance` | number | 1 occurrences | values 0.03 | `0.03` |  |
| `mods.<key>.buffDodgeRating` | number | 1 occurrences | values 20 | `20` |  |
| `mods.<key>.buffIncreasedHealingEffectiveness` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.disabledDuringCooldown` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.buffPoisonResistance` | number | 1 occurrences | values 0.2 | `0.2` |  |
| `mods.<key>.cleansesAilments` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.chanceToSlow` | number | 1 occurrences | values 0.5 | `0.5` |  |
| `mods.<key>.buffThrowingAttackSpeed` | number | 1 occurrences | values 0.03 | `0.03` |  |
| `mods.<key>.buffHasteChance` | number | 1 occurrences | values 0.03 | `0.03` |  |
| `mods.<key>.buffIncreasedHealthRegen` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.buffWardRegen` | number | 1 occurrences | values 3 | `3` |  |
| `mods.<key>.buffWardRetention` | number | 1 occurrences | values 0.05 | `0.05` |  |
| `mods.<key>.wardGainedOnActivation` | number | 1 occurrences | values 400 | `400` |  |
| `mods.<key>.buffBlockEffectiveness` | number | 1 occurrences | values 30 | `30` |  |
| `mods.<key>.buffHealthGainedOnBlock` | number | 1 occurrences | values 2 | `2` |  |
| `mods.<key>.buffWardGainedOnBlock` | number | 1 occurrences | values 7 | `7` |  |
| `mods.<key>.healthGlobeChance` | number | 1 occurrences | values 0.12 | `0.12` |  |
| `mods.<key>.flameBurstStacksOnMeleeHit` | number | 1 occurrences | values 1 | `1` |  |
| `mods.<key>.flameBurstArea` | number | 1 occurrences | values 0.25 | `0.25` |  |
| `abilityMods.<key>.increasedPassiveEffect` | number | 2 occurrences | values 0 | `0` |  |
| `abilityMods.<key>.buffIncreasedManaRegen` | number | 1 occurrences | values 0 | `0` |  |
| `abilityMods.<key>.activeMoreIgniteDamage` | number | 1 occurrences | values 0 | `0` |  |
| `mods.<key>.passiveManaRegen` | number | 1 occurrences | values 0.02 | `0.02` |  |
| `mods.<key>.passiveElectrifyChance` | number | 2 occurrences | values 0.06,0.15 | `0.06` |  |
| `mods.<key>.passiveIgniteChance` | number | 1 occurrences | values 0.06 | `0.06` |  |
| `mods.<key>.passiveIncreasedCritChance` | number | 1 occurrences | values 0.04 | `0.04` |  |
| `mods.<key>.passiveIncreasedHealing` | number | 1 occurrences | values 0.04 | `0.04` |  |
| `mods.<key>.activeEffectIncreasedDuration` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.maxSymbols` | number | 2 occurrences | values 1 | `1` |  |
| `mods.<key>.healthToWardPerSymbol` | number | 1 occurrences | values 0.02 | `0.02` |  |
| `mods.<key>.chanceToRegainSymbol` | number | 1 occurrences | values 0.34 | `0.34` |  |
| `mods.<key>.activeHealingEffectiveness` | number | 1 occurrences | values 0.3 | `0.3` |  |
| `mods.<key>.activeHaste` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.activeGainHealthPercent` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.passiveEnduranceThreshold` | number | 1 occurrences | values 15 | `15` |  |
| `mods.<key>.symbolGainRate` | number | 1 occurrences | values 0.15 | `0.15` |  |
| `mods.<key>.canCastDivineFlare` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.reducedCooldown` | number | 1 occurrences | values 0.8 | `0.8` |  |
| `mods.<key>.activeNoDamageReduction` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.divineFlareRecastChance` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.divineFlareMoreDamage` | number | 1 occurrences | values 0.25 | `0.25` |  |
| `mods.<key>.divineFlareIncreasedArea` | number | 1 occurrences | values 0.15 | `0.15` |  |
| `mods.<key>.divineFlareCleanseAilmentChance` | number | 1 occurrences | values 0.25 | `0.25` |  |
| `mods.<key>.divineFlareBlindChance` | number | 1 occurrences | values 0.25 | `0.25` |  |
| `mods.<key>.divineFlareSymbolOnKillChance` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.divineFlareSymbolOnHitChance` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.passiveDoubleHealthRegen` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.symbolsAffectOnlyYou` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.symbolsCanBeCastOnAllies` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.passiveBlockChance` | number | 1 occurrences | values 0.01 | `0.01` |  |
| `mods.<key>.passiveBlockEffectiveness` | number | 1 occurrences | values 15 | `15` |  |
| `mods.<key>.passiveAddedFireDamage` | number | 1 occurrences | values 1 | `1` |  |
| `mods.<key>.convertToLightning` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.passiveNoHealthRegen` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.passiveIncreasedDamage` | number | 1 occurrences | values 0.05 | `0.05` |  |
| `mods.<key>.increasedEffectOnOtherAllies` | number | 1 occurrences | values 0.05 | `0.05` |  |
| `abilityMods.<key>.passiveAddedHealthRegen` | number | 1 occurrences | values 0 | `0` |  |

Example (key `sb44eQ`, record #0, trimmed):

```json
{
  "stats": {
    "0": [],
    "1": [],
    "2": [],
    "3": [],
    "4": [],
    "5": [],
    "6": [],
    "7": [],
    "8": [],
    "9": [],
    "10": [],
    "11": [],
    "12": [],
    "13": [],
    "14": [],
    "15": [],
    "16": [
      {"value": -5, "type": 0, "property": 66, "tags": 0}
    ],
    "17": [],
    "18": [],
    "19": [
      {"value": 1, "type": 0, "property": 0, "per": ["{...}"], "tags": 514},
      {"value": 1, "type": 0, "property": 0, "per": ["{...}"], "tags": 516}
    ],
    "20": [],
    "21": [],
    "22": [],
    "23": [],
    "24": [],
    "25": [],
    "26": []
  },
  "damageTags": 0,
  "mods": {
    "1": {"activeMeleeAttackSpeed": 0.1},
    "2": {"passiveMeleeShockChance": 0.1},
    "3": {"activeAddedMeleeLightningDamage": 5, "activeIncreasedMeleeLightningDamage": 0.2},
    "4": {"passiveChanceToZapOnMeleeHit": 0.25, "activeZapCooldown": 0.5},
    "5": {"chanceToReplaceZapWithLB": 0.25},
    "6": {"activeMeleeFireLeech": 0.005, "activeMeleeLightningLeech": 0.005},
    "7": {"activeAddedMeleeFireDamage": 5, "activeIncreasedMeleeFireDamage": 0.2},
    "8": {"passiveMeleeIgniteChance": 0.1},
    "9": {"passiveIgniteDuration": 0.05},
    "10": {"instantIgniteDamage": true},
    "11": {"conflagrateDamage": 0.5},
    "12": {"activeFireBurstVsIgnited": true, "passiveFireBurstLimit": 2, "activeFireBurstLimit": 4},
    "13": {"activeFireBurstDamage": 0.3, "activeIncreasedFireBurstArea": 0.5},
    "14": {"addedDuration": 1},
    "15": {"activeMeleeElementalDamagePerMissingMana": 0.01},
    "16": {"activeIncreasedMeleeElementalDamage": 0.1},
    "17": {"autoRecast": true},
    "18": {"fireAuraStacksPerSecond": 1},
    "20": {"passiveMeleeChillChance": 0.1, "passiveChillToFrostbiteChancePercent": 0.2},
    "21": {"passiveIceShardsChance": 0.02, "passiveIceShardsLimit": 2, "activeIceShardsTripled": true},
    "22": {"extraIceShardsProjectiles": 2},
    "23": {"activeAddedMeleeColdDamage": 5, "activeIncreasedMeleeColdDamage": 0.2},
    "24": {"freeMeleeElementalAttack": true},
    "25": {"cleanseAilments": true},
    "26": {
      "increasedCooldown": -0.25,
      "castElementalNova": true,
      "increasedDuration": -0.25,
      "manaConsumptionOnElementalNovaCast": 1
    }
  },
  "abilityMods": {},
  "buffs": {},
  "buffAbilities": {},
  "masteryBuffs": {}
}
```

### `partialSkillBonuses`

- **Location:** `partialSkillBonuses.<abilityId>` (file: planner)
- **Keying:** object keyed by ability id
- **Record count:** 128
- **Key space:** 128 keys, e.g. `av75ch`, `wb8fo`, `eq5s`, `er6no`

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `damageTags` | number | always | 0..105 (>12 distinct) | `5` | Damage tag mask (AT). |
| `mods` | object | always |  | `{"2":{"isChanneled":true},"9":{"convertToPhysical":true},...` | Mod list. |
| `mods.<key>` | object | 300 occurrences |  | `{"isChanneled":true}` |  |
| `mods.<key>.isChanneled` | boolean | 9 occurrences | values true | `true` |  |
| `mods.<key>.convertToPhysical` | boolean | 12 occurrences | values true | `true` |  |
| `mods.<key>.convertToCold` | boolean | 35 occurrences | values true | `true` |  |
| `abilityMods` | object | always |  | `{}` |  |
| `buffs` | object | always |  | `{}` | Buff list. |
| `buffAbilities` | object | always |  | `{}` |  |
| `masteryBuffs` | object | always |  | `{}` |  |
| `mods.<key>.convertToLightning` | boolean | 18 occurrences | values true | `true` |  |
| `mods.<key>.convertToFire` | boolean | 25 occurrences | values true | `true` |  |
| `mods.<key>.convertToSpell` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>` | object | 48 occurrences |  | `{"convertToFire":true}` |  |
| `abilityMods.<key>.convertToFire` | boolean | 10 occurrences | values true | `true` |  |
| `abilityMods.<key>.convertToLightning` | boolean | 3 occurrences | values true | `true` |  |
| `mods.<key>.convertToPoison` | boolean | 9 occurrences | values true | `true` |  |
| `mods.<key>.buffAllies` | boolean | 4 occurrences | values true | `true` |  |
| `mods.<key>.buffTotemsAndVines` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.chanceToHealNearby` | number | 1 occurrences | values 0.25 | `0.25` |  |
| `mods.<key>.castsLightning` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.convertToCold` | boolean | 6 occurrences | values true | `true` |  |
| `mods.<key>.directCast` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.convertToNecrotic` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.snakeOnKillChance` | number | 1 occurrences | values 0.12 | `0.12` |  |
| `abilityMods.<key>.snakeOnKillChance` | number | 1 occurrences | values 0 | `0` |  |
| `mods.<key>.blizzardTotem` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.thorns` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.usesSwipe` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.canEarthquake` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.armourPerStrength` | number | 1 occurrences | values 10 | `10` |  |
| `mods.<key>.noCooldown` | boolean | 9 occurrences | values true | `true` |  |
| `mods.<key>.castTotem` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.castsScreech` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.dodgePerDexterity` | number | 1 occurrences | values 10 | `10` |  |
| `mods.<key>.coldTag` | boolean | 3 occurrences | values true | `true` |  |
| `mods.<key>.armourShredPerStrength` | number | 1 occurrences | values 0.04 | `0.04` |  |
| `mods.<key>.teleportToTarget` | boolean | 3 occurrences | values true | `true` |  |
| `mods.<key>.dodgeStrengthScaling` | number | 1 occurrences | values 0.03 | `0.03` |  |
| `mods.<key>.lightningRetaliationChance` | number | 2 occurrences | values 0.05,0.35 | `0.05` |  |
| `mods.<key>.attunementScaling` | number(1)\|boolean(1) | 2 occurrences | values 0.04,true | `0.04` |  |
| `abilityMods.<key>.lightningRetaliationChance` | number | 1 occurrences | values 0 | `0` |  |
| `mods.<key>.periodicLightning` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.baseDamageToLightningPercent` | number | 3 occurrences | values 0.2,0.25,1 | `0.2` |  |
| `mods.<key>.lightningPenetrationPerAttunement` | number | 1 occurrences | values 0.02 | `0.02` |  |
| `abilityMods.<key>.periodicLightning` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.totemMode` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.addPoisonTag` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.castLightning` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.instantCast` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.noAttackSpeedScaling` | boolean | 3 occurrences | values true | `true` |  |
| `mods.<key>.summonTotem` | boolean | 2 occurrences | values true | `true` |  |
| `mods.<key>.addPhysicalSpellDamage` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.dealsLightningDamage` | boolean | 5 occurrences | values true | `true` |  |
| `mods.<key>.binarySystem` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.armageddon` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.addedUseDelay` | number | 1 occurrences | values 0.5 | `0.5` |  |
| `mods.<key>.nonChannellingMode` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.scaleDamage` | boolean | 4 occurrences | values true | `true` |  |
| `mods.<key>.healingPerIntelligence` | number | 1 occurrences | values 0.06 | `0.06` |  |
| `mods.<key>.teleportAtStart` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.channelledMovement` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.noBurst` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.backflip` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.moreDoTPerArmorShredUpTo14Buff` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.wardPerSecondPerUncappedResistance` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.grantedShockChance` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.wardPerSecond` | number | 1 occurrences | values 0 | `0` |  |
| `abilityMods.<key>.fireAuraChancePerSecond` | number | 1 occurrences | values 0 | `0` |  |
| `abilityMods.<key>.ailmentsToShredConversion` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.convertLightningToCold` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.shockToChill` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.convertFireToCold` | boolean | 2 occurrences | values true | `true` |  |
| `mods.<key>.igniteToChill` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.convertColdToLightning` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.chillToShock` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.convertFireToLightning` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.igniteToShock` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.convertLightningToFire` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.shockToIgnite` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.convertColdToFire` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.frostbiteToIgnite` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.forceRandomElement` | boolean | 2 occurrences | values true | `true` |  |
| `mods.<key>.triElementalAfter3Casts` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.areaTag` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.comboFollowsLastRunicInvocationOrder` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.useLaskSkillTag` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.leapBackwards` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.leapForwards` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.blinksToTargetLocation` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.convertToVoid` | boolean | 3 occurrences | values true | `true` |  |
| `mods.<key>.spellVoidHit` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.healingPerAttunement` | number | 1 occurrences | values 0.04 | `0.04` |  |
| `mods.<key>.instantForPlayer` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.timeWave` | boolean | 2 occurrences | values true | `true` |  |
| `mods.<key>.addFireDamage` | boolean | 3 occurrences | values true | `true` |  |
| `mods.<key>.addMinionFireTag` | boolean | 3 occurrences | values true | `true` |  |
| `mods.<key>.addVoidDamage` | boolean | 6 occurrences | values true | `true` |  |
| `mods.<key>.dealsDamage` | boolean | 1 occurrences | values true | `true` | Ailment deals damage. |
| `mods.<key>.melee` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.traversal` | boolean | 9 occurrences | values true | `true` |  |
| `mods.<key>.skyBeam` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.javelinRain` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.isFlag` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.convertToVoid` | boolean | 6 occurrences | values true | `true` |  |
| `mods.<key>.chanceToSummonWeaponAtMaxStacks` | number | 1 occurrences | values 0.1 | `0.1` |  |
| `mods.<key>.castReliquary` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.convertToPhysical` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.noTraversal` | boolean | 2 occurrences | values true | `true` |  |
| `abilityMods.<key>.scalingConvertedToVitality` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.partialFireConversion` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.fireConversion` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.isInstant` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.modFromInt` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.bonePrison` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.convertToNecrotic` | boolean | 5 occurrences | values true | `true` |  |
| `mods.<key>.convertNecroticToPhysical` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.removesSpirit` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.convertFireToPhysical` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.convertFireToPoison` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.flameWhip` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.notChanneled` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.noMovement` | boolean | 5 occurrences | values true | `true` |  |
| `mods.<key>.spellOnly` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.addCurseTag` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.movesTowardCursor` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.coneInFrontMode` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.castInArea` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.pyreGolem` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.deathchillGolem` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.bloodGolem` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.addCryo` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.forceRemoveMages` | boolean | 2 occurrences | values true | `true` |  |
| `mods.<key>.forceRemovePyro` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.addPyro` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.addDeathKnights` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.dksCastHungeringSouls` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.useNecroticMortar` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.teleportsOnDirectCast` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.onlyOneWarrior` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.removeWarriors` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.removeArchers` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.useFireArrow` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.useIceArrow` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.addRogues` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.useAcidFlask` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.removeWarriors` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.removeArchers` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.forceRemoveRogues` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.addNecroticDamage` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.flameWraithChance` | number | 1 occurrences | values 0.11 | `0.11` |  |
| `mods.<key>.putridWraithChance` | number | 1 occurrences | values 0.11 | `0.11` |  |
| `abilityMods.<key>.chanceToSummonPutridWraithInstead` | number | 1 occurrences | values 0 | `0` |  |
| `abilityMods.<key>.chanceToSummonFlameWraithInstead` | number | 1 occurrences | values 0 | `0` |  |
| `mods.<key>.castVomit` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.poisonSpit` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.poisonFeatherstorm` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.explodeFire` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.explodeConvertedToCold` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.bleedToPoison` | boolean | 5 occurrences | values true | `true` |  |
| `abilityMods.<key>.convertToMelee` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.shadowFalcon` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.consumeShadowsForDreamStacks` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.throwsTrapOfEachConversion` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.castingBow` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.hasInitialHit` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.convertToPoison` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.convertToThrowing` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.dashWaitDash` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.baseDamageToLightningPercent` | number | 2 occurrences | values 0 | `0` |  |
| `abilityMods.<key>.quickAttack` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.noflip` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.throwsTrap` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.bleedAndPoisonToFrostbite` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.throwsDaggers` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.noMelee` | boolean | 1 occurrences | values true | `true` |  |
| `abilityMods.<key>.noMovement` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.dealsMeleeDamage` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.backflip` | boolean | 1 occurrences | values true | `true` |  |
| `mods.<key>.backflipOnUse` | boolean | 1 occurrences | values true | `true` |  |

Example (key `av75ch`, record #0, trimmed):

```json
{
  "damageTags": 5,
  "mods": {
    "2": {"isChanneled": true},
    "9": {"convertToPhysical": true},
    "20": {"convertToCold": true}
  },
  "abilityMods": {},
  "buffs": {},
  "buffAbilities": {},
  "masteryBuffs": {}
}
```

### `UIBuffs`

- **Location:** `UIBuffs` (file: planner)
- **Keying:** object keyed by numeric buff id
- **Record count:** 264
- **Key space:** 264 keys, numeric 1..264

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `id` | number | always | 1..264 (>12 distinct) | `1` | Record identifier (type depends on collection; see ids.md). |
| `displayNameKey` | string | always | >12 distinct | `"Ailments.NonAilment_IronMastery_Name"` | i18n key for the display name. |
| `descriptionKey` | string(263)\|null(1) | always | >12 distinct | `"Ailments.NonAilment_IronMastery_Description"` | i18n key for the description. |
| `icon` | string | always | >12 distinct | `"a-r-767"` | Icon sprite/hash. |
| `maxInstances` | number | always | 0..999 (>12 distinct) | `1` | Max stacks (0 = unlimited). |
| `noFixedDuration` | boolean | always | values false,true | `false` |  |
| `positive` | boolean | always | values true,false | `true` | Beneficial effect. |
| `newStacksRefreshDuration` | boolean | always | values false,true | `false` |  |

Example (key `2`, record #1, trimmed):

```json
{
  "id": 2,
  "displayNameKey": "Ailments.NonAilment_ReactiveWard_Name",
  "descriptionKey": "Ailments.NonAilment_ReactiveWard_Description",
  "icon": "a-r-612",
  "maxInstances": 1,
  "noFixedDuration": false,
  "positive": true,
  "newStacksRefreshDuration": false
}
```

### `monsterMods`

- **Location:** `monsterMods` (file: endgame)
- **Keying:** object keyed by compact string id ("M" + LZ-string of decimal id)
- **Record count:** 287
- **Key space:** 287 keys, e.g. `MAxA`, `MIxA`, `MExA`, `MMxA`

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `modType` | number | always | values 0,1,2,4,5 | `2` | Monster mod type enum. |
| `titleKey` | null(246)\|string(41) | always | >12 distinct | `null` | i18n key for a title. |
| `descriptionKey` | null(224)\|string(63) | always | >12 distinct | `null` | i18n key for the description. |
| `minilithDescriptionKey` | string(214)\|null(73) | always | >12 distinct | `"MonsterMods.Boss Drops Exalted Jewelry T2 Dungeon Mod_M&...` |  |
| `increasedItemRarity` | number | always | values 0,0.01,0.05,0.08,0.1,0.12,0.15,0.16,0.18,0.25,0.4 | `0` |  |
| `increasedExperience` | number | always | values 0,0.04,0.05,0.06,0.08,0.1,0.12,0.14,0.15,0.4 | `0` |  |
| `effectModifierEffect` | number | always | values 0,2,4 | `0` |  |
| `effectModifierCap` | number | always | values 0,0.6,0.75,1,2,3 | `0` |  |
| `statsWithoutEffectModifier` | number | always | values 0,1 | `0` |  |
| `bonusDrop` | object(93)\|null(194) | always | values null | `{"chance":1,"min":3,"max":3,"condition":3,"properties":{"...` |  |
| `bonusDrop.chance` | number | 93/287 (32.4%) | values 0.02,0.03,0.045,0.05,0.07,1 | `1` | Chance (0..1). |
| `bonusDrop.min` | number | 93/287 (32.4%) | values 1,2,3,4,5,6,7 | `3` | Roll min. |
| `bonusDrop.max` | number | 93/287 (32.4%) | values 1,2,3,4,5,6,7,8 | `3` | Roll max. |
| `bonusDrop.condition` | number | 93/287 (32.4%) | values 0,3 | `3` |  |
| `bonusDrop.properties` | object | 93/287 (32.4%) |  | `{"itemTypeType":1,"itemType":-1,"itemTypeGroup":2,"subTyp...` |  |
| `bonusDrop.properties.itemTypeType` | number | 93/287 (32.4%) | values 0,1 | `1` |  |
| `bonusDrop.properties.itemType` | number | 93/287 (32.4%) | values -1,0,20,21,22,101,102,103,104 | `-1` |  |
| `bonusDrop.properties.itemTypeGroup` | number | 93/287 (32.4%) | values 0,2,3,4 | `2` |  |
| `bonusDrop.properties.subType` | number | 93/287 (32.4%) | values -1,0,1,3,4,5,6 | `-1` |  |
| `bonusDrop.properties.ilvl` | number | 93/287 (32.4%) | values -1 | `-1` |  |
| `bonusDrop.properties.rarityType` | number | 93/287 (32.4%) | values 0,1 | `1` |  |
| `bonusDrop.properties.rarity` | number | 93/287 (32.4%) | values 0,2 | `0` |  |
| `bonusDrop.properties.rarityGroup` | number | 93/287 (32.4%) | values 0,2,3,4,5 | `5` |  |
| `bonusDrop.properties.uniqueID` | number | 93/287 (32.4%) | values -1 | `-1` | Unique item id. |
| `bonusDrop.properties.alwaysRequireClassCompatibility` | boolean | 93/287 (32.4%) | values false | `false` |  |
| `bonusDrop.properties.cannotBeGifted` | boolean | 93/287 (32.4%) | values false | `false` |  |
| `bonusDrop.properties.hostOnly` | boolean | 93/287 (32.4%) | values false | `false` |  |
| `rarityRequirement` | number | always | values 0,1 | `0` |  |
| `minimumLevel` | number | always | 0..58 (>12 distinct) | `0` |  |
| `canSpawnInArena` | boolean | always | values false,true | `false` |  |
| `incompatibleMods` | array | always | len 0..4 | `[]` |  |
| `stats` | array | 236/287 (82.2%) | len 1..3 | `[{"property":0,"specialTag":0,"tags":0,"addedValue":0,"in...` | Stat lines. |
| `stats[]` | object | 432 occurrences |  | `{"property":0,"specialTag":0,"tags":0,"addedValue":0,"inc...` | Stat lines. |
| `stats[].property` | number | 432 occurrences | 0..115 (>12 distinct) | `0` | Stat property id (SP enum, see enums.md). |
| `stats[].specialTag` | number | 432 occurrences | 0..75 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `stats[].tags` | number | 432 occurrences | values 0,1,2,4,8,16,32,64,128,4096,2097152,8388608 | `0` | Tag bit mask (AT enum, see enums.md). |
| `stats[].addedValue` | number | 432 occurrences | 0..10 (>12 distinct) | `0` | Flat added value. |
| `stats[].increasedValue` | number | 432 occurrences | 0..2 (>12 distinct) | `0.2` | Increased (%) value as fraction. |
| `stats[].moreValues` | array | 432 occurrences | len 0..1 | `[]` | List of "more" multipliers as fractions. |
| `rareModifier` | number | 236/287 (82.2%) | values 0,0.1,0.2,2 | `0` |  |
| `scalingType` | number | 236/287 (82.2%) | values 0,1,2 | `0` |  |
| `flatScaling` | number | 236/287 (82.2%) | values 0,1 | `0` |  |
| `perUnit` | number | 236/287 (82.2%) | values 0,0.0025,0.005,0.01,0.1,0.2,1 | `0` |  |
| `perUnitSquared` | number | 236/287 (82.2%) | values 0 | `0` |  |
| `onlyScaleSomeStats` | boolean | 236/287 (82.2%) | values false | `false` |  |
| `numberOfStatsToScale` | number | 236/287 (82.2%) | values 0,1 | `0` |  |
| `type` | number | always | values 0,1,2,3 | `0` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `incompatibleMods[]` | string | 21 occurrences | values "MCwDiA","MJwJiA","MOwDiA","MKwNiA","MBwViA","MBwZiA","MOwBiA","MKwTiA","MJwViA","MBwBiA","MIwBgbEA","MIzAMQ" | `"MCwDiA"` |  |
| `componentName` | string | 14/287 (4.9%) | values "DemoAutoHealSelf","DeadlyIfNotDamagedRecentlyMonsterMod","EnragesMonsterMod","FracturedMonsterMod","FrenziesWhenAlliesDie","NearbyAlliesTakeLessDamageMonsterMod","GainsRampancyMonsterMod","ResurrectsSelfMonsterMod","AutoSummon","TwinnedMonsterMod","GainsPowerWhileInCombatMonsterMod" | `"DemoAutoHealSelf"` |  |
| `trigger` | number | 2/287 (0.7%) | values 1 | `1` |  |
| `ailments` | array | 2/287 (0.7%) | len 1..2 | `[{"ailment":34,"chance":1,"rolledSeparately":false,"incre...` | Ailment list. |
| `ailments[]` | object | 3 occurrences |  | `{"ailment":34,"chance":1,"rolledSeparately":false,"increa...` | Ailment list. |
| `ailments[].ailment` | number | 3 occurrences | values 22,33,34 | `34` | Ailment id (AilmentID enum). |
| `ailments[].chance` | number | 3 occurrences | values 1 | `1` | Chance (0..1). |
| `ailments[].rolledSeparately` | boolean | 3 occurrences | values false | `false` |  |
| `ailments[].increasedDuration` | number | 3 occurrences | values 0 | `0` | Increased duration. |
| `ailments[].increasedEffect` | number | 3 occurrences | values 0 | `0` | Increased effect. |
| `abilityToCast` | string | 2/287 (0.7%) | values "mm_1" | `"mm_1"` |  |
| `castEvent` | number | 2/287 (0.7%) | values 0 | `0` |  |
| `castDelay` | number | 2/287 (0.7%) | values 0 | `0` |  |
| `hasScalableComponents` | boolean | 2/287 (0.7%) | values true,false | `true` |  |
| `pseudoComponentName` | string | 33/287 (11.5%) | >12 distinct | `"EmberMeteorMonsterMod"` |  |
| `modAbility` | string | 33/287 (11.5%) | >12 distinct | `"mm_me27_2"` |  |
| `modVariant` | number | 33/287 (11.5%) | values 0,1 | `0` |  |

Example (key `MAxA`, record #0, trimmed):

```json
{
  "modType": 2,
  "titleKey": null,
  "descriptionKey": null,
  "minilithDescriptionKey": "MonsterMods.Boss Drops Exalted Jewelry T2 Dungeon Mod_M&D_De...",
  "increasedItemRarity": 0,
  "increasedExperience": 0,
  "effectModifierEffect": 0,
  "effectModifierCap": 0,
  "statsWithoutEffectModifier": 0,
  "bonusDrop": {
    "chance": 1,
    "min": 3,
    "max": 3,
    "condition": 3,
    "properties": {
      "itemTypeType": 1,
      "itemType": -1,
      "itemTypeGroup": 2,
      "subType": -1,
      "ilvl": -1,
      "rarityType": 1,
      "rarity": 0,
      "rarityGroup": 5,
      "uniqueID": -1,
      "alwaysRequireClassCompatibility": false,
      "cannotBeGifted": false,
      "hostOnly": false
    }
  },
  "rarityRequirement": 0,
  "minimumLevel": 0,
  "canSpawnInArena": false,
  "incompatibleMods": [],
  "stats": [
    {
      "property": 0,
      "specialTag": 0,
      "tags": 0,
      "addedValue": 0,
      "increasedValue": 0.2,
      "moreValues": []
    },
    {
      "property": 7,
      "specialTag": 0,
      "tags": 0,
      "addedValue": 0,
      "increasedValue": 0.3,
      "moreValues": []
    }
  ],
  "rareModifier": 0,
  "scalingType": 0,
  "flatScaling": 0,
  "perUnit": 0,
  "perUnitSquared": 0,
  "onlyScaleSomeStats": false,
  "numberOfStatsToScale": 0,
  "type": 0
}
```

### `monsterMods[*].stats[]`

- **Location:** `monsterMods.<id>.stats[]` (file: endgame)
- **Keying:** array
- **Record count:** 432

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `property` | number | always | 0..115 (>12 distinct) | `0` | Stat property id (SP enum, see enums.md). |
| `specialTag` | number | always | 0..75 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `tags` | number | always | values 0,1,2,4,8,16,32,64,128,4096,2097152,8388608 | `0` | Tag bit mask (AT enum, see enums.md). |
| `addedValue` | number | always | 0..10 (>12 distinct) | `0` | Flat added value. |
| `increasedValue` | number | always | 0..2 (>12 distinct) | `0.2` | Increased (%) value as fraction. |
| `moreValues` | array | always | len 0..1 | `[]` | List of "more" multipliers as fractions. |
| `moreValues[]` | number | 15 occurrences | values -0.75,-0.35,-0.25,0.005,0.01,0.08,0.3,0.35,0.4,3 | `-0.25` | List of "more" multipliers as fractions. |

Example (record #0, trimmed):

```json
{
  "property": 0,
  "specialTag": 0,
  "tags": 0,
  "addedValue": 0,
  "increasedValue": 0.2,
  "moreValues": []
}
```

### `timelineData`

- **Location:** `timelineData` (file: endgame)
- **Keying:** object keyed by timeline id 1..10
- **Record count:** 10
- **Key space:** 10 keys, numeric 1..10

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `id` | number | always | values 1,2,3,4,5,6,7,8,9,10 | `1` | Record identifier (type depends on collection; see ids.md). |
| `slug` | string | always | values "fall-of-the-outcasts","the-stolen-lance","the-black-sun","blood-frost-and-death","ending-the-storm","fall-of-the-empire","reign-of-dragons","the-last-ruin","the-age-of-winter","spirits-of-fire" | `"fall-of-the-outcasts"` | URL-safe name. |
| `nameKey` | string | always | values "MapObjects.Island_Name_Fall of the O...","MapObjects.Island_Name_The Stolen La...","MapObjects.Island_Name_The Black Sun","MapObjects.Island_Name_Blood, Frost,...","MapObjects.Island_Name_Ending the St...","MapObjects.Island_Name_Fall of the E...","MapObjects.Island_Name_Reign of Drag...","MapObjects.Island_Name_The Last Ruin","MapObjects.Island_Name_The Age of Wi...","MapObjects.Island_Name_Spirits of Fire" | `"MapObjects.Island_Name_Fall of the Outcasts"` | i18n key (en.json) for the name. |
| `difficulties` | array | always | len 2..2 | `[{"level":62,"requirements":[],"modEffectModifier":0,"ech...` | Per-difficulty definitions. |
| `difficulties[]` | object | 20 occurrences |  | `{"level":62,"requirements":[],"modEffectModifier":0,"echo...` | Per-difficulty definitions. |
| `difficulties[].level` | number | 20 occurrences | values 62,66,70,74,78,82,85,90,100 | `62` | Level. |
| `difficulties[].requirements` | array | 20 occurrences | len 0..3 | `[]` | Prerequisites: [{nodeId, requirement}] (see enums.md). |
| `difficulties[].modEffectModifier` | number | 20 occurrences | values 0 | `0` | Mod effect modifier. |
| `difficulties[].echoesLostOnDeathModifier` | number | 20 occurrences | values 0 | `0` |  |
| `difficulties[].maxStability` | number | 20 occurrences | values 500,550,600,750,800,900,1000,1600,1700,1800 | `500` | Max stability. |
| `difficulties[].firstSlotBlessings` | array | 20 occurrences | len 0..3 | `[]` | Blessing sub types allowed in first slot. |
| `difficulties[].otherSlotBlessings` | array | 20 occurrences | len 0..10 | `[0,2,4,6,8,10,12]` | Blessing sub types for other slots. |
| `difficulties[].anySlotBlessings` | array | 20 occurrences | len 0..12 | `[111,113,115]` | Blessing sub types for any slot. |
| `difficulties[].hasCorruptionMod` | boolean | 20 occurrences | values true | `true` |  |
| `difficulties[].modFromCorruption` | string | 20 occurrences | values "MIzDMQ" | `"MIzDMQ"` | Monster mod id applied from corruption. |
| `difficulties[].minimumCorruption` | number | 20 occurrences | values 0,100 | `0` | Min corruption. |
| `difficulties[].hasMaxCorruption` | boolean | 20 occurrences | values true,false | `true` | Has max corruption. |
| `difficulties[].maximumCorruption` | number | 20 occurrences | values 0,50 | `50` | Max corruption. |
| `difficulties[].additionalCorruptionEffect` | number | 20 occurrences | values 1,2 | `1` | Added corruption effect. |
| `difficulties[].corruptionRequiredPerLevel` | number | 20 occurrences | values 0,5,10 | `5` | Corruption required per level. |
| `mods` | array | always | len 17..28 | `[{"mod":"MCwNiA","minimumDepth":0,"hasMaximumDepth":false...` | Mod list. |
| `mods[]` | object | 238 occurrences |  | `{"mod":"MCwNiA","minimumDepth":0,"hasMaximumDepth":false,...` | Mod list. |
| `mods[].mod` | string | 238 occurrences | >12 distinct | `"MCwNiA"` | Monster-mod compact id. |
| `mods[].minimumDepth` | number | 238 occurrences | values 0,4,6,8 | `0` | Min depth. |
| `mods[].hasMaximumDepth` | boolean | 238 occurrences | values false,true | `false` | Has max depth. |
| `mods[].maximumDepth` | number | 238 occurrences | values 0,10 | `0` | Max depth. |
| `empoweredMods` | array | always | len 17..25 | `[{"mod":"MCwNiA","minimumDepth":0,"hasMaximumDepth":false...` | Empowered mod list. |
| `empoweredMods[]` | object | 215 occurrences |  | `{"mod":"MCwNiA","minimumDepth":0,"hasMaximumDepth":false,...` | Empowered mod list. |
| `empoweredMods[].mod` | string | 215 occurrences | >12 distinct | `"MCwNiA"` | Monster-mod compact id. |
| `empoweredMods[].minimumDepth` | number | 215 occurrences | values 0 | `0` | Min depth. |
| `empoweredMods[].hasMaximumDepth` | boolean | 215 occurrences | values false | `false` | Has max depth. |
| `empoweredMods[].maximumDepth` | number | 215 occurrences | values 0 | `0` | Max depth. |
| `minimumModDuration` | array | always | len 2..2 | `[{"duration":1,"requirement":0},{"duration":2,"requiremen...` |  |
| `minimumModDuration[]` | object | 20 occurrences |  | `{"duration":1,"requirement":0}` |  |
| `minimumModDuration[].duration` | number | 20 occurrences | values 1,2 | `1` | Duration in seconds. |
| `minimumModDuration[].requirement` | number | 20 occurrences | values 0,4 | `0` | Points that must be allocated in node nodeId before this node unlocks (0 = plain link; 1..5; see enums.md). |
| `maximumModDuration` | array | always | len 3..3 | `[{"duration":1,"requirement":0},{"duration":2,"requiremen...` |  |
| `maximumModDuration[]` | object | 30 occurrences |  | `{"duration":1,"requirement":0}` |  |
| `maximumModDuration[].duration` | number | 30 occurrences | values 1,2,3 | `1` | Duration in seconds. |
| `maximumModDuration[].requirement` | number | 30 occurrences | values 0,2,6 | `0` | Points that must be allocated in node nodeId before this node unlocks (0 = plain link; 1..5; see enums.md). |
| `modEffectivenessFormulae` | array | always | len 1..1 | `[{"depthThreshold":0,"baseModifier":0,"modifierPerDepthAb...` |  |
| `modEffectivenessFormulae[]` | object | 10 occurrences |  | `{"depthThreshold":0,"baseModifier":0,"modifierPerDepthAbo...` |  |
| `modEffectivenessFormulae[].depthThreshold` | number | 10 occurrences | values 0 | `0` |  |
| `modEffectivenessFormulae[].baseModifier` | number | 10 occurrences | values 0 | `0` |  |
| `modEffectivenessFormulae[].modifierPerDepthAboveThreshold` | number | 10 occurrences | values 0 | `0` |  |
| `minEnemyTypes` | number | always | values 5,6 | `5` |  |
| `maxEnemyTypes` | number | always | values 8 | `8` |  |
| `arenaEnemyTypes` | number | always | values 10 | `10` |  |
| `enemySimilarityModifier` | number | always | values 0 | `0` |  |
| `enemyDensityModifier` | number | always | values 0.1 | `0.1` |  |
| `maxTierForNonShadeEchoes` | number | always | values 19 | `19` |  |
| `minTierForArena` | number | always | values 3 | `3` |  |
| `minTierForShade` | number | always | values 11 | `11` |  |
| `minTierForBeacon` | number | always | values 4 | `4` |  |
| `minTierForVesselOfChaos` | number | always | values 7 | `7` |  |
| `minTierForVesselOfMemory` | number | always | values 9 | `9` |  |
| `minTierForTreasureRoom` | number | always | values 6 | `6` |  |
| `minTierForSoulSealedEcho` | number | always | values 7 | `7` |  |
| `normalEchoWeigthing` | number | always | values 5.2 | `5.2` |  |
| `arenaEchoWeigthing` | number | always | values 0.8 | `0.8` |  |
| `beaconEchoWeighting` | number | always | values 0.36 | `0.36` |  |
| `vesselOfChaosWeighting` | number | always | values 0.25 | `0.25` |  |
| `vesselOfMemoryWeighting` | number | always | values 0.12 | `0.12` |  |
| `treasureRoomWeighting` | number | always | values 0 | `0` |  |
| `shadeEchoChanceSteepness` | number | always | values 2.2 | `2.2` |  |
| `startingShadeEchoChance` | number | always | values 0.15 | `0.15` |  |
| `extraShadeSpawnConditionAt0Corruption` | number | always | values 0,2 | `2` |  |
| `echoesRevealedNeededForShadeAt0Corruption` | number | always | values 0,70 | `70` |  |
| `tierAtWhichShadeCanAlwaysSpawn` | number | always | values 0,16 | `16` |  |
| `bossNameKey` | string | always | values "Actors.Actor_Name_Abomination","Actors.Actor_Name_God Hunter Argentus","Actors.Actor_Name_Rahyeh, The Black ...","Actors.Actor_Name_Formosus the Undying","Actors.Actor_Name_Lagon, God of Storms","Actors.Actor_Name_Harton's Husk","Actors.Actor_Name_Emperor of Corpses","Actors.Actor_Name_The Husk of Elder ...","Actors.Actor_Name_Heorot","Actors.Actor_Name_Volcanic Shaman" | `"Actors.Actor_Name_Abomination"` | Boss name i18n key. |
| `harbingerNameKey` | string | always | values "Actors.Actor_Name_Harbinger of Defil...","Actors.Actor_Name_Harbinger of Pride","Actors.Actor_Name_Harbinger of Hatred","Actors.Actor_Name_Harbinger of War","Actors.Actor_Name_Harbinger of Chaos","Actors.Actor_Name_Harbinger of Treason","Actors.Actor_Name_Harbinger of Destr...","Actors.Actor_Name_Harbinger of Fear","Actors.Actor_Name_Harbinger of Tyranny","Actors.Actor_Name_Harbinger of Ash" | `"Actors.Actor_Name_Harbinger of Defilement"` |  |
| `soulSealedEchoWeighting` | number | always | values 0 | `0` |  |

Example (key `1`, record #0, trimmed):

```json
{
  "id": 1,
  "slug": "fall-of-the-outcasts",
  "nameKey": "MapObjects.Island_Name_Fall of the Outcasts",
  "difficulties": [
    {
      "level": 62,
      "requirements": [],
      "modEffectModifier": 0,
      "echoesLostOnDeathModifier": 0,
      "maxStability": 500,
      "firstSlotBlessings": [],
      "otherSlotBlessings": [0, 2, "...(+5 more)"],
      "anySlotBlessings": [111, 113, "...(+1 more)"],
      "hasCorruptionMod": true,
      "modFromCorruption": "MIzDMQ",
      "minimumCorruption": 0,
      "hasMaxCorruption": true,
      "maximumCorruption": 50,
      "additionalCorruptionEffect": 1,
      "corruptionRequiredPerLevel": 5
    },
    {
      "level": 100,
      "requirements": [
        {"id": 7, "completionType": 0}
      ],
      "modEffectModifier": 0,
      "echoesLostOnDeathModifier": 0,
      "maxStability": 1600,
      "firstSlotBlessings": [],
      "otherSlotBlessings": [1, 3, "...(+5 more)"],
      "anySlotBlessings": [112, 114, "...(+1 more)"],
      "hasCorruptionMod": true,
      "modFromCorruption": "MIzDMQ",
      "minimumCorruption": 100,
      "hasMaxCorruption": false,
      "maximumCorruption": 0,
      "additionalCorruptionEffect": 2,
      "corruptionRequiredPerLevel": 0
    }
  ],
  "mods": [
    {"mod": "MCwNiA", "minimumDepth": 0, "hasMaximumDepth": false, "maximumDepth": 0},
    {"mod": "MCwdiA", "minimumDepth": 0, "hasMaximumDepth": false, "maximumDepth": 0},
    "...(+24 more)"
  ],
  "empoweredMods": [
    {"mod": "MCwNiA", "minimumDepth": 0, "hasMaximumDepth": false, "maximumDepth": 0},
    {"mod": "MCwdiA", "minimumDepth": 0, "hasMaximumDepth": false, "maximumDepth": 0},
    "...(+21 more)"
  ],
  "minimumModDuration": [
    {"duration": 1, "requirement": 0},
    {"duration": 2, "requirement": 4}
  ],
  "maximumModDuration": [
    {"duration": 1, "requirement": 0},
    {"duration": 2, "requirement": 2},
    "...(+1 more)"
  ],
  "modEffectivenessFormulae": [
    {"depthThreshold": 0, "baseModifier": 0, "modifierPerDepthAboveThreshold": 0}
  ],
  "minEnemyTypes": 5,
  "maxEnemyTypes": 8,
  "arenaEnemyTypes": 10,
  "enemySimilarityModifier": 0,
  "enemyDensityModifier": 0.1,
  "maxTierForNonShadeEchoes": 19,
  "minTierForArena": 3,
  "minTierForShade": 11,
  "minTierForBeacon": 4,
  "minTierForVesselOfChaos": 7,
  "minTierForVesselOfMemory": 9,
  "minTierForTreasureRoom": 6,
  "minTierForSoulSealedEcho": 7,
  "normalEchoWeigthing": 5.2,
  "arenaEchoWeigthing": 0.8,
  "beaconEchoWeighting": 0.36,
  "vesselOfChaosWeighting": 0.25,
  "vesselOfMemoryWeighting": 0.12,
  "treasureRoomWeighting": 0,
  "shadeEchoChanceSteepness": 2.2,
  "startingShadeEchoChance": 0.15,
  "extraShadeSpawnConditionAt0Corruption": 2,
  "echoesRevealedNeededForShadeAt0Corruption": 70,
  "tierAtWhichShadeCanAlwaysSpawn": 16,
  "bossNameKey": "Actors.Actor_Name_Abomination",
  "...": "+2 more keys"
}
```

### `timelineData[*].difficulties[]`

- **Location:** `timelineData.<id>.difficulties[]` (file: endgame)
- **Keying:** array
- **Record count:** 20

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `level` | number | always | values 62,66,70,74,78,82,85,90,100 | `62` | Level. |
| `requirements` | array | always | len 0..3 | `[]` | Prerequisites: [{nodeId, requirement}] (see enums.md). |
| `modEffectModifier` | number | always | values 0 | `0` | Mod effect modifier. |
| `echoesLostOnDeathModifier` | number | always | values 0 | `0` |  |
| `maxStability` | number | always | values 500,550,600,750,800,900,1000,1600,1700,1800 | `500` | Max stability. |
| `firstSlotBlessings` | array | always | len 0..3 | `[]` | Blessing sub types allowed in first slot. |
| `otherSlotBlessings` | array | always | len 0..10 | `[0,2,4,6,8,10,12]` | Blessing sub types for other slots. |
| `otherSlotBlessings[]` | number | 118 occurrences | 0..223 (>12 distinct) | `0` | Blessing sub types for other slots. |
| `anySlotBlessings` | array | always | len 0..12 | `[111,113,115]` | Blessing sub types for any slot. |
| `anySlotBlessings[]` | number | 70 occurrences | 14..179 (>12 distinct) | `111` | Blessing sub types for any slot. |
| `hasCorruptionMod` | boolean | always | values true | `true` |  |
| `modFromCorruption` | string | always | values "MIzDMQ" | `"MIzDMQ"` | Monster mod id applied from corruption. |
| `minimumCorruption` | number | always | values 0,100 | `0` | Min corruption. |
| `hasMaxCorruption` | boolean | always | values true,false | `true` | Has max corruption. |
| `maximumCorruption` | number | always | values 0,50 | `50` | Max corruption. |
| `additionalCorruptionEffect` | number | always | values 1,2 | `1` | Added corruption effect. |
| `corruptionRequiredPerLevel` | number | always | values 0,5,10 | `5` | Corruption required per level. |
| `requirements[]` | object | 12 occurrences |  | `{"id":7,"completionType":0}` | Prerequisites: [{nodeId, requirement}] (see enums.md). |
| `requirements[].id` | number | 12 occurrences | values 7,8,9,10 | `7` | Record identifier (type depends on collection; see ids.md). |
| `requirements[].completionType` | number | 12 occurrences | values 0 | `0` |  |
| `firstSlotBlessings[]` | number | 36 occurrences | 24..207 (>12 distinct) | `24` | Blessing sub types allowed in first slot. |

Example (record #1, trimmed):

```json
{
  "level": 100,
  "requirements": [
    {"id": 7, "completionType": 0}
  ],
  "modEffectModifier": 0,
  "echoesLostOnDeathModifier": 0,
  "maxStability": 1600,
  "firstSlotBlessings": [],
  "otherSlotBlessings": [1, 3, "...(+5 more)"],
  "anySlotBlessings": [112, 114, "...(+1 more)"],
  "hasCorruptionMod": true,
  "modFromCorruption": "MIzDMQ",
  "minimumCorruption": 100,
  "hasMaxCorruption": false,
  "maximumCorruption": 0,
  "additionalCorruptionEffect": 2,
  "corruptionRequiredPerLevel": 0
}
```

### `timelineData[*].mods[]`

- **Location:** `timelineData.<id>.mods[]` (file: endgame)
- **Keying:** array
- **Record count:** 238

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `mod` | string | always | >12 distinct | `"MCwNiA"` | Monster-mod compact id. |
| `minimumDepth` | number | always | values 0,4,6,8 | `0` | Min depth. |
| `hasMaximumDepth` | boolean | always | values false,true | `false` | Has max depth. |
| `maximumDepth` | number | always | values 0,10 | `0` | Max depth. |

Example (record #0, trimmed):

```json
{"mod": "MCwNiA", "minimumDepth": 0, "hasMaximumDepth": false, "maximumDepth": 0}
```

### `dungeonData`

- **Location:** `dungeonData` (file: endgame)
- **Keying:** object keyed 1..3
- **Record count:** 3
- **Key space:** 3 keys, numeric 1..3

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `id` | number | always | values 1,2,3 | `1` | Record identifier (type depends on collection; see ids.md). |
| `slug` | string | always | values "temporal-sanctum","lightless-arbor","soulfire-bastion" | `"temporal-sanctum"` | URL-safe name. |
| `nameKey` | string | always | values "MapObjects.Dungeon_ID_Dungeon1","MapObjects.Dungeon_ID_LightlessArbor","MapObjects.Dungeon_ID_SoulfireBastion" | `"MapObjects.Dungeon_ID_Dungeon1"` | i18n key (en.json) for the name. |
| `tiers` | array | always | len 4..4 | `[{"level":55,"unlockedByCharacterLevel":0,"characterLevel...` | Tier list. |
| `tiers[]` | object | 12 occurrences |  | `{"level":55,"unlockedByCharacterLevel":0,"characterLevelR...` | Tier list. |
| `tiers[].level` | number | 12 occurrences | values 20,45,55,65,75,80,88,92,95,100 | `55` | Level. |
| `tiers[].unlockedByCharacterLevel` | number | 12 occurrences | values 0,1 | `0` |  |
| `tiers[].characterLevelRequiredToUnlock` | number | 12 occurrences | values 0,55 | `0` |  |
| `tiers[].appliesModOnRunStart` | boolean | 12 occurrences | values true | `true` |  |
| `tiers[].startingMods` | array | 12 occurrences | len 1..16 | `["MEwVgjEA"]` | Mods applied at start. |
| `tiers[].otherFloorExitMods` | array | 12 occurrences | len 6..8 | `["MEwViA","MEwDiA","MMwRiA","MMwFiA","MMwdiA","MCwBiA","M...` | Mods at other floor exits. |
| `tiers[].penultimateFloorExitMods` | array | 12 occurrences | len 5..9 | `["MAxA","MMxA","MGxA","MIwBiA","MIwZiA","MIwNiA"]` | Mods at penultimate floor exit. |
| `bossNameKey` | string | always | values "Actors.Actor_Name_Chronomancer Julra","Actors.Actor_Name_The Mountain Beneath","Actors.Actor_Name_Fire Lich Cremorus" | `"Actors.Actor_Name_Chronomancer Julra"` | Boss name i18n key. |
| `location` | object | always |  | `{"areaKey":"Scenes.Scene_Name_Dun1Q10","eraKey":"Common.E...` | Map location. |
| `location.areaKey` | string | always | values "Scenes.Scene_Name_Dun1Q10","Scenes.Scene_Name_Dun2Q10","Scenes.Scene_Name_Dun3Q10" | `"Scenes.Scene_Name_Dun1Q10"` |  |
| `location.eraKey` | string | always | values "Common.Era_Name_Ruined","Common.Era_Name_Imperial" | `"Common.Era_Name_Ruined"` |  |
| `key` | array | always | len 1..1 | `["IIzAMBZQrSA"]` | Opaque id/key. |
| `key[]` | string | 3 occurrences | values "IIzAMBZQrSA","IIzAMBZVBWLSA","IIzAMBZVA2LSA" | `"IIzAMBZQrSA"` | Opaque id/key. |

Example (key `1`, record #0, trimmed):

```json
{
  "id": 1,
  "slug": "temporal-sanctum",
  "nameKey": "MapObjects.Dungeon_ID_Dungeon1",
  "tiers": [
    {
      "level": 55,
      "unlockedByCharacterLevel": 0,
      "characterLevelRequiredToUnlock": 0,
      "appliesModOnRunStart": true,
      "startingMods": ["MEwVgjEA"],
      "otherFloorExitMods": ["MEwViA", "MEwDiA", "...(+5 more)"],
      "penultimateFloorExitMods": ["MAxA", "MMxA", "...(+4 more)"]
    },
    {
      "level": 80,
      "unlockedByCharacterLevel": 0,
      "characterLevelRequiredToUnlock": 0,
      "appliesModOnRunStart": true,
      "startingMods": ["MAxA", "MCwBiA", "...(+9 more)"],
      "otherFloorExitMods": ["MEwViA", "MEwDiA", "...(+5 more)"],
      "penultimateFloorExitMods": ["MAxA", "MMxA", "...(+5 more)"]
    },
    "...(+2 more)"
  ],
  "bossNameKey": "Actors.Actor_Name_Chronomancer Julra",
  "location": {"areaKey": "Scenes.Scene_Name_Dun1Q10", "eraKey": "Common.Era_Name_Ruined"},
  "key": ["IIzAMBZQrSA"]
}
```

### `dungeonData[*].tiers[]`

- **Location:** `dungeonData.<id>.tiers[]` (file: endgame)
- **Keying:** array
- **Record count:** 12

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `level` | number | always | values 20,45,55,65,75,80,88,92,95,100 | `55` | Level. |
| `unlockedByCharacterLevel` | number | always | values 0,1 | `0` |  |
| `characterLevelRequiredToUnlock` | number | always | values 0,55 | `0` |  |
| `appliesModOnRunStart` | boolean | always | values true | `true` |  |
| `startingMods` | array | always | len 1..16 | `["MEwVgjEA"]` | Mods applied at start. |
| `startingMods[]` | string | 107 occurrences | >12 distinct | `"MEwVgjEA"` | Mods applied at start. |
| `otherFloorExitMods` | array | always | len 6..8 | `["MEwViA","MEwDiA","MMwRiA","MMwFiA","MMwdiA","MCwBiA","M...` | Mods at other floor exits. |
| `otherFloorExitMods[]` | string | 83 occurrences | >12 distinct | `"MEwViA"` | Mods at other floor exits. |
| `penultimateFloorExitMods` | array | always | len 5..9 | `["MAxA","MMxA","MGxA","MIwBiA","MIwZiA","MIwNiA"]` | Mods at penultimate floor exit. |
| `penultimateFloorExitMods[]` | string | 93 occurrences | >12 distinct | `"MAxA"` | Mods at penultimate floor exit. |

Example (record #1, trimmed):

```json
{
  "level": 80,
  "unlockedByCharacterLevel": 0,
  "characterLevelRequiredToUnlock": 0,
  "appliesModOnRunStart": true,
  "startingMods": ["MAxA", "MCwBiA", "...(+9 more)"],
  "otherFloorExitMods": ["MEwViA", "MEwDiA", "...(+5 more)"],
  "penultimateFloorExitMods": ["MAxA", "MMxA", "...(+5 more)"]
}
```

### `arenaData`

- **Location:** `arenaData` (file: endgame)
- **Keying:** object keyed 1..2
- **Record count:** 2
- **Key space:** 2 keys, numeric 1..2

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `id` | number | always | values 1,2 | `1` | Record identifier (type depends on collection; see ids.md). |
| `slug` | string | always | values "arena-of-champions","endless-arena" | `"arena-of-champions"` | URL-safe name. |
| `nameKey` | string | always | values "UI.Arena_Tooltip_Title","UI.ArenaEnter_Panel_TierSelection_En..." | `"UI.Arena_Tooltip_Title"` | i18n key (en.json) for the name. |
| `tiers` | array | always | len 1..4 | `[{"level":50,"tierType":0,"scaleUpFromCharacterLevel":0,"...` | Tier list. |
| `tiers[]` | object | 5 occurrences |  | `{"level":50,"tierType":0,"scaleUpFromCharacterLevel":0,"w...` | Tier list. |
| `tiers[].level` | number | 5 occurrences | values 50,70,90,100 | `50` | Level. |
| `tiers[].tierType` | number | 5 occurrences | values 0,1 | `0` |  |
| `tiers[].scaleUpFromCharacterLevel` | number | 5 occurrences | values 0,1 | `0` |  |
| `tiers[].waveForReachingMaxLevel` | number | 5 occurrences | values 80,100 | `100` |  |
| `tiers[].unlockRequirement` | number | 5 occurrences | values 0,1,2 | `0` |  |
| `tiers[].requiredTierToCompleteToUnlock` | number | 5 occurrences | values 0,1,2 | `0` |  |
| `tiers[].rquiredCharacterLevelToReachToUnlock` | number | 5 occurrences | values 0,60 | `0` |  |
| `tiers[].wavesPerZone` | number | 5 occurrences | values 10 | `10` |  |
| `tiers[].championWave` | number | 5 occurrences | values 40,90 | `40` |  |
| `tiers[].addedEffectiveWaveForScaling` | number | 5 occurrences | values 0,50,100,150 | `0` |  |
| `tiers[].appliesModOnRunStart` | boolean | 5 occurrences | values false,true | `false` |  |
| `tiers[].startingMods` | array | 5 occurrences | len 0..7 | `[]` | Mods applied at start. |
| `tiers[].modPools` | array | 5 occurrences | len 0..3 | `[{"waveOfferedAfter":10,"firstOptionMods":[],"secondOptio...` |  |
| `bossNameKeys` | array | always | len 3..3 | `["Actors.Actor_Name_The Crimson Blade","Actors.Actor_Name...` | Boss name i18n keys. |
| `bossNameKeys[]` | string | 6 occurrences | values "Actors.Actor_Name_The Crimson Blade","Actors.Actor_Name_Alfrig Wolfmaw","Actors.Actor_Name_Vaion the Arsenal" | `"Actors.Actor_Name_The Crimson Blade"` | Boss name i18n keys. |
| `location` | object | always |  | `{"areaKey":"Scenes.Scene_Name_ArenaLobby","eraKey":"Commo...` | Map location. |
| `location.areaKey` | string | always | values "Scenes.Scene_Name_ArenaLobby" | `"Scenes.Scene_Name_ArenaLobby"` |  |
| `location.eraKey` | string | always | values "Common.Era_Name_Divine" | `"Common.Era_Name_Divine"` |  |
| `key` | array | always | len 2..2 | `["IIzAMBZS6g","IIzAMBZVBmLSA"]` | Opaque id/key. |
| `key[]` | string | 4 occurrences | values "IIzAMBZS6g","IIzAMBZVBmLSA" | `"IIzAMBZS6g"` | Opaque id/key. |

Example (key `1`, record #0, trimmed):

```json
{
  "id": 1,
  "slug": "arena-of-champions",
  "nameKey": "UI.Arena_Tooltip_Title",
  "tiers": [
    {
      "level": 50,
      "tierType": 0,
      "scaleUpFromCharacterLevel": 0,
      "waveForReachingMaxLevel": 100,
      "unlockRequirement": 0,
      "requiredTierToCompleteToUnlock": 0,
      "rquiredCharacterLevelToReachToUnlock": 0,
      "wavesPerZone": 10,
      "championWave": 40,
      "addedEffectiveWaveForScaling": 0,
      "appliesModOnRunStart": false,
      "startingMods": [],
      "modPools": [
        {
          "waveOfferedAfter": 10,
          "firstOptionMods": [],
          "secondOptionMods": [],
          "anyOptionMods": ["MEwBgjEA", "MEwBmQ", "...(+5 more)"]
        },
        {
          "waveOfferedAfter": 20,
          "firstOptionMods": ["MEwZgDEA", "MEwZgjEA", "...(+4 more)"],
          "secondOptionMods": [],
          "anyOptionMods": ["MEwBgjEA", "MEwBmQ", "...(+5 more)"]
        },
        "...(+1 more)"
      ]
    },
    {
      "level": 70,
      "tierType": 0,
      "scaleUpFromCharacterLevel": 0,
      "waveForReachingMaxLevel": 100,
      "unlockRequirement": 1,
      "requiredTierToCompleteToUnlock": 0,
      "rquiredCharacterLevelToReachToUnlock": 0,
      "wavesPerZone": 10,
      "championWave": 40,
      "addedEffectiveWaveForScaling": 50,
      "appliesModOnRunStart": true,
      "startingMods": ["MEwBgrEA", "MEwBmQ", "...(+4 more)"],
      "modPools": [
        {
          "waveOfferedAfter": 10,
          "firstOptionMods": [],
          "secondOptionMods": [],
          "anyOptionMods": ["MEwBgjEA", "MEwBmQ", "...(+5 more)"]
        },
        {
          "waveOfferedAfter": 20,
          "firstOptionMods": ["MEwZgDEA", "MEwZgjEA", "...(+3 more)"],
          "secondOptionMods": [],
          "anyOptionMods": ["MEwBgjEA", "MEwBmQ", "...(+5 more)"]
        },
        "...(+1 more)"
      ]
    },
    "...(+2 more)"
  ],
  "bossNameKeys": ["Actors.Actor_Name_The Crimson Blade", "Actors.Actor_Name_Alfrig Wolfmaw", "...(+1 more)"],
  "location": {"areaKey": "Scenes.Scene_Name_ArenaLobby", "eraKey": "Common.Era_Name_Divine"},
  "key": ["IIzAMBZS6g", "IIzAMBZVBmLSA"]
}
```

### `arenaData[*].tiers[]`

- **Location:** `arenaData.<id>.tiers[]` (file: endgame)
- **Keying:** array
- **Record count:** 5

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `level` | number | always | values 50,70,90,100 | `50` | Level. |
| `tierType` | number | always | values 0,1 | `0` |  |
| `scaleUpFromCharacterLevel` | number | always | values 0,1 | `0` |  |
| `waveForReachingMaxLevel` | number | always | values 80,100 | `100` |  |
| `unlockRequirement` | number | always | values 0,1,2 | `0` |  |
| `requiredTierToCompleteToUnlock` | number | always | values 0,1,2 | `0` |  |
| `rquiredCharacterLevelToReachToUnlock` | number | always | values 0,60 | `0` |  |
| `wavesPerZone` | number | always | values 10 | `10` |  |
| `championWave` | number | always | values 40,90 | `40` |  |
| `addedEffectiveWaveForScaling` | number | always | values 0,50,100,150 | `0` |  |
| `appliesModOnRunStart` | boolean | always | values false,true | `false` |  |
| `startingMods` | array | always | len 0..7 | `[]` | Mods applied at start. |
| `modPools` | array | always | len 0..3 | `[{"waveOfferedAfter":10,"firstOptionMods":[],"secondOptio...` |  |
| `modPools[]` | object | 12 occurrences |  | `{"waveOfferedAfter":10,"firstOptionMods":[],"secondOption...` |  |
| `modPools[].waveOfferedAfter` | number | 12 occurrences | values 10,20,30 | `10` |  |
| `modPools[].firstOptionMods` | array | 12 occurrences | len 0..6 | `[]` |  |
| `modPools[].secondOptionMods` | array | 12 occurrences | len 0..5 | `[]` |  |
| `modPools[].anyOptionMods` | array | 12 occurrences | len 0..8 | `["MEwBgjEA","MEwBmQ","MEwBgzEA","MEwBgLEA","MEwBgrEA","ME...` |  |
| `startingMods[]` | string | 19 occurrences | >12 distinct | `"MEwBgrEA"` | Mods applied at start. |

Example (record #1, trimmed):

```json
{
  "level": 70,
  "tierType": 0,
  "scaleUpFromCharacterLevel": 0,
  "waveForReachingMaxLevel": 100,
  "unlockRequirement": 1,
  "requiredTierToCompleteToUnlock": 0,
  "rquiredCharacterLevelToReachToUnlock": 0,
  "wavesPerZone": 10,
  "championWave": 40,
  "addedEffectiveWaveForScaling": 50,
  "appliesModOnRunStart": true,
  "startingMods": ["MEwBgrEA", "MEwBmQ", "...(+4 more)"],
  "modPools": [
    {
      "waveOfferedAfter": 10,
      "firstOptionMods": [],
      "secondOptionMods": [],
      "anyOptionMods": ["MEwBgjEA", "MEwBmQ", "...(+5 more)"]
    },
    {
      "waveOfferedAfter": 20,
      "firstOptionMods": ["MEwZgDEA", "MEwZgjEA", "...(+3 more)"],
      "secondOptionMods": [],
      "anyOptionMods": ["MEwBgjEA", "MEwBmQ", "...(+5 more)"]
    },
    "...(+1 more)"
  ]
}
```

### `wovenEchoList`

- **Location:** `wovenEchoList` (file: endgame)
- **Keying:** array
- **Record count:** 47

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `id` | number | always | 2..49 (>12 distinct) | `2` | Record identifier (type depends on collection; see ids.md). |
| `slug` | string | always | >12 distinct | `"false-temple"` | URL-safe name. |
| `displayNameKey` | string | always | >12 distinct | `"Monolith_Timelines.Woven_Echo_Name_ManyShrines"` | i18n key for the display name. |
| `descriptionKey` | string | always | >12 distinct | `"Monolith_Timelines.Woven_Echo_Description_ManyShrines"` | i18n key for the description. |
| `specialObjectiveText` | array | always | len 0..12 | `[]` |  |
| `contentType` | number | always | values 0,1,2 | `0` | Woven echo content type. |
| `minPlacementCorruption` | number | always | values 0,100,200,300,400,500 | `0` |  |
| `dropWeighting` | number | always | values 0,0.02,0.04,0.05,0.08,0.1,0.15,0.25 | `0.1` | Drop weight. |
| `minimumDropLevel` | number | always | values 0,75,90,100 | `0` | Min area level for drops. |
| `minimumDropCorruption` | number | always | values 0,200 | `0` |  |
| `naturalEchoWebSpawnRate` | number | always | values 0.005,0.01,0.02,0.03,0.04,0.05,0.1 | `0.1` |  |
| `weaverPointsForCompletion` | number | always | values 0,1,2 | `1` | Weaver points for completion. |
| `purchasableFromWeaverVendor` | boolean | always | values true,false | `true` | Vendor flag. |
| `requiredWeaverVendorRank` | number | always | values 0,1,2,3,4,5,6,7,8,9,10 | `1` | Vendor rank. |
| `wovenEchoCost` | number | always | 0..10000 (>12 distinct) | `750` | Cost. |
| `unobtainableThroughReweaving` | boolean | always | values false,true | `false` | Flag. |
| `specialObjectiveText[]` | string | 93 occurrences | >12 distinct | `"MonolithObjectives.Monolith_Objective_Woven_Echo_Nemesis...` |  |

Example (record #2, trimmed):

```json
{
  "id": 4,
  "slug": "conquered-tower",
  "displayNameKey": "Monolith_Timelines.Woven_Echo_Name_NemesisTower",
  "descriptionKey": "Monolith_Timelines.Woven_Echo_Description_NemesisTower",
  "specialObjectiveText": ["MonolithObjectives.Monolith_Objective_Woven_Echo_NemesisTowe...", "MonolithObjectives.Monolith_Objective_Woven_Echo_NemesisTowe..."],
  "contentType": 0,
  "minPlacementCorruption": 0,
  "dropWeighting": 0.08,
  "minimumDropLevel": 0,
  "minimumDropCorruption": 0,
  "naturalEchoWebSpawnRate": 0.02,
  "weaverPointsForCompletion": 1,
  "purchasableFromWeaverVendor": true,
  "requiredWeaverVendorRank": 4,
  "wovenEchoCost": 2000,
  "unobtainableThroughReweaving": false
}
```

### `monolithRewards.monolithRewards`

- **Location:** `monolithRewards.monolithRewards[]` (file: endgame)
- **Keying:** array
- **Record count:** 57

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `titleKey` | string | always | >12 distinct | `"MapObjects.Droppable_Reward_Name_Piles of Gold"` | i18n key for a title. |
| `rewardType` | number | always | 1..18 (>12 distinct) | `1` |  |
| `weighting` | number | always | values 4,6,8,10,11,12,13,14,15,16 | `10` | Roll weight. |
| `minimumTier` | number | always | values 0,6 | `0` |  |
| `sprite` | string | always | >12 distinct | `"j-r-1"` | Sprite id (LE Tools) or md5 hash (Maxroll). |
| `backgroundSlotType` | number | always | values 0,2,3 | `3` |  |
| `backgroundSlotColor` | number | always | values 0,2,3,4,5,6,7,8,9 | `2` |  |
| `rolls` | array | always | len 0..14 | `[{"attempts":10,"chance":0.8,"dropInfo":{"type":0,"baseID...` | Per-stat-line {min,max} for this tier. |
| `rolls[]` | object | 124 occurrences |  | `{"attempts":10,"chance":0.8,"dropInfo":{"type":0,"baseID"...` | Per-stat-line {min,max} for this tier. |
| `rolls[].attempts` | number | 124 occurrences | values 1,2,3,4,5,10 | `10` |  |
| `rolls[].chance` | number | 124 occurrences | values 0.17,0.2,0.3,0.35,0.4,0.6,0.8,1 | `0.8` | Chance (0..1). |
| `rolls[].dropInfo` | object | 124 occurrences |  | `{"type":0,"baseID":0,"potentialBaseIDs":[],"rarityType":0...` |  |
| `separateRollsForGuests` | boolean | always | values false,true | `false` |  |
| `guestRolls` | array | always | len 0..2 | `[]` |  |
| `guestRolls[]` | object | 24 occurrences |  | `{"attempts":1,"chance":1,"dropInfo":{"type":0,"baseID":0,...` |  |
| `guestRolls[].attempts` | number | 24 occurrences | values 1,2 | `1` |  |
| `guestRolls[].chance` | number | 24 occurrences | values 0.4,1 | `1` | Chance (0..1). |
| `guestRolls[].dropInfo` | object | 24 occurrences |  | `{"type":0,"baseID":0,"potentialBaseIDs":[],"rarityType":1...` |  |

Example (record #3, trimmed):

```json
{
  "titleKey": "MapObjects.Droppable_Reward_Name_Rare Relics",
  "rewardType": 3,
  "weighting": 10,
  "minimumTier": 0,
  "sprite": "j-r-4",
  "backgroundSlotType": 2,
  "backgroundSlotColor": 5,
  "rolls": [
    {
      "attempts": 3,
      "chance": 1,
      "dropInfo": {
        "type": 0,
        "baseID": 22,
        "potentialBaseIDs": [],
        "rarityType": 1,
        "uniqueRarityType": 0,
        "subType": -1,
        "rarityGroup": 2,
        "rarity": 0,
        "ilvl": -1,
        "requireClassCompatibility": true
      }
    },
    {
      "attempts": 5,
      "chance": 0.2,
      "dropInfo": {
        "type": 0,
        "baseID": 22,
        "potentialBaseIDs": [],
        "rarityType": 1,
        "uniqueRarityType": 0,
        "subType": -1,
        "rarityGroup": 2,
        "rarity": 0,
        "ilvl": -1,
        "requireClassCompatibility": true
      }
    }
  ],
  "separateRollsForGuests": false,
  "guestRolls": []
}
```

### `vaultsOfUncertainFate.allMods`

- **Location:** `vaultsOfUncertainFate.allMods[]` (file: endgame)
- **Keying:** array
- **Record count:** 46

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `descriptionKey` | string | always | >12 distinct | `"VaultMods.VaultMod_Name_20p More Exalted Drops Vaults Mod"` | i18n key for the description. |
| `minimumChests` | number | always | values 0,1,2 | `2` |  |
| `maxTimesChosen` | number | always | values 0,1 | `0` |  |
| `rareMod` | boolean | always | values true,false | `true` |  |
| `restrictedByDungeonTier` | boolean | always | values true,false | `true` |  |
| `compatibleDungeonTiers` | array | always | len 0..3 | `[1,2,3]` |  |
| `compatibleDungeonTiers[]` | number | 56 occurrences | values 0,1,2,3 | `1` |  |
| `perChestAddedValue` | number | always | 0..300 (>12 distinct) | `2` |  |
| `perChestValueIncrease` | number | always | values 0,0.2,0.25,0.5 | `0` |  |
| `perChestValueMoreModifier` | number | always | values 0,0.15,0.2,0.3 | `0.2` |  |
| `randomChestAddedValue` | number | always | 0..95 (>12 distinct) | `0` |  |
| `randomChestValueIncrease` | number | always | values 0,1 | `0` |  |
| `randomChestValueMoreModifier` | number | always | values 0,0.25,0.45 | `0` |  |
| `chestsAppliedTo` | number | 31/46 (67.4%) | values 0,1 | `0` |  |
| `numberOfChestsToApplyTo` | number | 31/46 (67.4%) | values 1 | `1` |  |
| `addedDuplicationChance` | number | 9/46 (19.6%) | values 0,0.2,1 | `0` |  |
| `dropQuantityModifier` | number | 9/46 (19.6%) | values 0,0.15,0.2,0.25,0.3,0.45 | `0.2` |  |
| `hasItemTypeRequirement` | boolean | 9/46 (19.6%) | values false | `false` |  |
| `acceptsAnItemTypeID` | boolean | 9/46 (19.6%) | values false | `false` |  |
| `requiredItemType` | number | 9/46 (19.6%) | values 0 | `0` |  |
| `acceptsAnItemTypeGroup` | boolean | 9/46 (19.6%) | values false | `false` |  |
| `requiredItemTypeGroup` | number | 9/46 (19.6%) | values 0 | `0` |  |
| `hasSubTypeRequirement` | boolean | 9/46 (19.6%) | values false | `false` |  |
| `subTypeRequirement` | number | 9/46 (19.6%) | values 0 | `0` |  |
| `hasRarityRequirement` | boolean | 9/46 (19.6%) | values true,false | `true` |  |
| `acceptsARarityID` | number | 9/46 (19.6%) | values 0 | `0` |  |
| `acceptsARarityGroup` | boolean | 9/46 (19.6%) | values true,false | `true` |  |
| `requiredRarityGroup` | number | 9/46 (19.6%) | values 0,3,5 | `5` |  |
| `type` | number | always | values 0,1,2 | `1` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `effectType` | number | 15/46 (32.6%) | values 0,1,2 | `0` |  |
| `initialChestDrops` | array | 15/46 (32.6%) | len 0..4 | `[{"minQuantity":9,"maxQuantity":12,"itemCreationPropertie...` |  |
| `initialChestDrops[]` | object | 27 occurrences |  | `{"minQuantity":9,"maxQuantity":12,"itemCreationProperties...` |  |
| `initialChestDrops[].minQuantity` | number | 27 occurrences | values 1,3,4,9 | `9` |  |
| `initialChestDrops[].maxQuantity` | number | 27 occurrences | values 1,4,7,12 | `12` |  |
| `initialChestDrops[].itemCreationProperties` | object | 27 occurrences |  | `{"itemTypeType":0,"itemType":101,"itemTypeGroup":0,"subTy...` |  |
| `bonusDropMin` | number | 22/46 (47.8%) | values 1,3,7 | `1` |  |
| `bonusDropMax` | number | 22/46 (47.8%) | values 1,3,9 | `1` |  |
| `bonusDropProperties` | object | 22/46 (47.8%) |  | `{"itemTypeType":0,"itemType":-1,"itemTypeGroup":0,"subTyp...` |  |
| `bonusDropProperties.itemTypeType` | number | 22/46 (47.8%) | values 0,1 | `0` |  |
| `bonusDropProperties.itemType` | number | 22/46 (47.8%) | values -1,3,22,102,103,104 | `-1` |  |
| `bonusDropProperties.itemTypeGroup` | number | 22/46 (47.8%) | values 0,2,3 | `0` |  |
| `bonusDropProperties.subType` | number | 22/46 (47.8%) | values -1,0,1,3,5 | `-1` |  |
| `bonusDropProperties.ilvl` | number | 22/46 (47.8%) | values -1 | `-1` |  |
| `bonusDropProperties.rarityType` | number | 22/46 (47.8%) | values 0,1 | `1` |  |
| `bonusDropProperties.rarity` | number | 22/46 (47.8%) | values 0,2 | `0` |  |
| `bonusDropProperties.rarityGroup` | number | 22/46 (47.8%) | values 0,2,3,4,5 | `5` |  |
| `bonusDropProperties.uniqueID` | number | 22/46 (47.8%) | values -1 | `-1` | Unique item id. |
| `bonusDropProperties.alwaysRequireClassCompatibility` | boolean | 22/46 (47.8%) | values false | `false` |  |
| `bonusDropProperties.cannotBeGifted` | boolean | 22/46 (47.8%) | values false | `false` |  |
| `bonusDropProperties.hostOnly` | boolean | 22/46 (47.8%) | values false | `false` |  |

Example (record #0, trimmed):

```json
{
  "descriptionKey": "VaultMods.VaultMod_Name_20p More Exalted Drops Vaults Mod",
  "minimumChests": 2,
  "maxTimesChosen": 0,
  "rareMod": true,
  "restrictedByDungeonTier": true,
  "compatibleDungeonTiers": [1, 2, "...(+1 more)"],
  "perChestAddedValue": 2,
  "perChestValueIncrease": 0,
  "perChestValueMoreModifier": 0.2,
  "randomChestAddedValue": 0,
  "randomChestValueIncrease": 0,
  "randomChestValueMoreModifier": 0,
  "chestsAppliedTo": 0,
  "numberOfChestsToApplyTo": 1,
  "addedDuplicationChance": 0,
  "dropQuantityModifier": 0.2,
  "hasItemTypeRequirement": false,
  "acceptsAnItemTypeID": false,
  "requiredItemType": 0,
  "acceptsAnItemTypeGroup": false,
  "requiredItemTypeGroup": 0,
  "hasSubTypeRequirement": false,
  "subTypeRequirement": 0,
  "hasRarityRequirement": true,
  "acceptsARarityID": 0,
  "acceptsARarityGroup": true,
  "requiredRarityGroup": 5,
  "type": 1
}
```

### `dropBossLoot`

- **Location:** `dropBossLoot[]` (file: endgame)
- **Keying:** array
- **Record count:** 71

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `source` | string(55)\|object(16) | always | >12 distinct | `"Harbinger_FallOfTheEmpire"` |  |
| `bossLoot` | object | always |  | `{"lootGroups":[{"chanceModifier":0,"dropChance":0.1,"maxD...` |  |
| `bossLoot.lootGroups` | array | always | len 1..16 | `[{"chanceModifier":0,"dropChance":0.1,"maxDropChance":0.2...` |  |
| `bossLoot.lootGroups[]` | object | 283 occurrences |  | `{"chanceModifier":0,"dropChance":0.1,"maxDropChance":0.22...` |  |
| `source.wovenEcho` | number | 16/71 (22.5%) | 7..41 (>12 distinct) | `7` |  |
| `source.monsterNameKey` | null | 16/71 (22.5%) | values null | `null` |  |
| `source.timelineId` | null | 16/71 (22.5%) | values null | `null` |  |
| `source.dungeonId` | null | 16/71 (22.5%) | values null | `null` |  |
| `source.lizardColor` | null | 16/71 (22.5%) | values null | `null` |  |
| `source.sceneId` | null | 16/71 (22.5%) | values null | `null` |  |
| `source.arena` | boolean | 16/71 (22.5%) | values false | `false` |  |
| `source.runePrison` | boolean | 16/71 (22.5%) | values false | `false` |  |
| `source.aberroth` | boolean | 16/71 (22.5%) | values false | `false` |  |
| `source.orobyss` | boolean | 16/71 (22.5%) | values false | `false` |  |
| `source.soulGambler` | boolean | 16/71 (22.5%) | values false | `false` |  |
| `source.lootLizard` | boolean | 16/71 (22.5%) | values false | `false` |  |
| `source.harbinger` | boolean | 16/71 (22.5%) | values false | `false` |  |
| `source.nemesis` | boolean | 16/71 (22.5%) | values false | `false` |  |

Example (record #1, trimmed):

```json
{
  "source": "TombGuardian",
  "bossLoot": {
    "lootGroups": [
      {
        "chanceModifier": 0,
        "dropChance": 0.15,
        "maxDropChance": 0.4,
        "chanceDisparityHalflifeFromIncreasedRarity": 3,
        "chanceMultiplierPerCorruption": 0,
        "corruptionOffsetForChanceMultiplier": 0,
        "multiplyChanceBySquareTierPercent": false,
        "chanceMultiplierFromCorruptionCappedAt1": false,
        "dropChancesForTiers": [],
        "lootType": "Normal",
        "minLevel": 0,
        "maxLevel": 0,
        "minCorruption": 0,
        "maxCorruption": 0,
        "drops": ["{...}"]
      },
      {
        "chanceModifier": 0,
        "dropChance": 2.2,
        "maxDropChance": 2.5,
        "chanceDisparityHalflifeFromIncreasedRarity": 2.5,
        "chanceMultiplierPerCorruption": 0,
        "corruptionOffsetForChanceMultiplier": 0,
        "multiplyChanceBySquareTierPercent": false,
        "chanceMultiplierFromCorruptionCappedAt1": false,
        "dropChancesForTiers": [],
        "lootType": "Normal",
        "minLevel": 0,
        "maxLevel": 0,
        "minCorruption": 0,
        "maxCorruption": 0,
        "drops": ["{...}", "{...}"]
      },
      "...(+2 more)"
    ]
  }
}
```

### `factionList`

- **Location:** `factionList` (file: factions)
- **Keying:** array, index = factionId
- **Record count:** 4

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `factionId` | number | always | values 0,1,2,3 | `0` | Faction id. |
| `factionNameKey` | string | always | values "UI.Factions_CircleofFortuneName","UI.Factions_MerchantGuildName","UI.Factions_ForgottenKnightsName","UI.Faction_Weaver_Title" | `"UI.Factions_CircleofFortuneName"` | i18n key. |
| `excludedFactions` | array | always | len 0..2 | `[1,0]` | Mutually exclusive faction ids. |
| `excludedFactions[]` | number | 3 occurrences | values 0,1 | `1` | Mutually exclusive faction ids. |
| `reputationGainMultiplierFromGainingExperience` | number | always | values 0,1,2 | `2` |  |
| `reputationGainMultiplierFromSpendingFavor` | number | always | values 0,1,2 | `2` |  |
| `increasedFavorPerRank` | number | always | values 0,0.05 | `0.05` |  |
| `reputationReqForNextRanks` | array | always | len 10..12 | `[{"reputationRequired":1,"rankTitleKey":"Common.Faction_R...` | Rank thresholds. |
| `reputationReqForNextRanks[]` | object | 44 occurrences |  | `{"reputationRequired":1,"rankTitleKey":"Common.Faction_Ra...` | Rank thresholds. |
| `reputationReqForNextRanks[].reputationRequired` | number | 44 occurrences | 1..800000 (>12 distinct) | `1` | Reputation needed. |
| `reputationReqForNextRanks[].rankTitleKey` | string | 44 occurrences | >12 distinct | `"Common.Faction_Rank_COF_Title_1"` | i18n key. |
| `reputationReqForNextRanks[].rankDescriptionKey` | string | 44 occurrences | >12 distinct | `"Common.Faction_Rank_COF_Description_1"` | i18n key. |
| `reputationReqForNextRanks[].optionalRankValue` | number | 44 occurrences | values 0,1,2,3 | `0` |  |
| `factionSceneNameKey` | string | always | values "Scenes.Scene_Name_Observatory","Scenes.Scene_Name_Bazaar","Scenes.Scene_Name_M_Knight","Scenes.Scene_Name_WeaversHub" | `"Scenes.Scene_Name_Observatory"` |  |
| `mainColor` | string | always | values "rgba(53,112,154,1.0)","rgba(154,83,44,1.0)","rgba(111,30,101,1.0)","rgba(55,103,98,1.0)" | `"rgba(53,112,154,1.0)"` |  |
| `factionIcon` | string(3)\|null(1) | always | values "i-r-1","i-r-3",null,"i-r-5" | `"i-r-1"` |  |
| `factionFavorIcon` | string(3)\|null(1) | always | values "i-r-2","i-r-4",null,"i-r-5" | `"i-r-2"` |  |

Example (record #0, trimmed):

```json
{
  "factionId": 0,
  "factionNameKey": "UI.Factions_CircleofFortuneName",
  "excludedFactions": [1, 0],
  "reputationGainMultiplierFromGainingExperience": 2,
  "reputationGainMultiplierFromSpendingFavor": 2,
  "increasedFavorPerRank": 0.05,
  "reputationReqForNextRanks": [
    {
      "reputationRequired": 1,
      "rankTitleKey": "Common.Faction_Rank_COF_Title_1",
      "rankDescriptionKey": "Common.Faction_Rank_COF_Description_1",
      "optionalRankValue": 0
    },
    {
      "reputationRequired": 900,
      "rankTitleKey": "Common.Faction_Rank_COF_Title_2",
      "rankDescriptionKey": "Common.Faction_Rank_COF_Description_2",
      "optionalRankValue": 0
    },
    "...(+10 more)"
  ],
  "factionSceneNameKey": "Scenes.Scene_Name_Observatory",
  "mainColor": "rgba(53,112,154,1.0)",
  "factionIcon": "i-r-1",
  "factionFavorIcon": "i-r-2"
}
```

### `factionList[].reputationReqForNextRanks[]`

- **Location:** `factionList[].reputationReqForNextRanks[]` (file: factions)
- **Keying:** array
- **Record count:** 44

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `reputationRequired` | number | always | 1..800000 (>12 distinct) | `1` | Reputation needed. |
| `rankTitleKey` | string | always | >12 distinct | `"Common.Faction_Rank_COF_Title_1"` | i18n key. |
| `rankDescriptionKey` | string | always | >12 distinct | `"Common.Faction_Rank_COF_Description_1"` | i18n key. |
| `optionalRankValue` | number | always | values 0,1,2,3 | `0` |  |

Example (record #1, trimmed):

```json
{
  "reputationRequired": 900,
  "rankTitleKey": "Common.Faction_Rank_COF_Title_2",
  "rankDescriptionKey": "Common.Faction_Rank_COF_Description_2",
  "optionalRankValue": 0
}
```

### `checklist.questList`

- **Location:** `checklist.questList` (file: checklist)
- **Keying:** object keyed by quest id
- **Record count:** 36
- **Key space:** 36 keys, numeric 1..169

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `id` | number | always | 1..169 (>12 distinct) | `1` | Record identifier (type depends on collection; see ids.md). |
| `main` | boolean | always | values true,false | `true` | Main-line quest. |
| `chapter` | number | always | values 0,1,2,3,4,5,6,7,8,9,13 | `1` | Chapter number. |
| `displayNameKey` | string | always | >12 distinct | `"Quests.Quest_1_Name"` | i18n key for the display name. |
| `experienceReward` | number | always | 0..10000 (>12 distinct) | `30` | XP reward. |
| `goldReward` | number | always | 0..10000 (>12 distinct) | `50` | Gold reward. |
| `idolUnlockReward` | number | always | values 0,1 | `1` | Idol slot reward. |
| `passivePointsReward` | number | always | values 0,1,2 | `0` | Passive points reward. |
| `attributesReward` | number | always | values 0,2 | `0` | Attribute points reward. |
| `steps` | array | always | len 2..15 | `[{"id":1,"questStateDuringThisStep":1,"finished":false},{...` | Quest steps. |
| `steps[]` | object | 228 occurrences |  | `{"id":1,"questStateDuringThisStep":1,"finished":false}` | Quest steps. |
| `steps[].id` | number | 228 occurrences | 1..903 (>12 distinct) | `1` | Record identifier (type depends on collection; see ids.md). |
| `steps[].questStateDuringThisStep` | number | 228 occurrences | values 1,2,3 | `1` |  |
| `steps[].finished` | boolean | 228 occurrences | values false,true | `false` |  |
| `completedStepId` | number | always | 4..903 (>12 distinct) | `4` | Final step id. |
| `itemReward` | string | 1/36 (2.8%) | values "UAzCMoZlI" | `"UAzCMoZlI"` |  |

Example (key `12`, record #3, trimmed):

```json
{
  "id": 12,
  "main": false,
  "chapter": 3,
  "displayNameKey": "Quests.Quest_12_Name",
  "experienceReward": 500,
  "goldReward": 500,
  "idolUnlockReward": 0,
  "passivePointsReward": 1,
  "attributesReward": 0,
  "steps": [
    {"id": 48, "questStateDuringThisStep": 1, "finished": false},
    {"id": 49, "questStateDuringThisStep": 1, "finished": false},
    "...(+7 more)"
  ],
  "completedStepId": 54
}
```

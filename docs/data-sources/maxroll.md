# Maxroll data (`https://assets-ng.maxroll.gg/leplanner/game/data.json`, hash `1b325e38`)

See [README.md](README.md) for the fetch method and version evidence (10,089,878 bytes, ETag `1b325e3819f59f0f0c2b1b240cda92ec`, Last-Modified 2026-09-30 11:34:57 GMT). The file is a single JSON object; this document describes every top-level key and every nested record list, with field tables computed by script over all records (same column meaning as in [letools.md](letools.md): type, presence, range/values, example, inferred meaning). Enum meanings are in [enums.md](enums.md), id spaces in [ids.md](ids.md).

Characteristics compared to LE Tools:

- Booleans are `true`/`false` everywhere; strings are resolved English (no i18n keys), with `''` already unescaped (`Artor's Legacy`).
- Collections are arrays (`affixes`, `uniques`, `itemTypes`, ...) or name-keyed objects (`abilities`, `skillTrees`, `icons`).
- Sprites are 32-hex md5 hashes (`sprite`, `icon`, `treeAtlas[]`).
- Tree node positions are inline (`nodes.<id>.transform`).
- Unique descriptions contain roll placeholders such as `[36,48,2]%` = `[min, max, decimals]`.

## 1. Top-level keys

| key | JS type | count | element / value shape |
|---|---|---|---|
| `abilities` | object | 1054 | object keyed by string (e.g. `Swipe`, `SummonWolf`, `NullAbility`); value: object |
| `abilityList` | array | 992 | array of string |
| `playerAbilityList` | array | 184 | array of string |
| `ailments` | array | 128 | array of object {id, tags, dealsDamage, applyPrefix, displayName, instanceName, effectOfIncreasedEffectiveness, ...} |
| `icons` | object | 45 | object keyed by string (e.g. `1h_axes`, `1h_dagger`, `1h_maces`); value: array |
| `skillTrees` | object | 142 | object keyed by string (e.g. `ac-1`, `mg-1`, `pr-1`); value: object |
| `treeAtlas` | array | 1172 | array of string |
| `classes` | array | 5 | array of object {className, classID, treeID, hideThirdMasterySkillsInPanel, specialTagForClassSpecificLevelOfSkillsStats, baseHealth, baseMana, ...} |
| `abilityProperties` | array | 177 | array of object {abilityID, properties} |
| `defaultAbilityProperty` | object | 13 | `roundingForAdded`, `roundingForMore`, `displayAddedAsPercentage`, `displayAddedAsTenthOfValue`, `displayAsPercentageOf`, `displayAsAddedTo`, `dontDisplayPlus`, `lessIsBetter`, `hideModifierValue`, `nameIncludesModifier`, `textKey`, `propertyName`, `altText` |
| `affixes` | array | 1156 | array of object {affixName, affixDisplayName, affixLootFilterOverrideName, titleType, affixTitle, affixMorphology, affixId, ...} |
| `affixCategoryHeaders` | array | 12 | array of object {name, categories} |
| `affixDisplayCategories` | array | 45 | array of string |
| `setAffixString` | string | - | "per equipped item with this affix" |
| `itemTypes` | array | 51 | array of object {BaseTypeName, displayName, lootFilterNameOverride, baseTypeID, maximumAffixes, maxSockets, affixEffectModifier, ...} |
| `itemCategories` | array | 4 | array of object {name, categories} |
| `properties` | array | 113 | array of object {roundingForAdded, roundingForMore, displayAddedAsPercentage, displayAddedAsTenthOfValue, displayAsPercentageOf, displayAsAddedTo, dontDisplayPlus, ...} |
| `defaultProperty` | object | 16 | `roundingForAdded`, `roundingForMore`, `displayAddedAsPercentage`, `displayAddedAsTenthOfValue`, `displayAsPercentageOf`, `displayAsAddedTo`, `dontDisplayPlus`, `lessIsBetter`, `hideModifierValue`, `nameIncludesModifier`, `textKey`, `propertyName`, `property`, `defaultAltText`, `altTextOverrides`, `moreRoundingOverrides` |
| `conditionalProperties` | array | 48 | array of object {description, nonDamageDescription} |
| `uniques` | array | 486 | array of object {name, displayName, alternativeSearchName, uniqueID, unifiedType, isSetItem, setID, ...} |
| `playerProperties` | array | 712 | array of object {roundingForAdded, roundingForMore, displayAddedAsPercentage, displayAddedAsTenthOfValue, displayAsPercentageOf, displayAsAddedTo, dontDisplayPlus, ...} |
| `defaultPlayerProperty` | object | 13 | `roundingForAdded`, `roundingForMore`, `displayAddedAsPercentage`, `displayAddedAsTenthOfValue`, `displayAsPercentageOf`, `displayAsAddedTo`, `dontDisplayPlus`, `lessIsBetter`, `hideModifierValue`, `nameIncludesModifier`, `textKey`, `propertyName`, `altText` |
| `idolAltarProperties` | array | 31 | array of object {roundingForAdded, roundingForMore, displayAddedAsPercentage, displayAddedAsTenthOfValue, displayAsPercentageOf, displayAsAddedTo, dontDisplayPlus, ...} |
| `defaultIdolAltarProperty` | object | 13 | `roundingForAdded`, `roundingForMore`, `displayAddedAsPercentage`, `displayAddedAsTenthOfValue`, `displayAsPercentageOf`, `displayAsAddedTo`, `dontDisplayPlus`, `lessIsBetter`, `hideModifierValue`, `nameIncludesModifier`, `textKey`, `propertyName`, `altText` |
| `setBonuses` | array | 25 | array of object {setID, setName, mods, tooltipDescriptions, tooltipEntries, itemsInSet} |
| `timelines` | array | 11 | array of object {timelineID, displayName, exclusiveEchoRewardsDescription, difficulties} |
| `quests` | array | 145 | array of object {name, chapter, id, mainLineQuest, idolUnlockReward, completed} |
| `stats` | array | 184 | array of object {property, tags, displayType, requireExactTagMatch} |
| `lootFilterData` | object | 2 | `sounds`, `beams` |

## 2. Collections

### `abilities`

- **Location:** `abilities`
- **Keying:** object keyed by ability name (e.g. "Swipe", "Primalist Evade"); 1054 keys
- **Record count:** 1054
- **Key space:** 1054 keys, e.g. `Swipe`, `SummonWolf`, `NullAbility`, `BasicPlayerAttack`
- **Notes:** Ability definitions. `playerAbilityID` is the short id ("sw43"); empty for non-player abilities.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `abilityName` | string | always | >12 distinct | `"Swipe"` | Ability name (key into abilities). |
| `playerAbilityID` | string | always | >12 distinct | `"sw43"` | Short player ability id (e.g. "sw43"). |
| `tags` | number | always | 0..33591624 (>12 distinct) | `513` | Tag bit mask (AT enum, see enums.md). |
| `manaCost` | number | always | 0..70 (>12 distinct) | `0` | Mana cost. |
| `channelled` | boolean | always | values false,true | `false` | Channelled ability. |
| `channelCost` | number | always | values 0,13,15,18,20,23,24,48 | `0` | Channel mana cost per second. |
| `maxCharges` | number | always | values 0,1,2,3 | `0` | Max charges. |
| `chargesGainedPerSecond` | number | always | 0..2 (>12 distinct) | `0` | Charge regen. |
| `description` | string | always | >12 distinct | `"A melee attack that hits all enemies in an area in front...` | English description text. |
| `skillLore` | string | always | values "","A cunning mage can use the power of ...","The Dune Falcon is one of the most d...","This is used by the thorn burst tree","<#C686FF>Temporal Shift</color> abil...","<#C686FF>Soulfire Shield</color> abi...","<#C686FF>Burning Amber</color> abili...","<#C686FF>Temporal Rift</color> abili..." | `""` | Lore text. |
| `altText` | string | always | >12 distinct | `"Added damage is applied at 100% effectiveness."` | English alt tooltip text. |
| `skillTreeConversionDamageTags` | number | always | 0..105 (>12 distinct) | `2` | Damage-type tag mask for tree conversions. |
| `instantCastForPlayer` | boolean | always | values false,true | `false` | Instant cast. |
| `countsAsMovementAbility` | boolean | always | values false,true | `false` | Movement skill. |
| `attributeScaling` | array | always | len 0..4 | `[{"attribute":0,"stats":[{"property":0,"specialTag":0,"ta...` | Scaling by attribute id (0 Str..4 Att). |
| `levelScaling` | array | always | len 1..1 | `[{"stats":[]}]` | Per-level scaling stats. |
| `minionTagsDisplay` | number | always | 0..131329 (>12 distinct) | `0` | Minion tag display mask. |
| `companion` | boolean | always | values false,true | `false` | Companion skill. |
| `fakeTags` | number | always | 0..155905 (>12 distinct) | `0` | Display-only tag mask. |
| `displayAlternateDamageDescriptorInTooltip` | boolean | always | values false,true | `false` |  |
| `useDuration` | number | always | 0..7.8 (>12 distinct) | `0.7` | Use duration (s). |
| `speedScaler` | number | always | values 2,3,9,54 | `2` | Speed scaler. |
| `speedMultiplier` | number | always | 0.4..5 (>12 distinct) | `1` | Speed multiplier. |
| `components` | array | always | len 0..4 | `[{"type":"damageOnHit","baseDamageStats":{"damage":[2,0,0...` | Component list (polymorphic). |
| `sprite` | string | 860/1054 (81.6%) | >12 distinct | `"b726312ace4bf9c4bb6bf4dfd93be5ff"` | Sprite id (LE Tools) or md5 hash (Maxroll). |

Example (key `GatheringStormMelee`, record #5, trimmed):

```json
{
  "abilityName": "Gathering Storm",
  "playerAbilityID": "ga2st",
  "tags": 514,
  "manaCost": 0,
  "channelled": false,
  "channelCost": 0,
  "maxCharges": 0,
  "chargesGainedPerSecond": 0,
  "description": "Strike at your enemy with a mighty lightning powered storm. ...",
  "skillLore": "",
  "altText": "The attack deals melee lightning damage with added damage ap...",
  "skillTreeConversionDamageTags": 7,
  "instantCastForPlayer": false,
  "countsAsMovementAbility": false,
  "attributeScaling": [
    {
      "attribute": 0,
      "stats": [
        {
          "property": 0,
          "specialTag": 0,
          "tags": 512,
          "extraTag": 0,
          "addedValue": 0,
          "increasedValue": 0.04,
          "moreValues": []
        }
      ]
    },
    {
      "attribute": 4,
      "stats": [
        {
          "property": 0,
          "specialTag": 0,
          "tags": 256,
          "extraTag": 0,
          "addedValue": 1,
          "increasedValue": 0,
          "moreValues": []
        }
      ]
    }
  ],
  "levelScaling": [
    {"stats": []}
  ],
  "minionTagsDisplay": 0,
  "companion": false,
  "fakeTags": 0,
  "displayAlternateDamageDescriptorInTooltip": false,
  "useDuration": 0.8,
  "speedScaler": 2,
  "speedMultiplier": 1,
  "components": [
    {
      "type": "damageOnHit",
      "baseDamageStats": {
        "damage": [0, 0, "...(+5 more)"],
        "critChance": 0.05,
        "critMultiplier": 2,
        "critType": 0,
        "isHit": true,
        "cullPercent": 0,
        "flatCull": 0,
        "increasedStunChance": 0,
        "increasedStunDuration": 0,
        "addedDamageScaling": 1,
        "additionalLeech": 0,
        "freezeRate": 0,
        "convertAllAddedDamage": false,
        "damageTypeToConvertTo": 0
      },
      "damageTags": 512,
      "damageModifier": 0,
      "highPriorityDoT": false,
      "canDamageSameEnemyAgain": false,
      "canDamageSameEnemyAgainAfterDuration": 0
    },
    {
      "type": "chanceToApplyAilmentsOnHit",
      "ailments": [],
      "chanceModifier": 0,
      "canApplyToSameEnemyAgain": false,
      "cannotApply": []
    }
  ],
  "sprite": "d01403ea59598e84ba3e37a8b0fc81f9"
}
```

#### Ability prefab components (915 components, 6 distinct `type` values)

| component `type` | count | fields (presence >=50% bold) |
|---|---|---|
| `damageOnHit` | 473 | **type**, **baseDamageStats**, **damageTags**, **damageModifier**, **highPriorityDoT**, **canDamageSameEnemyAgain**, **canDamageSameEnemyAgainAfterDuration** |
| `chanceToApplyAilmentsOnHit` | 160 | **type**, **ailments**, **chanceModifier**, **canApplyToSameEnemyAgain**, **cannotApply** |
| `castAfterDuration` | 140 | **type**, **interval**, **castOnStartAsWell**, **limitCasts**, **remainingCasts**, **randomExtraCasts**, **ability** |
| `createAbilityObjectOnDeath` | 112 | **type**, **ability** |
| `damageWithBeam` | 19 | **type**, **baseDamageStats**, **damageTags**, **damageModifier**, **highPriorityDoT**, **damageInterval**, **damageAtStart** |
| `castAtRandomPointAfterDuration` | 11 | **type**, **duration**, **castsAtStart**, **limitCasts**, **remainingCasts**, **additionalCastsAtStart**, **shape**, **radius**, **distance**, **length**, **ability** |

##### Component `damageOnHit` (473)

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `type` | string | always | values "damageOnHit" | `"damageOnHit"` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `baseDamageStats` | object | always |  | `{"damage":[2,0,0,0,0,0,0],"critChance":0.05,"critMultipli...` | Base damage block: damage[7] = [physical, fire, cold, lightning, necrotic, void, poison]. |
| `baseDamageStats.damage` | array | always | len 7..7 | `[2,0,0,0,0,0,0]` | Per-damage-type values: [physical, fire, cold, lightning, necrotic, void, poison] (enums.md). |
| `baseDamageStats.critChance` | number | always | values 0,0.05,0.06,0.1,1 | `0.05` | Base crit chance. |
| `baseDamageStats.critMultiplier` | number | always | values 0,1,1.5,2 | `2` | Base crit multiplier. |
| `baseDamageStats.critType` | number | always | values 0,1 | `0` |  |
| `baseDamageStats.isHit` | boolean | always | values true,false | `true` |  |
| `baseDamageStats.cullPercent` | number | always | values 0 | `0` |  |
| `baseDamageStats.flatCull` | number | always | values 0 | `0` |  |
| `baseDamageStats.increasedStunChance` | number | always | values 0,0.5,1 | `0` |  |
| `baseDamageStats.increasedStunDuration` | number | always | values 0 | `0` |  |
| `baseDamageStats.addedDamageScaling` | number | always | 0..100 (>12 distinct) | `1` | Scaling of added damage. |
| `baseDamageStats.additionalLeech` | number | always | values 0,0.3 | `0` |  |
| `baseDamageStats.freezeRate` | number | always | 0..400 (>12 distinct) | `0` |  |
| `baseDamageStats.convertAllAddedDamage` | boolean | always | values false | `false` |  |
| `baseDamageStats.damageTypeToConvertTo` | number | always | values 0 | `0` |  |
| `damageTags` | number | always | 0..33793 (>12 distinct) | `512` | Damage tag mask (AT). |
| `damageModifier` | number | always | values 0 | `0` |  |
| `highPriorityDoT` | boolean | always | values false,true | `false` |  |
| `canDamageSameEnemyAgain` | boolean | always | values false,true | `false` |  |
| `canDamageSameEnemyAgainAfterDuration` | number | always | values 0,0.25,0.5,1,2 | `0` |  |
| `baseDamageStats.penetration` | array | 1/473 (0.2%) | len 2..2 | `[{"damageType":0,"penetration":0.25},{"damageType":1,"pen...` |  |

Example:

```json
{
  "type": "damageOnHit",
  "baseDamageStats": {
    "damage": [2, 0, "...(+5 more)"],
    "critChance": 0.05,
    "critMultiplier": 2,
    "critType": 0,
    "isHit": true,
    "cullPercent": 0,
    "flatCull": 0,
    "increasedStunChance": 0,
    "increasedStunDuration": 0,
    "addedDamageScaling": 2.5,
    "additionalLeech": 0,
    "freezeRate": 0,
    "convertAllAddedDamage": false,
    "damageTypeToConvertTo": 0
  },
  "damageTags": 512,
  "damageModifier": 0,
  "highPriorityDoT": false,
  "canDamageSameEnemyAgain": false,
  "canDamageSameEnemyAgainAfterDuration": 0
}
```

##### Component `chanceToApplyAilmentsOnHit` (160)

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `type` | string | always | values "chanceToApplyAilmentsOnHit" | `"chanceToApplyAilmentsOnHit"` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `ailments` | array | always | len 0..3 | `[]` | Ailment list. |
| `chanceModifier` | number | always | values -0.4,0,1 | `0` |  |
| `canApplyToSameEnemyAgain` | boolean | always | values false,true | `false` |  |
| `cannotApply` | array | always | len 0..1 | `[]` |  |
| `ailments[]` | object | 83 occurrences |  | `{"id":7,"chance":1.4,"rolledSeparately":false,"increasedD...` | Ailment list. |
| `cannotApply[]` | number | 2 occurrences | values 27,79 | `27` |  |

Example:

```json
{
  "type": "chanceToApplyAilmentsOnHit",
  "ailments": [
    {"id": 7, "chance": 1.4, "rolledSeparately": false, "increasedDuration": 0.4, "increasedEffect": 0}
  ],
  "chanceModifier": 0,
  "canApplyToSameEnemyAgain": false,
  "cannotApply": []
}
```

##### Component `castAfterDuration` (140)

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `type` | string | always | values "castAfterDuration" | `"castAfterDuration"` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `interval` | number | always | 0..10000 (>12 distinct) | `0.5` |  |
| `castOnStartAsWell` | boolean | always | values true,false | `true` |  |
| `limitCasts` | boolean | always | values true,false | `true` |  |
| `remainingCasts` | number | always | values 0,1,2,3,4,5,6,7,8,15,20 | `2` |  |
| `randomExtraCasts` | number | always | values 0,2,10 | `2` |  |
| `ability` | string | always | >12 distinct | `"EarthquakeSeekingCrack"` |  |

Example:

```json
{
  "type": "castAfterDuration",
  "interval": 0.5,
  "castOnStartAsWell": true,
  "limitCasts": true,
  "remainingCasts": 2,
  "randomExtraCasts": 2,
  "ability": "EarthquakeSeekingCrack"
}
```

##### Component `createAbilityObjectOnDeath` (112)

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `type` | string | always | values "createAbilityObjectOnDeath" | `"createAbilityObjectOnDeath"` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `ability` | string | always | >12 distinct | `"FuryLeapAoe"` |  |

Example:

```json
{"type": "createAbilityObjectOnDeath", "ability": "AvalancheSnowballAoE"}
```

### `abilities[*].components[]`

- **Location:** `abilities.<name>.components[]`
- **Keying:** array; polymorphic on `type`
- **Record count:** 915
- **Notes:** Prefab components (see per-type tables in maxroll.md).

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `type` | string | always | values "damageOnHit","chanceToApplyAilmentsOnHit","createAbilityObjectOnDeath","castAfterDuration","castAtRandomPointAfterDuration","damageWithBeam" | `"damageOnHit"` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `baseDamageStats` | object | 492/915 (53.8%) |  | `{"damage":[2,0,0,0,0,0,0],"critChance":0.05,"critMultipli...` | Base damage block: damage[7] = [physical, fire, cold, lightning, necrotic, void, poison]. |
| `baseDamageStats.damage` | array | 492/915 (53.8%) | len 7..7 | `[2,0,0,0,0,0,0]` | Per-damage-type values: [physical, fire, cold, lightning, necrotic, void, poison] (enums.md). |
| `baseDamageStats.damage[]` | number | 3444 occurrences | 0..2000 (>12 distinct) | `2` | Per-damage-type values: [physical, fire, cold, lightning, necrotic, void, poison] (enums.md). |
| `baseDamageStats.critChance` | number | 492/915 (53.8%) | values 0,0.05,0.06,0.1,0.5,1 | `0.05` | Base crit chance. |
| `baseDamageStats.critMultiplier` | number | 492/915 (53.8%) | values 0,1,1.5,2 | `2` | Base crit multiplier. |
| `baseDamageStats.critType` | number | 492/915 (53.8%) | values 0,1 | `0` |  |
| `baseDamageStats.isHit` | boolean | 492/915 (53.8%) | values true,false | `true` |  |
| `baseDamageStats.cullPercent` | number | 492/915 (53.8%) | values 0 | `0` |  |
| `baseDamageStats.flatCull` | number | 492/915 (53.8%) | values 0 | `0` |  |
| `baseDamageStats.increasedStunChance` | number | 492/915 (53.8%) | values 0,0.5,1 | `0` |  |
| `baseDamageStats.increasedStunDuration` | number | 492/915 (53.8%) | values 0 | `0` |  |
| `baseDamageStats.addedDamageScaling` | number | 492/915 (53.8%) | 0..100 (>12 distinct) | `1` | Scaling of added damage. |
| `baseDamageStats.additionalLeech` | number | 492/915 (53.8%) | values 0,0.3 | `0` |  |
| `baseDamageStats.freezeRate` | number | 492/915 (53.8%) | 0..400 (>12 distinct) | `0` |  |
| `baseDamageStats.convertAllAddedDamage` | boolean | 492/915 (53.8%) | values false | `false` |  |
| `baseDamageStats.damageTypeToConvertTo` | number | 492/915 (53.8%) | values 0 | `0` |  |
| `damageTags` | number | 492/915 (53.8%) | 0..37120 (>12 distinct) | `512` | Damage tag mask (AT). |
| `damageModifier` | number | 492/915 (53.8%) | values 0 | `0` |  |
| `highPriorityDoT` | boolean | 492/915 (53.8%) | values false,true | `false` |  |
| `canDamageSameEnemyAgain` | boolean | 473/915 (51.7%) | values false,true | `false` |  |
| `canDamageSameEnemyAgainAfterDuration` | number | 473/915 (51.7%) | values 0,0.25,0.5,1,2 | `0` |  |
| `ailments` | array | 160/915 (17.5%) | len 0..3 | `[]` | Ailment list. |
| `chanceModifier` | number | 160/915 (17.5%) | values -0.4,0,1 | `0` |  |
| `canApplyToSameEnemyAgain` | boolean | 160/915 (17.5%) | values false,true | `false` |  |
| `cannotApply` | array | 160/915 (17.5%) | len 0..1 | `[]` |  |
| `ability` | string | 263/915 (28.7%) | >12 distinct | `"FuryLeapAoe"` |  |
| `ailments[]` | object | 83 occurrences |  | `{"id":7,"chance":1.4,"rolledSeparately":false,"increasedD...` | Ailment list. |
| `ailments[].id` | number | 83 occurrences | 1..128 (>12 distinct) | `7` | Record identifier (type depends on collection; see ids.md). |
| `ailments[].chance` | number | 83 occurrences | values -9999,0.3,0.4,0.5,1,1.4,2,3,4,7 | `1.4` | Chance (0..1). |
| `ailments[].rolledSeparately` | boolean | 83 occurrences | values false | `false` |  |
| `ailments[].increasedDuration` | number | 83 occurrences | values -0.88,0,0.2,0.3,0.4,0.7,1,2,3 | `0.4` | Increased duration. |
| `ailments[].increasedEffect` | number | 83 occurrences | values 0,0.25,0.7,1,2 | `0` | Increased effect. |
| `interval` | number | 140/915 (15.3%) | 0..10000 (>12 distinct) | `0.5` |  |
| `castOnStartAsWell` | boolean | 140/915 (15.3%) | values true,false | `true` |  |
| `limitCasts` | boolean | 151/915 (16.5%) | values true,false | `true` |  |
| `remainingCasts` | number | 151/915 (16.5%) | values 0,1,2,3,4,5,6,7,8,10,15,20 | `2` |  |
| `randomExtraCasts` | number | 140/915 (15.3%) | values 0,2,10 | `2` |  |
| `duration` | number | 11/915 (1.2%) | values 0.08,0.1,0.15,0.29,0.3,0.323,0.35,1 | `0.08` | Duration in seconds. |
| `castsAtStart` | boolean | 11/915 (1.2%) | values true,false | `true` |  |
| `additionalCastsAtStart` | number | 11/915 (1.2%) | values 0,3 | `0` |  |
| `shape` | number | 11/915 (1.2%) | values 0,1 | `0` |  |
| `radius` | number | 11/915 (1.2%) | values 2,2.5,3,4,7,8,10 | `4` |  |
| `distance` | number | 11/915 (1.2%) | values 0 | `0` |  |
| `length` | number | 11/915 (1.2%) | values 0,2.5,7 | `7` |  |
| `damageInterval` | number | 19/915 (2.1%) | values 0.15,0.2,0.25,0.3,0.3333333,0.45,0.5 | `0.25` |  |
| `damageAtStart` | boolean | 19/915 (2.1%) | values true,false | `true` |  |
| `cannotApply[]` | number | 2 occurrences | values 27,79 | `27` |  |
| `baseDamageStats.penetration` | array | 1/915 (0.1%) | len 2..2 | `[{"damageType":0,"penetration":0.25},{"damageType":1,"pen...` |  |
| `baseDamageStats.penetration[]` | object | 2 occurrences |  | `{"damageType":0,"penetration":0.25}` |  |

Example (record #0, trimmed):

```json
{
  "type": "damageOnHit",
  "baseDamageStats": {
    "damage": [2, 0, "...(+5 more)"],
    "critChance": 0.05,
    "critMultiplier": 2,
    "critType": 0,
    "isHit": true,
    "cullPercent": 0,
    "flatCull": 0,
    "increasedStunChance": 0,
    "increasedStunDuration": 0,
    "addedDamageScaling": 1,
    "additionalLeech": 0,
    "freezeRate": 0,
    "convertAllAddedDamage": false,
    "damageTypeToConvertTo": 0
  },
  "damageTags": 512,
  "damageModifier": 0,
  "highPriorityDoT": false,
  "canDamageSameEnemyAgain": false,
  "canDamageSameEnemyAgainAfterDuration": 0
}
```

### `abilityList`

- **Location:** `abilityList`
- **Keying:** array of ability names; index = ability index (index 0 = null)
- **Record count:** 992
- **Notes:** Index here == LE Tools abilityList[id].index == abilityProperties[].abilityID.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `name` | null(12)\|string(980) | always | >12 distinct | `null` | Internal / English name. |

Example (record #4, trimmed):

```json
{"name": "GuardianOrb"}
```

### `playerAbilityList`

- **Location:** `playerAbilityList`
- **Keying:** array of ability names (player-usable abilities)
- **Record count:** 184

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `name` | string(183)\|null(1) | always | >12 distinct | `"BasicPlayerAttack"` | Internal / English name. |

Example (record #0, trimmed):

```json
{"name": "BasicPlayerAttack"}
```

### `ailments`

- **Location:** `ailments`
- **Keying:** array; each record has numeric `id` (AilmentID enum)
- **Record count:** 128

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `id` | number | always | 1..128 (>12 distinct) | `1` | Record identifier (type depends on collection; see ids.md). |
| `tags` | number | always | values 0,4096,4352,4608,16777472,16781312,16781568 | `4096` | Tag bit mask (AT enum, see enums.md). |
| `dealsDamage` | boolean | always | values true,false | `true` | Ailment deals damage. |
| `applyPrefix` | number | always | values 0,1,2,3 | `0` | Grammar prefix enum for "applied" text. |
| `displayName` | string | always | >12 distinct | `"Ignite"` | English display name. |
| `instanceName` | string | always | >12 distinct | `"Ignite"` | Name for an applied instance (e.g. "Bleeding"). |
| `effectOfIncreasedEffectiveness` | number | always | values 0,1 | `1` | Effect of increased effectiveness. |
| `additionalPenetrationDamageType` | number | always | values 0,1,2,3,4,5,6 | `1` | Damage type index penetrated (see damage order). |
| `description` | string | always | >12 distinct | `"Deals fire damage over time"` | English description text. |
| `icon` | string | 110/128 (85.9%) | >12 distinct | `"31d7a1d754d9cea45b98ffdcd973e43c"` | Icon sprite/hash. |
| `baseDamage` | object | always |  | `{"damage":[0,40,0,0,0,0,0],"critChance":0,"critMultiplier...` | Damage block (same shape as baseDamageStats). |
| `baseDamage.damage` | array | always | len 7..7 | `[0,40,0,0,0,0,0]` | Per-damage-type values: [physical, fire, cold, lightning, necrotic, void, poison] (enums.md). |
| `baseDamage.damage[]` | number | 896 occurrences | 0..600 (>12 distinct) | `0` | Per-damage-type values: [physical, fire, cold, lightning, necrotic, void, poison] (enums.md). |
| `baseDamage.critChance` | number | always | values 0,0.05 | `0` | Base crit chance. |
| `baseDamage.critMultiplier` | number | always | values 1,2 | `1` | Base crit multiplier. |
| `baseDamage.critType` | number | always | values 0,1 | `1` |  |
| `baseDamage.isHit` | boolean | always | values false,true | `false` |  |
| `baseDamage.cullPercent` | number | always | values 0 | `0` |  |
| `baseDamage.flatCull` | number | always | values 0 | `0` |  |
| `baseDamage.increasedStunChance` | number | always | values 0 | `0` |  |
| `baseDamage.increasedStunDuration` | number | always | values 0 | `0` |  |
| `baseDamage.addedDamageScaling` | number | always | values 0,0.2,1,1.5,2,3,4,4.5,5,6,10 | `0` | Scaling of added damage. |
| `baseDamage.additionalLeech` | number | always | values 0 | `0` |  |
| `baseDamage.freezeRate` | number | always | values 0 | `0` |  |
| `baseDamage.convertAllAddedDamage` | boolean | always | values false | `false` |  |
| `baseDamage.damageTypeToConvertTo` | number | always | values 0 | `0` |  |

Example (record #2, trimmed):

```json
{
  "id": 3,
  "tags": 0,
  "dealsDamage": false,
  "applyPrefix": 0,
  "displayName": "Chill",
  "instanceName": "Chill",
  "effectOfIncreasedEffectiveness": 0,
  "additionalPenetrationDamageType": 0,
  "description": "Reduces movement speed, attack speed, and cast speed.",
  "icon": "1963c478b0a9c0a41a67254bb1888761",
  "baseDamage": {
    "damage": [0, 0, "...(+5 more)"],
    "critChance": 0,
    "critMultiplier": 1,
    "critType": 0,
    "isHit": false,
    "cullPercent": 0,
    "flatCull": 0,
    "increasedStunChance": 0,
    "increasedStunDuration": 0,
    "addedDamageScaling": 1,
    "additionalLeech": 0,
    "freezeRate": 0,
    "convertAllAddedDamage": false,
    "damageTypeToConvertTo": 0
  }
}
```

### `icons`

- **Location:** `icons`
- **Keying:** object keyed by icon group (e.g. "1h_axes") -> array of icon names
- **Record count:** 45
- **Key space:** 45 keys, e.g. `1h_axes`, `1h_dagger`, `1h_maces`, `1h_scepter`

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `list` | array | always | len 2..492 | `["avenged_kolheim_axe","battle_axe","chitin_claw","circle...` |  |
| `list[]` | string | 1558 occurrences | >12 distinct | `"avenged_kolheim_axe"` |  |

Example (key `1h_axes`, record #0, trimmed):

```json
{"list": ["avenged_kolheim_axe","battle_axe","...(+16 more)"]}
```

### `skillTrees (class trees + weaver)`

- **Location:** `skillTrees[ac-1|mg-1|pr-1|rg-1|kn-1|weaver]`
- **Keying:** object keyed by tree id
- **Record count:** 6
- **Key space:** 6 keys, e.g. `ac-1`, `mg-1`, `pr-1`, `rg-1`
- **Notes:** Class passive trees and weaver tree (nodes shown separately).

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `version` | number | always | values 0,3,7,10,12 | `3` | Tree data version. |
| `thirdMasteryUnlocked` | boolean | 5/6 (83.3%) | values true | `true` | Third mastery unlock flag. |
| `masteries` | array | 5/6 (83.3%) | len 4..4 | `[{"classDescription":"A rebellious scion who disobeyed he...` | Mastery definitions. |
| `masteries[]` | object | 20 occurrences |  | `{"classDescription":"A rebellious scion who disobeyed her...` | Mastery definitions. |
| `masteries[].classDescription` | string | 20 occurrences | >12 distinct | `"A rebellious scion who disobeyed her masters to seek out...` |  |
| `masteries[].passiveBonuses` | array | 20 occurrences | len 0..3 | `[]` | Per-mastery bonus lists. |

Example (key `ac-1`, record #0, trimmed):

```json
{
  "version": 3,
  "thirdMasteryUnlocked": true,
  "masteries": [
    {
      "classDescription": "A rebellious scion who disobeyed her masters to seek out for...",
      "passiveBonuses": []
    },
    {
      "classDescription": "A commander of undeath, they send their animated thralls to ...",
      "passiveBonuses": ["+1 max Skeleton", "+1 max Skeleton Mage", "...(+1 more)"]
    },
    "...(+2 more)"
  ]
}
```

### `skillTrees (ability trees)`

- **Location:** `skillTrees[<abilityId>]`
- **Keying:** object keyed by player ability id (e.g. "fi9")
- **Record count:** 136
- **Key space:** 136 keys, e.g. `wo42`, `mush9`, `es6ai`, `mira59`
- **Notes:** Per-skill trees (nodes shown separately).

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `version` | number | always | values 0,1,2,3,4,5,7,8 | `1` | Tree data version. |
| `ability` | string | always | >12 distinct | `"SummonWolf"` |  |
| `ornaments` | array | always | len 5..14 | `[{"sprite":"a8688abefa3a78d41ad8816d1a6badb1","transform"...` | Decorative sprites (Maxroll ability trees). |
| `ornaments[]` | object | 1318 occurrences |  | `{"sprite":"a8688abefa3a78d41ad8816d1a6badb1","transform":...` | Decorative sprites (Maxroll ability trees). |
| `ornaments[].sprite` | string | 1318 occurrences | >12 distinct | `"a8688abefa3a78d41ad8816d1a6badb1"` | Sprite id (LE Tools) or md5 hash (Maxroll). |
| `ornaments[].transform` | object | 1318 occurrences |  | `{"width":480,"height":480}` |  |
| `ornaments[].stretch` | boolean | 494 occurrences | values true | `true` |  |
| `ornaments[].color` | object | 376 occurrences |  | `{"r":0.9,"g":0.9,"b":0.9,"a":0.9019608}` | Color value (ARGB int on Maxroll beams, rgba string on LE Tools). |

Example (key `wo42`, record #0, trimmed):

```json
{
  "version": 1,
  "ability": "SummonWolf",
  "ornaments": [
    {
      "sprite": "a8688abefa3a78d41ad8816d1a6badb1",
      "transform": {"width": 480, "height": 480}
    },
    {
      "sprite": "878500141d832b248b9303cbf2cca795",
      "transform": {"scale": 1.2, "y": -511.20000000000005, "width": 480, "height": 480}
    },
    "...(+9 more)"
  ]
}
```

### `skillTrees[ability].nodes`

- **Location:** `skillTrees.<abilityId>.nodes.<nodeId>`
- **Keying:** object keyed by nodeId
- **Record count:** 3956
- **Notes:** Flattened over all ability trees.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `maxPoints` | number | always | values 0,1,2,3,4,5,6,7,8 | `0` | Maximum points in the node (0 = free/root). |
| `mastery` | number | always | values 0,1 | `0` | Mastery gate (0 base class, 1..3 mastery; see enums.md). |
| `masteryRequirement` | number | always | values 0 | `0` | Points that must be spent in the class tree before the node unlocks (class trees: multiples of 5 up to 45; always 0 in ability and weaver trees). |
| `nodeName` | string | always | >12 distinct | `"Summon Wolf"` |  |
| `description` | string | always | >12 distinct | `""` | English description text. |
| `altText` | string | always | >12 distinct | `""` | English alt tooltip text. |
| `loreText` | string | always | >12 distinct | `"Call to the forest and it will call back to you in the h...` | English lore text. |
| `noScalingType` | number | always | values 0 | `0` | No-scaling type. |
| `noScalingPointThreshold` | number | always | values 0 | `0` | No-scaling point threshold. |
| `pointBonusDescription` | string | always | values "" | `""` | Text for bonus at point thresholds. |
| `stats` | array | always | len 0..6 | `[]` | Stat lines. |
| `requirements` | array | always | len 0..4 | `[]` | Prerequisites: [{nodeId, requirement}] (see enums.md). |
| `transform` | object | always |  | `{"x":0.228,"y":-0.8040001,"rotation":{"x":0,"y":0,"z":0,"...` | {x,y} node position in tree canvas (Maxroll). |
| `transform.x` | number | 3768/3956 (95.2%) | -823.56..822.48 (>12 distinct) | `0.228` |  |
| `transform.y` | number | 3808/3956 (96.3%) | -390..369.6 (>12 distinct) | `-0.8040001` |  |
| `transform.rotation` | object | 433/3956 (10.9%) |  | `{"x":0,"y":0,"z":0,"w":1.0000000532124802}` |  |
| `transform.rotation.x` | number | 433/3956 (10.9%) | values -0.569227,-0.3826834,-0.1840677,0,0.1944998,0.5643797,0.8694114,1 | `0` |  |
| `transform.rotation.y` | number | 433/3956 (10.9%) | values -0.8221804,-0.4940889,0,0.8255154,0.9238796,0.9809026,0.9829136,0.9961947,1 | `0` |  |
| `transform.rotation.z` | number | 433/3956 (10.9%) | -1..1 (>12 distinct) | `0` |  |
| `transform.rotation.w` | number | 433/3956 (10.9%) | -0.9829487..1.0000000532124802 (>12 distinct) | `1.0000000532124802` |  |
| `abilityGrantedByNode` | string | 755/3956 (19.1%) | >12 distinct | `"Wolf Ability"` |  |
| `stats[]` | object | 6528 occurrences |  | `{"statName":"Dodge Rating","value":"+30","noScaling":fals...` | Stat lines. |
| `stats[].statName` | string | 6528 occurrences | >12 distinct | `"Dodge Rating"` | English stat label. |
| `stats[].value` | string | 6528 occurrences | >12 distinct | `"+30"` | Stat value (number) or roll min for unique mods / display string on tree nodes. |
| `stats[].noScaling` | boolean | 6528 occurrences | values false,true | `false` | Stat does not scale with points. |
| `stats[].downside` | boolean | 6528 occurrences | values false,true | `false` | Stat is a downside (red). |
| `stats[].property` | number | 6528 occurrences | 0..25206 (>12 distinct) | `11` | Stat property id (SP enum, see enums.md). |
| `stats[].tags` | number | 6528 occurrences | 0..4104 (>12 distinct) | `0` | Tag bit mask (AT enum, see enums.md). |
| `stats[].overrideSprite` | boolean | 6528 occurrences | values false,true | `false` | Uses custom sprite. |
| `stats[].sprite` | string | 6527 occurrences | >12 distinct | `"cc1438cd157dbbb4c99dcb43c8d0767f"` | Sprite id (LE Tools) or md5 hash (Maxroll). |
| `requirements[]` | object | 4577 occurrences |  | `{"node":0,"requirement":0}` | Prerequisites: [{nodeId, requirement}] (see enums.md). |
| `requirements[].node` | number | 4577 occurrences | 0..37 (>12 distinct) | `0` | Prerequisite node id (Maxroll name of nodeId). |
| `requirements[].requirement` | number | 4577 occurrences | values 0,1,2,3,4,5 | `0` | Points that must be allocated in node nodeId before this node unlocks (0 = plain link; 1..5; see enums.md). |
| `icon` | string | 3820/3956 (96.6%) | >12 distinct | `"9d4f68082f4fc38458916f06d0af3a1f"` | Sprite hash (treeAtlas entry). |
| `transform.scale` | number | 1063/3956 (26.9%) | values 0.8999998,1.3 | `1.3` |  |

Example (record #1, trimmed):

```json
{
  "maxPoints": 4,
  "mastery": 0,
  "masteryRequirement": 0,
  "nodeName": "Canine Agility",
  "description": "Your Wolves have additional dodge chance, and have increased...",
  "altText": "",
  "loreText": "",
  "noScalingType": 0,
  "noScalingPointThreshold": 0,
  "pointBonusDescription": "",
  "stats": [
    {
      "statName": "Dodge Rating",
      "value": "+30",
      "noScaling": false,
      "downside": false,
      "property": 11,
      "tags": 0,
      "overrideSprite": false,
      "sprite": "cc1438cd157dbbb4c99dcb43c8d0767f"
    },
    {
      "statName": "Increased Dodge Rating Per Strength",
      "value": "3%",
      "noScaling": false,
      "downside": false,
      "property": 54,
      "tags": 0,
      "overrideSprite": true,
      "sprite": "e5753fb852cc3854c930ce75d4c5fd9e"
    }
  ],
  "requirements": [
    {"node": 0, "requirement": 0}
  ],
  "transform": {"x": 157.2, "y": -166.8},
  "icon": "9d4f68082f4fc38458916f06d0af3a1f"
}
```

### `skillTrees[class/weaver].nodes`

- **Location:** `skillTrees.<treeId>.nodes.<nodeId>`
- **Keying:** object keyed by nodeId
- **Record count:** 621
- **Notes:** Flattened over class trees + weaver.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `maxPoints` | number | always | values 0,1,2,3,4,5,6,7,8,10,12 | `8` | Maximum points in the node (0 = free/root). |
| `mastery` | number | always | values 0,1,2,3 | `0` | Mastery gate (0 base class, 1..3 mastery; see enums.md). |
| `masteryRequirement` | number | always | values 0,5,10,15,20,25,30,35,40,45 | `0` | Points that must be spent in the class tree before the node unlocks (class trees: multiples of 5 up to 45; always 0 in ability and weaver trees). |
| `nodeName` | string | always | >12 distinct | `"Bone Aura"` |  |
| `description` | string | always | >12 distinct | `""` | English description text. |
| `altText` | string | always | >12 distinct | `""` | English alt tooltip text. |
| `loreText` | string | always | values "" | `""` | English lore text. |
| `noScalingType` | number | always | values 0,1 | `0` | No-scaling type. |
| `noScalingPointThreshold` | number | always | values 0,2,3,4,5,6,7,8 | `0` | No-scaling point threshold. |
| `pointBonusDescription` | string | always | >12 distinct | `""` | Text for bonus at point thresholds. |
| `stats` | array | always | len 0..7 | `[{"statName":"Armor","value":"+20","noScaling":false,"dow...` | Stat lines. |
| `stats[]` | object | 1510 occurrences |  | `{"statName":"Armor","value":"+20","noScaling":false,"down...` | Stat lines. |
| `stats[].statName` | string | 1510 occurrences | >12 distinct | `"Armor"` | English stat label. |
| `stats[].value` | string | 1510 occurrences | >12 distinct | `"+20"` | Stat value (number) or roll min for unique mods / display string on tree nodes. |
| `stats[].noScaling` | boolean | 1510 occurrences | values false,true | `false` | Stat does not scale with points. |
| `stats[].downside` | boolean | 1510 occurrences | values false,true | `false` | Stat is a downside (red). |
| `stats[].property` | number | 1510 occurrences | 0..25203 (>12 distinct) | `10` | Stat property id (SP enum, see enums.md). |
| `stats[].tags` | number | 1510 occurrences | 0..1048576 (>12 distinct) | `0` | Tag bit mask (AT enum, see enums.md). |
| `stats[].overrideSprite` | boolean | 1510 occurrences | values true,false | `true` | Uses custom sprite. |
| `stats[].sprite` | string | 1510 occurrences | >12 distinct | `"b30b261b7ace5824e9c3414022a63ac1"` | Sprite id (LE Tools) or md5 hash (Maxroll). |
| `requirements` | array | always | len 0..5 | `[]` | Prerequisites: [{nodeId, requirement}] (see enums.md). |
| `transform` | object | always |  | `{"x":51.779999999999994,"y":-300.492}` | {x,y} node position in tree canvas (Maxroll). |
| `transform.x` | number | 617/621 (99.4%) | -1081.2..1193.88 (>12 distinct) | `51.779999999999994` |  |
| `transform.y` | number | 617/621 (99.4%) | -1082.4..892.8 (>12 distinct) | `-300.492` |  |
| `icon` | string | 620/621 (99.8%) | >12 distinct | `"b30b261b7ace5824e9c3414022a63ac1"` | Sprite hash (treeAtlas entry). |
| `requirements[]` | object | 351 occurrences |  | `{"node":55,"requirement":1}` | Prerequisites: [{nodeId, requirement}] (see enums.md). |
| `requirements[].node` | number | 351 occurrences | 0..191 (>12 distinct) | `55` | Prerequisite node id (Maxroll name of nodeId). |
| `requirements[].requirement` | number | 351 occurrences | values 0,1,2,3,4,5 | `1` | Points that must be allocated in node nodeId before this node unlocks (0 = plain link; 1..5; see enums.md). |
| `transform.scale` | number | 4/621 (0.6%) | values -1,1.3 | `-1` |  |
| `abilityGrantedByNode` | string | 50/621 (8.1%) | >12 distinct | `"SummonRevenant"` |  |
| `transform.rotation` | object | 84/621 (13.5%) |  | `{"x":0,"y":0,"z":1,"w":0}` |  |
| `transform.rotation.x` | number | 84/621 (13.5%) | values 0,0.7063457 | `0` |  |
| `transform.rotation.y` | number | 84/621 (13.5%) | values -0.7078671,0,1 | `0` |  |
| `transform.rotation.z` | number | 84/621 (13.5%) | -1..1 (>12 distinct) | `1` |  |
| `transform.rotation.w` | number | 84/621 (13.5%) | -0.9948679..0.9853703 (>12 distinct) | `0` |  |
| `weaverEffect` | number | 80/621 (12.9%) | 0..191 (>12 distinct) | `0` |  |

Example (record #3, trimmed):

```json
{
  "maxPoints": 10,
  "mastery": 0,
  "masteryRequirement": 5,
  "nodeName": "Mania of Mortality",
  "description": "You have additional ward decay threshold. Additionally, when...",
  "altText": "Ward is an overshield shield that protects your health. It h...",
  "loreText": "",
  "noScalingType": 0,
  "noScalingPointThreshold": 0,
  "pointBonusDescription": "",
  "stats": [
    {
      "statName": "Ward Decay Threshold",
      "value": "+10",
      "noScaling": false,
      "downside": false,
      "property": 54,
      "tags": 0,
      "overrideSprite": true,
      "sprite": "a5842a736c5c29a469246bc8eca09dcd"
    },
    {
      "statName": "Chance To Gain Ward On Nearby Death",
      "value": "10%",
      "noScaling": false,
      "downside": false,
      "property": 54,
      "tags": 0,
      "overrideSprite": true,
      "sprite": "94a1f45e25bdf064596c2b9a8507a460"
    },
    "...(+1 more)"
  ],
  "requirements": [],
  "transform": {"x": 250.38, "y": -485.052},
  "icon": "2483a085251ddb641995a69bf2ffbf3a"
}
```

### `skillTrees...nodes[].stats[]`

- **Location:** `...nodes.<id>.stats[]`
- **Keying:** array
- **Record count:** 8038

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `statName` | string | always | >12 distinct | `"Armor"` | English stat label. |
| `value` | string | always | >12 distinct | `"+20"` | Stat value (number) or roll min for unique mods / display string on tree nodes. |
| `noScaling` | boolean | always | values false,true | `false` | Stat does not scale with points. |
| `downside` | boolean | always | values false,true | `false` | Stat is a downside (red). |
| `property` | number | always | 0..25206 (>12 distinct) | `10` | Stat property id (SP enum, see enums.md). |
| `tags` | number | always | 0..1048576 (>12 distinct) | `0` | Tag bit mask (AT enum, see enums.md). |
| `overrideSprite` | boolean | always | values true,false | `true` | Uses custom sprite. |
| `sprite` | string | 8037/8038 (100.0%) | >12 distinct | `"b30b261b7ace5824e9c3414022a63ac1"` | Sprite id (LE Tools) or md5 hash (Maxroll). |

Example (record #7, trimmed):

```json
{
  "statName": "Chance To Gain Ward On Nearby Death",
  "value": "10%",
  "noScaling": false,
  "downside": false,
  "property": 54,
  "tags": 0,
  "overrideSprite": true,
  "sprite": "94a1f45e25bdf064596c2b9a8507a460"
}
```

### `skillTrees...nodes[].requirements[]`

- **Location:** `...nodes.<id>.requirements[]`
- **Keying:** array
- **Record count:** 4928

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `node` | number | always | 0..191 (>12 distinct) | `55` | Prerequisite node id (Maxroll name of nodeId). |
| `requirement` | number | always | values 0,1,2,3,4,5 | `1` | Points that must be allocated in node nodeId before this node unlocks (0 = plain link; 1..5; see enums.md). |

Example (record #0, trimmed):

```json
{"node": 55, "requirement": 1}
```

### `skillTrees[ability].ability`

- **Location:** `skillTrees.<abilityId>.ability`
- **Keying:** string or object
- **Record count:** 136

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `ability` | string | always | >12 distinct | `"SummonWolf"` |  |

Example (record #1, trimmed):

```json
{"ability": "RogueMultishot"}
```

### `treeAtlas`

- **Location:** `treeAtlas`
- **Keying:** array of 32-hex sprite hashes (1172)
- **Record count:** 1172
- **Notes:** Texture/sprite ids referenced by node `sprite`/`icon`.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `hash` | string | always | >12 distinct | `"bd38e62b59b9f074791a74b4cacb0ba6"` |  |

Example (record #0, trimmed):

```json
{"hash": "bd38e62b59b9f074791a74b4cacb0ba6"}
```

### `classes`

- **Location:** `classes`
- **Keying:** array; index = classID (0..4)
- **Record count:** 5

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `className` | string | always | values "Primalist","Mage","Sentinel","Acolyte","Rogue" | `"Primalist"` | Class name. |
| `classID` | number | always | values 0,1,2,3,4 | `0` | Class id 0..4. |
| `treeID` | string | always | values "pr-1","mg-1","kn-1","ac-1","rg-1" | `"pr-1"` | Tree id. |
| `hideThirdMasterySkillsInPanel` | boolean | always | values false | `false` |  |
| `specialTagForClassSpecificLevelOfSkillsStats` | number | always | values 2,3,4,5,6 | `2` |  |
| `baseHealth` | number | always | values 100 | `100` | Base health. |
| `baseMana` | number | always | values 50 | `50` | Base mana. |
| `healthPerLevel` | number | always | values 10 | `10` | Health per level. |
| `manaPerLevel` | number | always | values 0.50506 | `0.50506` | Mana per level. |
| `manaRegen` | number | always | values 8 | `8` | Base mana regen. |
| `healthRegen` | number | always | values 6 | `6` | Base health regen. |
| `healthRegenPerLevel` | number | always | values 0.14 | `0.14` | Health regen per level. |
| `baseStrength` | number | always | values 0,2 | `2` | Base Strength. |
| `baseDexterity` | number | always | values 0,3 | `0` | Base Dexterity. |
| `baseIntelligence` | number | always | values 0,2,3 | `0` | Base Intelligence. |
| `baseAttunement` | number | always | values 0,1 | `1` | Base Attunement. |
| `baseVitality` | number | always | values 0,1 | `0` | Base Vitality. |
| `firstLevelForMinionScaling` | number | always | values 26 | `26` |  |
| `moreMinionDamagePerLevel` | number | always | values 0.008 | `0.008` |  |
| `lessMinionDamageTakenPerLevel` | number | always | values 0.008 | `0.008` |  |
| `baseStunAvoidance` | number | always | values 250 | `250` | Base stun avoidance. |
| `baseEndurance` | number | always | values 0.2 | `0.2` | Base endurance. |
| `baseEnduranceThreshold` | number | always | values 0 | `0` |  |
| `enduranceThresholdPerLevel` | number | always | values 0 | `0` |  |
| `enduranceThresholdPerHealth` | number | always | values 0.2 | `0.2` |  |
| `baseClassIcon` | string | always | values "Primalist","Mage","Sentinel","Acolyte","Rogue" | `"Primalist"` |  |
| `basicAttackReplacer` | string | always | values "Swipe","ManaStrike","Rive1","Harvest","Puncture" | `"Swipe"` | Basic attack replacement. |
| `defaultAbilities` | array | always | len 6..6 | `["SummonWolf","NullAbility","NullAbility","NullAbility","...` | Default ability bar. |
| `defaultAbilities[]` | string | 30 occurrences | values "SummonWolf","NullAbility","BasicPlayerAttack","Primalist Evade","LightningBlast","Mage Evade","Vengeance","Sentinel Evade","RipBlood","Acolyte Evade","Flurry","Rogue Evade" | `"SummonWolf"` | Default ability bar. |
| `knownAbilities` | array | always | len 2..2 | `["BasicPlayerAttack","SummonWolf"]` | Abilities known at level 1. |
| `knownAbilities[]` | string | 10 occurrences | values "BasicPlayerAttack","SummonWolf","LightningBlast","Vengeance","RipBlood","Flurry" | `"BasicPlayerAttack"` | Abilities known at level 1. |
| `unlockableAbilities` | array | always | len 7..8 | `[{"ability":"GatheringStormMelee","level":2},{"ability":"...` | [{ability, level}] unlocks. |
| `unlockableAbilities[]` | object | 36 occurrences |  | `{"ability":"GatheringStormMelee","level":2}` | [{ability, level}] unlocks. |
| `unlockableAbilities[].ability` | string | 36 occurrences | >12 distinct | `"GatheringStormMelee"` |  |
| `unlockableAbilities[].level` | number | 36 occurrences | 2..19 (>12 distinct) | `2` | Level. |
| `masteries` | array | always | len 4..4 | `[{"name":"Primalist","localizationKey":"Class_Primalist",...` | Mastery definitions. |
| `masteries[]` | object | 20 occurrences |  | `{"name":"Primalist","localizationKey":"Class_Primalist","...` | Mastery definitions. |
| `masteries[].name` | string | 20 occurrences | >12 distinct | `"Primalist"` | Internal / English name. |
| `masteries[].localizationKey` | string | 20 occurrences | >12 distinct | `"Class_Primalist"` | Localization key. |
| `masteries[].icon` | string | 20 occurrences | >12 distinct | `"Primalist"` | Icon sprite/hash. |
| `masteries[].abilities` | array | 20 occurrences | len 4..4 | `[{"ability":"Eterras Blessing","level":5},{"ability":"War...` |  |
| `masteries[].masteryAbility` | string | 15 occurrences | >12 distinct | `"SummonRaptor"` | Mastery-defining ability. |

Example (record #0, trimmed):

```json
{
  "className": "Primalist",
  "classID": 0,
  "treeID": "pr-1",
  "hideThirdMasterySkillsInPanel": false,
  "specialTagForClassSpecificLevelOfSkillsStats": 2,
  "baseHealth": 100,
  "baseMana": 50,
  "healthPerLevel": 10,
  "manaPerLevel": 0.50506,
  "manaRegen": 8,
  "healthRegen": 6,
  "healthRegenPerLevel": 0.14,
  "baseStrength": 2,
  "baseDexterity": 0,
  "baseIntelligence": 0,
  "baseAttunement": 1,
  "baseVitality": 0,
  "firstLevelForMinionScaling": 26,
  "moreMinionDamagePerLevel": 0.008,
  "lessMinionDamageTakenPerLevel": 0.008,
  "baseStunAvoidance": 250,
  "baseEndurance": 0.2,
  "baseEnduranceThreshold": 0,
  "enduranceThresholdPerLevel": 0,
  "enduranceThresholdPerHealth": 0.2,
  "baseClassIcon": "Primalist",
  "basicAttackReplacer": "Swipe",
  "defaultAbilities": ["SummonWolf", "NullAbility", "...(+4 more)"],
  "knownAbilities": ["BasicPlayerAttack", "SummonWolf"],
  "unlockableAbilities": [
    {"ability": "GatheringStormMelee", "level": 2},
    {"ability": "FuryLeap", "level": 3},
    "...(+5 more)"
  ],
  "masteries": [
    {
      "name": "Primalist",
      "localizationKey": "Class_Primalist",
      "icon": "Primalist",
      "abilities": [
        {"ability": "Eterras Blessing", "level": 5},
        {"ability": "Warcry", "level": 10},
        "...(+2 more)"
      ]
    },
    {
      "name": "Beastmaster",
      "localizationKey": "Mastery_Beastmaster",
      "icon": "Beastmaster",
      "masteryAbility": "SummonRaptor",
      "abilities": [
        {"ability": "SummonBear", "level": 5},
        {"ability": "SummonScorpion", "level": 15},
        "...(+2 more)"
      ]
    },
    "...(+2 more)"
  ]
}
```

### `classes[].masteries[]`

- **Location:** `classes[].masteries[]`
- **Keying:** array; index = mastery (0 = base class, 1..3)
- **Record count:** 20

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `name` | string | always | >12 distinct | `"Primalist"` | Internal / English name. |
| `localizationKey` | string | always | >12 distinct | `"Class_Primalist"` | Localization key. |
| `icon` | string | always | >12 distinct | `"Primalist"` | Icon sprite/hash. |
| `abilities` | array | always | len 4..4 | `[{"ability":"Eterras Blessing","level":5},{"ability":"War...` |  |
| `abilities[]` | object | 80 occurrences |  | `{"ability":"Eterras Blessing","level":5}` |  |
| `abilities[].ability` | string | 80 occurrences | >12 distinct | `"Eterras Blessing"` |  |
| `abilities[].level` | number | 80 occurrences | values 5,10,15,20,25,30,35,40 | `5` | Level. |
| `masteryAbility` | string | 15/20 (75.0%) | >12 distinct | `"SummonRaptor"` | Mastery-defining ability. |

Example (record #1, trimmed):

```json
{
  "name": "Beastmaster",
  "localizationKey": "Mastery_Beastmaster",
  "icon": "Beastmaster",
  "masteryAbility": "SummonRaptor",
  "abilities": [
    {"ability": "SummonBear", "level": 5},
    {"ability": "SummonScorpion", "level": 15},
    "...(+2 more)"
  ]
}
```

### `classes[].unlockableAbilities[]`

- **Location:** `classes[].unlockableAbilities[]`
- **Keying:** array
- **Record count:** 36

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `ability` | string | always | >12 distinct | `"GatheringStormMelee"` |  |
| `level` | number | always | 2..19 (>12 distinct) | `2` | Level. |

Example (record #0, trimmed):

```json
{"ability": "GatheringStormMelee", "level": 2}
```

### `abilityProperties`

- **Location:** `abilityProperties`
- **Keying:** array of {abilityID, properties[]}
- **Record count:** 177
- **Notes:** abilityID = ability index (see abilityList).

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `abilityID` | number | always | 0..950 (>12 distinct) | `1` | Ability index (position in abilityList). |
| `properties` | array | always | len 0..48 | `[{"roundingForAdded":0,"roundingForMore":0,"displayAddedA...` |  |
| `properties[]` | object | 2344 occurrences |  | `{"roundingForAdded":0,"roundingForMore":0,"displayAddedAs...` |  |
| `properties[].roundingForAdded` | number | 2344 occurrences | values 0,1,2,3 | `0` | Rounding mode for added values. |
| `properties[].roundingForMore` | number | 2344 occurrences | values 0,1,3 | `0` | Rounding mode for "more" values. |
| `properties[].displayAddedAsPercentage` | boolean | 2344 occurrences | values true,false | `true` | Display added value as a percentage. |
| `properties[].displayAddedAsTenthOfValue` | boolean | 2344 occurrences | values false,true | `false` | Display added value as tenth. |
| `properties[].displayAsPercentageOf` | boolean | 2344 occurrences | values false,true | `false` | Display as "% of ...". |
| `properties[].displayAsAddedTo` | boolean | 2344 occurrences | values false,true | `false` | Display as "added to ...". |
| `properties[].dontDisplayPlus` | boolean | 2344 occurrences | values false,true | `false` | Do not prefix + sign. |
| `properties[].lessIsBetter` | boolean | 2344 occurrences | values false,true | `false` | Lower value is beneficial. |
| `properties[].hideModifierValue` | boolean | 2344 occurrences | values false,true | `false` | Hide the numeric value. |
| `properties[].nameIncludesModifier` | boolean | 2344 occurrences | values false | `false` | Name already includes the modifier word. |
| `properties[].textKey` | string | 2344 occurrences | >12 distinct | `"Property_Ability_fireball_1"` | Maxroll text key (i18n key = Properties.<textKey>[_Name\|_AltText]). |
| `properties[].propertyName` | string | 2344 occurrences | >12 distinct | `"Pierce Chance with Fireball"` | English property name. |
| `properties[].altText` | string | 2344 occurrences | >12 distinct | `"Gives Fireball a chance to continue through targets it h...` | English alt tooltip text. |

Example (record #0, trimmed):

```json
{
  "abilityID": 1,
  "properties": [
    {
      "roundingForAdded": 0,
      "roundingForMore": 0,
      "displayAddedAsPercentage": true,
      "displayAddedAsTenthOfValue": false,
      "displayAsPercentageOf": false,
      "displayAsAddedTo": false,
      "dontDisplayPlus": false,
      "lessIsBetter": false,
      "hideModifierValue": false,
      "nameIncludesModifier": false,
      "textKey": "Property_Ability_fireball_1",
      "propertyName": "Pierce Chance with Fireball",
      "altText": "Gives Fireball a chance to continue through targets it hits"
    },
    {
      "roundingForAdded": 1,
      "roundingForMore": 0,
      "displayAddedAsPercentage": false,
      "displayAddedAsTenthOfValue": false,
      "displayAsPercentageOf": false,
      "displayAsAddedTo": false,
      "dontDisplayPlus": false,
      "lessIsBetter": false,
      "hideModifierValue": false,
      "nameIncludesModifier": false,
      "textKey": "Property_Ability_fireball_2",
      "propertyName": "Projectiles for Fireball",
      "altText": "If you have the Embers node on the Fireball tree, this bonus..."
    },
    "...(+15 more)"
  ]
}
```

### `abilityProperties[].properties[]`

- **Location:** `abilityProperties[].properties[]`
- **Keying:** array; index = specialTag of an AbilityProperty(58) stat
- **Record count:** 2344

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `roundingForAdded` | number | always | values 0,1,2,3 | `0` | Rounding mode for added values. |
| `roundingForMore` | number | always | values 0,1,3 | `0` | Rounding mode for "more" values. |
| `displayAddedAsPercentage` | boolean | always | values true,false | `true` | Display added value as a percentage. |
| `displayAddedAsTenthOfValue` | boolean | always | values false,true | `false` | Display added value as tenth. |
| `displayAsPercentageOf` | boolean | always | values false,true | `false` | Display as "% of ...". |
| `displayAsAddedTo` | boolean | always | values false,true | `false` | Display as "added to ...". |
| `dontDisplayPlus` | boolean | always | values false,true | `false` | Do not prefix + sign. |
| `lessIsBetter` | boolean | always | values false,true | `false` | Lower value is beneficial. |
| `hideModifierValue` | boolean | always | values false,true | `false` | Hide the numeric value. |
| `nameIncludesModifier` | boolean | always | values false | `false` | Name already includes the modifier word. |
| `textKey` | string | always | >12 distinct | `"Property_Ability_fireball_1"` | Maxroll text key (i18n key = Properties.<textKey>[_Name\|_AltText]). |
| `propertyName` | string | always | >12 distinct | `"Pierce Chance with Fireball"` | English property name. |
| `altText` | string | always | >12 distinct | `"Gives Fireball a chance to continue through targets it h...` | English alt tooltip text. |

Example (record #0, trimmed):

```json
{
  "roundingForAdded": 0,
  "roundingForMore": 0,
  "displayAddedAsPercentage": true,
  "displayAddedAsTenthOfValue": false,
  "displayAsPercentageOf": false,
  "displayAsAddedTo": false,
  "dontDisplayPlus": false,
  "lessIsBetter": false,
  "hideModifierValue": false,
  "nameIncludesModifier": false,
  "textKey": "Property_Ability_fireball_1",
  "propertyName": "Pierce Chance with Fireball",
  "altText": "Gives Fireball a chance to continue through targets it hits"
}
```

### `affixes`

- **Location:** `affixes`
- **Keying:** array; each record has `affixId`; single + multi merged
- **Record count:** 1156

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `affixName` | string | always | >12 distinct | `"Void Penetration"` | Internal affix name. |
| `affixDisplayName` | string | always | >12 distinct | `""` | Display name (Maxroll English). |
| `affixLootFilterOverrideName` | string | always | values "","Increased Armor","Added Dodge Rating","Added Health","Added Armor","Increased Health","Increased Dodge Rating","Percent Damage Reflected","Increased Mana","Dodge while Evading and Increased Do...","Increased Mana and Mana Regen" | `""` | Loot-filter name override. |
| `titleType` | number | always | values 0,1 | `0` | 0 = ordinary title, 1 = title is the class name possessive (e.g. Primalist possessive) -- 303/303 are class-specific affixes (enums.md). |
| `affixTitle` | string | always | >12 distinct | `"Inevitable"` | Prefix/suffix title text. |
| `affixMorphology` | number | always | values 0,1,2,3 | `2` | Grammatical shape of the title (enums.md): 0 noun possessive (e.g. Guardian possessive), 1 class possessive, 2 adjective prefix ("Inevitable"), 3 suffix phrase ("of Defense"). |
| `affixId` | number | always | 0..1156 (>12 distinct) | `0` | Affix numeric id (0..1155). |
| `levelRequirement` | number | always | 0..80 (>12 distinct) | `42` | Level required to equip/use. |
| `rollsOn` | number | always | values 0,1 | `0` | 0 = rolls on gear/altar, 1 = rolls on idols (472/472 affixes with canRollOn in idol base types 25..33 have rollsOn=1; no other affix does). |
| `specialAffixType` | number | always | values 0,1,2,3,4,5,6,7 | `0` | 0 normal, 1 experimental, 2 personal, 3 set (reforged), 4 enchanted idol, 5 weaver idol, 6 corrupted / idol altar, 7 variant (see enums.md). |
| `classSpecificity` | number | always | 0..61 (>12 distinct) | `0` | Class bit mask for the affix: 1<<(classID+1); bit 0 (=1) used by Weaver idol affixes. |
| `uniqueId` | number | always | 0..482 (>12 distinct) | `0` | Unique item id (0..488). |
| `type` | number | always | values 0,1 | `0` | Affix type: 0 prefix, 1 suffix (enums.md). |
| `standardAffixEffectModifier` | number | always | values -0.83,-0.62,-0.33,-0.05,0,0.17,0.5,0.75,2.2 | `0.17` | Affix effectiveness modifier. |
| `weighting` | number | always | 0.06..2 (>12 distinct) | `0.3` | Roll weight. |
| `weaponEffect` | number | always | values 0,1,2,3,4,5,6,7,9,14 | `0` | Weapon effect flag. |
| `group` | number | always | values 0,1,2,3,4,5,6,7 | `2` | Group id 0..7 (semantics not confirmed; sample affixes per group in enums.md). |
| `shardHueShift` | number | always | 0..1 (>12 distinct) | `0.769` | Shard icon hue shift. |
| `shardSaturationModifier` | number | always | -1..1 (>12 distinct) | `-0.349` | Shard icon saturation modifier. |
| `canRollOn` | array | always | len 1..20 | `[20]` | Base type ids the affix can roll on. |
| `canRollOn[]` | number | 2540 occurrences | 0..41 (>12 distinct) | `20` | Base type ids the affix can roll on. |
| `specificRerollChances` | array | always | len 0..14 | `[]` | Per-equipment-type reroll overrides. |
| `convertOnIncompatibleItemType` | boolean | always | values false,true | `false` | Convert to another affix on incompatible base type. |
| `affixIDToConvertTo` | number | always | values 0,1,10,30,31,38,87,117,330 | `0` | Target affix id for conversion. |
| `tiers` | array | always | len 1..8 | `[{"minRoll":0.04,"maxRoll":0.04,"extraRolls":[]},{"minRol...` | Tier list. |
| `tiers[]` | object | 6238 occurrences |  | `{"minRoll":0.04,"maxRoll":0.04,"extraRolls":[]}` | Tier list. |
| `tiers[].minRoll` | number | 6238 occurrences | -1..2240 (>12 distinct) | `0.04` | Roll min. |
| `tiers[].maxRoll` | number | 6238 occurrences | -1..2800 (>12 distinct) | `0.04` | Roll max. |
| `tiers[].extraRolls` | array | 6238 occurrences | len 0..1 | `[]` | Additional {min,max} per extra stat line (multi affixes). |
| `t6Compatibility` | number | always | values 0,1,2 | `0` | 0 normal, 1..2 special T6/exalted compatibility. |
| `maximumAffixEffectModifierForT6` | number | always | values 0 | `0` | Cap on effect modifier for T6. |
| `displayCategory` | number | always | 0..44 (>12 distinct) | `3` | Index into displayCategoryKeys / affixDisplayCategories. |
| `abilityTooltipToShowInAltTooltip` | object | always |  | `{"key":0}` | Ability whose tooltip is shown in alt tooltip ({key:abilityIndex}). |
| `abilityTooltipToShowInAltTooltip.key` | number | always | values -1324250445,-1291134271,-1083171404,-1008054101,-973438929,-721045722,0,239640293,459685213,687455955,794097924,912498865 | `0` | Opaque id/key. |
| `property` | number | 616/1156 (53.3%) | 0..130 (>12 distinct) | `59` | Stat property id (SP enum, see enums.md). |
| `specialTag` | number | 616/1156 (53.3%) | 0..93 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `tags` | number | 616/1156 (53.3%) | 0..16777472 (>12 distinct) | `16` | Tag bit mask (AT enum, see enums.md). |
| `extraTag` | number | 616/1156 (53.3%) | values 0,143 | `0` | Tertiary selector (e.g. extra tag); mostly 0. |
| `modifierType` | number | 616/1156 (53.3%) | values 0,1,2 | `0` | 0 added, 1 increased, 2 more (see enums.md). |
| `setProperty` | boolean | 616/1156 (53.3%) | values false | `false` | 1 if the stat line is a set-bonus style property (1 case). |
| `useGeneratedNameForDisplayName` | boolean | 616/1156 (53.3%) | values true,false | `true` | Display name is generated from the stat. |
| `specificRerollChances[]` | object | 218 occurrences |  | `{"equipmentType":2,"rerollChance":0.5,"weighting":0.5}` | Per-equipment-type reroll overrides. |
| `specificRerollChances[].equipmentType` | number | 218 occurrences | 2..33 (>12 distinct) | `2` | Base type id the override applies to. |
| `specificRerollChances[].rerollChance` | number | 218 occurrences | values 0,0.1,0.2,0.3,0.4,0.45,0.5,0.6,0.7,0.75,0.8,0.9 | `0.5` | Chance for the drop to be re-rolled to another type. |
| `specificRerollChances[].weighting` | number | 218 occurrences | values 0.1,0.2,0.25,0.3,0.4,0.5,0.55,0.6,0.7,0.8,0.9,1 | `0.5` | Roll weight. |
| `affixProperties` | array | 540/1156 (46.7%) | len 2..2 | `[{"modDisplayName":"","property":67,"specialTag":0,"tags"...` | Stat lines granted by the affix. |
| `affixProperties[]` | object | 1080 occurrences |  | `{"modDisplayName":"","property":67,"specialTag":0,"tags":...` | Stat lines granted by the affix. |
| `affixProperties[].modDisplayName` | string | 1080 occurrences | >12 distinct | `""` | English stat-line text. |
| `affixProperties[].property` | number | 1080 occurrences | 0..130 (>12 distinct) | `67` | Stat property id (SP enum, see enums.md). |
| `affixProperties[].specialTag` | number | 1080 occurrences | 0..93 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `affixProperties[].tags` | number | 1080 occurrences | 0..33554432 (>12 distinct) | `0` | Tag bit mask (AT enum, see enums.md). |
| `affixProperties[].extraTag` | number | 1080 occurrences | values 0,220,263,267,353 | `0` | Tertiary selector (e.g. extra tag); mostly 0. |
| `affixProperties[].modifierType` | number | 1080 occurrences | values 0,1,2 | `0` | 0 added, 1 increased, 2 more (see enums.md). |
| `affixProperties[].setProperty` | boolean | 1080 occurrences | values false,true | `false` | 1 if the stat line is a set-bonus style property (1 case). |
| `affixProperties[].disableAltText` | boolean | 1080 occurrences | values false,true | `false` | Suppress alt tooltip. |
| `affixProperties[].useGeneratedNameForDisplayName` | boolean | 1080 occurrences | values true,false | `true` | Display name is generated from the stat. |

Example (record #1, trimmed):

```json
{
  "affixName": "Increased Armor",
  "affixDisplayName": "Armor",
  "affixLootFilterOverrideName": "Increased Armor",
  "titleType": 0,
  "affixTitle": "of Defense",
  "affixMorphology": 3,
  "affixId": 1,
  "levelRequirement": 14,
  "rollsOn": 0,
  "specialAffixType": 0,
  "classSpecificity": 0,
  "uniqueId": 0,
  "type": 1,
  "standardAffixEffectModifier": 0,
  "weighting": 0.6,
  "weaponEffect": 0,
  "group": 0,
  "shardHueShift": 0.117,
  "shardSaturationModifier": -0.3,
  "canRollOn": [0, 1, "...(+2 more)"],
  "specificRerollChances": [
    {"equipmentType": 2, "rerollChance": 0.5, "weighting": 0.5}
  ],
  "convertOnIncompatibleItemType": false,
  "affixIDToConvertTo": 0,
  "tiers": [
    {"minRoll": 0.1, "maxRoll": 0.12, "extraRolls": []},
    {"minRoll": 0.13, "maxRoll": 0.16, "extraRolls": []},
    "...(+6 more)"
  ],
  "t6Compatibility": 0,
  "maximumAffixEffectModifierForT6": 0,
  "displayCategory": 8,
  "abilityTooltipToShowInAltTooltip": {"key": 0},
  "property": 10,
  "specialTag": 0,
  "tags": 0,
  "extraTag": 0,
  "modifierType": 1,
  "setProperty": false,
  "...": "+1 more keys"
}
```

### `affixes[].tiers[]`

- **Location:** `affixes[].tiers[]`
- **Keying:** array; index = tier
- **Record count:** 6238

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `minRoll` | number | always | -1..2240 (>12 distinct) | `0.04` | Roll min. |
| `maxRoll` | number | always | -1..2800 (>12 distinct) | `0.04` | Roll max. |
| `extraRolls` | array | always | len 0..1 | `[]` | Additional {min,max} per extra stat line (multi affixes). |
| `extraRolls[]` | object | 3473 occurrences |  | `{"minRoll":0.05,"maxRoll":0.05}` | Additional {min,max} per extra stat line (multi affixes). |
| `extraRolls[].minRoll` | number | 3473 occurrences | -100..3200 (>12 distinct) | `0.05` | Roll min. |
| `extraRolls[].maxRoll` | number | 3473 occurrences | -91..4000 (>12 distinct) | `0.05` | Roll max. |

Example (record #0, trimmed):

```json
{"minRoll": 0.04, "maxRoll": 0.04, "extraRolls": []}
```

### `affixes[].specificRerollChances[]`

- **Location:** `affixes[].specificRerollChances[]`
- **Keying:** array
- **Record count:** 218

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `equipmentType` | number | always | 2..33 (>12 distinct) | `2` | Base type id the override applies to. |
| `rerollChance` | number | always | values 0,0.1,0.2,0.3,0.4,0.45,0.5,0.6,0.7,0.75,0.8,0.9 | `0.5` | Chance for the drop to be re-rolled to another type. |
| `weighting` | number | always | values 0.1,0.2,0.25,0.3,0.4,0.5,0.55,0.6,0.7,0.8,0.9,1 | `0.5` | Roll weight. |

Example (record #0, trimmed):

```json
{"equipmentType": 2, "rerollChance": 0.5, "weighting": 0.5}
```

### `affixCategoryHeaders`

- **Location:** `affixCategoryHeaders`
- **Keying:** array
- **Record count:** 12

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `name` | string | always | values "Core","Offensive","Defensive","Other","Ailments","Class Specific","Idols","Experimental","Personal","Set","Corrupted","Variant" | `"Core"` | Internal / English name. |
| `categories` | array | always | len 1..11 | `[0]` |  |
| `categories[]` | number | 43 occurrences | 0..44 (>12 distinct) | `0` |  |

Example (record #1, trimmed):

```json
{"name": "Offensive", "categories": [1,2,"...(+4 more)"]}
```

### `affixDisplayCategories`

- **Location:** `affixDisplayCategories`
- **Keying:** array of strings; index = displayCategory
- **Record count:** 45

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `name` | string | always | >12 distinct | `"Attributes"` | Internal / English name. |

Example (record #0, trimmed):

```json
{"name": "Attributes"}
```

### `itemTypes`

- **Location:** `itemTypes`
- **Keying:** array; each record has `baseTypeID` (0..41, 101..109)
- **Record count:** 51
- **Notes:** Base types with nested `subItems`.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `BaseTypeName` | string | always | >12 distinct | `"Helmets"` |  |
| `displayName` | string | always | >12 distinct | `"Helmet"` | English display name. |
| `lootFilterNameOverride` | string | always | values "","Small Idol","Minor Idol","Humble Idol","Stout Idol","Grand Idol","Large Idol","Ornate Idol","Huge Idol","Adorned Idol" | `""` |  |
| `baseTypeID` | number | always | 0..109 (>12 distinct) | `0` | Base item type id. |
| `maximumAffixes` | number | always | values 0,2,4 | `4` | Max affixes an item of this base type may have. |
| `maxSockets` | number | always | values 0 | `0` | Max sockets. |
| `affixEffectModifier` | number | always | values -0.83,-0.62,-0.33,-0.05,0,0.17,0.5,0.6,0.75,2.2 | `0` | Base affix effectiveness modifier for the base type (idols/relics >0). |
| `gridSize` | object | always |  | `{"x":2,"y":2}` | Inventory grid size {x,y}. |
| `gridSize.x` | number | always | values 0,1,2,3,4 | `2` |  |
| `gridSize.y` | number | always | values 0,1,2,3,4 | `2` |  |
| `type` | number | 42/51 (82.4%) | 0..41 (>12 distinct) | `0` | Equal to baseTypeID for equippable base types (verified). |
| `isWeapon` | boolean | 42/51 (82.4%) | values false,true | `false` | 1/true if base type is a weapon. |
| `minimumDropLevel` | number | 42/51 (82.4%) | values 0,5,11,20,25,30 | `0` | Min area level for drops. |
| `goldCostModifier` | number | 42/51 (82.4%) | values -0.5,-0.4,0,0.3,0.5,4,5,9,10,21,30,40 | `0` |  |
| `addedGambleCost` | number | 42/51 (82.4%) | values 0,2150,2700,3100,3600,4000 | `3100` |  |
| `rerollChance` | number | 42/51 (82.4%) | values 0,0.25,0.5,0.8,0.88,0.89,0.9,0.91,0.95,1 | `0` | Chance for the drop to be re-rolled to another type. |
| `classAffinity` | number | 42/51 (82.4%) | values 0,5,10,13,15,16,21,26 | `0` | Class affinity (class bit mask, see enums.md). |
| `affinityRerollChance` | number | 42/51 (82.4%) | values 0 | `0` | Reroll chance when affinity mismatches. |
| `subTypeDropUpgradeChanceMultiplier` | number | 42/51 (82.4%) | values -1,0,0.5,1 | `1` |  |
| `subTypeDropUpgradeChanceMultiplierPerLevel` | number | 42/51 (82.4%) | values 0,0.01,0.02 | `0` |  |
| `subTypeClassSpecificity` | number | 42/51 (82.4%) | values 0,1,2 | `1` | Class specificity mode for sub types (0/1/2). |
| `usePreClassIncompatibilityDropLists` | boolean | 42/51 (82.4%) | values true,false | `true` |  |
| `preClassIncompatibilityDropLists` | array | 42/51 (82.4%) | len 0..5 | `[{"list":[24,25,53]},{"list":[16,17,18]},{"list":[32,33,5...` |  |
| `preClassIncompatibilityDropLists[]` | object | 15 occurrences |  | `{"list":[24,25,53]}` |  |
| `preClassIncompatibilityDropLists[].list` | array | 15 occurrences | len 3..4 | `[24,25,53]` |  |
| `subItems` | array | always | len 0..508 | `[{"name":"Mercenary Helmet","displayName":"Refuge Helmet"...` | Sub types (individual base items). |
| `subItems[]` | object | 1571 occurrences |  | `{"name":"Mercenary Helmet","displayName":"Refuge Helmet",...` | Sub types (individual base items). |
| `subItems[].name` | string | 1571 occurrences | >12 distinct | `"Mercenary Helmet"` | Internal / English name. |
| `subItems[].displayName` | string | 1571 occurrences | >12 distinct | `"Refuge Helmet"` | English display name. |
| `subItems[].subTypeID` | number | 1571 occurrences | 0..1156 (>12 distinct) | `0` | Sub type id within base type. |
| `subItems[].levelRequirement` | number | 1571 occurrences | 0..100 (>12 distinct) | `0` | Level required to equip/use. |
| `subItems[].onlyDropWhenRequiringAffixEffectiveness` | boolean | 1571 occurrences | values false,true | `false` | Drop only where affix effectiveness is required. |
| `subItems[].isCorruptedSubtype` | boolean | 1571 occurrences | values false,true | `false` | 1 for corrupted-only sub types. |
| `subItems[].cannotDrop` | boolean | 1571 occurrences | values true,false | `true` | 1 if the sub type never drops randomly. |
| `subItems[].itemTags` | number | 1571 occurrences | values 0 | `0` | Item tag bit mask (always 0 in this data). |
| `subItems[].hideSubTypeInLootFilter` | boolean | 1571 occurrences | values false,true | `false` |  |
| `subItems[].implicits` | array | 923 occurrences | len 0..3 | `[{"property":10,"specialTag":0,"tags":0,"extraTag":0,"typ...` | Implicit stat lines of the sub type. |
| `subItems[].classRequirement` | number | 923 occurrences | values 0,1,2,4,8,16 | `0` | Class requirement bit mask: 1<<classID (1 Primalist, 2 Mage, 4 Sentinel, 8 Acolyte, 16 Rogue). |
| `subItems[].subClassRequirement` | number | 923 occurrences | values 0 | `0` | Mastery requirement. |
| `subItems[].cannotBeUpgradedOnDrop` | boolean | 923 occurrences | values false,true | `false` |  |
| `subItems[].affixEffectiveness` | number | 923 occurrences | values 0,1 | `0` | Affix effectiveness granted by the sub type. |
| `subItems[].addedWeaponRange` | number | 923 occurrences | values -0.2,-0.1,0,0.1,0.3,0.5,0.6,0.7,0.9,1.1 | `0` | Added weapon range. |
| `subItems[].attackRate` | number | 923 occurrences | 0.76..1.24 (>12 distinct) | `1` | Weapon attacks per second. |
| `subItems[].IMSetTier` | number | 923 occurrences | values 0,1,2,3,4,5,6,7,8,9 | `6` | Item-model set tier (visual). |
| `subItems[].IMSetOverrides` | array | 923 occurrences | len 0..2 | `[]` | Item-model overrides. |
| `subItems[].rerollChance` | number | 648 occurrences | values 0,0.15,0.2,0.35,0.75,0.85,0.9,0.95,0.975,0.99,0.995,1 | `0` | Chance for the drop to be re-rolled to another type. |
| `subItems[].description` | string | 648 occurrences | >12 distinct | `"Augments an item to grant it a new property or improve a...` | English description text. |

Example (record #0, trimmed):

```json
{
  "BaseTypeName": "Helmets",
  "displayName": "Helmet",
  "lootFilterNameOverride": "",
  "baseTypeID": 0,
  "maximumAffixes": 4,
  "maxSockets": 0,
  "affixEffectModifier": 0,
  "gridSize": {"x": 2, "y": 2},
  "type": 0,
  "isWeapon": false,
  "minimumDropLevel": 0,
  "goldCostModifier": 0,
  "addedGambleCost": 3100,
  "rerollChance": 0,
  "classAffinity": 0,
  "affinityRerollChance": 0,
  "subTypeDropUpgradeChanceMultiplier": 1,
  "subTypeDropUpgradeChanceMultiplierPerLevel": 0,
  "subTypeClassSpecificity": 1,
  "usePreClassIncompatibilityDropLists": true,
  "preClassIncompatibilityDropLists": [
    {"list": [24,25,"...(+1 more)"]},
    {"list": [16,17,"...(+1 more)"]},
    "...(+3 more)"
  ],
  "subItems": [
    {
      "name": "Mercenary Helmet",
      "displayName": "Refuge Helmet",
      "subTypeID": 0,
      "levelRequirement": 0,
      "onlyDropWhenRequiringAffixEffectiveness": false,
      "isCorruptedSubtype": false,
      "cannotDrop": true,
      "itemTags": 0,
      "hideSubTypeInLootFilter": false,
      "implicits": [
        {
          "property": 10,
          "specialTag": 0,
          "tags": 0,
          "extraTag": 0,
          "type": 0,
          "implicitValue": 14,
          "implicitMaxValue": 14
        }
      ],
      "classRequirement": 0,
      "subClassRequirement": 0,
      "cannotBeUpgradedOnDrop": false,
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "IMSetTier": 6,
      "IMSetOverrides": []
    },
    {
      "name": "Leather Helmet",
      "displayName": "Jewelled Circlet",
      "subTypeID": 1,
      "levelRequirement": 7,
      "onlyDropWhenRequiringAffixEffectiveness": false,
      "isCorruptedSubtype": false,
      "cannotDrop": true,
      "itemTags": 0,
      "hideSubTypeInLootFilter": false,
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
      "classRequirement": 0,
      "subClassRequirement": 0,
      "cannotBeUpgradedOnDrop": false,
      "affixEffectiveness": 0,
      "addedWeaponRange": 0,
      "attackRate": 1,
      "IMSetTier": 7,
      "IMSetOverrides": []
    },
    "...(+71 more)"
  ]
}
```

### `itemTypes[].subItems[]`

- **Location:** `itemTypes[].subItems[]`
- **Keying:** array; each record has `subTypeID`
- **Record count:** 1571

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `name` | string | always | >12 distinct | `"Mercenary Helmet"` | Internal / English name. |
| `displayName` | string | always | >12 distinct | `"Refuge Helmet"` | English display name. |
| `subTypeID` | number | always | 0..1156 (>12 distinct) | `0` | Sub type id within base type. |
| `levelRequirement` | number | always | 0..100 (>12 distinct) | `0` | Level required to equip/use. |
| `onlyDropWhenRequiringAffixEffectiveness` | boolean | always | values false,true | `false` | Drop only where affix effectiveness is required. |
| `isCorruptedSubtype` | boolean | always | values false,true | `false` | 1 for corrupted-only sub types. |
| `cannotDrop` | boolean | always | values true,false | `true` | 1 if the sub type never drops randomly. |
| `itemTags` | number | always | values 0 | `0` | Item tag bit mask (always 0 in this data). |
| `hideSubTypeInLootFilter` | boolean | always | values false,true | `false` |  |
| `implicits` | array | 923/1571 (58.8%) | len 0..3 | `[{"property":10,"specialTag":0,"tags":0,"extraTag":0,"typ...` | Implicit stat lines of the sub type. |
| `implicits[]` | object | 1536 occurrences |  | `{"property":10,"specialTag":0,"tags":0,"extraTag":0,"type...` | Implicit stat lines of the sub type. |
| `implicits[].property` | number | 1536 occurrences | 0..133 (>12 distinct) | `10` | Stat property id (SP enum, see enums.md). |
| `implicits[].specialTag` | number | 1536 occurrences | 0..85 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `implicits[].tags` | number | 1536 occurrences | 0..16777216 (>12 distinct) | `0` | Tag bit mask (AT enum, see enums.md). |
| `implicits[].extraTag` | number | 1536 occurrences | values 0 | `0` | Tertiary selector (e.g. extra tag); mostly 0. |
| `implicits[].type` | number | 1536 occurrences | values 0,1,2 | `0` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `implicits[].implicitValue` | number | 1536 occurrences | -4..750 (>12 distinct) | `14` | Implicit roll min value. |
| `implicits[].implicitMaxValue` | number | 1536 occurrences | -5..1000 (>12 distinct) | `14` | Implicit roll max value. |
| `classRequirement` | number | 923/1571 (58.8%) | values 0,1,2,4,8,16 | `0` | Class requirement bit mask: 1<<classID (1 Primalist, 2 Mage, 4 Sentinel, 8 Acolyte, 16 Rogue). |
| `subClassRequirement` | number | 923/1571 (58.8%) | values 0 | `0` | Mastery requirement. |
| `cannotBeUpgradedOnDrop` | boolean | 923/1571 (58.8%) | values false,true | `false` |  |
| `affixEffectiveness` | number | 923/1571 (58.8%) | values 0,1 | `0` | Affix effectiveness granted by the sub type. |
| `addedWeaponRange` | number | 923/1571 (58.8%) | values -0.2,-0.1,0,0.1,0.3,0.5,0.6,0.7,0.9,1.1 | `0` | Added weapon range. |
| `attackRate` | number | 923/1571 (58.8%) | 0.76..1.24 (>12 distinct) | `1` | Weapon attacks per second. |
| `IMSetTier` | number | 923/1571 (58.8%) | values 0,1,2,3,4,5,6,7,8,9 | `6` | Item-model set tier (visual). |
| `IMSetOverrides` | array | 923/1571 (58.8%) | len 0..2 | `[]` | Item-model overrides. |
| `IMSetOverrides[]` | object | 10 occurrences |  | `{"classID":0,"imSetTier":0}` | Item-model overrides. |
| `IMSetOverrides[].classID` | number | 10 occurrences | values 0,2 | `0` | Class id 0..4. |
| `IMSetOverrides[].imSetTier` | number | 10 occurrences | values 0,1,2,3,4,6,7,8 | `0` | Item-model set tier (visual). |
| `rerollChance` | number | 648/1571 (41.2%) | values 0,0.15,0.2,0.35,0.75,0.85,0.9,0.95,0.975,0.99,0.995,1 | `0` | Chance for the drop to be re-rolled to another type. |
| `description` | string | 648/1571 (41.2%) | >12 distinct | `"Augments an item to grant it a new property or improve a...` | English description text. |

Example (record #1, trimmed):

```json
{
  "name": "Leather Helmet",
  "displayName": "Jewelled Circlet",
  "subTypeID": 1,
  "levelRequirement": 7,
  "onlyDropWhenRequiringAffixEffectiveness": false,
  "isCorruptedSubtype": false,
  "cannotDrop": true,
  "itemTags": 0,
  "hideSubTypeInLootFilter": false,
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
  "classRequirement": 0,
  "subClassRequirement": 0,
  "cannotBeUpgradedOnDrop": false,
  "affixEffectiveness": 0,
  "addedWeaponRange": 0,
  "attackRate": 1,
  "IMSetTier": 7,
  "IMSetOverrides": []
}
```

### `itemTypes[].subItems[].implicits[]`

- **Location:** `itemTypes[].subItems[].implicits[]`
- **Keying:** array
- **Record count:** 1536

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `property` | number | always | 0..133 (>12 distinct) | `10` | Stat property id (SP enum, see enums.md). |
| `specialTag` | number | always | 0..85 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `tags` | number | always | 0..16777216 (>12 distinct) | `0` | Tag bit mask (AT enum, see enums.md). |
| `extraTag` | number | always | values 0 | `0` | Tertiary selector (e.g. extra tag); mostly 0. |
| `type` | number | always | values 0,1,2 | `0` | modifierType: 0 added, 1 increased, 2 more (enums.md). |
| `implicitValue` | number | always | -4..750 (>12 distinct) | `14` | Implicit roll min value. |
| `implicitMaxValue` | number | always | -5..1000 (>12 distinct) | `14` | Implicit roll max value. |

Example (record #0, trimmed):

```json
{
  "property": 10,
  "specialTag": 0,
  "tags": 0,
  "extraTag": 0,
  "type": 0,
  "implicitValue": 14,
  "implicitMaxValue": 14
}
```

### `itemCategories`

- **Location:** `itemCategories`
- **Keying:** array
- **Record count:** 4
- **Notes:** Loot-filter style grouping of base types.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `name` | string | always | values "Weapons","Off-Hand","Armor","Misc" | `"Weapons"` | Internal / English name. |
| `categories` | array | always | len 1..3 | `[{"name":"One Handed Weapons","entries":[5,7,8,9,10,6]},{...` |  |
| `categories[]` | object | 7 occurrences |  | `{"name":"One Handed Weapons","entries":[5,7,8,9,10,6]}` |  |
| `categories[].name` | string | 7 occurrences | values "One Handed Weapons","Two Handed Weapons","Off-Hand","Armor","Accessories","Idols","Altars" | `"One Handed Weapons"` | Internal / English name. |
| `categories[].entries` | array | 7 occurrences | len 1..9 | `[5,7,8,9,10,6]` |  |

Example (record #0, trimmed):

```json
{
  "name": "Weapons",
  "categories": [
    {"name": "One Handed Weapons", "entries": [5,7,"...(+4 more)"]},
    {"name": "Two Handed Weapons", "entries": [12,13,"...(+4 more)"]}
  ]
}
```

### `properties`

- **Location:** `properties`
- **Keying:** array; each record has `property` (SP enum id)
- **Record count:** 113

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `roundingForAdded` | number | always | values 0,1 | `1` | Rounding mode for added values. |
| `roundingForMore` | number | always | values 0,3 | `0` | Rounding mode for "more" values. |
| `displayAddedAsPercentage` | boolean | always | values false,true | `false` | Display added value as a percentage. |
| `displayAddedAsTenthOfValue` | boolean | always | values false,true | `false` | Display added value as tenth. |
| `displayAsPercentageOf` | boolean | always | values false,true | `false` | Display as "% of ...". |
| `displayAsAddedTo` | boolean | always | values false,true | `false` | Display as "added to ...". |
| `dontDisplayPlus` | boolean | always | values false,true | `false` | Do not prefix + sign. |
| `lessIsBetter` | boolean | always | values false,true | `false` | Lower value is beneficial. |
| `hideModifierValue` | boolean | always | values false | `false` | Hide the numeric value. |
| `nameIncludesModifier` | boolean | always | values false,true | `false` | Name already includes the modifier word. |
| `textKey` | string | always | >12 distinct | `"Property_Master_Damage_AltText"` | Maxroll text key (i18n key = Properties.<textKey>[_Name\|_AltText]). |
| `propertyName` | string | always | >12 distinct | `"Damage"` | English property name. |
| `property` | number | always | 0..133 (>12 distinct) | `0` | Stat property id (SP enum, see enums.md). |
| `defaultAltText` | string | always | >12 distinct | `"Increases the damage you deal"` | English default alt text. |
| `altTextOverrides` | array | always | len 0..50 | `[{"property":0,"modType":0,"specialTag":0,"tags":513,"ove...` | Alternate texts by (modType,specialTag,tags). |
| `altTextOverrides[]` | object | 162 occurrences |  | `{"property":0,"modType":0,"specialTag":0,"tags":513,"over...` | Alternate texts by (modType,specialTag,tags). |
| `altTextOverrides[].property` | number | 162 occurrences | 0..117 (>12 distinct) | `0` | Stat property id (SP enum, see enums.md). |
| `altTextOverrides[].modType` | number | 162 occurrences | values 0,1,2 | `0` | Monster mod type enum. |
| `altTextOverrides[].specialTag` | number | 162 occurrences | 0..144 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `altTextOverrides[].tags` | number | 162 occurrences | 0..33554433 (>12 distinct) | `513` | Tag bit mask (AT enum, see enums.md). |
| `altTextOverrides[].overrideAltText` | string | 162 occurrences | >12 distinct | `"Adds physical damage to your melee attacks"` | English override alt text. |
| `altTextOverrides[].overrideAltTextKey` | string | 162 occurrences | >12 distinct | `"Property_Master_Damage_AltText_Override_1"` | Override alt text key. |
| `moreRoundingOverrides` | array | always | len 0..2 | `[]` | Per (property,specialTag) rounding overrides. |
| `moreRoundingOverrides[]` | object | 4 occurrences |  | `{"property":6,"specialTag":0,"roundingForMore":3}` | Per (property,specialTag) rounding overrides. |
| `moreRoundingOverrides[].property` | number | 4 occurrences | values 6,115,117 | `6` | Stat property id (SP enum, see enums.md). |
| `moreRoundingOverrides[].specialTag` | number | 4 occurrences | values 0,16,43,44 | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `moreRoundingOverrides[].roundingForMore` | number | 4 occurrences | values 3 | `3` | Rounding mode for "more" values. |

Example (record #0, trimmed):

```json
{
  "roundingForAdded": 1,
  "roundingForMore": 0,
  "displayAddedAsPercentage": false,
  "displayAddedAsTenthOfValue": false,
  "displayAsPercentageOf": false,
  "displayAsAddedTo": false,
  "dontDisplayPlus": false,
  "lessIsBetter": false,
  "hideModifierValue": false,
  "nameIncludesModifier": false,
  "textKey": "Property_Master_Damage_AltText",
  "propertyName": "Damage",
  "property": 0,
  "defaultAltText": "Increases the damage you deal",
  "altTextOverrides": [
    {
      "property": 0,
      "modType": 0,
      "specialTag": 0,
      "tags": 513,
      "overrideAltText": "Adds physical damage to your melee attacks",
      "overrideAltTextKey": "Property_Master_Damage_AltText_Override_1"
    },
    {
      "property": 0,
      "modType": 1,
      "specialTag": 0,
      "tags": 256,
      "overrideAltText": "Increases the damage you deal with spells",
      "overrideAltTextKey": "Property_Master_Damage_AltText_Override_2"
    },
    "...(+43 more)"
  ],
  "moreRoundingOverrides": []
}
```

### `properties[].altTextOverrides[]`

- **Location:** `properties[].altTextOverrides[]`
- **Keying:** array
- **Record count:** 162

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `property` | number | always | 0..117 (>12 distinct) | `0` | Stat property id (SP enum, see enums.md). |
| `modType` | number | always | values 0,1,2 | `0` | Monster mod type enum. |
| `specialTag` | number | always | 0..144 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `tags` | number | always | 0..33554433 (>12 distinct) | `513` | Tag bit mask (AT enum, see enums.md). |
| `overrideAltText` | string | always | >12 distinct | `"Adds physical damage to your melee attacks"` | English override alt text. |
| `overrideAltTextKey` | string | always | >12 distinct | `"Property_Master_Damage_AltText_Override_1"` | Override alt text key. |

Example (record #14, trimmed):

```json
{
  "property": 0,
  "modType": 1,
  "specialTag": 0,
  "tags": 128,
  "overrideAltText": "Increases the fire, cold and lightning damage you deal",
  "overrideAltTextKey": "Property_Master_Damage_AltText_Override_15"
}
```

### `conditionalProperties`

- **Location:** `conditionalProperties`
- **Keying:** array; index = conditional id
- **Record count:** 48

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `description` | string | always | >12 distinct | `"to Stunned Enemies"` | English description text. |
| `nonDamageDescription` | string | always | >12 distinct | `"against Stunned Enemies"` |  |

Example (record #2, trimmed):

```json
{"description": "to High Health Enemies", "nonDamageDescription": "against High Health Enemies"}
```

### `uniques`

- **Location:** `uniques`
- **Keying:** array; each record has `uniqueID`
- **Record count:** 486

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `name` | string | always | >12 distinct | `"Calamity"` | Internal / English name. |
| `displayName` | string | always | >12 distinct | `""` | English display name. |
| `alternativeSearchName` | string | always | values "","Scales of Eterra (Fire & Cold)","Scales of Eterra (Cold & Lightning)","Scales of Eterra (Fire & Lightning)","Pearls of the Swine (Blood)","Pearls of the Swine (Fire)","Pearls of the Swine (Poison)" | `""` | Alternate search name. |
| `uniqueID` | number | always | 0..488 (>12 distinct) | `0` | Unique item id. |
| `unifiedType` | number | always | values 0,1,2 | `0` | 0 normal, 1/2 special unified types. |
| `isSetItem` | boolean | always | values false,true | `false` | 1 if set item. |
| `setID` | number | always | 0..24 (>12 distinct) | `0` | Set id. |
| `isPrimordialItem` | boolean | always | values false,true | `false` | Primordial (Weaver) item. |
| `primordialFeatherCost` | number | always | values 0,15,17,20,25,26,29,30,32 | `0` | Weaver crafting cost. |
| `primordialFangCost` | number | always | values 0,11,15,18,19,20,21,24,25,26 | `0` | Weaver crafting cost. |
| `primordialPetalCost` | number | always | values 0,3,21,26,30,34,35 | `0` | Weaver crafting cost. |
| `primordialHornCost` | number | always | values 0,10,11,13,16,18,19,20,27,28,40 | `0` | Weaver crafting cost. |
| `crystallisedHeartCost` | number | always | values 0,1,2,5 | `0` | Weaver crafting cost. |
| `ancientBoneCost` | number | always | 0..50000 (>12 distinct) | `0` | Weaver crafting cost. |
| `isCocoonedItem` | boolean | always | values false,true | `false` | Cocooned item. |
| `overrideLevelRequirement` | boolean | always | values false,true | `false` | Level requirement overridden. |
| `levelRequirement` | number | always | 0..87 (>12 distinct) | `0` | Level required to equip/use. |
| `legendaryType` | number | always | values 0,1 | `0` | 0 normal unique, 1 legendary-capable (see enums.md). |
| `overrideEffectiveLevelForLegendaryPotential` | boolean | always | values true,false | `true` | Flag. |
| `effectiveLevelForLegendaryPotential` | number | always | 0..200 (>12 distinct) | `40` | Effective level used for legendary potential. |
| `hideFromPlayers` | boolean | always | values false,true | `false` | Hidden from players (internal). |
| `canDropRandomly` | boolean | always | values true,false | `true` | Can drop randomly. |
| `rerollChance` | number | always | 0..0.999 (>12 distinct) | `0` | Chance for the drop to be re-rolled to another type. |
| `canDropAsLegendary` | boolean | always | values false,true | `false` | Flag. |
| `dropsSpecificLegendaryAffixes` | boolean | always | values false,true | `false` | Flag. |
| `droppableLegendaryAffixCount` | number | always | values 1,2 | `1` | Count. |
| `droppableLegendaryAffixes` | array | always | len 0..27 | `[]` | Affix ids. |
| `excludeSpecificAffixesFromPrefixSuffixLimits` | boolean | always | values false,true | `false` | Flag. |
| `convertPotentialToLegendaryAffixes` | boolean | always | values false | `false` | Flag. |
| `additionalRandomLegendaryAffixes` | number | always | values 0,1 | `0` | Count. |
| `isPreCorrupted` | boolean | always | values false,true | `false` | Pre-corrupted flag. |
| `preCorruptPositiveChance` | number | always | values 0,1 | `1` | Chance of positive pre-corruption. |
| `validPreCorrupts` | array | always | len 0..3 | `[]` | List. |
| `abilityTooltipToShowInAltTooltip` | number | always | -2090409492..2128156728 (>12 distinct) | `0` | Ability whose tooltip is shown in alt tooltip ({key:abilityIndex}). |
| `itemModelType` | number | always | values 0,1,2 | `0` | Item model type. |
| `subTypeForIM` | number | always | 0..65 (>12 distinct) | `0` | Sub type for item model. |
| `baseType` | number | always | 0..33 (>12 distinct) | `0` | Base item type id. |
| `subTypes` | array | always | len 1..1 | `[1]` | Allowed sub type ids. |
| `subTypes[]` | number | 486 occurrences | 0..72 (>12 distinct) | `1` | Allowed sub type ids. |
| `mods` | array | always | len 0..11 | `[{"value":1,"canRoll":true,"rollID":0,"maxValue":1.5,"pro...` | Mod list. |
| `mods[]` | object | 2440 occurrences |  | `{"value":1,"canRoll":true,"rollID":0,"maxValue":1.5,"prop...` | Mod list. |
| `mods[].value` | number | 2440 occurrences | -16..600 (>12 distinct) | `1` | Stat value (number) or roll min for unique mods / display string on tree nodes. |
| `mods[].canRoll` | boolean | 2440 occurrences | values true,false | `true` | 1 if the unique mod value is rollable. |
| `mods[].rollID` | number | 2440 occurrences | values 0,1,2,3,4,5,6,7 | `0` | Roll slot id (links tooltip placeholders to rolls). |
| `mods[].maxValue` | number | 2440 occurrences | -1000000..2000 (>12 distinct) | `1.5` | Roll max for unique mods. |
| `mods[].property` | number | 2440 occurrences | 0..130 (>12 distinct) | `1` | Stat property id (SP enum, see enums.md). |
| `mods[].specialTag` | number | 2440 occurrences | 0..118 (>12 distinct) | `1` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `mods[].tags` | number | 2440 occurrences | 0..33554433 (>12 distinct) | `8` | Tag bit mask (AT enum, see enums.md). |
| `mods[].extraTag` | number | 2440 occurrences | values 0,71,143,353 | `0` | Tertiary selector (e.g. extra tag); mostly 0. |
| `mods[].type` | number | 2440 occurrences | values 0,1,2 | `0` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `mods[].hideInTooltip` | boolean | 2440 occurrences | values true,false | `true` | 1 if the line is not shown in the tooltip. |
| `tooltipDescriptions` | array | always | len 0..7 | `[{"description":"[100,150,0]% Chance to Ignite on Hit wit...` | Free-text description lines. |
| `tooltipDescriptions[]` | object | 562 occurrences |  | `{"description":"[100,150,0]% Chance to Ignite on Hit with...` | Free-text description lines. |
| `tooltipDescriptions[].description` | string | 562 occurrences | >12 distinct | `"[100,150,0]% Chance to Ignite on Hit with Fire Skills"` | English description text. |
| `tooltipDescriptions[].altText` | string | 562 occurrences | >12 distinct | `""` | English alt tooltip text. |
| `tooltipDescriptions[].setRequirement` | number | 562 occurrences | values 0 | `0` | Number of set pieces required for the line. |
| `loreText` | string | always | >12 distinct | `"Set the world ablaze and burn along with it."` | English lore text. |
| `tooltipEntries` | array | always | len 1..9 | `[{"modDisplay":1},{"modDisplay":128},{"modDisplay":129},{...` | Display order of mods/descriptions. |
| `tooltipEntries[]` | object | 2459 occurrences |  | `{"modDisplay":1}` | Display order of mods/descriptions. |
| `tooltipEntries[].modDisplay` | number | 2459 occurrences | 0..134 (>12 distinct) | `1` | Encoded reference: <128 = mod index, 128+n = tooltipDescriptions[n] (see enums.md). |
| `oldSubTypeID` | number | always | values 0,1,2,3,4,5,6,7,8 | `1` | Legacy sub type id. |
| `oldUniqueID` | number | always | values 0,1,2 | `1` | Legacy unique id. |
| `droppableLegendaryAffixes[]` | number | 43 occurrences | 1083..1152 (>12 distinct) | `1083` | Affix ids. |
| `validPreCorrupts[]` | number | 3 occurrences | values 5,9,12 | `9` | List. |

Example (record #2, trimmed):

```json
{
  "name": "Snowblind",
  "displayName": "",
  "alternativeSearchName": "",
  "uniqueID": 2,
  "unifiedType": 0,
  "isSetItem": false,
  "setID": 0,
  "isPrimordialItem": false,
  "primordialFeatherCost": 0,
  "primordialFangCost": 0,
  "primordialPetalCost": 0,
  "primordialHornCost": 0,
  "crystallisedHeartCost": 0,
  "ancientBoneCost": 0,
  "isCocoonedItem": false,
  "overrideLevelRequirement": true,
  "levelRequirement": 10,
  "legendaryType": 0,
  "overrideEffectiveLevelForLegendaryPotential": false,
  "effectiveLevelForLegendaryPotential": 0,
  "hideFromPlayers": false,
  "canDropRandomly": true,
  "rerollChance": 0,
  "canDropAsLegendary": false,
  "dropsSpecificLegendaryAffixes": false,
  "droppableLegendaryAffixCount": 1,
  "droppableLegendaryAffixes": [],
  "excludeSpecificAffixesFromPrefixSuffixLimits": false,
  "convertPotentialToLegendaryAffixes": false,
  "additionalRandomLegendaryAffixes": 0,
  "isPreCorrupted": false,
  "preCorruptPositiveChance": 1,
  "validPreCorrupts": [],
  "abilityTooltipToShowInAltTooltip": 0,
  "...": "+10 more keys"
}
```

### `uniques[].mods[]`

- **Location:** `uniques[].mods[]`
- **Keying:** array
- **Record count:** 2440

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `value` | number | always | -16..600 (>12 distinct) | `1` | Stat value (number) or roll min for unique mods / display string on tree nodes. |
| `canRoll` | boolean | always | values true,false | `true` | 1 if the unique mod value is rollable. |
| `rollID` | number | always | values 0,1,2,3,4,5,6,7 | `0` | Roll slot id (links tooltip placeholders to rolls). |
| `maxValue` | number | always | -1000000..2000 (>12 distinct) | `1.5` | Roll max for unique mods. |
| `property` | number | always | 0..130 (>12 distinct) | `1` | Stat property id (SP enum, see enums.md). |
| `specialTag` | number | always | 0..118 (>12 distinct) | `1` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `tags` | number | always | 0..33554433 (>12 distinct) | `8` | Tag bit mask (AT enum, see enums.md). |
| `extraTag` | number | always | values 0,71,143,353 | `0` | Tertiary selector (e.g. extra tag); mostly 0. |
| `type` | number | always | values 0,1,2 | `0` | modifierType: 0 added, 1 increased, 2 more (enums.md). |
| `hideInTooltip` | boolean | always | values true,false | `true` | 1 if the line is not shown in the tooltip. |

Example (record #2, trimmed):

```json
{
  "value": 0.05,
  "canRoll": true,
  "rollID": 2,
  "maxValue": 0.1,
  "property": 3,
  "specialTag": 0,
  "tags": 8,
  "extraTag": 0,
  "type": 1,
  "hideInTooltip": false
}
```

### `uniques[].tooltipDescriptions[]`

- **Location:** `uniques[].tooltipDescriptions[]`
- **Keying:** array
- **Record count:** 562

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `description` | string | always | >12 distinct | `"[100,150,0]% Chance to Ignite on Hit with Fire Skills"` | English description text. |
| `altText` | string | always | >12 distinct | `""` | English alt tooltip text. |
| `setRequirement` | number | always | values 0 | `0` | Number of set pieces required for the line. |

Example (record #1, trimmed):

```json
{
  "description": "When you kill an enemy with a fire skill you take 4 fire dam...",
  "altText": "",
  "setRequirement": 0
}
```

### `uniques[].tooltipEntries[]`

- **Location:** `uniques[].tooltipEntries[]`
- **Keying:** array
- **Record count:** 2459

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `modDisplay` | number | always | 0..134 (>12 distinct) | `1` | Encoded reference: <128 = mod index, 128+n = tooltipDescriptions[n] (see enums.md). |

Example (record #0, trimmed):

```json
{"modDisplay": 1}
```

### `playerProperties`

- **Location:** `playerProperties`
- **Keying:** array; index = PlayerProperty id
- **Record count:** 712

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `roundingForAdded` | number | always | values 0,1,2,3 | `0` | Rounding mode for added values. |
| `roundingForMore` | number | always | values 0,3 | `0` | Rounding mode for "more" values. |
| `displayAddedAsPercentage` | boolean | always | values true,false | `true` | Display added value as a percentage. |
| `displayAddedAsTenthOfValue` | boolean | always | values false,true | `false` | Display added value as tenth. |
| `displayAsPercentageOf` | boolean | always | values false,true | `false` | Display as "% of ...". |
| `displayAsAddedTo` | boolean | always | values false,true | `false` | Display as "added to ...". |
| `dontDisplayPlus` | boolean | always | values true,false | `true` | Do not prefix + sign. |
| `lessIsBetter` | boolean | always | values false,true | `false` | Lower value is beneficial. |
| `hideModifierValue` | boolean | always | values false,true | `false` | Hide the numeric value. |
| `nameIncludesModifier` | boolean | always | values false | `false` | Name already includes the modifier word. |
| `textKey` | string | always | >12 distinct | `"Property_Player_0"` | Maxroll text key (i18n key = Properties.<textKey>[_Name\|_AltText]). |
| `propertyName` | string | always | >12 distinct | `"Chance to gain Haste for 3 seconds when you Summon a Totem"` | English property name. |
| `altText` | string | always | >12 distinct | `"Haste grants 30% increased movement speed by default"` | English alt tooltip text. |

Example (record #0, trimmed):

```json
{
  "roundingForAdded": 0,
  "roundingForMore": 0,
  "displayAddedAsPercentage": true,
  "displayAddedAsTenthOfValue": false,
  "displayAsPercentageOf": false,
  "displayAsAddedTo": false,
  "dontDisplayPlus": true,
  "lessIsBetter": false,
  "hideModifierValue": false,
  "nameIncludesModifier": false,
  "textKey": "Property_Player_0",
  "propertyName": "Chance to gain Haste for 3 seconds when you Summon a Totem",
  "altText": "Haste grants 30% increased movement speed by default"
}
```

### `idolAltarProperties`

- **Location:** `idolAltarProperties`
- **Keying:** array; index = idol-altar property id
- **Record count:** 31

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `roundingForAdded` | number | always | values 0,1 | `1` | Rounding mode for added values. |
| `roundingForMore` | number | always | values 0 | `0` | Rounding mode for "more" values. |
| `displayAddedAsPercentage` | boolean | always | values false,true | `false` | Display added value as a percentage. |
| `displayAddedAsTenthOfValue` | boolean | always | values false | `false` | Display added value as tenth. |
| `displayAsPercentageOf` | boolean | always | values false | `false` | Display as "% of ...". |
| `displayAsAddedTo` | boolean | always | values false | `false` | Display as "added to ...". |
| `dontDisplayPlus` | boolean | always | values false,true | `false` | Do not prefix + sign. |
| `lessIsBetter` | boolean | always | values false | `false` | Lower value is beneficial. |
| `hideModifierValue` | boolean | always | values false | `false` | Hide the numeric value. |
| `nameIncludesModifier` | boolean | always | values false | `false` | Name already includes the modifier word. |
| `textKey` | string | always | >12 distinct | `"Property_IdolAltar_0"` | Maxroll text key (i18n key = Properties.<textKey>[_Name\|_AltText]). |
| `propertyName` | string | always | >12 distinct | `"Maximum Omen Idols"` | English property name. |
| `altText` | string | always | values "","An idol is considered to be in a Ref...","Ward does not decay below your Ward ...","A Heretical Idol is an idol that has...","Reduces the bonus damage taken from ...","multiplicative with other modifiers","An idol is considered larger than an...","There is no additional benefit to ha..." | `""` | English alt tooltip text. |

Example (record #1, trimmed):

```json
{
  "roundingForAdded": 0,
  "roundingForMore": 0,
  "displayAddedAsPercentage": false,
  "displayAddedAsTenthOfValue": false,
  "displayAsPercentageOf": false,
  "displayAsAddedTo": false,
  "dontDisplayPlus": true,
  "lessIsBetter": false,
  "hideModifierValue": false,
  "nameIncludesModifier": false,
  "textKey": "Property_IdolAltar_1",
  "propertyName": "Effect of Prefixes and Suffixes for Idols in Refracted Slots",
  "altText": "An idol is considered to be in a Refracted Slot if any part ..."
}
```

### `setBonuses`

- **Location:** `setBonuses`
- **Keying:** array; each record has `setID`
- **Record count:** 25
- **Notes:** Includes `itemsInSet` (full unique records).

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `setID` | number | always | 0..24 (>12 distinct) | `0` | Set id. |
| `setName` | string | always | >12 distinct | `""` | Set name. |
| `mods` | array | always | len 0..7 | `[]` | Mod list. |
| `tooltipDescriptions` | array | always | len 0..3 | `[]` | Free-text description lines. |
| `tooltipEntries` | array | always | len 0..4 | `[]` | Display order of mods/descriptions. |
| `itemsInSet` | array | always | len 0..3 | `[]` | Full unique records of the set pieces (Maxroll). |
| `mods[]` | object | 54 occurrences |  | `{"value":0.3,"property":69,"specialTag":0,"tags":288,"ext...` | Mod list. |
| `mods[].value` | number | 54 occurrences | -1..54 (>12 distinct) | `0.3` | Stat value (number) or roll min for unique mods / display string on tree nodes. |
| `mods[].property` | number | 54 occurrences | 0..117 (>12 distinct) | `69` | Stat property id (SP enum, see enums.md). |
| `mods[].specialTag` | number | 54 occurrences | 0..39 (>12 distinct) | `0` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `mods[].tags` | number | 54 occurrences | 0..16777216 (>12 distinct) | `288` | Tag bit mask (AT enum, see enums.md). |
| `mods[].extraTag` | number | 54 occurrences | values 0 | `0` | Tertiary selector (e.g. extra tag); mostly 0. |
| `mods[].type` | number | 54 occurrences | values 0,1,2 | `0` | Context-dependent enum (see enums.md): affix type (0 prefix, 1 suffix) / modifierType on mods / base-type id on item types / ability component type string. |
| `mods[].setRequirement` | number | 54 occurrences | values 1,2,3 | `3` | Number of set pieces required for the line. |
| `mods[].hideInTooltip` | boolean | 54 occurrences | values true,false | `true` | 1 if the line is not shown in the tooltip. |
| `tooltipDescriptions[]` | object | 18 occurrences |  | `{"description":"+30% Mana Efficiency with Necrotic Spells...` | Free-text description lines. |
| `tooltipDescriptions[].description` | string | 18 occurrences | >12 distinct | `"+30% Mana Efficiency with Necrotic Spells"` | English description text. |
| `tooltipDescriptions[].altText` | string | 18 occurrences | values "","Damned deals necrotic damage over ti...","The Queen Bee is a powerful minion a...","Health granted is not affected by mi...","Mark for Death is a curse that reduc...","Multiplicative with other modifiers","Orbiting Volcanic Orbs cannot have t..." | `""` | English alt tooltip text. |
| `tooltipDescriptions[].setRequirement` | number | 18 occurrences | values 1,2,3 | `3` | Number of set pieces required for the line. |
| `tooltipEntries[]` | object | 46 occurrences |  | `{"modDisplay":129}` | Display order of mods/descriptions. |
| `tooltipEntries[].modDisplay` | number | 46 occurrences | values 0,1,2,3,128,129,130 | `129` | Encoded reference: <128 = mod index, 128+n = tooltipDescriptions[n] (see enums.md). |
| `itemsInSet[]` | object | 61 occurrences |  | `{"name":"IsadoraRevenge","displayName":"Isadora's Revenge...` | Full unique records of the set pieces (Maxroll). |
| `itemsInSet[].name` | string | 61 occurrences | >12 distinct | `"IsadoraRevenge"` | Internal / English name. |
| `itemsInSet[].displayName` | string | 61 occurrences | >12 distinct | `"Isadora's Revenge"` | English display name. |
| `itemsInSet[].alternativeSearchName` | string | 61 occurrences | values "" | `""` | Alternate search name. |
| `itemsInSet[].uniqueID` | number | 61 occurrences | 5..482 (>12 distinct) | `5` | Unique item id. |
| `itemsInSet[].unifiedType` | number | 61 occurrences | values 0 | `0` | 0 normal, 1/2 special unified types. |
| `itemsInSet[].isSetItem` | boolean | 61 occurrences | values true | `true` | 1 if set item. |
| `itemsInSet[].setID` | number | 61 occurrences | 1..24 (>12 distinct) | `1` | Set id. |
| `itemsInSet[].isPrimordialItem` | boolean | 61 occurrences | values false | `false` | Primordial (Weaver) item. |
| `itemsInSet[].primordialFeatherCost` | number | 61 occurrences | values 0 | `0` | Weaver crafting cost. |
| `itemsInSet[].primordialFangCost` | number | 61 occurrences | values 0 | `0` | Weaver crafting cost. |
| `itemsInSet[].primordialPetalCost` | number | 61 occurrences | values 0 | `0` | Weaver crafting cost. |
| `itemsInSet[].primordialHornCost` | number | 61 occurrences | values 0 | `0` | Weaver crafting cost. |
| `itemsInSet[].crystallisedHeartCost` | number | 61 occurrences | values 0 | `0` | Weaver crafting cost. |
| `itemsInSet[].ancientBoneCost` | number | 61 occurrences | values 0 | `0` | Weaver crafting cost. |
| `itemsInSet[].isCocoonedItem` | boolean | 61 occurrences | values false | `false` | Cocooned item. |
| `itemsInSet[].overrideLevelRequirement` | boolean | 61 occurrences | values false,true | `false` | Level requirement overridden. |
| `itemsInSet[].levelRequirement` | number | 61 occurrences | 0..80 (>12 distinct) | `0` | Level required to equip/use. |
| `itemsInSet[].legendaryType` | number | 61 occurrences | values 0 | `0` | 0 normal unique, 1 legendary-capable (see enums.md). |
| `itemsInSet[].overrideEffectiveLevelForLegendaryPotential` | boolean | 61 occurrences | values false | `false` | Flag. |
| `itemsInSet[].effectiveLevelForLegendaryPotential` | number | 61 occurrences | values 0 | `0` | Effective level used for legendary potential. |
| `itemsInSet[].hideFromPlayers` | boolean | 61 occurrences | values false | `false` | Hidden from players (internal). |
| `itemsInSet[].canDropRandomly` | boolean | 61 occurrences | values true,false | `true` | Can drop randomly. |
| `itemsInSet[].rerollChance` | number | 61 occurrences | values 0,0.2,0.3,0.4,0.5,0.7,0.75 | `0` | Chance for the drop to be re-rolled to another type. |
| `itemsInSet[].canDropAsLegendary` | boolean | 61 occurrences | values false | `false` | Flag. |
| `itemsInSet[].dropsSpecificLegendaryAffixes` | boolean | 61 occurrences | values false | `false` | Flag. |
| `itemsInSet[].droppableLegendaryAffixCount` | number | 61 occurrences | values 1 | `1` | Count. |
| `itemsInSet[].droppableLegendaryAffixes` | array | 61 occurrences | len 0..0 | `[]` | Affix ids. |
| `itemsInSet[].excludeSpecificAffixesFromPrefixSuffixLimits` | boolean | 61 occurrences | values false | `false` | Flag. |
| `itemsInSet[].convertPotentialToLegendaryAffixes` | boolean | 61 occurrences | values false | `false` | Flag. |
| `itemsInSet[].additionalRandomLegendaryAffixes` | number | 61 occurrences | values 0 | `0` | Count. |
| `itemsInSet[].isPreCorrupted` | boolean | 61 occurrences | values false | `false` | Pre-corrupted flag. |
| `itemsInSet[].preCorruptPositiveChance` | number | 61 occurrences | values 1 | `1` | Chance of positive pre-corruption. |
| `itemsInSet[].validPreCorrupts` | array | 61 occurrences | len 0..0 | `[]` | List. |
| `itemsInSet[].abilityTooltipToShowInAltTooltip` | object | 61 occurrences |  | `{"key":0}` | Ability whose tooltip is shown in alt tooltip ({key:abilityIndex}). |
| `itemsInSet[].itemModelType` | number | 61 occurrences | values 0,1 | `0` | Item model type. |
| `itemsInSet[].subTypeForIM` | number | 61 occurrences | values 0,7,8,40,50 | `0` | Sub type for item model. |
| `itemsInSet[].baseType` | number | 61 occurrences | 0..22 (>12 distinct) | `0` | Base item type id. |
| `itemsInSet[].subTypes` | array | 61 occurrences | len 1..1 | `[5]` | Allowed sub type ids. |
| `itemsInSet[].mods` | array | 61 occurrences | len 2..9 | `[{"value":0.06,"canRoll":true,"rollID":0,"maxValue":0.12,...` | Mod list. |
| `itemsInSet[].tooltipDescriptions` | array | 61 occurrences | len 0..4 | `[{"description":"[36,48,2]% Increased Duration of Chill A...` | Free-text description lines. |
| `itemsInSet[].loreText` | string | 61 occurrences | >12 distinct | `"\"...and enraged she arose with murder in her eyes...\""` | English lore text. |
| `itemsInSet[].tooltipEntries` | array | 61 occurrences | len 3..8 | `[{"modDisplay":0},{"modDisplay":1},{"modDisplay":2},{"mod...` | Display order of mods/descriptions. |
| `itemsInSet[].oldSubTypeID` | number | 61 occurrences | values 0,1,2,4,5 | `5` | Legacy sub type id. |
| `itemsInSet[].oldUniqueID` | number | 61 occurrences | values 0,1 | `1` | Legacy unique id. |

Example (record #1, trimmed):

```json
{
  "setID": 1,
  "setName": "Isadora's",
  "mods": [
    {
      "value": 0.3,
      "property": 69,
      "specialTag": 0,
      "tags": 288,
      "extraTag": 0,
      "type": 0,
      "setRequirement": 3,
      "hideInTooltip": true
    },
    {
      "value": 1,
      "property": 1,
      "specialTag": 39,
      "tags": 288,
      "extraTag": 0,
      "type": 0,
      "setRequirement": 2,
      "hideInTooltip": true
    },
    "...(+1 more)"
  ],
  "tooltipDescriptions": [
    {"description": "+30% Mana Efficiency with Necrotic Spells", "altText": "", "setRequirement": 3},
    {
      "description": "+100% Chance to apply Damned on hit with Necrotic Spells",
      "altText": "Damned deals necrotic damage over time and reduces health re...",
      "setRequirement": 2
    }
  ],
  "tooltipEntries": [
    {"modDisplay": 129},
    {"modDisplay": 2},
    "...(+1 more)"
  ],
  "itemsInSet": [
    {
      "name": "IsadoraRevenge",
      "displayName": "Isadora's Revenge",
      "alternativeSearchName": "",
      "uniqueID": 5,
      "unifiedType": 0,
      "isSetItem": true,
      "setID": 1,
      "isPrimordialItem": false,
      "primordialFeatherCost": 0,
      "primordialFangCost": 0,
      "primordialPetalCost": 0,
      "primordialHornCost": 0,
      "crystallisedHeartCost": 0,
      "ancientBoneCost": 0,
      "isCocoonedItem": false,
      "overrideLevelRequirement": false,
      "levelRequirement": 0,
      "legendaryType": 0,
      "overrideEffectiveLevelForLegendaryPotential": false,
      "effectiveLevelForLegendaryPotential": 0,
      "hideFromPlayers": false,
      "canDropRandomly": true,
      "rerollChance": 0,
      "canDropAsLegendary": false,
      "dropsSpecificLegendaryAffixes": false,
      "droppableLegendaryAffixCount": 1,
      "droppableLegendaryAffixes": [],
      "excludeSpecificAffixesFromPrefixSuffixLimits": false,
      "convertPotentialToLegendaryAffixes": false,
      "additionalRandomLegendaryAffixes": 0,
      "isPreCorrupted": false,
      "preCorruptPositiveChance": 1,
      "validPreCorrupts": [],
      "abilityTooltipToShowInAltTooltip": {"key": 0},
      "...": "+10 more keys"
    },
    {
      "name": "IsadoraTombbinding",
      "displayName": "Isadora's Tomb Binding",
      "alternativeSearchName": "",
      "uniqueID": 16,
      "unifiedType": 0,
      "isSetItem": true,
      "setID": 1,
      "isPrimordialItem": false,
      "primordialFeatherCost": 0,
      "primordialFangCost": 0,
      "primordialPetalCost": 0,
      "primordialHornCost": 0,
      "crystallisedHeartCost": 0,
      "ancientBoneCost": 0,
      "isCocoonedItem": false,
      "overrideLevelRequirement": false,
      "levelRequirement": 0,
      "legendaryType": 0,
      "overrideEffectiveLevelForLegendaryPotential": false,
      "effectiveLevelForLegendaryPotential": 0,
      "hideFromPlayers": false,
      "canDropRandomly": true,
      "rerollChance": 0,
      "canDropAsLegendary": false,
      "dropsSpecificLegendaryAffixes": false,
      "droppableLegendaryAffixCount": 1,
      "droppableLegendaryAffixes": [],
      "excludeSpecificAffixesFromPrefixSuffixLimits": false,
      "convertPotentialToLegendaryAffixes": false,
      "additionalRandomLegendaryAffixes": 0,
      "isPreCorrupted": false,
      "preCorruptPositiveChance": 1,
      "validPreCorrupts": [],
      "abilityTooltipToShowInAltTooltip": {"key": 0},
      "...": "+10 more keys"
    },
    "...(+1 more)"
  ]
}
```

### `setBonuses[].mods[]`

- **Location:** `setBonuses[].mods[]`
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
| `hideInTooltip` | boolean | always | values true,false | `true` | 1 if the line is not shown in the tooltip. |

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
  "hideInTooltip": true
}
```

### `timelines`

- **Location:** `timelines`
- **Keying:** array; each record has `timelineID`
- **Record count:** 11

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `timelineID` | number | always | values 1,2,3,4,5,6,7,8,9,10,99 | `1` | Timeline id. |
| `displayName` | string | always | values "Fall of the Outcasts","The Stolen Lance","The Black Sun","Blood, Frost, and Death","Ending the Storm","Fall of the Empire","Reign of Dragons","The Last Ruin","The Age of Winter","Spirits of Fire","" | `"Fall of the Outcasts"` | English display name. |
| `exclusiveEchoRewardsDescription` | string | always | values "In this Timeline echoes can have rew...","In this Timeline echoes can have rew...","In this Timeline echoes can have rew...","In this Timeline echoes can have rew...","In this Timeline echoes can have rew...","In this Timeline echoes can have rew...","In this Timeline echoes can have rew...","In this Timeline echoes can have rew...","In this Timeline echoes can have rew...","In this Timeline echoes can have rew...","" | `"In this Timeline echoes can have rewards that grant uniq...` |  |
| `difficulties` | array | always | len 1..2 | `[{"sufficientRequirements":[],"timelineProgressionPointsN...` | Per-difficulty definitions. |
| `difficulties[]` | object | 21 occurrences |  | `{"sufficientRequirements":[],"timelineProgressionPointsNe...` | Per-difficulty definitions. |
| `difficulties[].sufficientRequirements` | array | 21 occurrences | len 0..3 | `[]` |  |
| `difficulties[].timelineProgressionPointsNeeded` | number | 21 occurrences | values 0,5 | `0` |  |
| `difficulties[].level` | number | 21 occurrences | values 62,66,70,74,78,82,85,90,100 | `62` | Level. |
| `difficulties[].tutorialise` | boolean | 21 occurrences | values true,false | `true` |  |
| `difficulties[].modEffectModifier` | number | 21 occurrences | values 0 | `0` | Mod effect modifier. |
| `difficulties[].echoesLostOnDeathModifier` | number | 21 occurrences | values 0 | `0` |  |
| `difficulties[].maxStability` | number | 21 occurrences | values 0,500,550,600,750,800,900,1000,1600,1700,1800 | `500` | Max stability. |
| `difficulties[].firstSlotBlessings` | array | 21 occurrences | len 0..3 | `[]` | Blessing sub types allowed in first slot. |
| `difficulties[].otherSlotBlessings` | array | 21 occurrences | len 0..10 | `[0,2,4,6,8,10,12]` | Blessing sub types for other slots. |
| `difficulties[].anySlotBlessings` | array | 21 occurrences | len 0..12 | `[111,113,115]` | Blessing sub types for any slot. |
| `difficulties[].minTierForTombsOfTheErased` | number | 21 occurrences | values 0,3 | `3` |  |
| `difficulties[].hasCorruptionMod` | boolean | 21 occurrences | values true,false | `true` |  |
| `difficulties[].modFromCorruption` | object | 21 occurrences |  | `{"key":993139884}` | Monster mod id applied from corruption. |
| `difficulties[].minimumCorruption` | number | 21 occurrences | values 0,100 | `0` | Min corruption. |
| `difficulties[].hasMaxCorruption` | boolean | 21 occurrences | values true,false | `true` | Has max corruption. |
| `difficulties[].maximumCorruption` | number | 21 occurrences | values 0,50 | `50` | Max corruption. |
| `difficulties[].additionalCorruptionEffect` | number | 21 occurrences | values 0,1,2 | `1` | Added corruption effect. |
| `difficulties[].corruptionRequiredPerLevel` | number | 21 occurrences | values 0,5,10 | `5` | Corruption required per level. |

Example (record #1, trimmed):

```json
{
  "timelineID": 2,
  "displayName": "The Stolen Lance",
  "exclusiveEchoRewardsDescription": "In this Timeline echoes can have rewards that grant unique o...",
  "difficulties": [
    {
      "sufficientRequirements": [],
      "timelineProgressionPointsNeeded": 0,
      "level": 66,
      "tutorialise": false,
      "modEffectModifier": 0,
      "echoesLostOnDeathModifier": 0,
      "maxStability": 500,
      "firstSlotBlessings": [],
      "otherSlotBlessings": [],
      "anySlotBlessings": [62, 63, "...(+9 more)"],
      "minTierForTombsOfTheErased": 0,
      "hasCorruptionMod": true,
      "modFromCorruption": {"key": 993139884},
      "minimumCorruption": 0,
      "hasMaxCorruption": true,
      "maximumCorruption": 50,
      "additionalCorruptionEffect": 1,
      "corruptionRequiredPerLevel": 5
    },
    {
      "sufficientRequirements": [
        {"timelineID": 7, "completionType": 0}
      ],
      "timelineProgressionPointsNeeded": 0,
      "level": 100,
      "tutorialise": false,
      "modEffectModifier": 0,
      "echoesLostOnDeathModifier": 0,
      "maxStability": 1600,
      "firstSlotBlessings": [],
      "otherSlotBlessings": [],
      "anySlotBlessings": [117, 118, "...(+9 more)"],
      "minTierForTombsOfTheErased": 0,
      "hasCorruptionMod": true,
      "modFromCorruption": {"key": 993139884},
      "minimumCorruption": 100,
      "hasMaxCorruption": false,
      "maximumCorruption": 0,
      "additionalCorruptionEffect": 2,
      "corruptionRequiredPerLevel": 0
    }
  ]
}
```

### `timelines[].difficulties[]`

- **Location:** `timelines[].difficulties[]`
- **Keying:** array
- **Record count:** 21

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `sufficientRequirements` | array | always | len 0..3 | `[]` |  |
| `timelineProgressionPointsNeeded` | number | always | values 0,5 | `0` |  |
| `level` | number | always | values 62,66,70,74,78,82,85,90,100 | `62` | Level. |
| `tutorialise` | boolean | always | values true,false | `true` |  |
| `modEffectModifier` | number | always | values 0 | `0` | Mod effect modifier. |
| `echoesLostOnDeathModifier` | number | always | values 0 | `0` |  |
| `maxStability` | number | always | values 0,500,550,600,750,800,900,1000,1600,1700,1800 | `500` | Max stability. |
| `firstSlotBlessings` | array | always | len 0..3 | `[]` | Blessing sub types allowed in first slot. |
| `otherSlotBlessings` | array | always | len 0..10 | `[0,2,4,6,8,10,12]` | Blessing sub types for other slots. |
| `otherSlotBlessings[]` | number | 118 occurrences | 0..223 (>12 distinct) | `0` | Blessing sub types for other slots. |
| `anySlotBlessings` | array | always | len 0..12 | `[111,113,115]` | Blessing sub types for any slot. |
| `anySlotBlessings[]` | number | 70 occurrences | 14..179 (>12 distinct) | `111` | Blessing sub types for any slot. |
| `minTierForTombsOfTheErased` | number | always | values 0,3 | `3` |  |
| `hasCorruptionMod` | boolean | always | values true,false | `true` |  |
| `modFromCorruption` | object | always |  | `{"key":993139884}` | Monster mod id applied from corruption. |
| `modFromCorruption.key` | number | always | values 0,993139884 | `993139884` | Opaque id/key. |
| `minimumCorruption` | number | always | values 0,100 | `0` | Min corruption. |
| `hasMaxCorruption` | boolean | always | values true,false | `true` | Has max corruption. |
| `maximumCorruption` | number | always | values 0,50 | `50` | Max corruption. |
| `additionalCorruptionEffect` | number | always | values 0,1,2 | `1` | Added corruption effect. |
| `corruptionRequiredPerLevel` | number | always | values 0,5,10 | `5` | Corruption required per level. |
| `sufficientRequirements[]` | object | 12 occurrences |  | `{"timelineID":7,"completionType":0}` |  |
| `sufficientRequirements[].timelineID` | number | 12 occurrences | values 7,8,9,10 | `7` | Timeline id. |
| `sufficientRequirements[].completionType` | number | 12 occurrences | values 0 | `0` |  |
| `firstSlotBlessings[]` | number | 36 occurrences | 24..207 (>12 distinct) | `24` | Blessing sub types allowed in first slot. |

Example (record #1, trimmed):

```json
{
  "sufficientRequirements": [
    {"timelineID": 7, "completionType": 0}
  ],
  "timelineProgressionPointsNeeded": 0,
  "level": 100,
  "tutorialise": false,
  "modEffectModifier": 0,
  "echoesLostOnDeathModifier": 0,
  "maxStability": 1600,
  "firstSlotBlessings": [],
  "otherSlotBlessings": [1, 3, "...(+5 more)"],
  "anySlotBlessings": [112, 114, "...(+1 more)"],
  "minTierForTombsOfTheErased": 0,
  "hasCorruptionMod": true,
  "modFromCorruption": {"key": 993139884},
  "minimumCorruption": 100,
  "hasMaxCorruption": false,
  "maximumCorruption": 0,
  "additionalCorruptionEffect": 2,
  "corruptionRequiredPerLevel": 0
}
```

### `quests`

- **Location:** `quests`
- **Keying:** array; each record has `id`
- **Record count:** 145

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `name` | string | always | >12 distinct | `"The Void Assault"` | Internal / English name. |
| `chapter` | number | always | values 0,1,2,3,4,5,6,7,8,9,13 | `1` | Chapter number. |
| `id` | number | always | 1..200 (>12 distinct) | `1` | Record identifier (type depends on collection; see ids.md). |
| `mainLineQuest` | boolean | 42/145 (29.0%) | values true | `true` | Main-line quest. |
| `idolUnlockReward` | number | 16/145 (11.0%) | values 1 | `1` | Idol slot reward. |
| `completed` | number | always | 4..913 (>12 distinct) | `4` | Completed step id (Maxroll). |
| `passivePointsReward` | number | 26/145 (17.9%) | values 1,2 | `1` | Passive points reward. |
| `allAttributesReward` | number | 1/145 (0.7%) | values 2 | `2` |  |

Example (record #0, trimmed):

```json
{
  "name": "The Void Assault",
  "chapter": 1,
  "id": 1,
  "mainLineQuest": true,
  "idolUnlockReward": 1,
  "completed": 4
}
```

### `stats`

- **Location:** `stats`
- **Keying:** array; no id (ordered display rules)
- **Record count:** 184
- **Notes:** Stat display rules: which (property, tags) combos are shown and how.

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `property` | number | always | 0..120 (>12 distinct) | `98` | Stat property id (SP enum, see enums.md). |
| `tags` | number | 74/184 (40.2%) | 1..4160 (>12 distinct) | `637` | Tag bit mask (AT enum, see enums.md). |
| `displayType` | number | 174/184 (94.6%) | values 1,3,4,5,6 | `6` | Stat display type (Maxroll stats; 1,3,4,5,6). |
| `requireExactTagMatch` | boolean | 21/184 (11.4%) | values true | `true` | Match tags exactly. |
| `specialTag` | number | 36/184 (19.6%) | 1..93 (>12 distinct) | `7` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `ignoreAdded` | boolean | 47/184 (25.5%) | values true | `true` | Ignore added values. |
| `minionStat` | boolean | 34/184 (18.5%) | values true | `true` |  |
| `quotientType` | number | 17/184 (9.2%) | values 0,1 | `1` |  |
| `quotient` | number | 17/184 (9.2%) | values 1,1.05,1.1,10 | `1` |  |
| `statName` | string | 27/184 (14.7%) | >12 distinct | `"Mana Regeneration"` | English stat label. |
| `statDescription` | string | 27/184 (14.7%) | >12 distinct | `"Points of mana regenerated per second"` |  |
| `isAlternateStat` | boolean | 27/184 (14.7%) | values false,true | `false` |  |
| `baseValue` | number | 18/184 (9.8%) | values 0.05,1,2,28,36,40,53 | `2` |  |
| `cap` | number | 2/184 (1.1%) | values 0.6,1 | `0.6` |  |
| `modifiers` | array | 4/184 (2.2%) | len 1..1 | `[{"property":43,"specialTag":2}]` |  |
| `modifiers[]` | object | 4 occurrences |  | `{"property":43,"specialTag":2}` |  |
| `modifiers[].property` | number | 4 occurrences | values 43 | `43` | Stat property id (SP enum, see enums.md). |
| `modifiers[].specialTag` | number | 4 occurrences | values 1,2,7,23 | `2` | Secondary selector: ailment id / ability-property index / etc. depending on property. |
| `prefix` | string | 2/184 (1.1%) | values "+" | `"+"` |  |

Example (record #0, trimmed):

```json
{"property": 98, "tags": 637, "displayType": 6, "requireExactTagMatch": true}
```

### `lootFilterData.sounds`

- **Location:** `lootFilterData.sounds`
- **Keying:** array
- **Record count:** 16

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `name` | string | always | >12 distinct | `"Shing"` | Internal / English name. |

Example (record #0, trimmed):

```json
{"name": "Shing"}
```

### `lootFilterData.beams`

- **Location:** `lootFilterData.beams`
- **Keying:** array
- **Record count:** 9

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `name` | string | always | values "Rare","Unique","Set","Legendary","Key","Exalted","Golden","Obsidian","Tutorial" | `"Rare"` | Internal / English name. |
| `color` | number | always | values 4278190268,4278245375,4280558763,4281571301,4282161732,4283751930,4292427933,4294595742 | `4283751930` | Color value (ARGB int on Maxroll beams, rgba string on LE Tools). |

Example (record #1, trimmed):

```json
{"name": "Unique", "color": 4281571301}
```

### `defaultProperty / defaultAbilityProperty / defaultPlayerProperty / defaultIdolAltarProperty`

- **Location:** `default*Property`
- **Keying:** 4 single objects (defaults)
- **Record count:** 4

| field | type | presence | range / values | example | meaning |
|---|---|---|---|---|---|
| `roundingForAdded` | number | always | values 0 | `0` | Rounding mode for added values. |
| `roundingForMore` | number | always | values 0 | `0` | Rounding mode for "more" values. |
| `displayAddedAsPercentage` | boolean | always | values false | `false` | Display added value as a percentage. |
| `displayAddedAsTenthOfValue` | boolean | always | values false | `false` | Display added value as tenth. |
| `displayAsPercentageOf` | boolean | always | values false | `false` | Display as "% of ...". |
| `displayAsAddedTo` | boolean | always | values false | `false` | Display as "added to ...". |
| `dontDisplayPlus` | boolean | always | values false | `false` | Do not prefix + sign. |
| `lessIsBetter` | boolean | always | values false | `false` | Lower value is beneficial. |
| `hideModifierValue` | boolean | always | values false | `false` | Hide the numeric value. |
| `nameIncludesModifier` | boolean | always | values false | `false` | Name already includes the modifier word. |
| `textKey` | string | always | values "" | `""` | Maxroll text key (i18n key = Properties.<textKey>[_Name\|_AltText]). |
| `propertyName` | string | always | values "","Error Player Property Not Found","Error Idol Altar Property Not Found" | `""` | English property name. |
| `property` | number | 1/4 (25.0%) | values 0 | `0` | Stat property id (SP enum, see enums.md). |
| `defaultAltText` | string | 1/4 (25.0%) | values "" | `""` | English default alt text. |
| `altTextOverrides` | array | 1/4 (25.0%) | len 0..0 | `[]` | Alternate texts by (modType,specialTag,tags). |
| `moreRoundingOverrides` | array | 1/4 (25.0%) | len 0..0 | `[]` | Per (property,specialTag) rounding overrides. |
| `altText` | string | 3/4 (75.0%) | values "" | `""` | English alt tooltip text. |

Example (record #0, trimmed):

```json
{
  "roundingForAdded": 0,
  "roundingForMore": 0,
  "displayAddedAsPercentage": false,
  "displayAddedAsTenthOfValue": false,
  "displayAsPercentageOf": false,
  "displayAsAddedTo": false,
  "dontDisplayPlus": false,
  "lessIsBetter": false,
  "hideModifierValue": false,
  "nameIncludesModifier": false,
  "textKey": "",
  "propertyName": "",
  "property": 0,
  "defaultAltText": "",
  "altTextOverrides": [],
  "moreRoundingOverrides": []
}
```

## Planner profiles (community build guides)

How the community-builds loader (`packages/db/src/loaders/community.ts`) reads the guide data; the download itself (`data/raw/<v>/maxroll-guides/index.json` + `profiles/<id>.json`, the guide list and tier list scraping) is described in the guides fetch section of this file. Tables: [schema.md section 3.9](../schema.md#39-community-builds). Verified against profile `0g5ta0n3` (Erasing Strike Void Knight, Volca, 2026-09-28): every id resolves against the LE Tools tables of 1.5.2.

A profile file is the verbatim `https://planners.maxroll.gg/profiles/le/<id>` response: `{id, date, name, class (mastery name), mainset (Maxroll ability key of the main skill), metadata (JSON string), search_metadata, season, user, ..., data}`, where `data` is a JSON **string** (`PD` below) with keys `profiles[]` (the tabs), `items` (item map), `activeProfile` (index of the tab the planner opens on), `globalNotes` ({intro, faqs, summary, changelog}, Lexical rich text), `strAndWeak` ({strengths[], weaknesses[]}), `lootFilters`, `embeds`, `options`, `activeEmbed`.

| profile field | meaning | our id / table |
|---|---|---|
| `PD.profiles[i].name` | tab name: Starter / Endgame / Aspirational | `community_build_profiles.name` |
| `.class`, `.mastery`, `.level`, `.season` | class id, mastery index (0 base class, 1..3), level, season | `classes.class_id`, `masteries (class_id, mastery_index)` |
| `.items` | `{slot: key}`, slots `weapon, offhand, head, body, waist, hands, feet, neck, finger1, finger2, relic, altar`; the key indexes `PD.items` | `community_build_items.slot` / `item_key` |
| `.idols[25]` | item keys on the 5x5 altar grid, index = y * 5 + x of the idol's top-left cell (`null` = empty / covered) | `grid_x`, `grid_y` |
| `PD.items[k].itemType`, `.subType` | base type id, sub type id (game ids, as LE Tools) | `item_subtypes (base_type_id, sub_type_id)` |
| `.uniqueID`, `.uniqueRolls[rollID]` | unique id; 0..1 roll per unique mod `rollID` | `uniques.unique_id` |
| `.implicits[i]` | 0..1 roll of implicit i | mods `implicit` `'<base>:<sub>'` source_ord i |
| `.affixes[]`, `.sealedAffix`, `.corruptedAffixes[]` | `{id, tier, roll}`: affix id, **1-based** tier (tier N = `tiers[N-1]`), roll 0..1 with 1 = max of the tier range (value = min + (max - min) * roll); affixes of a unique are its extra (legendary potential / Weaver's Will) affixes; the data does not say which | `affixes.affix_id`, `affix_tiers.tier` = mods `affix_tier`.tier; prefix/suffix from `affixes.affix_type` |
| `.corrupted` | item is corrupted | `is_corrupted` |
| `.blessings[i]` | `{itemType 34, subType, implicits[0] = roll}`; slot i = timeline i + 1 (each blessing is in that timeline's lists) | `blessings.sub_type_id`, `timelines.timeline_id` |
| `.passives` | `{history[], position}`: one class-tree node id per point (tree = the class `treeID`, e.g. `kn-1`); only `history[0:position]` applies | `tree_nodes (tree_id, node_id)` |
| `.weaver`, `.weaverItems` | the same for the Weaver tree (`weaver`); Weaver items (empty in the sample, kept in `raw_json`) | `tree_nodes ('weaver', node_id)` |
| `.skillTrees` | `{<tree id>: {history[], position}}`; the tree id is the ability id (Maxroll `abilities[*].playerAbilityID`, LE Tools `LESkillTrees` key). Trees can exist for skills that are not specialized (planner leftovers) | `trees.tree_id` = `abilities.ability_id` |
| `.activeSkills[5]`, `.specializedSkills[5]` | Maxroll ability **keys** (`ErasingStrike`), mapped with data.json `abilities[key].playerAbilityID` (`es6ai`) | `abilities.ability_id` |
| `.widgetNotes` | per-section notes of the tab ({skills, passives, equipment}), Lexical rich text (`embed` nodes carry `text` and a planner id) | `community_build_profiles.notes_json` (plain text) |
| `.quests` | completed quest ids | `maxroll_quests.quest_id` (kept in `raw_json`) |

Not in the data: legendary potential / Weaver's Will values, the forging potential, and per-item notes. Stat property 120 (`EffectOfAilmentOnYou`, used by affix 951 and some uniques) has no display rule in either source; the build report lists it under `community.unnamed_properties`.

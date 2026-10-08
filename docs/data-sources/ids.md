# ID spaces and how the two sources join

This document lists every identifier family in the LE Tools and Maxroll data, how it is encoded, which family it joins to in the other source, and whether the join is **lossless** (identical id on both sides) or needs a **mapping** (a lookup that has to be built). All verification numbers were produced by `join_checks.js`, `i18n_check.js`, `relkeys.js` and `counts.js` (see [README.md](README.md#scripts)). Enum meanings are in [enums.md](enums.md); counts are in [counts.md](counts.md).

## 1. ID families at a glance

| id family | LE Tools field | Maxroll field | type / range | join |
|---|---|---|---|---|
| affix id | `affixList.{singleAffixes,multiAffixes}.<affixId>` key and `.affixId` | `affixes[].affixId` | int 0..1156 (1,156 ids; **1139 absent in both**); key == field | **lossless** (identical id sets, 1,156 each) |
| unique id | `uniqueList.uniques.<uniqueId>` key and `.uniqueId` | `uniques[].uniqueID` | int 0..488, 486 present (sparse) | **lossless** (identical sets; names, `subTypes`, mods all equal) |
| set id | `setBonusList[i].setID` (== array index) | `setBonuses[i].setID` | int 0..24 (0 = no set) | **lossless**; `uniques[].setID` points here |
| base type id | `itemList.{equippable,nonEquippable}.<baseTypeId>` | `itemTypes[].baseTypeID` | int 0..41 and 101..109 | **lossless**; Maxroll has 3 extra ids (11, 24, 40) |
| sub type id | `...<baseTypeId>.subItems.<subTypeId>` | `itemTypes[].subItems[].subTypeID` | int, unique only within a base type; identity = `(baseTypeId, subTypeId)` | **lossless**; Maxroll has 13 extra sub types |
| item sprite | `subItems.*.sprite` = `I<n>` (e.g. `I1552`) | `sprite` = 32-hex md5 hash | LE: string `I\d+`; MR: hash | needs a mapping (not recoverable from the data) |
| stat property id | `SP` enum value; `propertyList[].property` | `properties[].property` | int 0..133 (+ `LocalSP` 1001..1106, + skill-tree families 5000+) | **lossless** (same ids, same order) |
| player property id | `playerPropertyList` index (= `tags` of SP 98 lines) | `playerProperties` index | int 0..712 | **lossless** for 0..711; Maxroll lacks 712 |
| ability property | `abilityPropertyList[].abilityID` + `properties[]` index (= `specialTag` of SP 58 lines) | `abilityProperties[]` | abilityID == ability index (int 1..) | **lossless** (same 177 ids, same order) |
| idol-altar property | `idolAltarPropertyList.list` index | `idolAltarProperties` index | int 0..30 | **lossless** |
| conditional property | index in `conditional{Damage,NonDamage}PropertyDescriptionKeys` (= `specialTag` of SP 117) | `conditionalProperties[]` index | int 0..47 | **lossless** by index |
| ailment id | `AilmentID` value; `ailmentList.<id>` key, `.id` | `ailments[].id` | int 1..150 | **lossless** for 1..128; ids 129..150 LE only |
| ability string id | `abilityList.<id>`, e.g. `fi9`, `ability_gen172`, `ailment_6`, `entity_fm8_2` | `abilities.<name>.playerAbilityID` (only player abilities) | string | **mapping via `index`** (see 3) |
| ability index | `abilityList[id].index` (1..993) | position in `abilityList[]` (names), `abilityProperties[].abilityID` | int | **lossless** for 971 of 981 indexes; 10 LE indexes are null in Maxroll (660, 664, 678, 687, 791, 792, 812, 813, 992, 993) |
| ability internal name | `abilityList[id].internalName` (camelCase, `hungeringSouls`) | `abilities` key (PascalCase, `HungeringSouls`) | string | case-insensitive match for 550 abilities; use `index` instead |
| skill tree id (`treeID`) | `LESkillTrees.<treeID>` = a player ability id (`fi9`) | `skillTrees.<treeID>` | string | **lossless** (same 136 ids; same node-id sets in all 136 trees) |
| class tree id | `LECharTrees.trees[classID].characterTree.treeID` | `skillTrees["pr-1"|...]`, `classes[].treeID` | `pr-1`, `mg-1`, `kn-1`, `ac-1`, `rg-1` (+ `weaver`) | **lossless** |
| class id | index of `LECharTrees.trees` / `LECharTreesUI` key order | `classes[].classID` | int 0..4 | **lossless** (see enums.md section 9) |
| node id | `nodes.<nodeId>` key and `.id` | `nodes.<nodeId>` key | int, unique only within a tree | **lossless** |
| i18n key | strings such as `Skills.Skill_fi9_2_Name` | `textKey`/`localizationKey` (without section) | see 4 | see 4 |
| monster mod id | compact string (`MIzDMQ`), decodes to int 0..286 | none | see 2 | LE only (Maxroll `timelines[].difficulties[].modFromCorruption.key` is an opaque int hash, e.g. 993139884, **not joinable**) |
| timeline id | `timelineData.<id>` 1..10 | `timelines[].timelineID` 1..10 (+99) | int | **lossless** (names equal); Maxroll adds id 99 |
| dungeon / arena / faction id | `dungeonData` 1..3, `arenaData` 1..2, `factionList[].factionId` 0..3 | none | int | LE only |
| woven echo id | `wovenEchoList[].id` + `slug` | none | int | LE only |
| quest id | `checklist.questList.<id>` (36), `Quests.Quest_<id>_Name` | `quests[].id` (145) | int up to 200 | **lossless** (all 36 LE ids exist in Maxroll; all 145 Maxroll names equal `en.json`) |
| scene code | `sceneList.<code>` (`A10`, `M_B50`, `Arena_1_Desert`, `Dun1Q10`) | none | string | LE only |
| entity id | `entityList.<100000+n>` | none | int | LE only; `actor.data.genId` holds a string id (`primal_wolf`) |
| Maxroll sprite/atlas | none | `treeAtlas[]`, node `icon`/`sprite`, `abilities.*.sprite`, `ailments[].icon` | 32-hex md5 | needs a mapping to LE sprite ids (`a-r-<n>`) |
| LE sprite ids | `a-r-<n>` (UI/ability icons), `I<n>` (items), `j-r-<n>` (monolith rewards), `k-r-<n>` (loot filter icons), `g-r-<n>` (backgrounds) | none | string | LE only |

Key-versus-field note: for every keyed collection of LE Tools the object key equals the record's own id field (`uniqueList.uniques`, `affixList.*`, `abilityList` key == `id`, `ailmentList`, `LESkillTrees`, nodes). Exception: `setBonusList` is an array (index == `setID`).

## 2. LE Tools compact string ids

Several LE Tools maps are keyed by short strings such as `AKwDgnEA`, `UAzAsCYHYDYg`, `IIwBmHYxaSA` or `MIzDMQ`. **Decoding: the first character is a kind letter; the remainder is an [lz-string](https://pieroxy.github.io/lz-string/) `compressToEncodedURIComponent` encoding of a decimal string.**

```js
const LZString = require('lz-string');            // npm i lz-string
const decode = (id) => ({ kind: id[0], value: LZString.decompressFromEncodedURIComponent(id.slice(1)) });
decode('MAxA');          // { kind: 'M', value: '0'  }
decode('MIzDMQ');        // { kind: 'M', value: '113' }
decode('AKwDgnEA');      // { kind: 'A', value: '589' }
decode('UAzAsCYHYDYg');  // { kind: 'U', value: '004276' }
```

Verified for all keys in `monsterMods` and in the maps `relModAbilities`, `relModAilments`, `relIncLevelAbilities`, `triggeredAbilities`, `triggeredAilments`, `relatedAbilities` (all `itemDB`). The letter selects the id space of the decoded number:

| kind | points at | decoded layout | verification (distinct keys over the 6 maps) |
|---|---|---|---|
| `M` | monster mod | decimal int `0..286` | `monsterMods` has 287 keys decoding to exactly 0..286 (contiguous); all 212 distinct mod references from `timelineData`, `dungeonData` and `arenaData` resolve |
| `A` | affix | decimal `affixId` | 558 of 558 resolve to an existing affix (e.g. `AGwVgHEA` -> 658 "Percent Missing Health Restored On Lunge") |
| `U` | unique mod line | 6 digits `<NNN><uuu>`: last 3 digits = `uniqueId` (zero padded), first 3 digits = an index of the line within the unique | 333 of 333 resolve to an existing unique (e.g. `UAzCMwZgJiA` = `001032` -> unique 32 "Frozen Ire"). The first three digits are **not** always an index into `mods[]` (only 285 of 722 uses are < `mods.length`, up to 13 seen); exact meaning unknown |
| `S` | set bonus line | 3 digits = `setID` | 15 of 15 resolve (e.g. `SAzDMQ` = `003` -> "Apiarist's" set) |
| `I` | item implicit | `1` + 3-digit `baseTypeId` + 3-digit `subTypeId` + 3-digit implicit index (always `000` in the data) | 107 of 108 resolve to an existing sub type (e.g. `IIwBjIVnEg` = `1000050000` -> base 0, sub 50 "Falconry Helm") |

What the maps contain (key -> value):

| map | value | meaning |
|---|---|---|
| `relModAbilities` (= `relatedAbilities`, identical content) | array of ability id strings | abilities referred to by the stat line the key points at |
| `relModAilments` | array of `AilmentID` ints | ailments referred to by the stat line |
| `relIncLevelAbilities` | array of ability ids | abilities whose level the stat line increases |
| `triggeredAbilities` | `{abilityId: 1}` | abilities triggered by the stat line |
| `triggeredAilments` | `{AilmentID: stacks}` | ailments triggered |

Semantic check: for `A` keys of `relModAilments`, 144 of 194 affixes have an `affixProperties[].specialTag` equal to the listed ailment ids; the other 50 reference the ailment indirectly (through `PlayerProperty` / ability property lines), so the maps cannot be rebuilt from `specialTag` alone and should be imported as they are.

Per-map key counts by kind (A/U/S/I):

| map | A (affix) | U (unique line) | S (set) | I (implicit) | total keys |
|---|---|---|---|---|---|
| `relModAbilities` | 252 | 231 | 11 | 15 | 509 |
| `relModAilments` | 194 | 191 | 4 | 96 | 485 |
| `relIncLevelAbilities` | 138 | 55 | 2 | 0 | 195 |
| `triggeredAbilities` | 65 | 84 | 1 | 0 | 150 |
| `triggeredAilments` | 137 | 161 | 3 | 88 | 389 |
| `relatedAbilities` | 252 | 231 | 11 | 15 | 509 |

Examples (3 per kind, from the verification output):

| kind | id | decoded | resolves to |
|---|---|---|---|
| A | `AGwVgHEA` | `658` | Percent Missing Health Restored On Lunge |
| A | `AKwJgHEA` | `528` | Mana efficiency with Decoy |
| A | `AMwdgbEA` | `376` | Mana Gained when you use Rive and Hit at least one enemy |
| U | `UAzCMwZgJiA` | `001032` | Frozen Ire |
| U | `UAzDsCYE5iA` | `007290` | Apostate's Sanctuary |
| U | `UAzCcGYEZiA` | `009310` | Wrongwarp |
| S | `SAzDMQ` | `003` | Apiarist's |
| S | `SAwRgnEA` | `019` | Doppelganger's |
| S | `SAzAcQ` | `008` | Pebbles' |
| I | `IIwBjIVnEg` | `1000050000` | Falconry Helm (implicit #0, implicits.length=3) |
| I | `IIwBhCYWBmMSA` | `1002013000` | Singularity Belt (implicit #0, implicits.length=2) |
| I | `IIwBgTGIKwJwvQ` | `1022059000` | Blood Encased Hive (implicit #0, implicits.length=1) |
| M | `MAxA` | `0` | monster mod 0: "the dungeon boss drops '{'1'}'Exalted Jewelry'{'/'}'" |
| M | `MIxA` | `1` | monster mod 1: "the dungeon boss drops much '{'1'}'Exalted Jewelry'{'/'}'" |
| M | `MIzDMQ` | `113` | monster mod 113: "enemies have '{'1'}'[1%] more health and damage'{'/'}'" |

Known unresolved ids: the implicit compact id `IIwBmCY0kSA` decodes to base 12 / sub 12 / implicit 0, a sub type that does not exist in itemDB (it is kept in `compact_ids` with `resolves = 0`; Maxroll has a 12/12 "Silver Crescent" sub type that LE Tools lacks).

## 3. Ability joins (the one id family that needs a mapping)

LE Tools identifies abilities by a short string (`fi9`); Maxroll by a name (`Fireball`). The numeric `index` is the bridge:

```
LE  abilityList["fi9"].index == 1
MR  abilityList[1]            == "Fireball"
MR  abilities["Fireball"].playerAbilityID == "fi9"
MR  abilityProperties[0].abilityID == 1          (== coreDB.abilityPropertyList[0].abilityID)
```

- `index` is present on 981 of the 1,228 LE records (the rest are internal sub-abilities without index); 971 of them resolve to a non-null Maxroll slot. The 10 that do not (660, 664, 678, 687, 791, 792, 812, 813, 992, 993) are null in Maxroll's `abilityList`.
- For all 136 LE skill-tree ids, `Maxroll.abilities[abilityList[LE.index]].playerAbilityID == treeID`.
- Player-skill id lists: LE `playerAbilityIdList` (183 entries, 182 distinct: `vm53dx` appears twice) vs Maxroll `playerAbilityList` (184 names resolved to `playerAbilityID`): 174 ids shared. LE-only ids: `null_Soul_Geyser`, `evade3wb`, `evade3sp`, `evade3sb`, `evade3rp`, `sw43_c`, `hs18gu_c`, `rb7_c`; Maxroll-only: `werebearevade1` and two entries with an empty `playerAbilityID`.
- Property ids that embed an ability index: SP 58 (`AbilityProperty`, `tags`), SP 88 (`LevelOfSkills`, `tags`), and `extraTag` of a few lines (e.g. SP 117 `extraTag 143` = `MarrowShards`).

## 4. i18n key patterns

`en.json` is a flat map `Section.Key -> English string` with **34,993** keys in 17 sections. Section counts: `UI` 129, `Common` 215, `Item_Names` 3,786, `Actors` 190, `Ailments` 800, `Abilities` 1,335, `GameGuide` 1,228, `Quests` 152, `Item_Affixes` 3,808, `Properties` 4,115, `Skills` 18,057, `Scenes` 388, `MonsterMods` 468, `MapObjects` 83, `Monolith_Timelines` 100, `MonolithObjectives` 93, `VaultMods` 46 (total 34,993).

Each pattern was generated from ids and looked up in `en.json` by `i18n_check.js`; "verified" is `found / generated`. Three resolved examples per pattern are shown. A key marked *stored* is looked up through a key string stored in the record (the pattern is then descriptive, not derivable).

| entity | key pattern | verified | 3 resolved examples (key => English) |
|---|---|---|---|
| skill-tree node name | `Skills.Skill_<treeID>_<nodeId>_Name` | 3956/3956 | `Skills.Skill_av75ch_0_Name` => "Avalanche"<br>`Skills.Skill_av75ch_2_Name` => "Mountain Peak"<br>`Skills.Skill_av75ch_3_Name` => "Precision" |
| skill-tree node stat label | `Skills.Skill_<treeID>_<nodeId>_<statIndex>_Stat` | 6528/6528 | `Skills.Skill_av75ch_2_0_Stat` => "Channeled"<br>`Skills.Skill_av75ch_2_1_Stat` => "Channel Cost"<br>`Skills.Skill_av75ch_3_0_Stat` => "Small Boulder Target Area" |
| class passive node name | `Skills.Skill_<classTreeId>_<nodeId>_Name` | 541/541 | `Skills.Skill_pr-1_0_Name` => "Primal Strength"<br>`Skills.Skill_pr-1_1_Name` => "Natural Attunement"<br>`Skills.Skill_pr-1_2_Name` => "Gift of the Wilderness" |
| weaver node name | `Skills.Skill_weaver_<nodeId>_Name` | 80/80 | `Skills.Skill_weaver_0_Name` => "Weaver Tree"<br>`Skills.Skill_weaver_1_Name` => "Shifted Knowledge"<br>`Skills.Skill_weaver_2_Name` => "Giveaway Coins" |
| affix display name | `Item_Affixes.Item_Affix_<affixId>_DisplayName` | 1156/1156 | `Item_Affixes.Item_Affix_0_DisplayName` => "Void Penetration"<br>`Item_Affixes.Item_Affix_1_DisplayName` => "Armor"<br>`Item_Affixes.Item_Affix_2_DisplayName` => "Melee Attack Speed" |
| affix title (prefix/suffix word) | `Item_Affixes.Item_Affix_<affixId>_Title` | 934/934 | `Item_Affixes.Item_Affix_0_Title` => "Inevitable"<br>`Item_Affixes.Item_Affix_1_Title` => "of Defense"<br>`Item_Affixes.Item_Affix_2_Title` => "Deft" |
| affix stat line A | `Item_Affixes.ItemAffix_<affixId>_Affix_A` | 1156/1156 | `Item_Affixes.ItemAffix_0_Affix_A` => "Void Penetration"<br>`Item_Affixes.ItemAffix_1_Affix_A` => "Armor"<br>`Item_Affixes.ItemAffix_2_Affix_A` => "Melee Attack Speed" |
| affix stat line B (multi affixes) | `Item_Affixes.ItemAffix_<affixId>_Affix_B` | 540/540 | `Item_Affixes.ItemAffix_14_Affix_B` => "Cold Resistance"<br>`Item_Affixes.ItemAffix_29_Affix_B` => "Stun Avoidance"<br>`Item_Affixes.ItemAffix_36_Affix_B` => "Health" |
| base type name | `Item_Names.Item_BaseType_Name_<baseTypeId>` | 48/48 | `Item_Names.Item_BaseType_Name_0` => "Helmet"<br>`Item_Names.Item_BaseType_Name_1` => "Body Armor"<br>`Item_Names.Item_BaseType_Name_2` => "Belt" |
| sub type name | `Item_Names.Item_SubType_Name_<baseTypeId>_<subTypeId>` | 1558/1558 | `Item_Names.Item_SubType_Name_0_1` => "Jewelled Circlet"<br>`Item_Names.Item_SubType_Name_0_2` => "Iron Casque"<br>`Item_Names.Item_SubType_Name_0_4` => "Dome Cap" |
| sub type description | `Item_Names.Item_SubType_Description_<baseTypeId>_<subTypeId>` | 640/640 | `Item_Names.Item_SubType_Description_101_0` => "Augments an item to grant it a new property or improve an ex"<br>`Item_Names.Item_SubType_Description_101_1` => "Augments an item to grant it a new property or improve an ex"<br>`Item_Names.Item_SubType_Description_101_2` => "Augments an item to grant it a new property or improve an ex" |
| unique name | `Item_Names.Unique_Name_<uniqueId>` | 486/486 | `Item_Names.Unique_Name_0` => "Calamity"<br>`Item_Names.Unique_Name_1` => "Fractured Crown"<br>`Item_Names.Unique_Name_2` => "Snowblind" |
| unique lore | `Item_Names.Unique_Lore_<uniqueId>` | 355/355 | `Item_Names.Unique_Lore_0` => "Set the world ablaze and burn along with it."<br>`Item_Names.Unique_Lore_1` => "Few goals have cost more lives than the quest for power."<br>`Item_Names.Unique_Lore_2` => "Blind with the snow, never blinded by it." |
| unique tooltip description | `Item_Names.Unique_Tooltip_<descIndex>_<uniqueId>` | 562/562 | `Item_Names.Unique_Tooltip_0_0` => "[100,150,0]% Chance to Ignite on Hit with Fire Skills"<br>`Item_Names.Unique_Tooltip_1_0` => "When you kill an enemy with a fire skill you take 4 fire dam"<br>`Item_Names.Unique_Tooltip_0_1` => "You have no ward" |
| set name | `Item_Names.ItemSet_<setId>_Name` | 25/25 | `Item_Names.ItemSet_1_Name` => "Isadora's"<br>`Item_Names.ItemSet_2_Name` => "Invoker's"<br>`Item_Names.ItemSet_3_Name` => "Apiarist's" |
| set bonus description | `Item_Names.ItemSet_<setId>_Description_Base_<n> (+ _Alt_<n> via altTextKey)` | 18/18 | `Item_Names.ItemSet_1_Description_Base_0` => "+30% Mana Efficiency with Necrotic Spells"<br>`Item_Names.ItemSet_1_Description_Base_1` => "+100% Chance to apply Damned on hit with Necrotic Spells"<br>`Item_Names.ItemSet_2_Description_Base_0` => "+2 to Fire Spells +2 to Lightning Spells +2 to Cold Spells" |
| player property name | `Properties.Property_Player_<index>_Name` | 713/713 | `Properties.Property_Player_0_Name` => "Chance to gain Haste for 3 seconds when you Summon a Totem"<br>`Properties.Property_Player_1_Name` => "Chance to Cast Lightning Strike when you use a skill that co"<br>`Properties.Property_Player_2_Name` => "Chance on kill to refresh the cooldown of a random companion" |
| master property name | `Properties.Property_Master_<propertyName>_Name  (propertyName from Maxroll properties[].propertyName)` | 113/113 | `Properties.Property_Master_Damage_Name` => "Damage"<br>`Properties.Property_Master_Ailment Chance_Name` => "Ailment Chance"<br>`Properties.Property_Master_Attack Speed_Name` => "Attack Speed" |
| master property alt text | `Properties.Property_Master_<propertyName>_AltText` | 100/100 | `Properties.Property_Master_Damage_AltText` => "Increases the damage you deal"<br>`Properties.Property_Master_Ailment Chance_AltText` => "For skills which have less chance to apply ailments on hit, "<br>`Properties.Property_Master_Attack Speed_AltText` => "Increases the number of attacks you can use per second" |
| ability property name | `Properties.Property_Ability_<camelAbilityName>_<n>_Name (n is 1-based = specialTag+1); Maxroll textKey = Property_Ability_<camel>_<n>` | 2344/2344 | `Properties.Property_Ability_fireball_1_Name` => "Pierce Chance with Fireball"<br>`Properties.Property_Ability_fireball_2_Name` => "Projectiles for Fireball"<br>`Properties.Property_Ability_fireball_3_Name` => "Fireball Base Damage Converted to Lightning" |
| idol altar property name | `Properties.Property_IdolAltar_<index>_Name` | 31/31 | `Properties.Property_IdolAltar_0_Name` => "Maximum Omen Idols"<br>`Properties.Property_IdolAltar_1_Name` => "Effect of Prefixes and Suffixes for Idols in Refracted Slots"<br>`Properties.Property_IdolAltar_2_Name` => "Effect of Prefixes for Idols in Refracted Slots" |
| ability name (LE Tools nameKey) | `Abilities.Ability_<Name>_Name` | 521/521 | `Abilities.Ability_HungeringSouls_Name` => "Hungering Souls"<br>`Abilities.Ability_AbyssalEchoes_Name` => "Abyssal Echoes"<br>`Abilities.Ability_SerpentStrike_Name` => "Serpent Strike" |
| ability name from Maxroll key | `Abilities.Ability_<Maxroll abilities key>_Name` | 505/1054 (misses e.g. Abilities.Ability_NullAbility_Name) | `Abilities.Ability_Swipe_Name` => "Swipe"<br>`Abilities.Ability_SummonWolf_Name` => "Summon Wolf"<br>`Abilities.Ability_BasicPlayerAttack_Name` => "Attack" |
| ability description from Maxroll key | `Abilities.Ability_<Maxroll abilities key>_Description` | 482/856 (misses e.g. Abilities.Ability_NullAbility_Description) | `Abilities.Ability_Swipe_Description` => "A melee attack that hits all enemies in an area in front of "<br>`Abilities.Ability_SummonWolf_Description` => "Summons a primal wolf that follows you into combat. When its"<br>`Abilities.Ability_BasicPlayerAttack_Description` => "A basic attack with your weapon that costs no mana" |
| ailment name | `Ailments.Ailment_<InternalName>_Name` | 148/148 | `Ailments.Ailment_Ignite_Name` => "Ignite"<br>`Ailments.Ailment_Bleed_Name` => "Bleed"<br>`Ailments.Ailment_Chill_Name` => "Chill" |
| ailment description | `Ailments.Ailment_<InternalName>_Description` | 125/125 | `Ailments.Ailment_Ignite_Description` => "Deals fire damage over time"<br>`Ailments.Ailment_Bleed_Description` => "Deals physical damage over time"<br>`Ailments.Ailment_Chill_Description` => "Reduces movement speed, attack speed, and cast speed." |
| UI buff name | `Ailments.NonAilment_<UIBuffIdName>_Name` | 264/264 | `Ailments.NonAilment_IronMastery_Name` => "Iron Mastery"<br>`Ailments.NonAilment_ReactiveWard_Name` => "Reactive Ward"<br>`Ailments.NonAilment_Insight_Name` => "Insight" |
| quest name | `Quests.Quest_<questId>_Name` | 145/145 | `Quests.Quest_1_Name` => "The Void Assault"<br>`Quests.Quest_2_Name` => "Armory Aid"<br>`Quests.Quest_3_Name` => "Erza's Ledger" |
| scene name | `Scenes.Scene_Name_<sceneCode>` | 385/385 | `Scenes.Scene_Name_A10` => "Last Refuge Outskirts"<br>`Scenes.Scene_Name_A30` => "The Council Chambers"<br>`Scenes.Scene_Name_A40` => "The Last Archive" |
| woven echo name | `Monolith_Timelines.Woven_Echo_Name_<Name>` | 47/47 | `Monolith_Timelines.Woven_Echo_Name_ManyShrines` => "False Temple"<br>`Monolith_Timelines.Woven_Echo_Name_ManyCaches` => "Unclaimed Trove"<br>`Monolith_Timelines.Woven_Echo_Name_NemesisTower` => "Conquered Tower" |
| timeline name | `MapObjects.Island_Name_<Timeline English name> (timelineData[].nameKey)` | 10/10 | `MapObjects.Island_Name_Fall of the Outcasts` => "Fall of the Outcasts"<br>`MapObjects.Island_Name_The Stolen Lance` => "The Stolen Lance"<br>`MapObjects.Island_Name_The Black Sun` => "The Black Sun" |
| monster mod description | `MonsterMods.<mod title>_M&D_Description / _Title / _Description (stored keys)` | 274/274 | `MonsterMods.Boss Drops Exalted Jewelry T2 Dungeon Mod_M&D_Description` => "the dungeon boss drops '{'1'}'Exalted Jewelry'{'/'}'"<br>`MonsterMods.Boss Drops Exalted Jewelry T3 Dungeon Mod_M&D_Description` => "the dungeon boss drops much '{'1'}'Exalted Jewelry'{'/'}'"<br>`MonsterMods.Boss Drops Exalted Jewelry T4 Dungeon Mod_M&D_Description` => "the dungeon boss drops a horde of '{'1'}'Exalted Jewelry'{'/" |
| affix display category | `Common.Affix_Category_<English name>` | 45/45 | `Common.Affix_Category_Attributes` => "Attributes"<br>`Common.Affix_Category_Melee` => "Melee"<br>`Common.Affix_Category_Spell` => "Spell" |
| faction name | `UI.Factions_<Name>Name` | 4/4 | `UI.Factions_CircleofFortuneName` => "Circle of Fortune"<br>`UI.Factions_MerchantGuildName` => "Merchant's Guild"<br>`UI.Factions_ForgottenKnightsName` => "Forgotten Knights" |

String escaping in `en.json`, observed on every apostrophe-bearing string: **a literal apostrophe is doubled (`''`)** (ICU MessageFormat), e.g. `Artor''s Legacy` vs Maxroll `Artor's Legacy`; after replacing `''` with `'` all 486 unique names and all 145 quest names equal Maxroll's. Two further quirks seen in the data: (a) markup placeholders are ICU-quoted braces, e.g. `the dungeon boss drops '{'1'}'Exalted Jewelry'{'/'}'` stands for `{1}Exalted Jewelry{/}`; (b) a few strings differ by a trailing `\n` vs `\r` or trailing space between the two sources.

Mapping Maxroll text keys to `en.json` keys:

| Maxroll field | value example | `en.json` key |
|---|---|---|
| `properties[].textKey` | `Property_Master_Damage_AltText` | `Properties.Property_Master_Damage_Name` (name) and `Properties.Property_Master_Damage_AltText` |
| `abilityProperties[].properties[].textKey` | `Property_Ability_fireball_1` | `Properties.Property_Ability_fireball_1_Name` / `_AltText` |
| `playerProperties[].textKey` | `Property_Player_0` | `Properties.Property_Player_0_Name` / `_AltText` |
| `idolAltarProperties[].textKey` | `Property_IdolAltar_0` | `Properties.Property_IdolAltar_0_Name` |
| `classes[].masteries[].localizationKey` | `Class_Primalist`, `Mastery_Beastmaster` | `UI.Class_Primalist_Description`, `UI.Mastery_Beastmaster_Description` (both exist) |

## 5. Join summary: lossless versus mapped

| concept | join | verdict | evidence |
|---|---|---|---|
| uniques (ids, names, mods, `subTypes`, set membership) | `uniqueId` == `uniqueID` | lossless | 486/486 ids equal; 486/486 mod lists equal; 486/486 names equal after `''` unescape |
| affixes (ids, flags, tiers) | `affixId` | lossless | 1,156/1,156 ids; tiers equal in 1,148 (8 differ only by float32 noise, e.g. `0.29000002` vs `0.29`) |
| set bonuses | `setID` | lossless | 25/25; per-set membership (`itemsInSet` vs `uniques` with `isSetItem` and the same `setId`) equal in 25/25 sets (61 set items) |
| base types / sub types / implicits | `(baseTypeId, subTypeId)` | lossless for the common part | LE sub types are a subset of Maxroll's (Maxroll +13 sub types, +7 implicits, +3 base types) |
| stat properties | `property` | lossless | same 113 entries in the same order |
| player / ability / idol-altar properties | index | lossless | 713 vs 712 (last missing in Maxroll; 711 of the 712 shared names are equal after unescaping, 1 differs by an embedded carriage-return character (U+000D)), 177 vs 177, 31 vs 31 |
| ailments | `id` | lossless (1..128) | 126 distinct ids shared; ids 129..150 LE only |
| abilities | `index` bridge | **mapping** | see section 3; names differ in case, ids differ in format |
| skill trees and nodes | `treeID` + `nodeId` | lossless | 136/136 trees, identical node-id sets, node names equal; stats and requirement counts equal (6,528 and 4,577); content equal except 1,335 stat `value` fields (`null` in LE Tools, `""` in Maxroll) and one requirement (fl71ds node 17). Requirement prerequisite field is `nodeId` in LE Tools but `node` in Maxroll |
| class passive trees, Weaver tree | tree id + `nodeId` | lossless | 541 and 80 nodes in both; 91 stat `value`s are `null` vs `""`, everything else equal |
| tree node positions | LE `LESkillTreesUI[tree].children[]` (`rect[0..1]`) vs Maxroll `nodes.<id>.transform {x,y}` | lossless for ability trees (identical x,y, e.g. fi9 node 2 = (-176.4, -154.8) in both), constant offset for class trees: Maxroll x = rect.x + 585.12, y = rect.y - 300.49 (111 of 111 pr-1 nodes fit with slope 1.0; the canvas `rect` is 1170 x 600.98) | positions live in separate UI structures in LE Tools but inline in Maxroll; weaver offset not checked |
| timelines | `timelineId` | lossless (1..10) | names equal; Maxroll adds 99 |
| monster mods, dungeons, arena, factions, woven echoes | none | LE Tools only | - |
| quests | `id` | lossless | 36 LE ids inside 145 Maxroll ids; names equal |
| icons / sprites | LE `a-r-<n>` / `I<n>` vs Maxroll md5 | **mapping needed** (no table in either source) | - |
| i18n | key patterns of section 4 | derivable from ids for all gameplay entities; Maxroll has no keys, only resolved English (so the key is recoverable via its `textKey` or by matching English text) | section 4 |

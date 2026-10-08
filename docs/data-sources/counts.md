# Record counts: LE Tools versus Maxroll

All numbers were computed by `counts.js` (and `join_checks.js` for the id-set comparisons) on the decoded data. "LE Tools" counts come from the decoded globals (`version152`), "Maxroll" counts from `data.json` hash `1b325e38`. A dash means the concept does not exist in that source. Rows marked "(flattened)" count records gathered from all parents.

| collection | LE Tools | Maxroll | difference / note |
|---|---|---|---|
| uniques | 486 | 486 | Identical id sets (ids 0..488, 3 gaps). All 486 mod lists identical on property/tags/type/value/maxValue/specialTag. |
| unique mods (flattened) | 2,440 | 2,440 | Identical. |
| unique tooltipDescriptions | 562 | 562 | Identical count; LE Tools stores i18n keys, Maxroll stores resolved English text with `[min,max,decimals]` roll placeholders. |
| set bonuses (setBonusList / setBonuses) | 25 | 25 | Both include setID 0 (empty "no set"). LE Tools `setNames` has 24 entries (ids 1..24). |
| set item uniques (isSetItem=1) | 61 | 61 | Maxroll embeds full unique records in setBonuses[].itemsInSet. |
| affixes (all) | 1,156 | 1,156 | LE Tools: singleAffixes 616 + multiAffixes 540. Maxroll: one flat array of 1156. Same ids (0..1156, id 1139 absent in both). |
|   of which single-stat | 616 | 616 | Maxroll single-stat affixes inline `property/specialTag/tags/...`; multi-stat ones carry `affixProperties[]` + `tiers[].extraRolls[]`. |
|   of which multi-stat | 540 | 540 |  |
| affix stat lines | 1,696 | 1,696 | Identical once Maxroll inline properties are counted as one line. |
| affix tiers (flattened) | 6,238 | 6,238 | Identical; roll values equal except float32 noise in LE Tools (e.g. 0.29000002 vs 0.29) in 8 affixes. |
| affix display categories | 45 | 45 | Same 45 categories in same order. |
| affix category headers | 12 | 12 |  |
| base types | 48 | 51 | LE Tools equippable 39 + nonEquippable 9. Maxroll adds ids 11 ("1H Fist"), 24 ("Crossbow") (both in LE Tools `disabledBaseTypesToRoll`, 0 subtypes) and 40 (unnamed, 1 subtype). |
| sub types | 1,558 | 1,571 | Maxroll has 13 extra sub types: 0/0:Mercenary Helmet\|Refuge Helmet, 0/3:Fur Helmet\|Wolf Helmet, 12/12:Silver Crescent\|, 21/13:Old Silver Ring\|, 40/0:\|, 104/1:Broken Key\|, 104/2:Whispering Key\|, 107/0:Fading Echo\|, 107/1:Plane of Exile\|, 107/6:Tower of the Weaver\|, 107/46:Circle of Frozen Blood\|, 107/48:Site of Carnage\|, 107/49:Blood of Farwood\|. |
| implicits (flattened) | 1,529 | 1,536 | The 7 extra implicits all sit on the Maxroll-only sub types (0/0:1, 0/3:2, 12/12:3, 21/13:1). |
| ailments | 148 | 128 | AilmentID enum has 151 names; LE Tools ailmentList has 148 (enum minus None=0, UNUSED=112, UNUSED2=119). Maxroll has 128 records, ordered by id (index = id-1, except indices 120..124 which are permuted); the two UNUSED slots (ids 112 and 119) are filled with copies of the Ignite record (id 1), so only 126 distinct ids (max id 128) are real. Ids 129..150 (22 newer / monster-only ailments) exist only in LE Tools. |
| UI buffs (non-ailment) | 264 | - | LE Tools only (UIBuffs / UIBuffIds). |
| abilities (definition records) | 1,228 | 1,054 | LE Tools keyed by id string, Maxroll keyed by name; 84 Maxroll abilities are absent from Maxroll abilityList (no index). |
| abilities with an `index` | 981 | 980 | LE `index` ranges 1..993; Maxroll abilityList has 992 slots, 980 non-null. |
| allAbilityIdList (LE) / abilityList (MR) | 994 | 992 | LE list has 994 entries (index 0 null); Maxroll 992. |
| player abilities | 183 list entries (182 distinct) | 184 | LE ids vs Maxroll names (via abilities[name].playerAbilityID): 174 ids shared; LE-only: null_Soul_Geyser, evade3wb, evade3sp, evade3sb, evade3rp, sw43_c, hs18gu_c, rb7_c; Maxroll-only: werebearevade1 and 2 entries with empty/no playerAbilityID. |
| ability prefab components | 2,516 | 915 | LE Tools keeps every prefab component (87 PascalCase `type` names); Maxroll keeps only the 6 gameplay-relevant ones (damageOnHit, chanceToApplyAilmentsOnHit, createAbilityObjectOnDeath, castAfterDuration, castAtRandomPointAfterDuration, damageWithBeam) on a smaller ability set (1054 vs 1228). |
| entities (minion actors) | 96 | - | LE Tools only. |
| ability skill trees (per-skill) | 136 | 136 | Identical id sets; Maxroll `skillTrees` additionally holds the 5 class trees + weaver (142 keys). |
| ability-tree nodes | 3,956 | 3,956 | Identical node-id sets in all 136 trees; node names equal after unescaping. |
| ability-tree node stats | 6,528 | 6,528 | Same count and content (property, tags, value, noScaling, downside, overrideSprite) except 1,335 stat `value` fields that are `null` in LE Tools and `""` in Maxroll. |
| ability-tree node requirements | 4,577 | 4,577 | Same count; one requirement differs: tree fl71ds node 17 requires node 16 with requirement 1 (LE Tools) vs 0 (Maxroll). Maxroll names the prerequisite field `node`, LE Tools `nodeId`. |
| class passive tree nodes | 541 | 541 | 111+108+110+109+103; identical per class apart from 91 stat `value` fields that are `null` in LE Tools and `""` in Maxroll. |
| weaver tree nodes | 80 | 80 | Identical apart from `null` vs `""` stat values (included in the 91 above). |
| node layout (UI) children, ability trees | 3,956 | (positions inline: node.transform + icon) | LE Tools separates layout (LESkillTreesUI) from logic; Maxroll embeds `transform` in each node. |
| classes | 5 | 5 | Maxroll classes[] carries stats, abilities, masteries; LE Tools has only tree headers + class-ability in LEAbilities. |
| masteries (incl. base class) | 20 | 20 | 4 per class (index 0 = base class). |
| stat properties (propertyList / properties) | 113 | 113 | Same order and same `property` ids (SP enum has 134 names; 113 have display rules). |
| player properties | 713 | 712 | Maxroll lacks the last entry (index 712). |
| ability properties | 177 | 177 | Identical abilityIDs in identical order; 2344 property rows each; 175 abilities carry rows (abilityID 0 and 803 have empty properties). |
| idol altar properties | 31 | 31 |  |
| conditional properties (damage / non-damage / Maxroll) | 48 / 48 | 48 | Maxroll merges both description forms into one record `{description, nonDamageDescription}` per index. |
| stats (display rules) | - | 184 | Maxroll only (stat sheet / alt stat definitions). |
| monster mods | 287 | - | LE Tools only (endgame). Ids 0..286 contiguous after decoding. |
| timelines | 10 | 11 | Maxroll adds timelineID 99 (empty name, 1 difficulty). |
| timeline difficulties | 20 | 21 | Maxroll has the extra from timeline 99. |
| timeline mod refs (mods[]) | 238 | - | LE Tools only. |
| woven echoes | 47 | - | LE Tools only. |
| dungeons / arenas | 3 / 2 | - / - | LE Tools only. |
| factions | 4 | - | LE Tools only. |
| quests | 36 | 145 | LE Tools checklist.questList has the 36 quests that carry a checklist; Maxroll lists 145 (ids up to 200); en.json has 148 quest names. |
| scenes | 385 | - | LE Tools itemDB.sceneList (checklist.sceneList has 30). |
| i18n keys (en.json) | 34,993 | - | Maxroll inlines resolved English instead of keys; keys survive only as `textKey`/`localizationKey`. |
| icons (Maxroll `icons` groups / names) | - | 45 groups / 1558 names | Maxroll only. |
| treeAtlas sprite hashes | - | 1,172 | Maxroll only. |
| loot filter beams / sounds | - | 9 / 16 | LE Tools loot-filters file has colors/icons instead. |

## How to read the differences

- **Identical content**: uniques, unique mods, tooltip descriptions, set bonuses, affixes (ids, tiers, stat lines), skill trees, nodes, node stats/requirements, class and Weaver tree nodes, properties, ability properties, idol altar properties, conditional properties. These can be imported once and cross-validated. Known tiny exceptions: 8 affixes with float32 noise (max abs difference 4e-8), 1,426 tree-node stat `value` fields that are `null` in LE Tools and `""` in Maxroll (1,335 + 91), and one node requirement (fl71ds node 17).
- **Maxroll has more**: base types (+3: 11, 24 which LE Tools lists as disabled to roll, and 40), sub types (+13) and implicits (+7) attached to those extra types, timelines (+1: id 99, an empty placeholder), quests (145 vs the 36 that LE Tools tracks in its checklist), player abilities (184 vs 183 list entries / 182 distinct; the id lists are not identical, see [ids.md](ids.md#3-ability-joins-the-one-id-family-that-needs-a-mapping)), stats display rules (184, Maxroll only).
- **LE Tools has more**: ailments (148 vs 128: ids 129..150 are newer boss/monster ailments; additionally Maxroll's array has two placeholder copies of Ignite at the UNUSED ids), abilities (1,228 vs 1,054: LE Tools keeps every internal ability and all 87 prefab component types, Maxroll only 6), player properties (713 vs 712), UI buffs, entities, monster mods, dungeons, arena, factions, woven echoes, vaults, monolith rewards, scenes and the complete i18n table.
- **Same data, different packaging**: LE Tools splits affixes into single/multi lists (616 + 540) and Maxroll merges them (1,156); LE Tools splits tree logic and UI layout (`LESkillTrees` / `LESkillTreesUI`, 3,956 layout children = one per node) while Maxroll keeps `transform` inline; LE Tools conditional properties are two key lists of 48, Maxroll one list of 48 records.
- **Float noise**: affix tier roll ranges are equal in 1,148 of 1,156 affixes; the other 8 differ only by float32 artefacts in LE Tools (e.g. `0.29000002` vs `0.29`).
- **Gaps in id spaces** (both sources): unique ids 0..488 with 3 absent; affix ids 0..1156 with id 1139 absent; ailment ids with 112 and 119 unused; base type ids 0..41 with 11, 24 (disabled) and 40 (unnamed) missing from LE Tools' equippable list.

## Cross-check results (1.5.2)

Summary of the LE Tools vs Maxroll value comparison, from `data/crosscheck-report.json` (individual rows are in `maxroll_crosscheck`, 31 rows in the 1.5.2 build):

| kind | compared | real mismatches | notes |
|---|---|---|---|
| uniques | 486 | 0 | 28,774 fields compared |
| ailments | 126 | 0 | 22 LE Tools-only ids (129-150) are an expected gap; Maxroll ailments carry no duration, so `ailment.duration` is skipped |
| classes | 5 | 0 | 251 fields |
| affixes | 1,156 | 1 | affix 910 `canRollOn`: LE Tools `[31]` vs Maxroll `[31,31]` (duplicate entry on the Maxroll side); 8 further rows are float32 noise and are ignored |

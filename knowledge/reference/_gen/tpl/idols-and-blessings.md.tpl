# Idols, Idol Altars and Blessings
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Labels: **A** asset data (vendored), **G** in-game guide, **X** Maxroll/community 2026, **U** unverified/stale.

## Summary
- Idols are grid-placed equipment (base types 25-33) with exactly 1 prefix + 1 suffix, no implicits, no crafting. 8 shapes: 1x1, 2x1, 1x2, 3x1, 1x3, 4x1, 1x4, 2x2 (G, A).
- 1x1, 2x1, 1x2 idols are universal; 3x1, 1x3, 4x1, 1x4, 2x2 idols are class-specific (except unique idols) (X). Larger idols give more of each stat; many stats are size-restricted (G).
- Idol grid: 5x5 with the four corners and the centre blocked (20 usable cells) in the default layout; up to 20 idol slots are unlocked through quests and first dungeon completions (G, X, A). Slot unlock numbers 1-8 (`MaxIdolSlotUnlockRewards = 8`) mark which quest/dungeon reward opens each cell (A).
- Idol Altars (base 41, 13 subtypes) go in a slot above the grid, replace the grid layout and add purple Refracted Slots whose bonuses depend on the altar's affixes. They drop from Omen Windows (G, X, A).
- Unique idols follow unique rules except they cannot have Legendary Potential; since S5 only one of each unique idol can be equipped (X).
- Blessings: 224 blessing subtypes = 112 normal + 112 "Grand" (empowered) variants over 10 Timelines. Permanent, global bonuses chosen after clearing a Timeline boss (3 options normal, 4 empowered, 5 at 200 Corruption) (A, G).
- Blessing roll ranges are generated from `blessings.json` below (112 pairs); 100 of the 224 are item drop-rate blessings.

## Idol base types and sizes

`AEM` = `affixEffectModifier`; idol affix ranges are stored for a standard AEM and rescaled per size by the formula in `item-system.md` (A). All idols have `maximumAffixes` 2.

{{gen:idols.idol_bases}}

Subtype families (A `items.json`; class names in brackets come from `classRequirement`; "cannotDrop" flags subtypes outside the normal drop pool - Weaver idols still come from Tombs/Cemeteries per X):

{{gen:idols.idol_subtypes}}

- Heretical idols are class-specific subtypes in sizes 3x1, 1x3, 4x1, 1x4, 2x2 flagged `cannotDrop` in the data; the altar properties `HereticalIdolLimit` (index 6) and the "per Equipped Heretical Idol" properties refer to them. Their acquisition is not described in any source (U).
- Omen idols: Grand (3x1) and Large (1x3) "Omen" subtypes, one per class, drop from Omens in Omen Windows with affixes otherwise reserved for larger class idols; `affixEffectiveness` = `OmenIdol` (AEM override 0 for them); default limit 1 equipped, raised by altar property `MaximumOmenIdols` (index 0) (X, A).
- Weaver idols (Small/Minor/Humble/Stout Weaver Idol) are non-class idols that drop in Tombs and Cemeteries of the Erased, have stronger `IdolWeaver` affixes, cannot be enchanted (X, A). The Weaver Idol limit is an altar property (index 5).
- Idol enchanting: finish a Tomb or Cemetery, use the altar to enchant a class-specific idol (3x1 and larger); adds an `IdolEnchantment` suffix (49 affixes, 7 tiers) and Weaver's Touch; Memory Amber rerolls it; kills have a small chance to consume 1 Weaver's Touch to upgrade the enchant tier or add a second enchant (max 2 enchanted affixes, 7 tiers each) (X, A).
- `globals.globalIdolRerollChance` = 0.1 in `items.json` (A; use not documented).

## Idol affixes (A)

472 idol affixes exist (`idols.json idolAffixIds` = `affixes.json` entries with `rollsOn` = Idols).

{{gen:idols.idol_affix_totals}}

How many idol affixes can roll on each size (A):

{{gen:idols.idol_affix_counts}}

Idol affixes have one tier row (tier forced to T1 on idols unless `IdolEnchantment`) (A, `07e_save_format.md` 3.4). Idols always drop with 1 prefix and 1 suffix and cannot be altered by crafting (G).

## Idol altars

13 altar subtypes, `maxAffixes` 4 (up to 2 prefixes + 2 suffixes) plus one guaranteed corrupted affix (X, A). Level requirements and implicit values below are from `items.json`; refracted/usable cell counts come from the grids.

{{gen:idols.altars}}

Grid layouts. Orientation: `07a_assets_core_data.md` 8.1 states the inner JSON list is a column and the client transposes (verified against a screenshot), while `idols.json gridLegend` says `[row][col]`; the transposed (screen) orientation is shown here, which makes the Pyramidal Altar a pyramid with its apex on top (consistent with the S5 fix "pyramid altar ... top left corner" in X).

{{gen:idols.altar_grids}}

Altar affixes (20 affixes with `canRollOn` containing 41; tier 1 to top tier T8) (A). Properties are indices into `idolAltarProperties[31]`:

{{gen:idols.altar_affixes}}

Rules and numbers (X):
- Altars drop from Omen Window encounters, higher Omen Window tiers have higher chance of rare altars; Circle of Fortune rank 5 prophecy rewards give rare altars, rank 10 upgrades them to exalted.
- Refracted Slot examples: +(2-12) Health per idol in a Refracted Slot; +(6-33) Ward Decay Threshold per idol in a Refracted Slot; 10-50% increased effect of prefixes, suffixes or Weaver enchant affixes for idols in Refracted Slots (X, matches A affix ranges).
- Season 5: altars drop with far fewer affixes before 150 Corruption and with none below level 50; altar drop chance is 40% from area level 32-49 and 80% from 50-79 (previously 100%); Omen Windows can start at area level 18 (X patch notes).
- 9 of 13 altar bases have special implicits (Auric 2% more damage to bosses per unique/legendary idol; Carcinised +64-256 Armor per refracted idol; Impervious +15-35 Ward Decay Threshold per corrupted idol; Spire +7-24 Mana per refracted idol; Visage +6-10 Health per Omen idol; Prophesied +10-40% effect of suffixes in refracted slots; Pyramidal 10% cooldown recovery if no larger idols above smaller ones; Jagged/Impervious/Pyramidal allow 2 Weaver idols; Ocular 2 Adorned idols) (X).

## Blessings

### Rules
- Blessings are permanent increases to stats or chance to find item types, apply everywhere in the game, and are shown in the inventory Blessings tab (G).
- Each Timeline has its own boss and its own blessing table (X); a character has one blessing slot per Timeline (10 slots) (X).
- On conquering a Timeline you are offered 3 blessings; re-conquering the same Timeline lets you keep the current blessing or replace it. Empowered Timelines offer 4 options, a 5th at 200 Corruption (G). The boss can be re-killed for a new set of offers if rolls are poor (X).
- Empowered ("Grand") blessings are separate subtypes with higher roll ranges than their normal versions (A, G): e.g. "Cruelty of Formosus" (id 14, Wand drop rate +30% to +45%) vs "Grand Cruelty of Formosus" (id 127, +50% to +90%) (A).
- Respec: Chronomancer Nyx (End of Time) swaps to any discovered blessing for gold, granting the highest roll you have seen of it; only blessings that were offered count. Other characters sharing the stash see discovered blessings at the minimum roll until they roll better, and must kill the boss first (X, `maxroll_respec-guide.md`).
- Unlock chain: clearing a Timeline unlocks the next; three Timelines at level 90 need 5 Knowledge of Orobyss; empowered Timelines unlock after clearing one level-90 Timeline and its Harbinger (see `endgame-systems.md`).
- Pool semantics: each Timeline lists three disjoint pools in the data (`firstSlotBlessings`, `otherSlotBlessings`, `anySlotBlessings`). Timelines with a first-slot pool (3, 5, 6, 7, 9, 10) have exactly 3 first-slot blessings (defensive or utility stat such as resistance, health, dodge) and 6-10 other-slot blessings; Timelines 2, 4 and 8 use only the "any" pool (all drop-rate blessings); Timeline 1 has 7 "other" + 3 "any" (drop-rate and experience). That 1 offered option is drawn from the first-slot pool and 2 from the others is a plausible reading but is not stated in any source (U).
- Property values: `IncreasedDropRate` blessings (100 subtypes) target an item type via `dropRateItemType` (e.g. WAND, IDOL_3x1) or a `specialTag` category (specialTag 3 etc., semantics undocumented: `07a_assets_core_data.md` section 10 item 4); roll value is a fraction (0.30 = +30%).

### Summary by Timeline

{{gen:idols.blessing_summary}}

### Blessing roll ranges by Timeline

Columns: id = `blessingId`; Pool = which of the three offer pools the normal blessing is in; Stat = `implicits[0]` property, `[tags]`, and `(item type)` for drop rates; inc/add/more is the mod type; ranges are `[value, maxValue]` (fractions for percentages; Health/Mana etc. are flat numbers). All blessings have a single implicit.

{{gen:idols.blessing_tables}}

## Pitfalls
- Blessing display names equal the internal names; "Grand X" is the empowered variant of "X" and is in `grandVariantId` / `normalVariantId`.
- Roll ranges differ per blessing; the Maxroll "blue circle" shows where the roll falls in this range.
- `cannotDrop` = 1 is set on 35 normal and 79 Grand blessing records (A) with no pattern that matches the obtainable set (Grand versions are obtainable in empowered runs per G); the flag is carried in the tables below and should not be used to filter blessings (U).
- Altar grid `99` = blocked; values 100+ = refracted slot on top of an unlock number (value - 100 is the unlock number).
- Idol AEM values (-0.83 ... 0) are negative: do not treat small idols as having equal affix ranges to large ones.
- Do not assume an idol of the right size is wearable: class-specific sizes need the matching class; universal ones are only 1x1/2x1/1x2 (X).
- The altar property list contains "per Equipped Heretical Idol" entries even though no heretical idol acquisition path is documented (U).

## Sources
- `vendor/lastepochbuilder/research/data/game/items.json`, `idols.json`, `affixes.json`, `blessings.json`, `global_player_properties.json` - idol bases, grids, affixes, blessings, altar properties (A).
- `vendor/lastepochbuilder/research/07a_assets_core_data.md` (8.1, 8.2, 10) - grid orientation, blessing schema, unresolved items (A).
- `vendor/corpus/ingame_guide_1.5.0.txt` - idols, altars, blessings rules (G).
- `vendor/corpus/maxroll_idols-guide.md`, `maxroll_idol-altars.md`, `maxroll_gear-walkthrough.md`, `maxroll_respec-guide.md`, `maxroll_season5_patch_notes_maxroll.md`, `maxroll_monolith_empowered-guide.md` - classes of idols, altar details, respec, S5 changes (X).
- `vendor/corpus/wiki_idols.md` - structure only (U, stale 2024).

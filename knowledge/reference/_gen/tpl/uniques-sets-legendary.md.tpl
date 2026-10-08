# Uniques, Sets and Legendary Items
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Labels: **A** asset data (vendored), **G** in-game guide, **X** Maxroll/community 2026, **U** unverified/stale.

## Summary
- `uniques.json` holds 489 uniques: 471 with Legendary Potential (LP), 18 with Weaver's Will (WW), 61 set items in 24 sets, 25 Primordial, 23 "cocooned" placeholders, 2 pre-corrupted (A).
- A unique has fixed mods; each mod has a roll range `[value, maxValue]` driven by one of 8 roll bytes (`rollID`). Special effects live in `tooltipDescriptions` text and in code, not in `mods[]` (A).
- Legendary item = unique + 1-4 affixes taken from an exalted item with exactly 4 unsealed affixes, made in the Eternity Cache at the end of Temporal Sanctum; the unique's LP (1-4) is the number of affixes taken; Tier 2+ runs let you guarantee one chosen affix, the rest are random (G, X).
- Weaver's Will uniques (WW 5-28) level up while worn and killing enemies: each upgrade adds a T1 affix or raises a tier (max T7, up to 2 prefixes + 2 suffixes); WW 28 = four T7 affixes. LP and WW are mutually exclusive (G, X).
- Primordial items: only one may be equipped; Primordial uniques (25) are bought with Primal Hunt materials; Primordial exalted items hold a sealed T8 affix (G, X, A).
- Sets: 2-4 pieces (24 sets), cannot become legendaries; set items can be shattered into set affix shards (Reforged Set items) that count for set bonuses (G, X).
- Corrupted items cannot be used to create legendaries (G).

## Unique structure (`uniques.json`)

Key fields (A): `uniqueID`, `name`/`displayName`, `baseType`, `subTypes[]`, `levelRequirement` (override, null = from subtype), `isSetItem`/`setID`, `isPrimordialItem`, `isCocoonedItem`, `legendaryType` (`LegendaryPotential` | `WeaversWill`), `canDropAsLegendary`, `canDropRandomly`, `hideFromPlayers`, `overrideEffectiveLevelForLegendaryPotential`/`effectiveLevelForLegendaryPotential`, `dropsSpecificLegendaryAffixes`/`droppableLegendaryAffixes[]`/`droppableLegendaryAffixCount`, `additionalRandomLegendaryAffixes`, `isPreCorrupted`/`preCorruptPositiveChance`/`validPreCorrupts[]`, `primordialCosts{}`, `mods[]`, `tooltipDescriptions[]`, `loreText`.

Mod value model (A `uniques.json valueModel`, code-derived): if `canRoll` and `maxValue > value` and the item's roll byte for `rollID` is non-zero, the value is quantised over `[value, maxValue]` on the stat's rounding grid exactly like affixes but with no AEM scaling; otherwise the fixed `value` applies. Mods sharing a `rollID` roll together (up to 8 distinct roll bytes per unique, `MaxUniqueRolls = 8`) (A).

Example, Isadora's Revenge (uniqueID 5, helmet, set item):

{{gen:uniques.unique_mod_example}}

Unique-data metrics (A):

{{gen:uniques.mod_stats}}

- `tooltipDescriptions[].description` carries the player-visible text with `[min,max,rollID]` placeholders; entries with `setRequirement` > 0 are set-bonus lines; `altText` is the Alt-key explanation of a mechanic. The text is not machine-readable mechanics. Non-stat effects of uniques/sets are extracted separately in `vendor/lastepochbuilder/research/data/game/unique_effects.json` and described in `07d_minions_uniques.md` / `07i_unique_formulas.md`; they are outside this page (A).
- Unique idols cannot have Legendary Potential and, since Season 5, a character may equip at most one of each unique idol (including legendary idols) (X).
- Uniques cannot be modified by crafting; endgame rerolls: Farsight Turtle and Gauntlet of Strife Woven Echoes (X).

### Number of uniques per base type

{{gen:uniques.uniques_per_base}}

Flag uniques (A):

{{gen:uniques.special_flag_uniques}}

`unifiedType` 1 and 2 mark the three variants each of Scales of Eterra and Pearls of the Swine (meaning inferred, U). `hideFromPlayers` entries are non-obtainable (Sharktooth Saw, Heirloom of Light, Egg of the Forgotten stub).

## Legendary Potential (LP) and forging legendaries
- LP is a unique-only stat 0-4 (stored in 5 bits shared with WW; WW occupies 5-28) (A). The unique "must have at least 1 LP (up to 4), and the exalted item must have exactly 4 unsealed affixes. The exalted item can have a sealed affix, it just cannot be added" (G).
- LP at drop depends mainly on the zone level; corruption increases it slightly; item rarity, character level and other modifiers have no effect (G). High-power or well-scaling uniques rarely drop with LP; weak/leveling uniques more often with several (G). Every unique has an effective level for LP (higher level = lower chance) (X); the data field (`effectiveLevelForLegendaryPotential`) is overridden for some uniques (A):

{{gen:uniques.lp_effective_levels}}

  The value 200 (29 uniques) is not explained in any source; treat as "unavailable/never" (U). Season 5: Taste of Blood effective LP level is now 30 (from 40) (X).
- LP sources: world drops in high area levels; boss uniques; Circle of Fortune rank 8 doubles LP chance of dropped uniques; Prophecies for the item type; Weaver tree imprints; Nemesis "Egg of the Forgotten" can add LP or a legendary affix to your unique that has none (Egg chance 0% below level 60, 20% at 60, up to 60% at 100; two Empowers); Farsight Turtle Woven Echo can gamble extra LP on a unique with >= 1 LP (failure removes all LP) (X).
- Forging process at the Eternity Cache (Temporal Sanctum dungeon; Key from drops/Timeline bosses): start in the Divine Era, open the Cache, insert unique + exalted, press Seal Cache, Temporal Shift to the Ruined Era, open the Cache again to take the legendary. Once per dungeon run (X, `maxroll_legendary-items-crafting-guide.md`).
- Exalted component rules (X): same base type as the unique (e.g. any one-handed axe for a one-handed axe unique); exactly 4 unsealed affixes; tiers/types irrelevant ("one Tier 6 and three Tier 1" works); Forging Potential irrelevant (0 FP fine); a sealed affix is not transferred; a class-specific affix makes the legendary class-specific; Primordial (T8), Set and Champion affixes cannot be selected.
- Selection: number transferred = LP (1-4). At Temporal Sanctum Tier 2 or higher you may pick one affix to guarantee; the remaining LP-1 are random with equal probability from the other affixes (G, X). Roll ranges of the unique's own mods do not reroll; legendary affixes can be T1-T7 (X).
- Result: legendary keeps unique mods/rolls and cannot be crafted afterwards; LP is not stored on legendaries (X, A). Rune of Creation on the exalted before forging yields a spare copy (needs FP > 0) (X).
- `droppableLegendaryAffixes` / `dropsSpecificLegendaryAffixes` (A): the variant uniques drop with specific extra affixes from a fixed pool instead of from an exalted item (Exulis 2 from 5 affixes + 1 random; Unsated Rage 1 of 27; Withstand the Elements 2 of 8; Frostborn Solitude 1 of 3).
- Pre-corrupted: Exulis (`preCorruptPositiveChance` 0 = always negative outcome) and Oculus of Ruin (chance 1 = positive) (A); Vision of the Observer drops Exulis (10%) as a Corrupted Legendary with 1 random affix and 2 corrupted attribute-conversion affixes, and Oculus of Ruin 100% (X).

## Weaver's Will (WW) uniques
- WW range 5-28 = the total number of affix tiers the unique can gain when it becomes legendary (G, X). Higher area level / corruption raise the chance of high WW (G, X; farm at area level 100 per X).
- Stat gain occurs while the item is equipped, on slaying enemies and gaining experience; first gain adds a T1 affix, later gains add a new affix (max 4: 2 prefixes + 2 suffixes) or upgrade an existing one, weighted towards upgrading; each gain costs 1 WW; max tier T7; with 28 WW the result is four T7 affixes (G); one X example item shows 14 total legendary tiers (X).
- Rune of Weaving (and Weaver's Touch on idols) spends a random amount of remaining WW at once without wearing (G).
- Affix choice is biased to rare affixes on most slots, strongly on relics, not on boots (X). Weaver tree node Prime Weaver (3 pts): WW on found uniques rolls twice and keeps the higher (A/X). Weaver set bonus (2 pieces): legendary affixes on equipped WW weapons have 50% increased effect (A set 20; S5 bug fix: only WW items) (X).
- WW uniques are world drops (except Clotho's Needle, Scissor of Atropos, Blight of Lachesis, Inheritance of the Erased, which drop from Fateweaver/Firstborn bosses in Woven Echoes) and never drop with LP (X, A `canDropRandomly`).

{{gen:uniques.ww_uniques}}

## Primordial items
- Equip limit: one Primordial item at a time (G). 25 Primordial uniques: 22 sold by Skarven Bloodhorn (Garden, Chapter 10 and Mysterious Rifts) for Primordial Materials; 3 only from Rift Beasts (Carrion of Creation, Blossom of Immortal Stone, Permanence of Primal Knowledge); Rift Beasts can drop all (X, `maxroll_primordial-items.md`, `maxroll_boss-loot-table-cheat-sheet.md`). Purchased ones roll LP at purchase. Primordial uniques can become legendaries but Primordial affixes cannot be chosen as legendary affixes (X).
- Costs (A `primordialCosts`; vendor costs in Primordial Materials):

{{gen:uniques.primordial}}

- Primordial exalted: Rune of Evolution (FP cost max 15 as of S5, was 25) turns a random T7 affix into a T8 and seals it in a second sealed slot; T8 is 50-100% stronger than T7; up to 6 affixes total; Champion T7 affixes cannot be evolved but Bloodline Glade drops Primordial champion affixes (G, X).
- Imprinting a Primordial unique only ever returns Rift Beast drops; imprinting a Primordial exalted counts its T8 as a T7 (X).

## Cocooned items
23 `isCocoonedItem` uniques exist in the data, one per weapon/armor/jewelry type, each with no mods. They back the "Find the Cocooned Item by slaying enemies until it drops" echo objective (X `maxroll_monolith_beginner-guide.md`, A):

{{gen:uniques.cocooned}}

## Fractured uniques
No source in the corpus or the vendored data describes "fractured uniques" (the word "Fractured" appears only for Fractured Enemies in Omen Windows and the Fractured Prison zone). Treat as nonexistent in 1.5 unless a source appears (gap).

## Set items and set bonuses

Set bonuses: `bonuses[]` in `sets.json` hold stat grants with `setRequirement` (pieces needed) and text in `tooltipDescriptions` (A). Sets typically have 2 to 4 pieces (G); the data holds 24 sets (13 three-piece, 11 two-piece) and 61 set items:

{{gen:uniques.sets}}

Rules:
- Set items cannot be crafted and cannot become legendaries (G, X).
- A Woven Echo (The Great Bridge) shatters a copy of a set item into Set Item Shards; the shard (e.g. "Fragments of the Shattered Lance Reforged") carries some of the original affixes plus the set bonus and can be crafted onto normal/magic/rare/exalted items of the same type as the source set item, creating a Reforged Set item that counts toward set bonuses. Set affixes cannot be used for legendaries (G, X; A affixes with `specialAffixType` Set = 61).
- Farming: MG buys set items from rank 2 (X, pre-S5 text; S5 lets MG buy all item types on joining); CoF rank 4 makes any set item drop as the full set; Rune of Ascendance can create sets (not exclusive boss drops); some pieces are boss-only (Shard/Fragments of the Shattered Lance) (X, G).
- Season 5: 16 new uniques and 2 set items were added; Sinathia's Dying Breath Reforged flat curse damage and Weaver set bonus bugs were fixed (X).
- Rune of Ascendance: converts a Common/Magic/Rare item (with FP) to a unique or set item of the same item type; cannot create exclusive drops (G).

## Omens, imprints and unique targeting
- Imprints (Weaver tree, X): nodes Commoner's Riches (41), Sealed Riches (42), Echoing Riches (43), Warlord's Riches (44), Woven Riches (45), Loomed Riches (46) place an item or Woven Echo in a slot to bias drops. Imprinted uniques have increased chance to drop as the same unique with LP counted (a legendary affix counts like 1 LP); corrupted items cannot be imprinted; sealed affixes are removed; FP above 40-50 recommended (X, A tree data). Season 5: imprinted items drop about 20% more from enemies/echo rewards and 40% more from Lost Caches (X).
- Omen Idols and Omens: see `idols-and-blessings.md`. Omen of Thunder is an Arena of Champions unique (Alfrig Wolfmaw) (X).
- Season 5 unique rebalances: Truesight Glass +1 to all skills; Merophage +1-2 all skills; Undisputed +33-55 melee physical; Leviathan Carver +80-120 physical melee damage; Hakar's Phoenix 6 s companion revive cooldown; Taste of Blood LP effective level 30; many description-only clarifications (X, full list in the patch notes).

## Pitfalls
- LP and WW are different `legendaryType` values stored in the same 5 bits; test `legendaryType` before reading the number (A).
- `canDropAsLegendary` is true only for 4 uniques; most legendaries are made by crafting, not dropping (A).
- A unique "mod" with `hideInTooltip` = 1 is shown only via `tooltipDescriptions`; do not double count.
- `effectiveLevelForLegendaryPotential` 200 has no documented meaning (U).
- Unique idols still follow the 1-per-unique rule; Primordial items follow the 1-equipped rule across both uniques and exalted.
- Set pieces from the set table with a different `setID` can share a base type; reforged items must be the same item type as the shattered set piece (X).
- Weaver's Will items are not boss-farmable except the three Fateweaver weapons and Inheritance of the Erased (X).

## Sources
- `vendor/lastepochbuilder/research/data/game/uniques.json`, `sets.json`, `affixes.json`, `items.json`, `trees.json` - all unique, set, primordial, WW data (A).
- `vendor/lastepochbuilder/research/07a_assets_core_data.md` (7.2, 7.3), `07e_save_format.md` (3.2) - value model, LP/WW storage (A).
- `C:\Users\Genesis\AppData\Local\Temp\claude\D--src-last-epoch-assistant\2a02c54d-b8b3-416e-bc0a-3ef48c1c23fd\scratchpad\corpus\ingame_guide_1.5.0.txt` - rarity, LP, WW, sets, primordial, ascendance (G).
- `C:\Users\Genesis\AppData\Local\Temp\claude\D--src-last-epoch-assistant\2a02c54d-b8b3-416e-bc0a-3ef48c1c23fd\scratchpad\corpus\maxroll_legendary-items-crafting-guide.md`, `maxroll_weavers-will-uniques.md`, `maxroll_primordial-items.md`, `maxroll_set-items-crafting.md`, `maxroll_imprints-and-endgame-crafting.md`, `maxroll_nemesis-system-overview.md`, `maxroll_boss-loot-table-cheat-sheet.md`, `maxroll_season5_patch_notes_maxroll.md` - forging rules, WW, T8, set shards, imprints, Nemesis, boss loot, S5 (X).

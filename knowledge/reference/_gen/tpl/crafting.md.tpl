# Crafting
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Labels: **A** asset data (vendored), **G** in-game guide, **X** Maxroll/community 2026, **U** unverified/stale.

## Summary
- All crafting happens in the Forge (key F, usable anywhere) on items that have Forging Potential (FP) left. Inputs: affix **shards**, **runes** (item-wide effects) and **glyphs** (support items that modify a shard/rune craft) (G).
- A shard adds a tier-1 affix to an open slot or raises an affix by one tier; crafting caps at tier 5 (tiers 6-7 only drop; tier 8 comes from Rune of Evolution) (G).
- Each craft spends FP (random amount in a range scaled by the tier / rune); a Critical Success or a Glyph of Hope proc makes it free (G, X).
- 12 runes are documented (Shattering, Refinement, Removal, Discovery, Shaping, Ascendance, Creation, Havoc, Redemption, Weaving, Evolution, Corruption); 5 glyphs (Hope, Chaos, Order, Despair, Envy) (G). `items.json` has 13 modifier and 6 support crafting subtypes; names are not in the vendored data (A).
- Legendary crafting (Eternity Cache) is in `uniques-sets-legendary.md`; dungeon, Nemesis, Woven-Echo and Rage of Morditas crafting inputs are summarised below.
- Season 5: Rune of Evolution maximum FP cost 25 -> 15; corruption roll limits for low-level items; new Ice and Blood Forging Potential from Rage of Morditas (X patch notes, G).

## Forge flow and materials
1. Open Forge (F), drop the item into the centre slot (Shift + right-click or drag) (X).
2. Choose a shard (affix slot "+" or the upgrade arrow next to an affix below tier 5), optionally a rune or glyph; craft button lights when valid (X).
3. Items picked up go to inventory; right-click or the Transfer Materials button moves shards/runes/glyphs into the Forge storage (unlimited); shards from shattering go straight to Material Storage (G, X).
4. A craft needs at least 1 shard of the target affix (+1 more per tier upgrade) (X).

## Forging Potential (FP)
- FP exists on normal, magic, rare and exalted equipment; uniques, sets and legendaries cannot be crafted (G, wiki U). At 0 FP the item cannot be altered in the Forge but is still usable (G).
- FP is consumed by every shard or rune craft by a random amount inside a range; the range depends on the tier of the affix being added/upgraded (or the rune), and glyphs can modify cost (G). Example: upgrading tier 3 to tier 4 costs between 1 and 18 FP; a Critical Success or Glyph of Hope proc costs 0 (X).
- FP on drop depends on the area level, the rarity (exalted > rare > magic > common) and a random roll in that range (X). A fresh drop is not a fixed amount.
- Stored value is clamped to 63 in saves, and the type is encoded in 2 bits: 0 default, 1 Blood, 2 Ice (A, `07e_save_format.md` section 3.2). Idols have Weaver's Touch in that byte instead (A).
- **Ice Forging Potential** (Frozen Ritual, Rage of Morditas): higher chance to be preserved when it would be consumed; `iceForgingPotentialPreservationChance` = 0.3 (A, G, X).
- **Blood Forging Potential** (Bloody Ritual): raises Critical Success chance; `bloodForgingPotentialExtraCriticalSuccessChance` = 0.3 (A, G, X). Only Rage of Morditas rewards have either type (X).
- Legacy "instability" (U/A): save version 0 stored an `instability` byte used to derive FP `((u%9)-4+base)*(60-instability)/60` clamped 0..63 (A code-derived, historical). Wiki/Maxroll describe Glyph of Envy as "destabilizing" an item; this is the pre-1.5 behaviour (U). There is no live "crafting instability" stat in 1.5 sources.

## Shards
- Shards are the affix material; the shard subtype id equals the affix id (508 shard subtypes in data) (A).
- Sources: drops from enemies/chests (some affixes drop only at higher area levels), Rune of Shattering (random number per affix, between 1 and the affix tier), Rune of Removal (removes a random affix and returns shards equal to its tier), Shrine of Shards (G, X).
- Champion affixes cannot be obtained as shards via Shattering/Removal (G). Set item shards come from the Great Bridge Woven Echo (X). Experimental affixes are crafted only via the Rune Prison Complex Thaumaturgy Device (max tier 5) (X).
- **Critical Success** (G, X): on adding/upgrading an affix there is a chance the craft is free (no FP, no shards) and a random affix below T5 is upgraded one tier in addition; it cannot raise an affix above T5; you cannot choose which affix. Tips (X): use Glyph of Chaos before other upgrades; upgrade low tiers first (crit on a high-tier affix saves more); a crit can only hit existing affixes.

## Runes (12 documented)

| Rune | Effect | FP / other rules | Label |
|---|---|---|---|
| Shattering | Destroys the item; makes shards from its affixes, random count 1 to the affix tier each | no FP requirement (wiki U); auto-stores shards | G |
| Refinement | Rerolls every affix value within its tier, each independently | uses FP (wiki U) | G |
| Removal | Removes a random affix, returns shards = its tier | uses FP; use with Glyph of Hope to stretch FP | G, X |
| Discovery | Adds random tier-1 affixes to all empty affix slots, higher chance of rare affixes | costs no FP but needs FP > 0 | G |
| Shaping | Rerolls all implicits | uses FP (wiki U) | G |
| Ascendance | Turns the item (needs >= 1 FP) into a unique or set item of the same item type (random, not boss-exclusive); drops all base properties | | G, X |
| Creation | Duplicates the item; sets FP of original and copy to 0 | needs FP | G |
| Havoc | Shuffles tiers of the 4 non-sealed affixes of an exalted item (needs 4 non-sealed affixes, >= 1 exalted) | | G |
| Redemption | Randomly changes the exalted affixes into other affixes; keeps tier and roll | | G |
| Weaving | Spends a random amount of remaining Weaver's Will/Touch immediately | for WW uniques and enchanted idols | G |
| Evolution | Upgrades a random T7 affix to T8 and seals it in a second sealed slot | max FP cost 15 (S5, was 25); sold by Skarven Bloodhorn | G, X |
| Corruption | Corrupts the item unpredictably; removes FP, LP, WW, Weaver's Touch | from Omen Windows; Timeglass Fragments at the Oracle | G, X |

Sources and prices (X): Shattering is sold by shop NPCs for 2000 gold; Removal drops only; Discovery is the best campaign upgrade (fills T1 affixes; higher tiers unlock as you level); Corruption and Corrupted crates via Timeglass Fragments from Apophis the Oracle.

## Glyphs (5 documented)

| Glyph | Effect | Label |
|---|---|---|
| Hope | 25% chance the craft costs no FP; always use it when upgrading | G, X |
| Chaos | When upgrading an affix, replaces it with a different affix of the same prefix/suffix type after the tier upgrade; do it early in a craft | G, X |
| Order | Keeps the roll position (e.g. a high roll stays high) when upgrading | G |
| Despair | Chance to seal an affix instead of upgrading it; the sealed affix moves to its own slot (one sealed affix per item) and its old slot opens; chance higher on lower tiers, exalted items, more affixes; T1 100%, T2 69% in the X imprint guide; caps at T4 | G, X |
| Envy | Changes the item's subtype to a different one with the same class requirement when adding/upgrading an affix | G |

Conflict: Maxroll's archived Glyph of Envy page (1.1, `maxroll_glyph-of-envy.md`) and the wiki describe it as destabilising the item and granting Monolith Stability; the 1.5.0 guide (G) describes the subtype-changing behaviour, which the 2026 imprint guide uses ("upgrade the item into your desired sub-type (Glyph of Envy)"). Use G.

Stale/legacy (U): wiki lists Rune of Research (seals an experimental affix, grants Glyph of Insight) and Glyph of Insight (converts an affix to experimental); Maxroll's Exiled Mages changelog removed both and replaced them with the Thaumaturgy Device crafting.

## Sealed affixes in crafting
- Regular seal: Glyph of Despair; one per item; sealed affix cannot be modified; item can still be crafted otherwise (G). Nemesis and Champions are the only way to get a sealed T5-T7 (X).
- Primordial seal: Rune of Evolution; separate slot, so exalted primordial items can have 4 normal + regular seal + primordial seal = 6 affixes (X).
- Sealed affixes do not count for Havoc, and cannot be transferred to legendaries (G).

## Endgame crafting patterns (X, `maxroll_imprints-and-endgame-crafting.md`)
Double Tier 7 items are the endgame standard. Imprints (Weaver tree) duplicate and bias drops: imprint an item with two T7s, a third affix and an open slot, then craft the final copy.
1. Imprint base: use Havoc until the two wanted-side affixes are T7; create an open slot by sealing an unwanted T1 (100%) or T2 (69%) affix with Glyph of Despair, or removing a T3+ with Rune of Removal; imprint.
2. Final item: craft one wanted affix into the open slot, seal the unwanted T1, craft the second wanted affix, then Havoc until both T7 land on the wanted affixes.
3. For legendary/unique feeds finish with Rune of Refinement and keep FP for Rune of Creation; for equipped exalted items use Glyph of Envy (subtype), Rune of Shaping (implicit), Refinement (affix rolls).
4. Three layouts: two wanted prefixes, two wanted suffixes, or one prefix + one suffix.
Imprint types and what triggers them (X): Echoing Riches (echo rewards), Sealed Riches (Lost Caches), Commoner's Riches (kills in regular echoes), Warlord's Riches (Champions; items of the same type with a sealed affix matching one on the imprint), Woven/Loomed Riches (spawn the imprinted Woven Echo). Sources of double-T7 bases: natural drops, Nemesis (CoF rank rewards improve the chance; Conquered Tower echo), Prophecies, Bazaar.

## Dungeon and encounter crafting inputs (X unless noted)
| Source | Crafting-relevant mechanic |
|---|---|
| Temporal Sanctum (key; boss Chronomancer Julra) | Eternity Cache: unique with LP + exalted (4 unsealed affixes) -> legendary; Tier 2+ allows 1 guaranteed affix; once per run (see `uniques-sets-legendary.md`) |
| Soulfire Bastion (key; boss Fire Lich Cremorus) | Souls from kills buy items at the Soul Gambler; door modifiers change the gambler's items (target belts, boots, gloves) |
| Lightless Arbor (key; boss The Mountain Beneath) | Vaults of Uncertain Fate: spend gold on modifiers that raise vault rewards (many exalted items); cost grows per modifier; modifiers limited |
| Nemesis (random encounter) | Rewards 4 items (rare/exalted/unique, a unique for level 50+); Empower (up to 2x) upgrades affixes up to T7, adds FP, adds sealed affixes up to T7; uniques gain LP or become legendary; Egg of the Forgotten slot accepts your own unique with no LP/WW |
| Vengeful / Avenged weapons | Nemesis weapon bases that upgrade to "Avenged" stats when a Harbinger is killed with them equipped (CoF rank 6/10 Harbinger's Spoils also) |
| Woven Echoes | Rune Prison Complex: Thaumaturgy Device (replace a prefix on a 2-prefix item with an experimental affix); The Great Bridge: shatter set items; Gauntlet of Strife: reroll uniques (needs a copy with same/higher LP); Farsight Turtle: gamble LP (failure = LP 0); Bloodline Glade: Primordial champion affixes; Rampant Coast: extra Rift Beast evolution; Defiled Fortress: Voidborne Nemesis and better exalt chance |
| Tombs/Cemeteries of the Erased | Idol enchanting altar, Weaver idols |
| Rage of Morditas (Blood-Filled Crystal) | Frozen Ritual: same item type, similar affixes, Ice FP; Bloody Ritual: excludes that type, Blood FP; only source of Ice/Blood FP and 18 exclusive subtypes (see `endgame-systems.md`) |
| Omen Windows | Runes of Corruption, corrupted items, Idol Altars, Omen Idols, Timeglass Fragments |
| Champions | Always drop an item with a sealed Champion affix (14 kinds) |
| Exiled Mages | Item with an experimental affix (gloves/boots/belt) |

## Season 5 crafting-related changes (X patch notes)
- Rune of Evolution: maximum FP cost 25 -> 15.
- Pre-corrupted items: below area level 80 no T7, below 50 no T6. Rune of Corruption on items with level requirement below 55 cannot roll T7; below 35 cannot roll T6. Several corrupted affixes get minimum item levels (list in `item-system.md`).
- Ring/amulet "ward per second and ward decay threshold" affix: T1 2-3 per second (from 6-7), T2 4-5 (8-9), T3 6-9 (10-11), T4 10-14 (12-14).
- Azure (increased mana) affix cannot roll on Sentinel-specific items; Sentinel gets a hybrid increased mana + mana regen affix.
- Idol Altars: fewer affixes before 150 Corruption (none below level 50).
- Imprints: imprinted items drop ~20% more from enemies/echo rewards, ~40% more from Lost Caches, and keep high-tier affixes much more often.
- New Weaver tree nodes: Ubiquity of Rage, Seekers of Ice and Blood, Portents of Blood.
- Corruption outcome fix: positive outcomes give the best rolls, negative the worst; "lower is better" stats fixed.
- Bazaar: filters by number of T6/T7 affixes (ignoring sealed), sealed/non-sealed affix groups.
- CoF Prophecy reward ranks include runes/glyphs: rank 1 Shattering, Discovery, Hope, Chaos; rank 2 Removal, Order; rank 3 Shaping, Refinement; rank 8 Weaving; rank 10 Despair, Envy; rank 11 Redemption, Havoc, Ascendance, Creation (see `endgame-systems.md`).

## Pitfalls
- Do not plan on crafting T6/T7: use Havoc/Redemption on exalted bases or drops. T8 only via Evolution on an existing T7.
- Glyph of Chaos and a Critical Success interact: a crit that lands a T5 on the target blocks Chaos from changing it (X).
- Corrupting is permanent; craft first (G). Corrupted items can only be shattered.
- Rune of Havoc needs 4 non-sealed affixes; sealed ones are excluded (G).
- Rune of Creation zeroes FP on both copies - do all crafting first, keep FP reserved for it (X).
- Experimental/Champion/Set affixes are not craftable by normal shards (see special affix types in `item-system.md`).
- Do not rely on stale wiki content for rune/glyph lists (it contains removed items).

## Sources
- `vendor/lastepochbuilder/research/data/game/items.json` (globals, nonEquippable counts), `affixes.json` (shard ids, special affixes) (A).
- `vendor/lastepochbuilder/research/07e_save_format.md` (FP storage, legacy instability) (A, code-derived).
- `C:\Users\Genesis\AppData\Local\Temp\claude\D--src-last-epoch-assistant\2a02c54d-b8b3-416e-bc0a-3ef48c1c23fd\scratchpad\corpus\ingame_guide_1.5.0.txt` - shards, runes, glyphs, FP, Rage of Morditas (G).
- `C:\Users\Genesis\AppData\Local\Temp\claude\D--src-last-epoch-assistant\2a02c54d-b8b3-416e-bc0a-3ef48c1c23fd\scratchpad\corpus\maxroll_beginner-crafting-guide.md`, `maxroll_imprints-and-endgame-crafting.md`, `maxroll_legendary-items-crafting-guide.md`, `maxroll_nemesis-system-overview.md`, `maxroll_exiled-mages.md`, `maxroll_dungeons_dungeon-guide.md`, `maxroll_primordial-items.md`, `maxroll_set-items-crafting.md`, `maxroll_getting-started_powering-up.md`, `maxroll_season5_patch_notes_maxroll.md`, `maxroll_item-corruption.md`, `maxroll_glyph-of-envy.md` - crafting rules, patterns, S5 changes (X).
- `C:\Users\Genesis\AppData\Local\Temp\claude\D--src-last-epoch-assistant\2a02c54d-b8b3-416e-bc0a-3ef48c1c23fd\scratchpad\corpus\wiki_crafting.md`, `wiki_runes.md`, `wiki_glyphs.md` - legacy items only (U, 2024).

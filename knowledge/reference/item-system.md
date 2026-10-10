# Item System
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Labels: **A** asset data (vendored), **G** in-game guide, **X** Maxroll/community 2026, **U** unverified/stale.

## Summary
- Equipment has a base type (`baseTypeID` 0-41 = 42 enum ids; `items.json` has 41 records, id 34 Blessing is stored in `blessings.json`), a subtype (`subTypeID`, 699 subtypes in total) that fixes implicits and level requirement, and up to 4 explicit affixes (2 prefixes + 2 suffixes). Idols have 2 affixes (1 prefix + 1 suffix) (A, G).
- Affix tiers: 1-7 in the guide (G); data holds 8 tier rows for 684 equipment affixes where T8 is the Primordial tier (A, X). Crafting reaches T5 only; T6/T7 must drop; T8 comes from Rune of Evolution (G).
- Affix value scaling by item base: `m = (1+itemAEM)/(1+standardAffixEffectModifier) - 1`; value range = tier range x (1+m), then rounded on the stat's rounding grid; roll byte 0-255 selects the point inside the range (A).
- Rarity: Common (0 affixes), Magic (1-2), Rare (3-4), Unique, Set, Exalted (any T6+ affix), Legendary (G). Exalted is derived from affix tiers, not stored as a rarity (A).
- A fifth "sealed" slot holds one sealed affix (Glyph of Despair); a Primordial T8 affix has its own sealed slot, so Primordial exalted items can hold 6 affixes (G, X).
- Special affix kinds (`specialAffixType`): Standard, Experimental, Personal, Set, IdolEnchantment, IdolWeaver, Corrupted, FakeUniqueMod (A).
- Item factions Circle of Fortune (CoF) and Merchant's Guild (MG) tag items with a rank requirement and a required faction; MG-traded items become MG-bound (G, A).
- 1.5 adds Rage of Morditas item subtypes and Ice/Blood Forging Potential, and tightens corruption roll limits (X patch notes).

## Base types

Slot column is X/G (gear walkthrough: 11 traditional slots - Weapon, Off-hand, Helmet, Body Armor, Belt, Gloves, Boots, Relic, Amulet, 2 Rings - plus Idols and Blessings). `classAffinity` lists classes that can use the base (inferred; empty = unrestricted). Ids 34 (Blessing) has no `items.json` record (blessings are in `blessings.json`); ids 35-39 are obsolete lens bases; 40 is unused. `disabledBaseTypesToRoll` = [24 Crossbow, 11 One-Handed Fist] (A): these exist as ids but never roll.

| baseTypeID | Enum | Name | Slot | Max affixes | affixEffectModifier (AEM) | Inventory grid WxH | classAffinity | Subtypes | Max subtype level req | minimumDropLevel |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | HELMET | Helmet | Helmet | 4 | 0 | 2x2 | - | 73 | 86 | 0 |
| 1 | BODY_ARMOR | Body Armor | Body Armor | 4 | 0.5 | 2x3 | - | 73 | 87 | 0 |
| 2 | BELT | Belt | Belt | 4 | 0 | 2x1 | - | 16 | 80 | 0 |
| 3 | BOOTS | Boots | Boots | 4 | 0 | 2x2 | - | 16 | 85 | 0 |
| 4 | GLOVES | Gloves | Gloves | 4 | 0 | 2x2 | - | 16 | 91 | 0 |
| 5 | ONE_HANDED_AXE | One-Handed Axe | Weapon (1H; off-hand if dual-wield) | 4 | 0.75 | 2x3 | Primalist,Sentinel,Acolyte | 18 | 81 | 0 |
| 6 | ONE_HANDED_DAGGER | Dagger | Weapon (1H; off-hand if dual-wield) | 4 | 0.75 | 1x2 | Mage,Acolyte,Rogue | 16 | 81 | 0 |
| 7 | ONE_HANDED_MACES | One-Handed Mace | Weapon (1H; off-hand if dual-wield) | 4 | 0.75 | 1x3 | Primalist,Sentinel,Rogue | 16 | 81 | 0 |
| 8 | ONE_HANDED_SCEPTRE | Sceptre | Weapon (1H; off-hand if dual-wield) | 4 | 0.75 | 1x3 | - | 15 | 81 | 0 |
| 9 | ONE_HANDED_SWORD | One-Handed Sword | Weapon (1H; off-hand if dual-wield) | 4 | 0.75 | 1x3 | - | 17 | 81 | 0 |
| 10 | WAND | Wand | Weapon (1H; off-hand if dual-wield) | 4 | 0.75 | 1x3 | Primalist,Mage,Sentinel,Acolyte | 16 | 81 | 0 |
| 11 | ONE_HANDED_FIST | Fist | Weapon (1H) - disabled | 4 | 0.75 | 2x2 | - | 0 |  | 0 |
| 12 | TWO_HANDED_AXE | Two-Handed Axe | Weapon (2H) | 4 | 2.2 | 2x4 | Primalist,Sentinel,Acolyte | 19 | 83 | 0 |
| 13 | TWO_HANDED_MACE | Two-Handed Mace | Weapon (2H) | 4 | 2.2 | 2x4 | Primalist,Sentinel | 15 | 81 | 0 |
| 14 | TWO_HANDED_SPEAR | Two-Handed Spear | Weapon (2H) | 4 | 2.2 | 2x4 | Primalist,Sentinel,Rogue | 20 | 82 | 0 |
| 15 | TWO_HANDED_STAFF | Two-Handed Staff | Weapon (2H) | 4 | 2.2 | 1x4 | - | 20 | 85 | 0 |
| 16 | TWO_HANDED_SWORD | Two-Handed Sword | Weapon (2H) | 4 | 2.2 | 2x4 | - | 17 | 81 | 0 |
| 17 | QUIVER | Quiver | Off-hand | 4 | 0 | 2x3 | Rogue | 12 | 81 | 0 |
| 18 | SHIELD | Shield | Off-hand | 4 | 0.17 | 2x3 | - | 23 | 81 | 0 |
| 19 | CATALYST | Off-Hand Catalyst | Off-hand | 4 | 0.17 | 2x2 | Mage,Acolyte | 22 | 81 | 5 |
| 20 | AMULET | Amulet | Amulet | 4 | 0.17 | 1x1 | - | 19 | 80 | 0 |
| 21 | RING | Ring | Ring (x2) | 4 | 0 | 1x1 | - | 16 | 66 | 0 |
| 22 | RELIC | Relic | Relic | 4 | 0 | 2x2 | - | 73 | 80 | 0 |
| 23 | BOW | Bow | Weapon (bow) | 4 | 0.75 | 2x3 | Rogue | 17 | 81 | 0 |
| 24 | CROSSBOW | Crossbow | Weapon - disabled | 4 | 0.6 | 2x3 | - | 0 |  | 0 |
| 25 | IDOL_1x1_ETERRA | Small Idol | Idol grid | 2 | -0.83 | 1x1 | - | 3 | 0 | 11 |
| 26 | IDOL_1x1_LAGON | Minor Idol | Idol grid | 2 | -0.83 | 1x1 | - | 2 | 0 | 11 |
| 27 | IDOL_2x1 | Humble Idol | Idol grid | 2 | -0.62 | 2x1 | - | 2 | 0 | 11 |
| 28 | IDOL_1x2 | Stout Idol | Idol grid | 2 | -0.62 | 1x2 | - | 2 | 0 | 11 |
| 29 | IDOL_3x1 | Grand Idol | Idol grid | 2 | -0.33 | 3x1 | - | 16 | 0 | 25 |
| 30 | IDOL_1x3 | Large Idol | Idol grid | 2 | -0.33 | 1x3 | - | 15 | 0 | 25 |
| 31 | IDOL_4x1 | Ornate Idol | Idol grid | 2 | 0 | 4x1 | - | 10 | 0 | 30 |
| 32 | IDOL_1x4 | Huge Idol | Idol grid | 2 | 0 | 1x4 | - | 10 | 0 | 30 |
| 33 | IDOL_2x2 | Adorned Idol | Idol grid | 2 | -0.05 | 2x2 | - | 13 | 0 | 20 |
| 34 | BLESSING | (no record: id 34 = BLESSING) | Blessing (not equipment) |  |  |  |  |  |  |  |
| 35 | GREATER_LENS | Greater Lens | obsolete lens | 0 | 0 | 2x2 | - | 11 | 0 | 0 |
| 36 | ARCTUS_LENS | Arctus Lens | obsolete lens | 0 | 0 | 2x2 | - | 5 | 0 | 0 |
| 37 | MESEMBRIA_LENS | Mesembria Lens | obsolete lens | 0 | 0 | 2x2 | - | 3 | 0 | 0 |
| 38 | EOS_LENS | Eos Lens | obsolete lens | 0 | 0 | 2x2 | - | 15 | 0 | 0 |
| 39 | DYSIS_LENS | Dysis Lens | obsolete lens | 0 | 0 | 2x2 | - | 13 | 0 | 0 |
| 40 | UNUSED |  | unused | 0 | 0 | 0x0 | - | 1 | 0 | 0 |
| 41 | IDOL_ALTAR | Idol Altar | Idol Altar (above idol grid) | 4 | 0 | 2x2 | - | 13 | 79 | 20 |

<sub>Generated by `gen_items.cjs` (table `base_types`) from items.json (data[], equipmentTypeEnum, disabledBaseTypesToRoll); slot column = X/G (gear walkthrough); 42 rows.</sub>

Non-equippable base types (`items.json nonEquippable`, ids >= 101) (A):

Non-equippable base types, id name (subtype count): 101 Affix Shard (508); 102 Crafting Modifier Item (13); 103 Crafting Support Item (6); 104 Key Items (25); 105 Lost Memory (0); 106 Resonance (2); 107 Woven Echo (50); 108 Bags (32); 109 Lens (12).

<sub>Generated by `gen_items.cjs` (table `nonequip`) from items.json (nonEquippable, globals); 9 rows.</sub>

`globals` (A): `iceForgingPotentialPreservationChance` 0.3, `bloodForgingPotentialExtraCriticalSuccessChance` 0.3, `globalIdolRerollChance` 0.1, `omenIdolAffixEffectModifier` 0.

### Subtypes and implicits
- A subtype is the concrete item (e.g. base Boots, subtype "Hide Boots"). It fixes `levelRequirement`, `classRequirement`, and the `implicits[]` list (A).
- Implicits are inherent stats; each subtype always has the same implicits but values roll inside `[value, maxValue]` (G, A). Example: Hide Boots implicit 1 = Armour +5 (fixed) and implicit 2 = Movespeed +5% to +7% increased (A).
- All implicit and affix stats are global, i.e. identical in effect to the same stat on a passive node (G).
- Rune of Shaping rerolls all implicits; Glyph of Envy changes the subtype within the same class requirement (G).
- Weapon subtypes carry `attackRate` (A), which multiplies base attack speed:

| baseTypeID | Weapon base | Subtypes with attackRate | min attackRate | max attackRate |
|---|---|---|---|---|
| 5 | One-Handed Axe | 18 | 0.92 | 1.09 |
| 6 | Dagger | 16 | 1.1 | 1.18 |
| 7 | One-Handed Mace | 16 | 0.94 | 0.98 |
| 8 | Sceptre | 15 | 0.94 | 0.98 |
| 9 | One-Handed Sword | 17 | 1.08 | 1.24 |
| 10 | Wand | 16 | 1.02 | 1.02 |
| 12 | Two-Handed Axe | 19 | 0.89 | 1.02 |
| 13 | Two-Handed Mace | 15 | 0.86 | 0.9 |
| 14 | Two-Handed Spear | 20 | 0.94 | 1.02 |
| 15 | Two-Handed Staff | 20 | 0.92 | 0.98 |
| 16 | Two-Handed Sword | 17 | 0.76 | 1.1 |
| 23 | Bow | 17 | 0.9 | 1.1 |

<sub>Generated by `gen_items.cjs` (table `weapon_attack_rate`) from items.json (subItems[].attackRate); 12 rows.</sub>

Subtype flag counts (A):

Subtype counts over all base types (incl. idols/lenses): total 699, cannotDrop 245, isCorruptedSubtype 12, isLegacySubType 0, obsoleteItem 0, classLocked 261, OmenIdol 10.

<sub>Generated by `gen_items.cjs` (table `subtype_flags`) from items.json (subItems flags); 7 rows.</sub>

Corrupted-only subtypes (`isCorruptedSubtype` = 1) have implicits with one benefit and one drawback (A; matches X `maxroll_item-corruption.md`):

| baseTypeID | Base | subTypeID | Subtype | Level req | Class | Implicits (A=added I=increased M=more; value..max) |
|---|---|---|---|---|---|---|
| 2 | Belt | 13 | Singularity Belt | 0 | - | PotionSlots A 1; PlayerProperty A 1 |
| 2 | Belt | 14 | Corruption Binding | 0 | - | PotionSlots A 8; PotionHealth I -0.37..-0.31 |
| 20 | Amulet | 16 | Deadstar Amulet | 0 | - | DamageTaken[DoT] M -0.2..-0.24; Damage[DoT] I 0.42..0.6; Armour I -0.6..-0.42 |
| 20 | Amulet | 17 | Cursed Coin Amulet | 0 | - | LightningResistance A 0.51..0.83; LevelOfSkills A 1; DamageTaken I 0.04..0.05 |
| 21 | Ring | 14 | Corrupted Insignia | 0 | - | AbilityProperty A 0.13..0.19; PlayerProperty A 3..4; PlayerProperty A 0.06..0.07 |
| 21 | Ring | 15 | Opal Eye Ring | 0 | - | IncreasedCooldownRecoverySpeed A 0.06..0.1; AllAttributes A 6..7; Movespeed I -0.07..-0.06 |
| 22 | Relic | 64 | Timeglass Chalice | 0 | - | Mana A 23..31; ManaRegen I 0.23..0.31; HealthRegen I -0.47..-0.31 |
| 22 | Relic | 65 | Doom Gourd | 0 | Primalist | Damage[Void,Melee,Minion] A 11..17; Damage[Void,Spell,Minion] A 11..17; PhysicalResistance[Minion] A -0.23..-0.17 |
| 22 | Relic | 66 | Aberrant Eye | 0 | Mage | WardRegen A 7..13; PlayerProperty A 0.11..0.13; Health I -0.09..-0.07 |
| 22 | Relic | 67 | Apocalypse Code | 0 | Sentinel | Penetration[Physical] A 0.13..0.17; Penetration[Void] A 0.13..0.17; Health I -0.07..-0.05 |
| 22 | Relic | 68 | Prophetic Homonculus | 0 | Acolyte | NecroticResistance A 0.61..0.77; VoidResistance A 0.61..0.77; Armour I -0.47..-0.37 |
| 22 | Relic | 69 | Bottled Time | 0 | Rogue | Movespeed I 0.06..0.12; IncreasedCooldownRecoverySpeed I 0.06..0.12; DamageTaken[DoT] I 0.12..0.24 |

<sub>Generated by `gen_items.cjs` (table `corrupted_subtypes`) from items.json (subItems[].isCorruptedSubtype = 1); 12 rows.</sub>

## Rarity

| Rarity | Rule | Source |
|---|---|---|
| Common (white) | no affixes | G |
| Magic (blue) | 1 or 2 affixes | G |
| Rare (yellow) | 3 or 4 affixes (max 2 prefixes + 2 suffixes) | G |
| Exalted (purple) | magic/rare item with at least one tier 6 or 7 affix; otherwise crafts like magic/rare | G; A: `isExaltedItem` = any affix with tier >= 6 |
| Unique (orange) | fixed mods and effects, not craftable; may carry Legendary Potential (LP) or Weaver's Will (WW) | G |
| Set (green) | unique-like, 2-4 pieces with set bonuses | G |
| Legendary (red) | composite of a unique and exalted affixes (Eternity Cache) or a Weaver's Will unique that has leveled | G |

Serialised rarity byte (A, code-derived from `07e_save_format.md` section 3.2): 0 normal, 1-2 magic, 3-6 rare, 7 unique, 8 set, 9 legendary; the reader recomputes normal/magic/rare as `clamp(affixCount - regularSealed - hasPrimordial - corruptionSealed, 0, 4)`. Legendary Potential is stored in 5 bits (LP 0-4, WW 5-28) and not stored on legendaries.

## Affix slots, tiers, sealed affixes
- Prefix/suffix limits: up to 2 prefixes and 2 suffixes (G); `maximumAffixes` = 4 on all gear bases, 2 on idols (A). Idol altars: 4 plus one guaranteed corrupted affix (X, `maxroll_idol-altars.md`).
- Tiers: "Affixes have 7 tiers, with tier 1 being the lowest and tier 7 being the highest... only tier 1 through 5 can be created through crafting. Tier 6 and 7 must be on the item when it drops" (G). The lowest roll of a tier is always above the highest roll of the tier below, e.g. Added Health (G, A):

| Affix | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 (Primordial) |
|---|---|---|---|---|---|---|---|---|
| Added Health (25) | 5-15 | 16-25 | 26-40 | 41-60 | 61-90 | 100-130 | 131-180 | 275-325 |
| Void Penetration (0) | 0.04-0.04 | 0.05-0.05 | 0.06-0.06 | 0.07-0.07 | 0.08-0.09 | 0.11-0.12 | 0.13-0.15 | 0.24-0.3 |

<sub>Generated by `gen_items.cjs` (table `tier_example`) from affixes.json (affixId 25 Added Health, affixId 0 Void Penetration); 2 rows.</sub>

- Tier row counts in `affixes.json`: 684 affixes have 8 tier rows (T1-T8), 49 have 7 (idol enchantments), 423 have 1 (idol standard/weaver/corrupted-idol and similar single-tier affixes) (A). T8 is the Primordial tier: 50-100% more effective than T7 (X, `maxroll_primordial-items.md`).
- T7 affixes only drop in area level 90+ (X, `maxroll_legendary-items-crafting-guide.md`). Season 5: below area level 80 precorrupted items cannot roll T7, below 50 cannot roll T6; Rune of Corruption on items with level requirement below 55 cannot roll T7, below 35 cannot roll T6 (X patch notes).
- Rune of Refinement rerolls values within the tier; Glyph of Order keeps the roll position when upgrading (G).
- Sealed affix: a state on the item (regular seal bit, primordial T8 seal, corruption seal), not an affix property (A). Only one regular sealed affix per item (G). Glyph of Despair seals chance is higher at lower tier, more affixes and exalted items; it caps at T4 (G, X). Nemesis and Champions are the only ways to get a sealed T5-T7 affix (X).
- Exalted Primordial item: T8 sealed in its own slot; with the regular sealed slot an item can hold up to 6 affixes (X).
- Sealed affixes do not transfer to a legendary and are excluded from Rune of Havoc (G).

Stash macros (G): `T6+`, `2T7`, `prefixes1`, `Sealed`, `Experimental`, `Personal` count affix tiers and affix types.

## Affix effectiveness (`affixEffectModifier`) and value formula

Each base type has an `affixEffectModifier` (AEM); each affix has a `standardAffixEffectModifier` (std) - the AEM the stored tier ranges were authored for (A, `07a_assets_core_data.md` section 0.3 and 6):

```
m  = (itemAEM == std) ? 0 : (1 + itemAEM) / (1 + std) - 1     // AffixList+Affix.getModifier
lo = min * (1 + m);  hi = max * (1 + m);  s = scale(rounding)  // Hundredth x100, Integer x1, Tenth x10, Thousandth x1000
a  = RoundHalfEven(lo * s);  b = RoundHalfEven(hi * s)
v  = min(floor((b - a + 1) * roll / 255 + a), b) / s           // roll = byte 0..255
```
INCREASED stats always round to Hundredth; ADDED uses `roundingForAdded`; MORE uses per-specialTag overrides (A). For Omen Idol subtypes the item AEM is `omenIdolAffixEffectModifier` (0). The game computes in float32 (use `Math.fround`) (A).

Distribution of AEM values (A):

| AEM value | Affixes with standardAffixEffectModifier = value | Base types with affixEffectModifier = value |
|---|---|---|
| -0.83 | 42 | Small Idol, Minor Idol |
| -0.62 | 42 | Humble Idol, Stout Idol |
| -0.33 | 37 | Grand Idol, Large Idol |
| -0.05 | 11 | Adorned Idol |
| 0 | 821 | Helmet, Belt, Boots, Gloves, Quiver, Ring, Relic, Ornate Idol, Huge Idol, Idol Altar |
| 0.17 | 48 | Shield, Off-Hand Catalyst, Amulet |
| 0.5 | 82 | Body Armor |
| 0.6 | 0 | Crossbow |
| 0.75 | 59 | One-Handed Axe, Dagger, One-Handed Mace, Sceptre, One-Handed Sword, Wand, Fist, Bow |
| 2.2 | 14 | Two-Handed Axe, Two-Handed Mace, Two-Handed Spear, Two-Handed Staff, Two-Handed Sword |

<sub>Generated by `gen_items.cjs` (table `aem`) from affixes.json (standardAffixEffectModifier), items.json (affixEffectModifier); 10 rows.</sub>

Worked vectors computed from the data (A; Added Melee Physical Damage has std 0.75, so a 2H axe with AEM 2.2 scales by 3.2/1.75 - 1 = 0.8286):

| Affix | Tier range (base) | standardAffixEffectModifier | Item base | m | Effective [lo, hi] after rounding | Value at roll byte 0 | Value at roll byte 255 |
|---|---|---|---|---|---|---|---|
| Added Health (affixId 25) | T5 [61, 90] | 0 | Helmet (AEM 0) | 0 | 61 - 90 | 61 | 90 |
| Added Health (affixId 25) | T5 [61, 90] | 0 | Body Armor (AEM 0.5) | 0.5 | 92 - 135 | 92 | 135 |
| Added Melee Physical Damage (affixId 63) | T8 [85, 100] | 0.75 | Two-Handed Axe (AEM 2.2) | 0.8286 | 155 - 183 | 155 | 183 |
| Added Melee Physical Damage (affixId 63) | T8 [85, 100] | 0.75 | One-Handed Axe (AEM 0.75) | 0 | 85 - 100 | 85 | 100 |

<sub>Generated by `gen_items.cjs` (table `aem_vectors`) from computed with formula from affixes.json valueModel (A); affix tiers from affixes.json; 4 rows.</sub>

## Level requirements
- Subtype `levelRequirement`: 0 up to 91 (max per base type is in the base table above) (A). Rage of Morditas subtypes are level 50 (X).
- Affix `levelRequirement`: 0 for 744 affixes, otherwise 4 to 80 (A); semantics (area/item level gate for rolling) inferred (U).
- Idols: `minimumDropLevel` 11/11/11/11 (small to stout), 25 (grand/large), 30 (ornate/huge), 20 (adorned), altars 20 (A).
- Corrupted affixes that cannot appear on pre-corrupted items below an item level (X patch notes): all-attributes-per-7-corrupted-items 40; Health Regen/Strength 30; Bow Damage 45; Spell Damage per Movement Speed 36; Cast Speed + Ward on spell 36 (gloves 43); Throwing Damage + Armor Shred 42; Mana + Ward on potion 48; Armor + Reflect 45; Health + Ward per second 50; Intelligence + Ward per second 43.
- Forging Potential at drop depends on area level, rarity and a random roll (X).

## Special affix types (`specialAffixType`)

Enum ids (A via `07e_save_format.md` section 3.4): 0 Standard, 1 Experimental, 2 Personal, 3 Set, 4 IdolEnchantment, 5 IdolWeaver, 6 Corrupted, 7 FakeUniqueMod. Prefix/suffix comes from `type` (0 prefix, 1 suffix, 2 special) (A).

| specialAffixType | rollsOn | Prefix | Suffix | Total | tiers[] length | levelRequirement range |
|---|---|---|---|---|---|---|
| Standard | Equipment | 387 | 74 | 461 | 8 | 0-80 |
| Standard | Idols | 200 | 109 | 309 | 1 | 0-0 |
| Corrupted | Equipment | 89 | 0 | 89 | 8 | 0-75 |
| IdolWeaver | Idols | 36 | 30 | 66 | 1 | 0-0 |
| Set | Equipment | 54 | 7 | 61 | 8 | 0-0 |
| IdolEnchantment | Idols | 0 | 49 | 49 | 7 | 0-0 |
| Corrupted | Idols | 45 | 0 | 45 | 1 | 0-0 |
| FakeUniqueMod | Equipment | 35 | 0 | 35 | 8 | 0-0 |
| Personal | Equipment | 23 | 3 | 26 | 8 | 0-0 |
| Experimental | Equipment | 12 | 0 | 12 | 8 | 0-0 |
| FakeUniqueMod | Idols | 3 | 0 | 3 | 1 | 0-0 |
| **Total** |  | 884 | 272 | 1156 |  |  |

<sub>Generated by `gen_items.cjs` (table `affix_composition`) from affixes.json; 12 rows.</sub>

Meaning of each kind:
- **Standard**: normal craftable/droppable affixes. 461 on equipment (387 prefix, 74 suffix) (A).
- **Experimental** (12): prefixes on gloves, boots, belts only; found on items from Exiled Mages (can be exalted only at high area level) or crafted with the Thaumaturgy Device in the Rune Prison Complex Woven Echo (max tier 5) (G, X, A):

| affixId | Name | Type | canRollOn | Tiers | levelRequirement |
|---|---|---|---|---|---|
| 673 | Experimental Ward on Kill | PREFIX | GLOVES | 8 | 0 |
| 674 | Experimental Dodge Rating and Endurance Threshold | PREFIX | GLOVES | 8 | 0 |
| 675 | Experimental Ward per Missing Health | PREFIX | GLOVES | 8 | 0 |
| 676 | Experimental Haste Effect | PREFIX | BOOTS | 8 | 0 |
| 677 | Experimental Frenzy Effect | PREFIX | BOOTS | 8 | 0 |
| 678 | Experimental Ward Gained on Traversal | PREFIX | BOOTS | 8 | 0 |
| 679 | Experimental Minions Transported with Traversal Skills  | PREFIX | BOOTS | 8 | 0 |
| 710 | Experimental Armor applies to Damage over Time | PREFIX | GLOVES | 8 | 0 |
| 711 | Experimental Ward on Potion Use | PREFIX | BELT | 8 | 0 |
| 712 | Experimental Mana on Potion Use | PREFIX | BELT | 8 | 0 |
| 713 | Experimental Traversal Cooldown Recovery on Potion Use | PREFIX | BELT | 8 | 0 |
| 714 | Experimental Bee on Potion Use | PREFIX | BELT | 8 | 0 |

<sub>Generated by `gen_items.cjs` (table `experimental`) from affixes.json (specialAffixType = Experimental); 12 rows.</sub>

- **Personal** (26): 14 of these are the Champion sealed affixes (affixIds 766-779, matching the 14 Champion names in X `maxroll_champions.md`); the other 12 (table below) carry boss/story names (Julra's, Cave Druid's, ...) and their meaning is not documented (U). Champion affixes always arrive sealed, cannot be crafted or shattered into shards (G), and cannot be used for legendaries (X):

| affixId | Title | Type | canRollOn | Tiers | levelRequirement | Stat properties |
|---|---|---|---|---|---|---|
| 698 | Julra's | PREFIX | AMULET | 8 | 0 | Damage+PlayerProperty |
| 699 | of the Timelost Outcast | SUFFIX | QUIVER | 8 | 0 | DamageTaken+DamageTaken |
| 700 | Cave Druid's | PREFIX | TWO_HANDED_STAFF | 8 | 0 | LevelOfSkills+Damage |
| 701 | Avel's | SUFFIX | CATALYST | 8 | 0 | PlayerProperty |
| 702 | Solar Deserter's | PREFIX | SHIELD | 8 | 0 | Movespeed+DamageTaken |
| 703 | Bloom Tender's | PREFIX | TWO_HANDED_SPEAR | 8 | 0 | Movespeed+PoisonResistance |
| 704 | Orian's | PREFIX | TWO_HANDED_SPEAR | 8 | 0 | Damage+PlayerProperty |
| 705 | Ucenui's | PREFIX | CATALYST | 8 | 0 | Penetration+Penetration |
| 706 | Hirish's | PREFIX | BODY_ARMOR | 8 | 0 | ManaRegen+ManaBeforeHealthPercent |
| 707 | of the Last Hermit | SUFFIX | QUIVER | 8 | 0 | PotionHealth+PotionHealthConvertedToWard |
| 708 | Andinai's | PREFIX | ONE_HANDED_DAGGER | 8 | 0 | DodgeRating+PlayerProperty |
| 758 | Cursed | PREFIX | BOOTS | 8 | 0 | PlayerProperty+PlayerProperty |

<sub>Generated by `gen_items.cjs` (table `personal`) from affixes.json (specialAffixType = Personal); 12 rows.</sub>

- **Set** (61): reforged set affixes created by shattering set items at The Great Bridge Woven Echo; only on the item type of the source set item; not usable for legendaries (G, X).
- **IdolEnchantment** (49) and **IdolWeaver** (66): see `idols-and-blessings.md`.
- **Corrupted** (134 = 89 equipment + 45 idol): only from Rune of Corruption or pre-corrupted items; corrupted affixes by item (A):

Corrupted equipment affixes (distinct names, each with the item enums it can roll on; 89 affix records): Frenzy and Reduced Frenzy Effect [RELIC]; Added Health Regen and Increased Health Regen per Strength [RELIC]; Added Block Chance and Current Mana gained as Ward on Block [SHIELD]; Chance to apply Marked for Death on Block [SHIELD]; More Bow Damage per Distance [BOW,QUIVER]; Added Critical Strike Chance and Chance to cast Shurikens on Bow Crit [BOW,QUIVER]; Increased Damage over Time and Bow Bleed Chance [BOW,QUIVER]; Chance to Slow on Bow Hit, More Bow Damage to Slowed Enemies [BOW,QUIVER]; Increased Bow Attack Speed and Chance to cast Icicle on Bow Hit [BOW,QUIVER]; Added Bow Damage and Increased Bow Attack Speed on Bow Attack [BOW,QUIVER]; Increased Stun Chance and More Damage against Stunned Enemies [2H_MACE]; Increased Melee Area of Effect and Chance to Summon Forged Weapon on Melee Hit [2H_MACE,2H_AXE,2H_SPEAR,2H_SWORD]; Mana spent gained as Ward and Ward Decay Threshold [WAND,1H_SCEPTRE,2H_STAFF]; Increased Spell Area of Effect and Added Spell Mana Cost [WAND,CATALYST,2H_STAFF]; Added Spell Damage and Increased Spell Damage per Increased Movement Speed [WAND,CATALYST,2H_STAFF,1H_SCEPTRE]; Increased Cast Speed and Ward gain on direct Spell Cast [WAND,CATALYST,2H_STAFF,1H_SCEPTRE,GLOVES]; Increased Mana and Mana per Attunement [WAND,2H_STAFF,1H_SCEPTRE]; Increased Cast Speed and Increased Minion Cast Speed [WAND,2H_STAFF,1H_SCEPTRE]; Chance to Poison on Hit and More Damage against Poisoned Enemies [1H_DAGGER,2H_SPEAR,BOW]; Chance for non-critical Strikes to inflict Critical Vulnerability for 4 seconds [1H_DAGGER]; Frailty Chance and more damage per stack of Frailty [1H_MACES,2H_MACE]; Slow Chance and More Damage against Slowed Enemies [1H_MACES,2H_MACE]; Chance to inflict Bleed on Hit and More Damage against Bleeding Enemies [1H_AXE,2H_SWORD,2H_AXE,2H_SPEAR,BOW]; Seconds of Frenzy granted to you and your Minions when Enemy damage leaves you at Low Health [1H_AXE,2H_AXE]; Increased Damage over Time and Increased Area for Area Skills [1H_SWORD,1H_AXE,1H_MACES,1H_DAGGER,1H_SCEPTRE,2H_SWORD,2H_AXE,2H_MACE,2H_SPEAR,2H_STAFF]; Increased Melee Damage and Damage for Melee Attacks per 1 Mana Cost [1H_SWORD,1H_AXE,1H_MACES,1H_DAGGER,1H_SCEPTRE,2H_SWORD,2H_AXE,2H_MACE,2H_SPEAR,2H_STAFF]; Parry Chance while Dual Wielding and Parry Chance gained as Increased Melee Damage [1H_SWORD]; Added Melee Damage from Weapons gained as Added Spell Damage [1H_SWORD]; Increased Melee Attack Speed and Frenzy after using Evade [1H_SWORD,1H_AXE,1H_MACES,1H_DAGGER,1H_SCEPTRE,2H_SWORD,2H_AXE,2H_MACE,2H_SPEAR,2H_STAFF]; Added Melee Damage and Increased Melee Damage per Strength [1H_SWORD,1H_AXE,1H_MACES,1H_DAGGER,1H_SCEPTRE,2H_SWORD,2H_AXE,2H_MACE,2H_SPEAR,2H_STAFF]; Chance to Cleanse Ailments on Evade and Increased Ailment Damage Taken [BOOTS]; Increased Haste Effect and Less Damage over Time taken during Haste [BOOTS]; Evade Charge and Increased Evade cooldown Duration [BOOTS]; Increased Throwing Attack Speed and Throwing Frailty Chance [BELT,RING]; Added Throwing Damage and Throwing Armor Shred Chance [BELT,RING]; Increased Health and Missing Health regained on Potion Use [BELT]; Mana gained on Potion Use and Ward Gained on Potion Use [BELT]; Increased Movement Speed for 4 seconds after using a Potion [BELT]; Added Mana and Increased Mana Regen per Maximum Mana [1H_SCEPTRE,WAND,2H_STAFF]; Maximum Potion Slots and Missing Health gained as Ward on Potion Use [BELT]; Cannot be Slowed and Reduced Effect of Haste on you [BELT,BOOTS]; Missing Health gained as Ward per Second and Ward Decay Threshold [GLOVES]; Damage Leeched as Health and Increased Health Leech [GLOVES]; Increased Attack and Cast Speed [GLOVES]; Cannot be Chilled and Reduced Fire Resistance [GLOVES,BOOTS]; Increased Armor and Damage Reflected to Attackers per Armor Mitigation [BODY,SHIELD]; Endurance Threshold and Endurance Threshold added as Ward Decay Threshold [BODY,BELT]; Increased Mana and Current Mana Gained as Ward Per Second [BODY]; Increased Health and Ward Per Second [BODY]; All attributes with at least 7 corrupted non-idol items equipped [BODY]; Cannot be Stunned and Increased Evade Cooldown Duration [BODY]; Missing Health gained as Ward per Second and lose Current Health per Second [BODY]; Level of All Skills and Added Mana [BODY,AMULET]; Added Attunement and Increased Mana Regen [RING,RELIC,HELMET]; Added Intelligence and Ward Per Second [RING,RELIC,HELMET]; Added Dexterity and Increased Dodge Rating [RING,RELIC,HELMET]; Added Strength and Added Armor [RING,RELIC,HELMET]; Increased Health and Health Regen applies to Ward [BODY,HELMET]; Maximum Health gained as Endurance Threshold and Endurance [HELMET]; Increased Mana and Mana Spent Gained as Ward [HELMET,BELT]; Damage Dealt to Mana before Health and Added Mana [HELMET]; Physical Resistance and Void Resistance [HELMET,BODY,GLOVES,BELT,BOOTS,QUIVER,SHIELD,CATALYST,RING,RELIC]; Elemental Resistance and Necrotic Resistance [HELMET,BODY,GLOVES,BELT,BOOTS,QUIVER,SHIELD,CATALYST,RING,RELIC]; Physical Resistance and Poison Resistance [HELMET,BODY,GLOVES,BELT,BOOTS,QUIVER,SHIELD,CATALYST,RING,RELIC]; Lightning Resistance and Poison Resistance [HELMET,BODY,GLOVES,BELT,BOOTS,QUIVER,SHIELD,CATALYST,RING,RELIC]; Cold Resistance and Void Resistance [HELMET,BODY,GLOVES,BELT,BOOTS,QUIVER,SHIELD,CATALYST,RING,RELIC]; Fire Resistance and Necrotic Resistance [HELMET,BODY,GLOVES,BELT,BOOTS,QUIVER,SHIELD,CATALYST,RING,RELIC]; Increased Healing Effectiveness and Health per Attunement [RELIC]; Increased Damage over Time and Damage over Time Leeched as Health [RING,RELIC]; Added Critical Strike Multiplier and Increased Critical Strike Chance per Dexterity [RING,RELIC]; Added Critical Strike Multiplier and Added Critical Strike Multiplier against Frozen Enemies [1H_SWORD,1H_AXE,1H_MACES,1H_DAGGER,1H_SCEPTRE,WAND,2H_SWORD,2H_AXE,2H_MACE,2H_SPEAR,2H_STAFF,BOW,QUIVER,CATALYST]; Freeze Rate per Stack of Chill and Increased Chill Duration [RING]; Added Intelligence and Ward Decay Threshold per Intelligence [CATALYST]; Less Damage Taken on Block and Block Effectiveness applies to Damage over Time [SHIELD]; Cannot be Stunned by hits you Block and Reduced Block Effectivness [SHIELD]; Chance to gain Haste on Block and Haste Effect [SHIELD]; Added Block Effectiveness and Less Physical Damage Taken on Block [SHIELD]; Strength converted to Brutality [AMULET]; Intelligence converted to Madness [AMULET]; Dexterity converted to Guile [AMULET]; Attunement converted to Apathy [AMULET]; Vitality converted to Rampancy [AMULET]; Idol Altar Dodge Rating per Corrupted Idol [IDOL_ALTAR]; Idol Altar Mana per Corrupted Idol [IDOL_ALTAR]; Idol Altar Armor per Corrupted Idol [IDOL_ALTAR]; Idol Altar Ward Decay Threshold per Corrupted Idol [IDOL_ALTAR]; Idol Altar Corrupted Idol Limit [IDOL_ALTAR]; Idol Altar Heretical Idol Limit [IDOL_ALTAR].

<sub>Generated by `gen_items.cjs` (table `corrupted_affixes`) from affixes.json (specialAffixType = Corrupted); 88 rows.</sub>

- **FakeUniqueMod** (38): the pool used by variant uniques (27 for Unsated Rage, 8 for Withstand the Elements, 3 for Frostborn Solitude, matching `uniques.json droppableLegendaryAffixes`) (A).

### Class-specific affixes
`classSpecificity` lists classes that can roll the affix; `NonSpecific` appears with class names on some affixes (meaning inferred: also available without class restriction, U). If a class-specific affix is placed on a legendary, the legendary becomes class-specific (X). Smart loot biases drops of class-specific slots (helmet, body armor, relic, idols, weapons) toward the played class (not uniques/sets) (X). Standard equipment affix counts by class (A):

`classSpecificity` of Standard equipment affixes (value count): (none) 145; Rogue 76; Primalist 58; Mage 57; Acolyte 57; Sentinel 56; NonSpecific+Primalist+Acolyte 3; NonSpecific+Mage+Acolyte 2; NonSpecific+Primalist+Sentinel 2; NonSpecific+Sentinel 1; NonSpecific+Acolyte 1; NonSpecific+Mage+Acolyte+Rogue 1; NonSpecific+Sentinel+Rogue 1; Primalist+Mage 1.

<sub>Generated by `gen_items.cjs` (table `class_affixes`) from affixes.json (classSpecificity); 14 rows.</sub>

### Groups and categories (A)

| group | Affix count |
|---|---|
| PassiveDefense | 694 |
| OffensiveAbility | 146 |
| OffensiveIncrease | 132 |
| Hybrid | 59 |
| OffensiveAddition | 48 |
| DefensiveAbility | 36 |
| ActiveDefense | 33 |
| Retaliation | 8 |

`displayCategory` counts (A): CORRUPTED 128, ROGUE 75, IDOL_WEAVER 66, IDOL_ROGUE 61, SET 61, IDOL_PRIMALIST 60, PRIMALIST 58, MAGE 57, ACOLYTE 57, SENTINEL 55, IDOL_MAGE 53, IDOL_ACOLYTE 50, IDOL_ENCHANTED 49, IDOL_SENTINEL 47, IDOL_GENERAL 38, VARIANT 35, PERSONAL 26, OFF_TYPE_SPECIFIC 23, IDOL_ALTAR 20, AILMENTS 16, DEF_RESISTANCE 14, EXPERIMENTAL 12, OFF_MELEE 11, MINION 9, ATTRUBUTES 9, MANA 7, OFF_BOW 7, OFF_GEN 6, DEF_POTION 6, DEF_BLOCK 5, DEF_HEALING 5, OFF_SPELL 4, DEF_HEALTH 4, DEF_DODGE 3, DEF_LEECH 3, OFF_THROW 3, DEF_CRIT 3, DEF_WARD 3, DEF_STUN 2, REFLECT 2, COOLDOWN 1, MOVEMENT 1, DEF_PARRY 1.

<sub>Generated by `gen_items.cjs` (table `affix_groups`) from affixes.json; 51 rows.</sub>

### Tier-6 compatibility
`t6Compatibility` is `Normal` for 1147 affixes; the nine below are flagged (A). The seven resistances are `MaximumAffixEffectModifier` with `maximumAffixEffectModifierForT6` = 0 (T6 eligibility depends on the item AEM; exact rule not in sources, U); two are `Incompatible` (cannot roll T6):

| affixId | Name | Type | t6Compatibility | maximumAffixEffectModifierForT6 | canRollOn |
|---|---|---|---|---|---|
| 7 | Void Resistance | SUFFIX | MaximumAffixEffectModifier | 0 | HELMET,BODY_ARMOR,BELT,GLOVES,SHIELD,CATALYST,AMULET,RING,RELIC,BOOTS,QUIVER |
| 10 | Necrotic Resistance | SUFFIX | MaximumAffixEffectModifier | 0 | HELMET,BODY_ARMOR,BELT,BOOTS,GLOVES,SHIELD,CATALYST,AMULET,RING,RELIC,QUIVER |
| 13 | Fire Resistance | SUFFIX | MaximumAffixEffectModifier | 0 | HELMET,BODY_ARMOR,BELT,BOOTS,GLOVES,SHIELD,CATALYST,AMULET,RING,RELIC,QUIVER |
| 17 | Cold Resistance | SUFFIX | MaximumAffixEffectModifier | 0 | HELMET,BODY_ARMOR,BELT,BOOTS,GLOVES,SHIELD,CATALYST,AMULET,RING,RELIC,QUIVER |
| 19 | Poison Resistance | SUFFIX | MaximumAffixEffectModifier | 0 | HELMET,BODY_ARMOR,BELT,BOOTS,GLOVES,SHIELD,CATALYST,AMULET,RING,RELIC,QUIVER |
| 24 | Lightning Resistance | SUFFIX | MaximumAffixEffectModifier | 0 | HELMET,BODY_ARMOR,BELT,BOOTS,GLOVES,SHIELD,CATALYST,AMULET,RING,RELIC,QUIVER |
| 45 | Physical Resistance | SUFFIX | MaximumAffixEffectModifier | 0 | HELMET,BODY_ARMOR,BELT,BOOTS,GLOVES,SHIELD,RING,AMULET,RELIC,QUIVER |
| 427 | Less Bonus Damage Taken from Critical Strikes | SUFFIX | Incompatible | 0 | TWO_HANDED_AXE,TWO_HANDED_MACE,TWO_HANDED_SPEAR,TWO_HANDED_SWORD |
| 656 | Sentinel Endurance While Warpathing | PREFIX | Incompatible | 0 | BODY_ARMOR |

<sub>Generated by `gen_items.cjs` (table `t6_compat`) from affixes.json (t6Compatibility); 9 rows.</sub>

### Corrupted attributes (amulet corruption)
Amulets can gain an affix converting an attribute (`attributes.json corruptedPerPoint`, X) - per point (A):

| Converted attribute | Corrupted name | Effect per point |
|---|---|---|
| Strength | Brutality | +0.0002 More Damage for Melee attacks per 1 Mana cost (up to 20), -0.5% Health Leech (A) |
| Vitality | Rampancy | +3% increased effect of Frenzy; 0.1% more damage taken while not Frenzied (A) |
| Intelligence | Madness | +1% Spell crit multiplier; +1% bonus damage taken from crits (A) |
| Dexterity | Guile | +0.3% cooldown recovery speed for movement skills; -1% Armor (A) |
| Attunement | Apathy | +2% Mana Regen; 0.2% current health lost per direct skill use (A) |

### Item corruption outcomes (X)
Corruption is permanent and blocks further crafting (except Rune of Shattering or a Sacrificial Altar). Outcome categories: tiers/values changed, affixes added or removed, rarity changed, subtype changed, item becomes unequippable (X). Fixed bug: "positive outcomes now always give the best possible rolls and negative outcomes the worst" (X patch notes).

## Item factions (CoF / MG)
- Join in Chapter 9 (Upper District of Maj'Elka; Zerrick) - one faction at a time, switchable; progress shared stash-wide; 12 ranks each (G, X).
- Serialised item fields (A, `07e_save_format.md` 3.2 byte 8): faction rank requirement (4 bits, 0-15), `requiredFaction` bit (0 = Circle of Fortune, 1 = Merchant's Guild), `alwaysUntradeable` bit.
- CoF items are always untradable (gift only); items from Prophecies or rank rewards are CoF-bound and cannot be equipped while aligned with MG (G). Items traded through MG become untradable and MG-bound, unequippable by CoF even after switching (G).
- Gifting and Resonance do not remove restrictions; rank requirement shown red in tooltip if too low (G, X).
- Season 5 changes (X patch notes): MG members can buy/list all equippable item types from rank 0; ranks now unlock bags of materials/keys; Black Market tokens removed; price suggestion and auto-lowering added; Bazaar filters for T6/T7 counts and sealed/non-sealed affixes added. CoF: Prophecy rerolling removed; select a reward category per slot; 4 prophecy slots (rank 1/3/6/9); up to 99 charges. See `endgame-systems.md`.

## Pitfalls
- Tier numbers: the guide says 7 tiers; data has 8 rows because T8 is Primordial. Do not offer T8 as craftable.
- `maximumAffixes` 4 does not include the sealed slot(s); a sealed item can hold 5 affixes, a primordial exalted item 6 (X).
- `baseTypeID` 34 is Blessing and 35-39 are obsolete lenses; do not generate gear for them. 24 (Crossbow) and 11 (Fist) never roll.
- Exalted is not a rarity id: test `tier >= 6` on any affix.
- Value scaling uses the ratio `(1+itemAEM)/(1+std)`, not the raw item AEM (A, corrects older guides).
- Corrupted items: Forging Potential, LP, WW and Weaver's Touch are removed; they cannot make legendaries (G).
- Class affinity vs class requirement: base `classAffinity` is a weapon-type usability list (inferred), subtype `classRequirement` locks specific subtypes (261 subtypes) (A).
- Maxroll "Explicit Affixes ... max out at 5 (with one being Sealed)" refers to the 4 normal + 1 sealed slots; the Primordial seal is additional (X).

## Sources
- `vendor/lastepochbuilder/research/data/game/items.json`, `vendor/lastepochbuilder/research/data/game/affixes.json`, `vendor/lastepochbuilder/research/data/game/attributes.json` - base types, subtypes, affixes, AEM (A).
- `vendor/lastepochbuilder/research/07a_assets_core_data.md` (sections 0, 6, 7.1), `vendor/lastepochbuilder/research/07e_save_format.md` (sections 3.1-3.4) - formulas, rarity/sealed encoding, special affix ids (A, code-derived).
- `vendor/corpus/ingame_guide_1.5.0.txt` - rarity, affixes, implicits, factions (G).
- `vendor/corpus/maxroll_gear-walkthrough.md`, `vendor/corpus/maxroll_item-corruption.md`, `vendor/corpus/maxroll_exiled-mages.md`, `vendor/corpus/maxroll_champions.md`, `vendor/corpus/maxroll_primordial-items.md`, `vendor/corpus/maxroll_getting-started_item-faction-overview.md`, `vendor/corpus/maxroll_season5_patch_notes_maxroll.md` - slots, corruption, experimental/champion affixes, T8, factions, S5 changes (X).
- `knowledge/reference/_gen/gen_items.cjs`, `knowledge/reference/_gen/lib.cjs`, `knowledge/reference/_gen/build.cjs` - generators of every table marked "Generated by" on this page (run `node knowledge/reference/_gen/build.cjs`).

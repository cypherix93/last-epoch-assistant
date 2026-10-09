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

{{gen:items.base_types}}

Non-equippable base types (`items.json nonEquippable`, ids >= 101) (A):

{{gen:items.nonequip}}

`globals` (A): `iceForgingPotentialPreservationChance` 0.3, `bloodForgingPotentialExtraCriticalSuccessChance` 0.3, `globalIdolRerollChance` 0.1, `omenIdolAffixEffectModifier` 0.

### Subtypes and implicits
- A subtype is the concrete item (e.g. base Boots, subtype "Hide Boots"). It fixes `levelRequirement`, `classRequirement`, and the `implicits[]` list (A).
- Implicits are inherent stats; each subtype always has the same implicits but values roll inside `[value, maxValue]` (G, A). Example: Hide Boots implicit 1 = Armour +5 (fixed) and implicit 2 = Movespeed +5% to +7% increased (A).
- All implicit and affix stats are global, i.e. identical in effect to the same stat on a passive node (G).
- Rune of Shaping rerolls all implicits; Glyph of Envy changes the subtype within the same class requirement (G).
- Weapon subtypes carry `attackRate` (A), which multiplies base attack speed:

{{gen:items.weapon_attack_rate}}

Subtype flag counts (A):

{{gen:items.subtype_flags}}

Corrupted-only subtypes (`isCorruptedSubtype` = 1) have implicits with one benefit and one drawback (A; matches X `maxroll_item-corruption.md`):

{{gen:items.corrupted_subtypes}}

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

{{gen:items.tier_example}}

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
**Queryable form:** the database applies this formula for you. `v_affix_values` has one row per affix x base type it rolls on x tier x line with `std_aem`, `item_aem`, `scale_factor`, `stored_min/max` (the data) and `value_min/max` (in-game range on that base); `v_idol_affix_values` is the same for idol bases (25-33) plus `idol` and `idol_size`. Example: Melee Void Damage T7 is stored 51..65 and reads 93..119 on a Two-Handed Axe (x1.8286, D formula, unverified in game: U). Idol scaling examples per size: `idols-and-blessings.md#idol-affix-value-scaling-d-formula-values-unverified-in-game-u`; `docs/schema.md` section 3.4 note on affix values.
INCREASED stats always round to Hundredth; ADDED uses `roundingForAdded`; MORE uses per-specialTag overrides (A). For Omen Idol subtypes the item AEM is `omenIdolAffixEffectModifier` (0). The game computes in float32 (use `Math.fround`) (A).

Distribution of AEM values (A):

{{gen:items.aem}}

Worked vectors computed from the data (A; Added Melee Physical Damage has std 0.75, so a 2H axe with AEM 2.2 scales by 3.2/1.75 - 1 = 0.8286):

{{gen:items.aem_vectors}}

## Level requirements
- Subtype `levelRequirement`: 0 up to 91 (max per base type is in the base table above) (A). Rage of Morditas subtypes are level 50 (X).
- Affix `levelRequirement`: 0 for 744 affixes, otherwise 4 to 80 (A); semantics (area/item level gate for rolling) inferred (U).
- Idols: `minimumDropLevel` 11/11/11/11 (small to stout), 25 (grand/large), 30 (ornate/huge), 20 (adorned), altars 20 (A).
- Corrupted affixes that cannot appear on pre-corrupted items below an item level (X patch notes): all-attributes-per-7-corrupted-items 40; Health Regen/Strength 30; Bow Damage 45; Spell Damage per Movement Speed 36; Cast Speed + Ward on spell 36 (gloves 43); Throwing Damage + Armor Shred 42; Mana + Ward on potion 48; Armor + Reflect 45; Health + Ward per second 50; Intelligence + Ward per second 43.
- Forging Potential at drop depends on area level, rarity and a random roll (X).

## Special affix types (`specialAffixType`)

Enum ids (A via `07e_save_format.md` section 3.4): 0 Standard, 1 Experimental, 2 Personal, 3 Set, 4 IdolEnchantment, 5 IdolWeaver, 6 Corrupted, 7 FakeUniqueMod. Prefix/suffix comes from `type` (0 prefix, 1 suffix, 2 special) (A).

{{gen:items.affix_composition}}

Meaning of each kind:
- **Standard**: normal craftable/droppable affixes. 461 on equipment (387 prefix, 74 suffix) (A).
- **Experimental** (12): prefixes on gloves, boots, belts only; found on items from Exiled Mages (can be exalted only at high area level) or crafted with the Thaumaturgy Device in the Rune Prison Complex Woven Echo (max tier 5) (G, X, A):

{{gen:items.experimental}}

- **Personal** (26): 14 of these are the Champion sealed affixes (affixIds 766-779, matching the 14 Champion names in X `maxroll_champions.md`); the other 12 (table below) carry boss/story names (Julra's, Cave Druid's, ...) and their meaning is not documented (U). Champion affixes always arrive sealed, cannot be crafted or shattered into shards (G), and cannot be used for legendaries (X):

{{gen:items.personal}}

- **Set** (61): reforged set affixes created by shattering set items at The Great Bridge Woven Echo; only on the item type of the source set item; not usable for legendaries (G, X).
- **IdolEnchantment** (49) and **IdolWeaver** (66): see `idols-and-blessings.md`.
- **Corrupted** (134 = 89 equipment + 45 idol): only from Rune of Corruption or pre-corrupted items; corrupted affixes by item (A):

{{gen:items.corrupted_affixes}}

- **FakeUniqueMod** (38): the pool used by variant uniques (27 for Unsated Rage, 8 for Withstand the Elements, 3 for Frostborn Solitude, matching `uniques.json droppableLegendaryAffixes`) (A).

### Class-specific affixes
`classSpecificity` lists classes that can roll the affix; `NonSpecific` appears with class names on some affixes (meaning inferred: also available without class restriction, U). If a class-specific affix is placed on a legendary, the legendary becomes class-specific (X). Smart loot biases drops of class-specific slots (helmet, body armor, relic, idols, weapons) toward the played class (not uniques/sets) (X). Standard equipment affix counts by class (A):

{{gen:items.class_affixes}}

### Groups and categories (A)

{{gen:items.affix_groups}}

### Tier-6 compatibility
`t6Compatibility` is `Normal` for 1147 affixes; the nine below are flagged (A). The seven resistances are `MaximumAffixEffectModifier` with `maximumAffixEffectModifierForT6` = 0 (T6 eligibility depends on the item AEM; exact rule not in sources, U); two are `Incompatible` (cannot roll T6):

{{gen:items.t6_compat}}

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
- `vendor/lastepochbuilder/research/data/game/items.json`, `affixes.json`, `attributes.json` - base types, subtypes, affixes, AEM (A).
- `vendor/lastepochbuilder/research/07a_assets_core_data.md` (sections 0, 6, 7.1), `07e_save_format.md` (sections 3.1-3.4) - formulas, rarity/sealed encoding, special affix ids (A, code-derived).
- `vendor/corpus/ingame_guide_1.5.0.txt` - rarity, affixes, implicits, factions (G).
- `vendor/corpus/maxroll_gear-walkthrough.md`, `maxroll_item-corruption.md`, `maxroll_exiled-mages.md`, `maxroll_champions.md`, `maxroll_primordial-items.md`, `maxroll_getting-started_item-faction-overview.md`, `maxroll_season5_patch_notes_maxroll.md` - slots, corruption, experimental/champion affixes, T8, factions, S5 changes (X).

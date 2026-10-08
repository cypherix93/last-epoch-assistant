# Stat Model
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Confidence legend: **D** = recovered from decompiled client code (via vendored weksil research), **A** = read from game asset data, **G** = official in-game guide text, **X** = community-verified (Maxroll 2026 / forum tests), **U** = unverified or inferred. Each formula and constant carries a label.
> A `?` suffix (for example **D?**) means the source itself marks the reading as ambiguous.

## Summary (10 lines max, the rules an agent must never get wrong)
1. Every stat source reduces to `Stat{property (SP id), specialTag, tags (AT mask), extraTag (AbilityID), modType, value}`. **D/A**
2. `modType`: 0 ADDED, 1 INCREASED, 2 MORE, 3 QUOTIENT (stored as more `1/(1+x) − 1`). **D**
3. Value of a stat for a query = `(Σadded) × (1 + Σincreased) × Π(1 + more_i)` over the mods that match. **D/G**
4. A mod matches when `property` is equal, `specialTag` is 0 or equal, `extraTag` is equal or 0, and `tags_match(mod.tags, query tags)` (subset rule + Elemental rule). **D**
5. Defensive and resource stats (health, mana, armour, dodge rating, regen) take only untagged mods (`tags 0`, `extraTag 0`, `specialTag 0`). **D**
6. Values are fractions: 0.3 = 30% increased, 0.07 more = 7% more; exception: HealthLeech stores 10× the leech fraction (0.3 = 3%). **D/A**
7. SP98 PlayerProperty and SP58 AbilityProperty are pointers to coded effects (`tags` = list index); they are not summable damage stats and need per-effect models. **D**
8. Rolled values are quantized: `v = min(floor((b − a + 1)·roll/255 + a), b)/s` with `a, b` from `RoundHalfEven(range × (1 + m) × s)`. **D**
9. All stats from affixes are global: the same affix counts the same on any slot; a weapon's `attackRate` is a base-type field, not a stat. **G/D**
10. Sum each damage bucket separately: added and increased per tag-matched bucket, mores multiplied one by one. **D**

## Stat record

| Field | Meaning | Label |
|---|---|---|
| `property` / `propertyName` | SP id (0–133), names in `sp_enum.json` | A |
| `specialTag` | sub-selector: AilmentID (SP1, 42, 43, 115, 120, 128; SP100 = "from"), HitEventTag (SP38/39/40), ConditionalDamageProperty (SP117, 131–133), AbilityProperty index (SP58); 0 = wildcard | D/A |
| `tags` / `tagNames` | AT bitmask; for SP58 = AbilityID, SP98 = PlayerPropertyList index, SP100 = AilmentID "to", SP104/105 = EquipmentType (specialTag 0), SP123 = TrackerPropertyID, SP130 = IdolAltarPropertyID | D/A |
| `extraTag` | AbilityID: the stat applies only to that skill; 0 = all | D |
| `modType` | ADDED / INCREASED / MORE / QUOTIENT | D |
| `added` / `increased` / `more[]` | values on Stat-like records (attributes, buffs, monster mods, class levelMods) | A |
| `value` / `[min, max]` | values on affixes, implicits, uniques, sets | A |
| `rounding` | quantization grid of this mod | A/D |
| `nodeStatApplication` (per SP) | OnCast (119 SPs), Global (14), OnCastPreMutation (1) | A |

```
query(property, checkTags, special = 0, extra = 0):                                          # D
  mods = { m : m.property == property
               and (m.special == 0 or m.special == special)
               and (m.extra == extra or m.extra == 0)
               and tags_match(m.tags, checkTags) }                                          # D
  added = Σ m.added ; inc = Σ m.increased ; more = Π (1 + m_i) for every more value          # D
  value = added × (1 + inc) × more                                                           # D
query_untagged(property): only mods with tags == 0, extra == 0, special == 0                 # D
tags_match(mod, check) = (mod & check) == mod
     or (mod & Elemental and check & (Lightning|Cold|Fire) and ((check | Elemental) & mod) == mod)   # D
QUOTIENT x → more 1/(1 + x) − 1                                                              # D
StatMod.scaled(n) multiplies added, increased and every more linearly by n                   # D
```

## Tag bitmask (AT)

`stat_tag_enums.json → AT` (`dump/cs/DiffableCs/LE/AT.cs`); used for both skill tags and stat tags. **A/D**

| Bit | Value | Name | Bit | Value | Name | Label |
|---|---|---|---|---|---|---|
| — | 0 | None | 14 | 16384 | Totem | A |
| 0 | 1 | Physical | 15 | 32768 | PetResisted | A |
| 1 | 2 | Lightning | 16 | 65536 | Potion | A |
| 2 | 4 | Cold | 17 | 131072 | Buff | A |
| 3 | 8 | Fire | 18 | 262144 | Channelling | A |
| 4 | 16 | Void | 19 | 524288 | Transform | A |
| 5 | 32 | Necrotic | 20 | 1048576 | LowLife | A |
| 6 | 64 | Poison | 21 | 2097152 | HighLife | A |
| 7 | 128 | Elemental | 22 | 4194304 | FullLife | A |
| 8 | 256 | Spell | 23 | 8388608 | Hit | A |
| 9 | 512 | Melee | 24 | 16777216 | Curse | A |
| 10 | 1024 | Throwing | 25 | 33554432 | Ailment | A |
| 11 | 2048 | Bow | 26 | 67108864 | Crit_deprecated | A |
| 12 | 4096 | DoT | 27 | 134217728 | Kill_deprecated | A |
| 13 | 8192 | Minion | 28 | 268435456 | Die_deprecated | A |

- Masks used by the engine: damage types `0x7F`, ELEMENTS = Lightning\|Cold\|Fire = 14, ability types Spell\|Melee\|Throwing\|Bow = `0xF00`. **D**
- Elemental (128) on a stat matches any of Lightning\|Cold\|Fire on the ability. LowLife / HighLife / FullLife are added to the check tags from the actor's health state (≤ 35%, ≥ 65%, 100%). **D/G**
- Transform: while transformed, every Transform-tagged mod is added once more without the tag. **D**
- PetResisted marks damage minions take 60% less of; the Minion mask strip removes only Minion\|Totem (`0x6000`). **D**
- Damage-type order in arrays: Physical, Fire, Cold, Lightning, Necrotic, Void, Poison (`DamageType` 0–6); tag-bit order: Physical 1, Lightning 2, Cold 4, Fire 8, Void 16, Necrotic 32, Poison 64. **A/D**

## Property ids (SP)

| id | name | id | name | id | name | id | name | Label |
|---|---|---|---|---|---|---|---|---|
| 0 | Damage | 34 | DamageTakenAsLightning | 68 | IncreasedChanceToBeFrozen | 102 | IncreasedLeechRate | A |
| 1 | AilmentChance | 35 | DamageTakenAsNecrotic | 69 | ManaEfficiency | 103 | MoreFreezeRatePerStackOfChill | A |
| 2 | AttackSpeed | 36 | DamageTakenAsVoid | 70 | IncreasedCooldownRecoverySpeed | 104 | IncreasedDropRate | A |
| 3 | CastSpeed | 37 | DamageTakenAsPoison | 71 | ReceivedStunDuration | 105 | IncreasedExperience | A |
| 4 | CriticalChance | 38 | HealthGain | 72 | NegativePhysicalResistance | 106 | PhysicalAndVoidResistance | A |
| 5 | CriticalMultiplier | 39 | WardGain | 73 | ChillRetaliationChance | 107 | NecroticAndPoisonResistance | A |
| 6 | DamageTaken | 40 | ManaGain | 74 | SlowRetaliationChance | 108 | DamageTakenBuff | A |
| 7 | Health | 41 | AdaptiveSpellDamage | 75 | Endurance | 109 | IncreasedChanceToBeStunned | A |
| 8 | Mana | 42 | IncreasedAilmentDuration | 76 | EnduranceThreshold | 110 | DamageTakenFromNearbyEnemies | A |
| 9 | Movespeed | 43 | IncreasedAilmentEffect | 77 | NegativeArmour | 111 | BlockChanceAgainstDistantEnemies | A |
| 10 | Armour | 44 | IncreasedHealing | 78 | NegativeFireResistance | 112 | ChanceToBeCrit | A |
| 11 | DodgeRating | 45 | IncreasedStunChance | 79 | NegativeColdResistance | 113 | DamageTakenWhileMoving | A |
| 12 | StunAvoidance | 46 | AllAttributes | 80 | NegativeLightningResistance | 114 | ReducedBonusDamageTakenFromCrits | A |
| 13 | FireResistance | 47 | IncreasedPotionDropRate | 81 | NegativeVoidResistance | 115 | DamagePerStackOfAilment | A |
| 14 | ColdResistance | 48 | PotionHealth | 82 | NegativeNecroticResistance | 116 | IncreasedAreaForAreaSkills | A |
| 15 | LightningResistance | 49 | PotionSlots | 83 | NegativePoisonResistance | 117 | GlobalConditionalDamage | A |
| 16 | WardRetention | 50 | HasteOnHitChance | 84 | NegativeElementalResistance | 118 | ArmourMitigationAppliesToDamageOverTime | A |
| 17 | HealthRegen | 51 | HealthLeech | 85 | Thorns | 119 | WardDecayThreshold | A |
| 18 | ManaRegen | 52 | ElementalResistance | 86 | PercentReflect | 120 | EffectOfAilmentOnYou | A |
| 19 | Strength | 53 | BlockEffectiveness | 87 | ShockRetaliationChance | 121 | ParryChance | A |
| 20 | Vitality | 54 | None | 88 | LevelOfSkills | 122 | CircleOfFortuneLensEffect | A |
| 21 | Intelligence | 55 | IncreasedStunImmunityDuration | 89 | CritAvoidance | 123 | TrackerProperty | A |
| 22 | Dexterity | 56 | StunImmunity | 90 | PotionHealthConvertedToWard | 124 | UnimportanceModifier | A |
| 23 | Attunement | 57 | ManaDrain | 91 | WardOnPotionUse | 125 | FreezeImmunity | A |
| 24 | ManaBeforeHealthPercent | 58 | AbilityProperty | 92 | WardRegen | 126 | ChanceToCastForAbility | A |
| 25 | ChannelCost | 59 | Penetration | 93 | OverkillLeech | 127 | ChanceToCastForTags | A |
| 26 | VoidResistance | 60 | CurrentHealthDrain | 94 | ManaBeforeWardPercent | 128 | AilmentImmunity | A |
| 27 | NecroticResistance | 61 | MaximumCompanions | 95 | IncreasedStunDuration | 129 | AbilityRetaliationChance | A |
| 28 | PoisonResistance | 62 | GlancingBlowChance | 96 | MaximumHealthGainedAsEnduranceThreshold | 130 | IdolAltarProperty | A |
| 29 | BlockChance | 63 | CullPercentFromPassives | 97 | ChanceToGain30WardWhenHit | 131 | GlobalConditionalPenetration | A |
| 30 | AllResistances | 64 | PhysicalResistance | 98 | PlayerProperty | 132 | GlobalConditionalCritChance | A |
| 31 | DamageTakenAsPhysical | 65 | CullPercentFromWeapon | 99 | ManaSpentGainedAsWard | 133 | GlobalConditionalCritMulti | A |
| 32 | DamageTakenAsFire | 66 | ManaCost | 100 | AilmentConversion | | | A |
| 33 | DamageTakenAsCold | 67 | FreezeRateMultiplier | 101 | PerceivedUnimportanceModifier | | | A |

Resistance lookup tables: `RES_SP = [64, 13, 14, 15, 27, 26, 28]`, `NEG_RES_SP = [72, 78, 79, 80, 82, 81, 83]` (damage-array order), groups: Fire/Cold/Lightning also take SP52 and SP84; Physical/Void SP106; Necrotic/Poison SP107; all take SP30. **D**

## Other enums (`stat_tag_enums.json`)

| Enum | Values | Label |
|---|---|---|
| ModType | 0 ADDED, 1 INCREASED, 2 MORE, 3 QUOTIENT | A |
| DamageType | 0 PHYSICAL, 1 FIRE, 2 COLD, 3 LIGHTNING, 4 NECROTIC, 5 VOID, 6 POISON | A |
| ResistanceStatType | 0 NotResistance, 1 IndividualElemental, 2 IndividualPhysicalOrVoid, 3 Combined, 4 IndividualNecroticOrPoison | A |
| HitEventTag (specialTag of SP38/39/40) | 0 None, 1 Hit, 2 Crit, 3 Kill, 4 Freeze, 5 Stun, 6 Block, 7 MeleeHit | A |
| Attribute | 0 Strength, 1 Vitality, 2 Intelligence, 3 Dexterity, 4 Attunement | A |
| SpecificityType | 0 Tags, 1 Ability, 2–6 Tags{Primalist, Mage, Sentinel, Acolyte, Rogue}Only, 7–11 Tags{Strength, Vitality, Intelligence, Dexterity, Attunement} | A |
| MinionOrSituationTag | 0 Self, 1 Minion, 2 Totem, 3 SelfOnPotionUse, 4 SelfWhileChannelling, 5 SelfWhileTransformed | A |
| NodeStatApplication | 0 Default, 1 Global, 2 OnCast, 3 OnCastPreMutation | A |
| NodeStatScaling (`AutomaticNodeStat.GetValue`) | 0 PerPoint = value × points, 1 None = value, 2 Threshold = points ≥ threshold ? value : 0 | A/D |
| TrackerPropertyID (tags of SP123) | 1 CrystalWindStacksUsedOnCast … 8 ShadowRendShadowMoreHitDamage | A |
| IdolAltarPropertyID (tags of SP130) | 0 MaximumOmenIdols … 30 EleResPerHereticalIdol (31 values) | A |
| AilmentID | 0–150, see [ailments.md](ailments.md) | A |
| ETag | enemy archetype tags (Melee 128, Ranged 256, Summoner 512, …); not used for stat matching | A |

## ConditionalDamageProperty (CDP)

`specialTag` of SP117 GlobalConditionalDamage, SP131 penetration, SP132 crit chance, SP133 crit multiplier. **A/D**

| id | name | id | name | id | name | Label |
|---|---|---|---|---|---|---|
| 0 | ToStunnedEnemies | 16 | ToMovingEnemies | 32 | ToFrozenOrChilledEnemies | A |
| 1 | ToLowHealthEnemies | 17 | ToBossesButNotRares | 33 | ToIgnitedOrShockedEnemies | A |
| 2 | ToHighHealthEnemies | 18 | PerStackOfArmourShredUpTo14 | 34 | ToSpreadingFlamesEnemies | A |
| 3 | ToFullHealthEnemies | 19 | ToBleedingEnemies | 35 | ToFearedEnemies | A |
| 4 | ToBossesAndRareEnemies | 20 | ToFrozenEnemies | 36 | ToElectrifiedEnemies | A |
| 5 | ToIgnitedEnemies | 21 | PerNegativeAilmentOnTheTarget | 37 | ToPetrifiedEnemies | A |
| 6 | PerStackOfPoisonUpTo30 | 22 | ToFearedOrSlowed | 38 | PerStackOfFrostbiteUpTo30 | A |
| 7 | PerStackOfBleedUpTo30 | 23 | PerCurse | 39 | PerStackOfShockUpTo30 | A |
| 8 | ToChilledEnemies | 24 | ToBossesAndMovingEnemies | 40 | ToBossesAndRaresWhenAboveHalfMana | A |
| 9 | ToSlowedEnemies | 25 | ToDamnedEnemies | 41 | ForBleedPerStackOfPoisonUpTo200 | A |
| 10 | ToShockedEnemies | 26 | PerNegativeAilmentOnTheTargetUpTo8 | 42 | ForPoisonPerStackOfBleedUpTo200 | A |
| 11 | ToEnemiesWithLessRemainingHealthThanYourCurrentWard | 27 | ToSlowedOrImmobilized | 43 | PerDistance | A |
| 12 | ToEnemiesWithABrandOfDeception | 28 | ToLivingHumans | 44 | ToPoisonedEnemies | A |
| 13 | ToCursedEnemies | 29 | ToNettedEnemies | 45 | ToImmobilizedEnemies | A |
| 14 | ToBrandedEnemies | 30 | PerSlow | 46 | ToBlindedEnemies | A |
| 15 | ToBrandedBossesAndRares | 31 | ToFalconMarkedEnemies | 47 | ToFrostbittenEnemies | A |

Engine reading: `D_t × Π(1 + m × count)`; `count` = 1/0 for flags, the capped counter for "Per…" ids. **D**

## Rounding (`PropertyRounding`)

| Enum | id | Scale s | Used for | Label |
|---|---|---|---|---|
| Hundredth | 0 | ×100 | all INCREASED mods; most percent stats | A |
| Integer | 1 | ×1 | added Damage, Health, Mana, Armour, DodgeRating, attributes, WardRegen, BlockEffectiveness … | A |
| Tenth | 2 | ×10 | 7 affixes (ADDED) | A |
| Thousandth | 3 | ×1000 | DamageTaken MORE; SP115 MORE (specialTag 16); SP117 MORE (specialTag 43, 44) | A |

```
ADDED      → roundingForAdded of the property                                            # D
INCREASED  → Hundredth always                                                            # D
MORE       → moreRoundingOverrides[specialTag] else roundingForMore                       # D
SP98 / SP58 / SP123 / SP130 → PropertyInfo from their own list by index                   # D
```

Distribution across affixes: Hundredth/ADDED 779, Integer/ADDED 503, Hundredth/INCREASED 373, Thousandth/MORE 18, Hundredth/MORE 10, Tenth/ADDED 7, Thousandth/ADDED 6. **A**

## How each source reduces to stats

### Affixes (`affixes.json`, 1156 records)

```
m   = (itemAEM == standardAffixEffectModifier) ? 0 : (1 + itemAEM) / (1 + std) − 1     # D (Affix.getModifier)
lo, hi = tier.rolls[j] ; s = scale(rounding)                                                 # A
a = RHE(lo × (1 + m) × s) ; b = RHE(hi × (1 + m) × s)   (float32, swap if a > b)          # D
v = min(floor((b − a + 1) × roll / 255 + a), b) / s        roll = byte 0..255            # D
Stat{property, specialTag, tags, extraTag, modType} with value v                         # D
```

| `affixEffectModifier` (item base) | Bases | Label |
|---|---|---|
| 0.5 | body armour | A |
| 0.75 | one-handed weapons, bows | A |
| 2.2 | two-handed weapons | A |
| 0.17 | shield, catalyst, amulet | A |
| −0.83 / −0.62 / −0.33 / −0.05 / 0 | Small / Humble+Stout / Grand+Large / Adorned / Ornate+Huge idols | A |
| 0 | omen idols (`omenIdolAffixEffectModifier`) | A |

`standardAffixEffectModifier` values: 0 (821 affixes), 0.5 (82, armour), 0.75 (59, one-handed), 0.17 (48), idol values, 2.2 (14, two-handed). **A**

| Test vector | m | roll | Result | Label |
|---|---|---|---|---|
| Added Health T5 [61, 90], helmet | 0 | 0 / 128 / 255 | 61 / 76 / 90 | D |
| same, body armour (AEM 0.5) | 0.5 | 0 / 255 | 92 / 135 | D |
| Fire Resistance T7 [0.61, 0.75], helmet | 0 | 200 | 0.72 | D |
| Increased Health T6 [0.15, 0.20], body armour | 0.5 | 100 | 0.25 | D |
| Added Melee Physical T8 [85, 100], std 0.75, 2H axe (2.2) | 0.8286 | 255 | 183 | D |

Composition: types Standard 770, Corrupted 134, IdolWeaver 66, Set 61, IdolEnchantment 49, FakeUniqueMod 38, Personal 26, Experimental 12; tiers 8 on 684 affixes. "Sealed" is an item state, not an affix property. **A**

### Implicits, uniques, sets, blessings

| Source | Reduction | Label |
|---|---|---|
| Implicits (`items.json subItems[].implicits`) | `roll_value(value, maxValue, rounding, modType, roll, m = 0)` | D |
| Uniques (`uniques.json mods[]`) | rolled only if `canRoll`, `maxValue > value`, roll ≠ 0; else fixed value on the grid; mods sharing a `rollID` roll together; × (1 + equipEffectModifier, default 0) | D |
| Unique special effects | SP98 PlayerProperty (399 mods, 371 indices), SP58 AbilityProperty (385 mods), SP115/117/131–133/100/130, or a component class (42) | D |
| Sets (`sets.json`) | `count` = distinct set uniqueIDs equipped + number of Legends Entwined (423); bonuses with `setRequirement ≤ count` apply with fixed values | D |
| Blessings (`blessings.json`, 224) | implicits rolled like item implicits; one per timeline; Grand variants from empowered | D/A |
| Legendary items | unique mods + 1–4 exalted affixes; Weaver's Will: affix tiers up to 4 × T7 | G |
| Idols | 1 prefix + 1 suffix, rolled with the idol base AEM; altar refracted cells scale idol affixes by `(1 + x)` (SP130 properties 1–4) | D |

### Passive trees, skill trees, Weaver

| Source | Reduction | Label |
|---|---|---|
| Passive nodes (`passive_node_effects.json`, 541 nodes) | `add_stat` effects with `stat.kind` added / increased / more / ailment_chance (SP1) / ailment_duration (SP42) / ailment_effect (SP43) / conditional_more_damage (SP117) / player_property / ability_property; value `per_point × p + flat`, thresholds `minPoints` | D |
| Mastery base bonus | applied as one extra node with p = 1 (Falconer +12 Dexterity, Forge Guard +35% fire and physical resistance, Void Knight 10% echo chance) | D |
| Skill nodes (`skill_node_effects.json`, 3820 nodes) | stats into the skill's temp lists (`unconditionalTempStats` …) or `CharacterMutator.stats`, plus mutator fields (speed, mana, cooldown, conversions, params) | D |
| Skill node types | damage: more 429, added 79, increased 38; all: added 725, more 521, increased 191, ailment chance 162 | D |
| `AutomaticNodeStat` (31–39 nodes) | real stats from tree data, scaled by NodeStatScaling | D/A |
| Tooltip text | magnitude only; the type comes from code (`stat.kind`), never from wording | D |
| Weaver tree (80 nodes) | `TheWeaver.<field>` echo-content parameters; does not change character stats | D |
| Attributes | `N = RHE(Σadded SP19..23 + Σadded SP46)`; each `perPoint` stat × N; corrupted attributes replace `perPoint` with `corruptedPerPoint` | D |
| Class base | `levelMods` (base + L × perLevel) and `hiddenBaseMods` | A/D |
| Starting attributes | Primalist Str 2 / Att 1; Mage Int 3; Sentinel Str 2 / Vit 1; Acolyte Int 2 / Vit 1; Rogue Dex 3 | A |
| Buffs on you | positive ailment `buffs` × stacks (≤ maxInstances) × (1 + EffectOfAilmentOnYou SP120) | D |

Passive text conventions (verified on 1259 lines): "Increased/Reduced X" → INCREASED (179/180); "More/Less X" → MORE (15/15); "+N" → ADDED (284); "±N% damage taken" → MORE (11); unsigned "N%" resistances, crit multiplier, block → mostly ADDED. **D**

### Special properties

| SP | Meaning of fields | Handling | Label |
|---|---|---|---|
| 58 AbilityProperty | `tags` = AbilityID, `specialTag` = index in `AbilityPropertyList[ability]` | read by that skill's mutator; model per property | D |
| 98 PlayerProperty | `tags` = PlayerPropertyList index (713 entries) | switch into a CharacterMutator field: `add` 534, `flag` 78, `more-combine` 42, `assign` 2, complex 32 | D |
| 100 AilmentConversion | `specialTag` = from AilmentID, `tags` = to AilmentID | moves chance | D |
| 104 / 105 IncreasedDropRate / IncreasedExperience | `specialTag` 0 → `tags` = EquipmentType | loot only | A |
| 115 DamagePerStackOfAilment | `specialTag` = AilmentID | more per stack on the target, no limit | D |
| 117 / 131 / 132 / 133 | `specialTag` = CDP | conditional more / pen / crit | D |
| 88 LevelOfSkills | added, matched by tags or extraTag | raises skill point cap (rounded) | D |
| 126 / 127 ChanceToCast… | `extraTag` = ability cast; 127 `tags` = required skill tags, `specialTag` 1 hit / 2 crit | trigger model | D |
| 31–37 DamageTakenAs… | target type = property − 31, `tags` = source type | see [defenses.md](defenses.md) | D |

## How an agent should sum a build

```
1. Collect mods: class levelMods + hiddenBaseMods, passives (+ mastery bonus), equipped items
   (implicits, affixes with item AEM), uniques, set bonuses, idols (+ altar), blessings,
   skill-tree stats of the skill being evaluated, active buffs × stacks, attribute stats × N.      # D
2. Resolve attributes first (RHE of Σadded), then add per-point stats.                              # D
3. For each damage component: build src tags (section Tag bitmask), then per damage type t:
     added_t   = Σ ADDED Damage mods addressed to t   (× ADE)
     inc_t     = Σ INCREASED Damage mods addressed to t
     more_t    = Π (1 + MORE) mods addressed to t   (each separately; do not sum)                  # D
4. Character stats (health, armour, …): query_untagged → (Σadded)(1 + Σinc)Πmore, round where required.   # D
5. Model SP98 / SP58 / component effects explicitly; never fold them into generic sums.            # D
6. Apply enemy-side layers last (resistance, penetration, DT, level DR, armour).                   # D
```

## Worked example

Summing Fire-bucket increased damage for Fireball (src = Fire\|Spell\|Hit + HighLife\|FullLife at full health), from these mods: **D** (inputs illustrative **U**)

| Mod (property, tags, modType, value) | Addressed bucket | Matches Fireball fire? | Label |
|---|---|---|---|
| SP0, tags 0, INCREASED 0.04 × 40 Int (attributeScaling) | all | yes (+1.60) | A/D |
| SP0, Fire (8), INCREASED 0.80 | Fire | yes (+0.80) | D |
| SP0, Spell (256), INCREASED 0.50 | all | yes (+0.50) | D |
| SP0, Elemental (128), INCREASED 0.30 | F/C/L | yes (+0.30) | D |
| SP0, Fire\|Melee (520), INCREASED 0.60 | Fire, needs Melee | no | D |
| SP0, Fire\|DoT (4104), INCREASED 0.50 | Fire, needs DoT | no (hit) | D |
| SP0, LowLife (1048576), INCREASED 0.40 | all, needs LowLife | no (at full health) | D |
| SP0, Minion (8192), INCREASED 1.50 | minion only | no | D |
| SP0, tags 0, `extraTag` = Fireball AbilityID, MORE 0.35 (tree) | all, Fireball only | yes (×1.35) | D |
| SP0, Fire, MORE 0.20 (tree) | Fire | yes (×1.20) | D |

```
inc_fire  = 1.60 + 0.80 + 0.50 + 0.30 = 3.20  → × 4.20                                        # D
more_fire = 1.35 × 1.20 = 1.62                                                                  # D
if the 0.35 and 0.20 were summed as one more (wrong): × 1.55 → 4.3% low                         # D
```

## Common misconceptions / pitfalls
- Inferring modType from tooltip text for skill nodes ("increased" lines are usually MORE). **D**
- Matching a mod by "any shared tag". The rule is subset: every tag on the mod must be on the source. **D**
- Applying tagged health or armour (e.g. Minion-tagged) to the player's totals. Player defenses use only untagged mods. **D**
- Using the item's raw `affixEffectModifier` instead of `m = (1 + itemAEM)/(1 + std) − 1`. **D**
- Reading HealthLeech 0.3 as 30% (it is 3%). **D/A**
- Treating SP98/SP58 values as damage numbers. They are inputs to coded effects. **D**
- Rounding "per N attribute" effects down. They are continuous (`pp × attr / N`). **D**

## Open questions
- Semantics of SP104/105 `specialTag` 1–4 (non-equipment drop categories). **D?**
- The `setProperty` argument on Set affixes (quantization effect, 61 affixes). **D?**
- `equipEffectModifier` non-zero source on uniques. **D?**
- 32 `complex` and 3 `unknown` PlayerProperty switch cases whose field was guessed heuristically. **D?**
- AbilityProperty usage per mutator: names known, formulas only for traced skills (7 of 67 pairs named in passives). **D?**
- Float32 rounding at `.5` boundaries: test vectors were computed in double. **D?**

## Sources
- `vendor/lastepochbuilder/research/data/stat_tag_enums.json` (AT, ModType, DamageType, ResistanceStatType, ConditionalDamageProperty, AilmentID, HitEventTag, TrackerPropertyID, IdolAltarPropertyID, NodeStatApplication, NodeStatScaling, Attribute, SpecificityType, MinionOrSituationTag, ETag).
- `vendor/lastepochbuilder/research/data/sp_enum.json` (134 SP ids, nodeStatApplication).
- `vendor/lastepochbuilder/research/data/game/global_player_properties.json` (statProperties rounding, propertyRoundingEnum/Scale, playerProperties, abilityProperties).
- `vendor/lastepochbuilder/research/07a_assets_core_data.md` §1.1 (stat normalization), §3.2 (rounding), §6 (affix value model and test vectors), §7–8 (items, uniques, sets, idols, blessings).
- `vendor/lastepochbuilder/client/docs/ENGINE.md` §1 (constants, tags_match, RES_SP), §2 (StatMod, StatQuery, StatStore), §5 (mod sources), §8.2 (addressing).
- `vendor/lastepochbuilder/research/07b_assets_abilities_trees.md` §1.2 (node stats), §2.1 (ability fields).
- `vendor/lastepochbuilder/research/07c_skill_mutators.md` §1 (tree stat types and counts).
- `vendor/lastepochbuilder/research/07f_passive_weaver_trees.md` §2–5 (passive schema, mastery bonuses, text conventions, Weaver).
- `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.1–2.3 (unique mod value, PlayerProperty switch, sets).
- `vendor/lastepochbuilder/research/07i_unique_formulas.md` §2 (PlayerProperty handler patterns).
- `vendor/lastepochbuilder/research/data/game/items.json`, `affixes.json`, `uniques.json`, `sets.json`, `idols.json`, `blessings.json`, `attributes.json`, `classes.json` (source records).
- `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (Affixes "all stats granted by affixes are global", Idols, LegendaryItems, WeaversWill, Terminology).

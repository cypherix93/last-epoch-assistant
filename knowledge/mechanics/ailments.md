# Ailments, Stun and Freeze
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Confidence legend: **D** = recovered from decompiled client code (via vendored weksil research), **A** = read from game asset data, **G** = official in-game guide text, **X** = community-verified (Maxroll 2026 / forum tests), **U** = unverified or inferred. Each formula and constant carries a label.
> A `?` suffix (for example **D?**) means the source itself marks the reading as ambiguous.

## Summary (10 lines max, the rules an agent must never get wrong)
1. A damaging ailment stack deals `baseDamage` over `duration`; base damage is fixed (no added damage; ADE 0 for Ignite, Bleed, Poison, Electrify, Frostbite, Damned, Time Rot). **A/G**
2. Per-stack scaling = generic increased + type increased (+ Elemental for F/C/L) + DoT increased + type-DoT increased + attribute scaling + skill-tree and generic/DoT more of the applying skill. Never Hit, Melee, Throwing, Bow modifiers; Spell modifiers only for ailments that carry the Spell tag. **G/D**
3. Ailments cannot crit, do not trigger on-hit effects, ignore armour/dodge/block/glancing/parry; resistances, penetration of their type, damage taken and monster level DR apply. **G/D**
4. Chance above 100% applies `floor(chance)` stacks plus one more with probability `frac(chance)`: 235% → 2 stacks + 35% for a 3rd. **G**
5. Increased duration raises total damage per stack, not DPS per stack; steady-state stacks = applications/s × duration. **G**
6. At `maxInstances` a new stack replaces the oldest; 0 means unlimited. **G/A**
7. Attack/cast speed and crit stats never scale ailment damage directly; speed only raises application rate. **G/D**
8. Debuffs vs bosses and players are multiplied by `1 + moreBuffEffectAgainstBosses/Players` (Shock/shreds/Poison −0.6 → 40%; Chill/Slow −0.5 → 50%; Frailty, Armour Shred, Crit Vulnerability, Marked for Death unchanged). **A**
9. Stun: `2·D·(1+inc)/(H + ward) − (500 + stunAvoidance)/5000`; Freeze: `rate·(1 + perChill·chill)·mult/(H + ward) × (1 + 0.2·min(frostbite,15))`; bosses use 1.5× health for both. **G/A**
10. Season 5: refreshing an ailment's duration also resets its remaining damage to the value at application; ailments cannot apply other ailments. **G/X**

## 1. Applying ailments

```
chance_A = Σ prefab base chance (ailmentsOnHit[], same component as primaryDamage)          # A
         + Σ added AilmentChance SP1 with specialTag = AilmentID(A), tags ⊆ skill tags + health   # D
stacks per event = floor(chance_A) + Bernoulli(frac(chance_A))                                    # G
events = hits on the target (one per hit per target); zones apply every applicationInterval s     # D
```

- Base chance example: Fireball applies Ignite with `chance 0.4` on hit (`ChanceToApplyAilmentsOnHit`). **A**
- "On hit" ailment chances on gear and passives do not apply to zone (`RepeatedlyApplyAilmentsInRadius`) applications; zone ailments use the zone's own chances plus the skill tree's AilmentChance stats. **D**
- Curse-hit components (Bone Curse) use only "when a cursed enemy is hit" chances. **D**
- Ailment conversion (SP100: `specialTag` = from, `tags` = to; tree `ailment_convert`) moves the whole chance to the new ailment. **D**
- Ailments cannot apply other ailments (e.g. Ignite cannot apply shred); the Shadow Daggers finisher is a separate hit. **X**
- Hit-based application requires the hit to land: dodged hits apply nothing; parried and blocked hits still count as hits. **G**

## 2. Damage of a stack

```
tags_A   = (ailment.tags | Ailment | DoT) & ~Hit, plus health tags                             # D
D_stack  = buildDamage(ailment.baseDamage, tags_A, ADE = ailment.addedDamageScaling)            # D
         = baseDamage_t × (1 + Σinc_t) × Πmore_t       (added damage × ADE; ADE 0 for main DoTs)  # D
D_stack *= (1 + effMore) × (1 + durMore) × (1 + damageModifier)                                 # D
  effMore = Σ IncreasedAilmentEffect SP43 (specialTag = AilmentID), only when
            effectOfIncreasedEffectiveness == MoreDamageAndBuffEffect; when it is AdditionalPenetration
            the effect is added as penetration of additionalPenetrationDamageType instead          # D?
  durMore = Σ IncreasedAilmentDuration SP42 (specialTag = AilmentID) unless damage is dealt at end / on hit   # D
  damageModifier = the applying component's per-ailment damageModifier (ailmentsOnHit entry)    # D
T        = duration × (1 + Σ SP42)                                                               # D/G
DPS_stack = D_stack / T                     (duration changes total, not per-second damage)      # G
```

- Ailment damage is "affected by damage modifiers from the skill tree and attribute scaling of the skill that applies it". **G**
- More damage nodes that do not say "hit" (or another excluding tag) apply to the skill's ailments. **X**
- Ignite, Bleed, Poison, Electrify, Frostbite, Damned, Time Rot, Hemorrhage, Plague, Spreading Flames have ADE 0; Laceration 3, Abyssal Decay 5, Spirit Plague 4.5, Torment 6, Decrepify 10, Exposed Flesh 4, Acid Skin 4, Anguish 2, Chained 2. **A**
- Ailments use their own `additionalPenetrationDamageType` for penetration; `baseDamage.penetration` is empty on all 149 ailments. **A**
- Damage modifiers with `specialTag` = AilmentID (ailment-specific stats such as "increased ignite damage") match only that ailment, by the general `specialTag` rule (0 = wildcard). **D?**
- Guide duration example: a 120-damage bleed over 3 s with +50% duration deals 180 over 4.5 s (40/s either way). **G**

Versus an enemy (per damage type of the ailment): **D**

```
taken = D_stack × Π(1 + SP117 conditional) × resMult_t × DT(DoT|Ailment|type) × (1 − levelDR) × armourPart   # D
resMult_t  = (res > 0.75 ? 0.25 : 1 − res) + pen_t                                        # D
armourPart = 1 − armourDR × min(SP118, 1)   (1 when the target has no SP118)              # D
```

## 3. Stacking, steady state, refresh

```
λ           = uses/s × hits per use × projectiles on target × chance                            # D
stacks_ss   = min(λ × T, maxInstances or ∞)                                                     # D
DPS_total   = λ × D_stack                         (no cap reached)                              # D
DPS_capped  = maxInstances × D_stack / T           (cap reached, oldest replaced: each stack lives max/λ)   # D (derived)
engine heuristic for the capped case: DPS = λ·D·(a + 0.4)/(T + 0.4), a = max/λ                  # D? (ENGINE §8.6)
uptime (single-instance ailments) = 1 − e^(−λ·T)                                                # D (ENGINE §9.11)
```

- Unlimited ailments (Ignite, Bleed, Poison, Electrify, Frostbite, Damned, Hemorrhage) are limited only by application rate and duration. **G/A**
- Season 5 (1.5): when an ailment's duration resets, its remaining total damage also resets to its value at application. **G** (patch notes via 02 §5.1)
- Replacement flags exist per ailment (`dontReplaceHigherDurationStacks`, `prioritiseStrongestStacks`, `replaceLowestDamageStacksInsteadOfOldest`); all are 0 on Ignite, Poison, Frostbite, Shock, Chill. **A**
- `buffScalingType`: `Individual` = each stack applies its own stat (a MORE per stack multiplies: Chill 0.88ⁿ); `GroupedUnlimited` = stacks sum; `GroupedLimited N` = only the first N stacks apply the debuff (Poison 30, Frostbite 15). **A/G**
- Consumers (Dive Bomb, Abyssal Echoes, Puncture, Enchant Weapon, Flame Rush, Rive, Soul Feast nodes) remove stacks when they hit; an average-uptime model must subtract the consumed load. **D**

## 4. Ailment table (game data 1.5.0)

Columns: id = `AilmentID`; dur in s; max = `maxInstances` (∞ = 0 in data); dmg/s = per stack before scaling; boss/player = `moreBuffEffectAgainstBosses` / `…Players` applied to the debuff part; scaling = `buffScalingType` (+ `maxStacksThatApplyBuffs`); flags: dmg = `dealsDamage`, curse = `isCurse`, spreads = `spreads`, positive = buff.

### 4.1 Damaging ailments

| id | name | dur | max | base damage | dmg/s | ADE | tags | debuff per stack | boss/player | scaling | flags | Label |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Ignite | 2.5 | ∞ | Fire 40 | 16.0 | 0 | DoT | — | 0/0 | Individual | dmg | A |
| 2 | Bleed | 3 | ∞ | Physical 53 | 17.7 | 0 | DoT | — | 0/0 | Individual | dmg | A |
| 7 | Poison | 3 | ∞ | Poison 28 | 9.3 | 0 | DoT | NegativePoisonResistance ADD 0.05 | -0.6/-0.6 | GroupedLimited 30 | dmg | A |
| 93 | Electrify | 2.5 | ∞ | Lightning 44 | 17.6 | 0 | DoT | — | 0/0 | Individual | dmg | A |
| 23 | Frostbite | 3 | ∞ | Cold 50 | 16.7 | 0 | DoT | IncreasedChanceToBeFrozen ADD 0.2 | 0/0 | GroupedLimited 15 | dmg | A |
| 39 | Damned | 2.5 | ∞ | Necrotic 35 | 14.0 | 0 | DoT | HealthRegen INC -0.2 | 0/0 | GroupedUnlimited | dmg | A |
| 9 | TimeRot | 3 | 12 | Void 60 | 20.0 | 0 | DoT | ReceivedStunDuration INC 0.05 | 0/0 | Individual | dmg | A |
| 10 | FutureAttack | 3 | ∞ | Void 60 | 20.0 | 0 | DoT | — | 0/0 | Individual | dmg | A |
| 11 | Laceration | 3 | 1 | Physical 1 | 0.3 | 3 | Melee\|DoT | — | 0/0 | Individual | dmg | A |
| 12 | AbyssalDecay | 5 | 1 | Void 100 | 20.0 | 5 | Spell\|DoT | — | 0/0 | Individual | dmg | A |
| 13 | StackingAbyssalDecay | 3 | ∞ | Void 30 | 10.0 | 1.5 | Spell\|DoT | — | 0/0 | Individual | dmg | A |
| 15 | SerpentVenom | 3 | 1 | Poison 400 | 133.3 | 0 | DoT | CriticalChance MOR -1 | 0/0 | Individual | dmg | A |
| 18 | Plague | 4 | 1 | Poison 150 | 37.5 | 0 | DoT | — | 0/0 | Individual | dmg,spreads | A |
| 19 | Ravage | 6 | 1 | Void 135 | 22.5 | 0 | Spell\|DoT | — | 0/0 | Individual | dmg | A |
| 24 | SpreadingFlames | 4 | 1 | Fire 200 | 50.0 | 0 | DoT | — | 0/0 | Individual | dmg,spreads | A |
| 40 | Pestilence | 0.5 | 2 | Poison 30 | 60.0 | 0 | DoT | — | 0/0 | Individual | dmg | A |
| 4 | Possess | 1.5 | 1 | Necrotic 20 | 13.3 | 1 | Spell\|DoT | — | 0/0 | Individual | dmg | A |
| 90 | Doom | 4 | 4 | Void 400 | 100.0 | 0 | DoT | DamageTaken INC 0.04 (Melee) | 0/0 | GroupedUnlimited | dmg | A |
| 98 | MimicFeast | 15 | 12 | Void 200 | 13.3 | 0 | DoT | HealthLeech MOR -1 | 0/0 | Individual | dmg | A |
| 101 | SnakeInfection | 12 | 1 | Poison 300 | 25.0 | 0 | DoT | — | -0.06/0 | Individual 30 | dmg | A |
| 105 | BrandOfTrespass | 3 | 1 | Fire 400 | 133.3 | 0 | DoT | — | 0/0 | Individual | dmg | A |
| 106 | BrandOfSubjugation | 3 | 1 | Cold 400 | 133.3 | 0 | DoT | — | 0/0 | Individual | dmg | A |
| 107 | BrandOfDeception | 3 | 1 | Lightning 400 | 133.3 | 0 | DoT | — | 0/0 | Individual | dmg | A |
| 122 | Witchfire | 12 | 1 | Fire 600 + Necrotic 600 | 100.0 | 0 | DoT | — | 0/0 | Individual | dmg | A |
| 123 | Chained | 2 | 1 | Necrotic 40 | 20.0 | 2 | Spell\|DoT | — | 0/0 | Individual | dmg | A |
| 142 | Hemorrhage | 3 | ∞ | Physical 300 | 100.0 | 0 | DoT | — | 0/0 | Individual | dmg | A |
| 144 | ScathingLight | 4 | 1 | Fire 200 + Lightning 200 | 100.0 | 0 | DoT | — | 0/0 | Individual | dmg | A |
| 149 | Disemboweled | 6 | ∞ | Physical 200 | 33.3 | 0 | Physical | — | 0/0 | Individual | dmg | A |

Plague spreads to a target within 6 m every 0.6 s (`spreadRange 6`, `spreadDelay 0.6`) and on death; Spreading Flames 5 m / 0.6 s; Spirit Plague 9 m on death (`maxSpreadPerInstance 1`). **A/G**

### 4.2 Curses

| id | name | dur | max | base damage | dmg/s | ADE | tags | debuff | boss/player | scaling | flags | Label |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 58 | BoneCurse | 8 | 1 | Physical 4 | 0.5 | 0.2 | Spell\|Curse | — | 0/0 | Individual | dmg,curse | A |
| 69 | NecroticBoneCurse | 8 | 1 | Necrotic 4 | 0.5 | 0.2 | Spell\|Curse | — | 0/0 | Individual | dmg,curse | A |
| 59 | SpiritPlague | 3 | 1 | Necrotic 90 | 30.0 | 4.5 | Spell\|DoT\|Curse | — | 0/0 | Individual | dmg,curse,spreads | A |
| 17 | MarkedForDeath | 8 | 1 | — | — | 1 | — | AllResistances ADD -0.25 | 0/0 | Individual | curse | A |
| 113 | Decrepify | 10 | 1 | Physical 200 | 20.0 | 10 | Spell\|DoT\|Curse | DamageTaken MOR 0.15 (DoT) | 0/0 | Individual | dmg,curse | A |
| 117 | Penance | 15 | 1 | Fire 20 | 1.3 | 1 | Spell\|Curse | — | 0/0 | Individual | dmg,curse | A |
| 118 | Torment | 3 | 1 | Necrotic 120 | 40.0 | 6 | Spell\|DoT\|Curse | Movespeed MOR -0.18 | 0/0 | Individual | dmg,curse | A |
| 120 | AcidSkin | 5 | 1 | Poison 80 | 16.0 | 4 | DoT\|Curse | ChanceToBeCrit ADD 0.2 | 0/0 | GroupedLimited 1 | dmg,curse | A |
| 121 | Anguish | 10 | 1 | Necrotic 40 | 4.0 | 2 | Spell\|Curse | Damage MOR -0.15 (DoT) | 0/0 | Individual | dmg,curse | A |
| 137 | ExposedFlesh | 8 | 1 | Poison 80 | 10.0 | 4 | DoT\|Curse | ColdResistance ADD -0.15; IncreasedChanceToBeFrozen ADD 0.3 | 0/0 | Individual 1 | curse | A |
| 115 | Withering | 3 | 10 | — | — | 1 | — | DamageTaken INC 0.1 (Curse) | -0.6/-0.6 | GroupedUnlimited | — | A |

- Curses carry their own scaling tag (Curse) and usually do not stack with themselves. **G**
- Bone Curse hits the cursed target whenever it is hit; damage ×3 when the curse owner made the hit (`moreDamageWhenHitByCreator`). **G/D**
- Penance: 20 fire per hit taken by the target, +5% more per 1% damage reflected; flat reflect does not count. **G**
- Anguish deals 40 necrotic to cursed enemies when you kill any enemy (`dealsDamageOnAnguish`). **G/A**
- Exposed Flesh also reduces armour by 15 per point of the inflicter's Dexterity (guide text; this part is not in the `buffs` list). **G**
- Decrepify's guide text: physical damage over time "based on your flat missing health". **G**

### 4.3 Non-damaging debuffs

| id | name | dur | max | base damage | dmg/s | ADE | tags | debuff per stack | boss/player | scaling | flags | Label |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 3 | Chill | 4 | 3 | — | — | 1 | — | AttackSpeed MOR -0.12; CastSpeed MOR -0.12; Movespeed MOR -0.12 | -0.5/-0.5 | Individual | — | A |
| 5 | Shock | 4 | 10 | — | — | 1 | — | IncreasedChanceToBeStunned ADD 0.2; NegativeLightningResistance ADD 0.05 | -0.6/-0.6 | GroupedUnlimited | — | A |
| 6 | Slow | 4 | 3 | — | — | 1 | — | Movespeed MOR -0.2 | -0.5/-0.5 | Individual | — | A |
| 8 | ArmourShred | 4 | ∞ | — | — | 1 | — | NegativeArmour ADD 100 | 0/0 | Individual | — | A |
| 14 | Blind | 4 | 1 | — | — | 1 | — | CriticalChance MOR -1 | 0/0 | Individual | — | A |
| 16 | Frailty | 4 | 3 | — | — | 1 | — | Damage MOR -0.06 | 0/0 | Individual | — | A |
| 28 | PoisonResShred | 4 | 10 | — | — | 1 | — | NegativePoisonResistance ADD 0.05 | -0.6/-0.6 | GroupedUnlimited | — | A |
| 29 | NecroticResShred | 4 | 10 | — | — | 1 | — | NegativeNecroticResistance ADD 0.05 | -0.6/-0.6 | GroupedUnlimited | — | A |
| 30 | VoidResShred | 4 | 10 | — | — | 1 | — | NegativeVoidResistance ADD 0.05 | -0.6/-0.6 | GroupedUnlimited | — | A |
| 42 | FireResShred | 4 | 10 | — | — | 1 | — | NegativeFireResistance ADD 0.05 | -0.6/-0.6 | GroupedUnlimited | — | A |
| 73 | PhysicalResShred | 4 | 10 | — | — | 1 | — | NegativePhysicalResistance ADD 0.05 | -0.6/-0.6 | GroupedUnlimited | — | A |
| 74 | ColdResShred | 4 | 10 | — | — | 1 | — | NegativeColdResistance ADD 0.05 | -0.6/-0.6 | GroupedUnlimited | — | A |
| 75 | LightningResShred | 4 | 10 | — | — | 1 | — | NegativeLightningResistance ADD 0.05 | -0.6/-0.6 | GroupedUnlimited | — | A |
| 85 | CriticalVulnerability | 4 | 10 | — | — | 0 | DoT | ChanceToBeCrit ADD 0.02; CritAvoidance ADD -0.1 | 0/0 | GroupedUnlimited | — | A |
| 78 | EfficaciousToxin | 4 | 1 | — | — | 1 | — | DamageTaken INC 0.12 (DoT) | 0/0 | Individual | — | A |
| 43 | MeleeDefShred | 4 | ∞ | — | — | 1 | — | DamageTaken MOR 0.1 (Melee) | 0/0 | Individual | — | A |
| 31 | Stagger | 10 | 1 | — | — | 1 | — | Armour ADD -100; DamageTaken INC 0.1 | 0/0 | Individual | — | A |
| 20 | Root | 0.7 | 1 | — | — | 1 | — | Movespeed MOR -0.93 | 0/0 | Individual | — | A |
| 21 | Fear | 5 | ∞ | — | — | 0 | — | — | 0/0 | Individual | — | A |
| 92 | StoneStare | 5 | ∞ | — | — | 1 | — | Movespeed MOR -0.2 | 0/0 | Individual | — | A |
| 126 | Netted | 3 | 1 | Void 400 | 133.3 | 0 | DoT | Movespeed MOR -0.35 | 0/0 | Individual | — | A |
| 143 | AllResReduction | 8 | ∞ | — | — | 1 | — | AllResistances ADD -0.05 | 0/0 | Individual | — | A |

Caps and effective values (debuff × stacks × (1 + boss penalty)): **A/G**

| Debuff | Per stack normal | Per stack boss/player | Max stacks | Max total normal | Max total boss | Label |
|---|---|---|---|---|---|---|
| Resistance shred (each type) | −5% res | −2% res | 10 | −50% | −20% | A/G |
| Shock | −5% lightning res, +20% chance to be stunned | −2%, +8% | 10 | −50%, +200% | −20%, +80% | A/G |
| Poison (debuff part) | −5% poison res | −2% | first 30 stacks | −150% | −60% | A/G |
| Chill | 12% less attack/cast/move speed, multiplicative per stack | 6% | 3 | ×0.681 (0.88³) | ×0.831 (0.94³) | G/A |
| Slow | 20% less move speed, multiplicative | 10% | 3 | ×0.512 | ×0.729 | G/A |
| Frailty | 6% less damage dealt | 6% (no penalty in data) | 3 | ×0.831 | ×0.831 | A/G |
| Armour Shred | −100 armour × (1 + increased shred effect) | same | ∞ | — | — | G/A |
| Critical Vulnerability | +2% chance to be crit, −10% crit avoidance | same | 10 | +20%, −100% | same | A |
| Withering | +10% increased curse damage taken | +4% | 10 | +100% | +40% | A/G |
| Frostbite (debuff part) | +20% chance to be frozen | same | first 15 stacks | +300% | +300% | A/G |
| Time Rot | +5% increased stun duration received | same | 12 | +60% | +60% | A |
| Doom | +4% increased melee damage taken | same | 4 | +16% | +16% | A |

- Ailment effectiveness ("increased X effect", SP43) scales every stat modifier the ailment grants: +50% armour shred effect → 150 armour per stack. **G**
- Chill and Slow stack multiplicatively per stack (guide), consistent with `Individual` MORE buffs; a linear `n × m` model overstates Chill (−36% vs −31.9% at 3 stacks). **G/A**

### 4.4 Common positive ailments (buffs on the player or minions)

| id | name | dur | max | base damage | dmg/s | ADE | tags | buff per stack | boss/player | scaling | flags | Label |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 33 | Haste | 4 | 1 | — | — | 0 | DoT | Movespeed INC 0.3 | 0/0 | Individual | positive | A |
| 34 | Frenzy | 1 | 1 | — | — | 0 | DoT | AttackSpeed INC 0.2; CastSpeed INC 0.2 | 0/0 | Individual | positive | A |
| 22 | DamageBoost | 3 | 10 | — | — | 1 | — | Damage INC 0.1 | 0/0 | Individual | positive | A |
| 26 | VoidEssence | 8 | 3 | — | — | 0 | DoT | Damage MOR 0.03 (Void); Damage MOR 0.03 (Melee); ReceivedStunDuration INC -0.15 | 0/0 | Individual | positive | A |
| 32 | DivineEssence | 10 | 3 | — | — | 0 | DoT | Armour INC 0.15; IncreasedHealing ADD 0.15; DamageTaken INC -0.05 (DoT) | 0/0 | Individual | positive | A |
| 44 | Stalwart | 10 | 10 | — | — | 1 | — | Armour INC 0.1 | 0/0 | GroupedUnlimited | positive | A |
| 45 | Inspiration | 4 | 1 | — | — | 1 | — | IncreasedCooldownRecoverySpeed ADD 0.2 | 0/0 | Individual | positive | A |
| 82 | DuskShroud | 4 | ∞ | — | — | 0 | DoT | GlancingBlowChance ADD 0.05; DodgeRating ADD 50 | 0/0 | GroupedUnlimited | positive | A |
| 83 | CrimsonShroud | 4 | 3 | — | — | 0 | DoT | AilmentChance ADD 0.5 st2; DamageTaken MOR -0.05 (DoT) | 0/0 | Individual | positive | A |
| 86 | Sharpshooter | 8 | 10 | — | — | 0 | DoT | Damage INC 0.25 (Bow) | 0/0 | GroupedUnlimited | positive | A |
| 94 | TotemArmor | 4 | 4 | — | — | 0 | DoT | Armour INC 0.8; Damage MOR 0.15 | 0/0 | Individual | positive | A |
| 61 | Contempt | 500 | 5 | — | — | 0 | DoT | AllResistances ADD 0.1; Armour MOR 0.1 | 0/0 | Individual | positive | A |
| 76 | Enrage | 6 | 1 | — | — | 0 | DoT | AttackSpeed INC 0.6; CastSpeed INC 0.6; Movespeed INC 0.35 | 0/0 | Individual | positive | A |
| 77 | LightningInfusion | 4 | 3 | — | — | 1 | — | Damage ADD 21 (Lightning\|Spell); Damage ADD 21 (Lightning\|Melee); Damage ADD 21 (Lightning\|Bow); Damage ADD 21 (Lightning\|Throwing) | 0/0 | Individual | positive | A |
| 81 | SilverShroud | 10 | ∞ | — | — | 0 | DoT | — (dodges the next hit, coded) | 0/0 | Individual | positive | A |
| 147 | Bulwark | 0 | ∞ | — | — | 0 | DoT | Armour ADD 100; ArmourMitigationAppliesToDamageOverTime ADD 0.05 | 0/0 | GroupedUnlimited | positive | A |
| 139 | StoneAegis | 10 | ∞ | — | — | 1 | — | Armour ADD 50; EnduranceThreshold ADD 50 | 0/0 | GroupedUnlimited | positive | A |
| 35 | Swiftness | 30 | 10 | Void 25 | 0.8 | 0 | Spell\|DoT | Movespeed INC 0.01 | 0/0 | GroupedUnlimited | positive | A |
| 60 | ShrineHaste | 60 | 1 | — | — | 0 | DoT | Movespeed INC 0.3; AttackSpeed INC 0.3; CastSpeed INC 0.3 | 0/0 | Individual | positive | A |
| 64 | ShrineCrit | 60 | 1 | — | — | 0 | DoT | CriticalChance ADD 1 | 0/0 | Individual | positive | A |
| 65 | ShrineManatee | 45 | 1 | — | — | 0 | DoT | ManaRegen INC 1; IncreasedCooldownRecoverySpeed ADD 1 | 0/0 | Individual | positive | A |

Buffs on you are scaled by `EffectOfAilmentOnYou` SP120 (specialTag = AilmentID): stat × stacks × (1 + SP120). **D**

## 5. Stun

```
stunChance = 2 × D × (1 + Σinc IncreasedStunChance SP45) / (H_eff + currentWard)
           − (500 + stunAvoidance) / 5000                                                        # G (formula image r-34 via 02)
stunChance *= 1 + Σ IncreasedChanceToBeStunned on the target (Shock: +0.2/stack, +0.08 vs boss/player)   # G/A
H_eff = maxHealth × (1 + bossEffectiveHealthModifierVsStun) for bosses = maxHealth × 1.5           # A/G
player hits: melee damage ×3, other damage ×2 inside D                                            # G
hidden player base: IncreasedStunChance INCREASED +1.0 for Melee|Bow                              # A
duration = 0.4 s × (1 + Σ IncreasedStunDuration SP95) × (1 + Σ ReceivedStunDuration on target)    # G/A (multiplication form U)
player stunAvoidance = 250 + 5 × level (+ mods)                                                  # A/G
```

- Threshold: with 0 increased stun chance and 0 stun avoidance, a non-player hit must exceed 5% of max health to stun; each 100 stun avoidance raises this by 1%. **G**
- Guide example: 5% base chance vs a boss × 1.8 from 10 Shock stacks = 9%. **G**
- Strong Mind (unique): StunAvoidance += 2 × max mana. **D**

## 6. Freeze

```
freezeChance = freezeRate × (1 + Σ FreezeRatePerStackOfChill SP103 × chillStacks) × FreezeRateMultiplier(SP67, base 1)
             / (H_eff + currentWard)
             × (1 + Σ IncreasedChanceToBeFrozen SP68 on target)                                  # G
Frostbite: +0.2 per stack for the first 15 stacks (max +3.0); Exposed Flesh +0.3                  # A
H_eff = maxHealth × (1 + bossEffectiveHealthModifierVsFreeze 0.5) for bosses                       # A/G
base freeze duration = 1.2 s                                                                      # G
```

Guide examples (10,000 health, 0 ward): rate 40 × multiplier 6 → 2.4%; with 3 chill at +50% per stack → 40 × 2.5 × 6 = 6%; plus 15 Frostbite → ×4 = 24%; boss → ÷1.5 = 16%. **G**

| Constant | Value | Label |
|---|---|---|
| `bossEffectiveHealthModifierVsStun` | 0.5 (asset; constructor default 0.25) | A |
| `bossEffectiveHealthModifierVsFreeze` | 0.5 (asset; constructor default 0.25) | A |
| Freeze rate on skills | `freezeRate` field on damage components; most Cold skills have one | A/G |
| Attribute scaling on some skills | +4% freeze rate multiplier per point (11 skills) | A |
| Frozen Ire (unique) | +0.02 FreezeRateMultiplier per character level | D |

## 7. Ailments on the player

- Chill and Slow on players have 50% less effect; Shock, shreds and Poison 60% less. **G/A**
- Players have a hidden DamageTaken MORE −0.15 on DoT ([defenses.md](defenses.md)). **A**
- Endurance and resistances mitigate DoT; armour, dodge, block, glancing and parry do not. **G**
- Parried hits still apply ailments; dodged hits do not. **G**

## Worked example

Ignite from the Fireball build of [damage-pipeline.md](damage-pipeline.md#worked-example): 40 Int, 80% increased fire, 30% elemental, 50% spell (does not apply), plus 50% increased fire DoT; tree 35% more damage and 20% more fire damage (assumed not hit-only); +60% ignite chance on top of Fireball's base 40%; 20% fire penetration; 2.20 casts/s. Gear inputs are illustrative. **U**

```
chance      = 0.40 + 0.60 = 1.00 → exactly 1 stack per hit                                   # G
base        = 40 fire over 2.5 s = 16.0/s per stack                                            # A
increased   = 1.6 (Int) + 0.8 (fire) + 0.3 (elemental) + 0.5 (fire DoT) = 3.2 → ×4.2 ; spell 0.5 excluded   # G/D
more        = 1.35 × 1.20 = 1.62                                                               # D
DPS/stack   = 16.0 × 4.2 × 1.62 = 108.86                                                       # D
λ           = 2.20 hits/s × 1.00 = 2.20 stacks/s ; stacks_ss = 2.20 × 2.5 = 5.5                # D
ignite DPS  = 108.86 × 5.5 = 598.7 (before enemy)                                              # D
vs dummy    : × (1 + 0.20 pen) = 718.5                                                          # D
vs level-100 normal with 3 fire shred: × (1 + 0.15 + 0.20) × (1 − 0.87) = × 0.1755 → 105.1   # D
with +50% ignite duration: stacks_ss = 8.25 → 898.1 before enemy; DPS per stack unchanged      # G/D
total Fireball DPS vs level-100 normal = 268.9 (hits) + 105.1 (ignite) = 374.0                 # D
```

## Common misconceptions / pitfalls
- Adding flat or weapon damage to ailments. Ailment base damage is fixed; ADE is 0 for the main DoTs. **A/G**
- Scaling Ignite from a melee skill with "increased melee damage" or "increased hit damage". **G**
- Using crit to scale DoT. DoT cannot crit. **G**
- Using outdated base damages: Maxroll's ailment page lists Frostbite 36, Poison 20, Time Rot 55 and "first 30 Frostbite stacks"; data says 50, 28, 60 and 15 stacks. Maxroll's damage-explained example (patch 0.8.5) uses Ignite 39; data says 40. **A**
- Applying the full −5% shred per stack to bosses. It is −2%. **G/A**
- Modelling Chill as `1 − 0.12 × n`. It is `0.88ⁿ`. **G**
- Assuming ailments benefit from attack speed per stack. Speed only increases application rate. **G/D**
- Forgetting that Spell-tagged ailments (Abyssal Decay, Ravage, Possess, Chained, Spirit Plague, Torment, Decrepify) do match Spell damage modifiers. **A/D**

## Open questions
- Whether "increased ailment effect" on damaging ailments whose `effectOfIncreasedEffectiveness` is `AdditionalPenetration` (Ignite, Bleed, Poison, Electrify, Frostbite…) becomes penetration (engine reading) or a damage multiplier (LE Tools assumption). **D?**
- The Frostbite guide text example (10% → 14% with 4 stacks) contradicts its own +20% per stack (would give 18%). Data: +0.2 per stack. **U**
- How the player stun bonus (melee ×3, other ×2, guide) relates to the hidden +100% increased stun chance for Melee|Bow (asset). **U**
- Exact multiplicative form of stun duration modifiers (IncreasedStunDuration vs ReceivedStunDuration vs Time Rot). **U**
- Whether ward counts in the stun denominator (1.1 notes say freeze takes ward into account; the stun image transcription includes it). **G?**
- Exact behaviour when a capped ailment replaces the oldest stack under the Season 5 refresh rule. **U**
- Shadow Daggers finisher: engine data 68 physical, ADE 3.4; Maxroll page 90 base, 340%. **U**

## Sources
- `vendor/lastepochbuilder/research/data/game/ailments.json` (all ailment rows: duration, maxInstances, baseDamage, addedDamageScaling, tags, buffs, boss/player penalties, buffScalingType, spread fields, effectOfIncreasedEffectiveness, additionalPenetrationDamageType).
- `vendor/lastepochbuilder/research/07a_assets_core_data.md` §0.2 (boss EH modifiers 0.5), §5 (ailment schema, ADE values, gaps closed).
- `vendor/lastepochbuilder/client/docs/ENGINE.md` §8.6 (chance, duration, effect, stack damage, DPS), §9.3 (curse_hit, dot components), §9.11 (automatic ailment averages, uptime, consumers), §10.2.
- `vendor/lastepochbuilder/research/02_le_formulas.md` §5.1–5.4 (ailment rules, DPS model, table, stun and freeze formulas and checks).
- `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.4 (Strong Mind, Frozen Ire constants).
- `vendor/lastepochbuilder/research/data/game/global_player_properties.json` (bossEffectiveHealthModifierVsStun/Freeze).
- `vendor/lastepochbuilder/research/data/game/classes.json` (hiddenBaseMods IncreasedStunChance, stun avoidance per level).
- `vendor/lastepochbuilder/research/data/game/abilities.json` (Fireball ignite chance 0.4).
- `vendor/lastepochbuilder/research/data/stat_tag_enums.json` (AilmentID enum).
- `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (AilmentMechanics, AilmentDurationandEffectiveness, ResistanceShred, ArmorShred, Bleed…TimeRot, Curse, Stun, Freeze).
- corpus `maxroll_ailments-explained.md` (https://maxroll.gg/last-epoch/resources/ailments-explained, updated 2026-04-02): "ailments cannot apply ailments", stale base values.
- corpus `maxroll_damage-explained.md` (https://maxroll.gg/last-epoch/resources/damage-explained): ailment scaling examples, Ignite 39 (0.8.5 data).
- corpus `dev_harbingers_of_ruin_patch_notes_1_1.md` (https://forum.lastepoch.com/t/last-epoch-harbingers-of-ruin-patch-notes/71790): bosses 50% more effective health vs stun and freeze, freeze takes ward into account.

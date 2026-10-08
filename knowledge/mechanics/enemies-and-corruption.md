# Enemies, Monster Scaling and Corruption
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Confidence legend: **D** = recovered from decompiled client code (via vendored weksil research), **A** = read from game asset data, **G** = official in-game guide text, **X** = community-verified (Maxroll 2026 / forum tests), **U** = unverified or inferred. Each formula and constant carries a label.
> A `?` suffix (for example **D?**) means the source itself marks the reading as ambiguous.

## Summary (10 lines max, the rules an agent must never get wrong)
1. Every monster has an unpenetrable damage reduction `damageReduction[level]` (0 at 1–6, 54% at 50, 75% at 75, 87% at 100) on hits and DoT; bosses/minibosses `DR + 0.05·(1 − DR)` (87.65% at 100). Dummies have 0. **D/A**
2. Monster damage at level L: `base × (1 + componentDamageModifier) × ownDamageMORE × (damageModifier[L] + 1) × 1.06 × origDmg[L] / origDmg[L0]`. **D?**
3. Rarity is MORE: magic Health ×2.15 / Damage ×1.6; rare Health ×(2.6 + L·hpl′) / Damage ×1.9. **D/A**
4. Corruption c: `f(c) = 0.6c` (c ≤ 100), else `0.002c^1.52 + 1.055c − 47.692955`; monsters get Health MORE `0.01·f`, hit Damage MORE `0.01·f`, DoT Damage MORE `0.005·f` (DoT grows half as fast), +`0.01·f` item rarity. **A/D**
5. At corruption 100: ×1.6 health and hit damage, ×1.3 DoT; at 300: ×3.80 / ×2.40; at 500: ×6.05 / ×3.53. **D**
6. Normal timelines: area level 62–90, corruption 0–50, +1 area level per 5 corruption (per 10 for timelines 7–10), max 100; empowered: level 100, corruption from 100, no maximum. **A/G**
7. Enemies penetrate player resistances by 1% per area level, max 75% at area level ≥ 75. **G/D**
8. Most enemies have 0% resistance and 0 armour unless mods, monolith modifiers or champions add them. **G**
9. Monster mod stat scale: `k = (rare ? 1 + rareModifier : 1) × (1 + effect) × (flatScaling + perUnit·x + perUnitSquared·x²)`, `x` = 0 / level / base health by `scalingType`; Capped mods use `min(effect, effectModifierCap)`. **D**
10. Boss ward: at health breakpoints (default 33% / 67%) bosses gain ward from max health and are briefly stunned; boss ward decays faster the longer it has existed. **G/A**

## Monster level tables

`actor_scaler.json → data.tables` (four float[101] arrays indexed by monster level; `monster_level_damage_reduction.json` is byte-identical to `damageReduction`). **D/A**

| Level | damageReduction | effectiveHealthModifier | damageModifier | originalDamageApproximation | Label |
|---|---|---|---|---|---|
| 0 | 0.000 | −0.090 | −0.050 | 1.30 | A |
| 5 | 0.000 | −0.065 | −0.029 | 1.80 | A |
| 10 | 0.060 | −0.040 | −0.016 | 2.46 | A |
| 15 | 0.135 | −0.015 | −0.036 | 3.24 | A |
| 20 | 0.210 | 0.010 | −0.056 | 4.20 | A |
| 25 | 0.285 | 0.060 | −0.076 | 5.20 | A |
| 30 | 0.340 | 0.110 | −0.096 | 6.20 | A |
| 35 | 0.390 | 0.145 | −0.108 | 7.12 | A |
| 40 | 0.440 | 0.175 | −0.118 | 7.94 | A |
| 45 | 0.490 | 0.205 | −0.125 | 8.66 | A |
| 50 | 0.540 | 0.240 | −0.130 | 9.36 | A |
| 55 | 0.590 | 0.290 | −0.135 | 9.90 | A |
| 60 | 0.632 | 0.340 | −0.130 | 10.40 | A |
| 65 | 0.672 | 0.390 | −0.125 | 10.90 | A |
| 70 | 0.712 | 0.440 | −0.120 | 11.40 | A |
| 75 | 0.750 | 0.490 | −0.115 | 11.90 | A |
| 80 | 0.780 | 0.540 | −0.095 | 12.40 | A |
| 85 | 0.810 | 0.640 | −0.045 | 13.10 | A |
| 90 | 0.830 | 0.740 | 0.020 | 13.85 | A |
| 95 | 0.850 | 0.840 | 0.085 | 14.60 | A |
| 100 | 0.870 | 0.950 | 0.157 | 15.25 | A |

DR shape: +1.5% per level from 7 to 26, +1% per level from 27 to 56, about +0.8% per level to 74, tapering to +0.4% per level near 100. **X** (Tunklab, matches the asset table)

### ActorScaler constants and formulas

| Constant | Value | Label |
|---|---|---|
| `globalEnemyHealthModifier` | 0.265 | A/D |
| `globalEnemyDamageModifier` | 0.06 | A/D |
| `bossHealthModifier` | 0.155 | A/D |
| `healthModifierForBossesAndMinibossesWithoutBossWard` | 1.1 | A/D |
| `bossDamageReductionImprovement`, `minibossDamageReductionImprovement` | 0.05 | A/D |
| `bossDamageReductionImprovementWithDynamicResistance` | −1.7 (use not traced) | A |
| base health polynomial a, b, c | 0.5, 5, 60 | A/D |
| ea, eb, ec | 0.11, 0.4, 6 (use not traced) | A |

```
levelDR(L)        = damageReduction[L]  ; boss/miniboss: DR + 0.05 × (1 − DR)                      # D
applied as ProtectionClass.fixedDamageReduction to hits and DoT                                   # D
effMod(L)         = (effectiveHealthModifier[L] + 1) × (1 + 0.265) − 1                             # D
health(L)         = (1 + effMod(L)) × (1 + unitHealth.healthMod) × (0.5L² + 5L + 60) × (1 − DR′) × Mb   # D? (UnitHealth mode 1)
Mb                = 1.155 boss ; × 2.1 for bosses/minibosses without boss ward                     # D
damage(L)         = Damage MORE (damageModifier[L] + 1) × 1.06 − 1                               # D
                  and Damage MORE originalDamageApproximation[L] / originalDamageApproximation[L0] − 1   # D
L0 = ActorData.level (the level the monster was authored at)                                      # D
```

Derived values (normal monster, `healthMod` 0; "dummy-equivalent" = health / (1 − DR), i.e. the damage a training-dummy number must reach). **D** (computed)

| Level | 0.5L²+5L+60 | effMod | health | dummy-equivalent health | damage factor (dm+1)·1.06 | damage vs L100 (same L0) | Label |
|---|---|---|---|---|---|---|---|
| 50 | 1560 | 0.569 | 1126 | 2447 | 0.922 | 0.462 | D |
| 62 | 2292 | 0.720 | 1388 | 3943 | 0.924 | 0.524 | D |
| 70 | 2860 | 0.822 | 1500 | 5210 | 0.933 | 0.569 | D |
| 75 | 3248 | 0.885 | 1530 | 6121 | 0.938 | 0.597 | D |
| 80 | 3660 | 0.948 | 1569 | 7130 | 0.959 | 0.636 | D |
| 85 | 4098 | 1.075 | 1615 | 8501 | 1.012 | 0.709 | D |
| 90 | 4560 | 1.201 | 1706 | 10037 | 1.081 | 0.801 | D |
| 95 | 5048 | 1.328 | 1762 | 11749 | 1.150 | 0.898 | D |
| 100 | 5560 | 1.467 | 1783 | 13715 | 1.226 | 1.000 | D |

## Monster rarity

`monster_rarity.json`, applied by `MonsterRarityManager.setActorRarity` (both stat changes are ModType 2 = MORE). **D/A**

| Field | magic | rare | Label |
|---|---|---|---|
| `increasedHealth` (Health MORE) | 1.15 | 1.6 | A |
| `increasedHealthPerLevel` | 0 | 0.02 | A |
| `additionalEffectiveHealthModifier` | 1 | 2.5 | A |
| `increasedDamage` (Damage MORE, untagged) | 0.6 | 0.9 | A |
| `increasedExperience` / per level | 0.5 / 0 | 2.0 / 0.04 | A |
| `increasedItemDrops` | 2.05 | 5.2 | A |
| `increasedSize` | 0.2 | 0.5 | A |
| prefix / suffix | 0 / 1 | 1 / 1 (+ guaranteed rare item drop) | A |

```
UnitHealth.effectiveHealthModifier += additionalEffectiveHealthModifier                            # D
hpl′ = increasedHealthPerLevel / (1 + 0.5 × effHM)   if healthSerialisation == 1 and effHM > 0     # D
Health MORE = increasedHealth + level × hpl′ ;  Damage MORE = increasedDamage                       # D
experience × (1 + inc + level × incPerLevel) ; drop chance × (1 + increasedItemDrops), overflow → quantity   # D
```

Example: rare at level 100 with effHM 2.5 → hpl′ = 0.02 / 2.25 = 0.00889 → Health MORE +2.489 (×3.489), Damage ×1.9. Magic ×2.15 health matches Tunklab. **D/X**

## Corruption and the monolith

```
f(c) = 0.6 × c                                      c ≤ 100                                       # D (EchoWeb.GetMonsterPowerMultiplierFromCorruption)
f(c) = 0.002 × c^1.52 + 1.055 × c − 47.692955        c > 100                                       # D
"Monster Power From Corruption Mod": Health MORE 0.01, Damage MORE 0.01 (Hit), Damage MORE 0.005 (DoT),
    increasedItemRarity 0.01, each × f(c)                                                          # A/D
monster health × (1 + 0.01·f) ; hit damage × (1 + 0.01·f) ; DoT damage × (1 + 0.005·f)             # D
```

| Corruption | f(c) | Health and hit damage | DoT damage | Label |
|---|---|---|---|---|
| 0 | 0 | ×1.00 | ×1.00 | D |
| 50 | 30.0 | ×1.30 | ×1.15 | D |
| 100 | 60.0 | ×1.60 | ×1.30 | D |
| 150 | 114.6 | ×2.15 | ×1.57 | D |
| 200 | 169.6 | ×2.70 | ×1.85 | D |
| 250 | 224.9 | ×3.25 | ×2.12 | D |
| 300 | 280.5 | ×3.80 | ×2.40 | D |
| 400 | 392.3 | ×4.92 | ×2.96 | D |
| 500 | 505.1 | ×6.05 | ×3.53 | D |
| 600 | 618.7 | ×7.19 | ×4.09 | D |
| 800 | 848.0 | ×9.48 | ×5.24 | D |
| 1000 | 1079.9 | ×11.80 | ×6.40 | D |

Corruption also increases item rarity, experience, Timeline Stability gained, guaranteed-reward rarity in empowered, and slightly the odds of Legendary Potential / Weaver's Will on uniques. **G**

### Timelines (`monster_mods.json → timelines`)

```
area level = additionalCorruptionEffect == Level ? min(level + floor(c / corruptionRequiredPerLevel), 100) : level   # D
```

| Timeline | Normal level | Corruption range | Corruption per +1 level | Level at 50 corruption | Empowered | Label |
|---|---|---|---|---|---|---|
| 1 Fall of the Outcasts | 62 | 0–50 | 5 | 72 | 100, c ≥ 100 | A/D |
| 2 The Stolen Lance | 66 | 0–50 | 5 | 76 | 100, c ≥ 100 | A/D |
| 3 The Black Sun | 70 | 0–50 | 5 | 80 | 100, c ≥ 100 | A/D |
| 4 Blood, Frost, and Death | 74 | 0–50 | 5 | 84 | 100, c ≥ 100 | A/D |
| 5 Ending the Storm | 78 | 0–50 | 5 | 88 | 100, c ≥ 100 | A/D |
| 6 Fall of the Empire | 82 | 0–50 | 5 | 92 | 100, c ≥ 100 | A/D |
| 7 Reign of Dragons | 85 | 0–50 | 10 | 90 | 100, c ≥ 100 | A/D |
| 8 The Last Ruin | 90 | 0–50 | 10 | 95 | 100, c ≥ 100 | A/D |
| 9 The Age of Winter | 90 | 0–50 | 10 | 95 | 100, c ≥ 100 | A/D |
| 10 Spirits of Fire | 90 | 0–50 | 10 | 95 | 100, c ≥ 100 | A/D |

- Empowered timelines use `additionalCorruptionEffect = RewardRarity` (corruption raises reward rarity, not area level). **A**
- Gaze of Orobyss: each stack adds 12 corruption when a Shade of Orobyss is killed; up to 4 consumed per Shade; dying to the Shade loses 1; gained by killing empowered timeline bosses. **G**
- Empowered blessings: 4 options, a 5th at 200 corruption. Shade-only uniques: Shattered Chains at 150, Omnis at 200. **G/X**
- Echo modifiers persist 1–3 echoes and stack; experience bonuses from modifiers and corruption do not apply below level 50. **G**

## Monster mods (`monster_mods.json`, 239 records)

| Field | Values in data | Label |
|---|---|---|
| `modType` | Prefix 2, Suffix 23, Monolith 212, Dungeon, EventActor, TimeBeast 2 | A |
| `scalingType` | None 229, Level 9, Health 1 | A |
| `effectModifierEffect` | Full 230, Capped 8, CappedPartial 1 (also None, Partial) | A |
| `effectModifierCap` (Capped mods) | 0.75, 1, 2, 3 | A |
| `rareModifier` | e.g. 0.1 on "Increased Damage", 0.2 on "Added Health Regen" | A |

```
k = (isRare ? 1 + rareModifier : 1) × (1 + effect) × (flatScaling + perUnit·x + perUnitSquared·x²)     # D
x = 0 (None) | monster level (Level) | base health (Health)                                           # D
Capped: effect = min(effect, effectModifierCap) ; None: effect = 0 ;                               # D
Partial modes: (1 + effect) skipped for statsWithoutEffectModifier                                   # D
```

| Mod (suffix) | Stat | Scaling | Value at level 100 (normal / rare) | Label |
|---|---|---|---|---|
| Increased Damage | Damage INCREASED 0.4 | Level, flat 1, perUnit 0.0025, rare +0.1 | 0.4 × 1.25 = +50% / +55% | A/D |
| Increased Health | Health INCREASED 0.6 | Level, flat 1, perUnit 0.01 | 0.6 × 2.0 = +120% | A/D |
| Increased Attack Speed | AttackSpeed and CastSpeed INCREASED 0.4 | Level, flat 1, perUnit 0.005 | +60% | A/D |
| Increased Movement Speed | Movespeed INCREASED 0.4 | Level, flat 1, perUnit 0.005 | +60% | A/D |
| Shorter Cooldowns (prefix) | IncreasedCooldownRecoverySpeed 0.7 | Level, flat 1, perUnit 0.005 | +105% | A/D |
| Added Dodge Rating | DodgeRating +5 | Level, flat 0, perUnit 1 | +500 | A/D |

| Monolith mod (Capped) | Stats | Cap | Label |
|---|---|---|---|
| All Resistances | AllResistances +0.25 | 2 | A |
| Crit Chance | CriticalChance +0.15 | 3 | A |
| Crit Avoidance and Inc Health | Health INC 0.15, CritAvoidance +0.35 | 0.75 | A |
| DR On High Health | DamageTaken MORE −0.25 (HighLife) | 1 | A |
| Glancing Blow | GlancingBlowChance +0.5 | 1 | A |
| Endurance (CappedPartial) | Endurance +0.3, MaximumHealthGainedAsEnduranceThreshold MORE 0.35 | 1 | A |
| Mark For Death | AilmentChance +0.4 | 3 | A |

Soul Gambler mods (Monolith type): T2 Damage and Health INCREASED 0.5, T3 0.8, T4 1.8. **A**

## Monster damage reference (`monster_damage.json`)

Average hit per category of 261 normal monolith-spawning monsters, authored-level-normalised to level 100 (before the client's `(damageModifier[L] + 1) × 1.06` factor, corruption and rarity). Monsters weighted equally. **A** (method **D?**)

| Category | Samples | Mean | Median | 10% trimmed mean | Crit chance mean | Crit multiplier mean | Label |
|---|---|---|---|---|---|---|---|
| melee | 616 | 100.1 | 79.2 | 87.58 | 4.94% | 1.984 | A |
| spell | 360 | 212.2 | 117.3 | 129.62 | 4.78% | 1.936 | A |
| ranged | 51 | 45.7 | 48.2 | 42.39 | 5.00% | 2.000 | A |
| DoT (per second) | 88 | 169.4 | 136.4 | 151.03 | — | — | A |

```
raw hit at area 100 = sample × 1.2264 × rarity MORE × (1 + 0.01·f(c)) × monolith mod MOREs            # D?
example: melee trimmed mean, rare, corruption 300 = 87.58 × 1.2264 × 1.9 × 3.805 = 776.5                # D?
```

## Boss ward

| Constant (`global_player_properties.json`) | Value | Label |
|---|---|---|
| `bossWardGainModifier` | −0.25 | A |
| `bossWardPercentDecay` | 0.04 | A |
| `bossWardPercentDecayPerSecond` | 0.005 | A |
| `bossWardPercentDecayPerSquareSecond` | 3e−5 | A |
| `baseBossWardDecayEffectiveTimeDivisor` | 0.75 | A |
| `bossWardDecayEffectiveTimeDivisorPerEffectiveHealthMultiplier` | 0.0075 | A |
| `defaultBreakpoints` | 0.33, 0.67 of max health (bosses may define custom, e.g. Abomination 0.25 / 0.5 / 0.75) | A |
| `bossEffectiveHealthModifierVsStun` / `…VsFreeze` | 0.5 (bosses count 1.5× health for stun and freeze) | A |

Decay model consistent with every `boss_ward.json → wardDecay` record (divisor, `timeScaleK`, `secondsToZeroNoRetentionNoRegen`): **U** (assembled; formula doc 07j not vendored)

```
divisor = 0.75 + 0.0075 × (1 + effectiveHealthModifier)                                             # A (matches all records)
k       = (1 + bossWardDecayEffectiveTimeModifier) / divisor ;  t′ = k × t                            # A/U
fraction of gained ward lost per effective second = 0.04 + 0.005·t′ + 3e−5·t′²                        # U
→ ward reaches 0 at t′ = 13.32, i.e. t = 13.32 / k seconds (Abomination effHM 80: 18.1 s; Harbinger of Regret: 67.5 s)   # A/U
```

- Guide: boss ward decays faster the longer it has existed (unlike player ward, which decays faster the more you have). When a notch is consumed the boss gains ward based on max health and is stunned briefly. Not all bosses have boss ward. **G**
- 1.1 notes: bosses no longer have variable damage reduction based on damage-taken rate; most bosses have two breakpoints, chapter/timeline/dungeon bosses more. **G**

## Worked example

DPS needed to kill a level-100 rare monster in an empowered monolith at corruption 300 in 2 seconds (no resistances, no modifiers; `healthMod` 0). **D** (inputs from tables; `healthMod` assumption **U**)

```
health(100)      = (1 + 1.4667) × 5560 × (1 − 0.87) = 1783                                         # D?
rare Health MORE = 1.6 + 100 × 0.02 / (1 + 0.5 × 2.5) = 2.489 → × 3.489                            # D
corruption 300   = × (1 + 0.01 × 280.46) = × 3.805                                                 # D
actual health    = 1783 × 3.489 × 3.805 = 23,670                                                    # D
damage needed    = 23,670 / (1 − 0.87) = 182,080 dummy-equivalent damage                            # D
in 2 s           = 91,040 dummy DPS, or 11,835 DPS as shown after level DR                          # D
the same rare's melee hit ≈ 776 physical before player defenses (see defenses.md)                    # D?
```

## Common misconceptions / pitfalls
- Comparing dummy DPS with monster health: multiply dummy damage by `1 − DR` (×0.13 at level 100) or compare against the dummy-equivalent health. **D/X**
- Treating corruption as linear above 100. `f(c)` grows faster than linear: corruption 300 is ×3.80, not ×2.8. **D**
- Scaling DoT danger with corruption at the hit rate. Monster DoT gains half the corruption multiplier. **A/D**
- Adding rarity multipliers as increased. Both are MORE. **D**
- Assuming level DR is penetrable or shred-able. It is a fixed DR outside resistances. **D/X**
- Assuming enemy resistance above 75% keeps reducing damage: the multiplier is fixed at 0.25 above 75% (penetration is then added). **D**

## Open questions
- `unitHealth.healthMod` per monster and the meaning of `DR′` in the health formula (only UnitHealth mode 1 traced). **D?**
- Which code path is active for normal spawns: `MonsterRarityManager.setActorRarity` (traced) vs `MonsterRarity.makeMonsterMemberOfRarity` component fields. **D?**
- Source of `effect` for monolith echo mods (`modEffectivenessFormulae` are zero in the timeline-1 record). **U**
- `statsWithoutEffectModifier` semantics (bit mask vs count). **D?**
- Use of `bossDamageReductionImprovementWithDynamicResistance (−1.7)` and constants `ea/eb/ec`. **U**
- Exact boss ward gain amount per breakpoint (role of `bossWardGainModifier −0.25`). **U**
- Whether champions, omen and harbinger monsters use additional multipliers beyond rarity (excluded from the damage reference). **U**

## Sources
- `vendor/lastepochbuilder/research/data/game/actor_scaler.json` (four level tables, constants, formulas).
- `vendor/lastepochbuilder/research/data/monster_level_damage_reduction.json` (DR table, boss rule).
- `vendor/lastepochbuilder/research/data/game/monster_rarity.json` (magic/rare fields, formulas).
- `vendor/lastepochbuilder/research/data/game/monster_mods.json` (mod records, statScale/corruption/monolithLevel formulas, timelines).
- `vendor/lastepochbuilder/research/data/game/monster_damage.json` (category statistics, schema notes on what is not applied).
- `vendor/lastepochbuilder/research/data/game/boss_ward.json` (breakpoints, derived decay records) and `vendor/lastepochbuilder/research/data/game/global_player_properties.json` (boss ward and boss EH constants).
- `vendor/lastepochbuilder/research/07a_assets_core_data.md` §0.4–0.6, §4.1–4.3, §10 (rarity order, corruption mod, actor scaler, unresolved items).
- `vendor/lastepochbuilder/research/02_le_formulas.md` §6.4–6.5 (level DR shape, Tunklab health/damage functions, corruption scaling).
- `vendor/lastepochbuilder/client/docs/ENGINE.md` §6.2 (`level_dr`), §10.1 (attack presets, damage at area level L, corruption more).
- `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (Penetrations, CorruptionandtheShade, GazeOfOrobyss, Blessings, EchoModifiers, EmpoweredTimelines, BossWard, Stun, Freeze).
- corpus `dev_harbingers_of_ruin_patch_notes_1_1.md` (https://forum.lastepoch.com/t/last-epoch-harbingers-of-ruin-patch-notes/71790): boss ward introduction, bosses 50% more effective health vs stun and freeze.
- corpus `maxroll_monolith_empowered-guide.md` (https://maxroll.gg/last-epoch/monolith/empowered-guide): empowered rules, corruption-gated uniques, 200-corruption blessing option.

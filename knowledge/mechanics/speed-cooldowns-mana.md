# Speed, Cooldowns and Mana
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Confidence legend: **D** = recovered from decompiled client code (via vendored weksil research), **A** = read from game asset data, **G** = official in-game guide text, **X** = community-verified (Maxroll 2026 / forum tests), **U** = unverified or inferred. Each formula and constant carries a label.
> A `?` suffix (for example **D?**) means the source itself marks the reading as ambiguous.

## Summary (10 lines max, the rules an agent must never get wrong)
1. `uses/s = S × speedMultiplier × 1.1 / useDuration`, where `S = 1 × (1 + Σinc speed + tree inc speed) × Πmore` for the skill's `speedScaler`. **D** (matches LE Tools `as` values **X**)
2. `speedScaler`: 2 = AttackSpeed, 3 = CastSpeed, 54 = None (S = 1 + tree increased speed only). **A/D**
3. Melee attacks, and bow attacks with a bow, multiply S by the weapon `attackRate` (dual wield: average of both); throwing attacks and spells do not. **D/X**
4. Skill-tree "increased attack/cast speed" is increased (additive with gear), not more; tree "more speed" fields multiply. **D**
5. Cooldown `= (base + addedLength) × (1 + incLength) / ((1 + ΣCDR + treeCDR) × (1 + moreCDR))`; steady-state `uses/s = min(speed rate, 1/cooldown)`; charges only affect bursts. **D**
6. `cooldown` in data = `1 / chargesGainedPerSecond`; `maxCharges` is the burst size. **A**
7. Trigger frequency = event rate × chance × count, never above `count / icd`. **D**
8. Chill multiplies the target's attack, cast and move speed by 0.88 per stack (0.94 vs bosses/players), 3 stacks. **G/A**
9. Players have a hidden 5% more movement speed, minions 10% more. **A**
10. `speedScalerAppliedAsIncrease` skills use `S' = max(S − 1, 0) × speedScalerEffectiveness + 1`; `maximumUseSpeed > 0` caps S. **D**

## 1. Ability speed fields (`abilities.json`)

| Field | Meaning | Label |
|---|---|---|
| `useDuration` | seconds per use at S = 1 before the 1.1 factor; 103 of 182 player skills use 0.75 | A |
| `useDelay` | time into the use when the effect fires (animation point); not part of the rate formula | A/D |
| `speedScaler` / `speedScalerName` | SP that scales the skill: AttackSpeed (56 skills), CastSpeed (106), None (20) | A |
| `speedMultiplier` | per-skill rate multiplier (Javelin 1.6, Lunge 2.0, Flurry 1.09, Meteor 0.8) | A |
| `maximumUseSpeed` | cap on S when > 0 | A/D |
| `speedScalerAppliedAsIncrease`, `speedScalerEffectiveness` | partial-scaling skills | A/D |
| `instantCastForPlayer` | no division by useDuration (Static = 1) | A/D |
| `hasMinimumUseDuration`, `minimumUseDuration` | lower bound on the use time | A |
| `channelled`, `channelCost`, `noManaRegenWhileChanneling`, `channelTimeLimit` | channelling | A |
| `manaCost`, `minimumManaCost`, `freeWhenOutOfMana`, `manaCostPerDistance` | mana | A |
| `maxCharges`, `chargesGainedPerSecond`, `cooldown` (= 1/chargesGainedPerSecond), `sharedCooldown` | cooldown | A |

## 2. Use rate

```
q        = Stats.query(speedScaler, skill tags, ability index)                                 # D
S        = q.added × (1 + q.increased + tree_inc_speed) × q.more                                # D
           q.added base = 1.0 (hidden BaseStats AttackSpeed/CastSpeed ADDED 1)                  # A
None scaler: S = 1 + tree_inc_speed                                                              # D
AttackSpeed and (Melee, or Bow with a bow): S ×= weapon attackRate (two weapons: average)        # D/X
speedScalerAppliedAsIncrease: S = max(S − 1, 0) × speedScalerEffectiveness + 1                   # D
maximumUseSpeed > 0: S = min(S, maximumUseSpeed)                                                 # D
S ×= tree_more_speed  (Π(1 + more*Speed fields))                                                # D
speedScale = S × speedMultiplier × 1.1    (≤ 0 → 0.1)                                            # D
uses/s     = speedScale / useDuration      (instantCastForPlayer: no division)                   # D
```

| Skill | Scaler | useDuration | speedMultiplier | Base uses/s at S = 1 | Label |
|---|---|---|---|---|---|
| Fireball | CastSpeed | 0.75 | 1.0 | 1.4667 | A/D |
| Smite | CastSpeed | 0.75 | 1.0 | 1.4667 | A/D |
| Meteor | CastSpeed | 0.70 | 0.8 | 1.2571 | A/D |
| Disintegrate (channel) | CastSpeed | 0.20 | 1.0 | 5.5 (start of channel only) | A/D |
| Javelin (throw) | AttackSpeed, no weapon rate | 1.20 | 1.6 | 1.4667 | A/D |
| Shurikens (throw) | AttackSpeed, no weapon rate | 0.75 | 1.0 | 1.4667 | A/D |
| Flurry (melee) | AttackSpeed × weapon | 0.94 | 1.09 | 1.2755 × attackRate | A/D |
| Lunge (melee) | AttackSpeed × weapon | 1.00 | 2.0 | 2.2 × attackRate (CD 4 s) | A/D |

- Increased attack speed, cast speed, and the tag-specific variants (melee/throwing/bow attack speed) add together in the increased pool; their tags must match the skill. **D/X**
- Frenzy: +20% increased attack and cast speed (1 s buff). Haste: +30% increased movement speed. **A**
- A skill that "converts attack speed to damage" (Dancing Strikes) or does not scale the DoT with cast speed (Disintegrate scales only the channel start) is a per-skill exception. **X**

### 2.1 Weapon attack rates (`items.json` subtypes)

| Base type | `attackRate` values | Label |
|---|---|---|
| 1H Axes | 0.92, 0.96, 0.98, 1.05, 1.09 | A |
| 1H Dagger | 1.10, 1.14, 1.18 | A |
| 1H Maces | 0.94, 0.98 | A |
| 1H Scepter | 0.94, 0.98 | A |
| 1H Swords | 1.08, 1.10, 1.12, 1.16, 1.20, 1.24 | A |
| Wands | 1.02 | A |
| 2H Axes | 0.89, 0.92, 0.95, 1.02 | A |
| 2H Maces | 0.86, 0.88, 0.90 | A |
| 2H Polearm | 0.94, 0.98, 1.02 | A |
| 2H Staff | 0.92, 0.98 | A |
| 2H Swords | 0.76, 1.02, 1.06, 1.10 | A |
| Bows | 0.90, 0.92, 0.95, 0.98, 1.05, 1.10 | A |

`attackRate` is applied as a multiplier on AttackSpeed (`CharacterStats.getPropertyMultiplier`). **D** Crossbow (24) and 1H Fist (11) are disabled base types. **A**

## 3. Cooldowns and charges

```
length   = (baseCooldown + addedCooldownLength) × (1 + increasedCooldownLength)                  # D
recovery = (1 + Σ IncreasedCooldownRecoverySpeed SP70 + tree increasedCDR) × (1 + tree moreCDR)  # D
cooldown = length / recovery                                                                     # D
steady state: uses/s = min(uses/s from speed, 1 / cooldown)                                      # D
charges: burst of maxCharges uses, then 1 / cooldown                                             # D
```

| Constant / example | Value | Label |
|---|---|---|
| Evade | 2 charges, 4 s cooldown, +0.5% increased CDR per character level → 4 / 1.5 = 2.67 s at level 100 | G |
| Traversal skills | do not share cooldown with Evade | G |
| Volcanic Orb | cooldown 3.03 s | A |
| Static | 1 charge, 0.25 charges/s → 4 s | A |
| Lunge | 1 charge, 0.25 charges/s → 4 s | A |
| Warpath | 1 charge, 2 charges/s → 0.5 s; channelled, 18 mana/s | A |
| Disintegrate | 1 charge, 1.25 charges/s → 0.8 s; channelled, 18 mana/s | A |
| Inspiration buff | +20% increased cooldown recovery speed (AilmentID 45) | A |
| Dexterity (corrupted "Guile") | +0.3% increased CDR for movement skills per point | A |

- Tree nodes call `SetCooldown` / `GiveCooldown` (45 nodes give a skill a cooldown it did not have, e.g. Javelin rain: 1 charge, 6 s) and `RemoveCooldown` (Focus No Cooldown). **D**
- Cooldown and CDR queries pass the skill's AbilityID, so "increased cooldown recovery speed for Skill X" (`extraTag`) applies only to X. **D**
- Minions with multiple abilities use the first ready ability with a cooldown/charge whenever available; the first ability without a cooldown fills the rest of the time. **D/G**

## 4. Channelled skills

- Channel cost is paid per second: `channelCost` (Warpath 18, Disintegrate 18). **A**
- Damage cadence of a channel is skill-specific (tick intervals in mutators); community model: `APS = 1 / channelInterval × (1 + speed) × dpsMod`. **X**
- Tree ailment chances on channels are pre-divided by the tick (Warpath/Bladestorm `p·k/0.6`; Disintegrate `p·0.4·0.25` per 0.25 s tick). **D**
- Void Knight echoes do not repeat channelled skills; Warpath echoes only with its node, once per second when you moved ≥ 4 units in 2 s. **D**

## 5. Mana costs

```
cost       = (manaCost + addedManaCost) × (1 + increasedManaCost)                                # D (engine; mana stats not modelled)
cost_full  = (manaCost + Σadded) × (1 + Σinc) × Πmore / (1 + ManaEfficiency SP69), floor 0        # X (LE Tools)
channel/s  = (channelCost + added) × (1 + inc) / (1 + manaEff) × (1 + ChannelCost SP25 %)         # X (LE Tools)
mana spent/s = cost × uses/s (+ channel/s while channelling)                                     # D
```

- Base mana regen 8/s, not level-scaled; regen continues at negative mana. **G**
- Example costs: Fireball 3, Smite 3, Javelin 9, Shurikens 3, Static 15, Lunge 8, Meteor 56, Volcanic Orb 50. **A**
- Full mana model and negative-mana rules: [ward-health-sustain.md](ward-health-sustain.md#6-mana). **G/X**

## 6. Trigger frequency

```
event rates:  use / cast / end = uses/s ; hit = uses/s × hits per use ;                     # D
              crit = hit rate × crit chance ; second = 1 ; kill = kills/s input ;
              hit_taken / block / dodge / potion / minion_hit / minion_death / stun = inputs         # D
frequency   = event × chance × count,  capped at count / icd                                    # D
triggered use: computed as a use of the triggered skill at `frequency` uses/s, chained ≤ 3 levels   # D
item "chance to cast X on use/cast/end" does not fire from a triggered use                       # D
```

- Chance-to-cast stats: SP126 ChanceToCastForAbility, SP127 ChanceToCastForTags (`specialTag` 1 = on hit, 2 = on crit; `tags` = required skill tags; `extraTag` = cast ability). **D**
- Proc ICDs: field `…Cooldown` from the CharacterMutator constructor, or ProcTimeTracker "N times per T s". **D**
- Example constants: Keeper's Gloves 10% chance, 8 s ICD; Arboreal Circuit 10%, 15 s; Volcanus 30% on melee hit; Bone Harvester 20% on kill; Torch of the Pontifex 100% on kill. **D**

## 7. Projectiles, repeats, echoes

```
hits on target per use (shotgun allowed) = 1 (one) | (1 + N)/2 (average) | N (all)   ; no shotgun: 1   # D
shadow copies: per_use × shadows (≤ 3 + CreateShadow property 0) ; shadows last ≤ 5 s             # D
echo copies (Void Knight): per_use × echo chance (mastery 10% + passives)                        # D
```

Extra projectiles and the explosions they create share one hit list per use when the skill has a shared hit detector, so they cannot stack on one target unless the skill can shotgun (Multishot `canShotgun`, Shurikens `shotgun`). **D**

## 8. Movement speed

| Source | Value | Label |
|---|---|---|
| Player hidden base | Movespeed MORE +0.05 | A |
| Minion hidden base | Movespeed MORE +0.10 (Minion tag) | A |
| Haste | +30% increased | A |
| Shrine Haste | +30% increased move, attack and cast speed, 60 s | A |
| Enrage | +35% increased move, +60% attack and cast speed | A |
| Chill | 12% less per stack (6% vs bosses/players), 3 stacks, multiplicative | G/A |
| Slow | 20% less per stack (10% vs bosses/players), 3 stacks, multiplicative | G/A |
| Root | Movespeed MORE −0.93, 0.7 s | A |

Movement speed is reported as `query(Movespeed).more − 1`; increased movement speed adds inside its own pool. **D**

## Worked example

Rogue with Flurry (melee, `useDuration 0.94`, `speedMultiplier 1.09`) dual-wielding a 1.14 dagger and a 1.24 sword, 75% increased attack speed from gear and passives, a tree node granting 15% increased attack speed, Frenzy up, enemy unaffected. **A** inputs from data; build values illustrative **U**.

```
weapon rate = (1.14 + 1.24) / 2 = 1.19                                                     # X/D
S           = 1 × (1 + 0.75 + 0.15 + 0.20 Frenzy) × 1.19 = 2.10 × 1.19 = 2.499                # D
uses/s      = 2.499 × 1.09 × 1.1 / 0.94 = 3.187                                             # D
Same with 2× Chill on you (player penalty: 6% less per stack): × 0.94² = 0.8836 → 2.816     # G/D
Lunge in the same build: speed rate 2.10 × 1.19 × 2.0 × 1.1 / 1.0 = 5.50 uses/s,
  cooldown 4 s / (1 + 0.30 CDR) = 3.08 s → steady state 0.325 uses/s                         # D
A 20% chance-to-cast-on-hit trigger with 1 s ICD on Flurry at 3 hits per use:
  event = 3.187 × 3 = 9.56 hits/s ; frequency = min(9.56 × 0.20, 1/1) = 1.0 casts/s          # D
```

## Common misconceptions / pitfalls
- Applying weapon attack rate to throwing attacks or spells. **D**
- Treating tree "increased attack speed" as more (only tree damage nodes behave as more). **D/G**
- Forgetting the 1.1 factor: a 0.75 s `useDuration` skill is 1.4667 uses/s, not 1.333. **D/X**
- Assuming more charges raise sustained rate. Only cooldown recovery raises it. **D**
- Computing cooldown as `base × (1 − CDR)`. It is `base / (1 + CDR)`. **D/G**
- Counting a trigger beyond its ICD cap. **D**
- Using dual-wield as the sum of both weapons' rates. It is their average. **X/D**

## Open questions
- The origin of the 1.1 factor in `speedScale` (06e is not vendored); it reproduces LE Tools' `as` values. **D?**
- Whether `useDelay` affects the sustained rate for any skill class (e.g. instant-cast or movement skills). **U**
- Mana efficiency: division `/(1 + eff)` (community) vs multiplication `(1 − eff)`; not modelled from code. **U**
- Per-skill channel tick intervals and how cast speed scales them. **U**
- The shared companion cap across companion skills and Bone Golem extra golems (engine notes these as not read). **D?**

## Sources
- `vendor/lastepochbuilder/client/docs/ENGINE.md` §8.3 (speed, cost, cooldown), §9.3–9.4 (components, minion attack frequency, ability choice), §9.6 (trigger frequency and cooldown), §9.9–9.10 (projectiles, shadows, echoes).
- `vendor/lastepochbuilder/research/07b_assets_abilities_trees.md` §2.1 (speed, mana, cooldown, channel fields; throws use AttackSpeed without weapon rate).
- `vendor/lastepochbuilder/research/07c_skill_mutators.md` §1 (cooldown fields, SetCooldown/GiveCooldown), §4.5 (tick-scaled chances), §4.9 (cooldown nodes).
- `vendor/lastepochbuilder/research/07a_assets_core_data.md` §2.1 (hiddenBaseMods), §7.1 (`attackRate` multiplier, disabled bases).
- `vendor/lastepochbuilder/research/07i_unique_formulas.md` §2 (proc ICD patterns), `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.4 (proc chances and ICDs).
- `vendor/lastepochbuilder/research/02_le_formulas.md` §4 (speed, cooldown, mana, channel; LE Tools `baseRate` formula).
- `vendor/lastepochbuilder/research/data/game/abilities.json` (Fireball, Smite, Meteor, Disintegrate, Javelin, Shurikens, Flurry, Lunge, Static, Warpath records).
- `vendor/lastepochbuilder/research/data/game/items.json` (weapon subtype `attackRate`, `disabledBaseTypesToRoll`).
- `vendor/lastepochbuilder/research/data/game/classes.json` (hiddenBaseMods: AttackSpeed/CastSpeed ADDED 1, Movespeed MORE 0.05 / 0.10).
- `vendor/lastepochbuilder/research/data/game/ailments.json` (Chill, Slow, Frenzy, Haste, Enrage, Root, Inspiration, shrine buffs).
- `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (Evade, Chill, Slow, ManaAndRegen, Minions).
- `vendor/corpus/maxroll_damage-explained.md` (https://maxroll.gg/last-epoch/resources/damage-explained): attack vs cast speed equations, dual-wield averaging, Disintegrate and Dancing Strikes exceptions.

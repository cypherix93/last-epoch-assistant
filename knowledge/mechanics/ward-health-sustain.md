# Ward, Health and Sustain
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Confidence legend: **D** = recovered from decompiled client code (via vendored weksil research), **A** = read from game asset data, **G** = official in-game guide text, **X** = community-verified (Maxroll 2026 / forum tests), **U** = unverified or inferred. Each formula and constant carries a label.
> A `?` suffix (for example **D?**) means the source itself marks the reading as ambiguous.

## Summary (10 lines max, the rules an agent must never get wrong)
1. `maxHealth = RoundHalfEven((100 + 10·L + 6·Vit + Σadded) × (1 + Σinc) × Πmore)`; the guide's "+8 per level" is stale. **A/D**
2. Ward decay per second = `(5e−5·(W − T)² + 0.2·(W − T)) / (1 + 0.5·R)` with T = ward decay threshold, R = ward retention as a fraction (100% = 1.0); no decay below T. **G/A**
3. Steady-state ward for generation G/s: `W = T + (−0.2 + sqrt(0.04 + 2e−4·G·(1 + 0.5R))) / 1e−4`. **D** (derived)
4. Leech = post-mitigation damage dealt × leech fraction, capped by the target's remaining health, paid linearly over `3 / (1 + IncreasedLeechRate)` s per instance, no cap on simultaneous instances. **G/D**
5. A HealthLeech stat value v means `0.1·v` of damage (data 0.3 = tooltip "3%"); component `additionalLeech` is 1:1. **D**
6. `healthRegen = (6 + 0.14·L + Σadded) × (1 + Σinc) × Πmore`; mana regen base 8, no level scaling. **A/G**
7. `maxMana = RoundHalfEven((50 + 0.50506·L + 2·Att + Σadded) × (1 + Σinc) × Πmore)`. **A/D**
8. Increased healing effectiveness (SP44) does not affect leech, on-hit/kill/block gains, or regeneration. **D**
9. You can cast while mana > 0 even if the cost exceeds it (mana goes negative); at ≤ 0 mana, skills costing ≥ 1 mana are blocked and mana-before-health stops working. **G**
10. Endurance does not reduce damage to ward; ward absorbs before health; mana-before-health does not protect ward. **G**

## 1. Health

```
maxHealth = RoundHalfEven((baseHealth + L·healthPerLevel + Σadded Health SP7) × (1 + Σinc) × Π(1 + more))   # D
baseHealth = 100, healthPerLevel = 10 (int), L = character level (not L − 1)                  # A/D
Vitality: +6 added Health per point                                                           # A/G
Only untagged Health mods count for the player (tags 0, extraTag 0, specialTag 0)             # D
```

| Level | Base health (no Vitality, no gear) | Label |
|---|---|---|
| 1 | 110 | A/D |
| 50 | 600 | A/D |
| 75 | 850 | A/D |
| 100 | 1100 | A/D |

- Guide `Levels`: "+10 Health per level (total +990 at level 100)", consistent with data. Guide `HealthAndRegen`: "+8 health per level" contradicts data (all 5 classes store 10). Chosen: 10. **A/G**
- Low health ≤ 35% of max, high health ≥ 65%, "recently" = 4 s. **G**
- Hybrid health (added + increased on one affix) exists only as a shard for gloves, boots, belts. **X**

## 2. Health regeneration

```
healthRegen = (6 + 0.14·L + Σadded HealthRegen SP17) × (1 + Σinc) × Πmore    per second      # A/D
```

- Base at level 100: 6 + 14 = 20/s. Guide says +0.125/level (total +12); data says 0.14 for every class. Chosen: 0.14. **A** (G conflicts)
- Damned on the target: −20% increased health regen per stack (stacks unlimited). **A**
- Regeneration is not scaled by increased healing effectiveness (`BaseHealth.OnUpdateTick`). **D**

## 3. Ward

### 3.1 Decay

```
d          = max(0, W − T)                     T = WardDecayThreshold SP119 (added)            # G/D
decay(W)   = (quadraticWardDecay·d² + linearWardDecay·d) / (1 + 0.5 × R)    per second        # G/A
quadraticWardDecay = 5e−5 ; linearWardDecay = 0.2                                              # A
R          = WardRetention SP16 as a fraction (Intelligence +0.02 per point)                   # A/G
minimumWardDecayWithoutRegen = 0.5 ward/s (applies only when ward regeneration SP92 is 0)      # A (semantics D?)
pre-1.1 formula (superseded): 0.4·W / (1 + 0.5·R)                                               # G
```

| Ward W (T = 0) | decay/s at R = 0 | R = 1 (100%) | R = 2 | Label |
|---|---|---|---|---|
| 500 | 112.5 | 75.0 | 56.3 | D |
| 1000 | 250.0 | 166.7 | 125.0 | D |
| 2000 | 600.0 | 400.0 | 300.0 | D |
| 4000 | 1600.0 | 1066.7 | 800.0 | D |

Guide check: 500 threshold with 1000 ward gives decay 112.5/s vs 250/s without threshold (the guide calls this "halved"). **G/D**

### 3.2 Steady state

```
G = decay(W)  ⇒  5e−5·d² + 0.2·d − G·(1 + 0.5R) = 0                                          # D
d = (−0.2 + sqrt(0.04 + 4·5e−5·G·(1 + 0.5R))) / (2·5e−5) ;  W_ss = T + d                       # D (derived)
```

| Ward gained per second G | W_ss at R = 0 | R = 1 | R = 2 | R = 3 | Label |
|---|---|---|---|---|---|
| 50 | 236 | 345 | 449 | 550 | D |
| 100 | 449 | 646 | 828 | 1000 | D |
| 200 | 828 | 1162 | 1464 | 1742 | D |
| 400 | 1464 | 2000 | 2472 | 2899 | D |
| 800 | 2472 | 3292 | 4000 | 4633 | D |

Doubling generation raises steady-state ward by less than 2× because decay is quadratic. **D**

### 3.3 Ward generation sources

| Source | Property / mechanism | Notes | Label |
|---|---|---|---|
| Ward per second | WardRegen SP92 (added, Integer rounding) | continuous | A/D |
| Ward on hit / crit / kill / freeze / stun / block / melee hit | WardGain SP39, `specialTag` = HitEventTag 1/2/3/4/5/6/7 | untagged added values summed; per hit instance per target; tagged/ability stats go through a separate tagged path with ICDs | D |
| Ward from mana spent | ManaSpentGainedAsWard SP99 | ward/s = mana cost × uses/s × SP99 (scale D?) | D? |
| Potion health converted to ward | PotionHealthConvertedToWard SP90 | — | A |
| Ward on potion use | WardOnPotionUse SP91 | — | A |
| 30 ward when hit | ChanceToGain30WardWhenHit SP97 | chance per hit taken | A |
| Ward from max health per second | PlayerProperty 474: `WardRegen += pp × maxHealth` | unique | D |
| Culnivar's Claim | at full mana: mana → 0, ward += maxMana | unique component | D |
| Skill / passive sources (Flame Ward burst, Ward Strike, Prodigy, Death's Barrier…) | tree fields | per skill | X |
| Idol altar | WardDecayThresholdPerCorruptedIdol (12), WardPerSecondPerHereticalIdol (14), WardDecayThresholdPerIdolInARefractedSlot (25) | IdolAltarPropertyID | A |
| "Ward per missing health" | not in sources | — | U |

Every gain goes through `GainWard`: skipped while `sourcesOfNoWardGain ≥ 1` (PP 471 "No Ward", or `noWardGainInCombat` in combat); multiplied by `(1 + t)` of the "more ward generated" list and by `wardGainModifier` (D?); clamped to `maxHealth × maxHealthCapForWard` when that cap is set (Acolyte "Corrupted Form" 0.5; Architects of Astral Blood 2.0–2.4). **D**

### 3.4 Ward and damage

- Ward has no maximum; it always decays toward 0 (or T). **G**
- Damage hits ward before health; endurance and mana-before-health apply only to the health part. **G**
- `hitsBypassWard` (PP 685) / `dotsBypassWard` (Acolyte "Impact Ward" ≥ 3 pts) skip ward. **D**
- Ward increases the stun and freeze denominator (`maxHealth + currentWard`). **G**
- Delayed-damage ticks are absorbed by ward. **D**

## 4. Leech

```
per damage type i, after the victim's full mitigation (d_i):
  leech += d_i × 0.1 × (10·additionalLeech + Σadded HealthLeech SP51) × (1 + Σinc) × Πmore          # D
           (SP51 queried with tags = other tags | type_i, hit events, extraTag = skill AbilityID)
  additionalLeech = component additionalLeech + (victim is a player ? leechVsPlayers : 0)          # D
leech ×= D_after / D_before     when block or DamageTakenBuff changed the damage                    # D
leech ×= (D − overkill) / D     (capped by the target's remaining health; ward-absorbed damage still leeches)   # D/G
leech += overkill × OverkillLeech SP93 × 0.1   (hits only)                                          # D
payout: linear over 3 / (1 + IncreasedLeechRate SP102) seconds, per instance, no cap               # D/G
```

- Guide example: 100 physical melee damage with 5% melee leech and 3% physical leech → 100 × (0.05 + 0.03) = 8 health over 3 s. **G**
- Leech works for hits and DoT; "on hit" leech sources do not apply to DoT. **G/X**
- Leech scale: unique tooltip "3% of melee damage leeched" stores HealthLeech 0.3; Immortal Vise 0.1–0.2 = 1–2%; affix "Melee Health Leech" T1 0.23–0.29 = 2.3–2.9%. **D/A**
- Increased leech rate shortens the payout window; it does not raise total leech. **X/D**
- MimicFeast debuff (HealthLeech MORE −1) and leech-disabled timers stop leech. **A/D**
- Ailments do not heal in the engine model; minions handle their own leech. **D?**
- Some trees turn leech into damage to the nearest enemy within 6 m (`leechDamagesEnemiesInstead`) or additionally (PP 599). **D**

## 5. Health, mana and ward on events

| Event gain | Property | Rule | Label |
|---|---|---|---|
| Health on hit / crit / kill / freeze / stun / block / melee hit | HealthGain SP38, specialTag 1..7 | added only, untagged path sums per event; per hit instance per target; no healing-effectiveness scaling | D |
| Mana on hit (and other events) | ManaGain SP40 | same | D |
| Minion-tagged SP38/39/40 | — | stays on the player ("handled by summoner"), not transferred to minions | D |
| Health restored | `restoreHealth` | capped at max health and health caps (e.g. Corrupted Form 50% of max) | D |
| Increased healing effectiveness SP44 | heals from skill components and skill mutators only | `heal × (1 + SP44)`; never leech, regen, or event gains | D/X |

## 6. Mana

```
maxMana  = RoundHalfEven((50 + 0.50506·L + 2·Att + Σadded Mana SP8) × (1 + Σinc) × Πmore)        # A/D
manaRegen = (8 + Σadded ManaRegen SP18) × (1 + Σinc) × Πmore    per second, no level scaling      # A/G
cost      = (manaCost + Σadded) × (1 + Σinc) × Πmore / (1 + ManaEfficiency SP69), floor 0           # X (LE Tools)
channel   = (channelCost + added) × (1 + inc) / (1 + manaEff) × (1 + ChannelCost SP25%)    per second   # X (LE Tools)
```

- Level 100 base mana: 50 + 50.506 = 100.5 before attributes and gear. Guide: "+0.5 mana per level (+50 at level 100)". **A/G**
- Negative mana: a skill can be used whenever mana > 0 even if it costs more; mana goes negative; skills costing ≥ 1 mana cannot be used at negative mana; regeneration continues. **G**
- `freeWhenOutOfMana`, `minimumManaCost`, `noManaRegenWhileChanneling`, `channelTimeLimit` are per-ability fields. **A**
- Mana-cost formulas with efficiency are from a community planner, not from code; the engine spec does not model mana stats. **X/U**
- Mana before health: 1 mana absorbs 5 damage; see [defenses.md](defenses.md#9-mana-ward-and-the-damage-pool). **G**
- Attribute scaling of 49 skills gives 2–3% mana efficiency per point. **A**

## 7. Potions

| Item | Value | Label |
|---|---|---|
| Health gained on potion use per level | +5 per level (+495 at level 100) | G |
| Base potion heal at level 1 | not in sources | U |
| Health gained on potion use | PotionHealth SP48 (added) | A |
| Potion slots | PotionSlots SP49; belts define base slots | A/G |
| Potion drop chance | IncreasedPotionDropRate SP47 | A |
| Auto-use | walking over a potion with full slots and missing health consumes it | G |

## 8. Endurance interplay

Endurance applies to the part of damage that lands on health below the threshold, never to ward (see [defenses.md](defenses.md#7-endurance)). Under endurance mode "and mana" (PP 309) it also reduces mana-before-health damage; under "everything" (PP 310) it applies to the whole hit before ward. **G/D**

## Worked example

Level-100 Mage (Intelligence 60 → R from Int = 1.20), +30% ward retention from gear → R = 1.50, ward decay threshold 400, 300 ward per second from tree and gear, 50 Vitality, +700 added health, 60% increased health, 40 Attunement. Inputs are illustrative. **U**

```
maxHealth = RHE((100 + 1000 + 6·50 + 700) × 1.60) = RHE(3360.0) = 3360                         # D
maxMana   = RHE(50 + 50.506 + 2·40) = RHE(180.506) = 181                                         # D
Ward: G·(1 + 0.5R) = 300 × 1.75 = 525                                                          # D
  d = (−0.2 + sqrt(0.04 + 2e−4 × 525)) / 1e−4 = (−0.2 + 0.380789) / 1e−4 = 1807.9
  W_ss = 400 + 1807.9 = 2207.9 ward                                                              # D
Same build with R = 0: d = (−0.2 + sqrt(0.04 + 0.06)) / 1e−4 = 1162.3 → W_ss = 1562.3           # D
Total pool before endurance: 3360 + 2208 = 5568                                                   # D
Leech: 2.2 hits/s × 600 damage landed per hit × 4% leech = 52.8 health/s average;
  each hit's 24 health arrives over 3 s; with +50% leech rate over 2 s                            # D
Regen: (6 + 14 + 10 added) × 1.25 = 37.5 health/s                                                 # A/D
```

## Common misconceptions / pitfalls
- Using the prompt-level shorthand "ward decay / (1 + retention)". The 1.1 patch notes and the guide formula divide by `1 + 0.5 × retention`. **G**
- Using the 2019 forum rule "ward loses 20% of current value per second". Superseded twice (0.4·W in 1.0, quadratic since 1.1). **G**
- Using Maxroll's "4% ward retention per Intelligence" or "10 health per Vitality". Data and guide: 2% and 6. **A/G**
- Expecting increased healing effectiveness to raise leech or regeneration. It does not. **D**
- Counting overkill damage toward leech. It is excluded unless OverkillLeech SP93 is present. **G/D**
- Reading the HealthLeech stat value as a percent. Value 0.3 in data = 3% in the tooltip. **D**
- Applying endurance to ward. **G**
- Treating "increased leech rate" as more leech. It only shortens the 3 s window. **X/D**

## Open questions
- Exact semantics of `minimumWardDecayWithoutRegen` (0.5/s): floor on decay when SP92 = 0, or a per-instance floor? **D?**
- Values of `wardGainModifier` and the "more ward generated" list for the player (06c not vendored). **D?**
- Scale of ManaSpentGainedAsWard SP99 (fraction vs percent). **D?**
- Whether mana efficiency divides cost (`/(1 + eff)`) or multiplies by `(1 − eff)` in 1.5.x code. **U**
- Base potion healing and its level scaling formula. **U**
- Whether ailment damage leeches in the live client (the guide says leech works on DoT; the engine model does not heal from ailments). **U**

## Sources
- `vendor/lastepochbuilder/research/data/game/classes.json` (baseHealth 100, healthPerLevel 10, baseMana 50, manaPerLevel 0.50506, healthRegen 6, healthRegenPerLevel 0.14, manaRegen 8, formulas).
- `vendor/lastepochbuilder/research/data/game/global_player_properties.json` (quadraticWardDecay 5e−5, linearWardDecay 0.2, minimumWardDecayWithoutRegen 0.5, statProperties rounding).
- `vendor/lastepochbuilder/research/data/game/attributes.json` (Intelligence +0.02 WardRetention, Vitality +6 Health, Attunement +2 Mana).
- `vendor/lastepochbuilder/research/07a_assets_core_data.md` §0.1–0.2, §3.1 (class values, ward constants).
- `vendor/lastepochbuilder/research/02_le_formulas.md` §4 (mana, channel, negative mana), §7.6 (ward decay formula, old formula), §7.8 (leech, regen).
- `vendor/lastepochbuilder/research/07n_defense_conversions.md` §2 (ward flags), §3.1 (delayed damage), §4.1–4.3 (leech formula and scale, IncreasedHealing scope, on-hit gains).
- `vendor/lastepochbuilder/research/07i_unique_formulas.md` §3.3 (PP 474 ward regen from max health).
- `vendor/lastepochbuilder/research/07d_minions_uniques.md` §1.1 (SP38/39/40 handled by summoner), §2.4 (Culnivar's Claim, Strong Mind).
- `vendor/lastepochbuilder/client/docs/ENGINE.md` §7 (Health, Mana rows), §8.7 (sustain rows), §10.3 (recovery simulation).
- `vendor/lastepochbuilder/research/data/stat_tag_enums.json` (HitEventTag, IdolAltarPropertyID).
- `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (Ward, HealthLeech, Levels, HealthAndRegen, ManaAndRegen, DamageTakenFromMana, Potions, Terminology).
- corpus `dev_harbingers_of_ruin_patch_notes_1_1.md` (https://forum.lastepoch.com/t/last-epoch-harbingers-of-ruin-patch-notes/71790, 2024-07-05): ward decay old and new formula.
- corpus `maxroll_defenses-explained.md` (https://maxroll.gg/last-epoch/resources/defenses-explained, updated 2026-04-02): leech rate, overkill, healing, conflicting attribute values.
- corpus `dev_unintuitive_mechanics_guide.md` (https://forum.lastepoch.com/t/unintuitive-mechanics-guide-for-le, 2019): obsolete 20%/s ward rule (for the pitfall only).

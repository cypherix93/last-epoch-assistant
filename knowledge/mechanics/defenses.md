# Defenses
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Confidence legend: **D** = recovered from decompiled client code (via vendored weksil research), **A** = read from game asset data, **G** = official in-game guide text, **X** = community-verified (Maxroll 2026 / forum tests), **U** = unverified or inferred. Each formula and constant carries a label.
> A `?` suffix (for example **D?**) means the source itself marks the reading as ambiguous.

## Summary (10 lines max, the rules an agent must never get wrong)
1. Enemies have 1% penetration per area level, capped at 75% from area level 75: at area ≥ 75 a capped 75% resistance mitigates 0%; over-cap does not help against it. **G/D**
2. Per type: `taken = raw × (1 − min(res, 0.75) + min(0.01·L, 0.75) + attackPen) × DT × (1 − armourDR) × (1 + DTbuff)`, all multiplicative. **D**
3. Armour: `[1.2x/(80 + 0.05(a+5)² + 1.2x)]·0.30 + [0.0015x²/(180(a+5) + 0.0015x²)]·0.55`, cap 85%, ×0.7 vs non-physical, hits only. **G/D**
4. Dodge: `[x/(80 + 0.05(a+5)² + x)]·0.25 + [0.001x²/(32(a+5) + 0.001x²)]·0.60`, cap 85%, hits only; the guide's "10 × area level ≈ 50%" is wrong (gives 19–29%). **G/D**
5. Block: chance rolls per hit; on block, damage × (1 − blockDR(effectiveness, a)), blockDR cap 85%; hits only (spells included). **G/D**
6. Endurance: base 20%, cap 60%, applies only to the part of damage that lands below the threshold (base 20% of max health), on health only, hits and DoT. **G/A**
7. Glancing blow: 35% less hit damage, chance cap 100%. Parry: negates the hit, cap 75%. Both still count as being hit; dodge does not. **G**
8. Players have a hidden 15% less DoT taken (`baseMoreDoTDamageTaken −0.15`, DamageTaken MORE, DoT tag). **A**
9. Damage taken from mana before health: shielded part costs 1 mana per 5 damage, applied after all other reductions, not on ward, off at ≤ 0 mana. **G**
10. Level DR (87% at 100) is a monster-only stat; players have no equivalent. **D**

## 1. Order of layers for one incoming hit

```
1  out[7] = DamageTakenAs conversion of in[7] (section 10), × (1 + damageModifier)      # D
2  attacker DamageConditionalEffect.apply                                               # D
3  ApplyConditionalDefenses → f0 dmg mult, f1 +block chance, f2 more armour,                 # D
   f3/f4 +endurance threshold, f5 +crit avoidance, f7 delayed share, f8 extra endurance  # D
4  per type t (the NEW type after conversion):                                               # D
     resMult_t = 1 − min(res_t, 0.75) + min(0.01·L, 0.75) + attackPen_t                 # D (zone pen G)
     × DamageTaken SP6 (tags: other tags | type_t | Hit or DoT | health tags)          # D
     × DamageTakenWhileMoving SP113 (only while moving)                                 # D
     × (1 − armourDR(armour·(1+f2), L, t ≠ Physical))   hits; DoT: × (1 − armourDR·min(SP118,1))   # D
     × (1 + DamageTakenBuff SP108)                                                      # D
5  avoidance (hits only): dodge → parry → glancing → block, crit (section 6)            # D
6  pool: delayed share f7 → mana before ward SP94 → endurance (mode "everything")
         → ward → mana before health SP24 (1 mana = 5 damage) → endurance below threshold → health   # D
```

Average avoidance factor used for expected damage per incoming hit: **D**

```
avoid = (1 − dodge)(1 − parry)(1 − 0.35·glancing)(1 − block·blockDR)(1 + critChance_eff·(cm_eff − 1))   # D
```

Conditional defenses that reduce to stats (DamageTaken, Armour, BlockChance with a condition) enter step 4 through the stat store; the 42 coded conditions are listed in `conditional_defenses.json`. **D**

## 2. Resistances

| Rule | Value | Label |
|---|---|---|
| Cap | 75% (players); cannot be raised | G/X |
| Below 0 | each −1% = +1% damage taken of that type | G |
| Uncapped resistance | total before the cap; protects against shred, Shock, Marked for Death, poison shred | G |
| Enemy penetration vs players | +1% per area level, max 75% at area level ≥ 75; applied after the cap | G/D |
| Shock on players | −2% lightning res, +8% chance to be stunned per stack (`moreBuffEffectAgainstPlayers −0.6`) | G/A |
| Shred on players | −2% per stack, 10 stacks, 4 s | G/A |
| Vitality | +1% necrotic and +1% poison resistance per point | G/A |
| Applies to | hits and DoT | G |

Resistance is assembled from **added** values only (increased/more on resistance stats are ignored): **D**

```
res_t = RES_SP[t] + AllResistances(SP30)                                                     # D
      + ElementalResistance(SP52)        if t ∈ {Fire, Cold, Lightning}
      + PhysicalAndVoidResistance(SP106) if t ∈ {Physical, Void}
      + NecroticAndPoisonResistance(SP107) if t ∈ {Necrotic, Poison}
      − NEG_RES_SP[t] − NegativeElementalResistance(SP84 for F/C/L)                    # D
RES_SP = [Physical 64, Fire 13, Cold 14, Lightning 15, Necrotic 27, Void 26, Poison 28]  # D
```

| Area level | Enemy pen | Effective res at 75% capped | Damage mult at 75% | at 0% res | Label |
|---|---|---|---|---|---|
| 20 | 20% | 55% | ×0.45 | ×1.20 | D |
| 50 | 50% | 25% | ×0.75 | ×1.50 | D |
| 75 | 75% | 0% | ×1.00 | ×1.75 | D |
| 100 | 75% | 0% | ×1.00 | ×1.75 | D |

At area ≥ 75, going from 74% to 75% resistance lowers damage taken by 1/1.01 → about 1%, not 3.8%. **X**

## Armour

```
L = a + 5          (a = AREA level, not the attacker's level)                          # G/D
f(x) = 0.30 × 1.2x / (80 + 0.05L² + 1.2x) + 0.55 × 0.0015x² / (180L + 0.0015x²)         # G/D
armourDR_phys    = min(0.85, f(x))                                                     # G
armourDR_nonphys = 0.7 × armourDR_phys   (max 59.5%)                                   # G/X
x < 0 (shredded enemy): armourDR = −f(−x)  → damage increase                            # D/X
armour = (Σadded Armour SP10 [untagged]) × (1 + Σinc) × Πmore − Σadded NegativeArmour SP77   # D
```

| Armour | a=20 | a=50 | a=75 | a=90 | a=100 | Label |
|---|---|---|---|---|---|---|
| 500 | 29.5% | 23.7% | 19.4% | 17.1% | 15.7% | D |
| 1000 | 41.2% | 32.4% | 27.7% | 25.2% | 23.7% | D |
| 2000 | 60.1% | 48.1% | 41.9% | 38.8% | 37.0% | D |
| 3000 | 70.4% | 59.9% | 53.6% | 50.4% | 48.4% | D |
| 4000 | 75.6% | 67.6% | 62.1% | 59.1% | 57.3% | D |
| 5000 | 78.6% | 72.4% | 67.9% | 65.3% | 63.7% | D |
| 6000 | 80.3% | 75.5% | 71.8% | 69.7% | 68.3% | D |
| 8000 | 82.2% | 79.2% | 76.6% | 75.1% | 74.1% | D |
| 10000 | 83.1% | 81.0% | 79.2% | 78.1% | 77.3% | D |

Values computed from the formula; the a=20/50/75/100 rows for 1000/3000/6000 match the vendored sample table. **D/X**

- Strength: +4% increased armour per point. **G/A**
- Armour has no effect on DoT unless `ArmourMitigationAppliesToDamageOverTime` (SP118) is present: DoT × (1 − armourDR × min(SP118, 1)). Bulwark buff gives +0.05 per stack. **D/A**
- Armour shred on players: −100 armour per stack, no boss/player penalty in data. **A**

## 4. Dodge

```
L = a + 5                                                                              # G/D
dodge(x) = min(0.85, 0.25 × x / (80 + 0.05L² + x) + 0.60 × 0.001x² / (32L + 0.001x²))  # G/D
x ≤ 0 → 0 ; x = DodgeRating SP11 (Dexterity gives +4 per point)                         # D/G
```

| Dodge rating | a=20 | a=50 | a=75 | a=90 | a=100 | Label |
|---|---|---|---|---|---|---|
| 250 | 21.6% | 15.0% | 11.0% | 9.2% | 8.2% | D |
| 500 | 34.7% | 24.6% | 19.2% | 16.7% | 15.2% | D |
| 1000 | 55.8% | 42.0% | 34.7% | 31.2% | 29.1% | D |
| 1500 | 67.5% | 55.3% | 47.8% | 44.0% | 41.7% | D |
| 2000 | 73.7% | 64.1% | 57.4% | 53.8% | 51.6% | D |
| 3000 | 79.2% | 73.4% | 68.8% | 66.1% | 64.3% | D |
| 4000 | 81.5% | 77.7% | 74.5% | 72.5% | 71.2% | D |

- Dodge avoids the hit entirely and does not count as being hit (no on-hit-taken effects, no ailments). DoT cannot be dodged. **G/X**
- Silver Shroud dodges the next hit outside the formula (temporary above-cap dodge). **X/D**
- A planner (LE Tools) additionally multiplies by "(1 + dodge chance modifiers)"; no such stat is in the engine spec. **X?**

## 5. Block

```
L = a + 5                                                                              # G/D
blockDR(x) = min(0.85, 0.25 × 3x / (40 + 0.03L² + 3x)
                     + 0.60 × (1.2x + 0.0006x²) / (60L + 1.2x + 0.0006x²))             # G/D
x = BlockEffectiveness SP53 ; chance = Σ BlockChance SP29 (+ f1 conditional), additive  # D/X
on block: damage × (1 − blockDR) × Π(1 − less damage taken from block)                  # G/X
```

| Block effectiveness | a=20 | a=50 | a=75 | a=90 | a=100 | Label |
|---|---|---|---|---|---|---|
| 250 | 34.2% | 26.9% | 23.0% | 21.0% | 19.8% | D |
| 500 | 44.1% | 34.1% | 29.8% | 27.7% | 26.4% | D |
| 1000 | 57.2% | 45.1% | 39.6% | 37.1% | 35.6% | D |
| 2000 | 70.5% | 60.0% | 54.1% | 51.2% | 49.5% | D |
| 3000 | 76.3% | 68.5% | 63.5% | 60.9% | 59.3% | D |
| 4000 | 79.2% | 73.5% | 69.5% | 67.4% | 66.0% | D |

- Blocks apply to all hits, spells included; not DoT; a block counts as being hit. **G**
- Block works without a shield but needs effectiveness, which mostly comes from shields. **X**
- Maximum block chance cap: none in base rules; `maximumBlockChance` exists only via PlayerProperty 614 (unique The Monolith 0.75). **D**
- Block effectiveness can apply to DoT via PP 524: DoT × (1 − blockDR × pp). **D**

## 6. Glancing blow, parry, crit avoidance

| Layer | Rule | Label |
|---|---|---|
| Glancing blow (SP62) | hit damage × 0.65 on a glance; chance > 100% has no extra effect; counts as hit | G |
| Parry (SP121) | negates all hit damage; chance `min(0.75, Σ)`; counts as hit (ailments still apply) | G/D |
| Crit avoidance (SP89) | rolled after the attacker's crit: `cc_eff = (cc + ChanceToBeCrit SP112) × (1 − avoidance)` | G/D |
| Less bonus damage taken from crits (SP114) | `cm_eff = max(1, 1 + (1 − SP114)(cm − 1))`, SP114 capped at 100% | G/D |
| Enemy crit multiplier | ×2.0 for every enemy hit that can crit | G |
| Average monster crit chance (monolith pool) | 4.8% spell, 4.9% melee (plain mean over samples) | A |

Guide example: enemy crit 30%, avoidance 50% → 15% effective crit. **G**

## 7. Endurance

```
endurance    = min(0.60, Σadded Endurance SP75)            base 0.20                   # G/A
threshold    = (1 + inc76) × ((maxMore96 + A96) × maxHealth + A76) × Πmore76           # D
               A96 base = 0.20 (MaximumHealthGainedAsEnduranceThreshold), A76 = flat threshold   # A
e_total      = 1 − (1 − f8) × (1 − endurance)              f8 = conditional extra endurance (PP 525)   # D
damage below the threshold: × (1 − e_total)   (applies even if the hit started above it)     # G/D
```

- Endurance reduces damage to health only, never to ward; covers hits and DoT; no cap on threshold. **G**
- Guide example: a 100-damage hit with 50 of it below the threshold → the last 50 get endurance. **G**
- Modes (PlayerProperties): 0 below threshold (default); 1 "and mana" (PP 309, also reduces mana-before-health damage); 2 "everything" (PP 310, applies to the whole hit before ward). **D**
- Dodge can convert to endurance threshold (PP 425) instead of dodging. **D**

## 8. Damage-taken modifiers and their order

| Stat | Kind | Combination | Label |
|---|---|---|---|
| DamageTaken SP6 | ADDED / INCREASED / MORE, tagged by type, Hit/DoT, Melee, Curse | `(1 + Σadded)(1 + Σinc)Πmore` per type | D |
| DamageTakenBuff SP108 | separate multiplier after armour | `× (1 + SP108)` | D |
| DamageTakenWhileMoving SP113 | only while moving | separate multiplier | D |
| DamageTakenFromNearbyEnemies SP110 | conditional | — | A |
| Conditional f0 (42 coded conditions, e.g. "X% less damage taken from Chilled enemies") | more-combined `M *= 1 + x` | separate multiplier | D |
| Players' hidden DoT reduction | DamageTaken MORE −0.15, DoT | multiplicative | A |
| Minion hidden reduction | DamageTaken MORE −0.6, Minion\|PetResisted | minions only | A |
| Frailty on the attacker | attacker Damage MORE −0.06 per stack, 3 stacks, multiplicative per stack, no boss penalty | attacker side | G/A |

"X% less damage taken" stats are MORE (multiplicative with each other); "increased/reduced damage taken" are INCREASED (additive with each other). Layer order does not change the product except where a cap or the endurance split applies. **D/X**

## 9. Mana, ward and the damage pool

| Mechanic | Rule | Label |
|---|---|---|
| Damage taken from mana before health (SP24) | share p ≤ 100% of post-mitigation damage goes to mana at 1 mana per 5 damage; ward is not protected; inactive at ≤ 0 mana | G |
| Guide example | 90% and 1000 damage → 100 to health, 900/5 = 180 mana | G |
| Damage to mana before health or ward (SP94) | same 1:5 conversion, taken before ward | D |
| Ward | absorbs damage before health; endurance does not apply to ward | G |
| `hitsBypassWard` / `dotsBypassWard` | PP 685 (Vestige of Imprisonment) / Acolyte "Impact Ward" ≥ 3 pts | D |
| Delayed damage f7 | `f7 = 1 − (1 − pp564)(rare/boss ? 1 − pp498 : 1)(Spirit Plague ? 1 − pp671 : 1)`; queued `D/(1−f7)·f7`, paid linearly over 4.0 s, ward absorbs ticks | D |

Ward decay and generation: [ward-health-sustain.md](ward-health-sustain.md).

## 10. Damage taken as another type (SP31–SP37)

```
out = copy(in)
for each stat s with SP31 ≤ s.property ≤ SP37 (target t = s.property − 31):
    i = first type in order Phys, Lightning, Cold, Fire, Void, Necrotic, Poison with in[i] ≠ 0 and s.tags has its bit
    m = min(s.added, 1.0) × in[i] ;  out[t] += m ;  out[i] −= m                         # D
```

- The stat's `tags` is the SOURCE type: `DamageTakenAsFire` + tags Physical = "Physical damage taken as Fire". Only `added` is read. **D**
- No normalisation: 60% phys→fire plus 60% phys→cold gives phys −20%, fire 60%, cold 60% = 120% total taken. **D**
- No chaining: every share reads the original array. **D**
- Applies to hits and DoT, before every per-type layer; the converted part uses the target type's resistance. **D**
- Two shipped tooltips are inert in code: Knight "Abyssal Fluctuation" (Elemental as Void) and Acolyte "Decaying Form" (DoT as Poison) carry no damage-type bit. **D** (in-game behaviour **D?**)

## 11. Defense conversions and conditional defenses

| Conversion (PlayerProperty) | Effect | Label |
|---|---|---|
| PP 177 dodge → armour (Knight "Iron Reflexes" ≥ 5 pts) | dodge rating added to armour before its more: `(armour + dodgeRating)·(1 + f2)`; no dodge roll | D |
| PP 194 dodge → glancing (Rogue "Apostasy") | glancing += 2 × dodge chance; no dodge roll | D |
| PP 425 dodge → endurance threshold | dodge rating added to threshold | D |
| Priority | 425 > 194 > 177 | D |
| PP 531 block → parry without shield (Clotho's Needle) | block chance becomes parry | D |
| PP 392 block → glancing (Rogue "Deflect and Weave" ≥ 5 pts) | `min(maxBlock, block) + f1·mult` added to glancing | D |
| PP 614 maximum block chance (The Monolith 0.75) | caps block chance | D |

Examples of coded conditional defenses (slot f0 unless noted): more damage taken while leeching (PP 340), with ≥ 1000 ward (PP 259), with ≥ 400 mana (PP 262), from chilled / slowed / shocked / ignited / cursed attackers (PP 250, 561, 252, 251, 347), per 2% resistance above cap (PP 254/255), damage redirected to minions (PP 496/562, total ≤ 75%), chance to take 0 damage from hits (PP 462). **D**

## 12. Effective health

There is no EHP stat in the client. The engine spec computes: **D**

```
lethal_post   = smallest post-layer damage that kills from full pool (binary search)        # D
maxHitTaken   = lethal_post / (post-layer share of the attack mix)                         # D
maxCritTaken  = maxHitTaken / cm_eff                                                       # D
hitsToDie     = simulate average hits every `interval` s with regen/leech/ward decay in 0.05 s steps  # D
EHP           = hitsToDie × raw damage per hit                                             # D
worstHit      = post-layer damage × cm_eff × 1.2 (variance)                                # D
```

Closed form without recovery, ward or mana (sufficient for planning): **D** (derived)

```
pool_post = (H − T) + T / (1 − e)          H max health, T threshold, e endurance        # D
maxRawHit = pool_post / (resMult × DT × (1 − armourDR) × Π other mults)                  # D
avgEHP    = maxRawHit / ((1 − dodge)(1 − parry)(1 − 0.35·glance)(1 − block·blockDR)(1 + cc(cm−1)))   # D
```

## Worked example

Level-100 character in an empowered monolith (area level 100, corruption 300) hit by a rare melee monster.

```
Raw hit: average monolith melee hit (10% trimmed mean, level-100 basis) = 87.58 phys      # A
  × ActorScaler (damageModifier[100] + 1) × 1.06 = 1.157 × 1.06 = 1.2264 → 107.4         # D?
  × rare Damage MORE +0.9 = ×1.9 → 204.1                                                  # D
  × corruption more 1 + 0.01·f(300) = 1 + 0.01 × 280.46 = 3.805 → 776.5 ≈ 776 physical    # D
Character: max health 2500, threshold 20% = 500, endurance 40%, armour 5000,
  physical res 50%, 10% less damage taken (MORE −0.10), dodge rating 1000, crit avoidance 100%   # U (inputs)
resMult  = 1 − 0.50 + 0.75 = 1.25                                                         # D
armourDR = f(5000, a=100) = 0.6371 → × 0.3629                                             # D
DT       = 0.90                                                                           # D
post     = 776 × 1.25 × 0.3629 × 0.90 = 316.8 per landed hit                              # D
pool     = (2500 − 500) + 500 / (1 − 0.40) = 2833.3                                       # D
hits to die = 2833.3 / 316.8 = 8.94 → dies on the 9th landed hit (no recovery)            # D
maxRawHit = 2833.3 / (1.25 × 0.3629 × 0.90) = 6941 physical                               # D
dodge(1000, a=100) = 0.2909 → average EHP = 6941 / 0.7091 = 9788 raw damage               # D
If crit avoidance were 0%: max crit taken = 6941 / 2.0 = 3470                             # D
Same 776 as fire with 75% fire res: resMult 1.00, armour non-phys 0.446 →
  776 × 1.00 × 0.554 × 0.90 = 386.9 per hit                                               # D
```

Raising physical resistance from 50% to 75% changes `resMult` from 1.25 to 1.00 (−20% damage taken); 75% is the most it can do at area ≥ 75. **D**

## Common misconceptions / pitfalls
- Treating 75% resistance as 75% damage reduction at endgame. At area ≥ 75 it is 0% net; it only prevents the 1.75× penalty. **G/D**
- Using the attacker's level or character level instead of area level `a` in armour/dodge/block. The guide formulas use area level. **G**
- Applying armour, dodge, block, glancing or parry to DoT. Only resistances, endurance and damage-taken modifiers apply (plus SP118 armour fraction). **G**
- Believing over-capped resistance reduces penetration. It only protects against shred-type reductions. **G**
- Using Maxroll's "Vitality 10 HP" or "Intelligence 4% ward retention": data gives 6 HP and 2%. **A/G**
- Summing endurance and other reductions additively. Endurance is a separate multiplier on the below-threshold part. **G**
- Assuming mana-before-health protects ward. It does not. **G**
- Reading Blind on enemies as "halves crit chance" (Maxroll) — data is CriticalChance MORE −1: blinded enemies cannot crit. **A/G**

## Open questions
- The guide images for the formulas (r-30 armour, r-32 dodge, r-33 block) are not vendored; the formulas come from the weksil transcription that matched two planners. **G?**
- Does any source of "increased dodge chance" (a multiplier on the dodge formula output) exist in 1.5.x? **U**
- Whether enemy hits use the area level or the monster's own level when an area contains off-level monsters (Tunklab uses area level). **U**
- Holders of PP 425, 310, 619, 638, 257, 258, 262, 321, 322, 711, 347, 323, 670, 564, 671 (code reads them; no item or node found). **D?**
- Whether the two inert damage-taken conversion nodes (Abyssal Fluctuation, Decaying Form) are inert in the live client. **D?**
- Exact damage variable at the delayed-damage site (07n §3.1). **D?**

## Sources
- `vendor/lastepochbuilder/client/docs/ENGINE.md` §6.2 (enemy resistance and armour functions), §7 (character defense rows, endurance threshold), §10.1–10.4 (attacks, layers, pool, recovery, EHP results).
- `vendor/lastepochbuilder/research/02_le_formulas.md` §6.1–6.2 (resistances, penetration, negative armour), §7.1–7.8 (armour, dodge, block, endurance, glancing, parry, mana before health), sample armour table.
- `vendor/lastepochbuilder/research/07n_defense_conversions.md` §1 (DamageTakenAs), §2 (dodge/block/endurance/ward flags), §3 (42 conditional defenses, delayed damage).
- `vendor/lastepochbuilder/research/07a_assets_core_data.md` §0 (class base values), §2.2 (attributes).
- `vendor/lastepochbuilder/research/data/game/classes.json` (`baseEndurance 0.2`, `enduranceThresholdPerHealth 0.2`, `baseMoreDoTDamageTaken −0.15`, hiddenBaseMods).
- `vendor/lastepochbuilder/research/data/game/attributes.json` (per-point values).
- `vendor/lastepochbuilder/research/data/game/conditional_defenses.json` (conversion and condition tables).
- `vendor/lastepochbuilder/research/data/game/ailments.json` (Shock, shreds, Frailty, Blind, Bulwark buffs and player penalties).
- `vendor/lastepochbuilder/research/data/game/monster_damage.json` (average monolith melee hit 87.58, monster crit means).
- `vendor/lastepochbuilder/research/data/game/actor_scaler.json`, `monster_rarity.json`, `monster_mods.json` (raw-hit chain for the example).
- `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (Resistances, Armor, Penetrations, Dodge, Block, Endurance, GlancingBlow, CriticalStrikes, Parry, DamageTakenFromMana, Terminology).
- corpus `maxroll_defenses-explained.md` (https://maxroll.gg/last-epoch/resources/defenses-explained, updated 2026-04-02): layer multiplication example, resistance-value argument, conflicting attribute numbers.

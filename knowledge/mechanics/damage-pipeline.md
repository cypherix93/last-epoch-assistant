# Damage Pipeline
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Confidence legend: **D** = recovered from decompiled client code (via vendored weksil research), **A** = read from game asset data, **G** = official in-game guide text, **X** = community-verified (Maxroll 2026 / forum tests), **U** = unverified or inferred. Each formula and constant carries a label.
> A `?` suffix (for example **D?**) means the source itself marks the reading as ambiguous.

## Summary (10 lines max, the rules an agent must never get wrong)
1. Per damage type t: `Hit_t = (base_t + ADE × added_t) × (1 + Σinc_t) × Π(1 + more_t)`; types are summed only at the end. **G/D**
2. ADE (`addedDamageScaling`) multiplies added flat damage only, never base damage, never ailment base damage. **G**
3. A modifier applies when every non-damage-type tag on it is present on the damage source; Elemental on a modifier matches Fire, Cold or Lightning. **D**
4. Typed "increased X damage" scales only the X bucket of a hit; untyped increased scales all 7 buckets. **D**
5. Skill-tree "increased damage" nodes are almost always coded as `more` (429 more vs 38 increased damage stats); tree speed and crit are not. **D**
6. Crit: `cc = min(1, (critChance + Σadded) × (1 + Σinc) × Πmore)`, `cm = (critMultiplier + Σadded) × (1 + Σinc) × Πmore`, default 5% / ×2.0; DoT never crits. **G/D**
7. Enemy resistance multiplier = `(res > 0.75 ? 0.25 : 1 − res) + pen`; shred lowers res before the cap, penetration after. **D/G**
8. Every monster has hidden damage reduction by level (87% at level 100, boss/miniboss `DR + 0.05·(1−DR)`) on hits and DoT; dummies have none. **D/A**
9. Base conversion changes base damage and untyped added damage, not typed added damage, and does not touch ailments. **G**
10. Hits vary ×0.8 to ×1.2 per hit (average unchanged); DoT has no variance. **X/D?**

## 1. Where the numbers live (data fields)

Each damaging component of a skill prefab carries a `DamageStatsHolder` record (`abilities.json → damage[]`, the first one is `primaryDamage`). **A**

| Field | Meaning | Label |
|---|---|---|
| `damage[7]` | base damage per type, order **Physical, Fire, Cold, Lightning, Necrotic, Void, Poison** | A |
| `addedDamageScaling` | ADE as a fraction (1.25 = 125%) | A |
| `critChance` / `critMultiplier` | base crit; 559 components use 0.05 / 2.0, a few use 0.06, 0.1, 0.5, 1.0 | A |
| `critType` | 0 normal, 1 cannot crit, 2 crit chance kept but multiplier ignored (cm = 1) | D |
| `isHit` | 1 hit, 0 DoT component (gets the DoT tag instead of Hit) | A/D |
| `penetration[]` | component penetration; empty on all 149 ailments | A |
| `damageTags`, ability `tags` | AT bitmask of the component and of the skill | A |
| `damageModifier` | component multiplier applied as `×(1 + damageModifier)` inside `ApplyDamage` | D |
| `freezeRate`, `increasedStunChance`, `additionalLeech`, `cullPercent` | per-component extras | A |
| `convertAllAddedDamage`, `damageTypeToConvertTo` | component-level conversion of all added damage | A |
| `attributeScaling[]`, `levelScaling[]` | per-attribute-point / per-level `Stat` lists added on cast | A/D |
| `skillTreeConversionDamageTags` | tags a tree conversion can produce | A |

ADE rule. For code-built damage `calculateAddedDamageScaling` sets `ADE = isWeapon ? 1.0 : 0.05 × Σ base damage`. **D** Asset spells and throws follow the same 5%-per-base-point pattern (Fireball 25 fire → 1.25, Javelin 50 → 2.5, Meteor `MeteorAoe` 240 → 12). **A** Melee skills typically have 2 total base damage because the weapon supplies the damage; their ADE is set per skill. **G/A**

| Ability (component) | Base damage | Crit | ADE | Label |
|---|---|---|---|---|
| Fireball | Fire 25 | 5% | 1.25 | A |
| Lightning Blast | Lightning 21 | 5% | 1.0 | A |
| Javelin | Physical 50 | 5% | 2.5 | A |
| Disintegrate | Fire 12 + Lightning 12 | 50% | 1.2 | A |
| Ghostflame | Fire 17.5 + Necrotic 17.5 | 50% | 1.75 | A |
| Meteor (`MeteorAoe`) | Fire 240 | 5% | 12 | A |
| Swipe | Physical 2 | 5% | 1.0 | A |
| Rive | Physical 2 | 5% | 1.25 | A |
| Forge Strike | Physical 2 | 5% | 6.0 | A |
| Shadow Cascade | Physical 2 | 10% | 3.0 | A |
| Warpath hit | Physical 1 | 5% | 0.6 | A |

Some skills have no damage in assets (Anomaly, Snap Freeze, Abyssal Echoes, Bone Curse, Spirit Plague, Aura of Decay): their damage comes from ailments or is built in mutator code. **A/D**

## 2. The pipeline

```
# Inputs: base[7] = component damage[7], ADE = addedDamageScaling, src = source tag mask (section 4)
for each type t in 0..6:                                                                  # D
  added_t = Σ added Damage(SP0) mods whose type is t and whose other tags ⊆ src          # D
  flat    = Σ untyped added Damage(SP0, no type bits) sharing Spell|Melee|Throwing|Bow with src
          + Σ AdaptiveSpellDamage(SP41) if src has Spell                                  # D
  dmg_t   = base_t + ADE × added_t + ADE × flat × base_t / Σbase                          # D (untyped split by base share)
  inc_t   = Σ increased Damage mods addressed to t (typed; Elemental → F/C/L; untyped → all)  # D
  more_t  = Π (1 + m) over more Damage mods addressed to t                                # D
  Hit_t   = max(0, dmg_t × (1 + inc_t) × more_t)                                          # D
# against an enemy (per type, then summed):
  Hit_t  *= Π(1 + cond_m × count)          # GlobalConditionalDamage SP117 / SP115       # D
  Hit_t  *= resMult_t                      # section 8                                    # D
  Hit_t  *= DT_t                           # enemy DamageTaken SP6, section 8             # D
  Hit_t  *= (1 − levelDR)                  # section 9                                    # D
  Hit_t  *= isHit ? (1 − armourMitigation(enemyArmour, level, t ≠ Physical)) : 1          # D
avgHit   = Σ_t Hit_t × (1 + cc_eff × (cm − 1))                                            # D
DPS      = avgHit × uses/s × hits per use × projectiles hitting the target               # D
```

Official worked check (guide, `IncreasedAddedAndMore`): added (5+2+3) = 10; increased (1+0.05+0.3+0.1) = 1.45; 10 × 1.45 = 14.5; more 14.5 × 1.05 × 1.3 × 1.1 = 21.77, not 21.03 (which summing the mores would give). **G**

Negative totals floor at 0 per bucket (`max(0, …)`). **D**

## 3. Added damage

| Kind | Example stat | Rule | Label |
|---|---|---|---|
| Typed added | "+5 Melee Fire Damage" (SP0, tags Fire\|Melee, ADDED) | adds to the Fire bucket of any source that has Melee, even a Physical skill | G/D |
| Untyped added | "+5 Melee Damage" (SP0, tags Melee) | takes the skill's base damage type(s), split by base-damage share | G/D |
| Adaptive spell damage | SP41 `AdaptiveSpellDamage` | as untyped, spells only | D/X |
| Skill-tree flat | node "+N damage" | still multiplied by ADE (the tooltip does not pre-apply it) | X |
| Weapon damage | weapon implicit / affix added damage | is *added* damage, not base damage; multiplied by ADE | G/X |

- Untyped added damage needs `Σbase > 0`; a component with zero base damage gains nothing from it. **D**
- Typed added damage of a type the skill does not have still creates a bucket of that type (Fire skill + "+8 Spell Cold Damage" → Cold bucket of 8 × ADE). **D/X**
- Weapon attack rate is used by Melee attacks and by Bow attacks with a bow; throwing attacks do not use the weapon attack rate. **D** (see [speed-cooldowns-mana.md](speed-cooldowns-mana.md))

## 4. Tag matching

Bit values are listed in [stat-model.md](stat-model.md#tag-bitmask-at). Matching function (`LE.tags_match`, mirrors `Tags.Applicable`): **D**

```
match(mod, check) = (mod & check) == mod                                               # D
                 OR (mod & Elemental and check & (Fire|Cold|Lightning)
                     and ((check | Elemental) & mod) == mod)                           # D
```

Source mask `src` for a damage component: **D**

```
src = isHit ? (skillTags & ~DoT) | Hit : (skillTags & ~Hit) | DoT                     # D
src |= FullLife|HighLife (full health), HighLife (≥ 65%), LowLife (≤ 35%)              # D (thresholds G)
applicable(mod) = (mod.tags & Minion) == (src & Minion) and match(mod.tags, src | typeBits)  # D
```

Minion is required on the mod only when the damage itself carries the Minion tag; minion abilities do not carry it, which is why stripped player "minion" stats match them. **D**

Addressing of a Damage (SP0) modifier to a bucket: take the first damage-type bit of the mod in the order Physical, Lightning, Cold, Fire, Void, Necrotic, Poison; `other = mod.tags` minus Elemental minus that bit; the mod applies if `(other & src) == other`. Typed → that bucket only; Elemental without a type → Fire, Cold, Lightning; neither → all 7 buckets. **D**

| Modifier (tags) | Fireball hit (Fire\|Spell\|Hit) | Ignite from Fireball (DoT\|Ailment, fire) | Physical melee hit with added fire | Label |
|---|---|---|---|---|
| increased damage (none) | all buckets | yes | all buckets | D |
| increased fire damage (Fire) | Fire bucket | yes | Fire bucket only | D |
| increased elemental damage (Elemental) | Fire bucket | yes | Fire bucket only | D |
| increased spell damage (Spell) | yes | no | no | D/G |
| increased spell fire damage (Fire\|Spell) | Fire bucket | no | no | D |
| increased melee fire damage (Fire\|Melee) | no | no (ailments are not Melee) | Fire bucket | D/G |
| increased damage over time (DoT) | no | yes | no | D/X |
| increased fire damage over time (Fire\|DoT) | no | yes | no | D/X |
| increased hit damage (Hit) | yes | no | yes | D |
| increased minion damage (Minion) | no (player skill) | no | no | D/G |

- "Even when an ailment is applied by a melee skill or a hit, that does not make it count as melee damage or hit damage." **G**
- Minion-tagged player stats never apply to the player's own damage; on a minion they arrive with Minion stripped ([minions.md](minions.md)). **D**
- `specialTag` restricts a mod further (AilmentID for ailment stats, HitEventTag for on-hit gains, ConditionalDamageProperty for SP117); 0 is the wildcard. **D**
- `extraTag` = AbilityID: the mod applies only to that skill (`extra == 0` matches every skill). **D**
- Totem-tagged stats on the player apply only to totem minions (transferred on summon); Channelling, Transform, Potion and Buff tags gate mods to those situations. **D**

## 5. Increased, more, and skill trees

```
Stat = (Σ added) × (1 + Σ increased − Σ reduced) × Π (1 + more_i) × Π (1 − less_j)       # G
QUOTIENT modType x  →  stored as more 1/(1+x) − 1 (cancels a more of x)                  # D
```

- Passive-tree and gear "increased" lines are INCREASED (179 of 180 checked lines). **D**
- Skill-tree damage stats: 429 `more`, 79 `added`, 38 `increased` (per-stat type in `skill_node_effects.json`; never infer the type from tooltip text). Developer statement 2021: all damage modifiers inside skill trees are multiplicative; this does not extend to attack speed, cast speed or crit. **D/G**
- Within one node, points scale linearly (`value × points` → one more of `k·p`); different nodes are separate multipliers. **D**
- Tree "increased cast/attack speed" fields sum into the speed increased pool; `more*Speed` fields multiply. **D**
- "Non-X damage" nodes: a general `more k·p` plus a tagged `more 1/(1+k·p) − 1` that cancels it on the excluded part (11 nodes). "Doubled when condition" nodes: base `more k·p` plus conditional `(1+2kp)/(1+kp) − 1` (8 nodes). **D**
- "Increased area" nodes sum first and convert once: `increasedRadius = sqrt(1 + Σarea) − 1`. **D**

## 6. Attribute and level scaling

- Each attribute point grants the skill's `attributeScaling` stats; 397 entries are "+4% increased damage" (SP0, tags 0, `increasedValue 0.04`), so attribute damage is in the increased pool. **A**
- Other entries: 46 × +4% increased minion damage (tags Minion), 49 × mana efficiency 2–3%, minion health flat, +4% freeze rate multiplier, +2 added spell void damage. **A/X**
- Attribute-scaling stats also scale ailments the skill applies (generic increased damage). **G**
- Attribute value used: `RoundHalfEven(Σadded SP19..23 + Σadded SP46 AllAttributes)`; "per N attribute" unique effects are continuous `pp × attr / N` with no floor. **D**
- `levelScaling` stats are multiplied by character level on cast; minions' own abilities never get it. **D**

## 7. Critical strikes

```
cc     = (critChance + Σadded CritChance(SP4)) × (1 + Σinc) × Πmore                    # D (form G)
cc_eff = min(1, cc + Σadded ChanceToBeCrit(SP112) on the enemy)   if cc > 0             # D
cm     = max(1, (critMultiplier + Σadded CritMultiplier(SP5)) × (1 + Σinc) × Πmore)      # D
critType 1 → cc = 0, cm = 1 ;  critType 2 → cm = 1                                      # D
E_crit = 1 + cc_eff × (cm − 1)                                                           # D
```

| Constant | Value | Label |
|---|---|---|
| Base crit chance of hits | 5% (`critChance 0.05`) | G/A |
| Base crit multiplier | ×2.0 (shown as 200%) | G/A |
| Guide example | +1% added and 1% increased → (5+1) × 1.01 = 6.06% | G |
| Crit multiplier on items | added only (`modifierType 0`) | X |
| Crit chance cap | 100%; over-cap gives nothing | X |
| Critical Vulnerability (AilmentID 85) | +2% ChanceToBeCrit and −10% CritAvoidance per stack, 10 stacks, 4 s, no boss penalty | A |
| Acid Skin curse (AilmentID 120) | +20% ChanceToBeCrit (guide text says +25%) | A (G conflicts) |
| Blind (AilmentID 14) | CriticalChance MORE −1 → target cannot crit | A/G |

- "+X% critical strike multiplier" adds X to the 2.0 base: 100 damage with two +50% sources crits for 100 × (2 + 0.5 + 0.5) = 300. **X**
- DoT cannot crit. **G**
- Enemy crit avoidance against the player's hits is not applied by the engine spec (no source models it). **U**

## 8. Resistance, penetration, shred, damage taken (outgoing)

```
res_t     = BaseRes_t + AllRes(SP30) + group res − NegRes_t(SP72, SP78..83) − NegElemRes(SP84)   # D (added values only)
resMult_t = (res_t > 0.75 ? 0.25 : 1 − res_t) + pen_t                                         # D
pen_t     = Σ added Penetration(SP59) addressed like Damage (typed / Elemental / all)          # D
DT_t      = (1 + Σadded SP6) × (1 + Σinc SP6) × Πmore SP6, queried with src_other | type_t     # D
```

- Shred, Shock, Poison and Marked for Death are negative-resistance stats: they reduce uncapped resistance; penetration applies after the cap. 30% penetration vs 20% resistance → −10%. **G**
- No floor on negative enemy resistance in code; −50% res → ×1.5. **D/G**
- Most enemies have 0% resistance and 0 armour by default; mods, monolith modifiers and champions add them. **G**
- Penetration has no boss penalty; shred does (−5% per stack normally, −2% vs bosses/players via `moreBuffEffectAgainstBosses −0.6`). **A/G**
- Increased damage taken sources add together; more damage taken multiplies; both are independent of penetration. **D/X**
- Enemy armour (positive or shredded negative) uses the player armour formula with `a = area level`; negative armour gives `−f(|x|)`, i.e. extra damage; non-physical ×0.7; hits only. **D/X** (formula in [defenses.md](defenses.md#armour))

## 9. Monster level damage reduction

```
levelDR(L)      = damageReduction[L]  (actor_scaler.json, index 0..100)                     # D/A
levelDR_boss(L) = DR + 0.05 × (1 − DR)   (boss or miniboss)                                 # D
applied as ProtectionClass.fixedDamageReduction to hits AND DoT; training dummy: 0           # D
```

| Level | 1–6 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 75 | 80 | 90 | 100 | Label |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DR | 0 | 6% | 21% | 34% | 44% | 54% | 63.2% | 71.2% | 75% | 78% | 83% | 87% | A |

Full table: [enemies-and-corruption.md](enemies-and-corruption.md#monster-level-tables). At level 100 a dummy takes 1/0.13 = 7.7× the damage a monster takes. **D/X**

## 10. Conversion

- Base damage conversion moves base damage before any modifier: `dmg[to] += f × dmg[from]; dmg[from] −= f × dmg[from]`. **D**
- Tags: `tags = (tags & ~remove) | add`; for partial conversions the tag swap happens only at 100% (`tags_when: full_conversion`) unless the rule says `active`. New tags drive mod matching, speed and cooldown. **D?** (rules in `skill_conversions.json`: 133 conversion, 19 ailment_conversion, 13 tags)
- Typed added damage ("+5 Melee Fire") is not converted; untyped added ("+5 Melee") follows the converted base type. **G**
- Conversion does not change ailments or other effects the skill applies unless stated; ailment conversions (SP100 `AilmentConversion`, `specialTag` = from, `tags` = to, or tree `ailment_convert`) move the whole chance. **G/D**
- Some nodes also convert added damage (Hail of Arrows Crystal Arrows; Reaper Form Gravechill converts Intelligence added damage); read each node. **X**
- Developer statement: flat or base damage added by skill trees should not change a skill's scaling tags. **G?** (secondary citation in 02 §1.3)

## 11. Conditional damage

```
D_t *= Π(1 + m × count(cdp))    for SP117 GlobalConditionalDamage (more), cdp = specialTag    # D
D_t *= Π(1 + m × stacks)        for SP115 DamagePerStackOfAilment (no limit)                  # D
SP131 / SP132 / SP133 = conditional penetration / crit chance / crit multiplier, same cdp list # D
```

`count` is 1/0 for flags (ToStunned 0, ToLowHealth 1, ToBossesAndRare 4, ToIgnited 5, ToChilled 8, ToShocked 10, ToCursed 13, ToFrozen 20, …) and a capped counter for "Per…" properties (PerStackOfPoisonUpTo30 6, PerStackOfBleedUpTo30 7, PerStackOfArmourShredUpTo14 18, PerNegativeAilmentOnTheTargetUpTo8 26). Full list: [stat-model.md](stat-model.md#conditionaldamageproperty-cdp). **D/A**

## 12. Rounding and quantization

| Where | Rule | Label |
|---|---|---|
| Affix / unique / implicit roll | `a = RHE(lo·(1+m)·s)`, `b = RHE(hi·(1+m)·s)`, `v = min(floor((b−a+1)·roll/255 + a), b)/s`, float32 | D |
| Grid `s` | `PropertyRounding`: Hundredth ×100, Integer ×1, Tenth ×10, Thousandth ×1000 | A |
| ADDED mods | `roundingForAdded` of the property (Damage: Integer) | A |
| INCREASED mods | always Hundredth | D |
| MORE mods | `moreRoundingOverrides[specialTag]`, else `roundingForMore` (DamageTaken: Thousandth) | A |
| Attributes, max Health, max Mana | RoundHalfEven of the final value | D |
| Intermediate damage values | not rounded in the engine spec ("all numbers are float") | D? |

## 13. Variance and tooltips

- Hit damage varies ×0.8–×1.2 per hit; the dummy and the engine show the unvaried value; DoT has no variance. **X** (Maxroll 2026), **D?** (06b §3.1 via ENGINE)
- The in-game DPS tooltip ignores level DR, enemy resistances, shred, conditionals and uptime. Use it only as a "vs dummy" calibration target. **X**
- Hidden per-skill and per-minion multipliers have existed (Season 4 removed a hidden 14% less damage from Skeletal Mages, Pyromancers, Cryomancers). **G** (patch notes)

## 14. Damage over time

DoT components (`isHit 0`) use the same pipeline with `src` carrying DoT instead of Hit: no crit, no armour (unless the target has SP118), no block or dodge, no variance. Ailments have fixed base damage, ADE 0 for Ignite/Bleed/Poison, and scale from generic, type, DoT and skill-tree modifiers of the applying skill. Full rules: [ailments.md](ailments.md).

## Worked example

Fireball (base Fire 25, ADE 1.25, crit 5% / ×2.0, `useDuration 0.75`, `speedScaler` CastSpeed, `speedMultiplier 1.0`) **A**, character with 40 Intelligence, target a level-100 normal monster with 0 fire resistance and 3 Fire Resistance Shred stacks. Gear numbers are illustrative inputs. **U**

```
Added: +20 spell fire (typed), +12 spell damage (untyped), +8 spell cold (typed)
Fire bucket = 25 + 1.25 × (20 + 12 × 25/25) = 25 + 40 = 65                              # D
Cold bucket = 0 + 1.25 × 8 = 10                                                          # D
Increased: 40 Int × 4% = 160% (generic), 80% fire, 50% spell, 30% elemental, 40% cold, 60% melee (does not apply)
inc_fire = 1.6 + 0.8 + 0.5 + 0.3 = 3.2  → ×4.2                                           # D
inc_cold = 1.6 + 0.5 + 0.3 + 0.4 = 2.8  → ×3.8                                           # D
More (tree): Winged Fire 7% × 5 pts = 35% more damage; a 20% more fire damage node
more_fire = 1.35 × 1.20 = 1.62 ; more_cold = 1.35                                        # D
Fire hit = 65 × 4.2 × 1.62 = 442.26 ; Cold hit = 10 × 3.8 × 1.35 = 51.30 ; sum 493.56    # D
Crit: +4% added spell crit, 150% increased → cc = 0.09 × 2.5 = 0.225 ; cm = 2.0 + 1.0 = 3.0
E_crit = 1 + 0.225 × (3.0 − 1) = 1.45                                                    # D
Speed: 40% inc cast speed + 10% tree cast speed → S = 1 × (1 + 0.5) = 1.5
uses/s = 1.5 × 1.0 × 1.1 / 0.75 = 2.20                                                   # D
vs dummy (0 res, DR 0, 20% fire pen): fire 442.26 × 1.20 = 530.71 ; cold 51.30
  avg hit = 582.01 × 1.45 = 843.9 ; DPS = 843.9 × 2.2 = 1856.6                            # D
vs level-100 monster: fire res = 0 − 3 × 5% = −15% → resMult = 1.15 + 0.20 = 1.35 ; DR 0.87
  fire 442.26 × 1.35 × 0.13 = 77.62 ; cold 51.30 × 1.00 × 0.13 = 6.67
  avg hit = 84.29 × 1.45 = 122.2 ; DPS = 122.2 × 2.2 = 268.9                              # D
```

The same build's ignite is computed in [ailments.md](ailments.md#worked-example).

## Common misconceptions / pitfalls
- Treating weapon damage as base damage. It is added damage and is multiplied by ADE. **G/X**
- Multiplying ADE onto base damage, or onto ailment base damage. **G**
- Applying "increased fire damage" to the whole hit when part of the hit is physical. **D**
- Summing "more" modifiers. Each multiplies separately. **G**
- Reading a tree node's "increased" as increased. Look up the stat kind in `skill_node_effects.json`. **D**
- Reading "+100% crit multiplier" as ×4 because the sheet shows a 200% base. The math is `2.0 + 1.0 = ×3.0`. **X**
- Comparing DPS against a training dummy and expecting the same in monoliths: the level-100 DR alone is ×0.13. **D/A**
- Applying penetration before the 75% cap, or shred after it. **G**
- Counting "increased melee damage" for Ignite from a melee skill. **G**

## Open questions
- Damage variance distribution (uniform ±20% or other) and whether it applies before crit. **U**
- Whether intermediate damage values are rounded in the client (only roll quantization and final health/mana rounding are confirmed). **U**
- Whether enemy CritAvoidance (reduced by Critical Vulnerability) exists on any monster and how it orders against ChanceToBeCrit. **U**
- Order of SP112 ChanceToBeCrit relative to the attacker's increased crit chance (the engine adds it after). **D?**
- Exact semantics of `tags_when` for each partial conversion rule (rules derived from mutator text). **D?**
- Whether Acid Skin is +20% (data) or +25% (guide) chance to be crit in live 1.5.x. **U**

## Sources
- `vendor/lastepochbuilder/client/docs/ENGINE.md` §1 (tags, `tags_match`), §5.5 (conversion rules), §8.1–8.5 (buildDamageStats, crit, penetration, against enemy), §9.9 (projectiles).
- `vendor/lastepochbuilder/research/02_le_formulas.md` §1 (pipeline, tag rules, conversion), §3 (crit), §6.1–6.4 (res, shred, level DR), §10 (order, rounding), §12 (gotchas).
- `vendor/lastepochbuilder/research/07a_assets_core_data.md` §1.1 (stat normalization), §3.2 (rounding grid), §6 (affix value model).
- `vendor/lastepochbuilder/research/07b_assets_abilities_trees.md` §2.1 (ability fields), §4 (code-defined damage), §5 (verified ability table).
- `vendor/lastepochbuilder/research/07c_skill_mutators.md` §1 (tree stat types), §4.1–4.3 (area, non-X, doubled).
- `vendor/lastepochbuilder/research/07f_passive_weaver_trees.md` §3 (increased vs added in passives), §7 (ADE = 0.05 × base).
- `vendor/lastepochbuilder/research/07i_unique_formulas.md` §2 (per-N attribute stats, no floor).
- `vendor/lastepochbuilder/research/07n_defense_conversions.md` §1.1 (`damageModifier` at ApplyDamage).
- `vendor/lastepochbuilder/research/data/game/abilities.json` (Fireball record: damage, ADE, speed fields, attributeScaling, ignite chance 0.4).
- `vendor/lastepochbuilder/research/data/game/actor_scaler.json` (damageReduction table, formulas).
- `vendor/lastepochbuilder/research/data/game/ailments.json` (Critical Vulnerability, Blind, Acid Skin buffs).
- `vendor/lastepochbuilder/research/data/game/global_player_properties.json` (`statProperties` rounding).
- `vendor/lastepochbuilder/research/data/game/skill_conversions.json` (conversion rule kinds and counts).
- `vendor/lastepochbuilder/research/data/stat_tag_enums.json` (AT, ConditionalDamageProperty).
- `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (BaseDamage, DamageConversion, DamageEffectiveness, IncreasedAddedAndMore, CriticalStrikes, Penetrations, Resistances, AilmentMechanics, Terminology).
- `vendor/corpus/maxroll_damage-explained.md` (https://maxroll.gg/last-epoch/resources/damage-explained, updated 2026-03-27): crit multiplier arithmetic, variance, ADE on tree nodes, conversion examples.

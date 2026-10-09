# Judge verdict: Build-theorycrafting challenge (Last Epoch 1.5.2)

> Judge worked read-only in `D:/src/last-epoch-assistant.wt/integration` (no edits, no commits). Every data line below was pulled again by the judge through `yarn mcp:call` (call log: `scratchpad/judge/calls.log`). The judge's independent model is `scratchpad/judge/judge_model.py`. Run it with `python -I judge_model.py`. Labels: D, A, G, X, U as in the toolkit.
> Both agents' scripts reproduce their own text. `node A_model.mjs` is byte-identical to `A_model_output.txt`. `python -I model_B.py` matches `model_B_out.txt` except for a trailing newline. The judge's own arithmetic, computed from data the judge read separately, also reproduces both headline numbers exactly: A 33,181 (frostbite 30,672) and B 46,160. Any error therefore sits in the inputs and the readings, not in the arithmetic.

## 0. Result

| Criterion (max) | A: Cold Cleaver (FG Rive frostbite, Morditas' Reach) | B: Heraldry Orb (Spellblade void VO, Lament) |
|---|---|---|
| Originality proven (20) | **19** | **16** |
| Interaction correctness with citations (25) | **21** | **20** |
| Numeric model and calibration (25) | **21** | **20** |
| Build completeness and viability (20) | **15** | **13** |
| Honesty of labels and gaps (10) | **8** | **9** |
| **Total (100)** | **84** | **78** |

**Ranking: 1st A, 2nd B.** B's build deals about 1.5x more absolute boss damage (46-48k against 31-33k). A's build survives about 9x more reference hits (24.7 against 2.8). A's three chains are verified link by link, while B leans on two unverified scope questions (the Spellblade bonus and the Keplahan trigger). B's originality section also missed the closest existing guide and misreported it.

---

## 1. Proposal A: Forge Guard Rive frostbite with Morditas' Reach (uid 45)

### 1.1 Originality (verified)
- `builds {"mastery":"Forge Guard"}` returned 5 guides: forge-strike, shield-bash, multistrike, forged-weapons, shield-rush. None of them uses Rive.
- `builds {"ability":"Rive","any_skill":true}` returned 3 guides: rive-void-knight-guide, plus two Sentinel leveling guides (radiant-lance-leveling, paladin-leveling).
- `item_usage {"unique_id":45}` returned `total_builds 0` of 74.
- I also ran my own SQL: A's frostbite-evidence query, plus a check of every `community_build_skills` row for Rive across all profiles. It returned 31 rows (30 distinct guides). None is Forge Guard. The only Sentinel row is bleed-hammerdin-paladin.
- Foe Cleaver `sndr1:24` appears only in rive-void-knight (all 5 profiles) and in the two leveling guides.
- Nearest builds: A's two picks (Rive VK guide and frostbite-swarmblade-druid-guide) are the right nearest builds. **Originality holds.**

### 1.2 Interaction correctness, link by link
Verdicts: S = supported by data or a rule, P = plausible but unverified, C = contradicted.

| Link | Data line the judge pulled | Rule | Verdict |
|---|---|---|---|
| Morditas frostbite chance | `unique_mod 45` ord 3: SP1 Ailment Chance, special_tag 23, tags Melee (512), 5..5 | `damage-pipeline.md#4` tag subset; Rive `sndr1` tags 513 Physical,Melee | **S** |
| Foe Cleaver doubles that line | `sndr1:24` p10001 "Effect of Ailment Chance Stats on a 2h Weapon" +100% `per_point` (1 pt). Node text: "stats on that weapon that directly add damage, increase damage or add a chance to apply an ailment on hit, have double effect for Rive" | Node text covers an on-hit ailment-chance stat on the 2h weapon. The engine code for property 10001 is local, so it is not in the data. | **P, strongly text-supported.** A labelled it U, which is conservative. It is correctly named the riskiest assumption. |
| Chance >100% gives extra stacks | `ailments.md` summary 4 (G); catalogue §5 names Morditas | | **S** |
| Frostbite has no stack cap | `ailments` 23 `max_instances` 0. GroupedLimited 15 limits only the debuff part (`ailments.md#3`, A/G) | stacks = λ·T (`ailments.md#3`, D) | **S** |
| Strikes 1 and 2 only | `sndr1:21` Cadence (1,2,1,2,3) + `sndr1:23` "Rive skips its third strike" + `sndr1:15` Flurry +10%/pt on strikes 1 and 2 (per_point) | `speed-cooldowns-mana.md#2` | **S** |
| Iron Reach applies to ailments | `sndr1:26` "Strike Two Damage" +25%/pt, per_point, "more" in its text | `ailments.md#2` (X): more nodes that do not say "hit" reach ailments | **P** (A labels it U and gives a sensitivity: 21,224) |
| Snowdrift penetration | `unique_mod 233` ord 0: SP98 PP182 "Cold Penetration with Frostbite per 10% Freeze Rate Multiplier" 0.01 | catalogue §5 "Freeze chance multiplies…": `pp × FRM × 10` (D) | **S** for the line. Whether penetration has a cap is not stated anywhere (see toolkit finding T7). |
| Freeze rate multiplier sum 18.23 | Every source is SP67, modifier_type 0, untagged: Shackles 1.43..1.83, affix 14 T7 2.71..3.50 (gloves, relic), affix 14 T5 1.41..1.80 (amulet, rings), implicit `20:6` 0.1..1.0, blessing `34:89` 2..3. Slot eligibility of affix 14 (gloves, amulet, ring, relic) verified. | | **S** for the values. T7 rolls on legendary-potential (LP) slams are **U**. |
| Penetration reaches the DoT | `ailments.md#2` "Versus an enemy" resMult (D); affix 721 (Cold) also applies to frostbite | | **S** |
| Strength through Master of Arms | `kn-1:68` "Strength With 2h Weapon" +2/pt; Rive `attribute_scaling` +0.04 increased damage per point of attribute 0 (Strength) | `ailments.md` summary 2 (G): attribute scaling reaches ailments | **S** |
| Duration math | Shackles SP42 special_tag 23, 0.23..0.33 | `D_stack × (1 + durMore)`, `T = 3 × 1.33` (D) | **S**, applied correctly |

**Errors in A's interaction and build sheet:**
- "Minor Idol (2x1)" is **contradicted**. Minor Idol (base 26) is 1x1 (`idols-and-blessings.md` table, A). Four grid cells are left empty.
- Grand-idol prefix 119 at 0.60 is **contradicted**. The affix's `standard_affix_effect_modifier` is 0 and the Grand Idol's affix-effect modifier (AEM) is -0.33, so the factor is m = 0.67 and the real maximum is 0.40. A took 0.60 from community idols (`v_build_items_named` prints unscaled values). Minor idol health 105 behaves the same way: 30..80 is scaled by 0.17, so at most about 14, not 30.
- "No freeze immunity or cleanse" is **contradicted**. The data has "Potion Use Cleanses Stun and Freeze" on Shattered Chains (uid 180, belt) and Heirloom of the Last Nomad (uid 84, ring). A even modelled Shattered Chains in its own ES calibration.
- A does not flag that Frostbite Shackles (213), Mask of Indifference (434) and Anchor of Oblivion (152) all have `can_drop_randomly` = 0. That is 3 of A's 6 uniques with no stated way to obtain them.

### 1.3 Numeric audit (judge recompute)
- Rive swings per second: (1 + 0.40 + 0.30 + 0.30) × 0.98 (attack rate of `14:2`, A) × 1.25 (`sndr1` speed_multiplier, A) × 1.1 / 0.75 = **3.593**.
- Increased pool: 4.84 + 0.50 + 0.25 + 1.20 + 1.20 + 1.20 + 2.40 + 0.40 = 11.99, so ×12.99.
- More multiplier: 1.32 × 1.20 × 1.5 = 2.376.
- Damage per stack: 50 × 1.33 × 12.99 × 2.376 = 2,052.5.
- Application rate λ = 36.75 + 4.08 = 40.83 stacks per second, about 162.9 stacks at steady state.
- Damage vs a dummy: **81,615**.
- Resistance multiplier with penetration: 1 + 1.823 + 0.22 = 3.043. Boss level damage reduction leaves ×0.1235.
- Frostbite vs the boss: **30,672**. With Rive's hits (2,509): **33,181**. This matches A.
- Corrected for the Grand-idol scaling error (119: 0.60 → 0.402): frostbite 28,802, **total 31,311 (-5.6%)**.
- The judge's sensitivity runs, all with the idol correction:

| Case | Frostbite DPS | Total DPS |
|---|---|---|
| Foe Cleaver does not double the chance | 18,364 | 20,873 |
| No Snowdrift penetration | 11,547 | 14,056 |
| Iron Reach does not reach frostbite | 19,930 | 22,439 |
| Both Foe Cleaver and Snowdrift fail | 7,362 | **9,871** |

- **EHP:**
  - Health: (100 + 1000 + 6 × 29 + 588) × 2.00 = 3,724. Endurance threshold: 0.2 × 3,724 + 380 = 1,125. Pool: 5,411.
  - Armour: 1,161 × 8.19 × 1.05 = 9,984. At area level 100 the armour formula gives **77.3% damage reduction**. A's text says 76.9%, but its script uses 0.773, so this is a harmless slip in the prose.
  - Damage per hit after mitigation: 219, so **24.65 hits**. Worst case: 411 per hit, so **13.16 hits**. Both match A.
  - With the Minor-idol health correction, A survives 23.9 hits. This is not material.
- **Missing or doubled multipliers:**
  - None in the frostbite chain.
  - In the Rive hit, Foe Cleaver doubles only the unique's +30 cold melee line and not the 68 implicit. That is conservative and minor.
  - Frailty is labelled A, but it depends on uptime (U). The bottom line is U anyway.
  - The 4-second ramp is noted. The dummy figure is a steady-state number, not burst damage.

### 1.4 Viability (a corruption-1000 claim?)
- **Survivability is not the limit.** A melee hit's damage scales with the corruption multiplier, 11.8x at corruption 1000. Hits survived fall to 5 only at a multiplier of about 58, beyond any corruption level. In A's worst case the 5-hit line sits at about corruption 2,300. The spell proxy reaches it at about 1,400.
- **Damage is the limit.** A deals 0.032-0.034 of ES VK as A modelled it, and 0.063-0.067 of ES with its debuffs stripped (section 3).
- The toolkit's rare yardstick (`enemies-and-corruption.md`, worked example) puts a corruption-1000 rare at 73,400 health in post-reduction units.
  - Steady-state DPS would kill it in about 2.3 s.
  - From zero stacks it takes about 4.5 s, because stacks ramp over T = 4 s: damage dealt by time t < T is λ·D·t²/2T.
- Bosses: no boss health data exists in the toolkit.
- **Realistic band:** corruption 1000 is survivable, apart from freeze. Damage makes it a corruption 500-800 build for comfortable bossing, with slow kills at 1000.
- A never states a target corruption range. A gives the 0.034 ratio honestly but leaves the reader to draw the conclusion.

### 1.5 Honesty
Strengths:
- Labels mostly track reality. The bottom line is U.
- The riskiest assumption is the right one, and it comes with a concrete 2-minute test.
- Sensitivities are given for every U link.
- Dead stats are listed. A self-audit changed the build (it dropped Grand Trance of the Sirens after finding its special_tag is Shock).

Weaknesses:
- Three statements are contradicted by data: the idol size, the idol value, and "no freeze cleanse".
- Frailty is labelled A.
- No acquisition note for three uniques that do not drop randomly.

---

## 2. Proposal B: Spellblade void Volcanic Orb with Lament of the Lost Refuge (uid 273)

### 2.1 Originality (verified, with a reporting error)
- `builds {"ability":"Volcanic Orb"}` returned 0 guides. With `any_skill` it returned 2.
- `builds {"mastery":"Spellblade"}` returned 5 guides.
- `item_usage` returned 0 for uids 273, 182 and 468.
- **Spellblade with VO as the main skill: 0 of 74. Originality holds.**

But the judge's SQL over `community_build_skills` and `community_build_skill_nodes` shows two problems:
- **spellblade-leveling-guide** specialises VO in its "Intermediate Setup (lvl 11-37)" profile (`is_specialized` 1). The same profile also uses Mana Strike. Its "Final Setup" profile carries **9 VO nodes**: Molten Core 3, Monolithic Eruption 2, Volcanic Frenzy 2, Concentrated Effect 1, and others.
- B wrote "VO on the bar with **no** nodes, Final Setup tab". That is contradicted by the data.
- B also omitted this guide from its nearest builds. It is the closest existing build: a Spellblade running Mana Strike plus a specialised VO, although the main skill is Firebrand and it is a leveling guide.
- B's picks, glacier-sorcerer and flame-reave, are more distant.

### 2.2 Interaction correctness, link by link

| Link | Data line the judge pulled | Rule | Verdict |
|---|---|---|---|
| P1 Lament converts VO | `unique_mod 273` ord 0: SP58 AP78:6 "VO Base Damage Converted to Void" 1 | `damage-pipeline.md#10` (G): base and untyped added damage convert, typed added damage keeps its type | **S** |
| P2 Spellblade bonus copies the weapon implicit | `classes-and-masteries.md`: `addedMeleeGainedAsAddedSpell=0.4` (field only). Implicit `14:14`: SP0 Melee 160 (untyped). | **No rule exists** on scope (weapon implicit? passive flat melee? typed melee?) or on whether the copy is untyped Spell damage | **P/U.** Correctly labelled U. If it fails: -19% (judge figure), -23.6% (B's figure for removing the whole bonus). |
| P3 untyped damage follows the base type | `damage-pipeline.md#2` `flat × base_t/Σbase` (D) | | **S** |
| P4 ADE 2 | `vo54` component 0: fire 40, `added_damage_scaling` 2 | | **S** |
| P5 Heraldry | tooltip "+5 Spell Void Damage per stack"; `ability_properties` 78:7 alt text: 12 stacks, 12 s | | **S** (uptime U, and the rate simulation supports 12 stacks) |
| P6 triggered casts give no Heraldry | catalogue §2 "Directly…" (D?) | | **S**, conservative |
| P7 Keplahan's Cryolith fires off a re-tagged Mana Strike | `unique_mod 468` ord 0 (AP78:10): "…when you **directly** use a **cold melee attack**…(3 second cooldown)". `ms26:28` Frigid Grasp: "**Swaps Mana Strike's Lightning tag for a Cold tag**". Mana Strike `ms26` tags Lightning,Melee; mana cost 0. | Mana Strike is pressed directly, so "directly" is satisfied. The trigger rate is capped by its 3 s cooldown (D). | **P, strongly text-supported.** The engine's tag check after the tree mutation is U. If it fails: -20%. |
| P8 the cold orb still comes out void | Lament alt text: "cannot freeze even if previously converted to cold" | This text implies Lament's conversion overrides a cold conversion | **P, supported by text** |
| P9 melee cooldown recovery | `unique_mod 273` ord 1: PP211 0.18..0.30 | | **S**. B admits it adds nothing under the per-point reading. Honest. |
| P10 Evade keeps Heraldry | B left this U. `abilities.is_traversal` = 0 for every Evade id (`evade1`..`evade5`). | | Data already answers it in B's favour (A) |
| Per-point tree values (B's "riskiest") | `skill_tree vo54`: Molten Core, Volcanic Acceleration, Monolithic Eruption, Orb of Speed and Volcanic Frenzy all `scaling: per_point` | `damage-pipeline.md#5` "points scale linearly" (D) | **S.** B's riskiest-assumption flag is misplaced: this is the best-supported link in the chain. |
| Rune Sap | `ms26:4` p5048 "Global Spell Damage Per Enemy Hit" 4%/pt; "doubled when hitting a boss or rare"; "can stack" | Placed in the increased pool, which is correct (a player buff, not damage taken) | **S** for placement. No stack cap in data (U, labelled). |
| Quintessence of Triumph "7% more" | `mg-1:54` ord 1 is labelled "More Spell Damage" but stored as **property 41, Adaptive Spell Damage** (an added stat) | | **U.** The data line contradicts itself. B labelled it A/U. Worth ×1.07. |
| Infused Weapon "+2 melee per point" | `mg-1:35` ord 0 is **property 5110** (a local code property, unnamed) | | **U.** B labelled it A, a minor overclaim. Worth about 2%. |
| Essence Duel melee attack speed | `mg-1:77` ord 0 is property 54 with property_name literally `'None'` | | **U.** Labelled A. |
| Idol values | 912 has std -0.33 and sits on an Ornate idol (AEM 0), so m = +0.49: **+12** per line, not +8. 897, 1051 and 1054 (std -0.33) on a Grand idol need **no** rescale, but B scaled them by 0.67. 178 (std 0) on a Grand idol is correctly 0.67x. | | B **under**-counted all of these: void bucket 649.6 → 672.0 (+3.4%), plus about 9 ward/s, 6.6 decay threshold and 13 stun avoidance |

### 2.3 Numeric audit (judge recompute)
- Void bucket: 40 + 2 × (196 + 32 + 76.8) = 649.6.
- Increased pool: 16.327, so ×17.327. More multiplier: 13.542.
- Crit factor: 1.075. Resistance multiplier with penetration: 1.37. Boss level damage reduction: ×0.1235.
- Per orb: **27,724**. At 1.665 orbs per second: **46,160**. This matches B. Arithmetic is exact.
- Rate check: VO use time 0.75 / (1.1 × 1.95) = 0.350 s. Cooldown 3.0303 / 5.34 = 0.567 s (`vo54` cooldown_seconds 3.030303, max_charges 1, A). Mana Strike use time 0.402 s. The VO-then-Mana-Strike cycle is 0.752 s, so 1.33 casts per second. This is consistent with the simulation.
- With the 912 idol correction: **47,752**.
- The judge's sensitivity runs, all with that correction:

| Case | DPS |
|---|---|
| Spellblade bonus ignores the weapon implicit | 38,656 |
| No Keplahan orbs | 38,202 |
| Quintessence is not a 7% more | 44,628 |
| Rune Sap gives 0 | 44,233 |
| Both the implicit and Keplahan fail | **30,925** |

- **EHP:**
  - Health: 1,932. Endurance threshold: 386. Ward retention: R = 2.62.
  - Steady-state ward with G = 447.2 ward/s: W_ss = 437 + 2,966 = **3,402** (formula from `ward-health-sustain.md#3.2`).
  - Pool: **5,914**.
  - Armour 336 gives 12.18% damage reduction, so a hit lands for 2,115. **2.80 hits.** This matches B.
- Mana: costs 45.1/s against income 50.3/s, net +5.2/s. Verified line by line, including Mana Drain (4 × 20% more), Transfusion and Mana Reaver.

### 2.4 Viability (a corruption-1000 claim?)
- B makes no corruption-1000 claim. It raises its own red flag: "corruption 300-500 character as written".
- Judge's check: the 5-hit line falls at an enemy multiplier of 11.8 × 2.8 / 5 = 6.6, which is about **corruption 550**.
- At corruption 400 B survives 6.7 hits. At 300 it survives 8.7.
- Damage: 46-48k sustained, with no ramp. It kills a corruption-1000 rare (73,400 in post-reduction units) in about 1.6 s.
- **Realistic band: corruption 300-550.** B's own statement is accurate.
- The residual risk is a 39% stun chance per landed hit outside Flame Ward (B's formula, verified).

### 2.5 Honesty
Strengths:
- The defensive weakness is stated plainly.
- Sensitivities and the part-removal check are useful.
- Uncounted upside is disclosed: in-flight shrapnel still spawns every 0.08 s, because Concentrated Effect disables only the final shrapnel.

Weaknesses:
- The nearest-build misreport.
- The misplaced "riskiest assumption".
- Several A labels on local or mismatched properties (5110, 54, 41).

---

## 3. Calibration cross-check: ES VK 983k (A) against LB Runemaster 407k (B)

- **Arithmetic:** both are exact.
  - ES: 1,604 × 11.24 × 14.53 × 4.68 × 1.46 × 1.36 × 0.1235 ≈ 300.6k from the void part, about 312k per hit, × 3.15 hits/s.
  - LB: 186.5 × 17.36 × 2.383 × 5.16 × 1.19 × 0.1235 = 5,851 per hit × 52.3 hits/s, plus Spark Charge 6,477 × 15.7/s.
  - B's 5 hits per cast is supported by data. `lb23il:18` Convergence reads "chains now hit the same target… half as many times rounded up": 1 + ceil(7/2) = 5. Double and quadruple casts give 1 + 0.32 × (0.7 + 3 × 0.3) = 1.512. Frontloaded averages to 1.20.
- **Methods diverge on debuffs.**
  - A's ES includes the build's own debuffs: void shred and Woe/Flames give a resistance multiplier of 1.46, and 32.8 armour-shred stacks push the boss to negative armour, which gives ×1.36 (`damage-pipeline.md#8`). That is ×1.99 in total. A's ES rate is also **mana-limited** (1.39 uses/s, against a speed limit of 1.88).
  - B's LB declares "no shred, no curses". But it keeps shock- and ailment-conditional multipliers (Shattershock ×1.12 against shocked enemies, Mad Alchemist's Ladle ×1.30 for 5 assumed ailments) and drops the shock resistance shred that makes them true. B never checks LB's mana at 10.46 casts per second.
- **Aligned, they agree.** Stripping A's debuffs gives ES ≈ 495k, and **ES/LB = 1.22** instead of 2.41. That is consistent for two S-tier bossing guides (`v_build_summary`: both have tier_bossing S).
- **Which is closer to `damage-pipeline.md`?** A's. The pipeline has explicit terms for shred, negative armour, damage taken and SP117 conditionals, and A also applies the cooldown and mana cap (`speed-cooldowns-mana.md` summary 5). B's convention is a simplification that it applies inconsistently.
- **Common-scale ratios:**

| Reference | A | B |
|---|---|---|
| ES without its debuffs | 0.063-0.067 | 0.093-0.096 |
| LB as B modelled it | 0.077-0.081 | 0.113-0.117 |

B's build is about **1.45x** A's in absolute boss DPS.

---

## 4. Score justifications

**A, Originality 19/20.** The mastery and damage-source combination and the 0/74 core unique are proven with `builds`, `item_usage` and a reproducible SQL file. My re-runs reproduce the results. The nearest builds are correct and explained. One point off because the frostbite query returns a duplicated row and is presented as 31 rows rather than 30 distinct guides. Trivial.

**A, Interaction 21/25.** Every link in the three chains has a data line and a rule, and the judge verified each one. The Foe Cleaver reading is better supported than A claims. The FRM sources and slot legality all check out, and the ailment rules (stacks = λ·T, no cap, duration math, attribute scaling, no flat damage) are applied correctly. Deductions:
- the Minor-idol size and the idol value are contradicted by data;
- the penetration magnitude (+182%) is never checked against a possible cap, and the toolkit is silent on it;
- Iron Reach reaching ailments remains U.

**A, Numeric 21/25.** The main chain is correct, faithful to the pipeline, and reproducible. The ES calibration is the most careful in the challenge (mana-limited rate, armour shred, echoes), with a central and an upside figure. Deductions:
- the idol scaling error (-5.6%);
- the armour damage reduction in the text does not match the script;
- the ratio is reported only against an ES that includes its debuffs, so A's ratio looks 2x worse than on a common scale (A does name the exclusions).

**A, Completeness and viability 15/20.** The sheet is complete: 113 passives with gate checks, five skill trees with valid paths, all affixes legal for their slots, blessings, a mana loop, and EHP from several layers. The build survives corruption 1000. Deductions:
- freeze is left open, even though a cleanse exists (Shattered Chains, uid 180);
- three uniques that do not drop randomly have no acquisition plan;
- four idol cells are unused;
- damage sits at 3-7% of an S-tier build, with a 4 s ramp.

**A, Honesty 8/10.** The riskiest assumption is correct, every U link has a sensitivity, and dead stats are listed. Three factual statements are contradicted by data. Frailty is labelled A. No explicit corruption band is given.

**B, Originality 16/20.** VO main 0/74, Spellblade VO 0/74 and the core unique 0/74 are all proven. But B misreported the nearest guide ("no nodes", where the data shows 9 nodes plus a specialised Intermediate Setup with Mana Strike) and left the closest build out of its list.

**B, Interaction 20/25.** The conversion, untyped-added and ADE rules are applied correctly. The Keplahan/Frigid Grasp and Lament-overrides-cold readings are well supported by text, and the "directly" rule is applied conservatively. Deductions:
- the Spellblade scope rests on an undocumented field;
- three passive lines are labelled A while their property ids are local or contradict their labels;
- the one link the data does confirm (per-point values) was promoted to "riskiest";
- B did not use `is_traversal` for Evade.

**B, Numeric 20/25.** The main chain is correct, and the discrete rate simulation, Rune Sap placement, ward steady state and mana loop are all good. Deductions:
- the idol scaling is mishandled in both directions (small, net underclaim);
- the LB calibration is internally inconsistent on debuffs and ignores LB's mana limit, which leaves the 407k unchecked.

**B, Completeness and viability 13/20.** The sheet is complete, with leveling bands, all resistances capped, a stun calculation and a ward loop. But 2.8 hits at corruption 1000 confines the build to corruption 300-550. There is no increased-health line anywhere, and stun risk is 39% per landed hit outside Flame Ward. Two of the three uniques are irreplaceable.

**B, Honesty 9/10.** The weakness is stated up front and the realistic corruption band is accurate. Upside is disclosed and sensitivities are given. One point off for the nearest-build misreport and the overlabelled local properties.

---

## 5. Toolkit findings (inputs for the next fix pass)

| # | File or table | What is wrong or missing | Suggested fix |
|---|---|---|---|
| T1 | `mods` (`skill_node`, `passive_node`); `skill_tree` / `passive_tree` output | `modifier_type` is NULL on **every** tree row, so more, increased and added are indistinguishable. Foe Cleaver `sndr1:24` ord 0 is stored as **property 0 "Damage" value 1 ("+100%")**, the same shape as a +100% damage line. Molten Core "Orb Damage" is likewise a plain property 0. | Carry `stat_kind` (more / increased / added / local) from `skill_node_effects.json` into `mods`. Flag rows where `label` ≠ `property_name` (`label_overrides_property`). |
| T2 | `mods` passive rows | `mg-1:54` ord 1 is labelled "More Spell Damage" but stored as **property 41 Adaptive Spell Damage**. `mg-1:77` ord 0 has property 54 with `property_name 'None'`. `mg-1:35` ord 0 is property 5110 with no name. `kn-1:65` reuses 5110 for "More Melee Damage With Mace". | Decode the class-tree 5000+ local properties per tree, or return `property_kind: "local"` with a warning. Document in `stat-model.md` that local property ids are tree-scoped. |
| T3 | Idol values: `mods` affix_tier, `v_build_items_named.affixes_text`, `idols-and-blessings.md` | Stored ranges are authored at each affix's `standard_affix_effect_modifier`. The real value is `(1+itemAEM)/(1+std)`. Both agents got it wrong: A used 119 at 0.60 on a Grand idol (real 0.40) and 105 at 30 on a Minor idol (real ≤14). B used 912 at 8 on an Ornate idol (real 12) and rescaled 897, 1051 and 1054 by 0.67 when they need none. The community view prints unscaled idol values, which A copied. | Add a view `v_idol_affix_values(affix_id, idol_base_type_id, tier, min, max)` with the formula applied. Apply the scaling in `affixes_text`. In `idols-and-blessings.md`, add the std column and the worked formula next to the size table. |
| T4 | `le-build-audit` Step 1 idol recipe | Lists base ids 25-33 with no grid size, so A called Minor Idol 2x1. | Add WxH and AEM to the recipe line (the table already exists in `idols-and-blessings.md`). |
| T5 | `ailments.md#6`, `defenses.md`, `le-defense-reasoning` | Freeze is modelled only as a formula. No list of player-side answers exists. The data has exactly two cleanses: "Potion Use Cleanses Stun and Freeze" on Shattered Chains (uid 180, Shade-only at corruption 150 per `enemies-and-corruption.md`) and Heirloom of the Last Nomad (uid 84). It has no freeze-immunity stat. A wrote "no freeze cleanse". | Add a "stun and freeze answers" table (cleanses, ward and health in the denominator, Frostbite stack cap, potion cleanse) and a red-flag step in `le-defense-reasoning` that queries it. |
| T6 | `reference/classes-and-masteries.md` mastery table; catalogue §1 "Melee added damage reused as spell damage" | `addedMeleeGainedAsAddedSpell=0.4` is listed with no semantics: does it cover weapon implicits or passive flat melee, does it keep the type, does it need a melee weapon? The catalogue entry names Bane of Winter, Heorot and affix 988, but not Spellblade. B had to leave its second-largest link U. | Add the in-game mastery text (G) and the field semantics. Add Spellblade to the catalogue entry. |
| T7 | `damage-pipeline.md#8`, `ailments.md#2`, catalogue §5 PP182 | Nothing states whether penetration is capped, so A's +204% penetration (×3.04) has no rule. The catalogue PP182 formula `pp × FRM × 10` does not say whether FRM includes the base 1.0 (worth +10% penetration). | State "no penetration cap in code (D)" or open the question explicitly. Specify the FRM base in the PP182 entry. |
| T8 | `le-damage-reasoning`; no shared calibration convention | The two agents' S-tier calibrations differ 2.41x. Mostly convention: A includes the guide's own shred and negative armour (×1.99) and its mana-limited rate. B excludes shred but keeps shock-conditional multipliers and skips the mana check. Aligned, they differ only 1.22x. | Add a "calibration convention" step: include debuffs the build applies, with modelled uptime; apply the cooldown and mana cap; report with and without debuffs. Better: ship precomputed reference boss DPS for 3-4 Maxroll guides, so agents do not each rebuild them. |
| T9 | `enemies-and-corruption.md` worked example; no boss table | Boss health pools are absent, so no time-to-kill is possible. The rare example multiplies health by (1 − 0.87) and then divides damage by (1 − 0.87). The "post-DR health" unit is confusing (A reused it as "73,400 on the post-DR scale"). | Add boss health (or state explicitly that it is not in the data). Rewrite the example in one unit system. |
| T10 | `ailments.md#3` | Only steady-state formulas. There is no ramp formula, although ailment builds against fast-dying targets need it: damage by time t < T is λ·D·t²/(2T). A noted the ramp but could not quantify it. | Add the ramp formula and a "first-N-seconds DPS" line. |
| T11 | `uniques.can_drop_randomly`, derived `lp_eligible` | Frostbite Shackles 213, Mask of Indifference 434, Anchor of Oblivion 152 and Shattered Chains 180 all have value 0, and no table says where they come from (boss, Shade, dungeon). A did not notice. | Add an acquisition-source column or knowledge table. Make `le-build-audit` Step 1 flag `can_drop_randomly = 0`. |
| T12 | `skill_tree {"compact":true}` | Compact output drops `description`, where "directly", "on hit", "for Rive" and "core vs shrapnel" semantics live (the Foe Cleaver text lives only there). | Keep `description` in compact mode, or print a warning. |
| T13 | `community_build_skills` against `community_build_skill_nodes`; `builds {"any_skill":true}` | spellblade-leveling-guide "Final Setup" has VO `is_specialized` 0 but 9 VO nodes allocated. `builds {"mastery":"Spellblade"}` returns a guide whose `mastery_name` is "Mage". `any_skill` results do not show which profile specialises the skill, so B missed its closest build. | Reconcile `is_specialized` with node presence. Return per-profile `specialized` and `node_count` in `builds`. Document the mastery fallback. |
| T14 | `abilities.is_traversal` against unique text "Traversal Skill" | The data answers whether Evade is traversal (it is not), but no knowledge page connects this to "lost when you use a Traversal Skill" uniques. B left it U. | Add one line to `speed-cooldowns-mana.md#8` or the catalogue. |
| T15 | Process | Both agents shared `scratchpad/challenge/` and overwrote each other's scratch files and `calls.log`. A had to re-run cited SQL from `A_work/`. | Give each agent its own working directory and call log. |

What worked: both agents applied "ailment base damage ignores added damage, ADE 0" (`ailments.md` summary 1), the conversion rules, level damage reduction on DoT, the "directly" rule and the mastery access rule correctly. Those pages did not mislead anyone.

## 6. Judge MCP call count
**46 `le-data` calls** through `yarn mcp:call` (logged in `scratchpad/judge/calls.log`): 19 `sql`, 9 `get`, 6 `item_usage`, 5 `builds`, 5 `skill_tree`, 2 `passive_tree`. Two `sql` calls failed on a column-name error and were re-issued; both are included in the 46.

## 7. Files
- Verdict: `C:\Users\Genesis\AppData\Local\Temp\claude\D--src-last-epoch-assistant\2a02c54d-b8b3-416e-bc0a-3ef48c1c23fd\scratchpad\challenge\JUDGE.md`
- Judge model: `C:\Users\Genesis\AppData\Local\Temp\claude\D--src-last-epoch-assistant\2a02c54d-b8b3-416e-bc0a-3ef48c1c23fd\scratchpad\judge\judge_model.py`
- Judge SQL and call log: `C:\Users\Genesis\AppData\Local\Temp\claude\D--src-last-epoch-assistant\2a02c54d-b8b3-416e-bc0a-3ef48c1c23fd\scratchpad\judge\` (`q*.sql`, `calls.log`)

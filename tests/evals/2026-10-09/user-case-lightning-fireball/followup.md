# Follow-up: the player's real setup (machine-gun Fireball + Harbinger + Heat Flux)

Data: le-data, game 1.5.2. Labels: A = asset data, D = decompiled/knowledge formula, G = in-game guide, X = community/planner, U = assumption. Simulation: `scratchpad/mana/sim.js` (time-stepped, 3000 s per case).

## 0. Headline

**Your loop is mana-bound, not crit-bound.**
- **Potential demand.** With 4 projectiles that can all hit one target (Embers) and Frost Claw crits from Heat Flux, Harbinger would fire about 1.0 Meteor/s on a boss and about 2 Meteors/s in a pack. At 53 mana each that is roughly 55 mana/s on a boss and 110 mana/s in a pack.
- **Actual rate.** Your income is about 17–30 mana/s. Meteors therefore fire as fast as mana allows: about 0.33/s today.
- **The real symptom.** Fireball costs 4.6, so it is blocked whenever a Meteor pushes you below 0. **Fireball is blocked about 49% of the time on bosses and 70% in packs.** That is what "mana is killing me" looks like.
- **The cheapest fix is Aftermath** (3 points). Its refund stops at the next Meteor, but the next refund starts immediately, so at your Meteor rate it pays a steady stream.
- **Getting Fireball to 0 is impossible with your tree on Vilatria's Downfall**, unless you stand still (Foot of the Mountain) or swap staff bases. Section 1 shows the number that blocks it.

## 1. Reverse-engineering the 4.6

Inputs, all from tree and item data (A):
- Base cost 3 (`abilities fi9`).
- Fire Spray `fi9:7`: +5 mana cost (flat).
- Mana Sphere `fi9:22`: −1 mana cost per point (flat), 3/3 → −3.
- Moon Staff implicit `15:7`: −3..−4 mana cost on spells (flat, Spell-tagged); your roll is −3.
- Piercing Heat `fi9:2`: +33% mana cost per point (increased). The row value is exactly 0.33.
- Embers `fi9:11` and Dancing Fire `fi9:12` have **no mana lines**.
  - Embers: −50% extra projectiles, and −5% cast speed per extra projectile (multiplicative).
  - Dancing Fire: +1 extra projectile per point, not reduced by the Embers penalty.
  - Result: Fire Spray's 2 extra become 1, plus Dancing Fire's 2, gives **4 projectiles** (A).

The engine formula is `cost = (base + Σadded) × (1 + Σincreased)` (D, `speed-cooldowns-mana.md#5`). That gives **2 × (1 + 0.33·N)**:

| Piercing Heat points N | Cost |
|---|---|
| 2 | 3.32 |
| 3 | 3.98 |
| **4** | **4.64 → shows as 4.6** |

So **N = 4**, not 2–3.
- **The other formula order also fits the 4.6, at N = 1.** That order is "increases first, flat reductions last": (3 + 5) × 1.33 − 6 = 4.64.
- **Your Frost Claw rules that order out.** Frost Claw's inputs are base 12 (A), Gift of Winter `frc87w:4` −2/pt ×3, Frozen Reign `frc87w:30` −3, the staff's −3, and Volley of Glass `frc87w:29` +100% increased.
  - Under the engine order: (12 − 6 − 3 − 3) × 2 = **0**. That matches your tooltip.
  - Under the other order: 24 − 12 = 12.
- **So:** the order is flat first, then increased, and N = 4 (A inputs, D formula, confirmed by your tooltip).

**Consequence: your flat sum is +2, and nothing that multiplies can take +2 to 0.** Removing every Piercing Heat point only reaches **2.0**.

Levers, ranked by cost to the build:

| # | Lever | New Fireball cost | Reaches 0? | What it costs |
|---|---|---|---|---|
| 1 | **Foot of the Mountain** (uid 253, boots): −2 per stack, 1 stack per second standing still, max 3 (A) | 1 stack: (2 − 2) × 2.32 = **0**; 3 stacks: 0 | **Yes, only while standing still.** Assumed: stacks drop when you move, and the cost returns to 4.64 (U) | Boots slot. The Lightning Blast Runemaster guide uses it for exactly this (build 1 notes, X) |
| 2 | Staff with a −5 implicit: Temple Staff 15:10 or Abyssal Staff 15:14 (A), carrying **Vilatria's Downfall Reforged** (affix 819) | (3 + 5 − 3 − 5) × 2.32 = **0** | Yes | Loses the unique's +200–400% increased lightning and +100–200 mana (uid 186, A). **You will not do this while on the unique.** A −4 Moon Staff roll only reaches 2.32 |
| 3 | Helm affix **548 "Fireball Pierce Chance"** (Mage helmet prefix; T5 46–60% pierce + 41–60% increased spell damage, T7 80–100%, T8 100%) (A). Use it to cut Piercing Heat from 4 to 1 (keep 1 point for Immolated Core `fi9:3`) | 2 × 1.33 = **2.66** | No | 1 helm prefix; frees 3 Fireball points. T7 548 + 1 Piercing Heat point = 105%+ pierce |
| 4 | Helm affix **690 "chance to gain 20 Mana when you directly cast Runebolt or Fireball"** (Mage helmet prefix; T5 16–20%, T7 31–38%, T8 61–76%) (A) | It is a gain, not a reduction. Expected per cast: T5 +3.6 vs cost 4.64 (net −1.0); **T7 +6.9 (net +2.3)**; T8 +13.7 | No, so it does not enable Unsealed Mana | 1 helm prefix. 548 and 690 together fill both prefixes; put Storm Crown Reforged (820) in the sealed slot (X: the Lightning Blast guide seals 820 on a rare helm) |
| 5 | Bluefeather Band (uid 440): 48–54% *less* spell mana cost (A) | 4.64 × 0.46–0.52 = **2.1–2.4** | No | Ring slot; 48–54% less max mana and less mana regen. Its own bonus needs 0-cost skills. **Do not take it** |
| 6 | Sorcerer, Spellblade or Runemaster passives that reduce spell cost | — | **None exist** (A: no SP66/SP69 rows in `mg-1`) | — |
| 7 | Idols with spell mana efficiency | — | **None for Fireball.** Only affix 195 (void spells) and affix 716 (Frost Claw only) (A) | — |
| 8 | Mastery bonus | — | It is not a cost reduction. Sorcerer: +50 max mana and PP464 "0.5% more spell damage per mana cost" (A, `classes-and-masteries.md` row 38) | Going to 0 loses about 2.3% Fireball damage |

Also dead:
- Cinder Song (wand: −3 fire spell cost, +2 Fireball projectiles) and Spirit Xylem (staff: 10–20% reduced spell cost) both cost you the Vilatria weapon slot.
- Caretaker's Regrowth is Primalist-only (A).
- Affix 506 rolls on sceptres only (A).
- Dropping Fire Spray breaks the chain: Embers requires Fire Spray (`fi9:11` is unlocked by `7>=1`, A).

## 2. Meteor rate and mana budget with your real hit count

Shared inputs:
- **Hits per cast.** Embers "fire in sequence ... and can now hit the same target" (A). Boss: **4 hits per cast**. Pack: 4 projectiles with Piercing Heat 4/4 (100% pierce), assumed 8 hits per cast (U).
- **No chain hits exist.** Dancing Fire only adds projectiles (A, `fi9:12`). Every hit is a Fireball hit.
- **Cast speed.** 87% increased (27% T7 slam + Mage Flurry 15% + Arcane Momentum 25% + Adept 20%; U). Embers penalty ×0.85 for 3 extra projectiles (U whether Dancing Fire's projectiles count toward it). Result: **2.33 casts/s**, or 2.52 with Craterborn (+15%, A).
- **Crit.** 70% (U); Frost Claw crit 50% (U).
- **Harbinger** chance 9% (A).
- **Meteor cost** 53 = 56 − 3 (A).
- **Regen** 16 mana/s (U).
- **Cycle of Fire** `me27:26` 3/3: +6 mana per direct Fireball while Craterborn is up (A). Craterborn from Harbinger Meteors is confirmed by you.

**Frost Claw crits do trigger Harbinger.**
- PP247's text is "Chance to Cast Meteor on Crit if above 0 Mana". Its alt text is "This consumes Meteor's Mana Cost. **Does not include crits from Meteor itself.**" (A, `player_properties.idx=247`). The decompile hooks the generic `CharacterMutator.OnCrit` (D?).
- So any crit except a Meteor's own counts, including triggered Frost Claws.
- Heat Flux `me27:27` reads "1 Frost Claws" per point, so 3/3 = 3 Frost Claws per impact (A). With Volley of Glass, all 3 projectiles hit one target (A). That is 9 hits per Meteor.
- In the simulation, Frost Claw crits are **13–38% of all crit events**.
- **But in a mana-bound loop they add zero Meteors.** "Without Heat Flux crits" gives the same 0.33 Meteors/s. Heat Flux is now a **damage** node only, and possibly a mana cost (next paragraph).

**Heat Flux cost (verify in game).**
- The node text is "Meteors cast {Frost Claw} towards a nearby enemy on impact, consuming **120% of Frost Claw's mana cost**" (A, `me27:27` description; there is no consumption stat row).
- The data cannot say whether "Frost Claw's mana cost" means the current, modified cost (0) or something else.
- Second catch: Gift of Winter's text is "**Directly casting** Frost Claw costs less mana" (A, `frc87w:4`). If its −6 applies only to direct casts, then a Heat Flux Frost Claw costs (12 − 3 − 3) × 2 = 12, and 12 × 1.2 = **14.4 each, 43 mana per Meteor** (U).
- The simulation shows what that case does (table row "if Heat Flux charges 43"). Test 1 settles it.

Results (meteors/s ≈ spendable income / 53; the "net" is ~0 by construction because Meteors absorb any surplus):

| Setup | Boss: Meteors/s / Fireball casts/s / Fireball stalled | Pack: Meteors/s / Fireball casts/s / Fireball stalled | Spendable income (boss) |
|---|---|---|---|
| **Now** (cost 4.64, Cycle 3, Heat Flux 3, no Aftermath) | 0.33 / 1.27 / **49%** | 0.32 / 0.76 / **70%** | 16 regen + 7.2 Cycle − 5.9 Fireball = 17.3 |
| Now without Cycle of Fire | 0.19 / 1.31 / 47% | 0.21 / 1.10 / 56% | — |
| Now, if Heat Flux charges 43 | 0.16 / 0.62 / 74% | 0.16 / 0.37 / 85% | — |
| **Now + Aftermath 3** | **0.52 / 1.81 / 27%** | **0.53 / 1.19 / 52%** | +9.0 to +10.2 from Aftermath |
| Now + Aftermath 1 | 0.39 / 1.48 / 40% | 0.39 / 0.92 / 63% | +2.9 to +3.3 |
| Now + helm 690 T5 | 0.42 / 1.50 / 40% | 0.39 / 0.88 / 65% | +4.9 |
| Now + helm 690 T7 | 0.56 / 1.71 / 32% | 0.46 / 0.99 / 60% | +11.8 |
| Helm 548 (Piercing Heat 1, cost 2.66) + Aftermath 3 | 0.59 / 1.93 / 23% | 0.58 / 1.28 / 49% | — |
| Regen 22 instead of 16 | 0.45 / 1.64 / 34% | 0.44 / 1.02 / 59% | — |
| **Cost 0** (Foot of the Mountain), Cycle | 0.58 / 2.50 / **0%** | 0.59 / 2.50 / 0% | Cycle 14.7–15.0 |
| Cost 0, no Cycle, no Unsealed | 0.30 / 2.49 / 0% | 0.30 / 2.50 / 0% | — |
| Cost 0 + Unsealed, no Cycle | 0.37 / 2.70 / 0% | 0.37 / 2.70 / 0% | Unsealed +3.7 |
| **Cost 0 + Unsealed + Cycle** | 0.67 / 2.70 / 0% | 0.68 / 2.70 / 0% | 16 + 16.0 + 3.7 |
| **Cost 0 + Unsealed + Cycle + Aftermath 3** | **0.84 / 2.70 / 0%** | **0.88 / 2.70 / 0%** | + Aftermath 9.6–10.5 |
| …same, if Heat Flux charges 43 | 0.47 / 2.70 / 0% | 0.48 / 2.70 / 0% | — |
| Cost 0 + Unsealed + Cycle + Aftermath 3 + 690 T7 | 1.03 / 2.70 / 0% | 1.23 / 2.70 / 0% | + 690 at 18.3 |

**Aftermath: your read is half right.**
- "You lose the remaining mana if you cast Meteor again within three seconds" is the node text (A, `me27:24`).
- At 0.3+ Meteors/s there is always one refund running. Assuming the payout is linear over 3 s (U), you collect a steady **0.2 × points × 53 / 3 ≈ 3.5 mana/s per point**.
- My Route 1 model already had the refund ending at the next Meteor. Its Aftermath figure (about 9–10 mana/s) still holds; the simulation reproduces 9.0–10.5.
- **Worth it: yes, all 3 points.** You already have Force of Impact (needed for Heat Flux), so it costs exactly 3 Meteor points. Best value in this report: **+57–63% Meteors, and Fireball stall drops from 49% to 27% on bosses.**

**Unsealed Mana** (`mg-1:56`, Runemaster, mastery requirement 0, 5 points): +15 mana and +45 ward per 3 zero-cost direct casts, 3 s cooldown (A). That is about **3.7 mana/s and 11 ward/s**, plus +15% cast speed. Only usable at cost 0, which in practice means Foot of the Mountain.

## 3. What you are plausibly missing

Only items with a number attached.

### Meteor tree (Meteor is converted to lightning; "Does not affect Shrapnel", A uid 186 alt text)
- **Aftermath `me27:24` 3/3**: +9–10.5 mana/s (above).
- **Stardust `me27:10` 4/4**: +20% more non-fire damage per point, so +80% more for your all-lightning Meteor (A). Requires Infernal Descent `me27:2` 1 point (+12% more per point). Infernal Descent's −5% cast speed per point only slows direct casts (U).
- **Crushing Force `me27:4`**: +8% more per point, plus +10% per point vs full-health enemies (A).
- **Extinction `me27:19` → Astral Cataclysm `me27:20`**: +3% base crit per point, then +30% crit multiplier per point (A).
- **World Ender `me27:23`** (always crits above 400 mana) is **dead for you**: average mana in your loop is −15 to +57 today.
- **Mana Fall `me27:17`** (+40% mana efficiency) would cut Meteor from 53 to 37.9, which means **about 40% more Meteors per mana**.
  - Its path goes through Twin Meteors `me27:12` (+50 mana cost) and Distant Craters `me27:13`.
  - If the +50 applies to triggered casts: (53 + 50) / 1.4 = 73.6, a loss.
  - The node says "When directly cast …", so it may not apply (U). About 7 points; test before committing.
- **Avoid:**
  - Celestial Celerity `me27:3` (+10% cost per point).
  - Infernal Column `me27:16` (+15% cost).
  - Shattering Star `me27:5`: Shrapnel stays fire under Vilatria's conversion (A).

### Frost Claw tree
- **Spark Artillery `frc87w:6`**: converts Frost Claw's cold base damage to lightning, frostbite chance to shock chance, and swaps the Cold tag for Lightning (A). Requires Artor's Sceptre `frc87w:9` ≥ 1 point or Spark of Celerity `frc87w:32` ≥ 1 point.
  - Your 9 Frost Claw hits per Meteor would then scale with Vilatria's +200–400% increased lightning, Liath's +45–75%, Storm Crown's 12–20% lightning penetration, and Crackling Precision's doubling.
  - This is the biggest damage item you are probably missing. You lose chill and freeze.
- **Shiver Shell `frc87w:16`**: "When you cast Frost Claw **by any method** you gain Ward", 3 per point (A). At 3/3: 9 ward per Frost Claw × 3 per Meteor = 27 ward per Meteor, about **9–23 ward/s** at 0.33–0.84 Meteors/s.
- **Gift of Winter `frc87w:4`**: its 12% chance to gain 12 mana is "on Direct Cast" (A), so it gives 0 from Heat Flux casts. Keep it only for the cost line.
- **Spark of Celerity `frc87w:32`**: +12% mana efficiency per point. Only worth it if Test 1 shows Heat Flux charges mana: 5 points would cut 14.4 to 9.0 per Frost Claw.

### Fireball tree
- **Plasma Ball `fi9:5`** (if you do not have it): together with Liath's 50% it gives a fully lightning Fireball, adds the Lightning tag (so Storm Crown's +1 lightning spell level applies), and +35% crit multiplier (A). Requires Orb of Destruction `fi9:4` 1+ point (+1.5% base crit per point).
- **Immolated Core `fi9:3`**: +10% lightning penetration per point, 5 points = +50% (A). Requires Piercing Heat 1. Freed points from helm 548 can go here.
- **Burning Wounds `fi9:16` is dead**: Liath converts all ignite chance to shock chance (A, uid 276), so targets are never ignited.

### Reachable passives (Sorcerer full; Runemaster and Spellblade nodes with mastery requirement ≤ 20)
- **Mana Well `mg-1:68`** (Sorcerer, 5/5): 50% of mana spent becomes ward (A, scale D?). Spent today is about 0.33 × 53 + 5.9 ≈ 23/s, giving **about 12 ward/s**; at the cost-0 Route 1 rate about 23 ward/s.
- **Inscribed Instruments `mg-1:92`** (Runemaster, requirement 20, 6/6): +4% cast speed per point with a staff, +24% total (A). That is +0.35 casts/s, worth +2.1 mana/s of Cycle of Fire at cost 0, plus about 13% more Fireball damage.
- **Rift Bolt `mg-1:61`** 5/5: +15% lightning penetration (A).
- **Ceraunomancer `mg-1:17`** 8/8: +48% increased lightning damage, +40% shock chance (A).
- **Crackling Precision `mg-1:22`**: +10% crit chance per point, doubled for lightning skills (A).
- **Afterglow `mg-1:60`** 8/8: +24% spell damage and +24% ward retention, **doubled** if you recently "used a skill that costs 40 mana" (A). Your triggered Meteor consumes 53. Whether a triggered Meteor counts as "used" is unknown (U); if yes, +48% spell damage for 8 points.
- **Sphere of Protection `mg-1:55`** (Runemaster, requirement 0): 1% less damage per point from ignited, shocked or chilled enemies (A). Liath's shock and Frost Claw's chill cover most enemies: −8% damage taken at 8 points.
- **Distant Spark `mg-1:64`** (Sorcerer 35): 8% per point chance on crits from 4 m or more to cast Spark Nova (lightning) (A). Damage only; your Meteors are capped by mana, not crits.
- **Archmage `mg-1:30`**: about 1 mana/s at cost 4.64, nothing at cost 0. Skip.

### Your items
- **Harbinger defence.** It gives 1% less damage taken per Meteor cast recently, up to 18 (PP246, D); "recently" means 4 s (G). At 0.33–0.88 Meteors/s that is only **1.3–3.5%**. The 18% cap would need 4.5 Meteors/s, which is out of reach.
- **Harbinger potion mana.** 9–12 per recent Meteor, capped at 200 (D). Today about 16 per potion; at the Route 1 rate about 42.
- **Liath's Machinations (uid 276, A):**
  - 50% of Fireball base damage converted to lightning.
  - +2 Fireball levels.
  - +45–75% increased lightning damage.
  - 20–28% chance to apply a Spark Charge on hit; the Spark Charge ailment (id 55) has 1 s duration and no damage data.
  - Ignite chance converted to shock chance: base 40% (A), plus Conflagration `fi9:13` +30% per point.
  - 20–28 ward/s.
  - **It does not change projectile or hit counts** (no projectile lines).
- **Vilatria's set** has 2 pieces (A, set 15 `item_count` 2). Its only bonus, at 2 pieces, is +1 spell lightning damage per 2 Intelligence. **There is no 3-piece bonus.** Storm Crown's "+1 Level of Lightning Spell skills" (A) also applies to Meteor once it is converted ("counts as a lightning spell", uid 186 alt text).
- **T7 glove slam alternatives** (affix 4, Cast Speed, 24–30%, A). The other T7 options on gloves are increased Crit Chance (affix 5, 76–100%) and Mana (affix 34, 91–120). No mana-regen, mana-gain or cost affix rolls on gloves (A).
  - In a mana-bound loop, extra crit adds **0 Meteors**.
  - +120 max mana adds only buffer: about +0.3 mana/s via Wisdom, and +1 Meteor per fight.
  - Cast speed feeds Cycle of Fire: at cost 0, +27% → about +2.4 mana/s and +17% Fireball damage.
  - **Keep cast speed.**

## 4. Three in-game tests for the new claims

1. **Does Heat Flux cost mana?**
   - Fight one boss for 60 s and count Meteors; then respec Heat Flux to 0 and repeat.
   - Same count (about 20 at 0.33/s): Heat Flux is free.
   - About 10 with Heat Flux vs 20 without: it charges about 43 per Meteor (Gift of Winter applies to direct casts only). In that case, move those 3 points to Aftermath now.
   - Single-event check: note mana just before a Meteor lands and 1 s after. A drop of about 53 means Meteor only; about 96 means Heat Flux charged.
2. **Formula order and N.**
   - Remove 1 Piercing Heat point.
   - Tooltip shows **4.0**: flat-first order, you had N = 4.
   - Tooltip shows **2.0**: the other order (then Frost Claw should not be at 0; recheck it).
3. **Aftermath stream.**
   - Take Aftermath 3/3 (Force of Impact is already there).
   - Over 60 s on a boss, expect Meteors to go from about 20 to about 31, and visibly fewer moments where Fireball will not fire.
   - Bonus: equip Foot of the Mountain, stand still 1 s, and check the Fireball tooltip reads 0 and Unsealed Mana bursts appear (+15 mana, +45 ward every 3 s).

## Assumptions and gaps

- **Assumptions (U):** crit 70% (Frost Claw 50%); 8 pack hits per cast; Embers penalty counts all 3 extra projectiles; regen 16 mana/s; Meteor impact 0.7 s after cast; Aftermath pays linearly; Foot of the Mountain stacks drop when you move; Heat Flux and Gift of Winter cost semantics.
- **Data gaps:** the Craterborn buff and Spark Charge damage are not in the `ailments` table; Heat Flux's 120% exists only in prose; `frc87w`'s root node is named "Runic Invocation" in tree data.
- **Calls:** this follow-up used 9 le-data CLI calls (81 cumulative) plus 3 simulation scripts.

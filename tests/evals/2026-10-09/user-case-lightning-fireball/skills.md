# Replacing Frost Claw and Mana Strike

Data: le-data, game 1.5.2. Labels: A = asset data, D = decompiled/knowledge formula, G = in-game guide, X = community/planner, U = assumption. Simulation: `scratchpad/mana/sim4.js`.

Shared simulation inputs (U unless noted):
- Fireball cost 4.64. Meteor costs 53 (A).
- Aftermath 3/3 (moved from Heat Flux). Heat Flux is removed, so Frost Claw crits no longer fire Meteors.
- 4 hits per cast on a boss, 8 in a pack. Crit 70%.
- Regen 16/s, max mana 360. Cast speed 87% increased, ×0.85 for the Embers penalty.
- Cycle of Fire +6 mana per Fireball while Craterborn is up.

## 0. Verdict

**Recommendation: Focus (re-treed with a teleport) + Static Orb (for Lightning Aegis).**

**What it does in packs:**
- Meteors go from 0.53/s to **0.96/s** (+81%).
- Fireball blocked time goes from 47% to **3%**.
- Lightning Aegis is up about 100% of the time: 25% less damage taken and +50% increased lightning damage (A, `so35a:19`).
- Focus doubles as your movement skill (Conveyance) and as the panic button.

**What it does on bosses:**
- Meteors go from 0.51/s to 0.57/s, and Fireball blocked time from 12% to 0%.
- Boss fights were already nearly sustained once Heat Flux was gone.

**Honest comparison with Mana Strike:** a re-treed Mana Strike gives the **same mana** as Focus (pack 0.99 vs 0.96 Meteors/s).
- Focus wins on safety: it works at range, teleports, gives ward and reduces damage from shocked enemies.
- Mana Strike wins on Rune Sap's spell damage buff.
- If you are comfortable in melee range at corruption, Focus + re-treed Mana Strike is the maximum-mana pair (1.06 Meteors/s in packs, 0% Fireball blocked). It gives up Aegis.

## 1. Your current Mana Strike tree (identified from node coordinates)

Mapping your screenshot onto the node positions in the data (A, `skill_tree ms26`; root at 0,0; I assume negative y is up):

| Screenshot description | Node | Position | Points | Effect |
|---|---|---|---|---|
| East 4/4 | Swift Sap `ms26:2` | 214, 61 | 4 | +5% attack speed per point |
| South-east 4/4 | Breaking Current `ms26:3` | 387, 160 | 4 | Armour shred and shock chance. Requires Swift Sap 2 |
| 3/3 | Rune Sap `ms26:4` | 222, 234 | 3 | +4% global spell damage per enemy hit for 4 s, stacking, doubled on bosses and rares. Requires Breaking Current 2 |
| 4/4 | Mana Drain `ms26:9` | 515, −214 | 4 | +20% more mana per point |
| 1/1 far right | Mana Cleave `ms26:10` | 698, −184 | 1 | +100% more mana, +120% area, **4 s cooldown**. Requires Mana Drain 2 |
| North-west 3/3 | Mana Spark `ms26:14` | −168, −152 | 3 | 5% of current mana as added melee lightning per point |

**The screenshot reading conflicts with the prerequisites.** Mana Drain requires Sprite Blade `ms26:20` ≥ 1, Critical Mana `ms26:7` ≥ 3, or Reclamation `ms26:21` ≥ 2. So at least 1 point in Sprite Blade (462, 12, next to Swift Sap) must exist, or one of the 4/4 nodes is Sprite Blade rather than Mana Drain.

**Mana per swing from data (A):**
- The orb restores 15 mana, at most once per swing (`CreateResourceReturnAbilityObjectOnEnemyHit`: mana 15, maxProcs 1).
- With Mana Drain 4/4 and Mana Cleave: 15 × 1.8 × 2.0 = **54 per swing**, once per 4 s.
- You report about 120. I cannot reproduce that from the data (U). The simulation runs both values (rows B and B2).

## 2. Every candidate against the three criteria

How to read it:
- **(a) Mana:** the simulated or derived net mana/s contribution to the loop.
- **(b) Damage:** remember that crits add nothing while you are mana-limited.
- **(c) Defence:** ward, damage reduction, mobility.
- Costs use the engine order "flat first, then increased" (D), with the staff's −3 on spells.

| Skill (id) | Cost / cooldown (A) | (a) Mana | (b) Damage for this build | (c) Defence | Verdict |
|---|---|---|---|---|---|
| **Focus** `vm53dx` | 0 / 4 s, 1 s channel | **+22 mana/s in packs** (simulated). Used only when mana ≤ 0, when Fireball is blocked anyway, so it costs almost no damage. Each use: +100% regen (base) and +100% (Mana Flooded `:7` 4/4) and +1% per missing mana point (Desperate Meditation `:3`; negative mana counts twice, A alt text), then 10% of missing mana + 40 + 20 (Revelation `:27` 4/4). Roughly 145 mana per use | Energy Battery `:20`: a lightning wave with base damage equal to 25% per point of the mana gained (a spell that scales with Int, A) | Ward: 10/s while channelling, plus a 40 + 100 ward burst. Shocking Aura `:8`: −4% damage taken from shocked enemies per point (Liath's ignite-to-shock keeps enemies shocked). Conveyance `:30`: teleport on Focus, which counts as a traversal skill (A) | **Pick 1** |
| **Static Orb** `so35a` | 38 → **3** (Insidious Focus `:7` −6, Ball Lightning `:8` −26, staff −3) / none | −0.4 mana/s (one cast per 8 s) | Lightning Aegis: **+50% increased lightning damage** for Fireball and Meteor | **Lightning Aegis 8 s (Static Armor `:19` 4/4, 2 s per point): 25% less damage taken**, about 100% uptime (A, node text) | **Pick 2** |
| Mana Strike `ms26`, re-treed | 0 / 4 s (Mana Cleave) | About **140 per swing on a boss** (see §3), +24 mana/s in packs, the same as Focus | Rune Sap: +8% spell damage per point on bosses (+24% at 3/3), and +4% per point per enemy hit in packs. These are *increased* modifiers, so they are diluted by your large lightning pool | Melee range only. Teleporting Strikes (ranged) multiplies mana by 0.2, so ranged Mana Strike gives about 28 per swing and is dead | **Competitive.** Comparison row |
| Lightning Blast `lb23il` | 3 → 0 (staff) / none | 0 | Lightning Attunement `:21`: 5% chance per point on cast to gain Aegis. Closed Circuit `:6`: +20% damage and +50% crit for 4 s. Each cast replaces a Fireball | Positive Protection `:12`: 2 ward per hit per point | Worse source of Aegis than Static Orb (chance-based) |
| Teleport `te44` | 28 → about 17.9 with Flicker 4/4 / 5 s | −3.6 mana/s if spammed. Mana Tunnel `:4` refunds one spell (≤ 4.6) | — | Mobility. Resonant Plasma `:15`: +25% fire and lightning resistance and 250 stun avoidance after a cast. Ether Barrier ward | Redundant once Focus has Conveyance |
| Flame Rush `fl71ds` | 22 → about 15 (Blazing Flux, staff) / 3.5 s. Needs 5 Runemaster points (X: the Static Orb Sorcerer guide uses it) | About 0. Guidance of Flames `:16` gives +5 mana per point (15) when used after a Fireball in the same direction | Energy Equivalence `:9` converts it to lightning; Breath of Fire `:17` | 40% less damage while rushing (A). Runic Eclipse −6% per point. Lunar Protection: 30 ward/s and a 60 burst | Good alternative traversal; redundant with Conveyance plus Aegis |
| Elemental Nova `en6` | 11 → 0 with Cryomantic Fragility `:25` 4/4 (−12) | 0 | Lightning Nova only; centred on you | **+12% cold damage taken** (A) | Weak |
| Static `st47ic` | 15 / 4 s | −3.75 mana/s | Lightning discharge | Momentum `:6` Haste, Shock Armor `:3`, Insulation `:16` ward | Weaker than Static Orb |
| Snap Freeze `sw31a` | 30 / 18 s | −1.7 mana/s | Cold | Freeze cone | Niche |
| Glacier `gl14` | 65 × 0.2 = 12.4 with Lesser Glacier `:14` | Critical Rejuvenation `:17`: 1% of max mana per crit, up to 10 per second. About +9 per pack cast, but each cast replaces a Fireball | Cold, not lightning | — | Dead for a lightning build |
| Frost Wall `fr4wl` | 35, free with Heaping Cold `:14` / needs 15 Runemaster points | About +1.6 mana/s (Crystals of Protection `:8`: 24 mana per pass every 15 s) | Cold | Freeze, ward | Weak |
| Arcane Ascendance `arcas` | "All spells cost +5 mana" plus a 25 mana/s drain (A) | **Kills it.** Fireball becomes (2 + 5) × 2.32 = 16.2. Tranquility `:19` disables regen | +100% spell damage, +50% cast speed | — | Dead |
| Black Hole `bh2` | 35 / 14 s | Armageddon `:29` casts Meteor every second, **consuming Meteor's cost every second** (−53 mana/s) and breaks the Harbinger-only rule | Cold | Pull | Dead |
| Disintegrate `dig5` | 18/s channel | Negative. Laser Focus `:13` makes it free but −40% damage | Replaces Fireball as the main skill | — | Dead |
| Ice Barrage `ib5g3`, Volcanic Orb `vo54` | 50 each | −15 mana/s or worse | Cold / fire | — | Dead |
| Enchant Weapon `sb44eQ`, Flame Reave `fr11mv` | Spellblade 15 and 5 points | Negative | Melee buffs only | — | Dead |
| Runebolt `fb8fe`, Glyph of Dominion `gy2dm`, Firebrand, Surge | Need 30–40 points in a non-chosen mastery tree | — | — | — | Excluded. Whether a Sorcerer can unlock them is not in the data (U, `classes-and-masteries.md`), and the point cost is too high anyway |

## 3. Recommended trees (20 points each, in allocation order)

### Focus `vm53dx`: mana engine, panic button and teleport

| Order | Node | Points | Prerequisite | Effect (A) |
|---|---|---|---|---|
| 1 | Mana Flooded `:7` | 2 | root | +25% mana regen per point while channelling |
| 2 | Desperate Meditation `:3` | 1 | Mana Flooded 2 | +1% regen per missing mana point; negative mana counts twice |
| 3 | Mana Flooded `:7` | to 4 | — | +100% total |
| 4 | Revelation `:27` | 4 | root | Burst +5 mana and +25 ward per point |
| 5 | Iron Stance `:11` | 2 | root | 10% more armour per point, +2 armour per Int |
| 6 | Conveyance `:30` | 1 | Iron Stance 2 | Teleport when you start channelling; Focus counts as a traversal skill |
| 7 | Shocking Aura `:8` | 5 | Mana Flooded 1 | 50% shock chance per point each second while channelling; −4% damage from shocked enemies per point |
| 8 | Energy Battery `:20` | 3 | Shocking Aura 3 | Lightning wave with base damage equal to 75% of the mana gained |

- **Skip Null Profusion `:4` and Null Infusion `:5`.** Their +40% max mana (144 at 360) comes with +9 s of cooldown, which drops potential income from about 36 to about 24 mana/s.
- **Skip Unbound Thought `:28`.** It removes the mana burst, and does nothing with Conveyance.
- **Use rule:** press Focus whenever the globe is at or below 0 (Fireball is blocked then anyway). Hold it exactly 1 s.

### Static Orb `so35a`: Lightning Aegis for 3 mana

| Order | Node | Points | Prerequisite | Effect (A) |
|---|---|---|---|---|
| 1 | Shocking Conduit `:2` | 1 | root | +30% shock chance |
| 2 | Insidious Focus `:7` | 1 | Shocking Conduit 1 | −6 cost, no pull |
| 3 | Ball Lightning `:8` | 1 | Insidious Focus 1 | −26 cost, 90% chance not to explode. **Cost is now 3** |
| 4 | Forking Surge `:18` | 1 | root | +2 explosion tendrils |
| 5 | Static Armor `:19` | 4 | Forking Surge 1 | **Lightning Aegis 8 s on cast: 25% less damage taken, +50% increased lightning damage** |
| 6 | Storm Burst `:20` | 1 | Static Armor 1 | +30% damage and area |
| 7 | Shocking Conduit `:2` | to 5 | — | +150% shock chance |
| 8 | Storm Conductor `:14` | 5 | Shocking Conduit 2 | +60% more spell damage from Static Orb vs shocked enemies |
| 9 | Forking Surge `:18` | to 3 | — | +6 tendrils |

- **Use rule:** recast every 8 s. That is about 0.41 s of cast time, about 5% of your Fireball time.

### Comparison row: Mana Strike `ms26` re-treed for mana

| Order | Node | Points | Prerequisite |
|---|---|---|---|
| 1 | Arcanist's Blade `:23` | 3 | root (+3 orb mana per point) |
| 2 | Swift Sap `:2` | 1 | root |
| 3 | Sprite Blade `:20` | 1 | Swift Sap 1 |
| 4 | Mana Drain `:9` | 4 | Sprite Blade 1 (+80% more mana) |
| 5 | Mana Cleave `:10` | 1 | Mana Drain 2 (+100% more mana, 4 s cooldown) |
| 6 | Critical Mana `:7` | 5 | Mana Drain 3 (15 mana per crit) |
| 7 | Critical Rejuvenation `:8` | 1 | Critical Mana 2 (+40% crit chance) |
| 8 | Mana Spark `:14` | 2 | root |
| 9 | Bountiful Victory `:6` | 2 | Mana Spark 2 (6 mana on kill or boss hit) |

**Mana per swing on a boss** (A values; multipliers multiplicative as the node text says):
- Orb: (15 + 9) × 1.8 × 2.0 = 86.4.
- Bountiful Victory: 6 × 3.6 = 21.6.
- Critical Mana: 15 × 3.6 × 60% crit (U) = 32.4.
- **Total ≈ 140 per 4 s**, for about 0.6 s of melee time.

## 4. Mana budget with the new skills (`sim4.js`)

| Case | Boss: Meteors/s, Fireball casts/s, Fireball blocked | Pack: Meteors/s, Fireball casts/s, Fireball blocked |
|---|---|---|
| A. Now + Aftermath 3, Heat Flux gone, no utility | 0.51, 2.20, 12% | 0.53, 1.32, 47% |
| B. A + your Mana Strike at 54 per swing (data) | 0.58, 2.42, 2% | 0.76, 1.77, 21% |
| B2. A + your Mana Strike at 120 per swing (reported) | 0.60, 2.47, 0% | 0.97, 2.12, 9% |
| **C. Recommended: Focus + Static Orb** | **0.57, 2.34, 0%** | **0.96, 2.07, 3%** (Focus +22.1 mana/s; Aegis 98%) |
| C2. Focus only | 0.59, 2.45, 0% | 0.99, 2.12, 4% |
| D. Re-treed Mana Strike + Static Orb | 0.58, 2.36, 0% | 0.99, 2.14, 6% |
| E. Focus + re-treed Mana Strike (most mana) | 0.59, 2.45, 0% | 1.06, 2.25, 0% |
| F. Cost 0 (Foot of the Mountain), no utility | 0.61, 2.50, 0% | 0.78, 2.50, 0% |
| G. Cost 0 + Unsealed Mana + Focus + Static Orb | 0.64, 2.62, 0% | 1.12, 2.40, 0% |
| H. Cost 0 + Unsealed Mana + re-treed Mana Strike + Static Orb | 0.64, 2.62, 0% | 1.16, 2.51, 0% |

Notes on the results:
- **Removing Heat Flux alone** cut boss blocked time from 27% (previous report, same inputs) to 12%. Frost Claw crits had been firing Meteors the instant mana recovered, which kept you negative. This holds even before counting the mana Heat Flux was charging you.
- **On bosses every option is close (0.57–0.64 Meteors/s);** the differences are in packs. The utility skills fire mainly in packs, where your mana actually goes negative.
- **Damage cost** of the recommendation is about 6% fewer Fireball casts on a boss (2.34 vs about 2.45 with Focus alone; mostly Static Orb's 5% cast time). In return you get +50% increased lightning and 25% less damage taken from Aegis.

## 5. Three in-game tests

1. **Focus at negative mana (the assumption most likely to be wrong).**
   - Let the globe go negative so Fireball is blocked, hold Focus exactly 1 s, and read the globe.
   - The model expects about +145 total: roughly 50 extra regen from Desperate Meditation and Mana Flooded, then a burst of 10% of missing mana + 60.
   - If you get under about 80, Desperate Meditation is not scaling the way its alt text says. In that case the re-treed Mana Strike (about 140 per swing, row D/E) is the better mana slot.
2. **Static Orb.**
   - The tooltip should read **3 mana**.
   - After a cast, the buff bar should show Lightning Aegis for about 8 s. A hit of known size should land about 25% smaller with it up.
3. **60-second pack test.**
   - With Focus + Static Orb, count Meteors and "not enough mana" moments over one minute of a monolith pack.
   - Expect about 57 Meteors per minute (now about 32 at 0.53/s) and Fireball blocked about 3% of the time (now about 47%).

## Assumptions and gaps

- **Assumptions (U):**
  - Your reported 120 mana per Mana Strike swing; the data gives 54.
  - 60% crit chance for Mana Strike.
  - Focus is used only at mana ≤ 0, and its burst arrives at the 1 s mark even when started at negative mana.
  - Shocking Aura's damage reduction may apply only while channelling.
  - Storm Burst's "explodes after 4 m" may interact with Ball Lightning's 90% chance not to explode.
  - Regen 16/s, max mana 360, 8 pack hits per cast.
- **Data gaps:** the Lightning Aegis buff is not in the `ailments` table (its numbers come from node text); whether non-chosen-mastery skills that need 30+ points are unlockable is not in the data.
- **Calls:** this follow-up used 9 le-data CLI calls (90 cumulative) plus `sim4.js`.

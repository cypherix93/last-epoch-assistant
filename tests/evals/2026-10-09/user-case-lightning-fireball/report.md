# Lightning Fireball + Harbinger of Stars: mana sustain report (le-data 1.5.2)
Labels: A asset data, D decompiled/knowledge formula, X community/planner, U assumption.

## Verdict
Possible with trade-offs; the main cost is not Fireball. Harbinger's Meteor is NOT free: PP247 "Chance to Cast Meteor on Crit if above 0 Mana" (6-9%) alt text: "This consumes Meteor's Mana Cost. Does not include crits from Meteor itself." (A). Meteor costs 56 (A), 52 with the staff implicit.
Likely current setup (Fire Spray + Arcane Divergence, cost 10, ~2.74 casts/s, 70% crit U): spends ~36 mana/s on a boss, ~54 in a pack; income ~16-22/s; pool empties in 9-24 s.
Trap: a Meteor fires at 1 mana and takes you to -51; at negative mana no skill costing >=1 can be cast (G), so Fireball stalls.
Fix: (1) make Fireball cost 0 so it never stalls; (2) Craterborn -> Cycle of Fire + Aftermath in the Meteor tree so Meteors pay for themselves. Model: +27 mana/s boss, +17.5 pack. Pure regen stacking would need +355% (boss) / +580% (pack) increased regen vs realistic +100-170%.

## Shared inputs
Cast speed: T7 Cast Speed gloves affix 4 = 24-30% (A, used 27%); Mage Flurry mg-1:5 5/5 +15%; Arcane Momentum mg-1:13 5 stacks +25%; Adept fi9:17 4/4 +20% => 87% => 1.87 x 1.1 / 0.75 = 2.74 Fireballs/s (D).
Meteor rate = casts/s x hits/cast x crit x 0.09. Boss 1 hit/cast, pack 3 (U). Regen base 8/s; light 16/s (Wisdom mg-1:14 8/8, Rune of Renewal mg-1:57 6/6, amulet affix 330 T5); heavy 21.6/s (+ring 330, 2 idols 905). Max mana ~360 (U). Meteor cost 52.

## Route 1 (best): zero-cost Fireball + Meteor self-funding + Unsealed Mana
- Fireball: Mana Sphere fi9:22 3/3 (-1 cost/pt, +3% more/pt). Drop Fire Spray fi9:7 (+5) and Arcane Divergence fi9:9 (+3/pt). Cost = 3 - 3 - 3..4 (Moon Staff implicit 15:7 "-3..-4 Mana Cost, Spell", A; uniques keep base implicits X) = 0.
- Piercing Heat fi9:2 (+33% increased cost/pt) becomes free at cost <= 0 (X formula order; check tooltip); opens Immolated Core fi9:3 +10% lightning pen/pt.
- Meteor (specialised, never pressed): Craterborn me27:25 2 pts (6 s buff +15% cast speed on any Meteor cast, A); Cycle of Fire me27:26 3/3 (+2 mana/pt per direct Fireball while Craterborn up, A); Force of Impact me27:9 1 -> Aftermath me27:24 3/3 (recover 60% of Meteor's mana over 3 s, A). Remaining points: Stardust me27:10 (+20% more non-fire dmg/pt = lightning after conversion).
- Optional Unsealed Mana mg-1:56 5/6 (Runemaster tree, req 0; Sorcerer guides take it, X): after 3 zero-cost direct casts +15 mana +45 ward, 3 s cd => ~3.8 mana/s; +15% cast speed, +15 max mana.

| Case | Income | Meteor drain after Aftermath | Net |
|---|---|---|---|
| Boss, regen 16 | 32.4 | 5.2 | +27.1 |
| Pack 3 hits | 38.2 | 20.7 | +17.5 |
| Pack 5 hits | ~38.8 | ~38.8 | ~0 (Meteors throttle, Fireball never stops) |
| 50% crit, no Unsealed | | | +19..+22 |

Cost: ~9 Meteor points; 5 passives if Unsealed; lose Fire Spray/Arcane Divergence cone and Unchained Fire fi9:23 (+12% more per extra projectile); lose Sorcerer PP464 (0.5% more spell dmg per mana cost) on Fireball (5% at cost 10).
Test: respec, confirm Fireball tooltip 0 mana; hold Fireball on a pack 60 s; watch buff bar for Craterborn after first Harbinger Meteor (KEY UNKNOWN); mana globe trends up.

## Route 2: zero-cost Fireball only
Boss +7.0 (light) / +12.6 (heavy) mana/s sustained; pack -11.0 / -5.4 but Fireball keeps firing, Meteors throttle to 59-80%. Cost: 3 Fireball points, lose multi-projectile.

## Route 3: keep cost-10 Fireball + helmet affix 690 + Cycle/Aftermath
Affix 690 "Chance to gain 20 Mana when you directly cast Runebolt or Fireball" (Mage helmet prefix; T5 16-20%, T7 31-38%, T8 61-76%, A). Keep the set without the unique helm: seal Vilatria's Storm Crown Reforged (affix 820: shock chance per Int, 17-20% lightning pen T7) on the same rare helm; counts toward 2-piece set (G/X); Lightning Blast Runemaster guide does exactly this on Arcane Visage (X).
T5 helm: boss +3.9, pack -4.7 (empties in 76 s). T7: boss +13.4, pack +5.0 at 3 hits, -10.8 at 5 hits. Helm alone without Meteor nodes: -10.5 boss / -28.5 pack. Cost: give up unique Storm Crown's +1 lightning spell levels and 4-8 Int (uid 185).

## Route 4: Route 1 + Bluefeather Band (uid 440)
48-54% less spell mana cost (Meteor 52 -> ~25.5); +15-21 mana + 180-330 ward per 3 zero-cost casts (3 s cd, ~4.5 mana/s); downsides 48-54% less max mana and regen, 6-9% of damage taken to mana first. Light regen: boss +26.1, pack +24.4. Cost: ring slot; max mana < 400/900 so World Ender me27:23 (always crit >400 mana) and Harbinger's +3 potion slots at 900 mana are gone; Meteor PP464 bonus 26% -> ~12.7%.

## Route 5: Focus weaving
Focus vm53dx cost 0, 4 s cd, 1 s channel, +100% regen while channelling; after 1 s recover 10% missing mana + 40 burst (A). Nodes Revelation vm53dx:27 (+5 mana/pt, 4), Mana Flooded vm53dx:7 (+25% regen/pt), Energy Overflow vm53dx:23 (lightning waves, 12% max mana per pt as base dmg). ~22.8 mana/s (U). With cost-10 Fireball: boss +11.5/+17.1, pack -2.0/+3.6. Cost ~25% Fireball uptime. Do NOT copy the Meteor guide's Null Profusion/Infusion negative-mana trick: Harbinger is off at mana <= 0.

## Dead end: pure regen/max-mana stacking
Needs +355% / +580%. Sources: affix 330 (T5 30-38%, T7 50-60%; belt/amulet/ring/relic), 1156, 718, Wisdom, Rune of Renewal, Decree of the Bountiful Ocean mg-1:108, Urzil's Pride uid 10 (1% regen per 2% uncapped lightning res; body). Realistic +100-170%.

## Community evidence
No Fireball guide; 10 Mage guides, none uses Harbinger, Liath's or Vilatria's Downfall. Meteor Sorcerer (build 30): Focus negative-mana loop, Archmage 5/5, Wisdom 6, Unsealed Mana 6/6, Mana Well 5/5, "reach 1000 Mana"; rare Temple Staff with Vilatria's Downfall Reforged (819) sealed; casts Meteor directly (Twin Meteors, Heat Flux = pure cost here). Lightning Blast Runemaster (build 1): zero-cost main skill via Foot of the Mountain (uid 253, -2 cost per stack standing still, up to 3) + Birch Wand -3 implicit; Storm Crown Reforged sealed on rare helm. Transfers directly: Lightning Blast and Fireball both cost 3 base.

## Non-obvious interactions
1 Harbinger Meteors cost full Meteor mana; Meteor crits do not re-trigger (PP247). 2 "above 0 mana" gate + negative-mana rule: 0-cost Fireball makes Meteors self-throttle. 3 Cycle of Fire is in the Meteor tree but pays on direct Fireball casts; Craterborn says "Casting Meteor" with no "directly". 4 Aftermath refund ends if another Meteor lands within 3 s (modelled). 5 At cost <= 0, "increased mana cost" nodes are free. 6 PP464 taxes every cost reduction. 7 Staff implicit also cuts Meteor cost; Temple/Abyssal Staff implicits reach -5. 8 Harbinger: 1% less damage taken per recent Meteor up to 18 (PP246); mana on potion 9-12 per Meteor in last 4 s cap 200 (PP248), minor. 9 Mana Well mg-1:68 (50% of mana spent as ward) counts Meteor's 52: ~14.6 ward/s in packs. 10 Heat Flux me27:27 charges 14.4 mana per Meteor impact; Twin Meteors +50 cost: do not copy.

## Killed candidates
Blade Conduit mg-1:52 (Spellblade-only, 0% regen uptime at 2.7 casts/s); Arcane Ascendance Tranquility arcas:19 (no regen while active); Flame Ward Warmth fw3d:23 (~1.6 mana/s); Archmage mg-1:30 (+3.8-5.5 at cost 10, 0 at cost 0); Teleport Mana Tunnel (<1/s); Caretaker's Regrowth uid 482 (Primalist-only); Cinder Song, Spirit Xylem (weapon slot); affix 506 (sceptre only); mana on crit only on Mana Strike ms26:7 / Void Knight v01cv:12 / Glacier gl14:17; Lightning Blast Innate Conduit lb23il:28 (free only at <= 0 mana).

## Open questions
Craterborn from triggered Meteors and whether the Meteor tree applies when specialised but not on bar (U, decides Route 1); whether cost reductions apply to the triggered consumed cost (U); Harbinger ICD none in data; Archmage "values doubled/tripled" read as chance only; build inputs U (crit 70%, hits/cast, cast speed 87%, regen 16-21.6, mana ~360, Harbinger 9%); Twin Meteors +50 on triggered casts (U).

## Tool/data gaps
Craterborn buff missing from ailments; point_bonus_description not shown by passive_tree (Unsealed Mana description null); PP247 "consumes Meteor's mana cost" only in player_properties.alt_text, not in knowledge pages; no PP247/248 decompile trace, no ICD field; abilities has no freeWhenOutOfMana column (raw_json only); mana cost/efficiency formula is X not D; ~72 CLI calls (~4 failed on a helper path bug). Model: scratchpad/mana/budget.js.

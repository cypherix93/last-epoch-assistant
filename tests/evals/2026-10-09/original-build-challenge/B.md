# Heraldry Orb: void Volcanic Orb Spellblade, built around Lament of the Lost Refuge (uid 273)

> Data: `game_version` Version 1.5.2, `data_version` 1.5.2 (`version` tool, `meta`), source `data/le.sqlite` through `yarn mcp:call` (no `vendor/`, no `data/raw/`, no web). Written 2026-10-09.
> Labels: **D** decompiled, **A** asset data, **G** in-game guide, **X** community 2026, **U** unverified or my assumption. A computed number carries the weakest label of its inputs. Ids (uid 273, `vo54:19`, affix 362) are identifiers, not quantities.
> Status: **theorycraft to test**. Not played. Not a known build.
> Scratch: `B_scratch/model_B.py` (the whole numeric model, every input with label and source) and `B_scratch/model_B_out.txt` (its printed trace). Re-run with `python -I B_scratch/model_B.py`.

## Build card

| Field | Value |
|---|---|
| Item | Lament of the Lost Refuge (uid 273), Two-Handed Spear, base Rat City Impaler (14:14), unique level req 0 / base level 60 (A), no class lock (A, `item_subtypes.class_requirement` 0), `lp_eligible` 1 (A derived, U in game) |
| Enabling effect | Volcanic Orb base damage converted to void (AP78:6, A) + 12-stack Corrupted Heraldry, +5 spell void per stack, gained when you cast VO (AP78:7, 100%, A) + 18-30% of remaining VO cooldown recovered per melee use that hits (PP211, A) |
| Stat stick | implicit +160 Melee damage (untyped) and +92-108 Void Spell damage (A). Wants Void, Spell, Hit; the melee line only reaches VO through the Spellblade mastery bonus |
| Class / mastery | Mage / Spellblade |
| Main skill | Volcanic Orb (`vo54`), default **Fire** (tags Fire,Spell; component 0 fire 40, A), played as **Void** |
| Defense layers | ward (steady state 3,402, D/U), endurance 60% (A/G), capped resistances, 100% crit avoidance; Flame Ward burst windows |
| Sustain | ward 447/s (A/U), mana net +5.2/s (X/U) from Mana Strike orbs |
| Other required uniques | Eye of Orexia (uid 182), Keplahan's Cryolith (uid 468). Count 2, both 0 of 74 guides (X) |
| Community baseline | Lament 0 of 74 guides; VO is the main skill of 0 of 74; Spellblade + VO main 0. Nearest: `glacier-sorcerer-guide` (VO specialised as a secondary) and `flame-reave-spellblade-guide` (X) |
| Boss DPS (level-100 boss, corruption 1000) | **46,160** orb-core DPS (U, inputs A/D/U); Maxroll LB Runemaster modelled the same way: **407,495** (U); ratio **0.113** |
| EHP | 5,914 pool; survives 2 corruption-1000 rare melee hits, dies on the 3rd (2.80 hits, D/U); 7.7 hits inside a Flame Ward window |
| Scores (Dmg/Def/Sus/Gear/Nov) | 3/3/4/3/5 = 18 |
| Riskiest assumption | skill-tree node values are per point (Molten Core 5 x 25%, Volcanic Frenzy 4 x 75%) -> test #1 |

---

## 1. Step 1 of the challenge: unused conditional items, shortlist, pick

**Query** (Q-style SQL over `v_unique_summary` minus every `unique_id` in `v_build_items_named`, text filter on convert / instead / cast / when you / while / no longer / consum / triggers / as if): 148 unique and set items with 0 community usage and a conditional or transformative line. Proof of 0 usage for the shortlist (Q18 form, `builds_using` of `total_builds` 74):

```sql
SELECT u.unique_id, u.name,
  (SELECT count(DISTINCT i.build_id) FROM v_build_items_named i WHERE i.unique_id = u.unique_id) AS builds_using,
  (SELECT count(*) FROM community_builds) AS total_builds
FROM uniques u WHERE u.unique_id IN (273,182,468,467,186,162,462,226,144,457,456,377,308,367,261,463);
```
Every row returned `builds_using` 0, `total_builds` 74 (X). `item_usage` confirmed 0 for 273, 182 and 468 (X).

Shortlist (12; "main in N of 74" comes from `v_build_summary.main_skill`, X):

| # | Item (uid) | Conditional / transformative line (A) | Why no guide uses it (data-backed, X) |
|---|---|---|---|
| 1 | **Lament of the Lost Refuge (273)** | VO converted to void; Corrupted Heraldry on VO cast; melee hit recovers VO cooldown; traversal clears stacks | VO is main in 0 of 74; none of the 5 Spellblade guides wields a spear (`slot_meta` weapon: staves, a wand, Jasper's Searing Pride); the Mage passive tree has no void-damage node (`mg-1` dump) |
| 2 | Eye of Orexia (182) | VO damage, VO cooldown recovery, VO speed | VO-only relic; VO is main in 0 of 74 |
| 3 | Keplahan's Cryolith (468) / Pyrolith (467) | cast cold / fire VO when you **directly** use a cold / fire melee attack or traversal (3 s cd) | needs a melee Mage who also wants VO; the only guide with a specialised VO (`glacier-sorcerer-guide`) has no melee |
| 4 | Vilatria's Downfall (186) | Meteor converted to Lightning | the one Meteor guide (`meteor-sorcerer-guide`) stays fire; the LB Runemaster takes the Vilatria set bonus through the reforged helm affix 820 instead |
| 5 | Bhuldar's Wrath (162) | Earthquake converted to fire, armour-shred chance -> ignite, EQ after a non-channelled movement skill (2 per 5 s) | Earthquake is main in 0 of 74 (secondary in `upheaval-beastmaster-guide`); level 76 2H mace |
| 6 | Natural Wrath (462) | Upheaval and EQ converted to lightning; 20 Storm Stacks -> EQ | `upheaval-beastmaster-guide` (1 of 74) is physical |
| 7 | Tu'rani's Bident (226) | Javelin -> lightning, bleed/ignite chance -> electrify, Thunder stacks | `javelin-paladin-guide` (1 of 74) runs a shield; a 2H spear removes it |
| 8 | Acidfletch (144) | Hail of Arrows -> poison | Hail of Arrows is main in 0 of 74 |
| 9 | Kuzon's Guise (457) / Fury (456) | Shadow Cascade / Dancing Strikes -> fire | `shadow-cascade-bladedancer-guide` (1 of 74) is physical/poison |
| 10 | Gordian Prism (377) | directly cast 3-rune invocations always cast Grand Prism Nova, base damage converted by the runes | Runic Invocation is main in 0 of 74; Runemaster guide mains LB |
| 11 | Celestial Doom (367) | Doom Pulse when you directly cast a fire/cold/lightning/necrotic/void spell, 1 s per type | needs 2-5 spell types on direct casts; no guide plays a five-element bar |
| 12 | Abacus Rod (308) | Runebolt copies the element of the last single-element direct skill | Runebolt is main in 0 of 74 |

**Pick: Lament of the Lost Refuge.** The other conversions (Vilatria, Bhuldar, Tu'rani, Kuzon) recolour a skill some guide already plays. Lament's value is not on its tooltip: the spear's **untyped +160 melee implicit** becomes VO damage only through a Spellblade mastery field, only lands in one bucket because of the conversion rule for untyped added damage, and is then doubled by VO's 200% added-damage effectiveness; a second unused unique (Keplahan's Cryolith) fires extra orbs when Mana Strike is re-tagged cold by its own tree node. None of these pieces mention each other (section 3).

## 2. Originality proof (challenge rule 2)

| Check | Call | Result (X) |
|---|---|---|
| VO as main skill, any mastery | `builds {"ability":"Volcanic Orb"}` | count 0 |
| VO anywhere on a bar | `builds {"ability":"Volcanic Orb","any_skill":true}` | 2: `spellblade-leveling-guide` (main Firebrand; VO on the bar with **no** nodes, Final Setup tab), `glacier-sorcerer-guide` (Sorcerer, main Glacier, VO specialised secondary) |
| Spellblade guides | `builds {"mastery":"Spellblade"}` | 5: Firebrand x2 (incl. leveling), Shatter Strike x2, Flame Reave |
| Guides using the items | `builds {"item":...}`, `item_usage` | Lament 0, Eye of Orexia 0, Keplahan's Cryolith 0 |

So Spellblade + Volcanic Orb main appears in **0 of 74** guides. Nearest existing builds and the difference:
- `glacier-sorcerer-guide`: different mastery (Sorcerer), VO is a fire secondary next to Glacier, no melee, no Lament, no conversion.
- `flame-reave-spellblade-guide` / `shatter-strike-spellblade-guide`: same mastery, melee skill is the damage; here the melee skill (Mana Strike) is a generator worth 0 in the DPS figure and the damage is a void spell.

Damage type rule: VO default type is Fire (`abilities.tags` 264 = Fire|Spell, component damage `{"fire":40}`, A). After Lament AP78:6 it is Void; the unique's alt text says VO "scales with increases to void damage instead of fire or cold. It cannot freeze even if previously converted to cold" (A, `unique_tooltips` uid 273 ord 3).

## 3. The interaction (challenge rule 3)

**Combined behaviour (written on no single item or node):** a Spellblade wielding Lament turns a melee weapon's untyped implicit into void spell damage at 200% effectiveness, keeps 12 Heraldry stacks with its own orbs, and gets a third of an extra void orb per second from a ring that only asks for "cold melee", by making Mana Strike cold. Parts and rules:

| # | Part | Data line | Rule that makes it work | Confidence |
|---|---|---|---|---|
| P1 | Lament conversion | `mods unique_mod 273 ord 0`: SP58 AP78:6 "VO Base Damage Converted to Void" 1 | Base conversion moves base damage and **untyped added damage**; typed added keeps its type; converted skill loses the old type tag (damage-pipeline.md s10 G; catalogue "Conversion moves base and untyped added damage only" G) | A (line), G (rule) |
| P2 | Spellblade mastery | classes-and-masteries.md mastery table: `addedMeleeGainedAsAddedSpell=0.4` | 40% of added melee damage is also added spell damage. The spear implicit `14:14` ord 0 is SP0 Melee added 160 (A); weapon damage is added damage (damage-pipeline.md s3, G/X) | D (field), **U** (that the weapon implicit counts and that the gained line is untyped Spell) |
| P3 | Untyped follows the base type | damage-pipeline.md s2: `flat x base_t / sum(base)`, untyped added only if it shares Spell/Melee/Throwing/Bow with the source | the +160 melee line alone is **dead** on VO (audit query: tag Melee not in Void,Spell,Hit); its 40% spell copy is untyped Spell, and with base 100% void it lands entirely in the void bucket | D |
| P4 | ADE 200% | `vo54` component 0 `addedDamageScaling` 2; alt text "Added damage applies to the orb at 200% effectiveness" | every added point (implicit void, Spellblade copy, Heraldry) counts twice on the core | A |
| P5 | Heraldry engine | AP78:7 100% on cast; `ability_properties` 78:7 alt text "stacks up to 12 times and each stack lasts 12 seconds"; tooltip "+5 Spell Void Damage per stack", "lost when you use a Traversal Skill" | stacks held = min(12, 12 s x direct casts/s); typed added void is untouched by P1 and goes x2 by P4 | A; uptime U |
| P6 | Only direct casts feed Heraldry | catalogue "Directly means triggered casts do not count": "An item trigger on use / cast / end does not fire from a triggered use" | Keplahan orbs are triggered, so I give them **no** stacks (conservative); they still benefit from the stacks | D? |
| P7 | Keplahan trigger | uid 468 ord 0: AP78:10 "Chance to cast cold VO when you **directly** use a cold melee attack or cold traversal skill (3 second cooldown)" 1.0; alt text "Consumes mana equal to 80% of VO's mana cost" | Mana Strike is pressed (direct). Frigid Grasp `ms26:28`: "Swaps Mana Strike's Lightning tag for a Cold tag" makes it a cold melee attack. Rate = min(MS uses/s, 1/3) (speed-cooldowns-mana.md s6, D) | A (lines), D (rate) |
| P8 | Cold orb comes out void | Lament alt text "cannot freeze even if previously converted to cold" | the triggered "cold VO" is still ability 78, so P1 applies; the triggered use runs the VO tree (catalogue "Repeat-cast uniques copy the skill"; speed-cooldowns-mana.md s6 "triggered use: computed as a use of the triggered skill") | A (text), U (that the trigger's own cold conversion does not override AP78:6) |
| P9 | Melee recovery | uid 273 ord 1: PP211 "Remaining VO Cooldown Recovered when you use a Melee Attack and hit at least one Enemy" 0.18-0.30 | remaining-cooldown fraction per melee hit, on top of `cooldown = length / (1 + sum CDR)` (speed-cooldowns-mana.md s3 D; catalogue "Cooldown recovery on hit for specific skills" D) | A (line), D (formula), U (applied after recovery speed) |
| P10 | No traversal on the bar | Lament tooltip ord 2 | Heraldry gives +5% movement speed per stack (+60% at 12, A) instead; whether Evade counts as a traversal skill is **U** (test #3) | A / U |

What P9 actually buys (from the rate simulation, section 4.1): with the per-point reading of Volcanic Frenzy, VO is cast-speed-bound and P9 changes nothing (1.332 direct casts/s with or without it). Under the other reading (Frenzy 75% total), P9 raises direct casts from 0.868/s to 1.097/s and keeps Heraldry at 12 instead of 10.4 stacks: +18.7% DPS. P9 is insurance, not the engine; I say so instead of overselling it.

Part-removal check (model): removing P2 costs -23.6% DPS; removing P7 costs -20.0%; removing P5 stacks (traversal used once per 12 s) costs up to 120 of 649.6 base-equivalent void per orb (-18.5%).

Catalogue entries checked: section 1 (Conversion moves base and untyped..., Partial and tag-adding conversions..., Melee added damage reused as spell damage: Bane of Winter / Heorot / affix 988, none names the Spellblade field), section 2 (Directly..., Proc caps..., Repeat-cast..., Cooldown recovery on hit...), section 4 (Endurance and mana-before-health never protect ward, Ward makes you harder to stun and freeze, On-hit ward is per hit event), section 7 (Skill-tree % damage is a separate multiplier, Penetration..., Shred/penetration...), section 11 (Cooldown recovery on skills without a cooldown, Training dummies, No crit/cannot leech, Immunity uniques, Self-damage costs). Lament, Eye of Orexia and Keplahan's Cryolith appear in no catalogue entry (grep of `catalogue.md` for 273, 182, 468 and the names: no hit; `unique-effects-index.md` rows 273 `AP78:6:conversion, PP211:flag, AP78:7:flag, AP78:8:flag` and 182 `AP78:0:stat ... AP78:4:cooldown`).

## 4. Numbers (challenge rule 4)

Convention for both builds: endgame rares and LP lines at their tier's **max roll** (Maxroll planner profiles store roll 1), level 100, level-100 boss, area 100, no shred, no curses, only the main skill's own hits. Skill-tree node lines read as `value x points` (skills-and-trees.md "Per-point values come from tooltipStats[].num", A; catalogue "Skill-tree % damage is a separate multiplier", X) and damage nodes typed as **more** (damage-pipeline.md s5: 429 more / 38 increased, D prior). Same reading on both builds.

### 4.1 Rate: discrete simulation (600 s, policy "cast VO if its charge is ready, else Mana Strike; idle only if VO is ready within half a Mana Strike")

```
VO use time   = 0.75 / (1.1 x S_c)        S_c = 1 + 0.15 Mage Flurry mg-1:5 (A) + 0.30 gloves affix 4 T7 (A) + 0.22 Eye cast speed (A)
                                                  + 0.25 Arcane Momentum mg-1:13 5 stacks x 5% (A, uptime U) + 0.03 Unsealed Mana (A) = 1.95
              = 0.350 s                    (speed-cooldowns-mana.md s2 D; vo54 use_duration 0.75, speed_multiplier 1, A)
MS use time   = 0.65 / (1.1 x S_a)        S_a = (1 + 0.15 + 0.20 Swift Sap ms26:2 4x5% + 0.15 Essence Duel mg-1:77 5x3%) x 0.98 attackRate (A, Rat City Impaler)
              = 0.402 s                    = 1.470
VO cooldown   = 3.0303 / 5.34 = 0.567 s    recovery 1 + 3.00 Volcanic Frenzy vo54:25 4x75% (A/U) + 0.70 Eye AP78:4 (A) + 0.32 belt + 0.32 boots affix 27 T7 (A)
Lament PP211  = 0.30 of remaining cooldown per Mana Strike hit (A, max roll)
Keplahan      = 1 orb per 3 s while Mana Strike is used (A/D)
result        : direct VO 1.332/s, Mana Strike 1.330/s, Keplahan VO 0.333/s     (U: model)
Heraldry      : min(12, 12 x 1.332) = 12 stacks (A/U)
```

### 4.2 (a) Boss DPS, level-100 boss, corruption 1000

Source mask: VO core hit after conversion = Void(16) | Spell(256) | Hit(8388608) = **8388880** (damage-pipeline.md s4, D).

```
Added (all into the void bucket):
  typed void   108 implicit 14:14 ord 1 (A, max of 92-108) + 14 + 14 helmet/body affix 362 T7 (A) + 60 Heraldry 12 x 5 (A/U) = 196
  untyped spell  8 Infused Weapon mg-1:35 8 x 1 (A) + 8 idol 1038 (A) + 16 idol 912 T7 x2 (A)                        =  32
  Spellblade   0.4 (D/U) x (160 implicit + 16 Infused Weapon 8 x 2 + 16 idol 912 x2)  = 0.4 x 192                     =  76.8
  void bucket  = 40 base (A, now void) + 2.0 ADE (A) x 304.8 = 649.6
Increased (sum 16.327):
  3.760 Int 94 x 4% (VO attribute scaling attribute:2, A/D; Int: 3 class + 8 Arcanist + 8 Arcane Warden + 10 Mental Fortitude
        + 1 Arcane Focus + 4 x 16 affix 502 T7 on helmet/body/gloves/boots, A)
  0.700 Quintessence of Triumph mg-1:54 10 x 7% spell (A)        0.240 Afterglow mg-1:60 8 x 3% (A)
  1.200 Eye of Orexia AP78:0 (A)    0.600 Eye LP affix 553 T5 line 2 (A, LP U)    0.550 idol 246 (A)
  1.100 + 1.100 affix 362 T7 helmet, body (A)    1.200 x 3 affix 15 Void Damage T7 belt, amulet, ring (A)
  1.200 affix 38 Spell Damage T7 ring (A)        1.000 Grand Whisper of Orobyss (A)
  1.277 Rune Sap ms26:4 3 x 4% x2 vs boss per Mana Strike hit, 4 s, 1.330/s x 4 = 5.32 stacks (U: no stack cap in data)
More (product 13.542):
  2.25 Molten Core vo54:19 5x25%  x 2.00 Volcanic Acceleration vo54:24 4x25%  x 1.50 Monolithic Eruption vo54:21 2x25%
  x 1.25 Orb of Speed vo54:7  x 1.50 Concentrated Effect vo54:26  x 1.07 Quintessence 7% more spell at 7 pts      (A magnitudes, D-prior type)
Hit vs dummy (pre-crit) = 649.6 x 17.327 x 13.542 = 152,424
Crit: cc = 0.05 (A) x 1.50 (Keplahan increased crit, A) = 0.075, cm 2.0 (A) -> E_crit 1.075 (D formula)
Enemy: void res 0 (G) + pen 0.15 amulet affix 0 T7 (A) + 0.22 Lament LP affix 723 T7 (A, LP U) -> resMult 1.37 (D)
       boss level DR 0.87 + 0.05 x 0.13 = 0.8765 -> x0.1235 (D/A); corruption raises boss health and damage, not damage taken (D)
Orb vs boss = 152,424 x 1.075 x 1.37 x 0.1235 = 27,724
DPS vs level-100 boss = 27,724 x (1.332 + 0.333) orbs/s = 46,160      (dummy equivalent with pen: 373,763)
```
Label: **U** (weakest inputs: Spellblade scope, Rune Sap stacks, LP lines, per-point reading). Bounds: without Rune Sap 42,758; Frenzy read as total 38,028; that reading without Lament recovery 32,032. Not counted (upside): shrapnel (base 20, ADE 1.0, only Monolithic/Orb of Speed/Quintessence mores apply: about 7% of a core hit each, U how many hit a boss), Mana Strike damage, Flame Ward retaliation (removed by Fortification), Frostbrand cold copy while Enchant Weapon is active. Boss health at corruption 1000 is x11.80 of corruption 0 (enemies-and-corruption.md f(1000) 1079.9, D), so time-to-kill scales by 11.8 against the same boss.

### 4.3 (b) Calibration: `lightning-blast-runemaster-guide`, Endgame tab, same method

Inputs from `build {"slug":"lightning-blast-runemaster-guide","tab":"Endgame"}` (X: rolled affix values, node points, passives) and the db for unique lines (A). Full list in the model trace; summary:

```
Int 209 (3 class + 48 passives Arcanist/Calculated Destruction/Arcane Focus/Ancient Inscriptions 8 each, Logocracy 5x2, Mental Catalysis 6
         + 158 gear: Rune Stone 14, affix 1078 7, helm 8, body 16, gloves 16, boots 8, Foot of the Mountain 12, rings 16+16, relic 16,
         Orian's Descent 20, Opal implicits 4, Legends Entwined 5 for one complete set (U))                      X/A/U
Added  = 16 wand implicit + 14 affix 975 + 104.5 Vilatria set (+1 spell lightning per 2 Int, set 15 bonus, A) + 24 idol 912 x3 + 7 Celestial Doom = 165.5
Bucket = 21 (lb23il, A) + 1.0 ADE x 165.5 = 186.5
Increased 16.36 = 8.36 Int x 4% + 1.00 helm 557 + 1.50 Unstable Core + 0.30 Runemaster bonus + 0.13 Elementalist/Ceraunomancer + 0.60 Essence of Celerity
                  + 1.35 idols Shared Lightning + 0.80 + 0.80 idols "doubled at 300 mana" + 0.70 + 0.50 Lightning Aegis (100% uptime, U) + 0.32 affix 975 x 40% movement speed
More 2.383 = 1.10 Storm Razor 2x5% x 1.20 Frontloaded 2x20% averaged over 5 hits (U) x 1.12 Shattershock (U) x 1.24 Decree of the Burning Wind 8x1.5% doubled (U)
             x 1.30 Mad Alchemist's Ladle SP117 cdp 26, 5 ailments assumed (U)
Crit: chance capped (0.165 added x (1 + 0.03 x 209 Calculated Destruction + 0.15)); multi (2.0 + 0.5 + 0.5 + 0.40 Grand Emptiness of Ash + 0.40 Overcharge) x 1.20
      Jagged Veil = 4.56; Incisive Rage 20% Deadly Strike +300% (X) -> E 5.16 (U)
Rate: S = 4.71 -> 6.92 casts/s x 1.512 double/quadruple cast (Overcharge 4x8%, Hypercharge 30%) = 10.46; 5 hits on the boss per cast
      (base 2 chains + 2 Chain Lightning + 3 Arcing Power, Convergence halves rounded up, U) = 52.3 hits/s
LB vs boss = 7,716 x 5.16 x 1.19 pen (Rift Bolt 15%, affix 820 2%, idol 2%) x 0.1235 = 5,851 per hit -> 305,903 DPS
Spark Charge (ability_gen40_ln24_1: lightning 9, ADE 0.5, A): 9 + 0.5 x (209 Fragment of the Enigma AP66:1 + 165.5) = 196.2;
      x (1 + 8.00, no Int scaling assumed U) x 4.84 (Mortal Capacitor 5x40% more, A/D; x1.24 x1.30) x 5.16 x 1.19 x 0.1235 = 6,477 per explosion
      x 15.7/s (Cloud Answer 3x10% per LB hit) = 101,592
CALIBRATION boss DPS = 407,495 (U)
```
Not counted for LB (same exclusions as mine): Runic Invocation, Glacier, Frost Wall, Spark Nova (Halo Effect), Fire Aura, Smite from Orian's Descent. **Relative result: Heraldry Orb = 0.113 x the LB Runemaster (U).** The gap is hits per second (1.67 orbs vs 52 LB hits plus 16 spark explosions), not per-hit damage (27.7k per orb vs 5.9k per LB hit). The judge can recompute either side by changing one input in `model_B.py`.

### 4.4 (c) EHP against corruption-1000 reference hits (area 100)

```
f(1000) = 0.002 x 1000^1.52 + 1.055 x 1000 - 47.69 = 1079.9 -> hit x11.799, DoT x6.400        (enemies-and-corruption.md, D)
Reference rare melee hit = 87.58 x 1.2264 x 1.9 x 11.799 = 2,408 physical                    (trimmed mean D?, scaler D?, rarity D)
Health   = 100 + 10 x 100 + 832 added (Scholar 96, Arcane Shielding 40, Mana Reaver 50, Transcendence 72, helmet 25 T7 180,
           amulet 29 T7 130, ring 25 T7 180, Keplahan 84) = 1,932                              (A/D)
Endurance = min(0.60, 0.20 base + 0.20 Mental Fortitude 10x2% + 0.30 Grand Embers of Immortality) = 0.60; threshold 386 (G/A)
Ward/s G = 321.9 passive (Prodigy 15 per 15 Int = 94 U-continuous, Transcendence 36, Conjured Armor 9, body 382 56, ring 824 40,
           Grand Resonance of the Sea 42, idols 178/1051/897 AEM-rescaled 44.9 U) + 1.330 Mana Strike/s x 94.2 (24 Arcane Warden,
           15 Essence Duel, 12 Spellblade first elemental hit D/U, 43.2 Transfusion 2x25% of the 43.2 orb as double ward) = 447.2/s
Retention R = 94 x 0.02 + 0.50 Warden + 0.24 Afterglow = 2.62 ; decay threshold T = 230 ring 824 + 13.4 idol 897 + 193 Arcane Warden = 437
W_ss = 437 + (-0.2 + sqrt(0.04 + 2e-4 x 447.2 x 2.31)) / 1e-4 = 437 + 2,966 = 3,402            (ward-health-sustain.md s3.2, D)
Pool = 3,402 ward + (1,932 - 386) + 386 / 0.40 = 3,402 + 2,512 = 5,914                        (endurance never applies to ward, G)
Resistances: all seven >= 75 (table in 5.3) -> resMult 1 - 0.75 + 0.75 = 1.00                  (G/D)
Armour 336 ((30 Conjured Armor + 250 Shiver Armor sw31a:20 while Snap Freeze is on cooldown) x 1.20 Arcane Shielding) -> DR 12.2% phys, 8.5% non-phys (D)
Crit avoidance 0.37 gloves affix 97 T5 + 0.70 Grand Survival of Might = 1.07 -> no crits taken (G/D)
Post-mitigation melee = 2,408 x 1.00 x 0.878 = 2,115 -> 5,914 / 2,115 = 2.80 -> survives 2, dies on the 3rd landed hit (no recovery)
Flame Ward window (2.88 s of every 9.15 s, U): x0.70 base x0.60 Barrier 5x8% (A text) = x0.42, +950 ward -> 7.73 hits
Boss spell proxy (U): 129.62 x 1.2264 x 11.799 = 1,876 -> 1,716 post (armour x0.7) -> 3.45 hits
Normal-monster DoT: 151.03 x 1.2264 x 6.400 = 1,185/s -> x0.85 hidden DoT reduction (A) = 1,008/s -> pool lasts 5.9 s; 10.5 s with 447 ward/s
```
**Red flag (le-defense-reasoning):** 2.8 reference hits is below the 5-hit line. The build is a corruption 300-500 character as written; at 1000 it relies on the Flame Ward window, Snap Freeze's Frozen Monolith (2 s of no damage, A) and not getting hit.

**Stun / freeze / slow plan:** stun chance per landed reference hit `2 x 2,115 / (1,932 + 3,402) - (500 + 750 base (250 + 5 x 100, G) + 750 amulet affix 29 T7 + 27 idol 1054) / 5000 = 0.387` (A formula, catalogue "Ward makes you harder to stun and freeze"); answer: ward in the denominator, the amulet stun avoidance line, and Flame Ward `fw3d:31` Astonish (cast Flame Ward when stunned, A). Freeze uses the same `maxHealth + currentWard` denominator (A). Slow and chill: Enchant Weapon `sb44eQ:25` Cleansed by the Elements removes negative ailments each activation, and `sb44eQ:17` Kindling Blade re-activates it on the next direct melee (every 9.15 s with 64% CDR, A/U); Heraldry +60% movement speed (A). Residual risk: about 39% stun per landed corruption-1000 hit outside Flame Ward (U).

### 4.5 (d) Resource loop per second (sustained rotation)

```
Max mana  = RHE(50 + 0.50506 x 100 + 24 Scholar + 3 Unsealed Mana) = 128                       (A/D)
Regen     = 8 x (1 + 0.60 belt affix 330 T7 + 12 x 0.05 Heraldry) = 17.6/s                     (G base, A lines)
Costs: VO 50 / (1 + 5 x 0.20 Lava Flow vo54:27) = 25.0 x 1.332 = 33.3/s                        (X formula, A inputs)
       Keplahan VO 80% x 25 = 20.0 x 0.333 = 6.7/s                                              (A text, U whether 80% of the reduced cost)
       Flame Ward 25 / 1.18 = 21.2 per 9.15 s = 2.3/s ; Enchant Weapon 20 - 2x5 Efficacy = 10 per 9.15 s = 1.1/s
       Snap Freeze 30 x 0.70 Focused Frost / 1.24 Snow Flurry = 16.9 per 9.57 s = 1.8/s       (A/X)
       total 45.1/s
Income: Mana Strike orb (15 base, ms26 description A + 3x3 Arcanist's Blade ms26:23) x 1.80 Mana Drain ms26:9 4x20% more = 43.2;
        Transfusion ms26:24 2x25% sends half to ward -> 21.6 mana + 3 Mana Reaver mg-1:41 (100% at 5 pts) = 24.6 per hit x 1.330/s = 32.7/s
        + regen 17.6/s = 50.3/s
Net = +5.2/s (X/U)
```
Negative-mana rule (ward-health-sustain.md s6, G): a skill can be cast while mana > 0 even if it costs more, and nothing costing >= 1 can be cast at <= 0. With a 128 pool and a 25 cost the bar never needs to dip below 0 in the steady state; if it does (Mana Strike missing while kiting), the Keplahan orb and VO are blocked until regen or one Mana Strike hit (24.6) brings mana above 0, which is why Mana Strike is the button pressed whenever VO is not ready. Mana Strike itself costs 0 (A) so it is always usable. Ward: 447/s against decay keeps 3,402 (section 4.4).

## 5. Build sheet (challenge rule 5)

### 5.1 Class, mastery, bonuses
Mage / Spellblade. Mastery bonuses (classes-and-masteries.md, D): `addedMeleeGainedAsAddedSpell=0.4`, `wardGainedOnFirstElementalMeleeHit=12`. Mastery skill Shatter Strike is not on the bar.

### 5.2 Skills (5 specialised; 20 points each + 2 VO levels from the Eye LP line)

| Slot | Skill | Role | Nodes (`tree:node` Name points) | Why |
|---|---|---|---|---|
| 1 | Volcanic Orb `vo54` (22) | main | `vo54:19` Molten Core 5, `vo54:24` Volcanic Acceleration 4, `vo54:25` Volcanic Frenzy 4, `vo54:26` Concentrated Effect 1, `vo54:21` Monolithic Eruption 2, `vo54:7` Orb of Speed 1, `vo54:27` Lava Flow 5 | five core mores; Frenzy makes the direct-cast rate 1.33/s (12 Heraldry); Lava Flow +100% mana efficiency. Never take `vo54:3` Frozen Orb (cold conversion; Lament overrides anyway) |
| 2 | Mana Strike `ms26` (20) | generator | `ms26:2` Swift Sap 4, `ms26:3` Breaking Current 2, `ms26:4` Rune Sap 3, `ms26:20` Sprite Blade 1, `ms26:9` Mana Drain 4, `ms26:23` Arcanist's Blade 3, `ms26:28` Frigid Grasp 1, `ms26:24` Transfusion 2 | Frigid Grasp makes it a **cold melee attack** for Keplahan; each hit recovers VO cooldown (Lament), pays 24.6 mana and 94 ward, stacks Rune Sap |
| 3 | Flame Ward `fw3d` (20) | defense | `fw3d:17` Stalwart Defense 5, `fw3d:28` Desperate Defense 1, `fw3d:31` Astonish 1, `fw3d:25` Concentrated Shielding 4, `fw3d:27` Fortification 1, `fw3d:18` Barrier 5, `fw3d:11` Dilation 3 | 950 ward burst (400 + 200 + 200 + 150, A/U), 30% x 40% less hit damage window, auto-cast when stunned |
| 4 | Enchant Weapon `sb44eQ` (20) | buff / cleanse | `sb44eQ:14` Concentration 4, `sb44eQ:16` Efficacy 2, `sb44eQ:17` Kindling Blade 1, `sb44eQ:1` Celerity 5, `sb44eQ:20` Shivering Blade 2, `sb44eQ:25` Cleansed by the Elements 1, `sb44eQ:23` Frostbrand 5 | auto-activation on direct melee, ailment cleanse, faster and colder Mana Strike while active (speed gain not counted in 4.1) |
| 5 | Snap Freeze `sw31a` (20) | panic / armour | `sw31a:21` Cryomancy 4, `sw31a:24` Frozen Monolith 1, `sw31a:13` Snow Flurry 4, `sw31a:17` Focused Frost 3, `sw31a:20` Shiver Armor 5, `sw31a:5` Lasting Cold 3 | 2 s of no damage on demand; +250 armour and +25% cold res while on cooldown |

No traversal skill (P10). Prerequisites checked against `unlocked_by` (any one): `vo54:24` needs 19>=2, `vo54:25` 19>=3, `vo54:26` 25>=2, `vo54:7` 24>=1, `vo54:27` 21>=2; `ms26:4` 3>=2, `ms26:9` 20>=1, `ms26:28` 23>=2, `ms26:24` 23>=2; `fw3d:31` 28>=1, `fw3d:27` 25>=3; `sb44eQ:17` 16>=2, `sb44eQ:25` 20>=2; `sw31a:24` 21>=3, `sw31a:20` 17>=1. Nodes with skill-local (5000+) or display-only lines whose modifier type is not in data: every damage node above (type assumed more), `vo54:25` (CDR, assumed increased), `ms26:4` Rune Sap (stacking rule), `fw3d:18` Barrier.

### 5.3 Passives (113 points: 98 from levels G + 15 quest points X)

| Panel | Nodes (points) | Gate check |
|---|---|---|
| Mage base (27) | `mg-1:0` Arcanist 8, `mg-1:1` Scholar 8, `mg-1:3` Reactive Ward 1, `mg-1:5` Mage Flurry 5, `mg-1:8` Warden 5 | Mage Flurry req 10, Warden req 15 + 3>=1 |
| Spellblade, chosen (55) | `mg-1:35` Infused Weapon 8, `mg-1:32` Arcane Warden 8, `mg-1:33` Elemental Affinity 6, `mg-1:37` Arcane Shielding 5, `mg-1:77` Essence Duel 5, `mg-1:41` Mana Reaver 5, `mg-1:49` Mental Fortitude 10, `mg-1:46` Conjured Armor 3, `mg-1:51` Prodigy 5 | reqs 0/0/0/10/20/25/35/35/45, reached in that order (37 points before Mental Fortitude, 50 before Prodigy; Prodigy needs 49>=5) |
| Runemaster, not chosen (18) | `mg-1:54` Quintessence of Triumph 10, `mg-1:56` Unsealed Mana 1, `mg-1:86` Arcane Focus 1, `mg-1:91` Transcendence 6 | all req <= 20 (mastery access rule, X; the 20 cut-off itself U) |
| Sorcerer, not chosen (13) | `mg-1:13` Arcane Momentum 5, `mg-1:60` Afterglow 8 | req 0 and 5 |

Deliberately skipped: `mg-1:4` Preparation (only **elemental** spells; the converted VO is void), `mg-1:114` Burden of Knowledge (+25 spell for -25% cast speed: the rate loss cancels the gain in the model). With only 98 points: drop Conjured Armor 3, Mana Reaver 5, Reactive Ward + Warden 6, Unsealed Mana + Arcane Focus 2 (then Transcendence has no 86>=1 parent: drop it too) and accept about -300 ward.

### 5.4 Gear (BiS per slot; community counts from `slot_meta` mastery Spellblade, 5 matched guides, X)

| Slot | Item | Affixes (id, tier target, value used) | Res carried | Community usage (X) | Alternative |
|---|---|---|---|---|---|
| Weapon | **Lament of the Lost Refuge** (273) | implicits +160 melee, +108 void spell; LP: 723 Void Penetration T7 (0.22) | - | 0 of 5 Spellblade (top: 1 each of Jasper's Searing Pride, Mad Alchemist's Ladle, staves) | none (enabler) |
| Relic | **Eye of Orexia** (182) | LP: 553 Level of VO T5 (+2, +60% spell); implicits phys/fire/poison res 3-9% | 9/9/9 | 0 of 5 (top: Runic Scroll 2, Twisted Heart 2) | rare relic with 553 T7 (+4 levels) and cast speed 4 |
| Ring 1 | **Keplahan's Cryolith** (468) | fixed: cold VO trigger, +60% cold, Dex 12, Health 84, +50% crit chance | - | 0 of 5 (top: Silver Ring 2, Siphon of Anguish 2) | rare ring with affix 959 Keplahan's Cryolith Reforged (T5 40-50% chance) |
| Ring 2 | rare | P 15 Void Damage T7 (1.20), P 38 Spell Damage T7 (1.20), S 25 Health T7 (180), S 824 Ward/s + threshold T7 (40 / 230) | - | Health 2 of 5, Spell Damage 1 of 5 | Red Ring of Atlaria (1 of 5) |
| Amulet | rare | P 0 Void Penetration T7 (0.15), P 15 Void Damage T7 (1.20), S 24 Lightning Res T5 (0.45), S 29 Health + Stun Avoidance T7 (130 / 750) | L 45 | Health 2 of 5 | Omnis (2 of 5) loses the penetration |
| Helmet | rare | P 362 Inc Void + Added Spell Void T7 (1.10 / 14), P 502 Int T7 (16), S 17 Cold Res T7 (0.75), S 25 Health T7 (180) | C 75 | Int 3 of 5, Health 2 of 5 | Boneclamor Barbute (2 of 5) |
| Body | rare | P 362 T7, P 502 Int T7, S 10 Necrotic Res T7 (0.75), S 382 Ward per Second T7 (56) | N 75 | Int 3 of 5 | Adept Robes base (2 of 5) |
| Gloves | rare | P 4 Cast Speed T7 (0.30), P 502 Int T7, S 97 Crit Avoidance + Dodge T5 (0.37), S 19 Poison Res T7 (0.75) | P 75 | Cast Speed 1 of 5, Int 2 of 5 | Falcon Fists (2 of 5, melee AS) |
| Belt | rare | P 15 Void Damage T7, P 330 Mana Regen T7 (0.60), S 27 CDR T7 (0.32), S 7 Void Res T7 (0.75) | V 75 | CDR 2 of 5, Mana Regen 2 of 5 | Praetorian Belt base (2 of 5) |
| Boots | rare | P 28 Movement Speed T7 (0.30), P 502 Int T7, S 27 CDR T7 (0.32), S 13 Fire Res T5 (0.45) | F 45 | Movement Speed 5 of 5, CDR 1 of 5 | Army of Skin (2 of 5) |

Resistances (all added values, defenses.md s2 D): Fire 24 Arcanist + 18 Elemental Affinity + 9 Third Eye + 45 boots = 96; Lightning 24 + 18 + 45 amulet = 87; Cold 18 + 75 helmet = 93 (+25 Shiver Armor); Physical 9 + 75 Grand Resolve of Grael = 84; Void 75 belt; Necrotic 75 body; Poison 9 + 75 gloves = 84. All >= 75 (A, max rolls U). Class and level locks: Lament base level 60, no class lock; Eye base Third Eye is Mage-only (class_requirement 2), level 36; Keplahan's Cryolith level 50, no lock (A). One primordial: none used. LP is impossible on Keplahan (set item, `lp_eligible` 0).

### 5.5 Idols (default 20-cell grid, G/X; class idols are Mage)

| Cells | Idol | Prefix | Suffix |
|---|---|---|---|
| row 2 c1-c4 | Ornate (4x1, AEM 0) | 246 Increased VO Damage and Reduced Speed (0.55) | 912 Melee and Spell Damage T7 (+8 / +8) |
| row 4 c1-c4 | Ornate | 1038 Spell Damage (+8) | 912 T7 |
| row 1 c2-c4 | Grand (3x1) | 1054 Stun Avoidance (40, AEM-rescaled U) | 178 Ward per Second (40, AEM-rescaled U) |
| row 5 c2-c4 | Grand | 1051 Ward per Second (7, U) | 897 Ward Decay Threshold and Ward/s T7 (20 / 20, U) |
| row 2 c5, row 4 c5, row 3 c1/c2/c4/c5 | 6 x Minor (1x1) | 136 Stun Avoidance (U size scaling) | 105 Health (U size scaling) |

The six Minor idols are **not counted** in any number above (their per-size values are U). Community: Spellblade guides take "Ward decay threshold and Ward per second" on 3 of 5 (X).

### 5.6 Blessings (one per timeline, Grand where available; max rolls)

| Timeline | Blessing | Stat | Why |
|---|---|---|---|
| 3 The Black Sun | Grand Whisper of Orobyss | +65-100% void damage | damage |
| 5 Ending the Storm | Grand Resonance of the Sea | +30-42 ward/s | ward |
| 7 Reign of Dragons | Grand Survival of Might | +50-70% crit avoidance, +51-90 dodge | closes crit avoidance with gloves T5 |
| 9 The Age of Winter | Grand Resolve of Grael | +55-75% physical res | the only physical source |
| 10 Spirits of Fire | Grand Embers of Immortality | +18-30% endurance | reaches the 60% cap |
| 1, 2, 4, 6, 8 | drop-rate blessings | none in combat | no combat Grand option for this build in `v_blessings` |

## 6. Candidates and scores (le-build-around-item Phase C/D)

| # | Archetype | Class / mastery | Key pairing | Support | Dmg | Def | Sus | Gear | Nov | Total |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Heraldry Orb** (chosen) | Mage / Spellblade | Lament P1 + Spellblade 40% + Keplahan via Frigid Grasp | sections 3-4 | 3 (five mores, but 1.67 hits/s; 0.11 x LB) | 3 (capped res, ward + endurance, crit immune, weak stun) | 4 (ward and mana scale with Mana Strike rate) | 3 (Eye and Keplahan: 0 of 74, unknown availability) | 5 (0 of 74 VO main; 0 Spellblade VO; no catalogue entry names the pairing) | 18 |
| 2 | Void VO Sorcerer | Mage / Sorcerer | Lament + PP464 more spell damage per mana cost (+0.5% per mana, D) | mastery table | 3 | 3 | 2 (no melee generator: P9 and orb mana lost) | 4 | 4 (0 Sorcerer VO main; Glacier Sorcerer has VO secondary) | 16 |
| 3 | Void VO Runemaster | Mage / Runemaster | Lament, Runemaster elemental bonus | mastery table | 2 (elemental +30% lost to void) | 3 | 2 | 4 | 4 | 15 |
| 4 | Shatter Strike Spellblade, VO as Heraldry battery | Mage / Spellblade | Lament stacks for melee spell copies | `shatter-strike-spellblade-guide` exists | 3 | 3 | 3 | 3 | 2 (same mastery and main as a guide) | 14 |
| 5 | Enabler only: Flame Reave with Lament for +60% move speed and mana regen | Mage / Spellblade | Heraldry utility | `flame-reave-spellblade-guide` | 2 | 3 | 3 | 3 | 2 | 13 |

Gate: all >= 2 on Damage and Defense. Novelty pairing: #1.

## 7. Five in-game tests (2 minutes each) and the riskiest assumption

| # | Test | How to observe | Expected | If it fails |
|---|---|---|---|---|
| 1 | **Per-point tree reading** (riskiest) | VO tooltip damage with Molten Core at 1 point, then 5 points (same gear) | ratio 2.25 / 1.25 = 1.80 | if about 1.20 the tree is total-valued: orb mores drop from 13.5 to about 3.9 and Frenzy to 75%; DPS falls to about a quarter (the LB calibration falls too) |
| 2 | Spellblade copy of the spear implicit | equip and remove both 912 idols (8 melee + 8 spell each); read the VO tooltip | VO added changes by (16 + 0.4 x 16) x 2 ADE = 44.8 base-equivalent | if only 32, the 40% does not cover idol melee; then also check the spear by swapping to any rare spear |
| 3 | Heraldry upkeep and Evade | dummy rotation 15 s, count the buff stacks; press Evade once | 12 stacks after about 9 direct casts; Evade either keeps or clears them | if Evade clears them, never Evade in boss fights; if stacks stay below 12, raise cast speed |
| 4 | Keplahan via Frigid Grasp | Mana Strike on a dummy with and without `ms26:28` | one extra void orb about every 3 s only with Frigid Grasp; damage numbers void-coloured; Heraldry count does not rise from it | no orb: the trigger ignores re-tagged melee (-20% DPS, swap the ring for a rare); cold orb: Lament does not override (-cold scaling) |
| 5 | Mana and ward loop | 2 minutes of the rotation on a dummy | mana never reaches 0; ward settles near 3,400 | mana hits 0: drop Transfusion to 0-1 points; ward far lower: Prodigy per-15-Int is floored or Spellblade first-hit ward is per fight |

**Single assumption most likely to break the build:** that skill-tree node values are per point (A magnitudes, X developer statement), which carries both the 13.5x orb multiplier and the cooldown that holds 12 Heraldry stacks. Test #1 checks it in one respec.

## 8. Self-audit (le-build-audit) and what it changed

Ledger: every piece resolved by id (uids 273, 182, 468; affixes 0, 4, 7, 10, 13, 15, 17, 19, 24, 25, 27, 28, 29, 38, 97, 246, 330, 362, 382, 502, 553, 723, 824, 912, 1038, 1051, 1054, 897, 178, 136, 105; abilities `vo54`, `ms26`, `fw3d`, `sb44eQ`, `sw31a`; nodes as listed). Ledger problems: Minor-idol and Grand-idol values need the per-size rescale (U, Minor idols excluded from numbers); LP availability on 273 and 182 is derived (U).

Findings and fixes:
1. **Dead stats** (dead-stat SQL against mask 8388880): the spear's +160 melee and both 912 melee lines are dead on VO directly (kept: they are the input of P2 and they hit with Mana Strike); Keplahan's +60% cold is dead on VO (kept: it scales the cold Mana Strike and the ring is taken for the trigger); `mg-1:33` elemental damage is dead (taken for 18% elemental res). **Fixed:** removed Preparation (elemental-only), never take Frozen Orb or any "converted to cold/fire" VO node.
2. **Stun:** first draft had 61% stun per landed reference hit (amulet with plain Health). **Fixed:** amulet suffix 29 (Health and Stun Avoidance T7) and Flame Ward Astonish; now 39% (still a weakness, section 4.4).
3. **Cast-speed trap:** Burden of Knowledge (+25 spell, -25% cast speed) lowered the direct-cast rate more than it added. **Fixed:** replaced by Mana Reaver 5 (+50 health, mana per hit) and Conjured Armor 3.
4. **Mana:** all five skills checked; net +5.2/s; Mana Strike costs 0. No fix needed; Transfusion is the knob.
5. **Traversal:** none on the bar (P10). Evade is the open question (test #3).
6. **Resistances:** all seven >= 75 at max rolls; physical depends on one blessing.
7. **Remaining ranked suggestions (not applied):** (a) body suffix 52 Health +26% instead of 382 ward/s: pool 5,914 -> about 6,350 (+7%, D/U); (b) a rare relic with 553 T7 (+4 VO levels) once a better Eye is not found; (c) play corruption 300-500 until Flame Ward uptime is verified.

Anti-synergy sweep (Q14 over 273, 182, 468): Lament "All stacks of Corrupted Heraldry are lost when you use a Traversal Skill" (handled, P10); no "cannot", "no ward", "less" lines on 182 or 468. One-primordial rule: no primordial. Unique idols: none. Set: Keplahan's is 1 of 2 pieces (no set bonus counted).

## 9. Assumptions and failure modes

- Spellblade `addedMeleeGainedAsAddedSpell` covers weapon implicit and idol melee and yields untyped Spell (U): failure = -23.6% DPS (test #2).
- Triggered Keplahan orbs give no Heraldry (D? rule applied conservatively); if they do, stacks are 12 anyway.
- Rune Sap has no stack cap (U): failure = 42,758 instead of 46,160.
- Arcane Momentum keeps 5 stacks (U): VO is cast every 0.75 s, inside the 2 s window.
- VO core hits the boss once per cast (A: `canDamageSameEnemyAgain` false) and every orb connects (U: aim and orb speed).
- LP lines on 273 (723 T7) and 182 (553 T5) are obtainable (U).
- Max rolls on every rare line (U, same convention as the Maxroll profile).

## 10. Leveling to endgame

| Band | Skills | Gear | Switch |
|---|---|---|---|
| 1-15 | Mana Strike, Fireball, Flame Ward | any wand/sceptre | 15 base-tree points unlock VO |
| 15-36 | fire VO + Mana Strike, Snap Freeze | spell damage rares | Spellblade at the mastery quest; Eye of Orexia at 36 |
| 36-60 | fire VO (Molten Core first), Enchant Weapon at 15 Spellblade points | Keplahan's Cryolith at 50 + Frigid Grasp | Lament at 60 (Rat City Impaler base level): respec VO fire scalers into void, start Heraldry play |
| 60-100 | final bar | resist-capped rares, then LP slams | empowered timelines for the Grand blessings in 5.6 |

All three uniques have `can_drop_randomly` 1 (A); no farm location is in the data (U).

## 11. Data citations

| Claim | Source | Label |
|---|---|---|
| Lament lines, tooltips, alt text | `get unique 273`; `mods unique_mod 273`; `unique_tooltips` 273 | A |
| Heraldry cap and duration | `ability_properties` 78:7 alt text | A |
| Spear implicits, attack rate | `mods implicit 14:14`; `item_subtypes` 14:14 `$.attackRate` 0.98, level 60 | A |
| VO base, ADE, cooldown, tags | `get ability vo54` | A |
| VO tree | `skill_tree vo54`, `v_skill_node_summary` vo54 | A |
| Eye of Orexia | `get unique 182`; base 22:22 Mage-only | A |
| Keplahan's Cryolith | `get unique 468`; `ability_properties` 78:10 alt text | A |
| Mana Strike orb 15, Frigid Grasp | `get ability ms26`; `v_skill_node_summary` ms26 | A |
| Flame Ward 400 ward, 30% less, 3 s, 15 s | `get ability fw3d` | A |
| Spellblade bonus fields | classes-and-masteries.md, mastery table | D |
| Mastery access cut-off <= 20 | classes-and-masteries.md#mastery-access-rule | X / U |
| Damage pipeline, conversion, tags, DR | damage-pipeline.md s2, s3, s4, s9, s10 | D/G |
| Use rate, cooldown, triggers, mana cost | speed-cooldowns-mana.md s2, s3, s5, s6 | D / X |
| Ward decay and steady state, health, mana | ward-health-sustain.md s1, s3, s6 | D/G |
| Armour, resistances, endurance, crit avoidance | defenses.md s1-s7, s12 | D/G |
| Corruption f(c), reference samples | enemies-and-corruption.md | D / D? |
| Affix tiers | `mods affix_tier` for each affix id above | A |
| Blessings | `v_blessings` is_grand 1 | A |
| Community counts | `builds`, `build`, `item_usage`, `slot_meta` (mastery Spellblade, 5 guides); `v_build_summary` | X |
| Calibration inputs | `build lightning-blast-runemaster-guide tab Endgame`; uids 321, 286, 275, 404, 253, 454, 477, 423, 216; set 15; `get ability lb23il`, `ability_gen40` | X / A |

**MCP call count (mine): 64** `yarn mcp:call` invocations (5 of them returned an error or a bad-argument reply and were re-issued): 1 version, 2 schema, 29 sql, 8 get, 1 skill_tree, 6 builds, 3 item_usage, 3 build, 11 slot_meta (the slot_meta and builds batches are the C2 meta check). Note: the shared `challenge/` folder was also used by another agent, so `challenge/calls.log` mixes both agents' calls (theirs carry a time prefix); my numbers live in `B_scratch/`.

# Cold Cleaver: Forge Guard Rive frostbite stacker, built around Morditas' Reach (uid 45)

> Data: `game_version` 1.5.2, `data_version` 1.5.2 (`version152`), source `data/le.sqlite` through the `le-data` CLI (`yarn mcp:call`), worktree `D:/src/last-epoch-assistant.wt/integration`. Knowledge pages under `knowledge/` only; `vendor/` and `data/raw/` were not opened. Written 2026-10-09.
> Labels: **D** decompiled rule (knowledge page), **A** asset/db row, **G** game guide, **X** community (Maxroll 2026), **U** assumption. A computed number takes the weakest label of its inputs.
> Status: **theorycraft to test.** Not played. Not a known build.
> Reproducibility: every number in sections 6-8 comes from `scratchpad/challenge/A_work/A_model.mjs` (run `node A_model.mjs`; output saved as `A_model_output.txt`). Each input in that file carries its table + id or page#section in a comment. The pre-audit version (Stymied Fate) is `A_work/A_model_v1_stymied.mjs`. The SQL files cited below are in `A_work/` (the parent `challenge/` folder is shared with another agent, whose files overwrote some of my early scratch files; everything cited was re-written and re-run from `A_work/`).

## Build card

| Field | Value |
|---|---|
| Class / mastery | Sentinel / Forge Guard (`masteries` class 2 index 2) |
| Primary damage | **Frostbite** (ailment 23: Cold 50 over 3 s, unlimited instances, ADE 0; **A**). Modelled 92.4% of boss DPS (**U**, from A/D inputs). Not a direct hit. |
| Main skill | Rive (`sndr1`), used only as a frostbite applicator: strikes 1 and 2 only, 3.59 swings/s (**D/A**) |
| Core enabler (0 of 74 guides) | Morditas' Reach (uid 45, 2H spear Ice Spear, level 70 / base 46): "+500% chance to inflict Frostbite on Melee Hit" (`unique_mod 45` ord 3, SP1 special_tag 23, tags Melee, fixed 5; **A**) |
| Interaction | Morditas' 500% x Foe Cleaver (`sndr1:24`, doubles a 2h weapon's ailment-chance stats for Rive) = 1000%, + 275% from three other sources = **12.75 Frostbite stacks per swing** under the ">100% = floor stacks" rule; plus Snowdrift (uid 233, PP182) turning 1823% freeze rate multiplier on a build that never freezes into **+182% cold penetration for Frostbite**; plus Master of Arms Strength-with-2h feeding Rive's +4% per Strength attribute scaling |
| Boss DPS, level-100 boss, corruption 1000 | **33,181** (frostbite 30,672 + Rive hits 2,509) (**U**, inputs A/D/X/U) |
| Calibration (same method) | Erasing Strike VK (Maxroll Endgame tab): **983,477** central, 1,717,711 upside (**U**). Ratio **0.034** (0.019 vs upside). |
| EHP vs corruption-1000 rare melee hit (2,408 physical) | 24.7 hits with no recovery (13.2 worst case: no Bolster, no Frailty) (**U**, rules D) |
| Defense layers | armour 9,984 (77% physical DR at area 100), endurance 60% / threshold 1,125, Titan Heart 15% less, Bolster 26% less, Frailty x0.831 on the boss, all resistances >= 92% uncapped, Mask of Indifference stun immunity + 100% less crit bonus |
| Mana | Rive and Vengeance cost 0 (**A**); 7.6 mana/s spent vs 11.04/s regen (**U** usage cadence, A costs) |
| Other uniques | Frostbite Shackles 213 (3 of 74), Snowdrift 233 (3 of 74), Titan Heart 13 (16 of 74), Mask of Indifference 434 (5 of 74), Anchor of Oblivion 152 (6 of 74) (**X**) |
| Riskiest assumption | Foe Cleaver doubles Morditas' frostbite line -> test 1. If it does not, frostbite DPS falls to 19,556 (**U**). |

## 1. Constraint proof

### 1.1 Primary damage is not a direct hit (constraint 1)

Frostbite is a damaging ailment (`ailments` id 23: `dmg_cold` 50, `duration` 3, `max_instances` 0, `tags` DoT, **A**). It cannot crit, ignores armour, takes resistance, penetration of its type and level DR (`ailments.md#summary` items 1-3, **A/G/D**). Modelled share: frostbite 30,672 of 33,181 = **92.4%** of boss DPS (**U**; model line "frostbite share"). Even if Foe Cleaver fails (test 1), frostbite is 19,556 vs hits 2,509 = 88.6%.

### 1.2 Mastery + damage source in 0 of 74 guides (constraint 2)

| Query (all through `yarn mcp:call`) | Result | Label |
|---|---|---|
| `builds {"mastery":"Forge Guard"}` | 5 guides: forge-strike, shield-bash, multistrike, forged-weapons, shield-rush; main skills Forge Strike x2, Shield Bash, Multistrike, Shield Rush | X |
| `builds {"mastery":"Forge Guard","ability":"Rive"}` | 0 | X |
| `builds {"ability":"Rive","any_skill":true}` | 3: rive-void-knight-guide (VK, main Rive), radiant-lance-leveling-guide and paladin-leveling-guide (base Sentinel leveling) | X |
| `item_usage {"unique_id":45}` (Morditas' Reach) | `total_builds` 0; `builds {"item":"Morditas' Reach"}` count 0 | X |
| SQL `A_work/A_q6_frostbite_builds.sql` (below): every guide with any frostbite source (an item or affix whose text mentions Frostbite, or an allocated node that mentions it) | 31 rows; **no Forge Guard guide**; the only Sentinel row is bleed-hammerdin-paladin-guide, through Carrion of Creation, which converts frostbite chance **to bleed** | X |

```sql
-- A_q6_frostbite_builds.sql (yarn mcp:call sql --query-file <path>); returns 31 builds, none Forge Guard (the file also returns the evidence column)
WITH fb_items AS (SELECT DISTINCT i.build_id FROM v_build_items_named i LEFT JOIN v_unique_summary u ON u.unique_id = i.unique_id
  WHERE coalesce(i.affixes_text,'') LIKE '%rostbite%' OR coalesce(u.tooltip_text,'') || coalesce(u.mods_text,'') LIKE '%rostbite%'),
fb_nodes AS (SELECT DISTINCT n.build_id FROM v_build_nodes_named n JOIN v_skill_node_summary s ON s.tree_id = n.tree_id AND s.node_id = n.node_id
  WHERE coalesce(s.stats_text,'') || coalesce(s.description,'') LIKE '%rostbite%')
SELECT b.slug, b.mastery_name, b.main_skill FROM (SELECT * FROM fb_items UNION SELECT * FROM fb_nodes) e JOIN v_build_summary b ON b.build_id = e.build_id;
```

**Nearest existing builds and the differences.**
- Same main skill: **Rive Void Knight** (`rive-void-knight-guide`, Endgame, A/A/S). It also takes Foe Cleaver (`v_build_nodes_named`, node `sndr1:24`), but it is a Void Knight that converts Rive to void (Temporal Warrior), scales void melee **crit hits** with Apathy's Maw (uid 179, Doom), Unsated Rage, Omnis and Frenzy stacking, and specialises Devouring Orb, Anomaly, Void Cleave and Abyssal Echoes. This build is Forge Guard (no echoes, no void conversion), uses Foe Cleaver on an ailment-chance line instead of damage lines, takes Double Slash + Cadence, does no crit scaling, and gets ~92% of its damage from Frostbite.
- Same damage source: **Frostbite Swarmblade Druid** (`frostbite-swarmblade-druid-guide`, Primalist/Druid, C/C/C): frostbite from Swarmblade conversion and cold-skill idols. Different class, different applicator, no Morditas, no Foe Cleaver, no Snowdrift.

### 1.3 Core enabler used by 0 of 74 guides, and what breaks without it (constraint 3)

Morditas' Reach (uid 45): `item_usage` 0 of 74 (**X**). Without it:
- Rive's frostbite chance per swing falls from 12.75 to 2.75 (Shackles 1.43 + Maw 1.00 + Snowdrift 0.32, **A/U**): steady-state stacks 162.9 -> 37.4 and frostbite boss DPS **30,672 -> 6,140** (-80%, **U**; computed with the same model, Strength -15 and the weapon's 22% pen removed).
- Foe Cleaver (`sndr1:24`) has nothing to double: it only affects stats **on a 2h weapon** (**A** node text).
- Master of Arms (`kn-1:68`) gives +2 Strength per point **with a 2h weapon** (**A**): 16 Strength = 64% increased Rive damage (**A**) and 64% increased armour (**G/A**) depend on the 2h slot that Morditas fills.
The build has no other frostbite engine: without Morditas it is a 6k-DPS Rive with an unused tree.

## 2. The interaction (constraint 4)

Three chains, each from different sources, none of which states the combined result.

### 2.1 Chain 1 (stack engine): Morditas x Foe Cleaver x the >100% rule x Double Slash

| Part | Data line | Rule (page#section) | Label |
|---|---|---|---|
| a. Morditas' Reach | `unique_mod 45` ord 3: SP1 Ailment Chance, special_tag 23 (Frostbite), tags Melee, 5..5; tooltip "+500% chance to inflict Frostbite on Melee Hit" | A mod applies when its non-type tags are a subset of the source tags (`damage-pipeline.md#4`); Rive is `Physical,Melee` (`abilities sndr1` tags 513) | A, D |
| b. Foe Cleaver | `sndr1:24` (1 pt, unlocked by `sndr1:3` Bound Weapon 3): "Effect of Ailment Chance Stats on a 2h Weapon +100%" (prop 10001, skill-local) and description "stats on that weapon that ... add a chance to apply an ailment on hit, have double effect for Rive" | Skill-local 5000+/10000+ properties are coded per skill; the data has text and magnitude, not the code (`le-damage-reasoning` "cannot be determined") | A (text), **U** (that it doubles this exact line) |
| c. Chance above 100% | per hit: floor(chance) stacks + one more with probability frac(chance) | `ailments.md#1` and catalogue "Ailment chance above 100% applies extra stacks" (names Morditas' Reach) | G |
| d. Unlimited Frostbite | `ailments` 23 `max_instances` 0 | `ailments.md#3`: stacks_ss = lambda x T, no cap; catalogue "Duration raises DPS for uncapped ailments only" | A, D |
| e. Only fast strikes | `sndr1:21` Cadence (sequence 1,2,1,2,3) + `sndr1:23` Double Slash (skips strike 3) + `sndr1:15` Flurry (+10%/pt attack speed on strikes 1 and 2, x4) | `speed-cooldowns-mana.md#2`: tree increased speed adds to the increased pool | A, D |

Combined, not written anywhere: **each Rive swing applies 12 Frostbite stacks plus a 75% chance of a 13th** (10.00 from a x b, + 1.43 Frostbite Shackles `unique_mod 213`, + 1.00 Grand Maw of Artor blessing 34:187, + 0.32 Snowdrift `unique_mod 233` ord 7), at 3.59 swings/s, so 36.75 stacks/s from Rive and 162.9 stacks on a boss at steady state (with the Vengeance weave below). Confidence: **U** overall, driven by part b.

### 2.2 Chain 2 (penetration engine): Snowdrift x freeze rate multiplier x the Frostbite effect rule

| Part | Data line | Rule | Label |
|---|---|---|---|
| a. Snowdrift (uid 233, boots) | `unique_mod 233` ord 0: SP98 PP182 "Cold Penetration with Frostbite per 10% Freeze Rate Multiplier", 0.01 | catalogue "Freeze chance multiplies chill and frostbite": "PP182: frostbite effect = pp x FRM x 10"; `unique-effects-index.md` row 233 (PP182:stat) | A (line), D (model) |
| b. Freeze rate multiplier sources (SP67, untagged, added) | Frostbite Shackles `unique_mod 213` 1.43..1.83; affix 14 T7 2.71..3.50 (Shackles LP, Anchor LP); affix 14 T5 1.41..1.80 (amulet, ring 1, ring 2); Sapphire Amulet implicit `20:6` 0.1..1.0; Grand Weight of the Abyss blessing 34:89 2.0..3.0 | all verified as property 67, tags 0, special_tag 0 (`A_work/A_q34_frm_sources.sql`) | A |
| c. Frostbite "effect" is penetration | Frostbite's `effectOfIncreasedEffectiveness` is AdditionalPenetration; affix 339 is literally named "Cold Penetration with Frostbite" (SP43 special_tag 23) | `ailments.md#2` (effMore vs AdditionalPenetration) and Open questions: engine reads penetration, LE Tools reads a damage multiplier | D? |
| d. Penetration on an ailment | resMult = (1 - res) + pen, pen addressed like damage | `damage-pipeline.md#8`, `ailments.md#2` "Versus an enemy" | D |
| e. Rive never freezes | `ability_components` sndr1 / sub-strikes `freezeRate` 0 | freeze needs a freeze rate (`ailments.md#6`) | A |

Combined: 18.23 added FRM (**A/U**, max rolls) -> +182% cold penetration for Frostbite only, on a character that never freezes anything, so FRM (a freeze stat) is pure DoT damage. Boss resMult 1 + 1.82 + 0.22 = **3.04** (**D?/U**). Either reading of part c helps: as a damage multiplier it gives x2.82 x 1.22 = 3.44, frostbite 34,714 instead of 30,672 (**U**). The FRM base 100% is **not** counted (if it is, +10% pen: 31,680).

### 2.3 Chain 3 (Strength): Master of Arms x Rive attribute scaling x the ailment attribute rule

`kn-1:68` Master of Arms "Strength With 2h Weapon +2" per point x8 (**A**), with Juggernaut, Weapons Master, Might, Fire and Fury, Doom Knight and gear: 121 Strength. Rive's `ability_attribute_scaling` is +0.04 increased Damage per Strength (`attribute:0`, **A**), and "a skill's attribute scaling ... also applies to the ailments the skill applies" (catalogue "Skill attribute scaling and tree more also scale the skill's ailments", **G**; `ailments.md#summary` 2, **G/D**). So 121 Strength = **+484% increased frostbite damage** (**A/G**) and +484% increased armour (Strength +4% armour, `defenses.md#armour`, **G/A**). Vengeance has the same +4% per Strength scaling (`gs15de` attribute:0, **A**).

## 3. Community baseline (Phase C2; Maxroll 1.5.2, X)

| Item | `item_usage` (of 74) | by mastery |
|---|---|---|
| Morditas' Reach 45 | 0 | - |
| Frostbite Shackles 213 | 3 | Druid 2, Beastmaster 1 |
| Snowdrift 233 | 3 | Druid 2, Beastmaster 1 |
| Titan Heart 13 | 16 | Paladin 5, Forge Guard 4, Void Knight 3, ... |
| Mask of Indifference 434 | 5 | Void Knight 3, Necromancer 1, Paladin 1 |
| Anchor of Oblivion 152 | 6 | Void Knight 6 |

`slot_meta` for Forge Guard (5 guides matched; X):

| Slot | Top community picks (count of 5) | Typical affixes | This proposal | Why different |
|---|---|---|---|---|
| Weapon | Morditas' Vengeance 2, Event Horizon 1, Odachi 1, Primal Cadence 1 | Melee Physical Damage T7 (3) | Morditas' Reach (LP: Cold Pen, Melee AS) | the enabler |
| Helmet | Effusive Oath 3, Leonine Greathelm 2 | Health T5 (5), Strength T7 (4) | Mask of Indifference (LP: Strength, Health) | stun immunity + crit mitigation |
| Body | Titan Heart 4, Mantle of the Pale Ox 1 | Strength T5 (3) | Titan Heart (LP: Level of Rive, Strength) | matches the standard |
| Gloves | Falcon Fists 3 | Strength T7 (4) | Frostbite Shackles (LP: FRM, Melee AS) | chance, duration, FRM |
| Belt | Fangs of the Berserker 3, Brewmaster's Buckle 2 | Hybrid Health T5 (4), Health T7 (4) | rare Spidersilk Sash | cold + poison resistance implicit |
| Boots | Army of Skin 2, Foot of the Mountain 2 | Movement Speed T7 (4) | Snowdrift (LP: Movement Speed, Vitality) | penetration engine |
| Amulet | Nihilis 3, Omnis 2 | Crit Multiplier T7 (3) | rare Sapphire Amulet | FRM implicit, no crit use |
| Rings | Unsated Rage 3 / Siphon of Anguish 4 | Strength T7 (5) | 2 rare Opal Rings (FRM, DoT) | no crit or leech-drain use |
| Relic | Twisted Heart of Uhkeiros 4 | Strength T7 (4) | Anchor of Oblivion (LP: FRM, DoT) | endurance 40% |
| Idols | Small/Minor Weaver idols, Heretical Huge Rahyeh | Crit chance, block | Grand Solar idols (DoT) | DoT scaling |

## 4. Candidates (divergent phase, short form)

| # | Archetype | Pairing (ids) | Backing query | Dmg | Def | Sus | Gear | Nov | Total |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Forge Guard Rive frostbite (chosen)** | Morditas 45 + Foe Cleaver sndr1:24 + Snowdrift 233 + Master of Arms kn-1:68 | Sentinel skill/passive scan for ailment and frostbite nodes (found `sndr1:24`); frostbite-scaling source scan; `A_q34_frm_sources.sql` | 2: one more path, x0.034 of ES | 4: capped res, armour, endurance, stun immune; no freeze answer | 3: leech 1.5% of cold damage, Lunge heal | 3: Morditas (0 of 74, random drop), Shackles/Snowdrift (3 of 74 each) | 5: 0 FG Rive or FG frostbite guides | 17 |
| 2 | Void Knight Rive frostbite with echoes and Anomaly Cycle of Decay `an0my:11` | same + VK echo | Sentinel ailment-node scan (`an0my:10`, `an0my:11`) | 3 | 4 | 3 | 3 | 2: Rive VK guide shares mastery, skill and Foe Cleaver | 15 |
| 3 | Shaman Earthquake ignite through Bhuldar's Wrath 162 (armour shred -> ignite, 2..4 chance) | uid 162 | unused-unique scan (`v_unique_summary` not in `v_build_items_named`, ailment words) | 2 | 3 | 2 | 2: `can_drop_randomly` 0 | 4 | 13 |
| 4 | Ward-to-bleed Mage through Symbol of Demise 123 | uid 123 | same scan | 2 (Demise duration unknown) | 2: ward is consumed | 2 | 3 | 5 | 14 |
| 5 | Primalist Tempest Strike frostbite with Morditas (500%, no doubling) | uid 45 | Strength/cold/DoT/frostbite unique scan | 2 | 3 | 3 | 3 | 3 (Druid frostbite exists) | 14 |

Gate: all pass Dmg >= 2, Def >= 2. Chosen: #1. #2 would add echoes (about x1.8 frostbite, **U**) but repeats the Rive VK guide.

## 5. Build sheet

### 5.1 Class and mastery
Sentinel / Forge Guard. Mastery bonuses: +35% physical and fire resistance, Stalwart stacks (+10% increased armour per stack, 10 stacks, gained when you hit or are hit) (**A**, `classes-and-masteries.md` mastery table). Level 100, 113 passive points (Maxroll Endgame tabs record 113, **X**).

### 5.2 Skills (20 points each, Rive 24 with Titan Heart's +4)

| Slot | Skill | Role | Nodes (points) | Why |
|---|---|---|---|---|
| 1 | Rive `sndr1` (24) | main applicator | `sndr1:2` Champion 4, `:6` Weapon Specialist 1 (path tax), `:8` Ripples of Oblivion 4, `:3` Bound Weapon 3 (path), `:24` Foe Cleaver 1, `:15` Flurry 4, `:19` Rending 1 (path), `:21` Cadence 1, `:23` Double Slash 1, `:26` Iron Reach 4 | 1000% frostbite chance; strikes 1-2 only, +40% AS; more: Champion 32%, Ripples 20%, Iron Reach strike-two 100% (average 1.5) |
| 2 | Vengeance `gs15de` (20) | defensive weave + applicator | `:16` Executioner 2, `:19` Bolster 2, `:17` Disarming Strike 3, `:6` Vengeful Fighter 5, `:2` Double Riposte 1, `:5` Rapid Strikes 5, `:30` Perfect Riposte 1, `:3` Dark Duellist 1 | Bolster: 26% less damage taken + 50% increased armour for 2 s; Frailty 60%/hit; applies 7.75 frostbite stacks (no Foe Cleaver) |
| 3 | Lunge `lu25ng` (20) | mobility + heal | `:2` Dawn Charge 5, `:15` Juggernaut Dash 2, `:25` Unstoppable 1, `:32` Warrior's Renewal 3, `:35` Endless Will 2, `:16` Disarming Blow 3, `:9` Blade Stream 1, `:3` Broadside 1, `:6` Slipstream 2 | heal 40% of missing health per Lunge, invulnerable while lunging, Frailty |
| 4 | Ring of Shields `rs31hi` (20) | defense, Frailty | `:1` Reinforcement 2, `:7` Tempered Steel 2, `:14` Heavy Burden 3, `:11` Defensive Shields 2, `:12` Iron Form 1, `:16` Banding 3, `:17` Enduring Defense 3, `:24` Bastion 1, `:26` Amass 3 | Frailty 15% per shield on hit (3 stacks on the boss), 1 s invulnerability on cast, shields draw aggression; 16 s duration vs 15 s cooldown |
| 5 | Manifest Armor `ma6hdr` (20) | taunt tank | `:16` Steel Greaves 2, `:17` Warstomp 3, `:18` Thick Padding 1, `:20` Lethargy 2, `:1` Platemail 2, `:5` Self Repair 5, `:6` Lambent Metal 1, `:3` Bulwark 4 | taunts and absorbs boss attention (not modelled) |

Rotation: Rive continuously; one Vengeance every 1.9 s (inside Bolster's 2 s window); Ring of Shields on cooldown; Lunge for movement and healing; Manifest Armor when it dies.
Skill-local or display-only lines relied on (type from code, magnitude **A**): Foe Cleaver prop 10001; Iron Reach, Champion, Ripples (p0 display-only, read as more per `damage-pipeline.md#5` 429:38 prior, **D**); Bolster SP6 "less" (read as more); Flurry, Rapid Strikes (increased speed).

### 5.3 Passives (113 points; mastery access rule: non-chosen masteries only `mastery_requirement` <= 20, `classes-and-masteries.md#mastery-access-rule`, X)

| Order | Node | Pts | Gate | Why |
|---|---|---|---|---|
| 1 | `kn-1:0` Juggernaut | 8 | base r0 | +8 Str, +32% fire and void res |
| 2 | `kn-1:4` Relentless | 10 | base r5 | +50% increased damage, +500 stun avoidance |
| 3 | `kn-1:2` Armor Clad | 5 | base r5 | +75 armour, 10% less from nearby enemies |
| 4 | `kn-1:49` Fearless | 8 | base r0 | +8 Vitality |
| 5 | `kn-1:65` Weapons Master | 10 | FG r0 | +10 Str, +5% crit with spear (threshold 5) |
| 6 | `kn-1:28` Battle Hardened | 10 | FG r0 | +60% armour, +60% phys res, 10% less physical taken with overcap (threshold 7) |
| 7 | `kn-1:32` Unflinching | 5 | FG r5 | +10% health, +500 stun avoidance |
| 8 | `kn-1:31` Might | 6 | FG r25 | +6 Str, +12% health |
| 9 | `kn-1:34` Thornmail | 8 | FG r15 | +240 armour |
| 10 | `kn-1:27` Steel Aegis | 1 | FG r0 | +10 armour; reaches 40 FG points |
| 11 | `kn-1:46` Fire and Fury | 6 | FG r40 | +6 Str, +6 Att |
| 12 | `kn-1:68` Master of Arms | 8 | FG r45 (chosen mastery) | +16 Str with a 2h weapon |
| 13 | `kn-1:11` Abyssal Endurance | 10 | VK r0 | +80 health, +40% void and phys res, 5% less void/phys taken |
| 14 | `kn-1:10` Devouring Blade | 5 | VK r0 | +25% increased damage |
| 15 | `kn-1:62` Doom Knight | 8 | VK r15 (<= 20) | +8 Str, +48 health, 5% more armour |
| 16 | `kn-1:71` Defiance | 5 | Paladin r0 | +15% elemental res, +5 Att |

Totals: base 31, Forge Guard 54, Void Knight 23, Paladin 5 = 113 (**A** node maxima).

### 5.4 Gear (max rolls assumed on uniques, T7 on legendary slams, T5 on crafted rares; **U** for the roll assumption)

| Slot | Item | Affixes (id, tier, value) | Resistances / defense carried |
|---|---|---|---|
| Weapon | **Morditas' Reach** uid 45 (Ice Spear 14:2, attackRate 0.98, implicit Cold Melee 68, melee crit 6%) | unique: FB 500%, Cold Melee 30, cold leech 1.5%, Str 15, Cold+Melee pen 30%; LP: 721 Cold Penetration T7 0.22, 2 Melee Attack Speed T7 0.30 | - |
| Helmet | Mask of Indifference uid 434 (Forest Helmet, armour 50) | unique: stun/chill/slow/shock/bleed/blind immunity, 100% reduced crit bonus, armour 200, endurance threshold 200; LP: 501 Strength T7 16, 52 Health T7 26% | - |
| Body | Titan Heart uid 13 (Copper Plate: armour 114, lightning 14%) | unique: armour 100, health +40%, 15% less damage taken with a 2h melee weapon, no health regen; LP: 563 Level of Rive T7 +4 (its 150% melee line is dead for frostbite), 501 Strength T7 16 | lightning 14% |
| Gloves | Frostbite Shackles uid 213 (Mail Bracers, armour 32) | unique: FB chance 143%, FB duration 33%, FRM 183%; LP: 14 FRM T7 3.50 (+cold res 18%), 2 Melee Attack Speed T7 0.30 | cold 18% |
| Belt | rare Spidersilk Sash 2:7 (poison 47%, cold 47%) | prefixes 16 Cold Damage T5 0.60, 330 Mana Regeneration T5 0.38; suffixes 52 Health T5 12%, 425 Endurance Threshold T5 80 | cold 47%, poison 47% |
| Boots | Snowdrift uid 233 (Outcast Boots: armour 20, +10% move speed, +1 Evade charge) | unique: PP182, FB chance 32%, cold added 10; LP: 28 Movement Speed T7 30%, 505 Vitality T7 16 | necrotic/poison +16% via Vitality |
| Amulet | rare Sapphire Amulet 20:6 (FRM 100%, cold res 20%) | prefixes 14 FRM T5 1.80 (+cold 10%), 16 Cold Damage T5 0.60; suffixes 25 Health T5 90, 80 Elemental Res T5 20% | cold 30%, elemental 20% |
| Ring 1 | rare Opal Ring 21:10 (CDR 10%, all attributes +2) | prefixes 14 FRM T5 1.80, 72 DoT T5 0.60; suffixes 24 Lightning Res T5 45%, 25 Health T5 90 | lightning 45%, cold 10% |
| Ring 2 | rare Opal Ring 21:10 | prefixes 14 FRM T5 1.80, 72 DoT T5 0.60; suffixes 10 Necrotic Res T5 45%, 25 Health T5 90 | necrotic 45%, cold 10% |
| Relic | Anchor of Oblivion uid 152 (Lost Anchor, +25% armour) | unique: endurance 40%, Str 14, endurance threshold 100; LP: 14 FRM T7 3.50 (+cold 18%), 72 DoT T7 1.20 | cold 18% |

LP plan: all five uniques are `lp_eligible` 1 (**A**, derived; confirm in game, **U**). Two-affix legendaries throughout.
Resistances (uncapped, model "Resistances A"): fire 122%, cold 188%, lightning 114%, void 92%, necrotic 94%, poison 96%, physical 155% (**A/U**); all capped at 75%.

### 5.5 Idols (default 20-cell grid; layout **U**)

| Shape | Prefix | Suffix | Count |
|---|---|---|---|
| Grand Solar Idol (3x1, Sentinel) | 119 Damage Over Time 0.60 (**X/U**: value as on community Heretical Grand Solar Idols) | 899 DoT + Endurance T7 (DoT 0.10, endurance 5%, overcap) | 4 |
| Minor Idol (2x1) | 1070 All Resistances (tiny, ignored) | 105 Health 30 (**U**, low end of 30..80) | 4 |

### 5.6 Blessings (empowered timelines)

| Timeline | Blessing | Value | Why |
|---|---|---|---|
| 3 The Black Sun | Grand Memory of Light 34:25 | +70 health | pool |
| 5 Ending the Storm | Grand Weight of the Abyss 34:89 | +3.0 FRM | +30% frostbite pen through Snowdrift (beats Grand Might of the Sea Titan: x1.10 vs x1.08) |
| 7 Reign of Dragons | Grand Resolve of Humanity 34:149 | +20% all res | resistance cap |
| 9 The Age of Winter | Grand Maw of Artor 34:187 | +100% FB chance (special_tag 23) | +1 stack per hit |
| 10 Spirits of Fire | Grand Body of Obsidian 34:205 | +320 armour | armour |

## 6. Numbers

All formulas from `damage-pipeline.md`, `ailments.md`, `speed-cooldowns-mana.md`, `defenses.md`, `enemies-and-corruption.md`. Arithmetic is in `A_work/A_model.mjs`; the trace below repeats it.

### 6a. Boss DPS vs a level-100 boss at corruption 1000 (Build A)

Corruption raises boss health and damage, not damage taken (`le-damage-reasoning` step 8), so it does not enter DPS.

| Step | Value | Inputs and labels |
|---|---|---|
| Strength | 121 | 2 base + 54 passives + 15 Morditas + 16 Mask LP + 16 Titan LP + 4 Opal + 14 Anchor (**A**, rolls **U**) |
| Increased pool for Frostbite | 11.99 -> x12.99 | Str 121 x 0.04 = 4.84 (**A/G**); Relentless 0.50, Devouring Blade 0.25 (**A**); Cold Damage T5 0.60 x2 (**A**); DoT T5 0.60 x2 rings, DoT T7 1.20 Anchor (**A**); idols 4 x 0.60 (**X/U**) + 4 x 0.10 (**A**). Excluded as dead (tag rule, `damage-pipeline.md#4`): Level of Rive's Melee 150%, Titan Heart Melee 40%, Morditas Cold+Melee pen, Anchor Void increased (void bucket only) |
| More, Rive-applied | 2.376 | Champion 1.32 x Ripples 1.20 x Iron Reach average (1 + 2.0)/2 = 1.5 (**A/D**, Iron Reach on ailments **U**) |
| More, Vengeance-applied | 1.758 | 1.30 x 1.30 x 1.04 (**A/D**) |
| Chance per swing | Rive 12.75, Vengeance 7.75 | 5 x 2 + 1.43 + 1.00 + 0.32 (**A/U**) |
| Duration T | 3 x 1.33 = 3.99 s | Shackles 0.33, special_tag 23 (**A**) |
| Damage per stack over its life | Rive 50 x 1.33 x 12.99 x 2.376 = 2,052.5; Vengeance 1,518.3 | `ailments.md#2` D_stack x (1 + durMore) (**D**) |
| Rive swings/s | (1 + 0.40 + 0.30 + 0.30) x 0.98 x 1.25 x 1.1 / 0.75 = 3.593 | `speed-cooldowns-mana.md#2` (**D**), sndr1 fields (**A**) |
| Vengeance uses/s | (1 + 0.85) x 0.98 x 1.1 / 0.75 = 2.659 -> 0.376 s | (**D/A**) |
| 1.9 s cycle | 1 Vengeance + (1.9 - 0.376) x 3.593 = 5.476 Rive swings | cycle **U** |
| lambda | 5.476 x 12.75 / 1.9 + 7.75 / 1.9 = 36.75 + 4.08 = 40.83 stacks/s | `ailments.md#3` (**D**) |
| Steady-state stacks | 40.83 x 3.99 = 162.9 | (**D**) |
| Frostbite vs dummy | 36.75 x 2,052.5 + 4.08 x 1,518.3 = **81,615** | (**U**) |
| resMult | 1 - 0 + 1.823 (Snowdrift) + 0.22 (affix 721) = 3.043 | boss 0% res (**G**), pen rule (**D**), Snowdrift model (**D?**) |
| Level DR | boss 0.87 + 0.05 x 0.13 = 0.8765 -> x0.1235 | `damage-pipeline.md#9` (**D/A**) |
| **Frostbite vs boss** | 81,615 x 3.043 x 0.1235 = **30,672** | (**U**) |
| Rive hit | cold bucket 1.25 x (30 x 2 + 68 + 10) = 172.5; phys 2; inc 8.69 cold; more 2.376; crit 16% x2.0 -> E 1.16; pen 0.52 | `damage-pipeline.md#2,#7` (**D**); Foe Cleaver doubling only the unique line (**U**) |
| Rive hit DPS vs boss | 2.88 hits/s x 871 = **2,509** | (**U**) |
| **Total** | **33,181**; frostbite 92.4% | (**U**) |

Sensitivity (frostbite only): Foe Cleaver does not double the chance 19,556; Snowdrift pen not applied 12,297; FRM base counted 31,680; Frostbite effect read as more-multiplier 34,714; Iron Reach not reaching ailments 21,224; pure Rive without the Vengeance weave 35,339 (**U**).

Ramp: stacks need about T = 4 s to reach steady state (`ailments.md#3`), so the number is a sustained single-target figure, not a burst figure.

### 6b. Calibration: Maxroll Erasing Strike Void Knight, Endgame tab, same method

Gear, idols, blessings, passives and skill nodes read with `build {"slug":"erasing-strike-void-knight-guide","tab":"Endgame"}` (**X**); stat lines with `A_work/A_q25_es_uniques.sql` (`v_mods_named`, **A**). Same pipeline: buckets, ADE, increased/more, crit, resMult, level DR.

| Step | Value | Sources |
|---|---|---|
| Hit component | `es6ai_1`: Void 2, ADE 6, crit 5% (**A**) | `ability_components` |
| Added | Void+Melee 52 (World Splitter) + 65 (affix 76 T7) + 10 (Shattered Chains) = 127; untyped Melee 130 (Bardiche implicit) + 10 (idol 1039) = 140; Fire+Melee 27 (Falcon Fists) | **A/X** |
| Buckets | void 2 + 6 x 267 = 1,604; fire 162; phys 6 | `damage-pipeline.md#2-3` (**D**) |
| Increased (void) | 10.24: Str 40 x 0.04 = 1.60, idols 894 0.54, melee 2.90 (affix 986 1.40, Titan 0.40, Chains 0.70, Sorrow and Steel 0.40), void 5.20 (affix 568 1.50, idols 326 2.70, Anchor 1.00) | **A/X** |
| More (void) | 14.53 = tree 1.5 (Erasure) x 2.0 (Obliteration, doubled 2h) x 0.8 (Shattered Continuity) x 1.10 (Merciful) x 1.5 (Chamber of Fate, slowed) x 2.0 (Final Hour, 12 Time Rot) x 1.15 (Crushing Blows 0.5% x 30 mana) x 1.06 (affix 986, cap 20) x 1.15 (VK mastery 1% per 3 Vit, 45 Vit) x 1.10 (Singular Purpose) x 1.19 (Shattered Chains 5% x 3.8 Doom stacks, **U**) | **A/D/U** |
| Crit | chance capped (Maxroll FAQ "105%", **X**); multiplier 2.0 + 0.40 (Emptiness of Ash) + 0.68 (Void Corruption, 68 VK points) + 0.20 (Champion of the Forge, 40 Str) + 1.40 (World Splitter PP478, 1% per 10 of 1,402 max mana, **U** model) = 4.68 | **A/X/U** |
| Rate | mana-limited: (regen 8 x 2.55 = 20.4 + Void Well 30% of 1,402 per 4 s = 105.1, **X**) / (30 + 60 Time Loop) = 1.394 uses/s; speed limit 1.88 | **A/X/U** |
| Hits per use | 1 + 1 (Time Loop echo) + 0.26 VK echo chance = 2.26 | **A/U** |
| Enemy | void resMult 1 + 0.20 (Time Bubble shred, boss 10 x 2%) + 0.15 (Woe) + 0.11 (Flames of Midnight) = 1.46; armour shred 32.8 stacks -> -3,278 armour -> non-physical x1.36 (`damage-pipeline.md#8`, **D/X**); level DR x0.1235 | **D/A/U** |
| **ES boss DPS** | avg hit 312,037 x 3.15 hits/s = **983,477** (central); upside x1.75 (Void Essences, Army of Skin vs high health 35% of the fight, Void Adept, Mark of Rot 5/12) = 1,717,711 | (**U**) |

**Ratio: Build A / ES VK = 33,181 / 983,477 = 0.034** (0.019 against the ES upside). Excluded from both models: void rifts and Void Beams (ES), Vengeance and Manifest Armor hits and Scrap Metal stacks (A). The gap is structural, not a slip: ES puts 267 added damage through ADE 6 (a x800 base) and crit x4.68; Frostbite has a fixed 16.7/s base and ADE 0 (`ailments.md#summary` 1), and gets x163 from stack count instead. Context: a level-100 rare at corruption 1000 has 1,783 x 3.489 x 11.80 = 73,400 health on the post-DR scale (`enemies-and-corruption.md#worked-example` method, **D**), 2.2 s of Build A single-target DPS vs 0.08 s for ES. Boss health pools are per boss and not in the data, so boss kill time cannot be given.

### 6c. EHP at corruption 1000 (area 100)

| Item | Value | Source / label |
|---|---|---|
| f(1000) | 0.002 x 1000^1.52 + 1.055 x 1000 - 47.693 = 1,079.9 -> x11.80 hit, x6.40 DoT | `enemies-and-corruption.md#corruption-and-the-monolith` (**D**) |
| Reference rare melee hit | 87.58 x 1.2264 x 1.9 x 11.80 = **2,408 physical** | `defenses.md#worked-example` chain (**D?**) |
| Boss spell proxy | 129.62 x 1.2264 x 11.80 = 1,876 elemental | `le-defense-reasoning` step 6 (**U**) |
| DoT reference | 151.03 x 1.2264 x 6.40 = 1,185/s | (**D?**) |
| Health | (100 + 1,000 + 6 x 29 Vit + 588 added) x (1 + 1.00) = 3,724 | `ward-health-sustain.md#1` (**D**), inputs **A/U** |
| Endurance / threshold | 60% (20% base + 40% Anchor) / 0.2 x 3,724 + 200 + 100 + 80 = 1,125 | `defenses.md#7` (**G/A**) |
| pool_post | (3,724 - 1,125) + 1,125 / 0.4 = 5,411 | `defenses.md#12` (**D**) |
| Armour | 1,161 added x (1 + 0.60 + 4.84 + 0.25 + 1.00 Stalwart + 0.50 Bolster) x 1.05 = 9,984 -> 76.9% physical DR, 53.8% non-physical (L = 105) | `defenses.md#armour` (**D**) |
| Resistances | all >= 92% uncapped; capped 75% vs 75% area pen -> x1.00 | `defenses.md#2` (**G/D**) |
| Less damage taken | Titan Heart 0.85 (**D**), Bolster 0.74 (**A**, more), Battle Hardened 0.90 physical (**A**), Abyssal Endurance 0.95 physical/void (**A**), Armor Clad nearby 0.90 (**U**), Frailty on the boss 0.94^3 = 0.831 (**A**, no boss penalty) | |
| **Rare melee 2,408** | post 219 -> **24.7 hits** with no recovery; worst case (no Bolster, Frailty, nearby) 411 -> **13.2 hits** | (**U**) |
| Boss spell proxy 1,876 | post 405 -> 13.4 hits; worst 740 -> 7.3 hits | (**U**) |
| DoT 1,185/s | post 634/s -> 8.5 s; worst 856/s -> 6.3 s (hidden 15% less DoT, `defenses.md#8`) | (**U**) |
| Crit | Mask of Indifference `unique_mod 434` ord 5: 100% reduced bonus crit damage at max roll (range 10%..100%, **A**) -> crits deal x1.0 (`defenses.md#6`) | **A/U** |
| Stun | Mask Stun Immunity (SP56, **A**) | |
| Chill / slow / shock | Mask immunities (PP flags, **A**) | |
| Freeze | **no answer**: no freeze immunity or cleanse; only the health pool raises the freeze threshold (`ailments.md#6`) | gap |
| Recovery (not in the hit counts) | Morditas cold leech 1.5% of 33,181 = 498 HP/s vs a boss (catalogue "Leech ... works on DoT", **D**); Lunge Dawn Charge 40% of missing health; Titan Heart removes health regen | **U** |

### 6d. Mana loop (per second, sustained boss play)

| Line | Mana/s | Source |
|---|---|---|
| Regen | 8 x (1 + 0.38) = **+11.04** | base 8/s (**G**, `ward-health-sustain.md#6`), affix 330 T5 (**A**) |
| Rive | 0 | `abilities sndr1` mana_cost 0 (**A**) |
| Vengeance (every 1.9 s) | 0 | `abilities gs15de` mana_cost 0 (**A**) |
| Lunge (every 4 s) | -2.00 | 8 mana, 4 s cooldown (**A**), cadence **U** |
| Ring of Shields (every 15 s) | -2.60 | 30 - 3 x 2 (Tempered Steel) + 5 x 3 (Amass) = 39 (**A**) |
| Manifest Armor (recast every 20 s) | -3.00 | 60 mana (**A**), cadence **U** |
| **Net** | **+3.44** | closes; the damage loop needs no mana at all |

## 7. Five falsifiable in-game tests (2 minutes each, riskiest first)

1. **Foe Cleaver doubles Morditas' chance.** With Morditas and no other frostbite chance, hit a training dummy once with Rive strike 1 and count Frostbite stacks on the debuff bar. Expected **10** (5 without Foe Cleaver). Failure (5) = chain 1 halves: frostbite DPS 19,556.
2. **Snowdrift penetration from FRM.** Swap the Sapphire Amulet for a non-FRM amulet (-2.8 FRM) and read the dummy DPS of Frostbite alone (stop attacking, watch the ticking number). Expected dummy damage falls by about 0.28 / 3.04 = 9% if pen applies on a dummy (dummy has 0 res, so pen adds directly). Failure (no change) = chain 2 is dead: frostbite 12,297.
3. **Stack count steady state.** Rive a dummy for 10 s, stop, read the stack counter: expected about 12.75 x 3.59 x 3.99 = 183 with pure Rive (162.9 with the Vengeance weave). Far fewer = a hidden cap or replacement rule (`ailments.md` open question on replacement).
4. **Strength scales Frostbite.** Remove the Mask (-16 Str) and compare dummy frostbite ticks: expected -0.64 / 12.99 = -4.9%. No change = attribute scaling does not reach the ailment for this skill.
5. **Bolster uptime.** Weave Vengeance every 1.9 s against a dummy and watch the Bolster buff icon and the armour value on the character sheet: expected the icon never drops and sheet armour sits about 6.5% higher than without it (model: 9,374 -> 9,984 with full Stalwart). If the icon flickers off, the 1.9 s cycle is too slow and the EHP figures fall to the "worst case" column.

**Single assumption most likely to break the build: Foe Cleaver's "+100% effect of ailment chance stats on a 2h weapon" applies to Morditas' "+500% chance to inflict Frostbite on Melee Hit" (test 1).**

## 8. Self-audit (`le-build-audit`) and fixes

Ledger: all names resolved by id (uniques 45, 434, 13, 213, 233, 152; affixes 2, 10, 14, 16, 24, 25, 28, 52, 72, 80, 105, 119, 330, 425, 501, 505, 563, 721, 899; nodes as listed; blessings 34:25, 34:89, 34:149, 34:187, 34:205). Class locks: no base or affix is class-locked against Sentinel (501 Strength and 563 Level of Rive include Sentinel). Level: Frostbite Shackles 74 is the highest requirement.

| # | Finding | Fix |
|---|---|---|
| 1 | Grand Trance of the Sirens (34:93, +22% "ailment duration") is **special_tag 5 = Shock** (`A_work/A_q33_blessings_downsides_drawbacks.sql`): it would not touch Frostbite. A first draft used it. | Replaced with Grand Weight of the Abyss (+3.0 FRM -> +30% frostbite pen). |
| 2 | Calibration showed the first draft (Stymied Fate boots, DoT slams everywhere) at 14,235 boss DPS (`model_v1_stymied.mjs`, ratio 0.014). | Switched boots to Snowdrift and slams to FRM: +133% total DPS. |
| 3 | Rive points: Scrap Metal and Challenge gave nothing measurable; Iron Reach was at 1/4. | Moved 3 points to Iron Reach (4/4) and 1 from Ripples: Rive more 1.86 -> 2.38. |
| 4 | Dead stats (`A_work/A_q35_dead_stats.sql`, frostbite mask DoT+Ailment+Cold): Level of Rive's 150% Melee, Titan Heart 40% Melee, Morditas Cold+Melee pen 30%, affix 721's minion line, Anchor's Void increased (typed to void). | Kept: they ride on items chosen for other lines (Rive levels, 2h less damage taken, the enabler, endurance). Listed so nobody counts them. |
| 5 | Wasted stats: endurance overcap (idols 899 +20%), Weapon Specialist point (spear gets nothing), Frostbite Shackles ward lines. | Accepted as path or item tax. |
| 6 | No freeze answer; Titan Heart turns off health regen. | Stated as gaps; sustain is leech (498 HP/s) + Lunge. |
| 7 | Vengeance weave costs 13% DPS (35,339 frostbite pure Rive vs 30,672). | Kept: it buys 26% less damage taken and +6% armour. |
| 8 | Downside nodes in the five trees (`is_downside` query): Tempered Steel -10% shield health, Amass +5 mana, Double Riposte 25% -> 18% riposte DR; Focused Strike, Projection of War, Double Strike, Rush Wall, Displacement, Redistributed Steel are **not** taken. | Accepted; mana budget includes Amass. |
| 9 | Q14 drawback sweep over the six uniques: only Titan Heart ("You do not regenerate health"). Catalogue anti-synergy headings checked: "Ailments cannot apply ailments and DoT triggers nothing on hit", "Immunity uniques block self-ailment synergies" (Mask blocks none we use), "No crit and cannot leech drawbacks" (none on our items), "Titan Heart's two-handed less damage taken". | No conflict. |

Not determined from data: whether Foe Cleaver doubles this line (U), Snowdrift's FRM base (U), Frostbite effect as pen vs more (D?), Iron Reach's strike-two more on ailments (U), Ring of Shields base shield count (U), Scrap Metal stack cap (not counted), boss health pools, the exact idol values on Grand/Minor idols (X/U).

## 9. Data citations

| Fact | Source |
|---|---|
| Morditas' Reach lines | `get unique 45`; `unique_mod` 45 ords 0-5; `unique_tooltips` 45 |
| Foe Cleaver, Champion, Ripples, Iron Reach, Flurry, Cadence, Double Slash | `skill_tree sndr1` nodes 24, 2, 8, 26, 15, 21, 23 |
| Rive speed, ADE, attribute scaling | `abilities sndr1`; `ability_components` sndr1 and sub-strikes; `mods ability_attribute_scaling sndr1` |
| Frostbite | `ailments` 23; `ailments.md#2, #3, #4.1` |
| Frostbite Shackles, Snowdrift, Titan Heart, Mask, Anchor | `unique_mod` 213, 233, 13, 434, 152; `unique-effects-index.md` rows |
| FRM sources | `A_q34_frm_sources.sql` (blessing 34:89, unique_mod 213, affix 14 T7, implicit 20:6) |
| Passive nodes and thresholds | `passive_tree 2` (kn-1 nodes listed in 5.3) |
| Community counts | `builds`, `item_usage`, `slot_meta` (Forge Guard), `A_q6_frostbite_builds.sql`, `A_q28_foe_cleaver_usage.sql` |
| ES VK inputs | `build erasing-strike-void-knight-guide` Endgame; `A_q25_es_uniques.sql`; `skill_tree es6ai, an0my, do5vr, ab0lh, v01cv`; `A_work/A_q27_es_base_attr_cdp_class.sql` (Bardiche 0.89, attribute scaling, cdp 2) |
| Rules | `damage-pipeline.md#2-#9`, `ailments.md#1-#3`, `speed-cooldowns-mana.md#2`, `defenses.md#2, #armour, #7, #8, #12`, `enemies-and-corruption.md` corruption and reference tables, `ward-health-sustain.md#1, #6`, catalogue sections 5 and 7 |

MCP calls: 95 `le-data` tool calls through the CLI (`yarn mcp:call`), counted from my own session (44 `sql`, 8 `get`, 10 `skill_tree`, 1 `passive_tree`, 3 `build`, 6 `builds`, 7 `item_usage`, 11 `slot_meta`, 1 `schema`, 1 `version`, 3 re-runs of cited SQL); about 9 of them failed on argument or column errors and were re-run. The shared `calls.log` also contains another agent's calls, so it is not my count.

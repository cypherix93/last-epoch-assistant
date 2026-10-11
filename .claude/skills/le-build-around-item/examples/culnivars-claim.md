# Worked example: "I dropped Culnivar's Claim"

This walks through the procedure in `../SKILL.md`, step by step, with the queries an agent would issue and the values found. Every value below was read from the built database (`data/le.sqlite`, game 1.5.2) with the tool calls and recipe queries shown, and re-checked against the db when this example was last revised. (On a stub or empty db the skill falls back to the vendored JSON in `vendor/lastepochbuilder/research/data/game/`, 1.5.0; this example does not need it.) Arguments are written in the MCP `tool({json})` form; Q-numbers refer to the Query cookbook in `../SKILL.md` and run via `sql` with the params given there. The community figures in Phase C2 (74 Maxroll guides, 1.5.2, label X) were read with the Q18-Q19 queries and `../../le-bis-selection/SKILL.md` example 3; the `item_usage` / `builds` / `slot_meta` tools return the same counts. `vendor/` is never opened. The example stops before full damage and EHP numbers, but each phase is shown concretely.

**Names, not ids.** Ids appear here only inside tool-call arguments (the agent needs them to run the next query) and in the closing Data citations table. Every finding is written the way the player sees it in the game: skill nodes with their skill ("Innate Conduit (Lightning Blast node)"), passives with their class or mastery ("Wisdom (Sorcerer passive)"), uniques with their slot ("Mana Guide (unique amulet)"), affixes as their stat line and tier ("+50-60% increased Mana Regen (T7, ring)"), blessings with their timeline. The names come from **le-data-query**, "Player-facing names" (queries A-D). The proposal the player receives follows the same rule.

## Phase A: Intake

**Step 1. Version.** `version({})` returns game version "Version 1.5.2" and data version "1.5.2"; `SELECT count(*) FROM uniques` returns 486, so the db is populated. Both versions go on the Build card.

**Step 2. Parse.** The input was a bare name. `lookup({"name":"Culnivar's Claim","kinds":["unique"]})` resolves it to Culnivar's Claim, a unique sceptre (its id goes into the next calls and into the citations).

**Step 3. Mods** (`get({"kind":"unique","id":33})` returns `unique`, `mods`, `tooltips`, `subtypes`; or Q2; stat lines rendered with **le-data-query** query D):

| # | Stat line (as the tooltip shows it) | Applies to | Type | Range | Label |
|---|---|---|---|---|---|
| 1 | +90% increased Lightning Spell Damage | skills tagged both Lightning and Spell | increased | fixed | A |
| 2 | +90% increased Lightning Spell Critical Strike Chance | same | increased | fixed | A |
| 3 | +16-24% increased Mana Regen | everything | increased | rolls | A |
| 4 | +16-24 Lightning Spell Damage | same as line 1 | added | rolls | A |

Tooltip line: "100% of mana converted to ward when you reach full mana". Alt text: "Does not trigger while your mana is replaced with Rage" (A).

**Step 4. Model.** `knowledge/interactions/unique-effects-index.md` has the row for Culnivar's Claim: tooltip "100% of mana converted to ward when you reach full mana", modelled as a coded resource effect of the item (model code and class name go to the citations). The `get` call of step 3 adds the four mods and the alt-text line. The rule itself is in `knowledge/mechanics/ward-health-sustain.md` section 3.3: "at full mana: mana -> 0, ward += maxMana", unique component, confidence **D**. The catalogue search for "Culnivar" finds the entry "Mana-to-ward converters": "the cycle rate is mana regen / max mana, so regen stacking (Urzil's Pride, Apathy) feeds ward" (**D**).
- Not stated by any page: whether the gained ward takes more-ward-generated multipliers, is blocked by "no ward gain" sources or is capped by a max-health cap for ward. Write "coded detail not read (**U**)" and make it a test (Phase F, 6).
- The alt text "Does not trigger while your mana is replaced with Rage" is **A** (from `get`).

**Step 5. Split.**
- Enabling effect: a full mana bar becomes a ward burst of your maximum mana, after which mana resets to 0.
- Stat stick: 90% increased Lightning Spell damage, 90% increased Lightning Spell crit chance, +16-24 added Lightning Spell damage. It helps only skills tagged both Lightning and Spell. Minions and totems get none of it (`knowledge/mechanics/minions.md`, Summary 1).

**Step 6. Restrictions** (Q3, params `[33]`):
- Slot: sceptre (one-handed). Base item: Auric Sceptre, with implicits +38 melee damage and +38-48 added spell damage, attack rate 0.98.
- The unique requires level 50; the Auric Sceptre base requires level 52. Quote both, and confirm in game.
- No class requirement.
- Legendary potential: the data marks it as a Legendary Potential item, not Weaver's Will (LP eligibility is derived, not stored per unique: confirm in game before planning a legendary craft, **U**). It cannot drop as a legendary. Not primordial, not a set item, drops randomly.
- Slot consequence: the off-hand is free, so a shield or catalyst fits. That matters for Paladin block and Mage catalysts.
- Q10 (params `[8]`, the sceptre base) shows legendary-plan candidates on sceptres:
  - "+192-240 Mana and +160-200% Mana Spent Gained as Ward" (T8, the highest tier, on a sceptre; A; the scale of Mana Spent Gained as Ward is D? in `ward-health-sustain.md`);
  - two corrupted affixes, "Mana Spent Gained as Ward and Ward Decay Threshold" and "Added Mana and increased Mana Regen per 100 Maximum Mana". A corrupted copy cannot become legendary (`uniques-sets-legendary.md`), so choose one path.

## Phase B: Enabling-effect model

**Step 7. Rate equation** (built from the D formula):

```
fill time T = maxMana / (R - S)        R = mana regen + mana gains per s, S = mana spent per s
ward per cycle = maxMana               (before GainWard multipliers)
Culnivar ward/s = maxMana / T = R - S  (independent of maxMana)                                 # D (derived)
```

Max mana sets only the burst size. Sustained ward equals net mana regeneration.

Plausible endgame inputs (all **U**):
- base regen 8/s (A/G, `ward-health-sustain.md` §6);
- increased regen: Culnivar 0.20, an amulet 0.52, two rings 0.7 each, Focus while channelling +0.5;
- R ≈ 8 x (1 + 2.62) ≈ 29/s;
- S ≈ 3/s.
- Result: about 26 ward/s from Culnivar (**U**).

**Step 8. Benchmark.**
- A single T8 "+90-112 Ward per Second" affix on a helmet (also on body armour and catalysts) gives 90-112 ward/s (A).
- The steady-state table (`ward-health-sustain.md` §3.2, D) gives about 345 ward at G = 50 and R = 1.

Verdict for the Build card: as a sustained ward source, Culnivar's Claim loses to one plain affix (**U**, inputs U). Its case rests on three things:
- the burst: a full bar of maximum mana turned into ward in one tick;
- the Lightning Spell stat stick;
- the rule change, mana dumped to 0, which other effects can exploit (Phase C).

## Phase C: Divergent phase

**Step 9.** Q4 with params `[258, 258]` (player skills with a tree tagged both Lightning and Spell) returns 8 skills. Selected ones, with mana cost:
- Lightning Blast, 3 mana (Mage)
- Static, 15 mana, 4 s cooldown (Mage)
- Static Orb, 38 mana (Sorcerer)
- Radiant Lance, 24 mana (Paladin)
- Glyph of Dominion, 30 mana (Runemaster)
- Elemental Nova, 11 mana
- Disintegrate, channelled, 18 mana/s

Not Lightning Spell but relevant: Focus (Spell Buff, channelled, no cost) and Mana Strike (Lightning Melee, no cost, "restores 15 mana" on hit).

**Step 10.** Q6 (params `["lb23il"]`), Q7 and `skill_tree({"ability_id":"lb23il"})` scans found these rule-changers:
- Innate Conduit (Lightning Blast node): "While out of mana, Lightning Blast has no cost, but cannot chain". It pairs directly with Culnivar's dump to 0. Whether "0" counts as "out" is **U**.
- Effluent Defense (Lightning Blast node): ward per mana spent; its stat line is display-only.
- Overcharge (Lightning Blast node): "cannot double cast if it is channelled or cast by another skill". This is an anti-synergy for any triggered Lightning Blast.
- Unbound Thought (Focus node): Focus has no cooldown, but the burst no longer grants mana.
- Overcharge (Focus node): lets current mana exceed max. Culnivar converts maximum mana and zeroes the excess, so the node is wasted; test it.
- Energy Overflow (Focus node): lightning waves each second, "Maximum Mana -> Lightning Damage 12%" per point, display-only. It reads max mana, which Culnivar never lowers.
- Cloudless Sky (Radiant Lance node): no shield needed, "+1% damage per 25 max mana".

**Step 11.** The catalogue scan by tags `mana`, `ward` and `channel` found:
- "Mana-to-ward converters";
- "Max mana as defence and damage" (Radiant Lance "Cloudless Sky");
- "Endurance and mana-before-health never protect ward";
- "Ignivar's Head gives free Fire Aura casts while channelling", as a pattern for channel-trigger items;
- "\"Directly\" means triggered casts do not count".

Novelty pairing: Culnivar's Claim + Mana Guide + Focus. No catalogue entry names these together.

**Step 12. Stack partners.** `find_mods({"filters":{"property":18,"source_kinds":["unique_mod"]},"limit":100})` returns 15 unique lines that grant Mana Regen, plus the tooltip text. The relevant ones:
- Mana Guide (unique amulet): +34-70% increased Mana Regen, +25-50 Ward per Second while channelling, +50-115 Ward Decay Threshold, +24-38% Lightning Resistance. Tooltip: "While channelling Focus you cast Lightning Blast once per second", "Mana regeneration from Focus is half as effective", "You have 50% less armor while channeling Focus".
- Urzil's Pride (unique body armour): "1% increased mana regeneration per 2% uncapped Lightning Resistance".
- Bluefeather Band (unique ring): 3 zero-cost skills in a row give mana and ward, but 48-54% less Mana Regen. That is an anti-synergy with regen-as-ward.

Affixes (stat lines on the slot named, from `v_affix_values`):
- Mana Regeneration: T8 "+94-110% increased Mana Regen" on rings, relics and belts (+110-129% on an amulet).
- "Added Attunement and Increased Mana Regen" (prefix, 8 tiers): + Attunement and +% increased Mana Regen.

Idols (from `v_idol_affix_values`, ranges on that idol):
- Ornate Idol (4x1): "+12-40 Ward per Second" (Mage only; Grand Idol (3x1) +8-27).
- Ornate Idol (4x1): "+12-40% Mana Spent Gained as Ward" (Mage only; Grand Idol +8-27%).
- Enchanted Ornate or Huge Idol: "+4-5% Increased Cooldown Recovery Speed and +8-10% increased Mana Regen" (T7).

Blessings: all three relevant ones are in Ending the Storm, so only one can be taken:
- Bastion of Divinity: +25-40% Lightning Resistance (Grand Bastion of Divinity +55-75%);
- Light of the Moon: +30-50 Mana;
- Resonance of the Sea: +17-25 Ward per Second.

**Step 13. Passives** (Q13 with params `["ward", "ward"]`, or `passive_tree({"class_id":"Mage"})`; names with query A of **le-data-query**):
- Warden (Mage passive, 5 pts): +10% ward retention per point.
- Wisdom (Sorcerer passive, 8 pts): mana regen per mana.
- Mana Bulwark (Sorcerer passive): mana before health. Anti-synergy, because mana sits near 0 after each dump.
- Inscribed Instruments (Runemaster passive): ward retention while using a sceptre.

**Step 14. Natural defense layers.**
- Mage: ward, plus Prismatic Stance (Focus node) for less elemental damage taken.
- Paladin: block, armour and health. Culnivar's ward bursts sit on top.
- Shaman: totems as distraction.
- Necromancer: minions as meat.

## Phase C2: Meta check

Community data: 74 Maxroll guides, 1.5.2, label **X**. Counts are "N of 74 guides".

**Step 14b. Item usage.** Q18 with params `[33]` returns 0 of 74: no guide wears Culnivar's Claim (`item_usage({"unique_id":33})` returns `total_builds` 0 <!-- expect-zero -->). Partners (Q18 for each): Mana Guide 1 of 74, worn in the amulet slot by the Maxroll "Hydrahedron Runemaster" guide (main skill Flame Ward; Q18b); Urzil's Pride 0; Bluefeather Band 0 (it is an anti-synergy anyway); Transient Rest (unique boots, a mana-to-ward converter) 4 of 74.

**Step 14c. Existing builds.** Q19 with params `["Sorcerer", "Lightning Blast", "Sorcerer"]` returns 4 guides: Glacier Sorcerer (C/B/C), Meteor Sorcerer (A/A/A), Static Orb Sorcerer (S/S/S) and Lightning Blast Runemaster (S/A/S), the tiers being corruption / speed / bossing as the guide author gives them (**X**). No guide combines Sorcerer with Lightning Blast, and none uses Culnivar's Claim. So candidate #2 has no direct community build. How it differs from the nearest ones: the Lightning Blast Runemaster guide is the same skill on another mastery (runes, no mana dump); the Static Orb Sorcerer guide is the same mastery with a different main skill and no mana-to-ward loop (Static Orb is also used here only as the nuke after a dump). The proposal must keep that difference visible: the loop (Culnivar's dump into Innate Conduit, the Lightning Blast node) is its reason to exist.

**Step 14d. Community-standard picks per slot** (Sorcerer guides only, 3 of 74; the query of `../../le-bis-selection/SKILL.md` example 3 run for each slot, keeping picks used by at least 2 guides; every pick is a legendary in the guides' data):

| Slot | Picks used by 2 or more of the 3 Sorcerer guides |
|---|---|
| Body armour | Unstable Core (3 of 3) |
| Belt | Orian's Descent (3 of 3) |
| Relic | Shattered Worlds (3 of 3), Twisted Heart of Uhkeiros (3 of 3) |
| Boots | Transient Rest (2 of 3) |
| Rings | Red Ring of Atlaria (first ring, 2 of 3), Legends Entwined (second ring, 2 of 3) |
| Off-hand | Scales of Eterra (2 of 3) |
| Helmet, gloves, amulet, weapon | no item shared by 2 guides (each guide differs) |

The sample is thin (3 guides): treat it as a list of options to compare, not a rule. Two consequences for the skeleton: (1) the relic and belt slots have a community-standard unique, so a "rares only" gear plan needs a reason to skip them; (2) Transient Rest is a community boots unique that is also a mana-to-ward converter (catalogue "Mana-to-ward converters"), so check it as a partner or a competitor of Culnivar's Claim before choosing boots.

## Phase D: Scores

| # | Archetype | Core | Dmg | Def | Sus | Gear | Nov | Total |
|---|---|---|---|---|---|---|---|---|
| 1 | Focus conduit Mage ("turret") | Focus with Unbound Thought + Mana Guide's automatic Lightning Blast + Energy Overflow (Focus node); Urzil's Pride | 2 | 3 | 3 | 3 | 5 | 16 |
| 2 | Lightning Blast dump-cycler Sorcerer | Lightning Blast with Innate Conduit after each dump; Effluent Defense | 4 | 3 | 2 | 5 | 4 | 18 |
| 3 | Sword-and-board Radiant Lance Paladin | Radiant Lance, block-scaled; shield in the free off-hand | 4 | 4 | 3 | 4 | 3 | 18 |
| 4 | Runemaster lightning runes | Glyph of Dominion, Runic Invocation; Runemaster bonus +30% increased Elemental Damage | 3 | 3 | 2 | 5 | 2 | 15 |
| 5 | Storm Totem Shaman, Culnivar as pure ward engine | Storm Totem; stat stick wasted (totems) | 3 | 3 | 3 | 4 | 4 | 17 |
| 6 | Necromancer, ward engine only | minions; stat stick wasted | 3 | 3 | 3 | 4 | 3 | 16 |
| 7 | Spellblade Mana Strike refill | Mana Strike restores 15 mana; Lightning Melee misses the Spell requirement | 2 | 3 | 3 | 5 | 3 | 16 |

Community citations for the two axes that need them: **Gear** (candidate #2 scores 5): the item is used by 0 of 74 guides, so there is no community availability signal; the plan needs only rares for the other slots, with the community-standard uniques (Unstable Core 3 of 3 Sorcerer guides, Orian's Descent 3 of 3) as options, not requirements. **Novelty** (#2 scores 4): 0 of 74 guides use the item and 0 pair Sorcerer with Lightning Blast; the loop is not named in the catalogue as one chain (Innate Conduit is named in no entry), so 4, not 5. Candidate #1 (Novelty 5): Mana Guide is used by 1 of 74 guides (Hydrahedron Runemaster), none with Focus and none with Culnivar's Claim. Candidate #3 (Novelty 3): 2 Paladin Radiant Lance guides exist (Radiant Lance Paladin and Ignite Radiant Lance Paladin; Q19 with params `["Paladin", "Radiant Lance", "Paladin"]`), so the pairing with this item is new but the build is not.

Gate: all candidates pass. Druid was excluded before scoring, because forms replace mana with Rage and so disable the effect (skill descriptions; Culnivar's alt text). The novelty pairing is #1. Converge on **#2**, with **#1** as an alternate. #3 ties on score, but its 24-mana casts keep mana from filling, so its enabler value is lowest.

## Phase E: Skeleton (#2, partial)

This section is written exactly as it would appear in the proposal: in-game names only.

- **Class:** Mage / Sorcerer. Mastery bonuses: "+50 mana" and "Spells deal 1% more damage per 2 mana cost, up to 50% more" (A; `classes-and-masteries.md`).
- **Skills:**

| Skill | Role | Key nodes (points) | Why |
|---|---|---|---|
| Lightning Blast | main | Innate Conduit 1/1, Effluent Defense 2/2, Storm Razor 3/3, Overcharge 4/4 | free casts after each dump; ward per mana spent; Overcharge works on direct casts only |
| Focus | refill and ward | Mana Flooded 4/4, Mind Shell 4/4, Everward 2/2 | fills the bar between dumps |
| Flame Ward | burst ward | (tree not planned yet) | 400 ward (A), 25 mana, 15 s cooldown |
| Teleport | mobility | (tree not planned yet) | |
| Static Orb | nuke right after a dump | (tree not planned yet) | 38 mana; negative mana is allowed while mana is above 0 (`ward-health-sustain.md` Summary 9) |

- **Gear:**

| Slot | Item | Affixes to look for (tier target) | Notes |
|---|---|---|---|
| Weapon | Culnivar's Claim (unique sceptre) | LP or slam: "+192-240 Mana and +160-200% Mana Spent Gained as Ward" (T8) or "+% increased Mana Regen" | LP eligibility to confirm in game (U) |
| Off-hand | rare catalyst | | free because the sceptre is one-handed |
| Body armour | Urzil's Pride (unique body armour), optional | | needs uncapped Lightning Resistance to pay off |
| Helmet | rare | +33-42 Ward per Second (T6) or better | |
| Rings, relic | rares | +40-49% increased Mana Regen (T6) or better | |

- **Blessing:** Grand Bastion of Divinity (Ending the Storm blessing), if Urzil's Pride is used.
- **Community baseline:** no Maxroll guide pairs Sorcerer with Lightning Blast (step 14c); the proposal differs from the Static Orb Sorcerer and Lightning Blast Runemaster guides by the mana-dump loop. Slot picks to compare with the community-standard ones: relic (Shattered Worlds, 3 of 3 Sorcerer guides), belt (Orian's Descent, 3 of 3), body armour (Unstable Core, 3 of 3).

Still to do, using the sibling skills:
- the damage path (**le-damage-reasoning**): the 90% increased Lightning Spell damage lands in the increased bucket, and Lightning Blast nodes whose effect type the data only infers are uncertain (**U**);
- the defense plan (**le-defense-reasoning**): seven resistances, ward steady state, endurance only on health;
- passives in full, idols, leveling.

## Phase F: Honesty notes, and what to test first

Player-facing, so in-game names only:

1. Does a dump to exactly 0 mana count as "out of mana" for Innate Conduit (Lightning Blast node)? Cast Lightning Blast right after the ward bar jumps and watch whether mana moves. If it does not count, #2 loses its loop and #3 or #1 takes over.
2. Is the ward burst equal to the character-sheet max mana? Compare the ward bar before and after the tick.
3. Does Overcharge (Focus node) waste mana? Watch mana exceed max, then drop to 0 at the dump.
4. Does Mana Guide's triggered Lightning Blast cost mana? (U) Watch mana during a Focus channel with no other casts.
5. Measure the cycle time. Expect `T = maxMana / net regen`; time it with a stopwatch on a dummy.
6. Does the ward gained at the dump take more-ward-generated multipliers, and is it blocked by no-ward-gain sources or capped (**U**, step 4)? Compare the ward bar jump with the sheet's max mana with and without such a modifier.

Assumptions:
- every regen input in Phase B (U);
- the value scale of Mana Spent Gained as Ward (D?).

Anti-synergies already checked:
- Mana Bulwark (Sorcerer passive) and mana before health;
- Bluefeather Band (unique ring);
- Druid Rage forms;
- "directly" on triggered Lightning Blast casts.

## Data citations

The only place with ids; each one is paired with its in-game name.

| In-game name | Source kind | Id / path |
|---|---|---|
| Culnivar's Claim (unique sceptre), base Auric Sceptre | unique / item subtype | uid 33; base 8:5 |
| Mana Guide (unique amulet) | unique | uid 368 |
| Urzil's Pride (unique body armour) | unique | uid 10 |
| Bluefeather Band (unique ring) | unique | uid 440 |
| Transient Rest (unique boots) | unique | uid 132 |
| Mana Regeneration / "+% increased Mana Regen" | affix | 330 |
| Ward per Second (helmet) | affix | 382 |
| "+Mana and +% Mana Spent Gained as Ward" (sceptre LP target) | affix | 759 |
| corrupted sceptre affixes (Mana Spent Gained as Ward and Ward Decay Threshold; Added Mana and increased Mana Regen per 100 Maximum Mana) | affix | 973, 999 |
| Added Attunement and Increased Mana Regen | affix | 1015 |
| Ward per Second / Mana Spent Gained as Ward / Cooldown Recovery and Mana Regen (idols) | affix | 178, 328, 893 |
| Effluent Defense, Storm Razor, Overcharge, Innate Conduit (Lightning Blast nodes) | skill node | `lb23il:14`, `:15`, `:22`, `:28` |
| Mana Flooded, Prismatic Stance, Overcharge, Everward, Energy Overflow, Mind Shell, Unbound Thought (Focus nodes) | skill node | `vm53dx:7`, `:13`, `:16`, `:19`, `:23`, `:26`, `:28` |
| Cloudless Sky (Radiant Lance node) | skill node | `ra1an:32` |
| Warden (Mage), Wisdom, Mana Bulwark (Sorcerer), Inscribed Instruments (Runemaster) passives | passive node | `mg-1:8`, `:14`, `:27`, `:92` |
| Bastion of Divinity, Grand Bastion of Divinity, Resonance of the Sea, Grand Resonance of the Sea (Ending the Storm) | blessing | 72, 73, 82, 83 (Light of the Moon: 74-75) |
| Lightning Blast, Focus, Static Orb, Radiant Lance, Glyph of Dominion, Elemental Nova, Disintegrate, Mana Strike, Storm Totem, Flame Ward | ability | `lb23il`, `vm53dx`, `so35a`, `ra1an`, `gy2dm`, `en6`, `dig5`, `ms26`, `st38ml`, `fw3d` |
| Sorcerer mastery bonus "Spells deal 1% more damage per 2 mana cost" | player property | PP 464 |
| Culnivar's ward conversion (coded resource effect) | unique-effects-index row / model | `unique-effects-index.md` row 33, model `C33:0:resource`, class `Culnivars_Claim` |
| Mana-to-ward rule | knowledge page | `ward-health-sustain.md` section 3.3 (**D**) |
| Mana-to-ward converters | catalogue entry | `catalogue.md`, "Mana-to-ward converters" |
| Community usage (74 guides, **X**) | community views | `v_item_usage`, `v_build_items_named`, `v_build_summary` (Q18-Q19); guides `hydrahedron-runemaster-guide`, `static-orb-sorcerer-guide`, `lightning-blast-runemaster-guide` |
| Tables read | tables | `uniques`, `mods` (unique_mod, affix_tier), `abilities`, `affixes`, `affix_stats`, `item_subtypes`, `trees`, `blessings` |

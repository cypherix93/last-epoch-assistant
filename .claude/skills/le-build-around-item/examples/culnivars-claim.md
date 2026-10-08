# Worked example: "I dropped Culnivar's Claim"

This walks through the procedure in `../SKILL.md`, step by step, with the queries an agent would issue and the values found. In this checkout the db was built with `LE_DB_ALLOW_STUBS=1`, so every table is empty. The values below therefore come from the vendored-JSON fallback (`vendor/lastepochbuilder/research/data/game/*.json`, `gameVersion` 1.5.0), as the skill directs. The example stops before full damage and EHP numbers, but each phase is shown concretely.

## Phase A: Intake

**Step 1. Version.** `version()` returns `game_version` "Version 1.5.2" and `data_version` 1.5.2 (`meta` table), but `SELECT count(*) FROM uniques` returns 0. The fallback is vendored JSON 1.5.0. Both versions go on the Build card.

**Step 2. Parse.** The input was a bare name. `lookup("Culnivar's Claim", ["unique"])` resolves to uid 33 (fallback: `uniques.json`, `data[].uniqueID = 33`, `displayName "Culnivar's Claim"`).

**Step 3. Mods** (`get("unique", 33)` / Q2; fallback `uniques.json` `mods[]`):

| # | Property (SP) | Tags | Type | Range | Rolls | Label |
|---|---|---|---|---|---|---|
| 0 | Damage (0) | 258 Lightning, Spell | increased | 0.9 (90%) | fixed | A |
| 1 | CriticalChance (4) | 258 Lightning, Spell | increased | 0.9 (90%) | fixed | A |
| 2 | ManaRegen (18) | 0 | increased | 0.16 .. 0.24 | rollID 0 | A |
| 3 | Damage (0) | 258 Lightning, Spell | added | 16 .. 24 | rollID 1 | A |

Tooltip line: "100% of mana converted to ward when you reach full mana". Alt text: "Does not trigger while your mana is replaced with Rage" (A).

**Step 4. Model.** In `unique-effects-index.md`, row 33 shows model `C33:0:resource`, class `Culnivars_Claim/code`. The `unique_effects.json` entry for uid 33 reads:
- trigger: "every update tick";
- condition: `currentMana >= maxMana`, and `!BaseMana.manaReplacedByRage()`;
- formula: `reduceMana(currentMana)` (mana goes to 0), then `ProtectionClass.GainWard(maxMana)`;
- "creates": the gain goes through GainWard, so it takes the more-ward-generated multipliers, it is blocked by `sourcesOfNoWardGain`, and it is capped by `maxHealthCapForWard`;
- confidence **D**. The notes add a dead `convertsFocus` branch, flagged **D?**.

The catalogue search for "Culnivar" finds the entry "Mana-to-ward converters": "the cycle rate is mana regen / max mana, so regen stacking (Urzil's Pride, Apathy) feeds ward" (D). `ward-health-sustain.md` §3.3 lists the same effect in its table.

**Step 5. Split.**
- Enabling effect: a full mana bar becomes a ward burst of `maxMana`, after which mana resets to 0.
- Stat stick: tag mask 258, Lightning|Spell (90% increased damage, 90% increased crit chance, +16-24 added). It helps only skills tagged both Lightning and Spell. Minions and totems get none of it (`knowledge/mechanics/minions.md`, Summary 1).

**Step 6. Restrictions** (Q3; fallback `uniques.json` + `items.json`):
- Base type 8 is the one-handed sceptre. Sub type 5 is "Auric Sceptre", with implicits +38 melee damage and +38-48 spell damage (added) and attack rate 0.98.
- The unique's `levelRequirement` is 50; the Auric Sceptre base has `levelRequirement` 52. Quote both, and confirm in game.
- No class requirement (`classRequirement []`).
- `legendaryType "LegendaryPotential"`: it can carry LP. Not primordial, not a set item, `canDropRandomly true`.
- Slot consequence: the off-hand is free, so a shield or catalyst fits. That matters for Paladin block and Mage catalysts.
- Q10 (`affix_can_roll_on` for base 8) shows legendary-plan candidates on sceptres:
  - 759 "Mana and Mana Spent Gained as Ward": T8 Mana 192-240, ManaSpentGainedAsWard 1.6-2 (A; the scale of SP 99 is D? in `ward-health-sustain.md`);
  - corrupted 973 and 999. A corrupted copy cannot become legendary (`uniques-sets-legendary.md`), so choose one path.

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
- A single T8 "Ward Per Second" affix (382; helmet, body, catalyst) gives 90-112 ward/s (A).
- The steady-state table (`ward-health-sustain.md` §3.2, D) gives about 345 ward at G = 50 and R = 1.

Verdict for the Build card: as a sustained ward source, Culnivar's Claim loses to one plain affix (**U**, inputs U). Its case rests on three things:
- the burst: a full `maxMana` of ward in one tick;
- the Lightning|Spell stat stick;
- the rule change, mana dumped to 0, which other effects can exploit (Phase C).

## Phase C: Divergent phase

**Step 9.** Q4 with mask 258 (fallback `abilities.json`, `(tags & 258) == 258`, player skills with a tree). Selected rows, with costs from `manaCost`:
- Lightning Blast `lb23il`, 3 mana (Mage)
- Static `st47ic`, 15 mana, cd 4 (Mage)
- Static Orb `so35a`, 38 mana (Sorcerer)
- Radiant Lance `ra1an`, 24 mana (Paladin)
- Glyph of Dominion `gy2dm`, 30 mana (Runemaster)
- Elemental Nova `en6`, 11 mana
- Disintegrate `dig5`, channelled, 18/s

Off-mask but relevant: Focus `vm53dx` (Spell|Buff, channelled, 0 cost) and Mana Strike `ms26` (Lightning|Melee, 0 cost, "restores 15 mana" on hit).

**Step 10.** Q6 and `skill_tree` scans found these rule-changers:
- `lb23il:28` Innate Conduit: "While out of mana, Lightning Blast has no cost, but cannot chain". It pairs directly with Culnivar's dump to 0. Whether "0" counts as "out" is **U**.
- `lb23il:14` Effluent Defense: ward per mana spent; its stat is display-only, property 54.
- `lb23il:22` Overcharge: "cannot double cast if it is channelled or cast by another skill". This is an anti-synergy for any triggered Lightning Blast.
- `vm53dx:28` Unbound Thought: Focus has no cooldown, but the burst no longer grants mana.
- `vm53dx:16` Overcharge: lets current mana exceed max. Culnivar converts `maxMana` and zeroes the excess, so the node is wasted; test it.
- `vm53dx:23` Energy Overflow: lightning waves each second, "Maximum Mana -> Lightning Damage 12%" per point, display-only. It reads max mana, which Culnivar never lowers.
- `ra1an:32` Cloudless Sky: no shield needed, "+1% damage per 25 max mana".

**Step 11.** The catalogue scan by tags `mana`, `ward` and `channel` found:
- "Mana-to-ward converters";
- "Max mana as defence and damage" (Radiant Lance "Cloudless Sky");
- "Endurance and mana-before-health never protect ward";
- "Ignivar's Head gives free Fire Aura casts while channelling", as a pattern for channel-trigger items;
- "\"Directly\" means triggered casts do not count".

Novelty pairing: Culnivar's Claim + Mana Guide + Focus. No catalogue entry names these together.

**Step 12. Stack partners.** Fallback for `find_mods({property: 18})`: a scan of `uniques.json` `mods[]` for property 18 plus the tooltip text. It found:
- Mana Guide uid 368 (amulet). ManaRegen +0.34-0.70, WardRegen +25-50 tagged Channelling (262144), WardDecayThreshold +50-115, LightningResistance +0.24-0.38. Tooltip: "While channelling Focus you cast Lightning Blast once per second", "Mana regeneration from Focus is half as effective", "You have 50% less armor while channeling Focus".
- Urzil's Pride uid 10 (body): "1% increased mana regeneration per 2% uncapped Lightning Resistance".
- Bluefeather Band uid 440 (ring): 3 zero-cost skills in a row give mana and ward, but ManaRegen MORE -0.54..-0.48. That is an anti-synergy with regen-as-ward.

Affixes:
- 330 Increased Mana Regen: T8 0.94-1.1 on ring, relic, belt, amulet.
- 1015 corrupted Attunement + Mana Regen.

Idols:
- 178 Idol Mage Ward Per Second: 12-40, Grand and Ornate.
- 328 Idol Mage Mana Spent Gained as Ward: 0.12-0.40.
- 893 enchantment idol, CDR + ManaRegen 0.08-0.10.

Blessings: all three relevant ones are in Ending the Storm, so only one can be taken:
- Bastion of Divinity, lightning resistance 0.25-0.40 (Grand 0.55-0.75);
- Light of the Moon, mana +30-50;
- Resonance of the Sea, ward/s 17-25.

**Step 13. Passives** (Q13; fallback `trees.json` + `tree_node_stats.json`, tree `mg-1`):
- `mg-1:8` Warden: +10% ward retention per point, 5 points.
- `mg-1:14` Wisdom: Sorcerer mana regen per mana.
- `mg-1:27` Mana Bulwark: mana before health. Anti-synergy, because mana sits near 0 after each dump.
- `mg-1:92` Inscribed Instruments: ward retention while using a sceptre (Runemaster).

**Step 14. Natural defense layers.**
- Mage: ward, plus Focus `vm53dx:13` Prismatic Stance for less elemental damage taken.
- Paladin: block, armour and health. Culnivar's ward bursts sit on top.
- Shaman: totems as distraction.
- Necromancer: minions as meat.

## Phase D: Scores

| # | Archetype | Core | Dmg | Def | Sus | Gear | Nov | Total |
|---|---|---|---|---|---|---|---|---|
| 1 | Focus conduit Mage ("turret") | Focus `vm53dx` (Unbound Thought) + Mana Guide auto-Lightning Blast + Energy Overflow; Urzil's Pride | 2 | 3 | 3 | 3 | 5 | 16 |
| 2 | Lightning Blast dump-cycler Sorcerer | `lb23il` with Innate Conduit `:28` after each dump; Effluent Defense `:14` | 4 | 3 | 2 | 5 | 4 | 18 |
| 3 | Sword-and-board Radiant Lance Paladin | `ra1an`, block-scaled; shield in the free off-hand | 4 | 4 | 3 | 4 | 3 | 18 |
| 4 | Runemaster lightning runes | `gy2dm`, Runic Invocation; mastery +30% elemental | 3 | 3 | 2 | 5 | 2 | 15 |
| 5 | Storm Totem Shaman, Culnivar as pure ward engine | `st38ml`; stat stick wasted (totems) | 3 | 3 | 3 | 4 | 4 | 17 |
| 6 | Necromancer, ward engine only | minions; stat stick wasted | 3 | 3 | 3 | 4 | 3 | 16 |
| 7 | Spellblade Mana Strike refill | `ms26` restores 15 mana; Lightning|Melee misses the Spell mask | 2 | 3 | 3 | 5 | 3 | 16 |

Gate: all candidates pass. Druid was excluded before scoring, because forms replace mana with Rage and so disable the effect (`abilities.json` descriptions; Culnivar alt text). The novelty pairing is #1. Converge on **#2**, with **#1** as an alternate. #3 ties on score, but its 24-mana casts keep mana from filling, so its enabler value is lowest.

## Phase E: Skeleton (#2, partial)

- **Class:** Mage / Sorcerer. Base bonuses: Mana +50, and PP464 "More Spell Damage per Mana Cost" +0.005 (`classes-and-masteries.md`).
- **Skills:**
  - Lightning Blast: main. Nodes `lb23il:28` Innate Conduit 1, `:14` Effluent Defense 2, `:15` Storm Razor 3, `:22` Overcharge 4 (works on direct casts only).
  - Focus: refill and ward. Nodes `vm53dx:7` Mana Flooded 4, `:26` Mind Shell 4, `:19` Everward 2.
  - Flame Ward (`fw3d`): burst of 400 ward (A), 25 mana, cd 15.
  - Teleport: mobility.
  - Static Orb (`so35a`): the 38-mana nuke cast right after a dump. Negative mana is allowed while mana > 0 (`ward-health-sustain.md` Summary 9).
- **Gear:**
  - Culnivar's Claim, with an LP target of 759 or 330-type mana affixes;
  - a catalyst off-hand;
  - Urzil's Pride as an optional body (uid 10);
  - Ward Per Second 382 at T6+ on the helmet;
  - Increased Mana Regen 330 at T6+ on the rings and relic.
- **Blessing:** Ending the Storm, Grand Bastion of Divinity, if Urzil's Pride is used.

Still to do, using the sibling skills:
- the damage path (**le-damage-reasoning**): 90% increased Lightning|Spell lands in the increased bucket, and the tree's display-only nodes are of unknown type;
- the defense plan (**le-defense-reasoning**): seven resistances, ward steady state, endurance only on health;
- passives in full, idols, leveling.

## Phase F: Honesty notes, and what to test first

1. Does a dump to exactly 0 mana count as "out of mana" for `lb23il:28`? Cast Lightning Blast right after the ward bar jumps and watch whether mana moves. If it does not count, #2 loses its loop and #3 or #1 takes over.
2. Is the ward burst equal to the character-sheet max mana? Compare the ward bar before and after the tick.
3. Does Focus Overcharge `vm53dx:16` waste mana? Watch mana exceed max, then drop to 0 at the dump.
4. Does Mana Guide's triggered Lightning Blast cost mana? (U) Watch mana during a Focus channel with no other casts.
5. Measure the cycle time. Expect `T = maxMana / net regen`; time it with a stopwatch on a dummy.

Assumptions:
- every regen input in Phase B (U);
- the SP 99 value scale (D?).

Anti-synergies already checked:
- Mana Bulwark (mg-1:27) and mana before health;
- Bluefeather Band;
- Druid Rage forms;
- "directly" on triggered Lightning Blast casts.

Data citations (ids): uid 33, 368, 10, 440; base 8:5; affixes 330, 382, 759, 973, 999, 178, 328, 893; nodes `lb23il:14/15/22/28`, `vm53dx:7/16/19/23/26/28`, `ra1an:32`, `mg-1:8/14/27/92`; blessings 72-75, 82-83; files `uniques.json`, `unique_effects.json`, `abilities.json`, `affixes.json`, `items.json`, `trees.json`, `tree_node_stats.json`, `blessings.json`.

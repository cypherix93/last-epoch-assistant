---
name: le-build-audit
description: Use when asked to review, audit, critique, rate or improve a complete Last Epoch build (class, mastery, passive tree, five skills with trees, gear affixes, idols, blessings) or a pasted planner export, and when asked what to fix first, where a build is weak, or whether its items and nodes work together.
---

# Auditing a Last Epoch build

## Overview

An audit turns a build description into a structured, sourced report: offense, defense, sustain, mana, mobility, bottlenecks, missing resistances, anti-synergies, and a ranked fix list. It orchestrates the other skills; it does not re-derive formulas.

Core principle: every claim is a table row or a knowledge page. Every number carries a label. Anything the data cannot model is listed under "not determined", never silently dropped.

**Never show internal ids in player-facing text; use the in-game name as the game UI shows it.** The ledger is resolved to ids (Step 1), but the report the player reads names everything as the game does: "Circle of Elements (Runemaster passive, 10 pts)", "Melting Nova (Elemental Nova node)", "Crest of Unity (unique helmet)", "Body armour: +174-210% Chance to Shock on Lightning Hit (T7)", never `mg-1:88`, `en6:27`, "uid 307" or "Body: 392 + 391". Ids appear only in the closing **Sources** section, each paired with its name. How to read the names: **le-data-query**, "Player-facing names" (queries A-D) and `.claude/skills/README.md`.

REQUIRED BACKGROUND: `le-data-query` (finding records), `le-damage-reasoning`, `le-defense-reasoning`, `le-mechanics-reference` (labels, constants). If the user wants a build designed around a dropped item, use `le-build-around-item` instead.

## Procedure

### Step 1: normalise the build into a ledger

Resolve every piece to ids before judging anything. Ask once for missing pieces (rolled values, tiers, point allocations); mark guesses **U**. Give every ledger row a status: **resolved** (id found), **substituted** (closest match used, say which), **invalid** (does not exist, or the class cannot use it).

| Piece | How to resolve | Record |
|---|---|---|
| Class / mastery | `SELECT class_id, name FROM classes`; `SELECT mastery_index, name, description, passive_bonus_labels FROM masteries WHERE class_id = 3` | class_id, mastery_index |
| Passives | `passive_tree({"class_id":1})` (a class name also works); user's allocations by node name | node ids, points |
| Skills (5) | `lookup({"name":...,"kinds":["ability"]})` (player abilities rank first), then `skill_tree({"ability_id":...})` | ability_id, ability_index, tags, node points |
| Items | unique by name (`lookup`), rares by affix names -> affix ids + tiers + rolls; then the class-lock check below | affix_id, tier, roll, base type, class lock |
| Idols / altar | idol affixes (`affixes.rolls_on = 1`, which does not encode the idol size: check the size with the idol recipe below), altar sub type | affix ids, idol base type, sub_type_id |
| Blessings | `v_blessings` by name; `lookup` returns both a subtype id `34:101` and a bare `101`; the mods rows use `mods.source_id = '34:<sub_type_id>'` | sub_type_id (one per timeline) |
| Level, attributes | user; check `abilities` attribute scaling | numbers |

Tool calls for the ledger (MCP names; otherwise `yarn mcp:call <tool> [args]`, with SQL and anything containing quotes, `<`, `>`, `%`, `&` or `|` passed as `@file` / `--query-file` or on stdin, see **le-data-query**; `find_mods` arguments are nested under `filters`):

```
lookup({"name":"Calamity","kinds":["unique"]})
get({"kind":"unique","id":0})
skill_tree({"ability_id":"fi9"})
passive_tree({"class_id":1})
get({"kind":"class","id":1})
knowledge({"page":"interactions/catalogue"})
```

Useful lookups:

```sql
SELECT class_id, mastery_index, name, passive_bonus_labels FROM masteries WHERE class_id = 3 ORDER BY mastery_index;
```

```sql
SELECT ability_id, name, ability_index, tag_names, mana_cost, use_duration, speed_scaler, has_skill_tree
FROM abilities
WHERE is_player_ability = 1 AND name IN ('Fireball', 'Teleport', 'Flame Ward', 'Meteor', 'Frost Claw');
```

```sql
SELECT m.property, coalesce(m.property_name, '?') AS stat, m.tag_names, m.modifier_type, m.value_min, m.value_max
FROM mods m WHERE m.source_kind = 'blessing' AND m.source_id = '34:101';
```

```sql
SELECT unique_id, name, set_name, mods_text, tooltip_text FROM v_unique_summary WHERE name IN ('Calamity');
```

**Class-lock check (every item).** Item bases carry `item_subtypes.class_requirement`, a bit mask `1 << class_id` (1 Primalist, 2 Mage, 4 Sentinel, 8 Acolyte, 16 Rogue; 0 or NULL = any class), with the name in `class_requirement_names`; a unique inherits its base's lock. A row fails when `class_requirement` is non-zero and `(class_requirement & (1 << build class_id)) = 0`; also compare both level requirements with the character level. Rares and exalted items by base name:

```sql
SELECT base_type_id, sub_type_id, name, level_requirement, class_requirement, class_requirement_names
FROM item_subtypes WHERE name IN ('Solarum Plate', 'Jewelled Circlet');
```

Uniques through their base:

```sql
SELECT u.unique_id, u.name, u.level_requirement, st.name AS base, st.level_requirement AS base_level,
       st.class_requirement, st.class_requirement_names
FROM uniques u
JOIN unique_subtypes us ON us.unique_id = u.unique_id
JOIN item_subtypes st ON st.base_type_id = us.base_type_id AND st.sub_type_id = us.sub_type_id
WHERE u.name IN ('Calamity', 'Bastion of Honour');
```

Class-locked affixes: `affixes.class_names` (for example the Weaver-only idol affixes). Does an affix roll on a given idol size (here: which Minion affixes roll on a Small Idol)?

```sql
SELECT a.affix_id, a.name, a.class_names, group_concat(bt.name, ', ') AS idol_sizes
FROM affixes a
JOIN affix_can_roll_on r ON r.affix_id = a.affix_id
JOIN item_base_types bt ON bt.base_type_id = r.base_type_id
WHERE a.rolls_on = 1 AND a.name LIKE '%Minion%' AND bt.name = 'Small Idol'
GROUP BY a.affix_id ORDER BY a.name;
```

(Idol base types 25-33: Small, Minor, Humble, Stout, Grand, Large, Ornate, Huge, Adorned Idol. A "Minion Damage" Small Idol does not exist in this data: no row is the answer.)

**Unresolved names.** Users often give names that do not exist or are misspelled ("Naga's Fang", "Falcon's Hood", a "Minion Damage" small idol). When `lookup` with `kinds` returns nothing: say so in the ledger (status **invalid** or **substituted**), offer the closest matches from `search({"query":"<fragment>*","kinds":["unique"]})` or a `LIKE '%fragment%'` query, clearly marked as substitutes, and audit the rest of the build. Never audit a guessed item as if it were the user's, and list every unresolved name under "Ledger problems".

**Partial audits.** Minimum inputs per section: Offense needs the main skill and its gear/tree damage lines; Defense needs health, resistances and the main layer (armour, dodge, block or ward); Sustain needs the recovery sources; Bottlenecks (Step 7) need a bucket table with rolls, so skip it without rolls. If fewer than the class, the five skills and the gear names are known, return the ledger plus an input request instead of a full audit. Missing tree allocations: list the tree's downside nodes (Step 9 query) and the few nodes whose tags match the build, and say the allocation was not audited. Every section that cannot be filled gets a "Needed to continue" list naming the exact missing inputs.

**Ledger checks from the judge review (run all five for every build; they caught real errors).**

1. **Idol sizes and idol values come from the data, never from a community build or memory.** Every idol line in the ledger prints the idol's grid size (WxH) and the applied scale factor: read both from `v_idol_affix_values` (`idol`, `idol_size`, `std_aem`, `item_aem`, `scale_factor`, `stored_min/max` = the data, `value_min/max` = the in-game range on that idol). The factor is `(1 + idol AEM) / (1 + affix standard AEM)`, applied to the stored tier range and rounded to the affix's grid ([item-system.md#affix-effectiveness-affixeffectmodifier-and-value-formula], [idols-and-blessings.md#idol-affix-value-scaling-d-formula-values-unverified-in-game-u]). The Minor Idol is **1x1** (not 2x1). `v_build_items_named.affixes_text` prints the scaled value with an `x<factor>` marker, but a number copied from a guide's text or from the tier table is unscaled, so copying it overstates or understates the idol (judge findings: a Grand Idol line authored at 0 standard AEM is x0.67, a line authored at -0.33 on a Grand Idol is x1.00 and on an Ornate Idol x1.49). The scaled ranges follow the decompiled formula and are unverified in game: label them **D?**, not **D**.

```sql
SELECT bt.base_type_id, bt.name, bt.size_x || 'x' || bt.size_y AS grid, bt.affix_effect_modifier AS idol_aem
FROM item_base_types bt
WHERE bt.base_type_id BETWEEN 25 AND 33
ORDER BY bt.base_type_id;
```

```sql
SELECT v.affix_id, v.affix_name, v.idol, v.idol_size AS grid_wxh, v.tier, v.std_aem, v.item_aem, v.scale_factor,
       v.stored_min || '-' || v.stored_max AS stored, v.value_min || '-' || v.value_max AS in_game
FROM v_idol_affix_values v
WHERE v.affix_id IN (119, 912, 897, 1054) AND v.ord = 0
  AND v.tier = (SELECT max(x.tier) FROM v_idol_affix_values x WHERE x.affix_id = v.affix_id AND x.base_type_id = v.base_type_id)
ORDER BY v.affix_id, v.base_type_id;
```

(Replace the affix list with the build's idol affixes and use the build's tier instead of the top tier. Count the grid cells the idols need against the layout; a 1x1 idol in a "2x1" slot leaves cells empty. An affix that does not roll on that idol size has no row: that is the "does not roll" ledger problem.)

2. **Acquisition: every unique with `can_drop_randomly` = 0 needs a source or a "farm unknown" flag.** Such uniques are outside the random drop pool. Read the source from `uniques.drop_source` (a summary of `unique_drop_sources`; `drop_source_count` counts the rows), or `get({"kind":"unique","id":365})` whose `obtain` line says it in one sentence and `drop_sources` has the chance, empowered-only flag and minimum corruption. A primordial or cocooned unique has a `drop_source` that is only a note (no drop table in the data): say so. Where `drop_source` is NULL and `can_drop_randomly` = 0 the source is not in data (4 uniques, e.g. Avarice 131): write "not in data: farm unknown (U)" in the ledger and in the build's gear plan, and do not list it as obtainable. [endgame-systems.md#uniques-that-do-not-drop-randomly] has the same table next to the knowledge-page sources.

```sql
SELECT unique_id, name, can_drop_randomly, drop_source, drop_source_count,
       CASE WHEN can_drop_randomly = 0 AND drop_source IS NULL THEN 'not in data: farm unknown (U)'
            WHEN can_drop_randomly = 0 THEN 'sourced (read drop_source)'
            ELSE 'random drop' END AS acquisition
FROM uniques WHERE unique_id IN (213, 434, 152, 180, 131) ORDER BY unique_id;
```

(Replace the id list with the build's uniques; rows with `can_drop_randomly` 0 are the ones that need a source. 156 of the 486 uniques in the database have the flag: 104 have a source row, 48 are primordial / cocooned notes, 4 have none.)

3. **Nearest-build check covers every guide, not only `is_specialized`.** `builds` with `any_skill` and the `is_specialized` flag miss leveling guides and profiles whose skill carries tree points but is not flagged. Query the skill rows and the allocated nodes directly and list every guide that has the skill with tree points, with its profile (the example finds a Spellblade leveling guide whose "Final Setup" profile has 14 Volcanic Orb tree points while `is_specialized` is 0):

```sql
SELECT b.slug, b.mastery_name, p.name AS profile, s.is_specialized, s.on_bar,
       (SELECT sum(n.points) FROM community_build_skill_nodes n
         WHERE n.build_profile_id = s.build_profile_id AND n.ability_id = s.ability_id) AS tree_points
FROM community_build_skills s
JOIN community_build_profiles p ON p.build_profile_id = s.build_profile_id
JOIN (SELECT DISTINCT build_id, slug, mastery_name FROM community_builds) b ON b.build_id = p.build_id
WHERE s.ability_id = 'vo54'
ORDER BY tree_points DESC, b.slug;
```

State the nearest build (any mastery, leveling guides included) and how the proposal differs. "No node allocated" must be checked here, not inferred from `is_specialized`: `community_build_skills.has_tree_points` (points > 0) and `node_count` carry the same fact without the subquery, and a row with `is_specialized = 0` and `has_tree_points = 1` is a planner leftover with no effect in game (the `builds` tool marks it `leftover_tree` in `ability_tabs`). A guide's `mastery_name` can differ from the mastery the guide is filed under (for example a Mage-level leveling guide), so also search by skill.

4. **"Riskiest assumption" is the link with the weakest label**, not the most interesting or the best-supported one. Rank the chain links by label (U first, then D?, then A/D/G) and name the lowest. Per-point tree values read from `skill_tree` (labelled A, linear per point, [damage-pipeline.md#5-increased-more-and-skill-trees]) are never the riskiest link; an engine-scope question (does a mastery bonus copy the weapon implicit; does a node doubling apply to ailment chance; does the trigger fire after a tag swap) is. Give the in-game test for that link first.

5. **Scratch-work isolation.** When several agents or runs share a scratch folder, each writes only under its own subfolder (`<scratch>/<agent-or-run-name>/`, including its own call log and SQL files) and never edits another's files or the shared root; a cited query must be re-runnable from the author's own subfolder.

### Step 2: offense summary

For the main skill (and one secondary): run `le-damage-reasoning` Steps 0-11 (Step 12 as well for a minion skill). Report:
- skill, tags, damage types, ADE, crit chance/multiplier, uses per second, hit damage, ailment DPS, DPS vs dummy and vs a level-100 monster (state both; level DR alone is x0.13);
- the **bucket table**: for each damage type the added/increased/more lines counted, each with its source by in-game name (item + slot, node + skill, passive + tree; ids go to Sources);
- scaling vector: which multipliers exist (added, generic increased, type increased, crit, speed, penetration, conditional, per-stack, area/projectiles) and which are missing (a build with no more-multiplier beyond tree nodes, no penetration against high-resistance content, no crit when the skill benefits from it);
- how much of the damage is ailment DoT vs hit, and whether the build's modifiers address that part (tag check).

Dead stats test: lines whose non-type tags are not a subset of the skill's mask do nothing for it. Replace `8388872` with the main skill's hit mask and the `VALUES` list with the build's sources:

```sql
SELECT m.source_kind, m.source_id, m.property_name, m.tag_names, m.value_min, m.value_max
FROM mods m
WHERE m.property = 0
  AND (m.tags & ~255 & ~8388872) <> 0
  AND (m.source_kind, m.source_id) IN (VALUES ('affix_tier', '63'), ('affix_tier', '77'), ('unique_mod', '0'))
ORDER BY m.source_kind, m.source_id;
```

(Melee, Bow, Throwing, Minion, DoT, Totem, LowLife lines on a Fire|Spell|Hit skill show up here. Minion lines on a non-minion build and melee lines on a spell build are the usual finds.)

Minion builds: the player skill mask is the wrong test. Summon abilities carry no damage tags (`abilities.tags = 0`, `tag_names` NULL for Summon Wolf `wo42` and Summon Scorpion `sc36pi`), so the mask query would flag every Minion-tagged line as dead. For minion lines check the transfer rule instead: a player line reaches the minion only if it has the Minion bit (8192), or the Totem bit for totems, or an `extra_tag` that equals the summon skill's `ability_index` ([minions.md#1-stat-transfer-summonentityondeathsummon]); then test the transferred tags against the minion's own abilities. Run the mask query only for the player's own damage skills.

### Step 3: defense summary

Run `le-defense-reasoning` Steps 1-6 at area level 100 (and the content the user cares about). Report resistances per type (shown and uncapped), armour/dodge/block percentages at that area level, endurance and threshold, health, ward steady state, hits to die against the 776-physical monolith melee reference and a labelled spell proxy, plus the weakest damage type.

### Step 4: sustain

Sources of recovery and their rates: health regen `(6 + 0.14 L + added)(1 + inc)`, leech (stat 0.3 = 3%, paid over 3 s; needs damage dealt; check it applies to the skill's tags), ward per second and on-hit ward (SP 92, 39, 99) vs steady state, on-hit/kill health (SP 38), potions (slots SP 49, heal per level), mana-before-health. Verdict: seconds to refill the pool, and whether sustain holds during the time the skill is not hitting (e.g. between channel casts). [ward-health-sustain.md#4-leech] **D**; [ward-health-sustain.md#31-decay] **G/A**.

Replace the `VALUES` list with the build's own sources; the ids below are only an example (affix 1058 Health Regen, 1010 Increased Health and Ward Per Second, 106 Health on Kill):

```sql
SELECT property, property_name, tag_names, special_tag, count(*) AS lines, max(value_max) AS best
FROM mods
WHERE property IN (17, 38, 39, 40, 51, 92, 99, 93, 48, 49)
  AND (source_kind, source_id) IN (VALUES ('affix_tier', '1058'), ('affix_tier', '1010'), ('affix_tier', '106'))  -- example ids: use the build's
GROUP BY property, special_tag ORDER BY property;
```

### Step 5: mana

Mana per second = `manaCost x (1 + inc cost)/(1 + manaEfficiency SP 69) x uses/s` (community formula **X/U**); channel cost per second for channelled skills. Compare with `manaRegen = (8 + added)(1+inc)` and `maxMana = RHE(50 + 0.50506 L + 2 Att ...)`. A skill can be cast while mana > 0 (mana goes negative); at <= 0 mana skills costing >= 1 are blocked and mana-before-health stops working. Check every one of the five skills, not just the main one. [ward-health-sustain.md#6-mana], [speed-cooldowns-mana.md#5-mana-costs]

```sql
SELECT a.name, a.mana_cost, a.channel_cost, a.minimum_mana_cost, a.use_duration, a.speed_multiplier, a.channelled
FROM abilities a WHERE a.is_player_ability = 1 AND a.name IN ('Fireball', 'Disintegrate', 'Meteor');
```

### Step 6: mobility

Movement speed (SP 9, base hidden +5% more), traversal skills and Evade (2 charges, 4 s cooldown reduced by +0.5% CDR per level), cooldowns of the build's movement skill (`get({"kind":"ability",...})` returns `cooldown_seconds`), anything that slows (Chill/Slow on enemies) or roots. Content check: does the build need to kite? Is there a traversal skill among the five, and can this class use it (`class_abilities`)?

```sql
SELECT ability_id, name, tag_names, is_traversal, counts_as_movement, max_charges, charges_gained_per_second
FROM abilities
WHERE is_player_ability = 1 AND (is_traversal = 1 OR counts_as_movement = 1) ORDER BY name;
```

[speed-cooldowns-mana.md#8-movement-speed], [speed-cooldowns-mana.md#3-cooldowns-and-charges]

### Step 7: bottlenecks and marginal value

Skip this step (and say so) when the user gave no rolls: without a bucket table the ratios are invented. Otherwise, for the main skill compute the marginal change from +10% of each pool (generic increased, type increased, a new more of 10%, +10% crit multiplier, +10% cast speed, +10 penetration, +1 skill level, +50 added damage). With a bucket table the ratios are immediate: a new multiplicative source is worth `1 + m`; an increased source is worth `m / (1 + sum_inc)` of the current total. Report the top three levers and any stat at a cap (crit chance 100%, resistance 75%, armour 85%, dodge 85%, endurance 60%, glancing 100%, parry 75%) or at a diminishing-returns zone (armour/dodge rating past ~5000). Name the bottleneck: damage, survivability, sustain, mana, or uptime.

### Step 8: missing resistances

From Step 3: list each type with `75 - shown`, expected shred from content, and the best craftable (T5) affix source on the user's open slots (T8 is the highest tier but Primordial only):

```sql
SELECT m.property, a.name, a.affix_type_name, m.tier, m.value_min, m.value_max
FROM affixes a
JOIN mods m ON m.source_kind = 'affix_tier' AND m.source_id = CAST(a.affix_id AS TEXT)
WHERE m.property IN (13, 14, 15, 26, 27, 28, 64, 30, 52, 106, 107) AND m.tier = 5
ORDER BY m.property, m.value_max DESC;
```

Remember Vitality gives +1% necrotic and poison resistance per point, class tree and idol altars add more; resistances use added values only. [defenses.md#2-resistances]

### Step 9: anti-synergies and traps

1. Tag the build (damage types, delivery, mechanics): for example `conversion`, `ward`, `minion`, `ailment`, `crit`, `defense`, `trigger`, `idol`.
2. Read the catalogue entries carrying those tags: `grep -n "Tags:.*ward" knowledge/interactions/catalogue.md` (or `knowledge({"page":"interactions/catalogue"})` then scan), then every entry tagged `anti-synergy` that overlaps: `knowledge/interactions/catalogue.md#11-anti-synergies-and-traps`. Also scan `#7-double-dipping-and-what-does-not-double-dip` and `#6-defensive-conversions-and-conditional-defenses`.
3. For each unique: look up `knowledge/interactions/unique-effects-index.md` (by name or uid), then the catalogue by uid.
4. Mechanical checks that catch most real problems:
   - Dead stats (Step 2 query): melee/minion/bow lines on the wrong build.
   - Typed added damage of a type the skill converted away from; "increased <old type>" after full conversion (`#1-damage-conversion-and-tag-inheritance`).
   - Minion stats: player increased damage does nothing for minions; only Minion-tagged or skill-bound lines transfer (`minions.md#1-stat-transfer-summonentityondeathsummon`).
   - Ailment scaling: Hit/Melee modifiers on a DoT build.
   - No-ward-gain uniques or low-life mechanics on a ward build; endurance/threshold interactions; unique idols duplicated (only one of each in S5); more than one Primordial item; damage-taken-as conversions above 100% total.
   - Skill-tree nodes that downside a stat the build scales (`is_downside = 1` rows in `mods`).
   - Set bonus pieces: `set_requirement <= pieces worn` (`sets` + `mods set_bonus`).
   - Triggered effects that say "directly" do not fire from triggers (`catalogue.md#2-triggers-procs-and-proc-frequency`).

```sql
SELECT n.tree_id, n.node_id, n.name, m.label, m.display
FROM mods m JOIN tree_nodes n ON m.source_id = n.tree_id || ':' || n.node_id
WHERE m.source_kind = 'skill_node' AND m.is_downside = 1 AND n.tree_id = 'fi9';
```

### Step 10: ranked improvement suggestions

Rank by (expected gain x confidence) / cost, in this order of urgency unless the data says otherwise:

1. Lethal gaps: uncapped resistances at area 75+, no sustain, endurance/health far below one-shot size, ward with no generation.
2. Dead or mismatched stats (free fixes: swap affix, change node).
3. Missing multiplier categories (a more source, penetration, crit multiplier for crit builds, speed past thresholds).
4. Capped or wasted stats (crit chance over 100%, armour past diminishing returns).
5. Mana/mobility fixes.
6. Upgrades (tier increases, crafting: `knowledge/reference/crafting.md#forging-potential-fp`, uniques that enable the build).

Each suggestion lists: change, where (slot, node or idol, by in-game name: "craft +116-140% Chance to Shock on Lightning Hit (T7) into the helmet's open prefix", "move 3 points into Melting Nova (Elemental Nova node)"), estimated effect with label and formula, trade-off, confidence. The data ids of a suggestion go in Sources. Do not present an estimate as a measured DPS.

## Output template

Everything above "Sources" is player-facing: in-game names only (skill nodes with their skill, passives with their class or mastery, uniques with their slot, affixes as stat lines with tier, idols with name and size, blessings with their timeline). "Sources" is the only section with ids, each next to its name.

```
# Build audit: <class>/<mastery>, level <L>, game <version>
Ledger (in-game names + status resolved/substituted/invalid): skills ... | items ... | idols ... | blessings ...
## Ledger problems (unresolved names and the substitutes offered, class or level locks, affixes that do not roll on that slot or idol size, idol size or value read from a guide instead of the data, uniques with `can_drop_randomly` 0 and their `drop_source` or "not in data: farm unknown"; idol lines without WxH and scale factor)
## Verdict (3 lines): strongest point / weakest point / first fix  (or "partial audit: <sections skipped>")
## Offense   skill, DPS vs dummy, DPS vs L100 monster, bucket table, scaling gaps, dead stats    [labels]
## Defense   resistances (shown/uncapped), armour/dodge/block %, endurance, pool, hits to die, freeze / stun answer (or "none")    [labels]
## Sustain   regen, leech, ward/s vs steady state, potions, time to refill
## Mana      cost/s per skill vs regen, max mana
## Mobility  speed, traversal, cooldowns
## Bottlenecks (ranked, marginal-value table)
## Missing resistances (type: gap, source slot)
## Anti-synergies and traps (catalogue entries by name, with confidence)
## Ranked suggestions (rank, change by in-game name, gain estimate + label, cost/trade-off)
## Not determined from data (special effects, 5000+ node properties, inputs assumed U)
## Riskiest assumption (the link with the weakest label, with its in-game test; never a per-point tree value) and nearest community build (any guide with the skill's tree points, leveling guides included)
## Needed to continue (exact missing inputs per skipped section)
## Sources (the only place for ids: in-game name | table + id, page#section)
```

## Common mistakes

| Mistake | Fix |
|---|---|
| Auditing the tooltip DPS | Rebuild from ids; tooltip ignores level DR, resistances, uptime |
| Judging only the main skill | Check mana and tags for all five |
| Listing uniques by description | Resolve ids; read tooltip text and mods rows |
| Calling a gap "minor" without a number | Quote the multiplier (for example x1.75 vs x1.00 at area 75+) |
| Mixing labels | Keep D/A/G/X/U on each figure; inputs assumed by you are U |
| Suggesting items without checking class and level requirement | `item_subtypes.class_requirement_names`, `level_requirement`; affix `class_names` |
| Writing `mg-1:88`, `en6:27`, "uid 307", "Body: 392 + 391", `SP`/`PP`/`AP` codes or tag masks in the report | The game UI shows no ids. Write "Circle of Elements (Runemaster passive)", "Melting Nova (Elemental Nova node)", "Crest of Unity (unique helmet)", the affix's stat line with tier; ids only in Sources, next to the name |

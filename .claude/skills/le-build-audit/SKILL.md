---
name: le-build-audit
description: Use when asked to review, audit, critique, rate or improve a complete Last Epoch build (class, mastery, passive tree, five skills with trees, gear affixes, idols, blessings) or a pasted planner export, and when asked what to fix first, where a build is weak, or whether its items and nodes work together.
---

# Auditing a Last Epoch build

## Overview

An audit turns a build description into a structured, sourced report: offense, defense, sustain, mana, mobility, bottlenecks, missing resistances, anti-synergies, and a ranked fix list. It orchestrates the other skills; it does not re-derive formulas.

Core principle: every claim is a table row or a knowledge page. Every number carries a label. Anything the data cannot model is listed under "not determined", never silently dropped.

REQUIRED BACKGROUND: `le-data-query` (finding records), `le-damage-reasoning`, `le-defense-reasoning`, `le-mechanics-reference` (labels, constants). If the user wants a build designed around a dropped item, use `le-build-around-item` instead.

## Procedure

### Step 1: normalise the build into a ledger

Resolve every piece to ids before judging anything. Ask once for missing pieces (rolled values, tiers, point allocations); mark guesses **U**.

| Piece | How to resolve | Record |
|---|---|---|
| Class / mastery | `SELECT class_id, name FROM classes`; `SELECT mastery_index, name, description, passive_bonus_labels FROM masteries WHERE class_id = 3` | class_id, mastery_index |
| Passives | `passive_tree({"class_id":1})` (a class name also works); user's allocations by node name | node ids, points |
| Skills (5) | `lookup({"name":...,"kinds":["ability"]})` (player abilities rank first), then `skill_tree({"ability_id":...})` | ability_id, ability_index, tags, node points |
| Items | unique by name (`lookup`), rares by affix names -> affix ids + tiers + rolls | affix_id, tier, roll, base type |
| Idols / altar | idol affixes (`affixes.rolls_on = 1`), altar sub type | affix ids, sub_type_id |
| Blessings | `v_blessings` by name | sub_type_id (one per timeline) |
| Level, attributes | user; check `abilities` attribute scaling | numbers |

Tool calls for the ledger (MCP names; otherwise `yarn mcp:call <tool> '<json>'` in Bash; JSON containing `<`, `>`, `%`, `&` or `|` goes on stdin, see **le-data-query**; `find_mods` arguments are nested under `filters`):

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

Stop and fix the ledger if a name does not resolve; do not audit a guessed item.

### Step 2: offense summary

For the main skill (and one secondary): run `le-damage-reasoning` Steps 1-11. Report:
- skill, tags, damage types, ADE, crit chance/multiplier, uses per second, hit damage, ailment DPS, DPS vs dummy and vs a level-100 monster (state both; level DR alone is x0.13);
- the **bucket table**: for each damage type the added/increased/more lines counted, with source ids;
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

### Step 3: defense summary

Run `le-defense-reasoning` Steps 1-6 at area level 100 (and the content the user cares about). Report resistances per type (shown and uncapped), armour/dodge/block percentages at that area level, endurance and threshold, health, ward steady state, hits to die against the 776-physical monolith melee reference and a labelled spell proxy, plus the weakest damage type.

### Step 4: sustain

Sources of recovery and their rates: health regen `(6 + 0.14 L + added)(1 + inc)`, leech (stat 0.3 = 3%, paid over 3 s; needs damage dealt; check it applies to the skill's tags), ward per second and on-hit ward (SP 92, 39, 99) vs steady state, on-hit/kill health (SP 38), potions (slots SP 49, heal per level), mana-before-health. Verdict: seconds to refill the pool, and whether sustain holds during the time the skill is not hitting (e.g. between channel casts). [ward-health-sustain.md#4-leech] **D**; [ward-health-sustain.md#31-decay] **G/A**.

```sql
SELECT property, property_name, tag_names, special_tag, count(*) AS lines, max(value_max) AS best
FROM mods
WHERE property IN (17, 38, 39, 40, 51, 92, 99, 93, 48, 49) AND (source_kind, source_id) IN (VALUES ('affix_tier', '1058'), ('affix_tier', '1010'), ('affix_tier', '106'))
GROUP BY property, special_tag ORDER BY property;
```

### Step 5: mana

Mana per second = `manaCost x (1 + inc cost)/(1 + manaEfficiency SP 69) x uses/s` (community formula **X/U**); channel cost per second for channelled skills. Compare with `manaRegen = (8 + added)(1+inc)` and `maxMana = RHE(50 + 0.50506 L + 2 Att ...)`. A skill can be cast while mana > 0 (mana goes negative); at <= 0 mana skills costing >= 1 are blocked and mana-before-health stops working. Check every one of the five skills, not just the main one. [ward-health-sustain.md#6-mana], [speed-cooldowns-mana.md#5-mana-costs]

```sql
SELECT a.name, a.mana_cost, a.channel_cost, a.minimum_mana_cost, a.use_duration, a.speed_multiplier, a.channelled
FROM abilities a WHERE a.is_player_ability = 1 AND a.name IN ('Fireball', 'Disintegrate', 'Meteor');
```

### Step 6: mobility

Movement speed (SP 9, base hidden +5% more), traversal skills and Evade (2 charges, 4 s cooldown reduced by +0.5% CDR per level), cooldowns of the build's movement skill, anything that slows (Chill/Slow on enemies) or roots. Content check: does the build need to kite? Is there a traversal skill among the five?

```sql
SELECT ability_id, name, tag_names, is_traversal, counts_as_movement, max_charges, charges_gained_per_second
FROM abilities
WHERE is_player_ability = 1 AND (is_traversal = 1 OR counts_as_movement = 1) ORDER BY name;
```

[speed-cooldowns-mana.md#8-movement-speed], [speed-cooldowns-mana.md#3-cooldowns-and-charges]

### Step 7: bottlenecks and marginal value

For the main skill compute the marginal change from +10% of each pool (generic increased, type increased, a new more of 10%, +10% crit multiplier, +10% cast speed, +10 penetration, +1 skill level, +50 added damage). With a bucket table the ratios are immediate: a new multiplicative source is worth `1 + m`; an increased source is worth `m / (1 + sum_inc)` of the current total. Report the top three levers and any stat at a cap (crit chance 100%, resistance 75%, armour 85%, dodge 85%, endurance 60%, glancing 100%, parry 75%) or at a diminishing-returns zone (armour/dodge rating past ~5000). Name the bottleneck: damage, survivability, sustain, mana, or uptime.

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

Each suggestion lists: change, where (slot/node/idol), data id, estimated effect with label and formula, trade-off, confidence. Do not present an estimate as a measured DPS.

## Output template

```
# Build audit: <class>/<mastery>, level <L>, game <version>
Ledger (ids): skills ... | items ... | idols ... | blessings ...
## Verdict (3 lines): strongest point / weakest point / first fix
## Offense   skill, DPS vs dummy, DPS vs L100 monster, bucket table, scaling gaps, dead stats    [labels]
## Defense   resistances (shown/uncapped), armour/dodge/block %, endurance, pool, hits to die    [labels]
## Sustain   regen, leech, ward/s vs steady state, potions, time to refill
## Mana      cost/s per skill vs regen, max mana
## Mobility  speed, traversal, cooldowns
## Bottlenecks (ranked, marginal-value table)
## Missing resistances (type: gap, source slot)
## Anti-synergies and traps (catalogue entries by name, with confidence)
## Ranked suggestions (rank, change, gain estimate + label, cost/trade-off, ids)
## Not determined from data (special effects, 5000+ node properties, inputs assumed U)
## Sources (table+id, page#section)
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

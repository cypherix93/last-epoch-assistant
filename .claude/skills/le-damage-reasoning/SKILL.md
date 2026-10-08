---
name: le-damage-reasoning
description: Use when estimating, comparing or sanity-checking damage or DPS of a Last Epoch skill for a build or an item swap - base damage and added damage effectiveness, increased vs more buckets, tag matching, crit, penetration vs enemy resistance, conversion, ailment DoT, hits versus a dummy or a monolith monster.
---

# Estimating skill damage from game data

## Overview

Damage is computed **per damage type**, then summed. The knowledge base gives the formulas (`knowledge/mechanics/damage-pipeline.md`); the database gives the inputs (ability components, mods, ailments). This skill is the procedure that joins them, and the places where you must stop and say "cannot be determined from data".

Core principle: build a table of buckets (type x {base, added, increased, more}), show every modifier you counted with its source id, and label the result with an enemy context ("vs dummy" or "vs level-N monster"). Prerequisites: `le-data-query` (finding records), `le-mechanics-reference` (labels and pages).

## Procedure

### Step 0: fix the scope

Write down before computing: skill (ability id), character level, attributes, equipped items with tiers/rolls, passive and skill-tree allocations, enemy (dummy, level-N monster, boss, area level, corruption). Missing inputs become explicit assumptions labelled **U**.

Tool shorthand for the whole procedure (MCP names; without MCP use `yarn mcp:call <tool> '<json>'` from the repo root):

```
lookup({"name":"Fireball","kinds":["ability"]})                       -> ability_id fi9
get({"kind":"ability","id":"fi9"})                                    -> tags, speed fields, parsed raw_json
skill_tree({"ability_id":"fi9"})                                      -> every node with stats and requirements
find_mods({"filters":{"property":0,"modifier_type":2,"source_kinds":["skill_node"]},"limit":100})
find_mods({"filters":{"property_name":"Penetration","tags_any":["Fire"]},"limit":50})
sql({"query":"SELECT ... FROM ability_components WHERE ability_id = 'fi9'"})
knowledge({"page":"mechanics/damage-pipeline"})                       -> the formulas
```

### Step 1: the skill record

```sql
SELECT ability_id, name, ability_index, tags, tag_names, mana_cost, use_duration, use_delay,
       speed_scaler, speed_multiplier, max_charges, charges_gained_per_second, channelled, instant_cast
FROM abilities WHERE name = 'Fireball' AND is_player_ability = 1;
```

`speed_scaler`: 2 AttackSpeed, 3 CastSpeed, 54 none. `tags` is the AT mask of the skill (Fireball 264 = Fire|Spell).

### Step 2: base damage, ADE, crit, hit/DoT flag

```sql
SELECT ord, component_type,
       json_extract(raw_json, '$.baseDamageStats.damage')             AS base_by_type,
       json_extract(raw_json, '$.baseDamageStats.addedDamageScaling') AS ade,
       json_extract(raw_json, '$.baseDamageStats.critChance')         AS crit_chance,
       json_extract(raw_json, '$.baseDamageStats.critMultiplier')     AS crit_mult,
       json_extract(raw_json, '$.baseDamageStats.critType')           AS crit_type,
       json_extract(raw_json, '$.baseDamageStats.hit')                AS is_hit,
       json_extract(raw_json, '$.damageTags')                         AS damage_tags
FROM ability_components
WHERE ability_id = 'fi9' AND component_type LIKE '%Damage%'
ORDER BY ord;
```

- `base_by_type` order: Physical, Fire, Cold, Lightning, Necrotic, Void, Poison (7 slots). `ade` is `addedDamageScaling` (1.25 = 125%). Fireball: Fire 25, ADE 1.25, crit 5% x2.0.
- Each damaging component is its own pipeline run (a multi-component skill = sum of components). `hit = false` means DoT: no crit, no Hit tag.
- Melee skills show ~2 base damage; the weapon supplies the rest as **added** damage, multiplied by ADE. Weapon damage is never base damage. [damage-pipeline.md#1-where-the-numbers-live-data-fields] **A/G**
- Ailments the skill applies: `component_type = 'ChanceToApplyAilmentsOnHit'`, field `$.ailments[]` (`ailment` = AilmentID, `chance` e.g. 0.4).

```sql
SELECT ord, json_extract(raw_json, '$.ailments') AS ailments
FROM ability_components WHERE ability_id = 'fi9' AND component_type = 'ChanceToApplyAilmentsOnHit';
```

- Attribute and level scaling the skill brings with it (mods rows, usually +4% increased damage per attribute point):

```sql
SELECT source_kind, context, property, property_name, tag_names, modifier_type, value_min, value_max
FROM mods
WHERE source_kind IN ('ability_attribute_scaling', 'ability_level_scaling') AND source_id = 'fi9'
ORDER BY source_kind, source_ord, sub_ord;
```

### Step 3: the source tag mask

`src = skill tags` with `Hit` for hit components or `DoT` for DoT components (hits drop DoT, DoT drops Hit); health-state tags (FullLife / HighLife / LowLife) are added when the condition holds. Fireball hit: Fire(8) + Spell(256) + Hit(8388608) = **8388872**. After conversions, recompute the mask (tags removed and added). [damage-pipeline.md#4-tag-matching] **D**

### Step 4: collect applicable modifiers with tag matching

A damage modifier (SP 0) applies when **all its non-damage-type tags are in `src`**. Damage-type bits (Physical..Elemental = 1..128, sum 255) decide *which bucket* it scales, not whether it applies. Untyped (`tags & 255 = 0`) scales all seven buckets; Elemental scales Fire, Cold and Lightning; a type bit scales that bucket only.

List the candidate pool for a set of sources (the build's items/nodes; here two affixes at tier 3 and one unique):

```sql
SELECT m.source_kind, m.source_id, m.tier, m.property_name, m.tag_names,
       CASE m.modifier_type WHEN 0 THEN 'added' WHEN 1 THEN 'increased' WHEN 2 THEN 'more' END AS kind,
       m.value_min, m.value_max,
       CASE WHEN (m.tags & 255) = 0 THEN 'all buckets'
            WHEN (m.tags & 128) <> 0 THEN 'elemental (F/C/L)'
            ELSE 'typed bucket' END AS addressed_to
FROM mods m
WHERE m.property = 0
  AND (m.tags & ~255 & ~8388872) = 0
  AND (m.source_kind, m.source_id) IN (VALUES ('affix_tier', '0'), ('affix_tier', '1'), ('unique_mod', '0'))
  AND (m.tier IS NULL OR m.tier = 3)
ORDER BY m.modifier_type, m.source_kind, m.source_id;
```

Replace the `VALUES` list with the build's real sources (resolve names to ids with `le-data-query`). The mask `8388872` is the Fireball hit mask from Step 3. Add the other damage-like properties by changing `m.property`: 41 AdaptiveSpellDamage (flat spell damage), 59 Penetration, 4 CriticalChance, 5 CriticalMultiplier, 117 GlobalConditionalDamage (needs `special_tag`), 115 DamagePerStackOfAilment.

Pool checklist (all contribute SP 0 lines): weapon and gear affixes, implicits, unique mods, set bonuses (only for the pieces worn: `set_requirement <= pieces`), idol affixes, blessings (`source_kind = 'blessing'`), class passive nodes (`passive_node`), mastery bonus, the skill's own tree nodes (`skill_node`), attribute stats (`attribute`), buffs (`ailment_buff` x stacks).

Pitfalls while collecting:
- Minion-tagged mods are excluded automatically (Minion is not in `src`); do not add them for player skills.
- `extra_tag <> 0` binds a line to one ability index; keep it only if it equals the skill's `ability_index`, drop it otherwise.
- `special_tag` narrows a line (ailment id, hit event, conditional); 0 is the wildcard.
- Untyped added damage ("+5 Melee Damage") takes the skill's base type(s), split by base share; typed added damage adds to its own bucket even if the skill has no base of that type. [damage-pipeline.md#3-added-damage] **D**

### Step 5: skill-tree nodes

Node stat lines usually have `modifier_type` NULL (display only). Get them with:

```sql
SELECT node_id, name, max_points, stats_text, description
FROM v_skill_node_summary
WHERE tree_kind = 'skill' AND tree_name = 'Fireball' AND (stats_text LIKE '%amage%' OR description LIKE '%amage%')
ORDER BY node_id;
```

Rules: damage in skill trees is almost always **more** (429 more, 79 added, 38 increased among damage stats), multiplied per node and scaled linearly by allocated points; speed and crit nodes are *increased*; "doubled when condition" and "non-X damage" nodes are special. The tooltip wording cannot tell you; classify as "more (assumed, **D** 429:38 prior)" and flag it. Nodes that add flat damage are still multiplied by ADE. [damage-pipeline.md#5-increased-more-and-skill-trees] **D**, [damage-pipeline.md#3-added-damage] **X**

Skill-local properties (5000+, `property_name` NULL) and mutator effects (projectile counts, "chance to ..."): read their text, model what the text says, and mark anything not expressible as undetermined (see the last section).

### Step 6: the bucket formula

For each type t (Physical, Fire, Cold, Lightning, Necrotic, Void, Poison):

```
dmg_t  = base_t + ADE x added_t + ADE x flat_untyped x base_t / sum(base)
inc_t  = sum of increased lines addressed to t         (generic + type + Elemental(F/C/L) + tag lines)
more_t = product of (1 + m) over more lines addressed to t   (each separately, never summed)
hit_t  = max(0, dmg_t x (1 + inc_t) x more_t)
```

Attribute-derived increased damage (for example 40 Int x 4%) is part of `inc_t`. Check: official example added 10, increased 1.45, mores 5%/30%/10% -> 21.77. [damage-pipeline.md#2-the-pipeline] **G/D**

### Step 7: crit

```
cc = min(1, (critChance + sum added CritChance) x (1 + sum inc) x product more)
cm = (critMultiplier + sum added CritMultiplier) x (1 + sum inc) x product more      (default 2.0; +100% -> 3.0)
E_crit = 1 + cc x (cm - 1)            DoT: E_crit = 1 ; critType 1: no crit
```

Crit multiplier on items is *added* to the 2.0 base. [damage-pipeline.md#7-critical-strikes] **D/G**

### Step 8: the enemy

Per type, multiply:
1. conditional damage lines (SP 117 / 115) for conditions that hold (ignited, chilled, boss, ...);
2. resistance factor `resMult = (res > 0.75 ? 0.25 : 1 - res) + pen` where `res` is the enemy's resistance after shred (no floor below 0) and `pen` is your Penetration (SP 59) of that type (typed, Elemental, or all). Most monsters have 0% resistance by default; mods, monolith modifiers and champions add it. Shred is applied before the 75% cap, penetration after it, and shred is weaker vs bosses (-2% per stack instead of -5%);
3. enemy damage-taken modifiers (SP 6 on the enemy: increased damage taken, curses like Withering);
4. monster level damage reduction `(1 - DR)`: 87% at level 100 (x0.13), 75% at level 75, 54% at level 50, boss `DR + 0.05(1 - DR)`; 0 for a training dummy. [damage-pipeline.md#9-monster-level-damage-reduction] **D/A**
5. enemy armour for hits (negative armour = bonus), using the armour formula of [defenses.md#armour] **D/X**.

"Penetration by area level" applies to *enemies hitting you* (their 1%/area level), not to your penetration of them; do not mix the two.

Shred and debuff values live in `ailments` buffs:

```sql
SELECT source_id, source_name, property_name, tag_names, modifier_name, value_min
FROM v_mods_named
WHERE source_kind = 'ailment_buff' AND source_id IN ('42', '5', '17')
ORDER BY source_id, source_ord;
```

(42 FireResShred, 5 Shock, 17 Marked for Death; `ailments.max_instances` and the boss penalty are on [ailments.md#43-non-damaging-debuffs] **A**.)

### Step 9: conversion

Base conversion moves *base damage and untyped added damage* before modifiers; typed added damage ("+5 Melee Fire") is not converted; tags change with the conversion (full conversion swaps the old type tag for the new one, partial conversions often keep both). Re-derive `src` and the pool after converting; "increased <old type>" stops applying at 100%. Ailments are untouched unless a node says "ailment chance from all sources". [damage-pipeline.md#10-conversion] **G/D**, interactions: [catalogue.md#1-damage-conversion-and-tag-inheritance]. Percentages that are only "gained as" or tag-adds can double-dip: check the catalogue first.

### Step 10: ailment damage over time

```
chance_A       = prefab chance + sum added AilmentChance (special_tag = AilmentID)
stack dmg      = baseDamage_t x (1 + inc_t) x more_t     (ADE 0 for Ignite/Bleed/Poison: no added damage)
inc_t uses: generic + type + DoT + Ailment-effect/duration lines + skill-tree and attribute modifiers
inc_t excludes: Hit, Melee, Throwing, Bow (and Spell unless the ailment itself is a Spell ailment)
steady-state stacks = lambda x duration ; DPS = lambda x stack dmg   (lambda = applications per second)
```

Base values come from `ailments` (`dmg_fire`, `duration`, `max_instances`):

```sql
SELECT ailment_id, name, duration, max_instances, damage_types, dmg_physical, dmg_fire, dmg_cold, dmg_lightning, dmg_poison, tag_names
FROM ailments WHERE name IN ('Ignite', 'Bleed', 'Poison', 'Electrify', 'Frostbite');
```

Ailments cannot crit, ignore armour/dodge/block, face resistance, penetration of their type and level DR. More duration raises damage per stack, not DPS per stack. [ailments.md#2-damage-of-a-stack] **G/D**, [ailments.md#3-stacking-steady-state-refresh] **D**

### Step 11: rate

`uses/s = S x speedMultiplier x 1.1 / useDuration` with `S = (1 + sum increased speed + tree increased speed) x product more` for the skill's scaler; melee (and bow with a bow) additionally multiply by the weapon attack rate; cap by cooldown `1/cooldown` when the skill has one. `DPS = avg hit x uses/s x hits per use x projectiles hitting`. [speed-cooldowns-mana.md#2-use-rate] **D**, [speed-cooldowns-mana.md#3-cooldowns-and-charges] **D**. Channelled, combo and minion skills: read their sections first.

### Step 12: minions

Player stats help minions only through the Minion/Totem tag transfer; minion damage runs the same pipeline on the minion's own stats and abilities (base stats, attack timings in [minions.md]). Do not apply Step 4's player pool to a minion. [minions.md#1-stat-transfer-summonentityondeathsummon] **D**

## Worked example: Fireball vs level-100 monster

Inputs from the data (queries above): Fire 25, ADE 1.25, crit 5%/x2.0, ignite chance 0.4, `use_duration 0.75`, CastSpeed, Ignite Fire 40 over 2.5 s. Illustrative build inputs (all **U**): 40 Int (+160% increased from attribute scaling), +20 spell fire (typed), +12 spell damage (untyped), +8 spell cold (typed), increased 80% fire / 50% spell / 30% elemental / 40% cold, tree 35% more and 20% more fire, +4% crit chance with 150% increased, +100% crit multiplier, 40% + 10% cast speed, 20% fire penetration, 3 fire shred stacks, level-100 monster (DR 0.87).

```
fire dmg  = 25 + 1.25 x (20 + 12 x 25/25) = 65 ; cold dmg = 1.25 x 8 = 10
inc_fire  = 1.60 + 0.80 + 0.50 + 0.30 = 3.20 -> x4.20 ; inc_cold = 1.60 + 0.50 + 0.30 + 0.40 = 2.80 -> x3.80
more      = 1.35 x 1.20 = 1.62 (fire) ; 1.35 (cold)
fire hit  = 65 x 4.2 x 1.62 = 442.26 ; cold hit = 10 x 3.8 x 1.35 = 51.30
cc = (0.05 + 0.04) x 2.5 = 0.225 ; cm = 2.0 + 1.0 = 3.0 ; E_crit = 1 + 0.225 x 2 = 1.45
uses/s    = (1 + 0.5) x 1.0 x 1.1 / 0.75 = 2.20
vs dummy  : fire x1.20 pen -> 530.71 ; sum 582.01 ; x1.45 = 843.9 ; DPS 1856.6
vs L100   : fire res -15% (3 shred) -> resMult 1.15 + 0.20 = 1.35 ; x0.13 DR
            fire 77.62 + cold 6.67 = 84.29 ; x1.45 = 122.2 ; DPS 268.9 (hits only)
ignite    : 16/s x 4.2 x 1.62 = 108.86 per stack ; 5.5 stacks -> 598.7 ; vs L100 x0.1755 = 105.1
total     : 268.9 + 105.1 = 374.0 vs level-100 normal monster (inputs U, formulas D)
```

Source: [damage-pipeline.md#worked-example], [ailments.md#worked-example]. Report both numbers (dummy and monster) and state that the monster figure is 7.7x lower purely from level DR.

## Report template

```
Skill: <name> (<ability_id>)  src mask: <value> (<tags>)  enemy: <dummy | level N, area A, corruption C>
Buckets: type | base | ADE x added | increased (sum, list) | more (list) | hit
Crit: cc, cm, E_crit      Rate: uses/s, source of speed
Enemy: res, shred, pen, DT, level DR, armour
Hit DPS: ...   Ailment DPS: ...   Total: ...   (labels: formulas D/G, inputs A from ids, assumptions U)
Not modelled / undetermined: <list>
Sources: <table + id for every modifier>, <page#section for every formula>
```

## When to say "cannot be determined from data"

- Skill-tree mutator effects with 5000+ skill-local property ids or node text that implies code behaviour (extra projectiles, "chance to cast", transform effects): the data holds text and a magnitude, not the effect type or formula.
- SP 98 PlayerProperty and SP 58 AbilityProperty lines of uniques/nodes whose effect model is not in `knowledge/interactions/unique-effects-index.md`.
- Hidden per-skill multipliers, damage variance order, enemy crit avoidance, exact rounding of intermediate values (listed under Open questions of the damage and defense pages).
- Whether a tree node's "increased damage" is increased or more when no source states it: give both bounds.
- Anything the in-game tooltip shows that the engine rules above cannot reproduce: ask for a character-sheet number to calibrate (dummy DPS ignores level DR, resistances and uptime).

Say it plainly: "Cannot be determined from the data: <what>. Bounds: <low>-<high>. To resolve: <test on training dummy / read node X in game>."

## Common mistakes

| Mistake | Fix |
|---|---|
| Summing mores | multiply each |
| Applying "increased fire" to the whole hit | only the fire bucket |
| Weapon damage as base damage | it is added damage, times ADE |
| Counting Melee/Hit increased on ignite | ailments are not melee or hit |
| Applying penetration before the cap or shred after it | shred first, cap, then penetration |
| Reporting dummy DPS as monolith DPS | multiply by (1 - DR) and resistances |
| Reading skill-tree "increased" text as increased | classify as more unless data says otherwise, and flag |
| Using Minion-tagged mods on the player | tag subset rule excludes them |

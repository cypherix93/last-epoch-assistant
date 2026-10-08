---
name: le-defense-reasoning
description: Use when assessing Last Epoch survivability of a build or item swap - resistances and the 75 percent cap, enemy penetration by area level, armour, dodge, block, glancing, parry, endurance, ward decay and sustain, effective health against a level-100 monolith hit or a boss hit, one-shots, or "why do I die" questions.
---

# Assessing survivability from game data

## Overview

Survivability = (1) how much raw damage actually lands after per-type layers, (2) how many hits the pool absorbs, (3) how fast the pool refills. Formulas are in `knowledge/mechanics/defenses.md` and `knowledge/mechanics/ward-health-sustain.md`; the database supplies the stats. Prerequisites: `le-data-query`, `le-mechanics-reference`.

Core principle: compute **per incoming damage type**, at the **area level the build will play at** (endgame monolith = area level 100 for empowered), and report the weakest type, not the average. Label every number (see `le-mechanics-reference`).

## Procedure

### Step 0: context

Fix: character level, area level `a` (empowered monolith 100; normal timelines 62-90, +1 per 5 or 10 corruption, max 100), corruption `c`, attacker (normal, rare, boss, DoT), main incoming damage types. Without them, report at area 100 and say so.

### Step 1: collect defensive stats

Tool shorthand (MCP names; otherwise `yarn mcp:call <tool> '<json>'`):

```
find_mods({"filters":{"property_name":"Armour","source_kinds":["affix_tier"]},"limit":50})
find_mods({"filters":{"property":30,"min_value":0.1},"limit":50})          # AllResistances sources
passive_tree({"class_id":2})                                               # Sentinel passive nodes and stats
get({"kind":"class","id":2})                                               # base endurance, regen, stun avoidance
knowledge({"page":"mechanics/defenses"})
```

Defensive and resource stats take **untagged** mods only (`tags = 0`, `extra_tag = 0`, `special_tag = 0`); tagged lines (for example Minion-tagged health) do not count for the player. Property ids:

| Layer | SP ids |
|---|---|
| Resistances | 13 Fire, 14 Cold, 15 Lightning, 26 Void, 27 Necrotic, 28 Poison, 64 Physical, 30 All, 52 Elemental, 106 Phys+Void, 107 Necrotic+Poison |
| Armour / dodge / block | 10 Armour, 11 DodgeRating, 29 BlockChance, 53 BlockEffectiveness |
| Other avoidance | 62 GlancingBlowChance, 121 ParryChance, 89 CritAvoidance, 114 ReducedBonusDamageTakenFromCrits, 12 StunAvoidance |
| Endurance | 75 Endurance, 76 EnduranceThreshold, 96 MaximumHealthGainedAsEnduranceThreshold |
| Pools | 7 Health, 8 Mana, 17 HealthRegen, 18 ManaRegen, 16 WardRetention, 119 WardDecayThreshold, 92 WardRegen, 39 WardGain, 51 HealthLeech, 24 ManaBeforeHealthPercent, 94 ManaBeforeWardPercent |
| Taken modifiers | 6 DamageTaken, 31-37 DamageTakenAs(Phys, Fire, Cold, Lightning, Necrotic, Void, Poison), 108 DamageTakenBuff, 113 WhileMoving, 118 ArmourMitigationAppliesToDamageOverTime |
| Negative (shred) | 72, 78-83 NegativeResistance per type, 84 NegativeElemental, 77 NegativeArmour |

Class base values and attributes:

```sql
SELECT name, base_health, health_per_level, health_regen, health_regen_per_level, base_mana,
       base_endurance, base_endurance_threshold, endurance_threshold_per_health, base_stun_avoidance,
       more_minion_damage_per_level
FROM classes ORDER BY class_id;
```

```sql
SELECT source_id, property, property_name, tag_names, modifier_name, value_min, context
FROM v_mods_named WHERE source_kind = 'attribute' ORDER BY source_id, source_ord;
```

(Vitality: +6 health, +1% necrotic and poison resistance per point; Strength +4% armour; Dexterity +4 dodge rating; Intelligence +2% ward retention; Attunement mana.) [ward-health-sustain.md#1-health], [defenses.md#2-resistances] **A/G**

Defensive lines from the build's items (replace the `VALUES` list with the resolved sources, see `le-data-query`):

```sql
SELECT m.source_kind, m.source_id, m.tier, m.property, m.property_name, m.tag_names, m.modifier_type, m.value_min, m.value_max
FROM mods m
WHERE m.property IN (13, 14, 15, 26, 27, 28, 64, 30, 52, 106, 107, 10, 11, 29, 53, 62, 121, 89, 75, 76, 96, 7, 17, 16, 119, 92, 6, 24)
  AND (m.source_kind, m.source_id) IN (VALUES ('affix_tier', '0'), ('unique_mod', '0'), ('implicit', '0:1'))
ORDER BY m.property, m.source_kind;
```

What defensive affixes can roll on a slot (planning and "what am I missing"):

```sql
SELECT m.property, coalesce(m.property_name, sp.name) AS stat, count(DISTINCT a.affix_id) AS affixes,
       min(m.value_min) AS t8_low, max(m.value_max) AS t1_high
FROM affixes a
JOIN affix_can_roll_on r ON r.affix_id = a.affix_id
JOIN item_base_types bt ON bt.base_type_id = r.base_type_id AND bt.name = 'Body Armor'
JOIN mods m ON m.source_kind = 'affix_tier' AND m.source_id = CAST(a.affix_id AS TEXT)
LEFT JOIN stat_properties sp ON sp.property = m.property
WHERE m.property IN (13, 14, 15, 26, 27, 28, 64, 30, 52, 106, 107, 10, 11, 29, 53, 62, 75, 7, 17, 16)
GROUP BY m.property ORDER BY m.property;
```

(Check the exact base type name with `SELECT base_type_id, name FROM item_base_types`; the slot name here is an example.)

Passive-tree and skill-tree defensive nodes are display-only text; read `stats_text`:

```sql
SELECT mastery, name, max_points, stats_text
FROM v_skill_node_summary
WHERE tree_kind = 'class' AND tree_name = 'Sentinel'
  AND (stats_text LIKE '%rmour%' OR stats_text LIKE '%esist%' OR stats_text LIKE '%ndurance%' OR stats_text LIKE '%Ward%')
ORDER BY mastery, mastery_requirement, node_id;
```

Conversions and "damage taken as" lines (SP 31-37) and endurance/ward uniques:

```sql
SELECT source_kind, source_name, property, property_name, tag_names, modifier_name, value_min, value_max
FROM v_mods_named
WHERE (property BETWEEN 31 AND 37) OR property IN (75, 76, 96, 24, 94, 119, 92)
ORDER BY property, source_kind LIMIT 100;
```

Percentage values are fractions (0.75 = 75%). Rolled values depend on the user's item rolls; ranges from the table are not the item's actual stats.

### Step 2: resistances

```
res_t = base + All(30) + group (Elemental 52 / Phys+Void 106 / Necrotic+Poison 107) + type stat (13,14,15,26,27,28,64) + Vitality
shown = min(75%, res_t)        uncapped value is kept for shred protection
enemy penetration vs you = min(1% x area level, 75%), applied after the cap
damage multiplier = 1 - shown + enemy_pen + attack_pen
```

| Area level | Pen | 75% res gives | 0% res gives |
|---|---|---|---|
| 20 | 20% | x0.45 | x1.20 |
| 50 | 50% | x0.75 | x1.50 |
| 75 and up | 75% | **x1.00** | x1.75 |

At area 75+ going 0% to 75% is worth 1.75 -> 1.00 (-43%), and 74% to 75% is worth about 1%. Uncapped resistance above 75% only absorbs shred (Shock -2% per stack on players, resistance shred -2%) and Marked for Death. Resistances apply to hits and DoT. [defenses.md#2-resistances] **G/D**

Flag: any type below 75 (or below 75 after expected shred) is a gap; below 0 means extra damage.

### Step 3: armour, dodge, block (hits only)

With `L = a + 5` (area level):

```
armourDR  = min(0.85, 0.30*1.2x/(80+0.05L^2+1.2x) + 0.55*0.0015x^2/(180L+0.0015x^2))   physical
            non-physical: x0.7 (max 59.5%) ; negative armour = extra damage ; hits only (not DoT unless SP 118)
dodge     = min(0.85, 0.25*x/(80+0.05L^2+x) + 0.60*0.001x^2/(32L+0.001x^2))              x = dodge rating, hits only
blockDR   = min(0.85, 0.25*3x/(40+0.03L^2+3x) + 0.60*(1.2x+0.0006x^2)/(60L+1.2x+0.0006x^2))   on a successful block
```

| At area 100 | 1000 | 3000 | 5000 | 8000 |
|---|---|---|---|---|
| armour DR (physical) | 23.7% | 48.4% | 63.7% | 74.1% |
| dodge (rating) | 29.1% | 64.3% | - | - |
| block DR (effectiveness) | 35.6% | 59.3% | - | - |

Full tables: [defenses.md#armour] **D**, [defenses.md#4-dodge], [defenses.md#5-block]. The guide's "10 x area level = 50% dodge" is wrong. Tables use *area* level, not character level.

### Step 4: layer order of one hit (do not reorder)

1. damage-taken-as conversion (SP 31-37) of the incoming damage;
2. per type: resistance factor `1 - min(res, 0.75) + min(0.01 L_area, 0.75) + pen` x DamageTaken (SP 6; "less damage taken" are mores and multiply) x (1 - armourDR) [hits] x (1 + SP 108);
3. avoidance (hits only): dodge -> parry -> glancing (x0.65) -> block (x(1 - blockDR)); crit: `cc_eff = (cc + ChanceToBeCrit) x (1 - critAvoidance)`, crit multiplier reduced by SP 114;
4. pool: delayed share -> mana before ward -> ward -> mana before health (1 mana per 5 damage) -> endurance on the part below the threshold -> health.

Order only matters at caps and at the endurance threshold; all other layers multiply. Players also have a hidden 15% less DoT taken. [defenses.md#1-order-of-layers-for-one-incoming-hit] **D**, [defenses.md#8-damage-taken-modifiers-and-their-order] **D**

Average avoidance factor: `(1-dodge)(1-parry)(1-0.35 glance)(1-block x blockDR)(1 + cc_eff (cm_eff - 1))`.

### Step 5: pool and recovery

```
maxHealth = RHE((100 + 10 L + 6 Vit + added) x (1 + inc) x more)      endurance: e = min(0.60, base 0.20 + added)
threshold T = 20% of max health (+ added/more); damage below T takes (1 - e)
pool_post = (H - T) + T/(1 - e)            ward W adds to the front of the pool (endurance never applies to ward)
ward decay/s = (5e-5 d^2 + 0.2 d) / (1 + 0.5 R), d = max(0, W - T_ward), R = retention as a fraction
steady ward  = T_ward + (-0.2 + sqrt(0.04 + 2e-4 G (1 + 0.5R))) / 1e-4        G = ward gained per second
leech/s = landed damage per second x leech fraction (HealthLeech stat 0.3 = 3%) ; regen = (6 + 0.14 L + added)(1+inc)
```

Ward has no maximum and always decays: a ward build must show **ward per second** (SP 92 WardRegen, on-hit WardGain SP 39 with `special_tag` event, mana-spent-as-ward SP 99) and retention. Sustain red flag: ward or leech sources listed but generation per second << pool/10. [ward-health-sustain.md#31-decay], [ward-health-sustain.md#32-steady-state], [ward-health-sustain.md#4-leech] **G/D**

Ward uniques/passives are special effects (SP 98): check `knowledge/interactions/catalogue.md#4-ward-generation-engines-and-ward-anti-synergies` for no-ward-gain traps.

### Step 6: EHP against reference hits

Raw hit sizes come from [enemies-and-corruption.md#monster-damage-reference-monster_damagejson] (level-100 basis, trimmed mean: melee 87.58, spell 129.62, ranged 42.39; DoT 151/s):

```
raw = sample x 1.2264 (level 100 ActorScaler x 1.06) x rarity (rare 1.9) x (1 + 0.01 f(c)) x monolith mods
f(c) = 0.6c (c <= 100), else 0.002 c^1.52 + 1.055 c - 47.693        (c=300: f=280.5, x3.805)
post = raw x resMult x DT x (1 - armourDR) x ...          hits to die = pool_post / post
maxRawHit = pool_post / (resMult x DT x (1 - armourDR) x other) ;   avg EHP = maxRawHit / avoidance_factor
```

Reference cases (state them explicitly):
- **Level-100 monolith rare melee hit, corruption 300**: 87.58 x 1.2264 x 1.9 x 3.805 = 776 physical. [defenses.md#worked-example] **D?** (the sample is the 10% trimmed mean of normal monsters; individual monsters differ).
- **Boss hit**: the sources have **no boss damage table**; boss abilities are per boss (`abilities`, `monster_mod`). Use the spell-category sample as a proxy only if labelled **U**: 129.62 x 1.2264 x (1 + 0.01 f(300)) = 605 (no rare multiplier). Better: ask the user for the observed hit or read the boss ability (`get ability`).
- **DoT**: 151/s average at the same basis; corruption scales DoT at half rate (x(1 + 0.005 f)); resistances, endurance, the 15% hidden reduction apply; armour and dodge do not. [enemies-and-corruption.md#corruption-and-the-monolith]

Worked example (inputs **U**: health 2500, threshold 500, endurance 40%, armour 5000, physical res 50%, 10% less damage taken, dodge rating 1000, crit avoidance 100%):

```
resMult  = 1 - 0.50 + 0.75 = 1.25 ; armourDR(5000, a=100) = 0.637 -> x0.363 ; DT 0.90
post     = 776 x 1.25 x 0.363 x 0.90 = 316.8 per landed hit
pool     = (2500 - 500) + 500/(1 - 0.40) = 2833 ; hits to die = 8.9 (dies on the 9th, no recovery)
maxRawHit = 2833 / (1.25 x 0.363 x 0.90) = 6941 ; dodge(1000) = 29.1% -> avg EHP = 9788 raw
boss spell proxy (605 fire, res 75% -> resMult 1.00, non-phys armour 44.6%): 605 x 1.00 x 0.554 x 0.90 = 301.6 -> 9.4 hits
```

Sources: [defenses.md#worked-example], proxy arithmetic from [enemies-and-corruption.md#monster-damage-reference-monster_damagejson]. Provide both a with-recovery and a no-recovery figure only if sustain numbers were derived.

### Step 7: threats the pool does not cover

Stun (`stun avoidance 250 + 5 x level` on players; stuns also come from Shock stacks: +8% chance per stack vs players), freeze, ailments on you (Chill/Slow 50% effect, Shock/shred/Poison 60% less), crit multiplier x2 for monster hits, damage over time under 10 seconds of ward decay, delayed damage. [ailments.md#7-ailments-on-the-player], [defenses.md#6-glancing-blow-parry-crit-avoidance]. Monolith monster mods that add resistances, penetration, crit, glancing:

```sql
SELECT source_id, source_name, property_name, tag_names, modifier_name, value_min, value_max
FROM v_mods_named
WHERE source_kind = 'monster_mod' AND property IN (30, 59, 4, 62, 75, 6)
ORDER BY property, source_id LIMIT 60;
```

## Red flags

- Any resistance below 75% (or below 75% minus expected shred) at area 75+; negative resistance anywhere.
- Relying on armour, dodge or block against DoT (none apply to DoT); a build whose threats are mostly DoT needs resistances, endurance and sustain.
- Endurance threshold left at 20% base with no source of endurance or no health pool to use it; endurance counted on ward.
- Ward build with no ward-per-second source, retention below 100% and large pool targets; ward above threshold decaying faster than generation (use the steady-state formula).
- No sustain: no leech, regen of ~20/s, no ward generation, and potions only.
- Single layer dependency: all mitigation from one stat (armour only or dodge only) with `pool_post / post < 5` hits.
- No crit avoidance or crit-damage reduction (SP 89, SP 114) while the content has monsters with the Crit Chance monolith mod; no `DamageTaken` reduction anywhere.
- Mana-before-health without mana regen/efficiency (inactive at <= 0 mana) or with ward expected to be protected (it is not).
- Over-cap resistance believed to reduce enemy penetration (it does not).
- Using character level instead of area level in armour/dodge/block tables.

## Report template

```
Context: area <a>, corruption <c>, attacker <type>
Resistances: F/C/L/Phys/Void/Necro/Poison = ... (shown, uncapped), gaps: ...
Mitigation: armour <x> -> <DR>%, dodge <x> -> <p>%, block ..., glance ..., endurance ...%/threshold ...
Pool: health ..., ward steady-state ..., mana-before-health ... ; pool_post ...
Reference hits: <hit> raw -> post ; hits to die ; EHP (avg) ; labels
Sustain: regen, leech, ward/s, potions
Red flags: ranked
Not determinable: <special effects, boss ability numbers>
Sources: table+id per stat, page#section per formula
```

## Common mistakes

| Mistake | Fix |
|---|---|
| "75% resistance = 75% less damage" | at area 75+ it is x1.00 vs x1.75 uncapped-at-0 |
| Armour from character level | `L = area level + 5` |
| Applying dodge/armour to DoT | resistances, endurance, taken-modifiers only (plus SP 118) |
| Summing endurance with damage reduction | separate multiplier on the below-threshold part |
| Counting ward under endurance or mana-before-health protecting ward | neither applies to ward |
| Using Maxroll "10 HP per Vitality" or "4% ward retention per Int" | data: 6 HP, 2% |
| Taking a 776 sample hit as every monolith hit | it is a trimmed-mean sample (**D?**); say so |

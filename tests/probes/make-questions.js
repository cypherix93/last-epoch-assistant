#!/usr/bin/env node
/*
 * Builds questions.json: 30 Last Epoch probe questions whose ground truth is computed by SQL
 * against data/le.sqlite (read-only).  Re-runnable:
 *   node tests/probes/make-questions.js            -> (re)generate questions.json
 *   node tests/probes/make-questions.js --verify   -> re-execute every ground_truth_sql in questions.json, compare
 *                                                     with the recorded evidence AND recompute expected.answer;
 *                                                     check knowledge quotes (root script: yarn probes:verify).
 * Paths (ES module; the repo's package.json sets "type": "module"):
 *   repo root  = LE_WORKTREE, else ../.. relative to this script (better-sqlite3 and knowledge/ come from there)
 *   database   = LE_DB (or LE_DB_PATH, as for the MCP server), else <repo root>/data/le.sqlite (read-only)
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WT = path.resolve(process.env.LE_WORKTREE || path.join(__dirname, '..', '..'));
const DB_PATH = path.resolve(process.env.LE_DB || process.env.LE_DB_PATH || path.join(WT, 'data', 'le.sqlite'));
const require = createRequire(path.join(WT, 'package.json'));
const Database = require('better-sqlite3');
if (!fs.existsSync(DB_PATH)) {
  console.error(`database not found: ${DB_PATH} (run \`yarn db:build\` first, or set LE_DB)`);
  process.exit(1);
}
const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
const OUT = path.join(__dirname, 'questions.json');

const trimRow = (r) => { const o = {}; for (const k in r) o[k] = (typeof r[k] === 'string' && r[k].length > 300) ? r[k].slice(0, 300) + '...' : r[k]; return o; };
const run = (sql) => db.prepare(sql).all();
const evid = (rows) => rows.slice(0, 25).map(trimRow);
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const assert = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); };
const sorted = (a) => [...a].sort((x, y) => String(x).localeCompare(String(y)));
const pct = (v) => Math.round(v * 10000) / 100; // fraction -> percent number

const Q = [];
const add = (q) => Q.push(q);

// ------------------------------- NAME LOOKUPS ------------------------------------------------
add({ id: 'Q01', category: 'name_lookup',
  question: 'What base type is the unique item "Ravenous Void"?',
  tables: ['uniques', 'item_base_types', 'item_subtypes'],
  uniq: [["SELECT COUNT(*) n FROM uniques WHERE name='Ravenous Void'", 1, 'unique name']],
  sql: `SELECT u.unique_id, u.name, bt.name AS base_type, st.name AS sub_type
FROM uniques u
JOIN item_base_types bt ON bt.base_type_id = u.base_type_id
JOIN item_subtypes st ON st.base_type_id = u.base_type_id AND st.sub_type_id = u.sub_type_id
WHERE u.name = 'Ravenous Void'`,
  compute: (r) => { assert(r.length === 1, 'Q01 rows'); return { answer: r[0].base_type, tolerance: 'exact (case-insensitive)' }; },
  hints: 'Answer is the base type "Gloves". The specific subtype "Gluttonous Gloves" is an acceptable extra; "Gluttonous Gloves" alone is PARTIAL (it is the sub type, not the base type). "Glove" accepted.' });

add({ id: 'Q02', category: 'name_lookup',
  question: 'What does the unique "Ravenous Void" do? List its stat mods with their roll ranges (ignore flavour/tooltip text).',
  tables: ['uniques', 'mods'],
  uniq: [["SELECT COUNT(*) n FROM uniques WHERE name='Ravenous Void'", 1, 'unique name']],
  sql: `SELECT m.source_ord, m.property_name, m.tag_names, m.modifier_type, m.value_min, m.value_max, m.hidden
FROM mods m JOIN uniques u ON m.source_id = CAST(u.unique_id AS TEXT)
WHERE m.source_kind = 'unique_mod' AND u.name = 'Ravenous Void' AND m.hidden = 0
ORDER BY m.source_ord`,
  compute: (r) => {
    assert(r.length === 3, 'Q02 rows');
    assert(r[0].property_name === 'Endurance Threshold' && r[0].value_min === 60 && r[0].value_max === 100, 'Q02 r0');
    assert(r[1].property_name === 'Damage Taken as Void' && r[1].tag_names === 'Physical', 'Q02 r1');
    assert(r[2].property_name === 'Damage Taken' && r[2].tag_names === 'Void' && r[2].modifier_type === 2, 'Q02 r2');
    return { answer: [
      `Endurance Threshold: +${r[0].value_min} to +${r[0].value_max}`,
      `Physical Damage Taken as Void: ${pct(r[1].value_min)}% to ${pct(r[1].value_max)}%`,
      `More Void Damage Taken (multiplicative): ${pct(r[2].value_min)}% to ${pct(r[2].value_max)}% (i.e. ${-pct(r[2].value_max)}% to ${-pct(r[2].value_min)}% less void damage taken)`
    ], tolerance: 'set-equality (judge matches each line by stat + min/max; DB stores percents as fractions, 0.1 = 10%)' };
  },
  hints: 'Three visible mods (a hidden text mod about a Void Barrier stack exists). The third mod may be phrased "10-15% less Void damage taken". Void Barrier / Mimic Feast tooltip mechanics are optional bonus.' });

add({ id: 'Q03', category: 'name_lookup',
  question: 'Which item set does the unique "Isadora\'s Revenge" belong to, and what are the set bonuses (pieces required and effect)?',
  tables: ['uniques', 'sets', 'set_tooltips'],
  uniq: [["SELECT COUNT(*) n FROM uniques WHERE name='Isadora''s Revenge'", 1, 'unique name']],
  sql: `SELECT u.name AS item, s.name AS set_name, st.set_requirement, st.text
FROM uniques u
JOIN sets s ON s.set_id = u.set_id
JOIN set_tooltips st ON st.set_id = s.set_id
WHERE u.name = 'Isadora''s Revenge'
ORDER BY st.set_requirement`,
  compute: (r) => { assert(r.length === 2, 'Q03 rows'); return { answer: { set: r[0].set_name, bonuses: r.map(x => `${x.set_requirement} pieces: ${x.text}`) }, tolerance: 'multi-field: set exact; bonuses set-equality' }; },
  hints: "Set is \"Isadora's\" (3 items). 2 pieces: +100% chance to apply Damned on hit with Necrotic Spells; 3 pieces: +30% Mana Efficiency with Necrotic Spells. A hidden third set mod (increased ailment effect 30% at 3 pieces) exists in the mods table but not the tooltip; mentioning it is fine." });

add({ id: 'Q04', category: 'name_lookup',
  question: 'Which affix is called "Minion Damage", is it a prefix or suffix, and on which equipment base types can it roll?',
  tables: ['affixes', 'affix_can_roll_on', 'item_base_types'],
  uniq: [["SELECT COUNT(*) n FROM affixes WHERE name='Minion Damage'", 1, 'affix name']],
  sql: `SELECT a.affix_id, a.name, a.affix_type_name, bt.name AS base_type
FROM affixes a
JOIN affix_can_roll_on r ON r.affix_id = a.affix_id
JOIN item_base_types bt ON bt.base_type_id = r.base_type_id
WHERE a.name = 'Minion Damage'
ORDER BY bt.name`,
  compute: (r) => { assert(r.length === 7, 'Q04 rows'); return { answer: { type: r[0].affix_type_name, base_types: sorted(r.map(x => x.base_type)) }, tolerance: 'multi-field: type exact; base_types set-equality' }; },
  hints: 'Prefix. Base types: Amulet, Belt, Gloves, Off-Hand Catalyst, Quiver, Relic, Ring. Missing 1 item = partial; extra items = wrong.' });

// ------------------------------- ABILITIES ---------------------------------------------------
add({ id: 'Q05', category: 'abilities',
  question: 'For the player skill Fireball (the Mage skill): what is its mana cost, its base fire damage, and its added damage effectiveness?',
  tables: ['abilities', 'ability_components'],
  uniq: [["SELECT COUNT(*) n FROM abilities WHERE name='Fireball' AND is_player_ability=1", 1, 'player ability name']],
  sql: `SELECT a.ability_id, a.name, a.mana_cost,
  json_extract(c.raw_json,'$.baseDamageStats.damage') AS damage_array,
  json_extract(c.raw_json,'$.baseDamageStats.addedDamageScaling') AS added_damage_scaling
FROM abilities a
JOIN ability_components c ON c.ability_id = a.ability_id AND c.component_type = 'DamageEnemyOnHit'
WHERE a.ability_id = 'fi9'
ORDER BY c.ord`,
  compute: (r) => { assert(r.length === 1, 'Q05 rows'); const d = JSON.parse(r[0].damage_array); assert(d[1] === 25 && d[0] === 0, 'Q05 dmg');
    return { answer: { mana_cost: r[0].mana_cost, base_fire_damage: d[1], added_damage_effectiveness: r[0].added_damage_scaling }, tolerance: 'multi-field: each numeric within +/-1% (effectiveness 1.25 == 125%)' }; },
  hints: 'Mana 3, base damage 25 fire (damage array [phys,fire,cold,lightning,necrotic,void,poison] = [0,25,0,0,0,0,0]), added damage effectiveness 125% (1.25). Non-player duplicates named Fireball (minion/monster versions) exist; ground truth is the player skill id fi9.' });

add({ id: 'Q06', category: 'abilities',
  question: 'What is the base damage of the player skill Elemental Nova, per damage type, and its added damage effectiveness?',
  tables: ['abilities', 'ability_components'],
  uniq: [["SELECT COUNT(*) n FROM abilities WHERE name='Elemental Nova' AND is_player_ability=1", 1, 'player ability name']],
  sql: `SELECT a.ability_id, a.name,
  json_extract(c.raw_json,'$.baseDamageStats.damage') AS damage_array,
  json_extract(c.raw_json,'$.baseDamageStats.addedDamageScaling') AS added_damage_scaling
FROM abilities a
JOIN ability_components c ON c.ability_id = a.ability_id AND c.component_type = 'DamageEnemyOnHit'
WHERE a.is_player_ability = 1 AND a.name = 'Elemental Nova'
ORDER BY c.ord`,
  compute: (r) => { assert(r.length === 1, 'Q06 rows'); const d = JSON.parse(r[0].damage_array); assert(eq(d, [0, 8, 8, 8, 0, 0, 0]), 'Q06 arr');
    return { answer: { fire: d[1], cold: d[2], lightning: d[3], physical: d[0], added_damage_effectiveness: r[0].added_damage_scaling }, tolerance: 'multi-field: each numeric within +/-1%' }; },
  hints: '8 fire + 8 cold + 8 lightning (array [0,8,8,8,0,0,0]); added damage effectiveness 120% (1.2). Other types 0 or omitted.' });

add({ id: 'Q07', category: 'abilities',
  question: 'How many charges does the player skill Black Hole have and what is its cooldown (time to regain a charge) in seconds?',
  tables: ['abilities'],
  uniq: [["SELECT COUNT(*) n FROM abilities WHERE name='Black Hole'", 1, 'ability name']],
  sql: `SELECT ability_id, name, max_charges, charges_gained_per_second, ROUND(1.0/charges_gained_per_second, 2) AS recharge_seconds
FROM abilities WHERE name = 'Black Hole'`,
  compute: (r) => { assert(r.length === 1 && r[0].max_charges === 1, 'Q07 rows'); return { answer: { max_charges: r[0].max_charges, cooldown_seconds: r[0].recharge_seconds }, tolerance: 'multi-field: max_charges exact; cooldown numeric +/-1% (14.0 s)' }; },
  hints: 'maxCharges 1, chargesGainedPerSecond 0.07143 => cooldown = 1/0.07143 ~= 14.0 seconds. Rate form ("0.0714 charges/s") also acceptable.' });

add({ id: 'Q08', category: 'abilities',
  question: 'Which ailment does the player skill Venom Strike apply on hit, and with what chance?',
  tables: ['abilities', 'ability_components', 'ailments'],
  uniq: [["SELECT COUNT(*) n FROM abilities WHERE name='Venom Strike' AND is_player_ability=1", 1, 'player ability name']],
  sql: `SELECT a.name AS ability, al.name AS ailment, json_extract(j.value,'$.chance') AS chance
FROM abilities a
JOIN ability_components c ON c.ability_id = a.ability_id AND c.component_type = 'ChanceToApplyAilmentsOnHit'
JOIN json_each(c.raw_json, '$.ailments') j
JOIN ailments al ON al.ailment_id = json_extract(j.value,'$.ailment')
WHERE a.is_player_ability = 1 AND a.name = 'Venom Strike'`,
  compute: (r) => { assert(r.length === 1, 'Q08 rows'); return { answer: { ailment: r[0].ailment, chance_percent: pct(r[0].chance) }, tolerance: 'multi-field: ailment exact (ci); chance numeric +/-1%' }; },
  hints: 'Poison, 100% chance (stored 1.0). "Always poisons / guaranteed" accepted.' });

// ------------------------------- TREES -------------------------------------------------------
add({ id: 'Q09', category: 'trees',
  question: 'In the Fireball skill tree, which node gives "+30% Ignite Chance", and how many points can be put into it at most?',
  tables: ['trees', 'tree_nodes', 'mods'],
  uniq: [["SELECT COUNT(*) n FROM trees WHERE tree_kind='skill' AND name='Fireball'", 1, 'skill tree name']],
  sql: `SELECT n.node_id, n.name, n.max_points, m.label, m.display
FROM trees t
JOIN tree_nodes n ON n.tree_id = t.tree_id
JOIN mods m ON m.source_kind = 'skill_node' AND m.source_id = n.tree_id || ':' || n.node_id
WHERE t.tree_kind = 'skill' AND t.name = 'Fireball' AND m.label = 'Ignite Chance'`,
  compute: (r) => { assert(r.length === 1, 'Q09 rows'); return { answer: { node: r[0].name, max_points: r[0].max_points }, tolerance: 'multi-field: node exact (ci); max_points exact' }; },
  hints: 'Node "Conflagration" (node id 13), max 5 points.' });

add({ id: 'Q10', category: 'trees',
  question: 'In the Fireball skill tree, what are the prerequisites of the node "Orb of Destruction" (which nodes and how many points in each)?',
  tables: ['trees', 'tree_nodes', 'tree_node_requirements'],
  uniq: [["SELECT COUNT(*) n FROM tree_nodes WHERE tree_id='fi9' AND name='Orb of Destruction'", 1, 'node name in tree']],
  sql: `SELECT n.name AS node, rn.name AS required_node, r.required_node_id, r.required_points
FROM tree_nodes n
JOIN tree_node_requirements r ON r.tree_id = n.tree_id AND r.node_id = n.node_id
JOIN tree_nodes rn ON rn.tree_id = r.tree_id AND rn.node_id = r.required_node_id
WHERE n.tree_id = 'fi9' AND n.name = 'Orb of Destruction'
ORDER BY r.ord`,
  compute: (r) => { assert(r.length === 2, 'Q10 rows'); return { answer: r.map(x => `${x.required_node}: ${x.required_points} points`), tolerance: 'set-equality' }; },
  hints: '"Piercing Heat: 2 points" and "Winged Fire: 2 points". Node ids 2 and 6 acceptable in place of names. The data does not state AND/OR semantics; do not penalise either reading.' });

add({ id: 'Q11', category: 'trees',
  question: 'How many nodes does the Rogue class passive tree have?',
  tables: ['trees', 'tree_nodes'],
  uniq: [["SELECT COUNT(*) n FROM trees WHERE tree_kind='class' AND name='Rogue'", 1, 'class tree name']],
  sql: `SELECT t.tree_id, t.name, t.node_count, (SELECT COUNT(*) FROM tree_nodes n WHERE n.tree_id = t.tree_id) AS counted_nodes,
  (SELECT COUNT(*) FROM tree_nodes n WHERE n.tree_id = t.tree_id AND n.max_points = 0) AS zero_point_root_nodes
FROM trees t WHERE t.tree_kind = 'class' AND t.name = 'Rogue'`,
  compute: (r) => { assert(r.length === 1 && r[0].node_count === r[0].counted_nodes, 'Q11 rows'); return { answer: r[0].node_count, tolerance: 'exact' }; },
  hints: '103 nodes (trees.node_count == COUNT(tree_nodes); no zero-point root node is present in this tree). Any other number is wrong.' });

add({ id: 'Q12', category: 'trees',
  question: 'List the Weaver tree nodes whose description mentions "Boss".',
  tables: ['trees', 'tree_nodes'],
  uniq: [],
  sql: `SELECT n.node_id, n.name, n.max_points
FROM tree_nodes n JOIN trees t ON t.tree_id = n.tree_id
WHERE t.tree_kind = 'weaver' AND n.description LIKE '%Boss%'
ORDER BY n.node_id`,
  compute: (r) => { assert(r.length >= 1 && r.length <= 15, 'Q12 rows'); return { answer: sorted(r.map(x => x.name)), tolerance: 'set-equality' }; },
  hints: 'Matching is a case-insensitive substring of the node DESCRIPTION. Node ids acceptable in place of names. Nodes that only mention it in the name would be extras (check evidence).' });

// ------------------------------- AILMENTS ----------------------------------------------------
add({ id: 'Q13', category: 'ailments',
  question: 'What is the duration of the Ignite ailment and its base damage (type and amount)?',
  tables: ['ailments'],
  uniq: [["SELECT COUNT(*) n FROM ailments WHERE name='Ignite'", 1, 'ailment name']],
  sql: `SELECT ailment_id, name, duration, damage_types, dmg_fire, deals_damage FROM ailments WHERE name = 'Ignite'`,
  compute: (r) => { assert(r.length === 1 && r[0].dmg_fire === 40, 'Q13 rows'); return { answer: { duration_seconds: r[0].duration, base_damage: r[0].dmg_fire, damage_type: r[0].damage_types }, tolerance: 'multi-field: numerics +/-1%; type exact (ci)' }; },
  hints: '2.5 seconds, 40 base fire damage.' });

add({ id: 'Q14', category: 'ailments',
  question: 'Which ailments deal poison damage (have a poison base damage)?',
  tables: ['ailments'],
  uniq: [["SELECT COUNT(*) - COUNT(DISTINCT name) n FROM ailments WHERE dmg_poison > 0", 0, 'no duplicate names among poison ailments']],
  sql: `SELECT ailment_id, name, duration, dmg_poison FROM ailments WHERE dmg_poison > 0 ORDER BY ailment_id`,
  compute: (r) => { assert(r.length === 7, 'Q14 rows'); return { answer: sorted(r.map(x => x.name)), tolerance: 'set-equality' }; },
  hints: 'Exactly 7: Poison, Serpent Venom, Plague, Pestilence, Snake Infection, Acid Skin, Exposed Flesh. 5-6 of 7 with no extras = partial.' });

add({ id: 'Q15', category: 'ailments',
  question: 'What is the maximum number of stacks (max instances) of the Shock ailment?',
  tables: ['ailments'],
  uniq: [["SELECT COUNT(*) n FROM ailments WHERE name='Shock'", 1, 'ailment name']],
  sql: `SELECT ailment_id, name, max_instances, duration FROM ailments WHERE name = 'Shock'`,
  compute: (r) => { assert(r.length === 1, 'Q15 rows'); return { answer: r[0].max_instances, tolerance: 'exact' }; },
  hints: '10 stacks (maxInstances = 10, duration 4 s). Note max_instances=0 means no stack limit for e.g. Ignite/Frostbite (not asked here).' });

add({ id: 'Q16', category: 'ailments',
  question: 'What stat penalties does a stack of the Chill ailment apply to the afflicted enemy (per the ailment buff mods)?',
  tables: ['ailments', 'mods'],
  uniq: [["SELECT COUNT(*) n FROM ailments WHERE name='Chill'", 1, 'ailment name']],
  sql: `SELECT al.name, m.source_ord, m.property_name, m.modifier_type, m.value_min, m.value_max, al.max_instances
FROM ailments al
JOIN mods m ON m.source_kind = 'ailment_buff' AND m.source_id = CAST(al.ailment_id AS TEXT)
WHERE al.name = 'Chill' ORDER BY m.source_ord`,
  compute: (r) => { assert(r.length === 3 && r.every(x => x.value_min === -0.12 && x.modifier_type === 2), 'Q16 rows');
    return { answer: r.map(x => `${x.property_name}: ${pct(x.value_min)}% (more/less multiplier)`), tolerance: 'set-equality' }; },
  hints: '12% less Attack Speed, 12% less Cast Speed, 12% less Movement Speed per stack (max 3 stacks). Additive "-12%" phrasing acceptable.' });

// ------------------------------- AGGREGATE MOD QUERIES ---------------------------------------
add({ id: 'Q17', category: 'aggregate_mods',
  question: 'How many unique items grant "Ward per Second", and which ones?',
  tables: ['mods', 'uniques'],
  uniq: [["SELECT COUNT(*) - COUNT(DISTINCT u.name) n FROM uniques u WHERE u.unique_id IN (SELECT CAST(source_id AS INTEGER) FROM mods WHERE source_kind='unique_mod' AND property_name='Ward per Second')", 0, 'no duplicate names']],
  sql: `SELECT DISTINCT u.unique_id, u.name FROM mods m
JOIN uniques u ON CAST(m.source_id AS INTEGER) = u.unique_id
WHERE m.source_kind = 'unique_mod' AND m.property_name = 'Ward per Second'
ORDER BY u.name`,
  compute: (r) => { assert(r.length === 10, 'Q17 rows'); return { answer: { count: r.length, names: sorted(r.map(x => x.name)) }, tolerance: 'multi-field: count exact; names set-equality' }; },
  hints: 'Count 10 (stat "Ward per Second", SP92). Items with ability-bound "ward gained each second per X" lines are separate stats and are NOT in the ground truth; an agent that lists those as extra context but includes all 10 base ones gets partial/full at the grader\'s discretion (count must be stated as 10 for full credit).' });

add({ id: 'Q18', category: 'aggregate_mods',
  question: 'Which regular equipment affix is a plain single-stat "increased Minion Damage" affix, and what is its tier 7 roll range?',
  tables: ['affixes', 'mods'],
  uniq: [],
  sql: `SELECT a.affix_id, a.name, m.tier, m.value_min, m.value_max, m.tag_names, m.modifier_type
FROM affixes a
JOIN mods m ON m.source_kind = 'affix_tier' AND m.source_id = CAST(a.affix_id AS TEXT)
WHERE a.rolls_on = 0 AND a.special_affix_type = 0 AND a.stat_count = 1
  AND m.property_name = 'Damage' AND m.tag_names = 'Minion' AND m.modifier_type = 1 AND m.tier = 7`,
  compute: (r) => { assert(r.length === 1, 'Q18 rows'); return { answer: { affix: r[0].name, t7_min_percent: pct(r[0].value_min), t7_max_percent: pct(r[0].value_max) }, tolerance: 'multi-field: affix exact (ci); min/max numeric +/-1%' }; },
  hints: 'Affix "Minion Damage"; T7 = 96% to 120% increased Minion Damage (stored 0.96..1.2). Multi-stat affixes such as "Minion Melee and Spell Damage" are out of scope.' });

add({ id: 'Q19', category: 'aggregate_mods',
  question: 'Which blessings grant Ward per Second, and in which timeline do they drop?',
  tables: ['mods', 'blessings', 'timelines'],
  uniq: [],
  sql: `SELECT b.sub_type_id, b.name AS blessing, t.name AS timeline, b.is_grand, m.value_min, m.value_max
FROM mods m
JOIN blessings b ON m.source_id = '34:' || b.sub_type_id
JOIN timelines t ON t.timeline_id = b.timeline_id
WHERE m.source_kind = 'blessing' AND m.property_name = 'Ward per Second'
ORDER BY b.sub_type_id`,
  compute: (r) => { assert(r.length === 2 && r.every(x => x.timeline === 'Ending the Storm'), 'Q19 rows'); return { answer: { blessings: sorted(r.map(x => x.blessing)), timeline: r[0].timeline }, tolerance: 'multi-field: blessings set-equality; timeline exact (ci)' }; },
  hints: 'Resonance of the Sea (17-25 ward/s) and Grand Resonance of the Sea (30-42), both in "Ending the Storm". Only the base one = partial.' });

add({ id: 'Q20', category: 'aggregate_mods',
  question: 'Which unique items grant a "more" (multiplicative) damage modifier tagged Spell?',
  tables: ['mods', 'uniques'],
  uniq: [["SELECT COUNT(*) - COUNT(DISTINCT u.name) n FROM uniques u WHERE u.unique_id IN (SELECT CAST(source_id AS INTEGER) FROM mods WHERE source_kind='unique_mod' AND modifier_type=2 AND tag_names='Spell' AND property_name LIKE '%Damage%')", 0, 'no duplicate names']],
  sql: `SELECT DISTINCT u.unique_id, u.name, m.property_name, m.value_min, m.value_max
FROM mods m JOIN uniques u ON CAST(m.source_id AS INTEGER) = u.unique_id
WHERE m.source_kind = 'unique_mod' AND m.modifier_type = 2 AND m.tag_names = 'Spell' AND m.property_name LIKE '%Damage%'
ORDER BY u.name`,
  compute: (r) => { assert(r.length === 3, 'Q20 rows'); return { answer: sorted(r.map(x => x.name)), tolerance: 'set-equality' }; },
  hints: "Swaddling of the Erased (12-17% more spell damage), Mad Alchemist's Ladle (6%), Soulfire (6-10%). Bluefeather Band has a 'more' Spell mod but it is Mana Cost (less mana cost), so it must NOT be included." });

add({ id: 'Q21', category: 'aggregate_mods',
  question: 'Which passive nodes in the Sentinel class tree have a stat line about Endurance Threshold?',
  tables: ['mods', 'tree_nodes', 'trees'],
  uniq: [["SELECT COUNT(*) n FROM trees WHERE tree_kind='class' AND name='Sentinel'", 1, 'class tree name']],
  sql: `SELECT DISTINCT n.node_id, n.name, n.max_points, n.mastery
FROM trees t
JOIN tree_nodes n ON n.tree_id = t.tree_id
JOIN mods m ON m.source_kind = 'passive_node' AND m.source_id = n.tree_id || ':' || n.node_id
WHERE t.tree_kind = 'class' AND t.name = 'Sentinel'
  AND (m.label LIKE '%Endurance Threshold%' OR m.property_name LIKE '%Endurance Threshold%')
ORDER BY n.node_id`,
  compute: (r) => { assert(r.length === 4, 'Q21 rows'); return { answer: sorted(r.map(x => x.name)), tolerance: 'set-equality' }; },
  hints: 'Void Aegis, Defiance, Penance, Prayer Aegis. Penance only has a conditional "Bleed Duration per 20 Endurance Threshold" line; omitting only Penance = PARTIAL (3/4); adding extras = wrong.' });

// ------------------------------- WORLD -------------------------------------------------------
add({ id: 'Q22', category: 'world',
  question: 'For the timeline "Ending the Storm": what are the area level and the corruption range of its normal difficulty, and of its empowered difficulty?',
  tables: ['timelines', 'timeline_difficulties'],
  uniq: [["SELECT COUNT(*) n FROM timelines WHERE name='Ending the Storm'", 1, 'timeline name']],
  sql: `SELECT t.name, d.difficulty_index, d.level, d.minimum_corruption, d.maximum_corruption
FROM timelines t JOIN timeline_difficulties d ON d.timeline_id = t.timeline_id
WHERE t.name = 'Ending the Storm' ORDER BY d.difficulty_index`,
  compute: (r) => { assert(r.length === 2, 'Q22 rows'); return { answer: {
      normal: { level: r[0].level, corruption_min: r[0].minimum_corruption, corruption_max: r[0].maximum_corruption },
      empowered: { level: r[1].level, corruption_min: r[1].minimum_corruption, corruption_max: r[1].maximum_corruption } }, tolerance: 'multi-field: numerics exact' }; },
  hints: 'Normal: level 78, corruption 0 to 50. Empowered: level 100, corruption from 100 with no maximum (null). "100+" accepted.' });

add({ id: 'Q23', category: 'world',
  question: 'What does the monster modifier titled "Patient" do (its description) and what minimum level does it need?',
  tables: ['monster_mods'],
  uniq: [["SELECT COUNT(*) n FROM monster_mods WHERE title='Patient'", 1, 'monster mod title']],
  sql: `SELECT mod_id, title, description, minimum_level FROM monster_mods WHERE title = 'Patient'`,
  compute: (r) => { assert(r.length === 1, 'Q23 rows'); return { answer: { description: r[0].description, minimum_level: r[0].minimum_level }, tolerance: 'multi-field: description contains (ci, same meaning); level exact' }; },
  hints: '"Deadly if Not Damaged Recently", minimum level 14.' });

add({ id: 'Q24', category: 'world',
  question: 'What are the Mage class base mana and the base health gained per character level?',
  tables: ['classes'],
  uniq: [["SELECT COUNT(*) n FROM classes WHERE name='Mage'", 1, 'class name']],
  sql: `SELECT class_id, name, base_mana, base_health, health_per_level, mana_per_level FROM classes WHERE name = 'Mage'`,
  compute: (r) => { assert(r.length === 1, 'Q24 rows'); return { answer: { base_mana: r[0].base_mana, health_per_level: r[0].health_per_level }, tolerance: 'multi-field: numerics +/-1%' }; },
  hints: 'Base mana 50; health per level 10 (base health 100). Identical for all 5 classes. Mana per level 0.50506 (bonus).' });

// ------------------------------- CROSS-CUTTING -----------------------------------------------
add({ id: 'Q25', category: 'cross_cutting',
  question: 'Which unique items are Body Armor and have at least one stat mod whose maximum roll value is 100 or more?',
  tables: ['uniques', 'item_base_types', 'mods'],
  uniq: [["SELECT COUNT(*) - COUNT(DISTINCT name) n FROM uniques WHERE base_type_id = 1", 0, 'no duplicate names among body armour uniques']],
  sql: `SELECT u.unique_id, u.name, MAX(m.value_max) AS max_roll
FROM uniques u
JOIN item_base_types bt ON bt.base_type_id = u.base_type_id AND bt.name = 'Body Armor'
JOIN mods m ON m.source_kind = 'unique_mod' AND m.source_id = CAST(u.unique_id AS TEXT)
GROUP BY u.unique_id, u.name
HAVING MAX(m.value_max) >= 100
ORDER BY u.name`,
  compute: (r) => { assert(r.length === 15, 'Q25 rows'); return { answer: sorted(r.map(x => x.name)), tolerance: 'set-equality (13+ of 15 and no extras = partial; raw stored value_max, not displayed percent)' }; },
  hints: 'Raw stored value_max >= 100 (percent mods stored as 0.x never qualify; flat mods such as +100 health or 250 armor do). 15 items. Edge items with max exactly 100 (Doublet of Onos Tull, Titan Heart) are included in ground truth.' });

add({ id: 'Q26', category: 'cross_cutting',
  question: 'What is the highest-tier (best) stored roll range of the "Melee Physical Damage" affix, which can roll on two-handed axes? State the tier number and min-max.',
  tables: ['affixes', 'affix_tiers', 'mods', 'affix_can_roll_on', 'item_base_types'],
  uniq: [["SELECT COUNT(*) n FROM affixes WHERE name='Melee Physical Damage'", 1, 'affix name']],
  sql: `SELECT a.name, t.tier, m.value_min, m.value_max, m.tag_names
FROM affixes a
JOIN affix_tiers t ON t.affix_id = a.affix_id
JOIN mods m ON m.source_kind = 'affix_tier' AND m.source_id = CAST(a.affix_id AS TEXT) AND m.tier = t.tier
WHERE a.name = 'Melee Physical Damage'
  AND EXISTS (SELECT 1 FROM affix_can_roll_on r JOIN item_base_types b ON b.base_type_id = r.base_type_id
              WHERE r.affix_id = a.affix_id AND b.name = 'Two-Handed Axe')
ORDER BY t.tier DESC LIMIT 1`,
  compute: (r) => { assert(r.length === 1 && r[0].tier === 8, 'Q26 rows'); return { answer: { tier: r[0].tier, min: r[0].value_min, max: r[0].value_max }, tolerance: 'multi-field: tier exact; min/max numeric +/-1%' }; },
  hints: 'T8: 85-100 added melee physical damage (stored tier range; per-base-type affix effectiveness is ignored). Accept "T8 85-100".' });

add({ id: 'Q27', category: 'cross_cutting',
  question: 'Which player skills that have a skill tree belong to the Rogue class (default, known, unlockable or mastery skills)?',
  tables: ['class_abilities', 'abilities', 'classes'],
  uniq: [["SELECT COUNT(*) n FROM classes WHERE name='Rogue'", 1, 'class name'],
         ["SELECT COUNT(*) - COUNT(DISTINCT a.name) n FROM (SELECT DISTINCT a.ability_id, a.name FROM class_abilities ca JOIN abilities a ON a.ability_id=ca.ability_id WHERE ca.class_id=4 AND a.has_skill_tree=1 AND a.is_player_ability=1) a", 0, 'no duplicate skill names in result']],
  sql: `SELECT DISTINCT a.ability_id, a.name
FROM class_abilities ca
JOIN classes c ON c.class_id = ca.class_id
JOIN abilities a ON a.ability_id = ca.ability_id
WHERE c.name = 'Rogue' AND a.has_skill_tree = 1 AND a.is_player_ability = 1
ORDER BY a.name`,
  compute: (r) => { assert(r.length === 24, 'Q27 rows'); return { answer: sorted(r.map(x => x.name)), tolerance: 'set-equality (24 items; Jaccard >= 0.9 pass, >= 0.6 partial)' }; },
  hints: '24 skills (see expected.answer). Includes mastery skills of all three Rogue masteries and the default/known skill Flurry. Only 7 are "unlockable" kind; do not require agent to separate by kind.' });

// ------------------------------- KNOWLEDGE (knowledge/ pages) --------------------------------
function knowledge(id, question, file, quotes, answer, tolerance, hints, sql) {
  add({ id, category: 'knowledge', question, tables: sql ? ['classes'] : [], uniq: [], sql: sql || null,
    source: { file, quotes },
    compute: () => ({ answer, tolerance }), hints });
}
knowledge('Q28',
  'According to the project knowledge base, what is the ward decay formula and its constants (quadratic and linear coefficients, and how ward retention enters)?',
  'knowledge/mechanics/ward-health-sustain.md',
  ['decay(W)   = (quadraticWardDecay·d² + linearWardDecay·d) / (1 + 0.5 × R)', 'quadraticWardDecay = 5e−5 ; linearWardDecay = 0.2'],
  { page: 'knowledge/mechanics/ward-health-sustain.md (section 3.1 Decay)', formula: 'decay per second = (5e-5 * d^2 + 0.2 * d) / (1 + 0.5 * R), d = max(0, ward - ward decay threshold), R = ward retention as a fraction', quadratic: 5e-5, linear: 0.2, retention_divisor: '1 + 0.5*R' },
  'multi-field: quadratic 5e-5, linear 0.2, divisor (1 + 0.5*R) all required',
  'Must give 0.00005 (5e-5) quadratic, 0.2 linear, divided by (1 + 0.5 x retention). The superseded pre-1.1 formula 0.4*W/(1+0.5R) is WRONG as an answer. Page citation preferred.');
knowledge('Q29',
  'According to the project knowledge base, how much base health does a character gain per level, and which source wins when the in-game guide text conflicts with the asset data?',
  'knowledge/reference/classes-and-masteries.md',
  ['asset data says +10 health and +0.14 regen per level (A). Use A.', '`Health = RoundHalfEven((baseHealth + L*healthPerLevel + Σadded)'],
  { page: 'knowledge/reference/classes-and-masteries.md', health_per_level: 10, winner: 'asset data (A) beats guide text (which says +8 in one paragraph)' },
  'multi-field: health_per_level numeric exact (10); source preference contains "asset"',
  'Health per level = 10 (asset/classes.json; same value in the classes DB table, see evidence). Guide paragraphs say +8 in one place and +10 in another; asset data is preferred. Answer 8 is wrong. Page citation preferred.',
  `SELECT name, base_health, health_per_level FROM classes ORDER BY class_id`);
knowledge('Q30',
  'According to the project knowledge base, how does enemy resistance penetration against the player scale with area level, and what is the cap?',
  'knowledge/mechanics/defenses.md',
  ['Enemies have 1% penetration per area level, capped at 75% from area level 75', 'Enemy penetration vs players | +1% per area level, max 75% at area level ≥ 75'],
  { page: 'knowledge/mechanics/defenses.md (Summary rule 1, table row "Enemy penetration vs players")', per_area_level_percent: 1, cap_percent: 75, cap_reached_at_area_level: 75, note: 'applied after the 75% resistance cap, so capped 75% resistance mitigates 0% at area level >= 75' },
  'multi-field: 1% per area level, 75% cap, cap reached at area level 75',
  'Must state 1% per area level up to a 75% cap (area level 75+). Extra remark that over-capped resistance does not help against it is correct. Page citation preferred.');

// ---------------------------------------------------------------------------------------------
function materialize(spec) {
  const rows = spec.sql ? run(spec.sql) : [];
  const uniq = (spec.uniq || []).map(([s, expect, desc]) => { const n = run(s)[0].n; assert(n === expect, `${spec.id} uniqueness check failed (${desc}): ${n} != ${expect}`); return { check: desc, sql: s, n }; });
  const { answer, tolerance } = spec.compute(rows);
  const isEmpty = answer == null || answer === '' || (Array.isArray(answer) && !answer.length) || (typeof answer === 'object' && !Array.isArray(answer) && !Object.keys(answer).length);
  assert(!isEmpty, `${spec.id} empty answer`);
  let source = null;
  if (spec.source) {
    const txt = fs.readFileSync(path.join(WT, spec.source.file), 'utf8');
    spec.source.quotes.forEach(q => assert(txt.includes(q), `${spec.id} quote not found in ${spec.source.file}: ${q}`));
    source = spec.source;
  }
  return {
    id: spec.id, question: spec.question, category: spec.category,
    expected: { answer, tolerance },
    ground_truth_sql: spec.sql, ground_truth_source: source,
    evidence: evid(rows), evidence_total_rows: rows.length,
    name_uniqueness_checks: uniq.map(u => ({ check: u.check, sql: u.sql, n: u.n })),
    tables_joined: spec.tables, requires_join: spec.tables.length >= 2,
    hints_for_grader: spec.hints
  };
}

if (process.argv.includes('--verify')) {
  const saved = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  let bad = 0;
  try { assert(saved.length === 30, 'expected 30 questions'); } catch (e) { console.log('FAIL', e.message); bad++; }
  for (const q of saved) {
    const spec = Q.find(s => s.id === q.id);
    try {
      assert(spec, 'no spec');
      assert(spec.question === q.question, 'question text drift');
      let rows = [];
      if (q.ground_truth_sql) { rows = run(q.ground_truth_sql); assert(eq(evid(rows), q.evidence), 'evidence mismatch'); assert(rows.length === q.evidence_total_rows, 'row count mismatch'); }
      for (const u of q.name_uniqueness_checks) assert(run(u.sql)[0].n === u.n, 'uniqueness drift');
      const { answer } = spec.compute(rows);
      assert(eq(answer, q.expected.answer), 'expected answer drift');
      if (q.ground_truth_source) { const txt = fs.readFileSync(path.join(WT, q.ground_truth_source.file), 'utf8'); q.ground_truth_source.quotes.forEach(s => assert(txt.includes(s), 'quote missing: ' + s)); }
      console.log('OK   ', q.id, q.category, q.ground_truth_sql ? `(${rows.length} rows)` : '(knowledge page)');
    } catch (e) { bad++; console.log('FAIL ', q.id, e.message); }
  }
  const byCat = {}; saved.forEach(q => byCat[q.category] = (byCat[q.category] || 0) + 1);
  console.log('by category', JSON.stringify(byCat), '| join questions:', saved.filter(q => q.requires_join).length);
  console.log(bad ? `${bad} FAILED` : 'ALL 30 VERIFIED');
  process.exit(bad ? 1 : 0);
} else {
  const out = Q.map(materialize);
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log('wrote', OUT, out.length, 'questions');
}

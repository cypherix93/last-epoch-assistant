---
name: le-data-query
description: Use when you must look up Last Epoch game data in this repo - what an item, unique, affix, skill, tree node, passive, blessing, idol or ailment does, which affixes or nodes grant a stat, or any question that needs the le-data MCP server, data/le.sqlite or SQL against the mods table.
---

# Querying the Last Epoch game database

## Overview

All game facts live in one SQLite file (`data/le.sqlite`, game 1.5.x) built from LE Tools data plus Maxroll. Every stat line from every source (affix tier, unique mod, implicit, tree node, blessing, ailment buff, monster mod, ...) is a row in one table, `mods`. Prose rules (how stats combine) live in `knowledge/`; this skill is about **finding records and reading them correctly**. Never answer "what does X do" from memory: look it up, then cite `table + id`.

Core principle: resolve the name to an id, `get` the record, read the `mods` rows, decode tags and property ids, then cite.

## Access paths (use the first that works)

1. MCP server `le-data` (tools appear as `mcp__le-data__<tool>`):

| Tool | Use |
|---|---|
| `version()` | meta rows: game version, data folder, `fetched_at`, hashes. Call first to know which patch you are reading. |
| `schema()` | tables, columns, views summary and a pointer to `docs/schema.md`. |
| `search(query, kinds?, limit?=20)` | FTS5 hits `{kind, id, name, snippet, rank}`. For fuzzy or text discovery only; it does **not** reliably rank the player skill first (see Name resolution). |
| `lookup(name, kinds?, limit?=10)` | name -> ids: exact matches, then prefix, then FTS, with `score` and `hint`. **Use this to resolve names**; player abilities rank above minion/monster abilities. |
| `get(kind, id, include_raw?=false)` | one entity. The reply is `{ok, kind, <main record under a key named after the kind>, <children as separate top-level keys>}`: for example `unique` + `mods` + `tooltips` + `subtypes` + `set`; `affix` + `stats` + `tiers` (each with its `mods`) + `can_roll_on`; `ability` + `components` + `links` + `attribute_scaling` + `level_scaling` + `properties` + `has_tree`; `set` + `bonus_mods` + `tooltips` + `members`. Children are not merged into the main record. `raw_json` is stripped unless `include_raw:true`, which returns it **parsed** under `raw` inside the main record. For `ability`, per-component numbers (damage array, crit, ailments) are currently only in `ability_components.raw_json` (use SQL pattern 9 or `json_extract`); servers with the decoded-components update add a `decoded` object per component. Kinds: unique, affix, subtype, base_type, set, blessing, ability, skill_tree, skill_node, passive_tree, passive_node, weaver_node, ailment, property, player_property, ability_property, class, mastery, monster_mod, timeline, dungeon. |
| `find_mods({filters?, limit?=100})` | mods joined with source names. Arguments are **nested**: `{"filters":{...},"limit":N}`. `filters` keys: `property?` (SP id), `property_name?` (substring of the display name, e.g. "Armor" not "Armour"), `tags_any?` / `tags_all?` (tag names or integer bits), `include_untagged?` (default **true**: `tags_any` also returns `tags = 0` global rows; set `false` to require the bit), `modifier_type?` (0 added, 1 increased, 2 more, `null` = display-only lines), `source_kinds?`, `source_id?` (one owner, string or number), `min_value?` (`value_max >=`), `special_tag?` (exact match). Reply: `{total_matching, count, truncated, rows}`; rows carry `source_name` and, for tree nodes, `source_context` (the tree name). Always nest filter keys under `filters`; top-level filter keys are not accepted. |
| `skill_tree(ability_id)` | nodes + stats + requirements + positions of one skill tree (accepts an ability id or tree id). |
| `passive_tree(class_id)` | class passive nodes + stats + requirements. `class_id`: 0 Primalist, 1 Mage, 2 Sentinel, 3 Acolyte, 4 Rogue, a class name ("Mage") or a tree id (`mg-1`, `weaver`). |
| `sql(query, params?, limit?=500)` | read-only single SELECT/WITH; `params` fill `?`; reply `{columns, rows, row_count, truncated}`. |
| `knowledge(page?)` | no argument lists pages; with `page` returns that page's text. |

2. No MCP: from the repo root run `yarn mcp:call <tool> '<json args>'`, for example
   `yarn mcp:call lookup '{"name":"Calamity"}'` or `yarn mcp:call find_mods '{"filters":{"property":18},"limit":5}'` (Bash). In PowerShell use Bash instead, or a here-string, or escape the inner double quotes. Do not use `yarn -s` (not supported by yarn berry).

> **WARNING (Windows CLI quoting).** `yarn mcp:call` goes through `cmd.exe`. The characters `<`, `>`, `>=`, `<>`, `%`, `&`, `|` and parentheses inside inline JSON can break the call or, worse, **silently change it** (a `value_max<100` filter once returned the wrong rows). Almost every SQL pattern below contains such characters. For any call that has them, pass the JSON on stdin or from a file (needs the CLI update that adds those forms):
>
> ```bash
> yarn mcp:call sql <<'JSON'
> {"query":"SELECT name FROM uniques WHERE level_requirement >= 60 LIMIT 3"}
> JSON
> # or: printf '%s' '<json>' | yarn mcp:call sql      # or: yarn mcp:call sql @query.json
> ```
>
> Prefer `find_mods` filters (`tags_any`, `min_value`, `include_untagged`) over SQL comparisons when they can express the question. If a result looks too big, too small or ignores a filter, suspect quoting first and re-run via stdin.
3. No MCP and no CLI: a one-off Node script with better-sqlite3 (read-only):

```bash
node -e "const D=require('better-sqlite3');const db=new D('data/le.sqlite',{readonly:true});console.log(db.prepare(process.argv[1]).all())" "SELECT key,value FROM meta"
```

If `data/le.sqlite` is missing: `yarn setup` (fetch + build) or, with raw data already present, `yarn db:build`. If a table you expect is empty, the loaders may still be stubs (`LE_DB_ALLOW_STUBS=1`); say so instead of guessing, and check `data/le.build-report.json` for empty tables.

## Step 0: orient

```
version({})                                 # meta.game_version, meta.fetched_at: quote it in answers
sql({"query":"SELECT 'uniques', count(*) FROM uniques UNION ALL SELECT 'mods', count(*) FROM mods UNION ALL SELECT 'abilities', count(*) FROM abilities"})
```

On a full 1.5.2 build expect 486 uniques, 1,228 abilities (182 player abilities) and about 23,400 mods. Zero means the loaders did not run.

## Name resolution flow

```
1. lookup({"name": "Calamity"})                       -> candidates [{kind, id, name, score, hint}]
2. get({"kind": "unique", "id": 0})                   -> {unique:{...}, mods:[...], tooltips:[...], subtypes:[...], set}
3. read the fields you need; if a column is NULL, re-run get with "include_raw": true and read `raw` ($.field)
4. for stat lines: find_mods or SQL on mods (patterns below) to see ALL rows, not the tooltip
5. cite: "uniques.unique_id=0 (Calamity); mods source_kind=unique_mod source_id=0"
```

Rules:
- Ids are source ids, not row numbers. Ability ids are strings (`fi9` Fireball); tree node keys are `'<tree>:<node>'` (`fi9:2`); sub types are `'<base>:<sub>'`; unique and affix ids are integers, but in `mods.source_id` they are stored as TEXT, so `CAST(x AS TEXT)` when joining.
- **Resolve names with `lookup`, not `search`.** `lookup({"name":"Fireball","kinds":["ability"]})` returns the player skill `fi9` first (`hint: "player, has tree"`) and then minion/monster abilities with the same name. `search({"query":"Fireball"})` does not rank `fi9` first: the skill_node `fi9:0` and minion abilities named Fireball compete with it. Use `search` for fuzzy or text discovery ("which uniques mention leech") and always pass `kinds`.
- Ambiguous names (a unique and its base item, a skill and a mastery skill, the same node name in many trees): `lookup` returns several kinds. Pick by `kinds`, confirm with `get`, and state which one you chose. Never take the first hit silently.
- Player skills: filter `abilities.is_player_ability = 1`; the table also holds about a thousand minion and monster abilities with similar names.
- Names are English from `i18n`; markup such as `{1}...{/}` and `[min,max,decimals]` placeholders remains in descriptions and tooltips.
- A planner/import id such as `AIzDMQ` is a LE Tools compact id (`letools_compact_id` column; the `compact_ids` table decodes them).

## Full-text search tips

`search` is FTS5 with `tokenize='porter unicode61'`. Kinds: unique, affix, item_subtype, ability, skill_node, passive_node, weaver_node, ailment, stat_property, player_property, ability_property, set, blessing, monster_mod, timeline, dungeon.

- Stemming: "ignites" matches "ignite". Case-insensitive. Prefix: `necro*`. Boolean: `ward AND hit`, `fire NOT spell`. Phrase: `"damage over time"`.
- Restrict to the name column: `name:fireball`. The searched text is description + tooltip lines + the owner's mod labels, so a stat word ("leech") finds every owner mentioning it.
- Always pass `kinds` (for example `["unique"]`) when you know the kind, otherwise node text floods the top 20.
- `search` is not a name resolver: `search({"query":"Fireball"})` lists minion abilities and the node `fi9:0` ahead of or beside the player skill. Resolve a name to an id with `lookup` (with `kinds`), then use `search` only to discover wording.
- Rank names higher in SQL: `ORDER BY bm25(search, 0, 0, 10, 1)`.
- FTS finds wording, not numbers. For "all sources of stat X" use the `mods` table (property id), not search.
- Quote apostrophes and hyphens (`"Tu'rani"`) or search a fragment (`rani*`).

## The mods table mental model

One row is one stat line: `(property, tags, special_tag, extra_tag, modifier_type, value_min..value_max)`.

| column | read it as |
|---|---|
| `source_kind` + `source_id` + `source_ord` (+`tier`, `sub_ord`) | who owns the line; see the list below |
| `property` / `property_name` | stat id (SP 0..133; 5000+ are skill-local). Indirect ids are resolved into `property_name` |
| `tags` / `tag_names` | AT bitmask of the damage or skill types the line applies to. For indirect properties `tags` is an **index**, not a mask |
| `special_tag` | selector: AilmentID, trigger event (HitEventTag), conditional index, ability-property index; 0 = wildcard |
| `extra_tag` | ability index for skill-bound lines (0 = all skills) |
| `modifier_type` | 0 added (flat), 1 increased (additive %), 2 more (multiplicative); NULL = display-only text |
| `value_min` / `value_max` | roll range; fractions for percents (0.25 = 25%); equal when fixed |
| `display`, `label`, `context` | tree-node text value (`+25%`), line name, qualifier (`attribute:2`, `per_level`) |

`source_kind` values: `affix_tier` (one row per affix tier and line), `implicit`, `blessing`, `idol_altar`, `unique_mod`, `set_bonus` (`set_requirement` = pieces), `skill_node`, `passive_node`, `weaver_node`, `ailment_buff`, `ability_attribute_scaling`, `ability_level_scaling`, `ability_component`, `monster_mod`, `attribute`, `attribute_corrupted`. Counts and key formats: `docs/schema.md` section 2.

The view `v_mods_named` adds `source_name`, `property_enum`, `modifier_name` (added / increased / more); prefer it for reading.

How a query matches mods and how they combine: `knowledge/mechanics/stat-model.md#stat-record`. Tag bit table: `knowledge/mechanics/stat-model.md#tag-bitmask-at`.

## Reading tags (bits to names)

`tag_bits(value, bit, name)` holds all 30 tags. Common values: Physical 1, Lightning 2, Cold 4, Fire 8, Void 16, Necrotic 32, Poison 64, Elemental 128, Spell 256, Melee 512, Throwing 1024, Bow 2048, DoT 4096, Minion 8192, Totem 16384, PetResisted 32768, Potion 65536, Buff 131072, Channelling 262144, Transform 524288, LowLife 1048576, HighLife 2097152, FullLife 4194304, Hit 8388608, Curse 16777216, Ailment 33554432.

- `tag_names` is pre-decoded (`Fire,Spell`). NULL means `tags = 0` (applies to everything of that property) **or** an indirect property. Do not read NULL as "no restriction" for SP 58, 88, 98, 130.
- Filter a bit: `(tags & 8192) <> 0` (always parenthesise `&`). Filter untagged: `tags = 0`.
- A mod applies to a damage source only if **every** tag on the mod is present on the source (subset rule; Elemental also matches Fire, Cold and Lightning). A mod with `tags = 520` (Fire|Melee) does not apply to a spell. Details: `knowledge/mechanics/damage-pipeline.md#4-tag-matching`.
- A skill's own tags: `abilities.tags` / `tag_names` (Fireball = 264 = Fire|Spell).

## Translating property ids

| property | what `tags` / `special_tag` mean | resolve with |
|---|---|---|
| any SP 0..133 | normal | `stat_properties.property` -> `name`, `enum_name` |
| 98 PlayerProperty | `tags` = `player_properties.idx` | `SELECT * FROM player_properties WHERE idx = <tags>` |
| 58 AbilityProperty | `tags` = ability index, `special_tag` = property index | `ability_properties (ability_index, prop_index)` |
| 130 IdolAltarProperty | `tags` = altar property id | `idol_altar_properties` |
| 88 LevelOfSkills | with `special_tag = 1`, `tags` = ability index ("Level of Fireball") | `abilities.ability_index` |
| 117, 131-133 | `special_tag` = conditional damage property | `conditional_properties` |
| 100 AilmentConversion | `special_tag` = from AilmentID, `tags` = to AilmentID | `ailments` |
| 5000+ | skill-local stat in a tree node, `property_name` NULL | read `label`, `display`, node `description` |

`property_name` already holds the resolved name for 58, 98, 130 and 88. SP and enum names: `knowledge/mechanics/stat-model.md#property-ids-sp`.

## The ten SQL patterns

All run as written through `sql({"query": "..."})` (literals, no parameters). From the CLI, send them on stdin or `@file.json` (see the quoting warning above): these queries contain `<`, `>`, `%` and `|`.

1. Find a thing by name across tables:

```sql
SELECT 'unique' AS kind, CAST(unique_id AS TEXT) AS id, name FROM uniques WHERE name LIKE '%Calamity%'
UNION ALL SELECT 'item_subtype', base_type_id || ':' || sub_type_id, name FROM item_subtypes WHERE name LIKE '%Calamity%'
UNION ALL SELECT 'affix', CAST(affix_id AS TEXT), name FROM affixes WHERE name LIKE '%Calamity%'
UNION ALL SELECT 'ability', ability_id, name FROM abilities WHERE name LIKE '%Calamity%' AND is_player_ability = 1;
```

2. Ranked full-text search with a snippet:

```sql
SELECT kind, id, name, snippet(search, 3, '[', ']', '...', 12) AS context
FROM search WHERE search MATCH 'ward AND hit' AND kind IN ('unique', 'affix')
ORDER BY bm25(search, 0, 0, 10, 1) LIMIT 20;
```

3. Everything about one unique in one row (tooltip text, flattened mods, lore):

```sql
SELECT name, base_type, sub_type, level_requirement, set_name, mods_text, tooltip_text
FROM v_unique_summary WHERE name = 'Calamity';
```

4. Every stat line of that unique with decoded type (shows what the tooltip hides; special effects are SP 58 or 98 rows, or tooltip-only):

```sql
SELECT source_ord, property, property_name, tag_names, special_tag, modifier_name, value_min, value_max
FROM v_mods_named
WHERE source_kind = 'unique_mod'
  AND source_id = (SELECT CAST(unique_id AS TEXT) FROM uniques WHERE name = 'Calamity')
ORDER BY source_ord, sub_ord;
```

5. All affix tiers that grant a stat on a slot (here SP 13 FireResistance on Helmets):

```sql
SELECT a.affix_id, a.name, a.affix_type_name, m.tier, m.value_min, m.value_max
FROM affixes a
JOIN affix_can_roll_on r ON r.affix_id = a.affix_id
JOIN item_base_types bt ON bt.base_type_id = r.base_type_id AND bt.name = 'Helmet'
JOIN mods m ON m.source_kind = 'affix_tier' AND m.source_id = CAST(a.affix_id AS TEXT)
WHERE m.property = 13
ORDER BY a.affix_id, m.tier;
```

6. Who grants a stat, by source kind (here increased minion damage: SP 0 with the Minion bit):

```sql
SELECT source_kind, count(*) AS lines, min(value_min) AS lo, max(value_max) AS hi
FROM mods
WHERE property = 0 AND modifier_type = 1 AND (tags & 8192) <> 0
GROUP BY source_kind ORDER BY lines DESC;
```

7. Largest multiplicative (more) damage sources, any kind:

```sql
SELECT source_kind, source_name, property_name, tag_names, value_min, value_max
FROM v_mods_named
WHERE modifier_type = 2 AND property = 0
ORDER BY value_max DESC LIMIT 25;
```

8. A skill's tree nodes with stats and prerequisites (node stats have `modifier_type` NULL, so read `stats_text`):

```sql
SELECT node_id, name, max_points, stats_text, requires, description
FROM v_skill_node_summary
WHERE tree_kind = 'skill' AND tree_name = 'Fireball'
ORDER BY node_id;
```

9. A skill's raw damage components (base damage per type, ADE, crit, hit flag from the prefab JSON):

```sql
SELECT a.name, c.ord, c.component_type,
       json_extract(c.raw_json, '$.baseDamageStats.damage') AS damage_by_type,
       json_extract(c.raw_json, '$.baseDamageStats.addedDamageScaling') AS ade,
       json_extract(c.raw_json, '$.baseDamageStats.critChance') AS crit_chance,
       json_extract(c.raw_json, '$.baseDamageStats.hit') AS is_hit
FROM ability_components c JOIN abilities a ON a.ability_id = c.ability_id
WHERE a.name = 'Fireball' AND a.is_player_ability = 1 AND c.component_type LIKE '%Damage%'
ORDER BY c.ord;
```

10. Decode a tag mask, and resolve an indirect property:

```sql
SELECT name FROM tag_bits WHERE value <> 0 AND (264 & value) <> 0 ORDER BY bit;
```

```sql
SELECT m.source_kind, m.source_id, pp.idx, pp.name, m.value_min, m.value_max
FROM mods m JOIN player_properties pp ON pp.idx = m.tags
WHERE m.property = 98 AND pp.name LIKE '%Haste%' ORDER BY pp.idx;
```

More useful shapes. Blessings (and idol altar implicits) are `mods` rows with their own `source_kind`:

```sql
SELECT name, timeline_name, is_grand, property_name, tag_names, modifier_name, value_min, value_max
FROM v_blessings WHERE timeline_name = 'Reign of Dragons' ORDER BY is_grand, name, source_ord;
```

Set bonuses:

```sql
SELECT s.name AS set_name, m.set_requirement, coalesce(m.property_name, m.label) AS bonus, m.modifier_type, m.value_min
FROM sets s JOIN mods m ON m.source_kind = 'set_bonus' AND m.source_id = CAST(s.set_id AS TEXT)
WHERE s.set_id > 0 ORDER BY s.set_id, m.set_requirement, m.source_ord;
```

Damaging ailments:

```sql
SELECT ailment_id, name, duration, max_instances, damage_types, dmg_fire, dmg_physical, dmg_poison, tag_names
FROM ailments WHERE deals_damage = 1 ORDER BY name;
```

Abilities a unique triggers (itemDB relation maps):

```sql
SELECT u.name AS unique_name, a.name AS ability, r.value
FROM relations r
JOIN uniques u ON u.unique_id = CAST(r.source_id AS INTEGER)
LEFT JOIN abilities a ON a.ability_id = r.target_id
WHERE r.source_kind = 'unique' AND r.relation = 'triggered_ability'
ORDER BY u.name;
```

The same idea through MCP (pattern 6 restricted to two source kinds). `include_untagged:false` makes `tags_any` require the bit, like `(tags & 8192) <> 0`; without it the default (true) also returns every `tags = 0` global line:

```
find_mods({"filters":{"property":0,"modifier_type":1,"tags_any":["Minion"],"include_untagged":false,"source_kinds":["affix_tier","unique_mod"]},"limit":50})
```

Tag names or integer bits both work (`"tags_any":[8192]`). Display-only tree-node lines: `find_mods({"filters":{"property":0,"modifier_type":null,"source_kinds":["skill_node"]},"limit":20})` (606 rows in this build; `modifier_type` must be the JSON `null`, not omitted). One owner: `{"filters":{"source_id":"33","source_kinds":["unique_mod"]}}`.

**`tags_any` can match indirect properties by accident.** For SP 58, 98 and 130 the `tags` column is an index, not a mask, so a bit test can hit it. In SQL add `AND property NOT IN (58, 98, 130)`; with `find_mods` filter the returned rows (`property` 58, 98, 130) out yourself, or pass a concrete `property`.

## Gotchas

- **Display-only node stats**: skill and passive tree node stat lines often have `modifier_type = NULL` (text only, value parsed from `'+25%'`). Never infer added, increased or more from the wording; skill-tree damage is mostly **more** (`knowledge/mechanics/damage-pipeline.md#5-increased-more-and-skill-trees`). Say "type not in data" instead of guessing.
- **Blessings and idol altars**: their implicits are `mods` rows with `source_kind = 'blessing'` (`source_id '34:<sub>'`) and `'idol_altar'` (`'41:<sub>'`), not `affix_tier`. A query over `affix_tier` misses them. Idol affixes themselves are in `affixes` (`rolls_on = 1`).
- **Uniques**: tooltip special effects are not stat lines; they are SP 98 or 58 rows, or tooltip text only (`unique_tooltips`, `knowledge/interactions/unique-effects-index.md`). `uniques.mod_count` counts stat lines only.
- **Value scale**: percents are fractions; HealthLeech stores 10x the displayed fraction (0.3 = 3%).
- **Affix tiers**: tiers are 1-based and **T8 is the highest** (T1 the lowest). Example: affix 63 (Added Melee Physical Damage) rolls 3-6 at T1 and 85-100 at T8; affix 26 (Minion Damage) 6-12% at T1 and 192-240% at T8. 8 tiers exist on 684 equipment affixes (T8 is the Primordial tier); crafting reaches T5 only, T6-T7 must drop, T8 comes from Rune of Evolution (`knowledge/reference/crafting.md`, `knowledge/reference/item-system.md#affix-slots-tiers-sealed-affixes`). To get the best roll use `ORDER BY tier DESC`, not `tier = 1`; the guide's 7-tier wording is superseded by the data (`item-system.md`, Tier numbers note). Item base multipliers (`affixEffectModifier`) scale the displayed roll: `knowledge/reference/item-system.md#affix-effectiveness-affixeffectmodifier-and-value-formula`.
- **Class restriction**: `affixes.class_names`, `item_subtypes.class_requirement_names`; `class_specificity` uses bit `1<<(classID+1)`.
- **Compact ids**: planner strings (`A` affix, `S` set, `I` implicit, `M` monster mod) map via `compact_ids`; do not decode by hand.
- **Multi-row lines**: one source line with added, increased and more parts becomes several rows (`sub_ord`); group by `source_id, source_ord` before summing.
- **Numeric `params` bind as reals.** `sql` with `"params":[33]` and `CAST(? AS TEXT)` compares against `'33.0'`; pass `"33"` (string) when the SQL casts to TEXT, or compare numerically (`unique_id = ?`).
- **Foreign keys are not enforced**: LEFT JOIN when following references; some ids are absent (affix 1139, some uniques).
- **Damage arrays are not in tag-bit order.** `ability_components.raw_json` `$.baseDamageStats.damage` is `[physical, fire, cold, lightning, necrotic, void, poison]` (Fireball `[0,25,0,0,0,0,0]`), whereas `tag_bits` orders Physical 1, Lightning 2, Cold 4, Fire 8. Never index one with the other.
- **No cooldown column.** `abilities` has `max_charges` and `charges_gained_per_second`; cooldown is `1 / charges_gained_per_second` when that is > 0 (0.25/s means 4 s).
- **Weaver nodes** are not a separate table: they are `tree_nodes` rows with `tree_id = 'weaver'` (`tree_kind = 'weaver'`, 80 rows); `get` kind `weaver_node` and `passive_tree({"class_id":"weaver"})` read them.
- **`requires` edges** (`v_skill_node_summary.requires`, `tree_node_requirements`, `requires` in `skill_tree`/`passive_tree`): `"3>=1"`-style text means this node needs at least N points in prerequisite node M (`2>=1` on node 3: node 2 needs 1 point; `2>=2,6>=2` needs both).
- **Ailment ids in components** (`$.ailments[].ailment`) are `ailments.ailment_id`: join to `ailments` for the name (for example 1 is Ignite).
- **Base type names**: body armour is `item_base_types.name = 'Body Armor'` (`base_type_id` 1; the engine enum spells it BodyArmor). Match by `base_type_id` when unsure: `SELECT base_type_id, name FROM item_base_types`.
- **Ability name clashes**: minion abilities share names with player skills; filter `is_player_ability = 1` and `has_skill_tree = 1`.
- **Text columns can be NULL** when the i18n key is missing: fall back to the `*_key` column or `raw_json`.

## Answering "what does X do": checklist

1. `version()`; quote the game version.
2. `lookup` and choose the kind; state ambiguities.
3. `get` the record; for items also read the `mods` rows (pattern 4), the tooltip (`unique_tooltips`) and `relations` (triggered abilities).
4. Decode every tag and every indirect property (tables above) and say which tags the line requires.
5. Find the combining rule in `knowledge/` (use `le-mechanics-reference` to pick the page) and quote its confidence label.
6. Cite each fact as `table.column=id`, for example `mods source_kind=affix_tier source_id=0 tier=1` or `tree_nodes fi9:2`.
7. State what is **not** in the data: unmodelled special effects (SP 98 or 58), 5000+ skill-local properties, node effect types.
8. Give numbers with range, unit (fraction or percent) and the label of the rule used.

## Common mistakes

| Mistake | Fix |
|---|---|
| Searching tooltip text for a stat and calling the list complete | Query `mods` by `property`; FTS only finds wording |
| Joining `mods.source_id` to an integer key | `CAST(x AS TEXT)` |
| `tags & 8 <> 0` precedence slip | `(tags & 8) <> 0` |
| Treating `tag_names` NULL as untagged for SP 98 | NULL also means indirect: `tags` is an index |
| Quoting the first `lookup` hit | List candidates, pick by kind, `get` it |
| Summing the rows of one multi-component line as separate sources | Group by `source_id, source_ord` |

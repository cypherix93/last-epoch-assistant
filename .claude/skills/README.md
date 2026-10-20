# Last Epoch project skills

Skills that teach an agent to use this repository's game database (`data/le.sqlite`), the `le-data` MCP server and the `knowledge/` pages to reason about character builds (Last Epoch 1.5.x).

| Skill | One line |
|---|---|
| `le-mechanics-reference` | Navigator: which knowledge page and section answers which question, confidence labels, source priority, and a 25-constant cheat sheet. |
| `le-data-query` | How to find anything in the game data: MCP tools, name resolution, full-text search, the `mods` table, tag bits, property ids, ten SQL patterns, gotchas, citation checklist. |
| `le-damage-reasoning` | Step-by-step skill damage estimate: base and added damage, increased vs more, tag matching, crit, penetration vs resistance, conversion, ailments, and when to say "cannot be determined". |
| `le-defense-reasoning` | Survivability assessment: resistances and area-level penetration, armour/dodge/block, endurance, ward and sustain, EHP against reference hits, red flags. |
| `le-build-audit` | Full structured build audit (offense, defense, sustain, mana, mobility, bottlenecks, resistances, anti-synergies) with a ranked fix list and an output template. |
| `le-build-around-item` | End-to-end workflow when a user drops an item and wants a build designed around it: item model, at least 5 candidate archetypes, scoring, 1-2 skeletons, honesty pass, proposal template (`templates/proposal.md`, worked example `examples/culnivars-claim.md`). |

## Recommended order

1. `le-mechanics-reference` - pick the rules, labels and constants for the question.
2. `le-data-query` - resolve names to ids and read the records and `mods` rows.
3. `le-damage-reasoning` and `le-defense-reasoning` - compute offense and survivability from those records.
4. `le-build-audit` - combine them into a reviewed report for a complete build.
5. `le-build-around-item` - design a new build around a specific item, using all of the above.

## Tool quick reference

The `le-data` MCP server has 15 tools (`yarn mcp:list` prints them). Arguments are one JSON object; `?` marks optional keys, defaults in parentheses. Every reply is `{"ok": true, ...}` or `{"ok": false, "error": "..."}`.

| Tool | Arguments |
|---|---|
| `version` | `{}` |
| `schema` | `{"table"?: string}` (no table: all tables and views with row counts; with table: columns and 3 sample rows) |
| `search` | `{"query": string, "kinds"?: string[], "limit"?: 1-200 (20)}` (FTS5; `"phrase"`, `prefix*`, `name:term`; fuzzy discovery, not name resolution). `"raw"?: boolean (false)` passes the MATCH expression to FTS5 unchanged (`fire OR cold`, `NEAR(a b, 5)`); syntax errors come back as tool errors |
| `get` | `{"kind": string, "id": string | number | object, "include_raw"?: boolean (false)}` (record under a key named after the kind, children as separate top-level keys; `ability` components carry a `decoded` object and the record a `cooldown_seconds` when it has charges; mod rows carry `special_tag_name` / `property_kind`; kind `buff` = non-ailment buffs (Craterborn 14, Lightning Aegis 86); `unique` adds `drop_sources` + `obtain`) |
| `lookup` | `{"name": string, "kinds"?: string[], "limit"?: 1-100 (10)}` (resolves names; player abilities rank first; `kinds:["buff"]` finds buff-bar buffs) |
| `find_mods` | `{"filters"?: {"property"?: int, "property_name"?: string, "tags_any"?: (string | int)[], "tags_all"?: (string | int)[], "include_untagged"?: boolean (true), "include_indirect"?: boolean (false), "modifier_type"?: 0 | 1 | 2 | null, "source_kinds"?: string[], "source_id"?: string | number, "min_value"?: number, "special_tag"?: int}, "limit"?: 1-2000 (100)}` (filters are nested; `modifier_type: 2` = more, `null` = lines with no kind; tree-node rows carry `stat_kind`, `modifier_source` (`structured` = decompiled node code, `inferred` = label), `code_ref`, `property_hint` and a `warning` when `label_mismatch` is 1; tag filters skip SP 58/98/130 rows unless `include_indirect`) |
| `skill_tree` | `{"ability_id": string, "filter"?: string, "compact"?: boolean, "keep_descriptions"?: boolean (true)}` (ability id such as `fi9` or a tree id; `unlocked_by` is `[{node_id, node_name, points}]` and means ANY ONE of (adjacency, not all; `requires` is a deprecated alias); every node stat line has `scales_with_points` / `scaling` (`per_point` = value per point allocated, `fixed`, `at_threshold`); `filter` keeps nodes whose text matches, `compact` drops x/y and the UI fields but keeps `description` / `alt_text` truncated at 400 chars, `keep_descriptions:false` restores the old behaviour of dropping them; node stat lines carry `stat_kind`, `modifier_source`, `code_ref`, `property_hint`, and a `warning` for `label_mismatch` lines) |
| `passive_tree` | `{"class_id": number | string, "filter"?: string, "compact"?: boolean, "keep_descriptions"?: boolean (true)}` (0-4, a class name, or a tree id such as `mg-1`, `weaver`) |
| `sql` | `{"query": string, "params"?: any[], "limit"?: 1-5000 (500)}` (one SELECT or WITH statement, or `PRAGMA table_list` / `table_info(<t>)` / `index_list(<t>)`) |
| `knowledge` | `{"page"?: string}` (no page: list; page: repo-relative path or unique basename, e.g. `mechanics/damage-pipeline`; returns the whole page as one `text` string) |
| `builds` | `{"class"?, "mastery"?, "ability"?, "any_skill"?: boolean, "item"?, "affix"?, "tab"?, "tier"?, "tier_list"?: "corruption" \| "speed" \| "bossing", "playstyle"?, "season"?, "limit"? (50)}` (list / filter Maxroll community guides; each row: slug, title, class, mastery, main_skill, tiers, tabs) |
| `build` | `{"id"?: build_id, "slug"?: string, "tab"?: string (default tab), "sections"?: ("gear" \| "idols" \| "blessings" \| "passives" \| "skills" \| "notes")[]}` (one guide fully named: gear with affix tiers and rolled values, idols on the grid, blessings, passives per mastery, skills with nodes, notes; `get` kind `build` is an alias) |
| `item_usage` | `{"name"?: string, "unique_id"?: int, "affix"?: id \| name, "slot"?, "tab"?, "class"?, "mastery"?, "limit"? (100)}` (which guides use a unique / set item (with their extra affixes) or an affix (per slot, typical tier)) |
| `planner` | `{"url"?: string, "json"?: object \| string, "file"?: string, "refresh"?: boolean (false), "sections"?: ("gear" \| "idols" \| "blessings" \| "passives" \| "skills" \| "weaver")[]}` (exactly one of url / json / file: an LE Tools planner build fully named, with rolled affix / implicit / unique values, tiers, origins, idols on the grid, blessings, passives per mastery, skill and Weaver nodes, plus `character.summary` and `warnings`; a link is loaded once in a local headless browser and cached, `docs/planner-import.md`) |
| `slot_meta` | `{"slot": string, "class"?, "mastery"?, "ability"?, "tab"? ("Endgame"), "kind"?: "unique" \| "rare" \| "all", "limit"? (25)}` (what guides wear in a slot: items with count / pct / example slugs, affixes with typical tier and prefix / suffix) |

**In-game names in replies.** Alongside the ids, replies carry the names the game UI shows: `display` on tree nodes ("Circle of Elements (Runemaster passive)"), uniques (name with slot, base item, class requirement, tooltip `effects`), affixes (line names, prefix / suffix, class restriction, slots, `tier_lines`), blessings, `lookup` hits and the community tools' gear, affix lines and nodes; `stat_name` / `stat_line` on every mod row ("+116-140% Chance to Shock on Lightning Hit"), `source_display` on `find_mods` rows, `special_tag_name` / `condition` / `converts_from` / `converts_to` for ailment, conditional and conversion lines. Quote those in answers (see "Player-facing names" below).

The last four read the community builds tables: Maxroll community guides for 1.5.2, community choices and not game truth (`docs/community-builds.md`). `lookup` / `search` kind `build` resolve a guide title or slug to its build_id.

CLI form (from the repo root): `yarn mcp:call <tool> [args] [--pretty]`. Only the JSON result goes to stdout, on one line (`--pretty` indents); logs go to stderr; exit code 1 on `ok:false`. Args, first match wins: `@file.json` (for `sql`, a file not starting with `{` is raw SQL), `sql --query-file q.sql`, stdin (`-` or piped input; raw SQL is accepted for `sql`), or inline JSON for simple args:

```bash
yarn mcp:call lookup '{"name":"Fireball","kinds":["ability"]}'
yarn mcp:call find_mods '{"filters":{"property":18,"source_kinds":["unique_mod"]},"limit":20}'
printf '%s' '{"ability_id":"fi9","filter":"ignite","compact":true}' | yarn mcp:call skill_tree
printf '%s' '{"mastery":"Void Knight","tier":"S"}' | yarn mcp:call builds
printf '%s' '{"slug":"erasing-strike-void-knight-guide","sections":["gear"]}' | yarn mcp:call build
printf '%s' '{"name":"World Splitter"}' | yarn mcp:call item_usage
printf '%s' '{"slot":"helmet","mastery":"Void Knight"}' | yarn mcp:call slot_meta
yarn mcp:call sql <<'JSON'
{"query": "SELECT name FROM uniques WHERE level_requirement >= 60 LIMIT 3"}
JSON
```

> **Quoting warning.** On Windows `yarn mcp:call` runs through `cmd.exe`: `<`, `>`, `>=`, `<>`, `%`, `&`, `|` and parentheses inside inline JSON can break the call or silently corrupt it (wrong rows, no error). The single quote `'` (every SQL string literal, and names such as "Naga's Fang") breaks the shell quoting itself. Put SQL and anything with an apostrophe in a file (`@file.json`, `--query-file`) or on stdin.
>
> Never use `yarn -s` (not supported by yarn berry). For `find_mods`, always nest the filter keys under `filters` (top-level `property` and friends are not accepted).

Every number an agent reports must carry a confidence label (D, A, G, X, U) and a source (`knowledge/` page#section or table + id).

## Player-facing names (applies to every skill)

**Never show internal ids in player-facing text; use the in-game name as the game UI shows it.** The player only sees names in the game: tree-node keys (`mg-1:88`, `lb23il:28`), uids, affix ids ("Body: 392 + 391"), property ids (`SP 18`), tag masks (`258`), `PP464` / `AP162` codes, ability ids (`fi9`, `ability_gen98`), base:sub keys (`8:5`), blessing sub ids and guide slugs are unreadable to them.

| Thing | Write it as | Not | Where the wording comes from |
|---|---|---|---|
| Skill | Lightning Blast | `lb23il` | `abilities.name` |
| Skill-tree node | Innate Conduit (Lightning Blast node, 1/1 pt) | `lb23il:28` | `skill_tree` node `name` + the tree's skill name |
| Passive node | Circle of Elements (Runemaster passive, 10 pts) | `mg-1:88` | `passive_tree` node `name` + mastery name (class name for the base tree) |
| Weaver node | Shifted Knowledge (Weaver tree) | `weaver:1` | same |
| Unique / set item | Crest of Unity (unique helmet) | "uid 307" | `uniques.name` + base type (slot); base item (Runed Visage) when it matters |
| Rare / exalted affix, slam, LP target | Body armour: +174-210% Chance to Shock on Lightning Hit (T7) | "Body: 392" | the affix's stat line: `affix_stats.label` + value range on that base + tier |
| Idol affix | Ornate Idol (4x1): +12-40 Ward per Second (T1) | "idol affix 178" | same stat line, from `v_idol_affix_values` (`idol`, `idol_size`, scaled values) |
| Unique mod line | +90% increased Lightning Spell Damage | "Damage (0) 258 increased 0.9" | `mods` value + modifier word + tag words + property name |
| Coded effect (PlayerProperty / AbilityProperty) | Spells deal 1% more damage per 2 mana cost, up to 50% more | `PP464`, `AP162` | the tooltip text (`unique_tooltips.text`, `masteries.passive_bonus_labels`, node `description`) or the resolved `property_name` |
| Ability an item casts | Fire Aura (cast by Ignivar's Head) | `ability_gen98` | `abilities.name` + the owner |
| Stat | Mana Regen, Ward per Second | `SP 18`, `property 92` | `stat_properties.name` / `property_name` |
| Tags | Lightning Spell | `258`, "Lightning\|Spell" | `tag_names`, written as words |
| Blessing | Grand Bastion of Divinity (Ending the Storm blessing) | "blessing 73", `34:73` | `v_blessings.name` (Grand is part of the name) + `timeline_name` |
| Community guide | the Maxroll "Runemaster Lightning Blast" guide (Endgame tab) | the slug | `v_build_summary.title` + tab |

The tools return these names directly (`display`, `source_display`, `stat_line`; see "In-game names in replies" above). The SQL that renders them (node + tree, unique + slot, affix stat line on a base and tier, unique mod line) is in **le-data-query**, "Player-facing names".

Ids are still useful for reproducibility, but only in one place: the **Data citations** (or **Sources**) table at the end of a proposal, audit or report, and always paired with the in-game name (`Innate Conduit (Lightning Blast node) | skill node | lb23il:28`). Tool-call and SQL recipes in the skills use ids; that is agent-facing and fine. Working notes may carry ids; translate them before they reach the player. If an answer has no citations table, it shows no ids at all.

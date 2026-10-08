# Last Epoch project skills

Skills that teach an agent to use this repository's game database (`data/le.sqlite`), the `le-data` MCP server and the `knowledge/` pages to reason about character builds (Last Epoch 1.5.x).

| Skill | One line |
|---|---|
| `le-mechanics-reference` | Navigator: which knowledge page and section answers which question, confidence labels, source priority, and a 25-constant cheat sheet. |
| `le-data-query` | How to find anything in the game data: MCP tools, name resolution, full-text search, the `mods` table, tag bits, property ids, ten SQL patterns, gotchas, citation checklist. |
| `le-damage-reasoning` | Step-by-step skill damage estimate: base and added damage, increased vs more, tag matching, crit, penetration vs resistance, conversion, ailments, and when to say "cannot be determined". |
| `le-defense-reasoning` | Survivability assessment: resistances and area-level penetration, armour/dodge/block, endurance, ward and sustain, EHP against reference hits, red flags. |
| `le-build-audit` | Full structured build audit (offense, defense, sustain, mana, mobility, bottlenecks, resistances, anti-synergies) with a ranked fix list and an output template. |
| `le-build-around-item` | End-to-end workflow when a user drops an item and wants a build designed around it (maintained separately). |

## Recommended order

1. `le-mechanics-reference` - pick the rules, labels and constants for the question.
2. `le-data-query` - resolve names to ids and read the records and `mods` rows.
3. `le-damage-reasoning` and `le-defense-reasoning` - compute offense and survivability from those records.
4. `le-build-audit` - combine them into a reviewed report for a complete build.
5. `le-build-around-item` - design a new build around a specific item, using all of the above.

## Tool quick reference

The `le-data` MCP server has 10 tools (`yarn mcp:list` prints them). Arguments are one JSON object; `?` marks optional keys, defaults in parentheses. Every reply is `{"ok": true, ...}` or `{"ok": false, "error": "..."}`.

| Tool | Arguments |
|---|---|
| `version` | `{}` |
| `schema` | `{"table"?: string}` (no table: all tables and views with row counts; with table: columns and 3 sample rows) |
| `search` | `{"query": string, "kinds"?: string[], "limit"?: 1-200 (20)}` (FTS5; `"phrase"`, `prefix*`, `name:term`; fuzzy discovery, not name resolution) |
| `get` | `{"kind": string, "id": string | number | object, "include_raw"?: boolean (false)}` (record under a key named after the kind, children as separate top-level keys) |
| `lookup` | `{"name": string, "kinds"?: string[], "limit"?: 1-100 (10)}` (resolves names; player abilities rank first) |
| `find_mods` | `{"filters"?: {"property"?: int, "property_name"?: string, "tags_any"?: (string | int)[], "tags_all"?: (string | int)[], "include_untagged"?: boolean (true), "modifier_type"?: 0 | 1 | 2 | null, "source_kinds"?: string[], "source_id"?: string | number, "min_value"?: number, "special_tag"?: int}, "limit"?: 1-2000 (100)}` (filters are nested; `modifier_type: null` = display-only lines) |
| `skill_tree` | `{"ability_id": string}` (ability id such as `fi9` or a tree id) |
| `passive_tree` | `{"class_id": number | string}` (0-4, a class name, or a tree id such as `mg-1`, `weaver`) |
| `sql` | `{"query": string, "params"?: any[], "limit"?: 1-5000 (500)}` (one SELECT or WITH statement) |
| `knowledge` | `{"page"?: string}` (no page: list; page: repo-relative path or unique basename, e.g. `mechanics/damage-pipeline`) |

CLI form (from the repo root, in Bash; PowerShell users should run Bash or use a here-string): `yarn mcp:call <tool> '<json>'`, for example:

```bash
yarn mcp:call lookup '{"name":"Fireball","kinds":["ability"]}'
yarn mcp:call find_mods '{"filters":{"property":18,"source_kinds":["unique_mod"]},"limit":20}'
```

> **Windows quoting warning.** `yarn mcp:call` runs through `cmd.exe`. `<`, `>`, `>=`, `<>`, `%`, `&`, `|` and parentheses inside inline JSON can break the call or silently corrupt it (wrong rows, no error). Send such JSON on stdin or from a file instead (needs the CLI update that adds those forms):
>
> ```bash
> yarn mcp:call sql <<'JSON'
> {"query": "SELECT name FROM uniques WHERE level_requirement >= 60 LIMIT 3"}
> JSON
> # or: printf '%s' '<json>' | yarn mcp:call sql      # or: yarn mcp:call sql @query.json
> ```
>
> Never use `yarn -s` (not supported by yarn berry). For `find_mods`, always nest the filter keys under `filters` (top-level `property` and friends are not accepted).

Every number an agent reports must carry a confidence label (D, A, G, X, U) and a source (`knowledge/` page#section or table + id).

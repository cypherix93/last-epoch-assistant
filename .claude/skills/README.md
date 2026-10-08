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

Every number an agent reports must carry a confidence label (D, A, G, X, U) and a source (`knowledge/` page#section or table + id).

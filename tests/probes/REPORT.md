# Grading report: Last Epoch probe suite (4 agents, 30 questions)

Ground truth re-verified: `node make-questions.js --verify` printed "ALL 30 VERIFIED" (all SQL evidence and knowledge-page quotes match). No agent answer disagreed with ground truth, so no individual SQL had to be re-litigated.

## Summary
| pass | partial | fail | ambiguous | score |
|---|---|---|---|---|
| 30 | 0 | 0 | 0 | 30 / 30 |

| category | n | pass rate | mean tool calls |
|---|---|---|---|
| name_lookup | 4 | 100% | 2.00 |
| abilities | 4 | 100% | 1.50 |
| trees | 4 | 100% | 1.50 |
| ailments | 4 | 100% | 1.00 |
| aggregate_mods | 5 | 100% | 2.40 |
| world | 3 | 100% | 1.67 |
| cross_cutting | 3 | 100% | 1.67 |
| knowledge | 3 | 100% | 1.00 |

## Non-pass list
None. Borderline calls worth knowing about:
- Q21 (Sentinel Endurance Threshold nodes): the agent named all four expected nodes but hedged Penance as "only a conditional label". Graded pass because the final set equals the expected set; the agent flagged the question wording as ambiguous, which the hint already acknowledges.
- Q02 / Q03: extra hidden mod lines were listed. The hints explicitly allow this, so no penalty.
- Q17: the agent gave the count as 10 and the exact 10 names, so full credit.

Note on suite strength: a 100% score with 1-3 tool calls per question suggests the suite does not discriminate between runs; the agents' `problems` below are the more useful signal.

## Problems reported by agents (deduplicated)

### CLI / quoting
- `yarn mcp:call` goes through cmd.exe: `<`, `>`, `>=`, `%`, `&`, and parentheses in the JSON query break the call (silent garbage, "system cannot find the path", empty output, or silently wrong rows for `<100`). Reported by agents on Q09, Q14, Q17, Q25. Workaround used: BETWEEN, avoiding comparison operators.
- `yarn -s` is unsupported (yarn berry), so output includes noise; output is verbose pretty-printed JSON.

### Server tool gaps
- `get affix` does not list can_roll_on base types (Q04, needed SQL).
- `get ability` omits component base damage and ailment application data (Q05, Q08, needed raw_json SQL).
- No explicit cooldown field for abilities; must derive from charges_gained_per_second (Q07).
- `find_mods` `tags_any` also matches indirect-property rows (tags is an index), requiring manual filtering (Q20).
- `passive_tree` output is huge with no server-side filter; node filtering done externally (Q21).
- FTS search over-matches (tooltip and labels) versus description-only matching (Q12).
- Hidden-mod / no-tooltip rows (Q02, Q03) are not distinguished from visible ones; ailment id 39 not resolved to a name in the set-bonus output (Q03).

### Skill text errors / omissions
- SKILL.md claims tier 1 is the best affix tier; data shows the highest tier number (T8) has the highest rolls (Q26).
- Damage array order [phys,fire,cold,lightning,necrotic,void,poison] appears only in docs/data-sources/enums.md, not in SKILL.md (Q05, Q06).
- Passive-tree `requires` string format `node>=points` is undocumented (Q10).
- SKILL.md says passive_tree `class_id` is numeric 0-4, yet the class name "Rogue" works (Q11); weaver nodes live in tree_nodes with tree_id "weaver", not documented (Q12).

### Data quirks
- Hidden mod property_name sentence says every 3s while the tooltip says 5s (Q02).
- Exposed Flesh has poison base damage but deals_damage=0, so inclusion in "poison ailments" is ambiguous (Q14; the ground truth includes it).
- Tier 7/8 values look high versus T1-T5 (exalted/special tiers) (Q18, Q26).
- Penance / Valor Endurance Threshold lines are conditional, making "stat line about" ambiguous (Q21).
- Percent mods stored as fractions; "more" modifier_type encoded as 2.

## Recommended fixes (ranked by impact)
1. Fix the cmd.exe quoting problem: have `mcp:call` accept `--file`/stdin JSON or base64 args, or document a quoting recipe. It silently returns wrong rows for `<`, which is the most dangerous failure.
2. Correct the SKILL.md statement that tier 1 is the best affix tier (data shows highest-numbered tier is best, with special exalted tiers).
3. Extend `get ability` to return component damage (named per damage type), ailment applications, and a computed cooldown.
4. Extend `get affix` to include can_roll_on base types.
5. Add server-side filters to `passive_tree` (by stat/property/description text) and a description-only text search for tree nodes.
6. Move the damage array order, the `requires` "node>=points" syntax, and the weaver tree_id convention into SKILL.md.
7. Make `find_mods` tags filtering exclude indirect-property rows, or expose a flag.
8. Make `yarn -s`/quiet and compact JSON output the default for `mcp:call`.
9. Flag hidden (no-tooltip) mods and resolve special_tag/ailment ids to names in unique and set outputs.
10. Harden the suite: add harder questions (multi-hop, conditional-mod ambiguity) since 30/30 with ~1.6 calls each shows little headroom.

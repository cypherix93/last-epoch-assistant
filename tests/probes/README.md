# Probe suite: 30 data questions with SQL ground truth

A regression artifact for the whole stack (database build, `le-data` MCP server and CLI, skills, knowledge base). Each question is something a player or an agent would ask ("what does unique X do", "which nodes need Y", "what is the ward decay formula"); its expected answer is computed by SQL against `data/le.sqlite` or quoted from a `knowledge/` page, so the suite can be re-verified after every data refresh or code change.

## Files

| File | What it is |
|---|---|
| `questions.json` | The 30 questions. Fields: `id, question, category, expected{answer, tolerance}, ground_truth_sql, ground_truth_source, evidence, evidence_total_rows, name_uniqueness_checks, tables_joined, requires_join, hints_for_grader`. |
| `make-questions.js` | Generates `questions.json` by running SQL read-only against the database, and verifies it (`--verify`). |
| `runs/agent-1.json` .. `agent-4.json` | Transcripts of the first graded run: four sonnet agents, about 8 questions each, answering through `yarn mcp:call`. Each entry: `id, answer, reasoning, tool_calls[], confidence, problems[]`. |
| `grades.json` | Per-question verdicts for that run (`pass` / `partial` / `fail`, score, expected vs given, note). |
| `REPORT.md` | The grading report of that run: 30/30, per-category pass rate and tool calls, problems the agents reported, ranked fixes. |

Categories: name_lookup 4, abilities 4, trees 4, ailments 4, aggregate_mods 5, world 3, cross_cutting 3, knowledge 3. 21 of 30 need a join across 2+ tables; Q28 and Q30 are answered from `knowledge/` page text (`ground_truth_source` holds the file and verbatim quotes), Q29 has both a page and a cross-check SQL.

The run in `runs/` predates the CLI and server fixes that followed it: most of the "Recommended fixes" in `REPORT.md` (stdin / `@file` CLI args, compact output, `decoded` ability components, `cooldown_seconds`, tree `filter`/`compact`, `find_mods` `include_indirect`, `special_tag_name`, skill text on tiers and `requires`) have since landed. Item 10 (harder questions) is still open.

## Re-running

1. Build the database: `yarn db:build` (the script reads `data/le.sqlite`).
2. Verify the recorded ground truth still holds:

   ```bash
   yarn probes:verify            # = node tests/probes/make-questions.js --verify
   ```

   It re-executes every `ground_truth_sql`, compares the rows with the recorded `evidence` and `evidence_total_rows`, recomputes `expected.answer`, re-runs the name-uniqueness checks and checks the knowledge-page quotes. It prints `ALL 30 VERIFIED` and exits 0, or lists each `FAIL` and exits 1.
3. After a game patch or a loader change that makes `--verify` fail, inspect the failures, adjust the affected question specs in `make-questions.js` if the change is legitimate, then regenerate:

   ```bash
   node tests/probes/make-questions.js      # rewrites tests/probes/questions.json
   ```

   Regeneration is deterministic (same database, byte-identical `questions.json`). Commit the regenerated file together with the data or code change that required it.

Paths: the repo root is `../..` relative to the script (override with `LE_WORKTREE`, for example to verify another worktree); the database is `<root>/data/le.sqlite` (override with `LE_DB`, or `LE_DB_PATH` as for the MCP server). `better-sqlite3` is loaded from the repo's own `node_modules` (run `yarn install` first).

## Running test agents

- Give each agent ONLY the `question` text (several questions per agent is fine; the first run used four agents with 7-8 questions each) and access to the data: the `le-data` MCP server, or the CLI (`yarn mcp:call <tool> ...` from the repo root) plus the project skills. Never show `expected`, the SQL, the evidence or the hints.
- Ask for a JSON array with one object per question: `{id, answer, reasoning, tool_calls: [{tool, args, result_summary}], confidence, problems: []}`. `problems` (tool errors, confusing skill text, data quirks) is the most useful signal for improving the tooling. Save the arrays as `runs/agent-N.json`.

## Grading

Score each question 1 (pass), 0.5 (partial, only where noted) or 0 (fail). `expected.tolerance` selects the rule:

| tolerance | pass |
|---|---|
| `exact` (case-insensitive) | the final answer states the expected value; extra explanation is allowed; a different value as the final claim fails. |
| `numeric +/-1%` / numeric fields | the stated number is within 1% of expected. Percent and fraction are equivalent (0.96 == 96%). Units must not contradict. |
| `set-equality` | the set of items equals the expected set (names compared case- and punctuation-insensitively, curly and straight apostrophes equal; order irrelevant). Sets of up to 15 items: 1 missing and 0 extra = partial. Q25 / Q27 (large sets) and Q14 follow their own tolerance string. |
| `contains` | the expected text or meaning appears in the answer (paraphrase accepted when meaning and numbers match). |
| `multi-field` | `expected.answer` is an object or list; every field is checked with the rule named in the tolerance string. Pass = all fields correct; partial = at least half correct and none contradicted. |

Common rules:
- Names were checked unique (`name_uniqueness_checks`). For abilities with non-player duplicates (Fireball), the expected value is the player skill.
- The database stores percentages as fractions (0.1 = 10%); accept either representation.
- `hints_for_grader` lists accepted alternative phrasings and known near-miss errors; it overrides the generic rule where it is more specific.
- Knowledge questions (Q28-Q30) require the constants; citing the page is preferred but not required. Superseded or guide-only values named in the hints are wrong.
- Hallucination check: a correct answer that contradicts the evidence elsewhere (for example invents extra set members) is capped at partial.
- An LLM judge works well: "Given QUESTION, EXPECTED (answer + tolerance), HINTS and the AGENT ANSWER, return pass/partial/fail and one sentence." Record verdicts in `grades.json` (`id, verdict, score, expected, given, note`).

Report the pass rate per category plus mean tool calls per question, and always run `yarn probes:verify` first so the database version has not drifted (`meta.game_version` / `data_version` in `le.sqlite`).

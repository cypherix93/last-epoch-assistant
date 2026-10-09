# last-epoch-assistant

A personal Last Epoch (ARPG, game 1.5.x) theorycrafting toolkit: it downloads community game data (LE Tools + Maxroll), normalizes it into a local SQLite database, exposes that database to Claude through the `le-data` MCP server (stdio), and backs it with a confidence-labelled markdown knowledge base and six project skills. Private use; the game data belongs to EHG (see README.md).

## For agents: where to look first

Answering a game question: load the matching skill (`.claude/skills/README.md` lists them and the order), call `version` to pin the data, resolve names with `lookup` (always with `kinds`), read records with `get` / `find_mods` / `sql`, and take every formula from `knowledge/` (index: `knowledge/README.md`) with its confidence label. Never answer from memory. Changing code: read `docs/schema.md` (tables, views), `docs/loader-contract.md` (how loaders are written), `docs/data-sources/` (raw record shapes, enums, ids) and the tests next to the code (`packages/*/src/**/*.test.ts`). Regression checks: `yarn test`, `yarn probes:verify` and `yarn skills:check`.

## Layout

```
packages/
  fetch/   @le/fetch  download LE Tools + Maxroll data to data/raw/<version>/
  db/      @le/db     normalize raw JSON into data/le.sqlite (better-sqlite3, FTS5; 62 tables, unified `mods`)
  mcp/     @le/mcp    MCP server "le-data" over the db (@modelcontextprotocol/sdk, stdio) + CLI
data/
  raw/<ver>/          raw downloads per game version (committed); raw/CURRENT = latest version string
  le.sqlite           generated database (gitignored)
  le.build-report.json, crosscheck-report.json   build reports (committed, from a full build)
knowledge/            markdown knowledge base: mechanics/ (formulas), reference/, interactions/
tests/probes/         30-question probe suite (SQL ground truth, agent runs, grades)
tests/skill-probes/   evidence from the skill test runs (pre-fix outputs + feedback)
vendor/               vendored third-party research (lastepochbuilder, game 1.5.0) and text corpus
docs/                 data-source study, schema.md, loader-contract.md
.claude/skills/       project skills (le-*) + README
```

## Commands

- `yarn install` - install dependencies
- `yarn build` - `tsc -b` across all packages
- `yarn typecheck` - `tsc -b --noEmit`
- `yarn test` - vitest (the db and mcp suites need the built database; they skip with a warning without it)
- `yarn fetch` - download raw game data (`--source letools|maxroll`, `--force`, `--version 150`)
- `yarn db:build` - build `data/le.sqlite` from `data/raw/CURRENT`. Flags: `--only <steps|none>` (steps `world,items,skills,search,crosscheck`, comma separated, repeatable; `none` = schema + meta only), `--version <folder>`, `--out <path>` (default `data/le.sqlite`), `--report <path>` / `--no-report` (write neither the build nor the crosscheck report), `--allow-stubs`, `--quiet`. `LE_DB_ALLOW_STUBS=1` (same as `--allow-stubs`) skips loaders that still throw "not implemented" (status `stub`) instead of failing. Exit 1 when a step fails or an expected count does not match.
- `yarn setup` - `yarn fetch && yarn db:build`
- `yarn mcp` - start the MCP server on stdio
- `yarn mcp:list` - list the server's tools with their input schemas (one line per argument; `--json` for the raw list)
- `yarn mcp:call <tool> [args] [--pretty]` - call one tool from the shell (see below)
- `yarn probes:verify` - re-run the probe suite's ground truth (`node tests/probes/make-questions.js --verify`); prints `ALL 30 VERIFIED`
- `yarn skills:check` - run every tool-call and SQL example in `.claude/skills/**/*.md` against `data/le.sqlite` (`tests/skill-examples/runner.mts`); must report `BAD/ZERO 0`

## MCP server

`@le/mcp` is an MCP server named `le-data` (stdio) over `data/le.sqlite` (build it first with `yarn db:build`; override the path with `LE_DB_PATH`).

- Enable in Claude Code: the repo-root `.mcp.json` registers it as `node --import tsx packages/mcp/src/cli.ts start` (plain `node` + tsx, no build and no `yarn`/`cmd /c` wrapper, so it works from a direct spawn on Windows). Approve the project server when prompted, then run `/mcp` to check that it is connected (enable it there if it is listed as disabled). Tools appear as `mcp__le-data__<tool>`.
- Tools: `version`, `schema`, `search`, `get`, `lookup`, `find_mods`, `skill_tree`, `passive_tree`, `sql` (read-only SELECT/WITH, plus `PRAGMA table_list`, `PRAGMA table_info(<t>)`, `PRAGMA index_list(<t>)`), `knowledge`. Every response has `ok: true` or `{ok:false,error}`. Argument shapes: `.claude/skills/README.md`.
- CLI fallback (no MCP): `yarn mcp:call <tool> [args]`. Only the JSON result goes to stdout (single line; add `--pretty` to indent), logs go to stderr, exit code 1 on `ok:false`. Do NOT use `yarn -s` (not valid in yarn berry; it is not needed). Three ways to pass args, first match wins:
  1. `@path/to/args.json` reads the JSON args from a file (for `sql`, a file that does not start with `{` is raw SQL); `sql --query-file <path>` reads raw SQL from a file.
  2. stdin: `-`, or no args argument with piped stdin. For `sql`, stdin text that does not start with `{` is raw SQL and is wrapped as `{query}`.
  3. inline JSON, only for simple args: `yarn mcp:call lookup '{"name":"Fireball"}'`, `yarn mcp:call skill_tree '{"ability_id":"fi9","filter":"ignite","compact":true}'`.
  - Use 1 or 2 for anything containing shell-special characters (`<`, `>`, `%`, `&`, `|`, parentheses: yarn runs scripts through cmd.exe on Windows, which mangles them, sometimes silently) and for anything containing a single quote (every SQL string literal, names like "Naga's Fang"). Writing the args to a file is the most robust form.
  - Bash: `printf '%s' '{"name":"Calamity","kinds":["unique"]}' | yarn mcp:call lookup`, or `echo "select name from uniques where name like '%Claim%' and unique_id > 0" | yarn mcp:call sql`.
  - PowerShell: `@'` + newline + `select name from uniques where name like '%Claim%' and unique_id > 0` + newline + `'@ | yarn mcp:call sql` (single-quoted here-string, closing `'@` at column 0; JSON works too).
- Source layout: `packages/mcp/src/{context,get,tools,server,cli,index}.ts`; tests in `index.test.ts`.

## Skills

Recommended order (details and the tool quick reference: `.claude/skills/README.md`):

1. `le-mechanics-reference` - which knowledge page and section answers which question, confidence labels, 25 constants.
2. `le-data-query` - MCP tools and CLI forms, name resolution, the `mods` table, tag bits, property ids, SQL patterns, gotchas.
3. `le-damage-reasoning` - step-by-step skill damage estimate (buckets, tags, crit, penetration, ailments, "cannot be determined").
4. `le-defense-reasoning` - survivability: resistances vs area penetration, armour/dodge/block, endurance, ward, EHP vs reference hits.
5. `le-build-audit` - full sourced audit of a complete build with a ranked fix list.
6. `le-build-around-item` - design a build around a dropped item ("I dropped X, build around it").

## Knowledge base

`knowledge/README.md` is the index: confidence legend (D decompiled, A asset, G guide, X community, U unverified), source priority, and one line per page. `knowledge/mechanics/` holds the formulas, `knowledge/reference/` the game systems, `knowledge/interactions/` the interaction catalogue and the unique-effects index. Quote the label with every number.

## Data refresh after a patch

```
yarn fetch            # LE Tools + Maxroll -> data/raw/<ver>/, rewrites sources.lock.json and data/raw/CURRENT
yarn db:build         # rebuild data/le.sqlite and the two reports
yarn probes:verify    # ground truth still holds; then yarn test
```

- `<ver>` is derived from LE Tools (`version152` -> `1.5.2`). A new folder appears only when LE Tools bumps its data version; Maxroll data is stored in the same folder and overwritten in place when its hash changes (it has no history).
- Changed files: `data/raw/<ver>/letools/<Global>.json` (one per global, plus `i18n.en.json`), `data/raw/<ver>/maxroll/data.json`, `data/raw/<ver>/sources.lock.json` (URLs, sha256, bytes, globals, Maxroll hash/ETag/Last-Modified), `data/raw/CURRENT`. Review with `git diff --stat data/raw`.
- Re-running with nothing new is a no-op (git status unchanged).
- If `probes:verify` fails because the data legitimately changed, update the question spec in `tests/probes/make-questions.js` and regenerate with `node tests/probes/make-questions.js`.

## Conventions

- Never commit `data/le.sqlite` (gitignored; it is rebuilt from `data/raw`).
- Commit `data/le.build-report.json` and `data/crosscheck-report.json` only from a full `yarn db:build` (no `--only`, no `--out`); after a partial build, `git checkout -- data/le.build-report.json data/crosscheck-report.json`.
- Raw data lives in one folder per game version (`data/raw/<ver>/`); commit a refresh as its own commit.
- Determinism: the same raw data gives the same database contents and byte-identical reports, and `tests/probes/questions.json` regenerates byte-identically. Keep it that way (stable ordering, no timestamps in committed outputs).
- Parallel work goes in git worktrees (one branch per unit, merged into the integration branch); each worktree needs its own `yarn install` and `yarn db:build`.
- Skills and knowledge pages cite sources as `table + id` or `page#section`; every example query or tool call in a skill must run against the current database.

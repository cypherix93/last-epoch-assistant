# last-epoch-assistant

A personal Last Epoch (ARPG) theorycrafting assistant for Claude Code. It downloads community game data, normalizes it into a local SQLite database, serves that database to Claude through an MCP server, and adds a formula-first knowledge base plus six skills that teach Claude how to answer build, damage, defense and "build around this item" questions with sourced, confidence-labelled numbers.

**Private, personal use.** The game data belongs to Eleventh Hour Games (EHG). It is read from community sources (Last Epoch Tools, Maxroll) and from vendored community research; the vendored code is MIT, but the extracted data and text are not covered by that licence (see `vendor/lastepochbuilder/VENDOR.md` and `vendor/corpus/VENDOR.md`). Do not redistribute the data, the database or the knowledge pages built from them.

## Quickstart

Requirements: Node.js 22+, Yarn 4 (via Corepack), Git Bash on Windows for the CLI examples.

```bash
yarn install
yarn setup          # yarn fetch (download data) + yarn db:build (build data/le.sqlite)
```

`data/raw/1.5.2/` is committed, so `yarn db:build` alone also works offline.

Then open the repo in Claude Code, approve the project MCP server `le-data` when prompted (it is registered in `.mcp.json`), and check it with `/mcp`. Try:

> I dropped Ignivar's Head, build around it.

That triggers the `le-build-around-item` skill: Claude resolves the item, reads its coded effect, proposes at least five archetypes, scores them and writes one or two build skeletons with in-game tests. Other prompts that work well: "audit this build: ...", "how much damage does Fireball do with ...", "why do I die in 300 corruption monoliths?", "what does Calamity do?".

Without MCP, every tool is also reachable from the shell: `yarn mcp:call lookup '{"name":"Calamity","kinds":["unique"]}'` (see CLAUDE.md for the argument forms).

## Layout

```
packages/
  fetch/      @le/fetch  download LE Tools + Maxroll data to data/raw/<version>/
  db/         @le/db     build data/le.sqlite (70 tables, unified `mods` table, FTS5 `search`)
  mcp/        @le/mcp    MCP server "le-data" (10 tools) + CLI (yarn mcp:call / mcp:list)
data/
  raw/<ver>/            raw downloads per game version (committed), raw/CURRENT = latest
  le.sqlite             generated database (gitignored)
  le.build-report.json  build report (committed, from a full build)
  crosscheck-report.json  LE Tools vs Maxroll cross-check (committed, from a full build)
knowledge/
  mechanics/            8 formula pages (damage, defenses, ailments, ward/sustain, speed/mana, minions, enemies, stat model)
  reference/            8 reference pages (classes, items, uniques/sets, idols/blessings, crafting, skills/trees, endgame, glossary)
  interactions/         catalogue of 117 unintuitive interactions + index of every unique's special effect
.claude/skills/         6 skills (le-*) + README with the tool quick reference
tests/
  probes/               30-question probe suite with SQL ground truth, agent runs, grades, report
  skill-probes/         evidence from the skill test runs (task outputs + feedback)
vendor/
  lastepochbuilder/     weksil/LastEpochBuilder research (1.5.0 decompiled formulas, asset dumps)
  corpus/               plain-text captures of community pages cited by the knowledge base
docs/
  data-sources/         schema study of the LE Tools and Maxroll data (record shapes, enums, id spaces)
  schema.md             database tables and views;  loader-contract.md  how loaders are written
CLAUDE.md               instructions for agents working in this repo
.mcp.json               registers the le-data MCP server for Claude Code
```

## Where the data comes from

- **Last Epoch Tools** (lastepochtools.com), data version `version152` = game **1.5.2**: items, affixes, uniques, sets, abilities, skill and passive trees, Weaver tree, monster mods, timelines, i18n. This is the primary source.
- **Maxroll** (assets-ng.maxroll.gg planner data): a second view of the same game data, used to fill gaps and cross-check (`data/crosscheck-report.json`).
- **Vendored research** (`vendor/lastepochbuilder/`, weksil/LastEpochBuilder at a pinned commit, targeting game **1.5.0**): decompiled formulas, asset tables (ward decay, armour, monster scaling, skill-node effect types, unique effect models). The knowledge base cites it with the **D** (decompiled) and **A** (asset) labels.
- `vendor/corpus/`: captures of the in-game guide, patch notes and Maxroll/forum pages, cited as **G** or **X**.

Details: `docs/data-sources/README.md`, `data/raw/<ver>/sources.lock.json` (URLs, hashes, sizes).

## Knowledge base and skills

`knowledge/` is the prose half: every formula and constant carries a confidence label (**D** decompiled, **A** asset data, **G** official guide, **X** community-verified, **U** unverified) and a source; `knowledge/README.md` is the index. The database is the data half: every stat line from every source (affix tier, unique, implicit, tree node, blessing, ailment, monster mod) is one row of the `mods` table.

The skills in `.claude/skills/` teach Claude to use both, in this order:

1. `le-mechanics-reference`: which page answers which question, labels, 25 constants.
2. `le-data-query`: tools, name resolution, the `mods` table, tag bits, SQL patterns, gotchas.
3. `le-damage-reasoning` / `le-defense-reasoning`: step-by-step damage and survivability estimates.
4. `le-build-audit`: a full sourced audit of a complete build with a ranked fix list.
5. `le-build-around-item`: design a build around a dropped item.

## Test results

- `yarn test`: vitest suites for fetch, db and mcp (the db and mcp suites run against the real built database).
- **Probe suite** (`tests/probes/`): 30 questions across name lookups, abilities, trees, ailments, mod aggregates, world data, cross-cutting joins and knowledge pages, each with SQL or page-quote ground truth. Four sonnet agents answered through the CLI: **30/30 pass**. `yarn probes:verify` re-checks the ground truth against the current database.
- **Skill probes** (`tests/skill-probes/`): each of the six skills exercised on a fresh task (mechanics lookups, a data query, a Fireball damage estimate, a monolith defense assessment, a partial build audit, an Ignivar's Head build) with zero command failures. The agents' 38 suggested skill edits were checked against the database and the knowledge pages and applied (one only in part: affix 644 is a genuine two-line affix, not a mislabelled one); every example in the six skills runs against the current database.

## After a game patch

```bash
yarn fetch            # new data/raw/<ver>/ when LE Tools bumps its data version (Maxroll refreshed in place)
yarn db:build         # rebuild data/le.sqlite and the build / crosscheck reports
yarn probes:verify    # ground truth still holds? (then yarn test)
```

Review `git diff --stat data/raw data/*.json`, commit the raw refresh as its own commit, and regenerate `tests/probes/questions.json` (`node tests/probes/make-questions.js`) only if a verified change in the data explains a probe failure.

## Current limitations

- **Skill-node mutators are display-only.** Tree-node stat lines carry text and a magnitude but no modifier type (`modifier_type` NULL), and skill-local properties (ids 5000+) have no generic meaning; their real effect is per-skill code. The skills say "type not in data" and give bounds rather than guess.
- **No damage simulator.** Damage, EHP and sustain are computed by Claude following the skills' procedures, not by an engine; results are estimates with labels, not measured DPS.
- **Version skew.** The vendored research (formulas, unique effect models) is from game 1.5.0, the data from 1.5.2. Most formulas are stable across the two, but a changed unique or node can disagree; the data wins for numbers.
- **Maxroll has no history.** Its data is overwritten in place when its hash changes, so older Maxroll snapshots are only in git history.
- Unique and set special effects (SP 98 / SP 58 properties) are pointers to coded effects; only those described in `knowledge/interactions/` are modelled.

## Roadmap ideas

- A build calculator: sum a build's `mods` rows through the damage and defense pipelines in code, using the knowledge-base formulas, so skills can call it instead of doing arithmetic by hand.
- Planner import: decode LE Tools build links through the compact ids (`compact_ids` table, `letools_compact_id` columns) so a user can paste a planner URL instead of describing the build.
- An own .NET extractor reading the game's assets directly, used as an independent verifier of the community data and of the vendored 1.5.0 research.

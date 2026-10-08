# last-epoch-assistant

A Last Epoch (ARPG) game-data toolkit. It downloads community game data, normalizes it into a local SQLite database, and exposes that database to Claude through an MCP server (stdio), backed by a markdown knowledge base.

## Layout

```
packages/
  fetch/   @le/fetch  - download community game data to data/raw/<version>/
  db/      @le/db     - normalize raw JSON into data/le.sqlite (better-sqlite3, FTS5)
  mcp/     @le/mcp    - MCP server over the SQLite db (@modelcontextprotocol/sdk, stdio)
data/
  raw/                - raw downloads per game version (committed)
  le.sqlite           - generated database (gitignored)
knowledge/            - markdown knowledge base
vendor/               - vendored third-party research
docs/                 - documentation
.claude/skills/       - project skills
```

## Commands

- `yarn install` - install dependencies
- `yarn build` - tsc -b across all packages
- `yarn test` - vitest run
- `yarn typecheck` - tsc -b --noEmit
- `yarn fetch` - download raw game data
- `yarn db:build` - build data/le.sqlite from data/raw
- `yarn setup` - fetch, then db:build
- `yarn mcp` - start the MCP server (stdio)
- `yarn mcp:call` - call an MCP tool from the CLI

## MCP server

`@le/mcp` is an MCP server named `le-data` (stdio) over `data/le.sqlite` (build it first with `yarn db:build`; override the path with `LE_DB_PATH`).

- Enable in Claude Code: the repo-root `.mcp.json` registers it as `node --import tsx packages/mcp/src/cli.ts start` (plain `node` + tsx, no build and no `yarn`/`cmd /c` wrapper, so it works from a direct spawn on Windows). Approve the project server when prompted, then check `/mcp`. Tools appear as `mcp__le-data__<tool>`.
- Tools: `version`, `schema`, `search`, `get`, `lookup`, `find_mods`, `skill_tree`, `passive_tree`, `sql` (read-only SELECT/WITH), `knowledge`. Every response has `ok: true` or `{ok:false,error}`.
- CLI fallback (no MCP): `yarn mcp:call lookup '{"name":"Fireball"}'`, `yarn mcp:call find_mods '{"filters":{"property_name":"ward","tags_any":["Minion"]}}'`. PowerShell: wrap the JSON in a here-string or escape the inner quotes.
- Source layout: `packages/mcp/src/{context,get,tools,server,cli,index}.ts`; tests need the built database and skip with a warning without it.

## Data refresh after a patch

After a Last Epoch patch:

```
yarn fetch            # LE Tools + Maxroll -> data/raw/<ver>/, rewrites sources.lock.json and data/raw/CURRENT
yarn db:build         # rebuild data/le.sqlite
```

- `<ver>` is derived from LE Tools (`version152` -> `1.5.2`). A new folder appears only when LE Tools bumps its data version; Maxroll data is stored in the same folder and overwritten in place when its hash changes (it has no history).
- `data/raw/<ver>/letools/<Global>.json` (one per global from the LE Tools data scripts, plus `i18n.en.json`), `data/raw/<ver>/maxroll/data.json`, `data/raw/<ver>/sources.lock.json` (URLs, sha256, bytes, globals, Maxroll hash/ETag/Last-Modified) and `data/raw/CURRENT` (latest version string) change. Review with `git diff --stat data/raw`.
- Re-running with nothing new is a no-op (git status unchanged). Options: `--source letools|maxroll`, `--force`, `--version 150` (LE Tools only; needs a lockfile for that version; Maxroll skipped).
- Raw data is committed; commit the refresh as its own commit.

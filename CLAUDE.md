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

## Data refresh after a patch

(to be completed)

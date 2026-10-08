import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createContext, ToolError, type Ctx, type Row } from "./context.js";
import * as t from "./tools.js";

export const SERVER_NAME = "le-data";

const idSchema = z.union([z.string(), z.number(), z.record(z.union([z.string(), z.number()]))]);
const tagItem = z.union([z.string(), z.number()]);

export interface ToolDef {
  name: string;
  description: string;
  shape: z.ZodRawShape;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run: (ctx: Ctx, args: any) => Row;
}

export const TOOL_DEFS: ToolDef[] = [
  {
    name: "version",
    description: "Game/data version and build provenance (all rows of the `meta` table).",
    shape: {},
    run: (ctx) => t.version(ctx),
  },
  {
    name: "schema",
    description:
      "Without `table`: all tables and views with row counts and purpose. With `table`: its columns (name, type, comment) and 3 sample rows. See also docs/schema.md.",
    shape: { table: z.string().optional().describe("table or view name") },
    run: (ctx, a) => t.schema(ctx, a.table),
  },
  {
    name: "search",
    description:
      'Full-text search (FTS5) over names, descriptions, tooltips and mod labels. Returns kind, id, name, snippet (<b> markers), rank. Supports "phrases", prefix*, and name:term to restrict to the name column.',
    shape: {
      query: z.string(),
      kinds: z.array(z.string()).optional().describe("filter, e.g. [unique, ability]"),
      limit: z.number().int().min(1).max(200).default(20),
    },
    run: (ctx, a) => t.search(ctx, a.query, a.kinds, a.limit ?? 20),
  },
  {
    name: "get",
    description: `Full normalized record for one entity with its children (mods, tooltips, tiers, ...). Kinds: ${t.KINDS.join(", ")}. id is the natural key (unique_id, affix_id, "base:sub", ability id "fi9", tree id "mg-1", node "tree:node", class 0-4 or name).`,
    shape: { kind: z.string(), id: idSchema, include_raw: z.boolean().default(false) },
    run: (ctx, a) => t.getTool(ctx, a.kind, a.id, a.include_raw ?? false),
  },
  {
    name: "lookup",
    description:
      "Resolve a name to ids: exact (case-insensitive) matches first, then prefix, then FTS. Returns [{kind, id, name, score, hint}]. Player abilities rank above minion abilities.",
    shape: { name: z.string(), kinds: z.array(z.string()).optional(), limit: z.number().int().min(1).max(100).default(10) },
    run: (ctx, a) => t.lookup(ctx, a.name, a.kinds, a.limit ?? 10),
  },
  {
    name: "find_mods",
    description:
      "Find stat lines (mods table) across all sources with the source name resolved. filters: property (SP id), property_name (substring), tags_any / tags_all (tag names like Minion, Fire, or integer bits), include_untagged (default true: tags_any also returns tags=0 rows), modifier_type (0 added, 1 increased, 2 more, null display-only), source_kinds, source_id, min_value (value_max >=), special_tag.",
    shape: {
      filters: z
        .object({
          property: z.number().int().optional(),
          property_name: z.string().optional(),
          tags_any: z.array(tagItem).optional(),
          tags_all: z.array(tagItem).optional(),
          include_untagged: z.boolean().optional(),
          modifier_type: z.number().int().min(0).max(2).nullable().optional(),
          source_kinds: z.array(z.string()).optional(),
          source_id: z.union([z.string(), z.number()]).optional(),
          min_value: z.number().optional(),
          special_tag: z.number().int().optional(),
        })
        .default({}),
      limit: z.number().int().min(1).max(2000).default(100),
    },
    run: (ctx, a) => t.findMods(ctx, a.filters ?? {}, a.limit ?? 100),
  },
  {
    name: "skill_tree",
    description:
      "A skill tree: tree row + every node (name, description, max_points, mastery fields, x/y, mods, requires edges). Accepts an ability id (fi9) or a tree id.",
    shape: { ability_id: z.string() },
    run: (ctx, a) => t.skillTree(ctx, a.ability_id),
  },
  {
    name: "passive_tree",
    description:
      "A class passive tree with all nodes, mods, requirements and mastery grouping fields. class_id: 0 Primalist, 1 Mage, 2 Sentinel, 3 Acolyte, 4 Rogue, a class name, or a tree id (mg-1, weaver).",
    shape: { class_id: z.union([z.number(), z.string()]) },
    run: (ctx, a) => t.passiveTree(ctx, a.class_id),
  },
  {
    name: "sql",
    description:
      "Read-only SQL: a single SELECT or WITH statement. Returns {columns, rows, truncated}. No time limit: keep queries selective. Use the schema tool for tables.",
    shape: { query: z.string(), params: z.array(z.any()).optional(), limit: z.number().int().min(1).max(5000).default(500) },
    run: (ctx, a) => t.sql(ctx, a.query, a.params ?? [], a.limit ?? 500),
  },
  {
    name: "knowledge",
    description:
      "Without `page`: list knowledge/**/*.md and .claude/skills/*/SKILL.md (path, title, lines). With `page`: its text (repo-relative path, or a unique basename such as damage-pipeline.md).",
    shape: { page: z.string().optional() },
    run: (ctx, a) => t.knowledge(ctx, a.page),
  },
];

function text(obj: unknown, isError = false) {
  return { content: [{ type: "text" as const, text: JSON.stringify(obj) }], ...(isError ? { isError: true } : {}) };
}

/** Run a tool and wrap the outcome in the {ok} envelope. */
export function runTool(ctx: Ctx, def: ToolDef, args: unknown): { ok: boolean; [k: string]: unknown } {
  try {
    return { ok: true, ...def.run(ctx, args ?? {}) };
  } catch (e) {
    const msg = e instanceof ToolError ? e.message : `${(e as Error).name}: ${(e as Error).message}`;
    return { ok: false, error: msg };
  }
}

export function createServer(dbPath?: string): McpServer {
  const ctx = createContext(dbPath);
  const server = new McpServer({ name: SERVER_NAME, version: "0.1.0" });
  for (const def of TOOL_DEFS) {
    server.registerTool(def.name, { description: def.description, inputSchema: def.shape }, async (args: unknown) => {
      const res = runTool(ctx, def, args);
      return text(res, !res.ok);
    });
  }
  return server;
}

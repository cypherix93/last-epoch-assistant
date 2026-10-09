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
      'Full-text search (FTS5) over names, descriptions, tooltips and mod labels. Returns kind, id, name, snippet (<b> markers), rank. Default input is safe-quoted: "phrases", prefix*, and name:term (name column) work, but the words OR, AND, NOT and NEAR are ordinary terms. Pass raw=true to send the MATCH expression to FTS5 unchanged (e.g. fire OR cold, NEAR(void penetration, 5), name:ward*); a syntax error is returned as a tool error. Columns: name, text.',
    shape: {
      query: z.string(),
      kinds: z.array(z.string()).optional().describe("filter, e.g. [unique, ability]"),
      limit: z.number().int().min(1).max(200).default(20),
      raw: z.boolean().default(false).describe("pass query to FTS5 MATCH unchanged (OR, NEAR, parentheses); default false = safe-quoted"),
    },
    run: (ctx, a) => t.search(ctx, a.query, a.kinds, a.limit ?? 20, a.raw ?? false),
  },
  {
    name: "get",
    description: `Full normalized record for one entity with its children (mods, tooltips, tiers, ...). Kinds: ${t.KINDS.join(", ")}. id is the natural key (unique_id, affix_id, "base:sub", ability id "fi9", tree id "mg-1", node "tree:node", class 0-4 or name). An ability reply has kind (player | player_sub | minion | other) and, for a player skill, sub_abilities (the abilities it spawns, with their decoded damage components; the skill's own hit damage is often there).`,
    shape: { kind: z.string(), id: idSchema, include_raw: z.boolean().default(false) },
    run: (ctx, a) => t.getTool(ctx, a.kind, a.id, a.include_raw ?? false),
  },
  {
    name: "lookup",
    description:
      "Resolve a name to ids: exact (case-insensitive) matches first, then prefix, then FTS. Returns [{kind, id, name, score, hint}]. Player abilities rank above same-named sub-abilities, minion and other abilities; ability rows carry ability_kind (player | player_sub | minion | other).",
    shape: { name: z.string(), kinds: z.array(z.string()).optional(), limit: z.number().int().min(1).max(100).default(10) },
    run: (ctx, a) => t.lookup(ctx, a.name, a.kinds, a.limit ?? 10),
  },
  {
    name: "find_mods",
    description:
      "Find stat lines (mods table) across all sources with the source name resolved. filters: property (SP id), property_name (substring), tags_any / tags_all (tag names like Minion, Fire, or integer bits), include_untagged (default true: tags_any also returns tags=0 rows), include_indirect (default false: rows of properties 58/98/104/105/130 store an index, not a tag mask, and are excluded from tag filters), modifier_type (0 added, 1 increased, 2 more, null display-only), source_kinds, source_id, min_value (value_max >=), special_tag.",
    shape: {
      filters: z
        .object({
          property: z.number().int().optional(),
          property_name: z.string().optional(),
          tags_any: z.array(tagItem).optional(),
          tags_all: z.array(tagItem).optional(),
          include_untagged: z.boolean().optional(),
          include_indirect: z.boolean().optional(),
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
      "A skill tree: tree row + every node (name, description, max_points, mastery fields, x/y, mods, requires). unlocked_by is an array of {node_id, node_name, points}: the node can be taken when ANY ONE listed node holds that many points (adjacency, not a list of prerequisites; unlocked_by_text is the compact form, e.g. '2>=2|6>=2' = node 2 with 2 points OR node 6 with 2 points; requires/requires_text are deprecated aliases). Each node stat line carries scales_with_points and scaling (per_point: the value is per point allocated, total = value x points; fixed: no scaling, given once; at_threshold: a lump granted at `threshold` points). Accepts an ability id (fi9) or a tree id. Optional filter (case-insensitive text matched against node name, description, mod label/property_name; keeps only matching nodes) and compact (drop description and x/y).",
    shape: { ability_id: z.string(), filter: z.string().optional(), compact: z.boolean().optional() },
    run: (ctx, a) => t.skillTree(ctx, a.ability_id, { filter: a.filter, compact: a.compact }),
  },
  {
    name: "passive_tree",
    description:
      "A class passive tree with all nodes, mods (with scales_with_points / scaling per stat line), unlocked_by ({node_id,node_name,points}[], ANY ONE of; unlocked_by_text '2>=2|6>=2'; requires/requires_text are deprecated aliases) and mastery grouping fields. class_id: 0 Primalist, 1 Mage, 2 Sentinel, 3 Acolyte, 4 Rogue, a class name, or a tree id (mg-1, weaver). Optional filter (keeps only nodes whose name/description/mod text contains it) and compact (drop description and x/y).",
    shape: { class_id: z.union([z.number(), z.string()]), filter: z.string().optional(), compact: z.boolean().optional() },
    run: (ctx, a) => t.passiveTree(ctx, a.class_id, { filter: a.filter, compact: a.compact }),
  },
  {
    name: "sql",
    description:
      "Read-only SQL: a single SELECT or WITH statement, or one of the schema pragmas PRAGMA table_list, PRAGMA table_info(<table>), PRAGMA index_list(<table>) (every other PRAGMA is rejected). Returns {columns, rows, truncated}. No time limit: keep queries selective. The schema tool also lists tables, columns and sample rows.",
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

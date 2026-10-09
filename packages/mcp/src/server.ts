import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createContext, ToolError, type Ctx, type Row } from "./context.js";
import * as bt from "./builds.js";
import * as t from "./tools.js";

export const SERVER_NAME = "le-data";

const idSchema = z.union([z.string(), z.number(), z.record(z.union([z.string(), z.number()]))]);
const tagItem = z.union([z.string(), z.number()]);
/** A fresh schema per use: a shared instance is emitted as a JSON-schema $ref, which mcp:list shows as "any". */
const strNum = () => z.union([z.string(), z.number()]);
const COMMUNITY =
  "Data: Maxroll community build guides (planner profiles) for game 1.5.2 - community-authored choices, NOT game truth (take mechanics from the game tables and knowledge pages).";
const TAB_DESC = "tab name (case-insensitive: exact, then prefix, then substring; e.g. Endgame, Starter, Aspirational), 'default' (the tab the planner opens on) or 'any'";

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
      "A skill tree: tree row + every node (name, description, max_points, mastery fields, x/y, mods, requires). unlocked_by is an array of {node_id, node_name, points}: the node can be taken when ANY ONE listed node holds that many points (adjacency, not a list of prerequisites; unlocked_by_text is the compact form, e.g. '2>=2|6>=2' = node 2 with 2 points OR node 6 with 2 points; requires/requires_text are deprecated aliases). Each node stat line carries scales_with_points and scaling (per_point: the value is per point allocated, total = value x points; fixed: no scaling, given once; at_threshold: a lump granted at `threshold` points). Accepts an ability id (fi9) or a tree id. Optional filter (case-insensitive text matched against node name, description, mod label/property_name; keeps only matching nodes) and compact (drop x/y; descriptions are kept, truncated to 400 chars, unless keep_descriptions is false). Each stat line also says what it is: property_kind ('stat' = property is an SP id but only the tooltip icon hint, 'tooltip_category' with property_hint, 'ailment' with property_hint, 'display_only'), modifier (added / increased / more) with modifier_source ('structured' = from the decompiled node code, 'inferred' = from the label text) and stat_kind (skill_parameter = a skill-local mechanic, not a stat), code_ref (the matched code effect), and label_mismatch + warning when the line is NOT a plain stat of property_name (read the label).",
    shape: { ability_id: z.string(), filter: z.string().optional(), compact: z.boolean().optional(), keep_descriptions: z.boolean().optional() },
    run: (ctx, a) => t.skillTree(ctx, a.ability_id, { filter: a.filter, compact: a.compact, keep_descriptions: a.keep_descriptions }),
  },
  {
    name: "passive_tree",
    description:
      "A class passive tree with all nodes, mods (with scales_with_points / scaling per stat line), unlocked_by ({node_id,node_name,points}[], ANY ONE of; unlocked_by_text '2>=2|6>=2'; requires/requires_text are deprecated aliases) and mastery grouping fields. class_id: 0 Primalist, 1 Mage, 2 Sentinel, 3 Acolyte, 4 Rogue, a class name, or a tree id (mg-1, weaver). Optional filter (keeps only nodes whose name/description/mod text contains it) and compact (drop x/y; descriptions are kept, truncated to 400 chars, unless keep_descriptions is false). Each stat line also says what it is: property_kind ('stat' = property is an SP id but only the tooltip icon hint, 'tooltip_category' with property_hint, 'ailment' with property_hint, 'display_only'), modifier (added / increased / more) with modifier_source ('structured' = from the decompiled node code, 'inferred' = from the label text) and stat_kind (skill_parameter = a skill-local mechanic, not a stat), code_ref (the matched code effect), and label_mismatch + warning when the line is NOT a plain stat of property_name (read the label).",
    shape: { class_id: z.union([z.number(), z.string()]), filter: z.string().optional(), compact: z.boolean().optional(), keep_descriptions: z.boolean().optional() },
    run: (ctx, a) => t.passiveTree(ctx, a.class_id, { filter: a.filter, compact: a.compact, keep_descriptions: a.keep_descriptions }),
  },
  {
    name: "sql",
    description:
      "Read-only SQL: a single SELECT or WITH statement, or one of the schema pragmas PRAGMA table_list, PRAGMA table_info(<table>), PRAGMA index_list(<table>) (every other PRAGMA is rejected). Returns {columns, rows, truncated}. No time limit: keep queries selective. The schema tool also lists tables, columns and sample rows.",
    shape: { query: z.string(), params: z.array(z.any()).optional(), limit: z.number().int().min(1).max(5000).default(500) },
    run: (ctx, a) => t.sql(ctx, a.query, a.params ?? [], a.limit ?? 500),
  },
  {
    name: "builds",
    description: `List / filter community builds (one row per guide x planner profile). ${COMMUNITY} Filters combine with AND: class, mastery (a leveling guide also matches its card mastery; a base class name matches the whole class), ability (main skill; any_skill=true also matches any specialized skill), item (unique / set name or unique_id, equipped in any tab or in 'tab'), affix (id or name, any tab or 'tab'), tier (letter on the corruption tier list unless tier_list is speed / bossing), playstyle, season (substring). Returns {builds:[{build_id, slug, title, url, author, updated, season, playstyle, class, mastery, main_skill, main_ability_id, tiers:{corruption,speed,bossing}, tabs, is_primary}], count, total_matching}.`,
    shape: {
      class: strNum().optional().describe("class name or id 0-4"),
      mastery: z.string().optional().describe("mastery name, e.g. Void Knight / void-knight"),
      ability: z.string().optional().describe("main skill: ability name or id (es6ai)"),
      any_skill: z.boolean().optional().describe("ability also matches any specialized skill (default false: main skill only)"),
      item: strNum().optional().describe("unique / set item name or unique_id"),
      affix: strNum().optional().describe("affix id or name"),
      tab: z.string().optional().describe(`restrict item / affix / any_skill matching to one tab: ${TAB_DESC} (default any tab)`),
      tier: z.string().optional().describe("tier letter S, A, B, C ..."),
      tier_list: z.enum(["corruption", "speed", "bossing"]).optional().describe("tier list for tier (default corruption)"),
      playstyle: z.string().optional().describe("Endgame | Leveling"),
      season: z.string().optional().describe("substring of the season, e.g. 'Season 5' (default all)"),
      limit: z.number().int().min(1).max(500).default(50),
    },
    run: (ctx, a) => bt.builds(ctx, a),
  },
  {
    name: "build",
    description: `One community build in full, fully named, with numeric ids kept for follow-up get calls. ${COMMUNITY} Returns the build header, the tab, strengths / weaknesses and the sections: gear (per slot: item name, kind, base, implicits, affixes with name / tier / prefix|suffix / origin / roll / rolled values), idols (grid_x / grid_y on the 5x5 altar, size), blessings (timeline + blessing), passives (grouped by mastery: node name, points), skills (specialized / on_bar flags, tree nodes with points), notes (guide and tab notes as plain text).`,
    shape: {
      id: strNum().optional().describe("build_id (from builds, or lookup kind build)"),
      slug: z.string().optional().describe("guide slug, e.g. erasing-strike-void-knight-guide (the guide's primary profile)"),
      tab: z.string().optional().describe(`${TAB_DESC}; default: the default tab (typically Endgame)`),
      sections: z.array(z.enum(bt.BUILD_SECTIONS)).optional().describe("subset of gear, idols, blessings, passives, skills, notes (default all)"),
    },
    run: (ctx, a) => bt.build(ctx, a),
  },
  {
    name: "item_usage",
    description: `Which community builds use a unique / set item, or an affix. ${COMMUNITY} Pass name or unique_id (unique / set item), or affix (id or name) with optional slot. Unique: {item, total_builds, by_slot:{slot: builds}, by_mastery, common_extra_affixes, builds:[{build_id, slug, title, mastery, main_skill, tab, slot, extra_affixes:[{affix_id, name, tier, origin}]}]}. Affix: by_slot:{slot: {builds, items, typical_tier, min_tier, max_tier, origins}} and builds:[{..., slot, item, tier, origin}]. One entry per build (per build and slot for affixes), from its default tab when it is used there.`,
    shape: {
      name: z.string().optional().describe("unique or set item name"),
      unique_id: strNum().optional(),
      affix: strNum().optional().describe("affix id or name (all affixes with that name)"),
      slot: z.string().optional().describe("restrict to a slot: weapon, offhand, head/helmet, body, waist/belt, hands/gloves, feet/boots, neck/amulet, ring/finger1/finger2, relic, altar, idol"),
      tab: z.string().optional().describe(`${TAB_DESC} (default any tab)`),
      class: strNum().optional(),
      mastery: z.string().optional(),
      limit: z.number().int().min(1).max(500).default(100),
    },
    run: (ctx, a) => bt.itemUsage(ctx, a),
  },
  {
    name: "slot_meta",
    description: `What community builds wear in one slot: item distribution and the affixes they roll. ${COMMUNITY} Filters: class, mastery, ability (main skill), tab (default Endgame; builds without such a tab fall back to their default tab and are counted in tab_fallback_builds), kind (unique = unique/legendary/set, rare = rare/exalted/magic, all). Returns {matched_builds, items:[{name, kind, unique_id?, count, pct, example_builds:[slugs]}], affixes:[{affix_id, affix, count, pct, typical_tier, type: prefix|suffix, origins}]}; count = builds.`,
    shape: {
      slot: z.string().describe("weapon, offhand, head/helmet, body/chest, waist/belt, hands/gloves, feet/boots, neck/amulet, ring (both fingers)/finger1/finger2, relic, altar, idol"),
      class: strNum().optional(),
      mastery: z.string().optional(),
      ability: z.string().optional().describe("main skill name or ability id"),
      tab: z.string().optional().describe(`${TAB_DESC} (default Endgame)`),
      kind: z.enum(["unique", "rare", "all"]).default("all"),
      limit: z.number().int().min(1).max(200).default(25).describe("max rows in items and in affixes"),
    },
    run: (ctx, a) => bt.slotMeta(ctx, a),
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

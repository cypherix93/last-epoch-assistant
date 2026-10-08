/** Tool implementations (pure functions over a Ctx; the server wraps them with ok/error envelopes). */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { all, clean, cleanAll, one, tagMask, ToolError, type Ctx, type Row } from "./context.js";
import { classIdOf, dropNulls, getTool, GETTERS, MOD_COLS, modsFor, type Id } from "./get.js";

export { getTool };

const SCHEMA_DOC = "docs/schema.md";

// ---------------------------------------------------------------- version
export function version(ctx: Ctx): Row {
  const meta: Row = {};
  for (const r of all(ctx, "SELECT key, value FROM meta ORDER BY key")) meta[r.key as string] = r.value;
  return { meta, db_path: ctx.dbPath };
}

// ---------------------------------------------------------------- schema
interface SchemaDoc {
  purpose: Map<string, string>;
  columns: Map<string, Map<string, string>>;
}
let schemaDocCache: SchemaDoc | undefined;

/** Parse packages/db/schema.sql: first `--` line above each CREATE, and trailing column comments. */
function schemaDoc(ctx: Ctx): SchemaDoc {
  if (schemaDocCache) return schemaDocCache;
  const doc: SchemaDoc = { purpose: new Map(), columns: new Map() };
  const path = join(ctx.repoRoot, "packages", "db", "schema.sql");
  if (existsSync(path)) {
    const lines = readFileSync(path, "utf8").split(/\r?\n/);
    let block: string[] = [];
    let current: string | undefined;
    for (const line of lines) {
      const create = /^CREATE\s+(?:VIRTUAL\s+)?(?:TABLE|VIEW)\s+(\w+)/i.exec(line);
      if (create) {
        current = create[1];
        const first = block.find((b) => b && !/^[=-]+$/.test(b));
        if (first) doc.purpose.set(current, first);
        doc.columns.set(current, new Map());
        block = [];
        continue;
      }
      if (current) {
        if (/^\)\s*;?/.test(line) || /^\S.*;\s*$/.test(line)) {
          current = undefined;
        } else {
          const c = /^\s*(\w+)\s.*?--\s*(.*)$/.exec(line);
          if (c) doc.columns.get(current)!.set(c[1], c[2].trim());
        }
        continue;
      }
      if (line.startsWith("--")) block.push(line.replace(/^--\s?/, "").trim());
      else block = [];
    }
  }
  schemaDocCache = doc;
  return doc;
}

const FTS_SHADOW = /^search_(data|idx|content|docsize|config)$/;

export function schema(ctx: Ctx, table?: string): Row {
  const doc = schemaDoc(ctx);
  const objs = all(
    ctx,
    "SELECT type, name FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY type, name",
  ).filter((o) => !FTS_SHADOW.test(o.name as string));
  if (!table) {
    return {
      tables: objs.map((o) => {
        const name = o.name as string;
        const row: Row = { name, type: o.type };
        row.rows = (one(ctx, `SELECT count(*) n FROM "${name}"`) as Row).n;
        const p = doc.purpose.get(name);
        if (p) row.purpose = p;
        return row;
      }),
      table_count: objs.filter((o) => o.type === "table").length,
      view_count: objs.filter((o) => o.type === "view").length,
      docs: SCHEMA_DOC,
    };
  }
  const obj = objs.find((o) => (o.name as string).toLowerCase() === table.toLowerCase());
  if (!obj) {
    throw new ToolError(`Unknown table/view '${table}'. Valid: ${objs.map((o) => o.name).join(", ")}`);
  }
  const name = obj.name as string;
  const comments = doc.columns.get(name);
  const columns = all(ctx, `SELECT name, type, pk FROM pragma_table_xinfo('${name}')`).map((c) =>
    dropNulls({ name: c.name, type: c.type || undefined, pk: c.pk ? true : undefined, comment: comments?.get(c.name as string) }),
  );
  const samples = cleanAll(all(ctx, `SELECT * FROM "${name}" LIMIT 3`));
  return {
    name,
    type: obj.type,
    purpose: doc.purpose.get(name),
    rows: (one(ctx, `SELECT count(*) n FROM "${name}"`) as Row).n,
    columns,
    samples,
    docs: SCHEMA_DOC,
  };
}

// ---------------------------------------------------------------- search
/** Turn free user text into a safe FTS5 query: quoted tokens, "phrases", prefix*, name:/text: column filters. */
export function ftsQuery(input: string): string {
  const parts: string[] = [];
  const re = /(?:(name|text):)?(?:"([^"]*)"|(\S+))/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input))) {
    const col = m[1] ? m[1].toLowerCase() : undefined;
    let body = m[2] ?? m[3] ?? "";
    let prefix = false;
    if (m[3] && body.endsWith("*")) {
      prefix = true;
      body = body.replace(/\*+$/, "");
    }
    // FTS5 tokenizer splits on non-alphanumerics; keep only what it would, so quoting is always valid.
    const cleaned = body.replace(/"/g, '""').trim();
    if (!/[\p{L}\p{N}]/u.test(cleaned)) continue;
    const phrase = `"${cleaned}"${prefix ? "*" : ""}`;
    parts.push(col ? `${col} : ${phrase}` : phrase);
  }
  return parts.join(" ");
}

export function search(ctx: Ctx, query: string, kinds?: string[], limit = 20): Row {
  const q = ftsQuery(query);
  if (!q) throw new ToolError("Empty search query");
  const params: unknown[] = [q];
  let kindSql = "";
  if (kinds?.length) {
    kindSql = ` AND kind IN (${kinds.map(() => "?").join(",")})`;
    params.push(...kinds);
  }
  const lim = Math.max(1, Math.min(limit, 200));
  params.push(lim * 6);
  const cand = all(
    ctx,
    `SELECT kind, id, name, snippet(search, 3, '<b>', '</b>', '...', 14) AS snippet, highlight(search, 2, '<b>', '</b>') AS name_hl, bm25(search, 0, 0, 8, 1) AS rank
       FROM search WHERE search MATCH ?${kindSql} ORDER BY rank LIMIT ?`,
    ...params,
  );
  // bm25 is nearly flat for short names; boost exact / prefix name matches and player abilities (lower rank = better).
  const plain = query.trim().toLowerCase();
  const player = new Set(
    all(ctx, "SELECT ability_id FROM abilities WHERE is_player_ability = 1").map((r) => r.ability_id as string),
  );
  const adj = (r: Row): number => {
    const nm = String(r.name).toLowerCase();
    let v = r.rank as number;
    if (nm === plain) v -= 20;
    else if (nm.startsWith(plain)) v -= 8;
    if (r.kind === "ability" && player.has(r.id as string)) v -= 8;
    if (r.kind === "ability" || r.kind === "unique" || r.kind === "affix" || r.kind === "set") v -= 1;
    return v;
  };
  const results = cand
    .map((r) => ({ r, a: adj(r) }))
    .sort((x, y) => x.a - y.a)
    .slice(0, lim)
    .map(({ r }) => {
      const { name_hl, snippet, ...rest } = r;
      const hit = typeof snippet === "string" && snippet.includes("<b>");
      return { ...rest, snippet: hit ? snippet : name_hl, rank: Math.round((r.rank as number) * 1000) / 1000 };
    });
  return { query: q, count: results.length, results };
}

// ---------------------------------------------------------------- lookup
interface LookupSource {
  kind: string;
  /** SELECT id, name, hint FROM ... (no WHERE) */
  sql: string;
  /** boost for tie-breaks */
  boost?: number;
}

const LOOKUP_SOURCES: LookupSource[] = [
  {
    kind: "ability",
    boost: 3,
    sql: `SELECT ability_id AS id, name, (CASE WHEN is_player_ability = 1 THEN 'player' ELSE 'minion/monster' END || CASE WHEN has_skill_tree = 1 THEN ', has tree' ELSE '' END) AS hint, is_player_ability AS pri FROM abilities`,
  },
  {
    kind: "unique",
    boost: 2,
    sql: `SELECT CAST(u.unique_id AS TEXT) AS id, u.name, COALESCE(b.name, '') || ' / ' || COALESCE(s.name, '') AS hint, 0 AS pri FROM uniques u LEFT JOIN item_subtypes s ON s.base_type_id = u.base_type_id AND s.sub_type_id = u.sub_type_id LEFT JOIN item_base_types b ON b.base_type_id = u.base_type_id`,
  },
  {
    kind: "affix",
    boost: 2,
    sql: `SELECT CAST(affix_id AS TEXT) AS id, name, tier_count || ' tiers, ' || COALESCE(affix_type_name, '') AS hint, 0 AS pri FROM affixes`,
  },
  {
    kind: "subtype",
    sql: `SELECT s.base_type_id || ':' || s.sub_type_id AS id, s.name, COALESCE(b.name, '') AS hint, 0 AS pri FROM item_subtypes s LEFT JOIN item_base_types b ON b.base_type_id = s.base_type_id`,
  },
  { kind: "base_type", sql: `SELECT CAST(base_type_id AS TEXT) AS id, name, category AS hint, 0 AS pri FROM item_base_types` },
  { kind: "set", sql: `SELECT CAST(set_id AS TEXT) AS id, name, item_count || ' pieces' AS hint, 0 AS pri FROM sets` },
  {
    kind: "blessing",
    sql: `SELECT CAST(b.sub_type_id AS TEXT) AS id, b.name, COALESCE(t.name, '') AS hint, 0 AS pri FROM blessings b LEFT JOIN timelines t ON t.timeline_id = b.timeline_id`,
  },
  {
    kind: "skill_tree",
    sql: `SELECT tree_id AS id, name, 'ability ' || ability_id || ', ' || node_count || ' nodes' AS hint, 0 AS pri FROM trees WHERE tree_kind = 'skill'`,
  },
  {
    kind: "passive_tree",
    sql: `SELECT tree_id AS id, name, node_count || ' nodes' AS hint, 0 AS pri FROM trees WHERE tree_kind <> 'skill'`,
  },
  {
    kind: "skill_node",
    sql: `SELECT n.tree_id || ':' || n.node_id AS id, n.name, COALESCE(t.name, n.tree_id) AS hint, 0 AS pri FROM tree_nodes n LEFT JOIN trees t ON t.tree_id = n.tree_id WHERE n.tree_kind = 'skill'`,
  },
  {
    kind: "passive_node",
    sql: `SELECT n.tree_id || ':' || n.node_id AS id, n.name, COALESCE(t.name, n.tree_id) AS hint, 0 AS pri FROM tree_nodes n LEFT JOIN trees t ON t.tree_id = n.tree_id WHERE n.tree_kind = 'class'`,
  },
  {
    kind: "weaver_node",
    sql: `SELECT n.tree_id || ':' || n.node_id AS id, n.name, 'Weaver tree' AS hint, 0 AS pri FROM tree_nodes n WHERE n.tree_kind = 'weaver'`,
  },
  { kind: "ailment", sql: `SELECT CAST(ailment_id AS TEXT) AS id, name, CASE WHEN positive = 1 THEN 'buff' ELSE 'debuff' END AS hint, 0 AS pri FROM ailments` },
  { kind: "property", sql: `SELECT CAST(property AS TEXT) AS id, name, enum_name AS hint, 0 AS pri FROM stat_properties` },
  { kind: "player_property", sql: `SELECT CAST(idx AS TEXT) AS id, name, '' AS hint, 0 AS pri FROM player_properties` },
  { kind: "class", sql: `SELECT CAST(class_id AS TEXT) AS id, name, 'tree ' || tree_id AS hint, 0 AS pri FROM classes` },
  { kind: "mastery", sql: `SELECT class_id || ':' || mastery_index AS id, name, 'class ' || class_id AS hint, 0 AS pri FROM masteries` },
  { kind: "monster_mod", sql: `SELECT CAST(mod_id AS TEXT) AS id, title AS name, COALESCE(mod_type, '') AS hint, 0 AS pri FROM monster_mods WHERE title IS NOT NULL` },
  { kind: "timeline", sql: `SELECT CAST(timeline_id AS TEXT) AS id, name, COALESCE(boss_name, '') AS hint, 0 AS pri FROM timelines` },
  { kind: "dungeon", sql: `SELECT CAST(dungeon_id AS TEXT) AS id, name, COALESCE(boss_name, '') AS hint, 0 AS pri FROM dungeons` },
];

const FTS_KIND_MAP: Record<string, string> = { item_subtype: "subtype", stat_property: "property" };

function likeEscape(s: string): string {
  return s.replace(/[\\%_]/g, (c) => "\\" + c);
}

export function lookup(ctx: Ctx, name: string, kinds?: string[], limit = 10): Row {
  const q = name.trim();
  if (!q) throw new ToolError("Empty name");
  const valid = LOOKUP_SOURCES.map((s) => s.kind);
  if (kinds?.length) {
    const bad = kinds.filter((k) => !valid.includes(k));
    if (bad.length) throw new ToolError(`Unknown kind(s) ${bad.join(", ")}. Valid kinds: ${valid.join(", ")}`);
  }
  const sources = LOOKUP_SOURCES.filter((s) => !kinds?.length || kinds.includes(s.kind));
  const hits = new Map<string, Row>();
  const add = (kind: string, id: string, nm: string, hint: string | null, score: number) => {
    const key = `${kind}\u0000${id}`;
    const prev = hits.get(key);
    if (!prev || (prev.score as number) < score) hits.set(key, { kind, id, name: nm, score, hint: hint || undefined });
  };
  for (const s of sources) {
    const base = s.boost ?? 0;
    for (const r of all(ctx, `SELECT id, name, hint, pri FROM (${s.sql}) WHERE lower(name) = lower(?) LIMIT 50`, q)) {
      add(s.kind, r.id as string, r.name as string, r.hint as string, 100 + base + (r.pri ? 5 : 0));
    }
    for (const r of all(
      ctx,
      `SELECT id, name, hint, pri FROM (${s.sql}) WHERE lower(name) LIKE lower(?) ESCAPE '\\' ORDER BY length(name) LIMIT 50`,
      likeEscape(q) + "%",
    )) {
      add(s.kind, r.id as string, r.name as string, r.hint as string, 60 + base + (r.pri ? 5 : 0) - Math.min(20, Math.max(0, (r.name as string).length - q.length) / 2));
    }
  }
  // FTS fallback only when the name-based passes did not fill the limit.
  if (hits.size < limit) {
    const fq = ftsQuery(q);
    if (fq) {
      try {
        for (const r of all(ctx, `SELECT kind, id, name FROM search WHERE search MATCH ? ORDER BY bm25(search, 0, 0, 8, 1) LIMIT ?`, fq, limit * 3)) {
          const kind = FTS_KIND_MAP[r.kind as string] ?? (r.kind as string);
          if (kinds?.length && !kinds.includes(kind)) continue;
          add(kind, r.id as string, r.name as string, null, 30);
        }
      } catch {
        /* FTS fallback is best effort */
      }
    }
  }
  const results = [...hits.values()].sort((a, b) => (b.score as number) - (a.score as number)).slice(0, Math.max(1, limit));
  return { query: q, count: results.length, results };
}

// ---------------------------------------------------------------- find_mods
export interface ModFilters {
  property?: number;
  property_name?: string;
  tags_any?: (string | number)[];
  tags_all?: (string | number)[];
  modifier_type?: number | null;
  source_kinds?: string[];
  source_id?: string;
  min_value?: number;
  special_tag?: number;
  include_untagged?: boolean;
}

/**
 * The join logic of find_mods: every `mods` row plus a human source name.
 *  - names come from v_mods_named (affix name / unique name / set name / node name / blessing /
 *    ailment / implicit base item / attribute / ability) with two overrides here:
 *      monster_mod -> monster_mods.title (the view falls back to the description text)
 *      skill/passive/weaver node -> `source_context` = tree name (e.g. 'Fireball', 'Mage')
 *  - affix rows carry `tier`.
 */
export const MODS_JOIN_SQL = `
  FROM mods m
  LEFT JOIN v_mods_named v ON v.id = m.id
  LEFT JOIN monster_mods mm ON m.source_kind = 'monster_mod' AND CAST(mm.mod_id AS TEXT) = m.source_id
  LEFT JOIN trees tr ON m.source_kind IN ('skill_node','passive_node','weaver_node') AND tr.tree_id = substr(m.source_id, 1, instr(m.source_id, ':') - 1)`;

export const MODS_SELECT_SQL = `
  SELECT m.source_kind, m.source_id,
         COALESCE(mm.title, v.source_name) AS source_name,
         tr.name AS source_context,
         m.tier, m.property, m.property_name, m.special_tag, m.tags, m.tag_names,
         m.modifier_type, m.value_min, m.value_max, m.display, m.label`;

export function findMods(ctx: Ctx, f: ModFilters = {}, limit = 100): Row {
  const where: string[] = [];
  const params: unknown[] = [];
  if (f.property !== undefined) {
    where.push("m.property = ?");
    params.push(f.property);
  }
  if (f.property_name) {
    where.push("m.property_name LIKE ? ESCAPE '\\'");
    params.push("%" + likeEscape(f.property_name) + "%");
  }
  if (f.tags_any?.length) {
    const mask = tagMask(ctx, f.tags_any);
    where.push(f.include_untagged === false ? "(m.tags & ?) != 0" : "((m.tags & ?) != 0 OR m.tags = 0)");
    params.push(mask);
  }
  if (f.tags_all?.length) {
    const mask = tagMask(ctx, f.tags_all);
    where.push("(m.tags & ?) = ?");
    params.push(mask, mask);
  }
  if (f.modifier_type === null) where.push("m.modifier_type IS NULL");
  else if (f.modifier_type !== undefined) {
    where.push("m.modifier_type = ?");
    params.push(f.modifier_type);
  }
  if (f.source_kinds?.length) {
    where.push(`m.source_kind IN (${f.source_kinds.map(() => "?").join(",")})`);
    params.push(...f.source_kinds);
  }
  if (f.source_id !== undefined) {
    where.push("m.source_id = ?");
    params.push(String(f.source_id));
  }
  if (f.min_value !== undefined) {
    where.push("m.value_max >= ?");
    params.push(f.min_value);
  }
  if (f.special_tag !== undefined) {
    where.push("m.special_tag = ?");
    params.push(f.special_tag);
  }
  const w = where.length ? " WHERE " + where.join(" AND ") : "";
  const lim = Math.max(1, Math.min(limit, 2000));
  const total = (one(ctx, `SELECT count(*) n ${MODS_JOIN_SQL}${w}`, ...params) as Row).n as number;
  const rows = all(ctx, `${MODS_SELECT_SQL} ${MODS_JOIN_SQL}${w} ORDER BY m.id LIMIT ?`, ...params, lim).map(dropNulls);
  return { total_matching: total, count: rows.length, truncated: total > rows.length, rows };
}

// ---------------------------------------------------------------- trees
function treePayload(ctx: Ctx, tree: Row): Row {
  const treeId = tree.tree_id as string;
  const nodeKind = tree.tree_kind === "skill" ? "skill_node" : tree.tree_kind === "class" ? "passive_node" : "weaver_node";
  const nodes = all(
    ctx,
    `SELECT node_id AS id, name, description, alt_text, max_points, mastery, mastery_requirement, no_scaling_type, no_scaling_point_threshold, lock_node, ui_x AS x, ui_y AS y, node_size FROM tree_nodes WHERE tree_id = ? ORDER BY node_id`,
    treeId,
  );
  const mods = all(
    ctx,
    `SELECT source_id, ${MOD_COLS} FROM mods WHERE source_kind = ? AND source_id LIKE ? ORDER BY source_id, source_ord, sub_ord`,
    nodeKind,
    treeId.replace(/[\\%_]/g, "\\$&") + ":%",
  );
  const modsByNode = new Map<number, Row[]>();
  for (const m of mods) {
    const nid = Number((m.source_id as string).slice(treeId.length + 1));
    const { source_id: _s, ...rest } = m;
    (modsByNode.get(nid) ?? modsByNode.set(nid, []).get(nid)!).push(dropNulls(rest));
  }
  const reqByNode = new Map<number, Row[]>();
  for (const r of all(
    ctx,
    "SELECT node_id, required_node_id AS node, required_points AS points FROM tree_node_requirements WHERE tree_id = ? ORDER BY node_id, ord",
    treeId,
  )) {
    (reqByNode.get(r.node_id as number) ?? reqByNode.set(r.node_id as number, []).get(r.node_id as number)!).push({
      node: r.node,
      points: r.points,
    });
  }
  return {
    tree: clean(tree),
    node_count: nodes.length,
    nodes: nodes.map((n) => {
      const id = n.id as number;
      return dropNulls({ ...n, mods: modsByNode.get(id) ?? [], requires: reqByNode.get(id) });
    }),
  };
}

export function skillTree(ctx: Ctx, abilityId: string): Row {
  const s = String(abilityId);
  const t = one(ctx, "SELECT * FROM trees WHERE tree_kind = 'skill' AND (ability_id = ? OR tree_id = ?)", s, s);
  if (!t) {
    const a = one(ctx, "SELECT name, has_skill_tree FROM abilities WHERE ability_id = ?", s);
    throw new ToolError(
      a ? `Ability '${s}' (${a.name}) has no skill tree` : `No skill tree for '${s}'. Use lookup({name, kinds:["ability"]}) to find the ability id.`,
    );
  }
  return treePayload(ctx, t);
}

export function passiveTree(ctx: Ctx, classId: string | number): Row {
  const cid = classIdOf(ctx, classId);
  const t =
    cid !== undefined
      ? one(ctx, "SELECT * FROM trees WHERE tree_kind = 'class' AND class_id = ?", cid)
      : one(ctx, "SELECT * FROM trees WHERE tree_kind IN ('class','weaver') AND tree_id = ?", String(classId));
  if (!t) {
    throw new ToolError(`No class/passive tree for ${JSON.stringify(classId)}. Use 0-4, a class name (Primalist, Mage, Sentinel, Acolyte, Rogue) or a tree id (pr-1, mg-1, kn-1, ac-1, rg-1, weaver).`);
  }
  const out = treePayload(ctx, t);
  if (cid !== undefined) out.class = one(ctx, "SELECT class_id, name FROM classes WHERE class_id = ?", cid);
  out.masteries = cid !== undefined ? all(ctx, "SELECT mastery_index, name FROM masteries WHERE class_id = ? ORDER BY mastery_index", cid) : undefined;
  return out;
}

// ---------------------------------------------------------------- sql
function stripSqlComments(sql: string): string {
  return sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\n]*/g, " ");
}

/**
 * Read-only SELECT/WITH only. Guards: single statement, comment-stripped text starts with SELECT/WITH,
 * db opened readonly, and prepared statement must report readonly. better-sqlite3 cannot interrupt a
 * running statement, so there is no time limit: keep queries selective (the row cap bounds output only).
 */
export function sql(ctx: Ctx, query: string, params: unknown[] = [], limit = 500): Row {
  const text = stripSqlComments(query).trim().replace(/;\s*$/, "").trim();
  if (!text) throw new ToolError("Empty query");
  if (text.includes(";")) throw new ToolError("Only a single statement is allowed (found ';')");
  if (!/^(select|with)\b/i.test(text)) throw new ToolError("Only SELECT or WITH ... SELECT queries are allowed");
  let stmt;
  try {
    stmt = ctx.db.prepare(text);
  } catch (e) {
    throw new ToolError(`SQL error: ${(e as Error).message}`);
  }
  if (!stmt.readonly) throw new ToolError("Statement is not read-only");
  const lim = Math.max(1, Math.min(limit, 5000));
  const rows: Row[] = [];
  let truncated = false;
  try {
    const columns = stmt.columns().map((c) => c.name);
    if (!stmt.reader) throw new ToolError("Statement returns no rows");
    for (const r of stmt.iterate(...(params as never[]))) {
      if (rows.length >= lim) {
        truncated = true;
        break;
      }
      rows.push(r as Row);
    }
    return { columns, rows, row_count: rows.length, truncated };
  } catch (e) {
    if (e instanceof ToolError) throw e;
    throw new ToolError(`SQL error: ${(e as Error).message}`);
  }
}

// ---------------------------------------------------------------- knowledge
interface Page {
  path: string; // relative to repo root, forward slashes
  alias: string[];
}

function walk(dir: string, out: string[]): void {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.toLowerCase().endsWith(".md")) out.push(p);
  }
}

function pages(ctx: Ctx): Page[] {
  const files: string[] = [];
  const kdir = join(ctx.repoRoot, "knowledge");
  if (existsSync(kdir)) walk(kdir, files);
  const sdir = join(ctx.repoRoot, ".claude", "skills");
  if (existsSync(sdir)) {
    for (const d of readdirSync(sdir)) {
      const f = join(sdir, d, "SKILL.md");
      if (existsSync(f)) files.push(f);
    }
  }
  return files.map((f) => {
    const rel = relative(ctx.repoRoot, f).replace(/\\/g, "/");
    const noExt = rel.replace(/\.md$/i, "");
    const alias = [rel, noExt, rel.replace(/^knowledge\//, ""), rel.replace(/^knowledge\//, "").replace(/\.md$/i, "")];
    const base = noExt.split("/").pop()!;
    if (base === "SKILL") alias.push(noExt.split("/").slice(-2)[0]);
    else alias.push(base, base + ".md");
    return { path: rel, alias: alias.map((a) => a.toLowerCase()) };
  });
}

export function knowledge(ctx: Ctx, page?: string): Row {
  const all_ = pages(ctx);
  if (!page) {
    return {
      count: all_.length,
      pages: all_.map((p) => {
        const text = readFileSync(join(ctx.repoRoot, p.path), "utf8");
        const h = /^#\s+(.+)$/m.exec(text);
        return { path: p.path, title: h?.[1].trim(), lines: text.split(/\r?\n/).length };
      }),
    };
  }
  const want = page.trim().replace(/\\/g, "/").replace(/^\.?\//, "").toLowerCase();
  const exact = all_.filter((p) => p.path.toLowerCase() === want);
  const matches = exact.length ? exact : all_.filter((p) => p.alias.includes(want));
  if (matches.length === 0) {
    throw new ToolError(`Unknown page '${page}'. Call knowledge() with no argument to list pages.`);
  }
  if (matches.length > 1) {
    throw new ToolError(`Ambiguous page '${page}'. Use a full path: ${matches.map((m) => m.path).join(", ")}`);
  }
  const text = readFileSync(join(ctx.repoRoot, matches[0].path), "utf8");
  return { path: matches[0].path, lines: text.split(/\r?\n/).length, text };
}

export const KINDS = Object.keys(GETTERS);
export type { Id };
export { modsFor };

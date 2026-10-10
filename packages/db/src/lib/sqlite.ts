/**
 * better-sqlite3 helpers: open a build database, apply schema.sql, transactions and a
 * column-checked, statement-cached row inserter.
 *
 *   const db = openBuildDb(":memory:");
 *   applySchema(db);
 *   insertRow(db, "uniques", { unique_id: 0, name: "Calamity", ..., raw_json: rawJson(u) });
 */
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { SCHEMA_PATH } from "./paths.js";

export type DB = Database.Database;
export type Row = Record<string, unknown>;

/** Open (or create) a database tuned for a one-shot build (no journal, no fsync, FKs off). */
export function openBuildDb(path: string): DB {
  const db = new Database(path);
  db.pragma("journal_mode = OFF");
  db.pragma("synchronous = OFF");
  db.pragma("temp_store = MEMORY");
  db.pragma("foreign_keys = OFF");
  return db;
}

/** Open an existing database read-only (for consumers such as @le/mcp). */
export function openReadOnly(path: string): DB {
  return new Database(path, { readonly: true, fileMustExist: true });
}

/** The DDL text of packages/db/schema.sql. */
export function readSchemaSql(path: string = SCHEMA_PATH): string {
  return readFileSync(path, "utf8");
}

/** Execute schema.sql on `db`. */
export function applySchema(db: DB, sql: string = readSchemaSql()): void {
  db.exec(sql);
}

/** Run `fn` inside one transaction (rolled back when it throws). */
export function transaction<T>(db: DB, fn: () => T): T {
  return db.transaction(fn)();
}

const columnCache = new WeakMap<DB, Map<string, Set<string>>>();
const stmtCache = new WeakMap<DB, Map<string, Database.Statement>>();

/** Column names of a table (cached per db). Throws for an unknown table. */
export function tableColumns(db: DB, table: string): Set<string> {
  let byTable = columnCache.get(db);
  if (!byTable) columnCache.set(db, (byTable = new Map()));
  let cols = byTable.get(table);
  if (!cols) {
    const info = db.prepare(`SELECT name FROM pragma_table_xinfo(?)`).all(table) as { name: string }[];
    if (!info.length) throw new Error(`unknown table '${table}'`);
    cols = new Set(info.map((c) => c.name));
    byTable.set(table, cols);
  }
  return cols;
}

/**
 * Convert a JS value to something SQLite stores deterministically:
 * booleans -> 0/1, undefined -> NULL, objects/arrays -> JSON text, non-finite numbers -> NULL.
 */
export function toSqlValue(v: unknown): unknown {
  if (v === undefined || v === null) return null;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "bigint" || typeof v === "string") return v;
  if (Buffer.isBuffer(v)) return v;
  return JSON.stringify(v);
}

export interface InsertOptions {
  /** 'abort' (default) fails on a constraint violation; 'ignore' = INSERT OR IGNORE; 'replace' = INSERT OR REPLACE. */
  conflict?: "abort" | "ignore" | "replace";
}

/**
 * Insert one row. Keys must be existing column names (typos throw); missing columns get their
 * default. Statements are cached per (table, column set). Returns the rowid (0 when ignored).
 */
export function insertRow(db: DB, table: string, row: Row, opts: InsertOptions = {}): number {
  const cols = tableColumns(db, table);
  const keys = Object.keys(row);
  for (const k of keys) if (!cols.has(k)) throw new Error(`table '${table}' has no column '${k}'`);
  const verb = opts.conflict === "ignore" ? "INSERT OR IGNORE" : opts.conflict === "replace" ? "INSERT OR REPLACE" : "INSERT";
  const cacheKey = `${verb}|${table}|${keys.join(",")}`;
  let byKey = stmtCache.get(db);
  if (!byKey) stmtCache.set(db, (byKey = new Map()));
  let stmt = byKey.get(cacheKey);
  if (!stmt) {
    const sql = `${verb} INTO "${table}" (${keys.map((k) => `"${k}"`).join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`;
    stmt = db.prepare(sql);
    byKey.set(cacheKey, stmt);
  }
  const info = stmt.run(...keys.map((k) => toSqlValue(row[k])));
  return info.changes ? Number(info.lastInsertRowid) : 0;
}

/** Insert many rows in order (call inside a transaction for speed). Returns the number inserted. */
export function insertRows(db: DB, table: string, rows: Iterable<Row>, opts: InsertOptions = {}): number {
  let n = 0;
  for (const r of rows) if (insertRow(db, table, r, opts)) n++;
  return n;
}

/** Number of rows in a table or view. */
export function countRows(db: DB, table: string): number {
  return (db.prepare(`SELECT count(*) AS n FROM "${table}"`).get() as { n: number }).n;
}

/** User tables (excluding sqlite_* and FTS5 shadow tables), sorted by name. */
export function listTables(db: DB): string[] {
  const rows = db
    .prepare(
      `SELECT name FROM sqlite_master
        WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
          AND name NOT IN (SELECT m.name || s.suffix FROM sqlite_master m
                           CROSS JOIN (SELECT '_data' AS suffix UNION ALL SELECT '_idx' UNION ALL SELECT '_content'
                                       UNION ALL SELECT '_docsize' UNION ALL SELECT '_config') s
                            WHERE m.type = 'table' AND m.sql LIKE 'CREATE VIRTUAL TABLE%')
        ORDER BY name`,
    )
    .all() as { name: string }[];
  return rows.map((r) => r.name);
}

/** Views, sorted by name. */
export function listViews(db: DB): string[] {
  return (db.prepare(`SELECT name FROM sqlite_master WHERE type = 'view' ORDER BY name`).all() as { name: string }[]).map(
    (r) => r.name,
  );
}

/** Explicit (named) indexes, sorted by name. */
export function listIndexes(db: DB): string[] {
  return (
    db
      .prepare(`SELECT name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
      .all() as { name: string }[]
  ).map((r) => r.name);
}

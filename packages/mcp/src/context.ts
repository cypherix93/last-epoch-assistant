import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type DB = Database.Database;
export type Row = Record<string, unknown>;

const here = dirname(fileURLToPath(import.meta.url));
/** Repository root (packages/mcp/src or packages/mcp/dist -> three levels up). */
export const REPO_ROOT = resolve(here, "../../..");

/** Tool-level failure: reported to the client as {ok:false,error}. */
export class ToolError extends Error {}

export interface Ctx {
  db: DB;
  dbPath: string;
  repoRoot: string;
  /** lower-case tag name -> mask value */
  tagByName: Map<string, number>;
  tagList: { value: number; name: string }[];
}

export function resolveDbPath(explicit?: string): string {
  return resolve(explicit ?? process.env.LE_DB_PATH ?? join(REPO_ROOT, "data", "le.sqlite"));
}

export function createContext(dbPath?: string): Ctx {
  const path = resolveDbPath(dbPath);
  if (!existsSync(path)) {
    throw new Error(`Database not found at ${path}. Build it with \`yarn db:build\` (or set LE_DB_PATH).`);
  }
  const db = new Database(path, { readonly: true, fileMustExist: true });
  const tags = db.prepare("SELECT value, name FROM tag_bits ORDER BY value").all() as { value: number; name: string }[];
  const tagByName = new Map<string, number>();
  for (const t of tags) tagByName.set(t.name.toLowerCase(), t.value);
  return { db, dbPath: path, repoRoot: REPO_ROOT, tagByName, tagList: tags };
}

export function all(ctx: Ctx, sql: string, ...params: unknown[]): Row[] {
  return ctx.db.prepare(sql).all(...(params as never[])) as Row[];
}
export function one(ctx: Ctx, sql: string, ...params: unknown[]): Row | undefined {
  return ctx.db.prepare(sql).get(...(params as never[])) as Row | undefined;
}

/** Drop raw_json (kept, parsed, under `raw` when asked). */
export function clean<T extends Row | undefined>(row: T, includeRaw = false): T {
  if (!row) return row;
  const { raw_json, ...rest } = row as Row;
  const out: Row = { ...rest };
  if (includeRaw && typeof raw_json === "string") {
    try {
      out.raw = JSON.parse(raw_json);
    } catch {
      out.raw = raw_json;
    }
  }
  return out as T;
}
export function cleanAll(rows: Row[], includeRaw = false): Row[] {
  return rows.map((r) => clean(r, includeRaw));
}

/** Resolve tag names or integer masks into one mask. */
export function tagMask(ctx: Ctx, items: (string | number)[] | undefined): number {
  let mask = 0;
  for (const it of items ?? []) {
    if (typeof it === "number") {
      mask |= it;
      continue;
    }
    const v = ctx.tagByName.get(it.trim().toLowerCase());
    if (v === undefined) {
      throw new ToolError(`Unknown tag name '${it}'. Valid names: ${ctx.tagList.map((t) => t.name).join(", ")}`);
    }
    mask |= v;
  }
  return mask;
}

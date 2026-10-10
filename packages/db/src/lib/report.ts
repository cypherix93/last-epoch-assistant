/**
 * Row counts and the deterministic build report (data/le.build-report.json).
 */
import type { CommunityReport } from "../loaders/community.js";
import type { ExpectedResult } from "./expected.js";
import { countRows, listIndexes, listTables, listViews, type DB } from "./sqlite.js";

export interface TableCount {
  table: string;
  rows: number;
}

/** Row count of every user table (FTS shadow tables excluded, `search` included), sorted by name. */
export function rowCounts(db: DB): TableCount[] {
  return listTables(db).map((table) => ({ table, rows: countRows(db, table) }));
}

/** mods rows per source_kind, sorted. */
export function modsBySourceKind(db: DB): Record<string, number> {
  const rows = db.prepare(`SELECT source_kind, count(*) AS n FROM mods GROUP BY source_kind ORDER BY source_kind`).all() as {
    source_kind: string;
    n: number;
  }[];
  return Object.fromEntries(rows.map((r) => [r.source_kind, r.n]));
}

/** search rows per kind, sorted. */
export function searchByKind(db: DB): Record<string, number> {
  const rows = db.prepare(`SELECT kind, count(*) AS n FROM search GROUP BY kind ORDER BY kind`).all() as { kind: string; n: number }[];
  return Object.fromEntries(rows.map((r) => [r.kind, r.n]));
}

/** PRAGMA foreign_key_check summarized as violations per (table -> parent). */
export function foreignKeyViolations(db: DB): Record<string, number> {
  const rows = db.prepare(`PRAGMA foreign_key_check`).all() as { table: string; parent: string }[];
  const out: Record<string, number> = {};
  for (const r of rows) {
    const k = `${r.table} -> ${r.parent}`;
    out[k] = (out[k] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

export type LoaderStatus = "ok" | "stub" | "skipped" | "failed";

export interface BuildReport {
  schema_version: string;
  build_tool_version: string;
  meta: Record<string, string>;
  loaders: Record<string, LoaderStatus>;
  tables: Record<string, number>;
  empty_tables: string[];
  views: string[];
  index_count: number;
  mods_by_source_kind: Record<string, number>;
  search_by_kind: Record<string, number>;
  foreign_key_violations: Record<string, number>;
  expected: { ok: number; failed: number; results: ExpectedResult[] };
  warnings: string[];
  crosscheck_mismatches: number | null;
  /** Community builds step summary incl. unresolved Maxroll ids (null when the step did not run). */
  community: CommunityReport | null;
}

export interface ReportInput {
  meta: Record<string, string>;
  loaders: Record<string, LoaderStatus>;
  expected: ExpectedResult[];
  warnings: string[];
  crosscheckMismatches: number | null;
  community?: CommunityReport | null;
}

/** Assemble the report. Contains no timestamps or durations (deterministic for identical input). */
export function buildReport(db: DB, input: ReportInput): BuildReport {
  const counts = rowCounts(db);
  return {
    schema_version: input.meta.schema_version ?? "",
    build_tool_version: input.meta.build_tool_version ?? "",
    meta: input.meta,
    loaders: input.loaders,
    tables: Object.fromEntries(counts.map((c) => [c.table, c.rows])),
    empty_tables: counts.filter((c) => c.rows === 0).map((c) => c.table),
    views: listViews(db),
    index_count: listIndexes(db).length,
    mods_by_source_kind: modsBySourceKind(db),
    search_by_kind: searchByKind(db),
    foreign_key_violations: foreignKeyViolations(db),
    expected: {
      ok: input.expected.filter((e) => e.ok).length,
      failed: input.expected.filter((e) => !e.ok).length,
      results: input.expected,
    },
    warnings: input.warnings,
    crosscheck_mismatches: input.crosscheckMismatches,
    community: input.community ?? null,
  };
}

/** Plain-text table: two or more columns, right-aligned numbers. */
export function formatTable(header: string[], rows: (string | number)[][]): string {
  const all = [header, ...rows.map((r) => r.map(String))];
  const widths = header.map((_, i) => Math.max(...all.map((r) => (r[i] ?? "").length)));
  const fmt = (r: string[]) =>
    r.map((c, i) => (i === 0 ? c.padEnd(widths[i]!) : c.padStart(widths[i]!))).join("  ");
  const sep = widths.map((w) => "-".repeat(w)).join("  ");
  return [fmt(all[0]!), sep, ...all.slice(1).map(fmt)].join("\n");
}

/** Human-readable summary printed at the end of `yarn db:build`. */
export function formatReport(r: BuildReport): string {
  const lines: string[] = [];
  lines.push(formatTable(["table", "rows"], Object.entries(r.tables).map(([t, n]) => [t, n])));
  lines.push("");
  lines.push(`tables: ${Object.keys(r.tables).length}, views: ${r.views.length}, indexes: ${r.index_count}`);
  lines.push(`empty tables (${r.empty_tables.length}): ${r.empty_tables.join(", ") || "-"}`);
  lines.push(`loaders: ${Object.entries(r.loaders).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  if (Object.keys(r.mods_by_source_kind).length) {
    lines.push(`mods by source_kind: ${Object.entries(r.mods_by_source_kind).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  }
  const fk = Object.entries(r.foreign_key_violations);
  if (fk.length) lines.push(`foreign key violations: ${fk.map(([k, v]) => `${k}: ${v}`).join("; ")}`);
  lines.push(`expected counts: ${r.expected.ok} ok, ${r.expected.failed} failed`);
  for (const e of r.expected.results.filter((x) => !x.ok)) {
    lines.push(`  FAIL ${e.name}: expected ${e.op} ${e.expected}, got ${e.actual ?? "error"}${e.error ? ` (${e.error})` : ""}`);
  }
  if (r.crosscheck_mismatches !== null) lines.push(`crosscheck mismatches: ${r.crosscheck_mismatches}`);
  if (r.community) {
    const c = r.community;
    if (!c.present) lines.push("community: no maxroll-guides folder (0 builds)");
    else {
      const kinds = Object.entries(c.unresolved).map(([k, v]) => `${k}=${v!.count}`);
      lines.push(
        `community: ${c.guides} guides, ${c.builds} builds, ${c.profiles_loaded} profiles (${c.profiles_missing} missing), ${c.tabs} tabs, ` +
          `${c.items} items, resolution ${c.resolution}, unresolved ${c.unresolved_total}${kinds.length ? ` (${kinds.join(", ")})` : ""}` +
          (c.unnamed_properties.length ? `, unnamed properties ${c.unnamed_properties.map((p) => p.property).join(",")}` : "") +
          (c.inline_items ? `, inline items ${c.inline_items}` : "") +
          (c.warnings_total
            ? `, warnings ${c.warnings_total} (${Object.entries(c.warnings ?? {}).map(([k, v]) => `${k}=${v!.count}`).join(", ")})`
            : ""),
      );
    }
  }
  lines.push("meta:");
  for (const [k, v] of Object.entries(r.meta)) lines.push(`  ${k} = ${v}`);
  if (r.warnings.length) lines.push(`warnings: ${r.warnings.length} (see report)`);
  return lines.join("\n");
}

/**
 * Acceptance counts: each loader module exports `expected: ExpectedCount[]`; the build checks
 * them after loading and puts the result in data/le.build-report.json, loader tests assert them.
 */
import type { DB } from "./sqlite.js";

export interface ExpectedCount {
  /** Short label, e.g. 'uniques' or 'mods[affix_tier]'. */
  name: string;
  /** A query returning one row with one numeric column. */
  sql: string;
  /** Expected value. */
  expected: number;
  /** Comparison (default '='). */
  op?: "=" | ">=";
  /** Where the number comes from (docs/data-sources/counts.md row, computation). */
  source?: string;
}

export interface ExpectedResult {
  name: string;
  expected: number;
  op: "=" | ">=";
  actual: number | null;
  ok: boolean;
  error?: string;
}

/** Evaluate expectations against a db. Never throws (errors are reported per entry). */
export function checkExpected(db: DB, list: readonly ExpectedCount[]): ExpectedResult[] {
  return list.map((e) => {
    const op = e.op ?? "=";
    try {
      const row = db.prepare(e.sql).raw().get() as unknown[] | undefined;
      const actual = row ? Number(row[0]) : null;
      const ok = actual !== null && (op === "=" ? actual === e.expected : actual >= e.expected);
      return { name: e.name, expected: e.expected, op, actual, ok };
    } catch (err) {
      return { name: e.name, expected: e.expected, op, actual: null, ok: false, error: (err as Error).message };
    }
  });
}

/** Shorthand: `count('uniques', 486)` -> SELECT count(*) FROM uniques. */
export function count(table: string, expected: number, where?: string, name?: string, source?: string): ExpectedCount {
  return {
    name: name ?? (where ? `${table}[${where}]` : table),
    sql: `SELECT count(*) FROM ${table}${where ? ` WHERE ${where}` : ""}`,
    expected,
    source,
  };
}

/** Shorthand for mods rows of one source_kind. */
export function modsCount(sourceKind: string, expected: number, source?: string): ExpectedCount {
  return {
    name: `mods[${sourceKind}]`,
    sql: `SELECT count(*) FROM mods WHERE source_kind = '${sourceKind}'`,
    expected,
    source,
  };
}

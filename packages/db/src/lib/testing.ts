/**
 * Helpers for loader tests (no vitest dependency here).
 *
 *   const r = buildForTest(["items"]);          // in-memory db, real raw data, only the items step
 *   r.status;                                    // 'ok' | 'stub' | 'failed' | 'skipped'
 *   checkExpected(r.db, items.expected);         // assert each result .ok
 */
import { buildDatabase, type Step } from "../build-db.js";
import type { BuildReport, LoaderStatus } from "./report.js";
import { hasRawData } from "./paths.js";
import type { DB } from "./sqlite.js";

export { hasRawData };

export interface TestBuild {
  db: DB;
  report: BuildReport;
  /** Status of the first requested step. */
  status: LoaderStatus;
}

/**
 * Build the real raw data of data/raw/CURRENT into an in-memory database, running only `steps`
 * (stubs allowed, no report files written). The caller closes `db`.
 */
export function buildForTest(steps: readonly Step[]): TestBuild {
  const { db, report } = buildDatabase({
    only: steps,
    out: ":memory:",
    allowStubs: true,
    reportPath: null,
    crosscheckPath: null,
    quiet: true,
  });
  if (!db) throw new Error("expected an in-memory db");
  return { db, report, status: steps.length ? report.loaders[steps[0]!]! : "skipped" };
}

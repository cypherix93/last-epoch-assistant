import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/** packages/db (works from src/lib and dist/lib). */
export const PACKAGE_DIR = resolve(here, "../..");
/** Repository root. */
export const REPO_ROOT = resolve(PACKAGE_DIR, "../..");
/** data/ at the repository root. */
export const DATA_DIR = join(REPO_ROOT, "data");
/** data/raw/ (one folder per game data version + CURRENT). */
export const RAW_ROOT = join(DATA_DIR, "raw");
/** packages/db/schema.sql */
export const SCHEMA_PATH = join(PACKAGE_DIR, "schema.sql");
/** Default output database. */
export const DEFAULT_DB_PATH = join(DATA_DIR, "le.sqlite");
/** Committed, deterministic build report. */
export const DEFAULT_REPORT_PATH = join(DATA_DIR, "le.build-report.json");
/** Committed, deterministic LE Tools vs Maxroll cross-check report (written by src/crosscheck.ts). */
export const DEFAULT_CROSSCHECK_PATH = join(DATA_DIR, "crosscheck-report.json");

/** The version named in data/raw/CURRENT (e.g. '1.5.2'), or null when absent. */
export function currentVersion(rawRoot: string = RAW_ROOT): string | null {
  const p = join(rawRoot, "CURRENT");
  if (!existsSync(p)) return null;
  const v = readFileSync(p, "utf8").trim();
  return v || null;
}

/** data/raw/<version>/ */
export function versionDir(version: string, rawRoot: string = RAW_ROOT): string {
  return join(rawRoot, version);
}

/** True when the raw data for `version` (LE Tools folder + lockfile) is on disk. */
export function hasRawData(version: string | null = currentVersion(), rawRoot: string = RAW_ROOT): boolean {
  if (!version) return false;
  const dir = versionDir(version, rawRoot);
  return existsSync(join(dir, "letools")) && existsSync(join(dir, "sources.lock.json"));
}

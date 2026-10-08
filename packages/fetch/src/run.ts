import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchLetools, type ReportRow } from "./letools.js";
import { fetchMaxroll } from "./maxroll.js";
import { readLock, serializeLock, type SourcesLock } from "./lock.js";

export interface CliArgs {
  source: "all" | "letools" | "maxroll";
  version?: string;
  force: boolean;
}

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { source: "all", force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") args.force = true;
    else if (a === "--source") {
      const v = argv[++i];
      if (v !== "letools" && v !== "maxroll") throw new Error(`--source must be letools or maxroll (got ${v})`);
      args.source = v;
    } else if (a === "--version") {
      const v = argv[++i];
      if (!v || !/^(version)?\d{3}$/.test(v)) throw new Error(`--version expects e.g. 150 (got ${v})`);
      args.version = v.replace(/^version/, "");
    } else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

/** Repo root is three levels above packages/fetch/src. */
export function defaultRawDir(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "../../../data/raw");
}

export async function runFetch(
  args: CliArgs,
  rawDir = defaultRawDir(),
  log: (s: string) => void = console.log,
): Promise<ReportRow[]> {
  const rows: ReportRow[] = [];
  const currentFile = join(rawDir, "CURRENT");
  const current = existsSync(currentFile) ? readFileSync(currentFile, "utf8").trim() : null;
  const lockOf = (semver: string | null) => (semver ? readLock(join(rawDir, semver, "sources.lock.json")) : null);

  let semver: string;
  let prevLock: SourcesLock | null;
  let letoolsLock: SourcesLock["letools"];

  if (args.source === "maxroll") {
    if (!current) throw new Error("--source maxroll needs data/raw/CURRENT; run a LE Tools fetch first.");
    semver = current;
    prevLock = lockOf(semver);
    letoolsLock = prevLock?.letools;
  } else {
    const r = await fetchLetools({
      rawDir,
      force: args.force,
      version: args.version,
      previous: lockOf(args.version ? verToSemver(args.version) : current)?.letools,
      log,
    });
    semver = r.semver;
    prevLock = lockOf(semver);
    letoolsLock = r.lock;
    rows.push(...r.rows);
  }

  let maxrollLock = prevLock?.maxroll;
  if (args.source !== "letools") {
    if (args.version) {
      log(`Skipping Maxroll: it has no version history, --version applies to LE Tools only.`);
    } else {
      const r = await fetchMaxroll({ rawDir, semver, force: args.force, previous: prevLock?.maxroll });
      maxrollLock = r.lock;
      rows.push(...r.rows);
    }
  }

  const lock: SourcesLock = { fetchedAt: new Date().toISOString(), letools: letoolsLock, maxroll: maxrollLock };
  // Keep fetchedAt stable when nothing changed so re-runs leave git clean.
  if (prevLock && JSON.stringify({ ...prevLock, fetchedAt: "" }) === JSON.stringify({ ...lock, fetchedAt: "" })) {
    lock.fetchedAt = prevLock.fetchedAt;
  }
  const lockPath = join(rawDir, semver, "sources.lock.json");
  mkdirSync(dirname(lockPath), { recursive: true });
  writeFileSync(lockPath, serializeLock(lock));
  if (!args.version) writeFileSync(currentFile, semver + "\n");
  return rows;
}

function verToSemver(v: string): string {
  return `${v[0]}.${v[1]}.${v[2]}`;
}

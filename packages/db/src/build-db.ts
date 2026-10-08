/**
 * Build data/le.sqlite from data/raw/<version>/.
 *
 *   yarn db:build                          # full build (world -> items -> skills -> search -> crosscheck)
 *   yarn db:build --only world,items       # partial build (other steps skipped; search always rebuilt if listed)
 *   yarn db:build --only none              # schema + meta only
 *   LE_DB_ALLOW_STUBS=1 yarn db:build      # loaders that still throw 'not implemented: x' are skipped (status 'stub')
 *
 * Options: --only <steps|none> (comma separated, repeatable), --version <folder> (default data/raw/CURRENT),
 * --out <path> (default data/le.sqlite), --report <path> | --no-report, --allow-stubs, --quiet.
 *
 * The output is written to <out>.tmp and renamed over <out> at the end (drop-and-recreate).
 * Exit code 1 when a step fails or an expected count of a successful loader does not match.
 */
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { runCrosscheck, type CrosscheckResult } from "./crosscheck.js";
import { createContext, createLogger, type LoaderContext } from "./lib/context.js";
import { checkExpected, type ExpectedCount, type ExpectedResult } from "./lib/expected.js";
import { DEFAULT_CROSSCHECK_PATH, DEFAULT_DB_PATH, DEFAULT_REPORT_PATH, RAW_ROOT, currentVersion } from "./lib/paths.js";
import { loadRaw, type RawData } from "./lib/raw.js";
import { buildReport, formatReport, type BuildReport, type LoaderStatus } from "./lib/report.js";
import { applySchema, openBuildDb, type DB } from "./lib/sqlite.js";
import { BUILD_TOOL_VERSION, SCHEMA_VERSION } from "./lib/version.js";
import * as items from "./loaders/items.js";
import * as skills from "./loaders/skills.js";
import * as world from "./loaders/world.js";
import { buildSearch } from "./search.js";

/** Build steps in execution order. */
export const STEPS = ["world", "items", "skills", "search", "crosscheck"] as const;
export type Step = (typeof STEPS)[number];

export interface StepRunner {
  run(ctx: LoaderContext): unknown;
  expected: readonly ExpectedCount[];
}

export const DEFAULT_RUNNERS: Record<Step, StepRunner> = {
  world: { run: world.loadWorld, expected: world.expected },
  items: { run: items.loadItems, expected: items.expected },
  skills: { run: skills.loadSkills, expected: skills.expected },
  search: { run: (ctx) => buildSearch(ctx.db, ctx.log), expected: [] },
  crosscheck: { run: runCrosscheck, expected: [] },
};

export interface BuildOptions {
  /** Data version folder (default: data/raw/CURRENT). */
  version?: string;
  /** data/raw root (default: <repo>/data/raw). */
  rawRoot?: string;
  /** Output path, or ':memory:' (default data/le.sqlite). */
  out?: string;
  /** Steps to run (default: all). An empty array runs none (schema + meta only). */
  only?: readonly Step[];
  /** Skip loaders that throw 'not implemented: ...' instead of failing (env LE_DB_ALLOW_STUBS=1). */
  allowStubs?: boolean;
  /** Report path; null = do not write (default data/le.build-report.json). */
  reportPath?: string | null;
  /** Crosscheck report path; null = do not write (default data/crosscheck-report.json). */
  crosscheckPath?: string | null;
  quiet?: boolean;
  /** Replace step implementations (tests). */
  runners?: Partial<Record<Step, StepRunner>>;
}

export interface BuildResult {
  report: BuildReport;
  /** Open database when out = ':memory:' (caller closes it); null otherwise. */
  db: DB | null;
  /** Absolute output path (or ':memory:'). */
  out: string;
  /** True when no step failed and every expected count of a successful loader matched. */
  ok: boolean;
}

/** meta rows from the lockfile, gameVersion and the build tool. Sorted by key. */
export function metaRows(raw: RawData): Record<string, string> {
  const m: Record<string, string> = {};
  const lock = raw.lock;
  m.schema_version = SCHEMA_VERSION;
  m.build_tool_version = BUILD_TOOL_VERSION;
  m.data_version = raw.version;
  m.fetched_at = lock.fetchedAt;
  if (raw.hasGlobal("gameVersion")) {
    const gv = String(raw.letools.gameVersion);
    m.game_version = gv;
    const num = /(\d+(?:\.\d+)+)/.exec(gv);
    if (num) m.game_version_number = num[1]!;
  }
  if (lock.letools) {
    m.data_version_folder = lock.letools.versionFolder;
    m.letools_planner_url = lock.letools.plannerUrl;
    for (const f of lock.letools.files) {
      const base = f.url.split("/").pop() ?? f.url;
      m[`letools_sha256:${f.section}/${base}`] = f.sha256;
    }
    m["letools_sha256:i18n/en.json"] = lock.letools.i18n.sha256;
    m.letools_i18n_url = lock.letools.i18n.url;
  }
  if (lock.maxroll) {
    m.maxroll_data_hash = lock.maxroll.dataHash;
    m.maxroll_sha256 = lock.maxroll.sha256;
    m.maxroll_data_url = lock.maxroll.dataUrl;
    if (lock.maxroll.etag) m.maxroll_etag = lock.maxroll.etag;
    if (lock.maxroll.lastModified) m.maxroll_last_modified = lock.maxroll.lastModified;
  }
  m.sources = [lock.letools ? "letools" : null, lock.maxroll ? "maxroll" : null].filter(Boolean).join(",");
  return Object.fromEntries(Object.entries(m).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

const isStubError = (e: unknown) => e instanceof Error && /^not implemented: /.test(e.message);

/** Build the database. Throws when a step fails (or is a stub without allowStubs). */
export function buildDatabase(opts: BuildOptions = {}): BuildResult {
  const rawRoot = opts.rawRoot ?? RAW_ROOT;
  const version = opts.version ?? currentVersion(rawRoot);
  if (!version) throw new Error(`no data version: ${rawRoot}/CURRENT missing (run \`yarn fetch\`)`);
  const allowStubs = opts.allowStubs ?? process.env.LE_DB_ALLOW_STUBS === "1";
  const only = new Set<Step>(opts.only ?? STEPS);
  const runners: Record<Step, StepRunner> = { ...DEFAULT_RUNNERS, ...(opts.runners ?? {}) };
  const sink = { warnings: [] as string[] };
  const log = createLogger("db", sink, opts.quiet ?? false);

  const raw = loadRaw(version, rawRoot);
  const memory = opts.out === ":memory:";
  const out = memory ? ":memory:" : resolve(opts.out ?? DEFAULT_DB_PATH);
  const tmp = memory ? ":memory:" : `${out}.tmp`;
  if (!memory) {
    mkdirSync(dirname(out), { recursive: true });
    rmSync(tmp, { force: true });
  }

  const db = openBuildDb(tmp);
  let closed = false;
  try {
    applySchema(db);
    const meta = metaRows(raw);
    const ctx = createContext(db, raw, log);

    const loaders: Record<string, LoaderStatus> = {};
    let crosscheck: CrosscheckResult | null = null;
    for (const step of STEPS) {
      if (!only.has(step)) {
        loaders[step] = "skipped";
        continue;
      }
      log.info(`step ${step}`);
      try {
        const r = db.transaction(() => runners[step].run(ctx))();
        if (step === "crosscheck") crosscheck = (r as CrosscheckResult) ?? null;
        loaders[step] = "ok";
      } catch (e) {
        if (isStubError(e) && allowStubs) {
          log.info(`step ${step}: ${(e as Error).message} (skipped, LE_DB_ALLOW_STUBS)`);
          loaders[step] = "stub";
          continue;
        }
        loaders[step] = isStubError(e) ? "stub" : "failed";
        if (isStubError(e)) {
          throw new Error(`${(e as Error).message} - set LE_DB_ALLOW_STUBS=1 or use --only to build without it`, { cause: e });
        }
        throw e;
      }
    }

    meta.loaded_steps = STEPS.filter((s) => loaders[s] === "ok").join(",") || "none";
    const insertMeta = db.prepare(`INSERT INTO meta (key, value) VALUES (?, ?)`);
    db.transaction(() => {
      for (const [k, v] of Object.entries(meta).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) insertMeta.run(k, v);
    })();

    const expected: ExpectedResult[] = STEPS.filter((s) => loaders[s] === "ok").flatMap((s) =>
      checkExpected(db, runners[s].expected).map((r) => ({ ...r, name: `${s}: ${r.name}` })),
    );

    const report = buildReport(db, {
      meta: Object.fromEntries(Object.entries(meta).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))),
      loaders,
      expected,
      warnings: sink.warnings,
      crosscheckMismatches: crosscheck ? crosscheck.mismatches : null,
    });

    const reportPath = opts.reportPath === undefined ? DEFAULT_REPORT_PATH : opts.reportPath;
    if (reportPath) writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
    const crosscheckPath = opts.crosscheckPath === undefined ? DEFAULT_CROSSCHECK_PATH : opts.crosscheckPath;
    if (crosscheck && crosscheckPath) writeFileSync(crosscheckPath, JSON.stringify(crosscheck, null, 2) + "\n");

    const ok = report.expected.failed === 0;
    if (memory) return { report, db, out, ok };

    db.close();
    closed = true;
    rmSync(out, { force: true });
    renameSync(tmp, out);
    return { report, db: null, out, ok };
  } catch (e) {
    if (!closed) db.close();
    if (!memory && existsSync(tmp)) rmSync(tmp, { force: true });
    throw e;
  }
}

/** Parse CLI arguments into BuildOptions. */
export function parseArgs(argv: readonly string[]): BuildOptions {
  const opts: BuildOptions = {};
  let only: Step[] | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    const val = () => {
      const eq = a.indexOf("=");
      if (eq >= 0) return a.slice(eq + 1);
      const v = argv[++i];
      if (v === undefined) throw new Error(`missing value for ${a}`);
      return v;
    };
    const flag = a.split("=")[0];
    switch (flag) {
      case "--only": {
        only ??= [];
        for (const s of val().split(",").map((x) => x.trim()).filter(Boolean)) {
          if (s === "none") continue;
          if (!(STEPS as readonly string[]).includes(s)) throw new Error(`unknown step '${s}' (steps: ${STEPS.join(", ")}, none)`);
          if (!only.includes(s as Step)) only.push(s as Step);
        }
        break;
      }
      case "--version":
        opts.version = val();
        break;
      case "--out":
        opts.out = val();
        break;
      case "--report":
        opts.reportPath = val();
        break;
      case "--no-report":
        opts.reportPath = null;
        opts.crosscheckPath = null;
        break;
      case "--allow-stubs":
        opts.allowStubs = true;
        break;
      case "--quiet":
        opts.quiet = true;
        break;
      case "--help":
      case "-h":
        throw new Error("usage: build-db [--only world,items,skills,search,crosscheck|none] [--version 1.5.2] [--out path] [--report path|--no-report] [--allow-stubs] [--quiet]");
      default:
        throw new Error(`unknown argument '${a}'`);
    }
  }
  if (only) opts.only = only;
  return opts;
}

/** CLI entry: build, print the counts table, exit 1 on failure. */
export function main(argv: readonly string[] = process.argv.slice(2)): number {
  let opts: BuildOptions;
  try {
    opts = parseArgs(argv);
  } catch (e) {
    process.stderr.write(`${(e as Error).message}\n`);
    return 2;
  }
  try {
    const { report, out, ok } = buildDatabase(opts);
    process.stdout.write(`${formatReport(report)}\n\nwrote ${out}\n`);
    return ok ? 0 : 1;
  } catch (e) {
    process.stderr.write(`build failed: ${(e as Error).message}\n`);
    return 1;
  }
}

const invokedDirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invokedDirectly) process.exitCode = main();

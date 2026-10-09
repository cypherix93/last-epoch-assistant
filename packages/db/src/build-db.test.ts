import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { afterAll, describe, expect, it } from "vitest";
import { buildDatabase, parseArgs, STEPS } from "./build-db.js";
import { count } from "./lib/expected.js";
import { currentVersion, hasRawData, RAW_ROOT } from "./lib/paths.js";
import { insertRow } from "./lib/sqlite.js";

describe("parseArgs", () => {
  it("parses --only lists, none and options", () => {
    expect(parseArgs(["--only", "world,items"]).only).toEqual(["world", "items"]);
    expect(parseArgs(["--only=items", "--only", "search"]).only).toEqual(["items", "search"]);
    expect(parseArgs(["--only", "none"]).only).toEqual([]);
    expect(parseArgs(["--out", "x.sqlite", "--no-report", "--allow-stubs", "--quiet"])).toMatchObject({
      out: "x.sqlite",
      reportPath: null,
      allowStubs: true,
      quiet: true,
    });
    expect(parseArgs([]).only).toBeUndefined();
  });
  it("rejects unknown steps and arguments", () => {
    expect(() => parseArgs(["--only", "bogus"])).toThrow(/unknown step/);
    expect(() => parseArgs(["--frobnicate"])).toThrow(/unknown argument/);
  });
  it("orders steps world -> items -> skills -> community -> search -> crosscheck", () => {
    expect(STEPS).toEqual(["world", "items", "skills", "community", "search", "crosscheck"]);
  });
});

describe.skipIf(!hasRawData())("buildDatabase (real raw data)", () => {
  const tmp = mkdtempSync(join(tmpdir(), "le-db-test-"));
  afterAll(() => rmSync(tmp, { recursive: true, force: true }));
  const lock = () => JSON.parse(readFileSync(join(RAW_ROOT, currentVersion()!, "sources.lock.json"), "utf8"));
  const quiet = { quiet: true, reportPath: null, crosscheckPath: null } as const;

  it("--only none produces a db with meta filled from the lockfile", () => {
    const { db, report } = buildDatabase({ ...quiet, only: [], out: ":memory:", allowStubs: true });
    const meta = Object.fromEntries((db!.prepare(`SELECT key, value FROM meta`).all() as { key: string; value: string }[]).map((r) => [r.key, r.value]));
    const l = lock();
    expect(meta.game_version).toBe("Version 1.5.2");
    expect(meta.data_version).toBe(currentVersion());
    expect(meta.data_version_folder).toBe(l.letools.versionFolder);
    expect(meta.fetched_at).toBe(l.fetchedAt);
    expect(meta.schema_version).toBe("1");
    expect(meta.build_tool_version).toMatch(/^@le\/db /);
    expect(meta.maxroll_sha256).toBe(l.maxroll.sha256);
    expect(meta["letools_sha256:i18n/en.json"]).toBe(l.letools.i18n.sha256);
    for (const f of l.letools.files) expect(meta[`letools_sha256:${f.section}/${f.url.split("/").pop()}`]).toBe(f.sha256);
    expect(meta.loaded_steps).toBe("none");
    expect(Object.values(report.loaders)).toEqual(["skipped", "skipped", "skipped", "skipped", "skipped", "skipped"]);
    expect(report.community).toBeNull();
    expect(report.tables.meta).toBe(Object.keys(meta).length);
    expect(report.empty_tables).toContain("mods");
    db!.close();
  });

  it("is deterministic (same report twice)", () => {
    const a = buildDatabase({ ...quiet, only: ["search"], out: ":memory:", allowStubs: true });
    const b = buildDatabase({ ...quiet, only: ["search"], out: ":memory:", allowStubs: true });
    expect(JSON.stringify(a.report)).toBe(JSON.stringify(b.report));
    a.db!.close();
    b.db!.close();
  });

  it("fails loudly on a stub unless stubs are allowed", () => {
    const stub = { run: () => { throw new Error("not implemented: items"); }, expected: [] };
    expect(() => buildDatabase({ ...quiet, only: ["items"], out: ":memory:", allowStubs: false, runners: { items: stub } })).toThrow(
      /not implemented: items/,
    );
    const { db, report } = buildDatabase({ ...quiet, only: ["items"], out: ":memory:", allowStubs: true, runners: { items: stub } });
    expect(report.loaders.items).toBe("stub");
    db!.close();
  });

  it("rolls back a stub step and checks expected counts of successful steps", () => {
    const world = {
      run: (ctx: { db: Database.Database }) => {
        insertRow(ctx.db, "tag_bits", { value: 1, bit: 0, name: "Physical" });
      },
      expected: [count("tag_bits", 1), count("tag_bits", 2, undefined, "wrong")],
    };
    const items = {
      run: (ctx: { db: Database.Database }) => {
        insertRow(ctx.db, "affix_display_categories", { idx: 0, name_key: "x" });
        throw new Error("not implemented: items");
      },
      expected: [count("affix_display_categories", 99)],
    };
    const { db, report, ok } = buildDatabase({ ...quiet, only: ["world", "items"], out: ":memory:", allowStubs: true, runners: { world, items } });
    expect(report.tables.tag_bits).toBe(1);
    expect(report.tables.affix_display_categories).toBe(0);
    expect(report.expected.results.map((r) => [r.name, r.ok])).toEqual([
      ["world: tag_bits", true],
      ["world: wrong", false],
    ]);
    expect(ok).toBe(false);
    db!.close();
  });

  it("evaluates function-valued expected counts after the step and reports the community result", () => {
    const fake = { present: true, guides: 1, builds: 1, profiles_loaded: 1, profiles_missing: 0, tabs: 1, items: 0, affixes: 0,
      resolution: "ok", unresolved_total: 0, unresolved: {}, unnamed_properties: [] };
    const community = {
      run: (ctx: { db: Database.Database }) => {
        insertRow(ctx.db, "community_builds", { build_id: 1, source: "maxroll", slug: "x", is_primary: 1, profile_status: "none", raw_json: "{}" });
        return fake;
      },
      expected: () => [count("community_builds", 1)],
    };
    const { db, report, ok } = buildDatabase({ ...quiet, only: ["community"], out: ":memory:", runners: { community } });
    expect(report.expected.results.map((r) => [r.name, r.ok])).toEqual([["community: community_builds", true]]);
    expect(report.community).toEqual(fake);
    expect(ok).toBe(true);
    db!.close();
  });

  it("writes to a temp file, renames it into place and writes the report", () => {
    const out = join(tmp, "le.sqlite");
    const reportPath = join(tmp, "le.build-report.json");
    const r = buildDatabase({ quiet: true, only: [], out, reportPath, crosscheckPath: null });
    expect(r.db).toBeNull();
    expect(existsSync(out)).toBe(true);
    expect(existsSync(`${out}.tmp`)).toBe(false);
    const report = JSON.parse(readFileSync(reportPath, "utf8"));
    expect(report.meta.game_version).toBe("Version 1.5.2");
    const db = new Database(out, { readonly: true });
    expect((db.prepare(`SELECT value FROM meta WHERE key = 'data_version_folder'`).get() as { value: string }).value).toBe("version152");
    db.close();
    // rebuild over an existing file
    buildDatabase({ quiet: true, only: [], out, reportPath: null, crosscheckPath: null });
    expect(existsSync(out)).toBe(true);
  });
});

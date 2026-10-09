import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createContext, findMods, getTool, knowledge, lookup, name, passiveTree, resolveDbPath, scanSql, schema, search, skillTree, sql, version, REPO_ROOT, type Ctx } from "./index.js";

const dbPath = resolveDbPath();
const have = existsSync(dbPath);
if (!have) console.warn(`[@le/mcp tests] SKIPPED: ${dbPath} missing; run \`yarn db:build\` first.`);

type R = Record<string, any>;

describe.skipIf(!have)("@le/mcp tools (real data/le.sqlite)", () => {
  let ctx: Ctx;
  beforeAll(() => {
    ctx = createContext();
  });
  afterAll(() => ctx?.db.close());

  it("exports its name", () => expect(name).toBe("@le/mcp"));

  it("version", () => {
    const v = version(ctx) as R;
    expect(v.meta.game_version).toBe("Version 1.5.2");
    expect(Object.keys(v.meta).length).toBeGreaterThan(10);
  });

  it("schema", () => {
    const s = schema(ctx) as R;
    expect(s.table_count).toBe(62);
    expect(s.tables.find((t: R) => t.name === "mods").rows).toBeGreaterThan(20000);
    expect(s.docs).toBe("docs/schema.md");
    const m = schema(ctx, "uniques") as R;
    expect(m.columns.map((c: R) => c.name)).toContain("unique_id");
    expect(m.samples).toHaveLength(3);
    expect(m.samples[0]).not.toHaveProperty("raw_json");
    expect(() => schema(ctx, "nope")).toThrow(/Unknown table/);
  });

  it("search", () => {
    const r = search(ctx, "fireball") as R;
    expect(r.results.slice(0, 10).some((x: R) => x.kind === "ability" && x.id === "fi9")).toBe(true);
    expect(r.results[0].snippet).toContain("<b>");
    expect(search(ctx, 'fire" AND (', ["unique"], 5).results.length).toBeLessThanOrEqual(5);
    expect((search(ctx, "name:fireball", ["ability"]) as R).results[0].name).toBe("Fireball");
  });

  it("search raw=true passes FTS5 operators through; default stays safe-quoted", () => {
    const plain = search(ctx, "fireball OR frostbolt", undefined, 50) as R;
    const raw = search(ctx, "fireball OR frostbolt", ["ability"], 50, true) as R;
    expect(raw.query).toBe("fireball OR frostbolt");
    const names = new Set(raw.results.map((x: R) => x.name));
    expect(names.has("Fireball") && names.has("Frostbolt")).toBe(true);
    expect(plain.query).toContain('"OR"');
    expect((search(ctx, "name:fireb*", ["ability"], 5, true) as R).results[0].name).toMatch(/^Fireb/);
    expect((search(ctx, "NEAR(void penetration, 3)", undefined, 5, true) as R).count).toBeGreaterThan(0);
    expect(() => search(ctx, 'fire" AND (', undefined, 5, true)).toThrow(/FTS5 error/);
    expect(() => search(ctx, "   ", undefined, 5, true)).toThrow(/Empty/);
  });

  it("get", () => {
    const u = getTool(ctx, "unique", 0) as R;
    expect(u.unique.name).toBe("Calamity");
    expect(u.mods).toHaveLength(3);
    expect(u.unique).not.toHaveProperty("raw_json");
    expect(u.note).toMatch(/lp_eligible is DERIVED/);
    expect(u.unique.lp_eligible).toBe(1);
    expect(u.unique.legendary_type).toBe(0);
    expect((getTool(ctx, "unique", 0, true) as R).unique.raw).toBeTruthy();
    const a = getTool(ctx, "affix", 0) as R;
    expect(a.affix.name).toBe("Void Penetration");
    expect(a.tiers[0].mods.length).toBeGreaterThan(0);
    expect((getTool(ctx, "ability", "fi9") as R).has_tree).toBe(true);
    expect((getTool(ctx, "class", 1) as R).class.name).toBe("Mage");
    expect((getTool(ctx, "skill_node", "fi9:2") as R).node.name).toBe("Piercing Heat");
    expect((getTool(ctx, "subtype", { base: 9, sub: 6 }) as R).subtype.name).toBeTruthy();
    expect(() => getTool(ctx, "bogus", 1)).toThrow(/Valid kinds/);
  });

  it("lookup", () => {
    const r = lookup(ctx, "Fireball") as R;
    expect(r.results[0]).toMatchObject({ kind: "ability", id: "fi9" });
    const c = lookup(ctx, "calamity", ["unique"]) as R;
    expect(c.results[0]).toMatchObject({ kind: "unique", id: "0", name: "Calamity" });
    expect((lookup(ctx, "Fireb") as R).results.length).toBeGreaterThan(0);
  });

  it("find_mods", () => {
    const w = findMods(ctx, { property_name: "ward", source_kinds: ["unique_mod"] }) as R;
    expect(w.rows.length).toBeGreaterThan(0);
    expect(w.rows.every((x: R) => x.source_name && x.source_kind === "unique_mod")).toBe(true);
    const m = findMods(ctx, { tags_any: ["Minion"] }, 500) as R;
    expect(m.rows.length).toBeGreaterThan(0);
    expect(m.rows.every((x: R) => x.tags === 0 || (x.tags & 8192) !== 0)).toBe(true);
    const strict = findMods(ctx, { tags_any: ["Minion"], include_untagged: false }, 500) as R;
    expect(strict.rows.every((x: R) => (x.tags & 8192) !== 0)).toBe(true);
    expect(() => findMods(ctx, { tags_any: ["Nope"] })).toThrow(/Valid names/);
    expect((findMods(ctx, { tags_any: [8192] }) as R).count).toBeGreaterThan(0);
  });

  it("skill_tree / passive_tree", () => {
    const t = skillTree(ctx, "fi9") as R;
    expect(t.nodes.find((n: R) => n.id === 2).name).toBe("Piercing Heat");
    expect(t.nodes.find((n: R) => n.id === 2).mods.length).toBeGreaterThan(0);
    const p = passiveTree(ctx, 1) as R;
    expect(p.tree.tree_id).toBe("mg-1");
    expect(p.class.name).toBe("Mage");
    expect(p.node_count).toBeGreaterThan(50);
    expect((passiveTree(ctx, "Mage") as R).tree.tree_id).toBe("mg-1");
    expect((passiveTree(ctx, "mg-1") as R).tree.tree_id).toBe("mg-1");
  });

  it("enriched get: ability components, affix, unique, ailment names", () => {
    const fi = getTool(ctx, "ability", "fi9") as R;
    const dmg = fi.components.find((c: R) => c.component_type === "DamageEnemyOnHit").decoded;
    expect(dmg.damage).toEqual({ fire: 25 });
    expect(dmg.added_damage_scaling).toBe(1.25);
    expect(dmg.damage_tags).toContain("Spell");
    const ign = fi.components.find((c: R) => c.component_type === "ChanceToApplyAilmentsOnHit").decoded;
    expect(ign.ailments[0]).toMatchObject({ id: 1, name: "Ignite", chance: 0.4 });
    expect(fi.components.find((c: R) => c.component_type === "DestroyAfterDuration").decoded.duration).toBeGreaterThan(0);
    expect(fi.components[0].fields).toBeTruthy();
    expect(fi.ability.tags_names).toEqual(expect.arrayContaining(["Fire", "Spell"]));
    const vn = getTool(ctx, "ability", "vn53") as R;
    const pz = vn.components.find((c: R) => c.decoded?.ailments).decoded.ailments[0];
    expect(pz).toMatchObject({ name: "Poison", chance: 1 });
    const cd = (sql(ctx, "select ability_id, charges_gained_per_second c from abilities where charges_gained_per_second > 0 limit 1") as R).rows[0];
    const withCd = getTool(ctx, "ability", cd.ability_id) as R;
    expect(withCd.ability.cooldown_seconds).toBeCloseTo(1 / cd.c, 5);

    const af = getTool(ctx, "affix", 26) as R;
    expect(af.affix.type_name).toMatch(/prefix|suffix/);
    expect(af.can_roll_on.length).toBeGreaterThan(0);
    expect(af.can_roll_on.every((x: R) => typeof x.name === "string")).toBe(true);
    expect(af.tiers[0].mods[0]).not.toHaveProperty("source_ord");

    const un = getTool(ctx, "unique", 0) as R;
    expect(un.unique.base_type_name).toBe("Helmet");
    expect(un.unique.sub_type_name).toBeTruthy();
    const withAilTag = (sql(ctx, "select source_id from mods where source_kind='unique_mod' and property=1 and special_tag=1 limit 1") as R).rows[0];
    const um = (getTool(ctx, "unique", Number(withAilTag.source_id)) as R).mods.find((m: R) => m.property === 1 && m.special_tag === 1);
    expect(um.special_tag_name).toBe("Ignite");
    const setU = (sql(ctx, "select unique_id from uniques where set_id is not null limit 1") as R).rows[0];
    expect((getTool(ctx, "unique", setU.unique_id) as R).unique.set_name).toBeTruthy();
  });

  it("tree requires is structured; filter and compact", () => {
    const t = skillTree(ctx, "fi9") as R;
    const n4 = t.nodes.find((n: R) => n.id === 4);
    expect(n4.requires[0]).toEqual({ node_id: 2, node_name: "Piercing Heat", points: 2 });
    expect(n4.requires[1].node_id).toBe(6);
    expect(n4.requires_text).toBe("2>=2,6>=2"); // deprecated alias
    // requirements are ANY-ONE-OF (adjacency): es6ai nodes 8 and 11 list each other, so AND could never be satisfied
    expect(n4.unlocked_by_text).toBe("2>=2|6>=2");
    expect(n4.unlocked_by).toEqual(n4.requires);
    const es = skillTree(ctx, "es6ai") as R;
    const e8 = es.nodes.find((n: R) => n.id === 8);
    const e11 = es.nodes.find((n: R) => n.id === 11);
    expect(e8.unlocked_by_text).toBe("11>=2|12>=1");
    expect(e11.unlocked_by.map((r: R) => r.node_id)).toContain(8);
    const sum = sql(ctx, "SELECT unlocked_by, requires FROM v_skill_node_summary WHERE tree_id = 'es6ai' AND node_id = 8") as R;
    expect(sum.rows[0]).toEqual({ unlocked_by: "11>=2|12>=1", requires: "11>=2,12>=1" });
    const all_ = passiveTree(ctx, 1) as R;
    const f = passiveTree(ctx, 1, { filter: "ward" }) as R;
    expect(f.nodes.length).toBeGreaterThan(0);
    expect(f.nodes.length).toBeLessThan(all_.nodes.length);
    expect(f.node_count).toBe(all_.node_count);
    expect(f.nodes.every((n: R) => JSON.stringify(n).toLowerCase().includes("ward"))).toBe(true);
    expect(((passiveTree(ctx, 1, { filter: "ward", compact: true }) as R).nodes[0])).not.toHaveProperty("description");
    expect(((passiveTree(ctx, 1, { compact: true }) as R).nodes[0])).not.toHaveProperty("x");
  });

  it("tree node stats say whether they scale with points", () => {
    const av = skillTree(ctx, "av75ch", { filter: "Precision" }) as R;
    const [perPoint, fixed] = av.nodes[0].mods;
    expect(perPoint).toMatchObject({ scales_with_points: true, scaling: "per_point" });
    expect(fixed).toMatchObject({ scales_with_points: false, scaling: "fixed", display: "60%" });
    expect(fixed).not.toHaveProperty("no_scaling");
    const chase = (passiveTree(ctx, "pr-1", { filter: "The Chase" }) as R).nodes[0];
    expect(chase).toMatchObject({ no_scaling_type: 1, no_scaling_point_threshold: 5 });
    expect(chase.point_bonus_description).toMatch(/cannot be damaged/);
    expect(chase.mods.at(-1)).toMatchObject({ scales_with_points: false, scaling: "at_threshold", threshold: 5 });
    const node = getTool(ctx, "skill_node", "av75ch:3") as R;
    expect(node.mods.map((m: R) => m.scaling)).toEqual(["per_point", "fixed"]);
    const rows = sql(ctx, "SELECT no_scaling, count(*) AS n FROM mods WHERE source_kind = 'skill_node' GROUP BY 1 ORDER BY 1") as R;
    expect(rows.rows.map((r: R) => r.no_scaling)).toEqual([0, 1]);
    expect((sql(ctx, "SELECT count(*) AS n FROM mods WHERE source_kind = 'unique_mod' AND no_scaling IS NOT NULL") as R).rows[0].n).toBe(0);
  });

  it("search node hits carry tree_id and node_id", () => {
    const r = search(ctx, "piercing heat", ["skill_node"]) as R;
    const h = r.results.find((x: R) => x.id === "fi9:2");
    expect(h).toMatchObject({ tree_id: "fi9", node_id: 2 });
  });

  it("drop-rate blessings: tags are a base type, not damage tags", () => {
    const r = findMods(ctx, { property: 104, source_kinds: ["blessing"], source_id: "34:63" }) as R;
    expect(r.rows[0]).toMatchObject({ property_name: "Increased Drop Rate", tags: 1, property_kind: "drop_category", drop_target: "Body Armor" });
    expect(r.rows[0].tag_names).toBeUndefined();
    const phys = findMods(ctx, { tags_all: ["Physical"], source_kinds: ["blessing"], include_untagged: false }, 2000) as R;
    expect(phys.rows.some((x: R) => x.property === 104)).toBe(false);
  });

  it("find_mods ignores indirect-property rows in tag filters", () => {
    const rows = (findMods(ctx, { tags_any: ["Minion"] }, 2000) as R).rows;
    expect(rows.some((x: R) => [58, 98, 130].includes(x.property) && (x.tags & 8192) !== 0 && x.tags !== 0)).toBe(false);
    const all_ = (findMods(ctx, { tags_any: ["Minion"], include_indirect: true }, 2000) as R).total_matching;
    expect(all_).toBeGreaterThanOrEqual((findMods(ctx, { tags_any: ["Minion"] }, 1) as R).total_matching);
    const strict = (findMods(ctx, { tags_all: ["Minion"] }, 2000) as R).rows;
    expect(strict.some((x: R) => [58, 98, 130].includes(x.property))).toBe(false);
  });

  it("sql", () => {
    expect(() => sql(ctx, "DELETE FROM meta")).toThrow();
    expect(() => sql(ctx, "SELECT 1; SELECT 2")).toThrow(/single/);
    expect(() => sql(ctx, "SELECT 1; DROP TABLE meta")).toThrow();
    const ok = sql(ctx, "WITH x AS (SELECT 1 AS a) SELECT a FROM x") as R;
    expect(ok.rows).toEqual([{ a: 1 }]);
    const capped = sql(ctx, "SELECT * FROM mods", [], 5) as R;
    expect(capped.rows).toHaveLength(5);
    expect(capped.truncated).toBe(true);
    expect((sql(ctx, "select count(*) n from uniques where unique_id = ?;", [0]) as R).rows[0].n).toBe(1);
  });

  it("sql tolerates ';' inside literals/comments but not between statements", () => {
    expect((sql(ctx, "SELECT group_concat(name, '; ') AS g FROM classes") as R).rows[0].g).toContain("; ");
    expect((sql(ctx, "SELECT 'it''s; ok' AS a, \"x;y\" AS b FROM (SELECT 1 AS \"x;y\")") as R).rows[0].a).toBe("it's; ok");
    expect((sql(ctx, ["SELECT 1 AS a -- trailing; comment", ""].join("\n")) as R).rows[0].a).toBe(1);
    expect((sql(ctx, "SELECT /* a;b */ 2 AS a;") as R).rows[0].a).toBe(2);
    expect((sql(ctx, "SELECT 3 AS a; -- done") as R).rows[0].a).toBe(3);
    expect(() => sql(ctx, "SELECT 'a'; SELECT 'b'")).toThrow(/single/);
    expect(() => sql(ctx, "SELECT 1 /* ; */ ; DELETE FROM meta")).toThrow(/single/);
    expect(scanSql("select ';' ; x").semicolonAt).toBeGreaterThan(0);
  });

  it("sql allows only the read-only schema pragmas", () => {
    const info = sql(ctx, "PRAGMA table_info(affixes)") as R;
    expect(info.rows.map((r: R) => r.name)).toContain("affix_id");
    expect((sql(ctx, "pragma table_info('uniques');") as R).rows.map((r: R) => r.name)).toContain("unique_id");
    expect((sql(ctx, 'PRAGMA table_info("mods")') as R).rows.length).toBeGreaterThan(5);
    expect((sql(ctx, "PRAGMA table_info(no_such_table)") as R).rows).toEqual([]);
    const list = sql(ctx, "PRAGMA table_list") as R;
    expect(list.rows.some((r: R) => r.name === "mods")).toBe(true);
    expect((sql(ctx, "PRAGMA index_list(mods)") as R).columns).toContain("unique");
    for (const bad of [
      "PRAGMA journal_mode = WAL",
      "PRAGMA writable_schema = 1",
      "PRAGMA user_version",
      "PRAGMA table_info(mods) ; DROP TABLE meta",
      "PRAGMA table_info(mods); PRAGMA foreign_keys = OFF",
      "PRAGMA table_info(x') union select 1 --)",
      "PRAGMA main.table_info(mods)",
    ]) {
      expect(() => sql(ctx, bad), bad).toThrow();
    }
  });

  it("knowledge", () => {
    const l = knowledge(ctx) as R;
    expect(l.pages.length).toBeGreaterThanOrEqual(20);
    expect(l.pages.some((p: R) => p.path === ".claude/skills/le-data-query/SKILL.md")).toBe(true);
    const k = knowledge(ctx, "damage-pipeline.md") as R;
    expect(k.text).toContain("Game version");
    expect((knowledge(ctx, "knowledge/mechanics/damage-pipeline.md") as R).path).toBe(k.path);
    expect((knowledge(ctx, "interactions/catalogue") as R).path).toBe("knowledge/interactions/catalogue.md");
    expect(() => knowledge(ctx, "nope")).toThrow();
  });
});

describe.skipIf(!have)("@le/mcp over stdio (SDK client)", () => {
  it("calls version and search through a spawned server", async () => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["--import", "tsx", join(REPO_ROOT, "packages", "mcp", "src", "cli.ts"), "start"],
      cwd: REPO_ROOT,
      stderr: "inherit",
    });
    const client = new Client({ name: "test", version: "0" });
    await client.connect(transport);
    try {
      const tools = (await client.listTools()).tools.map((t) => t.name);
      expect(tools).toHaveLength(10);
      const call = async (n: string, a: object) => {
        const res = await client.callTool({ name: n, arguments: a });
        return JSON.parse((res.content as { text: string }[])[0].text) as R;
      };
      const v = await call("version", {});
      expect(v.ok).toBe(true);
      expect(v.meta.game_version).toBe("Version 1.5.2");
      const s = await call("search", { query: "fireball", limit: 10 });
      expect(s.ok).toBe(true);
      expect(s.results.some((x: R) => x.id === "fi9")).toBe(true);
      const bad = await call("get", { kind: "nope", id: 1 });
      expect(bad).toMatchObject({ ok: false });
    } finally {
      await client.close();
    }
  }, 60_000);
});

describe.skipIf(!have)("@le/mcp CLI call arg forms", () => {
  const cli = join(REPO_ROOT, "packages", "mcp", "src", "cli.ts");
  const run = (args: string[], input?: string) =>
    spawnSync(process.execPath, ["--import", "tsx", cli, "call", ...args], { cwd: REPO_ROOT, input, encoding: "utf8" });
  const Q = `select name from uniques where name like '%Claim%' and unique_id > 0 and "name" <> 'x'`;
  const dir = mkdtempSync(join(tmpdir(), "le-cli-"));

  it("stdin JSON (omitted and '-'), compact single-line stdout", () => {
    for (const a of [["sql"], ["sql", "-"]]) {
      const r = run(a, JSON.stringify({ query: Q }));
      expect(r.status).toBe(0);
      expect(r.stdout.trim().split("\n")).toHaveLength(1);
      expect(JSON.parse(r.stdout).rows[0].name).toBe("Culnivar's Claim");
    }
  }, 60_000);

  it("stdin raw SQL for the sql tool, with a UTF-8 BOM", () => {
    const r = run(["sql"], "\ufeff" + Q);
    expect(JSON.parse(r.stdout).rows[0].name).toBe("Culnivar's Claim");
  }, 60_000);

  it("@file JSON, @file raw SQL and --query-file", () => {
    const j = join(dir, "a.json");
    writeFileSync(j, JSON.stringify({ query: Q }));
    const s = join(dir, "q.sql");
    writeFileSync(s, Q);
    expect(JSON.parse(run(["sql", "@" + j]).stdout).row_count).toBe(1);
    expect(JSON.parse(run(["sql", "@" + s]).stdout).row_count).toBe(1);
    expect(JSON.parse(run(["sql", "--query-file", s]).stdout).row_count).toBe(1);
  }, 60_000);

  it("inline JSON still works, --pretty indents, bad JSON fails", () => {
    expect(JSON.parse(run(["lookup", '{"name":"Fireball"}']).stdout).ok).toBe(true);
    expect(run(["version", "{}", "--pretty"]).stdout).toContain("\n  ");
    const bad = run(["sql", '{"query":']);
    expect(bad.status).toBe(1);
    expect(bad.stderr).toContain("Invalid JSON args");
  }, 60_000);

  it("list prints argument schemas; list --json is the raw tool list", () => {
    const sh = (args: string[]) => spawnSync(process.execPath, ["--import", "tsx", cli, ...args], { cwd: REPO_ROOT, encoding: "utf8" });
    const txt = sh(["list"]).stdout;
    expect(txt).toMatch(/^ {4}query\tstring\trequired/m);
    expect(txt).toMatch(/^ {4}limit\tinteger \[1\.\.5000]\toptional \(default 500\)/m);
    expect(txt).toMatch(/^ {4}ability_id\tstring\trequired/m);
    const raw = JSON.parse(sh(["list", "--json"]).stdout) as { name: string; inputSchema: { properties: object } }[];
    expect(raw.map((t) => t.name)).toContain("sql");
    expect(Object.keys(raw.find((t) => t.name === "sql")!.inputSchema.properties)).toEqual(["query", "params", "limit"]);
  }, 60_000);
});

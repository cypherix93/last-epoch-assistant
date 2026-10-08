import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createContext, findMods, getTool, knowledge, lookup, name, passiveTree, resolveDbPath, schema, search, skillTree, sql, version, REPO_ROOT, type Ctx } from "./index.js";

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

  it("get", () => {
    const u = getTool(ctx, "unique", 0) as R;
    expect(u.unique.name).toBe("Calamity");
    expect(u.mods).toHaveLength(3);
    expect(u.unique).not.toHaveProperty("raw_json");
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

import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createContext, decodePlannerId, desktopUserAgent, fetchPlanner, parsePlannerRef, planner, resolveDbPath, rhe, rollValue, runTool, TOOL_DEFS, type Ctx } from "./index.js";

type R = Record<string, any>;
const FIXTURE = join(__dirname, "__fixtures__", "planner-oYEPpxWw.json");
const have = existsSync(resolveDbPath());

describe("planner links", () => {
  it("parses share links and bare ids", () => {
    const url = "https://www.lastepochtools.com/planner/oYEPpxWw";
    for (const s of [url, `${url}/`, `${url}#gear`, `${url}?x=1`, "www.lastepochtools.com/planner/oYEPpxWw", "  oYEPpxWw "]) {
      expect(parsePlannerRef(s)).toEqual({ id: "oYEPpxWw", url });
    }
  });
  it("rejects other links and bad ids", () => {
    expect(() => parsePlannerRef("https://maxroll.gg/last-epoch/planner/abc")).toThrow(/Not an LE Tools planner/);
    expect(() => parsePlannerRef("https://www.lastepochtools.com/items")).toThrow(/Not an LE Tools planner/);
    expect(() => parsePlannerRef("a b")).toThrow(/Invalid planner build id/);
    expect(() => parsePlannerRef("")).toThrow(/Empty/);
  });
  it("builds a desktop user agent from the browser version", () => {
    expect(desktopUserAgent("145.0.7632.6")).toMatch(/Chrome\/145\.0\.0\.0 Safari\/537\.36$/);
    expect(desktopUserAgent("145.0.7632.6")).not.toMatch(/Headless/);
  });
});

describe("planner ids and rolls", () => {
  it("decodes compact ids", () => {
    expect(decodePlannerId("AKwBmQ")).toMatchObject({ kind: "A", affix_id: 505 });
    expect(decodePlannerId("UAwRhCYHYSA")).toMatchObject({ kind: "U", unique_id: 271, sub_type_id: 11 }); // Gathering Fury, sub type 11
    expect(decodePlannerId("IIwBjIFgNnI")).toMatchObject({ kind: "I", base_type_id: 0, sub_type_id: 46 });
    expect(decodePlannerId("IIwBgzALATKJ0A")).toMatchObject({ kind: "I", base_type_id: 34, sub_type_id: 210 }); // a blessing
    expect(decodePlannerId("Xnope")).toBeNull();
    expect(decodePlannerId(42)).toBeNull();
  });
  it("rounds half to even", () => {
    expect([rhe(91.5), rhe(92.5), rhe(22.5), rhe(-2.5), rhe(2.4), rhe(2.6)]).toEqual([92, 92, 22, -2, 2, 3]);
  });
  it("matches the stat-model roll test vectors (knowledge/mechanics/stat-model.md, D)", () => {
    expect([0, 128, 255].map((b) => rollValue(61, 90, 1, b))).toEqual([61, 76, 90]); // Added Health T5, helmet
    expect([0, 255].map((b) => rollValue(61, 90, 1, b, 1.5))).toEqual([92, 135]); // same on body armour
    expect(rollValue(0.61, 0.75, 100, 200)).toBe(0.72); // Fire Resistance T7
    expect(rollValue(0.15, 0.2, 100, 100, 1.5)).toBe(0.25); // Increased Health T6 on body armour
    expect(rollValue(85, 100, 1, 255, (1 + 2.2) / (1 + 0.75))).toBe(183); // Added Melee Physical T8 on a 2H axe
  });
});

describe("planner cache (no browser)", () => {
  it("serves a cached build without loading a page", async () => {
    const dir = mkdtempSync(join(tmpdir(), "le-planner-"));
    const data = JSON.parse(readFileSync(FIXTURE, "utf8")).data;
    writeFileSync(join(dir, "oYEPpxWw.json"), JSON.stringify({ id: "oYEPpxWw", url: "u", data, title: "t", data_version: "version152", fetched_at: "2026-10-20T00:00:00Z" }));
    const f = await fetchPlanner(parsePlannerRef("oYEPpxWw"), { cache: dir });
    expect(f.from).toBe("cache");
    expect(f.data_version).toBe("version152");
    expect((f.data as R).bio.level).toBe(81);
  });
});

describe.skipIf(!have)("planner tool (real data/le.sqlite)", () => {
  let ctx: Ctx;
  let r: R;
  beforeAll(async () => {
    ctx = createContext();
    r = (await planner(ctx, { file: FIXTURE })) as R;
  });
  afterAll(() => ctx?.db.close());

  const item = (slot: string) => r.gear.find((g: R) => g.slot === slot);
  const lines = (g: R) => g.affixes.map((a: R) => a.display);

  it("names the character", () => {
    expect(r.planner).toMatchObject({ from: "file", from_save_file: 2 });
    expect(r.character).toMatchObject({ class: "Rogue", mastery: "Marksman", level: 81, passive_points: 88, skill_points: 100 });
    expect(r.character.skills).toEqual(["Detonating Arrow", "Cinder Strike", "Explosive Trap", "Smoke Bomb", "Dark Quiver"]);
    expect(r.character.uniques).toContain("Carrion of Creation");
  });

  it("decodes rares with tiers, origins and rolled values", () => {
    const body = item("body");
    expect(body).toMatchObject({ name: "Brigandine Armor", kind: "exalted" });
    expect(lines(body)).toContain("+20 Dexterity (T6)");
    expect(body.affixes.find((a: R) => a.origin === "sealed").display).toBe("+12% increased Health (T4)");
    expect(lines(item("waist"))).toContain("+91 Health; +6% increased Health (T6)");
    expect(item("head").affixes.find((a: R) => a.origin === "corruption").name).toMatch(/Increased Health/);
  });

  it("rolls unique mods by rollId and keeps legendary affixes", () => {
    const hands = item("hands");
    expect(hands).toMatchObject({ name: "Carrion of Creation", kind: "unique", unique_id: 431 });
    expect(hands.effects).toContain("+108% Bleed Chance");
    const bow = item("weapon");
    expect(bow.kind).toBe("legendary");
    expect(bow.affixes.map((a: R) => a.origin)).toEqual(["legendary_potential", "corruption"]);
    expect(item("offhand").effects).toContain("+3 Health Gained when you receive a Glancing Blow"); // SP 98 rounds to integers
    expect(item("neck")).toMatchObject({ name: "Inheritance of the Erased", kind: "weavers_will" });
  });

  it("decodes idols, blessings, passives, skills and the Weaver tree", () => {
    expect(r.idols.map((i: R) => [i.grid_x, i.grid_y, i.size])).toEqual([
      [2, 4, "1x2"],
      [3, 4, "1x2"],
      [4, 4, "1x2"],
    ]);
    expect(r.blessings).toHaveLength(1);
    expect(r.blessings[0]).toMatchObject({ name: "Swiftness of Logi", lines: ["+25% increased Dodge Rating"] });
    expect(r.passives.map((p: R) => [p.mastery, p.points])).toEqual([
      ["Rogue", 20],
      ["Bladedancer", 8],
      ["Marksman", 55],
      ["Falconer", 5],
    ]);
    const cinder = r.skills.find((s: R) => s.name === "Cinder Strike");
    expect(cinder.points).toBe(20);
    expect(cinder.nodes.map((n: R) => n.name)).toEqual(expect.arrayContaining(["Flame Alchemist", "Flame Engineer", "Soot and Ash"]));
    expect(r.weaver).toHaveLength(16);
  });

  it("warns about class-specific affixes the class cannot craft", () => {
    expect(r.warnings.map((w: R) => w.kind)).toEqual(["class_affix", "class_affix", "class_affix"]);
    expect(r.warnings[0].message).toMatch(/^ring1: Void Damage is a Sentinel class affix/);
  });

  it("accepts pasted JSON and limits sections", async () => {
    const text = readFileSync(FIXTURE, "utf8");
    const a = (await planner(ctx, { json: text, sections: ["skills"] })) as R;
    expect(a.planner.from).toBe("json");
    expect(a.skills).toHaveLength(5);
    expect(a.gear).toBeUndefined();
    const b = (await planner(ctx, { json: JSON.parse(text).data, sections: ["blessings"] })) as R;
    expect(b.blessings[0].name).toBe("Swiftness of Logi");
  });

  it("validates its arguments through the tool envelope", async () => {
    const def = TOOL_DEFS.find((d) => d.name === "planner")!;
    expect(await runTool(ctx, def, {})).toMatchObject({ ok: false, error: expect.stringMatching(/exactly one of/) });
    expect(await runTool(ctx, def, { url: "x", file: "y" })).toMatchObject({ ok: false });
    expect(await runTool(ctx, def, { json: "{nope" })).toMatchObject({ ok: false, error: expect.stringMatching(/not valid JSON/) });
    expect(await runTool(ctx, def, { json: { foo: 1 } })).toMatchObject({ ok: false, error: expect.stringMatching(/no bio/) });
    expect(await runTool(ctx, def, { file: FIXTURE, sections: ["nope"] })).toMatchObject({ ok: false, error: expect.stringMatching(/Unknown section/) });
  });
});

// Loads the real page in a local browser; opt in with LE_PLANNER_LIVE=1.
describe.skipIf(!have || !process.env.LE_PLANNER_LIVE)("planner live fetch", () => {
  it("fetches a share link through a browser", async () => {
    const dir = mkdtempSync(join(tmpdir(), "le-planner-live-"));
    const f = await fetchPlanner(parsePlannerRef("https://www.lastepochtools.com/planner/oYEPpxWw"), { cache: dir, refresh: true });
    expect(f.from).toBe("network");
    expect(f.title).toMatch(/Marksman/);
    expect(existsSync(join(dir, "oYEPpxWw.json"))).toBe(true);
  }, 120000);
});

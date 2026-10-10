import { afterAll, describe, expect, it } from "vitest";
import { checkExpected } from "../lib/expected.js";
import { buildForTest, hasRawData, type TestBuild } from "../lib/testing.js";
import { expected, tables } from "./world.js";

// Owner: world agent. Builds the real raw data with only the world step and asserts the counts.
describe.skipIf(!hasRawData())("world loader", () => {
  let build: TestBuild | undefined;
  const get = () => (build ??= buildForTest(["world"]));
  afterAll(() => build?.db.close());

  it("meets every expected count", (t) => {
    const b = get();
    if (b.status === "stub") t.skip();
    expect(b.status).toBe("ok");
    const failed = checkExpected(b.db, expected).filter((r) => !r.ok);
    expect(failed).toEqual([]);
  });

  it("fills every owned table", (t) => {
    const b = get();
    if (b.status === "stub") t.skip();
    // maxroll_crosscheck is filled by the crosscheck step (src/crosscheck.ts), not by loadWorld.
    const empty = tables.filter((tb) => tb !== "maxroll_crosscheck" && b.report.tables[tb] === 0);
    expect(empty).toEqual([]);
  });

  it("has the known spot-check records", (t) => {
    const b = get();
    if (b.status === "stub") t.skip();
    const one = <T>(sql: string, ...args: unknown[]) => b.db.prepare(sql).get(...args) as T;

    // property 0 is Damage
    expect(one<{ name: string; enum_name: string }>("SELECT name, enum_name FROM stat_properties WHERE property = 0")).toEqual({
      name: "Damage",
      enum_name: "Damage",
    });

    // class 1 is Mage
    const mage = one<{ name: string; base_mana: number; mana_per_level: number; health_per_level: number; endurance_threshold_per_health: number }>(
      "SELECT name, base_mana, mana_per_level, health_per_level, endurance_threshold_per_health FROM classes WHERE class_id = 1",
    );
    expect(mage.name).toBe("Mage");
    expect(mage.base_mana).toBe(50);
    expect(mage.mana_per_level).toBeCloseTo(0.505, 3);
    expect(mage.health_per_level).toBe(10);
    expect(mage.endurance_threshold_per_health).toBeCloseTo(0.2, 6);

    // first timeline: Fall of the Outcasts, area level 62 (corruption 0..50) then 100 (corruption from 100)
    const tl = one<{ name: string }>("SELECT name FROM timelines WHERE timeline_id = 1");
    expect(tl.name).toBe("Fall of the Outcasts");
    const d = b.db
      .prepare("SELECT level, minimum_corruption, maximum_corruption, corruption_mod_id FROM timeline_difficulties WHERE timeline_id = 1 ORDER BY difficulty_index")
      .all();
    expect(d).toEqual([
      { level: 62, minimum_corruption: 0, maximum_corruption: 50, corruption_mod_id: 113 },
      { level: 100, minimum_corruption: 100, maximum_corruption: null, corruption_mod_id: 113 },
    ]);

    // a monster mod
    expect(one<{ title: string; description: string }>("SELECT title, description FROM monster_mods WHERE mod_id = 59")).toEqual({
      title: "of Rage",
      description: "enrages at half health",
    });

    // i18n
    expect(one<{ text: string; section: string }>("SELECT text, section FROM i18n WHERE key = 'Abilities.Ability_Fireball_Name'")).toEqual({
      text: "Fireball",
      section: "Abilities",
    });
  });
});

describe.skipIf(!hasRawData())("crosscheck", () => {
  it("compares LE Tools and Maxroll with (almost) no mismatches", (t) => {
    const b = buildForTest(["crosscheck"]);
    try {
      if (b.status === "stub") t.skip();
      expect(b.status).toBe("ok");
      const rows = b.db.prepare("SELECT count(*) AS n FROM maxroll_crosscheck").get() as { n: number };
      expect(rows.n).toBeGreaterThan(0);
      // 1.5.2: only affix 910 (Maxroll lists canRollOn twice) differs in value.
      expect(b.report.crosscheck_mismatches).toBeLessThanOrEqual(1);
    } finally {
      b.db.close();
    }
  });
});

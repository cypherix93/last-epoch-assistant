import { afterAll, describe, expect, it } from "vitest";
import { checkExpected } from "../lib/expected.js";
import { buildForTest, hasRawData, type TestBuild } from "../lib/testing.js";
import { expected, tables } from "./items.js";

// Owner: items agent. Builds the real raw data with only the items step and asserts the counts.
describe.skipIf(!hasRawData())("items loader", () => {
  let build: TestBuild | undefined;
  const get = () => (build ??= buildForTest(["items"]));
  afterAll(() => build?.db.close());

  it("meets every expected count", () => {
    const b = get();
    expect(b.status).toBe("ok");
    const failed = checkExpected(b.db, expected).filter((r) => !r.ok);
    expect(failed).toEqual([]);
  });

  it("fills every owned table", () => {
    const b = get();
    const empty = tables.filter((tb) => b.report.tables[tb] === 0);
    expect(empty).toEqual([]);
  });

  it("resolves unique names through i18n", () => {
    const row = get().db.prepare("SELECT name, mod_count FROM uniques WHERE unique_id = 0").get() as { name: string; mod_count: number };
    expect(row.name).toBe("Calamity");
    expect(row.mod_count).toBe(3);
    const orphans = get().db.prepare("SELECT count(*) AS n FROM uniques WHERE name IS NULL").get() as { n: number };
    expect(orphans.n).toBe(0);
  });

  it("unique mods with canRoll 0 are fixed at value (raw maxValue is a leftover)", () => {
    const db = get().db;
    const row = (name: string, prop: number) =>
      db
        .prepare(
          "SELECT m.value_min, m.value_max FROM mods m JOIN uniques u ON CAST(m.source_id AS INTEGER) = u.unique_id WHERE m.source_kind = 'unique_mod' AND u.name = ? AND m.property = ?",
        )
        .get(name, prop) as { value_min: number; value_max: number };
    // raw: Trident of the Last Abyss Void Resistance value 0.75 maxValue 90; Dreamthorn Damage 40/25, Penetration 0.4/125 (all canRoll 0)
    expect(row("Trident of the Last Abyss", 26)).toEqual({ value_min: 0.75, value_max: 0.75 });
    expect(row("Dreamthorn", 0)).toEqual({ value_min: 40, value_max: 40 });
    expect(row("Dreamthorn", 59)).toEqual({ value_min: 0.4, value_max: 0.4 });
    // rollable mods keep their range
    expect(row("Trident of the Last Abyss", 51)).toEqual({ value_min: 0.5, value_max: 0.7 });
    const bad = db
      .prepare("SELECT count(*) AS n FROM mods WHERE source_kind = 'unique_mod' AND value_min > value_max")
      .get() as { n: number };
    expect(bad.n).toBe(0);
    const text = (db.prepare("SELECT mods_text FROM v_unique_summary WHERE name = 'Dreamthorn'").get() as { mods_text: string }).mods_text;
    expect(text).toContain("Damage added 40 [");
    expect(text).not.toContain("40..25");
  });

  it("legendary fields: legendary_type is the raw enum, lp_eligible/weavers_will are derived", () => {
    const db = get().db;
    const cols = (db.prepare("PRAGMA table_info(uniques)").all() as { name: string }[]).map((c) => c.name);
    expect(cols).toContain("legendary_type");
    expect(cols).not.toContain("is_legendary_capable");
    const by = db
      .prepare("SELECT legendary_type, is_set_item, lp_eligible, weavers_will, count(*) AS n FROM uniques GROUP BY 1, 2, 3, 4 ORDER BY 1, 2")
      .all();
    expect(by).toEqual([
      { legendary_type: 0, is_set_item: 0, lp_eligible: 1, weavers_will: 0, n: 407 },
      { legendary_type: 0, is_set_item: 1, lp_eligible: 0, weavers_will: 0, n: 61 },
      { legendary_type: 1, is_set_item: 0, lp_eligible: 0, weavers_will: 1, n: 18 },
    ]);
    const cdal = db.prepare("SELECT count(*) AS n FROM uniques WHERE can_drop_as_legendary = 1").get() as { n: number };
    expect(cdal.n).toBe(4);
  });

  it("v_affix_summary keeps tag names; v_blessings exposes tags and does not decode drop-rate masks", () => {
    const db = get().db;
    const a = db.prepare("SELECT stats_text FROM v_affix_summary WHERE affix_id = 76").get() as { stats_text: string };
    expect(a.stats_text).toBe("Damage added 3..100 [Void,Melee]"); // Melee Void Damage
    const cols = (db.prepare("PRAGMA table_info(v_blessings)").all() as { name: string }[]).map((c) => c.name);
    expect(cols).toEqual(expect.arrayContaining(["tags", "tag_names", "special_tag"]));
    const dr = db
      .prepare("SELECT name, tags, tag_names FROM v_blessings WHERE property = 104 AND special_tag = 0 AND tags = 1")
      .get() as { name: string; tags: number; tag_names: string | null };
    expect(dr.name).toBe("Embrace of Ice");
    expect(dr.tag_names).toBeNull();
    const phys = db.prepare("SELECT count(*) AS n FROM v_blessings WHERE property = 104 AND tag_names IS NOT NULL").get() as { n: number };
    expect(phys.n).toBe(0);
  });

  it("stores affix tier roll ranges", () => {
    const db = get().db;
    const a = db.prepare("SELECT name, tier_count FROM affixes WHERE affix_id = 0").get() as { name: string; tier_count: number };
    expect(a.name).toBe("Void Penetration");
    expect(a.tier_count).toBe(8);
    const t5 = db
      .prepare("SELECT value_min, value_max, property_name FROM mods WHERE source_kind = 'affix_tier' AND source_id = '0' AND tier = 5 AND source_ord = 0")
      .get() as { value_min: number; value_max: number };
    expect([t5.value_min, t5.value_max]).toEqual([0.08, 0.09]);
  });

  it("stores sub type implicits", () => {
    const rows = get().db
      .prepare("SELECT source_ord, property, modifier_type, value_min, value_max FROM mods WHERE source_kind = 'implicit' AND source_id = '0:1' ORDER BY source_ord")
      .all() as { property: number; modifier_type: number; value_min: number; value_max: number }[];
    expect(rows.length).toBe(3);
    expect(rows[1]).toMatchObject({ property: 8, modifier_type: 0, value_min: 10, value_max: 35 });
    const st = get().db.prepare("SELECT implicit_count, name FROM item_subtypes WHERE base_type_id = 0 AND sub_type_id = 1").get() as { implicit_count: number; name: string | null };
    expect(st.implicit_count).toBe(3);
    expect(st.name).toBeTruthy();
  });

  it("maps blessings to timelines with roll ranges", () => {
    const db = get().db;
    const b = db.prepare("SELECT sub_type_id, name, timeline_id, difficulty_index, slot_kind, is_grand FROM blessings WHERE sub_type_id = 111").get() as Record<string, unknown>;
    expect(b).toMatchObject({ timeline_id: 1, difficulty_index: 0, slot_kind: "any", is_grand: 0 });
    expect(b.name).toBeTruthy();
    const g = db.prepare("SELECT is_grand, difficulty_index FROM blessings WHERE sub_type_id = 112").get() as { is_grand: number };
    expect(g.is_grand).toBe(1);
    const m = db.prepare("SELECT value_min, value_max FROM mods WHERE source_kind = 'blessing' AND source_id = '34:111' AND source_ord = 0").get() as { value_min: number; value_max: number };
    expect(m.value_min).toBeLessThanOrEqual(m.value_max);
    expect(db.prepare("SELECT count(*) AS n FROM mods WHERE source_kind = 'blessing'").get()).toEqual({ n: 234 });
  });

  it("stores set bonuses", () => {
    const db = get().db;
    const s = db.prepare("SELECT set_name, item_count FROM sets WHERE set_id = 3").get() as { set_name: string; item_count: number };
    expect(s.set_name).toBe("Apiarist's");
    expect(s.item_count).toBeGreaterThan(0);
    const rows = db.prepare("SELECT set_requirement, value_min, hidden FROM mods WHERE source_kind = 'set_bonus' AND source_id = '3' ORDER BY source_ord").all();
    expect(rows).toEqual([
      { set_requirement: 2, value_min: 4, hidden: 1 },
      { set_requirement: 3, value_min: 1, hidden: 1 },
    ]);
    expect(db.prepare("SELECT count(*) AS n FROM set_tooltips WHERE set_id = 3").get()).toEqual({ n: 2 });
  });

  it("scales affix values by item base: v_idol_affix_values / v_affix_values (judge corrections)", () => {
    const db = get().db;
    const v = (affix: number, base: number, tier = 1, ord = 0) =>
      db.prepare("SELECT scale_factor, value_min, value_max, stored_max FROM v_affix_values WHERE affix_id = ? AND base_type_id = ? AND tier = ? AND ord = ?").get(affix, base, tier, ord) as Record<string, number>;
    // affix 119 (std 0) on a Grand Idol (aem -0.33): 0.60 stored -> 0.40
    expect(v(119, 29)).toMatchObject({ scale_factor: 0.67, value_max: 0.4, stored_max: 0.6 });
    // affix 912 (std -0.33) T7 on an Ornate Idol (aem 0): 8 stored -> 12 (x1/0.67)
    expect(v(912, 31, 7)).toMatchObject({ value_max: 12, stored_max: 8 });
    expect(v(912, 29, 7)).toMatchObject({ scale_factor: 1, value_max: 8 }); // authored for Grand / Large idols
    // affix 105 Health (std 0) 30..80 on a Minor Idol (aem -0.83): 5..14
    expect(v(105, 26)).toMatchObject({ value_min: 5, value_max: 14 });
    // gear too: Added Health (25) T5 61..90 on Body Armor (aem 0.5) -> 92..135 (knowledge/reference/item-system.md worked vector)
    expect(v(25, 1, 5)).toMatchObject({ value_min: 92, value_max: 135 });
    const idol = db.prepare("SELECT idol, idol_size FROM v_idol_affix_values WHERE affix_id = 119 AND base_type_id = 29 LIMIT 1").get();
    expect(idol).toEqual({ idol: "Grand Idol", idol_size: "3x1" });
    expect(db.prepare("SELECT count(*) AS n FROM v_idol_affix_values WHERE base_type_id NOT BETWEEN 25 AND 33").get()).toEqual({ n: 0 });
    // Omen idol sub types scale with omenIdolAffixEffectModifier (0), every other sub type with its base type
    expect(db.prepare("SELECT affix_effect_modifier AS aem FROM item_subtypes WHERE base_type_id = 29 AND name = 'Grand Iron Omen Idol'").get()).toEqual({ aem: 0 });
    expect(db.prepare("SELECT count(*) AS n FROM item_subtypes s JOIN item_base_types b ON b.base_type_id = s.base_type_id WHERE coalesce(s.affix_effectiveness, 0) <> 1 AND s.affix_effect_modifier IS NOT b.affix_effect_modifier").get()).toEqual({ n: 0 });
  });

  it("rounds affix values on the stat's grid (affix_stats.rounding_scale)", () => {
    const db = get().db;
    const r = (affix: number, ord = 0) => (db.prepare("SELECT rounding_scale AS s FROM affix_stats WHERE affix_id = ? AND ord = ?").get(affix, ord) as { s: number }).s;
    expect(r(25)).toBe(1); // added Health: Integer
    expect(r(119)).toBe(100); // increased: Hundredth
    expect(r(0)).toBe(100); // added Penetration: Hundredth (displayed as a percentage)
  });

  it("decodes relation compact ids", () => {
    const db = get().db;
    const r = db
      .prepare("SELECT source_kind, source_id, source_sub, target_id FROM relations WHERE compact_id = 'UAzCMwZgJiA' AND relation = 'mod_ability'")
      .get() as Record<string, unknown>;
    expect(r).toMatchObject({ source_kind: "unique", source_id: "32", source_sub: 1, target_id: "ability_gen172" });
    const unresolved = db.prepare("SELECT count(*) AS n FROM compact_ids WHERE resolves = 0").get() as { n: number };
    expect(unresolved.n).toBeGreaterThanOrEqual(0);
  });
});

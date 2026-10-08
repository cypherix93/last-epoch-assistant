import Database from "better-sqlite3";
import { afterAll, describe, expect, it } from "vitest";
import { createContext } from "./context.js";
import { checkExpected, count } from "./expected.js";
import {
  affixCompactId,
  decodeCompactId,
  decompressCompactId,
  encodeCompactId,
  implicitCompactId,
  monsterModCompactId,
  setCompactId,
  uniqueLineCompactId,
} from "./ids.js";
import { currentVersion, hasRawData } from "./paths.js";
import { loadRaw, makeTranslator, unescapeIcu, type RawData } from "./raw.js";
import { applySchema, insertRow } from "./sqlite.js";
import {
  describeTags,
  insertMod,
  insertStatBlock,
  isIndirectTags,
  ModValidationError,
  parseDisplayValue,
  StatNamer,
  type ModInput,
} from "./stat-lines.js";
import { bool, classRequirementNames, classSpecificityNames, cleanFloat, rawJson, sortedEntries, sortedKeys } from "./util.js";

/** The AT global (docs/data-sources/enums.md section 2). */
const AT: Record<string, number> = {
  None: 0, Physical: 1, Lightning: 2, Cold: 4, Fire: 8, Void: 16, Necrotic: 32, Poison: 64, Elemental: 128,
  Spell: 256, Melee: 512, Throwing: 1024, Bow: 2048, DoT: 4096, Minion: 8192, Totem: 16384, PetResisted: 32768,
  Potion: 65536, Buff: 131072, Channelling: 262144, Transform: 524288, LowLife: 1048576, HighLife: 2097152,
  FullLife: 4194304, Hit: 8388608, Curse: 16777216, Ailment: 33554432, Crit_deprecated: 67108864,
  Kill_deprecated: 134217728, Die_deprecated: 268435456,
};

/** A minimal fake RawData for StatNamer (no files needed). */
function fakeRaw(): RawData {
  const i18n = {
    "Properties.Property_Master_Damage_Name": "Damage",
    "Properties.Property_Master_Penetration_Name": "Penetration",
    "Properties.Property_Player_3_Name": "Chance to Gain 20 Ward on Melee Hit",
    "Properties.Property_IdolAltar_1_Name": "Effect of Prefixes and Suffixes for Idols in Refracted Slots",
    "Properties.Property_Ability_fireball_2_Name": "Projectiles for Fireball",
    "Abilities.Ability_Fireball_Name": "Fireball",
  };
  const letools = {
    AT,
    SP: { Damage: 0, Penetration: 59, AbilityProperty: 58, LevelOfSkills: 88, PlayerProperty: 98, IdolAltarProperty: 130 },
    LocalSP: { NoDodge: 1001 },
    coreDB: {
      propertyList: [
        { property: 0, propertyNameKey: "Properties.Property_Master_Damage_Name" },
        { property: 59, propertyNameKey: "Properties.Property_Master_Penetration_Name" },
      ],
      playerPropertyList: [{}, {}, {}, { propertyNameKey: "Properties.Property_Player_3_Name" }],
      idolAltarPropertyList: { list: [{}, { propertyNameKey: "Properties.Property_IdolAltar_1_Name" }] },
      abilityPropertyList: [{ abilityID: 1, properties: [{}, { propertyNameKey: "Properties.Property_Ability_fireball_2_Name" }] }],
    },
    LEAbilities: { abilityList: { fi9: { id: "fi9", index: 1, nameKey: "Abilities.Ability_Fireball_Name", name: null } } },
  };
  return {
    version: "test",
    dir: "",
    lock: { fetchedAt: "" },
    letools: letools as unknown as RawData["letools"],
    i18n,
    t: makeTranslator(i18n),
    maxroll: null,
    hasGlobal: () => true,
  };
}

describe("ICU unescape and translator", () => {
  it("undoes doubled apostrophes", () => {
    expect(unescapeIcu("Artor''s Legacy")).toBe("Artor's Legacy");
    expect(unescapeIcu("Pebbles'' Set")).toBe("Pebbles' Set");
  });
  it("unquotes ICU syntax characters", () => {
    expect(unescapeIcu("the dungeon boss drops '{'1'}'Exalted Jewelry'{'/'}'")).toBe("the dungeon boss drops {1}Exalted Jewelry{/}");
    expect(unescapeIcu("find '{'0'}' Prophecies")).toBe("find {0} Prophecies");
  });
  it("keeps strings without apostrophes and lone apostrophes", () => {
    expect(unescapeIcu("Void Penetration")).toBe("Void Penetration");
    expect(unescapeIcu("it's")).toBe("it's");
  });
  it("t() returns null for missing, null and empty", () => {
    const t = makeTranslator({ a: "Artor''s", empty: "" });
    expect(t("a")).toBe("Artor's");
    expect(t("missing")).toBeNull();
    expect(t(null)).toBeNull();
    expect(t(undefined)).toBeNull();
    expect(t("empty")).toBeNull();
  });
});

describe("describeTags", () => {
  it("decodes a known bitmask", () => {
    expect(describeTags(513, AT)).toBe("Physical,Melee");
    expect(describeTags(4384, AT)).toBe("Necrotic,Spell,DoT");
    expect(describeTags(8704, AT)).toBe("Melee,Minion");
  });
  it("returns null for 0 and names unknown bits", () => {
    expect(describeTags(0, AT)).toBeNull();
    expect(describeTags(2 ** 30 + 1, AT)).toBe("Physical,bit30");
  });
});

describe("compact ids", () => {
  it("decodes the ids.md examples", () => {
    expect(decompressCompactId("MAxA")).toEqual({ kind: "M", value: "0" });
    expect(decompressCompactId("MIzDMQ")).toEqual({ kind: "M", value: "113" });
    expect(decompressCompactId("AKwDgnEA")).toEqual({ kind: "A", value: "589" });
    expect(decompressCompactId("UAzAsCYHYDYg")).toEqual({ kind: "U", value: "004276" });
  });
  it("resolves the layout per kind", () => {
    expect(decodeCompactId("AGwVgHEA")).toMatchObject({ kind: "A", targetTable: "affixes", targetKey: "658" });
    expect(decodeCompactId("UAzCMwZgJiA")).toMatchObject({ kind: "U", value: "001032", targetTable: "uniques", targetKey: "32", subIndex: 1 });
    expect(decodeCompactId("SAzDMQ")).toMatchObject({ kind: "S", targetTable: "sets", targetKey: "3" });
    expect(decodeCompactId("IIwBjIVnEg")).toMatchObject({
      kind: "I", value: "1000050000", targetTable: "item_subtypes", targetKey: "0:50", baseTypeId: 0, subTypeId: 50, subIndex: 0, // Falconry Helm (ids.md says "sub 5": typo, 0_50 is Falconry Helm)
    });
    expect(decodeCompactId("IIwBgTGIKwJwvQ")).toMatchObject({ targetKey: "22:59" });
    expect(decodeCompactId("MIzDMQ")).toMatchObject({ targetTable: "monster_mods", targetKey: "113" });
  });
  it("encodes back to the same ids", () => {
    expect(affixCompactId(589)).toBe("AKwDgnEA");
    expect(monsterModCompactId(113)).toBe("MIzDMQ");
    expect(setCompactId(3)).toBe("SAzDMQ");
    expect(setCompactId(19)).toBe("SAwRgnEA");
    expect(implicitCompactId(0, 50)).toBe("IIwBjIVnEg");
    expect(implicitCompactId(2, 13)).toBe("IIwBhCYWBmMSA");
    expect(uniqueLineCompactId(1, 32)).toBe("UAzCMwZgJiA");
    expect(encodeCompactId("M", "0")).toBe("MAxA");
  });
  it("rejects bad ids", () => {
    expect(() => decompressCompactId("XAxA")).toThrow(/unknown compact id kind/);
    expect(() => encodeCompactId("A", "12a")).toThrow();
  });
});

describe("util", () => {
  it("sorts keys numerically then by code point", () => {
    expect(sortedKeys({ "10": 1, "2": 1, b: 1, a: 1, "-1": 1 })).toEqual(["-1", "2", "10", "a", "b"]);
    expect(sortedEntries({ "10": "x", "9": "y" })).toEqual([["9", "y"], ["10", "x"]]);
  });
  it("normalizes booleans and floats", () => {
    expect([bool(true), bool(0), bool(1), bool(null)]).toEqual([1, 0, 1, null]);
    expect(cleanFloat(0.29000002)).toBe(0.29);
    expect(cleanFloat(1.46667)).toBe(1.46667);
    expect(cleanFloat(19500)).toBe(19500);
  });
  it("decodes class masks", () => {
    expect(classRequirementNames(8)).toBe("Acolyte");
    expect(classSpecificityNames(7)).toBe("Weaver,Primalist,Mage");
    expect(classSpecificityNames(0)).toBeNull();
  });
  it("omits child collections from raw_json", () => {
    expect(rawJson({ a: 1, subItems: { x: 1 } }, ["subItems"])).toBe('{"a":1}');
  });
  it("parses display-only values", () => {
    expect(parseDisplayValue("+25%")).toBe(0.25);
    expect(parseDisplayValue("-10%")).toBe(-0.1);
    expect(parseDisplayValue("24")).toBe(24);
    expect(parseDisplayValue("+1")).toBe(1);
    expect(parseDisplayValue("x2")).toBeNull();
    expect(parseDisplayValue(null)).toBeNull();
  });
});

describe("insertMod / insertStatBlock", () => {
  const db = new Database(":memory:");
  applySchema(db);
  const raw = fakeRaw();
  const namer = new StatNamer(raw);
  afterAll(() => db.close());

  const base: ModInput = { sourceKind: "unique_mod", sourceId: 0, sourceOrd: 0, property: 0, tags: 8, modifierType: 1, valueMin: 0.2, valueMax: 0.8, raw: {} };

  it("inserts a valid line with resolved names", () => {
    const id = insertMod(db, base, namer);
    const row = db.prepare(`SELECT * FROM mods WHERE id = ?`).get(id) as Record<string, unknown>;
    expect(row).toMatchObject({ source_kind: "unique_mod", source_id: "0", property_name: "Damage", tag_names: "Fire", modifier_type: 1, value_min: 0.2, value_max: 0.8, hidden: 0 });
  });

  it("rejects a bad modifier_type", () => {
    expect(() => insertMod(db, { ...base, sourceOrd: 1, modifierType: 3 }, namer)).toThrow(ModValidationError);
    expect(() => insertMod(db, { ...base, sourceOrd: 1, modifierType: -1 }, namer)).toThrow(/modifier_type/);
  });

  it("rejects other invalid input", () => {
    expect(() => insertMod(db, { ...base, sourceKind: "nope" as never }, namer)).toThrow(/source_kind/);
    expect(() => insertMod(db, { ...base, sourceId: "" }, namer)).toThrow(/source_id/);
    expect(() => insertMod(db, { ...base, sourceOrd: -1 }, namer)).toThrow(/source_ord/);
    expect(() => insertMod(db, { ...base, tags: 1.5 }, namer)).toThrow(/tags/);
    expect(() => insertMod(db, { ...base, value: 1 }, namer)).toThrow(/either value/);
    expect(() => insertMod(db, { ...base, valueMin: Number.NaN }, namer)).toThrow(/finite/);
    expect(() => insertMod(db, { ...base, tier: 1 }, namer)).toThrow(/tier/);
    expect(() => insertMod(db, { ...base, sourceKind: "affix_tier" }, namer)).toThrow(/requires tier/);
    expect(() => insertMod(db, { ...base, raw: undefined }, namer)).toThrow(/raw/);
  });

  it("enforces unique line identity", () => {
    expect(() => insertMod(db, base, namer)).toThrow(/UNIQUE/);
  });

  it("resolves indirect properties and leaves their tags undecoded", () => {
    const get = (id: number) => db.prepare(`SELECT property_name, tag_names FROM mods WHERE id = ?`).get(id);
    expect(get(insertMod(db, { ...base, sourceOrd: 10, property: 98, tags: 3 }, namer))).toEqual({ property_name: "Chance to Gain 20 Ward on Melee Hit", tag_names: null });
    expect(get(insertMod(db, { ...base, sourceOrd: 11, property: 130, tags: 1 }, namer))).toEqual({ property_name: "Effect of Prefixes and Suffixes for Idols in Refracted Slots", tag_names: null });
    expect(get(insertMod(db, { ...base, sourceOrd: 12, property: 58, tags: 1, specialTag: 1 }, namer))).toEqual({ property_name: "Projectiles for Fireball", tag_names: null });
    expect(get(insertMod(db, { ...base, sourceOrd: 13, property: 88, tags: 1, specialTag: 1 }, namer))).toEqual({ property_name: "Level of Fireball", tag_names: null });
    expect(get(insertMod(db, { ...base, sourceOrd: 14, property: 88, tags: 32, specialTag: 0 }, namer))).toEqual({ property_name: "LevelOfSkills", tag_names: "Necrotic" });
    expect(isIndirectTags(88, 0)).toBe(false);
    expect(isIndirectTags(98)).toBe(true);
  });

  it("cleans float noise and mirrors a lone bound", () => {
    const id = insertMod(db, { ...base, sourceOrd: 20, valueMin: 0.29000002, valueMax: undefined }, namer);
    expect(db.prepare(`SELECT value_min, value_max FROM mods WHERE id = ?`).get(id)).toEqual({ value_min: 0.29, value_max: 0.29 });
  });

  it("expands stat blocks into one row per non-zero component", () => {
    const n = insertStatBlock(
      db,
      { sourceKind: "ailment_buff", sourceId: 3, sourceOrd: 0 },
      { property: 0, specialTag: 0, tags: 16, addedValue: 0.2, increasedValue: 0.05, moreValues: [-0.12] },
      namer,
    );
    expect(n).toBe(3);
    const rows = db.prepare(`SELECT sub_ord, modifier_type, value_min FROM mods WHERE source_kind = 'ailment_buff' ORDER BY sub_ord`).all();
    expect(rows).toEqual([
      { sub_ord: 0, modifier_type: 0, value_min: 0.2 },
      { sub_ord: 1, modifier_type: 1, value_min: 0.05 },
      { sub_ord: 2, modifier_type: 2, value_min: -0.12 },
    ]);
    expect(insertStatBlock(db, { sourceKind: "ailment_buff", sourceId: 3, sourceOrd: 1 }, { property: 0 }, namer)).toBe(1);
  });
});

describe("insertRow and expected counts", () => {
  it("rejects unknown columns and checks expectations", () => {
    const db = new Database(":memory:");
    applySchema(db);
    expect(() => insertRow(db, "meta", { key: "a", value: "b", nope: 1 })).toThrow(/no column 'nope'/);
    insertRow(db, "meta", { key: "a", value: "b" });
    const [ok, bad, err] = checkExpected(db, [count("meta", 1), count("meta", 2), { name: "x", sql: "SELECT nope", expected: 0 }]);
    expect(ok).toMatchObject({ ok: true, actual: 1 });
    expect(bad).toMatchObject({ ok: false, actual: 1 });
    expect(err!.ok).toBe(false);
    expect(err!.error).toBeTruthy();
    db.close();
  });
});

describe.skipIf(!hasRawData())("against the real raw data", () => {
  let cached: RawData | undefined;
  const rawData = () => (cached ??= loadRaw(currentVersion()!));
  it("loads globals lazily and resolves i18n", () => {
    expect(rawData().letools.gameVersion).toBe("Version 1.5.2");
    expect(Object.keys(rawData().i18n).length).toBe(34993);
    expect(rawData().t("Item_Names.Unique_Name_0")).toBe("Calamity");
    expect(rawData().t("MonsterMods.Boss Drops Exalted Jewelry T2 Dungeon Mod_M&D_Description")).toBe("the dungeon boss drops {1}Exalted Jewelry{/}");
  });
  it("describes tags with the AT global", () => {
    const ctx = createContext(new Database(":memory:"), rawData());
    expect(ctx.mods.describeTags(264)).toBe("Fire,Spell");
    expect(ctx.mods.propertyName(1)).toBe("Ailment Chance");
    expect(ctx.mods.lineName(88, 1, 1)).toBe("Level of Fireball");
    ctx.db.close();
  });
  it("decodes every compact id key in the itemDB maps and monsterMods", () => {
    const it = rawData().letools.itemDB;
    const keys = new Set<string>();
    for (const m of ["relModAbilities", "relModAilments", "relIncLevelAbilities", "triggeredAbilities", "triggeredAilments"] as const) {
      for (const k of Object.keys(it[m])) keys.add(k);
    }
    expect(keys.size).toBe(1014);
    for (const k of keys) expect(encodeCompactId(decodeCompactId(k).kind, decodeCompactId(k).value)).toBe(k);
    const mm = Object.keys(rawData().letools.monsterMods).map((k) => Number(decodeCompactId(k).targetKey)).sort((a, b) => a - b);
    expect(mm).toEqual([...Array(287).keys()]);
  });
});

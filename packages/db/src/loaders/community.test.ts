import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { createContext } from "../lib/context.js";
import { checkExpected } from "../lib/expected.js";
import { currentVersion } from "../lib/paths.js";
import { loadRaw } from "../lib/raw.js";
import { buildForTest, hasRawData, type TestBuild } from "../lib/testing.js";
import { expected, expectedFor, lexicalText, loadCommunityFrom, plannedBuildCount, readIndex, tables, type CommunityReport } from "./community.js";

// Fixture: the Maxroll "Erasing Strike Void Knight" guide (Volca), planner profile 0g5ta0n3, as fetched on
// 2026-10-08 with lootFilters removed, PD.items pruned to the 56 items the tabs reference and widgetNotes
// kept on the Endgame tab only. The expectations below are copied from the independent decode
// (scratchpad mxguide/ground-truth.md), not from this loader's output.
const FIXTURE = join(dirname(fileURLToPath(import.meta.url)), "__fixtures__", "maxroll-guides");

type Row = Record<string, unknown>;

describe("community helpers", () => {
  it("flattens Lexical notes to text", () => {
    const notes = {
      root: {
        type: "root",
        children: [
          { type: "heading", children: [{ type: "text", text: "Skill Usage" }] },
          { type: "paragraph", children: [{ type: "text", text: "Use " }, { type: "embed", embedType: "le-skill", id: "ErasingStrike", text: "Erasing Strike" }, { type: "text", text: " often." }] },
          { type: "list", children: [{ type: "listitem", children: [{ type: "text", text: "one" }] }, { type: "listitem", children: [{ type: "text", text: "two" }] }] },
        ],
      },
    };
    expect(lexicalText(notes)).toBe("Skill Usage\nUse Erasing Strike often.\n- one\n- two");
  });

  it("counts one build per guide x profile id", () => {
    const idx = readIndex(FIXTURE);
    expect(idx?.guides).toHaveLength(1);
    expect(plannedBuildCount(idx)).toBe(1);
    expect(plannedBuildCount({ guides: [{ slug: "a", planner_id: "x", profile_ids: ["x", "y"] }, { slug: "b", profile_ids: [] }] })).toBe(3);
    expect(readIndex(join(FIXTURE, "nope"))).toBeNull();
  });
});

describe.skipIf(!hasRawData())("community loader (fixture against the real game tables)", () => {
  let build: TestBuild | undefined;
  let report: CommunityReport | undefined;
  const get = () => {
    if (!build) {
      build = buildForTest(["world", "items", "skills"]);
      const ctx = createContext(build.db, loadRaw(currentVersion()!));
      report = build.db.transaction(() => loadCommunityFrom(ctx, FIXTURE))();
    }
    return { db: build.db, report: report! };
  };
  afterAll(() => build?.db.close());
  const all = (sql: string, ...p: unknown[]) => get().db.prepare(sql).all(...p) as Row[];
  const one = (sql: string, ...p: unknown[]) => get().db.prepare(sql).get(...p) as Row;
  const endgame = () => one(`SELECT build_profile_id AS id FROM community_build_profiles WHERE name = 'Endgame'`).id as number;

  it("meets its expected counts and fills every owned table", () => {
    const { db } = get();
    expect(checkExpected(db, expectedFor(FIXTURE)).filter((r) => !r.ok)).toEqual([]);
    for (const t of tables) expect((db.prepare(`SELECT count(*) AS n FROM ${t}`).get() as { n: number }).n, t).toBeGreaterThan(0);
  });

  it("resolves every Maxroll id (only the unnamed property 120 is reported)", () => {
    const { report } = get();
    expect(report.present).toBe(true);
    expect(report.resolution).toBe("ok");
    expect(report.unresolved).toEqual({});
    expect(report.unresolved_total).toBe(0);
    expect(report.unnamed_properties.map((p) => [p.property, p.enum_name])).toEqual([[120, "EffectOfAilmentOnYou"]]);
    expect([report.guides, report.builds, report.profiles_loaded, report.tabs]).toEqual([1, 1, 1, 3]);
  });

  it("stores the guide with class, mastery, main skill and the default tab", () => {
    const b = one(`SELECT * FROM v_build_summary`);
    expect(b).toMatchObject({
      slug: "erasing-strike-void-knight-guide",
      author: "Volca",
      class_name: "Sentinel",
      mastery_name: "Void Knight",
      main_ability_id: "es6ai",
      main_skill: "Erasing Strike",
      profile_id: "0g5ta0n3",
      profile_name_default: "Endgame",
      level: 100,
      specialized_skills: "Erasing Strike, Devouring Orb, Anomaly, Void Cleave, Abyssal Echoes",
    });
    expect(one(`SELECT main_ability_source, strengths FROM community_builds`)).toEqual({
      main_ability_source: "mainset",
      strengths: JSON.stringify(["Great AoE", "Excellent Boss Killer", "Amazing Scaling With Gear"]),
    });
    expect(all(`SELECT name, is_default FROM community_build_profiles ORDER BY ord`)).toEqual([
      { name: "Starter", is_default: 0 },
      { name: "Endgame", is_default: 1 },
      { name: "Aspirational", is_default: 0 },
    ]);
    const notes = JSON.parse(one(`SELECT notes_json FROM community_builds`).notes_json as string);
    expect(Object.keys(notes)).toEqual(["changelog", "faqs", "intro", "summary"]);
    expect(notes.faqs).toContain("Void Well");
  });

  // ground-truth.md section 1 (Endgame gear): slot -> [item, base, corrupted, [origin, affix_id, tier][]]
  const GEAR: [string, string, string, boolean, [string, number, number][]][] = [
    ["weapon", "World Splitter", "Bardiche", true, [["extra", 76, 7], ["corruption", 986, 7]]],
    ["head", "Mask of Indifference", "Forest Helmet", false, [["extra", 34, 7], ["extra", 1156, 5]]],
    ["body", "Titan Heart", "Copper Plate", false, [["extra", 568, 7], ["extra", 34, 5]]],
    ["waist", "Shattered Chains", "Plated Belt", true, [["extra", 52, 7], ["corruption", 1021, 7]]],
    ["hands", "Falcon Fists", "Plated Gauntlets", false, [["extra", 34, 7], ["extra", 86, 5]]],
    ["feet", "Army of Skin", "Shrine Boots", true, [["extra", 28, 7], ["corruption", 991, 7]]],
    ["neck", "Nihilis", "Unbound Locket", false, [["extra", 34, 7]]],
    ["finger1", "Flames of Midnight", "Celestial Ring", false, [["extra", 501, 7], ["extra", 25, 5]]],
    ["finger2", "Siphon of Anguish", "Gold Ring", false, [["extra", 5, 7], ["extra", 80, 5]]],
    ["relic", "Anchor of Oblivion", "Lost Anchor", false, [["extra", 34, 7]]],
    ["altar", "Pyramidal Altar", "Pyramidal Altar", true, [["normal", 1089, 7], ["normal", 1094, 5], ["normal", 1101, 5], ["normal", 1097, 5], ["corruption", 1093, 5]]],
  ];

  it("decodes the Endgame gear: uniques, bases, extra / corruption affixes with tiers", () => {
    const id = endgame();
    const items = all(
      `SELECT i.item_row_id, i.slot, i.kind, i.is_corrupted, coalesce(u.name, st.name) AS item, st.name AS base
         FROM community_build_items i
         LEFT JOIN uniques u ON u.unique_id = i.unique_id
         LEFT JOIN item_subtypes st ON st.base_type_id = i.base_type_id AND st.sub_type_id = i.sub_type_id
        WHERE i.build_profile_id = ? AND i.slot <> 'idol' ORDER BY i.item_row_id`,
      id,
    );
    expect(items.map((r) => r.slot)).toEqual(GEAR.map((g) => g[0]));
    for (const [slot, item, base, corrupted, affixes] of GEAR) {
      const r = items.find((x) => x.slot === slot)!;
      expect([r.item, r.base, r.is_corrupted], slot).toEqual([item, base, corrupted ? 1 : 0]);
      expect(r.kind, slot).toBe(slot === "altar" ? "exalted" : "legendary");
      const got = all(`SELECT origin, affix_id, tier, roll FROM community_build_item_affixes WHERE item_row_id = ? ORDER BY ord`, r.item_row_id);
      expect(got.map((a) => [a.origin, a.affix_id, a.tier]), slot).toEqual(affixes);
      expect(got.every((a) => a.roll === 1), slot).toBe(true);
    }
  });

  it("names affixes with rolled in-game values (World Splitter Melee Void Damage T7 = 65 stored, 119 on a 2h axe; Mask Mana T7 = 120, Mana / Regen T5 = 8% / 33%)", () => {
    const id = endgame();
    const text = (slot: string) => (one(`SELECT affixes_text FROM v_build_items_named WHERE build_profile_id = ? AND slot = ?`, id, slot).affixes_text as string);
    // affix 76 (std 0.75, authored for 1h weapons) on a two-handed axe (aem 2.2) rolls x3.2/1.75: T7 51..65 -> 93..119
    expect(text("weapon")).toMatch(/^Melee Void Damage T7 x1\.8286 \[extra\] \(Melee Void Damage 119\); .* T7 x1\.8286 \[corruption\]/);
    expect(text("head")).toBe("Mana T7 [extra] (Mana 120); Increased Mana and Mana Regen T5 [extra] (Mana 0.08, Mana Regen 0.33)");
    // Added Mana (std 0) on Body Armor (aem 0.5) rolls x1.5: T5 36..50 -> 54..75; Level of Erasing Strike is authored for body armor (std 0.5)
    expect(text("body")).toMatch(/^Level of Erasing Strike T7 \[extra\] \(Erasing Strike 4, Void Damage 1\.5\); Mana T5 x1\.5 \[extra\] \(Mana 75\)$/);
  });

  it("shows idol affix values scaled by idol size (ground truth: Ornate Solar idols unscaled, Omen idol aem 0)", () => {
    const id = endgame();
    const idol = (name: string) => all(`SELECT affixes_text FROM v_build_items_named WHERE build_profile_id = ? AND slot = 'idol' AND item_name = ?`, id, name).map((r) => r.affixes_text as string);
    // Ornate idols have aem 0 and these affixes std 0: the decode's values (Vitality 7, Melee Void 90%, 5% / 18%)
    for (const t of idol("Heretical Ornate Solar Idol")) {
      expect(t).toBe("Vitality T1 (Vitality 7); Melee Void Damage T1 (Melee Void Damage 0.9); Increased Movement Speed and Increased Damage T7 (Movement Speed 0.05, Damage 0.18)");
    }
    // Omen idols use omenIdolAffixEffectModifier 0, so a Grand Omen idol is not scaled down
    expect(idol("Grand Iron Omen Idol")[0]).toBe("Vitality T1 (Vitality 7); Chance To Shred Armor on Melee Hit T1 (Chance to Shred Armor on Melee Hit 0.8); Melee Damage T1 [corruption] (Melee Damage 10)");
    // a Large idol (aem -0.33) scales std-0 affixes x0.67: 80% -> 54%; affix 920 (std -0.33) is authored for it
    expect(idol("Heretical Large Rahyeh Idol")[0]).toMatch(/^Chance To Shred Armor on Melee Hit T1 x0\.67 \(Chance to Shred Armor on Melee Hit 0\.54\); .* T1 x0\.67 \(.* 0\.23\); .* T7 \(.* 0\.2, .* 0\.05\)$/);
    // Minor Weaver idol affixes are authored for minor idols (std -0.83 = aem): unscaled
    expect(idol("Minor Weaver Idol")[0]).toBe("Mana and Increased Mana Regen T1 (Mana 12, Mana Regen 0.05); Cold Resistance and Minion Cold Resistance T1 (Cold Resistance 0.12, Minion Cold Resistance 0.12)");
  });

  it("decodes the Endgame idols on the 5x5 grid", () => {
    const rows = all(
      `SELECT i.item_row_id, i.grid_x, i.grid_y, i.is_corrupted, st.name, i.size_x, i.size_y FROM community_build_items i
         JOIN item_subtypes st ON st.base_type_id = i.base_type_id AND st.sub_type_id = i.sub_type_id
        WHERE i.build_profile_id = ? AND i.slot = 'idol' ORDER BY i.grid_index`,
      endgame(),
    );
    const IDOLS: [number, number, string, boolean, [string, number, number][]][] = [
      [2, 0, "Minor Weaver Idol", false, [["normal", 843, 1], ["normal", 850, 1]]],
      [1, 1, "Grand Iron Omen Idol", true, [["normal", 124, 1], ["normal", 211, 1], ["corruption", 1039, 1]]],
      [0, 2, "Heretical Ornate Solar Idol", false, [["normal", 124, 1], ["normal", 326, 1], ["normal", 894, 7]]],
      [4, 2, "Heretical Large Rahyeh Idol", false, [["normal", 211, 1], ["normal", 281, 1], ["normal", 920, 7]]],
      [0, 3, "Heretical Ornate Solar Idol", false, [["normal", 124, 1], ["normal", 326, 1], ["normal", 894, 7]]],
      [0, 4, "Heretical Ornate Solar Idol", false, [["normal", 124, 1], ["normal", 326, 1], ["normal", 894, 7]]],
    ];
    expect(rows.map((r) => [r.grid_x, r.grid_y, r.name, r.is_corrupted])).toEqual(IDOLS.map(([x, y, n, c]) => [x, y, n, c ? 1 : 0]));
    rows.forEach((r, i) => {
      const got = all(`SELECT origin, affix_id, tier FROM community_build_item_affixes WHERE item_row_id = ? ORDER BY ord`, r.item_row_id);
      expect(got.map((a) => [a.origin, a.affix_id, a.tier])).toEqual(IDOLS[i]![4]);
    });
    expect(rows.find((r) => r.name === "Grand Iron Omen Idol")).toMatchObject({ size_x: 3, size_y: 1 });
  });

  it("decodes the Endgame blessings (slot i = timeline i + 1)", () => {
    const rows = all(
      `SELECT b.timeline_id, bl.name, b.roll FROM community_build_blessings b JOIN blessings bl ON bl.sub_type_id = b.blessing_id
        WHERE b.build_profile_id = ? ORDER BY b.slot`,
      endgame(),
    );
    expect(rows).toEqual([
      { timeline_id: 3, name: "Grand Emptiness of Ash", roll: 1 },
      { timeline_id: 5, name: "Grand Light of the Moon", roll: 1 },
      { timeline_id: 7, name: "Grand Resolve of Humanity", roll: 1 },
      { timeline_id: 9, name: "Grand Bulwark of the Tundra", roll: 1 },
      { timeline_id: 10, name: "Grand Body of Obsidian", roll: 1 },
    ]);
  });

  it("decodes the Endgame passives (113 points: Sentinel 20, Void Knight 68, Forge Guard 25)", () => {
    const rows = all(`SELECT node_name, points, mastery FROM v_build_nodes_named WHERE build_profile_id = ? AND kind = 'passive'`, endgame());
    const pts = Object.fromEntries(rows.map((r) => [r.node_name, r.points]));
    expect(pts).toEqual({
      Juggernaut: 7, "Armor Clad": 5, Fearless: 8,
      "Abyssal Endurance": 10, "Sorrow and Steel": 5, "Dark Maw": 5, "Eternal Form": 8, "Essence of the End": 1, "Echoing Strikes": 3,
      "Void Well": 1, "Void Corruption": 5, "Singular Purpose": 5, Woe: 5, "Abyssal Fluctuation": 5, "Time Legion": 10, "Mortal Cleave": 5,
      "Battle Hardened": 8, Unflinching: 5, "Crushing Blows": 5, "Fresh from the Forge": 1, "Weapons Master": 1, "Champion of the Forge": 5,
    });
    const byMastery = [0, 1, 2, 3].map((m) => rows.filter((r) => r.mastery === m).reduce((n, r) => n + (r.points as number), 0));
    expect(byMastery).toEqual([20, 68, 25, 0]);
    expect(one(`SELECT passive_points FROM community_build_profiles WHERE build_profile_id = ?`, endgame()).passive_points).toBe(113);
  });

  it("decodes the Endgame skills and the Erasing Strike tree", () => {
    const id = endgame();
    const skills = all(`SELECT ability_id, is_specialized, on_bar, points FROM community_build_skills WHERE build_profile_id = ? ORDER BY ord`, id);
    const bar = all(`SELECT a.name FROM community_build_skills s JOIN abilities a ON a.ability_id = s.ability_id WHERE s.build_profile_id = ? AND s.on_bar = 1 ORDER BY s.bar_slot`, id);
    expect(bar.map((r) => r.name)).toEqual(["Erasing Strike", "Devouring Orb", "Anomaly", "Void Cleave", "Rebuke"]);
    const spec = all(`SELECT a.name FROM community_build_skills s JOIN abilities a ON a.ability_id = s.ability_id WHERE s.build_profile_id = ? AND s.is_specialized = 1 ORDER BY s.spec_slot`, id);
    expect(spec.map((r) => r.name)).toEqual(["Erasing Strike", "Devouring Orb", "Anomaly", "Void Cleave", "Abyssal Echoes"]);
    // ground-truth.md section 5 tree point totals; si4lgl / hh7pa3 are planner leftovers (not specialized)
    const pts = Object.fromEntries(skills.map((s) => [s.ability_id, [s.points, s.is_specialized]]));
    expect(pts).toMatchObject({ es6ai: [26, 1], do5vr: [22, 1], an0my: [22, 1], v01cv: [22, 1], ab0lh: [22, 1], si4lgl: [23, 0], hh7pa3: [23, 0] });
    // node_count / has_tree_points expose the leftover trees: tree points on a skill that is not specialized
    const flags = Object.fromEntries(
      all(`SELECT ability_id, node_count, has_tree_points, is_specialized FROM community_build_skills WHERE build_profile_id = ?`, id).map((s) => [s.ability_id, [s.node_count, s.has_tree_points, s.is_specialized]]),
    );
    expect(flags.es6ai).toEqual([12, 1, 1]);
    expect((flags.si4lgl as number[])[1]).toBe(1);
    expect((flags.si4lgl as number[])[2]).toBe(0);
    expect((flags.si4lgl as number[])[0]).toBeGreaterThan(0);
    expect(one(`SELECT count(*) AS n FROM community_build_skills WHERE has_tree_points <> (points > 0) OR (node_count > 0) <> (points > 0)`).n).toBe(0);
    const es = all(`SELECT node_name, points FROM v_build_nodes_named WHERE build_profile_id = ? AND tree_id = 'es6ai'`, id);
    expect(Object.fromEntries(es.map((r) => [r.node_name, r.points]))).toEqual({
      "Dust To Wind": 3, "Rifts of Decay": 2, Merciful: 2, "Erasure of the Living": 5, "Time Loop": 1, "Shattered Continuity": 1,
      "Chamber of Fate": 2, Obliteration: 5, "Prophet's Onslaught": 2, "Essence of the End": 1, "Implements of Destruction": 1, "Final Hour": 1,
    });
  });

  it("decodes the Starter body (rare Champion Regalia with a sealed affix)", () => {
    const r = one(
      `SELECT i.item_row_id, i.kind, st.name FROM community_build_items i
         JOIN community_build_profiles p ON p.build_profile_id = i.build_profile_id
         JOIN item_subtypes st ON st.base_type_id = i.base_type_id AND st.sub_type_id = i.sub_type_id
        WHERE p.name = 'Starter' AND i.slot = 'body'`,
    );
    expect([r.name, r.kind]).toEqual(["Champion Regalia", "rare"]);
    const got = all(`SELECT origin, affix_id, tier FROM community_build_item_affixes WHERE item_row_id = ? ORDER BY ord`, r.item_row_id);
    expect(got.map((a) => [a.origin, a.affix_id, a.tier])).toEqual([["normal", 34, 5], ["normal", 568, 5], ["normal", 25, 5], ["normal", 52, 5], ["sealed", 373, 1]]);
  });

  it("aggregates usage views", () => {
    expect(one(`SELECT builds, default_builds FROM v_item_usage WHERE name = 'World Splitter'`)).toEqual({ builds: 1, default_builds: 1 });
    const mana = one(`SELECT builds, items, max_tier FROM v_affix_usage WHERE affix_id = 34 AND slot = 'head' AND origin = 'extra'`);
    expect(mana).toMatchObject({ builds: 1, max_tier: 7 });
  });

  it("is a no-op without a guides folder", () => {
    const empty = mkdtempSync(join(tmpdir(), "le-community-"));
    try {
      const b = buildForTest([]);
      const ctx = createContext(b.db, loadRaw(currentVersion()!));
      const r = loadCommunityFrom(ctx, join(empty, "maxroll-guides"));
      expect(r).toMatchObject({ present: false, builds: 0, unresolved_total: 0 });
      expect(checkExpected(b.db, expectedFor(join(empty, "maxroll-guides"))).filter((x) => !x.ok)).toEqual([]);
      expect(checkExpected(b.db, expected).every((x) => x.ok)).toBe(true);
      b.db.close();
    } finally {
      rmSync(empty, { recursive: true, force: true });
    }
  });

  /** Write a modified copy of the fixture (index + profile) and load it against the game tables. */
  const loadModified = (edit: (idx: { guides: Row[] }, env: Row, pd: { profiles: Row[]; items: Record<string, Row> }) => void) => {
    const dir = mkdtempSync(join(tmpdir(), "le-community-"));
    try {
      const guides = join(dir, "maxroll-guides");
      mkdirSync(join(guides, "profiles"), { recursive: true });
      const idx = JSON.parse(readFileSync(join(FIXTURE, "index.json"), "utf8"));
      const env = JSON.parse(readFileSync(join(FIXTURE, "profiles", "0g5ta0n3.json"), "utf8"));
      const pd = JSON.parse(env.data);
      edit(idx, env, pd);
      env.data = JSON.stringify(pd);
      writeFileSync(join(guides, "index.json"), JSON.stringify(idx));
      writeFileSync(join(guides, "profiles", "0g5ta0n3.json"), JSON.stringify(env));
      const b = buildForTest(["world", "items", "skills"]);
      const ctx = createContext(b.db, loadRaw(currentVersion()!));
      const r = b.db.transaction(() => loadCommunityFrom(ctx, guides))();
      return { db: b.db, report: r };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };

  it("decodes inline item objects (a slot / idol entry that is the item itself) like PD.items keys", { timeout: 60_000 }, () => {
    const { db, report } = loadModified((_idx, _env, pd) => {
      const tab = pd.profiles.find((t) => t.name === "Endgame") as Row & { items: Record<string, unknown>; idols: unknown[] };
      tab.items.weapon = pd.items[String(tab.items.weapon)]; // the World Splitter object, inline
      const at = tab.idols.findIndex((k) => k !== null && k !== undefined);
      tab.idols[at] = pd.items[String(tab.idols[at])];
    });
    expect(report.unresolved).toEqual({});
    expect(report.inline_items).toBe(2);
    const w = db
      .prepare(
        `SELECT i.item_key, i.kind, u.name, (SELECT group_concat(origin || ':' || affix_id || ':T' || tier, ' ') FROM community_build_item_affixes x WHERE x.item_row_id = i.item_row_id) AS affixes
           FROM community_build_items i JOIN community_build_profiles p ON p.build_profile_id = i.build_profile_id LEFT JOIN uniques u ON u.unique_id = i.unique_id
          WHERE p.name = 'Endgame' AND i.slot = 'weapon'`,
      )
      .get();
    expect(w).toEqual({ item_key: "inline", kind: "legendary", name: "World Splitter", affixes: "extra:76:T7 corruption:986:T7" });
    const idols = db
      .prepare(`SELECT item_key, grid_x, grid_y FROM community_build_items i JOIN community_build_profiles p ON p.build_profile_id = i.build_profile_id WHERE p.name = 'Endgame' AND slot = 'idol' ORDER BY grid_index`)
      .all() as Row[];
    expect(idols).toHaveLength(6);
    expect(idols[0]).toEqual({ item_key: "inline", grid_x: 2, grid_y: 0 });
    expect(idols.slice(1).every((r) => r.item_key !== "inline")).toBe(true);
    db.close();
  });

  it("class rule: the profile's class / mastery wins; a card mastery mismatch is a warning, a card class mismatch is unresolved", { timeout: 60_000 }, () => {
    // leveling-guide shape: the card says Forge Guard, the profile's default tab is Void Knight (same class Sentinel)
    const a = loadModified((idx) => {
      idx.guides[0]!.mastery = "forge-guard";
    });
    expect(a.report.unresolved).toEqual({});
    expect(a.report.warnings.guide_mastery).toEqual({ count: 1, distinct: 1, examples: ["Sentinel/forge-guard vs Sentinel/Void Knight (erasing-strike-void-knight-guide/0g5ta0n3)"] });
    expect(a.db.prepare(`SELECT class_id, mastery_index, guide_mastery_index, mastery_name FROM community_builds`).get()).toEqual({
      class_id: 2,
      mastery_index: 1,
      guide_mastery_index: 2,
      mastery_name: "forge-guard",
    });
    a.db.close();
    // a matching card: guide_mastery_index = mastery_index, no warning
    const ok = loadModified(() => {});
    expect(ok.report.warnings).toEqual({});
    expect(ok.db.prepare(`SELECT mastery_index, guide_mastery_index FROM community_builds`).get()).toEqual({ mastery_index: 1, guide_mastery_index: 1 });
    ok.db.close();
    // a different CLASS on the card stays unresolved; the profile's class is still used
    const bad = loadModified((idx) => {
      idx.guides[0]!.class = "Mage";
      idx.guides[0]!.mastery = "Runemaster";
    });
    expect(bad.report.unresolved.guide_class?.count).toBe(1);
    expect(bad.report.warnings).toEqual({});
    expect(bad.db.prepare(`SELECT class_id, mastery_index FROM community_builds`).get()).toEqual({ class_id: 2, mastery_index: 1 });
    bad.db.close();
  });

  it("a numeric mainset is a unique_id; a hole in the node numbering absent from both sources is a removed node", { timeout: 60_000 }, () => {
    const { db, report } = loadModified((_idx, env, pd) => {
      env.mainset = "12";
      const tab = pd.profiles.find((t) => t.name === "Endgame") as Row & { skillTrees: Record<string, { history: number[]; position: number }> };
      const es = tab.skillTrees.es6ai!;
      es.history = [...es.history.slice(0, es.position), 25]; // es6ai has nodes 24 and 26 but no 25
      es.position = es.history.length;
    });
    expect(report.unresolved).toEqual({});
    expect(report.warnings.mainset_unique?.count).toBe(1);
    expect(report.warnings.removed_node?.examples).toEqual(["es6ai:25 (erasing-strike-void-knight-guide/0g5ta0n3/Endgame)"]);
    expect(db.prepare(`SELECT main_unique_id, main_ability_id, main_ability_source FROM community_builds`).get()).toEqual({
      main_unique_id: 12,
      main_ability_id: "es6ai",
      main_ability_source: "title",
    });
    const endgameId = (db.prepare(`SELECT build_profile_id AS id FROM community_build_profiles WHERE name = 'Endgame'`).get() as Row).id;
    expect(db.prepare(`SELECT count(*) AS n FROM community_build_skill_nodes WHERE tree_id = 'es6ai' AND node_id = 25`).get()).toEqual({ n: 0 });
    expect(db.prepare(`SELECT points FROM community_build_skills WHERE build_profile_id = ? AND ability_id = 'es6ai'`).get(endgameId)).toEqual({ points: 26 });
    db.close();
  });

  it("counts unresolved ids with examples and keeps the rows", () => {
    const dir = mkdtempSync(join(tmpdir(), "le-community-"));
    try {
      const guides = join(dir, "maxroll-guides");
      mkdirSync(join(guides, "profiles"), { recursive: true });
      const idx = JSON.parse(readFileSync(join(FIXTURE, "index.json"), "utf8"));
      idx.guides[0].profile_ids = ["0g5ta0n3", "missing1"];
      writeFileSync(join(guides, "index.json"), JSON.stringify(idx));
      const env = JSON.parse(readFileSync(join(FIXTURE, "profiles", "0g5ta0n3.json"), "utf8"));
      const pd = JSON.parse(env.data);
      const endgameTab = pd.profiles.find((t: { name: string }) => t.name === "Endgame");
      const weaponKey = String(endgameTab.items.weapon);
      pd.items[weaponKey] = { ...pd.items[weaponKey], uniqueID: 9999, affixes: [{ id: 99999, tier: 7, roll: 1 }, { id: 76, tier: 9, roll: 1 }] };
      endgameTab.specializedSkills = [...endgameTab.specializedSkills.slice(0, 4), "NotASkill"];
      endgameTab.passives.history = [...endgameTab.passives.history, 4242];
      endgameTab.passives.position = endgameTab.passives.history.length;
      env.mainset = "AlsoNotASkill";
      env.data = JSON.stringify(pd);
      writeFileSync(join(guides, "profiles", "0g5ta0n3.json"), JSON.stringify(env));

      const b = buildForTest(["world", "items", "skills"]);
      const ctx = createContext(b.db, loadRaw(currentVersion()!));
      const r = b.db.transaction(() => loadCommunityFrom(ctx, guides))();
      expect(r.builds).toBe(2);
      expect(r.profiles_missing).toBe(1);
      expect(r.unresolved.unique).toEqual({ count: 1, distinct: 1, examples: ["9999 (erasing-strike-void-knight-guide/0g5ta0n3/Endgame/weapon)"] });
      expect(r.unresolved.affix?.examples).toEqual(["99999 (erasing-strike-void-knight-guide/0g5ta0n3/Endgame/weapon)"]);
      expect(r.unresolved.affix_tier?.examples).toEqual(["76:T9 (erasing-strike-void-knight-guide/0g5ta0n3/Endgame/weapon)"]);
      expect(r.unresolved.ability?.distinct).toBe(2);
      expect(r.unresolved.passive_node?.examples).toEqual(["kn-1:4242 (erasing-strike-void-knight-guide/0g5ta0n3/Endgame)"]);
      expect(r.unresolved_total).toBe(6);
      // main skill falls back to the specialized skill named in the title
      expect(b.db.prepare("SELECT main_ability_id, main_ability_source FROM community_builds WHERE build_id = 1").get()).toEqual({ main_ability_id: "es6ai", main_ability_source: "title" });
      expect(b.db.prepare("SELECT profile_status, is_primary FROM community_builds ORDER BY build_id").all()).toEqual([
        { profile_status: "ok", is_primary: 1 },
        { profile_status: "missing", is_primary: 0 },
      ]);
      expect(checkExpected(b.db, expectedFor(guides)).filter((x) => !x.ok)).toEqual([]);
      b.db.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

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

  it("names affixes with rolled values (World Splitter Melee Void Damage T7 = 65, Mask Mana T7 = 120, Mana / Regen T5 = 8% / 33%)", () => {
    const id = endgame();
    const text = (slot: string) => (one(`SELECT affixes_text FROM v_build_items_named WHERE build_profile_id = ? AND slot = ?`, id, slot).affixes_text as string);
    expect(text("weapon")).toMatch(/^Melee Void Damage T7 \[extra\] \(Melee Void Damage 65\); .* T7 \[corruption\]/);
    expect(text("head")).toBe("Mana T7 [extra] (Mana 120); Increased Mana and Mana Regen T5 [extra] (Mana 0.08, Mana Regen 0.33)");
    expect(text("body")).toMatch(/^Level of Erasing Strike T7 \[extra\] \(Erasing Strike 4, Void Damage 1\.5\); Mana T5 \[extra\] \(Mana 50\)$/);
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

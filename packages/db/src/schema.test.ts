import { readFileSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import { afterAll, describe, expect, it } from "vitest";
import { REPO_ROOT } from "./lib/paths.js";
import { applySchema, insertRow, listIndexes, listTables, listViews } from "./lib/sqlite.js";
import { SOURCE_KINDS } from "./lib/stat-lines.js";
import * as community from "./loaders/community.js";
import * as items from "./loaders/items.js";
import * as skills from "./loaders/skills.js";
import * as world from "./loaders/world.js";
import { SEARCH_KINDS, buildSearch } from "./search.js";

const EXPECTED_TABLES = [
  "abilities", "ability_components", "ability_links", "ability_properties", "affix_can_roll_on",
  "affix_display_categories", "affix_reroll_chances", "affix_stats", "affix_tiers", "affixes", "ailments",
  "arena_tiers", "arenas", "attributes", "blessings", "class_abilities", "classes", "community_build_blessings",
  "community_build_item_affixes", "community_build_items", "community_build_passives", "community_build_profiles",
  "community_build_skill_nodes", "community_build_skills", "community_builds", "compact_ids",
  "conditional_properties", "dungeon_tiers", "dungeons", "endgame_mod_refs", "entities", "enums",
  "faction_ranks", "factions", "i18n", "idol_altar_properties", "idol_altars", "item_base_types",
  "item_subtypes", "masteries", "maxroll_crosscheck", "maxroll_quests", "meta", "mods",
  "monolith_reward_groups", "monolith_rewards", "monster_mods", "player_properties", "prophecy_unlocks",
  "raw_globals", "relations", "scenes", "search", "set_tooltips", "sets", "stat_properties",
  "stat_property_alt_texts", "tag_bits", "timeline_blessings", "timeline_difficulties", "timelines",
  "tree_node_requirements", "tree_nodes", "trees", "ui_buffs", "unique_subtypes", "unique_tooltip_entries",
  "unique_tooltips", "uniques", "woven_echoes",
];
const EXPECTED_VIEWS = [
  "v_affix_summary", "v_affix_usage", "v_blessings", "v_build_items_named", "v_build_nodes_named", "v_build_summary",
  "v_item_usage", "v_mods_named", "v_skill_node_summary", "v_unique_summary",
];
const EXPECTED_INDEXES = [
  "abilities_index", "abilities_name", "ability_components_type", "ability_properties_ability",
  "affix_can_roll_on_base", "affixes_name", "ailments_name", "blessings_timeline", "community_build_blessings_blessing",
  "community_build_item_affixes_affix", "community_build_items_profile", "community_build_items_subtype",
  "community_build_items_unique", "community_build_passives_node", "community_build_skill_nodes_node",
  "community_build_skills_ability", "community_builds_class", "community_builds_slug", "compact_ids_target",
  "endgame_mod_refs_mod", "enums_value", "item_subtypes_name", "mods_identity", "mods_property", "mods_source",
  "mods_tags", "relations_source", "relations_target", "timeline_blessings_blessing", "tree_nodes_name",
  "uniques_base", "uniques_name",
];

/** ```sql fenced blocks of a markdown file. */
function sqlBlocks(path: string): string[] {
  const md = readFileSync(path, "utf8");
  return [...md.matchAll(/```sql\r?\n([\s\S]*?)```/g)].map((m) => m[1]!.trim());
}

describe("schema.sql", () => {
  const db = new Database(":memory:");
  applySchema(db);
  afterAll(() => db.close());

  it("creates exactly the expected tables, views and indexes", () => {
    expect(listTables(db)).toEqual(EXPECTED_TABLES);
    expect(listViews(db)).toEqual(EXPECTED_VIEWS);
    expect(listIndexes(db)).toEqual(EXPECTED_INDEXES);
  });

  it("indexes mods on (property, modifier_type), (source_kind, source_id) and tags", () => {
    const cols = (idx: string) => (db.prepare(`SELECT name FROM pragma_index_info(?)`).all(idx) as { name: string }[]).map((c) => c.name);
    expect(cols("mods_property")).toEqual(["property", "modifier_type"]);
    expect(cols("mods_source")).toEqual(["source_kind", "source_id"]);
    expect(cols("mods_tags")).toEqual(["tags"]);
  });

  it("has a raw_json column on every entity table", () => {
    const noRaw = new Set(["meta", "i18n", "enums", "tag_bits", "raw_globals", "compact_ids", "affix_stats", "affix_tiers",
      "affix_can_roll_on", "affix_reroll_chances", "affix_display_categories", "set_tooltips", "unique_subtypes",
      "unique_tooltips", "unique_tooltip_entries", "stat_property_alt_texts", "class_abilities", "ability_links",
      "tree_node_requirements", "timeline_blessings", "endgame_mod_refs", "prophecy_unlocks", "relations", "search",
      "maxroll_crosscheck", "community_build_item_affixes", "community_build_blessings", "community_build_passives",
      "community_build_skills", "community_build_skill_nodes"]);
    for (const t of EXPECTED_TABLES.filter((x) => !noRaw.has(x))) {
      const cols = (db.prepare(`SELECT name FROM pragma_table_info(?)`).all(t) as { name: string }[]).map((c) => c.name);
      expect(cols, t).toContain("raw_json");
    }
  });

  it("contains every table named by the loader stubs", () => {
    const tables = new Set(listTables(db));
    for (const mod of [world, items, skills, community]) {
      for (const t of [...mod.tables, ...mod.sharedTables]) expect(tables.has(t), t).toBe(true);
    }
  });

  it("assigns every owned table to exactly one loader", () => {
    const owned = [...world.tables, ...items.tables, ...skills.tables, ...community.tables];
    expect(new Set(owned).size).toBe(owned.length);
    const shared = ["meta", "mods", "relations", "compact_ids", "search"];
    expect([...owned, ...shared].sort()).toEqual([...EXPECTED_TABLES].sort());
  });

  it("assigns every mods source_kind to exactly one loader and documents it in schema.sql", () => {
    const kinds = [...world.modSourceKinds, ...items.modSourceKinds, ...skills.modSourceKinds];
    expect([...kinds].sort()).toEqual([...SOURCE_KINDS].sort());
    const sql = readFileSync(join(REPO_ROOT, "packages/db/schema.sql"), "utf8");
    for (const k of SOURCE_KINDS) expect(sql, k).toMatch(new RegExp(`--\\s+${k}\\s`));
  });

  it("every expected-count query prepares against the schema", () => {
    for (const mod of [world, items, skills]) for (const e of mod.expected) expect(() => db.prepare(e.sql), e.name).not.toThrow();
    for (const e of community.expectedFor(join(REPO_ROOT, "packages/db/src/loaders/__fixtures__/maxroll-guides"))) {
      expect(() => db.prepare(e.sql).get(), e.name).not.toThrow();
    }
  });

  it("views run on synthetic rows", () => {
    const t = db.transaction(() => {
      insertRow(db, "uniques", { unique_id: 0, name: "Calamity", base_type_id: 0, sub_type_id: 1, is_set_item: 0, mod_count: 1, raw_json: "{}" });
      insertRow(db, "item_base_types", { base_type_id: 0, name: "Helmet", equippable: 1, raw_json: "{}" });
      insertRow(db, "item_subtypes", { base_type_id: 0, sub_type_id: 1, name: "Jewelled Circlet", raw_json: "{}" });
      insertRow(db, "mods", { source_kind: "unique_mod", source_id: "0", source_ord: 0, property: 0, property_name: "Damage", tags: 8, tag_names: "Fire", modifier_type: 1, value_min: 0.2, value_max: 0.8, raw_json: "{}" });
      insertRow(db, "affixes", { affix_id: 0, name: "Void Penetration", kind: "single", affix_type: 0, affix_type_name: "prefix", tier_count: 1, stat_count: 1, raw_json: "{}" });
      insertRow(db, "affix_stats", { affix_id: 0, ord: 0, property: 59, property_name: "Penetration", special_tag: 0, tags: 16, extra_tag: 0, modifier_type: 0 });
      insertRow(db, "affix_can_roll_on", { affix_id: 0, base_type_id: 0, ord: 0 });
      insertRow(db, "mods", { source_kind: "affix_tier", source_id: "0", source_ord: 0, tier: 1, property: 59, modifier_type: 0, value_min: 0.04, value_max: 0.04, raw_json: "{}" });
      insertRow(db, "mods", { source_kind: "affix_tier", source_id: "0", source_ord: 0, tier: 2, property: 59, modifier_type: 0, value_min: 0.05, value_max: 0.05, raw_json: "{}" });
      insertRow(db, "trees", { tree_id: "fi9", tree_kind: "skill", name: "Fireball", node_count: 1, raw_json: "{}" });
      insertRow(db, "tree_nodes", { tree_id: "fi9", node_id: 2, tree_kind: "skill", name: "Piercing Heat", raw_json: "{}" });
      insertRow(db, "mods", { source_kind: "skill_node", source_id: "fi9:2", source_ord: 0, property: 5002, label: "Pierce Chance", display: "+25%", value_min: 0.25, value_max: 0.25, raw_json: "{}" });
      insertRow(db, "blessings", { sub_type_id: 101, name: "Binds of Nature", timeline_id: 7, difficulty_index: 0, slot_kind: "other", raw_json: "{}" });
      insertRow(db, "timelines", { timeline_id: 7, name: "Reign of Dragons", raw_json: "{}" });
      insertRow(db, "mods", { source_kind: "blessing", source_id: "34:101", source_ord: 0, property: 0, tags: 64, modifier_type: 1, value_min: 0.4, value_max: 0.6, raw_json: "{}" });
    });
    t();
    const u = db.prepare(`SELECT * FROM v_unique_summary`).get() as Record<string, unknown>;
    expect(u.sub_type).toBe("Jewelled Circlet");
    expect(u.mods_text).toBe("Damage increased 0.2..0.8 [Fire]");
    const a = db.prepare(`SELECT * FROM v_affix_summary`).get() as Record<string, unknown>;
    expect([a.min_value, a.max_value, a.rolls_on_text]).toEqual([0.04, 0.05, "Helmet"]);
    expect(a.stats_text).toBe("Penetration added 0.04..0.05");
    const n = db.prepare(`SELECT * FROM v_skill_node_summary`).get() as Record<string, unknown>;
    expect(n.stats_text).toBe("Pierce Chance: +25%");
    const b = db.prepare(`SELECT timeline_name, modifier_name, value_min, value_max FROM v_blessings`).get();
    expect(b).toEqual({ timeline_name: "Reign of Dragons", modifier_name: "increased", value_min: 0.4, value_max: 0.6 });
    const named = db.prepare(`SELECT source_kind, source_name FROM v_mods_named ORDER BY id`).all();
    expect(named).toEqual([
      { source_kind: "unique_mod", source_name: "Calamity" },
      { source_kind: "affix_tier", source_name: "Void Penetration" },
      { source_kind: "affix_tier", source_name: "Void Penetration" },
      { source_kind: "skill_node", source_name: "Piercing Heat" },
      { source_kind: "blessing", source_name: null },
    ]);
    const counts = buildSearch(db);
    expect(Object.keys(counts)).toEqual([...SEARCH_KINDS]);
    expect(counts.unique).toBe(1);
    const hit = db.prepare(`SELECT kind, id FROM search WHERE search MATCH 'circlet'`).all();
    expect(hit).toEqual([{ kind: "unique", id: "0" }, { kind: "item_subtype", id: "0:1" }]);
  });

  it("search builds on an empty database", () => {
    const empty = new Database(":memory:");
    applySchema(empty);
    const counts = buildSearch(empty);
    expect(Object.values(counts).every((n) => n === 0)).toBe(true);
    empty.close();
  });
});

describe("docs/schema.md example queries", () => {
  const blocks = sqlBlocks(join(REPO_ROOT, "docs/schema.md"));
  const db = new Database(":memory:");
  applySchema(db);
  afterAll(() => db.close());

  it("has at least 15 sql examples", () => {
    expect(blocks.length).toBeGreaterThanOrEqual(15);
  });

  it.each(blocks.map((b, i) => [i + 1, b] as const))("example %i prepares against the empty schema", (_i, sql) => {
    for (const stmt of sql.split(/;\s*(?:\r?\n|$)/).map((s) => s.trim()).filter(Boolean)) {
      expect(() => db.prepare(stmt).all()).not.toThrow();
    }
  });
});

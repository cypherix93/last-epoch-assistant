import { afterAll, describe, expect, it } from "vitest";
import { checkExpected } from "../lib/expected.js";
import { buildForTest, hasRawData, type TestBuild } from "../lib/testing.js";
import { expected, tables } from "./skills.js";

// Owner: skills agent. Builds the real raw data with only the skills step and asserts the counts.
describe.skipIf(!hasRawData())("skills loader", () => {
  let build: TestBuild | undefined;
  const get = () => (build ??= buildForTest(["skills"]));
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
    const empty = tables.filter((tb) => b.report.tables[tb] === 0);
    expect(empty).toEqual([]);
  });
});

describe.skipIf(!hasRawData())("skills loader spot checks", () => {
  let build: TestBuild | undefined;
  const get = () => (build ??= buildForTest(["skills"]));
  afterAll(() => build?.db.close());
  const one = <T>(sql: string, ...args: unknown[]) => get().db.prepare(sql).get(...args) as T;
  const all = <T>(sql: string, ...args: unknown[]) => get().db.prepare(sql).all(...args) as T[];

  it("Fireball ability fi9 and its DamageEnemyOnHit component", () => {
    const a = one<{ name: string; mana_cost: number; is_player_ability: number; has_skill_tree: number }>(
      "SELECT name, mana_cost, is_player_ability, has_skill_tree FROM abilities WHERE ability_id = 'fi9'",
    );
    expect(a).toEqual({ name: "Fireball", mana_cost: 3, is_player_ability: 1, has_skill_tree: 1 });
    const c = one<{ raw_json: string }>("SELECT raw_json FROM ability_components WHERE ability_id = 'fi9' AND component_type = 'DamageEnemyOnHit'");
    const comp = JSON.parse(c.raw_json);
    expect(comp.baseDamageStats.damage).toEqual([0, 25, 0, 0, 0, 0, 0]);
    expect(comp.baseDamageStats.addedDamageScaling).toBe(1.25);
  });

  it("Fireball tree node 2 'Piercing Heat' has display-only stats", () => {
    const tree = one<{ tree_id: string }>("SELECT tree_id FROM trees WHERE ability_id = 'fi9'");
    const node = one<{ name: string }>("SELECT name FROM tree_nodes WHERE tree_id = ? AND node_id = 2", tree.tree_id);
    expect(node.name).toBe("Piercing Heat");
    const stats = all<{ property: number; value_min: number; is_downside: number; modifier_type: number | null; display: string }>(
      "SELECT property, value_min, is_downside, modifier_type, display FROM mods WHERE source_kind = 'skill_node' AND source_id = ? ORDER BY source_ord",
      `${tree.tree_id}:2`,
    );
    expect(stats).toHaveLength(2);
    expect(stats[0]).toMatchObject({ property: 5002, value_min: 0.25, is_downside: 0, modifier_type: null, display: "+25%" });
    expect(stats[1]).toMatchObject({ property: 66, value_min: 0.33, is_downside: 1, modifier_type: null });
  });

  it("node stats carry noScaling (per point unless 1) and requirements are an any-one-of adjacency", () => {
    const rows = all<{ no_scaling: number }>("SELECT no_scaling FROM mods WHERE source_kind = 'skill_node' AND source_id = 'av75ch:3' ORDER BY source_ord");
    expect(rows.map((r) => r.no_scaling)).toEqual([0, 1]);
    expect(one<{ n: number }>("SELECT count(*) n FROM mods WHERE source_kind NOT IN ('skill_node','passive_node','weaver_node') AND no_scaling IS NOT NULL").n).toBe(0);
    // es6ai nodes 8 and 11 list each other, so the requirements cannot be an AND
    const a = one<{ n: number }>("SELECT count(*) n FROM tree_node_requirements WHERE tree_id = 'es6ai' AND node_id = 8 AND required_node_id = 11").n;
    const b = one<{ n: number }>("SELECT count(*) n FROM tree_node_requirements WHERE tree_id = 'es6ai' AND node_id = 11 AND required_node_id = 8").n;
    expect([a, b]).toEqual([1, 1]);
  });

  it("abilities.kind separates player skills from their sub-abilities", () => {
    expect(one<{ kind: string; parent_ability_id: string | null }>("SELECT kind, parent_ability_id FROM abilities WHERE ability_id = 'es6ai'")).toEqual({ kind: "player", parent_ability_id: null });
    expect(one<{ kind: string; parent_ability_id: string | null }>("SELECT kind, parent_ability_id FROM abilities WHERE ability_id = 'es6ai_1'")).toEqual({ kind: "player_sub", parent_ability_id: "es6ai" });
    expect(one<{ n: number }>("SELECT count(*) n FROM abilities WHERE kind = 'player'").n).toBe(182);
    expect(one<{ n: number }>("SELECT count(*) n FROM abilities WHERE kind <> 'player' AND is_player_ability = 1").n).toBe(0);
    expect(one<{ n: number }>("SELECT count(*) n FROM abilities WHERE (kind = 'player_sub') <> (parent_ability_id IS NOT NULL)").n).toBe(0);
  });

  it("Ignite ailment", () => {
    const a = one<{ name: string; duration: number; dmg_fire: number; damage_types: string }>(
      "SELECT name, duration, dmg_fire, damage_types FROM ailments WHERE ailment_id = 1",
    );
    expect(a).toEqual({ name: "Ignite", duration: 2.5, dmg_fire: 40, damage_types: "Fire" });
  });

  it("a Mage passive node name resolves", () => {
    const n = one<{ c: number }>("SELECT count(*) c FROM tree_nodes WHERE tree_id = 'mg-1' AND name IS NOT NULL AND name <> ''");
    expect(n.c).toBeGreaterThan(50);
    expect(one<{ class_id: number }>("SELECT class_id FROM trees WHERE tree_id = 'mg-1'").class_id).toBe(1);
  });

  it("a Weaver node has a stat", () => {
    const s = one<{ source_id: string; label: string }>("SELECT source_id, label FROM mods WHERE source_kind = 'weaver_node' ORDER BY id LIMIT 1");
    expect(s.source_id).toMatch(/^weaver:\d+$/);
    expect(s.label).toBeTruthy();
    expect(one<{ name: string }>("SELECT name FROM trees WHERE tree_id = 'weaver'").name).toBeTruthy();
  });

  it("every node requirement and node relation points at an existing node / owner", () => {
    expect(one<{ c: number }>(`SELECT count(*) c FROM tree_node_requirements r LEFT JOIN tree_nodes n ON n.tree_id = r.tree_id AND n.node_id = r.required_node_id WHERE n.tree_id IS NULL`).c).toBe(0);
  });
});

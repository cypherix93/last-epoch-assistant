import { describe, expect, it } from "vitest";
import { classifyAbilities } from "./ability-kind.js";

const ab = (prefab?: unknown) => ({ prefab });

describe("classifyAbilities", () => {
  const list = {
    es6ai: ab({ components: [{ type: "CreateAbilityObjectOnDeath", abilityToInstantiate: "es6ai_1" }] }),
    es6ai_1: ab({ components: [{ type: "DamageEnemyOnHit" }, { type: "CastAtCorpseOnKill", abilityToCast: "ability_gen55_1" }] }),
    ability_gen55_1: ab(),
    av75ch: ab(),
    av75ch_me27_1_1: ab(),
    ability_gen117_sw43_1: ab(),
    sw43: ab(),
    entity_fm8_1: ab({ components: [{ ability: "ability_gen9_1" }] }),
    ability_gen9_1: ab(),
    ability_gen2: ab(),
  };
  const entities = { "100000": { abilityList: { abilities: ["ability_gen2"] } } };
  const c = classifyAbilities(list, ["es6ai", "av75ch", "sw43"], entities);

  it("player abilities", () => expect(c.get("es6ai")).toEqual({ kind: "player", parent: null }));
  it("sub-abilities by prefab reference (transitive), id prefix and id segment", () => {
    expect(c.get("es6ai_1")).toEqual({ kind: "player_sub", parent: "es6ai" });
    expect(c.get("ability_gen55_1")).toEqual({ kind: "player_sub", parent: "es6ai" });
    expect(c.get("av75ch_me27_1_1")).toEqual({ kind: "player_sub", parent: "av75ch" });
    expect(c.get("ability_gen117_sw43_1")).toEqual({ kind: "player_sub", parent: "sw43" });
  });
  it("minion abilities: entity lists, entity_ ids and what they reach", () => {
    expect(c.get("ability_gen2")?.kind).toBe("minion");
    expect(c.get("entity_fm8_1")?.kind).toBe("minion");
    expect(c.get("ability_gen9_1")?.kind).toBe("minion");
  });
  it("everything else is other (there is no monster kind)", () => {
    const d = classifyAbilities({ ability_gen7: ab(), p: ab() }, ["p"], {});
    expect(d.get("ability_gen7")).toEqual({ kind: "other", parent: null });
  });
});

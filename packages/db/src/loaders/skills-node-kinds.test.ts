import { describe, expect, it } from "vitest";
import { ailmentIdOfProperty, fieldModifier, inferKind, labelFitsProperty, labelMismatch, NodeEffectIndex, propertyKind, tokens } from "./skills-node-kinds.js";

describe("tree node stat property kinds", () => {
  it("decodes the tooltip property encoding", () => {
    expect(propertyKind(0)).toBe("stat");
    expect(propertyKind(54)).toBe("display_only");
    expect(propertyKind(5110)).toBe("tooltip_category");
    expect(propertyKind(10001)).toBe("ailment");
    expect(propertyKind(null)).toBe("display_only");
    expect(ailmentIdOfProperty(10023)).toBe(23);
    expect(ailmentIdOfProperty(15001)).toBeNull();
  });

  it("tokenizes labels and code names alike", () => {
    expect(tokens("Effect of Damage Stats on a 2h Weapon")).toEqual(["effect", "of", "damage", "stat", "on", "a", "two", "weapon"]);
    expect(tokens("twoHandedWeaponStatModifier")).toEqual(["two", "weapon", "stat", "modifier"]);
    expect(tokens("Ward Gained")).toEqual(["ward", "gain"]);
  });

  it("labelFitsProperty accepts qualifiers only", () => {
    expect(labelFitsProperty("Fire Penetration", "Penetration")).toBe(true);
    expect(labelFitsProperty("Mana Cost", "Mana Cost", "ManaCost")).toBe(true);
    expect(labelFitsProperty("Increased Critical Strike Chance", "Critical Strike Chance")).toBe(true);
    expect(labelFitsProperty("Effect of Damage Stats on a 2h Weapon", "Damage", "Damage")).toBe(false);
    expect(labelFitsProperty("Orb Damage", "Damage")).toBe(false);
  });

  it("infers the kind from the text when no code effect matches", () => {
    expect(inferKind("More Spell Damage", "7%")).toEqual({ modifierType: 2, statKind: "more" });
    expect(inferKind("Increased Area", "30%")).toEqual({ modifierType: 1, statKind: "increased" });
    expect(inferKind("Melee Damage", "+2")).toEqual({ modifierType: 0, statKind: "added" });
    expect(inferKind("Fire Resistance", "+3%", true)).toEqual({ modifierType: 0, statKind: "added" });
    expect(inferKind("Damage", "+10%")).toEqual({ modifierType: null, statKind: "unknown" });
  });

  it("reads the modifier type of mutator fields from their name", () => {
    expect(fieldModifier("FireballMutator.increasedManaCost")).toBe(1);
    expect(fieldModifier("VolcanicOrbMutator.moreCastSpeed")).toBe(2);
    expect(fieldModifier("FireballMutator.addedManaCost")).toBe(0);
    expect(fieldModifier("RiveMutator.twoHandedWeaponStatModifier")).toBeNull();
  });
});

describe("NodeEffectIndex.classify", () => {
  const skill = [
    {
      treeID: "t1",
      nodes: [
        {
          id: 1,
          displayName: "Winged",
          effects: [
            { target: "M.increasedSpeed", type: "float", value: { per_point: 0.07, flat: 0 } },
            { target: "M.stats", op: "add_stat", stat: { property: "Damage", tags: "None", kind: "more", more: { per_point: 0.07, flat: 0 } } },
          ],
        },
        { id: 2, displayName: "Cleaver", effects: [{ target: "M.twoHandedWeaponStatModifier", type: "float", value: { per_point: 1, flat: 0 } }] },
      ],
    },
  ];
  const idx = new NodeEffectIndex(skill as never, null, { "t1:1": { tooltipStats: [{ propertyKind: "TooltipList", property: 5014, propertyName: "Speed and Range" }] } } as never);
  const sp = (p: number): string | null => (p === 0 ? "Damage" : p === 3 ? "CastSpeed" : null);
  const pct = () => false;

  it("pairs lines with effects by magnitude, same property first", () => {
    const k = idx.classify(
      "t1",
      1,
      "Winged",
      [
        { property: 5014, label: "Speed And Range", display: "+7%", noScaling: false },
        { property: 0, label: "Damage", display: "+7%", noScaling: false },
      ],
      sp,
      pct,
    );
    expect(k[1]).toMatchObject({ modifierType: 2, statKind: "more", source: "structured", codeProperty: "Damage" });
    expect(k[0]).toMatchObject({ modifierType: 1, statKind: "increased", source: "structured" });
    expect(idx.tooltipCategories.get(5014)).toBe("Speed and Range");
  });

  it("a mutator field is a skill parameter and its SP hint is a label mismatch", () => {
    const [k] = idx.classify("t1", 2, "Cleaver", [{ property: 0, label: "Effect of Damage Stats on a 2h Weapon", display: "+100%", noScaling: false }], sp, pct);
    expect(k).toMatchObject({ modifierType: null, statKind: "skill_parameter", source: "structured" });
    expect(labelMismatch("stat", "Effect of Damage Stats on a 2h Weapon", "Damage", "Damage", k!)).toBe(true);
  });

  it("falls back to inference when the node name differs (renumbered node) or no magnitude matches", () => {
    const [a] = idx.classify("t1", 1, "Other Name", [{ property: 0, label: "More Damage", display: "+7%", noScaling: false }], sp, pct);
    expect(a).toMatchObject({ source: "inferred", modifierType: 2 });
    const [b] = idx.classify("t1", 1, "Winged", [{ property: 0, label: "Damage", display: "+9%", noScaling: false }], sp, pct);
    expect(b).toMatchObject({ source: "inferred", statKind: "unknown" });
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildIndex,
  extractProfileIds,
  parseGuideList,
  parseShownDate,
  parseTierList,
  tierFor,
} from "./maxroll-guides.js";
import { parseArgs } from "./run.js";

const fx = (n: string) => readFileSync(new URL(`./__fixtures__/${n}`, import.meta.url), "utf8");

describe("parseGuideList", () => {
  const cards = parseGuideList(fx("maxroll-guides-list.html"));
  it("finds every card once, in page order", () => {
    expect(cards.map((c) => c.slug)).toEqual([
      "anurok-frogs-beastmaster-guide",
      "spirit-thorns-beastmaster-guide",
      "rip-blood-lich-leveling-guide",
    ]);
  });
  it("reads card fields", () => {
    expect(cards[0]).toEqual({
      slug: "anurok-frogs-beastmaster-guide",
      title: "Anurok Frogs Beastmaster Guide",
      url: "https://maxroll.gg/last-epoch/build-guides/anurok-frogs-beastmaster-guide",
      author: "BinaQc",
      updated: "October 8, 2026",
      updated_iso: "2026-10-08",
      season: "Season 5 Rage Of The Frostborn",
      playstyle: "Endgame",
      style_tags: ["Minions"],
      class: "primalist",
      mastery: "beastmaster",
      planner_id: "rl6jp20q",
    });
  });
  it("handles season 4, several style tags and leveling guides", () => {
    expect(cards[1].season).toBe("Season 4");
    expect(cards[1].style_tags).toEqual(["Caster", "Range"]);
    expect(cards[2].playstyle).toBe("Leveling");
    expect(cards[2]).toMatchObject({ class: "acolyte", mastery: "lich" });
  });
});

describe("parseShownDate", () => {
  it("parses and rejects", () => {
    expect(parseShownDate("October 8, 2026")).toBe("2026-10-08");
    expect(parseShownDate("March 12, 2025")).toBe("2025-03-12");
    expect(parseShownDate("soon")).toBeNull();
    expect(parseShownDate(null)).toBeNull();
  });
});

describe("extractProfileIds", () => {
  const html = `
    <div class="le-embed" data-le-profile="0g5ta0n3" data-le-id="2" data-le-type="plannerEquipment"></div>
    <div class="le-embed" data-le-profile="0g5ta0n3" data-le-id="2" data-le-type="plannerSkills"></div>
    <div class="le-embed" data-le-profile="zz9yy8x7" data-le-id="3" data-le-type="plannerPassives"></div>
    <div class="le-embed" data-le-profile="0g5ta0n3" data-le-id="4" data-le-type="plannerPassives"></div>
    ..."plannerId":"2i2in0qc"...`;
  it("returns distinct ids in page order and ignores the related-post plannerId", () => {
    expect(extractProfileIds(html)).toEqual(["0g5ta0n3", "zz9yy8x7"]);
  });
  it("returns [] when there are no embeds", () => expect(extractProfileIds("<html></html>")).toEqual([]));
});

describe("parseTierList", () => {
  const list = parseTierList(fx("maxroll-tierlist.html"), "https://example/tier");
  it("reads title, date and entries per tier", () => {
    expect(list.title).toMatch(/^Endgame Tier List/);
    expect(list.updated).toBe("2026-10-07");
    expect(list.entries).toEqual([
      { name: "Shadow Cascade BD", tier: "S", slug: "shadow-cascade-bladedancer-guide" },
      { name: "Static Orb Sorcerer", tier: "S", slug: "static-orb-sorcerer-guide" },
      expect.objectContaining({ tier: "A" }),
      expect.objectContaining({ tier: "A" }),
    ]);
  });
  it("maps guides by slug, then by normalised title for unlinked entries", () => {
    expect(tierFor({ slug: "static-orb-sorcerer-guide", title: "x" }, list)).toBe("S");
    expect(tierFor({ slug: "nope", title: "Nope Guide" }, list)).toBeNull();
    const l2 = { ...list, entries: [{ name: "Some Build", tier: "B", slug: null }] };
    expect(tierFor({ slug: "some-build-guide", title: "Some Build Guide" }, l2)).toBe("B");
  });
});

describe("buildIndex", () => {
  const cards = parseGuideList(fx("maxroll-guides-list.html"));
  const tl = parseTierList(fx("maxroll-tierlist.html"), "u");
  it("adds the card profile id when the page lists none and attaches tiers", () => {
    const idx = buildIndex("2026-01-01T00:00:00.000Z", cards, { [cards[0].slug]: ["aaa11111"] }, { corruption: tl });
    expect(idx.guides[0].profile_ids).toEqual(["rl6jp20q", "aaa11111"]);
    expect(idx.guides[1].profile_ids).toEqual(cards[1].planner_id ? [cards[1].planner_id] : []);
    expect(idx.guides[0].tiers).toEqual({});
    expect(idx.tier_lists.corruption).toBe(tl);
  });
});

describe("parseArgs maxroll-guides", () => {
  it("accepts --source and --only", () => {
    expect(parseArgs(["--source", "maxroll-guides"]).source).toBe("maxroll-guides");
    expect(parseArgs(["--only", "maxroll-guides"]).source).toBe("maxroll-guides");
    expect(() => parseArgs(["--only", "x"])).toThrow();
  });
});

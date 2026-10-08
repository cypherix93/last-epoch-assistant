import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { decodeGlobals } from "./decode.js";
import { discoverDataFiles, discoverVersion, versionToSemver } from "./letools.js";
import { serializeLock, type SourcesLock } from "./lock.js";
import { extractDataHash } from "./maxroll.js";
import { parseArgs } from "./run.js";

const fx = (n: string) => readFileSync(new URL(`./__fixtures__/${n}`, import.meta.url), "utf8");

describe("letools discovery", () => {
  const html = fx("planner.html");
  it("finds the version", () => expect(discoverVersion(html)).toBe("version152"));
  it("finds unique data files with sections", () => {
    const files = discoverDataFiles(html);
    expect(files).toHaveLength(7);
    expect(files.map((f) => f.section).sort()).toEqual(
      ["checklist", "db", "db", "endgame", "factions", "loot-filters", "planner"].sort(),
    );
    expect(files.every((f) => /^data\/version152\/[a-z-]+\/js\/[a-f0-9]{32}\.js$/.test(f.path))).toBe(true);
  });
});

describe("versionToSemver", () => {
  it.each([
    ["version152", "1.5.2"],
    ["version100", "1.0.0"],
    ["version145", "1.4.5"],
    ["150", "1.5.0"],
  ])("%s -> %s", (i, o) => expect(versionToSemver(i)).toBe(o));
  it("rejects bad input", () => expect(() => versionToSemver("version15")).toThrow());
});

describe("decodeGlobals", () => {
  it("captures both assignment syntaxes", () => {
    const g = decodeGlobals(fx("decode.js"));
    expect(Object.keys(g)).toEqual(["itemDB", "LEAbilities"]);
    expect(g.LEAbilities).toEqual([1, 2, 3]);
    expect(g.itemDB).toEqual({ items: { a: { id: 1 }, b: { id: 2 } } });
  });
});

describe("maxroll", () => {
  it("extracts the data.json hash", () => expect(extractDataHash(fx("maxroll-snippet.js"))).toBe("a1b2c3d4"));
  it("throws when missing", () => expect(() => extractDataHash("nothing")).toThrow());
});

describe("lockfile", () => {
  it("serializes with expected shape", () => {
    const lock: SourcesLock = {
      fetchedAt: "2026-01-01T00:00:00.000Z",
      letools: {
        versionFolder: "version152",
        plannerUrl: "https://x/planner/",
        files: [{ section: "db", url: "u", sha256: "h", bytes: 1, globals: ["itemDB"] }],
        i18n: { url: "i", sha256: "h", bytes: 2 },
      },
      maxroll: { plannerJsUrl: "p", dataHash: "a1b2c3d4", dataUrl: "d", etag: null, lastModified: null, sha256: "h", bytes: 3 },
    };
    const text = serializeLock(lock);
    expect(text.endsWith("\n")).toBe(true);
    const parsed = JSON.parse(text);
    expect(Object.keys(parsed)).toEqual(["fetchedAt", "letools", "maxroll"]);
    expect(Object.keys(parsed.letools.files[0])).toEqual(["section", "url", "sha256", "bytes", "globals"]);
  });
});

describe("parseArgs", () => {
  it("parses flags", () => {
    expect(parseArgs(["--source", "letools", "--force", "--version", "150"])).toEqual({
      source: "letools",
      force: true,
      version: "150",
    });
  });
  it("rejects unknown", () => expect(() => parseArgs(["--nope"])).toThrow());
});

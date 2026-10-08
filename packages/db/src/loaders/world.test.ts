import { afterAll, describe, expect, it } from "vitest";
import { checkExpected } from "../lib/expected.js";
import { buildForTest, hasRawData, type TestBuild } from "../lib/testing.js";
import { expected, tables } from "./world.js";

// Owner: world agent. Builds the real raw data with only the world step and asserts the counts.
describe.skipIf(!hasRawData())("world loader", () => {
  let build: TestBuild | undefined;
  const get = () => (build ??= buildForTest(["world"]));
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
    // maxroll_crosscheck is filled by the crosscheck step (src/crosscheck.ts), not by loadWorld.
    const empty = tables.filter((tb) => tb !== "maxroll_crosscheck" && b.report.tables[tb] === 0);
    expect(empty).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { name } from "./index.js";

describe("@le/mcp", () => {
  it("exports its name", () => {
    expect(name).toBe("@le/mcp");
  });
});

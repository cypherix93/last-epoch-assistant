import { describe, expect, it } from "vitest";
import { name } from "./index.js";

describe("@le/fetch", () => {
  it("exports its name", () => {
    expect(name).toBe("@le/fetch");
  });
});

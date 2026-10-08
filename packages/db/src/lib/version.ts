import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PACKAGE_DIR } from "./paths.js";

/** Bump when schema.sql changes incompatibly (consumers such as @le/mcp check meta.schema_version). */
export const SCHEMA_VERSION = "1";

/** '@le/db <package.json version>' */
export const BUILD_TOOL_VERSION: string = (() => {
  const pkg = JSON.parse(readFileSync(join(PACKAGE_DIR, "package.json"), "utf8")) as { name: string; version: string };
  return `${pkg.name} ${pkg.version}`;
})();

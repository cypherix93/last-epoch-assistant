/**
 * @le/db - normalized SQLite database of Last Epoch game data (data/le.sqlite).
 * Schema: packages/db/schema.sql, docs/schema.md. Loader contract: docs/loader-contract.md.
 */
export const name = "@le/db";

export { buildDatabase, metaRows, parseArgs, STEPS, type BuildOptions, type BuildResult, type Step } from "./build-db.js";
export { createContext, createLogger, type LoaderContext, type Logger } from "./lib/context.js";
export { checkExpected, count, modsCount, type ExpectedCount, type ExpectedResult } from "./lib/expected.js";
export * from "./lib/ids.js";
export { DATA_DIR, DEFAULT_DB_PATH, DEFAULT_REPORT_PATH, RAW_ROOT, REPO_ROOT, SCHEMA_PATH, currentVersion, hasRawData } from "./lib/paths.js";
export { loadRaw, makeTranslator, unescapeIcu, type RawData, type Translator } from "./lib/raw.js";
export { buildReport, formatReport, rowCounts, type BuildReport } from "./lib/report.js";
export { applySchema, insertRow, insertRows, openBuildDb, openReadOnly, readSchemaSql, transaction, type DB } from "./lib/sqlite.js";
export {
  describeTags,
  insertMod,
  insertStatBlock,
  isIndirectTags,
  ModValidationError,
  ModWriter,
  parseDisplayValue,
  SOURCE_KINDS,
  StatNamer,
  type ModInput,
  type SourceKind,
} from "./lib/stat-lines.js";
export { SCHEMA_VERSION, BUILD_TOOL_VERSION } from "./lib/version.js";
export { buildSearch, SEARCH_KINDS } from "./search.js";

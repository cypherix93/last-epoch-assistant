/**
 * The object every loader receives. See docs/loader-contract.md.
 */
import type { RawData, Translator } from "./raw.js";
import type { DB } from "./sqlite.js";
import { ModWriter, StatNamer } from "./stat-lines.js";

export interface Logger {
  /** Progress line (stderr). */
  info(msg: string): void;
  /** Data problem worth a look; also collected into the build report. */
  warn(msg: string): void;
}

export interface LoaderContext {
  /** Open build database with schema.sql applied (foreign keys off, runs inside a transaction per loader). */
  db: DB;
  /** Raw data of the version being built (lazy LE Tools globals, i18n, Maxroll, lockfile). */
  raw: RawData;
  /** i18n resolver: ICU-unescaped English, null when the key is null/missing/empty. Same as raw.t. */
  t: Translator;
  /** Data version folder being built, e.g. '1.5.2'. */
  version: string;
  log: Logger;
  /** The `mods` writer (insertMod / insertStatBlock bound to db, plus tag/property name helpers). */
  mods: ModWriter;
}

/** Logger writing to stderr and collecting warnings. */
export function createLogger(prefix = "db", sink: { warnings: string[] } = { warnings: [] }, quiet = false): Logger & { warnings: string[] } {
  return {
    warnings: sink.warnings,
    info(msg) {
      if (!quiet) process.stderr.write(`[${prefix}] ${msg}\n`);
    },
    warn(msg) {
      sink.warnings.push(msg);
      if (!quiet) process.stderr.write(`[${prefix}] WARN ${msg}\n`);
    },
  };
}

/** Build a LoaderContext for a db + raw data (used by build-db.ts and by loader tests). */
export function createContext(db: DB, raw: RawData, log: Logger = createLogger("db", undefined, true)): LoaderContext {
  return { db, raw, t: raw.t, version: raw.version, log, mods: new ModWriter(db, new StatNamer(raw)) };
}

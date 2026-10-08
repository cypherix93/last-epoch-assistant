/**
 * LE TOOLS vs MAXROLL CROSS-CHECK  (owner: world agent)
 * =============================================================================
 *
 * export function runCrosscheck(ctx: LoaderContext): CrosscheckResult
 *
 * Runs after all loaders and search (build-db.ts step 'crosscheck'). Compares the raw sources
 * directly (ctx.raw.letools vs ctx.raw.maxroll; it may also read the loaded tables) and:
 *   1. inserts one maxroll_crosscheck row per mismatch (entity, entity_id, field, letools_value,
 *      maxroll_value, note), note classifying it: 'float_noise' (|diff| < 1e-6), 'escape' (equal after
 *      ICU unescape / whitespace trim), 'missing_in_maxroll', 'missing_in_letools', 'real';
 *   2. returns the summary; build-db.ts writes it to data/crosscheck-report.json (committed,
 *      deterministic: sorted, no timestamps) and prints the mismatch count.
 *
 * Entities to compare (counts.md / ids.md say what is expected to match):
 *   - unique: ids, names (after unescape), base/sub types, set id, mods (property/tags/type/value/maxValue/specialTag)
 *   - affix: ids, tiers (min/max per roll; expect 8 float-noise affixes), canRollOn, property lines
 *   - ailment: ids 1..128, names, duration (Maxroll UNUSED slots 112/119 are Ignite copies -> ignore)
 *   - class: base stats (baseHealth, baseMana, healthPerLevel, manaPerLevel, attributes, ...)
 * When ctx.raw.maxroll is null, return { mismatches: 0, skipped: true, byEntity: {} } and insert nothing.
 */
import type { LoaderContext } from "./lib/context.js";

export interface CrosscheckResult {
  /** Total mismatch rows (excluding notes 'float_noise' and 'escape'). */
  mismatches: number;
  /** True when Maxroll data was absent. */
  skipped: boolean;
  /** Per entity: { compared, mismatches, by_note }. */
  byEntity: Record<string, { compared: number; mismatches: number; byNote: Record<string, number> }>;
}

export function runCrosscheck(ctx: LoaderContext): CrosscheckResult {
  void ctx;
  throw new Error("not implemented: crosscheck");
}

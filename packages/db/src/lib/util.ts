/**
 * Small deterministic helpers shared by all loaders.
 *
 * Determinism rule: loaders iterate objects with `sortedEntries` / `sortedKeys` (never bare
 * `Object.entries` on a keyed collection) and arrays in array order.
 */

/** Any JSON object from the raw data. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JsonObject = { [key: string]: any };

const INT_RE = /^-?\d+$/;

/**
 * Compare object keys: integer-like keys numerically, before any non-integer keys,
 * which are compared by code point (locale independent).
 */
export function compareKeys(a: string, b: string): number {
  const ai = INT_RE.test(a);
  const bi = INT_RE.test(b);
  if (ai && bi) return Number(a) - Number(b);
  if (ai) return -1;
  if (bi) return 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Keys of an object in deterministic order (see compareKeys). */
export function sortedKeys(obj: object | null | undefined): string[] {
  if (!obj) return [];
  return Object.keys(obj).sort(compareKeys);
}

/** Entries of an object in deterministic order (see compareKeys). */
export function sortedEntries<T>(obj: Record<string, T> | null | undefined): [string, T][] {
  if (!obj) return [];
  return sortedKeys(obj).map((k) => [k, obj[k] as T]);
}

/** Normalize LE Tools 0/1 numbers and true/false booleans to 0/1 (null stays null). */
export function bool(v: unknown): 0 | 1 | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "number") return v !== 0 ? 1 : 0;
  if (typeof v === "string") return v === "" || v === "0" || v === "false" ? 0 : 1;
  return 1;
}

/** A finite number, or null (parses numeric strings such as `as: "1.2"`). */
export function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/** An integer, or null. */
export function int(v: unknown): number | null {
  const n = num(v);
  return n === null ? null : Math.trunc(n);
}

/** Empty strings become null; other values are returned as strings. */
export function str(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v);
  return s === "" ? null : s;
}

/**
 * Serialize a record for a `raw_json` column. `omit` drops child collections that have their
 * own table (e.g. `subItems` of a base type). Key order follows the source (deterministic).
 */
export function rawJson(obj: unknown, omit: readonly string[] = []): string {
  if (omit.length && obj && typeof obj === "object" && !Array.isArray(obj)) {
    const copy: JsonObject = {};
    for (const [k, v] of Object.entries(obj as JsonObject)) if (!omit.includes(k)) copy[k] = v;
    return JSON.stringify(copy);
  }
  return JSON.stringify(obj ?? null);
}

/**
 * Remove float32 noise (e.g. 0.29000002 -> 0.29) by rounding non-integers to 7 significant
 * digits (float32 carries ~7.2). Integers and null pass through.
 */
export function cleanFloat(v: number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  if (!Number.isFinite(v)) return v;
  if (Number.isInteger(v)) return v;
  return Number(v.toPrecision(7));
}

/** Damage array slot names (enums.md section 1). Index order of every `damage[]` array. */
export const DAMAGE_TYPES = ["Physical", "Fire", "Cold", "Lightning", "Necrotic", "Void", "Poison"] as const;

/** Class names by classID (enums.md section 9). */
export const CLASS_NAMES = ["Primalist", "Mage", "Sentinel", "Acolyte", "Rogue"] as const;

/** Decode a sub type `classRequirement` (bit 1<<classID) to a comma list, null for 0. */
export function classRequirementNames(mask: number | null | undefined): string | null {
  if (!mask) return null;
  const names = CLASS_NAMES.filter((_, i) => Math.floor(mask / 2 ** i) % 2 === 1);
  return names.length ? names.join(",") : null;
}

/** Decode an affix `classSpecificity` (bit 1<<(classID+1); bit 0 = Weaver) to a comma list, null for 0. */
export function classSpecificityNames(mask: number | null | undefined): string | null {
  if (!mask) return null;
  const names: string[] = [];
  if (mask % 2 === 1) names.push("Weaver");
  CLASS_NAMES.forEach((n, i) => {
    if (Math.floor(mask / 2 ** (i + 1)) % 2 === 1) names.push(n);
  });
  return names.length ? names.join(",") : null;
}

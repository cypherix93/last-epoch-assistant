/**
 * LE TOOLS vs MAXROLL CROSS-CHECK  (owner: world agent)
 * =============================================================================
 *
 * export function runCrosscheck(ctx: LoaderContext): CrosscheckResult
 *
 * Runs after all loaders and search (build-db.ts step 'crosscheck'). Compares the raw sources
 * directly (ctx.raw.letools vs ctx.raw.maxroll) and:
 *   1. inserts one maxroll_crosscheck row per observed difference (entity, entity_id, field,
 *      letools_value, maxroll_value, note), note classifying it:
 *        'float_noise'        |diff| < 1e-6 (float32 artefacts)               - not counted as a mismatch
 *        'escape'             equal after ICU unescape / whitespace trim        - not counted
 *        'expected_gap'       id exists in one source only and docs/data-sources/counts.md
 *                             documents it (ailment ids > 128, UNUSED 112/119) - not counted
 *        'missing_in_maxroll' / 'missing_in_letools'   record present in one source only
 *        'real'               different value
 *      null, undefined and "" are equal; booleans compare as 0/1.
 *   2. returns the summary. build-db.ts serialises the result into data/crosscheck-report.json
 *      (the result's toJSON gives {summary, mismatches[]}; sorted, no timestamps).
 *
 * Entities: unique (name, types, set, level requirement, every mod), affix (level, type, canRollOn,
 * stat lines, every tier roll min/max), ailment (name, tags, dealsDamage, base damage array), class
 * (base stats, class-ability levels).
 * Maxroll has no ailment duration, so duration cannot be compared (reported in `skippedFields`).
 *
 * When ctx.raw.maxroll is null, returns { mismatches: 0, skipped: true, byEntity: {} } and inserts nothing.
 */
import type { LoaderContext } from "./lib/context.js";
import { unescapeIcu } from "./lib/raw.js";
import { insertRow } from "./lib/sqlite.js";
import { sortedEntries, type JsonObject } from "./lib/util.js";

type Obj = JsonObject;

export type CrosscheckNote = "float_noise" | "escape" | "expected_gap" | "missing_in_maxroll" | "missing_in_letools" | "real";

export interface CrosscheckRow {
  entity: string;
  id: string;
  field: string;
  letools: unknown;
  maxroll: unknown;
  note: CrosscheckNote;
}

export interface EntitySummary {
  /** Records present in both sources and compared. */
  compared: number;
  /** Individual field comparisons made. */
  fields: number;
  /** Counted mismatches (everything except float_noise, escape and expected_gap). */
  mismatches: number;
  byNote: Record<string, number>;
}

export interface CrosscheckResult {
  /** Total mismatch rows (excluding notes 'float_noise', 'escape' and 'expected_gap'). */
  mismatches: number;
  /** True when Maxroll data was absent. */
  skipped: boolean;
  /** Per entity: { compared, fields, mismatches, byNote }. */
  byEntity: Record<string, EntitySummary>;
  /** Fields that exist in only one source and are therefore not compared. */
  skippedFields?: string[];
  /** All observed differences in comparison order. */
  rows?: CrosscheckRow[];
  /** Shape written to data/crosscheck-report.json. */
  toJSON(): unknown;
}

const NOT_COUNTED: ReadonlySet<string> = new Set(["float_noise", "escape", "expected_gap"]);
const EPS = 1e-6;

/** Normalise a scalar for comparison: null/undefined/"" -> null, booleans -> 0/1. */
function norm(v: unknown): unknown {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v === "boolean") return v ? 1 : 0;
  return v;
}

type Cmp = "equal" | "float_noise" | "escape" | "diff";

function compareScalar(a: unknown, b: unknown): Cmp {
  const x = norm(a);
  const y = norm(b);
  if (x === y) return "equal";
  if (typeof x === "number" && typeof y === "number") return Math.abs(x - y) < EPS ? "float_noise" : "diff";
  if (typeof x === "string" && typeof y === "string") {
    return unescapeIcu(x).trim() === unescapeIcu(y).trim() ? "escape" : "diff";
  }
  return "diff";
}

class Checker {
  readonly rows: CrosscheckRow[] = [];
  readonly byEntity: Record<string, EntitySummary> = {};

  constructor(private readonly ctx: LoaderContext) {}

  private summary(entity: string): EntitySummary {
    return (this.byEntity[entity] ??= { compared: 0, fields: 0, mismatches: 0, byNote: {} });
  }

  private record(entity: string, id: string | number, field: string, a: unknown, b: unknown, note: CrosscheckNote): void {
    const s = this.summary(entity);
    s.byNote[note] = (s.byNote[note] ?? 0) + 1;
    if (!NOT_COUNTED.has(note)) s.mismatches++;
    this.rows.push({ entity, id: String(id), field, letools: a ?? null, maxroll: b ?? null, note });
    insertRow(this.ctx.db, "maxroll_crosscheck", {
      entity,
      entity_id: String(id),
      field,
      letools_value: a === undefined ? null : JSON.stringify(a),
      maxroll_value: b === undefined ? null : JSON.stringify(b),
      note,
    });
  }

  /** Compare one field. */
  field(entity: string, id: string | number, field: string, a: unknown, b: unknown): void {
    this.summary(entity).fields++;
    const r = compareScalar(a, b);
    if (r === "equal") return;
    this.record(entity, id, field, a, b, r === "diff" ? "real" : r);
  }

  /** Compare two arrays of scalars element by element. */
  array(entity: string, id: string | number, field: string, a: unknown[] | undefined, b: unknown[] | undefined): void {
    const x = a ?? [];
    const y = b ?? [];
    this.field(entity, id, `${field}.length`, x.length, y.length);
    for (let i = 0; i < Math.min(x.length, y.length); i++) this.field(entity, id, `${field}[${i}]`, x[i], y[i]);
  }

  missing(entity: string, id: string | number, where: "maxroll" | "letools", present: unknown, expectedGap = false): void {
    const note: CrosscheckNote = expectedGap ? "expected_gap" : where === "maxroll" ? "missing_in_maxroll" : "missing_in_letools";
    this.record(entity, id, "record", where === "maxroll" ? present : null, where === "maxroll" ? null : present, note);
  }

  compared(entity: string): void {
    this.summary(entity).compared++;
  }

  ensure(entity: string): void {
    this.summary(entity);
  }
}

const byId = <T extends Obj>(list: T[], key: string): Map<number, T> => {
  const m = new Map<number, T>();
  for (const r of list) if (!m.has(r[key] as number)) m.set(r[key] as number, r);
  return m;
};

const sortedIds = (...maps: Map<number, unknown>[]): number[] => [...new Set(maps.flatMap((m) => [...m.keys()]))].sort((a, b) => a - b);

// ---------------------------------------------------------------------------------------------
// uniques
// ---------------------------------------------------------------------------------------------
function checkUniques(c: Checker, ctx: LoaderContext, mr: { uniques: Obj[] }): void {
  const E = "unique";
  c.ensure(E);
  const lt = new Map<number, Obj>();
  for (const [, u] of sortedEntries(ctx.raw.letools.itemDB.uniqueList.uniques)) lt.set(u.uniqueId, u);
  const mx = byId(mr.uniques, "uniqueID");
  for (const id of sortedIds(lt, mx)) {
    const l = lt.get(id);
    const m = mx.get(id);
    if (!l) {
      c.missing(E, id, "letools", m!.name);
      continue;
    }
    if (!m) {
      c.missing(E, id, "maxroll", ctx.t(l.displayNameKey));
      continue;
    }
    c.compared(E);
    // Maxroll `name` is an editor-internal name (apostrophes stripped, working titles); `displayName` is the shown one when set.
    c.field(E, id, "name", ctx.t(l.displayNameKey), norm(m.displayName) !== null ? m.displayName : m.name);
    c.field(E, id, "baseType", l.baseTypeId, m.baseType);
    c.array(E, id, "subTypes", l.subTypeIds, m.subTypes);
    c.field(E, id, "isSetItem", l.isSetItem, m.isSetItem);
    c.field(E, id, "setId", l.setId, m.setID);
    c.field(E, id, "levelRequirement", l.levelRequirement, m.levelRequirement);
    c.field(E, id, "overrideLevelRequirement", l.overrideLevelRequirement, m.overrideLevelRequirement);
    const lm: Obj[] = l.mods ?? [];
    const mm: Obj[] = m.mods ?? [];
    c.field(E, id, "mods.length", lm.length, mm.length);
    for (let i = 0; i < Math.min(lm.length, mm.length); i++) {
      const a = lm[i]!;
      const b = mm[i]!;
      for (const f of ["property", "specialTag", "tags", "extraTag", "type", "value", "maxValue", "hideInTooltip", "canRoll"]) {
        c.field(E, id, `mods[${i}].${f}`, a[f], b[f]);
      }
      c.field(E, id, `mods[${i}].rollId`, a.rollId, b.rollID);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// affixes
// ---------------------------------------------------------------------------------------------
function checkAffixes(c: Checker, ctx: LoaderContext, mr: { affixes: Obj[] }): void {
  const E = "affix";
  c.ensure(E);
  const lt = new Map<number, Obj>();
  const al = ctx.raw.letools.itemDB.affixList;
  for (const [, a] of sortedEntries(al.singleAffixes)) lt.set(a.affixId, a);
  for (const [, a] of sortedEntries(al.multiAffixes)) lt.set(a.affixId, a);
  const mx = byId(mr.affixes, "affixId");
  for (const id of sortedIds(lt, mx)) {
    const l = lt.get(id);
    const m = mx.get(id);
    if (!l) {
      c.missing(E, id, "letools", m!.affixName);
      continue;
    }
    if (!m) {
      c.missing(E, id, "maxroll", ctx.t(l.affixDisplayNameKey));
      continue;
    }
    c.compared(E);
    c.field(E, id, "levelRequirement", l.levelRequirement, m.levelRequirement);
    c.field(E, id, "type", l.type, m.type);
    c.field(E, id, "classSpecificity", l.classSpecificity, m.classSpecificity);
    c.array(E, id, "canRollOn", l.canRollOn, m.canRollOn);

    // Stat lines: Maxroll single-stat affixes inline the line, multi-stat ones carry affixProperties[].
    const lp: Obj[] = l.affixProperties ?? [];
    const mp: Obj[] = m.affixProperties ?? [m];
    c.field(E, id, "properties.length", lp.length, mp.length);
    for (let i = 0; i < Math.min(lp.length, mp.length); i++) {
      for (const f of ["property", "specialTag", "tags", "extraTag", "modifierType"]) c.field(E, id, `properties[${i}].${f}`, lp[i]![f], mp[i]![f]);
    }

    // Tiers: LE rolls[] = [primary, ...extra]; Maxroll {minRoll, maxRoll, extraRolls[]}.
    const lti: Obj[] = l.tiers ?? [];
    const mti: Obj[] = m.tiers ?? [];
    c.field(E, id, "tiers.length", lti.length, mti.length);
    for (let t = 0; t < Math.min(lti.length, mti.length); t++) {
      const lr: Obj[] = lti[t]!.rolls ?? [];
      const mrolls: Obj[] = [{ minRoll: mti[t]!.minRoll, maxRoll: mti[t]!.maxRoll }, ...((mti[t]!.extraRolls as Obj[] | undefined) ?? [])];
      c.field(E, id, `tiers[${t}].rolls.length`, lr.length, mrolls.length);
      for (let r = 0; r < Math.min(lr.length, mrolls.length); r++) {
        c.field(E, id, `tiers[${t}].rolls[${r}].min`, lr[r]!.min, mrolls[r]!.minRoll);
        c.field(E, id, `tiers[${t}].rolls[${r}].max`, lr[r]!.max, mrolls[r]!.maxRoll);
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------
// ailments
// ---------------------------------------------------------------------------------------------
function checkAilments(c: Checker, ctx: LoaderContext, mr: { ailments: Obj[] }): void {
  const E = "ailment";
  c.ensure(E);
  const lt = new Map<number, Obj>();
  for (const [, a] of sortedEntries(ctx.raw.letools.LEAbilities.ailmentList)) lt.set(a.id, a);
  // Maxroll fills the UNUSED slots (112, 119) with copies of Ignite (id 1); first occurrence wins.
  const mx = byId(mr.ailments, "id");
  const unusedSlots = new Set([112, 119]);
  const maxMr = Math.max(...mx.keys());
  for (const id of sortedIds(lt, mx)) {
    const l = lt.get(id);
    const m = mx.get(id);
    if (!l) {
      c.missing(E, id, "letools", m!.displayName, unusedSlots.has(id));
      continue;
    }
    if (!m) {
      c.missing(E, id, "maxroll", l.displayName, id > maxMr);
      continue;
    }
    c.compared(E);
    c.field(E, id, "name", l.displayName, m.displayName);
    c.field(E, id, "tags", l.tags, m.tags);
    c.field(E, id, "dealsDamage", l.dealsDamage, m.dealsDamage);
    c.field(E, id, "applyPrefix", l.applyPrefix, m.applyPrefix);
    c.field(E, id, "effectOfIncreasedEffectiveness", l.effectOfIncreasedEffectiveness, m.effectOfIncreasedEffectiveness);
    c.field(E, id, "additionalPenetrationDamageType", l.additionalPenetrationDamageType, m.additionalPenetrationDamageType);
    c.array(E, id, "baseDamage.damage", l.baseDamage?.damage, m.baseDamage?.damage);
  }
}

// ---------------------------------------------------------------------------------------------
// classes
// ---------------------------------------------------------------------------------------------
const CLASS_FIELDS = [
  "treeID", "baseHealth", "baseMana", "healthPerLevel", "manaPerLevel", "healthRegen", "manaRegen", "healthRegenPerLevel",
  "baseStrength", "baseVitality", "baseIntelligence", "baseDexterity", "baseAttunement", "firstLevelForMinionScaling",
  "moreMinionDamagePerLevel", "lessMinionDamageTakenPerLevel", "baseStunAvoidance", "baseEndurance", "baseEnduranceThreshold",
  "enduranceThresholdPerLevel",
] as const;

function checkClasses(c: Checker, ctx: LoaderContext, mr: { classes: Obj[] }): void {
  const E = "class";
  c.ensure(E);
  const lt = new Map<number, Obj>();
  for (const t of ctx.raw.letools.LECharTrees.trees) {
    const cc = t.characterTree.characterClass as Obj;
    lt.set(cc.classID, cc);
  }
  const mx = byId(mr.classes, "classID");
  for (const id of sortedIds(lt, mx)) {
    const l = lt.get(id);
    const m = mx.get(id);
    if (!l) {
      c.missing(E, id, "letools", m!.className);
      continue;
    }
    if (!m) {
      c.missing(E, id, "maxroll", ctx.t(l.classNameKey));
      continue;
    }
    c.compared(E);
    c.field(E, id, "name", ctx.t(l.classNameKey), m.className);
    for (const f of CLASS_FIELDS) c.field(E, id, f, l[f], m[f]);
    const lu: Obj[] = l.unlockableAbilities ?? [];
    const mu: Obj[] = m.unlockableAbilities ?? [];
    c.array(E, id, "unlockableAbilities.level", lu.map((x) => x.level), mu.map((x) => x.level));
    const lms: Obj[] = l.masteries ?? [];
    const mms: Obj[] = m.masteries ?? [];
    c.field(E, id, "masteries.length", lms.length, mms.length);
    for (let i = 0; i < Math.min(lms.length, mms.length); i++) {
      const la: Obj[] = lms[i]!.abilities ?? [];
      const ma: Obj[] = mms[i]!.abilities ?? [];
      c.array(E, id, `masteries[${i}].abilities.level`, la.map((x) => x.level), ma.map((x) => x.level));
    }
  }
}

export function runCrosscheck(ctx: LoaderContext): CrosscheckResult {
  const mr = ctx.raw.maxroll;
  if (!mr) {
    ctx.log.info("crosscheck: Maxroll data absent, skipped");
    return { mismatches: 0, skipped: true, byEntity: {}, toJSON: () => ({ summary: {}, mismatches: [] }) };
  }
  const c = new Checker(ctx);
  checkUniques(c, ctx, mr as { uniques: Obj[] });
  checkAffixes(c, ctx, mr as { affixes: Obj[] });
  checkAilments(c, ctx, mr as { ailments: Obj[] });
  checkClasses(c, ctx, mr as { classes: Obj[] });

  const mismatches = Object.values(c.byEntity).reduce((n, s) => n + s.mismatches, 0);
  const skippedFields = ["ailment.duration (Maxroll ailment records have no duration)"];
  const rows = c.rows;
  ctx.log.info(`crosscheck: ${mismatches} mismatches`);
  const result: CrosscheckResult = {
    mismatches,
    skipped: false,
    byEntity: c.byEntity,
    skippedFields,
    rows,
    toJSON() {
      return {
        summary: Object.fromEntries(
          Object.entries(c.byEntity)
            .sort(([a], [b]) => (a < b ? -1 : 1))
            .map(([k, s]) => [k, { compared: s.compared, mismatches: s.mismatches, fields: s.fields, byNote: s.byNote }]),
        ),
        skippedFields,
        mismatches: rows.map((r) => ({
          kind: r.entity,
          id: r.id,
          field: r.field,
          letools: r.letools,
          maxroll: r.maxroll,
          note: r.note,
        })),
      };
    },
  };
  return result;
}

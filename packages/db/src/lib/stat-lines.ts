/**
 * The `mods` table writer: every stat line of every source goes through insertMod() /
 * insertStatBlock(), which validate the line, resolve property and tag names and keep the
 * row layout identical across loaders.
 *
 * Stat model (docs/data-sources/enums.md, knowledge/mechanics/stat-model.md):
 *   modifier = { property (SP id), specialTag, tags (AT mask), extraTag (ability-bound),
 *                modifierType (0 added, 1 increased, 2 more), value | [min, max] }
 *
 *   const namer = new StatNamer(raw);
 *   insertMod(db, { sourceKind: "unique_mod", sourceId: 0, sourceOrd: 1, property: 1, tags: 8,
 *                   specialTag: 1, modifierType: 0, valueMin: 1, valueMax: 1.5, raw: mod }, namer);
 *   insertStatBlock(db, { sourceKind: "ailment_buff", sourceId: 3, sourceOrd: 0, raw: buff }, buff, namer);
 */
import type Database from "better-sqlite3";
import type { RawData, RawStatBlock } from "./raw.js";
import type { DB } from "./sqlite.js";
import { cleanFloat } from "./util.js";

/** Allowed `mods.source_kind` values (see schema.sql, "THE MODS TABLE"). */
export const SOURCE_KINDS = [
  "affix_tier",
  "implicit",
  "blessing",
  "idol_altar",
  "unique_mod",
  "set_bonus",
  "skill_node",
  "passive_node",
  "weaver_node",
  "ailment_buff",
  "ability_attribute_scaling",
  "ability_level_scaling",
  "ability_component",
  "monster_mod",
  "attribute",
  "attribute_corrupted",
] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

/** 0 added (flat), 1 increased (additive %), 2 more (multiplicative). */
export type ModifierType = 0 | 1 | 2;
export const MODIFIER_NAMES: Record<ModifierType, string> = { 0: "added", 1: "increased", 2: "more" };

/** Stat property ids whose `tags` is an index into a secondary list, not an AT mask. */
export const INDIRECT_PROPERTIES = {
  abilityProperty: 58,
  levelOfSkills: 88,
  playerProperty: 98,
  increasedDropRate: 104,
  increasedExperience: 105,
  idolAltarProperty: 130,
} as const;

/**
 * True when `tags` of a line is an index rather than an AT bitmask:
 * 58 AbilityProperty (ability index), 98 PlayerProperty (playerPropertyList index),
 * 130 IdolAltarProperty (idolAltarPropertyList index), 104 IncreasedDropRate and 105 IncreasedExperience (drop category:
 * with specialTag 0 `tags` is an item BASE TYPE id, e.g. 1 = Body Armor, 33 = Adorned Idol; specialTags 1-4 select other
 * drop categories whose tags values are not decoded; never an AT mask), and 88 LevelOfSkills with specialTag 1
 * (single-skill level: tags = ability index; with specialTag 0 tags is an AT mask, e.g. 32 = Necrotic skills).
 */
export function isIndirectTags(property: number | null | undefined, specialTag = 0): boolean {
  if (property === 58 || property === 98 || property === 104 || property === 105 || property === 130) return true;
  return property === 88 && specialTag === 1;
}

/** Thrown by insertMod() for an invalid line. */
export class ModValidationError extends Error {
  constructor(message: string, readonly mod: unknown) {
    super(message);
    this.name = "ModValidationError";
  }
}

/** Decode an AT bitmask to a comma list of AT names (lowest bit first), null for 0. Unknown bits become 'bit<n>'. */
export function describeTags(bits: number | null | undefined, at: Record<string, number>): string | null {
  if (!bits) return null;
  const names: string[] = [];
  let rest = bits;
  const entries = Object.entries(at)
    .filter(([, v]) => v > 0)
    .sort((a, b) => a[1] - b[1]);
  for (const [name, v] of entries) {
    if (Math.floor(bits / v) % 2 === 1) {
      names.push(name);
      rest -= v;
    }
  }
  for (let b = 0; rest > 0 && b < 53; b++) {
    const v = 2 ** b;
    if (Math.floor(rest / v) % 2 === 1) {
      names.push(`bit${b}`);
      rest -= v;
    }
  }
  return names.length ? names.join(",") : null;
}

/**
 * Parse a display-only value (tree node `stats[].value`) into a number in the same convention as
 * the numeric sources: percentages become fractions ('+25%' -> 0.25, '-10%' -> -0.1), plain
 * numbers stay ('24' -> 24, '+1' -> 1). Returns null for anything that is not a single number
 * (ranges, text, 'x2', empty).
 */
export function parseDisplayValue(s: string | null | undefined): number | null {
  if (s === null || s === undefined) return null;
  const m = /^\s*([+-]?)(\d+(?:\.\d+)?)\s*(%?)\s*$/.exec(s);
  if (!m) return null;
  let v = Number(m[2]);
  if (m[1] === "-") v = -v;
  if (m[3] === "%") v = v / 100;
  return cleanFloat(v);
}

/** Resolves property and tag names from the raw globals (AT, SP, LocalSP, coreDB, LEAbilities, i18n). */
export class StatNamer {
  private at?: Record<string, number>;
  private spNames?: Map<number, string>;
  private propKeys?: Map<number, string | null>;
  private abilityProps?: Map<number, (string | null)[]>;
  private abilityNameByIndex?: Map<number, string | null>;

  constructor(private readonly raw: RawData) {}

  /** The AT global. */
  get tagBits(): Record<string, number> {
    return (this.at ??= this.raw.letools.AT);
  }

  /** describeTags() over the AT global. */
  describeTags(bits: number | null | undefined): string | null {
    return describeTags(bits, this.tagBits);
  }

  /** SP / LocalSP enum name of a property id ('Damage', 'PlayerProperty', 'NoDodge'), or null. */
  enumName(property: number | null | undefined): string | null {
    if (property === null || property === undefined) return null;
    if (!this.spNames) {
      this.spNames = new Map();
      for (const g of ["SP", "LocalSP"] as const) {
        for (const [name, v] of Object.entries(this.raw.letools[g])) if (!this.spNames.has(v)) this.spNames.set(v, name);
      }
    }
    return this.spNames.get(property) ?? null;
  }

  /**
   * English display name of a property id from coreDB.propertyList (e.g. 0 -> 'Damage'),
   * falling back to the SP enum name; null for skill-local ids (5000+).
   */
  propertyName(property: number | null | undefined): string | null {
    if (property === null || property === undefined) return null;
    if (!this.propKeys) {
      this.propKeys = new Map();
      for (const p of this.raw.letools.coreDB.propertyList) this.propKeys.set(p.property, p.propertyNameKey);
    }
    const key = this.propKeys.get(property);
    return (key ? this.raw.t(key) : null) ?? this.enumName(property);
  }

  /**
   * Name of the stat a line actually grants, resolving indirect properties:
   *   98 -> player property name, 130 -> idol altar property name, 58 -> ability property name,
   *   88 (specialTag 1) -> 'Level of <ability>'; otherwise propertyName(property).
   */
  lineName(property: number | null | undefined, tags = 0, specialTag = 0): string | null {
    if (property === null || property === undefined) return null;
    const core = this.raw.letools.coreDB;
    if (property === 98) {
      return this.raw.t(core.playerPropertyList[tags]?.propertyNameKey) ?? this.propertyName(property);
    }
    if (property === 130) {
      return this.raw.t(core.idolAltarPropertyList.list[tags]?.propertyNameKey) ?? this.propertyName(property);
    }
    if (property === 58) {
      if (!this.abilityProps) {
        this.abilityProps = new Map();
        for (const a of core.abilityPropertyList) this.abilityProps.set(a.abilityID, a.properties.map((p) => p.propertyNameKey));
      }
      return this.raw.t(this.abilityProps.get(tags)?.[specialTag] ?? null) ?? this.propertyName(property);
    }
    if (property === 88 && specialTag === 1) {
      const ab = this.abilityName(tags);
      return ab ? `Level of ${ab}` : this.propertyName(property);
    }
    return this.propertyName(property);
  }

  /** English name of the ability with LEAbilities `index` == abilityIndex, or null. */
  abilityName(abilityIndex: number): string | null {
    if (!this.abilityNameByIndex) {
      this.abilityNameByIndex = new Map();
      const list = this.raw.letools.LEAbilities.abilityList;
      for (const id of Object.keys(list).sort()) {
        const a = list[id]!;
        if (a.index === null || a.index === undefined || this.abilityNameByIndex.has(a.index)) continue;
        this.abilityNameByIndex.set(a.index, this.raw.t(a.nameKey) ?? a.name ?? null);
      }
    }
    return this.abilityNameByIndex.get(abilityIndex) ?? null;
  }
}

/** One stat line to insert into `mods`. */
export interface ModInput {
  sourceKind: SourceKind;
  /** Owning record key (numbers are converted to text). */
  sourceId: string | number;
  /** Line order within the owner (>= 0). */
  sourceOrd: number;
  /** Component index for expanded stat blocks (default 0). */
  subOrd?: number;
  /** Affix tier, 1-based (affix_tier only). */
  tier?: number | null;
  property?: number | null;
  specialTag?: number | null;
  tags?: number | null;
  extraTag?: number | null;
  /** 0 added, 1 increased, 2 more; null/undefined for display-only lines. */
  modifierType?: number | null;
  /** Fixed value (sets value_min = value_max). Mutually exclusive with valueMin/valueMax. */
  value?: number | null;
  valueMin?: number | null;
  valueMax?: number | null;
  display?: string | null;
  label?: string | null;
  labelKey?: string | null;
  context?: string | null;
  setRequirement?: number | null;
  hidden?: boolean | number | null;
  isDownside?: boolean | number | null;
  /** Override the resolved property name (default: StatNamer.lineName). */
  propertyName?: string | null;
  /** The source stat line object (stored as raw_json). Required. */
  raw: unknown;
}

const isInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v);
const optFinite = (v: unknown): boolean => v === null || v === undefined || (typeof v === "number" && Number.isFinite(v));

/** Validate a ModInput; throws ModValidationError. Exported for tests. */
export function validateMod(m: ModInput): void {
  const fail = (msg: string): never => {
    throw new ModValidationError(`invalid mod (${String(m?.sourceKind)}:${String(m?.sourceId)}#${String(m?.sourceOrd)}): ${msg}`, m);
  };
  if (!m || typeof m !== "object") fail("not an object");
  if (!(SOURCE_KINDS as readonly string[]).includes(m.sourceKind)) fail(`unknown source_kind '${m.sourceKind}'`);
  if (m.sourceId === null || m.sourceId === undefined || String(m.sourceId) === "") fail("empty source_id");
  if (typeof m.sourceId === "number" && !Number.isFinite(m.sourceId)) fail("non-finite source_id");
  if (!isInt(m.sourceOrd) || m.sourceOrd < 0) fail(`source_ord must be an integer >= 0, got ${String(m.sourceOrd)}`);
  if (m.subOrd !== undefined && (!isInt(m.subOrd) || m.subOrd < 0)) fail(`sub_ord must be an integer >= 0`);
  if (m.tier !== undefined && m.tier !== null && (!isInt(m.tier) || m.tier < 1)) fail(`tier must be a 1-based integer`);
  if ((m.tier ?? null) !== null && m.sourceKind !== "affix_tier") fail(`tier is only valid for affix_tier`);
  if (m.sourceKind === "affix_tier" && (m.tier ?? null) === null) fail(`affix_tier requires tier`);
  if (m.property !== undefined && m.property !== null && (!isInt(m.property) || m.property < 0)) fail(`property must be an integer >= 0`);
  for (const k of ["specialTag", "tags", "extraTag"] as const) {
    const v = m[k];
    if (v !== undefined && v !== null && !isInt(v)) fail(`${k} must be an integer`);
  }
  if (m.tags !== undefined && m.tags !== null && m.tags < 0) fail(`tags must be >= 0`);
  if (m.modifierType !== undefined && m.modifierType !== null && !(m.modifierType === 0 || m.modifierType === 1 || m.modifierType === 2)) {
    fail(`modifier_type must be 0, 1, 2 or null, got ${String(m.modifierType)}`);
  }
  if (!optFinite(m.value) || !optFinite(m.valueMin) || !optFinite(m.valueMax)) fail("values must be finite numbers or null");
  if ((m.value ?? null) !== null && ((m.valueMin ?? null) !== null || (m.valueMax ?? null) !== null)) {
    fail("give either value or valueMin/valueMax, not both");
  }
  if (m.raw === undefined) fail("raw (the source line) is required");
}

const insertSql = `INSERT INTO mods (source_kind, source_id, source_ord, sub_ord, tier, property, property_name,
  special_tag, tags, tag_names, extra_tag, modifier_type, value_min, value_max, display, label, label_key,
  context, set_requirement, hidden, is_downside, raw_json)
  VALUES (@source_kind, @source_id, @source_ord, @sub_ord, @tier, @property, @property_name,
  @special_tag, @tags, @tag_names, @extra_tag, @modifier_type, @value_min, @value_max, @display, @label, @label_key,
  @context, @set_requirement, @hidden, @is_downside, @raw_json)`;
const stmts = new WeakMap<DB, Database.Statement>();

const flag = (v: boolean | number | null | undefined) => (v ? 1 : 0);

/**
 * Validate and insert one stat line into `mods`. Values are float-cleaned (cleanFloat),
 * `value` fills both min and max, a lone valueMin/valueMax is mirrored to the other.
 * Returns the new row id.
 */
export function insertMod(db: DB, m: ModInput, namer: StatNamer): number {
  validateMod(m);
  let stmt = stmts.get(db);
  if (!stmt) stmts.set(db, (stmt = db.prepare(insertSql)));
  const property = m.property ?? null;
  const tags = m.tags ?? 0;
  const specialTag = m.specialTag ?? 0;
  let vmin = cleanFloat(m.value ?? m.valueMin ?? null);
  let vmax = cleanFloat(m.value ?? m.valueMax ?? null);
  if (vmin === null && vmax !== null) vmin = vmax;
  if (vmax === null && vmin !== null) vmax = vmin;
  const indirect = isIndirectTags(property, specialTag);
  const info = stmt.run({
    source_kind: m.sourceKind,
    source_id: String(m.sourceId),
    source_ord: m.sourceOrd,
    sub_ord: m.subOrd ?? 0,
    tier: m.tier ?? null,
    property,
    property_name: m.propertyName !== undefined ? m.propertyName : namer.lineName(property, tags, specialTag),
    special_tag: specialTag,
    tags,
    tag_names: indirect ? null : namer.describeTags(tags),
    extra_tag: m.extraTag ?? 0,
    modifier_type: m.modifierType ?? null,
    value_min: vmin,
    value_max: vmax,
    display: m.display ?? null,
    label: m.label ?? null,
    label_key: m.labelKey ?? null,
    context: m.context ?? null,
    set_requirement: m.setRequirement ?? null,
    hidden: flag(m.hidden),
    is_downside: flag(m.isDownside),
    raw_json: JSON.stringify(m.raw ?? null),
  });
  return Number(info.lastInsertRowid);
}

/** The fields of a ModInput that insertStatBlock derives from the block itself. */
export type StatBlockBase = Omit<ModInput, "subOrd" | "property" | "specialTag" | "tags" | "extraTag" | "modifierType" | "value" | "valueMin" | "valueMax" | "raw"> & {
  raw?: unknown;
};

/**
 * Insert a stat block `{property, specialTag, tags, extraTag?, addedValue, increasedValue, moreValues[]}`
 * as one row per non-zero component, numbered by sub_ord in this order:
 *   addedValue != 0      -> modifier_type 0
 *   increasedValue != 0  -> modifier_type 1
 *   each moreValues[i]   -> modifier_type 2
 * A block with no non-zero component still yields one row (modifier_type 0, value 0) so no line is lost.
 * Returns the number of rows inserted.
 */
export function insertStatBlock(db: DB, base: StatBlockBase, block: RawStatBlock, namer: StatNamer): number {
  const parts: { type: ModifierType; value: number }[] = [];
  if (block.addedValue) parts.push({ type: 0, value: block.addedValue });
  if (block.increasedValue) parts.push({ type: 1, value: block.increasedValue });
  for (const v of block.moreValues ?? []) parts.push({ type: 2, value: v });
  if (!parts.length) parts.push({ type: 0, value: 0 });
  parts.forEach((p, i) =>
    insertMod(
      db,
      {
        ...base,
        subOrd: i,
        property: block.property,
        specialTag: block.specialTag ?? 0,
        tags: block.tags ?? 0,
        extraTag: block.extraTag ?? 0,
        modifierType: p.type,
        value: p.value,
        raw: base.raw ?? block,
      },
      namer,
    ),
  );
  return parts.length;
}

/** insertMod / insertStatBlock bound to one db + namer (exposed to loaders as ctx.mods). */
export class ModWriter {
  constructor(
    readonly db: DB,
    readonly namer: StatNamer,
  ) {}
  insert(m: ModInput): number {
    return insertMod(this.db, m, this.namer);
  }
  insertStatBlock(base: StatBlockBase, block: RawStatBlock): number {
    return insertStatBlock(this.db, base, block, this.namer);
  }
  describeTags(bits: number | null | undefined): string | null {
    return this.namer.describeTags(bits);
  }
  /** Resolved line name (indirect properties resolved), see StatNamer.lineName. */
  lineName(property: number | null | undefined, tags = 0, specialTag = 0): string | null {
    return this.namer.lineName(property, tags, specialTag);
  }
  /** coreDB.propertyList display name of a property id, see StatNamer.propertyName. */
  propertyName(property: number | null | undefined): string | null {
    return this.namer.propertyName(property);
  }
}

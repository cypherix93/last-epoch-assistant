/**
 * Typed-ish access to the raw game data of one version folder (data/raw/<version>/).
 *
 *   const raw = loadRaw("1.5.2");
 *   raw.letools.itemDB.affixList.singleAffixes["0"]   // lazily parsed on first access, then cached
 *   raw.i18n["Item_Names.Unique_Name_0"]              // verbatim (ICU escaped)
 *   raw.t("Item_Names.Unique_Name_0")                 // "Calamity" (ICU unescaped, null when missing/empty)
 *   raw.maxroll?.quests                                // Maxroll data.json (null when absent)
 *
 * The record interfaces below name the fields the loaders use; every record also allows any
 * other field (`JsonObject`), see docs/data-sources/letools.md for complete field tables.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { RAW_ROOT, versionDir } from "./paths.js";
import type { JsonObject } from "./util.js";

// ---------------------------------------------------------------------------
// ICU message unescaping and the i18n resolver
// ---------------------------------------------------------------------------

/**
 * Undo ICU MessageFormat apostrophe quoting as used by LE Tools en.json:
 *   `''`          -> `'`                    (doubled apostrophe = literal apostrophe)
 *   `'{'1'}'`     -> `{1}`                  (quoted syntax characters { } # |)
 *   `'{'/'}'`     -> `{/}`
 * A lone apostrophe that does not start a quoted section is kept literally.
 */
export function unescapeIcu(s: string): string {
  if (!s.includes("'")) return s;
  let out = "";
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c !== "'") {
      out += c;
      i++;
      continue;
    }
    const next = s[i + 1];
    if (next === "'") {
      out += "'";
      i += 2;
      continue;
    }
    if (next === "{" || next === "}" || next === "#" || next === "|") {
      // Quoted literal section: copy until the closing apostrophe ('' inside = literal ').
      let j = i + 1;
      let lit = "";
      while (j < s.length) {
        if (s[j] === "'") {
          if (s[j + 1] === "'") {
            lit += "'";
            j += 2;
            continue;
          }
          break;
        }
        lit += s[j];
        j++;
      }
      if (j >= s.length) {
        // Unterminated: ICU treats the rest as literal; keep the apostrophe out.
        out += lit;
        i = j;
      } else {
        out += lit;
        i = j + 1;
      }
      continue;
    }
    out += "'";
    i++;
  }
  return out;
}

/** Resolve an i18n key to English. Returns null for null/undefined/missing keys and empty strings. */
export type Translator = (key: string | null | undefined) => string | null;

/** Build a translator over a flat key -> text map. Results are memoized. */
export function makeTranslator(i18n: Record<string, string>): Translator {
  const cache = new Map<string, string | null>();
  return (key) => {
    if (key === null || key === undefined || key === "") return null;
    const hit = cache.get(key);
    if (hit !== undefined) return hit;
    const v = Object.prototype.hasOwnProperty.call(i18n, key) ? i18n[key] : undefined;
    const r = v === undefined || v === null || v === "" ? null : unescapeIcu(String(v));
    cache.set(key, r);
    return r;
  };
}

// ---------------------------------------------------------------------------
// Lockfile
// ---------------------------------------------------------------------------

export interface LetoolsFileLock {
  section: string;
  url: string;
  sha256: string;
  bytes: number;
  globals: string[];
}

/** data/raw/<version>/sources.lock.json (written by @le/fetch). */
export interface SourcesLock {
  fetchedAt: string;
  letools?: {
    versionFolder: string;
    plannerUrl: string;
    files: LetoolsFileLock[];
    i18n: { url: string; sha256: string; bytes: number };
  };
  maxroll?: {
    plannerJsUrl: string;
    dataHash: string;
    dataUrl: string;
    etag: string | null;
    lastModified: string | null;
    sha256: string;
    bytes: number;
  };
}

// ---------------------------------------------------------------------------
// Record shapes (partial; every interface also accepts unknown fields)
// ---------------------------------------------------------------------------

/** A stat line with a modifier type and a value range (affix, unique, implicit, set lines). */
export interface RawStatLine extends JsonObject {
  property: number;
  specialTag: number;
  tags: number;
  extraTag?: number;
}

/** A stat block `{property, specialTag, tags, addedValue, increasedValue, moreValues[]}` (ailment buffs, monster mods, scaling). */
export interface RawStatBlock extends JsonObject {
  property: number;
  specialTag?: number;
  tags?: number;
  extraTag?: number;
  addedValue?: number;
  increasedValue?: number;
  moreValues?: number[];
}

export interface RawImplicit extends RawStatLine {
  type: number;
  implicitValue: number;
  implicitMaxValue: number;
}

export interface RawSubType extends JsonObject {
  subTypeId: number;
  displayNameKey: string;
  descriptionKey?: string;
  levelRequirement: number;
  classRequirement?: number;
  implicits?: RawImplicit[];
  sprite?: string | null;
}

export interface RawBaseType extends JsonObject {
  baseTypeId?: number;
  displayNameKey: string;
  maxAffixes?: number;
  isWeapon?: number;
  size?: { x: number; y: number };
  subItems: Record<string, RawSubType>;
}

export interface RawAffixProperty extends RawStatLine {
  modDisplayNameKey: string;
  modifierType: number;
}

export interface RawAffix extends JsonObject {
  affixId: number;
  type: number;
  levelRequirement: number;
  canRollOn: number[];
  tiers: { tierName: string | null; requiredLevel: number; rolls: { min: number; max: number }[] }[];
  affixProperties: RawAffixProperty[];
  affixDisplayNameKey: string;
  affixTitleKey: string | null;
  specificRerollChances: { equipmentType: number; rerollChance: number; weighting: number }[];
}

export interface RawUniqueMod extends RawStatLine {
  value: number;
  maxValue: number;
  type: number;
  hideInTooltip?: number;
  canRoll?: number;
  rollId?: number;
}

export interface RawUnique extends JsonObject {
  uniqueId: number;
  baseTypeId: number;
  subTypeIds: number[];
  isSetItem: number;
  setId: number;
  displayNameKey: string;
  loreTextKey: string | null;
  mods: RawUniqueMod[];
  tooltipDescriptions: { descriptionKey: string; altText: string | null; setMod?: number; setRequirement?: number }[];
  tooltipEntries: { modDisplay: number }[];
}

export interface RawSetBonus extends JsonObject {
  setID: number;
  nameKey: string;
  setName: string | null;
  mods: (RawStatLine & { value: number; type: number; setRequirement: number; hideInTooltip?: number })[];
  tooltipDescriptions: { setMod: number; setRequirement: number; descriptionKey: string; altTextKey: string | null }[];
  tooltipEntries: { modDisplay: number }[];
}

export interface RawItemDB extends JsonObject {
  itemList: {
    disabledBaseTypesToRoll: number[];
    equippable: Record<string, RawBaseType>;
    nonEquippable: Record<string, RawBaseType>;
    lootFilterVisualCategories: { nameKey: string; categories: { nameKey: string; entries: number[] }[] }[];
  } & JsonObject;
  affixList: {
    displayCategoryKeys: string[];
    categoryHeaders: { categories: number[]; nameKey: string }[];
    singleAffixes: Record<string, RawAffix>;
    multiAffixes: Record<string, RawAffix>;
  };
  uniqueList: { uniques: Record<string, RawUnique> };
  setBonusList: RawSetBonus[];
  setNames: Record<string, string>;
  relModAbilities: Record<string, string[]>;
  relModAilments: Record<string, number[]>;
  relIncLevelAbilities: Record<string, string[]>;
  triggeredAbilities: Record<string, Record<string, number>>;
  triggeredAilments: Record<string, Record<string, number>>;
  relatedAbilities: Record<string, string[]>;
  sceneList: Record<string, { type: number; level: number; era: number; nameKey: string } & JsonObject>;
  altarGrids: { defaultGrid: number[][]; grids: number[][][] };
}

export interface RawPropertyDef extends JsonObject {
  property?: number;
  roundAddedToInt?: number;
  roundingForMore?: number;
  propertyNameKey: string | null;
  altTextKey: string | null;
}

export interface RawCoreDB extends JsonObject {
  propertyList: (RawPropertyDef & {
    property: number;
    altTextOverrides: { dontDisplayPlus: number; modType: number; specialTag: number; tags: number; altTextKey: string | null }[];
  })[];
  playerPropertyList: RawPropertyDef[];
  abilityPropertyList: { abilityID: number; properties: RawPropertyDef[] }[];
  idolAltarPropertyList: { defaultProperty: RawPropertyDef; list: RawPropertyDef[] };
  coreAttributes: Record<string, { attributeName: number; stats: RawStatBlock[]; corruptedStats?: RawStatBlock[] }>;
  conditionalDamagePropertyDescriptionKeys: string[];
  conditionalNonDamagePropertyDescriptionKeys: string[];
}

export interface RawAbility extends JsonObject {
  id: string;
  index: number | null;
  internalName: string | null;
  name: string | null;
  nameKey: string | null;
  descriptionKey: string | null;
  tags: number;
  attributeScaling: Record<string, RawStatBlock[]>;
  levelScaling: RawStatBlock[];
  prefab: { components: ({ type: string } & JsonObject)[] };
  comboAbilities: string[];
  sharedCooldownAbilities: string[];
}

export interface RawAilment extends JsonObject {
  id: number;
  internalName: string;
  displayName: string;
  displayNameKey: string;
  descriptionKey: string | null;
  baseDamage: { damage: number[] } & JsonObject;
  tags: number;
  buffs: RawStatBlock[];
}

export interface RawTreeNodeStat extends JsonObject {
  statNameKey: string;
  value: string | null;
  noScaling: boolean;
  downside: boolean;
  property: number;
  tags: number;
}

export interface RawTreeNode extends JsonObject {
  id: number;
  maxPoints: number;
  mastery: number;
  masteryRequirement: number;
  nodeNameKey: string;
  descriptionKey: string | null;
  stats: RawTreeNodeStat[];
  requirements: { nodeId: number; requirement: number }[];
  relatedAbilities: string[];
  relatedAilments: number[];
  triggeredAbilities: Record<string, number>;
  triggeredAilments: Record<string, number>;
}

export interface RawTree extends JsonObject {
  version: number;
  treeID: string;
  nodes: Record<string, RawTreeNode>;
  ability?: string;
}

export interface RawTreeUIChild extends JsonObject {
  rect: [number, number, number, number];
  icon?: string;
  nodeSize?: number;
  treeId?: string;
  nodeId?: number;
  children?: RawTreeUIChild[];
}

export interface RawLEAbilities extends JsonObject {
  abilityList: Record<string, RawAbility>;
  allAbilityIdList: (string | null)[];
  playerAbilityIdList: string[];
  ailmentList: Record<string, RawAilment>;
  entityList: Record<string, JsonObject>;
}

export interface RawMonsterMod extends JsonObject {
  modType: number;
  type: number;
  titleKey: string | null;
  descriptionKey: string | null;
  minilithDescriptionKey: string | null;
  stats?: RawStatBlock[];
}

export interface RawTimeline extends JsonObject {
  id: number;
  slug: string;
  nameKey: string;
  difficulties: ({
    level: number;
    firstSlotBlessings: number[];
    otherSlotBlessings: number[];
    anySlotBlessings: number[];
    modFromCorruption: string;
  } & JsonObject)[];
  mods: { mod: string; minimumDepth: number; hasMaximumDepth: boolean; maximumDepth: number }[];
  empoweredMods: { mod: string; minimumDepth: number; hasMaximumDepth: boolean; maximumDepth: number }[];
}

/** Every LE Tools global decoded by @le/fetch (one file each under letools/). */
export interface LetoolsGlobals {
  AT: Record<string, number>;
  AilmentID: Record<string, number>;
  BuffId: Record<string, number>;
  BuffPropId: Record<string, number>;
  CustomConditionType: Record<string, number>;
  LEAbilities: RawLEAbilities;
  LECharTrees: { trees: { ref?: string; characterTree: RawTree & { characterClass: JsonObject } }[] };
  LECharTreesUI: Record<string, { info: { passiveBonusKeys: string[]; classDescriptionKey: string }[]; nodes: RawTreeUIChild[] }>;
  LEHUD: JsonObject;
  LESkillTrees: Record<string, RawTree>;
  LESkillTreesUI: Record<string, RawTreeUIChild & { children: RawTreeUIChild[] }>;
  LETooltipIcons: JsonObject;
  LEWeaverTree: RawTree;
  LEWeaverTreeUI: { weaver: RawTreeUIChild & { children: RawTreeUIChild[] } };
  LocalSP: Record<string, number>;
  SP: Record<string, number>;
  UIBuffIds: Record<string, number>;
  UIBuffs: Record<string, JsonObject>;
  arenaData: Record<string, JsonObject>;
  checklist: JsonObject;
  coreDB: RawCoreDB;
  dropBossLoot: JsonObject[];
  dungeonData: Record<string, JsonObject>;
  factionList: JsonObject[];
  gameVersion: string;
  itemDB: RawItemDB;
  lootFilterBeamColors: JsonObject[];
  lootFilterIconColors: string[];
  lootFilterIcons: string[];
  lootFilterRuleColors: JsonObject[];
  masterColors: JsonObject[];
  merchantsGuildBagData: JsonObject;
  monolithRewards: JsonObject;
  monsterMods: Record<string, RawMonsterMod>;
  partialSkillBonuses: JsonObject;
  passiveBonuses: JsonObject;
  prophecyData: { slotUnlockRanks: number[]; lensUnlockRanks: { baseTypeId: number; subTypeId: number; rank: number }[] };
  skillBonuses: JsonObject;
  timelineData: Record<string, RawTimeline>;
  vaultsOfUncertainFate: JsonObject;
  wovenEchoList: JsonObject[];
}

export type LetoolsGlobalName = keyof LetoolsGlobals;

/** All 41 LE Tools globals, code-point sorted (the 42 files under letools/ minus i18n.en.json). */
export const LETOOLS_GLOBALS: readonly LetoolsGlobalName[] = [
  "AT", "AilmentID", "BuffId", "BuffPropId", "CustomConditionType", "LEAbilities", "LECharTrees",
  "LECharTreesUI", "LEHUD", "LESkillTrees", "LESkillTreesUI", "LETooltipIcons", "LEWeaverTree",
  "LEWeaverTreeUI", "LocalSP", "SP", "UIBuffIds", "UIBuffs", "arenaData", "checklist", "coreDB",
  "dropBossLoot", "dungeonData", "factionList", "gameVersion", "itemDB", "lootFilterBeamColors",
  "lootFilterIconColors", "lootFilterIcons", "lootFilterRuleColors", "masterColors",
  "merchantsGuildBagData", "monolithRewards", "monsterMods", "partialSkillBonuses", "passiveBonuses",
  "prophecyData", "skillBonuses", "timelineData", "vaultsOfUncertainFate", "wovenEchoList",
] as const;

/** Maxroll data.json (partial; see docs/data-sources/maxroll.md). */
export interface MaxrollData extends JsonObject {
  abilities: Record<string, JsonObject>;
  abilityList: (string | null)[];
  ailments: JsonObject[];
  classes: JsonObject[];
  affixes: JsonObject[];
  uniques: JsonObject[];
  itemTypes: JsonObject[];
  properties: JsonObject[];
  setBonuses: JsonObject[];
  timelines: JsonObject[];
  quests: {
    id: number;
    name: string;
    chapter: number;
    mainLineQuest?: boolean;
    idolUnlockReward?: number;
    completed?: number;
    passivePointsReward?: number;
    allAttributesReward?: number;
  }[];
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export interface RawData {
  /** Data version folder name, e.g. '1.5.2'. */
  readonly version: string;
  /** Absolute path of data/raw/<version>/. */
  readonly dir: string;
  /** sources.lock.json */
  readonly lock: SourcesLock;
  /** LE Tools globals, parsed lazily on first property access. */
  readonly letools: LetoolsGlobals;
  /** i18n.en.json verbatim (ICU escaped). */
  readonly i18n: Record<string, string>;
  /** ICU-unescaping resolver over i18n (null when missing or empty). */
  readonly t: Translator;
  /** Maxroll data.json, or null when the file is absent. Parsed lazily. */
  readonly maxroll: MaxrollData | null;
  /** True when letools/<name>.json exists. */
  hasGlobal(name: string): boolean;
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Open data/raw/<version>/ for reading. Throws when the folder or its lockfile is missing. */
export function loadRaw(version: string, rawRoot: string = RAW_ROOT): RawData {
  const dir = versionDir(version, rawRoot);
  const lockPath = join(dir, "sources.lock.json");
  if (!existsSync(lockPath)) throw new Error(`raw data not found: ${lockPath} (run \`yarn fetch\`)`);
  const lock = readJson(lockPath) as SourcesLock;
  const letoolsDir = join(dir, "letools");

  const cache = new Map<string, unknown>();
  const letools = new Proxy({} as LetoolsGlobals, {
    get(_t, prop) {
      if (typeof prop !== "string") return undefined;
      if (cache.has(prop)) return cache.get(prop);
      const p = join(letoolsDir, `${prop}.json`);
      if (!existsSync(p)) throw new Error(`LE Tools global not found: ${p}`);
      const v = readJson(p);
      cache.set(prop, v);
      return v;
    },
    has(_t, prop) {
      return typeof prop === "string" && existsSync(join(letoolsDir, `${prop}.json`));
    },
    ownKeys() {
      return [...LETOOLS_GLOBALS];
    },
    getOwnPropertyDescriptor(_t, prop) {
      return typeof prop === "string" && existsSync(join(letoolsDir, `${prop}.json`))
        ? { enumerable: true, configurable: true }
        : undefined;
    },
  });

  let i18n: Record<string, string> | undefined;
  let t: Translator | undefined;
  let maxroll: MaxrollData | null | undefined;

  const raw: RawData = {
    version,
    dir,
    lock,
    letools,
    get i18n() {
      if (!i18n) {
        const p = join(letoolsDir, "i18n.en.json");
        i18n = existsSync(p) ? (readJson(p) as Record<string, string>) : {};
      }
      return i18n;
    },
    get t() {
      if (!t) t = makeTranslator(raw.i18n);
      return t;
    },
    get maxroll() {
      if (maxroll === undefined) {
        const p = join(dir, "maxroll", "data.json");
        maxroll = existsSync(p) ? (readJson(p) as MaxrollData) : null;
      }
      return maxroll;
    },
    hasGlobal(name: string) {
      return existsSync(join(letoolsDir, `${name}.json`));
    },
  };
  return raw;
}

/**
 * Tree node stat kinds (private helper of the skills loader).
 *
 * LE Tools / Maxroll tree node stats are DISPLAY lines: `{statNameKey, value: '+25%', property, tags, noScaling}`.
 * Their `property` is only the tooltip icon hint of the line (decompiled NodeTooltipPropertyList.GetStatPropertyName,
 * vendor/lastepochbuilder/research/07b_assets_abilities_trees.md section 1.2, D):
 *
 *   property < 5000        an SP id (often only loosely related to the line: 'Max Blade Weaving Stacks' uses SP 0 Damage)
 *   property 54 (SP.None)  display text only
 *   5000 .. 9999           NodeTooltipPropertyList.properties[p - 5000], a GLOBAL list of tooltip categories
 *                          (5110 = 'Melee Damage' in every tree; the line label says what it really is)
 *   >= 10000               an ailment icon (10000 + AilmentID; 15000+/20000+/25000+ are icon variants)
 *
 * The real effect (added / increased / more, which stat, skill-local parameter) is in game code
 * (<Skill>Tree.updateMutator, <Class>Tree.updateMutator). The vendored decompile of game 1.5.0
 * (vendor/lastepochbuilder/research/data/game/skill_node_effects.json and passive_node_effects.json) lists
 * those effects per node; matchNodeStats() pairs every 1.5.2 display line with a code effect of the same node
 * (same tree id, node id and node name, same magnitude, compatible wording) and falls back to inferring the
 * kind from the label text when no effect matches.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { REPO_ROOT } from "../lib/paths.js";
import { parseDisplayValue } from "../lib/stat-lines.js";
import type { JsonObject } from "../lib/util.js";

export type PropertyKind = "stat" | "tooltip_category" | "ailment" | "display_only";
export type ModifierSource = "structured" | "inferred";

/** What a tree node display line really is. */
export interface NodeStatKind {
  /** 0 added, 1 increased, 2 more; null when neither the code nor the label says. */
  modifierType: 0 | 1 | 2 | null;
  /** added | increased | more | skill_parameter | conversion | unknown */
  statKind: string;
  source: ModifierSource;
  /** The matched code effect (structured only), e.g. 'add_stat Damage more [Spell] -> FireballMutator.unconditionalTempStats'. */
  codeRef: string | null;
  /** Code property of an add_stat match (SP enum name), null for fields and inferred lines. */
  codeProperty: string | null;
}

/** One display line of a 1.5.2 tree node. */
export interface DisplayLine {
  property: number | null;
  label: string | null;
  display: string | null;
  noScaling: boolean;
}

/** Decode the tooltip `property` of a node stat (see the file comment). */
export function propertyKind(property: number | null | undefined): PropertyKind {
  if (property === null || property === undefined) return "display_only";
  if (property === 54) return "display_only";
  if (property >= 10000) return "ailment";
  if (property >= 5000) return "tooltip_category";
  return "stat";
}

/** AilmentID behind an ailment icon property (10000 + id), null for the icon variants (15000+) and other kinds. */
export function ailmentIdOfProperty(property: number | null | undefined): number | null {
  if (property === null || property === undefined || property < 10000 || property >= 15000) return null;
  return property - 10000;
}

// ------------------------------------------------------------------------------------------ text helpers

const SYNONYMS: Record<string, string> = {
  crit: "critical",
  crits: "critical",
  armor: "armour",
  regen: "regeneration",
  regenerate: "regeneration",
  movespeed: "movement",
  move: "movement",
  "2h": "two",
  twohanded: "two",
  dmg: "damage",
  res: "resistance",
  resistances: "resistance",
  hp: "health",
  cdr: "cooldown",
  ms: "movement",
  aoe: "area",
  radius: "area",
  multi: "multiplier",
  dot: "dot",
  gained: "gain",
  gains: "gain",
  granted: "gain",
  grant: "gain",
  grants: "gain",
};
const AILMENT_WORDS = new Set([
  "ignite", "bleed", "chill", "shock", "slow", "poison", "freeze", "frostbite", "blind", "frailty", "doom", "time", "rot",
  "electrify", "damned", "plague", "root", "fear", "stun", "shred", "haste", "frenzy", "decrepify", "withering", "penance",
  "spark", "charge", "essence", "venom", "curse", "spreading", "flames", "abyssal", "decay", "marked", "death", "critical",
  "vulnerability", "immobilize", "immobilized", "silver", "dusk", "crimson", "shroud", "shadow", "daggers", "toxin", "efficacious",
]);
/** Words that qualify a stat without changing which stat it is. */
const QUALIFIERS = new Set([
  "increased", "more", "less", "added", "add", "reduced", "global", "base", "additional", "extra", "flat", "total", "bonus",
  "physical", "fire", "cold", "lightning", "void", "necrotic", "poison", "elemental", "spell", "spells", "melee", "throwing",
  "bow", "minion", "minions", "dot", "hit", "hits", "damage", "a", "an", "the", "and", "of", "for", "you", "your",
]);
const GENERIC_CODE = new Set(["stat", "stats", "property", "increased", "added", "more", "less", "base", "from", "passive", "tree", "passives", "value", "amount", "per", "point", "points", "on", "with", "to", "of", "and", "if", "is", "while"]);

/** Lower-case word tokens with plural 's' stripped and synonyms applied; camelCase and digits split. */
export function tokens(s: string | null | undefined): string[] {
  if (!s) return [];
  const spaced = s
    .replace(/damage over time/gi, "dot")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/two[ -]?handed/gi, "two")
    .toLowerCase();
  const out: string[] = [];
  for (let w of spaced.split(/[^a-z0-9]+/)) {
    if (!w || /^\d+$/.test(w)) continue;
    if (w === "2h") w = "two";
    w = SYNONYMS[w] ?? w;
    if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
    out.push(SYNONYMS[w] ?? w);
  }
  return out;
}

/**
 * True when the line label is just the property name with qualifiers (tags, increased/more/added, global, base...),
 * i.e. reading the line as a plain `<modifier> <property>` stat is right. 'Effect of Damage Stats on a 2h Weapon'
 * does NOT fit property 0 Damage; 'Fire Penetration' fits Penetration; 'Mana Cost' fits ManaCost.
 */
export function labelFitsProperty(label: string | null | undefined, ...propertyNames: (string | null | undefined)[]): boolean {
  const lt = tokens(label).filter((w) => !QUALIFIERS.has(w));
  const pt = new Set(propertyNames.flatMap((n) => tokens(n)));
  return lt.every((w) => pt.has(w));
}

/** Kind of a display line inferred from its label and value text alone. */
export function inferKind(label: string | null | undefined, display: string | null | undefined, addedAsPercent = false): { modifierType: 0 | 1 | 2 | null; statKind: string } {
  const l = (label ?? "").toLowerCase();
  if (/\b(more|less)\b/.test(l)) return { modifierType: 2, statKind: "more" };
  if (/\b(increased|reduced)\b/.test(l)) return { modifierType: 1, statKind: "increased" };
  const d = display ?? "";
  if (parseDisplayValue(d) !== null && !d.includes("%")) return { modifierType: 0, statKind: "added" };
  if (d.includes("%") && addedAsPercent) return { modifierType: 0, statKind: "added" };
  return { modifierType: null, statKind: "unknown" };
}

// ------------------------------------------------------------------------------------------ code effects

interface Magnitude {
  per_point?: number;
  flat?: number;
  expr?: string;
}

/** A code effect normalised for matching. */
interface CodeEffect {
  kind: string;
  property: string | null;
  tags: string | null;
  mags: Magnitude[];
  target: string;
  wrappers: string[];
  field: boolean;
  /** words the line label must share with the effect (compatibility check) */
  words: string[];
  /** true: one shared word is enough (mutator field names, player property names); false: all of them */
  anyWord: boolean;
  /** condition / player property name of conditional stats (shown in code_ref) */
  note?: string;
}

const KIND_MODIFIER: Record<string, 0 | 1 | 2> = {
  added: 0,
  ailment_chance: 0,
  player_property: 0,
  ability_property: 0,
  increased: 1,
  ailment_duration: 1,
  ailment_effect: 1,
  ailment_effect_on_you: 1,
  more: 2,
  conditional_more_damage: 2,
  more_damage_per_ailment_stack: 2,
  more_player_property: 2,
  more_ability_property: 2,
};

/** SP enum name standing in for code stats that carry no explicit property (ailment / conditional / indirect stats). */
const PSEUDO_PROPERTY: Record<string, string> = {
  ailment_chance: "AilmentChance",
  ailment_duration: "IncreasedAilmentDuration",
  ailment_effect: "IncreasedAilmentEffect",
  ailment_effect_on_you: "EffectOfAilmentOnYou",
  ailment_conversion: "AilmentConversion",
  conditional_more_damage: "ConditionalMoreDamage",
  more_damage_per_ailment_stack: "DamagePerStackOfAilment",
  player_property: "PlayerProperty",
  more_player_property: "PlayerProperty",
  ability_property: "AbilityProperty",
  more_ability_property: "AbilityProperty",
};

const MOD_TYPE_KIND: Record<string, string> = { ADDED: "added", INCREASED: "increased", MORE: "more" };

function unwrapStat(stat: JsonObject): { stat: JsonObject; wrappers: string[] } {
  const wrappers: string[] = [];
  let s = stat;
  while (s && typeof s.stat === "object" && s.stat) {
    wrappers.push(String(s.kind ?? String(s.ctor ?? "wrapper").split(/[.(]/)[0]));
    s = s.stat as JsonObject;
  }
  return { stat: s, wrappers };
}

function shortTarget(t: unknown): string {
  return String(t ?? "")
    .split(" & ")
    .map((x) => x.trim())
    .join(" & ");
}

/** Normalised effects aligned with the source array (null for effects that cannot match a line: cooldown, call, ...). */
function normEffects(effects: JsonObject[] | undefined): (CodeEffect | null)[] {
  const out: (CodeEffect | null)[] = [];
  for (const e of effects ?? []) {
    const before = out.length;
    if (e.op === "add_stat" && e.stat) {
      const { stat, wrappers } = unwrapStat(e.stat as JsonObject);
      const kind = String(stat.kind ?? "unknown");
      const comp = (stat.added ?? stat.increased ?? stat.more ?? stat.value) as Magnitude | undefined;
      const mags: Magnitude[] = [];
      if (comp) mags.push(comp);
      for (const mv of (stat.more_values as Magnitude[] | undefined) ?? []) mags.push(mv);
      const property = (stat.property as string | undefined) ?? PSEUDO_PROPERTY[kind] ?? null;
      // words the label must contain: the stat's own property; ailment stats any ailment word; conditional / per-stack
      // damage 'damage'; player / ability property stats share any one word of the property name (like fields)
      let words: string[] = [];
      let anyWord = false;
      if (stat.property) words = tokens(stat.property as string);
      else if (/^ailment_/.test(kind)) words = ["ailment"];
      else if (kind === "conditional_more_damage" || kind === "more_damage_per_ailment_stack") words = ["damage"];
      else if (/player_property$/.test(kind)) {
        words = [...tokens(stat.playerPropertyName as string), ...tokens(stat.playerPropertyField as string)];
        anyWord = true;
      }
      const note = (stat.condition as string | undefined) ?? (stat.playerPropertyName as string | undefined) ?? (stat.ailment as string | undefined);
      out.push({ kind, property, tags: (stat.tags as string) ?? null, mags, target: shortTarget(e.target), wrappers, field: false, words, anyWord, note });
    } else if (e.op === "automatic_node_stat") {
      out.push({
        kind: MOD_TYPE_KIND[String(e.modType)] ?? "unknown",
        property: (e.property as string) ?? null,
        tags: (e.tags as string) ?? null,
        mags: [{ per_point: Number(e.value), flat: Number(e.value) }],
        target: "AutomaticNodeStat",
        wrappers: [],
        field: false,
        words: tokens(e.property as string),
        anyWord: false,
      });
    } else if (typeof e.target === "string" && e.value && typeof e.value === "object" && ("per_point" in e.value || "flat" in e.value)) {
      const fieldName = e.target.split(".").pop() ?? e.target;
      out.push({ kind: "field", property: null, tags: null, mags: [e.value as Magnitude], target: e.target, wrappers: [], field: true, words: tokens(fieldName), anyWord: true });
    }
    if (out.length === before) out.push(null);
  }
  return out;
}

/** Modifier type of a mutator field from its name: increasedX 1, moreX/lessX 2, addedX/extraX/additionalX 0. */
export function fieldModifier(target: string): 0 | 1 | 2 | null {
  const f = target.split(".").pop() ?? "";
  if (/^(increased|inc|reduced)[A-Z]/.test(f)) return 1;
  if (/^(more|less)[A-Z]/.test(f)) return 2;
  if (/^(added|extra|additional|plus)[A-Z]/.test(f)) return 0;
  return null;
}

const near = (a: number | undefined, b: number): boolean => typeof a === "number" && Number.isFinite(a) && a !== 0 && Math.abs(Math.abs(a) - Math.abs(b)) < 1e-6;

/** 2 = the magnitude matches with the line's own scaling (per point / flat), 1 = only with the other one, 0 = no match. */
function magnitudeMatch(e: CodeEffect, v: number, noScaling: boolean): 0 | 1 | 2 {
  let best: 0 | 1 | 2 = 0;
  for (const m of e.mags) {
    if (m.expr !== undefined) continue;
    const exact = noScaling ? near(m.flat, v) : near(m.per_point, v);
    const other = noScaling ? near(m.per_point, v) : near(m.flat, v);
    if (exact) return 2;
    if (other) best = 1;
  }
  return best;
}

/** The label shares the effect's meaning: every significant code word appears in the label (ailment words match 'ailment'). */
function compatible(labelWords: Set<string>, e: CodeEffect): boolean {
  const sig = e.words.filter((w) => !GENERIC_CODE.has(w));
  if (!sig.length) return true;
  const has = (w: string) => labelWords.has(w) || (w === "ailment" && [...labelWords].some((x) => AILMENT_WORDS.has(x))) || (w === "dot" && labelWords.has("dot"));
  return e.anyWord ? sig.some(has) : sig.every(has);
}

function describe(e: CodeEffect): string {
  if (e.field) return `field ${e.target}`;
  const tags = e.tags && e.tags !== "None" ? ` [${e.tags}]` : "";
  const wrap = e.wrappers.length ? ` (${e.wrappers.join(", ")})` : "";
  const note = e.note ? ` {${e.note}}` : "";
  return `add_stat ${e.property ?? "?"} ${e.kind}${tags}${note}${wrap} -> ${e.target}`;
}

// ------------------------------------------------------------------------------------------ the index

interface VendorNode {
  id: number;
  displayName?: string;
  effects?: JsonObject[];
}

/** Code effects per tree node from the vendored decompile (empty when the files are absent). */
export class NodeEffectIndex {
  private readonly nodes = new Map<string, { name: string; effects: (CodeEffect | null)[]; tooltip: { statName: string; effectIndex: number | null }[] }>();
  /** NodeTooltipPropertyList names (5000+ ids), from tree_node_stats.json. */
  readonly tooltipCategories = new Map<number, string>();
  readonly loaded: boolean;

  constructor(skillTrees: JsonObject[] | null, passiveTrees: JsonObject[] | null, treeNodeStats: Record<string, JsonObject> | null) {
    for (const t of [...(skillTrees ?? []), ...(passiveTrees ?? [])]) {
      for (const n of (t.nodes as VendorNode[] | undefined) ?? []) {
        // passive_node_effects.json pairs each tooltip line with an effect itself (tooltip_stats[].effect_index)
        const tooltip = ((n as JsonObject).tooltip_stats as JsonObject[] | undefined)?.map((ts) => ({
          statName: String(ts.statName ?? ""),
          effectIndex: ts.match === "matched" && typeof ts.effect_index === "number" ? ts.effect_index : null,
        })) ?? [];
        this.nodes.set(`${t.treeID}:${n.id}`, { name: String(n.displayName ?? ""), effects: normEffects(n.effects), tooltip });
      }
    }
    for (const n of Object.values(treeNodeStats ?? {})) {
      for (const s of (n.tooltipStats as JsonObject[] | undefined) ?? []) {
        if (s.propertyKind === "TooltipList" && typeof s.property === "number" && typeof s.propertyName === "string") {
          if (!this.tooltipCategories.has(s.property)) this.tooltipCategories.set(s.property, s.propertyName);
        }
      }
    }
    this.loaded = this.nodes.size > 0;
  }

  /** Load the vendored files (vendor/lastepochbuilder/research/data/game); an empty index when they are missing. */
  static fromVendor(root: string = REPO_ROOT): NodeEffectIndex {
    const dir = join(root, "vendor", "lastepochbuilder", "research", "data", "game");
    const read = <T>(f: string): T | null => {
      const p = join(dir, f);
      return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as T) : null;
    };
    return new NodeEffectIndex(read<JsonObject[]>("skill_node_effects.json"), read<JsonObject[]>("passive_node_effects.json"), read<Record<string, JsonObject>>("tree_node_stats.json"));
  }

  /**
   * Classify the display lines of one node. `nodeName` must equal the decompiled node's display name (1.5.0 vs
   * 1.5.2 renumbering guard); `spEnumName(p)` gives the SP enum name of a stat property, `addedAsPercent(p)` whether
   * the property displays added values as percentages (resistances, chances).
   */
  classify(
    treeId: string,
    nodeId: number,
    nodeName: string | null,
    lines: DisplayLine[],
    spEnumName: (p: number) => string | null,
    addedAsPercent: (p: number) => boolean,
  ): NodeStatKind[] {
    const vn = this.nodes.get(`${treeId}:${nodeId}`);
    const sameNode = !!vn && !!nodeName && vn.name.trim().toLowerCase() === nodeName.trim().toLowerCase();
    const used = new Set<CodeEffect>();
    return lines.map((line, i) => {
      const v = parseDisplayValue(line.display);
      if (sameNode && v !== null && v !== 0) {
        const labelWords = new Set(tokens(line.label));
        const sp = line.property !== null && propertyKind(line.property) === "stat" ? spEnumName(line.property) : null;
        const rankOf = (e: CodeEffect) => (!e.field && sp && e.property === sp ? 0 : 1);
        let hit: CodeEffect | undefined;
        // 1. the decompile's own line -> effect pairing (passive trees), when the line and the magnitude still agree
        const tt = vn!.tooltip[i];
        if (tt && tt.effectIndex !== null && tt.statName.trim().toLowerCase() === (line.label ?? "").trim().toLowerCase()) {
          const e = vn!.effects[tt.effectIndex];
          const mag = e ? magnitudeMatch(e, v, line.noScaling) : 0;
          if (e && (mag === 2 || (mag === 1 && (rankOf(e) === 0 || compatible(labelWords, e))))) hit = e;
        }
        // 2. match by magnitude: same SP property first, then exact scaling, unused effects, stats before mutator fields
        if (!hit) {
          const cands = vn!.effects
            .filter((e): e is CodeEffect => e !== null)
            .map((e) => ({ e, mag: magnitudeMatch(e, v, line.noScaling), rank: rankOf(e) }))
            .filter((c) => c.mag > 0 && (c.rank === 0 || compatible(labelWords, c.e)))
            .sort((a, b) => a.rank - b.rank || b.mag - a.mag || Number(used.has(a.e)) - Number(used.has(b.e)) || Number(a.e.field) - Number(b.e.field));
          hit = cands[0]?.e;
        }
        if (hit) {
          used.add(hit);
          const modifierType = hit.field ? fieldModifier(hit.target) : (KIND_MODIFIER[hit.kind] ?? null);
          const statKind =
            modifierType !== null ? (["added", "increased", "more"] as const)[modifierType] : hit.field ? "skill_parameter" : hit.kind === "ailment_conversion" ? "conversion" : "unknown";
          return { modifierType, statKind, source: "structured", codeRef: describe(hit), codeProperty: hit.field ? null : hit.property };
        }
      }
      const inf = inferKind(line.label, line.display, line.property !== null && propertyKind(line.property) === "stat" && addedAsPercent(line.property));
      return { ...inf, source: "inferred", codeRef: null, codeProperty: null };
    });
  }
}

/**
 * label_mismatch: 1 when the line's property is an SP stat id (property_kind 'stat') but the line is not a plain
 * `<modifier> <that stat>` line: the label names something else (Foe Cleaver 'Effect of Damage Stats on a 2h Weapon'
 * on SP 0 Damage), or the decompiled code applies a different stat (Quintessence of Triumph 'More Spell Damage' on
 * SP 41 Adaptive Spell Damage is a conditional MORE damage stat). Read the label (and code_ref), not property_name.
 */
export function labelMismatch(
  kind: PropertyKind,
  label: string | null,
  propertyName: string | null,
  enumName: string | null,
  k: NodeStatKind,
): boolean {
  if (kind !== "stat") return false;
  if (!labelFitsProperty(label, propertyName, enumName)) return true;
  if (k.source === "structured" && k.codeProperty && enumName && k.codeProperty !== enumName) {
    // the code stat differs: a mismatch unless it is the same stat family (AdaptiveSpellDamage == Damage [Spell] added)
    const same = enumName === "AdaptiveSpellDamage" && k.codeProperty === "Damage" && k.modifierType === 0;
    return !same;
  }
  return false;
}

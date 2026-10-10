/**
 * Unique drop sources (private helper of the items loader).
 *
 * The LE Tools itemDB lists every boss / content specific unique drop in `monsterItemDrops[]`
 * ({uniqueId, monsterNameKey, chance, maxChance, minCorruption, timelineInfo{id, empoweredOnly}, dungeonInfo{id, gamble},
 * wovenEcho, harbinger, aberroth, orobyss, lootLizard, soulGambler, runePrison, arena, nemesis, sceneId, ...}),
 * the experimental uniques in `randomEncounterData.experimentalUniqueDropInfo[]` and guaranteed cache items in
 * `oneShotCaches[].guaranteedItems[]` (rarity 7 = unique). `dropBossLoot.json` is LE Tools' per-boss regrouping of the
 * same data (every unique there is also in monsterItemDrops). Primordial and cocooned uniques have no drop table.
 */
import type { JsonObject } from "../lib/util.js";

export interface DropSource {
  ord: number;
  /** harbinger | aberroth | shade_of_orobyss | nemesis | arena | loot_lizard | soul_gambler | rune_prison | dungeon | timeline_boss | woven_echo | zone | monster | experimental | cache */
  source_kind: string;
  source_name: string | null;
  monster_name_key: string | null;
  timeline_id: number | null;
  timeline_name: string | null;
  empowered_only: number | null;
  dungeon_id: number | null;
  dungeon_name: string | null;
  woven_echo_id: number | null;
  woven_echo_name: string | null;
  min_corruption: number | null;
  chance: number | null;
  max_chance: number | null;
  raw: JsonObject;
}

type T = (key: string | null | undefined) => string | null;
const key = (v: unknown): string | null => (typeof v === "string" ? v : null);

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

function kindOf(d: JsonObject): string {
  if (d.harbinger) return "harbinger";
  if (d.aberroth) return "aberroth";
  if (d.orobyss) return "shade_of_orobyss";
  if (d.nemesis) return "nemesis";
  if (d.arena) return "arena";
  if (d.lootLizard) return "loot_lizard";
  if (d.soulGambler) return "soul_gambler";
  if (d.runePrison) return "rune_prison";
  if (d.dungeonInfo) return "dungeon";
  if (d.timelineInfo) return "timeline_boss";
  if (d.wovenEcho !== undefined && d.wovenEcho !== null) return "woven_echo";
  if (d.sceneId) return "zone";
  return "monster";
}

/** All drop sources per unique id, in source order. */
export function collectDropSources(itemDB: JsonObject, timelineData: JsonObject, dungeonData: JsonObject, wovenEchoList: JsonObject[], t: T): Map<number, DropSource[]> {
  const out = new Map<number, DropSource[]>();
  const add = (id: number, s: Omit<DropSource, "ord">) => {
    const list = out.get(id) ?? out.set(id, []).get(id)!;
    list.push({ ord: list.length, ...s });
  };
  const timelineName = (id: number | null) => (id === null ? null : t(key((timelineData[String(id)] as JsonObject | undefined)?.nameKey)));
  const dungeonName = (id: number | null) => (id === null ? null : t(key((dungeonData[String(id)] as JsonObject | undefined)?.nameKey)));
  const echoName = (id: number | null) => (id === null ? null : t(key(wovenEchoList.find((e) => e.id === id)?.displayNameKey)));
  const blank = { monster_name_key: null, timeline_id: null, timeline_name: null, empowered_only: null, dungeon_id: null, dungeon_name: null, woven_echo_id: null, woven_echo_name: null, min_corruption: null, chance: null, max_chance: null };

  for (const d of (itemDB.monsterItemDrops as JsonObject[] | undefined) ?? []) {
    const id = num(d.uniqueId);
    if (id === null) continue; // base-type drops (itemType / subType) are not uniques
    const tl = d.timelineInfo as JsonObject | undefined;
    const dg = d.dungeonInfo as JsonObject | undefined;
    const timelineId = num(tl?.id);
    const dungeonId = num(dg?.id);
    const echoId = num(d.wovenEcho);
    add(id, {
      source_kind: kindOf(d),
      source_name: t(key(d.monsterNameKey)) ?? (echoId !== null ? echoName(echoId) : null) ?? (typeof d.sceneId === "string" ? d.sceneId : null),
      monster_name_key: typeof d.monsterNameKey === "string" ? d.monsterNameKey : null,
      timeline_id: timelineId,
      timeline_name: timelineName(timelineId),
      empowered_only: tl ? (tl.empoweredOnly ? 1 : 0) : null,
      dungeon_id: dungeonId,
      dungeon_name: dungeonName(dungeonId),
      woven_echo_id: echoId,
      woven_echo_name: echoName(echoId),
      min_corruption: num(d.minCorruption),
      chance: num(d.chance),
      max_chance: num(d.maxChance),
      raw: d,
    });
  }
  const re = itemDB.randomEncounterData as JsonObject | undefined;
  for (const e of (re?.experimentalUniqueDropInfo as JsonObject[] | undefined) ?? []) {
    const id = num(e.uniqueId);
    if (id === null) continue;
    add(id, { ...blank, source_kind: "experimental", source_name: null, chance: num(re?.experimentalUniqueDropChance), raw: e });
  }
  for (const c of (itemDB.oneShotCaches as JsonObject[] | undefined) ?? []) {
    for (const it of (c.guaranteedItems as JsonObject[] | undefined) ?? []) {
      const id = num(it.uniqueID);
      if (id === null || id < 0 || it.rarity !== 7) continue;
      add(id, { ...blank, source_kind: "cache", source_name: t(key(c.displayNameKey)), monster_name_key: typeof c.displayNameKey === "string" ? c.displayNameKey : null, raw: { cache: c.id, scene: c.scene, item: it } });
    }
  }
  return out;
}

const KIND_LABEL: Record<string, string> = {
  harbinger: "harbinger",
  aberroth: "Aberroth",
  shade_of_orobyss: "Shade of Orobyss",
  nemesis: "nemesis",
  arena: "arena",
  loot_lizard: "loot lizard",
  soul_gambler: "soul gambler",
  rune_prison: "rune prison",
  dungeon: "dungeon",
  timeline_boss: "timeline boss",
  woven_echo: "woven echo",
  zone: "zone",
  monster: "monster",
  experimental: "experimental unique roll (itemDB.randomEncounterData)",
  cache: "cache",
};

/** One-line summary of a unique's drop sources (distinct entries in source order), or a note when it has none. */
export function dropSummary(u: JsonObject, sources: DropSource[] | undefined): string | null {
  if (sources?.length) {
    const seen = new Set<string>();
    const parts: string[] = [];
    for (const s of sources) {
      const where = [s.timeline_name, s.dungeon_name, s.woven_echo_id !== null && s.source_name !== s.woven_echo_name ? s.woven_echo_name : null]
        .filter(Boolean)
        .join(", ");
      const extra = [KIND_LABEL[s.source_kind] ?? s.source_kind, where, s.empowered_only ? "empowered" : null, s.min_corruption ? `corruption ${s.min_corruption}+` : null]
        .filter(Boolean)
        .join(", ");
      const text = s.source_name ? `${s.source_name} (${extra})` : extra;
      if (!seen.has(text)) {
        seen.add(text);
        parts.push(text);
      }
    }
    return parts.join("; ");
  }
  if (u.isPrimordialItem) {
    const costs = ["primordialFeatherCost", "primordialFangCost", "ancientBoneCost"].filter((k) => typeof u[k] === "number").map((k) => `${k} ${u[k]}`);
    return `primordial item: no drop source in the data${costs.length ? ` (raw ${costs.join(", ")})` : ""}`;
  }
  if (u.isCocoonedItem) return "cocooned item: no drop source in the data";
  return null;
}

/**
 * Classification of LEAbilities.abilityList records (abilities.kind, abilities.parent_ability_id).
 *
 * The raw list mixes player skills with everything a skill spawns or that other systems trigger, and has no
 * field that says which is which, so the kind is derived:
 *   player      id in playerAbilityIdList
 *   minion      id is listed in an entityList actor's abilityList, has an 'entity_' id prefix, or is only
 *               reachable (by id reference in its prefab) from such an ability
 *   player_sub  not a player ability but reachable from one: its prefab (transitively) names the id, or the id is
 *               '<player id>_<suffix>' (skill-tree mutator copies such as 'av75ch_me27_1_1') or contains a player id as an
 *               underscore-separated segment ('ability_gen117_sw43_1'); parent_ability_id is
 *               the player ability it descends from (the first one reaching it, players in ascending id order)
 *   other       everything else: ailment / item / node / proc abilities ('ability_gen<n>', 'ailment_<n>', ...)
 * There is no monster kind: the data carries no monster actor to tell monster abilities apart from `other`.
 */
import type { JsonObject } from "./util.js";

export const ABILITY_KINDS = ["player", "player_sub", "minion", "other"] as const;
export type AbilityKind = (typeof ABILITY_KINDS)[number];

export interface AbilityClass {
  kind: AbilityKind;
  /** player_sub only: the player ability it descends from. */
  parent: string | null;
}

/** Ids of known abilities named anywhere (string values) in an ability's prefab. */
function prefabRefs(a: JsonObject, known: Map<string, unknown>, self: string): string[] {
  const out = new Set<string>();
  const walk = (o: unknown): void => {
    if (typeof o === "string") {
      if (o !== self && known.has(o)) out.add(o);
    } else if (o && typeof o === "object") {
      for (const v of Object.values(o)) walk(v);
    }
  };
  walk(a.prefab);
  return [...out].sort();
}

export function classifyAbilities(
  abilityList: Record<string, JsonObject>,
  playerIds: string[],
  entityList: Record<string, JsonObject>,
): Map<string, AbilityClass> {
  const ids = Object.keys(abilityList).sort();
  const known = new Map(ids.map((id) => [id, true] as const));
  const players = new Set(playerIds.filter((id) => known.has(id)));
  const refs = new Map(ids.map((id) => [id, prefabRefs(abilityList[id]!, known, id)] as const));

  const entityListed = new Set<string>();
  for (const k of Object.keys(entityList)) for (const a of entityList[k]?.abilityList?.abilities ?? []) if (known.has(a)) entityListed.add(a);
  const isMinionRoot = (id: string) => !players.has(id) && (entityListed.has(id) || id.startsWith("entity_"));

  // reachable from each player ability, ascending player id order, not entering other player abilities
  const parentOf = new Map<string, string>();
  for (const p of [...players].sort()) {
    const queue = [p];
    while (queue.length) {
      const cur = queue.shift()!;
      for (const next of refs.get(cur) ?? []) {
        if (players.has(next) || parentOf.has(next)) continue;
        parentOf.set(next, p);
        queue.push(next);
      }
    }
  }
  // '<player id>_...' ids: longest matching player prefix
  for (const id of ids) {
    if (players.has(id) || parentOf.has(id)) continue;
    let best: string | undefined;
    for (const p of players) if (id.startsWith(p + "_") && (!best || p.length > best.length)) best = p;
    if (!best) {
      // derived ids chain their ancestors' codes: 'ability_gen117_sw43_1' (spawned by sw43), 'mm_am0hr_29_fm8_1' (am0hr)
      best = id.split("_").find((seg) => players.has(seg));
    }
    if (best) parentOf.set(id, best);
  }

  // minion: roots plus everything reachable from them that is not a player ability / player sub-ability
  const minion = new Set<string>(ids.filter(isMinionRoot));
  const queue = [...minion];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const next of refs.get(cur) ?? []) {
      if (players.has(next) || parentOf.has(next) || minion.has(next)) continue;
      minion.add(next);
      queue.push(next);
    }
  }

  const out = new Map<string, AbilityClass>();
  for (const id of ids) {
    if (players.has(id)) out.set(id, { kind: "player", parent: null });
    else if (isMinionRoot(id)) out.set(id, { kind: "minion", parent: null });
    else if (parentOf.has(id)) out.set(id, { kind: "player_sub", parent: parentOf.get(id)! });
    else if (minion.has(id)) out.set(id, { kind: "minion", parent: null });
    else out.set(id, { kind: "other", parent: null });
  }
  return out;
}

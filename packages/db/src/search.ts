/**
 * Builds the FTS5 `search` table from the loaded tables (runs after all loaders).
 *
 * Every kind is one INSERT ... SELECT over normal tables, so it works on a partially loaded
 * database (empty source tables simply contribute no rows). Rows are inserted in a fixed order
 * (kind order below, then a stable ORDER BY per kind); player abilities come before other abilities.
 *
 * Query examples (docs/schema.md):
 *   SELECT kind, id, name FROM search WHERE search MATCH 'ward NEAR hit' ORDER BY bm25(search, 0, 0, 10, 1) LIMIT 20;
 *   SELECT kind, id, name FROM search WHERE search MATCH 'name:fireball' AND kind = 'ability';
 */
import type { Logger } from "./lib/context.js";
import type { DB } from "./lib/sqlite.js";

/** Search kinds in insertion order. */
export const SEARCH_KINDS = [
  "unique",
  "affix",
  "item_subtype",
  "ability",
  "skill_node",
  "passive_node",
  "weaver_node",
  "ailment",
  "stat_property",
  "player_property",
  "ability_property",
  "set",
  "blessing",
  "monster_mod",
  "timeline",
  "dungeon",
] as const;
export type SearchKind = (typeof SEARCH_KINDS)[number];

const modsText = (kinds: string, sourceIdExpr: string) => `(
  SELECT group_concat(concat_ws(' ', m.label, m.property_name, m.display, m.tag_names), ' ' ORDER BY m.source_ord, m.sub_ord, m.tier)
    FROM mods m WHERE m.source_kind IN (${kinds}) AND m.source_id = ${sourceIdExpr})`;

const treeNodes = (kind: string, treeKind: string, sourceKind: string) => `
  INSERT INTO search (kind, id, name, text)
  SELECT '${kind}', n.tree_id || ':' || n.node_id, n.name,
         concat_ws(' ', t.name, n.description, n.alt_text, n.point_bonus_description,
                   ${modsText(`'${sourceKind}'`, "n.tree_id || ':' || n.node_id")})
    FROM tree_nodes n JOIN trees t ON t.tree_id = n.tree_id
   WHERE n.tree_kind = '${treeKind}' AND n.name IS NOT NULL
   ORDER BY n.tree_id, n.node_id`;

/** One INSERT ... SELECT per kind. */
export const SEARCH_SQL: Record<SearchKind, string> = {
  unique: `
    INSERT INTO search (kind, id, name, text)
    SELECT 'unique', CAST(u.unique_id AS TEXT), u.name,
           concat_ws(' ', u.alt_search_name, st.name, bt.name, s.name,
                     (SELECT group_concat(tt.text, ' ' ORDER BY tt.ord) FROM unique_tooltips tt WHERE tt.unique_id = u.unique_id),
                     ${modsText("'unique_mod'", "CAST(u.unique_id AS TEXT)")}, u.lore)
      FROM uniques u
      LEFT JOIN item_base_types bt ON bt.base_type_id = u.base_type_id
      LEFT JOIN item_subtypes st ON st.base_type_id = u.base_type_id AND st.sub_type_id = u.sub_type_id
      LEFT JOIN sets s ON s.set_id = u.set_id
     WHERE u.name IS NOT NULL
     ORDER BY u.unique_id`,
  affix: `
    INSERT INTO search (kind, id, name, text)
    SELECT 'affix', CAST(a.affix_id AS TEXT), a.name,
           concat_ws(' ', a.title, a.filter_name, a.affix_type_name, a.class_names, dc.name,
                     (SELECT group_concat(concat_ws(' ', s.label, s.property_name), ' ' ORDER BY s.ord) FROM affix_stats s WHERE s.affix_id = a.affix_id),
                     (SELECT group_concat(bt.name, ' ' ORDER BY r.ord) FROM affix_can_roll_on r
                        JOIN item_base_types bt ON bt.base_type_id = r.base_type_id WHERE r.affix_id = a.affix_id))
      FROM affixes a
      LEFT JOIN affix_display_categories dc ON dc.idx = a.display_category
     WHERE a.name IS NOT NULL
     ORDER BY a.affix_id`,
  item_subtype: `
    INSERT INTO search (kind, id, name, text)
    SELECT 'item_subtype', st.base_type_id || ':' || st.sub_type_id, st.name,
           concat_ws(' ', bt.name, bt.category, st.description, st.lens_effect, st.class_requirement_names,
                     ${modsText("'implicit','blessing','idol_altar'", "st.base_type_id || ':' || st.sub_type_id")})
      FROM item_subtypes st
      LEFT JOIN item_base_types bt ON bt.base_type_id = st.base_type_id
     WHERE st.name IS NOT NULL
     ORDER BY st.base_type_id, st.sub_type_id`,
  ability: `
    INSERT INTO search (kind, id, name, text)
    SELECT 'ability', a.ability_id, a.name,
           concat_ws(' ', a.description, a.alt_text, a.tag_names, CASE WHEN a.is_player_ability = 1 THEN 'player skill' END)
      FROM abilities a
     WHERE a.name IS NOT NULL
     ORDER BY a.is_player_ability DESC, a.player_list_ord, a.ability_id`,
  skill_node: treeNodes("skill_node", "skill", "skill_node"),
  passive_node: treeNodes("passive_node", "class", "passive_node"),
  weaver_node: treeNodes("weaver_node", "weaver", "weaver_node"),
  ailment: `
    INSERT INTO search (kind, id, name, text)
    SELECT 'ailment', CAST(al.ailment_id AS TEXT), al.name,
           concat_ws(' ', al.internal_name, al.description, al.damage_types, al.tag_names,
                     ${modsText("'ailment_buff'", "CAST(al.ailment_id AS TEXT)")})
      FROM ailments al
     WHERE al.name IS NOT NULL
     ORDER BY al.ailment_id`,
  stat_property: `
    INSERT INTO search (kind, id, name, text)
    SELECT 'stat_property', CAST(p.property AS TEXT), coalesce(p.name, p.enum_name), concat_ws(' ', p.enum_name, p.alt_text)
      FROM stat_properties p
     ORDER BY p.property`,
  player_property: `
    INSERT INTO search (kind, id, name, text)
    SELECT 'player_property', CAST(p.idx AS TEXT), p.name, p.alt_text
      FROM player_properties p
     WHERE p.name IS NOT NULL
     ORDER BY p.idx`,
  ability_property: `
    INSERT INTO search (kind, id, name, text)
    SELECT 'ability_property', p.ability_index || ':' || p.prop_index, p.name,
           concat_ws(' ', p.alt_text, (SELECT a.name FROM abilities a WHERE a.ability_id = p.ability_id))
      FROM ability_properties p
     WHERE p.name IS NOT NULL
     ORDER BY p.ability_index, p.prop_index`,
  set: `
    INSERT INTO search (kind, id, name, text)
    SELECT 'set', CAST(s.set_id AS TEXT), s.name,
           concat_ws(' ', s.set_name,
                     (SELECT group_concat(st.text, ' ' ORDER BY st.ord) FROM set_tooltips st WHERE st.set_id = s.set_id),
                     (SELECT group_concat(u.name, ' ' ORDER BY u.unique_id) FROM uniques u WHERE u.set_id = s.set_id),
                     ${modsText("'set_bonus'", "CAST(s.set_id AS TEXT)")})
      FROM sets s
     WHERE s.set_id > 0 AND s.name IS NOT NULL
     ORDER BY s.set_id`,
  blessing: `
    INSERT INTO search (kind, id, name, text)
    SELECT 'blessing', CAST(b.sub_type_id AS TEXT), b.name,
           concat_ws(' ', tl.name, CASE WHEN b.is_grand = 1 THEN 'grand' END,
                     ${modsText("'blessing'", "'34:' || b.sub_type_id")})
      FROM blessings b
      LEFT JOIN timelines tl ON tl.timeline_id = b.timeline_id
     WHERE b.name IS NOT NULL
     ORDER BY b.sub_type_id`,
  monster_mod: `
    INSERT INTO search (kind, id, name, text)
    SELECT 'monster_mod', CAST(mm.mod_id AS TEXT), coalesce(mm.title, mm.description, mm.objective_text),
           concat_ws(' ', mm.description, mm.objective_text, ${modsText("'monster_mod'", "CAST(mm.mod_id AS TEXT)")})
      FROM monster_mods mm
     WHERE coalesce(mm.title, mm.description, mm.objective_text) IS NOT NULL
     ORDER BY mm.mod_id`,
  timeline: `
    INSERT INTO search (kind, id, name, text)
    SELECT 'timeline', CAST(tl.timeline_id AS TEXT), tl.name, concat_ws(' ', tl.boss_name, tl.harbinger_name, tl.slug)
      FROM timelines tl
     WHERE tl.name IS NOT NULL
     ORDER BY tl.timeline_id`,
  dungeon: `
    INSERT INTO search (kind, id, name, text)
    SELECT 'dungeon', CAST(d.dungeon_id AS TEXT), d.name, concat_ws(' ', d.boss_name, d.area_name, d.era_name, d.slug)
      FROM dungeons d
     WHERE d.name IS NOT NULL
     ORDER BY d.dungeon_id`,
};

/** Rebuild `search` from scratch. Returns rows inserted per kind. */
export function buildSearch(db: DB, log?: Logger): Record<SearchKind, number> {
  const out = {} as Record<SearchKind, number>;
  db.transaction(() => {
    db.prepare(`DELETE FROM search`).run();
    for (const kind of SEARCH_KINDS) {
      out[kind] = db.prepare(SEARCH_SQL[kind]).run().changes;
    }
    db.prepare(`INSERT INTO search (search) VALUES ('optimize')`).run();
  })();
  log?.info(`search: ${Object.values(out).reduce((a, b) => a + b, 0)} rows`);
  return out;
}

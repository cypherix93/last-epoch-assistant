// Generators for knowledge/reference/community-builds.md: tables from the community_* tables of data/le.sqlite.
// Needs a built database (yarn db:build). Env LE_DB_PATH overrides the path.
const path = require('path');
const fs = require('fs');
const L = require('./lib.cjs');
let _db;
function db() {
  if (_db) return _db;
  const Database = require(path.join(L.ROOT, 'node_modules/better-sqlite3'));
  const p = process.env.LE_DB_PATH || path.join(L.ROOT, 'data/le.sqlite');
  if (!fs.existsSync(p)) throw new Error('data/le.sqlite not found; run yarn db:build first (' + p + ')');
  _db = new Database(p, { readonly: true });
  return _db;
}
const all = (sql) => db().prepare(sql).all();
const one = (sql) => db().prepare(sql).get();
const SRC = 'data/le.sqlite (community_* tables, v_build_summary)';

const counts = {
  src: SRC,
  fn() {
    const b = one('SELECT count(*) n, min(season) s0, max(season) s1, count(DISTINCT class_id) cl, sum(is_primary) pr FROM community_builds');
    const rows = [
      ['Builds (guide x planner profile)', b.n, 'community_builds'],
      ['of which primary profile of their guide', b.pr, 'community_builds.is_primary'],
      ['Planner tabs (Starter / Endgame / Aspirational)', one('SELECT count(*) n FROM community_build_profiles').n, 'community_build_profiles'],
      ['Items and idols', one('SELECT count(*) n FROM community_build_items').n, 'community_build_items'],
      ['Item affix lines', one('SELECT count(*) n FROM community_build_item_affixes').n, 'community_build_item_affixes'],
      ['Distinct uniques used', one('SELECT count(DISTINCT unique_id) n FROM community_build_items WHERE unique_id IS NOT NULL').n, 'community_build_items.unique_id'],
      ['Blessing picks', one('SELECT count(*) n FROM community_build_blessings').n, 'community_build_blessings'],
      ['Passive node allocations', one('SELECT count(*) n FROM community_build_passives').n, 'community_build_passives'],
      ['Skill rows', one('SELECT count(*) n FROM community_build_skills').n, 'community_build_skills'],
      ['Skill-tree node allocations', one('SELECT count(*) n FROM community_build_skill_nodes').n, 'community_build_skill_nodes'],
      ['Classes covered', b.cl, 'community_builds.class_id'],
      ['Seasons in the data', one("SELECT group_concat(season, '; ') s FROM (SELECT DISTINCT season FROM community_builds ORDER BY season)").s, 'community_builds.season']
    ];
    return { md: L.table(['Metric', 'Value', 'Table'], rows), rows: rows.length };
  }
};

const by_mastery = {
  src: SRC,
  fn() {
    const r = all(`SELECT class_name, mastery_name, count(*) n, group_concat(DISTINCT playstyle) ps
                   FROM v_build_summary GROUP BY class_name, mastery_name ORDER BY class_name, mastery_name`);
    const rows = r.map((x) => [x.class_name, x.mastery_name, x.n, x.ps]);
    return { md: L.table(['Class', 'Mastery', 'Builds', 'Playstyles'], rows, ['l', 'l', 'r', 'l']), rows: rows.length };
  }
};

const tiers = {
  src: SRC,
  fn() {
    const rows = [];
    for (const [col, label] of [['tier_corruption', 'Corruption'], ['tier_speed', 'Speed'], ['tier_bossing', 'Bossing']]) {
      const m = {};
      for (const x of all(`SELECT coalesce(${col}, '-') t, count(*) n FROM v_build_summary GROUP BY 1`)) m[x.t] = x.n;
      rows.push([label, m.S || 0, m.A || 0, m.B || 0, m.C || 0, m['-'] || 0]);
    }
    return { md: L.table(['Tier list', 'S', 'A', 'B', 'C', 'no tier (leveling guides)'], rows, ['l', 'r', 'r', 'r', 'r', 'r']), rows: rows.length };
  }
};

const builds = {
  src: SRC,
  fn() {
    const r = all(`SELECT title, slug, class_name, mastery_name, main_skill, tier_corruption, tier_speed, tier_bossing, playstyle, updated_at
                   FROM v_build_summary ORDER BY class_name, mastery_name, main_skill, slug`);
    const rows = r.map((x, i) => [i + 1, x.title, x.class_name + ' / ' + x.mastery_name, x.main_skill || '-',
      [x.tier_corruption, x.tier_speed, x.tier_bossing].map((t) => t || '-').join('/'), x.playstyle || '', '`' + x.slug + '`']);
    return { md: L.table(['#', 'Title', 'Class / mastery', 'Main skill', 'Tiers C/S/B', 'Playstyle', 'Slug'], rows), rows: rows.length };
  }
};

module.exports = { counts, by_mastery, tiers, builds };

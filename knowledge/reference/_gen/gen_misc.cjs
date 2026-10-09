// Generators for skills-and-trees.md and endgame-systems.md
const L = require('./lib.cjs');
const { game, data, table, fmt, tagNames } = L;
const out = {};
const trees = () => Object.values(game('trees'));
const abilities = () => Object.values(game('abilities'));

const AT_MEANING = {
  None: 'no tag', Physical: 'damage type', Lightning: 'damage type', Cold: 'damage type', Fire: 'damage type', Void: 'damage type', Necrotic: 'damage type', Poison: 'damage type',
  Elemental: 'subset rule: matches Fire, Cold and Lightning damage (Elemental rule in stat matching)', Spell: 'skill/damage is a spell', Melee: 'melee attack', Throwing: 'throwing attack', Bow: 'bow attack',
  DoT: 'damage over time (cannot crit, not a hit)', Minion: 'minion-owned stat/damage', Totem: 'totem-owned stat/damage', PetResisted: 'minion damage-taken reduction group (hidden base mod -60% damage taken for Minion+PetResisted)',
  Potion: 'potion', Buff: 'buff skill', Channelling: 'channelled skill', Transform: 'transform (shapeshift) skill', LowLife: 'condition: low life', HighLife: 'condition: high life', FullLife: 'condition: full life',
  Hit: 'hit event', Curse: 'curse', Ailment: 'ailment damage',
  Crit_deprecated: 'deprecated', Kill_deprecated: 'deprecated', Die_deprecated: 'deprecated'
};
out.at_tags = {
  src: 'stat_tag_enums.json (AT)',
  fn() {
    const rows = data('stat_tag_enums').AT.values.map(v => [v.id, v.name, AT_MEANING[v.name] || '']);
    return { rows: rows.length, md: table(['AT bit value', 'Tag', 'Meaning (A for names/values; meaning from G / vendored research text)'], rows) };
  }
};

out.small_enums = {
  src: 'stat_tag_enums.json (ETag, ModType, DamageType, NodeStatApplication, NodeStatScaling, HitEventTag, SpecificityType, MinionOrSituationTag, Attribute)',
  fn() {
    const e = data('stat_tag_enums'); const rows = [];
    for (const k of ['ETag', 'ModType', 'DamageType', 'HitEventTag', 'NodeStatApplication', 'NodeStatScaling', 'SpecificityType', 'MinionOrSituationTag', 'Attribute', 'ResistanceStatType'])
      rows.push([k, e[k].flags ? 'flags (bitmask)' : 'enum', e[k].values.map(v => `${v.id} ${v.name}`).join(', ')]);
    return { rows: rows.length, md: table(['Enum', 'Kind', 'Values (id name)'], rows) };
  }
};

out.tree_overview = {
  src: 'trees.json',
  fn() {
    const T = trees(); const rows = [];
    const k = {}; for (const t of T) k[t.kind] = k[t.kind] || { n: 0, nodes: 0, pts: 0 };
    for (const t of T) { const o = k[t.kind]; o.n++; o.nodes += t.nodes.length; o.pts += t.nodes.reduce((a, n) => a + n.maxPoints, 0); }
    for (const [kind, o] of Object.entries(k)) rows.push([kind, o.n, o.nodes, o.pts]);
    return { rows: rows.length, md: table(['Tree kind', 'Trees', 'Nodes (all trees)', 'Sum of maxPoints (all nodes)'], rows) };
  }
};

out.node_stats = {
  src: 'trees.json (nodes[].maxPoints, noScalingType, requiredMastery, masteryRequirement, abilityGrantedByNode)',
  fn() {
    const T = trees(); const rows = [];
    for (const kind of ['skill', 'passive', 'weaver']) {
      const nodes = T.filter(t => t.kind === kind).flatMap(t => t.nodes);
      const mp = {}; for (const n of nodes) mp[n.maxPoints] = (mp[n.maxPoints] || 0) + 1;
      const ns = {}; for (const n of nodes) ns[n.noScalingType] = (ns[n.noScalingType] || 0) + 1;
      rows.push([kind, nodes.length, Object.keys(mp).map(Number).sort((a, b) => a - b).map(x => `${x}:${mp[x]}`).join(' '), Object.entries(ns).map(([a, b]) => `${a}:${b}`).join(' '), nodes.filter(n => n.abilityGrantedByNode).length]);
    }
    return { rows: rows.length, md: table(['Tree kind', 'Nodes', 'maxPoints distribution (maxPoints:count)', 'noScalingType distribution (0 SinglePoint, 1 PointThreshold, null absent)', 'Nodes with abilityGrantedByNode'], rows) };
  }
};

out.skill_tree_sizes = {
  src: 'trees.json (kind = skill)',
  fn() {
    const S = trees().filter(t => t.kind === 'skill'); const sz = S.map(t => t.nodes.length);
    const mp = S.map(t => t.nodes.reduce((a, n) => a + n.maxPoints, 0));
    const rows = [['skill trees (GTD)', S.length], ['nodes per tree min / max', Math.min(...sz) + ' / ' + Math.max(...sz)], ['sum of maxPoints per tree min / max', Math.min(...mp) + ' / ' + Math.max(...mp)], ['trees with a root node requiring 0 points', S.filter(t => t.nodes.some(n => n.requirements.length === 0 || n.requirements.every(r => r.requirement === 0))).length]];
    return { rows: rows.length, md: table(['Metric', 'Value'], rows) };
  }
};

out.passive_thresholds = {
  src: 'trees.json (kind = passive; nodes[].mastery, requiredMastery, masteryRequirement)',
  fn() {
    const P = trees().filter(t => t.kind === 'passive'); const rows = [];
    for (const p of P) {
      const cls = p.classes[0];
      const byM = {}; for (const n of p.nodes) { (byM[n.mastery] = byM[n.mastery] || []).push(n); }
      for (const m of Object.keys(byM)) {
        const ns = byM[m]; const reqs = {}; for (const n of ns) reqs[n.masteryRequirement] = (reqs[n.masteryRequirement] || 0) + 1;
        rows.push([p.treeID, cls.className, m, cls.masteries[m], ns.length, ns.reduce((a, n) => a + n.maxPoints, 0), Object.keys(reqs).map(Number).sort((a, b) => a - b).map(x => `${x}:${reqs[x]}`).join(' ')]);
      }
    }
    return { rows: rows.length, md: table(['treeID', 'Class', 'Panel (mastery idx)', 'Panel name', 'Nodes', 'Sum of node maxPoints', 'masteryRequirement distribution (points-in-tree threshold:node count)'], rows) };
  }
};

out.weaver_nodes = {
  src: 'trees.json (kind = weaver), weaver_node_effects.json',
  fn() {
    const w = trees().find(t => t.kind === 'weaver'); const rows = [];
    const clean = (s) => (s || '').replace(/\{|\}/g, '').replace(/\s+/g, ' ').trim();
    for (const n of w.nodes.slice().sort((a, b) => a.id - b.id)) {
      if (n.id === 0) continue;
      const req = n.requirements.map(r => `${r.nodeID}${r.requirement > 1 ? 'x' + r.requirement : ''}`).join(',');
      rows.push([n.id, n.displayName, n.maxPoints, req, clean(n.description).slice(0, 170)]);
    }
    return { rows: rows.length, md: table(['nodeID', 'Node', 'maxPoints', 'Requires nodeIDs (x N points if >1)', 'Description (truncated to 170 chars)'], rows) };
  }
};

out.ability_categories = {
  src: 'abilities.json',
  fn() {
    const A = abilities(); const c = {};
    for (const a of A) c[a.category] = (c[a.category] || 0) + 1;
    const ss = {}; for (const a of A.filter(x => x.category === 'player')) ss[a.speedScalerName || 'none'] = (ss[a.speedScalerName || 'none'] || 0) + 1;
    const rows = Object.entries(c).map(([k, v]) => [k, v]);
    return { rows: rows.length, md: table(['Ability category', 'Records'], rows) + '\n\nPlayer abilities by `speedScalerName`: ' + Object.entries(ss).map(([k, v]) => k + ' ' + v).join(', ') + '.' };
  }
};

out.ability_examples = {
  src: 'abilities.json (category = player; playerAbilityID fi9, sm87r4, vo54, javeli, mush9, dig5, fs3e3, sw43, ra1an)',
  fn() {
    const pids = ['fi9', 'sm87r4', 'vo54', 'javeli', 'mush9', 'dig5', 'fs3e3', 'sw43', 'ra1an', 'dr4sl', 'su3lem'];
    const rows = pids.map(n => {
      const a = abilities().find(x => x.playerAbilityID === n && x.category === 'player'); if (!a) return [n, '(not found)'];
      const p = a.primaryDamage; const dmg = p ? Object.entries(p.damageByType || {}).map(([k, v]) => `${k} ${v}`).join('+') : '';
      return [a.name, (a.tagNames || []).join(','), a.speedScalerName, fmt(a.useDelay), fmt(a.useDuration), fmt(a.manaCost), a.chargesGainedPerSecond ? fmt(1 / a.chargesGainedPerSecond) : '', dmg || '(damage not in asset)', p ? fmt(p.addedDamageScaling) : '', p ? fmt(p.critChance) : '',
        (a.attributeScaling || []).map(s => ['Str', 'Vit', 'Int', 'Dex', 'Att'][s.attribute] + ' inc ' + fmt((s.stats[0] || {}).increasedValue)).join('; '), (a.skillTreeConversionDamageTagNames || []).join(',')];
    });
    return { rows: rows.length, md: table(['Skill', 'tags', 'speedScaler', 'useDelay', 'useDuration', 'manaCost', 'cooldown s', 'Base damage (primaryDamage)', 'ADE addedDamageScaling', 'critChance', 'attributeScaling', 'skillTreeConversionDamageTags'], rows) };
  }
};

// ----- endgame -----
out.timelines = {
  src: 'monster_mods.json (timelines[], formulas)',
  fn() {
    const m = game('monster_mods'); const rows = [];
    for (const t of m.timelines) {
      if (t.timelineID === 99) continue;
      const n = t.difficulties[0], e = t.difficulties[1];
      rows.push([t.timelineID, t.displayName, n.level, n.minimumCorruption + '-' + n.maximumCorruption, n.additionalCorruptionEffect + ' (+1 level per ' + n.corruptionRequiredPerLevel + ' corruption)', n.maxStability, e.level, e.minimumCorruption + '+ (no max)', e.additionalCorruptionEffect, e.maxStability, t.mods.length]);
    }
    return { rows: rows.length, md: table(['timelineID', 'Timeline', 'Normal area level', 'Normal corruption min-max', 'Normal corruption effect', 'Normal maxStability', 'Empowered area level', 'Empowered corruption', 'Empowered corruption effect', 'Empowered maxStability', 'Monolith mods listed'], rows) };
  }
};

out.monster_mod_counts = {
  src: 'monster_mods.json (data[].modType)',
  fn() {
    const m = game('monster_mods'); const names = ['Prefix', 'Suffix', 'Monolith', 'Dungeon', 'EventActor', 'TimeBeast']; const c = {};
    for (const x of m.data) c[x.modType] = (c[x.modType] || 0) + 1;
    const rows = Object.keys(c).map(k => [k, names[k], c[k]]); rows.push(['', '**StatsMonsterMod total**', m.data.length], ['', 'otherMonsterMods', m.otherMonsterMods.length]);
    return { rows: rows.length, md: table(['modType index', 'modType name (schema order)', 'Records'], rows) };
  }
};

out.corruption_curve = {
  src: 'monster_mods.json (formulas.corruption, formulas.statScale); computed',
  fn() {
    const f = (c) => c <= 100 ? 0.6 * c : 0.002 * Math.pow(c, 1.52) + 1.055 * c - 47.692955;
    const cs = [0, 10, 25, 50, 100, 150, 200, 300, 400, 500];
    const rows = cs.map(c => [c, fmt(f(c)), fmt(f(c) - 1), fmt(f(c)) + '%', fmt(f(c) / 2) + '%']);
    return { rows: rows.length, md: table(['Corruption c', 'f(c)', 'effect = f(c) - 1', 'Health MORE and Hit-damage MORE if scaled as 0.01 x (1+effect) = 0.01 x f(c)', 'DoT-damage MORE if 0.005 x f(c)'], rows) };
  }
};

// ----- uniques that cannot drop randomly (endgame-systems.md) -----
// Sources are taken ONLY from prose already on the knowledge pages (endgame-systems and uniques-sets-legendary templates);
// anything else is "not in data". Absence here does not mean the item cannot be obtained.
const _U = () => game('uniques').data;
const _items = () => game('items').data;
const _bname = (id) => { const b = _items().find(x => x.baseTypeID === id); return b ? (b.displayName || b.name) : String(id); };
const _nm = (u) => u.displayName || u.name;
const _NODROP_ALIASES = {
  'Fragments of the Shattered Lance': /Fragments or Shard of the Shattered Lance/,
  'Shard of the Shattered Lance': /Fragments or Shard of the Shattered Lance/,
  "Gaspar's Acuity": /Gaspar's Acuity or Will/,
  "Gaspar's Will": /Gaspar's Acuity or Will/,
  'Peak of the Mountain': /Peak, Foot, Face and Core of the Mountain/,
  'Foot of the Mountain': /Peak, Foot, Face and Core of the Mountain/,
  'Face of the Mountain': /Peak, Foot, Face and Core of the Mountain/,
  'Core of the Mountain': /Peak, Foot, Face and Core of the Mountain/
};
out.nodrop_uniques = {
  src: 'uniques.json (canDropRandomly = false; baseTypeName, levelRequirement, subTypes) and the prose of endgame-systems.md.tpl / uniques-sets-legendary.md.tpl for sources',
  fn() {
    const fs = require('fs'); const path = require('path');
    const norm = (s) => String(s).replace(/[‘’]/g, "'");
    const pages = [['endgame-systems.md', 'endgame-systems.md.tpl'], ['uniques-sets-legendary.md', 'uniques-sets-legendary.md.tpl']];
    const texts = pages.map(([page, f]) => ({ page, lines: norm(fs.readFileSync(path.join(__dirname, 'tpl', f), 'utf8')).split(/\r?\n/) }));
    const ctx = (name) => {
      for (const { page, lines } of texts) {
        let heading = '', hdr = null;
        for (let i = 0; i < lines.length; i++) {
          const ln = lines[i];
          if (/^#{2,3} /.test(ln)) heading = ln.replace(/^#+ /, '').replace(/\s*\(.*$/, '').replace(/`/g, '');
          if (ln.startsWith('|') && /^\|[-| :]+\|\s*$/.test(lines[i + 1] || '')) hdr = ln.split('|').slice(1, -1).map(c => c.trim());
          if (/\{\{gen:/.test(ln)) continue;
          if (/^Omens, imprints/.test(heading)) continue; // rebalance notes, not sources
          const alias = _NODROP_ALIASES[name];
          const hit = alias ? alias.test(ln) : ln.includes(name);
          if (!hit) continue;
          if (alias === undefined && !new RegExp("(^|[^A-Za-z])" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\module.exports = out;') + "([^A-Za-z]|$)").test(ln)) continue;
          if (ln.startsWith('|') && hdr) {
            const cells = ln.split('|').slice(1, -1).map(c => c.trim());
            const col = cells.findIndex(c => (alias ? alias.test(c) : c.includes(name)));
            if (col < 0) continue;
            const lead = /^\d+$/.test(cells[0]) ? `${hdr[0]} ${cells[0]} ${cells[1]}` : cells[0];
            const seg = cells[col];
            const emp = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\module.exports = out;') + "[^;,]*\\(Emp").test(seg) ? ', Empowered timeline only' : '';
            return `${page}, ${heading}: ${lead}, column "${hdr[col]}"${emp}`;
          }
          const at = alias ? Math.max(0, ln.search(alias)) : ln.indexOf(name);
          const snip = ln.slice(Math.max(0, at - 40), at + name.length + 40).replace(/\|/g, '/').trim();
          return `${page}, ${heading}: "...${snip}..."`;
        }
      }
      return null;
    };
    // uniques.drop_source / unique_drop_sources of data/le.sqlite (built from itemDB.monsterItemDrops etc.); needs yarn db:build
    const Database = require(path.join(L.ROOT, 'node_modules/better-sqlite3'));
    const dbp = process.env.LE_DB_PATH || path.join(L.ROOT, 'data/le.sqlite');
    if (!fs.existsSync(dbp)) throw new Error('data/le.sqlite not found; run yarn db:build first (' + dbp + ')');
    const sdb = new Database(dbp, { readonly: true });
    const dsrc = new Map(sdb.prepare('SELECT unique_id, drop_source FROM uniques').all().map(r => [r.unique_id, r.drop_source]));
    sdb.close();
    const dbSrc = (id) => !dsrc.has(id) ? '(not loaded in the database)' : (dsrc.get(id) === null ? 'none (NULL)' : dsrc.get(id));
    const itemsJ = _items();
    const lvl = (u) => { if (u.levelRequirement !== null && u.levelRequirement !== undefined && u.levelRequirement > 0) return String(u.levelRequirement); const b = itemsJ.find(x => x.baseTypeID === u.baseType); const s = b && (b.subItems || []).find(x => x.subTypeID === (u.subTypes || [])[0]); return s ? s.levelRequirement + ' (sub type)' : ''; };
    const rows = _U().filter(u => !u.canDropRandomly).sort((a, b) => (a.baseType - b.baseType) || (a.uniqueID - b.uniqueID))
      .map(u => { const c = ctx(_nm(u)); return [u.uniqueID, _nm(u), _bname(u.baseType), lvl(u), dbSrc(u.uniqueID), c ? c : 'not in data']; });
    return { rows: rows.length, md: table(['uniqueID', 'Unique', 'Slot (base type)', 'Level requirement', 'Database drop source (`uniques.drop_source`)', 'Source named on a knowledge page (else "not in data")'], rows) };
  }
};
module.exports = out;

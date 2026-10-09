// Generators for knowledge/reference/idols-and-blessings.md
const L = require('./lib.cjs');
const { game, table, fmt, tagNames } = L;
const out = {};
const items = () => game('items').data;
const affixes = () => game('affixes').data;
const base = (id) => items().find(b => b.baseTypeID === id);

out.idol_bases = {
  src: 'items.json (baseTypeID 25-33, 41), idols.json',
  fn() {
    const rows = [];
    for (let id = 25; id <= 33; id++) {
      const b = base(id); const subs = b.subItems;
      const cls = subs.filter(s => (s.classRequirement || []).length).length;
      const omen = subs.filter(s => s.affixEffectiveness === 'OmenIdol').length;
      const nd = subs.filter(s => s.cannotDrop).length;
      rows.push([id, b.typeName, b.displayName || b.name, b.gridSize.join('x'), fmt(b.affixEffectModifier), b.maximumAffixes, b.minimumDropLevel, subs.length, cls, omen, nd]);
    }
    return { rows: rows.length, md: table(['baseTypeID', 'Enum', 'Name', 'Grid WxH', 'AEM (affixEffectModifier)', 'Max affixes', 'minimumDropLevel', 'Subtypes', 'class-locked subtypes', 'Omen Idol subtypes', 'cannotDrop subtypes'], rows) };
  }
};

out.idol_subtypes = {
  src: 'items.json (subItems of baseTypeID 25-33)',
  fn() {
    const rows = [];
    for (let id = 25; id <= 33; id++) {
      const b = base(id);
      const groups = { universal: [], class: {}, heretical: [], omen: [], other: [] };
      for (const s of b.subItems) {
        const n = s.displayName || s.name; const cls = (s.classRequirement || [])[0];
        const flags = (s.cannotDrop ? ' [cannotDrop]' : '');
        if (s.affixEffectiveness === 'OmenIdol') groups.omen.push(`${n} (${cls})`);
        else if (/^Heretical/.test(n)) groups.heretical.push(`${n} (${cls})`);
        else if (cls) (groups.class[cls] = groups.class[cls] || []).push(n);
        else if (/Weaver|Orobyss|Silver|Volcano|Discarded|Ash/.test(n)) groups.other.push(n + flags);
        else groups.universal.push(n + flags);
      }
      const parts = [];
      if (groups.universal.length) parts.push('Universal: ' + groups.universal.join(', '));
      for (const c of Object.keys(groups.class)) parts.push(c + ': ' + groups.class[c].join(', '));
      if (groups.heretical.length) parts.push('Heretical (cannotDrop in table): ' + groups.heretical.join(', '));
      if (groups.omen.length) parts.push('Omen Idol (AEM override): ' + groups.omen.join(', '));
      if (groups.other.length) parts.push('Special: ' + groups.other.join(', '));
      rows.push([id, b.displayName || b.name, parts.join(' ; ')]);
    }
    return { rows: rows.length, md: table(['baseTypeID', 'Base', 'Subtypes'], rows) };
  }
};

out.idol_affix_counts = {
  src: 'affixes.json (rollsOn = Idols; canRollOn contains baseTypeID)',
  fn() {
    const idol = affixes().filter(x => x.rollsOn === 'Idols'); const rows = [];
    for (let id = 25; id <= 33; id++) {
      const s = idol.filter(x => x.canRollOn.includes(id)); const c = {};
      for (const x of s) { const k = x.specialAffixType + ':' + x.type[0]; c[k] = (c[k] || 0) + 1; }
      const g = (k) => c[k] || 0;
      const sm = {}; for (const x of s) { const k = x.standardAffixEffectModifier; sm[k] = (sm[k] || 0) + 1; }
      const stdTxt = Object.keys(sm).sort((p, q) => q - p).map(k => k + ' x' + sm[k]).join(', ');
      rows.push([id, base(id).displayName || base(id).name, s.length, g('Standard:P'), g('Standard:S'), g('IdolWeaver:P') + g('IdolWeaver:S'), g('IdolEnchantment:S'), g('Corrupted:P'), g('FakeUniqueMod:P'), stdTxt]);
    }
    return { rows: rows.length, md: table(['baseTypeID', 'Base', 'Idol affixes that can roll', 'Standard prefix', 'Standard suffix', 'IdolWeaver (weaver idols)', 'IdolEnchantment (suffix, enchanting)', 'Corrupted prefix', 'FakeUniqueMod', 'Affix standard effect modifier (`standardAffixEffectModifier` x count)'], rows) };
  }
};

out.idol_affix_totals = {
  src: 'affixes.json (rollsOn = Idols), idols.json (idolAffixIds)',
  fn() {
    const idol = affixes().filter(x => x.rollsOn === 'Idols'); const c = {};
    for (const x of idol) { const k = `${x.specialAffixType}|${x.type}`; c[k] = (c[k] || 0) + 1; }
    const rows = Object.entries(c).map(([k, v]) => k.split('|').concat([v]));
    rows.push(['**Total**', '', idol.length], ['idols.json idolAffixIds length', '', game('idols').idolAffixIds.length]);
    const cls = {}; for (const x of idol.filter(y => y.specialAffixType === 'Standard')) { const k = x.displayCategory; cls[k] = (cls[k] || 0) + 1; }
    return { rows: rows.length, md: table(['specialAffixType', 'type', 'Count'], rows) + '\n\nStandard idol affixes by `displayCategory` (A): ' + Object.entries(cls).map(([k, v]) => k + ' ' + v).join(', ') + '.' };
  }
};

out.altars = {
  src: 'items.json (baseTypeID 41 subItems), idols.json (containerGrids.data), global_player_properties.json (idolAltarProperties)',
  fn() {
    const alt = base(41); const grids = game('idols').containerGrids.data; const props = game('global_player_properties').data.idolAltarProperties;
    const rows = alt.subItems.map(s => {
      const g = grids[s.subTypeID]; let open = 0, refr = 0; const per = {};
      for (const col of g) for (const v of col) { if (v === 99) continue; open++; if (v >= 100) refr++; }
      const imp = s.implicits[0]; if (!imp) return [s.subTypeID, s.displayName || s.name, s.levelRequirement, open, refr, '(no implicit)', ''];
      const p = props.find(x => x.index === imp.tags);
      const val = imp.value === imp.maxValue ? fmt(imp.value) : `${fmt(imp.value)}..${fmt(imp.maxValue)}`;
      return [s.subTypeID, s.displayName || s.name, s.levelRequirement, open, refr, `${imp.propertyName}[${imp.tags}] ${p ? p.name : ''}`, val];
    });
    return { rows: rows.length, md: table(['altar subTypeID', 'Altar', 'Level req', 'Usable cells (not 99)', 'of which refracted (>= 100)', 'Implicit (IdolAltarProperty index, name)', 'Implicit value range'], rows) };
  }
};

out.altar_grids = {
  src: 'idols.json (containerGrids.defaultData, containerGrids.data); base 41 subtype names from items.json',
  fn() {
    const g = game('idols').containerGrids; const alt = base(41).subItems;
    // screen orientation per 07a section 8.1: screen cell (row y, col x) = m[x][y]
    const line = (m) => { const rows = []; for (let y = 0; y < 5; y++) { const r = []; for (let x = 0; x < 5; x++) r.push(m[x][y]); rows.push(r.join(',')); } return rows.join(' / '); };
    const rows = [['-', 'default (no altar)', line(g.defaultData)]];
    for (let i = 0; i < g.data.length; i++) rows.push([i, alt[i].name, line(g.data[i])]);
    const cnt = {}; for (const col of g.defaultData) for (const v of col) cnt[v] = (cnt[v] || 0) + 1;
    const unlock = Object.keys(cnt).map(Number).filter(v => v < 99).sort((a, b) => a - b).map(v => `${v}: ${cnt[v]}`).join(', ');
    return { rows: rows.length, md: table(['altar subTypeID', 'Altar', 'Grid, screen rows top to bottom separated by " / " (99 blocked; 1-8 unlocked by idol-slot reward N; +100 refracted slot)'], rows) + '\n\nDefault grid cells per unlock number N (A): ' + unlock + '; blocked (99): ' + cnt[99] + '.' };
  }
};

out.altar_affixes = {
  src: 'affixes.json (canRollOn contains 41), global_player_properties.json (idolAltarProperties)',
  fn() {
    const props = game('global_player_properties').data.idolAltarProperties;
    const rows = affixes().filter(x => x.canRollOn.includes(41)).map(x => {
      const pr = x.properties.map(p => { const q = props.find(y => y.index === p.tags); return `${p.tags}${q ? ' ' + q.name : ''}`; }).join(' + ');
      const t = x.tiers[x.tiers.length - 1]; const t1 = x.tiers[0];
      return [x.affixId, x.name.replace(/^Idol Altar /, ''), x.specialAffixType, x.type[0], pr, `T1 ${JSON.stringify(t1.rolls[0])}`, `T${t.tier} ${JSON.stringify(t.rolls[0])}`];
    });
    return { rows: rows.length, md: table(['affixId', 'Affix', 'specialAffixType', 'P/S', 'IdolAltarProperty index and name', 'Tier 1 roll [min,max]', 'Top tier roll [min,max]'], rows) };
  }
};

out.altar_property_list = {
  src: 'global_player_properties.json (idolAltarProperties[31])',
  fn() {
    const props = game('global_player_properties').data.idolAltarProperties;
    const rows = props.map(p => [p.index, p.name]);
    return { rows: rows.length, md: table(['IdolAltarProperty index', 'Name'], rows) };
  }
};

// ---------------- blessings ----------------
const B = () => game('blessings');
function impl(b) {
  const i = b.implicits[0]; if (!i) return '';
  const tn = (i.tagNames && i.tagNames.length) ? `[${i.tagNames.join('+')}]` : '';
  let s = `${i.propertyName}${tn}`;
  if (i.dropRateItemType) s += `(${i.dropRateItemType})`;
  else if (i.propertyName === 'IncreasedDropRate') s += `(specialTag ${i.specialTag}, tags ${i.tags})`;
  s += ` ${i.modType === 'INCREASED' ? 'inc' : (i.modType === 'MORE' ? 'more' : 'add')}`;
  return s;
}
const rng = (b) => { const i = b.implicits[0]; return i.value === i.maxValue ? fmt(i.value) : `${fmt(i.value)} - ${fmt(i.maxValue)}`; };

out.blessing_summary = {
  src: 'blessings.json (timelines[], data[])',
  fn() {
    const rows = B().timelines.filter(t => t.timelineID !== 99).map(t => {
      const n = t.difficulties[0], e = t.difficulties[1];
      return [t.timelineID, t.displayName, n.level, e.level, n.firstSlotBlessings.length, n.otherSlotBlessings.length, n.anySlotBlessings.length, t.pairs.length, t.pairs.length * 2];
    });
    const tot = rows.reduce((a, r) => a + r[7], 0);
    rows.push(['', '**Total pairs**', '', '', '', '', '', tot, tot * 2]);
    return { rows: rows.length, md: table(['timelineID', 'Timeline', 'Normal level', 'Empowered level', 'first-slot pool (normal)', 'other-slot pool (normal)', 'any-slot pool (normal)', 'Normal/Grand pairs', 'Blessing subtypes (pairs x2)'], rows) };
  }
};

out.blessing_tables = {
  src: 'blessings.json (timelines[].pairs, data[] implicits, timelines[].difficulties slot pools)',
  fn() {
    const d = B().data; let md = ''; let n = 0;
    for (const t of B().timelines.filter(t => t.timelineID !== 99)) {
      const n0 = t.difficulties[0];
      const slotOf = (id) => n0.firstSlotBlessings.includes(id) ? 'first' : (n0.otherSlotBlessings.includes(id) ? 'other' : (n0.anySlotBlessings.includes(id) ? 'any' : '?'));
      md += `\n#### Timeline ${t.timelineID}: ${t.displayName} (normal level ${n0.level}, empowered level ${t.difficulties[1].level})\n\n`;
      const rows = t.pairs.map(p => {
        const nb = d.find(x => x.blessingId === p.normal), gb = d.find(x => x.blessingId === p.grand); n += 2;
        return [p.name, nb.blessingId, gb.name, gb.blessingId, slotOf(p.normal), impl(nb), rng(nb), rng(gb), nb.cannotDrop ? 'cannotDrop' : '', gb.cannotDrop ? 'cannotDrop' : ''];
      });
      md += table(['Normal blessing', 'id', 'Grand (empowered) blessing', 'id', 'Pool', 'Stat', 'Normal roll range', 'Grand roll range', 'Normal flag', 'Grand flag'], rows) + '\n';
    }
    return { rows: n, md };
  }
};
module.exports = out;

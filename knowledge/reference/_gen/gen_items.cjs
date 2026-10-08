// Generators for knowledge/reference/item-system.md
const L = require('./lib.cjs');
const { game, table, CLASS, fmt, esc } = L;
const out = {};
const items = () => game('items');
const affixes = () => game('affixes').data;

const SLOT = {
  0: 'Helmet', 1: 'Body Armor', 2: 'Belt', 3: 'Boots', 4: 'Gloves',
  5: 'Weapon (1H; off-hand if dual-wield)', 6: 'Weapon (1H; off-hand if dual-wield)', 7: 'Weapon (1H; off-hand if dual-wield)',
  8: 'Weapon (1H; off-hand if dual-wield)', 9: 'Weapon (1H; off-hand if dual-wield)', 10: 'Weapon (1H; off-hand if dual-wield)', 11: 'Weapon (1H) - disabled',
  12: 'Weapon (2H)', 13: 'Weapon (2H)', 14: 'Weapon (2H)', 15: 'Weapon (2H)', 16: 'Weapon (2H)',
  17: 'Off-hand', 18: 'Off-hand', 19: 'Off-hand', 20: 'Amulet', 21: 'Ring (x2)', 22: 'Relic', 23: 'Weapon (bow)', 24: 'Weapon - disabled',
  25: 'Idol grid', 26: 'Idol grid', 27: 'Idol grid', 28: 'Idol grid', 29: 'Idol grid', 30: 'Idol grid', 31: 'Idol grid', 32: 'Idol grid', 33: 'Idol grid',
  34: 'Blessing (not equipment)', 35: 'obsolete lens', 36: 'obsolete lens', 37: 'obsolete lens', 38: 'obsolete lens', 39: 'obsolete lens', 40: 'unused', 41: 'Idol Altar (above idol grid)'
};

out.base_types = {
  src: 'items.json (data[], equipmentTypeEnum, disabledBaseTypesToRoll); slot column = X/G (gear walkthrough)',
  fn() {
    const d = items(); const rows = [];
    const enumv = d.equipmentTypeEnum;
    for (let id = 0; id <= 41; id++) {
      const b = d.data.find(x => x.baseTypeID === id);
      if (!b) { rows.push([id, enumv[id] || '', '(no record: id ' + id + ' = ' + (enumv[id] || '?') + ')', SLOT[id] || '', '', '', '', '', '', '', '']); continue; }
      const lv = b.subItems.map(s => s.levelRequirement);
      rows.push([id, b.typeName, (b.displayName || b.name), SLOT[id] || '', b.maximumAffixes, fmt(b.affixEffectModifier), b.gridSize.join('x'), (b.classAffinity || []).join(',') || '-', b.subItems.length, lv.length ? Math.max(...lv) : '', b.minimumDropLevel]);
    }
    return { rows: rows.length, md: table(['baseTypeID', 'Enum', 'Name', 'Slot', 'Max affixes', 'affixEffectModifier (AEM)', 'Inventory grid WxH', 'classAffinity', 'Subtypes', 'Max subtype level req', 'minimumDropLevel'], rows) };
  }
};

out.nonequip = {
  src: 'items.json (nonEquippable, globals)',
  fn() {
    const d = items(); const rows = d.nonEquippable.map(n => `${n.baseTypeID} ${n.name} (${n.subItemCount})`);
    return { rows: rows.length, md: 'Non-equippable base types, id name (subtype count): ' + rows.join('; ') + '.' };
  }
};


out.affix_composition = {
  src: 'affixes.json',
  fn() {
    const a = affixes(); const cnt = {};
    for (const x of a) { const k = `${x.specialAffixType}|${x.rollsOn}`; cnt[k] = cnt[k] || { P: 0, S: 0, tiers: new Set(), lv: [] }; cnt[k][x.type === 'PREFIX' ? 'P' : 'S']++; cnt[k].tiers.add(x.tiers.length); cnt[k].lv.push(x.levelRequirement); }
    const rows = Object.entries(cnt).map(([k, v]) => { const [t, r] = k.split('|'); return [t, r, v.P, v.S, v.P + v.S, [...v.tiers].sort().join('/'), Math.min(...v.lv) + '-' + Math.max(...v.lv)]; });
    rows.sort((x, y) => y[4] - x[4]);
    rows.push(['**Total**', '', a.filter(x => x.type === 'PREFIX').length, a.filter(x => x.type === 'SUFFIX').length, a.length, '', '']);
    return { rows: rows.length, md: table(['specialAffixType', 'rollsOn', 'Prefix', 'Suffix', 'Total', 'tiers[] length', 'levelRequirement range'], rows) };
  }
};

out.affix_groups = {
  src: 'affixes.json',
  fn() {
    const a = affixes(); const g = {}, dc = {};
    for (const x of a) { g[x.group] = (g[x.group] || 0) + 1; dc[x.displayCategory] = (dc[x.displayCategory] || 0) + 1; }
    const r1 = Object.entries(g).sort((x, y) => y[1] - x[1]).map(([k, v]) => [k, v]);
    const r2 = Object.entries(dc).sort((x, y) => y[1] - x[1]).map(([k, v]) => [k, v]);
    return { rows: r1.length + r2.length, md: table(['group', 'Affix count'], r1) + '\n\n`displayCategory` counts (A): ' + r2.map(r => r[0] + ' ' + r[1]).join(', ') + '.' };
  }
};

out.aem = {
  src: 'affixes.json (standardAffixEffectModifier), items.json (affixEffectModifier)',
  fn() {
    const a = affixes(); const c = {};
    for (const x of a) c[x.standardAffixEffectModifier] = (c[x.standardAffixEffectModifier] || 0) + 1;
    const d = items(); const byAem = {};
    for (const b of d.data) { if (b.affixEffectModifier === undefined || b.maximumAffixes === 0) continue; (byAem[b.affixEffectModifier] = byAem[b.affixEffectModifier] || []).push(b.displayName || b.name); }
    const keys = [...new Set([...Object.keys(c), ...Object.keys(byAem)])].map(Number).sort((x, y) => x - y);
    const rows = keys.map(k => [k, c[k] || 0, (byAem[k] || []).join(', ')]);
    return { rows: rows.length, md: table(['AEM value', 'Affixes with standardAffixEffectModifier = value', 'Base types with affixEffectModifier = value'], rows) };
  }
};

out.aem_vectors = {
  src: 'computed with formula from affixes.json valueModel (A); affix tiers from affixes.json',
  fn() {
    const a = affixes();
    const R = (x) => { const r = Math.round(x); return (Math.abs(x % 1) === 0.5 && r % 2 !== 0) ? r - 1 : r; };
    const scale = { Hundredth: 100, Integer: 1, Tenth: 10, Thousandth: 1000 };
    function val(aff, tier, j, aem, roll) {
      const std = aff.standardAffixEffectModifier; const m = aem === std ? 0 : (1 + aem) / (1 + std) - 1;
      const [mn, mx] = aff.tiers.find(t => t.tier === tier).rolls[j]; const s = scale[aff.properties[j].rounding];
      const lo = R(mn * (1 + m) * s), hi = R(mx * (1 + m) * s);
      return { m, v: Math.min(Math.floor((hi - lo + 1) * roll / 255 + lo), hi) / s, lo: lo / s, hi: hi / s };
    }
    const find = (id) => a.find(x => x.affixId === id);
    const cases = [[25, 5, 0, 'Helmet (AEM 0)'], [25, 5, 0.5, 'Body Armor (AEM 0.5)'], [63, 8, 2.2, 'Two-Handed Axe (AEM 2.2)'], [63, 8, 0.75, 'One-Handed Axe (AEM 0.75)']];
    const rows = [];
    for (const [id, tier, aem, label] of cases) {
      const aff = find(id); if (!aff) continue;
      const [mn, mx] = aff.tiers.find(t => t.tier === tier).rolls[0];
      const r0 = val(aff, tier, 0, aem, 0), r255 = val(aff, tier, 0, aem, 255);
      rows.push([`${aff.name} (affixId ${id})`, `T${tier} [${mn}, ${mx}]`, fmt(aff.standardAffixEffectModifier), label, fmt(r0.m), `${fmt(r0.lo)} - ${fmt(r255.hi)}`, fmt(r0.v), fmt(r255.v)]);
    }
    return { rows: rows.length, md: table(['Affix', 'Tier range (base)', 'standardAffixEffectModifier', 'Item base', 'm', 'Effective [lo, hi] after rounding', 'Value at roll byte 0', 'Value at roll byte 255'], rows) };
  }
};

out.tier_example = {
  src: 'affixes.json (affixId 25 Added Health, affixId 0 Void Penetration)',
  fn() {
    const a = affixes(); const rows = [];
    for (const id of [25, 0]) { const x = a.find(y => y.affixId === id); rows.push([`${x.name} (${id})`, ...x.tiers.map(t => `${t.rolls[0][0]}-${t.rolls[0][1]}`)]); }
    return { rows: rows.length, md: table(['Affix', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8 (Primordial)'], rows) };
  }
};

out.experimental = {
  src: 'affixes.json (specialAffixType = Experimental)',
  fn() {
    const rows = affixes().filter(x => x.specialAffixType === 'Experimental').map(x => [x.affixId, x.name, x.type, x.canRollOnNames.join(','), x.tiers.length, x.levelRequirement]);
    return { rows: rows.length, md: table(['affixId', 'Name', 'Type', 'canRollOn', 'Tiers', 'levelRequirement'], rows) };
  }
};

out.personal = {
  src: 'affixes.json (specialAffixType = Personal)',
  fn() {
    const rows = affixes().filter(x => x.specialAffixType === 'Personal' && !/Champion/.test(x.title || x.name)).map(x => [x.affixId, x.title || x.name, x.type, x.canRollOnNames.join(','), x.tiers.length, x.levelRequirement, x.properties.map(p => p.propertyName).join('+')]);
    return { rows: rows.length, md: table(['affixId', 'Title', 'Type', 'canRollOn', 'Tiers', 'levelRequirement', 'Stat properties'], rows) };
  }
};

out.corrupted_affixes = {
  src: 'affixes.json (specialAffixType = Corrupted)',
  fn() {
    const a = affixes().filter(x => x.specialAffixType === 'Corrupted' && x.rollsOn === 'Equipment');
    const by = {};
    for (const x of a) { (by[x.name] = by[x.name] || new Set()); for (const n of x.canRollOnNames) by[x.name].add(n); }
    const short = (n) => n.replace('TWO_HANDED_', '2H_').replace('ONE_HANDED_', '1H_').replace('BODY_ARMOR', 'BODY').replace('SCEPTRE', 'SCEPTRE');
    const parts = Object.entries(by).map(([k, v]) => `${k} [${[...v].map(short).join(',')}]`);
    return { rows: parts.length, md: 'Corrupted equipment affixes (distinct names, each with the item enums it can roll on; ' + a.length + ' affix records): ' + parts.join('; ') + '.' };
  }
};

out.class_affixes = {
  src: 'affixes.json (classSpecificity)',
  fn() {
    const a = affixes().filter(x => x.rollsOn === 'Equipment' && x.specialAffixType === 'Standard');
    const c = {};
    for (const x of a) { const k = x.classSpecificity.join('+') || '(none)'; c[k] = (c[k] || 0) + 1; }
    const rows = Object.entries(c).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${v}`);
    return { rows: rows.length, md: '`classSpecificity` of Standard equipment affixes (value count): ' + rows.join('; ') + '.' };
  }
};

out.t6_compat = {
  src: 'affixes.json (t6Compatibility)',
  fn() {
    const a = affixes().filter(x => x.t6Compatibility !== 'Normal');
    const rows = a.map(x => [x.affixId, x.name, x.type, x.t6Compatibility, x.maximumAffixEffectModifierForT6, x.canRollOnNames.join(',')]);
    return { rows: rows.length, md: table(['affixId', 'Name', 'Type', 't6Compatibility', 'maximumAffixEffectModifierForT6', 'canRollOn'], rows) };
  }
};

out.corrupted_subtypes = {
  src: 'items.json (subItems[].isCorruptedSubtype = 1)',
  fn() {
    const d = items(); const rows = [];
    for (const b of d.data) for (const s of b.subItems) if (s.isCorruptedSubtype) {
      rows.push([b.baseTypeID, b.displayName || b.name, s.subTypeID, s.displayName || s.name, s.levelRequirement, (s.classRequirement || []).join(',') || '-',
        s.implicits.map(i => `${i.propertyName}${i.tagNames && i.tagNames.length ? '[' + i.tagNames.join(',') + ']' : ''} ${i.modType[0]} ${fmt(i.value)}${i.maxValue !== i.value ? '..' + fmt(i.maxValue) : ''}`).join('; ')]);
    }
    return { rows: rows.length, md: table(['baseTypeID', 'Base', 'subTypeID', 'Subtype', 'Level req', 'Class', 'Implicits (A=added I=increased M=more; value..max)'], rows) };
  }
};

out.subtype_flags = {
  src: 'items.json (subItems flags)',
  fn() {
    const d = items(); const f = { total: 0, cannotDrop: 0, isCorruptedSubtype: 0, isLegacySubType: 0, obsoleteItem: 0, classLocked: 0, OmenIdol: 0 };
    for (const b of d.data) for (const s of b.subItems) { f.total++; if (s.cannotDrop) f.cannotDrop++; if (s.isCorruptedSubtype) f.isCorruptedSubtype++; if (s.isLegacySubType) f.isLegacySubType++; if (s.obsoleteItem) f.obsoleteItem++; if ((s.classRequirement || []).length) f.classLocked++; if (s.affixEffectiveness === 'OmenIdol') f.OmenIdol++; }
    const rows = Object.entries(f).map(([k, v]) => `${k} ${v}`);
    return { rows: rows.length, md: 'Subtype counts over all base types (incl. idols/lenses): ' + rows.join(', ') + '.' };
  }
};

out.weapon_attack_rate = {
  src: 'items.json (subItems[].attackRate)',
  fn() {
    const d = items(); const rows = [];
    for (const b of d.data) { const r = b.subItems.filter(s => s.attackRate !== undefined).map(s => s.attackRate); if (r.length) rows.push([b.baseTypeID, b.displayName || b.name, r.length, Math.min(...r), Math.max(...r)]); }
    return { rows: rows.length, md: table(['baseTypeID', 'Weapon base', 'Subtypes with attackRate', 'min attackRate', 'max attackRate'], rows) };
  }
};
module.exports = out;

// Generators for knowledge/reference/uniques-sets-legendary.md
const L = require('./lib.cjs');
const { game, table, fmt } = L;
const out = {};
const U = () => game('uniques').data;
const items = () => game('items').data;
const bname = (id) => { const b = items().find(x => x.baseTypeID === id); return b ? (b.displayName || b.name) : String(id); };
const nm = (u) => u.displayName || u.name;

out.uniques_per_base = {
  src: 'uniques.json (baseType, isSetItem, isPrimordialItem, isCocoonedItem, legendaryType, canDropRandomly, hideFromPlayers)',
  fn() {
    const by = {};
    for (const u of U()) {
      const k = u.baseType; by[k] = by[k] || { t: 0, set: 0, prim: 0, coc: 0, ww: 0, lp: 0, nodrop: 0, hidden: 0, pre: 0 };
      const o = by[k]; o.t++; if (u.isSetItem) o.set++; if (u.isPrimordialItem) o.prim++; if (u.isCocoonedItem) o.coc++; if (u.legendaryType === 'WeaversWill') o.ww++; else o.lp++;
      if (!u.canDropRandomly) o.nodrop++; if (u.hideFromPlayers) o.hidden++; if (u.isPreCorrupted) o.pre++;
    }
    const keys = Object.keys(by).map(Number).sort((a, b) => a - b);
    const sum = { t: 0, set: 0, prim: 0, coc: 0, ww: 0, lp: 0, nodrop: 0, hidden: 0, pre: 0 };
    const rows = keys.map(k => { const o = by[k]; for (const f in sum) sum[f] += o[f]; return [k, bname(k), o.t, o.set, o.prim, o.coc, o.lp, o.ww, o.nodrop, o.hidden, o.pre]; });
    rows.push(['', '**Total**', sum.t, sum.set, sum.prim, sum.coc, sum.lp, sum.ww, sum.nodrop, sum.hidden, sum.pre]);
    return { rows: rows.length, md: table(['baseType', 'Base type', 'Uniques', 'of which set items', 'primordial', 'cocooned', 'legendaryType=LegendaryPotential', 'legendaryType=WeaversWill', 'canDropRandomly=false', 'hideFromPlayers', 'isPreCorrupted'], rows, [null, null, 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r']) };
  }
};

out.sets = {
  src: 'sets.json (setID, setName, items[], bonuses[], tooltipDescriptions[])',
  fn() {
    const rows = game('sets').data.map(s => {
      const items_ = s.items.map(i => i.name).join(', ');
      const bon = s.tooltipDescriptions.slice().sort((a, b) => a.setRequirement - b.setRequirement).map(t => `(${t.setRequirement}) ${t.description}`).join(' ; ');
      return [s.setID, s.setName, s.items.length, items_, bon];
    });
    return { rows: rows.length, md: table(['setID', 'Set', 'Pieces', 'Items', 'Bonuses: (pieces required) tooltip text'], rows) };
  }
};

out.ww_uniques = {
  src: 'uniques.json (legendaryType = WeaversWill)',
  fn() {
    const rows = U().filter(u => u.legendaryType === 'WeaversWill').map(u => [u.uniqueID, nm(u), bname(u.baseType), u.levelRequirement === null ? '' : u.levelRequirement, u.canDropRandomly ? 'yes' : 'no', u.mods.length]);
    return { rows: rows.length, md: table(['uniqueID', 'Unique', 'Base type', 'levelRequirement override', 'canDropRandomly', 'mods'], rows) };
  }
};

out.primordial = {
  src: 'uniques.json (isPrimordialItem, primordialCosts)',
  fn() {
    const rows = U().filter(u => u.isPrimordialItem).map(u => {
      const c = u.primordialCosts || {};
      return [u.uniqueID, nm(u), bname(u.baseType), u.levelRequirement === null ? '' : u.levelRequirement, c.ancientBoneCost || '', c.primordialFangCost || '', c.primordialHornCost || '', c.primordialFeatherCost || '', c.primordialPetalCost || '', c.crystallisedHeartCost || '', u.canDropRandomly ? 'yes' : 'no', u.effectiveLevelForLegendaryPotential === null ? '' : u.effectiveLevelForLegendaryPotential];
    });
    return { rows: rows.length, md: table(['uniqueID', 'Unique', 'Base type', 'Lvl req', 'Ancient Bone', 'Primordial Fang', 'Primordial Horn', 'Primordial Feather', 'Primordial Petal', 'Crystallized Heart', 'canDropRandomly', 'LP effective level'], rows) };
  }
};

out.lp_effective_levels = {
  src: 'uniques.json (overrideEffectiveLevelForLegendaryPotential, effectiveLevelForLegendaryPotential)',
  fn() {
    const c = {}; let none = 0;
    for (const u of U()) { if (u.legendaryType !== 'LegendaryPotential') continue; if (u.overrideEffectiveLevelForLegendaryPotential) c[u.effectiveLevelForLegendaryPotential] = (c[u.effectiveLevelForLegendaryPotential] || 0) + 1; else none++; }
    const rows = Object.keys(c).map(Number).sort((a, b) => a - b).map(k => `${k}: ${c[k]}`);
    return { rows: rows.length + 1, md: 'Effective level for Legendary Potential (override level: number of LP uniques): ' + rows.join(', ') + '; no override: ' + none + '.' };
  }
};

out.cocooned = {
  src: 'uniques.json (isCocoonedItem)',
  fn() {
    const rows = U().filter(u => u.isCocoonedItem).map(u => `${u.uniqueID} ${nm(u)}`);
    return { rows: rows.length, md: 'Cocooned uniques (uniqueID name; all have 0 mods in data): ' + rows.join('; ') + '.' };
  }
};

out.special_flag_uniques = {
  src: 'uniques.json (isPreCorrupted, dropsSpecificLegendaryAffixes, unifiedType, hideFromPlayers, droppableLegendaryAffixCount)',
  fn() {
    const rows = [];
    for (const u of U()) {
      const f = [];
      if (u.isPreCorrupted) f.push('isPreCorrupted (preCorruptPositiveChance ' + u.preCorruptPositiveChance + ')');
      if (u.dropsSpecificLegendaryAffixes) f.push(`dropsSpecificLegendaryAffixes (${u.droppableLegendaryAffixes.length} affixIds, count ${u.droppableLegendaryAffixCount})`);
      if (u.unifiedType) f.push('unifiedType=' + u.unifiedType);
      if (u.hideFromPlayers) f.push('hideFromPlayers');
      if (u.additionalRandomLegendaryAffixes) f.push('additionalRandomLegendaryAffixes=' + u.additionalRandomLegendaryAffixes);
      if (u.excludeSpecificAffixesFromPrefixSuffixLimits) f.push('excludeSpecificAffixesFromPrefixSuffixLimits');
      if (u.droppableLegendaryAffixCount === 2 && !u.dropsSpecificLegendaryAffixes) f.push('droppableLegendaryAffixCount=2');
      if (f.length) rows.push([u.uniqueID, nm(u), bname(u.baseType), f.join('; ')]);
    }
    return { rows: rows.length, md: table(['uniqueID', 'Unique', 'Base type', 'Flags'], rows) };
  }
};

out.unique_mod_example = {
  src: 'uniques.json (uniqueID 5 Isadora\'s Revenge)',
  fn() {
    const u = U().find(x => x.uniqueID === 5);
    const rows = u.mods.map(m => [m.rollID, m.propertyName, m.specialTag, m.tags + ' ' + (m.tagNames || []).join('+'), m.modType, m.rounding, m.canRoll, fmt(m.value), fmt(m.maxValue), m.hideInTooltip]);
    return { rows: rows.length, md: table(['rollID', 'property', 'specialTag', 'tags', 'modType', 'rounding', 'canRoll', 'value (min)', 'maxValue', 'hideInTooltip'], rows) + '\n\n`tooltipDescriptions[0].description` = `' + u.tooltipDescriptions[0].description + '` (bracket form `[min,max,rollID]`).' };
  }
};

out.mod_stats = {
  src: 'uniques.json (mods[], tooltipDescriptions[])',
  fn() {
    let mods = 0, rollable = 0, hidden = 0, desc = 0, withAlt = 0, setReq = 0, rid = {};
    for (const u of U()) { for (const m of u.mods) { mods++; if (m.canRoll && m.maxValue > m.value) rollable++; if (m.hideInTooltip) hidden++; rid[m.rollID] = (rid[m.rollID] || 0) + 1; } for (const t of u.tooltipDescriptions) { desc++; if (t.altText) withAlt++; if (t.setRequirement) setReq++; } }
    const rows = [['uniques', U().length], ['mods (all uniques)', mods], ['mods with a roll range (canRoll and maxValue > value)', rollable], ['mods with hideInTooltip=1 (shown only through tooltipDescriptions text)', hidden], ['tooltipDescriptions entries', desc], ['... with altText', withAlt], ['... with setRequirement > 0', setReq], ['distinct rollID values used', Object.keys(rid).sort().join(',')]];
    return { rows: rows.length, md: table(['Metric', 'Value'], rows) };
  }
};
module.exports = out;

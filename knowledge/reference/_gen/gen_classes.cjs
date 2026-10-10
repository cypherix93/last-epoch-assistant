// Generators for knowledge/reference/classes-and-masteries.md
const L = require('./lib.cjs');
const { game, table, CLASS, fmt, esc } = L;
const out = {};

const classes = () => game('classes').data;
const abilities = () => Object.values(game('abilities'));
const trees = () => Object.values(game('trees'));

function abilityByPid(pid) { return abilities().find(a => a.playerAbilityID === pid && a.category === 'player'); }
function skillTreeNodes(pid) { const t = trees().find(x => x.kind === 'skill' && x.treeID === pid); return t ? t.nodes.length : ''; }

out.classes_overview = {
  src: 'classes.json',
  fn() {
    const rows = classes().map(c => {
      const p = c.passiveTree; const n = p.nodesPerMastery;
      return [c.classID, c.className, c.treeID, p.name, p.version, p.nodeCount, `${n[0]}/${n[1]}/${n[2]}/${n[3]}`,
        `Str ${c.base.baseStrength} / Vit ${c.base.baseVitality} / Int ${c.base.baseIntelligence} / Dex ${c.base.baseDexterity} / Att ${c.base.baseAttunement}`,
        c.masteries.slice(1).map(m => `${m.masteryIndex} ${m.name}`).join(', '), c.basicAttackReplacer.name];
    });
    return { rows: rows.length, md: table(['classID', 'Class', 'treeID', 'Tree name (GTD)', 'Tree version', 'Passive nodes', 'Nodes base/m1/m2/m3', 'Starting attributes', 'Masteries (index name)', 'Basic attack replacer'], rows) };
  }
};

out.base_stats = {
  src: 'classes.json (levelMods)',
  fn() {
    const c = classes()[0];
    const lm = c.levelMods.filter(m => !['Strength', 'Vitality', 'Intelligence', 'Dexterity', 'Attunement'].includes(m.propertyName));
    const rows = lm.map(m => {
      const v = (lv) => m.base + lv * m.perLevel;
      return [m.property, m.propertyName + (m.tagNames ? ` [${m.tagNames.join(',')}]` : ''), m.modType, fmt(m.base), fmt(m.perLevel), fmt(v(1)), fmt(v(50)), fmt(v(100))];
    });
    return { rows: rows.length, md: table(['SP', 'Stat', 'ModType', 'Base', 'Per level', 'L1', 'L50', 'L100'], rows, [null, null, null, 'r', 'r', 'r', 'r', 'r']) };
  }
};

out.class_diff = {
  src: 'classes.json (base)',
  fn() {
    const keys = Object.keys(classes()[0].base);
    const diff = keys.filter(k => new Set(classes().map(c => c.base[k])).size > 1);
    const rows = classes().map(c => [c.classID, c.className, ...diff.map(k => c.base[k])]);
    return { rows: rows.length, md: table(['classID', 'Class', ...diff], rows), diff };
  }
};

out.minion_hidden = {
  src: 'classes.json (minionScaling, hiddenBaseMods)',
  fn() {
    const d = game('classes');
    const ms = classes()[0].minionScaling;
    const rows1 = [['firstLevelForMinionScaling', ms.firstLevelForMinionScaling], ['moreMinionDamagePerLevel', ms.moreMinionDamagePerLevel], ['lessMinionDamageTakenPerLevel', ms.lessMinionDamageTakenPerLevel]];
    const rows2 = d.hiddenBaseMods.map(m => [m.property, m.propertyName, m.modType, m.value, (m.tagNames || []).join('+') || (m.tags || ''), m.source]);
    return { rows: rows1.length + rows2.length, md: table(['Minion scaling field', 'Value'], rows1) + '\n\n' + table(['SP', 'Hidden base mod', 'ModType', 'Value', 'Tags', 'Code source'], rows2) };
  }
};

function renderStat(s) {
  const st = s.stat; const f = (x) => (x && x.flat !== undefined) ? x.flat : '';
  if (st.kind === 'player_property') return `PlayerProperty ${st.playerPropertyIndex} "${st.playerPropertyName}" +${f(st.value)}`;
  if (st.kind === 'ability_property') return `AbilityProperty ${st.abilityID}[${st.abilityPropertyIndex}] +${f(st.value)}`;
  if (st.kind === 'conditional_more_damage') return `Conditional more damage (${st.condition}) +${f(st.value)}`;
  const val = st.added || st.increased || st.more || st.value;
  const mt = st.kind === 'added' ? 'added' : (st.kind === 'increased' ? 'inc' : (st.kind === 'more' ? 'more' : st.kind));
  const tag = st.tags && st.tags !== 'None' ? ` [${st.tags}]` : '';
  if (st.abilityID) return `Ability ${st.abilityID}[${st.abilityPropertyIndex}] ${mt} +${f(val)}`;
  return `${st.property}${tag} ${mt} ${f(val)}${s.target && s.target !== 'CharacterMutator.stats' ? ' (' + s.target.replace('CharacterMutator.', '') + ')' : ''}`;
}

out.mastery_bonuses = {
  src: 'passive_node_effects.json (mastery_bonuses), classes.json (masteries)',
  fn() {
    const pe = Object.values(game('passive_node_effects'));
    const rows = [];
    for (const c of classes()) {
      const t = pe.find(x => x.masteries[0] === c.className || x.masteries[0] === c.passiveTree.name);
      for (const m of c.masteries.slice(1)) {
        const b = t.mastery_bonuses[String(m.masteryIndex)];
        const fields = Object.entries(b.fields).map(([k, v]) => `${k.replace('CharacterMutator.', '')}=${v}`);
        const stats = b.stats.map(renderStat);
        rows.push([c.classID, c.className, m.masteryIndex, m.name, m.localizationKey, m.passiveNodes, m.masteryAbility ? `${m.masteryAbility.name} (${m.masteryAbility.playerAbilityID})` : '', [...stats, ...fields].join('; ')]);
      }
    }
    return { rows: rows.length, md: table(['classID', 'Class', 'Mastery idx', 'Mastery', 'Loc key', 'Mastery-panel nodes', 'Mastery skill (granted on choosing mastery)', 'Mastery base bonuses (code-derived; raw field names)'], rows) };
  }
};

out.skills = {
  src: 'classes.json (defaultAbilities/unlockableAbilities/masteries[].abilities), abilities.json, trees.json',
  fn() {
    const NEW = { ra1an: 1, su3lem: 1, dr4sl: 1 };
    const all = [];
    const push = (c, src, name, pid, unlock) => all.push({ c, src, name, pid, unlock, a: abilityByPid(pid) });
    for (const c of classes()) {
      for (const a of c.defaultAbilities) if (a.name && a.name !== 'Attack' && a.name !== 'Evade') push(c, 'start', a.name, a.playerAbilityID, 'Known at start (slot 1)');
      for (const a of c.unlockableAbilities) push(c, 'class', a.name, a.playerAbilityID, `Character level ${a.level}`);
      for (const m of c.masteries) {
        if (m.masteryIndex === 0) { for (const a of m.abilities) push(c, 'base tree', a.name, a.playerAbilityID, `${a.level} passive points in base ${c.className} tree`); }
        else {
          if (m.masteryAbility) push(c, m.name, m.masteryAbility.name, m.masteryAbility.playerAbilityID, `Choosing mastery ${m.name}`);
          for (const a of m.abilities) push(c, m.name, a.name, a.playerAbilityID, `${a.level} passive points in ${m.name} tree`);
        }
      }
    }
    const rows = all.map(s => {
      const a = s.a || {};
      return [s.c.className, s.src, s.name + (NEW[s.pid] ? ' **(S5 new)**' : ''), s.pid, s.unlock, (a.tagNames || []).join(','), a.manaCost === undefined ? '' : fmt(a.manaCost), a.chargesGainedPerSecond ? fmt(1 / a.chargesGainedPerSecond) + 's' : '', skillTreeNodes(s.pid)];
    });
    return { rows: rows.length, md: table(['Class', 'Source / mastery', 'Skill', 'playerAbilityID', 'Unlock', 'Tags', 'Mana cost', 'Cooldown (1/chargesGainedPerSecond)', 'Skill-tree nodes'], rows) };
  }
};

out.skill_counts = {
  src: 'classes.json',
  fn() {
    const rows = classes().map(c => {
      const start = c.defaultAbilities.filter(a => a.name && a.name !== 'Attack' && a.name !== 'Evade').length;
      const un = c.unlockableAbilities.length;
      const base = c.masteries[0].abilities.length;
      const per = c.masteries.slice(1).map(m => (m.masteryAbility ? 1 : 0) + m.abilities.length);
      return [c.classID, c.className, start, un, base, per.join('/'), start + un + base + per.reduce((a, b) => a + b, 0)];
    });
    const tot = rows.reduce((a, r) => a + r[6], 0);
    rows.push(['', '**Total**', '', '', '', '', tot]);
    return { rows: rows.length, md: table(['classID', 'Class', 'Start skill', 'Character-level unlocks', 'Base-tree unlocks', 'Skills per mastery m1/m2/m3 (mastery skill + 4)', 'Total class skills'], rows) };
  }
};

out.starting_items = {
  src: 'classes.json (startingItems), items.json',
  fn() {
    const it = game('items').data;
    const rows = classes().map(c => [c.classID, c.className, c.startingItems.map(s => {
      const b = it.find(x => x.baseTypeID === s.baseType); const sub = b.subItems.find(x => x.subTypeID === s.subtype);
      return `${b.displayName || b.name}: ${sub ? (sub.displayName || sub.name) : '?'}`;
    }).join('; ')]);
    return { rows: rows.length, md: table(['classID', 'Class', 'Starting equipment (base type: subtype)'], rows) };
  }
};
module.exports = out;

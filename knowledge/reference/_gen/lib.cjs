// Shared helpers for kb-ref table generators.
const path = require('path');
const fs = require('fs');
// Repo root: env KB_ROOT, else two levels above knowledge/reference/_gen when run from the repo, else the kb-ref worktree.
const _repo = path.resolve(__dirname, '../../..');
const ROOT = process.env.KB_ROOT || (fs.existsSync(path.join(_repo, 'vendor')) ? _repo : 'D:/src/last-epoch-assistant.wt/kb-ref');
const GAME = path.join(ROOT, 'vendor/lastepochbuilder/research/data/game');
const DATA = path.join(ROOT, 'vendor/lastepochbuilder/research/data');
const _c = {};
function game(n) { return _c['g' + n] || (_c['g' + n] = JSON.parse(fs.readFileSync(path.join(GAME, n + '.json'), 'utf8'))); }
function data(n) { return _c['d' + n] || (_c['d' + n] = JSON.parse(fs.readFileSync(path.join(DATA, n + '.json'), 'utf8'))); }
function esc(s) { return String(s === undefined || s === null ? '' : s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' '); }
function table(headers, rows, aligns) {
  const h = '| ' + headers.map(esc).join(' | ') + ' |';
  const s = '|' + headers.map((_, i) => (aligns && aligns[i] === 'r') ? '---:' : '---').join('|') + '|';
  return [h, s, ...rows.map(r => '| ' + r.map(esc).join(' | ') + ' |')].join('\n');
}
const CLASS = { 0: 'Primalist', 1: 'Mage', 2: 'Sentinel', 3: 'Acolyte', 4: 'Rogue' };
const AT = {}; for (const v of data('stat_tag_enums').AT.values) AT[v.id] = v.name;
function tagNames(mask) { const o = []; for (const k of Object.keys(AT)) { const v = +k; if (v && (mask & v) === v) o.push(AT[k]); } return o; }
const SP = {}; const SPN = {}; for (const v of data('sp_enum')) { SP[v.id] = v.name; SPN[v.name] = v.id; }
const fmt = (n) => { if (n === null || n === undefined) return ''; if (typeof n !== 'number') return String(n); return String(Math.round(n * 10000) / 10000); };
module.exports = { ROOT, GAME, DATA, game, data, esc, table, CLASS, AT, tagNames, SP, SPN, fmt };

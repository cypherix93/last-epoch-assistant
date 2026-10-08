// Acceptance check: template sections, summary length, Sources paths exist, line counts.
const fs = require('fs');
const path = require('path');
const ROOT = process.env.KB_ROOT || 'D:/src/last-epoch-assistant.wt/kb-ref';
const dir = path.join(ROOT, 'knowledge/reference');
const pages = ['classes-and-masteries', 'item-system', 'uniques-sets-legendary', 'idols-and-blessings', 'crafting', 'skills-and-trees', 'endgame-systems', 'glossary'];
let bad = 0;
for (const p of pages) {
  const f = path.join(dir, p + '.md');
  if (!fs.existsSync(f)) { console.log('MISSING', p); bad++; continue; }
  const t = fs.readFileSync(f, 'utf8'); const lines = t.split('\n');
  const need = ['> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.', '> Labels:', '## Summary', '## Pitfalls', '## Sources'];
  for (const n of need) if (!t.includes(n)) { console.log(p, 'missing', n); bad++; }
  if (!/^# /.test(t)) { console.log(p, 'no title'); bad++; }
  // summary length
  const si = lines.findIndex(l => l.startsWith('## Summary')); let sj = lines.findIndex((l, i) => i > si && l.startsWith('## '));
  const sum = lines.slice(si + 1, sj).filter(l => l.trim());
  // sources
  const ti = lines.findIndex(l => l.startsWith('## Sources'));
  const src = lines.slice(ti + 1).join('\n');
  const toks = [...src.matchAll(/`([^`]+)`/g)].map(m => m[1]).filter(x => /\.(md|txt|json)$/.test(x));
  let missing = [];
  for (const tk of toks) {
    const abs = /^[A-Za-z]:\\/.test(tk) ? tk : path.join(ROOT, tk);
    if (!fs.existsSync(abs)) missing.push(tk);
  }
  console.log(p.padEnd(26), 'lines', String(lines.length - 1).padStart(4), 'summaryLines', sum.length, 'sourcePaths', toks.length, 'missing', missing.length, missing.join(' | '));
  if (lines.length - 1 > 400 || lines.length - 1 < 100) { console.log('  LINE COUNT OUT OF RANGE'); bad++; }
  if (sum.length > 10) { console.log('  SUMMARY > 10 lines'); bad++; }
  if (missing.length) bad++;
  if (/[\u{1F300}-\u{1FAFF}]/u.test(t)) { console.log('  EMOJI'); bad++; }
}
console.log(bad ? 'PROBLEMS: ' + bad : 'ALL OK');

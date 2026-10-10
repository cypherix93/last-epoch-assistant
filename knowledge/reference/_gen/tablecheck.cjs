// Checks that every markdown table row has the same column count as its header (escaped pipes ignored).
const fs = require('fs');
const path = require('path');
const dir = process.argv[2] || 'D:/src/last-epoch-assistant.wt/kb-ref/knowledge/reference';
let total = 0;
for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.md'))) {
  const lines = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
  const cols = (l) => (l.replace(/\\\|/g, '').match(/\|/g) || []).length - 1;
  let bad = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('|') && i + 1 < lines.length && /^\|[-: |]+\|$/.test(lines[i + 1])) {
      const n = cols(lines[i]); let j = i + 2;
      while (j < lines.length && lines[j].startsWith('|')) { if (cols(lines[j]) !== n) { bad++; console.log(f, j + 1, 'cols', cols(lines[j]), 'expected', n, lines[j].slice(0, 90)); } j++; }
      i = j;
    }
  }
  console.log(f, 'bad rows', bad); total += bad;
}
console.log(total ? 'TABLE PROBLEMS ' + total : 'TABLES OK');

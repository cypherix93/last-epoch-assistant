// Extracts tool-call examples and SQL blocks from .claude/skills/**/*.md and runs them against data/le.sqlite.
// Usage (from the repo root): yarn skills:check [--verbose]
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const R = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..").split(String.fromCharCode(92)).join("/");
const { TOOL_DEFS, runTool } = await import("file:///" + R + "/packages/mcp/src/server.ts");
const { createContext } = await import("file:///" + R + "/packages/mcp/src/context.ts");
const { z } = await import("file:///" + R + "/node_modules/zod/index.js");
const ctx = createContext();
const defs: Record<string, any> = Object.fromEntries(TOOL_DEFS.map((d: any) => [d.name, d]));
const verbose = process.argv.includes("--verbose");
const BS = String.fromCharCode(92), CRLF = String.fromCharCode(13, 10), FENCE = "`".repeat(3);
function walk(d: string, o: string[] = []) { for (const e of readdirSync(d)) { const p = join(d, e); statSync(p).isDirectory() ? walk(p, o) : e.endsWith(".md") && o.push(p); } return o; }
const files = walk(R + "/.claude/skills");
let total = 0, ok = 0, bad = 0, ph = 0;
function count(res: any) {
  for (const k of ["rows", "results", "nodes", "pages", "tables", "builds", "items"]) if (Array.isArray(res[k])) return `${k}=${res[k].length}` + (res.total_matching !== undefined ? ` total=${res.total_matching}` : "");
  return "keys=" + Object.keys(res).slice(1, 5).join(",");
}
const isPlaceholder = (src: string, sql: boolean) => (/<[A-Za-z][A-Za-z_ -]*>/.test(src) && !/<b>/.test(src)) || (!sql && src.includes("..."));
function exec(file: string, line: number, tool: string, args: any, src: string, sql = false, expectZero = false) {
  total++;
  if (isPlaceholder(src, sql)) { ph++; console.log(`PLACEHOLDER ${file}:${line} ${tool}`); return; }
  const d = defs[tool];
  if (!d) { bad++; console.log(`BAD ${file}:${line} unknown tool ${tool}`); return; }
  const p = z.object(d.shape).strict().safeParse(args);
  if (!p.success) { bad++; console.log(`BAD ${file}:${line} ${tool} args: ${p.error.issues.map((i: any) => i.path.join(".") + " " + i.message).join("; ")}`); return; }
  const res: any = runTool(ctx, d, p.data);
  if (!res.ok) { bad++; console.log(`ERR ${file}:${line} ${tool} ${res.error}`); return; }
  const c = count(res);
  if (/=0$/.test(c) || /=0 /.test(c)) { if (expectZero) { ok++; if (verbose) console.log(`ok ${file}:${line} ${tool} ${c} (expected zero)`); return; } if (!/total=[1-9]/.test(c)) { bad++; console.log(`ZERO ${file}:${line} ${tool} ${c}`); return; } }
  ok++; if (verbose) console.log(`ok ${file}:${line} ${tool} ${c}`);
}
function tryJson(file: string, line: number, tool: string, text: string, src: string, sql = false, expectZero = false) {
  if (isPlaceholder(src, sql)) { total++; ph++; console.log(`PLACEHOLDER ${file}:${line} ${tool}`); return; }
  if (!sql && src.includes("?")) { console.log(`SIGNATURE ${file}:${line} ${src.slice(0, 60)}`); return; }
  let args: any;
  try { args = JSON.parse(text); } catch { total++; bad++; console.log(`BAD json ${file}:${line} ${src.slice(0, 90)}`); return; }
  exec(file, line, tool, args, src, sql, expectZero);
}
// a line carrying `expect-zero` (e.g. an HTML comment) may legitimately return an empty list
const EZ = /expect-zero/;
const TOOLS = "version|schema|search|get|lookup|find_mods|skill_tree|passive_tree|sql|knowledge|builds|build|item_usage|slot_meta";
for (const f of files) {
  const rel = relative(R + "/.claude/skills", f).split(BS).join("/");
  // strip a blockquote prefix so fenced examples inside "> " callouts are run too
  const lines = readFileSync(f, "utf8").split(CRLF).join("\n").split("\n").map((l) => l.replace(/^> ?/, ""));
  let inF = false, lang = "", buf: string[] = [], start = 0, prev = "";
  lines.forEach((ln, i) => {
    const m = /^```(\w*)/.exec(ln);
    if (m) {
      if (!inF) { inF = true; lang = m[1]; buf = []; start = i + 2; prev = lines[i - 1] ?? ""; continue_(); }
      else {
        inF = false;
        const body = buf.join("\n");
        if (lang === "sql") {
          const q: any = { query: body };
          const pm = /<!-- params: (.*) -->/.exec(prev);
          if (pm) q.params = JSON.parse(pm[1]);
          exec(rel, start, "sql", q, body, true);
        } else {
          for (let j = 0; j < buf.length; j++) {
            const b = buf[j];
            let mm = new RegExp("^\\s*(" + TOOLS + ")\\((\\{.*\\})\\)\\s*(?:[#-].*)?$").exec(b);
            if (mm) { tryJson(rel, start + j, mm[1], mm[2], b); continue; }
            mm = /yarn mcp:call (\w+) <<'JSON'/.exec(b);
            if (mm) { tryJson(rel, start + j, mm[1], buf[j + 1], buf[j + 1], true); continue; }
            mm = /printf '%s' '(\{.*\})' \| yarn mcp:call (\w+)/.exec(b);
            if (mm) { tryJson(rel, start + j, mm[2], mm[1], b); continue; }
            mm = /yarn mcp:call (\w+) '(\{.*\})'/.exec(b);
            if (mm) { tryJson(rel, start + j, mm[1], mm[2], b); continue; }
            if (new RegExp("^\\s*(" + TOOLS + ")\\(").test(b)) { total++; bad++; console.log(`BAD nonconforming call ${rel}:${start + j} ${b}`); }
          }
        }
      }
    } else if (inF) buf.push(ln);
    else {
      for (const mm of ln.matchAll(new RegExp("`((" + TOOLS + ")\\((\\{[^`]*\\})\\))`", "g"))) tryJson(rel, i + 1, mm[2], mm[3], mm[1], false, EZ.test(ln));
      for (const mm of ln.matchAll(new RegExp("`((?:" + TOOLS + ")\\((?!\\{)[^`]*\\))`", "g"))) console.log(`INLINE-SIG ${rel}:${i + 1} ${mm[1]}`);
      for (const mm of ln.matchAll(/yarn mcp:call (\w+) '(\{[^`]*?\})'/g)) tryJson(rel, i + 1, mm[1], mm[2], mm[0]);
    }
    function continue_() {}
  });
}
console.log(`\nTOTAL ${total}  OK ${ok}  BAD/ZERO ${bad}  PLACEHOLDER ${ph}`);

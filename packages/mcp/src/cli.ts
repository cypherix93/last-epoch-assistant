import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createServer } from "./server.js";

const USAGE = `usage:
  cli start                          run the le-data MCP server on stdio
  cli list                           list the server's tools (via an MCP client over stdio)
  cli call <tool> [args] [--pretty]  call a tool; ONLY the JSON result goes to stdout (single-line unless --pretty); logs go to stderr
  cli call sql --query-file <path>   run the SQL text in <path>

args for 'call' (first match wins):
  --query-file <path>   (sql only) raw SQL text from a file
  @path/to/args.json    JSON args read from a file (for sql, a file not starting with '{' is raw SQL)
  -                     read args from stdin
  '{"k":"v"}'           inline JSON (fine for simple args; the shell may mangle < > % & | and quotes)
  (omitted)             read stdin if it is piped (not a TTY), else {}
For the sql tool, stdin/file text that does not start with '{' is taken as raw SQL and wrapped as {"query": ...}.`;

function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

/** Read all of stdin. With idleMs, give up (return "") if nothing arrives in that time (guards inherited, never-closed pipes). */
function readStdin(idleMs?: number): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let timer: NodeJS.Timeout | undefined;
    const done = () => {
      if (timer) clearTimeout(timer);
      process.stdin.pause();
      resolve(Buffer.concat(chunks).toString("utf8"));
    };
    if (idleMs) timer = setTimeout(done, idleMs);
    process.stdin.on("data", (c: Buffer) => {
      chunks.push(c);
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    });
    process.stdin.on("end", done);
    process.stdin.on("error", done);
  });
}

/** Turn args text into the tool arguments object; raw SQL for the sql tool when it does not look like JSON. */
export function parseCallArgs(tool: string, text: string): Record<string, unknown> {
  const t = stripBom(text).trim();
  if (!t) return {};
  if (tool === "sql" && !t.startsWith("{")) return { query: t };
  try {
    const v = JSON.parse(t);
    if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error("args must be a JSON object");
    return v as Record<string, unknown>;
  } catch (e) {
    throw new Error(`Invalid JSON args: ${(e as Error).message}`);
  }
}

async function resolveCallArgs(tool: string, rest: string[]): Promise<Record<string, unknown>> {
  const qf = rest.indexOf("--query-file");
  if (qf >= 0) {
    const p = rest[qf + 1];
    if (!p) throw new Error("--query-file needs a path");
    if (tool !== "sql") throw new Error("--query-file only applies to the sql tool");
    return { query: stripBom(readFileSync(p, "utf8")).trim() };
  }
  const arg = rest[0];
  if (arg === undefined) return process.stdin.isTTY ? {} : parseCallArgs(tool, await readStdin(1500));
  if (arg === "-") return parseCallArgs(tool, await readStdin());
  if (arg.startsWith("@")) return parseCallArgs(tool, readFileSync(arg.slice(1), "utf8"));
  return parseCallArgs(tool, arg);
}

async function withClient<T>(fn: (c: Client) => Promise<T>): Promise<T> {
  // Spawn this same entry file (tsx or compiled) as the server, exactly as a real MCP client would.
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [...process.execArgv, fileURLToPath(import.meta.url), "start"],
    env: { ...(process.env as Record<string, string>) },
    stderr: "inherit",
  });
  const client = new Client({ name: "le-cli", version: "0.1.0" });
  await client.connect(transport);
  try {
    return await fn(client);
  } finally {
    await client.close();
  }
}

async function main(): Promise<number> {
  const [cmd, ...rawRest] = process.argv.slice(2);
  const pretty = rawRest.includes("--pretty");
  const rest = rawRest.filter((a) => a !== "--pretty");
  if (cmd === "start") {
    const server = createServer();
    await server.connect(new StdioServerTransport());
    return -1; // keep running
  }
  if (cmd === "list") {
    const tools = await withClient(async (c) => (await c.listTools()).tools);
    for (const t of tools) console.log(`${t.name}\t${(t.description ?? "").split(/(?<=\.)\s/)[0]}`);
    return 0;
  }
  if (cmd === "call") {
    const [tool, ...callRest] = rest;
    if (!tool) {
      console.error(USAGE);
      return 1;
    }
    let args: Record<string, unknown>;
    try {
      args = await resolveCallArgs(tool, callRest);
    } catch (e) {
      console.error((e as Error).message);
      return 1;
    }
    const res = await withClient((c) => c.callTool({ name: tool, arguments: args }));
    const content = (res.content as { type: string; text?: string }[] | undefined) ?? [];
    const body = content.map((p) => p.text ?? "").join("\n");
    let parsed: unknown = body;
    try {
      parsed = JSON.parse(body);
    } catch {
      /* plain text (e.g. protocol-level validation error) */
    }
    console.log(typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, pretty ? 2 : undefined));
    const ok = !res.isError && !(typeof parsed === "object" && parsed && (parsed as { ok?: boolean }).ok === false);
    return ok ? 0 : 1;
  }
  console.error(USAGE);
  return 1;
}

main().then(
  (code) => {
    if (code >= 0) process.exit(code);
  },
  (e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  },
);

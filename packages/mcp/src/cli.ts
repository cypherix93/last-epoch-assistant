import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fileURLToPath } from "node:url";
import { createServer } from "./server.js";

const USAGE = `usage:
  cli start                     run the le-data MCP server on stdio
  cli list                      list the server's tools (via an MCP client over stdio)
  cli call <tool> [jsonArgs]    call a tool and print the JSON result`;

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
  const [cmd, ...rest] = process.argv.slice(2);
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
    const [tool, json] = rest;
    if (!tool) {
      console.error(USAGE);
      return 1;
    }
    let args: Record<string, unknown> = {};
    if (json && json.trim()) {
      try {
        args = JSON.parse(json);
      } catch (e) {
        console.error(`Invalid JSON args: ${(e as Error).message}`);
        return 1;
      }
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
    console.log(typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2));
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

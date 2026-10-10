/** Rendering of the tool list for `cli list` (kept out of cli.ts so tests can import it without running main()). */

export interface ListedTool {
  name: string;
  description?: string;
  inputSchema?: unknown;
}

interface JsonSchema {
  type?: string | string[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  enum?: unknown[];
  description?: string;
  default?: unknown;
  minimum?: number;
  maximum?: number;
}

/** Compact type text: string, number, string[], string|number, {k?:type,...}, any. */
export function typeText(s: JsonSchema | undefined, depth = 0): string {
  if (!s) return "any";
  if (s.enum) return s.enum.map((v) => JSON.stringify(v)).join("|");
  const alts = s.anyOf ?? s.oneOf;
  if (alts) {
    const parts = [...new Set(alts.map((a) => typeText(a, depth)))];
    return parts.join("|");
  }
  const t = Array.isArray(s.type) ? s.type.join("|") : s.type;
  if (t === "array") return `${typeText(s.items, depth)}[]`.replace(/^(.*\|.*)\[\]$/, "($1)[]");
  if (t === "object" && s.properties) {
    if (depth >= 1) return "object";
    const req = new Set(s.required ?? []);
    return `{${Object.entries(s.properties)
      .map(([k, v]) => `${k}${req.has(k) ? "" : "?"}:${typeText(v, depth + 1)}`)
      .join(", ")}}`;
  }
  return t ?? "any";
}

/** One line per argument: `  name  type  required|optional[ (default X)]  description`. */
export function argLines(schema: unknown): string[] {
  const s = schema as JsonSchema | undefined;
  const props = s?.properties ?? {};
  const req = new Set(s?.required ?? []);
  return Object.entries(props).map(([name, p]) => {
    const required = req.has(name);
    const def = p.default !== undefined ? ` (default ${JSON.stringify(p.default)})` : "";
    const range = p.minimum !== undefined || p.maximum !== undefined ? ` [${p.minimum ?? ""}..${p.maximum ?? ""}]` : "";
    const desc = p.description ? `  ${p.description}` : "";
    return `    ${name}\t${typeText(p)}${range}\t${required ? "required" : "optional"}${def}${desc}`;
  });
}

/** Human rendering: first sentence of the description, then the arguments. */
export function formatTools(tools: ListedTool[]): string {
  const out: string[] = [];
  for (const t of tools) {
    out.push(`${t.name}\t${(t.description ?? "").split(/(?<=\.)\s/)[0]}`);
    const lines = argLines(t.inputSchema);
    out.push(...(lines.length ? lines : ["    (no arguments)"]));
  }
  return out.join("\n");
}

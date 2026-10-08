import vm from "node:vm";

/** Run a LE Tools data script in a sandbox and return the globals it assigned on `window`. */
export function decodeGlobals(source: string, filename = "data.js"): Record<string, unknown> {
  const win: Record<string, unknown> = {};
  const sandbox: Record<string, unknown> = { window: win, self: win, globalThis: win };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename, timeout: 60_000 });
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(win)) out[k] = win[k];
  return out;
}

export function shapeOf(v: unknown): string {
  if (Array.isArray(v)) return `array(${v.length})`;
  if (v && typeof v === "object") return `object(${Object.keys(v).length})`;
  return typeof v;
}

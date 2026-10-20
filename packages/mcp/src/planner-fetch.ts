/**
 * Fetching an LE Tools planner build (https://www.lastepochtools.com/planner/<id>) for the `planner` tool.
 *
 * How the site serves a build (observed 2026-10-20, docs/planner-import.md): the planner page HTML carries a per-page
 * token (`var <name>='<32 hex>'`), and an inline script loads `GET /api/internal/planner_data/<token>`, which returns
 * `{data: <planner build JSON>}`. Both sit behind Cloudflare: a plain HTTP client gets the "Just a moment..." challenge
 * (403) and the token is useless without the page's cookies. So the build is read the way a visitor's browser reads it:
 * one page load in a local Chromium (playwright-core, headless, with an ordinary user agent; an off-screen headed
 * window when the headless one is challenged), capturing the planner_data response.
 *
 * Only user-supplied links are fetched (one page view per build); the result is cached on disk
 * (data/planner-cache/<id>.json, gitignored) so repeated calls do not touch the site. Never crawl or POST.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { REPO_ROOT, ToolError } from "./context.js";

export const PLANNER_ORIGIN = "https://www.lastepochtools.com";

/** A planner build id is the short id of a saved build (`oYEPpxWw`). */
const ID_RE = /^[A-Za-z0-9_-]{4,32}$/;

export interface PlannerRef {
  id: string;
  url: string;
}

/**
 * Planner id + canonical URL from a share link ("https://www.lastepochtools.com/planner/oYEPpxWw", with or without
 * scheme, www, a trailing slash, a query or a #fragment) or a bare id ("oYEPpxWw").
 */
export function parsePlannerRef(input: string): PlannerRef {
  const s = input.trim();
  if (!s) throw new ToolError("Empty planner link");
  let id: string | undefined;
  const m = /^(?:https?:\/\/)?(?:www\.)?lastepochtools\.com\/planner\/([^/?#\s]+)/i.exec(s);
  if (m) id = decodeURIComponent(m[1]!);
  else if (/lastepochtools\.com/i.test(s) || s.includes("/")) {
    throw new ToolError(`Not an LE Tools planner build link: '${s}'. Expected https://www.lastepochtools.com/planner/<id>`);
  } else id = s;
  if (!ID_RE.test(id)) throw new ToolError(`Invalid planner build id '${id}' (from '${s}')`);
  return { id, url: `${PLANNER_ORIGIN}/planner/${id}` };
}

export interface PlannerFetch {
  id: string;
  url: string;
  /** The planner build JSON (the `data` member of the planner_data response). */
  data: Record<string, unknown>;
  /** Page title, e.g. "Marksman, level 81 (Season 5: Rage of the Frostborn) - Last Epoch Build Planner". */
  title?: string;
  /** LE Tools data version the page was served with (window.dataVersion, e.g. "version152"). */
  data_version?: string;
  fetched_at: string;
  from: "cache" | "network";
  cache_path?: string;
}

export const cacheDir = (): string => process.env.LE_PLANNER_CACHE ?? join(REPO_ROOT, "data", "planner-cache");

function readCache(dir: string, id: string): PlannerFetch | undefined {
  const p = join(dir, `${id}.json`);
  if (!existsSync(p)) return undefined;
  try {
    const c = JSON.parse(readFileSync(p, "utf8")) as Omit<PlannerFetch, "from">;
    if (!c || typeof c.data !== "object" || !c.data) return undefined;
    return { ...c, from: "cache", cache_path: p };
  } catch {
    return undefined;
  }
}

function writeCache(dir: string, f: PlannerFetch): string | undefined {
  try {
    mkdirSync(dir, { recursive: true });
    const p = join(dir, `${f.id}.json`);
    const { from: _from, cache_path: _cp, ...rest } = f;
    writeFileSync(p, JSON.stringify(rest, null, 1) + "\n");
    return p;
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------- browser

/** Chromium-family executables to try, in order (LE_BROWSER_PATH, then installed Playwright Chromium builds). */
export function browserCandidates(): { executablePath?: string; channel?: string; label: string }[] {
  const out: { executablePath?: string; channel?: string; label: string }[] = [];
  if (process.env.LE_BROWSER_PATH) out.push({ executablePath: process.env.LE_BROWSER_PATH, label: `LE_BROWSER_PATH (${process.env.LE_BROWSER_PATH})` });
  out.push({ channel: "chrome", label: "Google Chrome" }, { channel: "msedge", label: "Microsoft Edge" });
  // Playwright's own downloads (npx playwright install chromium), newest build first
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    process.platform === "win32" ? join(process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local"), "ms-playwright") : undefined,
    process.platform === "darwin" ? join(homedir(), "Library", "Caches", "ms-playwright") : join(homedir(), ".cache", "ms-playwright"),
  ].filter((r): r is string => !!r && existsSync(r));
  const rel =
    process.platform === "win32"
      ? [["chrome-win64", "chrome.exe"], ["chrome-win", "chrome.exe"]]
      : process.platform === "darwin"
        ? [["chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium"], ["chrome-mac-arm64", "Chromium.app", "Contents", "MacOS", "Chromium"]]
        : [["chrome-linux64", "chrome"], ["chrome-linux", "chrome"]];
  for (const root of roots) {
    const dirs = readdirSync(root)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
    for (const d of dirs) {
      for (const r of rel) {
        const p = join(root, d, ...r);
        if (existsSync(p)) out.push({ executablePath: p, label: `Playwright ${d}` });
      }
    }
  }
  return out;
}

/** A desktop Chrome user agent for the browser's version (the headless default says "HeadlessChrome", which Cloudflare blocks). */
export function desktopUserAgent(version: string): string {
  const major = /^(\d+)/.exec(version)?.[1] ?? "140";
  const os =
    process.platform === "win32" ? "Windows NT 10.0; Win64; x64" : process.platform === "darwin" ? "Macintosh; Intel Mac OS X 10_15_7" : "X11; Linux x86_64";
  return `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Safari/537.36`;
}

type PW = typeof import("playwright-core");

async function loadPlaywright(): Promise<PW> {
  try {
    return (await import("playwright-core")) as PW;
  } catch (e) {
    throw new ToolError(`Fetching a planner link needs the playwright-core package (yarn install): ${(e as Error).message}`);
  }
}

interface PageResult {
  data: Record<string, unknown>;
  title?: string;
  data_version?: string;
}

/** One page load: capture the planner_data response. Throws with the page title when it never arrives. */
async function loadOnce(
  pw: PW,
  cand: { executablePath?: string; channel?: string },
  url: string,
  headless: boolean,
  timeoutMs: number,
): Promise<PageResult> {
  const args = ["--disable-blink-features=AutomationControlled"];
  if (!headless) args.push("--window-position=-32000,-32000", "--window-size=800,600");
  const browser = await pw.chromium.launch({ headless, executablePath: cand.executablePath, channel: cand.channel, args });
  try {
    const context = await browser.newContext({ userAgent: desktopUserAgent(browser.version()), locale: "en-US" });
    const page = await context.newPage();
    const resp = page.waitForResponse((r) => r.url().includes("/api/internal/planner_data/"), { timeout: timeoutMs }).catch(() => null);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs }).catch(() => null);
    const r = await resp;
    const title = await page.title().catch(() => undefined);
    if (!r) throw new Error(`no planner data within ${timeoutMs} ms (page title: '${title ?? "?"}')`);
    if (r.status() === 404) throw new ToolError(`LE Tools has no planner build '${url.split("/").pop()}' (planner_data 404)`);
    if (!r.ok()) throw new Error(`planner_data HTTP ${r.status()} (page title: '${title ?? "?"}')`);
    const body = (await r.json()) as { data?: Record<string, unknown> };
    if (!body || typeof body.data !== "object" || !body.data) throw new Error("planner_data response has no data object");
    const dataVersion = await page.evaluate("window.dataVersion").catch(() => undefined);
    return { data: body.data, title: title?.trim() || undefined, data_version: typeof dataVersion === "string" ? dataVersion : undefined };
  } finally {
    await browser.close().catch(() => undefined);
  }
}

export interface FetchOptions {
  refresh?: boolean;
  timeoutMs?: number;
  cache?: string;
}

/** Planner build by id: the disk cache unless refresh, else one browser page load (headless, then off-screen headed). */
export async function fetchPlanner(ref: PlannerRef, opt: FetchOptions = {}): Promise<PlannerFetch> {
  const dir = opt.cache ?? cacheDir();
  if (!opt.refresh) {
    const hit = readCache(dir, ref.id);
    if (hit) return hit;
  }
  const pw = await loadPlaywright();
  const timeoutMs = opt.timeoutMs ?? 30000;
  const errors: string[] = [];
  for (const cand of browserCandidates()) {
    for (const headless of [true, false]) {
      try {
        const r = await loadOnce(pw, cand, ref.url, headless, timeoutMs);
        const f: PlannerFetch = { id: ref.id, url: ref.url, ...r, fetched_at: new Date().toISOString(), from: "network" };
        const p = writeCache(dir, f);
        return p ? { ...f, cache_path: p } : f;
      } catch (e) {
        if (e instanceof ToolError) throw e;
        const msg = (e as Error).message.split("\n")[0]!;
        errors.push(`${cand.label}${headless ? " headless" : " headed"}: ${msg}`);
        // a browser that cannot start will not start headed either
        if (/Executable doesn't exist|Chromium distribution .* is not found|spawn|ENOENT/i.test(msg)) break;
      }
    }
  }
  throw new ToolError(
    `Could not load ${ref.url}. Tried: ${errors.join(" | ") || "no browser found"}. Install a browser (npx playwright install chromium) or set LE_BROWSER_PATH; ` +
      `or open the link yourself and pass the planner JSON as {json} / {file}.`,
  );
}

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { decodeGlobals, shapeOf } from "./decode.js";
import { httpGet, httpGetText } from "./http.js";
import { sha256, type LetoolsFileLock, type SourcesLock } from "./lock.js";

export const LETOOLS_ORIGIN = "https://www.lastepochtools.com";
export const PLANNER_URL = `${LETOOLS_ORIGIN}/planner/`;

const PATH_RE = /data\/(version\d+)\/([a-z-]+)\/js\/[a-f0-9]{32}\.js/g;

/** "version152" / "152" -> "1.5.2". */
export function versionToSemver(v: string): string {
  const m = /^(?:version)?(\d)(\d)(\d)$/.exec(v.trim());
  if (!m) throw new Error(`Cannot map LE Tools version "${v}" to semver (expected 3 digits)`);
  return `${m[1]}.${m[2]}.${m[3]}`;
}

export function discoverVersion(html: string): string {
  const m = /dataVersion"\]\s*=\s*"version(\d+)"/.exec(html) ?? /version(\d+)/.exec(html);
  if (!m) throw new Error("Could not find LE Tools data version in planner HTML");
  return `version${m[1]}`;
}

export interface DiscoveredFile {
  section: string;
  path: string;
  version: string;
}

export function discoverDataFiles(html: string): DiscoveredFile[] {
  const seen = new Map<string, DiscoveredFile>();
  for (const m of html.matchAll(PATH_RE)) {
    if (!seen.has(m[0])) seen.set(m[0], { section: m[2], path: m[0], version: m[1] });
  }
  return [...seen.values()];
}

export interface FetchOptions {
  rawDir: string;
  force: boolean;
  /** e.g. "150" to fetch an older folder; needs a lockfile entry since the page only lists the current version. */
  version?: string;
  previous?: SourcesLock["letools"];
  log: (s: string) => void;
}

export interface ReportRow {
  file: string;
  bytes: number;
  globals: number | string;
  status: string;
}

export interface LetoolsResult {
  semver: string;
  lock: NonNullable<SourcesLock["letools"]>;
  rows: ReportRow[];
}

function writeJson(path: string, value: unknown): Buffer {
  const buf = Buffer.from(JSON.stringify(value) + "\n");
  writeFileSync(path, buf);
  return buf;
}

const sameNames = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

export async function fetchLetools(opts: FetchOptions): Promise<LetoolsResult> {
  let verFolder: string;
  let files: DiscoveredFile[];
  if (opts.version) {
    verFolder = `version${opts.version.replace(/^version/, "")}`;
    versionToSemver(verFolder);
    if (opts.previous?.versionFolder === verFolder) {
      files = opts.previous.files.map((f) => ({
        section: f.section,
        path: new URL(f.url).pathname.slice(1),
        version: verFolder,
      }));
    } else {
      throw new Error(
        `--version ${opts.version}: data file hashes of old versions cannot be discovered (the planner page lists only the current version). ` +
          `Run without --version while ${verFolder} is current.`,
      );
    }
  } else {
    const html = await httpGetText(PLANNER_URL);
    verFolder = discoverVersion(html);
    files = discoverDataFiles(html).filter((f) => f.version === verFolder);
    if (files.length === 0) throw new Error(`No data files found in planner HTML for ${verFolder}`);
  }
  const semver = versionToSemver(verFolder);
  const outDir = join(opts.rawDir, semver, "letools");
  mkdirSync(outDir, { recursive: true });

  const rows: ReportRow[] = [];
  const lockFiles: LetoolsFileLock[] = [];
  for (const f of files) {
    const url = `${LETOOLS_ORIGIN}/${f.path}`;
    const prev = opts.previous?.versionFolder === verFolder ? opts.previous.files.find((p) => p.url === url) : undefined;
    const res = await httpGet(url);
    const digest = sha256(res.body);
    const globals = decodeGlobals(res.body.toString("utf8"), f.path);
    const names = Object.keys(globals);
    const unchanged = !opts.force && prev?.sha256 === digest && sameNames(prev.globals, names);
    let total = 0;
    for (const n of names) total += writeJson(join(outDir, `${n}.json`), globals[n]).length;
    rows.push({
      file: `letools/${f.section}`,
      bytes: total,
      globals: names.length,
      status: unchanged ? "up to date" : "written",
    });
    lockFiles.push({ section: f.section, url, sha256: digest, bytes: res.body.length, globals: names });
  }

  const i18nUrl = `${LETOOLS_ORIGIN}/data/${verFolder}/i18n/full/en.json`;
  const i18n = await httpGet(i18nUrl);
  const parsed = JSON.parse(i18n.body.toString("utf8"));
  const out = writeJson(join(outDir, "i18n.en.json"), parsed);
  const i18nSha = sha256(i18n.body);
  rows.push({
    file: "letools/i18n.en.json",
    bytes: out.length,
    globals: shapeOf(parsed),
    status: !opts.force && opts.previous?.i18n.sha256 === i18nSha ? "up to date" : "written",
  });

  return {
    semver,
    rows,
    lock: {
      versionFolder: verFolder,
      plannerUrl: PLANNER_URL,
      files: lockFiles,
      i18n: { url: i18nUrl, sha256: i18nSha, bytes: i18n.body.length },
    },
  };
}

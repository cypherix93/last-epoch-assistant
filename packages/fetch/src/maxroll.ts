import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { httpGet } from "./http.js";
import { sha256, type SourcesLock } from "./lock.js";
import type { ReportRow } from "./letools.js";

export const MAXROLL_PLANNER_JS = "https://assets-ng.maxroll.gg/leplanner/static/js/planner.js";
export const MAXROLL_DATA_BASE = "https://assets-ng.maxroll.gg/leplanner/game/data.json";

export function extractDataHash(plannerJs: string): string {
  const m = /"data\.json":"([a-f0-9]{8})"/.exec(plannerJs);
  if (!m) throw new Error('Could not find "data.json" hash in Maxroll planner.js');
  return m[1];
}

export interface MaxrollOptions {
  rawDir: string;
  semver: string;
  force: boolean;
  previous?: SourcesLock["maxroll"];
}

export async function fetchMaxroll(
  opts: MaxrollOptions,
): Promise<{ lock: NonNullable<SourcesLock["maxroll"]>; rows: ReportRow[] }> {
  const js = await httpGet(MAXROLL_PLANNER_JS);
  const hash = extractDataHash(js.body.toString("utf8"));
  const dataUrl = `${MAXROLL_DATA_BASE}?${hash}`;
  const data = await httpGet(dataUrl);
  const parsed = JSON.parse(data.body.toString("utf8"));
  const dir = join(opts.rawDir, opts.semver, "maxroll");
  mkdirSync(dir, { recursive: true });
  const out = Buffer.from(JSON.stringify(parsed) + "\n");
  writeFileSync(join(dir, "data.json"), out);
  const digest = sha256(data.body);
  return {
    lock: {
      plannerJsUrl: MAXROLL_PLANNER_JS,
      dataHash: hash,
      dataUrl,
      etag: data.etag,
      lastModified: data.lastModified,
      sha256: digest,
      bytes: data.body.length,
    },
    rows: [
      {
        file: "maxroll/data.json",
        bytes: out.length,
        globals: `${Object.keys(parsed).length} keys`,
        status: !opts.force && opts.previous?.sha256 === digest ? "up to date" : "written",
      },
    ],
  };
}

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

export interface LetoolsFileLock {
  section: string;
  url: string;
  sha256: string;
  bytes: number;
  globals: string[];
}

export interface SourcesLock {
  fetchedAt: string;
  letools?: {
    versionFolder: string;
    plannerUrl: string;
    files: LetoolsFileLock[];
    i18n: { url: string; sha256: string; bytes: number };
  };
  maxroll?: {
    plannerJsUrl: string;
    dataHash: string;
    dataUrl: string;
    etag: string | null;
    lastModified: string | null;
    sha256: string;
    bytes: number;
  };
}

export const sha256 = (b: Buffer | string): string => createHash("sha256").update(b).digest("hex");

export function readLock(path: string): SourcesLock | null {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as SourcesLock;
}

export function serializeLock(lock: SourcesLock): string {
  return JSON.stringify(lock, null, 2) + "\n";
}

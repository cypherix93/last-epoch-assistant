export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36";

export interface HttpResult {
  url: string;
  body: Buffer;
  etag: string | null;
  lastModified: string | null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function httpGet(url: string, retries = 3, timeoutMs = 60_000): Promise<HttpResult> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return {
        url,
        body: Buffer.from(await res.arrayBuffer()),
        etag: res.headers.get("etag"),
        lastModified: res.headers.get("last-modified"),
      };
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await sleep(500 * 2 ** (attempt - 1));
    }
  }
  const msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
  throw new Error(`GET ${url} failed after ${retries} attempts: ${msg}`);
}

export async function httpGetText(url: string): Promise<string> {
  return (await httpGet(url)).body.toString("utf8");
}

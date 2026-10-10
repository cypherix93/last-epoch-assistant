import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { httpGet } from "./http.js";
import { sha256, type MaxrollGuidesLockEntry, type SourcesLock } from "./lock.js";
import type { ReportRow } from "./letools.js";

export const GUIDES_ORIGIN = "https://maxroll.gg";
export const GUIDES_LIST_URL = `${GUIDES_ORIGIN}/last-epoch/build-guides`;
export const PLANNER_PROFILE_BASE = "https://planners.maxroll.gg/profiles/le";
export const TIER_LISTS: Record<string, string> = {
  corruption: `${GUIDES_ORIGIN}/last-epoch/tierlists/corruption-tier-list`,
  speed: `${GUIDES_ORIGIN}/last-epoch/tierlists/speed-farming-tier-list`,
  bossing: `${GUIDES_ORIGIN}/last-epoch/tierlists/bossing-tier-list`,
};

export interface GuideCard {
  slug: string;
  title: string;
  url: string;
  author: string | null;
  /** Date as shown on the card, e.g. "October 8, 2026". */
  updated: string | null;
  updated_iso: string | null;
  season: string | null;
  playstyle: string | null;
  style_tags: string[];
  class: string | null;
  mastery: string | null;
  /** The guide's own profile id, taken from the card's skill-bar embed. */
  planner_id: string | null;
}

export interface TierEntry {
  name: string;
  tier: string;
  /** Guide slug the entry links to (null when the entry has no guide link). */
  slug: string | null;
}

export interface TierList {
  url: string;
  title: string | null;
  updated: string | null;
  entries: TierEntry[];
}

export interface GuideIndexEntry extends GuideCard {
  profile_ids: string[];
  tiers: Record<string, string>;
}

const STYLE_TAGS = new Set(["Caster", "Melee", "Range", "Minions"]);
const PLAYSTYLES = new Set(["Endgame", "Leveling"]);
const CLASS_OF_MASTERY: Record<string, string> = {
  "forge-guard": "sentinel",
  paladin: "sentinel",
  "void-knight": "sentinel",
  lich: "acolyte",
  necromancer: "acolyte",
  warlock: "acolyte",
  runemaster: "mage",
  sorcerer: "mage",
  spellblade: "mage",
  beastmaster: "primalist",
  druid: "primalist",
  shaman: "primalist",
  bladedancer: "rogue",
  falconer: "rogue",
  marksman: "rogue",
};
const BASE_CLASSES = new Set(["acolyte", "mage", "primalist", "rogue", "sentinel"]);

export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

const stripTags = (s: string) =>
  decodeEntities(s.replace(/<!--.*?-->/g, "").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/** "October 8, 2026" -> "2026-10-08"; null when not parseable. */
export function parseShownDate(s: string | null): string | null {
  const m = s && /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/.exec(s.trim());
  if (!m) return null;
  const mo = MONTHS.indexOf(m[1].toLowerCase());
  if (mo < 0) return null;
  return `${m[3]}-${String(mo + 1).padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}

/** Parse the server-rendered build-guides list page into one record per guide card. */
export function parseGuideList(html: string): GuideCard[] {
  const out: GuideCard[] = [];
  const seen = new Set<string>();
  for (const chunk of html.split("<article").slice(1)) {
    const card = chunk.split("</article>")[0];
    const slug = /href="\/last-epoch\/build-guides\/([a-z0-9-]+)"/.exec(card)?.[1];
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const title =
      stripTags(/<span class="_titlePrimary[^"]*">(.*?)<\/span>/s.exec(card)?.[1] ?? "") ||
      decodeEntities(/<h2 title="([^"]*)"/.exec(card)?.[1] ?? slug);
    const author = /By <span[^>]*>(.*?)<\/span>/s.exec(card);
    const updatedRaw = /Last Updated:(.*?)<\/span>/s.exec(card);
    const updated = updatedRaw ? stripTags(updatedRaw[1]) : null;
    const tags = [...card.matchAll(/<span class="text-xs md:text-sm">([^<]*)<\/span>/g)].map((m) => stripTags(m[1]));
    let season: string | null = null;
    let playstyle: string | null = null;
    let cls: string | null = null;
    let mastery: string | null = null;
    const style: string[] = [];
    for (const t of tags) {
      if (/^Season\s+\d+/i.test(t)) season = t;
      else if (PLAYSTYLES.has(t)) playstyle = t;
      else if (STYLE_TAGS.has(t)) style.push(t);
      else if (BASE_CLASSES.has(t)) cls = t;
      else if (/^[a-z-]+$/.test(t)) mastery = t;
    }
    if (!cls && mastery) cls = CLASS_OF_MASTERY[mastery] ?? null;
    out.push({
      slug,
      title,
      url: `${GUIDES_ORIGIN}/last-epoch/build-guides/${slug}`,
      author: author ? stripTags(author[1]) : null,
      updated,
      updated_iso: parseShownDate(updated),
      season,
      playstyle,
      style_tags: style,
      class: cls,
      mastery,
      planner_id: /data-le-profile="([a-z0-9]+)"/.exec(card)?.[1] ?? null,
    });
  }
  return out;
}

/** Distinct `data-le-profile` ids of a guide page, in page order. */
export function extractProfileIds(html: string): string[] {
  const ids: string[] = [];
  for (const m of html.matchAll(/data-le-profile="([a-z0-9]+)"/g)) if (!ids.includes(m[1])) ids.push(m[1]);
  return ids;
}

const slugOfHref = (href: string) => /\/last-epoch\/build-guides\/([a-z0-9-]+)/.exec(href)?.[1] ?? null;

/** Parse a tier-list page into (name, tier, guide slug) entries in page order. */
export function parseTierList(html: string, url: string): TierList {
  const entries: TierEntry[] = [];
  for (const block of html.split('<div class="_Tierlist__tier_').slice(1)) {
    const tier = /_Tierlist__tierName[^>]*>([^<]*)</.exec(block)?.[1]?.trim();
    if (!tier) continue;
    for (const item of block.split('<li class="_Tierlist__tierItemContainer').slice(1)) {
      const name =
        /<body>(.*?)<\/body>/s.exec(item)?.[1] ?? /_Tierlist__tierItemText[^>]*>(.*?)<\/span>/s.exec(item)?.[1];
      if (!name) continue;
      const href = /href="([^"]*)"/.exec(item)?.[1];
      entries.push({ name: stripTags(name), tier, slug: href ? slugOfHref(href) : null });
    }
  }
  const updated = /Last Updated:\s*<time[^>]*>([^<]*)</.exec(html)?.[1] ?? null;
  const title = /<h1[^>]*>(.*?)<\/h1>/s.exec(html)?.[1];
  return {
    url,
    title: title ? stripTags(title) : null,
    updated: updated ? (parseShownDate(updated) ?? updated) : null,
    entries,
  };
}

const norm = (s: string) => s.toLowerCase().replace(/\bguide\b/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** Tier of a guide in one list: exact slug link first, then normalised-title match for unlinked entries. */
export function tierFor(guide: Pick<GuideCard, "slug" | "title">, list: TierList): string | null {
  const bySlug = list.entries.find((e) => e.slug === guide.slug);
  if (bySlug) return bySlug.tier;
  const t = norm(guide.title);
  return list.entries.find((e) => !e.slug && norm(e.name) === t)?.tier ?? null;
}

export interface GuidesIndex {
  fetched_at: string;
  list_url: string;
  guides: GuideIndexEntry[];
  tier_lists: Record<string, TierList>;
}

export function buildIndex(
  fetchedAt: string,
  cards: GuideCard[],
  profileIds: Record<string, string[]>,
  tierLists: Record<string, TierList>,
): GuidesIndex {
  const guides = cards.map((c) => {
    const ids = [...(profileIds[c.slug] ?? [])];
    if (c.planner_id && !ids.includes(c.planner_id)) ids.unshift(c.planner_id);
    const tiers: Record<string, string> = {};
    for (const [k, list] of Object.entries(tierLists)) {
      const t = tierFor(c, list);
      if (t) tiers[k] = t;
    }
    return { ...c, profile_ids: ids, tiers };
  });
  return { fetched_at: fetchedAt, list_url: GUIDES_LIST_URL, guides, tier_lists: tierLists };
}

export interface MaxrollGuidesOptions {
  rawDir: string;
  semver: string;
  force: boolean;
  previous?: SourcesLock["maxrollGuides"];
  log?: (s: string) => void;
  delayMs?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchMaxrollGuides(
  opts: MaxrollGuidesOptions,
): Promise<{ lock: NonNullable<SourcesLock["maxrollGuides"]>; rows: ReportRow[] }> {
  const log = opts.log ?? console.log;
  const delay = opts.delayMs ?? 350;
  const dir = join(opts.rawDir, opts.semver, "maxroll-guides");
  const profDir = join(dir, "profiles");
  mkdirSync(profDir, { recursive: true });
  const prev = new Map((opts.previous?.files ?? []).map((f) => [f.url, f]));
  const now = new Date().toISOString();
  const files: MaxrollGuidesLockEntry[] = [];

  // Sequential and throttled; records one lock entry per URL.
  const get = async (url: string): Promise<Buffer> => {
    await sleep(delay);
    const r = await httpGet(url);
    const digest = sha256(r.body);
    const p = prev.get(url);
    files.push({
      url,
      sha256: digest,
      bytes: r.body.length,
      fetched_at: p?.sha256 === digest ? p.fetched_at : now,
    });
    return r.body;
  };

  const cards = parseGuideList((await get(GUIDES_LIST_URL)).toString("utf8"));
  if (!cards.length) throw new Error("Maxroll guides list parsed to zero guides (page layout changed?)");
  log(`Maxroll guides: ${cards.length} guides on the list page`);

  const tierLists: Record<string, TierList> = {};
  for (const [key, url] of Object.entries(TIER_LISTS)) {
    tierLists[key] = parseTierList((await get(url)).toString("utf8"), url);
    log(`  tier list ${key}: ${tierLists[key].entries.length} entries`);
  }

  const idsBySlug: Record<string, string[]> = {};
  for (const [i, c] of cards.entries()) {
    idsBySlug[c.slug] = extractProfileIds((await get(c.url)).toString("utf8"));
    if ((i + 1) % 10 === 0) log(`  guide pages ${i + 1}/${cards.length}`);
  }

  const index = buildIndex(now, cards, idsBySlug, tierLists);
  const allIds = [...new Set(index.guides.flatMap((g) => g.profile_ids))];
  let profBytes = 0;
  let profDirty = 0;
  for (const [i, id] of allIds.entries()) {
    const body = await get(`${PLANNER_PROFILE_BASE}/${id}`);
    JSON.parse(body.toString("utf8")); // refuse to store a non-JSON response
    const path = join(profDir, `${id}.json`);
    if (!existsSync(path) || !readFileSync(path).equals(body)) profDirty++;
    writeFileSync(path, body);
    profBytes += body.length;
    if ((i + 1) % 20 === 0) log(`  profiles ${i + 1}/${allIds.length}`);
  }

  // Keep fetched_at stable when nothing but the timestamp would change.
  const indexPath = join(dir, "index.json");
  const oldRaw = existsSync(indexPath) ? readFileSync(indexPath) : null;
  if (oldRaw) {
    const old = JSON.parse(oldRaw.toString("utf8")) as GuidesIndex;
    if (JSON.stringify({ ...old, fetched_at: "" }) === JSON.stringify({ ...index, fetched_at: "" }))
      index.fetched_at = old.fetched_at;
  }
  const indexBuf = Buffer.from(JSON.stringify(index, null, 2) + "\n");
  writeFileSync(indexPath, indexBuf);

  const status = (dirty: boolean) => (!opts.force && !dirty ? "up to date" : "written");
  return {
    lock: { listUrl: GUIDES_LIST_URL, files },
    rows: [
      {
        file: "maxroll-guides/index.json",
        bytes: indexBuf.length,
        globals: `${index.guides.length} guides`,
        status: status(!oldRaw || !oldRaw.equals(indexBuf)),
      },
      {
        file: "maxroll-guides/profiles/",
        bytes: profBytes,
        globals: `${allIds.length} profiles`,
        status: status(profDirty > 0),
      },
    ],
  };
}

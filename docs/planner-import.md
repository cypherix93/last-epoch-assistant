# LE Tools planner import (`planner` tool)

The `planner` MCP tool turns an LE Tools build planner link into the build, fully named and with every rolled value, so a build can be audited from its share link instead of from a description. Code: `packages/mcp/src/planner.ts` (decoding), `packages/mcp/src/planner-fetch.ts` (loading a link); tests: `packages/mcp/src/planner.test.ts` with the fixture `packages/mcp/src/__fixtures__/planner-oYEPpxWw.json` (a level 81 Marksman imported from a game save).

## Calling it

```
planner({"url": "https://www.lastepochtools.com/planner/oYEPpxWw"})
planner({"url": "oYEPpxWw", "sections": ["gear", "idols"]})
planner({"file": "packages/mcp/src/__fixtures__/planner-oYEPpxWw.json"})
planner({"json": {...planner build JSON...}})
```

- Exactly one of `url` (share link or bare build id), `json` (the planner build JSON as an object or string, or the `{data: ...}` planner_data response) or `file` (a path to either, including a `data/planner-cache/<id>.json` file).
- `refresh: true` reloads a link that is already cached.
- `sections`: any of `gear`, `idols`, `blessings`, `passives`, `skills`, `weaver` (default all). `character`, `warnings` and `planner` are always returned.
- CLI: `yarn mcp:call planner '{"url":"oYEPpxWw"}' --pretty`.

## Reply

| Key | Content |
|---|---|
| `planner` | `id`, `url`, page `title` ("Marksman, level 81 (Season 5: Rage of the Frostborn) - ..."), `data_version` (the LE Tools data the page was served with, e.g. `version152`), `fetched_at`, `from` (`network`, `cache`, `json`, `file`), `cache_path`, `from_save_file` (2 = imported from a game save, which LE Tools shows as verified) |
| `character` | class, mastery, level, passive and skill points, skill names, uniques worn, a one-line `summary` |
| `gear` | per slot (`weapon`, `offhand`, `head`, `body`, `waist`, `hands`, `feet`, `neck`, `finger1`, `finger2`, `relic`, `altar`): item name, `display`, `kind` (`unique`, `legendary`, `weavers_will`, `set`, `exalted`, `rare`, `magic`, `normal`, `idol`, `altar`), base, rolled `implicits`, for uniques the tooltip `effects` in tooltip order and every `unique_mods` line with its roll, and `affixes` |
| affix line | `name`, `display` ("+91 Health; +6% increased Health (T6)"), `tier`, `type` (prefix / suffix), `origin` (`normal`, `legendary_potential` or `weavers_will` on a unique, `sealed`, `primordial`, `corruption`), `roll` (the byte 0-255), `scale_factor` when the item's affix effect modifier scales the affix, `class_restriction`, and `values` (per stat line: tooltip `line`, rolled `value`, `tier_range` on this item, `modifier`) |
| `idols` | `grid_x` / `grid_y` (top-left cell), `size` (WxH), affixes as above |
| `blessings` | timeline, name, grand flag, rolled `lines` |
| `passives` | grouped by mastery (base class first): points and nodes (`name`, `display`, `points`, `max_points`) |
| `skills` | per specialized skill: name, ability id, tree id, points, nodes |
| `weaver` | allocated Weaver tree nodes |
| `warnings` | `unresolved` (an id not in this database), `class_affix` (an affix whose class mask excludes the build's class: it cannot be crafted on this class; a save import can still carry it from a drop or trade, a hand-typed planner may hold an item that cannot exist), `class_item`, `over_max` (points above a node's maximum), `mastery_points`, `skills` (more than five trees), `data_version` (the planner page's LE Tools data differs from this database) |

Values are in-game values: percentages are fractions (0.08 = 8%) in `value`, the `line` text shows them as the tooltip does.

## How a link is loaded

LE Tools serves a saved build at `https://www.lastepochtools.com/planner/<id>`. The page HTML holds a per-page token (`var <name>='<32 hex>'`) and an inline script fetches `GET /api/internal/planner_data/<token>`, which returns `{data: <planner build JSON>}` (observed 2026-10-20). Both are behind Cloudflare: a plain HTTP client gets the "Just a moment..." challenge (HTTP 403), and the token is not valid without the page's cookies. The tool therefore loads the page once in a local Chromium through `playwright-core` and captures the planner_data response:

1. Browser: `LE_BROWSER_PATH` if set, else Google Chrome, then Microsoft Edge (installed browsers, through Playwright channels), then Playwright's own Chromium downloads (`%LOCALAPPDATA%\ms-playwright`, `~/.cache/ms-playwright`; `npx playwright install chromium`).
2. Headless, with an ordinary desktop user agent for the browser's version (the default `HeadlessChrome` agent is blocked) and `--disable-blink-features=AutomationControlled`; if that load is challenged, a headed window placed off screen. A load takes about 1-3 s.
3. The reply and the page title / data version are written to `data/planner-cache/<id>.json` (gitignored; `LE_PLANNER_CACHE` moves it). Later calls read the cache; `refresh: true` reloads.

Only user-supplied links are fetched, one page view per build, the same request a visitor's browser makes. The site's robots.txt disallows `/planner/` for crawlers: never crawl planner ids, and never call the site's save endpoint. When no browser can be started, the error says so; the user can open the link, copy the planner_data response (or export the build JSON) and pass it as `json` or `file`.

The live fetch has one opt-in test: `LE_PLANNER_LIVE=1 yarn vitest run packages/mcp/src/planner.test.ts`.

## Planner build JSON

Serializer: LE Tools `planner/js/planner.js` (observed for data `version152`). Keys the tool reads:

| Key | Shape |
|---|---|
| `bio` | `{level, characterClass (class_id), chosenMastery (mastery_index)}` |
| `equipment` | `{<slot>: item}`, slots `weapon1`, `weapon2`, `head`, `chest`, `waist`, `hands`, `feet`, `ring1`, `ring2`, `amulet`, `relic`, `idol_altar` |
| item | `{id, affixes: [{id, tier, r}], sealedAffix?, primordialAffix?, corruptedAffix?, ir: [bytes], ur: [bytes], faction?}`; idols add `x`, `y` (top-left cell) |
| `idols` | array of items |
| `blessings` | `{<slot key>: {id, ir}}`; the timeline comes from the blessing |
| `charTree` | `{selected: {<node_id>: points}}` on the class tree (`classes.tree_id`) |
| `skillTrees` | `[{treeID, selected: {<node_id>: points}, level?, slotNumber?}]` |
| `weaverTree` | `{selected}` or null |
| `fromSaveFile` | 2 = imported from a game save (verified) |

Not read: `weaverTreeContainers`, `hud`, `weaponTypes`, `conditions`, `customConditions`, `activeBuffs`, `buffSettings`, `completedQuests` and the `*Progression` arrays (planner UI state).

Ids are LE Tools compact ids ([data-sources/ids.md](data-sources/ids.md#2-le-tools-compact-string-ids)): `A<affix_id>`; `I` + `1<base 3><sub 3><3 digits>` for a base item, idol or blessing (base type 34); `U<sub 3><unique 3>` for a unique (the leading digits are the unique's sub type). Affix tiers are 1-based, as in `affix_tiers`.

## Rolled values

Roll bytes are 0-255: `r` on an affix, `ir[i]` for implicit `i` (also a blessing's lines), `ur[rollId]` for unique mods (mods sharing a `rollId` roll together; a mod rolls only when `canRoll` and its range is not a single value). The value is the decompiled roll ([../knowledge/mechanics/stat-model.md](../knowledge/mechanics/stat-model.md), "Affixes", **D**):

```
a = RHE(lo x f x s), b = RHE(hi x f x s)       RHE = round half to even
v = min(floor((b - a + 1) x byte / 255 + a), b) / s
```

`f` is the item's affix effect modifier factor `(1 + item aem) / (1 + affix standard aem)` (1 for implicits, unique mods and blessings); `s` is the grid: `affix_stats.rounding_scale` for affixes, otherwise 100 for INCREASED, the property's `round_added_to_int` (1, else 100) for ADDED and `rounding_for_more` for MORE, read from `player_properties` / `ability_properties` / `idol_altar_properties` for SP 98 / 58 / 130 lines. The stat-model test vectors are unit tests. Unique special effects that are tooltip text rather than a stat line show their range, not the roll. In-game tooltips were not compared line by line (U); the fixture's values match what the planner page shows for the lines checked (Carrion of Creation +108% Bleed Chance, Arrowguard +3 health on glancing blow).

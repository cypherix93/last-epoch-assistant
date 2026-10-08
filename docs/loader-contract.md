# Loader contract (packages/db)

Three loaders fill `data/le.sqlite` from the raw data. They are developed in parallel by different agents, so every file has exactly one owner and the shared pieces (schema, helpers, build orchestration, search) are fixed. Read [schema.md](schema.md) for the tables and the mods model, and the header comment of your loader file for the exact table-by-table recipe.

## 1. File ownership

| file | owner | contents |
|---|---|---|
| `packages/db/src/loaders/world.ts`, `world.test.ts`, `packages/db/src/crosscheck.ts` | **world agent** | stat properties, enums, i18n, classes, monster mods, timelines, dungeons, arena, rewards, factions, quests (Maxroll), raw_globals; the LE Tools vs Maxroll cross-check |
| `packages/db/src/loaders/items.ts`, `items.test.ts` | **items agent** | base types, sub types, implicits, affixes, uniques, sets, idols, idol altars, blessings, item relations |
| `packages/db/src/loaders/skills.ts`, `skills.test.ts` | **skills agent** | abilities, components, ailments, UI buffs, entities, skill / class / Weaver trees and nodes, node relations |
| `packages/db/schema.sql`, `src/build-db.ts`, `src/search.ts`, `src/lib/*`, `docs/schema.md`, this file | schema owner (frozen for the loader agents) | |

Rules:

- Edit only your own files. If you need a schema change or a helper change, do not edit `schema.sql` / `src/lib/*`; put the request in your final report (or keep a local helper inside your loader file). Extra columns you need can wait: everything is in `raw_json`.
- You may add private helper modules next to your loader (`src/loaders/items-*.ts`, ...); nobody else touches them.
- Each loader writes only its own tables (the `tables` export of its file) plus its rows in the shared tables `mods`, `relations`, `compact_ids` (identified by `source_kind` / `kind`). `meta` and `search` are written by the build.
- A loader must not read tables written by another loader: `--only items` runs items alone. Read everything from `ctx.raw`.

## 2. The API

Each loader module exports exactly:

```ts
export const tables: readonly string[];           // owned tables (tests check they exist and get filled)
export const sharedTables: readonly string[];     // shared tables it writes rows into
export const modSourceKinds: readonly string[];   // mods.source_kind values it writes
export const expected: ExpectedCount[];           // acceptance counts (checked by the build and the tests)
export function loadWorld(ctx: LoaderContext): void;   // world.ts
export function loadItems(ctx: LoaderContext): void;   // items.ts
export function loadSkills(ctx: LoaderContext): void;  // skills.ts
// crosscheck.ts:
export function runCrosscheck(ctx: LoaderContext): CrosscheckResult;
```

The stubs throw `new Error('not implemented: <name>')`; replace the body, keep the signature. You may correct an entry of your own `expected` list if the data proves it wrong, and say so in your report.

### LoaderContext (`src/lib/context.ts`)

```ts
interface LoaderContext {
  db: Database.Database;   // better-sqlite3, schema.sql applied; the build wraps each loader in one transaction
  raw: RawData;            // data/raw/<version>/: raw.letools.<Global> (lazy, typed-ish), raw.i18n, raw.maxroll (or null), raw.lock
  t: Translator;           // (key) => English (ICU-unescaped) | null when key is null/missing/empty
  version: string;         // '1.5.2'
  log: Logger;             // log.info(msg), log.warn(msg) (warnings land in the build report)
  mods: ModWriter;         // the mods writer, see below
}
```

`raw.letools` has one property per LE Tools global (`itemDB`, `coreDB`, `LEAbilities`, `LESkillTrees`, `LESkillTreesUI`, `LECharTrees`, `LECharTreesUI`, `LEWeaverTree`, `LEWeaverTreeUI`, `monsterMods`, `timelineData`, `dungeonData`, `arenaData`, `monolithRewards`, `wovenEchoList`, `factionList`, `prophecyData`, `AT`, `SP`, `LocalSP`, `AilmentID`, `UIBuffs`, `UIBuffIds`, ...), parsed on first access. Record interfaces in `src/lib/raw.ts` name the commonly used fields; every record also accepts unknown fields. Field tables: [data-sources/letools.md](data-sources/letools.md).

### Writing rows

```ts
import { insertRow, insertRows } from "../lib/sqlite.js";
import { bool, int, num, str, rawJson, sortedEntries, cleanFloat, classRequirementNames,
         classSpecificityNames, DAMAGE_TYPES } from "../lib/util.js";
import { decodeCompactId, affixCompactId, setCompactId, implicitCompactId, monsterModCompactId } from "../lib/ids.js";
import { parseDisplayValue } from "../lib/stat-lines.js";

insertRow(ctx.db, "uniques", { unique_id: u.uniqueId, name: ctx.t(u.displayNameKey), ..., raw_json: rawJson(u) });
insertRow(ctx.db, "compact_ids", row, { conflict: "ignore" });   // shared table, same id may be seen twice
```

- `insertRow(db, table, row, { conflict? })`: column names are checked (a typo throws), booleans become 0/1, `undefined` becomes NULL, objects become JSON. Statements are cached.
- `rawJson(record, omit?)`: JSON for `raw_json`; pass the child keys that have their own table (`['subItems']`, `['prefab']`, `['nodes']`, ...) as the column comments in `schema.sql` say.
- `bool()` normalizes `0/1` and `true/false`; `num()` / `int()` / `str()` coerce and map `''` to NULL.

### Writing stat lines (`mods`)

Every stat line goes through the mods writer (never `insertRow(..., "mods", ...)`):

```ts
// a line with a modifier type and a range
ctx.mods.insert({
  sourceKind: "unique_mod", sourceId: u.uniqueId, sourceOrd: i,
  property: m.property, specialTag: m.specialTag, tags: m.tags, extraTag: m.extraTag,
  modifierType: m.type, valueMin: m.value, valueMax: m.maxValue,
  hidden: m.hideInTooltip, raw: m,
});
// an affix roll (tier is 1-based)
ctx.mods.insert({ sourceKind: "affix_tier", sourceId: a.affixId, sourceOrd: i, tier: t + 1, ..., valueMin: roll.min, valueMax: roll.max,
                  label: ctx.t(p.modDisplayNameKey), labelKey: p.modDisplayNameKey, raw: { ...p, ...roll } });
// a display-only tree node stat
ctx.mods.insert({ sourceKind: "skill_node", sourceId: `${treeId}:${node.id}`, sourceOrd: i, property: s.property, tags: s.tags,
                  modifierType: null, display: s.value, value: parseDisplayValue(s.value),
                  label: ctx.t(s.statNameKey), labelKey: s.statNameKey, isDownside: s.downside, raw: s });
// a stat block {property, specialTag, tags, addedValue, increasedValue, moreValues[]} -> 1 row per non-zero component
ctx.mods.insertStatBlock({ sourceKind: "ailment_buff", sourceId: ail.id, sourceOrd: i }, buff);
```

What the writer does: validates (`source_kind` in the allowed list, `source_ord >= 0`, integer `property` / `tags` / `specialTag` / `extraTag`, `modifierType` in `{0, 1, 2, null}`, finite values, `tier` only and always on `affix_tier`, `raw` present; throws `ModValidationError`), resolves `property_name` (indirect properties 58 / 98 / 130 / 88-with-specialTag-1 resolved to the real stat name), decodes `tag_names` with `AT` (not for indirect properties), cleans float32 noise, mirrors a lone min/max, and enforces uniqueness of `(source_kind, source_id, tier, source_ord, sub_ord)`.

`ctx.mods.describeTags(bits)`, `ctx.mods.lineName(property, tags, specialTag)`, `ctx.mods.propertyName(property)` are available for other tables (`tag_names` columns, `affix_stats.property_name`).

## 3. Expected counts

The build checks every `expected` entry of the loaders that ran successfully and prints failures; `yarn db:build` exits 1 when one fails. Values for 1.5.2 (from [data-sources/counts.md](data-sources/counts.md), mods counts computed from the raw data with the stat-block expansion rule):

| loader | table / metric | expected |
|---|---|---|
| world | i18n | 34,993 |
| world | enums / tag_bits | 910 / 30 |
| world | stat_properties (all / with display rule) | 151 / 113 |
| world | stat_property_alt_texts | 162 |
| world | player_properties | 713 |
| world | ability_properties (rows / distinct abilities) | 2,344 / 175 (177 list entries; abilityID 0 and 803 have empty properties) |
| world | idol_altar_properties / conditional_properties | 31 / 48 |
| world | attributes; mods `attribute` / `attribute_corrupted` | 5; 7 / 10 |
| world | classes / masteries / class_abilities | 5 / 20 / 156 |
| world | monster_mods; mods `monster_mod`; compact_ids kind M | 287; 432; 287 |
| world | timelines / timeline_difficulties / timeline_blessings | 10 / 20 / 224 |
| world | endgame_mod_refs | 855 |
| world | dungeons / dungeon_tiers / arenas / arena_tiers | 3 / 12 / 2 / 5 |
| world | monolith_rewards / monolith_reward_groups / woven_echoes | 57 / 25 / 47 |
| world | factions / faction_ranks / prophecy_unlocks / scenes | 4 / 44 / 28 / 385 |
| world | maxroll_quests / raw_globals | 145 / 34 |
| items | item_base_types / item_subtypes | 48 / 1,558 |
| items | affixes (all / single) / affix_stats / affix_tiers | 1,156 / 616 / 1,696 / 6,238 |
| items | affix_can_roll_on / affix_reroll_chances / affix_display_categories | 2,539 / 218 / 45 |
| items | mods `affix_tier` | 9,711 |
| items | mods `implicit` / `blessing` / `idol_altar` (= 1,529 implicits) | 1,284 / 234 / 11 |
| items | uniques (all / set items) / unique_subtypes | 486 / 61 / 486 |
| items | mods `unique_mod` / unique_tooltips / unique_tooltip_entries | 2,440 / 562 / 2,459 |
| items | sets / mods `set_bonus` / set_tooltips | 25 / 54 / 18 |
| items | idol_altars / blessings (all with a timeline) | 13 / 224 |
| items | relations (affix / unique / set / implicit) / compact_ids A,U,S,I | 2,207 / >= 1,014 |
| skills | abilities (all / player / with tree) | 1,228 / 182 / 136 (playerAbilityIdList has 183 entries, vm53dx twice) |
| skills | ability_components / ability_links | 2,516 / 129 |
| skills | ailments; mods `ailment_buff` | 148; 161 |
| skills | ui_buffs / entities | 264 / 96 |
| skills | mods `ability_attribute_scaling` / `ability_level_scaling` | 885 / 179 |
| skills | trees (skill / class / weaver) | 136 / 5 / 1 |
| skills | tree_nodes (skill / class / weaver; all with UI position) | 3,956 / 541 / 80 |
| skills | tree_node_requirements | 4,928 |
| skills | mods `skill_node` / `passive_node` / `weaver_node` | 6,528 / 1,440 / 70 |
| skills | relations (tree nodes) | 3,236 |

## 4. Building

```
yarn db:build                                  # full build; fails while a loader is a stub
LE_DB_ALLOW_STUBS=1 yarn db:build              # stubs are skipped (status 'stub' in the report)
yarn db:build --only items                     # only the items step (+ nothing else; search not rebuilt)
yarn db:build --only world,items,search        # several steps; order is always world -> items -> skills -> search -> crosscheck
yarn db:build --only none                      # schema + meta only
yarn db:build --only items --out /tmp/x.sqlite --no-report    # do not touch data/le.sqlite or the committed report
```

The build writes `<out>.tmp`, renames it over `data/le.sqlite`, prints a row count per table (plus empty tables, mods per source kind, expected-count failures and meta) and writes `data/le.build-report.json`. A partial build also rewrites the report: commit the report only from a full build (or pass `--no-report`).

## 5. Tests

Your loader test lives next to the loader (`src/loaders/<name>.test.ts`, already scaffolded). It builds the real raw data into an in-memory database with only your step and checks your `expected` counts and that every owned table is filled:

```ts
import { buildForTest, hasRawData } from "../lib/testing.js";
import { checkExpected } from "../lib/expected.js";
import { expected } from "./items.js";

describe.skipIf(!hasRawData())("items loader", () => {
  it("meets every expected count", () => {
    const { db, status } = buildForTest(["items"]);
    expect(status).toBe("ok");
    expect(checkExpected(db, expected).filter((r) => !r.ok)).toEqual([]);
    db.close();
  });
});
```

Add spot checks for a few known records (e.g. unique 0 is "Calamity" with 3 mods; affix 0 "Void Penetration" has 8 tiers; Fireball node 2 "Piercing Heat" has stats "Pierce Chance +25%" and "Mana Cost +33%" (downside)). Run `yarn test` and `yarn typecheck` from the repository root.

## 6. Determinism

The same raw data must give the same database and the same report:

- iterate keyed objects with `sortedEntries()` / `sortedKeys()` (integer-like keys numerically, then code-point order), arrays in array order;
- no `Date`, `Math.random`, environment-dependent paths or locale-dependent sorting (`localeCompare`) in loaders;
- insert rows in a stable order (rowids of `mods` and `relations` are insertion order);
- `raw_json` via `rawJson()` (keeps the source key order);
- never depend on the order of rows written by another loader.

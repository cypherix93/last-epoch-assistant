# Community builds (Maxroll guides)

The database carries the build guides published on Maxroll for Last Epoch, decoded from their planner profiles: every gear piece with its affixes and tiers, idols on the altar grid, blessings, passive and skill tree allocations, the skill bar and the guide notes. Four MCP tools read them (`builds`, `build`, `item_usage`, `slot_meta`); this page says what the data is, where it comes from, how to call the tools and what not to conclude from it.

Tables and views: [schema.md section 3.9](schema.md#39-community-builds). Raw record shapes: [data-sources/maxroll.md](data-sources/maxroll.md#planner-profiles-community-build-guides).

## What the data is

- **Community-authored choices, not game truth.** A guide says what one author runs; it is evidence for "what do people use", never for how a mechanic works. Take formulas and numbers from the game tables and `knowledge/` pages, and quote a guide only as "Maxroll guide <slug> (author, updated <date>) uses ...".
- **Scope (1.5.2 data, fetched 2026-10-08):** the 73 non-archived guides on `https://maxroll.gg/last-epoch/build-guides` (70 Season 5 "Rage Of The Frostborn", 3 Season 4), 74 planner profiles (one guide has two), 241 tabs, 4,453 items (1,744 of them idols), 12,757 affix lines. 62 Endgame guides, 11 Leveling guides. Tier letters come from Maxroll's corruption, speed-farming and bossing tier lists.
- **One row per guide x planner profile** (`community_builds`); `is_primary` marks the guide's own planner. Each profile has 2 to 6 **tabs** (`Starter` / `Endgame` / `Aspirational`, or `Starting Gear` / `Endgame Gear` / `Aspirational Gear`, leveling guides use `Starting Setup (lvl 1 - 9)` ... `Final Setup (lvl 50 - 80)`, and free-form variants such as `Block Endgame`). The **default tab** is the one the planner opens on (usually Endgame).
- **Every id is a game id** (unique_id, affix_id, base/sub type, blessing, tree node, ability), so a build joins straight to the rest of the database and every name in a tool reply can be followed with `get` / `lookup`.

Provenance: `yarn fetch --only maxroll-guides` saves the guide list (`data/raw/<v>/maxroll-guides/index.json`) and the planner profiles (`profiles/<id>.json`, verbatim); `yarn db:build` (step `community`, `packages/db/src/loaders/community.ts`) decodes them. The build report (`data/le.build-report.json`, key `community`) lists anything unresolved (1.5.2: none) and the explained warnings below.

## Tools

All four are on the `le-data` MCP server (`mcp__le-data__<tool>`) and on the CLI. Examples use the stdin form, which is safe on Windows for any argument (see CLAUDE.md for the other forms). Names are resolved for you: class (name or 0-4), mastery (`Void Knight`, `void-knight`; a base class name such as `Sentinel` means the whole class), ability (name or id, player skills first), unique / set item (name or unique_id), affix (id or name; a name covers every affix with that name, e.g. gear and idol variants). Tab arguments match the trimmed tab name case-insensitively (exact, then prefix, then substring); `default` = the default tab, `any` = every tab. Every reply ends with a `source` line saying the data is Maxroll community guides.

### `builds`: list and filter

```bash
printf '%s' '{"mastery":"Void Knight","tier":"S"}' | yarn mcp:call builds
```

Arguments (all optional, combined with AND): `class`, `mastery` (also matches a leveling guide's card mastery), `ability` (main skill; with `any_skill: true` also any specialized skill), `item` (unique / set item equipped in any tab, or in `tab`), `affix` (same), `tab`, `tier` + `tier_list` (`corruption` default, `speed`, `bossing`), `playstyle` (`Endgame` / `Leveling`), `season` (substring, default all), `limit` (50).

Returns `{builds: [{build_id, slug, title, url, author, updated, season, playstyle, class, mastery, main_skill, main_ability_id, tiers: {corruption, speed, bossing}, tabs: [names], is_primary}], count, total_matching, truncated, resolved}` (`resolved` echoes what the filters resolved to, e.g. the unique name or affix ids). Sparse extras: `guide_mastery` (leveling guide whose card mastery differs from its default tab), `main_unique` (`{unique_id, name}` when the planner's main pick is an item). The example returns three S-tier corruption Void Knight guides (Erasing Strike, Time Rot, Warpath).

### `build`: one build in full

```bash
printf '%s' '{"slug":"erasing-strike-void-knight-guide","sections":["gear","skills"]}' | yarn mcp:call build
```

Arguments: `id` (build_id) or `slug` (the guide's primary profile; a title also works), `tab` (default: the default tab), `sections` (subset of `gear, idols, blessings, passives, skills, notes`, default all). `get` kind `build` with a build_id or slug is the same call with the defaults.

Returns `build` (the `builds` header plus `profile_id`, `profile_name`, `profile_date`), `tab` (`name, ord, is_default, level, class, mastery, passive_points, skill_points`), `strengths`, `weaknesses`, and per section:

| section | content |
|---|---|
| `gear` | per slot: `name` (unique or base), `kind` (`unique` / `legendary` = unique with extra affixes / `set` / `exalted` / `rare` / `magic`), `unique_id`, `set`, `base`, `base_type`, `base_type_id`, `sub_type_id`, `corrupted`, `implicits` (`{stat, value, modifier}` at the item's roll), `affixes` (`{affix_id, name, tier, type: prefix/suffix, origin, roll, values: [{stat, value, modifier}]}`) |
| `idols` | the same per idol, with `grid_x`, `grid_y` (top-left cell on the 5x5 altar) and `size` (`1x3`) |
| `blessings` | `{timeline_id, timeline, blessing_id, name, is_grand, roll}` |
| `passives` | groups per mastery (`Sentinel`, `Void Knight`, ..., `Weaver`): `{tree_id, mastery_index, mastery, points, nodes: [{node_id, name, points, max_points}]}` |
| `skills` | `{ability_id, name, specialized, spec_slot, on_bar, bar_slot, tree_id, points, nodes}`; nodes only for specialized skills (other trees are planner leftovers and carry a `note`) |
| `notes` | `{guide: {intro, faqs, summary, changelog}, tab: {skills, passives, equipment}}` as plain text |

Values are in stored units: `increased` / `more` are fractions (`0.08` = 8%), `roll` is 0..1 inside the tier range (1 = max). For the example: Endgame weapon World Splitter (unique 365, Bardiche, corrupted) with extra affix Melee Void Damage T7 (`+65`), Erasing Strike 26 points with Time Loop at 1 point.

### `item_usage`: who uses an item or an affix

```bash
printf '%s' '{"name":"World Splitter"}' | yarn mcp:call item_usage
printf '%s' '{"affix":"Mana","slot":"head","mastery":"Void Knight"}' | yarn mcp:call item_usage
```

Arguments: `name` or `unique_id` (unique / set item), or `affix` (id or name) with optional `slot`; optional `tab` (default any tab), `class`, `mastery`, `limit` (100).

Unique: `{item: {kind: "unique", name, unique_ids}, total_builds, matched_builds, by_slot: {slot: builds}, by_mastery: {mastery: builds}, common_extra_affixes: [{affix_id, name, builds, typical_tier}], builds: [{build_id, slug, title, mastery, main_skill, tab, tabs?, slot, extra_affixes: [{affix_id, name, tier, origin}]}]}`. One entry per build, taken from its default tab when the item is used there (`tabs` lists every tab using it). `extra_affixes` are the affixes on the unique (legendary potential or a Weaver's Will slam, the data does not say which) and its corruption.

Affix: `item: {kind: "affix", name, affix_ids, affixes: [{affix_id, type, name}]}`, `by_slot: {slot: {builds, items, typical_tier, min_tier, max_tier, origins}}` and `builds: [{..., slot, item, item_kind, tier, origin}]` (one entry per build and slot). `typical_tier` is the most common tier. `matched_builds` is the number of builds after the class / mastery filters.

### `slot_meta`: what a slot looks like across builds

```bash
printf '%s' '{"slot":"helmet","mastery":"Void Knight"}' | yarn mcp:call slot_meta
```

Arguments: `slot` (required: `weapon`, `offhand`, `head` / `helmet`, `body` / `chest`, `waist` / `belt`, `hands` / `gloves`, `feet` / `boots`, `neck` / `amulet`, `ring` (both fingers) / `finger1` / `finger2`, `relic`, `altar`, `idol`), optional `class`, `mastery`, `ability` (main skill), `tab` (default `Endgame`), `kind` (`unique` = unique / legendary / set, `rare` = rare / exalted / magic, `all`), `limit` (25 rows per list).

Returns `{slot, tab, kind, matched_builds, tab_fallback_builds?, items: [{name, kind, unique_id?, base?, count, pct, example_builds: [slugs]}], affixes: [{affix_id, affix, count, pct, typical_tier, type, origins}]}`. `count` is builds, `pct` = count / matched_builds. With the default tab, builds that have no Endgame-like tab (leveling guides) use their default tab and are counted in `tab_fallback_builds`. The example: 7 Void Knight builds; Leonine Greathelm (rare / exalted base) in 4, Mask of Indifference in 3; Health, Vitality and Mana are the most common helmet affixes.

### Search and lookup

`search` kind `build` indexes title, class, mastery, main skill, author and slug; `lookup` kind `build` resolves a title or a slug to the build_id (`hint` = slug, class / mastery, main skill):

```bash
printf '%s' '{"name":"erasing-strike-void-knight-guide","kinds":["build"]}' | yarn mcp:call lookup
printf '%s' '{"query":"void knight volca","kinds":["build"],"limit":5}' | yarn mcp:call search
```

For anything the tools do not cover, query the views with `sql` (`v_build_summary`, `v_build_items_named`, `v_item_usage`, `v_affix_usage`, `v_build_nodes_named`); the tool-facing notes in schema.md section 3.9 list the pitfalls (pick a tab, count builds not items).

## Caveats

- **Guide date vs game version.** `updated` is the guide's last edit and `season` its season tag, not the game version; the database pins the game data (1.5.2) the ids were resolved against. Season 4 guides are still listed; filter with `season` when it matters. Guides are edited often, so a refetch changes the rows.
- **Planner state, not a character.** Values are what the author typed into the planner (often perfect `roll: 1`, tier 7 everywhere in Aspirational tabs). Legendary potential, Weaver's Will and forging potential are not in the data; affixes on a unique are `extra` whatever made them.
- **Tabs differ a lot.** Starter tabs are budget gear, Aspirational tabs are best-in-slot wishes. Say which tab a number comes from; the tools default to the default tab (`build`), the Endgame tab (`slot_meta`) or any tab (`builds`, `item_usage` filters).
- **Small samples.** 74 builds over 15 masteries means 2 to 10 builds per mastery (leveling guides included): a percentage in `slot_meta` is "3 of 7 guides", not a population statistic. Report counts with the percentage.
- **Inline items.** Some profiles store an item object directly in a slot instead of a key into the item map (212 items in 12 profiles); they are decoded the same way and stored with `item_key = 'inline'`. Nothing to do for a reader; it only matters when reading raw profiles.
- **Leveling guides.** Their planner opens on a base-class `Starting Setup` tab, so the build row's mastery is the base class (e.g. Acolyte for `necromancer-leveling-guide`) while the guide is for the mastery on its card (`guide_mastery`; `guide_mastery_index` in the table). The `mastery` filters match either. Their later tabs (`Final Setup ...`) hold the mastered build.
- **Main skill.** `main_skill` is the planner's `mainset` skill when it names one, else the specialized skill named in the title, else the specialized skill with the most points (`main_ability_source`). Two planners name an item instead (`main_unique`): Reflect Shaman (Thicket of Blinding Light) and Anurok Frogs Beastmaster (Chorus of the Anurok); their main skill comes from the fallback rules (Spriggan Form, Summon Wolf), so filter those guides by `item` rather than `ability`.
- **Removed nodes.** A tree history can name a node removed in an older patch (1.5.2: Volatile Reversal node 3 in the Shield Rush Forge Guard Starter, Endgame and Aspirational tabs). Such points are dropped, so that tree shows one point fewer than the planner history.

Build report warnings (`community.warnings`, none of them affects the tools beyond what is described above): `guide_mastery` 8 (leveling guides), `mainset_unique` 2, `removed_node` 3.

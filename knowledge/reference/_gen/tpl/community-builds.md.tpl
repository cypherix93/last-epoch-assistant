# Community Builds
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Labels: **A** asset data (game ids), **X** Maxroll/community 2026 (every build fact on this page), **U** unverified/stale.

## Summary
- The database holds Maxroll build guides with their planner profiles for game 1.5.2 (eight `community_*` tables, five views; schema in `docs/schema.md` section 3.9). Counts below are generated from the database (X).
- It is guide data, not game truth: it records what Maxroll's authors recommend for 1.5.2 (X). A usage count is "N of M guides"; the sample is skewed to popular skills (some masteries have 1-3 guides), so "0 builds" means "no guide uses it", not "bad".
- Every id is a game id, so a build joins to `uniques`, `affixes` / `mods` (tier rolls), `item_subtypes`, `blessings`, `trees` / `tree_nodes` and `abilities` (A for the ids, X for the choices).
- Slots are the planner's: `weapon`, `offhand`, `head`, `body`, `hands`, `waist`, `feet`, `neck`, `finger1`, `finger2`, `relic`, `idol`, `altar`. Affix origin `extra` = slammed or legendary-potential on a unique; the data does not tell the two apart.
- `tier_corruption` / `tier_speed` / `tier_bossing` are the guide authors' S/A/B/C tier-list entries (X); leveling guides have none. Do not quote them as game facts.
- Use the tools `builds`, `build`, `item_usage`, `slot_meta` (skill `le-data-query`, "Community builds") or the SQL below; use `le-bis-selection` to turn the counts into a gear plan and `le-build-around-item` Phase C2 for the meta check.
- A guide whose class and mastery name are equal (for example Sentinel / Sentinel) is a base-class (leveling) guide, `mastery_index` 0.

## What the dataset is

Source: the Maxroll build-guide index and one planner profile per guide (`data/raw/<ver>/maxroll-guides/`, loaded by `packages/db/src/loaders/community.ts`; raw shapes in `docs/data-sources/maxroll.md#planner-profiles-community-build-guides`). A guide can have several planner tabs (Starter, Endgame, Aspirational); `v_build_summary` reports the default tab, `v_item_usage` and `v_affix_usage` count builds over all tabs (`default_builds` counts the default tab only).

{{gen:community.counts}}

Builds per class and mastery:

{{gen:community.by_mastery}}

Tier-list entries (X, author opinion):

{{gen:community.tiers}}

## How to query it

Views: `v_build_summary` (one row per build), `v_build_items_named` (one row per item with `affixes_text`), `v_item_usage` (unique x slot), `v_affix_usage` (affix x slot x origin), `v_build_nodes_named` (allocated passive and skill nodes). Run these through `sql`:

```sql
SELECT slug, main_skill, tier_corruption, tier_speed, tier_bossing
FROM v_build_summary WHERE mastery_name = 'Void Knight' ORDER BY slug;
```

```sql
SELECT name, slot, builds, default_builds FROM v_item_usage WHERE slot = 'weapon' ORDER BY builds DESC, name LIMIT 10;
```

```sql
SELECT n.node_name, n.points, n.max_points FROM v_build_nodes_named n JOIN v_build_summary b ON b.build_id = n.build_id
WHERE b.slug = 'erasing-strike-void-knight-guide' AND n.is_default = 1 AND n.kind = 'passive' AND n.mastery = 2 ORDER BY n.first_ord;
```

The last query lists the Forge Guard nodes (mastery 2 of the Sentinel) that the Erasing Strike Void Knight guide takes; see `classes-and-masteries.md`, "Mastery access rule".

## The builds

All builds, grouped by class and mastery (Tiers C/S/B = corruption / speed / bossing as the guide author gives them, X):

{{gen:community.builds}}

## Pitfalls
- Counts depend on the guide mix: Beastmaster has 8 guides, Falconer 1. Compare shares within a mastery only when it has several guides, and widen to the class when it has one (X).
- The tiers are tier-list opinions that Maxroll changes between updates; a proposal must not present them as a measured result.
- Planner leftovers: `community_build_skills` rows for skills that are not specialised have no effect in game; filter on `is_specialized` (X, schema 3.9).
- A usage count over `v_item_usage.builds` counts a guide once per item, over all of its tabs; use `default_builds` for the tab the planner opens on.
- An id that did not resolve is kept as is and counted in `data/le.build-report.json` under `community.unresolved`; the property 120 (`EffectOfAilmentOnYou`) has no display name (X).
- When a proposal differs from a community build, say how; when it matches one, say so rather than calling it novel.

## Sources
- `docs/schema.md` - tables and views of section 3.9 (X).
- `docs/data-sources/maxroll.md` - raw shapes of the guide index and the planner profiles (X).
- `data/le.build-report.json` - load counts and unresolved ids (A).
- `knowledge/reference/_gen/gen_community.cjs` - generator of the tables on this page, reads `data/le.sqlite`.

---
name: le-bis-selection
description: Use when you must pick the best-in-slot gear for a known Last Epoch build - "what should I wear in each slot", "best helmet/boots/ring for my Void Knight", "gear plan for this build", "what do I slam on it" - given a mastery, main skill, scaling stats and defensive needs. Per-slot procedure over community usage, uniques, rare affixes and legendary-potential slams, ending in a per-slot table.
---

# Best-in-slot selection per slot (Last Epoch 1.5.x)

## Overview

Input: a build (class, mastery, main skill, the stats that scale it, the defensive gaps it must close). Output: for each gear slot, idols and blessings, a primary pick with a reason, a community usage count and an alternative, in one table.

**Core principle:** three independent searches per slot, then reconcile. (1) What do the community guides wear there? (2) Which uniques match the build's stat wishlist, including the defensive wishlist? (3) Which rare affixes (and slams) fill the slot? A pick that only one search supports is flagged as such. Never call anything "best" or "meta"; a community count is "N of M Maxroll guides (1.5.2, label **X**)", not game truth.

**Stat-stick lesson (from an evaluation).** Uniques whose value is a stat profile, not a damage line, are easy to miss when you search by damage tags: crit avoidance plus stun immunity (Mask of Indifference, uid 434: Stun Immunity, reduced crit damage taken, Endurance Threshold), attack speed (Army of Skin, Thorn Slinger), movement speed (almost every boots unique), the endurance cap. A damage-tag search never returns them. Always run the search a second time with the **defensive and utility wishlist** (crit avoidance SP 89 and 114, stun avoidance SP 12, stun immunity SP 56, immunity SP 128, endurance SP 75 / 76, movement speed SP 9, attack speed SP 2), not only the damage wishlist.

## When to use

- The build is chosen and gear must be filled in: by itself, or as the gear step of **le-build-around-item** (Phase E step 19) and for **le-build-audit** fixes.
- NOT for "I dropped X" (use **le-build-around-item**), NOT for auditing a finished gear set (use **le-build-audit**), NOT for pure lookups (use **le-data-query**).

## Prerequisites and tools

REQUIRED: **le-data-query** (tool shapes, quoting rules for apostrophes and `<`, `>`, `%`), **le-mechanics-reference** (labels). Useful: **le-damage-reasoning** and **le-defense-reasoning** to turn the stat wishlist into numbers.

Community-data tools (`le-data` MCP server; shapes in **le-data-query**, "Community builds"):

```
slot_meta({slot, class?, mastery?, ability?, tab?, kind?})       -> {matched_builds, items:[{name, kind, count, pct, example_builds}], affixes:[{affix, count, pct, typical_tier, prefix|suffix}]}
item_usage({name? | unique_id? | affix?, slot?, tab?, class?, mastery?})   -> {item, total_builds, by_slot, by_mastery, builds:[...]}
builds({class?, mastery?, ability?, ...})  and  build({id? | slug?, tab?, sections?})
```

(Signature sketches. The SQL below runs against the same views and is the fallback: `v_item_usage`, `v_affix_usage`, `v_build_items_named`, `v_build_summary`, `v_build_nodes_named`.)

## Slots and where each lives in the data

| Slot | Community `slot` | `item_base_types.name` for uniques and affixes |
|---|---|---|
| Helmet | `head` | Helmet |
| Body armour | `body` | Body Armor |
| Gloves | `hands` | Gloves |
| Belt | `waist` | Belt |
| Boots | `feet` | Boots |
| Weapon | `weapon` | One-Handed Axe, Dagger, One-Handed Mace, Sceptre, One-Handed Sword, Wand, Two-Handed Axe / Mace / Spear / Staff / Sword, Bow |
| Off-hand | `offhand` | Shield, Off-Hand Catalyst, Quiver (none with a two-handed weapon) |
| Amulet | `neck` | Amulet |
| Ring x2 | `finger1`, `finger2` | Ring |
| Relic | `relic` | Relic |
| Idols | `idol` (grid), `altar` | Small ... Adorned Idol (base types 25-33), Idol Altar (41) |
| Blessings | one per timeline | `blessings`, `v_blessings` |

Only one primordial item and one copy of a unique idol is allowed; two-handers rule out an off-hand (`knowledge/reference/item-system.md`, `knowledge/reference/uniques-sets-legendary.md`).

## Procedure

### Step 0: the wishlist

Write the build down as two lists of stat properties (SP ids; resolve with `SELECT property, name FROM stat_properties WHERE name LIKE '%Speed%'`):
- **damage wishlist**: the scaling stats for the main skill (its damage type and tag mask, crit, attack or cast speed, penetration, ailment stats). Take them from **le-damage-reasoning** Step 4.
- **defensive and utility wishlist**: the gaps from **le-defense-reasoning** (resistances, armour, dodge, block, ward, endurance and threshold, crit avoidance, stun avoidance and immunity, health, movement speed, leech and recovery).

Also write the constraints: build level (item `level_requirement`, class requirement of the base), the weapon type the main skill needs, off-hand allowed or not, the one-primordial rule.

### Step 1: community-standard picks (per slot)

Call `slot_meta` for the build's mastery (and main skill when several guides share it), once per slot, and record the top items (with `count` and `matched_builds`) and top affixes (with `typical_tier`, prefix or suffix). With SQL (example 3 below) the same question is "which uniques and legendaries do guides of this mastery wear in this slot, in how many builds". If `matched_builds` is 0 or 1 for the mastery, widen to the class, or to builds that share the main skill (`any_skill`), and say that the sample is thin. If a community build for the same mastery and main skill exists, read it with `build` (gear per slot with affixes, tier and origin) and note where your plan differs and why.

### Step 2: uniques that fit the wishlist (damage AND defensive)

Search `v_unique_summary` for uniques whose base type is the slot's, joined to their mods on the wishlist properties. Run it twice, once per wishlist (example 1 runs the defensive and utility list; swap the `VALUES` list for the damage list). Read every hit's `mods_text` and `tooltip_text`: a unique can be right for its coded effect (SP 98 / 58 lines, tooltip only) with none of the wishlist stats on it, and `knowledge/interactions/unique-effects-index.md` has one row per unique (grep it, the page is 118 KB). Check the level requirement against the build level and the class requirement of the base; check `is_primordial`, `lp_eligible`, `weavers_will` on `uniques`.

### Step 3: rares and exalted: the affixes that roll on the slot

For a rare slot, list the wanted affixes that can roll on the slot's base type with the T7 range (drop tier) next to the T5 range (craftable); T8 is the primordial tier (`knowledge/reference/crafting.md`). Use example 2; change `m.tier` for other tiers and the `IN (...)` list for other properties. Cross-check each wanted affix against `typical_tier` from `slot_meta` or `v_affix_usage`: guides rarely ask for more than T5-T7. A rare has at most 2 prefixes and 2 suffixes (`knowledge/reference/item-system.md#affix-slots-tiers-sealed-affixes`).

### Step 4: legendary-potential slam targets

A unique can be taken as a legendary only when `uniques.lp_eligible = 1` (derived: not a set item, `legendary_type` 0; Weaver's Will items have `weavers_will = 1`; **U**, confirm in game; a corrupted copy cannot become legendary). Which affixes to slam: the affixes that can roll on the unique's base type (Q10 in **le-build-around-item**) intersected with the build's wishlist, ranked by how often guides add them in that slot (`origin = 'extra'` in `v_affix_usage`, example 3b; the data does not separate LP from slam). Quote the tier guides use (`avg_tier`) as a target, not as a promise. **Quote the slam range scaled for the item's base, not the stored tier range:** read it from `v_affix_values` (one row per affix x base type x tier x line: `stored_min/max` = the data, `scale_factor`, `value_min/max` = the range on that base). Example (World Splitter, a Two-Handed Axe, std 0.75 vs base 2.2): Melee Void Damage T7 is stored 51-65 and scales x1.8286 to 93-119 (below). The scaled numbers follow the decompiled formula (`item-system.md#affix-effectiveness-affixeffectmodifier-and-value-formula`, **D**) but have not been checked against the in-game tooltip: label them **D?** / **U**.

```sql
SELECT u.name AS unique_item, u.base_type, v.affix_name, v.tier, v.std_aem, v.item_aem, v.scale_factor,
       v.stored_min || '-' || v.stored_max AS stored, v.value_min || '-' || v.value_max AS scaled
FROM v_unique_summary u
JOIN v_affix_values v ON v.base_type = u.base_type
WHERE u.unique_id = 365 AND v.affix_name = 'Melee Void Damage' AND v.tier = 7 AND v.ord = 0;
```

### Step 5: idols and blessings

- Idols: the affixes the guides take (`v_affix_usage` with `slot = 'idol'`, example 4); then the affixes that roll on idols for the wishlist stat (Q11 in **le-build-around-item**). Class restriction: `affixes.class_names`.
- Blessings: one per timeline (`v_blessings`; Q12). Community picks (example 5); choose the Grand variant where the guides do and the stat closes a defensive gap.

### Step 6: reconcile and write the table

For each slot decide between the community-standard pick (Step 1), a wishlist unique (Step 2) and a rare plan (Step 3). Choose the primary by: closes a stated gap, supported by two of the three searches, level and class requirements met. Keep one alternative of a different kind (a unique primary with a rare alternative, or the reverse). Output:

| Slot | Primary pick (unique name, or rare base with its affixes as stat lines and tier) | Why (stat or effect in in-game wording, with label) | Community usage | Alternative | Notes (LP / slam as stat lines, tier target, risk) |
|---|---|---|---|---|---|
| Helmet | | | N of M builds (X) | | |
| Body | | | | | |
| Gloves | | | | | |
| Belt | | | | | |
| Boots | | | | | |
| Weapon | | | | | |
| Off-hand | | | | | |
| Amulet | | | | | |
| Ring 1 | | | | | |
| Ring 2 | | | | | |
| Relic | | | | | |
| Idols | | | | | |
| Blessings | | | | | |

"Community usage" is the `count` out of `matched_builds` from `slot_meta` (or the `builds` column of the SQL), or "0 of M: no guide uses it" with the risk stated. Add the resistance and endurance totals of the chosen set to show the defensive wishlist is closed (**le-defense-reasoning**), and a label D / A / G / X / U on every number.

The table is player-facing: in-game names only ("Mask of Indifference (unique helmet)", "+116-140% Chance to Shock on Lightning Hit (T7)", "Grand Bastion of Divinity (Ending the Storm blessing)"), never uids, affix ids, SP ids or slugs. The SP-id wishlist is your working note; list the ids, each next to its name, in a closing Sources list (**le-data-query**, "Player-facing names").

## Executable examples

Example 1. Stat-stick search by the defensive and utility wishlist for one slot (param: the base type name; Helmet shown, which returns Mask of Indifference with stun immunity plus endurance threshold). A damage-tag search misses every row of this list:

<!-- params: ["Helmet"] -->
```sql
WITH wish(property, why) AS (VALUES
  (89, 'crit avoidance'), (114, 'less crit damage taken'), (56, 'stun immunity'), (128, 'immunity'),
  (12, 'stun avoidance'), (2, 'attack speed'), (9, 'movement speed'), (75, 'endurance'), (76, 'endurance threshold'))
SELECT u.unique_id, u.name, u.level_requirement, u.lp_eligible,
       count(DISTINCT w.property) AS wanted_stats, group_concat(DISTINCT w.why) AS why
FROM v_unique_summary u
JOIN mods m ON m.source_kind = 'unique_mod' AND m.source_id = CAST(u.unique_id AS TEXT)
JOIN wish w ON w.property = m.property
WHERE u.base_type = ?
GROUP BY u.unique_id
ORDER BY wanted_stats DESC, u.name
LIMIT 15;
```

Example 2. Rare affixes that roll on the slot's base type, wanted properties only, T7 range (param: the base type name; Boots shown, which returns movement speed and crit avoidance). `special_affix_type = 0` keeps normal affixes (not idol, experimental, set or corrupted ones); `rolls_on = 0` is equipment:

<!-- params: ["Boots"] -->
```sql
SELECT a.affix_id, a.name, a.affix_type_name AS prefix_or_suffix, m.source_ord AS line,
       m.property_name, m.tag_names,
       CASE m.modifier_type WHEN 0 THEN 'added' WHEN 1 THEN 'increased' WHEN 2 THEN 'more' END AS kind,
       m.value_min AS t7_min, m.value_max AS t7_max
FROM v_affix_summary a
JOIN affix_can_roll_on r ON r.affix_id = a.affix_id
JOIN item_base_types bt ON bt.base_type_id = r.base_type_id AND bt.name = ?
JOIN mods m ON m.source_kind = 'affix_tier' AND m.source_id = CAST(a.affix_id AS TEXT) AND m.tier = 7
WHERE a.rolls_on = 0 AND a.special_affix_type = 0
  AND m.property IN (0, 2, 4, 5, 9, 12, 56, 75, 89)
ORDER BY m.property, m.value_max DESC
LIMIT 25;
```

Example 3. Community-standard picks: uniques, legendaries and sets that guides of one mastery wear in one slot, with the number of guides of that mastery as `matched_builds` (params: mastery name twice, then the community slot; Paladin and `finger1` shown; `kind = 'legendary'` is a unique with legendary potential, as the guides record it):

<!-- params: ["Paladin", "Paladin", "finger1"] -->
```sql
SELECT i.item_name, i.kind, count(DISTINCT i.build_id) AS builds,
       (SELECT count(*) FROM v_build_summary WHERE mastery_name = ?) AS matched_builds
FROM v_build_items_named i
JOIN v_build_summary b ON b.build_id = i.build_id
WHERE b.mastery_name = ? AND i.slot = ? AND i.kind IN ('unique', 'legendary', 'set')
GROUP BY i.item_name, i.kind
ORDER BY builds DESC, i.item_name
LIMIT 10;
```

Example 3b. Slam targets: the affixes guides add to uniques in a slot (`origin = 'extra'`: LP or slam, not distinguished by the data), most common first (param: the community slot; `head` shown):

<!-- params: ["head"] -->
```sql
SELECT au.affix_id, a.name AS affix, a.affix_type_name AS prefix_or_suffix, au.builds, au.items, round(au.avg_tier, 1) AS avg_tier
FROM v_affix_usage au JOIN affixes a ON a.affix_id = au.affix_id
WHERE au.slot = ? AND au.origin = 'extra'
ORDER BY au.builds DESC, a.name
LIMIT 10;
```

Example 4. Idol affixes the guides use, most common first (all idol shapes):

```sql
SELECT au.affix_id, a.name AS idol_affix, au.origin, au.builds, au.items, round(au.avg_tier, 1) AS avg_tier
FROM v_affix_usage au JOIN affixes a ON a.affix_id = au.affix_id
WHERE au.slot = 'idol'
ORDER BY au.builds DESC, a.name
LIMIT 10;
```

Example 5. Blessings the guides take, by timeline:

```sql
SELECT bl.name AS blessing, tl.name AS timeline, cb.is_grand, count(DISTINCT p.build_id) AS builds
FROM community_build_blessings cb
JOIN community_build_profiles p ON p.build_profile_id = cb.build_profile_id
JOIN blessings bl ON bl.sub_type_id = cb.blessing_id
JOIN timelines tl ON tl.timeline_id = cb.timeline_id
GROUP BY bl.name, tl.name, cb.is_grand
ORDER BY builds DESC, bl.name
LIMIT 10;
```

## Honesty rules

- Community counts are guide data for 1.5.2 (**X**), skewed to popular skills; "0 builds" means "no guide uses it", not "bad". Say how many guides matched.
- A wishlist match is a stat match, not a verdict: read the unique's tooltip and its `unique-effects-index.md` row for drawbacks (**le-build-around-item** Q14).
- Tier targets: T5 craftable, T6-T7 drop, T8 primordial; quote the tier with every range. Percent values are fractions in the data.
- Never write "meta", "best", "proven", "S-tier". Write "community-standard (N of M guides)", "plausible", "to test".
- `lp_eligible` is derived, not stored per unique: label LP plans **U**.
- Never show internal ids in player-facing text; use the in-game name as the game UI shows it. Ids go only in the closing Sources list, paired with the name.

## Red flags: stop and go back

| Thought | Reality |
|---|---|
| "Search uniques for the skill's damage tags and done." | Stat sticks (crit avoidance, stun immunity, speed, endurance) have no damage tag. Run the defensive wishlist too (Step 2). |
| "The guides all wear it, so take it." | Counts are popularity, not fit. Check the stat wishlist, the level and the class requirement. |
| "No guide wears it, so skip it." | Thin samples (1-2 guides per mastery) prove little. Say so. |
| "Rings are one slot." | Two ring slots (`finger1`, `finger2`); count both. |
| "T8 is the target." | T8 is primordial; plan with T5 (craft) or T7 (drop). |
| "A two-handed weapon plus a shield." | Two-handed bases leave the off-hand empty. |
| "Helmet: uid 434; rings: affix 330 T7." | The player sees names, not ids: "Mask of Indifference (unique helmet)", "+50-60% increased Mana Regen (T7)". Ids only in Sources. |

## Final checklist

- [ ] Wishlist written in two parts (damage; defensive and utility) with SP ids
- [ ] `slot_meta` (or example 3) run for every slot; matched build counts recorded
- [ ] Unique search run for both wishlists in every slot
- [ ] Rare affixes with T7 range (and T5 for craftable) for each rare slot
- [ ] LP eligibility checked for each unique that is to become legendary; slam targets named
- [ ] Idols and blessings covered
- [ ] Output table complete: primary, why, community usage, alternative
- [ ] Resistance, endurance and stun answers verified across the chosen set
- [ ] Every number labelled; no "meta" / "best" wording
- [ ] No ids in the table or prose (uniques by name and slot, affixes as stat lines with tier, blessings with timeline); ids only in Sources, next to their names

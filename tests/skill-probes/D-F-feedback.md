> **Evidence, not guidance.** Feedback from the skill-probe agents (2026-10-08, game data 1.5.2), produced with the `.claude/skills/` text as it was *before* the commit that added this folder applied the feedback. Quotes and line numbers refer to that earlier skill text; the current skills supersede it. See `tests/probes/README.md` and `.claude/skills/README.md`.

# Feedback: le-defense-reasoning (D), le-build-audit (E), le-build-around-item (F)

Method: read SKILL.md with cat, executed every example call/SQL (the ones I did not run during the task I ran afterwards in a batch with their own example parameters: all returned ok:true). Tool call and time figures are approximate (I only timestamped phases; wall time includes my own reasoning).

## Summary table

| Skill | (a) Examples worked | Tool invocations (approx) | Wall time (approx) |
|---|---|---|---|
| D le-defense-reasoning | 100% of calls ran (find_mods x2, get, knowledge, passive_tree, 6 SQL). Several outputs misleading, see (b) | ~25 `yarn mcp:call` in 9 Bash calls | ~2.5 min incl. reading and writing |
| E le-build-audit | 100% of its SQL ran ok (Step 1 x4, 2 dead-stats, 4 sustain, 5 mana, 6 traversal, 8, 9). 1 non-skill failure (PRAGMA) | ~45 invocations in 11 Bash calls | ~3.5 min |
| F le-build-around-item | all 16 query-cookbook recipes (Q1-Q15, Q10b) ran ok with their own example params; Q14/Q4/Q6 etc. ok via stdin/@file | ~40 invocations in 15 Bash calls + 1 JSON read | ~6.5 min |

Failures (exact):
1. `printf '%s' '{"query":"PRAGMA table_info(affixes)"}' | yarn mcp:call sql` -> `{"ok":false,"error":"Only SELECT or WITH ... SELECT queries are allowed"}` (my own probe to discover columns; the skills should say "use `schema {"table":"affixes"}`").
2. `v_unique_summary` has no `is_primordial` column: `SELECT ... is_primordial ... FROM v_unique_summary` -> `SQL error: no such column: is_primordial` (my own query; F Q3 uses `uniques`, fine, but the skill never says which view lacks it).
3. `ability_id` query on `ailments`: `SELECT * FROM ailments WHERE ability_id = ...` -> `SQL error: no such column: ability_id` (my guess; no skill states ailments key columns).
4. A bash heredoc containing apostrophes ("Naga's Fang", "Falcon's Hood") inside `cat > file <<'E' ... E` died with `unexpected EOF while looking for matching '''` in the Bash tool; I switched to the Write tool. Not a skill defect, but the skills' advice to use `<<'JSON'` stdin is fragile for names with apostrophes inside one big multi-statement command: tell agents to write JSON to a file and use `@file.json`.

---

## D. le-defense-reasoning

### (a) Did it work
Everything ran. Result was usable: I produced resMult, armour DR, pool_post, hits-to-die and ranked fixes without guessing formulas. The worked example arithmetic reproduces (776 hit, 605 proxy, f(300)=280.5).

### (b) Unclear, missing or wrong
1. Armour level: Step 3 says "With `L = a + 5` (area level)" and the table is headed "At area 100", but the closing sentence says "Tables use *area* level". Reproducing the table value (armour 5000 -> 63.7%) needs L = 105; with L = 100 the formula gives 64.5%. So the table is at "area 100" = L 105 and the prose "L = a + 5" is the only hint. Quote: `With L = a + 5 (area level)`. State once, unambiguously: "plug L = area level + 5 = 105 for endgame monolith".
2. Dodge input: the skill only handles dodge *rating* (`x = dodge rating`). Users often state "30% dodge chance". There is no instruction how to treat a final chance (use it directly as avoidance). Add: "if the user gives a percent, use it as dodge; only convert rating -> % with the formula".
3. Endurance application is ambiguous. Quote: `pool_post = (H - T) + T/(1 - e)` and `damage below T takes (1 - e)` and layer 4 `endurance on the part below the threshold`. Is the threshold compared to health remaining (damage that brings you below threshold) or to hit size? The pool formula implies a health-threshold partition; the EHP step then divides pool by per-hit damage with no mention. My result (hit 687 > T 480) forced me to guess. Add one sentence and a worked case where a single hit exceeds T.
4. Step 1 SQL "What defensive affixes can roll on a slot" groups by property across all affixes and returns `min(value_min)` and `max(value_max)`. Output mixes percent and flat affixes and all tiers: Health "t1_low 0.03, t8_high 325", Fire Resistance "t1_low 0.05, t8_high 1.5" (150%?!). Column labels `t1_low`/`t8_high` are false (it is the min/max over all affixes, not T1 low/T8 high). Dangerous for a "what am I missing" answer. Rewrite to group by affix_id and show tier 5 and top tier.
5. "T8 is the highest tier and the Primordial tier; T5 is the best craftable": the same data shows Fire Resistance affix 13 tier 8 = 120-150% and Endurance affix 92 tops at tier 7 (27-35%) on belt. Fire res 120-150% is not a plausible item roll in the actual game; likely a data/scale artefact. The skill should warn that tier 8 rows may be Primordial-scaled or flat-mod mislabelled, and tell the agent to quote T5/T7 for planning.
6. Data oddity worth a gotcha: affix 644 "Level of Warcry" appears under property 76 (Endurance Threshold) with threshold-like values in an affix_tier join (`SELECT ... WHERE m.property IN (75,76,6)` returned it). Agents following the skill's SQL will cite it as an endurance source. Add a "filter out affixes whose name does not match the stat" line, or document why it is there.
7. The "monolith monster mods" query (Step 7) returned 8 rows and no penetration rows although the prose promises "mods that add ... penetration" (property 59 is in the IN list but absent). Either fix the claim or say the DB has no player-facing penetration monolith mods.
8. No recipe for where to get fixes: Step 1 covers affixes only. I had to invent queries for blessings (`v_blessings` by property), idol affixes (affix_can_roll_on with `item_base_types.name LIKE '%Idol'`), and gear slot comparisons. The user ask "ranked fixes with data lookups for affixes/blessings/idols" is the main use case. Add three recipes: (i) blessings by property: `SELECT timeline_name,name,is_grand,property_name,value_min,value_max FROM v_blessings WHERE property IN (...)`; (ii) idol affixes per idol size (join affix_can_roll_on to base types 25-33); (iii) passive/skill node text (already present).
9. Report template has no field for "per-type table" even though the Core principle says "report the weakest type, not the average". Add an explicit per-type resMult/hits-to-die table and name the minimum.
10. The DoT line `151/s ... x(1 + 0.005 f)` is specified but the report does not say how to combine the 15% hidden reduction (x0.85) with resMult in Step 4's layer order; I multiplied, which seemed right. Show it in the worked example (the example has no DoT case).
11. No place for avoidance not covered (glancing 0, parry 0): the formula `(1-dodge)(1-parry)(1-0.35 glance)...` includes a 35% glance by default. It is unclear if glancing applies by default or only if the user has the stat; I treated as 0. Clarify.
12. Sentinel-specific examples (class_id 2) make agents look at class tree for a build with no class; add "if class unknown skip passive queries".

### (c) Cost
~25 tool invocations / ~2.5 min. Biggest time sink: building the fixes section (no recipes for blessings/idols).

### (d) Suggested edits
1. Pin L = area + 5 = 105 in the prose, recompute the table once with an explicit L column.
2. Add "dodge chance given directly" rule.
3. Add endurance per-hit worked case with hit > threshold.
4. Replace the slot-affix SQL with a per-affix version showing `tier 5` and `top tier` separately and filter to untagged player mods.
5. Add a warning on tier 8 magnitudes and affix 644 style mislabels.
6. Add blessing and idol recipes (3 short SQL blocks) plus one example "fix ranking" table.
7. Add a per-type resMult/hits-to-die table to the report template and a rule "state the minimum".
8. Fix or drop the "penetration" claim in Step 7.
9. Add a DoT worked example including the 15% hidden reduction.
10. Clarify default glancing/parry assumptions.

---

## E. le-build-audit

### (a) Did it work
Yes for every SQL as written (after substituting ids): masteries, Step 1 abilities query, `v_unique_summary` Calamity, blessing `34:101`, dead-stat query, sustain query, mana query, traversal query, missing-resist query, downside query. `lookup` flow works. Failures: none attributable to the skill.

### (b) Unclear, missing or wrong
1. The ledger step never says to check class requirements. Quote: table row `Items | unique by name (lookup), rares by affix names -> affix ids + tiers + rolls | affix_id, tier, roll, base type`. The class lock appears only in Common mistakes (`Suggesting items without checking class and level requirement`). In my audit "Rare Solarum Plate" is a Sentinel-only base (`item_subtypes.class_requirement_names = 'Sentinel'`); I found it by accident. Add to Step 1: for every item run `SELECT name, level_requirement, class_requirement_names FROM item_subtypes WHERE name = ?` and fail the ledger on mismatch.
2. Step 1: `Stop and fix the ledger if a name does not resolve; do not audit a guessed item.` conflicts with real usage: users give wrong names constantly (Naga's Fang, Falcon's Hood, "Minion Damage" small idol). Add a documented fallback: "list unresolved names, give the closest by FTS (`search ... kinds unique`) clearly marked as a substitute, and continue" and a ledger status column (resolved / substituted / invalid).
3. Idol resolution: the table says `idol affixes (affixes.rolls_on = 1), altar sub type`. There is no recipe for "does affix X roll on a Small idol" and `rolls_on = 1` does not encode idol size. I had to join `affix_can_roll_on` to `item_base_types` (`name = 'Small Idol'`, base_type 25) myself. Add that recipe; it exposed that a "Minion Damage" small idol affix does not exist.
4. Blessing resolution: `v_blessings by name` — `lookup` returns both subtype id `34:83` and blessing id `83`; the SQL example uses `'34:101'` (subtype-style). Say explicitly: "mods.source_id = '34:<sub_type_id>'".
5. Dead-stat query is mask-specific and silent on minion builds. The example mask `8388872` is Fire|Spell|Hit. For a Primalist minion build I got false "dead" flags on every Minion-tagged line (belt Minion Damage) and no way to build a mask for summon skills because `abilities.tag_names` is NULL for Summon Wolf/Scorpion/Frenzy Totem (tags empty in the table). The skill should say how to treat minion skills (use Minion bit 8192 plus the minion's tags, or skip Step 2 for minion lines) and warn about the NULL tags.
6. Step 2 says `run le-damage-reasoning Steps 1-11`; le-damage-reasoning is headed "Step 0 ... Step 10+" (I saw to Step 10; the reference to 11 may be off). Verify numbering.
7. Step 4 sustain SQL has hard-coded affix ids ('1058','1010','106') that are unrelated to the build and returns rows that look authoritative. Replace with a placeholder like `{{ids}}` comment, as in le-defense-reasoning.
8. No partial-audit mode. Template top says `## Verdict (3 lines)` and every section expects numbers; when the user supplies no tree/rolls the agent must invent U values. Add "Input completeness" box at top with the minimum inputs per section, and "If < X inputs, return an input request plus ledger-only audit".
9. Step 3 requires "hits to die against the 776-physical monolith melee reference" — fine — but without health/res inputs the section cannot be filled, and there is no instruction to list the exact missing inputs. Add that as a mandatory subsection ("Needed to continue").
10. `Step 7 ... marginal change from +10% of each pool` requires a bucket table; for audits with no rolls this is impossible; say to skip.
11. Skills list shows `skill_tree({"ability_id":...})` as ledger work but the audit does not specify what to extract from the tree for a no-allocation request (I listed downsides only). Add "if allocations are missing, list nodes with `is_downside = 1` and the top 5 nodes by tags".
12. Template lacks a "Ledger problems" section (invalid items, class locks, nonexistent affixes). Add it above Verdict.
13. The traversal SQL returns 14 rows; the skill says "Is there a traversal skill among the five?" but does not give a join to class_abilities to see class availability. Minor.

### (c) Cost
~45 invocations / ~3.5 min. Most time lost to idol/blessing/class-lock discovery (not in skill).

### (d) Suggested edits
1. Step 1: add class-lock check SQL, ledger status column, substitution rule.
2. Add idol-affix-by-size recipe and blessing id format note.
3. Fix dead-stat guidance for minion/DoT/NULL-tag abilities; include a minion-mask example.
4. Replace Step 4 hard-coded ids with placeholders.
5. Add a partial-audit mode and "Needed to continue" list.
6. Add a "Ledger problems" template section.
7. Confirm the le-damage-reasoning step range in Step 2.

---

## F. le-build-around-item

### (a) Did it work
Yes. `version`, `lookup`, `get unique`, all 16 query-cookbook recipes (Q1-Q15, Q10b) executed correctly, including params arrays and stdin/@file forms (note `[18]` numbers bind as numbers; strings for CAST ids, as the skill says). The Culnivar example file was consistent with the data format. The empty-db fallback was not needed; I did read `unique_effects.json` directly (line 11610-11760) and it matched the db.

### (b) Unclear, missing or wrong
1. Ignivar's `get` returned `mods`, `tooltips`, `subtypes` — good — but `lookup` hint says "Off-Hand Catalyst / Branded Skull"; nothing tells the agent that the interesting rule lives on **another ability** (Fire Aura, AbilityID 162, id `ability_gen98`). The id mapping index -> ability_id is not documented. I had to find it via `abilities.ability_index = 162` (the skill never mentions `ability_index` for resolving AbilityProperty/AP162). Add a recipe: `SELECT ability_id, name FROM abilities WHERE ability_index = ?` and note that "AP162" means ability_index.
2. Q9 uses `player_properties pp ON pp.idx = m.tags` for SP98; for SP58 AbilityProperty (Ignivar's third mod) there is no recipe (`ability_properties` has `ability_index, prop_index`). Add Q9b for SP58: `SELECT ... FROM ability_properties WHERE ability_index = (tags)`.
3. Step 5 / Phase B "rate equation": for a DoT (Fire Aura) the required inputs are in `ability_components.raw_json` (`damage`, `addedDamageScaling`, `DestroyAfterDuration`), tick count only appears in the ability `alt_text` ("140% per second"), and `addedDamageScaling` is per tick (0.7). The skill gives no recipe or note that ADE is per tick and the alt_text gives per second. I derived 2 ticks/s (U). Add a worked DoT-component recipe (the example is a mana converter, not a DoT).
4. Phase C step 9 uses a tag mask (`(tags & ?) = ?`). Ignivar's stat stick is "Fire" (8) but the *enabler* is "channelling", which is not a tag but `abilities.channelled = 1`. The skill has no query for flag-based archetypes. Add Q4b: `... WHERE channelled = 1`. I used it and it was the core of the divergent phase.
5. Step 10/12: no recipe for "all sources of an Ability's name" such as every unique/affix/passive/node mentioning Fire Aura. I used `v_unique_summary LIKE '%Fire Aura%'`, `v_affix_summary` LIKE, and Q7 / Q13. Add as Q16 (generic "mentions X" across uniques, affixes, class nodes, skill nodes).
6. Q14 false negatives: `tooltip_text` is NULL for several uniques (117 Dark Shroud of Cinders, 163 Herkir's Vessel) because their text is in `mods_text`; Q14 returned 0 rows for [74,117,163,311] which looks like "no drawbacks". Change Q14 to search `coalesce(tooltip_text,'') || ' ' || coalesce(mods_text,'')` and note the vacuous case.
7. Q13 returns `s.mastery` as an index (2) with no name: I had to look up `masteries` to learn mastery 2 = Spellblade. Join `masteries` in the recipe.
8. Q11 "idol affixes" has `rolls_on_text` but no shape/size column, so step 20 (idols: shapes) cannot be completed from the recipe. Add the affix_can_roll_on x item_base_types join.
9. Q12 (blessings by property) only filters on one property id; blessings are text-heavy (fire res, crit). Provide `property_name LIKE` alternative; the rule "one per timeline" needs a timeline list (`SELECT timeline_id,name FROM timelines`), absent.
10. Honesty rules say "no unlabelled numbers" and "Never write meta" while the template literal includes `Status: ... not a known or "meta" build` — fine, but the checklist item "no meta/proven language" would fail a grep of the template itself. Minor.
11. Length/depth: 31 steps + 13-section template + 7 phases is a lot for "what isn't the obvious thing?". The skill never says how deep a *second* skeleton should be or that a short outline is acceptable. I produced one full and one appendix outline. Add explicit guidance ("full skeleton for 1; outline allowed for the second") and a "minimum viable proposal" mode.
12. The score gate (`Damage < 2 or Defense < 2`) is unevenly applicable: scores are my judgement; no rubric examples for each integer. Add scoring anchors for novelty especially (e.g. "5 = no catalogue entry pairs these").
13. Step 6 "Q3" returns `is_primordial` etc. from `uniques`; but Q1's `v_unique_summary` lacks those columns; nothing warns, and an agent mixing them gets `no such column`.
14. The skill says to read `unique_effects.json` "formula and condition" but the file is ~36k lines; give the grep recipe (`grep -n '"uniqueID": 74'`) and offset (file entries are ~150 lines long).
15. Phase E step 17 expects node ids `<tree>:<node>`; `v_skill_node_summary.node_id` is numeric and Q6 builds the combined string, but `skill_tree` returns `id` only. Specify which to cite.
16. Steps 27-30 (honesty pass) duplicate the checklist; the checklist is 19 items. Trim to the checklist plus the Phase F bullets.
17. The template has no field for "alternatives considered but not chosen" beyond candidate table; fine, but "Gate result" and "Chosen" are in prose, easy to forget.

### (c) Cost
~40 invocations / ~6.5 min; heaviest part was Phase C (gathering ≥5 supported candidates) and filling gear/idol/blessing slots without recipes.

### (d) Suggested edits
1. Add the SP58 / ability_index recipe, Q4b (channelled flag), Q16 (mentions X), and a DoT-component worked example.
2. Fix Q13 (join masteries), Q14 (include mods_text), Q11 (add size join).
3. Add `ability_index` lookups and the `unique_effects.json` grep recipe.
4. Add scoring anchors and a "second skeleton may be an outline" rule.
5. Add a minimum-viable-proposal mode for casual questions.
6. Add a short "timelines list" query for blessings.

---

## Cross-cutting
- All three skills pass because the DB views are consistent; the weakest area is **non-affix, non-unique lookups** (idols by size, blessings by id, classes locked items, ability_index mapping). A single shared "le-data-query" appendix with 6 recipes would remove ~30% of the exploration in all three skills.
- `tooltip_text` NULL vs `mods_text` is a trap in several recipes.
- Tier 8 / Primordial magnitude warnings should be in le-data-query once.
- Count of concrete suggested edits: D 10, E 7, F 6 (23 total, plus cross-cutting).

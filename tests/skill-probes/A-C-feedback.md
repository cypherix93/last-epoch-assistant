> **Evidence, not guidance.** Feedback from the skill-probe agents (2026-10-08, game data 1.5.2), produced with the `.claude/skills/` text as it was *before* the commit that added this folder applied the feedback. Quotes and line numbers refer to that earlier skill text; the current skills supersede it. See `tests/probes/README.md` and `.claude/skills/README.md`.

# Feedback on le-mechanics-reference, le-data-query, le-damage-reasoning

Environment: Git Bash on Windows, data build 1.5.2, every `yarn mcp:call` ran from the worktree. No repo files modified (git status clean).

## Overall: no hard failures
Every example call, SQL pattern and `@file`/stdin form I ran returned `ok:true` with plausible data (stdin via `printf |` and heredoc both OK; `@/tmp/x.json` OK; Step 0 counts match: 486 uniques, 1,228 abilities, 182 player abilities, mods 23,446; 606 node damage lines; label counts 606/20/12 match; `find_mods modifier_type 2 + skill_node` returns 0 as claimed; every knowledge anchor I followed resolved). Failures are only usability and doc-accuracy issues below.

---
## 1. le-mechanics-reference
(a) Worked: yes. All 3 page fetches OK, all anchors I used exist (`defenses.md#armour`, `ward-health-sustain.md#31-decay`, `minions.md#1-stat-transfer-summonentityondeathsummon`). Page text comes back as JSON with `\r\n` in a single `text` field; reading a whole page via CLI dumps one giant line (I had to pipe through node to split sections). No failing command.

(b) Unclear / missing / wrong:
- Rule 5 and constant 17 give `(5e-5 (W-T)^2 + 0.2 (W-T)) / (1 + 0.5R)` but never define T (ward decay threshold, SP119) or say R is a fraction (50% -> 0.5), nor that d = max(0, W-T). A reader asked "2,000 ward, 50% retention" cannot tell whether to ask for T. Quote: "`decay/s = (5e-5 (W-T)^2 + 0.2 (W-T)) / (1 + 0.5R)`".
- Question table has no row for "net ward per second / is ward lost or gained" nor for hidden constants like the ward threshold; `#32-steady-state` is listed but the relation "net = generation - decay" is not stated.
- Constant 9 "5000 armour = 63.7% at area 100" is true (page table) but does not say that is physical only and L = a+5; "x0.7 vs non-physical" is there. Fine but the row never says DoT is excluded; rule 6 does. OK.
- Rule 7 says "Player 'increased fire damage' does nothing for minions" but does not say "increased spell damage" (the common phrasing) or point to `#6-exceptions-that-scale-from-the-player`, so an agent cannot tell what exceptions exist without reading the whole page. The question table row "Which stats reach minions" does not list #6.
- "Summary of a page before any other part" (line 10) conflicts with the workflow of citing section; fine, but the skill never says how to split a page read through the CLI (JSON text blob). Suggest a `section` parameter or a note.
- Confidence guidance: no example of how to label a computed value from a formula with an assumed input (I labelled it "D (computed), U input"); line 32 only covers illustrative inputs.
- The skill claims constants "25" (title) fine; row 24 "from level 26" matches minions.md. No discrepancies found in rows I checked (9, 17, 24).

(c) Tool calls for task A: 1 skill read + README (shared) + 3 knowledge fetches + 4 text-processing/sed calls = ~8 working calls.

(d) Suggested edits:
- Replace Rule 5 with: "5. **Ward decays quadratically.** `d = max(0, W - T)` where T = ward decay threshold (SP119, default 0 unless the user has it); R = ward retention as a **fraction** (50% = 0.5). `decay/s = (5e-5 d^2 + 0.2 d) / (1 + 0.5R)`. Net ward/s = generation - decay. E.g. W=2000, T=0, R=0.5 -> 480/s. No maximum ward; the old `0.4 W` formula is superseded. [ward-health-sustain.md#31-decay] **G/A**"
- Add to Rule 7: "...Player 'increased spell/fire/damage' without the Minion tag does nothing for minions; check `minions.md#6-exceptions-that-scale-from-the-player` before saying 'never'."
- Add a line to "Use the MCP `knowledge` tool": "Via CLI the reply is `{ok,path,lines,text}` with the page as one string; to read one section run `yarn mcp:call knowledge '{\"page\":\"mechanics/defenses\"}' | node -e \"...\"` or open the file under `knowledge/` directly (repo-relative path)."
- Add a confidence rule: "A value computed with D/G formulas from a U input is labelled 'D formula, U input' - state both."

---
## 2. le-data-query
(a) Worked: yes, all of lookup/get/sql/find_mods/skill_tree/knowledge, pattern 3, 4, 5, 8, the relations query, the Step 0 query, the `get` response shapes (`affix`+`stats`+`tiers`+`can_roll_on`, `unique`+`mods`+`tooltips`). Pattern 5 was adapted from the skill. No command errors. Inline JSON with apostrophes (pattern 3 `'Exsanguinous'`) only worked via the awkward `'"'"'` splice; with `@file` it is trivial.

(b) Unclear / missing / wrong:
- Pattern 3/4 etc. are written with SQL single quotes inside a JSON string, but the CLI example is a single-quoted shell string. Nothing tells the agent that `'` in SQL breaks the shell. Quote (line 34): "Almost every SQL pattern below contains such characters" - it names `< > % & |` but not the single quote, which is the one that actually bit me. Recommend @file for every SQL call.
- Pattern 5 is hard-wired to `m.property = 13` and Helmet, and does not show how to answer "affixes whose NAME contains X on base type Y at tier N". It also returns one row per stat line of multi-line affixes (affix 628 and 1016 have 2 lines) without explaining `source_ord`; the "Multi-row lines" gotcha helps but is far down. Needs a generic variant.
- Tier wording: line 287 says "T8 is the highest (T1 the lowest)" and also "the guide's 7-tier wording is superseded". A user asking "T7" gets ambiguous; the skill should say "T7 = tier 7 in `mods.tier` (second highest), T8 = Primordial", and to state which one was used.
- SP98 rows: `value_min` holds the magnitude and `value_max` = 0 (Exsanguinous: value_min 0.2, value_max 0). The skill says "equal when fixed" (line 103) - false for these rows; no gotcha covers it. Also `display_added_as_percentage` lives in `player_properties`, not mentioned.
- "NULL means tags = 0 or an indirect property" - for SP98 `tag_names` is NULL (pattern 4 output) and `tags` is the player_properties idx; works as documented, but the unique-level `get` shows `tags: 70` with `tag_names: null`, which an agent could misread as a tag mask of 70. The `get` output does include `property_kind: "player_property"`, which is not mentioned in the skill.
- `unique-effects-index` (needed for "everything a unique does") is only mentioned in gotchas/checklist, and the CLI returns the 118 KB page as a single blob; no hint to grep for the name. Add a SQL/grep recipe: "page text is one string; `node -e` split lines and filter".
- No recipe for "which nodes in tree T mention word W": pattern 8 works but `requires` text can false-positive on a JSON text search (Molten Path matched only because its prerequisite is Void Spiral). Say: search `name/stats_text/description`, not `requires`; or use `skill_tree` and filter.
- Name resolution: `lookup {"name":"Warpath"}` without `kinds` returns 10 mixed rows (ability_property noise); the skill says to pass `kinds` for `search` but its own lookup examples omit it. Fine but be consistent.
- The skill says (line 24) `get` for ability returns per-component numbers only in raw_json; confirmed.
- Missing: attribute id mapping (`context 'attribute:2'` = Intelligence, 0 Str, 1 Vit, 2 Int, 3 Dex, 4 Att); it is in stat-model.md#... but not here, and `mods.context` appears in pattern 4/Step 2 of the other skill.

(c) Tool calls for task B: about 15 (version, lookup x3, get x2, sql x6, find_mods, skill_tree, knowledge).

(d) Suggested edits:
- Replace the Windows warning bullet with: "The characters `< > >= <> % & | ( )` AND the single quote `'` inside inline JSON break the call. SQL string literals use single quotes, so **write every SQL call to a file or stdin**: `cat > /tmp/q.json <<'JSON' ... JSON; yarn mcp:call sql @/tmp/q.json`."
- Add pattern 5b: "```SELECT a.affix_id, a.name, a.affix_type_name, m.tier, m.source_ord, m.property_name, m.value_min, m.value_max FROM affixes a JOIN affix_can_roll_on r ON r.affix_id=a.affix_id JOIN item_base_types bt ON bt.base_type_id=r.base_type_id AND bt.name='Relic' JOIN mods m ON m.source_kind='affix_tier' AND m.source_id=CAST(a.affix_id AS TEXT) WHERE a.name LIKE '%Ward%' AND m.tier=7 ORDER BY a.affix_id, m.source_ord``` (name search on a base type at one tier; a two-line affix returns two rows)."
- Add gotcha: "SP98/SP58 rows: `value_min` is the magnitude, `value_max` may be 0; `tags` is the `player_properties.idx`; `tag_names` NULL. Percent display flag: `player_properties.display_added_as_percentage`."
- Change line 287 final sentence to: "'T7' in a user question = `mods.tier = 7` (not the best; T8 Primordial is). Quote the tier you used."
- Add to Name resolution: "Always pass `kinds` to `lookup` unless you want to see all kinds (a bare `lookup` returns ability_property and skill_node noise)."

---
## 3. le-damage-reasoning
(a) Worked: yes. Steps 1, 2, ailment query, attribute scaling query, Step 4 pool query (the `VALUES` row-value IN, `~`, `&` all ran in SQLite), Step 5 queries, and `find_mods` all returned data. Step 4's sample returned only 1 row (a unique mod) because affix ids 0 and 1 are not damage affixes - harmless but looks like a broken query on first read.

(b) Unclear / missing / wrong:
- Line 120: "The same through SQL, restricted to one tree and to wording that mentions \"more\":" but the query that follows has NO `more` filter (it lists all property-0 lines of `fi9:%`). Wrong description. Quote: "restricted to one tree and to wording that mentions \"more\"".
- Step 2 attribute scaling: `context = 'attribute:2'` is never decoded (2 = Intelligence) and the step never says to multiply by the build's attribute count; the "+4% per point" is given as a hint only. I had to read stat-model.md. Also not stated whether "Intelligence 60" is the final attribute total.
- Step 0 / Step 4 never tell the agent how to read user-stated aggregate numbers ("350% increased fire damage", "250% crit multiplier", "40% crit chance"): are they totals or additions to the base? The crit formula says multiplier is *added* to 2.0 (+100% -> 3.0) but a character-sheet "250%" is a total; both readings give a 1.6x vs 2.4x spread. Needs a rule: "ask or give both bounds; character-sheet values are totals, affix values are additions".
- Step 8: item 5 "enemy armour for hits" gives no default; monster armour/resistance defaults ("Most enemies have 0% resistance and 0 armour", enemies-and-corruption.md Summary item 8) are not cited. Monolith/corruption effects on damage taken are not addressed (only monster health/damage dealt scale with corruption).
- No guidance for "level 100 Sorcerer" (mastery/class passive nodes): `passive_tree` is not in the Tool shorthand and Step 4's pool checklist mentions `passive_node` but gives no query; when the user supplies no passives the skill should say "state that mastery/class passives are not counted" (I did).
- The output asked "average hit": Report template has "Hit DPS", not "average hit", and has no field for a result range/bounds; the "cannot be determined" section gives the phrase but the template lacks "Bounds".
- Rate (Step 11) needs cast speed; skill does not say to refuse DPS when speed is missing (I gave a U-labelled S=1 figure).
- Step 5 cites "429 more, 79 added, 38 increased" while le-mechanics-reference omits the 79 added; consistent, minor.
- Worked example text "tree 35% more and 20% more fire" - the tree has no 20% more fire node in `fi9` (nodes: Winged Fire 7%/pt, Mana Sphere 3%/pt, Unchained Fire 12%); the example is labelled U but reads as a real node set. Also example uses Winged Fire 5 points = 35%, consistent with data (+7%, max 5).
- Arithmetic of the worked example verified: 442.26, 530.71, 843.9, 1856.6, 122.2, 268.9 all check out.

(c) Tool calls for task C: about 14 (lookup, 2 ability SQL, ailment, attribute, get ability, stat-model grep, node summary, pool query, node mods x2, find_mods x2, ailment row, damage-pipeline fetch, enemies page grep).

(d) Suggested edits:
- Line 120: change to "The same through SQL, restricted to one tree (all property-0 lines of its nodes):". Add a second query adding `AND label LIKE '%more%'` if wording filter is intended.
- Step 2: add "`context = 'attribute:N'`: N 0 Strength, 1 Vitality, 2 Intelligence, 3 Dexterity, 4 Attunement. `increased = 0.04 x (attribute total from the build)`; confirm whether the user's attribute figure is the final total (include class base + gear)."
- Step 0: add "Interpretation rule for stated numbers: character-sheet crit chance/multiplier (e.g. 40%, 250%) are final totals (cc=0.40, cm=2.5); item lines are additions. If the user does not say which, compute both and report the spread."
- Step 8 item 5: append "Default for monsters: 0 armour and 0 resistance unless mods/champions (enemies-and-corruption.md Summary 8); corruption does not change damage taken."
- Report template: add "Avg hit (vs dummy | vs level N): ..." and "Bounds / interpretation spread: ..."; add "If cast speed is missing, give per-hit numbers only or label DPS **U**."
- Worked example: add "(the 20% more fire node and +4% crit nodes are invented; real Fireball tree nodes are fi9:6, fi9:22, fi9:23)".

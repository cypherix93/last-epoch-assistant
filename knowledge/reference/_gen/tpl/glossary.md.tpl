# Glossary
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Labels: **A** asset data (vendored), **G** in-game guide, **X** Maxroll/community 2026, **U** unverified/stale.

## Summary
- Alphabetical one-line definitions of game terms: ailments, defense layers, item rarities, stat terms (added / increased / more / quotient), skill tags, endgame terms and crafting terms.
- Each entry carries the label of its main source; combined labels (G+A) mean both agree. `[SP n]` links a term to stat property id n in `sp_enum.json` (the `SP` enum used by every affix, node and implicit).
- Numbers here are rules of thumb copied from the in-game guide (G) or asset data (A); detailed formulas live in `../mechanics/*.md` (damage-pipeline, defenses, ailments, ward-health-sustain, speed-cooldowns-mana, minions, enemies-and-corruption, stat-model).
- The two appendices list every `AilmentID` (151 values) and every `SP` id (134 values) for lookup.

## Terms

{{gen:glossary.glossary}}

## Appendix: AilmentID enum (A)

Ids used by `ailments.json`, `specialTag` of ailment stats and `NodeTooltipStat.property` >= 10000 (id + 10000). `UNUSED` ids are placeholders. Mechanics per ailment are in `../mechanics/ailments.md`.

{{gen:glossary.ailment_ids}}

## Appendix: SP (stat property) ids (A)

`sp_enum.json`; used as `property` in affixes, implicits, uniques, tree stats and class `levelMods`. SP 58 (AbilityProperty), 98 (PlayerProperty), 100 (AilmentConversion), 104/105 (drop rate / experience categories), 123 (Tracker) and 130 (IdolAltarProperty) use `specialTag`/`tags` as a sub-index (A, `07a_assets_core_data.md` 1.1).

{{gen:glossary.sp_ids}}

## Pitfalls
- Same word, different layers: "Endurance" (reduction under a health threshold) is not "Endurance Threshold"; "Haste/Frenzy" are ailment ids 33/34 but "HasteOnHitChance" is SP 50.
- "Increased" has two meanings in the data: the INCREASED modifier category and stats whose names begin with "Increased" (e.g. `IncreasedStunChance`, `IncreasedHealing`) that are ADDED-type values in a special property (A, `07f_passive_weaver_trees.md` section 3).
- "Grand" blessings are the empowered versions; "Grand Idol" is a 3x1 idol size; "Greater Omen Window" is unrelated to either.
- Guide text and asset values sometimes differ (health per level, minion scaling, arena waves); entries note the conflict where it matters.
- Terms marked U exist only in stale sources; none are used in this glossary except where explicitly noted.

## Sources
- `vendor/lastepochbuilder/research/data/sp_enum.json`, `stat_tag_enums.json`, `classes.json`, `ailments.json` - SP ids, enums, class values (A).
- `vendor/corpus/ingame_guide_1.5.0.txt` - definitions of ailments, defenses, crafting, endgame terms (G).
- `vendor/corpus/maxroll_rage-of-morditas.md`, `maxroll_season5_patch_notes_maxroll.md`, `maxroll_weaver-tree-strategies.md`, `maxroll_primordial-items.md`, `maxroll_respec-guide.md`, `maxroll_gear-walkthrough.md` - S5 and endgame terms (X).

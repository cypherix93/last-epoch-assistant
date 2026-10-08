# Last Epoch Knowledge Base

Markdown reference for AI agents that plan Last Epoch character builds and estimate damage, survivability and sustain. It targets game version **1.5.x (Season 5, "Rage of the Frostborn")**; pages were last verified on 2026-10-08. The pages are formula-first: every formula and constant carries a confidence label and a source, so an agent can tell a decompiled fact from a community estimate.

This knowledge base is the prose companion of the project's SQLite database (`data/le.sqlite`, built by `@le/db`). Field names on these pages (`addedDamageScaling`, `maxInstances`, `specialTag`, SP ids, AT tag bits) are the names used in the raw data, so they can be mapped to database columns directly.

## Confidence legend

| Label | Meaning |
|---|---|
| **D** | Recovered from decompiled client code (via the vendored weksil/LastEpochBuilder research). |
| **A** | Read from game asset data (serialized ScriptableObjects, prefabs, metadata tables). |
| **G** | Official in-game guide text (Game Guide 1.5.0) or official patch notes. |
| **X** | Community-verified: Maxroll 2026 pages, LE Tools / Tunklab planners, forum tests. |
| **U** | Unverified or inferred: assembled by us, an assumption, or an illustrative input. |

A `?` suffix (for example **D?**) means the source itself marks the reading as ambiguous. Combined labels (for example **G/D**) mean the sources agree.

## Source priority

When sources disagree, pages state both values, the choice, and why. Priority:

1. weksil research labelled **D** (decompiled code) or **A** (asset data) — `vendor/lastepochbuilder/`.
2. In-game guide 1.5.0 (`vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt`).
3. Maxroll pages updated in 2026.
4. Developer and forum posts (check the date; pre-1.0 posts are often obsolete).
5. Fandom wiki (last edited 2024; treat numbers as pre-1.4 unless confirmed).

Paths in the Sources sections are relative to the repository root. Entries marked `corpus` refer to a fetched community-text snapshot (filename plus its original URL); the URL is the durable reference.

## Sources on disk

Every `vendor/corpus/<file>` citation resolves to a plain-text capture committed in this repo; `vendor/corpus/INDEX.md` lists each file with its source URL, and `vendor/corpus/VENDOR.md` states provenance and usage terms. Data-derived claims cite the vendored research dump under `vendor/lastepochbuilder/`; see `vendor/lastepochbuilder/VENDOR.md` for its source repo, commit and licence.

## Pages

| Page | What it covers |
|---|---|
| [mechanics/damage-pipeline.md](mechanics/damage-pipeline.md) | Hit damage from base to final: ADE, added/increased/more, tag matching, crit, penetration and resistance, conversion, level DR, rounding, worked Fireball example. |
| [mechanics/defenses.md](mechanics/defenses.md) | Incoming-damage layer order, resistances and area-level penetration, armour/dodge/block formulas and tables, endurance, glancing, parry, crit avoidance, damage-taken conversions, EHP with a level-100 monolith example. |
| [mechanics/ailments.md](mechanics/ailments.md) | Ailment application, stack damage, stacking and refresh, full ailment table from data, debuff caps and boss penalties, stun and freeze formulas, worked ignite example. |
| [mechanics/ward-health-sustain.md](mechanics/ward-health-sustain.md) | Health and mana per level, regeneration, ward decay (1.1 quadratic formula) and steady state, ward sources, leech formula and scale, on-hit gains, potions. |
| [mechanics/speed-cooldowns-mana.md](mechanics/speed-cooldowns-mana.md) | Use rate from `useDuration`/`speedMultiplier`/`speedScaler`, weapon attack rates, cooldowns and charges, channelling, mana costs, trigger frequency, movement speed. |
| [mechanics/minions.md](mechanics/minions.md) | Which player stats transfer to minions, snapshot rule, minion power per level, hidden minion modifiers, minion base stats, companions, totems, limits. |
| [mechanics/enemies-and-corruption.md](mechanics/enemies-and-corruption.md) | ActorScaler level tables, monster health and damage formulas, rarity multipliers, corruption scaling, timeline levels, monster mods, average monster damage, boss ward. |
| [mechanics/stat-model.md](mechanics/stat-model.md) | The `Stat` record, every AT tag bit and SP id, enums, rounding grid, how affixes, uniques, sets, idols, blessings, passive and skill nodes reduce to stats, and how to sum a build. |

## How agents should use this

Start from [stat-model.md](mechanics/stat-model.md) to turn every item, passive, skill node and buff into `Stat` records, then follow [damage-pipeline.md](mechanics/damage-pipeline.md) per damage component and per damage type, add ailments from [ailments.md](mechanics/ailments.md), apply speed from [speed-cooldowns-mana.md](mechanics/speed-cooldowns-mana.md), and finish with enemy-side layers from [enemies-and-corruption.md](mechanics/enemies-and-corruption.md). For survivability, run the layer order in [defenses.md](mechanics/defenses.md) and pool rules in [ward-health-sustain.md](mechanics/ward-health-sustain.md). Prefer **D**/**A** numbers, quote the label with any number you give a user, and say "vs dummy" or "vs level-N monster" explicitly (level DR alone is ×0.13 at level 100). Treat **U** values and anything listed under "Open questions" as estimates to verify against the in-game character sheet or a training dummy. Unique, set and skill-node special effects (SP98 PlayerProperty, SP58 AbilityProperty, mutator fields) are coded per effect and are not covered by generic sums; look them up in the database rather than guessing.

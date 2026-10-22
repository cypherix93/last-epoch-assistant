# last-epoch-assistant

**A Last Epoch theorycrafting copilot for Claude Code.** Paste an LE Tools planner link, name an item you just dropped, or describe a build, and Claude answers from the actual game data (game 1.5.2). It shows its damage and survivability math line by line, and puts a source and a confidence label on every number.

```
You:     https://www.lastepochtools.com/planner/oYEPpxWw  why is my bleed so weak, and why do I die at 300 corruption?

Claude:  [planner]  decodes the link: Marksman lvl 81, Detonating Arrow / Cinder Strike / Explosive Trap,
                    Carrion of Creation (+108% Bleed Chance, rolled 36/255), every affix with tier and roll
         [damage]   bleed DPS per bucket vs a level-100 monster: base x ADE, increased, more, level DR (D/A labels)
         [defense]  hits-to-die per damage type at area level 100, weakest type named first
         [audit]    ranked fix list: the blessing / idol / affix that closes each gap, and the in-game test that confirms it
```

It is built in three layers:

1. **Data:** a local SQLite database with every item, affix tier, unique, skill, skill-tree node, passive, blessing, idol, ailment and monster mod, normalized from Last Epoch Tools and Maxroll (23,446 stat lines in one unified `mods` table, 485 uniques, 1,156 affixes, 182 player skills, 287 monster mods, 74 community build profiles).
2. **Formulas:** a knowledge base of Last Epoch mechanics where every formula and constant carries a confidence label: decompiled code, asset data, official guide, community-verified, or unverified.
3. **Procedures:** seven Claude Code skills that join the two into engines: damage/DPS, defense/EHP, build audit, best-in-slot, and build-around-an-item.

Claude reaches all of it through the `le-data` MCP server (15 tools). Every tool also works from the shell.

> **Private, personal use.** The game data belongs to Eleventh Hour Games (EHG). See [Data and licence](#data-and-licence).

---

## Contents

- [What you can ask](#what-you-can-ask)
- [LE Tools build parser](#le-tools-build-parser-paste-a-planner-link)
- [DPS engine](#dps-engine-real-damage-numbers-not-vibes)
- [Defense engine](#defense-engine-ehp-and-hits-to-die)
- [Build audit, best-in-slot, build around an item](#build-audit-best-in-slot-build-around-an-item)
- [Community meta](#community-meta-what-do-builds-actually-run)
- [Raw data access](#raw-data-access)
- [Quickstart](#quickstart)
- [How it fits together](#how-it-fits-together)
- [Confidence labels](#confidence-labels)
- [MCP tools](#mcp-tools) / [Skills](#skills)
- [How we know it works](#how-we-know-it-works)
- [After a game patch](#after-a-game-patch)
- [Layout](#layout) / [Limitations](#limitations) / [Data and licence](#data-and-licence)

---

## What you can ask

| Ask Claude... | What happens | Skill |
|---|---|---|
| `audit this build: https://www.lastepochtools.com/planner/...` | The link is decoded into the full named build, then audited for offense, defense, sustain, mana, mobility and anti-synergies, with a ranked fix list | `le-build-audit` |
| "How much does my Fireball hit for with +120 added spell fire, 350% increased fire, 40% crit?" | Bucket-by-bucket damage table vs a dummy and vs a level-100 monster, with a range for ambiguous inputs | `le-damage-reasoning` |
| "Why do I die in 300 corruption monoliths?" | Per-damage-type EHP and hits-to-die at area level 100, the weakest layer, and ranked fixes | `le-defense-reasoning` |
| "I dropped Ignivar's Head, build around it." | Item model, at least 5 archetypes scored, 1-2 build skeletons, an honesty pass, in-game tests | `le-build-around-item` |
| "Best-in-slot for my Erasing Strike Void Knight?" | Per-slot table that reconciles community usage, matching uniques and rare affixes / LP slams | `le-bis-selection` |
| "What does Calamity do? Which nodes give Endurance Threshold?" | Exact records, stat lines and tree nodes, in in-game names | `le-data-query` |
| "What's the resistance cap? How does ward decay work?" | The knowledge page, the formula and its confidence label | `le-mechanics-reference` |
| "What do Void Knight guides wear on their helmet?" | Item and affix distribution across the 74 Maxroll profiles | `le-data-query` (community tools) |

Claude picks the skill. You just ask.

---

## LE Tools build parser: paste a planner link

The `planner` tool turns an [LE Tools build planner](https://www.lastepochtools.com/planner/) share link into the complete build, named and with every rolled value. A build can then be audited from its link instead of a hand-typed description.

```
planner({"url": "https://www.lastepochtools.com/planner/oYEPpxWw"})
planner({"url": "oYEPpxWw", "sections": ["gear", "idols"]})       # bare id, selected sections
planner({"json": {...}})                                           # planner build JSON / an exported build
```

Excerpt from the parse of the bundled fixture, a level 81 Marksman imported from a game save (`packages/mcp/src/__fixtures__/planner-oYEPpxWw.json`):

```text
character  Marksman level 81; skills: Detonating Arrow, Cinder Strike, Explosive Trap, Smoke Bomb, Dark Quiver;
           uniques: Gathering Fury, Arrowguard, Carrion of Creation, Blood of the Exile, Inheritance of the Erased, Valdyr's Chalice

waist      exalted Spidersilk Sash   +115% increased Physical Damage (T7) ; +22% increased Mana Regen (T3) ;
                                     +42% increased Health Regen (T4) ; +91 Health; +6% increased Health (T6) ; +10% Endurance (T4)
finger1    exalted Jade Ring         +117% increased Damage Over Time (T7) ; +49% increased Void Damage (T5) ; ...
hands      Carrion of Creation (unique gloves, Eternal Gauntlets)
             implicit  +211 Armor
             implicit  +0.14 Armor Mitigation also applies to Damage over Time   range 0.11-0.24, roll 58/255
             mod       +108% Bleed Chance                                         range 1.00-1.57, roll 36/255
             mod       100% Ignite / Frostbite / Shock / Time Rot / Damned / Poison Chance Converted to Bleed Chance
             mod       +15% increased Attack Speed                                range 0.12-0.18, roll 111/255

warnings   ring1: Void Damage is a Sentinel class affix: this class cannot craft it (a drop or a trade can still carry it)
```

What it decodes:

- **Gear** per slot: base, rolled implicits, unique tooltip effects plus every unique mod with its roll and range, and affixes with tier, prefix/suffix, origin (legendary potential, Weaver's Will, sealed, primordial, corruption) and the exact rolled value.
- **Idols** placed on the grid, **blessings** with rolled lines, **passives** per mastery, **skill trees** node by node, and the **Weaver tree**.
- **Warnings**: ids not in the database, class-restricted affixes the class cannot craft, points over a node's maximum, more than five skill trees, and a planner data version that differs from the database.

Roll bytes (0-255) are turned into in-game values with the decompiled rolling formula (round-half-to-even bounds, affix-effect scaling, per-property rounding grid). LE Tools sits behind Cloudflare, so a link is loaded once in a local headless Chromium (`playwright-core`, using your installed Chrome or Edge) and cached in `data/planner-cache/`. Only links you supply are fetched; nothing is crawled. Details: [`docs/planner-import.md`](docs/planner-import.md).

---

## DPS engine: real damage numbers, not vibes

`le-damage-reasoning` is a step-by-step damage engine. Claude pulls the skill's real component data (base damage per type, added-damage effectiveness, base crit, hit/DoT flag, ailment chances), resolves which of your modifiers actually apply through the game's tag-matching rules, and runs the decompiled pipeline:

```
dmg_t   = base_t + ADE x added_t                        # per damage type, added damage scaled by effectiveness
Hit_t   = dmg_t x (1 + sum increased_t) x prod(1 + more) # increased adds, more multiplies
Hit_t  *= resMult_t x damageTaken_t x (1 - levelDR) x (1 - armourDR)   # vs the enemy
avgHit  = sum_t Hit_t x (1 + critChance x (critMulti - 1))
DPS     = avgHit x uses/s x hits per use
```

Every modifier it counts is listed with its source, in-game name and label. Example run, Fireball on a stated build (`tests/skill-probes/C-damage.md`):

```text
Fire bucket   25 base + 1.25 ADE x 120 added            = 175          [base, ADE: A (ability data)]
increased     Int 60 x 4% + 350% fire + 200% spell      = x8.90        [D]
more          one 30% more                              = x1.30        [D]
hit           175 x 8.90 x 1.30                         = 2,025 vs dummy, before crit
crit          1 + 0.40 x (2.5 - 1)                      = x1.60        [D]
avg hit vs dummy                                        = 3,240
level-100 monster: res 0, level DR 0.87 -> x0.13       = 421          [D/A]

Result: ~3,240 vs dummy; ~421 vs a level-100 normal monster (range 300-630 across readings of the inputs)
```

What the engine handles:

- **Increased vs more buckets** and skill-tree "more" nodes, read per point from the tree data.
- **Tag matching** (Spell / Melee / Bow / Throwing / Minion / DoT / elements), so a "+% Melee Fire" line does not count on a Fire spell.
- **Conversion**, penetration and shred against enemy resistance, enemy damage taken, the **monster level damage reduction**, and enemy armour.
- **Ailment DoT** (ignite, bleed, poison...) as its own pipeline, with stack caps and ramp-up.
- **Sub-abilities**: the hit of Erasing Strike lives on a sub-ability, and the engine follows it.
- **Character-sheet totals vs item additions**: when your input is ambiguous, it computes both readings and reports the spread.
- **Calibration**: when the tooltip disagrees, it asks for one character-sheet number and fits to it.

When a steady-state formula is not enough, Claude writes a small time-step simulation. A worked case is in `tests/evals/2026-10-09/user-case-lightning-fireball/`: a Harbinger of Stars mana loop, simulated over 3,000 s at 10 ms steps, with mana per second, the share of time Fireball is blocked, Meteor procs and utility-skill uptime compared across five setups.

Anything the data cannot settle, the engine says so: a node effect that only exists in skill code, or an unverified trigger scope. It then gives bounds and the in-game test that would settle it.

---

## Defense engine: EHP and hits-to-die

`le-defense-reasoning` computes survivability **per incoming damage type, at the area level you play**. Endgame monolith is area level 100, where enemies carry 75% penetration. It reports the weakest type, not the average:

```
resMult_t      = 1 - resistance_t + enemyPen(area)                       # 75% res at area 100 -> x1.00
armourDR       = min(0.85, f(armour, level))   (non-physical x0.7)       # D/G
endurance pool = (H - T) + T / (1 - endurance)                           # D
hits to die    = pool / (rawHit x resMult x (1 - armourDR) x damageTaken)
```

Layers covered: resistances and the 75% cap, enemy penetration by area level, armour (hits and, with the right stat, DoT), dodge rating, block chance and block effectiveness, glancing blow, parry, crit avoidance, endurance and threshold, ward decay and retention, leech, regen, mana-before-health, damage-taken conversions, and reference hits for level-100 monsters scaled by corruption.

Example run, a level-100 character in 300-corruption monoliths (`tests/skill-probes/D-defense.md`):

```text
| Hit (raw)                       | resMult | armour | per landed hit | hits to die |
|---------------------------------|---------|--------|----------------|-------------|
| Rare melee, physical 776        | 1.35    | x0.655 | 687            | 3.7         |
| Spell proxy, void 605           | 1.55    | x0.759 | 712            | 3.5   <- weakest
| Spell proxy, lightning 605      | 1.15    | x0.759 | 528            | 4.8         |
| Spell proxy, capped types 605   | 1.00    | x0.759 | 459            | 5.5         |
| DoT 363/s, void                 | 1.55    | -      | 478/s          | 5.3 s       |

Fix 1  Void 20% -> 75%: x1.55 -> x1.00  (Grand Echo of Solarum blessing 55-75%, Grand Idol Void Resistance up to 45%)
Fix 2  Physical 40% -> 75%: rare hit 687 -> 509, hits to die 3.7 -> 4.95
Fix 4  Armour 1,800 -> 5,000: physical DR 34.5% -> 63.7%
```

Every fix names the blessing, idol affix, gear affix or passive that closes the gap, and comes from a database lookup, not from memory.

---

## Build audit, best-in-slot, build around an item

The two engines feed the higher-level skills:

- **`le-build-audit`**: a full sourced audit of a complete build (or a pasted planner link). It covers offense, defense, sustain, mana, mobility, bottlenecks, missing resistances, dead stats (lines whose tags never match your skills), class/level requirement checks and anti-synergies, and ends with a ranked fix list. The riskiest assumption in the chain is named, with the in-game test to check it first.
- **`le-bis-selection`**: per slot, three independent searches: what community guides wear, which uniques match the stat wishlist (including defensive stat sticks a damage search would miss), and which rare affixes and legendary-potential slams fill the slot. They are reconciled into one table.
- **`le-build-around-item`**: "I dropped X". The item is modelled from its coded effect, then the skill generates at least five archetypes, scores them, writes one or two skeletons, does an honesty pass and lists in-game tests. A worked example is in [`.claude/skills/le-build-around-item/examples/culnivars-claim.md`](.claude/skills/le-build-around-item/examples/culnivars-claim.md).

Underneath sits [`knowledge/interactions/catalogue.md`](knowledge/interactions/catalogue.md): 122 sourced, unintuitive interactions and anti-synergies (conversion, triggers, minions, ward engines, double-dipping...), plus an index of every unique's special effect.

---

## Community meta: what do builds actually run

Maxroll's Last Epoch guides (73 guides, 74 planner profiles for 1.5.2) are decoded into the database with every id resolved: gear with affix tiers, idols, blessings, passives, skill trees and notes.

```
builds({"mastery": "Void Knight", "tier": "S"})                      # filter guides
build({"slug": "erasing-strike-void-knight-guide", "sections": ["gear"]})
item_usage({"name": "World Splitter"})                               # which guides use this unique, with which extra affixes
slot_meta({"slot": "helmet", "mastery": "Void Knight"})              # what goes in this slot: items and affixes with typical tier
```

Use it for originality checks ("does any guide run Rive on Forge Guard?") and as one input to best-in-slot picks. These are community choices, not game truth, so the skills label them **X** and never use them as a source for mechanics.

---

## Raw data access

The structured tools cover most questions. For the rest there is read-only SQL over 70+ tables and 12 views:

```
lookup({"name": "Calamity", "kinds": ["unique"]})                                # name -> id, player skills ranked first
get({"kind": "ability", "id": "fi9"})                                            # Fireball: decoded components, scaling, tree
skill_tree({"ability_id": "fi9", "filter": "ignite", "compact": true})            # only the nodes that mention ignite
find_mods({"filters": {"property": 0, "modifier_type": 2, "source_kinds": ["skill_node"]}})   # every skill-node "more damage" line
sql({"query": "SELECT name, level_requirement FROM uniques WHERE level_requirement >= 60 LIMIT 5"})
knowledge({"page": "mechanics/damage-pipeline"})
```

Replies carry in-game display names next to the ids: "Circle of Elements (Runemaster passive)", or "+116-140% Chance to Shock on Lightning Hit (T7)". Answers read like the game, not like a database dump.

---

## Quickstart

Requirements: Node.js 22+, Yarn 4 (via Corepack). On Windows, Git Bash for the shell examples. For planner links, an installed Chrome or Edge (or `npx playwright install chromium`).

```bash
yarn install
yarn db:build       # build data/le.sqlite from the committed raw data (works offline)
# or: yarn setup    # yarn fetch (download fresh data) + yarn db:build
```

Open the repo in Claude Code and approve the project MCP server `le-data` when prompted (it is registered in `.mcp.json`). Run `/mcp` to check that it is connected. Then ask anything from [What you can ask](#what-you-can-ask).

Without MCP, every tool works from the shell. Only the JSON result goes to stdout:

```bash
yarn mcp:list                                                         # every tool and its arguments
yarn mcp:call lookup '{"name":"Calamity","kinds":["unique"]}'
yarn mcp:call planner '{"url":"oYEPpxWw"}' --pretty
printf '%s' '{"slot":"helmet","mastery":"Void Knight"}' | yarn mcp:call slot_meta
echo "select name from uniques where name like '%Claim%' and unique_id > 0" | yarn mcp:call sql
```

Send SQL, and anything with quotes or `< > % & |`, on stdin. On Windows, yarn runs scripts through `cmd.exe`, which mangles those characters. More argument forms are in [`CLAUDE.md`](CLAUDE.md#mcp-server).

---

## How it fits together

```
 Last Epoch Tools  ─┐                                  ┌─ knowledge/  formulas + constants, every one labelled D/A/G/X/U
 Maxroll data      ─┼─ @le/fetch ─> data/raw/<ver>/ ─> @le/db ─> data/le.sqlite ─┐   (decompiled 1.5.0 research,
 Maxroll guides    ─┘   (hashed, locked, committed)     (normalize,             │    official guide, community)
                                                         cross-check)           │
                                                                                ▼
 LE Tools planner link ─> planner tool ─────────────────────────────> @le/mcp "le-data" (15 tools, stdio)
                                                                                │
                                                                                ▼
                                       .claude/skills/  procedures: data query -> damage / defense engines
                                                        -> audit / best-in-slot / build-around-item
                                                                                │
                                                                                ▼
                                       Claude Code: sourced answer, numbers with labels, in-game names
```

- **`@le/fetch`** downloads LE Tools globals (items, affixes, uniques, sets, abilities, trees, Weaver tree, monster mods, timelines, i18n) and the Maxroll planner data and guides into `data/raw/<version>/`, with URLs, sha256 and sizes in `sources.lock.json`.
- **`@le/db`** normalizes them into SQLite. Every stat line from every source (affix tier, unique, implicit, tree node, blessing, ailment, monster mod, attribute) becomes one row of the unified `mods` table, with tags decoded, properties named and values scaled. Full-text search runs on FTS5. LE Tools and Maxroll are cross-checked (`data/crosscheck-report.json`).
- **`@le/mcp`** serves the database and the knowledge base to Claude, and decodes planner links.
- **`knowledge/`** is the prose half: 8 mechanics pages (damage pipeline, defenses, ailments, ward/sustain, speed/mana, minions, enemies and corruption, stat model), 9 reference pages and the interactions catalogue.

---

## Confidence labels

Every number in an answer carries one of these labels:

| Label | Meaning | Example |
|---|---|---|
| **D** | Decompiled game code (vendored 1.5.0 research) | the damage pipeline order, the affix roll formula |
| **A** | Asset / game data (the database) | Fireball base 25 fire, ADE 125% |
| **G** | Official in-game guide | the 75% resistance cap |
| **X** | Community-verified | damage variance x0.8-x1.2; "6 of 74 guides use this" |
| **U** | Unverified or assumed | your stated 70% crit chance |

Source priority is D > A > G > X > U. When the data and the vendored 1.5.0 research disagree, the 1.5.2 data wins for numbers. The index is [`knowledge/README.md`](knowledge/README.md).

---

## MCP tools

| Tool | Purpose |
|---|---|
| `version` | Data version the database was built from (pin answers to it) |
| `schema` | Tables and views with row counts, or one table's columns and samples |
| `search` | Full-text discovery across everything (FTS5) |
| `lookup` | Resolve a name to ids (items, uniques, skills, nodes, blessings, buffs, builds) |
| `get` | One record in full: ability components decoded, unique with drop sources, buffs, builds |
| `find_mods` | Which affixes, uniques, nodes, blessings or idols grant a stat (by property, tags, more/increased, source) |
| `skill_tree` / `passive_tree` | A skill or class/mastery/Weaver tree with per-point node stats and adjacency |
| `sql` | Read-only SELECT / WITH over the whole database |
| `knowledge` | A knowledge-base page |
| `builds` / `build` | List / filter community guides; one guide in full |
| `item_usage` | Which guides use a unique or an affix |
| `slot_meta` | Item and affix distribution for a slot |
| `planner` | LE Tools planner link / JSON -> the fully named build with rolled values |

Argument shapes are in [`.claude/skills/README.md`](.claude/skills/README.md#tool-quick-reference). `yarn mcp:list` prints them live.

## Skills

| Skill | One line |
|---|---|
| `le-mechanics-reference` | Which knowledge page answers which question, labels, a 25-constant cheat sheet |
| `le-data-query` | Tools, name resolution, the `mods` table, tag bits, property ids, SQL patterns, gotchas |
| `le-damage-reasoning` | The DPS engine: buckets, tags, crit, penetration, level DR, conversion, ailments, "cannot be determined" |
| `le-defense-reasoning` | The defense engine: resistances vs area penetration, armour/dodge/block, endurance, ward, EHP vs reference hits |
| `le-build-audit` | Full sourced build audit with a ranked fix list |
| `le-bis-selection` | Per-slot best-in-slot table from community usage, uniques and affixes |
| `le-build-around-item` | Design a build around a dropped item |

---

## How we know it works

- **Probe suite** (`tests/probes/`): 30 questions across name lookups, abilities, trees, ailments, mod aggregates, world data, cross-cutting joins and knowledge pages, each with SQL or page-quote ground truth. Four agents answered through the CLI: **30/30 pass**. `yarn probes:verify` re-checks the ground truth against the current database.
- **Skill probes** (`tests/skill-probes/`): each skill run on a fresh task (Fireball damage, a monolith defense assessment, an audit, an Ignivar's Head build). All example commands ran. The agents' suggested edits were checked against the data and applied.
- **Evaluations** (`tests/evals/2026-10-09/`):
  - *Maxroll baseline*: blind agents rebuilt the Erasing Strike Void Knight without seeing the guide, scored against the decoded planner profile.
  - *Original-build challenge*: two agents designed builds that no community guide runs (mastery and damage source absent from all 74 profiles, core unique with zero usage), with numeric models. An independent judge re-derived both headline DPS numbers (33,181 and 46,160) from data it read separately, and they matched exactly.
  - *Real player case*: the lightning Fireball / Harbinger of Stars mana problem, answered in three rounds with mana-loop simulations.
- **Every example in every skill runs**: `yarn skills:check` executes each tool call and SQL snippet in `.claude/skills/**/*.md` against the database (`BAD/ZERO 0`).
- **Unit tests**: `yarn test` (vitest; the db and mcp suites run against the real built database, including the decompiled roll-formula test vectors and the planner fixture).

---

## After a game patch

```bash
yarn fetch            # new data/raw/<ver>/ when LE Tools bumps its data version (Maxroll is refreshed in place)
yarn db:build         # rebuild data/le.sqlite and the build / crosscheck reports
yarn probes:verify    # does the ground truth still hold? then yarn test and yarn skills:check
```

Review `git diff --stat data/raw data/*.json` and commit the raw refresh as its own commit. The build is deterministic: the same raw data gives byte-identical reports.

---

## Layout

```
packages/
  fetch/      @le/fetch  download LE Tools + Maxroll data and guides to data/raw/<version>/
  db/         @le/db     build data/le.sqlite (unified `mods` table, FTS5 search, community-build tables)
  mcp/        @le/mcp    MCP server "le-data" (15 tools, incl. the planner import) + CLI (yarn mcp:call / mcp:list)
data/
  raw/<ver>/            raw downloads per game version (committed), raw/CURRENT = latest
  le.sqlite             generated database (gitignored)
  le.build-report.json  build report;  crosscheck-report.json  LE Tools vs Maxroll cross-check
knowledge/              mechanics/ (formulas), reference/ (game systems), interactions/ (catalogue + unique effects)
.claude/skills/         7 skills (le-*) + README with the tool quick reference
tests/                  probes/, skill-probes/, skill-examples/ (skills:check runner), evals/
vendor/                 lastepochbuilder/ (decompiled 1.5.0 research, asset dumps), corpus/ (cited community pages)
docs/                   data-sources/, schema.md, loader-contract.md, community-builds.md, planner-import.md
CLAUDE.md               instructions for agents working in this repo
.mcp.json               registers the le-data MCP server for Claude Code
```

---

## Limitations

- **The engines are procedures, not a compiled calculator.** The damage and defense engines are skills that Claude executes over the database and the knowledge-base formulas. The numbers are real, derived and sourced, but Claude computes them per question, sometimes with a throwaway simulation script. There is no single `calculate(build)` function yet. Treat results as sourced estimates with a stated range, and calibrate against one character-sheet number when it matters.
- **Skill-node mutators are partly display-only.** Tree-node stat lines carry their text and magnitude. Where the kind (increased vs more) is known from the decompiled node code it is marked; skill-local properties (ids 5000+) are per-skill code. The skills give bounds instead of guessing.
- **Version skew.** The vendored research (formulas, unique effect models) targets game 1.5.0, the data is 1.5.2. Most formulas are stable across the two, but a changed unique or node can disagree. The data wins for numbers.
- **Unique and set special effects** (SP 98 / SP 58 properties) point to coded effects. Only the ones described in `knowledge/interactions/` are modelled.
- **Maxroll has no history.** Its data is overwritten in place when its hash changes, so older snapshots exist only in git history.

## Roadmap ideas

- Lift the engines into code: sum a decoded build's `mods` rows through the damage and defense pipelines, so `planner` link -> DPS / EHP becomes one tool call the skills can rely on.
- A .NET extractor that reads the game's assets directly, as an independent check on the community data and the 1.5.0 research.

---

## Data and licence

- **Last Epoch Tools** (lastepochtools.com), data version `version152` = game 1.5.2: the primary source.
- **Maxroll** (planner data and build guides): a second view of the game data, used to fill gaps, cross-check and supply the community builds.
- **Vendored research** (`vendor/lastepochbuilder/`, weksil/LastEpochBuilder at a pinned commit, game 1.5.0): decompiled formulas and asset tables, cited as **D** / **A**. `vendor/corpus/`: captures of the in-game guide, patch notes and community pages, cited as **G** / **X**.

This is a private, personal-use project. The game data belongs to Eleventh Hour Games. The vendored code is MIT, but the extracted data and text are not covered by that licence (`vendor/lastepochbuilder/VENDOR.md`, `vendor/corpus/VENDOR.md`). Do not redistribute the data, the database or the knowledge pages built from them. Source details: `docs/data-sources/README.md` and `data/raw/<ver>/sources.lock.json`.

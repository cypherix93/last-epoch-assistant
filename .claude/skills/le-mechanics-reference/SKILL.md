---
name: le-mechanics-reference
description: Use when reasoning about Last Epoch (1.5.x) mechanics and you need the right knowledge page or section, a confidence label for a number, or a constant such as crit base, resistance cap, armour cap, ward decay, minion scaling or monster damage reduction before answering a build, damage, defense or item question.
---

# Last Epoch mechanics navigator

## Overview

`knowledge/` holds the formulas, each tagged with a confidence label and a source. This skill tells you which page and section answers which question, how to label what you say, and the constants you will reuse most. Read the **Summary** of a page before any other part; every page opens with the rules agents must never get wrong.

Core principle: **never state a number without its label and source.** If you cannot name the page (or table + id for data values), say "not verified".

Start order for any build question: this skill -> `le-data-query` (find the records) -> `le-damage-reasoning` / `le-defense-reasoning` -> `le-build-audit`.

## Confidence labels and how to phrase them

| Label | Meaning | Phrase it as |
|---|---|---|
| **D** | decompiled client code | "the game code does X" (state as fact) |
| **A** | game asset data (also what the database holds) | "the data says X" |
| **G** | official in-game Game Guide 1.5.0 / patch notes | "the in-game guide states X" |
| **X** | community-verified (Maxroll 2026, planners, forum tests) | "community testing shows X" |
| **U** | unverified, inferred, or an illustrative input | "assumption / estimate, verify in game" |
| `?` suffix (D?, G?) | the source marks the reading as ambiguous | add "to be confirmed in game" |
| combined (G/D) | sources agree | use the stronger one |

Source priority when pages disagree: weksil research D/A (`vendor/lastepochbuilder/`) > in-game guide 1.5.0 > Maxroll 2026 > dev/forum posts (check the date) > Fandom wiki (pre-1.4). Pages record the conflict and the choice; quote the **chosen** value and mention the conflict when it changes the answer (examples: health per level 10 not 8; minion scaling 0.8% not 0.6%; regen 0.14 not 0.125).

Rules for uncertainty:
- Prefer D or A; give X as "current community knowledge"; give U only as a hypothesis with how to test it (training dummy or character sheet).
- Any value that comes from an illustrative input (gear numbers in worked examples) is **U**; do not present it as game data.
- Say "vs dummy" or "vs level-N monster" with every damage number; level-100 monster damage reduction alone is x0.13.
- If a question hits a page's "Open questions" section, say it is open and give the page. Every mechanics page ends with `## Open questions`; read it before claiming a rule is settled (for example `knowledge/mechanics/damage-pipeline.md#open-questions`, `knowledge/mechanics/defenses.md#open-questions`).
- Special effects of uniques, set bonuses and skill nodes (SP 98 PlayerProperty, SP 58 AbilityProperty, node mutators, skill-local ids 5000+) are coded one by one and are not covered by generic sums: look them up, and when the effect is not in the data say "cannot be determined from data".

## Question -> page and section

| Question | Page and section |
|---|---|
| How do added / increased / more combine? | `knowledge/mechanics/damage-pipeline.md#2-the-pipeline`, `#5-increased-more-and-skill-trees`; `knowledge/mechanics/stat-model.md#stat-record` |
| Does modifier M apply to skill S (tags)? | `knowledge/mechanics/damage-pipeline.md#4-tag-matching`; bit table `knowledge/mechanics/stat-model.md#tag-bitmask-at` |
| Where do base damage and added-damage effectiveness come from? | `knowledge/mechanics/damage-pipeline.md#1-where-the-numbers-live-data-fields` |
| Crit chance, crit multiplier | `knowledge/mechanics/damage-pipeline.md#7-critical-strikes` |
| Enemy resistance, penetration, shred | `knowledge/mechanics/damage-pipeline.md#8-resistance-penetration-shred-damage-taken-outgoing` |
| Why does my damage drop in monoliths? (monster damage reduction) | `knowledge/mechanics/damage-pipeline.md#9-monster-level-damage-reduction`; `knowledge/mechanics/enemies-and-corruption.md#monster-level-tables` |
| Conversion rules | `knowledge/mechanics/damage-pipeline.md#10-conversion`; `knowledge/interactions/catalogue.md#1-damage-conversion-and-tag-inheritance` |
| Attribute and level scaling | `knowledge/mechanics/damage-pipeline.md#6-attribute-and-level-scaling` |
| Conditional "more damage to X enemies" | `knowledge/mechanics/damage-pipeline.md#11-conditional-damage`; ids in `knowledge/mechanics/stat-model.md#conditionaldamageproperty-cdp` |
| Ailment application, stack damage, stacking | `knowledge/mechanics/ailments.md#1-applying-ailments`, `#2-damage-of-a-stack`, `#3-stacking-steady-state-refresh` |
| Ailment table (duration, base damage, caps, boss penalty) | `knowledge/mechanics/ailments.md#4-ailment-table-game-data-150` |
| Stun / freeze chance | `knowledge/mechanics/ailments.md#5-stun`, `#6-freeze` |
| Resistances and the area-level penalty | `knowledge/mechanics/defenses.md#2-resistances` |
| Armour, dodge, block formulas | `knowledge/mechanics/defenses.md#armour`, `#4-dodge`, `#5-block` |
| Glancing, parry, crit avoidance | `knowledge/mechanics/defenses.md#6-glancing-blow-parry-crit-avoidance` |
| Endurance | `knowledge/mechanics/defenses.md#7-endurance` |
| Layer order of one incoming hit | `knowledge/mechanics/defenses.md#1-order-of-layers-for-one-incoming-hit` |
| Damage-taken-as conversions, defensive conversions | `knowledge/mechanics/defenses.md#10-damage-taken-as-another-type-sp31sp37`, `#11-defense-conversions-and-conditional-defenses` |
| EHP / hits to die | `knowledge/mechanics/defenses.md#12-effective-health` |
| Max health, regen, mana, mana regen | `knowledge/mechanics/ward-health-sustain.md#1-health`, `#2-health-regeneration`, `#6-mana` |
| Ward decay, steady state, sources | `knowledge/mechanics/ward-health-sustain.md#31-decay`, `#32-steady-state`, `#33-ward-generation-sources` |
| Leech, on-hit gains, potions | `knowledge/mechanics/ward-health-sustain.md#4-leech`, `#5-health-mana-and-ward-on-events`, `#7-potions` |
| Attack/cast speed, use rate, weapon rates | `knowledge/mechanics/speed-cooldowns-mana.md#2-use-rate`, `#21-weapon-attack-rates-itemsjson-subtypes` |
| Cooldowns, charges, channelling, mana cost, triggers, movement | `knowledge/mechanics/speed-cooldowns-mana.md#3-cooldowns-and-charges`, `#4-channelled-skills`, `#5-mana-costs`, `#6-trigger-frequency`, `#8-movement-speed` |
| Which stats reach minions, minion power | `knowledge/mechanics/minions.md#1-stat-transfer-summonentityondeathsummon`, `#2-minion-power-by-level` |
| Minion base stats, caps, totems, companions | `knowledge/mechanics/minions.md#4-minion-base-stats-minion_base_statsjson`, `#5-companions-totems-limits` |
| Monster health/damage, rarity, corruption, boss ward | `knowledge/mechanics/enemies-and-corruption.md#monster-rarity`, `#corruption-and-the-monolith`, `#boss-ward` |
| What is stat property N / tag bit / enum? | `knowledge/mechanics/stat-model.md#property-ids-sp`, `#tag-bitmask-at`, `#other-enums-stat_tag_enumsjson` |
| How is an affix / unique / node turned into stats? | `knowledge/mechanics/stat-model.md#how-each-source-reduces-to-stats` |
| How do I sum a whole build? | `knowledge/mechanics/stat-model.md#how-an-agent-should-sum-a-build` |
| Classes, masteries, base stats, passive points | `knowledge/reference/classes-and-masteries.md#class-and-mastery-ids`, `#base-stats-identical-for-every-class` |
| Item bases, affix tiers, rarity, sealed affixes | `knowledge/reference/item-system.md#base-types`, `#affix-slots-tiers-sealed-affixes` |
| Uniques, legendary potential, sets, weaver's will | `knowledge/reference/uniques-sets-legendary.md#unique-structure-uniquesjson`, `#set-items-and-set-bonuses` |
| Idols, altars, blessings | `knowledge/reference/idols-and-blessings.md#idol-affixes-a`, `#idol-altars`, `#blessings` |
| Crafting (forge, FP, runes, glyphs) | `knowledge/reference/crafting.md#forging-potential-fp` |
| Skills, specialisation, tree structure, Weaver tree | `knowledge/reference/skills-and-trees.md#skill-specialisation-levels-and-respec`, `#ability-record-fields-abilitiesjson` |
| Timelines, monolith, corruption, dungeons, bosses | `knowledge/reference/endgame-systems.md#monolith-of-fate`, `#harbingers-forgotten-knights-and-pinnacle-bosses` |
| Unintuitive interactions, anti-synergies | `knowledge/interactions/README.md` (scan by tag), `knowledge/interactions/catalogue.md#11-anti-synergies-and-traps` |
| What does unique U's special effect do? | `knowledge/interactions/unique-effects-index.md` (find by name or uid), then the catalogue |
| Term definition | `knowledge/reference/glossary.md#terms` |

Use the MCP `knowledge` tool (`{"page": "..."}`, or open the file) to read a page. Cite as `page#section`.

```
knowledge({})                                             # list pages
knowledge({"page":"mechanics/defenses"})                  # one page's text
yarn mcp:call knowledge '{"page":"interactions/catalogue"}'   # without MCP, from the repo root
```

## Page index (one line each)

| Page | Open it for |
|---|---|
| `knowledge/README.md` | label legend, source priority, how agents should use the base |
| `knowledge/mechanics/damage-pipeline.md` | hit damage end to end, tag matching, crit, penetration, conversion |
| `knowledge/mechanics/defenses.md` | incoming-hit layers, resistances, armour/dodge/block, endurance, EHP |
| `knowledge/mechanics/ailments.md` | ailment application and damage, full ailment table, stun, freeze |
| `knowledge/mechanics/ward-health-sustain.md` | health, regen, ward decay, leech, mana, potions |
| `knowledge/mechanics/speed-cooldowns-mana.md` | use rate, cooldowns, channelling, mana costs, triggers, movement |
| `knowledge/mechanics/minions.md` | minion stat transfer, minion power, base stats, caps |
| `knowledge/mechanics/enemies-and-corruption.md` | monster levels, rarity, corruption, monster mods, boss ward |
| `knowledge/mechanics/stat-model.md` | `Stat` record, tag bits, SP ids, enums, how sources reduce to stats |
| `knowledge/reference/*.md` | classes, items, uniques and sets, idols and blessings, crafting, skills and trees, endgame, glossary |
| `knowledge/interactions/*.md` | catalogue of unintuitive interactions (scan by tag), index of all uniques |

## Rules agents get wrong most (restated)

1. **Increased vs more.** Increased adds into one pool; every *more* multiplies separately: `Stat = (base + ADE x added) x (1 + sum inc) x product(1 + more_i)`. Official check: more 5%, 30%, 10% on 14.5 gives 21.77, not 21.03. Skill-tree "increased damage" lines are almost always coded as **more** (429 more vs 38 increased in `skill_node_effects.json`, per `damage-pipeline.md`; the database stores node stats display-only, so this cannot be queried); passive-tree and gear "increased" are increased. Never decide from tooltip wording. [damage-pipeline.md#5-increased-more-and-skill-trees] **D/G**
2. **Tag matching is a subset test.** A modifier applies only if every tag on it is present on the damage source; Elemental matches Fire, Cold, Lightning. Typed increased (fire) scales only the fire bucket; untyped scales all seven. Melee and Hit modifiers never scale ailments. [damage-pipeline.md#4-tag-matching] **D**
3. **Ailment scaling.** Ailments have fixed base damage and ADE 0 (Ignite, Bleed, Poison); they scale from generic, type, DoT, Ailment-effect and the applying skill's tree/attribute modifiers, never from Hit/Melee/Bow/Throwing; speed and crit do not scale them; they cannot crit. [ailments.md#2-damage-of-a-stack] **G/D**
4. **Resistance penetration by area level.** Enemies penetrate your resistances by 1% per area level (max 75% from area level 75), applied after the 75% cap. At area 75+, capped 75% resistance mitigates 0%; it only avoids the 1.75x penalty. [defenses.md#2-resistances] **G/D**
5. **Ward decays quadratically.** `decay/s = (5e-5 (W-T)^2 + 0.2 (W-T)) / (1 + 0.5R)`; no maximum ward; steady state grows less than linearly with generation. The old `0.4 W` formula is superseded. [ward-health-sustain.md#31-decay] **G/A**
6. **Armour does not reduce DoT** (unless SP 118), dodge/block/glancing/parry affect hits only; resistances, endurance and damage-taken modifiers apply to both. Formulas use *area level + 5*, not character level. [defenses.md#armour] **G/D**
7. **Minion stat transfer.** A player stat reaches minions only if it has the Minion tag (or Totem tag for totems, or `extraTag` = the summon skill); it arrives with the tag stripped, as a snapshot at summon. Player "increased fire damage" does nothing for minions. [minions.md#1-stat-transfer-summonentityondeathsummon] **D/G**
8. **Monster damage reduction** (87% at level 100) applies to hits and DoT, not to dummies; compare dummy DPS to monolith DPS only with this factor. [damage-pipeline.md#9-monster-level-damage-reduction] **D/A**
9. **Penetration vs shred.** Shred lowers resistance before the 75% enemy cap; penetration is applied after; shred is reduced against bosses, penetration is not. [damage-pipeline.md#8-resistance-penetration-shred-damage-taken-outgoing] **D/G**

## Constants cheat sheet (25)

Every row: value, label, page.

| # | Constant | Value | Label | Page |
|---|---|---|---|---|
| 1 | Hit damage per type | `(base + ADE x added) x (1 + sum inc) x product(1 + more)` | G/D | damage-pipeline.md#2-the-pipeline |
| 2 | Added-damage effectiveness (ADE) | code-built: weapon 1.0 else `0.05 x sum base`; Fireball 1.25; ailments 0 for Ignite/Bleed/Poison | D/A | damage-pipeline.md#1-where-the-numbers-live-data-fields |
| 3 | Base crit chance / multiplier | 5% / x2.0; multiplier bonuses add (+100% = x3.0); DoT never crits | G/A | damage-pipeline.md#7-critical-strikes |
| 4 | Hit variance | x0.8 to x1.2 per hit, average unchanged | X | damage-pipeline.md#13-variance-and-tooltips |
| 5 | Enemy resistance multiplier | `(res > 0.75 ? 0.25 : 1 - res) + pen`; no floor below 0 res | D/G | damage-pipeline.md#8-resistance-penetration-shred-damage-taken-outgoing |
| 6 | Monster level DR | 0 at L1-6, 54% L50, 75% L75, 87% L100; boss `DR + 0.05(1-DR)` = 87.65%; dummy 0 | A/D | enemies-and-corruption.md#monster-level-tables |
| 7 | Enemy penetration vs player | 1% per area level, cap 75% (area level 75+), after the cap | G/D | defenses.md#2-resistances |
| 8 | Player resistance cap | 75% (shred/negative res can push below; over-cap protects against shred only) | G/X | defenses.md#2-resistances |
| 9 | Armour | cap 85%, x0.7 vs non-physical, hits only, `L = area level + 5`; 5000 armour = 63.7% at area 100 | G/D | defenses.md#armour |
| 10 | Dodge | cap 85%, hits only; 1000 rating = 29.1% at area 100 | G/D | defenses.md#4-dodge |
| 11 | Block | chance per hit (no base cap), on block damage x(1 - blockDR), blockDR cap 85%, hits only | G/D | defenses.md#5-block |
| 12 | Endurance | base 20%, cap 60%, threshold 20% of max health, health only, hits and DoT | G/A | defenses.md#7-endurance |
| 13 | Glancing blow / parry | glance = 35% less hit damage; parry negates a hit, cap 75% | G | defenses.md#6-glancing-blow-parry-crit-avoidance |
| 14 | Hidden player DoT reduction | 15% less damage over time taken | A | defenses.md#8-damage-taken-modifiers-and-their-order |
| 15 | Max health | `RHE((100 + 10 L + 6 Vit + added) x (1 + inc) x more)` (1100 at L100 base) | A/D | ward-health-sustain.md#1-health |
| 16 | Regen and mana | health regen `6 + 0.14 L`; mana regen 8; max mana `50 + 0.50506 L + 2 Att` | A/D | ward-health-sustain.md#2-health-regeneration |
| 17 | Ward decay | `(5e-5 d^2 + 0.2 d)/(1 + 0.5R)`, `d = W - T` | G/A | ward-health-sustain.md#31-decay |
| 18 | Mana before health | 1 mana absorbs 5 damage, after other reductions, not on ward, off at <= 0 mana | G | defenses.md#9-mana-ward-and-the-damage-pool |
| 19 | Leech | `damage x 0.1 x (HealthLeech value)`; stat 0.3 = 3%; paid over `3 / (1 + rate)` s | D/A | ward-health-sustain.md#4-leech |
| 20 | Use rate | `S x speedMultiplier x 1.1 / useDuration` (Fireball 1.4667/s at S=1) | D | speed-cooldowns-mana.md#2-use-rate |
| 21 | Ailment chance > 100% | `floor(chance)` stacks plus one more with probability `frac` | G | ailments.md#1-applying-ailments |
| 22 | Base ailments | Ignite Fire 40 / 2.5 s; Bleed Phys 53 / 3 s; Poison 28 / 3 s (poison debuff first 30 stacks) | A | ailments.md#41-damaging-ailments |
| 23 | Debuff caps | resist shred -5% x10 stacks (-2% vs boss/player); Chill 0.88 per stack x3 (0.94 vs boss); Shock -5% lightning res, +20% stun chance x10 | A/G | ailments.md#43-non-damaging-debuffs |
| 24 | Minion power | from level 26: `(L-25) x 0.8%` more damage and less damage taken: x1.60 / x0.40 at L100; hidden 60% less from PetResisted | A/D | minions.md#2-minion-power-by-level |
| 25 | Corruption `f(c)` | `0.6c` up to 100, then `0.002 c^1.52 + 1.055 c - 47.69`; monster health and hit damage x(1 + 0.01 f), DoT x(1 + 0.005 f): x1.6 at 100, x3.80 at 300 | A/D | enemies-and-corruption.md#corruption-and-the-monolith |

## Workflow for a mechanics answer

1. Identify the question type (table above) and open that page's Summary, then the section.
2. Fetch the data records with `le-data-query` (ids and tags).
3. Compute with the page's formula; keep the label on every intermediate number.
4. Check "Common misconceptions / pitfalls" and "Open questions" at the page end.
5. Report: answer, formula used, label, page#section, data ids, what stayed unverified.

## Common mistakes

| Mistake | Fix |
|---|---|
| Quoting the in-game guide where data differs (health +8/level, minion 0.6%) | Use the chosen value on the page and note the conflict |
| Giving "DPS" with no enemy context | Always "vs dummy" or "vs level N monster" |
| Using a worked-example number as game data | It is **U** unless it comes from a table row |
| Reading only the user's tooltip numbers | Tooltips ignore level DR, resistances and uptime (`damage-pipeline.md#13-variance-and-tooltips`) |
| Applying a generic sum to a unique's special effect | Look up the effect model; if absent, say it cannot be determined |

# <Build name>: built around <Item name> (uid <id>)

> Data: `game_version` <...>, `data_version` <...>, source <le.sqlite | vendored JSON 1.5.0>. Generated <date>.
> Confidence labels: D decompiled, A asset data, G game guide, X community 2026, U unverified or illustrative. Every number below carries one.
> Status: **theorycraft to test**. Not tested in game, not a known or "meta" build.

## Build card

| Field | Value |
|---|---|
| Item | <name> (uid <id>), <slot / base>, level req <unique> / base <base> |
| Enabling effect | <one line, with label> |
| Stat stick | <mods, tag mask it wants> |
| Class / mastery | <class> / <mastery> |
| Main skill | <skill> (`<ability_id>`): <one-line damage idea> |
| Defense layers | <layer 1>, <layer 2>; resistances capped from <sources> |
| Sustain | <source> |
| Other required uniques | <names + uids> (count: N) |
| Community baseline | <item used in N of 74 guides; closest guide <slug> or none; differs by ...> (X) |
| Rate check | <enabler throughput> vs <plain benchmark> (<label>) |
| Scores (Dmg/Def/Sus/Gear/Nov) | <a/b/c/d/e = total> |
| Riskiest assumption | <the weakest-labelled link of the chain, with its label> -> test #1 |
| Acquisition | <each unique with can_drop_randomly 0: source, or "farm unknown (U)"> |

## 1. The item

- Mods (property, tags, type, range, label):

| # | Property | Tags | Type | Range | Label |
|---|---|---|---|---|---|

- Tooltip lines (quoted):
- Coded model (`unique-effects-index.md` row: model kinds and class; `get` mods and relations; the knowledge-page rule with its label; "coded detail not read (U)" where none; `vendor/` is not opened):
- Catalogue entries that mention it (headings):
- Restrictions: class, level (unique vs base), slot consequences, LP/WW/primordial/set, legendary plan:

## 2. Enabling-effect model

- Rate equation:
- Plausible endgame value (inputs listed, labels):
- Benchmark against a plain alternative (affix id / unique uid, tier, value):
- Verdict: <enabler worth it because ... | enabler weak, build justified by ...>

## 3. Community baseline (Phase C2; Maxroll guides, 1.5.2, label X; "N of 74 guides", not game truth)

- Item usage (`item_usage` / Q18): total builds <N of 74>; by slot <...>; by mastery <...>; extra affixes guides add <...>. Required partner uniques: <name: N of 74>.
- Existing builds for the chosen mastery and main skill (`builds` / Q19): <slug, tiers> or "none; nearest <slug>".
- How this proposal differs from the existing build (required when one exists): <mastery, skills and nodes, defense layer, the item's role, gear>.
- Community-standard picks per slot (`slot_meta`; <matched_builds> guides matched; widened to <class/skill> if thin):

| Slot | Top community picks (count of matched) | Typical affixes (tier) | This proposal | Reason for any difference |
|---|---|---|---|---|
| Helmet | | | | |
| Body | | | | |
| Gloves | | | | |
| Belt | | | | |
| Boots | | | | |
| Weapon / off-hand | | | | |
| Amulet | | | | |
| Ring x2 | | | | |
| Relic | | | | |
| Idols | | | | |

- Counts cited by the scores: Gear <...>; Novelty <...>.

## 4. Candidates (divergent phase)

| # | Archetype | Class / mastery | Core skill(s) | Key pairing (ids) | Query / entry that supports it | Dmg | Def | Sus | Gear | Nov | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | | | |
| 2 | | | | | | | | | | | |
| 3 | | | | | | | | | | | |
| 4 | | | | | | | | | | | |
| 5 | | | | | | | | | | | |

Gate result: <dropped candidates and why>. Novelty pairing: <#>. Chosen: <#, #>.

## 5. Build skeleton: <candidate name>

(For a second skeleton, repeat sections 5-9 as "5b. Build skeleton: <name>" and so on, before section 10.)

### 5.1 Class, mastery, bonuses

### 5.2 Skills

| Slot | Skill (`ability_id`) | Role | Key nodes (`tree:node` Name, points) | Why |
|---|---|---|---|---|
| 1 | | main | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

Nodes whose stats are skill-local (5000+) or display-only: <list>. Their modifier type is not known from data.

### 5.3 Passives (priority order)

| Order | Node (`tree:node` Name) | Points | Mastery gate | Why |
|---|---|---|---|---|

### 5.4 Gear

| Slot | Item | Required affixes (name, id, tier target) | Resistances carried | Notes |
|---|---|---|---|---|
| Weapon | | | | |
| Off-hand | | | | |
| Helmet | | | | |
| Body | | | | |
| Gloves | | | | |
| Belt | | | | |
| Boots | | | | |
| Amulet | | | | |
| Ring 1 | | | | |
| Ring 2 | | | | |
| Relic | | | | |

Legendary / LP plan for the item:

### 5.5 Idols

| Shape | Prefix (name, id) | Suffix (name, id) | Count |
|---|---|---|---|

### 5.6 Blessings

| Timeline | Blessing (normal / Grand) | Stat, range | Why |
|---|---|---|---|

## 6. Damage path (le-damage-reasoning)

- Damage source tags:
- Added (x ADE) / increased / more per bucket, with each source id:
- Crit or ailment path:
- Penetration and shred:
- Estimate: <value> vs dummy, <value> vs level-100 boss (labels, inputs):

## 7. Defense plan (le-defense-reasoning)

| Resistance | Target | Sources | Label |
|---|---|---|---|
| Fire | 75% | | |
| Cold | 75% | | |
| Lightning | 75% | | |
| Physical | 75% | | |
| Void | 75% | | |
| Necrotic | 75% | | |
| Poison | 75% | | |

- Primary layer(s), with targets and the pool each protects:
- Endurance / endurance threshold:
- Stun and freeze avoidance:
- DoT handling:
- Sustain:

## 8. Mana plan

- Costs per second vs regeneration:
- Interaction with the enabling effect:
- Mana before health / negative mana:

## 9. Leveling to endgame

| Level band | Skills | Gear | Switch trigger |
|---|---|---|---|

## 10. What to test in game first

| # | Test | How to observe | Expected | If it fails |
|---|---|---|---|---|
| 1 | <riskiest assumption> | | | |

## 11. Assumptions

## 12. What could make this fail

## 13. Interaction check

| Catalogue entry (heading) | Relevance | Synergy / anti-synergy | Handled how |
|---|---|---|---|

Q14 drawback sweep result:

## 14. Data citations

| Claim | Source kind | Id / path | Label |
|---|---|---|---|
| | unique / affix / ability / node / blessing / knowledge page / community view (v_item_usage, v_build_summary, ...) | | |

Queries run (tool + arguments):

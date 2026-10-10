# <Build name>: built around <Item name> (unique <slot>)

> Data: `game_version` <...>, `data_version` <...>, source <le.sqlite | vendored JSON 1.5.0>. Generated <date>.
> Confidence labels: D decompiled, A asset data, G game guide, X community 2026, U unverified or illustrative. Every number below carries one.
> Status: **theorycraft to test**. Not tested in game, not a known or "meta" build.
> Names: everything above section 14 uses in-game names only (skill nodes with their skill, passives with their class or mastery, uniques with their slot, affixes as their stat line and tier, blessings with their timeline). Ids appear only in section 14, each next to its name. How to read the names: **le-data-query**, "Player-facing names".

## Build card

| Field | Value |
|---|---|
| Item | <name> (unique <slot>), base <base item>, level req <unique> / base <base> |
| Enabling effect | <one line, with label> |
| Stat stick | <its stat lines as the tooltip shows them; which skills they help, in words ("Lightning Spell skills")> |
| Class / mastery | <class> / <mastery> |
| Main skill | <skill name>: <one-line damage idea> |
| Defense layers | <layer 1>, <layer 2>; resistances capped from <sources by name> |
| Sustain | <source> |
| Other required uniques | <name (unique slot), ...> (count: N) |
| Community baseline | <item used in N of 74 guides; closest guide: the Maxroll "<title>" guide (<tab>) or none; differs by ...> (X) |
| Rate check | <enabler throughput> vs <plain benchmark> (<label>) |
| Scores (Dmg/Def/Sus/Gear/Nov) | <a/b/c/d/e = total> |
| Riskiest assumption | <the weakest-labelled link of the chain, with its label> -> test #1 |
| Acquisition | <each unique with can_drop_randomly 0: source, or "farm unknown (U)"> |

## 1. The item

- Mods, as tooltip stat lines (**le-data-query** query D; type = added / increased / more):

| # | Stat line (in-game wording) | Applies to | Type | Range | Label |
|---|---|---|---|---|---|

- Tooltip lines (quoted):
- Coded model, in words (what the effect does and when, from the `unique-effects-index.md` row, `get` mods and relations and the knowledge-page rule, with its label; "coded detail not read (U)" where none; `vendor/` is not opened). Model codes (`C33:0:resource`, `PP<n>`, `AP<a>:<p>`) go to section 14:
- Catalogue entries that mention it (headings):
- Restrictions: class, level (unique vs base), slot consequences, LP/WW/primordial/set, legendary plan:

## 2. Enabling-effect model

- Rate equation:
- Plausible endgame value (inputs listed, labels):
- Benchmark against a plain alternative (affix stat line and tier, or unique name and slot; value):
- Verdict: <enabler worth it because ... | enabler weak, build justified by ...>

## 3. Community baseline (Phase C2; Maxroll guides, 1.5.2, label X; "N of 74 guides", not game truth)

- Item usage (`item_usage` / Q18): total builds <N of 74>; by slot <...>; by mastery <...>; extra affixes guides add <...>. Required partner uniques: <name: N of 74>.
- Existing builds for the chosen mastery and main skill (`builds` / Q19): <guide title, tab, tiers> or "none; nearest: the "<title>" guide".
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

| # | Archetype | Class / mastery | Core skill(s) | Key pairing (in-game names) | Evidence (catalogue entry or what the query found, in words) | Dmg | Def | Sus | Gear | Nov | Total |
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

| Slot | Skill | Role | Key nodes (node name, points) | Why |
|---|---|---|---|---|
| 1 | <skill name> | main | <Node name 4/4, Node name 1/1> | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

Nodes whose effect type is uncertain (in the data: kind `inferred` (**U**), `unknown`, a `skill_parameter` or a `label_mismatch` line; 5000+ ids are named by `property_hint`, the effect itself is in `code_ref` and the label): <node name (skill node): what is uncertain, in words>. The kind fields and keys go in section 14.

### 5.3 Passives (priority order)

| Order | Passive (name, class or mastery tree) | Points | Mastery gate | Why |
|---|---|---|---|---|
| 1 | <Wisdom (Sorcerer passive)> | <n / max> | <Sorcerer, 5 points in the tree> | |

### 5.4 Gear

| Slot | Item (unique name, or "rare <base item>") | Required affixes (stat line, tier target, range on this base) | Resistances carried | Notes |
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

| Idol (name, size WxH) | Prefix (stat line, range on this idol) | Suffix (stat line, range on this idol) | Count |
|---|---|---|---|

### 5.6 Blessings

| Timeline | Blessing (normal / Grand) | Stat, range | Why |
|---|---|---|---|

## 6. Damage path (le-damage-reasoning)

- Damage source tags:
- Added (x ADE) / increased / more per bucket, each source by its in-game name (node + skill, item + slot, passive + tree):
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

The only place for ids. Every row names the thing first, as in the sections above, then its id.

| Claim | In-game name | Source kind | Id / path | Label |
|---|---|---|---|---|
| | <Innate Conduit (Lightning Blast node)> | <skill node> | <`lb23il:28`> | |
| | | unique / affix / ability / node / blessing / knowledge page / community view (v_item_usage, v_build_summary, ...) | | |

Queries run (tool + arguments):

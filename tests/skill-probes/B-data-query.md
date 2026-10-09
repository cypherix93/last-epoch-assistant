> **Evidence, not guidance.** Skill-probe task output (2026-10-08, game data 1.5.2), produced with the `.claude/skills/` text as it was *before* the commit that added this folder applied the feedback. Quotes and line numbers refer to that earlier skill text; the current skills supersede it. See `tests/probes/README.md` and `.claude/skills/README.md`.

# B. le-data-query probe (data_version 1.5.2)

All commands run from `D:\src\last-epoch-assistant.wt\integration` in Git Bash. `@/tmp/x.json` = JSON file (used for SQL containing `<`, `&`, `%`, `~`).

## B1. Unique "Exsanguinous"
Calls:
1. `yarn mcp:call version '{}'` -> game_version "Version 1.5.2"
2. `yarn mcp:call lookup '{"name":"Exsanguinous"}'` -> unique id 11 (hint "Body Armor / Noble Raiment"); other hits were skill nodes sp5g2:26 Exsanguination and db992:13 Exsanguinating Strike (ignored, chose kind unique)
3. `yarn mcp:call get '{"kind":"unique","id":11}'`
4. pattern 3: `yarn mcp:call sql '{"query":"SELECT name, base_type, sub_type, level_requirement, set_name, mods_text, tooltip_text FROM v_unique_summary WHERE name = '"'"'Exsanguinous'"'"'"}'`
5. pattern 4 via `yarn mcp:call sql @/tmp/q4.json`
6. `yarn mcp:call sql '{"query":"SELECT * FROM player_properties WHERE idx IN (70,69,451)"}'`
7. relations triggered_ability query (skill's "More useful shapes") filtered to this unique -> 0 rows
8. `yarn mcp:call knowledge '{"page":"interactions/unique-effects-index"}'` -> row `| 11 | Exsanguinous | 1 BODY_ARMOR | ... | PP70:stat, PP69:resource, PP451:flag |`

Result (uniques.unique_id=11; mods source_kind=unique_mod source_id='11'):
- Base: Body Armor / Noble Raiment (base_type_id 1, sub_type_id 3), level_requirement 0, not a set item, effective_level_for_lp 35, can drop randomly, not legendary-capable. Lore: "Crazed is the mind of a blood starved Lich." mod_count 6.
- Tooltip text (unique_tooltips): (a) "[15,30,0]% increased attack speed, cast speed, and movement speed if you have used a potion in the past 4 seconds"; (b) "Immunity to Bleed at low health" (alt: low health = below 35% of max health).
- Mods:

| ord | property | modifier | tags | range |
|---|---|---|---|---|
| 0 | 2 Attack Speed | increased | Potion (65536), hidden | 0.15 - 0.30 |
| 1 | 3 Cast Speed | increased | Potion, hidden | 0.15 - 0.30 |
| 2 | 9 Movement Speed | increased | Potion, hidden | 0.15 - 0.30 |
| 3 | 98 PlayerProperty idx 70 "Current Health Lost per second" (less_is_better; alt text: "not affected by increases and reductions to health drain effects") | added | tags=70 is the player_properties index | 0.2 (shown as %), max 0 |
| 4 | 98 PlayerProperty idx 69 "Missing Health gained as Ward per second" | added | idx 69 | 0.2 (shown as %), max 0 |
| 5 | 98 PlayerProperty idx 451 "Bleed Immunity while on Low Health" (hidden) | added | idx 451 | 1 (flag) |

- Interpretation (**U**): two un-tooltipped SP98 lines: you lose 20% of current health per second and gain 20% of missing health as ward per second. The DB holds names and the 0.2 magnitude (display_added_as_percentage=1), not the formula; per-second basis and "% of what" are inferred from the names. No triggered abilities.
- Cannot be determined from data: exact formulas of PP70 / PP69 (unique-effects-index tags them stat/resource).

## B2. Affixes with "Ward" in the name that can roll on Relics, T7 ranges
Calls: pattern 5 adapted (`bt.name = 'Relic'`, `a.name LIKE '%Ward%'`, `m.tier = 7`, join on source_ord) via `yarn mcp:call sql @/tmp/q5.json`; tier-count check `@/tmp/q5b.json`; `yarn mcp:call get '{"kind":"affix","id":628}'` (can_roll_on = [Relic id 22], tier 7 mods); `yarn mcp:call find_mods '{"filters":{"property_name":"Ward","source_kinds":["affix_tier"]},"limit":3}'` (529 rows, not Relic-scoped, so not used).
Result: 3 affixes, each with 8 tiers (T8 is the top tier; T7 given as asked):

| affix_id | name | slot | T7 lines |
|---|---|---|---|
| 83 | Potion Health Converted to Ward | prefix | Potion Health Converted to Ward 0.71 - 1 |
| 628 | Level of Flame Ward | prefix (class_specificity 4 = Mage) | Level of Flame Ward +4 (fixed); Ward Retention 0.61 - 0.75 |
| 1016 | Added Intelligence and Ward Per Second | prefix | Intelligence +7; Ward per Second 19 - 21 |

Caveats: LIKE is case-insensitive; only names containing "Ward" were matched, so Relic affixes that grant ward under another name are not listed; ranges are raw tier rows before the base item's affixEffectModifier; percent values are fractions.

## B3. Warpath nodes mentioning "Void"
Calls: `yarn mcp:call lookup '{"name":"Warpath"}'` and `...'{"name":"Warpath","kinds":["ability"]}'` -> player ability `va53st` ("player, has tree"; also two minion/monster abilities, skill_tree va53st with 28 nodes); `yarn mcp:call skill_tree '{"ability_id":"va53st"}'`; pattern 8 filtered on `name/stats_text/description LIKE '%Void%'` via `@/tmp/q8.json`.
Result:
- Node 2 "Void Spiral" (max 5): "Warpath deals additional melee void damage. This effect is doubled while wielding a 2 handed weapon." Stats: Melee Void Damage +5 per point (property 5103, skill-local), "Doubled With 2h". requires 0>=0.
- Node 4 "Apocalypse Whirl" (max 1): base physical damage converted to void, Physical tag swapped for Void; Time Rot chance +30%; bleed/ignite chance -> Time Rot. requires 31>=1.
- Node 31 "Echo Knight" (max 1): stats text "Global Increased Void Damage: 50%", Warpath echoes. requires 2>=2.
- Node 28 "Molten Path" only appears in a JSON text search because its requirement is Void Spiral (not a void effect).
Not in data: whether node 31's 50% is increased or more (wording says increased; knowledge page says tree damage is usually more), and the mutator formulas for echoes and conversion.

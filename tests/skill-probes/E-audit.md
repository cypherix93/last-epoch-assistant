> **Evidence, not guidance.** Skill-probe task output (2026-10-08, game data 1.5.2), produced with the `.claude/skills/` text as it was *before* the commit that added this folder applied the feedback. Quotes and line numbers refer to that earlier skill text; the current skills supersede it. See `tests/probes/README.md` and `.claude/skills/README.md`.

# Build audit: Primalist / Beastmaster, level 95, game 1.5.x (partial: no tree detail)

Ledger (ids)
- Class/mastery: Primalist class_id 0, Beastmaster mastery_index 1 (passive bonus: +1 Companion Summon Limit; you and minions +50% increased melee damage).
- Skills: Summon Wolf `wo42` (idx 8, mana 48), Summon Frenzy Totem `sf37` (idx 282, mana 18, Beastmaster mastery skill lvl 25), Summon Scorpion `sc36pi` (idx 235, mana 70, Beastmaster lvl 15), Swipe `sw43` (idx 19, Physical/Melee, mana 0), Fury Leap `fl13` (idx 17, Physical/Melee, mana 20, is_traversal 1). All resolved via `lookup`, all have skill trees. NOTE: the three summon skills show `tag_names` NULL in `abilities`, so the skill-mask dead-stat test cannot be built for them from that column (U).
- Items (as given, resolved):
  - Chest "Rare Solarum Plate": base exists (Body Armor sub_type 39, level req 68) but `class_requirement_names = Sentinel`. A Primalist cannot equip it. Health T5 (affix 25 flat 61-90, or affix 52 +10-12% increased; which one was meant is ambiguous) and Fire Res T5 (affix 13: 30-45%) are real rolls. Verdict: build error or wrong class; need the real base (`item_subtypes WHERE base_type_id=1` with a Primalist or empty class requirement).
  - Weapon "Naga's Fang": does NOT exist (`lookup` kind unique: 0 results; FTS "Naga*" returns only lore snippets, "Fang*" returns Ruby Fang Cleaver / set). Closest real minion weapon: **Beast King** (unique 28, One-Handed Axe, Wengari Axe, lvl 46): +25-35 Physical Melee added damage, +10-20% melee attack speed, +50-75% increased minion health; tooltip: 8% less damage taken if your minions killed recently; minions take 25% less damage if you killed recently. Fits Swipe and minions. Alternative: Apiarist's Comb (79). Pick: Beast King (ask which item was meant).
  - Helmet "The Falcon's Hood": does NOT exist (0 results; "Falcon" hits are Rogue skills/affixes). Closest real: **Artor's Legacy** (unique 3, Helmet, Icewolf Pelt, lvl 44): +1 Maximum Companions, +1-2 level of Minion skills, melee ailment chance, melee attack speed. Strong alternative at level 95: Chorus of the Anurok (430, lvl 73, +2 companions, minion cold res, minion attack/cast speed).
  - Belt: Minion Damage T6 (affix 26, 75-95% increased, Minion tag, D) and Minion Health T5 (affix 70, 101-150% increased minion health, D). Both roll on Belt. Valid.
- Idols: 4x "Minion Damage" small idols: **no Small Idol affix named Minion Damage exists**. Small Idol rolls include Shared Physical/Void/Necrotic/Poison Damage (319/323/324/325), minion+player penetration combos (831-834), resistance combos (835-838), All Resistances for you and your Minions (1070), Frailty on Minion Hit (1068). Closest: Shared Physical Damage (319) for physical minions.
- Blessing: Grand Resonance of the Sea (blessing 83, subtype 34:83, timeline Ending the Storm): sole stat Ward per Second 30-42 (property 92). Nothing for minions; weak for a build with no ward engine.
- Passives, allocations, rolled values, item levels, attributes, potions, health total: not provided = unknown (U).

## Verdict
Strongest: belt rolls (T6 minion damage, T5 minion health) are genuine minion scaling. Weakest: several named pieces cannot be used as stated (class-locked chest, two nonexistent uniques, nonexistent idol affix) and the blessing gives ward to a build with no ward engine. First fix: replace the Sentinel chest with a Primalist-legal base and confirm the real item names.

## Offense (cannot be computed; needs input)
Needed: which skill is the main one, passive allocations, each skill tree's allocated nodes, weapon base and all rolls, remaining slots, companion limit, altar. Known:
- Minion scaling: class `more_minion_damage_per_level` = 0.008, `first_level_for_minion_scaling` = 26: if linear, level 95 gives (95-26) x 0.008 = ~55% more (U, formula not checked against a mechanics page). Beastmaster passive: +50% increased melee damage for you and minions (D, masteries.passive_bonus_labels).
- Belt T6 Minion Damage: +75-95% increased minion damage.
- Dead-stats query (Step 2) executed with the example mask 8388872 and ids 26, 70, 28: it flagged belt affix 26 (Minion tag) and Beast King's physical melee added damage as dead for a Fire|Spell|Hit skill. That is only a false positive for minion skills (Minion lines are live there) but true for Swipe/Fury Leap: belt Minion Damage does nothing for the player's Swipe, and Beast King's added Physical Melee damage does nothing for the minions. A build mixing player melee and minions splits its stats: flag.
- DPS vs dummy / vs L100 monster: not determined. Bucket table: not buildable without rolls.

## Defense (not determinable beyond fragments)
Known: Fire Res T5 on chest (30-45%; chest unusable). Class base: endurance 20%, no threshold; health 100 + 10/level = 1050 at lv95 before Vitality/gear (D). Armour, dodge, block, other resistances, health total not given: not determined. Red flag: only one resistance supplied. Minion defenses are separate (minion resist idols 835-838/1070/1049).

## Sustain
Unknown regen/leech/potions. Blessing gives 30-42 ward/s, which decays quickly without retention (ward-health-sustain.md, G/D); not useful alone. Time to refill: not determined.

## Mana
Costs (D, abilities): Wolf 48, Scorpion 70, Frenzy Totem 18, Fury Leap 20, Swipe 0. Max mana at lv95 = 50 + 0.50506 x 95 = ~98 before attunement (D, class table), base regen 8/s. Resummoning Wolf + Scorpion costs 118 > 98 total: flag (U pending attunement, mana affixes, tree discounts).

## Mobility
Fury Leap `fl13` is a traversal skill (is_traversal 1, 20 mana, 0.75 s use). One traversal among five: fine. Movement speed and cooldowns unknown.

## Bottlenecks (ranked; marginal-value table not computable)
1. Build legality: class-locked chest, nonexistent items/idols (certain).
2. Survivability: resistances unknown, likely low (U).
3. Offense split between player melee and minions dilutes stats.
Levers: new more-multipliers for minions (tree nodes), minion crit, minion cooldown recovery (idol 286), skill levels (Artor +1-2 minion, Herald of the Scurry Wolf levels).

## Missing resistances
All unknown except fire. Best craftable T5 sources (query executed): each of Fire/Cold/Lightning/Void/Physical/Poison/Necrotic Resistance suffix 30-45%; dual prefixes 18%.

## Anti-synergies and traps
- Class lock on chest (item_subtypes.class_requirement_names).
- Skill-tree downsides (is_downside query on ids wo42/sc36pi/sf37/sw43/fl13): Lone Wolf (only one active Wolf, wo42 node 30), Legendary Bite (-10% attack speed, wo42 node 10), Reckless Frenzy (+8% damage taken, sf37 node 23), Thorn Idol (20% max health taken before releasing, sf37 node 5), Grounded, Symbol of Selflessness (totem affects only companions), Claws of the Bear (cooldown 2, sw43), Violent Upheaval (fl13). Only matter if allocated.
- Snapshot trap: minion stats are a summon-time snapshot; later buffs and swaps do not reach living minions (catalogue, D?).
- Beast King effects conditional on kills (catalogue, D).
- Blessing ward in a no-ward build.

## Ranked suggestions
1. Replace the chest with a Primalist-legal base; keep Fire Res T5 and Health (affix 25 flat 61-90 or 52 +10-12%). Gain: item legal. D.
2. Replace nonexistent "Naga's Fang" with Beast King (28) or Apiarist's Comb (79). Gain: minion health +50-75%, Physical melee +25-35. D.
3. Replace "Falcon's Hood" with Artor's Legacy (3): +1 companion, +1-2 minion skill levels. D.
4. Idols: swap invented Minion Damage for Shared Physical Damage 319 or minion resist combos (835-838) once resistances are known.
5. Swap Grand Resonance of the Sea for a resistance or minion blessing; search `v_blessings` (e.g. Grand Echo of Solarum 27 Void Res 55-75, Grand Resolve of Grael 181 Physical Res 55-75).
6. Provide passives, trees and rolls to continue.

## Not determined from data
Passives, all tree allocations, remaining gear, rolls and item levels, attributes, health/res/armour totals, sustain, mana investments, content target, minion counts and stats, DPS entirely, Beast King uptime. Inputs assumed U: lv95 minion-scaling arithmetic.

## Sources
classes (Primalist), masteries (class 0 idx 1), abilities wo42/sf37/sc36pi/sw43/fl13, class_abilities, item_subtypes (Body Armor 39), v_unique_summary 3 and 28, mods affix_tier 13/25/52/26/70, v_blessings 34:83, tag_bits, catalogue.md (Snapshot trap, stack-per-event), skill_node downside query.

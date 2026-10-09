# Erasing Strike Void Knight: agent vs Maxroll (Volca, Endgame tab, 2026-09-28)

Ground truth: ground-truth.md (decoded from planner profile 0g5ta0n3).
Agent A = opus, le-data MCP only. Agent B = opus, MCP + skills + knowledge.

| Area | Maxroll | A (MCP only) | B (MCP+skills+knowledge) |
|---|---|---|---|
| Specialized skills | ES, Devouring Orb, Anomaly, Void Cleave, Abyssal Echoes | 4/5 (Volatile Reversal for Abyssal Echoes) | 3/5 (Lunge + Rebuke for Void Cleave + Abyssal Echoes) |
| ES nodes (12 in guide) | Obliteration 5, Erasure 5, Dust To Wind 3, Rifts 2, Merciful 2, Chamber of Fate 2, Prophet's 2, Time Loop 1, Shattered Continuity 1, Essence 1, Implements 1, Final Hour 1 | 7/12; Time Loop 3 (guide says 1 for mana) | 9/12; Time Loop 1 with the guide's exact mana reasoning |
| Mana engine | Void Well + Essences + mana stacking | correct | correct, with numbers |
| Core passives (13 VK) | Abyssal Endurance, Void Well, Void Corruption, Echoing Strikes, Time Legion, Singular Purpose, Woe, Abyssal Fluctuation, Eternal Form, Essence, Mortal Cleave, Dark Maw, Sorrow and Steel | 10/13; took Avatar of Regret (guide rejects) | 9/13; took Avatar of Regret; skipped Forge Guard dip "data doesn't say which half is open" |
| Forge Guard dip (Champion of the Forge, Crushing Blows, Battle Hardened) | yes, 25 pts | no | no |
| Weapon | World Splitter + Melee Void Damage T7 slam | World Splitter + same slam (exact) | Shadow Beacon (rejected World Splitter as "Harbinger-only, mana conflict") |
| Helmet | Mask of Indifference (+Mana) | Terror Crown rare | rare with Mana + crit avoidance |
| Body | Titan Heart (+Level of ES T7) | Apocalypse Plate rare with Level of ES | rare with Level of ES T7 |
| Gloves | Falcon Fists -> Immortal Vise | rare | rare |
| Belt | Shattered Chains | Divine Girdle rare, Shattered Chains alt | rare, Shattered Chains alt |
| Boots | Army of Skin / Darkstride | The Inevitable | The Inevitable |
| Amulet | Nihilis | Exulis | Omnis |
| Rings | Flames of Midnight, Siphon of Anguish (+crit T7) | Unsated Rage (Aspirational pick), crit rare | crit rares, Siphon alt |
| Relic | Anchor of Oblivion -> Shattered Worlds | Tainted Effigy rare, Anchor alt | rare with Mana |
| Unique gear slots matched | 10 slots | 1 exact, 3 as alternatives | 0 exact, 2 as alternatives |
| Blessings (5) | Emptiness of Ash, Light of the Moon, Resolve of Humanity, Bulwark of Tundra, Body of Obsidian | 2 + Embers (Aspirational) | 2 + Embers (Aspirational) |
| Extras | | tool-issue list | scored variants, DPS/EHP estimate, 4 in-game tests, confidence labels |
| MCP calls | | ~68 (12 errors) | 33 (2 errors) + ~24 file reads |

Verified tool issues: mcp:list prints no input schemas; sql rejects ';' inside string literals;
Trident of the Last Abyss "Void Resistance 0.75..90" (mixed scale); is_legendary_capable=1 for only 18 uniques (it is canDropAsLegendary, not LP-eligible).
Reported, unverified: search quoting kills FTS operators; v_affix_summary.stats_text drops tags; v_blessings has no tags column;
drop-rate blessings decode item masks as damage tags; requires_text documented as AND but data is adjacency/OR; per-point vs lump not marked per stat line;
ES damage lives on sub-ability es6ai_1 which lookup labels minion/monster; AP114:4-17 have no source rows (node effects are display-only);
no drop-source data; mastery tree access split not in knowledge; build-around-item skill points at vendor/ file.

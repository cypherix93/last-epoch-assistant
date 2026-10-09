# Ground truth: Maxroll profile "Endgame"

Class id 2 = Sentinel; mastery 1 = Void Knight; level 100; season 5. Data: maxroll data.json 1.5.2. Rolls: roll=1 means max of range (profile stores fraction 0..1; value = min+(max-min)*roll). Profile tier is 1-based (tier N = tiers[N-1]); shown as T<N>.

## 1. Gear
### weapon [items#2]: World Splitter - unique; base: Bardiche (Two-Handed Axe) - CORRUPTED
  - unique mod: increased Area for Melee Area Skills per 1 Mana Cost added fixed 0.02
  - unique mod: Critical Strike Chance for Melee Attacks per 1 Mana Cost added range 0.2%..0.3%, rollID 0 roll=1 => 0.3%
  - unique mod: Mana Regen increased range 30%..52%, rollID 1 roll=1 => 52%
  - unique mod: Mana increased range 30%..52%, rollID 2 roll=1 => 52%
  - unique mod: Damage [tags=528] added range 30..52, rollID 3 roll=1 => 52
  - unique mod: Melee Critical Strike multiplier per 10 Max Mana added fixed 1%
  - implicit: Damage [tags=512] added range 130..130, roll=1 => 130
  - implicit: Ailment Chance [tags=512] [specialTag=2] added range 130%..190%, roll=1 => 190%
  - extra affix [prefix] Added Melee Void Damage (affix 76) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Damage [tags=528] range 51..65 => 65
  - corrupted [corruption] Increased Melee Damage and Damage for Melee Attacks per 1 Mana Cost (affix 986) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: increased Damage [tags=512] range 130%..140% => 140% + more Damage for Melee Attacks per 1 Mana Cost (up to 20) range 0.3%..0.3% => 0.3% [specialAffixType 6]
### head [items#147]: Mask of Indifference - unique; base: Forest Helmet (Helmet)
  - unique mod: Blind Immunity added fixed 1 (hidden)
  - unique mod: Bleed Immunity added fixed 1 (hidden)
  - unique mod: Stun Immunity added fixed 1 (hidden)
  - unique mod: Slow and Chill Immunity added fixed 1 (hidden)
  - unique mod: Shock Immunity added fixed 1 (hidden)
  - unique mod: reduced Bonus Damage Taken from Critical Strikes added range 10%..100%, rollID 0 roll=1 => 100%
  - unique mod: Armor added range 20..200, rollID 1 roll=1 => 200
  - unique mod: Endurance Threshold added range 20..200, rollID 2 roll=1 => 200
  - unique mod: Damage Reflected added range 10%..100%, rollID 3 roll=1 => 100%
  - unique text: You are immune to Blind, Bleed, Slow, Chill, Shock, and Stun.
  - implicit: Armor added range 50..50, roll=1 => 50
  - extra affix [prefix] Added Mana (affix 34) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Mana range 91..120 => 120
  - extra affix [prefix] Increased Mana and Mana Regen (affix 1156) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Mana range 7%..8% => 8% + increased Mana Regen range 28%..33% => 33%
### body [items#1]: Titan Heart - unique; base: Copper Plate (Body Armor)
  - unique mod: Armor added range 50..100, rollID 0 roll=1 => 100
  - unique mod: Health Regen more fixed -100% (hidden)
  - unique mod: Less Damage Taken while wielding a Two Handed Melee Weapon added fixed 15%
  - unique mod: Health increased range 30%..40%, rollID 1 roll=1 => 40%
  - unique mod: Damage [tags=512] increased range 30%..40%, rollID 2 roll=1 => 40%
  - unique text: You do not regenerate health | You can still regain health through methods other than health regen
  - implicit: Armor added range 114..114, roll=1 => 114
  - implicit: Lightning Resistance added range 5%..14%, roll=1 => 14%
  - extra affix [prefix] Level of Erasing Strike (affix 568) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Level of Skills [ErasingStrike] (specialTag 1) range 4..4 => 4 + increased Damage [tags=16] range 121%..150% => 150%
  - extra affix [prefix] Added Mana (affix 34) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Mana range 36..50 => 50
### waist [items#3]: Shattered Chains - unique; base: Plated Belt (Belt) - CORRUPTED
  - unique mod: Armor increased range 50%..70%, rollID 0 roll=1 => 70%
  - unique mod: Damage [tags=528] added range 5..10, rollID 1 roll=1 => 10
  - unique mod: Damage [tags=512] increased range 50%..70%, rollID 2 roll=1 => 70%
  - unique mod: Potion Use Cleanses Stun and Freeze added fixed 1 (hidden)
  - unique mod: Stun Immunity [tags=65536] added fixed 1 (hidden)
  - unique mod: More Damage Per Stack [tags=528] [specialTag=90] more fixed 5%
  - unique text: Using a Potion Cleanses Stun and Freeze
  - unique text: Stun Immunity for 4 seconds when you use a Potion
  - implicit: Armor added range 35..65, roll=1 => 65
  - implicit: Potion Slots added range 3..3, roll=1 => 3
  - extra affix [suffix] Increased Health (affix 52) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: increased Health range 21%..26% => 26%
  - corrupted [corruption] Increased Mana and Mana Spent Gained as Ward (affix 1021) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: increased Mana range 14%..14% => 14% + added Mana Spent Gained as Ward range 49%..50% => 50% [specialAffixType 6]
### hands [items#154]: Falcon Fists - unique; base: Plated Gauntlets (Gloves)
  - unique mod: Cinder Strike Melee Damage per Level of Falconry While Unarmed [CinderStrike] added range 12..16, rollID 0 roll=1 => 16
  - unique mod: increased Cinder Strike Area per Level of Falconry While Unarmed [CinderStrike] added range 3%..4%, rollID 1 roll=1 => 4%
  - unique mod: Cinder Strike Melee Damage per Falcon Hit in the past 6 seconds if you are unarmed added fixed 4 (hidden)
  - unique mod: increased Cinder Strike Area per Falcon Hit in the past 6 seconds if you are unarmed added fixed 1% (hidden)
  - unique mod: Level of Skills [CinderStrike] (specialTag 1) added range 1..4, rollID 2 roll=1 => 4
  - unique mod: Level of Skills [Falconer 00 Falconry] (specialTag 1) added range 1..4, rollID 3 roll=1 => 4
  - unique mod: Attack Speed [tags=512] increased range 12%..27%, rollID 4 roll=1 => 27%
  - unique mod: Damage [tags=520] added range 12..27, rollID 5 roll=1 => 27 (hidden)
  - unique mod: Damage [tags=8712] added range 12..27, rollID 5 roll=1 => 27 (hidden)
  - unique text: While unarmed your Falcon's hits grant Cinder Strike +4 Melee Damage and 1% increasd Area for 6 seconds
  - unique text: +[12,27,5] Melee Fire Damage for you and your Minions
  - implicit: Armor added range 75..75, roll=1 => 75
  - implicit: Endurance added range 5%..15%, roll=1 => 15%
  - extra affix [prefix] Added Mana (affix 34) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Mana range 91..120 => 120
  - extra affix [suffix] Armor Shred Chance (affix 86) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Ailment Chance [specialTag=8] range 71%..100% => 100%
### feet [items#29]: Army of Skin - unique; base: Shrine Boots (Boots) - CORRUPTED
  - unique mod: chance to gain a stack of Excoriation when Flay kills an enemy or hits a boss or rare enemy added fixed 1 (hidden)
  - unique mod: Attack Speed [tags=512] increased range 6%..13%, rollID 1 roll=1 => 13%
  - unique mod: Movement Speed increased range 13%..26%, rollID 2 roll=1 => 26%
  - unique mod: Global Conditional Damage [tags=512] [specialTag=2] more range 26%..52%, rollID 3 roll=1 => 52%
  - unique text: When Flay kills an enemy or hits a boss or rare enemy you gain a stack of Excoriation and have a 6% chance to cast Summon Skeleton if not at maximum skeletons
  - unique text: Excoriation has a maximum of 13 stacks and all stacks expire if you have not gained a new one for 13 seconds
  - unique text: Each stack of Excoriation grants Flay and Harvest 13% increased Area of Effect and +5 Melee Damage
  - unique text: Each stack of Excoriation grants an 8% chance on Flay hit to cast Rip Blood (up to 3 times per 2 seconds) | Consumes mana equal to Rip Blood's mana cost or 2 mana, whichever is higher. Flay's Deadly Plot can apply to Rip Blood cast this way.
  - implicit: Armor added range 8..8, roll=1 => 8
  - implicit: Movement Speed increased range 11%..14%, roll=1 => 14%
  - implicit: increased Cooldown Recovery Speed for Evade [Acolyte Evade] added range 16%..32%, roll=1 => 32%
  - extra affix [prefix] Increased Movement Speed (affix 28) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: increased Movement Speed range 26%..30% => 30%
  - corrupted [corruption] Chance to Cleanse Ailments on Evade and Increased Ailment Damage Taken (affix 991) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Chance to cleanse all ailments when you Evade [Acolyte Evade] range 100%..100% => 100% + increased Damage Taken [tags=33554432] range 1%..1% => 1% [specialAffixType 6]
### neck [items#8]: Nihilis - unique; base: Unbound Locket (Amulet)
  - unique mod: Level of Skills added range 1..2, rollID 0 roll=1 => 2
  - unique mod: Mana Regen increased range -20%..50%, rollID 1 roll=1 => 50%
  - unique mod: Armor more range -10%..20%, rollID 2 roll=1 => 20%
  - unique mod: All Resistances added range -5%..15%, rollID 3 roll=1 => 15%
  - unique mod: Current Health and Ward lost when you use Evade added range 10%..20%, rollID 4 roll=1 => 20%
  - unique mod: Seconds of Frenzy after you use Evade added range 1.2..4, rollID 5 roll=1 => 4
  - implicit: Health increased range 1%..12%, roll=1 => 12%
  - implicit: Mana increased range 1%..12%, roll=1 => 12%
  - implicit: Movement Speed increased range -4%..8%, roll=1 => 8%
  - extra affix [prefix] Added Mana (affix 34) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Mana range 91..120 => 120
### finger1 [items#175]: Flames of Midnight - unique; base: Celestial Ring (Ring)
  - unique mod: Evade is replaced by Spirit Step [Acolyte Evade] added fixed 1 (hidden)
  - unique mod: Swiftness added fixed 1 (hidden)
  - unique mod: Wandering Spirits Base Damage Converted to Fire [WanderingSpirits] added fixed 100%
  - unique mod: Create a Wandering Spirit on direct Fire, Necrotic, or Void Skill Use added fixed 100% (hidden)
  - unique mod: Penetration [tags=8] added range 7%..11%, rollID 0 roll=1 => 11% (hidden)
  - unique mod: Penetration [tags=32] added range 7%..11%, rollID 0 roll=1 => 11% (hidden)
  - unique mod: Penetration [tags=16] added range 7%..11%, rollID 0 roll=1 => 11% (hidden)
  - unique mod: Ward gained each second per Active Wandering Spirit [WanderingSpirits] added range 4..7, rollID 1 roll=1 => 7
  - unique text: Evade is replaced by Spirit Step
  - unique text: You have Swiftness
  - unique text: When you directly use a Fire, Necrotic, or Void skill you create a Wandering Spirit near the target location (4 second cooldown for each skill type). | Each skill type has a separate cooldown. The spirit is created at an accessible location, where it can be swapped with.
  - unique text: +[7,11,0]% Fire, Necrotic, and Void Penetration
  - implicit: Ward Decay Threshold added range 42..110, roll=1 => 110
  - extra affix [prefix] Strength (affix 501) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Strength range 14..16 => 16
  - extra affix [suffix] Added Health (affix 25) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Health range 61..90 => 90
### finger2 [items#5]: Siphon of Anguish - unique; base: Gold Ring (Ring)
  - unique mod: Damage Leeched as Health [tags=512] added range 10%..30%, rollID 0 roll=1 => 30%
  - unique mod: Damage Leeched as Health [tags=16] added range 10%..30%, rollID 1 roll=1 => 30%
  - unique mod: Ailment Chance [specialTag=90] added range 10%..30%, rollID 2 roll=1 => 30%
  - unique mod: Increased Ailment Effect [specialTag=90] added range 10%..30%, rollID 3 roll=1 => 30%
  - unique mod: Movement Speed increased range 3%..8%, rollID 4 roll=1 => 8%
  - unique mod: Increased Leech Rate added range 10%..30%, rollID 5 roll=1 => 30%
  - implicit: Elemental Resistance added range 5%..18%, roll=1 => 18%
  - extra affix [prefix] Increased Critical Strike Chance (affix 5) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: increased Critical Strike Chance range 76%..100% => 100%
  - extra affix [suffix] Elemental Resistance (affix 80) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Elemental Resistance range 16%..20% => 20%
### relic [items#7]: Anchor of Oblivion - unique; base: Lost Anchor (Relic)
  - unique mod: Damage [tags=16] increased range 40%..100%, rollID 0 roll=1 => 100%
  - unique mod: Endurance added fixed 40%
  - unique mod: Strength added range 10..14, rollID 1 roll=1 => 14
  - unique mod: Endurance Threshold added range 40..100, rollID 2 roll=1 => 100
  - unique mod: When a hit leaves you below your endurance threshold you are slowed and release a Wave of Void (2 second cooldown) added fixed 1 (hidden)
  - unique text: When a hit leaves you below your endurance threshold you are slowed and release a powerful Wave of Void (2 second cooldown)
  - implicit: Armor increased range 15%..25%, roll=1 => 25%
  - extra affix [prefix] Added Mana (affix 34) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Mana range 91..120 => 120
### altar [items#9]: Pyramidal Altar (Idol Altar) - non-unique (rare/magic) - CORRUPTED
  - implicit: Increased Cooldown Recovery Speed if there are no larger idols above smaller ones in the grid added range 0.1..0.1, roll=1 => 0.1
  - implicit: Weaver Idols equipped at Maximum added range 2..2, roll=1 => 2
  - affix [prefix] Increased Effect of Idols within Refracted Slots (affix 1089) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: increased Effect of Prefixes and Suffixes for Idols in Refracted Slots range 28%..32% => 32%
  - affix [prefix] Increased Effect of Idols within Refracted Slots (affix 1094) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Effect of Suffixes for Idols in Refracted Slots range 25%..30% => 30%
  - affix [suffix] Maximum Idols Equipped (affix 1101) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Mana per Idol in a Refracted Slot range 6..7 => 7
  - affix [suffix] Maximum Idols Equipped (affix 1097) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Reduced Bonus Damage Taken from Critical Strikes per Equipped Heretical Idol range 0.06..0.07 => 0.07
  - corrupted [corruption] Increased Effect of Idols within Refracted Slots (affix 1093) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Effect of Prefixes for Idols in Refracted Slots range 25%..30% => 30%

## 2. Idols (5x5 grid, idx=y*5+x; origin = top-left cell of idol footprint)
### Idol grid cell (2,0) [array idx 2] [items#10]: Minor Weaver Idol (Minor Idol) - non-unique (rare/magic)
  - affix [prefix] Mana and Increased Mana Regen (affix 843) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Mana range 8..12 => 12 + increased Mana Regen range 2%..5% => 5% [specialAffixType 5]
  - affix [suffix] Cold Resistance and Minion Cold Resistance (affix 850) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Cold Resistance range 9%..12% => 12% + added Cold Resistance [tags=8192] range 9%..12% => 12% [specialAffixType 5]
### Idol grid cell (1,1) [array idx 6] [items#158]: Grand Iron Omen Idol (Grand Idol) - non-unique (rare/magic) - CORRUPTED
  - affix [prefix] Idol Vitality (affix 124) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Vitality range 3..7 => 7
  - affix [suffix] Chance To Shred Armor on Melee Hit (affix 211) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Ailment Chance [tags=512] [specialTag=8] range 30%..80% => 80%
  - corrupted [corruption] Added Spell Damage and reduced Bow Damage (affix 1039) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Damage [tags=512] range 5..10 => 10 [specialAffixType 6]
### Idol grid cell (0,2) [array idx 10] [items#157]: Heretical Ornate Solar Idol (Ornate Idol) - non-unique (rare/magic)
  - affix [prefix] Idol Vitality (affix 124) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Vitality range 3..7 => 7
  - affix [suffix] Idol Sentinel Increased Melee Void Damage (affix 326) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: increased Damage [tags=528] range 33%..90% => 90%
  - affix [suffix] Increased Movement Speed and Increased Damage (affix 894) T7 (profile tier 7, tiers idx 6 of 0..6), roll=1: increased Movement Speed range 4%..5% => 5% + increased Damage range 15%..18% => 18% [specialAffixType 4]
### Idol grid cell (4,2) [array idx 14] [items#162]: Heretical Large Rahyeh Idol (Large Idol) - non-unique (rare/magic)
  - affix [suffix] Chance To Shred Armor on Melee Hit (affix 211) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Ailment Chance [tags=512] [specialTag=8] range 30%..80% => 80%
  - affix [prefix] Chance To Gain Inspiration On Kills With Void Skills (affix 281) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Chance to gain Inspiration when you kill an enemy with a void skill range 12%..35% => 35%
  - affix [suffix] Increased Echo damage and Chance to gain frenzy for 3 seconds on echo (affix 920) T7 (profile tier 7, tiers idx 6 of 0..6), roll=1: added increased Echo Damage when a skill is Echoed range 16%..20% => 20% + added chance to gain Frenzy for 3 seconds when you Echo an ability range 5%..5% => 5% [specialAffixType 4]
### Idol grid cell (0,3) [array idx 15] [items#156]: Heretical Ornate Solar Idol (Ornate Idol) - non-unique (rare/magic)
  - affix [prefix] Idol Vitality (affix 124) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Vitality range 3..7 => 7
  - affix [suffix] Idol Sentinel Increased Melee Void Damage (affix 326) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: increased Damage [tags=528] range 33%..90% => 90%
  - affix [suffix] Increased Movement Speed and Increased Damage (affix 894) T7 (profile tier 7, tiers idx 6 of 0..6), roll=1: increased Movement Speed range 4%..5% => 5% + increased Damage range 15%..18% => 18% [specialAffixType 4]
### Idol grid cell (0,4) [array idx 20] [items#155]: Heretical Ornate Solar Idol (Ornate Idol) - non-unique (rare/magic)
  - affix [prefix] Idol Vitality (affix 124) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Vitality range 3..7 => 7
  - affix [suffix] Idol Sentinel Increased Melee Void Damage (affix 326) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: increased Damage [tags=528] range 33%..90% => 90%
  - affix [suffix] Increased Movement Speed and Increased Damage (affix 894) T7 (profile tier 7, tiers idx 6 of 0..6), roll=1: increased Movement Speed range 4%..5% => 5% + increased Damage range 15%..18% => 18% [specialAffixType 4]

## 3. Blessings (slot i = timeline i+1; verified: each blessing subtype appears in that timeline's blessing lists)
- Slot 2 / Timeline 3 The Black Sun: Grand Emptiness of Ash (itemType 34, subType 47) - Critical Strike Multiplier added 40% (range 27%..40%, roll 1)
- Slot 4 / Timeline 5 Ending the Storm: Grand Light of the Moon (itemType 34, subType 75) - Mana added 90 (range 60..90, roll 1)
- Slot 6 / Timeline 7 Reign of Dragons: Grand Resolve of Humanity (itemType 34, subType 149) - All Resistances added 20% (range 13%..20%, roll 1)
- Slot 8 / Timeline 9 The Age of Winter: Grand Bulwark of the Tundra (itemType 34, subType 199) - Armor increased 55% (range 25%..55%, roll 1)
- Slot 9 / Timeline 10 Spirits of Fire: Grand Body of Obsidian (itemType 34, subType 205) - Armor added 320 (range 200..320, roll 1)

## 4. Passives (history length 113, position 113)
### Sentinel (mastery 0) - 20 points
- Juggernaut (node 0): 7/8
- Armour Clad (node 2): 5/5
- Fearless (node 49): 8/8
### Void Knight (mastery 1) - 68 points
- Abyssal Endurance (node 11): 10/10
- Sorrow and Steel (node 13): 5/10
- Dark Maw (node 16): 5/5
- Eternal Form (node 22): 8/10
- Essence of the End (node 25): 1/5
- Echoing Strikes (node 40): 3/5
- Void Well (node 54): 1/1
- Void Corruption (node 56): 5/8
- Singular Purpose (node 61): 5/5
- Woe (node 63): 5/8
- Abyssal Fluctuation (node 64): 5/5
- Time Legion (node 79): 10/10
- Mortal Cleave (node 116): 5/5
### Forge Guard (mastery 2) - 25 points
- Battle Hardened (node 28): 8/10
- Unflinching (node 32): 5/5
- Crushing Blows (node 36): 5/5
- Fresh from the Forge (node 53): 1/10
- Weapons Master (node 65): 1/10
- Champion of the Forge (node 111): 5/8
### Paladin (mastery 3) - 0 points


## 5. Skills
activeSkills (bar): Erasing Strike [ErasingStrike], Devouring Orb [DevouringOrb], Anomaly [Anomaly], Void Cleave [VoidCleave], Rebuke [Rebuke]
specializedSkills: Erasing Strike [ErasingStrike], Devouring Orb [DevouringOrb], Anomaly [Anomaly], Void Cleave [VoidCleave], Abyssal Echoes [AbyssalEchoes]

### es6ai => Erasing Strike [ErasingStrike] (specialized) - 26 points
- Dust To Wind (node 2): 3/3
- Rifts of Decay (node 3): 2/4
- Merciful (node 9): 2/4
- Erasure of the Living (node 11): 5/5
- Time Loop (node 13): 1/3
- Shattered Continuity (node 14): 1/1
- Chamber of Fate (node 15): 2/2
- Obliteration (node 16): 5/5
- Prophet's Onslaught (node 17): 2/3
- Essence of the End (node 18): 1/3
- Implements of Destruction (node 24): 1/4
- Final Hour (node 26): 1/1
### do5vr => Devouring Orb [DevouringOrb] (specialized) - 22 points
- Dark Moon (node 2): 1/1
- Abyssal Rush (node 4): 1/1
- Void Adept (node 7): 5/5
- Hollow Orb (node 8): 1/1
- Cataclysm (node 11): 1/1
- Fleeting Orb (node 12): 2/4
- Dust Channeller (node 13): 2/4
- Orb Master (node 14): 5/5
- Abyssal Juggernaut (node 26): 4/4
### an0my => Anomaly [Anomaly] (specialized) - 22 points
- Void Touched (node 12): 1/1
- Exacerbate (node 13): 2/5
- Mark of Rot (node 14): 5/5
- Time Bubble (node 17): 1/1
- Decimation (node 18): 4/5
- Temporal Mastery (node 19): 5/5
- Time Lord (node 20): 1/1
- Manipulation (node 22): 1/2
- Immediacy (node 26): 1/1
- Lingering Memory (node 30): 1/1
### si4lgl => Sigils Of Hope [SigilsOfHope Active] (NOT in specializedSkills) - 23 points
- Celestial Concentration (node 2): 1/4
- Heavenly Justice (node 6): 5/5
- Iron Symbols (node 15): 5/5
- Enduring Hope (node 23): 2/2
- Tetragram (node 28): 1/1
- Decree of Flame (node 29): 3/3
- Symbols of Wrath (node 30): 1/1
- Empowering Symbols (node 32): 5/5
### hh7pa3 => Healing Hands [HealingHands] (NOT in specializedSkills) - 23 points
- Searing Light (node 1): 1/1
- Bane of Evil (node 2): 1/2
- Halted Scourge (node 3): 1/1
- Turn Undead (node 4): 1/1
- Cleric's Wrath (node 5): 2/2
- Seraph Blade (node 8): 1/1
- Prayer of the Fallen (node 9): 2/4
- Blessed Parish (node 10): 3/3
- Purity of Thought (node 11): 1/1
- Urgent Healing (node 18): 2/4
- Cleric's Hammer (node 20): 4/4
- Rahyeh's Chariot (node 22): 1/1
- Sun Shroud (node 26): 1/1
- Virtue of Patience (node 28): 2/2
### v01cv => Void Cleave [VoidCleave] (specialized) - 22 points
- Abyssal Walker (node 6): 4/4
- Into the Depths (node 8): 5/5
- Precognition (node 9): 1/1
- Dark Pathway (node 17): 3/3
- Fraying Strikes (node 18): 2/5
- Resonating Cleave (node 19): 1/1
- Armor Sunderer (node 26): 4/5
- Nether Charge (node 28): 1/1
- Gravity's Edge (node 32): 1/1
### ab0lh => Abyssal Echoes [AbyssalEchoes] (specialized) - 22 points
- Vorpal Reverberation (node 2): 1/5
- Rippling Corrosion (node 3): 5/5
- Turbulence (node 9): 1/4
- Myopia (node 10): 1/1
- Fragility (node 11): 1/1
- Embrace the Darkness (node 14): 4/4
- Abyssal Tendrils (node 15): 3/3
- Crippling Waves (node 17): 2/3
- Void Supremacy (node 19): 4/4

## 6. Starter / Aspirational diffs vs Endgame

### Starter
- body: DIFFERS
### body [items#38]: Champion Regalia (Body Armor) - non-unique (rare/magic)
  - implicit: Armor added range 700..700, roll=1 => 700
  - implicit: Armor Mitigation also applies to Damage over Time added range 0.1..0.17, roll=1 => 0.17
  - affix [prefix] Added Mana (affix 34) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Mana range 36..50 => 50
  - affix [prefix] Level of Erasing Strike (affix 568) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Level of Skills [ErasingStrike] (specialTag 1) range 2..2 => 2 + increased Damage [tags=16] range 61%..90% => 90%
  - affix [suffix] Added Health (affix 25) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Health range 61..90 => 90
  - affix [suffix] Increased Health (affix 52) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Health range 10%..12% => 12%
  - sealed [SEALED] Increased Echo Damage When A Skill Echoes (affix 373) T1 (profile tier 1, tiers idx 0 of 0..7), roll=1: added increased Echo Damage when a skill is Echoed range 60%..72% => 72%
- waist: DIFFERS
### waist [items#41]: Praetorian Belt (Belt) - non-unique (rare/magic)
  - implicit: Armor added range 125..250, roll=1 => 250
  - implicit: Potion Slots added range 4..4, roll=1 => 4
  - affix [suffix] Increased Health (affix 52) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Health range 10%..12% => 12%
  - affix [suffix] Hybrid Health (affix 36) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Health range 46..68 => 68 + increased Health range 5%..5% => 5%
  - affix [prefix] Increased Void Damage (affix 15) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Damage [tags=16] range 40%..60% => 60%
  - affix [prefix] Mana Regeneration (affix 330) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Mana Regen range 30%..38% => 38%
  - sealed [SEALED] Ward and Ailment Cleansing on Potion Use (affix 75) T1 (profile tier 1, tiers idx 0 of 0..7), roll=1: added Ward Gained on Potion Use range 20..30 => 30 + added chance to Cleanse All Ailments on Potion Use range 100%..100% => 100%
- finger2: DIFFERS
### finger2 [items#37]: Siphon of Anguish - unique; base: Gold Ring (Ring)
  - unique mod: Damage Leeched as Health [tags=512] added range 10%..30%, rollID 0 roll=1 => 30%
  - unique mod: Damage Leeched as Health [tags=16] added range 10%..30%, rollID 1 roll=1 => 30%
  - unique mod: Ailment Chance [specialTag=90] added range 10%..30%, rollID 2 roll=1 => 30%
  - unique mod: Increased Ailment Effect [specialTag=90] added range 10%..30%, rollID 3 roll=1 => 30%
  - unique mod: Movement Speed increased range 3%..8%, rollID 4 roll=1 => 8%
  - unique mod: Increased Leech Rate added range 10%..30%, rollID 5 roll=1 => 30%
  - implicit: Elemental Resistance added range 5%..18%, roll=1 => 18%
- relic: DIFFERS
### relic [items#42]: Argent Crest (Relic) - non-unique (rare/magic)
  - implicit: Cold Resistance added range 30%..45%, roll=1 => 45%
  - implicit: Lightning Resistance added range 30%..45%, roll=1 => 45%
  - affix [suffix] Endurance (affix 92) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Endurance range 11%..15% => 15%
  - affix [suffix] Added Health (affix 25) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Health range 61..90 => 90
  - affix [prefix] Added Mana (affix 34) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Mana range 36..50 => 50
  - affix [prefix] Added Critical Strike Multiplier (affix 6) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Critical Strike Multiplier range 21%..25% => 25%
- head: DIFFERS
### head [items#24]: Leonine Greathelm (Helmet) - non-unique (rare/magic)
  - implicit: Armor added range 550..550, roll=1 => 550
  - implicit: reduced Bonus Damage Taken from Critical Strikes added range 50%..85%, roll=1 => 85%
  - affix [prefix] Added Mana (affix 34) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Mana range 36..50 => 50
  - affix [suffix] Added Health (affix 25) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Health range 61..90 => 90
  - affix [suffix] Increased Health (affix 52) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Health range 10%..12% => 12%
  - affix [prefix] Increased Mana (affix 331) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Mana range 8%..10% => 10%
  - sealed [SEALED] Increased Armor Shred Effect (affix 370) T1 (profile tier 1, tiers idx 0 of 0..7), roll=1: added Increased Ailment Effect [specialTag=8] range 45%..51% => 51%
- weapon: DIFFERS
### weapon [items#25]: World Splitter - unique; base: Bardiche (Two-Handed Axe)
  - unique mod: increased Area for Melee Area Skills per 1 Mana Cost added fixed 0.02
  - unique mod: Critical Strike Chance for Melee Attacks per 1 Mana Cost added range 0.2%..0.3%, rollID 0 roll=1 => 0.3%
  - unique mod: Mana Regen increased range 30%..52%, rollID 1 roll=1 => 52%
  - unique mod: Mana increased range 30%..52%, rollID 2 roll=1 => 52%
  - unique mod: Damage [tags=528] added range 30..52, rollID 3 roll=1 => 52
  - unique mod: Melee Critical Strike multiplier per 10 Max Mana added fixed 1%
  - implicit: Damage [tags=512] added range 130..130, roll=1 => 130
  - implicit: Ailment Chance [tags=512] [specialTag=2] added range 130%..190%, roll=1 => 190%
- neck: DIFFERS
### neck [items#39]: Bone Amulet (Amulet) - non-unique (rare/magic)
  - implicit: Physical Resistance added range 13%..40%, roll=1 => 40%
  - implicit: Necrotic Resistance added range 13%..40%, roll=1 => 40%
  - affix [suffix] Health and Stun Avoidance (affix 29) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Health range 45..60 => 60 + added Stun Avoidance range 251..350 => 350
  - affix [suffix] Armor Shred Chance (affix 86) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Ailment Chance [specialTag=8] range 71%..100% => 100%
  - affix [prefix] Added Mana (affix 34) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Mana range 36..50 => 50
  - affix [prefix] Void Penetration (affix 0) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Penetration [tags=16] range 8%..9% => 9%
- feet: DIFFERS
### feet [items#134]: Army of Skin - unique; base: Shrine Boots (Boots)
  - unique mod: chance to gain a stack of Excoriation when Flay kills an enemy or hits a boss or rare enemy added fixed 1 (hidden)
  - unique mod: Attack Speed [tags=512] increased range 6%..13%, rollID 1 roll=1 => 13%
  - unique mod: Movement Speed increased range 13%..26%, rollID 2 roll=1 => 26%
  - unique mod: Global Conditional Damage [tags=512] [specialTag=2] more range 26%..52%, rollID 3 roll=1 => 52%
  - unique text: When Flay kills an enemy or hits a boss or rare enemy you gain a stack of Excoriation and have a 6% chance to cast Summon Skeleton if not at maximum skeletons
  - unique text: Excoriation has a maximum of 13 stacks and all stacks expire if you have not gained a new one for 13 seconds
  - unique text: Each stack of Excoriation grants Flay and Harvest 13% increased Area of Effect and +5 Melee Damage
  - unique text: Each stack of Excoriation grants an 8% chance on Flay hit to cast Rip Blood (up to 3 times per 2 seconds) | Consumes mana equal to Rip Blood's mana cost or 2 mana, whichever is higher. Flay's Deadly Plot can apply to Rip Blood cast this way.
  - implicit: Armor added range 8..8, roll=1 => 8
  - implicit: Movement Speed increased range 11%..14%, roll=1 => 14%
  - implicit: increased Cooldown Recovery Speed for Evade [Acolyte Evade] added range 16%..32%, roll=1 => 32%
- hands: DIFFERS
### hands [items#130]: Eternal Gauntlets (Gloves) - non-unique (rare/magic)
  - implicit: Armor added range 211..211, roll=1 => 211
  - implicit: Armor Mitigation also applies to Damage over Time added range 0.11..0.24, roll=1 => 0.24
  - affix [suffix] Armor Shred Chance (affix 86) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Ailment Chance [specialTag=8] range 71%..100% => 100%
  - affix [prefix] Added Mana (affix 34) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Mana range 36..50 => 50
  - affix [prefix] Increased Melee Attack Speed (affix 2) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Attack Speed [tags=512] range 12%..15% => 15%
  - affix [suffix] Hybrid Health (affix 36) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Health range 46..68 => 68 + increased Health range 5%..5% => 5%
- altar: DIFFERS
(empty)
- finger1: DIFFERS
### finger1 [items#40]: Opal Ring (Ring) - non-unique (rare/magic)
  - implicit: Increased Cooldown Recovery Speed added range 6%..10%, roll=1 => 10%
  - implicit: All Attributes added range 1..2, roll=1 => 2
  - affix [suffix] Added Health (affix 25) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Health range 61..90 => 90
  - affix [suffix] Endurance (affix 92) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Endurance range 11%..15% => 15%
  - affix [prefix] Strength (affix 501) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Strength range 7..8 => 8
  - affix [prefix] Increased Critical Strike Chance (affix 5) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Critical Strike Chance range 36%..50% => 50%
Idols:
### Idol grid cell (1,0) [array idx 1] [items#118]: Minor Weaver Idol (Minor Idol) - non-unique (rare/magic)
  - affix [prefix] Mana and Increased Mana Regen (affix 843) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Mana range 8..12 => 12 + increased Mana Regen range 2%..5% => 5% [specialAffixType 5]
  - affix [suffix] Health and Mana (affix 854) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Health range 14..18 => 18 + added Mana range 5..8 => 8 [specialAffixType 5]
### Idol grid cell (2,0) [array idx 2] [items#117]: Minor Weaver Idol (Minor Idol) - non-unique (rare/magic)
  - affix [prefix] Mana and Increased Mana Regen (affix 843) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Mana range 8..12 => 12 + increased Mana Regen range 2%..5% => 5% [specialAffixType 5]
  - affix [suffix] Health and Mana (affix 854) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Health range 14..18 => 18 + added Mana range 5..8 => 8 [specialAffixType 5]
### Idol grid cell (3,0) [array idx 3] [items#116]: Minor Weaver Idol (Minor Idol) - non-unique (rare/magic)
  - affix [prefix] Mana and Increased Mana Regen (affix 843) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Mana range 8..12 => 12 + increased Mana Regen range 2%..5% => 5% [specialAffixType 5]
  - affix [suffix] Health and Mana (affix 854) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Health range 14..18 => 18 + added Mana range 5..8 => 8 [specialAffixType 5]
### Idol grid cell (0,1) [array idx 5] [items#35]: Heretical Ornate Solar Idol (Ornate Idol) - non-unique (rare/magic)
  - affix [prefix] Idol Vitality (affix 124) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Vitality range 3..7 => 7
  - affix [suffix] Idol Sentinel Increased Melee Void Damage (affix 326) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: increased Damage [tags=528] range 33%..90% => 90%
  - affix [suffix] Increased Movement Speed and Increased Damage (affix 894) T7 (profile tier 7, tiers idx 6 of 0..6), roll=1: increased Movement Speed range 4%..5% => 5% + increased Damage range 15%..18% => 18% [specialAffixType 4]
### Idol grid cell (4,1) [array idx 9] [items#145]: Minor Weaver Idol (Minor Idol) - non-unique (rare/magic)
  - affix [prefix] Armor and Increased Armor (affix 842) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Armor range 28..40 => 40 + increased Armor range 2%..5% => 5% [specialAffixType 5]
  - affix [suffix] Health and Mana (affix 854) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Health range 14..18 => 18 + added Mana range 5..8 => 8 [specialAffixType 5]
### Idol grid cell (0,2) [array idx 10] [items#173]: Humble Weaver Idol (Humble Idol) - non-unique (rare/magic)
  - affix [suffix] Poison Resistance and Minion Poison Resistance (affix 869) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Poison Resistance range 18%..24% => 24% + added Poison Resistance [tags=8192] range 18%..24% => 24% [specialAffixType 5]
  - affix [prefix] Vitality and Added Health Regen (affix 862) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Vitality range 4..5 => 5 + added Health Regen range 2..4 => 4 [specialAffixType 5]
### Idol grid cell (3,2) [array idx 13] [items#144]: Humble Weaver Idol (Humble Idol) - non-unique (rare/magic)
  - affix [suffix] Poison Resistance and Minion Poison Resistance (affix 869) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Poison Resistance range 18%..24% => 24% + added Poison Resistance [tags=8192] range 18%..24% => 24% [specialAffixType 5]
  - affix [prefix] Vitality and Added Health Regen (affix 862) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Vitality range 4..5 => 5 + added Health Regen range 2..4 => 4 [specialAffixType 5]
### Idol grid cell (0,3) [array idx 15] [items#174]: Small Weaver Idol (Small Idol) - non-unique (rare/magic)
  - affix [suffix] Poison Resistance and Minion Poison Resistance (affix 836) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Poison Resistance range 9%..12% => 12% + added Poison Resistance [tags=8192] range 9%..12% => 12% [specialAffixType 5]
  - affix [prefix] Void Penetration and Minion Void Penetration (affix 831) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Penetration [tags=16] range 1%..2% => 2% + added Penetration [tags=8208] range 1%..2% => 2% [specialAffixType 5]
### Idol grid cell (1,3) [array idx 16] [items#133]: Heretical Adorned Rahyeh Idol (Adorned Idol) - non-unique (rare/magic)
  - affix [suffix] Chance To Shred Armor on Melee Hit (affix 211) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Ailment Chance [tags=512] [specialTag=8] range 30%..80% => 80%
  - affix [prefix] Increased Void Damage For 4 Seconds When a Skill Echoes (affix 279) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Increased void damage if Echoed recently range 30%..80% => 80%
  - affix [suffix] Increased Armor and Armor Applies to DoTs (affix 921) T7 (profile tier 7, tiers idx 6 of 0..6), roll=1: increased Armor range 7%..8% => 8% + added Armor Mitigation also applies to Damage over Time range 0.04..0.04 => 0.04 [specialAffixType 4]
### Idol grid cell (3,3) [array idx 18] [items#114]: Minor Weaver Idol (Minor Idol) - non-unique (rare/magic)
  - affix [prefix] Mana and Increased Mana Regen (affix 843) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Mana range 8..12 => 12 + increased Mana Regen range 2%..5% => 5% [specialAffixType 5]
  - affix [suffix] Health and Mana (affix 854) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Health range 14..18 => 18 + added Mana range 5..8 => 8 [specialAffixType 5]
### Idol grid cell (4,3) [array idx 19] [items#112]: Minor Weaver Idol (Minor Idol) - non-unique (rare/magic)
  - affix [prefix] Mana and Increased Mana Regen (affix 843) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Mana range 8..12 => 12 + increased Mana Regen range 2%..5% => 5% [specialAffixType 5]
  - affix [suffix] Health and Mana (affix 854) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Health range 14..18 => 18 + added Mana range 5..8 => 8 [specialAffixType 5]
### Idol grid cell (3,4) [array idx 23] [items#111]: Minor Weaver Idol (Minor Idol) - non-unique (rare/magic)
  - affix [prefix] Mana and Increased Mana Regen (affix 843) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Mana range 8..12 => 12 + increased Mana Regen range 2%..5% => 5% [specialAffixType 5]
  - affix [suffix] Health and Mana (affix 854) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Health range 14..18 => 18 + added Mana range 5..8 => 8 [specialAffixType 5]
Blessings:
- Timeline 3: Grand Emptiness of Ash (same as Endgame)
- Timeline 5: Grand Light of the Moon (same as Endgame)
- Timeline 7: Grand Resolve of Humanity (same as Endgame)
- Timeline 9: Grand Bulwark of the Tundra (same as Endgame)
- Timeline 10: Grand Body of Obsidian (same as Endgame)
Passives: 113 points; 0 node diffs:

Skills: specialized ErasingStrike,DevouringOrb,Anomaly,VoidCleave,AbyssalEchoes ; active ErasingStrike,DevouringOrb,Anomaly,VoidCleave,Rebuke; trees es6ai,do5vr,an0my,si4lgl,hh7pa3,v01cv,ab0lh
  - tree es6ai (ErasingStrike): same as Endgame
  - tree do5vr (DevouringOrb): same as Endgame
  - tree an0my (Anomaly): same as Endgame
  - tree si4lgl (SigilsOfHope Active): same as Endgame
  - tree hh7pa3 (HealingHands): same as Endgame
  - tree v01cv (VoidCleave): same as Endgame
  - tree ab0lh (AbyssalEchoes): same as Endgame

### Aspirational
- body: DIFFERS
### body [items#45]: Titan Heart - unique; base: Copper Plate (Body Armor) - CORRUPTED
  - unique mod: Armor added range 50..100, rollID 0 roll=1 => 100
  - unique mod: Health Regen more fixed -100% (hidden)
  - unique mod: Less Damage Taken while wielding a Two Handed Melee Weapon added fixed 15%
  - unique mod: Health increased range 30%..40%, rollID 1 roll=1 => 40%
  - unique mod: Damage [tags=512] increased range 30%..40%, rollID 2 roll=1 => 40%
  - unique text: You do not regenerate health | You can still regain health through methods other than health regen
  - implicit: Armor added range 114..114, roll=1 => 114
  - implicit: Lightning Resistance added range 5%..14%, roll=1 => 14%
  - extra affix [prefix] Level of Erasing Strike (affix 568) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Level of Skills [ErasingStrike] (specialTag 1) range 4..4 => 4 + increased Damage [tags=16] range 121%..150% => 150%
  - extra affix [prefix] Added Mana (affix 34) T6 (profile tier 6, tiers idx 5 of 0..7), roll=1: added Mana range 70..90 => 90
  - extra affix [suffix] Increased Health (affix 52) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Health range 10%..12% => 12%
  - corrupted [corruption] Level of All Skills and Added Mana (affix 1014) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Level of Skills range 1..1 => 1 + added Mana range 44..50 => 50 [specialAffixType 6]
- waist: DIFFERS
### waist [items#46]: Shattered Chains - unique; base: Plated Belt (Belt) - CORRUPTED
  - unique mod: Armor increased range 50%..70%, rollID 0 roll=1 => 70%
  - unique mod: Damage [tags=528] added range 5..10, rollID 1 roll=1 => 10
  - unique mod: Damage [tags=512] increased range 50%..70%, rollID 2 roll=1 => 70%
  - unique mod: Potion Use Cleanses Stun and Freeze added fixed 1 (hidden)
  - unique mod: Stun Immunity [tags=65536] added fixed 1 (hidden)
  - unique mod: More Damage Per Stack [tags=528] [specialTag=90] more fixed 5%
  - unique text: Using a Potion Cleanses Stun and Freeze
  - unique text: Stun Immunity for 4 seconds when you use a Potion
  - implicit: Armor added range 35..65, roll=1 => 65
  - implicit: Potion Slots added range 3..3, roll=1 => 3
  - extra affix [suffix] Hybrid Health (affix 36) T6 (profile tier 6, tiers idx 5 of 0..7), roll=1: added Health range 85..105 => 105 + increased Health range 6%..7% => 7%
  - extra affix [suffix] Increased Health (affix 52) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: increased Health range 21%..26% => 26%
  - extra affix [prefix] Increased Void Damage (affix 15) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Damage [tags=16] range 40%..60% => 60%
  - corrupted [corruption] Increased Mana and Mana Spent Gained as Ward (affix 1021) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: increased Mana range 14%..14% => 14% + added Mana Spent Gained as Ward range 49%..50% => 50% [specialAffixType 6]
- finger2: DIFFERS
### finger2 [items#47]: Siphon of Anguish - unique; base: Gold Ring (Ring) - CORRUPTED
  - unique mod: Damage Leeched as Health [tags=512] added range 10%..30%, rollID 0 roll=1 => 30%
  - unique mod: Damage Leeched as Health [tags=16] added range 10%..30%, rollID 1 roll=1 => 30%
  - unique mod: Ailment Chance [specialTag=90] added range 10%..30%, rollID 2 roll=1 => 30%
  - unique mod: Increased Ailment Effect [specialTag=90] added range 10%..30%, rollID 3 roll=1 => 30%
  - unique mod: Movement Speed increased range 3%..8%, rollID 4 roll=1 => 8%
  - unique mod: Increased Leech Rate added range 10%..30%, rollID 5 roll=1 => 30%
  - implicit: Elemental Resistance added range 5%..18%, roll=1 => 18%
  - extra affix [prefix] Strength (affix 501) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Strength range 14..16 => 16
  - extra affix [suffix] Added Health (affix 25) T6 (profile tier 6, tiers idx 5 of 0..7), roll=1: added Health range 100..130 => 130
  - extra affix [prefix] Increased Void Damage (affix 15) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Damage [tags=16] range 40%..60% => 60%
  - extra affix [suffix] Elemental Resistance (affix 80) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Elemental Resistance range 16%..20% => 20%
  - corrupted [corruption] Added Strength and Added Armor (affix 1018) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Strength range 7..7 => 7 + added Armor range 94..100 => 100 [specialAffixType 6]
- relic: DIFFERS
### relic [items#68]: Shattered Worlds - unique; base: Void Star (Relic) - CORRUPTED
  - unique mod: Critical Strike Chance added range 1%..5%, rollID 0 roll=1 => 5%
  - unique mod: Slow Immunity added fixed 1 (hidden)
  - unique mod: All Attributes added range 1..10, rollID 1 roll=1 => 10
  - unique mod: 120 UNRESOLVED(property) [specialTag=34] increased range 10%..100%, rollID 2 roll=1 => 100%
  - unique mod: Level of Skills added fixed 1
  - unique mod: You have Haste added fixed 1 (hidden)
  - unique text: You are immune to Slow
  - unique text: You have Haste | Effects which trigger when gaining or refreshing Haste will occur every second
  - implicit: Damage Taken more range -5%..-10%, roll=1 => -10%
  - extra affix [prefix] Added Mana (affix 34) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Mana range 91..120 => 120
  - extra affix [prefix] Strength (affix 501) T6 (profile tier 6, tiers idx 5 of 0..7), roll=1: added Strength range 11..13 => 13
  - corrupted [corruption] Frenzy and Reduced Frenzy Effect (affix 951) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added You have Frenzy range 1..1 => 1 + increased 120 UNRESOLVED(property) [specialTag=34] range -6%..-5% => -5% [specialAffixType 6]
- head: DIFFERS
### head [items#170]: Mask of Indifference - unique; base: Forest Helmet (Helmet) - CORRUPTED
  - unique mod: Blind Immunity added fixed 1 (hidden)
  - unique mod: Bleed Immunity added fixed 1 (hidden)
  - unique mod: Stun Immunity added fixed 1 (hidden)
  - unique mod: Slow and Chill Immunity added fixed 1 (hidden)
  - unique mod: Shock Immunity added fixed 1 (hidden)
  - unique mod: reduced Bonus Damage Taken from Critical Strikes added range 10%..100%, rollID 0 roll=1 => 100%
  - unique mod: Armor added range 20..200, rollID 1 roll=1 => 200
  - unique mod: Endurance Threshold added range 20..200, rollID 2 roll=1 => 200
  - unique mod: Damage Reflected added range 10%..100%, rollID 3 roll=1 => 100%
  - unique text: You are immune to Blind, Bleed, Slow, Chill, Shock, and Stun.
  - implicit: Armor added range 50..50, roll=1 => 50
  - extra affix [prefix] Added Mana (affix 34) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Mana range 91..120 => 120
  - extra affix [prefix] Vitality (affix 505) T6 (profile tier 6, tiers idx 5 of 0..7), roll=1: added Vitality range 11..13 => 13
  - extra affix [suffix] Increased Health (affix 52) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Health range 10%..12% => 12%
  - corrupted [corruption] Increased Mana and Mana Spent Gained as Ward (affix 1021) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: increased Mana range 14%..14% => 14% + added Mana Spent Gained as Ward range 49%..50% => 50% [specialAffixType 6]
- weapon: DIFFERS
### weapon [items#50]: World Splitter - unique; base: Bardiche (Two-Handed Axe) - CORRUPTED
  - unique mod: increased Area for Melee Area Skills per 1 Mana Cost added fixed 0.02
  - unique mod: Critical Strike Chance for Melee Attacks per 1 Mana Cost added range 0.2%..0.3%, rollID 0 roll=1 => 0.3%
  - unique mod: Mana Regen increased range 30%..52%, rollID 1 roll=1 => 52%
  - unique mod: Mana increased range 30%..52%, rollID 2 roll=1 => 52%
  - unique mod: Damage [tags=528] added range 30..52, rollID 3 roll=1 => 52
  - unique mod: Melee Critical Strike multiplier per 10 Max Mana added fixed 1%
  - implicit: Damage [tags=512] added range 130..130, roll=1 => 130
  - implicit: Ailment Chance [tags=512] [specialTag=2] added range 130%..190%, roll=1 => 190%
  - extra affix [prefix] Added Melee Void Damage (affix 76) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Damage [tags=528] range 51..65 => 65
  - extra affix [suffix] Void Penetration and Minion Void Penetration (affix 723) T6 (profile tier 6, tiers idx 5 of 0..7), roll=1: added Penetration [tags=16] range 15%..18% => 18% + added Penetration [tags=8208] range 15%..18% => 18%
  - extra affix [prefix] Increased Void Damage (affix 15) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Damage [tags=16] range 40%..60% => 60%
  - corrupted [corruption] Increased Melee Damage and Damage for Melee Attacks per 1 Mana Cost (affix 986) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: increased Damage [tags=512] range 130%..140% => 140% + more Damage for Melee Attacks per 1 Mana Cost (up to 20) range 0.3%..0.3% => 0.3% [specialAffixType 6]
- neck: DIFFERS
### neck [items#52]: Nihilis - unique; base: Unbound Locket (Amulet) - CORRUPTED
  - unique mod: Level of Skills added range 1..2, rollID 0 roll=1 => 2
  - unique mod: Mana Regen increased range -20%..50%, rollID 1 roll=1 => 50%
  - unique mod: Armor more range -10%..20%, rollID 2 roll=1 => 20%
  - unique mod: All Resistances added range -5%..15%, rollID 3 roll=1 => 15%
  - unique mod: Current Health and Ward lost when you use Evade added range 10%..20%, rollID 4 roll=1 => 20%
  - unique mod: Seconds of Frenzy after you use Evade added range 1.2..4, rollID 5 roll=1 => 4
  - implicit: Health increased range 1%..12%, roll=1 => 12%
  - implicit: Mana increased range 1%..12%, roll=1 => 12%
  - implicit: Movement Speed increased range -4%..8%, roll=1 => 8%
  - extra affix [prefix] Added Mana (affix 34) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Mana range 91..120 => 120
  - extra affix [prefix] Void Penetration (affix 0) T6 (profile tier 6, tiers idx 5 of 0..7), roll=1: added Penetration [tags=16] range 11%..12% => 12%
  - corrupted [corruption] Level of All Skills and Added Mana (affix 1014) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Level of Skills range 1..1 => 1 + added Mana range 44..50 => 50 [specialAffixType 6]
- feet: DIFFERS
### feet [items#131]: Army of Skin - unique; base: Shrine Boots (Boots) - CORRUPTED
  - unique mod: chance to gain a stack of Excoriation when Flay kills an enemy or hits a boss or rare enemy added fixed 1 (hidden)
  - unique mod: Attack Speed [tags=512] increased range 6%..13%, rollID 1 roll=1 => 13%
  - unique mod: Movement Speed increased range 13%..26%, rollID 2 roll=1 => 26%
  - unique mod: Global Conditional Damage [tags=512] [specialTag=2] more range 26%..52%, rollID 3 roll=1 => 52%
  - unique text: When Flay kills an enemy or hits a boss or rare enemy you gain a stack of Excoriation and have a 6% chance to cast Summon Skeleton if not at maximum skeletons
  - unique text: Excoriation has a maximum of 13 stacks and all stacks expire if you have not gained a new one for 13 seconds
  - unique text: Each stack of Excoriation grants Flay and Harvest 13% increased Area of Effect and +5 Melee Damage
  - unique text: Each stack of Excoriation grants an 8% chance on Flay hit to cast Rip Blood (up to 3 times per 2 seconds) | Consumes mana equal to Rip Blood's mana cost or 2 mana, whichever is higher. Flay's Deadly Plot can apply to Rip Blood cast this way.
  - implicit: Armor added range 8..8, roll=1 => 8
  - implicit: Movement Speed increased range 11%..14%, roll=1 => 14%
  - implicit: increased Cooldown Recovery Speed for Evade [Acolyte Evade] added range 16%..32%, roll=1 => 32%
  - extra affix [prefix] Increased Movement Speed (affix 28) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: increased Movement Speed range 26%..30% => 30%
  - extra affix [suffix] Hybrid Health (affix 36) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Health range 46..68 => 68 + increased Health range 5%..5% => 5%
  - extra affix [prefix] Vitality (affix 505) T6 (profile tier 6, tiers idx 5 of 0..7), roll=1: added Vitality range 11..13 => 13
  - corrupted [corruption] Chance to Cleanse Ailments on Evade and Increased Ailment Damage Taken (affix 991) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Chance to cleanse all ailments when you Evade [Acolyte Evade] range 100%..100% => 100% + increased Damage Taken [tags=33554432] range 1%..1% => 1% [specialAffixType 6]
- hands: DIFFERS
### hands [items#62]: Immortal Vise - unique; base: Eternal Gauntlets (Gloves) - CORRUPTED
  - unique mod: Hit Damage Taken from Bosses and Rare enemies is dealt over 4 seconds instead added range 0.25..0.3, rollID 0 roll=1 => 0.3
  - unique mod: Attack Speed [tags=512] increased range 10%..26%, rollID 1 roll=1 => 26%
  - unique mod: Damage Leeched as Health [tags=512] added range 10%..20%, rollID 2 roll=1 => 20%
  - unique mod: Health added range 60..90, rollID 3 roll=1 => 90
  - unique mod: Strength added range 6..9, rollID 4 roll=1 => 9
  - unique mod: Damage Reduction to Health below Endurance Threshold with Delayed Damage added fixed 0.3 (hidden)
  - unique text: While you have more than 10% of your maximum health as delayed damage, damage to health below your endurance threshold is reduced by 30% | Delayed damage refers to hit damage which is being dealt over 4 seconds
  - implicit: Armor added range 211..211, roll=1 => 211
  - implicit: Armor Mitigation also applies to Damage over Time added range 0.11..0.24, roll=1 => 0.24
  - extra affix [prefix] Added Mana (affix 34) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Mana range 91..120 => 120
  - extra affix [suffix] Hybrid Health (affix 36) T6 (profile tier 6, tiers idx 5 of 0..7), roll=1: added Health range 85..105 => 105 + increased Health range 6%..7% => 7%
  - corrupted [corruption] Strength (affix 501) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Strength range 14..16 => 16
- altar: DIFFERS
### altar [items#164]: Pyramidal Altar (Idol Altar) - non-unique (rare/magic) - CORRUPTED
  - implicit: Increased Cooldown Recovery Speed if there are no larger idols above smaller ones in the grid added range 0.1..0.1, roll=1 => 0.1
  - implicit: Weaver Idols equipped at Maximum added range 2..2, roll=1 => 2
  - affix [prefix] Increased Effect of Idols within Refracted Slots (affix 1089) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: increased Effect of Prefixes and Suffixes for Idols in Refracted Slots range 28%..32% => 32%
  - affix [prefix] Increased Effect of Idols within Refracted Slots (affix 1094) T6 (profile tier 6, tiers idx 5 of 0..7), roll=1: increased Effect of Suffixes for Idols in Refracted Slots range 33%..39% => 39%
  - affix [suffix] Maximum Idols Equipped (affix 1097) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Reduced Bonus Damage Taken from Critical Strikes per Equipped Heretical Idol range 0.06..0.07 => 0.07
  - affix [suffix] Maximum Idols Equipped (affix 1101) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added Mana per Idol in a Refracted Slot range 6..7 => 7
  - corrupted [corruption] Increased Effect of Idols within Refracted Slots (affix 1093) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: increased Effect of Prefixes for Idols in Refracted Slots range 40%..50% => 50%
- finger1: DIFFERS
### finger1 [items#143]: Unsated Rage - unique; base: Opal Ring (Ring)
  - unique mod: 120 UNRESOLVED(property) [specialTag=34] increased range 15%..30%, rollID 0 roll=null => ?
  - unique mod: Endurance added range 10%..20%, rollID 1 roll=null => ?
  - unique mod: Endurance Threshold added range 100..200, rollID 2 roll=null => ?
  - unique mod: Strength added range 4..8, rollID 3 roll=null => ?
  - unique mod: Vitality added range 4..8, rollID 3 roll=null => ?
  - implicit: Increased Cooldown Recovery Speed added range 6%..10%, roll=null => ?
  - implicit: All Attributes added range 1..2, roll=null => ?
  - extra affix [prefix] Strength (affix 501) T7 (profile tier 7, tiers idx 6 of 0..7), roll=1: added Strength range 14..16 => 16
  - extra affix [suffix] Added Health (affix 25) T6 (profile tier 6, tiers idx 5 of 0..7), roll=1: added Health range 100..130 => 130
  - extra affix [prefix] Increased Void Damage (affix 15) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: increased Damage [tags=16] range 40%..60% => 60%
  - extra affix [prefix] Blood Rage Marked FD (affix 1121) T5 (profile tier 5, tiers idx 4 of 0..7), roll=1: added You have Murderous Rage [Bloodrage Buff 01 Frenzy] range 1..1 => 1 [specialAffixType 7]
Idols:
### Idol grid cell (2,0) [array idx 2] [items#171]: Minor Weaver Idol (Minor Idol) - non-unique (rare/magic) - CORRUPTED
  - affix [prefix] Mana and Increased Mana Regen (affix 843) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Mana range 8..12 => 12 + increased Mana Regen range 2%..5% => 5% [specialAffixType 5]
  - affix [suffix] Cold Resistance and Minion Cold Resistance (affix 850) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Cold Resistance range 9%..12% => 12% + added Cold Resistance [tags=8192] range 9%..12% => 12% [specialAffixType 5]
  - corrupted [corruption] All Resistances for you and your Minions (affix 1070) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added All Resistances range 0.8%..0.8% => 0.8% + added All Resistances [tags=8192] range 0.8%..0.8% => 0.8% [specialAffixType 6]
### Idol grid cell (1,1) [array idx 6] [items#163]: Grand Iron Omen Idol (Grand Idol) - non-unique (rare/magic) - CORRUPTED
  - affix [prefix] Idol Vitality (affix 124) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Vitality range 3..7 => 7
  - affix [suffix] Chance To Shred Armor on Melee Hit (affix 211) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Ailment Chance [tags=512] [specialTag=8] range 30%..80% => 80%
  - corrupted [corruption] Added Spell Damage and reduced Bow Damage (affix 1039) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Damage [tags=512] range 5..10 => 10 [specialAffixType 6]
### Idol grid cell (0,2) [array idx 10] [items#167]: Heretical Ornate Solar Idol (Ornate Idol) - non-unique (rare/magic) - CORRUPTED
  - affix [prefix] Idol Vitality (affix 124) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Vitality range 3..7 => 7
  - affix [suffix] Idol Sentinel Increased Melee Void Damage (affix 326) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: increased Damage [tags=528] range 33%..90% => 90%
  - affix [suffix] Increased Movement Speed and Increased Damage (affix 894) T7 (profile tier 7, tiers idx 6 of 0..6), roll=1: increased Movement Speed range 4%..5% => 5% + increased Damage range 15%..18% => 18% [specialAffixType 4]
  - corrupted [corruption] Added Spell Damage and reduced Bow Damage (affix 1039) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Damage [tags=512] range 5..10 => 10 [specialAffixType 6]
### Idol grid cell (4,2) [array idx 14] [items#169]: Heretical Large Rahyeh Idol (Large Idol) - non-unique (rare/magic) - CORRUPTED
  - affix [suffix] Chance To Shred Armor on Melee Hit (affix 211) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Ailment Chance [tags=512] [specialTag=8] range 30%..80% => 80%
  - affix [prefix] Chance To Gain Inspiration On Kills With Void Skills (affix 281) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Chance to gain Inspiration when you kill an enemy with a void skill range 12%..35% => 35%
  - affix [suffix] Increased Echo damage and Chance to gain frenzy for 3 seconds on echo (affix 920) T7 (profile tier 7, tiers idx 6 of 0..6), roll=1: added increased Echo Damage when a skill is Echoed range 16%..20% => 20% + added chance to gain Frenzy for 3 seconds when you Echo an ability range 5%..5% => 5% [specialAffixType 4]
  - corrupted [corruption] Increased Critical Strike chance and Reduced Critical Strike Multiplier (affix 1053) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: increased Armor range 2%..5% => 5% [specialAffixType 6]
### Idol grid cell (0,3) [array idx 15] [items#166]: Heretical Ornate Solar Idol (Ornate Idol) - non-unique (rare/magic) - CORRUPTED
  - affix [prefix] Idol Vitality (affix 124) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Vitality range 3..7 => 7
  - affix [suffix] Idol Sentinel Increased Melee Void Damage (affix 326) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: increased Damage [tags=528] range 33%..90% => 90%
  - affix [suffix] Increased Movement Speed and Increased Damage (affix 894) T7 (profile tier 7, tiers idx 6 of 0..6), roll=1: increased Movement Speed range 4%..5% => 5% + increased Damage range 15%..18% => 18% [specialAffixType 4]
  - corrupted [corruption] Added Spell Damage and reduced Bow Damage (affix 1039) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Damage [tags=512] range 5..10 => 10 [specialAffixType 6]
### Idol grid cell (0,4) [array idx 20] [items#165]: Heretical Ornate Solar Idol (Ornate Idol) - non-unique (rare/magic) - CORRUPTED
  - affix [prefix] Idol Vitality (affix 124) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Vitality range 3..7 => 7
  - affix [suffix] Idol Sentinel Increased Melee Void Damage (affix 326) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: increased Damage [tags=528] range 33%..90% => 90%
  - affix [suffix] Increased Movement Speed and Increased Damage (affix 894) T7 (profile tier 7, tiers idx 6 of 0..6), roll=1: increased Movement Speed range 4%..5% => 5% + increased Damage range 15%..18% => 18% [specialAffixType 4]
  - corrupted [corruption] Added Spell Damage and reduced Bow Damage (affix 1039) T1 (profile tier 1, tiers idx 0 of 0..0), roll=1: added Damage [tags=512] range 5..10 => 10 [specialAffixType 6]
Blessings:
- Timeline 3: Grand Emptiness of Ash (same as Endgame)
- Timeline 5: Grand Light of the Moon (same as Endgame)
- Timeline 7: Grand Resolve of Humanity (same as Endgame)
- Timeline 9: Grand Bulwark of the Tundra (same as Endgame)
- Timeline 10: Grand Embers of Immortality (DIFFERS)
Passives: 113 points; 0 node diffs:

Skills: specialized ErasingStrike,DevouringOrb,Anomaly,VoidCleave,AbyssalEchoes ; active ErasingStrike,DevouringOrb,Anomaly,VoidCleave,Rebuke; trees es6ai,do5vr,an0my,si4lgl,hh7pa3,v01cv,ab0lh
  - tree es6ai (ErasingStrike): Implements of Destruction E1/A4
  - tree do5vr (DevouringOrb): Abyssal Emission E0/A1; The Rending Maw E0/A4; Dust Channeller E2/A0
  - tree an0my (Anomaly): Decimation E4/A5; Manipulation E1/A2; Swiftrest E0/A1
  - tree si4lgl (SigilsOfHope Active): same as Endgame
  - tree hh7pa3 (HealingHands): same as Endgame
  - tree v01cv (VoidCleave): Fraying Strikes E2/A4; Armor Sunderer E4/A5
  - tree ab0lh (AbyssalEchoes): Tides of Rust E0/A3

## 7. Could not decode / caveats
- Item note text: items carry no note field in the profile (fields seen: itemType, subType, uniqueID, uniqueRolls, affixes, implicits, corruptedAffixes, corrupted, sealedAffix). Free-text guide notes live in globalNotes/widgetNotes (rich text), not per item; not decoded here.
- Legendary potential slams: profile does not mark them; extra affixes on unique items are listed as "extra affix" without LP/WW distinction.
- Property display names for tagged/specialTag stats are given with raw tags/specialTag; no localized sentence is generated. Percent formatting is inferred from modifierType / displayAddedAsPercentage.
# Glossary
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Labels: **A** asset data (vendored), **G** in-game guide, **X** Maxroll/community 2026, **U** unverified/stale.

## Summary
- Alphabetical one-line definitions of game terms: ailments, defense layers, item rarities, stat terms (added / increased / more / quotient), skill tags, endgame terms and crafting terms.
- Each entry carries the label of its main source; combined labels (G+A) mean both agree. `[SP n]` links a term to stat property id n in `sp_enum.json` (the `SP` enum used by every affix, node and implicit).
- Numbers here are rules of thumb copied from the in-game guide (G) or asset data (A); detailed formulas live in `../mechanics/*.md` (damage-pipeline, defenses, ailments, ward-health-sustain, speed-cooldowns-mana, minions, enemies-and-corruption, stat-model).
- The two appendices list every `AilmentID` (151 values) and every `SP` id (134 values) for lookup.

## Terms


### A

- **Aberroth** (X): Pinnacle boss; needs all 10 Harbingers slain and a Harbinger Eye at the Altar of Oblivion (Shattered Road).
- **Acid Skin** (G): Curse: 50 poison damage over time, +25% chance to be critically hit, lasts 5 s, does not stack.
- **Added** (G): Modifier category summed first; flat amounts multiplied by skill added damage effectiveness before increased/more.
- **Added damage effectiveness (ADE)** (G): Skill multiplier on added-damage stats (Elemental Nova 100%, Meteor 900%); does not affect base damage. In asset data field addedDamageScaling.
- **Affix** (G): Modifier on equipment besides implicits; prefix or suffix; up to 2 prefixes + 2 suffixes (4); tiers 1-7 (+8 primordial).
- **Affix effect modifier (AEM)** (A): Per-base-type scaling of affix values; item value = base roll range x (1+itemAEM)/(1+standardAffixEffectModifier).
- **Affix shard** (G): Material for adding or upgrading an affix by one tier; obtained from drops, Rune of Shattering/Removal.
- **Ailment** (G): Effect on a target that lasts a duration; most deal damage, apply debuffs or both and most stack. Applied by a hit or by area effects at fixed intervals. Ailment damage is not melee/hit damage even when applied by a melee hit.
- **Ailment chance** (G): Chance to apply an ailment; above 100% applies multiple stacks (235% ignite = 2 stacks + 35% chance for a third). [SP 1]
- **Ailment duration** (G): Increased duration raises total ailment damage but not DPS (100% increased bleed duration = 6 s instead of 3 s). [SP 42]
- **Ailment effectiveness** (G): Increases every stat modifier an ailment grants (50% increased armor shred effectiveness: 150 armor instead of 100). [SP 43]
- **Altar to the Weaver** (G): Object at the end of Cemeteries of the Erased for placing Woven Echoes on the Echo Web.
- **Anger (Morditas)** (X): Meta stat from Rage of Morditas kills raising difficulty and rewards of the three Morditas Woven Echoes; can be soothed in the Nexus.
- **Anguish** (G): Curse: enemies deal 15% less damage over time; enemies killed while cursed cause 40 necrotic damage to other Anguish-cursed enemies; no stacking.
- **Arena** (G): Endgame mode at Champion's Gate: Arena Champions (40 waves per guide; 50 per Maxroll) and Endless Arena.
- **Armor** (G): Mitigates damage from hits (not DoT); mitigation falls with area level; capped at 85%; 70% as effective vs non-physical hits. [SP 10]
- **Armor shred** (G): Ailment: subtracts 100 armor from the target, 4 s. [SP 77]
- **AT (ability tag) mask** (A): Bitmask enum used by skills and stats (Physical 1, Lightning 2, Cold 4, Fire 8, Void 16, Necrotic 32, Poison 64, Elemental 128, Spell 256, Melee 512, Throwing 1024, Bow 2048, DoT 4096, Minion 8192, Totem 16384 ...).
- **Attack speed** (A): Stat scaling attack skills; base value 1 (hidden base mod). [SP 2]
- **Attunement** (G): Attribute: 2 mana per point; scales Attunement skills. [SP 23]

### B

- **Base damage** (G): Damage a skill deals with no stats; modified only by the skill tree; melee skills typically 2.
- **Bazaar** (G): Merchant's Guild auction house; asynchronous gold + Favor trades.
- **Bleed** (G): Physical damage over time ailment; unlimited stacks; 53 damage over 3 s per stack by default.
- **Blessing** (G): Permanent character bonus from Timeline bosses (3 offered); Empowered ones roll higher; 224 blessing subtypes in data.
- **Blind** (G+A): Ailment: blinded enemies cannot deal critical strikes (A: CriticalChance MORE -1).
- **Block chance** (G): Chance to block a hit (including spells, not DoT); a block counts as being hit. [SP 29]
- **Block effectiveness** (G): Determines the share of damage mitigated by a successful block (level-dependent, max 85%). [SP 53]
- **Blood Forging Potential** (G): Special FP from Bloody Rituals; raises critical-success chance (0.3 extra in data).
- **Bloodrage charge** (X): Rage of Morditas currency (5 max, from 20/50/90/140/200 kills) spent on claim or ritual.
- **Bone Curse** (G): Acolyte curse skill: debuffed enemies take physical damage when hit; tripled if you inflicted the hit; 8 s; does not stack.
- **Boss ward** (G): Boss system: health-bar notches that grant the boss ward when consumed and stun it briefly; boss ward decay speeds up over time.
- **Buff (tag)** (A): Skill tag Buff (131072).

### C

- **Capped resistance** (G): Resistance is capped at 75%; negative resistance raises damage taken 1% per 1%. [SP 30]
- **Cast speed** (A): Stat scaling spells; base value 1 (hidden base mod). [SP 3]
- **Champion** (G): Rare enemy subset with exclusive modifiers; always drops an item with a sealed Champion affix.
- **Channelling** (A): Skill tag (262144): skill is channelled and charged per second (channelCost). [SP 25]
- **Chill** (G): Ailment: each stack reduces attack, cast and movement speed by 12% (multiplicative), max 3 stacks, 4 s; 50% less effect on bosses and players.
- **Chronomancer (respec NPCs)** (X): Chronomancer Lerinne (End of Time / Council Chambers) respecs passive points or mastery for gold; Chronomancer Nyx (End of Time) respecs Blessings.
- **Circle of Fortune (CoF)** (G): Item Faction boosting drops and giving Prophecies; items found are untradable.
- **Common (normal) item** (G): Rarity with no affixes.
- **Companion** (G): Minion type (mostly Primalist); downed instead of dying and revived by proximity; default 2 active.
- **Cooldown recovery speed** (A): Increases charge regeneration of skills with cooldowns. [SP 70]
- **Corrupted item** (G): Item changed unpredictably by Rune of Corruption (or dropped corrupted); cannot be crafted further; loses FP/LP/WW.
- **Corruption (Monolith)** (G): Per-timeline difficulty/reward stat raised by killing the Shade of Orobyss; normal 0-50, empowered 100+ uncapped.
- **Crit avoidance** (G): Chance for an incoming critical strike to become a normal hit (rolled after attacker crit chance). [SP 89]
- **Critical strike chance** (G): Hits crit at a base 5%; added chance is additive (+1% = 6%), increased chance scales the total (1% increased = 5.05%); DoT cannot crit. [SP 4]
- **Critical strike multiplier** (G): Default 200% damage on a crit; multiplicative with other modifiers. [SP 5]
- **Critical success (crafting)** (G): Chance on shard use: craft is free (no FP, no materials) and upgrades another random affix below T5.
- **Curse** (G): Special ailment with its own scaling tag; usually does not stack with itself.

### D

- **Damage conversion** (G): Changes a skill base damage type; keeps tag-less added damage typed accordingly; does not change ailments.
- **Damage over time (DoT)** (G): Damage dealt repeatedly over time; cannot crit; not mitigated by armor, dodge, block, glancing blow; only by resistances and endurance.
- **Damage taken from mana before health** (G): Share of damage dealt to mana instead of health; 1 mana shields 5 health; no effect at 0 or negative mana; does not protect ward. [SP 24]
- **Damned** (G): Necrotic damage over time ailment (35 per 2.5 s) that also gives 20% reduced health regeneration per stack; unlimited stacks.
- **Deadly Strike** (X): Super critical hit enabled by specific uniques/buffs (e.g. Incisive Rage: crits have 20% chance to be Deadly Strikes).
- **Decrepify** (G): Curse: target takes 15% more damage over time, takes physical DoT based on your missing health, 10 s.
- **Dexterity** (G): Attribute: 4 dodge rating per point; scales Dexterity skills. [SP 22]
- **Dodge rating** (G): Gives dodge chance (max 85%), lower at higher area level; dodge rating = 10 x area level is about 50%; no effect vs DoT; a dodge is not being hit. [SP 11]
- **Dungeon key** (G): Required to enter a dungeon (4 tiers per dungeon); extra keys buy retries after death.

### E

- **Echo** (G): A zone in a Timeline with a layout, enemy modifier and guaranteed reward.
- **Echo chain** (G): Linked echoes sharing a mechanic (High Stability, Nemesis, Rift Beast, Omen Window, Pinnacle of Chaos).
- **Echo web** (G): Procedural graph of echoes in a Timeline; reset when the Shade of Orobyss is slain.
- **Effect of ailment on you** (A): Scales the effect of ailments applied to you. [SP 120]
- **Electrify** (G): Lightning damage over time ailment; 44 damage over 2.5 s per stack; unlimited stacks.
- **Elemental (tag)** (A): Subset rule: Elemental stats match Fire, Cold and Lightning.
- **Empowered Timeline** (G): Harder version of a Timeline: level 100, starts at 100 Corruption, no cap.
- **Endurance** (G): Damage reduction while health is below Endurance Threshold; capped at 60% less damage taken; applies to hits and DoT but not to ward; base 20%. [SP 75]
- **Endurance threshold** (G): Health value below which Endurance applies; uncapped; base 20% of max health. [SP 76]
- **Eternity Cache** (G): Temporal Sanctum structure combining a unique with LP and an exalted into a legendary.
- **Evade** (G): Movement ability on Space; 2 charges; 4 s cooldown reduced by 0.5% cooldown recovery speed per character level (2.7 s at level 100).
- **Exalted item** (G): Magic/rare item with at least one tier 6 or 7 affix; not a separate rarity byte in data.
- **Exiled Mage** (G): Imprisoned mage encounter dropping an item with an experimental affix.
- **Experimental item** (G): Boots/gloves/belt with a special experimental affix from Exiled Mages or the Thaumaturgy Device.
- **Exposed Flesh** (G+A): Curse: -15% cold resistance, -15 armor per point of inflicter Dexterity, +30% chance to be frozen (AilmentID 137).

### F

- **Favor** (G): Faction currency from kills/quests, based on experience gained.
- **Forge** (G): Crafting window (key F), usable anywhere.
- **Forging Potential (FP)** (G): Resource consumed by crafting; at 0 the item cannot be crafted further; stored clamped to 63 in saves.
- **Forgotten Knights** (G): Endgame faction tracking Harbinger hunts and the path to Aberroth.
- **Frailty** (G): Ailment: affected target deals 6% less damage (multiplicative), 4 s, max 3 stacks.
- **Freeze** (G): Frozen units cannot move or use skills; base duration 1.2 s; needs a freeze rate on the skill; harder on bosses (max health counts 50% higher).
- **Freeze rate** (G): Skill property giving freeze chance = freeze rate x multiplier / target max health (bosses x1.5 health). [SP 67]
- **Frenzy** (A): Buff ailment (id 34): +20% increased attack speed and cast speed.
- **Frostbite** (G): Cold DoT ailment (50 per 3 s); each stack adds 20% chance to be frozen, only the first 15 stacks (300%) count; the bonus multiplies a hit freeze chance.

### G

- **Gaze of Orobyss** (G): Stacks from Empowered Timeline bosses; each adds 12 Corruption on Shade kill (up to 4 consumed).
- **Glancing blow** (G): Chance to take a glancing blow when hit: 35% less hit damage; counts as being hit; no DoT protection; over 100% no extra effect. [SP 62]
- **Glyph** (G): Support crafting item used with runes/shards (Hope, Chaos, Order, Despair, Envy).
- **Glyph of Chaos** (G): Changes the upgraded affix to a different affix of the same prefix/suffix type.
- **Glyph of Despair** (G): Chance to seal an affix instead of upgrading it; freed slot opens for a new affix.
- **Glyph of Envy** (G): Changes item subtype (same class requirement) when adding/upgrading an affix.
- **Glyph of Hope** (G): 25% chance for a craft to cost no Forging Potential.
- **Glyph of Order** (G): Keeps the roll position within range when an affix is upgraded.

### H

- **Harbinger** (G): Powerful servants of Orobyss encountered deep in the Monolith; 10 exist per Maxroll.
- **Haste** (A): Buff ailment (id 33) granting increased speed; amount scales with "effect of Haste" stats. [SP 50]
- **Health** (A): Max health = base 100 + 10 per level plus added/increased/more modifiers (classes.json). [SP 7]
- **Health leech** (G): Recovers a percentage of final damage dealt (hit and DoT) as health over 3 s per instance; overkill is ignored. [SP 51]
- **Health regeneration** (A): Base 6 + 0.14 per level (classes.json). [SP 17]
- **Heretical idol** (A): Idol subtype family (Heretical Grand/Large/Ornate/Huge/Adorned) limited by altar property HereticalIdolLimit.
- **High health** (G): At least 65% of max health remaining.
- **Hit** (G): Any damage that is not damage over time; can be dodged, blocked, glanced, crit.

### I

- **Ice Forging Potential** (G): Special FP from Frozen Rituals; chance (0.3 in data) to be preserved when consumed.
- **Idol** (G): Grid-placed equipment (sizes 1x1 to 4x1/1x4/2x2) with 1 prefix + 1 suffix; no crafting.
- **Idol altar** (G): Equippable above the idol grid; reshapes the grid, adds refracted slots; found in Omen Windows.
- **Ignite** (G): Fire damage over time ailment; 40 damage over 2.5 s per stack; unlimited stacks.
- **Implicit** (G): Inherent stats of a subtype; values roll within a range; global like affixes.
- **Imprint** (X): Weaver tree mechanic placing an item/Woven Echo in a slot to bias future drops.
- **Increased** (G): Modifier category: all sources summed (+1), then multiplied with the added total.
- **Increased drop rate** (A): Drop-rate stat for specific item types (Blessings); SP 104. [SP 104]
- **Increased experience** (A): Experience gain stat. [SP 105]
- **Increased item rarity** (G): Raises affix count of drops (rarer rare/exalted) and unique/set chance; from Corruption and echo modifiers.
- **Increased stun chance** (A): Raises stun chance; players have a hidden +100% for Melee and Bow tags. [SP 45]
- **Intelligence** (G): Attribute: 2% ward retention per point; scales Intelligence skills. [SP 21]
- **Item faction** (G): Circle of Fortune or Merchant's Guild; chosen in Chapter 9; one at a time.

### K

- **Knowledge of Orobyss** (X): Progress counter (5 needed) unlocking the three level-90 Timelines.

### L

- **Legendary item** (G): Unique combined with exalted affixes (Legendary Potential) or leveled via Weaver's Will.
- **Legendary Potential (LP)** (G): 0-4; number of exalted-item affixes a unique can take in the Eternity Cache; corrupted items cannot become legendary.
- **Lens** (X): Circle of Fortune item slotted into a Prophecy slot to change its charging or rewards.
- **Less** (G): Negative MORE modifier applied multiplicatively.
- **Level of skills** (G): +levels to skills from affixes/uniques/sets; can exceed natural max level 20. [SP 88]
- **Loot Lizard** (G): Fleeing item carriers; escape at 0 health or after 20 s undamaged.
- **Lost Cache** (X): Container in echoes opening for loot; interacts with Sealed Riches imprint.
- **Low health** (G): At most 35% of max health remaining.

### M

- **Magic item** (G): Rarity with 1-2 affixes.
- **Mana** (G+A): Skill resource; usable while above 0 even if the cost exceeds it (can go negative; 1 mana cost skills are blocked at negative mana). Base 50 + 0.50506 per level; base regen 8, not level-scaled. [SP 8]
- **Mana cost** (A): Mana cost modifier on skills. [SP 66]
- **Mana efficiency** (A): Increases mana efficiency of skills (reduces effective cost). [SP 69]
- **Marked for Death** (G): Curse: reduces all resistances by 25, 8 s, does not stack.
- **Mastery** (A): One of three specializations per class (mastery index 1-3; index 0 = base class); chosen via the mastery quest.
- **Maximum companions** (G): Companion limit (default 2). [SP 61]
- **Memory Amber** (G): Woven faction currency to buy Woven Echoes or respec the Weaver tree.
- **Merchant's Guild (MG)** (G): Item Faction enabling trading via the Bazaar.
- **Minimum skill level** (G): Floor level newly specialized skills are set to; guide lists increases at levels 8, 12, 17, 24, 32, 40, 50, 60, 70.
- **Minion** (G): Ally summoned by skills/items/passives; only stats that name minions (or the skill tree) apply to them. Level scaling from character level 26: classes.json (A) gives +0.8% more damage and 0.8% less damage taken per level; the guide text (G) says 0.6% more damage / 0.8% reduction (45% / 60% at level 100) - A and G disagree on the damage figure.
- **Monolith of Fate** (G): Main endgame system: ten Timelines of echoes, bosses, Corruption and Blessings.
- **More** (G): Modifier category: each source multiplied separately after increased.
- **Movement speed** (A): Movement speed stat; base MORE 5% (hidden base mod), minions 10%. [SP 9]

### N

- **Nemesis** (G): Random encounter offering four items; options Banish / Challenge / Empower (up to twice).
- **Nexus** (G): UI hub for activities, timelines, dungeons and factions (S5).

### O

- **Omen idol** (X): 1x3/3x1 idol from Omens with class-idol-tier affixes; one equippable unless altar raises limit.
- **Omen Window** (G): Horde encounter ending in an Omen boss; drops Timeglass Fragments, Rune of Corruption, corrupted items, Idol Altars and Omen Idols.

### P

- **Parry** (G): Chance to negate all damage of a hit; capped at 75%; still counts as being hit; no DoT protection. [SP 121]
- **Passive point** (X): One per level from 3 plus up to 15 quest rewards; maximum 113.
- **Penance** (G): Curse: deals 20 fire damage to the target when hit, 15 s; +5% more damage per 1% damage reflected.
- **Penetration** (G): Subtracts from target resistance after the 75% cap; enemies gain 1% penetration per area level up to 75% (area level 75+). [SP 59]
- **Pinnacle boss** (X): Top endgame bosses: Aberroth, Uber Aberroth, Pinnacle Morditas.
- **Plague** (G): Poison DoT ailment (150 over 4 s), does not stack, spreads to targets within 6 m every 0.6 s and on death.
- **Poison** (G): Poison DoT ailment (28 per 3 s per stack); first 30 stacks each subtract 5% poison resistance (2% vs bosses/players).
- **Potion** (G): Healing consumable dropped by enemies/bosses; capacity set by belt. [SP 48]
- **Prefix** (G): Affix type (up to 2); generally offense, utility or class-specific.
- **Primordial item** (G+X): Only one may be equipped; Primordial exalted has a tier 8 sealed affix (50-100% stronger than T7); 25 Primordial uniques exist.
- **Prophecy** (G): Circle of Fortune target-farm slot (4 slots in S5); consumes charges to drop chosen rewards when a trigger objective completes.

### Q

- **Quest echo** (G): Story echo required (in normal timelines) to reach the Timeline boss; final one is the boss.
- **Quotient** (A): Fourth ModType (3) in asset data; modifier combined as a ratio.

### R

- **Rage of Morditas** (G): Season 5 timed hunt encounter started at a Blood Crystal; two phases then a Blood-Filled Crystal reward panel.
- **Rare item** (G): Rarity with 3-4 affixes.
- **Recently** (G): A duration of 4 seconds.
- **Reduced bonus damage taken from crits** (G): Reduces the extra damage of critical hits received; cannot exceed 100% (crit becomes a regular hit). [SP 114]
- **Reforged set item** (G): Normal/magic/rare/exalted item crafted with a set affix shard; counts for set bonuses.
- **Refracted slot** (G): Special idol-grid cell from an altar that boosts idols placed inside depending on altar affixes.
- **Resistance** (G): Reduces damage of one type taken (hits and DoT); cap 75%; types: Physical, Fire, Cold, Lightning, Necrotic, Poison, Void. [SP 30]
- **Resistance shred** (G): Per-damage-type ailment: -5% resistance (2% vs players and bosses), 4 s, 10 stacks; can push effective resistance negative. [SP 78]
- **Resonance** (G): Item allowing gifting of items to a specific player (Golden: normal..unique; Obsidian: exalted and legendary).
- **Rift Beast** (G): Ancient boss-type enemy in Primal Hunts; its body parts buy Primordial items.
- **Rune** (G): Modifier crafting item with an item-wide effect (Shattering, Refinement, Removal, Discovery, Shaping, Ascendance, Creation, Havoc, Redemption, Weaving, Evolution, Corruption).
- **Rune of Corruption** (G): Corrupts an item unpredictably; removes FP, LP, WW and Weaver's Touch.
- **Rune of Evolution** (G): Upgrades a random T7 affix to T8 and seals it in a second sealed slot (FP cost max 15 as of S5).
- **Rune of Havoc** (G): Shuffles tiers of the four non-sealed affixes on an exalted item.
- **Rune of Redemption** (G): Changes exalted affixes to different affixes keeping tier and roll.
- **Rune of Weaving** (G): Spends random Weaver's Will/Touch on the item immediately.

### S

- **Sealed affix** (G): Affix moved to its own slot by Glyph of Despair; cannot be modified; only one regular sealed affix per item (separate primordial and corruption seals exist).
- **Season / Legacy** (G): Seasons reset competitive ladders; characters move to Legacy at season end.
- **Set item** (G): Unique-like item (2-4 pieces) granting bonuses with other pieces; cannot become legendary.
- **Shade of Orobyss** (G): Echo boss that adds Corruption and resets the Echo Web.
- **Shadow (Rogue)** (X): Rogue mechanic: a copy of the Rogue that mimics the next skill used.
- **Shock** (G): Ailment: -5% lightning resistance and +20% chance to be stunned per stack, 10 stacks, 4 s; 60% less effective vs bosses/players.
- **Skill specialization** (G): Up to 5 specialization slots (unlock at character levels 4, 8, 20, 35, 50); a specialized skill levels (max 20) and spends skill points in its tree.
- **Slow** (G): Ailment: -20% movement speed per stack (multiplicative), 3 stacks, 4 s; 50% less effect vs bosses/players.
- **Smart loot** (X): Drops for class-specific slots bias toward the player class (not uniques/sets).
- **Solo Account Found (SAF) / Solo Character Found (SCF)** (G): Self-found challenge modes.
- **Soul Gambler** (X): Soulfire Bastion vendor trading Souls for items.
- **Spell (tag)** (A): Skill tag Spell (256); scales with cast speed unless the skill uses attack speed.
- **Spirit Plague** (G): Acolyte curse skill: 90 necrotic DoT, spreads on death, 3 s, does not stack.
- **Stability (timeline)** (G): Gained by completing echoes; required to unlock quest echoes.
- **Strength** (G): Attribute: 4% increased armor per point; scales Strength skills. [SP 19]
- **Stun** (G): Stunned units cannot move or use skills; base duration 0.4 s; chance from hit damage vs target max health and stun avoidance. [SP 45]
- **Stun avoidance** (G+A): Makes stuns harder; base 250 + 5 per character level; every 100 raises the stun threshold by 1% of max health. [SP 12]
- **Subtype** (A): Concrete base item within a base type (e.g. Hide Boots); fixes implicits and level requirement.
- **Suffix** (G): Affix type (up to 2); generally defensive.

### T

- **Temporal Sanctum** (G): Dungeon with Temporal Shift and the Eternity Cache for creating legendaries.
- **The Woven** (G): Endgame faction (Weaver); ranks give Weaver tree points and Woven Echoes; Memory Amber is its currency.
- **Thorns / reflect** (A): Damage reflected to attackers. [SP 86]
- **Throwing** (A): Skill tag Throwing (1024); throws use attack speed without weapon speed multiplier.
- **Tier** (G): Affix power level; crafting reaches T5, T6/T7 only from drops, T8 via Rune of Evolution.
- **Time Rot** (G): Void DoT ailment (60 per 3 s) that also adds 5% stun duration per stack; max 12 stacks.
- **Timeglass Fragment** (G): Currency from Omens; spent with the Oracle (Apophis) or to create echo chains.
- **Timeline** (G): An alternate-reality island in the Monolith with its own level, echoes, quests, boss and blessings.
- **Torment** (G): Curse: 120 necrotic DoT, -18% movement speed, 3 s, does not stack.
- **Totem** (G): Immobile minion with fixed duration (Primalist).
- **Transform (tag)** (A): Skill tag Transform (524288): shapeshift forms.
- **Traversal / movement skill** (A): Skills flagged traversalSkill/countsAsMovementAbility in asset data; do not share cooldown with Evade.

### U

- **Unique item** (G): Fixed-mod item with special effects; not craftable; may carry LP or Weaver's Will.

### V

- **Variant unique** (X): Unique that drops with extra random affixes from an item-specific pool (Withstand the Elements, Unsated Rage).
- **Vaults of Uncertain Fate** (X): Lightless Arbor reward: spend gold on modifiers that improve vault rewards.
- **Vitality** (G): Attribute: 6 health and 1% poison and necrotic resistance per point. [SP 20]

### W

- **Ward** (G): Shield above health generated by effects, with no maximum, decaying toward 0 (or the decay threshold); decay is faster with more ward; retention slows it. [SP 39]
- **Ward decay threshold** (G): Ward does not decay below this value; ward decay rate at 2x threshold is halved (guide example). [SP 119]
- **Ward per second** (A): Ward regeneration stat. [SP 92]
- **Ward retention** (G): Slows ward decay; Intelligence grants 2% per point. [SP 16]
- **Weaver idol** (X): Stronger non-class idols from Tombs/Cemeteries; cannot be enchanted.
- **Weaver tree** (G): Endgame passive tree influencing Monolith echoes; points from Woven faction rank and Woven Echoes (53 total per Maxroll).
- **Weaver's Touch** (X): Weaver's Will analogue on enchanted idols; upgrades the enchant affix on kills.
- **Weaver's Will (WW)** (G): Unique stat (5-28) = total affix tiers a unique gains by killing enemies while worn; 28 = four T7 affixes.
- **Withering** (G): Curse: target takes 10% increased curse damage per stack, 3 s, up to 10 stacks; 60% less effect vs players/bosses.
- **Woven Echo** (G): Special echo woven into the Echo Web via the Altar to the Weaver; many unlock Weaver tree points or crafting.

<sub>Generated by `gen_glossary.cjs` (table `glossary`) from hand-written entries (labels per entry); [SP id] from sp_enum.json; 212 rows.</sub>

## Appendix: AilmentID enum (A)

Ids used by `ailments.json`, `specialTag` of ailment stats and `NodeTooltipStat.property` >= 10000 (id + 10000). `UNUSED` ids are placeholders. Mechanics per ailment are in `../mechanics/ailments.md`.

0 None, 1 Ignite, 2 Bleed, 3 Chill, 4 Possess, 5 Shock, 6 Slow, 7 Poison, 8 ArmourShred, 9 TimeRot, 10 FutureAttack, 11 Laceration, 12 AbyssalDecay, 13 StackingAbyssalDecay, 14 Blind, 15 SerpentVenom, 16 Frailty, 17 MarkedForDeath, 18 Plague, 19 Ravage, 20 Root, 21 Fear, 22 DamageBoost, 23 Frostbite, 24 SpreadingFlames, 25 FireballStackForExplosion, 26 VoidEssence, 27 HolyAuraStackForFlamBurst, 28 PoisonResShred, 29 NecroticResShred, 30 VoidResShred, 31 Stagger, 32 DivineEssence, 33 Haste, 34 Frenzy, 35 Swiftness, 36 PoisonStackForExplosion, 37 AvalancheStackForFissure, 38 TempestsMight, 39 Damned, 40 Pestilence, 41 DisintegrateStackForExplosion, 42 FireResShred, 43 MeleeDefShred, 44 Stalwart, 45 Inspiration, 46 DummyHealingWhileNotTakingDamage, 47 Deadly, 48 AspectOfTheBoarVisuals, 49 AspectOfTheSharkVisuals, 50 StackingAspectOfTheSharkVisuals, 51 AspectOfTheViperVisuals, 52 AspectOfTheLynxVisuals, 53 ArcaneMark, 54 Immobilized, 55 SparkCharge, 56 CriticalEffluence, 57 ArcaneAscendance, 58 BoneCurse, 59 SpiritPlague, 60 ShrineHaste, 61 Contempt, 62 ShrineReflect, 63 ShrineStun, 64 ShrineCrit, 65 ShrineManatee, 66 Shapeshifter, 67 Ferocity, 68 DoomBrand, 69 NecroticBoneCurse, 70 Apocalypse, 71 Flurry1Tag, 72 Flurry2Tag, 73 PhysicalResShred, 74 ColdResShred, 75 LightningResShred, 76 Enrage, 77 LightningInfusion, 78 EfficaciousToxin, 79 ShadowDaggers, 80 MirageForm, 81 SilverShroud, 82 DuskShroud, 83 CrimsonShroud, 84 SmokeBlades, 85 CriticalVulnerability, 86 Sharpshooter, 87 ShrineExperienceBuff, 88 AspectOfTheCrow, 89 AncientFlight, 90 Doom, 91 MoltenInfusion, 92 StoneStare, 93 Electrify, 94 TotemArmor, 95 SciurineRage, 96 Darkness, 97 CorruptedHeraldry, 98 MimicFeast, 99 VoidBarrierVisuals, 100 Immunity, 101 SnakeInfection, 102 AmbushBuff, 103 AspectOfTheSpider, 104 TempestPaws, 105 BrandOfTrespass, 106 BrandOfSubjugation, 107 BrandOfDeception, 108 RunewordCataclysm, 109 RunewordHurricane, 110 RunewordAvalanche, 111 RunewordInferno, 112 UNUSED, 113 Decrepify, 114 SpiritKindling, 115 Withering, 116 Revolution, 117 Penance, 118 Torment, 119 UNUSED2, 120 AcidSkin, 121 Anguish, 122 Witchfire, 123 Chained, 124 TheGate, 125 FalconMark, 126 Netted, 127 TalonBlades, 128 HealingHandsHealOverTime, 129 AterrothFrailty, 130 AterrothShock, 131 AterrothChill, 132 AterrothCurse, 133 AterrothTimeRot, 134 SilkAilment, 135 ChosenErasedAilment, 136 Spiders, 137 ExposedFlesh, 138 BerserkTrigger, 139 StoneAegis, 140 Fireclaws, 141 FlamingHeraldry, 142 Hemorrhage, 143 AllResReduction, 144 ScathingLight, 145 DawnShroud, 146 AspectOfTheGroleVisuals, 147 Bulwark, 148 BulwarkRadiance, 149 Disemboweled, 150 AntiTraversal.

<sub>Generated by `gen_glossary.cjs` (table `ailment_ids`) from stat_tag_enums.json (AilmentID, 151 values); 151 rows.</sub>

## Appendix: SP (stat property) ids (A)

`sp_enum.json`; used as `property` in affixes, implicits, uniques, tree stats and class `levelMods`. SP 58 (AbilityProperty), 98 (PlayerProperty), 100 (AilmentConversion), 104/105 (drop rate / experience categories), 123 (Tracker) and 130 (IdolAltarProperty) use `specialTag`/`tags` as a sub-index (A, `07a_assets_core_data.md` 1.1).

0 Damage, 1 AilmentChance, 2 AttackSpeed, 3 CastSpeed, 4 CriticalChance, 5 CriticalMultiplier, 6 DamageTaken, 7 Health, 8 Mana, 9 Movespeed, 10 Armour, 11 DodgeRating, 12 StunAvoidance, 13 FireResistance, 14 ColdResistance, 15 LightningResistance, 16 WardRetention, 17 HealthRegen, 18 ManaRegen, 19 Strength, 20 Vitality, 21 Intelligence, 22 Dexterity, 23 Attunement, 24 ManaBeforeHealthPercent, 25 ChannelCost, 26 VoidResistance, 27 NecroticResistance, 28 PoisonResistance, 29 BlockChance, 30 AllResistances, 31 DamageTakenAsPhysical, 32 DamageTakenAsFire, 33 DamageTakenAsCold, 34 DamageTakenAsLightning, 35 DamageTakenAsNecrotic, 36 DamageTakenAsVoid, 37 DamageTakenAsPoison, 38 HealthGain, 39 WardGain, 40 ManaGain, 41 AdaptiveSpellDamage, 42 IncreasedAilmentDuration, 43 IncreasedAilmentEffect, 44 IncreasedHealing, 45 IncreasedStunChance, 46 AllAttributes, 47 IncreasedPotionDropRate, 48 PotionHealth, 49 PotionSlots, 50 HasteOnHitChance, 51 HealthLeech, 52 ElementalResistance, 53 BlockEffectiveness, 54 None, 55 IncreasedStunImmunityDuration, 56 StunImmunity, 57 ManaDrain, 58 AbilityProperty, 59 Penetration, 60 CurrentHealthDrain, 61 MaximumCompanions, 62 GlancingBlowChance, 63 CullPercentFromPassives, 64 PhysicalResistance, 65 CullPercentFromWeapon, 66 ManaCost, 67 FreezeRateMultiplier, 68 IncreasedChanceToBeFrozen, 69 ManaEfficiency, 70 IncreasedCooldownRecoverySpeed, 71 ReceivedStunDuration, 72 NegativePhysicalResistance, 73 ChillRetaliationChance, 74 SlowRetaliationChance, 75 Endurance, 76 EnduranceThreshold, 77 NegativeArmour, 78 NegativeFireResistance, 79 NegativeColdResistance, 80 NegativeLightningResistance, 81 NegativeVoidResistance, 82 NegativeNecroticResistance, 83 NegativePoisonResistance, 84 NegativeElementalResistance, 85 Thorns, 86 PercentReflect, 87 ShockRetaliationChance, 88 LevelOfSkills, 89 CritAvoidance, 90 PotionHealthConvertedToWard, 91 WardOnPotionUse, 92 WardRegen, 93 OverkillLeech, 94 ManaBeforeWardPercent, 95 IncreasedStunDuration, 96 MaximumHealthGainedAsEnduranceThreshold, 97 ChanceToGain30WardWhenHit, 98 PlayerProperty, 99 ManaSpentGainedAsWard, 100 AilmentConversion, 101 PerceivedUnimportanceModifier, 102 IncreasedLeechRate, 103 MoreFreezeRatePerStackOfChill, 104 IncreasedDropRate, 105 IncreasedExperience, 106 PhysicalAndVoidResistance, 107 NecroticAndPoisonResistance, 108 DamageTakenBuff, 109 IncreasedChanceToBeStunned, 110 DamageTakenFromNearbyEnemies, 111 BlockChanceAgainstDistantEnemies, 112 ChanceToBeCrit, 113 DamageTakenWhileMoving, 114 ReducedBonusDamageTakenFromCrits, 115 DamagePerStackOfAilment, 116 IncreasedAreaForAreaSkills, 117 GlobalConditionalDamage, 118 ArmourMitigationAppliesToDamageOverTime, 119 WardDecayThreshold, 120 EffectOfAilmentOnYou, 121 ParryChance, 122 CircleOfFortuneLensEffect, 123 TrackerProperty, 124 UnimportanceModifier, 125 FreezeImmunity, 126 ChanceToCastForAbility, 127 ChanceToCastForTags, 128 AilmentImmunity, 129 AbilityRetaliationChance, 130 IdolAltarProperty, 131 GlobalConditionalPenetration, 132 GlobalConditionalCritChance, 133 GlobalConditionalCritMulti.

<sub>Generated by `gen_glossary.cjs` (table `sp_ids`) from sp_enum.json (134 SP ids); 134 rows.</sub>

## Pitfalls
- Same word, different layers: "Endurance" (reduction under a health threshold) is not "Endurance Threshold"; "Haste/Frenzy" are ailment ids 33/34 but "HasteOnHitChance" is SP 50.
- "Increased" has two meanings in the data: the INCREASED modifier category and stats whose names begin with "Increased" (e.g. `IncreasedStunChance`, `IncreasedHealing`) that are ADDED-type values in a special property (A, `07f_passive_weaver_trees.md` section 3).
- "Grand" blessings are the empowered versions; "Grand Idol" is a 3x1 idol size; "Greater Omen Window" is unrelated to either.
- Guide text and asset values sometimes differ (health per level, minion scaling, arena waves); entries note the conflict where it matters.
- Terms marked U exist only in stale sources; none are used in this glossary except where explicitly noted.

## Sources
- `vendor/lastepochbuilder/research/data/sp_enum.json`, `vendor/lastepochbuilder/research/data/stat_tag_enums.json`, `vendor/lastepochbuilder/research/data/game/classes.json`, `vendor/lastepochbuilder/research/data/game/ailments.json` - SP ids, enums, class values (A).
- `vendor/corpus/ingame_guide_1.5.0.txt` - definitions of ailments, defenses, crafting, endgame terms (G).
- `vendor/corpus/maxroll_rage-of-morditas.md`, `vendor/corpus/maxroll_season5_patch_notes_maxroll.md`, `vendor/corpus/maxroll_weaver-tree-strategies.md`, `vendor/corpus/maxroll_primordial-items.md`, `vendor/corpus/maxroll_respec-guide.md`, `vendor/corpus/maxroll_gear-walkthrough.md` - S5 and endgame terms (X).
- `knowledge/reference/_gen/gen_glossary.cjs`, `knowledge/reference/_gen/lib.cjs`, `knowledge/reference/_gen/build.cjs` - generators of every table marked "Generated by" on this page (run `node knowledge/reference/_gen/build.cjs`).

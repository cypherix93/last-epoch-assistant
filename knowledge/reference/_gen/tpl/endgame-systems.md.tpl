# Endgame Systems
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Labels: **A** asset data (vendored), **G** in-game guide, **X** Maxroll/community 2026, **U** unverified/stale.

## Summary
- Three endgame pillars: Monolith of Fate (10 Timelines x normal/Empowered, Corruption, Blessings, Harbingers), Dungeons (Temporal Sanctum, Soulfire Bastion, Lightless Arbor; 4 tiers each) and Arena (Endless Arena + Arena of Champions) (G, X). Season 5 adds Rage of Morditas (random encounter + boss chain + pinnacle) and a Nexus UI.
- Timelines: normal area levels 62, 66, 70, 74, 78, 82, 85, 90, 90, 90; normal Corruption 0-50; Empowered = level 100, Corruption 100 up to unlimited (A, G).
- Normal Corruption adds +1 monster/area level per 5 Corruption (timelines 1-6) or per 10 (timelines 7-10); Empowered corruption instead improves reward rarity (A).
- Shade of Orobyss adds Corruption and resets the Echo Web; Gaze of Orobyss (from Empowered Timeline bosses) adds 12 Corruption per stack, max 4 consumed per Shade (G).
- Pinnacle bosses: Aberroth (10 Harbingers + Harbinger Eye), Uber Aberroth (Threshold of Eternity echo, 500 Corruption), Pinnacle Morditas (Demigod's Ascendance echo, 400 Corruption; difficulty between Aberroth and Uber Aberroth) (X).
- Item factions: Circle of Fortune (Prophecies, 4 slots) or Merchant's Guild (Bazaar). Endgame factions (not exclusive): Forgotten Knights (Harbingers -> Aberroth) and The Woven (Weaver tree, Woven Echoes) (G, X).
- Enemy scaling, rarity multipliers and corruption monster math are specified in `../mechanics/enemies-and-corruption.md`.

## Monolith of Fate

- Entry: portal on the east side of the End of Time, early in the campaign; designed to start after the campaign (G). X says first-timeline enemies are around level 58 while `monster_mods.json` gives 62 (A) - use A.
- Access: Maxroll's beginner guide says the first seven Timelines are available at once and the last three (level 90) need 5 Knowledge of Orobyss; the endgame overview says players start with one Timeline and unlock others by clearing (conflict; completing all Quest Echoes of a Timeline unlocks adjacent ones per G) (X, G).
- Knowledge of Orobyss (shared by stash): Chapter 9 +1, Chapter 10 +1, Fall of the Outcasts +1, The Black Sun +1, The Stolen Lance +1, Fall of the Empire +2, Blood Frost and Death +1, Reign of Dragons +2, Ending the Storm +1; 5 unlock the level-90 Timelines (X). Progress is tracked by the Epoch Mastery quest (G).
- Each Timeline has its own Echo Web, quests, boss, blessings, area level and a special Echo reward type.

### Timelines (A, generated from `monster_mods.json`)

`maxStability` is the Stability needed to access quest echoes in that timeline; `Monolith mods listed` is the count of Monolith-type monster mods tied to the timeline. Timeline 99 in the data is a test entry (level 100, no corruption mod) and is omitted.

{{gen:misc.timelines}}

Corruption effect formula from `monster_mods.json` (`formulas.corruption`, code-derived): `effectModifier = f(c) - 1`, `f(c) = 0.6 c` for c <= 100, else `0.002 c^1.52 + 1.055 c - 47.692955`. The shared corruption monster mod (`Monster Power From Corruption Mod`) carries Health MORE 0.01, Hit-Damage MORE 0.01, DoT-Damage MORE 0.005 and increased item rarity 0.01 (A, `07a_assets_core_data.md` section 0.5, which words it as "per effect unit"). Mod stats scale by `(1+effect)` per the `statScale` formula (A), i.e. by f(c); this reading gives 0% at c = 0 and +60% health/hit damage at c = 100 (derived, U until the mechanics page confirms). Values:

{{gen:misc.corruption_curve}}

Monster mod counts (`monster_mods.json data[]`, A):

{{gen:misc.monster_mod_counts}}

### Timeline details (X, `maxroll_monolith_beginner-guide.md`, `maxroll_boss-loot-table-cheat-sheet.md`, `maxroll_monolith_empowered-guide.md`)

| # | Timeline | Boss | Harbinger (drop) | Special Echo reward (unique type) | Boss uniques (always-one pair / other / Empowered-only) |
|---|---|---|---|---|---|
| 1 | Fall of the Outcasts | Abomination | Harbinger of Defilement (Aberroth's Command) | Bows, Quivers | Woven Flesh or Ribbons of Blood; Flayer's Pride; Strands of Souls (Emp.) |
| 2 | The Stolen Lance | God Hunter Argentus | Harbinger of Pride (Phase Point) | Wands, Sceptres, Staves, Catalysts | Fragments or Shard of the Shattered Lance; Throne of Ambition; Wings of Argentus (Emp.) |
| 3 | The Black Sun | Rahyeh | Harbinger of Hatred (World Splitter) | Helmets, Shields | Atrophy or Dark Shroud of Cinders; Eternal Eclipse; The Confluence of Fate (Emp.) |
| 4 | Blood, Frost, and Death | Formosus | Harbinger of War (Celestial Doom) | Body Armour | Last Steps of the Living or Frozen Eyes of Formosus; Frostbite Shackles; Lich's Scorn; Eulogy of Blood (Emp.) |
| 5 | Ending the Storm | Lagon | Harbinger of Chaos (Black Blade of Chaos) | Gloves | Alluvion or Coral Aegis; Stormcarved Testament; Eye of Storms (Emp.) |
| 6 | Fall of the Empire | Harton's Husk | Harbinger of Treason (Wall of Nothing) | Belts | Bulwark or Trident of the Last Abyss; Nightbringer; Anchor of Oblivion (Emp.) |
| 7 | Reign of Dragons | Emperor of Corpses | Harbinger of Destruction (Event Horizon) | Swords, Axes, Maces, Daggers, Spears | Dragonflame Edict or Symbol of Demise; Twisted Heart of Uhkeiros; Horns of Uhkeiros (Emp.) |
| 8 | The Last Ruin | Husk of Elder Gaspar | Harbinger of Fear (The Inevitable) | Relics | Gaspar's Acuity or Will; Gaspar's Insight; Sacrificial Embrace, Ravenous Void (Emp.; Void also a rare world drop) |
| 9 | The Age of Winter | Heorot | Harbinger of Tyranny (Bane of Winter) | Rings, Amulets | Call of the Tundra or Reign of Winter; Yulia's Path; Faith of the Frozen (Emp.) |
| 10 | Spirits of Fire | Volcanic Shamans | Harbinger of Ash (Flames of Midnight) | Boots | Bhuldar's Wrath or Herkir's Vessel; Logi's Hunger; Trinity of Flames (Emp.) |

All Timeline bosses also drop Collapsing Horizon and Dungeon Keys; all Harbingers also drop Harbinger Eye, Harbinger's Needle, The Fading Brink and Temporal Keystone. Higher Corruption improves drop rates except for 50% drops such as Woven Flesh (X). Shade of Orobyss: Siphon of Anguish, Stymied Fate at any Corruption; Apathy's Maw 50+, Shattered Chains 120+ (the Empowered guide says 150), Omnis 200+ Corruption (X, conflicting thresholds between the cheat sheet and the Empowered guide).

### Echoes, Stability and quests
- A Timeline is an Echo Web; each Echo has a layout, an enemy modifier (lasts 1-3 echoes total, stacking when chained), an objective and a guaranteed reward (lost if you die before completing) (G, X). Modifiers add item rarity and experience; XP bonuses from modifiers and Corruption do not apply under level 50 (G).
- Objective types (X): kill a mini-boss, kill X patrol enemies, seal a time gate, destroy spires, slay Champions or Exiled Mages, activate Shrines/open Lost Caches until Ambushed, close Unstable Rifts, find the Cocooned Item; Arena echoes are always wave arenas.
- Stability comes from completed echoes (more from echoes far from the centre and from kills; Corruption increases it); each Timeline has 3 quests, the third being the boss; quests need Stability thresholds and must be done in order; dying in a quest echo lowers Stability but not quest progress (G, X). In Empowered Timelines quest echoes are optional for challenging the boss (G).
- Echo Chains (5 kinds): High Stability, Nemesis (ends in Conquered Tower), Rift Beast (ends in Primeval Cascade), Omen Window (ends in a Greater Omen Window), Pinnacle of Chaos (ends in Greater Omen Window with Champions) (X).
- Special echoes: Beacon (reveals a ring of echoes), Echo of a World (Shade of Orobyss), Vessel of Chaos (rerolls rewards of uncompleted echoes), Vessel of Memory (resets existing echoes), Sanctuary of Eterra (next to start; lowers Corruption, 3 choices; also resets the web) (X, G).
- Echo rewards: Arena Keys/Keys of Memory, dungeon keys, runes, glyphs, uniques and exalted items weighted by Corruption (X). Re-entering an attempted echo gives much less XP/favor (X patch).

### Corruption and the Shade of Orobyss
- Normal Timelines: Corruption 0-50 (A); Empowered: starts at 100, no max (A, G).
- Corruption raises monster health and damage, item rarity, XP and Stability per echo; raises area level in normal timelines (+1 per 5 or 10 Corruption, table above) and reward rarity in Empowered; very slightly raises LP/WW chance (G).
- The Shade of Orobyss appears as an Echo of a World further from the centre; more distance gives more Corruption; killing it resets the Echo Web but not Stability or modifiers; bonus Corruption is higher when this Timeline's Corruption is much lower than your highest (G, X).
- Gaze of Orobyss: +1 per Empowered Timeline boss kill (more with Harbinger's Needle); each stack gives +12 Corruption when the Shade dies, up to 4 stacks consumed per fight; dying to the Shade costs 1 Gaze; in parties each member offered a blessing also gets 1 Gaze (G, X).
- Catch-up: completing an Echo of a World or Confluence of Oblivion gives bonus Corruption relative to your highest Corruption (X). Weaver node Purged Horizon removes Corruption gain from Shades (A).
- Thresholds: 200 Corruption adds a 5th blessing choice (G); Shade uniques at 50/120-150/200 (X); Demigod's Ascendance Woven Echo needs 400 Corruption; Threshold of Eternity needs 500 (X).
- Empowered unlock: clear one of Spirits of Fire, The Last Ruin or The Age of Winter and kill its Harbinger, then click the chest at the centre island; each version keeps its own Corruption and Stability (X).

## Harbingers, Forgotten Knights and pinnacle bosses

- Harbingers: powerful servants of Orobyss met deep in the Monolith; progress tracked by the Forgotten Knights faction; ranks give better rewards from Nemeses and faster Corruption (G). 10 Harbingers (X); rank 5 reward once gave +20% Glyph of Envy drop chance from Harbingers (X, archived 1.1).
- **Aberroth** (X, `maxroll_monolith_aberroth-boss-guide.md`): slay all 10 Harbingers, spend a Harbinger Eye at the Altar of Oblivion (Shattered Road). Drops: Nihilis 14.29%, Seed of Ekkidrasil 38.1%, Null Portent 47.62%, Threshold of Eternity 100%; can drop any Harbinger item.
  - 5 phases by health: 100-77%, 77-63% (adds Called Meteors, Lobbed Meteors, Roots), 63-49% (four quadrant ground effects: Quicksand/Frailty, Lightning/Shock of Aberroth +5% damage taken per stack, Winds/Chill of Aberroth, Fiery Ground), 49-35% (Cursing Scythe: Curse of Aberroth, -10% all resistances, uncleansable, unlimited stacks), 35-0% (Cosmic Absorption + Lazer of Death; smaller arena; Absorbing Chaos 3 s instead of 4.5 s). Phase transitions give 90% less damage taken and stun immunity for 4.5 s.
  - Key attacks: Timeshattering Slam (Void+Physical, 4.5 s charge), Persisting Void pools (clear with Superheated Black Hole), Void Beam (2.5 s target; applies Frailty of Aberroth), Triple Flail Slam (Void+Lightning), Slam + Ground of Destruction, Blade of Chaos.
  - Frailty of Aberroth: -5% damage dealt per stack, -10% health leech/ward retention/health regen per stack, -50% healing effectiveness per stack, unlimited stacks, 4 s.
- **Uber Aberroth**: Threshold of Eternity Woven Echo (guaranteed Aberroth drop) needs 500 Corruption; much more health/damage; faster Persisting Void orbs; Void Beams on both sides; a Harbinger spawns at phases 2 and 4 making the boss immune until killed; heals to full at phase 5. Drops Immortal Vise 80%, Shattered Worlds 20% (X).
- **Morditas / Pinnacle Morditas**: see Rage of Morditas below. Morditas drops Frostborn Solitude 80%, Heorot's Repose 20%, Withstand the Elements 50%, Demigod's Ascendance 100%; Pinnacle Morditas drops Morditas' Vengeance 20%, Vestige of Imprisonment 80%, Unsated Rage 50% (X).
- Vision of the Observer (Fractured Prison): Oculus of Ruin 100%, Exulis 10%, multiple Omen Idols (X).
- Dungeon bosses: Julra, Cremorus, The Mountain Beneath (below). Arena champions: Alfrig Wolfmaw, The Crimson Blade, Vaion the Arsenal (below). Woven Echo bosses: Fateweavers (Clotho, Atropos, Lachesis), Woven Firstborn, Tomb of Vessels (Majasa, Countenance of Majasa), etc. (X boss loot sheet).

## Dungeons (G, X)

| | Temporal Sanctum | Soulfire Bastion | Lightless Arbor |
|---|---|---|---|
| Key | Temporal Sanctum Key | Soulfire Bastion Key | Lightless Arbor Key |
| Boss | Chronomancer Julra | Fire Lich Cremorus | The Mountain Beneath |
| Mechanic (skill on D) | Temporal Shift: switch between Divine and Ruined Era to bypass blocks, find doors, dodge mechanics | Soulfire Shield: spend Souls to switch immunity between Fire and Necrotic damage | Burning Amber light source (loses power when you take damage); unlit enemies deal much more and take less damage; also destroys Pyres |
| Reward | Eternity Cache: unique with LP + exalted -> legendary (Tier 2+ allows 1 guaranteed affix) | Soul Gambler: Souls buy items; door modifiers change the gambler's offers (good for belts, boots, gloves) | Vaults of Uncertain Fate: spend gold on modifiers that raise vault value; cost rises per modifier; gold sink; can give many exalted items and a Lightless Arbor Key |
| Boss uniques | Julra's Stardial, Somnia, Julra's Obsession, Vessel of Strife | Ashes of Mortality, Lich's Envy, Immolator's Oblation, Pyre of Affliction | Peak, Foot, Face and Core of the Mountain |
| Min area level / key drop level | 55 / 54 (U wiki) | 45 / 47 (U wiki) | 22 / 25 (U wiki) |

Common rules (G, X): 4 tiers each (higher tier = more difficult and rewarding; usually lower tiers must be cleared first; each tier has a rotating daily bonus reward); two maps then a boss arena, each map has two doors with modifiers (extra monster health/damage for better rewards); paths are randomly blocked; no extra life - dying ends the run unless you spend another key to continue; first completion grants 2 passive points and 1 idol slot and acts as a campaign skip; boss uniques are exclusive and often tier-gated; Dungeon Key Charms (bought with 3 keys at Maj'Elka's Black Market Key Trader in 1.2; G: "Dungeon Keys can be used to purchase Dungeon Key Charms") - Portal Charm skips straight to the boss, Scale Charm adds many Loot Lizards. Key sources: random drops, Timeline bosses (best, scales with item rarity), Arena of Champions rewards (weak), Weaver tree nodes (Vaulted Keychain, Gatekeeper's Bounty, Warden's Echo), Circle of Fortune prophecies (rank 3). Season 5 adds three one-shot key caches for campaign skips.

## Arena (G, X)

- Located at Champion's Gate in the Divine Era (Wengari Fortress waypoint -> west -> Kolheim Pass -> west) (X); enter with an Arena Key or Arena Key of Memory (Memory starts Endless Arena from wave 100 or half of your previous run, whichever is higher; no use in Arena of Champions) (X).
- **Endless Arena**: unlimited waves of rising difficulty; leaderboards (Online, Season only); characters under level 50 get no XP bonuses; poor loot (G, X).
- **Arena of Champions (AoC)**: 4 tiers; G says 40 waves ending in an Arena Champion; Maxroll (2026-04) says 50 waves with modifier choices at waves 10, 20, 30 (plus a start modifier on tiers 2-4) (conflict; G is the 1.5.0 text). No extra attempts: death loses progress. Rewards depend on chosen modifiers (exalted jewelry/items/weapons, glyphs, idols, runes, affix shards at wave 10; dungeon keys (all three) or rare gear at wave 20; Arena Key, glyphs of Chaos or uniques/set item at wave 30; tier 4 adds Arena Key of Memory). Champion at the end is random: Alfrig Wolfmaw (Primalist-like; Physical, Cold, Lightning; drops Omen of Thunder), The Crimson Blade (Rogue; Physical, Poison, Fire; drops Penumbra), Vaion the Arsenal (Sentinel; Physical, Fire; drops Vaion's Chariot). Each can drop its unique at any tier, higher tiers more likely. Champions' Colosseum Woven Echo farms them efficiently.
- Weaver nodes affect Arena echoes (Eclipsed Battleground removes them; Call of the Duellist increases them; Swift Trial reduces waves) (A).

## Rage of Morditas (Season 5)

Sources: G (`RageOfMorditas_*`), X (`maxroll_rage-of-morditas.md` 2026-10-01, patch notes 2026-09-25).

- **Trigger**: Blood Crystal (appears in campaign from Chapter 2 and in Echoes; chat message "Anger is building up in the air"); interacting starts a countdown timer: 25 s in the campaign, 20 s in the Monolith; each kill extends it (higher rarity more), diminishing and capped; Blood Vapor trails point to enemies (X).
- **Phase 1**: kill enemies; Bloodrage Charges at 20 / 50 / 90 / 140 / 200 kills (max 5; beyond 200 the timer drains rapidly). Each charge also grants one random **Bloodrage buff** of 28 (no repeats in an encounter), lasting the whole encounter; each buff also gives +5% attack and cast speed and +3% movement speed (X).
  - Common (11): Berserking (Frenzy, 40% inc effect), Predator (Haste, 40%), Eternal (+50 ward/s, 50% inc mana regen), Commanding (minions Haste+Frenzy), Explosive (50% inc area), Sanguine (+200% bleed chance, 100% inc DoT), Feasting (10% leech, 10% also dealt to a nearby enemy; needs no ward-per-missing-health), Murderous (hits inflict Marked for Death), Blighted, Freezing (ice nova every 2 s, 30% more damage to frozen), Boiling (minion aura).
  - Less common (9): Incisive (+10% crit chance; crits 20% to be Deadly Strikes), Empowered (+10 all attributes), Crescendoing (every 3rd ability 50% more damage, 100% inc area), Bursting, Icy, Evasive, Revitalizing, Shattering, Pack.
  - Rare (8): Frigid, Rippling, Fevered, Runic (allies on rune: 20% inc attack/cast speed, 20% more damage, 20% less mana cost), Portentous (recast non-channelled, non-cooldown ability after 1 s), Coalescing, Monstrous, Reptilian Blood (Loot Lizards).
- **Phase 2** (Gauntlet of Blood and Ice): arena forms; every enemy killed in phase 1 is revived; leave the area for 4 s to cancel; clearing it spawns the Blood-Filled Crystal (X). Weaver node Seekers of Ice and Blood makes phase-2 enemies deal more damage; Portents of Blood replaces one phase-2 enemy with an Omen and drops corrupted items (X).
- **Reward panel**: 5 rewards (4 equipment + 1 misc); each charge = one action: Claim (panel regenerates, ritual empowerment removed), Frozen Ritual (sacrifice one reward; others reroll to the same item type with similar affixes; rare/exalted get Ice FP) or Bloody Ritual (sacrifice; others cannot be that item type until you claim; rare/exalted get Blood FP). Bloodrage charges do not carry over; the panel does (G, X). Ritual effects on Variant uniques: Frozen rerolls the variant affix; Bloody can add LP or corrupt (G).
- **Exclusive item subtypes (18, level requirement 50)**, values from the 2026-10-01 guide (patch notes differ slightly, e.g. Ice Pick 45 vs 50 Melee Damage, Farwood Branch 50-55 vs 55-60 Spell Damage) (X):

| Subtype | Type | Implicits |
|---|---|---|
| Axe Staff | 2H staff | 90 melee dmg; 40-55 spell dmg; 40-46% inc melee attack speed |
| Bloodfused Blade | 2H sword | 75 melee dmg; 50-100% armor shred chance; 30-60% bleed chance |
| Bloodfused Icicle | 2H spear | 90 melee cold dmg; 60-120% melee bleed and frostbite chance |
| Bloodpelt Quiver | quiver | 25-55% bow crit multi vs bleeding; 13-22% inc dodge rating |
| Bloodsoaked Dagger | dagger | 35 melee dmg; 40-75% bleed chance; 10-18% more crit chance vs bleeding |
| Carnage Maul | 2H mace | 112 melee dmg; 80-140% melee bleed chance; 10-40% inc physical dmg |
| Eber Horn Gauntlets | gloves | 65 armor; 5-15% endurance; 25-45% necrotic res |
| Farwood Branch | wand | 55-60 spell dmg; 25-40% ward retention; -3 spell mana cost |
| Frozen Cleaver | 2H axe | 100 melee dmg; 50-110% inc cold dmg; 12-26% cold pen vs frozen/chilled |
| Frozen Skull | catalyst | 9-13 Int; 8-14% inc cast speed; 50-90% freeze rate multiplier |
| Gnarled Antler | 1H mace | 55 melee dmg; 55-75% melee crit multi vs bleeding and vs chilled |
| Ice Pick | 1H axe | 50 melee dmg; 10-18% cold pen vs frozen/chilled; 10-30% cold res |
| Icescale Greaves | boots | 40 armor; 12-16% inc movement speed; +1 Evade charge |
| Icespike Shield | shield | 24% block chance; 325-425 block effectiveness; 13-21 melee cold dmg |
| Icicle Bow | bow | 46 bow dmg; 30-55% bleed chance; 80-140% inc bow cold dmg |
| Icicle Sword | 1H sword | 35 melee dmg; 4-6% cold pen; 50-100% frostbite chance |
| Veinweave Belt | belt | 4 potion slots; 30-60 mana; 70-100 ward decay threshold |
| Warden Sceptre | sceptre | 38 melee dmg; 38-45 spell dmg; 3-5% less damage taken from chilled or bleeding enemies |

- **Variant uniques**: Withstand the Elements (gloves; +2 affixes interacting with overcapped Cold or Physical resistance) and Unsated Rage (ring; one of 27 Bloodrage effects) (X, A pools of 8 and 27 `droppableLegendaryAffixes`).
- **Morditas progression** (Monolith encounters only; kills accumulate): Site of Carnage 750 kills (waves of Wengari), Blood of Farwood 2000 (Yrun, Champion of Morditas), Circle of Frozen Blood 4000 (Morditas, son of Heorot). Anger (grows with kills, can be soothed in the Nexus) scales difficulty and rewards of all three. Morditas drops the Demigod's Ascendance Woven Echo (needs 400 Corruption) which opens Pinnacle Morditas: does not scale with Corruption and sits between Aberroth and Uber Aberroth in difficulty (X, G).
- Weaver nodes: Ubiquity of Rage, Seekers of Ice and Blood (4 pts), Portents of Blood (A, X).

## Item factions, prophecies and lenses

- Join in Chapter 9 (Zerrick) at the Bazaar (Merchant's Guild, Nama) or Observatory (Circle of Fortune, Galila); 12 ranks each; shared stash-wide; separate per game mode (G, X).
- **Merchant's Guild**: gold + Favor trades, asynchronous Bazaar; items tradable once then MG-bound; S5: buy/list all item types on joining, ranks unlock bags, price suggestions, auto-lowering, richer affix filters, Black Market tokens removed (G, X).
- **Circle of Fortune** (S5 rework): Prophecy rerolling removed; 4 prophecy slots; select a reward category per slot, gains charges (up to 99) as Favor is earned; completing either of the slot's two trigger objectives spends a charge (multiple charges spend multiple) and drops the reward (X):

| Slot | Unlock rank | Triggers |
|---|---|---|
| Mesembria | 1 | Defeat a Rift Beast or activate a Shrine |
| Dysis | 3 | Defeat a Nemesis or open a Lost Cache |
| Eos | 6 | Defeat an Exiled Mage or Timeline Boss |
| Arctis | 9 | Defeat a Fateweaver or an Omen |

  Reward categories by rank (X): R1 Rare gear per type, Unique per type, Set weapon/offhand/jewelry/armor, random idol, Rune of Shattering/Discovery, Glyph of Hope/Chaos; R2 Rune of Removal, Glyph of Order, random key; R3 Rune of Shaping/Refinement, Temporal Sanctum/Lightless Arbor/Soulfire Bastion Key; R4 rare gear upgrades to exalted, sized idols (Small to Adorned), unique idol, random rune/glyph; R5 rare idol altar, Arena Key/Key of Memory, dungeon charms, rare champion item; R6 rare Harbinger's Spoils, rare experimental item; R7 champion item to exalted; R8 Small/Minor/Humble/Stout Weaver idol, Rune of Weaving; R9 champion affix T6+; R10 altar and spoils upgrade to exalted, Glyph of Despair/Envy; R11 Runes of Redemption/Havoc/Ascendance/Creation, champion T7; R12 experimental T7. Other CoF passives: rank 4 any set item drops as full set; rank 8 doubles LP chance of dropped uniques (X).
  Lenses (one reward + one lens per slot; bought once for the whole stash): Tyranny R3 (consumes Favor to double charge rate), Origin/Finality R4 (higher prefix/suffix tiers), Celerity R5, Duplication R5, Acceleration R6 (rare enemies as trigger), Anomaly R6 (compressed affix weighting), Prowess R6 (skill-level affixes on helmet/body/relic), Charity R7, Celestial Scales R7, Curiosity R8, Quality R9 (higher LP and tier upgrade chance) (X).
- Season 5 faction-wide: tooltips show red when rank is too low; rank-up notification (X).

## Other encounters
- **Omen Windows**: horde of Fractured enemies then an Omen (4 Omen types); 5 difficulty tiers; leaving the ring starts a 10 s timer; rewards Timeglass Fragments, Rune of Corruption, corrupted items, Omen Idols, Idol Altars; Greater Omen Windows (end of Omen / Pinnacle of Chaos chains, Omen's Veil with 3, 2 Omens); Timeglass Core: spend fragments to spawn an echo chain; fragments trade with Apophis the Oracle (X, G). S5: windows from area level 18, altars from 32 (X).
- **Nemesis**: see `crafting.md`; Egg of the Forgotten chance 0% below level 60, 20% at 60, 60% at 100 (X).
- **Primal Hunts / Rift Beasts**: from area level 20; Mysterious Rift then 2-4 Torn Rifts; 3 evolutions of 60+; default lineage evolves 4 times (9 after two full lineages and Rampant Coast); Primordial Materials (Ancient Bones, Fang, Feather, Horn, Petal, Crystallized Heart) buy Primordial uniques and Runes of Evolution from Skarven Bloodhorn (X).
- **Exiled Mages / Champions / Loot Lizards / Shrines**: see `crafting.md`, `item-system.md`.
- **Woven Echoes and The Woven**: join via Masque in the Haven of Silk after a Cemetery of the Erased; ranks give Weaver points and Woven Echoes for Memory Amber; Tombs and Cemeteries of the Erased (procedural side zones) drop Memory Amber, Weaver idols, woven echoes; Silken Cocoons release a Soul of the Erased or an Incubated Silk; the Altar to the Weaver places Woven Echoes (G, X). Details in `skills-and-trees.md`.
- **Nexus / Traveler's Rest** (S5): Nexus UI shows timelines, Corruption, blessings, factions, Morditas activity; Echo of the World renamed Traveler's Rest with a waypoint (X).

## Pitfalls
- Arena of Champions wave count: 40 (G) vs 50 (X). First-timeline level: 62 (A) vs 58 (X). Shade unique thresholds differ between X pages. Prefer A/G for planning.
- Empowered level 100 is fixed; Corruption beyond 100 scales via f(c) (A) - Corruption does not raise level in Empowered.
- Pinnacle Morditas does not scale with Corruption; Aberroth echoes need Corruption gates (400 / 500) for Morditas/Uber.
- Dungeon minimum levels come only from the stale wiki (U).
- Rage of Morditas progress counts Monolith encounters only, not campaign (X).
- Bloodrage charges are per encounter; the reward panel persists - do not spend charges planning cross-encounter.
- Season-only and Legacy differences: S5 features may not exist in Legacy; there are no season-restricted items currently (G).

## Sources
- `vendor/lastepochbuilder/research/data/game/monster_mods.json` (timelines, formulas), `trees.json` (Weaver nodes), `uniques.json` (variant pools), `07a_assets_core_data.md` (sections 0.5, 4.2) (A).
- `C:\Users\Genesis\AppData\Local\Temp\claude\D--src-last-epoch-assistant\2a02c54d-b8b3-416e-bc0a-3ef48c1c23fd\scratchpad\corpus\ingame_guide_1.5.0.txt` - Monolith, Corruption, Blessings, dungeons, Arena, factions, Rage of Morditas (G).
- `C:\Users\Genesis\AppData\Local\Temp\claude\D--src-last-epoch-assistant\2a02c54d-b8b3-416e-bc0a-3ef48c1c23fd\scratchpad\corpus\maxroll_monolith_beginner-guide.md`, `maxroll_monolith_empowered-guide.md`, `maxroll_monolith_aberroth-boss-guide.md`, `maxroll_boss-loot-table-cheat-sheet.md`, `maxroll_rage-of-morditas.md`, `maxroll_dungeons_dungeon-guide.md`, `maxroll_arena-of-champions.md`, `maxroll_getting-started_endgame-overview.md`, `maxroll_getting-started_item-faction-overview.md`, `maxroll_omen-windows.md`, `maxroll_nemesis-system-overview.md`, `maxroll_primal-hunts.md`, `maxroll_season5_patch_notes_maxroll.md` - X.
- `C:\Users\Genesis\AppData\Local\Temp\claude\D--src-last-epoch-assistant\2a02c54d-b8b3-416e-bc0a-3ef48c1c23fd\scratchpad\corpus\wiki_dungeons.md`, `wiki_monolith_of_fate.md`, `wiki_harbinger.md` - dungeon minimum levels only (U, 2024).

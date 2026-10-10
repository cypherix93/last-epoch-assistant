> **Evidence, not guidance.** Skill-probe task output (2026-10-08, game data 1.5.2), produced with the `.claude/skills/` text as it was *before* the commit that added this folder applied the feedback. Quotes and line numbers refer to that earlier skill text; the current skills supersede it. See `tests/probes/README.md` and `.claude/skills/README.md`.

# Fire Aura Engine Spellblade: built around Ignivar's Head (uid 74)

> Data: `game_version` Version 1.5.2, `data_version` 1.5.2, source le.sqlite (populated: uniques 486) plus vendored `unique_effects.json` for the coded model. Generated 2026-10-08.
> Confidence labels: D decompiled, A asset data, G game guide, X community 2026, U unverified or illustrative. Every number below carries one.
> Status: **theorycraft to test**. Not tested in game, not a known or "meta" build.

User ask: "What can I build around it that isn't the obvious thing?" Obvious = Mage Disintegrate scaling "more damage equal to spell crit chance" (candidate 1). The proposal below goes elsewhere on purpose.

## Build card

| Field | Value |
|---|---|
| Item | Ignivar's Head (uid 74), Off-Hand Catalyst / Branded Skull, level req 50 (unique) / 24 (base), no class requirement (A) |
| Enabling effect | While channelling any skill, cast Fire Aura (AbilityID 162) once per second for free (D, unique_effects.json uid 74, interval 1.0 s, delay 0.2 s, 1 m in front) |
| Stat stick | Fire increased damage 60-95% (tags 8); Ailment Chance (Ignite) +50-150% tagged Channelling; Increased Fire Aura Area +60-95% (AP162:1); wants Fire / Spell / DoT sources, not Disintegrate-specific (A) |
| Class / mastery | Mage / Spellblade (mastery_index 2) (A) |
| Main skill | Fire Aura itself (spell, Fire/Spell/DoT, no tree), fed by Focus (`vm53dx`) channelling and Enchant Weapon (`sb44eQ`) |
| Defense layers | Focus channel mitigation (Iron Stance armour, Prismatic Stance elemental DR, Prism Barrier resists), Flame Ward ward + 30% less hit damage; resistances capped from gear suffixes and Grand Heart of the Caldera |
| Sustain | Focus mana regen +100% and 10 ward/s while channelling (A), Inner Growth heal, Praesidium-style ward not used |
| Other required uniques | 0 required; optional: Herkir's Vessel (163), Dark Shroud of Cinders (117) (count: 0-2) |
| Rate check | Ignivar: 1 Fire Aura cast/s deterministic, ~4 concurrent (U) vs Spellblade Flame Walker max 8 pts x 10% = 80%/s only while moving or using melee (A) -> about 1.25x, and works standing still |
| Scores (Dmg/Def/Sus/Gear/Nov) | 4/3/3/3/5 = 18 |
| Riskiest assumption | Overlapping Fire Aura objects each tick the same enemy and are not capped by an instance limit -> test #1 |

## 1. The item

Mods (Q2 `v_mods_named`, uid 74):

| # | Property (SP) | Tags | Type | Range | Label |
|---|---|---|---|---|---|
| 0 | Damage (0) | 8 Fire | increased | 0.6 - 0.95 | A |
| 1 | AilmentChance (1), special_tag 1 = Ignite | 262144 Channelling | added | 0.5 - 1.5 | A |
| 2 | AbilityProperty (58), AP index 162:1 Increased Fire Aura Area | 162 (ability ref) | added | 0.6 - 0.95 | A (reader FireAuraMutator, semantic D?) |

Tooltip lines (quoted): "Cast Fire Aura every second while Channelling"; "Disintegrate deals more damage equal to your spell crit chance" (alt text: at 40% spell crit, 40% more, multiplicative).

Coded model (`unique_effects.json` uniqueID 74, class `Ignivar_Head`, code):
- Effect 1: trigger "update tick"; condition: `Time.time > timeLastCastFireAura + 1.0` and `usingAbility.isUsingChannelledAbility()`; formula: every >1.0 s while channelling, cast FireAura (162) forward 1.0 m after 0.2 s delay; "cast for free (no mana or cooldown in this code path)"; confidence **D**. `abilities.channelled = 1` for Focus, Disintegrate, Ghostflame, Drain Life, Warpath, Rebuke, Smelter's Wrath, Assemble Abomination (A, query Q4a).
- Effect 2: on equip, `DisintegrateMutator.moreDamagePerCritChanceFromItems += 1.0`; Disintegrate temp stat MORE Damage = spell crit chance (+5% base added in lookup); only applies if a DisintegrateMutator exists at equip time; **D**.
- Effect 0: AP162:1 Increased Fire Aura Area, **D** (field mapping) / **D?** (semantics).

Catalogue entries mentioning it (headings): "Ignivar's Head gives free Fire Aura casts while channelling" (D, line 114); "Ignivar's Head: Disintegrate scales with crit chance it cannot use" (D, line 667); "Crit does nothing for damage over time" (A/G, line 595, lists Ignivar's Head as a converter).

Restrictions (Q3): slot Off-Hand Catalyst (category Off-Hand), base Branded Skull base level 24, unique level 50; class requirement NULL; `is_primordial` 0, `is_set_item` 0, `is_legendary_capable` 0; `droppable_legendary_affix_count` 1; `can_drop_randomly` 1 (A). Slot consequence: occupies the off-hand, so no shield/block layer; a catalyst pairs with a 1H weapon.

## 2. Enabling-effect model

- Rate equation (D structure, U inputs): casts/s c = 1 while channelling; each Fire Aura object lasts d = 4 s (A: `DestroyAfterDuration 4`); concurrent stacks N = c x d = 4 (U: assumes each object ticks the same enemy independently; component has `canDamageSameEnemyAgain: true`, A). Fire Aura per stack per second = (base 28 + 1.4 x added spell fire) x (1 + inc) x more. Base: Fire 14 per tick, ADE 0.7 per tick, alt-text "140% effectiveness per second" -> 2 ticks/s (A, tick count derived, U). DoT: no crit (A), tags Fire|Spell|DoT (A, 4360).
- Plausible endgame value (inputs U): added spell fire 40, increased sum 4.95 (Ignivar 0.95 + Fire Aura damage affix 1.0 + generic fire/spell/DoT 3.0 - all illustrative), more = 1.15 (Eye of Flame, A) x 1.5 (other, U) = 1.725. Per stack = (28 + 56) x 4.95 x 1.725 = 717/s; x 4 stacks = **~2,870/s vs dummy (U)**; vs a level-100 monster x0.13 = ~370/s (U, level DR D). Illustrative only.
- Benchmark: Disintegrate with the same inputs: base 24/tick x 4 ticks/s = 96, ADE 480% -> +192 = 288; x 4.95 x 1.5 x (1 + spell crit 0.65) = ~3,530/s (U). So the Fire Aura engine alone is about 0.8x a fully fed Disintegrate (U), and Disintegrate's crit-more is only a stat stick for a different build. Against a plain alternative: the best plain "Increased Fire Aura Damage" prefix is +30-100% (affix 240, A) - Ignivar's engine is worth far more than one affix because it provides the stacks. Against other Fire Aura sources: Spellblade Flame Walker 10%/s per point (max 8 -> 80%/s, only while moving or using melee) (A), Dark Shroud of Cinders (117) "chance to cast Fire Aura when Hit, up to 3/s" 17-25% (A), Herkir's Vessel (163) on potion use 60-100% (A).
- Verdict: enabler worth it - deterministic, standing-still, ~1.25x Flame Walker's maximum; but it only fires while a channel is held, so it constrains play to a channelling engine skill (Focus costs 0 mana).

## 3. Candidates (divergent phase)

| # | Archetype | Class / mastery | Core skill(s) | Key pairing (ids) | Query / entry that supports it | Dmg | Def | Sus | Gear | Nov | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | direct self-cast channel (obvious) | Mage / any | Disintegrate `dig5` | Ignivar crit-more + Inferno `dig5:24`, crit gear | catalogue "Disintegrate scales with crit chance"; Q4a | 5 | 3 | 3 | 4 | 1 | 16 |
| 2 | "use only the enabler": Fire Aura engine | Mage / Spellblade (2) | Focus `vm53dx` (free channel), Enchant Weapon `sb44eQ` (`sb44eQ:18` Power Vent), Flame Ward `fw3d` (`fw3d:13` Eye of Flame, `fw3d:11` Dilation) | Ignivar + Mage passives `mg-1:38/42/47/74` + idol affixes 240/248 | Q7a (Fire Aura nodes), Q13 (passives), `fa_uniques` query, Focus tree | 4 | 3 | 3 | 3 | 5 | 18 |
| 3 | fire+necrotic DoT channel stacking | Acolyte / Warlock | Ghostflame `gh0fl` (Fire,Necrotic,Spell,DoT, ADE 175% x ticks) | Ignivar Ignite (Channelling) + Fire inc dmg + Fire Aura as second DoT | Q4a, Q5 (Warlock lvl 15), `comps` query | 3 | 3 | 2 | 4 | 4 | 16 |
| 4 | melee channel ignite | Sentinel / Forge Guard | Smelter's Wrath `st4th` (Physical,Fire,Melee, armour doubled while channelling) | Ignivar Fire inc (50-150% Ignite Channelling) applies to the fire part | Q4a, Q5, ability description | 3 | 4 | 3 | 4 | 3 | 17 |
| 5 | defensive-engine: item is the damage supplement | Sentinel / base | Rebuke `re82ke` (80% less damage while channelling up to 2 s, no stun) | Fire Aura procs each second of the 2 s channel | `desc` query; Q5 | 2 | 5 | 2 | 4 | 4 | 17 |
| 6 | necrotic DoT + leech | Acolyte / Lich | Drain Life `dl73` (leech 30%, Contempt) | Ignivar gives a fire layer on a necrotic build; fire inc dmg stat stick partly wasted | Q4a, Q7b (Contempt) | 2 | 4 | 5 | 3 | 3 | 17 |
| 7 | minion channel | Acolyte / Necromancer | Assemble Abomination `aa710` (channel to combine minions) | free Fire Aura from a player spell on a minion build; Minion stats do not feed Fire Aura | Q4a, Q7b | 1 | 3 | 2 | 3 | 3 | 12 |

Gate result: candidate 7 dropped (Dmg 1). Candidates 1-6 pass (Dmg >= 2). Novelty pairing: #2 - Focus (a 0-mana buff channel) used purely as the Ignivar trigger, together with the Spellblade Fire Aura passive package and Flame Ward's global Fire Aura nodes (`fw3d:13` also "affects Fire Aura from sources other than Flame Ward", A); no catalogue entry names Ignivar with Focus, Flame Ward or Spellblade (grep of catalogue.md for "Ignivar": 3 entries, none with these, A). Chosen: #2 (full skeleton); #4 as a short second outline. Tie-break among 17s toward Gear accessibility (#4, #5 = 4).

## 4. Build skeleton: Fire Aura Engine Spellblade

### 4.1 Class, mastery, bonuses
Mage, Spellblade (class_id 1, mastery_index 2). Mastery bonuses (A): 12 ward gained on melee use and hit; 40% of added melee damage on weapons is also gained as added spell damage (this matters because Fire Aura scales with added spell damage at 140%/s; a melee weapon's added damage then feeds it). Mage base: endurance 20%, no threshold (A).

### 4.2 Skills

| Slot | Skill (`ability_id`) | Role | Key nodes (`tree:node` Name, points) | Why |
|---|---|---|---|---|
| 1 | Focus (`vm53dx`) | engine / buff channel (Mage base mastery skill, lvl 20) | `vm53dx:10` Burning Aura (5), `vm53dx:11` Iron Stance (4), `vm53dx:13` Prismatic Stance (5), `vm53dx:17` Prism Barrier (5), `vm53dx:7` Mana Flooded | channelled = 1, 0 mana, lets Ignivar fire each second; Burning Aura adds its own ignite each second (A); defensive nodes apply only while channelling |
| 2 | Enchant Weapon (`sb44eQ`) | Fire Aura stacker (lvl 15) | `sb44eQ:18` Power Vent (1) "Active: You gain stacks of Fire Aura every second" | second independent Fire Aura source, no channel needed (A) |
| 3 | Flame Ward (`fw3d`) | amplifier + defense | `fw3d:12` Fire Aura (1), `fw3d:13` Eye of Flame (1, +15% more Fire Aura damage, global), `fw3d:11` Dilation (3, +12% duration per point: Flame Ward and Fire Aura last longer), `fw3d:18` Barrier (hit damage less) | Eye of Flame applies to Fire Aura from other sources; Dilation lengthens the stack window (more concurrent stacks) |
| 4 | Flame Reave (`fr11mv`) | movement/melee filler and Fire Aura trigger (lvl 5) | `fr11mv:29` Lingering Embers (chance to cast Fire Aura when directly used; tripled if it has a cooldown) | Spellblade melee spell: also supplies the mastery's melee-to-spell added conversion and Flame Walker "using melee" condition |
| 5 | Teleport (`te44`) | mobility (lvl 9) | (unspent) | Focus channel probably stops movement (U) so a gap closer matters |

Nodes whose stats are skill-local (5000+) or display-only: all skill_node rows are display-only in `mods` (modifier_type NULL), including `fw3d:13`, `vm53dx:10`, `sb44eQ:18`, `fr11mv:29`. Their modifier types (more vs increased) are unknown; `fw3d:13` text says "more damage (multiplicative with other modifiers)". Type of Dilation magnitude (+12%) unknown.

### 4.3 Passives (priority order; Mage tree `mg-1`)

| Order | Node (`tree:node` Name) | Points | Mastery gate | Why |
|---|---|---|---|---|
| 1 | `mg-1:38` Flame Walker | 8 | mastery 5 | Fire Aura chance 10%/s per point while moving or meleeing (A) + fire res shred |
| 2 | `mg-1:42` Incinerating Aura | 8 | mastery 10 | +15% Fire Aura area per... and Fire Aura damage per 1% uncapped fire resistance (+1%, exact scaling U) |
| 3 | `mg-1:47` Burning Hands | 5 | mastery 30 | Fire Aura chance +8% per point, trigger limit +3/s, fire res +4%/pt |
| 4 | `mg-1:74` Flame Drinker | 6 | mastery 40 | mana gained per Fire Aura consumed (mana loop for Flame Ward/Reave) |
| 5+ | generic life/res/ward nodes | rest | - | Mage tree not fully read: U |

(Q13 returned these six Fire Aura nodes; all appear in Mage class tree under mastery 2.) Point budget: not verified against `classes-and-masteries.md` (U).

### 4.4 Gear

| Slot | Item | Required affixes (name, id, tier target) | Resistances carried | Notes |
|---|---|---|---|---|
| Weapon | 1H sword or axe with added melee damage, or Transcriber's Graver (311, 1H Sword, lvl 48: Fire Aura per stack spell damage with Flame Rush, +16-24 added spell, 12-20% elemental pen) | added melee damage (feeds mastery conversion), Fire/Spell prefixes | - | Graver is optional; its Glyph clauses only work with Glyph of Dominion (not in this build) |
| Off-hand | Ignivar's Head (74) | - | - | locks off-hand |
| Helmet | rare | Increased Fire Aura Damage (affix 240, T5+ target; 30-100% range across tiers) | Fire/Lightning res suffix (affix 13/15, T5 30-45%) | |
| Body | Dark Shroud of Cinders (117, lvl 66) optional | rolls: chance to cast Fire Aura when Hit (cap 3/s), increased Void damage per Fire Aura | - | adds Void spell added damage; tooltip_text NULL so read mods_text |
| Gloves | rare | Increased Fire Aura Area (248) or Chance to cast Fire Aura on Crit (238) | Cold res (affix 14) | |
| Belt | rare | Health, Endurance (92) | Void res (26) | |
| Boots | rare | movement speed, resist | Necrotic/Poison/Physical | |
| Amulet | rare | Fire Aura damage / spell | - | |
| Ring 1/2 | rare | fire/spell, resist | Physical (64) | |
| Relic | Herkir's Vessel (163, lvl 76) optional | Fire inc 60-100%, Fire Aura area 30-60%, Fire Aura on potion use 100-60% | - | potions as a Fire Aura source |

Legendary / LP plan for the item: none (`is_legendary_capable` 0). Corruption of Ignivar's Head is not worth it for this plan (U); no LP.

### 4.5 Idols

| Shape | Prefix (name, id) | Suffix (name, id) | Count |
|---|---|---|---|
| Fire Aura rolls (rolls_on = 1 affixes from `v_affix_summary`) | Increased Fire Aura Damage (240, +30-100%) | Increased Fire Aura Area (248, +15-36%), Chance to cast Fire Aura when Hit (247) | as many as slots allow; shapes/sizes not verified (U) |

Idol shape per affix was not resolved (the query returned no shape column); one-of-each unique idol rule irrelevant (no unique idols).

### 4.6 Blessings

| Timeline | Blessing (normal / Grand) | Stat, range | Why |
|---|---|---|---|
| Spirits of Fire | Grand Heart of the Caldera | Fire Resistance 55-75% (A) | feeds Incinerating Aura via uncapped fire res and closes the fire gap |
| Spirits of Fire (alternative slot) | Grand Embers of Immortality | Endurance 18-30% (A) | defensive gap |
| The Black Sun | Winds of Oblivion / Grand | Critical Strike Chance 30-80% (A) | not useful: Fire Aura cannot crit (A); skip |
| Other timelines | not resolved (U) | | one blessing per timeline - 9 of 10 not queried |

## 5. Damage path (le-damage-reasoning)

- Damage source tags: Fire Aura Fire|Spell|DoT (4360) (A). DoT: src = (tags & ~Hit) | DoT. No crit, no armour (A).
- Added (x ADE) / increased / more per bucket (Fire only): added: gear/blessing spell fire (x1.4/s), mastery melee-to-spell 40%; increased: Ignivar Fire 0.6-0.95 (tag Fire fits), Fire Aura Damage affix 240 (ability-property, 0.3-1.0), Burning/other Spellblade fire DoT nodes (not read, U); more: Eye of Flame +15% (`fw3d:13`, "more" per text), Sorcerer-style mastery more not applicable; Incinerating Aura +1% per 1% uncapped fire res (type unknown).
- Crit or ailment path: none for Fire Aura (DoT, critType 1, A). Ignite on Focus ticks (Burning Aura +50%/pt, A) plus Ignivar +50-150% Ignite chance while channelling (Channelling tag, A) -> ignite is a second DoT (not computed; ailment chance formula not applied, U).
- Penetration and shred: Flame Walker fire res shred +50% chance/s (A); elemental penetration from Graver 12-20%.
- Estimate: ~2,870/s vs dummy; ~370/s vs level-100 monster (level DR 87%, D); inputs illustrative (U).

## 6. Defense plan (le-defense-reasoning)

| Resistance | Target | Sources | Label |
|---|---|---|---|
| Fire | 75% (uncapped for Incinerating Aura) | Grand Heart of the Caldera 55-75, Burning Hands 4%/pt, gear suffix 13 (T5 30-45%) | A/U |
| Cold | 75% | gear suffix 14 (T5 30-45%), Prism Barrier (Focus, while channelling) | A |
| Lightning | 75% | gear suffix 15, Prism Barrier | A |
| Physical | 75% | gear suffix 64, idol/ring | A |
| Void | 75% | gear suffix 26 | A |
| Necrotic | 75% | gear suffix 27 + Vitality | A |
| Poison | 75% | gear suffix 28 + Vitality | A |

- Primary layer: ward (Flame Ward burst + Focus 10 ward/s) and Focus channel mitigation (Iron Stance more armour, Prismatic Stance elemental DR). No block (off-hand is the catalyst). Ward does not benefit from endurance (D).
- Endurance / threshold: base 20% / 0; Grand Embers of Immortality (18-30%) or belt affix 92 (A); target 40% (U).
- Stun and freeze avoidance: not sourced (U). Flame Ward `Astonish` casts it when stunned.
- DoT handling: resistances and ward only (armour does not apply to DoT).
- Sustain: Focus regen/ward, Inner Growth heal, Flame Ward 400 ward burst (A). Which layers do not protect which pool: Focus defences apply only while channelling (so they drop when moving/attacking).

## 7. Mana plan

- Costs per second vs regeneration: Focus 0, Enchant Weapon 20, Flame Ward 25, Flame Reave 20, Teleport 28 (A). Sustained cost is on-demand only; Focus gives +100% mana regen and Flame Drinker returns mana per Fire Aura consumed.
- Interaction with the enabling effect: Ignivar's Fire Aura casts are free, so the engine adds no mana cost.
- Mana before health / negative mana: not used.

## 8. Leveling to endgame

| Level band | Skills | Gear | Switch trigger |
|---|---|---|---|
| 1-9 | Lightning Blast, Fireball (lvl 2), Flame Ward (lvl 7) | campaign | take Spellblade at mastery choice |
| 10-20 | Flame Reave (5), Enchant Weapon (15), Focus (20) | first Fire Aura affixes | Power Vent online |
| 20-50 | add Flame Walker, Incinerating Aura | resist suffixes | Ignivar's Head requires level 50 |
| 50+ | full build; Dilation, Eye of Flame | endgame chase | Herkir's Vessel (76), Dark Shroud (66) optional |

Timeline/dungeon unlocks not checked (U).

## 9. What to test in game first

| # | Test | How to observe | Expected | If it fails |
|---|---|---|---|---|
| 1 | Do overlapping Fire Aura objects stack on one enemy? | training dummy, hold Focus 5 s, watch Fire Aura buff/number of auras and per-second dummy damage | damage grows ~linearly to 4 stacks (4 s window) | If flat at 1 stack, Ignivar's engine is worth 1/4 of the estimate; drop the build or lean on Dilation |
| 2 | Does a held Focus fire Ignivar's trigger? | watch for a Fire Aura every second | yes | If not, the "isUsingChannelledAbility" check excludes buff channels; switch engine to Disintegrate/Ghostflame |
| 3 | Can you move/act while channelling Focus? | try to move | probably not (U) | adjust to Warpath/Smelter's Wrath engine (candidate 4) |
| 4 | Does Eye of Flame (`fw3d:13`) boost Ignivar's Fire Aura? | compare dummy damage with/without the node | +15% | node only affects Flame Ward's own aura |
| 5 | Fire Aura area from Ignivar (+60-95%) | measure radius | increases | reader FireAuraMutator does not use property (notes in JSON say this class does not read it; D?) |
| 6 | Incinerating Aura scaling | vary uncapped fire res, watch Fire Aura damage | +1% per 1% | scaling smaller than assumed |
| 7 | Hit-taken survivability at area 100 | content run, check resistance sheet | all 75% | resistances first |

## 10. Assumptions
Concurrent stacks (4), tick rate (2/s from alt text), illustrative stats (added 40, increased 4.95, more 1.5), Focus counts as a "channelled ability", Power Vent stacks add to Ignivar's, Mage tree budget, idol shapes, blessing availability, Ignite chance formula.

## 11. What could make this fail
Fire Aura stacks not stacking; Focus channel locking movement and uptime; engine only 1 cast/s (c cannot be sped); Mage clear speed too low without a hit skill; ward-based defense collapses when not channelling; Incinerating Aura scaling uncertain.

## 12. Interaction check

| Catalogue entry (heading) | Relevance | Synergy / anti-synergy | Handled how |
|---|---|---|---|
| Ignivar's Head gives free Fire Aura casts while channelling | enabler | synergy | core |
| Ignivar's Head: Disintegrate scales with crit chance it cannot use | stat stick for Disintegrate | irrelevant | build skips Disintegrate |
| Crit does nothing for damage over time | Fire Aura is DoT | anti-synergy | no crit stats |
| Gambler's Fallacy (crit, channel) | anti-synergy for channel crit builds | not used | skip |
| Minion snapshot trap, Holy Aura | not relevant | - | - |

Entries read: lines 114-118, 148-156 (Void Knight echo), 595-601, 665-672, 680-686. Entries tagged `anti-synergy` overlapping channel/aura/dot checked: 3 (listed above). The full anti-synergy sweep over all `anti-synergy` entries was not completed (U).

Q14 drawback sweep (ids 74, 117, 163, 311): 0 rows. Caveat: `tooltip_text` is NULL for uniques 117 and 163 (their effects live in `mods_text`), so the sweep is vacuous for them.

## 13. Data citations

| Claim | Source kind | Id / path | Label |
|---|---|---|---|
| Ignivar's Head mods, base, level | unique | uid 74, `get`, Q1-Q3 | A |
| Free Fire Aura each second while channelling | knowledge / vendored JSON | unique_effects.json uniqueID 74 effects[1]; catalogue.md "Ignivar's Head gives free Fire Aura casts while channelling" | D |
| Fire Aura damage 14 fire, ADE 0.7, 4 s, DoT | ability | `ability_gen98` (index 162) components | A |
| Channelled skill list | abilities | Q4a | A |
| Fire Aura nodes (Eye of Flame, Dilation, Power Vent, Lingering Embers) | skill_node | `fw3d:13`, `fw3d:11`, `sb44eQ:18`, `fr11mv:29`; Q7a | A |
| Spellblade Fire Aura passives | passive_node | `mg-1:38/42/47/74`, Q13 | A |
| Focus description and nodes | ability / skill_node | `vm53dx` | A |
| Fire Aura affixes | affix | 238, 240, 247, 248, 253, 902 | A |
| Optional uniques | unique | uid 117, 163, 311 | A |
| Blessings | blessing | v_blessings (Heart of the Caldera, Embers of Immortality) | A |

Queries run (tool + arguments): `version {}`; `lookup {"name":"Ignivar's Head"}`; `get {"kind":"unique","id":74}`; sql Q1, Q2, Q3 (params as in the cookbook, uid 74); sql Q4a (channelled = 1) and Q4 with mask 8 (Fire); sql ability `ability_gen98` and `ability_components`; sql Q5 for the 8 channelled ids; Q7 with "Fire Aura" and "channel"; Q13 with "Fire Aura"; Q14 with [74,117,163,311]; sql affix/idol/blessing lookups; skill_tree `dig5` (truncated); knowledge greps and `sed` of catalogue.md; read of `vendor/lastepochbuilder/research/data/game/unique_effects.json` (lines 11610-11760).

## Appendix: outline for candidate 4 (second skeleton, short, mostly U)
Sentinel / Forge Guard with Smelter's Wrath (`st4th`): fire+physical melee channel (up to 2 s charge, armour doubled while channelling, ADE 600%/s) (A). Ignivar contributes Fire increased damage to the fire part, +50-150% Ignite chance while channelling, and one Fire Aura per second of charge (at most 2 per cast, so average engine uptime is low, U). Defense: Sentinel armour/block is lost since the off-hand holds the catalyst. Not scored beyond the table; no node/gear detail was queried.

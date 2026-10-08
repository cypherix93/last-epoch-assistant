# Classes and Masteries
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Labels: **A** asset data (vendored), **G** in-game guide, **X** Maxroll/community 2026, **U** unverified/stale.

## Summary
- 5 classes (`classID` 0-4), each with a base class plus 3 masteries (`masteryIndex` 1-3; index 0 = the unspecialised base class). 15 masteries total (A).
- Passive tree ids: `pr-1` Primalist, `mg-1` Mage, `kn-1` Sentinel (internal tree name "Knight"), `ac-1` Acolyte, `rg-1` Rogue (A).
- All classes share identical base numbers (health, mana, regen, stun avoidance, endurance); only starting attributes differ (A, table "Per-class differences").
- Max level 100 (G). Passive points: 98 from levels 3-100 (G) + up to 15 from quests/first dungeon clears = 113 max (X). Skill specialisation slots: 5, unlocked at character levels 4/8/20/35/50 (G, X).
- Mastery is chosen after the Mastery quest; base-class tree points can exceed 20; the first half of every mastery tree is open to any mastery, the second half only to the chosen one (X). The vendored data does not encode where the halves split (see Pitfalls).
- 136 class skills exist (A, derived from `classes.json`): each class has 1 starting skill, 7-8 character-level unlocks, 4 base-tree unlocks and 5 skills per mastery (1 mastery skill + 4 tree-point unlocks).
- Season 5 added the last 3 class skills: Radiant Lance (Paladin), Summon Tide Elemental (Shaman), Dreamslash (Bladedancer) (X, verified in A).
- Mechanics that use these numbers (health/mana formulas, minion scaling) are specified in `../mechanics/stat-model.md` and `../mechanics/minions.md`.

## Class and mastery ids

`masteryIndex` is the value stored in passive-node `requiredMastery`/`mastery` fields and in `masteries[]` of `classes.json`; index 0 is the base class (A).

{{gen:classes.classes_overview}}

### Masteries, mastery skills and base mastery bonuses

The "Mastery skill" is granted on choosing the mastery (A `masteryAbility`). "Base bonuses" are the always-on effects applied when the mastery is chosen (code-derived in the vendored research, `07f_passive_weaver_trees.md` section 2). Field names such as `moreDamagePerPercentHealth` are raw code fields; their exact semantics are not documented in the vendored data (e.g. 0.15 More Damage per percent health, Paladin).

{{gen:classes.mastery_bonuses}}

Mastery themes (X, `maxroll_class-and-mastery-introductions.md`, updated 2026-04-02):

| Mastery | Theme (X) |
|---|---|
| Beastmaster | Companions (revivable pets with own active skills), melee, Physical and Poison; Aspects buffs; more companions |
| Shaman | Totems and spellcasting, Cold and Lightning; totem mana cost reduction, Attunement, elemental resistance while controlling a totem |
| Druid | Transformation forms (Werebear, Spriggan, Swarmblade), stance dancing; +Health and +Mana, damage reduction on leaving a form |
| Sorcerer | Ranged elemental spells (Fire, Lightning, Cold), crits, some Ward; bonuses add mana and spell damage |
| Spellblade | Melee mixed with spells, best Ward generation, generator/spender play |
| Runemaster | Elemental skills create Runes (up to 3, order and element matter) consumed by Runic Invocation; 40 distinct rune spells |
| Void Knight | Void damage, Time Rot, leech, echo copies of used skills; no-shield bonuses |
| Forge Guard | Physical and Bleed, 2H and sword-and-board, throwing, forged-weapon minions; resistances via mastery bonus |
| Paladin | Fire and healing, block, armor, health; spell-with-shield (Adaptive Spell Damage) |
| Necromancer | Minion armies, single strong minions or minion sacrifice; more skeletons and mages |
| Lich | Blood magic, sacrifices own health for power, leech and damage when missing health, Reaper Form |
| Warlock | Damage over time and curses; Fire, Necrotic, Poison, Physical |
| Bladedancer | Melee with throwing support, Shadows, Shadow Daggers (guaranteed crit ailment), Physical and Poison, dodge and glancing blow |
| Marksman | Only mastery that uses Bows and Quivers; Physical, Poison, Fire, Lightning, Cold |
| Falconer | Falcon minion immune to damage; Physical, Poison, Lightning or Fire |

## Base stats (identical for every class)

Source of truth is `classes.json` (`base`, `levelMods`, `formulas`) (A). Value at level L is `base + L x perLevel` (the formula uses L, not L-1: a level-1 character has 110 health) (A).

{{gen:classes.base_stats}}

Per-class differences (the only fields that differ between the five classes) (A):

{{gen:classes.class_diff}}

Attribute effects per point (A `attributes.json`; same in G): Strength +4% increased Armor; Vitality +6 Health and +1% Necrotic and Poison resistance; Intelligence +2% Ward Retention; Dexterity +4 Dodge Rating; Attunement +2 Mana. Corrupted-attribute replacements are in `item-system.md`.

Formulas from `classes.json` (A):
- `Health = RoundHalfEven((baseHealth + L*healthPerLevel + Σadded) * (1+Σinc) * Π(1+more))`; `Mana` same with `manaPerLevel`; `HealthRegen = (healthRegen + L*healthRegenPerLevel + Σadded) * (1+Σinc) * Πmore`.
- `StunAvoidance = baseStunAvoidance + L*stunAvoidancePerLevel (+ mods)` = 250 + 5L.
- `EnduranceThreshold = (1+inc)*((maxMore + enduranceThresholdPerHealth + added) * maxHealth + baseEnduranceThreshold + L*enduranceThresholdPerLevel + added) * more` with `enduranceThresholdPerHealth` 0.2 (= 20% of max health).

Conflict: the in-game guide text says +8 health and +0.125 health regen per level in one paragraph and +10 health in another (G, `Levels_1` vs `HealthAndRegen_1`); asset data says +10 health and +0.14 regen per level (A). Use A.

### Minion scaling and hidden base modifiers

{{gen:classes.minion_hidden}}

Note: the guide text (G) says minions get 0.6% more damage and 0.8% damage reduction per level from level 26 (45% / 60% at level 100); the asset (A) stores `moreMinionDamagePerLevel` = 0.008. The two disagree on the damage figure; the mechanics page decides which to apply.

### Starting equipment

{{gen:classes.starting_items}}

## Passive points and tree structure

- Passive point sources: 1 per level from level 3 to 100 = 98 (G `Levels_2`); up to 15 quest-reward points; maximum total 113 (X `maxroll_passives-and-skills.md`). First completion of a dungeon grants 2 passive points and 1 idol slot (G `Dungeons_Paragraph_4`); the world map caps the total obtainable quest rewards, and more quests than the cap offer them (G `WorldMap_Paragraph_11`).
- Season 5 quest changes (X patch notes): defeating Majasa and The Observer no longer gives +1 to all attributes; collecting 5 Knowledge of Orobyss now gives +2 to all attributes; defeating The Observer gives +1 passive point.
- Every class has a base tree plus 3 mastery trees (X). Tree node counts (A, `passiveTree.nodesPerMastery`) are in the class table above; totals per tree are 103-111 nodes.
- Mastery trees unlock after the Mastery quest (X). "You can allocate passives on the first half of all masteries regardless of the one you chose but the second half is only available for the one you picked" (X). Points beyond 20 may be put in the base tree (X).
- Node unlock progression: each node has `masteryRequirement` = points that must already be spent in the tree (the "golden progress bar") (A field, X meaning). Observed values: base tree 0-25 in steps of 5; mastery panels 0-45 in steps of 5 (A):

{{gen:misc.passive_thresholds}}

- Respec rules (X `maxroll_respec-guide.md`): Chronomancer Lerinne (End of Time / Council Chambers) removes passive points one at a time for gold (cost grows with points in the node) or respecs the mastery; you cannot remove a point if it breaks a threshold of a deeper node; you cannot remove more than 20 points from the base tree while any mastery tree has points. Re-spending is free of re-levelling.

## Skills per class and how they unlock

Unlock sources (A, `classes.json`): `defaultAbilities` (the skill known at start), `unlockableAbilities[].level` (inferred as character level, consistent with G "skills can be unlocked upon reaching certain character levels"), `masteries[0].abilities[].level` (points spent in the base tree) and `masteries[i].abilities[].level` (points spent in that mastery tree; confirmed by X for the S5 skills: Radiant Lance "15 points in the Paladin passive tree", Summon Tide Elemental "30 points in the Shaman passive tree", Dreamslash "10 points in the Bladedancer passive tree"). `masteryAbility` is the mastery's signature skill, granted when the mastery is chosen.

{{gen:classes.skill_counts}}

All skills (A; `Tags` from `abilities.json`, empty means the ability record carries no damage/skill tag such as Minion; `Cooldown` = 1/`chargesGainedPerSecond`, shown only for skills with a charge cooldown; `Skill-tree nodes` = nodes in the skill's specialisation tree):

{{gen:classes.skills}}

Every class also has a `basicAttackReplacer` (Swipe, Mana Strike, Rive, Harvest, Puncture for classes 0-4; they are also unlockable skills at character level 5) and the universal Evade movement ability (G: 2 charges, 4 s cooldown).

## Season 5 new skills (X patch notes verified against A)

| Skill | Class / mastery | Unlock | Key numbers |
|---|---|---|---|
| Radiant Lance (`ra1an`) | Sentinel / Paladin | 15 points in Paladin tree | Requires shield; beam; mana 24; no cooldown; added damage effectiveness 500% (A `addedDamageScaling` 5, X); base Lightning 100 (A); +4% increased damage per Attunement; 1% more damage per 1% uncapped block chance (X); tags Lightning, Spell (A) plus Area, Attunement (X); 32 tree nodes (A) |
| Summon Tide Elemental (`su3lem`) | Primalist / Shaman | 30 points in Shaman tree | Mana 15, cooldown 4 s (A, X); single permanent cold-spell minion with 400 base health, +16 health per level, +16 health and +4% increased damage per Attunement; minion spells use 200% (projectile) and 400% (Geyser) added-damage effectiveness (X); 31 tree nodes (A) |
| Dreamslash (`dr4sl`) | Rogue / Bladedancer | 10 points in Bladedancer tree | Needs melee weapon; mana 3; no cooldown; added damage effectiveness 150% (A 1.5, X); base Physical 2 (A); +4% increased damage per Dexterity; dash then slash; Shadows perform it too (X); tags Physical, Melee (A) plus Area, Movement, Dexterity (X) |

Season 5 patch note summary: "Paladin, Shaman, and Rogue receive new Skills, officially giving all Classes their full Skill List" (X).

Representative skill records from `abilities.json` (including the three new skills) are shown in `skills-and-trees.md`.

## Pitfalls
- `classID` order (Primalist 0, Mage 1, Sentinel 2, Acolyte 3, Rogue 4) differs from the internal tree-name order (Knight, Acolyte, Mage, Primalist, Rogue); Sentinel's passive tree is named "Knight" with id `kn-1` (A).
- `masteryIndex` 0 means the base class, not "no data": mastery 1-3 ids are shifted by one relative to a 0-based list of the three masteries.
- Mastery-panel node data marks every node of a panel with `requiredMastery` equal to that panel (A: e.g. kn-1 mastery 1 has 31 nodes all `requiredMastery`=1), which does not by itself express the "first half is open to all masteries" rule stated by Maxroll (X). The split point is not in the vendored data; do not assume it.
- Level thresholds of mastery skills are passive points spent in that tree, not character levels; the `unlockableAbilities[].level` numbers are character levels (inferred).
- Guide text vs asset: per-level health (8 vs 10) and regen (0.125 vs 0.14); minion scaling (0.6% vs 0.8%). Prefer A.
- Maxroll "exclusive skills" lists name only some of each mastery's skills; the others are still listed under the mastery in `classes.json` and are unlocked by tree points. Whether another mastery of the same class can use them is not stated in any source (U).
- Minimum skill level unlock levels differ: G lists 8/12/17/24/32/40/50/60/70; Maxroll (2026-04-02) lists 10/15/20/30/40/50/60/70/80 with a cap of 10 (X). G is the 1.5.0 text; treat X as unverified.

## Sources
- `vendor/lastepochbuilder/research/data/game/classes.json` - class ids, base stats, levelMods, formulas, masteries, abilities, starting items (A).
- `vendor/lastepochbuilder/research/data/game/passive_node_effects.json` - mastery base bonuses (A, code-derived).
- `vendor/lastepochbuilder/research/data/game/abilities.json`, `trees.json` - skill tags, mana cost, cooldown, tree node counts, passive thresholds (A).
- `vendor/lastepochbuilder/research/data/game/items.json` - starting equipment names (A).
- `vendor/lastepochbuilder/research/07a_assets_core_data.md`, `07f_passive_weaver_trees.md` - interpretation of fields (A).
- `vendor/corpus/ingame_guide_1.5.0.txt` - levels, passive points, specialisation slots (G).
- `vendor/corpus/maxroll_class-and-mastery-introductions.md` - mastery themes (X).
- `vendor/corpus/maxroll_passives-and-skills.md`, `maxroll_respec-guide.md` - 113 points, tree halves, respec rules (X).
- `vendor/corpus/maxroll_season5_patch_notes_maxroll.md` - new skills, quest reward changes (X).

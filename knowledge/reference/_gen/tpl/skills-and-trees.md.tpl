# Skills, Skill Trees, Passive Trees and the Weaver Tree
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Labels: **A** asset data (vendored), **G** in-game guide, **X** Maxroll/community 2026, **U** unverified/stale.

## Summary
- A character equips 5 skills; each equipped skill can be "specialised" (5 specialisation slots unlocked at character levels 4/8/20/35/50) so it levels (natural max 20) and receives skill-tree points; unspecialised skills can be used but have no tree (G, X).
- Skill level: +1 skill point per skill level up to 20 (X); levels from items (`+Level of Skills`, body armor, helmets, relics, uniques, sets) exceed 20; unequipping removes those points unless enough points are unspent (G).
- 144 skill trees (136 active), 5 class passive trees and 1 Weaver tree are defined in Global Tree Data (A). Node data: `maxPoints`, prerequisites, mastery gating, `noScalingType` (A).
- Skill base damage, crit, added-damage effectiveness (ADE) and ailment chances are not in the `Ability` asset but in the ability prefab components `DamageEnemyOnHit` (`baseDamageStats`) and `ChanceToApplyAilmentsOnHit` (A, `07b_assets_abilities_trees.md`).
- Node effect *types* (added / increased / more) are in game code (`<Skill>Tree.updateMutator`), not the tree asset; the vendored `skill_node_effects.json` and `passive_node_effects.json` hold resolved effects (A, `07c`, `07f`).
- Skill trees mostly use MORE for damage; passive trees mostly use INCREASED (A, `07c`, `07f`). Always read the effect `kind`, not the tooltip wording.
- The Weaver tree does not change the character; it tunes Monolith echo content. 79 nodes with points, 173 total node points, but only 53 points can be earned (A, X).
- Core damage/ailment/defense formulas are in `../mechanics/damage-pipeline.md`, `../mechanics/ailments.md`, `../mechanics/speed-cooldowns-mana.md`.

## Skill specialisation, levels and respec

| Rule | Value | Label |
|---|---|---|
| Specialisation slots | 5 (match 5 action-bar skills); unlock at character levels 4, 8, 20, 35, 50 | G, X |
| Natural max skill level | 20 (reached around character level 75) | G, X |
| Skill points | one per skill level (to 20) + item-granted levels | X |
| Item level bonus | `+N` skill-level affixes on body armor, helmets, relics, uniques, sets; shown blue above the XP bar; can exceed 20 | G |
| Removing a levelling item | removes points from the skill unless unspent points >= levels lost; affected nodes are highlighted red | G |
| Minimum skill level | newly specialised skill is set to it, with an XP catch-up bonus; G: increases at levels 8/12/17/24/32/40/50/60/70; X (2026-04): unlocks at 10/15/20/30/40/50/60/70/80, cap 10 | G, X (conflict) |
| Respec points | Respec button in the skill tree: "Remove Points" (nodes cannot be removed if a dependent node would lose requirements); below the minimum specialised level points are returned immediately, above it must be re-levelled; item-granted points re-invest at no cost | X |
| Despecialise | clears the skill from the slot so another skill can be chosen | X |
| Unlocking skills | by character level, by passive points in a tree, or by choosing a mastery (see `classes-and-masteries.md`) | G |

## Ability record fields (`abilities.json`)
1044 ability records: {{gen:misc.ability_categories}}

Key fields (A, meanings from `07b_assets_abilities_trees.md` section 2.1 unless marked):

| Field | Meaning |
|---|---|
| `playerAbilityID`, `key`, `abilityIDEnum` | Public id (e.g. `fi9`), asset key and `AbilityID` enum value |
| `category` | `player`, `nodeGranted`, `sub`, `minion`, `minionSub`, `abilityIdOnly` (used by code/items/monsters) |
| `tags` + `tagNames` | AT bitmask (table below); `fakeTags` extra display tags |
| `skillTreeConversionDamageTags` | AT damage types the skill tree can convert base damage into (Fireball: Lightning via Plasma Ball) |
| `useDelay`, `useDuration` | Timing in seconds at base speed (Fireball 0.27 / 0.75); `useDuration` is one use; `useDelay` is the point where the effect fires (inferred, U) |
| `speedScaler` / `speedScalerName` | SP 2 AttackSpeed, 3 CastSpeed or 54 None; throws use AttackSpeed without a weapon speed multiplier |
| `speedMultiplier`, `maximumUseSpeed`, `hasMinimumUseDuration`, `minimumUseDuration`, `speedScalerAppliedAsIncrease`, `speedScalerEffectiveness`, `instantCastForPlayer` | Speed shaping fields (semantics in `../mechanics/speed-cooldowns-mana.md`) |
| `manaCost`, `minimumManaCost`, `freeWhenOutOfMana`, `manaCostPerDistance` | Mana cost parameters |
| `channelled`, `channelCost`, `noManaRegenWhileChanneling`, `channelTimeLimit` | Channelled skills (cost per second) |
| `maxCharges`, `chargesGainedPerSecond`, `cooldown`, `sharedCooldown` | `cooldown` is derived = 1/`chargesGainedPerSecond`; charge model, not a timer |
| `companion`, `minionsUseAbility`, `isTransform`, `traversalSkill`, `evadeSkill`, `countsAsMovementAbility` | Behaviour flags |
| `requireWeaponType`, `permittedWeaponTypes`, `requiresSheild`, `requiresDualWielding` | Weapon requirements (note the asset spelling `requiresSheild`) |
| `attributeScaling` [{attribute 0-4, stats[]}] | Per attribute point stat gain, usually +0.04 increased damage (4%) per point; attribute ids: 0 Strength, 1 Vitality, 2 Intelligence, 3 Dexterity, 4 Attunement |
| `levelScaling` [{stats[]}] | Per skill level stats (empty for most) |
| `statsDuringUse`, `statsSource` | Stats applied while the skill is in use |
| `abilityPrefab` | Prefab root holding `damage[]`, `ailmentsOnHit[]`, `summons[]` |
| `damage[]` / `primaryDamage` | `DamageEnemyOnHit` and similar components: `damage[7]` ordered Physical, Fire, Cold, Lightning, Necrotic, Void, Poison; `critChance`, `critMultiplier`, `isHit`, `addedDamageScaling` (ADE), `cullPercent`, `increasedStunChance`, `freezeRate`, `additionalLeech`, `convertAllAddedDamage`/`damageTypeToConvertTo`, `penetration[]`, `conditionalEffects[]`, `damageTags`, `damageModifier`, `distanceScaling` |
| `ailmentsOnHit[]` | `ChanceToApplyAilmentsOnHit.ailments[{ailment, chance, rolledSeparately, damageModifier, increasedDuration, increasedEffect}]`, e.g. Fireball Ignite chance 0.4 |
| `summons[]`, `subAbilities[]`, `parents[]`, `minionActors[]` | Links to minions and spawned abilities; many hits are in sub-abilities (Meteor -> MeteorAoe fire 240, ADE 12) |
| `mutator` | The `<Skill>Mutator` component on the player prefab (heuristic match by `abilityRef.key` or class name) |

ADE rule for abilities defined in code (A, `07f` section 7): `ADE = isWeapon ? 1.0 : 0.05 x sum(base damage)`; a code-built hit gets 5% crit chance and 200% multiplier; a non-hit gets the DoT tag. 54 of 182 player abilities have no `damage[]` in the asset (Anomaly, Snap Freeze, Abyssal Echoes, Bone Curse, Spirit Plague, Aura of Decay, ...) because damage comes from ailments, mutators or sub-abilities.

Representative records (A, `abilities.json`, includes the three Season 5 skills):

{{gen:misc.ability_examples}}

Radiant Lance matches the patch text (mana 24, 500% ADE, Lightning); Dreamslash matches 150% ADE and mana 3 (X patch notes).

### Skill tags (AT bitmask)

Used in `tags`, `skillTreeConversionDamageTags`, stat `tags` and damage `damageTags`. A stat tagged with a subset applies to a skill that has all those bits; the Elemental bit is a special rule (matches Fire, Cold, Lightning) (A, `07a_assets_core_data.md` 1.1).

{{gen:misc.at_tags}}

Other enums (A):

{{gen:misc.small_enums}}

## Skill tree node structure (`trees.json`, `tree_node_stats.json`)

{{gen:misc.tree_overview}}

Fields per node (A, `07b` section 2.4/2.5): `id`, `name` (internal; code switches on this name, renaming breaks the node), `displayName`, `maxPoints`, `requiredMastery`, `masteryRequirement`, `requirements[{nodeID, requirement}]`, `description`, `position` (UI anchor), `panel`, `mastery`, `noScalingType`, `noScalingPointThreshold`, `abilityGrantedByNode`, `hasUI`, `notInUINodeList`.

{{gen:misc.node_stats}}

{{gen:misc.skill_tree_sizes}}

- **Root and prerequisites**: every skill tree has a root node (`maxPoints` 0 in 144 trees) that other nodes require at 0 points. `requirements` lists prerequisite node ids with the points needed in each (e.g. Immolated Core needs 1 point in node 2). Whether a node needs all or any listed prerequisite is not stated in the vendored text; the tree shapes suggest any one connected prerequisite suffices (U).
- **Max points**: skill nodes mostly 1, 3, 4 or 5 points; passive nodes mostly 5, 6, 8 or 10; Weaver nodes 1-5 (distribution above).
- **Mastery fields**: skill trees have `requiredMastery` 0. Passive nodes: `mastery` is the panel (0 base, 1-3 masteries); `requiredMastery` equals the panel index for mastery panels; `masteryRequirement` is points spent in the tree needed to unlock (see `classes-and-masteries.md`).
- **`noScalingType`** (A + LE Tools format in `03_le_data_sources.md`): 0 = `SinglePoint`, 1 = `PointThreshold` with `noScalingPointThreshold` N. Stat lines flagged `noScaling` do not scale per point: they apply as a lump when the threshold is reached (e.g. "+9% at 3 points"), while the other lines are `value x points`. `null` appears on 148 skill nodes (roots/no UI).
- **Per-point values** come from `tooltipStats[].num` (hint magnitudes, reliable for magnitude, A) while the modifier type and scope come from code (`skill_node_effects.json`, `passive_node_effects.json`). `NodeTooltipStat.property` encoding: `< 5000` = SP id (`sp_enum.json`); `5000-9999` = index into the Node Tooltip Property List (e.g. 5000 "Extra Projectiles"); `>= 10000` = `AilmentID` + 10000 (10001 Ignite); property 54 (None) = display text only (A).
- **Automatic node stats**: only 31 UI nodes (32 in GTD `nodeStatsData`) carry real `AutomaticNodeStat` entries (`property`, `specialTag`, `tags`, `extraTag`, `modType`, `value`, `scaling` PerPoint/None/Threshold); `NodeStatApplication` per SP id (Default/Global/OnCast/OnCastPreMutation) decides where the stat applies (A).
- **Resolved effect statuses for skill trees** (A, `07c`): `auto` 3568, `auto_combined` 212, `auto_formula` 29, `conditional` 2, `manual` 5, `none` 4. Stat types created by skill nodes: added 725, more 521, increased 191, ailment chance 162, ailment conversion 42, ailment duration 20; for damage specifically more 429, added 79, increased 38 (A).
- **Triggered and granted abilities**: 805 nodes carry `abilityGrantedByNode` (755 skill + 50 passive) and 189 `nodeGranted` abilities exist (e.g. Flame Burst, Spreading Flames, Healing Hands cast by Radiant Lance "Long Hands"); it is a link for the tooltip more than a proof of a separate cast (A, `07b`). Cooldowns/charges of such sub-skills are in their own ability records.
- **`relatedAbilities`** (LE Tools node format, `03_le_data_sources.md`): list of `playerAbilityID`s a node references (e.g. passive mg-1 node 5 lists `te44` Teleport and `sw31a` Snap Freeze), alongside `relatedAilments`, `triggeredAbilities`, `triggeredAilments`. The vendored `trees.json` exposes the same information as `abilityGrantedByNode` and in `tree_node_stats.json propertiesForAltText`; there is no `relatedAbilities` key in the vendored files (A).
- **Effect code facts** (A, `07c`): inside a node block points scale linearly (`p x k`); different nodes writing the same local add up; non-linear combination happens after the loop (`after_loop.formulas`); fixed `flat` effects can exist on nodes with several points; mutator field names do not tell the modifier type.

## Passive tree node structure and effects

- 5 passive trees: kn-1 (110 nodes), ac-1 (109), mg-1 (108), pr-1 (111), rg-1 (103) (A); structure and thresholds per panel are tabulated in `classes-and-masteries.md`.
- 541 nodes, 0 without effect; effect statuses `auto` 312, `auto_threshold` 226 (bonus at `p >= N`), `auto_formula` 2 (non-linear in p), `auto_after_loop_rule` 1 (Rogue Marksman Concentration) (A, `07f`). Stat kinds in `passive_node_effects.json`: `added`, `increased`, `more`, `ailment_chance`, `ailment_duration`, `ailment_effect`, `ailment_effect_on_you`, `conditional_more_damage`, `player_property`, `more_player_property`, `ability_property`, `more_ability_property`, `ailment_conversion`.
- Tooltip wording is not a reliable guide to the type: "Increased/Reduced X" are INC (179 of 180), "More/Less X" are MORE (15 of 15), "+N" is added in 284 lines but not always, "+N%" for speeds/costs is increased (21), "Damage Taken ..." lines are MORE (A, `07f` section 3). Read `stat.kind`.
- Known tooltip/code divergences (code authoritative, A `07f` section 4): Void Knight "Health And Void Protection" health tooltip +8 vs code 10 per point; Mage "Armor And Ward Per Second" ward tooltip +3 vs 4; Shaman totem stun-immunity armor +10 vs 30; Rogue Bladedancer "Parry And Crit" crit 8% vs 10%; "Poison And Bleed" DoT 7% vs 8%; Falconer throwing/spear/slow nodes 6-7% vs 5%.
- Leech tooltips are 10x the stat value (`HealthLeech` weighs 0.1) (A).
- Season 5 passive fixes (X patch notes): Beastmaster Aspect modifiers (Lynx/Viper) no longer use the Shark modifiers; Serrated Claws threshold no longer scales with points; Druid Fetid Resilience no longer gives DoT reduction while transformed; Shaman Ironbark totem regen cap; Swirling Maelstrom 5%-per-point chance fixed; Marksman and others re-balanced (see patch notes sections by class).

## Weaver tree

- GTD version 9 / UI version 10; node 0 is the root ("Beginning of the web"); 79 nodes have points; sum of `maxPoints` = 173 but only 53 Weaver Points exist (A, X).
- Points (X, `maxroll_weaver-tree-strategies.md`): Woven faction ranks give 13 (ranks 1-8: 1 each, rank 9: 2, rank 10: 3); Woven Echoes give 1 point each, except Tomb of Vessels and The Fading Brink at 2 each; 34 echoes are bought with Memory Amber at faction ranks 1-10, 4 more drop (Collapsing Horizon 20-40% from Timeline bosses, The Fading Brink 10-20% from Harbingers, Rune Prison Complex 1-2% from Exiled Mages at level 90+, Vault of the Barnacle King 16.5-30% from purple lizards). The tree can be respecced any time with Memory Amber (G, X).
- Effect: Weaver nodes write `TheWeaver.<field>` values (drop chances, spawn rates, flags); they do not affect character stats (A, `07f` section 5). Node effects are in `weaver_node_effects.json` (79 nodes `auto`; three nodes use `p x TheWeaver.<X>PerPointAllocated` with values from tooltip: 0.15, 0.10, 0.02; nodes 6/7/8 reward-rank weights and node 42 not fully resolved) (A).
- Node id groups (A, derived from the table below): 1-5 replace a reward type in echoes; 6-13 new reward types/drop piles; 21-25 arena/beacon; 41-46 imprint slots; 51-64 stability, exiled mages, dungeon keys, Weaver's Will drops, misc; 101-105 Weaver's Will, Nemesis, amber, mage drops, boss echo duplication; 121-131 Tombs and Cemeteries; 151-156 Loot Lizards; 161-168 Champions; 181-191 Rift Beasts, Omens, Rage of Morditas (Ubiquity of Rage 189, Seekers of Ice and Blood 190, Portents of Blood 191, added in S5).
- Strategies (X): Starter (maximise Woven Echo drops: Champions drop Woven Echoes with Woven Fortunes, Mage Bane), General End Game (Champions and Loot Lizards for exalted items, Age of Beasts, Fated Nemesis), Experience and Favor (Memories of the Observer; Lostwood Folly + Cemetery of Reweaving nests), Nemesis Farming (Conquered Tower imprints, Warden of the Dead), Rift Beast Farming (Age of Beasts, Primordial Ambush, Nesting Grove/Rampant Coast imprints), Omen Window Farming (Plentiful Windows, Inescapable Omens, Omen's Veil with 3 Greater Omen Windows), Boss Farming (imprint Collapsing Horizon / Confluence of Oblivion / Tomb of Vessels / Champions' Colosseum; Warden's Echo; Vaulted Keychain), Weaver's Will Unique Farming (Prime Weaver, Woven Treasures), Exiled Mage Farming (Rune Prison Complex imprint, Graveyard Prisons, Exiled But Not Forgotten). Fury and Fortune (all rares permanently Enraged: +35% movement speed, +60% attack and cast speed; more Runes and Glyphs) is on every strategy and needs Warden's Echo.
- Imprint slots: Equipment imprint nodes (Commoner's/Sealed/Echoing/Warlord's Riches) and Woven Echo imprint nodes (Woven/Loomed Riches) (A). Two copies of the same Woven Echo imprint give no extra chance; prefer two different echoes; imprinted echoes spawn mostly within 10 echoes of the web centre because Shade echoes compete beyond that (X).

All Weaver nodes (A, `trees.json`; "Requires" lists prerequisite node ids; inferred any-of, U):

{{gen:misc.weaver_nodes}}

## Pitfalls
- A node's modifier type is not in `trees.json`; using `tooltipStats` alone will classify "+N%" or "N% increased" wrongly. Use the effect JSONs (kind added/increased/more).
- Many skill-tree "increased" lines behave as MORE; passive-tree damage uses INCREASED far more often (A).
- `noScaling` stat lines apply once at the threshold; do not multiply them by points.
- Skills with `damage[]` empty are not damageless: check ailments, mutators (`abilities_code_damage.json`) and sub-abilities.
- `cooldown` is derived from `chargesGainedPerSecond`; multi-charge skills regenerate charges, not a timer.
- Node renames break code lookup (code keys on `name`); `displayName` is for UI only.
- Weaver points cap (53) is far below the node-point sum (173): plan builds around the strategies above.
- `relatedAbilities` does not exist in the vendored data; use `abilityGrantedByNode`.
- Minimum-skill-level thresholds disagree between G and X; do not hard-code.

## Sources
- `vendor/lastepochbuilder/research/data/game/abilities.json`, `trees.json`, `tree_node_stats.json`, `skill_node_effects.json`, `passive_node_effects.json`, `weaver_node_effects.json`; `vendor/lastepochbuilder/research/data/stat_tag_enums.json`, `sp_enum.json` (A).
- `vendor/lastepochbuilder/research/07b_assets_abilities_trees.md`, `07c_skill_mutators.md`, `07f_passive_weaver_trees.md`, `03_le_data_sources.md` - field meanings, node effect statuses, Weaver (A).
- `C:\Users\Genesis\AppData\Local\Temp\claude\D--src-last-epoch-assistant\2a02c54d-b8b3-416e-bc0a-3ef48c1c23fd\scratchpad\corpus\ingame_guide_1.5.0.txt` - specialisation, skill levels, Weaver tree summary (G).
- `C:\Users\Genesis\AppData\Local\Temp\claude\D--src-last-epoch-assistant\2a02c54d-b8b3-416e-bc0a-3ef48c1c23fd\scratchpad\corpus\maxroll_passives-and-skills.md`, `maxroll_respec-guide.md`, `maxroll_weaver-tree-strategies.md`, `maxroll_season5_patch_notes_maxroll.md` - slots, respec, Weaver points and strategies, S5 fixes (X).

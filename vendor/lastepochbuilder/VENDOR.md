# Vendored: weksil/LastEpochBuilder

- Source: https://github.com/weksil/LastEpochBuilder (branch `main`)
- Commit SHA: `125c65672d2a057bff42822eceb79c6c503105cb`
- Vendor date: 2026-10-08
- Game version targeted by the data: **1.5.0 (Season 5, "Rage of the Frostborn")** (TECH_README.md line 10)

## License note

Upstream code and documentation are MIT licensed (see `LICENSE`). The extracted game data (`research/data/**`, `research/02_assets/**`, `client/data/**` derived from it) is NOT covered by that license: it belongs to Eleventh Hour Games. Kept here for personal, offline reference use only.

## Vendored

Fetched file-by-file from raw.githubusercontent.com at the SHA above (72 files, about 42 MB, no LFS pointers):

- `LICENSE`, `README.md`, `TECH_README.md`, `PLAN.md`, `BACKLOG.md`
- `research/*.md` (17 files), `research/02_assets/*.txt` (3 files)
- `research/data/**/*.json` (42 files: `research/data/game/*.json`, `sp_enum.json`, `stat_tag_enums.json`, `monster_level_damage_reduction.json`)
- `client/docs/ENGINE.md`, `client/docs/UI.md`
- `client/data/*.json` (3 files)

## Deliberately excluded

`client/assets`, `client/addons`, `client/scripts`, `client/scenes`, `client/theme`, all png/webp/jpg and every other file in the repo (about 5,160 of 5,235 blobs). Note: research docs reference `06a`-`06d`, `dump/`, and `tools/` which are not in the repo's research/ dir and are not vendored.

## Markdown / text files

- `README.md`: user-facing landing page for the web build of Last Epoch Builder.
- `TECH_README.md`: developer docs: data sources, architecture, checks, release build; states game version 1.5.0.
- `PLAN.md`: verdict and implementation plan for the builder (dated 2026-10-03).
- `BACKLOG.md`: deferred tasks list.
- `research/01_pob_architecture.md`: study of Path of Building (PoE1/PoE2) architecture as a model for an LE planner.
- `research/02_le_formulas.md`: research report on Last Epoch damage and defense formulas, with confidence tags.
- `research/03_le_data_sources.md`: survey of Last Epoch game data sources (1.5.x, Unity 6000.4.8f1 IL2CPP).
- `research/04_le_character_import.md`: options and feasibility of importing a character (save files, lastepochtools).
- `research/07a_assets_core_data.md`: game data from assets: classes, attributes, properties, monsters, ailments, items (schemas for research/data/game).
- `research/07b_assets_abilities_trees.md`: abilities, passives and Weaver trees read from asset bundles.
- `research/07c_skill_mutators.md`: how skill tree nodes modify skills via mutators (produces skill_node_effects.json).
- `research/07d_minions_uniques.md`: stat transfer to minions and special effects of unique/set items.
- `research/07e_save_format.md`: 1.5.0 offline save format (character JSON plus binary item blobs).
- `research/07f_passive_weaver_trees.md`: class passive trees, Weaver tree and code-defined ability damage.
- `research/07g_mutator_semantics_AL.md`: semantics of skill mutator fields A-L.
- `research/07h_mutator_semantics_MZ.md`: semantics of skill mutator fields M-Z.
- `research/07i_unique_formulas.md`: formulas for special effects of unique and set items.
- `research/07k_wave4_verification.md`: verification pass over ambiguous ("D?") records.
- `research/07l_holy_aura.md`: Holy Aura active buff and passive aura model.
- `research/07m_final_residue.md`: resolution of the final 46 unresolved mutator fields / unique effects.
- `research/07n_defense_conversions.md`: damage-taken conversions, dodge/block conversions, conditional defenses, leech, on-hit gains.
- `research/02_assets/ailment_data_v1.5.0.txt`: one line per ailment (id, duration, damage, tags, buffs).
- `research/02_assets/ingame_gameguide_en_v1.5.0.txt`: in-game GameGuide localization strings (English).
- `research/02_assets/property_ids_v1.5.0.txt`: property id index with rounding flags and names.
- `client/docs/ENGINE.md`: specification of the GDScript calculation engine (formulas from research 06a-06d, 07a, 07b).
- `client/docs/UI.md`: contract for the Godot UI scripts.

## JSON files

- `client/data/buff_skill_models.json`: keys: _comment, Holy Aura, Symbols of Hope, Enchant Weapon, Firebrand, Aura Of Decay, Dark Quiver
- `client/data/field_models.json`: keys: AbyssalEchoesMutator.abyssalDecayAdditionalSpreadTargets, AbyssalEchoesMutator.abyssalDecayBlinds, AbyssalEchoesMutator.abyssalDecayIncreasedSpreadRange, AbyssalEchoesMutator.abyssalDecayNotConsumedOnHit, AbyssalEchoesMutator.abyssalDecaySpreads, AbyssalEchoesMutator.addedChains, AbyssalEchoesMutator.addedChainsForEchoCasts, AbyssalEchoesMutator.addedHealing, ... (4890 keys)
- `client/data/unique_effect_models.json`: keys: gameVersion, source, schema, player, ability, component; source: Hand-written client planner models (not extracted data; lives in clien; gameVersion 1.5.0
- `research/data/game/abilities.json`: top-level array, 1044 records
- `research/data/game/ability_projectiles.json`: keys: ChannelledHungeringSouls, DetonatingArrow, Fireball, HammerThrow, HungeringSouls, IceBolt, IceRune, IceThorns, ... (27 keys)
- `research/data/game/ability_property_fields.json`: keys: gameVersion, source, schema, problems, data; source: GameAssembly.dll AbilityStatsMutatorManager.UpdateAbilityStats @0x1824; gameVersion 1.5.0; data: 490 records
- `research/data/game/ability_property_fields_c.json`: keys: gameVersion, source, unresolvedWrites, data; source: decomp_extra/AbilityStatsMutatorManager__UpdateAbilityStats.c (brace-t; gameVersion 1.5.0; data: 2242 records
- `research/data/game/actor_scaler.json`: keys: gameVersion, source, schema, data; schema: see research/07a_assets_core_data.md §actor_scaler; source: ActorScaler static arrays (global-metadata.dat field default blobs) + ; gameVersion 1.5.0
- `research/data/game/affixes.json`: keys: gameVersion, source, schema, valueModel, affixEffectModifierSource, data; schema: see research/07a_assets_core_data.md §affixes; source: MasterAffixesList.asset (AffixList); gameVersion 1.5.0; data: 1156 records
- `research/data/game/ailments.json`: keys: gameVersion, source, schema, damageTypeOrder, shrineBuffs, listCount, integrity, data; schema: see research/07a_assets_core_data.md §ailments; source: LE:Ailment assets + AilmentList.asset; gameVersion 1.5.0; data: 149 records
- `research/data/game/attributes.json`: keys: gameVersion, source, schema, formula, data; schema: see research/07a_assets_core_data.md §attributes; source: CoreAttribute assets referenced by Global Player Properties; gameVersion 1.5.0; data: 5 records
- `research/data/game/blessings.json`: keys: gameVersion, source, schema, timelines, data; schema: see research/07a_assets_core_data.md §blessings; source: MasterItemsList base type 34 (Blessing) + MonolithTimeline difficultie; gameVersion 1.5.0; data: 224 records
- `research/data/game/boss_attacks.json`: keys: gameVersion, source, schema, data; schema: boss_attacks.json: per boss ActorData, every ability that references/b; source: PermaLoad.bundle Ability/ActorData + boss actor prefab bundles + abili; gameVersion 1.5.0; data: 19 records
- `research/data/game/boss_ward.json`: keys: _schema, defaultBreakpoints, globalPlayerProperties, data; data: 200 records
- `research/data/game/character_mutator_init.json`: keys: source, init, procTimeTrackers, stats; source: CharacterMutator..ctor ISIL (linear tracking)
- `research/data/game/classes.json`: keys: gameVersion, source, schema, hiddenBaseMods, formulas, data; schema: see research/07a_assets_core_data.md §classes; source: CharacterClass assets via Character Class List (AssetBundles/PermaLoad; gameVersion 1.5.0; data: 5 records
- `research/data/game/conditional_defenses.json`: keys: gameVersion, source, schema, slotMap, convertDamageTaken, conversions, conditions, delayedDamage, leech; source: dump/decomp/LE.dll/ProtectionClass.c (ConvertDamageTaken @0x181124B30,; gameVersion 1.5.0
- `research/data/game/global_player_properties.json`: keys: gameVersion, source, schema, data; schema: see research/07a_assets_core_data.md §global; source: Global Player Properties + MasterPropertyList/PlayerPropertyList/Abili; gameVersion 1.5.0
- `research/data/game/holy_aura_model.json`: keys: gameVersion, skill, sources, constants, defaultStats, X, pipeline, nodes, examples, conflict_resolution; gameVersion 1.5.0
- `research/data/game/idols.json`: keys: gameVersion, source, schema, containerGrids, gridLegend, idolAffixIds, data; schema: see research/07a_assets_core_data.md §idols; source: MasterItemsList (idol base types 25-33, altar 41) + Resources/IdolsCon; gameVersion 1.5.0; data: 10 records
- `research/data/game/item_procs.json`: keys: gameVersion, abilityPropertyProcs, source, schema, data; schema: unique, uniqueID, source, ppIndex?, propertyName, abilityID, abilityEn; source: CharacterMutator PlayerProperty handlers (ISIL/C) + UniqueItemComponen; gameVersion 1.5.0; data: 38 records
- `research/data/game/items.json`: keys: gameVersion, source, schema, nonEquippable, equipmentTypeEnum, globals, disabledBaseTypesToRoll, note, data; schema: see research/07a_assets_core_data.md §items; source: MasterItemsList.asset (ItemList.EquippableItems / nonEquippableItems); gameVersion 1.5.0; data: 41 records
- `research/data/game/minion_actors.json`: top-level array, 59 records
- `research/data/game/minion_base_stats.json`: keys: _schema, data; data: 59 records
- `research/data/game/monster_abilities_index.json`: top-level array, 3305 records
- `research/data/game/monster_damage.json`: keys: gameVersion, source, schema, data; schema: monster_damage.json: average damage of ordinary monsters as a planner ; source: PermaLoad ActorData + monster actor prefabs + ability prefabs + actor_; gameVersion 1.5.0
- `research/data/game/monster_mods.json`: keys: gameVersion, source, schema, otherMonsterMods, timelines, formulas, data; schema: see research/07a_assets_core_data.md §monster_mods; source: LE:StatsMonsterMod assets, MonsterRarityManager pools, MonolithTimelin; gameVersion 1.5.0; data: 239 records
- `research/data/game/monster_rarity.json`: keys: gameVersion, source, schema, formulas, data; schema: see research/07a_assets_core_data.md §monster_rarity; source: Monster Rarity Manager.asset (magic/rare) + MonsterRarityManager.setAc; gameVersion 1.5.0
- `research/data/game/mutator_field_semantics_AL.json`: top-level array, 2237 records
- `research/data/game/mutator_field_semantics_MZ.json`: top-level array, 2581 records
- `research/data/game/passive_node_effects.json`: top-level array, 5 records
- `research/data/game/player_property_fields.json`: keys: gameVersion, source, schema, data; source: GameAssembly.dll jump table @0x182616398 in CharacterMutator.applyModi; gameVersion 1.5.0; data: 692 records
- `research/data/game/sets.json`: keys: gameVersion, source, schema, data; schema: see research/07a_assets_core_data.md §sets; source: Resources/SetBonusesList.asset; gameVersion 1.5.0; data: 24 records
- `research/data/game/skill_conversions.json`: keys: gameVersion, source, schema, data; schema: {key "Mutator.field", kind conversion/tags/ailment_conversion, convert; source: mutator_field_semantics_*.json (decompiled mutator code descriptions) ; gameVersion 1.5.0; data: 165 records
- `research/data/game/skill_node_effects.json`: top-level array, 144 records
- `research/data/game/tree_art.json`: keys: sprites, connections, trees
- `research/data/game/tree_node_stats.json`: keys: fi9:0, fi9:2, fi9:3, fi9:4, fi9:6, fi9:8, fi9:9, fi9:12, ... (4725 keys)
- `research/data/game/tree_ui_sources.json`: keys: duplicates, uiTreesNotInGlobalTreeData, bundles, unattachedNodeGroups
- `research/data/game/trees.json`: top-level array, 150 records
- `research/data/game/unique_effects.json`: keys: gameVersion, source, schema, sets, setCountRule, data, ppFormulas, apCoverage; source: UniqueList/SetBonusesList/PlayerPropertyList/AbilityPropertyList asset; gameVersion 1.5.0; data: 489 records
- `research/data/game/uniques.json`: keys: gameVersion, source, schema, valueModel, data; schema: see research/07a_assets_core_data.md §uniques; source: Resources/UniqueList.asset; gameVersion 1.5.0; data: 489 records
- `research/data/game/weaver_node_effects.json`: top-level array, 1 records
- `research/data/monster_level_damage_reduction.json`: keys: source, index, bossOrMiniboss, values; source: ActorScaler.damageReduction (static init blob, metadata field 0x185347
- `research/data/sp_enum.json`: top-level array, 134 records
- `research/data/stat_tag_enums.json`: keys: AT, ETag, ModType, DamageType, ResistanceStatType, ConditionalDamageProperty, AilmentID, HitEventTag, ... (15 keys)

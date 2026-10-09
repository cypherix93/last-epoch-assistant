-- =============================================================================
-- Last Epoch game database (data/le.sqlite) - normalized schema
-- =============================================================================
--
-- Built by packages/db/src/build-db.ts from data/raw/<version>/ (LE Tools primary,
-- Maxroll secondary). See docs/schema.md for the table guide and example queries,
-- docs/loader-contract.md for which loader fills which table.
--
-- Conventions
--   * Booleans are INTEGER 0/1 (LE Tools mixes 0/1 numbers and true/false; normalized on load).
--   * Every entity table has `raw_json TEXT NOT NULL`: the full source record as JSON
--     (unless the column comment says a child collection is omitted because it has its own table).
--   * `name` / `description` / ... are English strings resolved from i18n at load time
--     (ICU unescaped: '' -> ', '{' -> {); the i18n key is kept in the matching `*_key` column.
--   * Source paths in comments use the decoded LE Tools globals (data/raw/<v>/letools/<Global>.json),
--     `<k>` = object key, `[]` = array element, `MR:` prefix = Maxroll data.json.
--   * Stat lines of every kind live in ONE table: `mods` (see the bottom of the file).
--   * Foreign keys are declared for documentation; they are not enforced during the build
--     (partial builds), the build report counts violations via PRAGMA foreign_key_check.
--
-- Owner domains (which loader fills the table): [build] build-db.ts, [world] loaders/world.ts,
-- [items] loaders/items.ts, [skills] loaders/skills.ts, [search] search.ts, [shared] several.

PRAGMA foreign_keys = OFF;

-- =============================================================================
-- Build metadata / provenance                                            [build]
-- =============================================================================

CREATE TABLE meta (
  key   TEXT PRIMARY KEY,  -- game_version, data_version, data_version_folder, fetched_at, schema_version,
                           -- build_tool_version, maxroll_data_hash, maxroll_sha256, letools_sha256:<section>/<file>, i18n_sha256, ...
  value TEXT NOT NULL      -- value as text (from sources.lock.json, gameVersion.json, data/raw/CURRENT)
) WITHOUT ROWID;

-- =============================================================================
-- Localisation and enums                                                 [world]
-- =============================================================================

CREATE TABLE i18n (
  key      TEXT PRIMARY KEY,  -- i18n.en.json key, e.g. 'Item_Names.Unique_Name_0'
  section  TEXT NOT NULL,     -- part of the key before the first '.', e.g. 'Item_Names'
  text     TEXT NOT NULL,     -- ICU-unescaped English text ('' -> ', '{' -> {)
  raw_text TEXT               -- i18n.en.json value verbatim; NULL when identical to text
) WITHOUT ROWID;

CREATE TABLE enums (
  enum_name TEXT NOT NULL,     -- global name: AT | SP | LocalSP | AilmentID | UIBuffIds | BuffId | BuffPropId | CustomConditionType
  name      TEXT NOT NULL,     -- <Global>.json key, e.g. 'Fire'
  value     INTEGER NOT NULL,  -- <Global>.json value
  PRIMARY KEY (enum_name, name)
) WITHOUT ROWID;
CREATE INDEX enums_value ON enums (enum_name, value);

CREATE TABLE tag_bits (
  value INTEGER PRIMARY KEY,   -- AT.<name> (bit value, 0 = None)
  bit   INTEGER,               -- log2(value); NULL for None
  name  TEXT NOT NULL          -- AT key, e.g. 'Physical', 'Spell', 'Minion'
);

CREATE TABLE raw_globals (
  name    TEXT PRIMARY KEY,    -- LE Tools global (or 'maxroll.<key>') that has no normalized table, e.g. 'passiveBonuses', 'vaultsOfUncertainFate'
  source  TEXT NOT NULL,       -- 'letools' | 'maxroll'
  json    TEXT NOT NULL        -- full JSON of the global
) WITHOUT ROWID;

CREATE TABLE compact_ids (
  compact_id  TEXT PRIMARY KEY, -- LE Tools compact id as seen in the data, e.g. 'AKwDgnEA' (itemDB.rel* map keys, monsterMods keys, mod refs, dungeon keys)
  kind        TEXT NOT NULL,    -- first letter: A affix | U unique line | S set | I implicit/subtype | M monster mod
  decoded     TEXT NOT NULL,    -- lz-string decompressFromEncodedURIComponent(compact_id[1:]), e.g. '589'
  target_table TEXT,            -- table the id resolves to: affixes | uniques | sets | item_subtypes | monster_mods
  target_key  TEXT,             -- key in that table: affix_id | unique_id | set_id | '<base>:<sub>' | mod_id
  sub_index   INTEGER,          -- U: first 3 digits (line index, meaning partly unknown); I: last 3 digits (implicit index)
  resolves    INTEGER NOT NULL  -- 1 when target_key exists in target_table at load time
) WITHOUT ROWID;
CREATE INDEX compact_ids_target ON compact_ids (target_table, target_key);

-- =============================================================================
-- Stat properties and secondary property lists                           [world]
-- =============================================================================

CREATE TABLE stat_properties (
  property          INTEGER PRIMARY KEY, -- SP.<name> (0..133) or LocalSP.<name> (1001..1106); == coreDB.propertyList[].property
  enum_name         TEXT NOT NULL,       -- SP / LocalSP key, e.g. 'Damage', 'PlayerProperty'
  enum_source       TEXT NOT NULL,       -- 'SP' | 'LocalSP'
  name              TEXT,                -- t(coreDB.propertyList[].propertyNameKey); NULL when no display rule
  name_key          TEXT,                -- coreDB.propertyList[].propertyNameKey
  alt_text          TEXT,                -- t(coreDB.propertyList[].altTextKey)
  alt_text_key      TEXT,                -- coreDB.propertyList[].altTextKey
  has_display_rule  INTEGER NOT NULL,    -- 1 when coreDB.propertyList has an entry (113 of 134 SP)
  list_index        INTEGER,             -- index in coreDB.propertyList
  is_indirect       INTEGER NOT NULL DEFAULT 0, -- 1 for 58 AbilityProperty, 98 PlayerProperty, 130 IdolAltarProperty (tags is an index, not an AT mask);
                                         -- 88 LevelOfSkills is indirect only when specialTag = 1 (tags = ability index), see lib/stat-lines.ts isIndirectTags()
  round_added_to_int          INTEGER,   -- coreDB.propertyList[].roundAddedToInt (0 none, 1 int, 2 one decimal, 3 see enums.md 12)
  rounding_for_more           INTEGER,   -- coreDB.propertyList[].roundingForMore
  display_added_as_percentage INTEGER,   -- coreDB.propertyList[].displayAddedAsPercentage
  display_as_percentage_of    INTEGER,   -- coreDB.propertyList[].displayAsPercentageOf
  display_added_as_tenth_of_value INTEGER, -- coreDB.propertyList[].displayAddedAsTenthOfValue
  display_as_added_to         INTEGER,   -- coreDB.propertyList[].displayAsAddedTo
  dont_display_plus           INTEGER,   -- coreDB.propertyList[].dontDisplayPlus
  hide_modifier_value         INTEGER,   -- coreDB.propertyList[].hideModifierValue
  name_includes_modifier      INTEGER,   -- coreDB.propertyList[].nameIncludesModifier
  maxroll_name      TEXT,                -- MR:properties[].propertyName (stem of the i18n key)
  raw_json          TEXT NOT NULL        -- coreDB.propertyList[i] (or {"enum":...} for properties without display rule)
);

CREATE TABLE stat_property_alt_texts (
  property      INTEGER NOT NULL REFERENCES stat_properties (property), -- coreDB.propertyList[].property
  ord           INTEGER NOT NULL,      -- index in coreDB.propertyList[].altTextOverrides[]
  modifier_type INTEGER NOT NULL,      -- altTextOverrides[].modType (0 added, 1 increased, 2 more)
  special_tag   INTEGER NOT NULL,      -- altTextOverrides[].specialTag
  tags          INTEGER NOT NULL,      -- altTextOverrides[].tags (AT mask)
  tag_names     TEXT,                  -- describeTags(tags)
  dont_display_plus INTEGER,           -- altTextOverrides[].dontDisplayPlus
  alt_text_key  TEXT,                  -- altTextOverrides[].altTextKey (stored without section; resolved as 'Properties.'||key)
  alt_text      TEXT,                  -- t('Properties.' || altTextKey) or t(altTextKey)
  PRIMARY KEY (property, ord)
) WITHOUT ROWID;

CREATE TABLE player_properties (
  idx           INTEGER PRIMARY KEY,   -- index in coreDB.playerPropertyList (== `tags` of SP 98 PlayerProperty lines)
  name          TEXT,                  -- t(playerPropertyList[].propertyNameKey)
  name_key      TEXT,                  -- coreDB.playerPropertyList[].propertyNameKey ('Properties.Property_Player_<idx>_Name')
  alt_text      TEXT,                  -- t(altTextKey)
  alt_text_key  TEXT,                  -- coreDB.playerPropertyList[].altTextKey
  round_added_to_int INTEGER,          -- coreDB.playerPropertyList[].roundAddedToInt
  rounding_for_more  INTEGER,          -- coreDB.playerPropertyList[].roundingForMore
  display_added_as_percentage INTEGER, -- coreDB.playerPropertyList[].displayAddedAsPercentage
  less_is_better INTEGER,              -- coreDB.playerPropertyList[].lessIsBetter
  raw_json      TEXT NOT NULL          -- coreDB.playerPropertyList[idx]
);

CREATE TABLE ability_properties (
  ability_index INTEGER NOT NULL,      -- coreDB.abilityPropertyList[].abilityID (== abilities.ability_index == `tags` of SP 58 lines)
  prop_index    INTEGER NOT NULL,      -- index in abilityPropertyList[].properties[] (== `specialTag` of SP 58 lines)
  ability_id    TEXT,                  -- LEAbilities.abilityList[<id>] whose .index == ability_index (NULL if none)
  name          TEXT,                  -- t(properties[].propertyNameKey), e.g. 'Projectiles for Fireball'
  name_key      TEXT,                  -- abilityPropertyList[].properties[].propertyNameKey
  alt_text      TEXT,                  -- t(properties[].altTextKey)
  alt_text_key  TEXT,                  -- abilityPropertyList[].properties[].altTextKey
  round_added_to_int INTEGER,          -- properties[].roundAddedToInt
  rounding_for_more  INTEGER,          -- properties[].roundingForMore
  display_added_as_percentage INTEGER, -- properties[].displayAddedAsPercentage
  less_is_better INTEGER,              -- properties[].lessIsBetter
  raw_json      TEXT NOT NULL,         -- abilityPropertyList[].properties[prop_index]
  PRIMARY KEY (ability_index, prop_index)
) WITHOUT ROWID;
CREATE INDEX ability_properties_ability ON ability_properties (ability_id);

CREATE TABLE idol_altar_properties (
  idx           INTEGER PRIMARY KEY,   -- index in coreDB.idolAltarPropertyList.list (== `tags` of SP 130 lines)
  name          TEXT,                  -- t(list[].propertyNameKey)
  name_key      TEXT,                  -- coreDB.idolAltarPropertyList.list[].propertyNameKey
  alt_text      TEXT,                  -- t(list[].altTextKey)
  alt_text_key  TEXT,                  -- coreDB.idolAltarPropertyList.list[].altTextKey
  round_added_to_int INTEGER,          -- list[].roundAddedToInt
  display_added_as_percentage INTEGER, -- list[].displayAddedAsPercentage
  raw_json      TEXT NOT NULL          -- coreDB.idolAltarPropertyList.list[idx]
);

CREATE TABLE conditional_properties (
  idx                       INTEGER PRIMARY KEY, -- index (0..47) (== `specialTag` of SP 117/131/132/133 lines)
  damage_description_key    TEXT,      -- coreDB.conditionalDamagePropertyDescriptionKeys[idx]
  damage_description        TEXT,      -- t(damage_description_key), e.g. 'Damage to Stunned Enemies'
  non_damage_description_key TEXT,     -- coreDB.conditionalNonDamagePropertyDescriptionKeys[idx]
  non_damage_description    TEXT,      -- t(non_damage_description_key)
  raw_json                  TEXT NOT NULL -- {"damage": key, "nonDamage": key}
);

-- =============================================================================
-- Classes, masteries, attributes                                         [world]
-- =============================================================================

CREATE TABLE attributes (
  attribute_id INTEGER PRIMARY KEY,    -- coreDB.coreAttributes.<k> (0 Strength, 1 Vitality, 2 Intelligence, 3 Dexterity, 4 Attunement)
  name         TEXT NOT NULL,          -- SP name of property 19 + attribute_id
  property     INTEGER NOT NULL,       -- SP id of the attribute (19..23)
  raw_json     TEXT NOT NULL           -- coreDB.coreAttributes.<k> (stats -> mods 'attribute', corruptedStats -> mods 'attribute_corrupted')
);

CREATE TABLE classes (
  class_id      INTEGER PRIMARY KEY,   -- LECharTrees.trees[].characterTree.characterClass.classID (0..4)
  name          TEXT NOT NULL,         -- t(characterClass.classNameKey), e.g. 'Primalist'
  name_key      TEXT,                  -- characterClass.classNameKey
  description   TEXT,                  -- t(LECharTreesUI.<tree>.info[0].classDescriptionKey)
  tree_id       TEXT NOT NULL,         -- characterClass.treeID ('pr-1','mg-1','kn-1','ac-1','rg-1')
  base_health   REAL,                  -- characterClass.baseHealth
  base_mana     REAL,                  -- characterClass.baseMana
  health_per_level REAL,               -- characterClass.healthPerLevel
  mana_per_level   REAL,               -- characterClass.manaPerLevel
  health_regen  REAL,                  -- characterClass.healthRegen
  mana_regen    REAL,                  -- characterClass.manaRegen
  health_regen_per_level REAL,         -- characterClass.healthRegenPerLevel
  base_strength INTEGER,               -- characterClass.baseStrength
  base_vitality INTEGER,               -- characterClass.baseVitality
  base_intelligence INTEGER,           -- characterClass.baseIntelligence
  base_dexterity INTEGER,              -- characterClass.baseDexterity
  base_attunement INTEGER,             -- characterClass.baseAttunement
  base_stun_avoidance REAL,            -- characterClass.baseStunAvoidance
  base_endurance REAL,                 -- characterClass.baseEndurance
  base_endurance_threshold REAL,       -- characterClass.baseEnduranceThreshold
  endurance_threshold_per_level REAL,  -- characterClass.enduranceThresholdPerLevel
  endurance_threshold_per_health REAL, -- MR:classes[].enduranceThresholdPerHealth (only in Maxroll)
  first_level_for_minion_scaling INTEGER, -- characterClass.firstLevelForMinionScaling
  more_minion_damage_per_level REAL,   -- characterClass.moreMinionDamagePerLevel
  less_minion_damage_taken_per_level REAL, -- characterClass.lessMinionDamageTakenPerLevel
  basic_attack_replacer TEXT,          -- characterClass.basicAttackReplacer (ability id)
  icon          TEXT,                  -- characterClass.baseClassIcon (LE sprite id)
  raw_json      TEXT NOT NULL          -- characterClass (masteries kept inline; also in `masteries`)
);

CREATE TABLE masteries (
  class_id      INTEGER NOT NULL REFERENCES classes (class_id), -- characterClass.classID
  mastery_index INTEGER NOT NULL,      -- index in characterClass.masteries[] (0 = base class, 1..3 masteries) == tree node `mastery`
  name          TEXT NOT NULL,         -- t(masteries[].nameKey) or masteries[].name
  name_key      TEXT,                  -- characterClass.masteries[].nameKey
  description   TEXT,                  -- t(LECharTreesUI.<tree>.info[mastery_index].classDescriptionKey)
  description_key TEXT,                -- LECharTreesUI.<tree>.info[mastery_index].classDescriptionKey
  mastery_ability_id TEXT,             -- characterClass.masteries[].masteryAbility ('' -> NULL)
  passive_bonus_labels TEXT,           -- t() of LECharTreesUI.<tree>.info[i].passiveBonusKeys[], joined with '\n'
  raw_json      TEXT NOT NULL,         -- characterClass.masteries[mastery_index]
  PRIMARY KEY (class_id, mastery_index)
) WITHOUT ROWID;

CREATE TABLE class_abilities (
  class_id      INTEGER NOT NULL REFERENCES classes (class_id),
  kind          TEXT NOT NULL,         -- 'default' (characterClass.defaultAbilities[]) | 'known' (knownAbilities[]) | 'unlockable' (unlockableAbilities[]) | 'mastery' (masteries[].abilities[])
  mastery_index INTEGER,               -- for kind 'mastery': index in characterClass.masteries[]
  ord           INTEGER NOT NULL,      -- position in the source array
  ability_id    TEXT NOT NULL,         -- ability id (string or .ability)
  level         INTEGER,               -- unlockableAbilities[].level / masteries[].abilities[].level
  PRIMARY KEY (class_id, kind, mastery_index, ord)
);

-- =============================================================================
-- Items: base types, sub types, affixes, uniques, sets, idols, blessings  [items]
-- =============================================================================

CREATE TABLE item_base_types (
  base_type_id  INTEGER PRIMARY KEY,   -- itemDB.itemList.{equippable,nonEquippable}.<k>.baseTypeId (nonEquippable: the key)
  name          TEXT,                  -- t('Item_Names.Item_BaseType_Name_<id>') (displayNameKey)
  name_key      TEXT,                  -- .displayNameKey
  equippable    INTEGER NOT NULL,      -- 1 = itemList.equippable, 0 = itemList.nonEquippable
  category      TEXT,                  -- English header of itemList.lootFilterVisualCategories that lists the id
                                       -- (e.g. 'One Handed Weapons', 'Armour', 'Idols'); derived: 'Blessing' (34), 'Lens' (35..39,109), 'Idol Altar' (41)
  is_weapon     INTEGER,               -- .isWeapon
  is_idol       INTEGER NOT NULL DEFAULT 0, -- 1 for base types 25..33
  max_affixes   INTEGER,               -- .maxAffixes
  size_x        INTEGER,               -- .size.x (inventory cells)
  size_y        INTEGER,               -- .size.y
  type          INTEGER,               -- .type
  affix_effect_modifier REAL,          -- .affixEffectModifier
  minimum_drop_level INTEGER,          -- .minimumDropLevel
  reroll_chance REAL,                  -- .rerollChance
  class_affinity INTEGER,              -- .classAffinity
  disabled_to_roll INTEGER NOT NULL DEFAULT 0, -- 1 when in itemList.disabledBaseTypesToRoll
  raw_json      TEXT NOT NULL          -- the base type record WITHOUT `subItems` (see item_subtypes)
);

CREATE TABLE item_subtypes (
  base_type_id  INTEGER NOT NULL REFERENCES item_base_types (base_type_id), -- parent key
  sub_type_id   INTEGER NOT NULL,      -- .subItems.<k>.subTypeId
  name          TEXT,                  -- t(subItems[].displayNameKey) ('Item_Names.Item_SubType_Name_<b>_<s>')
  name_key      TEXT,                  -- subItems[].displayNameKey
  description   TEXT,                  -- t(subItems[].descriptionKey) (non-equippable only)
  description_key TEXT,                -- subItems[].descriptionKey
  level_requirement INTEGER,           -- subItems[].levelRequirement
  class_requirement INTEGER,           -- subItems[].classRequirement (bitmask 1<<classID; 0 = any)
  class_requirement_names TEXT,        -- class names decoded from class_requirement, comma list
  sub_class_requirement INTEGER,       -- subItems[].subClassRequirement
  cannot_drop   INTEGER,               -- subItems[].cannotDrop
  is_corrupted_subtype INTEGER,        -- subItems[].isCorruptedSubtype
  is_legacy     INTEGER,               -- subItems[].isLegacySubType
  obsolete      INTEGER,               -- subItems[].obsoleteItem
  is_starting_item INTEGER,            -- subItems[].isStartingItem
  attack_rate   REAL,                  -- subItems[].attackRate
  added_weapon_range REAL,             -- subItems[].addedWeaponRange
  affix_effectiveness REAL,            -- subItems[].affixEffectiveness
  item_tags     INTEGER,               -- subItems[].itemTags
  im_set_tier   INTEGER,               -- subItems[].IMSetTier
  lens_effect   TEXT,                  -- t(subItems[].lensEffectKey) or subItems[].lensEffect (lenses)
  sprite        TEXT,                  -- subItems[].sprite (LE atlas id 'I<n>')
  implicit_count INTEGER NOT NULL DEFAULT 0, -- subItems[].implicits.length (lines are in mods: implicit | blessing | idol_altar)
  letools_compact_id TEXT,             -- encodeCompactId('I', '1'+bbb+sss+'000') (implicit #0 id used by the rel* maps)
  raw_json      TEXT NOT NULL,         -- subItems[<k>]
  PRIMARY KEY (base_type_id, sub_type_id)
) WITHOUT ROWID;
CREATE INDEX item_subtypes_name ON item_subtypes (name);

CREATE TABLE affix_display_categories (
  idx           INTEGER PRIMARY KEY,   -- index in itemDB.affixList.displayCategoryKeys (== affixes.display_category)
  name          TEXT,                  -- t(displayCategoryKeys[idx]), e.g. 'Attributes'
  name_key      TEXT NOT NULL,         -- itemDB.affixList.displayCategoryKeys[idx]
  header_index  INTEGER,               -- index of itemDB.affixList.categoryHeaders[] whose .categories contains idx
  header_name   TEXT                   -- t(categoryHeaders[header_index].nameKey)
);

CREATE TABLE affixes (
  affix_id      INTEGER PRIMARY KEY,   -- itemDB.affixList.{singleAffixes,multiAffixes}.<k>.affixId (0..1156, 1139 absent)
  name          TEXT,                  -- t(.affixDisplayNameKey), e.g. 'Void Penetration'
  name_key      TEXT,                  -- .affixDisplayNameKey
  title         TEXT,                  -- t(.affixTitleKey) (prefix/suffix word, e.g. 'of Defense')
  title_key     TEXT,                  -- .affixTitleKey
  filter_name   TEXT,                  -- t(.lootFilterOverrideNameKey)
  kind          TEXT NOT NULL,         -- 'single' (singleAffixes) | 'multi' (multiAffixes)
  affix_type    INTEGER NOT NULL,      -- .type (0 prefix, 1 suffix)
  affix_type_name TEXT NOT NULL,       -- 'prefix' | 'suffix'
  level_requirement INTEGER,           -- .levelRequirement
  special_affix_type INTEGER,          -- .specialAffixType (0 normal,1 experimental,2 personal,3 set,4 enchanted idol,5 weaver idol,6 corrupted/altar,7 variant)
  rolls_on      INTEGER,               -- .rollsOn (0 equipment, 1 idols)
  class_specificity INTEGER,           -- .classSpecificity (bit 1<<(classID+1); bit 0 = Weaver)
  class_names   TEXT,                  -- decoded class_specificity, comma list ('Weaver' for bit 0)
  display_category INTEGER REFERENCES affix_display_categories (idx), -- .displayCategory
  group_id      INTEGER,               -- .group
  title_type    INTEGER,               -- .titleType
  affix_morphology INTEGER,            -- .affixMorphology
  t6_compatibility INTEGER,            -- .t6Compatibility
  use_generated_name INTEGER,          -- .useGeneratedName
  single_set_affix INTEGER,            -- .singleSetAffix
  for_unique_id INTEGER,               -- .forUniqueId (set/personal affixes; 0 -> NULL)
  weighting     REAL,                  -- .weighting
  reroll_chance REAL,                  -- .rerollChance
  standard_affix_effect_modifier REAL, -- .standardAffixEffectModifier
  tier_count    INTEGER NOT NULL,      -- .tiers.length
  stat_count    INTEGER NOT NULL,      -- .affixProperties.length
  letools_compact_id TEXT,             -- encodeCompactId('A', String(affix_id))
  raw_json      TEXT NOT NULL          -- the affix record (tiers kept inline)
);
CREATE INDEX affixes_name ON affixes (name);

CREATE TABLE affix_stats (
  affix_id      INTEGER NOT NULL REFERENCES affixes (affix_id),
  ord           INTEGER NOT NULL,      -- index in .affixProperties[] (== mods.source_ord, == index in tiers[].rolls[])
  property      INTEGER NOT NULL,      -- .affixProperties[].property (SP id)
  property_name TEXT,                  -- resolved property name (indirect properties resolved, see mods.property_name)
  special_tag   INTEGER NOT NULL,      -- .affixProperties[].specialTag
  tags          INTEGER NOT NULL,      -- .affixProperties[].tags
  extra_tag     INTEGER NOT NULL,      -- .affixProperties[].extraTag
  modifier_type INTEGER NOT NULL,      -- .affixProperties[].modifierType (0 added, 1 increased, 2 more)
  label         TEXT,                  -- t(.affixProperties[].modDisplayNameKey), e.g. 'Void Penetration'
  label_key     TEXT,                  -- .affixProperties[].modDisplayNameKey
  set_property  INTEGER,               -- .affixProperties[].setProperty
  disable_alt_text INTEGER,            -- .affixProperties[].disableAltText
  PRIMARY KEY (affix_id, ord)
) WITHOUT ROWID;

CREATE TABLE affix_tiers (
  affix_id      INTEGER NOT NULL REFERENCES affixes (affix_id),
  tier          INTEGER NOT NULL,      -- 1-based: index in .tiers[] + 1 (T1..T7/T8); roll values are mods rows (source_kind 'affix_tier')
  required_level INTEGER,              -- .tiers[].requiredLevel
  tier_name     TEXT,                  -- .tiers[].tierName (always null in 1.5.2)
  PRIMARY KEY (affix_id, tier)
) WITHOUT ROWID;

CREATE TABLE affix_can_roll_on (
  affix_id      INTEGER NOT NULL REFERENCES affixes (affix_id),
  base_type_id  INTEGER NOT NULL,      -- .canRollOn[] (base type id)
  ord           INTEGER NOT NULL,      -- position in .canRollOn[]
  PRIMARY KEY (affix_id, base_type_id)
) WITHOUT ROWID;
CREATE INDEX affix_can_roll_on_base ON affix_can_roll_on (base_type_id);

CREATE TABLE affix_reroll_chances (
  affix_id      INTEGER NOT NULL REFERENCES affixes (affix_id),
  ord           INTEGER NOT NULL,      -- index in .specificRerollChances[]
  equipment_type INTEGER,              -- .specificRerollChances[].equipmentType
  reroll_chance REAL,                  -- .specificRerollChances[].rerollChance
  weighting     REAL,                  -- .specificRerollChances[].weighting
  PRIMARY KEY (affix_id, ord)
) WITHOUT ROWID;

CREATE TABLE sets (
  set_id        INTEGER PRIMARY KEY,   -- itemDB.setBonusList[].setID (== array index; 0 = 'no set')
  name          TEXT,                  -- t(setBonusList[].nameKey) ('Item_Names.ItemSet_<id>_Name'), e.g. "Isadora's"
  name_key      TEXT,                  -- setBonusList[].nameKey
  set_name      TEXT,                  -- setBonusList[].setName (raw English) / itemDB.setNames.<id>
  item_count    INTEGER NOT NULL DEFAULT 0, -- number of uniques with set_id = this id
  letools_compact_id TEXT,             -- encodeCompactId('S', zero-padded 3-digit set id)
  raw_json      TEXT NOT NULL          -- setBonusList[i] (mods -> mods 'set_bonus')
);

CREATE TABLE set_tooltips (
  set_id        INTEGER NOT NULL REFERENCES sets (set_id),
  ord           INTEGER NOT NULL,      -- index in setBonusList[].tooltipDescriptions[]
  set_requirement INTEGER,             -- tooltipDescriptions[].setRequirement (pieces needed)
  set_mod       INTEGER,               -- tooltipDescriptions[].setMod
  text          TEXT,                  -- t(tooltipDescriptions[].descriptionKey)
  text_key      TEXT,                  -- tooltipDescriptions[].descriptionKey
  alt_text      TEXT,                  -- t(tooltipDescriptions[].altTextKey)
  alt_text_key  TEXT,                  -- tooltipDescriptions[].altTextKey
  PRIMARY KEY (set_id, ord)
) WITHOUT ROWID;

CREATE TABLE uniques (
  unique_id     INTEGER PRIMARY KEY,   -- itemDB.uniqueList.uniques.<k>.uniqueId (0..488, 486 present)
  name          TEXT,                  -- t(.displayNameKey) ('Item_Names.Unique_Name_<id>')
  name_key      TEXT,                  -- .displayNameKey
  lore          TEXT,                  -- t(.loreTextKey)
  lore_key      TEXT,                  -- .loreTextKey
  alt_search_name TEXT,                -- t(.alternativeSearchNameKey)
  base_type_id  INTEGER REFERENCES item_base_types (base_type_id), -- .baseTypeId
  sub_type_id   INTEGER,               -- .subTypeIds[0] (all of them in unique_subtypes)
  is_set_item   INTEGER NOT NULL,      -- .isSetItem
  set_id        INTEGER REFERENCES sets (set_id), -- .setId (NULL when not a set item)
  legendary_type INTEGER,              -- .legendaryType RAW enum: 0 LegendaryPotential, 1 WeaversWill (which affix-upgrade system the item uses; NOT "can roll LP": 1 on exactly 18 Erased/Weaver uniques)
  lp_eligible   INTEGER,               -- DERIVED (not in the raw data): 1 when the unique can roll Legendary Potential = not a set item and legendary_type = 0
  weavers_will  INTEGER,               -- DERIVED: 1 when legendary_type = 1 (the item uses Weaver's Will instead of Legendary Potential)
  unified_type  INTEGER,               -- .unifiedType
  level_requirement INTEGER,           -- .levelRequirement
  override_level_requirement INTEGER,  -- .overrideLevelRequirement
  can_drop_randomly INTEGER,           -- .canDropRandomly
  can_drop_as_legendary INTEGER,       -- .canDropAsLegendary (1 on 4 uniques: Exulis, Unsated Rage, Withstand the Elements, Frostborn Solitude; they all drop_specific_legendary_affixes)
  hide_from_players INTEGER,           -- .hideFromPlayers
  unknown_drop  INTEGER,               -- .unknownDrop
  not_timeline_exclusive INTEGER,      -- .notTimelineExclusive
  effective_level_for_lp INTEGER,      -- .effectiveLevelForLegendaryPotential (only used when override_effective_level_for_lp = 1; 0 with override 0 = not set, LP uses the item's own level)
  override_effective_level_for_lp INTEGER, -- .overrideEffectiveLevelForLegendaryPotential
  drops_specific_legendary_affixes INTEGER, -- .dropsSpecificLegendaryAffixes
  droppable_legendary_affix_count INTEGER,  -- .droppableLegendaryAffixCount
  additional_random_legendary_affixes INTEGER, -- .additionalRandomLegendaryAffixes
  is_primordial INTEGER,               -- .isPrimordialItem
  is_cocooned   INTEGER,               -- .isCocoonedItem
  is_pre_corrupted INTEGER,            -- .isPreCorrupted
  use_custom_drop_level INTEGER,       -- .useCustomDropLevel
  custom_drop_level INTEGER,           -- .customDropLevel
  reroll_chance REAL,                  -- .rerollChance
  sprite        TEXT,                  -- .sprite (LE atlas id 'I<n>')
  mod_count     INTEGER NOT NULL,      -- .mods.length (lines -> mods 'unique_mod')
  raw_json      TEXT NOT NULL          -- the unique record (mods/tooltips kept inline)
);
CREATE INDEX uniques_name ON uniques (name);
CREATE INDEX uniques_base ON uniques (base_type_id, sub_type_id);

CREATE TABLE unique_subtypes (
  unique_id     INTEGER NOT NULL REFERENCES uniques (unique_id),
  ord           INTEGER NOT NULL,      -- index in .subTypeIds[]
  base_type_id  INTEGER NOT NULL,      -- .baseTypeId
  sub_type_id   INTEGER NOT NULL,      -- .subTypeIds[ord]
  PRIMARY KEY (unique_id, ord)
) WITHOUT ROWID;

CREATE TABLE unique_tooltips (
  unique_id     INTEGER NOT NULL REFERENCES uniques (unique_id),
  ord           INTEGER NOT NULL,      -- index in .tooltipDescriptions[]
  text          TEXT,                  -- t(.tooltipDescriptions[].descriptionKey) (contains [min,max,decimals] roll placeholders)
  text_key      TEXT,                  -- .tooltipDescriptions[].descriptionKey ('Item_Names.Unique_Tooltip_<ord>_<id>')
  alt_text      TEXT,                  -- .tooltipDescriptions[].altText
  set_mod       INTEGER,               -- .tooltipDescriptions[].setMod
  set_requirement INTEGER,             -- .tooltipDescriptions[].setRequirement
  PRIMARY KEY (unique_id, ord)
) WITHOUT ROWID;

CREATE TABLE unique_tooltip_entries (
  unique_id     INTEGER NOT NULL REFERENCES uniques (unique_id),
  ord           INTEGER NOT NULL,      -- index in .tooltipEntries[] (tooltip line order)
  mod_display   INTEGER NOT NULL,      -- .tooltipEntries[].modDisplay
  ref_kind      TEXT NOT NULL,         -- 'mod' (modDisplay < 128) | 'description' (>= 128)
  ref_index     INTEGER NOT NULL,      -- mods[] index (== mods.source_ord) or tooltipDescriptions[] index (modDisplay - 128)
  PRIMARY KEY (unique_id, ord)
) WITHOUT ROWID;

CREATE TABLE idol_altars (
  sub_type_id   INTEGER PRIMARY KEY,   -- itemDB.itemList.equippable.41.subItems.<k>.subTypeId
  name          TEXT,                  -- item_subtypes.name of (41, sub_type_id)
  grid_index    INTEGER,               -- index into itemDB.altarGrids.grids[] (i-th sub type in ascending id order; mapping unverified)
  grid_json     TEXT,                  -- itemDB.altarGrids.grids[grid_index] (5x5 cell codes)
  default_grid_json TEXT,              -- itemDB.altarGrids.defaultGrid
  raw_json      TEXT NOT NULL          -- subItems[<k>]
);

CREATE TABLE blessings (
  sub_type_id   INTEGER PRIMARY KEY,   -- itemDB.itemList.equippable.34.subItems.<k>.subTypeId (224)
  name          TEXT,                  -- item_subtypes.name of (34, sub_type_id)
  timeline_id   INTEGER,               -- timelineData.<id> whose difficulties[] list the blessing (each blessing is in exactly one timeline)
  difficulty_index INTEGER,            -- index in timelineData.<id>.difficulties[] (0 normal, 1 empowered) - first occurrence
  slot_kind     TEXT,                  -- 'first' (firstSlotBlessings) | 'other' (otherSlotBlessings) | 'any' (anySlotBlessings) - first occurrence
  is_grand      INTEGER NOT NULL DEFAULT 0, -- 1 when difficulty_index = 1 (empowered / grand blessing)
  raw_json      TEXT NOT NULL          -- subItems[<k>] (implicits -> mods 'blessing', source_id '34:<sub>')
);
CREATE INDEX blessings_timeline ON blessings (timeline_id);

-- =============================================================================
-- Abilities, ailments, buffs, entities                                  [skills]
-- =============================================================================

CREATE TABLE abilities (
  ability_id    TEXT PRIMARY KEY,      -- LEAbilities.abilityList.<k>.id (e.g. 'fi9', 'ability_gen172')
  name          TEXT,                  -- t(.nameKey) or .name
  name_key      TEXT,                  -- .nameKey
  description   TEXT,                  -- t(.descriptionKey) or .description
  description_key TEXT,                -- .descriptionKey
  alt_text      TEXT,                  -- t(.altTextKey) or .altText
  alt_text_key  TEXT,                  -- .altTextKey
  lore          TEXT,                  -- t(.skillLoreKey) or .skillLore
  internal_name TEXT,                  -- .internalName
  ability_index INTEGER,               -- .index (bridge to Maxroll abilityList and to SP 58 / 88 `tags`)
  is_player_ability INTEGER NOT NULL DEFAULT 0, -- 1 when id in LEAbilities.playerAbilityIdList
  player_list_ord INTEGER,             -- position in playerAbilityIdList
  has_skill_tree INTEGER NOT NULL DEFAULT 0, -- 1 when LESkillTrees.<id> exists
  tags          INTEGER,               -- .tags (AT mask)
  tag_names     TEXT,                  -- describeTags(.tags)
  fake_tags     INTEGER,               -- .fakeTags
  minion_tags_display INTEGER,         -- .minionTagsDisplay
  area_tag_display INTEGER,            -- .areaTagDisplay
  conversion_damage_tags INTEGER,      -- .skillTreeConversionDamageTags
  mana_cost     REAL,                  -- .manaCost
  channel_cost  REAL,                  -- .channelCost
  minimum_mana_cost REAL,              -- .minimumManaCost
  attack_speed  REAL,                  -- .as (number; string values parsed)
  use_delay     REAL,                  -- .useDelay
  use_duration  REAL,                  -- .useDuration
  speed_scaler  INTEGER,               -- .speedScaler
  speed_multiplier REAL,               -- .speedMultiplier
  max_charges   REAL,                  -- .maxCharges
  charges_gained_per_second REAL,      -- .chargesGainedPerSecond
  channelled    INTEGER,               -- .channelled
  instant_cast  INTEGER,               -- .instantCastForPlayer
  is_transform  INTEGER,               -- .transform
  is_companion  INTEGER,               -- .companion
  is_traversal  INTEGER,               -- .traversalSkill
  counts_as_movement INTEGER,          -- .countsAsMovementAbility
  is_combo      INTEGER,               -- .comboAbility
  combo_time_limit REAL,               -- .comboTimeLimit
  sprite        TEXT,                  -- .abilitySprite
  raw_json      TEXT NOT NULL          -- the ability record WITHOUT `prefab` (see ability_components)
);
CREATE INDEX abilities_name ON abilities (name);
CREATE INDEX abilities_index ON abilities (ability_index);

CREATE TABLE ability_components (
  ability_id    TEXT NOT NULL REFERENCES abilities (ability_id),
  ord           INTEGER NOT NULL,      -- index in .prefab.components[]
  component_type TEXT NOT NULL,        -- .prefab.components[].type (87 PascalCase names, e.g. 'DamageEnemyOnHit')
  damage_tags   INTEGER,               -- .prefab.components[].damageTags
  ref_ability_id TEXT,                 -- first of .abilityToInstantiate / .ability / .abilityToCast / .alternateAbility
  raw_json      TEXT NOT NULL,         -- .prefab.components[ord]
  PRIMARY KEY (ability_id, ord)
) WITHOUT ROWID;
CREATE INDEX ability_components_type ON ability_components (component_type);

CREATE TABLE ability_links (
  ability_id    TEXT NOT NULL REFERENCES abilities (ability_id),
  link_kind     TEXT NOT NULL,         -- 'combo' (.comboAbilities[]) | 'shared_cooldown' (.sharedCooldownAbilities[])
  ord           INTEGER NOT NULL,      -- position in the source array
  target_ability_id TEXT NOT NULL,     -- the listed ability id
  PRIMARY KEY (ability_id, link_kind, ord)
) WITHOUT ROWID;

CREATE TABLE ailments (
  ailment_id    INTEGER PRIMARY KEY,   -- LEAbilities.ailmentList.<k>.id (== AilmentID value)
  internal_name TEXT NOT NULL,         -- .internalName (== AilmentID key)
  name          TEXT,                  -- t(.displayNameKey) or .displayName
  name_key      TEXT,                  -- .displayNameKey
  description   TEXT,                  -- t(.descriptionKey)
  description_key TEXT,                -- .descriptionKey
  duration      REAL,                  -- .duration (seconds)
  max_instances INTEGER,               -- .maxInstances
  positive      INTEGER,               -- .positive (1 = buff on the bearer)
  is_curse      INTEGER,               -- .curse
  deals_damage  INTEGER,               -- .dealsDamage
  tags          INTEGER,               -- .tags (AT mask)
  tag_names     TEXT,                  -- describeTags(.tags)
  dmg_physical  REAL,                  -- .baseDamage.damage[0]
  dmg_fire      REAL,                  -- .baseDamage.damage[1]
  dmg_cold      REAL,                  -- .baseDamage.damage[2]
  dmg_lightning REAL,                  -- .baseDamage.damage[3]
  dmg_necrotic  REAL,                  -- .baseDamage.damage[4]
  dmg_void      REAL,                  -- .baseDamage.damage[5]
  dmg_poison    REAL,                  -- .baseDamage.damage[6]
  damage_types  TEXT,                  -- names of the non-zero damage[] slots, comma list ('Fire', 'Necrotic,Fire')
  shows_in_buff_ui INTEGER,            -- .showsInBuffUI
  spreads       INTEGER,               -- .spreads
  max_stacks_that_apply_buffs INTEGER, -- .maxStacksThatApplyBuffs
  icon          TEXT,                  -- .icon
  in_maxroll    INTEGER,               -- 1 when MR:ailments[] has the id (ids 1..128)
  raw_json      TEXT NOT NULL          -- the ailment record (buffs -> mods 'ailment_buff')
);
CREATE INDEX ailments_name ON ailments (name);

CREATE TABLE ui_buffs (
  buff_id       INTEGER PRIMARY KEY,   -- UIBuffs.<k>.id (== UIBuffIds value)
  enum_name     TEXT,                  -- UIBuffIds key with this value
  name          TEXT,                  -- t(.displayNameKey) ('Ailments.NonAilment_<name>_Name')
  name_key      TEXT,                  -- .displayNameKey
  description   TEXT,                  -- t(.descriptionKey)
  description_key TEXT,                -- .descriptionKey
  positive      INTEGER,               -- .positive
  max_instances INTEGER,               -- .maxInstances
  icon          TEXT,                  -- .icon
  raw_json      TEXT NOT NULL          -- UIBuffs.<k>
);

CREATE TABLE entities (
  entity_id     INTEGER PRIMARY KEY,   -- LEAbilities.entityList.<k>.id (100000+)
  gen_id        TEXT,                  -- .actor.data.genId (e.g. 'primal_wolf')
  name          TEXT,                  -- t(.actor.data.nameKey)
  name_key      TEXT,                  -- .actor.data.nameKey
  raw_json      TEXT NOT NULL          -- entityList.<k>
);

-- =============================================================================
-- Trees: skill trees, class passive trees, Weaver tree                  [skills]
-- =============================================================================

CREATE TABLE trees (
  tree_id       TEXT PRIMARY KEY,      -- LESkillTrees.<k>.treeID | LECharTrees.trees[].characterTree.treeID | LEWeaverTree.treeID ('weaver')
  tree_kind     TEXT NOT NULL,         -- 'skill' | 'class' | 'weaver'
  name          TEXT,                  -- skill: abilities.name of ability_id; class: class name; weaver: 'Weaver Tree'
  ability_id    TEXT,                  -- LESkillTrees.<k>.ability (skill trees)
  class_id      INTEGER,               -- characterClass.classID (class trees)
  version       INTEGER,               -- .version
  node_count    INTEGER NOT NULL,      -- number of nodes
  raw_json      TEXT NOT NULL          -- tree record WITHOUT `nodes` (and without characterClass for class trees)
);

CREATE TABLE tree_nodes (
  tree_id       TEXT NOT NULL REFERENCES trees (tree_id),
  node_id       INTEGER NOT NULL,      -- .nodes.<k>.id
  tree_kind     TEXT NOT NULL,         -- copy of trees.tree_kind
  name          TEXT,                  -- t(.nodeNameKey) ('Skills.Skill_<tree>_<node>_Name')
  name_key      TEXT,                  -- .nodeNameKey
  description   TEXT,                  -- t(.descriptionKey)
  description_key TEXT,                -- .descriptionKey
  alt_text      TEXT,                  -- t(.altTextKey)
  lore          TEXT,                  -- t(.loreTextKey)
  point_bonus_description TEXT,        -- t(.pointBonusDescriptionKey)
  max_points    INTEGER,               -- .maxPoints (0 = root node)
  mastery       INTEGER,               -- .mastery (class trees: 0 base class, 1..3 mastery)
  mastery_requirement INTEGER,         -- .masteryRequirement (points in class tree needed)
  no_scaling_type INTEGER,             -- .noScalingType
  no_scaling_point_threshold INTEGER,  -- .noScalingPointThreshold
  lock_node     INTEGER,               -- .lockNode
  base_lock_node INTEGER,              -- .baseLockNode
  ui_x          REAL,                  -- LESkillTreesUI.<tree>.children[].rect[0] | LECharTreesUI.<tree>.nodes[].children[].rect[0] | LEWeaverTreeUI.weaver.children[].rect[0]
  ui_y          REAL,                  -- ... .rect[1]
  ui_w          REAL,                  -- ... .rect[2]
  ui_h          REAL,                  -- ... .rect[3]
  icon          TEXT,                  -- ... .icon (LE sprite id)
  node_size     INTEGER,               -- ... .nodeSize
  stat_count    INTEGER NOT NULL DEFAULT 0, -- .stats.length (lines -> mods skill_node | passive_node | weaver_node)
  raw_json      TEXT NOT NULL,         -- the node record
  PRIMARY KEY (tree_id, node_id)
) WITHOUT ROWID;
CREATE INDEX tree_nodes_name ON tree_nodes (name);

CREATE TABLE tree_node_requirements (
  tree_id       TEXT NOT NULL,
  node_id       INTEGER NOT NULL,      -- the node that has the requirement
  ord           INTEGER NOT NULL,      -- index in .requirements[]
  required_node_id INTEGER NOT NULL,   -- .requirements[].nodeId
  required_points INTEGER NOT NULL,    -- .requirements[].requirement (points in required node)
  PRIMARY KEY (tree_id, node_id, ord),
  FOREIGN KEY (tree_id, node_id) REFERENCES tree_nodes (tree_id, node_id)
) WITHOUT ROWID;

-- =============================================================================
-- Endgame: monster mods, timelines, dungeons, arena, rewards, echoes      [world]
-- =============================================================================

CREATE TABLE monster_mods (
  mod_id        INTEGER PRIMARY KEY,   -- decodeCompactId(monsterMods key).value (0..286)
  letools_compact_id TEXT NOT NULL UNIQUE, -- monsterMods key, e.g. 'MIzDMQ'
  title         TEXT,                  -- t(.titleKey)
  title_key     TEXT,                  -- .titleKey
  description   TEXT,                  -- t(.descriptionKey)
  description_key TEXT,                -- .descriptionKey
  objective_text TEXT,                 -- t(.minilithDescriptionKey) (dungeon / monolith objective wording)
  objective_text_key TEXT,             -- .minilithDescriptionKey
  mod_type      INTEGER,               -- .modType (0 prefix-name, 1 suffix-name, 2 objective, 4 champion, 5 ?)
  type          INTEGER,               -- .type
  increased_item_rarity REAL,          -- .increasedItemRarity
  increased_experience REAL,           -- .increasedExperience
  rarity_requirement INTEGER,          -- .rarityRequirement
  minimum_level INTEGER,               -- .minimumLevel
  can_spawn_in_arena INTEGER,          -- .canSpawnInArena
  mod_ability_id TEXT,                 -- .modAbility / .abilityToCast
  raw_json      TEXT NOT NULL          -- monsterMods.<key> (stats -> mods 'monster_mod')
);

CREATE TABLE timelines (
  timeline_id   INTEGER PRIMARY KEY,   -- timelineData.<k>.id (1..10)
  slug          TEXT,                  -- .slug
  name          TEXT,                  -- t(.nameKey) ('MapObjects.Island_Name_<English>')
  name_key      TEXT,                  -- .nameKey
  boss_name     TEXT,                  -- t(.bossNameKey)
  harbinger_name TEXT,                 -- t(.harbingerNameKey)
  raw_json      TEXT NOT NULL          -- timelineData.<k> WITHOUT difficulties / mods / empoweredMods
);

CREATE TABLE timeline_difficulties (
  timeline_id   INTEGER NOT NULL REFERENCES timelines (timeline_id),
  difficulty_index INTEGER NOT NULL,   -- index in .difficulties[] (0 normal, 1 empowered)
  level         INTEGER,               -- .difficulties[].level (area level)
  max_stability INTEGER,               -- .difficulties[].maxStability
  has_corruption_mod INTEGER,          -- .difficulties[].hasCorruptionMod
  corruption_mod_id INTEGER,           -- decoded .difficulties[].modFromCorruption (monster_mods.mod_id)
  minimum_corruption INTEGER,          -- .difficulties[].minimumCorruption
  maximum_corruption INTEGER,          -- .difficulties[].maximumCorruption (with hasMaxCorruption)
  corruption_required_per_level INTEGER, -- .difficulties[].corruptionRequiredPerLevel
  requirements_json TEXT,              -- .difficulties[].requirements (JSON)
  raw_json      TEXT NOT NULL,         -- .difficulties[i] (blessing lists also in timeline_blessings)
  PRIMARY KEY (timeline_id, difficulty_index)
) WITHOUT ROWID;

CREATE TABLE timeline_blessings (
  timeline_id   INTEGER NOT NULL,
  difficulty_index INTEGER NOT NULL,
  slot_kind     TEXT NOT NULL,         -- 'first' | 'other' | 'any' (first/other/anySlotBlessings)
  ord           INTEGER NOT NULL,      -- position in the list
  blessing_sub_type_id INTEGER NOT NULL, -- list value = item_subtypes(34, sub_type_id) = blessings.sub_type_id
  PRIMARY KEY (timeline_id, difficulty_index, slot_kind, ord),
  FOREIGN KEY (timeline_id, difficulty_index) REFERENCES timeline_difficulties (timeline_id, difficulty_index)
) WITHOUT ROWID;
CREATE INDEX timeline_blessings_blessing ON timeline_blessings (blessing_sub_type_id);

CREATE TABLE endgame_mod_refs (
  content_kind  TEXT NOT NULL,         -- 'timeline' | 'dungeon' | 'arena'
  content_id    INTEGER NOT NULL,      -- timeline_id | dungeon_id | arena_id
  tier          INTEGER,               -- dungeon/arena: index in .tiers[]; timeline: NULL
  list_name     TEXT NOT NULL,         -- timeline: 'mods' | 'empoweredMods'; dungeon: 'startingMods' | 'otherFloorExitMods' | 'penultimateFloorExitMods';
                                       -- arena: 'startingMods' | 'modPools[<i>].firstOptionMods' | '...secondOptionMods' | '...anyOptionMods'
  ord           INTEGER NOT NULL,      -- position in the list
  monster_mod_id INTEGER,              -- decoded compact id (monster_mods.mod_id)
  compact_id    TEXT NOT NULL,         -- the list entry (or .mod for timelines)
  minimum_depth INTEGER,               -- timeline mods[].minimumDepth
  maximum_depth INTEGER,               -- timeline mods[].maximumDepth (when hasMaximumDepth)
  wave_offered_after INTEGER,          -- arena modPools[].waveOfferedAfter
  PRIMARY KEY (content_kind, content_id, tier, list_name, ord)
);
CREATE INDEX endgame_mod_refs_mod ON endgame_mod_refs (monster_mod_id);

CREATE TABLE dungeons (
  dungeon_id    INTEGER PRIMARY KEY,   -- dungeonData.<k>.id (1..3)
  slug          TEXT,                  -- .slug
  name          TEXT,                  -- t(.nameKey)
  name_key      TEXT,                  -- .nameKey
  boss_name     TEXT,                  -- t(.bossNameKey)
  area_name     TEXT,                  -- t(.location.areaKey)
  era_name      TEXT,                  -- t(.location.eraKey)
  key_compact_ids TEXT,                -- .key[] joined with ','
  raw_json      TEXT NOT NULL          -- dungeonData.<k> WITHOUT tiers
);

CREATE TABLE dungeon_tiers (
  dungeon_id    INTEGER NOT NULL REFERENCES dungeons (dungeon_id),
  tier          INTEGER NOT NULL,      -- index in .tiers[]
  level         INTEGER,               -- .tiers[].level
  character_level_required INTEGER,    -- .tiers[].characterLevelRequiredToUnlock
  raw_json      TEXT NOT NULL,         -- .tiers[i] (mod lists also in endgame_mod_refs)
  PRIMARY KEY (dungeon_id, tier)
) WITHOUT ROWID;

CREATE TABLE arenas (
  arena_id      INTEGER PRIMARY KEY,   -- arenaData.<k>.id (1..2)
  slug          TEXT,                  -- .slug
  name          TEXT,                  -- t(.nameKey)
  name_key      TEXT,                  -- .nameKey
  boss_names    TEXT,                  -- t() of .bossNameKeys[] joined with ', '
  area_name     TEXT,                  -- t(.location.areaKey)
  raw_json      TEXT NOT NULL          -- arenaData.<k> WITHOUT tiers
);

CREATE TABLE arena_tiers (
  arena_id      INTEGER NOT NULL REFERENCES arenas (arena_id),
  tier          INTEGER NOT NULL,      -- index in .tiers[]
  level         INTEGER,               -- .tiers[].level
  tier_type     INTEGER,               -- .tiers[].tierType
  raw_json      TEXT NOT NULL,         -- .tiers[i]
  PRIMARY KEY (arena_id, tier)
) WITHOUT ROWID;

CREATE TABLE monolith_rewards (
  idx           INTEGER PRIMARY KEY,   -- index in monolithRewards.monolithRewards[]
  title         TEXT,                  -- t(.titleKey)
  title_key     TEXT,                  -- .titleKey
  reward_type   INTEGER,               -- .rewardType
  weighting     REAL,                  -- .weighting
  minimum_tier  INTEGER,               -- .minimumTier
  sprite        TEXT,                  -- .sprite
  raw_json      TEXT NOT NULL          -- monolithRewards.monolithRewards[idx]
);

CREATE TABLE monolith_reward_groups (
  idx           INTEGER PRIMARY KEY,   -- index in monolithRewards.monolithRewardRollGroups[]
  title         TEXT,                  -- t(.titleKey)
  title_key     TEXT,                  -- .titleKey
  weighting     REAL,                  -- .weighting
  minimum_tier  INTEGER,               -- .minimumTier
  minimum_level INTEGER,               -- .minimumLevel
  droppable_rewards TEXT,              -- .droppableRewards (JSON array of monolith_rewards.idx)
  timeline_ids  TEXT,                  -- .timelineCompatibility (JSON array)
  raw_json      TEXT NOT NULL
);

CREATE TABLE woven_echoes (
  echo_id       INTEGER PRIMARY KEY,   -- wovenEchoList[].id
  slug          TEXT,                  -- .slug
  name          TEXT,                  -- t(.displayNameKey)
  name_key      TEXT,                  -- .displayNameKey
  description   TEXT,                  -- t(.descriptionKey)
  description_key TEXT,                -- .descriptionKey
  content_type  INTEGER,               -- .contentType
  weaver_points INTEGER,               -- .weaverPointsForCompletion
  woven_echo_cost INTEGER,             -- .wovenEchoCost
  raw_json      TEXT NOT NULL
);

CREATE TABLE factions (
  faction_id    INTEGER PRIMARY KEY,   -- factionList[].factionId
  name          TEXT,                  -- t(.factionNameKey)
  name_key      TEXT,                  -- .factionNameKey
  scene_name    TEXT,                  -- t(.factionSceneNameKey)
  main_color    TEXT,                  -- .mainColor
  raw_json      TEXT NOT NULL          -- factionList[i] WITHOUT reputationReqForNextRanks
);

CREATE TABLE faction_ranks (
  faction_id    INTEGER NOT NULL REFERENCES factions (faction_id),
  rank          INTEGER NOT NULL,      -- index in .reputationReqForNextRanks[] + 1
  reputation_required INTEGER,         -- .reputationReqForNextRanks[].reputationRequired
  title         TEXT,                  -- t(.rankTitleKey)
  description   TEXT,                  -- t(.rankDescriptionKey)
  raw_json      TEXT NOT NULL,
  PRIMARY KEY (faction_id, rank)
) WITHOUT ROWID;

CREATE TABLE prophecy_unlocks (
  kind          TEXT NOT NULL,         -- 'slot' (prophecyData.slotUnlockRanks[]) | 'lens' (prophecyData.lensUnlockRanks[]) | 'bag' (merchantsGuildBagData.bagUnlockRanks[])
  ord           INTEGER NOT NULL,      -- position in the list
  rank          INTEGER NOT NULL,      -- faction rank required (slotUnlockRanks[i] or .rank)
  base_type_id  INTEGER,               -- .baseTypeId (lens 109 / bag 108)
  sub_type_id   INTEGER,               -- .subTypeId
  PRIMARY KEY (kind, ord)
) WITHOUT ROWID;

CREATE TABLE scenes (
  scene_code    TEXT PRIMARY KEY,      -- itemDB.sceneList.<k> (e.g. 'A10', 'M_B50', 'Dun1Q10')
  name          TEXT,                  -- t(.nameKey)
  name_key      TEXT,                  -- .nameKey
  level         INTEGER,               -- .level
  era           INTEGER,               -- .era (0 Ancient .. 4 End of Time, partly inferred)
  type          INTEGER,               -- .type (0 zone, 1 monolith echo, 2 arena, 3 hub, 5 dungeon, 6 special)
  raw_json      TEXT NOT NULL
) WITHOUT ROWID;

-- =============================================================================
-- Maxroll-only data                                                      [world]
-- =============================================================================

CREATE TABLE maxroll_quests (
  quest_id      INTEGER PRIMARY KEY,   -- MR:quests[].id
  name          TEXT,                  -- MR:quests[].name (== t('Quests.Quest_<id>_Name'))
  name_key      TEXT,                  -- 'Quests.Quest_<id>_Name' when present in i18n
  chapter       INTEGER,               -- MR:quests[].chapter
  main_line     INTEGER,               -- MR:quests[].mainLineQuest
  idol_unlock_reward INTEGER,          -- MR:quests[].idolUnlockReward
  passive_points_reward INTEGER,       -- MR:quests[].passivePointsReward
  all_attributes_reward INTEGER,       -- MR:quests[].allAttributesReward
  completed_step INTEGER,              -- MR:quests[].completed
  experience_reward INTEGER,           -- checklist.questList.<id>.experienceReward (LE Tools, 36 quests)
  gold_reward   INTEGER,               -- checklist.questList.<id>.goldReward (LE Tools)
  letools_json  TEXT,                  -- checklist.questList.<id> when present
  raw_json      TEXT NOT NULL          -- MR:quests[i]
);

CREATE TABLE maxroll_crosscheck (
  entity        TEXT NOT NULL,         -- 'unique' | 'affix' | 'ailment' | 'class' | ...
  entity_id     TEXT NOT NULL,         -- id in both sources
  field         TEXT NOT NULL,         -- compared field (e.g. 'name', 'mods', 'tiers', 'baseHealth', 'missing_in_maxroll')
  letools_value TEXT,                  -- LE Tools value (JSON / text)
  maxroll_value TEXT,                  -- Maxroll value (JSON / text)
  note          TEXT,                  -- classification (e.g. 'float_noise', 'escape', 'real')
  PRIMARY KEY (entity, entity_id, field)
) WITHOUT ROWID;

-- =============================================================================
-- Shared: relations between stat lines / nodes and abilities / ailments  [shared]
-- =============================================================================

CREATE TABLE relations (
  id            INTEGER PRIMARY KEY,   -- insertion order
  source_kind   TEXT NOT NULL,         -- 'affix' | 'unique' | 'set' | 'implicit' (itemDB rel* maps, [items])
                                       -- | 'skill_node' | 'passive_node' | 'weaver_node' (tree nodes, [skills])
  source_id     TEXT NOT NULL,         -- affix_id | unique_id | set_id | '<base>:<sub>' | '<tree>:<node>'
  source_sub    INTEGER,               -- U compact ids: line index digits; I: implicit index; else NULL
  relation      TEXT NOT NULL,         -- 'mod_ability' (itemDB.relModAbilities / node.relatedAbilities) | 'mod_ailment' (relModAilments / node.relatedAilments)
                                       -- | 'inc_level_ability' (relIncLevelAbilities) | 'triggered_ability' | 'triggered_ailment' (triggered* maps / node.triggered*)
  target_kind   TEXT NOT NULL,         -- 'ability' | 'ailment'
  target_id     TEXT NOT NULL,         -- ability id string | AilmentID as text
  value         INTEGER,               -- triggeredAilments stacks / triggeredAbilities value; else NULL
  compact_id    TEXT                   -- itemDB map key (NULL for tree nodes)
);
CREATE INDEX relations_source ON relations (source_kind, source_id);
CREATE INDEX relations_target ON relations (target_kind, target_id);

-- =============================================================================
-- THE MODS TABLE: one row per stat line from any source                  [shared]
-- =============================================================================
--
-- Every stat line in the game data becomes one row (stat blocks of the shape
-- {addedValue, increasedValue, moreValues[]} are expanded into one row per non-zero component,
-- sub_ord numbering them). Written ONLY through lib/stat-lines.ts insertMod()/insertStatBlock().
--
-- source_kind values and their source_id / source_ord:
--   affix_tier                 affix_id            affixProperties index; tier = 1-based tier       [items]
--   implicit                   '<base>:<sub>'      implicits index                                  [items]
--   blessing                   '34:<sub>'          implicits index (blessing sub types)             [items]
--   idol_altar                 '41:<sub>'          implicits index (idol altar sub types)           [items]
--   unique_mod                 unique_id           mods index (== tooltipEntries modDisplay < 128)  [items]
--   set_bonus                  set_id              mods index; set_requirement = pieces             [items]
--   skill_node                 '<tree>:<node>'     stats index                                      [skills]
--   passive_node               '<tree>:<node>'     stats index (class trees pr-1..rg-1)             [skills]
--   weaver_node                'weaver:<node>'     stats index                                      [skills]
--   ailment_buff               ailment_id          buffs index                                      [skills]
--   ability_attribute_scaling  ability_id          running index; context 'attribute:<id>'          [skills]
--   ability_level_scaling      ability_id          levelScaling index                               [skills]
--   ability_component          '<ability>:<ord>'   component stats/buffs index (optional)           [skills]
--   monster_mod                mod_id              stats index                                      [world]
--   attribute                  attribute_id        coreAttributes stats index                       [world]
--   attribute_corrupted        attribute_id        coreAttributes corruptedStats index              [world]

CREATE TABLE mods (
  id            INTEGER PRIMARY KEY,   -- insertion order (deterministic)
  source_kind   TEXT NOT NULL,         -- see the list above
  source_id     TEXT NOT NULL,         -- owning record key (text)
  source_ord    INTEGER NOT NULL,      -- line order within the owner
  sub_ord       INTEGER NOT NULL DEFAULT 0, -- component index when a stat block expands to several rows (added, increased, more...)
  tier          INTEGER,               -- affix tier (1-based) for affix_tier rows; NULL otherwise
  property      INTEGER,               -- stat property id: SP 0..133, LocalSP 1001+, skill-local 5000+/10000+/15000+/20000+/25000+
  property_name TEXT,                  -- resolved name: indirect 58/98/130 resolved to the ability/player/altar property name,
                                       -- otherwise stat_properties.name; NULL for skill-local ids (see label)
  special_tag   INTEGER NOT NULL DEFAULT 0, -- .specialTag (AilmentID, trigger event, conditional index, ability property index...)
  tags          INTEGER NOT NULL DEFAULT 0, -- .tags (AT mask; an index for indirect properties 58/88/98/130)
  tag_names     TEXT,                  -- describeTags(tags), comma list; NULL for indirect properties or tags = 0
  extra_tag     INTEGER NOT NULL DEFAULT 0, -- .extraTag (ability index for ability-bound lines)
  modifier_type INTEGER CHECK (modifier_type IS NULL OR modifier_type IN (0, 1, 2)), -- 0 added, 1 increased, 2 more; NULL for display-only lines (tree nodes)
  value_min     REAL,                  -- minimum roll (affix rolls[].min, unique mods[].value, implicitValue, set mods[].value, addedValue...)
  value_max     REAL,                  -- maximum roll (rolls[].max, mods[].maxValue, implicitMaxValue); = value_min for fixed values
  display       TEXT,                  -- display string when the source only has text (tree node stats[].value, e.g. '+25%')
  label         TEXT,                  -- line label from the source (tree node stat name, affix modDisplayName, ...)
  label_key     TEXT,                  -- i18n key of label (statNameKey, modDisplayNameKey)
  context       TEXT,                  -- qualifier, e.g. 'attribute:2' (per point of Intelligence), 'per_level'
  set_requirement INTEGER,             -- set_bonus: setBonusList[].mods[].setRequirement
  hidden        INTEGER NOT NULL DEFAULT 0, -- .hideInTooltip
  is_downside   INTEGER NOT NULL DEFAULT 0, -- tree node stats[].downside
  raw_json      TEXT NOT NULL          -- the source stat line object
);
CREATE INDEX mods_property ON mods (property, modifier_type);
CREATE INDEX mods_source ON mods (source_kind, source_id);
CREATE INDEX mods_tags ON mods (tags);
CREATE UNIQUE INDEX mods_identity ON mods (source_kind, source_id, coalesce(tier, 0), source_ord, sub_ord);

-- =============================================================================
-- Full-text search                                                      [search]
-- =============================================================================
-- kind: unique | affix | item_subtype | ability | skill_node | passive_node | weaver_node | ailment |
--       stat_property | player_property | ability_property | set | blessing | monster_mod | timeline | dungeon
-- id:   the key of the row in its table (as text; '<tree>:<node>' / '<base>:<sub>' / '<ability_index>:<prop_index>')

CREATE VIRTUAL TABLE search USING fts5 (
  kind UNINDEXED,
  id UNINDEXED,
  name,
  text,
  tokenize = 'porter unicode61'
);

-- =============================================================================
-- Views
-- =============================================================================

-- Mods with property / modifier / owner names resolved.
CREATE VIEW v_mods_named AS
SELECT
  m.id,
  m.source_kind,
  m.source_id,
  m.source_ord,
  m.sub_ord,
  m.tier,
  CASE m.source_kind
    WHEN 'affix_tier'   THEN (SELECT a.name FROM affixes a WHERE a.affix_id = CAST(m.source_id AS INTEGER))
    WHEN 'unique_mod'   THEN (SELECT u.name FROM uniques u WHERE u.unique_id = CAST(m.source_id AS INTEGER))
    WHEN 'set_bonus'    THEN (SELECT s.name FROM sets s WHERE s.set_id = CAST(m.source_id AS INTEGER))
    WHEN 'ailment_buff' THEN (SELECT al.name FROM ailments al WHERE al.ailment_id = CAST(m.source_id AS INTEGER))
    WHEN 'monster_mod'  THEN (SELECT coalesce(mm.description, mm.objective_text, mm.title) FROM monster_mods mm WHERE mm.mod_id = CAST(m.source_id AS INTEGER))
    WHEN 'attribute'    THEN (SELECT at.name FROM attributes at WHERE at.attribute_id = CAST(m.source_id AS INTEGER))
    WHEN 'attribute_corrupted' THEN (SELECT at.name FROM attributes at WHERE at.attribute_id = CAST(m.source_id AS INTEGER))
    WHEN 'ability_attribute_scaling' THEN (SELECT ab.name FROM abilities ab WHERE ab.ability_id = m.source_id)
    WHEN 'ability_level_scaling'     THEN (SELECT ab.name FROM abilities ab WHERE ab.ability_id = m.source_id)
    WHEN 'ability_component' THEN (SELECT ab.name FROM abilities ab WHERE ab.ability_id = substr(m.source_id, 1, instr(m.source_id, ':') - 1))
    WHEN 'skill_node'   THEN (SELECT n.name FROM tree_nodes n WHERE n.tree_id = substr(m.source_id, 1, instr(m.source_id, ':') - 1) AND n.node_id = CAST(substr(m.source_id, instr(m.source_id, ':') + 1) AS INTEGER))
    WHEN 'passive_node' THEN (SELECT n.name FROM tree_nodes n WHERE n.tree_id = substr(m.source_id, 1, instr(m.source_id, ':') - 1) AND n.node_id = CAST(substr(m.source_id, instr(m.source_id, ':') + 1) AS INTEGER))
    WHEN 'weaver_node'  THEN (SELECT n.name FROM tree_nodes n WHERE n.tree_id = substr(m.source_id, 1, instr(m.source_id, ':') - 1) AND n.node_id = CAST(substr(m.source_id, instr(m.source_id, ':') + 1) AS INTEGER))
    ELSE (SELECT st.name FROM item_subtypes st WHERE st.base_type_id = CAST(substr(m.source_id, 1, instr(m.source_id, ':') - 1) AS INTEGER) AND st.sub_type_id = CAST(substr(m.source_id, instr(m.source_id, ':') + 1) AS INTEGER))
  END AS source_name,
  m.property,
  sp.enum_name AS property_enum,
  coalesce(m.property_name, sp.name, m.label) AS property_name,
  m.label,
  m.special_tag,
  m.tags,
  m.tag_names,
  m.extra_tag,
  m.modifier_type,
  CASE m.modifier_type WHEN 0 THEN 'added' WHEN 1 THEN 'increased' WHEN 2 THEN 'more' END AS modifier_name,
  m.value_min,
  m.value_max,
  m.display,
  m.context,
  m.set_requirement,
  m.hidden,
  m.is_downside
FROM mods m
LEFT JOIN stat_properties sp ON sp.property = m.property;

-- One row per unique: base, set, mods and tooltip text flattened.
CREATE VIEW v_unique_summary AS
SELECT
  u.unique_id,
  u.name,
  bt.name AS base_type,
  st.name AS sub_type,
  u.level_requirement,
  u.is_set_item,
  s.name AS set_name,
  u.legendary_type,
  u.lp_eligible,
  u.mod_count,
  (SELECT group_concat(
            coalesce(m.property_name, m.label, '?') || ' ' ||
            CASE m.modifier_type WHEN 0 THEN 'added' WHEN 1 THEN 'increased' WHEN 2 THEN 'more' ELSE '' END || ' ' ||
            CASE WHEN m.value_min = m.value_max OR m.value_max IS NULL THEN printf('%g', m.value_min)
                 ELSE printf('%g..%g', m.value_min, m.value_max) END ||
            CASE WHEN m.tag_names IS NOT NULL THEN ' [' || m.tag_names || ']' ELSE '' END,
            '; ' ORDER BY m.source_ord, m.sub_ord)
     FROM mods m WHERE m.source_kind = 'unique_mod' AND m.source_id = CAST(u.unique_id AS TEXT)) AS mods_text,
  (SELECT group_concat(tt.text, ' | ' ORDER BY tt.ord)
     FROM unique_tooltips tt WHERE tt.unique_id = u.unique_id) AS tooltip_text,
  u.lore
FROM uniques u
LEFT JOIN item_base_types bt ON bt.base_type_id = u.base_type_id
LEFT JOIN item_subtypes st ON st.base_type_id = u.base_type_id AND st.sub_type_id = u.sub_type_id
LEFT JOIN sets s ON s.set_id = u.set_id;

-- One row per affix: tier count, roll range of each stat line across tiers, where it rolls.
CREATE VIEW v_affix_summary AS
SELECT
  a.affix_id,
  a.name,
  a.title,
  a.affix_type_name,
  a.kind,
  a.special_affix_type,
  a.rolls_on,
  a.class_names,
  dc.name AS display_category,
  a.tier_count,
  a.stat_count,
  (SELECT min(m.value_min) FROM mods m WHERE m.source_kind = 'affix_tier' AND m.source_id = CAST(a.affix_id AS TEXT) AND m.source_ord = 0) AS min_value,
  (SELECT max(m.value_max) FROM mods m WHERE m.source_kind = 'affix_tier' AND m.source_id = CAST(a.affix_id AS TEXT) AND m.source_ord = 0) AS max_value,
  (SELECT group_concat(
            coalesce(s.property_name, s.label) || ' ' ||
            CASE s.modifier_type WHEN 0 THEN 'added' WHEN 1 THEN 'increased' WHEN 2 THEN 'more' END ||
            (SELECT printf(' %g..%g', min(m.value_min), max(m.value_max)) FROM mods m
              WHERE m.source_kind = 'affix_tier' AND m.source_id = CAST(a.affix_id AS TEXT) AND m.source_ord = s.ord),
            '; ' ORDER BY s.ord)
     FROM affix_stats s WHERE s.affix_id = a.affix_id) AS stats_text,
  (SELECT group_concat(bt.name, ', ' ORDER BY r.ord)
     FROM affix_can_roll_on r JOIN item_base_types bt ON bt.base_type_id = r.base_type_id
    WHERE r.affix_id = a.affix_id) AS rolls_on_text,
  a.level_requirement
FROM affixes a
LEFT JOIN affix_display_categories dc ON dc.idx = a.display_category;

-- One row per tree node with its stat lines flattened.
CREATE VIEW v_skill_node_summary AS
SELECT
  n.tree_id,
  n.tree_kind,
  t.name AS tree_name,
  t.ability_id,
  n.node_id,
  n.name,
  n.max_points,
  n.mastery,
  n.mastery_requirement,
  n.description,
  (SELECT group_concat(coalesce(m.label, m.property_name, '?') || ': ' || coalesce(m.display, printf('%g', m.value_min), ''),
                       '; ' ORDER BY m.source_ord, m.sub_ord)
     FROM mods m
    WHERE m.source_kind IN ('skill_node', 'passive_node', 'weaver_node')
      AND m.source_id = n.tree_id || ':' || n.node_id) AS stats_text,
  (SELECT group_concat(r.required_node_id || '>=' || r.required_points, ',' ORDER BY r.ord)
     FROM tree_node_requirements r WHERE r.tree_id = n.tree_id AND r.node_id = n.node_id) AS requires
FROM tree_nodes n
JOIN trees t ON t.tree_id = n.tree_id;

-- Blessings with their timeline and roll ranges (one row per blessing stat line).
CREATE VIEW v_blessings AS
SELECT
  b.sub_type_id,
  b.name,
  b.timeline_id,
  tl.name AS timeline_name,
  b.difficulty_index,
  b.is_grand,
  b.slot_kind,
  m.source_ord,
  m.property,
  coalesce(m.property_name, sp.name) AS property_name,
  m.tag_names,
  m.modifier_type,
  CASE m.modifier_type WHEN 0 THEN 'added' WHEN 1 THEN 'increased' WHEN 2 THEN 'more' END AS modifier_name,
  m.value_min,
  m.value_max
FROM blessings b
LEFT JOIN timelines tl ON tl.timeline_id = b.timeline_id
LEFT JOIN mods m ON m.source_kind = 'blessing' AND m.source_id = '34:' || b.sub_type_id
LEFT JOIN stat_properties sp ON sp.property = m.property;

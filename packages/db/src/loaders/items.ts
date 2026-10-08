/**
 * ITEMS LOADER  (owner: items agent; nobody else edits this file)
 * =============================================================================
 *
 * export function loadItems(ctx: LoaderContext): void
 *
 * Runs after loadWorld (but must not READ world tables: `--only items` builds run it alone).
 * Everything it needs comes from ctx.raw; names come from ctx.t; stat lines go through
 * ctx.mods.insert(...) / ctx.mods.insertStatBlock(...); other rows through insertRow(ctx.db, ...).
 * Iterate keyed collections with sortedEntries(); arrays in array order. No randomness, no clock.
 *
 * Tables filled (in this order), with raw sources:
 *
 *  1. item_base_types       itemDB.itemList.equippable.<k> (39) + itemDB.itemList.nonEquippable.<k> (9)
 *                           name = t(displayNameKey); category from itemList.lootFilterVisualCategories
 *                           (header names via t(categories[].nameKey)); 'Blessing' for 34, 'Lens' for 35..39
 *                           and 109, 'Idol Altar' for 41; is_idol = 25..33; disabled_to_roll from
 *                           itemList.disabledBaseTypesToRoll; raw_json = rawJson(record, ['subItems']).
 *                           Non-equippable records have no baseTypeId field: use the object key.
 *  2. item_subtypes         <baseType>.subItems.<k> (918 + 640 = 1558); class_requirement_names via
 *                           classRequirementNames(); letools_compact_id = implicitCompactId(base, sub, 0);
 *                           lens_effect = t(lensEffectKey) ?? lensEffect; implicit_count.
 *  3. mods (implicits)      subItems[].implicits[] (1529 lines): one insertMod per line with
 *                           modifierType = .type, valueMin = .implicitValue, valueMax = .implicitMaxValue,
 *                           sourceId '<base>:<sub>', sourceOrd = index, sourceKind:
 *                             'blessing'   for base type 34 (234 lines)
 *                             'idol_altar' for base type 41 (11 lines)
 *                             'implicit'   otherwise (1284 lines)
 *  4. affix_display_categories  itemDB.affixList.displayCategoryKeys[] (45) + categoryHeaders[] (12)
 *  5. affixes               itemDB.affixList.singleAffixes.<k> (616, kind 'single') and
 *                           .multiAffixes.<k> (540, kind 'multi'), merged and sorted by affix_id (1156);
 *                           name = t(affixDisplayNameKey), title = t(affixTitleKey), filter_name =
 *                           t(lootFilterOverrideNameKey); affix_type_name 'prefix'/'suffix' from .type;
 *                           class_names via classSpecificityNames(); letools_compact_id = affixCompactId(id);
 *                           for_unique_id 0 -> NULL.
 *  6. affix_stats           .affixProperties[] (1696): label = t(modDisplayNameKey),
 *                           property_name = ctx.mods.lineName(property, tags, specialTag)
 *  7. affix_tiers           .tiers[] (6238), tier = index + 1
 *  8. mods (affix rolls)    .tiers[t].rolls[i] (9711 rows): sourceKind 'affix_tier', sourceId affix_id,
 *                           sourceOrd i (== affix_stats.ord), tier t+1, property/specialTag/tags/extraTag/
 *                           modifierType from affixProperties[i], valueMin = roll.min, valueMax = roll.max,
 *                           label = t(affixProperties[i].modDisplayNameKey), raw = the roll object
 *                           merged with the property line ({...affixProperties[i], ...roll}).
 *  9. affix_can_roll_on     .canRollOn[] (2539)
 * 10. affix_reroll_chances  .specificRerollChances[] (201)
 * 11. sets                  itemDB.setBonusList[] (25, includes set 0); set_name = .setName ??
 *                           itemDB.setNames.<id>; letools_compact_id = setCompactId(id); item_count
 *                           filled after uniques (UPDATE ... count of uniques.set_id).
 * 12. mods (set bonuses)    setBonusList[].mods[] (54): sourceKind 'set_bonus', sourceId set_id,
 *                           modifierType = .type, value = .value, setRequirement = .setRequirement,
 *                           hidden = .hideInTooltip
 * 13. set_tooltips          setBonusList[].tooltipDescriptions[] (18)
 * 14. uniques               itemDB.uniqueList.uniques.<k> (486); set_id NULL unless isSetItem;
 *                           sub_type_id = subTypeIds[0]; mod_count.
 * 15. unique_subtypes       .subTypeIds[] (486)
 * 16. mods (unique mods)    .mods[] (2440): sourceKind 'unique_mod', sourceId unique_id, sourceOrd =
 *                           index (tooltipEntries modDisplay < 128 refers to it), modifierType = .type,
 *                           valueMin = .value, valueMax = .maxValue, hidden = .hideInTooltip
 * 17. unique_tooltips       .tooltipDescriptions[] (562)
 * 18. unique_tooltip_entries .tooltipEntries[] (2459); ref_kind 'mod' when modDisplay < 128 else
 *                           'description' with ref_index = modDisplay - 128
 * 19. idol_altars           equippable.41.subItems (13), grid_index = position in ascending sub type
 *                           order into itemDB.altarGrids.grids[] (13), default_grid_json = defaultGrid
 * 20. blessings             equippable.34.subItems (224); timeline_id / difficulty_index / slot_kind
 *                           from the FIRST occurrence when scanning timelineData in sortedEntries order,
 *                           difficulties[] in order, lists in the order first, other, any;
 *                           is_grand = difficulty_index = 1. (Every blessing is in exactly one timeline.)
 * 21. relations             itemDB.relModAbilities ('mod_ability'), relModAilments ('mod_ailment'),
 *                           relIncLevelAbilities ('inc_level_ability'), triggeredAbilities
 *                           ('triggered_ability', value = map value), triggeredAilments
 *                           ('triggered_ailment', value = stacks). Keys decoded with decodeCompactId():
 *                           source_kind 'affix' (A) | 'unique' (U, source_sub = line digits) |
 *                           'set' (S) | 'implicit' (I, source_id '<base>:<sub>', source_sub = implicit index);
 *                           compact_id = the key. Skip itemDB.relatedAbilities (identical to relModAbilities).
 *                           2207 rows.
 * 22. compact_ids           every distinct key of the five maps above (1014): decodeCompactId(),
 *                           resolves = target row exists. Use insertRow(..., { conflict: 'ignore' }).
 *
 * mods source kinds written: affix_tier, implicit, blessing, idol_altar, unique_mod, set_bonus.
 */
import { count, modsCount, type ExpectedCount } from "../lib/expected.js";
import type { LoaderContext } from "../lib/context.js";
import { insertRow } from "../lib/sqlite.js";
import { bool, classRequirementNames, classSpecificityNames, int, num, rawJson, sortedEntries, str, type JsonObject } from "../lib/util.js";
import { affixCompactId, decodeCompactId, implicitCompactId, setCompactId } from "../lib/ids.js";

/** Tables this loader owns (the build and tests check they exist in schema.sql). */
export const tables = [
  "item_base_types",
  "item_subtypes",
  "affix_display_categories",
  "affixes",
  "affix_stats",
  "affix_tiers",
  "affix_can_roll_on",
  "affix_reroll_chances",
  "sets",
  "set_tooltips",
  "uniques",
  "unique_subtypes",
  "unique_tooltips",
  "unique_tooltip_entries",
  "idol_altars",
  "blessings",
] as const;

/** Shared tables this loader writes rows into (rows identified by source_kind / kind). */
export const sharedTables = ["mods", "relations", "compact_ids"] as const;

/** mods.source_kind values this loader writes. */
export const modSourceKinds = ["affix_tier", "implicit", "blessing", "idol_altar", "unique_mod", "set_bonus"] as const;

/** Acceptance counts (docs/data-sources/counts.md; mods counts computed from the 1.5.2 raw data). */
export const expected: ExpectedCount[] = [
  count("item_base_types", 48, undefined, undefined, "equippable 39 + nonEquippable 9"),
  count("item_subtypes", 1558, undefined, undefined, "918 + 640"),
  count("affix_display_categories", 45),
  count("affixes", 1156, undefined, undefined, "single 616 + multi 540"),
  count("affixes", 616, "kind = 'single'"),
  count("affix_stats", 1696),
  count("affix_tiers", 6238),
  count("affix_can_roll_on", 2539),
  count("affix_reroll_chances", 218, undefined, undefined, "sum of specificRerollChances[] (78 affixes); contract said 201"),
  count("sets", 25, undefined, undefined, "setBonusList incl. set 0"),
  count("set_tooltips", 18),
  count("uniques", 486),
  count("uniques", 61, "is_set_item = 1"),
  count("unique_subtypes", 486),
  count("unique_tooltips", 562),
  count("unique_tooltip_entries", 2459),
  count("idol_altars", 13),
  count("blessings", 224),
  count("blessings", 224, "timeline_id IS NOT NULL", "blessings[with timeline]"),
  modsCount("affix_tier", 9711, "sum of tiers[].rolls[]"),
  modsCount("implicit", 1284),
  modsCount("blessing", 234),
  modsCount("idol_altar", 11),
  {
    name: "implicits (all kinds)",
    sql: "SELECT count(*) FROM mods WHERE source_kind IN ('implicit','blessing','idol_altar')",
    expected: 1529,
    source: "counts.md implicits",
  },
  modsCount("unique_mod", 2440),
  modsCount("set_bonus", 54),
  count("relations", 2207, "source_kind IN ('affix','unique','set','implicit')", "relations[items]"),
  { name: "compact_ids[A,U,S,I]", sql: "SELECT count(*) FROM compact_ids WHERE kind IN ('A','U','S','I')", expected: 1014, op: ">=" },
];

type Obj = JsonObject;

const BLESSING_BASE = 34;
const ALTAR_BASE = 41;
const LENS_BASES = new Set([35, 36, 37, 38, 39, 109]);

function implicitKind(base: number): "blessing" | "idol_altar" | "implicit" {
  return base === BLESSING_BASE ? "blessing" : base === ALTAR_BASE ? "idol_altar" : "implicit";
}

export function loadItems(ctx: LoaderContext): void {
  const { db, t } = ctx;
  const itemDB = ctx.raw.letools.itemDB as Obj;
  const itemList = itemDB.itemList as Obj;

  // --- 1/2/3. base types, sub types, implicits ------------------------------------------------
  const categoryOf = new Map<number, string | null>();
  for (const header of itemList.lootFilterVisualCategories ?? []) {
    for (const cat of header.categories ?? []) {
      const name = t(cat.nameKey);
      for (const id of cat.entries ?? []) if (!categoryOf.has(id)) categoryOf.set(id, name);
    }
  }
  const disabled = new Set<number>(itemList.disabledBaseTypesToRoll ?? []);
  const subtypeKeys = new Set<string>();

  const baseGroups: [boolean, Obj][] = [
    [true, itemList.equippable ?? {}],
    [false, itemList.nonEquippable ?? {}],
  ];
  for (const [equippable, group] of baseGroups) {
    for (const [key, b] of sortedEntries<Obj>(group)) {
      const baseId = int(b.baseTypeId) ?? Number(key);
      let category = categoryOf.get(baseId) ?? null;
      if (baseId === BLESSING_BASE) category = "Blessing";
      else if (LENS_BASES.has(baseId)) category = "Lens";
      else if (baseId === ALTAR_BASE) category = "Idol Altar";
      insertRow(db, "item_base_types", {
        base_type_id: baseId,
        name: t(b.displayNameKey),
        name_key: str(b.displayNameKey),
        equippable: equippable ? 1 : 0,
        category,
        is_weapon: bool(b.isWeapon),
        is_idol: baseId >= 25 && baseId <= 33 ? 1 : 0,
        max_affixes: int(b.maxAffixes),
        size_x: int(b.size?.x),
        size_y: int(b.size?.y),
        type: int(b.type),
        affix_effect_modifier: num(b.affixEffectModifier),
        minimum_drop_level: int(b.minimumDropLevel),
        reroll_chance: num(b.rerollChance),
        class_affinity: int(b.classAffinity),
        disabled_to_roll: disabled.has(baseId) ? 1 : 0,
        raw_json: rawJson(b, ["subItems"]),
      });
    }
  }
  for (const [, group] of baseGroups) {
    for (const [key, b] of sortedEntries<Obj>(group)) {
      const baseId = int(b.baseTypeId) ?? Number(key);
      for (const [skey, s] of sortedEntries<Obj>(b.subItems)) {
        const subId = int(s.subTypeId) ?? Number(skey);
        const implicits: Obj[] = s.implicits ?? [];
        insertRow(db, "item_subtypes", {
          base_type_id: baseId,
          sub_type_id: subId,
          name: t(s.displayNameKey),
          name_key: str(s.displayNameKey),
          description: t(s.descriptionKey),
          description_key: str(s.descriptionKey),
          level_requirement: int(s.levelRequirement),
          class_requirement: int(s.classRequirement),
          class_requirement_names: classRequirementNames(int(s.classRequirement)),
          sub_class_requirement: int(s.subClassRequirement),
          cannot_drop: bool(s.cannotDrop),
          is_corrupted_subtype: bool(s.isCorruptedSubtype),
          is_legacy: bool(s.isLegacySubType),
          obsolete: bool(s.obsoleteItem),
          is_starting_item: bool(s.isStartingItem),
          attack_rate: num(s.attackRate),
          added_weapon_range: num(s.addedWeaponRange),
          affix_effectiveness: num(s.affixEffectiveness),
          item_tags: int(s.itemTags),
          im_set_tier: int(s.IMSetTier),
          lens_effect: t(s.lensEffectKey) ?? str(s.lensEffect),
          sprite: str(s.sprite),
          implicit_count: implicits.length,
          letools_compact_id: implicitCompactId(baseId, subId, 0),
          raw_json: rawJson(s),
        });
        subtypeKeys.add(`${baseId}:${subId}`);
        implicits.forEach((m, i) => {
          ctx.mods.insert({
            sourceKind: implicitKind(baseId),
            sourceId: `${baseId}:${subId}`,
            sourceOrd: i,
            property: m.property,
            specialTag: m.specialTag,
            tags: m.tags,
            extraTag: m.extraTag,
            modifierType: m.type,
            valueMin: m.implicitValue,
            valueMax: m.implicitMaxValue,
            hidden: m.hideInTooltip,
            raw: m,
          });
        });
      }
    }
  }

  // --- 4. affix display categories ------------------------------------------------------------
  const affixList = itemDB.affixList as Obj;
  const headers: Obj[] = affixList.categoryHeaders ?? [];
  (affixList.displayCategoryKeys as string[]).forEach((key, idx) => {
    const h = headers.findIndex((hd) => (hd.categories as number[]).includes(idx));
    insertRow(db, "affix_display_categories", {
      idx,
      name: t(key),
      name_key: key,
      header_index: h >= 0 ? h : null,
      header_name: h >= 0 ? t(headers[h]!.nameKey) : null,
    });
  });

  // --- 5..10. affixes -------------------------------------------------------------------------
  const affixes: [string, Obj][] = [];
  for (const [, a] of sortedEntries<Obj>(affixList.singleAffixes)) affixes.push(["single", a]);
  for (const [, a] of sortedEntries<Obj>(affixList.multiAffixes)) affixes.push(["multi", a]);
  affixes.sort((x, y) => x[1].affixId - y[1].affixId);
  const affixIds = new Set<number>();
  for (const [kind, a] of affixes) {
    const id = a.affixId as number;
    affixIds.add(id);
    const props: Obj[] = a.affixProperties ?? [];
    const tiers: Obj[] = a.tiers ?? [];
    insertRow(db, "affixes", {
      affix_id: id,
      name: t(a.affixDisplayNameKey),
      name_key: str(a.affixDisplayNameKey),
      title: t(a.affixTitleKey),
      title_key: str(a.affixTitleKey),
      filter_name: t(a.lootFilterOverrideNameKey),
      kind,
      affix_type: a.type,
      affix_type_name: a.type === 0 ? "prefix" : "suffix",
      level_requirement: int(a.levelRequirement),
      special_affix_type: int(a.specialAffixType),
      rolls_on: int(a.rollsOn),
      class_specificity: int(a.classSpecificity),
      class_names: classSpecificityNames(int(a.classSpecificity)),
      display_category: int(a.displayCategory),
      group_id: int(a.group),
      title_type: int(a.titleType),
      affix_morphology: int(a.affixMorphology),
      t6_compatibility: int(a.t6Compatibility),
      use_generated_name: bool(a.useGeneratedName),
      single_set_affix: bool(a.singleSetAffix),
      for_unique_id: a.forUniqueId ? int(a.forUniqueId) : null,
      weighting: num(a.weighting),
      reroll_chance: num(a.rerollChance),
      standard_affix_effect_modifier: num(a.standardAffixEffectModifier),
      tier_count: tiers.length,
      stat_count: props.length,
      letools_compact_id: affixCompactId(id),
      raw_json: rawJson(a),
    });
    props.forEach((p, ord) => {
      insertRow(db, "affix_stats", {
        affix_id: id,
        ord,
        property: p.property,
        property_name: ctx.mods.lineName(p.property, p.tags ?? 0, p.specialTag ?? 0),
        special_tag: p.specialTag ?? 0,
        tags: p.tags ?? 0,
        extra_tag: p.extraTag ?? 0,
        modifier_type: p.modifierType,
        label: t(p.modDisplayNameKey),
        label_key: str(p.modDisplayNameKey),
        set_property: int(p.setProperty),
        disable_alt_text: bool(p.disableAltText),
      });
    });
    tiers.forEach((tier, ti) => {
      insertRow(db, "affix_tiers", {
        affix_id: id,
        tier: ti + 1,
        required_level: int(tier.requiredLevel),
        tier_name: str(tier.tierName),
      });
      ((tier.rolls ?? []) as Obj[]).forEach((roll, i) => {
        const p = props[i];
        if (!p) {
          ctx.log.warn(`affix ${id} tier ${ti + 1}: roll ${i} has no affixProperties entry`);
          return;
        }
        ctx.mods.insert({
          sourceKind: "affix_tier",
          sourceId: id,
          sourceOrd: i,
          tier: ti + 1,
          property: p.property,
          specialTag: p.specialTag,
          tags: p.tags,
          extraTag: p.extraTag,
          modifierType: p.modifierType,
          valueMin: roll.min,
          valueMax: roll.max,
          label: t(p.modDisplayNameKey),
          labelKey: str(p.modDisplayNameKey),
          raw: { ...p, ...roll },
        });
      });
    });
    ((a.canRollOn ?? []) as number[]).forEach((base, ord) => {
      insertRow(db, "affix_can_roll_on", { affix_id: id, base_type_id: base, ord }, { conflict: "ignore" });
    });
    ((a.specificRerollChances ?? []) as Obj[]).forEach((r, ord) => {
      insertRow(db, "affix_reroll_chances", {
        affix_id: id,
        ord,
        equipment_type: int(r.equipmentType),
        reroll_chance: num(r.rerollChance),
        weighting: num(r.weighting),
      });
    });
  }

  // --- 11..13. sets ---------------------------------------------------------------------------
  const setIds = new Set<number>();
  for (const s of (itemDB.setBonusList ?? []) as Obj[]) {
    const id = s.setID as number;
    setIds.add(id);
    insertRow(db, "sets", {
      set_id: id,
      name: t(s.nameKey),
      name_key: str(s.nameKey),
      set_name: str(s.setName) ?? str(itemDB.setNames?.[String(id)]),
      item_count: 0,
      letools_compact_id: setCompactId(id),
      raw_json: rawJson(s),
    });
    ((s.mods ?? []) as Obj[]).forEach((m, i) => {
      ctx.mods.insert({
        sourceKind: "set_bonus",
        sourceId: id,
        sourceOrd: i,
        property: m.property,
        specialTag: m.specialTag,
        tags: m.tags,
        extraTag: m.extraTag,
        modifierType: m.type,
        value: m.value,
        setRequirement: m.setRequirement,
        hidden: m.hideInTooltip,
        raw: m,
      });
    });
    ((s.tooltipDescriptions ?? []) as Obj[]).forEach((d, ord) => {
      insertRow(db, "set_tooltips", {
        set_id: id,
        ord,
        set_requirement: int(d.setRequirement),
        set_mod: int(d.setMod),
        text: t(d.descriptionKey),
        text_key: str(d.descriptionKey),
        alt_text: t(d.altTextKey),
        alt_text_key: str(d.altTextKey),
      });
    });
  }

  // --- 14..18. uniques ------------------------------------------------------------------------
  const uniqueIds = new Set<number>();
  for (const [, u] of sortedEntries<Obj>(itemDB.uniqueList?.uniques)) {
    const id = u.uniqueId as number;
    uniqueIds.add(id);
    const isSet = bool(u.isSetItem) === 1;
    const subIds: number[] = u.subTypeIds ?? [];
    const mods: Obj[] = u.mods ?? [];
    insertRow(db, "uniques", {
      unique_id: id,
      name: t(u.displayNameKey),
      name_key: str(u.displayNameKey),
      lore: t(u.loreTextKey),
      lore_key: str(u.loreTextKey),
      alt_search_name: t(u.alternativeSearchNameKey),
      base_type_id: int(u.baseTypeId),
      sub_type_id: subIds.length ? subIds[0] : null,
      is_set_item: isSet ? 1 : 0,
      set_id: isSet ? int(u.setId) : null,
      is_legendary_capable: bool(u.legendaryType),
      unified_type: int(u.unifiedType),
      level_requirement: int(u.levelRequirement),
      override_level_requirement: bool(u.overrideLevelRequirement),
      can_drop_randomly: bool(u.canDropRandomly),
      can_drop_as_legendary: bool(u.canDropAsLegendary),
      hide_from_players: bool(u.hideFromPlayers),
      unknown_drop: bool(u.unknownDrop),
      not_timeline_exclusive: bool(u.notTimelineExclusive),
      effective_level_for_lp: int(u.effectiveLevelForLegendaryPotential),
      override_effective_level_for_lp: int(u.overrideEffectiveLevelForLegendaryPotential),
      drops_specific_legendary_affixes: bool(u.dropsSpecificLegendaryAffixes),
      droppable_legendary_affix_count: int(u.droppableLegendaryAffixCount),
      additional_random_legendary_affixes: int(u.additionalRandomLegendaryAffixes),
      is_primordial: bool(u.isPrimordialItem),
      is_cocooned: bool(u.isCocoonedItem),
      is_pre_corrupted: bool(u.isPreCorrupted),
      use_custom_drop_level: bool(u.useCustomDropLevel),
      custom_drop_level: int(u.customDropLevel),
      reroll_chance: num(u.rerollChance),
      sprite: str(u.sprite),
      mod_count: mods.length,
      raw_json: rawJson(u),
    });
    subIds.forEach((sub, ord) => {
      insertRow(db, "unique_subtypes", { unique_id: id, ord, base_type_id: int(u.baseTypeId), sub_type_id: sub });
    });
    mods.forEach((m, i) => {
      ctx.mods.insert({
        sourceKind: "unique_mod",
        sourceId: id,
        sourceOrd: i,
        property: m.property,
        specialTag: m.specialTag,
        tags: m.tags,
        extraTag: m.extraTag,
        modifierType: m.type,
        valueMin: m.value,
        valueMax: m.maxValue,
        hidden: m.hideInTooltip,
        raw: m,
      });
    });
    ((u.tooltipDescriptions ?? []) as Obj[]).forEach((d, ord) => {
      insertRow(db, "unique_tooltips", {
        unique_id: id,
        ord,
        text: t(d.descriptionKey),
        text_key: str(d.descriptionKey),
        alt_text: str(d.altText),
        set_mod: int(d.setMod),
        set_requirement: int(d.setRequirement),
      });
    });
    ((u.tooltipEntries ?? []) as Obj[]).forEach((e, ord) => {
      const md = e.modDisplay as number;
      insertRow(db, "unique_tooltip_entries", {
        unique_id: id,
        ord,
        mod_display: md,
        ref_kind: md < 128 ? "mod" : "description",
        ref_index: md < 128 ? md : md - 128,
      });
    });
  }
  db.exec("UPDATE sets SET item_count = (SELECT count(*) FROM uniques u WHERE u.set_id = sets.set_id)");

  // --- 19. idol altars ------------------------------------------------------------------------
  const grids: unknown[] = itemDB.altarGrids?.grids ?? [];
  const defaultGrid = itemDB.altarGrids?.defaultGrid ?? null;
  sortedEntries<Obj>(itemList.equippable?.[String(ALTAR_BASE)]?.subItems).forEach(([skey, s], pos) => {
    const subId = int(s.subTypeId) ?? Number(skey);
    insertRow(db, "idol_altars", {
      sub_type_id: subId,
      name: t(s.displayNameKey),
      grid_index: pos < grids.length ? pos : null,
      grid_json: pos < grids.length ? grids[pos] : null,
      default_grid_json: defaultGrid,
      raw_json: rawJson(s),
    });
  });

  // --- 20. blessings --------------------------------------------------------------------------
  const blessingPlace = new Map<number, { timeline: number; difficulty: number; slot: string }>();
  const timelines = ctx.raw.letools.timelineData as Obj;
  for (const [tkey, tl] of sortedEntries<Obj>(timelines)) {
    ((tl.difficulties ?? []) as Obj[]).forEach((d, di) => {
      for (const [list, slot] of [["firstSlotBlessings", "first"], ["otherSlotBlessings", "other"], ["anySlotBlessings", "any"]] as const) {
        for (const sub of (d[list] ?? []) as number[]) {
          if (!blessingPlace.has(sub)) blessingPlace.set(sub, { timeline: int(tl.id) ?? Number(tkey), difficulty: di, slot });
        }
      }
    });
  }
  for (const [skey, s] of sortedEntries<Obj>(itemList.equippable?.[String(BLESSING_BASE)]?.subItems)) {
    const subId = int(s.subTypeId) ?? Number(skey);
    const place = blessingPlace.get(subId);
    insertRow(db, "blessings", {
      sub_type_id: subId,
      name: t(s.displayNameKey),
      timeline_id: place?.timeline ?? null,
      difficulty_index: place?.difficulty ?? null,
      slot_kind: place?.slot ?? null,
      is_grand: place?.difficulty === 1 ? 1 : 0,
      raw_json: rawJson(s),
    });
  }

  // --- 21/22. relations + compact ids ---------------------------------------------------------
  const seenIds = new Set<string>();
  const relate = (key: string, relation: string, targetKind: string, targetId: string, value: number | null): void => {
    const d = decodeCompactId(key);
    let sourceKind: string;
    switch (d.kind) {
      case "A": sourceKind = "affix"; break;
      case "U": sourceKind = "unique"; break;
      case "S": sourceKind = "set"; break;
      case "I": sourceKind = "implicit"; break;
      default: throw new Error(`unexpected compact id kind ${d.kind} in itemDB relation key ${key}`);
    }
    insertRow(db, "relations", {
      source_kind: sourceKind,
      source_id: d.targetKey,
      source_sub: d.subIndex,
      relation,
      target_kind: targetKind,
      target_id: targetId,
      value,
      compact_id: key,
    });
    if (seenIds.has(key)) return;
    seenIds.add(key);
    const exists =
      d.kind === "A" ? affixIds.has(Number(d.targetKey))
      : d.kind === "U" ? uniqueIds.has(Number(d.targetKey))
      : d.kind === "S" ? setIds.has(Number(d.targetKey))
      : subtypeKeys.has(d.targetKey);
    insertRow(
      db,
      "compact_ids",
      {
        compact_id: key,
        kind: d.kind,
        decoded: d.value,
        target_table: d.targetTable,
        target_key: d.targetKey,
        sub_index: d.subIndex,
        resolves: exists ? 1 : 0,
      },
      { conflict: "ignore" },
    );
  };
  for (const [key, list] of sortedEntries<unknown[]>(itemDB.relModAbilities)) for (const a of list) relate(key, "mod_ability", "ability", String(a), null);
  for (const [key, list] of sortedEntries<unknown[]>(itemDB.relModAilments)) for (const a of list) relate(key, "mod_ailment", "ailment", String(a), null);
  for (const [key, list] of sortedEntries<unknown[]>(itemDB.relIncLevelAbilities)) for (const a of list) relate(key, "inc_level_ability", "ability", String(a), null);
  for (const [key, map] of sortedEntries<Obj>(itemDB.triggeredAbilities)) for (const [a, v] of sortedEntries(map)) relate(key, "triggered_ability", "ability", a, int(v));
  for (const [key, map] of sortedEntries<Obj>(itemDB.triggeredAilments)) for (const [a, v] of sortedEntries(map)) relate(key, "triggered_ailment", "ailment", a, int(v));
}

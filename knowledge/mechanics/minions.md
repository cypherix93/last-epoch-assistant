# Minions, Companions and Totems
> Game version: 1.5.x (Season 5). Last verified: 2026-10-08.
> Confidence legend: **D** = recovered from decompiled client code (via vendored weksil research), **A** = read from game asset data, **G** = official in-game guide text, **X** = community-verified (Maxroll 2026 / forum tests), **U** = unverified or inferred. Each formula and constant carries a label.
> A `?` suffix (for example **D?**) means the source itself marks the reading as ambiguous.

## Summary (10 lines max, the rules an agent must never get wrong)
1. A player stat reaches a minion only if it carries the Minion tag, the Totem tag (totem skills only), or `extraTag` = the summoning skill's AbilityID; it arrives with Minion/Totem stripped and `extraTag 0`. Everything else stays on the player. **D/G**
2. Transfer is a snapshot at summon time; gear or passive changes reach existing minions only on resummon (new cast, tree resummon, or scene change for some companions). **D**
3. Minion power from character level 26: `more damage = (L − 25) × 0.008`, `less damage taken = (L − 25) × 0.008` → ×1.60 damage and ×0.40 damage taken at level 100. **A/D** (guide's 0.6% / 45% is stale)
4. All minions also get a hidden DamageTaken MORE −0.6 against PetResisted damage ("dangerous enemy abilities") and Movespeed MORE +0.10. **A/D**
5. Minion level is not scaled; minion abilities ignore `levelScaling`; their `attributeScaling` uses the minion's own attributes (normally 0). **D**
6. Health/ward/mana gain, Haste on hit and chance-to-cast stats with the Minion tag are handled by the player, not transferred. **D**
7. Companions and totems are minions: every minion stat applies to them. Base companion limit 2. **G/D**
8. Summon attribute scaling (e.g. +4% increased minion damage per point) is computed from the player's attributes and transferred because it carries the Minion tag. **A/D**
9. Minion attack rate = minion attack/cast speed (base 1) × 1.1 / `useDuration` of its `castSpeedOverrides` entry. **D**
10. Minion damage still faces enemy resistances, level DR and armour exactly like player damage. **D**

## 1. Stat transfer (`SummonEntityOnDeath.Summon`)

```
idx = AbilityIDIndex(summoning ability) ; isTotem = ability.isTotem or countsAsTotem…            # D
for each stat s in the caster's stats (incl. cast temp stats: levelScaling, attributeScaling,
    item stats with extraTag = idx, mutator/tree stats):
  if s.property in {38 HealthGain, 39 WardGain, 40 ManaGain, 50 HasteOnHitChance,
                    126 ChanceToCastForAbility, 127 ChanceToCastForTags}: skip                     # D
  elif s.extraTag ≠ 0 and s.extraTag ≠ idx: minion.addStat(s) unchanged                         # D?
  elif (s.tags & Minion) or (isTotem and s.tags & Totem) or (s.extraTag == idx and idx ≠ 0):
       [summonIsASummoner: also add a copy keeping Minion for its own summons]
       minion.AddStatModifier(property, added / increased / each more,
                              tags = s.tags & ~(Minion|Totem), specialTag, extraTag 0)            # D
  else: not transferred                                                                         # D
then: add SummonEntityOnDeath.statList (skill-tree minion stats) unchanged; UpdateStats; set health to max  # D
```

| Player stat | What the minion receives | Label |
|---|---|---|
| +X% increased damage (tags 0), +X% fire damage (Fire) | nothing | D/G |
| +X% minion damage (Minion) | Damage INCREASED X, tags 0 | D |
| +X minion melee physical damage (Physical\|Melee\|Minion) | Damage ADDED X, tags Physical\|Melee → only its melee physical abilities | D |
| +X% minion health / armour / resistance (Minion) | untagged Health / Armour / Res → minion's defensive totals | D |
| stat with `extraTag` = summon skill (e.g. "+X% Summon Skeleton damage") | same stat, extraTag 0, no Minion tag | D |
| summon skill `attributeScaling` / `levelScaling` with Minion tag | computed on the player (player attributes, character level), then transferred | D |
| Totem-tagged stats | only for totem skills (`isTotem` or `countsAsTotemEvenIfAbilityIsNotTotemAbility`) | D |
| "for you and your minions" stats | carry both scopes, so they transfer | G/X |
| Minion-tagged HealthGain/WardGain/ManaGain/Haste/ChanceToCast | stay on the player (e.g. "health on minion hit") | D |

Test vector (summon idx 50, not a totem): player `Damage INC 0.4 (tags 0)`, `Damage INC 0.5 Minion`, `Damage INC 0.3 Minion|Melee`, `Health ADD 20 Minion` → minion `Damage INC 0.5`, `Damage INC 0.3 Melee`, `Health ADD 20`; its melee attack ΣI = 0.8, its spell ΣI = 0.5. **D**

Why stripping works: minion abilities carry no Minion tag (Skeleton Rogue Melee = Physical\|Melee 513; Skeleton Archer bow attack = Physical\|Bow 2049), and the damage builder requires Minion on a stat only when the damage itself has it. **D**

## 2. Minion power by level

```
first = firstLevelForMinionScaling = 26 ; k = moreMinionDamagePerLevel = lessMinionDamageTakenPerLevel = 0.008   # A
moreDamage(L)       = L ≥ 26 ? (L − 26 + 1) × 0.008 : 0      Damage MORE, Minion tag (stripped on transfer)        # A/D
lessDamageTaken(L)  = L ≥ 26 ? −(L − 26 + 1) × 0.008 : 0     DamageTaken MORE, Minion tag                         # A/D
```

| Character level | Minion more damage | Minion damage taken multiplier | Label |
|---|---|---|---|
| 25 | ×1.000 | ×1.000 | A/D |
| 26 | ×1.008 | ×0.992 | A/D |
| 50 | ×1.200 | ×0.800 | A/D |
| 75 | ×1.400 | ×0.600 | A/D |
| 100 | ×1.600 | ×0.400 | A/D |

Conflict: the in-game guide `Minions` says 0.6% damage and 0.8% damage reduction per level (45% / 60% at 100), `Levels` says 0.6 minion power (45%), Maxroll 2026 says 0.6% and 45% / 45%. The Season 3 patch note raised it to 0.8%, and every class asset stores 0.008 for both. Chosen: 0.008 / 0.008. **A** (G, X stale)

## 3. Hidden minion modifiers

| Modifier | Value | Scope | Label |
|---|---|---|---|
| DamageTaken MORE −0.6 | tags Minion\|PetResisted; on the minion the PetResisted tag stays, so it applies only to PetResisted damage | "dangerous enemy abilities" take 60% less | A/D/G |
| Movespeed MORE +0.10 | Minion | all minions | A |
| Combined at level 100 vs PetResisted damage | ×0.4 (level) × 0.4 (PetResisted) = ×0.16 | — | D |
| Innate `DamageTaken MORE −0.5` | on most minion prefabs (wolf, bear, totems, wraith, golem, sabertooth, spriggan) | per minion | A |
| Removed in Season 4 | hidden 14% less damage on Skeletal Mages, Pyromancers, Cryomancers | — | G |
| Base crit | 5% / ×2.0 (`Stats.baseCritChance/baseCritMulti`) | all Stats | D |

## 4. Minion base stats (`minion_base_stats.json`)

Base health, innate stats and attack timings come from the minion actor prefab (not PermaLoad); the minion's own level is not used. **A/D**

```
minion maxHealth = RoundHalfEven((prefab health + Σadded) × (1 + Σinc) × Πmore)                  # D
minion attacks/s = minion AttackSpeed or CastSpeed (base 1, + transferred %) × 1.1 / useDuration(castSpeedOverrides)   # D
```

| Minion | Base health | Innate stats | Attack override (useDuration s) | Label |
|---|---|---|---|---|
| Primal Wolf | 220 | HealthRegen +12; AttackSpeed MORE +0.30; Damage MORE −0.12; Movespeed MORE +0.50; DamageTaken MORE −0.50 | BasicEnemyMelee 1.2 | A |
| Primal Bear | 360 | HealthRegen +24; AttackSpeed MORE −0.22; Damage MORE +0.75; DamageTaken MORE −0.50; armour 70 | BasicEnemyMelee 1.1 | A |
| Primal Sabertooth | 240 | HealthRegen +14; AttackSpeed MORE +0.30; DamageTaken MORE −0.50 | BasicEnemyMelee 1.2 | A |
| Spriggan | 160 | HealthRegen +8; DamageTaken MORE −0.50 | — | A |
| Thorn Totem | 120 | DodgeRating MORE −1 (cannot dodge); DamageTaken MORE −0.50 | ThornTotemAttack 0.95 | A |
| Storm Totem | 120 | Damage MORE +1.30; DodgeRating MORE −1; DamageTaken MORE −0.50 | LightningStorm 0.95 | A |
| Wraith | 60 | Damage MORE +1.52; DamageTaken MORE −0.50 | BasicEnemyMelee 1.2 | A |
| Bone Golem | 400 | Damage MORE +0.40 and +0.60; AttackSpeed MORE −0.45; DamageTaken MORE −0.50 | BasicEnemyMelee 1.5 | A |
| Skeleton Warrior / Archer / Rogue / Mage | 100 each | per-type stat lists from the Summon Skeleton tree | — | A/D |
| Death Knight | 200 | — | — | A |
| Ballista | 1000 (effectiveHealthModifier 2.0) | — | — | A |
| Manifested Armor | 350 | scales from equipped armour items (special) | — | A/X |
| Forged Weapon | 350 | — | — | A |
| Falco | 160 (`canDie 0`) | — | — | A |

Each minion ability (`abilityList`) is a separate damage component running the normal pipeline ([damage-pipeline.md](damage-pipeline.md)) on the minion's stats. **D**

## 5. Companions, totems, limits

| Rule | Value | Label |
|---|---|---|
| Maximum companions | `Round(GetStatValue(MaximumCompanions SP61, base added 2))` → 2 by default; a CharacterMutator flag forces 1 | D/G |
| Companion limit budget | `maxCompanions × 60`; each companion contributes 60 by default (mutators can change it) | D |
| Wolves / raptors "up to your maximum number of companions" | `Round(2 + SP61 …)` | D |
| Companion downed state | at 0 health a companion is downed; standing near revives it; waiting too long kills it | G |
| Companion skill swap | after summoning, the summon skill becomes the companion's ability (at max count) | G |
| Totems | cannot move, fixed duration plus health; all minion stats apply | G |
| Companions vs minions | no separate power multipliers; differences are size (PP 132, visual) and the limit | D |
| Summon Skeleton default cap | 3 (`getSkeletonLimit`); Summon Skeletal Mage 2 (`getSkeletonMageLimit`) | D |
| Other caps | `summonSettings[].limit` of the summon prefab, modified by tree "max" fields and AbilityProperties (`addedSkeletonSummonCap`, `additionalMaxSkeletalMages`, `boneGolemAdditionalMaxGolem`, `additionalMaxWraiths`, `addedMaximumThornTotem`, `addedMaximumBallistae`, `stormTotemAdditionalTotem`, `maxLocusts`…) | D |

## 6. Exceptions that scale from the player

| Minion | Rule | Label |
|---|---|---|
| Manifest Armor | applies stats from body armour, helmet, gloves, boots; tree nodes raise the share | X |
| Ballista | "Shared Enhancements" node gives a share of the player's damage modifiers | X |
| Julra's Obsession (gloves) | applies the gloves' stats, including legendary affixes, to minions | X |
| Minions with items (`Summoned.attributeScalingWhenSummoned`) | attribute scaling recomputed on item change | D |
| Minion-summoning minions (`summonIsASummoner`) | keep a Minion-tagged copy of each transferred stat for their own summons | D |

## 7. Minion ailments and tags

- Minions apply ailments from their abilities' `ailmentsOnHit` plus transferred AilmentChance stats (Minion tag stripped, so "+X% minion bleed chance" becomes a plain bleed chance on the minion). **D**
- Ailment damage from minions scales from the minion's own stats (transferred minion damage, minion DoT, minion type damage). **D**
- "Minion" tag matching on the player side: a player stat tagged Minion never applies to player skills, even summon skills' own hits (the player's summon skill itself does not deal the minion's damage). **D**
- Minions' leech and on-hit gains with the Minion tag are handled by the player ("health on minion hit"). **D**
- A minion prefers a skill that just came off cooldown (multiple-ability AI picks the first ready ability with a cooldown or charge). **G/D**

## Worked example

Level-100 Acolyte, Primal Wolf-style minion for arithmetic (base data from the wolf prefab), minion ability base Physical 30 with ADE 1.0 and `useDuration 1.2` (illustrative base **U**). Player gear: +150% increased minion damage, +60% increased minion physical damage, +12 minion melee physical damage, +20% minion attack speed, +100% increased damage (player only).

```
Transferred: Damage INC 1.5 (0), Damage INC 0.6 (Physical), Damage ADD 12 (Physical|Melee), AttackSpeed INC 0.2   # D
Not transferred: +100% increased damage                                                         # D/G
Hit = (30 + 1.0 × 12) × (1 + 1.5 + 0.6) × (1 − 0.12 innate) × 1.60 (minion power L100)
    = 42 × 3.1 × 0.88 × 1.60 = 183.3                                                            # D
Attack rate = 1 × (1 + 0.2) × 1.30 (innate MORE) × 1.1 / 1.2 = 1.43 /s                          # D
DPS vs dummy (crit 5%, ×2.0 → ×1.05) = 183.3 × 1.05 × 1.43 = 275.3                              # D
DPS vs level-100 normal monster (DR 0.87, 0 armour) = 275.3 × 0.13 = 35.8                       # D
Damage taken by the minion from a normal hit: × 0.5 (innate) × 0.4 (level) = × 0.20;
  from a PetResisted ability: × 0.20 × 0.4 = × 0.08                                             # D
```

## Common misconceptions / pitfalls
- Adding the player's generic "increased damage" or "increased fire damage" to minions. Only Minion-tagged (or "you and your minions") stats transfer. **G/D**
- Using 0.6% minion power per level (45% at 100). Data is 0.8% (×1.60 / ×0.40). **A**
- Expecting a gear swap to update existing minions immediately. The stats are a snapshot until resummon. **D**
- Treating minion level as scaling minion damage. Minions do not scale with their own level; their power comes from minion power and transferred stats. **D**
- Assuming "health on minion hit" heals the minion. It heals the player. **D**
- Forgetting the monster level DR applies to minion damage too. **D**

## Open questions
- The "foreign extraTag → addStat unchanged" branch: purpose unclear (stats for the minion's own sub-abilities?). **D?**
- Whether equipment changes rebuild the snapshot for living minions in any case other than resummon (falcon age constant 115 hints at special falcon logic). **D?**
- Per-summon-tree contents of `SummonEntityOnDeath.statList` (about 25 trees not traced). **U**
- Shared companion cap across different companion skills; Bone Golem extra golems per skeleton. **D?**
- Whether minion hits use the area-level armour formula against monster armour identically to player hits. **U**
- Base damage of each minion ability lives in `abilities.json` (`minion` category); `minion_base_stats.json` holds health and innate stats only. **A**

## Sources
- `vendor/lastepochbuilder/research/07d_minions_uniques.md` Part 1 (§1.1 transfer code, §1.2 consequences table, §1.3 level and base, §1.4 companions, §1.5 test vectors, §1.6 unknowns).
- `vendor/lastepochbuilder/client/docs/ENGINE.md` §9.4 (minion calc, attack frequency, counts, ability choice), §5.5 (attribute scaling).
- `vendor/lastepochbuilder/research/data/game/classes.json` (`minionScaling` 26 / 0.008 / 0.008, hiddenBaseMods Minion Movespeed MORE 0.10 and DamageTaken MORE −0.6 Minion\|PetResisted, formulas).
- `vendor/lastepochbuilder/research/data/game/minion_base_stats.json` (health, innateStats, castSpeedOverrides, summonSettings, protection).
- `vendor/lastepochbuilder/research/07a_assets_core_data.md` §0.1 (minion strength confirmation).
- `vendor/lastepochbuilder/research/02_le_formulas.md` §8 (minion rules, Season 3/4 patch notes, exceptions).
- `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (Minions, Companions, Totems, Levels).
- `vendor/corpus/maxroll_damage-explained.md` (https://maxroll.gg/last-epoch/resources/damage-explained, updated 2026-03-27): minion scaling list, exceptions (Manifest Armor, Ballista, Julra's Obsession), stale 0.6% minion power.

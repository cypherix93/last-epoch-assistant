> **Evidence, not guidance.** Skill-probe task output (2026-10-08, game data 1.5.2), produced with the `.claude/skills/` text as it was *before* the commit that added this folder applied the feedback. Quotes and line numbers refer to that earlier skill text; the current skills supersede it. See `tests/probes/README.md` and `.claude/skills/README.md`.

# C. le-damage-reasoning probe: Fireball average hit, stated build

Scope (Step 0): skill Fireball `fi9`; "level 100 Sorcerer" (class/mastery passives not supplied, so none counted); Intelligence 60; +120 added spell fire (flat, typed); +350% increased fire; +200% increased spell; one 30% more; crit chance 40%, crit multiplier 250%; enemy: level-100 monolith monster, normal rarity, 0 fire resistance, 0 armour, no shred/pen, no corruption effect on damage taken (all assumptions **U**). Game 1.5.2.

## Lookups (Steps 1-5)
- `lookup {"name":"Fireball","kinds":["ability"]}` -> `fi9` ("player, has tree"), chosen over 8 minion/monster Fireballs.
- Step 1 SQL (abilities): ability_index 1, tags 264 (Fire,Spell), mana 3, use_duration 0.75, use_delay 0.27, speed_scaler 3 (CastSpeed), speed_multiplier 1, no charges/channel. **A**
- Step 2 SQL (ability_components fi9 ord 0 DamageEnemyOnHit): base [0,25,0,0,0,0,0] = Fire 25; ADE (addedDamageScaling) 1.25; critChance 0.05; critMultiplier 2; critType 0; hit 1; damageTags 256. **A**
- Ailment component ord 2 ChanceToApplyAilmentsOnHit: Ignite (ailment 1) chance 0.4. Ignite: Fire 40 over 2.5 s (DoT, separate from the hit). **A**
- Attribute scaling (mods source_kind=ability_attribute_scaling source_id=fi9): Damage increased 0.04 per point, context `attribute:2` = Intelligence (stat-model.md Attribute enum: 2 Intelligence). Level scaling: none. **A**
- Step 3 mask: Fire(8)+Spell(256)+Hit(8388608) = 8388872.
- Step 4: the sample pool query (with the build's real sources unavailable) ran fine; build modifiers come from the user, so labelled **U**. All stated mods are tag-compatible: "increased spell" (Spell subset of src), "increased fire" (Fire bucket only), flat "spell fire" added (typed Fire, Spell subset of src).
- Step 5: `fi9` skill_node damage lines in mods: fi9:6 Winged Fire +7% (per point), fi9:22 Mana Sphere +3%, fi9:23 Unchained Fire +12% per extra projectile, fi9:14 Spreading Inferno DoT +10% (ailments only). Stated build allocates none except the single "30% more from a passive" which is treated as a generic more, not a Fireball node. Nodes with penetration (Immolated Core fire pen +10%/pt), crit (Orb of Destruction +1.5% base crit, Plasma Ball conversion + 35% crit mult, Skira's Gambit crit) are NOT assumed allocated.
- Formula source: damage-pipeline.md#2-the-pipeline, #7-critical-strikes, #9-monster-level-damage-reduction, #13-variance-and-tooltips.

## Calculation
```
Fire bucket   dmg = base + ADE x added = 25 + 1.25 x 120 = 175                 [formula D, base/ADE A, 120 U]
inc_fire      = Int 60 x 4% (generic, from fi9 attribute scaling) 2.40
              + fire 3.50 + spell 2.00 = 7.90  -> x8.90                        [D; 240% is A rule x U input]
more          = 1.30 (single more; nothing to multiply)                        [D]
Hit_fire      = 175 x 8.90 x 1.30 = 2024.75 (vs dummy, before crit)
Crit          cc = 0.40 (taken as final sheet value)   cm = 2.5 (sheet 250% = x2.5)
              E_crit = 1 + 0.40 x (2.5 - 1) = 1.60                             [D]
Avg hit vs dummy        = 2024.75 x 1.60 = 3239.6
Enemy: resMult = 1 - 0 + pen 0 = 1.00; DT 1.00; armour 0; level DR 0.87 -> x0.13  [D/A]
Avg hit vs level-100 normal monolith monster = 3239.6 x 0.13 = 421.1
```
Variance x0.8-x1.2 per hit, average unchanged (**X**). The hit is a Hit (no DoT); Ignite not included.

## Result (average hit, Fireball only, no ignite)
- Point estimate: **~3,240 vs dummy; ~421 vs a level-100 normal monster (resistance 0)**.
- Range (reasonable interpretations of the inputs):
  - "250% crit multiplier" meaning +250% added instead of total -> cm 4.5, E_crit 2.4 -> 4,859 dummy / 632 monster.
  - crit chance 40% added to the 5% base before increased (not the case here, no increased crit given): 0.45 -> 441 monster.
  - boss/miniboss DR 0.8765 -> ~400 monster (point case).
  - Without Intelligence scaling (if the 60 Int is already counted elsewhere or the stat is not Int): 308 monster.
  So **~300-630 vs a level-100 monster; central 421**.
- Per second would need cast speed (not given): at S=1 uses/s = 1.1/0.75 = 1.467 -> ~618 hit DPS vs monster (**U**).
- Confidence: formulas **D/G** (high); Fireball data **A** (high); build inputs **U** (as given); the result is **medium**, limited by the crit interpretation and unstated inputs.

## Cannot be accounted for ("cannot be determined from data")
- Skill-tree node mutators of Fireball (not stated allocated): Piercing Heat, Embers/Fire Spray/Dancing Fire/Arcane Divergence (extra projectiles, damage per extra projectile; skill-local 5000+ properties), Plasma Ball (50% conversion to lightning and new tag), Unchained Fire (more damage per projectile), Flame Burst, Flamethrower/channeling, Seeker's Ash, Immolated Core fire penetration, Skira's Gambit/Orb of Destruction crit, Winged Fire (7%/pt more) - if allocated they change the result; node damage type (increased vs more) is not in the DB (429 more vs 38 increased prior, **D**).
- Sorcerer mastery passives / class passives and gear affix rolls beyond the stated numbers; shred/penetration, monster rarity (rare/boss), corruption effects, resistances from monolith modifiers; Fireball's ability properties (SP58) from items; hidden per-skill multipliers and variance order (damage-pipeline.md#open-questions).
- Ignite DoT (separate pipeline: Fire 40/2.5 s, ADE 0) not added to the hit.

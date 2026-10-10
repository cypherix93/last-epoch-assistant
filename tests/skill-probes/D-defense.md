> **Evidence, not guidance.** Skill-probe task output (2026-10-08, game data 1.5.2), produced with the `.claude/skills/` text as it was *before* the commit that added this folder applied the feedback. Quotes and line numbers refer to that earlier skill text; the current skills supersede it. See `tests/probes/README.md` and `.claude/skills/README.md`.

# D - Defense assessment (le-defense-reasoning)

Context: character level 100, area level 100 (empowered monolith), corruption 300, attackers = rare melee (phys) hit, boss-spell proxy, DoT. Armour table level L = area + 5 = 105 (reproduces the skill's 63.7% at 5000 armour, so L=105 is the consistent reading).

## Inputs and derived
- Resistances shown (uncapped): Fire 75, Cold 75, Lightning 60, Physical 40, Necrotic 75, Void 20, Poison 75. Enemy pen at area 100 = 75% (after cap). [defenses.md#2-resistances] G/D
- resMult = 1 - res + 0.75: Fire/Cold/Necro/Poison x1.00; Lightning x1.15; Physical x1.35; Void x1.55 (D)
- Armour 1800 at L=105: physical DR 34.5%; non-physical x0.7 = 24.1% (D, formula computed by hand)
- Dodge: given as a 30% chance, not a rating, so used directly: avoidance factor 0.70 (hits only). No block, no glance, no parry, crit avoidance unknown (U).
- Endurance e = 20%, T = 480 (= 20% of 2400, base). Ward 0. pool_post = (2400-480) + 480/0.8 = 2520 (D). Endurance only adds 120 effective HP; effectively worthless as built.
- DT modifiers: none given (x1). Hidden 15% less DoT applies to DoT.
- f(300)=280.5, x3.805 (D). Rare melee raw: 87.58 x 1.2264 x 1.9 x 3.805 = 776 physical (D?, trimmed-mean sample). Spell proxy raw: 129.62 x 1.2264 x 3.805 = 605 (U, no rare mult). DoT: 151/s x (1+0.005x280.5)=2.4025 -> 362.8/s raw.

## Mitigation layers, in order (one hit)
1. Conversion: none given.
2. Per type: resMult x DT x (1 - armourDR).
3. Avoidance: dodge 0.70 (avg).
4. Pool: ward 0 -> endurance part -> health: 2520.

## EHP against reference hits
| Hit (raw) | resMult | armour | post per landed hit | hits to die | maxRawHit (pool/(res*arm)) | avg EHP incl. 30% dodge |
|---|---|---|---|---|---|---|
| Rare melee physical 776 | 1.35 | x0.655 | 687 | 3.7 (dies on 4th landed) ; 5.2 attempts avg with dodge | 2849 | 4069 |
| Spell proxy void 605 (U) | 1.55 | x0.759 | 712 | 3.5 | 2143 | 3061 |
| Spell proxy lightning 605 (U) | 1.15 | x0.759 | 528 | 4.8 | 2888 | 4126 |
| Spell proxy fire/cold/necro/poison 605 (U) | 1.00 | x0.759 | 459 | 5.5 | 3320 | 4743 |
| DoT 363/s raw, physical (armour/dodge do not apply, x0.85 hidden) | 1.35 | none | 416/s | 6.1 s no regen; 9.5 s with 150/s regen | - | - |
| DoT 363/s raw, void | 1.55 | none | 478/s | 5.3 s; 7.7 s with regen | - | - |
| DoT 363/s raw, 75-res type | 1.00 | none | 308/s | 8.2 s; 15.9 s with regen | - | - |
Boss hit: no boss table exists (sources), proxy labelled U; ask for the observed hit or `get ability`. Dying in ~4 hits in 300-corruption content = fails the "single layer / <5 hits" red flag.

## Red flags (ranked by severity)
1. Void resistance 20 (x1.55) and Physical 40 (x1.35): the two weakest types, each 35% / 26% more damage than at cap. Lightning 60 (x1.15). Three of seven types uncapped.
2. Pool 2520 and 3.5-3.7 hits to die: below the skill's "<5 hits" single-layer threshold.
3. Armour 1800 = 34.5% phys only; very low for monolith.
4. Endurance 20% / threshold 480: base values, no sources (skill red flag verbatim).
5. No leech and no ward: sustain is only 150/s regen (decent vs DoT, nothing vs hits).
6. Dodge 30% is the only avoidance; no block, glance, crit avoidance (SP 89/114) while monolith mod "enemies have +15%/+25% crit chance" (monster_mod 51/77) exists.
7. No DamageTaken reduction anywhere.
8. Zero overcap: no shred protection (shock/resist shred would push below cap).

## Ranked fixes (value from my arithmetic; sources are DB lookups run above)
1. Void 20 -> 75 (x1.55 -> x1.00, -35% void damage). Sources: blessing Grand Echo of Solarum (sub_type 27, Void Res 55-75%, timeline The Black Sun; non-grand 26 gives 25-40%) [v_blessings]; Grand/other idols: affix 115 Void Resistance (Grand Idol, top 45%); gear affixes: Void Resistance rolls on Body Armor (3 affixes); passive: Sentinel Juggernaut (void 4%/pt), Abyssal Endurance (Void Res +4%/pt, Void+Phys DT -5%/pt).
2. Physical 40 -> 75 (x1.35 -> 1.00; rare melee hit 687 -> 509 post, hits to die 3.7 -> 4.95). Sources: blessing Grand Resolve of Grael (sub_type 181, 55-75%); Grand Idol affix 430 Physical Resistance (top 45%); Sentinel Battle Hardened (Phys Res +6%/pt, less phys damage per 5% overcap), Liquid Iron.
3. Lightning 60 -> 75: blessing Grand Bastion of Divinity (sub_type 73, 55-75%); Huge Idol affix 113 Lightning Resistance; Piety node (+6%/pt) if Sentinel.
4. Armour 1800 -> ~5000 (phys DR 34.5% -> 63.7%: hit 687 -> ~380 at current phys res; with fix 2, 282, 8.9 hits to die): Armor affix (affix 1, +% increased; flat armour affixes up to 600 T8 on body armour); Grand Idol affix 196 Armor (up to 35%), 921 (Armor applies to DoT, SP118 useful vs DoT); Strength 4% each (attribute 0).
5. Endurance and threshold (one fix, ~+28% pool): belt/helm/gloves/ring Endurance affix 92 (T5 11-15%, T7 27-35%), belt Endurance Threshold affix 425 (T7 151-200). Example e=0.55, T=680: pool = 1720 + 680/0.45 = 3231 (vs 2520). Defiance/Valor/Prayer Aegis nodes (Paladin). e cap 60%.
6. Health: 2400 is low for level 100; health affixes (6 on body armour, up to 325 flat T8) and Vitality.
7. Sustain/recovery: Health Regeneration affix 22/90 on helm/belt/ring (up to +70/s T8 on amulet/gloves/helm); leech via nothing found cheaply; Holy Icon/Holy Symbol nodes (ward) only if ward is wanted.

After fixes 1-3 only (all types 75%): rare physical hit post = 776.5 x 1.00 x 0.655 = 509, 4.95 hits; boss proxy any type 459, 5.5 hits. Layers beyond resistance (armour, endurance, health) are needed to reach comfortable (>8 hits).

## Not determinable
Boss ability numbers; crit exposure (monster crit chance, user's crit avoidance); which damage types the content actually uses; whether 30% dodge includes the rating formula (assumed final chance); special-effect passives.

Sources: classes row Sentinel (base endurance 0.2, threshold per health 0.2); mods affix_tier ids 92, 425, 22, 90, 115, 113, 430, 196, 921; v_blessings sub_type 27/73/181; v_skill_node_summary Sentinel; defenses.md sections cited above; enemies-and-corruption.md#monster-damage-reference.

# Interactions catalogue (Last Epoch 1.5.x, Season 5)

Unintuitive, build-defining mechanics interactions. Format, labels and usage are in `knowledge/interactions/README.md`.
Every path below is relative to the repository root. `PP<n>` = PlayerProperty index, `AP<a>:<p>` = AbilityProperty
(ability index : property index), `uid` = uniqueID in `vendor/lastepochbuilder/research/data/game/uniques.json`.
Full unique tooltips are in `knowledge/interactions/unique-effects-index.md`.

---

## 1. Damage conversion and tag inheritance

### Conversion moves base and untyped added damage only
- **Tags:** conversion, tag-matching, scaling-oddity
- **Rule:** Base damage conversion changes the skill's base damage type and also converts untyped flat damage ("+5 Melee Damage"), but typed flat damage ("+5 Melee Fire Damage") keeps its type. The converted skill loses the old type tag and gains the new one, so "increased <old type>" stops applying to it.
- **Why it matters for builds:** after a conversion node, gear with typed added damage of the old type keeps dealing that old type and needs its own scalers; untyped "+X Melee/Spell Damage" is the conversion-proof affix.
- **Involved:** every "converted to X" skill node (165 records in skill_conversions.json), Flame Reave example in the guide, Hail of Arrows Crystal Arrows.
- **Confidence:** G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.DamageConversion, GameGuide.BaseDamage); X — https://maxroll.gg/last-epoch/resources/damage-explained (Hail of Arrows example); `vendor/lastepochbuilder/research/02_le_formulas.md` §1.3.

### Conversion leaves ailments alone unless the node converts ailment chance "from all sources"
- **Tags:** conversion, ailment, tag-matching
- **Rule:** Damage conversion does not change the ailments a skill applies unless stated. Most 1.5 conversion nodes therefore ship an explicit ailment clause: Javelin lightning conversion turns Ignite and Bleed chance into Electrify, Acid Flask fire conversion turns Poison into Ignite, Dreamslash "Trance of Isolation" converts Bleed and Ignite chance *from all sources* into Frostbite.
- **Why it matters for builds:** "from all sources" clauses turn generic ailment-chance gear (any ignite or bleed affix) into the converted ailment, so a cold Dreamslash can use cheap bleed-chance items as frostbite chance.
- **Involved:** JavelinMutator.lightningConversion, AcidFlaskMutator.fireConversion, DreamslashMutator.coldConversion / fireConversion, RadiantLanceMutator (Sunbeam, Abyssal Heresy), Summon Tide Elemental (Thunder / Wind Elemental).
- **Confidence:** A — `vendor/lastepochbuilder/research/data/game/skill_conversions.json` (ailment_convert fields, text-level); G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.DamageConversion_Paragraph_2); X — https://maxroll.gg/last-epoch/news/season-5-patch-notes (Dreamslash, Radiant Lance, Tide Elemental nodes).

### Partial and tag-adding conversions keep the old tag
- **Tags:** conversion, tag-matching, double-dip
- **Rule:** Some tree conversions add a tag without removing the old one: Shurikens "% base damage converted to lightning" and Void Cleave's 50% fire conversion remove nothing, Umbral Blades cold conversion keeps Physical, and Forge Strike / Shield Throw / Shield Rush / Black Hole nodes add Fire or Void on top. A skill that carries both tags is matched by modifiers of either type.
- **Why it matters for builds:** these skills can stack two damage-type scaler pools (e.g. physical and cold for Umbral Blades) instead of switching pools, which is rare in LE.
- **Involved:** ShurikensMutator.percentBaseDamageConvertedToLightning, VoidCleaveMutator.partialFireConversion, UmbralBladesMutator.coldConversion, ForgeStrikeMutator.fireTag, ShieldThrowMutator.fireTag, ShieldRushMutator.voidTag, BlackHoleMutator.armageddon.
- **Confidence:** A — `vendor/lastepochbuilder/research/data/game/skill_conversions.json` (tags_add / tags_remove; the file marks itself text-level D?, verify in game).

### Earthquake can stop being a melee attack and become a lightning spell
- **Tags:** conversion, tag-matching, scaling-oddity
- **Rule:** The Earthquake "Spell And Lightning Conversion" node converts Physical to Lightning, removes the Melee tag and adds Spell, so the skill scales with spell and lightning modifiers instead of melee ones. Natural Wrath (uid 462) also converts Upheaval and Earthquake to lightning.
- **Why it matters for builds:** a Primalist can run Earthquake off spell-damage gear and Shaman spell passives; melee-only effects (melee leech, "on melee hit" procs) stop applying.
- **Involved:** EarthquakeSlamMutator.spellConversion, EarthquakeSeekingCrackMutator.spellConversion, Natural Wrath (uid 462).
- **Confidence:** A — `vendor/lastepochbuilder/research/data/game/skill_conversions.json`; `vendor/lastepochbuilder/research/data/game/uniques.json` (uid 462 tooltip).

### Skills re-tagged to another delivery type
- **Tags:** conversion, tag-matching, scaling-oddity
- **Rule:** Several nodes and uniques swap the delivery tag rather than the element: Shadow Cascade's dagger nodes add Throwing and remove Melee; Jelkhor's Blast Knife makes Detonating Arrow a melee attack that "scales with melee damage instead of bow damage" and needs no bow; Ravager's Dart makes Heartseeker a Throwing skill; Aberroth's Command makes Void Cleave instant, not a movement skill and weapon-free.
- **Why it matters for builds:** this is the main way to move a skill into a scaler pool your class reaches more easily (throwing damage on rings/amulets, melee weapons for a bow skill).
- **Involved:** ShadowCascadeMutator.daggersToThrow / noMelee; Jelkhor's Blast Knife (uid 285); Ravager's Dart (uid 373); Aberroth's Command (uid 355).
- **Confidence:** A — `vendor/lastepochbuilder/research/data/game/skill_conversions.json`; `vendor/lastepochbuilder/research/data/game/uniques.json` (uids 285, 373, 355 tooltips).

### Swarmblade spin uses minion damage scaling
- **Tags:** conversion, minion, tag-matching, scaling-oddity
- **Rule:** The Swarmblade Form node "Swarm Minion Damage" adds the Minion tag and removes DoT for the swarm unit, so its damage is scaled by minion damage modifiers instead of the player's.
- **Why it matters for builds:** a transform build can borrow minion-damage gear, which is otherwise dead on a non-summoner.
- **Involved:** SwarmbladeSpinMutator.useMinionDamageScalingInstead (Swarmblade Form tree).
- **Confidence:** A — `vendor/lastepochbuilder/research/data/game/skill_conversions.json` (note: "Unit damage scaling by minion damage modifiers").

### Melee added damage reused as spell damage
- **Tags:** conversion, tag-matching, double-dip
- **Rule:** Bane of Winter (uid 345) gives Cold and Void spells added spell damage equal to 25-42% of the added melee damage affixes on gear (the Melee tag on each stat is replaced by Spell); Heorot's Repose (uid 472) gives Avalanche added spell damage equal to the added melee damage on the weapon; the corrupted sword affix 988 grants "Added Melee Damage from Weapons gained as Added Spell Damage" (10-11% at T1, 30-35% at T8).
- **Why it matters for builds:** one weapon roll feeds both a melee attack and a spell, enabling melee/spell hybrids without splitting affixes.
- **Involved:** Bane of Winter uid 345, Heorot's Repose uid 472, corrupted affix 988.
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (uid 345 effect formula, D?); A — `vendor/lastepochbuilder/research/data/game/affixes.json` (affixId 988); `vendor/lastepochbuilder/research/data/game/uniques.json` (uid 472).

### Spellblade mastery: added melee damage on weapons is also gained as added spell damage
- **Tags:** conversion, tag-matching, double-dip, scaling-oddity
- **Rule:** The Spellblade mastery bonus reads "40% of added melee damage on weapons is also gained as added spell damage" (plus "12 ward gained on melee use and hit at least one enemy"). The data carries it as the mastery field `CharacterMutator.addedMeleeGainedAsAddedSpell = 0.4` (the corrupted sword affix 988, PP646, uses a different field name, `addedMeleeFromWeaponsGainedAsAddedSpell`, so the two may not behave identically). **Known:** the text, the 0.4 value and the words "on weapons" (A). **Not verified (U):** whether a weapon *implicit* counts as "added melee damage on weapons" (for example implicit `14:14` Rat City Impaler: Melee +160 untyped and Void Spell +92..108); whether the copy is untyped Spell damage or keeps the source damage type; whether it follows the skill's conversion (base and untyped added damage follow, typed added damage keeps its type, [damage-pipeline.md](../mechanics/damage-pipeline.md#10-conversion)); whether added melee damage from non-weapon sources (rings, passives) is excluded; whether the copied damage is then scaled by the spell's added-damage effectiveness. The engine code for the field is not in the vendored research (only the field name and its value are).
- **Why it matters for builds:** it can turn a weapon roll into a second damage source for a spell on the same bar (a Spellblade running a spell as its main skill). A model that counts the weapon implicit and the full typed copy is the optimistic reading; the judge-run sensitivity for a Volcanic Orb Spellblade was -19% if the implicit is not copied, and -23.6% if the whole bonus does nothing (both **U**, judge and proposal figures). State the scope assumption and run the model both ways.
- **Involved:** Spellblade mastery (Mage, `mg-1` mastery 2), `masteries.passive_bonus_labels`, corrupted sword affix 988 (10-35% by tier), Bane of Winter uid 345 and Heorot's Repose uid 472 (similar effects, see the entry above).
- **Confidence:** A — `data/le.sqlite` table `masteries` (`passive_bonus_labels`, Spellblade), `vendor/lastepochbuilder/research/data/game/passive_node_effects.json` (field and value 0.4), `vendor/lastepochbuilder/research/data/game/player_property_fields.json` (PP646 field name); scope and conversion behaviour U.

### Ailment-chance conversion uniques funnel every source into one ailment
- **Tags:** conversion, ailment, shred
- **Rule:** Carrion of Creation (uid 431) converts 100% of Ignite, Frostbite, Shock, Time Rot, Damned and Poison chance to Bleed chance (AilmentConversion, SP 100); Apex of Thought (uid 316) converts Ignite/Chill/Shock chance to the matching resistance-shred chance while you stand on Glyph of Dominion; Vial of Volatile Ice (uid 331) turns all poison chance into frostbite for Acid Flask; Tu'rani's Bident (uid 226) turns bleed and ignite chance into electrify for Javelin.
- **Why it matters for builds:** buy whichever ailment chance is cheapest on gear and funnel it into the ailment the build scales; Apex of Thought turns ailment chance into 10-stack shred.
- **Involved:** Carrion of Creation uid 431, Apex of Thought uid 316 (AP694:3 conversion model), Vial of Volatile Ice uid 331, Tu'rani's Bident uid 226, Troaka's Teeth uid 146 (Puncture bleed/poison to frostbite).
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (AilmentConversion effects, uid 431); A — `vendor/lastepochbuilder/research/data/game/uniques.json` (tooltips); `vendor/lastepochbuilder/client/data/unique_effect_models.json` (ability "694:3").

### Reliquaries and totem tide elementals change who "casts"
- **Tags:** conversion, totem, minion, tag-matching
- **Rule:** Radiant Lance "Golden Reliquary": reliquaries casting Radiant Lance count as you indirectly casting it, so it scales with your stats and your cast speed, not minion stats. Summon Tide Elemental "Tidal Totem" makes the elemental a totem affected by totem modifiers (+20% more damage); "Whirlpools" Maelstroms cast by the elemental use the elemental's stats but your Maelstrom tree.
- **Why it matters for builds:** Golden Reliquary is a player-scaled turret with no minion investment; Tidal Totem folds the elemental into totem scalers.
- **Involved:** Radiant Lance (Golden Reliquary, Righteous Preservation), Summon Tide Elemental (Tidal Totem, Whirlpools, Seahenge).
- **Confidence:** X — https://maxroll.gg/last-epoch/news/season-5-patch-notes (New Skills section).

---

## 2. Triggers, procs and proc frequency

### "Directly" means triggered casts do not count
- **Tags:** trigger, proc, tag-matching
- **Rule:** Item triggers that fire on use, cast or end of a skill do not fire from a triggered use; effects worded "when you directly use/cast" ignore casts made by procs, shadows, echoes and wisps. Season 5 added "directly" to the text of Death's Embrace, Event Horizon, Jasper's Searing Pride and Scales of Eterra (description only; behaviour unchanged) and fixed Crystalwind stacks being consumed by indirect bow attacks.
- **Why it matters for builds:** stacking engines (Event Horizon's Dilation, Searing Blades, Infusions) need a skill you press yourself; you cannot feed them from a fast proc.
- **Involved:** Event Horizon uid 364, Jasper's Searing Pride uid 190, Scales of Eterra uids 195-197, Death's Embrace uid 220, Crystalwind uid 378 (PP506), Elecoe's Abandon uid 309.
- **Confidence:** D — `vendor/lastepochbuilder/client/docs/ENGINE.md` §9.1 ("An item trigger on use / cast / end does not fire from a triggered use", engine rule, D?); X — https://maxroll.gg/last-epoch/news/season-5-patch-notes (Uniques and bug-fix sections).

### Alluvion's Tidal Wave fires from indirect melee attacks
- **Tags:** trigger, proc, cooldown
- **Rule:** Alluvion (uid 122, PP76) casts Tidal Wave when a melee attack ability object is created, 100% chance with a 1 s internal cooldown; Season 5 made indirect melee attacks trigger it too, matching the text.
- **Why it matters for builds:** unlike most "on use" uniques it pairs with triggered melee (echoes, procs, shadows), giving a guaranteed Tidal Wave per second for any melee build.
- **Involved:** Alluvion uid 122 (PP76, alluvionWave AbilityID 426).
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/item_procs.json` (uid 122, icdSeconds 1, D(const)); X — https://maxroll.gg/last-epoch/news/season-5-patch-notes.

### Proc caps: internal cooldown versus "N times per T seconds"
- **Tags:** proc, trigger, cooldown
- **Rule:** Item procs roll `chance = mod value` per event and are capped either by an internal cooldown field (Sunforged Cuirass 2 s, Ucenui's Sphere 3 s, Trident of the Last Abyss 3 s) or by a ProcTimeTracker that allows N procs per T seconds (Dark Shroud of Cinders 3/s, Palarus Sacred Light 3/s, Pillager's Gold 2/s). Sustained rate = min(events/s x chance x count, count / ICD).
- **Why it matters for builds:** past the cap, more attack speed or proc chance adds nothing; a PTT cap tolerates bursts, an ICD only rewards uptime.
- **Involved:** `item_procs.json` (38 entries), e.g. Dark Shroud of Cinders uid 117 PP32, Palarus Sacred Light uid 346 PP448, Pillager's Gold uid 291 PP264.
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/item_procs.json`; `vendor/lastepochbuilder/research/07i_unique_formulas.md` §2 and §3.4; `vendor/lastepochbuilder/client/docs/ENGINE.md` §9.6.

### Tooltip and code disagree on some proc timers
- **Tags:** proc, cooldown, anti-synergy
- **Rule:** Locket of the Forgotten Knight's Void Rift on hit says 2 s in the tooltip but the constructor sets 3 s; Isadora's Gravechill grants its +100% chill chance buff for 4 s, not the 5 s the tooltip says.
- **Why it matters for builds:** plan proc uptime from code values; a build balanced on tooltip numbers under-performs.
- **Involved:** Locket of the Forgotten Knight uid 90 (PP40), Isadora's Gravechill uid 26.
- **Confidence:** D — `vendor/lastepochbuilder/research/07i_unique_formulas.md` §3.4 and §6; `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.4.

### Frozen Ire's "doubled against undead" is a second roll
- **Tags:** proc, trigger
- **Rule:** Frozen Ire (uid 32) rolls 0.15 to cast Tundra Nova on hit with cold skills; against undead it rolls a second 0.176471 chance, giving exactly 0.30. The roll happens before the cold-tag check and there is no cooldown.
- **Why it matters for builds:** an uncapped, cooldown-free nova proc that scales with hit rate; multi-hit cold skills get the most from it.
- **Involved:** Frozen Ire uid 32 (Component Frozen_Ire, tundraNova AbilityID 315).
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.4 and §2.6; `vendor/lastepochbuilder/research/data/game/item_procs.json`.

### Ignivar's Head gives free Fire Aura casts while channelling
- **Tags:** trigger, channel, aura
- **Rule:** While channelling, Ignivar's Head (uid 74) casts Fire Aura (AbilityID 162) once per second at no cost, in front of the player after 0.2 s. Any channelled skill qualifies.
- **Why it matters for builds:** any channel build (Disintegrate, Focus, Warpath, Drain Life) gets a Fire Aura engine without a bar slot; Fire Aura area affixes on the same item apply.
- **Involved:** Ignivar's Head uid 74 (Component Ignivar_Head, AP162:1).
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.4; `vendor/lastepochbuilder/research/data/game/unique_effects.json` (uid 74).

### Death Dance turns Evade into a free skill trigger
- **Tags:** trigger, movement, cooldown
- **Rule:** Death Dance (uid 476) sets "Evade has no cooldown" and "You use your leftmost specialized ability while evading", with 18-25% less Evade movement speed.
- **Why it matters for builds:** Evade becomes a spammable button that also uses a specialized skill, so evade-triggered uniques (Dominance of the Tundra's Glacier, Triboelectra's Static Orb, Hydra Arc's bow repeat) fire as often as you press it.
- **Involved:** Death Dance uid 476 (evadeNoCooldown, evadeCastsLeftmostSpecializedAbility), Dominance of the Tundra uid 412 (PP526), Triboelectra uid 351 (PP457), Hydra Arc uid 441 (PP591).
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (uid 476 AbilityProperty field mapping; semantics from tooltip, D?).

### Eternal Font: one potion use per second, even with no potions
- **Tags:** trigger, proc, health, ward
- **Rule:** Eternal Font (uid 473) uses a potion every second even with zero potions, has a 10-20% chance to not consume a potion, and costs 2-4% of current health per potion used recently.
- **Why it matters for builds:** every "on potion use" effect becomes a 1/s trigger: Pillager's Gold Burning Dagger (100% on potion), The Scavenger Haste, Fangs of the Berserker Frenzy, Lightning in a Bottle Evade charge, Omen of Thunder totem immunity, Orian's Descent Volatile Reversal reset, Communion of the Erased doubled belt stats, Chains of Uleros potions giving ward, Elecoe's Innovation potion crits, corrupted belt affixes 997/1000 (ward on potion use).
- **Involved:** Eternal Font uid 473; Pillager's Gold uid 291 (PP265), The Scavenger uid 75, Fangs of the Berserker uid 446 (PP604), Lightning in a Bottle uid 422 (PP557), Omen of Thunder uid 263 (PP226), Orian's Descent uid 404 (PP509), Communion of the Erased uid 327 (PP382), Chains of Uleros uid 18, Elecoe's Innovation uid 402.
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (uid 473 OnUpdateTick, D?; its two drawback PPs sit outside the decoded switch); `vendor/lastepochbuilder/research/data/game/item_procs.json` (uid 291 PP265 chance 1.0).

### Repeat-cast uniques copy the skill, not a proc ability
- **Tags:** trigger, proc, cooldown
- **Rule:** Gathering Fury (uid 271) repeats a directly used bow ability with 8-12% chance (1 s cooldown, 0.3 s delay); Hydra Arc (uid 441) repeats your last bow attack after Evade at 50% of its mana cost (2 or 3 targets at 75 / 135 Dexterity); Wildfire Embers (uid 425) wisps each have 10-12% chance to repeat a directly used non-channelled fire skill with +240-300% ignite chance.
- **Why it matters for builds:** the repeat is the full skill with its tree, so it scales with everything the skill already has; more wisps or evades multiply DPS.
- **Involved:** Gathering Fury uid 271 (PP235), Hydra Arc uid 441 (PP591), Wildfire Embers uid 425 (PP570-573).
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP235 D(const), PP571/591 D?); A — `vendor/lastepochbuilder/research/data/game/uniques.json` tooltips.

### Shadows repeat your next direct use and must be kept in supply
- **Tags:** trigger, buff, scaling-oddity
- **Rule:** A Rogue shadow (CreateShadow, AbilityID 469) imitates your next direct use of Shadow Cascade, Shurikens, Umbral Blades, Dreamslash or Acid Flask; up to 3 (+CreateShadow property 0) are active, each lasts up to 5 s and is consumed by the use it copies. Keeping N shadows needs N x max(uses/s, 1/5) creations per second. Umbral Blades shadows throw one blade with 300% more damage.
- **Why it matters for builds:** shadow builds multiply DPS by (1 + shadows) only while creation keeps up; Doppelganger uniques and Dreamslash Umbral Recollection are the supply side.
- **Involved:** CreateShadow (469), Doppelganger's Deception uid 452, Doppelganger's Mimicry uid 451, Gambit of an Erased Rogue uid 301, Dreamslash nodes.
- **Confidence:** D — `vendor/lastepochbuilder/client/docs/ENGINE.md` §9.10 (BaseUmbralBladesMutator.getTempStats, CreateShadowMutator.Mutate).

### Void Knight echo eligibility
- **Tags:** trigger, tag-matching, channel, movement
- **Rule:** A skill can echo if its tags include Melee, Throwing, or Void plus Spell, it is not a movement skill (Void Cleave is allowed), not Anomaly and not channelled. Chance = sum of `chanceToRepeatMeleeThrowingAttacksAndVoidSpells` (mastery 10% plus passives) with skill modifiers for Rive, Vengeance and Abyssal Echoes; PP57 adds increased damage for echoes.
- **Why it matters for builds:** re-tagging a skill to Throwing or Void Spell (see section 1) makes it echo-eligible; channel builds get nothing from echo chance.
- **Involved:** Void Knight mastery, CharacterMutator.TryToEchoAbility, Rive, Vengeance, Abyssal Echoes, Warpath (own echo rule with its node).
- **Confidence:** D — `vendor/lastepochbuilder/client/docs/ENGINE.md` §9.10 (Void Knight echoes, pseudo-C).

### Minion-skill and minion-hit triggers that pay the player
- **Tags:** trigger, minion, ward, proc
- **Rule:** Dragonflame Edict (uid 124) makes the minion nearest the target cast Dragonflame Nova when you use a minion skill (60%, up to 3/s); Bones of the Ancestral Pack (uid 447) gives a 7-12% chance per minion hit (1 s cooldown) to gain a stack for you and your highest-level minion plus ward equal to 77-123% of your endurance threshold; Pact Severance (uid 252) casts Sacrifice on the lowest-health minion when one dies (2/s).
- **Why it matters for builds:** summoners can run ward and burst engines off minion activity, and endurance-threshold investment doubles as ward generation.
- **Involved:** Dragonflame Edict uid 124 (PP83), Bones of the Ancestral Pack uid 447 (PP607/608), Pact Severance uid 252 (PP212).
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/item_procs.json`; `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP607 D(const), PP608 D?).

### Cooldown recovery on hit for specific skills
- **Tags:** cooldown, trigger, crit
- **Rule:** Black Blade of Chaos (uid 339) recovers 8% of Lethal Mirage's remaining cooldown per melee hit, up to 12 times per use; Razorfall (uid 337) recovers 8% of Aerial Assault's cooldown on throwing hits (3 per window); Talons of Valor (uid 334) gives falcon abilities 25% remaining-cooldown recovery on crit (1 s cooldown).
- **Why it matters for builds:** these work on remaining cooldown, so a fast multi-hit filler turns a long-cooldown nuke into a near-rotation skill.
- **Involved:** Black Blade of Chaos uid 339 (PP412), Razorfall uid 337 (PP409), Talons of Valor uid 334 (PP404).
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (formulas D?, constants from code).

### Harbinger of Stars: the triggered Meteor pays Meteor's mana, and Meteor's own crits do not re-trigger
- **Tags:** trigger, proc, mana, crit
- **Rule:** Harbinger of Stars (uid 288, belt) has "Chance to Cast Meteor on Crit if above 0 Mana" (PP247, 6-9%). Its alt text is "This consumes Meteor's Mana Cost. Does not include crits from Meteor itself." (A, `player_properties` idx 247). So (1) every triggered Meteor spends Meteor's full cost (56 base, less flat reductions such as a staff implicit); it is not free; (2) crits dealt by Meteor do not trigger another Meteor; (3) the gate is "above 0 mana", not "enough mana": at 1 mana a Meteor still fires and takes mana to about -51. Mana can go negative when a skill is used at mana > 0 (**G**, [ward-health-sustain.md](../mechanics/ward-health-sustain.md#6-mana)), and a skill costing 1 or more cannot be used at negative mana (**G**), so a fast cost-4.6 Fireball build stalls whenever a Meteor has driven mana below 0 and resumes only when regeneration lifts it above 0. A cost-0 main skill is never blocked, but then the Meteors self-throttle: they only trigger while mana is above 0. Same item: 1% less damage taken per Meteor cast recently, up to 18 (PP246, multiplicative); mana on potion use per recent Meteor, 9-12, up to 200 (PP248; "recently" is 4 s and a Meteor shower counts once); +3 potion slots at 900 mana or more (PP249). **A**
- **Not verified (U):** whether the negative-mana rule applies to the triggered cast the same way as to a direct cast; whether cost reductions (staff implicit, Bluefeather Band's less spell mana cost, Twin Meteors' +50) apply to the consumed cost; whether the Meteor skill tree applies when Meteor is specialised but not on the bar; any internal cooldown (none in the data); whether the Craterborn buff (Meteor tree, "Casting Meteor") comes from triggered Meteors.
- **Why it matters for builds:** a mana-hungry main skill plus Harbinger of Stars makes the Meteors the largest mana sink; budget mana per second with the Meteor rate (cast rate x crit chance x 6-9%) before trusting a cast rate, and do not pair it with a negative-mana loop (the trigger is off at mana <= 0).
- **Involved:** Harbinger of Stars uid 288; Meteor `me27` (mana cost 56), Aftermath `me27:24` (recover 20% of the mana per point over 3 s, one cast at a time), Craterborn `me27:25`, Cycle of Fire `me27:26` (pays on *direct* Fireball casts), Fireball `fi9`.
- **Confidence:** A — `data/le.sqlite` tables `player_properties` (idx 246-249) and `mods` (unique 288); G — Game Guide negative-mana rule; the engine behaviour of the triggered consumption is U (no decompile trace for PP247).

### Heat Flux (Meteor) charges 120% of Frost Claw's mana cost: which cost is U
- **Tags:** trigger, mana, anti-synergy
- **Rule:** Heat Flux (`me27:27`, up to 3 points, "Frost Claws: 1" per point) reads "Meteors cast Frost Claw towards a nearby enemy on impact, consuming 120% of Frost Claw's mana cost" (A). There is no consumption stat row; the 120% exists only in the node text. Frost Claw's base cost is 12 (A). **Open (U):** whether "Frost Claw's mana cost" is the *current, modified* cost (a build that has taken Frost Claw to 0 pays 0) or a cost without the reductions that apply to a *direct* cast: Gift of Winter (`frc87w:4`) reads "Directly casting Frost Claw costs less mana" (-2 per point). If direct-only reductions do not apply, an example Frost Claw costs (12 - 3 - 3) x 2 = 12 and Heat Flux charges 12 x 1.2 = 14.4 per Frost Claw, 43.2 per Meteor impact at 3 points. Gift of Winter's 12% chance to gain 12 mana is "on Direct Cast" and gives nothing from Heat Flux casts.
- **Why it matters for builds:** on a mana-bound loop Heat Flux can be a pure cost node, not a free extra hit; test it in game (cast Meteor on a target, read the mana change) before counting it as free damage.
- **Involved:** Heat Flux `me27:27`, Frost Claw `frc87w`, Gift of Winter `frc87w:4`, Harbinger of Stars uid 288.
- **Confidence:** A — `data/le.sqlite` `v_skill_node_summary` (`me27`, `frc87w`); the cost basis is U.

---

## 3. Minion, totem and companion stat transfer

### Minions snapshot your stats when summoned
- **Tags:** minion, companion, totem, buff
- **Rule:** On summon, the caster's full stat list (including temporary cast stats) is copied to the minion; there is no live link afterwards. Minions get current player stats only on resummon (tree resummon flags, scene change for Wolf/Bear/Raptor/Sabertooth/Scorpion/Spriggan/Primalist Elemental/Manifest Armor, or a new cast).
- **Why it matters for builds:** temporary player buffs active when you cast the summon are baked in; gear swaps and buffs gained later do nothing until you resummon.
- **Involved:** SummonEntityOnDeath.Summon, AbilityObjectConstructor.constructAbilityObject, SummonPersistenceManager.ResummonCertainMinions.
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §1.1.

### Only Minion-tagged or summon-specific stats transfer, with tags stripped
- **Tags:** minion, tag-matching, totem
- **Rule:** A player stat reaches the minion only if it carries the Minion tag, the Totem tag (totem summons only), or the summon skill's ability id as extraTag; it arrives with Minion/Totem removed. "+40% damage" and "+X% fire damage" give minions nothing; "+30% minion melee damage" becomes melee damage for the minion's melee abilities only.
- **Why it matters for builds:** typed minion affixes ("minion melee", "minion spell") only help minions whose abilities have that tag; "+X% <summon skill> damage" from items transfers even without the Minion tag.
- **Involved:** SummonEntityOnDeath, DamageStats.buildDamageStats; test vectors 1-4 in 07d §1.5.
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §1.1, §1.2, §1.5; G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.Minions_Paragraph_2).

### Minion "on hit" resource gains stay with the player
- **Tags:** minion, ward, health, mana
- **Rule:** HealthGain, WardGain, ManaGain, Haste-on-hit chance and ChanceToCast stats (SP 38, 39, 40, 50, 126, 127) are never copied to minions even when tagged Minion; the summoner processes them itself.
- **Why it matters for builds:** "ward/health gained when your minions hit" is a player defence stat scaling with minion hit rate; many fast minions make it strong.
- **Involved:** EpochExtensions.HandledBySummonerEvenIfMinionTaggedOrAbilitySpecific.
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §1.1 and §1.5 (vector 5).

### Minion power and the hidden pet damage reduction
- **Tags:** minion, defense, scaling-oddity
- **Rule:** From character level 26 minions get 0.8% more damage and 0.8% less damage taken per level (60% / 60% at level 100); the in-game guide still says 0.6%. Every minion also has DamageTaken MORE -0.6 against damage tagged PetResisted (dangerous enemy abilities), so such damage is multiplied by 0.4 x 0.4 = 0.16 at level 100.
- **Why it matters for builds:** minion builds level-scale for free; boss mechanics hit minions far less than raw numbers suggest.
- **Involved:** CharacterStats.SetInitialValues (moreMinionDamagePerLevel 0.008, firstLevelForMinionScaling 26).
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §1.2 and §1.5 (vector 2); A — `vendor/lastepochbuilder/research/02_le_formulas.md` §2.3 and §8 (Season 3 patch note).

### Minion level does nothing; minion ability scaling is computed on you
- **Tags:** minion, scaling-oddity
- **Rule:** Spawned minions are not scaled to level, and the levelScaling of their own abilities is skipped (they have no CharacterDataTracker). The summon skill's levelScaling and attributeScaling are evaluated on the player (character level, player attributes) and transfer when tagged Minion.
- **Why it matters for builds:** your attributes are minion stats (46 summon skills give +4% minion damage per point of their attribute); +skill levels help only through the summon tree.
- **Involved:** ActorData.spawn, applyTemporaryStats, summon skill attributeScaling.
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §1.3; A — `vendor/lastepochbuilder/research/02_le_formulas.md` §2.2.

### Companion limit math
- **Tags:** companion, minion
- **Rule:** Maximum companions = round(2 + added MaximumCompanions) x (1 + increased) x more; each companion contributes 60 to a limit of maxCompanions x 60 unless a mutator changes it. The Land Before (uid 421) gives +4 maximum companions but only one of each type; The Claw / The Fang let wolves fill every companion slot; Herald of the Scurry summons 2 squirrels per wolf (twice the companion limit).
- **Why it matters for builds:** "one of each" plus +4 slots favours a mixed zoo (wolf, bear, raptor, sabertooth, scorpion, spriggan); wolf uniques favour a single-type pack.
- **Involved:** CharacterStats.getMaximumCompanions, The Land Before uid 421 (PP553), The Claw uid 58 / The Fang uid 60 (AP8:3), Herald of the Scurry uid 172 (AP8:2), Naal's Tooth uid 336 (raptors).
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §1.4; `vendor/lastepochbuilder/research/data/game/unique_effects.json` (uids 421, 58, 60, 172).

### Minion AI uses its first ready ability
- **Tags:** minion, cooldown, charges
- **Rule:** A minion with several abilities picks the first ability in its list that is off cooldown and has a charge; abilities after the first uncapped one are never used. The guide says minions prioritise a skill that has just come off cooldown.
- **Why it matters for builds:** minion cooldown recovery directly raises the share of their strong cooldown ability; adding a filler ability through the tree can starve later ones.
- **Involved:** MADStateController / UsingMultipleAbilitiesAI.chooseAbility.
- **Confidence:** D — `vendor/lastepochbuilder/client/docs/ENGINE.md` §9.4 (ability ranges not extracted, D?); G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.Minions_Paragraph_3).

### Bridges that copy player gear stats to minions
- **Tags:** minion, scaling-oddity, legendary
- **Rule:** Julra's Obsession (uid 240) re-adds the glove slot's item stats to minion-tagged abilities (legendary affixes included); Phantom Grip (uid 348) applies your gloves' stats to Forged Weapons at 64-100%; Inheritance of the Erased (uid 409) gives a random minion 200% of the amulet's stats every 10 s; Lethal Concentration (uid 184) applies your poison damage modifiers to Skeleton Rogues and the Falcon at 150-210%; Manifest Armor uses body, helmet, gloves and boots stats.
- **Why it matters for builds:** player-tagged affixes can power minions, e.g. a player-poison gear set driving rogue skeletons or crafted gloves driving forged weapons.
- **Involved:** Julra's Obsession uid 240 (PP199), Phantom Grip uid 348, Inheritance of the Erased uid 409 (PP518), Lethal Concentration uid 184 (AP120:6, AP727:17), Manifest Armor, Ballista Shared Enhancements.
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP199, PP518, AP120:6, D?); X — https://maxroll.gg/last-epoch/resources/damage-explained (Minions: Exceptions).

### Mantle of the Pale Ox: the "redirect" only removes damage from you
- **Tags:** minion, defense, scaling-oddity
- **Rule:** In ApplyConditionalDefenses, Mantle of the Pale Ox (uid 370, PP496) multiplies your incoming damage by (1 - r_h - r_l) with r_h capped at 0.75 whenever a living minion exists; no redirect to a minion is applied in that function. The bear redirect (PP670) works the same way.
- **Why it matters for builds:** if no redirect happens elsewhere, this is near-flat damage reduction that only needs one living minion (a cheap persistent summon); verify in game before relying on it.
- **Involved:** Mantle of the Pale Ox uid 370 (PP496, PP562), bear redirect PP670.
- **Confidence:** D — `vendor/lastepochbuilder/research/07n_defense_conversions.md` §3 rows 27-28 and remark (a) (missing redirect is D?).

### Named buffs refresh, unnamed buffs stack
- **Tags:** buff, minion, scaling-oddity
- **Rule:** StatBuffs.addBuff replaces a buff with the same non-empty name, so Beast King's 8% / 25% less damage taken and Soulfire's +60% fire refresh without stacking. Close Call adds an unnamed +40% dodge rating buff per block, unlimited within 4 s; Undisputed uses 51 rotating names, so it caps at 51 stacks (+408% physical).
- **Why it matters for builds:** "stack per event" uniques built on unnamed or rotating-name buffs scale with event rate; named ones only need uptime.
- **Involved:** Beast King uid 28, Soulfire uid 70, Close Call uid 51, Undisputed uid 30, Isadora's Gravechill uid 26.
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.4 and §2.6; `vendor/lastepochbuilder/research/data/game/unique_effects.json`.

### Holy Aura: active cast replaces the passive aura, minions included
- **Tags:** aura, buff, minion, anti-synergy
- **Rule:** The passive Holy Aura recasts every 0.5 s (4 s buff) on you and all allies within 20 m, minions included. The active cast during its 4 s window (6 s with Concentration) replaces those buffs by name, so values double rather than triple. The only increased-effect source is Covenant of Light (+4% per point, max +20%).
- **Why it matters for builds:** Holy Aura is a free minion aura for Paladin summon hybrids; generic "increased buff/aura effect" stats do not touch it.
- **Involved:** Holy Aura (AbilityID 187, tree ah443), Aura (190), Paladin Covenant of Light, Concentration, Faith's Reward.
- **Confidence:** D — `vendor/lastepochbuilder/research/07l_holy_aura.md` §0-§1; `vendor/lastepochbuilder/research/data/game/holy_aura_model.json`.

### Minion sacrifice, decay and revive uniques
- **Tags:** minion, trigger, health
- **Rule:** Cruelty (uid 341) auto-Sacrifices each new minion after 2 s, spending 53-89% of Sacrifice's mana cost (80% less damage with no mana); Aberrant Call (uid 209) makes minions lose 6% current health per second; Hakar's Phoenix (uid 232) revives a downed companion after 2 s (6 s cooldown) with +100 melee fire damage and 100% ignite chance for 20 s.
- **Why it matters for builds:** Cruelty turns any cheap summon into a Sacrifice launcher; Aberrant Call feeds "on minion death" effects (Death Rattle +30 flat health, Pact Severance, Apogee of Frozen Light).
- **Involved:** Cruelty uid 341 (PP416), Aberrant Call uid 209, Hakar's Phoenix uid 232 (PP181), Death Rattle uid 59, Apogee of Frozen Light uid 292 (PP266).
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP181 D(const), PP416 D?); `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.4 (Death Rattle).

---

## 4. Ward generation engines and ward anti-synergies

### Low-life ward engine: health decay plus missing health as ward
- **Tags:** ward, health, scaling-oddity
- **Rule:** PP70 drains current health by pp per second (`health *= 1 - dt x pp` while health > 1) and PP69 grants pp x missing health as ward per second. Exsanguinous (uid 11) 20% / 20%, Last Steps of the Living (uid 115) 11-15% / 11-15%, Architects of Astral Blood (uid 448) 20% drain with 36-42% missing health as ward; corrupted body affix 1013 and gloves affix 1002 give 4-15%.
- **Why it matters for builds:** health settles low and ward per second scales with max health, so +health becomes +ward; the character is permanently at low life (low-life conditionals and Endurance always on).
- **Involved:** Exsanguinous uid 11, Last Steps of the Living uid 115, Architects of Astral Blood uid 448, Shroud of Obscurity uid 106, corrupted affixes 1002 and 1013.
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (ppFormulas 69, 70); `vendor/lastepochbuilder/research/07i_unique_formulas.md` §5 (vectors 5, 6); A — `vendor/lastepochbuilder/research/data/game/affixes.json` (1002, 1013).

### Mana-to-ward converters
- **Tags:** ward, mana
- **Rule:** Culnivar's Claim (uid 33) sets mana to 0 and grants ward equal to 100% of max mana each time mana is full; Devoured Knowledge (uid 475) grants 9-16% of current mana as ward per second and 9-16% of max mana as endurance threshold; Transient Rest (uid 132) grants 40-60% of current mana as ward when you stop moving (2 s cooldown); Aergon's Refuge (uid 169) 10-20% of current mana per fire spell cast; corrupted affixes 973 and 1021 give mana spent as ward (up to 90-110% / 65-75% at T8).
- **Why it matters for builds:** mana pool and mana regen become ward stats; with Culnivar's Claim the cycle rate is mana regen / max mana, so regen stacking (Urzil's Pride, Apathy) feeds ward.
- **Involved:** Culnivar's Claim uid 33, Devoured Knowledge uid 475, Transient Rest uid 132, Aergon's Refuge uid 169, corrupted affixes 973 and 1021.
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.4 (Culnivars_Claim); `vendor/lastepochbuilder/research/data/game/unique_effects.json` (uids 475, 132, 169); A — `vendor/lastepochbuilder/research/data/game/affixes.json` (973, 1021).

### Health regeneration also applies to ward
- **Tags:** ward, health
- **Rule:** Vessel of Strife (uid 241, PP200) adds WardRegen = 20-30% of total health regeneration; corrupted helmet/body affix 1019 and idol affix 1046 grant the same property (2-6%).
- **Why it matters for builds:** health-regen stacking gives a second, ward-shaped return, independent of Healing Effectiveness.
- **Involved:** Vessel of Strife uid 241, corrupted affixes 1019 and 1046.
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (ppFormulas 200); A — `vendor/lastepochbuilder/research/data/game/affixes.json` (1019, 1046).

### Ward decay threshold from endurance threshold or max health
- **Tags:** ward, endurance, health
- **Rule:** Ward never decays below the Ward Decay Threshold T and decays at `(0.00005 (W-T)^2 + 0.2 (W-T)) / (1 + 0.5 x retention)` above it. Wall of Nothing (uid 354) adds 60-85% of your endurance threshold as decay threshold, corrupted affix 1008 8-20%, Grim Constitution (uid 362) 105-155% of max health, Architects of Astral Blood 36-42% of max health.
- **Why it matters for builds:** a ward pool held at the threshold never decays, so endurance-threshold or health stacking becomes a permanent ward buffer without high retention.
- **Involved:** Wall of Nothing uid 354 (PP463), Grim Constitution uid 362 (PP473/474), Architects of Astral Blood uid 448, corrupted affix 1008, Intelligence (+2% retention per point).
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (ppFormulas 463, PP473); A — `vendor/lastepochbuilder/research/02_le_formulas.md` §7.6 (official formula); G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.Ward).

### Ward caps: the smallest non-zero cap wins
- **Tags:** ward, health, anti-synergy
- **Rule:** Ward is clamped at maxHealth x cap, where the cap is the smaller non-zero of Acolyte "Corrupted Form" (0.5) and Architects of Astral Blood (2.0-2.4). Corrupted Form also caps current health at 50% and makes you always count as low life.
- **Why it matters for builds:** Architects plus Corrupted Form gives the 50% cap, not 240%; Corrupted Form is the free "always low life" enabler for low-life conditionals.
- **Involved:** Acolyte passive Corrupted Form (ac-1 node 115), Architects of Astral Blood uid 448 (PP609).
- **Confidence:** D — `vendor/lastepochbuilder/research/07n_defense_conversions.md` §2 (maxHealthCapForWard).

### Ward bypass flags change what ward protects
- **Tags:** ward, dot, defense, anti-synergy
- **Rule:** Vestige of Imprisonment (uid 487) makes all hit damage bypass ward (PP685) while granting ward regen = 2 per 1% uncapped cold resistance and chill immunity; Acolyte "Impact Ward" (ac-1 node 44, 3+ points) makes DoT bypass ward instead.
- **Why it matters for builds:** Vestige ward is a DoT-only shield, so it pairs with hit defences (armour, block, dodge, endurance) and over-capped cold resistance; never combine it with Impact Ward.
- **Involved:** Vestige of Imprisonment uid 487 (PP684, PP685, PP453), Acolyte Impact Ward.
- **Confidence:** D — `vendor/lastepochbuilder/research/07n_defense_conversions.md` §2 (hitsBypassWard, dotsBypassWard); `vendor/lastepochbuilder/research/data/game/unique_effects.json` (uid 487).

### "No ward gain" blocks every GainWard source
- **Tags:** ward, anti-synergy
- **Rule:** On-hit, on-kill, on-block and unique ward grants all go through GainWard, which is skipped while any no-ward-gain source is active: Fractured Crown (uid 1, "You have no ward") or Grim Constitution while in combat (uid 362).
- **Why it matters for builds:** drop every ward-on-X affix when either item is planned; Grim Constitution's own ward regen and decay threshold are its intended source (whether regen bypasses the block is not traced, D?).
- **Involved:** Fractured Crown uid 1 (PP471), Grim Constitution uid 362 (PP472).
- **Confidence:** D — `vendor/lastepochbuilder/research/07n_defense_conversions.md` §2 (sourcesOfNoWardGain) and §4.3.

### Endurance and mana-before-health never protect ward
- **Tags:** ward, endurance, mana, anti-synergy
- **Rule:** Endurance reduces damage to health below the threshold but not damage to ward; Damage Taken From Mana Before Health (1 mana absorbs 5 damage, applied after other reductions, off at 0 or negative mana) also does not protect ward.
- **Why it matters for builds:** heavy-ward builds get little from endurance or mana shielding until ward breaks; these layers fit health-pool builds.
- **Involved:** Endurance, Damage Taken From Mana Before Health (Sorcerer passives, Mage helmet affix 1022).
- **Confidence:** G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.Endurance_Paragraph_1, GameGuide.DamageTakenFromMana_Paragraph_1-4).

### Ward makes you harder to stun and freeze
- **Tags:** ward, stun, freeze, defense
- **Rule:** Stun chance against a target is `2 x Damage x (1 + inc) / (MaxHealth + CurrentWard) - (500 + StunAvoidance) / 5000`, and freeze chance also divides by (MaxHealth + CurrentWard).
- **Why it matters for builds:** large ward pools double as stun and freeze protection; low-life ward builds keep this at low health.
- **Involved:** stun and freeze formulas (guide images r-34, r-35).
- **Confidence:** A — `vendor/lastepochbuilder/research/02_le_formulas.md` §5.4 (official guide formula images).

### On-hit ward is per hit event and ignores healing modifiers
- **Tags:** ward, health, mana, scaling-oddity
- **Rule:** Untagged health/ward/mana-on-hit stats sum added values only and apply once per detailed hit event (each hit on each target), with separate melee-hit slots; tagged or skill-specific versions pass a tag filter and an ICD. Increased Healing does not scale them, and ward goes through GainWard.
- **Why it matters for builds:** multi-target, multi-hit skills (chains, pierces, AoE pulses) multiply on-hit ward; Healing Effectiveness affixes are useless for it.
- **Involved:** ResourceGainEvents.UpdateResourceGainTotals, SP 38/39/40, Ring of the Third Eye uid 62 (PP130, up to 4/s).
- **Confidence:** D — `vendor/lastepochbuilder/research/07n_defense_conversions.md` §4.3.

### Ward consumption as a damage resource
- **Tags:** ward, scaling-oddity, ailment
- **Rule:** Chronostasis (uid 223) makes melee skills consume up to 500-2000 ward for +1 melee damage per 10 ward; Symbol of Demise (uid 123) consumes all ward every 3 s for one Demise stack per 13 ward (10% bleed chance each, up to 200%); Humming Bee (uid 34) gives elemental melee attacks 1% increased damage per 200 ward without consuming it.
- **Why it matters for builds:** a ward engine can be spent as damage; pair Chronostasis with fast generation (low-life engine) rather than with a decay threshold you want to keep.
- **Involved:** Chronostasis uid 223 (PP173), Symbol of Demise uid 123 (PP82), Humming Bee uid 34 (PP234).
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP234 D, PP173/PP82 D?); `vendor/lastepochbuilder/client/docs/ENGINE.md` §9.1 (Chronostasis `v_caps_source`).

---

## 5. Ailment stacking, duration and unusual scaling

### Ailment chance above 100% applies extra stacks
- **Tags:** ailment, dot
- **Rule:** Each full 100% of chance applies one stack and the remainder is a roll: 235% ignite chance applies 2 stacks plus a 35% chance of a third. At the stack cap a new stack replaces the oldest.
- **Why it matters for builds:** chance is a DPS multiplier for stacking ailments long past 100%, so 300-500% chance (Morditas' Reach +500% frostbite) is real investment, not overcap.
- **Involved:** all stacking ailments; Morditas' Reach uid 45.
- **Confidence:** G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.AilmentMechanics_Paragraph_2, _5).

### Rive's Foe Cleaver doubles the ailment-chance lines on a two-handed weapon
- **Tags:** ailment, double-dip, scaling-oddity
- **Rule:** Foe Cleaver (`sndr1:24`, Rive, 1 point) reads "If you are using a two handed weapon, stats on that weapon that directly add damage, increase damage or add a chance to apply an ailment on hit, have double effect for Rive." Its stat lines are "Effect of Damage Stats on a 2h Weapon: +100%" and "Effect of Ailment Chance Stats on a 2h Weapon: +100%" (A for the text). So an ailment-chance line on the weapon (for example Morditas' Reach's +500% frostbite chance, uid 45, special_tag Frostbite, Melee) would count twice for Rive: **A for the text, U for the engine** (the property is a skill-local code, not decompiled; the tree rows carry no `modifier_type`). Lines that are not on the weapon are not covered by the text.
- **Why it matters for builds:** doubles an already large ailment chance (and, above 100%, the number of stacks per hit), so it can be the largest single link of a frostbite Rive build; label the link U and run the model without it.
- **Involved:** Foe Cleaver `sndr1:24`, Rive `sndr1`, Morditas' Reach uid 45; see "Ailment chance above 100% applies extra stacks".
- **Confidence:** A — `data/le.sqlite` `v_skill_node_summary` (`sndr1:24`); engine effect U.

### Duration raises DPS for uncapped ailments only
- **Tags:** ailment, dot, scaling-oddity
- **Rule:** Increased duration lengthens each stack (more total damage per stack, same damage per second per stack). For ailments with unlimited stacks the number of concurrent stacks = applications/s x duration, so duration raises sustained DPS linearly; for capped ailments (Time Rot 12, Doom 4, shred 10, Chill 3) it only raises uptime.
- **Why it matters for builds:** for ignite/bleed/poison/frostbite/electrify/damned stacking, duration is as good as "more" in steady state; for Time Rot it is near worthless once capped.
- **Involved:** ailment table (max stacks), AilmentCalc load model.
- **Confidence:** G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.AilmentDurationandEffectiveness_Paragraph_0); D — `vendor/lastepochbuilder/client/docs/ENGINE.md` §9.11 (stacks = min(load, maxInstances)); A — `vendor/lastepochbuilder/research/02_le_formulas.md` §5.3.

### Season 5: refreshing an ailment restores its full damage
- **Tags:** ailment, dot
- **Rule:** When an ailment's duration resets, its remaining total damage also resets to the value it had when applied, so a refreshed single-instance ailment deals its full damage again.
- **Why it matters for builds:** single-stack DoTs (Spreading Flames, Plague, Abyssal Decay, damaging curses) reward frequent reapplication.
- **Involved:** General Skill Changes, Season 5.
- **Confidence:** X — https://maxroll.gg/last-epoch/news/season-5-patch-notes (General Skill Changes).

### Ailments cannot apply ailments and DoT triggers nothing on hit
- **Tags:** ailment, dot, trigger, anti-synergy
- **Rule:** Damage over time cannot crit, cannot be dodged, blocked or glanced, and does not trigger on-hit effects such as health gained on hit; ailments cannot apply other ailments (e.g. ailment ticks never apply shred).
- **Why it matters for builds:** shred, on-hit procs and on-hit sustain must come from the hits that apply the DoT; a pure DoT build needs a hit source for them.
- **Involved:** Hit vs DoT rules; Shadow Daggers (the 4-stack finisher is a hit, the ailment is not).
- **Confidence:** G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.HitvsDamageoverTime_Paragraph_3-4); X — https://maxroll.gg/last-epoch/resources/ailments-explained.

### Ailment base damage is fixed and ignores added damage
- **Tags:** ailment, dot, scaling-oddity
- **Rule:** Damaging ailments have fixed base damage (Ignite 40 / 2.5 s, Bleed 53 / 3 s, Poison 28 / 3 s, Electrify 44 / 2.5 s, Frostbite 50 / 3 s, Damned 35 / 2.5 s, Time Rot 60 / 3 s) and an added-damage effectiveness of 0; flat added damage never raises them. They are scaled by the applying skill's tree modifiers and its attribute scaling.
- **Why it matters for builds:** for ailment builds flat damage affixes are dead; chance, duration, generic/type/DoT increased, skill-tree more and attributes are the scalers.
- **Involved:** all damaging ailments.
- **Confidence:** G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.AilmentMechanics_Paragraph_3); A — `vendor/lastepochbuilder/research/02_le_formulas.md` §5.1, §5.3, §9.

### Frostbite and poison numbers in community guides are outdated
- **Tags:** ailment, freeze, anti-synergy
- **Rule:** 1.5.0 data: Frostbite deals 50 cold over 3 s and only the first 15 stacks add +20% chance to be frozen each (max +300%); Poison deals 28 over 3 s; Time Rot 60 over 3 s. Maxroll's ailment page still lists Frostbite 36 with 30 stacks, Poison 20 and Time Rot 55.
- **Why it matters for builds:** freeze builds stop gaining freeze chance at 15 frostbite stacks; DoT math with the old numbers under-rates poison by 40%.
- **Involved:** Frostbite, Poison, Time Rot.
- **Confidence:** A — `vendor/lastepochbuilder/research/02_le_formulas.md` §5.3 (game data); G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.Frostbite_Paragraph_1-2); X — https://maxroll.gg/last-epoch/resources/ailments-explained (the outdated values).

### Freeze chance multiplies chill and frostbite
- **Tags:** freeze, chill, ailment
- **Rule:** Freeze chance = FreezeRate x (1 + FreezeRatePerChill x chill stacks) x FreezeRateMultiplier / (MaxHealth + Ward) x (1 + 0.2 x min(frostbite, 15)); bosses count health x 1.5. The guide's example goes from 2.4% to 24% with 3 chill stacks and 15 frostbite.
- **Why it matters for builds:** freeze rate multiplier, chill and frostbite are three multiplicative layers, so spreading investment beats stacking one; Snowdrift (uid 233) also converts freeze rate multiplier into frostbite effect (next entry).
- **Involved:** freeze formula; Snowdrift uid 233 (PP182, see the next entry), Frozen Ire uid 32 (+2% FRM per level).
- **Confidence:** A — `vendor/lastepochbuilder/research/02_le_formulas.md` §5.4 (guide image r-35); D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP182).

### Snowdrift turns Freeze Rate Multiplier into Cold penetration for Frostbite
- **Tags:** freeze, ailment, penetration, scaling-oddity
- **Rule:** Snowdrift (uid 233, boots) carries PP182 "Cold Penetration with Frostbite per 10% Freeze Rate Multiplier" (0.01). The decompiled formula adds Increased Ailment Effect for Frostbite (specialTag 23) equal to `pp x FreezeRateMultiplier x 10`; Frostbite's `effectOfIncreasedEffectiveness` is `AdditionalPenetration`, which the engine reading turns into penetration (the open question in [ailments.md](../mechanics/ailments.md#open-questions); the in-game wording "Cold Penetration" supports it), so the result is Cold penetration on the Frostbite DoT: 18.23 FRM gives 0.01 x 182.3 = +182% (**D?**). Alt text (A): "Does not include Freeze Rate Multiplier granted by individual skills' trees or Freeze Rate Multiplier for specific ability types", so only the general stat store (gear, passives, blessings) counts. **U:** whether the base 100% of the freeze rate multiplier is in that input (worth +10% penetration); whether penetration is capped (none found in data or decompile). Earlier text of this catalogue said "frostbite effect"; the in-game wording is Cold penetration with Frostbite.
- **Why it matters for builds:** FRM becomes a damage multiplier on the Frostbite DoT; every 10% FRM is +1% penetration, which adds to the `1 - res + pen` multiplier (a large factor against a target with 0% resistance).
- **Involved:** Snowdrift uid 233 (PP182, AP782:2), Frostbite Shackles uid 213 (FRM 1.43-1.83), affix 14 (Freeze Rate Multiplier and Cold Resistance, T7 2.71-3.50), affix 11, Frozen Ire uid 32.
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP182 `frostbiteEffectPer10percentFreezeRateMulti`); A — `data/le.sqlite` `player_properties` idx 182 alt text.

### Shred is weak against bosses, penetration is not
- **Tags:** shred, penetration, shock
- **Rule:** Resistance shred and Shock subtract 5% per stack from normal enemies but 2% from bosses and players (10 stacks); poison's shred is also 60% weaker on bosses. Penetration applies after the 75% cap, can go below 0 and has no boss penalty in any source.
- **Why it matters for builds:** a bossing build should prefer penetration; shred still adds with penetration and pushes resistance negative.
- **Involved:** Resistance Shred, Shock, Poison, Penetration.
- **Confidence:** G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.ResistanceShred_Paragraph_0, GameGuide.Penetrations); A — `vendor/lastepochbuilder/research/02_le_formulas.md` §6.1.

### Taste of Blood doubles bleed speed per melee hit, compounding
- **Tags:** ailment, dot, scaling-oddity
- **Rule:** Each melee hit on a bleeding target sets every active bleed's speed to (speed + 1) x 2 - 1, so after three hits a stack ticks 8x as fast, with no cap or cooldown. Faster bleeds also expire sooner.
- **Why it matters for builds:** front-loads bleed damage enormously for fast melee hitters; pairs with high bleed duration (more total damage per stack) and large bleed chance.
- **Involved:** Taste of Blood uid 29 (Component Taste_of_Blood); S5 gave it 20-30% increased bleed duration.
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.4 and §2.6 (vector 7); X — https://maxroll.gg/last-epoch/news/season-5-patch-notes.

### Hit scaling from the number of ailment stacks
- **Tags:** ailment, crit, scaling-oddity
- **Rule:** Jormun's Feast (uid 466, PP631) gives crit multiplier per 10 bleeds on the target, up to 200 bleeds; SP 115 "DamagePerStackOfAilment" items give more damage per stack on the target (Plague Bearer's Staff, Firestarter's Torch); Torkrefin's Hunger converts uncapped physical resistance into bleed chance and bleed penetration per Viscera stack.
- **Why it matters for builds:** a bleed stacker's hit skill can scale off its own DoT stacks, enabling hit/DoT hybrids on one weapon.
- **Involved:** Jormun's Feast uid 466, Plague Bearer's Staff uid 73, Firestarter's Torch uid 282, Torkrefin's Hunger uid 250.
- **Confidence:** D — `vendor/lastepochbuilder/research/07i_unique_formulas.md` §3.2 (PP631); `vendor/lastepochbuilder/research/data/game/unique_effects.json` (DamagePerStackOfAilment effects).

### Self-inflicted ailments as a resource
- **Tags:** ailment, ward, debuff, scaling-oddity
- **Rule:** Bleeding Heart (uid 55) bleeds you on spell cast, Marina's Lost Soul (uid 181) Damns you on spell cast, Immolator's Oblation (uid 258) ignites you and grants spell damage per ignite on you (up to 20), Pyre of Affliction (uid 259) converts ignites on you to Damned and gives necrotic penetration per Damned on you, Ashes of Mortality (uid 257) gives 30 ward per ignite and Damned on you.
- **Why it matters for builds:** self-ailments become a damage and ward stat; pair with ailment-on-you mitigation (Pyre's less fire/necrotic DoT taken) and avoid immunities to the same ailment.
- **Involved:** uids 55, 181, 257, 258, 259.
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP140, PP214, PP224, PP225; D?); A — `vendor/lastepochbuilder/research/data/game/uniques.json` tooltips.

### Witchfire scales with increased curse damage
- **Tags:** ailment, curse, dot, scaling-oddity
- **Rule:** Downfall of the Righteous (uid 414) gives Witchfire (600 fire + 600 necrotic over 12 s) more damage equal to 66% of your increased curse damage, and inflicts it every second within 10 m while you have both Ignite Overload and Damned Overload.
- **Why it matters for builds:** curse-damage stacking, normally niche, becomes a multiplicative scaler for a huge single-stack DoT aura.
- **Involved:** Downfall of the Righteous uid 414 (PP520, PP521).
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP521 GetAilmentDamageModifier, D?); A — `vendor/lastepochbuilder/research/02_le_formulas.md` §5.3 (Witchfire base).

### Salt the Wound: crit multiplier for DoT builds (code differs from text)
- **Tags:** crit, ailment, penetration, scaling-oddity
- **Rule:** Salt the Wound (uid 187) says added crit multiplier is converted to physical penetration with bleed and poison penetration with poison; the decoded handler instead adds IncreasedAilmentEffect for Bleed / Poison = 40-50% x total added crit multiplier (conversion factor unresolved).
- **Why it matters for builds:** either way, crit-multiplier affixes become useful for DoT builds that cannot crit; verify which stat it grants before valuing it.
- **Involved:** Salt the Wound uid 187.
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (uid 187, D?).

---

## 6. Defensive conversions and conditional defenses

### "Damage taken as" conversions do not normalise or chain
- **Tags:** conversion, defense, anti-synergy
- **Rule:** Each "X damage taken as Y" stat moves min(sum of added values, 1.0) of the original source type; shares from different stats are not normalised, so 60% physical as fire plus 60% physical as cold leaves -20% physical (dropped) and 120% total damage. Conversions never chain (A to B plus B to C does not move A to C), the new type is mitigated by its own resistance, and hits and DoT are both converted.
- **Why it matters for builds:** keep total conversion of one source at or below 100%; convert into your best resistance (e.g. physical to fire with over-capped fire res and Null Portent). Blossom of Immortal Stone turns three elements into physical, so one physical-resistance and armour stack covers them.
- **Involved:** SP 31-37; The Ashen Crown uid 105 (40-80% physical as fire), Orian's Eye uid 61 (100% void as fire), Bane of Winter uid 345 (100% cold as physical), Blossom of Immortal Stone uid 429 (100% void, necrotic and poison as physical), Decayed Skull uid 4 (20% void and necrotic as physical), Ravenous Void uid 208 (10-15% physical as void), Sabertooth Shatterhide, idol affixes.
- **Confidence:** D — `vendor/lastepochbuilder/research/07n_defense_conversions.md` §1.1, §1.3; `vendor/lastepochbuilder/research/data/game/conditional_defenses.json` (convertDamageTaken).

### Two passive "damage taken as" nodes do nothing
- **Tags:** conversion, defense, anti-synergy
- **Rule:** Knight "Abyssal Fluctuation" (Elemental damage taken as Void) and Acolyte "Decaying Form" (DoT taken as Poison) carry tags Elemental / DoT, which match none of the damage-type bits the conversion function tests, so they convert nothing in 1.5.0 code.
- **Why it matters for builds:** do not spend points on them for mitigation planning until fixed.
- **Involved:** Knight passive Abyssal Fluctuation (kn-1 id 64), Acolyte passive Decaying Form (ac-1).
- **Confidence:** D — `vendor/lastepochbuilder/research/07n_defense_conversions.md` §1.2 (in-game behaviour D?).

### Dodge conversions and their priority
- **Tags:** dodge, armour, endurance, conversion
- **Rule:** Only one dodge conversion applies, priority endurance threshold > glancing blow > armour: dodge rating to endurance threshold (Foot of the Mountain while you have a Mountain's Endurance stack), dodge to glancing blow at 2 x dodge chance with no dodge roll (Rogue Apostasy), dodge rating added to armour (Knight Iron Reflexes, 5+ points). Converted dodge no longer dodges.
- **Why it matters for builds:** Dexterity and dodge affixes become armour or endurance-threshold stats for tanky Sentinels and Rogues; two conversions together waste the lower one.
- **Involved:** PP425 / PP194 / PP177, Foot of the Mountain uid 253, Rogue Apostasy (rg-1), Knight Iron Reflexes.
- **Confidence:** D — `vendor/lastepochbuilder/research/07n_defense_conversions.md` §2; A — `vendor/lastepochbuilder/research/data/game/uniques.json` (uid 253 tooltip).

### Block conversions: parry without a shield, or glancing blow
- **Tags:** block, defense, conversion
- **Rule:** Clotho's Needle (uid 417) converts block chance to parry chance while not wielding a shield (parry negates the hit, cap 75%, still counts as a hit); Rogue "Deflect and Weave" (5+ points) converts block to glancing blow. Parry wins if both apply; converted block no longer rolls block.
- **Why it matters for builds:** two-handed and dual-wield builds can use block-chance passives and affixes as full hit avoidance.
- **Involved:** Clotho's Needle uid 417 (PP531), Deflect and Weave (PP392).
- **Confidence:** D — `vendor/lastepochbuilder/research/07n_defense_conversions.md` §2; G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.Parry).

### The Slab: block cap 75% with no damage on block
- **Tags:** block, defense
- **Rule:** The Slab (uid 50, internal name The Monolith) gives 100% less damage taken on block and caps block chance at 75% (PP614 written to maximumBlockChance).
- **Why it matters for builds:** at 75% block every blocked hit is nullified, so block chance becomes 75% hit avoidance and block effectiveness stops mattering; blocked hits still trigger on-block effects.
- **Involved:** The Slab uid 50 (PP614).
- **Confidence:** D — `vendor/lastepochbuilder/research/07n_defense_conversions.md` §2 (maximumBlockChance); A — `vendor/lastepochbuilder/research/data/game/uniques.json` (uid 50 tooltip).

### Block and armour against damage over time
- **Tags:** block, armour, dot, defense
- **Rule:** Normally only resistances and endurance mitigate DoT. Countenance of Majasa (uid 411) multiplies DoT taken by (1 - blockMitigation x pp) as if blocked; Abandoned Chitin of the Weaver (uid 455) makes 1% of armour mitigation apply to DoT per 10 total attributes (SP 118, capped at 100%).
- **Why it matters for builds:** armour or block-effectiveness stackers can close their DoT hole; Abandoned Chitin rewards high total attributes.
- **Involved:** Countenance of Majasa uid 411 (PP524), Abandoned Chitin of the Weaver uid 455.
- **Confidence:** D — `vendor/lastepochbuilder/research/07n_defense_conversions.md` §3 row 33; `vendor/lastepochbuilder/research/data/game/unique_effects.json` (uid 455); `vendor/lastepochbuilder/client/docs/ENGINE.md` §10.2.

### Endurance details and the "always below threshold" trick
- **Tags:** endurance, health, defense
- **Rule:** Endurance (base 20%, cap 60%) applies to the part of each hit or DoT that lands below the threshold (base 20% of max health, no cap), even if the hit started above it. Flesh of Stone (uid 248) caps your health at your endurance threshold, so endurance applies to all health damage; Seed of Ekkidrasil (uid 357) also applies endurance to damage dealt to mana.
- **Why it matters for builds:** threshold stacking (Devoured Knowledge mana as threshold, Brewmaster's Buckle, corrupted affix 1020) becomes full-pool mitigation with Flesh of Stone (obtainability unverified: it is missing from Maxroll's item data).
- **Involved:** Flesh of Stone uid 248 (PP208), Seed of Ekkidrasil uid 357 (PP309), Devoured Knowledge uid 475, Knowledge of an Erased Mage uid 298 (PP278), Brewmaster's Buckle uid 416.
- **Confidence:** G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.Endurance); D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP208, PP309); `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.5 (hidden items).

### Conditional "more/less damage taken" multiply; "increased damage taken" adds
- **Tags:** defense, scaling-oddity
- **Rule:** ApplyConditionalDefenses starts at M = 1 and multiplies M by (1 + x) for every satisfied condition, so unique "less damage taken" effects stack multiplicatively; DamageTaken modifiers of type increased add together in one pool, type more multiply. Endurance's 60% is multiplicative with other modifiers.
- **Why it matters for builds:** several small conditional "less damage taken" effects (Red Ring of Atlaria 10%, Beast King 8%, Titan Heart 15%) compound; check whether a source says "less" or "reduced".
- **Involved:** CharacterMutator.ApplyConditionalDefenses (42 conditions), property 6 DamageTaken.
- **Confidence:** D — `vendor/lastepochbuilder/research/07n_defense_conversions.md` §3; `vendor/lastepochbuilder/research/07i_unique_formulas.md` §2; A — `vendor/lastepochbuilder/research/02_le_formulas.md` §6.3.

### Delayed damage from boss and rare hits
- **Tags:** defense, health, ward
- **Rule:** Immortal Vise, Grasp of the Blood Mage (20-25%) and Effusive Oath (15-20%) deal that fraction of each rare/boss hit over 4 s instead of instantly; the delayed part was already mitigated once (armour, resistances, block, endurance), ward absorbs the ticks and minimumHealth caps them. Immortal Vise adds 30% reduction below the endurance threshold while more than 10% of max health is pending.
- **Why it matters for builds:** turns one-shots into a 4 s window for leech, regen and ward to answer; strongest with high sustained recovery.
- **Involved:** Immortal Vise uid 415 (PP498, PP525), Grasp of the Blood Mage uid 372, Effusive Oath uid 484 (which also has 10-15% more hit damage taken from bosses and rares).
- **Confidence:** D — `vendor/lastepochbuilder/research/07n_defense_conversions.md` §3 row 29 and §3.1; `vendor/lastepochbuilder/research/data/game/unique_effects.json` (uids 372, 484).

### Chance to take no damage from a hit
- **Tags:** defense, scaling-oddity
- **Rule:** Wall of Nothing (10-16%), Seed of Ekkidrasil (4-8%) and Exulis (1% per 10 Guile, the corrupted Dexterity) each roll independently per hit and set that hit's damage to 0.
- **Why it matters for builds:** independent rolls multiply: 16% and 8% together nullify 1 - 0.84 x 0.92 = 22.7% of hits, before dodge or parry.
- **Involved:** Wall of Nothing uid 354 (PP462), Seed of Ekkidrasil uid 357, Exulis uid 469 (PP657, needs Dexterity converted to Guile).
- **Confidence:** D — `vendor/lastepochbuilder/research/07n_defense_conversions.md` §3 rows 1 and 30; `vendor/lastepochbuilder/research/07i_unique_formulas.md` §5 (vector 9).

### Over-capped resistance as a stat
- **Tags:** defense, scaling-oddity, penetration
- **Rule:** Over-capping does not help against enemy area-level penetration, but several effects read uncapped resistance: Null Portent (uid 358) 1% less damage per 2% above cap per type (max 20%); Cradle of the Erased (uid 295) block effectiveness per 1% total uncapped resistance; Thicket of Blinding Light (uid 426) thorns per 10% uncapped physical res; Wildfire Embers ignite chance per 10% uncapped fire res; Urzil's Pride (uid 10) +0.5% mana regen per 1% uncapped lightning res (its 40 cap never binds because res is stored as a fraction); Scorched Earth minion fire penetration per 3% over-capped fire res.
- **Why it matters for builds:** stacking one resistance far past 75% is a damage and defence engine with these items, especially combined with damage-taken conversion into that type.
- **Involved:** uids 358, 295, 426, 425, 10, 485, 479 (Withstand the Elements), Torkrefin's Hunger uid 250.
- **Confidence:** D — `vendor/lastepochbuilder/research/07i_unique_formulas.md` §3.1, §3.3, §5; `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.4 (Urzils_Pride); G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.Penetrations_Paragraph_3).

### Glancing blow above 100% is wasted; parry and glancing still count as hit
- **Tags:** defense, block, trigger
- **Rule:** Glancing blow reduces a hit by 35% and chance above 100% does nothing; glancing blows and parries still count as being hit, so "when hit" effects trigger.
- **Why it matters for builds:** cap glancing at 100% (Apostasy converts at 2 x dodge chance, so overshoot is easy); "when hit" proc builds keep their procs under full parry.
- **Involved:** Glancing Blow, Parry, Rogue Apostasy.
- **Confidence:** G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.GlancingBlow_Paragraph_0-1, GameGuide.Parry).

### Armour is 70% effective against non-physical hits, hits only
- **Tags:** armour, defense
- **Rule:** Armour mitigation depends on area level and caps at 85% for physical hits; non-physical hits get 0.7 x that (max 59.5%); DoT is not mitigated without SP 118. The 2019 community formula "protection / (HP + protection)" is obsolete.
- **Why it matters for builds:** armour stacking is a strong generic hit layer that leaves DoT open; pair it with Abandoned Chitin or resistances.
- **Involved:** armour formula (guide image r-30).
- **Confidence:** A — `vendor/lastepochbuilder/research/02_le_formulas.md` §7.2 (official formula); the old formula is U — https://forum.lastepoch.com/t/unintuitive-mechanics-guide-for-le (2019, outdated).

---

## 7. Double-dipping and what does not double-dip

### Typed increased damage hits both the hit and its ailment
- **Tags:** double-dip, ailment, tag-matching
- **Rule:** "Increased fire damage" scales Fireball's hit and its ignites (both carry Fire); "increased damage over time" scales only the ignites; "increased spell / melee / hit" never reaches ailments, because ailments carry only DoT plus their damage type (curses also Curse and Spell).
- **Why it matters for builds:** for hit+ailment hybrids buy type-generic and generic damage; skip delivery-type affixes for the ailment half.
- **Involved:** ailment tags, modifier subset matching.
- **Confidence:** G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.AilmentMechanics_Paragraph_4); X — https://maxroll.gg/last-epoch/resources/damage-explained; A — `vendor/lastepochbuilder/research/02_le_formulas.md` §1.2, §5.1.

### Skill attribute scaling and tree "more" also scale the skill's ailments
- **Tags:** double-dip, ailment, scaling-oddity
- **Rule:** A skill's attribute scaling (397 skills give +4% generic increased damage per point) is generic increased damage, so it also applies to the ailments the skill applies; skill-tree more-damage nodes apply to the skill's ailments unless they say "hit".
- **Why it matters for builds:** the skill's attribute and its tree multipliers double-dip into hit and DoT; a node that says "hit damage" is worth about half for a hybrid.
- **Involved:** Warpath / Strength example, attributeScaling in abilities.json.
- **Confidence:** G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.AilmentMechanics_Paragraph_3); A — `vendor/lastepochbuilder/research/02_le_formulas.md` §2.2; X — https://maxroll.gg/last-epoch/resources/ailments-explained.

### Skill-tree % damage is a separate multiplier
- **Tags:** scaling-oddity, double-dip
- **Rule:** Damage % inside a skill tree acts as a more multiplier on top of global increased damage (developer statement, 2021); per LE Tools data, points within one node add (value x points) while separate nodes multiply.
- **Why it matters for builds:** tree damage nodes are worth far more than equal global increased; prefer several different damage nodes over maxing one.
- **Involved:** skillBonuses type 2 entries (e.g. Fireball node 6, 7% more per point).
- **Confidence:** X — `vendor/lastepochbuilder/research/02_le_formulas.md` §1.5 (developer post plus LE Tools data).

### Old claim: tree "more" without "(multiplicative)" sums together
- **Tags:** scaling-oddity, anti-synergy
- **Rule:** A 2020 forum test concluded that skill-node "more" modifiers without the "(multiplicative with other modifiers)" text are summed into one bucket, and only the explicitly multiplicative ones multiply.
- **Why it matters for builds:** if true it lowers the value of stacking several unqualified tree "more" nodes; the 2021 dev statement and 1.5 tree texts (which now mostly print the multiplicative clause) suggest it may be outdated, so test before relying on either reading.
- **Involved:** skill-tree damage nodes worded "deal more damage".
- **Confidence:** U — https://forum.lastepoch.com/t/about-the-wording-of-mult-more-sources-of-damage/21499 (2020, pre-1.0, may be outdated).

### Penetration applies to damage over time
- **Tags:** penetration, dot, double-dip
- **Rule:** Ailments use the penetration of their damage type, and items grant DoT-only penetration (Atrophy +20-25%, Weaver's Gift +22-33% against all resistances for DoT); resistances and endurance are the only DoT mitigations on the receiving side.
- **Why it matters for builds:** "penetration against all resistances for damage over time" is one of the best DoT multipliers.
- **Involved:** Atrophy uid 116, Weaver's Gift uid 408.
- **Confidence:** A — `vendor/lastepochbuilder/research/02_le_formulas.md` §5.1; `vendor/lastepochbuilder/research/data/game/uniques.json` (uids 116, 408 tooltips).

### Shred, penetration, armour shred and damage taken: which add, which multiply
- **Tags:** shred, penetration, debuff, double-dip
- **Rule:** Resistance shred and penetration add together (both lower resistance); armour shred is a separate multiplier (hits only, with diminishing returns like armour); "increased damage taken" sources add into their own pool that multiplies with the resistance term; "more damage taken" debuffs (Decrepify 15% more DoT taken) multiply.
- **Why it matters for builds:** spread enemy debuffs across pools (resistance, armour, damage taken) instead of stacking one.
- **Involved:** Shred, Penetration, Armour Shred, Withering, Decrepify, Efficacious Toxin.
- **Confidence:** X — https://maxroll.gg/last-epoch/resources/damage-explained (Shred and Penetration, Increased Damage Taken); A — `vendor/lastepochbuilder/research/02_le_formulas.md` §6.2, §6.3.

### Leech uses final damage, includes ward hits, excludes overkill
- **Tags:** leech, health, ward
- **Rule:** Leech = damage after all enemy mitigation x leech%, paid over 3 / (1 + increased leech rate) s per instance with no cap; damage absorbed by the target's ward still leeches, overkill does not. Leech works on DoT unless the source says "on hit".
- **Why it matters for builds:** DoT leech is legitimate sustain; increased leech rate shortens the payout instead of raising the total.
- **Involved:** ProtectionClass.ApplyDamage, SP 51 HealthLeech, SP 102 IncreasedLeechRate, SP 93 overkill leech.
- **Confidence:** D — `vendor/lastepochbuilder/research/07n_defense_conversions.md` §4.1; G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.HealthLeech).

### Healing effectiveness does not touch leech, regen or on-hit gains
- **Tags:** health, leech, idol, anti-synergy
- **Rule:** Increased Healing (SP 44) scales only heals computed by specific ability components and mutators (Healing Hands, Judgement, Warcry, Rip Blood, Ring of Shields, Sacred Plant and similar); it does not affect leech, health on hit/kill/block/crit or regeneration.
- **Why it matters for builds:** Frostborn Solitude's 50% reduced healing effectiveness per Heretical Idol is nearly free for a leech/regen build; healing-effectiveness affixes are worthless for such builds.
- **Involved:** SP 44 IncreasedHealing, Frostborn Solitude uid 486 (IdolAltarProperty 29/30), Eterra's Path uid 21.
- **Confidence:** D — `vendor/lastepochbuilder/research/07n_defense_conversions.md` §4.2; A — `vendor/lastepochbuilder/research/data/game/uniques.json` (uid 486 tooltip).

### Weapon damage is added damage, multiplied by added-damage effectiveness
- **Tags:** scaling-oddity, tag-matching
- **Rule:** Melee skills have about 2 base damage; the weapon's damage is flat added damage, so it is multiplied by each component's added damage effectiveness (ADE, 0 to 6+), which never multiplies base damage. Untyped added damage takes the skill's base type.
- **Why it matters for builds:** high-ADE skills (Meteor 900%, Radiant Lance 500%, Tide Elemental Geyser 400% for minion spell damage) are where flat added damage is worth most.
- **Involved:** addedDamageScaling per component; Radiant Lance, Summon Tide Elemental, Dreamslash (150%).
- **Confidence:** G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.BaseDamage, GameGuide.DamageEffectiveness); A — `vendor/lastepochbuilder/research/02_le_formulas.md` §1.1, §9.

### Crit does nothing for damage over time
- **Tags:** crit, dot, anti-synergy
- **Rule:** Damage over time cannot crit (all ailments have critType 1); critType 2 components roll crit chance but ignore the multiplier. Crit affixes are dead for pure DoT builds unless an item converts them (Ignivar's Head, Salt the Wound).
- **Why it matters for builds:** DoT builds should drop crit unless a converter is present.
- **Involved:** critType data, Ignivar's Head uid 74, Salt the Wound uid 187.
- **Confidence:** A — `vendor/lastepochbuilder/research/02_le_formulas.md` §3; G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.HitvsDamageoverTime_Paragraph_4).

---

## 8. Attribute, level and resource scaling oddities

### Corrupted attributes replace per-point bonuses
- **Tags:** scaling-oddity, legendary
- **Rule:** An amulet corruption can convert an attribute: Strength to Brutality (0.02% more melee damage per 1 mana cost per point, counting up to 20 mana cost; -0.5% health leech per point), Vitality to Rampancy (+3% Frenzy effect, 0.1% more damage taken without Frenzy per point), Dexterity to Guile (+0.3% movement-skill cooldown recovery, -1% armour per point), Intelligence to Madness (+1% spell crit multiplier, +1% bonus crit damage taken per point), Attunement to Apathy (+2% mana regen, 0.2% current health lost per direct skill use per point).
- **Why it matters for builds:** Brutality turns a Strength stacker with 20-mana melee attacks into +0.4% more melee damage per point (100 Brutality = 40% more); Madness suits spell-crit stackers; the hidden attributes also feed Exulis (uid 469).
- **Involved:** attributes.json corruptedPerPoint (PP636-638, corruptedFlag PP650-654), Exulis uid 469 (PP656-660).
- **Confidence:** A — `vendor/lastepochbuilder/research/data/game/attributes.json`; X — https://maxroll.gg/last-epoch/resources/item-corruption (whether a skill's own attribute scaling still reads a converted attribute is unconfirmed).

### Mana cost as a damage stat
- **Tags:** mana, scaling-oddity, crit
- **Rule:** Several effects read the skill's mana cost: Brutality and corrupted weapon affix 986 (more melee damage per 1 mana cost, up to 0.5% per mana at T8), World Splitter (uid 365: +2% melee area and +0.2-0.3% melee crit chance per 1 mana cost, +1% melee crit multiplier per 10 max mana), Effusive Oath (uid 484: +10% bleed chance per 1 mana cost).
- **Why it matters for builds:** adding mana cost (tree nodes with +mana cost, Radiant Lance Avenging Wrath, Exterminatus +25) becomes a damage investment, and mana efficiency then works against you.
- **Involved:** corrupted affix 986, World Splitter uid 365, Effusive Oath uid 484, Brutality.
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (uids 365, 484, D?); A — `vendor/lastepochbuilder/research/data/game/affixes.json` (986); `vendor/lastepochbuilder/research/data/game/attributes.json`.

### "Per N attribute" bonuses are continuous
- **Tags:** scaling-oddity
- **Rule:** Unique "X per N attribute" effects compute pp x attribute / N with no floor (e.g. Vilatria's Downfall shock duration per Intelligence, Black Blade of Chaos lightning and void penetration per 5 Dexterity, Primal Cadence crit multiplier per 2 Strength).
- **Why it matters for builds:** every single point counts; there are no breakpoints to chase.
- **Involved:** PP145, PP146, PP413/414, PP431, PP285 and other ADDSTAT handlers.
- **Confidence:** D — `vendor/lastepochbuilder/research/07i_unique_formulas.md` §2 (scheme 1) and §3.3.

### Total-attribute and attribute-copy uniques
- **Tags:** scaling-oddity, set, crit
- **Rule:** Red Ring of Atlaria (uid 277) gives 10% less damage taken at 180+ total attributes; Abandoned Eyes of the Weaver (uid 454) +1% crit chance per 40 total attributes and +1 skill level per 120; Abandoned Chitin (uid 455) armour applies to DoT per 10 total attributes; Cleaver Solution (uid 314) sets Intelligence equal to Strength; Legends Entwined (uid 423) gives +2-5 all attributes, +2-5% all resistances and +1 skill level per complete set.
- **Why it matters for builds:** "all attributes" affixes (and corrupted body affix 1011: +8-21 all attributes with 7 corrupted non-idol items) become defence and skill levels; Cleaver Solution lets a Strength stacker scale Intelligence skills and ward retention.
- **Involved:** uids 277 (PP240), 454, 455, 314 (PP339, D?), 423 (PP566-568), corrupted affix 1011.
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json`; A — `vendor/lastepochbuilder/research/data/game/affixes.json` (1011).

### Highest and lowest attribute set Haste and Frenzy strength
- **Tags:** buff, scaling-oddity, dot
- **Rule:** Gift of the Eidolon (uid 478) grants permanent Haste and Frenzy, +1% Frenzy effect per point of your highest attribute and +2% Haste effect per point of your lowest; its 15-20% less DoT taken while hasted scales with Haste effect, capped at 75% less (the same cap applies to Advent of the Erased).
- **Why it matters for builds:** a balanced attribute spread makes the DoT-reduction clause huge; Haste-effect stacking (Rampancy, Exulis, idol affix 1030) reaches the 75% cap.
- **Involved:** Gift of the Eidolon uid 478 (PP519, PP613, PP275, PP667, PP668), Advent of the Erased uid 296.
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP667/668 D, PP275 D?); `vendor/lastepochbuilder/research/07n_defense_conversions.md` §3 row 14; X — https://maxroll.gg/last-epoch/news/season-5-patch-notes (75% cap).

### Character level as a flat-damage source
- **Tags:** scaling-oddity
- **Rule:** Hammer of Lorent (uid 41) gives +1 melee physical damage and +1% increased melee stun chance per level (+100 at level 100); Frozen Ire (uid 32) gives +0.2 cold damage, +2% freeze rate multiplier and +1% necrotic resistance per level.
- **Why it matters for builds:** strong endgame weapons that look weak when inspected at low level; value them at the planned level.
- **Involved:** Hammer of Lorent uid 41, Frozen Ire uid 32.
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.4 and §2.6 (vectors 3-4).

### Movement speed as damage and block
- **Tags:** movement, scaling-oddity, block
- **Rule:** Vaion's Chariot (uid 264) gives +1% increased damage per 1% increased movement speed and 24-40% more damage on the next movement skill every 3 s; Wrongwarp (uid 310) and corrupted wand affix 975 give +2% / +0.8-1.6% increased spell damage per 1% increased movement speed; Unbroken Charge (uid 450) gives block effectiveness per 1% movement speed and block chance while moving.
- **Why it matters for builds:** movement-speed affixes and Haste become damage multipliers.
- **Involved:** Vaion's Chariot uid 264 (PP93, PP228), Wrongwarp uid 310 (PP324), corrupted affix 975, Unbroken Charge uid 450 (PP624, PP625).
- **Confidence:** D — `vendor/lastepochbuilder/research/07i_unique_formulas.md` §3.2; `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP324, PP624, PP625); A — `vendor/lastepochbuilder/research/data/game/affixes.json` (975).

### Max mana as defence and damage
- **Tags:** mana, stun, endurance, scaling-oddity
- **Rule:** Strong Mind (uid 54) adds 2 x max mana as stun avoidance and casts a lightning explosion when you are stunned; Devoured Knowledge makes 9-16% of max mana endurance threshold; Radiant Lance "Cloudless Sky" deals 1% more damage per 25 max mana; Radiant Lance "Devotion" adds 20% of max mana per point as endurance threshold while casting it.
- **Why it matters for builds:** a mana-stacking Paladin or Mage turns one stat into damage, stun immunity and endurance threshold.
- **Involved:** Strong Mind uid 54, Devoured Knowledge uid 475, Radiant Lance nodes.
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.4 and §2.6 (vector 5); X — https://maxroll.gg/last-epoch/news/season-5-patch-notes (Radiant Lance).

---

## 9. Build-enabling uniques (grouped by what they enable)

### Ignivar's Head: Disintegrate scales with crit chance it cannot use
- **Tags:** crit, channel, dot, scaling-oddity
- **Rule:** Ignivar's Head adds DisintegrateMutator.moreDamagePerCritChanceFromItems = 1.0, giving Disintegrate more damage equal to your spell crit chance (+5% base), with no cap.
- **Why it matters for builds:** a channelled DoT that cannot crit scales from crit-chance affixes; 100% spell crit chance means +100% more damage.
- **Involved:** Ignivar's Head uid 74 (Component Ignivar_Head), Disintegrate.
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.4; `vendor/lastepochbuilder/research/data/game/unique_effects.json` (uid 74).

### Truesight Glass makes crit chance above 100% useful
- **Tags:** crit, scaling-oddity
- **Rule:** Crit chance above 100% normally does nothing; Truesight Glass (uid 439, primordial) converts it into a chance (up to 50% in S5) to deal Deadly Strikes, which count as crits with +300% crit multiplier, and grants +1 to all skills. The Bloodrage buff "Incisive Rage" grants a flat 20% Deadly Strike chance.
- **Why it matters for builds:** crit stackers keep scaling chance up to 150%; it occupies the single primordial slot.
- **Involved:** Truesight Glass uid 439 (PP590, flag D?), Incisive Rage.
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP590); X — https://maxroll.gg/last-epoch/news/season-5-patch-notes; https://maxroll.gg/last-epoch/resources/damage-explained (overcap does nothing).

### Gambler's Fallacy: big for slow hits, a trap for fast crits
- **Tags:** crit, anti-synergy, channel
- **Rule:** Gambler's Fallacy (uid 130) gives +100% added crit chance to non-channelled skills if you have not crit in 4 s, but every crit applies 50% less crit chance for 4 s.
- **Why it matters for builds:** it guarantees the first crit of slow heavy hits (cooldown nukes) and actively hurts fast crit builds; Soul Gambler's Fallacy (uid 265) works the same.
- **Involved:** Gambler's Fallacy uid 130 (PP419, PP89), Soul Gambler's Fallacy uid 265.
- **Confidence:** D — `vendor/lastepochbuilder/research/07i_unique_formulas.md` §3.2; `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP419 D, PP89 D(const)).

### Alternating-element and alternating-delivery uniques
- **Tags:** tag-matching, penetration, ailment
- **Rule:** Eternal Eclipse (uid 212): every 2 s the next Void melee attack gets +200-240 melee fire damage and +200-240% ignite chance, and the next Fire melee attack gets +200-240 melee void damage and Time Rot chance (one 2 s timer per side). Zeurial's Hunt (uid 251): a lightning bow attack gives the next throwing attack within 2 s +62-92% lightning penetration and vice versa; doing both within 2 s grants Haste.
- **Why it matters for builds:** these demand two skills of opposite tags in rotation and reward exact alternation; a single-skill build gets half or nothing.
- **Involved:** Eternal Eclipse uid 212 (PP161-164), Zeurial's Hunt uid 251 (PP229-231).
- **Confidence:** D — `vendor/lastepochbuilder/research/07i_unique_formulas.md` §3.2 and §5 (vector 8); `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP229-231).

### Stack-and-spend uniques for burst
- **Tags:** buff, scaling-oddity, movement
- **Rule:** Crystalwind (uid 378): +4 stacks per second while moving and 4 on Evade (max 8); a direct bow attack spends up to 4 for 8-15% more damage each. Event Horizon (uid 364): +15% more melee damage per Dilation stack (up to 10) at 5% less attack, cast and movement speed per stack, all lost on Evade. Trinity of Flames (uid 219): every 3rd fire spell is a guaranteed crit (S5 removed its crit-multiplier penalty).
- **Why it matters for builds:** Event Horizon at 10 stacks is about 4x melee damage on a slower character; Crystalwind rewards kiting bow play; Trinity favours slow heavy fire spells.
- **Involved:** Crystalwind uid 378 (PP502-506), Event Horizon uid 364 (PP475), Trinity of Flames uid 219 (PP170).
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP506 D, others D?); X — https://maxroll.gg/last-epoch/news/season-5-patch-notes (Trinity change).

### Item-stat multipliers
- **Tags:** idol, legendary, scaling-oddity
- **Rule:** Harmony of the First (uid 427) increases its own stats by 16-20% per equipped non-idol magic item; Reliquary Nest (uid 433) gives non-unique idols 40-60% increased effect; Wings of Discord (uid 436) boosts non-unique idols whose shape differs from all others; Communion of the Erased (uid 327) doubles its stats for 1 s after a potion and adds a potion slot per Weaver's Will item; Julra's Stardial (uid 238) triples its stats for 4 s after a movement skill (12 s cooldown); Orb Weaver's Fang (uid 405) doubles its stats for 5 s after hitting a low-health boss or rare.
- **Why it matters for builds:** Harmony favours cheap magic items in many slots; Reliquary Nest makes the idol grid the main stat source; Communion plus Eternal Font approaches permanent uptime.
- **Involved:** uids 427 (PP582), 433 (PP583), 436, 327 (PP382/383), 238 (PP197), 405 (PP510).
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (formulas D?, PP383 D); A — `vendor/lastepochbuilder/research/data/game/uniques.json` tooltips.

### Titan Heart's two-handed "less damage taken"
- **Tags:** defense, health, anti-synergy
- **Rule:** Titan Heart (uid 13) applies DamageTaken MORE -0.15 (15% less damage taken) only while you use a two-handed melee weapon, and you do not regenerate health.
- **Why it matters for builds:** a strong multiplicative layer for two-handers; useless for dual wield, shields or ranged, and it pushes sustain to leech or ward.
- **Involved:** Titan Heart uid 13 (PP129).
- **Confidence:** D — `vendor/lastepochbuilder/research/07i_unique_formulas.md` §3.1.

### Morditas' Vengeance keeps leech running at full health
- **Tags:** leech, health, dot, legendary
- **Rule:** Morditas' Vengeance (uid 488, Pinnacle Morditas only) lets health leech keep accumulating at full health, gives DoT leeched as health per 20% cold resistance, and makes 20-40% of leech also drain the nearest enemy within 6 m.
- **Why it matters for builds:** effects that need active leech, and the leech-as-damage drain, stay on permanently, turning leech into a constant damage aura; it pairs with Fangs of the Berserker's drain.
- **Involved:** Morditas' Vengeance uid 488, Fangs of the Berserker uid 446 (PP599/600).
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (uid 488, D?); X — https://maxroll.gg/last-epoch/resources/rage-of-morditas (Pinnacle Rewards).

### Sets: distinct pieces count, Legends Entwined counts for every set
- **Tags:** set, legendary
- **Rule:** Set count = number of different uniqueIDs of the set equipped plus the number of Legends Entwined rings; two copies of the same piece count once. Reforged set items (set affixes crafted onto normal items) count as set items. Set bonuses have fixed values.
- **Why it matters for builds:** Legends Entwined turns any 2-piece into a 3-piece bonus and boosts every set at once; reforged set affixes free the uniques' slots.
- **Involved:** Legends Entwined uid 423, Isadora set test vector, ItemEquipManager.UpdateStats.
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.3; G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.Sets_Paragraph_4).

### Totem-amplifying uniques
- **Tags:** totem, minion, buff, trigger
- **Rule:** Omen of Thunder (uid 263) gives all totems +24-34 spell lightning damage for 20 s when you directly summon a Storm Totem, and on potion use heals all totems and grants them 2 s damage immunity; Stormcarved Testament (uid 214) grants totem lightning stats and can summon a Storm Totem on hit (8 s cooldown); Tempest Maw (uid 31) adds 4 Storm Sprites per totem summon (2 per 6 s); Boardman's set pieces give Haste, Frenzy or Enrage when your Storm Totem hits you or companions.
- **Why it matters for builds:** Storm Totem becomes a buff hub for you and companions; Eternal Font makes Omen of Thunder's immunity near-permanent.
- **Involved:** uids 263 (PP226/227), 214 (PP166), 31 (PP661), 127-129 (AP195:6/7/8).
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json`; `vendor/lastepochbuilder/research/data/game/item_procs.json` (uid 214).

### Spell-cast ward and health converters
- **Tags:** ward, health, scaling-oddity
- **Rule:** Twisted Heart of Uhkeiros (uid 216) converts 5-8% of current health into ward on each direct necrotic or elemental spell cast; Apostate's Sanctuary (uid 290) gives +2 health per Vitality, but each direct spell costs 36-48% of current health and ward and disables leech for 4 s.
- **Why it matters for builds:** pair Twisted Heart with high regen or the low-life engine (health refills, ward accumulates); Apostate's Sanctuary needs a non-leech recovery source.
- **Involved:** Twisted Heart of Uhkeiros uid 216, Apostate's Sanctuary uid 290 (PP285, PP263, PP269).
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP285 D, others D?).

### Uniques that rewrite the minion roster
- **Tags:** companion, minion, conversion
- **Rule:** Herald of the Scurry (uid 172) replaces wolves with two squirrels each and Howl with Sciurine Rage; Wraithlord's Harbour (uid 335) replaces Summon Wraith with a Wraithlord that summons wraiths and consumes non-wraith minions; Unbroken Legion (uid 471) forbids non-skeleton specializable minions but gives skeletons Frenzy and Haste on summon; Chorus of the Anurok (uid 430) fills empty companion slots with Primal Anuroks.
- **Why it matters for builds:** these change minion count and mix, so "per minion" effects (Bloodkeeper's Nest bees, Pack Rage, Apiarist's regen per bee) scale differently.
- **Involved:** uids 172, 335, 471 (PP666), 430 (PP578).
- **Confidence:** A — `vendor/lastepochbuilder/research/data/game/uniques.json` tooltips; D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (PP578, PP666, D?).

---

## 10. Season 5 (1.5.x) additions

### Radiant Lance scales with uncapped block chance or max mana
- **Tags:** block, mana, conversion, scaling-oddity
- **Rule:** Radiant Lance (Paladin, 15 points) requires a shield and deals 1% more damage per 1% uncapped block chance, with 500% added damage effectiveness and +4% damage per Attunement; "Cloudless Sky" removes the shield requirement and switches to 1% more per 25 max mana; Sunbeam, Abyssal Heresy and Effusive Oath (uid 484) convert it to fire, void or physical.
- **Why it matters for builds:** block chance past the 75% cap still adds damage (uncapped), so a block stacker gets offence from defence; high ADE favours flat spell damage.
- **Involved:** Radiant Lance, Effusive Oath uid 484, The Slab uid 50.
- **Confidence:** X — https://maxroll.gg/last-epoch/news/season-5-patch-notes (Radiant Lance); A — `vendor/lastepochbuilder/research/02_le_formulas.md` §10 ("Season 5 added uncapped-block-chance scaling").

### Summon Tide Elemental: a permanent minion that buffs totems and crows
- **Tags:** minion, totem, aura, conversion
- **Rule:** One permanent elemental (400 base health, +16 health per Attunement and per level) whose minion spell added damage applies at 200% (bolts) and 400% (Geyser); Wellspring grants allies +4 cold spell damage and 2% cast speed per point (converted along with the elemental), and Pools of Reverence doubles it for totems; Thunder / Wind Elemental convert frostbite and cold shred to shock and lightning shred, or frailty and physical shred; Scorched Earth (uid 485) converts it to fire.
- **Why it matters for builds:** a Shaman can fold a minion into a totem or Storm Crows build; high ADE makes flat minion spell damage the main scaler.
- **Involved:** Summon Tide Elemental, Scorched Earth uid 485 (tideElementalFireConversion, minion fire penetration).
- **Confidence:** X — https://maxroll.gg/last-epoch/news/season-5-patch-notes (Summon Tide Elemental); D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (uid 485).

### Dreamslash: shadow-fed melee with Dream stacks
- **Tags:** trigger, movement, conversion, ailment
- **Rule:** Dreamslash (Bladedancer, 10 points) is a dash plus slash (one hit per enemy) that shadows also perform; Narcolepsy grants a Dream stack every 2 s that a direct use spends for 120% more damage, Dreamwalker speeds Dream gain by Dexterity, Dreamshift consumes a shadow to start from its position, and Trance of Isolation / Apocalyptic Vision convert it to cold or fire with ailment-chance conversion from all sources.
- **Why it matters for builds:** a high attack-speed melee skill that both consumes and recreates shadows; its conversions reuse bleed-chance gear as frostbite or ignite.
- **Involved:** Dreamslash tree, DreamslashMutator conversions, Doppelganger uniques.
- **Confidence:** X — https://maxroll.gg/last-epoch/news/season-5-patch-notes (Dreamslash); A — `vendor/lastepochbuilder/research/data/game/skill_conversions.json`.

### Bloodrage buffs, and Unsated Rage makes one permanent
- **Tags:** buff, trigger, scaling-oddity
- **Rule:** Rage of Morditas grants a random Bloodrage buff per charge (20/50/90/140/200 kills), each also +5% attack and cast speed and 3% movement speed, for the encounter only. Unsated Rage (uid 477) rings carry one of 27 of these effects permanently, e.g. Portentous Rage (a directly used non-channelled, non-cooldown ability is cast again after 1 s, once per second) or Incisive Rage (20% Deadly Strike chance).
- **Why it matters for builds:** Portentous Rage is close to doubling a skill used about once per second; treat an Unsated Rage roll as a build-defining affix.
- **Involved:** Rage of Morditas, Unsated Rage uid 477, Withstand the Elements uid 479 (over-capped cold/physical resistance variants).
- **Confidence:** X — https://maxroll.gg/last-epoch/resources/rage-of-morditas (Bloodrage Buff List, Variant Unique Items).

### Corrupted affixes that change rules
- **Tags:** ward, mana, conversion, scaling-oddity
- **Rule:** Notable corrupted affixes in 1.5.0 data: 986 more melee damage per 1 mana cost; 988 weapon melee added damage as spell damage; 987 parry chance while dual wielding plus parry chance as increased melee damage; 973/1021 mana spent as ward; 1008 endurance threshold as ward decay threshold; 1019/1046 health regen applies to ward; 1007 damage reflected per armour mitigation; 1011 all attributes with 7 corrupted non-idol items. Season 5 gave several of them minimum area levels on pre-corrupted drops.
- **Why it matters for builds:** corrupted slots are where rule-changing hybrids live; check this list before assuming a mechanic needs a unique.
- **Involved:** affixIds 951-1049 (`isCorrupted`), corruption outcomes.
- **Confidence:** A — `vendor/lastepochbuilder/research/data/game/affixes.json` (isCorrupted entries); X — https://maxroll.gg/last-epoch/news/season-5-patch-notes (Items: level requirements).

### Unique idols are limited to one of each
- **Tags:** idol, anti-synergy
- **Rule:** From Season 5 every unique idol (legendary idols included) can be equipped at most once; The Land Before lost its "only unique idol" condition and Singularity became a flat 12-30% more hit damage.
- **Why it matters for builds:** idol plans that repeat the same unique idol are invalid; Singularity no longer forces a single-idol setup.
- **Involved:** The Land Before uid 421, Singularity uid 246 (PP206), unique idols.
- **Confidence:** X — https://maxroll.gg/last-epoch/news/season-5-patch-notes (Uniques).

### Idol altars and refracted slots
- **Tags:** idol, scaling-oddity
- **Rule:** Idol altars reshape the idol grid and add refracted slots whose bonuses come from altar affixes (e.g. 10-40% increased effect of suffixes for idols in refracted slots, armour or mana per idol in a refracted slot, extra Weaver or Omen idol limits); altar bases carry implicits such as Auric Altar's 2% more damage to bosses per equipped unique or legendary idol.
- **Why it matters for builds:** an altar plus Reliquary Nest stacks two increased-effect layers on idol stats; Auric Altar rewards unique-idol builds (now one of each).
- **Involved:** 13 altar layouts (Archaic, Auric, Carcinised, Impervious, Jagged, Lunar, Ocular, Prophesied, Pyramidal, Skyward, Spire, Twisted, Visage), Reliquary Nest uid 433.
- **Confidence:** X — https://maxroll.gg/last-epoch/resources/idol-altars; G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.IdolAltars).

### Weaver tree nodes change loot, not combat
- **Tags:** weaver, anti-synergy
- **Rule:** Every decoded Weaver tree node changes echo rewards, encounter frequency or drop rules (including the three Season 5 Rage of Morditas nodes); none grants a combat stat or changes a combat rule.
- **Why it matters for builds:** do not search the Weaver tree for build power; it is a farming tool (imprints, Weaver's Will drops).
- **Involved:** TheWeaver.UpdateWeaverTreeNode nodes (e.g. Seekers of Ice and Blood, Portents of Blood, Twinned Tyrants).
- **Confidence:** A — `vendor/lastepochbuilder/research/data/game/weaver_node_effects.json`; X — https://maxroll.gg/last-epoch/resources/weaver-tree-strategies.

### Primordial and Weaver's Will items have hard limits
- **Tags:** legendary, weaver, anti-synergy
- **Rule:** Only one primordial item can be equipped (25 primordial uniques, including Truesight Glass, Tyrant's Skull, Reliquary Nest, Architects of Astral Blood and Legends Entwined); T8 affixes are 50-100% stronger than T7 and seal separately. A unique has either Legendary Potential or Weaver's Will, never both, and corrupted items cannot become legendaries.
- **Why it matters for builds:** two primordial enablers (e.g. Truesight Glass plus Architects) cannot be combined; plan one per build.
- **Involved:** isPrimordialItem uids 423-449, Weaver's Will uniques, corrupted items.
- **Confidence:** G — `vendor/lastepochbuilder/research/02_assets/ingame_gameguide_en_v1.5.0.txt` (GameGuide.PrimordialItems, GameGuide.WeaversWill, GameGuide.LegendaryItems_Paragraph_8); A — `vendor/lastepochbuilder/research/data/game/uniques.json` (isPrimordialItem); X — https://maxroll.gg/last-epoch/resources/primordial-items.

---

## 11. Anti-synergies and traps

### Cooldown recovery on skills without a cooldown
- **Tags:** cooldown, charges, anti-synergy
- **Rule:** Effective cooldown = (base + added length) x (1 + increased length) / ((1 + increased CDR) x (1 + more CDR)); a skill with no cooldown gains nothing from cooldown recovery. Extra charges only raise burst: steady-state uses/s = min(cast-speed rate, 1 / cooldown). Some effects impose a minimum cooldown (Wrongwarp: Teleport/Transplant minimum 3 s).
- **Why it matters for builds:** do not value CDR for spammable mains; value charges only for burst windows.
- **Involved:** cooldown fields (addedCharges, increasedCooldownRecoverySpeed, moreCooldownRecoverySpeed), Wrongwarp uid 310.
- **Confidence:** D — `vendor/lastepochbuilder/client/docs/ENGINE.md` §9.6; `vendor/lastepochbuilder/research/07c_skill_mutators.md` §1 and §4.9; A — `vendor/lastepochbuilder/research/data/game/uniques.json` (uid 310).

### Training dummies have no level damage reduction
- **Tags:** defense, anti-synergy, scaling-oddity
- **Rule:** Monsters have an unpenetrable damage reduction by level (about 75% at 75, 87% at 100); training dummies have none, so dummy numbers are roughly 7.7x real damage against level-100 enemies.
- **Why it matters for builds:** compare builds by relative DPS, never by dummy numbers against content thresholds.
- **Involved:** monster level damage reduction table.
- **Confidence:** X — `vendor/lastepochbuilder/research/02_le_formulas.md` §6.4 (Tunklab datamine, forum reports); A — `vendor/lastepochbuilder/research/data/monster_level_damage_reduction.json`.

### "No crit" and "cannot leech" drawbacks hide on strong uniques
- **Tags:** crit, leech, anti-synergy
- **Rule:** Wing Guards (uid 27) and Singularity (uid 246) say you cannot deal critical strikes; Sacrificial Embrace (uid 217) makes crits deal no extra damage; Boulderfists (uid 25), Xithara's Conundrum (uid 133) and Flesh of Stone (uid 248) disable leech; Zerrick's Greed (uid 139) blocks DoT leech and Peak of the Mountain (uid 256) leech from crits; Leviathan Carver (uid 183) makes you unable to avoid crits.
- **Why it matters for builds:** check drawback lines before stacking crit or leech around these items.
- **Involved:** uids 27, 246, 217, 25, 133, 248, 139, 256, 183.
- **Confidence:** A — `vendor/lastepochbuilder/research/data/game/uniques.json` (tooltips).

### Immunity uniques block self-ailment synergies
- **Tags:** ailment, debuff, anti-synergy
- **Rule:** Mask of Indifference (uid 434) makes you immune to Blind, Bleed, Slow, Chill, Shock and Stun; Snowblind (uid 2) to Blind and Chill; Lightning in a Bottle (uid 422) to Shock; Vestige of Imprisonment to Chill. Immunity is checked in IsImmuneToAilment, so self-applied stacks of those ailments should be blocked too.
- **Why it matters for builds:** do not pair Shock immunity with Stormtide (shocked when you stop) or Bleed immunity with Bleeding Heart when the self-ailment is the point.
- **Involved:** uids 434 (PP452/584/450/555), 2 (PP452/453), 422 (PP555), 487 (PP453), Stormtide uid 20, Bleeding Heart uid 55.
- **Confidence:** D — `vendor/lastepochbuilder/research/data/game/unique_effects.json` (IsImmuneToAilment handlers); the self-application case is D? (same check assumed).

### Snapshot trap: buffs and gear after summoning
- **Tags:** minion, buff, anti-synergy
- **Rule:** Because minion stats are a summon-time snapshot, player buffs gained after the summon (Haste, Frenzy, shrines) and item swaps do not reach existing minions until a resummon; the snapshot does include temporary stats active when you cast the summon.
- **Why it matters for builds:** for persistent minions, cast the summon inside your buff window or use a resummon node.
- **Involved:** SummonEntityOnDeath snapshot (see section 3).
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §1.1 (a re-snapshot on gear change for living minions was not found, D?).

### Self-damage costs on uniques and corrupted attributes
- **Tags:** health, anti-synergy, ward
- **Rule:** Calamity (uid 0) deals 1 fire damage to you per recent fire kill every 0.5 s for 2 s (about 4 per kill, linear in concurrent kills) through normal mitigation; Grasp of the Blood Mage reflects mana spent to you as damage (multiplier 2.5, D?); Apathy costs 0.2% current health per direct skill use per point; Eternal Font costs 2-4% current health per recent potion.
- **Why it matters for builds:** these drains matter at low life or for health-only pools (ward absorbs them); budget recovery for them.
- **Involved:** Calamity uid 0, Grasp of the Blood Mage uid 372, Apathy (corrupted Attunement), Eternal Font uid 473.
- **Confidence:** D — `vendor/lastepochbuilder/research/07d_minions_uniques.md` §2.4 and §2.6 (vector 2); `vendor/lastepochbuilder/research/data/game/unique_effects.json` (uids 372, 473, D?); A — `vendor/lastepochbuilder/research/data/game/attributes.json` (Apathy).

### Old community numbers that are wrong in 1.5
- **Tags:** ailment, ward, anti-synergy
- **Rule:** The 2019 community guide states poison base 20 with +10% poison damage taken per stack, bleed 48, and ward decay of 20% of current ward per second; 1.5.0 data has Poison 28 base with -5% poison resistance for the first 30 stacks, Bleed 53, and quadratic ward decay above a decay threshold.
- **Why it matters for builds:** discard numbers from pre-1.0 guides; use the data values in this catalogue.
- **Involved:** 2019 "Unintuitive Mechanics Guide".
- **Confidence:** U — https://forum.lastepoch.com/t/unintuitive-mechanics-guide-for-le (2019, outdated), superseded by `vendor/lastepochbuilder/research/02_le_formulas.md` §5.3 and §7.6.

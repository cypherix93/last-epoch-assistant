SOURCE: https://devtrackers.gg/last-epoch/p/59661aaf-overhauling-defenses-in-last-epoch
FETCHED: 2026-10-08
TITLE: [2020] Overhauling Defenses in Last Epoch | Last Epoch Dev Tracker | devtrackers.gg
NOTE: Official forum / dev-tracker post; overhauling defenses

---
[2020] Overhauling Defenses in Last Epoch | Last Epoch Dev Tracker | devtrackers.gg

about 6 years
ago -
Trasochi
-
Direct link

## Overview of changes

- Protections are being replaced by percentage based resistances.

- Armor is now separate from the resistance system and reduces damage taken from all hits.

- Glancing Blow is no longer a primary defense stat. It still exists, but has been removed from most items and abilities.

- Penetration, shred, and defensive bonuses from attributes have all been reworked.

- Most gear with affected stats has been altered to fit the new system. Check yourself before you venture out.

 

## Resistance system changes

Up until now, Last Epoch has used a less traditional method for damage type specific defenses. You could find protections that scaled like flat added effective health towards a specific damage type. We are switching to a standard percentage resistance system capped at 75%, for example instead of an item having 50 fire protection it may have 5% fire resistance. Armor previously acted as physical protection in everything but name, but now serves a different purpose, and a physical resistance stat has been added alongside the other resistances.

One of the main reasons that we have avoided this system in the past is that having uncapped resistances is very punishing. It provides this knowledge gate for players that is often a hard learned lesson. The rate at which being uncapped affects the damage you take is also fairly unintuitive. Being even 25% below the cap will cause you to take double damage compared to someone at cap. It feels like you should only take 25% more damage but it’s actually 100% more. To counteract this, enemies have a 1% resistance penetration per level, scaling up to 75%. This resistance penetration is applied after the cap. This means that at level 75 and above, being 25% below capped resistance will only cause you to take 25% more damage. Damage dealt by all enemies has been reduced across the board with this new scaling in mind.

This means that getting to the resistance cap is important, but missing out on it won’t completely cripple your defenses. We feel that this change makes the system much more intuitive overall to new and veteran players alike. This also gives a distinct feeling of improvement when any stat goes up. Previously when you equipped an item which gave you a bunch of health, your protection percentages would go down and having your stats go down when you get better doesn’t feel good.

Where does that leave Armor?

Armor now assumes the primary role that Glancing Blow previously held. Mitigation against being hit. Any damage that would be dealt to you as a hit is now reduced by your armor. This has the added bonus of being a very thematically relevant change as now armor doesn’t help you if you are bleeding out or are on fire but rather helps prevent damage that comes in from that initial fireball hit. Armor no longer scales with your health but instead scales with area level similarly to dodge chance.

Armor is now 25% more effective at mitigating damage dealt to your health below a flat health threshold (30 + 3 per area level). If damage is dealt to part of your health above the threshold and part of your health below the threshold then only the part below the threshold will be reduced. This is to help prevent one shots and also to slightly reduce the downside of having a low health total, as that means that a higher percentage of your health will be below the threshold. This has no effect on damage dealt to ward, even if you are below the threshold.

Click here for a (numbers-heavy) example.

For example at level 90 if you had enough armor to mitigate 40% damage by default, it would mitigate 50% of damage dealt to your health below a 300 health threshold.

So if you had 360 current health and took a 500 damage hit (after other mitigation is applied) this would be reduced by 40% to 300 damage. The first 60 damage is above the 300 health threshold so that is applied without any extra mitigation. The next 240 damage is below the threshold so the 40% mitigation is changed to a 50% mitigation, reducing it to 200 damage.

So you take 260 damage in total, leaving you at 100 health.

 

## Penetration changes

Penetration for players is now also percentage based. You simply subtract your penetration from their resistance to get their effective resistance. If you have 20% fire penetration against an enemy that has 50% fire resistance it’ll be as if they have 30% fire resistance. If you have 20% fire penetration against an enemy that has 0% fire resistance it’ll be as if they have -20% resistance, so they’ll take 20% more damage. This change should make penetration more useful, intuitive, and effective against targets with high resistance as its name implies.

Penetration applies after the resistance cap, so resistance above 75% does not help against it.

 

## Shred

Protection shred ailments, such as fire protection shred, have been changed to resistance shred ailments, such as fire resistance shred. These ailments reduce resistance by 5% against most enemies (2% against bosses and players) and can stack up to 20 times. Resistance shred applies before the resistance cap as it’s just reducing the respective resistance stat.

Armor shred has also remained and still reduces armor by 100 as before.

Magic and rare enemies can have a suffix that causes them to apply resistance shred on hit. This is generally an intuitive resistance shred type. For example ice elementals can have a suffix that gives them cold resistance shred. This means that resistance you end up with above the cap isn’t useless when fighting an enemy which can apply a resistance shred. It is not intended to be so important that you intentionally aim for overcapped resistance.

 

## Other Defense Changes

- Increased health per level to 8 (from 6) to reduce reliance on flat health affixes.

- Glancing Blow is now a lot rarer and is not considered a core defense. It is no longer possible to acquire enough to cap it at 100%.

- Existing set affixes have been replaced with combined set resistance affixes (e.g. +4% physical and void resistance per equipped item with this affix). Previous set affixes were very strong and would take up a lot of your prefix slots which could have otherwise been used for niche or damage stats. Aside from set glancing blow, set affixes could only spawn on a small selection of item types, making it feel bad to use uniques or rares without set affixes in those slots. These new affixes are like set glancing blow in that they can roll on lots of different item types, and you only need it on a few of them to cap the respective resistances. Consequently they just provide an alternative way of capping resistance rather than a strong additional layer of defense that could feel mandatory at times.

- Vitality now grants 10 health and 2% increased health regen (from 15 void, necrotic, and poison protection). Vitality was one of the places where we couldn’t just change a source of protection to the equivalent resistance, as resistances have a cap and we don’t want there to be a point above which an attribute is no longer useful to stack. This change should be more intuitive to people expecting a Vitality attribute to give health like it does in many other games, and also provides another source of flat health to reduce reliance on regular flat health affixes.

- Attunement now grants 2 mana (from 4 elemental protection). Similarly to Vitality we didn’t want there to be a point beyond which the defensive aspect of the attribute is no longer relevant due to a cap. The new mana bonus should help ensure attunement users get enough mana to cast their spells and magic-themed melee attacks without running out of mana too quickly.

 

## What happens to existing items?

Where possible affixes have been changed to ones that provide a similar purpose to old ones that have been removed. For example existing protection suffixes have been changed to resistance suffixes for the same damage type, but many other cases didn’t have such clear replacements. You may see a few strange affixes on items you found before the patch.

We recommend reviewing equipped gear to ensure it still suits your character - or starting a new character to experience all the changes we’ve made to the early chapters of the game!

about 6 years
ago -
/u/EHG_Sarno
-
Direct link

External link →

about 6 years
ago -
Trasochi
-
Direct link

Sources of shred on skill trees are mostly still there. The full patch notes will include details of where that’s not the case or where there have been other changes to those nodes.

Shock functions like lightning resistance shred, except that it also increases enemies’ chance to be stunned by 10%. Because it no longer scales with enemy health like it used to, increased shock effectiveness is no longer necessary for shock to scale into end game and most sources of it have been removed or greatly reduced in value.

← More from Last Epoch

Get Discord notifications

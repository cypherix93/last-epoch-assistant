SOURCE: https://forum.lastepoch.com/t/increased-damage-vs-more-damage-vs-added-damage-an-analysis/48252
FETCHED: 2026-10-08
TITLE: Increased Damage vs More Damage vs Added Damage | An Analysis
NOTE: Official forum / dev-tracker post; increased vs more vs added analysis

---


### Post #1 by queermathsgirl (2022-03-21)

## Introduction

Hey everyone! It’s that weird girl who’s good at maths but bad at Last Epoch, here with another analysis (that Llama will probably tear apart again, so go check out their comment).

This time we’re looking at Increased Damage vs More Damage vs Added Damage.

This analysis is aimed at new players who don’t know what I’m talking about, players who’ve spent the whole time thinking they’re the same thing, and curious veterans ready to sink their claws in and tear me to shreds. We will cover:

- What is the difference?

- Which is better?

1. What's the difference?

At a first glance these appear similar. In fact, if you only have either 15% Increased Damage or 15% More Damage, they will function exactly the same. It’s only when we stack multiple of each or have a combination of the two that we see the difference become apparent.

# Increased Damage

Increased Damage is a multiplicative damage modifier with summation, modifying output damage according to:

DamageFinal = Damage * ( 1 + Σ IncreasedDamage)

Σ is the mathematical notation for “Sum of”. So this means “Sum of all sources of Increased Damage”. It’s worth noting we also convert these percentage values to decimals.

For example, if we have a source of +15% Increased Damage and another source of +12% Increased Damage, then we have

DamageFinal = Damage * ( 1 + 0.15 + 0.12) = Damage * 1.27

One downside we can see with this is while 100% Increased Damage doubles your damage early on

DF = D * ( 1 + 1) = D * 2,

for each source of Increased Damage we have, this effect becomes more and more diminished. Such as below, where increasing our damage by 100% when we already have 372% Increased Damage from other sources only modifies it by 21.2%.

DF = D * ( 3.72 + 1) = D * 4.72

# More Damage

More Damage is a multiplicative damage modifier with multiplication, modifying output damage according to:

DamageFinal = Damage * Π( 1 + MoreDamage)

Π is the mathematical notation for “Product of”. It works in the same way as Σ except we multiply the numbers instead of add them.

For example, if we have a source of +15% More Damage and another source of +12% More Damage, then we have

DamageFinal = Damage * ( 1 + 0.15) * ( 1 + 0.12) = Damage * 1.288

This is where the difference between Increased and More becomes clear. Due to its summation nature, Increased Damaged diminishes in value the more you have, whereas More Damage has a consistent value due to its multiplication nature.

Using the previous example:

DF = D * ( 1 + 1) = D * 2,

Now if we modify our damage by 100% More Damage when we already have 372% More Damage from other sources (let’s assume only 1 source for simplicity) modifies it to

DF = D * ( 1 + 3.72) * ( 1 + 1) = D * 9.44

If we had multiple sources contributing to +372%, then this number would be greater than 9.44.

So 100% More Damage will always double our damage.

Note: it’s for this same reason that a “3.75% p/a paid monthly” savings scheme yields more money than a “3.90% p/a paid every 3 months” savings scheme, but due to a lack of mathematical literacy in most people they go for 3.90% because it has the bigger number, something which banks and businesses take advantage of you for.

#LifeAdviceWithMorgy

# Added Damage

Added Damage is a form of additive damage, which adds a flat amount to to the base damage. It follows according to:

DamageFinal = Damage + Σ AddedDamage

For example, if we have a weapon giving us +10 Added Damage and +5 Added Damage, then we have

DamageFinal = Damage + 10 + 5

It doesn’t seem as good as the the other alternatives. For instance, if we dealt 20 damage, this would only give us 35, whereas 100% Increased Damage or 100% More Damage (both very easy to get) gives us 40.

# How they work together

Together, they will all follow:

DamageFinal = ( Base Damage + Σ AddedDamage) * ( 1 + Σ IncreasedDamage) * Π( 1 + MoreDamage)

2. Which is better?

Clearly we can see that More > Increased due to how they scale when we have multiple of each source, but where does Added Damage come in?

I think Added Damage is actually the best of all three, simply due to it being a large flat amount instead of a percentage or decimal. I’ll argue this point with the follow cases:

### Case 1 - Early Game

Let’s say you’re playing a Primalist, you hit level 6 and decide to run Swipe. This has a base damage of 2. Naturally, since Primalist starts with starts with 2 Strength it has the damage:

2 * ( 1 + 0.04 + 0.04) = 2.16

Or if we take 4 points in Primal Strength:

2 * ( 1 + 4 * 0.04) = 2.32

At this point in the game, since our damage is so pathetically low, sources of Increased Damage or More Damage barely modify our damage. 16% Increased Damage literally modified it to where it’s basically the same to a rounding error.

So how come when you play Primalist the numbers don’t seem that low? That’s because you start with the Hatchet equipped by default, giving +11 Added Damage (specifically Melee Physical). Thus:

(2 + 11) * ( 1 + 4 * 0.04) = 13 * 1.16 = 15.08

Our damage went up 6.5 times just from Added Damage alone.

At level 6 we can also use the Pike, a 2H Spear with +26 Added Damage giving Swipe:

28 * 1.16 = 32.48

Not only do we get excellent value out of Added Damage early, it also increases the value of our Increased and More Damage modifiers.

In fact, it’s for this reason you’ll see speedrunners like Terek use 2H weapons early, or if they stick to a 1H for a particular reason then they tend to switch to a 2H for bosses. It’s also why you’ll see ailment builds used early in the runs too as they are an extra source of flat damage working alongside your own.

### Case 2 - Endgame

Let’s say you’re playing a Cold HoA Marksman with an Obsidian Bow (+45 Bow Damage) and deal about 2,000 damage after all your Increased and More modifiers.

If you switch this out for a Reign of Winter (+60 Bow Damage, +50 Cold Damage to Attacks, +50 Cold Damage to Spells), suddenly your Cold HoA now deals 4,888 (or 7,111 if the Cold Spells part also applies idk am bad at LE).

To get that result, you’d need to find an additional 144% More Damage (getting very hard at this stage of the game) or hundreds to thousands of % Increased Damage.

Conclusion

And so, I’d say the order of priority is:

- Added Damage

- More Damage

- Increased Damage

Naturally, Increased Damage is very common to find so this’ll be your bread and butter. If the other modifiers were as common as this, there’d be no reason to take more than a few hundred percent. But given the opportunity to switch this out for More Damage or Added Damage, you should very much do so.

That said, late game the differences between 1 & 2 become smaller due to impact and limited availability, and the differences between 2 & 3 become far greater due to it’s poor scaling.

Hopefully this helped those of you confused with Increased vs More vs Added have a better understanding of the differences between them and which you should choose, given the option.

Note to EHG: the way you write mathematics in the Game Guide (G) is unconventional, unintuitive and difficult to read and interpret properly. Could you please fix this? Thx :3

### Post #2 by Shrukn (2022-03-21)

Its because they decided to base their games foundation off anothers: PoE

So if you dont play PoE this wont make sense but if you played PoE since 2013 you are fine

Diablo 3’s crit formula is better as its more simple

‘recently’ stolen directly from PoE with no explanation what ‘recently’ is. next up ‘Nearby’ but I cant remember if LE uses the atrocious ‘nearby’

The TLDR is more is a multiplier and increased is additive. ‘More’ multis only apply generally on skills and not gear so they dont compete anyway

basically if a skill doesnt have a ‘more damage’ component its most likely not a great skill. on the flipside if the skill has 2x ‘more damage’ skill nodes you have to take, its also most likely bad

### Post #4 by Deimos169 (2022-03-21)

Thanks for posting this, after all my hours in LE this is pretty much what I assumed, it’s just nice to get clarification.

### Post #5 by Llama8 (2022-03-21)

Excellent, the only thing I’d add is that any sources of added damage are multiplied by the skill’s added damage effectiveness stat (which is 100% by default if its not mentioned).

While Swipe does have a 100% added damage effectiveness so your figures above are correct, Upheaval has 120% so every 1 point of added damage is viewed by Upheaval as 1.2. Hail of Arrows has a 300% added damage effectiveness per second, so with no other modifiers (which would be practically impossible due to HoA’s position on the tree), Reign of Winter’s +50 cold damage and +60 physical damage would be added as 150 cold and 180 physical damage per second to HoA.

Slower skills and more expensive skills are more likely to have a larger added damage effectiveness (Meteor has 800% added damage effectiveness) faster or AoE skills are more likely to have smaller added damage effectiveness (Flurry has 60% added damage effectiveness).

An addendum to this I’d that while some faster hitting skills will have a multiplicatively lower chance to apply ailments (Warpath and Flurry have as 40% less chance), slower/etc skills don’t have a higher chance to apply ailments.

### Post #7 by Llama8 (2022-03-21)

Yeah, not sure where that “added damage scaling” of 60% is coming from. I don’t think it’s used to convert the 350% per second into a tick rate, but it could.

And no, the added cold spell damage from the bow isn’t added to HoA since it doesn’t have the spell tag. The only thing a Rogue with that bow equipped has with the spell tag is the bow proc.

Edit: Yay for Tunk knowing some arcane ****!

### Post #8 by vapourfire (2022-03-21)

even though this is something that all players will eventually learn and find snippets of if they are willing to sift through the forums, its nice to have these kinds of things explained in one place in the manner you do… (I liked learning about the mathematical notation - never was really interested in math at school, vapourfire = jock who likes computers/gaming).

A suggestion if you liked doing things like this… @AndrewTilley maintains the wonderful community game guide, maybe you could do a few more posts like this on the various mathematically challenging topics and link them there as “extra info” for those needing more? Perhaps the unofficial LEScribe might even incorporate your info?

anyway… thanks for taking the time to put these together…

### Post #9 by Tunk (2022-03-21)

DoT skills only have added damage scaling and interval (tick rate), there is no “effectiveness per second” value.

So effectiveness per second used in game seems to be just addedDamageScaling * tickRate.

Dunno why effectiveness/s is used for dots instead of using added damage scaling directly.

### Post #10 by Llama8 (2022-03-21)

So if HoA’s added damage scaling is 60% & the game states that it’s added damage effectiveness is 350% the tick rate is therefore ~5.8 times per second.

### Post #11 by Tunk (2022-03-21)

HoA has 0.2 interval (5 ticks/s) and 60% added damage scaling = 300% effectiveness per second.

This is also shown in tooltip. (keep in mind though that tooltips are just text and not showing calculated value, they are not always correct).

### Post #12 by daCe (2022-04-12)

Greetings, i have a question about damage modifier.

When you have an ability that profit from 2 damage sources as example physical and void, is it better to craft a weapon that has 2 flat damage prefixes or take the one that has the highest base and get crit/attackspeed as second prefix?

### Post #13 by GoldenExperience (2022-04-12)

Imo If you have 2 or more mixed damage types, it is usually better to focus on crit and armor shred(since armor affects all damage).

But it depends on build tho for skills with high dmg effectiveness(300/400%), if you can manage crit and attack speed elsewhere the flat dmg is better but this is rare I think.

### Post #14 by Heavy (2022-04-12)

It depends on what you want to scale.

If you already have 200%inc. Void dmg, but no %inc. Phy dmg, flat void dmg will be better.

It’s important to understand, that a skill can deal multiple different dmg types and damage modifiers that increase certain dmg types such as physical dmg will only increase the skills damage partially.

You can even give skills flat added dmg of other damage types they don’t inherently do.

If you have a skill that deals multiple dmg types and you want to scale them all you want non-type scaling, such as %Inc. melee dmg or %Inc. Spell dmg.

Now back to your specific question.:

It heavily depends on the skill. Generally speaking I would say that one flat added melee dmg type + attack speed, melee crit or crit multi will be better.

### Post #15 by daCe (2022-04-12)

ok ty

### Post #16 by system (2023-04-12)

This topic was automatically closed 365 days after the last reply. New replies are no longer allowed.

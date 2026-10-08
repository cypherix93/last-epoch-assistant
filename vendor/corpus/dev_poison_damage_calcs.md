SOURCE: https://forum.lastepoch.com/t/help-me-understand-poison-damage-and-damage-calcs-in-general/70748
FETCHED: 2026-10-08
TITLE: Help me understand poison damage and damage calcs in general
NOTE: Official forum / dev-tracker post; poison damage calcs

---


### Post #1 by GiantOctopodes (2024-04-15)

As per the title. What I’m trying to figure out is what multiplies with each other vs adding with each other, and how to properly calculate the resultant damage, so I can figure out what gear will have more or less of an impact on my overall damage. Let’s use Rain of Arrows from the character in this link (a partial build):

Here’s what I’ve got, please tell me where I’m right, wrong, or otherwise. in terms of the poison ailment applied:

Base poison damage is 28 over 3 seconds or 9.33 damage per tick (or second). Each stack may have modifiers that affect the damage, duration, or both, and each stack is applied and tracked separately per opponent. If you have 100 stacks, those may not all be the same, and each stack will have its own behavior.

The damage is multiplied by the combination of all increased damage modifiers added together. So you can take the increased damage per movement speed, increased damage with concentration, the bow mana cost converted to increased damage, increased damage over time, increased poison damage, increased damage while consuming flow, and any other “increased” modifiers to make a total sum. In the case of a Hail of Arrows used as the 4th skill on this character after picking up a black arrow, we’d be looking at a total of 120+70+10+150+200+90+20+… for 700+% increased damage. Dex being one of the increased damage sources, and as long as the skill which is applying the ailment is Dex based, providing increased damage at 4% per point.

Next, you multiply by the sources of “more” damage, each separately. If it says it does not apply to ailment damage, it does not (such as nowhere to hide in the hail of arrows tree). Otherwise, it does (such as focus from that tree). Given that we have 700+% increased damage already, a 20% “more damage” is the equivalent of 140+% “increased damage” and a 50% “more damage” is the equivalent to 350%+ “increased damage”.

Next, we apply the enemy’s resistances. We outright subtract an amount equal to our penetration. We also apply any poison resistance shred stacks (up to 10) for -5% each to non-boss resistances, or -2% each to bosses. We also apply any poison stacks (up to 30) to do the same thing, for a max of 40 stacks applying -80% to bosses resistances if both are maxed. In our case we have 50% poison penetration from the black arrow, 20% from poison tipped arrows, and assuming max stacks of mastery 57% from salt the wound, so we subtract 127% plus let’s say 30 stacks of poison and 5 stacks of poison resist shred (from smoke cloud) for another -70%, so let’s call it -200% resistance giving us a likely damage multiplier between 2 and 3 for our damage. Given that resistances could make our multiplier as low as .25 with max enemy resists, that’s a huge damage increase, though the impact does fall off past the first 100 points of penetration / resistance shred.

Finally, we multiply by our stack count to determine our DPS. If I’m using Hail of Arrows, given that I’m not applying a “hit”, I do count poison chance (including converted bleed chance and bleed on hit chance), but not poison on hit chance. That means I’ve got 250 (venom arrows) + 200 (tear flesh) + 100ish (sanguine hoard) + 150 (toxic quiver), or about 700% chance to poison, meaning I apply 7 stacks per second.

So given all that, the ailment damage from the 28 stacks of poison Hail of Arrows applies if kept up continuously deals around 5,600 total damage per second.

So tell me, what do I have right, what do I have wrong, and what am I missing, if anything? The hail of arrows DPS itself would be separately calculated, and all of that would be a bonus vs the 200+ stacks of poison applied via Multishot, and even when factoring in everything I know the DPS won’t touch something like the Wraithlord build. These are things I believe I know as well, just looking to make sure I understand how to do the calcs properly.

Thanks!

### Post #2 by Grizzly2612 (2024-04-15)

for starters you are missing defensive stats, also boots, body armour, belt etc.

### Post #3 by Llama8 (2024-04-16)

Yeah, if it explicitly states hit damage then it won’t apply to ailments or if it states a damage element (fire, void, etc) or type (melee, bow, etc) that doesn’t match the tags the ailment has then it won’t apply. But if the ailment has a type tag (eg, spell) and the node says it affects that type then it would.

Mobs very rarely have resists though, unless the specific mob says it does (eg, some scorpions say they resist fire), or you’ve picked a mono modifier that gives everything resists.

No, that’s fairly comprehensive.

### Post #4 by system (2025-04-16)

This topic was automatically closed 365 days after the last reply. New replies are no longer allowed.

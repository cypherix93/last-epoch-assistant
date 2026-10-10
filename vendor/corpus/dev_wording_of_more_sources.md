SOURCE: https://forum.lastepoch.com/t/about-the-wording-of-mult-more-sources-of-damage/21499
FETCHED: 2026-10-08
TITLE: About the wording of mult. "more" sources of damage
NOTE: Official forum / dev-tracker post; wording of more sources

---


### Post #1 by Ofasia (2020-06-18)

I understand the general damage equation, but sort of actually leveling out the skills and testing it for myself, I’m stuck trying to understanding something.

Specifically, the way multiplicative AKA “more” sources of damage are worded. Not added and not increased…

Some examples of what I mean:

Barbed Blades +100% Hit Damage to itself. Worded as “deal more damage”

Shock and Steel +120% Hit Damage to itself. Worded as “deal more damage (multiplicative with other modifiers)”

Faint Strike +45% Hit Damage to itself. Worded as “deal more damage”

Executioner +60% More Damage to Itself (Hit Damage?). Worded as “deal more damage (multiplicative with other modifiers)”

Erasure of the Living +50% Hit Damage to itself. Worded as “deal more damage”

Merciful +75% Hit Damage to itself. Worded as “deal more damage (multiplicative with other modifiers)”

I’m I overthinking this? Aren’t those all their own multiplicative modifiers no matter the wording? If not could someone explain to me the difference?

Edit: Tested and solved below, “more” in skill stack, “more(mult)” don’t.

### Post #2 by Llama8 (2020-06-18)

You possibly are overthinking it.

Barbed is reflected damage which is not a very common stat, so there’s not going to be many sources of increased damage therefore I suspect it probably doesn’t matter whether it’s a “more” or “increased”. Unless multiple barbed idols would be multiplicative to each other.

Damage modifiers within skill trees are treated as a separate group for damage calculations so you could treat them as “more” modifiers as distinct from the “increased” that you generally get on passives or gear. So the damage from Faint Strike/Erasure of the Living would be multiplicative to any increased damage affixes/passives. I think from memory the damage modifiers on skill nodes used to say increased, but they would need to be put in their own separate bucket to calculate skill damage, so the devs changing them to “more” does make sense.

### Post #3 by Ofasia (2020-06-18)

I meant Barbed Blades another Lunge modifier. I am treating them as more. I’ve ruled out increases and added.

This is how I understand your answer.

Within skill nodes, instances of “more” without the qualifier are actually added together.

Which leave “more (multiplicative)” as acting like regular “more” multipliers.

I’m curious to know if that’s the case.

### Post #4 by Ofasia (2020-06-19)

While this is probably nothing new to theorycrafters the particular confusion I had as a new player was shared by a number of other players here, in-game and in the discord. I couldn’t get a satisfactory answer and I ended testing it myself. So yes, in short:

Skill nodes of the “more” type are summed up together in their own category then multiply damage.

Skill nodes that are of the “more (multiplicative)” type act like normal “more”-type and each one is a multiplier.

As an example in the linked test, where base damage is 30 and I’m using Warbringer (+100%), Reckless Combatant 3 (+45%), Whirling Blade 2 (+20%) and Draining Assault 2 (+30%) we get:

30 * 2.45 * 1.20 * 1.30 for 114.66

Again, nothing too interesting, but not very clear to the players I spoke to.

### Post #5 by LukkaReborn (2020-06-19)

The one thing I don’t like so far about skills and their tooltips is:

You have NO EFFIN CLUE what the base dmg of a skill is …like at all…there’s NO WHERE that says what the base dmg of S.T. is or the base dmg of Warpath…I hope this gets changed

### Post #6 by Llama8 (2020-06-19)

Ah. Yeah, I’ve not checked all in-skill modifiers, but I think they just changed the wording on them to reflect how the game treats them (while still dumping them in one bucket). I think they used to all say “increased”, but the game treated them as “more”. Instances of “more” outside of skills should be applied separately (as PoE treats them).

### Post #7 by Llama8 (2020-06-19)

It’s on their list of things to do, and yes, it’s frustraiting for those of us with a more numerical persuasion.

### Post #8 by system (2020-08-18)

This topic was automatically closed 60 days after the last reply. New replies are no longer allowed.

SOURCE: https://forum.lastepoch.com/t/unintuitive-mechanics-guide-for-le
FETCHED: 2026-10-08
TITLE: Unintuitive Mechanics Guide for LE
NOTE: Official forum / dev-tracker post; unintuitive mechanics guide

---


### Post #1 by Neyhoum (2019-04-30)

So there’s a few more hours to beta, in the meantime here’s a little mechanics guide for some of the less obvious systems in Last Epoch :

First up, Protections (resistances in other game) :

-

This includes armor, which actually means “physical protection”, acting the same way as other protections do.

-

They are relative to your total HP pool. Each point of protection will act as one point of hp when taking damage, meaning the mitigation percentage formula is damage resisted = protection_value / (HPpool+protection_value).

-

Example : if you have 1000 life and 500 armor, you will take (500/1000+500) = 33% reduced damage. Easy breakpoints : if your protection score is HALF your HP Pool’s, you’ll resist 33%. If it is EQUAL to your HP pool, you’ll resist 50%. If it is double your HP pool, you’ll resist 66%

-

The term “HP pool” means hp+ward. (ward=energy shield in other games). So any build that stacks a lot of ward will have to deal with its protection percentages falling lower and lower (that’s the price of having a big HP pool in last epoch)

__

DoTs (damage over time) mechanics :

-

Main dots (bleed poison ignite) stack infintely, although each stack has a limited duration, but some specific dots linked to skills (such as Time Rot, Plague or Spreading Flames) don’t, unless specificied otherwise.

-

They have their own base damage : 20 for poison, 40 for ignite, 48 for bleed.

-

They benefit from penetration and can leech (provided the leech source does not state “leech on hit”, as dot’s arent considered hits), but they cannot crit.

-

Poison seems weak but each poison stack increases poison damage taken by 10%

-

They scale off their relative damage type, damage over time, and off the stat (strength dexterity intelligence attunement) linked to the skill used to apply the dot. Example : Warpath scales with strength, +4% damage per point. Your strength will also scale (+4%/point) all DoTs caused by warpath.

__

Block, Dodge and Ward :

-

Block does not negate damage. When it procs, it adds your “block protection” to your protection score, thus lowering the damage recieved

-

Blocking a physical hit adds both your “block protection” and “block armor” to your physical protection score (= Armor)

-

Dodge negates damage. DoTs can’t be dodged (nor blocked). Dodge scales down with area level (which in high levels means character level), meaning dodge chance% lowers quite a bit at higher levels

-

Ward is an extra hp pool that constantly degenerates at a rate of 20% of it’s current value per second. The “ward retention” stat will slow down this value. Example : 100% ward retention = 10%/sec lost and 300% ward retention = 5%/sec lost.

__

Damage calculations :

-

Formula is : Damage = base damage * (1 + sum of increases from tree) * (1 + sum of increases from stats) * (1 + more modifier 1) * (1 + more modifier 2) * (1 + more modifier 3)…

-

“increases from tree” refer to the active skill tree used. “increases from stats” refers to the sum of inreases from the passive skill tree, gear and stats (also called “global increases” in some cases)

-

If you’re familiar with path of exile’s formulae as many of us are, treat it as the same except you take the sum of all %increases from inside a skill tree and treat it as a separate %more multiplier

__

Base and Added damage :

-

Base damage refers to a skill’s innate damage and any flat damage that is picked inside it’s skill tree

-

Added damage refers to all the rest, which is mostly damage recieved from items and the passive skill tree.

-

This means for attackers, your weapon’s damage, (from both implicit and explicit modifiers) is considered “added damage” (and that’s the unintuitive part : your weapon is NOT your “base damage”, although for many skills it’s 99% of your damage source ^^')

That’s it for now, will add more if needed, feel free to comment/criticise and/or ask for more ! And have fun in a few hours everyone

EDIT : Thanks for the kind words, and a big shoutout to Trasochi and Mike Weicker for all their kind replies over the months on the discord’s #ask-the-devs

EDIT 2 : (Shameless plug : I’ve just finished writing a “Starter and character-building guide” for anyone interested [Guide] Starting tps + Basic character-building tips)

### Post #2 by thomzon (2019-04-30)

That’s super good info, thanks a lot !

### Post #3 by Trasochi (2019-05-02)

Thanks for writing this all up. As far as I can tell this is all accurate and this is important information for people to know for build crafting.

### Post #4 by username (2019-05-02)

Thank you for the write up, hugely helpful!

### Post #5 by Kotli (2019-05-02)

BTW you missing something for the DOTs you can apply multiple DOTs at once IE 200% chance to poison = 2 poison DOTs applied.

I assume poison stack formula is (X20)+(X10%) so 2 stacks of poison be (2*20)+20%=48 damage right?

Then based on my math you need 9 stacks of poison to equal burn DOT and 14 for bleeding.

### Post #6 by ReimerhArts (2019-05-02)

This is so good for new players. Well done, mate

### Post #7 by A_S00 (2019-05-02)

What exactly constitutes the “Base Fire Damage” used for Flame Reave’s Rolling Thunder node?

- The fire damage from the Rending Ire definitely counts, as it’s specifically called out as “base fire damage”

- Does the 8 damage that’s built into the base skill count? It’s described as “additional damage,” but the OP makes it sound like any flat added damage from inside the skill counts as base damage.

- Does the “more melee fire damage” from Flame Blade get factored into the base fire damage? Or is Rolling Thunder calculated before any more multipliers, even those inside the skill?

I thought I understood this post when I read it but now, trying to apply it to an actual in-game use case, I’m confused again.

### Post #8 by Neyhoum (2019-05-02)

Thanks everyone for the kind words

Let’s add (ill edit in the main post) that my two main sources were Trasochi And Mike Weicker’s comments in the #ask-the-devs discord channel

@A_S00 , it’s indeed the 8 damage + rending ire’s 1-5. The more melee fire is calculated later on indeed so it doesnt influence this

### Post #9 by fknflo (2019-05-03)

Great guide, thank you!

### Post #10 by Moxjet200 (2019-05-03)

Great writeup @Neyhoum - we will be implementing an in-game mechanics guide soon and the catalyst was your post. Much appreciated from the entire team!

### Post #11 by sephyyx (2019-05-04)

Thanks for taking your time writing & posting this! helpful.

### Post #12 by Neyhoum (2019-05-04)

Thanks @Mox, once again most of the info came directly from the team trough discord

(Shameless plug : I’ve just finished writing a “Starter and character-building guide” for Last Epoch and would love some input before posting an enchanced version in the forums here. It can be found https://www.reddit.com/r/LastEpoch/comments/bkk17r/last_epoch_starter_guide_and_characterbuilding/ and once I get some insightful input/critic i’ll post it here, probably by sunday evening or before)

### Post #13 by system (2019-07-03)

This topic was automatically closed 60 days after the last reply. New replies are no longer allowed.

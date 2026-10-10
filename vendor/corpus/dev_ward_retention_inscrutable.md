SOURCE: https://forum.lastepoch.com/t/ward-retention-is-inscrutable/49225
FETCHED: 2026-10-08
TITLE: Ward Retention Is Inscrutable
NOTE: Official forum / dev-tracker post; ward retention inscrutable

---


### Post #1 by SorenAltigo (2022-07-13)

The way that the ward retention stat is presented and tooltipped is bizarre and difficult to understand. This isn’t a complaint about how the stat, or ward itself, works–it’s just about how the game displays it. First, two minor quibbles about the tooltip itself.

One: ward retention is presented in-game as a percentage, but the displayed formula clearly uses it as a decimal. This is kind of irrelevant for reasons I’ll get into, but I wanted to state it for the sake of completeness.

Two: This tooltip lists the amount of ward that decays, which includes the amount of ward you currently have, while what’s more useful to the player is the percentage rate at which it decays.

Now, regarding the aforementioned tooltip: I’m hovering over the stat to see what the stat I’m seeing means, not to do a math problem. I get it: ward follows a pattern of exponential decay, which is neat, but the presented formula isn’t something I can easily process in my head, nor does it show me any usable version of my actual stat. Elemental resistances in Diablo 3 and armor/magic resist in League of Legends use formulas somewhat similar to the ward decay formula to calculate their damage reduction percentages, but the main UI for these stats shows the raw value, while the tooltip shows the interpreted percentage. The actual formulas aren’t shown to the player in-game; anyone who really cares can find them online.

On a related but slightly different note: Ward retention is always given as a percentage, but what this is a percentage of is unclear at best. I’ve done a little number-crunching, and it’s neither the half-life nor the decay constant (and if it were, I’d still have strong feelings about being presented with a stat that requires logarithms to interpret.) Why is this a percentage? Why not just a flat value, which is then interpreted by the game?

Other UI elements on the same character panel actually handle a similar problem to all of this extremely well! Dodge and block ratings are presented in their raw values and the “translated” percentages–why not do the same for ward retention?

Taking all of this into account, I think the tooltip on ward retention would be much easier to understand as something like:

(Note: I calculated these by plugging numbers into the formula as I interpreted it from the in-game tooltip. If these numbers are wrong, blame the existing tooltip )

Ward Retention

50 → 32%

Hover tooltip reads: This is the percentage of your current ward that decays every second. Higher ward retention reduces this amount.

If you prefer better stats to always be represented by higher numbers, try something like:

Ward Retention

50 → 68%

Hover tooltip reads: Ward decays over time. This is the percentage of your current ward that is retained every second.

In summary: Please find a way to clarify the UI display and tooltip on ward retention so it gives a value that’s easily interpreted.

### Post #2 by vapourfire (2022-07-13)

Hey, Welcome to the forums…

First things first - tooltips & character sheet info right now is confirmed to be less than ideal… This is true for almost everything to some degree… sometimes its just a text or grammar mistake, other times the actual calculations are wrong, incomplete or simply missing from the character sheet entirely…

Thankfully the devs have confirmed that they want to update all of this… Some older dev blog posts even show potential mock ups and what they have planned and some of the challenges they face with things like showing correct values, esp. for dynamic situational things like DPS…

As for Ward itself… I’d agree some consistency in the explaination and presentation would help…

### Post #3 by system (2022-10-11)

This topic was automatically closed 90 days after the last reply. New replies are no longer allowed.

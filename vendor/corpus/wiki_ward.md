SOURCE: https://lastepoch.fandom.com/wiki/Ward
FETCHED: 2026-10-08
TITLE: Ward - Last Epoch Wiki (Fandom)
NOTE: Fandom wiki page 'Ward'; wiki may lag current patch (1.5.x) - verify numbers.

---

| | This article is a stub. You can help Last Epoch Wiki by expanding it. |

This article is a stub. You can help Last Epoch Wiki by expanding it.

Ward is one of the Character Stats which is a temporary magical shield that protects your health pool, as in Combat Calculations it takes damage before health. There is no maximum to how much ward you can have. Ward also disappears over time. It disappears faster the more you have.

## Gaining Ward and Ward Decay[]

By default a player has no Ward. There are several Skills and effects which give or generate Ward for a character. Ward Retention slows the rate of decay.

Any ward a player has will decay according to the decay formula:

W
a
r
d
D
e
c
a
y
F
a
c
t
o
r
=

0.4
∗
C
u
r
r
e
n
t
W
a
r
d

1
+
0.5
∗
W
a
r
d
R
e
t
e
n
t
i
o
n

{\displaystyle WardDecayFactor = \frac{0.4 * Current Ward}{1 + 0.5 * Ward Retention}}

In effect, this means that 200% Ward Retention causes Ward to last twice as long, and 400% retention three times as long, and so on. With 0 Ward Retention, half of the character's current Ward will be lost every 1.73 seconds

### Ward Regeneration[]

Some items provide Ward regeneration, which increases the Ward level passively. In effect, this raises the resting level of Ward from 0 up to some higher value, with Ward always moving towards the resting value.

The resting value of Ward can be calculated by a simple division:

R
e
s
t
i
n
g
L
e
v
e
l
=

W
a
r
d
R
e
g
e
n
e
r
a
t
i
o
n

W
a
r
d
D
e
c
a
y
F
a
c
t
o
r

{\displaystyle RestingLevel = \frac{WardRegeneration}{WardDecayFactor}}

.

In terms of constants only, this value is

R
e
s
t
i
n
g
L
e
v
e
l
=

1
+
0.5
∗
W
a
r
d
R
e
t
e
n
t
i
o
n

0.4

W
a
r
d
R
e
g
e
n
e
r
a
t
i
o
n

{\displaystyle RestingLevel = \frac{1 + 0.5 * Ward Retention}{0.4} WardRegeneration}

.

Items that add Ward Decay Threshold are merely additive with the resting level.

R
e
s
t
i
n
g
L
e
v
e
l
=

1
+
0.5
∗
W
a
r
d
R
e
t
e
n
t
i
o
n

0.4

W
a
r
d
R
e
g
e
n
e
r
a
t
i
o
n
+
W
a
r
d
D
e
c
a
y
T
h
r
e
s
h
o
l
d

{\displaystyle RestingLevel = \frac{1 + 0.5 * Ward Retention}{0.4} WardRegeneration + WardDecayThreshold}

.

So with no Ward Retention, every 2 points of Ward regeneration increase the resting Ward level by 5. When Ward is below this resting level, it moves exponentially toward it, just like how it decays from above (Note that unlike high ward, low ward can never be below 0, and thus the regeneration can never be above the total of the Ward regeneration stat).

For example, a character with 10 Ward regeneration per second, and a Ward Retention of 40% will have a Ward decay factor of 1/3, and a resting ward level of 30. If that character ends up with 60 Ward, that ward will begin decaying at a rate of 10 per second (Losing 20 from decay, but gaining 10 from regeneration). If the same character has 0 Ward, then it will begin regenerating at a rate of 10 per second (Since they have no decay, but gain 10 from regeneration). Likewise, if the character then removed their source of regeneration but kept the same Ward Retention, their 30 ward would decay towards 0, starting at a rate of 10 Ward per second.

## UI[]

The current amount of ward for the active player is displayed in a semi-circle next to the Health Orb in the lower left of the screen. The amount of fill displayed in the semi-circle represents the amount of ward you have, the fill level is relative to your maximum health and becomes more compressed with larger amounts of Ward. Additionally the numeric amount is displayed above the health orb.

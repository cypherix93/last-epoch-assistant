SOURCE: https://lastepoch.fandom.com/wiki/Combat_Calculations
FETCHED: 2026-10-08
TITLE: Combat Calculations - Last Epoch Wiki (Fandom)
NOTE: Fandom wiki page 'Combat Calculations'; wiki may lag current patch (1.5.x) - verify numbers.

---

Combat Calculations are used to determine the damage effects of Statuses and Skills while fighting.

## Contents

- 1 Skill Use

- 2 Damage conversion

- 3 Combat Order

- 3.1 Hits

- 3.2 Damage From Other Sources

- 4 Offensive Calculations

- 4.1 Total Base Damage

- 4.2 Damage Modifiers

- 5 Defensive Calculations

- 6 Damage Taken Calculations

## Skill Use[]

Spell Skills, Melee Attack Skills, and Throwing Attack Skills are affected by Cast Speed, Melee Attack Speed, and Throwing Attack Speed respectively which increase the rate at which these abilities can be used, both by reducing the duration of their animations and by reducing the time between successive uses.

A
t
t
a
c
k

/

C
a
s
t
 
R
a
t
e
=

(
1
+
A
t
t
a
c
k

/

C
a
s
t
 
S
p
e
e
d
)

B
a
s
e
 
A
n
i
m
a
t
i
o
n
 
D
u
r
a
t
i
o
n

{\displaystyle Attack/Cast\ Rate = \frac{(1+Attack/Cast\ Speed)} {Base\ Animation\ Duration}

}

Targeted skills from Non-Player Characters affected by Blind have a chance to fire in a random direction away from their target.

## Damage conversion[]

Damage conversion only applies to base damage. For example you have the following attributes

- 100% increased physical damage (passive tree)

- 50% increased fire damage (passive tree)

- +10 base physical damage (skill modifier)

- All damage is converted to fire damage (skill modifier)

A simplified calculation for a skill that does 40 physical damage would be:

(
40
+
10
)
∗
(
1
+
0.50
)
=
75

{\displaystyle (40+10) * (1+ 0.50) = 75}

fire damage

## Combat Order[]

### Hits[]

Hits can only be made by skills, Damage Over Time cannot be a hit. Once a hostile skill Area of Effect lands in a Characters hit box the game goes through the following calculations in order to determine if and how much damage a character receives:

- Dodge chance is rolled to determine if the hit lands. If the hit is dodged no further calculations are made. If the dodge is unsuccessful, the rest of the calculations occur. Any "On Hit" effects are triggered.

- #Offensive Calculations are used to determine the types and amount of damage dealt.

- #Defensive Calculations are used to determine how much damage is mitigated, and thus the damage left over is taken.

- #Damage Taken Calculations will deal damage to characters and determines if they are killed, resulting in 'on kill' and 'on death' effects.

### Damage From Other Sources[]

Damage can be given from sources other than a hit, usually from Statuses or Damage over Time Skills.

- #Offensive Calculations are used excluding Critical Strike Chance

- #Defensive Calculations are used excluding Block Chance, Chance to Recieve a Glancing Blow

- #Damage Taken Calculations used the same as for hits

## Offensive Calculations[]

Damage dealt from a hit, Damage Over Time effect, or other direct damage source is calculated separately for each of the Damage Types dealt.

D
a
m
a
g
e
D
e
a
l
t
=
D
a
m
a
g
e
T
y
p
e
A
+
…
+
D
a
m
a
g
e
T
y
p
e
N

{\displaystyle Damage Dealt = Damage Type A + \ldots + Damage Type N}

### Total Base Damage[]

Damage from each damage type is further modified first by changes to the base damage including:

- On a hit, the Critical Strike Chance or Melee Critical Strike Chance is rolled to determine if the hit is critical or not. If the hit is critical it increases the base damage by the Critical Strike Multiplier.

B
a
s
e
D
a
m
a
g
e
o
n
C
r
i
t
i
c
a
l
=
C
r
i
t
i
c
a
l
S
t
r
i
k
e
M
u
l
t
i
p
l
i
e
r
∗
B
a
s
e
D
a
m
a
g
e

{\displaystyle Base Damage on Critical = Critical Strike Multiplier * Base Damage}

- All other base damage multipliers for the given Damage types and Skill Type are multiplied by the base damage.

M
o
d
i
f
i
e
d
B
a
s
e
D
a
m
a
g
e
=
B
a
s
e
D
a
m
a
g
e
∗
B
a
s
e
D
a
m
a
g
e
M
u
l
t
i
p
l
i
e
r

{\displaystyle Modified Base Damage = Base Damage * Base Damage Multiplier}

- Added damage is multiplied by added damage effectiveness multipliers and added to the base damage

- Flat added damage on skill trees (e.g. 6 fire damage for sacrifice) is added base damage. It'll affect the damage split of any adaptive spell damage applied to sacrifice.

- For adaptive spell damage, if a skill has 7 base fire damage and 3 base lightning damage, then 70% of the adaptive spell damage will be fire damage and 30% of it will be lightning damage. )

M
o
d
i
f
i
e
d
B
a
s
e
D
a
m
a
g
e
=
B
a
s
e
D
a
m
a
g
e
+
(
A
d
d
e
d
D
a
m
a
g
e
∗
A
d
d
e
d
D
a
m
a
g
e
E
f
f
e
c
t
i
v
e
n
e
s
s
)

{\displaystyle Modified Base Damage = Base Damage + (Added Damage * Added Damage Effectiveness) }

The resulting Total Base Damage is given by the following calculation:

T
o
t
a
l
B
a
s
e
D
a
m
a
g
e
=
(
B
a
s
e
D
a
m
a
g
e
∗
B
a
s
e
D
a
m
a
g
e
M
u
l
t
i
p
l
i
e
r
∗
C
r
i
t
i
c
a
l
S
t
r
i
k
e
M
u
l
t
i
p
l
i
e
r
)
+
(
A
d
d
e
d
D
a
m
a
g
e
∗
A
d
d
e
d
D
a
m
a
g
e
E
f
f
e
c
t
i
v
e
n
e
s
s
)

{\displaystyle Total Base Damage = (Base Damage * Base Damage Multiplier * Critical Strike Multiplier) + (Added Damage * Added Damage Effectiveness) }

### Damage Modifiers[]

Modifiers which Increase or reduce a damage type are additive within two different categories:

- Global Increase/Reduction modifiers which include those gained from Passives, Equipment, Statuses, increases from stats (e.g. 4% damage per point of strength for swipe) and skill nodes which grant Global Increased Damage.

- Local Increase/Reduction modifiers which include only those gained from nodes on the specific skill that is dealing damage.

M
o
d
i
f
i
e
d
D
a
m
a
g
e
D
e
a
l
t
=
(
1
+
L
o
c
a
l
I
n
c
r
e
a
s
e
M
o
d
i
f
i
e
r
s
−
L
o
c
a
l
R
e
d
u
c
e
M
o
d
i
f
i
e
r
s
)
∗
(
1
+
G
l
o
b
a
l
I
n
c
r
e
a
s
e
M
o
d
i
f
i
e
r
s
−
G
l
o
b
a
l
R
e
d
u
c
e
M
o
d
i
f
i
e
r
s
)
∗
T
o
t
a
l
B
a
s
e
D
a
m
a
g
e

{\displaystyle ModifiedDamageDealt=(1+LocalIncreaseModifiers-LocalReduceModifiers)*(1+GlobalIncreaseModifiers-GlobalReduceModifiers)*TotalBaseDamage}

Modifiers which give more or less of a Damage Type are multiplicative. Each modifier is multiplied separately alongside the base damage.

M
o
d
i
f
i
e
d
D
a
m
a
g
e
D
e
a
l
t
=
M
o
r
e
M
o
d
i
f
i
e
r
∗
L
e
s
s
M
o
d
i
f
i
e
r
∗
B
a
s
e
D
a
m
a
g
e

{\displaystyle Modified Damage Dealt = More Modifier * Less Modifier * Base Damage}

Finally all damage is scaled randomly between -25% and +25%.

R
a
n
d
o
m
i
z
e
d
D
a
m
a
g
e
=
D
a
m
a
g
e
D
e
a
l
t
∗
(
1
−
[

−
.25

⋯

.25

]
)

{\displaystyle Randomized Damage = Damage Dealt * (1-[{-.25}\cdots{.25}])}

All together the modifiers result in the following calculation for each damage type:

T
o
t
a
l
D
a
m
a
g
e
D
e
a
l
t
=
(
1
−
[

−
.25

⋯

.25

]
)
∗
(
1
+
L
o
c
a
l
I
n
c
r
e
a
s
e
M
o
d
i
f
i
e
r
s
−
L
o
c
a
l
R
e
d
u
c
e
M
o
d
i
f
i
e
r
s
)
∗
(
1
+
G
l
o
b
a
l
I
n
c
r
e
a
s
e
M
o
d
i
f
i
e
r
s
−
G
l
o
b
a
l
R
e
d
u
c
e
M
o
d
i
f
i
e
r
s
)
∗
(
T
o
t
a
l
B
a
s
e
D
a
m
a
g
e
)
∗
(
M
o
r
e
M
o
d
i
f
i
e
r
)
∗
(
L
e
s
s
M
o
d
i
f
i
e
r
)

{\displaystyle TotalDamageDealt=(1-[{-.25}\cdots {.25}])*(1+LocalIncreaseModifiers-LocalReduceModifiers)*(1+GlobalIncreaseModifiers-GlobalReduceModifiers)*(TotalBaseDamage)*(MoreModifier)*(LessModifier)}

## Defensive Calculations[]

Once damage is received Block Chance is rolled to determine if Block Armor and Block Protection are added to the base Protections. On a successful block roll "On Block" effects are triggered.

For each type of damage received it is mitigated by the Protections for each damage type.

For unblocked damage:

D
a
m
a
g
e
M
i
t
i
g
a
t
e
d
=
D
a
m
a
g
e
D
e
a
l
t
∗

P
r
o
t
e
c
t
i
o
n
A
m
o
u
n
t
−
P
e
n
e
t
r
a
t
i
o
n
A
m
o
u
n
t

M
a
x
H
e
a
l
t
h
+
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
+

|

P
r
o
t
e
c
t
i
o
n
A
m
o
u
n
t
−
P
e
n
e
t
r
a
t
i
o
n
A
m
o
u
n
t

|

{\displaystyle Damage Mitigated = Damage Dealt * \frac{Protection Amount - Penetration Amount}{Max Health + Current Ward + \left | Protection Amount - Penetration Amount \right |}}

For blocked non-physical damage:

D
a
m
a
g
e
M
i
t
i
g
a
t
e
d
o
n
B
l
o
c
k
=
D
a
m
a
g
e
D
e
a
l
t
∗

P
r
o
t
e
c
t
i
o
n
A
m
o
u
n
t
+
B
l
o
c
k
P
r
o
t
e
c
t
i
o
n
−
P
e
n
e
t
r
a
t
i
o
n
A
m
o
u
n
t

M
a
x
H
e
a
l
t
h
+
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
+

|

P
r
o
t
e
c
t
i
o
n
A
m
o
u
n
t
+
B
l
o
c
k
P
r
o
t
e
c
t
i
o
n
−
P
e
n
e
t
r
a
t
i
o
n
A
m
o
u
n
t

|

{\displaystyle Damage Mitigated on Block = Damage Dealt * \frac{Protection Amount + Block Protection - Penetration Amount}{Max Health + Current Ward + \left | Protection Amount + Block Protection - Penetration Amount \right |}}

For blocked physical damage:

D
a
m
a
g
e
M
i
t
i
g
a
t
e
d
o
n
P
h
y
s
i
c
a
l
H
i
t
B
l
o
c
k
=
D
a
m
a
g
e
D
e
a
l
t
∗

P
r
o
t
e
c
t
i
o
n
A
m
o
u
n
t
+
B
l
o
c
k
P
r
o
t
e
c
t
i
o
n
−
P
e
n
e
t
r
a
t
i
o
n
A
m
o
u
n
t

M
a
x
H
e
a
l
t
h
+
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
+

|

P
r
o
t
e
c
t
i
o
n
A
m
o
u
n
t
+
B
l
o
c
k
P
r
o
t
e
c
t
i
o
n
+
B
l
o
c
k
A
r
m
o
r
−
P
e
n
e
t
r
a
t
i
o
n
A
m
o
u
n
t

|

{\displaystyle Damage Mitigated on Physical Hit Block = Damage Dealt * \frac{Protection Amount + Block Protection - Penetration Amount}{Max Health + Current Ward + \left | Protection Amount + Block Protection + Block Armor - Penetration Amount \right |}}

Additionally Chance to Receive a Glancing Blow reduces damage taken by 50% on a successful roll.

Reduced Damage Taken will further scale damage multiplicatively with each source.

D
a
m
a
g
e
T
a
k
e
n
=
(
D
a
m
a
g
e
R
e
c
e
i
v
e
d
−
D
a
m
a
g
e
M
i
t
i
g
a
t
e
d
)
∗
(
.5
i
f
G
l
a
n
c
i
n
g
)
∗
R
e
d
u
c
e
d
D
a
m
a
g
e
T
a
k
e
n
∗
R
e
d
u
c
e
d
D
a
m
a
g
e
T
a
k
e
n

{\displaystyle Damage Taken= (Damage Received - Damage Mitigated) * (.5 if Glancing) * Reduced Damage Taken * Reduced Damage Taken }

## Damage Taken Calculations[]

Once damage is taken the amount is subtracted from

- The characters Ward

- Percent dealt to mana equal to the Damage Dealt to Mana Before Health modifier

- The characters Health

If the characters health drops to 0 or lower they are killed.

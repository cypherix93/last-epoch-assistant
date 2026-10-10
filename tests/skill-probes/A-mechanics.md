> **Evidence, not guidance.** Skill-probe task output (2026-10-08, game data 1.5.2), produced with the `.claude/skills/` text as it was *before* the commit that added this folder applied the feedback. Quotes and line numbers refer to that earlier skill text; the current skills supersede it. See `tests/probes/README.md` and `.claude/skills/README.md`.

# A. le-mechanics-reference probe (game 1.5.x, data build 1.5.2)

Pages read (via `yarn mcp:call knowledge '{"page":"mechanics/<p>"}'`): defenses, ward-health-sustain, minions. Nothing else.

## 1. How armour reduces damage; does it apply to DoT?
- Armour gives a damage-reduction fraction on incoming **hits**: with L = area level + 5 (not character level),
  `f(x) = 0.30*1.2x/(80+0.05L^2+1.2x) + 0.55*0.0015x^2/(180L+0.0015x^2)`; armourDR_phys = min(0.85, f(x)); vs non-physical DR = 0.7 x phys (max 59.5%). It is one multiplicative layer: `taken = raw x (res term) x DT x (1 - armourDR) x (1 + DTbuff)`. Example from the table: 2000 armour at area 100 = 37.0% physical. Strength gives +4% increased armour per point. Confidence **D (formula G/D)**, high. Cite: defenses.md#armour, Summary items 2-3, #1-order-of-layers-for-one-incoming-hit.
- DoT: **No.** Armour has no effect on DoT unless the player has `ArmourMitigationAppliesToDamageOverTime` (SP118): then DoT x (1 - armourDR x min(SP118,1)). Resistances, endurance and damage-taken modifiers do apply to DoT. Confidence **D/A** (high). Cite: defenses.md#armour (last bullets), #common-misconceptions--pitfalls.
- Players also have a hidden 15% less DoT taken (**A**, defenses.md#8-damage-taken-modifiers-and-their-order).
- Open: the armour formula images are not vendored (**G?**, defenses.md#open-questions).

## 2. Ward per second at 2,000 ward and 50% retention
Formula (**G/A**, ward-health-sustain.md#31-decay): `decay = (5e-5*d^2 + 0.2*d) / (1 + 0.5*R)`, d = max(0, W - T), R = 0.5.
Threshold T was not given -> assumed T = 0 (**U**).
- d = 2000: quadratic 5e-5 x 4,000,000 = 200; linear 0.2 x 2000 = 400; numerator 600.
- Divisor 1 + 0.5 x 0.5 = 1.25 -> **decay = 480 ward/s** (lost). Sanity: page table row W=2000 gives 600 at R=0 and 400 at R=1; 480 sits between. Confidence **D (computed from G/A formula)**; high if T=0.
- Net change per second = ward generated per second - 480; generation was not stated so the net is undetermined. If generation G is constant the steady state is in #32-steady-state (e.g. G=400/s at R=1 gives 2000 ward).
- If a ward decay threshold T=400 existed: d=1600 -> (128+320)/1.25 = 358.4/s (**U**).
- `minimumWardDecayWithoutRegen` 0.5/s only when ward regen SP92 = 0 (semantics **D?**, #open-questions). Older formulas (0.4*W, 20%/s) are superseded (**G**).

## 3. Do minions benefit from my "increased spell damage"?
**No.** A player stat reaches a minion only if it carries the Minion tag (Totem tag for totem skills, or extraTag = the summon skill). Table row "+X% increased damage (tags 0), +X% fire damage (Fire)" -> "nothing". "Increased spell damage" has the Spell tag and no Minion tag, so it is not transferred. Confidence **D/G**, high. Cite: minions.md Summary item 1, #1-stat-transfer-summonentityondeathsummon.
Caveats: only Minion-tagged lines (e.g. "minion damage") transfer (as untagged increased); lines granted "for you and your minions" carry both scopes (**G/X**); extraTag-bound item stats transfer; transfer is a snapshot at summon (**D**). #6-exceptions-that-scale-from-the-player was not read, so any exception there is unchecked.

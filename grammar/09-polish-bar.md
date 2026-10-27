# 09 · The polish bar — what the user rejects on sight (review round 1)

These are hard rules. Each one came from the user's review of the v1 samples, with the frame they flagged.

## 1 · No cheap glows
> "please overall refrain from such unprofessional glows … I don't think so any of my video references I have provided had such"

Flagged: Lumen's sun (a glowing dot scaled ×8, so its blur became a 500 px muddy halo), the brown halo behind the plan card, Nook's bulb glow (banded, blocky — "very unpolished, low poly").

- A glow is **tight** (≤ 25 px bloom on the subject) plus, at most, a **faint wide atmosphere** at ≤ 20 % alpha with an eased multi-stop falloff (0 → 30 → 52 → 70 %).
- **Never scale an element that carries a blur/box-shadow** — the blur scales with it. Crossfade to a separately-built larger element instead (Lumen v2 sun).
- **No SVG `feGaussianBlur` for glows or shadows on large areas** — Chrome renders big blurs downsampled → blocky ("low poly") and banded. Use `radialGradient` / CSS `radial-gradient` fills.
- Coloured halos around cards (blurred duplicate of the card) are banned. Cards get a clean, soft, *offset* shadow or a contact shadow — like physical objects.
- Add 3–5 % film grain (soft-light) over gradient grounds to dither banding.
- Rim-light (neon style) is allowed — it is the style's material, it hugs the edge, and the user praised it.

## 2 · Corners stay round at every frame
> Aura card: "look carefully at the corners"

Flagged: `clip-path: inset(... round R)` reveals/folds — when the clip crosses the card's straight edges you get square corners, and the rim is cut off.
- Any container that grows, shrinks or folds is **geometry**: an SVG `<rect>` whose `x, y, width, height, rx` tween (primitives §16). Content fades in after it lands and out before it moves.
- `rx` never exceeds half the short side; a "line" is a rect with `height 6, rx 3` (still round ends).

## 3 · No sticker pops on UI
> Tally: "these are not good … especially how the pop like appear"

Flagged: tilted pills that scale up from 0.5 with `back.out` overshoot, one half-blurred mid-pop.
- UI that carries text **arrives from depth/soft focus** (opacity 0 → 1, blur 10 → 0, 0.7–0.9 s `expo.out`), never scale-pops with overshoot.
- **No tilted "sticker" layouts** of text cards. Cards are level; variety comes from depth and camera, not from random rotation.
- Overshoot is reserved for physical objects in a morph (icons, a lock clicking, a bulb switching on — which the user loved in Nook).

## 4 · Every element polished
> Nook: "every element should be polished"
- Flat icons get: a top-light shade gradient (white 22 % → 0 → black 10 % at the bottom), a 1–2 px inner rim highlight (white 35 %), a gloss spot, and a soft contact shadow that tracks the object's width (primitives §17).
- Metal/plastic parts get a 3-stop horizontal gradient, not a flat fill.

## 5 · The camera moves
See `08-camera.md`. A film without camera travel fails review regardless of how good the elements are.

## What the user loved (keep doing it)
- Nook: objects transforming into each other — "elements mixing … lovely".
- Aura: subtle elements, neon rim system, wave → eye → card chain.
- Lumen: the cream Think → Plan → Do act (hanging pills on a string, heat passing along it).
- Tally: overall layout and kinetic type.

## Review round 2 additions
- **Bugs the user caught:** a toggle knob that slid outside its track (translate distance must equal track width − track height); half the frame left empty for seconds while one card sat on the left — every dwell frame needs a composed subject (move the camera to it or fill the space).
- **Elements must look designed, not drawn:** use `elements/` (dock & squircle icons, toolbar pill, prompt box with tag + caret, reeded-glass pill, marble sphere + city tags, convex glass buttons, 3D candlesticks, halftone pill, light cone, strand network with glossy beads, liquid orb + slab, iOS toggle, notification cards, funnel chips). Rules in `research/element-notes.md`: one material rendered properly, value contrast over saturation, wide soft tinted shadows, light on edges, real icon design, tight confident type.
- **Fonts:** never default to the generic UI sans; pick from `fonts/FONTS.md` (Chillax, Satoshi, General Sans, Clash Grotesk, Cabinet Grotesk, Instrument Serif…). Display tracking −0.02…−0.04 em, weights 500–600.

# 02 · Motion, easing & the "liquid" feel

What makes motion read *liquid* rather than *animated* — distilled from v06, v37, v52, v43, v11, v28/29, v38, v46.

## The five liquid laws

1. **Nothing teleports, nothing stops dead.** Every arrival has a long ease-out tail (`expo.out`, `power4.out`); every departure accelerates away (`power3.in`). Rotation of carriers is *linear and never resets* (v06 iMac cups keep orbiting while changing material).
2. **Contact = deformation.** When things touch, they squash/stretch and wobble back (v37 bubble, ball merges; v52 metaballs; v45 blob→word). Amplitude ≤ 12% scale, settle in 0.4–0.6 s, damping 0.6–0.8.
3. **Material changes before shape.** Drain colour → change geometry → refill (v06): hides the topology jump. Equivalent in code: crossfade fill to neutral (0.15 s), morph path/radius (0.3–0.5 s), refill (0.2 s), overlapping.
4. **Blur is the glue.** Anything moving faster than ~1 screen-width/s carries motion blur on its own axis (6–12 px for text, 15–20 px full frame). Text arrives `blur(6–10px)→0`. Defocus whole frames for act changes (v46).
5. **Light leaks across boundaries.** Glows, rim-lights and soft gradients spill onto neighbours so objects feel embedded in one medium (v43 rim-light, v52 ember bloom, v14 fog, v38 gradient through reeded glass).

## Ease palette (GSAP names)

| Role | Ease | Duration |
|---|---|---|
| Arrival / landing title | `expo.out` · `power4.out` | 0.5–0.9 s |
| Exit | `power3.in` / `power2.in` | 40–50% of entrance |
| Camera move, colour flood, morph | `power2.inOut` · `sine.inOut` | 0.6–1.2 s |
| Zoom-through / grow-past-frame | `power3.in` then cut-match `expo.out` | 0.35–0.65 s |
| UI arrival (cards, pills, toasts) | opacity 0→1 + blur 10→0, `expo.out` (no scale pop) | 0.7–0.9 s |
| Physical-object spring (icon morphs, a lock click) | `back.out(1.4)` or `elastic.out(1, 0.75)` | 0.6–0.9 s |
| Playful spring (mascots, stickers) | `elastic.out(1, 0.5)` | 0.8–1.1 s |
| Constant rotation / progress / orbit | `none` (linear) | whole shot |
| Opacity, colour | never springy — `power1.inOut` | 0.15–0.4 s |

**Banned (review round 1):** scale-from-small pops with overshoot on any text-bearing UI (`back.out` on cards/pills/toasts), tilted "sticker" layouts, a half-blurred element frozen mid-pop. Overshoot only on physical objects inside a morph. See `09-polish-bar.md`.

**Banned defaults:** the same `power2.out 0.5 s` on everything; fade + slide-up on every element; titles that keep drifting after landing; bounce on serious UI; endless pulsing.

## Timing numbers (measured on the references at 30 fps)

- **Stagger:** letters 1 frame (0.033 s) · words 60–120 ms · list items 40–80 ms · orbiting icons phase-offset evenly.
- **Shot length:** reels 1–2.5 s per beat; landscape SaaS 2–4 s; morph continuum 1.5–3 s per object state; demos may hold 5–8 s while UI acts.
- **Hold to read:** 0.5 s + 0.3 s/word; last line ≥ 2 s.
- **Count-ups / odometers:** 1.2–1.6 s, `power2.out`, land on a downbeat (v26, v38, v17).
- **Typing:** 25–40 ms per char with a blinking caret (caret blink 0.5 s period, finite repeats).
- **Button press:** scale 1 → 0.92 (0.08 s) → 1.04 → 1 (0.3 s), glow bloom peaks on release (v61, v28).
- **Cursor:** moves on curved paths (bezier, not straight), ease-in-out 0.5–0.9 s, slight overshoot then settle; click = press + optional ripple from the click point (v39).

## Beat math

`beat_s = 60 / BPM` · 100 BPM → 0.6 s/beat, 2.4 s/bar. Compute each hit from its index (`t = t0 + i*beat`), never accumulate. A move that lands on a hit **starts 40–190 ms early**; the hit itself is a 0 ms `set` (flash, colour swap, scale pop). Layout changes on the bar, small accents on beats. On ambient tracks with no steady beat (v06/v43/v52 type) cut on **section boundaries and onsets**, and let motion be continuous between.

## 3D & depth defaults

The camera is mandatory — read `08-camera.md`. Below are the layer defaults it moves through.


- UI planes tilt 8–18° (rotateX/rotateY) with `perspective: 1200–1800px`; settle flat on the "read" moment.
- Foreground bokeh (big blurred dot/leaf/flag passing near camera) sells depth cheaply (v10, v46, v56).
- Parallax ratio background:mid:foreground ≈ 0.3 : 1 : 1.6.
- Orbit of a stage 3–5°/s when nothing else moves.

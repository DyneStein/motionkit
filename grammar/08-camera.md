# 08 · Cinematic camera — decide it from the content, then make it flow

> **Review round 3 (user):** *"the camera movement in the landscape video is completely good, it's just incremental — 5 px, stop, 5 px, stop … in professional videos it's one complete flow."* And: *"the camera movement only should be there where there is a good amount of text … in the vertical videos the elements are transforming, so camera movement just creates chaos … and the pattern is extremely same — I can predict where it will move, in the exact same direction."*

## v4 · The three rules (supersede everything below where they conflict)

### 1 · Decide the camera from the content, before building
| The film is mostly… | Camera | Reference evidence |
|---|---|---|
| **Text / kinetic sentences / UI walkthrough** (words build, lists stream, a reader's eye travels) | **Travelling follow-cam** across a world bigger than the frame | v27, v46, v61, v43 tracking shots — camera moving 83–99 % |
| **Elements transforming** (morphs, one protagonist, objects becoming objects) | **Near-locked.** Moves only when something on screen motivates it: an object travels (follow it), a reveal needs room (pull back), a detail matters (slow push ≤ 3 %/s), an event hits (a 0.1 s kick), an object becomes the world (dive through it) | v06 Bentomotion & v52: flat canvas, camera effectively locked — v52 moves 14 % of the time; the *objects* carry all the motion |
| Mixed | Lock during morphs, travel only across text beats | v38, v31 |

If a film needs travel, it needs **enough text/beats to motivate it**. Plan text and camera together; never add travel to an element-driven film just to have "camera movement" — the user called that *chaos*.

> Measurement caveat: `camera_motion.py` reads global image motion, so on flat-ground morph films it counts the *object's* motion as camera. Judge those films by eye (or measure the background only).

### 2 · Flow: one continuous glide, never per-word hops
Measured with `research/camera_velocity.py` (frame-level speed profile):
- References: each move is a **bell** — speed rises smoothly, peaks, falls — and a bell spans a **phrase**, not a word (v27 ▁▂▃▄▅▅▂▂▁, v61 ▁▁▂▃▄▆██▆▄▃▂▁). Micro-stop ratio 13–24 %, jerk (accel_cv) 1.7–3.9.
- Round-3 Tally: every word fired a spike that **started at full speed** (`expo/power3.out`) and decayed to zero — `██▅▃▁ … ██▅▃▁`: stop ratio up to 54 % → the stutter the user felt.
- Fix (round 4): `camera-rig.js` v3 `e: "glide"` keys — consecutive glide keys become **one monotone cubic spline** through every word target (Fritsch–Butland tangents; zero velocity only at the start and end of the run). Region-to-region moves use bell eases (`power2.inOut` / `power3.inOut`, ≥ 1 s for long distances), never `expo.out`/`power3.out` starts. Result: accel_cv 1.4–2.1, smooth bells, no mid-sentence stops.
- Whips: ≤ 60 % W/s mean; give long distances more time rather than a faster ease.

### 3 · Never predictable: seed the camera per film
- `cameraRig(..., { seed })` gives each film its own drift frequencies, phases and amplitudes.
- `camSeed(seed)` drives motivated moves: direction (`sign()`), size (`range(a, b)`) and choice (`pick([...])`) — so pull-backs, leans and rolls differ from beat to beat and film to film. Never reuse a fixed "arrive left, leave right" template on every station (round 3's tell).
- Keep drift small on element films (`drift: 0.35`), fuller on text films (`0.8`).

### 4 · Vary the route; balance camera beats with element beats (round 4)
> User: *"the camera is constantly moving from left to right and left to right … if a video is about camera movement then all of it is just camera movement. I want no single pattern repeating + a good balance of camera movement and element interaction."*
- **Plan the route as a direction list before building** and never use the same direction twice in a row. Mix trucks (L and R), pedestals (up and down), diagonals, push-ins, pull-backs and *holds*. Round-5 Tally: right → down-left → left → push-in → up → up-right → left → up → right → down-right → down.
- **Lay the world out to produce that route** (place the next region above, below, left or diagonal — not always to the right).
- **Alternate beat types.** *Camera beat:* the camera travels (a sentence glide, a whip to the next region). *Element beat:* the camera is nearly still (slow push or drift only) and polished elements do the work — a toggle clicks, a counter rolls, a chart draws, accounts connect, toasts stream. Aim for roughly 40 % camera beats and 60 % element beats in a text film; element films are almost all element beats.
- Text that builds in place (centred, no follow) is fine during element beats; reserve follow-glides for 1–2 sentences per film.

### 5 · Sync events to the music
- Measure with `research/sync_check.py <render.mp4>` → visual events on audio hits vs chance ("lift"). References: lift ×1.15–1.41 (beat-driven films ≈ ×1.4), mean offset ≈ 0 ms. Target ≥ ×1.35, |offset| < 30 ms.
- Rhythmic tracks: author on the beat grid (`beat(n)`, `bar(k)`); camera moves leave ~0.25 s before a bar and arrive on the downbeat.
- Ambient tracks: extract hits with `research/audio_hits.py <track> <dur>` and wrap the scene with `beatSync()` (primitive 22) — quick events snap to the nearest hit (±0.2 s), staggers and order preserved.

---

> **Review round 2 (user):** *"the camera isn't moving, it's just the perspective … you are changing the angle of viewing, not the position of the camera."*
> v2 rotated/zoomed a camera around a fixed point. **v3 rule: the camera must TRAVEL — its x/y position follows the action across a world bigger than the frame.** Per-reference breakdowns: `research/camera-notes.md`; move segmentation tool: `research/camera_moves.py`.

## v3 · Travel (applies to TEXT-driven films only — see v4 rule 1)
1. **World bigger than the frame.** Lay chapters out as *stations* 600–1500 px apart (zig-zag or diagonal), content at real size or larger than the frame.
2. **Follow-cam.** Camera x/y is keyed from the *active point*: the newest word (hold its right edge at ~65 % of frame width), the caret, the protagonist/carrier. Each hop: `power3.out`/`expo.out` (40–80 % of reference moves decelerate).
3. ~~**Carrier travel for single-object stories**~~ (rejected in round 3 for element films — kept only for a protagonist that genuinely travels): wrap the story in a `#carrier`; at every morph seam tween the carrier to the next station (0.8–0.9 s `power3.inOut`); the camera arrives 0.25–0.3 s later with `expo.out`, then drifts ±40–70 px during the dwell. Captions sit *at the stations* in the world, so they enter/leave through the frame edges.
4. **Parallax reference layer** in every world: far dots/discs/motes/stars at translateZ(−520…−700) with compensating scale — without it, travel on a flat ground is invisible.
5. **Speeds (measured):** trucks 10–30 % W/s, whips 40–60 % W/s, pedestals 10–25 % W/s, push/pull ≤ 13 %/s. Rotation ≤ 8° except deliberate reveals.
6. Things leave the frame by the camera passing them (optionally softened at the trailing edge), not by fading in place.


> Review round 1, the user's words: **"MAJOR MAJOR MAJOR FLAW … NO CINEMATIC CAMERA MOVEMENT IN ANY OF THE VIDEOS."**
> The first four samples had motion *inside* static frames. Premium references move *the camera*.

## What the references actually do (measured)
Global-motion estimate (`research/camera_motion.py`: sub-pixel phase correlation + zoom search, frames 0.3 s apart, "moving" = > 1.5 %/s pan or zoom) over all 59 motion references (`research/INDEX.md`, column *cam%*):

| Measure | References | v1 samples (no camera) | v2 samples (camera rig) |
|---|---|---|---|
| Frames where the camera is moving | **median 77 %** (middle half 65–87 %) | 20–27 % | Lumen 89 · Nook 87 · Aura 78 · Tally 64 |
| Hard cuts | most < 1 / 10 s | 0 | 0 |

**Target (text-driven films only): ≥ 65 %.** Element-driven films: low camera share is correct. Measure every render: `python3 research/camera_motion.py <dir-of-mp4s> out.json`.

The camera is *almost never locked off* in **text-driven** films. Element-driven films are the exception (v4 rule 1).

## Two lessons from tuning v2
- **Static screen-fixed captions make a moving shot read as still** — to the eye and to the detector. Put captions *in the world* slightly in front of the subject (translateZ +35…+90) so they ride the camera (Lumen, Aura, Nook). Where a heading must stay screen-fixed (landscape headlines), give it a damped *lens follow*: ~16 % of camera x, 5 % of y, 35 % of roll, tiny scale from z, scale origin at the top edge (Tally).
- **Dwells keep travelling.** A dwell is a slow truck/orbit at ~3–6 % of frame width per second (`power1.inOut` between keys ±35–60 px or ±5–7°), not a stop. Easing into a dead stop (`sine.inOut` with no delta) is what made v2-first-pass read static (35–50 %).

## The contract (write it into every plan)
1. **One camera, dwell and sweep.** The camera sweeps between ideas (0.6–1.4 s, `power3.inOut`), then eases into a near-rest for 1.5–3 s while the point lands. During a dwell it keeps a slow push (≈ 2–4 % scale over the dwell) plus handheld drift. It never fully stops except the final breath.
2. **One world, not slides.** Lay the film out as places in one 3D space (a problem field, a product plane, a network below it…). The next beat is reached by travelling to it, not by fading the frame.
3. **Three depth layers minimum.** Background (far, slow), subject plane, foreground (near, fast, soft focus). Parallax is what sells the move.
4. **Depth of field.** Things off the focal plane blur by distance (≈ 0.011–0.022 px per px of depth, max 8–9 px). Rack focus to change what matters (v46, v10).
5. **Handheld drift** on everything: x ±7/3 px, y ±5/2 px, roll ±0.22°, pitch ±0.25° at incommensurate slow frequencies (0.04–0.16 Hz). Subtle; never shake.
6. **Motion blur on sweeps:** `data-motion-blur="on" data-motion-blur-events="on"` on the root composition (events: the camera is driven from a callback).
7. **Hit the music:** big sweeps start on bar lines (rhythmic tracks) or section boundaries (ambient); a 4–6 % push "kick" on a strong onset (Nook: the bulb switching on).

## Move vocabulary (with the reference that shows it)
| Move | Build (camera rig keys) | Refs |
|---|---|---|
| **Fly-through field** | z from −1100 → +800 through cards placed at z 250–750; cards fade as they near the lens | v08 envelope flood, v46 orb streaks, v07 |
| **Follow the guide object** | y/rx track a falling/travelling element; camera tilts down as it lands | v07 cursor, v52 ember, v57 line |
| **Orbit the hero** | ry ±10–18° swing across a card/object while pushing 50–100 px | v27 phone, v31, v46 coverflow |
| **Dive into screen** | z +350–450 toward a phone/card with `power3.in`, then pull back out to the next idea | v24, v02 |
| **Pull-back reveal** | z −700…−900 to show context (the same objects, now changed) | v57 journey map, v02 newspaper |
| **Truck to the next region** | x ±500–600 with `power3.inOut`; the next element was already in the world | v27 tracking sentence, v10 |
| **Tilt for depth** | rx 8–26° to see rings/dials/networks as planes | v46, v48 |
| **Rack focus / dim** | focus depth moves off the world; a veil (40–80 %) lifts the HUD type | v46, v14 |
| **Kick** | +30–40 z in 0.12 s `power3.out`, settle 0.6 s | v53, v61 |

## How to build it (HyperFrames)
- Markup: `#lens { perspective: 1500px; perspective-origin: <focus px> }` › `#world { transform-style: preserve-3d; transform-origin: <focus px> }` › layers. Elements get depth with GSAP `z` (or inline `translateZ` on wrappers GSAP never touches).
- Driver: `primitives/camera-rig.js` — `cameraRig(tl, world, duration, keyframes, dof, { t0, drift, dofK, onRender })`. One tween drives everything, so any frame renders on its own (seek-safe). Keys: `{ t, x, y, z, rx, ry, rz, f, e }` where `e` is the ease *into* that key.
- Multi-scene films: one rig per scene, `t0` = the scene's start on the film clock (drift phase stays continuous), and the boundary keys of adjacent scenes must match.
- HUD vs world: headings and captions that must stay readable are screen-fixed (outside the world); everything else lives in the world.
- A CSS `filter` (DOF blur) flattens that element's own 3D children — blur leaf layers, not containers that need depth inside.
- Fade elements before they reach the lens (effective z > ~350 with perspective 1500) — near-plane elements scale wildly and break.

## Checklist before render
- [ ] Camera moving ≥ 65 % of frames (measure: `python3 research/camera_motion.py <dir> out.json`).
- [ ] Every seam is a camera travel or a carrier (grammar/01), never a crossfade of frames.
- [ ] At least one parallax moment, one orbit or tilt, one push-in and one pull-back.
- [ ] Nothing important collides with HUD text while the camera travels (snapshot the sweeps).

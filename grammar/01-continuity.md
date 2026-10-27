# 01 · Continuity — how premium films never "cut"

**The single biggest difference between the references and generic AI motion: the eye is never asked to re-find the subject.** 19 of 59 references have zero hard cuts and 33 have ≤1 per 10 s. Even the cut-heavy ones (v15, v19, v20, v21) hide their cuts behind one of the carriers below. Rule for this kit:

> **Every scene change must be carried by something that exists on both sides of it.** If you can't name the carrier, you don't have a transition — you have a cut.

Budget per film: **3–5 carrier kinds**, max ⅓ of seams may be true hard cuts, and only on a strong beat with a dip (darken ~40% for 3 frames before) or a locked-centre object (v20).

## The 14 carriers (ranked by how often the references use them)

| # | Carrier | What persists across the seam | How it's built | Seen in |
|---|---|---|---|---|
| 1 | **Element becomes the world** | a button / pill / card / image | the element scales past the frame (0.5–0.7 s, `power3.in` → `expo.out`), its fill/content *is* the next background; corner radius shrinks as it grows; surroundings blur 15 px + fade in 0.3 s | v03 ↑-button→card vortex, v12/v47 thumbnail→full photo, v13 button→full blue frame, v62 logo→deploy card, v21 |
| 2 | **Zoom-through** | the camera's aim | push into a small detail (send button, avatar, "+" icon) until it fills frame with blur; the detail's interior is the next scene | v02, v04, v23 (dives into UI), v24 (dive into phone), v31 macro send button |
| 3 | **Shape morph / silhouette bridge** | the outline | consecutive objects share a silhouette (circle→disc→wheel→button→ring); scale + fill crossfade + inner detail fade = morph | **v06** (100 s of it), v37, v11 ring→astroid→sparkle, v34 globe→circle→pill, v46 shape strip, v47 planet→pill |
| 4 | **Guide object / protagonist** | one small thing the eye follows | a dot, orb, cursor, ember, line or comet travels and *leads* the camera into the next scene; it can become a bullet, a full stop, a logo | **v52 ember**, **v57 orange line**, v11 white dot, v36 dot, **v46 glass orb**, v07 3D cursor, v15 falling figure |
| 5 | **One card, many states** | a container | a single card resizes/re-skins: button → menu → tile → dialog → progress → pill → ✓. Spring overshoot + 3–15° 3D tilt on each state change | **v28/v29 Drive**, v33 profile card, v05 cell→button→chip, v51 timer re-skin |
| 6 | **Iris / circle flood** | the centre point | `clip-path: circle()` grows from a dot or click point; often used to flip dark↔light | v52 (white iris then black iris), v36 dot→white, v13 |
| 7 | **Colour / luminance flood** | the hero object | hero stays, the ground changes colour (white→black, mint→forest) in 0.4–0.8 s `power2.inOut` | v29 (bg white→black on click), v14 luminance dip, v17, v03 dark→light |
| 8 | **Blur whip / rack focus** | motion direction | 0.15–0.3 s directional smear or full defocus; the next scene arrives blurred and sharpens in ~0.13 s | v46 (full defocus between acts), v04, v39, v61, v55 |
| 9 | **Camera through a continuous world** | the space | never leave the world: dolly along a UI bar, fly over a desk, orbit a stage; scenes are *places in one space* | v02/v23 OS-desktop world, v07 Blender desk, v08 museum, v57 zoom-out reveals the whole path |
| 10 | **Anchored word / persistent title** | text | a word or caption stays put while the plate behind changes (cuts become invisible) | v08 "Light/Maps/Money", v52 persistent top title, v21 repeated line |
| 11 | **Match by rhyme** | a repeated shape/colour | the same circle motif in every scene (daisy→bubble→sun→globe→clock→cup) — even a cut reads as continuous | **v37**, v53 rings, v04/v12/v22 planet horizon |
| 12 | **Carry-across** | a result object | the result shrinks (1→0.6) with blur and lands inside the next screen as that screen builds around it | v31 card slots back into phone, v08 Mail icon → Sol icon on plinth |
| 13 | **Particle dissolve / assemble** | matter | the thing breaks into dots/pixels that reform as the next thing | v18 Pinterest P, v38 pill→dots, v36/v54 dot→halftone photo, v32 text→comets |
| 14 | **Wipe by a physical medium** | the "material" | brush ribbon, torn halftone paper, pixel staircase, liquid surface, light bar — the wipe belongs to the film's world | v07 ribbon, v54 pixel stair, v17 light-bar, v46 meniscus |

## Rules of thumb (measured)

- **Overlap, never queue.** Next element starts when the previous is 30–50% done.
- **Mirror eases at a seam.** Outgoing `power3.in`, incoming `power3.out` / `expo.out`; matching speed hides the handoff.
- **Cut, if you must, at the fastest frame of a move** with matching direction on both sides (whip-cuts).
- **Keep one constant across the whole film**: canvas colour (v06 lavender), a persistent title (v52), a grid (v19), a horizon (v04/v22), a fog (v14, v32). Constancy is what lets everything else change.
- **Loop-ready endings** for social: end on the opening frame (v56, v59) or on a rhyme of it (v37 circle cup ↔ opening sun).
- **No idle breathing** as a substitute for motion. Continuous motion comes from the *world* (fog drift 3–5°/s, orbiting background, a guide object travelling), not from titles bobbing.

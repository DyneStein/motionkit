---
name: motionkit
description: Premium, liquid, cut-free motion graphics in the style of top product films (Apple, OpenAI, Anthropic, Bentomotion-style morphs, neon rim-light, glass, metaballs), built with HyperFrames and set to music the user supplies. Use when the user asks for motion graphics, a promo/launch/explainer/reel with "smooth", "liquid", "fluid", "no cuts", "premium", "professional", "like big companies", or mentions MotionKit, a MotionKit style (Ember Flow, Morph Continuum, Neon Rim, Breathing-Gradient SaaS, Glass Orb, Single-Line, Liquid Gradient Pop, Bold Brand…) or wants to reuse the kit/samples.
---

# MotionKit

Kit root: the folder this skill lives in, one level up (call it `$KIT`; if the skill was symlinked, resolve the link — e.g. `~/.claude/skills/motionkit → <clone>/skill`, so `$KIT = <clone>`). It is distilled from 60 reference videos the user curated; follow it instead of generic motion defaults.

## Non-negotiables (the user's standing preferences)
1. **No sudden cuts.** Every scene change is carried by something on both sides of the seam (`$KIT/grammar/01-continuity.md`). Max ⅓ of seams may be hard cuts, and only on a strong beat.
2. **Liquid, fluid, rounded.** Long-tail ease-outs, squash/stretch on contact, material changes before shape, blur as glue (`02-motion-easing.md`).
3. **Never generate or synthesise music.** Use the user's track. If none is given, ask for one. The kit ships no music.
4. **Camera decided by content (rounds 3–4):** plan a varied route (never the same direction twice in a row: trucks L/R, pedestals up/down, diagonals, pushes, pulls, holds) and alternate camera beats with element beats where polished elements interact under a still camera; sync events to the music (`sync_check.py` lift ≥ ×1.35; `beatSync()` for ambient tracks, beat grid for rhythmic ones). text-driven films → travelling follow-cam that GLIDES (spline `e:"glide"` through word targets, bell eases between regions — never per-word hops); element-driven films → near-locked camera with only motivated, seeded moves (`camSeed`, `seed`) — never travel for its own sake, never a repeated pattern. Earlier rule, still true for text films: (round 2: "it's just the perspective, the camera isn't moving"): follow-cam on the active word/protagonist across a world bigger than the frame, carrier travel between stations for single-object stories, parallax reference layer always (`$KIT/grammar/08-camera.md` § v3, `$KIT/research/camera-notes.md`, primitives §19–20). Also: (the user called its absence a "MAJOR MAJOR MAJOR FLAW"): build every film as a 3D world seen through `camera-rig.js`; camera moving ≥ 65 % of frames (references: median 77 %, measured with `research/camera_motion.py`); captions ride the world, dwells keep travelling, dwell-and-sweep rhythm, ≥ 3 depth layers with parallax, DOF, handheld drift, motion blur on sweeps (`$KIT/grammar/08-camera.md`).
5. **Polish bar** (`$KIT/grammar/09-polish-bar.md`): tight glows only (no halos, never scale a glowing element, no large SVG blur filters — gradients + grain); container morphs are SVG geometry so corners stay round every frame (no clip-path reveals); text-bearing UI arrives from depth/soft focus — no scale-pops, no tilted sticker layouts; every flat object gets shade + rim + contact shadow.
6. **Professional elements and fonts:** build UI/3D pieces from `$KIT/elements/` (see `elements/showcase/` and `research/element-notes.md`); type from `$KIT/fonts/FONTS.md` — never generic defaults.
7. **Professional finish:** one accent per line, italic-serif or weight-jump emphasis, every frame has ≤ 3 focal elements, a persistent constant (canvas, title, horizon or fog) across the film.
8. **Reels first** unless told otherwise: 1080×1920, text in the 168–1330 px band, ≤ 5 words per line, nothing under 28 px, frame 0 is the hook (never black, never a logo).
9. Be token-efficient: one scene file per chapter (or one for a whole continuous morph), snapshot only state changes.

## Workflow
1. **Brief (short).** Subject/brand, message, format, length, the music file. Ask only what is missing; one round.
2. **Pick a style** from `$KIT/styles/STYLES.md` (table at the bottom maps briefs → styles). Read that card fully; open 1–2 of its reference notes in `$KIT/research/video-notes/` for specifics.
3. **Analyse the music:** `npx hyperframes audio <track> --only kind,bpm,beats,downbeats,sections,onsets --json`. Rhythmic → beat grid (`beat(n)`, `bar(k)`, primitives §1). Ambient → chapters on section boundaries, hero events on the strongest onsets (`--threshold 0.3`).
4. **Plan in one table:** chapters × (time window, carrier into next, object state, caption, **camera move**). Name the carrier and the camera move for every seam; if you can't, redesign the seam. Lay the chapters out as places in one 3D world.
5. **Build with HyperFrames** (load `/hyperframes` first for the contract). Start from the closest sample (v2 = with camera): `$KIT/samples/a-ember-lumen` (S1), `b-morph-nook` (S2), `c-neon-aura` (S3), `d-saas-tally` (S4) — `cp -R` it to the new project, then rewrite. Use `$KIT/primitives/PRIMITIVES.md` blocks. Put palette + fonts in root `data-composition-variables`.
6. **Verify:** `npx hyperframes check --json 2>/dev/null` (stderr is noisy) → fix errors, weigh warnings → `npx hyperframes snapshot --at <every state change + mid-sweep> -o .snap/x` → read the contact sheet → fix (zoom into corners and glows: `snapshot --zoom`). Run through `07-engineering-pitfalls.md` and the `09-polish-bar.md` checklist. After render, measure camera motion: `python3 $KIT/research/camera_motion.py <dir-with-mp4> out.json` — target `moving_frac` ≥ 0.65 (references' lower quartile; median 0.77).
7. **Render:** `npx hyperframes render -o <out>.mp4`. Open the Studio preview before a delivery render when the user is reviewing.

## Quick references
- Carriers (pick 3–5 per film): element-becomes-world · zoom-through · shape morph · guide object · one card many states · iris · colour flood · blur whip · continuous world camera · anchored word · shape rhyme · carry-across · particle dissolve · medium wipe.
- Ease palette: arrival `expo.out`/`power4.out` 0.5–0.9 s · exit `power3.in` (40–50 % of entrance) · camera/morph `power2.inOut` · premium spring `back.out(1.4)` · linear only for orbit/rotation/progress.
- Type: per-word blur-in (no translate) · grey→ink read-along · slot-machine word · highlight pill keyword · italic-serif accent · inline icon in sentence.
- Story shapes: problem(dark)→reveal→features→CTA · chaos→order · one protagonist many states · prompt→result · manifesto with anchored word · micro-loop.

## Growing the kit
When the user adds new reference videos: make contact sheets (timestamped, 0.33–1 s sampling) + 10 fps strips on transitions, write a note per video in `research/video-notes/`, add rows to `research/INDEX.md`, and fold new patterns into the grammar/style files. When a build teaches a new bug or primitive, add it to `07-engineering-pitfalls.md` / `PRIMITIVES.md`.

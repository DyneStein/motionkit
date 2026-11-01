# 10 · Fast reels: the playbook

> **Round 6 changes the emphasis.** The product is brand reels and launches, code-drawn with `fast-type/`, not 3D films built around downloaded assets. Sections 1 and 5–8 still apply everywhere. Sections 2–4 apply only when real 3D is wanted as an accent. The 3D films' arcing, banking camera was what the user loved: the engine keeps it, as long as something stays readable.

## 0 · Round-6 rules
- **Nothing useless.** Camera motion must always serve something readable. Measure it with `fast-type/visibility.mjs`.
- Tracking sentences in vertical: keep the newest word near the right edge and earlier words visible. A close camera shows one chopped word at a time.
- Swing and bank during whips, then settle within about a beat, before the viewer has to read.
- Fit content to about 88% of the frame: camera push-ins scale it, and overflow is the commonest fault.

> **Review round 5 (user):** the earlier films were good but "not fast" and had no "professional elements". Camera movement stays "extremely important".
> Built from 8 vertical 3D reels (`lens-3d/presets`) and 8 brand reels (`fast-type/presets`), each cut to one song.

## 1 · "Fast" is a number
`pace.py` (frame difference at 108×192, 30 fps, 0–255 scale). Mean is the honest figure: median hides reels that alternate holds and hits.

| Clip | Median | Mean | p90 | Hard cuts /10 s |
|---|---|---|---|---|
| Our DenseFusion reels | 0.2–0.7 | 0.34–1.27 | 0.7–3.6 | 0 |
| Our MotionKit Aura | 0.15 | 0.34 | 0.72 | 0 |
| BMW M4 phonk edit (1.1M views) | 1.95 | 4.79 | 10.7 | 6.6 |
| BMW Blender phonk | 1.78 | 5.66 | 15.1 | 5.0 |
| C4D Journey (600k views) | 0.34 | 2.58 | 7.4 | 1.3 |

So the old films ran 5–10× under viral reels. Measure every render against these.

**More is not better.** The first pass of the new engine measured a mean near 21 and read as noise: overexposed and unreadable. Fast means *hold the hero sharp, then whip*, not blur everything.

## 2 · Styled HTML cannot reach this bar; real 3D can
Use `lens-3d/src/engine.js` (three.js, skill `motionkit-3d`) for anything meant to look expensive.
- **Accumulation-buffer lens.** Each output frame averages N renders (default 24) across the shutter, each with a jittered lens position and sub-pixel offset. That one loop gives physically correct motion blur, depth of field and anti-aliasing, with no depth artefacts.
- It is cheap: 20–200 ms per frame at 1080×1920 on an M2. A 30 s reel renders in about 2.5 minutes.
- Linear HDR pipeline, then tight bloom, tone map, grade, grain, dither. Grain and dither also prevent gradient banding.
- Everything is a pure function of time, so frames can render in any order.

## 3 · Elements come from scans, not from CSS
Real assets are the fastest route to "professional". See `research/level-up-notes.md` for sources.
- Re-material scans for a unified look: a chrome skull, a forged-gold lion. Keep the scan's normal map, replace base colour.
- Prefer one hero object at a time, lit by strips.

## 4 · Lighting rules learned the hard way
- **Chrome needs something to reflect.** Build a studio of light strips into the environment map. Metal with a black base colour reflects nothing; dark chrome is a mid-grey base colour.
- **Flat extruded chrome faces mirror one direction, usually black.** Give faces a rougher metal (`faceMetal`) and keep mirror chrome on the bevels.
- Point and spot intensities scale fast. Start low; blown white is the commonest failure.
- Swap environment maps per world (`swapEnv`) when the film changes place.

## 5 · Camera grammar for fast reels
- Splines through keys with a monotone time map, so velocity stays continuous through every key: one flow, no hops.
- Dolly kick, FOV punch and a very short shake on kicks. Shake above ~.05 units smears the hero: keep it small.
- Keep lenses under about 70° except for a dive. Wide lenses at speed turn everything into radial mush.
- Radial `zoom` blur only for 0.2–0.3 s on a whip.
- Vary the route in writing at the top of every scene file: no direction twice in a row.

## 6 · Carriers that hide a change of world
Dive into something dark or bright, and swap inside it: a socket hole, speaker cone, eyepiece, throat, nozzle, black hole, the sun.

## 7 · Sync comes from the song itself
`audio-map/audio_map.py` (skill `motionkit-audio`) writes 120 Hz low/mid/high envelopes plus every hit with its strength. Drive motion from those (`A.kick(t)`), not from a metronome: slowed funk has off-grid rhythms. Pick the window so the first kick lands within about 2 s.

## 8 · Layout checks
- Vertical frames are narrow. Fit titles with `fitDist(width, fov)` or stack them: every first draft of an end title was cropped.
- Blackletter can be illegible: Grenze Gotisch's T reads as C. Test the actual word.
- Centre type on cap height, or it sits in the top of the frame.
- Keep sparks and particles at real impact points. A burst parked in front of the lens looks like a cheap firework; particles near the lens look like dots.

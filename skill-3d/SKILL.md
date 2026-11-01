---
name: motionkit-3d
description: Cinematic 3D text films, with real 3D type, scanned objects, chrome and gold materials, and a physically correct lens (motion blur and depth of field), cut to the user's music. Use when the user asks for a 3D video, 3D text, a cinematic or artistic music reel, or real objects rather than a brand launch. For product launches and brand reels use `motionkit` instead. Part of MotionKit.
---

# MotionKit 3D

Kit root: the folder this skill lives in, one level up (call it `$KIT`; if the skill was symlinked, resolve the link, e.g. `~/.claude/skills/motionkit-3d → <clone>/skill-3d`, so `$KIT = <clone>`). Engine: `$KIT/lens-3d`.

Three.js with an accumulation-buffer lens: every output frame averages 24 renders across the shutter, each with a jittered lens. About 2.5 minutes to render 30 s on an M2. Rules and lessons: `$KIT/grammar/10-fast-3d.md`; every past bug: `$KIT/research/build-log-round6.md`.

## Ask first (one round, skip what is known)
1. **What should it say or be about?** Words on screen, mood, any subject.
2. **Look:** a preset below, or describe one.
3. **Music:** path to their track. Never generate music.

| Preset | Look |
|---|---|
| `01-andromeda` | Deep space: galaxy, lensed black hole, chrome type |
| `02-abnormal` | Clinical white, living ferrofluid, giant letters |
| `03-letal` | Blood red, chrome skull, tunnel of blades |
| `04-guerreiro` | Forged gold, katana, lion, sparks, roman type |
| `05-pegadora` | Concert stage, speaker wall, light beams, LED type |
| `06-tomada` | High voltage: socket, cable flight, lightning, hazard yellow |
| `07-zora` | Dawn: cloud sea, marble arches, bronze whale, statue |
| `08-sem-demora` | Night highway, red concept car, tunnel, gantry title |

## Build
```
python3 $KIT/lens-3d/fetch_assets.py     # once: downloads about 90 MB of free models, HDRI and fonts
python3 $KIT/lens-3d/new_3d.py <outdir> --preset <name> --song <file> --title "<Name>"
```
Then edit `scene.js`. Words live in `film.text(font, 'WORD', {...})`, the camera in `film.setRig([...])`, timed in bars. Presets are written for their own song: **re-time the rig and events to the new song's hits** using `assets/audio.json` and `song-graph.png`.

Preview frames fast with `node $KIT/lens-3d/preview.mjs <project> 0.5,3,9`, then render with `npx hyperframes render -w 1 --crf 20 --max-bitrate 35M --buffer-size 70M -o <out>.mp4`.

## Rules that cost us the most to learn
- **Light low.** Blown white is the commonest failure. Overexposure reads as noise, not energy.
- **Chrome needs something to reflect:** build light strips into the environment. Metal with a black base colour reflects nothing. Flat extruded faces need a rougher metal, with mirror chrome on the bevels.
- **Hold the hero sharp, then whip.** Keep shake around .05 and lenses under about 70° except on a dive.
- **Text must read.** Fit titles to the narrow frame with `fitDist` or stack them; centre on cap height; test blackletter, because some letters misread.
- **Particles only at real impacts.** Sparks parked in front of the lens look like fireworks.
- **Check triangles × samples** before instancing a scan: 700 detailed barriers made one film 10× slower.
- Keep motion readable: nothing should move with nothing to look at.

## Licences
See `$KIT/lens-3d/CREDITS.md`. Poly Haven and Scattering Skull are CC0. **Car Concept and Primary Ion Drive require credit.** Check `LICENSE.md` before adding Khronos models: some are non-commercial.

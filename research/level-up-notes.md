# Level-up notes: what the wider internet offers (explored 2026-11-01)

## Assets
| Source | What | Licence | Notes |
|---|---|---|---|
| [Poly Haven](https://polyhaven.com) (`api.polyhaven.com`) | 521 scanned models, HDRIs, PBR textures | CC0 | Scriptable. Marble bust, katana, gas mask, boombox, microscope, multimeter, lion head, moon rocks. |
| [Khronos glTF-Sample-Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) | Reference PBR models | Per model: **check `LICENSE.md`** | ScatteringSkull is CC0; CarConcept is CC-BY 4.0; DamagedHelmet is partly CC-BY-NC, so avoid it commercially; dragons carry Stanford terms. |
| [three.js example models](https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf) | Ferrari, Nemetona, Primary Ion Drive and more | Mixed, often Sketchfab uploads | Confirm each licence before publishing. |
| [Fontsource](https://fontsource.org) via npm | Open fonts as WOFF | Mostly OFL | fontTools converts to TTF, opentype.js then turns glyphs into geometry. |

## Code worth knowing
| Repo | Use |
|---|---|
| [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) | Ready-made effect stack; our engine uses its own passes so accumulation stays simple. |
| [N8python/n8ao](https://github.com/N8python/n8ao) | Screen-space AO: a next upgrade for grounding objects. |
| [0beqz/realism-effects](https://github.com/0beqz/realism-effects) | SSGI, TRAA. Worth testing for reflective floors. |
| [gkjohnson/three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer) | True path tracing; viable for hero shots since renders are offline. |
| [paper-design/shaders](https://github.com/paper-design/shaders) | High-quality zero-dependency canvas shaders. |
| [patriciogonzalezvivo/lygia](https://github.com/patriciogonzalezvivo/lygia) | Shader function library (noise, SDF, lighting). |
| [protectwise/troika](https://github.com/protectwise/troika) | SDF text in three.js for large amounts of flat text. |
| [spite/ccapture.js](https://github.com/spite/ccapture.js) | Confirms the approach: averaged sub-frames, 16 as the worked example, needs `EXT_color_buffer_float` on the GPU path. |

## Technique references
- [The Sleepers (Codrops, 2026)](https://tympanus.net/codrops/2026/07/10/the-sleepers-creating-an-atmospheric-webgl-experience-with-lightweight-techniques/): fake volumetric fog patched into materials with world position and noise; threshold-texture transitions; a 3×3 chunk grid for infinite worlds; inverted-hull outlines.
- [Warping 3D text in a glass torus (Codrops, 2025)](https://tympanus.net/codrops/2025/03/13/warping-3d-text-inside-a-glass-torus/): refraction through transmission materials.
- [Volumetric lighting thread (three.js forum)](https://discourse.threejs.org/t/volumetric-lighting-in-webgpu/87959): froxel volumetrics, Wronski 2014, Hillaire 2015. A route to real light shafts.
- [Drift Phonk (Aesthetics Wiki)](https://aesthetics.fandom.com/wiki/Drift_Phonk): the genre's sound and visual language.

## What real phonk reels showed (contact sheets, 2 fps)
- A single hero in low-key light on a dark ground, with rim light doing the modelling.
- Macro detail alternated with the wide: a headlight, then the whole car.
- They rely on hard cuts (5–8 per 10 s). We replace most with carried whips and dives, per the no-sudden-cuts rule.
- Clean 3D reels (C4D Journey) win on materials, floor reflection and shallow focus rather than on raw speed.

## Next upgrades to try
1. Real planar reflections on floors (the stage and road would gain most).
2. Ambient occlusion so objects sit in their worlds.
3. Froxel volumetric light for beams and god rays.
4. GPU particle simulation baked at load for smoke and debris.

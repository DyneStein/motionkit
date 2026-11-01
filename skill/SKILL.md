---
name: motionkit
description: Professional brand reels and product-launch films (the style of a Google or Apple announcement): fast kinetic type, a travelling 3D camera, code-drawn UI, cut to the user's music. Asks a few questions first (brand, pace, look, music), then builds with HyperFrames. Use when the user asks for motion graphics, a brand reel, promo, launch or explainer video, an animated logo reveal, or a video set to their track.
---

# MotionKit

Kit root: the folder this skill lives in, one level up (call it `$KIT`; if the skill was symlinked, resolve the link, e.g. `~/.claude/skills/motionkit → <clone>/skill`, so `$KIT = <clone>`). It is distilled from 60 reference videos the user curated; follow it instead of generic motion defaults.

## Start here: ask, then build
**Default product: a brand reel.** Think of a company announcing something, not a short film. Before building, ask one round, skipping anything already answered. Use whatever question tool the host has (AskUserQuestion in Claude Code); in an agent with no way to ask, use the defaults and state them.

0. **Kind of film:** a fast brand reel (the default), a **slow, cinematic film in an original style** (see *Original styles*), or a cinematic 3D text film (use the `motionkit-3d` skill).
1. **Brand:** name, what it does, who it is for, and the one line they want remembered. Ask for a real logo and real facts if they have them. Never invent claims or numbers for a real company: use a placeholder and flag it.
2. **Pace:** **Fast** (recommended: a new beat every 2 s, built for reels), **Medium**, or **Slow** (calm, premium, about 2× longer).
3. **Look:** pick from the presets below, or describe one.
4. **Music:** the path to their track. Never generate or synthesise music. If they have none, ask for one.

Also confirm the format if it is unclear. The fast engine builds vertical 1080×1920 today. For landscape, adapt a sample in `$KIT/samples`, such as `d-saas-tally`, and say so.

### Original styles: slow, cinematic, polished
The calmer films the kit began with. Choose this when the user wants premium and unhurried rather than fast. It is a different look from `--pace slow` in the fast engine, which is a slower brand reel.

| Style | Look | Format |
|---|---|---|
| `tally` | Breathing gradient, travelling camera over kinetic type, real UI | Landscape, 27 s |
| `nook` | One object morphing into the next, near-still camera | Vertical, 26 s |
| `aura` | Neon rim light, dark and glassy | Vertical, 27 s |
| `lumen` | Warm ember glow, editorial act structure | Vertical, 31.5 s |

```
python3 $KIT/originals/new_original.py <outdir> --style tally --song <file> --rename Tally=<Brand> --title "<Brand>"
```
This maps the song, picks the window that lands the brand reveal on one of its biggest moments, and snaps the film's events to real hits. Then rewrite the copy, palette and mark in `compositions/*.html` for the actual brand: `--rename` only changes the name, and the story still belongs to the sample until you do. Build further from `styles/STYLES.md` and `grammar/` using the workflow below.

Check it with `npx hyperframes check --json`, `sync_report.py`, `research/sync_check.py`, and `research/readable_check.py <render>` (add `--allow-graphics` for object-led films like `nook`).

**Music matters here. Say this to the user before building.** These styles suit calm or steady music, and match the polish of the originals on any track, but they have few visual events, so they do not lock to dense music. Measured on phonk, with the target at ×1.35: Lumen ×1.17, Nook ×0.87, Harbor (`tally`) ×0.76, Aura ×0.59. For comparison, the original Tally on its own steady track scores ×1.65. Widening the snapping did not fix it and made Aura worse. For hard-hitting music with tight sync, recommend the fast engine at `--pace slow` or `medium`.

### Fast engine: `$KIT/fast-type`
Everything is type and code-drawn UI. It needs no downloaded models.
```
python3 $KIT/fast-type/new_reel.py <outdir> --preset <name> --song <file> --pace fast --title "<Brand>"
```
This cuts the song's strongest window to fit the script, then writes the project. Next, rewrite `film.js` in the project: `beats` holds their story, `themes` their palette, `tokens` their fonts, and `MARK` their logo as SVG.

| Preset | Look | Suits |
|---|---|---|
| `01-noctra` | Night indigo with a bright flip, grotesk | AI, research, dev tools |
| `02-vantyx` | Clinical white, acid green, quirky display | Software, health, data |
| `03-ravik` | Black and signal red, poster caps | Security, finance, urgency |
| `04-forja` | Ivory and coal, editorial roman | Fitness, fashion, craft |
| `05-ampora` | Aubergine and amber, stadium caps | Audio, events, consumer hardware |
| `06-zapto` | Hazard yellow and black, ultra-wide | Energy, mobility, bold launches |
| `07-aurelle` | Dawn gradients, soft serif, glass cards | Wellness, lifestyle, beauty |
| `08-kuryr` | Midnight and hot coral, racing caps | Delivery, marketplaces, speed |

**Story shape:** hook, tension, `logo` ("Introducing…"), product beats, proof, `end` with CTA. Keep lines to 5 words.
**Beat types:** `stack`, `track`, `giant`, `slot`, `swap`, `search`, `counter`, `gauge`, `toggle`, `toasts`, `checks`, `chart`, `player`, `orbit`, `logo`, `end`.
**Audio first (`motionkit-audio`):** `new_reel.py` maps the song and the Director lays scenes on its real hits, with the hero on the strongest it can reach. Open `assets/song-graph.png` and read the cue sheet it prints.

**Director questions:** `node $KIT/fast-type/director.mjs --questions` prints JSON questions (camera feel, what lands on the biggest hit, music feel, series). Ask them in a second short round, or skip them if the user wants no questions; defaults apply. If the question tool caps options (AskUserQuestion allows 4), offer "Director picks" plus three that suit the brand, and let "Other" cover the rest. Then:
```
node $KIT/fast-type/director.mjs --answers '{"camera":"snap","hero":"logo","sync":"balanced","series":"vary"}' <project>
```
Answers are saved in the project and reused on re-runs.

**Director (`director.mjs`, run automatically by `new_reel.py`):** decides how each film is shot, so no two look alike. It picks the least-used options from a saved ledger (`director-ledger.json`) and writes `assets/plan.js`:
- Camera personality: `glide`, `snap`, `crane`, `orbit`, `plunge`, `spin`
- Rhythm: `even`, `longshort`, `accel`, `syncop`
- Type reveal: `depth`, `rise`, `letters`, `squeeze`, `scramble`, `ink`, `slam`
- Element variants: charts (line, bars, ring, steps, spark), controls (cursor, tap, slider, button, key, knob, segment), counters (bar, ring, odometer, plain), lists, notifications, swaps, search, gauges, player, logo, slot, giant type, sentences

**Re-run it after changing a script:** `node $KIT/fast-type/director.mjs <project>`. Read its similarity line: keep the worst pair under about 0.4. To add variety, add a variant to the engine and list it in the Director; do not hand-assign the same choice to every film. Set a beat's look by hand only when the user asks for it.
**Signature:** end cards carry "Made with MotionKit". Keep it unless the user asks otherwise (`signature: false`).

### Quality gates (run all before delivery)
First time only: `cd $KIT/fast-type && npm i`.
- `node $KIT/fast-type/visibility.mjs <project>`: **nothing useless on screen.** Target: readable at least 80% of the film, gaps about 0.5 s or less, overflow 0, **pre-shown 0** (nothing may show its finished state before its animation), **short holds 0** (finished content stays on screen before the camera leaves; giant words show their first and last letters). If it fails, fix the film rather than the check.
- `python3 $KIT/research/readable_check.py <render.mp4>`: OCR on the rendered frames (macOS Vision or tesseract), for any film. It reads pixels, so blurred text fails just as it does for a viewer. Add `--allow-graphics` for object-led films.
- **Motion rule:** action starts after the camera arrives, and the camera leaves after the content finishes. A cursor or finger only exists once it enters.
- Sync: `python3 $KIT/audio-map/sync_report.py <render> <project>/assets/audio.json` and `python3 $KIT/research/sync_check.py <render>` (lift at least ×1.35). Numbers do not settle it: **ask the user to listen**.
- Pace (`grammar/10-fast-3d.md`): mean motion about 3–8 for fast, about 1–3 for slow. Over 15 reads as chaos.
- Look at frames yourself, including mid-whip and every end card.

`check --json` reports `gsap_timeline_not_registered` for this engine because it registers from a script. The render still works; confirm by rendering.

**Cinematic 3D films** have their own skill, `motionkit-3d`. Do not mix them into a brand reel unless asked.

## Non-negotiables (the user's standing preferences)
1. **No sudden cuts.** Every scene change is carried by something on both sides of the seam (`$KIT/grammar/01-continuity.md`). Max ⅓ of seams may be hard cuts, and only on a strong beat.
2. **Liquid, fluid, rounded.** Long-tail ease-outs, squash/stretch on contact, material changes before shape, blur as glue (`02-motion-easing.md`).
3. **Never generate or synthesise music.** Use the user's track. If none is given, ask for one or offer a reference track from `$KIT/music/` (private use only) — say so plainly.
4. **Camera decided by content (rounds 3–4):** plan a varied route (never the same direction twice in a row: trucks L/R, pedestals up/down, diagonals, pushes, pulls, holds) and alternate camera beats with element beats where polished elements interact under a still camera; sync events to the music (`sync_check.py` lift ≥ ×1.35; `beatSync()` for ambient tracks, beat grid for rhythmic ones). text-driven films → travelling follow-cam that GLIDES (spline `e:"glide"` through word targets, bell eases between regions — never per-word hops); element-driven films → near-locked camera with only motivated, seeded moves (`camSeed`, `seed`) — never travel for its own sake, never a repeated pattern. Earlier rule, still true for text films: (round 2: "it's just the perspective, the camera isn't moving"): follow-cam on the active word/protagonist across a world bigger than the frame, carrier travel between stations for single-object stories, parallax reference layer always (`$KIT/grammar/08-camera.md` § v3, `$KIT/research/camera-notes.md`, primitives §19–20). Also: (the user called its absence a "MAJOR MAJOR MAJOR FLAW"): build every film as a 3D world seen through `camera-rig.js`; camera moving ≥ 65 % of frames (references: median 77 %, measured with `research/camera_motion.py`); captions ride the world, dwells keep travelling, dwell-and-sweep rhythm, ≥ 3 depth layers with parallax, DOF, handheld drift, motion blur on sweeps (`$KIT/grammar/08-camera.md`).
5. **Polish bar** (`$KIT/grammar/09-polish-bar.md`): tight glows only (no halos, never scale a glowing element, no large SVG blur filters — gradients + grain); container morphs are SVG geometry so corners stay round every frame (no clip-path reveals); text-bearing UI arrives from depth/soft focus — no scale-pops, no tilted sticker layouts; every flat object gets shade + rim + contact shadow.
6. **Professional elements and fonts:** build UI/3D pieces from `$KIT/elements/` (see `elements/showcase/` and `research/element-notes.md`); type from `$KIT/fonts/FONTS.md` — never generic defaults.
7. **Professional finish:** one accent per line, italic-serif or weight-jump emphasis, every frame has ≤ 3 focal elements, a persistent constant (canvas, title, horizon or fog) across the film.
8. **Reels first** unless told otherwise: 1080×1920, text in the 168–1330 px band, ≤ 5 words per line, nothing under 28 px, frame 0 is the hook (never black, never a logo).
9. **Round 6:** brand reels first, fast, code-drawn; keep the 3D-film camera feel but nothing may move without something readable (see the quality gates).
10. **Never push to GitHub without asking first.**
11. Be token-efficient: one scene file per chapter (or one for a whole continuous morph), snapshot only state changes.

## Workflow
1. **Brief:** the questions in *Start here*. One round.
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
Read `$KIT/research/build-log-round6.md` before extending the engines: it records every bug, dead end and open problem so far. Add to it whenever a build teaches something new, including failures.

When the user adds new reference videos: make contact sheets (timestamped, 0.33–1 s sampling) + 10 fps strips on transitions, write a note per video in `research/video-notes/`, add rows to `research/INDEX.md`, and fold new patterns into the grammar/style files. When a build teaches a new bug or primitive, add it to `07-engineering-pitfalls.md` / `PRIMITIVES.md`.

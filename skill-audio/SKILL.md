---
name: motionkit-audio
description: MotionKit's audio analyser. Reads a song the way an editor does: every hit with its strength, sections, biggest drops and peaks, the best window to use, and a song graph image. Use before cutting any video to music, when the user asks where a song's drops or peaks are, which part of a track to use, or why a video feels off-beat. Part of MotionKit; works alone too. Analyses music the user supplies and never generates any.
---

# MotionKit Audio

Kit root: the folder this skill lives in, one level up (call it `$KIT`; if the skill was symlinked, resolve the link, e.g. `~/.claude/skills/motionkit-audio → <clone>/skill-audio`, so `$KIT = <clone>`).

**The rule: the song decides the timing.** Find its peaks first, then put the most important content on them. Never lay a film out on a calculated grid and hope it fits.

## Run it
```
python3 $KIT/audio-map/audio_map.py <song> <outdir> [--len 30] [--start SEC] [--no-cut]
```
Needs ffmpeg, numpy, scipy and Pillow.

| Output | What it holds |
|---|---|
| `song-graph.png` | Look at this first, and show it to the user. Loudness, sections, every hit by strength, numbered biggest moments, the chosen window |
| `audio-map.json` | Whole song: tempo, sections, `moments` (ranked peaks and drops), `hits` (`t`, strength `s` 0–1, band `kick`/`snare`/`bell`/`hat`), window and alternatives |
| `audio.json`, `song.m4a` | The chosen window, in film time, ready for the engines |

## Using it
- **Hook:** start the window on or just before a drop, so the first big hit lands within about 2 s.
- **Biggest moments:** logo, hero number, payoff. Everything else takes the next strongest hits.
- **Small hits:** words and ticks. Scale the visual response by `s`, so a hard hit punches and a soft one barely moves.
- **Quiet stretches:** let text be read. Do not fill them with motion.
- **Anticipate:** an element should look complete *on* the hit, so start it about 45 ms early. A long ease-out reads as arrived before its final key, so place that key after the hit.

## Check the result
```
python3 $KIT/audio-map/sync_report.py <render.mp4> <project>/assets/audio.json
python3 $KIT/research/sync_check.py <render.mp4>
```
Slow original-style films use this too: `originals/new_original.py` aligns the brand reveal to a peak and snaps events to hits. They answer only the strongest accents, and do not lock tightly to dense tracks such as phonk: expect a low `sync_check` score there.

`sync_report` asks whether the picture answers the song's biggest hits. `sync_check` asks whether visual events fall on any audio event.

## Limits
- These are measurements, not ears. **Passing numbers do not prove it feels right; ask the user to listen.**
- Tempo is the weakest output, especially on swung or slowed tracks. Use hits for timing, not the tempo grid.
- Section names only describe loudness (`quiet`, `mid`, `loud`), not verse or chorus.

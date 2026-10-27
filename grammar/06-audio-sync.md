# 06 · Audio & sync

**Rule from the brief:** never generate music. Use the user's supplied track, or (for samples) a track copied from a reference clip. Synthesised music sounds robotic; keep it out.

## Track library used while developing the kit (not distributed — these were third-party recordings; bring your own music)
| File | From | Character | Tempo / grid | Structure (sections, s) | Best styles |
|---|---|---|---|---|---|
| `v00-sample-this-100bpm.mp3` | @soundsofgiyu "Sample this" | warm soul/hip-hop groove, funk-adjacent | **100 BPM steady** (0.6 s beat, 2.4 s bar), downbeats ≈ 1.325 + 2.4·n | A 0–10.3 · B 10.3–27.45; peak 25.7 | Breathing-Gradient SaaS, Bold Brand, Pastel Playful |
| `v52-ember-cooking.mp3` | louisraille "Opus is cooking" | soft cinematic ambient, warm | no steady beat → cut on sections/onsets | A 0–11.5 · B 11.5–24.5 · C 24.5–31.7 | Ember Flow, Single-Line Story |
| `v06-bentomotion-ambient.mp3` | Bentomotion Apple morph | calm airy ambient, 104 s | no steady beat | A 0–9 · B 9–17 · C 17–25.5 · D 25.5–33.5 · E 33.5–50.5 … | Morph Continuum, Monochrome Macro |
| `v43-youmotion-neon.mp3` | youmotion "Daily dose" | dreamy synth, pulses | no steady beat | A 0–13.5 · B 13.5–26.5 · C 26.5–31 · D 31–41 | Neon Rim Glow |
| `v11-youmotion-thought.mp3` | youmotion "Thought in motion" | minimal synth | no steady beat | A 0–8.5 · B 8.5–17.5 · C 17.5–32.8 | Neon Rim, Glass Orb |

(Analysed with `npx hyperframes audio … --only kind,bpm,beats,downbeats,sections,loudness`.)

## Sync procedure
1. `npx hyperframes audio <track> --only sections,onsets,moments,beats,downbeats --json`.
2. **Rhythmic track** (bpmConfidence high): scenes start on downbeats; accents (pops, colour swaps, word arrivals) on beats; moves that must land on a hit start 40–190 ms early; the hit itself is a 0 ms `set`.
3. **Ambient track** (no steady beat): scene changes on section boundaries; 1–2 hero events on the strongest onsets; between them motion is continuous and slow (the music is a bed, not a metronome).
4. Fade in 0.3–0.4 s, fade out 1.2–1.5 s; end the film on or just after the track's final peak/tail.
5. Add sound effects only if supplied/requested (whooshes on zoom-throughs, clicks on presses) — never synthesise music.

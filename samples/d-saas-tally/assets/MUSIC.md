# Put your music here

Save your track as `assets/music.mp3` (the composition references that file). MotionKit ships no music.

This sample was cut to a specific track during development, so after swapping in yours:
1. `python3 ../../research/audio_hits.py assets/music.mp3 <duration>` → paste the array into the scene's `HITS` constant (ambient tracks), or
2. `npx hyperframes audio assets/music.mp3 --only bpm,beats,downbeats --json` → update `beat()` / `bar()` (rhythmic tracks, see the Tally sample).

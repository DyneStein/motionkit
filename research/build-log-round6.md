# Build log: fast reels, 2026-11-01

Everything that happened while building the 3D films (`lens-3d/`) and brand reels (`fast-type/`), including what went wrong. Read this before extending either engine.

## What the user asked for, in order
1. Films were "not fast", elements not "professional". One vertical video per song, camera "extremely important".
2. Explore widely and write everything useful down. Never push to GitHub without asking.
3. Loved the result, but it depends too much on downloaded assets. Wanted: Tally-style text movement, fast, on the phonk tracks, not much 3D.
4. Focus is **brand reels**, "like Google announcing a new product", not short 3D movies.
5. The skill must ask a few questions, including pace, then deliver professional results.
6. Add the MotionKit name. Keep the 3D films' camera, but things must stay visible.
7. **Nothing useless:** no camera moving around with nothing readable.

**Lesson:** the first three rounds of work went into the wrong product. A 2-line question at the start ("is this a brand film or an art film?") would have saved it. The skill now asks.

## Measured results
| Set | Mean motion | Camera moving | Beat sync | Notes |
|---|---|---|---|---|
| Old DenseFusion reels | 0.34–1.27 | n/a | n/a | Too slow |
| Tally sample | 2.23 | n/a | n/a | The look the user likes, too slow |
| Viral reels (reference) | 4.8–5.7 | n/a | n/a | 5–8 hard cuts per 10 s |
| Phonk-Reels (3D) | 8.5–26.7 | n/a | ×1.09–×1.41 | Over-fast, 110–135 MB each |
| Fast-Reels (brand) | 2.8–4.5 | 90–96 % | ×0.94–×1.52 | 83–87 % readable, 8–12 MB, about 50 s render |
| Same engine, slow pace | 2.02 | n/a | ×1.44 | 92 % readable, 63 s film |

**Open problem:** Ravik (×0.97) and Ampora (×0.94) still fail sync, and Vantyx (×1.30) and Forja (×1.26) fall short of ×1.35. Arrivals land on kicks, but each whip *starts* off-beat and the detector counts that as a visual event. Next thing to try: snap whip starts to onsets too. These tracks also have dense onsets, which raises the chance baseline (Ampora 60 %).

## Bugs and how they showed up
| Symptom | Cause | Fix |
|---|---|---|
| Camera crash "reading 'x'" | `{...d, bar: fn}` overwrote the numeric `bar` | Separate names; test for NaN keys |
| All timing NaN in FastType | Read `A.barLen` from raw JSON that only has `bar` | Same trap, opposite direction |
| Shader "`#` invalid character" | Prepended GLSL without a newline before `#include` | Always add `\n` |
| opentype.js GSUB error on Grenze Gotisch | `stringToGlyphs` hits unsupported substitution | Use `charToGlyph` per character |
| Glyph holes filled | TrueType and CFF wind opposite ways | Pick `toShapes` from the largest contour's sign |
| Type sits in the top of the frame | Baseline at y=0 | Centre on cap height |
| Arches render as solid walls | Hole path extended past the outer shape | Keep holes strictly inside |
| Speaker cones invisible | Cabinet front in front of the cone | Set the cabinet back |
| Katana invisible at frame 0 | Model's long axis is Y | Inspect axes; rotate |
| Film 8 render 10× slower | 700 instances of a 42k-triangle barrier, 24× per frame | Recycle 80 around the camera |
| 534 MB file for 30 s | Per-frame grain at CRF 16 | Lower grain, `--crf 20 --max-bitrate 35M` |
| HyperFrames "missing timeline" | No `__timelines` text in `index.html` | Inline hook; the engine registers through it |
| `gsap_timeline_not_registered` in `check` | False positive: registered from an external script | Confirm by rendering |
| `z-index: -1` warning on pills | Pill background behind its text | Use 0, and raise the text to 1 |
| White page and Times in preview | Own preview server sent CSS with the wrong type | Serve `.css` and `.woff2` correctly |
| Contact sheet missing rows | `vstack` defaults to 2 inputs | `vstack=inputs=N` |
| zsh `no matches found` killed a command | Unmatched glob errors in zsh | Check with `ls`, or guard it |
| `Audios` and `audios` both listed | The Mac disk is case-insensitive: one folder | Not a duplicate |
| `rm -rf $VAR/$x` blocked | Safety check on unguarded variables | Use `"${VAR:?}"` or write to a new folder |
| Wait loop never finished | It watched for a line from a render queue that had been killed and restarted | Write the done marker yourself when restarting |

## Design failures (the expensive ones)
- **Overcorrection.** First pass of the 3D engine had a mean motion of 21 and read as noise. Fast means hold, then whip.
- **Overlit everything.** Light values that looked reasonable blew out to white. Start low.
- **Flat chrome.** Extruded faces mirror one direction, usually black. Rough faces, mirror bevels.
- **Metal with a black base colour** reflects nothing.
- **Fake particles.** Sparks parked in front of the lens read as a firework; smoke near the lens as dots. Removed.
- **Blackletter** T read as C, so LETAL looked like LECAL.
- **Asset dependence.** Hero-object films are only as good as the download, and licence-bound.
- **Long end cards.** Scripts ran out of beats and the logo sat for 10 s. Budget the beats.
- **Single-word camera.** Close tracking showed one chopped word at a time. Keep the newest word near the right edge with context visible.
- **Rotation order.** `translate` then `rotate` swung stations by hundreds of pixels. Rotate last so stations pivot around the lens.
- **Overflow from push-ins.** Text fitted to the frame grows past it as the camera dollies. Fit to about 88 %.
- **Depth flourishes competing with text.** Fly-by letters now appear only during the whip.
- **Starting a whip early** covered reading time. Arrive on the kick, then settle.

## Tools worth keeping
- `fast-type/visibility.mjs`: readable share, longest gap, overflow. This is the "nothing useless" check.
- `research/sync_check.py`, `research/camera_motion.py`, and the pace numbers in `grammar/10-fast-3d.md`.
- A quick frame previewer is far faster than `snapshot` when iterating: see `lens-3d/preview.mjs`.

## Environment facts
- M2, 8 GB. WebGL runs on the GPU in headless Chrome (ANGLE Metal). `-w 1` for WebGL; DOM films use the default workers.
- HyperFrames `check` passes through external scripts blind; rely on real renders.
- `hyperframes audio` beat detection fell back to signal analysis here, so the kit uses its own `prep_song.py`.

## Licensing notes
- Poly Haven is CC0. Khronos varies per model: DamagedHelmet includes CC-BY-NC and the dragons carry Stanford terms, so check each `LICENSE.md`.
- Fictional brand names were not trademark-checked. Real songs are not cleared by this kit.

## Round 7: the user's review, and what it taught
The user found four things the automatic checks had passed:
| User saw | Real cause | Now |
|---|---|---|
| Mouse already on screen | The cursor sat at its CSS default until its tween began | A pointer only exists once it enters |
| Strike line already on the word; graph line already drawn | `fromTo` with `immediateRender: false` shows the finished state until the tween starts | Every animation applies its start state at build; the checker verifies the state just before each one |
| Giant word unreadable | Camera started mid-word and left early | Starts just before the first letter, ends with the last in frame, then holds; word size capped by available time |
| Every film looks the same | One camera style and one version of each element | Director engine and ledger |

**Lessons:**
- A check only finds what it measures. Readable-time and overflow passed while the animations were visibly wrong. When the user reports a class of bug, add a check for that class.
- Sampled contact sheets hide timing bugs. Inspect the frames *just before* an action, not only the action.
- Diversity must be measured across films: similarity between films (Jaccard over their choices), with a ledger shared across runs.
- A rhythm can squeeze a beat too short to read, so the Director enforces a minimum per beat from its word and item count.
- With a rolling camera (`spin`), a station's local axes rotate: convert sentence and giant-word offsets into world space or the camera loses the text.
- The first Director pass had similarity 0.23 mean, 0.38 worst, with 6 of 6 camera personalities used.

### Round 7 final numbers
| Film | Camera | Rhythm | Mean motion | Camera moving | Sync | Flagged as cuts /10 s |
|---|---|---|---|---|---|---|
| Noctra | plunge | accel | 7.3 | 93 % | ×1.07 | 3.3 |
| Vantyx | orbit | even | 3.0 | 83 % | ×1.05 | 0 |
| Ravik | crane | syncop | 2.7 | 84 % | ×1.07 | 0 |
| Forja | glide | longshort | 3.1 | 85 % | ×1.22 | 0 |
| Ampora | spin | accel | 3.4 | 82 % | ×0.85 | 0.3 |
| Zapto | snap | longshort | 4.0 | 83 % | ×1.35 | 2.6 |
| Aurelle | glide | even | 3.0 | 84 % | ×1.37 | 0 |
| Kuryr | plunge | syncop | 4.2 | 93 % | ×1.27 | 3.9 |

**Still open: beat sync.** Six of eight miss ×1.35. Two attempts did not fix it: landing arrivals on kicks, and timing whip midpoints to onsets. Note the metric counts image-change peaks; a whip's peak is mid-move while the *felt* hit is the landing, so it may undersell the sync. Needs a human listen. Check it by ear before more engineering.

**Other things that went wrong:**
- A render queue started with `nohup ... &` in a tool call lost its first job (`render_cancelled_parent_exited`), and the film list still showed an old MP4 of that name. Always check exit codes and timestamps before opening or reporting a file. The stale Noctra was opened once by mistake.
- `snap` whips at 0.27 s with `expo.out` read as hard cuts. Slowed to 0.34 s, `power3.out`.
- Dives through objects (and fast theme flips) register as "cuts" on the detector; inspect the frames before judging.
- `ffmpeg -sseof -.7` fails (use `-0.7`); `-vsync` is gone in current ffmpeg (use `-fps_mode`).
- `head -0` is illegal on macOS.

## Round 8: timing from the song
User verdict: "the sync aren't that good"; asked for an analyser that reads the song graph and puts important content on the high peaks; Director should ask questions; and a separate 3D skill in the package.

**Root causes found by looking at the timing, not just the score:**
- Scenes sat on a calculated bar grid. Slowed funk does not hit where a grid says.
- All hits were treated alike, so the camera punched equally on a hat and on a drop. Now each hit has a strength, and the response scales with it.
- Long ease-outs read as arrived about 80 ms before their final key, so moves felt early then drifted. The key now lands after the hit.
- Onset times ignored the STFT window centre, an error of about 23 ms.
- Elements reached full visibility after the hit. They now start 70 ms early, so they read as complete on it.

**What was built:**
- `audio-map/audio_map.py`: log-spectral flux per band with adaptive thresholds, strength per hit, sections, ranked moments, window choice, `song-graph.png`.
- Director cue sheet: dynamic programming over real hits, weighted by how important each scene is, with hard minimum lengths from word counts.
- `audio-map/sync_report.py`: are the song's biggest hits answered by the picture?
- Director questions as JSON (`--questions`, `--answers`), so any agent can ask them, with defaults when nobody can answer.
- Skills: `motionkit` (brand reels), `motionkit-audio`, `motionkit-3d`.

**Pitfalls:**
- The cue sheet first produced a 0.1 s scene: a soft penalty lost to the reward for a big hit. Minimum length must be a hard constraint.
- Rank is misleading on four-on-the-floor tracks, where many hits are nearly equal. Report strength.
- Scripts can have more scenes than fit. The planner now tightens them and warns, instead of silently falling back to the grid.
- Tempo octave errors (98 detected as 65 BPM) break anything timed in bars, so the search range is now 72–170 BPM, and hits rather than tempo drive timing.
- Render queues inside a long tool call can outlast its timeout. Run them as a background task.

## Publishing notes
- The public copy must stay muted (music is not cleared) and cannot hold the 110–135 MB 3D masters (GitHub rejects files over 100 MB). The README uses 720p muted MP4s and 270 px previews; masters with sound stay outside the repo.
- Film grain is expensive to compress. Denoise (`hqdn3d`) before making previews: 3D previews fell from 8 MB to between 2 and 7.5 MB.
- Fontshare fonts may not be redistributed, so `fast-type/fonts` in the public copy holds only OFL faces and `new_reel.py` falls back to `fonts/` with a clear message.
- Before offering a push, run a fresh-copy install: fonts, assets, one brand render, one 3D preview. It caught a wrong download size.

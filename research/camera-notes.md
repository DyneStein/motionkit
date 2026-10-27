# Camera notes — how the references actually move the camera

Review round 2 (user): *"the camera isn't moving, it's just the perspective … you are changing the angle of viewing, not the position of the camera"* — pointing at v27's tracking sentence ("…become anything real").

Method: `camera_moves.py` segments each clip's global motion into moves (direction, speed in % of frame width per second, push/pull in % scale per second, ease shape), then 6 fps strips of the strongest moves were inspected by eye. Raw move lists: `camera_moves_raw.txt`. Directions are *camera* directions (truck R = camera moves right, content slides left).

## The five findings that matter

1. **Follow-cam on the active point.** The camera's position is driven by *where the action is*: the typing caret, the newest word, the moving protagonist. That point is held near a fixed spot in frame (usually ~60–70 % across, or centre), so the world slides past. v27, v46, v43, v61, v40, v11, v10.
2. **The camera is close.** Type and UI are larger than the frame and get cropped by its edges (v62, v61, v40, v27). Being close is what makes travel visible; a fully contained layout can only "tilt".
3. **Moves decelerate.** 40–80 % of all moves arrive fast and settle slowly (expo/power3 *out*). Symmetric ease-in-outs are a minority. Each new word or beat = a quick hop that settles.
4. **Lateral travel dominates.** Trucks 10–30 % W/s typical, whips 40–60 % W/s, pedestals 10–25 % W/s, pushes only 2–13 %/s. Rotation (orbit/tilt) is a seasoning, not the move.
5. **Things arrive by the camera reaching them.** New elements enter from the frame edge because the camera travels to where they already are; the previous element leaves off the opposite edge, usually softening (focus fall-off), never fading in place.

## Per-video camera breakdowns (strongest camera work first)

### v27 · researchly (122 s) — ⭐⭐⭐ the tracking-sentence master
- 57 moves in 122 s; camera moving ~85 % of the time. 46 % decelerating, 24 % accelerating, 21 % ease-in-out.
- **5.6–13.7 s:** "Before they become anything real." — words appear one by one at the right end; the camera trucks right **25–29 % W/s in hops**, each hop decelerating as the word lands; the newest word sits at ~70 % frame x; the sentence's head slides off the left edge with a soft fade/blur (left-edge focus fall-off). Type is ~9 % of frame height — large.
- **20.9–23.1 s:** "But because the system isn't there." — a glossy blue sphere rolls along the baseline *pushing* the words into place; the camera chases the sphere at **50 % W/s** (fastest move in the film), decelerating at the end. Motion-trail lines behind the sphere.
- **Then a camera drop (pedestal) into the dark act** — the white canvas falls away.
- Long UI sections (55–85 s): camera trucks between left-aligned headlines and the 3D phone, small pedestals as the phone scrolls; truck R/L alternate 10–25 % W/s.
- Logo end: slow pull-out 7 %/s.

### v46 · HUMAIN FABRIC (105 s) — ⭐⭐⭐ constant-speed tracking + inline orb
- 45 moves; long **constant** trucks: 20.7–24.7 s truck 26 % W/s at constant speed while "AI [orb] remains another unfinished initiative" builds; the newest word stays at ~85 % x, the head scrolls off left; a spinner lands at the sentence end as the camera settles.
- 34.9–38.1 s accelerating truck 28 % W/s across "The intelligent foundation that prepares enterprises data [orb] in minutes." — the orb travels with the camera (it is the follow target).
- Push-in 13 %/s then 4.5 s pull-out 12 %/s for the stacked-slab reveal (85–92 s).

### v43 · youmotion "Daily dose" (41 s, vertical) — ⭐⭐⭐ the camera travels a horizontal world
- 3.0–7.2 s **truck 22 % W/s for 4.2 s**: the "Of Vitamins" pill exits left, empty dark world passes, the star outline enters from the right and is carried to centre — the camera *visits* things.
- 20.4–22.5 s truck 60 % W/s (a whip) into "In A Natural Rhythm" — the black pill is far wider than the frame, the camera slides along it while the word fill runs.
- Mostly decelerating (73 %).

### v11 · youmotion "Thought in motion" (33 s, vertical) — ⭐⭐ follow the protagonist
- Opening pedestal up 59 % W/s, then pedestal down 72 % W/s (big vertical whips following the guide dot).
- 17.8–22.1 s camera trucks 31–35 % W/s with the pill that hangs on a string: the pill swings, the camera follows its anchor dot; the next pill ("Shape meaning") enters from the top-right corner as the camera climbs to it.
- Element colour flashes (blue/cyan fill) happen while the camera is moving — events and travel overlap.

### v02 / v23 · UI-world lyric videos (37 s / 34 s) — ⭐⭐ whip-pans between UI places
- v23: 3.2–4.4 s truck **60 % W/s** whip; 26.0–27.0 s 44 % W/s constant — the camera travels between apps laid out side by side, motion blur heavy.
- v02: pedestal up 19–24 % W/s into the next window; truck 25–27 % W/s along a code editor; every scene is reached by travelling, not cutting.

### v62 · Vercel (9 s) — ⭐⭐ macro → pull-back
- Starts **macro** on a nav pill (frame filled by blurred UI), pushes into the ▲ logo until it fills the frame, then the logo becomes the corner of a deployment card while the camera **trucks right 12–15 % W/s along the card title** ("demo-project" cropped by the frame edge) and pulls back to reveal the card.
- 4.2–6.5 s truck 15 % W/s decelerating across the v0 prompt as text types (caret follow).

### v61 / v39 · Claude teasers (11 s / 14 s) — ⭐⭐ caret follow
- v61 2.6–5.6 s: after pushing into the prompt box, the camera **trucks right 15 % W/s with the typing caret** ("prints money|" stays near the right third), the greeting slides out left; 9.2–10.8 s truck 8 % W/s + pedestal while code streams.

### v40 · Nike (17.5 s) — ⭐⭐ ride the search bar
- 0–4.6 s truck 26 % then 10 % W/s: camera rides along the search bar as "Air Jordan" types; the bar extends beyond the frame both sides; then the bar shrinks into an arrow and the camera settles on "→ Wide selection".
- 11.0–12.6 s ease-in-out truck 24 % W/s + pedestal 13 % W/s across the colour-swatch strip.

### v10 · Island (103 s) — ⭐⭐ pedestal with streaming content
- 65.0–68.2 s **pedestal down 22 % W/s, constant**: the agent's chat answer streams line by line and the camera slides down with it (like reading).
- 19.3–21.1 s truck 28 % W/s accelerating across UI tables; frequent small pedestals between left-aligned headlines and landscape cards.

### v16 · Spotify (8.6 s) — ⭐ continuous slow travel
- Two long moves cover the whole film: truck 7 % + pedestal 8 % W/s (2.6 s) then truck 10 % + pedestal 6 % (4.1 s), both decelerating — the camera never stops.

### v53 · AirPods spec (11 s) — ⭐ product orbit by travel
- 4.7–6.6 s constant truck 13 % W/s past the ear-tip line-up; 6.6–9.4 s pedestal up while the buds rise — the camera moves *with* the product.

### v41 · Superagent (15 s), v12 · ChatGPT (10 s), v44 · granola (10.5 s), v38 · holo (44 s), v31 · Codex (35 s), v07 · Blender promo (26 s), v24 · Slate (15 s), v57 · ThemeWire (20 s)
- v41: trucks 22–34 % W/s between sentence beats, push-in 10 %/s on the prompt.
- v12: 1.7–5.5 s ease-in-out truck 15 % W/s **along the prompt bar to the send button** + 5 %/s push.
- v44: pedestal up 25 % W/s + push 8 %/s from the dock to the notification, then trucks 10 % W/s across the note.
- v38: lots of pedestal 12–18 % W/s (vertical feature tour), pull-outs 9–13 %/s on reveals.
- v31: gentle — trucks 4–15 % W/s, pull-out 10 %/s as the window shrinks into the silk gradient (the drama is in the background, not the camera).
- v07: Blender camera — constant slow moves 3–4 % W/s with push 3–4 %/s, one whip 28 % W/s; the 3D scene gives parallax so even slow travel reads.
- v24: pedestals 6–10 % W/s with pushes 4–7 %/s while 3D words tumble.
- v57: whips 28–37 % W/s between regions of the single orange line's drawing.

## What to do in our builds (→ grammar/08-camera.md v3)
- Lay the film out as a **wide/tall world** (2–4× the frame) with content *bigger* than the frame where it matters.
- Drive camera x/y from the **active point** (caret, newest word, protagonist) with per-step **decelerating** eases; hold it at ~62–70 % of frame width for left-to-right builds.
- Travel between beats **10–30 % W/s**; whips 40–60 % W/s with motion blur; pushes small (≤ 10 %/s).
- Let things enter and leave through the frame edges; soften (blur/fade) what is leaving at the trailing edge.
- Rotation ≤ 8° except deliberate reveals; never let tilt stand in for travel.

## Round 4 · velocity profiles (camera_velocity.py) — smoothness, not just amount
| Shot | Median speed | Micro-stops | Jerk (accel_cv) | Shape |
|---|---|---|---|---|
| v27 5.6–13.7 s tracking sentence | 18 % W/s | 0.20 | 2.1 | 5 bells over 8 s, each covering a phrase |
| v27 20.9–23.3 s sphere push | 58 % W/s | 0.24 | 3.9 | one long swell |
| v46 20.6–24.8 s inline-orb sentence | 24 % W/s | 0.13 | 2.7 | two bells |
| v61 2.6–5.6 s caret follow | 14 % W/s | 0.16 | 1.7 | small bell then a big bell |
| v43 3.0–7.2 s pill → star | 12 % W/s | 0.30 | 2.6 | one bell |
| Tally round 3 (per-word hops) | 21–36 % W/s | **0.39–0.54** | 2.1–3.0 | spikes starting at full speed |
| Tally round 4 (glide spline) | 14–37 % W/s | 0.12–0.40 | **1.4–2.1** | smooth bells |

## Element-driven references keep the camera still
- v06 Bentomotion (flat lavender canvas): detected "moves" are the morphing object; the camera is effectively locked for 103 s.
- v52 Opus ember: 1 camera move in 31 s (14 % of the time).
- v37 illustrated coffee: 7 gentle moves in 20 s, each following an object (petal floats up, ball rolls off) — motivated.
- v53 AirPods: camera moves *with* the product as it rises/rotates — motivated by the product.

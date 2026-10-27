# 07 · Engineering pitfalls (learned building the four samples)

HyperFrames renders by **seeking** the timeline to each frame, often cold (a fresh worker jumps straight to t = 18.6). Everything below rendered correctly in a scrubbing preview *sometimes* and broke on a cold seek. Check each before rendering.

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 1 | An element that should appear late is visible from frame 0 (a ring inside the sun, a cutter circle biting the phone) | `tl.fromTo(el, {opacity: 0.8 …}, {…}, 14.9)` — **fromTo renders its FROM state immediately at build time**, so the late element shows from 0 | Put `immediateRender: false` in the TO vars of any late fromTo whose from-state is visible; or hide with `tl.set(el,{opacity:0},0)` *and* fade with a separate tween |
| 2 | Glow-filtered SVG path invisible (waveform, flat line, eyelid) | `<filter>` default region is `objectBoundingBox`; a path that starts flat has zero height → zero filter region | `filterUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"` on glow filters |
| 3 | A driven drawing shows the previous frame's value on cold seek | two tweens feed one `draw()`; the draw ran in the first tween's `onUpdate` before the second tween set its value | call `draw()` from **every** tween that feeds it (`onUpdate: draw`), or use one driver tween and derive everything from its single value |
| 4 | `gsap_callback_dom_measurement` warning | `getTotalLength()/getPointAtLength()` inside `onUpdate` | sample the path once at build into an array; look up by index in `onUpdate` |
| 5 | Pill growth rejected / janky | tweening `width`/`left` (layout) | make the element full-size and reveal with `clip-path: inset(… round R)`; glow on a sibling that scales (clip-path clips box-shadow) |
| 6 | Round-capped stroke shows a dot when "hidden" | `stroke-dasharray 0 100` + round caps | also keep `opacity:0` until it draws; for draw-on use `pathLength=100 dasharray="100 120" dashoffset="110"` |
| 7 | Text pill/caption collides with moving objects | scattered layouts measured by eye | snapshot every beat; `check` reports `content_overlap`; keep captions in their own band (reels: y 1150–1300) |
| 8 | Lines flagged `line_unread` | hold shorter than 0.5 s + 0.3 s/word | stagger arrivals faster (8th notes) rather than shortening holds |
| 9 | Sub-pixel-perfect morph seams | host scenes swapped at slightly different states | end scene N and start scene N+1 on **identical geometry** and overlap hosts by 0.1 s |
| 10 | GSAP `to` tweens on the same `attr` overlapping → `gsap_tween_tail` | shape tween and fill tween end at different times on the same element's attr | end both at the same time, or tween fill on a separate element |
| 11 | Text inside SVG `<text>` changes per frame | text set in `onUpdate` from a tweened number | fine and seek-safe as long as the text is derived only from the tweened value (odometers, temperatures) |
| 12 | `content_overlap` from scattered exit words | intentional | ignore (info level) |
| 13 | Rounded card shows square corners / cut rim while opening or folding | `clip-path: inset(… round R)` crossing the card's straight edges | morph geometry instead: SVG `<rect>` attrs (primitives §16) |
| 14 | Glow looks blocky / banded ("low poly") | large SVG `feGaussianBlur`, 8-bit gradient banding | `radialGradient` fills with eased stops + 3–5 % grain |
| 15 | Giant muddy halo | scaling an element whose `box-shadow`/blur scales with it | build the big state as its own element and crossfade |
| 16 | Elements explode in size / flip near the camera | effective z approaching the perspective distance | fade them out from effective z ≈ 350 (perspective 1500) |
| 17 | Handheld drift jumps at a scene seam | each scene's rig ran drift on its local clock | pass `t0` = scene start so drift uses the film clock |
| 18 | Depth inside a blurred container is lost | CSS `filter` flattens 3D children | blur leaf layers only |
| 19 | `motion_blur_no_movers` | the camera moves from a callback | `data-motion-blur-events="on"` with `data-motion-blur="on"` |
| 21 | Shot reads static although the camera moves | big screen-fixed captions dominate the frame | captions in the world (translateZ +35…+90) or a damped lens-follow HUD (08-camera) |
| 22 | In-world caption pushed off-frame on a push-in | caption z too close to camera + big push | caption z ≤ +40 on push-in beats; keep pushes ≤ 110 px there |
| 20 | Camera move hides a word under the HUD heading | world content travels into the HUD band | fade that region as the camera passes, or keep HUD text where the world is empty; snapshot every sweep |

Workflow that worked: write one scene → `npx hyperframes check --json 2>/dev/null` (stderr is very noisy) → `snapshot --at` every state change → read the contact sheet → fix → render.

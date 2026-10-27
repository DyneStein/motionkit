# 04 · Materials & effects — what the references are made of, and how to build each in HTML

All recipes are seek-safe for HyperFrames (pure function of timeline time; GSAP tweens on CSS vars / transforms, or an `hf-seek` canvas draw). Working code lives in `../primitives/`.

| Effect | Look | Build (HTML/CSS/SVG) | Refs |
|---|---|---|---|
| **Glow / bloom** | tight light around the subject + faint atmosphere | ≤ 25 px `box-shadow` bloom on the subject; atmosphere = multi-stop `radial-gradient` ≤ 20 % alpha. **Never** a blurred duplicate of a card, never scale a glowing element, never large SVG `feGaussianBlur` (renders blocky). See `09-polish-bar.md` | v52, v61, v62, v39 |
| **Rim-light on rounded rects** (Apple-Intelligence edge glow) | rainbow light travelling around a card/pill border | element with `padding:2px; background: conic-gradient(from var(--a), …)` + same gradient blurred 18–30 px behind; tween `--a` 0→360deg (registered `@property --a`) | **v43**, v11, v25, v35 |
| **Glassmorphism** | frosted card over photo/gradient | `background: rgba(255,255,255,.12–.22); backdrop-filter: blur(20–30px) saturate(140%); border:1px solid rgba(255,255,255,.35); box-shadow: inset 0 1px 0 rgba(255,255,255,.5), 0 20px 60px rgba(0,0,0,.18)` | v05, v10, v18, v27, v58 |
| **Reeded / fluted glass** | vertical stripes refracting a blob behind | overlay of N vertical strips, each `backdrop-filter: blur(6px)` with alternating `linear-gradient(90deg, rgba(255,255,255,.18), transparent 40%, rgba(0,0,0,.08))` highlights; or SVG `feDisplacementMap` with a vertical-bar gradient map | **v38** |
| **Contact shadow** | object sits on the ground | ellipse under the object, `radialGradient` fill (30 % → 0), rx ≈ 0.46 × object width, tracks the morph | v06, v53, Nook v2 |
| **Mesh / fog gradient (breathing)** | slow drifting colour clouds | 3–5 absolutely-positioned radial-gradient blobs, `filter: blur(80–140px)`, each drifting on its own slow sine of t (x/y ±6%, scale ±8%) | v14, v27, v16, v32, v41, v58 |
| **Liquid silk** | satin folds of light | 2–3 large blurred ellipses with skew + `mix-blend-mode: screen` sliding diagonally; or canvas noise flow | v31 |
| **Metaballs / lava blobs** | blobs that merge & split | SVG `<filter>`: `feGaussianBlur stdDeviation=18` → `feColorMatrix` alpha `0 0 0 22 -9` (goo) on a group of circles; add a specular highlight layer on top | **v52**, v11, v37 |
| **Planet / horizon glow** | huge dark sphere rim-lit at bottom of frame | circle 160–220% of frame width, positioned with top at 70–85% height, `box-shadow: 0 -2px 30px <rim>, inset 0 30px 80px <rim 30%>`; radial atmosphere gradient behind | v04, v12, v22, v47, v49 |
| **Iridescent glass orb** | marble sphere with swirl | radial-gradient base + 2 conic swirls rotating (blend `screen`) + white specular ellipse top-left + rim `box-shadow` | **v46**, v38, v52 |
| **Light streak / comet** | fast line with glowing head | a rounded div 4–8 px tall, `linear-gradient(90deg, transparent, color)`, head = bright dot with bloom; motion-blurred | v46, v52, v61, v32 |
| **Particles / bokeh** | drifting glowing dots | seeded PRNG (mulberry32) positions; each dot's position = f(t); DOF via random `blur(0–6px)` + size | v32, v46, v10 |
| **Dot-matrix / halftone reveal** | image forms from dots | grid of circles whose radius = image luminance sample × progress (canvas, `hf-seek`) | v36, v54, v26 "$6.4B" |
| **Concentric ripple / sonar rings** | rings expand from a point | 3–5 rings, `scale 0→1.6`, opacity 0.5→0, staggered 0.15 s, finite | v52 splash, v53, v55, v17 |
| **Grain / noise** | film/paper texture | SVG `feTurbulence` baseFrequency .8–.9 as an overlay at 4–8% opacity, seed changes per frame via `t` (seeded) | v01, v07, v37, v42 |
| **Duotone photo** | photo mapped to 2 brand colours | SVG `feColorMatrix` grayscale → `feComponentTransfer` table, or CSS `filter: grayscale(1)` + `mix-blend-mode: multiply/screen` colour layers | v54, v07 |
| **Stroke draw-on** | lines / signatures drawing | SVG path `pathLength="100"`, dasharray 100 120, tween dashoffset 110→0 | v57, v06 fingerprint, v20 underline |
| **Text on path / circle** | curved text rotating | SVG `<textPath>` on a circle, rotate the group linearly | v02, v34 |
| **Pixel / staircase wipe** | blocky mosaic transition | grid of squares, each toggled at `t > threshold(x,y)` (diagonal ordering) | v54, v19 |
| **Flip-clock digits** | split-flap numbers | two halves with `rotateX` -90→0 per digit change | v51 |
| **Odometer counter** | rolling numbers | each digit a vertical strip `0–9`, translateY = digit × lineHeight with `power2.out` | v26, v38, v08 |

## Palettes that recur (role → hex)
- **Ember (warm on black):** ground `#050403`, ember `#FFB547`, orange `#FF7A1A`, coral `#FF4F6D`, cream `#F6EFE6` (v52, v39, v61, v04).
- **Neon rim (spectral on black):** ground `#000`, orange `#FF8A2A` → magenta `#FF2BD6` → violet `#7B3CFF` → blue `#2E6BFF` → cyan `#29E3FF` (v43, v11).
- **Periwinkle SaaS:** ground `#F7F7FC`, mist `#C9CCF8`, periwinkle `#7D86F0`, royal `#2639C9`, navy `#05061A` (v27, v31).
- **Emerald enterprise:** ground `#021712`, emerald `#0F6B4F`, mint `#47E3B0`, lime `#D8FF4D` (v46, v32).
- **Editorial warm:** paper `#F0EDE8`, ink `#2E2B29`, deep green `#03120F`, mint `#5FE3A1`, serif italic accents (v10, v26).
- **Morph lavender:** canvas `#E8E3EF`, flat icon colours, greys `#6E6E73` (v06).
- **Gradient pop:** `#FF6A00` → `#FF2E7E` → `#9B5CFF` → `#4C7DFF` on white (v38, v54 orange).
- **Bold brand:** lime `#9FE870` + forest `#163300` (v34), yellow `#F2B90F` + black (v19).

H.264 bands full-screen linear gradients on dark grounds — prefer radial gradients and add 3–5% grain (soft-light) to dither every large gradient.

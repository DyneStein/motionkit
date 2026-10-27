# MotionKit primitives — copy-paste building blocks (HyperFrames + GSAP, seek-safe)

Every snippet is proven in a sample under `../samples/` (file noted). All motion is a pure function of timeline time.

## 1 · Beat grid (sample D `saas.html`)
```js
const BPM = 100, T0 = 0.11;                    // first beat from `npx hyperframes audio --only beats`
const beat = (n) => +(T0 + (60 / BPM) * n).toFixed(3);
const bar  = (k) => beat(2 + 4 * k);           // downbeats (offset 2 = where the track's bar starts)
// moves that must LAND on a hit start 0.04–0.19 s early; the hit itself is tl.set(...)
```

## 2 · Word-by-word blur caption (A `spark.html`, D)
```js
function words(sel, tin, step, tout) {
  document.querySelectorAll(sel + " span").forEach((w, i) => {
    tl.fromTo(w, { opacity: 0, filter: "blur(10px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.32, ease: "power2.out" }, tin + i * step);
    if (tout) tl.to(w, { opacity: 0, filter: "blur(10px)", duration: 0.26, ease: "power2.in" }, tout + i * 0.04);
  });
}
// markup: <div class="cap"><span>Every</span> <span>idea</span> <span><em>spark</em></span></div>
// .cap span{display:inline-block} .cap em{font-family:"EB Garamond";font-style:italic}  ← the italic-serif accent
```

## 3 · Rim-light (Apple-Intelligence edge glow) (C `neon.html`)
```css
.rim { position:absolute; border-radius:var(--r); --a:0deg; isolation:isolate; }
.rim::before { content:""; position:absolute; inset:-3px; border-radius:inherit;
  background: conic-gradient(from var(--a), #ff8a2a, #ff2bd6, #7b3cff, #2e6bff, #29e3ff, #ff8a2a); }
.rim::after  { content:""; position:absolute; inset:-4px; border-radius:inherit; z-index:-1; opacity:.85;
  background: conic-gradient(from var(--a), #ff8a2a, #ff2bd6, #7b3cff, #2e6bff, #29e3ff, #ff8a2a); filter: blur(26px); }
.rim .core { position:absolute; inset:0; border-radius:inherit; background:#050507; }
```
```js
tl.fromTo("#pill", { "--a": "0deg" }, { "--a": "720deg", duration: 4, ease: "none" }, t);  // GSAP tweens the CSS var
```

## 4 · ~~Pill → card via clip-path~~ — DEPRECATED (square corners; use §16)
```js
// element is already full-size; reveal it from the pill's box
tl.fromTo("#card", { clipPath: "inset(240px 130px 240px 130px round 60px)" },
                   { clipPath: "inset(0px 0px 0px 0px round 44px)", duration: 0.75, ease: "power3.inOut" }, t);
// glow lives on a sibling (clip-path clips shadows): scale it from the pill's proportions
tl.fromTo("#cardglow", { scaleX: 0.66, scaleY: 0.24 }, { scaleX: 1, scaleY: 1, duration: 0.75, ease: "power3.inOut" }, t);
```

## 5 · Morph silhouette — one SVG rect for every object (B `morph.html`)
```js
const SIL = ["#h", "#hmesh", "#hgloss"];  // same geometry, different fills (solid / pattern / gloss)
function shape(t, d, w, h, rx, ease = "power2.inOut") {
  tl.to(SIL, { attr: { x: CX - w/2, y: CY - h/2, width: w, height: h, rx }, duration: d, ease }, t);
}
function fill(t, d, c) { tl.to("#h", { attr: { fill: c }, duration: d }, t); }
// state change recipe: drain colour (0.3 s) → reshape (0.7 s) → recolour (0.5 s), details fade in/out around it
shape(2.3, 0.7, 300, 300, 150); fill(2.3, 0.6, "#ffe9b8");      // sun → bulb
shape(9.0, 0.85, 340, 700, 64, "power3.inOut");                 // speaker → phone
```

## 6 · Liquid blob from a ring (A `spark.html`) — one driver, seek-safe
```js
function blobPath(cx, cy, R, amp, ph) { let d = "";
  for (let i = 0; i <= 96; i++) { const a = i / 96 * Math.PI * 2;
    const r = R * (1 + amp * Math.sin(5*a + ph) + amp * .45 * Math.sin(7*a - ph * 1.4));
    d += (i ? "L" : "M") + (cx + r*Math.cos(a)).toFixed(1) + "," + (cy + r*Math.sin(a)).toFixed(1); }
  return d + "Z"; }
const drv = { u: 0 };
tl.fromTo(drv, { u: 0 }, { u: 1, duration: 1.75, ease: "none", onUpdate: () => {
  const u = drv.u, e = x => x*x*(3-2*x), g = Math.min(1, u/.35), s = Math.max(0, (u-.45)/.55);
  blob.setAttribute("d", blobPath(540, 800, 230 - 170*e(s), .13*e(g)*(1-e(s)), u*7)); } }, t);
```

## 7 · Metaballs (A `flow.html`)
```html
<filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="16" result="b"/>
  <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"/></filter>
<g filter="url(#goo)" fill="url(#molten)"> <circle id="b0"/> <circle id="b1"/> … </g>
```
Positions/radii = pure function of one driver `t` (orbit + spread envelope that closes to merge). Add a blurred copy group behind for bloom and a soft white ellipse for specular.

## 8 · Iris (dark ↔ light) (A `plan.html`)
```js
tl.fromTo("#cream", { clipPath: "circle(0px at 540px 800px)" }, { clipPath: "circle(1500px at 540px 800px)", duration: .65, ease: "power3.inOut" }, t);
tl.to("#cream", { clipPath: "circle(0px at 540px 800px)", duration: .6, ease: "power3.inOut" }, t2);  // inverse iris back to the world beneath
```

## 9 · Slot-machine word (D)
```html
<div id="win" style="height:150px;overflow:hidden"><div id="col"><div>sorted.</div><div>automated.</div><div>handled.</div></div></div>
```
```js
[1, 2].forEach(k => tl.to("#col", { y: -150 * k, duration: .22, ease: "power3.inOut" }, beat(34 + k) - .1));
tl.fromTo("#pill", { scaleX: 0 }, { scaleX: 1, duration: .35, ease: "expo.out" }, landing);  // highlight pill on the landing word
```

## 10 · Odometer / count-up (D, B)
```js
const v = { n: 8200 }, fmt = x => "$" + x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
tl.fromTo(v, { n: 8200 }, { n: 12480, duration: 1.4, ease: "power2.out", onUpdate: () => el.textContent = fmt(v.n) }, t);
```

## 11 · Breathing gradient ground (D `bg.html`)
3 blurred blobs (`filter: blur(130px)`), each with its own sine drift (`yoyo`, finite `repeat`). Radial, never full-frame linear on dark (H.264 banding).

## 12 · Ripple / sonar rings, splash crown (A)
Ellipses `rx 10→470, ry = rx·0.17`, `opacity .7→0`, staggered 0.2 s, `power2.out` 2.3 s. Droplets: x linear, y up `power2.out` then down `power2.in`.

## 13 · String with a bead riding it (A `plan.html`)
Pre-sample the path into 200 points at build; tween `u` 0→1 and place the bead at `PTS[round(u*200)]`; draw the stroke with dashoffset over the same window.

## 14 · Neon eye / Siri wave (C)
Eye = two quadratic curves whose control-point offset is `330·open`; blink = open 1 → 0.04 → 1 in 0.57 s. Wave = 4 sines × gaussian envelope `exp(-((x-540)/210)²)`, amplitude driver, glow filter in user space.

## 15 · Camera rig (all samples v2) — `camera-rig.js`
Paste `camera-rig.js` into the scene script, then:
```js
cameraRig(tl, document.getElementById("world"), DURATION, [
  { t: 0,   z: -1100, rx: 4, ry: -6 },                 // start far back
  { t: 6.1, z: 150, ry: 5, x: 40, e: "power1.inOut" },  // fly through the field
  { t: 8.2, z: 800, ry: 0, x: 0, e: "power2.inOut" },   // arrive (then dwell)
  { t: 10.1, z: -60, ry: -10, e: "power3.inOut" },      // pull-back reveal
], dofLayers, { t0: SCENE_START, onRender: (c) => { /* near fades, custom DOF */ } });
```
```css
#lens  { position:absolute; inset:0; perspective:1500px; perspective-origin:960px 540px; }
#world { position:absolute; inset:0; transform-style:preserve-3d; transform-origin:960px 540px; }
```
Root: `data-motion-blur="on" data-motion-blur-events="on"`. Rules: `grammar/08-camera.md`.

## 16 · Container morph as geometry (A v2 plan, C v2 card, D v2 knob → dashboard)
```html
<svg viewBox="0 0 W H"><rect id="box" x=".." y=".." width=".." height=".." rx=".." fill="url(#g)" /></svg>
<div id="content">…</div>
```
```js
tl.fromTo("#box", { attr: { x: 410, y: 752, width: 260, height: 96, rx: 48 } },                 // pill
                  { attr: { x: 150, y: 350, width: 780, height: 900, rx: 60 }, duration: .75, ease: "power3.inOut" }, t); // card
tl.fromTo("#content > *", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", stagger: .1 }, t + .6);
// fold: content out first, then { y: midY - 3, height: 6, rx: 3 } — corners round at every frame
```
Gradient fills use `gradientUnits="userSpaceOnUse"`; tween the gradient's x1..y2 with the box so colour doesn't jump. Rims: a stroked twin rect (+ a blurred stroked twin for glow, `filterUnits="userSpaceOnUse"`); rotate a linear gradient with `gradientTransform="rotate(a cx cy)"` for travelling rim-light.

## 17 · Polished flat object (B v2)
Same-geometry stack: body fill → mesh/pattern (optional) → shade (`linearGradient` white 22 % → 0 → black 10 %) → gloss (`radialGradient` spot) → rim stroke (white 35 %, 2 px, inset 1 px) → contact shadow ellipse (`radialGradient`) whose `cy/rx` follow the body. All tweened together by one `shape()` helper.

## 18 · Smooth glow (B v2, A v2)
```html
<radialGradient id="warm"><stop offset="0" stop-color="#ffd27a" stop-opacity=".75"/><stop offset=".3" stop-opacity=".42" stop-color="#ffd27a"/>
  <stop offset=".55" stop-color="#ffd9a0" stop-opacity=".16"/><stop offset=".78" stop-color="#ffe2b8" stop-opacity=".04"/><stop offset="1" stop-opacity="0" stop-color="#ffe2b8"/></radialGradient>
<circle r="300" fill="url(#warm)" />   <!-- peak opacity ≤ .85, settle ≈ .45 -->
```

## 19 · Follow-cam on a building sentence (D v3 `saas.html`)
```js
const AX = 1240; // newest word's right edge held at 65 % of frame width
function sentence(sel, times, cy) {
  document.querySelectorAll(sel + " > span").forEach((w, i) => {
    tl.fromTo(w, { opacity: 0, filter: "blur(10px)", y: 14 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: .45, ease: "power3.out" }, times[i]);
    const p = pos(w);                       // offset-chain position inside the world (unaffected by transforms)
    if (i === 0) key(times[0], {});         // hold until the sentence starts
    key(times[i] + .42, { x: p.x + p.w - AX, y: cy, z: 0 }, "glide");   // ONE spline through all word targets (round 4: per-word power3.out hops stutter)
  });
}
// keys feed cameraRig(tl, world, D, K) — see camera-rig.js
```
Build inside `document.fonts.ready.then(...)` so measured word positions use the final font; register the timeline at the end of that callback.

## 20 · Carrier travel between stations (A/B/C v3) — ⚠️ round 3 rejected this for element-driven films; use only when a protagonist genuinely travels
```js
const ST = [[0,0],[700,520],[1400,40],[2050,620]];            // station offsets in the world
const MV = [[5.05,5.95],[9.0,9.9],[11.45,12.35]];             // morph seams
MV.forEach((m, i) => tl.fromTo("#carrier", { x: ST[i][0], y: ST[i][1] },
  { x: ST[i+1][0], y: ST[i+1][1], duration: m[1]-m[0], ease: "power3.inOut", immediateRender: i === 0 }, m[0]));
// camera: arrive late with expo.out, drift through the dwell, leave with the next move
ST.forEach((p, i) => { CK.push({ t: arrive_i, x: p[0]-50, y: p[1], e: "expo.out" }, { t: leave_i, x: p[0]+50, y: p[1], e: "power1.inOut" }); });
```
Captions: `style="transform:translate(<station x>px,<station y>px)"` inside the world. Parallax: a seeded SVG of faint dots/motes at `translateZ(-600px) scale(1.4)` covering the whole route.

## 21 · Motivated camera for element-driven films (A/B/C v4)
```js
const cs = camSeed(9137), roll = cs.sign();          // seeded: direction/size differ per film and per beat
cameraRig(tl, world, D, [
  { t: 0,    z: -50, rz: roll * cs.range(.6, 1.2) },
  { t: 2.2,  z: 0, rz: 0, e: "sine.inOut" },                    // settle on the first object
  { t: 4.58, z: 10, e: "power1.inOut" }, { t: 4.7, z: 46, e: "power2.out" },  // 0.1 s kick on an event
  { t: 12.3, z: -cs.range(70, 95), e: "power2.inOut" },         // pull back when a reveal needs room
  { t: 26,   z: cs.range(55, 80), e: "sine.inOut" },            // slow push on the brand
], null, { drift: .35, seed: 9137 });
```

## 22 · Beat sync for ambient tracks — `beat-sync.js`
```js
const HITS = [/* python3 research/audio_hits.py music/track.mp3 26 */];
const TL = gsap.timeline({ paused: true });
const tl = beatSync(TL, HITS, { t0: SCENE_START, tol: 0.2 });   // author tweens on tl exactly as before
/* … tl.to / tl.fromTo / tl.set … */
tl.commit();                                                    // replays everything on TL with event clusters snapped to hits
// register TL as the scene timeline
```

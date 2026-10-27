# Element notes — what makes the reference elements look expensive

Review round 2 (user): *"see the professional elements used in the videos … the contrasts, the color combinations … also the fonts in the videos are professional."*
Close-up study of full-resolution frames. Each entry: what it is, how it's built, why it reads premium. Code versions live in `../elements/`.

## Global rules distilled
1. **One material per element, rendered properly.** Glass is glass (blur + 1 px inner highlight + soft colored shadow), metal/plastic has a light direction (top-left), extrusions have 3 faces with different values. No flat "CSS box with a drop shadow".
2. **Contrast comes from value, not from saturation.** Near-white grounds (#F4F3F7–#FAFAFC) with near-black ink (#0B0B12–#16161D); one saturated accent per scene. Dark films use near-black with a single luminous hue (mint, coral, cyan, violet).
3. **Shadows are wide, soft, low and tinted** (blur 40–90 px, 6–14 % opacity, offset y 20–40 px, tinted by the brand/ground hue) — never grey, never tight.
4. **Edges carry light.** Every surface has a 1 px top highlight (white 50–90 %) or a 1 px inner border; dark surfaces have a slightly lighter rim (#2A2A33 on #141418).
5. **Icons are real icon design:** squircle (iOS) radius ~22.5 %, 3D-ish gradient inside, glyph with its own subtle shadow; line icons 1.75–2 px strokes, rounded caps, 24 px grid.
6. **Type is tight and confident:** geometric/grotesk sans, tracking −0.02 … −0.04 em at display sizes, weights 500–600 (not 700–900), sentence case.
7. **Small details are present:** caret blinking, cursor with white outline + shadow, status dots, tiny labels at 60 % opacity, hairline separators.

## Element by element

### macOS dock + app icons (v31 @0.6 s)
- White dock tray, radius ~28 px, fill #FFFFFF, shadow `0 30px 60px rgba(20,20,40,0.10)` plus `0 2px 6px rgba(20,20,40,0.05)`; no border.
- Icons ~88 px squircles with **their own depth**: Finder = two-tone face with a highlight band; Notes = yellow header band with dotted perforation over a light-grey ruled body; Calendar = white with red "Tue" and a thin numeral; Mail = blue gradient (#2DA7FF→#1F6BFF) with white envelope lines.
- The app being introduced (purple cloud) is **glossy and puffy**: a flower-squircle silhouette, radial gradient #8B7BFF→#3B2BFF, inner top-left white highlight, slightly darker bottom rim, soft purple shadow.

### Dark device toolbar pill (v31 @16.6 s)
- Fill #232326 → #1B1B1E, radius full, 1 px rim #3A3A40 at the top edge, shadow `0 20px 50px rgba(0,0,0,0.25)`.
- Two-line label: "iPhone 17 Pro" 600 white, "iOS 26.5" 500 at 45 % white. Three line icons (home, screenshot, rotate) 2 px strokes #CFCFD6.
- The cursor: black arrow with a 2 px white outline and a small soft shadow — that's the macOS look.

### Prompt box with tag (v31 @11.2 s)
- White card radius 28 px, *very* soft shadow, 1 px #ECECF2 border; typed text 500 at 34 px #121216; a lavender tag pill ("Build iOS Apps") #E9E6FF bg / #6B5BFF text inline; footer row "+" and "GPT-5.5 ⌄" in #2B2B33.

### Reeded/fluted-glass gradient pill (v38 @1.6 s, user image 18)
- A blurry gradient blob (orange #FF7A1A centre → pink #FF4FA0 → violet #7B6BFF → periwinkle #9FB0FF edges) seen through **vertical glass flutes**: 4–6 strips, each strip shows the blob *offset/stretched* (refraction) with a white highlight on the strip's left edge and a faint shade on the right; the flute seams are visible as vertical discontinuities.
- White type sits on top, 600 weight; letters in the flute zones are partly refracted/blurred (they sit *behind* the glass).
- Build: N clipped columns, each containing the same gradient blob scaled `scaleX 1.15–1.35` and shifted; plus per-column linear-gradient highlight; overall pill clip with radius full.

### Iridescent gradient sphere with tags (v38 @9.2 s)
- Sphere: conic/mesh swirl of orange, pink, violet, periwinkle with a big white specular region (upper-left) and a soft white rim on the shadow side (rim light) — reads like a liquid marble.
- Tags: tiny white pills, 1 px border, flag + city, slight drop shadow; scattered on a ring around the sphere at different sizes (depth).

### Glass circular icon buttons (v50 @1.3 s, user image 19)
- Ø ~180 px light-grey circles (#ECEBEF) with a **soft inner shadow at the top and a hairline bright rim at the bottom** (convex glass), and a large faint halo ring behind (#E6E4F2, 30 %).
- Glyphs are flat, colorful, simple: yellow broadcast dot, green candles, blue person; the hand cursor is a cartoon white glove with black outline.

### 3D candlesticks (v50 @4.8 s, user image 20)
- Real 3D: square-section extruded bars seen from a 3/4 high angle; **front face lighter, side face darker, top cap lightest**; red #E8445A (front) / #B92F45 (side) / #FF8A99 (top highlight line); grey #E7E7EA / #BDBDC4 / #FFFFFF.
- Wicks are thin square rods with the same 3-tone shading. Ground #F4F3F6, no shadows (clean product render).
- Build: CSS 3D box (front/side/top faces with `rotateY(-35deg) rotateX(-18deg)` perspective) or SVG isometric polygons with 3 fills.

### "Stop Loss" pill with dashed connector (v50 @6.2 s)
- Red pill #E8445A → #C8323F vertical gradient, radius 18 px, 1 px darker border, inner top highlight; white 600 type.
- During its entrance the pill is filled by a **halftone dot pattern sweeping across** (pink→black dots) — a print-style reveal.
- Connector: 3 dashes + dot in #1A1A3A, 4 px thick.

### Isometric building + order tags (v50 @10.6 s)
- White isometric tower (3 faces: #FFFFFF, #E9E9EE, #D4D4DC) with window stripes; tiny 3D cubes as exchanges; dark navy tags (#1E2A55) with white label + red price.

### Light cone / bottleneck (v48 @2.0 s, user image 20)
- Hard black wedge on light grey #E6E6E6; inside, a **deep blue→violet gradient (#0B0B6E→#4B4BFF→#C9C9FF) concentrated toward the apex**, with a white-hot point at the tip and a 2 px violet beam along the axis; edges of the wedge are razor sharp — the drama is in the hard edge vs soft light.

### Fan / strand network with glossy beads (v48 @7.2 s, user image 21)
- 20–30 bezier strands from one point fanning out, 1.5 px #7B7BFF at 70 %; glossy spheres (black, white, violet) riding the strands at different sizes (depth); faint "+" grid on the ground #E9E9EC.
- Spheres: radial gradient with a crisp white specular dot upper-left and a dark rim — tiny but fully shaded.

### Liquid-glass orb + state pill (v46 @15.6 s)
- Orb: pearly white-green core with mint/yellow swirl, crisp edge, thin lime rim glow; it sits next to a **thick rounded slab** (#0E3B2C→#145A43 gradient) with lime text "Reasoning ..".
- Ground: deep emerald with a faint grid; everything else desaturated so the orb pops.

### Glass coverflow tiles (v46 @68 s)
- Tiles: dark translucent with lime gradient wash from the top; icon in a lime glowing circle; active tile larger and brighter; neighbours dimmer — depth by value.

### Recording pill (v44 @5.6 s), gauge (v62 @3.7 s), funnel chips (v17 @39 s)
- Recording pill: dark capsule with a 1.5 px grey rim, lime equaliser bars with glow, chevron, rounded stop square — premium through restraint.
- Gauge: mint #4BE3A4 arc with soft bloom on black, big white numeral (thin weight).
- Funnel chips: black pills "2.7K Clicks" / green squares with arrow + % — pure black/green, heavy type, tight.

### Type specimens (identified by side-by-side rendering)
- v27/researchly: a geometric sans with single-storey **a** and curled **y**, tight tracking → closest free match **Chillax** (Fontshare) at −0.03 em; alternative **Urbanist**.
- v31/Codex UI, v53, v44: Apple SF Pro (system) → free stand-ins **Inter Display / Inter Tight**, **Satoshi**.
- v48 "From bottleneck…": light geometric grotesk → **General Sans 400** / **Switzer**.
- v34 Wise: heavy italic-ish grotesk caps → **Clash Grotesk 700** / Archivo Black.
- Serif accents (v10, v26, v52): **Instrument Serif italic**, EB Garamond italic.

# 05 · Camera, UI choreography & story structures

## Camera vocabulary
| Move | Use | Build | Refs |
|---|---|---|---|
| Push-in / pull-back | focus a detail; reveal context | scale + translate on a `#cam` wrapper, `power2.inOut` | everywhere |
| Dolly along UI | travel a prompt bar to its send button | translateX on wrapper while bar stays, motion blur | v12, v35, v61 |
| Dive into screen | phone/laptop screen becomes the world | scale wrapper ×6–10 centred on screen, `power3.in` + blur | v24, v02 |
| 3D tilt settle | UI arrives tilted, settles flat to be read | rotateX 12–18° → 0, rotateY ±10° → 0, `expo.out` | v27, v31, v42, v49 |
| Orbit / coverflow | carousel of tiles/screens | items on a cylinder (rotateY(i·θ) translateZ(R)), rotate group | v46, v22, v54 |
| Macro | extreme close-up on a UI detail | scale ×3–5 with shallow DOF (blur siblings) | v44, v55, v62 |
| Pull-back reveal | show everything was one drawing/space | scale down to 0.25–0.4 at the end | v57, v02 |
| Time-of-day change | environmental continuity | grade/colour of bg shifts day→sunset→night | v10, v38, v42 |

Camera wrapper pattern: `#stage > #cam > content`. Animate `#cam` only; content animates itself. Never tween the timed `.clip`.

## UI choreography kit (the "AI product ad" grammar)
- **Prompt box** (the hero of 15+ refs): rounded 20–28 px, dark or glass, an under-glow / rim-light, chips row, send button. Beats: appear → type → dolly to button → press (scale .92, bloom) → result emerges *from the button* (v12, v47) or card morphs (v28/29).
- **Cursor**: arrow or hand, 1.5× OS size in reels, curved paths, label tag for multiplayer feel (v42), click = press + ripple.
- **Toggle before/after**: OFF state shows the problem (grey pills), flip ON → pills turn accent & reword (v27, v38, v01).
- **Status pills**: "Working… / Thinking… / Generating… / Done ✓" with spinner or shimmer (v09, v50, v46).
- **Toasts/notifications**: slide from top/right with spring, stack, soft shadow (v08, v17, v44).
- **Success finale**: element collapses to a pill → ✓ check in a circle with radial glow + sonar ring (v28/29, v49).
- **Stats**: odometer or count-up numerals, arc gauges filling (v26, v62, v17).
- **Lists**: menu list on the left with active bullet, matching card on the right (v38); vertical word picker (v58).

## Story structures that recur
1. **Problem (dark) → Reveal → Features → Benefit → CTA** — the SaaS standard (v17, v27, v41, v46). Problem act darker/noisier; product act bright & clean (light↔dark flip = the turn).
2. **Chaos → Order** — scattered nodes/apps/particles collapse into one system/logo (v03, v10, v22, v32, v48).
3. **One protagonist, many states** — a single element is transformed through each idea, word pairs as captions (v52, v57, v11, v06, v46).
4. **Manifesto montage** — anchored word over evolving archival plates → product (v08, v21).
5. **UI-world lyric** — each line lives in a different familiar interface; camera dives between (v02, v23).
6. **Micro-loop** (reels) — hook → 2–3 UI beats → back to frame 1 (v56, v59, v33).
7. **Prompt → Result** — type a wish, press, the result blooms into the world (v09, v12, v31, v47, v54).

## Endings
Logo + URL is never a hard stop: a planet/horizon rise (v04, v12, v22, v49), a shape rhyme of the opening (v37, v52), a logo assembled by the protagonist (v57, v32), or a fade through the brand colour. Hold ≥ 2 s.

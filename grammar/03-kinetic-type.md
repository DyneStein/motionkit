# 03 · Kinetic typography — 24 patterns from the references

Type in these films is never "a subtitle that fades in". Each pattern below lists the build and the reference.

## Composition rules
- **Two-tier lockup:** tiny light lead-in (2.5–4% frame height) over a HUGE bold keyword (60–90% width) — v01, v17, v21.
- **One accent per line:** the meaning word gets the brand colour, a highlight pill, a weight jump or an **italic serif** (v10, v26, v52, v27 script). Never accent two words.
- **Mixed families:** geometric/grotesk sans for body + italic serif (EB Garamond / Playfair) or script for the emotional word. This single move is the most "premium" typographic signal in the set.
- **Reels:** ≤ 5 words per line, nothing under 28 px at 1080 w, keep text in the 168–1330 px band.

## Entrances
| Pattern | Build | Ref |
|---|---|---|
| Blur-in per word | each word `opacity 0→1, blur 8→0`, 0.13–0.2 s, 60–100 ms apart, **no translate** | v14, v27, v36, v52 |
| Grey-to-ink read-along | whole sentence present in light grey, words turn to ink one by one with the beat | v21, v46, v57 (dot underlines each word) |
| Colour-on-arrival | arriving word is accent-coloured, settles to ink | v33 |
| Typing with caret | 25–40 ms/char, caret 2 px, blinking; backspace to change a word | v02, v17, v20, v21, v55 |
| Tracking collapse | letters start spread (+40% tracking) & blurred, collapse to normal | v39, v47, v49 logo |
| Letters fall into place out of order | random-ordered per-letter drop with blur ("O ga ic Content") | v17 |
| Grow from seed | letters unfold from tiny gradient seeds (scale 0→1 with stroke) | v38 |
| Scramble decode | random glyphs (`#@$%&*`) resolve L→R | v35, v40, v56 |
| Spring up / wobble | letters rise from baseline with `back.out`/elastic | v51, v45 |
| Brush stroke → word | a hand stroke draws, then morphs into the word | v59, v57 (script logo drawn by the line) |
| Blob → word | a liquid blob stretches into letterforms | v45 |

## Swaps & emphasis
| Pattern | Build | Ref |
|---|---|---|
| **Slot-machine word roll** | vertical list of words scrolls through a fixed slot (mask/selection box), ~0.1 s/roll, lands with overshoot; others ghosted above/below | v10, v18 (Figma selection box), v33, v38, v58 |
| Word swap in place | same position, old word blurs out 0.13 s, new blurs in | v03, v14, v16, v39 |
| **Highlight pill keyword** | sentence lands, then the key word gets a rounded accent pill behind it (scale-x from 0) | **v17**, v20 |
| Highlighter swipe | magenta/yellow bar wipes behind a word | v03, v08 |
| Hand-drawn underline / scribble | SVG stroke draw-on under a word, 0.4–0.6 s | v20, v32, v57, v08 |
| Selection box | Figma/doc-editor blue box with corner handles snaps around a word | v22, v40, v18 |
| Strikethrough correction | red strike over a word, replacement appears | v15 |
| Inline icon/image in sentence | a logo, orb or photo sits between words, words reflow around it | v21, v31 ("Meet [icon] Codex"), v38, v46 orb, v50 |

## Scale & space
| Pattern | Build | Ref |
|---|---|---|
| Giant cropped word | word overflows frame edges, camera tracks across it | v10 "Agents", v21, v34 "WISE" |
| Echo stack | same line repeated vertically, centre sharp, others ghosted/offset | v26 "Series F", v40 |
| Scatter → sentence | words float at random angles/depths then snap into one line | v10 |
| Tracking-camera sentence | sentence grows to the right, camera pans to keep the newest word centred | v27, v46 |
| Text orbiting a sphere / circle path | text on a circle path rotates around an object | v02, v34 globe, v23 |
| Text between/behind objects | product slots between letters; object occludes part of a word (depth sandwich) | v07 "Answers", v19, v21 |

## Exits
Blur-out + fade 0.13–0.25 s (word by word, or whole line), or leave **with the scene's carrier** (the word rides the zoom-through). Never slide out slowly.

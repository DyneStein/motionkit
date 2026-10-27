# MotionKit fonts — professional faces that match the references

All files are free for commercial use: Fontshare faces under the ITF Free Font License, Google faces under the SIL OFL. Copy the `.woff2` you need into `<project>/assets/fonts/` and paste the matching `@font-face` rules from `fonts.css`.

| Face | Weights | Feels like (reference) | Use for |
|---|---|---|---|
| **Chillax** | 400 500 600 700 | v27 researchly — geometric, single-storey *a*, curled *y* | friendly SaaS headlines, tracking sentences (−0.03 em) |
| **Satoshi** | 400 500 700 900 | Apple/SF-adjacent neutral (v31, v44, v62) | UI, product films, body |
| **General Sans** | 400 500 600 700 | v48 / v10 light geometric grotesk | editorial lines, captions |
| **Switzer** | 400 500 600 700 | Swiss neutral (v19, v40) | design-tool / Swiss style |
| **Clash Grotesk** | 400 500 600 700 | v34 Wise, v21 bold editorial | loud brand systems, giant cropped words |
| **Cabinet Grotesk** | 400 500 700 800 | v17 Pulse, v20 | punchy SaaS, numbers |
| **Urbanist** | 400 500 600 700 | close alternative to Chillax, tighter | UI labels, clean headlines |
| **Sora** | 400 500 600 | v46 HUMAIN / tech | enterprise, data |
| **Inter Tight** | 400 500 600 700 | SF Pro stand-in for UI text | UI copy inside mockups |
| **Instrument Serif** | 400, 400 italic | v10/v26 italic accents | the one emotional word |
| **Fraunces** | 400 600 | warm editorial serif | headlines with personality |

Already bundled with HyperFrames (no files needed): Inter, Outfit, Poppins, Montserrat, EB Garamond, Playfair Display, JetBrains Mono, Space Mono, Archivo Black, League Gothic…

## Pairings by style
- **S1 Ember Flow:** Satoshi 500 + Instrument Serif italic accent.
- **S2 Morph Continuum:** Satoshi 500/700 labels; wordmark Clash Grotesk 600.
- **S3 Neon Rim:** Satoshi 500 inside pills, General Sans 400 captions.
- **S4 Breathing-Gradient SaaS:** Chillax 500 headlines (−0.03 em), Inter Tight UI, Instrument Serif italic accent.
- **S5 Editorial:** General Sans 400/600 + Instrument Serif italic.
- **S6 Glass Orb:** Sora 400/600, lime accent words.
- **S10 Bold Brand:** Clash Grotesk 700 caps / Cabinet Grotesk 800.

## Type rules (from the references)
- Display tracking −0.02 … −0.04 em; UI text 0 … −0.01 em; tiny labels +0.02 em uppercase.
- Display weight 500–600; reserve 700+ for brand systems. Thin numerals (300–400) for big stats on dark.
- One family per film plus one accent face. Never more.

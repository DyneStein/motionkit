// AURELLE: sleep and wake wearable. Silk dawn gradients, soft serif, glass cards. Route: U, DR, L, UR, D, UL, R, D. Fictional brand, sample copy.
const MARK = `<svg viewBox="0 0 100 100"><defs><linearGradient id="au" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd0a8"/><stop offset="1" stop-color="#e9576e"/></linearGradient></defs><circle cx="50" cy="50" r="46" fill="url(#au)"/><path d="M14 62h72" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M28 74h44" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>`;
FastType({ seed: 77, fonts: ['600 100px Fraunces', '500 100px Chillax', '600 100px Chillax', 'italic 400 100px Instrument', '500 100px Mono'], theme: 'dawn', pulse: .1,
 tokens: { display: 'Fraunces', serif: 'Instrument', ui: 'Chillax', mono: 'Mono', dw: 600, dt: '-.03em', r: '52px', 'card-sh': 'inset 0 1px 0 rgba(255,255,255,.75),0 0 0 1px rgba(255,255,255,.25),0 30px 80px rgba(150,60,70,.24)', vig: 'rgba(120,40,60,.14)', 'pulse-blend': 'soft-light' },
 themes: { dawn: { bg: 'linear-gradient(170deg,#ffb48e 0%,#ffd9b8 46%,#fdeee0 100%)', ink: '#3a0f26', accent: '#d8344f', accent2: '#ffb48e', muted: '#9a6b70', card: 'rgba(255,255,255,.66)', 'card-ink': '#3a0f26', 'on-accent': '#fff5ee', track: 'rgba(216,52,79,.16)', ghost: 'rgba(216,52,79,.12)' }, night: { bg: 'linear-gradient(170deg,#1b1033 0%,#3a1a4a 60%,#8a3a5c 100%)', ink: '#ffe9dc', accent: '#ffb48e', accent2: '#d8344f', muted: '#b698ad', card: 'rgba(255,255,255,.1)', 'card-ink': '#ffe9dc', 'on-accent': '#2a1238', track: 'rgba(255,255,255,.14)', ghost: 'rgba(255,180,142,.12)' } },
 ghost: [{ t: 'Aurelle', s: 760, x: -900, y: 300 }],
 beats: [
  { type: 'stack', bars: .9, theme: 'night', lines: ['Alarms', 'are _violent._'], max: 300 },
  { type: 'counter', bars: 1, go: 'U', theme: 'night', label: 'Wake up · tomorrow', from: 2, to: 6, prefix: '0', suffix: ':42', size: 340, fill: .4 },
  { type: 'track', bars: 1.25, go: 'DR', theme: 'dawn', text: 'What if morning just *arrived?*', size: 260 },
  { type: 'logo', bars: 1.25, go: 'L', theme: 'dawn', mark: MARK, name: 'Aurelle', max: 300, tag: 'Sunrise, on your wrist' },
  { type: 'chart', bars: 1.25, go: 'UR', theme: 'dawn', label: 'Deep sleep · 30 days', value: '+1h 12m' },
  { type: 'checks', bars: 1.25, go: 'D', theme: 'dawn', items: ['Learns your cycles', 'Warms before sunrise', 'Wakes you, gently'] },
  { type: 'orbit', bars: 1.25, go: 'UL', theme: 'night', text: 'SLEEP · WAKE · RISE · SLEEP · WAKE · RISE · RISE · ', bg: 'radial-gradient(circle at 40% 30%,#ffe4c4,#ff9f7a 45%,#d8344f 80%)' },
  { type: 'slot', bars: 1.25, go: 'R', theme: 'dawn', lead: 'Wake up', words: ['tired', 'late', 'rested'], size: 190, leadMax: 200 },
  { type: 'toggle', bars: 1, go: 'DL', theme: 'dawn', text: 'Turn off _alarms._', max: 170 },
  { type: 'toasts', bars: 1.25, go: 'R', theme: 'night', items: [['Light cycle detected', '06:14 · warming up'], ['You woke naturally', '2 minutes before 06:42'], ['Sleep score', '91 · your best this month']] },
  { type: 'end', rest: true, go: 'D', theme: 'dawn', mark: MARK, lines: ['Aurelle'], sub: 'mornings, reinvented', cta: 'Join the waitlist', max: 300 },
 ] });

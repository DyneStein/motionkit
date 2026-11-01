// RAVIK: cybersecurity. Black, signal red, poster condensed caps. Route: U, R, DL, IN, R, D, UR, L, D. Fictional brand, sample copy.
const MARK = `<svg viewBox="0 0 100 100"><path d="M50 4 90 20v32c0 24-18 38-40 44C28 90 10 76 10 52V20z" fill="var(--accent)"/><path d="M34 70V30h18c9 0 14 5 14 12s-5 11-12 12l14 16" fill="none" stroke="var(--on-accent)" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
FastType({ seed: 33, fonts: ['400 100px Anton', '500 100px Switzer', '600 100px Switzer', 'italic 400 100px Instrument', '500 100px Mono'], theme: 'black', kickZ: 70, pulse: .16,
 tokens: { display: 'Anton', serif: 'Instrument', ui: 'Switzer', mono: 'Mono', dw: 400, dt: '-.005em', up: 'uppercase', r: '20px', pillr: '.06em', 'pillr2': '12px', 'card-sh': '0 0 0 2px rgba(255,40,30,.28),0 40px 90px rgba(0,0,0,.7)', vig: 'rgba(0,0,0,.6)' },
 themes: { black: { bg: '#080505', ink: '#f6efe9', accent: '#ff2a1d', accent2: '#7a0c06', muted: '#8f7e78', card: '#171010', 'card-ink': '#f6efe9', 'on-accent': '#080505', track: '#2e1d1b', ghost: 'rgba(255,42,29,.13)' }, red: { bg: '#e61f12', ink: '#0a0404', accent: '#0a0404', accent2: '#fff', muted: '#5c0c07', card: '#0a0404', 'card-ink': '#f6efe9', 'on-accent': '#ff3a2d', track: '#b5170c', ghost: 'rgba(10,4,4,.15)' } },
 ghost: [{ t: 'RAVIK', s: 1000, x: -760, y: -360 }, { t: 'RAVIK', s: 1000, x: -1600, y: 1400 }],
 beats: [
  { type: 'stack', bars: .75, lines: ['Threats', "don't *wait.*"] },
  { type: 'counter', bars: 1, go: 'U', label: 'Attacks today', from: 80000, to: 412883, size: 290, fill: .9 },
  { type: 'stack', bars: .75, go: 'R', theme: 'red', lines: ['One gets', 'through.'] },
  { type: 'track', bars: 1.5, go: 'DL', theme: 'black', text: 'That is all it *takes.*', size: 420 },
  { type: 'logo', bars: 1.25, go: 'IN', mark: MARK, name: 'Ravik', max: 340 },
  { type: 'toasts', bars: 1.5, go: 'R', items: [['Login blocked', 'Unknown device · Kyiv'], ['Phish stopped', '1,204 inboxes safe'], ['Breach sealed', 'In 0.4 seconds']] },
  { type: 'gauge', bars: 1.25, go: 'D', unit: 'threats stopped / sec', max: 980, top: .84 },
  { type: 'slot', bars: 1.25, go: 'UR', lead: 'Always', words: ['watching', 'learning', 'ahead'], size: 210, leadMax: 230 },
  { type: 'swap', bars: 1, go: 'R', theme: 'red', from: 'exposed', to: 'untouchable', max: 300 },
  { type: 'checks', bars: 1.25, go: 'DR', items: ['Blocks the login', 'Traces the source', 'Patches the hole'] },
  { type: 'end', rest: true, go: 'D', theme: 'black', mark: MARK, lines: ['Ravik'], sub: 'nothing gets through', cta: 'Lock it down', max: 360 },
 ] });

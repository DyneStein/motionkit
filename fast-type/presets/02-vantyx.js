// VANTYX: catches abnormal behaviour in software. Clinical white, acid green, off-kilter Syne. Route: R, D, UL, R, DR, U, L, DL, R. Fictional brand, sample copy.
const MARK = `<svg viewBox="0 0 100 100"><rect x="6" y="6" width="88" height="88" rx="26" fill="#0c0f06"/><path d="M26 30 50 72 74 30" fill="none" stroke="#c4ff2e" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
FastType({ seed: 22, fonts: ['800 100px Syne', '500 100px General', '600 100px General', 'italic 400 100px Instrument', '500 100px Mono'], theme: 'lab', pulse: .06,
 tokens: { display: 'Syne', serif: 'Instrument', ui: 'General', mono: 'Mono', dw: 800, dt: '-.045em', r: '36px', 'card-sh': 'inset 0 1px 0 #fff,0 0 0 1px rgba(10,20,0,.08),0 30px 70px rgba(30,50,0,.16)', vig: 'rgba(40,50,20,.1)', 'pulse-blend': 'multiply' },
 themes: { lab: { bg: '#f3f4ee', ink: '#0c0f06', accent: '#b3f000', accent2: '#0c0f06', muted: '#74786a', card: '#ffffff', 'card-ink': '#0c0f06', 'on-accent': '#0c0f06', track: '#dde0d2', ghost: 'rgba(12,15,6,.07)' }, acid: { bg: '#c4ff2e', ink: '#0c0f06', accent: '#0c0f06', accent2: '#fff', muted: '#4b6405', card: '#0c0f06', 'card-ink': '#f3f4ee', 'on-accent': '#c4ff2e', track: '#a3d81c', ghost: 'rgba(12,15,6,.1)' }, ink: { bg: '#0c0f06', ink: '#f3f4ee', accent: '#c4ff2e', accent2: '#fff', muted: '#8c9078', card: '#1a1e10', 'card-ink': '#f3f4ee', 'on-accent': '#0c0f06', track: '#2c3220', ghost: 'rgba(196,255,46,.09)' } },
 ghost: [{ t: 'VANTYX', s: 760, x: -1000, y: 300 }],
 beats: [
  { type: 'stack', bars: 1, lines: ['Something', 'looks [off.]'] },
  { type: 'giant', bars: 1, go: 'R', text: 'ABNORMAL', size: 400, color: 'var(--accent2)' },
  { type: 'chart', bars: 1.5, go: 'D', label: 'Error rate', value: '+340%', d: 'M0 330 L 120 318 L 240 326 L 360 300 L 480 310 L 560 280 L 620 120 L 700 60 L 860 20' },
  { type: 'track', bars: 1.5, go: 'UL', theme: 'ink', text: 'You *notice* too late.', size: 300 },
  { type: 'logo', bars: 1.25, go: 'R', theme: 'acid', mark: MARK, name: 'Vantyx', tag: 'Anomaly detection' },
  { type: 'checks', bars: 1.5, go: 'DR', theme: 'lab', items: ['Reads every log', 'Spots the outlier', 'Finds the commit', 'Opens the fix'] },
  { type: 'toggle', bars: 1.25, go: 'U', theme: 'lab', text: 'Turn on _watch+mode._' },
  { type: 'toasts', bars: 1.5, go: 'L', theme: 'ink', items: [['Spike caught', 'checkout-api · 4s ago'], ['Root cause found', 'Commit 7f3a2c'], ['Fix proposed', 'Ready to review']] },
  { type: 'swap', bars: 1, go: 'DL', theme: 'lab', lead: 'Your users', from: 'noticed', to: 'never knew', max: 250 },
  { type: 'counter', bars: 1.1, go: 'UR', theme: 'ink', label: 'Mean time to detect', from: 240, to: 4, suffix: ' sec', size: 280, fill: .96 },
  { type: 'end', rest: true, go: 'R', theme: 'acid', mark: MARK, lines: ['Vantyx'], sub: 'normal, on purpose', cta: 'Start watching', max: 290 },
 ] });

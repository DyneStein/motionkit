// FORJA: strength-training app. Warm ivory and black, editorial heavy roman, ember accent. Route: L, DR, U, R, DL, UR, D, L. Fictional brand, sample copy.
const MARK = `<svg viewBox="0 0 100 100"><path d="M26 14h52l-8 18H48v14h20l-7 16H48v26H26z" fill="var(--accent)"/></svg>`;
FastType({ seed: 44, fonts: ['800 100px Bodoni', '500 100px Satoshi', '700 100px Satoshi', 'italic 400 100px Instrument', '500 100px Mono'], theme: 'ivory', pulse: .05,
 tokens: { display: 'Bodoni', serif: 'Instrument', ui: 'Satoshi', mono: 'Mono', dw: 800, dt: '-.03em', r: '30px', 'card-sh': 'inset 0 1px 0 rgba(255,255,255,.7),0 0 0 1px rgba(40,20,0,.08),0 30px 70px rgba(70,40,10,.2)', vig: 'rgba(70,40,10,.14)', 'pulse-blend': 'multiply' },
 themes: { ivory: { bg: '#f4ecdc', ink: '#17110a', accent: '#d9480f', accent2: '#17110a', muted: '#83745f', card: '#fff9ee', 'card-ink': '#17110a', 'on-accent': '#fff4e6', track: '#e2d6bf', ghost: 'rgba(23,17,10,.07)' }, coal: { bg: '#14100b', ink: '#f4ecdc', accent: '#ff6a1f', accent2: '#f4ecdc', muted: '#99886f', card: '#231c13', 'card-ink': '#f4ecdc', 'on-accent': '#14100b', track: '#3a2f22', ghost: 'rgba(255,106,31,.1)' } },
 ghost: [{ t: 'Forja', s: 1000, x: -700, y: 340 }],
 beats: [
  { type: 'stack', bars: .75, lines: ['Nobody', 'is _born_', 'strong.'], max: 290 },
  { type: 'giant', bars: 1, go: 'L', theme: 'coal', text: 'FORGED', size: 660 },
  { type: 'track', bars: 1.25, go: 'DR', theme: 'ivory', text: 'One rep at a *time.*', size: 330 },
  { type: 'logo', bars: 1, go: 'U', theme: 'coal', mark: MARK, name: 'Forja', max: 340, tag: 'Strength, planned' },
  { type: 'counter', bars: 1, go: 'R', theme: 'coal', label: 'Today · Deadlift', to: 180, suffix: ' kg', size: 300, fill: .82 },
  { type: 'chart', bars: 1.25, go: 'DL', theme: 'ivory', label: 'Your 1RM · 12 weeks', value: '+38 kg' },
  { type: 'checks', bars: 1.25, go: 'UR', theme: 'ivory', items: ['Warm-up', 'Heavy sets', 'Back-off sets', 'Recovery logged'] },
  { type: 'swap', bars: 1, go: 'D', theme: 'coal', lead: 'Last year you', from: 'quit', to: 'lifted', max: 340 },
  { type: 'toggle', bars: 1, go: 'R', theme: 'coal', text: 'Auto-progress _on._', max: 190 },
  { type: 'slot', bars: 1.25, go: 'DL', theme: 'ivory', lead: 'Built for', words: ['beginners', 'comebacks', 'you'], size: 190, leadMax: 200 },
  { type: 'end', rest: true, go: 'L', theme: 'ivory', mark: MARK, lines: ['Forja'], sub: 'get stronger on purpose', cta: 'Start training', max: 340 },
 ] });

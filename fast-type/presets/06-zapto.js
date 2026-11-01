// ZAPTO: 8-minute EV charging. Hazard yellow, black, ultra-wide Unbounded, flat and graphic. Route: DR, L, U, R, DL, UR, L, D, R. Fictional brand, sample copy.
const MARK = `<svg viewBox="0 0 100 100"><path d="M58 4 18 56h26l-6 40 44-56H54z" fill="var(--accent)"/></svg>`;
FastType({ seed: 66, fonts: ['800 100px Unbounded', '600 100px Urbanist', '700 100px Urbanist', 'italic 400 100px Instrument', '500 100px Mono'], theme: 'yellow', pulse: .08, 
 tokens: { display: 'Unbounded', serif: 'Instrument', ui: 'Urbanist', mono: 'Mono', dw: 800, dt: '-.05em', r: '52px', pillr: '.5em', pillr2: '125px', 'card-sh': '0 0 0 4px #0b0b0d,0 26px 0 -6px rgba(0,0,0,.2)', vig: 'rgba(0,0,0,.1)', 'pulse-blend': 'normal' },
 themes: { yellow: { bg: '#ffd400', ink: '#0b0b0d', accent: '#0b0b0d', accent2: '#fff', muted: '#6d5b00', card: '#ffffff', 'card-ink': '#0b0b0d', 'on-accent': '#ffd400', track: '#e0b800', ghost: 'rgba(11,11,13,.1)' }, dark: { bg: '#0b0b0d', ink: '#fbfbf6', accent: '#ffd400', accent2: '#fff', muted: '#8a8a82', card: '#1b1b1f', 'card-ink': '#fbfbf6', 'on-accent': '#0b0b0d', track: '#2c2c32', ghost: 'rgba(255,212,0,.1)' } },
 ghost: [{ t: 'ZAPTO', s: 820, x: -900, y: 200 }],
 beats: [
  { type: 'stack', bars: 1, lines: ['Waiting', 'to charge?'], max: 220 },
  { type: 'counter', bars: 1, go: 'DR', theme: 'dark', label: 'Average charge', from: 0, to: 47, suffix: ' min', size: 230, fill: .95 },
  { type: 'swap', bars: 1, go: 'L', theme: 'yellow', from: '47 min', to: '8 min', max: 300 },
  { type: 'logo', bars: 1.25, go: 'U', theme: 'dark', mark: MARK, name: 'Zapto', max: 300, tag: 'Ultra-fast charging' },
  { type: 'toggle', bars: 1.25, go: 'R', theme: 'yellow', text: 'Plug in. Tap. _Gone._', max: 190 },
  { type: 'gauge', bars: 1.25, go: 'DL', theme: 'dark', unit: 'kilowatts', max: 480, top: .92 },
  { type: 'toasts', bars: 1.5, go: 'UR', theme: 'yellow', items: [['Charging started', 'Bay 3 · 480 kW'], ['80% reached', '6 min 12 sec'], ['Paid automatically', '$11.40']] },
  { type: 'track', bars: 1.25, go: 'L', theme: 'dark', text: 'Coffee takes *longer.*', size: 300 },
  { type: 'stack', bars: 1, go: 'D', theme: 'yellow', lines: ['2,400', 'stations'], max: 300 },
  { type: 'chart', bars: 1.25, go: 'DR', theme: 'yellow', label: 'Network uptime', value: '99.98%', d: 'M0 90 C 140 60, 240 80, 360 50 S 620 40, 860 20' },
  { type: 'slot', bars: 1, go: 'UL', theme: 'dark', lead: 'Now open', words: ['Berlin', 'Austin', 'Dubai', 'near you'], size: 150, leadMax: 170 },
  { type: 'end', rest: true, go: 'R', theme: 'dark', mark: MARK, lines: ['Zapto'], sub: 'never wait to go', cta: 'Find a station', max: 300 },
 ] });

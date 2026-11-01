// NOCTRA: research search that reads everything. Night sky, periwinkle. Route: D, DL, R, U, IN, R, D, UL, R. Fictional brand, sample copy.
const MARK = `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="var(--accent)"/><circle cx="66" cy="38" r="36" fill="var(--bg)"/><circle cx="70" cy="66" r="6" fill="var(--accent)"/></svg>`;
FastType({ seed: 11, pace: 'fast', fonts: ['700 100px Clash', '500 100px InterT', '600 100px InterT', 'italic 400 100px Instrument', '500 100px Mono'], theme: 'night',
 tokens: { display: 'Clash', serif: 'Instrument', ui: 'InterT', mono: 'Mono', dw: 700, dt: '-.035em', r: '46px', 'card-sh': 'inset 0 1px 0 rgba(255,255,255,.14),0 0 0 1px rgba(255,255,255,.07),0 40px 90px rgba(4,6,40,.6)', vig: 'rgba(0,0,10,.5)' },
 themes: { night: { bg: '#07081c', ink: '#f2f3ff', accent: '#8c98ff', accent2: '#3b46d6', muted: '#8589b8', card: '#14163a', 'card-ink': '#f2f3ff', 'on-accent': '#07081c', track: '#262a5c', ghost: 'rgba(140,152,255,.12)' }, day: { bg: '#eef0ff', ink: '#0a0c2e', accent: '#2d3be0', accent2: '#8c98ff', muted: '#6c70a0', card: '#ffffff', 'card-ink': '#0a0c2e', 'on-accent': '#ffffff', track: '#d7daf8', ghost: 'rgba(45,59,224,.1)' } },
 ghost: [{ t: 'NOCTRA', s: 900, x: -900, y: -300 }, { t: 'NOCTRA', s: 900, x: -1800, y: 1500 }],
 beats: [
  { type: 'stack', bars: 1, lines: ['Every answer', 'is _out+there._'] },
  { type: 'giant', bars: 1, go: 'D', text: 'SOMEWHERE', size: 520 },
  { type: 'track', bars: 1.5, go: 'DL', text: "You just can't *reach* it.", size: 280 },
  { type: 'logo', bars: 1.25, go: 'R', theme: 'day', mark: MARK, name: 'Noctra' },
  { type: 'search', bars: 1.5, go: 'U', theme: 'day', lead: 'Ask anything', text: 'Who solved this first?', answer: 'Found in 41 papers', results: ['Found in 41 papers', 'Two sources disagree', 'Summary ready'] },
  { type: 'orbit', bars: 1.25, go: 'IN', theme: 'night', text: '12 BILLION PAPERS · ONE QUESTION · ALL OF IT, READ · ' },
  { type: 'counter', bars: 1, go: 'R', label: 'Sources read', to: 12400000, suffix: '', size: 210 },
  { type: 'toasts', bars: 1.5, go: 'D', items: [['Answer found', 'Cited from 41 papers'], ['Conflict flagged', '2 sources disagree'], ['Summary ready', 'Took 3 seconds']] },
  { type: 'slot', bars: 1.25, go: 'UL', lead: 'Hours become', words: ['minutes', 'seconds', 'nothing'], size: 170 },
  { type: 'stack', bars: .75, go: 'U', theme: 'day', lines: ['See *further.*'], max: 250 },
  { type: 'chart', bars: 1, go: 'DR', label: 'Citations checked', value: '100%', d: 'M0 300 C 120 280, 200 120, 300 100 S 560 40, 860 24' },
  { type: 'end', rest: true, go: 'D', theme: 'night', mark: MARK, lines: ['Noctra'], sub: 'the whole sky, searchable', cta: 'Try it free', max: 300 },
 ] });

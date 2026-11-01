// KURYR: same-hour delivery. Night, hot coral on midnight, racing condensed italics feel. Bars are long here (3.17 s), so beats are short fractions. Route: R, DL, U, L, DR, UL, D. Fictional brand, sample copy.
const MARK = `<svg viewBox="0 0 100 100"><rect x="6" y="6" width="88" height="88" rx="24" fill="var(--accent)"/><path d="M30 24v52M70 24 42 50l30 26" fill="none" stroke="var(--on-accent)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
FastType({ seed: 88, fonts: ['800 100px Saira', '500 100px Cabinet', '700 100px Cabinet', 'italic 400 100px Instrument', '500 100px Mono'], theme: 'mid', pulse: .15, kickZ: 60,
 tokens: { display: 'Saira', serif: 'Instrument', ui: 'Cabinet', mono: 'Mono', dw: 800, dt: '-.012em', up: 'uppercase', r: '34px', pillr: '.1em', pillr2: '22px', 'card-sh': 'inset 0 1px 0 rgba(255,255,255,.12),0 0 0 1px rgba(255,255,255,.07),0 40px 90px rgba(0,0,20,.65)', vig: 'rgba(0,0,12,.55)' },
 themes: { mid: { bg: '#0a0c1f', ink: '#f6f7ff', accent: '#ff4d4d', accent2: '#ff9a3d', muted: '#7f84ac', card: '#171a35', 'card-ink': '#f6f7ff', 'on-accent': '#0a0c1f', track: '#2b2f55', ghost: 'rgba(255,77,77,.13)' }, hot: { bg: '#ff4d4d', ink: '#0a0c1f', accent: '#0a0c1f', accent2: '#fff', muted: '#6d0f0f', card: '#0a0c1f', 'card-ink': '#f6f7ff', 'on-accent': '#ff5c5c', track: '#d83636', ghost: 'rgba(10,12,31,.13)' } },
 ghost: [{ t: 'KURYR', s: 1100, x: -800, y: -300 }, { t: 'NOW', s: 1100, x: -1400, y: 1300 }],
 beats: [
  { type: 'stack', bars: .45, lines: ['Why', 'wait?'], max: 460, lh: .94 },
  { type: 'giant', bars: .55, go: 'R', theme: 'hot', text: 'NO DELAY', size: 560 },
  { type: 'search', bars: .75, go: 'DL', theme: 'mid', lead: 'Deliver to', text: '42 Harbor St, now', answer: 'Arriving in 11 min', results: ['Arriving in 11 min', 'Rider 400 m away', 'No surge today'] },
  { type: 'logo', bars: .75, go: 'U', theme: 'mid', mark: MARK, name: 'Kuryr', max: 420, tag: 'Anything. Within the hour.' },
  { type: 'gauge', bars: .75, go: 'L', theme: 'mid', unit: 'minutes saved', max: 96, top: .9 },
  { type: 'toasts', bars: .9, go: 'DR', theme: 'hot', items: [['Order picked up', '2 minutes ago'], ['Rider 400 m away', 'Arriving in 90 sec'], ['Delivered', '11 min, door to door']] },
  { type: 'slot', bars: .75, go: 'UL', theme: 'mid', lead: 'Now in', words: ['Lisbon', 'Lagos', 'Karachi', 'your city'], size: 240, leadMax: 260 },
  { type: 'track', bars: .75, go: 'D', theme: 'mid', text: 'Your day stays *yours.*', size: 330 },
  { type: 'counter', bars: .6, go: 'R', theme: 'hot', label: 'Delivered today', from: 180000, to: 240112, size: 270, fill: .88 },
  { type: 'chart', bars: .7, go: 'UL', theme: 'mid', label: 'Average wait', value: '-71%', d: 'M0 30 C 140 50, 240 150, 380 190 S 620 300, 860 330' },
  { type: 'toggle', bars: .6, go: 'DL', theme: 'mid', text: 'Auto-reorder _on._', max: 240 },
  { type: 'checks', bars: .5, go: 'U', theme: 'hot', items: ['No minimums', 'No surge', 'No waiting'] },
  { type: 'end', rest: true, go: 'R', theme: 'hot', mark: MARK, lines: ['Kuryr'], sub: 'order before you finish this', cta: 'Get the app', max: 460 },
 ] });

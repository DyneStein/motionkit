// AMPORA: portable speaker launch. Deep aubergine and amber, tall stadium caps. Route: UR, D, L, U, DR, L, UR, D. Fictional brand, sample copy.
const MARK = `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="var(--accent)"/><circle cx="50" cy="50" r="27" fill="var(--on-accent)"/><circle cx="50" cy="50" r="11" fill="var(--accent)"/></svg>`;
FastType({ seed: 55, fonts: ['900 100px Big', '500 100px Sora', '600 100px Sora', 'italic 400 100px Instrument', '500 100px Mono'], theme: 'stage', pulse: .18, kickZ: 66,
 tokens: { display: 'Big', serif: 'Instrument', ui: 'Sora', mono: 'Mono', dw: 900, dt: '-.012em', up: 'uppercase', r: '40px', 'card-sh': 'inset 0 1px 0 rgba(255,255,255,.1),0 0 0 1px rgba(255,180,80,.12),0 40px 90px rgba(10,0,20,.7)', vig: 'rgba(5,0,10,.55)' },
 themes: { stage: { bg: '#170a1f', ink: '#fff2df', accent: '#ffab2e', accent2: '#ff3d77', muted: '#a18ca8', card: '#26142f', 'card-ink': '#fff2df', 'on-accent': '#170a1f', track: '#3d2548', ghost: 'rgba(255,171,46,.12)' }, amber: { bg: '#ffab2e', ink: '#170a1f', accent: '#170a1f', accent2: '#ff3d77', muted: '#7e4d00', card: '#170a1f', 'card-ink': '#fff2df', 'on-accent': '#ffab2e', track: '#d98b17', ghost: 'rgba(23,10,31,.12)' } },
 ghost: [{ t: 'AMPORA', s: 1100, x: -800, y: -420 }, { t: 'LOUD', s: 1100, x: -1500, y: 1200 }],
 beats: [
  { type: 'stack', bars: .75, lines: ['Small', 'speakers', 'lie.'], max: 390, lh: .96 },
  { type: 'giant', bars: 1, go: 'UR', theme: 'amber', text: 'TURN IT UP', size: 620 },
  { type: 'player', bars: 1.25, go: 'D', theme: 'stage', title: 'Montagem Pegadora', sub: 'Rock version · slowed' },
  { type: 'logo', bars: 1, go: 'L', mark: MARK, name: 'Ampora', max: 360, tag: 'Stadium sound. Pocket size.' },
  { type: 'gauge', bars: 1.25, go: 'U', unit: 'decibels', max: 118, top: .9 },
  { type: 'counter', bars: 1, go: 'DR', theme: 'amber', label: 'Battery', to: 40, suffix: ' hrs', size: 360, fill: .9 },
  { type: 'toggle', bars: 1, go: 'L', theme: 'stage', text: 'Bass mode _on._', max: 220 },
  { type: 'slot', bars: 1.25, go: 'UR', lead: 'Built for', words: ['rooftops', 'road trips', 'rain', 'you'], size: 210, leadMax: 240 },
  { type: 'checks', bars: 1, go: 'DL', theme: 'stage', items: ['Waterproof', 'Pairs in 2 sec', 'Fits a jacket'] },
  { type: 'track', bars: 1.25, go: 'R', theme: 'amber', text: 'You will *feel* it.', size: 420 },
  { type: 'end', rest: true, go: 'D', theme: 'stage', mark: MARK, lines: ['Ampora'], sub: 'hear all of it', cta: 'Pre-order now', max: 380 },
 ] });

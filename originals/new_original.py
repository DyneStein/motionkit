#!/usr/bin/env python3
"""Creates a slow, cinematic film in one of the original MotionKit styles, timed to the user's song.
usage: new_original.py <outdir> --style tally|nook|aura|lumen --song <file> [--rename Old=New ...] [--start SEC] [--title Name]
The song is mapped first. Its window is chosen so the brand reveal lands on one of the song's biggest moments, and the film's events snap to the song's real hits.
Then edit the copy in compositions/*.html for the actual brand. Styles keep their own length: Tally 27 s landscape; Nook 26 s, Aura 27 s, Lumen 31.5 s vertical."""
import argparse, json, os, re, shutil, subprocess, sys, glob
H = os.path.dirname(os.path.abspath(__file__)); KIT = os.path.dirname(H)
STY = {'tally': ('d-saas-tally', 24.11), 'nook': ('b-morph-nook', None), 'aura': ('c-neon-aura', 23.35), 'lumen': ('a-ember-lumen', None)}
ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--style', required=True, choices=STY); ap.add_argument('--song', required=True); ap.add_argument('--rename', action='append', default=[]); ap.add_argument('--start', type=float); ap.add_argument('--title'); a = ap.parse_args()
sample, hero = STY[a.style]; P = a.out
shutil.copytree(f'{KIT}/samples/{sample}', P, ignore=shutil.ignore_patterns('.hyperframes', '.snap', 'renders', '*.mp3', 'MUSIC.md', 'AGENTS.md', 'CLAUDE.md', 'node_modules'), dirs_exist_ok=True); AS = f'{P}/assets'; os.makedirs(AS, exist_ok=True)
idx = open(f'{P}/index.html').read(); dur = float(re.search(r'data-composition-id="main"[^>]*data-duration="([\d.]+)"', idx).group(1)); hero = hero if hero is not None else dur - 4
amap = [sys.executable, f'{KIT}/audio-map/audio_map.py', a.song, AS]
subprocess.run(amap + ['--len', str(dur), '--no-cut'], check=True, capture_output=True); M = json.load(open(f'{AS}/audio-map.json'))
start = a.start
if start is None:   # land the brand on the strongest moment that leaves room for the whole film
    best = None
    for q in M['moments']:
        s = q['t'] - hero
        if s >= 0 and s + dur <= M['duration'] - .2 and (best is None or q['score'] > best['score']): best = q
    start = (best['t'] - hero) if best else M['window']['start']
print(subprocess.run(amap + ['--len', str(dur), '--start', f'{start:.3f}'], check=True, capture_output=True, text=True).stdout.strip())
au = json.load(open(f'{AS}/audio.json')); # slow films answer the song's accents, not every hit: strongest first, spaced so events have room
picked = []
for h in sorted(au['H'], key=lambda h: -h['s']):
    if len(picked) >= dur * 1.4: break
    if all(abs(h['t'] - q) >= .42 for q in picked): picked.append(h['t'])
hits = sorted(picked); hs = '[' + ', '.join(f'{t:.3f}' for t in hits) + ']'
idx = re.sub(r'(<audio id="music"[^>]*?src=")[^"]+(")', r'\1assets/song.m4a\2', idx); open(f'{P}/index.html', 'w').write(idx)
for f in glob.glob(f'{P}/compositions/*.html'):
    t = open(f).read(); n = 0
    t, c = re.subn(r'const HITS = \[[^\]]*\];', f'const HITS = {hs};', t); n += c
    t = re.sub(r'beatSync\(TL, HITS, \{ t0: ([\d.]+) \}\)', r'beatSync(TL, HITS, { t0: \1, tol: 0.3 })', t)
    # Tally is laid out on a beat grid: keep its structure and let each beat land on the nearest real hit
    t, c = re.subn(r'const beat = \(n\) => \+\(0\.11 \+ 0\.6 \* n\)\.toFixed\(3\);', f'const HITS = {hs}; const WARP = (() => {{ const T = []; let prev = -1; for (let i = 0; i <= 200; i++) {{ const x = 0.11 + 0.15 * i; let b = x, d = .31; if (i % 4 === 0) for (const h of HITS) {{ const q = Math.abs(h - x); if (q < d) {{ d = q; b = h; }} }} if (i % 4 === 0 && b < prev + .3) b = Math.max(x, prev + .3); T.push(b); prev = b; }} for (let i = 0; i < 200; i += 4) for (let k = 1; k < 4; k++) if (i + 4 <= 200) T[i + k] = T[i] + (T[i + 4] - T[i]) * k / 4; return T; }})(); const beat = (n) => {{ const q = Math.max(0, n * 4), i = Math.min(199, Math.floor(q)); return +(WARP[i] + (WARP[i + 1] - WARP[i]) * (q - i)).toFixed(3); }};', t); n += c
    for r in a.rename:
        old, new = r.split('=', 1); t = t.replace(old, new); t = t.replace(old.lower(), new.lower()) if old.lower() != old else t
        letters = lambda w: ''.join(f'<span>{c}</span>' for c in w); t = t.replace(letters(old.lower()), letters(new.lower()))
    open(f, 'w').write(t)
if a.title: json.dump({"id": "original-" + re.sub(r'\W+', '-', a.title.lower()), "name": a.title}, open(f'{P}/meta.json', 'w'))
print(f'ready {P} | {a.style} {dur}s | song from {start:.2f}s | brand lands at film {hero:.2f}s | {len(hits)} strong hits')

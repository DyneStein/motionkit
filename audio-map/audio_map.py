#!/usr/bin/env python3
"""MotionKit audio analyser: reads a song the way an editor does, so a film can be cut to it.
usage: audio_map.py <song> <outdir> [--len 30] [--start SEC] [--no-cut]
Writes: audio-map.json (whole song), song-graph.png (see it), and, unless --no-cut, song.m4a + audio.json (the chosen window, film time).
Hits: log-spectral flux per band with adaptive thresholds, each scored for strength. Moments: the song's biggest peaks and drops.
Needs ffmpeg, numpy, scipy, Pillow. Works only on music the user supplies; it never generates any."""
import argparse, json, os, subprocess, sys
import numpy as np
from scipy.ndimage import maximum_filter1d, median_filter, uniform_filter1d
from scipy.signal import find_peaks, stft
SR, HOP, NFFT = 22050, 128, 1024
FPS = SR / HOP
BANDS = {'kick': (25, 130), 'snare': (130, 300), 'bell': (300, 1400), 'hat': (1400, 9000)}
COL = {'kick': (255, 92, 92), 'snare': (255, 176, 66), 'bell': (102, 214, 255), 'hat': (160, 160, 190)}

def load(p):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32)
def rank(x):
    o = np.argsort(np.argsort(x)); return o / max(1, len(x) - 1)

def analyse(x):
    f, _, Z = stft(x, SR, nperseg=NFFT, noverlap=NFFT - HOP, boundary=None, padded=False); S = np.log1p(np.abs(Z) * 100)
    n = S.shape[1]; times = (np.arange(n) * HOP + NFFT / 2) / SR   # frames are centred on their window
    raw = {}; flux = {}
    for b, (lo, hi) in BANDS.items():
        m = (f >= lo) & (f < hi); B = S[m]
        B2 = maximum_filter1d(B, 3, axis=0)                          # SuperFlux-style: ignore small pitch wobble
        fx = np.maximum(0, B[:, 3:] - B2[:, :-3]).mean(0); fx = np.concatenate([np.zeros(3), fx]); flux[b] = fx
        raw[b] = np.sqrt((np.abs(Z[m])**2).sum(0))
    amp = np.sqrt((np.abs(Z)**2).sum(0)); db = 20 * np.log10(amp + 1e-5)
    loud = uniform_filter1d(db, int(FPS * .4)); slow = uniform_filter1d(db, int(FPS * 3))
    hits = []
    for b, fx in flux.items():
        win = int(FPS * 1.2) | 1; thr = median_filter(fx, win, mode='nearest') + np.percentile(fx, 70) * .7
        pk, _ = find_peaks(fx, height=thr, distance=int(FPS * (.11 if b in ('kick', 'snare') else .085)))
        if not len(pk): continue
        w = {'kick': 1.2, 'snare': 1, 'bell': .82, 'hat': .55}[b]; mag = rank(fx[pk])
        for i, q in zip(pk, mag): hits.append(dict(i=int(i), b=b, m=float(q) * w))
    hits.sort(key=lambda h: h['i'])
    merged = []
    for h in hits:
        if merged and h['i'] - merged[-1]['i'] < FPS * .045:
            if h['m'] > merged[-1]['m']: merged[-1].update(b=h['b'], m=h['m'])
            merged[-1]['m'] += .12
        else: merged.append(dict(h))
    # strength = how hard it hits + how much it rises above what came just before + how loud that part of the song is
    out = []
    for h in merged:
        i = h['i']; a0 = max(0, i - int(FPS * .35)); a1 = min(n, i + int(FPS * .12)); contrast = float(np.max(db[i:a1]) - np.mean(db[a0:i + 1])) if i > 0 else 0
        h['c'] = contrast; h['l'] = float(loud[i])
    c = rank(np.array([h['c'] for h in merged])); l = rank(np.array([h['l'] for h in merged])); m = np.array([h['m'] for h in merged]); m = m / m.max()
    s = .5 * m + .28 * c + .22 * l
    for h, v in zip(merged, s): out.append(dict(t=round(float(times[h['i']]), 3), s=round(float(v), 3), b=h['b']))
    vals = np.array([h['s'] for h in out]); lo, hi = np.percentile(vals, 5), np.percentile(vals, 99.5)
    for h in out: h['s'] = round(float(np.clip((h['s'] - lo) / (hi - lo), 0, 1)), 3)
    return dict(times=times, db=db, loud=loud, slow=slow, raw=raw, flux=flux, hits=out, n=n)

def tempo(a):
    fx = a['flux']['kick'] + a['flux']['snare'] + .7 * a['flux']['bell']; o = fx - fx.mean(); ac = np.fft.irfft(np.abs(np.fft.rfft(o, 2 * len(o)))**2)[:int(FPS * 2.2)]
    lmin, lmax = int(FPS * 60 / 170), int(FPS * 60 / 72); cand = [(ac[l] * (1 + .15 * np.exp(-((60 * FPS / l - 120) / 50)**2)), l) for l in range(lmin, lmax)]; bestv, lag = max(cand); bpm = 60 * FPS / lag
    best = (-1, bpm, 0)
    for b in np.arange(bpm * .98, bpm * 1.02, .02):
        per = 60 * FPS / b
        for ph in np.arange(0, per, per / 48):
            idx = (ph + np.arange(0, (len(fx) - ph) / per) * per).astype(int); v = fx[idx].sum()
            if v > best[0]: best = (v, b, ph / FPS)
    return dict(bpm=round(float(best[1]), 2), phase=round(float(best[2]), 3), confidence=round(float(bestv / (ac[0] + 1e-9)), 3))

def structure(a, dur):
    t = a['times']; lv = a['loud'][::int(FPS * .1)]; tt = t[::int(FPS * .1)]; lvs = uniform_filter1d(lv, 12); d = np.abs(lvs[20:] - lvs[:-20]); pk, _ = find_peaks(d, distance=50, prominence=d.std() * .9); cuts = [0.] + [float(tt[i + 10]) for i in pk] + [dur]
    p35, p70 = np.percentile(lv, 35), np.percentile(lv, 72); secs = []
    for x, y in zip(cuts[:-1], cuts[1:]):
        if y - x < .6: continue
        v = float(lv[(tt >= x) & (tt < y)].mean()); secs.append(dict(start=round(x, 2), end=round(y, 2), level=round(v, 1), kind='quiet' if v < p35 else 'loud' if v > p70 else 'mid'))
    # moments: biggest hits, boosted when the song's energy jumps there
    H = a['hits']; ms = []
    for h in H:
        i = np.searchsorted(t, h['t']); bf = a['loud'][max(0, i - int(FPS * 1.2)):max(1, i - int(FPS * .05))].mean(); af = a['loud'][i:i + int(FPS * .9)].mean() if i < a['n'] - 2 else bf; rise = float(af - bf)
        ms.append(dict(t=h['t'], s=h['s'], rise=round(rise, 2), b=h['b'], score=round(h['s'] + max(0, rise) * .085, 3)))
    ms.sort(key=lambda q: -q['score']); top = []
    for q in ms:
        if all(abs(q['t'] - o['t']) > 2.4 for o in top): q['kind'] = 'drop' if q['rise'] > 2.2 else 'peak'; top.append(q)
        if len(top) >= 24: break
    return secs, top

def pick_window(a, top, L, dur):
    if dur <= L + .5: return 0., []
    cand = []; H = np.array([[h['t'], h['s']] for h in a['hits']]); t = a['times']; loud = a['loud']; floor = np.percentile(loud, 40)
    for q in top + [dict(t=x, score=.1) for x in np.arange(0, dur - L, 2.)]:
        for pre in (.2, 1.2, 2.2):
            st = q['t'] - pre
            if st < 0 or st + L > dur: continue
            mask = (H[:, 0] >= st) & (H[:, 0] < st + L); sv = H[mask, 1]
            if len(sv) < 12: continue
            i0, i1 = np.searchsorted(t, st), np.searchsorted(t, st + L); lv = loud[i0:i1]; inm = [o for o in top if st <= o['t'] < st + L]
            first = H[mask][H[mask, 1] > .45]; lateStart = first[0, 0] - st if len(first) else 9
            s = np.sort(sv)[-12:].mean() * 2 + sum(o['score'] for o in inm) * .22 + float((lv > floor).mean()) * 1.2 + (q.get('score', 0)) * .6 - max(0, lateStart - 2.4) * .5
            cand.append((float(s), float(st)))
    cand.sort(reverse=True); picks = []
    for s, st in cand:
        if all(abs(st - p[1]) > L * .5 for p in picks): picks.append((s, st))
        if len(picks) == 3: break
    return (picks[0][1] if picks else 0.), [dict(start=round(p[1], 2), score=round(p[0], 2)) for p in picks]

def graph(path, a, secs, top, dur, win, name):
    from PIL import Image, ImageDraw, ImageFont
    W, H = 2400, 900; im = Image.new('RGB', (W, H), (14, 15, 22)); d = ImageDraw.Draw(im); L, Rr, T0, Y0, Y1 = 90, 40, 96, 590, 800
    try: F, F2, F3 = (ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', s) for s in (30, 22, 18))
    except Exception: F = F2 = F3 = ImageFont.load_default()
    X = lambda t: L + (W - L - Rr) * t / dur
    secc = {'quiet': (26, 30, 46), 'mid': (32, 36, 56), 'loud': (46, 40, 64)}
    for s in secs: d.rectangle([X(s['start']), T0, X(s['end']), Y0], fill=secc[s['kind']])
    if win:
        d.rectangle([X(win[0]), T0, X(win[1]), Y1], outline=(120, 255, 170), width=3); d.text((X(win[0]) + 8, T0 + 6), 'FILM WINDOW', font=F2, fill=(120, 255, 170))
    t = a['times']; lv = a['loud']; lo, hi = np.percentile(lv, 2), np.percentile(lv, 99.8); step = max(1, len(t) // 2200); pts = [(X(t[i]), Y0 - (Y0 - T0 - 20) * np.clip((lv[i] - lo) / (hi - lo), 0, 1)) for i in range(0, len(t), step)]
    d.polygon([(pts[0][0], Y0)] + pts + [(pts[-1][0], Y0)], fill=(78, 86, 150)); d.line(pts, fill=(170, 180, 255), width=2)
    for h in a['hits']:
        if h['s'] < .3: continue
        d.line([X(h['t']), Y1, X(h['t']), Y1 - (Y1 - Y0 - 20) * h['s']], fill=COL[h['b']], width=1)
    for i, q in enumerate(top[:12]):
        x = X(q['t']); c = (255, 225, 90) if q.get('kind') == 'peak' else (255, 110, 150); d.line([x, T0 + 34, x, Y1], fill=c, width=2); d.ellipse([x - 15, T0 + 20, x + 15, T0 + 50], fill=c); d.text((x, T0 + 35), str(i + 1), font=F3, fill=(14, 15, 22), anchor='mm')
    tick = 10 if dur < 150 else 30
    for s in np.arange(0, dur, tick): d.line([X(s), Y1, X(s), Y1 + 8], fill=(150, 150, 170)); d.text((X(s), Y1 + 14), f'{int(s // 60)}:{int(s % 60):02d}', font=F3, fill=(170, 170, 190), anchor='ma')
    d.text((L, 24), name[:70], font=F, fill=(240, 240, 250)); d.text((L, Y0 + 2), 'Hits by strength', font=F3, fill=(150, 150, 170)); x0 = W - 780
    for lab, c in [('kick', COL['kick']), ('snare', COL['snare']), ('bell', COL['bell']), ('hat', COL['hat']), ('peak', (255, 225, 90)), ('drop', (255, 110, 150))]: d.rectangle([x0, 34, x0 + 18, 52], fill=c); d.text((x0 + 26, 32), lab, font=F2, fill=(210, 210, 225)); x0 += 124
    d.text((L, H - 44), 'Numbers rank the song\'s biggest moments (1 = biggest). Curve = loudness. Shading = quiet / mid / loud sections.', font=F2, fill=(160, 160, 180)); im.save(path)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('song'); ap.add_argument('out'); ap.add_argument('--len', type=float, default=30); ap.add_argument('--start', type=float); ap.add_argument('--no-cut', action='store_true'); a0 = ap.parse_args(); os.makedirs(a0.out, exist_ok=True)
    x = load(a0.song); dur = len(x) / SR; a = analyse(x); tp = tempo(a); secs, top = structure(a, dur); start, alts = (a0.start, []) if a0.start is not None else pick_window(a, top, a0.len, dur); L = min(a0.len, dur - start)
    json.dump(dict(song=os.path.basename(a0.song), duration=round(dur, 2), tempo=tp, sections=secs, moments=top, hits=a['hits'], window=dict(start=round(start, 3), length=round(L, 3)), alternatives=alts), open(f'{a0.out}/audio-map.json', 'w'))
    graph(f'{a0.out}/song-graph.png', a, secs, top, dur, (start, start + L), os.path.basename(a0.song))
    print(f"tempo {tp['bpm']} bpm (confidence {tp['confidence']}) | {len(a['hits'])} hits | {len(secs)} sections | window {start:.2f}s + {L:.1f}s | top moments " + ', '.join(f"{q['t']:.1f}s {q['kind']}" for q in top[:5]))
    if a0.no_cut: return
    fade = 1.2; subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{start:.3f}', '-t', f'{L:.3f}', '-i', a0.song, '-af', f'afade=t=in:st=0:d=0.02,afade=t=out:st={L - fade:.3f}:d={fade}', '-c:a', 'aac', '-b:a', '256k', f'{a0.out}/song.m4a'], check=True)
    H = [dict(t=round(h['t'] - start, 3), s=h['s'], b=h['b']) for h in a['hits'] if start <= h['t'] < start + L]; M = [dict(t=round(q['t'] - start, 3), score=q['score'], kind=q['kind']) for q in top if start <= q['t'] < start + L]
    i0, i1 = int(start * FPS), int((start + L + .4) * FPS); dec = max(1, int(FPS / 120)); norm = lambda e: np.clip(e / (np.percentile(e, 97) + 1e-6), 0, 1.4)
    r = lambda v: [round(float(q), 3) for q in v]; low, mid, high = a['raw']['kick'][i0:i1], a['raw']['bell'][i0:i1], a['raw']['hat'][i0:i1]
    spb = 60 / tp['bpm']; rmsv = np.sqrt(low**2 + mid**2 + high**2)
    json.dump(dict(fps=round(FPS / dec, 4), dur=round(L, 3), srcStart=round(start, 3), bpm=tp['bpm'], spb=round(spb, 5), t0=round((tp['phase'] - start) % spb, 4), bar=round(4 * spb, 4), H=H, moments=M, kicks=[h['t'] for h in H if h['b'] == 'kick'], bells=[h['t'] for h in H if h['b'] == 'bell'], hits=[h['t'] for h in H if h['s'] > .62], lowE=r(norm(low)[::dec]), midE=r(norm(mid)[::dec]), highE=r(norm(high)[::dec]), rmsE=r(norm(rmsv)[::dec])), open(f'{a0.out}/audio.json', 'w'))
main()

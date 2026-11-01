#!/usr/bin/env python3
"""Does the picture answer the song's biggest hits? usage: sync_report.py <render.mp4> <audio.json> [--top 24]
A visual event is a rise in frame-to-frame change. Reports the share of the song's top hits with a visual event within +-70 ms, against chance."""
import argparse, json, subprocess, numpy as np
ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('audio'); ap.add_argument('--top', type=int, default=24); a = ap.parse_args()
A = json.load(open(a.audio)); FPS = 30; W, H0 = 108, 192
r = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.video, '-vf', f'fps={FPS},scale={W}:{H0},format=gray', '-f', 'rawvideo', '-'], capture_output=True); f = np.frombuffer(r.stdout, np.uint8); n = len(f) // (W * H0); f = f[:n * W * H0].reshape(n, H0, W).astype(np.float32)
d = np.abs(f[1:] - f[:-1]).mean((1, 2)); dv = np.maximum(0, np.diff(d)); t = (np.arange(len(dv)) + 1.5) / FPS; thr = np.median(dv) + 1.2 * (np.percentile(dv, 90) - np.median(dv))
vis = []; last = -1
for i in range(1, len(dv) - 1):
    if dv[i] > thr and dv[i] >= dv[i - 1] and dv[i] >= dv[i + 1] and t[i] - last > .12: vis.append(t[i]); last = t[i]
vis = np.array(vis); H = sorted(A['H'], key=lambda h: -h['s']); top = np.array([h['t'] for h in H if h['t'] < A['dur'] - 1.4][:a.top])
cover = lambda v, q: float(np.mean([np.min(np.abs(v - x)) <= .07 for x in q])) if len(v) else 0
c = cover(vis, top); rng = np.random.default_rng(0); base = np.mean([cover(np.sort((vis + rng.uniform(.2, 1.)) % A['dur']), top) for _ in range(40)])
print(f"{a.video.split('/')[-1]:22s} top {len(top)} hits answered {c * 100:3.0f}% vs chance {base * 100:3.0f}% (x{c / base if base else 0:.2f})")

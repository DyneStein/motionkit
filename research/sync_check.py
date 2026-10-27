"""How tightly do visual events land on the music?
Usage: python3 sync_check.py <video.mp4> [window_ms=70]
Visual events = peaks in the frame-to-frame change curve (pops, cuts, arrivals, flashes).
Audio events  = peaks in the audio onset envelope (kicks, snares, hits).
Reports: share of visual events within ±window of an audio event, vs a chance baseline
(the same events shifted by random offsets), and the mean signed offset (visual − audio, ms).
"""
import subprocess, sys
import numpy as np

path = sys.argv[1]; WIN = (float(sys.argv[2]) if len(sys.argv) > 2 else 70) / 1000
FPS = 30


def peaks(x, t, min_gap, k):
    thr = np.median(x) + k * (np.percentile(x, 90) - np.median(x))
    out, last = [], -1e9
    for i in range(1, len(x) - 1):
        if x[i] > thr and x[i] >= x[i - 1] and x[i] >= x[i + 1] and t[i] - last >= min_gap:
            out.append(t[i]); last = t[i]
    return np.array(out)


# visual change curve
raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={FPS},scale=160:-2,format=gray", "-f", "rawvideo", "-"])
w, h = 160, None
n = len(raw)
probe = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", path]).decode().split(",")
h = int(round(160 * int(probe[1]) / int(probe[0]) / 2)) * 2
fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))
dv = np.maximum(0, np.diff(d))                     # rises in change = something starts/hits
tv = (np.arange(len(dv)) + 1.5) / FPS
vis = peaks(dv, tv, 0.25, 1.2)

# audio onset envelope
sr = 22050
a = np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"]), np.int16).astype(np.float32)
hop, nfft = 256, 1024
frames = np.lib.stride_tricks.sliding_window_view(a, nfft)[::hop] * np.hanning(nfft)
mag = np.abs(np.fft.rfft(frames, axis=1))
flux = np.maximum(0, np.diff(np.log1p(mag), axis=0)).sum(axis=1)
ta = (np.arange(len(flux)) + 1) * hop / sr
aud = peaks(flux, ta, 0.12, 1.0)

def score(v, au):
    if len(v) == 0 or len(au) == 0: return 0.0, 0.0
    dd = np.array([au[np.argmin(np.abs(au - x))] - x for x in v])
    hit = np.abs(dd) <= WIN
    return float(hit.mean()), float(-dd[hit].mean() * 1000) if hit.any() else 0.0

hit, off = score(vis, aud)
rng = np.random.default_rng(0)
dur = tv[-1]
base = np.mean([score(np.sort((vis + rng.uniform(0.2, 1.0)) % dur), aud)[0] for _ in range(40)])
print(f"{path.split('/')[-1]}: visual events {len(vis)}, audio events {len(aud)} | on-beat {hit*100:.0f}% vs chance {base*100:.0f}% "
      f"(lift x{hit / base if base else 0:.2f}) | mean offset {off:+.0f} ms (+ = visual late)")

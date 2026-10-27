"""Strong audio hits for beat-syncing visuals (spectral-flux peaks, same detector as sync_check.py).
Usage: python3 audio_hits.py <audio-or-video> [max_s] [min_gap_s=0.3] [k=1.6]
Prints a JSON array of hit times (s). Raise k for fewer, stronger hits.
"""
import json, subprocess, sys
import numpy as np

path = sys.argv[1]
MAX = float(sys.argv[2]) if len(sys.argv) > 2 else 1e9
GAP = float(sys.argv[3]) if len(sys.argv) > 3 else 0.3
K = float(sys.argv[4]) if len(sys.argv) > 4 else 1.6
sr, hop, nfft = 22050, 256, 1024
a = np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"]), np.int16).astype(np.float32)
fr = np.lib.stride_tricks.sliding_window_view(a, nfft)[::hop] * np.hanning(nfft)
flux = np.maximum(0, np.diff(np.log1p(np.abs(np.fft.rfft(fr, axis=1))), axis=0)).sum(axis=1)
t = (np.arange(len(flux)) + 1) * hop / sr
thr = np.median(flux) + K * (np.percentile(flux, 90) - np.median(flux))
cand = [(t[i], flux[i]) for i in range(1, len(flux) - 1) if flux[i] > thr and flux[i] >= flux[i - 1] and flux[i] >= flux[i + 1] and t[i] <= MAX]
out = []
for ti, v in cand:  # strongest within each GAP neighbourhood
    if out and ti - out[-1][0] < GAP:
        if v > out[-1][1]: out[-1] = (ti, v)
    else:
        out.append((ti, v))
print(json.dumps([round(x, 3) for x, _ in out]))

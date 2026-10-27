"""Global camera-motion estimate per clip: zoom (scale search) + pan (phase correlation) at 10 fps.
Usage: python3 camera.py <clips_dir> <out.json> [vid ...]
"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image

CLIPS, OUT = sys.argv[1], sys.argv[2]
ONLY = sys.argv[3:]
FPS, W = 10, 192
SCALES = [0.96, 0.975, 0.985, 0.99, 0.994, 0.997, 1.0, 1.003, 1.006, 1.01, 1.015, 1.025, 1.04]
STRIDE = 3  # compare frames 0.3 s apart: slow, smooth dollies become measurable


def frames(p):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                   "stream=width,height", "-of", "csv=p=0", p]).decode().strip().split(",")
    w, h = int(out[0]), int(out[1])
    H = int(round(W * h / w / 2)) * 2
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", p, "-vf", f"fps={FPS},scale={W}:{H},format=gray",
                                   "-f", "rawvideo", "-"])
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)


def zoomed(img, s):
    if s == 1.0:
        return img
    H, W_ = img.shape
    im = Image.fromarray(img)
    nw, nh = int(round(W_ * s)), int(round(H * s))
    r = np.asarray(im.resize((nw, nh), Image.BILINEAR), np.float32)
    out = np.full_like(img, img.mean())
    if s > 1:
        x0, y0 = (nw - W_) // 2, (nh - H) // 2
        out = r[y0:y0 + H, x0:x0 + W_]
    else:
        x0, y0 = (W_ - nw) // 2, (H - nh) // 2
        out[y0:y0 + nh, x0:x0 + nw] = r
    return out


def phase(a, b, win):
    A = np.fft.fft2((a - a.mean()) * win); B = np.fft.fft2((b - b.mean()) * win)
    R = A * np.conj(B); R /= np.abs(R) + 1e-6
    c = np.fft.ifft2(R).real
    H, W_ = c.shape
    iy, ix = np.unravel_index(np.argmax(c), c.shape)
    def sub(m, p, n):  # parabolic sub-pixel peak
        a, b, d = m[(p - 1) % n], m[p], m[(p + 1) % n]
        den = a - 2 * b + d
        return 0.0 if den == 0 else 0.5 * (a - d) / den
    dx = ix + sub(c[iy, :], ix, W_); dy = iy + sub(c[:, ix], iy, H)
    if dy > H / 2: dy -= H
    if dx > W_ / 2: dx -= W_
    return c.max(), dx, dy


res = {}
for fn in sorted(os.listdir(CLIPS)):
    vid = fn.rsplit(".", 1)[0]
    if ONLY and vid not in ONLY:
        continue
    if vid in ("v00", "v13", "v60"):
        continue
    fr = frames(os.path.join(CLIPS, fn))
    H, W_ = fr.shape[1:]
    win = np.outer(np.hanning(H), np.hanning(W_)).astype(np.float32)
    zs, pans, moving, still = [], [], 0, 0
    for i in range(len(fr) - STRIDE):
        a, b = fr[i], fr[i + STRIDE]
        if np.abs(a - b).mean() > 30:      # hard cut / flash: skip
            continue
        best = (-1, 1.0, 0, 0)
        for s in SCALES:
            pk, dx, dy = phase(a, zoomed(b, s), win)
            if pk > best[0]:
                best = (pk, s, dx, dy)
        pk, s, dx, dy = best
        if pk < 0.08 or a.std() < 4:       # no texture to lock onto
            continue
        zrate = -np.log(s) * FPS / STRIDE * 100     # % size change per second (+ = push-in)
        prate = np.hypot(dx, dy) / W_ * FPS / STRIDE * 100  # % of frame width per second
        zs.append(zrate); pans.append(prate)
        if abs(zrate) > 1.5 or prate > 1.5:
            moving += 1
        else:
            still += 1
    n = max(1, moving + still)
    zs, pans = np.array(zs or [0]), np.array(pans or [0])
    mz = zs[np.abs(zs) > 1.5]; mp = pans[pans > 1.5]
    res[vid] = {"moving_frac": round(moving / n, 2),
                "push_in_frac": round(float((zs > 1.5).mean()), 2), "pull_out_frac": round(float((zs < -1.5).mean()), 2),
                "zoom_rate_med": round(float(np.median(np.abs(mz))) if len(mz) else 0, 1),
                "pan_rate_med": round(float(np.median(mp)) if len(mp) else 0, 1),
                "pan_rate_p90": round(float(np.percentile(mp, 90)) if len(mp) else 0, 1)}
    print(vid, json.dumps(res[vid]), flush=True)
json.dump(res, open(OUT, "w"), indent=1)

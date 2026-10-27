"""Segment a clip's global camera motion into moves (truck / pedestal / push / pull) with speed and ease.
Usage: python3 camera_moves.py <clip.mp4> [<clip.mp4> ...]
Prints one line per move: start-end, type, mean speed (% of frame width or % scale per s), peak, ease shape.
"""
import sys
import numpy as np

PATHS = sys.argv[1:]
sys.argv = sys.argv[:1] + ["/dev/null", "/dev/null"]
exec(open(__file__.replace("camera_moves.py", "camera_motion.py")).read().split("res = {}")[0])

STEP = 1  # sample every 0.1 s, compare frames 0.3 s apart


def series(path):
    fr = frames(path)
    H, W_ = fr.shape[1:]
    win = np.outer(np.hanning(H), np.hanning(W_)).astype(np.float32)
    out = []
    for i in range(0, len(fr) - STRIDE, STEP):
        a, b = fr[i], fr[i + STRIDE]
        if np.abs(a - b).mean() > 30:
            out.append((i / FPS, 0, 0, 0, 0)); continue
        best = (-1, 1.0, 0, 0)
        for s in SCALES:
            pk, dx, dy = phase(a, zoomed(b, s), win)
            if pk > best[0]:
                best = (pk, s, dx, dy)
        pk, s, dx, dy = best
        k = FPS / STRIDE * 100
        # phase() returns minus the content shift; the camera moves opposite to the content,
        # so dx itself is the camera move: +vx = camera trucks right, +vy = camera moves down
        out.append((i / FPS, dx / W_ * k, dy / W_ * k, -np.log(s) * k, pk))
    return np.array(out)


def describe(sr):
    t, vx, vy, vz, pk = sr.T
    ok = pk >= 0.08
    sp = np.hypot(vx, vy)
    moving = ok & ((sp > 2.0) | (np.abs(vz) > 2.0))
    segs, i = [], 0
    while i < len(t):
        if not moving[i]:
            i += 1; continue
        j = i
        while j + 1 < len(t) and moving[j + 1]:
            j += 1
        if t[j] - t[i] >= 0.35:
            segs.append((i, j))
        i = j + 1
    lines = []
    for i, j in segs:
        mx, my, mz = vx[i:j + 1].mean(), vy[i:j + 1].mean(), vz[i:j + 1].mean()
        parts = []
        if abs(mx) > 1.5: parts.append(("truck R" if mx > 0 else "truck L") + f" {abs(mx):.0f}%W/s")
        if abs(my) > 1.5: parts.append(("pedestal down" if my > 0 else "pedestal up") + f" {abs(my):.0f}%W/s")
        if abs(mz) > 1.5: parts.append(("push-in" if mz > 0 else "pull-out") + f" {abs(mz):.0f}%/s")
        if not parts: parts.append("drift/mixed")
        mag = np.hypot(np.hypot(vx[i:j + 1], vy[i:j + 1]), vz[i:j + 1])
        n = len(mag); th = max(1, n // 3)
        a0, a1, a2 = mag[:th].mean(), mag[th:n - th].mean() if n > 2 * th else mag.mean(), mag[n - th:].mean()
        shape = "ease-in-out" if a1 > 1.25 * max(a0, a2) else "accelerating" if a2 > 1.3 * a0 else "decelerating" if a0 > 1.3 * a2 else "constant"
        lines.append(f"  {t[i]:5.1f}-{t[j] + 0.3:5.1f}s ({t[j] + 0.3 - t[i]:.1f}s)  {' + '.join(parts)}  peak {mag.max():.0f}  {shape}")
    return lines


for c in PATHS:
    sr = series(c)
    print(c.split("/")[-1], f"{len(sr) / 10:.1f}s")
    print("\n".join(describe(sr)))

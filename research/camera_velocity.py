"""Frame-level camera velocity profile for a time window: is the move one continuous glide or stop-start hops?
Usage: python3 camera_velocity.py <clip.mp4> <start_s> <end_s> [fps=30]
Prints per-frame camera vx (%W/s, + = camera trucks right), vy, zoom rate, a speed sparkline, and
  stop_ratio = share of frames whose speed falls under 25 % of the window's median speed (micro-stops),
  accel_cv   = std/mean of |speed change| between frames (jerkiness; low = smooth).
"""
import subprocess, sys
import numpy as np

path, t0, t1 = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
FPS = int(sys.argv[4]) if len(sys.argv) > 4 else 30
W = 256
w, h = map(int, subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                         "stream=width,height", "-of", "csv=p=0", path]).decode().strip().split(","))
H = int(round(W * h / w / 2)) * 2
raw = subprocess.check_output(["ffmpeg", "-v", "error", "-ss", str(t0), "-t", str(t1 - t0), "-i", path, "-vf",
                               f"fps={FPS},scale={W}:{H},format=gray", "-f", "rawvideo", "-"])
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
win = np.outer(np.hanning(H), np.hanning(W)).astype(np.float32)


def phase(a, b):
    A = np.fft.fft2((a - a.mean()) * win); B = np.fft.fft2((b - b.mean()) * win)
    R = A * np.conj(B); R /= np.abs(R) + 1e-6
    c = np.fft.ifft2(R).real
    iy, ix = np.unravel_index(np.argmax(c), c.shape)
    def sub(m, p, n):
        a, b_, d = m[(p - 1) % n], m[p], m[(p + 1) % n]; den = a - 2 * b_ + d
        return 0.0 if den == 0 else 0.5 * (a - d) / den
    dx = ix + sub(c[iy, :], ix, W); dy = iy + sub(c[:, ix], iy, H)
    if dy > H / 2: dy -= H
    if dx > W / 2: dx -= W
    return dx, dy


vx, vy = [], []
for i in range(len(fr) - 1):
    dx, dy = phase(fr[i], fr[i + 1])
    vx.append(dx / W * FPS * 100); vy.append(dy / W * FPS * 100)  # camera velocity, % frame width / s
vx, vy = np.array(vx), np.array(vy)
sp = np.hypot(vx, vy)
# light 3-frame median to remove single-frame estimator noise
sm = np.array([np.median(sp[max(0, i - 1):i + 2]) for i in range(len(sp))])
med = np.median(sm[sm > 1]) if (sm > 1).any() else 0
stop_ratio = float((sm < 0.25 * med).mean()) if med else 1.0
dsp = np.abs(np.diff(sm))
accel_cv = float(dsp.std() / (dsp.mean() + 1e-6))
bars = " ▁▂▃▄▅▆▇█"
spark = "".join(bars[min(8, int(v / (sm.max() + 1e-6) * 8.999))] for v in sm)
print(f"{path.split('/')[-1]} {t0:.1f}-{t1:.1f}s  median speed {med:.1f}%W/s  stop_ratio {stop_ratio:.2f}  accel_cv {accel_cv:.2f}")
print("  speed:", spark)
print("  mean vx %.1f  vy %.1f" % (vx.mean(), vy.mean()))

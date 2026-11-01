#!/usr/bin/env python3
"""Is there anything to read, frame by frame? Judges the rendered pixels, so blurred text fails just as it does for a viewer. Works on any film.
usage: readable_check.py <video.mp4> [--fps 6] [--min-chars 3] [--allow-graphics]
Uses macOS Vision for OCR, or tesseract if installed. Reports the share of the film with readable text and the stretches with none.
--allow-graphics: for morph films led by objects, a text-free frame only counts as dead when it is also nearly empty."""
import argparse, json, os, shutil, subprocess, sys, tempfile
import numpy as np
SWIFT = r'''
import Foundation; import Vision; import AppKit
let dir = CommandLine.arguments[1]
let files = try! FileManager.default.contentsOfDirectory(atPath: dir).filter { $0.hasSuffix(".jpg") }.sorted()
for f in files { let u = URL(fileURLWithPath: dir + "/" + f); guard let im = NSImage(contentsOf: u), let cg = im.cgImage(forProposedRect: nil, context: nil, hints: nil) else { print("\(f)\t"); continue }
  let rq = VNRecognizeTextRequest(); rq.recognitionLevel = .accurate; rq.usesLanguageCorrection = false; try? VNImageRequestHandler(cgImage: cg, options: [:]).perform([rq])
  let s = (rq.results ?? []).compactMap { $0.topCandidates(1).first }.filter { $0.confidence >= 0.5 }.map { $0.string }.joined(separator: " | ")
  print("\(f)\t\(s)") }
'''
ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('--fps', type=float, default=6); ap.add_argument('--min-chars', type=int, default=3); ap.add_argument('--allow-graphics', action='store_true'); a = ap.parse_args()
tmp = tempfile.mkdtemp(); fr = f'{tmp}/f'; os.makedirs(fr)
subprocess.run(['ffmpeg', '-v', 'error', '-i', a.video, '-vf', f'fps={a.fps},scale=-2:1080', '-q:v', '3', f'{fr}/%05d.jpg'], check=True)
files = sorted(os.listdir(fr)); texts = {}
if shutil.which('swift') and sys.platform == 'darwin':
    sw = f'{tmp}/ocr.swift'; open(sw, 'w').write(SWIFT); r = subprocess.run(['swift', sw, fr], capture_output=True, text=True)
    for line in r.stdout.splitlines():
        n, _, t = line.partition('\t'); texts[n] = t
elif shutil.which('tesseract'):
    for n in files: texts[n] = subprocess.run(['tesseract', f'{fr}/{n}', '-', '--psm', '11'], capture_output=True, text=True).stdout.replace('\n', ' ')
else: sys.exit('No OCR available: needs macOS (swift) or tesseract.')
from PIL import Image
def detail(p):
    g = np.asarray(Image.open(p).convert('L').resize((108, 192))).astype(float); return float(np.abs(np.diff(g, axis=0)).mean() + np.abs(np.diff(g, axis=1)).mean())
ok = []
for n in files:
    t = ''.join(c for c in texts.get(n, '') if c.isalnum()); good = len(t) >= a.min_chars
    if not good and a.allow_graphics and detail(f'{fr}/{n}') > 2.2: good = True
    ok.append(good)
dt = 1 / a.fps; gaps = []; run = 0
for i, g in enumerate(ok + [True]):
    if not g: run += 1
    else:
        if run: gaps.append([round((i - run) * dt, 2), round(run * dt, 2)])
        run = 0
gaps.sort(key=lambda x: -x[1]); pct = 100 * sum(ok) / max(1, len(ok))
print(f"{os.path.basename(a.video):26s} {'content' if a.allow_graphics else 'readable text'} on {pct:3.0f}% of frames | longest gap {gaps[0][1] if gaps else 0}s | gaps over 1s: {sum(g[1] > 1 for g in gaps)}" + (f" | worst at {[g[0] for g in gaps[:3]]}" if gaps else ''))
shutil.rmtree(tmp)

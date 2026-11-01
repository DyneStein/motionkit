#!/usr/bin/env python3
"""Create a brand reel project. Song length follows the script and the chosen pace.
usage: new_reel.py <outdir> --preset 08-kuryr --song <file> [--pace fast|medium|slow] [--title Name] [--start SEC]"""
import argparse, json, os, re, shutil, subprocess, sys
H = os.path.dirname(os.path.abspath(__file__)); SC = {'fast':1,'medium':1.5,'slow':2.2}
ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--preset', required=True); ap.add_argument('--song', required=True); ap.add_argument('--pace', default='fast', choices=SC); ap.add_argument('--title'); ap.add_argument('--start')
a = ap.parse_args(); P, AS = a.out, f'{a.out}/assets'; os.makedirs(AS+'/fonts', exist_ok=True)
src = open(f'{H}/presets/{a.preset}.js').read(); src = re.sub(r"pace: '\w+', ", '', src); src = src.replace('FastType({', f"FastType({{ pace: '{a.pace}',", 1); open(f'{P}/film.js','w').write(src)
bars = sum(float(x) for x in re.findall(r"bars: ([\d.]+)", src))
# first pass finds bar length; second cuts the exact window the script needs (3.2 s end card)
args = lambda n: [sys.executable, f'{os.path.dirname(H)}/audio-map/audio_map.py', a.song, AS, '--len', str(n)] + (['--start', a.start] if a.start else [])
subprocess.run(args(30), check=True, stdout=subprocess.DEVNULL); bar = json.load(open(f'{AS}/audio.json'))['bar']
print(subprocess.run(args(bars*bar*SC[a.pace]+3.2), check=True, capture_output=True, text=True).stdout.strip()); A = json.load(open(f'{AS}/audio.json')); dur = A['dur']
open(f'{AS}/audio.js','w').write('window.AUDIO='+json.dumps(A,separators=(',',':'))+';')
for f in ('fast-type.js','fast-type.css','gsap.min.js'): shutil.copy(f'{H}/{f}', f'{AS}/{f}')
used = re.search(r"fonts: \[(.*?)\]", src).group(1); faces = ''
MAP = json.load(open(f'{H}/fonts.json'))
for key, (fam, w, st, file) in MAP.items():
    if f"{w} 100px {fam}" in used or (st == 'italic' and f"italic {w} 100px {fam}" in used):
        src_f = next((q for q in (f'{H}/fonts/{file}', f'{os.path.dirname(H)}/fonts/{file}') if os.path.exists(q)), None)
        if not src_f: sys.exit(f'Font {file} is missing. Run fonts/fetch-fontshare.sh once, then try again.')
        shutil.copy(src_f, f'{AS}/fonts/{file}'); faces += f'@font-face{{font-family:"{fam}";src:url("assets/fonts/{file}") format("woff2");font-weight:{w};font-style:{st};font-display:block}}\n'
title = a.title or a.preset
json.dump({"$schema":"https://hyperframes.heygen.com/schema/hyperframes.json","paths":{"blocks":"compositions","components":"compositions/components","assets":"assets"},"media":{"autoProxy":False},"authoringSkill":"motionkit"}, open(f'{P}/hyperframes.json','w'), indent=1); json.dump({"id":"reel-"+re.sub(r'\W+','-',title.lower()),"name":title}, open(f'{P}/meta.json','w'))
open(f'{P}/index.html','w').write(f'''<!doctype html><html><head><meta charset="utf-8"><title>{title}</title>
<link rel="stylesheet" href="assets/fast-type.css"><style>{faces}</style>
<script src="assets/gsap.min.js"></script><script src="assets/audio.js"></script><script src="assets/plan.js"></script><script src="assets/fast-type.js"></script></head>
<body><div id="root" data-composition-id="main" data-start="0" data-duration="{dur}" data-width="1080" data-height="1920" data-motion-blur="on" data-motion-blur-events="on" data-motion-blur-shutter="180" data-motion-blur-samples="10">
<div id="flood"></div><div id="lens" data-layout-allow-overflow data-layout-allow-overlap><div id="world"><div class="L" id="far"></div><div class="L" id="plane"></div></div></div>
<div id="pulse"></div><div id="vig"></div>
<audio id="song" class="clip" src="assets/song.m4a" data-start="0" data-duration="{dur}" data-volume="1" data-track-index="1"></audio></div>
<script>window.__timelines=window.__timelines||{{}};window.__ftRegister=function(tl){{window.__timelines["main"]=tl;}};</script>
<script src="film.js"></script></body></html>
''')
subprocess.run(['node', f'{H}/director.mjs', P], check=True)
print('ready', P, f'{dur:.1f}s', a.pace)

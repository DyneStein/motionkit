#!/usr/bin/env python3
"""Creates a 3D text film project from a preset.
usage: new_3d.py <outdir> --preset 03-letal --song <file> --title "Name" [--len 30] [--start SEC]
Then edit scene.js: the words live in film.text(...) calls, the camera in setRig([...])."""
import argparse, json, os, shutil, subprocess, sys
H = os.path.dirname(os.path.abspath(__file__)); KIT = os.path.dirname(H); PR = json.load(open(f'{H}/presets.json'))
ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--preset', required=True, choices=PR); ap.add_argument('--song', required=True); ap.add_argument('--title'); ap.add_argument('--len', default='30'); ap.add_argument('--start')
a = ap.parse_args(); P, A = a.out, f'{a.out}/assets'; os.makedirs(A, exist_ok=True); title = a.title or a.preset
if not os.path.isdir(f'{H}/library/models'): sys.exit('Run fetch_assets.py once first: the 3D library is not downloaded yet.')
cmd = [sys.executable, f'{KIT}/audio-map/audio_map.py', a.song, A, '--len', a.len] + (['--start', a.start] if a.start else []); print(subprocess.run(cmd, check=True, capture_output=True, text=True).stdout.strip())
au = json.load(open(f'{A}/audio.json')); dur = au['dur']; open(f'{A}/audio.js', 'w').write('window.AUDIO=' + json.dumps(au, separators=(',', ':')) + ';')
shutil.copy(f'{H}/dist/engine.js', f'{A}/engine.js'); shutil.copy(f'{H}/gsap.min.js', f'{A}/gsap.min.js'); shutil.copy(f'{H}/presets/{a.preset}.js', f'{P}/scene.js')
for rel in PR[a.preset]['assets']:
    s, d = f'{H}/library/{rel}', f'{A}/{rel}'
    if os.path.isdir(s):
        if not os.path.exists(d): shutil.copytree(s, d)
    else: os.makedirs(os.path.dirname(d), exist_ok=True); shutil.copy(s, d)
json.dump({"$schema": "https://hyperframes.heygen.com/schema/hyperframes.json", "paths": {"blocks": "compositions", "components": "compositions/components", "assets": "assets"}, "media": {"autoProxy": False}, "authoringSkill": "motionkit-3d"}, open(f'{P}/hyperframes.json', 'w'), indent=1); json.dump({"id": "3d-" + a.preset, "name": title}, open(f'{P}/meta.json', 'w'))
open(f'{P}/index.html', 'w').write(f'''<!doctype html><html><head><meta charset="utf-8"><title>{title}</title>
<style>html,body{{margin:0;background:#000}}#root{{position:relative;width:1080px;height:1920px;overflow:hidden;background:#000}}#gl{{position:absolute;inset:0;width:1080px;height:1920px;display:block}}</style></head>
<body><div id="root" data-composition-id="main" data-start="0" data-duration="{dur}" data-width="1080" data-height="1920"><canvas id="gl" width="1080" height="1920"></canvas>
<audio id="song" class="clip" src="assets/song.m4a" data-start="0" data-duration="{dur}" data-volume="1" data-track-index="1"></audio></div>
<script src="assets/gsap.min.js"></script><script>window.__timelines=window.__timelines||{{}};const __tl=gsap.timeline({{paused:true}});__tl.to({{v:0}},{{v:1,duration:{dur},ease:"none"}},0);window.__timelines["main"]=__tl;</script>
<script src="assets/audio.js"></script><script src="assets/engine.js"></script><script src="scene.js"></script></body></html>
''')
print('ready', P, f'{dur:.1f}s')

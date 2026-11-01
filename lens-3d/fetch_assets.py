#!/usr/bin/env python3
"""Downloads the free 3D library into lens-3d/library (about 90 MB, not stored in the repo). Fonts come from Fontsource via npm.
Licences: see CREDITS.md. Run once: python3 fetch_assets.py"""
import json, os, urllib.request, subprocess, glob
H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H); UA = {'User-Agent': 'motionkit-3d'}
def get(u, p):
    if os.path.exists(p): return
    os.makedirs(os.path.dirname(p), exist_ok=True); r = urllib.request.Request(u, headers=UA); open(p, 'wb').write(urllib.request.urlopen(r, timeout=180).read())
def files(i): return json.load(urllib.request.urlopen(urllib.request.Request(f'https://api.polyhaven.com/files/{i}', headers=UA)))
M = {'marble_bust_01':'2k','antique_katana_01':'2k','kite_shield':'1k','old_gas_mask':'2k','boombox':'2k','power_box_01':'1k','retro_multimeter':'1k','pull_chain_light_socket':'1k','gothic_statue':'2k','lion_head':'1k','moon_rock_01':'1k','moon_rock_03':'1k','moon_rock_05':'1k','concrete_road_barrier_02':'1k','street_lamp_01':'1k','ornate_war_hammer':'1k','ornate_medieval_mace':'1k','industrial_microscope':'1k','bronze_whale_statue':'1k'}
for i, res in M.items():
    g = files(i)['gltf'][res]['gltf']; d = f'library/models/{i}'; get(g['url'], f'{d}/{i}.gltf')
    for rel, v in g['include'].items(): get(v['url'], f'{d}/{rel}')
    print('model', i, flush=True)
get(files('kiara_1_dawn')['hdri']['1k']['hdr']['url'], 'library/hdri/kiara_1_dawn.hdr')
f = files('asphalt_02')
for k, n in [('Diffuse','diff'),('nor_gl','nor'),('Rough','rough')]: get(f[k]['1k']['jpg']['url'], f'library/tex/asphalt_02/{n}.jpg')
K = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models'
for n in ['ScatteringSkull','CarConcept']: get(f'{K}/{n}/glTF-Binary/{n}.glb', f'library/models/{n}/{n}.glb')
get('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/PrimaryIonDrive.glb', 'library/models/PrimaryIonDrive/PrimaryIonDrive.glb')
PK = {'anton':'anton-latin-400','unifrakturcook':'unifrakturcook-latin-700','grenze-gotisch':'grenze-gotisch-latin-800','big-shoulders-display':'big-shoulders-display-latin-900','unbounded':'unbounded-latin-800','syne':'syne-latin-800','michroma':'michroma-latin-400','saira-extra-condensed':'saira-extra-condensed-latin-800','pirata-one':'pirata-one-latin-400','bodoni-moda':'bodoni-moda-latin-800','jetbrains-mono':'jetbrains-mono-latin-500','dm-serif-display':'dm-serif-display-latin-400'}
subprocess.run(['npm','i','--no-audit','--no-fund','--no-save'] + [f'@fontsource/{p}' for p in PK], check=True, stdout=subprocess.DEVNULL)
from fontTools.ttLib import TTFont
os.makedirs('library/fonts', exist_ok=True)
for p, s in PK.items():
    t = TTFont(f'node_modules/@fontsource/{p}/files/{s}-normal.woff'); t.flavor = None; t.save(f'library/fonts/{p}.ttf')
print('library ready')

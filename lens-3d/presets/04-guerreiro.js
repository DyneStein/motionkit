// MONTAGEM GUERREIRO — forged gold on black, roman type, embers. Route: macro truck L along katana → whip UP as it strikes → orbit R round shield → forward through standing letters, weaving → pedestal UP to the slam of the hammer → pull BACK through a ring of weapons → pan R across the lion → push into its mouth → spiral UP the vertical blade → title.
const { THREE, Film, makeAudio, rng, clamp, mix, smooth, ease, tween, chrome, fit, repaint, faceMetal } = PK;
const A = makeAudio(window.AUDIO), X = A.barLen, bars = v => v * X; const GOLD = 0xffb547;
const film = new Film({ seed: 44, bg: 0x030201, bloom: .3, bloomK: 1.35, streak: .1, tone: 'aces', exposure: .98, sat: 1.1, contrast: 1.14, grain: .03, vignette: .62, ca: .0009, shutter: .5, fogColor: 0x0a0502, fogDensity: .0075, shadowTint: [.9, .9, 1.05], highTint: [1.05, 1, .9] });
const S = film.scene;
film.studio([{ p: [0, 30, 4], s: [60, 18], c: 0xfff0d0, i: 5 }, { p: [-30, 2, 12], s: [16, 60], c: 0xff9a2b, i: 6 }, { p: [30, -2, 8], s: [18, 60], c: 0xffc66b, i: 5 }, { p: [0, -30, 0], s: [50, 18], c: 0xff5a10, i: 2.5 }, { p: [6, 6, 34], s: [3, 36], c: 0xffffff, i: 10 }, { p: [-10, -4, -30], s: [6, 30], c: 0x5a7dff, i: 2.5 }], { ambient: 0x1c1208, intensity: 1.1 });
const key = new THREE.DirectionalLight(0xffe6c0, 2.2); key.position.set(10, 25, 20); S.add(key);
const fill = new THREE.PointLight(0xff6a1a, 120, 80, 1.5); S.add(fill);
const gold = chrome({ color: 0xf5c15a, roughness: .2 }), goldFace = faceMetal({ color: 0xf7c566, roughness: .32 });
const embers = film.points(22000, (i, r) => { const a = r() * 6.283, q = r() * 80; return [Math.cos(a) * q, -40 + r() * 240, -260 + r() * 400, .03 + r() * .1, 3, 1.1, .25]; }, { soft: 1, vertexPatch: `p.y+=mod(time*(2.+rnd*7.),60.)-30.; p.x+=sin(time*.7+rnd*30.)*2.;` }); S.add(embers);
const sparks = film.sparks(2600, { color: [4, 1.7, .4], speed: 26, gravity: 34, size: .07, life: 1 }); S.add(sparks);
const fB = film.font('assets/fonts/bodoni-moda.ttf'), fM = film.font('assets/fonts/jetbrains-mono.ttf');
const pK = film.model('assets/models/antique_katana_01/antique_katana_01.gltf'), pS = film.model('assets/models/kite_shield/kite_shield.gltf'), pH = film.model('assets/models/ornate_war_hammer/ornate_war_hammer.gltf'), pM = film.model('assets/models/ornate_medieval_mace/ornate_medieval_mace.gltf'), pL = film.model('assets/models/lion_head/lion_head.gltf');
let kat, kat2, shield, hammer, lion, letters = [], ring = [], endT = [], back;
const floor = new THREE.Mesh(new THREE.PlaneGeometry(600, 900), new THREE.MeshPhysicalMaterial({ color: 0x241708, metalness: 1, roughness: .26, envMapIntensity: 1.1 })); floor.rotation.x = -Math.PI / 2; floor.position.set(40, 44, -180); S.add(floor);
const colG = new THREE.CylinderGeometry(1.6, 2, 60, 24), cols = new THREE.InstancedMesh(colG, chrome({ color: 0xd8a64a, roughness: .36 }), 44); cols.frustumCulled = false; { const m = new THREE.Object3D(); for (let i = 0; i < 44; i++) { m.position.set(40 + (i % 2 ? 26 : -26), 72, -40 - Math.floor(i / 2) * 11); m.updateMatrix(); cols.setMatrixAt(i, m.matrix); } } S.add(cols);
const P = { shield: new THREE.Vector3(40, 60, -20), corridor: new THREE.Vector3(40, 60, -70), hammer: new THREE.Vector3(10, 150, -300), lion: new THREE.Vector3(-120, 150, -330), end: new THREE.Vector3(-120, 400, -330) };
const forged = (root, col = 0xf0bd5c, rough = .34, env = 1.3) => repaint(root, m => new THREE.MeshPhysicalMaterial({ color: col, metalness: 1, roughness: rough, roughnessMap: m.roughnessMap || null, normalMap: m.normalMap || null, normalScale: new THREE.Vector2(1.4, 1.4), envMapIntensity: env, side: m.side })); const shine = forged;
film.build = async () => {
  const [bo] = await Promise.all([fB]); const [rk, rs, rh, rm, rl] = await Promise.all([pK, pS, pH, pM, pL]);
  forged(rk, 0xe8eaf0, .22, 1.5); kat = fit(rk, 62); S.add(kat); kat2 = kat.clone(true); kat2.position.copy(P.end).add(new THREE.Vector3(0, 0, -3)); kat2.scale.setScalar(.7); S.add(kat2);
  shine(rs); shield = fit(rs, 24); shield.position.copy(P.shield); S.add(shield);
  shine(rh); hammer = fit(rh, 50); hammer.position.copy(P.hammer); S.add(hammer);
  shine(rl, 0xf6c566, .28, 1.5); lion = fit(rl, 44); lion.position.copy(P.lion); S.add(lion);
  back = film.text(bo, 'GUERREIRO', { size: 15, depth: 2, bevel: .1, material: [goldFace, gold] }); back.position.set(12, 0, -13); S.add(back);
  // standing letters down a corridor
  'GUERREIRO'.split('').forEach((ch, i) => { const g = film.text(bo, ch, { size: 27, depth: 3, bevel: .12, seg: 2, material: [goldFace, gold] }); const side = i % 2 ? 1 : -1; g.position.copy(P.corridor).add(new THREE.Vector3(side * 11, Math.sin(i * 1.4) * 2, -i * 21)); g.rotation.y = side * -.34; g.userData.base = g.position.clone(); S.add(g); letters.push(g); });
  // ring of weapons
  const makeW = (root, n, size) => { for (let i = 0; i < n; i++) { const w = fit(root.clone(true), size); S.add(w); ring.push(w); } }; shine(rm); makeW(rm, 5, 18); makeW(rh, 5, 18); makeW(rk, 4, 30);
  const e1 = film.text(bo, 'GUER', { size: 4.6, depth: .9, bevel: .08, material: [goldFace, gold] }), e2 = film.text(bo, 'REIRO', { size: 4.6, depth: .9, bevel: .08, material: [goldFace, gold] }); e1.position.copy(P.end).add(new THREE.Vector3(0, 3.6, 3)); e2.position.copy(P.end).add(new THREE.Vector3(0, -1.8, 3)); S.add(e1, e2); endT = [e1, e2];
};
const K = (b, p, l, o = {}) => Object.assign({ t: bars(b), p, l }, o), off = (v, x, y, z) => [v.x + x, v.y + y, v.z + z];
const cs = P.corridor;
film.setRig([
  K(0, [20, 1, 10], [18, 0, 0], { fov: 34, ap: .07, f: 10, roll: -.07 }), K(.5, [12, -.8, 9], [10, 0, 0], { fov: 34, ap: .07, f: 9, roll: .05 }), K(.95, [4, 1, 10.5], [2, 0, 0], { fov: 38, ap: .05, f: 10.5, roll: -.03 }),
  K(1.25, [-22, 14, 18], [-4, 6, 0], { fov: 46, roll: .16 }), K(1.7, off(P.shield, -28, -8, 26), off(P.shield, 0, 0, 0), { fov: 40, roll: -.08, ap: .12 }),
  K(2.2, off(P.shield, 0, -4, 34), off(P.shield, 0, 0, 0), { fov: 34, ap: .16 }), K(2.7, off(P.shield, 30, 4, 14), off(P.shield, 0, 1, 0), { fov: 38, roll: .1, ap: .12 }),
  K(3.1, off(cs, 7, 2, 30), off(cs, 0, 0, -10), { fov: 44, roll: -.12 }), K(3.7, off(cs, -4, 2, -24), off(cs, 6, 0, -60), { fov: 48, roll: .22, ap: .06 }), K(4.2, off(cs, 4, -2, -74), off(cs, -6, 0, -110), { fov: 48, roll: -.26, ap: .06 }), K(4.7, off(cs, -4, 3, -126), off(cs, 6, 0, -160), { fov: 50, roll: .3 }), K(5.2, off(cs, 3, 0, -186), off(cs, 0, 8, -240), { fov: 46, roll: -.12 }),
  // UP to hammer: low angle
  K(5.8, off(P.hammer, 14, -24, 28), off(P.hammer, 0, 4, 0), { fov: 38, roll: .1, ap: .1 }), K(6.4, off(P.hammer, -18, -20, 22), off(P.hammer, 0, 0, 0), { fov: 38, roll: -.14, ap: .12 }), K(6.9, off(P.hammer, -6, -22, 24), off(P.hammer, 0, -14, 0), { fov: 50, ap: .08 }),
  // pull BACK through weapon ring
  K(7.3, off(P.hammer, 0, -6, 58), off(P.hammer, 0, 0, 0), { fov: 52, roll: .3 }), K(8, off(P.hammer, 8, 16, 118), off(P.hammer, 0, 0, 0), { fov: 40, roll: -.08 }),
  // pan to lion
  K(8.45, off(P.lion, 70, 4, 58), off(P.lion, 20, 0, 0), { fov: 40, roll: .1 }), K(9, off(P.lion, 26, 2, 44), off(P.lion, 0, 2, 0), { fov: 34, ap: .22 }), K(9.5, off(P.lion, -26, -6, 42), off(P.lion, 0, 2, 0), { fov: 32, roll: -.06, ap: .24 }), K(10, off(P.lion, 0, -8, 34), off(P.lion, 0, -8, 0), { fov: 42, ap: .1 }), K(10.35, off(P.lion, 0, -8, 12), off(P.lion, 0, -8, 0), { fov: 90, roll: .8 }),
  // title rise, cut hidden in lion's throat blackout
  K(10.36, off(P.end, 8, -28, 26), off(P.end, 0, -8, 0), { cut: true, fov: 62, roll: -.5 }), K(11, off(P.end, -12, -5, 42), off(P.end, 0, 1, 0), { fov: 40, roll: .05, ap: .08 }), K(12, off(P.end, 0, 1, 50), off(P.end, 0, 1, 0), { fov: 33, ap: .08 }),
]);
film.impact(A, { fov: 1.8, dolly: .14, shake: .05, roll: .007, drift: .03, decay: 10, seed: 12 });
film.updateFn = t => {
  const fk = A.kick(t, 8), fb = A.bell(t, 11), hitT = A.since(A.hits, t), nh = A.count(A.hits, t);
  S.environmentRotation.y = t * .8; embers.material.uniforms.time.value = t; fill.position.copy(film.camera.position).add(new THREE.Vector3(6, -4, -14)); fill.intensity = 60 + fk * 420;
  if (!kat) return;
  // katana: blade rolls highlight; strike rotates it at the drop
  floor.visible = cols.visible = t > bars(2.6) && t < bars(5.7); if (back) back.visible = t < bars(1.1);
  const st = tween(t, bars(1), .3, ease.back); kat.visible = t < bars(1.9); kat.rotation.x = t * .35 + fb * .02; kat.rotation.z = Math.PI / 2 + st * 1.15; kat.position.y = st * 8;
  shield.visible = t > bars(1.1) && t < bars(3.4); shield.rotation.y = -.3 + (t - bars(1)) * .35; shield.scale.setScalar(1 + fk * .02);
  letters.forEach((g, i) => { const h = g.userData.base, a = tween(t, bars(2.7) + i * X * .2, .4, ease.back); g.visible = t > bars(2.8) && t < bars(5.6); g.position.y = h.y + (1 - a) * -26; g.rotation.x = (1 - a) * .7; g.scale.setScalar(1 + fk * .025); });
  // hammer slams on every bar during 5.5–7.2
  const hb = (t - bars(5.5)) / X, hf = hb - Math.floor(hb), ang = hf < .18 ? mix(1.2, -.25, ease.in(hf / .18)) : mix(-.25, 1.2, ease.inOut(clamp((hf - .3) / .7))); hammer.visible = t > bars(5.2) && t < bars(8.2); hammer.rotation.z = ang * .35; hammer.position.y = P.hammer.y + (ang + .25) * 7;
  const ringOn = t > bars(6.9) && t < bars(8.4); ring.forEach((w, i) => { w.visible = ringOn; if (ringOn) { const a = i / ring.length * 6.283 + t * .6, r = mix(70, 44, smooth(bars(6.9), bars(7.4), t)); w.position.set(P.hammer.x + Math.cos(a) * r, P.hammer.y + Math.sin(a) * r, P.hammer.z + 34 + (i % 3) * 16); w.rotation.set(t * .5, a, a + t); } });
  lion.visible = t > bars(8.1) && t < bars(10.4); lion.rotation.y = Math.sin(t * .5) * .12; lion.scale.setScalar(1 + fk * .018);
  const endOn = t > bars(10.3); endT.forEach((e, i) => { e.visible = endOn; e.children.forEach((m, j) => { const h = m.userData.home, a = tween(t, bars(10.7) + (i * 4 + j) * A.spb * .22, .45, ease.back); m.position.y = h.y + (1 - a) * -14; m.rotation.x = (1 - a) * 1.4; m.scale.setScalar(1 + fk * .012); }); }); kat2.visible = endOn; kat2.rotation.y = t * 1.2;
  // sparks follow the current centre of action
  const strike = t - bars(1), slam = hf < .18 ? 9 : (hb > 0 && t < bars(7.2) ? (hf - .18) * X : 9); if (strike > 0 && strike < 1) sparks.fire(new THREE.Vector3(-4, 6, 2), strike, 1); else if (slam < 1) sparks.fire(new THREE.Vector3(P.hammer.x, P.hammer.y - 17, P.hammer.z + 3), slam, Math.floor(hb)); else sparks.visible = false;
};
film.postFn = t => {
  const fk = A.kick(t, 7), w = (b, s, a) => a * Math.exp(-Math.pow((t - bars(b)) / s, 2)), throat = smooth(bars(10.1), bars(10.36), t) * (1 - smooth(bars(10.36), bars(10.56), t));
  return { exposure: fk * .22 - throat * .9, flash: fk * .018, flashC: 0xffb060, zoom: w(1.05, .18, .16) + w(3, .18, .1) + w(5.5, .2, .12) + w(10.36, .22, .3), ca: fk * .0028 + throat * .012, shock: A.hit(t, 9) * .35, shockR: (1 - Math.exp(-A.since(A.hits, t) * 5)) * .9 };
};
film.start();

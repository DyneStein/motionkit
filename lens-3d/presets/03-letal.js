// LOUCURA LETAL — blood-red and black, blackletter, steel. Route: push in on chrome skull → whip UP through the iris of blades → corridor flight forward (blades close on kicks) → banking L around giant gas mask → DOWN into its filter (zoom-through) → red void; skull rushes at lens; orbit R and pull back → title.
const { THREE, Film, makeAudio, rng, clamp, mix, smooth, ease, tween, noise1, chrome, fit, repaint, faceMetal, mergeGeometries } = PK;
const A = makeAudio(window.AUDIO), X = A.barLen, D = A.dur, bars = v => v * X; const RED = 0xff1209;
const film = new Film({ seed: 33, bg: 0x060000, bloom: .3, bloomK: 1.5, streak: .14, tone: 'aces', exposure: .92, sat: 1.1, contrast: 1.12, grain: .045, vignette: .68, ca: .0013, shutter: .5, fogColor: 0x180100, fogDensity: .013, shadowTint: [1.15, .85, .85], highTint: [1.02, .96, .92] });
const S = film.scene;
film.studio([{ p: [0, 28, 6], s: [50, 7], c: 0xfff0ea, i: 3.5 }, { p: [-30, 0, 10], s: [6, 60], c: RED, i: 5 }, { p: [30, 0, 10], s: [6, 60], c: RED, i: 4 }, { p: [0, -30, 0], s: [50, 16], c: 0xff2008, i: 1.6 }, { p: [4, 8, 34], s: [1.6, 34], c: 0xffffff, i: 7 }], { ambient: 0x0c0101, intensity: 1 });
const key = new THREE.SpotLight(0xffe8e0, 110, 200, .6, .7, 1.4); key.position.set(10, 26, 26); S.add(key, key.target);
const red1 = new THREE.PointLight(RED, 900, 120, 1.6), red2 = new THREE.PointLight(RED, 600, 120, 1.6); red1.position.set(-22, -8, 14); red2.position.set(24, 8, -20); S.add(red1, red2);
const steel = chrome({ color: 0xf0e6e6, roughness: .18 }), edge = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, .92, .86).multiplyScalar(2) });
// ---- blade iris rings: real knife silhouette, extruded and instanced, along a corridor on -z
function bladeGeo() { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(1.05, .12); s.bezierCurveTo(1.25, 2.2, .9, 5.2, 0, 8.4); s.bezierCurveTo(-.25, 5.3, -.5, 2.2, -.42, .1); s.lineTo(0, 0); const g = new THREE.ExtrudeGeometry(s, { depth: .05, bevelEnabled: true, bevelThickness: .17, bevelSize: .17, bevelSegments: 1, curveSegments: 20, steps: 1 }); g.translate(0, 0, -.025); g.computeVertexNormals(); return g; }
const RINGS = 42, PER = 18, NB = RINGS * PER, blades = new THREE.InstancedMesh(bladeGeo(), steel, NB); blades.frustumCulled = false; S.add(blades);
const RING_DZ = 11, ringZ = i => -30 - i * RING_DZ, dm = new THREE.Object3D();
// wall chains of emissive red slits for speed reference
const slitG = new THREE.BoxGeometry(.22, 5.5, .22), slits = new THREE.InstancedMesh(slitG, new THREE.MeshBasicMaterial({ color: new THREE.Color(RED).multiplyScalar(2.2) }), 300); slits.frustumCulled = false; { const r = rng(4); const m = new THREE.Object3D(); for (let i = 0; i < 300; i++) { const a = r() * 6.283, R0 = 15 + r() * 9; m.position.set(Math.cos(a) * R0, Math.sin(a) * R0, -20 - r() * 480); m.rotation.set(0, 0, a + 1.57); m.scale.set(1, .4 + r() * 1.6, 1 + r() * 20); m.updateMatrix(); slits.setMatrixAt(i, m.matrix); } } S.add(slits);
const embers = film.points(26000, (i, r) => { const a = r() * 6.283, q = 1 + r() * 45; return [Math.cos(a) * q, Math.sin(a) * q, 30 - r() * 540, .03 + r() * .13, 2, .2, .08]; }, { soft: 1 }); S.add(embers);
const skullRoot = film.model('assets/models/ScatteringSkull/ScatteringSkull.glb'), maskRoot = film.model('assets/models/old_gas_mask/old_gas_mask.gltf');
const fG = film.font('assets/fonts/grenze-gotisch.ttf'), fU = film.font('assets/fonts/unifrakturcook.ttf'), fM = film.font('assets/fonts/jetbrains-mono.ttf'), fP = film.font('assets/fonts/pirata-one.ttf');
let skull, skull2, mask, wordL, wordE, endA, endB; const MASK_P = new THREE.Vector3(0, -6, -540), VOID = new THREE.Vector3(800, 0, 0);
film.build = async () => {
  const [gg, un, mo, pi] = await Promise.all([fG, fU, fM, fP]);
  const sk = await skullRoot; sk.traverse(m => { if (m.isMesh) { m.material = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: m.material.map || null, normalMap: m.material.normalMap || null, metalness: .9, roughness: .3, envMapIntensity: 1 }); m.frustumCulled = false; } });
  skull = fit(sk, 13); S.add(skull);
  skull2 = skull.clone(true); skull2.scale.setScalar(2.4); S.add(skull2);
  const ma = await maskRoot; repaint(ma, m => { m.metalness = .85; m.roughness = Math.min(m.roughness, .34); m.envMapIntensity = 2.6; m.color.multiplyScalar(2.2); return null; }); mask = fit(ma, 34); mask.position.copy(MASK_P); mask.rotation.y = .4; S.add(mask);
  const mat = [faceMetal({ color: 0xffd0c8, roughness: .24 }), chrome({ color: 0xff8a70, roughness: .1 })];
  wordL = film.text(gg, 'LOUCURA', { size: 7.4, depth: 1.5, bevel: .08, material: mat }); wordL.position.set(0, 10, -8); S.add(wordL);
  wordE = film.text(pi, 'LETAL', { size: 12, depth: 2.4, bevel: .1, material: [new THREE.MeshPhysicalMaterial({ color: RED, roughness: .3, emissive: RED, emissiveIntensity: 1.6 }), chrome({ color: 0xff3020, roughness: .15 })] }); wordE.position.set(VOID.x, VOID.y - 10, VOID.z + 16); S.add(wordE);
  const fine = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(1.2) });
  endA = film.text(gg, 'LOUCURA', { size: 5.1, depth: 1.1, bevel: .07, material: mat }); endA.position.set(VOID.x, VOID.y + 17.5, VOID.z + 8); S.add(endA);
};
const K = (b, p, l, o = {}) => Object.assign({ t: bars(b), p, l }, o), V = (x, y, z) => [VOID.x + x, VOID.y + y, VOID.z + z];
film.setRig([
  // hook: skull fills frame, lens racks past the eye
  K(0, [4, 1, 20], [0, 1, 0], { fov: 32, ap: .1 }), K(.55, [-2, 0, 15], [0, 1.4, 0], { fov: 36, ap: .12, roll: -.04 }), K(.95, [-1, 6, 13], [0, 6, 0], { fov: 44, ap: .08, roll: .06 }),
  // whip up over the skull into the corridor
  K(1.25, [0, 16, 8], [0, 8, -30], { fov: 56, roll: -.22 }), K(1.8, [3, 2, -36], [0, 0, -90], { fov: 62, roll: .4 }),
  // corridor: fast forward, weaving with heavy banks
  K(2.5, [-5, -3, -96], [0, 0, -150], { fov: 66, roll: -.5 }), K(3.1, [5, 4, -160], [1, 0, -220], { fov: 62, roll: .6 }), K(3.7, [-2, 5, -225], [0, 0, -290], { fov: 70, roll: -.2 }), K(4.3, [4, -5, -296], [0, 0, -360], { fov: 66, roll: .9 }), K(4.9, [-3, 0, -372], [0, -2, -430], { fov: 62, roll: .1 }), K(5.5, [0, 8, -468], [0, 4, -540], { fov: 44, roll: -.06, ap: .08 }),
  // bank LEFT round the mask, then drop into filter
  K(6, [-9, 8, -513], [0, 5, -540], { fov: 40, roll: .1, ap: .12 }), K(6.6, [-22, 3, -528], [0, 5, -540], { fov: 38, roll: -.08, ap: .14 }), K(7.2, [-10, -7, -518], [0, -5, -540], { fov: 40, roll: .12, ap: .12 }), K(7.8, [11, -20, -518], [0, -18, -540], { fov: 40, ap: .1 }), K(8.4, [2, -20, -525], [0, -21, -540], { fov: 56, roll: .1 }), K(8.8, [0, -21, -533], [0, -21, -540], { fov: 84, roll: .7 }),
  // red void, skull rush, then big orbit RIGHT
  K(8.81, V(-3, 3, 95), V(0, 0, 0), { cut: true, fov: 70, roll: -.9 }), K(9.5, V(-6, 1, 54), V(0, 1, 0), { fov: 38, roll: .04, ap: .35 }), K(10.2, V(34, 8, 34), V(0, 2, 0), { fov: 40, roll: -.08, ap: .28 }), K(10.9, V(36, -16, -38), V(0, 0, 0), { fov: 44, roll: .14, ap: .2 }), K(11.6, V(-26, 22, -34), V(0, 2, 0), { fov: 36, roll: -.16, ap: .24 }),
  K(12.1, V(-8, -4, 40), V(-1, -4, 0), { fov: 48, roll: .14, ap: .24 }), K(13, V(0, 1, 78), V(0, -1, 0), { fov: 36, ap: .1 }), K(13.2, V(0, 1.5, 88), V(0, -2.5, 0), { fov: 33, ap: .08 }),
]);
film.impact(A, { fov: 2.2, dolly: .16, shake: .05, roll: .008, drift: .05, decay: 10, seed: 9 });
const whip = b => 1;
film.updateFn = t => {
  const fk = A.kick(t, 8), fb = A.bell(t, 12), count = A.count(A.kicks, t), rms = A.rms(t);
  S.environmentRotation.y = t * .9; S.environmentRotation.z = Math.sin(t * .6) * .3;
  const hall = t < bars(9); blades.visible = hall && t > bars(.8); slits.visible = hall; embers.visible = hall;
  if (blades.visible) { let n = 0; for (let i = 0; i < RINGS; i++) { const z = ringZ(i), phase = i * .35 + count * .52; const closeAmt = (fk * .3 + .2) * Math.exp(-Math.pow((t - (i * X * .4 + bars(1.6))) / (X * .8), 2)) * 1.1; const r0 = mix(13.5, 7.5, clamp(closeAmt)); for (let j = 0; j < PER; j++) { const a = j / PER * 6.283 + phase + (i % 2 ? t * 1.2 : -t * 1.2); dm.position.set(Math.cos(a) * r0, Math.sin(a) * r0, z); dm.rotation.set(0, 0, a + 1.57 + (i % 2 ? .6 : -.6)); dm.scale.setScalar(1.1); dm.updateMatrix(); blades.setMatrixAt(n++, dm.matrix); } } blades.instanceMatrix.needsUpdate = true; }
  if (skull) {
    skull.visible = t < bars(2.2); const hit = tween(t, bars(1), .25, ease.out); skull.rotation.y = -.22 + t * .1 + hit * .9 + fk * .02; skull.rotation.x = -.04 + Math.sin(t * .9) * .03; skull.position.set(0, 0, 0); skull.scale.setScalar(1 + fk * .03);
    wordL.visible = t < bars(2); wordL.children.forEach((m, i) => { const h = m.userData.home, n = tween(t, i * A.spb * .25, .3, ease.back), o = tween(t, bars(1.02), .6, ease.expoOut), sa = i * 2.399; m.position.set(h.x + Math.cos(sa) * o * 22, h.y + (1 - n) * 8 + o * Math.sin(sa) * 18, h.z + (1 - n) * -20 + o * 25); m.rotation.set(o * sa * .6, (1 - n) * 1.4 + o * sa, o * sa * .4); });
    mask.visible = t > bars(4.8) && t < bars(9); if (mask.visible) { mask.rotation.y = .3 + Math.sin(t * .7) * .25 + fk * .03; mask.rotation.x = fk * .02; mask.scale.setScalar(1 + fk * .03); }
    skull2.visible = t >= bars(8.8); skull2.position.set(VOID.x, VOID.y + 1.5, VOID.z); const ar = tween(t, bars(8.82), .55, ease.expoOut); skull2.scale.setScalar(mix(2.4, 1.55, smooth(bars(11.6), bars(12.4), t)) * (.4 + ar * .6) * (1 + fk * .05)); skull2.rotation.y = (t - bars(8.8)) * .6; skull2.rotation.x = Math.sin(t * 1.3) * .14; skull2.position.y = VOID.y + 2 - smooth(bars(12), bars(13), t) * 1.5;
    wordE.visible = t > bars(11.7); wordE.children.forEach((m, i) => { const h = m.userData.home, n = tween(t, bars(11.9) + i * A.spb * .45, .4, ease.back); m.position.set(h.x, h.y + (1 - n) * -22, h.z + fk * .4); m.rotation.x = (1 - n) * 1.8; m.scale.setScalar(1 + fk * .07); });
    endA.visible = t > bars(11.7); endA.children.forEach((m, i) => { const h = m.userData.home, n = tween(t, bars(12) + i * A.spb * .2, .45, ease.back); m.position.set(h.x, h.y + (1 - n) * 30, h.z); m.rotation.x = (n - 1) * 1.6; });
  }
  red1.intensity = 40 + rms * 110 + fk * 240; red2.intensity = 30 + fb * 220; red1.position.copy(film.camera.position).add(new THREE.Vector3(-14, -6, -18)); red2.position.copy(film.camera.position).add(new THREE.Vector3(16, 6, -34));
  key.position.copy(film.camera.position).add(new THREE.Vector3(10, 20, 8)); key.target.position.copy(film.camera.position).add(new THREE.Vector3(0, 0, -20)); key.intensity = t > bars(5) && t < bars(9) ? 1400 : 110;
  S.background.setHex(t > bars(8.8) ? 0x4a0000 : 0x060000); if (S.fog) { S.fog.color.setHex(t > bars(8.8) ? 0x340000 : 0x180100); S.fog.density = t > bars(8.8) ? .0042 : .013; }
};
film.postFn = t => {
  const fk = A.kick(t, 7), w = (b, s, a) => a * Math.exp(-Math.pow((t - bars(b)) / s, 2)), corr = smooth(bars(1.3), bars(1.8), t) * (1 - smooth(bars(5), bars(5.6), t)), inMask = smooth(bars(8.45), bars(8.8), t) * (1 - smooth(bars(8.8), bars(8.98), t));
  return { flash: inMask * 2.2 + fk * .04 + w(1, .12, .5), flashC: 0xff2010, zoom: corr * (.015 + fk * .05) + w(1.1, .2, .16) + w(8.8, .22, .3), ca: fk * .0035 + corr * .001 + inMask * .015, exposure: fk * .2, shock: A.hit(t, 9) * .4, shockR: (1 - Math.exp(-A.since(A.hits, t) * 5)) * .9 };
};
film.start();

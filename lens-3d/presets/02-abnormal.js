// FUNK ABNORMAL — clinical white world; a black ferrofluid blob hops on the kicks along a wall of letters, pushing them. Route: truck R with the blob → pedestal UP the microscope → plunge DOWN the eyepiece → acid-black world, diagonal flights around a mutating mass → into its surface → white crane-out.
const { THREE, Film, makeAudio, rng, clamp, mix, smooth, ease, tween, noise1, chrome, fit, repaint, ferro, rimMaterial, faceMetal } = PK;
const A = makeAudio(window.AUDIO), X = A.barLen, D = A.dur, bars = v => v * X;
const WHITE = 0xf1f2ee, ACID = 0xb6ff00;
const film = new Film({ seed: 22, bg: WHITE, bloom: .22, bloomK: 1.6, streak: 0, tone: 'agx', exposure: 1.32, sat: 1.28, contrast: 1.26, grain: .022, vignette: .22, ca: .0009, shutter: .6, shadows: true, fogColor: WHITE, fogDensity: .0036 });
const S = film.scene;
film.studio([{ p: [0, 40, 0], s: [70, 40], c: 0xffffff, i: 3.2 }, { p: [40, 8, 20], s: [10, 50], c: 0xffffff, i: 6 }, { p: [-40, 8, 20], s: [10, 50], c: 0xffffff, i: 6 }, { p: [0, 12, 44], s: [50, 8], c: 0xffffff, i: 5 }, { p: [0, -20, 0], s: [90, 90], c: 0xdddddd, i: .7 }], { ambient: 0x8a8a8a, intensity: 1 });
const envAcid = film.studio([{ p: [0, 30, 0], s: [60, 5], c: 0xffffff, i: 9 }, { p: [34, 4, 14], s: [4, 60], c: ACID, i: 12 }, { p: [-34, -4, 8], s: [6, 60], c: ACID, i: 8 }, { p: [0, -30, 0], s: [40, 4], c: 0xeaffb0, i: 7 }, { p: [0, 8, 36], s: [2, 40], c: 0xffffff, i: 16 }], { ambient: 0x020401 });
const envWhite = S.environment;
const sun = new THREE.DirectionalLight(0xffffff, 3.2); sun.position.set(-20, 46, 26); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 160 }); sun.shadow.bias = -.0006; sun.shadow.normalBias = .02; sun.userData.area = 3.5; S.add(sun, sun.target); film.jitterLights.push(sun);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshStandardMaterial({ color: 0xf2f3ef, roughness: .34, metalness: 0, envMapIntensity: .75 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; S.add(floor);
// ---- world A
const WORLD_A = new THREE.Group(); S.add(WORLD_A);
const blob = ferro({ amp: .1, freq: 1.5, spike: 0, spikeF: 5.5, seg: 300, mat: { color: 0x3c3c44, roughness: .07 } }); blob.scale.setScalar(2.3); WORLD_A.add(blob);
const ink = new THREE.MeshPhysicalMaterial({ color: 0x08080a, roughness: .22, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: .9 }), acidM = new THREE.MeshPhysicalMaterial({ color: ACID, roughness: .28, clearcoat: 1, envMapIntensity: .8, emissive: ACID, emissiveIntensity: .18 });
// letters' start x along the wall: the blob's path
const WALL_Z = -6, X0 = -44, X1 = 58;
const blobX = t => { const k = A.kicks.filter(v => v >= 0); const prog = clamp(t / bars(3.05)); return mix(X0, X1, ease.inOut(prog) * .15 + prog * .85); };
const blobY = t => { const b = A.beatF(t), f = b - Math.floor(b); const hop = 4 * f * (1 - f); const big = t > bars(1) ? 1 : .35; return 2.2 + hop * 4.4 * big; };
let wall, scope, stackA, hudA;
const fSy = film.font('assets/fonts/syne.ttf'), fMo = film.font('assets/fonts/jetbrains-mono.ttf'), scopeP = film.model('assets/models/industrial_microscope/industrial_microscope.gltf');
// ---- world B (inside the eyepiece) at y=-600: floor hidden
const WB = new THREE.Group(); WB.position.set(0, -600, 0); S.add(WB);
const mass = ferro({ amp: .09, freq: .9, spike: .2, spikeF: 5, seg: 420, mat: { color: 0xeaf0dc, roughness: .05, envMapIntensity: 1.1 } }); mass.scale.setScalar(9); WB.add(mass);
const R = rng(9), NC = 150, cells = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 28, 20), rimMaterial(ACID, { power: 3.2, gain: 1.5, inner: .012 }), NC); cells.frustumCulled = false; WB.add(cells);
const cd = []; for (let i = 0; i < NC; i++) { const a = R() * 6.283, b = Math.acos(2 * R() - 1), r = 14 + R() * 62; cd.push({ p: new THREE.Vector3(r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)), s: .45 + R() * R() * 3.2, w: R() * 6, sp: .4 + R() }); }
const nuc = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(ACID).multiplyScalar(1.15) }), NC); nuc.frustumCulled = false; WB.add(nuc);
const motes = film.points(14000, (i, r) => { const a = r() * 6.283, b = Math.acos(2 * r() - 1), q = 10 + r() * 90; return [q * Math.sin(b) * Math.cos(a), q * Math.cos(b), q * Math.sin(b) * Math.sin(a), .04 + r() * .14, .55, .9, .15]; }, { soft: 1 }); WB.add(motes);
const ringG = new THREE.Group(); WB.add(ringG);
const dark = new THREE.Color(0x020402);
film.build = async () => {
  const [sy, mo] = await Promise.all([fSy, fMo]);
  wall = film.text(sy, 'ABNORMAL', { size: 17, depth: 4, bevel: .16, seg: 2, tracking: -.015, align: 'left', material: ink }); wall.position.set(X0 - 2, 8.1, WALL_Z); wall.children.forEach(m => { m.castShadow = true; m.receiveShadow = true; }); wall.children[3] && (wall.children[3].material = acidM); WORLD_A.add(wall);
  // stretch the wall to span the route by spacing glyphs
  wall.children.forEach((m, i) => { m.userData.home.x = (m.userData.home.x) * ((X1 - X0 - 8) / Math.max(1, wall.userData.width)); m.position.x = m.userData.home.x; });
  hudA = film.text(mo, 'SPECIMEN 08  FUNK ABNORMAL', { size: .72, depth: 0, tracking: .1, material: new THREE.MeshBasicMaterial({ color: 0x111111 }), align: 'left' }); hudA.rotation.x = -Math.PI / 2; hudA.position.set(X0 - 6, .03, 7); WORLD_A.add(hudA);
  const root = await scopeP; repaint(root, m => { m.envMapIntensity = 1.1; return null; }); root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scope = fit(root, 34, { center: false }); const bb = new THREE.Box3().setFromObject(scope), c = bb.getCenter(new THREE.Vector3()); scope.position.set(X1 + 8 - c.x, -bb.min.y, -2 - c.z); WORLD_A.add(scope); window.__scopeBox = new THREE.Box3().setFromObject(scope);
  // type ring orbiting the mass
  'FUNK'.split('').forEach((ch, i) => { const g = film.text(sy, ch, { size: 7.2, depth: 1.4, bevel: .1, material: [new THREE.MeshPhysicalMaterial({ color: ACID, roughness: .3, emissive: ACID, emissiveIntensity: .75 }), chrome({ color: 0xd2ff60, roughness: .12 })] }); g.userData.a = i / 4 * 6.283; ringG.add(g); });
  // closing stack
  const e1 = film.text(sy, 'FUNK', { size: 4.4, depth: 1.2, bevel: .1, material: ink }), e2 = film.text(sy, 'ABNOR', { size: 4.4, depth: 1.2, bevel: .1, material: ink }), e3 = film.text(sy, 'MAL', { size: 4.4, depth: 1.2, bevel: .1, material: acidM });
  e1.position.y = 4.7; e2.position.y = 0; e3.position.y = -4.7; const st = new THREE.Group(); st.add(e1, e2, e3); st.position.set(-90, 12, -2); st.children.forEach(g => g.children.forEach(m => { m.castShadow = true; })); WORLD_A.add(st); stackA = st;
};
const K = (b, p, l, o = {}) => Object.assign({ t: bars(b), p, l }, o), u = [0, -600, 0], W = (x, y, z) => [x, y - 600, z];
film.setRig([
  // follow the blob along the wall (truck right), low and close; letters tower over the lens
  K(0, [X0 - 4, 4.2, 17], [X0 + 1, 7, 0], { fov: 38, ap: .1 }), K(.6, [mix(X0, X1, .08), 3, 15], [mix(X0, X1, .13), 7.5, 0], { fov: 42, ap: .1 }), K(1, [mix(X0, X1, .2) - 4, 2, 19], [mix(X0, X1, .26), 9, 0], { fov: 46, roll: -.05, ap: .08 }),
  K(1.5, [mix(X0, X1, .42) - 5, 12, 25], [mix(X0, X1, .45), 6, 0], { fov: 40, roll: .05, ap: .1 }), K(2, [mix(X0, X1, .58) - 2, 2.4, 13], [mix(X0, X1, .66), 8, 0], { fov: 54, roll: -.1, ap: .06 }), K(2.5, [mix(X0, X1, .84), 7, 22], [mix(X0, X1, .84), 7, 0], { fov: 42, ap: .1 }),
  // pedestal up the microscope
  K(3, [X1 + 22, 5, 26], [X1 + 8, 9, 0], { fov: 38, ap: .14 }), K(3.5, [X1 - 7, 22, 23], [X1 + 8, 24, -2], { fov: 38, roll: -.1, ap: .12 }), K(3.85, [X1 + 9, 46, 8], [X1 + 8, 30, -1], { fov: 46, roll: .12 }),
  // plunge down the eyepiece
  K(4.1, [X1 + 8, 37, 0], [X1 + 8, 20, -1], { fov: 84, roll: .9 }),
  // acid world: diagonal, under, over; the mass mutates
  K(4.11, W(40, 30, 62), W(0, 0, 0), { cut: true, fov: 54, roll: -.3, ap: .06 }), K(5, W(-16, 10, 28), W(0, 0, 0), { fov: 46, roll: .1, ap: .16 }), K(5.7, W(-36, -22, -6), W(0, 0, 0), { fov: 40, roll: -.22, ap: .2 }), K(6.4, W(12, -30, -30), W(0, 0, 0), { fov: 50, roll: .1, ap: .14 }),
  K(7.1, W(30, 22, -16), W(0, 0, 0), { fov: 36, roll: .28, ap: .2 }), K(8, W(-10, 36, 12), W(0, 2, 0), { fov: 52, roll: -.3, ap: .14 }), K(9, W(-30, 2, 22), W(0, 0, 0), { fov: 34, ap: .22 }), K(10, W(24, -14, 30), W(0, 0, 0), { fov: 44, roll: .22, ap: .16 }), K(11, W(13, 1, 14), W(0, 0, 0), { fov: 44, roll: -.1, ap: .12 }),
  // into the skin of the mass
  K(11.7, W(7.2, .5, 7.2), W(0, 0, 0), { fov: 92, roll: .8 }),
  // white crane-out onto the title stack
  K(11.71, [-90, 42, 8], [-90, 12, -2], { cut: true, fov: 90, roll: -.4 }), K(12.3, [-94, 11, 56], [-90, 10.5, -2], { fov: 42, roll: .03, ap: .1 }), K(14, [-90, 10.5, 70], [-90, 10.5, -2], { fov: 34, ap: .1 }),
]);
film.impact(A, { fov: 1.8, dolly: .14, shake: .05, roll: .006, drift: .05, decay: 8, seed: 6 });
const dm = new THREE.Object3D();
film.updateFn = t => {
  const fk = A.kick(t, 8), fb = A.bell(t, 11), inA = t < bars(4.12) || t > bars(11.7), inB = !inA;
  WORLD_A.visible = inA; floor.visible = inA; WB.visible = inB;
  S.background.set(inA ? WHITE : 0x010201); if (S.fog) { S.fog.color.set(inA ? WHITE : 0x010201); S.fog.density = inA ? .0036 : .0038; }
  film.swapEnv(inA ? envWhite : envAcid, inA ? 1 : 1.25); sun.intensity = inA ? 3.2 : 0;
  S.environmentRotation.y = t * .7;
  if (inA) {
    const x = t > bars(11.5) ? -90 : blobX(t), y = t > bars(11.5) ? 18.6 + Math.abs(Math.sin(A.beatF(t) * Math.PI)) * 2.2 : blobY(t);
    const b = A.beatF(t), f = b - Math.floor(b), squash = Math.exp(-f * 11); blob.position.set(x, y, t > bars(11.5) ? -2 : 1); blob.scale.set(2.3 * (1 + squash * .28), 2.3 * (1 - squash * .32), 2.3 * (1 + squash * .28));
    if (t > bars(11.5)) blob.scale.multiplyScalar(.72);
    blob.u.uT.value = t * 1.6; blob.u.uSpike.value = .05 + fk * .55; blob.u.uAmp.value = .08 + fb * .05;
    if (wall) wall.children.forEach((m, i) => { const h = m.userData.home, wx = wall.position.x + h.x, d = (x - wx) / 9; const pushed = Math.exp(-d * d), done = smooth(0, 1, d); m.rotation.x = -.2 * pushed; m.rotation.z = -.1 * pushed + done * -.03; m.position.z = h.z + pushed * -3.4 + done * -1.2; m.position.y = h.y + pushed * 1.4 * fk + Math.sin(t * 2 + i) * .08; });
    if (stackA) { stackA.visible = t > bars(11.5); stackA.children.forEach((g, i) => { const a = tween(t, bars(11.75) + i * A.spb * .5, .55, ease.back); g.position.z = (1 - a) * -60; g.rotation.y = (1 - a) * 1.2; }); }
    if (wall) { wall.visible = t < bars(5); hudA.visible = t < bars(4); }
  } else {
    const spike = .14 + fk * .95, ramp = smooth(bars(4.2), bars(9), t); mass.u.uT.value = t * 1.1; mass.u.uSpike.value = spike * (.3 + ramp * .4); mass.u.uAmp.value = .07 + ramp * .06 + fb * .03; mass.u.uSpikeF.value = 3 + ramp * 1.6;
    const swell = 1 + fk * .05; mass.scale.setScalar(9 * swell); mass.rotation.y = t * .55; mass.rotation.x = Math.sin(t * .5) * .4;
    for (let i = 0; i < NC; i++) { const c = cd[i], w = t * c.sp + c.w; dm.position.set(c.p.x + Math.sin(w) * 2.2, c.p.y + Math.cos(w * .8) * 2.2, c.p.z + Math.sin(w * .6) * 2.2); dm.scale.setScalar(c.s * (1 + fk * .18)); dm.updateMatrix(); cells.setMatrixAt(i, dm.matrix); dm.scale.setScalar(c.s * .13 * (1 + fb * .5)); dm.updateMatrix(); nuc.setMatrixAt(i, dm.matrix); } cells.instanceMatrix.needsUpdate = nuc.instanceMatrix.needsUpdate = true;
    ringG.visible = t > bars(8.6); ringG.children.forEach(g => { const a = g.userData.a + t * 1.3, ar = tween(t, bars(8.6), .8, ease.expoOut); const r = mix(70, 21, ar); g.position.set(Math.cos(a) * r, Math.sin(a * 1.6) * 2, Math.sin(a) * r); g.lookAt(Math.cos(a) * 200, 0, Math.sin(a) * 200); g.scale.setScalar(1 + fk * .1); });
  }
};
film.postFn = t => {
  const fk = A.kick(t, 7), pulseW = (b, w, a) => a * Math.exp(-Math.pow((t - bars(b)) / w, 2));
  const eyepiece = smooth(bars(3.92), bars(4.1), t) * (1 - smooth(bars(4.1), bars(4.28), t));
  const skin = smooth(bars(11.48), bars(11.7), t) * (1 - smooth(bars(11.7), bars(11.92), t));
  const inB = t > bars(4.12) && t < bars(11.7);
  return { flash: skin * 3 + fk * (inB ? .05 : 0), flashC: 0xffffff, exposure: (inB ? fk * .35 : fk * -.08) - eyepiece * 1, zoom: pulseW(4.1, .28, .55) + pulseW(11.7, .28, .55) + pulseW(1, .18, .18) + pulseW(3.7, .22, .28), ca: fk * .0045 + eyepiece * .03 + skin * .02, shock: A.hit(t, 9) * .55, shockR: (1 - Math.exp(-A.since(A.hits, t) * 5)) * .9 };
};
film.start();

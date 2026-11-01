// MONTAGEM PEGADORA (ROCK VERSION) — a stadium stage in haze. Route: macro truck L across pumping speaker cones → pull BACK fast to reveal wall as beams ignite → DOWN-right to stage, low orbit of boombox → UP over truss looking through beams → truck R along LED letters → dive into cone → out of cone, pull back to title.
const { THREE, Film, makeAudio, rng, clamp, mix, smooth, ease, tween, chrome, fit, repaint, faceMetal, mergeGeometries } = PK;
const A = makeAudio(window.AUDIO), X = A.barLen, bars = v => v * X; const AMBER = 0xffa53a, HOT = 0xff2a6a, ICE = 0xa8c8ff;
const film = new Film({ seed: 55, bg: 0x03040a, bloom: .4, bloomK: 1.2, streak: .3, tone: 'aces', exposure: 1.05, sat: 1.16, contrast: 1.12, grain: .03, vignette: .6, ca: .001, shutter: .5, fogColor: 0x0a0d1c, fogDensity: .0058, shadowTint: [.84, .9, 1.22], highTint: [1.05, 1, .92] });
const S = film.scene;
film.studio([{ p: [0, 30, 10], s: [60, 6], c: 0xffe0b0, i: 6 }, { p: [-30, 8, 12], s: [6, 40], c: AMBER, i: 6 }, { p: [30, 8, 12], s: [6, 40], c: HOT, i: 6 }, { p: [0, 10, 36], s: [36, 2], c: 0xffffff, i: 9 }], { ambient: 0x05060c, intensity: 1 });
const key = new THREE.DirectionalLight(0xffdcb0, 1.3); key.position.set(-14, 30, 26); S.add(key);
const flood = new THREE.PointLight(AMBER, 800, 200, 1.4); flood.position.set(0, 18, 34); S.add(flood);
const flood2 = new THREE.PointLight(HOT, 600, 200, 1.4); flood2.position.set(-26, 8, 22); S.add(flood2);
// ---- stage floor: black lacquer reads beams and light
const floor = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshPhysicalMaterial({ color: 0x050507, roughness: .24, metalness: .4, clearcoat: 1, clearcoatRoughness: .1, envMapIntensity: 1.2 })); floor.rotation.x = -Math.PI / 2; floor.position.y = 0; S.add(floor);
// ---- speaker: cabinet + lathed cone + phase plug + chrome ring. Instanced so all can pump
const pts = []; for (let i = 0; i <= 40; i++) { const k = i / 40, r = .22 + k * .86, d = -.62 * Math.pow(1 - k, 1.6); pts.push(new THREE.Vector2(r, d)); } const coneG = new THREE.LatheGeometry(pts, 96); coneG.rotateX(Math.PI / 2); coneG.computeVertexNormals();
const dustG = new THREE.SphereGeometry(.24, 48, 24, 0, 6.283, 0, 1.57); dustG.rotateX(Math.PI / 2); dustG.translate(0, 0, -.62); const ringG = new THREE.TorusGeometry(1.1, .07, 24, 120);
const cabG = new THREE.BoxGeometry(2.72, 2.72, 2.3); { const s = cabG.attributes.position; for (let i = 0; i < s.count; i++) { /* slight bevel via scale */ } } cabG.translate(0, 0, -1.81);
const COLS = 15, ROWS = 8, N = COLS * ROWS, cone = new THREE.InstancedMesh(coneG, new THREE.MeshPhysicalMaterial({ color: 0x34343c, roughness: .42, metalness: .15, sheen: 1, sheenColor: new THREE.Color(0x777788), sheenRoughness: .4, envMapIntensity: 1.4, side: THREE.DoubleSide }), N), dust = new THREE.InstancedMesh(dustG, chrome({ color: 0xcfd6e0, roughness: .16 }), N), rg = new THREE.InstancedMesh(ringG, chrome({ color: 0xe8e8ee, roughness: .16 }), N), cab = new THREE.InstancedMesh(cabG, new THREE.MeshStandardMaterial({ color: 0x0f0f12, roughness: .7, metalness: .2, envMapIntensity: .55 }), N);
[cone, dust, rg, cab].forEach(m => { m.frustumCulled = false; S.add(m); });
const WALL_Z = -18, spos = i => { const c = i % COLS, r = Math.floor(i / COLS); return new THREE.Vector3((c - (COLS - 1) / 2) * 2.86, 1.5 + r * 2.86, WALL_Z); }, dm = new THREE.Object3D();
for (let i = 0; i < N; i++) { const p = spos(i); dm.position.copy(p); dm.rotation.set(0, 0, 0); dm.scale.setScalar(1); dm.updateMatrix(); cab.setMatrixAt(i, dm.matrix); rg.setMatrixAt(i, dm.matrix); }
// ---- truss with moving heads firing beams
const TR_Y = 30, trussG = new THREE.BoxGeometry(70, .35, .35), tr = new THREE.Group(); for (const [y, z] of [[0, 0], [1.6, 0], [0, 1.6], [1.6, 1.6]]) { const b = new THREE.Mesh(trussG, chrome({ color: 0x8a8a92, roughness: .35 })); b.position.set(0, y, z); tr.add(b); } for (let i = 0; i < 44; i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(.15, 2.3, .15), chrome({ color: 0x8a8a92, roughness: .35 })); d.position.set(-34 + i * 1.6, .8, i % 2 ? 0 : 1.6); d.rotation.x = i % 2 ? .78 : -.78; tr.add(d); } tr.position.set(0, TR_Y, -6); S.add(tr);
const BEAMS = 13, beams = [], cans = []; for (let i = 0; i < BEAMS; i++) { const c = i % 3 === 1 ? HOT : i % 3 === 2 ? ICE : AMBER, b = film.beam({ r0: .24, r1: 5.2, len: 60, color: c, intensity: .28 }); b.position.set(-30 + i * 5, TR_Y - .2, -5); b.renderOrder = 3; S.add(b); beams.push(b); const can = new THREE.Mesh(new THREE.CylinderGeometry(.5, .7, 1.3, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(5) })); can.position.copy(b.position); S.add(can); cans.push(can); }
const dustP = film.points(16000, (i, r) => [(r() - .5) * 90, r() * 40, -18 + r() * 70, .03 + r() * .07, .9, .8, .7], { soft: 1, vertexPatch: `p.y=mod(p.y+time*(.2+rnd*.5),40.); p.x+=sin(time*.4+rnd*40.)*1.5;` }); S.add(dustP);
const sparks = film.sparks(3000, { color: [4, 2.2, 1], speed: 30, gravity: 22, size: .06, life: 1.1, spread: 1.2 }); S.add(sparks);
const fA = film.font('assets/fonts/anton.ttf'), fM = film.font('assets/fonts/jetbrains-mono.ttf'), pB = film.model('assets/models/boombox/boombox.gltf');
let box, led, ledG = [], mir, endA, endB; const LX = 80, LZ = -6, END = new THREE.Vector3(0, 20, -500);
const ledMat = i => new THREE.ShaderMaterial({ uniforms: { c: { value: new THREE.Color(AMBER).multiplyScalar(i) } }, vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`, fragmentShader: `varying vec3 vW; uniform vec3 c; void main(){ vec2 g=fract(vW.xy*2.2)-.5; float d=smoothstep(.46,.22,length(g)); gl_FragColor=vec4(c*(d*1.25+.03),1.); }` });
film.build = async () => {
  const [an, mo] = await Promise.all([fA, fM]); const rb = await pB; repaint(rb, m => { m.envMapIntensity = 2; return null; }); box = fit(rb, 11, { center: true }); box.position.set(16, 5, 16); S.add(box);
  led = film.text(an, 'PEGADORA', { size: 25, depth: 1, bevel: 0, tracking: .012, material: ledMat(4), align: 'left' }); led.position.set(LX - 8, 15, LZ); S.add(led); led.children.forEach(m => { m.material = ledMat(4); });
  mir = led.clone(true); mir.scale.y = -1; mir.position.y = -15; mir.traverse(m => { if (m.isMesh) m.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(AMBER).multiplyScalar(.28) }); }); S.add(mir);
  const white = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2dc).multiplyScalar(1.5) }); endA = new THREE.Group(); const ea = film.text(an, 'PEGA', { size: 9, depth: .6, bevel: .04, tracking: .02, material: [ledMat(2.8), chrome({ roughness: .2 })] }), eb = film.text(an, 'DORA', { size: 9, depth: .6, bevel: .04, tracking: .02, material: [ledMat(2.8), chrome({ roughness: .2 })] }); ea.position.y = 7; eb.position.y = -2.6; endA.add(ea, eb); endA.position.copy(END).add(new THREE.Vector3(0, 0, 2)); S.add(endA);
  endB = film.text(mo, 'MONTAGEM  ROCK VERSION', { size: .78, depth: 0, tracking: .1, material: white }); endB.position.copy(END).add(new THREE.Vector3(0, -9.6, 2)); S.add(endB);
};
const K = (b, p, l, o = {}) => Object.assign({ t: bars(b), p, l }, o), s0 = spos(COLS * 3 + 7);
film.setRig([
  // hook: cone fills the frame
  K(0, [s0.x + 4, s0.y + 1, WALL_Z + 6.5], [s0.x + 1.4, s0.y, WALL_Z], { fov: 40, ap: .05 }), K(.55, [s0.x - 2, s0.y - 1, WALL_Z + 6], [s0.x - 2.8, s0.y - .4, WALL_Z], { fov: 40, ap: .05, roll: .07 }), K(.95, [s0.x - 8, s0.y + 1, WALL_Z + 8], [s0.x - 7.5, s0.y, WALL_Z], { fov: 44, ap: .04, roll: -.06 }),
  // pull back, reveal
  K(1.4, [-6, 12, 26], [0, 12, WALL_Z], { fov: 56, roll: .08 }), K(1.95, [8, 7, 52], [0, 13, WALL_Z], { fov: 46, roll: -.04 }),
  // down right to floor, orbit boombox
  K(2.5, [30, 4.5, 34], [16, 5, 16], { fov: 38, roll: .06, ap: .1 }), K(3, [20, 2.4, 29], [16, 5, 16], { fov: 34, ap: .14 }), K(3.5, [4, 3, 22], [16, 5, 16], { fov: 34, roll: -.08, ap: .14 }), K(3.95, [8, 7, 6], [16, 5, 16], { fov: 40, roll: .08, ap: .1 }),
  // up: over truss
  K(4.5, [-6, 22, 12], [-8, 28, -6], { fov: 62, roll: -.15 }), K(5, [-18, 37, 1], [-3, 14, -6], { fov: 74, roll: .24 }), K(5.6, [10, 38, -13], [6, 12, 4], { fov: 66, roll: -.2 }), K(6.2, [32, 26, 6], [30, 12, -8], { fov: 56, roll: .14 }),
  // truck right along LED
  K(6.8, [LX - 18, 10, 26], [LX - 2, 14, LZ], { fov: 44, roll: -.06 }), K(7.4, [LX + 28, 8, 30], [LX + 34, 15, LZ], { fov: 42, ap: .1 }), K(8, [LX + 58, 18, 28], [LX + 66, 15, LZ], { fov: 42, roll: .08, ap: .1 }), K(8.6, [LX + 88, 11, 30], [LX + 92, 15, LZ], { fov: 44, roll: -.06, ap: .08 }),
  // whip back to the wall and dive into a cone
  K(9.2, [34, 13, 20], [0, 12, WALL_Z], { fov: 52, roll: .2 }), K(9.7, [s0.x, s0.y, WALL_Z + 8], [s0.x, s0.y, WALL_Z], { fov: 62, roll: -.2 }), K(10, [s0.x, s0.y, WALL_Z + .4], [s0.x, s0.y, WALL_Z - 3], { fov: 104, roll: .9 }),
  // out into title
  K(10.01, [END.x, END.y + 1, END.z + 24], [END.x, END.y, END.z], { cut: true, fov: 92, roll: -.6 }), K(10.6, [END.x - 4, END.y + .6, END.z + 46], [END.x, END.y + .2, END.z], { fov: 44, roll: .04, ap: .05 }), K(12, [END.x, END.y + .2, END.z + 56], [END.x, END.y + .1, END.z], { fov: 33, ap: .05 }),
]);
film.impact(A, { fov: 1.8, dolly: .14, shake: .04, roll: .006, drift: .03, decay: 10, seed: 15 });
film.updateFn = t => {
  const fk = A.kick(t, 9), fb = A.bell(t, 11), low = A.low(t), rms = A.rms(t), bf = A.beatF(t), on = smooth(bars(.98), bars(1.02), t), nk = A.count(A.kicks, t);
  S.environmentRotation.y = t * .5; dustP.material.uniforms.time.value = t;
  for (let i = 0; i < N; i++) { const p = spos(i); const pump = fk * .34 + low * .05; dm.position.copy(p); dm.rotation.set(0, 0, 0); dm.scale.set(1, 1, 1 + pump * 1.6); dm.updateMatrix(); cone.setMatrixAt(i, dm.matrix); dust.setMatrixAt(i, dm.matrix); } cone.instanceMatrix.needsUpdate = dust.instanceMatrix.needsUpdate = true;
  const atStage = t < bars(10); [cone, dust, rg, cab, tr, floor, dustP].forEach(o => o.visible = atStage); if (box) { box.visible = atStage; box.scale.setScalar(1 + fk * .05); box.rotation.y = -.5 + Math.sin(t * .6) * .18; }
  beams.forEach((b, i) => { const seq = (i + Math.floor(bf / 2)) % 3 === 0 ? 1 : .35, ph = i * .7 + Math.floor(bf / 2) * 1.3; b.rotation.z = Math.sin(t * .9 + ph) * .55; b.rotation.x = .42 + Math.cos(t * .7 + ph) * .34; b.visible = atStage; b.material.uniforms.i.value = on * (.14 + seq * .3 + fb * .2 + fk * .26 * seq); b.material.uniforms.time.value = t; cans[i].visible = atStage; });
  const hook = .28 + .72 * on; flood.intensity = hook * (300 + fk * 2000); flood2.intensity = hook * (120 + fb * 1200);
  if (led) { led.visible = mir.visible = atStage; const seq = A.count(A.kicks, t) - A.count(A.kicks, bars(6.1)); led.children.forEach((m, i) => { const lit = t > bars(6.1) ? (i < seq ? 1 : .05) : 0; const flash = t > bars(6.1) ? Math.exp(-Math.max(0, A.since(A.kicks, t)) * 7) : 0; m.material.uniforms.c.value.setHex(AMBER).multiplyScalar(.03 + lit * (2.1 + flash * 3)); m.position.z = -lit * flash * 1.2; }); mir.children.forEach((m, i) => { m.material.color.setHex(AMBER).multiplyScalar(t > bars(6.1) && i < seq ? .3 : .002); }); endA.visible = endB.visible = !atStage; endA.children.forEach((g, j) => g.children.forEach((m, i) => { const h = m.userData.home, a = tween(t, bars(10.1) + (i + j * 4) * A.spb * .3, .35, ease.back); m.position.y = h.y + (1 - a) * -12; m.rotation.x = (1 - a) * 1.5; m.scale.setScalar(1 + fk * .02); })); }
  sparks.visible = false;
};
film.postFn = t => {
  const fk = A.kick(t, 7), w = (b, s, a) => a * Math.exp(-Math.pow((t - bars(b)) / s, 2)), cone2 = smooth(bars(9.76), bars(10), t) * (1 - smooth(bars(10), bars(10.2), t)), ig = t >= bars(1) ? Math.exp(-(t - bars(1)) * 5) : 0;
  return { flash: ig * 1.2 + fk * .012, flashC: 0xffb060, exposure: fk * .2 - cone2 * .95, zoom: w(1.15, .2, .2) + w(2.2, .18, .1) + w(4.4, .2, .12) + w(9.4, .2, .14) + w(10, .22, .34), ca: fk * .0028 + cone2 * .014, shock: A.hit(t, 9) * .34, shockR: (1 - Math.exp(-A.since(A.hits, t) * 5)) * .9 };
};
film.start();

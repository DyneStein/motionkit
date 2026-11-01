// ANDROMEDA — MONTAGEM COMA. Route: truck R along chrome type → drop down through it → weave L through asteroids → chase/roll up to ion drive → dive into nozzle → hyperspace forward → pull back above galaxy → dive diagonal to black hole → fall in → pull out onto the title.
const { THREE, Film, makeAudio, rng, clamp, mix, smooth, ease, tween, noise1, chrome, glow, fit, repaint, faceMetal, fitDist } = PK;
const A = makeAudio(window.AUDIO), B = A.barLen, D = A.dur;
const film = new Film({ seed: 11, bg: 0x02030a, bloom: .55, bloomK: .95, streak: .55, tone: 'aces', exposure: 1.1, sat: 1.15, contrast: 1.08, grain: .03, vignette: .6, ca: .0016, shadowTint: [.82, .9, 1.25], highTint: [1.05, 1, .96], fogColor: 0x05030f, fogDensity: .0009, shutter: .6 });
const S = film.scene;
film.studio([{ p: [0, 30, 0], s: [60, 22], c: 0xcfdcff, i: 7 }, { p: [30, 0, 8], s: [14, 60], c: 0x6e7bff, i: 10 }, { p: [-30, -6, 6], s: [16, 50], c: 0xff4fd8, i: 8 }, { p: [0, -30, -14], s: [60, 12], c: 0x41e6ff, i: 6 }, { p: [10, 12, 30], s: [5, 40], c: 0xffffff, i: 14 }, { p: [-14, -8, 30], s: [3, 40], c: 0xbfe8ff, i: 10 }], { ambient: 0x10183a, intensity: 1.25 });
const key = new THREE.DirectionalLight(0xdfe8ff, 1.5); key.position.set(20, 30, 25); S.add(key);
const rim = new THREE.DirectionalLight(0xff3fd0, 2.4); rim.position.set(-30, -10, -20); S.add(rim);
const rim2 = new THREE.DirectionalLight(0x38d4ff, 2.6); rim2.position.set(30, -20, -30); S.add(rim2);
const chromeM = chrome({ roughness: .09 }), hair = chrome({ roughness: .2, color: 0xd9e4ff });
const face = faceMetal({ color: 0xe8eeff }), typeM = [face, chromeM];
const flatM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(1.4) });

// ---- galaxy: 3 layers at one huge world position ----
const GAL = new THREE.Vector3(0, -600, -1400);
const galaxy = film.points(420000, (i, r) => {
  const arm = i % 2, u = Math.pow(r(), .62), rad = 12 + u * 520, a = Math.log(rad / 12) / .28 + arm * Math.PI + (r() - .5) * (r() > .25 ? 1.05 : 4.2);
  const sp = (1 - u) * 26 + 28, x = Math.cos(a) * rad + (r() - .5) * sp, z = Math.sin(a) * rad + (r() - .5) * sp, y = (r() - .5) * (22 * Math.exp(-u * 3) + 7);
  const core = Math.exp(-u * 4.2), t = r(), hot = t > .985 ? 6 : 1;
  const cr = mix(.42, 1.5, core) * hot, cg = mix(.56, .95, core) * hot, cb = mix(1.35, .62, core) * hot; const pink = (Math.sin(a * 3 + u * 19) > .94 && r() > .6) ? 1 : 0;
  return [x, y, z, (.42 + r() * r() * 1.5), pink ? 2.2 : cr * .34, pink ? .35 : cg * .34, pink ? 1.1 : cb * .34];
}, { soft: 1.6, vertexPatch: `float a0=atan(p.z,p.x); float rr=length(p.xz); float w=time*(.18+6./(rr+14.)); float ca=cos(w),sa=sin(w); p.xz=mat2(ca,-sa,sa,ca)*p.xz;` });
galaxy.position.copy(GAL); S.add(galaxy);

// ---- deep star shell + near dust for parallax ----
const stars = film.points(26000, (i, r) => { const th = r() * 6.283, ph = Math.acos(2 * r() - 1), R = 700 + r() * 1400, l = .25 + r() * r() * 2; return [R * Math.sin(ph) * Math.cos(th), R * Math.cos(ph) - 300, R * Math.sin(ph) * Math.sin(th), 1.1 + r() * 2.8, l * .8, l * .86, l]; }, { soft: 2.2 }); S.add(stars);
const tunnelStars = film.points(30000, (i, r) => { const a = r() * 6.283, R = 3 + Math.pow(r(), 1.5) * 42; const h = r(); return [Math.cos(a) * R, Math.sin(a) * R, -r() * 980, .1 + r() * .28, mix(.6, 1.5, h), mix(.75, 1.1, h), mix(1.8, .9, h)]; }, { soft: 1 });
tunnelStars.position.set(0, 400, 0); S.add(tunnelStars);
const dust = film.points(9000, (i, r) => { const a = r() * 6.283, R = r() * 34; return [Math.cos(a) * R, -24 + (r() - .5) * 46, -r() * 120 + 18, .02 + r() * .05, .7, .8, 1.1]; }, { soft: 1 }); S.add(dust);

// ---- black hole: lensed accretion disc on a camera-facing quad, Schwarzschild-style bending ----
const bhU = { time: { value: 0 }, camP: { value: new THREE.Vector3() }, center: { value: GAL.clone() }, Rs: { value: 12 }, gain: { value: 1 } };
const bhMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: bhU,
  vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `varying vec3 vW; uniform vec3 camP,center; uniform float Rs,time,gain;
    float h(vec2 p){ return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5); }
    float nz(vec2 p){ vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y); }
    void main(){ vec3 ro=(camP-center)/Rs, rd=normalize(vW-camP); vec3 col=vec3(0.); float alpha=0.; vec3 p=ro; float b=length(cross(p,rd)); float captured=0.;
      for(int i=0;i<72;i++){ float r=length(p); float dt=clamp(r*.11,.035,14.); vec3 acc=-1.5*(b*b)*p/pow(r,5.); vec3 pn=p+rd*dt; rd=normalize(rd+acc*dt); 
        if(p.y*pn.y<0.){ vec3 x=mix(p,pn,p.y/(p.y-pn.y)); float rr=length(x.xz); if(rr>2.5&&rr<11.5){ float a=atan(x.z,x.x); float sw=a+3.2/sqrt(rr)*time*.9; float tex=nz(vec2(rr*1.9,sw*5.))*.65+nz(vec2(rr*6.,sw*13.))*.35; float fall=smoothstep(11.5,4.2,rr)*smoothstep(2.4,3.,rr); float dop=1.+.72*dot(normalize(vec3(-x.z,0.,x.x)),normalize(-rd)); float I=pow(max(dop,.0),3.)*fall*(.25+tex*1.25)*(3.3/rr); col+=vec3(1.5,.74,.3)*I*.55+vec3(.3,.5,1.2)*I*smoothstep(.9,1.8,dop)*.3; } }
        p=pn; if(r<1.02){ captured=1.; break; } if(r>260.) break; }
      float ring=0.; gl_FragColor=vec4(col*gain,1.); if(captured>.5&&dot(col,col)<1e-5) gl_FragColor=vec4(0.,0.,0.,1.); }` });
const bhBack = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshBasicMaterial({ color: 0x000000 })); bhBack.position.copy(GAL); bhBack.scale.setScalar(26); S.add(bhBack);
const bhQuad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bhMat); bhQuad.frustumCulled = false; bhQuad.renderOrder = 5; S.add(bhQuad);

// ---- models and type, built when assets arrive ----
const STAGE = { type: new THREE.Group(), rocks: new THREE.Group(), drive: new THREE.Group(), coma: new THREE.Group(), end: new THREE.Group() };
Object.values(STAGE).forEach(g => S.add(g));
let rockInst = []; const rockData = [], R = rng(5);
const fMi = film.font('assets/fonts/michroma.ttf'), fUn = film.font('assets/fonts/unbounded.ttf'), fMo = film.font('assets/fonts/jetbrains-mono.ttf');
const rocksP = Promise.all(['01', '03', '05'].map(n => film.model(`assets/models/moon_rock_${n}/moon_rock_${n}.gltf`)));
const driveP = film.model('assets/models/PrimaryIonDrive/PrimaryIonDrive.glb');
let driveObj, titleLetters, comaLetters, endLetters;
const dummy = new THREE.Object3D();
film.build = async () => {
  const [mi, un, mo] = await Promise.all([fMi, fUn, fMo]);
  titleLetters = film.text(un, 'ANDROMEDA', { size: 4.2, depth: 1.5, bevel: .09, seg: 3, tracking: .01, material: typeM }); STAGE.type.add(titleLetters); titleLetters.position.set(0, 0, 0);
  const sub = film.text(mo, 'MONTAGEM COMA', { size: .55, depth: 0, tracking: .24, material: flatM, align: 'left' }); sub.position.set(-11, -3.6, 1); STAGE.type.add(sub);
  comaLetters = film.text(un, 'COMA', { size: 34, depth: 8, bevel: .5, seg: 3, material: [faceMetal({ color: 0xffdcb0 }), chrome({ roughness: .05, color: 0xffd9a8 })] }); comaLetters.position.copy(GAL).add(new THREE.Vector3(10, 150, 330)); comaLetters.rotation.x = -.5; STAGE.coma.add(comaLetters);
  // the closing frame: the title stacked to read inside the reel-safe band
  const e1 = film.text(un, 'ANDRO', { size: 2.4, depth: .7, bevel: .05, material: typeM }), e2 = film.text(un, 'MEDA', { size: 2.4, depth: .7, bevel: .05, material: typeM }), e3 = film.text(mo, 'MONTAGEM COMA', { size: .62, depth: 0, tracking: .18, material: flatM });
  e1.position.y = 1.9; e2.position.y = -.9; e3.position.y = -3.1; STAGE.end.add(e1, e2, e3); e1.scale.setScalar(1); STAGE.end.position.set(GAL.x, GAL.y + 1500, GAL.z + 200); endLetters = [e1, e2];
  // asteroid belt: instanced real lunar scans
  const rocks = await rocksP; const N = [420, 300, 300]; let seq = 0;
  rocks.forEach((root, k) => { let geo, mat; root.traverse(m => { if (m.isMesh && !geo) { geo = m.geometry; mat = m.material; } }); geo = geo.clone(); geo.computeBoundingSphere(); const scl = 1 / geo.boundingSphere.radius; geo.scale(scl, scl, scl); mat = mat.clone(); mat.envMapIntensity = .16; mat.color.setScalar(.34); if (mat.normalScale) mat.normalScale.set(1.6, 1.6); const im = new THREE.InstancedMesh(geo, mat, N[k]); im.frustumCulled = false;
    for (let i = 0; i < N[k]; i++) { const y = -22 - R() * 44 + 0, ang = R() * 6.283, rad = 3.2 + Math.pow(R(), .7) * 40, big = R() > .93; rockData.push({ im, i, p: new THREE.Vector3(Math.cos(ang) * rad, y, Math.sin(ang) * rad * .8 - 8), s: (big ? 2 + R() * 3 : .25 + R() * 1.1), ax: new THREE.Vector3(R() - .5, R() - .5, R() - .5).normalize(), w: .6 + R() * 2.6, ph: R() * 6 }); } STAGE.rocks.add(im); rockInst.push(im); });
  driveObj = fit(await driveP, 16); repaint(driveObj, m => { if (m.isMeshStandardMaterial) { m.envMapIntensity = 2.2; if (m.emissiveMap || m.emissiveIntensity) m.emissiveIntensity = (m.emissiveIntensity || 1) * 6; } return null; }); driveObj.rotation.set(.1, 1.2, 0); STAGE.drive.add(driveObj); STAGE.drive.position.set(-14, -92, -44);
};
// ---- beat-locked camera route ----
const X = B; // one bar
const k = (b, p, l, o = {}) => Object.assign({ t: b * X, p, l }, o);
const G = GAL, gp = (x, y, z) => [G.x + x, G.y + y, G.z + z];
film.setRig([
  // 0: macro along chrome letters, truck right, pre-drop tension, frame 0 hook
  k(0, [-13.5, -.6, 9], [-12.2, 0, 0], { fov: 34, ap: .05 }), k(.5, [-5, 1.3, 10], [-4, 0, 0], { fov: 36, ap: .05 }), k(.9, [4, -1.4, 12], [3, 0, 0], { fov: 40, ap: .04 }),
  // 1: DROP. plunge straight down through the letters into the belt, spinning
  k(1.0, [6.5, 3.4, 7], [0, -3, 0], { fov: 44, roll: .08, ap: .02 }), k(1.4, [2.2, -14, 8], [-3, -36, -4], { fov: 58, roll: -.35 }), k(2, [-11, -32, 14], [-8, -38, -14], { fov: 48, roll: .12, ap: .03 }),
  // 2-3: weave left, under, up through rocks
  k(2.6, [-22, -48, 3], [-6, -40, -20], { fov: 52, roll: -.22, ap: .03 }), k(3, [-4, -60, -14], [4, -44, -32], { fov: 60, roll: .3 }), k(3.5, [17, -44, -22], [-5, -66, -36], { fov: 46, roll: -.1, ap: .03 }),
  // 4: chase up to the ion drive; rolls past engine bells
  k(4, [14, -72, -22], [-14, -92, -44], { fov: 34, ap: .12 }), k(4.6, [-30, -84, -28], [-14, -92, -44], { fov: 40, roll: .28, ap: .1 }), k(5, [-30, -104, -56], [-14, -92, -44], { fov: 52, roll: -.15, ap: .08 }), k(5.5, [-3, -102, -62], [-14, -92, -46], { fov: 32, ap: .08 }),
  // 6: dive into nozzle; whip forward
  k(6, [-11.5, -93.5, -49], [-14, -92, -44], { fov: 72, roll: .8 }),
  // 6: hyperspace tunnel, cut hidden inside the drive's blown exposure
  k(6.01, [0, 400, 20], [0, 400, -20], { cut: true, fov: 92, roll: 0 }), k(7, [0, 400, -240], [0, 400, -280], { fov: 84, roll: .5 }), k(8, [6, 402, -640], [0, 400, -690], { fov: 88, roll: -.3 }), k(8.5, [0, 400, -890], [0, 400, -960], { fov: 70, roll: 0 }),
  // 8.5: burst out above the galaxy
  k(8.51, gp(160, 720, 520), gp(0, 0, 0), { cut: true, fov: 48 }), k(9.5, gp(-240, 400, 260), gp(30, 0, 0), { fov: 54, roll: .1 }), k(10.2, gp(120, 240, 400), gp(10, 120, 320), { fov: 60, roll: -.1, ap: .6 }),
  // 10.5: fly at the giant COMA letters and through the O
  k(10.8, gp(10, 158, 400), gp(10, 150, 330), { fov: 58, ap: .5 }), k(11.2, gp(-14, 142, 330), gp(-10, 90, 180), { fov: 86, roll: .4 }),
  // 11.2: dive at black hole on a descending spiral (diagonal), horizon grows
  k(11.8, gp(-150, 60, 200), gp(0, 0, 0), { fov: 44, roll: -.12 }), k(12.5, gp(120, 26, 110), gp(0, 0, 0), { fov: 42, roll: .1 }), k(13, gp(34, 8, -74), gp(0, 0, 0), { fov: 50, roll: -.2 }), k(13.6, gp(-22, 3, -28), gp(0, 0, 0), { fov: 74, roll: .6 }), k(14, gp(-1.2, .4, -.5), gp(0, 0, 0), { fov: 120, roll: 1.4 }),
  // 14: flash → title pull back
  k(14.01, [G.x, G.y + 1500, G.z + 212], [G.x, G.y + 1500, G.z + 200], { cut: true, fov: 80, roll: -.5, ap: 0 }), k(14.5, [G.x + 3, G.y + 1499.6, G.z + 225], [G.x, G.y + 1499.9, G.z + 200], { fov: 40, roll: .02, ap: .05 }), k(15.2, [G.x + .6, G.y + 1500, G.z + 231], [G.x, G.y + 1499.9, G.z + 200], { fov: 34, ap: .05 }),
].map(q => q));
film.impact(A, { fov: 2, dolly: .16, shake: .035, roll: .007, drift: .03, decay: 10, seed: 4 });

const drop = 1 * X, bars = v => v * X, q = new THREE.Quaternion(), v3 = new THREE.Vector3();
film.updateFn = (t) => {
  const fk = A.kick(t, 8), fb = A.bell(t, 11);
  galaxy.material.uniforms.time.value = t * 1.3; dust.visible = t < bars(6.05); tunnelStars.visible = t > bars(5.9) && t < bars(8.6); stars.material.uniforms.time.value = t;
  // chrome title: letters separated by drop, flying apart as camera plunges
  if (titleLetters) { const ex = tween(t, drop - .08, .55, ease.expoOut); titleLetters.children.forEach((m, i) => { const h = m.userData.home, s = (i * 2.399) % 6.283; m.position.set(h.x + Math.cos(s) * ex * 7, h.y + Math.sin(s) * ex * 7, h.z + (i % 2 ? 1 : -1) * ex * 8); m.rotation.set(ex * Math.sin(s * 3) * 2.2 + fk * .02, ex * Math.cos(s * 2) * 2.4, ex * s * .3); const p = t < drop ? fb * .22 * (i % 2 ? 1 : -1) : 0; m.position.y += p; }); }
  STAGE.type.visible = t < bars(2.1);
  // rocks spin and pump outward on kicks
  const belt = t > bars(1) && t < bars(6.1); STAGE.rocks.visible = belt;
  if (belt) { const pump = 1 + fk * .25; for (const d of rockData) { dummy.position.copy(d.p); dummy.quaternion.setFromAxisAngle(d.ax, d.ph + t * d.w); dummy.scale.setScalar(d.s * pump); dummy.updateMatrix(); d.im.setMatrixAt(d.i, dummy.matrix); } rockInst.forEach(m => m.instanceMatrix.needsUpdate = true); }
  STAGE.drive.visible = t > bars(3.3) && t < bars(6.2); if (driveObj) { driveObj.rotation.z = t * .45; driveObj.rotation.y = 1.2 + fk * .05; }
  STAGE.coma.visible = t > bars(9) && t < bars(11.6);
  if (comaLetters) comaLetters.children.forEach((m, i) => { const h = m.userData.home, ph = bars(10.1) + i * A.spb * .5, a = tween(t, ph, .35, ease.back); m.position.y = h.y + (1 - a) * -120; m.rotation.x = (1 - a) * 1.4; m.scale.setScalar(1 + A.kick(t, 7) * .05); });
  const inGal = t > bars(8.4) && t < bars(14.1); galaxy.visible = inGal; bhBack.visible = inGal; bhQuad.visible = inGal; stars.visible = t < bars(14.2);
  if (inGal) { const cam = film.camera; bhU.camP.value.copy(cam.position); bhU.time.value = t * 2.2; bhU.gain.value = 1 + fk * .9; cam.getWorldQuaternion(q); bhQuad.quaternion.copy(q); v3.set(0, 0, -1).applyQuaternion(q); bhQuad.position.copy(cam.position).addScaledVector(v3, 1.2); const hh = 2.4 * Math.tan(cam.fov * Math.PI / 360) * 1.3; bhQuad.scale.set(hh * cam.aspect * 1.3, hh * 1.3, 1); bhQuad.position.addScaledVector(v3, 0); bhQuad.material.depthTest = false; bhQuad.renderOrder = 99; }
  STAGE.end.visible = t > bars(13.9);
  if (endLetters) { const a = tween(t, bars(14), 1, ease.out); STAGE.end.rotation.y = (1 - a) * .3 + Math.sin(t * .8) * .03; STAGE.end.rotation.x = Math.sin(t * 1.1) * .018; const s = 1 + fk * .012; endLetters.forEach(e => e.scale.setScalar(s)); }
  S.environmentRotation.y = t * .55; S.environmentRotation.x = Math.sin(t * .4) * .3;
};
film.postFn = t => {
  const wh = (b, w = .28, a = .35) => a * Math.exp(-Math.pow((t - bars(b)) / w, 2));
  const fk = A.kick(t, 7), dropF = Math.exp(-Math.max(0, t - drop) * 7) * (t >= drop ? 1 : 0);
  const nozzle = smooth(bars(5.82), bars(6), t) * (1 - smooth(bars(6), bars(6.22), t));
  const blast = smooth(bars(8.35), bars(8.5), t) * (1 - smooth(bars(8.5), bars(8.74), t));
  const bhF = smooth(bars(13.72), bars(14), t) * (1 - smooth(bars(14), bars(14.26), t));
  const hyper = smooth(bars(6), bars(6.4), t) * (1 - smooth(bars(8.2), bars(8.5), t));
  return { flash: nozzle * 2.2 + blast * 2.2 + bhF * 3.2 + dropF * .9 + fk * .025, flashC: bhF > .02 ? 0xffe6c8 : nozzle > .02 ? 0x9ad8ff : 0xdce6ff,
    zoom: wh(1.05, .2, .22) + wh(6, .22, .2) + hyper * (.05 + fk * .05) + wh(14, .22, .3) + wh(8.5, .22, .18) + wh(11.1, .22, .2), ca: .006 * fk + hyper * .012 + bhF * .03,
    exposure: fk * .16, shock: dropF * 1.1 + A.hit(t, 8) * .22, shockR: (1 - Math.exp(-Math.max(0, A.since(A.hits, t)) * 5)) * .9 };
};
film.start();

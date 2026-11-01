// MONTAGEM ZORA ("dawn"). The bright one: rose-gold sky over a cloud sea, marble type and arches, a bronze whale. Route: forward low over cloud toward ZORA → through the O → weave down the colonnade → burst UP → truck L beside the whale → drop DOWN and orbit R round the statue → pedestal UP its face → diagonal dive into sun → title.
const { THREE, Film, makeAudio, rng, clamp, mix, smooth, ease, tween, chrome, fit, repaint, faceMetal } = PK;
const A = makeAudio(window.AUDIO), X = A.barLen, bars = v => v * X;
const film = new Film({ seed: 77, bg: 0xffc9a8, bloom: .34, bloomK: 1.15, streak: .05, tone: 'agx', exposure: 1.08, sat: 1.5, contrast: 1.3, grain: .02, vignette: .25, ca: .0008, shutter: .5, fogColor: 0xffc4a0, fogDensity: .0021, shadowTint: [1, .94, 1.04], highTint: [1.05, 1, .92] });
const S = film.scene; film.hdri('assets/hdri/kiara_1_dawn.hdr', 1.05);
const sunDir = new THREE.Vector3(.0, .17, -1).normalize();
const sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 32), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { sun: { value: sunDir }, time: { value: 0 }, punch: { value: 0 } }, vertexShader: `varying vec3 vD; void main(){ vD=normalize(position); vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position=p; }`, fragmentShader: `varying vec3 vD; uniform vec3 sun; uniform float punch;
 void main(){ vec3 d=normalize(vD); float h=clamp(d.y*.5+.5,0.,1.); vec3 c=mix(vec3(1.25,.68,.42),vec3(.42,.5,.9),smoothstep(.5,.86,h)); c=mix(vec3(1.35,.9,.62),c,smoothstep(.47,.58,h)); float s=max(dot(d,sun),0.); c+=vec3(1.4,.85,.45)*pow(s,14.)*.9+vec3(2.,1.45,.9)*pow(s,120.)*1.6+vec3(16.,12.,8.)*(smoothstep(.9985,.9992,s))*(1.+punch*.4); gl_FragColor=vec4(c,1.); }` })); sky.frustumCulled = false; S.add(sky);
// cloud sea: fbm height lit from sun, fades to horizon
const clU = { time: { value: 0 }, sun: { value: sunDir }, cam: { value: new THREE.Vector3() } };
const cloud = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.ShaderMaterial({ uniforms: clU, transparent: false, fog: false, vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`, fragmentShader: `varying vec3 vW; uniform float time; uniform vec3 sun,cam;
 float h(vec2 p){ return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5453); } float n(vec2 p){ vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y); }
 float fbm(vec2 p){ float a=.5,s=0.; for(int i=0;i<6;i++){ s+=a*n(p); p=mat2(1.6,1.2,-1.2,1.6)*p; a*=.5; } return s; }
 void main(){ vec2 q=vW.xz*.012+vec2(time*.05,time*.02); float H=fbm(q+fbm(q*.6)*1.6); float e=.05; float hx=fbm(q+vec2(e,0.)+fbm((q+vec2(e,0.))*.6)*1.6), hz=fbm(q+vec2(0.,e)+fbm((q+vec2(0.,e))*.6)*1.6); vec3 N=normalize(vec3(H-hx,e*.28,H-hz)); float l=clamp(dot(N,normalize(vec3(sun.x,.3,sun.z)))*.7+.35,0.,1.); vec3 c=mix(vec3(.72,.36,.5),vec3(1.5,1.02,.74),l*l); c=mix(c,vec3(1.7,1.2,.86),smoothstep(.45,.76,H)*.8); float dist=length(vW-cam); float f=1.-exp(-dist*dist*7e-7); vec3 hz2=vec3(1.35,.9,.62); float s=max(dot(normalize(vW-cam),sun),0.); hz2+=vec3(1.2,.75,.4)*pow(s,14.); gl_FragColor=vec4(mix(c,hz2,f),1.); }` })); cloud.rotation.x = -Math.PI / 2; cloud.position.y = -40; cloud.frustumCulled = false; S.add(cloud);
const marble = new THREE.MeshPhysicalMaterial({ color: 0xfff1e6, roughness: .3, clearcoat: .6, clearcoatRoughness: .2, envMapIntensity: 1.1 }), roseM = new THREE.MeshPhysicalMaterial({ color: 0xffc6b6, roughness: .34, envMapIntensity: 1.2 }), goldE = chrome({ color: 0xffcc8a, roughness: .16, envMapIntensity: 1.2 });
const sun = new THREE.DirectionalLight(0xffd8b0, 3.4); sun.position.copy(sunDir).multiplyScalar(100).add(new THREE.Vector3(0, 40, 0)); S.add(sun); const bounce = new THREE.DirectionalLight(0xff9f8a, 1.3); bounce.position.set(0, -30, 40); S.add(bounce);
// arches: extruded, instanced along z
function archGeo(W = 16, H = 40, T = 3.2) { const s = new THREE.Shape(); s.moveTo(-W, -40); s.lineTo(W, -40); s.lineTo(W, H); s.lineTo(-W, H); s.lineTo(-W, -40); const h = new THREE.Path(); const r = W * .72, top = H - r - 5; h.moveTo(-r, -38); h.lineTo(-r, top); h.absarc(0, top, r, Math.PI, 0, true); h.lineTo(r, -38); h.lineTo(-r, -38); s.holes.push(h); return new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: true, bevelThickness: .4, bevelSize: .4, bevelSegments: 3, curveSegments: 28 }); }
const NA = 34, DZ = 25, arches = new THREE.InstancedMesh(archGeo(), marble, NA); arches.frustumCulled = false; { const m = new THREE.Object3D(); for (let i = 0; i < NA; i++) { m.position.set(0, 0, -110 - i * DZ); m.updateMatrix(); arches.setMatrixAt(i, m.matrix); } } S.add(arches);
const ribG = new THREE.BoxGeometry(.6, 90, .6), ribs = new THREE.InstancedMesh(ribG, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, .95, .55) }), NA * 2); ribs.frustumCulled = false; { const m = new THREE.Object3D(); for (let i = 0; i < NA; i++) { for (let j = 0; j < 2; j++) { m.position.set(j ? 11.8 : -11.8, 4, -106 - i * DZ); m.updateMatrix(); ribs.setMatrixAt(i * 2 + j, m.matrix); } } } S.add(ribs);
const motes = film.points(9000, (i, r) => [(r() - .5) * 40, -30 + r() * 80, -100 - r() * 900, .03 + r() * .1, 1.6, 1.1, .75], { soft: 1 }); S.add(motes);
const fD = film.font('assets/fonts/dm-serif-display.ttf'), fM = film.font('assets/fonts/jetbrains-mono.ttf'), pS = film.model('assets/models/gothic_statue/gothic_statue.gltf'), pW = film.model('assets/models/bronze_whale_statue/bronze_whale_statue.gltf');
let word, statue, whale, whale2, endG; const OZ = -40, WH = new THREE.Vector3(-260, 150, -1020), ST = new THREE.Vector3(-520, 10, -1100), END = new THREE.Vector3(-520, 240, -1700);
film.build = async () => {
  const [dm, mo] = await Promise.all([fD, fM]); word = film.text(dm, 'ZORA', { size: 40, depth: 7, bevel: .35, seg: 3, material: [marble, goldE] }); word.position.set(0, 10, OZ); S.add(word);
  const rs = await pS; repaint(rs, m => { m.envMapIntensity = 1.4; m.color.multiplyScalar(1.25); return null; }); statue = fit(rs, 140); statue.position.copy(ST); S.add(statue);
  const rw = await pW; repaint(rw, m => { m.envMapIntensity = 1.8; m.metalness = 1; m.roughness = Math.min(m.roughness ?? .4, .3); return null; }); whale = fit(rw, 96); whale.position.copy(WH); whale.rotation.y = 1.57; S.add(whale); whale2 = whale.clone(true); whale2.scale.setScalar(.45); S.add(whale2);
  endG = new THREE.Group(); const plum = new THREE.MeshPhysicalMaterial({ color: 0x2a0a26, roughness: .24, clearcoat: 1, clearcoatRoughness: .06, envMapIntensity: 1 }); const e1 = film.text(dm, 'ZORA', { size: 8.8, depth: 1.4, bevel: .1, material: [plum, goldE] }), e2 = film.text(mo, 'MONTAGEM', { size: 1.05, depth: 0, tracking: .24, material: new THREE.MeshBasicMaterial({ color: 0x2a0a26 }) }); e1.position.y = 1; e2.position.y = -4.7; endG.add(e1, e2); endG.position.copy(END); S.add(endG);
};
const K = (b, p, l, o = {}) => Object.assign({ t: bars(b), p, l }, o), pa = v => [v.x, v.y, v.z];
film.setRig([
  K(0, [18, -14, 120], [4, 8, OZ], { fov: 40, roll: .06 }), K(.5, [-16, 4, 72], [0, 8, OZ], { fov: 42, roll: -.08 }), K(.92, [-5, 12, 18], [-1, 12, OZ], { fov: 50, roll: .05 }),
  K(1.05, [2, 13, -28], [2, 12, -110], { fov: 62, roll: .14 }),
  K(1.6, [6, -6, -120], [-1, 2, -220], { fov: 60, roll: -.26 }), K(2.2, [-7, 8, -220], [2, 2, -320], { fov: 62, roll: .32 }), K(2.8, [6, -12, -340], [-2, 4, -440], { fov: 60, roll: -.3 }), K(3.4, [-6, 14, -470], [2, 6, -570], { fov: 62, roll: .4 }), K(4, [5, -2, -610], [0, 10, -720], { fov: 62, roll: -.26 }), K(4.45, [0, 20, -760], [0, 80, -880], { fov: 62, roll: .1 }),
  // up & out: whale truck left
  K(5, [-40, 120, -940], [WH.x + 80, WH.y + 8, WH.z], { fov: 46, roll: -.1, ap: .3 }), K(5.5, [WH.x + 100, WH.y - 14, WH.z + 92], [WH.x + 34, WH.y, WH.z], { fov: 36, ap: .4, roll: .05 }), K(6, [WH.x - 30, WH.y - 4, WH.z + 82], [WH.x - 14, WH.y + 2, WH.z], { fov: 34, ap: .4 }), K(6.5, [WH.x - 80, WH.y - 40, WH.z + 34], [WH.x - 36, WH.y, WH.z], { fov: 44, roll: -.2, ap: .25 }),
  // drop to statue, orbit R, rise
  K(7, [ST.x + 60, ST.y + 16, ST.z + 120], pa(ST.clone().add(new THREE.Vector3(0, 20, 0))), { fov: 38, roll: .08, ap: .3 }), K(7.6, [ST.x + 96, ST.y - 8, ST.z + 40], pa(ST), { fov: 34, ap: .34 }), K(8.2, [ST.x + 36, ST.y + 22, ST.z - 90], pa(ST.clone().add(new THREE.Vector3(0, 28, 0))), { fov: 38, roll: -.1, ap: .3 }), K(8.8, [ST.x - 88, ST.y + 42, ST.z - 20], pa(ST.clone().add(new THREE.Vector3(0, 42, 0))), { fov: 34, ap: .3 }), K(9.4, [ST.x - 20, ST.y + 58, ST.z + 74], pa(ST.clone().add(new THREE.Vector3(0, 50, 0))), { fov: 32, roll: .05, ap: .3 }),
  // diagonal climb into sun
  K(10, [ST.x + 4, ST.y + 110, ST.z - 40], [ST.x, 200, ST.z - 900], { fov: 54, roll: .14 }), K(10.6, [ST.x + 2, 180, END.z + 240], [END.x, 228, END.z - 400], { fov: 66, roll: -.1 }),
  K(11, [END.x, 241, END.z + 60], [END.x, 241, END.z], { fov: 42, ap: .05 }), K(13, [END.x, 240.5, END.z + 72], [END.x, 240.5, END.z], { fov: 33, ap: .05 }),
]);
film.impact(A, { fov: 1.6, dolly: .5, shake: .08, roll: .006, drift: .08, decay: 10, seed: 19 });
film.updateFn = t => {
  const fk = A.kick(t, 8), fb = A.bell(t, 11), cam = film.camera.position;
  sky.position.copy(cam); clU.time.value = t; clU.cam.value.copy(cam); sky.material.uniforms.punch.value = fk; cloud.position.x = cam.x; cloud.position.z = cam.z; S.environmentRotation.y = t * .05 + 2.1;
  arches.visible = ribs.visible = t > bars(.8) && t < bars(5.1); motes.visible = arches.visible; ribs.material.color.setRGB(1.6, .95, .55).multiplyScalar(.5 + fk * 2.2);
  if (!word) return; word.visible = t < bars(1.3); word.children.forEach((m, i) => { const h = m.userData.home, a = tween(t, i * A.spb * .22, .4, ease.back); m.position.y = h.y + (1 - a) * -40 + fb * .5; m.rotation.x = (1 - a) * .8; });
  whale.visible = whale2.visible = t > bars(4.3) && t < bars(7); if (whale.visible) { const k = t - bars(4.5); whale.position.x = WH.x - k * 3; whale.rotation.z = Math.sin(t * 1.4) * .07; whale.rotation.x = Math.sin(t * .7) * .05 + fk * .012; whale2.position.set(WH.x + 180 - k * 7, WH.y + 60, WH.z - 120); whale2.rotation.set(0, 1.57, Math.sin(t * 1.1) * .09); }
  statue.visible = t > bars(6.5) && t < bars(10.4); if (statue.visible) statue.scale.setScalar(1 + fk * .012);
  endG.visible = t > bars(10.3); endG.children.forEach(g => g.children.forEach((m, i) => { const h = m.userData.home; const a = tween(t, bars(10.75) + i * A.spb * .25, .4, ease.back); m.position.y = h.y + (1 - a) * -9; m.rotation.x = (1 - a) * 1.2; m.scale.setScalar(1 + fk * .012); }));
};
film.postFn = t => {
  const fk = A.kick(t, 7), w = (b, s, a) => a * Math.exp(-Math.pow((t - bars(b)) / s, 2)), oh = smooth(bars(.95), bars(1.04), t) * (1 - smooth(bars(1.04), bars(1.2), t)), sn = smooth(bars(10.35), bars(10.7), t) * (1 - smooth(bars(10.7), bars(10.95), t)), hall = smooth(bars(1), bars(1.3), t) * (1 - smooth(bars(4.3), bars(4.6), t));
  return { flash: oh * 1.1 + sn * 3.2 + fk * .02, flashC: 0xffe4c4, exposure: fk * .13, zoom: w(1.05, .2, .16) + w(4.5, .22, .16) + w(10.7, .22, .28) + hall * (.01 + fk * .03), ca: fk * .0022 + sn * .01, shock: A.hit(t, 9) * .25, shockR: (1 - Math.exp(-A.since(A.hits, t) * 5)) * .9 };
};
film.start();

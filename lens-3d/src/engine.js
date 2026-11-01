// MotionKit lens engine. three.js + accumulation-buffer camera:
// every output frame averages N renders across the shutter, each with a jittered lens and sub-pixel offset,
// so motion blur, depth of field and anti-aliasing are physically correct. All state is a pure function of time.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import opentype from 'opentype.js';

export { THREE, mergeGeometries };

// ---------- deterministic helpers ----------
export function rng(seed) { let a = (seed * 2654435761) >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const mix = (a, b, k) => a + (b - a) * k;
export const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
export const ease = {
  linear: k => k, inOut: k => k * k * (3 - 2 * k), inOut3: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
  out: k => 1 - Math.pow(1 - k, 3), out5: k => 1 - Math.pow(1 - k, 5), expoOut: k => k >= 1 ? 1 : 1 - Math.pow(2, -10 * k), in: k => k * k * k,
  back: k => { const c = 1.4; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
};
export const tween = (t, t0, dur, e = ease.out) => e(clamp((t - t0) / dur));
// smooth value noise for drift and shake
export function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i, h = n => { const s = Math.sin((n + seed * 17.3) * 127.1) * 43758.5453; return s - Math.floor(s); }, u = f * f * (3 - 2 * f); return mix(h(i), h(i + 1), u) * 2 - 1; }

// ---------- audio-driven data ----------
export function makeAudio(d) {
  const F = d.fps, at = (arr, t) => { const x = t * F, i = Math.floor(x); if (i < 0) return arr[0]; if (i >= arr.length - 1) return arr[arr.length - 1]; return mix(arr[i], arr[i + 1], x - i); };
  const since = (list, t) => { let lo = 0, hi = list.length; while (lo < hi) { const m = (lo + hi) >> 1; if (list[m] <= t) lo = m + 1; else hi = m; } return lo === 0 ? 1e6 : t - list[lo - 1]; };
  const count = (list, t) => { let lo = 0, hi = list.length; while (lo < hi) { const m = (lo + hi) >> 1; if (list[m] <= t) lo = m + 1; else hi = m; } return lo; };
  return {
    ...d, barLen: d.bar, low: t => at(d.lowE, t), mid: t => at(d.midE, t), high: t => at(d.highE, t), rms: t => at(d.rmsE, t),
    pulse: (list, t, decay = 7) => { const s = since(list, t); return s > 5 ? 0 : Math.exp(-s * decay); },
    kick: (t, decay = 7) => { const s = since(d.kicks, t); return s > 5 ? 0 : Math.exp(-s * decay); },
    bell: (t, decay = 10) => { const s = since(d.bells, t); return s > 5 ? 0 : Math.exp(-s * decay); },
    hit: (t, decay = 4) => { const s = since(d.hits, t); return s > 5 ? 0 : Math.exp(-s * decay); },
    since, count, beat: n => d.t0 + n * d.spb, bar: n => d.t0 + n * 4 * d.spb, beatF: t => (t - d.t0) / d.spb,
  };
}

// ---------- camera rig: splines through keys, monotone in time, so motion is one flow, not hops ----------
// key: {t, p:[x,y,z], l:[x,y,z], fov, roll, f (focus distance; default = |p-l|), ap (aperture radius), cut:true (starts a new run)}
export function makeRig(keys) {
  const runs = []; let cur = [];
  keys.forEach(k => { if (k.cut && cur.length) { runs.push(cur); cur = []; } cur.push(k); });
  if (cur.length) runs.push(cur);
  const built = runs.map(r => {
    const P = new THREE.CatmullRomCurve3(r.map(k => new THREE.Vector3(...k.p)), false, 'centripetal', .5);
    const L = new THREE.CatmullRomCurve3(r.map(k => new THREE.Vector3(...k.l)), false, 'centripetal', .5);
    // Fritsch-Butland monotone mapping t -> u so velocity is continuous through each key
    const n = r.length, xs = r.map(k => k.t), ys = r.map((_, i) => i / Math.max(1, n - 1));
    const d = []; for (let i = 0; i < n - 1; i++) d[i] = (ys[i + 1] - ys[i]) / Math.max(1e-4, xs[i + 1] - xs[i]);
    const m = new Array(n).fill(0);
    for (let i = 1; i < n - 1; i++) { if (d[i - 1] * d[i] > 0) { const h0 = xs[i] - xs[i - 1], h1 = xs[i + 1] - xs[i]; m[i] = 3 * (h0 + h1) / ((2 * h1 + h0) / d[i - 1] + (h1 + 2 * h0) / d[i]); } }
    m[0] = r[0].startV !== undefined ? r[0].startV * d[0] : d[0]; m[n - 1] = r[n - 1].endV !== undefined ? r[n - 1].endV * d[n - 2] : d[Math.max(0, n - 2)];
    const U = t => {
      if (n === 1) return 0; if (t <= xs[0]) return 0; if (t >= xs[n - 1]) return 1;
      let i = 0; while (i < n - 2 && t > xs[i + 1]) i++;
      const h = xs[i + 1] - xs[i], s = (t - xs[i]) / h, s2 = s * s, s3 = s2 * s;
      return (2 * s3 - 3 * s2 + 1) * ys[i] + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * ys[i + 1] + (s3 - s2) * h * m[i + 1];
    };
    return { r, P, L, U, t0: xs[0], t1: xs[n - 1], lastP: new THREE.Vector3(), scalar: (key, u, dflt) => { const x = u * (n - 1), i = Math.min(n - 2, Math.floor(x)); if (n === 1) return r[0][key] ?? dflt; const a = r[i][key] ?? dflt, b = r[i + 1][key] ?? dflt, k = x - i; return mix(a, b, k * k * (3 - 2 * k)); } };
  });
  const p = new THREE.Vector3(), l = new THREE.Vector3();
  return t => {
    let run = built[0]; for (const b of built) if (t >= b.t0) run = b;
    const u = run.U(t); run.P.getPoint(u, p); run.L.getPoint(u, l);
    return { p: p.clone(), l: l.clone(), fov: run.scalar('fov', u, 38), roll: run.scalar('roll', u, 0), f: run.scalar('f', u, 0), ap: run.scalar('ap', u, 0) };
  };
}

const quadVS = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;

// ---------- the film ----------
export class Film {
  constructor(o) {
    this.o = Object.assign({ w: 1080, h: 1920, fps: 30, samples: 24, shutter: .5, seed: 1, bg: 0x000000,
      bloom: .35, bloomK: 1.1, streak: 0, tone: 'aces', exposure: 1, sat: 1.05, contrast: 1.05, grain: .035, vignette: .55, ca: .0016,
      shadowTint: [1, 1, 1], highTint: [1, 1, 1], lift: 0, fogColor: 0x000000, fogDensity: 0, shadows: false, clampHDR: 24 }, o);
    const q = new URLSearchParams(location.search); if (q.get('samples')) this.o.samples = +q.get('samples');
    const { w, h } = this.o; this.canvas = document.getElementById('gl');
    const R = this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: true, stencil: false });
    R.setPixelRatio(1); R.setSize(w, h, false); R.toneMapping = THREE.NoToneMapping; R.outputColorSpace = THREE.LinearSRGBColorSpace;
    if (this.o.shadows) { R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; }
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(this.o.bg);
    if (this.o.fogDensity) this.scene.fog = new THREE.FogExp2(this.o.fogColor, this.o.fogDensity);
    this.camera = new THREE.PerspectiveCamera(38, w / h, .05, 4000);
    this.rig = null; this.updateFn = () => {}; this.postFn = () => ({}); this.jitterLights = []; this.ready = [];
    this.fontCache = {}; this.post = { flash: 0, ca: 0, zoom: 0, shock: 0, exposure: 0, split: 0, tint: null, roll: 0 };
    this._setupTargets(); this._setupPost();
    this.gltf = new GLTFLoader(); this.tex = new THREE.TextureLoader();
  }
  _rt(w, h, opt = {}) { return new THREE.WebGLRenderTarget(w, h, Object.assign({ type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false, generateMipmaps: false }, opt)); }
  _setupTargets() {
    const { w, h } = this.o;
    this.rtScene = this._rt(w, h, { depthBuffer: true, samples: 0 });
    this.rtAcc = this._rt(w, h);
    this.mips = []; let mw = w >> 1, mh = h >> 1; for (let i = 0; i < 6; i++) { this.mips.push(this._rt(Math.max(2, mw), Math.max(2, mh))); mw >>= 1; mh >>= 1; }
    this.rtStreak = [this._rt(w >> 2, h >> 3), this._rt(w >> 2, h >> 3)];
    this.rtComp = this._rt(w, h);
  }
  _pass(fs, uniforms = {}) { return new THREE.ShaderMaterial({ vertexShader: quadVS, fragmentShader: fs, uniforms, depthTest: false, depthWrite: false, toneMapped: false }); }
  _setupPost() {
    this.quadS = new THREE.Scene(); this.quadC = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null); this.quad.frustumCulled = false; this.quadS.add(this.quad);
    this.mAcc = this._pass(`varying vec2 vUv; uniform sampler2D t; uniform float w,cl; void main(){ vec3 c=texture2D(t,vUv).rgb; c=min(c,vec3(cl)); if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)) c=vec3(0.); gl_FragColor=vec4(c*w,1.); }`, { t: { value: null }, w: { value: 1 }, cl: { value: 24 } });
    this.mAcc.blending = THREE.CustomBlending; this.mAcc.blendSrc = THREE.OneFactor; this.mAcc.blendDst = THREE.OneFactor; this.mAcc.blendEquation = THREE.AddEquation; this.mAcc.transparent = true;
    // radial speed blur + chromatic split happen in linear HDR, before bloom, so streaks glow
    this.mPre = this._pass(`varying vec2 vUv; uniform sampler2D t; uniform float zoom,ca,shock,shockR; uniform vec2 c;
      void main(){ vec2 d=vUv-c; float r=length(d*vec2(.5625,1.));
        vec2 uv=vUv+normalize(d+1e-5)*shock*smoothstep(.16,0.,abs(r-shockR))*.05;
        vec3 acc=vec3(0.); float tw=0.;
        for(int i=0;i<12;i++){ float k=(float(i)+.5)/12.; float w=1.-k*.6; vec2 u=mix(uv,c,zoom*k);
          float a=ca*(.25+r*2.2);
          acc+=w*vec3(texture2D(t,u+d*a).r,texture2D(t,u).g,texture2D(t,u-d*a).b); tw+=w; }
        gl_FragColor=vec4(acc/tw,1.); }`, { t: { value: null }, zoom: { value: 0 }, ca: { value: 0 }, shock: { value: 0 }, shockR: { value: 0 }, c: { value: new THREE.Vector2(.5, .5) } });
    this.mBright = this._pass(`varying vec2 vUv; uniform sampler2D t; uniform float k; void main(){ vec3 c=texture2D(t,vUv).rgb; float l=max(c.r,max(c.g,c.b)); float s=clamp(l-k+.5,0.,1.); s=s*s*.5; float g=max(s,l-k)/max(l,1e-4); gl_FragColor=vec4(min(c*g,vec3(12.)),1.); }`, { t: { value: null }, k: { value: 1 } });
    this.mDown = this._pass(`varying vec2 vUv; uniform sampler2D t; uniform vec2 px; void main(){ vec3 s=texture2D(t,vUv).rgb*4.;
       s+=texture2D(t,vUv+px*vec2(-1.,-1.)).rgb; s+=texture2D(t,vUv+px*vec2(1.,-1.)).rgb; s+=texture2D(t,vUv+px*vec2(-1.,1.)).rgb; s+=texture2D(t,vUv+px*vec2(1.,1.)).rgb; gl_FragColor=vec4(s/8.,1.); }`, { t: { value: null }, px: { value: new THREE.Vector2() } });
    this.mUp = this._pass(`varying vec2 vUv; uniform sampler2D t; uniform vec2 px; uniform float g; void main(){ vec3 s=vec3(0.);
       s+=texture2D(t,vUv+px*vec2(-2.,0.)).rgb+texture2D(t,vUv+px*vec2(2.,0.)).rgb+texture2D(t,vUv+px*vec2(0.,-2.)).rgb+texture2D(t,vUv+px*vec2(0.,2.)).rgb;
       s+=2.*(texture2D(t,vUv+px*vec2(-1.,1.)).rgb+texture2D(t,vUv+px*vec2(1.,1.)).rgb+texture2D(t,vUv+px*vec2(-1.,-1.)).rgb+texture2D(t,vUv+px*vec2(1.,-1.)).rgb); gl_FragColor=vec4(s/12.*g,1.); }`, { t: { value: null }, px: { value: new THREE.Vector2() }, g: { value: 1 } });
    this.mUp.blending = THREE.CustomBlending; this.mUp.blendSrc = THREE.OneFactor; this.mUp.blendDst = THREE.OneFactor; this.mUp.transparent = true;
    this.mStreak = this._pass(`varying vec2 vUv; uniform sampler2D t; uniform float px; void main(){ vec3 s=vec3(0.); float tw=0.; for(int i=-8;i<=8;i++){ float w=exp(-abs(float(i))*.28); s+=w*texture2D(t,vUv+vec2(float(i)*px,0.)).rgb; tw+=w; } gl_FragColor=vec4(s/tw,1.); }`, { t: { value: null }, px: { value: 0 } });
    const tones = { aces: `vec3 tone(vec3 x){ x*=.6; return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.); }`,
      agx: `vec3 tone(vec3 c){ mat3 a=mat3(.842479,.0423282,.0423756,.0784336,.878468,.0784336,.0792237,.0791661,.879142); mat3 b=mat3(1.19688,-.0528969,-.0529716,-.0980209,1.15190,-.0980435,-.0990297,-.0989612,1.15107); c=a*c; c=clamp((log2(max(c,1e-5))+12.47393)/16.5,0.,1.); vec3 x2=c*c,x4=x2*x2; c=15.5*x4*x2-40.14*x4*c+31.96*x4-6.868*x2*c+.4298*x2+.1191*c-.00232; c=b*c; return clamp(pow(max(c,0.),vec3(2.2)),0.,1.); }` };
    this.mFinal = this._pass(`varying vec2 vUv; uniform sampler2D t,b,st; uniform float bloom,streak,exposure,flash,vig,grain,sat,con,lift,seed; uniform vec3 sTint,hTint,flashC;
      ${tones[this.o.tone]}
      float h(vec2 p){ vec3 q=fract(vec3(p.xyx)*.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
      void main(){ vec3 c=texture2D(t,vUv).rgb; c+=texture2D(b,vUv).rgb*bloom; c+=texture2D(st,vUv).rgb*streak*vec3(.55,.75,1.);
        vec2 d=vUv-.5; d.x*=.72; float v=1.-vig*smoothstep(.2,.95,length(d)*1.28); c*=v;
        c*=exposure; c+=flashC*flash; c=tone(c);
        float l=dot(c,vec3(.2126,.7152,.0722));
        c=mix(vec3(l),c,sat); c=mix(c*sTint,c*hTint,smoothstep(.05,.75,l)); c=pow(max(c+lift*(1.-c),0.),vec3(1.)); c=clamp((c-.5)*con+.5,0.,1.);
        vec2 px=gl_FragCoord.xy; float n=h(px+seed*37.)+h(px*1.7+seed*91.)-1.; float gs=grain*mix(1.,.45,smoothstep(.0,.8,l));
        c+=n*gs; c=pow(max(c,0.),vec3(1./2.2)); c+=(h(px-seed*13.)-.5)/255.; gl_FragColor=vec4(c,1.); }`,
      { t: { value: null }, b: { value: null }, st: { value: null }, bloom: { value: 0 }, streak: { value: 0 }, exposure: { value: 1 }, flash: { value: 0 }, flashC: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0 }, grain: { value: 0 }, sat: { value: 1 }, con: { value: 1 }, lift: { value: 0 }, seed: { value: 0 }, sTint: { value: new THREE.Vector3(1, 1, 1) }, hTint: { value: new THREE.Vector3(1, 1, 1) } });
  }
  _blit(mat, target, clear = true) { const R = this.renderer; this.quad.material = mat; R.setRenderTarget(target); R.autoClear = clear; if (clear) R.clear(); R.render(this.quadS, this.quadC); R.autoClear = true; }

  // ---- assets ----
  load(promise) { this.ready.push(promise); return promise; }
  model(path) { return this.load(new Promise((res, rej) => this.gltf.load(path, g => res(g.scene), undefined, rej))); }
  texture(path, srgb = true, repeat = null) { const t = this.tex.load(path); t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (repeat) t.repeat.set(repeat[0], repeat[1]); return t; }
  font(path) { return this.fontCache[path] ||= this.load(fetch(path).then(r => r.arrayBuffer()).then(b => opentype.parse(b))); }
  swapEnv(tex, intensity) { this.scene.environment = tex; if (intensity !== undefined) this.scene.environmentIntensity = intensity; }
  hdri(path, intensity = 1) { return this.load(new Promise((res, rej) => new HDRLoader().setDataType(THREE.HalfFloatType).load(path, tx => { tx.mapping = THREE.EquirectangularReflectionMapping; const pm = new THREE.PMREMGenerator(this.renderer); const rt = pm.fromEquirectangular(tx); this.scene.environment = rt.texture; this.scene.environmentIntensity = intensity; res({ env: rt.texture, raw: tx }); }, undefined, rej))); }
  // studio made of light strips: the chrome-reflection trick. Items: {p:[x,y,z], s:[w,h], c:color, i:intensity}
  studio(items, { ambient = 0x000000, intensity = 1, sigma = .02 } = {}) {
    const s = new THREE.Scene(); s.background = new THREE.Color(ambient);
    items.forEach(it => { const m = new THREE.Mesh(new THREE.PlaneGeometry(it.s[0], it.s[1]), new THREE.MeshBasicMaterial({ color: new THREE.Color(it.c).multiplyScalar(it.i ?? 1), side: THREE.DoubleSide })); m.position.set(...it.p); m.lookAt(0, 0, 0); s.add(m); });
    const pm = new THREE.PMREMGenerator(this.renderer); const rt = pm.fromScene(s, sigma, .1, 100); if (!this.scene.environment) { this.scene.environment = rt.texture; this.scene.environmentIntensity = intensity; } pm.dispose(); return rt.texture;
  }

  // ---- vector type as real geometry. depth 0 = flat crisp label ----
  // returns Group with per-glyph child meshes; children pivot on their own centre.
  text(font, str, { size = 1, depth = .2, bevel = .02, seg = 2, curve = 8, tracking = 0, align = 'center', material, perGlyph = true } = {}) {
    const group = new THREE.Group(); let x = 0; const glyphs = Array.from(str).map(ch => font.charToGlyph(ch)); const scale = size / font.unitsPerEm;
    glyphs.forEach((g, gi) => {
      const adv = (g.advanceWidth || 0) * scale; const path = g.getPath(0, 0, size);
      const sp = new THREE.ShapePath(); let any = false;
      path.commands.forEach(c => { any = true; if (c.type === 'M') sp.moveTo(c.x, -c.y); else if (c.type === 'L') sp.lineTo(c.x, -c.y); else if (c.type === 'Q') sp.quadraticCurveTo(c.x1, -c.y1, c.x, -c.y); else if (c.type === 'C') sp.bezierCurveTo(c.x1, -c.y1, c.x2, -c.y2, c.x, -c.y); });
      if (any) {
        // TrueType outers are clockwise once y is flipped back up; detect from the largest contour
        let big = 0, sgn = -1; sp.subPaths.forEach(sub => { const a = THREE.ShapeUtils.area(sub.getPoints()); if (Math.abs(a) > big) { big = Math.abs(a); sgn = a; } }); const shapes = sp.toShapes(sgn > 0);
        const geo = depth > 0 ? new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * .8, bevelSegments: seg, curveSegments: curve, steps: 1 }) : new THREE.ShapeGeometry(shapes, curve);
        geo.computeBoundingBox(); const bb = geo.boundingBox, cx = (bb.min.x + bb.max.x) / 2, cy = (bb.min.y + bb.max.y) / 2, cz = (bb.min.z + bb.max.z) / 2; geo.translate(-cx, -cy, -cz);
        const m = new THREE.Mesh(geo, material); m.position.set(x + cx, cy, 0); m.userData.home = m.position.clone(); m.userData.i = gi; m.frustumCulled = false; group.add(m);
      }
      x += adv + tracking * size;
    });
    const W = x - tracking * size; const off = align === 'center' ? -W / 2 : align === 'right' ? -W : 0;
    const capTop = (font.tables.os2 && font.tables.os2.sCapHeight ? font.tables.os2.sCapHeight : font.ascender * .72) * scale;
    group.children.forEach(m => { m.position.x += off; m.position.y -= capTop / 2; m.userData.home.copy(m.position); }); group.userData.width = W; group.userData.cap = capTop; return group;
  }
  // soft-edged volumetric cone: additive, depth-fade, with drifting dust
  beam({ r0 = .1, r1 = 2, len = 12, color = 0xffffff, intensity = 1 } = {}) {
    const g = new THREE.CylinderGeometry(r0, r1, len, 48, 24, true); g.translate(0, -len / 2, 0);
    const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, uniforms: { c: { value: new THREE.Color(color) }, i: { value: intensity }, len: { value: len }, time: { value: 0 } },
      vertexShader: `varying vec3 vN,vV; varying float vY; varying vec3 vP; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); vY=position.y; vP=position; gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 vN,vV,vP; varying float vY; uniform vec3 c; uniform float i,len,time;
       float n(vec3 p){ return fract(sin(dot(floor(p),vec3(12.9,78.2,37.7)))*43758.5); }
       float vn(vec3 p){ vec3 f=fract(p),u=f*f*(3.-2.*f),i0=floor(p); float r=0.; for(int x=0;x<2;x++)for(int y=0;y<2;y++)for(int z=0;z<2;z++){ vec3 o=vec3(x,y,z); vec3 w=mix(1.-u,u,o); r+=w.x*w.y*w.z*fract(sin(dot(i0+o,vec3(12.9,78.2,37.7)))*43758.5);} return r; }
       void main(){ float f=abs(dot(normalize(vN),normalize(vV))); f=pow(f,2.6); float a=smoothstep(0.,-.12*len,vY)*pow(1.+vY/len,1.8); float d=.72+.5*vn(vP*vec3(1.1,.45,1.1)+vec3(0.,-time*.5,time*.2)); gl_FragColor=vec4(c*i*f*a*d,1.); }` });
    return new THREE.Mesh(g, m);
  }
  // GPU star/dust field. fn(i,r) -> [x,y,z,size,r,g,b]. Size in world units.
  points(count, fn, { additive = true, soft = 1.2, uniforms = {}, vertexPatch = '' } = {}) {
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), siz = new Float32Array(count), rnd = new Float32Array(count); const r = rng(this.o.seed + 91);
    for (let i = 0; i < count; i++) { const v = fn(i, r); pos.set(v.slice(0, 3), i * 3); siz[i] = v[3]; col.set(v.slice(4, 7), i * 3); rnd[i] = r(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('size', new THREE.BufferAttribute(siz, 1)); g.setAttribute('rnd', new THREE.BufferAttribute(rnd, 1));
    const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, uniforms: Object.assign({ time: { value: 0 }, scaleY: { value: this.o.h }, tanF: { value: .34 } }, uniforms),
      vertexShader: `attribute float size,rnd; attribute vec3 color; varying vec3 vC; uniform float time,scaleY,tanF; ${Object.keys(uniforms).map(k => `uniform float ${k};`).join(' ')}
        void main(){ vec3 p=position; ${vertexPatch} vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; float s=size*scaleY/(2.*tanF*max(.05,-mv.z)); gl_PointSize=clamp(s,1.2,64.); float fade=clamp(s/1.2,.15,1.); vC=color*fade; }`,
      fragmentShader: `varying vec3 vC; void main(){ vec2 d=gl_PointCoord-.5; float a=smoothstep(.5,.0,length(d)); gl_FragColor=vec4(vC*pow(a,${soft.toFixed(2)}),1.); }` });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; return pts;
  }

  // ballistic spark burst: call .fire(origin, tau, seed) from update, tau = seconds since the hit
  sparks(count, { color = [3, 1.2, .3], speed = 18, gravity = 26, size = .05, life = .9, spread = 1 } = {}) {
    const uniforms = { tau: { value: 9 }, seedU: { value: 0 }, speedU: { value: speed }, grav: { value: gravity }, life: { value: life }, spread: { value: spread }, ox: { value: 0 }, oy: { value: 0 }, oz: { value: 0 } };
    const p = this.points(count, (i, r) => [r() * 2 - 1, r(), r() * 2 - 1, size * (.4 + r() * 1.3), color[0], color[1], color[2]], { soft: 1, uniforms,
      vertexPatch: `float rr=fract(rnd*91.7+seedU*.37); vec3 dir=normalize(vec3(position.x*spread,position.y+.15,position.z*spread)+1e-3); float spd=speedU*(.25+rr*1.1); p=vec3(ox,oy,oz)+dir*spd*tau+vec3(0.,-.5*grav*tau*tau,0.); if(tau>life*(.35+rr*.65)) p=vec3(1e6);` });
    p.fire = (o, tau, seed) => { uniforms.ox.value = o.x; uniforms.oy.value = o.y; uniforms.oz.value = o.z; uniforms.tau.value = tau; uniforms.seedU.value = seed; p.visible = tau < life; };
    return p;
  }
  // ---- render ----
  setRig(keys) { this.rig = makeRig(keys); }
  addCameraFn(fn) { this.camFx = fn; }
  // beat impact on the lens: dolly kick, fov punch, shake that dies fast, slow handheld drift
  impact(A, { fov = 2, dolly = .1, shake = .03, roll = .006, drift = .02, decay = 8, seed = 3, extra = null } = {}) {
    const fw = new THREE.Vector3(), side = new THREE.Vector3(), upv = new THREE.Vector3();
    this.camFx = (t, c) => {
      const k = A.kick(t, decay), s = shake * k, n = 14;
      fw.copy(c.l).sub(c.p).normalize(); side.crossVectors(fw, upv.set(0, 1, 0)).normalize(); upv.crossVectors(side, fw);
      c.p.addScaledVector(fw, dolly * k);
      const ox = noise1(t * n, seed) * s + noise1(t * .7, seed + 2) * drift, oy = noise1(t * n, seed + 5) * s + noise1(t * .53, seed + 7) * drift;
      c.p.addScaledVector(side, ox).addScaledVector(upv, oy); c.l.addScaledVector(side, ox * .6).addScaledVector(upv, oy * .6);
      c.fov -= fov * k; c.roll += noise1(t * n, seed + 9) * roll * k;
      if (extra) extra(t, c);
    };
  }
  renderAt(t) {
    const { samples: N, shutter, fps, clampHDR } = this.o; const R = this.renderer, cam = this.camera, dt = shutter / fps;
    R.setRenderTarget(this.rtAcc); R.setClearColor(0x000000, 0); R.clear();
    this.mAcc.uniforms.w.value = 1 / N; this.mAcc.uniforms.cl.value = clampHDR;
    const right = new THREE.Vector3(), up = new THREE.Vector3(), fwd = new THREE.Vector3();
    for (let i = 0; i < N; i++) {
      const ts = t - dt / 2 + dt * (i + .5) / N;
      // stratified lens + subpixel (R2 sequence), decorrelated from time by a fixed scramble
      const j = (i * 7) % N, a1 = .7548776662, a2 = .5698402910, u = (.5 + a1 * j) % 1, v = (.5 + a2 * j) % 1;
      const rd = Math.sqrt(u), th = 2 * Math.PI * v, lx0 = rd * Math.cos(th), ly0 = rd * Math.sin(th);
      const sx = ((.5 + a2 * (i + 11)) % 1) - .5, sy = ((.5 + a1 * (i + 11)) % 1) - .5;
      const c = this.rig ? this.rig(ts) : { p: new THREE.Vector3(0, 0, 10), l: new THREE.Vector3(), fov: 38, roll: 0, f: 0, ap: 0 };
      if (this.camFx) this.camFx(ts, c);
      cam.fov = c.fov; cam.position.copy(c.p); cam.up.set(0, 1, 0); cam.lookAt(c.l); if (c.roll) cam.rotateZ(c.roll); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
      const F = c.f > 0 ? c.f : c.p.distanceTo(c.l), ap = c.ap || 0;
      cam.matrixWorld.extractBasis(right, up, fwd);
      const lx = lx0 * ap, ly = ly0 * ap; cam.position.addScaledVector(right, lx).addScaledVector(up, ly); cam.updateMatrixWorld();
      const P = cam.projectionMatrix.elements; P[8] += -P[0] * lx / F + 2 * sx / this.o.w; P[9] += -P[5] * ly / F + 2 * sy / this.o.h; cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
      this.jitterLights.forEach((L, li) => { const b = L.userData.base || (L.userData.base = L.position.clone()); const r = L.userData.area ?? .5; L.position.set(b.x + (lx0) * r, b.y + (ly0) * r, b.z + ((u - .5)) * r); });
      this.updateFn(ts, i);
      R.setRenderTarget(this.rtScene); R.setClearColor(this.scene.background || 0x000000, 1); R.clear(); R.render(this.scene, cam);
      this.mAcc.uniforms.t.value = this.rtScene.texture; this._blit(this.mAcc, this.rtAcc, false);
    }
    const P = Object.assign({ flash: 0, ca: 0, zoom: 0, shock: 0, shockR: 0, exposure: 0, flashC: null, c: null }, this.postFn(t));
    // pre: speed zoom, chromatic aberration, shockwave
    const pre = this.mPre.uniforms; pre.t.value = this.rtAcc.texture; pre.zoom.value = P.zoom; pre.ca.value = this.o.ca * 2 + P.ca; pre.shock.value = P.shock; pre.shockR.value = P.shockR; if (P.c) pre.c.value.set(P.c[0], P.c[1]); else pre.c.value.set(.5, .5);
    this._blit(this.mPre, this.rtComp);
    // bloom mip chain (tight: most weight in the top levels)
    this.mBright.uniforms.t.value = this.rtComp.texture; this.mBright.uniforms.k.value = this.o.bloomK; this._blit(this.mBright, this.mips[0]);
    for (let i = 1; i < this.mips.length; i++) { this.mDown.uniforms.t.value = this.mips[i - 1].texture; this.mDown.uniforms.px.value.set(1 / this.mips[i - 1].width, 1 / this.mips[i - 1].height); this._blit(this.mDown, this.mips[i]); }
    const W = [1, .85, .7, .55, .35, .2];
    for (let i = this.mips.length - 1; i > 0; i--) { this.mUp.uniforms.t.value = this.mips[i].texture; this.mUp.uniforms.px.value.set(.5 / this.mips[i].width, .5 / this.mips[i].height); this.mUp.uniforms.g.value = W[i]; this._blit(this.mUp, this.mips[i - 1], false); }
    if (this.o.streak > 0) { this.mStreak.uniforms.t.value = this.mips[1].texture; this.mStreak.uniforms.px.value = 3 / this.rtStreak[0].width; this._blit(this.mStreak, this.rtStreak[0]); this.mStreak.uniforms.t.value = this.rtStreak[0].texture; this.mStreak.uniforms.px.value = 9 / this.rtStreak[0].width; this._blit(this.mStreak, this.rtStreak[1]); }
    const f = this.mFinal.uniforms, o = this.o; f.t.value = this.rtComp.texture; f.b.value = this.mips[0].texture; f.st.value = this.rtStreak[1].texture; f.bloom.value = o.bloom; f.streak.value = o.streak; f.exposure.value = o.exposure * (1 + P.exposure); f.flash.value = P.flash; if (P.flashC) f.flashC.value.set(P.flashC); else f.flashC.value.set(0xffffff); f.vig.value = o.vignette; f.grain.value = o.grain; f.sat.value = o.sat; f.con.value = o.contrast; f.lift.value = o.lift; f.seed.value = (Math.round(t * fps) % 97) + 1; f.sTint.value.set(...o.shadowTint); f.hTint.value.set(...o.highTint);
    this._blit(this.mFinal, null);
    const gl = R.getContext(); gl.finish();
  }
  start() {
    window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
    const go = Promise.all(this.ready).then(async () => { if (this.build) await this.build(); this.renderer.compile(this.scene, this.camera); this.renderAt(0); this.isReady = true; });
    window.__hf.buildReady.film = go;
    window.addEventListener('hf-seek', e => { if (this.isReady) this.renderAt(e.detail.time); else if (e.detail.waitUntil) e.detail.waitUntil(go.then(() => this.renderAt(e.detail.time))); });
    window.__film = this; return go;
  }
}
export const fitDist = (W, fov, frac = .84, aspect = 9 / 16) => (W / frac) / (2 * Math.tan(fov * Math.PI / 360) * aspect);
// brushed face for extruded type: flat chrome faces mirror one env direction (often black); a rougher face always catches light
export const faceMetal = (o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: 0xffffff, metalness: 1, roughness: .3, envMapIntensity: 1.25 }, o));
// living metal: a high-res sphere displaced in the vertex stage with analytic normals; keeps full PBR + reflections + shadows
const SN = `vec4 pm(vec4 x){return mod(((x*34.)+1.)*x,289.);} vec4 ti(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){ const vec2 C=vec2(1./6.,1./3.); const vec4 D=vec4(0.,.5,1.,2.); vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx); vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy); vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+2.*C.xxx; vec3 x3=x0-1.+3.*C.xxx; i=mod(i,289.); vec4 p=pm(pm(pm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.)); float n_=1./7.; vec3 ns=n_*D.wyz-D.xzx; vec4 j=p-49.*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_); vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.-abs(x)-abs(y); vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw); vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.; vec4 sh=-step(h,vec4(0.)); vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww; vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w); vec4 norm=ti(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3))); p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w; vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.); m=m*m; return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3))); }`;
const FERRO = `uniform float uT,uAmp,uFreq,uSpike,uSpikeF,uStretchY; ${SN}
float ffield(vec3 n){ vec3 q=n*uFreq+vec3(0.,uT*.6,uT*.3); float w=snoise(q+snoise(q*.7+uT*.2)*.8); float r=uAmp*w; float s=snoise(n*uSpikeF+vec3(uT*.13)); r+=uSpike*pow(max(s,0.),2.2); return r; }
vec3 dispP(vec3 p){ vec3 n=normalize(p); return n*(1.+ffield(n)); }`;
export function ferro(o = {}) {
  const u = { uT: { value: 0 }, uAmp: { value: o.amp ?? .12 }, uFreq: { value: o.freq ?? 1.6 }, uSpike: { value: o.spike ?? 0 }, uSpikeF: { value: o.spikeF ?? 9 } };
  const patch = s => { Object.assign(s.uniforms, u); s.vertexShader = FERRO + "\n" + s.vertexShader.replace('#include <beginnormal_vertex>', `vec3 _n=normalize(position); vec3 _t=normalize(cross(_n,abs(_n.y)<.9?vec3(0.,1.,0.):vec3(1.,0.,0.))); vec3 _b=cross(_n,_t); float _e=.012; vec3 _p0=dispP(_n); vec3 objectNormal=normalize(cross(dispP(_n+_b*_e)-_p0,dispP(_n+_t*_e)-_p0)); if(dot(objectNormal,_n)<0.) objectNormal=-objectNormal;`).replace('#include <begin_vertex>', 'vec3 transformed=dispP(position);'); };
  const mat = new THREE.MeshPhysicalMaterial(Object.assign({ color: 0x050507, metalness: 1, roughness: .1, envMapIntensity: 1.3 }, o.mat || {})); mat.onBeforeCompile = patch;
  const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }); depth.onBeforeCompile = s => { Object.assign(s.uniforms, u); s.vertexShader = FERRO + "\n" + s.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed=dispP(position);'); };
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, o.seg ?? 420, Math.round((o.seg ?? 420) * .75)), mat); mesh.customDepthMaterial = depth; mesh.castShadow = true; mesh.frustumCulled = false; mesh.u = u; return mesh;
}
// glowing rim for cells/bubbles: fresnel additive with noisy interior, instancing-aware
export function rimMaterial(color, { power = 2.4, gain = 3, inner = .06 } = {}) {
  return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { c: { value: new THREE.Color(color) }, g: { value: gain }, p: { value: power }, inner: { value: inner } },
    vertexShader: `varying vec3 vN,vV; void main(){ vec4 l=vec4(position,1.); vec3 n=normal; #ifdef USE_INSTANCING
 l=instanceMatrix*l; n=mat3(instanceMatrix)*n; #endif
 vec4 mv=modelViewMatrix*l; vN=normalize(normalMatrix*n); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`.replace(/#ifdef USE_INSTANCING\n/, '\n#ifdef USE_INSTANCING\n').replace(/#endif\n/, '\n#endif\n'),
    fragmentShader: `varying vec3 vN,vV; uniform vec3 c; uniform float g,p,inner; void main(){ float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),p); gl_FragColor=vec4(c*(f*g+inner),1.); }` });
}
// material helpers
export const chrome = (o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: 0xffffff, metalness: 1, roughness: .12, envMapIntensity: 1.2 }, o));
export const gloss = (color, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color, metalness: 0, roughness: .35, clearcoat: 1, clearcoatRoughness: .08 }, o));
export const glow = (color, i = 3) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(i), toneMapped: false, fog: true });
export function fit(obj, size, { center = true } = {}) { const b = new THREE.Box3().setFromObject(obj), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3()), k = size / Math.max(s.x, s.y, s.z); obj.scale.multiplyScalar(k); if (center) obj.position.sub(c.multiplyScalar(k)); const g = new THREE.Group(); g.add(obj); return g; }
export function repaint(obj, fn) { obj.traverse(m => { if (m.isMesh) { const r = fn(m.material, m); if (r) m.material = r; m.frustumCulled = false; } }); return obj; }

      // CAMERA RIG v3 (MotionKit primitive 15) — keyframed camera on a 3D world, a pure function of timeline time.
      // world: element with transform-style: preserve-3d inside a perspective lens.
      // KF: [{ t, x, y, z (dolly toward scene), rx, ry, rz (deg), f (focus depth), e }]
      //   e = GSAP ease name for the segment INTO this key (bell-shaped "power2.inOut"/"sine.inOut" for moves),
      //   or e = "glide": consecutive glide keys form ONE continuous monotone spline (no stops at inner keys) —
      //   use it to track a sentence word by word without stop-start hops; the run starts and ends at zero velocity.
      // dof: [{ el, z, max }] — leaf layers blurred by distance from the focus depth.
      // opt: { t0 (scene start on the film clock), drift (0–1), seed (int: per-film drift character), dofK, onRender(c, t) }
      function cameraRig(tl, world, D, KF, dof, opt) {
        opt = opt || {};
        const drift = opt.drift == null ? 1 : opt.drift;
        const keys = ["x", "y", "z", "rx", "ry", "rz", "f"];
        let prev = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, f: 0 };
        const K = KF.slice().sort((a, b) => a.t - b.t).map((k) => (prev = Object.assign({}, prev, { e: "power2.inOut" }, k)));
        const E = {}, ez = (n) => E[n] || (E[n] = gsap.parseEase(n));
        // monotone cubic tangents (Fritsch–Butland) for glide runs; zero at run ends => smooth start/stop
        const M = {};
        keys.forEach((k) => {
          const m = K.map(() => 0);
          for (let i = 1; i < K.length - 1; i++) {
            if (K[i].e !== "glide" || K[i + 1].e !== "glide") continue;
            const h0 = K[i].t - K[i - 1].t, h1 = K[i + 1].t - K[i].t;
            const d0 = (K[i][k] - K[i - 1][k]) / h0, d1 = (K[i + 1][k] - K[i][k]) / h1;
            if (d0 * d1 > 0) m[i] = (3 * (h0 + h1)) / ((2 * h1 + h0) / d0 + (h1 + 2 * h0) / d1);
          }
          M[k] = m;
        });
        // seeded drift: each film gets its own frequencies, phases and amplitudes (no repeated, predictable sway)
        let s = (opt.seed || 1) >>> 0;
        const rnd = () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
        const osc = () => ({ f: 0.035 + rnd() * 0.12, p: rnd() * 6.283, a: 0.6 + rnd() * 0.8 });
        const DR = { x: [osc(), osc()], y: [osc(), osc()], rz: [osc()], rx: [osc()] };
        const T0 = opt.t0 || 0;
        const sway = (ch, t, amp) => DR[ch].reduce((v, o, j) => v + amp[j] * o.a * Math.sin(6.283 * o.f * (t + T0) + o.p), 0);
        function render(t) {
          let i = 0;
          while (i < K.length - 1 && K[i + 1].t <= t) i++;
          const j = Math.min(i + 1, K.length - 1), a = K[i], b = K[j];
          const h = b.t - a.t, u = h > 0 ? Math.min(1, Math.max(0, (t - a.t) / h)) : 1;
          const c = {};
          keys.forEach((k) => {
            if (b.e === "glide" && h > 0) {
              const u2 = u * u, u3 = u2 * u;
              c[k] = (2 * u3 - 3 * u2 + 1) * a[k] + (u3 - 2 * u2 + u) * h * M[k][i] + (-2 * u3 + 3 * u2) * b[k] + (u3 - u2) * h * M[k][j];
            } else c[k] = a[k] + (b[k] - a[k]) * (h > 0 ? ez(b.e)(u) : 1);
          });
          c.x += drift * sway("x", t, [6, 2.5]);
          c.y += drift * sway("y", t, [4.5, 2]);
          c.rz += drift * sway("rz", t, [0.2]);
          c.rx += drift * sway("rx", t, [0.22]);
          world.style.transform = "translate3d(" + (-c.x).toFixed(2) + "px," + (-c.y).toFixed(2) + "px," + c.z.toFixed(2) + "px) rotateX(" +
            c.rx.toFixed(3) + "deg) rotateY(" + c.ry.toFixed(3) + "deg) rotateZ(" + c.rz.toFixed(3) + "deg)";
          (dof || []).forEach((d) => {
            const bl = Math.min(d.max || 8, Math.abs(d.z - c.f) * (opt.dofK || 0.022));
            d.el.style.filter = bl < 0.3 ? "none" : "blur(" + bl.toFixed(2) + "px)";
          });
          if (opt.onRender) opt.onRender(c, t);
        }
        const drv = { t: 0 };
        tl.fromTo(drv, { t: 0 }, { t: D, duration: D, ease: "none", onUpdate: () => render(drv.t) }, 0);
        render(0);
      }
      // seeded helper for motivated moves: varied direction/size so no two films (or beats) move the same way
      function camSeed(seed) {
        let s = seed >>> 0;
        const r = () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
        return { r, range: (a, b) => a + (b - a) * r(), sign: () => (r() < 0.5 ? -1 : 1), pick: (arr) => arr[Math.floor(r() * arr.length)] };
      }

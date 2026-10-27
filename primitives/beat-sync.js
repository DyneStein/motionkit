      // BEAT SYNC (MotionKit primitive 22) — make a scene's events land on the music without hand-retiming every tween.
      // Usage: const TL = gsap.timeline({ paused: true }); const tl = beatSync(TL, HITS, { t0: sceneStart });
      //        …author tweens on tl as usual (to / fromTo / set with a numeric position)…
      //        tl.commit(), then register TL (not tl) as the scene timeline.
      // HITS: strong audio hit times on the FILM clock (research/audio_hits.py). Quick tweens (≤ maxDur) are grouped into
      // clusters (starts within `gap` of each other); each cluster shifts as a block so its first start lands on the nearest
      // hit within ±tol. Staggers, order and long tweens (camera drivers, slow drifts) are untouched.
      function beatSync(TL, hits, opt) {
        opt = opt || {};
        const tol = opt.tol == null ? 0.2 : opt.tol, maxDur = opt.maxDur == null ? 1.0 : opt.maxDur, gap = opt.gap == null ? 0.18 : opt.gap;
        const H = hits.map((h) => h - (opt.t0 || 0));
        const calls = [];
        const rec = {
          to: (...a) => (calls.push(["to", a]), rec),
          fromTo: (...a) => (calls.push(["fromTo", a]), rec),
          set: (...a) => (calls.push(["set", a]), rec),
          commit() {
            const info = calls.map(([m, a]) => {
              const pi = m === "fromTo" ? 3 : 2, vars = m === "fromTo" ? a[2] : a[1];
              return { m, a, pi, pos: a[pi], dur: m === "set" ? 0 : vars && vars.duration != null ? vars.duration : 0.5, shift: 0 };
            });
            const ev = info.filter((c) => typeof c.pos === "number" && c.dur <= maxDur && c.pos > 0.05).sort((x, y) => x.pos - y.pos);
            const cl = [];
            ev.forEach((c) => {
              const last = cl[cl.length - 1];
              if (last && c.pos - last.end <= gap) { last.items.push(c); last.end = Math.max(last.end, c.pos); }
              else cl.push({ start: c.pos, end: c.pos, items: [c] });
            });
            let prevNew = -1e9;
            cl.forEach((k) => {
              let d = null;
              H.forEach((h) => { const x = h - k.start; if (Math.abs(x) <= tol && (d === null || Math.abs(x) < Math.abs(d))) d = x; });
              d = d || 0;
              if (k.start + d < prevNew + 0.05) d = 0; // never reorder clusters
              k.items.forEach((c) => (c.shift = d));
              prevNew = k.start + d;
            });
            info.forEach((c) => { const a = c.a.slice(); if (c.shift) a[c.pi] = c.pos + c.shift; TL[c.m](...a); });
            rec.report = cl.map((k) => ({ at: +k.start.toFixed(2), shift: +(k.items[0].shift || 0).toFixed(3) }));
            return TL;
          },
        };
        return rec;
      }

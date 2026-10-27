/* MotionKit element builders. Static geometry is generated once at build time (deterministic, seeded);
   animate the resulting elements with GSAP on the scene timeline. */
(function () {
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function el(tag, cls, css) { const e = document.createElement(tag); if (cls) e.className = cls; if (css) e.style.cssText = css; return e; }

  // 3-face extruded box (front, right side, top) inside a preserve-3d rig
  function box(w, h, d, x, y, col) {
    const b = el("div", "mk-box", `position:absolute;transform-style:preserve-3d;transform:translate3d(${x}px,${y}px,0)`);
    b.appendChild(el("div", "face", `width:${w}px;height:${h}px;transform:translate(${-w / 2}px,${-h / 2}px) translateZ(${d / 2}px);background:${col.front}`));
    b.appendChild(el("div", "face", `width:${d}px;height:${h}px;transform:translate(${-d / 2}px,${-h / 2}px) rotateY(90deg) translateZ(${w / 2}px);background:${col.side}`));
    b.appendChild(el("div", "face", `width:${w}px;height:${d}px;transform:translate(${-w / 2}px,${-d / 2}px) rotateX(90deg) translateZ(${h / 2}px);background:${col.top}`));
    return b;
  }
  const CANDLE = {
    red: { front: "linear-gradient(90deg,#f25a71,#e03e57)", side: "linear-gradient(90deg,#b52b42,#9c2337)", top: "#ff9aa9",
      wf: "linear-gradient(90deg,#f4f4f6,#dcdce2)", ws: "#b8b8c2", wt: "#ffffff" },
    grey: { front: "linear-gradient(90deg,#f6f6f8,#e1e1e6)", side: "linear-gradient(90deg,#c4c4cc,#adadb7)", top: "#ffffff",
      wf: "linear-gradient(90deg,#f4f4f6,#dcdce2)", ws: "#b8b8c2", wt: "#ffffff" },
  };
  // data: [{ x, y, h, up, dn, kind }] — y is the body centre; up/dn are wick lengths
  window.mkCandles = function (container, data, opt) {
    opt = opt || {};
    const w = opt.w || 46, wk = opt.wick || 11;
    const rig = el("div", "rig");
    const out = [];
    data.forEach((c) => {
      const C = CANDLE[c.kind || "red"], g = el("div", "mk-candle", "position:absolute;transform-style:preserve-3d");
      g.appendChild(box(wk, c.up, wk, c.x, c.y - c.h / 2 - c.up / 2, { front: C.wf, side: C.ws, top: C.wt }));
      g.appendChild(box(wk, c.dn, wk, c.x, c.y + c.h / 2 + c.dn / 2, { front: C.wf, side: C.ws, top: C.wt }));
      g.appendChild(box(w, c.h, w, c.x, c.y, C));
      rig.appendChild(g); out.push(g);
    });
    container.appendChild(rig);
    return out;
  };

  // reeded glass: n flutes, each refracts (stretches + offsets) the same gradient scene
  window.mkReed = function (pill, word, opt) {
    opt = opt || {};
    const n = opt.flutes || 5, W = pill.clientWidth || parseFloat(getComputedStyle(pill).width), r = rng(opt.seed || 7);
    const scenes = [];
    for (let i = 0; i < n; i++) {
      const fl = el("div", "flute", `left:${(i * W) / n}px;width:${W / n + 0.5}px`);
      const k = 1.04 + 0.08 * r(), shift = (r() - 0.5) * 14; // gentle refraction: letters stay legible
      const sc = el("div", "scene", `left:${(-i * W) / n}px;width:${W}px;transform-origin:${((i + 0.5) * W) / n}px 50%;transform:translateX(${shift}px) scaleX(${k.toFixed(3)})`);
      sc.appendChild(el("div", "blob"));
      const wd = el("div", "word"); wd.textContent = word; sc.appendChild(wd);
      fl.appendChild(sc); pill.appendChild(fl); scenes.push(sc);
    }
    return scenes;
  };

  // fan network: strands from one origin, glossy beads riding them, faint + grid underneath
  window.mkFan = function (svg, opt) {
    opt = opt || {};
    const NS = "http://www.w3.org/2000/svg", r = rng(opt.seed || 11);
    const W = opt.w || 1400, H = opt.h || 900, ox = opt.ox || 0, oy = opt.oy || H / 2, ex = opt.ex || W * 0.62, n = opt.n || 18;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const defs = document.createElementNS(NS, "defs");
    defs.innerHTML = `
      <radialGradient id="bd-k" cx="0.34" cy="0.3" r="0.75"><stop offset="0" stop-color="#ffffff"/><stop offset="0.12" stop-color="#8a8aa0"/><stop offset="0.55" stop-color="#1a1a2e"/><stop offset="1" stop-color="#05050c"/></radialGradient>
      <radialGradient id="bd-w" cx="0.34" cy="0.3" r="0.75"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#d8d8e2"/><stop offset="1" stop-color="#8d8da0"/></radialGradient>
      <radialGradient id="bd-v" cx="0.34" cy="0.3" r="0.75"><stop offset="0" stop-color="#ffffff"/><stop offset="0.2" stop-color="#a9a9ff"/><stop offset="0.7" stop-color="#6a6aff"/><stop offset="1" stop-color="#3b3bd6"/></radialGradient>
      <pattern id="bd-grid" width="140" height="140" patternUnits="userSpaceOnUse"><path d="M66 70h8M70 66v8" stroke="#c9c9d2" stroke-width="1.6"/></pattern>`;
    svg.appendChild(defs);
    const grid = document.createElementNS(NS, "rect");
    grid.setAttribute("width", W); grid.setAttribute("height", H); grid.setAttribute("fill", "url(#bd-grid)"); svg.appendChild(grid);
    const strands = [], beads = [];
    for (let i = 0; i < n; i++) {
      const ty = H * 0.12 + ((H * 0.76) * i) / (n - 1) + (r() - 0.5) * 30;
      const c1x = ox + (ex - ox) * (0.18 + r() * 0.12), c2x = ox + (ex - ox) * (0.55 + r() * 0.2), c2y = oy + (ty - oy) * (0.2 + r() * 1.3);
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", `M${ox},${oy} C${c1x.toFixed(1)},${oy} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${ex},${ty.toFixed(1)}`);
      p.setAttribute("fill", "none"); p.setAttribute("stroke", "#7b7bff"); p.setAttribute("stroke-opacity", "0.72"); p.setAttribute("stroke-width", "1.6");
      p.setAttribute("pathLength", "100"); p.setAttribute("stroke-dasharray", "100 120"); p.setAttribute("stroke-dashoffset", "110");
      svg.appendChild(p); strands.push(p);
      const end = document.createElementNS(NS, "circle");
      end.setAttribute("cx", ex); end.setAttribute("cy", ty.toFixed(1)); end.setAttribute("r", 9); end.setAttribute("fill", "url(#bd-v)"); end.setAttribute("opacity", "0");
      svg.appendChild(end); beads.push({ el: end, path: p, u: 1, end: true });
      const k = 1 + Math.floor(r() * 3);
      for (let j = 0; j < k; j++) {
        const b = document.createElementNS(NS, "circle"), fill = ["url(#bd-k)", "url(#bd-w)", "url(#bd-v)"][Math.floor(r() * 3)];
        b.setAttribute("r", (3 + r() * 7).toFixed(1)); b.setAttribute("fill", fill); b.setAttribute("opacity", "0");
        svg.appendChild(b); beads.push({ el: b, path: p, u: 0.2 + r() * 0.7 });
      }
    }
    return { strands, beads };
  };
})();

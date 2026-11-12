/**
 * PROGRAMA · 11 pasos con gráfica de partículas (como la referencia aprobada).
 * La lista sale de VD_CONTENT.modules. Al bajar, el paso más cercano al centro de la
 * pantalla se activa y las partículas cambian de forma según la fase:
 *   esfera (fundamentos) → ondas (marca y mensaje) → embudo (pauta y atención) → barras (escala).
 * Solo decoración: el canvas es aria-hidden y la lista funciona sin él.
 */
(function () {
  "use strict";

  const PHASES = [
    { to: 3, label: "Fundamentos", shape: "sphere" },
    { to: 6, label: "Marca y mensaje", shape: "waves" },
    { to: 10, label: "Pauta y atención", shape: "funnel" },
    { to: 11, label: "Escala y automatiza", shape: "bars" },
  ];
  const GOLD = "233, 215, 180";
  const EASE = 0.06;          // velocidad del cambio de forma por cuadro
  const SPIN = 0.0022;        // giro por cuadro (radianes)
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Formas: N puntos en un cubo de -1 a 1 ---------- */
  const SHAPES = {
    sphere(n) {
      const golden = Math.PI * (3 - Math.sqrt(5));
      return Array.from({ length: n }, (_, i) => {
        const y = 1 - (i / (n - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const t = golden * i;
        return [Math.cos(t) * r * 0.9, y * 0.9, Math.sin(t) * r * 0.9];
      });
    },
    waves(n) {
      const strands = 7;
      return Array.from({ length: n }, (_, i) => {
        const s = i % strands;
        const t = Math.floor(i / strands) / Math.ceil(n / strands);
        const y = 0.95 - t * 1.9;
        const phase = s * 0.9;
        const x = Math.sin(t * 7 + phase) * 0.45 + (s - (strands - 1) / 2) * 0.07;
        const z = Math.cos(t * 7 + phase) * 0.45;
        return [x, y, z];
      });
    },
    funnel(n) {
      return Array.from({ length: n }, (_, i) => {
        const t = i / n;
        const y = 0.85 - t * 1.7;
        const r = 0.08 + (1 - t) * 0.82;
        const a = i * 2.39996;
        return [Math.cos(a) * r, y, Math.sin(a) * r];
      });
    },
    bars(n) {
      const heights = [0.35, 0.55, 0.8, 1.15, 1.6];
      const per = Math.floor(n / heights.length);
      return Array.from({ length: n }, (_, i) => {
        const b = Math.min(heights.length - 1, Math.floor(i / per));
        const k = i - b * per;
        const cols = 6;
        const col = k % cols, row = Math.floor(k / cols), rows = Math.ceil(per / cols);
        const x = -0.9 + b * 0.42 + (col % 3) * 0.1;
        const z = (Math.floor(col / 3) - 0.5) * 0.2;
        const y = 0.85 - (row / rows) * heights[b];
        return [x, -y, z];
      });
    },
  };

  function phaseOf(step) { return PHASES.findIndex((p) => step <= p.to); }

  /* ---------- Lista ---------- */
  function renderList(list, modules) {
    modules.forEach((m, i) => {
      const li = document.createElement("li");
      li.className = "pg-item";
      li.dataset.step = String(i + 1);
      const n = document.createElement("span");
      n.className = "pg-n";
      n.textContent = m.n;
      const body = document.createElement("div");
      const h = document.createElement("h3");
      h.textContent = m.title;
      body.appendChild(h);
      if (m.text) {
        const p = document.createElement("p");
        p.textContent = m.text;
        body.appendChild(p);
      }
      li.append(n, body);
      list.appendChild(li);
    });
    return Array.from(list.children);
  }

  /* ---------- Partículas ---------- */
  function createField(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const count = window.innerWidth < 700 ? 520 : 900;
    const targets = Object.fromEntries(Object.entries(SHAPES).map(([k, fn]) => [k, fn(count)]));
    const pts = targets.sphere.map((p) => p.slice());
    let shape = "sphere", angle = 0, w = 0, h = 0, dpr = 1, raf = 0, running = false;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame() {
      const tgt = targets[shape];
      const scale = Math.min(w, h) * 0.42;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i += 1) {
        const p = pts[i], t = tgt[i];
        if (reduce) { p[0] = t[0]; p[1] = t[1]; p[2] = t[2]; }
        else { p[0] += (t[0] - p[0]) * EASE; p[1] += (t[1] - p[1]) * EASE; p[2] += (t[2] - p[2]) * EASE; }
        const x = p[0] * cos - p[2] * sin;
        const z = p[0] * sin + p[2] * cos;
        const persp = 2.6 / (2.6 + z);
        const alpha = 0.25 + (1 - (z + 1) / 2) * 0.75;
        ctx.fillStyle = "rgba(" + GOLD + "," + alpha.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(w / 2 + x * scale * persp, h / 2 + p[1] * scale * persp, 1.3 * persp, 0, 6.283);
        ctx.fill();
      }
      if (!reduce) angle += SPIN;
      if (running && !reduce) raf = requestAnimationFrame(frame);
    }

    return {
      resize() { resize(); frame(); },
      setShape(next) { if (next === shape) return; shape = next; if (reduce) frame(); },
      start() { if (running) return; running = true; raf = requestAnimationFrame(frame); },
      stop() { running = false; cancelAnimationFrame(raf); },
    };
  }

  /* ---------- Paso activo según el scroll ---------- */
  function init() {
    const root = document.querySelector("[data-steps]");
    const content = window.VD_CONTENT;
    if (!root || !content || !Array.isArray(content.modules)) return;
    const items = renderList(root.querySelector("[data-pg-list]"), content.modules);
    const total = items.length;
    const phaseEl = root.querySelector("[data-pg-phase]");
    const countEl = root.querySelector("[data-pg-count]");
    const canvas = root.querySelector("[data-pg-canvas]");
    let field = null;
    try { field = canvas ? createField(canvas) : null; } catch (err) { console.error("[VD] steps canvas", err); }

    let active = 0;
    function setActive(step) {
      if (step === active) return;
      active = step;
      items.forEach((li) => li.classList.toggle("is-active", Number(li.dataset.step) === step));
      const ph = PHASES[phaseOf(step)] || PHASES[0];
      if (phaseEl) phaseEl.textContent = ph.label;
      if (countEl) countEl.textContent = String(step).padStart(2, "0") + " / " + String(total).padStart(2, "0");
      if (field) field.setShape(ph.shape);
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const mid = window.innerHeight * (window.innerWidth < 900 ? 0.62 : 0.5);
        let best = 1, bestD = Infinity;
        items.forEach((li) => {
          const r = li.getBoundingClientRect();
          const d = Math.abs(r.top + r.height / 2 - mid);
          if (d < bestD) { bestD = d; best = Number(li.dataset.step); }
        });
        setActive(best);
      });
    }

    setActive(1);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => { if (field) field.resize(); onScroll(); });
    if (!field) return;
    field.resize();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => (e.isIntersecting ? field.start() : field.stop()), { threshold: 0 }).observe(root);
    } else field.start();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { field.stop(); return; }
      const r = root.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) field.start();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

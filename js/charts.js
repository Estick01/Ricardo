/**
 * GRÁFICAS DE FONDO · decoración temática (ventas, dinero, métricas).
 * Cada [data-charts="line|bars|mix"] recibe un SVG con una curva de ventas que se
 * traza, barras que crecen y etiquetas que flotan. Se anima al entrar en pantalla
 * (clase .is-live) y se repite. Sin datos reales: es solo ilustración.
 */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const W = 600, H = 360;

  // curva ascendente con pequeños altibajos, como una gráfica de ventas real
  const LINE = [[0, 300], [60, 285], [120, 292], [180, 250], [240, 262], [300, 205], [360, 214], [420, 160], [480, 120], [540, 96], [600, 40]];

  function smooth(points) {
    return points.reduce((d, p, i, a) => {
      if (i === 0) return "M" + p[0] + " " + p[1];
      const prev = a[i - 1];
      const cx = (prev[0] + p[0]) / 2;
      return d + " C" + cx + " " + prev[1] + " " + cx + " " + p[1] + " " + p[0] + " " + p[1];
    }, "");
  }

  function grid() {
    let g = "";
    for (let y = 60; y <= 300; y += 60) g += '<line class="cg-grid" x1="0" y1="' + y + '" x2="' + W + '" y2="' + y + '"/>';
    return g;
  }

  function lineChart() {
    const d = smooth(LINE);
    const last = LINE[LINE.length - 1];
    return grid() +
      '<path class="cg-area" d="' + d + " L" + W + " " + H + " L0 " + H + ' Z"/>' +
      '<path class="cg-line" pathLength="1" d="' + d + '"/>' +
      '<circle class="cg-dot" cx="' + last[0] + '" cy="' + last[1] + '" r="6"/>';
  }

  function bars() {
    const hs = [70, 95, 88, 130, 150, 190, 240];
    const bw = 46, gap = 30, x0 = 40;
    return hs.map((h, i) =>
      '<rect class="cg-bar" style="--i:' + i + '" x="' + (x0 + i * (bw + gap)) + '" y="' + (H - h) + '" width="' + bw + '" height="' + h + '" rx="6"/>'
    ).join("");
  }

  const TAGS = ["$", "VENTAS", "ROAS", "$", "CPA", "LEADS", "$"];
  function tags(host) {
    const wrap = document.createElement("div");
    wrap.className = "cg-tags";
    TAGS.forEach((t, i) => {
      const s = document.createElement("span");
      s.textContent = t;
      s.style.setProperty("--i", i);
      s.style.left = (8 + ((i * 37) % 84)) + "%";
      wrap.appendChild(s);
    });
    host.appendChild(wrap);
  }

  function build(host) {
    const kind = host.dataset.charts || "line";
    const svg = '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" aria-hidden="true">' +
      (kind === "bars" ? bars() : kind === "mix" ? bars() + lineChart() : lineChart()) + "</svg>";
    host.insertAdjacentHTML("afterbegin", svg);
    if (kind !== "bars") tags(host);
  }

  function init() {
    const hosts = Array.from(document.querySelectorAll("[data-charts]"));
    hosts.forEach((h) => { try { build(h); } catch (err) { console.error("[VD] charts", err); } });
    if (reduce || !("IntersectionObserver" in window)) { hosts.forEach((h) => h.classList.add("is-live", "is-static")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle("is-live", e.isIntersecting));
    }, { threshold: 0.15 });
    hosts.forEach((h) => io.observe(h));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

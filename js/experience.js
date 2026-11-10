/** Scroll-owned procedural illustration: scattered attention -> funnel -> measurable growth.
 * Native scrolling is the only timeline. No animation loop or third-party dependency.
 */
(function () {
  "use strict";
  const section = document.querySelector("[data-system]");
  const canvas = section && section.querySelector("[data-system-canvas]");
  const ctx = canvas && canvas.getContext("2d");
  if (!ctx) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const compact = matchMedia("(max-width: 900px), (max-height: 760px)");
  const steps = Array.from(section.querySelectorAll("[data-system-step]"));
  const label = section.querySelector("[data-system-label]");
  const index = section.querySelector("[data-system-index]");
  const labels = ["ATENCIÓN", "CONVERSACIONES", "CRECIMIENTO"];
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const mix = (a, b, p) => a + (b - a) * p;
  // Deterministic seeds keep the same scroll position visually reversible.
  const points = Array.from({ length: 760 }, (_, i) => {
    const u = ((i * 137.508) % 360) * Math.PI / 180;
    const v = i / 759;
    const r = Math.sqrt(1 - (2 * v - 1) ** 2);
    return { x: Math.cos(u) * r, y: 2 * v - 1, z: Math.sin(u) * r, u, v };
  });
  let pending = 0;
  let visible = true;
  let size = { w: 0, h: 0, dpr: 0 };
  function draw() {
    pending = 0;
    if (!visible || document.hidden) return;
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    if (box.width !== size.w || box.height !== size.h || dpr !== size.dpr) {
      size = { w: box.width, h: box.height, dpr };
      canvas.width = Math.round(box.width * dpr);
      canvas.height = Math.round(box.height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);
    const rect = section.getBoundingClientRect();
    const p = reduce.matches || compact.matches ? 1 : clamp((82 - rect.top) / Math.max(1, rect.height - innerHeight + 82));
    const phase = p < .35 ? 0 : p < .72 ? 1 : 2;
    steps.forEach((step, i) => step.classList.toggle("is-active", i === phase));
    label.textContent = labels[phase];
    index.textContent = "0" + (phase + 1) + " / 03";
    canvas.dataset.progress = p.toFixed(3);
    const a = clamp(p / .5), b = clamp((p - .5) / .5);
    const unit = Math.min(size.w, size.h) * .34;
    const angle = p * 1.2 - .4;
    const dots = points.map((point, i) => {
      const ring = point.v;
      const radius = .18 + (1 - ring) * .85;
      const spiral = point.u + ring * Math.PI * 5;
      const fx = Math.cos(spiral) * radius;
      const fy = ring * 1.8 - .9;
      const fz = Math.sin(spiral) * radius;
      const column = i % 4;
      const row = Math.floor(i / 4) / 190;
      const bx = (column - 1.5) * .5 + Math.cos(point.u) * .14;
      const by = .8 - row * (.55 + column * .38);
      const bz = Math.sin(point.u) * .14;
      const x = mix(mix(point.x * 1.16, fx, a), bx, b);
      const y = mix(mix(point.y * 1.16, fy, a), by, b);
      const z = mix(mix(point.z * 1.16, fz, a), bz, b);
      const rx = x * Math.cos(angle) + z * Math.sin(angle);
      const rz = z * Math.cos(angle) - x * Math.sin(angle);
      return { x: rx, y, z: rz, i };
    }).sort((left, right) => left.z - right.z);
    ctx.strokeStyle = "rgba(198,167,119,.13)";
    ctx.lineWidth = 1;
    [1.12, 1.32].forEach((r) => {
      ctx.beginPath();
      ctx.ellipse(size.w / 2, size.h / 2, unit * r, unit * r, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
    dots.forEach((point) => {
      const perspective = 3.8 / (3.8 - point.z);
      const x = size.w / 2 + point.x * unit * perspective;
      const y = size.h * .47 + point.y * unit * perspective;
      const light = clamp((point.z + 1.3) / 2.6);
      ctx.fillStyle = "rgba(233,215,180," + (.22 + light * .78) + ")";
      ctx.beginPath();
      ctx.arc(x, y, (.65 + light * 1.45) * perspective, 0, Math.PI * 2);
      ctx.fill();
    });
    canvas.parentElement.classList.add("is-rendered");
  }
  function schedule() { if (!pending && !document.hidden) pending = requestAnimationFrame(draw); }
  const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
    else if (pending) { cancelAnimationFrame(pending); pending = 0; }
  }, { rootMargin: "100px" }) : null;
  if (observer) observer.observe(section);
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  document.addEventListener("visibilitychange", schedule);
  reduce.addEventListener("change", schedule);
  compact.addEventListener("change", schedule);
  addEventListener("pageshow", schedule);
  if (document.fonts) document.fonts.ready.then(schedule);
  schedule();
})();

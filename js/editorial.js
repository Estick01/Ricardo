/**
 * EDITORIAL · comportamiento visual de marca personal.
 *  - Lenis: scroll suave (se desactiva con movimiento reducido)
 *  - [data-contour]        líneas topográficas SVG generadas
 *  - [data-tone-section]   cambia html[data-tone] (dark/light) según la sección en pantalla
 *  - [data-hero-portrait]  expone --hp (0→1) mientras el hero sale de pantalla
 *  - [data-scene]          escena fija: --hs (0→1) encoge el hero hasta el marco del video; --sp (0→1) hace crecer el video
 *  - [data-fan]            expone --open (0→1): el abanico de tarjetas se abre al entrar en pantalla
 *  - [data-drift]          desplaza filas de texto en horizontal con el scroll (± factor)
 *  - [data-drift-y]        desplaza figuras en vertical con el scroll (±1)
 *  - [data-speed]          parallax vertical suave en la galería (factor)
 * Todo es decorativo: si algo falla, el contenido sigue legible.
 */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(max-width: 760px)");
  const DRIFT_PX = 0.12;   // fracción del ancho de ventana que se mueve una fila [data-drift]
  const DRIFT_Y_PX = 70;   // px máximos de [data-drift-y]
  const HERO_PHASE = 0.27;   // fracción del recorrido de la escena en la que el hero se encoge
  const FRAME_START = 0.36;  // escala inicial del marco del video (igual que en css/editorial.css)
  const FRAME_RADIUS = 10;   // px, radio del marco del video
  const THEME = Object.freeze({ dark: "#0B0B0D", light: "#ECE7DE" });

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- Scroll suave ---------- */
  function initLenis() {
    if (reduce || typeof window.Lenis !== "function") return null;
    try {
      const lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, anchors: { offset: -80 } });
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
      document.addEventListener("click", (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (!a || a.hasAttribute("data-privacy")) return;
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: id === "#top" ? 0 : -80 });
      });
      // Detener el scroll suave mientras el formulario está abierto
      const dlg = document.querySelector("[data-apply]");
      if (dlg) {
        new MutationObserver(() => (dlg.open ? lenis.stop() : lenis.start()))
          .observe(dlg, { attributes: true, attributeFilter: ["open"] });
      }
      return lenis;
    } catch (err) {
      console.error("[VD] Lenis no se pudo iniciar", err);
      return null;
    }
  }

  /* ---------- Líneas topográficas ---------- */
  function seeded(seed) {
    let s = seed % 2147483647 || 1;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }

  function contourSvg(seed) {
    const rnd = seeded(seed);
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 1000 1000");
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    const cx = 200 + rnd() * 600;
    const cy = 200 + rnd() * 600;
    const lobes = 3 + Math.floor(rnd() * 3);
    const phase = rnd() * Math.PI * 2;
    const rings = 14;
    for (let r = 1; r <= rings; r++) {
      const base = r * 58;
      const pts = [];
      for (let k = 0; k <= 72; k++) {
        const a = (k / 72) * Math.PI * 2;
        const wobble = 1 + 0.16 * Math.sin(a * lobes + phase + r * 0.35) + 0.07 * Math.sin(a * (lobes + 2) - r * 0.2);
        pts.push([cx + Math.cos(a) * base * wobble, cy + Math.sin(a) * base * wobble * 0.82]);
      }
      const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("") + "Z";
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    }
    return svg;
  }

  function initContours() {
    document.querySelectorAll("[data-contour]").forEach((el, i) => {
      if (!el.firstChild) el.appendChild(contourSvg(97 + i * 131));
    });
  }

  /* ---------- Tono de fondo ---------- */
  function createToneUpdater() {
    const sections = Array.from(document.querySelectorAll("[data-tone-section]"));
    const root = document.documentElement;
    const meta = document.querySelector('meta[name="theme-color"]');
    let current = root.dataset.tone || "dark";
    return () => {
      const probe = window.innerHeight * 0.5;
      const hit = sections.find((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= probe && r.bottom > probe;
      });
      const tone = hit ? hit.dataset.toneSection : "dark";
      if (tone === current) return;
      current = tone;
      root.dataset.tone = tone;
      if (meta) meta.setAttribute("content", THEME[tone] || THEME.dark);
    };
  }

  /* ---------- Parallax y desplazamientos ---------- */
  function sectionProgress(el) {
    // 0 cuando la sección entra por abajo, 1 cuando sale por arriba
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    return clamp((vh - r.top) / (vh + r.height), 0, 1);
  }

  function createMotionUpdater() {
    const hero = document.querySelector("[data-hero-portrait]");
    const heroSection = hero && hero.closest("section");
    const drifts = Array.from(document.querySelectorAll("[data-drift]")).map((el) => ({
      el, dir: Number(el.dataset.drift) || 0, sec: el.closest("section"),
    }));
    const driftsY = Array.from(document.querySelectorAll("[data-drift-y]")).map((el) => ({
      el, dir: Number(el.dataset.driftY) || 0, sec: el.closest("section"),
    }));
    const scenes = Array.from(document.querySelectorAll("[data-scene]")).map((el) => ({
      el, pin: el.querySelector(".ed-scene-pin"), frame: el.querySelector(".ed-scene-frame"),
    }));
    const fans = Array.from(document.querySelectorAll("[data-fan]"));
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const speeds = Array.from(document.querySelectorAll("[data-speed]")).map((el) => ({
      el, f: Number(el.dataset.speed) || 0,
    }));

    return () => {
      const still = reduce || mobile.matches;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      if (hero && heroSection) {
        const r = heroSection.getBoundingClientRect();
        hero.style.setProperty("--hp", still ? "0" : clamp(-r.top / r.height, 0, 1).toFixed(4));
      }
      scenes.forEach(({ el, pin, frame }) => {
        const r = el.getBoundingClientRect();
        const raw = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
        const hs = reduce ? 0 : clamp(raw / HERO_PHASE, 0, 1);
        const sp = reduce ? 1 : clamp((raw - HERO_PHASE) / (1 - HERO_PHASE), 0, 1);
        el.style.setProperty("--hs", hs.toFixed(4));
        el.style.setProperty("--sp", sp.toFixed(4));
        el.classList.toggle("hero-gone", hs >= 1);
        if (pin && frame && frame.offsetWidth) {
          // el hero termina del mismo tamaño y forma que el marco del video en su estado inicial
          const end = (FRAME_START * frame.offsetWidth) / pin.offsetWidth;
          const visibleH = (FRAME_START * frame.offsetHeight) / end;
          el.style.setProperty("--hero-end", end.toFixed(4));
          el.style.setProperty("--hero-clip", Math.max(0, (pin.offsetHeight - visibleH) / 2).toFixed(1) + "px");
          el.style.setProperty("--hero-radius", ((FRAME_RADIUS * FRAME_START) / end).toFixed(1) + "px");
        }
      });
      fans.forEach((el) => {
        const r = el.getBoundingClientRect();
        const p = reduce ? 1 : clamp((vh * 0.92 - r.top) / (vh * 0.55), 0, 1);
        el.style.setProperty("--open", easeOut(p).toFixed(4));
      });
      drifts.forEach(({ el, dir, sec }) => {
        const p = reduce ? 0.5 : sectionProgress(sec);
        el.style.transform = "translate3d(" + ((p - 0.5) * dir * vw * DRIFT_PX).toFixed(1) + "px,0,0)";
      });
      driftsY.forEach(({ el, dir, sec }) => {
        const p = still ? 0.5 : sectionProgress(sec);
        el.style.transform = "translate3d(0," + ((p - 0.5) * dir * DRIFT_Y_PX * 2).toFixed(1) + "px,0)";
      });
      speeds.forEach(({ el, f }) => {
        if (still) { el.style.transform = ""; return; }
        const r = el.getBoundingClientRect();
        const offset = (r.top + r.height / 2 - vh / 2) * -f;
        el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
      });
    };
  }

  function init() {
    initContours();
    initLenis();
    const tone = createToneUpdater();
    const motion = createMotionUpdater();
    let ticking = false;
    const update = () => {
      ticking = false;
      try { tone(); motion(); } catch (err) { console.error("[VD] editorial update", err); }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    mobile.addEventListener("change", onScroll);
    update();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

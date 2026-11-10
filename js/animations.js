/**
 * ANIMACIONES · firma manuscrita, intro y entradas con máscara.
 *  - [data-signature="Texto"]  firma que se escribe sola (trazo → relleno) de izquierda a derecha.
 *        data-sig-flourish     añade una rúbrica bajo la firma
 *        data-sig-trigger      "view" (por defecto, al entrar en pantalla) | "intro" (al terminar la intro)
 *  - Intro: cortina con la firma en la primera visita de la sesión.
 *  - Títulos editoriales: suben palabra por palabra (usa [data-split] de motion.js).
 *  - Fotos: se descubren con recorte (clip-path) al entrar en pantalla.
 *  - Botones magnéticos y cifras que cuentan hacia arriba.
 *  - video[data-loop]: clips sin sonido que solo se reproducen mientras están en pantalla.
 * Para usar la firma real de Ricardo: exportarla como SVG de un solo trazo y
 * reemplazar el <text> por su <path class="sig-flourish" pathLength="1">.
 */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const SIG_SIZE = 190;       // px del texto dentro del SVG (igual que .sig-text en animations.css)
  const SIG_BASELINE = 180;   // línea base del texto dentro del SVG
  const SIG_FONT = SIG_SIZE + 'px "Mrs Saint Delafield"';
  const INTRO_KEY = "vd_intro";
  const INTRO_DRAW_MS = 2300;   // tiempo de escritura de la firma en la intro
  const INTRO_EXIT_MS = 900;    // cortina
  const FONT_TIMEOUT_MS = 1500;
  const MAGNET = 0.28;          // fracción del desplazamiento del cursor que sigue el botón
  const COUNT_MS = 1600;

  const svgEl = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /* ---------- Firma ---------- */
  let sigCount = 0;
  function buildSignature(host) {
    const id = "sig-mask-" + (sigCount += 1);
    const svg = svgEl("svg", { class: "sig", viewBox: "0 0 900 260", "aria-hidden": "true", focusable: "false" });
    const text = svgEl("text", { class: "sig-text", x: "0", y: String(SIG_BASELINE) });
    text.textContent = host.dataset.signature;
    const sweep = svgEl("rect", { class: "sig-sweep", fill: "#fff" });
    const mask = svgEl("mask", { id, maskUnits: "userSpaceOnUse" });
    const group = svgEl("g", { mask: "url(#" + id + ")" });
    mask.appendChild(sweep);
    group.appendChild(text);
    svg.appendChild(svgEl("defs")).appendChild(mask);
    svg.appendChild(group);
    const flourish = host.hasAttribute("data-sig-flourish") ? svgEl("path", { class: "sig-flourish", pathLength: "1" }) : null;
    if (flourish) svg.appendChild(flourish);
    host.textContent = "";
    host.appendChild(svg);
    return { svg, text, sweep, mask, flourish };
  }

  /* Ajusta el viewBox y la máscara al tamaño real del texto (depende de la fuente cargada) */
  function fitSignature(parts) {
    const b = parts.text.getBBox();
    if (!b.width) return;
    // getBBox usa la caja completa de la fuente (mucho aire vertical): el alto se toma de la línea base
    const pad = 30;
    const x = b.x - pad, w = b.width + pad * 2;
    const y = SIG_BASELINE - SIG_SIZE * 0.74;
    const h = SIG_SIZE * 1.12 + (parts.flourish ? 40 : 0);
    parts.svg.setAttribute("viewBox", [x, y, w, h].map((n) => n.toFixed(1)).join(" "));
    const maskBox = [x, Math.min(y, b.y), w, Math.max(h, b.height) + 80];
    ["x", "y", "width", "height"].forEach((k, i) => {
      parts.sweep.setAttribute(k, maskBox[i].toFixed(1));
      parts.mask.setAttribute(k, maskBox[i].toFixed(1));
    });
    if (parts.flourish) {
      const base = SIG_BASELINE + 22;
      const l = b.x, r = b.x + b.width;
      const d = "M" + (l - 10) + " " + (base + 18) +
        " C" + (l + b.width * 0.3) + " " + (base + 44) + " " + (l + b.width * 0.68) + " " + (base - 12) + " " + (r + 14) + " " + (base + 6) +
        " C" + (l + b.width * 0.78) + " " + (base + 22) + " " + (l + b.width * 0.55) + " " + (base + 34) + " " + (l + b.width * 0.36) + " " + (base + 50);
      parts.flourish.setAttribute("d", d);
    }
  }

  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.race([document.fonts.load(SIG_FONT, "Ricardo"), wait(FONT_TIMEOUT_MS)]).catch(() => undefined);
  }

  function initSignatures() {
    const hosts = Array.from(document.querySelectorAll("[data-signature]"));
    const built = hosts.map((host) => ({ host, parts: buildSignature(host) }));
    const draw = (host) => host.classList.add("is-drawn");
    const ready = fontsReady().then(() => built.forEach(({ parts }) => fitSignature(parts)));

    const onView = built.filter(({ host }) => (host.dataset.sigTrigger || "view") === "view");
    if (reduce || !("IntersectionObserver" in window)) {
      ready.then(() => built.forEach(({ host }) => draw(host)));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          ready.then(() => draw(e.target));
        });
      }, { threshold: 0.45 });
      onView.forEach(({ host }) => io.observe(host));
    }
    return {
      ready,
      drawIntroTriggered: () => built.filter(({ host }) => host.dataset.sigTrigger === "intro").forEach(({ host }) => draw(host)),
    };
  }

  /* ---------- Intro ---------- */
  function endIntro() {
    root.classList.remove("intro-playing");
    try { window.sessionStorage.setItem(INTRO_KEY, "1"); } catch (_) { /* almacenamiento bloqueado: la intro se repetirá */ }
  }

  async function playIntro(signatures) {
    if (!root.classList.contains("intro-playing")) { await signatures.ready; return; }
    const overlay = document.createElement("div");
    overlay.className = "intro";
    overlay.setAttribute("aria-hidden", "true");
    const sign = document.createElement("div");
    sign.className = "intro-sign";
    sign.dataset.signature = "Ricardo Arroyo";
    sign.setAttribute("data-sig-flourish", "");
    const tag = document.createElement("p");
    tag.className = "intro-tag";
    tag.textContent = "Vendo Desaparece";
    overlay.append(sign, tag);
    document.body.appendChild(overlay);
    try {
      const parts = buildSignature(sign);
      await fontsReady();
      fitSignature(parts);
      sign.classList.add("is-drawn");
      overlay.classList.add("is-on");
      await wait(INTRO_DRAW_MS);
      overlay.classList.add("is-out");
      await wait(INTRO_EXIT_MS * 0.45);
    } catch (err) {
      console.error("[VD] intro", err);
    } finally {
      endIntro();
      setTimeout(() => overlay.remove(), INTRO_EXIT_MS);
    }
  }

  /* ---------- Títulos y fotos ---------- */
  function prepareHeadings() {
    // motion.js parte [data-split] en palabras y las hace subir al entrar en pantalla
    document.querySelectorAll(".ed-h2, .ed-gallery-title, .ed-final-title").forEach((el) => {
      el.removeAttribute("data-reveal");
      el.setAttribute("data-split", "");
    });
  }

  function prepareMedia() {
    document.querySelectorAll(".ed-shot img, .ed-shot video").forEach((img) => {
      const frame = document.createElement("span");
      frame.className = "ed-shot-frame";
      img.replaceWith(frame);
      frame.appendChild(img);
    });
    const targets = document.querySelectorAll(".ed-shot, .ed-mentor-cut, .ed-split-figures, .ed-stats, .ed-flow");
    targets.forEach((el) => el.setAttribute("data-anim", ""));
    if (reduce || !("IntersectionObserver" in window)) { targets.forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.classList.add("in");
        if (e.target.classList.contains("ed-stats")) countUp(e.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.15 });
    targets.forEach((el) => io.observe(el));
  }

  /* ---------- Clips en bucle: solo se reproducen mientras están en pantalla ---------- */
  function initLoops() {
    const clips = document.querySelectorAll("video[data-loop]");
    if (reduce || !("IntersectionObserver" in window)) return; // queda el póster fijo
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const clip = e.target;
        if (!e.isIntersecting) { clip.pause(); return; }
        const playing = clip.play();
        if (playing && playing.catch) playing.catch(() => { /* reproducción bloqueada: se queda el póster */ });
      });
    }, { rootMargin: "200px 0px", threshold: 0.1 });
    clips.forEach((clip) => { clip.muted = true; io.observe(clip); });
  }

  /* ---------- Cifras ---------- */
  function countUp(container) {
    container.querySelectorAll("strong").forEach((el) => {
      const match = el.textContent.match(/^(\D*)([\d.]+)(.*)$/);
      if (!match) return;
      const [, prefix, digits, suffix] = match;
      const target = parseInt(digits.replace(/\./g, ""), 10);
      if (!Number.isFinite(target)) return;
      const format = (n) => prefix + Math.round(n).toLocaleString("es-CO") + suffix;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / COUNT_MS);
        el.textContent = format(target * (1 - Math.pow(1 - t, 4)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---------- Botones magnéticos ---------- */
  function initMagnets() {
    if (reduce || !finePointer) return;
    document.querySelectorAll(".btn-gold, .ed-chip").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * MAGNET;
        const y = (e.clientY - (r.top + r.height / 2)) * MAGNET;
        el.style.translate = x.toFixed(1) + "px " + y.toFixed(1) + "px";
      });
      el.addEventListener("pointerleave", () => {
        const from = el.style.translate || "0px 0px";
        el.style.translate = "";
        el.animate([{ translate: from }, { translate: "0px 0px" }], { duration: 600, easing: "cubic-bezier(.22,1,.36,1)" });
      });
    });
  }

  function init() {
    root.classList.add("anim-ready");
    const safe = (fn) => { try { return fn(); } catch (err) { console.error("[VD] animations", err); return null; } };
    safe(prepareHeadings);
    safe(prepareMedia);
    safe(initMagnets);
    safe(initLoops);
    const signatures = safe(initSignatures);
    if (!signatures) { endIntro(); return; }
    playIntro(signatures).then(() => signatures.drawIntroTriggered());
  }

  // Debe ejecutarse antes del arranque de funnel.js para que motion.js vea los [data-split]
  init();
})();

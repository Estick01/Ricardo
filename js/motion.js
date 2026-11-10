/**
 * Movimiento estilo Apple:
 *  - [data-reveal]  aparece con desenfoque → nitidez al entrar en pantalla
 *  - [data-split]   titular que sube palabra por palabra
 *  - [data-words]   texto que se ilumina palabra a palabra con el scroll
 *  - [data-scroll]  expone --p (0→1) según el progreso de scroll del elemento
 */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function splitWords(el) {
    let i = 0;
    const walk = (node, inEm) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const outer = document.createElement("span");
            outer.className = "split-word";
            const inner = document.createElement("span");
            inner.textContent = part;
            inner.style.setProperty("--i", i++);
            if (inEm) inner.className = "em-word";
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child, inEm || child.tagName === "EM");
        }
      });
    };
    el.setAttribute("aria-label", el.textContent.trim());
    walk(el, false);
    el.querySelectorAll(".split-word").forEach((w) => w.setAttribute("aria-hidden", "true"));
  }

  function prepareWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    const accent = new RegExp("^(" + (el.dataset.accent || "sistema|desaparecer") + ")$", "i");
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = "";
    words.forEach((w, idx) => {
      const s = document.createElement("span");
      s.className = "w" + (accent.test(w.replace(/[.,]/g, "")) ? " gold" : "");
      s.textContent = w;
      s.setAttribute("aria-hidden", "true");
      el.appendChild(s);
      if (idx < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
  }

  function initReveal() {
    const targets = document.querySelectorAll("[data-reveal], [data-split]");
    if (reduce || !("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    targets.forEach((t) => io.observe(t));
  }

  /* progreso 0→1: desde que el elemento entra por abajo hasta `end` */
  function progressOf(el, mode) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (mode === "manifesto") return clamp((-r.top) / (r.height - vh));
    if (mode === "hero") return clamp(1 - (r.top - vh * 0.25) / (vh * 0.6));
    return clamp((vh * 0.85 - r.top) / (vh * 0.55));
  }
  const clamp = (v) => Math.min(1, Math.max(0, v));

  function initScroll() {
    const scrollers = Array.from(document.querySelectorAll("[data-scroll]"));
    const manifestoWords = Array.from(document.querySelectorAll("[data-words] .w"));
    const flowItems = Array.from(document.querySelectorAll(".flow li"));
    const nav = document.querySelector("[data-nav]");
    let ticking = false;

    const update = () => {
      ticking = false;
      nav.classList.toggle("scrolled", window.scrollY > 24);
      scrollers.forEach((el) => {
        const mode = el.dataset.scroll;
        const p = reduce ? 1 : progressOf(el, mode);
        el.style.setProperty("--p", p.toFixed(4));
        if (mode === "manifesto") {
          // se completa al 80 % del recorrido y el texto queda fijo un momento antes de soltarse
          const lit = Math.round(Math.min(1, p / 0.8) * manifestoWords.length);
          manifestoWords.forEach((w, i) => w.classList.toggle("lit", i < lit));
        }
        if (mode === "flow") {
          flowItems.forEach((li, i) => li.classList.toggle("on", p >= i / (flowItems.length - 1) - 0.001));
        }
      });
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  window.VD = Object.assign(window.VD || {}, {
    motion: {
      init() {
        document.documentElement.classList.add("motion-ready");
        document.querySelectorAll("[data-split]").forEach(splitWords);
        document.querySelectorAll("[data-words]").forEach(prepareWords);
        initReveal();
        initScroll();
      },
      reveal: initReveal,
    },
  });
})();

/**
 * Embudo: variante A/B, CTAs, barra flotante, formulario de aplicación.
 *   A → checkout de Hotmart     B → agenda comercial (js/booking.js)
 */
(function () {
  "use strict";
  const CFG = window.VD_CONFIG;
  const KEY = "vd_variant";
  const VALID = ["a", "b"];

  function storage(fn) { try { return fn(window.localStorage); } catch (_) { return null; } }

  function pickVariant() {
    const q = new URLSearchParams(location.search).get("v");
    if (q && VALID.includes(q.toLowerCase())) {
      const v = q.toLowerCase();
      storage((s) => s.setItem(KEY, v));
      return v;
    }
    const saved = storage((s) => s.getItem(KEY));
    if (saved && VALID.includes(saved)) return saved;
    const v = CFG.randomSplit ? (Math.random() < 0.5 ? "a" : "b") : CFG.defaultVariant;
    if (CFG.randomSplit) storage((s) => s.setItem(KEY, v));
    return v;
  }

  let toastTimer;
  function toast(msg) {
    const el = document.querySelector("[data-toast]");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
  }

  function isSafeUrl(u) {
    try { return ["https:", "http:"].includes(new URL(u, location.href).protocol); } catch (_) { return false; }
  }

  /* ---------- CTAs ---------- */
  function goCheckout(source) {
    window.VD.track("checkout_click", { source });
    const url = CFG.links.hotmartCheckoutUrl;
    if (!url || !isSafeUrl(url)) { toast("Enlace de Hotmart pendiente de configurar."); return; }
    location.href = url;
  }

  function openApply(source) {
    window.VD.track("apply_open", { source });
    const dlg = document.querySelector("[data-apply]");
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  }

  function initCtas(variant) {
    document.querySelectorAll("[data-cta]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const source = btn.dataset.cta;
        window.VD.track("cta_click", { source });
        if (variant === "a") goCheckout(source); else openApply(source);
      });
    });
  }

  /* ---------- Barra flotante ---------- */
  function initFloatbar() {
    const bar = document.querySelector("[data-floatbar]");
    const hero = document.querySelector(".hero-cta");
    const final = document.querySelector("[data-final]");
    let pastHero = false, atFinal = false;
    const sync = () => bar.classList.toggle("show", pastHero && !atFinal);
    if (!("IntersectionObserver" in window)) { bar.classList.add("show"); return; }
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }).observe(hero);
    new IntersectionObserver(([e]) => { atFinal = e.isIntersecting; sync(); }, { threshold: 0.35 }).observe(final);
  }

  /* El formulario y la agenda viven en js/booking.js */

  /* ---------- Arranque ---------- */
  function boot() {
    const variant = pickVariant();
    document.documentElement.dataset.variant = variant;
    window.VD.track("variant_view", { variant });
    document.querySelector("[data-year]").textContent = new Date().getFullYear();
    document.querySelectorAll("[data-privacy]").forEach((a) => { a.href = CFG.links.privacyPolicyUrl; });

    const steps = [window.VD.render, window.VD.motion.init, window.VD.calculator.init, window.VD.vsl.init,
      () => initCtas(variant), initFloatbar];
    steps.forEach((fn) => { try { fn(); } catch (err) { console.error("[VD] init error", err); } });
  }

  window.VD = Object.assign(window.VD || {}, { toast, isSafeUrl });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();

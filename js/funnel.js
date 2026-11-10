/**
 * Embudo: variante A/B, CTAs, barra flotante, formulario de aplicación.
 *   A → checkout de Hotmart     B → formulario + agenda comercial
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

  /* ---------- Formulario ---------- */
  function validate(form) {
    const d = Object.fromEntries(new FormData(form).entries());
    if (d.website) return { error: "spam" };
    const clean = {};
    ["name", "company", "industry", "revenue", "ads", "team", "phone", "email"].forEach((k) => {
      clean[k] = String(d[k] || "").trim().slice(0, 160);
    });
    if (Object.values(clean).some((v) => !v)) return { error: "Completa todos los campos." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean.email)) return { error: "Revisa tu correo." };
    if (!/^[0-9+ ()-]{7,20}$/.test(clean.phone)) return { error: "Revisa tu número de WhatsApp." };
    if (!form.consent.checked) return { error: "Necesitamos tu autorización de tratamiento de datos." };
    return { data: Object.freeze(Object.assign(clean, { consent: true, consent_at: new Date().toISOString() })) };
  }

  async function send(data) {
    const url = CFG.links.formEndpoint;
    if (!url) throw new Error("FORM_NOT_CONFIGURED");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ variant: "b", page: location.href }, data)),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
  }

  function initForm() {
    const dlg = document.querySelector("[data-apply]");
    const form = dlg.querySelector("[data-apply-form]");
    const err = dlg.querySelector("[data-form-error]");
    const submit = dlg.querySelector("[data-submit]");
    const cal = dlg.querySelector("[data-calendar]");
    let started = false;

    dlg.querySelector("[data-apply-close]").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    form.addEventListener("input", () => { if (!started) { started = true; window.VD.track("form_start"); } }, { once: true });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      err.textContent = "";
      const { data, error } = validate(form);
      if (error === "spam") return;
      if (error) { err.textContent = error; return; }
      submit.disabled = true;
      submit.textContent = "Enviando…";
      try {
        await send(data);
        window.VD.track("lead_submit", { industry: data.industry, revenue: data.revenue });
        dlg.querySelector('[data-step="form"]').hidden = true;
        dlg.querySelector('[data-step="done"]').hidden = false;
      } catch (ex) {
        console.error("[VD] envío de formulario falló", ex);
        err.textContent = ex.message === "FORM_NOT_CONFIGURED"
          ? "Las solicitudes aún no están habilitadas. No se enviaron tus datos."
          : "No pudimos enviar tu solicitud. Intenta de nuevo en unos minutos.";
      } finally {
        submit.disabled = false;
        submit.textContent = "Enviar solicitud";
      }
    });

    cal.addEventListener("click", (e) => {
      window.VD.track("schedule_click");
      const url = CFG.links.calendarUrl;
      if (!url || !isSafeUrl(url)) { e.preventDefault(); toast("Agenda comercial pendiente de configurar."); return; }
      cal.href = url;
    });
  }

  /* ---------- Arranque ---------- */
  function boot() {
    const variant = pickVariant();
    document.documentElement.dataset.variant = variant;
    window.VD.track("variant_view", { variant });
    document.querySelector("[data-year]").textContent = new Date().getFullYear();
    document.querySelectorAll("[data-privacy]").forEach((a) => { a.href = CFG.links.privacyPolicyUrl; });

    const steps = [window.VD.render, window.VD.motion.init, window.VD.calculator.init, window.VD.vsl.init,
      () => initCtas(variant), initFloatbar, initForm];
    steps.forEach((fn) => { try { fn(); } catch (err) { console.error("[VD] init error", err); } });
  }

  window.VD = Object.assign(window.VD || {}, { toast });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();

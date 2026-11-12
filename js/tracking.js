/**
 * Tracking: carga GTM / GA4 / Meta Pixel solo si hay ID en config y el visitante acepta las cookies.
 * VD.track() envía cada evento a dataLayer (GTM/GA4) y a fbq (Pixel).
 * Conversion API (CAPI) debe ir del lado servidor: usa el event_id que se
 * genera aquí para deduplicar con el Pixel.
 */
(function () {
  "use strict";
  const cfg = window.VD_CONFIG.tracking;
  window.dataLayer = window.dataLayer || [];

  function loadScript(src) {
    const s = document.createElement("script");
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  /* ---------- Consentimiento de cookies (Ley 1581 / buenas prácticas) ----------
     Las etiquetas de medición solo se cargan si el visitante acepta las cookies opcionales.
     La elección se guarda 12 meses en localStorage (vd_consent). */
  const CONSENT_KEY = "vd_consent";
  const CONSENT_MS = 365 * 24 * 60 * 60 * 1000;
  const hasTags = Boolean(cfg.gtmId || cfg.ga4Id || cfg.metaPixelId);
  let tagsLoaded = false;

  function readConsent() {
    try {
      const raw = JSON.parse(window.localStorage.getItem(CONSENT_KEY) || "null");
      if (!raw || !["granted", "denied"].includes(raw.v) || Date.now() - raw.t > CONSENT_MS) return null;
      return raw.v;
    } catch (_) { return null; }
  }

  function saveConsent(value) {
    try { window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ v: value, t: Date.now() })); } catch (_) { /* sin almacenamiento: se preguntará de nuevo */ }
  }

  function loadTags() {
    if (tagsLoaded) return;
    tagsLoaded = true;
    if (cfg.gtmId) {
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      loadScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(cfg.gtmId));
    }

    if (cfg.ga4Id) {
      loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.ga4Id));
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", cfg.ga4Id);
    }

    if (cfg.metaPixelId) {
      /* eslint-disable */
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
      window.fbq("init", cfg.metaPixelId);
      window.fbq("track", "PageView");
    }

  }

  function initBanner() {
    const banner = document.querySelector("[data-cookie-banner]");
    const prefs = document.querySelectorAll("[data-cookie-prefs]");
    if (!banner || !hasTags) return; // sin etiquetas opcionales no hay nada que aceptar
    prefs.forEach((b) => { b.hidden = false; b.addEventListener("click", () => { banner.hidden = false; }); });
    banner.querySelectorAll("[data-consent]").forEach((btn) => btn.addEventListener("click", () => {
      const value = btn.dataset.consent === "granted" ? "granted" : "denied";
      saveConsent(value);
      banner.hidden = true;
      if (value === "granted") loadTags();
      else if (tagsLoaded) location.reload(); // retirar etiquetas ya cargadas
    }));
    if (!readConsent()) banner.hidden = false;
  }

  if (hasTags && readConsent() === "granted") loadTags();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initBanner); else initBanner();

  const FB_STANDARD = { lead_submit: "Lead", checkout_click: "InitiateCheckout", schedule_click: "Schedule" };

  function eventId() {
    return (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random().toString(16).slice(2);
  }

  function track(name, params) {
    const payload = Object.assign({ variant: document.documentElement.dataset.variant }, params || {});
    const id = eventId();
    try {
      window.dataLayer.push(Object.assign({ event: name, event_id: id }, payload));
      if (window.fbq) {
        const std = FB_STANDARD[name];
        if (std) window.fbq("track", std, payload, { eventID: id });
        else window.fbq("trackCustom", name, payload, { eventID: id });
      }
    } catch (err) {
      console.error("[VD] tracking error", name, err);
    }
    return id;
  }

  window.VD = Object.assign(window.VD || {}, { track });
})();

/**
 * Tracking: carga GTM / GA4 / Meta Pixel solo si hay ID en config.
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

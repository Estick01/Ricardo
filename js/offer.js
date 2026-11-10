/**
 * Oferta y prueba social:
 *  - [data-offer]  pinta valor y precio desde VD_CONFIG.offer (antes / después del precio)
 *  - .ed-allies-track  duplica la lista de empresas para que la cinta gire sin cortes
 */
(function () {
  "use strict";
  const CFG = window.VD_CONFIG;

  function initOffer() {
    const root = document.querySelector("[data-offer]");
    const offer = CFG.offer;
    if (!root || !offer) return;
    const money = new Intl.NumberFormat(CFG.currency.locale, { style: "currency", currency: CFG.currency.code, maximumFractionDigits: 0 });
    const value = root.querySelector("[data-offer-value]");
    const anchor = root.querySelector("[data-offer-anchor]");
    const price = root.querySelector("[data-offer-price]");
    const when = root.querySelector("[data-live-when]");
    if (Number.isFinite(offer.value)) value.textContent = money.format(offer.value);
    if (Number.isFinite(offer.price) && offer.price > 0) {
      anchor.textContent = money.format(offer.value);
      anchor.hidden = false;
      value.textContent = money.format(offer.price);
      root.querySelector(".ed-price-label").textContent = "Precio de hoy";
    } else {
      price.textContent = "El precio especial se presenta en la asesoría en vivo y en tu llamada.";
      price.hidden = false;
    }
    if (when && offer.liveWhen) when.textContent = offer.liveWhen;
  }

  function initAllies() {
    document.querySelectorAll(".ed-allies-track").forEach((track) => {
      if (track.dataset.cloned) return;
      track.dataset.cloned = "1";
      Array.from(track.children).forEach((child) => track.appendChild(child.cloneNode(true)));
    });
  }

  function init() {
    [initOffer, initAllies].forEach((fn) => { try { fn(); } catch (err) { console.error("[VD] offer", err); } });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

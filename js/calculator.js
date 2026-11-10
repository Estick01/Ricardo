/**
 * Calculadora de rentabilidad.
 *   leads       = inversión / costo por lead
 *   ventas      = leads × conversión
 *   facturación = ventas × ticket
 *   CAC         = inversión / ventas
 *   utilidad    = facturación × margen − inversión
 *   ROAS        = facturación / inversión
 */
(function () {
  "use strict";
  const { code, locale } = window.VD_CONFIG.currency;
  const money = new Intl.NumberFormat(locale, { style: "currency", currency: code, maximumFractionDigits: 0 });
  const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

  function compute(v) {
    const leads = v.cpl > 0 ? v.spend / v.cpl : 0;
    const sales = leads * (v.conv / 100);
    const revenue = sales * v.ticket;
    return Object.freeze({
      leads,
      sales,
      revenue,
      cac: sales > 0 ? v.spend / sales : 0,
      profit: revenue * (v.margin / 100) - v.spend,
      roas: v.spend > 0 ? revenue / v.spend : 0,
    });
  }

  function animateNumber(el, to, fmt) {
    const from = Number(el.dataset.v || 0);
    el.dataset.v = String(to);
    const start = performance.now();
    const dur = 600;
    const step = (t) => {
      const k = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function init() {
    const root = document.querySelector("[data-calc]");
    if (!root) return;
    const inputs = Array.from(root.querySelectorAll("input[type=range]"));
    const out = (n) => root.querySelector('[data-out="' + n + '"]');
    const res = (n) => root.querySelector('[data-r="' + n + '"]');
    const labels = {
      spend: (x) => money.format(x), cpl: (x) => money.format(x), ticket: (x) => money.format(x),
      conv: (x) => x + " %", margin: (x) => x + " %",
    };
    let tracked = false;

    const update = () => {
      const values = Object.freeze(Object.fromEntries(inputs.map((i) => [i.name, Number(i.value)])));
      inputs.forEach((i) => {
        const pct = ((i.value - i.min) / (i.max - i.min)) * 100;
        i.style.setProperty("--fill", pct + "%");
        out(i.name).textContent = labels[i.name](Number(i.value));
      });
      const r = compute(values);
      animateNumber(res("revenue"), r.revenue, (x) => money.format(x));
      animateNumber(res("leads"), r.leads, (x) => num.format(x));
      animateNumber(res("sales"), r.sales, (x) => num.format(x));
      animateNumber(res("cac"), r.cac, (x) => money.format(x));
      animateNumber(res("profit"), r.profit, (x) => money.format(x));
      animateNumber(res("roas"), r.roas, (x) => x.toFixed(2) + "×");
      res("profit").classList.toggle("neg", r.profit < 0);
    };

    inputs.forEach((i) => i.addEventListener("input", () => {
      update();
      if (!tracked) { tracked = true; window.VD.track("calculator_use"); }
    }));
    update();
  }

  window.VD = Object.assign(window.VD || {}, { calculator: { init, compute } });
})();

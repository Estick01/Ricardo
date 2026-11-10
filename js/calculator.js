/**
 * Proyección de ventas: mismo modelo que la hoja "PROYECCIÓN VENTAS" de Ricardo.
 *   ventas necesarias   = meta ÷ ticket promedio
 *   presupuesto de ads  = ventas necesarias × CPA
 *   ROAS                = meta ÷ presupuesto de ads
 *   semana (×4)         = presupuesto ÷ 4  ·  meta ÷ 4
 *   día                 = presupuesto ÷ días · ventas ÷ días · meta ÷ días
 */
(function () {
  "use strict";
  const { code, locale } = window.VD_CONFIG.currency;
  const money = new Intl.NumberFormat(locale, { style: "currency", currency: code, maximumFractionDigits: 0 });
  const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const WEEKS = 4;

  function compute(v) {
    const units = v.ticket > 0 ? v.goal / v.ticket : 0;
    const budget = units * v.cpa;
    const days = Math.max(1, v.days);
    return Object.freeze({
      units,
      budget,
      roas: budget > 0 ? v.goal / budget : 0,
      weekAds: budget / WEEKS,
      weekSales: v.goal / WEEKS,
      dayBudget: budget / days,
      dayOrders: units / days,
      dayRevenue: v.goal / days,
    });
  }

  function animateNumber(el, to, fmt) {
    const from = Number(el.dataset.v || 0);
    el.dataset.v = String(to);
    const start = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - start) / 500);
      el.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 3)));
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
    const labels = { goal: money.format, ticket: money.format, cpa: money.format, days: (x) => x + " días" };
    let tracked = false;

    const update = () => {
      const values = Object.freeze(Object.fromEntries(inputs.map((i) => [i.name, Number(i.value)])));
      inputs.forEach((i) => {
        i.style.setProperty("--fill", ((i.value - i.min) / (i.max - i.min)) * 100 + "%");
        const o = out(i.name), fmt = labels[i.name];
        if (o && fmt) o.textContent = fmt(Number(i.value));
      });
      const r = compute(values);
      animateNumber(res("budget"), r.budget, money.format);
      animateNumber(res("units"), r.units, (x) => num.format(x));
      animateNumber(res("roas"), r.roas, (x) => x.toFixed(1) + "×");
      animateNumber(res("dayBudget"), r.dayBudget, money.format);
      animateNumber(res("dayOrders"), r.dayOrders, (x) => num.format(x));
      animateNumber(res("dayRevenue"), r.dayRevenue, money.format);
      root.querySelectorAll('[data-w="ads"]').forEach((td) => { td.textContent = money.format(r.weekAds); });
      root.querySelectorAll('[data-w="sales"]').forEach((td) => { td.textContent = money.format(r.weekSales); });
    };

    inputs.forEach((i) => i.addEventListener("input", () => {
      update();
      if (!tracked) { tracked = true; window.VD.track("calculator_use"); }
    }));
    update();
  }

  window.VD = Object.assign(window.VD || {}, { calculator: { init, compute } });
})();

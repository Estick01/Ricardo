/** Sales projection from an ad budget. COP. This estimates revenue, not profit. */
(function () {
  "use strict";
  const { code, locale } = window.VD_CONFIG.currency;
  const money = new Intl.NumberFormat(locale, { style: "currency", currency: code, maximumFractionDigits: 0 });
  const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  function compute(v) {
    const budget = Math.max(0, Number(v.budget) || 0);
    const ticket = Math.max(0, Number(v.ticket) || 0);
    const cpa = Math.max(0, Number(v.cpa) || 0);
    const days = Math.max(1, Number(v.days) || 1);
    const units = cpa > 0 ? Math.floor(budget / cpa) : 0;
    const revenue = units * ticket;
    return Object.freeze({ budget, units, revenue, roas: budget > 0 ? revenue / budget : 0, dayBudget: budget / days, days });
  }
  function init() {
    const root = document.querySelector("[data-calc]");
    if (!root) return;
    const inputs = [...root.querySelectorAll("input[type=range]")];
    const set = (key, value) => { const el = root.querySelector('[data-r="' + key + '"]'); if (el) el.textContent = value; };
    let tracked = false;
    function update() {
      const v = Object.fromEntries(inputs.map(i => [i.name, Number(i.value)]));
      inputs.forEach(i => {
        const label = i.name === "days" ? i.value + " días" : money.format(Number(i.value));
        root.querySelector('[data-out="' + i.name + '"]').textContent = label;
        i.setAttribute("aria-valuetext", label);
        i.style.setProperty("--fill", ((Number(i.value) - Number(i.min)) / (Number(i.max) - Number(i.min))) * 100 + "%");
      });
      const r = compute(v);
      set("revenue", money.format(r.revenue)); set("units", num.format(r.units));
      set("roas", num.format(r.roas) + "×"); set("dayBudget", money.format(r.dayBudget)); set("period", r.days + " días");
    }
    inputs.forEach(i => i.addEventListener("input", () => {
      update();
      if (!tracked) { tracked = true; window.VD.track("calculator_use"); }
    }));
    update();
  }
  window.VD = Object.assign(window.VD || {}, { calculator: { init, compute } });
})();

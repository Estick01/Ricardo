/**
 * Pinta módulos, casos, testimonios y FAQ desde js/content.js.
 * Todo el texto se inserta con textContent (sin HTML de terceros).
 */
(function () {
  "use strict";
  const C = window.VD_CONTENT;

  function h(tag, attrs, children) {
    const el = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === "text") el.textContent = v;
      else if (k === "style") el.setAttribute("style", v);
      else el.setAttribute(k, v);
    });
    (children || []).forEach((c) => c && el.appendChild(c));
    return el;
  }

  const delay = (i) => "--d:" + (i % 4) * 0.08 + "s";

  function renderModules(root) {
    C.modules.forEach((m) => root.appendChild(h("li", {}, [
      h("span", { class: "short-module-n", text: m.n, "aria-hidden": "true" }),
      h("span", { text: m.title }),
    ])));
  }

  function caseField(label, value) {
    const dd = value ? h("dd", { text: value }) : h("dd", {}, [h("span", { class: "skel", style: "width:" + (50 + Math.random() * 40) + "%" })]);
    return [h("dt", { text: label }), dd];
  }

  function sparkline() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 200 56");
    svg.setAttribute("class", "spark");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("preserveAspectRatio", "none");
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", "M0 48 C40 46 60 40 90 34 S150 18 200 8");
    svg.appendChild(path);
    return svg;
  }

  function renderCases(root) {
    const cases = C.cases.filter((c) => c.verified);
    root.closest("section").hidden = cases.length === 0;
    cases.forEach((c, i) => {
      const dl = h("dl", {}, [
        ...caseField("Situación inicial", c.before),
        ...caseField("Estrategia aplicada", c.strategy),
        ...caseField("Resultado comercial", c.result),
        ...caseField("Periodo medido", c.period),
      ]);
      root.appendChild(h("article", { class: "glass case", "data-reveal": "", style: delay(i) }, [
        h("div", { class: "case-head" }, [
          h("div", {}, [
            h("h3", { class: "h3", style: "margin:0", text: c.verified ? c.company : "Caso " + String(i + 1).padStart(2, "0") }),
            h("span", { class: "muted small", text: c.verified ? c.industry : "Industria por confirmar" }),
          ]),
          h("span", { class: "badge", text: c.verified ? "Verificado" : "En documentación" }),
        ]),
        c.verified ? null : sparkline(),
        dl,
        c.verified && c.quote ? h("p", { class: "muted", text: "“" + c.quote + "”" }) : null,
      ]));
    });
  }

  function renderTestimonials(root) {
    const testimonials = C.testimonials.filter((t) => t.verified);
    root.closest("section").hidden = testimonials.length === 0;
    testimonials.forEach((t, i) => {
      const media = h("div", { class: "ph" }, [
        h("button", { class: "vsl-play", "aria-label": "Testimonio en video (próximamente)", disabled: "" }, []),
        h("span", { class: "ph-label", text: t.verified ? t.role : "Testimonio en video" }),
      ]);
      media.querySelector("button").innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
      root.appendChild(h("article", { class: "glass testi", "data-reveal": "", style: delay(i) }, [
        media,
        h("div", { class: "testi-body" }, [
          h("strong", { text: t.verified ? t.name : "Próximamente" }),
          h("span", { class: "muted small", text: t.verified ? t.quote : "Espacio reservado para una experiencia real y verificable." }),
        ]),
      ]));
    });
  }

  function renderFaq(root) {
    C.faqs.forEach((f) => {
      const d = h("details", f.variant ? { "data-show": f.variant } : {}, [
        h("summary", { text: f.q }),
        h("div", { class: "faq-a" }, [h("div", {}, [h("p", { text: f.a })])]),
      ]);
      d.addEventListener("toggle", () => { if (d.open) window.VD.track("faq_open", { question: f.q }); });
      root.appendChild(d);
    });
  }

  window.VD = Object.assign(window.VD || {}, {
    render() {
      const map = { "[data-modules]": renderModules, "[data-cases]": renderCases, "[data-testimonials]": renderTestimonials, "[data-faq]": renderFaq };
      Object.entries(map).forEach(([sel, fn]) => {
        const root = document.querySelector(sel);
        if (!root) return;
        try { fn(root); } catch (err) { console.error("[VD] render error", sel, err); }
      });
    },
  });
})();

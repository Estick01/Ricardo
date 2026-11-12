/**
 * AGENDA COMERCIAL (variante B) · formulario por pasos + calendario.
 *   Paso 1 datos → Paso 2 negocio (+ autorización) → Paso 3 horario.
 * El calendario se ve bloqueado (desenfocado) hasta completar los pasos 1 y 2.
 *   - Con VD_CONFIG.links.calendarUrl de Calendly: se muestra Calendly dentro del panel,
 *     con nombre y correo ya llenos; la reserva queda hecha en Calendly.
 *   - Sin Calendly: calendario propio (VD_CONFIG.booking) para elegir un horario preferido;
 *     se envía todo a formEndpoint y el equipo confirma por WhatsApp.
 */
(function () {
  "use strict";
  const CFG = window.VD_CONFIG;
  const BK = CFG.booking || {};
  const STEP_NAMES = ["Tus datos", "Tu negocio", "Tu horario"];
  const FIELDS = { 1: ["name", "phone", "email"], 2: ["company", "industry", "revenue", "ads", "team"] };
  const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const track = (name, data) => { try { window.VD.track(name, data); } catch (_) { /* sin analítica */ } };
  const toast = (msg) => { try { window.VD.toast(msg); } catch (_) { /* sin toast */ } };

  function calendlyUrl() {
    const raw = CFG.links.calendarUrl;
    if (!raw) return null;
    try {
      const u = new URL(raw);
      return u.protocol === "https:" && (u.hostname === "calendly.com" || u.hostname.endsWith(".calendly.com")) ? u : null;
    } catch (_) { return null; }
  }

  /* ---------- Validación ---------- */
  function readForm(form) {
    const d = Object.fromEntries(new FormData(form).entries());
    const out = {};
    Object.keys(d).forEach((k) => { out[k] = String(d[k] || "").trim().slice(0, 160); });
    return out;
  }

  function validateStep(step, d, form) {
    const missing = (FIELDS[step] || []).some((k) => !d[k]);
    if (missing) return "Completa los campos marcados con *.";
    if (step === 1) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return "Revisa tu correo.";
      if (!/^[0-9 ()-]{6,18}$/.test(d.phone) || d.phone.replace(/\D/g, "").length < 6) return "Revisa tu número de WhatsApp.";
    }
    if (step === 2 && !form.consent.checked) return "Necesitamos tu autorización para el tratamiento de datos.";
    return "";
  }

  function payload(d, slot) {
    return Object.freeze({
      name: d.name, phone: d.country + " " + d.phone, email: d.email,
      company: d.company, industry: d.industry, revenue: d.revenue, ads: d.ads, team: d.team,
      slot: slot ? slot.label : "", slot_date: slot ? slot.iso : "", slot_time: slot ? slot.time : "",
      consent: true, consent_at: new Date().toISOString(),
    });
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

  /* ---------- Calendario propio ---------- */
  function createCalendar(root, onPick) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const addDays = (n) => { const x = new Date(today); x.setDate(x.getDate() + n); return x; };
    const min = addDays(BK.minDaysAhead ?? 1), max = addDays(BK.maxDaysAhead ?? 21);
    const weekdays = BK.weekdays || [1, 2, 3, 4, 5];
    const hours = BK.hours || [];
    let view = new Date(min.getFullYear(), min.getMonth(), 1);
    let picked = null;

    const daysEl = root.querySelector("[data-bk-days]");
    const slotsEl = root.querySelector("[data-bk-slots]");
    const monthEl = root.querySelector("[data-bk-month]");
    const prev = root.querySelector("[data-bk-prev]");
    const next = root.querySelector("[data-bk-nextm]");
    root.querySelector("[data-bk-tz]").textContent = BK.tzLabel || "";

    const isOpen = (d) => d >= min && d <= max && weekdays.includes(d.getDay());
    const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

    function renderSlots(day) {
      slotsEl.textContent = "";
      if (!day) return;
      hours.forEach((t) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = t;
        b.addEventListener("click", () => {
          slotsEl.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
          onPick({ iso: iso(day), time: t, label: DAYS[day.getDay()] + " " + day.getDate() + " de " + MONTHS[day.getMonth()] + " · " + t });
        });
        b.setAttribute("aria-pressed", "false");
        slotsEl.appendChild(b);
      });
    }

    function render() {
      monthEl.textContent = MONTHS[view.getMonth()] + " " + view.getFullYear();
      prev.disabled = view <= new Date(min.getFullYear(), min.getMonth(), 1);
      next.disabled = new Date(view.getFullYear(), view.getMonth() + 1, 1) > max;
      daysEl.textContent = "";
      const offset = (view.getDay() + 6) % 7; // lunes primero
      for (let i = 0; i < offset; i += 1) daysEl.appendChild(document.createElement("span"));
      const last = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      for (let n = 1; n <= last; n += 1) {
        const d = new Date(view.getFullYear(), view.getMonth(), n);
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = String(n);
        b.disabled = !isOpen(d);
        b.setAttribute("aria-label", DAYS[d.getDay()] + " " + n + " de " + MONTHS[d.getMonth()]);
        if (picked && iso(picked) === iso(d)) b.setAttribute("aria-pressed", "true");
        b.addEventListener("click", () => { picked = d; onPick(null); render(); renderSlots(d); });
        daysEl.appendChild(b);
      }
    }

    prev.addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); });
    next.addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); });
    render();
  }

  /* ---------- Calendly incrustado ---------- */
  function mountCalendly(box, base, d) {
    const u = new URL(base.href);
    u.searchParams.set("embed_type", "Inline");
    u.searchParams.set("embed_domain", location.hostname || "localhost");
    u.searchParams.set("hide_gdpr_banner", "1");
    u.searchParams.set("name", d.name);
    u.searchParams.set("email", d.email);
    box.textContent = "";
    const frame = document.createElement("iframe");
    frame.src = u.href;
    frame.title = "Agenda tu llamada";
    frame.loading = "lazy";
    box.appendChild(frame);
    box.hidden = false;
  }

  /* ---------- Arranque ---------- */
  function init() {
    const dlg = document.querySelector("[data-apply]");
    const form = dlg && dlg.querySelector("[data-bk-form]");
    if (!form) return;
    const cal = dlg.querySelector("[data-bk-cal]");
    const label = dlg.querySelector("[data-bk-label]");
    const err = dlg.querySelector("[data-bk-error]");
    const nextBtn = dlg.querySelector("[data-bk-next]");
    const backBtn = dlg.querySelector("[data-bk-back]");
    const pickEl = dlg.querySelector("[data-bk-pick]");
    const calendly = calendlyUrl();
    const total = STEP_NAMES.length;
    let step = 1, slot = null, started = false;

    const dur = dlg.querySelector("[data-bk-duration]");
    if (dur && Number.isFinite(BK.durationMin)) { dur.querySelector("span").textContent = BK.durationMin + " minutos"; dur.hidden = false; }

    function show(n) {
      step = n;
      dlg.querySelectorAll("[data-bk-step]").forEach((f) => { f.hidden = Number(f.dataset.bkStep) !== n; });
      label.textContent = "Paso " + n + " de " + total + " · " + STEP_NAMES[n - 1];
      backBtn.hidden = n === 1;
      cal.classList.toggle("is-locked", n < total);
      if (n === total && calendly) {
        nextBtn.hidden = true;
        pickEl.textContent = "Elige el día y la hora en el calendario. Recibirás la confirmación por correo.";
      } else {
        nextBtn.hidden = false;
        nextBtn.textContent = n === total ? "Confirmar llamada" : "Continuar";
        nextBtn.disabled = n === total && !slot;
      }
      err.textContent = "";
      const first = dlg.querySelector('[data-bk-step="' + n + '"] input, [data-bk-step="' + n + '"] select');
      if (first && n < total) first.focus({ preventScroll: true });
      if (n === total && window.innerWidth < 900) cal.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (!calendly) {
      createCalendar(cal, (picked) => {
        slot = picked;
        pickEl.textContent = picked ? "Tu llamada: " + picked.label : "Ahora elige la hora.";
        if (step === total) nextBtn.disabled = !picked;
      });
    }

    async function finish(d) {
      nextBtn.disabled = true;
      nextBtn.textContent = "Enviando…";
      try {
        await send(payload(d, slot));
        track("lead_submit", { industry: d.industry, revenue: d.revenue });
        dlg.querySelector("[data-bk-done-text]").textContent = "Pediste tu llamada para el " + slot.label + ". Te escribimos por WhatsApp para confirmarla.";
        dlg.querySelector(".bk-card").classList.add("is-done");
        dlg.querySelector("[data-bk-done]").hidden = false;
      } catch (ex) {
        console.error("[VD] envío de la agenda falló", ex);
        err.textContent = ex.message === "FORM_NOT_CONFIGURED"
          ? "Las solicitudes aún no están habilitadas. No se enviaron tus datos."
          : "No pudimos enviar tu solicitud. Intenta de nuevo en unos minutos.";
      } finally {
        nextBtn.disabled = false;
        nextBtn.textContent = "Confirmar llamada";
      }
    }

    form.addEventListener("input", () => { if (!started) { started = true; track("form_start"); } });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = readForm(form);
      if (d.website) return; // trampa para bots
      const problem = validateStep(step, d, form);
      if (problem) { err.textContent = problem; return; }
      if (step < total) {
        track("booking_step", { step });
        if (step === total - 1 && calendly) {
          mountCalendly(dlg.querySelector("[data-bk-embed]"), calendly, d);
          dlg.querySelector("[data-bk-cal-body]").hidden = true;
          if (CFG.links.formEndpoint) send(payload(d, null)).catch((ex) => console.error("[VD] registro previo falló", ex));
        }
        show(step + 1);
        return;
      }
      if (!slot) { err.textContent = "Elige el día y la hora de tu llamada."; return; }
      finish(d);
    });
    backBtn.addEventListener("click", () => show(Math.max(1, step - 1)));

    dlg.querySelectorAll("[data-apply-close]").forEach((b) => b.addEventListener("click", () => dlg.close()));
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

    window.addEventListener("message", (e) => {
      if (e.origin !== "https://calendly.com" || !e.data || e.data.event !== "calendly.event_scheduled") return;
      track("schedule_done");
      dlg.querySelector("[data-bk-done-text]").textContent = "Tu llamada quedó agendada. Revisa tu correo para ver la confirmación.";
      dlg.querySelector(".bk-card").classList.add("is-done");
      dlg.querySelector("[data-bk-done]").hidden = false;
    });

    show(1);
    if (CFG.links.calendarUrl && !calendly) toast("El enlace de agenda no es de Calendly; se usa la agenda propia.");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

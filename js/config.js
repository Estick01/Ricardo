/**
 * CONFIGURACIÓN CENTRAL — edita solo este archivo para conectar servicios.
 * Ningún enlace está inventado: todo lo vacío muestra un aviso en vez de fallar.
 *
 * Variante A/B: se elige con ?v=a o ?v=b en la URL. Si no viene, se usa `defaultVariant`.
 * La elección se recuerda en el navegador para que el visitante vea siempre la misma.
 */
window.VD_CONFIG = Object.freeze({
  defaultVariant: "b", // "a" = compra directa (Hotmart) · "b" = Private Edition (aplicación)
  randomSplit: false,  // true = reparte 50/50 a quien llegue sin ?v=

  links: Object.freeze({
    hotmartCheckoutUrl: "", // ej. checkout oficial de Hotmart
    calendarUrl: "https://calendly.com/ricardoarroyo964/reunion-vsl", // enlace del evento de Calendly (https://calendly.com/usuario/evento): se muestra dentro de la agenda con nombre y correo ya llenos
    formEndpoint: "",       // URL que recibe el formulario por POST (JSON) → CRM / Zapier / Make
    privacyPolicyUrl: "legal/privacidad.html",
  }),

  tracking: Object.freeze({
    gtmId: "",        // "GTM-XXXXXXX"
    ga4Id: "",        // "G-XXXXXXXXXX" (omitir si GA4 va dentro de GTM)
    metaPixelId: "",  // "123456789012345"
  }),

  vsl: Object.freeze({
    type: "file",     // "file" (mp4 propio) | "youtube" | "vimeo"
    src: "",          // ruta del mp4 o ID del video
    poster: "assets/img/vsl-poster.jpg", // miniatura personalizada (jpg/webp)
    captions: "",     // archivo .vtt de subtítulos (solo type "file")
  }),

  /* Oferta (modelo ATIDOA): "antes y después del precio".
     value  = valor de la oferta (se muestra tachado si hay price)
     price  = precio real de hoy (en priceCurrency); vacío = se presenta en la asesoría o la llamada */
  offer: Object.freeze({
    value: 250,
    valueCurrency: "USD",         // moneda del valor tachado (≈ $1.000.000 COP)
    price: 67,
    priceCurrency: "USD",         // moneda del precio de hoy
    liveWhen: "Viernes · 7:00 p. m.", // hora de Colombia
  }),

  /* Agenda propia: solo se usa mientras no haya enlace de Calendly.
     El visitante elige un horario preferido y el equipo lo confirma por WhatsApp. */
  booking: Object.freeze({
    durationMin: 15,                   // duración de la llamada (igual al evento de Calendly); null = no se muestra
    tzLabel: "Hora de Colombia (GMT-5)",
    weekdays: [1, 2, 3, 4, 5],         // 0 = domingo … 6 = sábado
    hours: Object.freeze(["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]), // confirmar con Ricardo
    minDaysAhead: 1,
    maxDaysAhead: 21,
  }),

  currency: Object.freeze({ code: "COP", locale: "es-CO" }),
});

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
    calendarUrl: "",        // ej. Calendly / Google Calendar / HubSpot Meetings
    formEndpoint: "",       // URL que recibe el formulario por POST (JSON) → CRM / Zapier / Make
    privacyPolicyUrl: "#privacidad",
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

  currency: Object.freeze({ code: "COP", locale: "es-CO" }),
});

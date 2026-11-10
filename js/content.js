/**
 * CONTENIDO ADMINISTRABLE — módulos, casos, testimonios y FAQ.
 * Casos y testimonios con `verified: false` se ocultan hasta tener información verificada.
 * Reemplázalos solo con información comprobada.
 */
window.VD_CONTENT = Object.freeze({
  modules: [
    { n: "01", title: "Fundamentos del sistema", text: "Cómo se conectan captación, atención y medición." },
    { n: "02", title: "Estrategia de captación", text: "A quién hablarle, dónde y con qué mensaje." },
    { n: "03", title: "Creación de anuncios", text: "Piezas y textos que generan conversaciones." },
    { n: "04", title: "Optimización de campañas", text: "Leer datos y decidir qué escalar o apagar." },
    { n: "05", title: "Atención, WhatsApp e IA", text: "Responder rápido y automatizar con inteligencia artificial para vender 24/7." },
    { n: "06", title: "Capacitación del equipo", text: "Identifica quién resta (0.8), quién cumple (1) y quién multiplica tu empresa (1.5)." },
    { n: "07", title: "Seguimiento y cierre", text: "Objeciones, seguimiento y técnicas de cierre." },
    { n: "08", title: "Medición y escalamiento", text: "CAC, conversión, ROAS y proyección de utilidad." },
  ],

  cases: [
    { verified: false, company: "", industry: "", before: "", strategy: "", result: "", period: "", quote: "" },
    { verified: false, company: "", industry: "", before: "", strategy: "", result: "", period: "", quote: "" },
    { verified: false, company: "", industry: "", before: "", strategy: "", result: "", period: "", quote: "" },
  ],

  testimonials: [
    { verified: false, name: "", role: "", videoSrc: "", poster: "", quote: "" },
    { verified: false, name: "", role: "", videoSrc: "", poster: "", quote: "" },
    { verified: false, name: "", role: "", videoSrc: "", poster: "", quote: "" },
  ],

  faqs: [
    { q: "¿Quién puede participar?", a: "Dueños y directivos de negocios en funcionamiento que quieren estructurar su captación y su atención comercial." },
    { q: "¿Necesito experiencia en publicidad?", a: "No. El programa parte de los fundamentos y avanza hasta la optimización de campañas." },
    { q: "¿Funciona para mi tipo de negocio?", a: "Está pensado para negocios que venden por conversación (WhatsApp, llamada o asesoría). Si tienes dudas, revisamos tu caso." },
    { q: "¿Necesito tener un equipo comercial?", a: "No es obligatorio. Si atiendes tú mismo, aprendes el proceso y a apoyarte en inteligencia artificial; si tienes equipo, aprendes a capacitarlo." },
    { q: "¿Cómo funciona la admisión?", a: "Completas tu perfil empresarial, participas en una evaluación comercial y, si encaja, recibes las instrucciones para ingresar.", variant: "b" },
    { q: "¿Cómo accedo al programa?", a: "Accedes desde el checkout oficial y recibes tus datos de ingreso por correo.", variant: "a" },
    { q: "¿Qué incluye el programa?", a: "Los módulos de captación, atención comercial y medición descritos en esta página. El detalle final se confirma antes de tu ingreso." },
    { q: "¿Cuánto debo invertir en publicidad?", a: "Depende de tu negocio y tus metas. Usa la calculadora como referencia y lo afinamos con tus números reales." },
    { q: "¿Qué opciones de pago existen?", a: "Las opciones de pago disponibles se muestran en el checkout oficial o se presentan durante la llamada con un asesor." },
  ],
});

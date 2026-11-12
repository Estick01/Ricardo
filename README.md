# Vendo Desaparece · Private Edition — Landing

Sitio estático (HTML + CSS + JS, sin dependencias). Se puede subir tal cual a Netlify, Vercel, Hostinger o cualquier hosting.

## Ver en local
```bash
python -m http.server 5510
```
Abrir `http://localhost:5510/?v=b` (Private Edition) o `?v=a` (compra directa).

## Dónde se edita cada cosa
| Qué | Archivo |
|---|---|
| Enlaces Hotmart, agenda, endpoint del formulario, IDs de GTM/GA4/Pixel, video VSL | `js/config.js` |
| Módulos, casos, testimonios, FAQ | `js/content.js` |
| Textos de secciones | `index.html` |
| Colores y tipografía | `css/styles.css` (`:root`) |

## Imágenes
Los bloques `.ph` son marcadores genéricos. Para usar una foto real, pon un `<img src="..." alt="...">` dentro del bloque.

## Pendiente antes de publicar
- Confirmar que "Grupo reducido" y la evaluación existen de verdad (variante B).
- Casos y testimonios: solo con información verificada (`verified: true`).
- Política de privacidad real (`privacyPolicyUrl`).
- Meta Conversion API: se implementa del lado servidor; usar el `event_id` que envía `VD.track()` para deduplicar con el Pixel.

## Eventos medidos
`variant_view`, `cta_click`, `checkout_click`, `apply_open`, `form_start`, `lead_submit`, `schedule_click`, `vsl_play`, `vsl_progress`, `calculator_use`, `faq_open`.


## Rediseño VSL — 9 de noviembre de 2026

- Apertura: promesa elegida por el cliente, video horizontal 16:9 y CTA.
- El video queda reservado, sin fuente, por petición del cliente. Para activarlo, configura `vsl.src` y `vsl.type` en `js/config.js`. El MP4 previo parece incompleto (sin átomo moov); reemplazar antes de conectarlo.
- Subtítulos opcionales y apagados por defecto; no hay lista de temas bajo el video.
- `css/experience.css` define el rediseño. `js/experience.js` dibuja una secuencia de partículas gobernada por scroll: atención, conversaciones y crecimiento. Es estática en móvil o con movimiento reducido.
- Casos y testimonios no verificados permanecen ocultos.
- El formulario nunca presenta éxito si falta el endpoint. Checkout, CRM, agenda y política real siguen pendientes en la configuración.
- La promesa de $10,000 es texto solicitado por el cliente; confirmar moneda, periodo y respaldo antes de usarla en campañas.

### Referencias de embudo
- ClickFunnels, VSL: https://www.clickfunnels.com/blog/how-to-create-a-video-sales-funnel/
- Kajabi, ejemplo de página de curso: https://templates.kajabi.com/products/online-course-sales-page
- Lusion, composición y movimiento: https://lusion.co/

Estas referencias orientan la estructura; no demuestran una tasa de conversión para esta página. Medir reproducciones, clics, solicitudes válidas y ventas cuando los servicios estén conectados.

- Segunda referencia visual aportada por el cliente: https://landonorris.com/ — nombre grande, protagonismo del retrato y contraste en la sección de Ricardo.

## Rediseño editorial (marca personal) — 10 de noviembre de 2026
- `css/editorial.css`: base, nav, hero, manifiesto y VSL.
- `css/editorial-sections.css`: método, galería, Ricardo, programa, calculadora, acceso, FAQ, cierre y pie.
- `js/editorial.js`: scroll suave (Lenis), líneas topográficas, cambio de tono oscuro/claro por sección (`data-tone-section`), parallax del retrato y de la galería, y filas de texto que se desplazan con el scroll. En móvil y con movimiento reducido el parallax queda quieto.
- `css/experience.css` y `js/experience.js` (partículas del diseño anterior) ya no se cargan.

### Animaciones y firma
- `js/animations.js` + `css/animations.css`: firma manuscrita que se escribe sola (`data-signature="Texto"`, opcional `data-sig-flourish` para la rúbrica), intro de entrada con la firma (una vez por sesión), títulos que suben palabra por palabra, fotos que se descubren con recorte, cifras que cuentan y botones magnéticos.
- La firma actual se genera con la tipografía Mrs Saint Delafield. Para usar la firma real de Ricardo, vectorizarla como SVG de un solo trazo y sustituir el texto.
- Con "movimiento reducido" activado no hay intro y todo aparece ya dibujado.

### Escena del video y clips (10 de noviembre de 2026)
- Después del hero hay una escena fija (`.ed-scene`, `data-scene`): el marco del video crece con el scroll, el texto gigante cruza por detrás y la firma se escribe encima. Luego va el manifiesto.
- `assets/video/obra.mp4` y `assets/video/set.mp4`: clips en bucle sin sonido para la galería, recortados de los videos del Drive del cliente (B-ROLLS/C7199 y EVENTOS 1/C7295). Los videos de EVENTOS 2 muestran a otra persona y no se usan.

### Hero (10 de noviembre de 2026)
- Retrato nuevo: `assets/cut/hero-retrato.webp` (1080×1320), sacado de un fotograma 1080p del Drive del cliente (APRENDE A HACER ANUNCIOS / C7301) y recortado con rembg (modelo BiRefNet-portrait). El anterior `assets/cut/hero.webp` se conserva sin uso.
- Se corrigió la regla `main > section > :not(.contour)`: ahora usa `:where()` para no anular el `position: absolute` del nombre, el retrato y el pie del hero.
- Captar, Cerrar y Ricardo también usan recortes nuevos en 1080p (`captar-retrato.webp`, `cerrar-retrato.webp`, `ricardo-retrato.webp`), de las tomas B-ROLLS/C7199, APRENDE A HACER ANUNCIOS/C7301 y VENDER POR REDES SOCIALES/C7601. Los archivos anteriores se conservan sin uso.

## Marca, ATIDOA y resultados — 10 de noviembre de 2026
- La marca es **Vende o Desaparece** (antes "Vendo Desaparece").
- Hero: el slogan "El sistema que te ayuda a facturar más de $10,000 con pauta publicitaria." es el titular principal; el retrato queda a la derecha (en pantallas de hasta 1100 px, debajo del texto).
- Estructura ATIDOA: Atención (hero) · Transformación (`#resultados`, antes/después de clientes + empresas aliadas) · Interés y Deseo (`#oferta`, valor, precio y asesoría en vivo) · Objeciones (`#para-quien` + FAQ) · Acción (CTA por variante: llamada o checkout).
- Calculadora (`js/calculator.js`): mismo modelo que la hoja "PROYECCIÓN VENTAS" — ventas = meta ÷ ticket, presupuesto = ventas × CPA, ROAS = meta ÷ presupuesto, plan semanal (÷4) y diario (÷ días).
- Oferta (`js/config.js` → `offer`): `value` = valor de la oferta, `price` = precio real (si se llena, el valor aparece tachado), `liveWhen` = día y hora de la asesoría en vivo. `js/offer.js` los pinta.
- Casos publicados con datos del cliente: Dr. Felipe Zambrano (octubre 2026) y Dra. Andrea Mora (reporte semanal). Confirmar autorización de cada cliente para mostrar su nombre y cifras.
- Pendiente: entrevista de La Cava del Cerdo (Drive bloqueó la descarga por cuota), cifras de B Nova, precio final y hora exacta de la asesoría.
- Fotos profesionales del Drive: `assets/gallery/profesional.webp` (en la galería) y `assets/gallery/campo.webp` (sin uso por ahora).

## Caché en producción
GitHub Pages sirve CSS y JS con `Cache-Control: max-age=600`. Para que nadie mezcle un HTML nuevo con un JS viejo, `index.html` carga cada archivo con `?v=AAAAMMDDx`. **En cada despliegue que cambie CSS o JS, sube ese valor** (buscar y reemplazar `?v=` en `index.html`).


## Versión corta — 11 de noviembre de 2026
Esta revisión sustituye la estructura y escena de video descritas arriba.
- Hero conservado; video horizontal estático, sin presentación por scroll ni firma superpuesta.
- Nueve secciones, resultados con inversión/ventas, empresas y temario desplegable de 11 módulos.
- Andrea Mora: inversión COP 950.000; ventas COP 18.272.700, confirmadas por el cliente.
- Strabe: ventas totales Shopify COP 2.897.674.426 (01/09/2023–10/11/2026), con captura original desplegable.
- Calculadora: inversión mínima/inicial COP 1.000.000; ventas estimadas = floor(inversión/CPA) × ticket. El importe principal es facturación, no utilidad.
- `css/compact.css` contiene la composición actual; `js/demos.js` reproduce clips visibles y respeta movimiento reducido y pausas manuales.
- `assets/video/strabe-anuncio.mp4`: anuncio real descargado de la biblioteca Meta de Strabe (page 237189060987963), comprimido para web.
- `assets/video/whatsapp-demo.mp4`: demostración ilustrativa creada localmente, identificada como simulación en la página. Guion/render en `.claude/revision/render_chat.py`.
- Marquee sin pausa al pasar el cursor; retiradas Tienda de Muebles y Tienda Túquerres.
- Sigue pendiente configurar el VSL completo, checkout, agenda, endpoint del formulario y política real en `js/config.js`. El video adjunto de WhatsApp es una grabación del diseño anterior, no el VSL.
- Validación: vista escritorio 1440 px y móvil 390 px, calculadora con teclado, reproducción de ambos clips, temario y apertura/cierre del formulario.

## Hero de la referencia y 11 pasos — 12 de noviembre de 2026
- Hero según la referencia aprobada por el cliente: slogan centrado, tarjeta de video (marca + retrato) y un solo CTA (`css/hero.css`). La intro con la firma vuelve a mostrarse en la primera visita de la sesión.
- Orden: hero → resultados → método → calculadora → Ricardo → 11 pasos → oferta → FAQ → cierre.
- "11 pasos. Un sistema.": lista desde `VD_CONTENT.modules` con gráfica de partículas que cambia de forma por fase (`js/steps.js`, `css/steps.css`). Las descripciones de cada módulo son provisionales: confirmarlas con Ricardo.
- Strabe: ventas de Shopify en una fila a todo el ancho, sin enlace al reporte. Caso del Dr. Felipe sin la nota de pagos pendientes.
- Cierre con `assets/gallery/final.webp` a todo el ancho (capa desenfocada + foto nítida). Si llega una versión de mayor resolución, reemplazar ese archivo.

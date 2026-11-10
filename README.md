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

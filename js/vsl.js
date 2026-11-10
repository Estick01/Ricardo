/** Optional VSL: the reserved landscape section works before a source is supplied. */
(function () {
  "use strict";
  const cfg = window.VD_CONFIG.vsl;
  function buildEmbed() {
    let url;
    if (cfg.type === "youtube" && /^[A-Za-z0-9_-]{4,40}$/.test(cfg.src)) {
      url = "https://www.youtube-nocookie.com/embed/" + cfg.src + "?autoplay=1&rel=0";
    } else if (cfg.type === "vimeo" && /^\d{5,12}$/.test(cfg.src)) {
      url = "https://player.vimeo.com/video/" + cfg.src + "?autoplay=1";
    }
    if (!url) return null;
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.title = "Presentación de Vende o Desaparece por Ricardo Arroyo";
    iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true;
    return iframe;
  }
  function buildVideo() {
    const video = document.createElement("video");
    video.src = cfg.src;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", "Presentación del programa por Ricardo Arroyo");
    if (cfg.poster) video.poster = cfg.poster;
    if (cfg.captions) {
      const track = document.createElement("track");
      Object.assign(track, { kind: "subtitles", srclang: "es", label: "Español", src: cfg.captions });
      video.appendChild(track); // Optional, never forced on by default.
    }
    const sent = new Set();
    video.addEventListener("timeupdate", () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      const percent = video.currentTime / video.duration * 100;
      [25, 50, 75, 100].forEach((mark) => {
        if (percent >= mark - .5 && !sent.has(mark)) {
          sent.add(mark);
          window.VD.track("vsl_progress", { percent: mark });
        }
      });
    });
    video.addEventListener("playing", () => window.VD.track("vsl_play", { type: cfg.type }), { once: true });
    return video;
  }
  function init() {
    const root = document.querySelector("[data-vsl]");
    if (!root) return;
    const poster = root.querySelector("[data-vsl-poster]");
    const button = root.querySelector("[data-vsl-play]");
    const meta = root.querySelector("[data-vsl-meta]");
    const error = root.querySelector("[data-vsl-error]");
    if (!cfg.src) return;
    button.disabled = false;
    button.setAttribute("aria-label", "Reproducir presentación de Ricardo");
    meta.textContent = "Ver el método";
    button.addEventListener("click", () => {
      const media = cfg.type === "file" ? buildVideo() : buildEmbed();
      if (!media) { window.VD.toast("El video no está disponible en este momento."); return; }
      if (error) { error.hidden = true; error.textContent = ""; }
      poster.hidden = true;
      root.appendChild(media);
      const restore = () => {
        media.remove();
        poster.hidden = false;
        if (error) { error.textContent = "No se pudo cargar el video. Puedes volver a intentarlo."; error.hidden = false; }
        button.focus();
      };
      if (media.tagName === "VIDEO") {
        media.addEventListener("error", restore, { once: true });
        media.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
      } else window.VD.track("vsl_play", { type: cfg.type });
    });
  }
  window.VD = Object.assign(window.VD || {}, { vsl: { init } });
})();

/* Media demos play only while visible and respect reduced motion; tap toggles playback. */
(function () {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const clips = [...document.querySelectorAll('video[data-demo-video]')];
  const visible = new Set();
  const manuallyPaused = new WeakSet();
  const automatedPause = new WeakSet();
  const pause = v => { if (!v.paused) { automatedPause.add(v); v.pause(); } };
  const resume = v => { if (!reduce.matches && !document.hidden && visible.has(v) && !manuallyPaused.has(v)) v.play().catch(() => {}); };
  clips.forEach(v => {
    v.addEventListener('pause', () => { if (automatedPause.has(v)) automatedPause.delete(v); else manuallyPaused.add(v); });
    v.addEventListener('play', () => manuallyPaused.delete(v));
  });
  /* Sin controles nativos: tocar el video pausa o reanuda; el botón de sonido activa el audio. */
  clips.forEach(v => v.addEventListener('click', () => { if (v.paused) v.play().catch(() => {}); else v.pause(); }));
  document.querySelectorAll('[data-video-sound]').forEach(btn => {
    const v = btn.parentElement.querySelector('video');
    if (!v) return;
    btn.addEventListener('click', () => {
      v.muted = !v.muted;
      btn.setAttribute('aria-pressed', String(!v.muted));
      btn.setAttribute('aria-label', v.muted ? 'Activar sonido' : 'Silenciar');
      if (!v.muted && v.paused) v.play().catch(() => {});
    });
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { visible.add(e.target); resume(e.target); }
      else { visible.delete(e.target); pause(e.target); }
    }), { threshold: .3 });
    clips.forEach(v => io.observe(v));
  }
  document.addEventListener('visibilitychange', () => clips.forEach(v => document.hidden ? pause(v) : resume(v)));
  reduce.addEventListener('change', () => clips.forEach(v => reduce.matches ? pause(v) : resume(v)));
})();

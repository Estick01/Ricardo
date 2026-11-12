/* Media demos play only while visible, respect reduced motion and keep native controls. */
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

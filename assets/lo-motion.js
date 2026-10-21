// LEADOUT motion: scroll reveal for [data-lo-reveal] and hover zoom. Off for reduced motion.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  root.classList.add('lo-zoom-ready');

  if (!('IntersectionObserver' in window)) return;
  root.classList.add('lo-reveal-ready');
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' }
  );
  const observe = (scope) => scope.querySelectorAll('[data-lo-reveal]:not(.is-visible)').forEach((el) => observer.observe(el));
  observe(document);
  // Re-scan when sections are added or reloaded in the theme editor
  document.addEventListener('shopify:section:load', (event) => observe(event.target));
})();

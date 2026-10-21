// LEADOUT tabs: accessible tablist with arrow-key navigation.
(() => {
  if (window.loTabs) return;
  window.loTabs = true;
  const init = (root) => {
    if (root.dataset.loReady) return;
    root.dataset.loReady = 'true';
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      for (const t of tabs) {
        const active = t === tab;
        t.setAttribute('aria-selected', active);
        t.tabIndex = active ? 0 : -1;
        root.querySelector(`#${t.getAttribute('aria-controls')}`).hidden = !active;
      }
      if (focus) tab.focus();
    };
    root.addEventListener('click', (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) select(tab);
    });
    root.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      if (e.key === 'ArrowRight') select(tabs[(i + 1) % tabs.length], true);
      if (e.key === 'ArrowLeft') select(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  };
  const scan = (scope = document) => scope.querySelectorAll('[data-lo-tabs]').forEach(init);
  scan();
  document.addEventListener('shopify:section:load', (e) => scan(e.target));
  // Variant changes re-render the product section; re-scan once per frame.
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scan();
    });
  }).observe(document.body, { childList: true, subtree: true });
})();

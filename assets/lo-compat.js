// LEADOUT compatibility: remembers the shopper's device + handlebar and filters [data-lo-devices] cards.
(() => {
  if (window.loCompat) return;
  window.loCompat = true;
  const KEY = 'lo-setup';

  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch {
      return {};
    }
  };
  const write = (setup) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(setup));
    } catch {
      // Storage unavailable (private mode): the filter still works for this page view.
    }
    document.dispatchEvent(new CustomEvent('lo:setup-change', { detail: setup }));
  };

  const fits = (el, setup) => {
    const devices = (el.dataset.loDevices || '').split(' ');
    const bars = (el.dataset.loBars || '').split(' ');
    return (!setup.device || devices.includes(setup.device)) && (!setup.bar || bars.includes(setup.bar));
  };

  const initFinder = (finder) => {
    if (finder.dataset.loReady) return;
    finder.dataset.loReady = 'true';
    const device = finder.querySelector('[data-lo-device]');
    const bar = finder.querySelector('[data-lo-bar]');
    const status = finder.querySelector('[data-lo-status]');
    // Own results grid, or the collection grid on the same page (current page of products).
    const results = finder.querySelector('[data-lo-results]');
    const cards = () =>
      results
        ? [...results.querySelectorAll('[data-lo-devices]')]
        : [...document.querySelectorAll('.product-grid__item[data-lo-devices]')];

    const apply = () => {
      const setup = { device: device.value, bar: bar.value };
      let count = 0;
      for (const card of cards()) {
        const match = fits(card, setup);
        card.hidden = !match;
        if (match) count++;
      }
      if (!setup.device && !setup.bar) status.textContent = '';
      else status.textContent = count ? status.dataset.template.replace('[count]', count) : status.dataset.empty;
      return setup;
    };

    const saved = read();
    if (saved.device && device.querySelector(`option[value="${CSS.escape(saved.device)}"]`)) device.value = saved.device;
    if (saved.bar && bar.querySelector(`option[value="${CSS.escape(saved.bar)}"]`)) bar.value = saved.bar;
    apply();

    finder.addEventListener('change', () => write(apply()));
    finder.querySelector('[data-lo-reset]')?.addEventListener('click', () => {
      device.value = '';
      bar.value = '';
      write(apply());
    });
  };

  // Product page badge: [data-lo-fits] with data-lo-devices / data-lo-bars
  const updateBadges = () => {
    const setup = read();
    document.querySelectorAll('[data-lo-fits]').forEach((badge) => {
      const known = setup.device || setup.bar;
      badge.dataset.state = !known ? 'unknown' : fits(badge, setup) ? 'yes' : 'no';
    });
  };

  const init = (scope = document) => {
    scope.querySelectorAll('[data-lo-finder]').forEach(initFinder);
    updateBadges();
  };

  init();
  document.addEventListener('lo:setup-change', updateBadges);
  document.addEventListener('shopify:section:load', (event) => init(event.target));

  // Variant changes re-render the product section; refresh badges once per frame.
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      document.querySelectorAll('[data-lo-fits]:not([data-state="yes"]):not([data-state="no"])').length && updateBadges();
    });
  }).observe(document.body, { childList: true, subtree: true });
})();

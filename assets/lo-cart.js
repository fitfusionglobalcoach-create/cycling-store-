// LEADOUT add-to-cart for bundle and upsell buttons: [data-lo-add-items="variantId,variantId"].
// Uses the same cart event as Horizon so the cart drawer and bubble refresh and the drawer opens.
import { CartLinesUpdateEvent } from '@shopify/events';

if (!window.loCart) {
  window.loCart = true;

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-lo-add-items]');
    if (!button || button.disabled) return;
    const ids = button.dataset.loAddItems.split(',').filter(Boolean);
    if (!ids.length) return;

    button.disabled = true;
    const sections = [...document.querySelectorAll('cart-items-component')]
      .map((el) => el.dataset.sectionId)
      .filter(Boolean)
      .join(',');
    const deferred = CartLinesUpdateEvent.createPromise();
    button.dispatchEvent(
      new CartLinesUpdateEvent({
        action: 'add',
        context: 'product',
        lines: ids.map((id) => ({ merchandiseId: id, quantity: 1 })),
        promise: deferred.promise,
      })
    );

    try {
      const added = await fetch(`${window.Shopify?.routes?.root || '/'}cart/add.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: ids.map((id) => ({ id: Number(id), quantity: 1 })), sections }),
      }).then((r) => r.json());
      if (added.status) throw new Error(added.description || added.message);

      const cart = await fetch(`${window.Shopify?.routes?.root || '/'}cart.js`).then((r) => r.json());
      deferred.resolve({
        cart: CartLinesUpdateEvent.createCartFromAjaxResponse(cart),
        detail: {
          items: cart.items,
          source: 'lo-cart',
          itemCount: ids.length,
          sections: added.sections,
          didError: false,
        },
      });
    } catch (error) {
      deferred.resolve({ detail: { didError: true } });
      console.error('[LEADOUT] add to cart failed', error);
    } finally {
      button.disabled = false;
    }
  });
}

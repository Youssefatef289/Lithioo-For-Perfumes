const CART_ICON_SELECTOR = '[data-cart-icon]';
const CART_ICON_ID = 'header-cart-icon';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const bumpCartIcon = (cartEl) => {
  cartEl.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.25)' },
      { transform: 'scale(1)' },
    ],
    { duration: 360, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
  );
};

/**
 * Animates a clone of the given image element flying into the header cart icon.
 * @param {HTMLImageElement|null} sourceImg
 */
export const flyToCart = (sourceImg) => {
  if (typeof document === 'undefined') return;
  const cartCandidates = Array.from(document.querySelectorAll(CART_ICON_SELECTOR));
  const cartEl =
    cartCandidates.find((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }) || document.getElementById(CART_ICON_ID);
  if (!cartEl) return;

  if (!sourceImg || prefersReducedMotion()) {
    bumpCartIcon(cartEl);
    return;
  }

  const imgRect = sourceImg.getBoundingClientRect();
  const cartRect = cartEl.getBoundingClientRect();
  if (imgRect.width === 0 || imgRect.height === 0) {
    bumpCartIcon(cartEl);
    return;
  }

  const clone = sourceImg.cloneNode(true);
  clone.className = '';
  clone.removeAttribute('loading');
  const startSize = Math.min(imgRect.width, imgRect.height, 140);

  Object.assign(clone.style, {
    opacity: '1',
    position: 'fixed',
    left: `${imgRect.left + imgRect.width / 2 - startSize / 2}px`,
    top: `${imgRect.top + imgRect.height / 2 - startSize / 2}px`,
    width: `${startSize}px`,
    height: `${startSize}px`,
    objectFit: 'contain',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.85)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.22)',
    padding: '6px',
    zIndex: '2000',
    pointerEvents: 'none',
    margin: '0',
  });

  document.body.appendChild(clone);

  const deltaX = cartRect.left + cartRect.width / 2 - (imgRect.left + imgRect.width / 2);
  const deltaY = cartRect.top + cartRect.height / 2 - (imgRect.top + imgRect.height / 2);

  const animation = clone.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0 },
      {
        transform: `translate(${deltaX * 0.5}px, ${deltaY * 0.5 - 60}px) scale(0.7)`,
        opacity: 0.95,
        offset: 0.55,
      },
      {
        transform: `translate(${deltaX}px, ${deltaY}px) scale(0.12)`,
        opacity: 0.3,
        offset: 1,
      },
    ],
    { duration: 750, easing: 'cubic-bezier(0.5, 0, 0.75, 0.4)' }
  );

  animation.onfinish = () => {
    clone.remove();
    bumpCartIcon(cartEl);
  };
  animation.oncancel = () => clone.remove();
};

export default flyToCart;

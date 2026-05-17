import React, { useEffect } from 'react';
import { FiCheck } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';

const CartToast = () => {
  const { cartNotice, clearCartNotice } = useCart();

  useEffect(() => {
    if (!cartNotice) return undefined;
    const timer = window.setTimeout(() => clearCartNotice(), 2800);
    return () => window.clearTimeout(timer);
  }, [cartNotice, clearCartNotice]);

  if (!cartNotice) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-6 left-1/2 z-[1005] -translate-x-1/2 px-4"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-neutral-200/80 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 shadow-lg animate-toast-in dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white">
          <FiCheck className="h-4 w-4" />
        </span>
        {cartNotice}
      </div>
    </div>
  );
};

export default CartToast;

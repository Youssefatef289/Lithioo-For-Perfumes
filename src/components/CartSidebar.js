import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiShoppingCart, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import OrderWhatsAppButton from './OrderWhatsAppButton';
import { formatEGP } from '../utils/price';
import { localizeProduct } from '../utils/localizeProduct';
import { getSizeById } from '../data/sizes';

const CartSidebar = () => {
  const { t, language } = useLanguage();
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    clearCart,
  } = useCart();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');

  const handleCheckout = () => {
    navigate('/cart');
    setIsCartOpen(false);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setIsCartOpen(false);
  };

  const stepperBtn =
    'flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 transition hover:bg-brand hover:text-white';

  const panelTranslate = isCartOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full';
  const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div
        role="presentation"
        className={`fixed inset-0 z-[1001] bg-neutral-950/40 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      <aside
        className={`fixed top-0 z-[1002] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out end-0 dark:bg-neutral-900 ${panelTranslate}`}
        aria-label={t.cart.title}
      >
        <div className="flex shrink-0 items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold uppercase tracking-[0.15em] text-neutral-900 dark:text-white">
              {t.cart.title}
            </h2>
            {itemsCount > 0 && (
              <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-brand/10 px-1.5 text-xs font-bold text-brand">
                {itemsCount}
              </span>
            )}
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
            onClick={() => setIsCartOpen(false)}
            aria-label={t.cart.close}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {cartItems.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <FiShoppingCart className="h-9 w-9 text-neutral-400" />
              </div>
              <p className="text-neutral-500 dark:text-neutral-400">{t.cart.empty}</p>
              <button
                type="button"
                className="rounded-full bg-brand px-7 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-brand-dark"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/products');
                }}
              >
                {t.cart.continueShopping}
              </button>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 divide-y divide-neutral-100 overflow-y-auto overscroll-contain px-5 dark:divide-neutral-800">
                {cartItems.map((item) => {
                  const display = localizeProduct(item, language);
                  const sizeLabel = item.size ? getSizeById(item.size, language).label : item.sizeLabel;
                  return (
                  <div key={item.cartKey} className="flex gap-3 py-4">
                    <button
                      type="button"
                      className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-50 p-1.5 transition hover:opacity-90 dark:bg-neutral-800"
                      onClick={() => handleProductClick(item.id)}
                    >
                      <img src={item.image} alt="" className="h-full w-full object-contain" />
                    </button>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          className="line-clamp-2 text-start text-sm font-semibold text-neutral-900 transition hover:text-brand dark:text-neutral-100"
                          onClick={() => handleProductClick(item.id)}
                        >
                          {display.name}
                        </button>
                        <button
                          type="button"
                          className="shrink-0 text-neutral-400 transition hover:text-red-500"
                          onClick={() => removeFromCart(item.cartKey)}
                          aria-label={t.cart.removeItem}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {display.brand && (
                        <p className="truncate text-xs text-neutral-400 dark:text-neutral-500">{display.brand}</p>
                      )}
                      {sizeLabel && (
                        <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">{sizeLabel}</p>
                      )}
                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <div className="flex items-center gap-1 rounded-full bg-neutral-100 p-0.5 dark:bg-neutral-800">
                          <button
                            type="button"
                            className={stepperBtn}
                            onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                            aria-label={t.cart.decreaseQty}
                          >
                            <FiMinus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-[1.5rem] text-center text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className={stepperBtn}
                            onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                            aria-label={t.cart.increaseQty}
                          >
                            <FiPlus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-brand" dir="ltr">
                          {formatEGP(item.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className="shrink-0 border-t border-neutral-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-neutral-800">
                <details className="mb-3 group">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-neutral-600 transition hover:text-brand dark:text-neutral-300">
                    <span>{t.cart.notesLabel}</span>
                    <FiPlus className="h-4 w-4 transition group-open:rotate-45" />
                  </summary>
                  <textarea
                    id="cart-notes-sidebar"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.cart.notesPlaceholder}
                    className="mt-2 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </details>

                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    {t.cart.total}
                  </span>
                  <span className="text-xl font-bold text-neutral-900 dark:text-white" dir="ltr">
                    {formatEGP(getCartTotal())}
                  </span>
                </div>

                <OrderWhatsAppButton
                  className="mb-2"
                  notes={notes}
                  onOrdered={() => {
                    setNotes('');
                    setIsCartOpen(false);
                  }}
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-full border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    onClick={clearCart}
                  >
                    {t.cart.clearCart}
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-full bg-neutral-900 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                    onClick={handleCheckout}
                  >
                    {t.cart.viewCart}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default CartSidebar;

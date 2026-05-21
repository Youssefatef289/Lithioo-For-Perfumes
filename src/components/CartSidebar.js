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

  const btnIcon =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:border-brand hover:text-brand dark:border-neutral-600 dark:text-neutral-300';

  const panelTranslate = isCartOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full';

  return (
    <>
      <div
        role="presentation"
        className={`fixed inset-0 z-[1001] bg-black/50 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      <aside
        className={`fixed top-0 z-[1002] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-neutral-900 end-0 ${panelTranslate}`}
        aria-label={t.cart.title}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
          <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-800 dark:text-white">
            <FiShoppingCart className="shrink-0 text-brand" />
            <span className="truncate">{t.cart.title}</span>
          </h2>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            onClick={() => setIsCartOpen(false)}
            aria-label={t.cart.close}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {cartItems.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
              <FiShoppingCart className="h-16 w-16 text-neutral-300 dark:text-neutral-600" />
              <p className="text-neutral-600 dark:text-neutral-400">{t.cart.empty}</p>
              <button
                type="button"
                className="rounded-lg bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
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
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                {cartItems.map((item) => {
                  const display = localizeProduct(item, language);
                  const sizeLabel = item.size ? getSizeById(item.size, language).label : item.sizeLabel;
                  return (
                  <div
                    key={item.cartKey}
                    className="mb-4 flex gap-3 rounded-xl border border-neutral-100 p-3 dark:border-neutral-700 dark:bg-neutral-800/50"
                  >
                    <button
                      type="button"
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-50 dark:bg-neutral-800"
                      onClick={() => handleProductClick(item.id)}
                    >
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        className="line-clamp-2 text-start text-sm font-semibold text-neutral-800 hover:text-brand dark:text-neutral-100"
                        onClick={() => handleProductClick(item.id)}
                      >
                        {display.name}
                      </button>
                      {display.brand && (
                        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{display.brand}</p>
                      )}
                      {sizeLabel && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {sizeLabel}
                        </p>
                      )}
                      <p className="text-sm font-bold text-brand">{formatEGP(item.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-600">
                          <button
                            type="button"
                            className={btnIcon}
                            onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                            aria-label={t.cart.decreaseQty}
                          >
                            <FiMinus className="h-4 w-4" />
                          </button>
                          <span className="min-w-[2rem] text-center text-sm font-medium dark:text-neutral-200">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className={btnIcon}
                            onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                            aria-label={t.cart.increaseQty}
                          >
                            <FiPlus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="ms-auto shrink-0 text-red-500 transition hover:opacity-80"
                          onClick={() => removeFromCart(item.cartKey)}
                          aria-label={t.cart.removeItem}
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className="shrink-0 border-t border-neutral-200 bg-neutral-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-neutral-700 dark:bg-neutral-900">
                <div className="mb-3">
                  <label
                    htmlFor="cart-notes-sidebar"
                    className="mb-1 block text-sm font-semibold text-neutral-800 dark:text-neutral-100"
                  >
                    {t.cart.notesLabel}
                  </label>
                  <textarea
                    id="cart-notes-sidebar"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.cart.notesPlaceholder}
                    className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                  />
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {t.cart.notesHint}
                  </p>
                </div>
                <div className="mb-4 flex items-center justify-between gap-3 text-lg font-bold text-neutral-800 dark:text-white">
                  <span>{t.cart.total}</span>
                  <span className="text-brand">{formatEGP(getCartTotal())}</span>
                </div>
                <OrderWhatsAppButton
                  className="mb-2"
                  notes={notes}
                  onOrdered={() => {
                    setNotes('');
                    setIsCartOpen(false);
                  }}
                />
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className="w-full rounded-lg border border-neutral-300 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    onClick={clearCart}
                  >
                    {t.cart.clearCart}
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiCheckSquare, FiSquare } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import CheckoutModal from '../components/CheckoutModal';
import OrderWhatsAppButton from '../components/OrderWhatsAppButton';
import { formatEGP, parsePrice } from '../utils/price';
import { localizeProduct } from '../utils/localizeProduct';
import { getSizeById } from '../data/sizes';

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    removeItemsFromCart,
    updateQuantity,
    clearCart,
  } = useCart();
  const { t, language, isRtl } = useLanguage();
  const navigate = useNavigate();
  const { cart, cartPage } = t;

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(
    () => new Set(cartItems.map((i) => i.cartKey))
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sync selected keys with existing cart items
  useEffect(() => {
    setSelectedKeys((prev) => {
      const existing = new Set(cartItems.map((i) => i.cartKey));
      const next = new Set([...prev].filter((k) => existing.has(k)));
      // If nothing was selected before and items now exist, select all by default
      if (prev.size === 0 && cartItems.length > 0) {
        return new Set(cartItems.map((i) => i.cartKey));
      }
      return next;
    });
  }, [cartItems]);

  const handleQuantityChange = (cartKey, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartKey);
    } else {
      updateQuantity(cartKey, newQuantity);
    }
  };

  const toggleSelectItem = (cartKey) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(cartKey)) next.delete(cartKey);
      else next.add(cartKey);
      return next;
    });
  };

  const allSelected = cartItems.length > 0 && selectedKeys.size === cartItems.length;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(cartItems.map((i) => i.cartKey)));
    }
  };

  // Total is calculated ONLY for selected items
  const selectedItems = cartItems.filter((item) => selectedKeys.has(item.cartKey));
  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0
  );

  const selectedCount = selectedItems.reduce((n, i) => n + i.quantity, 0);
  const totalItemCount = cartItems.reduce((n, i) => n + i.quantity, 0);
  const itemsLabel =
    totalItemCount === 1
      ? cartPage.itemsOne
      : cartPage.itemsMany.replace('{count}', String(totalItemCount));

  const qtyBtn =
    'flex h-8 w-8 items-center justify-center rounded-none border border-neutral-300 text-neutral-700 transition hover:border-brand dark:border-neutral-600 dark:text-neutral-200';

  if (cartItems.length === 0) {
    return (
      <main className="page-main min-h-screen w-full bg-white px-4 py-16 pt-24 dark:bg-neutral-950 sm:pt-28">
        <div className="section-inner flex max-w-lg flex-col items-center border-2 border-dashed border-neutral-200 bg-transparent px-6 py-16 text-center dark:border-neutral-700">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-none bg-brand/15 text-brand">
            <FiShoppingCart className="h-10 w-10" />
          </div>
          <h2 className="heading-section !text-2xl">{cart.empty}</h2>
          <p className="text-muted-section mt-2">{cartPage.emptyHint}</p>
          <button
            type="button"
            className="btn-primary mt-8 rounded-none shadow-none"
            onClick={() => navigate('/products')}
          >
            {cart.continueShopping}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-main min-h-screen w-full bg-white px-4 py-8 pt-24 dark:bg-neutral-950 sm:px-6 sm:py-12 md:pt-28 lg:px-8">
      <div className="section-inner max-w-6xl">
        <div className="mb-8 flex flex-col gap-2">

          <h1 className="heading-section">{cart.title}</h1>
          <p className="text-muted-section !mt-0">{itemsLabel}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items List */}
          <div className="space-y-4 lg:col-span-2">
            {/* Select All Bar */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="flex items-center gap-2.5 text-sm font-semibold text-neutral-800 transition hover:text-brand dark:text-neutral-200"
              >
                {allSelected ? (
                  <FiCheckSquare className="h-5 w-5 text-brand" />
                ) : (
                  <FiSquare className="h-5 w-5 text-neutral-400" />
                )}
                <span>
                  {isRtl ? 'تحديد الكل' : 'Select All'} ({selectedKeys.size}/{cartItems.length})
                </span>
              </button>

              {selectedKeys.size > 0 && selectedKeys.size < cartItems.length && (
                <button
                  type="button"
                  onClick={() => setSelectedKeys(new Set())}
                  className="text-xs font-medium text-neutral-500 hover:text-brand dark:text-neutral-400"
                >
                  {isRtl ? 'إلغاء التحديد' : 'Deselect All'}
                </button>
              )}
            </div>

            {cartItems.map((item) => {
              const display = localizeProduct(item, language);
              const sizeLabel = item.size ? getSizeById(item.size, language).label : item.sizeLabel;
              const isSelected = selectedKeys.has(item.cartKey);

              return (
                <div
                  key={item.cartKey}
                  className={`flex flex-col gap-4 border p-4 transition-colors sm:flex-row sm:items-center ${
                    isSelected
                      ? 'border-brand/40 bg-brand/[0.02] dark:border-brand/40 dark:bg-brand/[0.04]'
                      : 'border-neutral-200 bg-transparent opacity-70 dark:border-neutral-800'
                  }`}
                >
                  {/* Item Selection Checkbox */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSelectItem(item.cartKey)}
                      aria-label={isSelected ? 'Deselect item' : 'Select item'}
                      className="text-neutral-400 transition hover:text-brand"
                    >
                      {isSelected ? (
                        <FiCheckSquare className="h-5 w-5 text-brand" />
                      ) : (
                        <FiSquare className="h-5 w-5" />
                      )}
                    </button>
                    <div className="h-24 w-24 shrink-0 overflow-hidden bg-transparent sm:h-20 sm:w-20">
                      <img
                        src={item.image}
                        alt={display.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      {display.name}
                    </h3>
                    {display.brand && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {display.brand}
                      </p>
                    )}
                    {sizeLabel && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {sizeLabel}
                      </p>
                    )}
                    <p className="text-sm font-bold text-brand">
                      {formatEGP(item.price)}
                    </p>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="flex items-center border border-neutral-300 dark:border-neutral-600">
                      <button
                        type="button"
                        className={qtyBtn}
                        onClick={() => handleQuantityChange(item.cartKey, item.quantity - 1)}
                        aria-label={cart.decreaseQty}
                      >
                        <FiMinus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-semibold dark:text-neutral-200">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className={qtyBtn}
                        onClick={() => handleQuantityChange(item.cartKey, item.quantity + 1)}
                        aria-label={cart.increaseQty}
                      >
                        <FiPlus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-end">
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">
                        {formatEGP(parsePrice(item.price) * item.quantity)}
                      </p>
                      <button
                        type="button"
                        className="mt-1 text-red-500 transition hover:opacity-80"
                        onClick={() => removeFromCart(item.cartKey)}
                        aria-label={cart.removeItem}
                      >
                        <FiTrash2 className="inline h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary & Checkout */}
          <div className="h-fit border border-neutral-200 bg-transparent p-6 dark:border-neutral-800">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {cartPage.orderSummary}
            </h2>

            <div className="mt-4 space-y-3 border-b border-neutral-200 pb-4 dark:border-neutral-700">
              <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                <span>
                  {isRtl ? 'المنتجات المختارة' : 'Selected Items'} ({selectedCount})
                </span>
                <span>{formatEGP(selectedTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                <span>{cartPage.shipping}</span>
                <span>{cartPage.free}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between text-lg font-bold text-neutral-900 dark:text-white">
              <span>{cart.total}</span>
              <span className="text-brand">{formatEGP(selectedTotal)}</span>
            </div>

            {/* Checkout Button */}
            <button
              type="button"
              disabled={selectedKeys.size === 0}
              onClick={() => setCheckoutOpen(true)}
              className="mt-5 flex w-full items-center justify-center rounded-none bg-brand py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-none transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isRtl ? 'إتمام الطلب' : 'Checkout'} {selectedCount > 0 ? `(${selectedCount})` : ''}
            </button>

            {/* Fallback WhatsApp Button for full or selected order */}
            <OrderWhatsAppButton className="mt-3 w-full" />

            <button
              type="button"
              className="btn-outline mt-3 w-full rounded-none shadow-none"
              onClick={clearCart}
            >
              {cart.clearCart}
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Form Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        selectedItems={selectedItems}
        totalPrice={selectedTotal}
        onOrderSuccess={(result, orderedKeys) => {
          if (removeItemsFromCart) {
            removeItemsFromCart(orderedKeys);
          }
        }}
      />
    </main>
  );
};

export default Cart;

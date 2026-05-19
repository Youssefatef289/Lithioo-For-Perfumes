import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import OrderWhatsAppButton from '../components/OrderWhatsAppButton';
import { formatEGP, parsePrice } from '../utils/price';
import { localizeProduct } from '../utils/localizeProduct';
import { getSizeById } from '../data/sizes';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { cart, cartPage } = t;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleQuantityChange = (cartKey, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartKey);
    } else {
      updateQuantity(cartKey, newQuantity);
    }
  };

  const total = getCartTotal();
  const itemCount = cartItems.reduce((n, i) => n + i.quantity, 0);
  const itemsLabel =
    itemCount === 1 ? cartPage.itemsOne : cartPage.itemsMany.replace('{count}', String(itemCount));

  const qtyBtn =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition hover:border-brand dark:border-neutral-600 dark:text-neutral-200';

  if (cartItems.length === 0) {
    return (
      <main className="page-main min-h-screen w-full bg-white px-4 py-16 pt-24 dark:bg-neutral-950 sm:pt-28">
        <div className="section-inner flex max-w-lg flex-col items-center border-2 border-dashed border-neutral-200 bg-neutral-50/60 px-6 py-16 text-center dark:border-neutral-700 dark:bg-neutral-900/40">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand/15 text-brand">
            <FiShoppingCart className="h-10 w-10" />
          </div>
          <h2 className="heading-section !text-2xl">{cart.empty}</h2>
          <p className="text-muted-section mt-2">{cartPage.emptyHint}</p>
          <button type="button" className="btn-primary mt-8" onClick={() => navigate('/products')}>
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
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex w-fit items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-brand dark:text-neutral-400"
          >
            <FiArrowLeft className="h-4 w-4" /> {cartPage.back}
          </button>
          <h1 className="heading-section">{cart.title}</h1>
          <p className="text-muted-section !mt-0">{itemsLabel}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => {
              const display = localizeProduct(item, language);
              const sizeLabel = item.size ? getSizeById(item.size, language).label : item.sizeLabel;
              return (
              <div
                key={item.cartKey}
                className="card-elevated flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
              >
                <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-white dark:bg-neutral-800 sm:h-24 sm:w-24">
                  <img src={item.image} alt={display.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">{display.name}</h3>
                  {display.brand && <p className="text-xs text-neutral-500 dark:text-neutral-400">{display.brand}</p>}
                  {sizeLabel && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{sizeLabel}</p>
                  )}
                  <p className="text-sm font-bold text-brand">{formatEGP(item.price)}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-600">
                    <button
                      type="button"
                      className={qtyBtn}
                      onClick={() => handleQuantityChange(item.cartKey, item.quantity - 1)}
                      aria-label={cart.decreaseQty}
                    >
                      <FiMinus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-medium dark:text-neutral-200">{item.quantity}</span>
                    <button
                      type="button"
                      className={qtyBtn}
                      onClick={() => handleQuantityChange(item.cartKey, item.quantity + 1)}
                      aria-label={cart.increaseQty}
                    >
                      <FiPlus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-bold text-neutral-800 dark:text-white">
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

          <div className="card-elevated h-fit p-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{cartPage.orderSummary}</h2>
            <div className="mt-4 space-y-3 border-b border-neutral-200 pb-4 dark:border-neutral-700">
              <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                <span>{cartPage.subtotal}</span>
                <span>{formatEGP(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                <span>{cartPage.shipping}</span>
                <span>{cartPage.free}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-lg font-bold text-neutral-900 dark:text-white">
              <span>{cart.total}</span>
              <span className="text-brand">{formatEGP(total)}</span>
            </div>
            <OrderWhatsAppButton className="mt-6" />
            <button type="button" className="btn-outline mt-3 w-full" onClick={clearCart}>
              {cart.clearCart}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FiX, FiShoppingCart, FiStar, FiHeart } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const formatPrice = (price) => {
  if (typeof price === 'number') return `$${price.toFixed(2)}`;
  return price;
};

const ProductDetailsModal = ({ product, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const priceNum =
    typeof product.price === 'number'
      ? product.price
      : parseFloat(String(product.price).replace('$', ''));

  const displayImage = product.imageHover || product.image;
  const inWishlist = isInWishlist(product.id);
  const rating = product.rating ?? 4.5;
  const reviews = product.reviews ?? 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />

      <div className="relative z-[1] flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-modal-in dark:bg-neutral-900 sm:max-h-[90vh] sm:rounded-3xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-md backdrop-blur transition hover:rotate-90 dark:bg-neutral-800/90 dark:text-neutral-200"
          aria-label="Close"
        >
          <FiX className="h-5 w-5" />
        </button>

        <div className="grid overflow-y-auto md:grid-cols-2">
          <div className="relative aspect-square bg-gradient-to-br from-neutral-100 to-neutral-50 p-6 dark:from-neutral-800 dark:to-neutral-900 sm:p-8">
            <img src={displayImage} alt={product.name} className="h-full w-full object-contain drop-shadow-xl" />
          </div>

          <div className="flex flex-col gap-5 p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Lithioo Perfume</p>
              <h2 id="product-modal-title" className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
                {product.name}
              </h2>
              {product.category && (
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{product.category}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-current' : ''}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                {rating} ({reviews} reviews)
              </span>
            </div>

            <p className="text-2xl font-bold text-brand">{formatPrice(product.price)}</p>

            {product.description && (
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{product.description}</p>
            )}

            <ul className="space-y-2 rounded-xl border border-neutral-100 bg-neutral-50/80 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-800/50">
              <li className="flex justify-between gap-4">
                <span className="text-neutral-500 dark:text-neutral-400">Type</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-100">Eau de Parfum</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-neutral-500 dark:text-neutral-400">Collection</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-100">Luxury Recaptured</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-neutral-500 dark:text-neutral-400">Availability</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {product.inStock !== false ? 'In stock' : 'Out of stock'}
                </span>
              </li>
            </ul>

            <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={() => addToCart({ ...product, price: priceNum })}
                disabled={product.inStock === false}
                className="btn-primary flex-1"
              >
                <FiShoppingCart className="h-5 w-5" />
                Add to cart
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist({ ...product, price: priceNum })}
                className={`btn-outline flex-1 ${inWishlist ? 'border-red-400 text-red-500' : ''}`}
              >
                <FiHeart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                {inWishlist ? 'Saved' : 'Wishlist'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/product/${product.id}`);
              }}
              className="text-center text-sm font-semibold text-brand underline-offset-4 transition hover:underline"
            >
              View full product page →
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProductDetailsModal;

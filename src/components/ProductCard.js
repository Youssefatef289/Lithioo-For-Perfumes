import React, { useState } from 'react';
import { FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import ProductDetailsModal from './ProductDetailsModal';

const formatDisplayPrice = (price) => {
  if (typeof price === 'number') return `$${price.toFixed(2)}`;
  return price;
};

const ProductCard = ({ product, className = '', showActions = true, animationClass = '' }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const hoverImage = product.imageHover || product.image;
  const mainImage = product.image || hoverImage;

  const priceNum =
    typeof product.price === 'number'
      ? product.price
      : parseFloat(String(product.price).replace('$', ''));

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart({ ...product, price: priceNum });
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsToggling(true);
    toggleWishlist({ ...product, price: priceNum });
    setTimeout(() => setIsToggling(false), 300);
  };

  const openDetails = (e) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  const inWishlist = isInWishlist(product.id);

  return (
    <>
      <article
        className={`group relative w-full transition-transform duration-500 ease-out hover:-translate-y-2 ${animationClass} ${className}`}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-shadow duration-500 group-hover:shadow-card-hover dark:bg-neutral-800 dark:shadow-black/40 dark:group-hover:shadow-black/60">
          <div className="relative overflow-hidden bg-gradient-to-b from-neutral-50 to-neutral-100/80 pt-[110%] dark:from-neutral-900 dark:to-neutral-800">
            <div className="absolute inset-0">
              <img
                src={mainImage}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 max-md:opacity-0 md:group-hover:opacity-0"
                loading="lazy"
              />
              <img
                src={hoverImage}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-all duration-700 ease-out max-md:opacity-100 md:group-hover:scale-100 md:group-hover:opacity-100"
                loading="lazy"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-900/30 via-transparent to-transparent opacity-50 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100"
                aria-hidden
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 z-20 flex translate-y-0 justify-center p-4 opacity-100 transition-all duration-500 ease-out md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
              <button type="button" onClick={openDetails} className="btn-primary gap-2 px-5 py-2.5 text-sm shadow-lg">
                <FiEye className="h-4 w-4" />
                Details
              </button>
            </div>

            {showActions && (
              <div className="absolute end-3 top-3 z-20 flex gap-2 opacity-100 transition-all duration-300 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                <button
                  type="button"
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-brand shadow-md backdrop-blur transition hover:scale-110 dark:bg-neutral-800/95 ${
                    isAdding ? 'scale-110 bg-brand text-white' : ''
                  }`}
                  onClick={handleAddToCart}
                  aria-label="Add to cart"
                >
                  <FiShoppingCart className="h-[1.1rem] w-[1.1rem]" />
                  {isAdding && (
                    <span className="absolute inset-0 flex items-center justify-center text-lg animate-check-mark">✓</span>
                  )}
                </button>
                <button
                  type="button"
                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-neutral-600 shadow-md backdrop-blur transition hover:scale-110 hover:text-red-500 dark:bg-neutral-800/95 dark:text-neutral-300 ${
                    inWishlist ? 'bg-red-500/10 text-red-500' : ''
                  } ${isToggling ? 'animate-heart-pulse' : ''}`}
                  onClick={handleWishlist}
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <FiHeart className={`h-[1.1rem] w-[1.1rem] ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
            <h3 className="m-0 text-lg font-semibold text-neutral-800 transition-colors group-hover:text-brand dark:text-neutral-100">
              {product.name}
            </h3>
            <p className="m-0 text-xl font-bold text-brand">{formatDisplayPrice(product.price)}</p>
            <button
              type="button"
              onClick={openDetails}
              className="mt-1 w-full text-start text-sm font-medium text-neutral-500 underline-offset-2 transition hover:text-brand hover:underline dark:text-neutral-400 md:hidden"
            >
              View details
            </button>
          </div>
        </div>
      </article>

      <ProductDetailsModal product={product} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default ProductCard;

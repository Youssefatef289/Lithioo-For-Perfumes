import React, { useRef, useState } from 'react';
import { FiEye, FiHeart } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocalizedProduct } from '../hooks/useLocalizedProduct';
import ProductDetailsModal from './ProductDetailsModal';
import PriceDisplay from './PriceDisplay';
import SizeSelector from './SizeSelector';
import AddToCartButton from './AddToCartButton';
import { isOriginalProduct } from '../data/productFactory';
import { DEFAULT_SIZE_ID, getSizeById, getProductSizePrice } from '../data/sizes';
import { buildSingleProductMessage, openWhatsApp } from '../utils/whatsapp';

const ProductCard = ({ product, className = '', animationClass = '', style }) => {
  const { addToCart } = useCart();
  const { language } = useLanguage();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const lp = useLocalizedProduct(product);
  const [selectedSize, setSelectedSize] = useState(DEFAULT_SIZE_ID);
  const [modalOpen, setModalOpen] = useState(false);
  const imageRef = useRef(null);

  const hideSizes = isOriginalProduct(product);
  const hoverImage = product.imageHover || product.image;
  const mainImage = product.image || hoverImage;
  const sizeMeta = getSizeById(selectedSize, language);
  const price = hideSizes ? product.price : getProductSizePrice(product, selectedSize);
  const inWishlist = isInWishlist(product.id);

  const buildLineItem = () => {
    if (hideSizes) {
      return {
        ...product,
        size: null,
        sizeLabel: '',
        price: product.price,
        cartKey: `${product.id}-original`,
      };
    }
    return {
      ...product,
      size: selectedSize,
      sizeLabel: sizeMeta.label,
      price,
    };
  };

  const handleAddToCart = (e) => {
    e?.stopPropagation?.();
    addToCart(buildLineItem(), 1);
  };

  const handleOrderNow = (e) => {
    e.stopPropagation();
    openWhatsApp(buildSingleProductMessage(buildLineItem(), price));
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    toggleWishlist(buildLineItem());
  };

  const openDetails = (e) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  const floatingIconBtn =
    'pointer-events-auto flex h-9 w-9 items-center justify-center rounded-none border border-neutral-200/90 bg-white/90 text-neutral-700 transition-all duration-200 hover:border-brand hover:text-brand dark:border-neutral-700/90 dark:bg-neutral-900/90 dark:text-neutral-200 dark:hover:border-brand dark:hover:text-brand';

  if (!lp) return null;

  return (
    <>
      <article
        className={`group relative w-full transition-transform duration-300 ease-out hover:-translate-y-1 ${animationClass} ${className}`}
        style={style}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-none border border-neutral-200 bg-transparent transition-colors duration-300 group-hover:border-brand/70 dark:border-neutral-800 dark:group-hover:border-brand/70">
          <div className="relative overflow-hidden bg-transparent pt-[105%]">
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <img
                src={mainImage}
                alt={lp.name}
                ref={imageRef}
                loading="lazy"
                decoding="async"
                className={`max-h-full max-w-full object-contain transition-all duration-700 ease-out ${
                  hoverImage && hoverImage !== mainImage
                    ? 'group-hover:scale-95 group-hover:opacity-0'
                    : 'group-hover:scale-105'
                }`}
              />
              {hoverImage && hoverImage !== mainImage && (
                <img
                  src={hoverImage}
                  alt={`${lp.name} alternate view`}
                  loading="lazy"
                  decoding="async"
                  className="pointer-events-none absolute inset-0 m-auto max-h-full max-w-full object-contain p-6 opacity-0 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
                />
              )}
            </div>

            <div className="absolute top-3 end-3 z-10 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={floatingIconBtn}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <FiHeart
                  className={`h-4 w-4 transition-colors duration-200 ${
                    inWishlist ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={handleOrderNow}
                className={`${floatingIconBtn} text-emerald-600 hover:text-emerald-500 dark:text-emerald-400`}
                aria-label="Order via WhatsApp"
              >
                <FaWhatsapp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={openDetails}
                className={floatingIconBtn}
                aria-label="Quick view"
              >
                <FiEye className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center gap-1.5 px-4 pt-5 pb-3 text-center">
            <h3 className="m-0 line-clamp-2 w-full px-1 text-[0.95rem] font-semibold uppercase tracking-[0.08em] text-neutral-800 dark:text-neutral-100">
              {lp.name}
            </h3>
            <PriceDisplay
              price={price}
              language={language}
              className="mt-0.5"
            />
            {!hideSizes && (
              <div className="mt-1 w-full">
                <SizeSelector
                  selectedSize={selectedSize}
                  onChange={setSelectedSize}
                  product={product}
                  className="justify-center"
                />
              </div>
            )}
          </div>

          <div className="px-3 pb-3">
            <AddToCartButton
              onClick={handleAddToCart}
              variant="card"
              className="w-full"
            />
          </div>
        </div>
      </article>

      <ProductDetailsModal
        product={product}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialSize={selectedSize}
      />
    </>
  );
};

export default ProductCard;

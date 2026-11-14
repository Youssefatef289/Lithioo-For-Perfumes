import React, { useRef, useState } from 'react';
import { FiEye, FiShoppingCart, FiCheck } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocalizedProduct } from '../hooks/useLocalizedProduct';
import ProductDetailsModal from './ProductDetailsModal';
import { isOriginalProduct } from '../data/productFactory';
import { DEFAULT_SIZE_ID, getSizeById, getProductSizePrice } from '../data/sizes';
import { formatPrice } from '../utils/price';

const ProductCard = ({ product, className = '', animationClass = '', style }) => {
  const { addToCart } = useCart();
  const { language, isRtl } = useLanguage();
  const lp = useLocalizedProduct(product);
  const [selectedSize] = useState(DEFAULT_SIZE_ID);
  const [modalOpen, setModalOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const imageRef = useRef(null);

  if (!lp || !product) return null;

  const hideSizes = isOriginalProduct(product);
  const hoverImage = product.imageHover || product.image;
  const mainImage = product.image || hoverImage;
  const sizeMeta = getSizeById(selectedSize, language);
  const price = hideSizes ? product.price : getProductSizePrice(product, selectedSize);

  // Extract notes line separated by "|"
  const getNotes = () => {
    if (product.notes) {
      if (Array.isArray(product.notes)) {
        return product.notes.map((n) => String(n).trim().toUpperCase()).filter(Boolean).join(' | ');
      }
      const s = String(product.notes).trim();
      if (s.includes('|')) {
        return s.split('|').map((x) => x.trim().toUpperCase()).filter(Boolean).join(' | ');
      }
      if (s.includes(',') || s.includes('،')) {
        return s.split(/[,،]/).map((x) => x.trim().toUpperCase()).filter(Boolean).join(' | ');
      }
      return s.toUpperCase();
    }
    if (product.scentNotes) {
      return Array.isArray(product.scentNotes)
        ? product.scentNotes.map((n) => String(n).trim().toUpperCase()).filter(Boolean).join(' | ')
        : String(product.scentNotes).toUpperCase();
    }
    if (product.fragrance_notes) {
      return String(product.fragrance_notes).toUpperCase();
    }
    if (product.ingredients) {
      const list = Array.isArray(product.ingredients)
        ? product.ingredients
        : String(product.ingredients).split(/[,،]/);
      return list.slice(0, 3).map((x) => String(x).trim().toUpperCase()).filter(Boolean).join(' | ');
    }
    return 'SPICY | AMBER | FRUITY';
  };

  const notesLine = getNotes();

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
      sizeLabel: sizeMeta?.label || '',
      price,
    };
  };

  const handleAddToCart = (e) => {
    e?.stopPropagation?.();
    addToCart(buildLineItem(), 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  const openDetails = (e) => {
    e?.stopPropagation?.();
    setModalOpen(true);
  };

  return (
    <>
      <article
        onClick={openDetails}
        className={`group relative flex flex-col justify-between rounded-2xl bg-white p-3.5 transition-all duration-300 hover:shadow-lg dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 cursor-pointer ${animationClass} ${className}`}
        style={style}
      >
        {/* Top Product Image Container with soft light background & generous padding */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#f5f5f5] dark:bg-neutral-800/60 p-6 flex items-center justify-center transition-colors duration-300 group-hover:bg-[#f0f0f0] dark:group-hover:bg-neutral-800">
          <img
            src={mainImage}
            alt={lp.name}
            ref={imageRef}
            loading="lazy"
            decoding="async"
            className={`max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-500 ease-out will-change-transform motion-reduce:transform-none ${
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
              className="pointer-events-none absolute inset-0 m-auto max-h-full max-w-full object-contain p-6 opacity-0 drop-shadow-sm transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-100 motion-reduce:transform-none"
            />
          )}
        </div>

        {/* Text Info Section: Name (Uppercase, letter-spaced), Notes, Price */}
        <div className="flex flex-1 flex-col items-center justify-center pt-4 pb-3 text-center px-1">
          <h3 className="m-0 text-xs sm:text-[13px] font-semibold uppercase tracking-[0.16em] text-neutral-900 dark:text-neutral-100 line-clamp-1">
            {lp.name}
          </h3>

          <p className="mt-1.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-400 line-clamp-1">
            {notesLine}
          </p>

          <p className="mt-2 text-xs sm:text-sm font-semibold tracking-wider text-neutral-800 dark:text-neutral-200" dir="ltr">
            {formatPrice(price)}
          </p>
        </div>

        {/* Modern Two-Button Row: View Details (عرض التفاصيل) & Add to Cart (أضف للسلة) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={openDetails}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white py-2 px-2 text-[11px] sm:text-xs font-medium text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand active:scale-[0.98] motion-reduce:transform-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-brand dark:hover:text-brand shadow-xs"
          >
            <FiEye className="h-3.5 w-3.5" />
            <span>{isRtl ? 'عرض التفاصيل' : 'View details'}</span>
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-[11px] sm:text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] motion-reduce:transform-none shadow-sm ${
              added
                ? 'bg-emerald-600 ring-2 ring-emerald-400 scale-[1.02]'
                : 'bg-brand hover:bg-brand-dark'
            }`}
          >
            {added ? (
              <>
                <FiCheck className="h-3.5 w-3.5" />
                <span>{isRtl ? 'تمت الإضافة' : 'Added'}</span>
              </>
            ) : (
              <>
                <FiShoppingCart className="h-3.5 w-3.5" />
                <span>{isRtl ? 'أضف للسلة' : 'Add to cart'}</span>
              </>
            )}
          </button>
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

import React, { useState } from 'react';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocalizedProduct } from '../hooks/useLocalizedProduct';
import ProductDetailsModal from './ProductDetailsModal';
import SizeSelector from './SizeSelector';
import { isOriginalProduct } from '../data/productFactory';
import { DEFAULT_SIZE_ID, getSizeById } from '../data/sizes';
import { formatEGP } from '../utils/price';
import { buildSingleProductMessage, openWhatsApp } from '../utils/whatsapp';

const ProductCard = ({ product, className = '', animationClass = '', style }) => {
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const lp = useLocalizedProduct(product);
  const [selectedSize, setSelectedSize] = useState(DEFAULT_SIZE_ID);
  const [isAdding, setIsAdding] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const hideSizes = isOriginalProduct(product);
  const hoverImage = product.imageHover || product.image;
  const mainImage = product.image || hoverImage;
  const sizeMeta = getSizeById(selectedSize, language);
  const price = hideSizes ? product.price : sizeMeta.price;

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
    e.stopPropagation();
    setIsAdding(true);
    addToCart(buildLineItem(), 1);
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleOrderNow = (e) => {
    e.stopPropagation();
    openWhatsApp(buildSingleProductMessage(buildLineItem(), price));
  };

  const openDetails = (e) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  const floatingIconBtn =
    'pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-700 shadow-md ring-1 ring-black/5 transition-all duration-300 hover:scale-110 hover:text-brand dark:bg-neutral-800 dark:text-neutral-200 dark:ring-white/10';

  if (!lp) return null;

  return (
    <>
      <article
        className={`group relative w-full transition-transform duration-500 ease-out hover:-translate-y-1 ${animationClass} ${className}`}
        style={style}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-card transition-all duration-300 group-hover:border-brand/60 group-hover:shadow-card-hover dark:border-neutral-700 dark:bg-neutral-800 dark:shadow-black/40 dark:group-hover:border-brand/60">
          <div className="relative overflow-hidden bg-white pt-[105%] dark:bg-neutral-800">
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <img
                src={mainImage}
                alt={lp.name}
                className="max-h-full max-w-full object-contain transition-opacity duration-500 ease-out group-hover:opacity-0"
                loading="lazy"
              />
              <img
                src={hoverImage}
                alt=""
                aria-hidden
                className="absolute inset-0 m-auto max-h-[82%] max-w-[82%] object-contain opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                loading="lazy"
              />
            </div>

            <div className="pointer-events-none absolute end-3 top-3 flex flex-col gap-2 opacity-0 translate-x-2 rtl:-translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0">
              <button
                type="button"
                onClick={handleOrderNow}
                className={`${floatingIconBtn} hover:bg-[#25D366] hover:text-white`}
                aria-label={t.productCard.orderWhatsApp}
              >
                <FaWhatsapp className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={openDetails}
                className={floatingIconBtn}
                aria-label={t.productCard.viewDetails}
              >
                <FiEye className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center gap-1.5 px-4 pt-5 pb-3 text-center">
            <h3 className="m-0 line-clamp-2 w-full px-1 text-[0.95rem] font-semibold uppercase tracking-[0.08em] text-neutral-800 dark:text-neutral-100">
              {lp.name}
            </h3>
            <p className="m-0 text-sm font-medium text-neutral-500 dark:text-neutral-400" dir="ltr">
              {formatEGP(price)}
            </p>
            {!hideSizes && (
              <div className="mt-1 w-full">
                <SizeSelector
                  selectedSize={selectedSize}
                  onChange={setSelectedSize}
                  className="justify-center"
                />
              </div>
            )}
          </div>

          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`group/cart relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wider text-neutral-800 transition-all duration-300 hover:border-brand hover:text-white hover:shadow-md active:scale-[0.97] dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-brand dark:hover:text-white ${
                isAdding ? 'border-brand text-white' : ''
              }`}
              aria-label={t.productCard.addToCart}
            >
              <span
                aria-hidden
                className={`absolute inset-0 -z-0 origin-left scale-x-0 bg-brand transition-transform duration-500 ease-out group-hover/cart:scale-x-100 ${
                  isAdding ? 'scale-x-100' : ''
                }`}
              />
              <span className="relative z-10 transition-transform duration-300 group-hover/cart:translate-x-0.5">
                {isAdding ? t.productPage.added : t.productCard.addToCart}
              </span>
              <FiShoppingCart
                className={`relative z-10 h-5 w-5 shrink-0 transition-all duration-300 group-hover/cart:translate-x-1 group-hover/cart:scale-110 ${
                  isAdding ? 'translate-x-1 scale-110' : ''
                }`}
              />
            </button>
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

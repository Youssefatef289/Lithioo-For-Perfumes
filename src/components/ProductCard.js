import React, { useState } from 'react';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import ProductDetailsModal from './ProductDetailsModal';
import SizeSelector from './SizeSelector';
import { isOriginalProduct } from '../data/productFactory';
import { DEFAULT_SIZE_ID, getSizeById } from '../data/sizes';
import { formatEGP } from '../utils/price';
import { buildSingleProductMessage, openWhatsApp } from '../utils/whatsapp';

const ProductCard = ({ product, className = '', animationClass = '', style }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(DEFAULT_SIZE_ID);
  const [isAdding, setIsAdding] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const hideSizes = isOriginalProduct(product);
  const hoverImage = product.imageHover || product.image;
  const mainImage = product.image || hoverImage;
  const sizeMeta = getSizeById(selectedSize);
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

  const iconBtn =
    'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-95';

  return (
    <>
      <article
        className={`group relative w-full transition-transform duration-500 ease-out hover:-translate-y-1 ${animationClass} ${className}`}
        style={style}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-card transition-shadow duration-300 group-hover:shadow-card-hover dark:border-neutral-700/80 dark:bg-neutral-800 dark:shadow-black/40">
          {/* Image — full product visible */}
          <div className="relative overflow-hidden bg-neutral-50 pt-[95%] dark:bg-neutral-900">
            <div className="absolute inset-0 flex items-center justify-center p-4 pb-2">
              <img
                src={mainImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-opacity duration-500 ease-out group-hover:opacity-0"
                loading="lazy"
              />
              <img
                src={hoverImage}
                alt=""
                aria-hidden
                className="absolute inset-0 m-auto max-h-[88%] max-w-[88%] object-contain opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                loading="lazy"
              />
            </div>
          </div>

          {/* Actions below image */}
          <div className="flex justify-center gap-3 border-b border-neutral-100 px-4 py-3 dark:border-neutral-700">
            <button
              type="button"
              onClick={handleOrderNow}
              className={`${iconBtn} bg-[#25D366] text-white shadow-sm`}
              aria-label="Order on WhatsApp"
            >
              <FaWhatsapp className="h-[1.15rem] w-[1.15rem]" />
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              className={`${iconBtn} bg-brand text-white shadow-sm ${isAdding ? 'ring-2 ring-brand/30' : ''}`}
              aria-label="Add to cart"
            >
              <FiShoppingCart className="h-[1.15rem] w-[1.15rem]" />
            </button>
            <button
              type="button"
              onClick={openDetails}
              className={`${iconBtn} border border-neutral-200 bg-white text-neutral-700 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100`}
              aria-label="View details"
            >
              <FiEye className="h-[1.15rem] w-[1.15rem]" />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-2 p-4 pt-3 sm:p-5 sm:pt-4">
            {product.brand && (
              <p className="m-0 truncate text-[0.7rem] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {product.brand}
              </p>
            )}
            <h3 className="m-0 line-clamp-2 text-base font-semibold leading-snug text-neutral-800 dark:text-neutral-100">
              {product.name}
            </h3>
            {!hideSizes && <SizeSelector selectedSize={selectedSize} onChange={setSelectedSize} />}
            <p className="m-0 text-xl font-bold text-brand">{formatEGP(price)}</p>
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

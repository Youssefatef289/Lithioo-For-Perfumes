import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FiX, FiShoppingCart, FiStar, FiHeart } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocalizedProduct } from '../hooks/useLocalizedProduct';
import SizeSelector from './SizeSelector';
import { isOriginalProduct } from '../data/productFactory';
import { DEFAULT_SIZE_ID, getSizeById } from '../data/sizes';
import { formatEGP } from '../utils/price';
import { buildSingleProductMessage, openWhatsApp } from '../utils/whatsapp';

const ProductDetailsModal = ({ product, isOpen, onClose, initialSize = DEFAULT_SIZE_ID }) => {
  const navigate = useNavigate();
  const { t, isRtl, language } = useLanguage();
  const lp = useLocalizedProduct(product);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [selectedImage, setSelectedImage] = useState(0);

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

  useEffect(() => {
    if (isOpen) {
      setSelectedSize(initialSize);
      setSelectedImage(0);
    }
  }, [isOpen, initialSize, product?.id]);

  if (!isOpen || !product || !lp) return null;

  const hideSizes = isOriginalProduct(product);
  const sizeMeta = getSizeById(selectedSize, language);
  const price = hideSizes ? product.price : sizeMeta.price;
  const lineItem = hideSizes
    ? {
        ...product,
        size: null,
        sizeLabel: '',
        price: product.price,
        cartKey: `${product.id}-original`,
      }
    : {
        ...product,
        size: selectedSize,
        sizeLabel: sizeMeta.label,
        price,
      };

  const detailImages =
    product.detailImages?.length > 0
      ? product.detailImages
      : [product.imageHover, product.image].filter(Boolean);
  const uniqueImages = [...new Set(detailImages)];
  const displayImage = uniqueImages[selectedImage] || uniqueImages[0];
  const inWishlist = isInWishlist(product.id);
  const rating = product.rating ?? 4.5;
  const reviews = product.reviews ?? 0;
  const ingredients = lp?.ingredients ?? [];
  const benefits = lp?.benefits ?? [];

  const handleAddToCart = () => {
    addToCart(lineItem, 1);
  };

  const detailsPanel = (
    <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{t.modal.brand}</p>
        <h2 id="product-modal-title" className="mt-1 text-center text-xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
          {lp?.name}
        </h2>
        {lp?.brand && (
          <p className="mt-1 text-center text-sm font-medium text-neutral-600 dark:text-neutral-400">{lp.brand}</p>
        )}
        {lp?.category && (
          <p className="mt-0.5 text-center text-xs text-neutral-500">{lp.category}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-0.5 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <FiStar key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-current' : ''}`} />
          ))}
        </div>
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {rating} ({reviews} {t.modal.reviews})
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {!hideSizes && <SizeSelector selectedSize={selectedSize} onChange={setSelectedSize} className="mt-1" />}
        <p className="text-2xl font-bold text-brand">{formatEGP(price)}</p>
      </div>

      {lp?.description && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-800 dark:text-neutral-200">
            {t.modal.productDetails}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{lp.description}</p>
        </div>
      )}

      {ingredients.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-800 dark:text-neutral-200">
            {t.modal.ingredients}
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {ingredients.map((note) => (
              <li
                key={note}
                className="rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-xs font-medium text-brand dark:border-brand/30"
              >
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {benefits.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-800 dark:text-neutral-200">
            {t.modal.benefits}
          </h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
            {benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </div>
      )}

      <ul className="space-y-2 rounded-xl border border-neutral-100 bg-neutral-50/80 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-800/50">
        <li className="flex justify-between gap-4">
          <span className="text-neutral-500 dark:text-neutral-400">{t.modal.type}</span>
          <span className="font-medium text-neutral-800 dark:text-neutral-100">{t.modal.typeValue}</span>
        </li>
        <li className="flex justify-between gap-4">
          <span className="text-neutral-500 dark:text-neutral-400">{t.modal.availability}</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {product.inStock !== false ? t.modal.inStock : t.modal.outOfStock}
          </span>
        </li>
      </ul>

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={() => openWhatsApp(buildSingleProductMessage(lineItem, price))}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#20bd5a]"
        >
          <FaWhatsapp className="h-5 w-5" />
          {t.modal.orderNow}
        </button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.inStock === false}
            className="btn-primary flex-1"
          >
            <FiShoppingCart className="h-5 w-5" />
            {t.modal.addToCart}
          </button>
          <button
            type="button"
            onClick={() => toggleWishlist({ ...product, price })}
            className={`btn-outline flex-1 ${inWishlist ? 'border-red-400 text-red-500' : ''}`}
          >
            <FiHeart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
            {inWishlist ? t.modal.saved : t.modal.wishlist}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          onClose();
          navigate(`/product/${product.id}`);
        }}
        className="pb-2 text-center text-sm font-semibold text-brand underline-offset-4 transition hover:underline"
      >
        {t.modal.viewFull}
      </button>
    </div>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t.modal.close}
      />

      <div
        className={`relative z-[1] flex w-full max-w-3xl flex-col overflow-hidden bg-white shadow-2xl dark:bg-neutral-900 sm:max-h-[90vh] sm:rounded-3xl ${
          isRtl ? 'animate-modal-in' : 'animate-modal-in'
        } max-h-[100dvh] rounded-t-2xl sm:rounded-3xl`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute end-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-neutral-700 shadow-md backdrop-blur sm:end-4 sm:top-4 dark:bg-neutral-800/95 dark:text-neutral-200"
          aria-label={t.modal.close}
        >
          <FiX className="h-5 w-5" />
        </button>

        {/* Mobile: stacked scroll */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:hidden">
          <div className="shrink-0 border-b border-neutral-100 bg-gradient-to-br from-neutral-100 to-neutral-50 pt-12 dark:border-neutral-800 dark:from-neutral-800 dark:to-neutral-900">
            <div className="relative mx-auto aspect-[4/3] max-h-[38vh] w-full max-w-sm p-4">
              <img src={displayImage} alt={lp?.name} className="h-full w-full object-contain drop-shadow-xl" />
            </div>
            {uniqueImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto px-4 pb-4">
                {uniqueImages.map((img, imgIndex) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setSelectedImage(imgIndex)}
                    className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 bg-white p-0.5 dark:bg-neutral-800 ${
                      selectedImage === imgIndex ? 'border-brand' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{detailsPanel}</div>
        </div>

        {/* Desktop: two columns */}
        <div className="hidden max-h-[90vh] overflow-y-auto md:grid md:grid-cols-2">
          <div className="relative flex flex-col bg-gradient-to-br from-neutral-100 to-neutral-50 p-6 dark:from-neutral-800 dark:to-neutral-900">
            <div className="relative aspect-square flex-1 p-4 pt-10">
              <img src={displayImage} alt={lp?.name} className="h-full w-full object-contain drop-shadow-xl" />
            </div>
            {uniqueImages.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {uniqueImages.map((img, imgIndex) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setSelectedImage(imgIndex)}
                    className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white p-0.5 dark:bg-neutral-800 ${
                      selectedImage === imgIndex ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
          {detailsPanel}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProductDetailsModal;

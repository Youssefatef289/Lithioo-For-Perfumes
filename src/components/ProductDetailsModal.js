import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FiX, FiStar, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AddToCartButton from './AddToCartButton';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocalizedProduct } from '../hooks/useLocalizedProduct';
import PriceDisplay from './PriceDisplay';
import SizeSelector from './SizeSelector';
import { isOriginalProduct } from '../data/productFactory';
import { DEFAULT_SIZE_ID, getSizeById, getProductSizePrice } from '../data/sizes';
import { buildSingleProductMessage, openWhatsApp } from '../utils/whatsapp';

const ProductDetailsModal = ({ product, isOpen, onClose, initialSize = DEFAULT_SIZE_ID }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const lp = useLocalizedProduct(product);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [activeImg, setActiveImg] = useState(0);
  const galleryRef = useRef(null);

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
      setActiveImg(0);
    }
  }, [isOpen, initialSize, product?.id]);

  const handleGalleryScroll = useCallback(() => {
    const el = galleryRef.current;
    if (!el) return;
    const containerCenter = el.getBoundingClientRect().left + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(el.children).forEach((child, idx) => {
      const r = child.getBoundingClientRect();
      const center = r.left + r.width / 2;
      const dist = Math.abs(center - containerCenter);
      if (dist < bestDist) {
        bestDist = dist;
        best = idx;
      }
    });
    setActiveImg(best);
  }, []);

  const scrollToImage = useCallback((index) => {
    const el = galleryRef.current;
    if (!el) return;
    const slide = el.children[index];
    if (!slide) return;
    const cRect = el.getBoundingClientRect();
    const sRect = slide.getBoundingClientRect();
    const delta = sRect.left + sRect.width / 2 - (cRect.left + cRect.width / 2);
    el.scrollBy({ left: delta, behavior: 'smooth' });
  }, []);

  if (!isOpen || !product || !lp) return null;

  const hideSizes = isOriginalProduct(product);
  const sizeMeta = getSizeById(selectedSize, language);
  const price = hideSizes ? product.price : getProductSizePrice(product, selectedSize);
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
      : [product.image, product.imageHover].filter(Boolean);
  const uniqueImages = [...new Set(detailImages)];
  const inWishlist = isInWishlist(product.id);
  const rating = product.rating ?? 4.5;
  const reviews = product.reviews ?? 0;
  const ingredients = lp?.ingredients ?? [];
  const benefits = lp?.benefits ?? [];

  const handleAddToCart = () => addToCart(lineItem, 1);

  const arrowBtn =
    'pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-md ring-1 ring-black/5 backdrop-blur transition hover:bg-white hover:text-brand';

  const gallery = (
    <div className="relative flex h-full flex-col bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900">
      <div
        ref={galleryRef}
        onScroll={handleGalleryScroll}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth"
      >
        {uniqueImages.map((img, i) => (
          <div
            key={img}
            className="flex w-full shrink-0 snap-center items-center justify-center p-6 sm:p-8"
          >
            <img
              src={img}
              alt={`${lp?.name} ${i + 1}`}
              className="max-h-[34vh] w-auto max-w-full object-contain drop-shadow-xl md:max-h-[52vh]"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {uniqueImages.length > 1 && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 items-center justify-between px-3 md:flex">
            <button
              type="button"
              className={arrowBtn}
              onClick={() => scrollToImage(Math.max(0, activeImg - 1))}
              aria-label={t.a11y.prevSlide}
            >
              <FiChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              className={arrowBtn}
              onClick={() => scrollToImage(Math.min(uniqueImages.length - 1, activeImg + 1))}
              aria-label={t.a11y.nextSlide}
            >
              <FiChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
          </div>

          <div className="flex shrink-0 items-center justify-center gap-2 pb-4">
            {uniqueImages.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => scrollToImage(i)}
                aria-label={`${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeImg === i ? 'w-6 bg-brand' : 'w-2 bg-neutral-300 hover:bg-brand/60 dark:bg-neutral-600'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  const detailsPanel = (
    <div className="flex flex-col gap-5 p-5 sm:p-7">
      <div>
        {lp?.brand && (
          <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brand">
            {lp.brand}
          </span>
        )}
        <h2
          id="product-modal-title"
          className="mt-3 text-2xl font-bold leading-tight text-neutral-900 dark:text-white sm:text-3xl"
        >
          {lp?.name}
        </h2>
        {lp?.category && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{lp.category}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-current' : ''}`} />
            ))}
          </div>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {rating} ({reviews})
          </span>
        </div>
        <PriceDisplay
          price={price}
                    language={language}
          size="lg"
          className="ms-auto"
        />
      </div>

      {!hideSizes && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {t.a11y.bottleSize}
          </p>
          <SizeSelector selectedSize={selectedSize} onChange={setSelectedSize} product={product} />
        </div>
      )}

      {lp?.description && (
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{lp.description}</p>
      )}

      {ingredients.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {t.modal.ingredients}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {ingredients.map((note) => (
              <li
                key={note}
                className="rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-medium text-brand"
              >
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {benefits.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {t.modal.benefits}
          </h3>
          <ul className="space-y-1.5">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-300"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-1 flex items-center gap-2 text-sm">
        <span className="text-neutral-500 dark:text-neutral-400">{t.modal.availability}:</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {product.inStock !== false ? t.modal.inStock : t.modal.outOfStock}
        </span>
      </div>

      <div className="flex flex-col gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => openWhatsApp(buildSingleProductMessage(lineItem, price))}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#20bd5a]"
        >
          <FaWhatsapp className="h-5 w-5" />
          {t.modal.orderNow}
        </button>
        <div className="flex gap-3">
          <AddToCartButton
            onClick={handleAddToCart}
            disabled={product.inStock === false}
            variant="modal"
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => toggleWishlist({ ...product, price })}
            aria-label={inWishlist ? t.modal.saved : t.modal.wishlist}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition ${
              inWishlist
                ? 'border-red-300 bg-red-50 text-red-500'
                : 'border-neutral-200 text-neutral-500 hover:border-brand hover:text-brand dark:border-neutral-700'
            }`}
          >
            <FiHeart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
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
          {t.modal.viewFull}
        </button>
      </div>
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

      <div className="animate-modal-in relative z-[1] flex max-h-[100dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-neutral-900 sm:max-h-[92vh] sm:rounded-3xl md:flex-row">
        <button
          type="button"
          onClick={onClose}
          className="absolute end-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-neutral-700 shadow-md backdrop-blur transition hover:rotate-90 hover:text-brand sm:end-4 sm:top-4 dark:bg-neutral-800/95 dark:text-neutral-200"
          aria-label={t.modal.close}
        >
          <FiX className="h-5 w-5" />
        </button>

        <div className="h-[38vh] shrink-0 md:h-auto md:w-[55%]">{gallery}</div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain md:w-[45%]">{detailsPanel}</div>
      </div>
    </div>,
    document.body
  );
};

export default ProductDetailsModal;

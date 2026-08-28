import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import PriceDisplay from './PriceDisplay';

const BRAND_IMAGE_CONTEXT = require.context(
  '../../image/Perfume brands',
  true,
  /\.(?:png|jpe?g|webp)$/i
);

const FOLDER_BY_BRAND_ID = {
  afnan: 'Afnan',
  'al-majed-oud': 'Almajed Oud',
  assaf: 'Assaf',
  ibraq: 'Ibraq',
  'jean-antoine': 'Jean Antoine',
  match: 'Match',
  rasasi: 'Rasasi',
  reef: 'Reef',
};

const getPriceFromName = (name) => {
  const prices = name.match(/\b\d{3,4}\b/g) || [];
  const price = prices
    .map((value) => Number(value))
    .filter((value) => value >= 300 && value <= 10000)
    .pop();

  return price || null;
};

const normalizeProductName = (name) =>
  name
    .replace(/\s*\(\d+\)\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();

const getBrandProducts = (brandId) => {
  const folder = FOLDER_BY_BRAND_ID[brandId];
  if (!folder) return [];

  const grouped = BRAND_IMAGE_CONTEXT.keys()
    .filter((filePath) => filePath.startsWith(`./${folder}/`))
    .reduce((products, filePath) => {
      const fileName = filePath.split('/').pop().replace(/\.[^.]+$/, '');
      const name = normalizeProductName(fileName);
      const key = name.toLowerCase();
      const product = products[key] || { name, images: [], price: getPriceFromName(name) };
      product.images.push(BRAND_IMAGE_CONTEXT(filePath));
      product.price = product.price || getPriceFromName(fileName);
      products[key] = product;
      return products;
    }, {});

  return Object.values(grouped);
};

const BrandProductCard = ({ product, brandName, language }) => {
  const [activeImage, setActiveImage] = useState(0);
  const hasMultipleImages = product.images.length > 1;
  const showPrevious = () =>
    setActiveImage((index) => (index === 0 ? product.images.length - 1 : index - 1));
  const showNext = () =>
    setActiveImage((index) => (index + 1) % product.images.length);

  return (
    <article className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/60 hover:shadow-card-hover dark:border-neutral-800 dark:bg-neutral-900">
      <div className="relative aspect-square bg-neutral-50 p-4 dark:bg-neutral-950">
        <img
          src={product.images[activeImage]}
          alt={`${brandName} ${product.name}`}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              className="absolute start-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm transition hover:bg-brand hover:text-white dark:bg-neutral-800/90 dark:text-neutral-100"
              aria-label={language === 'ar' ? 'الصورة السابقة' : 'Previous product image'}
            >
              <FiChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm transition hover:bg-brand hover:text-white dark:bg-neutral-800/90 dark:text-neutral-100"
              aria-label={language === 'ar' ? 'الصورة التالية' : 'Next product image'}
            >
              <FiChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
            <span className="absolute bottom-2 start-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2 py-1 text-[0.65rem] font-semibold text-white">
              {activeImage + 1}/{product.images.length}
            </span>
          </>
        )}
      </div>
      <div className="p-4 text-center">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold uppercase tracking-[0.06em] text-neutral-800 dark:text-neutral-100">
          {product.name}
        </h3>
        {product.price ? (
          <PriceDisplay price={product.price} className="mt-2" />
        ) : (
          <p className="mt-2 text-sm font-semibold text-brand">Price on request</p>
        )}
      </div>
    </article>
  );
};

const BrandProductGallery = ({ brandId, brandName }) => {
  const { language } = useLanguage();
  const products = getBrandProducts(brandId);
  const imageCount = products.reduce((count, product) => count + product.images.length, 0);
  if (products.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="brand-gallery-title">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
            {brandName}
          </p>
          <h2 id="brand-gallery-title" className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
            {language === 'ar' ? 'منتجات البراند' : 'Brand products'}
          </h2>
        </div>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
          {products.length} products · {imageCount} photos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <BrandProductCard
            key={`${brandId}-${product.name}`}
            product={product}
            brandName={brandName}
            language={language}
          />
        ))}
      </div>
    </section>
  );
};

export default BrandProductGallery;
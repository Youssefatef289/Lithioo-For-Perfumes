import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ProductCard from './ProductCard';
import { getBrandGalleryProducts } from '../data/brandPrices';

const BrandProductGallery = ({ brandId, brandName }) => {
  const { language } = useLanguage();
  const products = getBrandGalleryProducts(brandId);
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
          <ProductCard
            key={`${brandId}-${product.name}`}
            product={{
              id: `brand-${brandId}-${product.name}`,
              name: product.name,
              nameEn: product.name,
              brand: brandName,
              brandId,
              section: 'original',
              category: 'Brand product',
              price: product.price || 0,
              image: product.images[0],
              imageHover: product.images[1] || product.images[0],
              detailImages: product.images,
              description: `${product.name} by ${brandName}.`,
              hideSizes: true,
              sizes: [],
              inStock: true,
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default BrandProductGallery;

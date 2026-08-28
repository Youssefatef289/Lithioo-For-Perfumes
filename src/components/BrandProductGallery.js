import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ProductCard from './ProductCard';

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
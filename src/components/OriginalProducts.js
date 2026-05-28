import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { allProducts } from '../data/products';
import { NEW_LUXURY_PRODUCTS } from '../data/newLuxuryProducts';
import ProductCard from './ProductCard';

const HOME_ORIGINALS_LIMIT = 12;

const OriginalProducts = () => {
  const { t } = useLanguage();

  const displayed = useMemo(() => {
    const originals = allProducts.filter((p) => p.section === 'original');
    const combined = [...NEW_LUXURY_PRODUCTS, ...originals];
    const seen = new Set();
    const unique = combined.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
    return unique.slice(0, HOME_ORIGINALS_LIMIT);
  }, []);

  return (
    <section
      className="w-full border-t border-neutral-100 bg-white py-12 dark:border-neutral-800 dark:bg-neutral-950 sm:py-16"
      id="originals"
    >
      <div className="section-inner max-w-wide">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 text-center sm:mb-10 sm:flex-row sm:text-start">
          <div>
            <h2 className="heading-section">{t.originals.title}</h2>
            <p className="text-muted-section mt-2 max-w-lg">{t.originals.subtitle}</p>
          </div>
          <Link to="/products?section=original" className="btn-outline shrink-0 px-6">
            {t.originals.viewAll}
          </Link>
        </div>
      </div>

      <div className="relative w-full">
        <div className="flex flex-nowrap gap-5 overflow-x-auto px-4 pb-3 no-scrollbar snap-x snap-mandatory scroll-smooth sm:gap-6 sm:px-6 lg:px-10">
          {displayed.map((product, index) => (
            <div
              key={product.id}
              className="w-[min(78vw,260px)] shrink-0 snap-start sm:w-[260px] md:w-[280px] lg:w-[300px]"
            >
              <ProductCard
                product={product}
                animationClass="animate-catalog-fade opacity-0"
                style={{ animationDelay: `${index * 45}ms` }}
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 start-0 hidden w-10 bg-gradient-to-r from-white to-transparent dark:from-neutral-950 md:block" />
        <div className="pointer-events-none absolute inset-y-0 end-0 hidden w-10 bg-gradient-to-l from-white to-transparent dark:from-neutral-950 md:block" />
      </div>
    </section>
  );
};

export default OriginalProducts;

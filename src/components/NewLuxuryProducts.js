import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { NEW_LUXURY_PRODUCTS } from '../data/newLuxuryProducts';
import ProductCard from './ProductCard';

const MARQUEE_DURATION_S = Math.max(40, NEW_LUXURY_PRODUCTS.length * 4);

const NewLuxuryProducts = () => {
  const { t } = useLanguage();

  const loop = [...NEW_LUXURY_PRODUCTS, ...NEW_LUXURY_PRODUCTS];

  return (
    <section className="relative w-full overflow-hidden border-t border-neutral-100 bg-white py-12 dark:border-neutral-800 dark:bg-neutral-950 sm:py-16">
      <div className="section-inner max-w-wide">
        <div className="mb-8 flex flex-col items-center gap-3 text-center sm:mb-10">
          <h2 className="heading-section">{t.newLuxury.title}</h2>
          <p className="text-muted-section max-w-xl">{t.newLuxury.subtitle}</p>
        </div>
      </div>

      <div
        className="group relative w-full overflow-hidden"
        aria-roledescription="carousel"
        aria-label={t.newLuxury.title}
      >
        <div
          className="flex w-max gap-5 px-4 hover:[animation-play-state:paused] rtl:[animation-direction:reverse] sm:gap-6 sm:px-6"
          style={{
            animation: `review-marquee ${MARQUEE_DURATION_S}s linear infinite`,
          }}
        >
          {loop.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="relative w-[78vw] shrink-0 sm:w-[300px] md:w-[320px]"
              aria-hidden={index >= NEW_LUXURY_PRODUCTS.length}
            >
              <ProductCard product={product} />
              <span className="pointer-events-none absolute end-3 top-3 z-10 rounded-full bg-brand/95 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
                {t.newLuxury.newTag || 'New'}
              </span>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 start-0 w-12 bg-gradient-to-r from-white to-transparent dark:from-neutral-950 sm:w-20" />
        <div className="pointer-events-none absolute inset-y-0 end-0 w-12 bg-gradient-to-l from-white to-transparent dark:from-neutral-950 sm:w-20" />
      </div>
    </section>
  );
};

export default NewLuxuryProducts;

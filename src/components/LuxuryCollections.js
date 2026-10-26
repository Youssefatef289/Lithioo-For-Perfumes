import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import { FEATURED_BRANDS, getBrandLabel } from '../data/brands';

const LuxuryCollections = () => {
  const { t, language, isRtl } = useLanguage();

  return (
    <section
      className="relative w-full border-b border-neutral-100 bg-white py-12 dark:border-neutral-800/80 dark:bg-neutral-950 sm:py-16"
      aria-labelledby="featured-brands-heading"
    >
      <div className="section-inner max-w-wide">
        {/* Section Header */}
        <div className="mb-8 text-center sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
            {isRtl ? 'بيوت العطور المختارة' : 'Curated Fragrance Houses'}
          </p>
          <h2
            id="featured-brands-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl md:text-4xl"
          >
            {t.luxury.title}
          </h2>
          <p className="mx-auto mt-2.5 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400 sm:text-base">
            {t.luxury.subtitle}
          </p>
        </div>

        {/* Brands Text-Only Cards Grid: 2 columns on mobile, 3 on sm, 4 on lg */}
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
          role="list"
          aria-label={isRtl ? 'قائمة البراندات' : 'Brands list'}
        >
          {FEATURED_BRANDS.map((brand, index) => {
            const primaryName = getBrandLabel(brand, language);
            const secondaryName = language === 'ar' ? brand.name : brand.nameAr;

            return (
              <div
                key={brand.id}
                role="listitem"
                className="group relative flex flex-col justify-between rounded-xl border border-neutral-200/90 bg-neutral-50/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:bg-white hover:shadow-lg dark:border-neutral-800/90 dark:bg-neutral-900/60 dark:hover:border-brand dark:hover:bg-neutral-900 dark:hover:shadow-brand/5 sm:p-5"
                style={{
                  animationDelay: `${Math.min(index, 10) * 40}ms`,
                }}
              >
                {/* Brand Text Header */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">
                      {isRtl ? 'علامة أصلية' : 'OFFICIAL'}
                    </span>
                    <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-neutral-900 transition-colors duration-200 group-hover:text-brand dark:text-white sm:text-lg">
                    {primaryName}
                  </h3>

                  {secondaryName && secondaryName !== primaryName ? (
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      {secondaryName}
                    </p>
                  ) : null}
                </div>

                {/* Enter Button */}
                <div className="mt-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60">
                  <Link
                    to={`/brand/${brand.id}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-300/80 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 shadow-sm transition-all duration-200 group-hover:border-brand group-hover:bg-brand group-hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:group-hover:border-brand dark:group-hover:bg-brand dark:group-hover:text-white sm:text-sm"
                  >
                    <span>{t.luxury.enter || (isRtl ? 'دخول' : 'Enter')}</span>
                    <FiArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LuxuryCollections;

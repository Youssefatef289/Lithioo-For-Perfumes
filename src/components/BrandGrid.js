import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getBrandLabel } from '../data/brands';
import { getBrandPriceSummary } from '../data/brandPrices';
import { formatEGP } from '../utils/price';
import { localizeDigits } from '../utils/digits';

const BrandGrid = ({ brands, activeBrandId = null, onBrandChange, className = '' }) => {
  const { language } = useLanguage();

  return (
    <div
      className={`flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-4 xl:grid-cols-6 ${className}`}
      style={{ msOverflowStyle: 'none' }}
      role="tablist"
      aria-label={language === 'ar' ? 'البراندات' : 'Brands'}
    >
      {brands.map((brand, index) => {
        const label = getBrandLabel(brand, language);
        const isActive = activeBrandId === brand.id;
        const summary = getBrandPriceSummary(brand);

        return (
          <button
            key={brand.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onBrandChange?.(brand.id)}
            className={[
              'group min-w-[148px] rounded-3xl border bg-white p-3 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-lg sm:min-w-0 dark:bg-neutral-900',
              isActive
                ? 'border-brand ring-2 ring-brand/15'
                : 'border-neutral-100 dark:border-neutral-800',
              'animate-catalog-fade opacity-0',
            ].join(' ')}
            style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
          >
            <div className="flex min-h-[110px] items-center justify-center rounded-2xl bg-neutral-50 p-4 transition-colors duration-300 group-hover:bg-brand/5 dark:bg-neutral-950 dark:group-hover:bg-brand/10">
              <img
                src={brand.logo}
                alt={label}
                loading="lazy"
                className="max-h-16 w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
              {label}
            </p>
            <p className="mt-0.5 min-h-[1.15rem] text-xs font-semibold text-brand">
              {summary != null && (
                <span dir="ltr">
                  {summary.min === summary.max
                    ? localizeDigits(formatEGP(summary.min), language)
                    : `${localizeDigits(formatEGP(summary.min), language)} – ${localizeDigits(formatEGP(summary.max), language)}`}
                </span>
              )}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default BrandGrid;

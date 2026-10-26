import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getBrandLabel, FEATURED_BRANDS } from '../data/brands';

const BrandGrid = ({ brands = FEATURED_BRANDS, activeBrandId = null, onBrandChange, className = '' }) => {
  const { language, isRtl } = useLanguage();

  return (
    <div
      className={`flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-4 xl:grid-cols-6 ${className}`}
      style={{ msOverflowStyle: 'none' }}
      role="list"
      aria-label={isRtl ? 'البراندات' : 'Brands'}
    >
      {brands.map((brand, index) => {
        const label = getBrandLabel(brand, language);
        const isActive = activeBrandId === brand.id;

        return (
          <Link
            key={brand.id}
            to={`/brand/${brand.id}`}
            onClick={() => {
              if (onBrandChange) {
                onBrandChange(brand.id);
              }
            }}
            className={[
              'group min-w-[148px] rounded-none border bg-transparent p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand sm:min-w-0',
              isActive
                ? 'border-brand ring-1 ring-brand/30'
                : 'border-neutral-200 dark:border-neutral-800',
              'animate-catalog-fade opacity-0',
            ].join(' ')}
            style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
          >
            <div className="flex min-h-[110px] items-center justify-center rounded-none bg-transparent p-4 transition-colors duration-300 group-hover:bg-brand/5 dark:group-hover:bg-brand/10">
              <img
                src={brand.logo}
                alt={label}
                loading="lazy"
                className="max-h-16 w-auto max-w-full object-contain filter transition-transform duration-300 group-hover:scale-105 dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]"
              />
            </div>
            <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
              {label}
            </p>
          </Link>
        );
      })}
    </div>
  );
};

export default BrandGrid;

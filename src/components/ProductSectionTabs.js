import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { PRODUCT_SECTIONS } from '../data/products';

const ProductSectionTabs = ({ activeSection, onChange, counts = {}, className = '' }) => {
  const { t } = useLanguage();

  return (
    <div
      className={className}
      role="tablist"
      aria-label={t.a11y.productSections}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {PRODUCT_SECTIONS.map((section) => {
          const active = activeSection === section.id;
          const count = counts[section.id];
          const label = t.sections[section.id];

          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(section.id)}
              className={[
                'rounded-xl border px-3 py-3 text-center text-sm font-semibold transition-all duration-200',
                active
                  ? 'border-brand bg-brand text-white shadow-md'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-brand/50 hover:text-brand dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:border-brand/50 dark:hover:text-brand',
              ].join(' ')}
            >
              <span className="block text-xs leading-tight sm:text-sm">{label}</span>
              {count != null && (
                <span
                  className={[
                    'mt-1 block text-[0.7rem] font-medium',
                    active ? 'text-white/85' : 'text-neutral-400 dark:text-neutral-500',
                  ].join(' ')}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductSectionTabs;

import React from 'react';
import { PRODUCT_SECTIONS } from '../data/products';

const ProductSectionTabs = ({ activeSection, onChange, counts = {}, className = '' }) => (
  <div className={`border-b border-neutral-200 dark:border-neutral-700 ${className}`}>
    <div
      className="flex gap-1 overflow-x-auto pb-px scrollbar-none sm:justify-center sm:gap-2"
      role="tablist"
      aria-label="Product sections"
    >
      {PRODUCT_SECTIONS.map((section) => {
        const active = activeSection === section.id;
        return (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(section.id)}
            className={[
              'relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors sm:px-6 sm:py-3.5 sm:text-base',
              active
                ? 'text-brand'
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200',
            ].join(' ')}
          >
            <span className="block whitespace-nowrap">{section.label}</span>
            <span className="mt-0.5 block text-[0.7rem] font-normal opacity-75 sm:text-xs">
              {section.labelAr}
            </span>
            {counts[section.id] != null && (
              <span
                className={[
                  'mt-1 block text-[0.65rem] font-medium sm:text-xs',
                  active ? 'text-brand/80' : 'text-neutral-400',
                ].join(' ')}
              >
                {counts[section.id]} items
              </span>
            )}
            {active && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand sm:inset-x-4" />
            )}
          </button>
        );
      })}
    </div>
  </div>
);

export default ProductSectionTabs;

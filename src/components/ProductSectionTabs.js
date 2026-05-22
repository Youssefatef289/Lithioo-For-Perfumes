import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { PRODUCT_SECTIONS } from '../data/products';

const ProductSectionTabs = ({ activeSection, onChange, counts = {}, className = '' }) => {
  const { t } = useLanguage();
  const scrollerRef = useRef(null);
  const tabRefs = useRef({});

  useEffect(() => {
    const node = tabRefs.current[activeSection];
    const scroller = scrollerRef.current;
    if (!node || !scroller) return;
    const nodeBox = node.getBoundingClientRect();
    const scrollerBox = scroller.getBoundingClientRect();
    const offset =
      node.offsetLeft - scroller.offsetLeft - scrollerBox.width / 2 + nodeBox.width / 2;
    scroller.scrollTo({ left: offset, behavior: 'smooth' });
  }, [activeSection]);

  return (
    <div
      className={`relative ${className}`}
      role="tablist"
      aria-label={t.a11y.productSections}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white to-transparent sm:hidden dark:from-neutral-950"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-white to-transparent sm:hidden dark:from-neutral-950"
        aria-hidden
      />

      <div
        ref={scrollerRef}
        className="-mx-4 flex items-center gap-1.5 overflow-x-auto px-4 no-scrollbar snap-x scroll-smooth sm:mx-0 sm:justify-center sm:gap-3 sm:overflow-visible sm:px-0"
      >
        {PRODUCT_SECTIONS.map((section) => {
          const active = activeSection === section.id;
          const count = counts[section.id];
          const label = t.sections[section.id];

          return (
            <button
              key={section.id}
              ref={(el) => {
                tabRefs.current[section.id] = el;
              }}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(section.id)}
              className={[
                'group relative inline-flex shrink-0 snap-center items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-all duration-300 sm:px-6 sm:py-2.5 sm:text-sm sm:tracking-[0.18em]',
                active
                  ? 'border border-brand text-brand'
                  : 'border border-transparent text-neutral-400 hover:text-brand dark:text-neutral-500 dark:hover:text-brand',
              ].join(' ')}
            >
              <span>{label}</span>
              {count != null && (
                <span
                  className={[
                    'text-[0.6rem] font-medium tracking-normal sm:text-[0.65rem]',
                    active ? 'text-brand/70' : 'text-neutral-400/80',
                  ].join(' ')}
                >
                  ({count})
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

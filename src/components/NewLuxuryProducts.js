import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import { NEW_LUXURY_PRODUCTS } from '../data/newLuxuryProducts';
import ProductCard from './ProductCard';

const NewLuxuryProducts = () => {
  const { t, language } = useLanguage();
  const scrollerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const left = Math.abs(el.scrollLeft);
    setCanPrev(left > 4);
    setCanNext(left < max - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows]);

  const scrollByCard = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector('[data-card]');
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.85;
    const isRtl = language === 'ar';
    const sign = isRtl ? -1 : 1;
    el.scrollBy({ left: direction * step * sign, behavior: 'smooth' });
  };

  const arrowBtn =
    'pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-md transition-all duration-300 hover:border-brand hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-brand dark:hover:text-white';

  return (
    <section className="relative w-full overflow-hidden border-t border-neutral-100 bg-white py-12 dark:border-neutral-800 dark:bg-neutral-950 sm:py-16">
      <div className="section-inner max-w-wide">
        <div className="mb-8 flex flex-col items-center gap-3 text-center sm:mb-10">
          <h2 className="heading-section">{t.newLuxury.title}</h2>
          <p className="text-muted-section max-w-xl">{t.newLuxury.subtitle}</p>
        </div>

        <div className="relative">
          <div
            ref={scrollerRef}
            className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-3 no-scrollbar snap-x snap-mandatory sm:gap-6 sm:px-0 sm:mx-0 scroll-smooth"
          >
            {NEW_LUXURY_PRODUCTS.map((product, index) => (
              <div
                key={product.id}
                data-card
                className="relative w-[78vw] shrink-0 snap-start sm:w-[300px] md:w-[320px]"
              >
                <ProductCard
                  product={product}
                  animationClass="animate-catalog-fade opacity-0"
                  style={{ animationDelay: `${index * 60}ms` }}
                />
                <span className="pointer-events-none absolute end-5 top-5 z-10 rounded-full bg-brand/95 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
                  {t.newLuxury.newTag || 'New'}
                </span>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute -top-14 right-0 hidden gap-2 sm:flex">
            <button
              type="button"
              className={arrowBtn}
              onClick={() => scrollByCard(-1)}
              disabled={!canPrev}
              aria-label={t.newLuxury.prev}
            >
              <FiChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              className={arrowBtn}
              onClick={() => scrollByCard(1)}
              disabled={!canNext}
              aria-label={t.newLuxury.next}
            >
              <FiChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewLuxuryProducts;

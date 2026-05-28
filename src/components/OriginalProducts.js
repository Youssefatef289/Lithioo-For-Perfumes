import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import { allProducts } from '../data/products';
import { NEW_LUXURY_PRODUCTS } from '../data/newLuxuryProducts';
import ProductCard from './ProductCard';

const HOME_ORIGINALS_LIMIT = 12;

const OriginalProducts = () => {
  const { t, language } = useLanguage();
  const scrollerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

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

        <div className="relative">
          <div
            ref={scrollerRef}
            className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-3 no-scrollbar snap-x snap-mandatory sm:gap-6 sm:px-0 sm:mx-0 scroll-smooth"
          >
            {displayed.map((product, index) => (
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

export default OriginalProducts;

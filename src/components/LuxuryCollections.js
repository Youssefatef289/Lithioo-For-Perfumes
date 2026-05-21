import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

const IMAGE_BY_ID = {
  diamond: '/image/luxury/diamond.webp',
  musk: '/image/luxury/musk.webp',
  tobacco: '/image/luxury/tobacco.webp',
  rose: '/image/luxury/rose.webp',
  leather: '/image/luxury/leather.webp',
  oud: '/image/luxury/oud.webp',
  ruby: '/image/luxury/ruby.webp',
};

const LuxuryCollections = () => {
  const { t, isRtl } = useLanguage();
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const items = t.luxury.items;

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setCanPrev(pos > 8);
    setCanNext(pos < max - 8);
  };

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return undefined;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, []);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(280, Math.floor(el.clientWidth * 0.7));
    const ltrDir = isRtl ? -dir : dir;
    el.scrollBy({ left: ltrDir * step, behavior: 'smooth' });
  };

  return (
    <section className="relative w-full bg-white py-12 dark:bg-neutral-950 sm:py-16">
      <div className="section-inner max-w-wide">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            {t.luxury.title}
          </h2>
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 sm:text-base">
            {t.luxury.subtitle}
          </p>
          <div className="mx-auto mt-4 flex items-center justify-center gap-2 text-neutral-300 dark:text-neutral-700">
            <span className="h-px w-16 bg-current sm:w-24" />
            <span className="h-2 w-2 rounded-full border-2 border-current" />
            <span className="h-px w-16 bg-current sm:w-24" />
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className={`absolute start-0 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/95 p-2 text-neutral-700 shadow-lg ring-1 ring-neutral-200 transition hover:text-brand dark:bg-neutral-800/95 dark:text-neutral-200 dark:ring-neutral-700 md:flex ${
              canPrev ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-label="Previous"
          >
            {isRtl ? <FiChevronRight className="h-5 w-5" /> : <FiChevronLeft className="h-5 w-5" />}
          </button>

          <div
            ref={trackRef}
            className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 pt-2 sm:gap-8"
          >
            {items.map((item) => (
              <Link
                key={item.id}
                to="/products?section=original"
                className="group flex w-[150px] shrink-0 snap-start flex-col items-center sm:w-[240px] lg:w-[270px]"
                aria-label={item.label}
              >
                <div className="relative flex h-[200px] w-full items-center justify-center sm:h-[230px] lg:h-[360px]">
                  <span
                    className="pointer-events-none absolute inset-x-0 select-none whitespace-nowrap text-center text-6xl font-extrabold tracking-tight text-brand/90 drop-shadow-sm sm:text-7xl lg:text-[5rem]"
                    aria-hidden
                  >
                    {item.label}
                  </span>
                  <img
                    src={IMAGE_BY_ID[item.id]}
                    alt={item.label}
                    className="relative z-10 h-full w-auto object-cover drop-shadow-xl transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollBy(1)}
            className={`absolute end-0 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/95 p-2 text-neutral-700 shadow-lg ring-1 ring-neutral-200 transition hover:text-brand dark:bg-neutral-800/95 dark:text-neutral-200 dark:ring-neutral-700 md:flex ${
              canNext ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-label="Next"
          >
            {isRtl ? <FiChevronLeft className="h-5 w-5" /> : <FiChevronRight className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </section>
  );
};

export default LuxuryCollections;

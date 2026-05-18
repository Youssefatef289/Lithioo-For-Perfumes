import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import { HERO_MOBILE_BG, HERO_SLIDES } from '../data/heroSlider';

const SLIDE_INTERVAL_MS = 5000;

const Hero = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const len = HERO_SLIDES.length;
  const slide = HERO_SLIDES[index];

  const go = useCallback(
    (dir) => {
      setIndex((i) => (i + dir + len) % len);
    },
    [len]
  );

  useEffect(() => {
    if (paused || len <= 1) return undefined;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % len), SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, len]);

  const textBlock = (
    <>
      <span className="mb-3 block text-center text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-brand md:text-start sm:text-xs">
        Lithioo Perfumes
      </span>
      <h1 className="text-center text-[1.5rem] font-bold leading-snug text-neutral-900 drop-shadow-sm dark:text-white md:text-start sm:text-3xl lg:text-[2.15rem] xl:text-4xl">
        {slide.line1}
      </h1>
      {slide.line2 ? (
        <p className="mt-3 text-center text-base font-medium leading-relaxed text-neutral-700 dark:text-neutral-200 md:text-start sm:mt-4 sm:text-lg">
          {slide.line2}
        </p>
      ) : null}
      <div className="flex justify-center md:justify-start">
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="btn-primary mt-5 shadow-md sm:mt-7"
        >
          {t.hero.buttonShop}
        </button>
      </div>
    </>
  );

  const dots = len > 1 && (
    <div className="mt-6 flex items-center justify-center gap-2 md:justify-start">
      {HERO_SLIDES.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onClick={() => setIndex(i)}
          className={`rounded-full transition-all duration-500 ease-out ${
            i === index
              ? 'h-1.5 w-7 bg-brand'
              : 'h-1.5 w-1.5 bg-neutral-400/90 hover:w-3 hover:bg-brand/70 dark:bg-neutral-500'
          }`}
          aria-label={`Slide ${i + 1}`}
          aria-current={i === index ? 'true' : undefined}
        />
      ))}
    </div>
  );

  return (
    <section
      className="relative mt-0 min-h-[100dvh] w-full overflow-hidden md:min-h-[min(92vh,860px)] lg:min-h-[min(94vh,900px)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Hero"
    >
      {/* Mobile background */}
      <div className="absolute inset-0 md:hidden" aria-hidden>
        <img
          src={HERO_MOBILE_BG}
          alt=""
          className="h-full w-full object-cover object-bottom"
          loading="eager"
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/95 via-white/75 to-white/15 dark:from-neutral-950/95 dark:via-neutral-950/70 dark:to-neutral-950/20" />
      </div>

      {/* Desktop background slides */}
      {HERO_SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 hidden transition-opacity duration-[1400ms] ease-in-out md:block ${
            i === index ? 'z-[1] opacity-100' : 'z-0 opacity-0'
          }`}
          aria-hidden={i !== index}
        >
          <img
            src={s.image}
            alt=""
            className={`h-full w-full object-cover ${i === index ? 'animate-hero-ken-burns' : 'scale-105'}`}
            style={{ objectPosition: s.imagePosition || 'center center' }}
            loading={i === 0 ? 'eager' : 'lazy'}
            draggable={false}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/85 via-white/40 to-transparent dark:from-neutral-950/88 dark:via-neutral-950/45 dark:to-transparent"
            aria-hidden
          />
        </div>
      ))}

      {/* Mobile — text at top, auto text slider */}
      <div className="relative z-[2] flex min-h-[inherit] flex-col md:hidden">
        <div className="w-full px-4 pb-6 pt-[5.25rem] sm:px-6 sm:pt-[5.75rem]">
          <div key={slide.id} className="animate-hero-fade-up min-h-[11rem]" aria-live="polite">
            {textBlock}
          </div>
          {dots}
        </div>
      </div>

      {/* Desktop — text left */}
      <div className="relative z-[2] hidden min-h-[inherit] items-center md:flex md:pt-24 lg:pt-28">
        <div className="section-inner-wide w-full px-4 pb-14 pt-4 sm:px-6 sm:pb-16 lg:pb-20">
          <div className="max-w-lg sm:max-w-xl">
            <div key={slide.id} className="animate-hero-fade-up" aria-live="polite">
              {textBlock}
            </div>
            {dots}
          </div>
        </div>
      </div>

      {/* Desktop arrows */}
      {len > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute start-2 top-1/2 z-[3] hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/70 text-neutral-700 backdrop-blur-sm transition hover:border-brand hover:text-brand dark:border-neutral-600 dark:bg-neutral-900/70 dark:text-white md:flex sm:start-4 sm:h-10 sm:w-10"
            aria-label="Previous slide"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute end-2 top-1/2 z-[3] hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/70 text-neutral-700 backdrop-blur-sm transition hover:border-brand hover:text-brand dark:border-neutral-600 dark:bg-neutral-900/70 dark:text-white md:flex sm:end-4 sm:h-10 sm:w-10"
            aria-label="Next slide"
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </section>
  );
};

export default Hero;

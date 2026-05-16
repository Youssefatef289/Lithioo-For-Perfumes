import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import { HERO_SLIDER_IMAGES } from '../data/heroSlider';

const SLIDE_INTERVAL_MS = 5500;

const Hero = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const len = HERO_SLIDER_IMAGES.length;

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

  const goHome = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <section
      className="relative mt-[88px] flex min-h-[calc(100vh-88px)] w-full overflow-hidden bg-gradient-to-b from-white via-surface-cream/30 to-white dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 sm:mt-[96px] sm:min-h-[calc(100vh-96px)] md:mt-[108px] md:min-h-[calc(100vh-108px)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-0 bg-mesh-light opacity-90 dark:bg-mesh-dark dark:opacity-100" aria-hidden />
      <div className="pointer-events-none absolute -end-32 top-1/4 h-72 w-72 rounded-full bg-brand/10 blur-3xl dark:bg-brand/5" aria-hidden />
      <div className="pointer-events-none absolute -start-24 bottom-1/4 h-64 w-64 rounded-full bg-accent/10 blur-3xl dark:bg-accent/5" aria-hidden />

      <div className="relative z-[1] flex w-full flex-1">
        <div className="section-inner-wide flex w-full flex-col-reverse items-center gap-10 py-12 md:flex-row md:gap-12 lg:gap-16 lg:py-16">
          <div className="flex w-full flex-col justify-center md:w-1/2 lg:ps-4">
            <div className="mx-auto flex max-w-xl flex-col text-center md:mx-0 md:text-start">
              <span className="mb-3 inline-flex self-center rounded-full border border-brand/25 bg-brand/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand dark:border-brand/30 dark:bg-brand/15 md:self-start">
                Lithioo
              </span>
              <h1 className="font-sans text-3xl font-bold leading-[1.15] tracking-tight text-neutral-900 dark:text-white sm:text-4xl md:text-5xl lg:text-[3.15rem]">
                <span className="block">{t.hero.title}</span>
                <span className="mt-1 block text-brand">{t.hero.titleLine2}</span>
              </h1>
              <p className="mt-5 max-w-md text-base font-medium italic leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg md:mx-0 md:max-w-[26rem]">
                {t.hero.tagline}
              </p>
              <div className="mt-8 flex w-full max-w-[340px] flex-col gap-3 self-center sm:flex-row sm:justify-center md:mx-0 md:max-w-none md:self-start md:justify-start">
                {/* <button type="button" onClick={goHome} className="btn-outline w-full sm:w-auto sm:min-w-[8rem]">
                  {t.hero.buttonHome}
                </button> */}
                <button type="button" onClick={() => navigate('/products')} className="btn-accent w-full shadow-xl sm:w-auto sm:min-w-[10rem]">
                  {t.hero.buttonShop}
                </button>
              </div>
            </div>
          </div>

          <div className="relative flex w-full min-h-[38vh] items-center justify-center md:w-1/2 md:min-h-0">
            <div className="pointer-events-none absolute inset-0 bg-hero-glow dark:opacity-40" aria-hidden />
            <div
              className="relative w-full max-w-lg px-2"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div className="pointer-events-none absolute inset-4 rounded-[2rem] bg-gradient-to-br from-brand/20 to-accent/10 blur-2xl dark:from-brand/10 dark:to-accent/5" aria-hidden />

              <div className="relative aspect-[4/5] w-full max-h-[min(72vh,520px)] overflow-hidden rounded-3xl bg-neutral-100 shadow-2xl ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 md:max-h-[min(80vh,620px)]">
                {HERO_SLIDER_IMAGES.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-out ${
                      i === index ? 'z-[1] opacity-100' : 'z-0 opacity-0'
                    }`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                ))}

                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute start-2 top-1/2 z-[2] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md backdrop-blur transition hover:bg-white dark:bg-neutral-900/90 dark:text-white dark:hover:bg-neutral-800"
                  aria-label="Previous slide"
                >
                  <FiChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute end-2 top-1/2 z-[2] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md backdrop-blur transition hover:bg-white dark:bg-neutral-900/90 dark:text-white dark:hover:bg-neutral-800"
                  aria-label="Next slide"
                >
                  <FiChevronRight className="h-6 w-6" />
                </button>

                <div className="absolute bottom-4 left-0 right-0 z-[2] flex justify-center gap-2">
                  {HERO_SLIDER_IMAGES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === index ? 'w-8 bg-brand' : 'w-2 bg-white/70 hover:bg-white dark:bg-neutral-600 dark:hover:bg-neutral-400'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div
                className="pointer-events-none absolute -bottom-1 left-1/2 z-0 h-8 w-[50%] -translate-x-1/2 rounded-full bg-gradient-to-b from-neutral-900/15 to-transparent opacity-80 blur-[14px] dark:from-white/15"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

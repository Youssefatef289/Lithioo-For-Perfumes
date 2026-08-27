import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { BRAND_LOGOS } from '../data/brands';

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 180, damping: 18 },
  },
};

const BrandCard = ({ brand, language }) => {
  const label = language === 'ar' ? brand.nameAr : brand.name;

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group min-w-[180px] flex-1 rounded-3xl border border-neutral-100 bg-white px-4 py-5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow duration-500 hover:shadow-[0_8px_28px_rgba(0,0,0,0.1)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] sm:min-w-[200px]"
    >
      <div className="flex h-[120px] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-50 via-white to-neutral-50 p-4 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800">
        <img
          src={brand.logo}
          alt={label}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="max-h-[82px] max-w-full object-contain grayscale transition-all duration-500 ease-out group-hover:grayscale-0"
        />
      </div>
      <span className="mt-4 line-clamp-1 block text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
    </motion.article>
  );
};

const BrandsSlider = () => {
  const { t, language } = useLanguage();
  const sliderRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return undefined;

    const interval = setInterval(() => {
      const maxScroll = slider.scrollWidth - slider.clientWidth;

      if (slider.scrollLeft >= maxScroll - 10) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      slider.scrollBy({
        left: 220,
        behavior: 'smooth',
      });
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative w-full border-t border-neutral-100 bg-white py-12 dark:border-neutral-800 dark:bg-neutral-950 sm:py-16"
      aria-labelledby="brands-slider-title"
    >
      <div className="section-inner max-w-wide">
        <header className="mb-8 flex flex-col items-center gap-3 text-center sm:mb-10">
          <h2 id="brands-slider-title" className="heading-section">
            {t.brands.title}
          </h2>
          <p className="text-muted-section max-w-xl">{t.brands.subtitle}</p>
          <div className="mt-1 flex items-center justify-center gap-2 text-neutral-300 dark:text-neutral-700">
            <span className="h-px w-16 bg-current sm:w-24" />
            <span className="h-2 w-2 rounded-full border-2 border-current" />
            <span className="h-px w-16 bg-current sm:w-24" />
          </div>
        </header>

        <motion.div
          ref={sliderRef}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.07,
              },
            },
          }}
          className="flex gap-4 overflow-x-auto pb-3 scroll-smooth [scrollbar-width:none]"
          style={{ msOverflowStyle: 'none' }}
        >
          {BRAND_LOGOS.map((brand) => (
            <div key={brand.id} className="flex-shrink-0">
              <BrandCard brand={brand} language={language} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BrandsSlider;

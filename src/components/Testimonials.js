import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import CustomerReviewsSlider from './CustomerReviewsSlider';

const Testimonials = () => {
  const { t } = useLanguage();

  return (
    <section className="testimonials w-full border-y border-neutral-100/80 bg-surface-cream/50 py-12 dark:border-neutral-800 dark:bg-neutral-900/60 sm:py-16 md:py-20">
      <div className="section-inner max-w-wide">
        <div className="slide-up mb-8 text-center sm:mb-10">
          <h2 className="heading-section">{t.testimonials.title}</h2>
          <p className="text-muted-section mx-auto mt-4 max-w-2xl">{t.testimonials.subtitle}</p>
        </div>

        <div className="slide-up">
          <CustomerReviewsSlider />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

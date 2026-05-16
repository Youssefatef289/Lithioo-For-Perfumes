import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const PromotionalBanner = () => {
  const { t } = useLanguage();

  return (
    <section className="promotional-banner relative overflow-hidden bg-gradient-to-br from-brand/18 via-surface-cream/40 to-accent/10 py-14 dark:from-brand/10 dark:via-neutral-950 dark:to-neutral-900 sm:py-16 md:py-20">
      <div className="section-inner relative max-w-content">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="slide-left space-y-5 text-center lg:text-start">
            <h2 className="heading-section !text-2xl leading-snug sm:!text-3xl md:!text-4xl">{t.promotional.title}</h2>
            <p className="text-muted-section">{t.promotional.description}</p>
            <div className="mx-auto h-1.5 w-20 rounded-full bg-gradient-to-r from-brand to-accent lg:mx-0" />
          </div>
          <div className="relative hidden min-h-[200px] lg:block" aria-hidden>
            <div className="absolute end-10 top-0 h-40 w-40 rounded-full bg-brand/25 blur-2xl" />
            <div className="absolute bottom-0 start-10 h-24 w-48 rotate-12 rounded-full bg-brand/20 blur-xl" />
            <div className="absolute end-[20%] top-[15%] h-3 w-3 rounded-full bg-brand" />
            <div className="absolute end-[30%] top-[40%] h-2 w-2 rounded-full bg-brand/70" />
            <div className="absolute bottom-[25%] start-[25%] h-2.5 w-2.5 rounded-full bg-brand" />
            <div className="absolute bottom-[10%] end-[15%] h-2 w-2 rounded-full bg-brand/60" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromotionalBanner;

import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { FiGift, FiTag, FiPercent } from 'react-icons/fi';

const OFFER_ICONS = [FiGift, FiTag, FiPercent];

const PromotionalBanner = () => {
  const { t } = useLanguage();
  const offers = t.promotional.offers ?? [];

  return (
    <section className="promotional-banner relative overflow-hidden bg-gradient-to-br from-brand/18 via-surface-cream/40 to-accent/10 py-14 dark:from-brand/10 dark:via-neutral-950 dark:to-neutral-900 sm:py-16 md:py-20">
      <div className="pointer-events-none absolute -end-24 top-0 h-64 w-64 rounded-full bg-brand/15 blur-3xl" aria-hidden />
      <div className="section-inner relative max-w-wide">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="slide-right relative order-first flex justify-center lg:order-none">
            <div
              className="absolute -start-4 -top-4 -z-0 h-28 w-28 rounded-full bg-brand/20 blur-xl sm:h-36 sm:w-36"
              aria-hidden
            />
            <div className="relative z-[1] w-full max-w-md overflow-hidden rounded-2xl border border-brand/15 bg-white/60 shadow-2xl shadow-brand/10 dark:border-brand/25 dark:bg-neutral-900/60">
              <img
                src="/image/promo-lifestyle-bottle.png"
                alt="Lithioo perfume bottle"
                className="h-auto w-full object-cover transition duration-500 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          </div>

          <div className="slide-left space-y-6 text-center lg:text-start">
            <div>
              <h2 className="heading-section !text-2xl leading-snug sm:!text-3xl md:!text-4xl">
                {t.promotional.title}
              </h2>
              {t.promotional.subtitle ? (
                <p className="text-muted-section mt-3">{t.promotional.subtitle}</p>
              ) : null}
              <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-gradient-to-r from-brand to-accent lg:mx-0" />
            </div>

            <ul className="space-y-4">
              {offers.map((offer, index) => {
                const Icon = OFFER_ICONS[index] ?? FiTag;
                return (
                  <li key={offer.id}>
                    <div
                      className="flex items-start gap-4 rounded-xl border border-brand/15 bg-white/80 p-4 text-start shadow-sm backdrop-blur-sm transition hover:border-brand/35 hover:shadow-md dark:border-brand/20 dark:bg-neutral-900/80"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-white shadow-md">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="inline-block rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-semibold text-brand dark:bg-brand/25 dark:text-brand-light">
                          {offer.badge}
                        </span>
                        <p className="text-base font-medium leading-relaxed text-neutral-800 dark:text-neutral-100 sm:text-lg">
                          {offer.text}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="pt-2">
              <Link
                to="/products"
                className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 text-sm sm:text-base"
              >
                {t.promotional.shopNow}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromotionalBanner;

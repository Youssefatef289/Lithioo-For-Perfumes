import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiDroplet, FiHeart } from 'react-icons/fi';
import WhyChooseUs from '../components/WhyChooseUs';
import { useLanguage } from '../contexts/LanguageContext';
import { observeElements } from '../utils/animations';

const About = () => {
  const { t } = useLanguage();
  const { aboutPage } = t;

  const values = [
    {
      Icon: FiAward,
      title: 'Authentic Quality',
      text: 'Every fragrance is selected for lasting projection and a refined finish.',
    },
    {
      Icon: FiDroplet,
      title: 'Curated Selection',
      text: "Men's, women's, and oriental collections — something for every taste.",
    },
    {
      Icon: FiHeart,
      title: 'Customer First',
      text: 'Personal guidance and flexible sizes so you shop with confidence.',
    },
  ];

  useEffect(() => {
    observeElements();
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="page-main w-full bg-white dark:bg-neutral-950">
      <section className="relative overflow-hidden border-b border-neutral-100 bg-gradient-to-br from-brand/10 via-surface-cream/60 to-white px-4 py-16 dark:border-neutral-800 dark:from-brand/5 dark:via-neutral-900 dark:to-neutral-950 sm:py-20">
        <div className="pointer-events-none absolute -end-20 top-0 h-56 w-56 rounded-full bg-brand/15 blur-3xl" aria-hidden />
        <div className="section-inner relative max-w-3xl text-center">
          <img
            src="/image/logo/leithioo-logo-gold.png"
            alt="Lithioo For Perfumes"
            className="mx-auto mb-6 h-16 w-auto object-contain sm:h-20"
          />
          <h1 className="heading-section">{aboutPage.title}</h1>
          <p className="text-muted-section mx-auto mt-5 max-w-2xl leading-relaxed">{aboutPage.subtitle}</p>
          <div className="mx-auto mt-8 flex flex-wrap justify-center gap-8 sm:gap-12">
            {aboutPage.highlights.map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-3xl font-bold text-brand sm:text-4xl">{item.value}</p>
                <p className="mt-1 text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:py-16 md:py-20">
        <div className="section-inner max-w-wide">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="slide-left space-y-5">
              <h2 className="heading-section !text-2xl sm:!text-3xl">{aboutPage.storyTitle}</h2>
              <p className="text-muted-section leading-relaxed">{aboutPage.story}</p>
              <h2 className="heading-section !text-xl sm:!text-2xl">{aboutPage.missionTitle}</h2>
              <p className="text-muted-section leading-relaxed">{aboutPage.mission}</p>
            </div>
            <div className="slide-right flex justify-center">
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-brand/15 shadow-2xl shadow-brand/10 dark:border-brand/25">
                <img
                  src="/image/promo-lifestyle-bottle.png"
                  alt="Lithioo perfume bottle"
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-3 sm:gap-6">
            {values.map(({ Icon, title, text }) => (
              <div
                key={title}
                className="card-elevated slide-up flex flex-col items-center p-6 text-center sm:items-start sm:text-start"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 text-brand">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhyChooseUs />

      <section className="bg-gradient-to-r from-brand/15 via-brand/10 to-accent/10 px-4 py-14 dark:from-brand/10 dark:via-neutral-900 dark:to-neutral-900 sm:py-16">
        <div className="section-inner max-w-2xl text-center">
          <h2 className="heading-section !text-2xl sm:!text-3xl">Ready to find your scent?</h2>
          <p className="text-muted-section mt-4">
            Browse our full catalog — men&apos;s, women&apos;s, and oriental fragrances in every size.
          </p>
          <Link to="/products" className="btn-primary mt-8 inline-flex px-10 py-3.5">
            {aboutPage.cta}
          </Link>
        </div>
      </section>
    </main>
  );
};

export default About;

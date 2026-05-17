import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FiAward, FiDroplet, FiClock } from 'react-icons/fi';

const WhyChooseUs = () => {
  const { t } = useLanguage();

  const features = [
    {
      Icon: FiAward,
      title: t.whyChoose.features.quality,
      description: t.whyChoose.features.qualityDesc,
    },
    {
      Icon: FiDroplet,
      title: t.whyChoose.features.ingredients,
      description: t.whyChoose.features.ingredientsDesc,
    },
    {
      Icon: FiClock,
      title: t.whyChoose.features.experience,
      description: t.whyChoose.features.experienceDesc,
    },
  ];

  return (
    <section className="why-choose-us w-full bg-white py-12 dark:bg-neutral-950 sm:py-16 md:py-20">
      <div className="section-inner max-w-wide">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="slide-right relative order-first flex justify-center lg:order-none">
            <div className="absolute -start-5 -top-5 -z-0 h-32 w-32 rounded-full bg-brand/90 animate-soft-pulse sm:h-36 sm:w-36" aria-hidden />
            <div
              className="absolute start-[10%] top-[20%] z-[1] h-10 w-10 animate-float bg-brand [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]"
              style={{ animationDelay: '0s' }}
              aria-hidden
            />
            <div
              className="absolute end-[15%] top-[30%] z-[1] h-10 w-10 animate-float bg-brand/80 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]"
              style={{ animationDelay: '1s' }}
              aria-hidden
            />
            <div className="relative z-[2] w-full max-w-md overflow-hidden rounded-xl shadow-2xl">
              <img
                src="/image/Perfume (6).jpg"
                alt=""
                className="h-auto w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>
          </div>

          <div className="slide-left flex flex-col gap-6 text-center lg:text-start">
            <h2 className="heading-section">{t.whyChoose.title}</h2>
            <p className="text-muted-section leading-relaxed">{t.whyChoose.description}</p>
            <ul className="mt-2 flex flex-col gap-5 text-start">
              {features.map(({ Icon, title, description }) => (
                <li
                  key={title}
                  className="flex items-start gap-4 rounded-xl border border-neutral-100 bg-surface-muted/40 p-4 transition hover:border-brand/30 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-800/40"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="m-0 text-base font-bold text-neutral-900 dark:text-white">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FiUser, FiStar } from 'react-icons/fi';

const Testimonials = () => {
  const { t } = useLanguage();

  const testimonials = [
    {
      id: 1,
      name: 'Jennifer Angela',
      review: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      rating: 5,
      timeAgo: '3 weeks ago',
    },
    {
      id: 2,
      name: 'Jason Calera',
      review: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      rating: 5,
      timeAgo: '1 week ago',
    },
    {
      id: 3,
      name: 'Angelina Katyler',
      review: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      rating: 5,
      timeAgo: '2 weeks ago',
    },
  ];

  return (
    <section className="testimonials w-full border-y border-neutral-100/80 bg-surface-cream/50 py-12 dark:border-neutral-800 dark:bg-neutral-900/60 sm:py-16 md:py-20">
      <div className="section-inner max-w-content">
        <div className="slide-up mb-10 text-center sm:mb-14">
          <h2 className="heading-section">{t.testimonials.title}</h2>
          <p className="text-muted-section mx-auto mt-4 max-w-2xl">{t.testimonials.subtitle}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`card-elevated flex flex-col items-center p-6 text-center slide-up stagger-${index + 1}`}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/15 text-brand dark:bg-brand/25">
                <FiUser className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-100">{testimonial.name}</h3>
              <p className="mb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{testimonial.review}</p>
              <div className="mb-2 flex gap-0.5 text-amber-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FiStar key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">{testimonial.timeAgo}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 border-t border-neutral-200 pt-10 text-sm font-semibold tracking-wide text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
          {['LOGOIPSUM', 'LOGOIPSUM', 'LOGO IPSUM', 'LOGOIPSUM', 'LOGOIPSUM'].map((label, i) => (
            <div
              key={label + i}
              className={`rounded-lg px-3 py-2 ${i === 2 ? 'text-brand ring-2 ring-brand/30' : ''}`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

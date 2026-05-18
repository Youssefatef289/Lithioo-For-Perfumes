import React from 'react';
import { CUSTOMER_REVIEW_IMAGES } from '../data/customerReviews';

const CustomerReviewsSlider = () => {
  const track = [...CUSTOMER_REVIEW_IMAGES, ...CUSTOMER_REVIEW_IMAGES];

  return (
    <div className="group relative w-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-y-0 start-0 z-10 w-12 bg-gradient-to-r from-surface-cream/50 to-transparent dark:from-neutral-900/60 sm:w-20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 end-0 z-10 w-12 bg-gradient-to-l from-surface-cream/50 to-transparent dark:from-neutral-900/60 sm:w-20"
        aria-hidden
      />

      <div className="flex w-max animate-review-marquee items-center gap-4 py-2 group-hover:[animation-play-state:paused] sm:gap-5">
        {track.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="h-[200px] w-[140px] shrink-0 overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-md dark:border-neutral-700 dark:bg-neutral-800 sm:h-[240px] sm:w-[170px] md:h-[280px] md:w-[200px]"
          >
            <img
              src={src}
              alt={`Customer review ${(index % CUSTOMER_REVIEW_IMAGES.length) + 1}`}
              className="h-full w-full object-cover object-top"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerReviewsSlider;

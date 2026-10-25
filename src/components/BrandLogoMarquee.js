import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BRAND_LOGOS } from '../data/brands';
import { useLanguage } from '../contexts/LanguageContext';

const BrandCard = ({ brand, isRtl }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const displayName = isRtl ? brand.nameAr || brand.name : brand.name;

  return (
    <Link
      to={`/brand/${encodeURIComponent(brand.id)}`}
      className="group/card relative flex h-[100px] w-[170px] shrink-0 items-center justify-center rounded-2xl p-3 transition-all duration-300 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 sm:h-[120px] sm:w-[200px] sm:p-4 md:h-[150px] md:w-[240px] md:p-6"
      title={displayName}
      aria-label={displayName}
    >
      {!imgFailed && brand.logo ? (
        <img
          src={brand.logo}
          alt={displayName}
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
          className="max-h-full max-w-full object-contain filter grayscale contrast-100 opacity-70 transition-all duration-300 group-hover/card:scale-110 group-hover/card:grayscale-0 group-hover/card:opacity-100 dark:brightness-125 dark:contrast-125 dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.28)]"
        />
      ) : (
        <span className="line-clamp-2 px-3 text-center text-sm font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-100 select-none">
          {displayName}
        </span>
      )}
    </Link>
  );
};

const BrandLogoMarquee = () => {
  const { isRtl } = useLanguage();
  const track = [...BRAND_LOGOS, ...BRAND_LOGOS];

  return (
    <section
      className="group/marquee relative w-full overflow-hidden border-b border-neutral-100/90 bg-white py-10 dark:border-neutral-900 dark:bg-neutral-950 sm:py-12 md:py-14"
      aria-label={isRtl ? 'أشهر الماركات العالمية' : 'Featured Luxury Brands'}
    >
      {/* Small section header */}
      <div className="section-inner mb-6 text-center sm:mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 sm:text-sm">
          {isRtl ? 'أشهر الماركات العالمية المختارة' : 'Selected Luxury Fragrance Houses'}
        </h2>
        <div className="mx-auto mt-2.5 h-0.5 w-12 rounded-full bg-brand/50 dark:bg-brand/40" />
      </div>

      {/* Marquee slider viewport */}
      <div className="relative w-full overflow-hidden">
        {/* Left edge gradient mask */}
        <div
          className="pointer-events-none absolute inset-y-0 start-0 z-10 w-16 bg-gradient-to-r rtl:bg-gradient-to-l from-white dark:from-neutral-950 to-transparent sm:w-28 md:w-40"
          aria-hidden="true"
        />

        {/* Right edge gradient mask */}
        <div
          className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 bg-gradient-to-l rtl:bg-gradient-to-r from-white dark:from-neutral-950 to-transparent sm:w-28 md:w-40"
          aria-hidden="true"
        />

        {/* Infinite scrolling track */}
        <div
          className={`flex w-max items-center gap-6 py-2 sm:gap-8 md:gap-12 ${
            isRtl ? 'animate-brand-marquee-rtl' : 'animate-brand-marquee-ltr'
          } hover:[animation-play-state:paused] group-hover/marquee:[animation-play-state:paused]`}
        >
          {track.map((brand, idx) => (
            <BrandCard key={`${brand.id}-${idx}`} brand={brand} isRtl={isRtl} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandLogoMarquee;

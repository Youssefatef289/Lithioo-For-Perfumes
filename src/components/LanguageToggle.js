import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const SEGMENTS = [
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'ع' },
];

const LanguageToggle = ({ className = '', variant = 'segmented', overHero = false, darkHero = false }) => {
  const { language, setLanguage, t } = useLanguage();
  const nextLang = language === 'ar' ? 'en' : 'ar';

  if (variant === 'pill') {
    return (
      <button
        type="button"
        className={`flex w-full shrink-0 items-center justify-center gap-2 rounded-none border-2 border-brand px-3 py-2 text-sm font-bold uppercase tracking-wider text-brand transition-all hover:-translate-y-0.5 hover:bg-brand hover:text-white hover:shadow-md ${className}`}
        onClick={() => setLanguage(nextLang)}
        aria-label={t.a11y.switchLanguage}
      >
        <span>{language === 'ar' ? 'English' : 'العربية'}</span>
      </button>
    );
  }

  const trackBase = darkHero
    ? 'border-white/30 bg-white/10 backdrop-blur-sm'
    : overHero
    ? 'border-neutral-900/15 bg-white/40 backdrop-blur-sm'
    : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800';

  const inactiveText = darkHero
    ? 'text-white/80 hover:text-white'
    : overHero
    ? 'text-neutral-900 hover:text-brand'
    : 'text-neutral-500 hover:text-brand dark:text-neutral-400';

  return (
    <div
      className={`flex shrink-0 items-center gap-0.5 rounded-none border p-0.5 transition-all ${trackBase} ${className}`}
      role="group"
      aria-label={t.a11y.switchLanguage}
    >
      {SEGMENTS.map((seg) => {
        const active = language === seg.code;
        return (
          <button
            key={seg.code}
            type="button"
            onClick={() => setLanguage(seg.code)}
            aria-pressed={active}
            className={[
              'flex h-8 min-w-[2rem] items-center justify-center rounded-none px-2 text-sm font-bold leading-none transition-all duration-300',
              active ? 'bg-brand text-white shadow-sm' : inactiveText,
            ].join(' ')}
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageToggle;

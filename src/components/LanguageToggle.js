import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const FLAG_SRC = {
  ar: '/image/flags/egypt.svg',
  en: '/image/flags/uk.svg',
};

const FlagIcon = ({ lang, className = 'h-5 w-5 rounded-sm object-cover shadow-sm' }) => (
  <img src={FLAG_SRC[lang]} alt="" className={className} aria-hidden />
);

const LanguageToggle = ({ className = '', variant = 'icon' }) => {
  const { language, setLanguage, t } = useLanguage();
  const nextLang = language === 'ar' ? 'en' : 'ar';

  const baseIcon =
    'flex shrink-0 items-center justify-center rounded-lg border-2 border-brand text-brand transition-all hover:-translate-y-0.5 hover:bg-brand hover:text-white hover:shadow-md dark:border-brand dark:text-brand';
  const basePill =
    'flex shrink-0 items-center justify-center gap-2 rounded-lg border-2 border-brand px-3 py-2 text-sm font-semibold text-brand transition-all hover:-translate-y-0.5 hover:bg-brand hover:text-white hover:shadow-md dark:text-brand';

  const handleClick = () => setLanguage(nextLang);

  if (variant === 'pill') {
    return (
      <button
        type="button"
        className={`${basePill} w-full ${className}`}
        onClick={handleClick}
        aria-label={t.a11y.switchLanguage}
      >
        <FlagIcon lang={language} />
        <span>{language === 'ar' ? t.a11y.languageAr : t.a11y.languageEn}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`${baseIcon} h-10 w-10 overflow-hidden p-1.5 ${className}`}
      onClick={handleClick}
      aria-label={t.a11y.switchLanguage}
      title={language === 'ar' ? t.a11y.languageEn : t.a11y.languageAr}
    >
      <FlagIcon lang={language} className="h-full w-full rounded object-cover" />
    </button>
  );
};

export default LanguageToggle;

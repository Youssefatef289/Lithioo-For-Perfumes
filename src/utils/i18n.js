import { translations } from '../i18n/translations';

export const getCurrentLanguage = () => {
  try {
    const saved = localStorage.getItem('language');
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    /* ignore */
  }
  const htmlLang = typeof document !== 'undefined' ? document.documentElement.lang : '';
  return htmlLang === 'ar' ? 'ar' : 'en';
};

export const getT = () => translations[getCurrentLanguage()];

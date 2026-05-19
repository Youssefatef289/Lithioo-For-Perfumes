import { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { localizeProduct } from '../utils/localizeProduct';

export const useLocalizedProduct = (product) => {
  const { language } = useLanguage();
  return useMemo(() => (product ? localizeProduct(product, language) : null), [product, language]);
};

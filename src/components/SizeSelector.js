import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { BOTTLE_SIZES, getSizeById, getProductSizePrice } from '../data/sizes';
import { formatEGP } from '../utils/price';

const SizeSelector = ({
  selectedSize,
  onChange,
  showPrices = false,
  className = '',
  product = null,
}) => {
  const { t, language } = useLanguage();

  return (
  <div
    className={`flex flex-wrap gap-1.5 ${className}`}
    role="group"
    aria-label={t.a11y.bottleSize}
    onClick={(e) => e.stopPropagation()}
  >
    {BOTTLE_SIZES.map((size) => {
      const active = selectedSize === size.id;
      const meta = getSizeById(size.id, language);
      const displayPrice = product ? getProductSizePrice(product, size.id) : meta.price;
      return (
        <button
          key={size.id}
          type="button"
          onClick={() => onChange(size.id)}
          className={[
            'rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all duration-200',
            active
              ? 'border-brand bg-brand text-white shadow-sm'
              : 'border-neutral-200 bg-white text-neutral-600 hover:border-brand hover:text-brand dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
          ].join(' ')}
          aria-pressed={active}
        >
          {meta.label}
          {showPrices && <span className="ms-1 opacity-80">· {formatEGP(displayPrice)}</span>}
        </button>
      );
    })}
  </div>
  );
};

export default SizeSelector;

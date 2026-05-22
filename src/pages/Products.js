import React, { useEffect } from 'react';
import ProductCatalog from '../components/ProductCatalog';
import { useLanguage } from '../contexts/LanguageContext';

const Products = () => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="page-main w-full bg-white dark:bg-neutral-950">
      <section
        className="relative flex h-[55vh] min-h-[320px] w-full items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat sm:h-[60vh] md:h-[65vh]"
        style={{ backgroundImage: 'url(/image/hero/products-hero.jpg)' }}
        aria-label={t.nav.product}
      >
        <div className="absolute inset-0 bg-black/55" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" aria-hidden />
        <div className="relative z-10 px-4 text-center">
          <h1 className="text-3xl font-light tracking-[0.25em] text-white sm:text-4xl md:text-5xl">
            {t.nav.product}
          </h1>
        </div>
      </section>

      <ProductCatalog />
    </main>
  );
};

export default Products;

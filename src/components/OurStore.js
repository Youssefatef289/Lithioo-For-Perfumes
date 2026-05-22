import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { allProducts, PRODUCT_SECTIONS } from '../data/products';
import ProductCard from './ProductCard';
import ProductSectionTabs from './ProductSectionTabs';

const HOME_PRODUCTS_LIMIT = 4;

const OurStore = () => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('men');

  const counts = useMemo(
    () =>
      PRODUCT_SECTIONS.reduce((acc, section) => {
        acc[section.id] = allProducts.filter((p) => p.section === section.id).length;
        return acc;
      }, {}),
    []
  );

  const sectionProducts = useMemo(
    () => allProducts.filter((p) => p.section === activeSection),
    [activeSection]
  );

  const displayedProducts = sectionProducts.slice(0, HOME_PRODUCTS_LIMIT);
  const sectionLabel = t.sections[activeSection];

  return (
    <section className="our-store w-full bg-white py-12 dark:bg-neutral-950 sm:py-16 md:py-20" id="product">
      <div className="section-inner max-w-wide">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="heading-section">{t.store.title}</h2>
          <p className="text-muted-section mx-auto mt-3 max-w-xl">{t.store.subtitle}</p>
        </div>

        <ProductSectionTabs
          activeSection={activeSection}
          onChange={setActiveSection}
          counts={counts}
          className="mb-8"
        />

        <div className="mb-8 flex flex-col items-start justify-between gap-3 rounded-2xl border border-neutral-100 bg-white px-5 py-4 dark:border-neutral-800 dark:bg-neutral-950 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white sm:text-xl">{sectionLabel}</h3>
          </div>
          <p className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-semibold text-brand">
            {sectionProducts.length} {t.store.productsCount}
          </p>
        </div>

        {displayedProducts.length === 0 ? (
          <p className="py-12 text-center text-neutral-500 dark:text-neutral-400">{t.store.noProducts}</p>
        ) : (
          <div
            key={activeSection}
            className="-mx-4 flex flex-nowrap gap-5 overflow-x-auto px-4 pb-2 pt-1 snap-x snap-mandatory md:mx-0 md:gap-6 md:overflow-visible md:px-0"
          >
            {displayedProducts.map((product, index) => (
              <div
                key={`${product.id}-${activeSection}`}
                className="w-[min(78vw,260px)] shrink-0 snap-start md:w-auto md:min-w-0 md:flex-1 md:basis-0"
              >
                <ProductCard
                  product={product}
                  animationClass="animate-catalog-fade opacity-0"
                  style={{ animationDelay: `${index * 45}ms` }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to={`/products?section=${activeSection}`} className="btn-primary min-w-[200px]">
            {t.store.viewAll} {sectionLabel}
          </Link>
          <Link to="/products" className="btn-outline min-w-[200px]">
            {t.store.fullCatalog}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OurStore;

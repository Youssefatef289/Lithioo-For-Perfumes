import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { allProducts } from '../data/products';
import ProductCard from './ProductCard';

const OurStore = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('Featured');
  const [currentPage, setCurrentPage] = useState(1);

  const filters = [
    { key: 'All', label: t.store.filters.all },
    { key: 'Featured', label: t.store.filters.featured },
    { key: 'Top Selling', label: t.store.filters.topSelling },
    { key: 'Sale', label: t.store.filters.sale },
    { key: 'New', label: t.store.filters.new },
  ];

  const productsPerPage = 8;
  const startIndex = (currentPage - 1) * productsPerPage;
  const displayedProducts = allProducts.slice(startIndex, startIndex + productsPerPage);
  const totalPages = Math.ceil(allProducts.length / productsPerPage);

  const filterBtn = (active) =>
    [
      'rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium transition dark:border-neutral-600',
      active
        ? 'border-brand bg-brand text-white shadow-md'
        : 'bg-white text-neutral-600 hover:border-brand hover:text-brand dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-brand',
    ].join(' ');

  const pageBtn = (active, disabled) =>
    [
      'min-w-[2.5rem] rounded-lg border px-3 py-2 text-sm font-medium transition',
      disabled
        ? 'cursor-not-allowed border-neutral-200 text-neutral-300 dark:border-neutral-700 dark:text-neutral-600'
        : active
          ? 'border-brand bg-brand text-white'
          : 'border-neutral-200 bg-white text-neutral-700 hover:border-brand hover:text-brand dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200',
    ].join(' ');

  return (
    <section className="our-store w-full bg-white py-12 dark:bg-neutral-950 sm:py-16 md:py-20" id="product">
      <div className="section-inner max-w-wide">
        <h2 className="heading-section slide-up mb-8 text-center sm:mb-10">{t.store.title}</h2>
        <div className="slide-up mb-10 flex flex-wrap justify-center gap-2 sm:gap-3">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={filterBtn(activeFilter === filter.key)}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              animationClass={`slide-up stagger-${(index % 4) + 1}`}
            />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className={pageBtn(false, currentPage === 1)}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ←
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              type="button"
              className={pageBtn(currentPage === page, false)}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            className={pageBtn(false, currentPage === totalPages)}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
};

export default OurStore;

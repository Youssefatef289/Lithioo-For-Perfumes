import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { allProducts, PRODUCT_SECTIONS } from '../data/products';
import ProductCard from './ProductCard';
import ProductSectionTabs from './ProductSectionTabs';

const PRODUCTS_PER_PAGE = 12;
const VALID_SECTIONS = ['men', 'women', 'special', 'original'];

const resolveSection = (value) => (VALID_SECTIONS.includes(value) ? value : 'men');

const ProductCatalog = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionFromUrl = resolveSection(searchParams.get('section'));
  const [activeSection, setActiveSection] = useState(sectionFromUrl);
  const [currentPage, setCurrentPage] = useState(1);

  const sectionMatches = (product, sectionId) => {
    if (sectionId === 'original') {
      return product.section === 'original' || product.section === 'new-luxury';
    }
    return product.section === sectionId;
  };

  const counts = useMemo(
    () =>
      PRODUCT_SECTIONS.reduce((acc, section) => {
        acc[section.id] = allProducts.filter((p) => sectionMatches(p, section.id)).length;
        return acc;
      }, {}),
    []
  );

  const sectionProducts = useMemo(
    () => allProducts.filter((p) => sectionMatches(p, activeSection)),
    [activeSection]
  );

  const totalPages = Math.max(1, Math.ceil(sectionProducts.length / PRODUCTS_PER_PAGE));
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const displayedProducts = sectionProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const sectionLabel = t.sections[activeSection];

  useEffect(() => {
    setActiveSection(sectionFromUrl);
    setCurrentPage(1);
  }, [sectionFromUrl]);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setCurrentPage(1);
    setSearchParams({ section: sectionId }, { replace: true });
  };

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
    <section className="w-full bg-white pb-16 pt-4 dark:bg-neutral-950 sm:pb-20 md:pt-6">
      <div className="section-inner max-w-wide">
        {/* Page title */}
        <div className="mb-8 text-center md:mb-10">
          <h1 className="heading-section">{t.productsPage.title}</h1>
          <p className="text-muted-section mx-auto mt-3 max-w-xl">{t.productsPage.subtitle}</p>
        </div>

        <ProductSectionTabs
          activeSection={activeSection}
          onChange={handleSectionChange}
          counts={counts}
          className="mb-8"
        />

        {/* Active section header */}
        <div
          key={activeSection}
          className="mb-8 flex flex-col items-start justify-between gap-3 rounded-2xl border border-neutral-100 bg-white px-5 py-4 dark:border-neutral-800 dark:bg-neutral-950 sm:flex-row sm:items-center"
        >
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">{sectionLabel}</h2>
          </div>
          <p className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-semibold text-brand">
            {sectionProducts.length} {t.store.productsCount}
          </p>
        </div>

        {/* Product grid */}
        {displayedProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 py-16 text-center dark:border-neutral-700">
            <p className="text-neutral-500 dark:text-neutral-400">{t.productsPage.noProducts}</p>
          </div>
        ) : (
          <div
            id="catalog-grid"
            key={`${activeSection}-page-${currentPage}`}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {displayedProducts.map((product, index) => (
              <ProductCard
                key={`${product.id}-${activeSection}`}
                product={product}
                animationClass="animate-catalog-fade opacity-0"
                style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              className={pageBtn(false, currentPage === 1)}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label={t.a11y.prevPage}
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && page - prev > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && <span className="px-1 text-neutral-400">…</span>}
                    <button
                      type="button"
                      className={pageBtn(currentPage === page, false)}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}
            <button
              type="button"
              className={pageBtn(false, currentPage === totalPages)}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label={t.a11y.nextPage}
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCatalog;

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { allProducts, PRODUCT_SECTIONS } from '../data/products';
import { BRAND_LOGOS, getBrandById, getBrandLabel } from '../data/brands';
import ProductCard from './ProductCard';
import ProductSectionTabs from './ProductSectionTabs';
import BrandGrid from './BrandGrid';

const PRODUCTS_PER_PAGE = 12;
const VALID_SECTIONS = ['all', 'men', 'women', 'special', 'new-diverse', 'original'];

const resolveSection = (value) => (VALID_SECTIONS.includes(value) ? value : 'all');

const ProductCatalog = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionFromUrl = resolveSection(searchParams.get('section'));
  const brandFromUrl = searchParams.get('brand');
  const [activeSection, setActiveSection] = useState(sectionFromUrl);
  const [activeBrand, setActiveBrand] = useState(brandFromUrl);
  const [currentPage, setCurrentPage] = useState(1);

  const sectionMatches = (product, sectionId) => {
    if (sectionId === 'all') return true;
    if (sectionId === 'original') return product.section === 'original' || product.section === 'new-luxury';
    return product.section === sectionId;
  };

  const counts = useMemo(() => {
    const sectionCounts = PRODUCT_SECTIONS.reduce((acc, section) => {
      acc[section.id] = allProducts.filter((p) => sectionMatches(p, section.id)).length;
      return acc;
    }, {});
    return { all: allProducts.length, ...sectionCounts };
  }, []);

  const sectionProducts = useMemo(
    () => allProducts.filter((p) => sectionMatches(p, activeSection)),
    [activeSection]
  );

  const activeBrandData = activeBrand ? getBrandById(activeBrand) : null;
  const brandProducts = useMemo(() => {
    if (!activeBrandData) return [];
    return allProducts.filter((product) => product.brandId === activeBrandData.id);
  }, [activeBrandData]);

  const visibleProducts = activeBrandData ? brandProducts : sectionProducts;
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PRODUCTS_PER_PAGE));
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const displayedProducts = visibleProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  const sectionLabel = activeSection === 'all' ? t.header.allProducts : t.sections[activeSection];
  const activeBrandName = activeBrandData ? getBrandLabel(activeBrandData, language) : '';

  useEffect(() => {
    setActiveSection(sectionFromUrl);
    setActiveBrand(brandFromUrl);
    setCurrentPage(1);
  }, [sectionFromUrl, brandFromUrl]);

  const updateSearch = (nextSection, nextBrand = null) => {
    const params = {};
    if (nextSection && nextSection !== 'all') params.section = nextSection;
    if (nextBrand) params.brand = nextBrand;
    setSearchParams(params, { replace: true });
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setActiveBrand(null);
    setCurrentPage(1);
    updateSearch(sectionId);
  };

  const handleBrandClear = () => {
    setActiveBrand(null);
    setCurrentPage(1);
    updateSearch(activeSection);
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
        <div className="mb-8 text-center md:mb-10">
          <h1 className="heading-section">{t.productsPage.title}</h1>
          <p className="text-muted-section mx-auto mt-3 max-w-xl">{t.productsPage.subtitle}</p>
        </div>

        <section className="mb-8 rounded-3xl border border-neutral-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                {t.header.brandsShort}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                {t.brands.title}
              </h2>
            </div>
          </div>
          <BrandGrid
            brands={BRAND_LOGOS}
            activeBrandId={activeBrand}
            onBrandChange={(brandId) => {
              setActiveBrand(brandId);
              setCurrentPage(1);
              updateSearch(activeSection, brandId);
            }}
          />
        </section>

        {activeBrandData && (
          <section className="mb-8 overflow-hidden rounded-[2rem] border border-neutral-100 bg-gradient-to-br from-neutral-950 via-neutral-900 to-brand px-5 py-6 text-white shadow-2xl dark:border-neutral-800 sm:px-6 sm:py-8 md:px-8">
            <div className="relative">
              <div className="absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" aria-hidden />
              <div className="absolute -bottom-14 start-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-brand/30 blur-3xl" aria-hidden />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.25rem] border border-white/15 bg-white/10 p-3 shadow-lg backdrop-blur-sm sm:h-24 sm:w-24">
                    <img
                      src={activeBrandData.logo}
                      alt={activeBrandName}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white/70">
                      {t.header.brandsShort}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold sm:text-3xl md:text-4xl">
                      {activeBrandName}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                      {t.brands.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                  <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                    {visibleProducts.length} {t.store.productsCount}
                  </div>
                  <button
                    type="button"
                    onClick={handleBrandClear}
                    className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
                  >
                    {t.productPage.back}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {!activeBrandData && (
          <ProductSectionTabs
            activeSection={activeSection}
            onChange={handleSectionChange}
            counts={counts}
            showAll
            className="mb-8"
          />
        )}

        <div className="mb-8 flex flex-col items-start justify-between gap-3 rounded-2xl border border-neutral-100 bg-white px-5 py-4 dark:border-neutral-800 dark:bg-neutral-950 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            {activeBrandData && (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-100 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
                <img
                  src={activeBrandData.logo}
                  alt={getBrandLabel(activeBrandData, language)}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
                {activeBrandData ? getBrandLabel(activeBrandData, language) : sectionLabel}
              </h2>
              {activeBrandData && (
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {t.header.brandsTitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-semibold text-brand">
              {visibleProducts.length} {t.store.productsCount}
            </p>
            {activeBrandData && (
              <button
                type="button"
                onClick={handleBrandClear}
                className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-brand hover:text-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
              >
                {t.productPage.back}
              </button>
            )}
          </div>
        </div>

        {displayedProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 py-16 text-center dark:border-neutral-700">
            <p className="text-neutral-500 dark:text-neutral-400">{t.productsPage.noProducts}</p>
          </div>
        ) : (
          <div
            id="catalog-grid"
            key={`${activeSection}-${activeBrand || 'all'}-page-${currentPage}`}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {displayedProducts.map((product, index) => (
              <ProductCard
                key={`${product.id}-${activeSection}-${activeBrand || 'all'}`}
                product={product}
                animationClass="animate-catalog-fade opacity-0"
                style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
              />
            ))}
          </div>
        )}

        {!activeBrandData && (
          <div className="mt-12">
            <BrandGrid brands={BRAND_LOGOS} />
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

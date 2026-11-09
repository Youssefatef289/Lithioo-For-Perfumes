import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { allProducts, PRODUCT_SECTIONS } from '../data/products';
import { fetchAllProducts, subscribeToProducts } from '../services/products';
import { fetchOffers } from '../services/sections';
import { FEATURED_BRANDS } from '../data/brands';
import ProductCard from './ProductCard';
import ProductSectionTabs from './ProductSectionTabs';
import BrandGrid from './BrandGrid';

const PRODUCTS_PER_PAGE = 12;
const VALID_SECTIONS = ['all', 'men', 'women', 'special', 'new-diverse', 'original'];

const resolveSection = (value) => (VALID_SECTIONS.includes(value) ? value : 'all');

const ProductCatalog = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionFromUrl = resolveSection(searchParams.get('section'));
  const brandFromUrl = searchParams.get('brand');
  const [activeSection, setActiveSection] = useState(sectionFromUrl);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsList, setProductsList] = useState(allProducts);
  const [activeOffers, setActiveOffers] = useState([]);

  // Live Supabase Sync & Realtime Subscription
  useEffect(() => {
    let isMounted = true;
    async function syncData() {
      try {
        const [prods, offers] = await Promise.all([
          fetchAllProducts(),
          fetchOffers(),
        ]);
        if (isMounted) {
          if (prods && prods.length > 0) setProductsList(prods);
          if (offers) setActiveOffers(offers.filter((o) => o.is_active));
        }
      } catch (err) {
        console.warn('Realtime sync fallback:', err);
      }
    }

    syncData();
    let unsub = () => {};
    try {
      unsub = subscribeToProducts(() => {
        syncData();
      });
    } catch (e) {
      console.warn('ProductCatalog subscribe notice:', e);
    }

    return () => {
      isMounted = false;
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // If URL has ?brand=, navigate immediately to /brand/:brandId
  useEffect(() => {
    if (brandFromUrl) {
      navigate(`/brand/${brandFromUrl}`, { replace: true });
    }
  }, [brandFromUrl, navigate]);

  const catalogProducts = useMemo(() => {
    const raw = productsList;

    const cleanKey = (product) => {
      const section = product.section || '';
      const brand = (product.brand || '').toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');
      const name = (product.nameEn || product.name || '')
        .toLowerCase()
        .replace(/\b(?:edp|eau de parfum|eau de toilette|for men|for women|unisex|perfume|100ml|150ml|200ml)\b/g, '')
        .replace(/\s*\(\s*\d+\s*(?:ml)?\s*\)/gi, '')
        .replace(/\s*\(\s*\d+\s*\)\s*(?:\d{3,4}\s*(?:egp|ج)?)?$/gi, '')
        .replace(/(?:\d{3,4}\s*(?:egp|ج)?)\s*\(\s*\d+\s*\)$/gi, '')
        .replace(/\s*\(\s*\d+\s*\)\s*$/g, '')
        .replace(/[\s\-_#]+(\d+|[a-z])\s*$/gi, '')
        .replace(/[\s\-_#]+$/g, '')
        .replace(/[^a-z0-9\u0600-\u06FF]/g, '')
        .trim();
      return `${section}::${brand}::${name}`;
    };

    const merged = new Map();
    raw.forEach((product) => {
      const key = cleanKey(product);
      if (merged.has(key)) {
        const existing = merged.get(key);
        const allImgs = [
          ...(existing.detailImages || [existing.image, existing.imageHover]),
          ...(product.detailImages || [product.image, product.imageHover]),
        ].filter(Boolean);
        existing.detailImages = [...new Set(allImgs)];
      } else {
        const baseImgs = [
          ...(product.detailImages || [product.image, product.imageHover]),
        ].filter(Boolean);
        merged.set(key, {
          ...product,
          detailImages: [...new Set(baseImgs)],
        });
      }
    });

    return Array.from(merged.values());
  }, [productsList]);

  const sectionMatches = (product, sectionId) => {
    if (sectionId === 'all') return true;
    if (Array.isArray(product.sections) && product.sections.includes(sectionId)) return true;
    if (sectionId === 'original') {
      return (
        product.section === 'original' ||
        product.section === 'new-luxury' ||
        (Array.isArray(product.sections) &&
          (product.sections.includes('original') || product.sections.includes('new-luxury')))
      );
    }
    return product.section === sectionId;
  };

  const counts = useMemo(() => {
    const sectionCounts = PRODUCT_SECTIONS.reduce((acc, section) => {
      acc[section.id] = catalogProducts.filter((p) => sectionMatches(p, section.id)).length;
      return acc;
    }, {});
    return { all: catalogProducts.length, ...sectionCounts };
  }, [catalogProducts]);

  const sectionProducts = useMemo(
    () => catalogProducts.filter((p) => sectionMatches(p, activeSection)),
    [catalogProducts, activeSection]
  );

  const totalPages = Math.max(1, Math.ceil(sectionProducts.length / PRODUCTS_PER_PAGE));
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const displayedProducts = sectionProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  const sectionLabel = activeSection === 'all' ? t.header.allProducts : t.sections[activeSection];

  useEffect(() => {
    setActiveSection(sectionFromUrl);
    setCurrentPage(1);
  }, [sectionFromUrl]);

  const updateSearch = (nextSection) => {
    const params = {};
    if (nextSection && nextSection !== 'all') params.section = nextSection;
    setSearchParams(params, { replace: true });
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setCurrentPage(1);
    updateSearch(sectionId);
  };

  const pageBtn = (active, disabled) =>
    [
      'min-w-[2.5rem] rounded-none border px-3 py-2 text-sm font-medium transition',
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

        {/* Brands Grid Section */}
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
            brands={FEATURED_BRANDS}
            onBrandChange={(brandId) => {
              navigate(`/brand/${brandId}`);
            }}
          />
        </section>

        {/* Active Promotional Offer Sections */}
        {activeOffers.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {activeOffers.map((offer) => {
              const title = language === 'ar' ? offer.title_ar || offer.title_en : offer.title_en || offer.title_ar;
              const desc = language === 'ar' ? offer.description_ar : offer.description_en;
              return (
                <div
                  key={offer.id}
                  className="relative flex items-center overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-r from-brand/10 via-brand/5 to-transparent p-4 sm:p-5"
                >
                  {offer.image_url && (
                    <img
                      src={offer.image_url}
                      alt=""
                      className="h-20 w-20 rounded-xl object-cover shrink-0 me-4 border border-brand/20"
                    />
                  )}
                  <div className="flex flex-col justify-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
                      {language === 'ar' ? 'عرض خاص مميز' : 'Exclusive Offer'}
                      {offer.discount_percentage ? ` • ${offer.discount_percentage}%` : ''}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                      {title}
                    </h3>
                    {desc && <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{desc}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Section Tabs */}
        <ProductSectionTabs
          activeSection={activeSection}
          onChange={handleSectionChange}
          counts={counts}
          showAll
          className="mb-8"
        />

        {/* Catalog Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-3 rounded-2xl border border-neutral-100 bg-white px-5 py-4 dark:border-neutral-800 dark:bg-neutral-950 sm:flex-row sm:items-center">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
            {sectionLabel}
          </h2>
          <p className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-semibold text-brand">
            {sectionProducts.length} {t.store.productsCount}
          </p>
        </div>

        {/* Products Grid */}
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

        {/* Pagination */}
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
                return (
                  <React.Fragment key={page}>
                    {prev && page - prev > 1 && (
                      <span className="px-2 text-neutral-400">…</span>
                    )}
                    <button
                      type="button"
                      className={pageBtn(page === currentPage, false)}
                      onClick={() => {
                        setCurrentPage(page);
                        const el = document.getElementById('catalog-grid');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
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

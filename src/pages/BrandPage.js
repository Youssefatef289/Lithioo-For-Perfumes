import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPackage } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import { BRAND_LOGOS, getBrandById, getBrandLabel, getBrandIdByName } from '../data/brands';
import { allProducts } from '../data/products';
import { getBrandGalleryProducts } from '../data/brandPrices';
import ProductCard from '../components/ProductCard';

const BrandPage = () => {
  const { brandId } = useParams();
  const { language, isRtl } = useLanguage();

  const brand = useMemo(() => {
    if (!brandId) return null;
    const direct = getBrandById(brandId);
    if (direct) return direct;
    return (
      BRAND_LOGOS.find((b) => b.id.toLowerCase() === brandId.toLowerCase()) || {
        id: brandId,
        name: brandId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        nameAr: '',
        logo: null,
      }
    );
  }, [brandId]);

  const brandProducts = useMemo(() => {
    if (!brand) return [];
    const brandIdNorm = brand.id.toLowerCase();
    const brandNameLower = brand.name?.trim().toLowerCase();
    const brandArLower = (brand.nameAr || '').trim().toLowerCase();

    // 1. Catalog products matching this brand
    const catalogMatches = allProducts.filter((product) => {
      const pBrandId = (product.brandId || getBrandIdByName(product.brand) || '').toLowerCase();
      if (pBrandId === brandIdNorm) return true;
      if (!product.brand) return false;
      const pb = product.brand.trim().toLowerCase();
      return pb === brandNameLower || (brandArLower && pb === brandArLower);
    });

    // 2. Gallery products for this brand
    const galleryMatches = getBrandGalleryProducts(brand.id) || [];

    // Helper for normalizing product titles (strips size, brand suffix, trailing numbers/symbols/parentheses)
    const cleanKey = (str) =>
      (str || '')
        .toLowerCase()
        .replace(/\b(?:edp|eau de parfum|eau de toilette|for men|for women|unisex|perfume|100ml|150ml|200ml|by assaf|by ibraq|by afnan|by le bonheur|by ibraheem al qurashi|by ibrahim al qurashi)\b/g, '')
        .replace(/\s*\(\s*\d+\s*\)\s*(?:\d{3,4}\s*(?:egp|ج)?)?$/gi, '')
        .replace(/(?:\d{3,4}\s*(?:egp|ج)?)\s*\(\s*\d+\s*\)$/gi, '')
        .replace(/\s*\(\s*\d+\s*\)\s*$/g, '')
        .replace(/[\s\-_#]+(\d+|[a-z])\s*$/gi, '')
        .replace(/[\s\-_#]+$/g, '')
        .replace(/[^a-z0-9\u0600-\u06FF]/g, '')
        .trim();

    // 1. Enhance catalog matches with gallery images if available
    const enhancedCatalogMatches = catalogMatches.map((product) => {
      const key = cleanKey(product.nameEn || product.name);
      const matchedGallery = galleryMatches.find((gp) => cleanKey(gp.name) === key);
      if (!matchedGallery || !matchedGallery.images?.length) return product;

      const combinedImages = [
        ...(product.detailImages || [product.image, product.imageHover]),
        ...matchedGallery.images,
      ].filter(Boolean);
      const uniqueImages = [...new Set(combinedImages)];

      return {
        ...product,
        image: product.image || uniqueImages[0],
        imageHover: product.imageHover || uniqueImages[1] || uniqueImages[0],
        detailImages: uniqueImages,
      };
    });

    const catalogKeys = new Set(
      catalogMatches.map((p) => cleanKey(p.nameEn || p.name))
    );

    // 2. Convert gallery products not in catalog to full product cards, merging duplicate variants
    const extraByKey = new Map();

    galleryMatches.forEach((gp) => {
      const key = cleanKey(gp.name);
      if (catalogKeys.has(key)) return; // already merged with catalog!

      if (extraByKey.has(key)) {
        const existing = extraByKey.get(key);
        gp.images.forEach((img) => {
          if (!existing.images.includes(img)) existing.images.push(img);
        });
        if (!existing.price && gp.price) existing.price = gp.price;
      } else {
        extraByKey.set(key, { ...gp, images: [...gp.images] });
      }
    });

    const extraGalleryCards = Array.from(extraByKey.values()).map((gp, index) => ({
      id: `brand-gallery-${brand.id}-${index}-${gp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: gp.name,
      nameEn: gp.name,
      nameAr: gp.name,
      brand: brand.name,
      brandAr: brand.nameAr || brand.name,
      brandId: brand.id,
      section: 'original',
      category: brand.name,
      categoryAr: brand.nameAr || brand.name,
      price: gp.price || 0,
      image: gp.images[0],
      imageHover: gp.images[1] || gp.images[0],
      detailImages: gp.images,
      description: `${gp.name} by ${brand.name}.`,
      descriptionAr: `${gp.name} من ${brand.nameAr || brand.name}.`,
      ingredients: ['Natural Oils', 'Signature Accords', 'Luxury Base Notes'],
      ingredientsAr: ['زيوت عطرية نقية', 'نفحات مميزة', 'قاعدة شرقية فاخرة'],
      benefits: ['Long lasting fragrance', 'Authentic brand packaging'],
      benefitsAr: ['ثبات عالي يدوم طويلاً', 'تغليف أصلي معتمد'],
      hideSizes: true,
      sizes: [],
      inStock: true,
      rating: 4.8,
      reviews: 35 + ((index * 7) % 40),
    }));

    return [...enhancedCatalogMatches, ...extraGalleryCards];
  }, [brand]);

  const displayName = brand ? getBrandLabel(brand, language) : '';
  const secondaryName = isRtl ? brand?.name : brand?.nameAr;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (displayName) {
      document.title = `${displayName} | Lithioo Perfumes`;
    } else {
      document.title = 'Lithioo Perfumes';
    }
  }, [displayName]);

  if (!brand) {
    return (
      <main className="page-main min-h-[70vh] bg-white px-4 py-16 pt-24 dark:bg-neutral-950 sm:px-6 sm:pt-28 md:pt-32 lg:px-8">
        <div className="section-inner max-w-3xl text-center">
          <h1 className="heading-section">
            {isRtl ? 'البراند غير موجود' : 'Brand Not Found'}
          </h1>
          <p className="text-muted-section mx-auto mt-4 max-w-md">
            {isRtl
              ? 'عذراً، لم نتمكن من العثور على هذا البراند. يمكنك استكشاف بقية العطور المتوفرة لدينا.'
              : 'Sorry, we could not find this brand. Please explore our full fragrance catalog.'}
          </p>
          <div className="mt-8">
            <Link to="/products" className="btn-primary rounded-none shadow-none">
              {isRtl ? 'تصفح كل المنتجات' : 'Browse All Products'}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-main min-h-screen bg-white pb-20 pt-24 dark:bg-neutral-950 sm:pt-28 md:pt-32">
      <div className="section-inner max-w-wide">
        {/* Back button to Products */}
        <div className="mb-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-brand dark:text-neutral-400 dark:hover:text-brand"
          >
            <FiArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <span>{isRtl ? 'الرجوع إلى صفحة المنتجات' : 'Back to Products'}</span>
          </Link>
        </div>

        {/* Brand Header Banner */}
        <div className="relative mb-10 overflow-hidden rounded-none border border-neutral-200 bg-transparent p-6 dark:border-neutral-800 sm:p-8 md:p-10">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-start">
            {/* Brand Logo */}
            {brand.logo ? (
              <div className="flex h-28 w-32 shrink-0 items-center justify-center rounded-none border border-neutral-200 bg-transparent p-4 dark:border-neutral-800 sm:h-32 sm:w-40 md:h-36 md:w-44">
                <img
                  src={brand.logo}
                  alt={displayName}
                  className="max-h-full max-w-full object-contain filter transition duration-300 dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                />
              </div>
            ) : null}

            {/* Brand Information */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                  {isRtl ? 'دار عطور مميزة' : 'Luxury Fragrance House'}
                </span>
                {secondaryName && secondaryName !== displayName && (
                  <span className="rounded-none bg-neutral-200/60 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {secondaryName}
                  </span>
                )}
              </div>

              <h1 className="heading-section !text-2xl sm:!text-3xl md:!text-4xl">
                {displayName}
              </h1>

              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-none bg-brand/10 px-3.5 py-1 text-xs font-semibold text-brand dark:bg-brand/20 sm:text-sm">
                  <FiPackage className="h-4 w-4" />
                  <span>
                    {brandProducts.length}{' '}
                    {isRtl
                      ? brandProducts.length === 1
                        ? 'منتج متوفر'
                        : 'منتجات متوفرة'
                      : brandProducts.length === 1
                      ? 'product available'
                      : 'products available'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {brandProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {brandProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="my-12 rounded-none border border-dashed border-neutral-200 p-10 text-center dark:border-neutral-800 sm:p-14">
            <FiPackage className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-600" />
            <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white sm:text-xl">
              {isRtl ? 'لا توجد منتجات متوفرة حالياً' : 'No Products Available'}
            </h3>
            <p className="text-muted-section mx-auto mt-2 max-w-md text-sm">
              {isRtl
                ? `لم يتم العثور على منتجات حالياً للبراند "${displayName}". تصفح باقي تشكيلاتنا الفاخرة.`
                : `Currently no products available for "${displayName}". Please check our other collections.`}
            </p>
            <div className="mt-6">
              <Link to="/products" className="btn-primary rounded-none shadow-none">
                {isRtl ? 'تصفح كل المنتجات' : 'Browse All Products'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default BrandPage;

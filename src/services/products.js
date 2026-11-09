/**
 * src/services/products.js
 * Data layer for products — Supabase when configured, static fallback otherwise.
 * Supports realtime synchronization across admin and storefront.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { allProducts } from '../data/products';

const PRODUCT_SELECT = `
  id, slug, name_en, name_ar,
  description_en, description_ar,
  ingredients_en, ingredients_ar,
  benefits_en, benefits_ar,
  base_price, sale_price, discount_percent, discount_label, discount_starts_at, discount_ends_at,
  hide_sizes, in_stock, stock_status, offer_link, is_featured, is_new,
  rating, reviews_count,
  image_url, image_hover_url, detail_images,
  sort_order, is_active,
  brands:brand_id ( id, slug, name_en, name_ar, logo_url ),
  sections:section_id ( id, slug, name_en, name_ar ),
  section_products ( section_id, sections:section_id ( id, slug, name_en, name_ar ) ),
  categories:category_id ( id, slug, name_en ),
  product_sizes ( size_id, label_en, label_ar, price, in_stock )
`;

/** Normalise a Supabase product row into the storefront product shape */
export function normalizeProduct(row) {
  if (!row) return null;
  const brand = row.brands;
  const primarySection = row.sections?.slug ?? 'new-diverse';

  // Gather all linked section slugs from primary section and section_products
  const joinedSections = (row.section_products || [])
    .map((sp) => sp.sections?.slug)
    .filter(Boolean);
  const allSectionsList = Array.from(new Set([primarySection, ...joinedSections]));

  const effectiveStock = row.stock_status
    ? row.stock_status !== 'out_of_stock'
    : row.in_stock !== false;

  return {
    id:               row.slug ?? row.id,
    dbId:             row.id,
    name:             row.name_en,
    nameEn:           row.name_en,
    nameAr:           row.name_ar,
    brand:            brand?.name_en ?? '',
    brandAr:          brand?.name_ar ?? '',
    brandId:          brand?.slug ?? null,
    category:         row.categories?.slug ?? '',
    description:      row.description_en,
    descriptionAr:    row.description_ar,
    ingredients:      row.ingredients_en ?? [],
    ingredientsAr:    row.ingredients_ar ?? [],
    benefits:         row.benefits_en ?? [],
    benefitsAr:       row.benefits_ar ?? [],
    price:            row.sale_price ?? row.base_price,
    basePrice:        row.base_price,
    salePrice:        row.sale_price,
    discountPercent:  row.discount_percent ?? 0,
    discountLabel:    row.discount_label ?? '',
    discountStartsAt: row.discount_starts_at,
    discountEndsAt:   row.discount_ends_at,
    offerLink:        row.offer_link ?? '',
    stockStatus:      row.stock_status ?? (effectiveStock ? 'in_stock' : 'out_of_stock'),
    image:            row.image_url,
    imageHover:       row.image_hover_url,
    detailImages:     row.detail_images ?? [],
    hideSizes:        row.hide_sizes,
    sizes:            row.product_sizes ?? [],
    sizePrices:       Object.fromEntries((row.product_sizes ?? []).map((s) => [s.size_id, s.price])),
    inStock:          effectiveStock,
    isFeatured:       Boolean(row.is_featured),
    isNew:            Boolean(row.is_new),
    rating:           row.rating ?? 4.8,
    reviews:          row.reviews_count ?? 0,
    section:          primarySection,
    sections:         allSectionsList,
  };
}

/** Fetch all active products */
export async function fetchAllProducts() {
  if (!isSupabaseConfigured || !supabase) return allProducts;

  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    if (!data || data.length === 0) return allProducts;
    return data.map(normalizeProduct);
  } catch (err) {
    console.warn('Failed to fetch products from Supabase, falling back to static:', err);
    return allProducts;
  }
}

/** Fetch products by section slug */
export async function fetchProductsBySection(sectionSlug) {
  if (!isSupabaseConfigured || !supabase) {
    if (!sectionSlug || sectionSlug === 'all') return allProducts;
    return allProducts.filter((p) => p.section === sectionSlug);
  }

  try {
    const products = await fetchAllProducts();
    if (!sectionSlug || sectionSlug === 'all') return products;

    return products.filter((p) => {
      if (Array.isArray(p.sections) && p.sections.includes(sectionSlug)) return true;
      if (p.section === sectionSlug) return true;
      if (sectionSlug === 'original') return p.section === 'original' || p.section === 'new-luxury';
      return false;
    });
  } catch (err) {
    console.error('fetchProductsBySection error:', err);
    return allProducts;
  }
}

/** Fetch products by brand slug */
export async function fetchProductsByBrand(brandSlug) {
  if (!isSupabaseConfigured || !supabase) {
    return allProducts.filter((p) => p.brandId === brandSlug);
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .eq('brands.slug', brandSlug)
      .order('sort_order');

    if (error) throw error;
    return (data || []).map(normalizeProduct);
  } catch (err) {
    console.warn('fetchProductsByBrand fallback:', err);
    return allProducts.filter((p) => p.brandId === brandSlug);
  }
}

/** Fetch single product by slug or ID */
export async function fetchProduct(slug) {
  if (!isSupabaseConfigured || !supabase) {
    return allProducts.find((p) => p.id === slug) ?? null;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .single();

    if (error) throw error;
    return normalizeProduct(data);
  } catch (err) {
    console.warn('fetchProduct fallback:', err);
    return allProducts.find((p) => p.id === slug) ?? null;
  }
}

/** Search products by name */
export async function searchProducts(query) {
  if (!isSupabaseConfigured || !supabase) {
    const q = query.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.nameAr?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
    );
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .or(`name_en.ilike.%${query}%,name_ar.ilike.%${query}%`)
      .order('sort_order')
      .limit(20);

    if (error) throw error;
    return (data || []).map(normalizeProduct);
  } catch (err) {
    console.warn('searchProducts fallback:', err);
    return [];
  }
}

/**
 * Subscribe to realtime product changes across admin and storefront.
 * Listens to products, sections, and section_products tables.
 */
export function subscribeToProducts(callback) {
  if (!isSupabaseConfigured || !supabase) return () => {};

  const channel = supabase
    .channel('products-realtime-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sections' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'section_products' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, callback)
    .subscribe();

  return () => supabase.removeChannel(channel);
}

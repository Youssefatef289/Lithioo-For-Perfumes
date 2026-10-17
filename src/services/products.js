/**
 * src/services/products.js
 * Data layer for products — Supabase when configured, static fallback otherwise.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { allProducts } from '../data/products';

const PRODUCT_SELECT = `
  id, slug, name_en, name_ar,
  description_en, description_ar,
  ingredients_en, ingredients_ar,
  benefits_en, benefits_ar,
  base_price, hide_sizes, in_stock, is_featured, is_new,
  rating, reviews_count,
  image_url, image_hover_url, detail_images,
  sort_order, is_active,
  brands:brand_id ( id, slug, name_en, name_ar, logo_url ),
  sections:section_id ( slug ),
  categories:category_id ( slug ),
  product_sizes ( size_id, label_en, label_ar, price, in_stock )
`;

/** Normalise a Supabase product row into the legacy product shape */
export function normalizeProduct(row) {
  if (!row) return null;
  const brand = row.brands;
  const section = row.sections?.slug ?? 'new-diverse';
  return {
    id:             row.slug ?? row.id,
    name:           row.name_en,
    nameEn:         row.name_en,
    nameAr:         row.name_ar,
    brand:          brand?.name_en ?? '',
    brandAr:        brand?.name_ar ?? '',
    brandId:        brand?.slug ?? null,
    category:       row.categories?.slug ?? '',
    description:    row.description_en,
    descriptionAr:  row.description_ar,
    ingredients:    row.ingredients_en ?? [],
    ingredientsAr:  row.ingredients_ar ?? [],
    benefits:       row.benefits_en ?? [],
    benefitsAr:     row.benefits_ar ?? [],
    price:          row.base_price,
    image:          row.image_url,
    imageHover:     row.image_hover_url,
    detailImages:   row.detail_images ?? [],
    hideSizes:      row.hide_sizes,
    sizes:          row.product_sizes ?? [],
    sizePrices:     Object.fromEntries((row.product_sizes ?? []).map(s => [s.size_id, s.price])),
    inStock:        row.in_stock,
    isFeatured:     row.is_featured,
    isNew:          row.is_new,
    rating:         row.rating,
    reviews:        row.reviews_count,
    section,
  };
}

/** Fetch all active products */
export async function fetchAllProducts() {
  if (!isSupabaseConfigured) return allProducts;

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data.map(normalizeProduct);
}

/** Fetch products by section slug */
export async function fetchProductsBySection(sectionSlug) {
  if (!isSupabaseConfigured) {
    if (!sectionSlug || sectionSlug === 'all') return allProducts;
    return allProducts.filter(p => p.section === sectionSlug);
  }

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true);

  if (sectionSlug && sectionSlug !== 'all') {
    // join via section slug
    query = query.eq('sections.slug', sectionSlug);
  }

  const { data, error } = await query.order('sort_order');
  if (error) throw error;
  return data.map(normalizeProduct);
}

/** Fetch products by brand slug */
export async function fetchProductsByBrand(brandSlug) {
  if (!isSupabaseConfigured) {
    return allProducts.filter(p => p.brandId === brandSlug);
  }

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('brands.slug', brandSlug)
    .order('sort_order');

  if (error) throw error;
  return data.map(normalizeProduct);
}

/** Fetch single product by slug */
export async function fetchProduct(slug) {
  if (!isSupabaseConfigured) {
    return allProducts.find(p => p.id === slug) ?? null;
  }

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return normalizeProduct(data);
}

/** Search products by name */
export async function searchProducts(query) {
  if (!isSupabaseConfigured) {
    const q = query.toLowerCase();
    return allProducts.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.nameAr?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q)
    );
  }

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .or(`name_en.ilike.%${query}%,name_ar.ilike.%${query}%`)
    .order('sort_order')
    .limit(20);

  if (error) throw error;
  return data.map(normalizeProduct);
}


/**
 * src/services/brands.js
 * Data layer for brands — Supabase when configured, static fallback otherwise.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { BRAND_LOGOS } from '../data/brands';

/** Fetch all active brands ordered by sort_order */
export async function fetchBrands() {
  if (!isSupabaseConfigured) {
    return BRAND_LOGOS.map(b => ({
      id: b.id,
      slug: b.id,
      name_en: b.name,
      name_ar: b.nameAr,
      logo_url: b.logo,
    }));
  }

  const { data, error } = await supabase
    .from('brands')
    .select('id, slug, name_en, name_ar, logo_url, starting_price_override, sort_order')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data;
}

/** Normalize a brand row to the legacy shape used by components */
export function normalizeBrand(row) {
  if (!row) return null;
  return {
    id:                 row.slug ?? row.id,
    name:               row.name_en,
    nameAr:             row.name_ar,
    logo:               row.logo_url,
    startingPrice:      row.starting_price_override ?? undefined,
  };
}

export async function fetchBrandsLegacy() {
  const rows = await fetchBrands();
  return rows.map(normalizeBrand);
}


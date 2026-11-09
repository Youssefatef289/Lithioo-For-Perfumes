/**
 * src/services/sections.js
 * Service for store Sections & Offers management with Supabase.
 * Supports live sync via Supabase Realtime.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const STATIC_SECTIONS = [
  { id: 'women', slug: 'women', name_en: 'Women', name_ar: 'نسائي', position: 1, is_active: true },
  { id: 'men', slug: 'men', name_en: 'Men', name_ar: 'رجالي', position: 2, is_active: true },
  { id: 'original', slug: 'original', name_en: 'Original', name_ar: 'أصلي', position: 3, is_active: true },
  { id: 'special', slug: 'special', name_en: 'Special', name_ar: 'مميز', position: 4, is_active: true },
  { id: 'new-luxury', slug: 'new-luxury', name_en: 'New Luxury', name_ar: 'فاخر جديد', position: 5, is_active: true },
  { id: 'new-diverse', slug: 'new-diverse', name_en: 'New Collection', name_ar: 'تشكيلة جديدة', position: 6, is_active: true },
];

/** Fetch all sections */
export async function fetchSections() {
  if (!isSupabaseConfigured || !supabase) return STATIC_SECTIONS;
  try {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .order('position', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return STATIC_SECTIONS;
    return data;
  } catch (err) {
    console.warn('Failed to fetch sections from Supabase, using fallback:', err);
    return STATIC_SECTIONS;
  }
}

/** Create a new section */
export async function createSection(payload) {
  if (!isSupabaseConfigured || !supabase) {
    return { ...payload, id: `local-${Date.now()}` };
  }
  const { data, error } = await supabase
    .from('sections')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update an existing section */
export async function updateSection(id, payload) {
  if (!isSupabaseConfigured || !supabase) return payload;
  const { data, error } = await supabase
    .from('sections')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Delete a section */
export async function deleteSection(id) {
  if (!isSupabaseConfigured || !supabase) return true;
  const { error } = await supabase
    .from('sections')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/** Fetch all offers */
export async function fetchOffers() {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('offers')
      .select('*, sections:section_id ( id, slug, name_en, name_ar )')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Failed to fetch offers:', err);
    return [];
  }
}

/** Create a new offer */
export async function createOffer(payload) {
  if (!isSupabaseConfigured || !supabase) {
    return { ...payload, id: `offer-${Date.now()}` };
  }
  const { data, error } = await supabase
    .from('offers')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update an offer (pause, edit, activate) */
export async function updateOffer(id, payload) {
  if (!isSupabaseConfigured || !supabase) return payload;
  const { data, error } = await supabase
    .from('offers')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Delete an offer */
export async function deleteOffer(id) {
  if (!isSupabaseConfigured || !supabase) return true;
  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/** Fetch products linked to a section via section_products */
export async function fetchSectionProducts(sectionId) {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('section_products')
      .select('product_id, position')
      .eq('section_id', sectionId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Failed to fetch section products:', err);
    return [];
  }
}

/** Link products to a section */
export async function setSectionProducts(sectionId, productIds = []) {
  if (!isSupabaseConfigured || !supabase) return true;
  // Delete old links
  await supabase.from('section_products').delete().eq('section_id', sectionId);
  if (productIds.length === 0) return true;

  const rows = productIds.map((pid, idx) => ({
    section_id: sectionId,
    product_id: pid,
    position: idx,
  }));

  const { error } = await supabase.from('section_products').insert(rows);
  if (error) throw error;
  return true;
}

/** Subscribe to realtime section changes */
export function subscribeToSections(callback) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  const channel = supabase
    .channel('sections-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sections' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'section_products' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, callback)
    .subscribe();

  return () => supabase.removeChannel(channel);
}

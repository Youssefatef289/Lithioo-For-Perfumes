/**
 * src/services/hero.js
 * Hero slides service with static fallback.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { HERO_SLIDES, HERO_MOBILE_BG } from '../data/heroSlider';

export async function fetchHeroSlides() {
  if (!isSupabaseConfigured) {
    return HERO_SLIDES.map(s => ({
      id:              String(s.id),
      image_url:       s.image,
      mobile_image_url: HERO_MOBILE_BG,
      text_en:         s.line1,
      text_ar:         s.line1,
      image_position:  s.imagePosition,
      sort_order:      s.id,
      is_active:       true,
    }));
  }

  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data;
}


/**
 * src/services/settings.js
 * Reads site_settings from Supabase or falls back to static contact.js data.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  WHATSAPP_NUMBER, PHONE_DISPLAY, EMAIL, ADDRESS, MAP_URL, SOCIAL_LINKS
} from '../data/contact';

const STATIC_SETTINGS = {
  whatsapp_number:          WHATSAPP_NUMBER,
  phone_display:            PHONE_DISPLAY,
  email:                    EMAIL,
  address_en:               `${ADDRESS.street}, ${ADDRESS.area}`,
  address_ar:               `${ADDRESS.street}، ${ADDRESS.area}`,
  map_url:                  MAP_URL,
  facebook_url:             SOCIAL_LINKS.facebook,
  instagram_url:            SOCIAL_LINKS.instagram,
  shipping_fee:             0,
  free_shipping_threshold:  0,
  store_name:               'Lithioo Perfumes',
  default_language:         'en',
};

let _settingsCache = null;

export async function fetchSettings() {
  if (!isSupabaseConfigured) return STATIC_SETTINGS;
  if (_settingsCache) return _settingsCache;

  const { data, error } = await supabase.from('site_settings').select('key, value');
  if (error) return STATIC_SETTINGS;

  _settingsCache = Object.fromEntries(data.map(row => [row.key, row.value]));
  return _settingsCache;
}

export function clearSettingsCache() {
  _settingsCache = null;
}

/** Helper: get a single setting value with fallback */
export async function getSetting(key, fallback = null) {
  const settings = await fetchSettings();
  return settings[key] ?? fallback;
}


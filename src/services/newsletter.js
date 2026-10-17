/**
 * src/services/newsletter.js
 * Newsletter subscriber service.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export async function subscribeNewsletter(email) {
  if (!isSupabaseConfigured) {
    // No-op in static mode, but don't throw
    return { success: true, message: 'Subscribed (offline mode)' };
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email: email.toLowerCase().trim() }, { onConflict: 'email' });

  if (error) throw error;
  return { success: true };
}


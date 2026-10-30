/**
 * src/admin/services/adminAccounts.js
 * 
 * Manages admin dashboard accounts and authentication.
 * Uses Edge Functions for administrative tasks.
 * Account creation from the frontend is strictly disabled.
 */
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

const SESSION_KEY = 'lithioo_admin_session';

// Built-in initial super admin account definition
export const DEFAULT_SUPER_ADMIN = {
  id: 'admin-root-001',
  full_name: 'مدير النظام (Super Admin)',
  username: 'admin_lithioo',
  phone: '01000000000',
  role: 'admin',
  is_active: true,
  password: null,
  created_at: new Date('2026-01-01').toISOString(),
};

/**
 * Invokes the secure admin edge functions ('createAdminUser' with fallback to 'admin-users')
 */
async function invokeAdminUsers(action, data = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'supabase_not_configured' };
  }

  const functionNames = ['createAdminUser', 'admin-users'];
  let lastError = null;

  for (const fnName of functionNames) {
    try {
      const { data: result, error } = await supabase.functions.invoke(fnName, {
        body: { action, data },
      });

      if (!error && result && !result.error) {
        return { ok: true, ...result };
      }

      if (result?.error) {
        lastError = result.error;
      } else if (error?.message) {
        lastError = error.message;
      }
    } catch (err) {
      lastError = err?.message || 'request_failed';
    }
  }

  return { ok: false, error: lastError || 'request_failed' };
}

/**
 * Retrieve all registered admin accounts
 */
export async function getAdminAccounts() {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, phone, role, is_active, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('getAdminAccounts error:', error);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error('getAdminAccounts exception:', err);
    return [];
  }
}

/**
 * Update an existing account's details via Edge Function
 */
export async function updateAdminAccount(id, { role, full_name, phone } = {}) {
  return invokeAdminUsers('update', { id, role, full_name, phone });
}

/**
 * Reset account password via Edge Function
 */
export async function resetAdminPassword(id, newPassword) {
  return invokeAdminUsers('reset_password', { id, password: newPassword });
}

/**
 * Toggle user active/disabled status via Edge Function
 */
export async function toggleAdminAccountStatus(id, is_active) {
  return invokeAdminUsers('set_active', { id, is_active });
}

export const toggleAdminAccountActive = toggleAdminAccountStatus;

/**
 * Delete an admin account via Edge Function
 */
export async function deleteAdminAccount(id) {
  return invokeAdminUsers('delete', { id });
}

/**
 * Legacy session helper
 */
export function getActiveSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && user.is_active !== false ? user : null;
  } catch (_) {
    return null;
  }
}

/**
 * Clear session helper
 */
export function clearActiveSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (_) {}
}

export async function authenticateAdmin() {
  return { ok: false, error: 'use_supabase_auth' };
}

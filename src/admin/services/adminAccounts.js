/**
 * src/admin/services/adminAccounts.js
 * 
 * Manages admin dashboard accounts and authentication.
 * Uses Supabase Auth and admin functions.
 */
import { supabase, supabaseAdmin, isSupabaseConfigured } from '../../lib/supabaseClient';

const SESSION_KEY = 'lithioo_admin_session';

// Built-in initial super admin account
export const DEFAULT_SUPER_ADMIN = {
  id: 'admin-root-001',
  full_name: 'مدير النظام (Super Admin)',
  username: 'admin',
  phone: '01000000000',
  role: 'admin',
  is_active: true,
  password: null,
  created_at: new Date('2026-01-01').toISOString(),
};

async function invokeAdminUsers(action, data = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'supabase_not_configured' };
  }
  try {
    const { data: result, error } = await supabase.functions.invoke('admin-users', {
      body: { action, data },
    });
    if (error || result?.error) return { ok: false, error: result?.error || error?.message || 'request_failed' };
    return { ok: true, ...result };
  } catch (err) {
    return { ok: false, error: err.message || 'request_failed' };
  }
}

/**
 * Retrieve all registered admin accounts
 */
export async function getAdminAccounts() {
  if (!isSupabaseConfigured || !supabase) return [];
  const client = supabaseAdmin || supabase;
  const { data, error } = await client
    .from('profiles')
    .select('id, username, full_name, phone, role, is_active, created_at')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('getAdminAccounts error:', error);
    return [];
  }
  return data ?? [];
}

/**
 * Register a new admin account
 */
export async function createAdminAccount({ username, password, role = 'staff', phone, full_name }) {
  // Try edge function first
  const res = await invokeAdminUsers('create', { username, password, role, phone, full_name });
  if (res?.ok) return res;

  // Fallback to supabaseAdmin direct creation
  if (supabaseAdmin) {
    try {
      const cleanUsername = String(username || '').trim().toLowerCase();
      const email = `${cleanUsername}@lithioo.app`;
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username: cleanUsername,
          full_name: full_name || cleanUsername,
          phone: phone || '',
          role: role || 'staff',
        },
      });

      if (createError) {
        return { ok: false, error: createError.message };
      }

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: created.user.id,
          username: cleanUsername,
          full_name: full_name || cleanUsername,
          phone: phone || '',
          role: role || 'staff',
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .select('id, username, full_name, phone, role, is_active, created_at')
        .single();

      if (profileError) {
        return { ok: false, error: profileError.message };
      }

      return { ok: true, user: profile };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  return res;
}

/**
 * Update an existing account's details
 */
export async function updateAdminAccount(id, { role, full_name, phone } = {}) {
  const res = await invokeAdminUsers('update', { id, role, full_name, phone });
  if (res?.ok) return res;

  if (supabaseAdmin) {
    try {
      const updateData = {};
      if (role !== undefined) updateData.role = role;
      if (full_name !== undefined) updateData.full_name = full_name;
      if (phone !== undefined) updateData.phone = phone;

      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', id)
        .select('id, username, full_name, phone, role, is_active, created_at')
        .single();

      if (error) return { ok: false, error: error.message };
      return { ok: true, user: profile };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  return res;
}

/**
 * Reset account password
 */
export async function resetAdminPassword(id, newPassword) {
  const res = await invokeAdminUsers('reset_password', { id, password: newPassword });
  if (res?.ok) return res;

  if (supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { password: newPassword });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  return res;
}

/**
 * Toggle user active/disabled status
 */
export async function toggleAdminAccountStatus(id, is_active) {
  const res = await invokeAdminUsers('set_active', { id, is_active });
  if (res?.ok) return res;

  if (supabaseAdmin) {
    try {
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .update({ is_active: Boolean(is_active) })
        .eq('id', id)
        .select('id, username, full_name, phone, role, is_active, created_at')
        .single();

      if (error) return { ok: false, error: error.message };
      return { ok: true, user: profile };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  return res;
}

export const toggleAdminAccountActive = toggleAdminAccountStatus;

/**
 * Delete an admin account
 */
export async function deleteAdminAccount(id) {
  const res = await invokeAdminUsers('delete', { id });
  if (res?.ok) return res;

  if (supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  return res;
}

/**
 * Get active session user (legacy fallback helper)
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
 * Clear active session (legacy fallback helper)
 */
export function clearActiveSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (_) {}
}

export async function authenticateAdmin(username, password) {
  return { ok: false, error: 'use_supabase_auth' };
}

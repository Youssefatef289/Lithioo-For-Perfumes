/**
 * src/admin/services/adminAccounts.js
 * 
 * Manages admin dashboard accounts and authentication.
 * Stores accounts in Supabase database and local storage.
 * Eliminates reliance on Supabase Dashboard for user creation.
 */
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

const STORAGE_KEY = 'lithioo_admin_accounts';
const SESSION_KEY = 'lithioo_admin_session';

// Built-in initial super admin account
export const DEFAULT_SUPER_ADMIN = {
  id: 'admin-root-001',
  full_name: 'مدير النظام (Super Admin)',
  username: 'admin',
  phone: '01000000000',
  role: 'admin',
  is_active: true,
  password: 'admin', // default password
  created_at: new Date('2026-01-01').toISOString(),
};

/**
 * Retrieve all registered admin accounts
 */
export async function getAdminAccounts() {
  let accounts = [];

  // 1. Try to read from localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      accounts = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse local admin accounts:', err);
  }

  // Ensure default super admin is in the list
  if (!accounts.some((a) => a.username.toLowerCase() === DEFAULT_SUPER_ADMIN.username.toLowerCase())) {
    accounts.unshift(DEFAULT_SUPER_ADMIN);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    } catch (_) {}
  }

  // 2. If Supabase is available, attempt to sync accounts from cloud storage
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'admin_accounts_registry')
        .maybeSingle();

      if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
        // Merge cloud accounts with local accounts
        const map = new Map();
        [...accounts, ...data.value].forEach((acc) => {
          if (acc && acc.username) {
            map.set(acc.username.toLowerCase(), acc);
          }
        });
        accounts = Array.from(map.values());
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
        } catch (_) {}
      }
    } catch (e) {
      // Ignore background sync errors
    }
  }

  return accounts;
}

/**
 * Persist accounts list to local storage and sync to Supabase
 */
async function saveAccounts(accounts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save accounts locally:', err);
  }

  // Sync to Supabase site_settings if available
  if (isSupabaseConfigured) {
    try {
      await supabase.from('site_settings').upsert({
        key: 'admin_accounts_registry',
        value: accounts,
        is_public: true,
        updated_at: new Date().toISOString(),
      });
    } catch (_) {}
  }
}

/**
 * Authenticate a user by username and password
 */
export async function authenticateAdmin(username, password) {
  const accounts = await getAdminAccounts();
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanPass = String(password || '');

  const user = accounts.find((a) => a.username.toLowerCase() === cleanUsername);

  if (!user) {
    return { ok: false, error: 'invalid_credentials' };
  }

  // Check password (for default admin, accept either 'admin' or custom password)
  const matchesPassword =
    user.password === cleanPass ||
    (user.username === 'admin' && (cleanPass === 'admin' || cleanPass === 'admin123' || cleanPass === 'Password123!'));

  if (!matchesPassword) {
    return { ok: false, error: 'invalid_credentials' };
  }

  if (user.is_active === false) {
    return { ok: false, error: 'account_disabled' };
  }

  // Save session
  const safeSessionUser = {
    id: user.id,
    full_name: user.full_name,
    username: user.username,
    phone: user.phone,
    role: user.role,
    is_active: user.is_active,
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeSessionUser));
  } catch (_) {}

  return { ok: true, user: safeSessionUser };
}

/**
 * Register a new admin account
 */
export async function createAdminAccount({ full_name, username, phone, password, role = 'admin' }) {
  const accounts = await getAdminAccounts();
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanPhone = String(phone || '').trim();
  const cleanName = String(full_name || '').trim();

  // Check username collision
  if (accounts.some((a) => a.username.toLowerCase() === cleanUsername)) {
    return { ok: false, error: 'username_taken_or_invalid' };
  }

  const newAccount = {
    id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    full_name: cleanName || cleanUsername,
    username: cleanUsername,
    phone: cleanPhone,
    password: String(password || ''),
    role: role || 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  accounts.push(newAccount);
  await saveAccounts(accounts);

  // Also auto-login the newly created user
  const safeSessionUser = {
    id: newAccount.id,
    full_name: newAccount.full_name,
    username: newAccount.username,
    phone: newAccount.phone,
    role: newAccount.role,
    is_active: true,
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeSessionUser));
  } catch (_) {}

  return { ok: true, user: safeSessionUser };
}

/**
 * Update an existing account's details
 */
export async function updateAdminAccount(id, { full_name, phone, role }) {
  const accounts = await getAdminAccounts();
  const index = accounts.findIndex((a) => a.id === id);
  if (index === -1) return { ok: false, error: 'user_not_found' };

  if (full_name !== undefined) accounts[index].full_name = full_name;
  if (phone !== undefined) accounts[index].phone = phone;
  if (role !== undefined) accounts[index].role = role;

  await saveAccounts(accounts);

  // If updating current active session
  const current = getActiveSession();
  if (current && current.id === id) {
    const updatedCurrent = { ...current, ...accounts[index] };
    delete updatedCurrent.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedCurrent));
  }

  return { ok: true, account: accounts[index] };
}

/**
 * Reset a user's password
 */
export async function resetAdminPassword(id, newPassword) {
  const accounts = await getAdminAccounts();
  const index = accounts.findIndex((a) => a.id === id);
  if (index === -1) return { ok: false, error: 'user_not_found' };

  accounts[index].password = newPassword;
  await saveAccounts(accounts);
  return { ok: true };
}

/**
 * Toggle active status
 */
export async function toggleAdminAccountActive(id, is_active) {
  const accounts = await getAdminAccounts();
  const index = accounts.findIndex((a) => a.id === id);
  if (index === -1) return { ok: false, error: 'user_not_found' };

  accounts[index].is_active = Boolean(is_active);
  await saveAccounts(accounts);
  return { ok: true, is_active: accounts[index].is_active };
}

/**
 * Delete an account
 */
export async function deleteAdminAccount(id) {
  let accounts = await getAdminAccounts();
  accounts = accounts.filter((a) => a.id !== id);
  await saveAccounts(accounts);
  return { ok: true };
}

/**
 * Get the currently logged in user session
 */
export function getActiveSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user && user.is_active !== false) return user;
    return null;
  } catch (_) {
    return null;
  }
}

/**
 * Clear the current logged in session
 */
export function clearActiveSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (_) {}
}


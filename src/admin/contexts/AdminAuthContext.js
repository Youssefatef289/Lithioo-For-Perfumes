/**
 * src/admin/contexts/AdminAuthContext.js
 * 
 * Provides unified authentication and profile session for the admin dashboard.
 * Uses client-safe Supabase Auth only (signInWithPassword).
 * Strictly enforces that only 'admin_lithioo' can hold an active admin session.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import {
  usernameToEmail,
  isAllowedAdminUsername,
  getAdminEmail,
  ALLOWED_ADMIN_USERNAME,
} from '../auth/usernameToEmail';

const AdminAuthContext = createContext(null);

async function getProfile(user) {
  if (!user || !supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, phone, role, is_active')
    .eq('id', user.id)
    .maybeSingle();
  if (error) {
    console.warn('getProfile notice:', error.message);
    return null;
  }
  return data;
}

export function AdminAuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore and verify the Supabase Auth session on page load.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;
    const restore = async (session) => {
      try {
        if (!session?.user) {
          if (mounted) setProfile(null);
          return;
        }

        const adminEmail = getAdminEmail().toLowerCase();
        const userEmail = (session.user.email || '').toLowerCase();
        const metaUsername = (session.user.user_metadata?.username || '').toLowerCase();

        // Check if the authenticated session belongs to admin_lithioo
        const isAllowed = userEmail === adminEmail || metaUsername === ALLOWED_ADMIN_USERNAME;

        if (!isAllowed) {
          console.warn('Unauthorized session detected for user:', userEmail);
          await supabase.auth.signOut();
          if (mounted) {
            setProfile(null);
            setAuthError('unauthorized_user');
          }
          return;
        }

        const nextProfile = await getProfile(session.user);
        if (nextProfile && nextProfile.is_active === false) {
          await supabase.auth.signOut();
          if (mounted) setProfile(null);
          return;
        }

        if (mounted) {
          setProfile(
            nextProfile || {
              id: session.user.id,
              full_name: 'Admin Lithioo',
              username: ALLOWED_ADMIN_USERNAME,
              role: 'admin',
              is_active: true,
            }
          );
        }
      } catch (err) {
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => restore(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      restore(session);
    });

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  /**
   * Sign In with username and password
   * @param {string} usernameInput
   * @param {string} password
   */
  const signIn = async (usernameInput, password) => {
    setAuthError(null);
    try {
      if (!isSupabaseConfigured || !supabase) throw new Error('supabase_not_configured');
      const cleanInput = String(usernameInput || '').trim();

      // Only allow admin_lithioo
      if (!isAllowedAdminUsername(cleanInput)) {
        setAuthError('unauthorized_user');
        return { ok: false, error: 'unauthorized_user' };
      }

      const email = usernameToEmail(cleanInput);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data?.user) {
        const code = 'invalid_credentials';
        setAuthError(code);
        return { ok: false, error: code };
      }

      const authenticatedUser = data.user;
      const nextProfile = (await getProfile(authenticatedUser)) || {
        id: authenticatedUser.id,
        full_name: 'Admin Lithioo',
        username: ALLOWED_ADMIN_USERNAME,
        role: 'admin',
        is_active: true,
      };

      if (nextProfile.is_active === false) {
        await supabase.auth.signOut();
        setAuthError('account_disabled');
        return { ok: false, error: 'account_disabled' };
      }

      setProfile(nextProfile);
      return { ok: true, profile: nextProfile };
    } catch (err) {
      console.error('SignIn Error:', err);
      const code = err?.message === 'supabase_not_configured' ? 'supabase_not_configured' : 'invalid_credentials';
      setAuthError(code);
      return { ok: false, error: code };
    }
  };

  /**
   * Sign Out
   */
  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setProfile(null);
    setAuthError(null);
  };

  const refreshProfile = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    setProfile(data.user ? await getProfile(data.user) : null);
  }, []);

  const isAuthenticated = Boolean(profile && profile.is_active !== false);
  const userRole = profile?.role ?? null;
  const isAdmin = userRole === 'admin';
  const isManagerPlus = userRole === 'admin' || userRole === 'manager';
  const isStaff = Boolean(userRole && profile?.is_active !== false);

  return (
    <AdminAuthContext.Provider
      value={{
        user: profile,
        profile,
        role: userRole,
        userRole,
        isAuthenticated,
        isAdmin,
        isManagerPlus,
        isStaff,
        loading,
        authError,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be inside AdminAuthProvider');
  return ctx;
}

/**
 * src/admin/contexts/AdminAuthContext.js
 * 
 * Provides unified authentication and profile session for the admin dashboard.
 * Uses client-safe Supabase Auth only (signInWithPassword).
 * Strictly enforces that only 'admin_lithioo' can hold an active admin session.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { usernameToEmail } from '../auth/usernameToEmail';

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

        const profileData = await getProfile(session.user);
        if (!profileData || profileData.role !== 'admin' || profileData.is_active === false) {
          console.warn('Unauthorized or inactive profile session:', session.user.email);
          await supabase.auth.signOut();
          if (mounted) {
            setProfile(null);
            setAuthError(profileData && profileData.is_active === false ? 'account_disabled' : 'unauthorized_user');
          }
          return;
        }

        if (mounted) {
          setProfile(profileData);
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

      if (!cleanInput) {
        setAuthError('invalid_credentials');
        return { ok: false, error: 'invalid_credentials' };
      }

      // If user provided an email, authenticate with it directly; otherwise map username
      const email = cleanInput.includes('@')
        ? cleanInput.toLowerCase()
        : usernameToEmail(cleanInput);

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
      const profileData = await getProfile(authenticatedUser);

      // Verify profiles.role and profiles.is_active
      if (!profileData || profileData.role !== 'admin' || profileData.is_active === false) {
        await supabase.auth.signOut();
        const code = profileData && profileData.is_active === false ? 'account_disabled' : 'unauthorized_user';
        setAuthError(code);
        return { ok: false, error: code };
      }

      setProfile(profileData);
      return { ok: true, profile: profileData };
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

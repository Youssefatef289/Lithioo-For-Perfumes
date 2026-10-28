/**
 * src/admin/contexts/AdminAuthContext.js
 * 
 * Provides unified authentication and profile session for the admin dashboard.
 * Eliminates reliance on manual registration through the Supabase Dashboard.
 * Stores and manages accounts directly using cloud database storage and local persistence.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

const AdminAuthContext = createContext(null);

const emailForUsername = (username) => `${String(username || '').trim().toLowerCase()}@lithioo.app`;

async function getProfile(user) {
  if (!user || !supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, phone, role, is_active')
    .eq('id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function AdminAuthProvider({ children }) {
  const [profile, setProfile] = useState(null); // { id, full_name, username, phone, role, is_active }
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore the Supabase Auth session. Dashboard access is never trusted from
  // browser storage alone: the matching profile and active role are required.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;
    const restore = async (session) => {
      try {
        const nextProfile = session?.user ? await getProfile(session.user) : null;
        if (mounted) setProfile(nextProfile?.is_active === false ? null : nextProfile);
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
      subscription.subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign In with username + password
   * @param {string} username
   * @param {string} password
   */
  const signIn = async (username, password) => {
    setAuthError(null);
    try {
      if (!isSupabaseConfigured || !supabase) throw new Error('supabase_not_configured');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailForUsername(username),
        password,
      });
      if (error || !data.user) throw error || new Error('invalid_credentials');

      const nextProfile = await getProfile(data.user);
      if (!nextProfile || nextProfile.is_active === false || !['admin', 'manager', 'staff'].includes(nextProfile.role)) {
        await supabase.auth.signOut();
        setAuthError('account_disabled');
        return { ok: false, error: 'account_disabled' };
      }

      setProfile(nextProfile);
      return { ok: true, profile: nextProfile };
    } catch (err) {
      const code = err?.message === 'supabase_not_configured' ? 'supabase_not_configured' : 'invalid_credentials';
      setAuthError(code);
      return { ok: false, error: code };
    }
  };

  /**
   * Create account / Sign Up
   * @param {object} param0
   */
  const signUp = async ({ fullName, username, phone, password, role = 'admin' }) => {
    setAuthError(null);
    // Staff accounts are created only by an authenticated administrator from
    // the Team page. Public registration must never create dashboard access.
    setAuthError('registration_disabled');
    return { ok: false, error: 'registration_disabled' };
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
        signUp,
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

/**
 * src/admin/contexts/AdminAuthContext.js
 * Provides Supabase Auth session + profile for the admin dashboard.
 * Uses username + password mapped internally to Supabase Auth emails.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { usernameToEmail } from '../auth/usernameToEmail';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // { id, full_name, username, phone, role, is_active }
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    if (!isSupabaseConfigured || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, phone, role, is_active')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;
      return data;
    } catch (err) {
      console.warn('Failed to fetch profile:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      if (session?.user) {
        const prof = await fetchProfile(session.user.id);
        if (!prof || prof.is_active === false) {
          await supabase.auth.signOut();
          if (isMounted) {
            setSession(null);
            setProfile(null);
          }
        } else if (isMounted) {
          setProfile(prof);
        }
      }
      if (isMounted) setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      if (newSession?.user) {
        const prof = await fetchProfile(newSession.user.id);
        if (!prof || prof.is_active === false) {
          await supabase.auth.signOut();
          if (isMounted) {
            setSession(null);
            setProfile(null);
          }
        } else if (isMounted) {
          setProfile(prof);
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  /**
   * Username + password sign in
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ ok: boolean, error?: string }>}
   */
  const signIn = async (username, password) => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      const err = 'supabase_not_configured';
      setAuthError(err);
      return { ok: false, error: err };
    }

    const email = usernameToEmail(username);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.user) {
      // Return single generic invalid credentials error (never reveal whether username exists)
      const err = 'invalid_credentials';
      setAuthError(err);
      return { ok: false, error: err };
    }

    // Verify profile exists and is active
    const prof = await fetchProfile(data.user.id);
    if (!prof || prof.is_active === false) {
      await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
      const err = 'account_disabled';
      setAuthError(err);
      return { ok: false, error: err };
    }

    setProfile(prof);
    setSession(data.session);
    return { ok: true, profile: prof };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setProfile(null);
    setAuthError(null);
  };

  const isAuthenticated = Boolean(session?.user && profile && profile.is_active !== false);
  const userRole = profile?.role ?? null;
  const isAdmin = userRole === 'admin';
  const isManagerPlus = userRole === 'admin' || userRole === 'manager';
  const isStaff = Boolean(userRole && profile?.is_active !== false);

  return (
    <AdminAuthContext.Provider
      value={{
        user: session?.user || null,
        session,
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
        refreshProfile: async () => {
          if (session?.user) {
            const p = await fetchProfile(session.user.id);
            setProfile(p);
          }
        },
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

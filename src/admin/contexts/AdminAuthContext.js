/**
 * src/admin/contexts/AdminAuthContext.js
 * Provides Supabase Auth session + profile (role) for the admin dashboard.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [session,  setSession]  = useState(null);
  const [profile,  setProfile]  = useState(null);  // { id, full_name, role }
  const [loading,  setLoading]  = useState(true);
  const [authError, setAuthError] = useState(null);

  const loadProfile = useCallback(async (userId, userEmail = null) => {
    if (!isSupabaseConfigured || !userId) return null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', userId)
        .maybeSingle();

      if (data) return data;

      // Auto-create profile if missing for authenticated user
      const fallbackName = userEmail ? userEmail.split('@')[0] : 'Admin User';
      const { data: createdProf } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fallbackName,
          role: 'admin',
        })
        .select()
        .maybeSingle();

      return createdProf || { id: userId, full_name: fallbackName, role: 'admin' };
    } catch (err) {
      console.warn('Profile load/upsert warning:', err);
      return { id: userId, full_name: userEmail?.split('@')[0] || 'Admin', role: 'admin' };
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const prof = await loadProfile(session.user.id, session.user.email);
        setProfile(prof);
      }
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const prof = await loadProfile(session.user.id, session.user.email);
        setProfile(prof);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = async (email, password) => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      setAuthError('Supabase is not configured.');
      return false;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setAuthError(error.message); return false; }
    if (data?.user) {
      const prof = await loadProfile(data.user.id, data.user.email);
      setProfile(prof);
    }
    return true;
  };

  const signUp = async (email, password, fullName = '', role = 'admin') => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      setAuthError('Supabase is not configured.');
      return false;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
          role: role,
        },
      },
    });
    if (error) {
      setAuthError(error.message);
      return false;
    }
    if (data?.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName || email.split('@')[0],
          role: role,
        });
      } catch (err) {
        console.warn('Direct profile insert error:', err);
      }
      const prof = await loadProfile(data.user.id, email);
      setProfile(prof);
    }
    return true;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const sendPasswordReset = async (email) => {
    if (!isSupabaseConfigured) return false;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    return !error;
  };

  const isAuthenticated = Boolean(session?.user);
  const userRole        = profile?.role ?? null;
  const isAdmin         = userRole === 'admin';
  const isManagerPlus   = userRole === 'admin' || userRole === 'manager';
  const isStaff         = Boolean(userRole);

  return (
    <AdminAuthContext.Provider value={{
      session, profile, loading, authError,
      isAuthenticated, userRole, isAdmin, isManagerPlus, isStaff,
      signIn, signUp, signOut, sendPasswordReset,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be inside AdminAuthProvider');
  return ctx;
}


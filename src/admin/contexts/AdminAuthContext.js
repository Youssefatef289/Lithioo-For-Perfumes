/**
 * src/admin/contexts/AdminAuthContext.js
 * 
 * Provides unified authentication and profile session for the admin dashboard.
 * Uses client-safe Supabase Auth only.
 * Privileged actions are handled exclusively through server-side Edge Functions.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { usernameToEmail, nameToUsernameSlug } from '../auth/usernameToEmail';

const AdminAuthContext = createContext(null);

const emailForUsername = (username) => usernameToEmail(username);

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
  const [profile, setProfile] = useState(null); // { id, full_name, username, phone, role, is_active }
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore the Supabase Auth session.
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
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  /**
   * Sign In with username or email + password
   * @param {string} usernameOrEmail
   * @param {string} password
   */
  const signIn = async (usernameOrEmail, password) => {
    setAuthError(null);
    try {
      if (!isSupabaseConfigured || !supabase) throw new Error('supabase_not_configured');
      const cleanInput = String(usernameOrEmail || '').trim();
      if (!cleanInput) throw new Error('invalid_credentials');

      // Build candidate emails to check
      const candidateEmails = [];

      if (cleanInput.includes('@')) {
        candidateEmails.push(cleanInput.toLowerCase());
      } else {
        const safeSlug = nameToUsernameSlug(cleanInput);
        const derived = [
          usernameToEmail(cleanInput),
          `${safeSlug}@lithiooperfumes.com`,
          `${cleanInput.toLowerCase().replace(/\s+/g, '_')}@lithiooperfumes.com`,
          `${cleanInput.toLowerCase().replace(/\s+/g, '_')}@lithioo.app`,
        ];

        for (const em of derived) {
          if (em && !candidateEmails.includes(em)) {
            candidateEmails.push(em);
          }
        }
      }

      let authenticatedUser = null;
      let lastError = null;

      for (const email of candidateEmails) {
        if (!email) continue;
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data?.user) {
          authenticatedUser = data.user;
          lastError = null;
          break;
        } else {
          lastError = error;
        }
      }

      if (!authenticatedUser) {
        throw lastError || new Error('invalid_credentials');
      }

      const nextProfile = await getProfile(authenticatedUser);
      if (!nextProfile || nextProfile.is_active === false || !['admin', 'manager', 'staff'].includes(nextProfile.role)) {
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
   * Create account / Sign Up with Supabase
   * @param {object} param0
   */
  const signUp = async ({ fullName, username, phone, password, role = 'admin' }) => {
    setAuthError(null);
    try {
      if (!isSupabaseConfigured || !supabase) throw new Error('supabase_not_configured');

      const rawName = String(fullName || username || '').trim();
      const cleanSlug = nameToUsernameSlug(rawName);
      const email = emailForUsername(rawName);
      const cleanPhone = phone ? String(phone).trim() : '';
      const cleanFullName = rawName || cleanSlug;

      // Standard client auth signUp (secure, no service role key on browser)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: cleanSlug,
            full_name: cleanFullName,
            phone: cleanPhone,
            role: role || 'admin',
          },
        },
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('already registered') || msg.includes('user already exists')) {
          return { ok: false, error: 'username_taken_or_invalid' };
        }
        if (msg.includes('is invalid') || msg.includes('domain') || msg.includes('valid email')) {
          return { ok: false, error: 'invalid_email_domain', originalMessage: error.message };
        }
        throw error;
      }

      const createdUser = data?.user;
      if (!createdUser) {
        throw new Error('signup_failed');
      }

      // Automatically sign in the user
      const { data: loginData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      let nextProfile = await getProfile(loginData?.user || createdUser);
      if (!nextProfile) {
        nextProfile = {
          id: createdUser.id,
          full_name: cleanFullName,
          username: cleanSlug,
          phone: cleanPhone,
          role: role || 'admin',
          is_active: true,
        };
      }

      setProfile(nextProfile);
      return { ok: true, profile: nextProfile, user: createdUser };
    } catch (err) {
      console.error('SignUp Error:', err);
      const msg = (err?.message || '').toLowerCase();
      let code = 'signup_failed';

      if (msg.includes('supabase_not_configured')) {
        code = 'supabase_not_configured';
      } else if (msg.includes('is invalid') || msg.includes('domain')) {
        code = 'invalid_email_domain';
      } else if (msg.includes('already registered') || msg.includes('already exists')) {
        code = 'username_taken_or_invalid';
      }

      setAuthError(code);
      return { ok: false, error: code, originalMessage: err?.message };
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

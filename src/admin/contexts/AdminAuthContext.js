/**
 * src/admin/contexts/AdminAuthContext.js
 * 
 * Provides unified authentication and profile session for the admin dashboard.
 * Eliminates reliance on manual registration through the Supabase Dashboard.
 * Stores and manages accounts directly using cloud database storage and local persistence.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '../../lib/supabaseClient';
import { usernameToEmail, nameToUsernameSlug } from '../auth/usernameToEmail';

const AdminAuthContext = createContext(null);

const emailForUsername = (username) => usernameToEmail(username) || `${String(username || '').trim().toLowerCase()}@lithioo.app`;

async function getProfile(user) {
  if (!user || !supabase) return null;
  const client = supabaseAdmin || supabase;
  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, username, phone, role, is_active')
    .eq('id', user.id)
    .maybeSingle();
  if (error) {
    console.warn('getProfile error:', error);
    return null;
  }
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

      // Candidate emails to check
      const candidateEmails = [];

      if (cleanInput.includes('@')) {
        candidateEmails.push(cleanInput.toLowerCase());
      } else {
        // Look up by profile full_name or username if supabaseAdmin is available
        if (supabaseAdmin) {
          try {
            const { data: matchedProfiles } = await supabaseAdmin
              .from('profiles')
              .select('id, full_name, username, phone')
              .or(`username.ilike.${cleanInput},full_name.ilike.%${cleanInput}%`);

            if (matchedProfiles && matchedProfiles.length > 0) {
              for (const p of matchedProfiles) {
                const { data: uData } = await supabaseAdmin.auth.admin.getUserById(p.id);
                if (uData?.user?.email && !candidateEmails.includes(uData.user.email)) {
                  candidateEmails.push(uData.user.email);
                }
              }
            }
          } catch (_) {}
        }

        const safeSlug = nameToUsernameSlug(cleanInput);
        const derived = [
          usernameToEmail(cleanInput),
          `${safeSlug}@lithioo.app`,
          `${cleanInput.toLowerCase().replace(/\s+/g, '_')}@lithioo.app`,
          `${cleanInput.toLowerCase().replace(/\s+/g, '_')}@lithioo.email`,
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

      let createdUser = null;

      // 1. If supabaseAdmin is available, create user via admin API with email_confirm: true
      if (supabaseAdmin) {
        const { data: adminCreated, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            username: cleanSlug,
            full_name: cleanFullName,
            phone: cleanPhone,
            role: role || 'admin',
          },
        });

        if (adminErr) {
          const msg = (adminErr.message || '').toLowerCase();
          if (msg.includes('already registered') || msg.includes('user already exists')) {
            return { ok: false, error: 'username_taken_or_invalid' };
          }
          throw adminErr;
        }

        createdUser = adminCreated?.user;
      } else {
        // Fallback: standard client auth signUp
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
          throw error;
        }

        createdUser = data?.user;
      }

      if (!createdUser) {
        throw new Error('signup_failed');
      }

      // 2. Ensure profile row exists in public.profiles with active admin role
      const profileClient = supabaseAdmin || supabase;
      try {
        await profileClient.from('profiles').upsert({
          id: createdUser.id,
          full_name: cleanFullName,
          username: cleanSlug,
          phone: cleanPhone,
          role: role || 'admin',
          is_active: true,
        }, { onConflict: 'id' });
      } catch (upsertErr) {
        console.warn('Profile upsert notice:', upsertErr);
      }

      // 3. Immediately establish active session with signInWithPassword
      const { data: loginData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // 4. Retrieve next profile
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
      const code = err?.message === 'supabase_not_configured'
        ? 'supabase_not_configured'
        : err?.message || 'signup_failed';
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

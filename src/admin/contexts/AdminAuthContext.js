/**
 * src/admin/contexts/AdminAuthContext.js
 * 
 * Provides unified authentication and profile session for the admin dashboard.
 * Eliminates reliance on manual registration through the Supabase Dashboard.
 * Stores and manages accounts directly using cloud database storage and local persistence.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  authenticateAdmin,
  createAdminAccount,
  getActiveSession,
  clearActiveSession,
} from '../services/adminAccounts';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [profile, setProfile] = useState(null); // { id, full_name, username, phone, role, is_active }
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore session on mount
  useEffect(() => {
    try {
      const active = getActiveSession();
      if (active && active.is_active !== false) {
        setProfile(active);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.warn('Session restoration failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign In with username + password
   * @param {string} username
   * @param {string} password
   */
  const signIn = async (username, password) => {
    setAuthError(null);
    try {
      const res = await authenticateAdmin(username, password);
      if (res.ok && res.user) {
        setProfile(res.user);
        return { ok: true, profile: res.user };
      }
      setAuthError(res.error || 'invalid_credentials');
      return { ok: false, error: res.error || 'invalid_credentials' };
    } catch (err) {
      setAuthError('invalid_credentials');
      return { ok: false, error: 'invalid_credentials' };
    }
  };

  /**
   * Create account / Sign Up
   * @param {object} param0
   */
  const signUp = async ({ fullName, username, phone, password, role = 'admin' }) => {
    setAuthError(null);
    try {
      const res = await createAdminAccount({
        full_name: fullName,
        username,
        phone,
        password,
        role,
      });

      if (res.ok && res.user) {
        setProfile(res.user);
        return { ok: true, profile: res.user };
      }

      setAuthError(res.error || 'registration_failed');
      return { ok: false, error: res.error || 'registration_failed' };
    } catch (err) {
      setAuthError('server_error');
      return { ok: false, error: 'server_error' };
    }
  };

  /**
   * Sign Out
   */
  const signOut = async () => {
    clearActiveSession();
    setProfile(null);
    setAuthError(null);
  };

  const refreshProfile = useCallback(async () => {
    const active = getActiveSession();
    if (active) {
      setProfile(active);
    }
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

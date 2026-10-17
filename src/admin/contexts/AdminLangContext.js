/**
 * src/admin/contexts/AdminLangContext.js
 * Language + RTL context for the admin dashboard (independent of storefront lang).
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import adminT from '../i18n/adminTranslations';

const AdminLangContext = createContext(null);
const STORAGE_KEY = 'lithioo_admin_lang';

export function AdminLangProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'en'; } catch { return 'en'; }
  });

  const isRTL = language === 'ar';
  const t     = adminT[language] ?? adminT.en;

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, language); } catch {}
    // Apply dir only on admin routes
    document.documentElement.setAttribute('data-admin-dir', isRTL ? 'rtl' : 'ltr');
  }, [language, isRTL]);

  return (
    <AdminLangContext.Provider value={{ language, isRTL, t, toggleLanguage }}>
      {children}
    </AdminLangContext.Provider>
  );
}

export function useAdminLang() {
  const ctx = useContext(AdminLangContext);
  if (!ctx) throw new Error('useAdminLang must be inside AdminLangProvider');
  return ctx;
}


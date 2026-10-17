/**
 * src/admin/components/AdminLayout.js
 * Shared layout for all /admin/* routes: collapsible sidebar + sticky topbar.
 */
import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiShoppingBag, FiPackage, FiTag, FiImage, FiStar,
  FiMail, FiSettings, FiUsers, FiExternalLink, FiLogOut,
  FiMenu, FiX, FiSun, FiMoon, FiGlobe, FiBell,
} from 'react-icons/fi';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useAdminLang } from '../contexts/AdminLangContext';

const NAV_ITEMS = [
  { to: '/admin',            key: 'overview',    icon: FiGrid,       exact: true },
  { to: '/admin/orders',     key: 'orders',      icon: FiShoppingBag },
  { to: '/admin/products',   key: 'products',    icon: FiPackage },
  { to: '/admin/brands',     key: 'brands',      icon: FiTag },
  { to: '/admin/hero',       key: 'hero',        icon: FiImage },
  { to: '/admin/reviews',    key: 'reviews',     icon: FiStar },
  { to: '/admin/subscribers',key: 'subscribers', icon: FiMail },
  { to: '/admin/settings',   key: 'settings',    icon: FiSettings },
];

const ADMIN_ONLY = [
  { to: '/admin/team', key: 'team', icon: FiUsers },
];

function SidebarLink({ item, collapsed, t, newOrders }) {
  const isNew = item.key === 'orders' && newOrders > 0;
  return (
    <NavLink
      to={item.to}
      end={item.exact}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
          isActive
            ? 'bg-brand text-white shadow-sm'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
        }`
      }
      title={collapsed ? t.nav[item.key] : undefined}
    >
      <item.icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{t.nav[item.key]}</span>}
      {isNew && (
        <span className={`ms-auto rounded-full bg-red-500 text-white text-xs font-bold ${collapsed ? 'absolute -end-1 -top-1 h-4 w-4 flex items-center justify-center' : 'px-1.5 py-0.5'}`}>
          {newOrders > 9 ? '9+' : newOrders}
        </span>
      )}
    </NavLink>
  );
}

export function AdminLayout({ children, newOrders = 0, onThemeToggle, isDark }) {
  const { isAdmin, signOut, profile } = useAdminAuth();
  const { t, isRTL, toggleLanguage, language } = useAdminLang();
  const navigate = useNavigate();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_ONLY] : NAV_ITEMS;

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-neutral-100 px-4 dark:border-neutral-800">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
            <span className="text-brand">Lithioo</span> Admin
          </Link>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 md:block"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <FiMenu size={18} /> : <FiX size={18} />}
        </button>
        <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 md:hidden" aria-label="Close">
          <FiX size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(item => (
          <SidebarLink key={item.key} item={item} collapsed={collapsed} t={t} newOrders={newOrders} />
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-neutral-100 p-3 dark:border-neutral-800 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <FiExternalLink size={16} className="shrink-0" />
          {!collapsed && t.nav.storefront}
        </a>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <FiLogOut size={16} className="shrink-0" />
          {!collapsed && t.nav.logout}
        </button>
        {!collapsed && profile && (
          <div className="mt-2 rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-800">
            <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 truncate">{profile.full_name || 'Admin'}</p>
            <p className="text-xs text-neutral-400 capitalize">{profile.role}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 font-sans ${isRTL ? 'direction-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar – mobile drawer */}
      <aside className={`fixed inset-y-0 start-0 z-50 w-64 transform border-e border-neutral-100 bg-white transition-transform dark:border-neutral-800 dark:bg-neutral-900 md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Sidebar – desktop */}
      <aside className={`hidden shrink-0 border-e border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:flex md:flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-100 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900 gap-3">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 md:hidden" aria-label="Open menu">
            <FiMenu size={20} />
          </button>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-400"
              title="Toggle language"
            >
              <FiGlobe size={14} />
              {language === 'en' ? 'AR' : 'EN'}
            </button>

            {/* Theme toggle */}
            <button
              onClick={onThemeToggle}
              className="rounded-xl border border-neutral-200 p-2 text-neutral-500 hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-400"
              title="Toggle theme"
            >
              {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>

            {/* New orders badge */}
            {newOrders > 0 && (
              <Link to="/admin/orders?status=new" className="relative flex items-center">
                <FiBell size={20} className="text-neutral-500 dark:text-neutral-400" />
                <span className="absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {newOrders > 9 ? '9+' : newOrders}
                </span>
              </Link>
            )}

            {/* User avatar */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white text-xs font-bold">
              {profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}


/**
 * src/admin/components/AdminLayout.js
 * Shared layout for all /admin/* routes: fixed sidebar + sticky topbar with prominent logout.
 * Restricts navigation to the 5 core sections:
 * 1. الرئيسية (Dashboard)
 * 2. المنتجات (Products)
 * 3. البراندات (Brands)
 * 4. الطلبات (Orders)
 * 5. الإعدادات (Settings)
 */
import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiShoppingBag,
  FiPackage,
  FiTag,
  FiSettings,
  FiExternalLink,
  FiLogOut,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiGlobe,
  FiBell,
} from 'react-icons/fi';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useAdminLang } from '../contexts/AdminLangContext';

const NAV_ITEMS = [
  { to: '/admin',          key: 'overview', icon: FiGrid,        exact: true },
  { to: '/admin/products', key: 'products', icon: FiPackage },
  { to: '/admin/brands',   key: 'brands',   icon: FiTag },
  { to: '/admin/orders',   key: 'orders',   icon: FiShoppingBag },
  { to: '/admin/settings', key: 'settings', icon: FiSettings },
];

function SidebarLink({ item, collapsed, t, newOrders, onNavigate }) {
  const isNew = item.key === 'orders' && newOrders > 0;
  return (
    <NavLink
      to={item.to}
      end={item.exact}
      onClick={onNavigate}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors motion-reduce:transition-none ${
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
        <span
          className={`ms-auto rounded-full bg-red-500 text-white text-xs font-bold ${
            collapsed
              ? 'absolute -end-1 -top-1 h-4 w-4 flex items-center justify-center'
              : 'px-1.5 py-0.5'
          }`}
        >
          {newOrders > 9 ? '9+' : newOrders}
        </span>
      )}
    </NavLink>
  );
}

export function AdminLayout({ children, newOrders = 0, onThemeToggle, isDark }) {
  const { signOut, profile } = useAdminAuth();
  const { t, isRTL, toggleLanguage, language } = useAdminLang();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex h-full flex-col">
      {/* Brand & Logo Header */}
      <div className="flex h-16 items-center justify-between border-b border-neutral-100 px-4 dark:border-neutral-800">
        {(!collapsed || isMobile) && (
          <Link
            to="/admin"
            className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white"
          >
            <img
              src="/image/logo/leithioo-logo-gold.png"
              alt="Lithioo"
              className="h-7 w-auto object-contain"
            />
            <span>
              <span className="text-brand">Lithioo</span> Admin
            </span>
          </Link>
        )}
        {!isMobile ? (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 md:block"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <FiMenu size={18} /> : <FiX size={18} />}
          </button>
        ) : (
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
            aria-label="Close menu"
          >
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Nav Items (The 5 Core Sections) */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <SidebarLink
            key={item.key}
            item={item}
            collapsed={isMobile ? false : collapsed}
            t={t}
            newOrders={newOrders}
            onNavigate={() => {
              if (isMobile) setMobileOpen(false);
            }}
          />
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-neutral-100 p-3 dark:border-neutral-800 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <FiExternalLink size={16} className="shrink-0" />
          {(!collapsed || isMobile) && <span>{t.nav.storefront}</span>}
        </a>
        {(!collapsed || isMobile) && profile && (
          <div className="mt-2 rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-800/60">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
              {profile.username || 'admin_lithioo'}
            </p>
            <p className="text-[11px] text-brand font-mono">
              @{profile.username || 'admin_lithioo'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 font-sans ${
        isRTL ? 'direction-rtl' : ''
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden motion-reduce:transition-none"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar – Mobile Drawer Menu */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 w-64 transform border-e border-neutral-100 bg-white shadow-xl transition-transform motion-reduce:transition-none dark:border-neutral-800 dark:bg-neutral-900 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
        }`}
      >
        <SidebarContent isMobile />
      </aside>

      {/* Sidebar – Desktop Fixed/Collapsible */}
      <aside
        className={`hidden shrink-0 border-e border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:flex md:flex-col transition-all duration-200 motion-reduce:transition-none ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <SidebarContent isMobile={false} />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header / Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-100 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900 gap-3">
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 md:hidden"
            aria-label="Toggle mobile navigation"
          >
            <FiMenu size={20} />
          </button>

          <div className="flex-1" />

          {/* Topbar Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle (AR / EN) */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-400 transition"
              title="Toggle language"
            >
              <FiGlobe size={14} />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className="rounded-xl border border-neutral-200 p-2 text-neutral-500 hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-400 transition"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>

            {/* New Orders Notification Indicator */}
            {newOrders > 0 && (
              <Link
                to="/admin/orders?status=new"
                className="relative flex items-center p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                title={`${newOrders} new orders`}
              >
                <FiBell size={18} />
                <span className="absolute end-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {newOrders > 9 ? '9+' : newOrders}
                </span>
              </Link>
            )}

            {/* Admin User Info Pill */}
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-1.5 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white text-[11px] font-bold">
                A
              </div>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {profile?.username || 'admin_lithioo'}
              </span>
            </div>

            {/* Prominent Header Logout Button */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 hover:border-red-300 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/40 transition"
              title={t.nav.logout}
            >
              <FiLogOut size={14} />
              <span className="hidden xs:inline sm:inline">{t.nav.logout}</span>
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
export default AdminLayout;

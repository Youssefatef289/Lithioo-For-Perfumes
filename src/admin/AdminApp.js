/**
 * src/admin/AdminApp.js
 * Root for all /admin routes. Loaded lazily from App.js via React.lazy().
 * Contains its own providers, router, and layout – completely isolated from storefront.
 */
import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminAuthProvider }  from './contexts/AdminAuthContext';
import { AdminLangProvider }  from './contexts/AdminLangContext';
import { ToastProvider }      from './components/ui/Toast';
import { AdminLayout }        from './components/AdminLayout';
import { ProtectedRoute }     from './components/ProtectedRoute';
import { subscribeToOrders }  from '../services/orders';

// Lazy-load all admin pages for code splitting
const LoginPage       = React.lazy(() => import('./pages/LoginPage'));
const OverviewPage    = React.lazy(() => import('./pages/OverviewPage'));
const OrdersPage      = React.lazy(() => import('./pages/orders/OrdersPage'));
const OrderDetailPage = React.lazy(() => import('./pages/orders/OrderDetailPage'));
const ProductsPage    = React.lazy(() => import('./pages/products/ProductsPage'));
const ProductFormPage = React.lazy(() => import('./pages/products/ProductFormPage'));
const BrandsPage      = React.lazy(() => import('./pages/BrandsPage'));
const HeroPage        = React.lazy(() => import('./pages/HeroPage'));
const ReviewsPage     = React.lazy(() => import('./pages/ReviewsPage'));
const SubscribersPage = React.lazy(() => import('./pages/SubscribersPage'));
const SettingsPage    = React.lazy(() => import('./pages/SettingsPage'));
const TeamPage        = React.lazy(() => import('./pages/TeamPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

const PageSuspense = ({ children }) => (
  <Suspense fallback={
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
    </div>
  }>
    {children}
  </Suspense>
);

function AdminWithLayout({ children, newOrders, onThemeToggle, isDark }) {
  return (
    <ProtectedRoute>
      <AdminLayout newOrders={newOrders} onThemeToggle={onThemeToggle} isDark={isDark}>
        <PageSuspense>{children}</PageSuspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default function AdminApp() {
  const [newOrders, setNewOrders] = useState(0);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.getAttribute('data-theme') === 'dark'
  );

  // Listen for realtime new orders
  useEffect(() => {
    const unsub = subscribeToOrders(() => {
      setNewOrders(n => n + 1);
    });
    return unsub;
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('lithioo_theme', next); } catch {}
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <AdminLangProvider>
          <ToastProvider>
            <Routes>
              {/* Public */}
              <Route path="login" element={<PageSuspense><LoginPage /></PageSuspense>} />

              {/* Protected */}
              <Route index element={
                <AdminWithLayout newOrders={newOrders} onThemeToggle={toggleTheme} isDark={isDark}>
                  <OverviewPage />
                </AdminWithLayout>
              } />

              <Route path="orders" element={
                <AdminWithLayout newOrders={newOrders} onThemeToggle={toggleTheme} isDark={isDark}>
                  <OrdersPage onRead={() => setNewOrders(0)} />
                </AdminWithLayout>
              } />

              <Route path="orders/:id" element={
                <AdminWithLayout newOrders={newOrders} onThemeToggle={toggleTheme} isDark={isDark}>
                  <OrderDetailPage />
                </AdminWithLayout>
              } />

              <Route path="products" element={
                <AdminWithLayout newOrders={newOrders} onThemeToggle={toggleTheme} isDark={isDark}>
                  <ProductsPage />
                </AdminWithLayout>
              } />

              <Route path="products/new" element={
                <AdminWithLayout newOrders={newOrders} onThemeToggle={toggleTheme} isDark={isDark}>
                  <ProductFormPage />
                </AdminWithLayout>
              } />

              <Route path="products/:id" element={
                <AdminWithLayout newOrders={newOrders} onThemeToggle={toggleTheme} isDark={isDark}>
                  <ProductFormPage />
                </AdminWithLayout>
              } />

              <Route path="brands" element={
                <AdminWithLayout newOrders={newOrders} onThemeToggle={toggleTheme} isDark={isDark}>
                  <BrandsPage />
                </AdminWithLayout>
              } />

              <Route path="hero" element={
                <AdminWithLayout newOrders={newOrders} onThemeToggle={toggleTheme} isDark={isDark}>
                  <HeroPage />
                </AdminWithLayout>
              } />

              <Route path="reviews" element={
                <AdminWithLayout newOrders={newOrders} onThemeToggle={toggleTheme} isDark={isDark}>
                  <ReviewsPage />
                </AdminWithLayout>
              } />

              <Route path="subscribers" element={
                <AdminWithLayout newOrders={newOrders} onThemeToggle={toggleTheme} isDark={isDark}>
                  <SubscribersPage />
                </AdminWithLayout>
              } />

              <Route path="settings" element={
                <AdminWithLayout newOrders={newOrders} onThemeToggle={toggleTheme} isDark={isDark}>
                  <SettingsPage />
                </AdminWithLayout>
              } />

              <Route path="team" element={
                <AdminWithLayout newOrders={newOrders} onThemeToggle={toggleTheme} isDark={isDark}>
                  <TeamPage />
                </AdminWithLayout>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </ToastProvider>
        </AdminLangProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}


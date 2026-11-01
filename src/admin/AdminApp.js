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
import { LoginPage, adminRoutes } from './adminRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

const PageSuspense = ({ children }) => (
  <Suspense
    fallback={
      <div className="flex h-full items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    }
  >
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
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') === 'dark';
    }
    return false;
  });

  // Listen for realtime new orders
  useEffect(() => {
    const unsub = subscribeToOrders(() => {
      setNewOrders((n) => n + 1);
    });
    return unsub;
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
    }
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('lithioo_theme', next);
      }
    } catch {}
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <AdminLangProvider>
          <ToastProvider>
            <Routes>
              {/* Public Login Route */}
              <Route
                path="login"
                element={
                  <PageSuspense>
                    <LoginPage />
                  </PageSuspense>
                }
              />

              {/* Protected Routes mapped from adminRoutes */}
              {adminRoutes.map((route) => {
                const RouteComponent = route.Component;
                return (
                  <Route
                    key={route.path || 'index'}
                    index={route.path === ''}
                    path={route.path === '' ? undefined : route.path}
                    element={
                      <AdminWithLayout
                        newOrders={newOrders}
                        onThemeToggle={toggleTheme}
                        isDark={isDark}
                      >
                        {route.path === 'orders' ? (
                          <RouteComponent onRead={() => setNewOrders(0)} />
                        ) : (
                          <RouteComponent />
                        )}
                      </AdminWithLayout>
                    }
                  />
                );
              })}

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </ToastProvider>
        </AdminLangProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

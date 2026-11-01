/**
 * src/admin/adminRoutes.js
 * Centralized route definitions for the Lithioo Perfumes Admin Dashboard.
 */
import React from 'react';

// Lazy-loaded Admin Page Components
export const LoginPage = React.lazy(() => import('./pages/LoginPage'));
export const OverviewPage = React.lazy(() => import('./pages/OverviewPage'));
export const ProductsPage = React.lazy(() => import('./pages/products/ProductsPage'));
export const ProductFormPage = React.lazy(() => import('./pages/products/ProductFormPage'));
export const BrandsPage = React.lazy(() => import('./pages/BrandsPage'));
export const OrdersPage = React.lazy(() => import('./pages/orders/OrdersPage'));
export const OrderDetailPage = React.lazy(() => import('./pages/orders/OrderDetailPage'));
export const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

/**
 * Core admin protected routes configuration:
 * 1. الرئيسية (Dashboard)
 * 2. المنتجات (Products)
 * 3. البراندات (Brands)
 * 4. الطلبات (Orders)
 * 5. الإعدادات (Settings)
 */
export const adminRoutes = [
  {
    path: '',
    titleKey: 'overview',
    Component: OverviewPage,
  },
  {
    path: 'products',
    titleKey: 'products',
    Component: ProductsPage,
  },
  {
    path: 'products/new',
    titleKey: 'newProduct',
    Component: ProductFormPage,
  },
  {
    path: 'products/:id',
    titleKey: 'editProduct',
    Component: ProductFormPage,
  },
  {
    path: 'brands',
    titleKey: 'brands',
    Component: BrandsPage,
  },
  {
    path: 'orders',
    titleKey: 'orders',
    Component: OrdersPage,
  },
  {
    path: 'orders/:id',
    titleKey: 'orderDetails',
    Component: OrderDetailPage,
  },
  {
    path: 'settings',
    titleKey: 'settings',
    Component: SettingsPage,
  },
];


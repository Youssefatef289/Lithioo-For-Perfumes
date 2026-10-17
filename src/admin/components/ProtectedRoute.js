/**
 * src/admin/components/ProtectedRoute.js
 * Redirects unauthenticated or unauthorized users.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, loading, isAdmin, isManagerPlus, isStaff } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isStaff) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (requiredRole === 'manager' && !isManagerPlus) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}


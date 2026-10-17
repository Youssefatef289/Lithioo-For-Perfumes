import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, delta, icon: Icon, color = 'brand', loading }) {
  const colorMap = {
    brand:  'bg-brand/10 text-brand',
    green:  'bg-emerald-100 text-emerald-600',
    amber:  'bg-amber-100 text-amber-600',
    red:    'bg-red-100 text-red-600',
    blue:   'bg-blue-100 text-blue-600',
  };
  return (
    <Card className="flex items-start gap-4">
      {Icon && (
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorMap[color] ?? colorMap.brand}`}>
          <Icon size={22} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
        {loading
          ? <div className="mt-1 h-8 w-24 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
          : <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white truncate">{value}</p>
        }
        {delta !== undefined && !loading && (
          <p className={`mt-1 text-xs font-medium ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% vs prev. period
          </p>
        )}
      </div>
    </Card>
  );
}


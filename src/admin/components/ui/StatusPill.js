import React from 'react';

const STATUS_STYLES = {
  new:       'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  confirmed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  preparing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  shipped:   'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  active:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  inactive:  'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
  instock:   'bg-emerald-100 text-emerald-700',
  outofstock:'bg-red-100 text-red-600',
};

export function StatusPill({ status, label }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] ?? 'bg-neutral-100 text-neutral-600'}`}>
      {label ?? status}
    </span>
  );
}

export function Badge({ children, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand/10 text-brand',
    gray:  'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
    red:   'bg-red-100 text-red-600',
    green: 'bg-emerald-100 text-emerald-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colors[color] ?? colors.brand}`}>
      {children}
    </span>
  );
}


import React, { forwardRef } from 'react';

const BASE = 'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed';

export const Input = forwardRef(function Input({ label, error, hint, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>}
      <input ref={ref} className={`${BASE} ${error ? 'border-red-400 focus:ring-red-400' : 'border-neutral-200'} ${className}`} {...props} />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, hint, rows = 4, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>}
      <textarea ref={ref} rows={rows} className={`${BASE} resize-y ${error ? 'border-red-400 focus:ring-red-400' : 'border-neutral-200'} ${className}`} {...props} />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  );
});

export const Select = forwardRef(function Select({ label, error, hint, children, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>}
      <select ref={ref} className={`${BASE} cursor-pointer ${error ? 'border-red-400' : 'border-neutral-200'} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  );
});

export const Switch = function Switch({ label, checked, onChange, disabled }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <span className="relative inline-flex h-6 w-11 flex-shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={e => onChange(e.target.checked)} disabled={disabled} />
        <span className="h-full w-full rounded-full bg-neutral-200 transition peer-checked:bg-brand peer-disabled:opacity-50 dark:bg-neutral-700" />
        <span className="absolute start-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
      {label && <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>}
    </label>
  );
};


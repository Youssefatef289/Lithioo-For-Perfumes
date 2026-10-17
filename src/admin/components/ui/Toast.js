import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);
let _toastCount = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = 'success', duration = 3500 }) => {
    const id = ++_toastCount;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {createPortal(
        <div className="fixed bottom-6 end-6 z-[300] flex flex-col gap-2">
          {toasts.map(toast => (
            <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}

const ICONS = {
  success: { color: 'text-emerald-600', path: 'M5 13l4 4L19 7' },
  error:   { color: 'text-red-500',     path: 'M6 18L18 6M6 6l12 12' },
  warning: { color: 'text-amber-500',   path: 'M12 9v4m0 4h.01M12 3l9 15H3L12 3z' },
  info:    { color: 'text-blue-500',    path: 'M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z' },
};

export function Toast({ message, type = 'success', onClose }) {
  const { color, path } = ICONS[type] ?? ICONS.success;
  return (
    <div className="flex items-start gap-3 min-w-[260px] max-w-xs rounded-2xl border border-neutral-100 bg-white px-4 py-3 shadow-xl dark:border-neutral-700 dark:bg-neutral-800 animate-slide-up">
      <svg viewBox="0 0 24 24" className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="flex-1 text-sm text-neutral-800 dark:text-neutral-100">{message}</p>
      <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600" aria-label="Dismiss">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  );
}


import React from 'react';

export function Skeleton({ className = '', lines = 1 }) {
  if (lines === 1) {
    return <div className={`animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700 ${className}`} />;
  }
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700 h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'} ${className}`} />
      ))}
    </div>
  );
}

export function EmptyState({ title = 'No data', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-neutral-200 py-16 px-8 text-center dark:border-neutral-700">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div>
        <p className="font-semibold text-neutral-700 dark:text-neutral-200">{title}</p>
        {description && <p className="mt-1 text-sm text-neutral-400">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Tabs({ tabs, activeKey, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-neutral-100 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-800/50 scrollbar-none">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={[
            'flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all',
            activeKey === tab.key
              ? 'bg-white text-brand shadow-sm dark:bg-neutral-900 dark:text-brand'
              : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200',
          ].join(' ')}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ms-1.5 rounded-full px-1.5 py-0.5 text-xs ${activeKey === tab.key ? 'bg-brand/10' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function ImageUploader({ value, onChange, label, accept = 'image/webp,image/jpeg,image/png', maxMb = 3, hint }) {
  const inputRef = React.useRef(null);
  const [preview, setPreview] = React.useState(value || null);
  const [error, setError] = React.useState(null);

  const handleFile = (file) => {
    if (!file) return;
    setError(null);
    if (file.size > maxMb * 1024 * 1024) {
      setError(`File exceeds ${maxMb}MB limit`);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(file, url);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>}
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-6 text-center transition hover:border-brand cursor-pointer dark:border-neutral-700 dark:bg-neutral-800"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
      >
        {preview
          ? <img src={preview} alt="Preview" className="max-h-40 max-w-full rounded-lg object-contain" />
          : (
            <>
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm text-neutral-500">Click or drag & drop to upload</p>
            </>
          )
        }
        <input ref={inputRef} type="file" accept={accept} className="sr-only"
          onChange={e => handleFile(e.target.files[0])} />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}


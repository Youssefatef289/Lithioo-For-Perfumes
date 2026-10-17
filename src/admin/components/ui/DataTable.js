import React from 'react';
import { Button } from './Button';

/**
 * DataTable — server-side or client-side data table with:
 * - Column definitions: { key, label, render?, sortable?, width? }
 * - Pagination (controlled or internal)
 * - Search (internal client-side when no onSearch provided)
 * - Row selection with checkboxes
 * - Responsive: collapses to card layout on mobile
 */
export function DataTable({
  columns = [],
  data = [],
  loading = false,
  totalCount,
  page = 1,
  perPage = 20,
  onPageChange,
  onSort,
  sortKey,
  sortDir = 'desc',
  rowKey = 'id',
  selected = [],
  onSelectChange,
  actions,
  emptyMessage = 'No data found.',
}) {
  const totalPages = totalCount !== undefined
    ? Math.max(1, Math.ceil(totalCount / perPage))
    : Math.max(1, Math.ceil(data.length / perPage));

  const displayData = (onPageChange || totalCount !== undefined)
    ? data  // server-side: already paginated
    : data.slice((page - 1) * perPage, page * perPage);

  const allSelected = selected.length > 0 && selected.length === displayData.length;

  const toggleAll = () => {
    if (allSelected) onSelectChange?.([]);
    else onSelectChange?.(displayData.map(r => r[rowKey]));
  };

  const toggleRow = (id) => {
    if (selected.includes(id)) onSelectChange?.(selected.filter(s => s !== id));
    else onSelectChange?.([...selected, id]);
  };

  const handleSort = (key) => {
    if (!onSort) return;
    if (sortKey === key) onSort(key, sortDir === 'asc' ? 'desc' : 'asc');
    else onSort(key, 'asc');
  };

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null;
    if (sortKey !== col.key) return <span className="opacity-30">↕</span>;
    return <span>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-neutral-100 dark:border-neutral-800">
        <div className="animate-pulse space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex gap-4 px-6 py-4 ${i === 0 ? 'bg-neutral-50 dark:bg-neutral-800' : ''}`}>
              {columns.map(col => (
                <div key={col.key} className="h-4 flex-1 rounded bg-neutral-200 dark:bg-neutral-700" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!loading && displayData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-16 dark:border-neutral-700">
        <p className="text-sm text-neutral-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-neutral-100 dark:border-neutral-800 md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50">
            <tr>
              {onSelectChange && (
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-neutral-300" />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 ${col.sortable ? 'cursor-pointer select-none hover:text-neutral-700' : ''} ${col.width ?? ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">{col.label} <SortIcon col={col} /></span>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wide text-neutral-500">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
            {displayData.map(row => (
              <tr key={row[rowKey]} className={`group hover:bg-neutral-50 dark:hover:bg-neutral-800/40 ${selected.includes(row[rowKey]) ? 'bg-brand/5' : ''}`}>
                {onSelectChange && (
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(row[rowKey])} onChange={() => toggleRow(row[rowKey])} className="rounded border-neutral-300" />
                  </td>
                )}
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
                {actions && <td className="px-4 py-3 text-end">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {displayData.map(row => (
          <div key={row[rowKey]} className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {columns.map(col => (
              <div key={col.key} className="flex items-start justify-between py-1 text-sm">
                <span className="font-medium text-neutral-500 dark:text-neutral-400">{col.label}</span>
                <span className="text-end text-neutral-800 dark:text-neutral-200">
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </span>
              </div>
            ))}
            {actions && <div className="mt-3 flex justify-end">{actions(row)}</div>}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-neutral-500">
            Page {page} of {totalPages}
            {totalCount !== undefined && ` · ${totalCount} total`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}>← Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}>Next →</Button>
          </div>
        </div>
      )}
    </div>
  );
}


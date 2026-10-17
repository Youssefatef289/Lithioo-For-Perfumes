import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiDownload, FiSearch, FiTrash2 } from 'react-icons/fi';
import { useAdminLang } from '../contexts/AdminLangContext';
import { useToast } from '../components/ui/Toast';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { Button, Input, DataTable, Switch, ConfirmDialog } from '../components/ui';

export default function SubscribersPage() {
  const { t, language } = useAdminLang();
  const toast = useToast();

  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setSubscribers([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSubscribers(data || []);
    } catch (err) {
      console.error(err);
      toast({ message: t.common.error, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [t.common.error, toast]);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  const handleToggleActive = async (sub, nextVal) => {
    setSubscribers((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, is_active: nextVal } : s))
    );
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: nextVal })
        .eq('id', sub.id);
      if (error) {
        toast({ message: t.common.error, type: 'error' });
        loadSubscribers();
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('newsletter_subscribers')
          .delete()
          .eq('id', deleteTarget.id);
        if (error) throw error;
      }
      toast({ message: language === 'ar' ? 'تم الحذف' : 'Subscriber deleted', type: 'success' });
      setDeleteTarget(null);
      loadSubscribers();
    } catch (err) {
      toast({ message: err.message || t.common.error, type: 'error' });
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const headers = ['Email', 'Subscribed At', 'Active'];
    const rows = subscribers.map((s) => [
      `"${s.email}"`,
      new Date(s.created_at).toISOString(),
      s.is_active ? 'Yes' : 'No',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = useMemo(() => {
    if (!search) return subscribers;
    return subscribers.filter((s) => s.email.toLowerCase().includes(search.toLowerCase()));
  }, [subscribers, search]);

  const columns = [
    {
      key: 'email',
      label: t.subscribers.email,
      render: (val) => <span className="font-medium text-neutral-900 dark:text-white">{val}</span>,
    },
    {
      key: 'created_at',
      label: t.subscribers.date,
      render: (val) => (
        <span className="text-xs text-neutral-500">
          {new Date(val).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: t.subscribers.active,
      render: (val, row) => (
        <Switch checked={val} onChange={(next) => handleToggleActive(row, next)} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t.subscribers.title} ({subscribers.length})
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {language === 'ar' ? 'إدارة المشتركين في النشرة البريدية' : 'Manage email newsletter subscribers'}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <FiDownload size={14} />
          {t.subscribers.export}
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Input
          placeholder={t.subscribers.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-9"
        />
        <FiSearch className="absolute start-3 top-3 text-neutral-400" size={16} />
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        actions={(row) => (
          <button
            onClick={() => setDeleteTarget(row)}
            className="rounded p-1.5 text-neutral-400 hover:text-red-500"
          >
            <FiTrash2 size={16} />
          </button>
        )}
        emptyMessage={t.common.empty}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t.subscribers.delete}
        message={language === 'ar' ? 'حذف هذا البريد من القائمة؟' : 'Remove this email from subscribers?'}
        confirmLabel={t.common.delete}
        dangerous
      />
    </div>
  );
}


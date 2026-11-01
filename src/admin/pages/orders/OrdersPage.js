import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiDownload, FiSearch, FiEye, FiPhone } from 'react-icons/fi';
import { useAdminLang } from '../../contexts/AdminLangContext';
import { useToast } from '../../components/ui/Toast';
import { fetchOrders, subscribeToOrders, updateOrderStatus } from '../../../services/orders';
import { Button, Input, DataTable, StatusPill, Tabs } from '../../components/ui';

export default function OrdersPage({ onRead }) {
  const { t, language } = useAdminLang();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentStatus = searchParams.get('status') || 'all';
  const [activeTab, setActiveTab] = useState(currentStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync tab with URL
  useEffect(() => {
    const s = searchParams.get('status') || 'all';
    setActiveTab(s);
  }, [searchParams]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = activeTab === 'all' ? null : activeTab;
      const { data, count } = await fetchOrders({
        page,
        perPage: 20,
        status: statusParam,
        search: debouncedQuery,
      });
      setOrders(data);
      setTotalCount(count);
      if (onRead) onRead();
    } catch (err) {
      console.error('Failed to load orders:', err);
      toast({ message: t.common.error, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, debouncedQuery, onRead, toast, t.common.error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime subscription
  useEffect(() => {
    const unsub = subscribeToOrders((payload) => {
      toast({
        message:
          language === 'ar'
            ? 'طلب جديد ورد الآن!'
            : 'New order received!',
        type: 'info',
      });
      loadData();
    });
    return unsub;
  }, [loadData, toast, language]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
    if (key === 'all') {
      searchParams.delete('status');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ status: key });
    }
  };

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) return;
    const headers = ['Order Number', 'Customer', 'Phone', 'Total', 'Status', 'Date'];
    const rows = orders.map((o) => [
      `LTH-${String(o.order_number).padStart(6, '0')}`,
      `"${o.customer_name}"`,
      `"${o.phone}"`,
      o.total,
      o.status,
      new Date(o.created_at).toISOString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusUpdate = async (orderId, nextStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, nextStatus);
      toast({
        message:
          t.orders.statusUpdated ||
          (language === 'ar' ? 'تم تحديث حالة الطلب بنجاح' : 'Order status updated successfully'),
        type: 'success',
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      toast({ message: t.common.error, type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const statusTabs = [
    { key: 'all',         label: t.orders.all },
    { key: 'new',         label: t.orders.new || 'جديد' },
    { key: 'in_progress', label: t.orders.in_progress || 'قيد التنفيذ' },
    { key: 'delivered',   label: t.orders.delivered || 'مكتمل' },
    { key: 'cancelled',   label: t.orders.cancelled || 'ملغي' },
  ];

  const columns = [
    {
      key: 'order_number',
      label: t.orders.orderNum,
      render: (val, row) => (
        <Link
          to={`/admin/orders/${row.id}`}
          className="font-bold text-brand hover:underline font-mono"
        >
          LTH-{String(val).padStart(6, '0')}
        </Link>
      ),
    },
    {
      key: 'customer_name',
      label: t.orders.customer,
      render: (val) => <span className="font-medium text-neutral-900 dark:text-white">{val}</span>,
    },
    {
      key: 'phone',
      label: t.orders.phone,
      render: (val) => (
        <a
          href={`tel:${val}`}
          className="flex items-center gap-1 text-xs text-neutral-600 hover:text-brand dark:text-neutral-400 font-mono"
          dir="ltr"
        >
          <FiPhone size={12} /> {val}
        </a>
      ),
    },
    {
      key: 'total',
      label: t.orders.total,
      render: (val) => (
        <span className="font-semibold text-neutral-900 dark:text-white">
          {Number(val).toLocaleString()} {t.common.egp}
        </span>
      ),
    },
    {
      key: 'status',
      label: t.orders.status,
      render: (val, row) => {
        // Map preparing / confirmed / shipped to in_progress or fallback
        const selectValue = ['preparing', 'confirmed', 'shipped'].includes(val) ? 'preparing' : val;
        return (
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={val} label={t.orders[val] || val} />
            <select
              value={selectValue}
              onChange={(e) => handleStatusUpdate(row.id, e.target.value)}
              disabled={updatingId === row.id}
              className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand transition disabled:opacity-50"
              title={t.orders.changeStatus || 'Change Status'}
            >
              <option value="new">{t.orders.new || 'جديد'}</option>
              <option value="preparing">{t.orders.in_progress || 'قيد التنفيذ'}</option>
              <option value="delivered">{t.orders.delivered || 'مكتمل'}</option>
              <option value="cancelled">{t.orders.cancelled || 'ملغي'}</option>
            </select>
          </div>
        );
      },
    },
    {
      key: 'created_at',
      label: t.orders.date,
      render: (val) => (
        <span className="text-xs text-neutral-500">
          {new Date(val).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{t.orders.title}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {language === 'ar' ? 'إدارة ومتابعة طلبات المتجر' : 'Manage and track store orders'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FiDownload size={14} />
            {t.orders.exportCsv}
          </Button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-3">
        <Tabs tabs={statusTabs} activeKey={activeTab} onChange={handleTabChange} />

        <div className="relative max-w-md">
          <Input
            placeholder={t.orders.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9"
          />
          <FiSearch
            className="absolute start-3 top-3 text-neutral-400 pointer-events-none"
            size={16}
          />
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        totalCount={totalCount}
        page={page}
        perPage={20}
        onPageChange={setPage}
        actions={(row) => (
          <Link to={`/admin/orders/${row.id}`}>
            <Button variant="ghost" size="xs">
              <FiEye size={14} />
              {t.orders.viewOrder}
            </Button>
          </Link>
        )}
        emptyMessage={t.common.empty}
      />
    </div>
  );
}


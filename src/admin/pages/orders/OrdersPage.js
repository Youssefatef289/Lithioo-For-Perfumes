import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiDownload, FiSearch, FiEye, FiPhone } from 'react-icons/fi';
import { useAdminLang } from '../../contexts/AdminLangContext';
import { useToast } from '../../components/ui/Toast';
import { fetchOrders, subscribeToOrders } from '../../../services/orders';
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

  const statusTabs = [
    { key: 'all', label: t.orders.all },
    { key: 'new', label: t.orders.new },
    { key: 'confirmed', label: t.orders.confirmed },
    { key: 'preparing', label: t.orders.preparing },
    { key: 'shipped', label: t.orders.shipped },
    { key: 'delivered', label: t.orders.delivered },
    { key: 'cancelled', label: t.orders.cancelled },
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
      render: (val) => <StatusPill status={val} label={t.orders[val]} />,
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


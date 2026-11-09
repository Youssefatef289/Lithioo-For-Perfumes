import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiDownload,
  FiSearch,
  FiEye,
  FiPhone,
  FiCheckCircle,
  FiMapPin,
  FiCreditCard,
} from 'react-icons/fi';
import { useAdminLang } from '../../contexts/AdminLangContext';
import { useToast } from '../../components/ui/Toast';
import {
  fetchOrders,
  subscribeToOrders,
  updateOrderStatus,
  markOrderAsReceived,
} from '../../../services/orders';
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

  // Realtime subscription with sound and toast
  useEffect(() => {
    const unsub = subscribeToOrders((payload) => {
      // Play notification sound if supported
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch (e) {
        // audio play ignored
      }

      toast({
        message:
          language === 'ar'
            ? '🔔 طلب جديد ورد الآن إلى لوحة التحكم!'
            : '🔔 New order received in dashboard!',
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
    const headers = [
      'Order Number',
      'Customer',
      'Phone',
      'Address',
      'City',
      'Total',
      'Payment Method',
      'Status',
      'Date',
    ];
    const rows = orders.map((o) => [
      `LTH-${String(o.order_number).padStart(6, '0')}`,
      `"${o.customer_name}"`,
      `"${o.phone}"`,
      `"${o.address || ''}"`,
      `"${o.city || ''}"`,
      o.total,
      o.payment_method || 'cod',
      o.status,
      new Date(o.created_at).toISOString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
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

  // Dedicated "استقبال" action
  const handleMarkAsReceived = async (order) => {
    setUpdatingId(order.id);
    try {
      await markOrderAsReceived(order.id, order, 'استقبال الطلب من صفحة الطلبات');
      toast({
        message:
          language === 'ar'
            ? '✅ تم استقبال الطلب وإرسال إشعار للإدارة بنجاح'
            : 'Order received & admin notified',
        type: 'success',
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'delivered' } : o))
      );
    } catch (err) {
      console.error('Failed to mark received:', err);
      toast({ message: err.message || t.common.error, type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  // Status Filter Tabs
  const statusTabs = [
    { key: 'all',       label: t.orders.all || (language === 'ar' ? 'الكل' : 'All') },
    { key: 'new',       label: t.orders.new || (language === 'ar' ? 'جديد' : 'New') },
    { key: 'preparing', label: t.orders.preparing || (language === 'ar' ? 'قيد التجهيز' : 'Preparing') },
    { key: 'shipped',   label: t.orders.shipped || (language === 'ar' ? 'تم الشحن' : 'Shipped') },
    { key: 'delivered', label: t.orders.received || (language === 'ar' ? 'مستلم / مكتمل' : 'Received') },
    { key: 'cancelled', label: t.orders.cancelled || (language === 'ar' ? 'ملغي' : 'Cancelled') },
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
      key: 'address',
      label: t.orders.address || (language === 'ar' ? 'العنوان والمحافظة' : 'Address'),
      render: (val, row) => (
        <div className="flex items-start gap-1 text-xs text-neutral-600 dark:text-neutral-400 max-w-[180px]">
          <FiMapPin size={13} className="shrink-0 text-brand mt-0.5" />
          <span className="truncate" title={`${row.city || ''} ${row.address || ''}`}>
            {row.city ? `${row.city} - ` : ''}
            {row.address || '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'order_items',
      label: t.orders.itemsSummary || (language === 'ar' ? 'المنتجات' : 'Items'),
      render: (items) => {
        const list = items || [];
        if (list.length === 0) return <span className="text-xs text-neutral-400">—</span>;
        return (
          <div className="flex flex-col text-xs text-neutral-700 dark:text-neutral-300 max-w-[190px]">
            {list.slice(0, 2).map((item, idx) => (
              <span key={item.id || idx} className="truncate">
                • {item.product_name} {item.size_label ? `(${item.size_label})` : ''} ×{item.quantity}
              </span>
            ))}
            {list.length > 2 && (
              <span className="text-[10px] text-neutral-400">+{list.length - 2} {language === 'ar' ? 'منتجات إضافية' : 'more items'}</span>
            )}
          </div>
        );
      },
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
      key: 'payment_method',
      label: t.orders.paymentMethod || (language === 'ar' ? 'الدفع' : 'Payment'),
      render: (val) => (
        <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          <FiCreditCard size={11} />
          {val === 'cod' || !val
            ? language === 'ar' ? 'عند الاستلام' : 'COD'
            : val}
        </span>
      ),
    },
    {
      key: 'status',
      label: t.orders.status,
      render: (val, row) => {
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusPill status={val} label={t.orders[val] || val} />
            <select
              value={val}
              onChange={(e) => handleStatusUpdate(row.id, e.target.value)}
              disabled={updatingId === row.id}
              className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand transition disabled:opacity-50"
              title={t.orders.changeStatus || 'Change Status'}
            >
              <option value="new">{t.orders.new || 'جديد'}</option>
              <option value="preparing">{t.orders.preparing || 'قيد التجهيز'}</option>
              <option value="shipped">{t.orders.shipped || 'تم الشحن'}</option>
              <option value="delivered">{t.orders.received || 'مستلم / مكتمل'}</option>
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
            {language === 'ar'
              ? 'إدارة ومتابعة طلبات المتجر مع إشعار واستقبال فوري'
              : 'Track store orders with live sync and reception action'}
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
          <div className="flex items-center gap-1.5">
            {row.status !== 'delivered' && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleMarkAsReceived(row)}
                loading={updatingId === row.id}
                className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                title={language === 'ar' ? 'استقبال الطلب' : 'Mark as received'}
              >
                <FiCheckCircle size={13} />
                <span>{language === 'ar' ? 'استقبال' : 'Receive'}</span>
              </Button>
            )}

            <Link to={`/admin/orders/${row.id}`}>
              <Button variant="ghost" size="xs">
                <FiEye size={14} />
                {t.orders.viewOrder}
              </Button>
            </Link>
          </div>
        )}
        emptyMessage={t.common.empty}
      />
    </div>
  );
}

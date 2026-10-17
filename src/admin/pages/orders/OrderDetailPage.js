import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiPhone,
  FiMessageSquare,
  FiPrinter,
} from 'react-icons/fi';
import { useAdminLang } from '../../contexts/AdminLangContext';
import { useToast } from '../../components/ui/Toast';
import { fetchOrder, updateOrderStatus } from '../../../services/orders';
import { Card, Button, StatusPill, Select, Textarea, Skeleton } from '../../components/ui';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, isRTL, language } = useAdminLang();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('new');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrder(id);
      if (data) {
        setOrder(data);
        setNewStatus(data.status);
      }
    } catch (err) {
      console.error(err);
      toast({ message: t.common.error, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id, t.common.error, toast]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus, statusNote || null);
      toast({ message: language === 'ar' ? 'تم تحديث الحالة بنجاح' : 'Status updated', type: 'success' });
      setStatusNote('');
      await loadOrder();
    } catch (err) {
      toast({ message: err.message || t.common.error, type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const openWhatsApp = () => {
    if (!order?.phone) return;
    const cleanPhone = order.phone.replace(/[^0-9]/g, '');
    const greeting =
      language === 'ar'
        ? `مرحباً ${order.customer_name}، نتواصل معك بخصوص طلبك رقم LTH-${String(order.order_number).padStart(6, '0')} من متجر ليثيو للعطور.`
        : `Hello ${order.customer_name}, contacting you regarding your order LTH-${String(order.order_number).padStart(6, '0')} from Lithioo Perfumes.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(greeting)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-neutral-500">{t.common.empty}</p>
        <Link to="/admin/orders" className="mt-4 inline-block text-brand underline">
          {t.orders.title}
        </Link>
      </div>
    );
  }

  const orderNumStr = `LTH-${String(order.order_number).padStart(6, '0')}`;
  const items = order.order_items || [];
  const history = order.order_status_history || [];

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/orders')}
            className="rounded-xl border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400"
          >
            {isRTL ? <FiArrowRight size={18} /> : <FiArrowLeft size={18} />}
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
                {orderNumStr}
              </h1>
              <StatusPill status={order.status} label={t.orders[order.status]} />
            </div>
            <p className="text-xs text-neutral-500">
              {new Date(order.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <FiPrinter size={14} />
            {language === 'ar' ? 'طباعة الفاتورة' : 'Print Invoice'}
          </Button>
          <Button variant="primary" size="sm" onClick={openWhatsApp}>
            <FiMessageSquare size={14} />
            {t.orders.openWhatsApp}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (Items & Customer Details) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <Card>
            <h2 className="mb-4 text-base font-bold text-neutral-900 dark:text-white">
              {t.orders.orderItems} ({items.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-neutral-100 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800">
                  <tr>
                    <th className="py-2.5 text-start">{t.products.name}</th>
                    <th className="py-2.5 text-center">{language === 'ar' ? 'الحجم' : 'Size'}</th>
                    <th className="py-2.5 text-center">{language === 'ar' ? 'الكمية' : 'Qty'}</th>
                    <th className="py-2.5 text-end">{language === 'ar' ? 'سعر الوحدة' : 'Price'}</th>
                    <th className="py-2.5 text-end">{t.orders.total}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 font-medium text-neutral-900 dark:text-white">
                        {item.product_name}
                      </td>
                      <td className="py-3 text-center text-xs text-neutral-500">
                        {item.size_label || '—'}
                      </td>
                      <td className="py-3 text-center font-semibold text-neutral-700 dark:text-neutral-300">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-end text-neutral-600 dark:text-neutral-400">
                        {Number(item.unit_price).toLocaleString()} {t.common.egp}
                      </td>
                      <td className="py-3 text-end font-semibold text-neutral-900 dark:text-white">
                        {Number(item.line_total).toLocaleString()} {t.common.egp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="mt-6 border-t border-neutral-100 pt-4 dark:border-neutral-800 space-y-2">
              <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                <span>{t.orders.subtotal}</span>
                <span>
                  {Number(order.subtotal).toLocaleString()} {t.common.egp}
                </span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                <span>{t.orders.shipping}</span>
                <span>
                  {Number(order.shipping_fee) === 0
                    ? language === 'ar'
                      ? 'مجاني'
                      : 'Free'
                    : `${Number(order.shipping_fee).toLocaleString()} ${t.common.egp}`}
                </span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>{t.orders.discount}</span>
                  <span>
                    -{Number(order.discount).toLocaleString()} {t.common.egp}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-bold text-neutral-900 dark:text-white dark:border-neutral-800">
                <span>{t.orders.orderTotal}</span>
                <span className="text-brand">
                  {Number(order.total).toLocaleString()} {t.common.egp}
                </span>
              </div>
            </div>
          </Card>

          {/* Customer Info */}
          <Card>
            <h2 className="mb-4 text-base font-bold text-neutral-900 dark:text-white">
              {language === 'ar' ? 'بيانات العميل والتوصيل' : 'Customer & Shipping Info'}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs text-neutral-500">{t.orders.customer}</p>
                <p className="mt-1 font-semibold text-neutral-900 dark:text-white">
                  {order.customer_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">{t.orders.phone}</p>
                <a
                  href={`tel:${order.phone}`}
                  className="mt-1 inline-flex items-center gap-1.5 font-semibold text-brand hover:underline font-mono"
                  dir="ltr"
                >
                  <FiPhone size={13} /> {order.phone}
                </a>
              </div>
              <div>
                <p className="text-xs text-neutral-500">
                  {language === 'ar' ? 'المدينة / المحافظة' : 'City / Province'}
                </p>
                <p className="mt-1 font-medium text-neutral-900 dark:text-white">
                  {order.city || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">
                  {language === 'ar' ? 'العنوان بالتفصيل' : 'Detailed Address'}
                </p>
                <p className="mt-1 font-medium text-neutral-900 dark:text-white">
                  {order.address || '—'}
                </p>
              </div>
              {order.notes && (
                <div className="sm:col-span-2 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/60">
                  <p className="text-xs font-semibold text-neutral-500">
                    {language === 'ar' ? 'ملاحظات الطلب' : 'Order Notes'}
                  </p>
                  <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column (Status Update & Timeline) */}
        <div className="space-y-6">
          {/* Change Status */}
          <Card>
            <h2 className="mb-4 text-base font-bold text-neutral-900 dark:text-white">
              {t.orders.changeStatus}
            </h2>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <Select
                label={t.orders.status}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="new">{t.orders.new}</option>
                <option value="confirmed">{t.orders.confirmed}</option>
                <option value="preparing">{t.orders.preparing}</option>
                <option value="shipped">{t.orders.shipped}</option>
                <option value="delivered">{t.orders.delivered}</option>
                <option value="cancelled">{t.orders.cancelled}</option>
              </Select>

              <Textarea
                label={t.orders.note}
                rows={2}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'اكتب ملاحظة حول سبب التغيير...'
                    : 'Reason or note about this status update...'
                }
              />

              <Button type="submit" loading={updating} className="w-full">
                {t.orders.update}
              </Button>
            </form>
          </Card>

          {/* Status History Timeline */}
          <Card>
            <h2 className="mb-4 text-base font-bold text-neutral-900 dark:text-white">
              {t.orders.statusHistory}
            </h2>
            {history.length === 0 ? (
              <p className="text-xs text-neutral-400">{t.common.empty}</p>
            ) : (
              <div className="relative border-s border-neutral-200 dark:border-neutral-700 ms-3 space-y-4">
                {history.map((h, i) => (
                  <div key={h.id || i} className="ms-4 relative">
                    <span className="absolute -start-[23px] top-1.5 flex h-3 w-3 rounded-full bg-brand ring-4 ring-white dark:ring-neutral-900" />
                    <div className="flex items-center gap-2">
                      <StatusPill status={h.status} label={t.orders[h.status]} />
                      <span className="text-[10px] text-neutral-400">
                        {new Date(h.created_at).toLocaleDateString(
                          language === 'ar' ? 'ar-EG' : 'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </span>
                    </div>
                    {h.note && (
                      <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                        {h.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}


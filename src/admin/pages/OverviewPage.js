import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiDollarSign,
  FiShoppingBag,
  FiTrendingUp,
  FiAlertCircle,
  FiClock,
  FiArrowUpRight,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAdminLang } from '../contexts/AdminLangContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { Card, StatCard, StatusPill, Skeleton } from '../components/ui';

const STATUS_COLORS = {
  new: '#3b82f6',
  confirmed: '#6366f1',
  preparing: '#f59e0b',
  shipped: '#0ea5e9',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export default function OverviewPage() {
  const { t, language } = useAdminLang();
  const [range, setRange] = useState('30d'); // 'today' | '7d' | '30d'
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);

      const now = new Date();
      let fromDate = new Date();
      if (range === 'today') {
        fromDate.setHours(0, 0, 0, 0);
      } else if (range === '7d') {
        fromDate.setDate(now.getDate() - 7);
      } else {
        fromDate.setDate(now.getDate() - 30);
      }

      if (!isSupabaseConfigured) {
        // Fallback offline mock values
        if (isMounted) {
          setStats({
            revenue: 0,
            orders_count: 0,
            avg_order_value: 0,
            new_orders: 0,
            orders_by_status: { new: 0, confirmed: 0, delivered: 0 },
            daily_revenue: [],
            top_products: [],
          });
          setRecentOrders([]);
          setLowStockCount(0);
          setLoading(false);
        }
        return;
      }

      try {
        // 1. Try to call admin_dashboard_stats RPC
        const { data: rpcStats, error: rpcError } = await supabase.rpc(
          'admin_dashboard_stats',
          {
            p_from: fromDate.toISOString(),
            p_to: now.toISOString(),
          }
        );

        if (!rpcError && rpcStats) {
          if (isMounted) setStats(rpcStats);
        } else {
          // Fallback manual query if RPC is missing
          const { data: orders } = await supabase
            .from('orders')
            .select('id, total, status, created_at, customer_name, order_number')
            .gte('created_at', fromDate.toISOString())
            .lte('created_at', now.toISOString());

          const list = orders || [];
          const rev = list.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
          const count = list.length;
          const avg = count > 0 ? Math.round(rev / count) : 0;
          const newOrders = list.filter((o) => o.status === 'new').length;

          const statusMap = {};
          list.forEach((o) => {
            statusMap[o.status] = (statusMap[o.status] || 0) + 1;
          });

          if (isMounted) {
            setStats({
              revenue: rev,
              orders_count: count,
              avg_order_value: avg,
              new_orders: newOrders,
              orders_by_status: statusMap,
              daily_revenue: [],
              top_products: [],
            });
          }
        }

        // 2. Fetch Recent Orders (last 8)
        const { data: ordersList } = await supabase
          .from('orders')
          .select('id, order_number, customer_name, total, status, created_at')
          .order('created_at', { ascending: false })
          .limit(8);

        if (isMounted && ordersList) {
          setRecentOrders(ordersList);
        }

        // 3. Fetch Low / Out-of-stock count
        const { count: outStock } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('in_stock', false);

        if (isMounted) {
          setLowStockCount(outStock || 0);
        }
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [range]);

  const pieData = useMemo(() => {
    if (!stats?.orders_by_status) return [];
    return Object.entries(stats.orders_by_status).map(([name, value]) => ({
      name: t.orders[name] || name,
      rawStatus: name,
      value: Number(value),
    }));
  }, [stats, t]);

  const chartData = useMemo(() => {
    if (!stats?.daily_revenue || stats.daily_revenue.length === 0) {
      return [
        { date: '1', revenue: 0 },
        { date: '2', revenue: 0 },
      ];
    }
    return stats.daily_revenue.map((d) => ({
      date: new Date(d.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
      }),
      revenue: Number(d.revenue) || 0,
    }));
  }, [stats, language]);

  return (
    <div className="space-y-6">
      {/* Top Header & Range Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t.overview.title}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {language === 'ar' ? 'متابعة المبيعات والطلبات والمخزون' : 'Monitor sales, orders and stock status'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm">
          <button
            onClick={() => setRange('today')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              range === 'today'
                ? 'bg-brand text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            {t.overview.today}
          </button>
          <button
            onClick={() => setRange('7d')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              range === '7d'
                ? 'bg-brand text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            {t.overview.last7}
          </button>
          <button
            onClick={() => setRange('30d')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              range === '30d'
                ? 'bg-brand text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            {t.overview.last30}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label={t.overview.revenue}
          value={`${(stats?.revenue || 0).toLocaleString()} ${t.common.egp}`}
          icon={FiDollarSign}
          color="brand"
          loading={loading}
        />
        <StatCard
          label={t.overview.orders}
          value={stats?.orders_count || 0}
          icon={FiShoppingBag}
          color="blue"
          loading={loading}
        />
        <StatCard
          label={t.overview.avgOrder}
          value={`${(stats?.avg_order_value || 0).toLocaleString()} ${t.common.egp}`}
          icon={FiTrendingUp}
          color="green"
          loading={loading}
        />
        <StatCard
          label={t.overview.newOrders}
          value={stats?.new_orders || 0}
          icon={FiClock}
          color="amber"
          loading={loading}
        />
        <StatCard
          label={t.overview.lowStock}
          value={lowStockCount}
          icon={FiAlertCircle}
          color={lowStockCount > 0 ? 'red' : 'gray'}
          loading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Line Chart */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              {t.overview.revenueChart}
            </h2>
          </div>
          <div className="h-72 w-full">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      borderColor: '#374151',
                      borderRadius: '0.75rem',
                      color: '#fff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7fb069"
                    strokeWidth={3}
                    dot={{ fill: '#7fb069', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                {t.common.empty}
              </div>
            )}
          </div>
        </Card>

        {/* Orders by Status Donut */}
        <Card className="flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              {t.overview.ordersByStatus}
            </h2>
          </div>
          <div className="h-72 w-full">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={`cell-${entry.rawStatus}`}
                        fill={STATUS_COLORS[entry.rawStatus] || '#9ca3af'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                {t.common.empty}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Tables Row: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              {t.overview.recentOrders}
            </h2>
            <Link
              to="/admin/orders"
              className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              {t.common.search} <FiArrowUpRight />
            </Link>
          </div>

          {loading ? (
            <Skeleton lines={5} />
          ) : recentOrders.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-400">{t.common.empty}</div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="font-medium text-sm text-neutral-900 hover:text-brand dark:text-white"
                    >
                      LTH-{String(order.order_number).padStart(6, '0')}
                    </Link>
                    <p className="text-xs text-neutral-500">{order.customer_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {Number(order.total).toLocaleString()} {t.common.egp}
                    </span>
                    <StatusPill status={order.status} label={t.orders[order.status]} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top Products */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              {t.overview.topProducts}
            </h2>
            <Link
              to="/admin/products"
              className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              {t.common.search} <FiArrowUpRight />
            </Link>
          </div>

          {loading ? (
            <Skeleton lines={5} />
          ) : !stats?.top_products || stats.top_products.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-400">
              {language === 'ar' ? 'لا توجد بيانات مبيعات كافية حتى الآن' : 'No sales records yet'}
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {stats.top_products.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-xs font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {item.total_sold} {t.common.products}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-brand">
                    {Number(item.revenue).toLocaleString()} {t.common.egp}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}


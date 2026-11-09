/**
 * src/services/orders.js
 * Order creation via Supabase RPC (create_order).
 * Falls back to pure WhatsApp flow if Supabase is not configured.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * Create an order via the create_order RPC.
 *
 * Payload shape:
 * {
 *   customer_name: string,
 *   phone: string,
 *   address?: string,
 *   city?: string,
 *   notes?: string,
 *   language?: 'en' | 'ar',
 *   shipping_fee?: number,
 *   discount?: number,
 *   items: Array<{
 *     product_id: string,   // UUID from Supabase OR legacy slug
 *     size_id?: string,     // e.g. '50ml'
 *     quantity: number,
 *   }>
 * }
 *
 * Returns: { order_id, order_number, total }
 * Throws on validation errors.
 */
export async function createOrder(payload) {
  if (!isSupabaseConfigured) {
    // Static fallback: return a fake order number for WhatsApp-only flow
    const fakeCode = `LTH-${Date.now().toString().slice(-6)}`;
    return {
      order_id: null,
      order_number: fakeCode,
      order_code: fakeCode,
      total: payload.items?.reduce((s, i) => s + (i.unit_price ?? 0) * i.quantity, 0) ?? 0,
    };
  }

  const { data, error } = await supabase.rpc('create_order', { payload });
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch all orders for admin (staff only via RLS).
 */
export async function fetchOrders({ page = 1, perPage = 20, status = null, search = '' } = {}) {
  if (!isSupabaseConfigured) return { data: [], count: 0 };

  let query = supabase
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (status) {
    if (status === 'in_progress') {
      query = query.in('status', ['preparing', 'confirmed', 'shipped']);
    } else {
      query = query.eq('status', status);
    }
  }
  if (search) {
    query = query.or(
      `customer_name.ilike.%${search}%,phone.ilike.%${search}%,order_number::text.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

/**
 * Fetch a single order with full details.
 */
export async function fetchOrder(orderId) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), order_status_history(*)')
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update order status (calls update_order_status RPC or falls back to direct table update).
 * Also records change in order_status_history.
 */
export async function updateOrderStatus(orderId, status, note = null) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const { error } = await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_status: status,
      p_note: note,
    });
    if (!error) return;
  } catch (rpcErr) {
    console.warn('update_order_status RPC notice:', rpcErr);
  }

  // Direct table update with RLS
  const { error: updateErr } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (updateErr) throw updateErr;

  // Record in order_status_history
  try {
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status: status,
      note: note || (status === 'delivered' ? 'Order marked as received' : `Status changed to ${status}`),
    });
  } catch (histErr) {
    console.warn('Failed to insert into order_status_history:', histErr);
  }
}

/**
 * Mark order as received (استقبال الطلب).
 * Updates status to 'delivered', records in order_status_history,
 * and notifies admin team (via Edge function and email hook).
 */
export async function markOrderAsReceived(orderId, orderData = null, note = 'تم استقبال الطلب من لوحة التحكم') {
  await updateOrderStatus(orderId, 'delivered', note);

  const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || 'laithymohamed9@gmail.com';
  const orderRef =
    orderData?.order_code ||
    (orderData?.order_number ? `LTH-${String(orderData.order_number).padStart(6, '0')}` : orderId);

  const payload = {
    order_id: orderId,
    order_number: orderData?.order_number,
    customer_name: orderData?.customer_name,
    phone: orderData?.phone,
    status: 'delivered',
    action: 'received',
    note,
  };

  // 1. Invoke Supabase Edge function if available
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.functions.invoke('notify-order-status', { body: payload });
    } catch (edgeErr) {
      console.warn('Edge function notify-order-status notice:', edgeErr);
    }
  }

  // 2. Direct email notification hook to admin Gmail
  try {
    await fetch(`https://formsubmit.co/ajax/${adminEmail}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `✅ تم استقبال الطلب ${orderRef} (${orderData?.customer_name || 'عميل'})`,
        _template: 'box',
        'رقم الطلب': orderRef,
        'اسم العميل': orderData?.customer_name || 'غير محدد',
        'رقم الهاتف': orderData?.phone || 'غير محدد',
        'الحالة': 'مستلم / مكتمل (Received)',
        'ملاحظة': note,
        'تاريخ وتوقيت الاستقبال': new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' }),
      }),
    });
  } catch (emailErr) {
    console.warn('Email notify notice:', emailErr);
  }

  return { success: true };
}

/**
 * Subscribe to realtime new orders (admin only).
 * Returns an unsubscribe function.
 */
export function subscribeToOrders(callback) {
  if (!isSupabaseConfigured || !supabase) return () => {};

  const channel = supabase
    .channel('orders-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, callback)
    .subscribe();

  return () => supabase.removeChannel(channel);
}


/**
 * Fetch last order customer details by phone number (for auto-filling checkout).
 */
export async function fetchLastOrderByPhone(phone) {
  if (!isSupabaseConfigured || !phone) return null;
  const cleanPhone = phone.trim();
  if (!cleanPhone) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('customer_name, phone, address, city')
      .eq('phone', cleanPhone)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return {
      name: data.customer_name || '',
      phone: data.phone || cleanPhone,
      address: data.address || '',
      city: data.city || '',
    };
  } catch {
    return null;
  }
}

/**
 * Fetch current authenticated Supabase user profile for auto-filling checkout.
 */
export async function getCurrentCustomerData() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const meta = user.user_metadata || {};
    return {
      name: meta.full_name || meta.name || '',
      phone: meta.phone || user.phone || '',
      address: meta.address || '',
      city: meta.city || '',
    };
  } catch {
    return null;
  }
}

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

  if (status) query = query.eq('status', status);
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
 * Update order status (calls update_order_status RPC).
 */
export async function updateOrderStatus(orderId, status, note = null) {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase.rpc('update_order_status', {
    p_order_id: orderId,
    p_status: status,
    p_note: note,
  });
  if (error) throw error;
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


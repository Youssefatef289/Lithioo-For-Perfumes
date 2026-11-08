/**
 * src/services/orderNotification.js
 * 
 * Dispatches an order reception notification email to the admin Gmail (laithymohamed9@gmail.com)
 * when a customer submits an order, detailing the customer, ordered items, and order number.
 */

import { EMAIL } from '../data/contact';
import { formatEGP } from '../utils/price';

/**
 * Sends an email notification to the store administrator on Gmail.
 * Uses Formsubmit AJAX endpoint to deliver directly to the configured email without requiring an external server.
 * 
 * @param {Object} params
 * @param {Object} params.order - The created order object ({ order_number, order_code, id, total })
 * @param {Object} params.customer - { name, phone, address, city, notes }
 * @param {Array}  params.items - Array of items in the order
 * @returns {Promise<{ ok: boolean, message?: string }>}
 */
export async function sendOrderNotificationEmail({ order, customer, items = [] }) {
  const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || EMAIL || 'laithymohamed9@gmail.com';
  const orderNum = order?.order_number || order?.order_code || `LTH-${Date.now().toString().slice(-6)}`;
  const totalAmount = order?.total || items.reduce((sum, item) => sum + (item.price || item.unit_price || 0) * (item.quantity || 1), 0);

  const itemsListText = items.map((item, idx) => {
    const name = item.nameEn || item.name || item.nameAr || 'Perfume';
    const size = item.sizeLabel || item.size || '';
    const qty = item.quantity || 1;
    const price = formatEGP((item.price || item.unit_price || 0) * qty);
    return `${idx + 1}. ${name} ${size ? `(${size})` : ''} × ${qty} = ${price}`;
  }).join('\n');

  const adminDashboardUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/admin/orders`
    : 'https://lithioo-for-perfumes.vercel.app/admin/orders';

  const payload = {
    _subject: `🔔 يوجد أوردر جديد من ${customer.name || 'عميل'} (طلب رقم #${orderNum}) - ليثيو للعطور`,
    _template: 'box',
    _captcha: 'false',
    _replyto: customer.phone ? `${customer.phone}@whatsapp.lithioo` : adminEmail,
    'رقم الطلب': `LTH-${String(orderNum).padStart(6, '0')}`,
    'اسم العميل': customer.name || 'غير محدد',
    'رقم الهاتف / واتساب': customer.phone || 'غير محدد',
    'المدينة / المحافظة': customer.city || 'غير محدد',
    'العنوان بالتفصيل': customer.address || 'غير محدد',
    'ملاحظات العميل': customer.notes || 'لا توجد ملاحظات',
    'إجمالي الطلب': formatEGP(totalAmount),
    'المنتجات المطلوبة': itemsListText,
    'رابط لوحة التحكم': adminDashboardUrl,
    'تاريخ وتوقيت الطلب': new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' }),
  };

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${adminEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return { ok: true };
    }
    return { ok: false, message: 'Server returned error' };
  } catch (err) {
    // Fail silently in frontend so user experience is never blocked
    console.warn('Order notification notice:', err?.message);
    return { ok: false, message: err?.message };
  }
}

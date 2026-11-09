// supabase/functions/notify-order-status/index.ts
// Edge Function: Notifies admin team when an order status changes (e.g. "Mark as received" / استقبال)
// Provider configurable through environment variables:
// - NOTIFICATION_WEBHOOK_URL
// - ADMIN_NOTIFICATION_EMAIL
// - WHATSAPP_API_URL / WHATSAPP_API_TOKEN

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const {
      order_id,
      order_number,
      customer_name,
      phone,
      status,
      note,
      action = 'status_update',
    } = payload;

    const webhookUrl = Deno.env.get('NOTIFICATION_WEBHOOK_URL');
    const adminEmail = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'laithymohamed9@gmail.com';
    const whatsappApiUrl = Deno.env.get('WHATSAPP_API_URL');
    const whatsappToken = Deno.env.get('WHATSAPP_API_TOKEN');

    const orderRef = order_number ? `LTH-${String(order_number).padStart(6, '0')}` : order_id;
    const message = action === 'received'
      ? `✅ تم استقبال الطلب ${orderRef} للعميل ${customer_name || ''} بنجاح.`
      : `🔄 تم تحديث حالة الطلب ${orderRef} إلى "${status}". ${note ? `(ملاحظة: ${note})` : ''}`;

    const dispatched = [];

    // 1. Generic Webhook dispatch if configured
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'order_status_changed',
            orderRef,
            status,
            message,
            payload,
            timestamp: new Date().toISOString(),
          }),
        });
        dispatched.push('webhook');
      } catch (e) {
        console.error('Webhook dispatch error:', e);
      }
    }

    // 2. WhatsApp dispatch if configured
    if (whatsappApiUrl && whatsappToken) {
      try {
        await fetch(whatsappApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${whatsappToken}`,
          },
          body: JSON.stringify({
            to: phone,
            message,
          }),
        });
        dispatched.push('whatsapp');
      } catch (e) {
        console.error('WhatsApp dispatch error:', e);
      }
    }

    // 3. Email dispatch via Formsubmit fallback
    if (adminEmail) {
      try {
        await fetch(`https://formsubmit.co/ajax/${adminEmail}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            _subject: `📦 تحديث حالة طلب: ${orderRef} [${status}]`,
            _template: 'box',
            'رقم الطلب': orderRef,
            'العميل': customer_name || 'غير محدد',
            'الهاتف': phone || 'غير محدد',
            'الحالة الجديدة': status,
            'ملاحظة المشرف': note || 'لا توجد ملاحظة',
            'التوقيت': new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' }),
          }),
        });
        dispatched.push('email');
      } catch (e) {
        console.error('Email dispatch error:', e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderRef,
        status,
        dispatched,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiCheckCircle,
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiPhone,
  FiMapPin,
  FiUser,
  FiFileText,
  FiArrowRight,
  FiArrowLeft,
  FiLoader,
  FiCopy,
  FiCheck,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { createOrder, getCurrentCustomerData, fetchLastOrderByPhone } from '../services/orders';
import { sendOrderNotificationEmail } from '../services/orderNotification';
import { formatEGP, parsePrice } from '../utils/price';
import { localizeProduct } from '../utils/localizeProduct';
import { openWhatsApp } from '../utils/whatsapp';

const EGYPT_GOVERNORATES = [
  { ar: 'القاهرة', en: 'Cairo' },
  { ar: 'الجيزة', en: 'Giza' },
  { ar: 'الإسكندرية', en: 'Alexandria' },
  { ar: 'بني سويف', en: 'Beni Suef' },
  { ar: 'القليوبية', en: 'Qalyubia' },
  { ar: 'الشرقية', en: 'Sharqia' },
  { ar: 'الغربية', en: 'Gharbia' },
  { ar: 'المنوفية', en: 'Monufia' },
  { ar: 'الدقهلية', en: 'Dakahlia' },
  { ar: 'كفر الشيخ', en: 'Kafr El Sheikh' },
  { ar: 'البحيرة', en: 'Beheira' },
  { ar: 'دمياط', en: 'Damietta' },
  { ar: 'بورسعيد', en: 'Port Said' },
  { ar: 'الإسماعيلية', en: 'Ismailia' },
  { ar: 'السويس', en: 'Suez' },
  { ar: 'الفيوم', en: 'Fayoum' },
  { ar: 'المنيا', en: 'Minya' },
  { ar: 'أسيوط', en: 'Asyut' },
  { ar: 'سوهاج', en: 'Sohag' },
  { ar: 'قنا', en: 'Qena' },
  { ar: 'الأقصر', en: 'Luxor' },
  { ar: 'أسوان', en: 'Aswan' },
  { ar: 'البحر الأحمر', en: 'Red Sea' },
  { ar: 'مطروح', en: 'Matrouh' },
  { ar: 'الوادي الجديد', en: 'New Valley' },
  { ar: 'شمال سيناء', en: 'North Sinai' },
  { ar: 'جنوب سيناء', en: 'South Sinai' },
];

export default function OrderCheckoutPage() {
  const { cartItems, clearCart, removeItemsFromCart } = useCart();
  const { language, isRtl } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Selected items from cart or location state (if specified), otherwise all cart items
  const itemsToOrder = location.state?.items || cartItems;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: 'القاهرة',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [successOrder, setSuccessOrder] = useState(location.state?.order || null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [successOrder]);

  // Auto-fill from saved profile if available
  useEffect(() => {
    let isMounted = true;
    async function loadSavedData() {
      if (successOrder) return;
      setLoadingProfile(true);
      try {
        const profile = await getCurrentCustomerData();
        if (profile && isMounted) {
          setFormData((prev) => ({
            ...prev,
            name: prev.name || profile.name || '',
            phone: prev.phone || profile.phone || '',
            address: prev.address || profile.address || '',
            city: prev.city || profile.city || 'القاهرة',
          }));
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    }
    loadSavedData();
    return () => {
      isMounted = false;
    };
  }, [successOrder]);

  const handlePhoneBlur = async () => {
    const rawPhone = formData.phone.trim();
    if (rawPhone.length < 9) return;
    try {
      const prev = await fetchLastOrderByPhone(rawPhone);
      if (prev) {
        setFormData((curr) => ({
          ...curr,
          name: curr.name || prev.name || '',
          address: curr.address || prev.address || '',
          city: curr.city || prev.city || curr.city,
        }));
      }
    } catch {
      // Ignore
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const totalPrice = itemsToOrder.reduce(
    (sum, item) => sum + parsePrice(item.price) * (item.quantity || 1),
    0
  );

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = isRtl ? 'يرجى إدخال اسمك بالكامل' : 'Please enter your full name';
    }
    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = isRtl ? 'يرجى إدخال رقم هاتف صحيح (11 رقم)' : 'Please enter a valid phone number';
    }
    if (!formData.address.trim() || formData.address.trim().length < 5) {
      errs.address = isRtl ? 'يرجى كتابة العنوان بالتفصيل (اسم الشارع، رقم العقار)' : 'Please enter your detailed delivery address';
    }
    if (!formData.city.trim()) {
      errs.city = isRtl ? 'يرجى اختيار المحافظة / المدينة' : 'Please select your city / governorate';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (itemsToOrder.length === 0) return;
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const payload = {
        customer_name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        notes: formData.notes.trim() || null,
        language: isRtl ? 'ar' : 'en',
        shipping_fee: 0,
        discount: 0,
        items: itemsToOrder.map((item) => ({
          product_id: item.id,
          size_id: item.size || null,
          quantity: item.quantity || 1,
          unit_price: parsePrice(item.price),
        })),
      };

      // 1. Save order to Supabase Database
      const result = await createOrder(payload);

      // 2. Dispatch email notification to admin Gmail (laithymohamed9@gmail.com)
      await sendOrderNotificationEmail({
        order: result,
        customer: formData,
        items: itemsToOrder,
      });

      // 3. Clear cart items that were ordered
      const orderedKeys = itemsToOrder.map((item) => item.cartKey).filter(Boolean);
      if (orderedKeys.length > 0 && removeItemsFromCart) {
        removeItemsFromCart(orderedKeys);
      } else {
        clearCart();
      }

      setSuccessOrder(result);
    } catch (err) {
      console.error('Submit order error:', err);
      setErrors({
        form:
          err?.message ||
          (isRtl
            ? 'عذراً، حدث خطأ أثناء استقبال الطلب. يرجى المحاولة مرة أخرى أو التواصل عبر واتساب.'
            : 'Failed to place order. Please try again or contact us via WhatsApp.'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppConfirmation = () => {
    if (!successOrder) return;
    const orderNum = successOrder.order_number || successOrder.order_code || 'LTH';
    const lines = [
      isRtl ? 'مرحباً ليثيو للعطور! تم إتمام طلبي عبر الموقع:' : 'Hello Lithioo Perfumes! I placed an order on the website:',
      `✨ ${isRtl ? 'رقم الطلب' : 'Order ID'}: LTH-${String(orderNum).padStart(6, '0')}`,
      `👤 ${isRtl ? 'العميل' : 'Customer'}: ${formData.name}`,
      `📞 ${isRtl ? 'الهاتف' : 'Phone'}: ${formData.phone}`,
      `📍 ${isRtl ? 'العنوان' : 'Address'}: ${formData.address} - ${formData.city}`,
      isRtl ? '📦 المنتجات المطلوبة:' : 'Ordered Items:',
      ...itemsToOrder.map((item) => {
        const dp = localizeProduct(item, language);
        return `• ${dp.name} ${item.sizeLabel ? `(${item.sizeLabel})` : ''} × ${item.quantity} = ${formatEGP(parsePrice(item.price) * item.quantity)}`;
      }),
      `💰 ${isRtl ? 'الإجمالي' : 'Total'}: ${formatEGP(totalPrice)} (${isRtl ? 'شحن مجاني والدفع عند الاستلام' : 'Free Shipping & COD'})`,
      isRtl ? 'يرجى تأكيد الاستقبال وموعد التسليم. شكراً لكم!' : 'Please confirm reception and delivery schedule. Thank you!',
    ];
    openWhatsApp(lines.join('\n'));
  };

  const handleCopyOrderNumber = (num) => {
    navigator.clipboard?.writeText(String(num));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ArrowIcon = isRtl ? FiArrowLeft : FiArrowRight;

  return (
    <main
      className="page-main min-h-screen bg-neutral-50 px-4 py-12 pt-24 dark:bg-neutral-950 sm:px-6 sm:pt-28 md:pt-32 lg:px-8"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <Link to="/" className="transition hover:text-brand">
            {isRtl ? 'الرئيسية' : 'Home'}
          </Link>
          <span>/</span>
          <Link to="/cart" className="transition hover:text-brand">
            {isRtl ? 'سلة التسوق' : 'Cart'}
          </Link>
          <span>/</span>
          <span className="font-semibold text-neutral-900 dark:text-white">
            {successOrder
              ? isRtl ? 'تم استقبال الطلب' : 'Order Received'
              : isRtl ? 'صفحة الأوردر والاستقبال' : 'Order & Reception'}
          </span>
        </nav>

        {successOrder ? (
          /* =========================================================
             2. صفحة الاستقبال (Order Reception Screen)
             ========================================================= */
          <div className="mx-auto max-w-3xl overflow-hidden border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            {/* Header Banner */}
            <div className="border-b border-emerald-100 bg-emerald-50/70 p-6 text-center dark:border-emerald-900/40 dark:bg-emerald-950/30 sm:p-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                <FiCheckCircle className="h-10 w-10" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                {isRtl ? 'تم استقبال طلبك بنجاح!' : 'Your Order Has Been Received!'}
              </h1>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                {isRtl
                  ? 'شكراً لثقتك في ليثيو للعطور. تم تسجيل طلبك وحفظه في لوحة التحكم، وتم إرسال إشعار فوري إلى الإدارة لمباشرة التجهيز.'
                  : 'Thank you for choosing Lithioo Perfumes. Your order is logged in the admin panel and an instant email notification was sent.'}
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Order Number Box */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-brand/30 bg-brand/5 p-4 sm:p-5">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    {isRtl ? 'رقم الطلب المعتمد' : 'Order Reference Number'}
                  </span>
                  <div className="mt-1 font-mono text-2xl font-black text-brand tracking-wider">
                    LTH-{String(successOrder.order_number || successOrder.order_code || '000000').padStart(6, '0')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyOrderNumber(
                      `LTH-${String(successOrder.order_number || successOrder.order_code || '000000').padStart(6, '0')}`
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {copied ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                  <span>{copied ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ الرقم' : 'Copy Number')}</span>
                </button>
              </div>

              {/* Reception Details Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-950/50">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
                    <FiUser className="text-brand" />
                    <span>{isRtl ? 'بيانات المستلم' : 'Recipient Details'}</span>
                  </h3>
                  <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                    <p><strong className="text-neutral-800 dark:text-neutral-200">{isRtl ? 'الاسم:' : 'Name:'}</strong> {formData.name}</p>
                    <p><strong className="text-neutral-800 dark:text-neutral-200">{isRtl ? 'الهاتف:' : 'Phone:'}</strong> {formData.phone}</p>
                    <p><strong className="text-neutral-800 dark:text-neutral-200">{isRtl ? 'طريقة الدفع:' : 'Payment:'}</strong> {isRtl ? 'الدفع عند الاستلام (معاينة قبل الاستلام)' : 'Cash on Delivery (Inspection on delivery)'}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-950/50">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
                    <FiMapPin className="text-brand" />
                    <span>{isRtl ? 'عنوان التوصيل' : 'Delivery Address'}</span>
                  </h3>
                  <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                    <p><strong className="text-neutral-800 dark:text-neutral-200">{isRtl ? 'المحافظة:' : 'City:'}</strong> {formData.city}</p>
                    <p><strong className="text-neutral-800 dark:text-neutral-200">{isRtl ? 'العنوان:' : 'Address:'}</strong> {formData.address}</p>
                    {formData.notes && (
                      <p><strong className="text-neutral-800 dark:text-neutral-200">{isRtl ? 'ملاحظات:' : 'Notes:'}</strong> {formData.notes}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="border border-neutral-200 rounded-xl overflow-hidden dark:border-neutral-800">
                <div className="bg-neutral-100 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {isRtl ? 'المنتجات المستقبلة في هذا الطلب' : 'Received Order Items'}
                </div>
                <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {itemsToOrder.map((item, idx) => {
                    const loc = localizeProduct(item, language);
                    return (
                      <div key={item.cartKey || idx} className="flex items-center justify-between p-4 text-sm">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={loc.name}
                              className="h-12 w-12 object-contain rounded border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-neutral-900 dark:text-white">{loc.name}</p>
                            <p className="text-xs text-neutral-500">
                              {item.sizeLabel ? `${item.sizeLabel} • ` : ''}
                              {isRtl ? 'الكمية:' : 'Qty:'} {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {formatEGP(parsePrice(item.price) * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-neutral-50 p-4 border-t border-neutral-200 dark:bg-neutral-950/40 dark:border-neutral-800 flex justify-between items-center text-base font-bold">
                  <span className="text-neutral-900 dark:text-white">{isRtl ? 'المجموع الإجمالي:' : 'Grand Total:'}</span>
                  <span className="text-brand text-xl">{formatEGP(totalPrice)}</span>
                </div>
              </div>

              {/* Status Note Banner */}
              <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
                <FiTruck className="h-5 w-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-bold">{isRtl ? 'طلبك قيد المتابعة والتجهيز الآن' : 'Your order is currently being processed'}</p>
                  <p className="mt-0.5">
                    {isRtl
                      ? 'تم تسجيل الأوردر بنجاح في لوحة التحكم وتنبيه الإدارة عبر البريد الإلكتروني. سيتواصل معك فريق خدمة العملاء قريباً لتأكيد الموعد.'
                      : 'The order is registered in the admin dashboard and emailed to management. Our team will contact you shortly.'}
                  </p>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleWhatsAppConfirmation}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 px-6 font-bold text-white transition hover:bg-[#20bd5a] shadow-lg shadow-emerald-500/10"
                >
                  <FaWhatsapp className="h-5 w-5" />
                  <span>{isRtl ? 'تأكيد ومتابعة عبر واتساب' : 'Confirm via WhatsApp'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white py-3.5 px-6 font-semibold text-neutral-800 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
                >
                  <span>{isRtl ? 'متابعة التسوق واستكشاف العطور' : 'Continue Shopping'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : itemsToOrder.length === 0 ? (
          /* Empty Cart State */
          <div className="mx-auto max-w-md border border-neutral-200 bg-white p-8 text-center shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
            <FiShoppingBag className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              {isRtl ? 'لا توجد منتجات محددة للطلب' : 'No Items Selected for Order'}
            </h2>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              {isRtl
                ? 'سلة التسوق فارغة أو لم يتم اختيار منتجات. تفضل بتصفح عطورنا الفاخرة واختر ما يناسبك.'
                : 'Your cart is empty. Explore our luxury perfume collection.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="mt-6 inline-flex items-center gap-2 bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              <span>{isRtl ? 'استعراض المنتجات' : 'Browse Products'}</span>
              <ArrowIcon />
            </button>
          </div>
        ) : (
          /* =========================================================
             1. صفحة الأوردر (Order Checkout Form)
             ========================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column (Left/Primary) */}
            <div className="lg:col-span-7">
              <div className="border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
                <div className="mb-6 border-b border-neutral-100 pb-4 dark:border-neutral-800">
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
                    {isRtl ? 'صفحة إتمام واستقبال الطلب' : 'Complete & Receive Order'}
                  </h1>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {isRtl
                      ? 'أدخل بياناتك للتوصيل ليتم تسجيل الأوردر فوراً في لوحة التحكم وإرسال إشعار للإدارة.'
                      : 'Fill in your delivery details to register the order in the admin dashboard and notify management.'}
                  </p>
                </div>

                {loadingProfile && (
                  <div className="mb-4 flex items-center gap-2 text-xs text-brand">
                    <FiLoader className="h-4 w-4 animate-spin" />
                    <span>{isRtl ? 'جاري استرجاع بياناتك السابقة...' : 'Loading previous customer data...'}</span>
                  </div>
                )}

                {errors.form && (
                  <div className="mb-6 rounded-none border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                    {errors.form}
                  </div>
                )}

                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      {isRtl ? 'الاسم بالكامل *' : 'Full Name *'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={isRtl ? 'مثال: محمد الليثي' : 'e.g. Mohamed Lithioo'}
                        className="w-full rounded-none border border-neutral-300 bg-transparent px-3 py-2.5 ps-9 text-sm text-neutral-900 outline-none transition focus:border-brand dark:border-neutral-700 dark:text-white"
                        required
                        disabled={submitting}
                      />
                      <FiUser className="absolute start-3 top-3 text-neutral-400" size={16} />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>

                  {/* Phone & WhatsApp */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      {isRtl ? 'رقم الهاتف / واتساب للتأكيد *' : 'Phone / WhatsApp Number *'}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handlePhoneBlur}
                        placeholder="01012345678"
                        dir="ltr"
                        className="w-full rounded-none border border-neutral-300 bg-transparent px-3 py-2.5 ps-9 text-sm text-neutral-900 outline-none transition focus:border-brand dark:border-neutral-700 dark:text-white text-start"
                        required
                        disabled={submitting}
                      />
                      <FiPhone className="absolute start-3 top-3 text-neutral-400" size={16} />
                    </div>
                    <p className="mt-0.5 text-[11px] text-neutral-400">
                      {isRtl
                        ? 'سيتم إرسال تأكيد الأوردر وموعد وصول المندوب على هذا الرقم'
                        : 'Delivery confirmation and tracking will be sent to this number'}
                    </p>
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                  </div>

                  {/* Governorate / City Dropdown */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      {isRtl ? 'المحافظة / المدينة *' : 'Governorate / City *'}
                    </label>
                    <div className="relative">
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full rounded-none border border-neutral-300 bg-white px-3 py-2.5 ps-9 text-sm text-neutral-900 outline-none transition focus:border-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                        required
                        disabled={submitting}
                      >
                        {EGYPT_GOVERNORATES.map((gov) => (
                          <option key={gov.en} value={isRtl ? gov.ar : gov.en}>
                            {isRtl ? gov.ar : gov.en}
                          </option>
                        ))}
                      </select>
                      <FiMapPin className="absolute start-3 top-3 text-neutral-400" size={16} />
                    </div>
                    {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                  </div>

                  {/* Detailed Address */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      {isRtl ? 'العنوان بالتفصيل *' : 'Detailed Address *'}
                    </label>
                    <textarea
                      name="address"
                      rows={2}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder={isRtl ? 'اسم الشارع، رقم العمارة، الشقة، علامة مميزة...' : 'Street name, building number, apartment, landmark...'}
                      className="w-full rounded-none border border-neutral-300 bg-transparent px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand dark:border-neutral-700 dark:text-white"
                      required
                      disabled={submitting}
                    />
                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      {isRtl ? 'ملاحظات إضافية أو تعليمات التوصيل (اختياري)' : 'Special Delivery Notes (Optional)'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder={isRtl ? 'مثال: التوصيل بعد الساعة 4 عصراً، أو تغليف كهدية...' : 'e.g. Deliver after 4 PM, gift packaging...'}
                        className="w-full rounded-none border border-neutral-300 bg-transparent px-3 py-2.5 ps-9 text-sm text-neutral-900 outline-none transition focus:border-brand dark:border-neutral-700 dark:text-white"
                        disabled={submitting}
                      />
                      <FiFileText className="absolute start-3 top-3 text-neutral-400" size={16} />
                    </div>
                  </div>

                  {/* Payment Info Callout */}
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-300">
                    <p className="font-bold flex items-center gap-2">
                      <FiShield className="text-brand" />
                      <span>{isRtl ? 'طريقة الدفع: الدفع نقدياً عند الاستلام' : 'Payment Method: Cash On Delivery'}</span>
                    </p>
                    <p className="mt-1 text-neutral-500">
                      {isRtl
                        ? 'يحق لك معاينة العطور وفحص التغليف والعلبة قبل السداد للمندوب.'
                        : 'You are welcome to inspect your package before handing payment to courier.'}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 rounded-none bg-brand py-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-brand-dark shadow-md disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <FiLoader className="h-4 w-4 animate-spin" />
                          <span>{isRtl ? 'جاري استقبال وحفظ الطلب...' : 'Processing & Receiving Order...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{isRtl ? 'تأكيد واستقبال الطلب الآن' : 'Confirm & Receive Order Now'}</span>
                          <ArrowIcon />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Summary Column (Right) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-7">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                    {isRtl ? 'ملخص المنتجات' : 'Order Summary'}
                  </h2>
                  <span className="text-xs text-neutral-500">
                    {itemsToOrder.length} {isRtl ? 'منتج' : 'item(s)'}
                  </span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-neutral-100 py-2 dark:divide-neutral-800 max-h-72 overflow-y-auto">
                  {itemsToOrder.map((item, idx) => {
                    const loc = localizeProduct(item, language);
                    return (
                      <div key={item.cartKey || idx} className="flex items-center justify-between py-3 text-xs">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={loc.name}
                              className="h-12 w-12 object-contain rounded border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-neutral-900 dark:text-white">{loc.name}</p>
                            <p className="text-[11px] text-neutral-500">
                              {item.sizeLabel ? `${item.sizeLabel} • ` : ''}
                              {isRtl ? 'الكمية:' : 'Qty:'} {item.quantity || 1}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {formatEGP(parsePrice(item.price) * (item.quantity || 1))}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-2 border-t border-neutral-100 pt-4 text-xs dark:border-neutral-800">
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>{isRtl ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                    <span className="font-semibold">{formatEGP(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>{isRtl ? 'مصاريف الشحن والتوصيل:' : 'Shipping:'}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {isRtl ? 'مجاني لجميع المحافظات' : 'Free Shipping'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-bold text-neutral-900 dark:border-neutral-700 dark:text-white">
                    <span>{isRtl ? 'الإجمالي النهائي:' : 'Grand Total:'}</span>
                    <span className="text-brand text-lg">{formatEGP(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3 dark:border-neutral-800 dark:bg-neutral-900 text-xs">
                <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                  <FiShield className="h-4 w-4 text-brand shrink-0" />
                  <span>{isRtl ? 'عطور أصلية 100% مع ضمان الجودة' : '100% Authentic Luxury Fragrances'}</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                  <FiTruck className="h-4 w-4 text-brand shrink-0" />
                  <span>{isRtl ? 'توصيل سريع لجميع محافظات جمهورية مصر العربية' : 'Fast Delivery to all Governorates'}</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                  <FiCheckCircle className="h-4 w-4 text-brand shrink-0" />
                  <span>{isRtl ? 'تسجيل فوري في لوحة التحكم وتنبيه الإدارة عبر البريد' : 'Instant logging in dashboard with email alert'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

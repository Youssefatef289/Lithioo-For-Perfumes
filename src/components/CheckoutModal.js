import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { createOrder, getCurrentCustomerData, fetchLastOrderByPhone } from '../services/orders';
import { formatEGP, parsePrice } from '../utils/price';
import { localizeProduct } from '../utils/localizeProduct';
import { openWhatsApp } from '../utils/whatsapp';

const CheckoutModal = ({
  isOpen,
  onClose,
  selectedItems = [],
  totalPrice = 0,
  onOrderSuccess,
}) => {
  const { language, isRtl } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  // Auto-fill from Supabase Auth user on open
  useEffect(() => {
    if (!isOpen) {
      setSuccessOrder(null);
      setErrors({});
      return;
    }

    let isMounted = true;
    async function loadUser() {
      setLoadingProfile(true);
      try {
        const profile = await getCurrentCustomerData();
        if (profile && isMounted) {
          setFormData((prev) => ({
            ...prev,
            name: prev.name || profile.name || '',
            phone: prev.phone || profile.phone || '',
            address: prev.address || profile.address || '',
            city: prev.city || profile.city || '',
          }));
        }
      } catch {
        // Ignore fallback
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle phone blur to auto-fill previous order details
  const handlePhoneBlur = async () => {
    const rawPhone = formData.phone.trim();
    if (rawPhone.length < 8) return;

    try {
      const prevOrder = await fetchLastOrderByPhone(rawPhone);
      if (prevOrder) {
        setFormData((prev) => ({
          ...prev,
          name: prev.name || prevOrder.name || '',
          address: prev.address || prevOrder.address || '',
          city: prev.city || prevOrder.city || '',
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

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = isRtl ? 'يرجى كتابة الاسم بالكامل' : 'Please enter your full name';
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      errs.phone = isRtl ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number';
    }
    if (!formData.address.trim() || formData.address.trim().length < 3) {
      errs.address = isRtl ? 'يرجى كتابة العنوان بالتفصيل' : 'Please enter your address';
    }
    if (!formData.city.trim() || formData.city.trim().length < 2) {
      errs.city = isRtl ? 'يرجى إدخال المدينة' : 'Please enter your city';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        items: selectedItems.map((item) => ({
          product_id: item.id,
          size_id: item.size || null,
          quantity: item.quantity,
          unit_price: parsePrice(item.price),
        })),
      };

      const result = await createOrder(payload);
      setSuccessOrder(result);

      if (onOrderSuccess) {
        onOrderSuccess(result, selectedItems.map((item) => item.cartKey));
      }
    } catch (err) {
      setErrors({ form: err?.message || (isRtl ? 'حدث خطأ أثناء حفظ الطلب' : 'Failed to create order') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppNotify = () => {
    if (!successOrder) return;
    const orderNum = successOrder.order_number || successOrder.order_code || 'LTH';
    const lines = [
      isRtl ? 'مرحباً ليثيو للعطور! لقد قمت بإتمام طلبي بنجاح:' : 'Hello Lithioo Perfumes! I placed an order:',
      `${isRtl ? 'رقم الطلب' : 'Order ID'}: ${orderNum}`,
      `${isRtl ? 'العميل' : 'Customer'}: ${formData.name}`,
      `${isRtl ? 'الهاتف' : 'Phone'}: ${formData.phone}`,
      `${isRtl ? 'العنوان' : 'Address'}: ${formData.address}, ${formData.city}`,
      isRtl ? 'المنتجات المطلوبة:' : 'Ordered Items:',
      ...selectedItems.map((item) => {
        const dp = localizeProduct(item, language);
        return `- ${dp.name} ${item.sizeLabel ? `(${item.sizeLabel})` : ''} x${item.quantity} = ${formatEGP(parsePrice(item.price) * item.quantity)}`;
      }),
      `${isRtl ? 'الإجمالي' : 'Total'}: ${formatEGP(totalPrice)}`,
    ];
    openWhatsApp(lines.join('\n'));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-lg rounded-none border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 flex h-9 w-9 items-center justify-center rounded-none text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
          aria-label={isRtl ? 'إغلاق' : 'Close'}
        >
          <FiX className="h-5 w-5" />
        </button>

        {successOrder ? (
          /* Success Screen */
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-none bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <FiCheckCircle className="h-9 w-9" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {isRtl ? 'تم إتمام الطلب بنجاح!' : 'Order Placed Successfully!'}
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              {isRtl
                ? `شكراً لطلبك من ليثيو للعطور. رقم الطلب الخاص بك هو:`
                : `Thank you for ordering from Lithioo. Your order number is:`}
            </p>
            <div className="my-4 inline-block rounded-none border border-brand/30 bg-brand/10 px-4 py-2 font-mono text-base font-bold text-brand">
              {successOrder.order_number || successOrder.order_code || 'LTH-SUCCESS'}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {isRtl
                ? 'تم تسجيل طلبك وحفظه في النظام. سيتم التواصل معك لتأكيد الشحن.'
                : 'Your order is recorded and saved. We will contact you soon for shipping confirmation.'}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleWhatsAppNotify}
                className="flex w-full items-center justify-center gap-2 rounded-none bg-[#25D366] py-3 text-sm font-semibold text-white transition hover:bg-[#20bd5a]"
              >
                <FaWhatsapp className="h-5 w-5" />
                <span>{isRtl ? 'إرسال تأكيد عبر واتساب' : 'Send Confirmation via WhatsApp'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-outline w-full rounded-none"
              >
                {isRtl ? 'إغلاق ومتابعة التسوق' : 'Close and Continue Shopping'}
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {isRtl ? 'إتمام الطلب' : 'Complete Your Order'}
              </h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {isRtl
                  ? `أنت بصدد طلب ${selectedItems.length} منتج بقيمة إجمالية ${formatEGP(totalPrice)}`
                  : `Ordering ${selectedItems.length} item(s) for a total of ${formatEGP(totalPrice)}`}
              </p>
            </div>

            {loadingProfile && (
              <div className="mb-4 flex items-center gap-2 text-xs text-brand">
                <FiLoader className="h-4 w-4 animate-spin" />
                <span>{isRtl ? 'جاري تحميل بياناتك المسجلة...' : 'Loading saved profile data...'}</span>
              </div>
            )}

            {errors.form && (
              <div className="mb-4 flex items-center gap-2 rounded-none border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                <FiAlertCircle className="h-5 w-5 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  {isRtl ? 'الاسم بالكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={isRtl ? 'مثال: يوسف عاطف' : 'e.g. John Doe'}
                  className="w-full rounded-none border border-neutral-300 bg-transparent px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand dark:border-neutral-700 dark:text-white"
                  required
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  {isRtl ? 'رقم الهاتف *' : 'Phone Number *'}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handlePhoneBlur}
                  placeholder={isRtl ? 'مثال: 01012345678' : 'e.g. +20 10 1234 5678'}
                  className="w-full rounded-none border border-neutral-300 bg-transparent px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand dark:border-neutral-700 dark:text-white"
                  required
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>

              {/* City */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  {isRtl ? 'المدينة / المحافظة *' : 'City / Province *'}
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={isRtl ? 'مثال: القاهرة' : 'e.g. Cairo'}
                  className="w-full rounded-none border border-neutral-300 bg-transparent px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand dark:border-neutral-700 dark:text-white"
                  required
                />
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
                  placeholder={isRtl ? 'اسم الشارع، رقم العمارة، الشقة...' : 'Street name, building, apartment...'}
                  className="w-full rounded-none border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand dark:border-neutral-700 dark:text-white"
                  required
                />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  {isRtl ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={isRtl ? 'أي تعليمات خاصة بالتسليم...' : 'Any special delivery instructions...'}
                  className="w-full rounded-none border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand dark:border-neutral-700 dark:text-white"
                />
              </div>

              {/* Order summary mini bar */}
              <div className="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-700">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  {isRtl ? 'إجمالي المنتجات المحددة:' : 'Selected Total:'}
                </span>
                <span className="text-lg font-bold text-brand">
                  {formatEGP(totalPrice)}
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-none border border-neutral-300 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  disabled={submitting}
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-none bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <FiLoader className="h-4 w-4 animate-spin" />
                      <span>{isRtl ? 'جاري الإرسال...' : 'Submitting...'}</span>
                    </span>
                  ) : (
                    <span>{isRtl ? 'تأكيد وإتمام الطلب' : 'Confirm Order'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;

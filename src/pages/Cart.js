import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiCheckSquare,
  FiSquare,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiUser,
  FiPhone,
  FiMapPin,
  FiFileText,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { formatEGP, parsePrice } from '../utils/price';
import { localizeProduct } from '../utils/localizeProduct';
import { getSizeById } from '../data/sizes';
import { createOrder, getCurrentCustomerData } from '../services/orders';
import { sendOrderNotificationEmail } from '../services/orderNotification';
import { openWhatsApp } from '../utils/whatsapp';

const EGYPT_GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'القليوبية',
  'الشرقية',
  'الغربية',
  'المنوفية',
  'الدقهلية',
  'كفر الشيخ',
  'البحيرة',
  'دمياط',
  'بورسعيد',
  'الإسماعيلية',
  'السويس',
  'بني سويف',
  'الفيوم',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'البحر الأحمر',
  'مطروح',
  'الوادي الجديد',
  'شمال سيناء',
  'جنوب سيناء',
];

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    removeItemsFromCart,
    updateQuantity,
    clearCart,
  } = useCart();
  const { t, language, isRtl } = useLanguage();
  const navigate = useNavigate();
  const { cart, cartPage } = t;

  // Step 1: Cart Items, Step 2: Customer Data & Checkout
  const [step, setStep] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState(
    () => new Set(cartItems.map((i) => i.cartKey))
  );

  // Customer Data Form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: 'القاهرة',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, successOrder]);

  // Load saved customer data if available
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getCurrentCustomerData();
        if (profile) {
          setFormData((prev) => ({
            ...prev,
            name: prev.name || profile.name || '',
            phone: prev.phone || profile.phone || '',
            address: prev.address || profile.address || '',
            city: prev.city || profile.city || 'القاهرة',
          }));
        }
      } catch (e) {
        // Safe fallback
      }
    }
    loadProfile();
  }, []);

  // Sync selected keys with existing cart items
  useEffect(() => {
    setSelectedKeys((prev) => {
      const existing = new Set(cartItems.map((i) => i.cartKey));
      const next = new Set([...prev].filter((k) => existing.has(k)));
      if (prev.size === 0 && cartItems.length > 0) {
        return new Set(cartItems.map((i) => i.cartKey));
      }
      return next;
    });
  }, [cartItems]);

  const handleQuantityChange = (cartKey, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartKey);
    } else {
      updateQuantity(cartKey, newQuantity);
    }
  };

  const toggleSelectItem = (cartKey) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(cartKey)) next.delete(cartKey);
      else next.add(cartKey);
      return next;
    });
  };

  const allSelected = cartItems.length > 0 && selectedKeys.size === cartItems.length;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(cartItems.map((i) => i.cartKey)));
    }
  };

  // Selected items & total
  const selectedItems = cartItems.filter((item) => selectedKeys.has(item.cartKey));
  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0
  );
  const selectedCount = selectedItems.reduce((n, i) => n + i.quantity, 0);

  // Validate Egyptian phone format (010, 011, 012, 015 followed by 8 digits)
  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errs.name = isRtl ? 'يرجى كتابة الاسم بالكامل' : 'Please enter your full name';
    }
    const cleanPhone = formData.phone.replace(/[\s-+]/g, '');
    const egyptianRegex = /^(01|00201|\+201)[0125][0-9]{8}$/;
    if (!cleanPhone || !egyptianRegex.test(cleanPhone)) {
      errs.phone = isRtl
        ? 'يرجى إدخال رقم هاتف مصري صحيح (11 رقم يبدأ بـ 01)'
        : 'Please enter a valid Egyptian phone number (11 digits starting with 01)';
    }
    if (!formData.address.trim() || formData.address.trim().length < 5) {
      errs.address = isRtl
        ? 'يرجى كتابة العنوان بالتفصيل (اسم الشارع، رقم المبنى)'
        : 'Please enter your detailed address';
    }
    if (!formData.city.trim()) {
      errs.city = isRtl ? 'يرجى اختيار المحافظة / المدينة' : 'Please select your city';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Move to step 2 (Checkout form)
  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      alert(isRtl ? 'يرجى تحديد منتج واحد على الأقل للمتابعة' : 'Please select at least one item');
      return;
    }
    setStep(2);
  };

  // Final submit: Save to Supabase -> Send Email -> Open WhatsApp
  const handleOrderNow = async (e) => {
    e?.preventDefault?.();
    if (!validateForm()) return;
    if (selectedItems.length === 0) return;

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
          quantity: item.quantity || 1,
          unit_price: parsePrice(item.price),
        })),
      };

      // 1. Save order to Supabase orders table
      const result = await createOrder(payload);

      // 2. Dispatch email notification to admin team
      await sendOrderNotificationEmail({
        order: result,
        customer: formData,
        items: selectedItems,
      });

      // 3. Clear ordered items from cart
      const orderedKeys = selectedItems.map((i) => i.cartKey);
      if (removeItemsFromCart) {
        removeItemsFromCart(orderedKeys);
      } else {
        clearCart();
      }

      setSuccessOrder(result);

      // 4. Open WhatsApp with pre-filled order message
      const orderRef = result?.order_code || (result?.order_number ? `LTH-${String(result.order_number).padStart(6, '0')}` : 'LTH');
      const lines = [
        isRtl ? 'مرحباً ليثيو للعطور! تم إتمام طلبي عبر الموقع:' : 'Hello Lithioo Perfumes! I placed an order on the website:',
        `✨ ${isRtl ? 'رقم الطلب' : 'Order ID'}: ${orderRef}`,
        `👤 ${isRtl ? 'العميل' : 'Customer'}: ${formData.name.trim()}`,
        `📞 ${isRtl ? 'الهاتف' : 'Phone'}: ${formData.phone.trim()}`,
        `📍 ${isRtl ? 'العنوان' : 'Address'}: ${formData.address.trim()} - ${formData.city}`,
        formData.notes?.trim() ? `📝 ${isRtl ? 'ملاحظات' : 'Notes'}: ${formData.notes.trim()}` : null,
        isRtl ? '📦 المنتجات المطلوبة:' : 'Ordered Items:',
        ...selectedItems.map((item) => {
          const dp = localizeProduct(item, language);
          const sizeLabel = item.size ? getSizeById(item.size, language).label : item.sizeLabel;
          return `• ${dp.name} ${sizeLabel ? `(${sizeLabel})` : ''} × ${item.quantity} = ${formatEGP(parsePrice(item.price) * item.quantity)}`;
        }),
        `💰 ${isRtl ? 'الإجمالي' : 'Total'}: ${formatEGP(selectedTotal)} (${isRtl ? 'شحن مجاني والدفع عند الاستلام' : 'Free Shipping & COD'})`,
        isRtl ? 'يرجى تأكيد الاستقبال وموعد التسليم. شكراً لكم!' : 'Please confirm order reception and delivery schedule. Thank you!',
      ].filter(Boolean);

      openWhatsApp(lines.join('\n'));
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

  const qtyBtn =
    'flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 text-neutral-700 transition hover:border-brand dark:border-neutral-700 dark:text-neutral-200';

  // ─── EMPTY CART VIEW ───
  if (cartItems.length === 0 && !successOrder) {
    return (
      <main className="page-main min-h-screen w-full bg-white px-4 py-16 pt-24 dark:bg-neutral-950 sm:pt-28">
        <div className="section-inner mx-auto flex max-w-lg flex-col items-center rounded-2xl border-2 border-dashed border-neutral-200 bg-transparent px-6 py-16 text-center dark:border-neutral-800">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-brand">
            <FiShoppingCart className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{cart.empty}</h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{cartPage.emptyHint}</p>
          <button
            type="button"
            className="mt-8 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
            onClick={() => navigate('/products')}
          >
            {cart.continueShopping}
          </button>
        </div>
      </main>
    );
  }

  // ─── SUCCESS VIEW ───
  if (successOrder) {
    const orderRef =
      successOrder.order_code ||
      (successOrder.order_number ? `LTH-${String(successOrder.order_number).padStart(6, '0')}` : 'LTH-DONE');

    return (
      <main className="page-main min-h-screen w-full bg-white px-4 py-16 pt-24 dark:bg-neutral-950 sm:pt-28">
        <div className="mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 text-center shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <FiCheckCircle className="h-9 w-9" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {isRtl ? 'تم استقبال طلبك بنجاح!' : 'Your order has been received!'}
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {isRtl
              ? 'شكراً لتسوقك من ليثيو للعطور. تم حفظ الطلب وسيتم التواصل معك لتأكيد الشحن.'
              : 'Thank you for shopping at Lithioo Perfumes. We will contact you soon.'}
          </p>

          <div className="my-6 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {isRtl ? 'رقم الطلب الخاص بك' : 'Order Reference'}
            </p>
            <p className="mt-1 text-xl font-bold tracking-widest text-brand" dir="ltr">
              {orderRef}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                const lines = [
                  `مرحباً ليثيو للعطور، أستفسر عن طلبي رقم: ${orderRef}`,
                  `الاسم: ${formData.name}`,
                  `الهاتف: ${formData.phone}`,
                ];
                openWhatsApp(lines.join('\n'));
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white transition hover:bg-[#20bd5a]"
            >
              <FaWhatsapp className="h-5 w-5" />
              <span>{isRtl ? 'متابعة عبر واتساب' : 'Track via WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/products')}
              className="rounded-xl border border-neutral-300 py-3 px-6 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              {isRtl ? 'متابعة التسوق' : 'Continue Shopping'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const ArrowNext = isRtl ? FiArrowLeft : FiArrowRight;
  const ArrowPrev = isRtl ? FiArrowRight : FiArrowLeft;

  return (
    <main className="page-main min-h-screen w-full bg-white px-4 py-8 pt-24 dark:bg-neutral-950 sm:px-6 sm:py-12 md:pt-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Step Indicator Bar */}
        <div className="mb-8 flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
              {step === 1 ? (isRtl ? 'سلة المشتريات' : 'Shopping Cart') : (isRtl ? 'بيانات التوصيل والطلب' : 'Delivery & Checkout')}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              {step === 1
                ? (isRtl ? `لديك ${cartItems.length} منتجات في السلة` : `${cartItems.length} items in cart`)
                : (isRtl ? 'املأ بيانات التوصيل لإتمام الطلب فوراً' : 'Fill in delivery details to complete order')}
            </p>
          </div>

          {/* Stepper pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                step === 1
                  ? 'bg-brand text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              <span>1. {isRtl ? 'السلة' : 'Cart'}</span>
            </button>
            <span className="text-neutral-400">/</span>
            <button
              type="button"
              disabled={selectedItems.length === 0}
              onClick={() => selectedItems.length > 0 && setStep(2)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                step === 2
                  ? 'bg-brand text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              <span>2. {isRtl ? 'الطلب' : 'Checkout'}</span>
            </button>
          </div>
        </div>

        {/* ─── STEP 1: CART ITEMS REVIEW ─── */}
        {step === 1 && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items List */}
            <div className="space-y-4 lg:col-span-2">
              {/* Select All Bar */}
              <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="flex items-center gap-2.5 text-sm font-semibold text-neutral-800 transition hover:text-brand dark:text-neutral-200"
                >
                  {allSelected ? (
                    <FiCheckSquare className="h-5 w-5 text-brand" />
                  ) : (
                    <FiSquare className="h-5 w-5 text-neutral-400" />
                  )}
                  <span>
                    {isRtl ? 'تحديد الكل' : 'Select All'} ({selectedKeys.size}/{cartItems.length})
                  </span>
                </button>

                {selectedKeys.size > 0 && selectedKeys.size < cartItems.length && (
                  <button
                    type="button"
                    onClick={() => setSelectedKeys(new Set())}
                    className="text-xs font-medium text-neutral-500 hover:text-brand dark:text-neutral-400"
                  >
                    {isRtl ? 'إلغاء التحديد' : 'Deselect All'}
                  </button>
                )}
              </div>

              {cartItems.map((item) => {
                const display = localizeProduct(item, language);
                const sizeLabel = item.size ? getSizeById(item.size, language).label : item.sizeLabel;
                const isSelected = selectedKeys.has(item.cartKey);

                return (
                  <div
                    key={item.cartKey}
                    className={`flex flex-col gap-4 rounded-xl border p-4 transition-all sm:flex-row sm:items-center ${
                      isSelected
                        ? 'border-brand/40 bg-brand/[0.02] dark:border-brand/40 dark:bg-brand/[0.04]'
                        : 'border-neutral-200 bg-white opacity-75 dark:border-neutral-800 dark:bg-neutral-900'
                    }`}
                  >
                    {/* Item Selection Checkbox */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSelectItem(item.cartKey)}
                        aria-label={isSelected ? 'Deselect item' : 'Select item'}
                        className="text-neutral-400 transition hover:text-brand"
                      >
                        {isSelected ? (
                          <FiCheckSquare className="h-5 w-5 text-brand" />
                        ) : (
                          <FiSquare className="h-5 w-5" />
                        )}
                      </button>
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 p-2 dark:bg-neutral-800 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={display.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-neutral-900 dark:text-white text-sm sm:text-base">
                        {display.name}
                      </h3>
                      {display.brand && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {display.brand}
                        </p>
                      )}
                      {sizeLabel && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {sizeLabel}
                        </p>
                      )}
                      <p className="text-sm font-bold text-brand mt-1" dir="ltr">
                        {formatEGP(item.price)}
                      </p>
                    </div>

                    {/* Quantity and Actions */}
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className={qtyBtn}
                          onClick={() => handleQuantityChange(item.cartKey, item.quantity - 1)}
                          aria-label={cart.decreaseQty}
                        >
                          <FiMinus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold dark:text-neutral-200">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className={qtyBtn}
                          onClick={() => handleQuantityChange(item.cartKey, item.quantity + 1)}
                          aria-label={cart.increaseQty}
                        >
                          <FiPlus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-end">
                        <p className="text-sm font-bold text-neutral-900 dark:text-white" dir="ltr">
                          {formatEGP(parsePrice(item.price) * item.quantity)}
                        </p>
                        <button
                          type="button"
                          className="mt-1 text-red-500 transition hover:opacity-80 p-1"
                          onClick={() => removeFromCart(item.cartKey)}
                          aria-label={cart.removeItem}
                        >
                          <FiTrash2 className="inline h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step 1 Order Summary & "المرحلة القادمة" Button */}
            <div className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                {cartPage.orderSummary}
              </h2>

              <div className="mt-4 space-y-3 border-b border-neutral-200 pb-4 dark:border-neutral-800">
                <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                  <span>
                    {isRtl ? 'المنتجات المختارة' : 'Selected Items'} ({selectedCount})
                  </span>
                  <span dir="ltr">{formatEGP(selectedTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                  <span>{cartPage.shipping}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {cartPage.free}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-between text-lg font-bold text-neutral-900 dark:text-white">
                <span>{cart.total}</span>
                <span className="text-brand" dir="ltr">{formatEGP(selectedTotal)}</span>
              </div>

              {/* Primary Next Step Button: "المرحلة القادمة" */}
              <button
                type="button"
                disabled={selectedItems.length === 0}
                onClick={handleProceedToCheckout}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{isRtl ? 'المرحلة القادمة' : 'Next step'}</span>
                <ArrowNext className="h-4 w-4" />
              </button>

              <button
                type="button"
                className="mt-3 w-full rounded-xl border border-neutral-200 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                onClick={clearCart}
              >
                {cart.clearCart}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: CHECKOUT FORM & "اطلب الان" ─── */}
        {step === 2 && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Customer Data Form */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2 shadow-sm">
              <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-brand dark:text-neutral-400"
                >
                  <ArrowPrev className="h-4 w-4" />
                  <span>{isRtl ? 'العودة لتعديل السلة' : 'Back to cart'}</span>
                </button>
                <span className="text-xs text-neutral-400">
                  {selectedCount} {isRtl ? 'منتجات مختارة' : 'items selected'}
                </span>
              </div>

              {errors.form && (
                <div className="mb-4 rounded-xl bg-red-50 p-3.5 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  {errors.form}
                </div>
              )}

              <form onSubmit={handleOrderNow} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-200">
                    <FiUser className="h-3.5 w-3.5 text-brand" />
                    <span>{isRtl ? 'الاسم الكامل *' : 'Full Name *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={isRtl ? 'مثال: محمد أحمد' : 'e.g. John Doe'}
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition dark:bg-neutral-800 dark:text-white ${
                      errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Phone Number (Egyptian Format) */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-200">
                    <FiPhone className="h-3.5 w-3.5 text-brand" />
                    <span>{isRtl ? 'رقم الهاتف (موبايل مصري) *' : 'Phone Number (Egyptian Mobile) *'}</span>
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01012345678"
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition dark:bg-neutral-800 dark:text-white ${
                      errors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                  <p className="mt-1 text-[11px] text-neutral-400">
                    {isRtl ? 'رقم الموبايل المصري المكون من 11 رقم لتأكيد الشحن والتوصيل' : '11-digit Egyptian phone number for delivery confirmation'}
                  </p>
                </div>

                {/* Governorate / City */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-200">
                    <FiMapPin className="h-3.5 w-3.5 text-brand" />
                    <span>{isRtl ? 'المحافظة / المدينة *' : 'Governorate / City *'}</span>
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    {EGYPT_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Detailed Address */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-200">
                    <FiMapPin className="h-3.5 w-3.5 text-brand" />
                    <span>{isRtl ? 'العنوان بالتفصيل *' : 'Detailed Address *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder={isRtl ? 'اسم الشارع، رقم العمارة، رقم الشقة أو علامة مميزة' : 'Street name, building number, apartment'}
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition dark:bg-neutral-800 dark:text-white ${
                      errors.address ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  />
                  {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-200">
                    <FiFileText className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{isRtl ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={isRtl ? 'أي تعليمات خاصة بموعد التسليم أو التغليف...' : 'Any special delivery or packaging notes...'}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </form>
            </div>

            {/* Step 2 Summary & "اطلب الان" Action Button */}
            <div className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                {isRtl ? 'ملخص الطلب' : 'Order Summary'}
              </h2>

              {/* Items Mini List */}
              <div className="my-4 max-h-56 overflow-y-auto space-y-3 border-b border-neutral-100 pb-4 dark:border-neutral-800">
                {selectedItems.map((item) => {
                  const dp = localizeProduct(item, language);
                  const sizeLabel = item.size ? getSizeById(item.size, language).label : item.sizeLabel;
                  return (
                    <div key={item.cartKey} className="flex items-center justify-between text-xs">
                      <div className="min-w-0 flex-1 pe-2">
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                          {dp.name}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {sizeLabel && `${sizeLabel} • `}× {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-neutral-900 dark:text-white shrink-0" dir="ltr">
                        {formatEGP(parsePrice(item.price) * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 border-b border-neutral-200 pb-4 dark:border-neutral-800 text-sm">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>{isRtl ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span dir="ltr">{formatEGP(selectedTotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>{isRtl ? 'الشحن' : 'Shipping'}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {isRtl ? 'مجاني (عرض لفترة محدودة)' : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>{isRtl ? 'طريقة الدفع' : 'Payment'}</span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    {isRtl ? 'الدفع عند الاستلام (COD)' : 'Cash on Delivery'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-between text-lg font-bold text-neutral-900 dark:text-white">
                <span>{isRtl ? 'الإجمالي النهائي' : 'Final Total'}</span>
                <span className="text-brand" dir="ltr">{formatEGP(selectedTotal)}</span>
              </div>

              {/* Final Button: "اطلب الان" (Order now) */}
              <button
                type="button"
                disabled={submitting || selectedItems.length === 0}
                onClick={handleOrderNow}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-brand-dark hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <FaWhatsapp className="h-5 w-5" />
                    <span>{isRtl ? 'اطلب الان' : 'Order now'}</span>
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-[11px] text-neutral-400">
                {isRtl
                  ? 'سيتم تسجيل طلبك في النظام وإرسال رسالة مباشرة عبر واتساب لتأكيد التسليم'
                  : 'Order will be recorded in system and sent via WhatsApp for confirmation'}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;

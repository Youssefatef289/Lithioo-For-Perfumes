import React, { useId, useMemo, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { localizeProduct } from '../utils/localizeProduct';
import { formatEGP, parsePrice } from '../utils/price';
import { openWhatsApp } from '../utils/whatsapp';
import { createOrder } from '../services/orders';

const COPY = {
  en: {
    title: 'Order details',
    subtitle: 'Fill in your details and we will open WhatsApp with a ready message.',
    name: 'Full name',
    phone: 'Phone number',
    fulfillmentMethod: 'Receiving method',
    fulfillmentDetails: 'Receiving details',
    paymentMethod: 'Payment method',
    notes: 'Notes',
    notesPlaceholder: 'Add delivery notes, instructions, or special requests...',
    send: 'Send order on WhatsApp',
    delivery: 'Delivery',
    address: 'At address',
    branch: 'From branch',
    addressPlaceholder: 'Write the address in detail',
    branchPlaceholder: 'Write the branch name or nearest branch',
    cash: 'Cash on delivery',
    instapay: 'Instapay',
    vodafone: 'Vodafone Cash',
    orderIntro: 'Hello! I would like to place an order from Lithioo Perfumes:',
    customer: 'Customer',
    customerPhone: 'Phone',
    method: 'Receiving method',
    details: 'Receiving details',
    payment: 'Payment method',
    itemTitle: 'Items',
    total: 'Total',
    thankYou: 'Thank you!',
  },
  ar: {
    title: '\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0637\u0644\u0628',
    subtitle:
      '\u0627\u0645\u0644\u0623 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0648\u0633\u0646\u0641\u062a\u062d \u0648\u0627\u062a\u0633\u0627\u0628 \u0628\u0631\u0633\u0627\u0644\u0629 \u0645\u062c\u0647\u0632\u0629.',
    name: '\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644',
    phone: '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641',
    fulfillmentMethod: '\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645',
    fulfillmentDetails: '\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645',
    paymentMethod: '\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639',
    notes: '\u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a',
    notesPlaceholder:
      '\u0627\u0636\u0641 \u0623\u064a \u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0623\u0648 \u062a\u0639\u0644\u064a\u0645\u0627\u062a \u062e\u0627\u0635\u0629...',
    send: '\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628 \u0639\u0644\u0649 \u0648\u0627\u062a\u0633\u0627\u0628',
    delivery: '\u062f\u0644\u064a\u0641\u0631\u064a',
    address: '\u0639\u0644\u0649 \u0627\u0644\u0639\u0646\u0648\u0627\u0646',
    branch: '\u0645\u0646 \u0627\u0644\u0641\u0631\u0639',
    addressPlaceholder: '\u0627\u0643\u062a\u0628 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0628\u0627\u0644\u062a\u0641\u0635\u064a\u0644',
    branchPlaceholder: '\u0627\u0643\u062a\u0628 \u0627\u0633\u0645 \u0627\u0644\u0641\u0631\u0639 \u0623\u0648 \u0623\u0642\u0631\u0628 \u0641\u0631\u0639',
    cash: '\u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645',
    instapay: '\u0627\u0646\u0633\u062a\u0627 \u0628\u0627\u064a',
    vodafone: '\u0641\u0648\u062f\u0627\u0641\u0648\u0646 \u0643\u0627\u0634',
    orderIntro: '\u0623\u0631\u063a\u0628 \u0641\u064a \u0637\u0644\u0628 \u0645\u0646 \u0644\u064a\u062b\u064a\u0648 \u0644\u0644\u0639\u0637\u0648\u0631:',
    customer: '\u0627\u0644\u0639\u0645\u064a\u0644',
    customerPhone: '\u0627\u0644\u0647\u0627\u062a\u0641',
    method: '\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645',
    details: '\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645',
    payment: '\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639',
    itemTitle: '\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a',
    total: '\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a',
    thankYou: '\u0634\u0643\u0631\u0627\u064b \u0644\u0643',
  },
};

const RECEIVING_OPTIONS = {
  delivery: { en: 'Delivery', ar: '\u062f\u0644\u064a\u0641\u0631\u064a' },
  address: { en: 'At address', ar: '\u0639\u0644\u0649 \u0627\u0644\u0639\u0646\u0648\u0627\u0646' },
  branch: { en: 'From branch', ar: '\u0645\u0646 \u0627\u0644\u0641\u0631\u0639' },
};

const PAYMENT_OPTIONS = {
  cod: { en: 'Cash on delivery', ar: '\u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645' },
  instapay: { en: 'Instapay', ar: '\u0627\u0646\u0633\u062a\u0627 \u0628\u0627\u064a' },
  vodafone: { en: 'Vodafone Cash', ar: '\u0641\u0648\u062f\u0627\u0641\u0648\u0646 \u0643\u0627\u0634' },
};

const INITIAL_FORM = {
  customerName: '',
  customerPhone: '',
  fulfillmentMethod: 'delivery',
  fulfillmentDetails: '',
  paymentMethod: 'cod',
  notes: '',
};

const baseFieldClasses =
  'w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 shadow-sm transition focus:border-brand focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500';

const baseLabelClasses = 'block text-sm font-semibold text-neutral-700 dark:text-neutral-200';

const buildOrderMessage = (language, cartItems, total, form, orderNumber = null) => {
  const copy = COPY[language] || COPY.en;
  const receiving = RECEIVING_OPTIONS[form.fulfillmentMethod] || RECEIVING_OPTIONS.delivery;
  const payment = PAYMENT_OPTIONS[form.paymentMethod] || PAYMENT_OPTIONS.cod;

  const itemLines = cartItems.map((item, index) => {
    const itemDisplay = localizeProduct(item, language);
    const lineTotal = parsePrice(item.price) * item.quantity;
    const sizePart = item.sizeLabel ? ` (${item.sizeLabel})` : '';
    return `${index + 1}. ${itemDisplay.name}${sizePart} x ${item.quantity} - ${formatEGP(lineTotal)}`;
  });

  const orderNumberLine = orderNumber
    ? [`${language === 'ar' ? 'رقم الطلب' : 'Order #'}: ${orderNumber}`]
    : [];

  const detailsLines = [
    ...orderNumberLine,
    `${copy.customer}: ${form.customerName.trim()}`,
    `${copy.customerPhone}: ${form.customerPhone.trim()}`,
    `${copy.method}: ${language === 'ar' ? receiving.ar : receiving.en}`,
    form.fulfillmentDetails.trim() ? `${copy.details}: ${form.fulfillmentDetails.trim()}` : '',
    `${copy.payment}: ${language === 'ar' ? payment.ar : payment.en}`,
  ].filter(Boolean);

  const notesLine = form.notes.trim() ? [`${copy.notes}: ${form.notes.trim()}`] : [];

  return [
    copy.orderIntro,
    '',
    ...detailsLines,
    '',
    `${copy.itemTitle}:`,
    ...itemLines,
    '',
    `${copy.total}: ${formatEGP(total)}`,
    ...notesLine,
    '',
    copy.thankYou,
  ].join('\n');
};

const OrderWhatsAppButton = ({ className = '', compact = false, onOrdered }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { language } = useLanguage();
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const baseId = useId();
  const copy = useMemo(() => COPY[language] || COPY.en, [language]);
  const isArabic = language === 'ar';
  const detailsPlaceholder =
    form.fulfillmentMethod === 'branch' ? copy.branchPlaceholder : copy.addressPlaceholder;

  const updateField = (field) => (event) => {
    const value = event.target.value;
    if (field === 'customerPhone') setPhoneError('');
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateEgyptianPhone = (phone) => {
    const cleaned = (phone || '').replace(/[\s\-()]/g, '');
    const egRegex = /^(?:\+?20|0020|0)?1[0125]\d{8}$/;
    return egRegex.test(cleaned);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (cartItems.length === 0) return;

    if (!validateEgyptianPhone(form.customerPhone)) {
      setPhoneError(
        language === 'ar'
          ? 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)'
          : 'Please enter a valid Egyptian phone number (e.g. 01012345678)'
      );
      return;
    }

    setSubmitting(true);
    let orderNumber = null;

    try {
      const orderPayload = {
        customer_name: form.customerName.trim(),
        phone: form.customerPhone.trim(),
        address: form.fulfillmentDetails.trim(),
        city: form.fulfillmentMethod === 'branch' ? 'Branch' : 'Delivery',
        notes: form.notes.trim(),
        language,
        items: cartItems.map((item) => ({
          product_slug: item.id,
          product_id: item.id,
          size_id: item.size || item.sizeId || '50ml',
          quantity: item.quantity,
          unit_price: parsePrice(item.price),
        })),
      };

      const result = await createOrder(orderPayload);
      if (result?.order_code || result?.order_number) {
        orderNumber = result.order_code || result.order_number;
      }
    } catch (err) {
      console.warn('Order DB save failed, proceeding with WhatsApp fallback:', err.message);
    }

    const message = buildOrderMessage(language, cartItems, getCartTotal(), form, orderNumber);
    openWhatsApp(message);
    clearCart?.();
    onOrdered?.(form);
    setForm(INITIAL_FORM);
    setSubmitting(false);
  };

  const fieldLayout = compact ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 gap-4 sm:grid-cols-2';
  const inputClasses = compact
    ? `${baseFieldClasses} rounded-xl px-3 py-2.5 text-sm`
    : baseFieldClasses;
  const labelClasses = compact ? 'block text-xs font-semibold text-neutral-700 dark:text-neutral-200' : baseLabelClasses;
  const textareaRows = compact ? 2 : 3;

  return (
    <form
      onSubmit={handleSubmit}
      className={[
        'rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-5',
        className,
      ].join(' ')}
    >
      <div className={compact ? 'space-y-3' : 'space-y-4'}>
        {!compact && (
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{copy.title}</h3>
            <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{copy.subtitle}</p>
          </div>
        )}

        <div className={fieldLayout}>
          <div className="space-y-2">
            <label className={labelClasses} htmlFor={`${baseId}-name`}>
              {copy.name}
            </label>
            <input
              id={`${baseId}-name`}
              type="text"
              required
              value={form.customerName}
              onChange={updateField('customerName')}
              className={inputClasses}
              autoComplete="name"
              placeholder={copy.name}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClasses} htmlFor={`${baseId}-phone`}>
              {copy.phone}
            </label>
            <input
              id={`${baseId}-phone`}
              type="tel"
              required
              value={form.customerPhone}
              onChange={updateField('customerPhone')}
              className={`${inputClasses} ${phoneError ? '!border-red-500 ring-1 ring-red-500' : ''}`}
              autoComplete="tel"
              inputMode="tel"
              placeholder={copy.phone}
            />
            {phoneError && (
              <p className="text-xs font-semibold text-red-500 mt-1">{phoneError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className={labelClasses} htmlFor={`${baseId}-fulfillment`}>
              {copy.fulfillmentMethod}
            </label>
            <select
              id={`${baseId}-fulfillment`}
              value={form.fulfillmentMethod}
              onChange={updateField('fulfillmentMethod')}
              className={inputClasses}
            >
              <option value="delivery">{copy.delivery}</option>
              <option value="address">{copy.address}</option>
              <option value="branch">{copy.branch}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className={labelClasses} htmlFor={`${baseId}-details`}>
              {copy.fulfillmentDetails}
            </label>
            <input
              id={`${baseId}-details`}
              type="text"
              required={form.fulfillmentMethod !== 'branch'}
              value={form.fulfillmentDetails}
              onChange={updateField('fulfillmentDetails')}
              className={inputClasses}
              placeholder={detailsPlaceholder}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className={labelClasses} htmlFor={`${baseId}-payment`}>
              {copy.paymentMethod}
            </label>
            <select
              id={`${baseId}-payment`}
              value={form.paymentMethod}
              onChange={updateField('paymentMethod')}
              className={inputClasses}
            >
              <option value="cod">{copy.cash}</option>
              <option value="instapay">{copy.instapay}</option>
              <option value="vodafone">{copy.vodafone}</option>
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className={labelClasses} htmlFor={`${baseId}-notes`}>
              {copy.notes}
            </label>
            <textarea
              id={`${baseId}-notes`}
              rows={textareaRows}
              value={form.notes}
              onChange={updateField('notes')}
              className={`${inputClasses} resize-none`}
              placeholder={copy.notesPlaceholder}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={cartItems.length === 0 || submitting}
          className={[
            'flex w-full items-center justify-center gap-2 rounded-none bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-none transition hover:bg-[#20bd5a] disabled:cursor-not-allowed disabled:opacity-50',
            compact ? 'py-2.5 text-sm' : 'py-3.5',
          ].join(' ')}
        >
          {submitting ? (
            <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <FaWhatsapp className="h-5 w-5 shrink-0" />
          )}
          <span dir={isArabic ? 'rtl' : 'ltr'}>{copy.send}</span>
        </button>
      </div>
    </form>
  );
};

export default OrderWhatsAppButton;

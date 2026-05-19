import { WHATSAPP_NUMBER } from '../data/contact';
import { getT, getCurrentLanguage } from './i18n';
import { localizeProduct } from './localizeProduct';
import { formatEGP, parsePrice } from './price';

export const getWhatsAppUrl = (text) => {
  const message = text ?? getT().whatsapp.greeting;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export const buildCartOrderMessage = (cartItems, total) => {
  const lang = getCurrentLanguage();
  const w = getT().whatsapp;
  const lines = cartItems.map((item, index) => {
    const itemDisplay = localizeProduct(item, lang);
    const lineTotal = parsePrice(item.price) * item.quantity;
    const sizePart = item.sizeLabel ? ` (${item.sizeLabel})` : '';
    return `${index + 1}. ${itemDisplay.name}${sizePart} × ${item.quantity} — ${formatEGP(lineTotal)}`;
  });

  return [w.cartIntro, '', ...lines, '', `${w.total}: ${formatEGP(total)}`, '', w.thankYou].join('\n');
};

export const buildSingleProductMessage = (product, price) => {
  const lang = getCurrentLanguage();
  const p = localizeProduct(product, lang);
  const w = getT().whatsapp;
  const priceStr = formatEGP(price ?? product.price);
  const brandLine = p.brand ? `${w.brand}: ${p.brand}\n` : '';
  const sizeLine = product.sizeLabel ? `${w.size}: ${product.sizeLabel}\n` : '';

  return [
    w.singleIntro,
    '',
    `${w.product}: ${p.name}`,
    brandLine + sizeLine + `${w.price}: ${priceStr}`,
    p.category ? `${w.category}: ${p.category}` : '',
    '',
    w.confirmDelivery,
  ]
    .filter(Boolean)
    .join('\n');
};

export const openWhatsApp = (text) => {
  window.open(getWhatsAppUrl(text), '_blank', 'noopener,noreferrer');
};

import { WHATSAPP_NUMBER, WHATSAPP_GREETING } from '../data/contact';
import { formatEGP, parsePrice } from './price';

export const getWhatsAppUrl = (text = WHATSAPP_GREETING) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export const buildCartOrderMessage = (cartItems, total) => {
  const lines = cartItems.map((item, index) => {
    const lineTotal = parsePrice(item.price) * item.quantity;
    const sizePart = item.sizeLabel ? ` (${item.sizeLabel})` : '';
    return `${index + 1}. ${item.name}${sizePart} × ${item.quantity} — ${formatEGP(lineTotal)}`;
  });

  return [
    'Hello! I would like to place an order from Lithioo Perfumes:',
    '',
    ...lines,
    '',
    `Total: ${formatEGP(total)}`,
    '',
    'Thank you!',
  ].join('\n');
};

export const buildSingleProductMessage = (product, price) => {
  const priceStr = formatEGP(price ?? product.price);
  const brandLine = product.brand ? `Brand: ${product.brand}\n` : '';
  const sizeLine = product.sizeLabel ? `Size: ${product.sizeLabel}\n` : '';

  return [
    'Hello! I would like to order from Lithioo Perfumes:',
    '',
    `Product: ${product.name}`,
    brandLine + sizeLine + `Price: ${priceStr}`,
    product.category ? `Category: ${product.category}` : '',
    '',
    'Please confirm availability and delivery. Thank you!',
  ]
    .filter(Boolean)
    .join('\n');
};

export const openWhatsApp = (text) => {
  window.open(getWhatsAppUrl(text), '_blank', 'noopener,noreferrer');
};

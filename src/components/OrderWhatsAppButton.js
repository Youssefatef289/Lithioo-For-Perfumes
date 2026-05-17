import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { buildCartOrderMessage, openWhatsApp } from '../utils/whatsapp';

const OrderWhatsAppButton = ({ className = '', onOrdered }) => {
  const { cartItems, getCartTotal } = useCart();

  const handleOrder = () => {
    if (cartItems.length === 0) return;
    const message = buildCartOrderMessage(cartItems, getCartTotal());
    openWhatsApp(message);
    onOrdered?.();
  };

  return (
    <button
      type="button"
      onClick={handleOrder}
      disabled={cartItems.length === 0}
      className={`flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#20bd5a] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <FaWhatsapp className="h-5 w-5" />
      Order Now
    </button>
  );
};

export default OrderWhatsAppButton;

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BOTTLE_SIZES, DEFAULT_SIZE_ID, getSizeById, getCartKey } from '../data/sizes';
import { parsePrice } from '../utils/price';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const normalizeCartItem = (item) => {
  if (item.hideSizes || item.section === 'original') {
    const cartKey = item.cartKey || `${item.id}-original`;
    const price =
      typeof item.price === 'number' && !Number.isNaN(item.price)
        ? item.price
        : getSizeById(DEFAULT_SIZE_ID).price;

    return {
      ...item,
      size: null,
      sizeLabel: '',
      price,
      cartKey,
    };
  }

  const size = item.size || DEFAULT_SIZE_ID;
  const sizeMeta = getSizeById(size);
  const cartKey = item.cartKey || getCartKey(item.id, size);
  const price =
    typeof item.price === 'number' && !Number.isNaN(item.price) ? item.price : sizeMeta.price;

  return {
    ...item,
    size,
    sizeLabel: item.sizeLabel || sizeMeta.label,
    price,
    cartKey,
  };
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartNotice, setCartNotice] = useState(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(Array.isArray(parsed) ? parsed.map(normalizeCartItem) : []);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const clearCartNotice = useCallback(() => setCartNotice(null), []);

  const addToCart = (product, quantity = 1, { openCart = false } = {}) => {
    const size = product.size || DEFAULT_SIZE_ID;
    const sizeMeta = getSizeById(size);
    const lineItem = normalizeCartItem({
      ...product,
      size,
      sizeLabel: product.sizeLabel || sizeMeta.label,
      price: product.price ?? sizeMeta.price,
      quantity: 0,
    });

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.cartKey === lineItem.cartKey);
      if (existing) {
        return prevItems.map((item) =>
          item.cartKey === lineItem.cartKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...lineItem, quantity }];
    });

    setCartNotice('تم إضافته في السلة');
    if (openCart) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (cartKey) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.cartKey === cartKey ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () =>
    cartItems.reduce((total, item) => total + parsePrice(item.price) * item.quantity, 0);

  const getCartItemsCount = () => cartItems.reduce((count, item) => count + item.quantity, 0);

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isCartOpen,
    setIsCartOpen,
    toggleCart,
    cartNotice,
    clearCartNotice,
    bottleSizes: BOTTLE_SIZES,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

import React, { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext();

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

export const WatchlistProvider = ({ children }) => {
  const [watchlistItems, setWatchlistItems] = useState(() => {
    const saved = localStorage.getItem('watchlistItems');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('watchlistItems', JSON.stringify(watchlistItems));
  }, [watchlistItems]);

  const addToWatchlist = (product) => {
    setWatchlistItems((prevItems) => {
      if (prevItems.find(item => item.id === product.id)) {
        return prevItems;
      }
      return [...prevItems, product];
    });
  };

  const removeFromWatchlist = (productId) => {
    setWatchlistItems((prevItems) => prevItems.filter(item => item.id !== productId));
  };

  const isInWatchlist = (productId) => {
    return watchlistItems.some(item => item.id === productId);
  };

  const toggleWatchlist = (product) => {
    if (isInWatchlist(product.id)) {
      removeFromWatchlist(product.id);
    } else {
      addToWatchlist(product);
    }
  };

  const value = {
    watchlistItems,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
  };

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
};


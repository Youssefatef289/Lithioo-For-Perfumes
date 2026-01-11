import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useWatchlist } from '../contexts/WatchlistContext';
import './ProductCard.css';

const ProductCard = ({ product, className = '', showActions = true }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const [isAdding, setIsAdding] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsAdding(true);
    
    // Convert price string to number
    const priceNumber = parseFloat(product.price.replace('$', ''));
    addToCart({ ...product, price: priceNumber });
    
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  const handleWatchlist = (e) => {
    e.stopPropagation();
    setIsToggling(true);
    
    const priceNumber = parseFloat(product.price.replace('$', ''));
    toggleWatchlist({ ...product, price: priceNumber });
    
    setTimeout(() => {
      setIsToggling(false);
    }, 300);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const inWatchlist = isInWatchlist(product.id);

  return (
    <div 
      className={`product-card-wrapper ${className}`}
      onClick={handleCardClick}
    >
      <div className="product-card">
        <div className="product-image-wrapper">
          <div className="product-image">
            <img src={product.image} alt={product.name} />
          </div>
          {showActions && (
            <div className="product-actions">
              <button
                className={`action-btn cart-btn ${isAdding ? 'adding' : ''}`}
                onClick={handleAddToCart}
                aria-label="Add to cart"
              >
                <FiShoppingCart />
                {isAdding && <span className="action-feedback">✓</span>}
              </button>
              <button
                className={`action-btn watchlist-btn ${inWatchlist ? 'active' : ''} ${isToggling ? 'toggling' : ''}`}
                onClick={handleWatchlist}
                aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                <FiHeart />
              </button>
            </div>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">{product.price}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;


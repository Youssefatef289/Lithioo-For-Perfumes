import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import './NewCollection.css';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const NewCollection = () => {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState({});
  const [togglingWishlist, setTogglingWishlist] = useState({});
  
  const products = [
    { id: 1, name: 'Saint Brvbeu', price: '$25.96', image: '/image/Perfume (2).jpg' },
    { id: 2, name: 'Chamelio', price: '$25.96', image: '/image/Perfume (3).jpg' },
    { id: 3, name: 'Secta Corm', price: '$25.96', image: '/image/Perfume (4).jpg' },
    { id: 4, name: 'Beone Neo', price: '$25.98', image: '/image/Perfume (5).jpg' },
  ];

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    setAddingToCart({ ...addingToCart, [product.id]: true });
    addToCart(product);
    setTimeout(() => {
      setAddingToCart({ ...addingToCart, [product.id]: false });
    }, 500);
  };

  const handleWishlist = (e, product) => {
    e.stopPropagation();
    setTogglingWishlist({ ...togglingWishlist, [product.id]: true });
    toggleWishlist(product);
    setTimeout(() => {
      setTogglingWishlist({ ...togglingWishlist, [product.id]: false });
    }, 300);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <section className="new-collection">
      <div className="collection-container">
        <div className="collection-header slide-up">
          <h2 className="collection-title">{t.collection.title}</h2>
          <p className="collection-description">
            {t.collection.description}
          </p>
        </div>
        <div className="products-grid">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className={`product-card slide-up stagger-${index + 1}`}
              onClick={() => handleProductClick(product.id)}
            >
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                <div className="product-overlay">
                  <button
                    className={`product-wishlist-btn ${isInWishlist(product.id) ? 'active' : ''} ${togglingWishlist[product.id] ? 'toggling' : ''}`}
                    onClick={(e) => handleWishlist(e, product)}
                    aria-label="Add to wishlist"
                  >
                    <FiHeart />
                  </button>
                </div>
              </div>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">{product.price}</p>
              <button
                className={`product-add-to-cart-btn ${addingToCart[product.id] ? 'adding' : ''}`}
                onClick={(e) => handleAddToCart(e, product)}
                aria-label="Add to cart"
              >
                <FiShoppingCart />
                {addingToCart[product.id] ? 'Added!' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewCollection;


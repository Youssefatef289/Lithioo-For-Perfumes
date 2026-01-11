import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useTheme } from '../contexts/ThemeContext';
import { getProductById } from '../data/products';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = getProductById(id);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!product) {
      navigate('/products');
    }
  }, [id, product, navigate]);

  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product, quantity);
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  const handleWishlist = () => {
    setIsToggling(true);
    toggleWishlist(product);
    setTimeout(() => {
      setIsToggling(false);
    }, 300);
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + change)));
  };

  const inWishlist = isInWishlist(product.id);

  const images = [product.image]; // Single image for now

  return (
    <main className={`product-details-page ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className="product-details-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>

        <div className="product-details-content">
          <div className="product-images">
            <div className="main-image">
              <img src={images[selectedImage]} alt={product.name} />
            </div>
            {images.length > 1 && (
              <div className="thumbnail-images">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              <div className="product-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={i < Math.floor(product.rating) ? 'filled' : ''}
                    />
                  ))}
                </div>
                <span className="rating-value">{product.rating}</span>
                <span className="reviews-count">({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="product-price-section">
              <span className="product-price">${product.price.toFixed(2)}</span>
              {product.inStock && (
                <span className="in-stock">In Stock</span>
              )}
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-actions-section">
              <div className="quantity-selector">
                <label>Quantity</label>
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className={`add-to-cart-btn ${isAdding ? 'adding' : ''}`}
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <FiShoppingCart />
                  {isAdding ? 'Added!' : 'Add to Cart'}
                </button>
                <button
                  className={`wishlist-btn ${inWishlist ? 'active' : ''} ${isToggling ? 'toggling' : ''}`}
                  onClick={handleWishlist}
                >
                  <FiHeart />
                  {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
            </div>

            <div className="product-features">
              <div className="feature-item">
                <strong>Category:</strong> {product.category}
              </div>
              <div className="feature-item">
                <strong>Availability:</strong> {product.inStock ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetails;

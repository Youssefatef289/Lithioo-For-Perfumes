import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import './OurStore.css';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const OurStore = () => {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [addingToCart, setAddingToCart] = useState({});
  const [togglingWishlist, setTogglingWishlist] = useState({});

  const allProducts = [
    { id: 1, name: 'Saint Brvbeu', price: '$35.22', image: '/image/Perfume (2).jpg' },
    { id: 2, name: 'Chamelio', price: '$19.92', image: '/image/Perfume (3).jpg' },
    { id: 3, name: 'Secta Corm', price: '$32.28', image: '/image/Perfume (4).jpg' },
    { id: 4, name: 'Beone Neo', price: '$25.98', image: '/image/Perfume (5).jpg' },
    { id: 5, name: 'JK Klove', price: '$26.22', image: '/image/Perfume (6).jpg' },
    { id: 6, name: 'Cygnus', price: '$26.87', image: '/image/Perfume (7).jpg' },
    { id: 7, name: 'Carolky', price: '$35.88', image: '/image/Perfume (8).jpg' },
    { id: 8, name: 'Kenirt', price: '$17.35', image: '/image/Perfume (9).jpg' },
  ];

  const filters = [
    { key: 'All', label: t.store.filters.all },
    { key: 'Featured', label: t.store.filters.featured },
    { key: 'Top Selling', label: t.store.filters.topSelling },
    { key: 'Sale', label: t.store.filters.sale },
    { key: 'New', label: t.store.filters.new },
  ];

  const productsPerPage = 8;
  const startIndex = (currentPage - 1) * productsPerPage;
  const displayedProducts = allProducts.slice(startIndex, startIndex + productsPerPage);
  const totalPages = Math.ceil(allProducts.length / productsPerPage);

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
    <section className="our-store" id="product">
      <div className="store-container">
        <h2 className="store-title slide-up">{t.store.title}</h2>
        <div className="store-filters slide-up">
          {filters.map((filter) => (
            <button
              key={filter.key}
              className={`filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="store-products-grid">
          {displayedProducts.map((product, index) => (
            <div 
              key={product.id} 
              className={`store-product-card slide-up stagger-${(index % 4) + 1}`}
              onClick={() => handleProductClick(product.id)}
            >
              <div className="store-product-image">
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
              <h3 className="store-product-name">{product.name}</h3>
              <p className="store-product-price">{product.price}</p>
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
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ←
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
};

export default OurStore;


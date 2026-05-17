import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiArrowLeft } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import SizeSelector from '../components/SizeSelector';
import { DEFAULT_SIZE_ID, getSizeById } from '../data/sizes';
import { formatEGP } from '../utils/price';
import { buildSingleProductMessage, openWhatsApp } from '../utils/whatsapp';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { getProductById } from '../data/products';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(DEFAULT_SIZE_ID);

  const product = getProductById(id);
  const sizeMeta = getSizeById(selectedSize);
  const price = sizeMeta.price;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!product) {
      navigate('/products');
    }
  }, [id, product, navigate]);

  if (!product) {
    return null;
  }

  const lineItem = {
    ...product,
    size: selectedSize,
    sizeLabel: sizeMeta.label,
    price,
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(lineItem, quantity);
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleWishlist = () => {
    setIsToggling(true);
    toggleWishlist(product);
    setTimeout(() => setIsToggling(false), 300);
  };

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + change)));
  };

  const inWishlist = isInWishlist(product.id);
  const images = [product.image];

  const qtyBtn =
    'flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-lg font-medium text-neutral-700 transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-600 dark:text-neutral-200';

  return (
    <main className="page-main min-h-screen w-full bg-white px-4 py-8 pt-24 dark:bg-neutral-950 sm:px-6 sm:py-12 md:pt-28 lg:px-8">
      <div className="section-inner max-w-6xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-brand dark:text-neutral-400"
        >
          <FiArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-4">
            <div className="card-elevated overflow-hidden p-6">
              <img src={images[selectedImage]} alt={product.name} className="mx-auto max-h-[420px] w-full object-contain" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 p-1 ${
                      selectedImage === index ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              {product.brand && (
                <p className="text-sm font-medium uppercase tracking-wider text-brand">{product.brand}</p>
              )}
              <h1 className="heading-section">{product.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-600'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{product.rating}</span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">({product.reviews} reviews)</span>
              </div>
            </div>

            <SizeSelector selectedSize={selectedSize} onChange={setSelectedSize} />
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold text-brand">{formatEGP(price)}</span>
              {product.inStock && (
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  In Stock
                </span>
              )}
            </div>

            <div className="card-elevated p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Product details</h3>
              <p className="text-muted-section !mt-0 leading-relaxed">{product.description}</p>
            </div>

            {product.ingredients?.length > 0 && (
              <div className="card-elevated p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Ingredients / Notes</h3>
                <ul className="flex flex-wrap gap-2">
                  {product.ingredients.map((note) => (
                    <li key={note} className="rounded-full bg-brand/10 px-3 py-1 text-sm font-medium text-brand">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.benefits?.length > 0 && (
              <div className="card-elevated p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">How you benefit</h3>
                <ul className="list-inside list-disc space-y-2 text-muted-section !mt-0">
                  {product.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Quantity</label>
                <div className="flex items-center gap-2">
                  <button type="button" className={qtyBtn} onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                    -
                  </button>
                  <span className="min-w-[2.5rem] text-center text-lg font-semibold dark:text-white">{quantity}</span>
                  <button type="button" className={qtyBtn} onClick={() => handleQuantityChange(1)} disabled={quantity >= 10}>
                    +
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openWhatsApp(buildSingleProductMessage(lineItem, price))}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-[#20bd5a]"
            >
              <FaWhatsapp className="h-5 w-5" />
              Order Now
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`btn-primary flex-1 ${isAdding ? 'bg-emerald-600 hover:bg-emerald-600' : ''}`}
              >
                <FiShoppingCart className="h-5 w-5" />
                {isAdding ? 'Added!' : 'Add to Cart'}
              </button>
              <button
                type="button"
                onClick={handleWishlist}
                className={`btn-outline flex-1 ${inWishlist ? 'border-brand bg-brand/10' : ''} ${isToggling ? 'animate-heart-pulse' : ''}`}
              >
                <FiHeart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            <div className="card-elevated flex flex-col gap-2 p-4 text-sm">
              <p className="text-neutral-700 dark:text-neutral-300">
                <strong className="text-neutral-900 dark:text-white">Category:</strong> {product.category}
              </p>
              <p className="text-neutral-700 dark:text-neutral-300">
                <strong className="text-neutral-900 dark:text-white">Availability:</strong>{' '}
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetails;

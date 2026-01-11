// All products data
export const allProducts = [
  { 
    id: 1, 
    name: 'Saint Brvbeu', 
    price: 35.22, 
    image: '/image/Perfume (2).jpg',
    description: 'A luxurious fragrance that combines fresh citrus notes with warm woody undertones. Perfect for everyday wear.',
    category: 'Men\'s Fragrance',
    rating: 4.5,
    reviews: 128,
    inStock: true
  },
  { 
    id: 2, 
    name: 'Chamelio', 
    price: 19.92, 
    image: '/image/Perfume (3).jpg',
    description: 'A delicate floral scent with hints of rose and jasmine. Elegant and feminine, ideal for special occasions.',
    category: 'Women\'s Fragrance',
    rating: 4.3,
    reviews: 95,
    inStock: true
  },
  { 
    id: 3, 
    name: 'Secta Corm', 
    price: 32.28, 
    image: '/image/Perfume (4).jpg',
    description: 'A bold and spicy fragrance with notes of black pepper and sandalwood. For the confident individual.',
    category: 'Men\'s Fragrance',
    rating: 4.7,
    reviews: 156,
    inStock: true
  },
  { 
    id: 4, 
    name: 'Beone Neo', 
    price: 25.98, 
    image: '/image/Perfume (5).jpg',
    description: 'A modern unisex fragrance with fresh aquatic notes and a clean finish. Versatile and contemporary.',
    category: 'Unisex',
    rating: 4.4,
    reviews: 203,
    inStock: true
  },
  { 
    id: 5, 
    name: 'JK Klove', 
    price: 26.22, 
    image: '/image/Perfume (6).jpg',
    description: 'A sweet and fruity fragrance with notes of vanilla and caramel. Warm and inviting.',
    category: 'Women\'s Fragrance',
    rating: 4.6,
    reviews: 87,
    inStock: true
  },
  { 
    id: 6, 
    name: 'Cygnus', 
    price: 26.87, 
    image: '/image/Perfume (7).jpg',
    description: 'An elegant floral bouquet with white flowers and soft musk. Timeless and sophisticated.',
    category: 'Women\'s Fragrance',
    rating: 4.5,
    reviews: 142,
    inStock: true
  },
  { 
    id: 7, 
    name: 'Carolky', 
    price: 35.88, 
    image: '/image/Perfume (8).jpg',
    description: 'A rich and opulent fragrance with amber and oud notes. Luxurious and memorable.',
    category: 'Men\'s Fragrance',
    rating: 4.8,
    reviews: 178,
    inStock: true
  },
  { 
    id: 8, 
    name: 'Kenirt', 
    price: 17.35, 
    image: '/image/Perfume (9).jpg',
    description: 'A fresh and clean scent with citrus and green notes. Perfect for a casual day out.',
    category: 'Unisex',
    rating: 4.2,
    reviews: 91,
    inStock: true
  },
];

export const getProductById = (id) => {
  const productId = parseInt(id);
  return allProducts.find(product => product.id === productId);
};

export const getProductsByCategory = (category) => {
  return allProducts.filter(product => product.category === category);
};

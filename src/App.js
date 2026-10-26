import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import CartToast from './components/CartToast';
import FloatingContactButton from './components/FloatingContactButton';
import BackButton from './components/BackButton';
import MobileBottomNav from './components/MobileBottomNav';
import Home from './pages/Home';
import Products from './pages/Products';
import BrandPage from './pages/BrandPage';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';

// Admin dashboard — loaded lazily so it does NOT bloat the storefront bundle
const AdminApp = React.lazy(() => import('./admin/AdminApp'));

const AdminSuspense = () => (
  <div className="flex h-screen items-center justify-center bg-neutral-50">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7fb069] border-t-transparent" />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Admin dashboard (completely separate shell) ─── */}
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<AdminSuspense />}>
              <AdminApp />
            </Suspense>
          }
        />

        {/* ── Storefront ──────────────────────────────────── */}
        <Route
          path="/*"
          element={
            <div className="app-shell pb-28 md:pb-0">
              <Header />
              <BackButton />
              <CartSidebar />
              <CartToast />
              <FloatingContactButton />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/brand/:brandId" element={<BrandPage />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
              <Footer />
              <MobileBottomNav />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

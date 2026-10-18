// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { SellerProvider } from './context/SellerContext';
import { CartProvider } from './context/CartContext';
import { BuyerRoute, SellerRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import MarketplaceHome from './pages/MarketplaceHome';
import ProductDetailPage from './pages/ProductDetailPage';
import SellerDashboard from './pages/SellerDashboard';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import { HardHat } from 'lucide-react';
import './styles/app.css';

function NotFoundPage() {
  return (
    <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
      <div className="empty-state">
        <HardHat className="empty-state-icon" />
        <h2 className="empty-state-title">Page Not Found</h2>
        <p className="empty-state-desc">The requested page does not exist on BajriX marketplace.</p>
        <Link to="/" className="btn btn-primary">
          Back to Catalogue
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <SellerProvider>
            <CartProvider>
              <div className="main-layout">
                <Navbar />
                <main className="main-content">
                  <Routes>
                    {/* Public Authentication Route */}
                    <Route
                      path="/login"
                      element={
                        <PublicOnlyRoute>
                          <LoginPage />
                        </PublicOnlyRoute>
                      }
                    />

                    {/* Buyer Protected Routes */}
                    <Route
                      path="/"
                      element={
                        <BuyerRoute>
                          <MarketplaceHome />
                        </BuyerRoute>
                      }
                    />
                    <Route
                      path="/products/:id"
                      element={
                        <BuyerRoute>
                          <ProductDetailPage />
                        </BuyerRoute>
                      }
                    />
                    <Route
                      path="/cart"
                      element={
                        <BuyerRoute>
                          <CartPage />
                        </BuyerRoute>
                      }
                    />
                    <Route
                      path="/checkout"
                      element={
                        <BuyerRoute>
                          <CheckoutPage />
                        </BuyerRoute>
                      }
                    />
                    <Route
                      path="/order-confirmation/:orderNumber"
                      element={
                        <BuyerRoute>
                          <OrderConfirmationPage />
                        </BuyerRoute>
                      }
                    />

                    {/* Seller Protected Route */}
                    <Route
                      path="/seller"
                      element={
                        <SellerRoute>
                          <SellerDashboard />
                        </SellerRoute>
                      }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </CartProvider>
          </SellerProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

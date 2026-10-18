// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HardHat,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  LogOut,
  User,
  Store,
  Building2
} from 'lucide-react';
import SellerIdentitySwitcher from './SellerIdentitySwitcher';
import { useSeller } from '../context/SellerContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { currentSeller } = useSeller();
  const { items } = useCart();
  const { user, isAuthenticated, isBuyer, isSeller, logout } = useAuth();

  const isSellerRoute = location.pathname.startsWith('/seller');
  const cartCount = items.length;

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-top">
          <Link to={isSeller ? '/seller' : '/'} className="brand-logo" aria-label="BajriX Home">
            <div className="brand-icon">
              <HardHat size={20} strokeWidth={2.5} />
            </div>
            <span>
              Bajri<span className="highlight">X</span>
            </span>
          </Link>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                {/* For Sellers, show the seller identity switcher */}
                {isSeller && <SellerIdentitySwitcher />}

                {/* For Buyers, show Cart icon */}
                {isBuyer && (
                  <Link
                    to="/cart"
                    className="nav-link"
                    style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}
                    aria-label={`View Cart (${cartCount} items)`}
                  >
                    <ShoppingCart size={18} />
                    <span className="cart-nav-label">Cart</span>
                    {cartCount > 0 && (
                      <span
                        style={{
                          backgroundColor: 'var(--color-brand-primary)',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-pill)',
                          lineHeight: 1.4
                        }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Role-based navigation button */}
                {isSeller ? (
                  <Link to="/seller" className="nav-link seller-mode" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LayoutDashboard size={16} />
                    <span>Seller Desk</span>
                  </Link>
                ) : (
                  <Link to="/" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShoppingBag size={16} />
                    <span>Catalogue</span>
                  </Link>
                )}

                {/* User Session Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    backgroundColor: isSeller ? 'var(--color-slate-900)' : 'var(--color-slate-100)',
                    color: isSeller ? 'white' : 'var(--color-slate-800)',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                  title={user?.email}
                >
                  {isSeller ? <Store size={13} style={{ color: '#38bdf8' }} /> : <Building2 size={13} style={{ color: 'var(--color-brand-primary)' }} />}
                  <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || user?.email}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      backgroundColor: isSeller ? 'rgba(255,255,255,0.15)' : 'var(--color-slate-200)',
                      color: isSeller ? 'white' : 'var(--color-slate-700)'
                    }}
                  >
                    {user?.role}
                  </span>
                </div>

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={logout}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
                  title="Sign out of current account"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

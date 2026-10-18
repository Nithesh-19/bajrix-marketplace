// src/pages/CartPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  FileText,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import ImageWithFallback from '../components/ImageWithFallback';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    uniqueSellersCount,
    freight,
    tax,
    grandTotal,
    hasMoqViolations,
    moqViolations
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <div className="empty-state" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <ShoppingCart className="empty-state-icon" style={{ width: '56px', height: '56px' }} />
          <h2 className="empty-state-title">Your Material Cart is Empty</h2>
          <p className="empty-state-desc">
            Discover construction materials, compare real-time seller pricing, and add supplies to
            your site dispatch cart.
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '8px' }}>
            Browse Materials Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 0 64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-slate-900)' }}>
            Materials Procurement Cart
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-slate-500)', marginTop: '2px' }}>
            Review quantities, MOQ limits, and multi-supplier dispatch estimates.
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="btn btn-outline btn-sm"
          style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-border)' }}
        >
          <Trash2 size={13} />
          <span>Clear All Items</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="cart-grid-layout">
        {/* Left column: Cart Items list */}
        <div>
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid var(--color-slate-200)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-slate-200)', backgroundColor: 'var(--color-slate-50)', fontSize: '12px', fontWeight: 600, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
              Selected Materials ({items.length} Line Items)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map((item) => (
                <div
                  key={item.listingId}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    borderBottom: '1px solid var(--color-slate-100)',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          backgroundColor: 'var(--color-slate-100)',
                          flexShrink: 0
                        }}
                      >
                        <ImageWithFallback
                          src={item.productImageUrl}
                          alt={item.productName}
                          productId={item.productId}
                          category={item.productCategory}
                          height="100%"
                        />
                      </div>

                      <div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--color-brand-primary)',
                            textTransform: 'uppercase'
                          }}
                        >
                          {item.productCategory}
                        </span>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                          <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                        </h3>
                        <div style={{ fontSize: '12px', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                          Supplier: <strong>{item.sellerName}</strong> ({item.sellerLocation})
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.listingId)}
                      className="btn-icon"
                      style={{ color: 'var(--color-slate-400)', padding: '4px' }}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                      paddingTop: '12px',
                      borderTop: '1px dashed var(--color-slate-100)'
                    }}
                  >
                    {/* Quantity controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--color-slate-500)' }}>Quantity:</span>
                        <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--color-slate-300)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.listingId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            style={{ padding: '6px 10px', backgroundColor: 'var(--color-slate-50)' }}
                            aria-label="Decrease quantity by 1"
                          >
                            <Minus size={13} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.availableStock}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.listingId, e.target.value)}
                            style={{
                              width: '70px',
                              textAlign: 'center',
                              border: 'none',
                              fontWeight: 700,
                              fontSize: '13px',
                              outline: 'none'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.listingId, item.quantity + 1)}
                            disabled={item.quantity >= item.availableStock}
                            style={{ padding: '6px 10px', backgroundColor: 'var(--color-slate-50)' }}
                            aria-label="Increase quantity by 1"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--color-slate-500)' }}>
                          {item.productUnit}s (MOQ: {item.minOrderQuantity})
                        </span>
                      </div>

                      {item.quantity < item.minOrderQuantity ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '11px', fontWeight: 600 }}>
                          <AlertCircle size={13} />
                          Below seller MOQ ({item.minOrderQuantity} {item.productUnit}s). Need {item.minOrderQuantity - item.quantity} more to order.
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                          <span>✓ Meets Seller MOQ ({item.minOrderQuantity} {item.productUnit}s)</span>
                        </div>
                      )}
                    </div>

                    {/* Pricing */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: 'var(--color-slate-500)' }}>
                        ₹{item.unitPrice.toLocaleString('en-IN')} × {item.quantity}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-slate-900)' }}>
                        ₹{item.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Order Summary Card */}
        <div>
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid var(--color-slate-200)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              position: 'sticky',
              top: '90px'
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '16px' }}>
              Order Financial Summary
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--color-slate-600)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Materials Subtotal:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span title="₹500 per supplier yard dispatch. Free over ₹50,000">
                  Logistics & Site Dispatch ({uniqueSellersCount} {uniqueSellersCount === 1 ? 'Supplier' : 'Suppliers'}):
                </span>
                <span style={{ fontWeight: 600, color: freight === 0 ? 'var(--color-success)' : 'var(--color-slate-900)' }}>
                  {freight === 0 ? 'FREE DISPATCH' : `₹${freight.toLocaleString('en-IN')}`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST (18% Construction Goods):</span>
                <span style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                  ₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--color-slate-200)',
                  paddingTop: '16px',
                  marginTop: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline'
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-slate-900)' }}>
                  Total Estimated Value:
                </span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-slate-900)' }}>
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {hasMoqViolations && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '12px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 'var(--radius-md)',
                  color: '#92400e',
                  fontSize: '12px',
                  lineHeight: 1.4
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
                  <AlertCircle size={15} style={{ color: '#d97706' }} />
                  <span>Minimum Order Quantity Notice</span>
                </div>
                <div>
                  {moqViolations.length} item(s) do not yet meet the seller's minimum order requirement. Please increase quantities before proceeding to checkout.
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={hasMoqViolations}
              onClick={() => navigate('/checkout')}
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: hasMoqViolations ? '12px' : '24px',
                padding: '12px',
                fontSize: '15px',
                opacity: hasMoqViolations ? 0.6 : 1,
                cursor: hasMoqViolations ? 'not-allowed' : 'pointer'
              }}
            >
              <span>Proceed to Site Delivery Details</span>
              <ArrowRight size={16} />
            </button>

            {/* B2B Assurance badges */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-slate-100)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--color-slate-500)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} style={{ color: 'var(--color-success)' }} />
                <span>GST Tax Invoice & Mill Test Certificates included</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={14} style={{ color: 'var(--color-brand-primary)' }} />
                <span>Direct crane/tipper transit to construction site</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

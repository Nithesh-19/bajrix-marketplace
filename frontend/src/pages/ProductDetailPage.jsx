// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Store,
  MapPin,
  Star,
  CheckCircle2,
  AlertCircle,
  Calculator,
  ArrowUpDown,
  ShoppingCart,
  Zap,
  Info,
  Loader2,
  HardHat
} from 'lucide-react';
import { fetchProductById, fetchProductOffers } from '../services/api';
import ImageWithFallback from '../components/ImageWithFallback';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offerSort, setOfferSort] = useState('price_asc');

  // Quantity Calculator state
  const [calcQuantity, setCalcQuantity] = useState(100);

  // Per-offer quantity state mapping
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([fetchProductById(id), fetchProductOffers(id, offerSort)])
      .then(([prodData, offersData]) => {
        setProduct(prodData);
        setOffers(offersData || []);
        
        // Initialize quantities mapping to 1 unit by default
        const initialQtys = {};
        if (offersData && offersData.length > 0) {
          offersData.forEach((o) => {
            initialQtys[o.id] = 1;
          });
          const minMoq = Math.min(...offersData.map((o) => o.minOrderQuantity));
          setCalcQuantity(Math.max(minMoq, 50));
        }
        setQuantities(initialQtys);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load product details.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, offerSort]);

  const handleQuantityChange = (offerId, val) => {
    const parsed = parseInt(val, 10);
    setQuantities((prev) => ({
      ...prev,
      [offerId]: isNaN(parsed) || parsed < 1 ? 1 : parsed
    }));
  };

  const handleAddToCart = (offer, customQty = null) => {
    const qty = customQty !== null ? customQty : (quantities[offer.id] || 1);
    addToCart(product, offer, qty);
  };

  const handleBuyNow = (offer, customQty = null) => {
    const qty = customQty !== null ? customQty : (quantities[offer.id] || 1);
    if (qty < offer.minOrderQuantity) {
      showToast(`Minimum order requirement for ${offer.sellerName} is ${offer.minOrderQuantity} ${product.unit}s for checkout.`, 'warning');
      return;
    }
    const added = addToCart(product, offer, qty);
    if (added) {
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <Loader2 size={36} className="spin-animate" style={{ color: 'var(--color-brand-primary)', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--color-slate-600)', fontWeight: 500 }}>Loading product & seller offers...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '48px 0' }}>
        <div className="empty-state" style={{ borderColor: 'var(--color-danger)' }}>
          <AlertCircle className="empty-state-icon" style={{ color: 'var(--color-danger)' }} />
          <h2 className="empty-state-title">Product Not Found</h2>
          <p className="empty-state-desc">{error || 'The requested product could not be found in the catalogue.'}</p>
          <Link to="/" className="btn btn-primary">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const hasOffers = offers && offers.length > 0;
  const lowestPriceOffer = offers.find((o) => o.isLowestPrice) || offers[0];

  return (
    <div className="container product-detail-layout">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Marketplace</Link>
        <ChevronRight size={14} />
        <span>{product.category}</span>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--color-slate-800)', fontWeight: 600 }}>{product.name}</span>
      </nav>

      {/* Product Overview Header Card */}
      <section className="product-header-card">
        <div className="product-detail-img-box">
          <ImageWithFallback
            src={product.imageUrl}
            alt={product.name}
            productId={product.id}
            category={product.category}
            height="100%"
          />
        </div>

        <div className="product-detail-info">
          <div className="product-meta-row">
            <span className="meta-pill" style={{ backgroundColor: 'var(--color-slate-900)', color: 'white' }}>
              {product.category}
            </span>
            <span className="meta-pill">Standard Unit: {product.unit}</span>
            <span className="meta-pill" style={{ color: hasOffers ? 'var(--color-success-text)' : 'var(--color-slate-500)' }}>
              {hasOffers ? `${offers.length} Active Sellers Offering` : 'No Active Offers'}
            </span>
          </div>

          <h1 className="product-detail-title">{product.name}</h1>
          <p className="product-description-full">{product.description}</p>

          {/* Pricing Highlight Box */}
          <div className="best-price-callout" style={{ flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-slate-500)', fontWeight: 600 }}>
                {hasOffers ? 'Best Available Market Price' : 'Market Status'}
              </div>
              {hasOffers ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-slate-900)' }}>
                    ₹{Number(lowestPriceOffer?.price || product.minPrice).toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--color-slate-600)' }}>/ {product.unit}</span>
                </div>
              ) : (
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-slate-600)', marginTop: '4px' }}>
                  Currently Out of Stock from Approved Sellers
                </div>
              )}
              {hasOffers && (
                <div style={{ fontSize: '12px', color: 'var(--color-slate-600)', marginTop: '4px' }}>
                  Supplied by <strong>{lowestPriceOffer?.sellerName}</strong> ({lowestPriceOffer?.sellerLocation})
                </div>
              )}
            </div>

            {hasOffers && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleAddToCart(lowestPriceOffer)}
                  className="btn btn-outline"
                  style={{ gap: '6px' }}
                >
                  <ShoppingCart size={16} />
                  <span>Add to Cart</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBuyNow(lowestPriceOffer)}
                  className="btn btn-primary"
                  style={{ gap: '6px' }}
                >
                  <Zap size={16} />
                  <span>Buy Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic Quantity Cost Calculator */}
      {hasOffers && (
        <section className="calculator-card">
          <div className="calculator-header">
            <Calculator size={20} style={{ color: 'var(--color-brand-primary)' }} />
            <span>Interactive Bulk Order Cost Calculator</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-slate-600)', marginBottom: '14px' }}>
            Enter your site's required volume to instantly calculate total estimated cost, stock
            fulfillment feasibility, and savings across all eligible sellers.
          </p>

          <div className="calculator-input-row">
            <label htmlFor="calc-qty-input" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-slate-700)' }}>
              Required Quantity ({product.unit}s):
            </label>
            <input
              id="calc-qty-input"
              type="number"
              min="1"
              value={calcQuantity}
              onChange={(e) => setCalcQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="calc-input"
            />
          </div>

          <div className="calculator-results-grid">
            {offers.map((offer) => {
              const totalCost = Number(offer.price) * calcQuantity;
              const hasEnoughStock = offer.availableStock >= calcQuantity;
              const meetsMoq = calcQuantity >= offer.minOrderQuantity;

              return (
                <div
                  key={offer.id}
                  className={`calc-result-box ${offer.isLowestPrice ? 'best' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--color-slate-900)' }}>
                      {offer.sellerName}
                    </strong>
                    {offer.isLowestPrice && (
                      <span className="lowest-price-badge" style={{ fontSize: '10px' }}>
                        Best Value
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '4px' }}>
                    ₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--color-slate-500)' }}>
                    ₹{Number(offer.price).toLocaleString('en-IN')} × {calcQuantity} {product.unit}s
                  </div>

                  <div style={{ marginTop: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ color: hasEnoughStock ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {hasEnoughStock ? `✓ ${offer.availableStock} in stock` : `✗ Insufficient stock (${offer.availableStock} on hand)`}
                    </span>
                    <span style={{ color: meetsMoq ? 'var(--color-slate-600)' : 'var(--color-warning)' }}>
                      {meetsMoq ? `✓ Meets MOQ of ${offer.minOrderQuantity}` : `⚠ Below MOQ of ${offer.minOrderQuantity}`}
                    </span>
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      disabled={!hasEnoughStock || !meetsMoq}
                      onClick={() => handleAddToCart(offer, calcQuantity)}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1 }}
                    >
                      Add {calcQuantity} to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Seller Offers Comparison Table */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div className="comparison-title">
            <Store size={22} style={{ color: 'var(--color-brand-primary)' }} />
            <span>Available Seller Offers ({offers.length})</span>
          </div>

          {hasOffers && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-slate-500)', fontWeight: 500 }}>
                Sort offers:
              </span>
              <select
                value={offerSort}
                onChange={(e) => setOfferSort(e.target.value)}
                className="sort-select"
                style={{ padding: '4px 28px 4px 8px', fontSize: '12px' }}
                aria-label="Sort seller offers"
              >
                <option value="price_asc">Lowest Price First</option>
                <option value="price_desc">Highest Price First</option>
                <option value="stock_desc">Highest Stock First</option>
                <option value="rating_desc">Highest Rating First</option>
              </select>
            </div>
          )}
        </div>

        {!hasOffers ? (
          <div className="empty-state">
            <HardHat className="empty-state-icon" />
            <h3 className="empty-state-title">No Active Offers Available</h3>
            <p className="empty-state-desc">
              There are currently no active listings from verified and approved sellers for this
              catalogue product. Offers from pending or rejected sellers are strictly hidden in accordance with
              marketplace safety compliance.
            </p>
            <Link to="/seller" className="btn btn-outline">
              Switch to Seller Portal to Create a Listing
            </Link>
          </div>
        ) : (
          <div className="offers-table-wrap">
            <table className="offers-table">
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Unit Price</th>
                  <th>Available Stock</th>
                  <th>Min Order (MOQ)</th>
                  <th>Order Quantity</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => {
                  const currentQty = quantities[offer.id] || 1;
                  const meetsMoq = currentQty >= offer.minOrderQuantity;

                  return (
                    <tr key={offer.id} className={offer.isLowestPrice ? 'highlight-row' : ''}>
                      {/* Seller details */}
                      <td>
                        <div className="seller-name-cell">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{offer.sellerName}</span>
                            {offer.isLowestPrice && (
                              <span className="lowest-price-badge">Lowest Price</span>
                            )}
                          </div>
                          {offer.sellerLocation && (
                            <span className="seller-location-sub">
                              <MapPin size={12} /> {offer.sellerLocation}
                            </span>
                          )}
                          <span className="seller-rating-pill">
                            <Star size={11} fill="currentColor" /> {offer.sellerRating} / 5.0
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td>
                        <div>
                          <strong style={{ fontSize: '17px', color: 'var(--color-slate-900)' }}>
                            ₹{Number(offer.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </strong>
                          <span style={{ fontSize: '12px', color: 'var(--color-slate-500)', marginLeft: '3px' }}>
                            / {product.unit}
                          </span>
                        </div>
                      </td>

                      {/* Stock */}
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            color: offer.availableStock > 0 ? 'var(--color-slate-900)' : 'var(--color-danger)'
                          }}
                        >
                          {Number(offer.availableStock).toLocaleString('en-IN')} {product.unit}s
                        </span>
                      </td>

                      {/* MOQ */}
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--color-slate-700)' }}>
                          {offer.minOrderQuantity} {product.unit}s
                        </span>
                      </td>

                      {/* Quantity input */}
                      <td>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              min="1"
                              max={offer.availableStock}
                              value={currentQty}
                              onChange={(e) => handleQuantityChange(offer.id, e.target.value)}
                              style={{
                                width: '70px',
                                padding: '4px 8px',
                                border: '1px solid var(--color-slate-300)',
                                borderRadius: 'var(--radius-sm)',
                                fontWeight: 600,
                                fontSize: '13px'
                              }}
                            />
                            <span style={{ fontSize: '12px', color: 'var(--color-slate-500)' }}>
                              {product.unit}s
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', marginTop: '4px' }}>
                            {!meetsMoq ? (
                              <span style={{ color: '#d97706', fontWeight: 600 }}>
                                ⚠️ Below MOQ ({offer.minOrderQuantity})
                              </span>
                            ) : (
                              <span style={{ color: '#16a34a', fontWeight: 500 }}>
                                ✓ Meets MOQ
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(offer)}
                            className="btn btn-sm btn-outline"
                            title="Add to Purchase Cart"
                          >
                            <ShoppingCart size={14} />
                            <span>Add</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBuyNow(offer)}
                            className={`btn btn-sm ${offer.isLowestPrice ? 'btn-primary' : 'btn-secondary'}`}
                            title="Immediate Checkout"
                          >
                            <Zap size={14} />
                            <span>Buy</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

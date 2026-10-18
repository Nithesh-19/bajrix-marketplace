// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

export default function ProductCard({ product }) {
  const hasOffers = product.hasOffers && product.availableOffersCount > 0;

  return (
    <article className="product-card">
      <div className="product-card-image-wrap">
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.name}
          productId={product.id}
          category={product.category}
          className="product-card-img"
        />
        <span className="product-category-badge">{product.category}</span>
      </div>

      <div className="product-card-body">
        <h2 className="product-title" title={product.name}>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h2>
        <p className="product-desc">{product.description}</p>

        <div className="product-pricing-section">
          {hasOffers ? (
            <>
              <div className="price-label">Starting from</div>
              <div className="price-value-row">
                <span className="price-amount">
                  ₹{Number(product.minPrice).toLocaleString('en-IN')}
                  <span className="price-unit">/ {product.unit}</span>
                </span>
              </div>
            </>
          ) : (
            <div>
              <div className="price-label">Availability</div>
              <div className="no-offers-badge">No active seller offers</div>
            </div>
          )}
        </div>

        <div className="card-footer-info">
          <span className={`seller-count-tag ${hasOffers ? 'has-sellers' : ''}`}>
            <Store size={14} />
            {product.availableOffersCount}{' '}
            {product.availableOffersCount === 1 ? 'Seller' : 'Sellers'}
          </span>

          <Link
            to={`/products/${product.id}`}
            className="btn btn-primary btn-sm"
            aria-label={`Compare offers for ${product.name}`}
          >
            <span>Compare</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}

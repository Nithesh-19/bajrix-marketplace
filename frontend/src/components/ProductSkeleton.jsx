// src/components/ProductSkeleton.jsx
import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="product-card" style={{ pointerEvents: 'none' }}>
      <div className="skeleton" style={{ height: '180px', width: '100%', borderRadius: 0 }} />
      <div className="product-card-body" style={{ gap: '10px' }}>
        <div className="skeleton" style={{ height: '20px', width: '75%' }} />
        <div className="skeleton" style={{ height: '14px', width: '90%' }} />
        <div className="skeleton" style={{ height: '14px', width: '60%' }} />
        <div className="product-pricing-section" style={{ marginTop: '16px' }}>
          <div className="skeleton" style={{ height: '12px', width: '40%', marginBottom: '6px' }} />
          <div className="skeleton" style={{ height: '24px', width: '55%' }} />
        </div>
      </div>
    </div>
  );
}

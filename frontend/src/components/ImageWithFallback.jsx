// src/components/ImageWithFallback.jsx
import React, { useState } from 'react';
import { HardHat, Package, Layers, Droplets, Zap, Wrench } from 'lucide-react';
import { PRODUCT_IMAGE_FALLBACKS, CATEGORY_IMAGE_DEFAULTS } from '../services/productImages';

function getCategoryIcon(category) {
  switch (category) {
    case 'Cement':
    case 'Bricks & Blocks':
      return <Package size={32} strokeWidth={1.5} />;
    case 'Steel & TMT':
    case 'Sand & Aggregates':
      return <Layers size={32} strokeWidth={1.5} />;
    case 'Chemicals':
      return <Droplets size={32} strokeWidth={1.5} />;
    case 'Electrical':
      return <Zap size={32} strokeWidth={1.5} />;
    case 'Plumbing':
      return <Wrench size={32} strokeWidth={1.5} />;
    default:
      return <HardHat size={32} strokeWidth={1.5} />;
  }
}

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  height,
  productId,
  category
}) {
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Determine effective image source
  let effectiveSrc = src;

  // Upgrade legacy or mismatched seed URLs
  if (productId && PRODUCT_IMAGE_FALLBACKS[productId]) {
    effectiveSrc = PRODUCT_IMAGE_FALLBACKS[productId];
  } else if (!effectiveSrc && category && CATEGORY_IMAGE_DEFAULTS[category]) {
    effectiveSrc = CATEGORY_IMAGE_DEFAULTS[category];
  }

  if (hasError || !effectiveSrc) {
    return (
      <div
        className={`image-fallback-box ${className}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-slate-100)',
          color: 'var(--color-slate-400)',
          height: height || '100%',
          width: '100%',
          minHeight: '120px',
          padding: '16px',
          textAlign: 'center'
        }}
      >
        {getCategoryIcon(category)}
        <span
          style={{
            fontSize: '11px',
            marginTop: '8px',
            fontWeight: 600,
            color: 'var(--color-slate-600)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {category || 'BajriX Material'}
        </span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: height || '100%', overflow: 'hidden' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'var(--color-slate-200)',
            animation: 'pulse 1.5s infinite ease-in-out'
          }}
        />
      )}
      <img
        src={effectiveSrc}
        alt={alt || 'Construction material'}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.2s ease-in-out'
        }}
        loading="lazy"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}

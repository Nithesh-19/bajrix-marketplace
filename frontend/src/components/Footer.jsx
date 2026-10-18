// src/components/Footer.jsx
import React from 'react';
import { HardHat, ShieldCheck, Truck, BarChart3 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div className="brand-icon" style={{ padding: '4px' }}>
                <HardHat size={16} />
              </div>
              <h3>BajriX Materials</h3>
            </div>
            <p style={{ color: 'var(--color-slate-400)', fontSize: '13px', lineHeight: 1.6 }}>
              India's transparent multi-seller construction materials exchange. Directly connecting
              infrastructure contractors, home builders, and fabricators with certified suppliers.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--color-white)', fontSize: '14px', marginBottom: '12px' }}>
              Marketplace Guarantees
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} style={{ color: 'var(--color-success)' }} />
                <span>Verified & Approved Sellers Only</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart3 size={14} style={{ color: 'var(--color-steel)' }} />
                <span>Transparent Multi-Seller Offer Comparison</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={14} style={{ color: 'var(--color-brand-primary)' }} />
                <span>Direct Factory & Yard Dispatch</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--color-white)', fontSize: '14px', marginBottom: '12px' }}>
              Materials Catalogue
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '12px' }}>
              <span className="category-chip">Cement</span>
              <span className="category-chip">Steel & TMT</span>
              <span className="category-chip">Bricks & Blocks</span>
              <span className="category-chip">Sand & Aggregates</span>
              <span className="category-chip">Plumbing</span>
              <span className="category-chip">Electrical</span>
              <span className="category-chip">Chemicals</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} BajriX Infrastructure Technologies. Full-Stack Challenge Edition.
          </div>
          <div style={{ color: 'var(--color-slate-500)', fontSize: '11px' }}>
            Stack: React (Vite) • Spring Boot 3.3.4 (Java 21) • PostgreSQL 17 • Flyway
          </div>
        </div>
      </div>
    </footer>
  );
}

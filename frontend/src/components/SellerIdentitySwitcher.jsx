// src/components/SellerIdentitySwitcher.jsx
import React from 'react';
import { useSeller } from '../context/SellerContext';
import { useToast } from '../context/ToastContext';
import { UserCheck, Clock, XCircle, ShieldCheck } from 'lucide-react';

export default function SellerIdentitySwitcher() {
  const { sellersList, currentSellerId, currentSeller, switchSeller } = useSeller();
  const { showToast } = useToast();

  const handleSelect = (e) => {
    const newId = e.target.value;
    switchSeller(newId);
    const chosen = sellersList.find((s) => String(s.id) === String(newId));
    if (chosen) {
      showToast(`Switched active seller to: ${chosen.name} (${chosen.sellerStatus})`, 'info', 3000);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <UserCheck size={14} style={{ color: 'var(--color-success)' }} />;
      case 'PENDING':
        return <Clock size={14} style={{ color: 'var(--color-warning)' }} />;
      case 'REJECTED':
        return <XCircle size={14} style={{ color: 'var(--color-danger)' }} />;
      default:
        return <ShieldCheck size={14} />;
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <label
        htmlFor="seller-identity-select"
        style={{
          display: 'none',
          fontSize: '11px',
          color: 'var(--color-slate-400)',
          textTransform: 'uppercase'
        }}
      >
        Active Seller:
      </label>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--color-slate-800)',
          border: '1px solid var(--color-slate-700)',
          borderRadius: 'var(--radius-md)',
          padding: '4px 8px'
        }}
      >
        {getStatusIcon(currentSeller?.sellerStatus)}
        <select
          id="seller-identity-select"
          value={currentSellerId}
          onChange={handleSelect}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--color-slate-100)',
            fontSize: '12px',
            fontWeight: 500,
            outline: 'none',
            cursor: 'pointer'
          }}
          title="Reviewer Switcher: Select active mock seller identity"
        >
          {sellersList.map((seller) => (
            <option
              key={seller.id}
              value={seller.id}
              style={{ backgroundColor: 'var(--color-slate-900)', color: 'var(--color-slate-100)' }}
            >
              Seller #{seller.id}: {seller.name} [{seller.sellerStatus}]
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

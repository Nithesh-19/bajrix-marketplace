// src/components/ConfirmDialog.jsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ isOpen, title, message, confirmText = 'Confirm', onConfirm, onCancel, isDanger = true }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-dialog" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} style={{ color: isDanger ? 'var(--color-danger)' : 'var(--color-warning)' }} />
            <h3 className="modal-title" style={{ fontSize: '16px' }}>{title}</h3>
          </div>
          <button onClick={onCancel} className="btn-icon" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '14px', color: 'var(--color-slate-600)', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

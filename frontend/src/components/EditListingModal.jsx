// src/components/EditListingModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Edit3, AlertCircle, Loader2 } from 'lucide-react';
import { updateSellerListing } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function EditListingModal({ isOpen, onClose, sellerId, listing, onListingUpdated }) {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  const [formData, setFormData] = useState({
    price: '',
    availableStock: '',
    minOrderQuantity: '',
    active: true
  });

  useEffect(() => {
    if (listing && isOpen) {
      setFormData({
        price: String(listing.price || ''),
        availableStock: String(listing.availableStock ?? ''),
        minOrderQuantity: String(listing.minOrderQuantity ?? ''),
        active: Boolean(listing.active)
      });
      setErrors({});
      setGlobalError('');
    }
  }, [listing, isOpen]);

  if (!isOpen || !listing) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');

    // Client-side quick check
    const clientErrors = {};
    if (!formData.price || Number(formData.price) <= 0) clientErrors.price = 'Price must be greater than zero';
    if (formData.availableStock === '' || Number(formData.availableStock) < 0) clientErrors.availableStock = 'Stock cannot be negative';
    if (!formData.minOrderQuantity || Number(formData.minOrderQuantity) < 1) clientErrors.minOrderQuantity = 'MOQ must be at least 1';
    if (Number(formData.availableStock) > 0 && Number(formData.availableStock) < Number(formData.minOrderQuantity)) {
      clientErrors.availableStock = `Stock cannot be less than MOQ (${formData.minOrderQuantity}) when stock is positive`;
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        price: Number(formData.price),
        availableStock: Number(formData.availableStock),
        minOrderQuantity: Number(formData.minOrderQuantity),
        active: formData.active,
        version: listing.version // Optimistic locking token
      };

      const result = await updateSellerListing(sellerId, listing.id, payload);
      showToast('Listing updated successfully!', 'success');
      onListingUpdated(result);
      onClose();
    } catch (err) {
      if (err.status === 409) {
        setGlobalError('Concurrent modification detected: Another update was made to this listing. Please close and reload.');
      } else if (err.validationErrors && err.validationErrors.length > 0) {
        const backendErrors = {};
        err.validationErrors.forEach((fe) => {
          backendErrors[fe.field] = fe.message;
        });
        setErrors(backendErrors);
      } else {
        setGlobalError(err.message || 'Failed to update listing');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-dialog">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={20} style={{ color: 'var(--color-steel)' }} />
            <h2 className="modal-title">Edit Listing: {listing.productName}</h2>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {globalError && (
              <div className="alert-banner danger" style={{ marginBottom: '16px' }}>
                <AlertCircle size={18} />
                <span>{globalError}</span>
              </div>
            )}

            <div
              style={{
                backgroundColor: 'var(--color-slate-50)',
                border: '1px solid var(--color-slate-200)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '13px',
                color: 'var(--color-slate-700)'
              }}
            >
              <div>
                <strong>Product:</strong> {listing.productName}
              </div>
              <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--color-slate-500)' }}>
                <strong>Category:</strong> {listing.productCategory} | <strong>Unit:</strong> {listing.productUnit} | <strong>Lock Version:</strong> #{listing.version}
              </div>
            </div>

            {/* Price */}
            <div className="form-group">
              <label htmlFor="edit-price" className="form-label">
                Unit Price (₹ per {listing.productUnit})
              </label>
              <input
                type="number"
                id="edit-price"
                name="price"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={handleChange}
                className={`form-control ${errors.price ? 'has-error' : ''}`}
              />
              {errors.price && <p className="form-error">{errors.price}</p>}
            </div>

            {/* Stock & MOQ row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="edit-availableStock" className="form-label">
                  Available Stock
                </label>
                <input
                  type="number"
                  id="edit-availableStock"
                  name="availableStock"
                  min="0"
                  value={formData.availableStock}
                  onChange={handleChange}
                  className={`form-control ${errors.availableStock ? 'has-error' : ''}`}
                />
                {errors.availableStock && <p className="form-error">{errors.availableStock}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="edit-minOrderQuantity" className="form-label">
                  Minimum Order (MOQ)
                </label>
                <input
                  type="number"
                  id="edit-minOrderQuantity"
                  name="minOrderQuantity"
                  min="1"
                  value={formData.minOrderQuantity}
                  onChange={handleChange}
                  className={`form-control ${errors.minOrderQuantity ? 'has-error' : ''}`}
                />
                {errors.minOrderQuantity && <p className="form-error">{errors.minOrderQuantity}</p>}
              </div>
            </div>

            {/* Active checkbox */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <input
                type="checkbox"
                id="edit-active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="edit-active" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-slate-800)', cursor: 'pointer' }}>
                Listing is Active and visible to buyers (if seller account is approved)
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin-animate" /> Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

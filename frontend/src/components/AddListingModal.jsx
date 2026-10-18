// src/components/AddListingModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { fetchProducts, createSellerListing } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AddListingModal({ isOpen, onClose, sellerId, onListingCreated }) {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  const [formData, setFormData] = useState({
    productId: '',
    price: '',
    availableStock: '',
    minOrderQuantity: '',
    active: true
  });

  useEffect(() => {
    if (isOpen) {
      setLoadingProducts(true);
      setErrors({});
      setGlobalError('');
      fetchProducts({ size: 50 })
        .then((data) => {
          setProducts(data?.content || []);
          if (data?.content?.length > 0 && !formData.productId) {
            setFormData((prev) => ({ ...prev, productId: String(data.content[0].id) }));
          }
        })
        .catch((err) => {
          setGlobalError('Failed to load catalogue products');
        })
        .finally(() => {
          setLoadingProducts(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const selectedProduct = products.find((p) => String(p.id) === String(formData.productId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');

    // Client-side quick check
    const clientErrors = {};
    if (!formData.productId) clientErrors.productId = 'Please select a product';
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
        productId: Number(formData.productId),
        price: Number(formData.price),
        availableStock: Number(formData.availableStock),
        minOrderQuantity: Number(formData.minOrderQuantity),
        active: formData.active
      };

      const result = await createSellerListing(sellerId, payload);
      showToast('Product listing published successfully!', 'success');
      onListingCreated(result);
      onClose();
    } catch (err) {
      if (err.validationErrors && err.validationErrors.length > 0) {
        const backendErrors = {};
        err.validationErrors.forEach((fe) => {
          backendErrors[fe.field] = fe.message;
        });
        setErrors(backendErrors);
      } else {
        setGlobalError(err.message || 'Failed to create listing');
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
            <Plus size={20} style={{ color: 'var(--color-brand-primary)' }} />
            <h2 className="modal-title">Publish New Product Listing</h2>
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

            {/* Product selection */}
            <div className="form-group">
              <label htmlFor="productId" className="form-label">
                Select Catalogue Product
              </label>
              {loadingProducts ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', fontSize: '13px', color: 'var(--color-slate-500)' }}>
                  <Loader2 size={16} className="spin-animate" /> Loading catalogue...
                </div>
              ) : (
                <select
                  id="productId"
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  className={`form-control ${errors.productId ? 'has-error' : ''}`}
                >
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({prod.category}) — {prod.unit}
                    </option>
                  ))}
                </select>
              )}
              {errors.productId && <p className="form-error">{errors.productId}</p>}
            </div>

            {selectedProduct && (
              <div
                style={{
                  backgroundColor: 'var(--color-slate-50)',
                  border: '1px solid var(--color-slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  color: 'var(--color-slate-600)'
                }}
              >
                <strong>Unit of Measure:</strong> {selectedProduct.unit} |{' '}
                <strong>Category:</strong> {selectedProduct.category}
                {selectedProduct.hasOffers && (
                  <span>
                    {' '}
                    | <strong>Market Min Price:</strong> ₹
                    {Number(selectedProduct.minPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Selling Price (₹ per {selectedProduct?.unit || 'unit'})
              </label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0.01"
                placeholder="e.g. 390.00"
                value={formData.price}
                onChange={handleChange}
                className={`form-control ${errors.price ? 'has-error' : ''}`}
              />
              {errors.price && <p className="form-error">{errors.price}</p>}
            </div>

            {/* Stock & MOQ row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="availableStock" className="form-label">
                  Available Stock
                </label>
                <input
                  type="number"
                  id="availableStock"
                  name="availableStock"
                  min="0"
                  placeholder="e.g. 500"
                  value={formData.availableStock}
                  onChange={handleChange}
                  className={`form-control ${errors.availableStock ? 'has-error' : ''}`}
                />
                {errors.availableStock && <p className="form-error">{errors.availableStock}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="minOrderQuantity" className="form-label">
                  Minimum Order (MOQ)
                </label>
                <input
                  type="number"
                  id="minOrderQuantity"
                  name="minOrderQuantity"
                  min="1"
                  placeholder="e.g. 25"
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
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="active" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-slate-800)', cursor: 'pointer' }}>
                Listing is Active and ready for order dispatch
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
                  <Loader2 size={16} className="spin-animate" /> Publishing...
                </>
              ) : (
                'Publish Listing'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

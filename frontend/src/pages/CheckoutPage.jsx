// src/pages/CheckoutPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { createPurchaseOrder } from '../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { items, subtotal, freight, tax, grandTotal, clearCart } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    buyerName: 'Larsen Infra Contracting Ltd',
    buyerPhone: '+91 98200 45678',
    buyerEmail: 'procurement@larsengroup.in',
    projectSiteName: 'Skyline Commercial Park - Tower B',
    deliveryAddress: 'Plot C-14, Trans-Thane Creek Industrial Area, Turbhe',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    pincode: '400705',
    siteUnloadingNotes: 'Heavy 10-wheel tippers and trailers permitted. Hydraulic crane available on-site between 8:00 AM - 6:00 PM.',
    paymentMethod: 'RTGS_NEFT'
  });

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <div className="empty-state" style={{ maxWidth: '420px', margin: '0 auto' }}>
          <AlertCircle className="empty-state-icon" style={{ color: 'var(--color-warning)' }} />
          <h2 className="empty-state-title">No Materials Selected</h2>
          <p className="empty-state-desc">Your cart is empty. Please add construction supplies before checkout.</p>
          <Link to="/" className="btn btn-primary">
            Return to Materials Catalogue
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setFieldErrors({});

    // Client-side required fields validation
    const required = ['buyerName', 'buyerPhone', 'buyerEmail', 'deliveryAddress', 'city', 'state', 'pincode', 'paymentMethod'];
    const errors = {};
    required.forEach((f) => {
      if (!formData[f] || !formData[f].trim()) {
        errors[f] = 'This field is required';
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast('Please fill all required site delivery details', 'warning');
      return;
    }

    // Validate Minimum Order Quantities before allowing checkout
    const belowMoq = items.filter((i) => i.quantity < i.minOrderQuantity);
    if (belowMoq.length > 0) {
      const msg = `Cannot place order: ${belowMoq[0].productName} requires a minimum order quantity of ${belowMoq[0].minOrderQuantity} ${belowMoq[0].productUnit}s.`;
      setGlobalError(msg);
      showToast(msg, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        buyerName: formData.buyerName.trim(),
        buyerPhone: formData.buyerPhone.trim(),
        buyerEmail: formData.buyerEmail.trim(),
        projectSiteName: formData.projectSiteName.trim(),
        deliveryAddress: formData.deliveryAddress.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        siteUnloadingNotes: formData.siteUnloadingNotes.trim(),
        paymentMethod: formData.paymentMethod,
        items: items.map((i) => ({
          listingId: i.listingId,
          quantity: i.quantity
        }))
      };

      const orderResult = await createPurchaseOrder(payload);
      showToast(`Purchase Order ${orderResult.orderNumber} generated successfully!`, 'success');
      clearCart();
      navigate(`/order-confirmation/${orderResult.orderNumber}`);
    } catch (err) {
      if (err.validationErrors && err.validationErrors.length > 0) {
        const backendErrors = {};
        err.validationErrors.forEach((fe) => {
          backendErrors[fe.field] = fe.message;
        });
        setFieldErrors(backendErrors);
        showToast('Please fix validation errors below', 'error');
      } else {
        setGlobalError(err.message || 'Failed to place purchase order. Please verify stock availability.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '32px 0 64px' }}>
      <Link to="/cart" className="nav-link" style={{ width: 'fit-content', padding: '0 0 16px 0', color: 'var(--color-slate-500)' }}>
        <ArrowLeft size={16} />
        <span>Return to Cart</span>
      </Link>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-slate-900)' }}>
          Purchase Order & Site Dispatch Checkout
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-slate-500)', marginTop: '4px' }}>
          Finalize site delivery destination, crane access details, and commercial payment terms.
        </p>
      </div>

      {globalError && (
        <div className="alert-banner danger" style={{ marginBottom: '24px' }}>
          <AlertCircle size={20} />
          <span>{globalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="cart-grid-layout">
          {/* Left Form: Delivery & Buyer Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Buyer Contact Card */}
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--color-slate-200)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Building2 size={20} style={{ color: 'var(--color-brand-primary)' }} />
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                  Buyer & Procurement Entity
                </h2>
              </div>

              <div className="form-group">
                <label htmlFor="buyerName" className="form-label">Company / Contractor Name *</label>
                <input
                  type="text"
                  id="buyerName"
                  name="buyerName"
                  value={formData.buyerName}
                  onChange={handleChange}
                  className={`form-control ${fieldErrors.buyerName ? 'has-error' : ''}`}
                />
                {fieldErrors.buyerName && <p className="form-error">{fieldErrors.buyerName}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="buyerPhone" className="form-label">Phone (+91) *</label>
                  <input
                    type="text"
                    id="buyerPhone"
                    name="buyerPhone"
                    value={formData.buyerPhone}
                    onChange={handleChange}
                    className={`form-control ${fieldErrors.buyerPhone ? 'has-error' : ''}`}
                  />
                  {fieldErrors.buyerPhone && <p className="form-error">{fieldErrors.buyerPhone}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="buyerEmail" className="form-label">Official Work Email *</label>
                  <input
                    type="email"
                    id="buyerEmail"
                    name="buyerEmail"
                    value={formData.buyerEmail}
                    onChange={handleChange}
                    className={`form-control ${fieldErrors.buyerEmail ? 'has-error' : ''}`}
                  />
                  {fieldErrors.buyerEmail && <p className="form-error">{fieldErrors.buyerEmail}</p>}
                </div>
              </div>
            </div>

            {/* Site Delivery Card */}
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--color-slate-200)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <MapPin size={20} style={{ color: 'var(--color-brand-primary)' }} />
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                  Construction Site Destination
                </h2>
              </div>

              <div className="form-group">
                <label htmlFor="projectSiteName" className="form-label">Project / Development Name</label>
                <input
                  type="text"
                  id="projectSiteName"
                  name="projectSiteName"
                  value={formData.projectSiteName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. Metro Line 4 Pier Casting Site"
                />
              </div>

              <div className="form-group">
                <label htmlFor="deliveryAddress" className="form-label">Complete Site Delivery Address *</label>
                <textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  rows={2}
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  className={`form-control ${fieldErrors.deliveryAddress ? 'has-error' : ''}`}
                />
                {fieldErrors.deliveryAddress && <p className="form-error">{fieldErrors.deliveryAddress}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="city" className="form-label">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`form-control ${fieldErrors.city ? 'has-error' : ''}`}
                  />
                  {fieldErrors.city && <p className="form-error">{fieldErrors.city}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="state" className="form-label">State *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`form-control ${fieldErrors.state ? 'has-error' : ''}`}
                  />
                  {fieldErrors.state && <p className="form-error">{fieldErrors.state}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="pincode" className="form-label">PIN Code *</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={`form-control ${fieldErrors.pincode ? 'has-error' : ''}`}
                  />
                  {fieldErrors.pincode && <p className="form-error">{fieldErrors.pincode}</p>}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="siteUnloadingNotes" className="form-label">
                  Unloading & Site Access Logistics Instructions
                </label>
                <textarea
                  id="siteUnloadingNotes"
                  name="siteUnloadingNotes"
                  rows={2}
                  value={formData.siteUnloadingNotes}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. Tipper unloading permitted, entry via Gate 2, crane operator contact"
                />
              </div>
            </div>

            {/* Commercial Payment Terms */}
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--color-slate-200)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CreditCard size={20} style={{ color: 'var(--color-brand-primary)' }} />
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                  Commercial Payment Method
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { id: 'RTGS_NEFT', label: 'RTGS / NEFT Direct Bank Transfer', desc: 'Pre-dispatch electronic transfer to seller escrow account' },
                  { id: 'CORPORATE_UPI', label: 'Corporate UPI / Net Banking', desc: 'Instant merchant payment authorization' },
                  { id: 'PROJECT_CREDIT', label: '30-Day Project Credit Line', desc: 'Approved for verified builders & infrastructure contractors' },
                  { id: 'TOKEN_ADVANCE', label: '10% Token Advance + Balance upon Yard Dispatch', desc: 'Inspect at yard before transit dispatch' }
                ].map((opt) => (
                  <label
                    key={opt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 16px',
                      border: '1px solid',
                      borderColor: formData.paymentMethod === opt.id ? 'var(--color-brand-primary)' : 'var(--color-slate-200)',
                      backgroundColor: formData.paymentMethod === opt.id ? 'var(--color-brand-light)' : 'white',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.id}
                      checked={formData.paymentMethod === opt.id}
                      onChange={handleChange}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-slate-900)' }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                        {opt.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Placement */}
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
                Purchase Order Review
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
                {items.map((i) => (
                  <div key={i.listingId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid var(--color-slate-100)', paddingBottom: '8px' }}>
                    <div>
                      <strong style={{ color: 'var(--color-slate-800)' }}>{i.productName}</strong>
                      <div style={{ color: 'var(--color-slate-500)', fontSize: '11px' }}>
                        {i.quantity} {i.productUnit}s @ ₹{i.unitPrice} • {i.sellerName}
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                      ₹{i.totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--color-slate-600)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Materials Subtotal:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                    ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Site Dispatch Freight:</span>
                  <span style={{ fontWeight: 600, color: freight === 0 ? 'var(--color-success)' : 'var(--color-slate-900)' }}>
                    {freight === 0 ? 'FREE' : `₹${freight.toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST (18%):</span>
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
                    Final Payable:
                  </span>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-slate-900)' }}>
                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '24px', padding: '14px', fontSize: '16px' }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="spin-animate" />
                    <span>Transacting Purchase Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Place Official Purchase Order</span>
                  </>
                )}
              </button>

              <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--color-slate-500)', textAlign: 'center', lineHeight: 1.5 }}>
                By placing this PO, inventory is officially reserved in supplier warehouse. Full GST invoice generated upon factory dispatch.
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

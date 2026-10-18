// src/pages/OrderConfirmationPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Printer,
  ShoppingBag,
  Building2,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { fetchPurchaseOrderByNumber } from '../services/api';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchPurchaseOrderByNumber(orderNumber)
      .then((data) => {
        setOrder(data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to retrieve purchase order details.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <Loader2 size={36} className="spin-animate" style={{ color: 'var(--color-brand-primary)', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--color-slate-600)', fontWeight: 500 }}>Generating official purchase order summary...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '48px 0' }}>
        <div className="empty-state" style={{ borderColor: 'var(--color-danger)' }}>
          <AlertCircle className="empty-state-icon" style={{ color: 'var(--color-danger)' }} />
          <h2 className="empty-state-title">Purchase Order Not Found</h2>
          <p className="empty-state-desc">{error || 'Could not find purchase order details.'}</p>
          <Link to="/" className="btn btn-primary">
            Return to Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 0 80px', maxWidth: '840px' }}>
      {/* Success Banner */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid var(--color-slate-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
          marginBottom: '32px'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}
        >
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-slate-900)' }}>
          Purchase Order Confirmed
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-slate-500)', marginTop: '4px' }}>
          Your procurement requisition has been logged and supplier inventory officially reserved.
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-slate-100)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            marginTop: '20px',
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--color-slate-800)'
          }}
        >
          <span>PO Number:</span>
          <span style={{ color: 'var(--color-brand-primary)' }}>{order.orderNumber}</span>
        </div>
      </div>

      {/* PO Details Card (Printable) */}
      <div
        id="printable-po"
        style={{
          backgroundColor: 'white',
          border: '1px solid var(--color-slate-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '32px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '20px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-slate-900)' }}>
              Bajri<span style={{ color: 'var(--color-brand-primary)' }}>X</span> Purchase Requisition
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-slate-500)', marginTop: '4px' }}>
              Materials Exchange • Automated Tax Invoice & Dispatch Advisory
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="seller-status-badge APPROVED" style={{ fontSize: '12px' }}>
              {order.orderStatus}
            </span>
            <div style={{ fontSize: '12px', color: 'var(--color-slate-500)', marginTop: '6px' }}>
              Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Two-column metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-slate-400)', fontWeight: 600, marginBottom: '8px' }}>
              Delivery Destination & Contractor
            </h3>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-slate-900)' }}>
              {order.buyerName}
            </div>
            {order.projectSiteName && (
              <div style={{ fontSize: '13px', color: 'var(--color-brand-primary)', fontWeight: 600 }}>
                {order.projectSiteName}
              </div>
            )}
            <div style={{ fontSize: '13px', color: 'var(--color-slate-600)', marginTop: '4px' }}>
              {order.deliveryAddress}, {order.city}, {order.state} - {order.pincode}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-slate-600)', marginTop: '2px' }}>
              Contact: {order.buyerPhone} | {order.buyerEmail}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-slate-400)', fontWeight: 600, marginBottom: '8px' }}>
              Commercial & Site Access Terms
            </h3>
            <div style={{ fontSize: '13px', color: 'var(--color-slate-700)' }}>
              <strong>Payment Method:</strong> {order.paymentMethod.replace('_', ' ')}
            </div>
            {order.siteUnloadingNotes && (
              <div style={{ fontSize: '13px', color: 'var(--color-slate-600)', marginTop: '6px' }}>
                <strong>Unloading Notes:</strong> {order.siteUnloadingNotes}
              </div>
            )}
            <div style={{ fontSize: '12px', color: 'var(--color-success-text)', marginTop: '8px' }}>
              ✓ Verified Seller Dispatch Guarantee
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="offers-table-wrap" style={{ margin: 0, marginBottom: '24px' }}>
          <table className="offers-table">
            <thead>
              <tr>
                <th>Item & Material</th>
                <th>Supplier</th>
                <th>Unit Rate</th>
                <th>Quantity</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: 'var(--color-slate-900)' }}>{item.productName}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: 'var(--color-slate-700)' }}>
                      {item.sellerName}
                    </span>
                  </td>
                  <td>
                    ₹{Number(item.unitPrice).toLocaleString('en-IN')} / {item.productUnit}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{item.quantity}</span> {item.productUnit}s
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                    ₹{Number(item.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financials Breakdown */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-slate-600)' }}>
              <span>Materials Subtotal:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                ₹{Number(order.totalMaterialAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-slate-600)' }}>
              <span>Freight & Logistics:</span>
              <span style={{ fontWeight: 600, color: Number(order.freightAmount) === 0 ? 'var(--color-success)' : 'var(--color-slate-900)' }}>
                {Number(order.freightAmount) === 0 ? 'FREE' : `₹${Number(order.freightAmount).toLocaleString('en-IN')}`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-slate-600)' }}>
              <span>GST (18%):</span>
              <span style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                ₹{Number(order.taxAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div
              style={{
                borderTop: '2px solid var(--color-slate-900)',
                paddingTop: '12px',
                marginTop: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--color-slate-900)'
              }}
            >
              <span>Total Payable:</span>
              <span>₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handlePrint}
          className="btn btn-outline"
          style={{ gap: '8px' }}
        >
          <Printer size={16} />
          <span>Print / Save PO Document</span>
        </button>

        <Link to="/" className="btn btn-primary" style={{ gap: '8px' }}>
          <ShoppingBag size={16} />
          <span>Continue Sourcing Materials</span>
        </Link>
      </div>
    </div>
  );
}

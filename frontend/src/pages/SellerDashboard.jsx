// src/pages/SellerDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Store,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { useSeller } from '../context/SellerContext';
import { useToast } from '../context/ToastContext';
import {
  fetchSellerListings,
  fetchSellerStats,
  updateSellerListingStatus,
  deleteSellerListing
} from '../services/api';
import AddListingModal from '../components/AddListingModal';
import EditListingModal from '../components/EditListingModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageWithFallback from '../components/ImageWithFallback';

export default function SellerDashboard() {
  const { currentSellerId, currentSeller, isApproved, isPending, isRejected } = useSeller();
  const { showToast } = useToast();

  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({ totalListings: 0, activeListings: 0, lowStockListings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedListingForEdit, setSelectedListingForEdit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);

  const loadDashboardData = useCallback(() => {
    if (!currentSellerId) return;
    setLoading(true);
    setError(null);

    const activeFilter = activeTab === 'ACTIVE' ? true : activeTab === 'INACTIVE' ? false : null;

    Promise.all([
      fetchSellerListings({
        sellerId: currentSellerId,
        active: activeFilter,
        query: searchQuery,
        page,
        size: 10
      }),
      fetchSellerStats(currentSellerId)
    ])
      .then(([listingsData, statsData]) => {
        setListings(listingsData?.content || []);
        setTotalPages(listingsData?.totalPages || 1);
        setStats(statsData || { totalListings: 0, activeListings: 0, lowStockListings: 0 });
      })
      .catch((err) => {
        setError(err.message || 'Failed to load seller dashboard data.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentSellerId, activeTab, searchQuery, page]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Toggle active status
  const handleToggleActive = async (listing) => {
    const newStatus = !listing.active;
    try {
      await updateSellerListingStatus(currentSellerId, listing.id, newStatus);
      showToast(`Listing ${newStatus ? 'activated' : 'deactivated'} successfully!`, 'info');
      loadDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to update listing status', 'error');
    }
  };

  // Delete listing
  const handleDeletePrompt = (listing) => {
    setListingToDelete(listing);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!listingToDelete) return;
    try {
      await deleteSellerListing(currentSellerId, listingToDelete.id);
      showToast(`Listing for ${listingToDelete.productName} deleted successfully.`, 'success');
      setDeleteDialogOpen(false);
      setListingToDelete(null);
      loadDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to delete listing', 'error');
    }
  };

  return (
    <div className="container seller-dashboard">
      {/* Seller Identity & Compliance Header */}
      <section className="dashboard-header">
        <div className="seller-profile-banner">
          <div className="seller-avatar">
            {currentSeller?.name ? currentSeller.name.charAt(0) : 'S'}
          </div>
          <div className="seller-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1>{currentSeller?.name || 'Seller Workspace'}</h1>
              <span className={`seller-status-badge ${currentSeller?.sellerStatus}`}>
                {isApproved && <CheckCircle2 size={13} />}
                {isPending && <Clock size={13} />}
                {isRejected && <AlertCircle size={13} />}
                {currentSeller?.sellerStatus}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '13px', color: 'var(--color-slate-500)', flexWrap: 'wrap' }}>
              {currentSeller?.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} /> {currentSeller.location}
                </span>
              )}
              {currentSeller?.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={13} /> {currentSeller.email}
                </span>
              )}
              {currentSeller?.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={13} /> {currentSeller.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>Publish New Listing</span>
          </button>
        </div>
      </section>

      {/* Compliance / Status Alert Banner */}
      {isPending && (
        <div className="alert-banner warning">
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Account Verification In Progress:</strong> Your seller account is currently pending KYC and GST verification. You may create, edit, and organize listings, but they will <strong>not be visible to public buyers</strong> until our compliance team approves your account.
          </div>
        </div>
      )}

      {isRejected && (
        <div className="alert-banner danger">
          <ShieldAlert size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Account Compliance Notice (Rejected):</strong> This seller account failed vendor compliance verification. All offers remain isolated and hidden from public buyers.
          </div>
        </div>
      )}

      {/* Metric Statistics Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper primary">
            <Package size={24} />
          </div>
          <div>
            <div className="stat-label">Total Listings</div>
            <div className="stat-value">{stats.totalListings}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper success">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-label">Active Listings</div>
            <div className="stat-value">{stats.activeListings}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper warning">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-label">Low Stock Alerts</div>
            <div className="stat-value">{stats.lowStockListings}</div>
          </div>
        </div>
      </section>

      {/* Listings Table Card */}
      <section className="dashboard-table-card">
        {/* Table Filter Bar */}
        <div className="table-filter-bar">
          <div className="status-tabs">
            <button
              type="button"
              onClick={() => { setActiveTab('ALL'); setPage(0); }}
              className={`status-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
            >
              All ({stats.totalListings})
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('ACTIVE'); setPage(0); }}
              className={`status-tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
            >
              Active ({stats.activeListings})
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('INACTIVE'); setPage(0); }}
              className={`status-tab-btn ${activeTab === 'INACTIVE' ? 'active' : ''}`}
            >
              Inactive ({Math.max(0, stats.totalListings - stats.activeListings)})
            </button>
          </div>

          <div className="search-box-wrapper" style={{ maxWidth: '300px' }}>
            <Search size={16} className="search-icon-pos" />
            <input
              type="text"
              placeholder="Search product or category..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              className="search-input"
              style={{ padding: '0.45rem 2rem 0.45rem 2.2rem', fontSize: '13px' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="search-clear-btn"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Content area */}
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <Loader2 size={32} className="spin-animate" style={{ color: 'var(--color-brand-primary)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '13px', color: 'var(--color-slate-500)' }}>Loading seller listings...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-danger)' }}>
            <p>{error}</p>
            <button onClick={loadDashboardData} className="btn btn-outline btn-sm" style={{ marginTop: '12px' }}>
              Retry
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="empty-state" style={{ margin: '24px' }}>
            <Layers className="empty-state-icon" />
            <h3 className="empty-state-title">No listings found</h3>
            <p className="empty-state-desc">
              {searchQuery
                ? 'No listings match your search query.'
                : 'You have not published any material listings under this seller profile yet.'}
            </p>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={14} /> Add First Listing
            </button>
          </div>
        ) : (
          <div className="offers-table-wrap" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
            <table className="offers-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Unit Price</th>
                  <th>Available Stock</th>
                  <th>MOQ</th>
                  <th>Active Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((item) => {
                  const isLowStock = item.availableStock <= item.minOrderQuantity;

                  return (
                    <tr key={item.id}>
                      {/* Material info */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: 'var(--radius-sm)',
                              overflow: 'hidden',
                              backgroundColor: 'var(--color-slate-100)',
                              flexShrink: 0
                            }}
                          >
                            <ImageWithFallback
                              src={item.productImageUrl}
                              alt={item.productName}
                              productId={item.productId}
                              category={item.productCategory}
                              height="100%"
                            />
                          </div>
                          <div>
                            <strong style={{ fontSize: '14px', color: 'var(--color-slate-900)' }}>
                              {item.productName}
                            </strong>
                            <div style={{ fontSize: '12px', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                              {item.productCategory} • Per {item.productUnit}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td>
                        <strong style={{ fontSize: '15px', color: 'var(--color-slate-900)' }}>
                          ₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </strong>
                      </td>

                      {/* Stock */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, color: item.availableStock === 0 ? 'var(--color-danger)' : 'var(--color-slate-800)' }}>
                            {Number(item.availableStock).toLocaleString('en-IN')}
                          </span>
                          {isLowStock && (
                            <span
                              title="Stock is at or below MOQ"
                              style={{ color: 'var(--color-warning)', display: 'flex' }}
                            >
                              <AlertTriangle size={14} />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* MOQ */}
                      <td>
                        <span>{item.minOrderQuantity}</span>
                      </td>

                      {/* Active toggle */}
                      <td>
                        <label className="switch" title="Toggle active/inactive status">
                          <input
                            type="checkbox"
                            checked={item.active}
                            onChange={() => handleToggleActive(item)}
                          />
                          <span className="slider"></span>
                        </label>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedListingForEdit(item);
                              setEditModalOpen(true);
                            }}
                            className="btn btn-outline btn-sm"
                            aria-label={`Edit ${item.productName}`}
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePrompt(item)}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-border)' }}
                            aria-label={`Delete ${item.productName}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid var(--color-slate-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-slate-50)'
            }}
          >
            <span style={{ fontSize: '13px', color: 'var(--color-slate-600)' }}>
              Page {page + 1} of {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={page === 0}
                className="btn btn-outline btn-sm"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                disabled={page >= totalPages - 1}
                className="btn btn-outline btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Add Listing Modal */}
      <AddListingModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        sellerId={currentSellerId}
        onListingCreated={() => loadDashboardData()}
      />

      {/* Edit Listing Modal */}
      <EditListingModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedListingForEdit(null);
        }}
        sellerId={currentSellerId}
        listing={selectedListingForEdit}
        onListingUpdated={() => loadDashboardData()}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Material Listing"
        message={`Are you sure you want to permanently delete your listing for "${listingToDelete?.productName}"? This action cannot be undone.`}
        confirmText="Delete Listing"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setListingToDelete(null);
        }}
      />
    </div>
  );
}

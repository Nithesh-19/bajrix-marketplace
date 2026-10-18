// src/pages/MarketplaceHome.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, SlidersHorizontal, PackageSearch, ShieldCheck, TrendingDown, Truck } from 'lucide-react';
import { fetchProducts, fetchCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';

export default function MarketplaceHome() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortBy, setSortBy] = useState('id_asc');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(0); // reset page on search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load categories once
  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data || []))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Fetch products on filter changes
  const loadProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchProducts({
      category: selectedCategory,
      query: debouncedQuery,
      page,
      size: 12,
      sort: sortBy
    })
      .then((res) => {
        setProducts(res?.content || []);
        setTotalPages(res?.totalPages || 1);
        setTotalElements(res?.totalElements || 0);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load products from marketplace.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedCategory, debouncedQuery, page, sortBy]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory((prev) => (prev === categoryName ? '' : categoryName));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setDebouncedQuery('');
    setSortBy('id_asc');
    setPage(0);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-tag">
              <ShieldCheck size={14} /> India's B2B Construction Materials Exchange
            </div>
            <h1 className="hero-title">
              Direct Bulk Materials Sourcing with Multi-Seller Price Transparency
            </h1>
            <p className="hero-subtitle">
              Compare live factory & yard offers for cement, TMT steel, AAC blocks, aggregate, and
              industrial supplies. Purchase at genuine lowest bulk rates from certified suppliers.
            </p>

            <div className="hero-features">
              <div className="hero-feature-item">
                <TrendingDown size={18} className="hero-feature-icon" />
                <span>Multi-Seller Price Comparison</span>
              </div>
              <div className="hero-feature-item">
                <ShieldCheck size={18} className="hero-feature-icon" />
                <span>Strict Seller Verification</span>
              </div>
              <div className="hero-feature-item">
                <Truck size={18} className="hero-feature-icon" />
                <span>Direct Site Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Toolbar: Search, Categories, Sort */}
      <section className="discovery-toolbar">
        <div className="container">
          <div className="toolbar-inner">
            {/* Search Input */}
            <div className="search-box-wrapper">
              <Search size={18} className="search-icon-pos" />
              <input
                type="text"
                placeholder="Search cement, TMT steel, sand, pipes, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="Search construction materials"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="search-clear-btn"
                  aria-label="Clear search query"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort & Stats */}
            <div className="toolbar-controls">
              <span style={{ fontSize: '12px', color: 'var(--color-slate-500)', fontWeight: 500 }}>
                {totalElements} {totalElements === 1 ? 'material found' : 'materials found'}
              </span>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(0);
                }}
                className="sort-select"
                aria-label="Sort products catalogue"
              >
                <option value="id_asc">Default Order</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="newest">Recently Added</option>
              </select>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div style={{ marginTop: '16px' }}>
            <div className="category-chips">
              <button
                type="button"
                onClick={() => handleCategorySelect('')}
                className={`category-chip ${selectedCategory === '' ? 'active' : ''}`}
              >
                All Materials
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`category-chip ${selectedCategory === cat.name ? 'active' : ''}`}
                >
                  <span>{cat.name}</span>
                  <span className="count">{cat.productCount}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Product Grid Section */}
      <main className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
        {error ? (
          <div className="empty-state" style={{ borderColor: 'var(--color-danger)' }}>
            <PackageSearch className="empty-state-icon" style={{ color: 'var(--color-danger)' }} />
            <h3 className="empty-state-title">Failed to Load Materials</h3>
            <p className="empty-state-desc">{error}</p>
            <button onClick={loadProducts} className="btn btn-primary">
              Retry Connection
            </button>
          </div>
        ) : loading ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <PackageSearch className="empty-state-icon" />
            <h3 className="empty-state-title">No matching materials found</h3>
            <p className="empty-state-desc">
              We couldn't find any materials matching your search or selected category.
            </p>
            <button onClick={handleClearFilters} className="btn btn-outline">
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginTop: '32px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  disabled={page === 0}
                  className="btn btn-outline btn-sm"
                >
                  Previous
                </button>
                <span style={{ fontSize: '13px', color: 'var(--color-slate-600)', fontWeight: 500 }}>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                  disabled={page >= totalPages - 1}
                  className="btn btn-outline btn-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

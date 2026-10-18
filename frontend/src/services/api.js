// src/services/api.js
// Production-ready API client for BajriX Backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Standard HTTP requester handling headers, seller isolation context,
 * JSON transformation, and comprehensive error extraction.
 */
async function request(endpoint, options = {}, currentSellerId = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  // Attach seller isolation header if available
  const resolvedSellerId = currentSellerId || localStorage.getItem('bajrix_seller_id') || '1';
  if (resolvedSellerId) {
    headers['X-Seller-Id'] = String(resolvedSellerId);
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);

    // 204 No Content
    if (response.status === 204) {
      return null;
    }

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(json?.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = json;
      error.validationErrors = json?.validationErrors || [];
      throw error;
    }

    return json?.data !== undefined ? json.data : json;
  } catch (err) {
    if (!err.status) {
      // Network failure
      const networkError = new Error('Cannot connect to BajriX backend service. Please check your network or verify the backend is running.');
      networkError.status = 0;
      throw networkError;
    }
    throw err;
  }
}

// ==========================================
// Public Buyer APIs
// ==========================================

export async function fetchProducts({ category = '', query = '', page = 0, size = 12, sort = 'id_asc' } = {}) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (query) params.append('query', query);
  params.append('page', String(page));
  params.append('size', String(size));
  params.append('sort', sort);

  return request(`/api/products?${params.toString()}`);
}

export async function fetchProductById(id) {
  return request(`/api/products/${id}`);
}

export async function fetchProductOffers(productId, sort = 'price_asc') {
  const params = new URLSearchParams({ sort });
  return request(`/api/products/${productId}/offers?${params.toString()}`);
}

export async function fetchCategories() {
  return request('/api/categories');
}

// ==========================================
// Orders & Checkout APIs
// ==========================================

export async function createPurchaseOrder(payload) {
  return request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function fetchPurchaseOrderByNumber(orderNumber) {
  return request(`/api/orders/${orderNumber}`);
}

// ==========================================
// Authentication APIs
// ==========================================

export async function loginUser(credentials) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

// ==========================================
// Seller & Switcher APIs
// ==========================================

export async function fetchAllSellers() {
  return request('/api/sellers');
}

export async function fetchSellerProfile(sellerId) {
  return request('/api/seller/profile', {}, sellerId);
}

export async function fetchSellerListings({ sellerId, active, query = '', page = 0, size = 10, sort = 'updated_desc' } = {}) {
  const params = new URLSearchParams();
  if (active !== undefined && active !== null && active !== '') {
    params.append('active', String(active));
  }
  if (query) params.append('query', query);
  params.append('page', String(page));
  params.append('size', String(size));
  params.append('sort', sort);

  return request(`/api/seller/listings?${params.toString()}`, {}, sellerId);
}

export async function fetchSellerStats(sellerId) {
  return request('/api/seller/listings/stats', {}, sellerId);
}

export async function createSellerListing(sellerId, payload) {
  return request('/api/seller/listings', {
    method: 'POST',
    body: JSON.stringify(payload)
  }, sellerId);
}

export async function updateSellerListing(sellerId, listingId, payload) {
  return request(`/api/seller/listings/${listingId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }, sellerId);
}

export async function updateSellerListingStatus(sellerId, listingId, active) {
  return request(`/api/seller/listings/${listingId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ active })
  }, sellerId);
}

export async function deleteSellerListing(sellerId, listingId) {
  return request(`/api/seller/listings/${listingId}`, {
    method: 'DELETE'
  }, sellerId);
}

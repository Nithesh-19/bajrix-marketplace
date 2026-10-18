// src/components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function BuyerRoute({ children }) {
  const { isAuthenticated, isBuyer, user } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated && !isBuyer) {
      showToast('Your account is registered as a Seller. Redirected to your Seller Workspace.', 'info');
    }
  }, [isAuthenticated, isBuyer, showToast]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isBuyer) {
    return <Navigate to="/seller" replace />;
  }

  return children;
}

export function SellerRoute({ children }) {
  const { isAuthenticated, isSeller, user } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated && !isSeller) {
      showToast('Access Restricted: You are logged in as a Buyer and cannot access the Seller Workspace.', 'warning');
    }
  }, [isAuthenticated, isSeller, showToast]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isSeller) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || (user?.role === 'SELLER' ? '/seller' : '/');
    return <Navigate to={destination} replace />;
  }

  return children;
}

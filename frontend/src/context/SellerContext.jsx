// src/context/SellerContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAllSellers, fetchSellerProfile } from '../services/api';
import { useAuth } from './AuthContext';

const SellerContext = createContext(null);

export function SellerProvider({ children }) {
  const { user } = useAuth();
  const [sellersList, setSellersList] = useState([]);
  const [currentSellerId, setCurrentSellerId] = useState(() => {
    if (user?.role === 'SELLER' && user.sellerId) {
      return Number(user.sellerId);
    }
    return Number(localStorage.getItem('bajrix_seller_id')) || 1;
  });
  const [currentSeller, setCurrentSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync seller ID when logged in user changes
  useEffect(() => {
    if (user?.role === 'SELLER' && user.sellerId) {
      setCurrentSellerId(Number(user.sellerId));
    }
  }, [user]);

  // Load all seeded sellers for reviewer selection
  useEffect(() => {
    fetchAllSellers()
      .then((data) => {
        setSellersList(data || []);
      })
      .catch((err) => {
        console.error('Failed to load sellers list:', err);
      });
  }, []);

  // Sync profile when currentSellerId changes
  useEffect(() => {
    if (!currentSellerId) return;
    setLoading(true);
    fetchSellerProfile(currentSellerId)
      .then((data) => {
        setCurrentSeller(data);
      })
      .catch((err) => {
        console.error('Failed to load current seller profile:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentSellerId]);

  const switchSeller = (sellerId) => {
    const numId = Number(sellerId);
    setCurrentSellerId(numId);
    localStorage.setItem('bajrix_seller_id', String(numId));
  };

  const isApproved = currentSeller?.sellerStatus === 'APPROVED';
  const isPending = currentSeller?.sellerStatus === 'PENDING';
  const isRejected = currentSeller?.sellerStatus === 'REJECTED';

  return (
    <SellerContext.Provider
      value={{
        sellersList,
        currentSellerId,
        currentSeller,
        loading,
        switchSeller,
        isApproved,
        isPending,
        isRejected
      }}
    >
      {children}
    </SellerContext.Provider>
  );
}

export function useSeller() {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
}

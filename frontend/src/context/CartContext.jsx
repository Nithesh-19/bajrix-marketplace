import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useToast } from './ToastContext';
import { getProductImageUrl } from '../services/productImages';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { showToast } = useToast();
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('bajrix_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bajrix_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [items]);

  const addToCart = (product, offer, quantity = 1) => {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    if (offer.availableStock <= 0) {
      showToast('This item is currently out of stock.', 'error');
      return false;
    }

    if (qty > offer.availableStock) {
      showToast(`Requested quantity (${qty}) exceeds seller available stock (${offer.availableStock} ${product.unit}s)`, 'error');
      return false;
    }

    let success = true;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.listingId === offer.id);

      if (existingIndex > -1) {
        // Update existing item without mutation
        const newQty = prevItems[existingIndex].quantity + qty;
        if (newQty > offer.availableStock) {
          showToast(`Total quantity (${newQty}) exceeds available inventory (${offer.availableStock} ${product.unit}s)`, 'error');
          success = false;
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: newQty * Number(offer.price)
        };

        if (newQty < offer.minOrderQuantity) {
          showToast(`Updated cart: ${newQty} ${product.unit}${newQty > 1 ? 's' : ''}. (MOQ requirement: ${offer.minOrderQuantity} ${product.unit}s)`, 'info');
        } else {
          showToast(`Updated cart: ${newQty} ${product.unit}${newQty > 1 ? 's' : ''} of ${product.name}`, 'success');
        }
        return updated;
      } else {
        // Add new item
        const newItem = {
          listingId: offer.id,
          productId: product.id,
          productName: product.name,
          productCategory: product.category,
          productUnit: product.unit,
          productImageUrl: getProductImageUrl(product) || product.imageUrl,
          sellerId: offer.sellerId,
          sellerName: offer.sellerName,
          sellerLocation: offer.sellerLocation,
          sellerRating: offer.sellerRating,
          unitPrice: Number(offer.price),
          quantity: qty,
          minOrderQuantity: offer.minOrderQuantity || 1,
          availableStock: offer.availableStock,
          totalPrice: qty * Number(offer.price)
        };

        if (qty < (offer.minOrderQuantity || 1)) {
          showToast(`Added ${qty} ${product.unit}${qty > 1 ? 's' : ''} to cart. Note: Seller requires minimum order of ${offer.minOrderQuantity} ${product.unit}s before checkout.`, 'info');
        } else {
          showToast(`Added ${qty} ${product.unit}${qty > 1 ? 's' : ''} to Cart from ${offer.sellerName}!`, 'success');
        }
        return [...prevItems, newItem];
      }
    });

    return success;
  };

  const updateQuantity = (listingId, newQuantity) => {
    const rawVal = parseInt(newQuantity, 10);
    if (isNaN(rawVal)) return;

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.listingId === listingId) {
          // Strictly prevent quantities less than 1
          const qty = Math.max(1, rawVal);

          if (qty > item.availableStock) {
            showToast(`Cannot exceed seller stock of ${item.availableStock} ${item.productUnit}s`, 'warning');
            return {
              ...item,
              quantity: item.availableStock,
              totalPrice: item.availableStock * item.unitPrice
            };
          }

          return {
            ...item,
            quantity: qty,
            totalPrice: qty * item.unitPrice
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (listingId) => {
    setItems((prevItems) => {
      const removed = prevItems.find((i) => i.listingId === listingId);
      if (removed) {
        showToast(`Removed ${removed.productName} from cart`, 'info');
      }
      return prevItems.filter((item) => item.listingId !== listingId);
    });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('bajrix_cart');
  };

  // Calculations & MOQ compliance checks
  const { totalItems, subtotal, uniqueSellersCount, freight, tax, grandTotal, hasMoqViolations, moqViolations } = useMemo(() => {
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);

    const sellers = new Set(items.map((i) => i.sellerId));
    const uniqueSellersCount = sellers.size;

    // Logistics: ₹500 per seller dispatch, free freight over ₹50,000
    const freight = subtotal >= 50000 || items.length === 0 ? 0 : uniqueSellersCount * 500;

    // 18% GST standard on construction supplies
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const grandTotal = subtotal + freight + tax;

    const moqViolations = items.filter((item) => item.quantity < item.minOrderQuantity);
    const hasMoqViolations = moqViolations.length > 0;

    return { totalItems, subtotal, uniqueSellersCount, freight, tax, grandTotal, hasMoqViolations, moqViolations };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        uniqueSellersCount,
        freight,
        tax,
        grandTotal,
        hasMoqViolations,
        moqViolations
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

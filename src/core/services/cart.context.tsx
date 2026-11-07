'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { DeliveryZone } from '../models/order.model';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getItemQuantity: (productId: string) => number;
  clearCart: () => void;
  totalQuantity: number;
  subtotal: number;
  deliveryZone: DeliveryZone;
  setDeliveryZone: (zone: DeliveryZone) => void;
  deliveryFee: number;
  total: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('melo_cart');
        if (stored) {
          const parsed = JSON.parse(stored) as CartItem[];
          if (Array.isArray(parsed)) {
            return parsed
              .filter((item) => item && item.product && item.product.id)
              .map((item) => {
                const maxStock = Math.max(0, Number(item.product.stock ?? 0));
                const validQty = Math.max(1, Number(item.quantity) || 1);
                return {
                  product: item.product,
                  quantity: maxStock > 0 ? Math.min(maxStock, validQty) : validQty,
                };
              })
              .filter((item) => Number(item.product.stock ?? 1) > 0);
          }
        }
      } catch {
        // ignore corrupted storage
      }
    }
    return [];
  });
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('inside_dhaka');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('melo_cart', JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items]);

  const getItemQuantity = (productId: string): number => {
    const found = items.find((item) => item.product.id === productId);
    return found ? found.quantity : 0;
  };

  const addItem = (product: Product, quantity: number = 1) => {
    const maxStock = Math.max(0, Number(product.stock ?? 0));
    if (maxStock <= 0) {
      return;
    }

    const addQty = Math.max(1, Number(quantity) || 1);

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQty = Math.min(maxStock, existing.quantity + addQty);
        return prev.map((item) =>
          item.product.id === product.id
            ? { product: { ...product, stock: maxStock }, quantity: nextQty }
            : item
        );
      }
      return [
        ...prev,
        {
          product: { ...product, stock: maxStock },
          quantity: Math.min(maxStock, addQty),
        },
      ];
    });
    setIsCartDrawerOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const targetQty = Number(quantity);
    if (isNaN(targetQty) || targetQty <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const maxStock = Math.max(1, Number(item.product.stock ?? 1));
        return {
          ...item,
          quantity: Math.min(maxStock, Math.max(1, targetQty)),
        };
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.product.priceBDT) || 0) * (Number(item.quantity) || 0),
    0
  );
  const deliveryFee =
    items.length === 0 ? 0 : subtotal >= 1500 ? 0 : deliveryZone === 'inside_dhaka' ? 60 : 120;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        getItemQuantity,
        clearCart,
        totalQuantity,
        subtotal,
        deliveryZone,
        setDeliveryZone,
        deliveryFee,
        total,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
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

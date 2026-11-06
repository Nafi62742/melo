'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const WISHLIST_STORAGE_KEY = 'melo_wishlist';

interface WishlistContextType {
  wishlistIds: string[];
  totalWishlist: number;
  isWishlistDrawerOpen: boolean;
  setIsWishlistDrawerOpen: (open: boolean) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed.filter((id): id is string => typeof id === 'string');
          }
        }
      } catch {
        // ignore corrupted storage
      }
    }
    return [];
  });

  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState<boolean>(false);

  // Sync updates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch (e) {
      console.warn('Failed to save wishlist to storage', e);
    }
  }, [wishlistIds]);

  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return wishlistIds.includes(productId);
    },
    [wishlistIds]
  );

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  }, []);

  const addToWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlistIds([]);
  }, []);

  const totalWishlist = useMemo(() => wishlistIds.length, [wishlistIds]);

  const value = useMemo(
    () => ({
      wishlistIds,
      totalWishlist,
      isWishlistDrawerOpen,
      setIsWishlistDrawerOpen,
      toggleWishlist,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
    }),
    [
      wishlistIds,
      totalWishlist,
      isWishlistDrawerOpen,
      toggleWishlist,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
    ]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

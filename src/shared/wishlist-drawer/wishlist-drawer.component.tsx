'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/core/models/product.model';
import { useWishlist } from '@/core/services/wishlist.context';
import { useCart } from '@/core/services/cart.context';
import { productService, PRODUCTS_UPDATED_EVENT } from '@/core/services/product.service';
import { formatBDT } from '@/core/utils/currency.util';
import {
  Heart,
  X,
  Trash2,
  ShoppingBag,
} from 'lucide-react';

export function WishlistDrawer() {
  const {
    wishlistIds,
    isWishlistDrawerOpen,
    setIsWishlistDrawerOpen,
    removeFromWishlist,
    clearWishlist,
    totalWishlist,
  } = useWishlist();

  const { addItem, setIsCartDrawerOpen } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>(() =>
    productService.getAllProducts()
  );

  // Products live only in Supabase — load them when the drawer opens and stay in sync.
  useEffect(() => {
    if (!isWishlistDrawerOpen) return;
    const refresh = () => setAllProducts([...productService.getAllProducts()]);
    window.addEventListener(PRODUCTS_UPDATED_EVENT, refresh);
    void productService.syncFromDatabase().then(refresh);
    return () => window.removeEventListener(PRODUCTS_UPDATED_EVENT, refresh);
  }, [isWishlistDrawerOpen]);

  if (!isWishlistDrawerOpen) return null;

  // Retrieve full product objects for wishlisted IDs
  const wishlistedProducts = wishlistIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const handleMoveToBag = (product: (typeof wishlistedProducts)[0]) => {
    addItem(product, 1);
    setIsWishlistDrawerOpen(false);
    setIsCartDrawerOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#181512]/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsWishlistDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative z-50 flex h-full w-full max-w-md flex-col bg-[#FAF7F2] shadow-2xl transition-transform border-l border-[#E7E0D6]">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#E7E0D6] bg-white px-6 py-5">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-[#9A7B3E] fill-[#9A7B3E]/20" />
            <h2 className="font-serif-display text-xl font-semibold tracking-wide text-[#1C1917]">
              Saved Pieces <span className="text-sm font-sans text-[#78716C]">({totalWishlist})</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsWishlistDrawerOpen(false)}
            className="p-1.5 text-[#78716C] hover:bg-[#F3EDE4] hover:text-[#1C1917] transition cursor-pointer"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {wishlistedProducts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#E6D5B8] bg-white text-[#9A7B3E] mb-4">
                <Heart className="w-7 h-7 stroke-[1.25]" />
              </div>
              <h3 className="font-serif-display text-2xl font-medium text-[#1C1917]">
                Your Wishlist is Empty
              </h3>
              <p className="mt-2 text-xs text-[#78716C] max-w-xs leading-relaxed">
                Click the heart icon on any jewellery piece you love to save it here for later.
              </p>
              <button
                type="button"
                onClick={() => setIsWishlistDrawerOpen(false)}
                className="mt-6 boutique-btn-primary px-6 py-2.5 text-xs uppercase tracking-wider cursor-pointer"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistedProducts.map((product) => {
                const maxStock = Math.max(0, Number(product.stock ?? 0));
                const isOutOfStock = maxStock <= 0;

                return (
                  <div
                    key={product.id}
                    className="flex gap-4 border border-[#E7E0D6] bg-white p-3.5 transition hover:border-[#C5A059]"
                  >
                    {/* Thumbnail Frame */}
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={() => setIsWishlistDrawerOpen(false)}
                      className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-[#F3EDE4] border border-[#E7E0D6]"
                    >
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className={`object-cover ${isOutOfStock ? 'opacity-65 grayscale-[30%]' : ''}`}
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white uppercase tracking-wider bg-red-900/90 px-1 py-0.5">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Details & Actions */}
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9A7B3E] block">
                              {product.categoryName}
                            </span>
                            <Link
                              href={`/product/${product.slug}`}
                              onClick={() => setIsWishlistDrawerOpen(false)}
                              className="font-serif-display text-base font-medium text-[#1C1917] hover:text-[#9A7B3E] transition line-clamp-1"
                            >
                              {product.name}
                            </Link>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromWishlist(product.id)}
                            className="text-[#A8A29E] hover:text-red-700 transition p-1 cursor-pointer"
                            aria-label={`Remove ${product.name} from wishlist`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-[#1C1917]">
                            {formatBDT(product.priceBDT)}
                          </span>
                          {product.originalPriceBDT && product.originalPriceBDT > product.priceBDT && (
                            <span className="text-xs text-[#A8A29E] line-through">
                              {formatBDT(product.originalPriceBDT)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add to Bag Action */}
                      <div className="mt-3 pt-2 border-t border-[#F3EDE4] flex items-center justify-between">
                        {isOutOfStock ? (
                          <span className="text-[10px] font-semibold text-red-700 uppercase tracking-wider">
                            Out of Stock
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMoveToBag(product)}
                            className="flex items-center gap-1.5 boutique-btn-primary px-3 py-1.5 text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Add to Bag</span>
                          </button>
                        )}

                        <Link
                          href={`/product/${product.slug}`}
                          onClick={() => setIsWishlistDrawerOpen(false)}
                          className="text-[10px] text-[#78716C] hover:text-[#1C1917] hover:underline"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {wishlistedProducts.length > 0 && (
          <div className="border-t border-[#E7E0D6] bg-white p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#78716C]">
              <span>Saved items persist in your browser.</span>
              <button
                type="button"
                onClick={clearWishlist}
                className="text-red-700 hover:underline cursor-pointer"
              >
                Clear Wishlist
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsWishlistDrawerOpen(false)}
              className="w-full boutique-btn-outline py-3 text-xs uppercase tracking-[0.16em] cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

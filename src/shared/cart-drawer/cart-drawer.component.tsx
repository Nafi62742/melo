'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/core/services/cart.context';
import { useI18n } from '@/core/i18n/i18n.context';
import { formatBDT } from '@/core/utils/currency.util';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalQuantity,
    subtotal,
    deliveryFee,
    total,
    deliveryZone,
    setDeliveryZone,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();
  const { t } = useI18n();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#181512]/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      {/* Drawer */}
      <div className="relative z-50 flex h-full w-full max-w-md flex-col bg-[#FAF7F2] shadow-2xl transition-transform border-l border-[#E7E0D6]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E7E0D6] bg-white px-6 py-5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-[#9A7B3E]" />
            <h2 className="font-serif-display text-xl font-semibold tracking-wide text-[#1C1917]">
              {t.cart.title} <span className="text-sm font-sans text-[#78716C]">({totalQuantity})</span>
            </h2>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1.5 text-[#78716C] hover:bg-[#F3EDE4] hover:text-[#1C1917] transition"
            aria-label="Close shopping bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#E6D5B8] bg-white text-[#9A7B3E] mb-4">
                <ShoppingBag className="w-7 h-7 stroke-[1.25]" />
              </div>
              <h3 className="font-serif-display text-2xl font-medium text-[#1C1917]">
                {t.cart.empty}
              </h3>
              <p className="mt-1.5 text-xs text-[#78716C] max-w-xs leading-relaxed">
                {t.cart.emptyDesc}
              </p>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="mt-6 boutique-btn-primary px-7 py-3"
              >
                {t.cart.startShopping}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#E7E0D6]">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 py-4 first:pt-0">
                  <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-white border border-[#E7E0D6]">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={() => setIsCartDrawerOpen(false)}
                          className="line-clamp-1 font-serif-display text-base font-medium text-[#1C1917] hover:text-[#9A7B3E]"
                        >
                          {product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-[#A8A29E] hover:text-red-600 transition"
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.16em] text-[#9A7B3E] mt-0.5">
                        {product.category}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-[#E7E0D6] bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1.5 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold text-[#1C1917]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            disabled={quantity >= Math.max(1, Number(product.stock ?? 1))}
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            title={
                              quantity >= Math.max(1, Number(product.stock ?? 1))
                                ? 'Maximum limit reached'
                                : 'Increase quantity'
                            }
                            className={`p-1.5 transition ${
                              quantity >= Math.max(1, Number(product.stock ?? 1))
                                ? 'text-[#A8A29E] bg-[#F3EDE4] cursor-not-allowed opacity-50'
                                : 'text-[#78716C] hover:text-[#1C1917] cursor-pointer'
                            }`}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        {quantity >= Math.max(1, Number(product.stock ?? 1)) && (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5">
                            Max Limit
                          </span>
                        )}
                      </div>

                      <span className="text-sm font-semibold text-[#1C1917]">
                        {formatBDT(product.priceBDT * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Summary */}
        {items.length > 0 && (
          <div className="border-t border-[#E7E0D6] bg-white p-6">
            {/* Delivery zone selector */}
            <div className="mb-4 border border-[#E7E0D6] bg-[#FAF7F2] p-3.5 text-xs">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C] mb-2">
                Delivery Region (Bangladesh)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`flex items-center gap-2 border px-2.5 py-2 cursor-pointer transition ${
                    deliveryZone === 'inside_dhaka'
                      ? 'border-[#C5A059] bg-white text-[#1C1917] font-semibold'
                      : 'border-[#E7E0D6] text-[#78716C]'
                  }`}
                >
                  <input
                    type="radio"
                    name="zone"
                    checked={deliveryZone === 'inside_dhaka'}
                    onChange={() => setDeliveryZone('inside_dhaka')}
                    className="accent-[#1C1917]"
                  />
                  <span>Inside Dhaka (৳60)</span>
                </label>
                <label
                  className={`flex items-center gap-2 border px-2.5 py-2 cursor-pointer transition ${
                    deliveryZone === 'outside_dhaka'
                      ? 'border-[#C5A059] bg-white text-[#1C1917] font-semibold'
                      : 'border-[#E7E0D6] text-[#78716C]'
                  }`}
                >
                  <input
                    type="radio"
                    name="zone"
                    checked={deliveryZone === 'outside_dhaka'}
                    onChange={() => setDeliveryZone('outside_dhaka')}
                    className="accent-[#1C1917]"
                  />
                  <span>Outside Dhaka (৳120)</span>
                </label>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#78716C]">
              <div className="flex justify-between">
                <span>{t.cart.subtotal}</span>
                <span className="font-medium text-[#1C1917]">{formatBDT(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.cart.estimatedDelivery}</span>
                <span className="font-medium text-[#1C1917]">{formatBDT(deliveryFee)}</span>
              </div>
              <div className="flex justify-between pt-2.5 border-t border-[#E7E0D6] text-sm font-semibold text-[#1C1917]">
                <span className="uppercase tracking-wider text-xs">Total</span>
                <span className="font-serif-display text-xl font-bold text-[#1C1917]">
                  {formatBDT(total)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartDrawerOpen(false)}
              className="mt-5 flex w-full items-center justify-center gap-2 boutique-btn-primary py-3.5"
            >
              <span>{t.cart.checkout}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

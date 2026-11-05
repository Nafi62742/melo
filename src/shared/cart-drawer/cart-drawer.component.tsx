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
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      {/* Drawer */}
      <div className="relative z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-700" />
            <h2 className="text-base font-bold text-stone-900">
              {t.cart.title} ({totalQuantity})
            </h2>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100/70 text-amber-800 mb-4">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-semibold text-stone-900 font-serif">{t.cart.empty}</h3>
              <p className="mt-1 text-xs text-stone-500 max-w-xs">{t.cart.emptyDesc}</p>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="mt-6 rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-amber-100 shadow-sm hover:bg-amber-800 hover:text-white transition"
              >
                {t.cart.startShopping}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 py-4 first:pt-0">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100 border border-stone-200">
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
                          className="line-clamp-1 text-sm font-semibold text-stone-900 hover:text-amber-800 transition"
                        >
                          {product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-stone-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-stone-400 capitalize">{product.category}</div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 text-stone-600 hover:text-stone-900"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-stone-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1 text-stone-600 hover:text-stone-900"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-stone-900">
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
          <div className="border-t border-stone-200/80 bg-stone-50/70 p-5">
            {/* Delivery zone radio */}
            <div className="mb-4 rounded-xl border border-stone-200 bg-white p-3 text-xs">
              <div className="font-semibold text-stone-800 mb-2">Delivery Location (Bangladesh):</div>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="zone"
                    checked={deliveryZone === 'inside_dhaka'}
                    onChange={() => setDeliveryZone('inside_dhaka')}
                    className="accent-amber-700"
                  />
                  <span className="text-stone-700">Inside Dhaka (৳60)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="zone"
                    checked={deliveryZone === 'outside_dhaka'}
                    onChange={() => setDeliveryZone('outside_dhaka')}
                    className="accent-amber-700"
                  />
                  <span className="text-stone-700">Outside Dhaka (৳120)</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>{t.cart.subtotal}</span>
                <span className="font-semibold text-stone-900">{formatBDT(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.cart.estimatedDelivery}</span>
                <span className="font-semibold text-stone-900">{formatBDT(deliveryFee)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                <span>Total</span>
                <span className="text-amber-800 text-base">{formatBDT(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartDrawerOpen(false)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 text-sm font-bold text-amber-100 shadow-md hover:bg-amber-800 hover:text-white active:scale-98 transition"
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


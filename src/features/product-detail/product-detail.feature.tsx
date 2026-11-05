'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/core/models/product.model';
import { formatBDT } from '@/core/utils/currency.util';
import { useCart } from '@/core/services/cart.context';
import { ShoppingBag, ArrowLeft, ShieldCheck, Truck, Plus, Minus, CheckCircle } from 'lucide-react';

interface ProductDetailFeatureProps {
  product: Product;
}

export function ProductDetailFeature({ product }: ProductDetailFeatureProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push('/checkout');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-violet-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collection</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Product Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-neutral-100 border border-neutral-200/80 shadow-sm">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            className="object-cover"
          />

          {product.isNew && (
            <span className="absolute top-4 left-4 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white shadow-md">
              NEW ARRIVAL
            </span>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-violet-100 px-3 py-0.5 text-xs font-semibold text-violet-700 uppercase">
                {product.categoryName}
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                In Stock ({product.stock} available)
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-neutral-900">
                {formatBDT(product.priceBDT)}
              </span>
              {product.originalPriceBDT && product.originalPriceBDT > product.priceBDT && (
                <span className="text-base text-neutral-400 line-through">
                  {formatBDT(product.originalPriceBDT)}
                </span>
              )}
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                Cash on Delivery Available
              </span>
            </div>

            <p className="mt-5 text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </p>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity Selector & Live Calculated Price */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-neutral-700">Quantity:</span>
                <div className="flex items-center rounded-xl border border-neutral-300 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-neutral-600 hover:text-neutral-900"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 text-neutral-600 hover:text-neutral-900"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {quantity > 1 && (
                <div className="rounded-xl bg-violet-50 px-3.5 py-1.5 border border-violet-200 text-xs font-bold text-violet-800 animate-fadeIn">
                  Total for {quantity} items: {formatBDT(product.priceBDT * quantity)}
                  <span className="text-[10px] font-normal text-violet-600 ml-1.5">
                    ({formatBDT(product.priceBDT)} each)
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700 active:scale-98 transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag • {formatBDT(product.priceBDT * quantity)}</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-neutral-900 py-3.5 px-6 text-sm font-semibold text-white hover:bg-neutral-800 active:scale-98 transition"
              >
                <span>Buy Now • {formatBDT(product.priceBDT * quantity)}</span>
              </button>
            </div>

            {addedNotice && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Added to your bag successfully!</span>
              </div>
            )}
          </div>

          {/* Delivery & Trust Box */}
          <div className="mt-8 rounded-2xl bg-neutral-50 border border-neutral-200/80 p-4 space-y-3 text-xs text-neutral-600">
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-neutral-800">Nationwide Delivery:</strong> Inside Dhaka ৳60 (24-48 hours), Outside Dhaka ৳120 (3-4 days).
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-neutral-800">Cash on Delivery:</strong> Inspect the package when the delivery agent arrives.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


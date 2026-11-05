'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/core/models/product.model';
import { formatBDT } from '@/core/utils/currency.util';
import { useCart } from '@/core/services/cart.context';
import { ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl glass-card bg-white transition-all duration-300 hover:border-amber-300/60 ${className}`}
    >
      {/* Product Image Container */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square w-full overflow-hidden bg-stone-100"
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isNew && (
            <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 shadow-sm">
              NEW
            </span>
          )}
          {product.category === 'earrings' && (
            <span className="rounded-full bg-amber-600/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
              Ear Clip
            </span>
          )}
        </div>

        {/* Quick View Hover Overlay */}
        <div className="absolute inset-0 bg-stone-900/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-stone-900 shadow-md">
            <Eye className="w-3.5 h-3.5 text-amber-700" />
            Quick View
          </span>
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="mb-1 text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
          {product.categoryName}
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-1 text-sm font-bold text-stone-900 hover:text-amber-800 transition-colors"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Price and Add button */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-stone-100">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-stone-900">
              {formatBDT(product.priceBDT)}
            </span>
            {product.originalPriceBDT && product.originalPriceBDT > product.priceBDT && (
              <span className="text-xs text-stone-400 line-through">
                {formatBDT(product.originalPriceBDT)}
              </span>
            )}
          </div>

          <button
            onClick={() => addItem(product, 1)}
            aria-label={`Add ${product.name} to cart`}
            className="flex items-center justify-center rounded-xl bg-stone-900 p-2 text-amber-200 shadow-sm hover:bg-amber-700 hover:text-white active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

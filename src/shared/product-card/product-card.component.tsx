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
      className={`group relative flex flex-col overflow-hidden bg-white border border-[#E7E0D6] transition-all duration-500 hover:border-[#C5A059] hover:shadow-[0_18px_38px_-12px_rgba(28,25,23,0.1)] ${className}`}
    >
      {/* Portrait 4:5 Editorial Image Container (Blingg 04 / Jewelix / Deweler style) */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F3EDE4]/60">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
          />
        </Link>

        {/* Boutique Minimal Badges */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
          {product.isNew && (
            <span className="bg-[#FAF7F2]/95 border border-[#E6D5B8] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1C1917] shadow-xs">
              New
            </span>
          )}
          {product.category === 'earrings' && (
            <span className="bg-[#181512]/85 backdrop-blur-xs px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-[#E6D5B8]">
              Ear Clip
            </span>
          )}
        </div>

        {/* Top-Right Quick View Icon on Hover */}
        <Link
          href={`/product/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center bg-white/90 text-[#1C1917] opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-[#1C1917] hover:text-white shadow-xs"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>

        {/* Slide-Up Editorial Action Bar on Desktop Hover (Jewelix / Deweler Signature) */}
        <div className="hidden sm:block absolute inset-x-0 bottom-0 p-3 translate-y-full opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 z-10">
          <button
            onClick={() => addItem(product, 1)}
            aria-label={`Add ${product.name} to bag`}
            className="flex w-full items-center justify-center gap-2 bg-[#181512]/95 backdrop-blur-xs py-2.5 px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FAF7F2] hover:bg-[#9A7B3E] transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Bag</span>
          </button>
        </div>
      </div>

      {/* Editorial Product Meta */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4 text-left">
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A7B3E]">
            {product.categoryName}
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="line-clamp-1 font-serif-display text-base sm:text-lg font-medium text-[#1C1917] hover:text-[#9A7B3E] transition-colors"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        {/* Price Row & Mobile One-Tap Bag Trigger */}
        <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[#F3EDE4]">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-semibold text-[#1C1917]">
              {formatBDT(product.priceBDT)}
            </span>
            {product.originalPriceBDT && product.originalPriceBDT > product.priceBDT && (
              <span className="text-xs text-[#A8A29E] line-through">
                {formatBDT(product.originalPriceBDT)}
              </span>
            )}
          </div>

          {/* Always accessible on mobile; subtle quick-add icon on desktop */}
          <button
            onClick={() => addItem(product, 1)}
            aria-label={`Add ${product.name} to cart`}
            className="flex h-8 w-8 items-center justify-center border border-[#E7E0D6] bg-[#FAF7F2] text-[#1C1917] hover:bg-[#1C1917] hover:text-[#FAF7F2] hover:border-[#1C1917] active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

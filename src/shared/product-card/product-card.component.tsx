'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/core/models/product.model';
import { formatBDT } from '@/core/utils/currency.util';
import { useCart } from '@/core/services/cart.context';
import { useWishlist } from '@/core/services/wishlist.context';
import { useI18n } from '@/core/i18n/i18n.context';
import { ShoppingBag, Eye, Plus, Minus, Lock, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  className?: string;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, className = '', onQuickView }: ProductCardProps) {
  const { t } = useI18n();
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFavorite = isInWishlist(product.id);
  const maxStock = Math.max(0, Number(product.stock ?? 0));
  const isOutOfStock = maxStock <= 0;
  const inBagQty = getItemQuantity(product.id);
  const isMaxReached = !isOutOfStock && inBagQty >= maxStock;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isMaxReached) return;
    addItem(product, 1);
  };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden bg-white border border-[#E7E0D6] transition-all duration-500 hover:border-[#C5A059] hover:shadow-[0_18px_38px_-12px_rgba(28,25,23,0.1)] ${className}`}
    >
      {/* Portrait 4:5 Editorial Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F3EDE4]/60">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108 ${
              isOutOfStock ? 'opacity-60 grayscale-[35%]' : ''
            }`}
          />
        </Link>

        {/* Boutique Minimal Badges */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
          {isOutOfStock ? (
            <span className="bg-red-900/95 border border-red-300/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-xs">
              {t.common.outOfStock}
            </span>
          ) : (
            <>
              {product.isNew && (
                <span className="bg-[#FAF7F2]/95 border border-[#E6D5B8] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1C1917] shadow-xs">
                  {t.common.newBadge}
                </span>
              )}
              {product.category === 'earrings' && (
                <span className="bg-[#181512]/85 backdrop-blur-xs px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-[#E6D5B8]">
                  {t.productDetail.earClipBadge}
                </span>
              )}
            </>
          )}
        </div>

        {/* Top-Right Action Buttons: Wishlist Heart & Quick View Eye */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-center gap-1.5">
          {/* Wishlist Heart Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            aria-label={
              isFavorite
                ? `Remove ${product.name} from wishlist`
                : `Save ${product.name} to wishlist`
            }
            className={`flex h-8 w-8 items-center justify-center transition-all shadow-xs cursor-pointer ${
              isFavorite
                ? 'bg-[#1C1917] text-[#FAF7F2]'
                : 'bg-white/90 text-[#78716C] hover:text-[#1C1917] hover:bg-white'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isFavorite ? 'fill-[#C5A059] text-[#C5A059]' : ''
              }`}
            />
          </button>

          {/* Quick View Eye Button */}
          {onQuickView ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              aria-label={`Quick view ${product.name}`}
              className="flex h-8 w-8 items-center justify-center bg-white/90 text-[#1C1917] opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-[#1C1917] hover:text-white shadow-xs cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              href={`/product/${product.slug}`}
              aria-label={`View ${product.name}`}
              className="flex h-8 w-8 items-center justify-center bg-white/90 text-[#1C1917] opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-[#1C1917] hover:text-white shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Slide-Up Editorial Action Bar on Desktop Hover */}
        <div className="hidden sm:block absolute inset-x-0 bottom-0 p-3 translate-y-full opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 z-20">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-2 bg-stone-800/90 py-2.5 px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-300 cursor-not-allowed"
            >
              <span>{t.common.outOfStock}</span>
            </button>
          ) : isMaxReached ? (
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-2 bg-stone-800/95 py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#E6D5B8] cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t.common.maxLimit}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              aria-label={`Add ${product.name} to bag`}
              className="flex w-full items-center justify-center gap-2 bg-[#181512]/95 backdrop-blur-xs py-2.5 px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FAF7F2] hover:bg-[#9A7B3E] transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{inBagQty > 0 ? `${t.common.inBag} (${inBagQty})` : t.common.addToBag}</span>
            </button>
          )}
        </div>
      </div>

      {/* Editorial Product Meta */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4 text-left">
        <div>
          <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em]">
            <span className="text-[#9A7B3E]">{product.categoryName}</span>
            {isOutOfStock && (
              <span className="text-red-700 font-bold">
                {t.common.outOfStock}
              </span>
            )}
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="line-clamp-1 font-serif-display text-base sm:text-lg font-medium text-[#1C1917] hover:text-[#9A7B3E] transition-colors"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        {/* Price Row & Interactive Bag / Quantity Controls */}
        <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[#F3EDE4] gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-semibold text-[#1C1917]">
              {formatBDT(product.priceBDT)}
            </span>
            {product.originalPriceBDT && product.originalPriceBDT > product.priceBDT && (
              <span className="text-xs text-[#A8A29E] line-through">
                {formatBDT(product.originalPriceBDT)}
              </span>
            )}
          </div>

          {isOutOfStock ? (
            <span className="border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-800">
              {t.common.outOfStock}
            </span>
          ) : inBagQty > 0 ? (
            <div className="flex items-center border border-[#1C1917] bg-[#FAF7F2]">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateQuantity(product.id, inBagQty - 1);
                }}
                aria-label="Decrease quantity"
                className="p-1.5 text-[#1C1917] hover:bg-[#E7E0D6] transition cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-2 text-xs font-bold text-[#1C1917] min-w-6 text-center">
                {inBagQty}
              </span>
              <button
                type="button"
                disabled={isMaxReached}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isMaxReached) {
                    updateQuantity(product.id, inBagQty + 1);
                  }
                }}
                aria-label="Increase quantity"
                title={isMaxReached ? 'Maximum quantity reached' : 'Increase quantity'}
                className={`p-1.5 transition ${
                  isMaxReached
                    ? 'text-[#A8A29E] bg-[#F3EDE4] cursor-not-allowed opacity-50'
                    : 'text-[#1C1917] hover:bg-[#E7E0D6] cursor-pointer'
                }`}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              aria-label={`Add ${product.name} to cart`}
              className="flex h-8 w-8 items-center justify-center border border-[#E7E0D6] bg-[#FAF7F2] text-[#1C1917] hover:bg-[#1C1917] hover:text-[#FAF7F2] hover:border-[#1C1917] active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/core/models/product.model';
import { formatBDT } from '@/core/utils/currency.util';
import { useCart } from '@/core/services/cart.context';
import { useWishlist } from '@/core/services/wishlist.context';
import {
  X,
  ShoppingBag,
  Zap,
  ArrowRight,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Truck,
  Lock,
  Heart,
} from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#181512]/75 backdrop-blur-xs transition-opacity duration-300"
      onClick={onClose}
    >
      <QuickViewModalContent
        key={product.id}
        product={product}
        onClose={onClose}
      />
    </div>
  );
}

interface QuickViewModalContentProps {
  product: Product;
  onClose: () => void;
}

function QuickViewModalContent({ product, onClose }: QuickViewModalContentProps) {
  const router = useRouter();
  const { addItem, getItemQuantity, setIsCartDrawerOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState<string>(product.imageUrl);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedMessage, setAddedMessage] = useState<boolean>(false);

  const isFavorite = isInWishlist(product.id);

  const maxStock = Math.max(0, Number(product.stock ?? 0));
  const isOutOfStock = maxStock <= 0;
  const inBagQty = getItemQuantity(product.id);
  const maxSelectableQty = Math.max(0, maxStock - inBagQty);
  const isBagAtMax = !isOutOfStock && inBagQty >= maxStock;
  const isPlusLocked =
    isOutOfStock ||
    isBagAtMax ||
    quantity >= maxSelectableQty;

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncrease = () => {
    if (!isPlusLocked) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock || isBagAtMax) return;
    addItem(product, quantity);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
      onClose();
      setIsCartDrawerOpen(true);
    }, 500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (inBagQty === 0) {
      addItem(product, quantity);
    }
    onClose();
    router.push('/checkout');
  };

  const galleryImages = [
    product.imageUrl,
    ...(product.images || []).filter((img) => img !== product.imageUrl),
  ];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-3xl overflow-hidden bg-white border border-[#E7E0D6] shadow-2xl transition-all max-h-[90vh] flex flex-col md:flex-row"
    >
      {/* Top Action Buttons: Wishlist & Close */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`flex h-9 w-9 items-center justify-center transition shadow-xs cursor-pointer ${
            isFavorite
              ? 'bg-[#1C1917] text-[#FAF7F2]'
              : 'bg-white/90 text-[#78716C] hover:text-[#1C1917] hover:bg-white'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${isFavorite ? 'fill-[#C5A059] text-[#C5A059]' : ''}`}
          />
        </button>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="flex h-9 w-9 items-center justify-center bg-white/90 text-[#1C1917] hover:bg-[#1C1917] hover:text-white transition shadow-xs cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Left Column: Image & Thumbnails */}
      <div className="w-full md:w-1/2 bg-[#F3EDE4]/50 p-4 sm:p-6 flex flex-col justify-between">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-white border border-[#E7E0D6]">
          <Image
            src={selectedImage || product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className={`object-cover ${isOutOfStock ? 'opacity-65 grayscale-[30%]' : ''}`}
            priority
          />

          {/* Out of Stock Ribbon */}
          {isOutOfStock && (
            <div className="absolute top-3 left-3 bg-red-900/95 border border-red-300/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-xs">
              Out of Stock
            </div>
          )}
        </div>

        {/* Thumbnail Gallery (if more than 1 image) */}
        {galleryImages.length > 1 && (
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            {galleryImages.map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`relative h-14 w-14 flex-shrink-0 overflow-hidden border transition ${
                  selectedImage === img
                    ? 'border-[#9A7B3E] ring-1 ring-[#9A7B3E]'
                    : 'border-[#E7E0D6] opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Product Info & Actions */}
      <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[85vh] md:max-h-[90vh]">
        <div>
          {/* Category & Stock Badges */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A7B3E]">
              {product.categoryName}
            </span>
            {isOutOfStock ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-red-700">
                <AlertCircle className="w-3 h-3" />
                <span>Out of Stock</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                <CheckCircle className="w-3 h-3" />
                <span>In Stock</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h2
            id="quick-view-title"
            className="font-serif-display text-2xl sm:text-3xl font-medium text-[#1C1917] leading-snug"
          >
            {product.name}
          </h2>

          {/* Price Row */}
          <div className="mt-3 flex items-baseline gap-2.5 pb-4 border-b border-[#F3EDE4]">
            <span className="font-serif-display text-2xl font-semibold text-[#1C1917]">
              {formatBDT(product.priceBDT)}
            </span>
            {product.originalPriceBDT && product.originalPriceBDT > product.priceBDT && (
              <span className="text-sm text-[#A8A29E] line-through">
                {formatBDT(product.originalPriceBDT)}
              </span>
            )}
            <span className="border border-[#C5A059]/40 bg-[#C5A059]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8C6D32]">
              COD Available
            </span>
          </div>

          {/* Description Excerpt */}
          <p className="mt-3.5 text-xs text-[#78716C] leading-relaxed line-clamp-3">
            {product.description}
          </p>

          {/* Guarantees Mini Strip */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-[#78716C] border-y border-[#F3EDE4] py-2.5">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#9A7B3E]" />
              <span>24-48h Dhaka Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9A7B3E]" />
              <span>Inspect Before Payment</span>
            </div>
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1C1917]">
                Quantity
              </span>
              <div className="flex items-center border border-[#1C1917] bg-white">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={handleDecrease}
                  className="p-1.5 text-[#78716C] hover:text-[#1C1917] disabled:opacity-30 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-[#1C1917]">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={isPlusLocked}
                  onClick={handleIncrease}
                  title={isPlusLocked ? 'Maximum limit reached' : 'Increase quantity'}
                  className="p-1.5 text-[#78716C] hover:text-[#1C1917] disabled:opacity-30 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              {isPlusLocked && !isBagAtMax && (
                <span className="text-[10px] text-amber-700 font-medium">Max Limit</span>
              )}
            </div>
          )}
        </div>

        {/* Action CTAs */}
        <div className="mt-6 pt-4 border-t border-[#F3EDE4] space-y-2.5">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="w-full bg-stone-300 text-stone-600 py-3 text-xs font-semibold uppercase tracking-[0.16em] cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : isBagAtMax ? (
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-2 bg-stone-800 text-[#E6D5B8] py-3 text-xs font-semibold uppercase tracking-[0.16em] cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Max Limit in Bag</span>
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 boutique-btn-primary py-3 text-xs uppercase tracking-[0.16em] cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{addedMessage ? 'Added to Bag!' : 'Add to Bag'}</span>
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full flex items-center justify-center gap-2 bg-[#9A7B3E] hover:bg-[#856832] text-white py-3 text-xs font-semibold uppercase tracking-[0.16em] transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Buy It Now (COD)</span>
              </button>
            </div>
          )}

          {/* View Full Page Link */}
          <div className="text-center pt-2">
            <Link
              href={`/product/${product.slug}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1C1917] hover:text-[#9A7B3E] transition"
            >
              <span>View Full Product Details &amp; Sizing</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

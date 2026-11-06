'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/core/models/product.model';
import { productService } from '@/core/services/product.service';
import { formatBDT } from '@/core/utils/currency.util';
import { useCart } from '@/core/services/cart.context';
import { ProductCard } from '@/shared/product-card/product-card.component';
import {
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

interface ProductDetailFeatureProps {
  product: Product;
}

export function ProductDetailFeature({ product }: ProductDetailFeatureProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  const relatedProducts = productService
    .getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-14">
      {/* Breadcrumb & Back link */}
      <div className="mb-8 flex items-center justify-between border-b border-[#E7E0D6] pb-4">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#78716C] hover:text-[#1C1917] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Collection</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#A8A29E]">
          <Link href="/" className="hover:text-[#1C1917]">Home</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-[#1C1917]">
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="text-[#1C1917] truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* Main Product 2-Column Editorial Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14">
        {/* Left: Portrait 4:5 Product Image Frame */}
        <div className="md:col-span-6">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F3EDE4] border border-[#E7E0D6]">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />

            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && (
                <span className="bg-[#FAF7F2]/95 border border-[#E6D5B8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1C1917]">
                  New Arrival
                </span>
              )}
              {product.category === 'earrings' && (
                <span className="bg-[#181512]/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#E6D5B8]">
                  French Silicone Ear Clip
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Boutique Details & Purchase Controls */}
        <div className="md:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="border border-[#E6D5B8] bg-[#FAF7F2] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A7B3E]">
                {product.categoryName}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>In Stock ({product.stock} pieces ready to ship)</span>
              </span>
            </div>

            <h1 className="font-serif-display text-3xl sm:text-5xl font-medium text-[#1C1917] leading-tight">
              {product.name}
            </h1>

            {/* Price & COD Tag */}
            <div className="mt-5 pb-6 border-b border-[#E7E0D6] flex flex-wrap items-baseline gap-3.5">
              <span className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#1C1917]">
                {formatBDT(product.priceBDT)}
              </span>
              {product.originalPriceBDT && product.originalPriceBDT > product.priceBDT && (
                <span className="text-base text-[#A8A29E] line-through">
                  {formatBDT(product.originalPriceBDT)}
                </span>
              )}
              <span className="border border-[#C5A059]/40 bg-[#C5A059]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8C6D32]">
                Cash on Delivery Available
              </span>
            </div>

            <p className="mt-6 text-xs sm:text-sm text-[#78716C] leading-relaxed">
              {product.description}
            </p>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-[#E7E0D6] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[#78716C]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mt-7 flex items-center gap-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1C1917]">
                Quantity
              </span>
              <div className="flex items-center border border-[#1C1917] bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-bold text-[#1C1917]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2.5 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
              <button
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2.5 boutique-btn-primary py-4 px-6 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="flex flex-1 items-center justify-center gap-2 boutique-btn-outline py-4 px-6 cursor-pointer"
              >
                <span>Buy It Now (COD)</span>
              </button>
            </div>

            {addedNotice && (
              <div className="mt-4 flex items-center gap-2 border border-[#C5A059] bg-white px-4 py-2.5 text-xs font-medium text-[#1C1917]">
                <CheckCircle className="w-4 h-4 text-[#9A7B3E]" />
                <span>Added to your shopping bag.</span>
              </div>
            )}
          </div>

          {/* Boutique Craftsmanship & Delivery Box */}
          <div className="mt-8 border border-[#E7E0D6] bg-white p-5 space-y-3.5 text-xs text-[#78716C]">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#C5A059] mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-[#1C1917] uppercase tracking-wider text-[11px] block">
                  Comfort &amp; Material
                </strong>
                <span>
                  {product.category === 'earrings'
                    ? 'Includes soft transparent silicone clip cushions for zero-pinch comfort on unpierced or pierced ears.'
                    : 'Crafted with tarnish-resistant finish for effortless everyday stacking.'}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 pt-3 border-t border-[#F3EDE4]">
              <Truck className="w-4 h-4 text-[#C5A059] mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-[#1C1917] uppercase tracking-wider text-[11px] block">
                  Bangladesh Delivery Rates
                </strong>
                <span>Inside Dhaka ৳60 (24–48 hours) • Outside Dhaka ৳120 (3–4 days).</span>
              </div>
            </div>
            <div className="flex items-start gap-3 pt-3 border-t border-[#F3EDE4]">
              <ShieldCheck className="w-4 h-4 text-[#C5A059] mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-[#1C1917] uppercase tracking-wider text-[11px] block">
                  Doorstep Inspection
                </strong>
                <span>Check your package upon arrival before paying the courier agent.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products ("You May Also Like") */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-14 border-t border-[#E7E0D6]">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A7B3E] block mb-1.5">
                Complete the Look
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl font-medium text-[#1C1917]">
                You May Also Like
              </h2>
            </div>
            <Link
              href={`/shop?category=${product.category}`}
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1C1917] hover:text-[#9A7B3E]"
            >
              View All {product.categoryName} →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

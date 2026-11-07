'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/core/models/product.model';
import { productService } from '@/core/services/product.service';
import { storeLinkService } from '@/core/services/store-link.service';
import { orderService } from '@/core/services/order.service';
import { formatBDT } from '@/core/utils/currency.util';
import { useCart } from '@/core/services/cart.context';
import { useWishlist } from '@/core/services/wishlist.context';
import { useI18n } from '@/core/i18n/i18n.context';
import { ProductCard } from '@/shared/product-card/product-card.component';
import { ProductLightbox } from './components/product-lightbox.component';
import {
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  CheckCircle,
  Sparkles,
  Lock,
  AlertCircle,
  Maximize2,
  Copy,
  Check,
  Share2,
  Heart,
} from 'lucide-react';

interface ProductDetailFeatureProps {
  product: Product;
}

export function ProductDetailFeature({ product: initialProduct }: ProductDetailFeatureProps) {
  const router = useRouter();
  const { t } = useI18n();
  const { addItem, getItemQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<Product>(
    () => productService.getProductById(initialProduct.id) || initialProduct
  );
  const isFavorite = isInWishlist(product.id);
  const [selectedImage, setSelectedImage] = useState<string>(initialProduct.imageUrl);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  // Sync live stock from Supabase on mount
  useEffect(() => {
    void productService.syncFromDatabase().then(() => {
      const updated = productService.getProductById(initialProduct.id);
      if (updated) {
        setProduct({ ...updated });
        setSelectedImage(updated.imageUrl);
      }
    });
  }, [initialProduct.id]);

  const maxStock = Math.max(0, Number(product.stock ?? 0));
  const isOutOfStock = maxStock <= 0;
  const inBagQty = getItemQuantity(product.id);
  const remainingAvailable = Math.max(0, maxStock - inBagQty);
  const isBagAtMax = !isOutOfStock && remainingAvailable <= 0;
  const maxSelectableQty = Math.max(1, remainingAvailable);
  const isPlusLocked = isOutOfStock || isBagAtMax || quantity >= maxSelectableQty;

  const extraImages = Array.isArray(product.images)
    ? product.images.filter((img) => typeof img === 'string' && img && img !== product.imageUrl)
    : [];
  const galleryImages = [
    product.imageUrl,
    ...extraImages,
  ].filter(Boolean);

  const relatedProducts = productService
    .getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    if (isPlusLocked) return;
    setQuantity((prev) => Math.min(maxSelectableQty, prev + 1));
  };

  const handleAddToCart = () => {
    if (isOutOfStock || isBagAtMax) return;
    const toAdd = Math.min(remainingAvailable, Math.max(1, quantity));
    addItem(product, toAdd);
    setQuantity(1);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (!isBagAtMax) {
      const toAdd = Math.min(remainingAvailable, Math.max(1, quantity));
      addItem(product, toAdd);
    }
    router.push('/checkout');
  };

  // 1. Direct "Order via WhatsApp" Handler
  const handleWhatsAppOrder = () => {
    const rawLink = storeLinkService.getLinkByKey('whatsapp')?.url || '';
    // Normalize phone number (digits only or wa.me)
    let cleanPhone = '';
    if (rawLink) {
      const match = rawLink.match(/\d+/g);
      if (match) {
        const digits = match.join('');
        if (digits && digits !== '8801700000000' && digits !== '01700000000') {
          cleanPhone = digits.startsWith('01') ? `88${digits}` : digits;
        }
      }
    }
    // Fallback to active store phone / bKash contact if WhatsApp link not configured
    if (!cleanPhone) {
      const storePhone = orderService.getBkashNumber();
      const match = storePhone.match(/\d+/g);
      if (match) {
        const digits = match.join('');
        cleanPhone = digits.startsWith('01') ? `88${digits}` : digits;
      }
    }
    if (!cleanPhone) {
      cleanPhone = '8801760887297';
    }

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const message = `Hello MELO! I would like to order:
💎 *${product.name}*
💵 Price: ৳${product.priceBDT.toLocaleString()}
📦 Quantity: ${quantity}
🔗 Link: ${currentUrl}

Please confirm availability and Cash on Delivery details. Thank you!`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // 2. Social Sharing Handlers
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      void navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Look at this beautiful piece from MELO: ${product.name} (৳${product.priceBDT.toLocaleString()}) — ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareFacebook = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const handleNativeShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: `${product.name} | MELO Dhaka`,
          text: `Check out ${product.name} at MELO Jewellery.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const openLightboxWithImage = (imgUrl: string) => {
    const idx = galleryImages.indexOf(imgUrl);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setIsLightboxOpen(true);
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
          <span>{t.productDetail.backToCollection}</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#A8A29E]">
          <Link href="/" className="hover:text-[#1C1917]">
            {t.nav.home}
          </Link>
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
        {/* Left Column: Portrait 4:5 Product Image Gallery & Lightbox Trigger */}
        <div className="md:col-span-6 space-y-3">
          {/* Main Large Image Frame */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => openLightboxWithImage(selectedImage || product.imageUrl)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightboxWithImage(selectedImage || product.imageUrl);
              }
            }}
            className="group relative aspect-[4/5] w-full overflow-hidden bg-[#F3EDE4] border border-[#E7E0D6] cursor-zoom-in text-left block select-none"
            aria-label={`Enlarge and inspect ${product.name} image`}
          >
            <Image
              src={selectedImage || product.imageUrl}
              alt={product.name}
              fill
              priority
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                isOutOfStock ? 'opacity-65 grayscale-[30%]' : ''
              }`}
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
              {isOutOfStock ? (
                <span className="bg-red-900/95 border border-red-300/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  {t.common.outOfStock}
                </span>
              ) : (
                <>
                  {product.isNew && (
                    <span className="bg-[#FAF7F2]/95 border border-[#E6D5B8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1C1917]">
                      {t.common.newBadge}
                    </span>
                  )}
                  {product.category === 'earrings' && (
                    <span className="bg-[#181512]/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#E6D5B8]">
                      {t.productDetail.earClipBadge}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Click to Zoom Hover Badge */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-[#181512]/85 backdrop-blur-xs text-[#FAF7F2] px-3 py-1.5 text-[10px] uppercase tracking-wider opacity-90 group-hover:opacity-100 transition shadow-sm pointer-events-none">
              <Maximize2 className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="hidden sm:inline">{t.productDetail.clickToZoom}</span>
              <span className="sm:hidden">{t.productDetail.tapToZoom}</span>
            </div>
          </div>

          {/* Thumbnail Strip (if multiple photos available) */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden border-2 transition cursor-pointer ${
                    selectedImage === img
                      ? 'border-[#9A7B3E] ring-1 ring-[#9A7B3E]'
                      : 'border-[#E7E0D6] opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`Select product image view ${idx + 1}`}
                >
                  <Image src={img} alt={`View ${idx + 1}`} fill unoptimized className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Boutique Details, Actions & Sharing */}
        <div className="md:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="border border-[#E6D5B8] bg-[#FAF7F2] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A7B3E]">
                {product.categoryName}
              </span>
              {isOutOfStock ? (
                <span className="flex items-center gap-1.5 text-xs text-red-700 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{t.common.outOfStock}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>
                    {t.common.inStock}
                    {inBagQty > 0 ? ` • ${inBagQty} in your bag` : ''}
                  </span>
                </span>
              )}
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
                {t.checkout.codTitle}
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

            {/* Quantity Selector with Stock Lock */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1C1917]">
                {t.productDetail.qty}
              </span>
              <div className="flex items-center border border-[#1C1917] bg-white">
                <button
                  type="button"
                  disabled={isOutOfStock || quantity <= 1}
                  onClick={handleDecrease}
                  className={`p-2.5 transition ${
                    isOutOfStock || quantity <= 1
                      ? 'text-[#A8A29E] bg-[#F3EDE4] cursor-not-allowed opacity-50'
                      : 'text-[#78716C] hover:text-[#1C1917] cursor-pointer'
                  }`}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-bold text-[#1C1917]">
                  {isOutOfStock ? 0 : isBagAtMax ? 0 : quantity}
                </span>
                <button
                  type="button"
                  disabled={isPlusLocked}
                  onClick={handleIncrease}
                  title={isPlusLocked ? t.common.maxLimit : 'Increase quantity'}
                  className={`p-2.5 transition ${
                    isPlusLocked
                      ? 'text-[#A8A29E] bg-[#F3EDE4] cursor-not-allowed opacity-50'
                      : 'text-[#78716C] hover:text-[#1C1917] cursor-pointer'
                  }`}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {!isOutOfStock && isPlusLocked && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1">
                  <Lock className="w-3 h-3" />
                  <span>{t.common.maxLimit}</span>
                </span>
              )}
            </div>

            {/* Standard Purchase Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {isOutOfStock ? (
                <button
                  type="button"
                  disabled
                  className="flex flex-1 items-center justify-center gap-2.5 bg-stone-300 text-stone-600 py-3.5 px-6 text-xs font-semibold uppercase tracking-[0.16em] cursor-not-allowed"
                >
                  <span>{t.common.outOfStock}</span>
                </button>
              ) : isBagAtMax ? (
                <button
                  type="button"
                  disabled
                  className="flex flex-1 items-center justify-center gap-2.5 bg-stone-800 text-[#E6D5B8] py-3.5 px-6 text-xs font-semibold uppercase tracking-[0.16em] cursor-not-allowed"
                >
                  <Lock className="w-4 h-4" />
                  <span>{t.common.maxLimit}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-2.5 boutique-btn-primary py-3.5 px-6 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.common.addToBag}</span>
                </button>
              )}

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className={`flex flex-1 items-center justify-center gap-2 py-3.5 px-6 ${
                  isOutOfStock
                    ? 'border border-stone-300 text-stone-400 cursor-not-allowed text-xs font-semibold uppercase tracking-[0.16em]'
                    : 'boutique-btn-outline cursor-pointer'
                }`}
              >
                <span>{isOutOfStock ? t.common.outOfStock : t.productDetail.buyNow}</span>
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 border transition flex items-center justify-center gap-2 cursor-pointer ${
                  isFavorite
                    ? 'border-[#C5A059] bg-[#1C1917] text-[#FAF7F2]'
                    : 'border-[#E7E0D6] bg-white text-[#1C1917] hover:border-[#1C1917]'
                }`}
                title={isFavorite ? 'Remove from Wishlist' : 'Save to Wishlist'}
                aria-label="Toggle Wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${isFavorite ? 'fill-[#C5A059] text-[#C5A059]' : ''}`}
                />
                <span className="sm:hidden text-xs font-semibold uppercase tracking-wider">
                  {isFavorite ? 'Saved' : 'Save'}
                </span>
              </button>
            </div>

            {/* Direct 1-Click "Order via WhatsApp" Button */}
            {!isOutOfStock && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#0F5A47] hover:bg-[#0A4133] text-[#FAF7F2] py-3.5 px-6 text-xs font-semibold uppercase tracking-[0.16em] transition shadow-xs cursor-pointer border border-[#0F5A47]"
                  title={t.productDetail.orderViaWhatsApp}
                >
                  {/* WhatsApp SVG Icon */}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 fill-[#25D366]"
                    aria-hidden="true"
                  >
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.771.82 2.791.82 3.182 0 5.768-2.587 5.768-5.766.001-3.181-2.585-5.766-5.768-5.766zm9.969 5.766c0 5.505-4.495 10-10 10-1.745 0-3.376-.454-4.799-1.246l-5.201 1.362 1.39-5.078c-.902-1.488-1.39-3.208-1.39-5.038 0-5.505 4.495-10 10-10s10 4.495 10 10z" />
                  </svg>
                  <span>{t.productDetail.orderViaWhatsApp}</span>
                </button>
              </div>
            )}

            {addedNotice && (
              <div className="mt-3 flex items-center gap-2 border border-[#C5A059] bg-white px-4 py-2.5 text-xs font-medium text-[#1C1917]">
                <CheckCircle className="w-4 h-4 text-[#9A7B3E]" />
                <span>{t.productDetail.addedToBagNotice}</span>
              </div>
            )}

            {/* Social Share Toolbar (WhatsApp / Facebook / Copy Link) */}
            <div className="mt-6 pt-5 border-t border-[#F3EDE4] flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#78716C]">
                {t.productDetail.share}:
              </span>

              <div className="flex items-center gap-2">
                {/* Share on WhatsApp */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="inline-flex items-center gap-1.5 border border-[#E7E0D6] bg-white hover:border-[#25D366] hover:text-[#0F5A47] px-3 py-1.5 text-xs text-[#1C1917] transition cursor-pointer"
                  title="Share on WhatsApp"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5 fill-[#25D366]"
                    aria-hidden="true"
                  >
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.771.82 2.791.82 3.182 0 5.768-2.587 5.768-5.766.001-3.181-2.585-5.766-5.768-5.766zm9.969 5.766c0 5.505-4.495 10-10 10-1.745 0-3.376-.454-4.799-1.246l-5.201 1.362 1.39-5.078c-.902-1.488-1.39-3.208-1.39-5.038 0-5.505 4.495-10 10-10s10 4.495 10 10z" />
                  </svg>
                  <span>{t.productDetail.shareWhatsApp}</span>
                </button>

                {/* Share on Facebook */}
                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="inline-flex items-center gap-1.5 border border-[#E7E0D6] bg-white hover:border-[#1877F2] hover:text-[#1877F2] px-3 py-1.5 text-xs text-[#1C1917] transition cursor-pointer"
                  title="Share on Facebook"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5 fill-[#1877F2]"
                    aria-hidden="true"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>{t.productDetail.shareFacebook}</span>
                </button>

                {/* Copy Link Button */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs transition cursor-pointer ${
                    copiedLink
                      ? 'border-[#9A7B3E] bg-[#FAF7F2] text-[#9A7B3E]'
                      : 'border-[#E7E0D6] bg-white text-[#1C1917] hover:border-[#1C1917]'
                  }`}
                  title={t.productDetail.copyLink}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.productDetail.linkCopied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#78716C]" />
                      <span>{t.productDetail.copyLink}</span>
                    </>
                  )}
                </button>

                {/* Native Device Share Sheet (Mobile) */}
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="sm:hidden p-1.5 border border-[#E7E0D6] bg-white text-[#1C1917] hover:border-[#1C1917] cursor-pointer"
                  title="More share options"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
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
                {t.productDetail.relatedSubtitle}
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl font-medium text-[#1C1917]">
                {t.productDetail.relatedTitle}
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

      {/* Fullscreen High-Resolution Lightbox & Detail Zoom */}
      <ProductLightbox
        images={galleryImages}
        initialIndex={lightboxIndex}
        productName={product.name}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
}

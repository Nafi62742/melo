'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/core/models/product.model';
import { ProductType } from '@/core/models/product-type.model';
import { productService, PRODUCTS_UPDATED_EVENT } from '@/core/services/product.service';
import {
  productTypeService,
  PRODUCT_TYPES_UPDATED_EVENT,
} from '@/core/services/product-type.service';
import { INITIAL_CATEGORIES } from '@/core/data/categories.data';
import { ProductCard } from '@/shared/product-card/product-card.component';
import { useI18n } from '@/core/i18n/i18n.context';
import { initRevealObserver } from '@/core/utils/reveal.util';
import { Sparkles, ArrowRight, ShieldCheck, Truck, Heart, Gem } from 'lucide-react';

interface DisplayCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  itemCount: number;
  imageUrl?: string;
}

export function HomeFeature() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [allProducts, setAllProducts] = useState<Product[]>(() => productService.getAllProducts());
  const [productTypes, setProductTypes] = useState<ProductType[]>(() =>
    productTypeService.getAllProductTypes()
  );

  useEffect(() => {
    void productService.syncFromDatabase().then((remote) => {
      setAllProducts([...remote]);
    });

    const handleProductsUpdate = () => {
      setAllProducts([...productService.getAllProducts()]);
    };
    const handleProductTypesUpdate = () => {
      setProductTypes([...productTypeService.getAllProductTypes()]);
    };

    window.addEventListener(PRODUCTS_UPDATED_EVENT, handleProductsUpdate);
    window.addEventListener(PRODUCT_TYPES_UPDATED_EVENT, handleProductTypesUpdate);

    return () => {
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, handleProductsUpdate);
      window.removeEventListener(PRODUCT_TYPES_UPDATED_EVENT, handleProductTypesUpdate);
    };
  }, []);

  const heroPrimaryProduct = useMemo(
    () =>
      allProducts.find((p) => p.slug === 'earring-wreath-flowers') ||
      allProducts.find((p) => p.isFeatured) ||
      allProducts[0],
    [allProducts]
  );

  const heroSecondaryProduct = useMemo(
    () =>
      allProducts.find((p) => p.slug === 'ring-j008-gold') ||
      allProducts.find((p) => p.category === 'rings') ||
      allProducts[1],
    [allProducts]
  );

  const newArrivals = useMemo(
    () => allProducts.filter((p) => p.isNew).slice(0, 4),
    [allProducts]
  );

  const curatedProducts = useMemo(() => {
    if (activeTab === 'all') {
      return allProducts.filter((p) => p.isFeatured).slice(0, 8);
    }
    return allProducts.filter((p) => p.category === activeTab).slice(0, 8);
  }, [activeTab, allProducts]);

  const displayCategories: DisplayCategory[] = useMemo(() => {
    if (productTypes.length === 0) {
      return INITIAL_CATEGORIES.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        itemCount: allProducts.filter((p) => p.category === cat.slug).length,
        imageUrl: cat.imageUrl,
      }));
    }
    return productTypes.map((pt: ProductType) => {
      const matchingInitial = INITIAL_CATEGORIES.find((c) => c.slug === pt.slug);
      const count = allProducts.filter((p) => p.category === pt.slug).length;
      const fallbackImage =
        allProducts.find((p) => p.category === pt.slug)?.imageUrl ||
        '/products/earrings/Wreath%20Flowers.webp';
      return {
        id: pt.slug,
        name: pt.name,
        slug: pt.slug,
        description:
          pt.description ||
          matchingInitial?.description ||
          `Explore our handpicked ${pt.name.toLowerCase()} collection.`,
        itemCount: count,
        imageUrl: matchingInitial?.imageUrl || fallbackImage,
      };
    });
  }, [productTypes, allProducts]);

  const filterTabs = useMemo(() => {
    const tabs: Array<{ id: string; label: string }> = [{ id: 'all', label: 'Featured' }];
    for (const pt of productTypes) {
      tabs.push({ id: pt.slug, label: pt.name });
    }
    return tabs;
  }, [productTypes]);

  useEffect(() => {
    const observer = initRevealObserver();
    return () => observer?.disconnect();
  }, [activeTab]);

  return (
    <div className="flex flex-col pb-20">
      {/* 1. Asymmetric Split Editorial Hero (Wix Studio + Blingg 04 + Deweler Fusion) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F3EDE4]/80 via-[#FAF7F2] to-[#FAF7F2] pt-8 pb-16 md:pt-14 md:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Typography & CTAs */}
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] aurora-badge mb-6 reveal">
                <Sparkles className="w-3.5 h-3.5 text-[#9A7B3E]" />
                <span>{t.hero.badge}</span>
              </div>

              <h1 className="font-serif-display text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-[#1C1917] leading-[1.08] reveal delay-1">
                Where Little Wonders{' '}
                <span className="italic font-normal text-[#9A7B3E] block sm:inline">
                  Light Up.
                </span>
              </h1>

              <p className="mt-6 text-sm sm:text-base text-[#78716C] max-w-xl leading-relaxed reveal delay-2">
                {t.hero.subheading}
              </p>

              {/* Dual Boutique CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4 reveal delay-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-3 boutique-btn-primary px-8 py-4"
                >
                  <span>{t.hero.shopNow}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/shop?category=earrings"
                  className="inline-flex items-center gap-2 boutique-btn-outline px-7 py-4"
                >
                  <span>French Ear Clips</span>
                </Link>
              </div>

              {/* Architectural Trust Metrics */}
              <div className="mt-12 pt-8 border-t border-[#E7E0D6] grid grid-cols-3 gap-4 max-w-lg reveal delay-4">
                <div>
                  <div className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1917]">
                    {allProducts.length}+
                  </div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-[#78716C] mt-0.5">
                    Curated Pieces
                  </div>
                </div>
                <div className="border-l border-[#E7E0D6] pl-4">
                  <div className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1917]">
                    100%
                  </div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-[#78716C] mt-0.5">
                    Painless Clips
                  </div>
                </div>
                <div className="border-l border-[#E7E0D6] pl-4">
                  <div className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1917]">
                    COD
                  </div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-[#78716C] mt-0.5">
                    All Bangladesh
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Arch-Masked Hero Showcase & Overlapping Miniature Card */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end reveal delay-2">
              <div className="relative w-full max-w-md">
                {/* Decorative Offset Gold Hairline Arch */}
                <div className="absolute -inset-3 arch-frame border border-[#C5A059]/40 pointer-events-none" />

                {/* Main Tall Arch Showcase Image */}
                <Link
                  href={heroPrimaryProduct ? `/product/${heroPrimaryProduct.slug}` : '/shop'}
                  className="group relative block aspect-[4/5] w-full overflow-hidden arch-frame bg-[#F3EDE4] border border-[#E7E0D6] shadow-2xl"
                >
                  <Image
                    src={heroPrimaryProduct?.imageUrl || '/products/earrings/Wreath%20Flowers.webp'}
                    alt={
                      heroPrimaryProduct
                        ? `${heroPrimaryProduct.name} — ${heroPrimaryProduct.categoryName}`
                        : 'Wreath Flowers — French Light Luxury Ear Clip'
                    }
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 420px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181512]/60 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-[#FAF7F2]">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#E6D5B8] block">
                        Signature Piece
                      </span>
                      <span className="font-serif-display text-2xl font-medium">
                        {heroPrimaryProduct?.name || 'Wreath Flowers Ear Clip'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#FAF7F2] px-3 py-1 text-xs font-semibold text-[#1C1917]">
                      {heroPrimaryProduct?.originalPriceBDT &&
                        heroPrimaryProduct.originalPriceBDT > heroPrimaryProduct.priceBDT && (
                          <span className="text-[10px] line-through text-[#78716C] font-normal">
                            ৳{heroPrimaryProduct.originalPriceBDT.toLocaleString()}
                          </span>
                        )}
                      <span>
                        ৳{(heroPrimaryProduct?.priceBDT ?? 236).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Floating Secondary Editorial Card (Bottom-Left Overlap) */}
                <Link
                  href={heroSecondaryProduct ? `/product/${heroSecondaryProduct.slug}` : '/shop'}
                  className="hidden sm:flex items-center gap-3.5 absolute -bottom-6 -left-8 bg-white/95 backdrop-blur-md border border-[#E7E0D6] p-3 shadow-xl hover:border-[#C5A059] transition-all max-w-[240px]"
                >
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden bg-[#F3EDE4] border border-[#E7E0D6]">
                    <Image
                      src={heroSecondaryProduct?.imageUrl || '/products/rings/J008%20gold.webp'}
                      alt={heroSecondaryProduct?.name || 'Minimalist Band - J008 Gold'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="pr-2">
                    <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9A7B3E]">
                      {heroSecondaryProduct?.categoryName || '316L Steel'}
                    </div>
                    <div className="font-serif-display text-sm font-semibold text-[#1C1917] line-clamp-1">
                      {heroSecondaryProduct?.name || 'J008 Gold Band'}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-semibold text-[#1C1917]">
                        ৳{(heroSecondaryProduct?.priceBDT ?? 192).toLocaleString()}
                      </span>
                      {heroSecondaryProduct?.originalPriceBDT &&
                        heroSecondaryProduct.originalPriceBDT > heroSecondaryProduct.priceBDT && (
                          <span className="text-[10px] line-through text-[#78716C] font-normal">
                            ৳{heroSecondaryProduct.originalPriceBDT.toLocaleString()}
                          </span>
                        )}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Boutique Editorial Value Strip */}
      <div className="border-y border-[#E7E0D6] bg-[#F3EDE4]/70 py-3.5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center sm:justify-between gap-4 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#78716C]">
          <span className="flex items-center gap-2">
            <span className="text-[#C5A059]">✦</span> Painless Silicone Cushion Ear Clips
          </span>
          <span className="hidden md:flex items-center gap-2">
            <span className="text-[#C5A059]">✦</span> Tarnish-Free 316L Stainless Steel Rings
          </span>
          <span className="flex items-center gap-2">
            <span className="text-[#C5A059]">✦</span> Inspect Before You Pay (COD)
          </span>
        </div>
      </div>

      {/* 3. Tall Portrait Category Showcase (Blingg 04 / Jewelix Inspired) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-16 md:pt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 reveal">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9A7B3E] block mb-2">
              Shop by Department
            </span>
            <h2 className="font-serif-display text-3xl sm:text-5xl font-medium text-[#1C1917]">
              {t.categories.title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#78716C] max-w-md">
            {t.categories.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
          {displayCategories.map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className={`group relative flex flex-col overflow-hidden bg-white border border-[#E7E0D6] transition-all duration-500 hover:border-[#C5A059] reveal delay-${idx + 1}`}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F3EDE4]">
                {cat.imageUrl && (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#181512]/75 via-[#181512]/15 to-transparent" />

                {/* Top Right Count Badge */}
                <span className="absolute top-4 right-4 bg-[#FAF7F2]/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1C1917]">
                  {cat.itemCount} Pieces
                </span>

                {/* Bottom Editorial Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 text-[#FAF7F2]">
                  <h3 className="font-serif-display text-3xl font-medium tracking-wide">
                    {cat.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#E7E0D6]/90 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E6D5B8] group-hover:text-white transition-colors">
                    <span>Explore {cat.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Curated Collection with Interactive Category Switcher (Deweler Pattern) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-20 md:pt-28">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6 reveal">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9A7B3E] block mb-2">
              Curated Selection
            </span>
            <h2 className="font-serif-display text-3xl sm:text-5xl font-medium text-[#1C1917]">
              Signature Jewellery
            </h2>
          </div>

          {/* Interactive Boutique Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#1C1917] text-[#FAF7F2]'
                    : 'bg-white border border-[#E7E0D6] text-[#78716C] hover:border-[#1C1917] hover:text-[#1C1917]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {curatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2.5 boutique-btn-outline px-8 py-3.5"
          >
            <span>View Full Collection ({allProducts.length} Pieces)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. Editorial Split Storytelling Banner (Jewelix Craftsmanship Section) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-20 md:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#E7E0D6] bg-white overflow-hidden">
          {/* Left Visual Column */}
          <div className="lg:col-span-6 relative min-h-[340px] sm:min-h-[440px] bg-[#F3EDE4]">
            <Image
              src="/products/earrings/Love%20Cross-Link%20all%20with%20transparent%20silicone%20cushion.webp"
              alt="French Ear Clips with Transparent Silicone Cushion"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Right Editorial Narrative Column */}
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[#FAF7F2]">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9A7B3E] mb-3">
              <Gem className="w-3.5 h-3.5" />
              <span>The MELO Ear Clip Craftsmanship</span>
            </div>

            <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C1917] leading-tight">
              All the Elegance.{' '}
              <span className="italic font-normal text-[#9A7B3E]">Zero Piercing Pain.</span>
            </h2>

            <p className="mt-5 text-xs sm:text-sm text-[#78716C] leading-relaxed">
              Every pair of MELO French ear clips comes fitted with an ultra-soft, removable transparent silicone cushion. Whether your ears are unpierced or sensitive to heavy studs, our featherlight clips stay secure from morning coffee to evening celebrations without pinching.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-[#E7E0D6] text-xs">
              <div>
                <div className="font-semibold text-[#1C1917] uppercase tracking-wider text-[11px]">
                  Silicone Cushion Pad
                </div>
                <p className="text-[#78716C] mt-1">
                  Distributes pressure evenly for all-day comfort.
                </p>
              </div>
              <div>
                <div className="font-semibold text-[#1C1917] uppercase tracking-wider text-[11px]">
                  316L Titanium Steel Rings
                </div>
                <p className="text-[#78716C] mt-1">
                  Water-resistant, non-tarnish gold &amp; silver finishes.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/shop?category=earrings"
                className="inline-flex items-center gap-2.5 boutique-btn-primary px-7 py-3.5"
              >
                <span>Discover Ear Clips</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. New Arrivals This Week */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-20 md:pt-28">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4 reveal">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9A7B3E] block mb-2">
              Fresh Drops
            </span>
            <h2 className="font-serif-display text-3xl sm:text-5xl font-medium text-[#1C1917]">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1C1917] hover:text-[#9A7B3E] transition"
          >
            <span>Browse All New</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. Dark Espresso Luxury Brand Promise Banner (Deweler Contrast Section) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-20 md:pt-28">
        <div className="bg-[#181512] border border-[#2E2925] p-8 sm:p-14 lg:p-16 text-[#FAF7F2] relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <span className="inline-block border border-[#C5A059]/40 bg-[#C5A059]/10 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E6D5B8]">
                The MELO Guarantee
              </span>
              <h2 className="mt-4 font-serif-display text-3xl sm:text-5xl font-medium tracking-tight text-[#FAF7F2]">
                A Little Something <span className="italic font-normal text-[#C5A059]">For Everyone.</span>
              </h2>
              <p className="mt-4 text-xs sm:text-sm text-[#A8A29E] leading-relaxed max-w-xl">
                Shopping for jewellery online in Bangladesh should feel effortless and reassuring. Every piece is hand-inspected in Dhaka, packed with protective cushions, and delivered to your doorstep with Cash on Delivery.
              </p>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 border-t lg:border-t-0 lg:border-l border-[#2E2925] pt-6 lg:pt-0 lg:pl-10">
              <div className="flex items-center gap-3.5">
                <ShieldCheck className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#FAF7F2]">
                    100% Quality Checked
                  </div>
                  <div className="text-[11px] text-[#A8A29E]">Hand-inspected before dispatch</div>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <Truck className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#FAF7F2]">
                    Pathao &amp; Steadfast Courier
                  </div>
                  <div className="text-[11px] text-[#A8A29E]">Fast doorstep COD nationwide</div>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <Heart className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#FAF7F2]">
                    Hypoallergenic Comfort
                  </div>
                  <div className="text-[11px] text-[#A8A29E]">Gentle on sensitive skin &amp; ears</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productService } from '@/core/services/product.service';
import { INITIAL_CATEGORIES } from '@/core/data/categories.data';
import { ProductCard } from '@/shared/product-card/product-card.component';
import { HeroSlideshow } from '@/shared/hero-slideshow/hero-slideshow.component';
import { useI18n } from '@/core/i18n/i18n.context';
import { initRevealObserver } from '@/core/utils/reveal.util';
import { Sparkles, ArrowRight, ShieldCheck, Truck, Heart } from 'lucide-react';

export function HomeFeature() {
  const { t } = useI18n();
  const featuredProducts = productService.getFeaturedProducts().slice(0, 8);
  const newArrivals = productService.getNewArrivals().slice(0, 4);

  useEffect(() => {
    const observer = initRevealObserver();
    return () => observer?.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-100/35 via-rose-50/20 to-transparent pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Soft Warm Champagne Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-amber-300/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 h-72 w-72 rounded-full bg-rose-300/15 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold aurora-badge mb-6 reveal">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-stone-900 reveal delay-1 max-w-3xl mx-auto">
            Where Little Wonders <span className="aurora-gradient-text">Light Up</span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed reveal delay-2">
            {t.hero.subheading}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 reveal delay-3">
            <Link
              href="/shop"
              className="flex items-center gap-2 rounded-full bg-stone-900 px-7 py-3 text-sm font-bold text-amber-100 shadow-lg shadow-stone-900/15 hover:bg-amber-800 hover:text-white active:scale-95 transition"
            >
              <span>{t.hero.shopNow}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/shop?category=earrings"
              className="rounded-full border border-stone-300 bg-white/90 px-6 py-3 text-sm font-bold text-stone-800 backdrop-blur-sm hover:bg-white hover:border-amber-600 hover:text-amber-900 transition"
            >
              French Ear Clips
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Slideshow (Real Studio & Customer Shots) */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 w-full -mt-4 sm:-mt-16 md:-mt-20 reveal delay-3">
        <HeroSlideshow />
      </section>

      {/* Categories Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-xl mx-auto mb-10 reveal">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {t.categories.title}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-500">
            {t.categories.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_CATEGORIES.map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className={`group relative overflow-hidden rounded-3xl glass-card border border-stone-200/70 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:border-amber-400/40 reveal delay-${idx + 1}`}
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-stone-100 mb-5">
                {cat.imageUrl && (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-bold text-stone-900">
                  {cat.itemCount} Items
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-800 transition">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-xs text-stone-500 line-clamp-1">{cat.description}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-800 group-hover:bg-amber-700 group-hover:text-white transition">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4 reveal">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
              Top Picks
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Featured Earrings & Accessories
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950"
          >
            <span>View All ({productService.getAllProducts().length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              className={`reveal delay-${(idx % 4) + 1}`}
            />
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4 reveal">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-1">
              Fresh Drops
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              New Arrivals This Week
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950"
          >
            <span>See All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              className={`reveal delay-${(idx % 4) + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Why Shop With MELO */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#1c1917] p-8 sm:p-12 text-white relative overflow-hidden border border-amber-900/30 shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <span className="rounded-full bg-amber-500/20 border border-amber-400/30 px-3.5 py-1 text-xs font-bold text-amber-300">
              The MELO Promise
            </span>
            <h2 className="mt-4 text-2xl sm:text-4xl font-black tracking-tight">
              A Little Something For Everyone.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-stone-300 leading-relaxed">
              We know ordering online in Bangladesh requires confidence. That’s why we inspect every single piece, provide comfortable silicone cushions for painless ear clips, and offer hassle-free Cash on Delivery everywhere.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2 text-amber-200">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>100% Quality Checked</span>
              </div>
              <div className="flex items-center gap-2 text-stone-200">
                <Truck className="w-4 h-4 text-rose-400" />
                <span>Pathao & Steadfast Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-stone-200">
                <Heart className="w-4 h-4 text-pink-400" />
                <span>Hypoallergenic & Lightweight</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productService } from '@/core/services/product.service';
import { INITIAL_CATEGORIES } from '@/core/data/categories.data';
import { ProductCard } from '@/shared/product-card/product-card.component';
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
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-100/40 via-cyan-50/20 to-transparent pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Soft Aurora Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-violet-400/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold aurora-badge mb-6 reveal">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-neutral-900 reveal delay-1 max-w-3xl mx-auto">
            Where Little Wonders <span className="aurora-gradient-text">Light Up</span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed reveal delay-2">
            {t.hero.subheading}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 reveal delay-3">
            <Link
              href="/shop"
              className="flex items-center gap-2 rounded-full bg-violet-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-700 active:scale-95 transition"
            >
              <span>{t.hero.shopNow}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/shop?category=earrings"
              className="rounded-full border border-neutral-300 bg-white/80 px-6 py-3 text-sm font-semibold text-neutral-800 backdrop-blur-sm hover:bg-white hover:border-violet-400 transition"
            >
              French Ear Clips
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-xl mx-auto mb-10 reveal">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
            {t.categories.title}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500">
            {t.categories.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_CATEGORIES.map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className={`group relative overflow-hidden rounded-3xl glass-card border border-white/80 bg-white p-6 transition-all duration-300 hover:shadow-xl reveal delay-${idx + 1}`}
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral-100 mb-5">
                {cat.imageUrl && (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-neutral-900">
                  {cat.itemCount} Items
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 group-hover:text-violet-600 transition">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500 line-clamp-1">{cat.description}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition">
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
            <div className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-1">
              Top Picks
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              Featured Earrings & Accessories
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800"
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
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-1">
              Fresh Drops
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              New Arrivals This Week
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800"
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
        <div className="rounded-3xl bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="rounded-full bg-violet-500/20 border border-violet-400/30 px-3 py-1 text-xs font-semibold text-violet-300">
              The MELO Promise
            </span>
            <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight">
              A Little Something For Everyone.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              We know ordering online in Bangladesh requires confidence. That’s why we inspect every single piece, provide comfortable silicone cushions for painless ear clips, and offer hassle-free Cash on Delivery everywhere.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>100% Quality Checked</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Pathao & Steadfast Delivery</span>
              </div>
              <div className="flex items-center gap-2">
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

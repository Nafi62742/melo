'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, HeartHandshake, PhoneCall, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#181512] text-[#FAF7F2] border-t border-[#2E2925]">
      {/* Top Boutique Service Guarantees Bar (Blingg 04 / Jewelix / Deweler Style) */}
      <div className="border-b border-[#2E2925]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:divide-x lg:divide-[#2E2925]">
            <div className="flex items-start gap-4 lg:pr-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-[#C5A059]/40 bg-[#C5A059]/10 text-[#C5A059]">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-serif-display text-lg font-medium text-[#FAF7F2]">
                  Nationwide Delivery
                </div>
                <div className="mt-0.5 text-xs text-[#A8A29E]">
                  Dhaka within 24–48h • All BD in 3–4 days
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 lg:px-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-[#C5A059]/40 bg-[#C5A059]/10 text-[#C5A059]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-serif-display text-lg font-medium text-[#FAF7F2]">
                  Cash on Delivery
                </div>
                <div className="mt-0.5 text-xs text-[#A8A29E]">
                  Inspect your jewellery at your doorstep
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 lg:px-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-[#C5A059]/40 bg-[#C5A059]/10 text-[#C5A059]">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <div className="font-serif-display text-lg font-medium text-[#FAF7F2]">
                  Painless Silicone Clips
                </div>
                <div className="mt-0.5 text-xs text-[#A8A29E]">
                  Hypoallergenic cushions for unpierced ears
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 lg:pl-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-[#C5A059]/40 bg-[#C5A059]/10 text-[#C5A059]">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <div className="font-serif-display text-lg font-medium text-[#FAF7F2]">
                  Concierge Support
                </div>
                <div className="mt-0.5 text-xs text-[#A8A29E]">
                  Direct styling help via WhatsApp &amp; Instagram
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editorial Footer Columns */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#2E2925]">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif-display text-3xl font-semibold tracking-[0.28em] text-[#FAF7F2]">
                MELO
              </span>
              <span className="block text-[9px] uppercase tracking-[0.3em] text-[#C5A059] mt-1">
                Dhaka • Fine &amp; Light Luxury
              </span>
            </Link>
            <p className="text-xs text-[#A8A29E] max-w-sm leading-relaxed">
              MELO curates French-style light luxury ear clips with transparent silicone cushions, tarnish-free 316L stainless steel rings, and delicate giftable bracelets across Bangladesh.
            </p>
            <div className="inline-flex items-center gap-2 text-xs italic font-serif-display text-[#E6D5B8]">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>&ldquo;Where Little Wonders Light Up — Discover. Love. Repeat.&rdquo;</span>
            </div>
          </div>

          {/* Curated Collections */}
          <div className="md:col-span-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E6D5B8] mb-4">
              Collections
            </div>
            <ul className="space-y-2.5 text-xs text-[#A8A29E]">
              <li>
                <Link href="/shop?category=earrings" className="hover:text-[#C5A059] transition">
                  French Ear Clips
                </Link>
              </li>
              <li>
                <Link href="/shop?category=rings" className="hover:text-[#C5A059] transition">
                  Minimalist Rings
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bracelets" className="hover:text-[#C5A059] transition">
                  Charm Bracelets
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#C5A059] transition">
                  All Curated Pieces
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Care */}
          <div className="md:col-span-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E6D5B8] mb-4">
              Client Care
            </div>
            <ul className="space-y-2.5 text-xs text-[#A8A29E]">
              <li>
                <span className="hover:text-[#FAF7F2] transition cursor-pointer">
                  Bangladesh Delivery Rates (৳60 / ৳120)
                </span>
              </li>
              <li>
                <span className="hover:text-[#FAF7F2] transition cursor-pointer">
                  Easy Inspection &amp; Replacement
                </span>
              </li>
              <li>
                <span className="hover:text-[#FAF7F2] transition cursor-pointer">
                  Silicone Cushion Ear Clip Care Guide
                </span>
              </li>
              <li>
                <span className="hover:text-[#FAF7F2] transition cursor-pointer">
                  316L Stainless Steel Jewellery Care
                </span>
              </li>
            </ul>
          </div>

          {/* Payment Badges */}
          <div className="md:col-span-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E6D5B8] mb-4">
              Payment Options
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-medium">
              <span className="border border-[#3E3832] bg-[#221E1A] px-2.5 py-1 text-[#FAF7F2]">
                Cash on Delivery
              </span>
              <span className="border border-pink-900/60 bg-pink-950/40 px-2.5 py-1 text-pink-300">
                bKash
              </span>
              <span className="border border-amber-900/60 bg-amber-950/40 px-2.5 py-1 text-amber-300">
                Nagad
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Admin Link */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] gap-4">
          <div>© 2026 MELO Bangladesh. Crafted for Everyday Elegance.</div>
          <div className="flex items-center gap-6">
            <Link href="/shop" className="hover:text-[#C5A059] transition">
              Catalogue
            </Link>
            <Link href="/admin" className="hover:text-[#C5A059] transition">
              Store Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

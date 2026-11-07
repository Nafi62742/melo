'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Truck,
  ShieldCheck,
  HeartHandshake,
  PhoneCall,
  Sparkles,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { storeLinkService, STORE_LINKS_UPDATED_EVENT } from '@/core/services/store-link.service';
import {
  productTypeService,
  DEFAULT_PRODUCT_TYPES,
  PRODUCT_TYPES_UPDATED_EVENT,
} from '@/core/services/product-type.service';
import { DEFAULT_STORE_LINKS } from '@/core/models/store-link.model';

const subscribeLinks = (callback: () => void) => {
  window.addEventListener(STORE_LINKS_UPDATED_EVENT, callback);
  return () => window.removeEventListener(STORE_LINKS_UPDATED_EVENT, callback);
};

const subscribeTypes = (callback: () => void) => {
  window.addEventListener(PRODUCT_TYPES_UPDATED_EVENT, callback);
  return () => window.removeEventListener(PRODUCT_TYPES_UPDATED_EVENT, callback);
};

export function Footer() {
  const pathname = usePathname();
  const links = useSyncExternalStore(
    subscribeLinks,
    () => storeLinkService.getAllLinks(),
    () => DEFAULT_STORE_LINKS
  );
  const productTypes = useSyncExternalStore(
    subscribeTypes,
    () => productTypeService.getAllProductTypes(),
    () => DEFAULT_PRODUCT_TYPES
  );

  // Hide storefront footer on admin dashboard
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const activeSocialAndCustomLinks = links.filter((l) => l.isActive && Boolean(l.url));
  return (
    <footer className="bg-[#181512] text-[#FAF7F2] border-t border-[#2E2925]">
      {/* Top Boutique Service Guarantees Bar */}
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
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="font-serif-display text-lg font-medium text-[#FAF7F2]">
                  Card, bKash &amp; COD
                </div>
                <div className="mt-0.5 text-xs text-[#A8A29E]">
                  Card &amp; bKash preferred • Doorstep COD available
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
                  WhatsApp &amp; Messenger
                </div>
                <div className="mt-0.5 text-xs text-[#A8A29E]">
                  Instant live chat via bottom-right concierge
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

            {activeSocialAndCustomLinks.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                {activeSocialAndCustomLinks.map((item) => (
                  <a
                    key={item.key}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-[#2E2925] bg-[#221E1A] px-3 py-1.5 text-[11px] text-[#E6D5B8] hover:border-[#C5A059] hover:text-[#FAF7F2] transition"
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="w-3 h-3 text-[#C5A059]" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Curated Collections */}
          <div className="md:col-span-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E6D5B8] mb-4">
              Collections
            </div>
            <ul className="space-y-2.5 text-xs text-[#A8A29E]">
              {productTypes.map((pt) => (
                <li key={pt.slug}>
                  <Link
                    href={`/shop?category=${pt.slug}`}
                    className="hover:text-[#C5A059] transition"
                  >
                    {pt.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className="hover:text-[#C5A059] transition">
                  All Curated Pieces
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#C5A059] transition">
                  Track Order &amp; Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Care */}
          <div className="md:col-span-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E6D5B8] mb-4">
              Client Care
            </div>
            <ul className="space-y-2.5 text-xs text-[#A8A29E]">
              <li>
                <span className="hover:text-[#FAF7F2] transition cursor-pointer">
                  Delivery Rates (৳60 / ৳120)
                </span>
              </li>
              <li>
                <span className="hover:text-[#FAF7F2] transition cursor-pointer">
                  Doorstep Inspection
                </span>
              </li>
              <li>
                <span className="hover:text-[#FAF7F2] transition cursor-pointer">
                  Silicone Clip Guide
                </span>
              </li>
              <li>
                <span className="hover:text-[#FAF7F2] transition cursor-pointer">
                  316L Steel Care
                </span>
              </li>
            </ul>
          </div>

          {/* Payment Badges: Card & bKash Preferred + COD */}
          <div className="md:col-span-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E6D5B8] mb-4">
              Payments Accepted
            </div>
            <div className="flex flex-col gap-2 text-[11px] font-medium">
              <div className="flex items-center justify-between border border-[#C5A059]/50 bg-[#221E1A] px-3 py-1.5 text-[#FAF7F2]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Visa / Mastercard</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#C5A059] font-semibold">
                  Preferred
                </span>
              </div>
              <div className="flex items-center justify-between border border-pink-900/60 bg-pink-950/40 px-3 py-1.5 text-pink-200">
                <span>bKash Payment</span>
                <span className="text-[9px] uppercase tracking-wider text-pink-300 font-semibold">
                  Preferred
                </span>
              </div>
              <div className="flex items-center justify-between border border-[#3E3832] bg-[#1C1917] px-3 py-1.5 text-[#A8A29E]">
                <span>Cash on Delivery (COD)</span>
                <span className="text-[9px] uppercase tracking-wider text-[#78716C]">
                  Available
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] gap-4">
          <div>© 2026 MELO Bangladesh. Crafted for Everyday Elegance.</div>
          <div className="flex items-center gap-6">
            <Link href="/shop" className="hover:text-[#C5A059] transition">
              Catalogue
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

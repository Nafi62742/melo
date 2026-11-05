'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-stone-200/80 bg-stone-50/40 pt-12 pb-8">
      {/* Trust Badges */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 rounded-2xl bg-white p-5 sm:p-6 border border-stone-200/70 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100/80 text-amber-900 flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">All Bangladesh Delivery</div>
              <div className="text-[11px] text-stone-500">Dhaka in 24-48h</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-800 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Cash on Delivery</div>
              <div className="text-[11px] text-stone-500">Check before payment</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100/70 text-rose-800 flex-shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Hypoallergenic Quality</div>
              <div className="text-[11px] text-stone-500">Comfortable silicone clips</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100/80 text-amber-800 flex-shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Direct Support</div>
              <div className="text-[11px] text-stone-500">WhatsApp & Messenger</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-8 border-b border-stone-200/70">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 via-amber-700 to-stone-900 text-amber-100 font-bold text-sm shadow-xs">
                M
              </div>
              <span className="text-lg font-bold tracking-widest text-stone-900 font-serif">MELO</span>
            </div>
            <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
              MELO is a Bangladesh-focused online store created to bring you small, useful, fun, and giftable jewellery and accessories. Where Little Wonders Light Up.
            </p>
            <div className="text-xs font-medium text-amber-900/90 italic font-serif">
              Discover. Love. Repeat.
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-950/80 mb-3">
              Collections
            </div>
            <ul className="space-y-2 text-xs text-stone-500">
              <li>
                <Link href="/shop?category=earrings" className="hover:text-amber-800 transition">
                  French Ear Clips
                </Link>
              </li>
              <li>
                <Link href="/shop?category=rings" className="hover:text-amber-800 transition">
                  Minimalist Rings
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bracelets" className="hover:text-amber-800 transition">
                  Charm Bracelets
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-amber-800 transition">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-950/80 mb-3">
              Customer Care
            </div>
            <ul className="space-y-2 text-xs text-stone-500">
              <li>
                <span className="hover:text-stone-700 cursor-pointer transition">Delivery Policy (Dhaka & Nationwide)</span>
              </li>
              <li>
                <span className="hover:text-stone-700 cursor-pointer transition">Return & Replacement</span>
              </li>
              <li>
                <span className="hover:text-stone-700 cursor-pointer transition">Track Order</span>
              </li>
              <li>
                <span className="hover:text-stone-700 cursor-pointer transition">Ear Clip Sizing & Care</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-950/80 mb-3">
              Payments Accepted
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-medium text-stone-600">
              <span className="rounded-md border border-stone-200 px-2 py-1 bg-white">
                Cash on Delivery
              </span>
              <span className="rounded-md border border-pink-200 px-2 py-1 bg-pink-50 text-pink-700 font-semibold">
                bKash
              </span>
              <span className="rounded-md border border-amber-200 px-2 py-1 bg-amber-50 text-amber-800 font-semibold">
                Nagad
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <div>© 2026 MELO Bangladesh. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/admin" className="text-stone-500 hover:text-amber-800 transition">
              Store Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

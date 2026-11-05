'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white pt-12 pb-8">
      {/* Trust Badges */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 rounded-2xl bg-neutral-50 p-6 border border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900">All Bangladesh Delivery</div>
              <div className="text-[11px] text-neutral-500">Dhaka in 24-48h</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900">Cash on Delivery</div>
              <div className="text-[11px] text-neutral-500">Check before payment</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-700">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900">Hypoallergenic Quality</div>
              <div className="text-[11px] text-neutral-500">Comfortable silicone clips</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900">Direct Support</div>
              <div className="text-[11px] text-neutral-500">WhatsApp & Instagram</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-8 border-b border-neutral-100">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white font-bold text-sm">
                M
              </div>
              <span className="text-lg font-bold tracking-wider text-neutral-900">MELO</span>
            </div>
            <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
              MELO is a Bangladesh-focused online store created to bring you small, useful, fun, and giftable jewellery and accessories. Where Little Wonders Light Up.
            </p>
            <div className="text-xs font-medium text-neutral-700">
              Discover. Love. Repeat.
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Collections
            </div>
            <ul className="space-y-2 text-xs text-neutral-500">
              <li>
                <Link href="/shop?category=earrings" className="hover:text-violet-600">
                  French Ear Clips
                </Link>
              </li>
              <li>
                <Link href="/shop?category=rings" className="hover:text-violet-600">
                  Minimalist Rings
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bracelets" className="hover:text-violet-600">
                  Charm Bracelets
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-violet-600">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Customer Care
            </div>
            <ul className="space-y-2 text-xs text-neutral-500">
              <li>
                <span className="hover:text-neutral-700 cursor-pointer">Delivery Policy (Dhaka & Nationwide)</span>
              </li>
              <li>
                <span className="hover:text-neutral-700 cursor-pointer">Return & Replacement</span>
              </li>
              <li>
                <span className="hover:text-neutral-700 cursor-pointer">Track Order</span>
              </li>
              <li>
                <span className="hover:text-neutral-700 cursor-pointer">Ear Clip Sizing & Care</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Payments Accepted
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-medium text-neutral-600">
              <span className="rounded-md border border-neutral-200 px-2 py-1 bg-neutral-50">
                Cash on Delivery
              </span>
              <span className="rounded-md border border-pink-200 px-2 py-1 bg-pink-50 text-pink-700 font-semibold">
                bKash
              </span>
              <span className="rounded-md border border-orange-200 px-2 py-1 bg-orange-50 text-orange-700 font-semibold">
                Nagad
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <div>© 2026 MELO Bangladesh. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/admin" className="text-neutral-500 hover:text-violet-600">
              Store Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

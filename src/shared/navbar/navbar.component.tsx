'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCart } from '@/core/services/cart.context';
import { useI18n } from '@/core/i18n/i18n.context';
import { ShoppingBag, Search, Menu, X, Sparkles, User } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  const { totalQuantity, setIsCartDrawerOpen } = useCart();
  const { language, toggleLanguage, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { label: t.nav.home, href: '/', match: pathname === '/' },
    { label: t.nav.shop, href: '/shop', match: pathname === '/shop' && !currentCategory },
    {
      label: t.nav.earrings,
      href: '/shop?category=earrings',
      match: pathname === '/shop' && currentCategory === 'earrings',
    },
    {
      label: t.nav.rings,
      href: '/shop?category=rings',
      match: pathname === '/shop' && currentCategory === 'rings',
    },
    {
      label: t.nav.bracelets,
      href: '/shop?category=bracelets',
      match: pathname === '/shop' && currentCategory === 'bracelets',
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
      {/* Top Boutique Announcement Bar */}
      <div className="bg-[#181512] px-4 py-2 text-center text-[11px] font-medium tracking-[0.18em] uppercase text-[#FAF7F2] flex items-center justify-center gap-2 border-b border-[#2E2925]">
        <Sparkles className="w-3 h-3 text-[#C5A059]" />
        <span>Cash on Delivery Across Bangladesh &nbsp;•&nbsp; Complimentary Shipping Over ৳1,500</span>
        <Sparkles className="hidden sm:inline w-3 h-3 text-[#C5A059]" />
      </div>

      {/* Main 3-Zone Boutique Navigation */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        {/* Left Zone: Mobile Menu Trigger + Desktop Editorial Links */}
        <div className="flex items-center gap-4 lg:gap-7 flex-1">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-[#1C1917] hover:text-[#9A7B3E] transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                  link.match
                    ? 'text-[#1C1917]'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 h-[1.5px] bg-[#C5A059] transition-all duration-300 ${
                    link.match ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}
          </nav>
        </div>

        {/* Center Zone: Editorial Wordmark (Blingg 04 / Jewelix Inspired) */}
        <Link href="/" className="flex flex-col items-center justify-center group px-2">
          <span className="font-serif-display text-3xl sm:text-4xl font-semibold tracking-[0.26em] text-[#1C1917] group-hover:text-[#9A7B3E] transition-colors leading-none">
            MELO
          </span>
          <span className="mt-1 text-[9px] font-medium tracking-[0.32em] text-[#8C7A5B] uppercase">
            Fine &amp; Light Luxury • Dhaka
          </span>
        </Link>

        {/* Right Zone: Search, Language, Admin & Bag */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-4 flex-1">
          {/* Minimalist Search Input on Desktop */}
          <form
            action="/shop"
            method="GET"
            className="hidden md:flex items-center relative"
            onSubmit={(e) => {
              if (!searchQuery.trim()) e.preventDefault();
            }}
          >
            <input
              type="text"
              name="search"
              placeholder={t.nav.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 xl:w-48 border-b border-[#D6CFC5] bg-transparent pl-6 pr-2 py-1 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:w-52 focus:border-[#1C1917] focus:outline-none transition-all"
            />
            <Search className="absolute left-0.5 w-3.5 h-3.5 text-[#78716C] pointer-events-none" />
          </form>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="border border-[#E7E0D6] bg-white/80 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-[#1C1917] hover:border-[#C5A059] transition"
            title="Switch Language"
          >
            <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Customer Account & Order Tracking Link */}
          <Link
            href="/account"
            className="hidden sm:flex items-center gap-1.5 border border-[#E7E0D6] bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] hover:border-[#C5A059] transition"
            title="Track Order & My Account"
          >
            <User className="w-3.5 h-3.5 text-[#9A7B3E]" />
            <span className="hidden xl:inline">Track Order</span>
          </Link>

          {/* Boutique Shopping Bag Trigger */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative flex items-center gap-2 bg-[#1C1917] px-3.5 py-2 text-[#FAF7F2] hover:bg-[#9A7B3E] active:scale-95 transition-all"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
            <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-[0.14em]">
              {t.nav.cart}
            </span>
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C5A059] px-1 text-[10px] font-bold text-[#181512]">
              {totalQuantity}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E7E0D6] bg-[#FAF7F2] px-5 py-6 space-y-4 shadow-xl">
          {/* Mobile Search */}
          <form action="/shop" method="GET" className="relative">
            <input
              type="text"
              name="search"
              placeholder={t.nav.search}
              className="w-full border border-[#E7E0D6] bg-white pl-9 pr-3 py-2.5 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#C5A059]"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-[#78716C]" />
          </form>

          <div className="divide-y divide-[#E7E0D6]/70">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between py-3 text-xs font-semibold uppercase tracking-[0.16em] ${
                  link.match ? 'text-[#9A7B3E]' : 'text-[#1C1917]'
                }`}
              >
                <span>{link.label}</span>
                {link.match && <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />}
              </Link>
            ))}
          </div>

          <Link
            href="/account"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 border border-[#E7E0D6] bg-white px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1C1917]"
          >
            <User className="w-4 h-4 text-[#9A7B3E]" />
            <span>My Account &amp; Order Tracking</span>
          </Link>
        </div>
      )}
    </header>
  );
}

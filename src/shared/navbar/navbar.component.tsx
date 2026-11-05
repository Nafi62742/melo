'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/core/services/cart.context';
import { useI18n } from '@/core/i18n/i18n.context';
import { ShoppingBag, Search, Menu, X, Sparkles, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { totalQuantity, setIsCartDrawerOpen } = useCart();
  const { language, toggleLanguage, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.shop, href: '/shop' },
    { label: t.nav.earrings, href: '/shop?category=earrings' },
    { label: t.nav.rings, href: '/shop?category=rings' },
    { label: t.nav.bracelets, href: '/shop?category=bracelets' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
      {/* Top Banner with Warm Champagne Glow */}
      <div className="bg-gradient-to-r from-amber-700 via-rose-700 to-amber-800 px-4 py-1.5 text-center text-xs font-medium text-amber-50 shadow-sm flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
        <span>Cash on Delivery across Bangladesh | Free delivery on orders over ৳1500</span>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-stone-700 hover:bg-stone-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Brand Logo Symbol */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-stone-900 text-white shadow-md shadow-amber-700/20 group-hover:scale-105 transition-transform">
              <span className="text-lg font-black tracking-tight font-serif">M</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-widest text-stone-900 group-hover:text-amber-800 transition">
                MELO
              </span>
              <span className="text-[9px] font-semibold tracking-widest text-amber-700/80 uppercase">
                Boutique Dhaka
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-100/80 text-amber-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search on Desktop */}
          <form
            action="/shop"
            method="GET"
            className="hidden sm:flex items-center relative"
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
              className="w-40 lg:w-56 rounded-full border border-stone-200 bg-stone-50/80 pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:w-60 focus:bg-white focus:border-amber-600 focus:outline-none transition-all"
            />
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          </form>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 rounded-full border border-stone-200 px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
            title="Switch Language"
          >
            <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Admin link */}
          <Link
            href="/admin"
            className="hidden lg:flex items-center gap-1 text-stone-500 hover:text-amber-800 text-xs font-medium px-2 py-1"
            title="Store Admin Dashboard"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </Link>

          {/* Cart Bag Button */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative flex items-center justify-center rounded-full bg-stone-900 p-2 sm:px-3.5 sm:py-1.5 text-white shadow-sm hover:bg-amber-800 active:scale-95 transition"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4 text-amber-200" />
            <span className="hidden sm:inline ml-1.5 text-xs font-bold">{t.nav.cart}</span>
            {totalQuantity > 0 && (
              <span className="absolute -top-1.5 -right-1.5 sm:static sm:ml-1.5 flex h-4 min-w-4 sm:h-auto sm:min-w-0 items-center justify-center rounded-full bg-amber-600 sm:bg-stone-800 px-1 text-[10px] sm:text-xs font-bold text-white">
                {totalQuantity}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white/95 backdrop-blur-md px-4 py-4 space-y-2">
          {/* Mobile Search */}
          <form action="/shop" method="GET" className="relative mb-3">
            <input
              type="text"
              name="search"
              placeholder={t.nav.search}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-600"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
          </form>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-amber-50 hover:text-amber-800"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-amber-800 bg-amber-50/50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Management</span>
          </Link>
        </div>
      )}
    </header>
  );
}

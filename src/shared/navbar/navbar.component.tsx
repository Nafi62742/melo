'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/core/services/cart.context';
import { useWishlist } from '@/core/services/wishlist.context';
import {
  productTypeService,
  PRODUCT_TYPES_UPDATED_EVENT,
} from '@/core/services/product-type.service';
import { useI18n } from '@/core/i18n/i18n.context';
import { ShoppingBag, Search, Menu, X, Sparkles, User, ShieldCheck, Heart } from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  const { totalQuantity, setIsCartDrawerOpen } = useCart();
  const { totalWishlist, setIsWishlistDrawerOpen } = useWishlist();
  const { language, toggleLanguage, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [productTypes, setProductTypes] = useState(() =>
    productTypeService.getAllProductTypes()
  );

  useEffect(() => {
    const refreshProductTypes = () => {
      setProductTypes([...productTypeService.getAllProductTypes()]);
    };

    void productTypeService.syncFromDatabase().then((remote) => {
      setProductTypes([...remote]);
    });

    window.addEventListener(PRODUCT_TYPES_UPDATED_EVENT, refreshProductTypes);
    return () => {
      window.removeEventListener(PRODUCT_TYPES_UPDATED_EVENT, refreshProductTypes);
    };
  }, []);

  const getTypeLabel = (slug: string, fallbackName: string): string => {
    if (slug === 'earrings') return t.nav.earrings;
    if (slug === 'rings') return t.nav.rings;
    if (slug === 'bracelets') return t.nav.bracelets;
    return fallbackName;
  };

  const navLinks = [
    { label: t.nav.home, href: '/', match: pathname === '/' },
    { label: t.nav.shop, href: '/shop', match: pathname === '/shop' && !currentCategory },
    ...productTypes.map((pt) => ({
      label: getTypeLabel(pt.slug, pt.name),
      href: `/shop?category=${pt.slug}`,
      match: pathname === '/shop' && currentCategory === pt.slug,
    })),
    {
      label: language === 'en' ? 'Track Order' : 'অর্ডার ট্র্যাক',
      href: '/account',
      match: pathname === '/account',
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    setMobileMenuOpen(false);
    if (!trimmed) {
      router.push('/shop');
      return;
    }
    router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
      {/* Top Boutique Announcement Bar */}
      <div className="bg-[#181512] px-4 py-2 text-center text-[11px] font-medium tracking-[0.18em] uppercase text-[#FAF7F2] flex items-center justify-center gap-2 border-b border-[#2E2925]">
        <Sparkles className="w-3 h-3 text-[#C5A059]" />
        <span>
          Cash on Delivery Across Bangladesh &nbsp;•&nbsp; Complimentary Shipping Over ৳1,500
        </span>
        <Sparkles className="hidden sm:inline w-3 h-3 text-[#C5A059]" />
      </div>

      {/* Main 3-Zone Boutique Navigation */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        {/* Left Zone: Mobile Menu Trigger + Desktop Editorial Links */}
        <div className="flex items-center gap-4 lg:gap-6 flex-1 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-[#1C1917] hover:text-[#9A7B3E] transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <nav className="hidden lg:flex items-center gap-5 overflow-x-auto no-scrollbar">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-[11px] font-semibold uppercase tracking-[0.15em] whitespace-nowrap transition-colors ${
                  link.match ? 'text-[#1C1917]' : 'text-[#78716C] hover:text-[#1C1917]'
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

        {/* Center Zone: Editorial Wordmark */}
        <Link href="/" className="flex flex-col items-center justify-center group px-2 shrink-0">
          <span className="font-serif-display text-3xl sm:text-4xl font-semibold tracking-[0.26em] text-[#1C1917] group-hover:text-[#9A7B3E] transition-colors leading-none">
            MELO
          </span>
          <span className="mt-1 text-[9px] font-medium tracking-[0.32em] text-[#8C7A5B] uppercase">
            Fine &amp; Light Luxury • Dhaka
          </span>
        </Link>

        {/* Right Zone: Search, Language, Account/Admin & Bag */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3.5 flex-1">
          {/* Minimalist Search Input on Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
            <input
              type="text"
              name="search"
              placeholder={t.nav.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-32 xl:w-44 border-b border-[#D6CFC5] bg-transparent pl-6 pr-2 py-1 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:w-48 focus:border-[#1C1917] focus:outline-none transition-all"
            />
            <Search className="absolute left-0.5 w-3.5 h-3.5 text-[#78716C] pointer-events-none" />
          </form>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="border border-[#E7E0D6] bg-white/80 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-[#1C1917] hover:border-[#C5A059] transition cursor-pointer"
            title="Switch Language"
          >
            <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Customer Account Link */}
          <Link
            href="/account"
            className={`hidden sm:flex items-center gap-1.5 border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition ${
              pathname === '/account'
                ? 'border-[#C5A059] bg-[#FAF7F2] text-[#1C1917]'
                : 'border-[#E7E0D6] bg-white/80 text-[#1C1917] hover:border-[#C5A059]'
            }`}
            title="My Account & Order Tracking"
          >
            <User className="w-3.5 h-3.5 text-[#9A7B3E]" />
            <span className="hidden xl:inline">Account</span>
          </Link>

          {/* Admin Panel Quick Link */}
          <Link
            href="/admin"
            className={`hidden sm:flex items-center gap-1.5 border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${
              pathname === '/admin'
                ? 'border-[#1C1917] bg-[#1C1917] text-[#FAF7F2]'
                : 'border-[#E7E0D6] bg-white/80 text-[#78716C] hover:border-[#C5A059] hover:text-[#1C1917]'
            }`}
            title="Admin Dashboard"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#9A7B3E]" />
            <span className="hidden xl:inline">{t.nav.admin}</span>
          </Link>

          {/* Boutique Wishlist Trigger */}
          <button
            type="button"
            onClick={() => setIsWishlistDrawerOpen(true)}
            className="relative flex items-center justify-center p-2 border border-[#E7E0D6] bg-white/80 hover:border-[#C5A059] text-[#1C1917] hover:text-[#9A7B3E] active:scale-95 transition cursor-pointer"
            aria-label="Open Saved Pieces"
            title="Saved pieces"
          >
            <Heart
              className={`w-4 h-4 ${
                totalWishlist > 0 ? 'fill-[#9A7B3E] text-[#9A7B3E]' : 'text-[#1C1917]'
              }`}
            />
            {totalWishlist > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1C1917] px-1 text-[9px] font-bold text-white shadow-xs">
                {totalWishlist}
              </span>
            )}
          </button>

          {/* Boutique Shopping Bag Trigger */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative flex items-center gap-2 bg-[#1C1917] px-3.5 py-2 text-[#FAF7F2] hover:bg-[#9A7B3E] active:scale-95 transition-all cursor-pointer"
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
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          <div className="grid grid-cols-1 gap-2 pt-1">
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 border border-[#E7E0D6] bg-white px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1C1917]"
            >
              <User className="w-4 h-4 text-[#9A7B3E]" />
              <span>My Account &amp; Order Tracking</span>
            </Link>

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 border border-[#E7E0D6] bg-white px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1C1917]"
            >
              <ShieldCheck className="w-4 h-4 text-[#9A7B3E]" />
              <span>{t.nav.admin} Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

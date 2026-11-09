'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/core/services/cart.context';
import { useWishlist } from '@/core/services/wishlist.context';
import {
  productTypeService,
  DEFAULT_PRODUCT_TYPES,
  PRODUCT_TYPES_UPDATED_EVENT,
} from '@/core/services/product-type.service';
import { adminService, ADMIN_AUTH_CHANGED_EVENT } from '@/core/services/admin.service';
import { customerService, CUSTOMER_AUTH_CHANGED_EVENT } from '@/core/services/customer.service';
import { CustomerProfile } from '@/core/models/customer.model';
import { useI18n } from '@/core/i18n/i18n.context';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Sparkles,
  User,
  ShieldCheck,
  Heart,
  Globe,
  ChevronDown,
  Check,
} from 'lucide-react';

const emptySubscribe = () => () => {};

const subscribeTypes = (callback: () => void) => {
  window.addEventListener(PRODUCT_TYPES_UPDATED_EVENT, callback);
  return () => window.removeEventListener(PRODUCT_TYPES_UPDATED_EVENT, callback);
};

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  const { totalQuantity, setIsCartDrawerOpen } = useCart();
  const { totalWishlist, setIsWishlistDrawerOpen } = useWishlist();
  const { language, setLanguage, t } = useI18n();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile | null>(() =>
    customerService.getCurrentCustomer()
  );
  const headerSearchInputRef = useRef<HTMLInputElement>(null);
  const drawerSearchInputRef = useRef<HTMLInputElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const productTypes = useSyncExternalStore(
    subscribeTypes,
    () => productTypeService.getAllProductTypes(),
    () => DEFAULT_PRODUCT_TYPES
  );

  // Check admin & customer authentication states
  useEffect(() => {
    const checkAuth = () => {
      setIsAdminLoggedIn(adminService.isAuthenticated());
      setCurrentCustomer(customerService.getCurrentCustomer());
    };

    checkAuth();

    window.addEventListener(ADMIN_AUTH_CHANGED_EVENT, checkAuth);
    window.addEventListener(CUSTOMER_AUTH_CHANGED_EVENT, checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener(ADMIN_AUTH_CHANGED_EVENT, checkAuth);
      window.removeEventListener(CUSTOMER_AUTH_CHANGED_EVENT, checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, [pathname]);

  // Sync types from Supabase
  useEffect(() => {
    void productTypeService.syncFromDatabase();
  }, []);

  // Close language dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    if (langDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [langDropdownOpen]);

  // Lock body scroll when mobile menu is open; handle Escape key
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        if (langDropdownOpen) setLangDropdownOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen, searchOpen, langDropdownOpen]);

  // Hide storefront navbar on admin dashboard
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const getTypeLabel = (slug: string, fallbackName: string): string => {
    if (slug === 'earrings') return t.nav.earrings;
    if (slug === 'rings') return t.nav.rings;
    if (slug === 'bracelets') return t.nav.bracelets;
    return fallbackName;
  };

  // Dedicated collection navigation links (clean, non-redundant)
  const navLinks = [
    { label: t.nav.home, href: '/', match: pathname === '/' },
    { label: t.nav.shop, href: '/shop', match: pathname === '/shop' && !currentCategory },
    ...productTypes.map((pt) => ({
      label: getTypeLabel(pt.slug, pt.name),
      href: `/shop?category=${pt.slug}`,
      match: pathname === '/shop' && currentCategory === pt.slug,
    })),
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    setMobileMenuOpen(false);
    setSearchOpen(false);
    if (!trimmed) {
      router.push('/shop');
      return;
    }
    router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
  };

  const toggleSearch = () => {
    setSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => headerSearchInputRef.current?.focus(), 100);
      }
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
      {/* Top Boutique Announcement Bar */}
      <div className="bg-[#181512] px-3 sm:px-4 py-1.5 text-center text-[10px] sm:text-[11px] font-medium tracking-[0.16em] uppercase text-[#FAF7F2] flex items-center justify-center gap-2 border-b border-[#2E2925]">
        <Sparkles className="w-3 h-3 text-[#C5A059] shrink-0" />
        <span className="truncate">{t.nav.announcement}</span>
        <Sparkles className="hidden sm:inline w-3 h-3 text-[#C5A059] shrink-0" />
      </div>

      {/* Main Navigation Bar (h-16 on mobile for sleek space, h-20 on desktop) */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20">
        {/* Left Zone: Mobile Hamburger & Desktop Collection Links */}
        <div className="flex items-center gap-3 lg:gap-6 flex-1 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-[#1C1917] hover:text-[#9A7B3E] hover:bg-stone-200/50 active:scale-95 transition cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 overflow-x-auto no-scrollbar">
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
                    link.match ? 'w-full' : 'w-0 hover:w-full'
                  }`}
                />
              </Link>
            ))}
          </nav>
        </div>

        {/* Center Zone: Editorial Brand Wordmark */}
        <Link href="/" className="flex flex-col items-center justify-center group px-2 shrink-0">
          <span className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[0.24em] text-[#1C1917] group-hover:text-[#9A7B3E] transition-colors leading-none">
            MELO
          </span>
          <span className="hidden sm:block mt-1 text-[8.5px] lg:text-[9px] font-medium tracking-[0.3em] text-[#8C7A5B] uppercase whitespace-nowrap">
            Fine &amp; Light Luxury • Dhaka
          </span>
        </Link>

        {/* Right Zone: Search Icon, Language, Account & Bag */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 flex-1">
          {/* Search Icon Button (Replaces cluttered search bar) */}
          <button
            type="button"
            onClick={toggleSearch}
            className={`relative flex items-center justify-center p-2 rounded-lg border transition cursor-pointer active:scale-95 ${
              searchOpen
                ? 'border-[#C5A059] bg-[#FAF7F2] text-[#9A7B3E]'
                : 'border-[#E7E0D6] bg-white/80 hover:border-[#C5A059] text-[#1C1917] hover:text-[#9A7B3E]'
            }`}
            aria-label="Search collection"
            title="Search collection"
          >
            {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {/* Desktop Language Selector Dropdown */}
          <div ref={langDropdownRef} className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setLangDropdownOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold tracking-wider transition cursor-pointer active:scale-95 ${
                langDropdownOpen
                  ? 'border-[#C5A059] bg-[#FAF7F2] text-[#9A7B3E]'
                  : 'border-[#E7E0D6] bg-white/80 text-[#1C1917] hover:border-[#C5A059]'
              }`}
              aria-label="Select language"
              aria-expanded={langDropdownOpen}
              title="Select Language / ভাষা নির্বাচন"
            >
              <Globe className="w-3.5 h-3.5 text-[#8C7A5B]" />
              <span>{language === 'en' ? 'EN' : 'বাং'}</span>
              <ChevronDown
                className={`w-3 h-3 text-[#78716C] transition-transform duration-200 ${
                  langDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-40 rounded-xl border border-[#E7E0D6] bg-white p-1.5 shadow-xl animate-fadeIn z-50">
                <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#8C7A5B]">
                  Language / ভাষা
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('en');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition cursor-pointer ${
                    language === 'en'
                      ? 'bg-[#FAF7F2] text-[#9A7B3E]'
                      : 'text-[#1C1917] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[11px] text-[#8C7A5B]">EN</span>
                    <span>English</span>
                  </div>
                  {language === 'en' && <Check className="w-3.5 h-3.5 text-[#9A7B3E]" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('bn');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition cursor-pointer ${
                    language === 'bn'
                      ? 'bg-[#FAF7F2] text-[#9A7B3E]'
                      : 'text-[#1C1917] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[11px] text-[#8C7A5B]">বাং</span>
                    <span>বাংলা</span>
                  </div>
                  {language === 'bn' && <Check className="w-3.5 h-3.5 text-[#9A7B3E]" />}
                </button>
              </div>
            )}
          </div>

          {/* Role Action: Admin Dashboard when logged in as Admin, otherwise Customer Account */}
          {isAdminLoggedIn ? (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#1C1917] bg-[#1C1917] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#FAF7F2] hover:bg-[#9A7B3E] transition"
              title="Admin Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="hidden xl:inline">{t.nav.admin}</span>
            </Link>
          ) : (
            <Link
              href="/account"
              className={`hidden sm:flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition ${
                pathname === '/account'
                  ? 'border-[#C5A059] bg-[#FAF7F2] text-[#1C1917]'
                  : 'border-[#E7E0D6] bg-white/80 text-[#1C1917] hover:border-[#C5A059]'
              }`}
              title={
                currentCustomer
                  ? `Logged in as ${currentCustomer.fullName}`
                  : 'My Account & Order Tracking'
              }
            >
              <User className={`w-3.5 h-3.5 ${currentCustomer ? 'text-emerald-600' : 'text-[#9A7B3E]'}`} />
              <span className="hidden xl:inline">
                {currentCustomer ? currentCustomer.fullName.split(' ')[0] : t.nav.account}
              </span>
            </Link>
          )}

          {/* Boutique Wishlist Trigger */}
          <button
            type="button"
            onClick={() => setIsWishlistDrawerOpen(true)}
            className="relative flex items-center justify-center p-2 rounded-lg border border-[#E7E0D6] bg-white/80 hover:border-[#C5A059] text-[#1C1917] hover:text-[#9A7B3E] active:scale-95 transition cursor-pointer"
            aria-label="Open Saved Pieces"
            title="Saved pieces"
          >
            <Heart
              className={`w-4 h-4 ${
                isMounted && totalWishlist > 0 ? 'fill-[#9A7B3E] text-[#9A7B3E]' : 'text-[#1C1917]'
              }`}
            />
            {isMounted && totalWishlist > 0 && (
              <span
                suppressHydrationWarning
                className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1C1917] px-1 text-[9px] font-bold text-white shadow-xs"
              >
                {totalWishlist}
              </span>
            )}
          </button>

          {/* Boutique Shopping Bag Trigger */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative flex items-center gap-1.5 sm:gap-2 rounded-lg bg-[#1C1917] px-3 sm:px-3.5 py-2 text-[#FAF7F2] hover:bg-[#9A7B3E] active:scale-95 transition-all cursor-pointer"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
            <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-[0.14em]">
              {t.nav.cart}
            </span>
            <span
              suppressHydrationWarning
              className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C5A059] px-1 text-[10px] font-bold text-[#181512]"
            >
              {isMounted ? totalQuantity : 0}
            </span>
          </button>
        </div>
      </div>

      {/* Revealable Search Bar Dropdown (Desktop & Mobile) */}
      {searchOpen && (
        <div className="border-t border-[#E7E0D6] bg-[#FAF7F2]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-md">
          <form onSubmit={handleSearchSubmit} className="mx-auto max-w-2xl flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <input
                ref={headerSearchInputRef}
                type="text"
                name="search"
                placeholder={t.nav.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-[#D6CFC5] bg-white pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 text-xs sm:text-sm text-[#1C1917] placeholder-[#A8A29E] focus:border-[#C5A059] focus:outline-none transition-colors"
              />
              <Search className="absolute left-3 sm:left-3.5 top-2.5 sm:top-3 w-4 h-4 text-[#8C7A5B]" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 sm:right-3 top-2 sm:top-2.5 p-1 text-[#A8A29E] hover:text-[#1C1917]"
                  aria-label="Clear query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="rounded-full bg-[#1C1917] px-4 sm:px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] hover:bg-[#9A7B3E] active:scale-95 transition shrink-0 cursor-pointer"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-2 text-[#78716C] hover:text-[#1C1917] transition cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Modern Slide-Over Mobile Drawer & Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/45 backdrop-blur-xs transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-[84%] max-w-sm bg-[#FAF7F2] shadow-2xl flex flex-col transition-transform duration-300 ease-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile Navigation"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E0D6] bg-white/60">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="font-serif-display text-2xl font-semibold tracking-[0.22em] text-[#1C1917]"
          >
            MELO
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 -mr-2 text-[#78716C] hover:text-[#1C1917] active:scale-95 transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              ref={drawerSearchInputRef}
              type="text"
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.nav.search}
              className="w-full rounded-xl border border-[#E7E0D6] bg-white pl-9 pr-3 py-2.5 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#C5A059]"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-[#78716C]" />
          </form>

          {/* Collection Navigation */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7A5B] mb-2">
              Collections
            </div>
            <nav className="divide-y divide-[#E7E0D6]/60">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-3 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                    link.match ? 'text-[#9A7B3E]' : 'text-[#1C1917] hover:text-[#9A7B3E]'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.match && <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />}
                </Link>
              ))}
            </nav>
          </div>

          {/* Customer Area & Language Settings */}
          <div className="space-y-2.5 pt-2 border-t border-[#E7E0D6]">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7A5B] mb-1">
              Account &amp; Language
            </div>

            {isAdminLoggedIn ? (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl border border-[#1C1917] bg-[#1C1917] px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FAF7F2]"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                  <span>{t.nav.admin} Dashboard</span>
                </div>
                <span className="text-[10px] text-[#C5A059]">→</span>
              </Link>
            ) : (
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl border border-[#E7E0D6] bg-white px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1C1917] hover:border-[#C5A059] transition"
              >
                <div className="flex items-center gap-2.5">
                  <User className={`w-4 h-4 ${currentCustomer ? 'text-emerald-600' : 'text-[#9A7B3E]'}`} />
                  <span>
                    {currentCustomer
                      ? `Account (${currentCustomer.fullName.split(' ')[0]})`
                      : 'My Orders & Tracking'}
                  </span>
                </div>
                <span className="text-[10px] text-[#8C7A5B]">→</span>
              </Link>
            )}

            {/* In-drawer Language Selector */}
            <div className="rounded-xl border border-[#E7E0D6] bg-white p-2.5 space-y-1.5">
              <div className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8C7A5B]">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-[#9A7B3E]" />
                  <span>Language / ভাষা নির্বাচন</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                    language === 'en'
                      ? 'bg-[#1C1917] text-[#FAF7F2] shadow-xs'
                      : 'bg-[#FAF7F2] text-[#1C1917] hover:bg-stone-200/60'
                  }`}
                >
                  <span>English (EN)</span>
                  {language === 'en' && <Check className="w-3.5 h-3.5 text-[#C5A059]" />}
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                    language === 'bn'
                      ? 'bg-[#1C1917] text-[#FAF7F2] shadow-xs'
                      : 'bg-[#FAF7F2] text-[#1C1917] hover:bg-stone-200/60'
                  }`}
                >
                  <span>বাংলা (BN)</span>
                  {language === 'bn' && <Check className="w-3.5 h-3.5 text-[#C5A059]" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer Notice */}
        <div className="p-4 border-t border-[#E7E0D6] bg-[#F5EFE6]/50 text-center text-[10px] text-[#78716C] tracking-wider uppercase">
          Cash on Delivery Nationwide • Dhaka in 24–48h
        </div>
      </aside>
    </header>
  );
}

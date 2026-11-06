'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from '@/core/models/product.model';
import { productService } from '@/core/services/product.service';
import {
  productTypeService,
  PRODUCT_TYPES_UPDATED_EVENT,
} from '@/core/services/product-type.service';
import { ProductCard } from '@/shared/product-card/product-card.component';
import { QuickViewModal } from '@/shared/quick-view-modal/quick-view-modal.component';
import {
  Search,
  Sparkles,
  X,
  RotateCcw,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';

const PAGE_SIZE = 12;

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name';
type PricePreset = 'all' | 'tier1' | 'tier2' | 'tier3';

export function CatalogFeature() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'all';
  const urlSearch = searchParams.get('search') || '';

  const [allProducts, setAllProducts] = useState<Product[]>(() =>
    productService.getAllProducts()
  );
  const [productTypes, setProductTypes] = useState(() =>
    productTypeService.getAllProductTypes()
  );
  const [customSearchQuery, setCustomSearchQuery] = useState<string | null>(null);
  const searchQuery = customSearchQuery !== null ? customSearchQuery : urlSearch;

  // Single unified filter state
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [pricePreset, setPricePreset] = useState<PricePreset>('all');

  // Pagination & Quick View State
  const [pageOffset, setPageOffset] = useState<number>(PAGE_SIZE);
  const [filterKey, setFilterKey] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync data from database and events
  useEffect(() => {
    const refreshTypes = () => {
      setProductTypes([...productTypeService.getAllProductTypes()]);
    };

    void Promise.all([
      productTypeService.syncFromDatabase(),
      productService.syncFromDatabase(),
    ]).then(([remoteTypes, remoteProducts]) => {
      setProductTypes([...remoteTypes]);
      setAllProducts([...remoteProducts]);
    });

    window.addEventListener(PRODUCT_TYPES_UPDATED_EVENT, refreshTypes);
    return () => {
      window.removeEventListener(PRODUCT_TYPES_UPDATED_EVENT, refreshTypes);
    };
  }, []);

  // Compute live dynamic min, max, and price brackets from catalog
  const { catalogMinPrice, catalogMaxPrice, priceBrackets } = useMemo(() => {
    if (allProducts.length === 0) {
      return {
        catalogMinPrice: 150,
        catalogMaxPrice: 850,
        priceBrackets: { tier1: 300, tier2: 500 },
      };
    }
    const prices = allProducts.map((p) => p.priceBDT);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const spread = max - min;
    const tier1 = Math.round((min + spread * 0.35) / 25) * 25;
    const tier2 = Math.round((min + spread * 0.68) / 25) * 25;

    return {
      catalogMinPrice: min,
      catalogMaxPrice: max,
      priceBrackets: { tier1, tier2 },
    };
  }, [allProducts]);

  // Category change handler
  const handleSelectCategory = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === 'all') {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    const qs = params.toString();
    router.replace(qs ? `/shop?${qs}` : '/shop', { scroll: false });
  };

  // Build categories list with live counts
  const categories = useMemo(() => {
    return [
      { id: 'all', name: 'All Pieces', count: allProducts.length },
      ...productTypes.map((pt) => ({
        id: pt.slug,
        name: pt.name,
        count: allProducts.filter((p) => p.category === pt.slug).length,
      })),
    ];
  }, [allProducts, productTypes]);

  // Determine if ANY filter is modified from default
  const isAnyFilterActive =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    inStockOnly ||
    pricePreset !== 'all' ||
    sortBy !== 'featured';

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (pricePreset !== 'all' ? 1 : 0) +
    (sortBy !== 'featured' ? 1 : 0);

  // The ONE unified reset function
  const handleResetFilters = () => {
    setCustomSearchQuery('');
    setInStockOnly(false);
    setPricePreset('all');
    setSortBy('featured');
    router.replace('/shop', { scroll: false });
  };

  // Derive current filter key for zero-effect pagination reset
  const currentFilterKey = `${selectedCategory}-${searchQuery}-${inStockOnly}-${pricePreset}-${sortBy}`;
  const visibleCount = currentFilterKey !== filterKey ? PAGE_SIZE : pageOffset;

  // Filter and Sort Products
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // 1. Category
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // 2. Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 3. In Stock Only
    if (inStockOnly) {
      list = list.filter((p) => Number(p.stock ?? 0) > 0);
    }

    // 4. Dynamic Price
    if (pricePreset === 'tier1') {
      list = list.filter((p) => p.priceBDT <= priceBrackets.tier1);
    } else if (pricePreset === 'tier2') {
      list = list.filter(
        (p) => p.priceBDT > priceBrackets.tier1 && p.priceBDT <= priceBrackets.tier2
      );
    } else if (pricePreset === 'tier3') {
      list = list.filter((p) => p.priceBDT > priceBrackets.tier2);
    }

    // 5. Sorting
    switch (sortBy) {
      case 'price-asc':
        return [...list].sort((a, b) => a.priceBDT - b.priceBDT);
      case 'price-desc':
        return [...list].sort((a, b) => b.priceBDT - a.priceBDT);
      case 'name':
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      case 'featured':
      default:
        return [...list].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
  }, [allProducts, selectedCategory, searchQuery, inStockOnly, pricePreset, priceBrackets, sortBy]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  const handleLoadMore = () => {
    setFilterKey(currentFilterKey);
    setPageOffset(() => {
      const base = currentFilterKey !== filterKey ? PAGE_SIZE : pageOffset;
      return Math.min(base + PAGE_SIZE, filteredProducts.length);
    });
  };

  return (
    <div className="pb-20">
      {/* Editorial Header Banner */}
      <div className="bg-[#F3EDE4]/70 border-b border-[#E7E0D6] py-8 sm:py-12 mb-6 sm:mb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A7B3E] mb-2">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>Catalogue</span>
          </div>
          <h1 className="font-serif-display text-3xl sm:text-5xl font-medium text-[#1C1917]">
            The Curated Collection
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#78716C] max-w-lg mx-auto">
            Handcrafted everyday elegance with nationwide Cash on Delivery.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* 1. CATEGORY NAVIGATION TABS (LUXURY HORIZONTAL PILLS)                     */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#1C1917] text-[#FAF7F2] shadow-xs'
                  : 'bg-white border border-[#E7E0D6] text-[#78716C] hover:border-[#1C1917] hover:text-[#1C1917]'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* 2. PROPER REFINEMENT TOOLBAR (SPACIOUS, UN-CRAMPED, NO CUTOFFS)           */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E7E0D6] p-3 sm:p-4 mb-6 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Left Controls: Search, Price, In Stock */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search jewellery..."
                  value={searchQuery}
                  onChange={(e) => setCustomSearchQuery(e.target.value)}
                  className="w-full border border-[#D6CFC5] bg-white pl-9 pr-7 py-2 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#C5A059] transition"
                />
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#78716C]" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setCustomSearchQuery('')}
                    className="absolute right-2.5 top-2 text-[#A8A29E] hover:text-[#1C1917] p-0.5 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dynamic Price Range Selector */}
              <div className="relative min-w-[210px] flex-1 sm:flex-initial">
                <select
                  value={pricePreset}
                  onChange={(e) => setPricePreset(e.target.value as PricePreset)}
                  className="w-full appearance-none border border-[#D6CFC5] bg-white px-3 py-2 pr-8 text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#C5A059] transition cursor-pointer"
                >
                  <option value="all">
                    Price: All (৳{catalogMinPrice} – ৳{catalogMaxPrice})
                  </option>
                  <option value="tier1">Price: Under ৳{priceBrackets.tier1}</option>
                  <option value="tier2">
                    Price: ৳{priceBrackets.tier1} – ৳{priceBrackets.tier2}
                  </option>
                  <option value="tier3">Price: Over ৳{priceBrackets.tier2}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 w-3.5 h-3.5 text-[#9A7B3E]" />
              </div>

              {/* In Stock Only Pill Switch */}
              <button
                type="button"
                onClick={() => setInStockOnly((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium border transition cursor-pointer ${
                  inStockOnly
                    ? 'border-[#9A7B3E] bg-[#1C1917] text-[#FAF7F2]'
                    : 'border-[#D6CFC5] bg-white text-[#78716C] hover:border-[#1C1917]'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    inStockOnly ? 'bg-emerald-400' : 'bg-stone-300'
                  }`}
                />
                <span className="whitespace-nowrap">In Stock Only</span>
              </button>
            </div>

            {/* Right Controls: Sort & The ONE Reset Button */}
            <div className="flex items-center gap-2.5 shrink-0 justify-between sm:justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-[#F3EDE4]">
              {/* Sort Dropdown */}
              <div className="relative min-w-[165px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full appearance-none border border-[#D6CFC5] bg-white pl-8 pr-8 py-2 text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#C5A059] transition cursor-pointer"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A–Z</option>
                </select>
                <ArrowUpDown className="pointer-events-none absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#9A7B3E]" />
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 w-3.5 h-3.5 text-[#9A7B3E]" />
              </div>

              {/* The ONE Reset Button */}
              {isAnyFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#9A7B3E] hover:text-[#1C1917] bg-[#FAF7F2] hover:bg-[#F3EDE4] border border-[#C5A059] transition cursor-pointer"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ({activeFilterCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Clean Results Count */}
          <div className="mt-3 pt-2.5 border-t border-[#F3EDE4] flex items-center justify-between text-[11px] text-[#78716C]">
            <div>
              Showing <span className="font-semibold text-[#1C1917]">{filteredProducts.length}</span> curated pieces
              {selectedCategory !== 'all' && (
                <span> in <span className="text-[#9A7B3E] font-medium">{categories.find((c) => c.id === selectedCategory)?.name}</span></span>
              )}
            </div>
            {isAnyFilterActive && (
              <span className="text-[10px] uppercase tracking-wider text-[#9A7B3E] font-medium">
                Active filters applied
              </span>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRODUCTS GRID OR ZERO STATE                                               */}
        {/* ========================================================================= */}
        {filteredProducts.length === 0 ? (
          <div className="border border-dashed border-[#D6CFC5] bg-white p-10 sm:p-14 text-center my-8">
            <Sparkles className="mx-auto h-7 w-7 text-[#C5A059] mb-3" />
            <h3 className="font-serif-display text-2xl font-medium text-[#1C1917]">
              No matching pieces found
            </h3>
            <p className="mt-1.5 text-xs text-[#78716C] max-w-md mx-auto leading-relaxed">
              We couldn&apos;t find any jewellery matching your active filters. Try broadening your
              selection or clearing the filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 boutique-btn-primary px-6 py-2.5 text-xs cursor-pointer inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>

            {/* Pagination & Load More Section */}
            {hasMore ? (
              <div className="mt-12 text-center flex flex-col items-center">
                <div className="text-xs text-[#78716C] mb-2 font-medium">
                  Showing {displayedProducts.length} of {filteredProducts.length} curated pieces
                </div>
                <div className="w-48 h-1 bg-[#E7E0D6] rounded-full overflow-hidden mb-5">
                  <div
                    className="h-full bg-[#9A7B3E] transition-all duration-300"
                    style={{
                      width: `${(displayedProducts.length / filteredProducts.length) * 100}%`,
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="boutique-btn-primary px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] cursor-pointer hover:shadow-lg transition-all"
                >
                  Load More Pieces
                </button>
              </div>
            ) : filteredProducts.length > PAGE_SIZE ? (
              <div className="mt-12 text-center text-xs text-[#78716C] font-serif-display italic border-t border-[#F3EDE4] pt-6">
                You have viewed all {filteredProducts.length} curated pieces
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

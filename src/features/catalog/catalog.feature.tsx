'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { productService } from '@/core/services/product.service';
import { ProductCard } from '@/shared/product-card/product-card.component';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

export function CatalogFeature() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL is the source of truth so navbar/footer links and tabs always stay in sync
  const selectedCategory = searchParams.get('category') || 'all';
  const urlSearch = searchParams.get('search') || '';

  const [typedSearch, setTypedSearch] = useState<{ from: string; value: string }>({
    from: urlSearch,
    value: urlSearch,
  });
  // Reset typed text when the URL search changes (e.g. navbar search)
  const searchQuery = typedSearch.from === urlSearch ? typedSearch.value : urlSearch;
  const setSearchQuery = (value: string) => setTypedSearch({ from: urlSearch, value });

  const setSelectedCategory = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === 'all') params.delete('category');
    else params.set('category', id);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  const categories = [
    { id: 'all', label: `All Items (${productService.getAllProducts().length})` },
    { id: 'earrings', label: `Earrings (${productService.getProductsByCategory('earrings').length})` },
    { id: 'rings', label: `Rings (${productService.getProductsByCategory('rings').length})` },
    { id: 'bracelets', label: `Bracelets (${productService.getProductsByCategory('bracelets').length})` },
  ];

  const filteredProducts = useMemo(() => {
    let list = productService.getAllProducts();

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

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
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">
          Our Collection
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-neutral-500">
          Explore {filteredProducts.length} cute, lightweight jewellery and gift items.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-200">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-amber-200 shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 md:w-56">
            <input
              type="text"
              placeholder="Filter by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-stone-200 bg-white pl-8 pr-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            />
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-stone-400" />
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'name')}
              className="bg-transparent text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 p-12 text-center my-12">
          <Sparkles className="mx-auto h-8 w-8 text-stone-400 mb-2" />
          <h3 className="text-sm font-bold text-stone-800">No products found</h3>
          <p className="mt-1 text-xs text-stone-500">
            Try clearing your search query or switching categories.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-4 rounded-full bg-stone-900 px-5 py-2 text-xs font-bold text-amber-200 hover:bg-amber-800 hover:text-white"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

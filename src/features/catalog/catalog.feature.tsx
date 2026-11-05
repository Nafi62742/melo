'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { productService } from '@/core/services/product.service';
import { ProductCard } from '@/shared/product-card/product-card.component';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

export function CatalogFeature() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'earrings', label: 'Earrings (27)' },
    { id: 'rings', label: 'Rings (8)' },
    { id: 'bracelets', label: 'Bracelets (4)' },
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
              className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
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
              className="w-full rounded-full border border-neutral-200 bg-white pl-8 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-violet-500"
            />
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-neutral-400" />
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'name')}
              className="bg-transparent text-xs font-medium text-neutral-700 focus:outline-none cursor-pointer"
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
        <div className="rounded-3xl border border-dashed border-neutral-300 p-12 text-center my-12">
          <Sparkles className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
          <h3 className="text-sm font-semibold text-neutral-800">No products found</h3>
          <p className="mt-1 text-xs text-neutral-500">
            Try clearing your search query or switching categories.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-4 rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white"
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

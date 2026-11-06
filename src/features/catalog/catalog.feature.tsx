'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { productService } from '@/core/services/product.service';
import { ProductCard } from '@/shared/product-card/product-card.component';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

export function CatalogFeature() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [allProducts, setAllProducts] = useState(() => productService.getAllProducts());
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  useEffect(() => {
    void productService.syncFromDatabase().then((remote) => {
      setAllProducts([...remote]);
    });
  }, []);

  const categories = [
    { id: 'all', label: `All Pieces (${allProducts.length})` },
    { id: 'earrings', label: `French Ear Clips (${allProducts.filter((p) => p.category === 'earrings').length})` },
    { id: 'rings', label: `Minimalist Rings (${allProducts.filter((p) => p.category === 'rings').length})` },
    { id: 'bracelets', label: `Bracelets (${allProducts.filter((p) => p.category === 'bracelets').length})` },
  ];

  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

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
  }, [allProducts, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="pb-20">
      {/* Boutique Editorial Header Banner */}
      <div className="bg-[#F3EDE4]/70 border-b border-[#E7E0D6] py-10 md:py-14 mb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A7B3E] mb-2">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <span>Catalogue</span>
          </div>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-medium text-[#1C1917]">
            The Jewellery Collection
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-[#78716C] max-w-lg mx-auto">
            Showing {filteredProducts.length} curated pieces — crafted for effortless everyday elegance and nationwide Cash on Delivery.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Filter and Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-10 pb-6 border-b border-[#E7E0D6]">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#1C1917] text-[#FAF7F2]'
                    : 'bg-white border border-[#E7E0D6] text-[#78716C] hover:border-[#1C1917] hover:text-[#1C1917]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-60">
              <input
                type="text"
                placeholder="Search by name or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-[#E7E0D6] bg-white pl-9 pr-3 py-2 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#C5A059]"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#78716C]" />
            </div>

            <div className="flex items-center gap-2 border border-[#E7E0D6] bg-white px-3.5 py-2 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#9A7B3E]" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'name')
                }
                className="bg-transparent text-xs font-medium text-[#1C1917] focus:outline-none cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="border border-dashed border-[#D6CFC5] bg-white p-14 text-center my-10">
            <Sparkles className="mx-auto h-7 w-7 text-[#C5A059] mb-3" />
            <h3 className="font-serif-display text-2xl font-medium text-[#1C1917]">
              No matching pieces found
            </h3>
            <p className="mt-1 text-xs text-[#78716C]">
              Try clearing your search query or switching to another jewellery category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-5 boutique-btn-primary px-6 py-2.5"
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
    </div>
  );
}

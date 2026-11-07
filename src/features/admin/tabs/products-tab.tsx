'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/core/models/product.model';
import { ProductType } from '@/core/models/product-type.model';
import { AdminZoomImage } from '../modals/image-zoom-modal';
import { Upload, Download, ZoomIn, Star, Minus, Plus, Edit3, Trash2 } from 'lucide-react';

export type StockFilterType = 'all' | 'in_stock' | 'low_stock' | 'sold_out' | 'featured';

interface AdminProductsTabProps {
  products: Product[];
  filteredProducts: Product[];
  productTypes: ProductType[];
  selectedCategory: string;
  onChangeSelectedCategory: (category: string) => void;
  stockFilter: StockFilterType;
  onChangeStockFilter: (filter: StockFilterType) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  lowStockCount: number;
  soldOutCount: number;
  onTriggerCsvImport: () => void;
  onExportCsv: (onlyFiltered: boolean) => void;
  getUnitLandedCost: (p: Product) => number;
  getUnitMinSellPrice: (p: Product) => number;
  getUnitNetProfit: (p: Product) => number;
  onZoomImage: (image: AdminZoomImage) => void;
  onToggleFeatured: (product: Product) => void;
  onStockDelta: (productId: string, delta: number) => void;
  onMarkOneSold: (product: Product) => void;
  onMarkSoldOut: (product: Product) => void;
  onQuickRestock: (product: Product, addQty: number) => void;
  onOpenEditModal: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

export function AdminProductsTab({
  products,
  filteredProducts,
  productTypes,
  selectedCategory,
  onChangeSelectedCategory,
  stockFilter,
  onChangeStockFilter,
  searchQuery,
  onChangeSearchQuery,
  lowStockCount,
  soldOutCount,
  onTriggerCsvImport,
  onExportCsv,
  getUnitLandedCost,
  getUnitMinSellPrice,
  getUnitNetProfit,
  onZoomImage,
  onToggleFeatured,
  onStockDelta,
  onMarkOneSold,
  onMarkSoldOut,
  onQuickRestock,
  onOpenEditModal,
  onDeleteProduct,
}: AdminProductsTabProps) {
  return (
    <div className="space-y-6">
      <div className="border border-[#E7E0D6] bg-white overflow-hidden rounded-xl shadow-xs">
        <div className="px-6 py-4 border-b border-[#E7E0D6] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1C1917]">
                Product Catalogue &amp; Live Inventory Editor
              </h2>
              <p className="text-[11px] text-[#78716C] mt-0.5">
                Filter by category or stock state, use <strong>Import CSV</strong> (only changed
                rows update, the rest remain untouched), or click <strong>Sold 1 (-1)</strong> /{' '}
                <strong>Sold Out (0)</strong>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onTriggerCsvImport}
                className="inline-flex items-center gap-1.5 border border-[#C5A059] bg-[#FAF7F2] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] hover:bg-[#F3EDE4] transition cursor-pointer rounded-lg shadow-2xs"
                title="Import a CSV file — only modified or new items will update"
              >
                <Upload className="w-3.5 h-3.5 text-[#9A7B3E]" />
                <span>Import CSV (Diff Only)</span>
              </button>
              <button
                type="button"
                onClick={() => onExportCsv(true)}
                className="inline-flex items-center gap-1.5 border border-[#E7E0D6] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] hover:border-[#C5A059] transition cursor-pointer rounded-lg shadow-2xs"
                title="Export currently shown products to CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#9A7B3E]" />
                <span>
                  Export {selectedCategory === 'all' ? 'All' : selectedCategory} CSV (
                  {filteredProducts.length})
                </span>
              </button>
            </div>
          </div>

          {/* Category, Stock Filter & Search Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-[#F3EDE4]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#78716C] mr-1">
                Product Type:
              </span>
              <button
                type="button"
                onClick={() => onChangeSelectedCategory('all')}
                className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider border transition cursor-pointer rounded-lg ${
                  selectedCategory === 'all'
                    ? 'border-[#1C1917] bg-[#1C1917] text-[#FAF7F2] shadow-2xs'
                    : 'border-[#E7E0D6] bg-[#FAF7F2]/60 text-[#78716C] hover:border-[#C5A059] hover:text-[#1C1917]'
                }`}
              >
                All ({products.length})
              </button>
              {productTypes.map((pt) => (
                <button
                  key={pt.slug}
                  type="button"
                  onClick={() => onChangeSelectedCategory(pt.slug)}
                  className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider border transition cursor-pointer rounded-lg ${
                    selectedCategory === pt.slug
                      ? 'border-[#1C1917] bg-[#1C1917] text-[#FAF7F2] shadow-2xs'
                      : 'border-[#E7E0D6] bg-[#FAF7F2]/60 text-[#78716C] hover:border-[#C5A059] hover:text-[#1C1917]'
                  }`}
                >
                  {pt.name} ({products.filter((p) => p.category === pt.slug).length})
                </button>
              ))}
            </div>

            {/* Stock Status Filter & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1">
                {(
                  [
                    { key: 'all', label: 'All Stock' },
                    {
                      key: 'featured',
                      label: `★ Featured (${products.filter((p) => p.isFeatured).length})`,
                    },
                    {
                      key: 'in_stock',
                      label: `In Stock (${products.filter((p) => p.stock > 0).length})`,
                    },
                    {
                      key: 'low_stock',
                      label: `Low ≤2 (${lowStockCount})`,
                    },
                    {
                      key: 'sold_out',
                      label: `Sold Out (${soldOutCount})`,
                    },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => onChangeStockFilter(st.key)}
                    className={`px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider border transition cursor-pointer rounded-lg ${
                      stockFilter === st.key
                        ? 'border-[#C5A059] bg-[#FAF7F2] text-[#1C1917] shadow-2xs'
                        : 'border-[#E7E0D6] bg-white text-[#78716C] hover:text-[#1C1917]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onChangeSearchQuery(e.target.value)}
                placeholder="Search piece name..."
                className="border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3 py-1.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059] w-44 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#78716C]">
            <thead className="bg-[#FAF7F2] border-b border-[#E7E0D6] text-[#1C1917] uppercase font-semibold text-[10px] tracking-[0.16em]">
              <tr>
                <th className="py-3.5 px-4">Piece</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Per Piece Cost &amp; Landed</th>
                <th className="py-3.5 px-4">Selling / Revised Price &amp; Profit</th>
                <th className="py-3.5 px-4">Quick Stock &amp; Sold Controls</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3EDE4]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#78716C]">
                    No products match your selected category or filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const unitLanded = getUnitLandedCost(p);
                  const unitMinSell = getUnitMinSellPrice(p);
                  const unitProfit = getUnitNetProfit(p);

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF7F2]/60">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              onZoomImage({
                                src: p.imageUrl,
                                title: p.name,
                                subtitle: `${p.categoryName} • ৳${p.priceBDT}`,
                              })
                            }
                            className="relative h-12 w-10 flex-shrink-0 overflow-hidden bg-[#F3EDE4] border border-[#E7E0D6] rounded-lg group cursor-zoom-in hover:border-[#9A7B3E] transition shadow-2xs"
                            title="Click to view full zoomed image"
                          >
                            <Image
                              src={p.imageUrl}
                              alt={p.name}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-110 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <ZoomIn className="w-3.5 h-3.5 text-white drop-shadow" />
                            </div>
                          </button>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onToggleFeatured(p)}
                                title={
                                  p.isFeatured
                                    ? 'Featured on Storefront (Click to unfeature)'
                                    : 'Click to feature on Storefront'
                                }
                                className="p-1 rounded-full hover:scale-125 hover:bg-amber-50 transition cursor-pointer"
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    p.isFeatured
                                      ? 'fill-amber-400 text-amber-500'
                                      : 'text-stone-300 hover:text-amber-400'
                                  }`}
                                />
                              </button>
                              <span className="font-serif-display text-base font-medium text-[#1C1917]">
                                {p.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#A8A29E] pl-5">{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 capitalize font-medium text-[#1C1917]">
                        {p.category}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-sm text-[#1C1917]">
                          ¥{p.costPriceCNY ?? 0}
                        </div>
                        <div className="text-[10px] text-[#78716C] mt-0.5">
                          Landed: <strong className="text-[#1C1917]">৳{unitLanded}</strong> · Min: ৳{unitMinSell}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono font-bold text-sm text-[#1C1917]">
                            ৳{p.priceBDT}
                          </span>
                          {p.originalPriceBDT && p.originalPriceBDT > p.priceBDT && (
                            <span className="text-[10px] text-[#A8A29E] line-through font-mono">
                              ৳{p.originalPriceBDT}
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-[10px] font-semibold mt-0.5 ${
                            unitProfit >= 0 ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          Net Profit:{' '}
                          {unitProfit >= 0 ? `+৳${unitProfit}` : `-৳${Math.abs(unitProfit)}`} / pc
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Stock Stepper */}
                          <div className="inline-flex items-center border border-[#D6CFC5] bg-white rounded-lg shadow-2xs overflow-hidden">
                            <button
                              type="button"
                              onClick={() => onStockDelta(p.id, -1)}
                              disabled={p.stock <= 0}
                              className="px-2 py-1 text-[#78716C] hover:text-[#1C1917] hover:bg-stone-50 disabled:opacity-30 cursor-pointer transition"
                              aria-label="Decrease stock"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-xs text-[#1C1917]">
                              {p.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => onStockDelta(p.id, 1)}
                              className="px-2 py-1 text-[#78716C] hover:text-[#1C1917] hover:bg-stone-50 cursor-pointer transition"
                              aria-label="Increase stock"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {p.stock > 0 ? (
                            <>
                              <button
                                type="button"
                                onClick={() => onMarkOneSold(p)}
                                className="rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-900 transition cursor-pointer shadow-2xs"
                                title="Deduct 1 unit sold via WhatsApp/Messenger/Offline"
                              >
                                Sold 1 (-1)
                              </button>
                              <button
                                type="button"
                                onClick={() => onMarkSoldOut(p)}
                                className="rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-800 transition cursor-pointer shadow-2xs"
                                title="Set stock to 0 (Out of Stock on storefront)"
                              >
                                Sold Out (0)
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onQuickRestock(p, 3)}
                              className="rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-800 transition cursor-pointer shadow-2xs"
                              title="Quickly restock +3 units"
                            >
                              + Restock 3
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {p.stock > 2 ? (
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                            In Stock ({p.stock})
                          </span>
                        ) : p.stock > 0 ? (
                          <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900">
                            Low Stock ({p.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-800">
                            Sold Out (0)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenEditModal(p)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6CFC5] bg-white hover:bg-stone-50 hover:border-[#9A7B3E] px-3 py-1.5 text-xs font-semibold text-[#1C1917] transition shadow-2xs cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#9A7B3E]" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(p)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            aria-label={`Delete ${p.name}`}
                            title={`Delete ${p.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


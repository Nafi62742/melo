'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/core/models/product.model';
import { ProductType } from '@/core/models/product-type.model';
import { AdminZoomImage } from '../modals/image-zoom-modal';
import { ZoomIn, Star, Minus, Plus, Edit3, Trash2, Search, PackagePlus } from 'lucide-react';
import { useI18n } from '@/core/i18n/i18n.context';

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
  onTriggerCsvImport?: () => void;
  onExportCsv?: (onlyFiltered: boolean) => void;
  getUnitLandedCost: (p: Product) => number;
  getUnitMinSellPrice: (p: Product) => number;
  getUnitNetProfit: (p: Product) => number;
  onZoomImage: (image: AdminZoomImage) => void;
  onToggleFeatured: (product: Product) => void;
  onStockDelta: (productId: string, delta: number) => void;
  onMarkOneSold: (product: Product) => void;
  onMarkSoldOut: (product: Product) => void;
  onQuickRestock: (product: Product, addQty: number) => void;
  onOpenAddModal?: () => void;
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
  getUnitLandedCost,
  getUnitMinSellPrice,
  getUnitNetProfit,
  onZoomImage,
  onToggleFeatured,
  onStockDelta,
  onMarkOneSold,
  onMarkSoldOut,
  onQuickRestock,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProduct,
}: AdminProductsTabProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="border border-slate-200 bg-white overflow-hidden rounded-2xl shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-900">
                {t.admin.productsTab.title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.admin.productsTab.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {onOpenAddModal && (
                <button
                  type="button"
                  onClick={onOpenAddModal}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-xl shadow-xs"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>+ Add New Piece</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filters, Stock Filter Pills & Search */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {/* Category selection */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1">
                Category:
              </span>
              <button
                type="button"
                onClick={() => onChangeSelectedCategory('all')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition cursor-pointer rounded-xl ${
                  selectedCategory === 'all'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{t.admin.productsTab.all}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    selectedCategory === 'all'
                      ? 'bg-white text-slate-900'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {products.length}
                </span>
              </button>
              {productTypes.map((pt) => {
                const count = products.filter((p) => p.category === pt.slug).length;
                const isActive = selectedCategory === pt.slug;
                return (
                  <button
                    key={pt.slug}
                    type="button"
                    onClick={() => onChangeSelectedCategory(pt.slug)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition cursor-pointer rounded-xl ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <span>{pt.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-white text-slate-900'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Stock status filter + live search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl">
                {(
                  [
                    {
                      key: 'all',
                      label: t.admin.productsTab.allStock,
                      count: products.length,
                    },
                    {
                      key: 'featured',
                      label: t.admin.productsTab.featured,
                      count: products.filter((p) => p.isFeatured).length,
                    },
                    {
                      key: 'in_stock',
                      label: t.admin.productsTab.inStock,
                      count: products.filter((p) => p.stock > 0).length,
                    },
                    {
                      key: 'low_stock',
                      label: t.admin.productsTab.lowStock,
                      count: lowStockCount,
                    },
                    {
                      key: 'sold_out',
                      label: t.admin.productsTab.soldOut,
                      count: soldOutCount,
                    },
                  ] as const
                ).map((st) => {
                  const isActive = stockFilter === st.key;
                  return (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => onChangeStockFilter(st.key)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer rounded-lg whitespace-nowrap ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      <span>{st.label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                          isActive
                            ? 'bg-white text-slate-900'
                            : st.key === 'sold_out' && st.count > 0
                            ? 'bg-rose-100 text-rose-800'
                            : st.key === 'low_stock' && st.count > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {st.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 border border-slate-300 bg-white px-3 py-1.5 rounded-xl shadow-2xs w-56 focus-within:border-slate-800">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onChangeSearchQuery(e.target.value)}
                  placeholder="Search pieces..."
                  className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Table with High Contrast Light Mode */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-[0.16em]">
              <tr>
                <th className="py-3.5 px-4">{t.admin.productsTab.colPiece}</th>
                <th className="py-3.5 px-4">{t.admin.productsTab.colCategory}</th>
                <th className="py-3.5 px-4">{t.admin.productsTab.colCost}</th>
                <th className="py-3.5 px-4">{t.admin.productsTab.colPrice}</th>
                <th className="py-3.5 px-4">{t.admin.productsTab.colControls}</th>
                <th className="py-3.5 px-4">{t.admin.productsTab.colStatus}</th>
                <th className="py-3.5 px-4 text-right">{t.admin.productsTab.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                    {t.admin.productsTab.noMatch}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const unitLanded = getUnitLandedCost(p);
                  const unitMinSell = getUnitMinSellPrice(p);
                  const unitProfit = getUnitNetProfit(p);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      {/* Piece info + image preview */}
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
                            className="relative h-12 w-10 flex-shrink-0 overflow-hidden bg-slate-100 border border-slate-200 rounded-lg group cursor-zoom-in hover:border-slate-800 transition shadow-2xs"
                            title="Click to view full zoomed image"
                          >
                            <Image
                              src={p.imageUrl}
                              alt={p.name}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-110 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
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
                                className="p-1 rounded-full hover:scale-125 hover:bg-slate-100 transition cursor-pointer"
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    p.isFeatured
                                      ? 'fill-amber-400 text-amber-500'
                                      : 'text-slate-300 hover:text-amber-500'
                                  }`}
                                />
                              </button>
                              <span className="text-sm font-bold text-slate-900">
                                {p.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 pl-6">{p.slug}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 capitalize font-semibold text-slate-800">
                        {p.category}
                      </td>

                      {/* Landed Cost */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-base text-slate-900">
                          ¥{p.costPriceCNY ?? 0}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {t.admin.productsTab.landed} <strong className="text-slate-900 font-bold font-mono text-xs">৳{unitLanded}</strong> · min ৳{unitMinSell}
                        </div>
                      </td>

                      {/* Selling Price & Net Margin */}
                      <td className="py-3 px-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono font-extrabold text-base text-slate-900">
                            ৳{p.priceBDT}
                          </span>
                          {p.originalPriceBDT && p.originalPriceBDT > p.priceBDT && (
                            <span className="text-xs text-slate-400 line-through font-mono">
                              ৳{p.originalPriceBDT}
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-[11px] font-bold font-mono mt-0.5 ${
                            unitProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {unitProfit >= 0 ? `+৳${unitProfit}` : `-৳${Math.abs(unitProfit)}`} / pc
                        </div>
                      </td>

                      {/* Quick Stock Controls */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {/* Segmented Stepper */}
                          <div className="inline-flex items-center border border-slate-300 bg-white rounded-xl overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => onStockDelta(p.id, -1)}
                              disabled={p.stock <= 0}
                              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-r border-slate-200 disabled:opacity-25 cursor-pointer transition"
                              aria-label="Decrease stock"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-10 text-center font-mono font-bold text-xs text-slate-900 py-1">
                              {p.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => onStockDelta(p.id, 1)}
                              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-l border-slate-200 cursor-pointer transition"
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
                                className="rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 transition cursor-pointer shadow-2xs whitespace-nowrap"
                                title="Deduct 1 unit sold via WhatsApp/Messenger/Offline"
                              >
                                {t.admin.productsTab.soldOne}
                              </button>
                              <button
                                type="button"
                                onClick={() => onMarkSoldOut(p)}
                                className="rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-900 transition cursor-pointer shadow-2xs whitespace-nowrap"
                                title="Set stock to 0 (Out of Stock on storefront)"
                              >
                                {t.admin.productsTab.soldOutBtn}
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onQuickRestock(p, 3)}
                              className="rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-900 transition cursor-pointer shadow-2xs whitespace-nowrap"
                              title="Quickly restock +3 units"
                            >
                              {t.admin.productsTab.restock3}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {p.stock > 2 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-900 shadow-2xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                            <span>In Stock · {p.stock}</span>
                          </span>
                        ) : p.stock > 0 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900 shadow-2xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>Low Stock · {p.stock}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-900 shadow-2xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 shrink-0" />
                            <span>Sold Out</span>
                          </span>
                        )}
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenEditModal(p)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 px-3 py-1.5 text-xs font-semibold text-slate-800 transition shadow-2xs cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                            <span>{t.admin.productsTab.edit}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(p)}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white p-1.5 text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition shadow-2xs cursor-pointer"
                            aria-label={`Delete ${p.name}`}
                            title={`Delete ${p.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

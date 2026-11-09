'use client';

import React from 'react';
import { Product } from '@/core/models/product.model';
import { ProductType } from '@/core/models/product-type.model';
import { X, Layers, Plus } from 'lucide-react';
import { useI18n } from '@/core/i18n/i18n.context';

interface AdminProductTypesTabProps {
  products: Product[];
  productTypes: ProductType[];
  newTypeName: string;
  onChangeNewTypeName: (value: string) => void;
  newTypeDesc: string;
  onChangeNewTypeDesc: (value: string) => void;
  onAddProductType: (e: React.FormEvent) => void;
  onDeleteProductType: (typeItem: ProductType) => void;
}

export function AdminProductTypesTab({
  products,
  productTypes,
  newTypeName,
  onChangeNewTypeName,
  newTypeDesc,
  onChangeNewTypeDesc,
  onAddProductType,
  onDeleteProductType,
}: AdminProductTypesTabProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="border border-slate-200 bg-white p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-700 block">
                {t.admin.typesTab.badge}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {t.admin.typesTab.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.admin.typesTab.subtitle}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
            {productTypes.length} {t.admin.typesTab.activeTypes}
          </span>
        </div>

        {/* Existing Product Types List */}
        <div className="flex flex-wrap items-center gap-2.5 my-5">
          {productTypes.map((pt) => {
            const count = products.filter((p) => p.category === pt.slug).length;
            return (
              <div
                key={pt.slug}
                className="inline-flex items-center gap-2.5 border border-slate-200 bg-slate-50 hover:bg-slate-100/80 px-3.5 py-2 text-xs rounded-xl shadow-2xs transition"
              >
                <span className="font-bold text-slate-900">{pt.name}</span>
                <span className="font-mono text-[11px] text-slate-500 font-medium">({pt.slug})</span>
                <span className="bg-slate-200 text-slate-800 px-2 py-0.5 text-[10px] font-extrabold rounded-md">
                  {count} pcs
                </span>
                {count === 0 && (
                  <button
                    type="button"
                    onClick={() => onDeleteProductType(pt)}
                    className="text-slate-400 hover:text-rose-600 ml-0.5 p-1 rounded-lg hover:bg-rose-50 cursor-pointer transition"
                    title={`Remove unused type ${pt.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add New Product Type Form */}
        <form
          onSubmit={onAddProductType}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 border-t border-slate-100 text-xs"
        >
          <div className="sm:col-span-4">
            <input
              type="text"
              required
              value={newTypeName}
              onChange={(e) => onChangeNewTypeName(e.target.value)}
              placeholder={t.admin.typesTab.namePlaceholder}
              className="w-full border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 rounded-xl shadow-2xs"
            />
          </div>
          <div className="sm:col-span-5">
            <input
              type="text"
              value={newTypeDesc}
              onChange={(e) => onChangeNewTypeDesc(e.target.value)}
              placeholder={t.admin.typesTab.descPlaceholder}
              className="w-full border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 rounded-xl shadow-2xs"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-black text-white py-2.5 px-4 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product Type</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

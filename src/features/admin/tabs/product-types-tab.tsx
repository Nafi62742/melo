'use client';

import React from 'react';
import { Product } from '@/core/models/product.model';
import { ProductType } from '@/core/models/product-type.model';
import { X } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="border border-[#C5A059] bg-white p-6 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E7E0D6]">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A7B3E] block">
              {t.admin.typesTab.badge}
            </span>
            <h2 className="font-serif-display text-2xl font-medium text-[#1C1917]">
              {t.admin.typesTab.title}
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              {t.admin.typesTab.subtitle}{' '}
              <code className="bg-[#FAF7F2] px-1.5 py-0.5 text-[#1C1917] rounded">
                public.product_types
              </code>
              .
            </p>
          </div>
          <span className="text-xs font-semibold text-[#1C1917] bg-[#FAF7F2] border border-[#E7E0D6] px-3 py-1 rounded-full">
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
                className="inline-flex items-center gap-2 border border-[#E7E0D6] bg-[#FAF7F2] px-3.5 py-2 text-xs rounded-lg shadow-2xs"
              >
                <span className="font-semibold text-[#1C1917]">{pt.name}</span>
                <span className="font-mono text-[10px] text-[#78716C]">({pt.slug})</span>
                <span className="bg-white border border-[#E6D5B8] px-2 py-0.5 text-[10px] font-semibold text-[#9A7B3E] rounded-md">
                  {count} pcs
                </span>
                {count === 0 && (
                  <button
                    type="button"
                    onClick={() => onDeleteProductType(pt)}
                    className="text-[#A8A29E] hover:text-red-600 ml-1 p-0.5 rounded-full hover:bg-red-50 cursor-pointer transition"
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
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 border-t border-[#F3EDE4] text-xs"
        >
          <div className="sm:col-span-4">
            <input
              type="text"
              required
              value={newTypeName}
              onChange={(e) => onChangeNewTypeName(e.target.value)}
              placeholder={t.admin.typesTab.namePlaceholder}
              className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059] rounded-lg shadow-2xs"
            />
          </div>
          <div className="sm:col-span-5">
            <input
              type="text"
              value={newTypeDesc}
              onChange={(e) => onChangeNewTypeDesc(e.target.value)}
              placeholder={t.admin.typesTab.descPlaceholder}
              className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059] rounded-lg shadow-2xs"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full boutique-btn-primary py-2.5 px-4 text-xs font-semibold cursor-pointer rounded-lg shadow-2xs"
            >
              {t.admin.typesTab.addBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


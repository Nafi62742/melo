'use client';

import React from 'react';
import { Product } from '@/core/models/product.model';
import { Trash2 } from 'lucide-react';

interface AdminDeleteProductModalProps {
  product: Product | null;
  onCancel: () => void;
  onConfirmDelete: (product: Product) => void;
}

export function AdminDeleteProductModal({
  product,
  onCancel,
  onConfirmDelete,
}: AdminDeleteProductModalProps) {
  if (!product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-white border border-[#E7E0D6] rounded-2xl shadow-2xl overflow-hidden p-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0 text-red-600">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif-display text-xl font-semibold text-[#1C1917]">
              Delete Jewellery Piece?
            </h3>
            <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
              Are you sure you want to delete this piece? It will be permanently removed from your catalog and inventory.
            </p>
          </div>
        </div>

        {/* Product Card Preview */}
        <div className="my-4 p-3 rounded-xl bg-[#FAF7F2] border border-[#E7E0D6] flex items-center gap-3">
          <div className="relative h-14 w-12 rounded-lg overflow-hidden border border-[#D6CFC5] bg-white flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="truncate flex-1 min-w-0">
            <div className="font-medium text-xs text-[#1C1917] truncate">
              {product.name}
            </div>
            <div className="text-[11px] text-[#78716C] mt-0.5">
              {product.categoryName} ·{' '}
              <span className="font-mono font-semibold text-[#1C1917]">৳{product.priceBDT}</span> · Stock:{' '}
              {product.stock}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#D6CFC5] bg-white hover:bg-stone-50 px-4 py-2 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirmDelete(product)}
            className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Yes, Delete Piece</span>
          </button>
        </div>
      </div>
    </div>
  );
}


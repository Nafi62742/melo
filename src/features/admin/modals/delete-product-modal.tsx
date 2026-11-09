'use client';

import React from 'react';
import { Product } from '@/core/models/product.model';
import { Trash2 } from 'lucide-react';
import { useI18n } from '@/core/i18n/i18n.context';

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
  const { t } = useI18n();
  if (!product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-left text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0 text-rose-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900">
              {t.admin.modals.deleteTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {t.admin.modals.deleteDesc}
            </p>
          </div>
        </div>

        {/* Product Card Preview */}
        <div className="my-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
          <div className="relative h-14 w-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="truncate flex-1 min-w-0">
            <div className="font-semibold text-xs text-white truncate">
              {product.name}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {product.categoryName} ·{' '}
              <span className="font-mono font-bold text-white">৳{product.priceBDT}</span> · Stock:{' '}
              <span className="font-bold text-indigo-400">{product.stock}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition cursor-pointer"
          >
            {t.admin.modals.cancel}
          </button>
          <button
            type="button"
            onClick={() => onConfirmDelete(product)}
            className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.admin.modals.confirmDelete}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

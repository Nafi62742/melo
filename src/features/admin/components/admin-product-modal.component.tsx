'use client';

import React from 'react';
import { ProductType } from '@/core/models/product-type.model';
import { X, ZoomIn } from 'lucide-react';

export interface ProductFormState {
  id?: string;
  name: string;
  category: string;
  priceBDT: number;
  originalPriceBDT: number;
  costPriceCNY: number;
  stock: number;
  imageUrl: string;
  description: string;
  isFeatured: boolean;
  isNew: boolean;
}

interface AdminProductModalProps {
  isOpen: boolean;
  editingId: string | null;
  form: ProductFormState;
  productTypes: ProductType[];
  onClose: () => void;
  onChangeForm: (form: ProductFormState) => void;
  onSaveProduct: (e: React.FormEvent) => void;
  onZoomImage?: (image: { src: string; title: string; subtitle?: string }) => void;
}

export function AdminProductModal({
  isOpen,
  editingId,
  form,
  productTypes,
  onClose,
  onChangeForm,
  onSaveProduct,
  onZoomImage,
}: AdminProductModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181512]/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg border border-[#C5A059] bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between bg-[#181512] px-6 py-4 text-[#FAF7F2]">
          <h3 className="font-serif-display text-2xl font-medium">
            {editingId ? 'Update Jewellery Piece' : 'Add New Jewellery Piece'}
          </h3>
          <button onClick={onClose} className="text-[#A8A29E] hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSaveProduct} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => onChangeForm({ ...form, name: e.target.value })}
              placeholder="e.g. Pearl Camellia Ear Clip"
              className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                Product Type (from public.product_types) *
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  onChangeForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              >
                {productTypes.map((pt) => (
                  <option key={pt.slug} value={pt.slug}>
                    {pt.name} ({pt.slug})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min={0}
                required
                value={form.stock}
                onChange={(e) => onChangeForm({ ...form, stock: Number(e.target.value) })}
                className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                Per Piece Cost (৳)
              </label>
              <input
                type="number"
                min={0}
                value={form.costPriceCNY}
                onChange={(e) => onChangeForm({ ...form, costPriceCNY: Number(e.target.value) })}
                className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                Selling Price (BDT ৳) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={form.priceBDT}
                onChange={(e) => onChangeForm({ ...form, priceBDT: Number(e.target.value) })}
                className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                Original Price (BDT ৳)
              </label>
              <input
                type="number"
                min={1}
                value={form.originalPriceBDT}
                onChange={(e) =>
                  onChangeForm({ ...form, originalPriceBDT: Number(e.target.value) })
                }
                className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
              Image Path / URL *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={form.imageUrl}
                onChange={(e) => onChangeForm({ ...form, imageUrl: e.target.value })}
                placeholder="/products/earrings/Wreath%20Flowers.webp"
                className="flex-1 border border-[#D6CFC5] px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              />
              {form.imageUrl && (
                <button
                  type="button"
                  onClick={() =>
                    onZoomImage?.({
                      src: form.imageUrl,
                      title: form.name || 'Product Image Preview',
                      subtitle: `${form.category} • ৳${form.priceBDT}`,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#C5A059] bg-[#FAF7F2] text-xs font-semibold text-[#9A7B3E] hover:bg-[#1C1917] hover:text-white transition cursor-pointer shrink-0"
                  title="Click to view full zoomed image"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>View Full Image</span>
                </button>
              )}
            </div>

            {/* Instant Thumbnail Preview Card */}
            {form.imageUrl && (
              <div className="mt-2.5 flex items-center gap-3 p-2.5 border border-[#E7E0D6] bg-stone-50 rounded-xs">
                <button
                  type="button"
                  onClick={() =>
                    onZoomImage?.({
                      src: form.imageUrl,
                      title: form.name || 'Product Image Preview',
                      subtitle: `${form.category} • ৳${form.priceBDT}`,
                    })
                  }
                  className="relative h-14 w-12 border border-[#D6CFC5] bg-white overflow-hidden cursor-zoom-in hover:border-[#9A7B3E] transition shadow-2xs flex-shrink-0 group"
                  title="Click to zoom image"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.imageUrl}
                    alt={form.name || 'Preview'}
                    className="h-full w-full object-cover group-hover:scale-110 transition duration-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '0.3';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <ZoomIn className="w-4 h-4 text-white drop-shadow" />
                  </div>
                </button>
                <div className="text-xs text-[#78716C] min-w-0 flex-1">
                  <div className="font-medium text-[#1C1917] flex items-center gap-1.5">
                    <span>Live Image Preview</span>
                    <span className="text-[10px] text-[#9A7B3E] font-normal">
                      (Tap thumbnail or button to zoom)
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-500 truncate font-mono mt-0.5">
                    {form.imageUrl}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => onChangeForm({ ...form, description: e.target.value })}
              className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => onChangeForm({ ...form, isFeatured: e.target.checked })}
                className="accent-[#1C1917]"
              />
              <span className="font-semibold text-[#1C1917]">Featured on Homepage</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => onChangeForm({ ...form, isNew: e.target.checked })}
                className="accent-[#1C1917]"
              />
              <span className="font-semibold text-[#1C1917]">Mark as New Arrival</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E0D6]">
            <button
              type="button"
              onClick={onClose}
              className="boutique-btn-outline px-5 py-2.5 cursor-pointer"
            >
              Cancel
            </button>
            <button type="submit" className="boutique-btn-primary px-6 py-2.5 cursor-pointer">
              {editingId ? 'Save Changes' : 'Add Piece'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


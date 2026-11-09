'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductType } from '@/core/models/product-type.model';
import { X, ZoomIn, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { useI18n } from '@/core/i18n/i18n.context';

export interface ProductFormState {
  id?: string;
  name: string;
  category: string;
  priceBDT: number;
  originalPriceBDT: number;
  costPriceCNY: number;
  stock: number;
  imageUrl: string;
  images?: string[];
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
  const { t } = useI18n();
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  if (!isOpen) return null;

  // Extract all distinct images for this product (main cover + gallery)
  const allImages = Array.from(
    new Set([form.imageUrl, ...(form.images || [])].filter((url): url is string => Boolean(url && url.trim())))
  );

  const handleAddGalleryImage = () => {
    const trimmed = newGalleryUrl.trim();
    if (!trimmed) return;
    const current = form.images || [];
    if (!current.includes(trimmed) && trimmed !== form.imageUrl) {
      onChangeForm({
        ...form,
        images: [...current, trimmed],
      });
    }
    setNewGalleryUrl('');
  };

  const handleRemoveImage = (urlToRemove: string) => {
    if (urlToRemove === form.imageUrl) {
      const remainingGallery = (form.images || []).filter((u) => u !== urlToRemove);
      const nextMain = remainingGallery[0] || '';
      onChangeForm({
        ...form,
        imageUrl: nextMain,
        images: remainingGallery.filter((u) => u !== nextMain),
      });
    } else {
      onChangeForm({
        ...form,
        images: (form.images || []).filter((u) => u !== urlToRemove),
      });
    }
  };

  const handleSetMainCover = (url: string) => {
    const currentGallery = form.images || [];
    const updatedGallery = Array.from(
      new Set([form.imageUrl, ...currentGallery].filter((u) => u && u !== url))
    );
    onChangeForm({
      ...form,
      imageUrl: url,
      images: updatedGallery,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl rounded-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-950 px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {editingId ? t.admin.modals.editProductTitle : t.admin.modals.addProductTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {editingId ? `Editing piece ID: ${editingId}` : 'Add a new piece to your boutique catalog'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            aria-label="Close edit popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={onSaveProduct} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {t.admin.modals.productName} *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => onChangeForm({ ...form, name: e.target.value })}
              placeholder="e.g. Pearl Camellia Ear Clip"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 bg-white"
            />
          </div>

          {/* Product Type & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.admin.modals.productType} *
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  onChangeForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                className="w-full border border-slate-300 rounded-xl bg-white px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
              >
                {productTypes.map((pt) => (
                  <option key={pt.slug} value={pt.slug} className="bg-slate-900 text-white">
                    {pt.name} ({pt.slug})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.admin.modals.stockQty} *
              </label>
              <input
                type="number"
                min={0}
                required
                value={form.stock}
                onChange={(e) => onChangeForm({ ...form, stock: Number(e.target.value) })}
                className="w-full border border-slate-700 rounded-xl bg-slate-950 px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.admin.modals.costPrice} (¥ CNY)
              </label>
              <input
                type="number"
                min={0}
                value={form.costPriceCNY}
                onChange={(e) => onChangeForm({ ...form, costPriceCNY: Number(e.target.value) })}
                className="w-full border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.admin.modals.sellingPrice} (৳ BDT) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={form.priceBDT}
                onChange={(e) => onChangeForm({ ...form, priceBDT: Number(e.target.value) })}
                className="w-full border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono font-bold bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.admin.modals.originalPrice} (৳ BDT)
              </label>
              <input
                type="number"
                min={0}
                value={form.originalPriceBDT || ''}
                onChange={(e) =>
                  onChangeForm({
                    ...form,
                    originalPriceBDT: e.target.value ? Number(e.target.value) : 0,
                  })
                }
                placeholder="Optional strike"
                className="w-full border border-slate-700 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500 font-mono bg-slate-950"
              />
            </div>
          </div>

          {/* Cover & Gallery Images */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Product Images &amp; Gallery
            </label>

            {/* Main Cover URL */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">
                Primary Cover Image URL *
              </span>
              <input
                type="text"
                required
                value={form.imageUrl}
                onChange={(e) => onChangeForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://... or /products/..."
                className="w-full border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-[11px] bg-slate-950"
              />
            </div>

            {/* Visual Image Grid of Cover + Gallery */}
            {allImages.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                {allImages.map((url, idx) => {
                  const isMain = url === form.imageUrl;
                  return (
                    <div
                      key={`${url}-${idx}`}
                      className={`relative group rounded-xl overflow-hidden border ${
                        isMain ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-slate-800'
                      } bg-slate-950 aspect-square flex items-center justify-center`}
                    >
                      <Image
                        src={url}
                        alt="Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-between p-1">
                        <div className="flex items-center justify-between w-full">
                          {onZoomImage && (
                            <button
                              type="button"
                              onClick={() =>
                                onZoomImage({
                                  src: url,
                                  title: form.name || 'Image Preview',
                                  subtitle: isMain ? 'Primary Cover' : 'Gallery Image',
                                })
                              }
                              className="p-1 rounded bg-black/50 text-white hover:bg-black"
                              title="Zoom in"
                            >
                              <ZoomIn className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(url)}
                            className="p-1 rounded bg-rose-900/80 text-rose-200 hover:bg-rose-700"
                            title="Remove image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        {!isMain && (
                          <button
                            type="button"
                            onClick={() => handleSetMainCover(url)}
                            className="w-full py-0.5 text-[9px] font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white rounded text-center"
                          >
                            Set Cover
                          </button>
                        )}
                        {isMain && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                            Cover
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add more gallery URLs */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                placeholder="Paste extra photo URL..."
                className="flex-1 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 bg-slate-950"
              />
              <button
                type="button"
                onClick={handleAddGalleryImage}
                className="inline-flex items-center gap-1 border border-slate-700 bg-slate-800 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 rounded-xl transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Photo</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {t.admin.modals.description} *
            </label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => onChangeForm({ ...form, description: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 bg-white"
            />
          </div>

          {/* Badges Toggle */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => onChangeForm({ ...form, isFeatured: e.target.checked })}
                className="accent-indigo-600 rounded"
              />
              <span className="font-semibold text-slate-200">{t.admin.modals.featuredStorefront}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => onChangeForm({ ...form, isNew: e.target.checked })}
                className="accent-indigo-600 rounded"
              />
              <span className="font-semibold text-slate-200">{t.admin.modals.markNewArrival}</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-white transition cursor-pointer"
            >
              {t.admin.modals.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-md transition cursor-pointer"
            >
              {editingId ? t.admin.modals.saveChanges : t.admin.modals.addPiece}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

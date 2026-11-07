'use client';

import React, { useState } from 'react';
import { ProductType } from '@/core/models/product-type.model';
import { X, ZoomIn, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

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
      // If removing main image, promote the first gallery image or leave blank
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
    // Old main goes into gallery if not already there
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white border border-[#C5A059] shadow-2xl rounded-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[#181512] px-6 py-4 text-[#FAF7F2] flex-shrink-0">
          <div>
            <h3 className="font-serif-display text-xl sm:text-2xl font-medium text-white">
              {editingId ? 'Edit Product Details' : 'Add New Jewellery Piece'}
            </h3>
            <p className="text-[11px] text-[#D4C3A3] mt-0.5">
              {editingId ? `Editing piece ID: ${editingId}` : 'Add a new piece to your boutique catalog'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition cursor-pointer"
            aria-label="Close edit popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={onSaveProduct} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {/* Product Name */}
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
              className="w-full border border-[#D6CFC5] rounded-lg px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059] bg-[#FAF7F2]/40 focus:bg-white"
            />
          </div>

          {/* Product Type & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                Product Type *
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  onChangeForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                className="w-full border border-[#D6CFC5] rounded-lg bg-white px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
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
                className="w-full border border-[#D6CFC5] rounded-lg px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                Cost Price (¥ / ৳)
              </label>
              <input
                type="number"
                min={0}
                value={form.costPriceCNY}
                onChange={(e) => onChangeForm({ ...form, costPriceCNY: Number(e.target.value) })}
                className="w-full border border-[#D6CFC5] rounded-lg px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059] font-mono"
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
                className="w-full border border-[#D6CFC5] rounded-lg px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059] font-mono font-bold"
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
                className="w-full border border-[#D6CFC5] rounded-lg px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059] font-mono"
              />
            </div>
          </div>

          {/* Product Images Section (Main + Gallery Preview) */}
          <div className="border border-[#E7E0D6] rounded-xl p-3.5 bg-[#FAF7F2]/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-[#1C1917] uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-[#C5A059]" />
                <span>Product Images ({allImages.length})</span>
              </div>
              <span className="text-[11px] text-[#78716C]">
                Click thumbnail to zoom · Set main cover
              </span>
            </div>

            {/* Gallery Thumbnails List */}
            {allImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {allImages.map((imgUrl, idx) => {
                  const isMain = imgUrl === form.imageUrl;
                  return (
                    <div
                      key={`${imgUrl}-${idx}`}
                      className={`relative flex flex-col rounded-xl overflow-hidden border transition bg-white p-1.5 shadow-2xs ${
                        isMain ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30' : 'border-[#E7E0D6]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onZoomImage?.({
                            src: imgUrl,
                            title: form.name || 'Product Image',
                            subtitle: isMain ? 'Main Cover Photo' : `Gallery Image #${idx + 1}`,
                          })
                        }
                        className="relative h-24 w-full rounded-lg overflow-hidden bg-stone-100 group cursor-zoom-in"
                        title="Click to zoom image"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`${form.name} ${idx + 1}`}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.opacity = '0.3';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <ZoomIn className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      </button>

                      {/* Card Footer / Actions */}
                      <div className="mt-1.5 flex items-center justify-between gap-1 text-[10px]">
                        {isMain ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-[#C5A059] text-white font-semibold">
                            Main Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetMainCover(imgUrl)}
                            className="text-[#9A7B3E] hover:underline cursor-pointer font-medium"
                          >
                            Set Main
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(imgUrl)}
                          className="p-1 rounded text-stone-400 hover:text-red-600 cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-stone-400 border border-dashed border-stone-300 rounded-xl">
                No images added yet. Add an image path or URL below.
              </div>
            )}

            {/* Main Cover Image Path Input */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                Main Cover Image URL / Path *
              </label>
              <input
                type="text"
                required
                value={form.imageUrl}
                onChange={(e) => onChangeForm({ ...form, imageUrl: e.target.value })}
                placeholder="/products/earrings/camellia.webp"
                className="w-full border border-[#D6CFC5] rounded-lg px-3 py-1.5 text-xs text-[#1C1917] bg-white focus:outline-none focus:border-[#C5A059] font-mono"
              />
            </div>

            {/* Add Extra Gallery Image Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGalleryImage();
                  }
                }}
                placeholder="Add extra gallery image path/URL..."
                className="flex-1 border border-[#D6CFC5] rounded-lg px-3 py-1.5 text-xs text-[#1C1917] bg-white focus:outline-none focus:border-[#C5A059] font-mono"
              />
              <button
                type="button"
                onClick={handleAddGalleryImage}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#C5A059] bg-[#FAF7F2] text-xs font-semibold text-[#9A7B3E] hover:bg-[#1C1917] hover:text-white transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Image</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => onChangeForm({ ...form, description: e.target.value })}
              className="w-full border border-[#D6CFC5] rounded-lg px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Badges Toggle */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => onChangeForm({ ...form, isFeatured: e.target.checked })}
                className="accent-[#1C1917] rounded"
              />
              <span className="font-semibold text-[#1C1917]">Featured on Storefront</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => onChangeForm({ ...form, isNew: e.target.checked })}
                className="accent-[#1C1917] rounded"
              />
              <span className="font-semibold text-[#1C1917]">Mark as New Arrival</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E0D6]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#D6CFC5] bg-white hover:bg-stone-50 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#1C1917] hover:bg-[#9A7B3E] text-white text-xs font-semibold shadow-md transition cursor-pointer"
            >
              {editingId ? 'Save Changes' : 'Add Piece'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

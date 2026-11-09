'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Product } from '@/core/models/product.model';
import { CartItem } from '@/core/models/cart.model';
import { CustomerProfile } from '@/core/models/customer.model';
import { DeliveryZone, OrderSource, PaymentMethod } from '@/core/models/order.model';
import {
  MessageCircle,
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  UserCheck,
  Check,
} from 'lucide-react';
import { useI18n } from '@/core/i18n/i18n.context';

interface AdminManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers?: CustomerProfile[];
  manualSource: OrderSource;
  onChangeManualSource: (source: OrderSource) => void;
  manualCustName: string;
  onChangeManualCustName: (val: string) => void;
  manualCustPhone: string;
  onChangeManualCustPhone: (val: string) => void;
  manualCustAddress: string;
  onChangeManualCustAddress: (val: string) => void;
  manualDeliveryZone: DeliveryZone;
  onChangeManualDeliveryZone: (zone: DeliveryZone) => void;
  manualPaymentMethod: PaymentMethod;
  onChangeManualPaymentMethod: (method: PaymentMethod) => void;
  manualTrxId: string;
  onChangeManualTrxId: (val: string) => void;
  manualSenderPhone: string;
  onChangeManualSenderPhone: (val: string) => void;
  manualSelectedProductId?: string;
  onChangeManualSelectedProductId?: (id: string) => void;
  manualSelectedQty?: number;
  onChangeManualSelectedQty?: (qty: number) => void;
  manualItems: CartItem[];
  onUpdateManualItems?: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onAddManualItem?: () => void;
  onRemoveManualItem: (productId: string) => void;
  onSubmitManualOrder: (e: React.FormEvent) => void;
}

export function AdminManualOrderModal({
  isOpen,
  onClose,
  products,
  customers = [],
  manualSource,
  onChangeManualSource,
  manualCustName,
  onChangeManualCustName,
  manualCustPhone,
  onChangeManualCustPhone,
  manualCustAddress,
  onChangeManualCustAddress,
  manualDeliveryZone,
  onChangeManualDeliveryZone,
  manualPaymentMethod,
  onChangeManualPaymentMethod,
  manualTrxId,
  onChangeManualTrxId,
  manualSenderPhone,
  onChangeManualSenderPhone,
  manualItems,
  onUpdateManualItems,
  onRemoveManualItem,
  onSubmitManualOrder,
}: AdminManualOrderModalProps) {
  const { t } = useI18n();
  const [pieceSearch, setPieceSearch] = useState('');
  const [pieceCategory, setPieceCategory] = useState<string>('all');

  const availableProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.stock <= 0) return false;
      const matchesCat = pieceCategory === 'all' || p.category === pieceCategory;
      const q = pieceSearch.trim().toLowerCase();
      const matchesSearch =
        !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, pieceCategory, pieceSearch]);

  if (!isOpen) return null;

  const handleQuickAddProduct = (prod: Product) => {
    if (prod.stock <= 0) return;
    if (onUpdateManualItems) {
      onUpdateManualItems((prev) => {
        const existingIdx = prev.findIndex((i) => i.product.id === prod.id);
        if (existingIdx !== -1) {
          const currentQty = prev[existingIdx].quantity;
          if (currentQty >= prod.stock) return prev;
          const next = [...prev];
          next[existingIdx] = {
            ...next[existingIdx],
            quantity: currentQty + 1,
          };
          return next;
        }
        return [...prev, { product: prod, quantity: 1 }];
      });
    }
  };

  const handleStepItemQty = (prod: Product, step: number) => {
    if (!onUpdateManualItems) return;
    onUpdateManualItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.product.id === prod.id);
      if (existingIdx === -1) return prev;
      const nextQty = prev[existingIdx].quantity + step;
      if (nextQty <= 0) {
        return prev.filter((i) => i.product.id !== prod.id);
      }
      if (nextQty > prod.stock) return prev;
      const next = [...prev];
      next[existingIdx] = { ...next[existingIdx], quantity: nextQty };
      return next;
    });
  };

  const handleSelectExistingCustomer = (c: CustomerProfile) => {
    onChangeManualCustName(c.fullName);
    onChangeManualCustPhone(c.phone);
    if (c.defaultAddress) onChangeManualCustAddress(c.defaultAddress);
    if (c.deliveryZone) onChangeManualDeliveryZone(c.deliveryZone);
  };

  const manualSubtotal = manualItems.reduce(
    (sum, i) => sum + i.product.priceBDT * i.quantity,
    0
  );
  const manualFee =
    manualItems.length > 0 ? (manualDeliveryZone === 'inside_dhaka' ? 60 : 120) : 0;
  const manualCodFee =
    manualItems.length > 0 && manualPaymentMethod === 'cod' ? 10 : 0;
  const manualTotal = manualSubtotal + manualFee + manualCodFee;
  const totalSelectedUnits = manualItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-5xl border border-slate-200 bg-white text-slate-900 shadow-2xl rounded-2xl overflow-hidden my-auto">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between bg-slate-50 px-5 py-3.5 border-b border-slate-200">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {t.admin.modals.manualModalTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.admin.modals.manualModalSub}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmitManualOrder} className="p-4 sm:p-5 text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT COLUMN (6 cols): Customer, Channel, Address & Payment */}
            <div className="lg:col-span-6 space-y-4">
              {/* Order Source Channel */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Order Channel <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onChangeManualSource('whatsapp')}
                    className={`flex items-center justify-center gap-2 border px-3 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer rounded-xl ${
                      manualSource === 'whatsapp'
                        ? 'border-emerald-500 bg-emerald-600 text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Order</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeManualSource('messenger')}
                    className={`flex items-center justify-center gap-2 border px-3 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer rounded-xl ${
                      manualSource === 'messenger'
                        ? 'border-sky-500 bg-sky-600 text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Facebook Messenger</span>
                  </button>
                </div>
              </div>

              {/* Returning Customer Quick Autofill */}
              {customers.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Autofill Returning Customer</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                    {customers.slice(0, 6).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectExistingCustomer(c)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-800 transition cursor-pointer shadow-xs"
                      >
                        <span className="font-semibold text-slate-900">{c.fullName}</span>
                        <span className="text-slate-400 font-mono">({c.phone})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Customer Full Name <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {manualCustName.length}/30
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={manualCustName}
                    onChange={(e) => onChangeManualCustName(e.target.value)}
                    placeholder="e.g. Tasnim Ahmed"
                    className="w-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 rounded-xl"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Customer Phone <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {manualCustPhone.length}/11
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={14}
                    value={manualCustPhone}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^\d+]/g, '').slice(0, 14);
                      onChangeManualCustPhone(clean);
                    }}
                    placeholder="017XXXXXXXX"
                    className="w-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-slate-900 rounded-xl"
                  />
                </div>
              </div>

              {/* Full Delivery Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Full Delivery Address <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {manualCustAddress.length}/250
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={250}
                  value={manualCustAddress}
                  onChange={(e) => onChangeManualCustAddress(e.target.value)}
                  placeholder="House, Road, Area, City"
                  className="w-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 rounded-xl"
                />
              </div>

              {/* Delivery Zone & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Delivery Zone <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={manualDeliveryZone}
                    onChange={(e) => onChangeManualDeliveryZone(e.target.value as DeliveryZone)}
                    className="w-full border border-slate-200 bg-white px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 rounded-xl"
                  >
                    <option value="inside_dhaka" className="bg-slate-900 text-white">
                      Inside Dhaka (৳60)
                    </option>
                    <option value="outside_dhaka" className="bg-slate-900 text-white">
                      Outside Dhaka (৳120)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Payment Method <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={manualPaymentMethod}
                    onChange={(e) => onChangeManualPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 rounded-xl"
                  >
                    <option value="cod" className="bg-slate-900 text-white">
                      Cash on Delivery (COD) (+৳10)
                    </option>
                    <option value="bkash" className="bg-slate-900 text-white">
                      bKash Merchant Payment (Save ৳10)
                    </option>
                    <option value="card" className="bg-slate-900 text-white">
                      Card Payment
                    </option>
                  </select>
                </div>
              </div>

              {manualPaymentMethod === 'bkash' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-pink-50 border border-pink-200 p-3 rounded-xl">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-pink-800">
                        bKash Sender Number
                      </label>
                      <span className="text-[9px] text-pink-400 font-mono">
                        {manualSenderPhone.length}/11
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={14}
                      value={manualSenderPhone}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^\d+]/g, '').slice(0, 14);
                        onChangeManualSenderPhone(clean);
                      }}
                      placeholder="01XXXXXXXXX"
                      className="w-full border border-pink-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-mono rounded-lg"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-pink-800">
                        bKash TrxID (Auto-Verifies)
                      </label>
                      <span className="text-[9px] text-pink-400 font-mono">
                        {manualTrxId.length}/15
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={15}
                      value={manualTrxId}
                      onChange={(e) => {
                        const clean = e.target.value
                          .replace(/[^a-zA-Z0-9]/g, '')
                          .toUpperCase()
                          .slice(0, 15);
                        onChangeManualTrxId(clean);
                      }}
                      placeholder="e.g. BKS982341A"
                      className="w-full border border-pink-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 uppercase font-mono rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN (6 cols): Visual Product Picker + Selected Order Bag */}
            <div className="lg:col-span-6 flex flex-col border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-xs">
              {/* Visual Catalogue Picker Header */}
              <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Select Jewellery Pieces <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Click piece to add to order
                  </span>
                </div>

                {/* Search + Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex-1 min-w-[140px] flex items-center gap-1.5 border border-slate-300 bg-white px-2.5 py-1.5 rounded-xl focus-within:border-slate-900">
                    <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      value={pieceSearch}
                      onChange={(e) => setPieceSearch(e.target.value)}
                      placeholder="Search pieces..."
                      className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  {(['all', 'earrings', 'rings', 'bracelets'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPieceCategory(cat)}
                      className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition cursor-pointer ${
                        pieceCategory === cat
                          ? 'border-indigo-500 bg-indigo-600 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Visual Product Grid */}
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white">
                {availableProducts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No in-stock pieces match your search.
                  </div>
                ) : (
                  availableProducts.map((p) => {
                    const inBagItem = manualItems.find((i) => i.product.id === p.id);
                    const inBagQty = inBagItem?.quantity || 0;
                    const maxedOut = inBagQty >= p.stock;

                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-2.5 px-3 py-2 hover:bg-slate-50/80 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
                            <Image
                              src={p.imageUrl}
                              alt={p.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-slate-900 truncate">
                              {p.name}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="capitalize">{p.category}</span>
                              <span>•</span>
                              <span className="font-mono font-bold text-slate-900">
                                ৳{p.priceBDT.toLocaleString()}
                              </span>
                              <span>•</span>
                              <span
                                className={
                                  p.stock <= 2
                                    ? 'text-amber-400 font-semibold'
                                    : 'text-emerald-400'
                                }
                              >
                                {p.stock} in stock
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={maxedOut}
                          onClick={() => handleQuickAddProduct(p)}
                          className={`shrink-0 inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                            inBagQty > 0
                              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                              : 'bg-slate-900 text-white hover:bg-black'
                          } disabled:opacity-30`}
                        >
                          {inBagQty > 0 ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Added ({inBagQty})</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected Order Items & Live Summary */}
              <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Selected Order Items ({totalSelectedUnits} pcs)</span>
                  </span>
                </div>

                {manualItems.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white py-4 px-3 text-center text-xs text-slate-500">
                    No pieces added yet — click <strong>+ Add</strong> on any piece above.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {manualItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between gap-2 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            width={28}
                            height={28}
                            unoptimized
                            className="w-7 h-7 object-cover border border-slate-700 rounded-md shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-slate-900 truncate">
                              {item.product.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              ৳{item.product.priceBDT.toLocaleString()} × {item.quantity} ={' '}
                              <strong className="text-slate-900">
                                ৳{(item.product.priceBDT * item.quantity).toLocaleString()}
                              </strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {onUpdateManualItems && (
                            <div className="inline-flex items-center border border-slate-300 bg-white rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() => handleStepItemQty(item.product, -1)}
                                className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="w-6 text-center font-mono font-bold text-xs text-slate-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={item.quantity >= item.product.stock}
                                onClick={() => handleStepItemQty(item.product, 1)}
                                className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => onRemoveManualItem(item.product.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                            title={t.admin.modals.remove}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Total Breakdown */}
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 flex items-center justify-between shadow-2xs">
                  <div className="text-xs text-slate-400">
                    <span>Subtotal: ৳{manualSubtotal.toLocaleString()}</span>
                    <span> • Delivery: ৳{manualFee}</span>
                    {manualCodFee > 0 && <span> • COD: ৳{manualCodFee}</span>}
                  </div>
                  <div className="font-mono text-base font-bold text-slate-900">
                    ৳{manualTotal.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xl transition shadow-2xs"
            >
              {t.admin.modals.cancel}
            </button>
            <button
              type="submit"
              disabled={manualItems.length === 0}
              className="bg-slate-900 hover:bg-black disabled:opacity-40 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xl shadow-sm transition"
            >
              {t.admin.modals.createOrderBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

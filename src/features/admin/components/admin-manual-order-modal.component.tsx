'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/core/models/product.model';
import { CartItem } from '@/core/models/cart.model';
import { DeliveryZone, OrderSource, PaymentMethod } from '@/core/models/order.model';
import { MessageCircle, X } from 'lucide-react';

interface AdminManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
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
  manualSelectedProductId: string;
  onChangeManualSelectedProductId: (id: string) => void;
  manualSelectedQty: number;
  onChangeManualSelectedQty: (qty: number) => void;
  manualItems: CartItem[];
  onAddManualItem: () => void;
  onRemoveManualItem: (productId: string) => void;
  onSubmitManualOrder: (e: React.FormEvent) => void;
}

export function AdminManualOrderModal({
  isOpen,
  onClose,
  products,
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
  manualSelectedProductId,
  onChangeManualSelectedProductId,
  manualSelectedQty,
  onChangeManualSelectedQty,
  manualItems,
  onAddManualItem,
  onRemoveManualItem,
  onSubmitManualOrder,
}: AdminManualOrderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181512]/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl border border-[#C5A059] bg-white shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between bg-[#181512] px-6 py-4 text-[#FAF7F2]">
          <div>
            <h3 className="font-serif-display text-2xl font-medium">
              Create Manual Order (WhatsApp / Messenger)
            </h3>
            <p className="text-[11px] text-[#A8A29E] mt-0.5">
              Automatically deducts stock, saves to public.orders, and lets the customer track on
              /account by phone number.
            </p>
          </div>
          <button onClick={onClose} className="text-[#A8A29E] hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmitManualOrder} className="p-6 space-y-5 text-xs">
          {/* Order Source Channel */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
              Order Channel *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChangeManualSource('whatsapp')}
                className={`flex items-center justify-center gap-2 border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                  manualSource === 'whatsapp'
                    ? 'border-emerald-700 bg-emerald-700 text-white'
                    : 'border-[#D6CFC5] bg-[#FAF7F2] text-[#1C1917] hover:border-emerald-700'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Order
              </button>
              <button
                type="button"
                onClick={() => onChangeManualSource('messenger')}
                className={`flex items-center justify-center gap-2 border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                  manualSource === 'messenger'
                    ? 'border-blue-700 bg-blue-700 text-white'
                    : 'border-[#D6CFC5] bg-[#FAF7F2] text-[#1C1917] hover:border-blue-700'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Facebook Messenger
              </button>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                Customer Full Name *
              </label>
              <input
                type="text"
                required
                value={manualCustName}
                onChange={(e) => onChangeManualCustName(e.target.value)}
                placeholder="e.g. Tasnim Ahmed"
                className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                Customer Phone (For /account Tracking) *
              </label>
              <input
                type="tel"
                required
                value={manualCustPhone}
                onChange={(e) => onChangeManualCustPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
              Full Delivery Address *
            </label>
            <input
              type="text"
              required
              value={manualCustAddress}
              onChange={(e) => onChangeManualCustAddress(e.target.value)}
              placeholder="House, Road, Area, City"
              className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                Delivery Zone *
              </label>
              <select
                value={manualDeliveryZone}
                onChange={(e) => onChangeManualDeliveryZone(e.target.value as DeliveryZone)}
                className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              >
                <option value="inside_dhaka">Inside Dhaka (৳70)</option>
                <option value="outside_dhaka">Outside Dhaka (৳130)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                Payment Method *
              </label>
              <select
                value={manualPaymentMethod}
                onChange={(e) => onChangeManualPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              >
                <option value="cod">Cash on Delivery (COD)</option>
                <option value="bkash">bKash Merchant Payment</option>
                <option value="card">Card Payment</option>
              </select>
            </div>
          </div>

          {manualPaymentMethod === 'bkash' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF7F2] border border-[#E7E0D6] p-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  bKash Sender Number (Optional)
                </label>
                <input
                  type="text"
                  value={manualSenderPhone}
                  onChange={(e) => onChangeManualSenderPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full border border-[#D6CFC5] bg-white px-2.5 py-1.5 text-[#1C1917]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  bKash TrxID (Optional — Auto-Verifies)
                </label>
                <input
                  type="text"
                  value={manualTrxId}
                  onChange={(e) => onChangeManualTrxId(e.target.value)}
                  placeholder="e.g. BKS982341A"
                  className="w-full border border-[#D6CFC5] bg-white px-2.5 py-1.5 text-[#1C1917] uppercase"
                />
              </div>
            </div>
          )}

          {/* Piece Selector */}
          <div className="border border-[#E7E0D6] bg-[#FAF7F2] p-4 space-y-3">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
              Select Jewellery Piece(s) Bought *
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={manualSelectedProductId}
                onChange={(e) => onChangeManualSelectedProductId(e.target.value)}
                className="flex-1 border border-[#D6CFC5] bg-white px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              >
                {products
                  .filter((p) => p.stock > 0)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.category.toUpperCase()}] {p.name} — ৳{p.priceBDT.toLocaleString()} (
                      {p.stock} in stock)
                    </option>
                  ))}
              </select>

              <input
                type="number"
                min={1}
                max={products.find((p) => p.id === manualSelectedProductId)?.stock ?? 1}
                value={manualSelectedQty}
                onChange={(e) => onChangeManualSelectedQty(Math.max(1, Number(e.target.value)))}
                className="w-20 border border-[#D6CFC5] bg-white px-3 py-2 text-xs font-semibold text-[#1C1917]"
              />

              <button
                type="button"
                onClick={onAddManualItem}
                className="bg-[#1C1917] text-white px-4 py-2 text-[11px] font-semibold uppercase tracking-wider hover:bg-[#332E2A] cursor-pointer"
              >
                + Add Piece
              </button>
            </div>

            {manualItems.length === 0 ? (
              <p className="text-[11px] text-[#78716C] italic">
                No pieces added yet. Choose a piece above and click &ldquo;+ Add Piece&rdquo;.
              </p>
            ) : (
              <div className="space-y-2 pt-2">
                {manualItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between bg-white border border-[#E7E0D6] px-3 py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-cover border border-[#E7E0D6]"
                      />
                      <div>
                        <p className="font-semibold text-[#1C1917]">{item.product.name}</p>
                        <p className="text-[10px] text-[#78716C]">
                          Qty: {item.quantity} × ৳{item.product.priceBDT.toLocaleString()} ={' '}
                          <span className="font-semibold text-[#1C1917]">
                            ৳{(item.product.priceBDT * item.quantity).toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveManualItem(item.product.id)}
                      className="text-red-600 hover:text-red-800 text-[11px] font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2 border-t border-[#E7E0D6] text-xs">
                  <span className="text-[#78716C]">
                    Subtotal + Delivery (৳{manualDeliveryZone === 'inside_dhaka' ? 70 : 130}):
                  </span>
                  <span className="font-serif-display text-lg font-semibold text-[#1C1917]">
                    ৳
                    {(
                      manualItems.reduce((acc, i) => acc + i.product.priceBDT * i.quantity, 0) +
                      (manualDeliveryZone === 'inside_dhaka' ? 70 : 130)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
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
              Create Order &amp; Deduct Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


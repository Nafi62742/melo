'use client';

import React from 'react';
import { Product } from '@/core/models/product.model';
import { Order } from '@/core/models/order.model';
import { Smartphone, Package, Layers, ShoppingBag, CheckCircle } from 'lucide-react';
import { useI18n } from '@/core/i18n/i18n.context';

interface AdminMetricsProps {
  bkashNumber: string;
  onChangeBkashNumber: (value: string) => void;
  onSaveBkashNumber: (e: React.FormEvent) => void;
  products: Product[];
  orders: Order[];
  totalStock: number;
  soldOutCount: number;
  lowStockCount: number;
  isSupabaseConnected: boolean;
}

export function AdminMetrics({
  bkashNumber,
  onChangeBkashNumber,
  onSaveBkashNumber,
  products,
  orders,
  totalStock,
  soldOutCount,
  lowStockCount,
  isSupabaseConnected,
}: AdminMetricsProps) {
  const { t } = useI18n();
  return (
    <>
      {/* Store bKash Number Configuration Bar */}
      <form
        onSubmit={onSaveBkashNumber}
        className="mt-6 border border-[#E7E0D6] bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center bg-pink-50 border border-pink-200 text-pink-700 rounded-lg">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#1C1917]">
              {t.admin.metrics.bkashTitle}
            </div>
            <div className="text-[11px] text-[#78716C]">
              {t.admin.metrics.bkashSubtitle}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={bkashNumber}
            onChange={(e) => onChangeBkashNumber(e.target.value)}
            placeholder="01700-000000"
            className="border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3 py-2 text-xs font-mono font-semibold text-[#1C1917] focus:bg-white focus:outline-none focus:border-pink-600 w-44 rounded-lg"
          />
          <button
            type="submit"
            className="bg-pink-700 text-white px-4 py-2 text-[11px] font-semibold uppercase tracking-wider hover:bg-pink-800 transition cursor-pointer rounded-lg shadow-2xs"
          >
            {t.admin.metrics.updateNumber}
          </button>
        </div>
      </form>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        <div className="border border-[#E7E0D6] bg-white p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
              {t.admin.metrics.totalProducts}
            </span>
            <Package className="w-4 h-4 text-[#9A7B3E]" />
          </div>
          <div className="font-serif-display text-3xl font-semibold text-[#1C1917]">
            {products.length}
          </div>
          <div className="text-[11px] text-[#78716C] mt-1">
            {products.filter((p) => p.category === 'earrings').length} earrings,{' '}
            {products.filter((p) => p.category === 'rings').length} rings,{' '}
            {products.filter((p) => p.category === 'bracelets').length} bracelets
          </div>
        </div>

        <div className="border border-[#E7E0D6] bg-white p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
              {t.admin.metrics.totalInventory}
            </span>
            <Layers className="w-4 h-4 text-[#9A7B3E]" />
          </div>
          <div className="font-serif-display text-3xl font-semibold text-[#1C1917]">
            {totalStock} {t.admin.metrics.units}
          </div>
          <div className="text-[11px] text-[#78716C] mt-1">
            {soldOutCount} {t.admin.metrics.soldOut} · {lowStockCount} {t.admin.metrics.lowStock}
          </div>
        </div>

        <div className="border border-[#E7E0D6] bg-white p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
              {t.admin.metrics.pendingBkash}
            </span>
            <ShoppingBag className="w-4 h-4 text-pink-600" />
          </div>
          <div className="font-serif-display text-3xl font-semibold text-[#1C1917]">
            {
              orders.filter((o) => o.paymentMethod === 'bkash' && o.paymentStatus === 'pending')
                .length
            }
          </div>
          <div className="text-[11px] text-[#78716C] mt-1">
            {orders.length} {t.admin.metrics.totalCustomerOrders}
          </div>
        </div>

        <div className="border border-[#E7E0D6] bg-white p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
              {t.admin.metrics.dbConnection}
            </span>
            <CheckCircle
              className={`w-4 h-4 ${isSupabaseConnected ? 'text-emerald-600' : 'text-[#C5A059]'}`}
            />
          </div>
          <div className="font-serif-display text-xl font-semibold text-[#1C1917]">
            {isSupabaseConnected ? t.admin.metrics.cloudLive : t.admin.metrics.localReady}
          </div>
          <div className="text-[11px] text-[#78716C] mt-1">
            {isSupabaseConnected
              ? t.admin.metrics.connectedPg
              : t.admin.metrics.addKeysEnv}
          </div>
        </div>
      </div>
    </>
  );
}


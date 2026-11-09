'use client';

import React from 'react';
import { Product } from '@/core/models/product.model';
import { Order } from '@/core/models/order.model';
import { Package, Layers, ShoppingBag } from 'lucide-react';
import { useI18n } from '@/core/i18n/i18n.context';

interface AdminMetricsProps {
  products: Product[];
  orders: Order[];
  totalStock: number;
  soldOutCount: number;
  lowStockCount: number;
  isSupabaseConnected?: boolean;
  onOpenOrdersPage?: () => void;
}

export function AdminMetrics({
  products,
  orders,
  totalStock,
  soldOutCount,
  lowStockCount,
  onOpenOrdersPage,
}: AdminMetricsProps) {
  const { t } = useI18n();
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const pendingBkashCount = orders.filter(
    (o) => o.paymentMethod === 'bkash' && o.paymentStatus === 'pending'
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
      {/* Total Products */}
      <div className="border border-slate-200 bg-white px-4 py-3 rounded-2xl shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 block">
            {t.admin.metrics.totalProducts}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 leading-none">
              {products.length}
            </span>
            <span className="text-xs text-slate-500 truncate">
              {products.filter((p) => p.category === 'earrings').length}E ·{' '}
              {products.filter((p) => p.category === 'rings').length}R ·{' '}
              {products.filter((p) => p.category === 'bracelets').length}B
            </span>
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
          <Package className="w-4 h-4" />
        </div>
      </div>

      {/* Total Inventory */}
      <div className="border border-slate-200 bg-white px-4 py-3 rounded-2xl shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 block">
            {t.admin.metrics.totalInventory}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 leading-none">
              {totalStock} <span className="text-xs font-normal text-slate-500">{t.admin.metrics.units}</span>
            </span>
            <span className="text-xs text-slate-500 truncate">
              <span className="text-rose-600 font-semibold">{soldOutCount}</span> sold out ·{' '}
              <span className="text-amber-600 font-semibold">{lowStockCount}</span> low
            </span>
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
          <Layers className="w-4 h-4" />
        </div>
      </div>

      {/* Pending bKash Checks / Orders */}
      <button
        type="button"
        onClick={onOpenOrdersPage}
        className="border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/80 px-4 py-3 rounded-2xl shadow-xs flex items-center justify-between text-left transition cursor-pointer group"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 group-hover:text-slate-900 transition">
              {t.admin.metrics.pendingBkash}
            </span>
            {(pendingOrdersCount > 0 || pendingBkashCount > 0) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 text-white px-2 py-0.5 text-[10px] font-extrabold shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                {pendingOrdersCount || pendingBkashCount}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 leading-none">
              {pendingBkashCount}
            </span>
            <span className="text-xs text-slate-500 group-hover:text-slate-800 truncate">
              {orders.length} {t.admin.metrics.totalCustomerOrders} →
            </span>
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition">
          <ShoppingBag className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
}

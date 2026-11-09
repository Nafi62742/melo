'use client';

import React from 'react';
import { Product } from '@/core/models/product.model';
import { ProductType } from '@/core/models/product-type.model';
import { Order } from '@/core/models/order.model';
import { formatBDT } from '@/core/utils/currency.util';
import { useI18n } from '@/core/i18n/i18n.context';
import { TrendingUp } from 'lucide-react';

interface AdminAnalyticsTabProps {
  products: Product[];
  productTypes: ProductType[];
  shippingCostPerPiece: number;
  onChangeShippingCost: (cost: number) => void;
  analyticsTimeframe: 'all' | 'today' | 'week' | 'month';
  onChangeTimeframe: (tf: 'all' | 'today' | 'week' | 'month') => void;
  analyticsOrderScope: 'delivered' | 'active';
  onChangeOrderScope: (scope: 'delivered' | 'active') => void;
  totalStock: number;
  totalInventoryBaseCost: number;
  totalInventoryLandedCost: number;
  totalExpectedRevenue: number;
  totalExpectedNetProfit: number;
  expectedMarginPercent: number;
  analyticsFilteredOrders: Order[];
  realizedOrderStats: {
    unitsSold: number;
    itemRevenue: number;
    itemLandedCost: number;
    netProfit: number;
  };
  getUnitLandedCost: (p: Product) => number;
}

export function AdminAnalyticsTab({
  products,
  productTypes,
  shippingCostPerPiece,
  onChangeShippingCost,
  analyticsTimeframe,
  onChangeTimeframe,
  analyticsOrderScope,
  onChangeOrderScope,
  totalStock,
  totalInventoryBaseCost,
  totalInventoryLandedCost,
  totalExpectedRevenue,
  totalExpectedNetProfit,
  expectedMarginPercent,
  analyticsFilteredOrders,
  realizedOrderStats,
  getUnitLandedCost,
}: AdminAnalyticsTabProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      {/* Controls & Shipping Cost Configuration */}
      <div className="border border-slate-200 bg-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-700 block">
              {t.admin.analyticsTab.badge}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {t.admin.analyticsTab.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.admin.analyticsTab.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="text-xs font-semibold text-slate-700">
              {t.admin.analyticsTab.shippingPerPiece}
            </span>
            <input
              type="number"
              min={0}
              value={shippingCostPerPiece}
              onChange={(e) => onChangeShippingCost(Math.max(0, Number(e.target.value)))}
              className="w-16 border border-slate-300 bg-white px-2 py-1 text-center font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-900 rounded-lg shadow-2xs"
            />
          </div>

          <div className="flex border border-slate-200 bg-slate-100 p-1 rounded-xl gap-1">
            {(
              [
                { key: 'all', label: t.admin.analyticsTab.allTime },
                { key: 'today', label: t.admin.analyticsTab.today },
                { key: 'week', label: t.admin.analyticsTab.days7 },
                { key: 'month', label: t.admin.analyticsTab.days30 },
              ] as const
            ).map((tf) => (
              <button
                key={tf.key}
                type="button"
                onClick={() => onChangeTimeframe(tf.key)}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer rounded-lg transition ${
                  analyticsTimeframe === tf.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <select
            value={analyticsOrderScope}
            onChange={(e) => onChangeOrderScope(e.target.value as 'delivered' | 'active')}
            className="border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 cursor-pointer rounded-xl shadow-2xs"
          >
            <option value="delivered" className="bg-white text-slate-900">
              {t.admin.analyticsTab.deliveredOnly}
            </option>
            <option value="active" className="bg-white text-slate-900">
              {t.admin.analyticsTab.allNonCancelled}
            </option>
          </select>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Landed Cost */}
        <div className="border border-slate-200 bg-white p-5 rounded-2xl shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {t.admin.analyticsTab.kpiLandedCost}
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 mt-2">
            {formatBDT(totalInventoryLandedCost)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Base: {formatBDT(totalInventoryBaseCost)} + Ship:{' '}
            {formatBDT(totalStock * shippingCostPerPiece)} ({totalStock} pcs)
          </div>
        </div>

        {/* Card 2: Expected Revenue */}
        <div className="border border-slate-200 bg-white p-5 rounded-2xl shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {t.admin.analyticsTab.kpiExpectedRev}
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 mt-2">
            {formatBDT(totalExpectedRevenue)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            If all {totalStock} in-stock units sell at current price
          </div>
        </div>

        {/* Card 3: Expected Profit */}
        <div className="border border-emerald-200 bg-emerald-50/50 p-5 rounded-2xl shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800">
            {t.admin.analyticsTab.kpiExpectedProfit}
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-700 mt-2">
            +{formatBDT(totalExpectedNetProfit)}
          </div>
          <div className="text-xs font-bold text-emerald-800 mt-1">
            {expectedMarginPercent}% Avg Net Profit Margin
          </div>
        </div>

        {/* Card 4: Realized Profit */}
        <div className="border border-emerald-200 bg-emerald-50/50 p-5 rounded-2xl shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800">
            {analyticsOrderScope === 'delivered'
              ? t.admin.analyticsTab.kpiRealizedProfit
              : t.admin.analyticsTab.kpiActiveProfit}
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-700 mt-2">
            +{formatBDT(realizedOrderStats.netProfit)}
          </div>
          <div className="text-xs font-medium text-emerald-800 mt-1">
            Revenue: {formatBDT(realizedOrderStats.itemRevenue)} · Cost:{' '}
            {formatBDT(realizedOrderStats.itemLandedCost)} ({realizedOrderStats.unitsSold} pcs sold)
          </div>
        </div>
      </div>

      {/* Category Profit & Valuation Breakdown Table */}
      <div className="border border-slate-200 bg-white overflow-hidden rounded-2xl shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-900">
            {t.admin.analyticsTab.tableTitle}
          </h3>
          <span className="text-xs font-medium text-slate-500">
            {t.admin.analyticsTab.shippingIncluded} ৳{shippingCostPerPiece} / piece
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">{t.admin.analyticsTab.colType}</th>
                <th className="py-3.5 px-4">{t.admin.analyticsTab.colUnits}</th>
                <th className="py-3.5 px-4">{t.admin.analyticsTab.colLanded}</th>
                <th className="py-3.5 px-4">{t.admin.analyticsTab.colExpectedRev}</th>
                <th className="py-3.5 px-4">{t.admin.analyticsTab.colExpectedProfit}</th>
                <th className="py-3.5 px-4">{t.admin.analyticsTab.colMargin}</th>
                <th className="py-3.5 px-4">{t.admin.analyticsTab.colSold}</th>
                <th className="py-3.5 px-4 text-right">{t.admin.analyticsTab.colRealizedProfit}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {productTypes.map((pt) => {
                const catProducts = products.filter((p) => p.category === pt.slug);
                const catUnits = catProducts.reduce((s, p) => s + p.stock, 0);
                const catLandedCost = catProducts.reduce(
                  (s, p) => s + p.stock * getUnitLandedCost(p),
                  0
                );
                const catExpectedRev = catProducts.reduce((s, p) => s + p.stock * p.priceBDT, 0);
                const catExpectedProfit = catExpectedRev - catLandedCost;
                const catMargin =
                  catExpectedRev > 0
                    ? Math.round((catExpectedProfit / catExpectedRev) * 100)
                    : 0;

                let catSoldUnits = 0;
                let catRealizedProfit = 0;
                for (const ord of analyticsFilteredOrders) {
                  for (const item of ord.items) {
                    const matched =
                      products.find(
                        (p) => p.id === item.product.id || p.slug === item.product.slug
                      ) || item.product;
                    if (matched.category === pt.slug) {
                      const landed = Number(matched.costPriceCNY ?? 0) + shippingCostPerPiece;
                      catSoldUnits += item.quantity;
                      catRealizedProfit += (item.product.priceBDT - landed) * item.quantity;
                    }
                  }
                }

                return (
                  <tr key={pt.slug} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {pt.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-bold text-slate-900">{catProducts.length}</span>{' '}
                      designs · <span className="font-bold text-slate-900">{catUnits}</span>{' '}
                      units
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-base text-slate-800">
                      {formatBDT(catLandedCost)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-base text-slate-900">
                      {formatBDT(catExpectedRev)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-base text-emerald-700">
                      +{formatBDT(catExpectedProfit)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 rounded-md">
                        {catMargin}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{catSoldUnits} pcs</td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-base text-emerald-700">
                      +{formatBDT(catRealizedProfit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

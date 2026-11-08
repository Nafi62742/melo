'use client';

import React from 'react';
import { Product } from '@/core/models/product.model';
import { ProductType } from '@/core/models/product-type.model';
import { Order } from '@/core/models/order.model';
import { formatBDT } from '@/core/utils/currency.util';
import { useI18n } from '@/core/i18n/i18n.context';

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
    <div className="space-y-6">
      {/* Controls & Shipping Cost Configuration */}
      <div className="border border-[#C5A059] bg-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl shadow-xs">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A7B3E] block">
            {t.admin.analyticsTab.badge}
          </span>
          <h2 className="font-serif-display text-2xl font-medium text-[#1C1917]">
            {t.admin.analyticsTab.title}
          </h2>
          <p className="text-xs text-[#78716C] mt-0.5">
            {t.admin.analyticsTab.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 border border-[#E7E0D6] bg-[#FAF7F2] px-3 py-1.5 rounded-lg">
            <span className="text-[11px] font-semibold text-[#1C1917]">
              {t.admin.analyticsTab.shippingPerPiece}
            </span>
            <input
              type="number"
              min={0}
              value={shippingCostPerPiece}
              onChange={(e) => onChangeShippingCost(Math.max(0, Number(e.target.value)))}
              className="w-16 border border-[#D6CFC5] bg-white px-2 py-1 text-center font-mono font-semibold text-[#1C1917] focus:outline-none focus:border-[#C5A059] rounded-md"
            />
          </div>

          <div className="flex border border-[#E7E0D6] bg-white p-0.5 rounded-lg gap-0.5">
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
                className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider cursor-pointer rounded-md transition ${
                  analyticsTimeframe === tf.key
                    ? 'bg-[#1C1917] text-[#FAF7F2] shadow-2xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <select
            value={analyticsOrderScope}
            onChange={(e) => onChangeOrderScope(e.target.value as 'delivered' | 'active')}
            className="border border-[#D6CFC5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1C1917] focus:outline-none focus:border-[#C5A059] cursor-pointer rounded-lg shadow-2xs"
          >
            <option value="delivered">{t.admin.analyticsTab.deliveredOnly}</option>
            <option value="active">{t.admin.analyticsTab.allNonCancelled}</option>
          </select>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#E7E0D6] bg-white p-5 rounded-xl shadow-xs">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
            {t.admin.analyticsTab.kpiLandedCost}
          </div>
          <div className="font-serif-display text-3xl font-semibold text-[#1C1917] mt-2">
            {formatBDT(totalInventoryLandedCost)}
          </div>
          <div className="text-[11px] text-[#78716C] mt-1">
            Base: {formatBDT(totalInventoryBaseCost)} + Ship:{' '}
            {formatBDT(totalStock * shippingCostPerPiece)} ({totalStock} pcs)
          </div>
        </div>

        <div className="border border-[#E7E0D6] bg-white p-5 rounded-xl shadow-xs">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
            {t.admin.analyticsTab.kpiExpectedRev}
          </div>
          <div className="font-serif-display text-3xl font-semibold text-[#1C1917] mt-2">
            {formatBDT(totalExpectedRevenue)}
          </div>
          <div className="text-[11px] text-[#78716C] mt-1">
            If all {totalStock} in-stock units sell at current price
          </div>
        </div>

        <div className="border border-[#C5A059] bg-[#FAF7F2]/60 p-5 rounded-xl shadow-xs">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A7B3E]">
            {t.admin.analyticsTab.kpiExpectedProfit}
          </div>
          <div className="font-serif-display text-3xl font-semibold text-emerald-800 mt-2">
            +{formatBDT(totalExpectedNetProfit)}
          </div>
          <div className="text-[11px] font-medium text-[#1C1917] mt-1">
            {expectedMarginPercent}% Avg Net Profit Margin
          </div>
        </div>

        <div className="border border-emerald-300 bg-emerald-50/50 p-5 rounded-xl shadow-xs">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-900">
            {analyticsOrderScope === 'delivered'
              ? t.admin.analyticsTab.kpiRealizedProfit
              : t.admin.analyticsTab.kpiActiveProfit}
          </div>
          <div className="font-serif-display text-3xl font-semibold text-emerald-900 mt-2">
            +{formatBDT(realizedOrderStats.netProfit)}
          </div>
          <div className="text-[11px] text-emerald-800 mt-1">
            Revenue: {formatBDT(realizedOrderStats.itemRevenue)} · Cost:{' '}
            {formatBDT(realizedOrderStats.itemLandedCost)} ({realizedOrderStats.unitsSold} pcs sold)
          </div>
        </div>
      </div>

      {/* Category Profit & Valuation Breakdown Table */}
      <div className="border border-[#E7E0D6] bg-white overflow-hidden rounded-xl shadow-xs">
        <div className="px-6 py-4 border-b border-[#E7E0D6] flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1C1917]">
            {t.admin.analyticsTab.tableTitle}
          </h3>
          <span className="text-xs text-[#78716C]">
            {t.admin.analyticsTab.shippingIncluded} ৳{shippingCostPerPiece} / piece
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#78716C]">
            <thead className="bg-[#FAF7F2] border-b border-[#E7E0D6] text-[#1C1917] uppercase font-semibold text-[10px] tracking-[0.16em]">
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
            <tbody className="divide-y divide-[#F3EDE4]">
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
                  <tr key={pt.slug} className="hover:bg-[#FAF7F2]/60">
                    <td className="py-3.5 px-4 font-serif-display text-base font-medium text-[#1C1917]">
                      {pt.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#1C1917]">{catProducts.length}</span>{' '}
                      designs · <span className="font-semibold text-[#9A7B3E]">{catUnits}</span>{' '}
                      units
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#1C1917]">
                      {formatBDT(catLandedCost)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#1C1917]">
                      {formatBDT(catExpectedRev)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-800">
                      +{formatBDT(catExpectedProfit)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {catMargin}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#1C1917]">{catSoldUnits} pcs</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-800">
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


'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productService } from '@/core/services/product.service';
import { orderService } from '@/core/services/order.service';
import { Product } from '@/core/models/product.model';
import { Order, OrderStatus } from '@/core/models/order.model';
import { formatBDT } from '@/core/utils/currency.util';
import { Package, ShoppingBag, Layers, ArrowLeft, RefreshCw, CheckCircle, Clock } from 'lucide-react';

export function AdminFeature() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products] = useState<Product[]>(() => productService.getAllProducts());
  const [orders, setOrders] = useState<Order[]>(() => orderService.getOrders());

  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    orderService.updateOrderStatus(orderId, status);
    setOrders(orderService.getOrders());
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-14">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#E7E0D6] gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#78716C] hover:text-[#1C1917] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </Link>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-medium text-[#1C1917]">
            MELO Store Admin Dashboard
          </h1>
          <p className="text-xs text-[#78716C] mt-1">
            Manage your curated French ear clips, rings, bracelets inventory, and Bangladesh customer orders.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border border-[#E7E0D6] bg-white p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#1C1917] text-[#FAF7F2]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Catalogue ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#1C1917] text-[#FAF7F2]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        <div className="border border-[#E7E0D6] bg-white p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
              Total Products
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

        <div className="border border-[#E7E0D6] bg-white p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
              Total Inventory
            </span>
            <Layers className="w-4 h-4 text-[#9A7B3E]" />
          </div>
          <div className="font-serif-display text-3xl font-semibold text-[#1C1917]">
            {totalStock} Units
          </div>
          <div className="text-[11px] text-[#78716C] mt-1">Synced with Hippo CSV tracker</div>
        </div>

        <div className="border border-[#E7E0D6] bg-white p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
              Active Orders
            </span>
            <ShoppingBag className="w-4 h-4 text-[#9A7B3E]" />
          </div>
          <div className="font-serif-display text-3xl font-semibold text-[#1C1917]">
            {orders.length}
          </div>
          <div className="text-[11px] text-[#78716C] mt-1">Pending &amp; confirmed</div>
        </div>

        <div className="border border-[#E7E0D6] bg-white p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
              Store Status
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif-display text-xl font-semibold text-[#1C1917]">
            Boutique Live
          </div>
          <div className="text-[11px] text-[#78716C] mt-1">3-tier architecture verified</div>
        </div>
      </div>

      {/* Main Content: Products View */}
      {activeTab === 'products' && (
        <div className="border border-[#E7E0D6] bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E7E0D6] flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1C1917]">
              Product Catalogue &amp; Inventory
            </h2>
            <span className="text-xs text-[#78716C]">{products.length} Pieces Listed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#78716C]">
              <thead className="bg-[#FAF7F2] border-b border-[#E7E0D6] text-[#1C1917] uppercase font-semibold text-[10px] tracking-[0.16em]">
                <tr>
                  <th className="py-3.5 px-4">Piece</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Cost</th>
                  <th className="py-3.5 px-4">Selling Price (BDT)</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3EDE4]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF7F2]/60">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-9 flex-shrink-0 overflow-hidden bg-[#F3EDE4] border border-[#E7E0D6]">
                          <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <div className="font-serif-display text-base font-medium text-[#1C1917]">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-[#A8A29E]">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize font-medium text-[#1C1917]">
                      {p.category}
                    </td>
                    <td className="py-3 px-4 text-[#78716C]">
                      {p.costPriceCNY ? `¥${p.costPriceCNY}` : '—'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#1C1917]">
                      {formatBDT(p.priceBDT)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#1C1917]">
                      {p.stock} pcs
                    </td>
                    <td className="py-3 px-4">
                      {p.stock > 0 ? (
                        <span className="inline-flex items-center border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-800">
                          Out of Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Content: Orders View */}
      {activeTab === 'orders' && (
        <div className="border border-[#E7E0D6] bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E7E0D6] flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1C1917]">
              Customer Orders (Bangladesh)
            </h2>
            <button
              onClick={() => setOrders(orderService.getOrders())}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A7B3E] hover:text-[#1C1917] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="p-14 text-center text-[#78716C]">
              <Clock className="w-8 h-8 mx-auto text-[#C5A059] mb-2 stroke-[1.25]" />
              <div className="font-serif-display text-2xl text-[#1C1917]">No orders placed yet</div>
              <div className="text-xs text-[#78716C] mt-1">
                When customers check out on the storefront, their orders will appear here automatically.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#78716C]">
                <thead className="bg-[#FAF7F2] border-b border-[#E7E0D6] text-[#1C1917] uppercase font-semibold text-[10px] tracking-[0.16em]">
                  <tr>
                    <th className="py-3.5 px-4">Order Ref</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Phone &amp; Address</th>
                    <th className="py-3.5 px-4">Items</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EDE4]">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#FAF7F2]/60">
                      <td className="py-3 px-4 font-bold text-[#9A7B3E]">
                        {o.orderNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#1C1917]">
                        {o.customer.fullName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#1C1917]">{o.customer.phone}</div>
                        <div className="text-[11px] text-[#78716C] truncate max-w-xs">
                          {o.customer.address}
                        </div>
                      </td>
                      <td className="py-3 px-4">{o.items.length} pcs</td>
                      <td className="py-3 px-4 font-bold text-[#1C1917]">
                        {formatBDT(o.total)}
                      </td>
                      <td className="py-3 px-4 uppercase font-semibold text-[#1C1917]">
                        {o.paymentMethod}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                          className="border border-[#D6CFC5] bg-white px-2.5 py-1 text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#C5A059] cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-violet-600 mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Storefront</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            MELO Store Admin Dashboard
          </h1>
          <p className="text-xs text-neutral-500">
            Manage your initial earrings, rings, bracelets inventory, and Bangladesh customer orders.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-neutral-100 p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('products')}
            className={`rounded-lg px-4 py-2 transition ${
              activeTab === 'products'
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Products & Stock ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`rounded-lg px-4 py-2 transition ${
              activeTab === 'orders'
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Customer Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Products</span>
            <Package className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">{products.length}</div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {products.filter(p => p.category === 'earrings').length} earrings, {products.filter(p => p.category === 'rings').length} rings, {products.filter(p => p.category === 'bracelets').length} bracelets
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Inventory</span>
            <Layers className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">{totalStock} Units</div>
          <div className="text-[11px] text-neutral-400 mt-1">Tracked in CSV tracker</div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Active Orders</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">{orders.length}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Pending & confirmed</div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Database Status</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-sm font-bold text-neutral-800">Local + Supabase Ready</div>
          <div className="text-[11px] text-neutral-400 mt-1">Schema mapped in core/models</div>
        </div>
      </div>

      {/* Main Content: Products View */}
      {activeTab === 'products' && (
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Product Catalogue & Inventory
            </h2>
            <span className="text-xs text-neutral-500">{products.length} Items Listed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Selling Price (BDT)</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/60">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 border">
                          <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900">{p.name}</div>
                          <div className="text-[10px] text-neutral-400">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize font-medium text-neutral-700">
                      {p.category}
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {p.costPriceCNY ? `¥${p.costPriceCNY}` : '—'}
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-900">
                      {formatBDT(p.priceBDT)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-800">
                      {p.stock} pcs
                    </td>
                    <td className="py-3 px-4">
                      {p.stock > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
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
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Customer Orders (Bangladesh)
            </h2>
            <button
              onClick={() => setOrders(orderService.getOrders())}
              className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center text-neutral-500">
              <Clock className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
              <div className="text-sm font-semibold">No orders placed yet</div>
              <div className="text-xs text-neutral-400 mt-1">
                When customers check out on the website, their orders will appear here automatically.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-600">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Phone & Address</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-50/60">
                      <td className="py-3 px-4 font-bold text-violet-700">
                        {o.orderNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-900">
                        {o.customer.fullName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-800">{o.customer.phone}</div>
                        <div className="text-[11px] text-neutral-400 truncate max-w-xs">{o.customer.address}</div>
                      </td>
                      <td className="py-3 px-4">
                        {o.items.length} items
                      </td>
                      <td className="py-3 px-4 font-bold text-neutral-900">
                        {formatBDT(o.total)}
                      </td>
                      <td className="py-3 px-4 uppercase font-semibold text-neutral-700">
                        {o.paymentMethod}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                          className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-violet-600 cursor-pointer"
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

const fs = require('fs');
const path = require('path');

// -------------------------------------------------------------
// 1. REWRITE orders-tab.tsx
// -------------------------------------------------------------
const ordersTabPath = path.join(__dirname, '..', 'src/features/admin/tabs/orders-tab.tsx');

const ordersTabContent = `'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Order, OrderStatus, PaymentStatus } from '@/core/models/order.model';
import { CustomerProfile } from '@/core/models/customer.model';
import { formatBDT } from '@/core/utils/currency.util';
import { COURIER_OPTIONS, buildCourierTrackingUrl } from '@/core/utils/tracking.util';
import { useI18n } from '@/core/i18n/i18n.context';
import { AdminCustomersTab } from './customers-tab';
import {
  Plus,
  RefreshCw,
  Truck,
  Search,
  ExternalLink,
  Phone,
  Users,
  X,
  Smartphone,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
} from 'lucide-react';

interface AdminOrdersTabProps {
  orders: Order[];
  customers?: CustomerProfile[];
  bkashNumber?: string;
  onChangeBkashNumber?: (value: string) => void;
  onSaveBkashNumber?: (e: React.FormEvent) => void;
  onOpenManualOrderModal: () => void;
  onRefreshOrders: () => void;
  onPaymentStatusChange: (orderId: string, paymentStatus: PaymentStatus) => void;
  onOrderStatusChange: (orderId: string, status: OrderStatus) => void;
  onUpdateOrderTracking?: (
    orderId: string,
    tracking: {
      trackingNumber: string;
      courierName?: string;
      courierTrackingUrl?: string;
      estimatedDelivery?: string;
      status?: OrderStatus;
    }
  ) => void;
  onZoomImage?: (image: { src: string; title: string; subtitle?: string }) => void;
}

type OrderSubTab =
  | 'all'
  | 'pending'
  | 'bkash_pending'
  | 'confirmed'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export function AdminOrdersTab({
  orders,
  customers = [],
  bkashNumber = '',
  onChangeBkashNumber,
  onSaveBkashNumber,
  onOpenManualOrderModal,
  onRefreshOrders,
  onPaymentStatusChange,
  onOrderStatusChange,
  onUpdateOrderTracking,
  onZoomImage,
}: AdminOrdersTabProps) {
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<'orders' | 'customers'>('orders');
  const [activeOrderTab, setActiveOrderTab] = useState<OrderSubTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Tracking Modal / Popover State
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [courierKey, setCourierKey] = useState<string>('steadfast');
  const [customCourierName, setCustomCourierName] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [autoMarkDispatched, setAutoMarkDispatched] = useState(true);

  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === 'pending').length,
    [orders]
  );
  const bkashPendingCount = useMemo(
    () => orders.filter((o) => o.paymentMethod === 'bkash' && o.paymentStatus === 'pending').length,
    [orders]
  );
  const confirmedCount = useMemo(
    () => orders.filter((o) => o.status === 'confirmed').length,
    [orders]
  );
  const dispatchedCount = useMemo(
    () => orders.filter((o) => o.status === 'dispatched').length,
    [orders]
  );
  const deliveredCount = useMemo(
    () => orders.filter((o) => o.status === 'delivered').length,
    [orders]
  );
  const cancelledCount = useMemo(
    () => orders.filter((o) => o.status === 'cancelled').length,
    [orders]
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      let matchesTab = true;
      if (activeOrderTab === 'pending') {
        matchesTab = o.status === 'pending';
      } else if (activeOrderTab === 'bkash_pending') {
        matchesTab = o.paymentMethod === 'bkash' && o.paymentStatus === 'pending';
      } else if (activeOrderTab === 'confirmed') {
        matchesTab = o.status === 'confirmed';
      } else if (activeOrderTab === 'dispatched') {
        matchesTab = o.status === 'dispatched';
      } else if (activeOrderTab === 'delivered') {
        matchesTab = o.status === 'delivered';
      } else if (activeOrderTab === 'cancelled') {
        matchesTab = o.status === 'cancelled';
      }

      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesTab;

      const matchesQuery =
        o.orderNumber.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.trxId && o.trxId.toLowerCase().includes(q)) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q));

      return matchesTab && matchesQuery;
    });
  }, [orders, activeOrderTab, searchQuery]);

  // Derived customer directory for count
  const customerCount = useMemo(() => {
    const phones = new Set<string>();
    for (const c of customers) {
      const p = c.phone.trim().replace(/\\s+/g, '');
      if (p) phones.add(p);
    }
    for (const o of orders) {
      const p = o.customer.phone.trim().replace(/\\s+/g, '');
      if (p) phones.add(p);
    }
    return phones.size;
  }, [orders, customers]);

  const openTrackingModal = (o: Order) => {
    setTrackingModalOrder(o);
    const existingCourier = COURIER_OPTIONS.find(
      (c) => c.name.toLowerCase() === (o.courierName || '').toLowerCase()
    );
    if (existingCourier) {
      setCourierKey(existingCourier.key);
      setCustomCourierName('');
    } else if (o.courierName) {
      setCourierKey('other');
      setCustomCourierName(o.courierName || '');
    } else {
      setCourierKey('steadfast');
      setCustomCourierName('');
    }
    setTrackingCode(o.trackingNumber || '');
    setEstimatedDelivery(
      o.estimatedDelivery ||
        (o.customer.deliveryZone === 'inside_dhaka' ? '24–48 hours' : '3–4 days')
    );
    setAutoMarkDispatched(o.status !== 'delivered');
  };

  const handleSaveTracking = () => {
    if (!trackingModalOrder || !trackingCode.trim()) return;

    const selectedCourierObj = COURIER_OPTIONS.find((c) => c.key === courierKey);
    const courierName =
      courierKey === 'other'
        ? customCourierName.trim() || 'Courier'
        : selectedCourierObj?.name || 'Courier';

    const courierTrackingUrl = buildCourierTrackingUrl(courierName, trackingCode.trim());

    if (onUpdateOrderTracking) {
      onUpdateOrderTracking(trackingModalOrder.id, {
        trackingNumber: trackingCode.trim(),
        courierName,
        courierTrackingUrl: courierTrackingUrl || undefined,
        estimatedDelivery: estimatedDelivery.trim() || undefined,
        status: autoMarkDispatched ? 'dispatched' : undefined,
      });
    }

    setTrackingModalOrder(null);
  };

  const orderTabs: Array<{
    key: OrderSubTab;
    label: string;
    count: number;
    showRedDot?: boolean;
  }> = [
    {
      key: 'all',
      label: 'All Orders',
      count: orders.length,
      showRedDot: false,
    },
    {
      key: 'pending',
      label: 'Pending',
      count: pendingCount,
      showRedDot: pendingCount > 0,
    },
    {
      key: 'bkash_pending',
      label: 'bKash Check',
      count: bkashPendingCount,
      showRedDot: bkashPendingCount > 0,
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      count: confirmedCount,
      showRedDot: false,
    },
    {
      key: 'dispatched',
      label: 'Dispatched',
      count: dispatchedCount,
      showRedDot: false,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      count: deliveredCount,
      showRedDot: false,
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      count: cancelledCount,
      showRedDot: false,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Action Bar & Mode Switcher */}
      <div className="border border-slate-200 bg-white rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-900">
              Customer &amp; Orders Hub
            </h2>

            {/* Separate View Tabs: Orders vs Customer Directory */}
            <div className="inline-flex bg-slate-100 border border-slate-200 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setViewMode('orders')}
                className={\`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg transition-all \${
                  viewMode === 'orders'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white hover:text-slate-900'
                }\`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Orders</span>
                <span
                  className={\`rounded-full px-2 py-0.5 text-[10px] font-extrabold \${
                    viewMode === 'orders'
                      ? 'bg-slate-800 text-white'
                      : orders.length > 0
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }\`}
                >
                  {orders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('customers')}
                className={\`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg transition-all \${
                  viewMode === 'customers'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white hover:text-slate-900'
                }\`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Customers</span>
                <span
                  className={\`rounded-full px-2 py-0.5 text-[10px] font-extrabold \${
                    viewMode === 'customers'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }\`}
                >
                  {customerCount}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Inline bKash Collection Number Editor */}
            {onSaveBkashNumber && onChangeBkashNumber && (
              <form
                onSubmit={onSaveBkashNumber}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs"
              >
                <Smartphone className="w-4 h-4 text-pink-600 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-pink-700 hidden sm:inline">
                  bKash:
                </span>
                <input
                  type="text"
                  value={bkashNumber}
                  onChange={(e) => onChangeBkashNumber(e.target.value)}
                  placeholder="01700-000000"
                  className="border border-slate-300 bg-white px-2.5 py-1 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-pink-500 w-32 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-pink-600 hover:bg-pink-700 text-white transition cursor-pointer rounded-lg shadow-xs"
                >
                  Save
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={onOpenManualOrderModal}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Manual Order</span>
            </button>

            <button
              type="button"
              onClick={onRefreshOrders}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer rounded-xl px-3 py-2 transition border border-slate-200 bg-white shadow-2xs"
              title="Refresh live orders"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* VIEW MODE 1: ORDERS TABS */}
        {viewMode === 'orders' && (
          <>
            {/* Status Filter Tabs Bar & Search */}
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {orderTabs.map((tab) => {
                  const isActive = activeOrderTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveOrderTab(tab.key)}
                      className={\`relative inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer rounded-xl \${
                        isActive
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }\`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={\`rounded-full px-2 py-0.5 text-[10px] font-extrabold \${
                          isActive
                            ? 'bg-slate-800 text-white'
                            : tab.showRedDot
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }\`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 border border-slate-300 bg-white px-3 py-1.5 rounded-xl shadow-2xs w-full xl:w-72 focus-within:border-slate-900">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search order #, phone, name, trx..."
                  className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Orders Fulfillment Table */}
            {filteredOrders.length === 0 ? (
              <div className="py-14 text-center text-slate-500">
                <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-800">No orders found</div>
                <div className="text-xs text-slate-500 mt-1">
                  Try clearing your search query or switching your status filter.
                </div>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table
                  className="w-full text-left text-xs text-slate-800"
                  style={{ tableLayout: 'fixed', minWidth: '950px' }}
                >
                  <colgroup>
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '22%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '9%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '12%' }} />
                  </colgroup>
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-3.5">Order Ref &amp; Date</th>
                      <th className="py-3 px-3.5">Customer Details</th>
                      <th className="py-3 px-3.5">Items</th>
                      <th className="py-3 px-3.5">Total</th>
                      <th className="py-3 px-3.5">Payment &amp; TrxID</th>
                      <th className="py-3 px-3.5">Courier &amp; Tracking</th>
                      <th className="py-3 px-3.5">Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredOrders.map((o) => {
                      const source = o.customer.orderSource || 'website';
                      const bkashNumberVal =
                        o.bkashSenderNumber || o.customer.phone || o.customerPhone;
                      return (
                        <tr
                          key={o.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* 1. Order Ref & Date */}
                          <td style={{ verticalAlign: 'top' }} className="py-3.5 px-3.5">
                            <div className="flex flex-col items-start gap-1.5">
                              <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md break-all">
                                {o.orderNumber}
                              </span>
                              <span
                                className={\`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border \${
                                  source === 'whatsapp'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : source === 'messenger'
                                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }\`}
                              >
                                {source === 'whatsapp'
                                  ? 'WhatsApp'
                                  : source === 'messenger'
                                  ? 'Messenger'
                                  : 'Website'}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">
                                {new Date(o.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </td>

                          {/* 2. Customer Details */}
                          <td style={{ verticalAlign: 'top' }} className="py-3.5 px-3.5">
                            <div className="space-y-1">
                              <div className="text-sm font-bold text-slate-900 break-words">
                                {o.customer.fullName || 'Guest Customer'}
                              </div>

                              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                <Phone className="w-3 h-3 shrink-0" />
                                <span>{o.customer.phone || o.customerPhone}</span>
                              </div>

                              <p className="text-xs text-slate-600 break-words leading-relaxed whitespace-pre-line mt-1 max-w-xs">
                                {o.customer.address}
                              </p>

                              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] uppercase font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                                  {o.customer.deliveryZone === 'inside_dhaka'
                                    ? 'Inside Dhaka'
                                    : 'Outside Dhaka'}
                                </span>
                              </div>

                              {o.customer.notes && (
                                <div className="mt-1.5 text-xs text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg italic break-words">
                                  Note: {o.customer.notes}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 3. Items Column */}
                          <td style={{ verticalAlign: 'top' }} className="py-3.5 px-3.5">
                            <div className="space-y-2">
                              {o.items.map((it, idx) => (
                                <div
                                  key={\`\${o.id}-item-\${idx}\`}
                                  className="flex items-center gap-2 border border-slate-100 bg-slate-50/60 p-1.5 rounded-xl"
                                >
                                  {it.product.imageUrl && (
                                    <div
                                      onClick={() =>
                                        onZoomImage &&
                                        onZoomImage({
                                          src: it.product.imageUrl!,
                                          title: it.product.name,
                                          subtitle: \`Qty: \${it.quantity} • ৳\${it.product.priceBDT}\`,
                                        })
                                      }
                                      className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white cursor-zoom-in"
                                    >
                                      <Image
                                        src={it.product.imageUrl}
                                        alt={it.product.name}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-semibold text-slate-900 truncate">
                                      <span className="text-slate-900 font-bold mr-1">
                                        {it.quantity}×
                                      </span>
                                      {it.product.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono font-medium">
                                      ৳{it.product.priceBDT} / pc
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* 4. Total & Delivery Fee */}
                          <td style={{ verticalAlign: 'top' }} className="py-3.5 px-3.5">
                            <div className="font-mono font-bold text-sm text-slate-900">
                              {formatBDT(o.total)}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                              Fee: {formatBDT(o.deliveryFee)}
                            </div>
                          </td>

                          {/* 5. Payment & TrxID */}
                          <td style={{ verticalAlign: 'top' }} className="py-3.5 px-3.5">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={\`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border \${
                                    o.paymentMethod === 'bkash'
                                      ? 'bg-pink-50 text-pink-700 border-pink-200'
                                      : o.paymentMethod === 'cod'
                                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  }\`}
                                >
                                  {o.paymentMethod.toUpperCase()}
                                </span>
                              </div>

                              {/* Payment status dropdown */}
                              <select
                                value={o.paymentStatus}
                                onChange={(e) =>
                                  onPaymentStatusChange(
                                    o.id,
                                    e.target.value as PaymentStatus
                                  )
                                }
                                className={\`w-full text-xs font-bold rounded-lg border px-2 py-1 transition cursor-pointer \${
                                  o.paymentStatus === 'verified'
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                    : o.paymentStatus === 'failed'
                                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                                    : 'bg-amber-50 border-amber-300 text-amber-900'
                                }\`}
                              >
                                <option value="pending" className="bg-white text-amber-900">
                                  Check TrxID (Pending)
                                </option>
                                <option value="verified" className="bg-white text-emerald-900">
                                  Verified ✓
                                </option>
                                <option value="failed" className="bg-white text-rose-900">
                                  Failed / Unpaid ✗
                                </option>
                              </select>

                              {bkashNumberVal && (
                                <div className="text-[10px] text-slate-600 font-mono font-medium">
                                  📞 {bkashNumberVal}
                                </div>
                              )}

                              {o.trxId && (
                                <div className="text-[11px] font-mono font-bold text-pink-900 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-md break-all select-all">
                                  Trx: {o.trxId}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 6. Courier & Tracking */}
                          <td style={{ verticalAlign: 'top' }} className="py-3.5 px-3.5">
                            {o.trackingNumber ? (
                              <div className="space-y-1.5">
                                <div className="text-xs font-bold text-slate-900">
                                  {o.courierName || 'Courier'}
                                </div>
                                <div className="font-mono text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded break-all">
                                  {o.trackingNumber}
                                </div>
                                {o.courierTrackingUrl && (
                                  <a
                                    href={o.courierTrackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Live Track</span>
                                  </a>
                                )}
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => openTrackingModal(o)}
                                    className="text-[10px] text-slate-500 hover:text-slate-900 underline cursor-pointer"
                                  >
                                    Edit Tracking
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openTrackingModal(o)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 transition cursor-pointer shadow-2xs"
                              >
                                <Truck className="w-3 h-3" />
                                <span>+ Add Courier</span>
                              </button>
                            )}
                          </td>

                          {/* 7. Fulfillment Status */}
                          <td style={{ verticalAlign: 'top' }} className="py-3.5 px-3.5">
                            <select
                              value={o.status}
                              onChange={(e) =>
                                onOrderStatusChange(o.id, e.target.value as OrderStatus)
                              }
                              className={\`w-full text-xs font-bold rounded-lg border px-2.5 py-1.5 transition cursor-pointer \${
                                o.status === 'delivered'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                  : o.status === 'dispatched'
                                  ? 'bg-sky-50 border-sky-300 text-sky-900'
                                  : o.status === 'confirmed'
                                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                                  : o.status === 'cancelled'
                                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                                  : 'bg-amber-50 border-amber-300 text-amber-900'
                              }\`}
                            >
                              <option value="pending" className="bg-white text-amber-900">
                                Pending
                              </option>
                              <option value="confirmed" className="bg-white text-indigo-900">
                                Confirmed
                              </option>
                              <option value="dispatched" className="bg-white text-sky-900">
                                Dispatched
                              </option>
                              <option value="delivered" className="bg-white text-emerald-900">
                                Delivered
                              </option>
                              <option value="cancelled" className="bg-white text-rose-900">
                                Cancelled
                              </option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* VIEW MODE 2: CUSTOMERS DIRECTORY */}
        {viewMode === 'customers' && (
          <div className="p-4">
            <AdminCustomersTab
              orders={orders}
              customers={customers}
              onZoomImage={onZoomImage}
            />
          </div>
        )}
      </div>

      {/* Courier Consignment Tracking Modal */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Assign Courier &amp; Tracking
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTrackingModalOrder(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Order Ref
                </label>
                <div className="font-mono font-bold text-sm text-slate-900">
                  {trackingModalOrder.orderNumber}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {trackingModalOrder.customer.fullName} · {trackingModalOrder.customer.phone}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Courier
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COURIER_OPTIONS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setCourierKey(c.key)}
                      className={\`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition cursor-pointer \${
                        courierKey === c.key
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }\`}
                    >
                      {c.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCourierKey('other')}
                    className={\`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition cursor-pointer \${
                      courierKey === 'other'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }\`}
                  >
                    Other
                  </button>
                </div>
              </div>

              {courierKey === 'other' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Courier Name
                  </label>
                  <input
                    type="text"
                    value={customCourierName}
                    onChange={(e) => setCustomCourierName(e.target.value)}
                    placeholder="e.g. Paperfly, Sundarban, SA Paribahan"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tracking Code / Consignment ID *
                </label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="e.g. 177626922 or CID-8921"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Estimated Delivery Window
                </label>
                <input
                  type="text"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  placeholder="e.g. 24–48 hours, Tomorrow by 6 PM"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoMarkDispatched}
                  onChange={(e) => setAutoMarkDispatched(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                />
                <span className="text-xs text-slate-700">
                  Automatically set order status to &quot;Dispatched&quot;
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTracking}
                  disabled={!trackingCode.trim()}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-black disabled:opacity-50 text-white rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save &amp; Track
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(ordersTabPath, ordersTabContent, 'utf8');
console.log('Successfully wrote Light Mode orders-tab.tsx');

// -------------------------------------------------------------
// 2. REWRITE customers-tab.tsx
// -------------------------------------------------------------
const customersTabPath = path.join(__dirname, '..', 'src/features/admin/tabs/customers-tab.tsx');

const customersTabContent = `'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Order } from '@/core/models/order.model';
import { CustomerProfile } from '@/core/models/customer.model';
import { formatBDT } from '@/core/utils/currency.util';
import { useI18n } from '@/core/i18n/i18n.context';
import {
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
  CreditCard,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface AdminCustomersTabProps {
  orders: Order[];
  customers?: CustomerProfile[];
  onZoomImage?: (image: { src: string; title: string; subtitle?: string }) => void;
}

interface EnrichedCustomer {
  phone: string;
  fullName: string;
  email?: string;
  address: string;
  deliveryZone: string;
  totalOrders: number;
  totalSpent: number;
  latestOrderDate: string;
  createdAt?: string;
  savedTrxIds: string[];
  isRegistered: boolean;
  customerOrders: Order[];
}

export function AdminCustomersTab({
  orders,
  customers = [],
  onZoomImage,
}: AdminCustomersTabProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPhone, setExpandedPhone] = useState<string | null>(null);

  const customerDirectory = useMemo(() => {
    const map = new Map<string, EnrichedCustomer>();

    // 1. Seed from registered customer accounts first
    for (const c of customers) {
      const phone = c.phone.trim().replace(/\\s+/g, '');
      if (!phone) continue;
      map.set(phone, {
        phone,
        fullName: c.fullName,
        email: c.email,
        address: c.defaultAddress,
        deliveryZone: c.deliveryZone,
        totalOrders: 0,
        totalSpent: 0,
        latestOrderDate: c.createdAt,
        createdAt: c.createdAt,
        savedTrxIds: c.savedTrxIds ? [...c.savedTrxIds] : [],
        isRegistered: true,
        customerOrders: [],
      });
    }

    // 2. Tally and attach all orders for each customer
    for (const o of orders) {
      const phone = (o.customer.phone || o.customerPhone || '').trim().replace(/\\s+/g, '');
      if (!phone) continue;

      let entry = map.get(phone);
      if (!entry) {
        entry = {
          phone,
          fullName: o.customer.fullName || 'Guest Customer',
          email: o.customer.email,
          address: o.customer.address,
          deliveryZone: o.customer.deliveryZone,
          totalOrders: 0,
          totalSpent: 0,
          latestOrderDate: o.createdAt,
          savedTrxIds: [],
          isRegistered: false,
          customerOrders: [],
        };
        map.set(phone, entry);
      }

      if (!entry.fullName || entry.fullName === 'Guest Customer') {
        if (o.customer.fullName) entry.fullName = o.customer.fullName;
      }
      if (!entry.address && o.customer.address) {
        entry.address = o.customer.address;
      }
      if (!entry.email && o.customer.email) {
        entry.email = o.customer.email;
      }

      entry.totalOrders += 1;
      entry.totalSpent += o.total;
      entry.customerOrders.push(o);

      if (o.trxId && !entry.savedTrxIds.includes(o.trxId)) {
        entry.savedTrxIds.push(o.trxId);
      }

      if (!entry.latestOrderDate || new Date(o.createdAt) > new Date(entry.latestOrderDate)) {
        entry.latestOrderDate = o.createdAt;
      }
    }

    // Sort customers by most recent order date descending
    const list = Array.from(map.values());
    list.sort((a, b) => {
      const dateA = a.latestOrderDate ? new Date(a.latestOrderDate).getTime() : 0;
      const dateB = b.latestOrderDate ? new Date(b.latestOrderDate).getTime() : 0;
      return dateB - dateA;
    });

    return list;
  }, [orders, customers]);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customerDirectory;

    return customerDirectory.filter((c) => {
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.address.toLowerCase().includes(q) ||
        c.savedTrxIds.some((trx) => trx.toLowerCase().includes(q))
      );
    });
  }, [customerDirectory, searchQuery]);

  const toggleExpand = (phone: string) => {
    setExpandedPhone((prev) => (prev === phone ? null : phone));
  };

  return (
    <div className="border border-slate-200 bg-white rounded-2xl shadow-xs overflow-hidden">
      {/* Header with Search */}
      <div className="p-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-900">
              Customer Directory ({filteredCustomers.length})
            </h2>
            <p className="text-xs text-slate-500">
              Customer profiles, delivery addresses, bKash TrxIDs, and full order histories.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 border border-slate-300 bg-white px-3 py-1.5 rounded-xl shadow-2xs w-full sm:w-72 focus-within:border-slate-900">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            maxLength={60}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, email..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="py-14 text-center text-slate-500">
          <Users className="w-8 h-8 mx-auto text-slate-400 mb-2 stroke-[1.5]" />
          <div className="text-sm font-bold text-slate-800">No customers found</div>
          <div className="text-xs text-slate-500 mt-1">
            Try searching by another phone number or name.
          </div>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table
            className="w-full text-left text-xs text-slate-800"
            style={{ tableLayout: 'fixed', minWidth: '950px' }}
          >
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '24%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '14%' }} />
            </colgroup>
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3.5">Customer Name</th>
                <th className="py-3 px-3.5">Phone</th>
                <th className="py-3 px-3.5">Address</th>
                <th className="py-3 px-3.5">Zone</th>
                <th className="py-3 px-3.5">Total Orders</th>
                <th className="py-3 px-3.5">Lifetime Spend</th>
                <th className="py-3 px-3.5 text-right">Actions &amp; Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredCustomers.map((c) => {
                const isExpanded = expandedPhone === c.phone;
                return (
                  <React.Fragment key={c.phone}>
                    <tr
                      className={\`transition \${
                        isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/70'
                      }\`}
                    >
                      <td
                        className="py-3.5 px-3.5 font-bold text-slate-900"
                        style={{
                          verticalAlign: 'top',
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="whitespace-normal break-words text-slate-900 font-bold">
                              {c.fullName || 'Guest Customer'}
                            </div>
                            {c.email && (
                              <div className="text-[10px] font-normal text-slate-500 whitespace-normal break-all">
                                {c.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td
                        style={{ verticalAlign: 'top' }}
                        className="py-3.5 px-3.5 font-mono font-bold text-emerald-800 whitespace-normal break-all"
                      >
                        {c.phone}
                      </td>

                      <td
                        className="py-3.5 px-3.5 text-slate-600 whitespace-normal break-words leading-relaxed"
                        style={{
                          verticalAlign: 'top',
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {c.address || '—'}
                      </td>

                      <td style={{ verticalAlign: 'top' }} className="py-3.5 px-3.5">
                        <span className="inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {c.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
                        </span>
                      </td>

                      <td style={{ verticalAlign: 'top' }} className="py-3.5 px-3.5">
                        <span className="inline-block rounded-full px-2.5 py-0.5 font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                          {c.totalOrders} order{c.totalOrders === 1 ? '' : 's'}
                        </span>
                      </td>

                      <td
                        style={{ verticalAlign: 'top' }}
                        className="py-3.5 px-3.5 font-mono font-bold text-slate-900 text-sm"
                      >
                        {formatBDT(c.totalSpent)}
                      </td>

                      <td style={{ verticalAlign: 'top' }} className="py-3.5 px-3.5 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleExpand(c.phone)}
                            className={\`inline-flex items-center gap-1 border px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer shadow-2xs \${
                              isExpanded
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                            }\`}
                          >
                            <span>{isExpanded ? 'Hide' : 'Details'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>

                          <a
                            href={\`https://wa.me/88\${c.phone
                              .replace(/^\\+?88/, '')
                              .replace(/\\D/g, '')}\`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-2.5 py-1.5 text-xs font-bold rounded-lg transition"
                            title="Chat on WhatsApp"
                          >
                            <span>WA</span>
                          </a>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED CUSTOMER DETAILS DRAWER ROW */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90">
                        <td colSpan={7} className="p-4 sm:p-5 border-t border-b border-slate-200">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Left Card: Customer Profile & Contact */}
                            <div className="border border-slate-200 bg-white p-4 rounded-xl shadow-xs space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-800">
                                    <User className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-900 whitespace-normal break-words">
                                      {c.fullName || 'Guest Customer'}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium">
                                      {c.isRegistered ? 'Registered Account' : 'Guest Checkout Profile'}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <a
                                    href={\`https://wa.me/88\${c.phone
                                      .replace(/^\\+?88/, '')
                                      .replace(/\\D/g, '')}\`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 rounded-lg"
                                  >
                                    WhatsApp
                                  </a>
                                  <a
                                    href={\`tel:\${c.phone}\`}
                                    className="border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
                                  >
                                    Call
                                  </a>
                                </div>
                              </div>

                              <div className="space-y-2 text-xs">
                                <div className="flex items-start gap-2">
                                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                      Phone Number
                                    </span>
                                    <span className="font-mono font-bold text-emerald-800 break-all">
                                      {c.phone}
                                    </span>
                                  </div>
                                </div>

                                {c.email && (
                                  <div className="flex items-start gap-2">
                                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                        Email Address
                                      </span>
                                      <span className="font-semibold text-slate-800 break-all">
                                        {c.email}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-start gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                  <div style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                      Delivery Address ({c.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                                    </span>
                                    <span className="font-medium text-slate-700 whitespace-normal leading-relaxed">
                                      {c.address || '—'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-start gap-2">
                                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                      Last Active / Latest Order
                                    </span>
                                    <span className="font-medium text-slate-700">
                                      {c.latestOrderDate
                                        ? new Date(c.latestOrderDate).toLocaleString([], {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })
                                        : '—'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Summary Metrics inside Customer Card */}
                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                    Total Orders
                                  </div>
                                  <div className="font-mono text-lg font-bold text-slate-900">
                                    {c.totalOrders}
                                  </div>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                    Lifetime Spend
                                  </div>
                                  <div className="font-mono text-lg font-bold text-slate-900">
                                    {formatBDT(c.totalSpent)}
                                  </div>
                                </div>
                              </div>

                              {c.savedTrxIds.length > 0 && (
                                <div className="pt-2 border-t border-slate-200">
                                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-pink-700 mb-1">
                                    <CreditCard className="w-3 h-3" />
                                    <span>Submitted bKash TrxIDs ({c.savedTrxIds.length})</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {c.savedTrxIds.map((trx, idx) => (
                                      <span
                                        key={\`\${c.phone}-trx-\${idx}\`}
                                        className="font-mono text-[11px] font-bold text-pink-800 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded select-all"
                                      >
                                        {trx}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Right 2 Columns: Complete Customer Order History */}
                            <div className="lg:col-span-2 border border-slate-200 bg-white p-4 rounded-xl shadow-xs">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
                                <div className="flex items-center gap-2">
                                  <ShoppingBag className="w-4 h-4 text-slate-700" />
                                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                    Customer Order History ({c.customerOrders.length})
                                  </h3>
                                </div>
                              </div>

                              {c.customerOrders.length === 0 ? (
                                <div className="text-center py-6 text-xs text-slate-500">
                                  No previous orders recorded for this profile.
                                </div>
                              ) : (
                                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                                  {c.customerOrders.map((co) => (
                                    <div
                                      key={co.id}
                                      className="border border-slate-200 bg-slate-50/60 rounded-xl p-3 text-xs space-y-2"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono font-bold text-slate-900">
                                            {co.orderNumber}
                                          </span>
                                          <span className="text-[10px] text-slate-500 font-medium">
                                            {new Date(co.createdAt).toLocaleDateString([], {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                            })}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <span
                                            className={\`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border \${
                                              co.status === 'delivered'
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                : co.status === 'dispatched'
                                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                                : co.status === 'confirmed'
                                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                                : co.status === 'cancelled'
                                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                                : 'bg-amber-50 text-amber-900 border-amber-200'
                                            }\`}
                                          >
                                            {co.status}
                                          </span>

                                          <span className="font-mono font-bold text-slate-900 text-sm">
                                            {formatBDT(co.total)}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Order Items list inside drawer */}
                                      <div className="space-y-1.5">
                                        {co.items.map((it, itemIdx) => (
                                          <div
                                            key={\`\${co.id}-draw-item-\${itemIdx}\`}
                                            className="flex items-center justify-between gap-2 text-xs"
                                          >
                                            <div className="flex items-center gap-2 min-w-0">
                                              {it.product.imageUrl && (
                                                <div
                                                  onClick={() =>
                                                    onZoomImage &&
                                                    onZoomImage({
                                                      src: it.product.imageUrl!,
                                                      title: it.product.name,
                                                      subtitle: \`Qty: \${it.quantity} • ৳\${it.product.priceBDT}\`,
                                                    })
                                                  }
                                                  className="relative h-7 w-7 rounded overflow-hidden border border-slate-200 bg-white shrink-0 cursor-zoom-in"
                                                >
                                                  <Image
                                                    src={it.product.imageUrl}
                                                    alt={it.product.name}
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                  />
                                                </div>
                                              )}
                                              <span className="text-slate-900 font-semibold truncate">
                                                <span className="text-slate-900 font-bold mr-1">
                                                  {it.quantity}×
                                                </span>
                                                {it.product.name}
                                              </span>
                                            </div>
                                            <span className="font-mono font-bold text-slate-700 shrink-0">
                                              {formatBDT(it.product.priceBDT * it.quantity)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(customersTabPath, customersTabContent, 'utf8');
console.log('Successfully wrote Light Mode customers-tab.tsx');


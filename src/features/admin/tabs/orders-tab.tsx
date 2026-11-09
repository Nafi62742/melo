'use client';

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
      const p = c.phone.trim().replace(/\s+/g, '');
      if (p) phones.add(p);
    }
    for (const o of orders) {
      const p = o.customer.phone.trim().replace(/\s+/g, '');
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
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg transition-all ${
                  viewMode === 'orders'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Orders</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    viewMode === 'orders'
                      ? 'bg-slate-800 text-white'
                      : orders.length > 0
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {orders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('customers')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-lg transition-all ${
                  viewMode === 'customers'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Customers</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    viewMode === 'customers'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
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
                      className={`relative inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer rounded-xl ${
                        isActive
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          isActive
                            ? 'bg-slate-800 text-white'
                            : tab.showRedDot
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
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
                                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                                  source === 'whatsapp'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : source === 'messenger'
                                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
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
                                  key={`${o.id}-item-${idx}`}
                                  className="flex items-center gap-2 border border-slate-100 bg-slate-50/60 p-1.5 rounded-xl"
                                >
                                  {it.product.imageUrl && (
                                    <div
                                      onClick={() =>
                                        onZoomImage &&
                                        onZoomImage({
                                          src: it.product.imageUrl!,
                                          title: it.product.name,
                                          subtitle: `Qty: ${it.quantity} • ৳${it.product.priceBDT}`,
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
                                    <div className="text-xs text-slate-700 font-mono font-semibold">
                                      ৳{it.product.priceBDT} / pc
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* 4. Total & Delivery Fee */}
                          <td style={{ verticalAlign: 'top' }} className="py-3.5 px-3.5">
                            <div className="font-mono font-extrabold text-base text-slate-900">
                              {formatBDT(o.total)}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium font-mono mt-0.5">
                              Fee: {formatBDT(o.deliveryFee)}
                            </div>
                          </td>

                          {/* 5. Payment & TrxID */}
                          <td style={{ verticalAlign: 'top' }} className="py-3.5 px-3.5">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                    o.paymentMethod === 'bkash'
                                      ? 'bg-pink-50 text-pink-700 border-pink-200'
                                      : o.paymentMethod === 'cod'
                                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  }`}
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
                                className={`w-full text-xs font-bold rounded-lg border px-2 py-1 transition cursor-pointer ${
                                  o.paymentStatus === 'verified'
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                    : o.paymentStatus === 'failed'
                                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                                    : 'bg-amber-50 border-amber-300 text-amber-900'
                                }`}
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
                              className={`w-full text-xs font-bold rounded-lg border px-2.5 py-1.5 transition cursor-pointer ${
                                o.status === 'delivered'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                  : o.status === 'dispatched'
                                  ? 'bg-sky-50 border-sky-300 text-sky-900'
                                  : o.status === 'confirmed'
                                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                                  : o.status === 'cancelled'
                                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                                  : 'bg-amber-50 border-amber-300 text-amber-900'
                              }`}
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
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition cursor-pointer ${
                        courierKey === c.key
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCourierKey('other')}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition cursor-pointer ${
                      courierKey === 'other'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
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

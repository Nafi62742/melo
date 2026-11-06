'use client';

import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, PaymentStatus } from '@/core/models/order.model';
import { CustomerProfile } from '@/core/models/customer.model';
import { formatBDT } from '@/core/utils/currency.util';
import { COURIER_OPTIONS, buildCourierTrackingUrl } from '@/core/utils/tracking.util';
import {
  Clock,
  Plus,
  RefreshCw,
  Truck,
  Search,
  ExternalLink,
  User,
  Phone,
  Users,
  X,
} from 'lucide-react';

interface AdminOrdersTabProps {
  orders: Order[];
  customers?: CustomerProfile[];
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
}

export function AdminOrdersTab({
  orders,
  customers = [],
  onOpenManualOrderModal,
  onRefreshOrders,
  onPaymentStatusChange,
  onOrderStatusChange,
  onUpdateOrderTracking,
}: AdminOrdersTabProps) {
  const [viewMode, setViewMode] = useState<'orders' | 'customers'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Tracking Modal / Popover State
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [courierKey, setCourierKey] = useState<string>('steadfast');
  const [customCourierName, setCustomCourierName] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [autoMarkDispatched, setAutoMarkDispatched] = useState(true);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesStatus;

      const matchesQuery =
        o.orderNumber.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.trxId && o.trxId.toLowerCase().includes(q)) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q));

      return matchesStatus && matchesQuery;
    });
  }, [orders, statusFilter, searchQuery]);

  // Unique customers derived from orders + registered accounts
  const customerDirectory = useMemo(() => {
    const map = new Map<string, {
      phone: string;
      fullName: string;
      address: string;
      deliveryZone: string;
      totalOrders: number;
      totalSpent: number;
      latestOrderDate: string;
    }>();

    // 1. Tally from all orders
    for (const o of orders) {
      const phone = o.customer.phone.trim().replace(/\s+/g, '');
      const existing = map.get(phone);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += o.total;
        if (new Date(o.createdAt) > new Date(existing.latestOrderDate)) {
          existing.latestOrderDate = o.createdAt;
          existing.address = o.customer.address || existing.address;
        }
      } else {
        map.set(phone, {
          phone,
          fullName: o.customer.fullName,
          address: o.customer.address,
          deliveryZone: o.customer.deliveryZone,
          totalOrders: 1,
          totalSpent: o.total,
          latestOrderDate: o.createdAt,
        });
      }
    }

    // 2. Merge registered customers
    for (const c of customers) {
      const phone = c.phone.trim().replace(/\s+/g, '');
      if (!map.has(phone)) {
        map.set(phone, {
          phone,
          fullName: c.fullName,
          address: c.defaultAddress,
          deliveryZone: c.deliveryZone,
          totalOrders: c.totalOrders || 0,
          totalSpent: c.totalSpent || 0,
          latestOrderDate: c.createdAt,
        });
      }
    }

    return Array.from(map.values());
  }, [orders, customers]);

  const openTrackingModal = (o: Order) => {
    setTrackingModalOrder(o);
    const existingCourier = o.courierName?.toLowerCase() || 'steadfast';
    const foundPreset = COURIER_OPTIONS.find((c) => c.name.toLowerCase().includes(existingCourier));
    if (foundPreset && foundPreset.key !== 'other') {
      setCourierKey(foundPreset.key);
      setCustomCourierName('');
    } else {
      setCourierKey('other');
      setCustomCourierName(o.courierName || '');
    }
    setTrackingCode(o.trackingNumber || '');
    setEstimatedDelivery(
      o.estimatedDelivery || (o.customer.deliveryZone === 'inside_dhaka' ? '24–48 hours' : '3–4 days')
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

  return (
    <div className="border border-[#E7E0D6] bg-white overflow-hidden shadow-sm space-y-0">
      {/* Top Action & View Toggle Header */}
      <div className="px-6 py-4 border-b border-[#E7E0D6] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1C1917]">
              Customer &amp; Order Fulfillment Hub
            </h2>
            <div className="inline-flex border border-[#E7E0D6] p-0.5 bg-[#FAF7F2] text-xs">
              <button
                type="button"
                onClick={() => setViewMode('orders')}
                className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-wider cursor-pointer ${
                  viewMode === 'orders'
                    ? 'bg-[#1C1917] text-[#FAF7F2]'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Orders ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('customers')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider cursor-pointer ${
                  viewMode === 'customers'
                    ? 'bg-[#1C1917] text-[#FAF7F2]'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Customers Directory ({customerDirectory.length})</span>
              </button>
            </div>
          </div>
          <p className="text-[11px] text-[#78716C] mt-1">
            Track customer deliveries, assign courier consignment numbers (Pathao, Steadfast), and manage manual payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenManualOrderModal}
            className="inline-flex items-center gap-1.5 bg-emerald-700 text-white px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider hover:bg-emerald-800 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Manual Order (WhatsApp/FB)</span>
          </button>

          <button
            onClick={onRefreshOrders}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A7B3E] hover:text-[#1C1917] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: ORDERS LIST & TRACKING */}
      {viewMode === 'orders' && (
        <>
          {/* Filter & Search Bar */}
          <div className="p-4 border-b border-[#E7E0D6] bg-[#FAF7F2]/50 flex flex-wrap items-center justify-between gap-3">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                { key: 'all', label: `All (${orders.length})` },
                {
                  key: 'pending',
                  label: `Pending (${orders.filter((o) => o.status === 'pending').length})`,
                },
                {
                  key: 'confirmed',
                  label: `Confirmed (${orders.filter((o) => o.status === 'confirmed').length})`,
                },
                {
                  key: 'dispatched',
                  label: `Dispatched (${orders.filter((o) => o.status === 'dispatched').length})`,
                },
                {
                  key: 'delivered',
                  label: `Delivered (${orders.filter((o) => o.status === 'delivered').length})`,
                },
                {
                  key: 'cancelled',
                  label: `Cancelled (${orders.filter((o) => o.status === 'cancelled').length})`,
                },
              ].map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setStatusFilter(pill.key)}
                  className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider border transition cursor-pointer ${
                    statusFilter === pill.key
                      ? 'border-[#1C1917] bg-[#1C1917] text-[#FAF7F2]'
                      : 'border-[#E7E0D6] bg-white text-[#78716C] hover:text-[#1C1917]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order #, Phone, Name, TrxID..."
                className="w-72 border border-[#D6CFC5] bg-white pl-8 pr-3 py-1.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
              />
              <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-2.5 top-2.5" />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-14 text-center text-[#78716C]">
              <Clock className="w-8 h-8 mx-auto text-[#C5A059] mb-2 stroke-[1.25]" />
              <div className="font-serif-display text-2xl text-[#1C1917]">No orders matched</div>
              <div className="text-xs text-[#78716C] mt-1">
                Try clearing your search query or switching your status filter.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#78716C]">
                <thead className="bg-[#FAF7F2] border-b border-[#E7E0D6] text-[#1C1917] uppercase font-semibold text-[10px] tracking-[0.16em]">
                  <tr>
                    <th className="py-3.5 px-4">Order Ref &amp; Date</th>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Items</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Payment &amp; TrxID</th>
                    <th className="py-3.5 px-4">Courier &amp; Tracking</th>
                    <th className="py-3.5 px-4">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EDE4]">
                  {filteredOrders.map((o) => {
                    const source = o.customer.orderSource || 'website';
                    return (
                      <tr key={o.id} className="hover:bg-[#FAF7F2]/60">
                        {/* 1. Order Ref & Date */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#9A7B3E]">
                              {o.orderNumber}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                                source === 'whatsapp'
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                  : source === 'messenger'
                                  ? 'border-blue-300 bg-blue-50 text-blue-800'
                                  : 'border-[#E6D5B8] bg-[#FAF7F2] text-[#9A7B3E]'
                              }`}
                            >
                              {source}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#A8A29E] mt-1">
                            {new Date(o.createdAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>

                        {/* 2. Customer Details */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#1C1917] flex items-center gap-1.5">
                            <span>{o.customer.fullName}</span>
                          </div>
                          <div className="text-[11px] text-[#1C1917] font-mono mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#9A7B3E]" />
                            <a
                              href={`tel:${o.customer.phone}`}
                              className="hover:underline font-semibold"
                            >
                              {o.customer.phone}
                            </a>
                          </div>
                          <div className="text-[10px] text-[#78716C] mt-0.5 max-w-xs truncate">
                            {o.customer.address} ({o.customer.deliveryZone === 'inside_dhaka' ? 'Dhaka' : 'Outside'})
                          </div>
                        </td>

                        {/* 3. Items */}
                        <td className="py-3.5 px-4">
                          <div className="text-[11px] text-[#1C1917] font-medium space-y-1 max-w-xs">
                            {o.items.map((item, idx) => (
                              <div key={idx} className="truncate">
                                <span className="font-bold text-[#9A7B3E]">{item.quantity}×</span>{' '}
                                {item.product.name}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* 4. Total */}
                        <td className="py-3.5 px-4">
                          <div className="font-serif-display text-base font-bold text-[#1C1917]">
                            {formatBDT(o.total)}
                          </div>
                          <div className="text-[10px] text-[#A8A29E]">
                            Fee: ৳{o.deliveryFee}
                          </div>
                        </td>

                        {/* 5. Payment & TrxID */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              o.paymentMethod === 'bkash'
                                ? 'bg-pink-50 text-pink-700 border border-pink-200'
                                : o.paymentMethod === 'card'
                                ? 'bg-[#FAF7F2] text-[#1C1917] border border-[#C5A059]'
                                : 'bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            {o.paymentMethod}
                          </span>

                          <div className="mt-1">
                            <select
                              value={o.paymentStatus}
                              onChange={(e) =>
                                onPaymentStatusChange(o.id, e.target.value as PaymentStatus)
                              }
                              className={`border px-2 py-0.5 text-[10px] font-semibold focus:outline-none cursor-pointer ${
                                o.paymentStatus === 'verified'
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                  : o.paymentStatus === 'failed'
                                  ? 'border-red-300 bg-red-50 text-red-800'
                                  : 'border-amber-300 bg-amber-50 text-amber-800'
                              }`}
                            >
                              <option value="pending">Check TrxID</option>
                              <option value="verified">Verified ✓</option>
                              <option value="failed">Unpaid ✗</option>
                            </select>
                          </div>

                          {o.trxId && (
                            <div className="mt-1 font-mono text-[11px] font-bold text-pink-700">
                              Trx: {o.trxId}
                            </div>
                          )}
                        </td>

                        {/* 6. Courier & Tracking */}
                        <td className="py-3.5 px-4">
                          {o.trackingNumber ? (
                            <div className="space-y-1">
                              <div className="font-semibold text-[#1C1917] flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-[#9A7B3E]" />
                                <span>{o.courierName || 'Courier'}</span>
                              </div>
                              <div className="font-mono text-[11px] font-bold text-[#1C1917]">
                                {o.trackingNumber}
                              </div>
                              {o.courierTrackingUrl && (
                                <a
                                  href={o.courierTrackingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#9A7B3E] hover:underline"
                                >
                                  <span>Live Track</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => openTrackingModal(o)}
                                className="block text-[10px] text-[#78716C] hover:text-[#1C1917] underline cursor-pointer"
                              >
                                Edit Tracking
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openTrackingModal(o)}
                              className="inline-flex items-center gap-1 border border-[#D6CFC5] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#1C1917] hover:border-[#9A7B3E] cursor-pointer"
                            >
                              <Truck className="w-3 h-3 text-[#9A7B3E]" />
                              <span>+ Add Courier</span>
                            </button>
                          )}
                        </td>

                        {/* 7. Fulfillment Status */}
                        <td className="py-3.5 px-4">
                          <select
                            value={o.status}
                            onChange={(e) => onOrderStatusChange(o.id, e.target.value as OrderStatus)}
                            className="border border-[#D6CFC5] bg-white px-2.5 py-1 text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#C5A059] cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="dispatched">Dispatched 🚚</option>
                            <option value="delivered">Delivered ✓</option>
                            <option value="cancelled">Cancelled</option>
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#78716C]">
            <thead className="bg-[#FAF7F2] border-b border-[#E7E0D6] text-[#1C1917] uppercase font-semibold text-[10px] tracking-[0.16em]">
              <tr>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Phone / WhatsApp</th>
                <th className="py-3.5 px-4">Delivery Address</th>
                <th className="py-3.5 px-4">Zone</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Lifetime Spend</th>
                <th className="py-3.5 px-4 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3EDE4]">
              {customerDirectory.map((c, idx) => (
                <tr key={idx} className="hover:bg-[#FAF7F2]/60">
                  <td className="py-3.5 px-4 font-semibold text-[#1C1917] flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#9A7B3E]" />
                    <span>{c.fullName || 'Guest Customer'}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-[#1C1917]">
                    {c.phone}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs truncate">
                    {c.address || '—'}
                  </td>
                  <td className="py-3.5 px-4 uppercase text-[10px] font-semibold">
                    {c.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#1C1917]">
                    {c.totalOrders} order{c.totalOrders === 1 ? '' : 's'}
                  </td>
                  <td className="py-3.5 px-4 font-serif-display font-bold text-[#1C1917]">
                    {formatBDT(c.totalSpent)}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <a
                      href={`https://wa.me/88${c.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 border border-emerald-300 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-100"
                    >
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`tel:${c.phone}`}
                      className="inline-flex items-center gap-1 border border-[#E7E0D6] bg-white px-2 py-1 text-[10px] font-semibold text-[#1C1917] hover:border-[#1C1917]"
                    >
                      <span>Call</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* COURIER & TRACKING ASSIGNMENT MODAL */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border border-[#E7E0D6] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E0D6] pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#9A7B3E]" />
                <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
                  Assign Courier &amp; Tracking
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTrackingModalOrder(null)}
                className="p-1 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#78716C]">
              Order: <strong className="font-mono text-[#1C1917]">{trackingModalOrder.orderNumber}</strong> • Customer: <strong className="text-[#1C1917]">{trackingModalOrder.customer.fullName}</strong> ({trackingModalOrder.customer.phone})
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                  Courier Service Provider:
                </label>
                <select
                  value={courierKey}
                  onChange={(e) => setCourierKey(e.target.value)}
                  className="w-full border border-[#D6CFC5] bg-white px-3 py-2 font-medium text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                >
                  {COURIER_OPTIONS.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {courierKey === 'other' && (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                    Custom Courier Name:
                  </label>
                  <input
                    type="text"
                    value={customCourierName}
                    onChange={(e) => setCustomCourierName(e.target.value)}
                    placeholder="e.g. In-house Delivery"
                    className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-[#1C1917]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                  Consignment / Tracking Number *:
                </label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="e.g. CID-9284102 or Pathao ID"
                  className="w-full border border-[#D6CFC5] bg-white px-3 py-2 font-mono font-bold text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                  Estimated Delivery Window:
                </label>
                <input
                  type="text"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  placeholder="e.g. 24–48 hours"
                  className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-[#1C1917]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoDispatched"
                  checked={autoMarkDispatched}
                  onChange={(e) => setAutoMarkDispatched(e.target.checked)}
                  className="accent-[#C5A059]"
                />
                <label htmlFor="autoDispatched" className="text-xs text-[#1C1917] font-medium cursor-pointer">
                  Automatically set order status to &ldquo;Dispatched&rdquo;
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E0D6]">
              <button
                type="button"
                onClick={() => setTrackingModalOrder(null)}
                className="border border-[#E7E0D6] bg-white px-4 py-2 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTracking}
                disabled={!trackingCode.trim()}
                className="bg-[#1C1917] text-[#FAF7F2] hover:bg-[#9A7B3E] disabled:opacity-40 px-5 py-2 text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
              >
                Save &amp; Update Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

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
      const phone = c.phone.trim().replace(/\s+/g, '');
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
      const phone = (o.customer.phone || o.customerPhone || '').trim().replace(/\s+/g, '');
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
                      className={`transition ${
                        isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/70'
                      }`}
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
                        className="py-3.5 px-3.5 font-mono font-extrabold text-base text-slate-900"
                      >
                        {formatBDT(c.totalSpent)}
                      </td>

                      <td style={{ verticalAlign: 'top' }} className="py-3.5 px-3.5 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleExpand(c.phone)}
                            className={`inline-flex items-center gap-1 border px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer shadow-2xs ${
                              isExpanded
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{isExpanded ? 'Hide' : 'Details'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>

                          <a
                            href={`https://wa.me/88${c.phone
                              .replace(/^\+?88/, '')
                              .replace(/\D/g, '')}`}
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
                                    href={`https://wa.me/88${c.phone
                                      .replace(/^\+?88/, '')
                                      .replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 rounded-lg"
                                  >
                                    WhatsApp
                                  </a>
                                  <a
                                    href={`tel:${c.phone}`}
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
                                        key={`${c.phone}-trx-${idx}`}
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
                                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                              co.status === 'delivered'
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                : co.status === 'dispatched'
                                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                                : co.status === 'confirmed'
                                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                                : co.status === 'cancelled'
                                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                                : 'bg-amber-50 text-amber-900 border-amber-200'
                                            }`}
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
                                            key={`${co.id}-draw-item-${itemIdx}`}
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
                                                      subtitle: `Qty: ${it.quantity} • ৳${it.product.priceBDT}`,
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

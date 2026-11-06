'use client';

import React from 'react';
import { Order, OrderStatus, PaymentStatus } from '@/core/models/order.model';
import { formatBDT } from '@/core/utils/currency.util';
import { Clock, Plus, RefreshCw } from 'lucide-react';

interface AdminOrdersTabProps {
  orders: Order[];
  onOpenManualOrderModal: () => void;
  onRefreshOrders: () => void;
  onPaymentStatusChange: (orderId: string, paymentStatus: PaymentStatus) => void;
  onOrderStatusChange: (orderId: string, status: OrderStatus) => void;
}

export function AdminOrdersTab({
  orders,
  onOpenManualOrderModal,
  onRefreshOrders,
  onPaymentStatusChange,
  onOrderStatusChange,
}: AdminOrdersTabProps) {
  return (
    <div className="border border-[#E7E0D6] bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E7E0D6] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1C1917]">
            Customer Orders &amp; Manual bKash TrxID Verification
          </h2>
          <p className="text-[11px] text-[#78716C] mt-0.5">
            Includes Website checkout orders and Manual WhatsApp / Messenger orders (customers can
            track both on <code>/account</code>).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenManualOrderModal}
            className="inline-flex items-center gap-1.5 bg-emerald-700 text-white px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider hover:bg-emerald-800 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Manual Order (WhatsApp/FB)</span>
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

      {orders.length === 0 ? (
        <div className="p-14 text-center text-[#78716C]">
          <Clock className="w-8 h-8 mx-auto text-[#C5A059] mb-2 stroke-[1.25]" />
          <div className="font-serif-display text-2xl text-[#1C1917]">No orders placed yet</div>
          <div className="text-xs text-[#78716C] mt-1">
            When customers check out on the storefront or when you click &ldquo;+ Create Manual
            Order (WhatsApp/FB)&rdquo;, orders will appear here.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#78716C]">
            <thead className="bg-[#FAF7F2] border-b border-[#E7E0D6] text-[#1C1917] uppercase font-semibold text-[10px] tracking-[0.16em]">
              <tr>
                <th className="py-3.5 px-4">Order Ref &amp; Channel</th>
                <th className="py-3.5 px-4">Customer &amp; Address</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment &amp; TrxID</th>
                <th className="py-3.5 px-4">Manual Payment Check</th>
                <th className="py-3.5 px-4">Order Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3EDE4]">
              {orders.map((o) => {
                const source = o.customer.orderSource || 'website';
                return (
                  <tr key={o.id} className="hover:bg-[#FAF7F2]/60">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#9A7B3E]">{o.orderNumber}</span>
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
                      <div className="text-[10px] text-[#A8A29E] mt-1 space-y-0.5">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="text-[#1C1917] font-medium">
                            {item.quantity}× {item.product.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1C1917]">{o.customer.fullName}</div>
                      <div className="font-medium text-[#78716C]">{o.customer.phone}</div>
                      <div className="text-[11px] text-[#A8A29E] truncate max-w-xs">
                        {o.customer.address}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1C1917]">{formatBDT(o.total)}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          o.paymentMethod === 'bkash'
                            ? 'bg-pink-50 text-pink-700 border border-pink-200'
                            : o.paymentMethod === 'card'
                            ? 'bg-[#FAF7F2] text-[#1C1917] border border-[#C5A059]'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {o.paymentMethod}
                      </span>
                      {o.trxId && (
                        <div className="mt-1 font-mono text-xs font-bold text-pink-700">
                          TrxID: {o.trxId}
                        </div>
                      )}
                      {o.bkashSenderNumber && (
                        <div className="text-[10px] text-[#78716C]">
                          From: {o.bkashSenderNumber}
                        </div>
                      )}
                      {o.cardLast4 && (
                        <div className="mt-1 font-mono text-[11px] text-[#1C1917]">
                          Ref/Card: {o.cardLast4}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={o.paymentStatus}
                        onChange={(e) =>
                          onPaymentStatusChange(o.id, e.target.value as PaymentStatus)
                        }
                        className={`border px-2.5 py-1 text-xs font-semibold focus:outline-none cursor-pointer ${
                          o.paymentStatus === 'verified'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                            : o.paymentStatus === 'failed'
                            ? 'border-red-300 bg-red-50 text-red-800'
                            : 'border-amber-300 bg-amber-50 text-amber-800'
                        }`}
                      >
                        <option value="pending">Pending Check</option>
                        <option value="verified">Verified ✓</option>
                        <option value="failed">Invalid / Unpaid</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => onOrderStatusChange(o.id, e.target.value as OrderStatus)}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


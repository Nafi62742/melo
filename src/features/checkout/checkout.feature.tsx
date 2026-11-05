'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/core/services/cart.context';
import { orderService } from '@/core/services/order.service';
import { Order, PaymentMethod } from '@/core/models/order.model';
import { formatBDT } from '@/core/utils/currency.util';
import { CheckCircle2, ShieldCheck, Truck, ShoppingBag, ArrowLeft } from 'lucide-react';

export function CheckoutFeature() {
  const { items, subtotal, deliveryZone, setDeliveryZone, deliveryFee, total, clearCart } = useCart();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [trxId, setTrxId] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      alert('Please fill in your name, phone number, and delivery address.');
      return;
    }

    setIsSubmitting(true);

    const orderNumber = `MELO-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      customer: {
        fullName,
        phone,
        address,
        deliveryZone,
        notes,
      },
      items: [...items],
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'verified',
      trxId: trxId || undefined,
    };

    orderService.saveOrder(newOrder);
    setCompletedOrder(newOrder);
    clearCart();
    setIsSubmitting(false);
  };

  // If order was placed
  if (completedOrder) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
          Order Confirmed!
        </span>
        <h1 className="mt-3 text-2xl font-bold text-neutral-900">
          Thank you for ordering with MELO!
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-neutral-600">
          Your order reference is <strong className="text-violet-600">{completedOrder.orderNumber}</strong>. We will contact you at <strong className="text-neutral-900">{completedOrder.customer.phone}</strong> before dispatching your package.
        </p>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-neutral-500">Delivery Address:</span>
            <span className="font-medium text-neutral-900">{completedOrder.customer.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Payment:</span>
            <span className="font-medium text-neutral-900 uppercase">{completedOrder.paymentMethod}</span>
          </div>
          <div className="flex justify-between font-bold text-neutral-900 pt-2 border-t border-neutral-200">
            <span>Total Payable:</span>
            <span className="text-violet-700">{formatBDT(completedOrder.total)}</span>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-violet-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 transition"
          >
            Continue Shopping
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-neutral-300 px-5 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition"
          >
            View in Admin
          </Link>
        </div>
      </div>
    );
  }

  // If bag is empty
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-neutral-800">Your bag is empty</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Add some cute accessories to proceed with checkout.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex rounded-full bg-violet-600 px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-violet-700"
        >
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-violet-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-neutral-900">
          Complete Your Order
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Customer & Delivery details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer info card */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-4">
              1. Customer & Delivery Information
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayesha Rahman"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-violet-600"
                />
                <span className="text-[11px] text-neutral-400">
                  We will call or SMS you to confirm dispatch.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Full Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="House / Flat #, Road #, Sector / Area, Thana & District"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-violet-600"
                />
              </div>

              {/* Delivery Zone Selector */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-2">
                  Delivery Region:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setDeliveryZone('inside_dhaka')}
                    className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition ${
                      deliveryZone === 'inside_dhaka'
                        ? 'border-violet-600 bg-violet-50/50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-neutral-900">Inside Dhaka</div>
                      <div className="text-[11px] text-neutral-500">24-48 hours delivery</div>
                    </div>
                    <span className="font-bold text-violet-700">৳60</span>
                  </div>

                  <div
                    onClick={() => setDeliveryZone('outside_dhaka')}
                    className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition ${
                      deliveryZone === 'outside_dhaka'
                        ? 'border-violet-600 bg-violet-50/50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-neutral-900">Outside Dhaka</div>
                      <div className="text-[11px] text-neutral-500">3-4 days delivery</div>
                    </div>
                    <span className="font-bold text-violet-700">৳120</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Delivery Instructions / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call before arrival, leave with security"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-violet-600"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-4">
              2. Payment Method
            </h2>

            <div className="space-y-3 text-xs">
              {/* COD */}
              <label className="flex items-center justify-between rounded-xl border border-neutral-200 p-3.5 cursor-pointer hover:bg-neutral-50">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-violet-600"
                  />
                  <div>
                    <div className="font-bold text-neutral-900">Cash on Delivery (COD)</div>
                    <div className="text-neutral-500 text-[11px]">Pay in cash when you receive the package.</div>
                  </div>
                </div>
                <Truck className="w-4 h-4 text-neutral-400" />
              </label>

              {/* bKash */}
              <label className="flex items-center justify-between rounded-xl border border-neutral-200 p-3.5 cursor-pointer hover:bg-neutral-50">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="accent-violet-600"
                  />
                  <div>
                    <div className="font-bold text-pink-700">bKash</div>
                    <div className="text-neutral-500 text-[11px]">Send money to 01700-000000 and enter TrxID below.</div>
                  </div>
                </div>
                <span className="font-bold text-pink-600">bKash</span>
              </label>

              {paymentMethod === 'bkash' && (
                <div className="pl-6 pt-2">
                  <label className="block font-semibold text-neutral-700 mb-1">
                    bKash Transaction ID (TrxID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BIK98371X"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="w-full rounded-xl border border-pink-300 px-3.5 py-2 text-xs focus:outline-none focus:border-pink-600"
                  />
                </div>
              )}

              {/* Nagad */}
              <label className="flex items-center justify-between rounded-xl border border-neutral-200 p-3.5 cursor-pointer hover:bg-neutral-50">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'nagad'}
                    onChange={() => setPaymentMethod('nagad')}
                    className="accent-violet-600"
                  />
                  <div>
                    <div className="font-bold text-orange-700">Nagad</div>
                    <div className="text-neutral-500 text-[11px]">Send money to 01700-000000.</div>
                  </div>
                </div>
                <span className="font-bold text-orange-600">Nagad</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary: Items & Price Breakdown */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-4">
              Order Summary ({items.length} items)
            </h2>

            {/* Items scroll */}
            <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 border">
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs font-semibold text-neutral-900">
                      {product.name}
                    </div>
                    <div className="text-[11px] text-neutral-400">Qty: {quantity}</div>
                  </div>
                  <div className="text-xs font-bold text-neutral-900">
                    {formatBDT(product.priceBDT * quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatBDT(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge ({deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                <span className="font-semibold text-neutral-900">{formatBDT(deliveryFee)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-bold text-neutral-900">
                <span>Total Payable</span>
                <span className="text-violet-700 text-base">{formatBDT(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-2xl bg-violet-600 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-700 active:scale-98 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-neutral-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe & Secure Checkout. No online advance needed for COD.</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

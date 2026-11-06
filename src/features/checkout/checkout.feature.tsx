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

  // Order Confirmation State
  if (completedOrder) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#C5A059] bg-white text-[#9A7B3E] mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="border border-[#E6D5B8] bg-[#F3EDE4] text-[#9A7B3E] px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
          Order Confirmed
        </span>
        <h1 className="mt-4 font-serif-display text-3xl sm:text-4xl font-medium text-[#1C1917]">
          Thank You for Choosing MELO
        </h1>
        <p className="mt-2.5 text-xs sm:text-sm text-[#78716C] leading-relaxed">
          Your order reference is{' '}
          <strong className="text-[#1C1917] font-semibold">{completedOrder.orderNumber}</strong>. We will contact you at{' '}
          <strong className="text-[#1C1917] font-semibold">{completedOrder.customer.phone}</strong> before dispatching your jewellery.
        </p>

        <div className="mt-8 border border-[#E7E0D6] bg-white p-6 text-left text-xs space-y-3">
          <div className="flex justify-between">
            <span className="text-[#78716C]">Delivery Address</span>
            <span className="font-medium text-[#1C1917] text-right max-w-xs">
              {completedOrder.customer.address}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#78716C]">Payment Method</span>
            <span className="font-semibold text-[#1C1917] uppercase">
              {completedOrder.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-[#1C1917] pt-3 border-t border-[#E7E0D6]">
            <span className="uppercase tracking-wider">Total Payable</span>
            <span className="font-serif-display text-xl font-bold text-[#1C1917]">
              {formatBDT(completedOrder.total)}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/shop" className="boutique-btn-primary px-7 py-3.5">
            Continue Shopping
          </Link>
          <Link href="/admin" className="boutique-btn-outline px-6 py-3.5">
            View in Admin
          </Link>
        </div>
      </div>
    );
  }

  // Empty Bag State
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <ShoppingBag className="w-10 h-10 text-[#C5A059] mx-auto mb-3 stroke-[1.25]" />
        <h2 className="font-serif-display text-3xl font-medium text-[#1C1917]">
          Your Shopping Bag is Empty
        </h2>
        <p className="mt-1.5 text-xs text-[#78716C]">
          Explore our curated French ear clips, minimalist rings, and bracelets before checking out.
        </p>
        <Link href="/shop" className="mt-6 inline-flex boutique-btn-primary px-7 py-3.5">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-14">
      <div className="mb-8 border-b border-[#E7E0D6] pb-5">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#78716C] hover:text-[#1C1917]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
        <h1 className="mt-3 font-serif-display text-3xl sm:text-5xl font-medium text-[#1C1917]">
          Complete Your Order
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Form: Customer & Delivery Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Info Card */}
          <div className="border border-[#E7E0D6] bg-white p-6 sm:p-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7B3E] mb-6">
              1. Customer &amp; Delivery Information
            </h2>

            <div className="space-y-5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayesha Rahman"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                />
                <span className="mt-1 block text-[11px] text-[#78716C]">
                  We will call or SMS you to confirm dispatch.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Full Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="House / Flat #, Road #, Sector / Area, Thana & District"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* Delivery Zone Selector */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                  Delivery Region
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setDeliveryZone('inside_dhaka')}
                    className={`cursor-pointer border p-4 flex items-center justify-between transition ${
                      deliveryZone === 'inside_dhaka'
                        ? 'border-[#C5A059] bg-[#FAF7F2]'
                        : 'border-[#E7E0D6] hover:border-[#1C1917]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[#1C1917]">Inside Dhaka</div>
                      <div className="text-[11px] text-[#78716C]">24–48 hours delivery</div>
                    </div>
                    <span className="font-serif-display text-lg font-bold text-[#1C1917]">৳60</span>
                  </div>

                  <div
                    onClick={() => setDeliveryZone('outside_dhaka')}
                    className={`cursor-pointer border p-4 flex items-center justify-between transition ${
                      deliveryZone === 'outside_dhaka'
                        ? 'border-[#C5A059] bg-[#FAF7F2]'
                        : 'border-[#E7E0D6] hover:border-[#1C1917]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[#1C1917]">Outside Dhaka</div>
                      <div className="text-[11px] text-[#78716C]">3–4 days delivery</div>
                    </div>
                    <span className="font-serif-display text-lg font-bold text-[#1C1917]">৳120</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Delivery Instructions / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call before arrival, gift note request"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="border border-[#E7E0D6] bg-white p-6 sm:p-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7B3E] mb-5">
              2. Payment Method
            </h2>

            <div className="space-y-3 text-xs">
              {/* COD */}
              <label
                className={`flex items-center justify-between border p-4 cursor-pointer transition ${
                  paymentMethod === 'cod' ? 'border-[#C5A059] bg-[#FAF7F2]' : 'border-[#E7E0D6]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-[#1C1917]"
                  />
                  <div>
                    <div className="font-semibold text-[#1C1917]">Cash on Delivery (COD)</div>
                    <div className="text-[#78716C] text-[11px]">
                      Pay in cash when you receive and inspect your package.
                    </div>
                  </div>
                </div>
                <Truck className="w-4 h-4 text-[#9A7B3E]" />
              </label>

              {/* bKash */}
              <label
                className={`flex items-center justify-between border p-4 cursor-pointer transition ${
                  paymentMethod === 'bkash' ? 'border-[#C5A059] bg-[#FAF7F2]' : 'border-[#E7E0D6]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="accent-[#1C1917]"
                  />
                  <div>
                    <div className="font-semibold text-pink-700">bKash</div>
                    <div className="text-[#78716C] text-[11px]">
                      Send money to 01700-000000 and enter TrxID below.
                    </div>
                  </div>
                </div>
                <span className="font-bold text-pink-600">bKash</span>
              </label>

              {paymentMethod === 'bkash' && (
                <div className="pl-6 pt-2">
                  <label className="block font-semibold text-[#1C1917] mb-1">
                    bKash Transaction ID (TrxID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BIK98371X"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="w-full border border-pink-300 px-3.5 py-2 text-xs focus:outline-none focus:border-pink-600"
                  />
                </div>
              )}

              {/* Nagad */}
              <label
                className={`flex items-center justify-between border p-4 cursor-pointer transition ${
                  paymentMethod === 'nagad' ? 'border-[#C5A059] bg-[#FAF7F2]' : 'border-[#E7E0D6]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'nagad'}
                    onChange={() => setPaymentMethod('nagad')}
                    className="accent-[#1C1917]"
                  />
                  <div>
                    <div className="font-semibold text-orange-700">Nagad</div>
                    <div className="text-[#78716C] text-[11px]">Send money to 01700-000000.</div>
                  </div>
                </div>
                <span className="font-bold text-orange-600">Nagad</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary: Items & Price Breakdown */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 border border-[#E7E0D6] bg-white p-6 sm:p-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7B3E] mb-5">
              Order Summary ({items.length} Pieces)
            </h2>

            {/* Items scroll */}
            <div className="max-h-64 overflow-y-auto divide-y divide-[#F3EDE4] pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3.5 py-3.5 first:pt-0">
                  <div className="relative h-14 w-12 flex-shrink-0 overflow-hidden bg-[#F3EDE4] border border-[#E7E0D6]">
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-serif-display text-base font-medium text-[#1C1917]">
                      {product.name}
                    </div>
                    <div className="text-[11px] text-[#78716C]">Qty: {quantity}</div>
                  </div>
                  <div className="text-xs font-semibold text-[#1C1917]">
                    {formatBDT(product.priceBDT * quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="mt-5 pt-5 border-t border-[#E7E0D6] space-y-2.5 text-xs text-[#78716C]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#1C1917]">{formatBDT(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  Delivery ({deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                </span>
                <span className="font-semibold text-[#1C1917]">{formatBDT(deliveryFee)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#E7E0D6] text-sm font-semibold text-[#1C1917]">
                <span className="uppercase tracking-wider text-xs">Total Payable</span>
                <span className="font-serif-display text-2xl font-bold text-[#1C1917]">
                  {formatBDT(total)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full boutique-btn-primary py-4 text-center cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#78716C]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9A7B3E]" />
              <span>Safe &amp; Secure Checkout • No Advance Required for COD</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

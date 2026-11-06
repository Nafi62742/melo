'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/core/services/cart.context';
import { orderService } from '@/core/services/order.service';
import { productService } from '@/core/services/product.service';
import { customerService } from '@/core/services/customer.service';
import { Order, PaymentMethod } from '@/core/models/order.model';
import { formatBDT } from '@/core/utils/currency.util';
import {
  CheckCircle2,
  ShieldCheck,
  Truck,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Copy,
  Check,
} from 'lucide-react';

export function CheckoutFeature() {
  const { items, subtotal, deliveryZone, setDeliveryZone, deliveryFee, total, clearCart } = useCart();
  const initialCustomer = customerService.getCurrentCustomer();

  const [fullName, setFullName] = useState(initialCustomer?.fullName || '');
  const [phone, setPhone] = useState(initialCustomer?.phone || '');
  const [address, setAddress] = useState(initialCustomer?.defaultAddress || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [trxId, setTrxId] = useState('');
  const [bkashSenderNumber, setBkashSenderNumber] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [notes, setNotes] = useState('');
  const [copiedBkash, setCopiedBkash] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const storeBkashNumber = orderService.getBkashNumber();

  const paymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'card':
        return 'Credit / Debit Card';
      case 'bkash':
        return 'bKash Manual Verification';
      case 'cod':
        return 'Cash on Delivery (COD)';
    }
  };

  const handleCopyBkash = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(storeBkashNumber);
      setCopiedBkash(true);
      setTimeout(() => setCopiedBkash(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      alert('Please fill in your name, phone number, and delivery address.');
      return;
    }

    if (paymentMethod === 'bkash' && !trxId.trim()) {
      alert('Please enter your bKash Transaction ID (TrxID) after sending the payment.');
      return;
    }

    setIsSubmitting(true);

    const orderNumber = `MELO-${Date.now().toString().slice(-6)}`;
    const activeCustomer = customerService.getCurrentCustomer();

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      customerId: activeCustomer ? activeCustomer.id : undefined,
      customerPhone: phone.trim(),
      customer: {
        fullName,
        phone,
        email: initialCustomer?.email || undefined,
        address,
        deliveryZone,
        notes,
        customerId: activeCustomer ? activeCustomer.id : undefined,
      },
      items: [...items],
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
      estimatedDelivery: deliveryZone === 'inside_dhaka' ? '24–48 hours' : '3–4 business days',
      trxId: paymentMethod === 'bkash' ? trxId.trim().toUpperCase() : undefined,
      bkashSenderNumber:
        paymentMethod === 'bkash' && bkashSenderNumber.trim()
          ? bkashSenderNumber.trim()
          : undefined,
      cardLast4: paymentMethod === 'card' && cardLast4.trim() ? cardLast4.trim() : undefined,
    };

    orderService.saveOrder(newOrder);
    items.forEach((item) => {
      productService.updateProductStock(item.product.id, -item.quantity);
    });
    if (newOrder.trxId) {
      void customerService.addTrxIdToCustomer(phone, newOrder.trxId);
    }
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
          Order Received
        </span>
        <h1 className="mt-4 font-serif-display text-3xl sm:text-4xl font-medium text-[#1C1917]">
          Thank You for Choosing MELO
        </h1>
        <p className="mt-2.5 text-xs sm:text-sm text-[#78716C] leading-relaxed">
          Your order reference is{' '}
          <strong className="text-[#1C1917] font-semibold">{completedOrder.orderNumber}</strong>.
          {completedOrder.paymentMethod === 'bkash' ? (
            <>
              {' '}
              We have recorded your bKash TrxID{' '}
              <strong className="text-pink-700 font-semibold">{completedOrder.trxId}</strong> and
              will verify it manually in our admin panel shortly.
            </>
          ) : (
            <>
              {' '}
              We will contact you at{' '}
              <strong className="text-[#1C1917] font-semibold">
                {completedOrder.customer.phone}
              </strong>{' '}
              before dispatching your jewellery.
            </>
          )}
        </p>

        <div className="mt-8 border border-[#E7E0D6] bg-white p-6 text-left text-xs space-y-3">
          <div className="flex justify-between">
            <span className="text-[#78716C]">Delivery Address</span>
            <span className="font-medium text-[#1C1917] text-right max-w-xs">
              {completedOrder.customer.address}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#78716C]">Estimated Delivery</span>
            <span className="font-semibold text-[#1C1917]">
              {completedOrder.estimatedDelivery || (completedOrder.customer.deliveryZone === 'inside_dhaka' ? '24–48 hours' : '3–4 days')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#78716C]">Payment Method</span>
            <span className="font-semibold text-[#1C1917]">
              {paymentMethodLabel(completedOrder.paymentMethod)}
            </span>
          </div>
          {completedOrder.trxId && (
            <div className="flex justify-between">
              <span className="text-[#78716C]">Submitted bKash TrxID</span>
              <span className="font-mono font-bold text-pink-700">{completedOrder.trxId}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-[#1C1917] pt-3 border-t border-[#E7E0D6]">
            <span className="uppercase tracking-wider">Total Amount</span>
            <span className="font-serif-display text-xl font-bold text-[#1C1917]">
              {formatBDT(completedOrder.total)}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href={`/account?orderNumber=${completedOrder.orderNumber}`}
            className="boutique-btn-primary px-7 py-3.5"
          >
            Track My Order Live
          </Link>
          <Link href="/shop" className="boutique-btn-outline px-6 py-3.5">
            Continue Shopping
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
                  We will call or message you on WhatsApp to confirm dispatch.
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

          {/* Payment Method Card: bKash & Card Preferred + COD */}
          <div className="border border-[#E7E0D6] bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7B3E]">
                2. Payment Method
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8C6D32] bg-[#C5A059]/12 border border-[#C5A059]/35 px-2.5 py-0.5">
                bKash &amp; Card Preferred
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* 1. bKash Manual Send Money + TrxID Collection (Preferred) */}
              <div
                className={`border transition ${
                  paymentMethod === 'bkash' ? 'border-[#C5A059] bg-[#FAF7F2]' : 'border-[#E7E0D6]'
                }`}
              >
                <label className="flex items-center justify-between p-4 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="accent-[#1C1917]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-pink-700">bKash (Send Money / Payment)</span>
                        <span className="bg-pink-700 text-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                          Preferred
                        </span>
                      </div>
                      <div className="text-[#78716C] text-[11px] mt-0.5">
                        Send {formatBDT(total)} to our bKash number and enter your TrxID below.
                      </div>
                    </div>
                  </div>
                  <Smartphone className="w-4 h-4 text-pink-600 flex-shrink-0" />
                </label>

                {paymentMethod === 'bkash' && (
                  <div className="px-4 pb-5 pt-3 border-t border-[#E7E0D6]/80 bg-white space-y-4">
                    {/* Step-by-step bKash Number Box */}
                    <div className="border border-pink-200 bg-pink-50/50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-pink-800">
                          MELO Official bKash Number (Send Money)
                        </div>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="font-mono text-lg font-bold text-pink-700">
                            {storeBkashNumber}
                          </span>
                          <span className="text-[11px] text-[#78716C]">
                            • Amount: <strong className="text-[#1C1917]">{formatBDT(total)}</strong>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyBkash}
                        className="inline-flex items-center gap-1.5 border border-pink-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-pink-700 hover:bg-pink-100 transition cursor-pointer self-start sm:self-center"
                      >
                        {copiedBkash ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Number</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                          bKash Transaction ID (TrxID) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required={paymentMethod === 'bkash'}
                          placeholder="e.g. BIK98371X"
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value)}
                          className="w-full border border-pink-300 px-3.5 py-2 text-xs font-mono uppercase focus:outline-none focus:border-pink-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                          Your bKash Sender Number (Optional)
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. 017XXXXXXXX"
                          value={bkashSenderNumber}
                          onChange={(e) => setBkashSenderNumber(e.target.value)}
                          className="w-full border border-[#D6CFC5] px-3.5 py-2 text-xs focus:outline-none focus:border-pink-600"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-[#78716C]">
                      Once you submit your order, our team will manually verify your{' '}
                      <strong className="text-[#1C1917]">TrxID</strong> in the admin panel and confirm dispatch.
                    </p>
                  </div>
                )}
              </div>

              {/* 2. Credit / Debit Card (Preferred) */}
              <div
                className={`border transition ${
                  paymentMethod === 'card' ? 'border-[#C5A059] bg-[#FAF7F2]' : 'border-[#E7E0D6]'
                }`}
              >
                <label className="flex items-center justify-between p-4 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#1C1917]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1C1917]">
                          Credit / Debit Card (Visa, Mastercard, Amex)
                        </span>
                        <span className="bg-[#181512] text-[#E6D5B8] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                          Preferred
                        </span>
                      </div>
                      <div className="text-[#78716C] text-[11px] mt-0.5">
                        Fast priority dispatch with secure card payment.
                      </div>
                    </div>
                  </div>
                  <CreditCard className="w-4 h-4 text-[#9A7B3E] flex-shrink-0" />
                </label>

                {paymentMethod === 'card' && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#E7E0D6]/80 space-y-3 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          placeholder="Name on Card"
                          defaultValue={fullName}
                          className="w-full border border-[#D6CFC5] px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                          Last 4 Digits / Payment Ref (Optional)
                        </label>
                        <input
                          type="text"
                          maxLength={16}
                          placeholder="e.g. 4242 or Payment Ref"
                          value={cardLast4}
                          onChange={(e) => setCardLast4(e.target.value)}
                          className="w-full border border-[#D6CFC5] px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Cash on Delivery (COD) */}
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
                      Pay in cash when you receive and inspect your package at your doorstep.
                    </div>
                  </div>
                </div>
                <Truck className="w-4 h-4 text-[#78716C] flex-shrink-0" />
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
              <div className="flex justify-between">
                <span>Selected Payment</span>
                <span className="font-semibold text-[#9A7B3E]">
                  {paymentMethodLabel(paymentMethod)}
                </span>
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
              <span>Priority Dispatch on bKash &amp; Card Orders</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

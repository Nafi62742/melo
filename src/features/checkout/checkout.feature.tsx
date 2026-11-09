'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/core/services/cart.context';
import { orderService } from '@/core/services/order.service';
import { productService } from '@/core/services/product.service';
import { customerService, CUSTOMER_AUTH_CHANGED_EVENT } from '@/core/services/customer.service';
import { CustomerProfile } from '@/core/models/customer.model';
import { Order, PaymentMethod, DeliveryZone } from '@/core/models/order.model';
import { formatBDT } from '@/core/utils/currency.util';
import { useI18n } from '@/core/i18n/i18n.context';
import {
  CheckCircle2,
  Truck,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Copy,
  Check,
  AlertCircle,
  User,
  Lock,
  LogIn,
} from 'lucide-react';

const emptySubscribe = () => () => {};

export function CheckoutFeature() {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!isMounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs uppercase tracking-widest text-[#78716C] font-mono">
          Loading Secure Checkout...
        </span>
      </div>
    );
  }

  return <CheckoutContent />;
}

function CheckoutContent() {
  const { t } = useI18n();
  const { items, subtotal, deliveryZone, setDeliveryZone, deliveryFee, total, clearCart } = useCart();

  const [loggedInCustomer, setLoggedInCustomer] = useState<CustomerProfile | null>(() =>
    customerService.getCurrentCustomer()
  );

  const [fullName, setFullName] = useState(() => customerService.getCurrentCustomer()?.fullName || '');
  const [phone, setPhone] = useState(() => customerService.getCurrentCustomer()?.phone || '');
  const [email, setEmail] = useState(() => customerService.getCurrentCustomer()?.email || '');
  const [address, setAddress] = useState(() => customerService.getCurrentCustomer()?.defaultAddress || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [trxId, setTrxId] = useState('');
  const [bkashSenderNumber, setBkashSenderNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [copiedBkash, setCopiedBkash] = useState(false);

  // Card payment option visibility flag (can be toggled to true when gateway is integrated)
  const SHOW_CARD_PAYMENT = false;

  // Field Validation States
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [trxIdError, setTrxIdError] = useState<string | null>(null);
  const [senderPhoneError, setSenderPhoneError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Cash on delivery handling fee (+10 BDT)
  const codFee = paymentMethod === 'cod' ? 10 : 0;
  const finalTotal = total + codFee;

  // Checkout Authentication Gate State (login required to order)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authAddress, setAuthAddress] = useState('');
  const [authZone, setAuthZone] = useState<DeliveryZone>('inside_dhaka');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // Strict Phone Sanitization: Only allow numbers and optional leading +, max 11 digits (or 14 with +880)
  const sanitizePhoneNumber = (value: string): string => {
    const clean = value.replace(/[^\d+]/g, '');
    if (clean.startsWith('+')) {
      return '+' + clean.slice(1).replace(/\D/g, '').slice(0, 13);
    }
    if (clean.startsWith('880')) {
      return clean.slice(0, 13);
    }
    return clean.slice(0, 11);
  };

  const sanitizeTrxId = (value: string): string => {
    return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15);
  };

  const validateBdPhone = (val: string): boolean => {
    const clean = val.replace(/[\s\-\(\)]/g, '').trim();
    return /^(?:\+?8801|01)[3-9]\d{8}$/.test(clean);
  };

  const validateEmail = (val: string): boolean => {
    if (!val.trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  useEffect(() => {
    const syncCustomer = () => {
      const current = customerService.getCurrentCustomer();
      setLoggedInCustomer(current);
      if (current) {
        setFullName((prev) => (prev ? prev : current.fullName || ''));
        setPhone((prev) => (prev ? prev : current.phone || ''));
        setEmail((prev) => (prev ? prev : current.email || ''));
        setAddress((prev) => (prev ? prev : current.defaultAddress || ''));
        if (current.deliveryZone) {
          setDeliveryZone(current.deliveryZone);
        }
      }
    };

    syncCustomer();

    window.addEventListener(CUSTOMER_AUTH_CHANGED_EVENT, syncCustomer);
    window.addEventListener('storage', syncCustomer);
    return () => {
      window.removeEventListener(CUSTOMER_AUTH_CHANGED_EVENT, syncCustomer);
      window.removeEventListener('storage', syncCustomer);
    };
  }, [setDeliveryZone]);

  const storeBkashNumber = orderService.getBkashNumber();

  const paymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'card':
        return t.checkout.cardTitle;
      case 'bkash':
        return t.checkout.bkashTitle;
      case 'cod':
        return t.checkout.codTitle;
    }
  };

  const handleCopyBkash = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(storeBkashNumber);
      setCopiedBkash(true);
      setTimeout(() => setCopiedBkash(false), 2000);
    }
  };

  const handleCheckoutAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthSubmitting(true);

    try {
      if (authMode === 'login') {
        const cleanId = authPhone.trim();
        if (!cleanId) {
          setAuthError('Please enter your mobile phone number or email address.');
          setIsAuthSubmitting(false);
          return;
        }
        if (cleanId.includes('@')) {
          if (!validateEmail(cleanId)) {
            setAuthError('Please enter a valid email address (e.g. user@example.com).');
            setIsAuthSubmitting(false);
            return;
          }
        } else if (!validateBdPhone(cleanId)) {
          setAuthError('Please enter a valid 11-digit Bangladeshi mobile number or email address.');
          setIsAuthSubmitting(false);
          return;
        }
        if (!authPassword.trim()) {
          setAuthError('Please enter your password.');
          setIsAuthSubmitting(false);
          return;
        }

        const loggedIn = await customerService.login(cleanId, authPassword);
        if (loggedIn) {
          setLoggedInCustomer(loggedIn);
          setFullName(loggedIn.fullName);
          setPhone(loggedIn.phone);
          setEmail(loggedIn.email || '');
          setAddress(loggedIn.defaultAddress);
          if (loggedIn.deliveryZone) setDeliveryZone(loggedIn.deliveryZone);
        } else {
          setAuthError('Invalid mobile/email or password. Please verify your credentials or create an account.');
        }
      } else {
        if (!authFullName.trim() || authFullName.trim().length < 2) {
          setAuthError('Please enter your full name (at least 2 characters).');
          setIsAuthSubmitting(false);
          return;
        }
        if (authFullName.trim().length > 30) {
          setAuthError('Full name cannot exceed 30 characters.');
          setIsAuthSubmitting(false);
          return;
        }
        if (!/^[a-zA-Z\s\.\-'\u0980-\u09FF]+$/.test(authFullName.trim())) {
          setAuthError('Please enter a valid full name (letters and spaces only).');
          setIsAuthSubmitting(false);
          return;
        }
        if (!authPhone.trim() || !validateBdPhone(authPhone)) {
          setAuthError('Please enter a valid 11-digit Bangladeshi mobile number (e.g., 017XXXXXXXX).');
          setIsAuthSubmitting(false);
          return;
        }
        if (!authPassword.trim() || authPassword.trim().length < 6) {
          setAuthError('Password must be at least 6 characters long.');
          setIsAuthSubmitting(false);
          return;
        }
        if (authPassword.length > 40) {
          setAuthError('Password cannot exceed 40 characters.');
          setIsAuthSubmitting(false);
          return;
        }
        if (authEmail.trim()) {
          if (authEmail.trim().length > 30) {
            setAuthError('Email cannot exceed 30 characters.');
            setIsAuthSubmitting(false);
            return;
          }
          if (!validateEmail(authEmail)) {
            setAuthError('Please enter a valid email address (e.g. user@example.com).');
            setIsAuthSubmitting(false);
            return;
          }
        }
        if (!authAddress.trim() || authAddress.trim().length < 5) {
          setAuthError('Please enter your complete delivery address (at least 5 characters).');
          setIsAuthSubmitting(false);
          return;
        }
        if (authAddress.trim().length > 250) {
          setAuthError('Delivery address cannot exceed 250 characters.');
          setIsAuthSubmitting(false);
          return;
        }
        const registered = await customerService.register({
          phone: authPhone,
          fullName: authFullName,
          password: authPassword,
          email: authEmail.trim() || undefined,
          defaultAddress: authAddress,
          deliveryZone: authZone,
        });
        setLoggedInCustomer(registered);
        setFullName(registered.fullName);
        setPhone(registered.phone);
        setEmail(registered.email || '');
        setAddress(registered.defaultAddress);
        if (registered.deliveryZone) setDeliveryZone(registered.deliveryZone);
      }
    } catch {
      setAuthError('Authentication error. Please try again.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setAuthError(null);
    setIsAuthSubmitting(true);
    try {
      const demo = await customerService.login('01700000000', 'melo1234');
      if (demo) {
        setLoggedInCustomer(demo);
        setFullName(demo.fullName);
        setPhone(demo.phone);
        setEmail(demo.email || '');
        setAddress(demo.defaultAddress);
        if (demo.deliveryZone) setDeliveryZone(demo.deliveryZone);
      }
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!loggedInCustomer) {
      const el = document.getElementById('checkout-auth-card');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setNameError(null);
    setPhoneError(null);
    setEmailError(null);
    setAddressError(null);
    setTrxIdError(null);
    setSenderPhoneError(null);

    let hasError = false;

    if (!fullName.trim() || fullName.trim().length < 2) {
      setNameError('Please enter your full name (at least 2 characters).');
      hasError = true;
    } else if (fullName.trim().length > 30) {
      setNameError('Full name cannot exceed 30 characters.');
      hasError = true;
    } else if (!/^[a-zA-Z\s\.\-'\u0980-\u09FF]+$/.test(fullName.trim())) {
      setNameError('Please enter a valid name (letters and spaces only).');
      hasError = true;
    }

    if (!phone.trim()) {
      setPhoneError('Please enter your mobile phone number.');
      hasError = true;
    } else if (!validateBdPhone(phone)) {
      setPhoneError('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).');
      hasError = true;
    }

    if (email.trim()) {
      if (email.trim().length > 30) {
        setEmailError('Email address cannot exceed 30 characters.');
        hasError = true;
      } else if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address (e.g. customer@gmail.com).');
        hasError = true;
      }
    }

    if (!address.trim() || address.trim().length < 5) {
      setAddressError('Please enter your complete delivery address (at least 5 characters).');
      hasError = true;
    } else if (address.trim().length > 250) {
      setAddressError('Delivery address cannot exceed 250 characters.');
      hasError = true;
    }

    if (paymentMethod === 'bkash') {
      if (!trxId.trim() || trxId.trim().length < 6) {
        setTrxIdError('Please enter your bKash Transaction ID (at least 6 characters).');
        hasError = true;
      } else if (trxId.trim().length > 15) {
        setTrxIdError('bKash Transaction ID cannot exceed 15 characters.');
        hasError = true;
      }
      if (bkashSenderNumber.trim()) {
        if (!validateBdPhone(bkashSenderNumber)) {
          setSenderPhoneError('Please enter a valid 11-digit bKash sender number (e.g. 017XXXXXXXX).');
          hasError = true;
        }
      }
    }

    if (hasError) {
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
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || activeCustomer?.email || undefined,
        address: address.trim(),
        deliveryZone,
        notes: notes.trim() || undefined,
        customerId: activeCustomer ? activeCustomer.id : undefined,
      },
      items: [...items],
      subtotal,
      deliveryFee,
      total: finalTotal,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
      estimatedDelivery: deliveryZone === 'inside_dhaka' ? '24–48 hours' : '3–4 business days',
      trxId: paymentMethod === 'bkash' ? trxId.trim().toUpperCase() : undefined,
      bkashSenderNumber:
        paymentMethod === 'bkash' && bkashSenderNumber.trim()
          ? bkashSenderNumber.trim()
          : undefined,
    };

    // 1. Save locally in domain service
    orderService.saveOrder(newOrder);

    // 2. Decrement inventory stock
    items.forEach((item) => {
      productService.updateProductStock(item.product.id, -item.quantity);
    });

    if (newOrder.trxId) {
      void customerService.addTrxIdToCustomer(phone, newOrder.trxId);
    }

    // 3. Post to /api/orders server route to persist to database
    void fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newOrder }),
    }).then(async (res) => {
      if (!res.ok) {
        console.warn('API /orders response status:', res.status, await res.text());
      }
    }).catch((err) => {
      console.warn('Background sync to /api/orders failed:', err);
    });

    // 4. Trigger automated email invoice in background (safe, inactive by default until Gmail credentials are set)
    void fetch('/api/send-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newOrder }),
    }).catch(() => {
      // Background non-blocking call: checkout never fails if email is inactive or offline
    });

    setCompletedOrder(newOrder);
    clearCart();
    setIsSubmitting(false);
  };

  // Order Confirmation State
  if (completedOrder) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 mx-auto mb-5 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="border border-[#E6D5B8] bg-[#F3EDE4] text-[#9A7B3E] px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
          {t.checkout.orderNumber}: {completedOrder.orderNumber}
        </span>
        <h1 className="mt-4 font-serif-display text-3xl sm:text-4xl font-medium text-[#1C1917]">
          {t.checkout.orderConfirmed}
        </h1>
        <p className="mt-2.5 text-xs sm:text-sm text-[#78716C] leading-relaxed">
          {t.checkout.confirmationNotice}
        </p>

        <div className="mt-8 border border-[#E7E0D6] bg-white p-6 text-left text-xs space-y-3">
          <div className="flex justify-between">
            <span className="text-[#78716C]">{t.checkout.deliveryAddress}</span>
            <span className="font-medium text-[#1C1917] text-right max-w-xs">
              {completedOrder.customer.address}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#78716C]">{t.checkout.estimatedDelivery}</span>
            <span className="font-semibold text-[#1C1917]">
              {completedOrder.estimatedDelivery || (completedOrder.customer.deliveryZone === 'inside_dhaka' ? '24–48 hours' : '3–4 days')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#78716C]">{t.checkout.paymentMethod}</span>
            <span className="font-semibold text-[#1C1917]">
              {paymentMethodLabel(completedOrder.paymentMethod)}
            </span>
          </div>
          {completedOrder.paymentMethod === 'cod' && (
            <div className="flex justify-between text-amber-900 bg-amber-50 px-2.5 py-1.5 rounded-md border border-amber-200">
              <span className="font-medium">Cash on Delivery Handling</span>
              <span className="font-bold">+৳10</span>
            </div>
          )}
          {completedOrder.trxId && (
            <div className="flex justify-between">
              <span className="text-[#78716C]">bKash TrxID</span>
              <span className="font-mono font-bold text-pink-700">{completedOrder.trxId}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-[#1C1917] pt-3 border-t border-[#E7E0D6]">
            <span className="uppercase tracking-wider">{t.checkout.totalAmount}</span>
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
            {t.checkout.trackOrderLive}
          </Link>
          <Link href="/shop" className="boutique-btn-outline px-6 py-3.5">
            {t.checkout.continueShopping}
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
          {t.checkout.emptyBagTitle}
        </h2>
        <p className="mt-1.5 text-xs text-[#78716C]">
          {t.checkout.emptyBagDesc}
        </p>
        <Link href="/shop" className="mt-6 inline-flex boutique-btn-primary px-7 py-3.5">
          {t.hero.shopNow}
        </Link>
      </div>
    );
  }

  const renderOrderSummary = (isAuthGate: boolean) => (
    <div className="border border-[#E7E0D6] bg-white p-6 sm:p-8">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7B3E] mb-5">
        {t.checkout.orderSummary} ({items.length})
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
              <div className="text-[11px] text-[#78716C]">
                {t.productDetail.qty}: {quantity}
              </div>
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
          <span>{t.checkout.subtotal}</span>
          <span className="font-semibold text-[#1C1917]">{formatBDT(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>
            {t.checkout.delivery} ({deliveryZone === 'inside_dhaka' ? t.account.insideDhaka : t.account.outsideDhaka})
          </span>
          <span className="font-semibold text-[#1C1917]">
            {subtotal >= 1500 ? (
              <span className="text-emerald-700 font-bold uppercase tracking-wider text-[11px]">
                {t.checkout.freeShippingBadge}
              </span>
            ) : (
              formatBDT(deliveryFee)
            )}
          </span>
        </div>
        {codFee > 0 && (
          <div className="flex justify-between items-center bg-amber-50/80 border border-amber-200 px-2.5 py-1.5 rounded-md text-amber-900">
            <span className="font-medium">Cash on Delivery Handling</span>
            <span className="font-bold">+৳10</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>{t.checkout.selectedPayment}</span>
          <span className="font-semibold text-[#9A7B3E]">
            {paymentMethodLabel(paymentMethod)}
          </span>
        </div>
        <div className="flex justify-between pt-3 border-t border-[#E7E0D6] text-sm font-semibold text-[#1C1917]">
          <span className="uppercase tracking-wider text-xs">{t.checkout.total}</span>
          <span className="font-serif-display text-2xl font-bold text-[#1C1917]">
            {formatBDT(finalTotal)}
          </span>
        </div>
      </div>

      {isAuthGate ? (
        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('checkout-auth-card');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full boutique-btn-primary py-4 text-center cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-[#C5A059]" />
            <span>Sign In to Place Order</span>
          </button>
          <p className="text-[10px] text-center text-[#78716C]">
            Please sign in or create an account on the left to complete your order.
          </p>
        </div>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full boutique-btn-primary py-4 text-center cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? t.checkout.processing : t.checkout.confirmOrder}
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-14">
      <div className="mb-8 border-b border-[#E7E0D6] pb-5">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#78716C] hover:text-[#1C1917]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.checkout.continueShopping}</span>
        </Link>
        <h1 className="mt-3 font-serif-display text-3xl sm:text-5xl font-medium text-[#1C1917]">
          {t.checkout.title}
        </h1>
      </div>

      {!loggedInCustomer ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Auth Gate Card on Left */}
          <div className="lg:col-span-7 space-y-6">
            <div id="checkout-auth-card" className="border border-[#E7E0D6] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-[#9A7B3E]" />
                <h2 className="font-serif-display text-xl sm:text-2xl font-medium text-[#1C1917]">
                  Sign In to Place Your Order
                </h2>
              </div>
              <p className="text-xs text-[#78716C] mb-6">
                An account is required to place your order. Sign in or register below to auto-fill your delivery info and enable live courier tracking.
              </p>

              {/* Auth Mode Toggle Tabs */}
              <div className="flex border-b border-[#E7E0D6] mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                  className={`flex-1 pb-3 text-xs font-semibold uppercase tracking-wider transition border-b-2 -mb-px cursor-pointer ${
                    authMode === 'login'
                      ? 'border-[#9A7B3E] text-[#9A7B3E]'
                      : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                  }}
                  className={`flex-1 pb-3 text-xs font-semibold uppercase tracking-wider transition border-b-2 -mb-px cursor-pointer ${
                    authMode === 'register'
                      ? 'border-[#9A7B3E] text-[#9A7B3E]'
                      : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {authError && (
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50/80 px-3.5 py-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Login Tab */}
              {authMode === 'login' ? (
                <form onSubmit={handleCheckoutAuth} className="space-y-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
                        Mobile Phone Number or Email <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-[10px] text-[#78716C] font-mono">{authPhone.length}/30</span>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={30}
                      placeholder="017XXXXXXXX or user@example.com"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value.trim())}
                      className={`w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-xs text-[#1C1917] ${
                        !authPhone.includes('@') ? 'font-mono' : ''
                      } focus:bg-white focus:outline-none focus:border-[#C5A059]`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                      Password <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter your account password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthSubmitting}
                    className="w-full boutique-btn-primary py-3.5 text-center cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isAuthSubmitting ? 'Signing In...' : 'Sign In & Unlock Checkout'}</span>
                  </button>

                  <div className="pt-3 border-t border-[#E7E0D6] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#78716C]">
                    <span>New to MELO?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setAuthError(null);
                      }}
                      className="font-semibold text-[#9A7B3E] hover:underline cursor-pointer"
                    >
                      Create an account →
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleQuickDemoLogin}
                      disabled={isAuthSubmitting}
                      className="w-full border border-[#E7E0D6] bg-[#FAF7F2] hover:border-[#9A7B3E] py-2 text-[11px] font-semibold text-[#78716C] hover:text-[#1C1917] transition cursor-pointer"
                    >
                      ⚡ Fast Demo Sign In (Nusrat Jahan)
                    </button>
                  </div>
                </form>
              ) : (
                /* Registration Tab */
                <form onSubmit={handleCheckoutAuth} className="space-y-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
                        Full Name <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-[10px] text-[#78716C] font-mono">{authFullName.length}/30</span>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={30}
                      placeholder="Enter your full name"
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
                        Mobile Phone Number <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-[10px] text-[#78716C] font-mono">{authPhone.length}/11</span>
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={14}
                      placeholder="017XXXXXXXX"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(sanitizePhoneNumber(e.target.value))}
                      className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-xs text-[#1C1917] font-mono focus:bg-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
                        Password <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-[10px] text-[#78716C] font-mono">{authPassword.length}/40</span>
                    </div>
                    <input
                      type="password"
                      required
                      maxLength={40}
                      placeholder="Create a password (min 6 characters)"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
                        Email Address <span className="text-[#A8A29E] font-normal lowercase">(optional — for invoices)</span>
                      </label>
                      <span className="text-[10px] text-[#78716C] font-mono">{authEmail.length}/30</span>
                    </div>
                    <input
                      type="email"
                      maxLength={30}
                      placeholder="customer@gmail.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
                        Complete Delivery Address <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-[10px] text-[#78716C] font-mono">{authAddress.length}/250</span>
                    </div>
                    <textarea
                      required
                      rows={2}
                      maxLength={250}
                      placeholder="House, road, area, city..."
                      value={authAddress}
                      onChange={(e) => setAuthAddress(e.target.value)}
                      className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                      Delivery Location <span className="text-rose-600">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAuthZone('inside_dhaka')}
                        className={`border p-3 text-left transition cursor-pointer ${
                          authZone === 'inside_dhaka'
                            ? 'border-[#C5A059] bg-[#FAF7F2] text-[#1C1917]'
                            : 'border-[#E7E0D6] bg-white text-[#78716C] hover:border-[#D6CFC5]'
                        }`}
                      >
                        <div className="font-semibold text-xs text-[#1C1917]">Inside Dhaka</div>
                        <div className="text-[11px] text-[#78716C] mt-0.5">৳60 delivery</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthZone('outside_dhaka')}
                        className={`border p-3 text-left transition cursor-pointer ${
                          authZone === 'outside_dhaka'
                            ? 'border-[#C5A059] bg-[#FAF7F2] text-[#1C1917]'
                            : 'border-[#E7E0D6] bg-white text-[#78716C] hover:border-[#D6CFC5]'
                        }`}
                      >
                        <div className="font-semibold text-xs text-[#1C1917]">Outside Dhaka</div>
                        <div className="text-[11px] text-[#78716C] mt-0.5">৳120 delivery</div>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthSubmitting}
                    className="w-full boutique-btn-primary py-3.5 text-center cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>{isAuthSubmitting ? 'Creating Account...' : 'Create Account & Continue'}</span>
                  </button>

                  <div className="pt-3 border-t border-[#E7E0D6] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#78716C]">
                    <span>Already have an account?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError(null);
                      }}
                      className="font-semibold text-[#9A7B3E] hover:underline cursor-pointer"
                    >
                      Sign in instead →
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Summary: Items & Price Breakdown */}
          <div className="lg:col-span-5">
            <div className="sticky top-28">
              {renderOrderSummary(true)}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Form: Customer & Delivery Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Info Card */}
            <div className="border border-[#E7E0D6] bg-white p-6 sm:p-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7B3E] mb-6">
                1. {t.checkout.customerInfo}
              </h2>

              <div className="mb-6 rounded-lg border border-[#C5A059]/40 bg-[#FAF7F2] p-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#9A7B3E] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm text-[#1C1917]">
                        Logged in as <span className="text-[#9A7B3E]">{loggedInCustomer.fullName}</span>
                      </div>
                      <p className="text-[#78716C] text-xs mt-0.5">
                        Your saved contact and delivery details ({loggedInCustomer.phone}) have been auto-filled. You may update them for this order below.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setFullName(loggedInCustomer.fullName || '');
                        setPhone(loggedInCustomer.phone || '');
                        setEmail(loggedInCustomer.email || '');
                        setAddress(loggedInCustomer.defaultAddress || '');
                        if (loggedInCustomer.deliveryZone) {
                          setDeliveryZone(loggedInCustomer.deliveryZone);
                        }
                      }}
                      className="text-[11px] font-semibold text-[#9A7B3E] hover:underline cursor-pointer"
                      title="Reset form fields to your saved account profile"
                    >
                      Reset to Saved
                    </button>
                    <span className="text-[#D6CEBF]">•</span>
                    <Link
                      href="/account"
                      className="text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] hover:text-[#9A7B3E]"
                    >
                      My Account
                    </Link>
                  </div>
                </div>
              </div>

            <div className="space-y-5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
                    {t.checkout.fullName} <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] text-[#78716C] font-mono">
                    {fullName.length}/30
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={30}
                  placeholder={t.checkout.fullNamePlaceholder}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  className={`w-full border px-3.5 py-2.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none ${
                    nameError
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                      : 'border-[#D6CFC5] bg-[#FAF7F2]/50 focus:border-[#C5A059]'
                  }`}
                />
                {nameError && (
                  <p className="mt-1.5 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{nameError}</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
                    {t.checkout.phone} <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] text-[#78716C] font-mono">
                    {phone.length}/11 digits
                  </span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={14}
                  placeholder={t.checkout.phonePlaceholder}
                  value={phone}
                  onChange={(e) => {
                    const sanitized = sanitizePhoneNumber(e.target.value);
                    setPhone(sanitized);
                    if (phoneError) setPhoneError(null);
                  }}
                  className={`w-full border px-3.5 py-2.5 text-xs text-[#1C1917] font-mono focus:bg-white focus:outline-none ${
                    phoneError
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                      : 'border-[#D6CFC5] bg-[#FAF7F2]/50 focus:border-[#C5A059]'
                  }`}
                />
                {phoneError ? (
                  <p className="mt-1.5 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{phoneError}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-[10px] text-[#A8A29E]">
                    Standard 11-digit mobile number (e.g., 017XXXXXXXX)
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
                    Email Address <span className="text-[#A8A29E] font-normal lowercase tracking-normal">(optional — to receive your invoice copy)</span>
                  </label>
                  <span className="text-[10px] text-[#78716C] font-mono">
                    {email.length}/30
                  </span>
                </div>
                <input
                  type="email"
                  maxLength={30}
                  placeholder="e.g. customer@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  className={`w-full border px-3.5 py-2.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none ${
                    emailError
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                      : 'border-[#D6CFC5] bg-[#FAF7F2]/50 focus:border-[#C5A059]'
                  }`}
                />
                {emailError && (
                  <p className="mt-1.5 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
                    {t.checkout.address} <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] text-[#78716C] font-mono">
                    {address.length}/250
                  </span>
                </div>
                <textarea
                  required
                  rows={3}
                  maxLength={250}
                  placeholder={t.checkout.addressPlaceholder}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (addressError) setAddressError(null);
                  }}
                  className={`w-full border px-3.5 py-2.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none ${
                    addressError
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                      : 'border-[#D6CFC5] bg-[#FAF7F2]/50 focus:border-[#C5A059]'
                  }`}
                />
                {addressError && (
                  <p className="mt-1.5 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{addressError}</span>
                  </p>
                )}
              </div>

              {/* Delivery Zone Selector */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                  {t.checkout.deliveryZone}
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
                      <div className="font-semibold text-[#1C1917]">{t.checkout.insideDhaka}</div>
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
                      <div className="font-semibold text-[#1C1917]">{t.checkout.outsideDhaka}</div>
                    </div>
                    <span className="font-serif-display text-lg font-bold text-[#1C1917]">৳120</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
                    {t.checkout.notes}
                  </label>
                  <span className="text-[10px] text-[#78716C] font-mono">
                    {notes.length}/200
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={200}
                  placeholder={t.checkout.notesPlaceholder}
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
                2. {t.checkout.selectPayment}
              </h2>
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
                        <span className="font-semibold text-pink-700">{t.checkout.bkashTitle}</span>
                        <span className="border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800 rounded-sm">
                          Save ৳10
                        </span>
                      </div>
                      <div className="text-[#78716C] text-[11px] mt-0.5">
                        {t.checkout.bkashDesc}
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
                          {t.checkout.bkashNumber}
                        </div>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="font-mono text-lg font-bold text-pink-700">
                            {storeBkashNumber}
                          </span>
                          <span className="text-[11px] text-[#78716C]">
                            • {t.checkout.total}: <strong className="text-[#1C1917]">{formatBDT(total)}</strong>
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
                            <span>{t.checkout.copied}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t.checkout.copy}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#1C1917]">
                            {t.checkout.trxId} <span className="text-rose-600">*</span>
                          </label>
                          <span className="text-[9px] text-[#78716C] font-mono">
                            {trxId.length}/15
                          </span>
                        </div>
                        <input
                          type="text"
                          required={paymentMethod === 'bkash'}
                          maxLength={15}
                          placeholder={t.checkout.trxIdPlaceholder}
                          value={trxId}
                          onChange={(e) => {
                            const clean = sanitizeTrxId(e.target.value);
                            setTrxId(clean);
                            if (trxIdError) setTrxIdError(null);
                          }}
                          className={`w-full border px-3.5 py-2 text-xs font-mono uppercase focus:outline-none ${
                            trxIdError
                              ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                              : 'border-pink-300 focus:border-pink-600'
                          }`}
                        />
                        {trxIdError && (
                          <p className="mt-1 text-[10px] font-medium text-rose-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                            <span>{trxIdError}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#1C1917]">
                            {t.checkout.senderPhone}
                          </label>
                          <span className="text-[9px] text-[#78716C] font-mono">
                            {bkashSenderNumber.length}/11
                          </span>
                        </div>
                        <input
                          type="tel"
                          maxLength={14}
                          placeholder={t.checkout.senderPhonePlaceholder}
                          value={bkashSenderNumber}
                          onChange={(e) => {
                            const clean = sanitizePhoneNumber(e.target.value);
                            setBkashSenderNumber(clean);
                            if (senderPhoneError) setSenderPhoneError(null);
                          }}
                          className={`w-full border px-3.5 py-2 text-xs font-mono focus:outline-none ${
                            senderPhoneError
                              ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                              : 'border-[#D6CFC5] focus:border-pink-600'
                          }`}
                        />
                        {senderPhoneError && (
                          <p className="mt-1 text-[10px] font-medium text-rose-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                            <span>{senderPhoneError}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Credit / Debit Card (Hidden for now until gateway is enabled) */}
              {SHOW_CARD_PAYMENT && (
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
                            {t.checkout.cardTitle}
                          </span>
                        </div>
                        <div className="text-[#78716C] text-[11px] mt-0.5">
                          {t.checkout.cardDesc}
                        </div>
                      </div>
                    </div>
                    <CreditCard className="w-4 h-4 text-[#9A7B3E] flex-shrink-0" />
                  </label>
                </div>
              )}

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
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1C1917]">{t.checkout.codTitle}</span>
                      <span className="border border-amber-300 bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-900 rounded-sm">
                        +৳10 COD Fee
                      </span>
                    </div>
                    <div className="text-[#78716C] text-[11px] mt-0.5">
                      {t.checkout.codDesc} (includes +৳10 courier COD handling fee)
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
          <div className="sticky top-28">
            {renderOrderSummary(false)}
          </div>
        </div>
      </form>
      )}
    </div>
  );
}

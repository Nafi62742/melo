'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { customerService, CUSTOMER_AUTH_CHANGED_EVENT } from '@/core/services/customer.service';
import { orderService } from '@/core/services/order.service';
import { CustomerProfile } from '@/core/models/customer.model';
import { Order, DeliveryZone } from '@/core/models/order.model';
import { formatBDT } from '@/core/utils/currency.util';
import { useI18n } from '@/core/i18n/i18n.context';
import {
  User,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  LogOut,
  ArrowLeft,
  Search,
  ExternalLink,
  MapPin,
  Phone,
  AlertCircle,
  XCircle,
} from 'lucide-react';

const emptySubscribe = () => () => {};

export function AccountFeature() {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!isMounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs uppercase tracking-widest text-[#78716C] font-mono">
          Loading Account Portal...
        </span>
      </div>
    );
  }

  return <AccountContent />;
}

function AccountContent() {
  const router = useRouter();
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect');
  const initialQuery = searchParams?.get('orderNumber') || searchParams?.get('phone') || '';

  const [customer, setCustomer] = useState<CustomerProfile | null>(() =>
    customerService.getCurrentCustomer()
  );
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Sync customer auth when changed in other tabs or components
  useEffect(() => {
    const handleAuthChange = () => {
      setCustomer(customerService.getCurrentCustomer());
    };
    window.addEventListener(CUSTOMER_AUTH_CHANGED_EVENT, handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener(CUSTOMER_AUTH_CHANGED_EVENT, handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Auth Form Fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('inside_dhaka');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field-level Validation Error States
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Sanitization and Validation Utilities
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

  const validateBdPhone = (val: string): boolean => {
    const clean = val.replace(/[\s\-\(\)]/g, '').trim();
    return /^(?:\+?8801|01)[3-9]\d{8}$/.test(clean);
  };

  const validateEmail = (val: string): boolean => {
    if (!val.trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const clearValidationErrors = () => {
    setAuthError(null);
    setNameError(null);
    setPhoneError(null);
    setPasswordError(null);
    setEmailError(null);
    setAddressError(null);
  };

  // Customer Orders & TrxID State
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrderTrx, setEditingOrderTrx] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Order Lookup State (Search by Order # or Mobile Phone)
  const [lookupOrderNo, setLookupOrderNo] = useState(initialQuery);
  const [lookupResults, setLookupResults] = useState<Order[]>([]);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) {
      if (initialQuery) {
        void orderService.syncFromDatabase().then(() => {
          const found = orderService.trackOrders(initialQuery);
          if (found.length > 0) {
            setLookupResults(found);
          }
        });
      }
      return;
    }

    const loadCustomerOrders = async () => {
      await orderService.syncFromDatabase();
      const matched = orderService.getOrdersByPhone(customer.phone);
      setOrders(matched);
    };
    void loadCustomerOrders();
  }, [customer, initialQuery]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearValidationErrors();

    let hasError = false;

    if (authMode === 'login') {
      const cleanId = phone.trim();
      if (!cleanId) {
        setPhoneError('Please enter your mobile phone number or email address.');
        hasError = true;
      } else if (cleanId.includes('@')) {
        if (!validateEmail(cleanId)) {
          setPhoneError('Please enter a valid email address (e.g. user@example.com).');
          hasError = true;
        }
      } else if (!validateBdPhone(cleanId)) {
        setPhoneError('Please enter a valid 11-digit Bangladeshi mobile number or email address.');
        hasError = true;
      }

      if (!password.trim()) {
        setPasswordError('Please enter your password.');
        hasError = true;
      }

      if (hasError) return;

      setIsSubmitting(true);
      try {
        const loggedIn = await customerService.login(cleanId, password);
        if (loggedIn) {
          setCustomer(loggedIn);
          setToastMessage(`Welcome back, ${loggedIn.fullName}!`);
          if (redirectUrl) {
            router.push(redirectUrl);
            return;
          }
        } else {
          setAuthError('Invalid mobile/email or password. Please check your credentials or register an account.');
        }
      } catch {
        setAuthError('Authentication error. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // REGISTER MODE VALIDATION
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
        setPhoneError('Please enter a valid 11-digit Bangladeshi mobile number (e.g., 017XXXXXXXX).');
        hasError = true;
      }

      if (!password.trim()) {
        setPasswordError('Please enter a password.');
        hasError = true;
      } else if (password.trim().length < 6) {
        setPasswordError('Password must be at least 6 characters long.');
        hasError = true;
      } else if (password.length > 40) {
        setPasswordError('Password cannot exceed 40 characters.');
        hasError = true;
      }

      if (email.trim()) {
        if (email.trim().length > 30) {
          setEmailError('Email address cannot exceed 30 characters.');
          hasError = true;
        } else if (!validateEmail(email)) {
          setEmailError('Please enter a valid email address (e.g. user@example.com).');
          hasError = true;
        }
      }

      if (!address.trim() || address.trim().length < 5) {
        setAddressError('Please enter your delivery address (at least 5 characters).');
        hasError = true;
      } else if (address.trim().length > 250) {
        setAddressError('Address cannot exceed 250 characters.');
        hasError = true;
      }

      if (hasError) return;

      setIsSubmitting(true);
      try {
        const registered = await customerService.register({
          phone,
          fullName,
          password,
          email: email.trim() || undefined,
          defaultAddress: address,
          deliveryZone,
        });
        setCustomer(registered);
        setToastMessage(`Welcome to MELO, ${registered.fullName}!`);
        if (redirectUrl) {
          router.push(redirectUrl);
          return;
        }
      } catch {
        setAuthError('Registration error. Please check your details and try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleLogout = () => {
    customerService.logout();
    setCustomer(null);
    setOrders([]);
    setToastMessage('Signed out successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveOrderTrx = async (orderId: string) => {
    const val = editingOrderTrx[orderId]?.trim().toUpperCase();
    if (!val) return;
    orderService.updateOrderTrxId(orderId, val, customer?.phone);
    if (customer?.phone) {
      await customerService.addTrxIdToCustomer(customer.phone, val);
    }
    await orderService.syncFromDatabase();
    if (customer?.phone) {
      setOrders(orderService.getOrdersByPhone(customer.phone));
    }
    // Also update lookupResults if present
    setLookupResults((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, trxId: val } : o))
    );
    setEditingOrderTrx({ ...editingOrderTrx, [orderId]: '' });
    setToastMessage(`bKash TrxID ${val} submitted for verification!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleQuickLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setLookupResults([]);
    const q = lookupOrderNo.trim();
    if (!q) return;

    await orderService.syncFromDatabase();
    const found = orderService.trackOrders(q);
    if (found.length > 0) {
      setLookupResults(found);
    } else {
      setLookupError(
        'No orders found matching that Order Number or Phone Number. Please check your reference or sign in.'
      );
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#78716C] hover:text-[#1C1917] mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t.checkout.continueShopping}</span>
      </Link>

      {toastMessage && (
        <div className="mb-6 flex items-center gap-2 border border-[#C5A059] bg-white px-4 py-3 text-xs font-medium text-[#1C1917] shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-[#9A7B3E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {redirectUrl && customer && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#C5A059] bg-[#FAF7F2] p-4 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#9A7B3E] shrink-0" />
            <span className="text-[#1C1917] font-medium">
              You are signed in as <strong>{customer.fullName}</strong>. Ready to proceed?
            </span>
          </div>
          <Link
            href={redirectUrl}
            className="inline-flex items-center justify-center rounded bg-[#1C1917] px-4 py-2 text-[11px] font-semibold text-white uppercase tracking-wider hover:bg-[#9A7B3E] transition shrink-0"
          >
            Return to Checkout →
          </Link>
        </div>
      )}

      {!customer ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Customer Login / Registration Card */}
          <div className="lg:col-span-7 border border-[#E7E0D6] bg-white p-8 shadow-sm">
            <div className="border-b border-[#E7E0D6] pb-4 mb-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A7B3E] block">
                {t.account.portalTitle}
              </span>
              <h1 className="font-serif-display text-3xl font-medium text-[#1C1917] mt-1">
                {authMode === 'login' ? t.account.signInTitle : t.account.registerTitle}
              </h1>
              <p className="text-xs text-[#78716C] mt-1">
                {t.account.portalSubtitle}
              </p>
            </div>

            {/* Login / Register Toggle Tabs */}
            <div className="inline-flex border border-[#E7E0D6] p-1 bg-[#FAF7F2] mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  clearValidationErrors();
                }}
                className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-[#1C1917] text-[#FAF7F2]'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {t.account.signIn}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  clearValidationErrors();
                }}
                className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-[#1C1917] text-[#FAF7F2]'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {t.account.register}
              </button>
            </div>

            {authError && (
              <div className="mb-6 flex items-center gap-2 border border-rose-300 bg-rose-50/80 p-3 text-xs text-rose-800 rounded-md">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
                      {t.account.fullName} <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[10px] text-[#78716C] font-mono">
                      {fullName.length}/30
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    placeholder={t.account.fullNamePlaceholder}
                    className={`w-full border px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none ${
                      nameError
                        ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                        : 'border-[#D6CFC5] bg-white focus:border-[#C5A059]'
                    }`}
                  />
                  {nameError && (
                    <p className="mt-1.5 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{nameError}</span>
                    </p>
                  )}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
                    {authMode === 'login' ? 'Mobile Number or Email Address' : t.account.mobileNumber}{' '}
                    <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] text-[#78716C] font-mono">
                    {authMode === 'login' ? `${phone.length}/30` : `${phone.length}/11 digits`}
                  </span>
                </div>
                <input
                  type={authMode === 'login' ? 'text' : 'tel'}
                  required
                  maxLength={authMode === 'login' ? 30 : 14}
                  value={phone}
                  onChange={(e) => {
                    const val = authMode === 'login'
                      ? e.target.value.trim()
                      : sanitizePhoneNumber(e.target.value);
                    setPhone(val);
                    if (phoneError) setPhoneError(null);
                  }}
                  placeholder={
                    authMode === 'login'
                      ? '017XXXXXXXX or user@example.com'
                      : t.account.mobilePlaceholder
                  }
                  className={`w-full border px-3.5 py-2.5 text-xs text-[#1C1917] ${
                    authMode === 'login' && !phone.includes('@') ? 'font-mono' : ''
                  } focus:outline-none ${
                    phoneError
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                      : 'border-[#D6CFC5] bg-white focus:border-[#C5A059]'
                  }`}
                />
                {phoneError ? (
                  <p className="mt-1.5 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{phoneError}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-[10px] text-[#A8A29E]">
                    {authMode === 'login'
                      ? 'Enter your registered mobile phone number or email address'
                      : 'Standard 11-digit mobile number (e.g., 017XXXXXXXX)'}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
                    {t.account.password} <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] text-[#78716C] font-mono">
                    {password.length}/40
                  </span>
                </div>
                <input
                  type="password"
                  required
                  maxLength={40}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder={t.account.passwordPlaceholder}
                  className={`w-full border px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none ${
                    passwordError
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                      : 'border-[#D6CFC5] bg-white focus:border-[#C5A059]'
                  }`}
                />
                {passwordError ? (
                  <p className="mt-1.5 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </p>
                ) : authMode === 'register' ? (
                  <p className="mt-1 text-[10px] text-[#A8A29E]">
                    Minimum 6 characters
                  </p>
                ) : null}
              </div>

              {authMode === 'register' && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
                        {t.account.email} <span className="text-[#A8A29E] font-normal lowercase">(optional — for digital invoices)</span>
                      </label>
                      <span className="text-[10px] text-[#78716C] font-mono">
                        {email.length}/30
                      </span>
                    </div>
                    <input
                      type="email"
                      maxLength={30}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      placeholder={t.account.emailPlaceholder}
                      className={`w-full border px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none ${
                        emailError
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                          : 'border-[#D6CFC5] bg-white focus:border-[#C5A059]'
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
                        {t.account.defaultAddress} <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-[10px] text-[#78716C] font-mono">
                        {address.length}/250
                      </span>
                    </div>
                    <textarea
                      required
                      rows={2}
                      maxLength={250}
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (addressError) setAddressError(null);
                      }}
                      placeholder={t.account.addressPlaceholder}
                      className={`w-full border px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none ${
                        addressError
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                          : 'border-[#D6CFC5] bg-white focus:border-[#C5A059]'
                      }`}
                    />
                    {addressError && (
                      <p className="mt-1.5 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{addressError}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                      {t.account.deliveryLocation}
                    </label>
                    <select
                      value={deliveryZone}
                      onChange={(e) => setDeliveryZone(e.target.value as DeliveryZone)}
                      className="w-full border border-[#D6CFC5] bg-white px-3.5 py-2.5 text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="inside_dhaka">{t.account.insideDhaka} (৳60)</option>
                      <option value="outside_dhaka">{t.account.outsideDhaka} (৳120)</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full boutique-btn-primary py-3.5 text-xs uppercase tracking-wider mt-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting
                  ? t.checkout.processing
                  : authMode === 'login'
                  ? t.account.signIn
                  : t.account.register}
              </button>
            </form>
          </div>

          {/* Right Column: Instant Order Tracking Lookup (Guest or by Ref/Phone) */}
          <div className="lg:col-span-5 border border-[#E7E0D6] bg-white p-7 space-y-6 shadow-sm">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A7B3E] block">
                {t.account.trackQuickTitle}
              </span>
              <h2 className="font-serif-display text-2xl font-medium text-[#1C1917] mt-1">
                {t.account.trackButton}
              </h2>
              <p className="text-xs text-[#78716C] mt-1">
                {t.account.trackQuickSubtitle}
              </p>
            </div>

            <form onSubmit={handleQuickLookup} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={t.account.trackSearchPlaceholder}
                  value={lookupOrderNo}
                  onChange={(e) => setLookupOrderNo(e.target.value)}
                  className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 pl-9 pr-3 py-2.5 text-xs font-mono uppercase text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                />
                <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-3" />
              </div>
              <button type="submit" className="boutique-btn-primary px-5 py-2.5 cursor-pointer">
                {t.account.trackButton}
              </button>
            </form>

            {lookupError && (
              <div className="border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>{lookupError}</span>
              </div>
            )}

            {lookupResults.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="text-xs font-semibold text-[#1C1917]">
                  Found {lookupResults.length} matching order{lookupResults.length > 1 ? 's' : ''}:
                </div>
                {lookupResults.map((order) => (
                  <OrderTrackingDisplayCard
                    key={order.id}
                    order={order}
                    editingTrx={editingOrderTrx[order.id] || ''}
                    onChangeTrx={(val) =>
                      setEditingOrderTrx({ ...editingOrderTrx, [order.id]: val })
                    }
                    onSaveTrx={() => void handleSaveOrderTrx(order.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Authenticated Customer Dashboard */
        <div className="space-y-8">
          {/* Top Customer Profile Banner */}
          <div className="border border-[#E7E0D6] bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center border border-[#C5A059] bg-[#FAF7F2] text-[#9A7B3E]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif-display text-2xl sm:text-3xl font-medium text-[#1C1917]">
                    {customer.fullName}
                  </h1>
                  <span className="border border-[#E6D5B8] bg-[#FAF7F2] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#9A7B3E]">
                    Verified Member
                  </span>
                </div>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Phone: <strong className="text-[#1C1917]">{customer.phone}</strong>
                  {customer.defaultAddress ? ` • ${customer.defaultAddress}` : ''}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 border border-[#E7E0D6] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#78716C] hover:border-red-400 hover:text-red-700 transition cursor-pointer self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.account.signOut}</span>
            </button>
          </div>

          {/* Quick Order Lookup while Logged In */}
          <div className="border border-[#E7E0D6] bg-white p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
                {t.account.trackQuickTitle}
              </h3>
              <span className="text-xs text-[#78716C]">
                {t.account.trackQuickSubtitle}
              </span>
            </div>
            <form onSubmit={handleQuickLookup} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={t.account.trackSearchPlaceholder}
                  value={lookupOrderNo}
                  onChange={(e) => setLookupOrderNo(e.target.value)}
                  className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 pl-9 pr-3 py-2 text-xs font-mono uppercase text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                />
                <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-2.5" />
              </div>
              <button type="submit" className="boutique-btn-primary px-4 py-2 text-xs cursor-pointer">
                {t.account.trackButton}
              </button>
            </form>
          </div>

          {/* Customer Orders List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-display text-2xl font-medium text-[#1C1917]">
                {t.account.myOrders} ({orders.length})
              </h2>
              <span className="text-xs text-[#78716C]">
                Synced with your mobile number {customer.phone}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="border border-[#E7E0D6] bg-white p-12 text-center">
                <Package className="w-10 h-10 text-[#C5A059] mx-auto mb-3 stroke-[1.5]" />
                <h3 className="font-serif-display text-2xl font-medium text-[#1C1917]">
                  No Orders Placed Yet for {customer.phone}
                </h3>
                <p className="text-xs text-[#78716C] mt-1 max-w-md mx-auto">
                  When you check out on MELO using <strong className="text-[#1C1917]">{customer.phone}</strong>, your deliveries, bKash verification, and courier consignment details will appear here automatically.
                </p>
                <Link href="/shop" className="inline-block mt-5 boutique-btn-primary px-6 py-3">
                  Explore Collection
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <OrderTrackingDisplayCard
                  key={order.id}
                  order={order}
                  editingTrx={editingOrderTrx[order.id] || ''}
                  onChangeTrx={(val) =>
                    setEditingOrderTrx({ ...editingOrderTrx, [order.id]: val })
                  }
                  onSaveTrx={() => void handleSaveOrderTrx(order.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Reusable Customer Order & Tracking Card with Visual Stepper & Courier Links
 */
function OrderTrackingDisplayCard({
  order,
  editingTrx,
  onChangeTrx,
  onSaveTrx,
}: {
  order: Order;
  editingTrx: string;
  onChangeTrx: (val: string) => void;
  onSaveTrx: () => void;
}) {
  const { t } = useI18n();
  const steps = [
    { key: 'pending', label: t.account.statusPending },
    { key: 'confirmed', label: t.account.statusConfirmed },
    { key: 'dispatched', label: t.account.statusDispatched },
    { key: 'delivered', label: t.account.statusDelivered },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'dispatched':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(order.status);

  return (
    <div className="border border-[#E7E0D6] bg-white p-6 space-y-5 shadow-sm">
      {/* 1. Order Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E7E0D6] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-base font-bold text-[#1C1917]">
              {order.orderNumber}
            </span>
            <span className="border border-[#E6D5B8] bg-[#FAF7F2] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#9A7B3E]">
              {order.paymentMethod.toUpperCase()}
            </span>
            {order.customer.orderSource && order.customer.orderSource !== 'website' && (
              <span className="border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                {order.customer.orderSource}
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#78716C] mt-0.5" suppressHydrationWarning>
            Placed on {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-[#78716C]">
              {t.checkout.totalAmount}
            </div>
            <div className="font-serif-display text-xl font-bold text-[#1C1917]">
              {formatBDT(order.total)}
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md border ${
              order.status === 'delivered'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : order.status === 'dispatched'
                ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                : order.status === 'confirmed'
                ? 'bg-sky-50 text-sky-800 border-sky-300'
                : order.status === 'cancelled'
                ? 'bg-rose-50 text-rose-800 border-rose-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            {order.status === 'delivered' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : order.status === 'dispatched' ? (
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
            ) : order.status === 'confirmed' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
            ) : order.status === 'cancelled' ? (
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>
              {order.status === 'delivered'
                ? t.account.statusDelivered
                : order.status === 'dispatched'
                ? t.account.statusDispatched
                : order.status === 'confirmed'
                ? t.account.statusConfirmed
                : order.status === 'cancelled'
                ? t.account.statusCancelled
                : t.account.statusPending}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Visual 4-Step Fulfillment Stepper */}
      {order.status !== 'cancelled' ? (
        <div className="py-2">
          <div className="grid grid-cols-4 gap-2 relative">
            {steps.map((st, idx) => {
              const isPassed = idx <= currentStep;
              const isCurrent = idx === currentStep;
              const currentRingColor =
                order.status === 'delivered'
                  ? 'ring-2 ring-emerald-500'
                  : order.status === 'dispatched'
                  ? 'ring-2 ring-indigo-500'
                  : order.status === 'confirmed'
                  ? 'ring-2 ring-sky-500'
                  : 'ring-2 ring-amber-500';

              return (
                <div key={st.key} className="flex flex-col items-center text-center">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border transition ${
                      isPassed
                        ? 'bg-[#1C1917] text-[#FAF7F2] border-[#1C1917]'
                        : 'bg-white text-[#A8A29E] border-[#E7E0D6]'
                    } ${isCurrent ? currentRingColor : ''}`}
                  >
                    {isPassed ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`mt-1.5 text-[10px] font-semibold tracking-tight ${
                      isPassed ? 'text-[#1C1917]' : 'text-[#A8A29E]'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-3 border border-red-200 bg-red-50 text-xs text-red-800 font-semibold">
          This order was cancelled. Please contact our support team if you have any questions.
        </div>
      )}

      {/* 3. Live Courier Tracking Banner (Pathao / Steadfast / etc.) */}
      {(order.trackingNumber || order.courierName) && (
        <div className="border border-[#C5A059] bg-[#FAF7F2] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A7B3E]">
              Courier Consignment Details
            </div>
            <div className="font-semibold text-sm text-[#1C1917] mt-0.5">
              Shipped via <span className="text-[#9A7B3E] font-bold">{order.courierName || 'Partner Courier'}</span>
            </div>
            <div className="font-mono text-xs font-bold text-[#1C1917] mt-0.5">
              Consignment ID: {order.trackingNumber || 'Available upon pickup'}
            </div>
            {order.estimatedDelivery && (
              <div className="text-[11px] text-[#78716C] mt-0.5">
                Estimated Delivery: <strong className="text-[#1C1917]">{order.estimatedDelivery}</strong>
              </div>
            )}
          </div>

          {order.courierTrackingUrl && (
            <a
              href={order.courierTrackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 boutique-btn-primary px-4 py-2 text-xs uppercase tracking-wider self-start sm:self-auto"
            >
              <span>Track on Courier Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* 4. Customer Delivery Address & Zone Info */}
      <div className="text-xs text-[#78716C] border-t border-[#E7E0D6] pt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#9A7B3E]" />
          <span>
            Deliver to: <strong className="text-[#1C1917]">{order.customer.fullName}</strong> • {order.customer.address} (
            {order.customer.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka ৳60' : 'Outside Dhaka ৳120'})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Phone className="w-3 h-3 text-[#9A7B3E]" />
          <span>{order.customer.phone}</span>
        </div>
      </div>

      {/* 5. Products in this Order */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 border-t border-[#E7E0D6] pt-3">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 border border-[#E7E0D6] bg-[#FAF7F2]/50 p-2.5"
          >
            <div className="relative h-12 w-10 flex-shrink-0 overflow-hidden bg-[#F3EDE4]">
              <Image
                src={item.product.imageUrl}
                alt={item.product.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <div className="font-medium text-[#1C1917] truncate">{item.product.name}</div>
              <div className="text-[11px] text-[#78716C]">
                Qty: {item.quantity} × {formatBDT(item.product.priceBDT)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 6. bKash TrxID & Payment Status Bar */}
      <div className="border-t border-[#E7E0D6] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-[#1C1917]">Payment:</span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
              order.paymentStatus === 'verified'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : order.paymentStatus === 'failed'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {order.paymentStatus === 'verified' ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Payment Verified ✓</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3" />
                <span>
                  {order.paymentMethod === 'cod'
                    ? 'Cash on Delivery (Pay upon Receipt)'
                    : 'Pending bKash TrxID Verification'}
                </span>
              </>
            )}
          </span>

          {order.trxId && (
            <span className="border border-pink-200 bg-pink-50 px-2.5 py-1 font-mono text-xs font-bold text-pink-900 break-all max-w-xs" title={order.trxId}>
              TrxID: {order.trxId}
            </span>
          )}
        </div>

        {/* Input to submit or update bKash TrxID */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            maxLength={15}
            placeholder={order.trxId ? 'Update bKash TrxID' : 'Add bKash TrxID'}
            value={editingTrx}
            onChange={(e) => onChangeTrx(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15))}
            className="border border-[#D6CFC5] bg-[#FAF7F2]/60 px-2.5 py-1.5 text-xs font-mono uppercase text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059] w-44"
          />
          <button
            type="button"
            onClick={onSaveTrx}
            disabled={!editingTrx.trim()}
            className="boutique-btn-outline px-3 py-1.5 text-[10px] disabled:opacity-40 cursor-pointer"
          >
            Save TrxID
          </button>
        </div>
      </div>
    </div>
  );
}

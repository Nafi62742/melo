'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { customerService } from '@/core/services/customer.service';
import { orderService } from '@/core/services/order.service';
import { adminService } from '@/core/services/admin.service';
import { CustomerProfile } from '@/core/models/customer.model';
import { Order, DeliveryZone } from '@/core/models/order.model';
import { formatBDT } from '@/core/utils/currency.util';
import {
  User,
  Package,
  Smartphone,
  CheckCircle2,
  Clock,
  Truck,
  LogOut,
  ArrowLeft,
  Sparkles,
  Plus,
  Search,
} from 'lucide-react';

export function AccountFeature() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerProfile | null>(() =>
    customerService.getCurrentCustomer()
  );
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Auth Form Fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('inside_dhaka');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer Orders & TrxID State
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrderTrx, setEditingOrderTrx] = useState<Record<string, string>>({});
  const [newTrxInput, setNewTrxInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Order Lookup (even before login or for specific order number)
  const [lookupOrderNo, setLookupOrderNo] = useState('');
  const [lookupResult, setLookupResult] = useState<Order | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) return;
    const loadCustomerOrders = async () => {
      await orderService.syncFromDatabase();
      const matched = orderService.getOrdersByPhone(customer.phone);
      setOrders(matched);
    };
    void loadCustomerOrders();
  }, [customer]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        // Check if logging in with Admin credentials via AdminService
        const isAdmin = await adminService.login(phone, password);
        if (isAdmin) {
          router.push('/admin');
          return;
        }

        const loggedIn = await customerService.login(phone, password);
        if (!loggedIn) {
          setAuthError('Invalid phone/email or password. New customer? Switch to Register.');
          setIsSubmitting(false);
          return;
        }
        setCustomer(loggedIn);
      } else {
        if (!fullName.trim() || !phone.trim() || !password.trim()) {
          setAuthError('Please fill in your name, phone number, and password.');
          setIsSubmitting(false);
          return;
        }
        const registered = await customerService.register({
          phone,
          fullName,
          password,
          email,
          defaultAddress: address,
          deliveryZone,
        });
        setCustomer(registered);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    customerService.logout();
    setCustomer(null);
    setOrders([]);
  };

  const handleSaveOrderTrx = async (orderId: string) => {
    const trxValue = (editingOrderTrx[orderId] || '').trim().toUpperCase();
    if (!trxValue || !customer) return;

    orderService.updateOrderTrxId(orderId, trxValue, customer.phone);
    await customerService.addTrxIdToCustomer(customer.phone, trxValue);
    setCustomer(customerService.getCurrentCustomer());
    setOrders(orderService.getOrdersByPhone(customer.phone));
    setToastMessage(`bKash TrxID ${trxValue} saved to your order and profile!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddStandaloneTrx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrxInput.trim() || !customer) return;
    const clean = newTrxInput.trim().toUpperCase();
    await customerService.addTrxIdToCustomer(customer.phone, clean);
    setCustomer(customerService.getCurrentCustomer());
    setNewTrxInput('');
    setToastMessage(`Saved bKash TrxID ${clean} to your account!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleQuickLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setLookupResult(null);
    if (!lookupOrderNo.trim()) return;
    await orderService.syncFromDatabase();
    const found = orderService.getOrderById(lookupOrderNo.trim());
    if (found) {
      setLookupResult(found);
    } else {
      setLookupError('No order found with that Order Number. Sign in with your phone number to see all your orders.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#78716C] hover:text-[#1C1917] mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Continue Shopping</span>
      </Link>

      {toastMessage && (
        <div className="mb-6 flex items-center gap-2 border border-[#C5A059] bg-white px-4 py-3 text-xs font-medium text-[#1C1917] shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-[#9A7B3E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {!customer ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Customer Login / Registration Card */}
          <div className="lg:col-span-7 border border-[#C5A059] bg-white p-8 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E7E0D6] pb-5 mb-6">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A7B3E] block">
                  MELO Client Portal
                </span>
                <h1 className="font-serif-display text-3xl font-medium text-[#1C1917] mt-1">
                  {authMode === 'login' ? 'Sign In to Track Orders' : 'Create Your MELO Account'}
                </h1>
              </div>

              <div className="flex border border-[#E7E0D6] bg-[#FAF7F2] p-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                  className={`px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-[#1C1917] text-[#FAF7F2]'
                      : 'text-[#78716C] hover:text-[#1C1917]'
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
                  className={`px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-[#1C1917] text-[#FAF7F2]'
                      : 'text-[#78716C] hover:text-[#1C1917]'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {authError && (
              <div className="mb-5 border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium text-red-800">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nusrat Jahan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                    {authMode === 'login' ? 'Mobile Number or Email *' : 'Mobile Number (BD) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={authMode === 'login' ? '017XXXXXXXX or melo@gmail.com' : '017XXXXXXXX'}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                      Default Delivery Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="House, Road, Area, District"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                        Delivery Zone
                      </label>
                      <select
                        value={deliveryZone}
                        onChange={(e) => setDeliveryZone(e.target.value as DeliveryZone)}
                        className="w-full border border-[#D6CFC5] bg-white px-3.5 py-2.5 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="inside_dhaka">Inside Dhaka (৳60)</option>
                        <option value="outside_dhaka">Outside Dhaka (৳120)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full boutique-btn-primary py-3.5 mt-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Please wait...'
                  : authMode === 'login'
                  ? 'Sign In & View My Orders'
                  : 'Create Account & Track Orders'}
              </button>
            </form>
          </div>

          {/* Right Column: Quick Order Number Lookup */}
          <div className="lg:col-span-5 border border-[#E7E0D6] bg-white p-7 space-y-5">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A7B3E] block">
                Instant Order Check
              </span>
              <h2 className="font-serif-display text-2xl font-medium text-[#1C1917] mt-1">
                Track by Order Number
              </h2>
              <p className="text-xs text-[#78716C] mt-1">
                Enter your <code className="bg-[#FAF7F2] px-1.5 py-0.5 text-[#1C1917]">MELO-XXXXXX</code> order number to check delivery and bKash verification status.
              </p>
            </div>

            <form onSubmit={handleQuickLookup} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. MELO-123456"
                  value={lookupOrderNo}
                  onChange={(e) => setLookupOrderNo(e.target.value)}
                  className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 pl-9 pr-3 py-2.5 text-xs font-mono uppercase text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                />
                <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-3" />
              </div>
              <button type="submit" className="boutique-btn-primary px-5 py-2.5 cursor-pointer">
                Track
              </button>
            </form>

            {lookupError && (
              <div className="border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                {lookupError}
              </div>
            )}

            {lookupResult && (
              <div className="border border-[#C5A059] bg-[#FAF7F2] p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#1C1917]">{lookupResult.orderNumber}</span>
                  <span className="uppercase tracking-wider text-[10px] font-semibold px-2.5 py-0.5 bg-[#1C1917] text-[#FAF7F2]">
                    {lookupResult.status}
                  </span>
                </div>
                <div className="text-[#78716C]">
                  Total: <strong className="text-[#1C1917]">{formatBDT(lookupResult.total)}</strong> • Payment:{' '}
                  <strong className="uppercase text-[#1C1917]">{lookupResult.paymentMethod}</strong>
                </div>
                {lookupResult.trxId && (
                  <div className="border-t border-[#E7E0D6] pt-2 flex items-center justify-between">
                    <span className="text-[#78716C]">
                      bKash TrxID: <strong className="font-mono text-[#1C1917]">{lookupResult.trxId}</strong>
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 ${
                        lookupResult.paymentStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {lookupResult.paymentStatus === 'verified' ? 'Verified ✓' : 'Pending Check'}
                    </span>
                  </div>
                )}
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
              <span>Sign Out</span>
            </button>
          </div>

          {/* Saved bKash TrxIDs Wallet Card */}
          <div className="border border-[#E7E0D6] bg-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D6]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center bg-pink-50 border border-pink-200 text-pink-700">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif-display text-xl font-medium text-[#1C1917]">
                    My Saved bKash Transaction IDs (TrxID)
                  </h2>
                  <p className="text-xs text-[#78716C]">
                    Your submitted bKash TrxID numbers are saved here for fast verification by MELO Admin.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddStandaloneTrx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter bKash TrxID (e.g. BKJ82910XY)"
                  value={newTrxInput}
                  onChange={(e) => setNewTrxInput(e.target.value.toUpperCase())}
                  className="border border-[#D6CFC5] bg-[#FAF7F2]/60 px-3 py-2 text-xs font-mono uppercase text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059] w-56"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 boutique-btn-primary px-4 py-2 text-[10px] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save TrxID</span>
                </button>
              </form>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {customer.savedTrxIds && customer.savedTrxIds.length > 0 ? (
                customer.savedTrxIds.map((trx) => (
                  <span
                    key={trx}
                    className="inline-flex items-center gap-1.5 border border-pink-200 bg-pink-50/70 px-3 py-1 text-xs font-mono font-bold text-pink-900"
                  >
                    <Sparkles className="w-3 h-3 text-pink-600" />
                    <span>{trx}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#78716C]">
                  No bKash TrxIDs saved yet. Any TrxID you enter at checkout or above is automatically saved here.
                </span>
              )}
            </div>
          </div>

          {/* Customer Orders List */}
          <div className="space-y-4">
            <h2 className="font-serif-display text-2xl font-medium text-[#1C1917]">
              My Orders &amp; Delivery Tracking ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <div className="border border-[#E7E0D6] bg-white p-12 text-center">
                <Package className="w-10 h-10 text-[#C5A059] mx-auto mb-3 stroke-[1.5]" />
                <h3 className="font-serif-display text-2xl font-medium text-[#1C1917]">
                  No Orders Found for {customer.phone}
                </h3>
                <p className="text-xs text-[#78716C] mt-1 max-w-md mx-auto">
                  When you place an order at checkout using <strong className="text-[#1C1917]">{customer.phone}</strong>, it will appear here automatically with live status updates.
                </p>
                <Link href="/shop" className="inline-block mt-5 boutique-btn-primary px-6 py-3">
                  Explore Collection
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="border border-[#E7E0D6] bg-white p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E7E0D6] pb-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-bold text-[#1C1917]">
                          {order.orderNumber}
                        </span>
                        <span className="border border-[#E6D5B8] bg-[#FAF7F2] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#9A7B3E]">
                          {order.paymentMethod.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#78716C] mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-[#78716C]">
                          Order Total
                        </div>
                        <div className="font-serif-display text-2xl font-semibold text-[#1C1917]">
                          {formatBDT(order.total)}
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 bg-[#181512] text-[#FAF7F2] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider">
                        <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>{order.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.map((item) => (
                      <div
                        key={item.product.id}
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
                          <div className="font-medium text-[#1C1917] truncate">
                            {item.product.name}
                          </div>
                          <div className="text-[11px] text-[#78716C]">
                            Qty: {item.quantity} × {formatBDT(item.product.priceBDT)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* bKash TrxID & Payment Verification Bar */}
                  <div className="border-t border-[#E7E0D6] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-semibold text-[#1C1917]">Payment Status:</span>
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
                                ? 'Pay on Delivery (COD)'
                                : 'Pending Admin Verification'}
                            </span>
                          </>
                        )}
                      </span>

                      {order.trxId && (
                        <span className="border border-pink-200 bg-pink-50 px-2.5 py-1 font-mono text-xs font-bold text-pink-900">
                          bKash TrxID: {order.trxId}
                        </span>
                      )}
                    </div>

                    {/* Allow customer to attach or update bKash TrxID on this order */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={order.trxId ? 'Update bKash TrxID' : 'Add bKash TrxID'}
                        value={editingOrderTrx[order.id] ?? ''}
                        onChange={(e) =>
                          setEditingOrderTrx({
                            ...editingOrderTrx,
                            [order.id]: e.target.value.toUpperCase(),
                          })
                        }
                        className="border border-[#D6CFC5] bg-[#FAF7F2]/60 px-2.5 py-1.5 text-xs font-mono uppercase text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059] w-44"
                      />
                      <button
                        type="button"
                        onClick={() => void handleSaveOrderTrx(order.id)}
                        className="boutique-btn-outline px-3 py-1.5 text-[10px] cursor-pointer"
                      >
                        Save TrxID
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { customerService } from '@/core/services/customer.service';
import { orderService } from '@/core/services/order.service';
import { CustomerProfile } from '@/core/models/customer.model';
import { Order, DeliveryZone } from '@/core/models/order.model';
import { formatBDT } from '@/core/utils/currency.util';
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
} from 'lucide-react';

export function AccountFeature() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('orderNumber') || searchParams?.get('phone') || '';

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
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        const loggedIn = await customerService.login(phone, password);
        if (loggedIn) {
          setCustomer(loggedIn);
          setToastMessage(`Welcome back, ${loggedIn.fullName}!`);
        } else {
          setAuthError('Invalid phone number or password. Please check your credentials.');
        }
      } else {
        if (!fullName.trim() || !phone.trim() || !password.trim()) {
          setAuthError('Please fill in your name, mobile number, and password.');
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
        setToastMessage(`Welcome to MELO, ${registered.fullName}!`);
      }
    } catch {
      setAuthError('Authentication error. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          <div className="lg:col-span-7 border border-[#E7E0D6] bg-white p-8 shadow-sm">
            <div className="border-b border-[#E7E0D6] pb-4 mb-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A7B3E] block">
                MELO Customer Portal
              </span>
              <h1 className="font-serif-display text-3xl font-medium text-[#1C1917] mt-1">
                {authMode === 'login' ? 'Sign In to View All Orders' : 'Create Your MELO Account'}
              </h1>
              <p className="text-xs text-[#78716C] mt-1">
                Sign in with your mobile number to view purchase history, saved delivery addresses, and tracked shipments.
              </p>
            </div>

            {/* Login / Register Toggle Tabs */}
            <div className="inline-flex border border-[#E7E0D6] p-1 bg-[#FAF7F2] mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
                className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer ${
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
                className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-[#1C1917] text-[#FAF7F2]'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Register
              </button>
            </div>

            {authError && (
              <div className="mb-6 border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nusrat Jahan"
                    className="w-full border border-[#D6CFC5] bg-white px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full border border-[#D6CFC5] bg-white px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-[#D6CFC5] bg-white px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nusrat@example.com"
                      className="w-full border border-[#D6CFC5] bg-white px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                      Delivery Address
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House, Road, Area, City"
                      className="w-full border border-[#D6CFC5] bg-white px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                      Default Delivery Zone
                    </label>
                    <select
                      value={deliveryZone}
                      onChange={(e) => setDeliveryZone(e.target.value as DeliveryZone)}
                      className="w-full border border-[#D6CFC5] bg-white px-3.5 py-2.5 text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="inside_dhaka">Inside Dhaka (৳60)</option>
                      <option value="outside_dhaka">Outside Dhaka (৳120)</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full boutique-btn-primary py-3.5 text-xs uppercase tracking-wider mt-2 cursor-pointer"
              >
                {isSubmitting
                  ? 'Processing...'
                  : authMode === 'login'
                  ? 'Sign In & View My Orders'
                  : 'Create Account & Track Orders'}
              </button>
            </form>
          </div>

          {/* Right Column: Instant Order Tracking Lookup (Guest or by Ref/Phone) */}
          <div className="lg:col-span-5 border border-[#E7E0D6] bg-white p-7 space-y-6 shadow-sm">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A7B3E] block">
                Instant Order Check
              </span>
              <h2 className="font-serif-display text-2xl font-medium text-[#1C1917] mt-1">
                Track by Order # or Mobile Phone
              </h2>
              <p className="text-xs text-[#78716C] mt-1">
                Enter your <code className="bg-[#FAF7F2] px-1.5 py-0.5 text-[#1C1917]">MELO-XXXXXX</code> reference number or the mobile number used at checkout.
              </p>
            </div>

            <form onSubmit={handleQuickLookup} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. MELO-123456 or 017XXXXXXXX"
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
              <span>Sign Out</span>
            </button>
          </div>

          {/* Quick Order Lookup while Logged In */}
          <div className="border border-[#E7E0D6] bg-white p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
                Quick Reference Lookup
              </h3>
              <span className="text-xs text-[#78716C]">
                Search specific orders or consignment numbers
              </span>
            </div>
            <form onSubmit={handleQuickLookup} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. MELO-123456 or Consignment ID"
                  value={lookupOrderNo}
                  onChange={(e) => setLookupOrderNo(e.target.value)}
                  className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 pl-9 pr-3 py-2 text-xs font-mono uppercase text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                />
                <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-2.5" />
              </div>
              <button type="submit" className="boutique-btn-primary px-4 py-2 text-xs cursor-pointer">
                Find
              </button>
            </form>
          </div>

          {/* Customer Orders List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-display text-2xl font-medium text-[#1C1917]">
                My Orders &amp; Delivery Tracking ({orders.length})
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
  const steps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed & Inspected' },
    { key: 'dispatched', label: 'Dispatched with Courier' },
    { key: 'delivered', label: 'Delivered' },
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
              Total Amount
            </div>
            <div className="font-serif-display text-xl font-bold text-[#1C1917]">
              {formatBDT(order.total)}
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
              order.status === 'delivered'
                ? 'bg-emerald-800 text-white'
                : order.status === 'dispatched'
                ? 'bg-[#181512] text-[#FAF7F2]'
                : order.status === 'cancelled'
                ? 'bg-red-800 text-white'
                : 'bg-[#C5A059] text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-[#E6D5B8]" />
            <span>{order.status}</span>
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
              return (
                <div key={st.key} className="flex flex-col items-center text-center">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border transition ${
                      isPassed
                        ? 'bg-[#1C1917] text-[#FAF7F2] border-[#1C1917]'
                        : 'bg-white text-[#A8A29E] border-[#E7E0D6]'
                    } ${isCurrent ? 'ring-2 ring-[#C5A059]' : ''}`}
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
            <span className="border border-pink-200 bg-pink-50 px-2.5 py-1 font-mono text-xs font-bold text-pink-900">
              TrxID: {order.trxId}
            </span>
          )}
        </div>

        {/* Input to submit or update bKash TrxID */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={order.trxId ? 'Update bKash TrxID' : 'Add bKash TrxID'}
            value={editingTrx}
            onChange={(e) => onChangeTrx(e.target.value.toUpperCase())}
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

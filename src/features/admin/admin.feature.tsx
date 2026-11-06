'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productService } from '@/core/services/product.service';
import { productTypeService } from '@/core/services/product-type.service';
import { orderService } from '@/core/services/order.service';
import { storeLinkService } from '@/core/services/store-link.service';
import { supabaseService } from '@/core/services/supabase.service';
import { Product } from '@/core/models/product.model';
import { ProductType } from '@/core/models/product-type.model';
import { Order, OrderStatus, PaymentStatus } from '@/core/models/order.model';
import { StoreLink, StoreLinkCategory } from '@/core/models/store-link.model';
import { formatBDT } from '@/core/utils/currency.util';
import { slugify } from '@/core/utils/slug.util';
import {
  Package,
  ShoppingBag,
  Layers,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Clock,
  Plus,
  Minus,
  Edit3,
  Trash2,
  Database,
  X,
  Lock,
  LogOut,
  Smartphone,
  Link2,
} from 'lucide-react';

const ADMIN_ID = 'melo@gmail.com';
const ADMIN_SESSION_KEY = 'melo_admin_authenticated';

interface ProductFormState {
  id?: string;
  name: string;
  category: string;
  priceBDT: number;
  originalPriceBDT: number;
  stock: number;
  imageUrl: string;
  description: string;
  isFeatured: boolean;
  isNew: boolean;
}

const INITIAL_FORM: ProductFormState = {
  name: '',
  category: 'earrings',
  priceBDT: 320,
  originalPriceBDT: 420,
  stock: 6,
  imageUrl: '/products/earrings/Wreath%20Flowers.webp',
  description:
    'Exquisite French-style light luxury piece. Hypoallergenic and crafted for effortless everyday elegance.',
  isFeatured: true,
  isNew: true,
};

export function AdminFeature() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true' ||
        localStorage.getItem(ADMIN_SESSION_KEY) === 'true'
      );
    }
    return false;
  });
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [dbReachable, setDbReachable] = useState<boolean | null>(null);

  // Dashboard State
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'links'>('orders');
  const [products, setProducts] = useState<Product[]>(() => [...productService.getAllProducts()]);
  const [productTypes, setProductTypes] = useState<ProductType[]>(() => [
    ...productTypeService.getAllProductTypes(),
  ]);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [orders, setOrders] = useState<Order[]>(() => orderService.getOrders());
  const [bkashNumber, setBkashNumber] = useState<string>(() => orderService.getBkashNumber());
  const [storeLinks, setStoreLinks] = useState<StoreLink[]>(() => [...storeLinkService.getAllLinks()]);
  const [newLinkKey, setNewLinkKey] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkCategory, setNewLinkCategory] = useState<StoreLinkCategory>('other');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(INITIAL_FORM);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Catalogue Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'sold_out'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const soldOutCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 2).length;
  const isSupabaseConnected = supabaseService.isConfigured();

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStock =
      stockFilter === 'all'
        ? true
        : stockFilter === 'in_stock'
        ? p.stock > 0
        : stockFilter === 'low_stock'
        ? p.stock > 0 && p.stock <= 2
        : p.stock === 0;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesCategory && matchesStock && matchesSearch;
  });

  useEffect(() => {
    void supabaseService.checkConnection().then((ok) => setDbReachable(ok));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void Promise.all([
      productTypeService.syncFromDatabase(),
      productService.syncFromDatabase(),
      orderService.syncFromDatabase(),
      storeLinkService.syncFromDatabase(),
    ]).then(([remoteTypes, remoteProducts, remoteOrders, remoteLinks]) => {
      setProductTypes([...remoteTypes]);
      setProducts([...remoteProducts]);
      setOrders([...remoteOrders]);
      setStoreLinks([...remoteLinks]);
    });
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingAuth(true);
    setLoginError(null);

    const isValid = await supabaseService.verifyAdminCredentials(loginId, loginPass);
    setIsCheckingAuth(false);

    if (isValid) {
      setIsAuthenticated(true);
      setLoginError(null);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      }
      setOrders(orderService.getOrders());
      setProducts([...productService.getAllProducts()]);
    } else {
      setLoginError('Invalid admin ID or password. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginId('');
    setLoginPass('');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  };

  const refreshProducts = () => {
    setProducts([...productService.getAllProducts()]);
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    const existingOrder = orderService.getOrderById(orderId);
    const previousStatus = existingOrder?.status;

    orderService.updateOrderStatus(orderId, status);
    setOrders(orderService.getOrders());

    // Automatically restore stock if an active order is cancelled, or re-deduct if un-cancelled
    if (existingOrder && previousStatus && previousStatus !== status) {
      if (status === 'cancelled' && previousStatus !== 'cancelled') {
        existingOrder.items.forEach((item) => {
          productService.updateProductStock(item.product.id, item.quantity);
        });
        refreshProducts();
        setSyncMessage(
          `Order ${existingOrder.orderNumber} cancelled — restored stock for ${existingOrder.items.length} item(s).`
        );
        setTimeout(() => setSyncMessage(null), 4000);
      } else if (previousStatus === 'cancelled') {
        existingOrder.items.forEach((item) => {
          productService.updateProductStock(item.product.id, -item.quantity);
        });
        refreshProducts();
        setSyncMessage(
          `Order ${existingOrder.orderNumber} reactivated — deducted stock for ${existingOrder.items.length} item(s).`
        );
        setTimeout(() => setSyncMessage(null), 4000);
      }
    }
  };

  const handlePaymentStatusChange = (orderId: string, paymentStatus: PaymentStatus) => {
    orderService.updatePaymentStatus(orderId, paymentStatus);
    setOrders(orderService.getOrders());
  };

  const handleSaveBkashNumber = (e: React.FormEvent) => {
    e.preventDefault();
    orderService.setBkashNumber(bkashNumber);
    setSyncMessage(`Store bKash number updated to ${bkashNumber}!`);
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const handleStockDelta = (productId: string, delta: number) => {
    productService.updateProductStock(productId, delta);
    refreshProducts();
  };

  const handleMarkOneSold = (product: Product) => {
    if (product.stock <= 0) return;
    const nextStock = Math.max(0, product.stock - 1);
    productService.updateProductStock(product.id, -1);
    refreshProducts();
    setSyncMessage(
      nextStock === 0
        ? `Sold 1 × "${product.name}" — item is now SOLD OUT (0 left).`
        : `Sold 1 × "${product.name}" — ${nextStock} unit(s) remaining in stock.`
    );
    setTimeout(() => setSyncMessage(null), 3500);
  };

  const handleMarkSoldOut = (product: Product) => {
    productService.setProductStock(product.id, 0);
    refreshProducts();
    setSyncMessage(`Marked "${product.name}" as SOLD OUT (stock set to 0).`);
    setTimeout(() => setSyncMessage(null), 3500);
  };

  const handleQuickRestock = (product: Product, addQty: number) => {
    productService.updateProductStock(product.id, addQty);
    refreshProducts();
    setSyncMessage(`Restocked "${product.name}" (+${addQty} units).`);
    setTimeout(() => setSyncMessage(null), 3500);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setForm({
      id: product.id,
      name: product.name,
      category: product.category,
      priceBDT: product.priceBDT,
      originalPriceBDT: product.originalPriceBDT || product.priceBDT,
      stock: product.stock,
      imageUrl: product.imageUrl,
      description: product.description,
      isFeatured: Boolean(product.isFeatured),
      isNew: Boolean(product.isNew),
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    if (!confirm(`Delete "${product.name}" from the catalogue?`)) return;
    productService.deleteProduct(product.id);
    refreshProducts();
  };

  const handleAddProductType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    const created = productTypeService.addProductType(newTypeName.trim(), newTypeDesc.trim());
    setProductTypes([...productTypeService.getAllProductTypes()]);
    setNewTypeName('');
    setNewTypeDesc('');
    setSyncMessage(
      `Product type "${created.name}" (${created.slug}) added to public.product_types! You can now add products of this type.`
    );
    setTimeout(() => setSyncMessage(null), 4000);
  };

  const handleDeleteProductType = (typeItem: ProductType) => {
    const usedCount = products.filter((p) => p.category === typeItem.slug).length;
    if (usedCount > 0) {
      alert(
        `Cannot remove product type "${typeItem.name}" because ${usedCount} product(s) currently belong to this type.`
      );
      return;
    }
    if (!confirm(`Remove product type "${typeItem.name}" (${typeItem.slug})?`)) return;
    productTypeService.deleteProductType(typeItem.slug);
    setProductTypes([...productTypeService.getAllProductTypes()]);
    if (selectedCategory === typeItem.slug) {
      setSelectedCategory('all');
    }
    setSyncMessage(`Removed product type "${typeItem.name}".`);
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedType = productTypeService.getProductTypeBySlug(form.category);
    if (!matchedType) {
      alert(
        `Product type "${form.category}" does not exist yet! Please add it in the Product Types table first.`
      );
      return;
    }

    if (editingId) {
      const existing = productService.getProductById(editingId);
      if (existing) {
        productService.updateProduct({
          ...existing,
          name: form.name,
          category: matchedType.slug,
          categoryName: matchedType.name,
          priceBDT: Number(form.priceBDT),
          originalPriceBDT: Number(form.originalPriceBDT),
          stock: Number(form.stock),
          imageUrl: form.imageUrl,
          description: form.description,
          isFeatured: form.isFeatured,
          isNew: form.isNew,
        });
      }
    } else {
      const slug = `${matchedType.slug}-${slugify(form.name)}-${Date.now()
        .toString()
        .slice(-4)}`;
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: form.name,
        slug,
        category: matchedType.slug,
        categoryName: matchedType.name,
        priceBDT: Number(form.priceBDT),
        originalPriceBDT: Number(form.originalPriceBDT),
        stock: Number(form.stock),
        imageUrl: form.imageUrl,
        description: form.description,
        isFeatured: form.isFeatured,
        isNew: form.isNew,
        tags:
          matchedType.slug === 'earrings'
            ? ['Hypoallergenic', 'Ear Clip']
            : [matchedType.name, 'Light Luxury'],
      };
      productService.addProduct(newProd);
    }

    refreshProducts();
    setIsModalOpen(false);
    setSyncMessage(editingId ? 'Product updated successfully!' : 'New piece added to catalogue!');
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const handlePushToDatabase = async () => {
    if (!isSupabaseConnected) {
      setSyncMessage(
        'Saved in browser storage! Add NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to sync with cloud DB.'
      );
      setTimeout(() => setSyncMessage(null), 5000);
      return;
    }
    setSyncMessage('Syncing product types, products, and store URLs to Supabase PostgreSQL...');
    // First push product_types so foreign keys on public.products are satisfied!
    await productTypeService.pushAllToDatabase();
    const [okProducts, okLinks] = await Promise.all([
      productService.pushAllToDatabase(),
      storeLinkService.pushAllToDatabase(),
    ]);
    setSyncMessage(
      okProducts && okLinks
        ? 'All product types, products, and store URLs synced to Supabase database successfully!'
        : okProducts
        ? 'Product types & products synced! Run supabase/store_links.sql in Supabase to enable URL table sync.'
        : 'Could not sync — run supabase/product_types.sql and supabase/schema.sql in Supabase first.'
    );
    setTimeout(() => setSyncMessage(null), 4000);
  };

  const handleUpdateStoreLink = (link: StoreLink) => {
    storeLinkService.upsertLink(link);
    setStoreLinks([...storeLinkService.getAllLinks()]);
    setSyncMessage(`Updated "${link.label}" URL!`);
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const handleAddNewStoreLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    const key = newLinkKey.trim() || slugify(newLinkLabel).replace(/-/g, '_');
    storeLinkService.upsertLink({
      key,
      label: newLinkLabel.trim(),
      url: newLinkUrl.trim(),
      category: newLinkCategory,
      isActive: true,
    });
    setStoreLinks([...storeLinkService.getAllLinks()]);
    setNewLinkKey('');
    setNewLinkLabel('');
    setNewLinkUrl('');
    setNewLinkCategory('other');
    setSyncMessage(`Added "${newLinkLabel.trim()}" to Store Links!`);
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const handleDeleteStoreLink = (link: StoreLink) => {
    if (!confirm(`Remove "${link.label}" (${link.key}) URL?`)) return;
    storeLinkService.deleteLink(link.key);
    setStoreLinks([...storeLinkService.getAllLinks()]);
    setSyncMessage(`Removed "${link.label}" URL.`);
    setTimeout(() => setSyncMessage(null), 3000);
  };

  // Protected Login Gate when not authenticated
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 md:py-24">
        <div className="border border-[#C5A059] bg-white p-8 shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center border border-[#E6D5B8] bg-[#FAF7F2] text-[#9A7B3E] mb-5">
            <Lock className="w-5 h-5" />
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A7B3E] block">
            Protected Area
          </span>
          <h1 className="mt-1 font-serif-display text-3xl font-medium text-[#1C1917]">
            MELO Admin Sign In
          </h1>
          <p className="mt-1.5 text-xs text-[#78716C] leading-relaxed">
            Sign in with your administrator credentials to verify bKash TrxIDs, manage orders, and update jewellery inventory.
          </p>

          {loginError && (
            <div className="mt-4 border border-red-300 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Admin Email / ID
              </label>
              <input
                type="email"
                required
                placeholder="melo@gmail.com"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <button
              type="submit"
              disabled={isCheckingAuth}
              className="w-full boutique-btn-primary py-3.5 mt-2 cursor-pointer disabled:opacity-50"
            >
              {isCheckingAuth ? 'Verifying Credentials...' : 'Sign In to Admin Panel'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E7E0D6] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#78716C] hover:text-[#1C1917]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-14">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-6 border-b border-[#E7E0D6] gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#78716C] hover:text-[#1C1917] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </Link>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-medium text-[#1C1917]">
            MELO Store Admin Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716C] mt-1">
            <span>
              Signed in as <strong className="text-[#1C1917]">{ADMIN_ID}</strong>
            </span>
            <span>•</span>
            {isSupabaseConnected ? (
              <span
                className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  dbReachable
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    dbReachable ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span>
                  {dbReachable
                    ? 'Supabase DB Connected ✓'
                    : 'Supabase Key Set (Run schema.sql if tables missing)'}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 border border-stone-200 bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-700">
                <span>Local Mode (Restart npm run dev to load .env.local)</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls & Tab Switch */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 boutique-btn-primary px-5 py-2.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Piece</span>
          </button>

          <button
            onClick={handlePushToDatabase}
            className="inline-flex items-center gap-2 boutique-btn-outline px-4 py-2.5 cursor-pointer"
            title="Push local catalogue to Supabase PostgreSQL"
          >
            <Database className="w-3.5 h-3.5 text-[#9A7B3E]" />
            <span>Sync to DB</span>
          </button>

          <div className="flex border border-[#E7E0D6] bg-white p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#1C1917] text-[#FAF7F2]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Orders &amp; bKash Check ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#1C1917] text-[#FAF7F2]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Catalogue ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition cursor-pointer ${
                activeTab === 'links'
                  ? 'bg-[#1C1917] text-[#FAF7F2]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Chat &amp; Store URLs ({storeLinks.length})
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 border border-[#E7E0D6] bg-white px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#78716C] hover:border-red-400 hover:text-red-700 transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Status / Sync Toast */}
      {syncMessage && (
        <div className="mt-4 flex items-center justify-between border border-[#C5A059] bg-white px-4 py-3 text-xs font-medium text-[#1C1917]">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#9A7B3E]" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-[#78716C] hover:text-[#1C1917]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Store bKash Number Configuration Bar */}
      <form
        onSubmit={handleSaveBkashNumber}
        className="mt-6 border border-[#E7E0D6] bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center bg-pink-50 border border-pink-200 text-pink-700">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#1C1917]">
              Manual bKash Collection Number (Shown at Checkout)
            </div>
            <div className="text-[11px] text-[#78716C]">
              Customers send bKash payments to this number and submit their TrxID for your manual check below.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={bkashNumber}
            onChange={(e) => setBkashNumber(e.target.value)}
            placeholder="01700-000000"
            className="border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3 py-2 text-xs font-mono font-semibold text-[#1C1917] focus:bg-white focus:outline-none focus:border-pink-600 w-44"
          />
          <button
            type="submit"
            className="bg-pink-700 text-white px-4 py-2 text-[11px] font-semibold uppercase tracking-wider hover:bg-pink-800 transition cursor-pointer"
          >
            Update Number
          </button>
        </div>
      </form>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        <div className="border border-[#E7E0D6] bg-white p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
              Total Products
            </span>
            <Package className="w-4 h-4 text-[#9A7B3E]" />
          </div>
          <div className="font-serif-display text-3xl font-semibold text-[#1C1917]">
            {products.length}
          </div>
          <div className="text-[11px] text-[#78716C] mt-1">
            {products.filter((p) => p.category === 'earrings').length} earrings,{' '}
            {products.filter((p) => p.category === 'rings').length} rings,{' '}
            {products.filter((p) => p.category === 'bracelets').length} bracelets
          </div>
        </div>

        <div className="border border-[#E7E0D6] bg-white p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
              Total Inventory
            </span>
            <Layers className="w-4 h-4 text-[#9A7B3E]" />
          </div>
          <div className="font-serif-display text-3xl font-semibold text-[#1C1917]">
            {totalStock} Units
          </div>
          <div className="text-[11px] text-[#78716C] mt-1">
            {soldOutCount} sold out · {lowStockCount} low stock (≤2)
          </div>
        </div>

        <div className="border border-[#E7E0D6] bg-white p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
              Pending bKash Checks
            </span>
            <ShoppingBag className="w-4 h-4 text-pink-600" />
          </div>
          <div className="font-serif-display text-3xl font-semibold text-[#1C1917]">
            {orders.filter((o) => o.paymentMethod === 'bkash' && o.paymentStatus === 'pending').length}
          </div>
          <div className="text-[11px] text-[#78716C] mt-1">
            {orders.length} total customer orders
          </div>
        </div>

        <div className="border border-[#E7E0D6] bg-white p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
              Database Connection
            </span>
            <CheckCircle
              className={`w-4 h-4 ${isSupabaseConnected ? 'text-emerald-600' : 'text-[#C5A059]'}`}
            />
          </div>
          <div className="font-serif-display text-xl font-semibold text-[#1C1917]">
            {isSupabaseConnected ? 'Supabase Cloud Live' : 'Local + Supabase Ready'}
          </div>
          <div className="text-[11px] text-[#78716C] mt-1">
            {isSupabaseConnected
              ? 'Connected to PostgreSQL'
              : 'Add keys in .env.local for cloud sync'}
          </div>
        </div>
      </div>

      {/* Main Content: Orders & Manual bKash TrxID Verification View */}
      {activeTab === 'orders' && (
        <div className="border border-[#E7E0D6] bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E7E0D6] flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1C1917]">
              Customer Orders &amp; Manual bKash TrxID Verification
            </h2>
            <button
              onClick={() => setOrders(orderService.getOrders())}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A7B3E] hover:text-[#1C1917] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="p-14 text-center text-[#78716C]">
              <Clock className="w-8 h-8 mx-auto text-[#C5A059] mb-2 stroke-[1.25]" />
              <div className="font-serif-display text-2xl text-[#1C1917]">No orders placed yet</div>
              <div className="text-xs text-[#78716C] mt-1">
                When customers check out on the storefront, their orders and bKash TrxIDs will appear here for manual verification.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#78716C]">
                <thead className="bg-[#FAF7F2] border-b border-[#E7E0D6] text-[#1C1917] uppercase font-semibold text-[10px] tracking-[0.16em]">
                  <tr>
                    <th className="py-3.5 px-4">Order Ref</th>
                    <th className="py-3.5 px-4">Customer &amp; Address</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Payment &amp; TrxID</th>
                    <th className="py-3.5 px-4">Manual Payment Check</th>
                    <th className="py-3.5 px-4">Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EDE4]">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#FAF7F2]/60">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#9A7B3E]">{o.orderNumber}</div>
                        <div className="text-[10px] text-[#A8A29E] mt-0.5 space-y-0.5">
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
                      <td className="py-3.5 px-4 font-bold text-[#1C1917]">
                        {formatBDT(o.total)}
                      </td>
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
                            handlePaymentStatusChange(o.id, e.target.value as PaymentStatus)
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
                          onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Main Content: Products View */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Product Types Management Card (public.product_types) */}
          <div className="border border-[#C5A059] bg-white p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E7E0D6]">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A7B3E] block">
                  Step 1 · Product Types Table (public.product_types)
                </span>
                <h2 className="font-serif-display text-2xl font-medium text-[#1C1917]">
                  Manage Product Types (Add New Type Here First)
                </h2>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Before adding products of a new category (e.g. Necklaces, Anklets, Hair Clips), add the product type here first so it is registered in <code className="bg-[#FAF7F2] px-1.5 py-0.5 text-[#1C1917]">public.product_types</code>.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#1C1917]">
                {productTypes.length} Active Types
              </span>
            </div>

            {/* Existing Product Types List */}
            <div className="flex flex-wrap items-center gap-2.5 my-4">
              {productTypes.map((pt) => {
                const count = products.filter((p) => p.category === pt.slug).length;
                return (
                  <div
                    key={pt.slug}
                    className="inline-flex items-center gap-2 border border-[#E7E0D6] bg-[#FAF7F2] px-3 py-1.5 text-xs"
                  >
                    <span className="font-semibold text-[#1C1917]">{pt.name}</span>
                    <span className="font-mono text-[10px] text-[#78716C]">({pt.slug})</span>
                    <span className="bg-white border border-[#E6D5B8] px-1.5 py-0.5 text-[10px] font-semibold text-[#9A7B3E]">
                      {count} pcs
                    </span>
                    {count === 0 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteProductType(pt)}
                        className="text-[#A8A29E] hover:text-red-600 ml-1 cursor-pointer"
                        title={`Remove unused type ${pt.name}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add New Product Type Form */}
            <form
              onSubmit={handleAddProductType}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-[#F3EDE4] text-xs"
            >
              <div className="sm:col-span-4">
                <input
                  type="text"
                  required
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="New Product Type Name (e.g. Necklaces)"
                  className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3 py-2 text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <div className="sm:col-span-5">
                <input
                  type="text"
                  value={newTypeDesc}
                  onChange={(e) => setNewTypeDesc(e.target.value)}
                  placeholder="Optional description (e.g. Light luxury chains and pendants)"
                  className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3 py-2 text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full boutique-btn-primary py-2 px-4 text-[11px] cursor-pointer"
                >
                  + Add Product Type
                </button>
              </div>
            </form>
          </div>

          <div className="border border-[#E7E0D6] bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E7E0D6] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1C1917]">
                  Product Catalogue &amp; Live Inventory Editor
                </h2>
                <p className="text-[11px] text-[#78716C] mt-0.5">
                  Filter by category or stock state, or click <strong>Sold 1 (-1)</strong> /{' '}
                  <strong>Sold Out (0)</strong> when a piece sells via WhatsApp, Messenger, or in person.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#1C1917]">
                Showing {filteredProducts.length} of {products.length} Pieces
              </span>
            </div>

            {/* Category, Stock Filter & Search Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-[#F3EDE4]">
              {/* Category Filter Pills (Dynamically loaded from public.product_types) */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#78716C] mr-1">
                  Product Type:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider border transition cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'border-[#1C1917] bg-[#1C1917] text-[#FAF7F2]'
                      : 'border-[#E7E0D6] bg-[#FAF7F2]/60 text-[#78716C] hover:border-[#C5A059] hover:text-[#1C1917]'
                  }`}
                >
                  All ({products.length})
                </button>
                {productTypes.map((pt) => (
                  <button
                    key={pt.slug}
                    type="button"
                    onClick={() => setSelectedCategory(pt.slug)}
                    className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider border transition cursor-pointer ${
                      selectedCategory === pt.slug
                        ? 'border-[#1C1917] bg-[#1C1917] text-[#FAF7F2]'
                        : 'border-[#E7E0D6] bg-[#FAF7F2]/60 text-[#78716C] hover:border-[#C5A059] hover:text-[#1C1917]'
                    }`}
                  >
                    {pt.name} ({products.filter((p) => p.category === pt.slug).length})
                  </button>
                ))}
              </div>

              {/* Stock Status Filter & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-1">
                  {(
                    [
                      { key: 'all', label: 'All Stock' },
                      {
                        key: 'in_stock',
                        label: `In Stock (${products.filter((p) => p.stock > 0).length})`,
                      },
                      {
                        key: 'low_stock',
                        label: `Low ≤2 (${lowStockCount})`,
                      },
                      {
                        key: 'sold_out',
                        label: `Sold Out (${soldOutCount})`,
                      },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => setStockFilter(st.key)}
                      className={`px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider border transition cursor-pointer ${
                        stockFilter === st.key
                          ? 'border-[#C5A059] bg-[#FAF7F2] text-[#1C1917]'
                          : 'border-[#E7E0D6] bg-white text-[#78716C] hover:text-[#1C1917]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search piece name..."
                  className="border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3 py-1.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059] w-44"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#78716C]">
              <thead className="bg-[#FAF7F2] border-b border-[#E7E0D6] text-[#1C1917] uppercase font-semibold text-[10px] tracking-[0.16em]">
                <tr>
                  <th className="py-3.5 px-4">Piece</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Selling Price</th>
                  <th className="py-3.5 px-4">Quick Stock &amp; Sold Controls</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3EDE4]">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[#78716C]">
                      No products match your selected category or filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF7F2]/60">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-9 flex-shrink-0 overflow-hidden bg-[#F3EDE4] border border-[#E7E0D6]">
                            <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                          </div>
                          <div>
                            <div className="font-serif-display text-base font-medium text-[#1C1917]">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-[#A8A29E]">{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 capitalize font-medium text-[#1C1917]">
                        {p.category}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#1C1917]">
                        {formatBDT(p.priceBDT)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center border border-[#E7E0D6] bg-white">
                            <button
                              onClick={() => handleStockDelta(p.id, -1)}
                              disabled={p.stock <= 0}
                              className="p-1 text-[#78716C] hover:text-[#1C1917] disabled:opacity-30 cursor-pointer"
                              aria-label="Decrease stock"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-semibold text-[#1C1917]">
                              {p.stock}
                            </span>
                            <button
                              onClick={() => handleStockDelta(p.id, 1)}
                              className="p-1 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                              aria-label="Increase stock"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {p.stock > 0 ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleMarkOneSold(p)}
                                className="border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-900 hover:bg-amber-100 transition cursor-pointer"
                                title="Deduct 1 unit sold via WhatsApp/Messenger/Offline"
                              >
                                Sold 1 (-1)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMarkSoldOut(p)}
                                className="border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-800 hover:bg-red-100 transition cursor-pointer"
                                title="Set stock to 0 (Out of Stock on storefront)"
                              >
                                Sold Out (0)
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleQuickRestock(p, 3)}
                              className="border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                              title="Quickly restock +3 units"
                            >
                              + Restock 3
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {p.stock > 2 ? (
                          <span className="inline-flex items-center border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                            In Stock ({p.stock})
                          </span>
                        ) : p.stock > 0 ? (
                          <span className="inline-flex items-center border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900">
                            Low Stock ({p.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-800">
                            Sold Out (0)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="inline-flex items-center gap-1 border border-[#E7E0D6] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1C1917] hover:border-[#C5A059] cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-[#9A7B3E]" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 text-[#A8A29E] hover:text-red-600 cursor-pointer"
                            aria-label={`Delete ${p.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {/* Links & Chat URLs Tab */}
      {activeTab === 'links' && (
        <div className="space-y-6">
          <div className="border border-[#E7E0D6] bg-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E0D6] gap-2">
              <div className="flex items-center gap-2.5">
                <Link2 className="w-5 h-5 text-[#9A7B3E]" />
                <div>
                  <h2 className="font-serif-display text-2xl font-medium text-[#1C1917]">
                    Messenger, WhatsApp &amp; Custom Store URLs
                  </h2>
                  <p className="text-xs text-[#78716C]">
                    Update your floating concierge chat links (WhatsApp &amp; Messenger) or add any custom social/external URL.
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-[#78716C]">
                Table: <code className="bg-[#FAF7F2] px-1.5 py-0.5 text-[#1C1917]">public.store_links</code>
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {storeLinks.map((item) => (
                <div
                  key={item.key}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border border-[#E7E0D6] bg-[#FAF7F2]/60 p-4"
                >
                  <div className="md:col-span-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#1C1917]">{item.label}</span>
                      <span className="border border-[#E6D5B8] bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#9A7B3E]">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-[#78716C] mt-0.5">key: {item.key}</div>
                  </div>

                  <div className="md:col-span-6">
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => {
                        const updated = storeLinks.map((l) =>
                          l.key === item.key ? { ...l, url: e.target.value } : l
                        );
                        setStoreLinks(updated);
                      }}
                      placeholder={
                        item.key === 'whatsapp'
                          ? 'https://wa.me/88017XXXXXXXX or 017XXXXXXXX'
                          : item.key === 'messenger'
                          ? 'https://m.me/yourpage or page username'
                          : 'https://...'
                      }
                      className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div className="md:col-span-3 flex items-center justify-end gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-[#1C1917] cursor-pointer mr-2">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={(e) => {
                          const updatedLink = { ...item, isActive: e.target.checked };
                          handleUpdateStoreLink(updatedLink);
                        }}
                        className="accent-[#1C1917]"
                      />
                      <span className="text-[11px] font-semibold">Active</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleUpdateStoreLink(item)}
                      className="boutique-btn-primary px-3.5 py-2 text-[10px] cursor-pointer"
                    >
                      Save URL
                    </button>

                    {item.key !== 'whatsapp' && item.key !== 'messenger' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteStoreLink(item)}
                        className="p-2 text-[#A8A29E] hover:text-red-600 cursor-pointer"
                        title={`Delete ${item.label}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Any Custom URL Form */}
          <form
            onSubmit={handleAddNewStoreLink}
            className="border border-[#C5A059] bg-white p-6 space-y-4"
          >
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A7B3E] block">
                Add Custom URL
              </span>
              <h3 className="font-serif-display text-2xl font-medium text-[#1C1917]">
                Add Any New Chat, Social, or External URL
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Display Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telegram Support / YouTube"
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                  className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Unique Key (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. telegram"
                  value={newLinkKey}
                  onChange={(e) => setNewLinkKey(e.target.value)}
                  className="w-full border border-[#D6CFC5] px-3 py-2 font-mono text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Full URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Placement Category
                </label>
                <select
                  value={newLinkCategory}
                  onChange={(e) => setNewLinkCategory(e.target.value as StoreLinkCategory)}
                  className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] bg-white focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="chat">Floating Chat Popup (chat)</option>
                  <option value="social">Footer Social Link (social)</option>
                  <option value="other">Footer Custom Link (other)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="boutique-btn-primary px-6 py-2.5 cursor-pointer">
                + Add URL to Store
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181512]/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg border border-[#C5A059] bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between bg-[#181512] px-6 py-4 text-[#FAF7F2]">
              <h3 className="font-serif-display text-2xl font-medium">
                {editingId ? 'Update Jewellery Piece' : 'Add New Jewellery Piece'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#A8A29E] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Pearl Camellia Ear Clip"
                  className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                    Product Type (from public.product_types) *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                      })
                    }
                    className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                  >
                    {productTypes.map((pt) => (
                      <option key={pt.slug} value={pt.slug}>
                        {pt.name} ({pt.slug})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                    Selling Price (BDT ৳) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.priceBDT}
                    onChange={(e) => setForm({ ...form, priceBDT: Number(e.target.value) })}
                    className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                    Original Price (BDT ৳)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.originalPriceBDT}
                    onChange={(e) => setForm({ ...form, originalPriceBDT: Number(e.target.value) })}
                    className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Image Path / URL *
                </label>
                <input
                  type="text"
                  required
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="/products/earrings/Wreath%20Flowers.webp"
                  className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-[#D6CFC5] px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="accent-[#1C1917]"
                  />
                  <span className="font-semibold text-[#1C1917]">Featured on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                    className="accent-[#1C1917]"
                  />
                  <span className="font-semibold text-[#1C1917]">Mark as New Arrival</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E0D6]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="boutique-btn-outline px-5 py-2.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="boutique-btn-primary px-6 py-2.5 cursor-pointer">
                  {editingId ? 'Save Changes' : 'Add Piece'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

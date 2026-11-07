'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { adminService } from '@/core/services/admin.service';
import { productService } from '@/core/services/product.service';
import { productTypeService } from '@/core/services/product-type.service';
import { orderService } from '@/core/services/order.service';
import { storeLinkService } from '@/core/services/store-link.service';
import { customerService } from '@/core/services/customer.service';
import { Product } from '@/core/models/product.model';
import { ProductType } from '@/core/models/product-type.model';
import { CustomerProfile } from '@/core/models/customer.model';
import { CartItem } from '@/core/models/cart.model';
import {
  Order,
  OrderStatus,
  PaymentStatus,
  DeliveryZone,
  PaymentMethod,
  OrderSource,
} from '@/core/models/order.model';
import { StoreLink, StoreLinkCategory } from '@/core/models/store-link.model';
import { slugify } from '@/core/utils/slug.util';
import { exportProductsToCsv, mergeProductsFromCsv } from '@/core/utils/csv-products.util';
import { useI18n } from '@/core/i18n/i18n.context';

// Organized Admin Sub-Modules
import { AdminLogin } from './components/admin-login';
import { AdminMetrics } from './components/admin-metrics';
import { AdminProductsTab, StockFilterType } from './tabs/products-tab';
import { AdminProductTypesTab } from './tabs/product-types-tab';
import { AdminOrdersTab } from './tabs/orders-tab';
import { AdminAnalyticsTab } from './tabs/analytics-tab';
import { AdminLinksTab } from './tabs/links-tab';
import { AdminHomepageTab } from './tabs/homepage-tab';
import { AdminOperationsTab } from './tabs/operations-tab';
import { AdminProductModal, ProductFormState } from './modals/product-modal';
import { AdminManualOrderModal } from './modals/manual-order-modal';
import { AdminImageZoomModal, AdminZoomImage } from './modals/image-zoom-modal';
import { AdminDeleteProductModal } from './modals/delete-product-modal';

import {
  CheckCircle,
  Plus,
  Database,
  X,
  LogOut,
  Upload,
  Download,
  TrendingUp,
  Sparkles,
  Store,
  Briefcase,
  ExternalLink,
} from 'lucide-react';

const INITIAL_FORM: ProductFormState = {
  name: '',
  category: 'earrings',
  priceBDT: 172,
  originalPriceBDT: 220,
  costPriceCNY: 66,
  stock: 2,
  imageUrl: '/products/earrings/Wreath%20Flowers.webp',
  images: [],
  description:
    'Exquisite French-style light luxury piece. Hypoallergenic and crafted for effortless everyday elegance.',
  isFeatured: true,
  isNew: true,
};

export function AdminFeature() {
  const { t } = useI18n();
  // Authentication State (delegated to AdminService -> AdminRepository)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    adminService.isAuthenticated()
  );
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [dbReachable, setDbReachable] = useState<boolean | null>(null);

  // Dashboard State
  const [adminSystem, setAdminSystem] = useState<'store' | 'operations'>('store');
  const [zoomedImage, setZoomedImage] = useState<AdminZoomImage | null>(null);
  const [activeTab, setActiveTab] = useState<
    'products' | 'types' | 'orders' | 'analytics' | 'links' | 'homepage'
  >('products');
  const [products, setProducts] = useState<Product[]>(() => [...productService.getAllProducts()]);
  const [productTypes, setProductTypes] = useState<ProductType[]>(() => [
    ...productTypeService.getAllProductTypes(),
  ]);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [orders, setOrders] = useState<Order[]>(() => orderService.getOrders());
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [bkashNumber, setBkashNumber] = useState<string>(() => orderService.getBkashNumber());
  const [storeLinks, setStoreLinks] = useState<StoreLink[]>(() => [
    ...storeLinkService.getAllLinks(),
  ]);
  const [newLinkKey, setNewLinkKey] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkCategory, setNewLinkCategory] = useState<StoreLinkCategory>('other');

  // Profit & Analytics State
  const [shippingCostPerPiece, setShippingCostPerPiece] = useState<number>(20);
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'all' | 'today' | 'week' | 'month'>(
    'all'
  );
  const [analyticsOrderScope, setAnalyticsOrderScope] = useState<'delivered' | 'active'>(
    'delivered'
  );

  // Add / Edit Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(INITIAL_FORM);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

  // Manual Order (WhatsApp / Facebook Messenger) Modal State
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [manualSource, setManualSource] = useState<OrderSource>('whatsapp');
  const [manualCustName, setManualCustName] = useState('');
  const [manualCustPhone, setManualCustPhone] = useState('');
  const [manualCustAddress, setManualCustAddress] = useState('');
  const [manualDeliveryZone, setManualDeliveryZone] = useState<DeliveryZone>('inside_dhaka');
  const [manualPaymentMethod, setManualPaymentMethod] = useState<PaymentMethod>('cod');
  const [manualTrxId, setManualTrxId] = useState('');
  const [manualSenderPhone, setManualSenderPhone] = useState('');
  const [manualSelectedProductId, setManualSelectedProductId] = useState<string>('');
  const [manualSelectedQty, setManualSelectedQty] = useState<number>(1);
  const [manualItems, setManualItems] = useState<CartItem[]>([]);

  // Catalogue Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<StockFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const soldOutCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 2).length;
  const isSupabaseConnected = adminService.isDatabaseConfigured();
  const adminEmail = adminService.getDefaultAdminEmail();

  // Profit, Cost & Revenue Calculations (using Hippo tracker Per Piece + Shipping Cost)
  const getUnitBaseCost = (p: Product): number => Number(p.costPriceCNY ?? 0);
  const getUnitLandedCost = (p: Product): number => getUnitBaseCost(p) + shippingCostPerPiece;
  const getUnitMinSellPrice = (p: Product): number => Math.round(getUnitLandedCost(p) * 1.5);
  const getUnitNetProfit = (p: Product): number => p.priceBDT - getUnitLandedCost(p);

  const totalInventoryBaseCost = products.reduce(
    (acc, p) => acc + p.stock * getUnitBaseCost(p),
    0
  );
  const totalInventoryLandedCost = products.reduce(
    (acc, p) => acc + p.stock * getUnitLandedCost(p),
    0
  );
  const totalExpectedRevenue = products.reduce((acc, p) => acc + p.stock * p.priceBDT, 0);
  const totalExpectedNetProfit = totalExpectedRevenue - totalInventoryLandedCost;
  const expectedMarginPercent =
    totalExpectedRevenue > 0
      ? Math.round((totalExpectedNetProfit / totalExpectedRevenue) * 100)
      : 0;

  // Realized Profit from Orders filtered by timeframe (today, week, month, all) and scope
  const [nowMs, setNowMs] = useState<number | null>(null);
  const handleChangeTimeframe = (tf: 'all' | 'today' | 'week' | 'month') => {
    setNowMs(Date.now());
    setAnalyticsTimeframe(tf);
  };
  const analyticsFilteredOrders = orders.filter((o) => {
    const matchesScope =
      analyticsOrderScope === 'delivered' ? o.status === 'delivered' : o.status !== 'cancelled';
    if (!matchesScope) return false;
    if (analyticsTimeframe === 'all' || nowMs === null) return true;
    const orderTimeMs = new Date(o.createdAt).getTime();
    if (Number.isNaN(orderTimeMs)) return true;
    const diffHours = (nowMs - orderTimeMs) / (1000 * 60 * 60);
    if (analyticsTimeframe === 'today') return diffHours <= 24;
    if (analyticsTimeframe === 'week') return diffHours <= 24 * 7;
    if (analyticsTimeframe === 'month') return diffHours <= 24 * 30;
    return true;
  });

  const realizedOrderStats = analyticsFilteredOrders.reduce(
    (acc, order) => {
      for (const item of order.items) {
        const latestProd =
          products.find((p) => p.id === item.product.id || p.slug === item.product.slug) ||
          item.product;
        const unitSell = item.product.priceBDT;
        const unitLanded =
          Number(latestProd.costPriceCNY ?? item.product.costPriceCNY ?? 0) +
          shippingCostPerPiece;
        acc.unitsSold += item.quantity;
        acc.itemRevenue += unitSell * item.quantity;
        acc.itemLandedCost += unitLanded * item.quantity;
        acc.netProfit += (unitSell - unitLanded) * item.quantity;
      }
      return acc;
    },
    { unitsSold: 0, itemRevenue: 0, itemLandedCost: 0, netProfit: 0 }
  );

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStock =
      stockFilter === 'all'
        ? true
        : stockFilter === 'featured'
        ? Boolean(p.isFeatured)
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
    void adminService.checkDatabaseConnection().then((ok) => setDbReachable(ok));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void adminService.syncAllFromDatabase().then((synced) => {
      setProductTypes([...synced.productTypes]);
      setProducts([...synced.products]);
      setOrders([...synced.orders]);
      setStoreLinks([...synced.storeLinks]);
    });
    void customerService.getAllCustomers().then((custs) => {
      setCustomers(custs);
    });
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingAuth(true);
    setLoginError(null);

    const isValid = await adminService.login(loginId, loginPass);
    setIsCheckingAuth(false);

    if (isValid) {
      setIsAuthenticated(true);
      setLoginError(null);
      setOrders(orderService.getOrders());
      setProducts([...productService.getAllProducts()]);
    } else {
      setLoginError('Invalid admin ID or password. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    adminService.logout();
    setIsAuthenticated(false);
    setLoginId('');
    setLoginPass('');
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

  const handleUpdateOrderTracking = (
    orderId: string,
    tracking: {
      trackingNumber: string;
      courierName?: string;
      courierTrackingUrl?: string;
      estimatedDelivery?: string;
      status?: OrderStatus;
    }
  ) => {
    orderService.updateOrderTracking(orderId, tracking);
    setOrders([...orderService.getOrders()]);
    setSyncMessage(
      `Assigned tracking ${tracking.trackingNumber} (${tracking.courierName || 'Courier'}) to order`
    );
    setTimeout(() => setSyncMessage(null), 3500);
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

  const openManualOrderModal = () => {
    const firstAvailable = products.find((p) => p.stock > 0);
    setManualSource('whatsapp');
    setManualCustName('');
    setManualCustPhone('');
    setManualCustAddress('');
    setManualDeliveryZone('inside_dhaka');
    setManualPaymentMethod('cod');
    setManualTrxId('');
    setManualSenderPhone('');
    setManualSelectedProductId(firstAvailable ? firstAvailable.id : '');
    setManualSelectedQty(1);
    setManualItems([]);
    setIsManualOrderOpen(true);
  };

  const handleAddManualItem = () => {
    if (!manualSelectedProductId) return;
    const prod = products.find((p) => p.id === manualSelectedProductId);
    if (!prod || prod.stock <= 0) return;

    setManualItems((prev) => {
      const existing = prev.find((i) => i.product.id === prod.id);
      const currentQty = existing ? existing.quantity : 0;
      const nextQty = Math.min(prod.stock, currentQty + Math.max(1, manualSelectedQty));
      if (existing) {
        return prev.map((i) => (i.product.id === prod.id ? { ...i, quantity: nextQty } : i));
      }
      return [
        ...prev,
        { product: prod, quantity: Math.min(prod.stock, Math.max(1, manualSelectedQty)) },
      ];
    });
    setManualSelectedQty(1);
  };

  const handleRemoveManualItem = (productId: string) => {
    setManualItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleSubmitManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCustName.trim() || !manualCustPhone.trim() || !manualCustAddress.trim()) {
      alert('Please enter customer name, phone number, and delivery address.');
      return;
    }
    if (manualItems.length === 0) {
      alert('Please add at least 1 jewellery piece to the manual order.');
      return;
    }

    const subtotal = manualItems.reduce(
      (sum, item) => sum + item.product.priceBDT * item.quantity,
      0
    );
    const deliveryFee =
      subtotal >= 1500 ? 0 : manualDeliveryZone === 'inside_dhaka' ? 60 : 120;
    const total = subtotal + deliveryFee;
    const orderNumber = `MELO-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      customer: {
        fullName: manualCustName.trim(),
        phone: manualCustPhone.trim(),
        address: manualCustAddress.trim(),
        deliveryZone: manualDeliveryZone,
        orderSource: manualSource,
        notes: `Manual ${manualSource === 'whatsapp' ? 'WhatsApp' : 'Facebook Messenger'} Order`,
      },
      customerPhone: manualCustPhone.trim(),
      items: manualItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: manualPaymentMethod,
      status: 'confirmed',
      paymentStatus:
        manualPaymentMethod === 'bkash' && manualTrxId.trim() ? 'verified' : 'pending',
      trxId: manualTrxId.trim() ? manualTrxId.trim().toUpperCase() : undefined,
      bkashSenderNumber: manualSenderPhone.trim() ? manualSenderPhone.trim() : undefined,
      estimatedDelivery:
        manualDeliveryZone === 'inside_dhaka' ? '24–48 hours' : '3–4 business days',
    };

    manualItems.forEach((item) => {
      productService.updateProductStock(item.product.id, -item.quantity);
    });

    orderService.saveOrder(newOrder);

    refreshProducts();
    setOrders(orderService.getOrders());
    setIsManualOrderOpen(false);
    setActiveTab('orders');
    setSyncMessage(
      `Created ${manualSource.toUpperCase()} Order ${orderNumber} for ${manualCustName.trim()} (${manualCustPhone.trim()})! Stock automatically deducted and customer can track on /account.`
    );
    setTimeout(() => setSyncMessage(null), 5000);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...INITIAL_FORM,
      category: productTypes[0]?.slug || 'earrings',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    const existingImages =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [product.imageUrl];
    setForm({
      id: product.id,
      name: product.name,
      category: product.category,
      priceBDT: product.priceBDT,
      originalPriceBDT: product.originalPriceBDT || product.priceBDT,
      costPriceCNY: product.costPriceCNY ?? 50,
      stock: product.stock,
      imageUrl: product.imageUrl,
      images: existingImages,
      description: product.description,
      isFeatured: Boolean(product.isFeatured),
      isNew: Boolean(product.isNew),
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };

  const handleConfirmDeleteProduct = (product: Product) => {
    productService.deleteProduct(product.id);
    refreshProducts();
    setSyncMessage(`Deleted "${product.name}" from catalogue.`);
    setTimeout(() => setSyncMessage(null), 3000);
    setProductToDelete(null);
  };

  const handleToggleFeatured = (product: Product) => {
    productService.toggleProductFeatured(product.id);
    refreshProducts();
    setSyncMessage(
      product.isFeatured
        ? `Removed "${product.name}" from featured pieces`
        : `Marked "${product.name}" as Featured ★`
    );
    setTimeout(() => setSyncMessage(null), 3000);
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

    const finalImages = Array.from(
      new Set(
        [form.imageUrl, ...(form.images || [])].filter((url): url is string =>
          Boolean(url && url.trim())
        )
      )
    );

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
          costPriceCNY: Number(form.costPriceCNY),
          stock: Number(form.stock),
          imageUrl: form.imageUrl,
          images: finalImages,
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
        costPriceCNY: Number(form.costPriceCNY),
        stock: Number(form.stock),
        imageUrl: form.imageUrl,
        images: finalImages,
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

  const handleExportCsv = (onlyFiltered = false) => {
    const targetList = onlyFiltered ? filteredProducts : products;
    const csvContent = exportProductsToCsv(targetList);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const suffix =
      onlyFiltered && selectedCategory !== 'all' ? selectedCategory : 'all_products';
    link.href = url;
    link.setAttribute(
      'download',
      `melo_${suffix}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSyncMessage(
      `Exported ${targetList.length} product(s) to CSV! You can edit prices or stock and import it back.`
    );
    setTimeout(() => setSyncMessage(null), 4000);
  };

  const handleImportCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const csvText = await file.text();
      const defaultCat = selectedCategory !== 'all' ? selectedCategory : 'earrings';
      const diff = mergeProductsFromCsv(
        csvText,
        productService.getAllProducts(),
        productTypeService.getAllProductTypes(),
        defaultCat,
        file.name
      );

      await productService.applyImportedProductsDiff(diff.mergedProducts, diff.changedProducts);
      refreshProducts();

      const skippedNotice =
        diff.skippedTypes.length > 0
          ? ` (Skipped unknown product type(s): ${diff.skippedTypes.join(
              ', '
            )} — add them in Product Types tab first!)`
          : '';

      setSyncMessage(
        `CSV Import Complete ("${file.name}"): ${diff.updatedCount} updated, ${diff.addedCount} new added, ${diff.unchangedCount} unchanged (kept as-is).${skippedNotice}`
      );
      setTimeout(() => setSyncMessage(null), 6000);
    } catch {
      setSyncMessage('Could not parse CSV file. Please check the file format.');
      setTimeout(() => setSyncMessage(null), 4000);
    } finally {
      if (csvFileInputRef.current) {
        csvFileInputRef.current.value = '';
      }
    }
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
    const okProducts = await adminService.pushAllToDatabase();
    setSyncMessage(
      okProducts
        ? 'All product types, products, and store URLs synced to Supabase database successfully!'
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
      <AdminLogin
        loginId={loginId}
        onChangeLoginId={setLoginId}
        loginPass={loginPass}
        onChangeLoginPass={setLoginPass}
        loginError={loginError}
        isCheckingAuth={isCheckingAuth}
        onSubmitLogin={handleLogin}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-14">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-6 border-b border-[#E7E0D6] gap-4 mb-6">
        <div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-medium text-[#1C1917]">
            {t.admin.header.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716C] mt-1">
            <span>
              {t.admin.header.signedInAs} <strong className="text-[#1C1917]">{adminEmail}</strong>
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
                    ? t.admin.header.dbConnected
                    : t.admin.header.dbKeySet}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 border border-stone-200 bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-700">
                <span>{t.admin.header.localMode}</span>
              </span>
            )}
          </div>
        </div>

        {/* Global Quick Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border border-[#E7E0D6] bg-white px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#78716C] hover:border-[#1C1917] hover:text-[#1C1917] transition cursor-pointer rounded-lg shadow-2xs"
            title="Open live storefront in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#9A7B3E]" />
            <span>{t.admin.header.storefront}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 border border-[#E7E0D6] bg-white px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#78716C] hover:border-red-400 hover:text-red-700 transition cursor-pointer rounded-lg shadow-2xs"
            title={t.admin.header.signOut}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.admin.header.signOut}</span>
          </button>
        </div>
      </div>

      {/* Primary System Switcher (Store Management vs Business Operations) */}
      <div className="flex items-center gap-2 border-b border-[#E7E0D6] mb-8 pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setAdminSystem('store')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition cursor-pointer rounded-xl ${
            adminSystem === 'store'
              ? 'bg-[#1C1917] text-[#FAF7F2] shadow-xs'
              : 'bg-white border border-[#E7E0D6] text-[#78716C] hover:border-[#1C1917] hover:text-[#1C1917]'
          }`}
        >
          <Store className="w-4 h-4 text-[#C5A059]" />
          <span>{t.admin.header.storeManagement}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-700 text-stone-200">
            {orders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSystem('operations')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition cursor-pointer rounded-xl ${
            adminSystem === 'operations'
              ? 'bg-[#1C1917] text-[#FAF7F2] shadow-xs'
              : 'bg-white border border-[#E7E0D6] text-[#78716C] hover:border-[#1C1917] hover:text-[#1C1917]'
          }`}
        >
          <Briefcase className="w-4 h-4 text-[#C5A059]" />
          <span>{t.admin.header.businessOperations}</span>
        </button>
      </div>

      {/* Non-Store System */}
      {adminSystem === 'operations' && <AdminOperationsTab />}

      {/* Store System */}
      {adminSystem === 'store' && (
        <>
          {/* Action Controls & Store Sub-Tab Switch */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white border border-[#E7E0D6] p-3 sm:p-4 rounded-xl shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={csvFileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleImportCsvFile}
                className="hidden"
              />

              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 boutique-btn-primary px-3.5 py-2 cursor-pointer text-xs rounded-lg shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.admin.header.addNewPiece}</span>
              </button>

              <button
                type="button"
                onClick={openManualOrderModal}
                className="inline-flex items-center gap-2 border border-emerald-600 bg-emerald-700 text-white px-3.5 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-emerald-800 transition cursor-pointer rounded-lg shadow-2xs"
                title="Create an order from WhatsApp or Facebook Messenger and automatically deduct stock"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.admin.header.manualOrder}</span>
              </button>

              <button
                type="button"
                onClick={() => csvFileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 boutique-btn-outline px-3.5 py-2 cursor-pointer text-xs rounded-lg shadow-2xs"
                title="Import CSV — only changed rows update, everything else stays untouched"
              >
                <Upload className="w-3.5 h-3.5 text-[#9A7B3E]" />
                <span>{t.admin.header.importCsv}</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportCsv(false)}
                className="inline-flex items-center gap-1.5 boutique-btn-outline px-3.5 py-2 cursor-pointer text-xs rounded-lg shadow-2xs"
                title="Export full product catalogue to CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#9A7B3E]" />
                <span>{t.admin.header.exportCsv}</span>
              </button>

              <button
                onClick={handlePushToDatabase}
                className="inline-flex items-center gap-1.5 boutique-btn-outline px-3.5 py-2 cursor-pointer text-xs rounded-lg shadow-2xs"
                title="Push local catalogue to Supabase PostgreSQL"
              >
                <Database className="w-3.5 h-3.5 text-[#9A7B3E]" />
                <span>{t.admin.header.syncToDb}</span>
              </button>
            </div>

            {/* Store Sub-Tabs */}
            <div className="flex flex-wrap border border-[#E7E0D6] bg-stone-50 p-1 text-xs font-semibold rounded-xl gap-1">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] transition cursor-pointer rounded-lg ${
                  activeTab === 'products'
                    ? 'bg-[#1C1917] text-[#FAF7F2] shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {t.admin.subTabs.products} ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('types')}
                className={`px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] transition cursor-pointer rounded-lg ${
                  activeTab === 'types'
                    ? 'bg-[#1C1917] text-[#FAF7F2] shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {t.admin.subTabs.productTypes} ({productTypes.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] transition cursor-pointer rounded-lg ${
                  activeTab === 'orders'
                    ? 'bg-[#1C1917] text-[#FAF7F2] shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {t.admin.subTabs.orders} ({orders.length})
              </button>
              <button
                onClick={() => {
                  setNowMs(Date.now());
                  setActiveTab('analytics');
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] transition cursor-pointer rounded-lg ${
                  activeTab === 'analytics'
                    ? 'bg-[#1C1917] text-[#FAF7F2] shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{t.admin.subTabs.analytics}</span>
              </button>
              <button
                onClick={() => setActiveTab('links')}
                className={`px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] transition cursor-pointer rounded-lg ${
                  activeTab === 'links'
                    ? 'bg-[#1C1917] text-[#FAF7F2] shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {t.admin.subTabs.links} ({storeLinks.length})
              </button>
              <button
                onClick={() => setActiveTab('homepage')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] transition cursor-pointer rounded-lg ${
                  activeTab === 'homepage'
                    ? 'bg-[#1C1917] text-[#FAF7F2] shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{t.admin.subTabs.homepage}</span>
              </button>
            </div>
          </div>

          {/* Status / Sync Toast */}
          {syncMessage && (
            <div className="mt-4 flex items-center justify-between border border-[#C5A059] bg-white px-4 py-3 text-xs font-medium text-[#1C1917] rounded-xl shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#9A7B3E]" />
                <span>{syncMessage}</span>
              </div>
              <button
                onClick={() => setSyncMessage(null)}
                className="text-[#78716C] hover:text-[#1C1917] p-1 rounded-full hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Store bKash Number Configuration Bar & Metrics Row */}
          <AdminMetrics
            bkashNumber={bkashNumber}
            onChangeBkashNumber={setBkashNumber}
            onSaveBkashNumber={handleSaveBkashNumber}
            products={products}
            orders={orders}
            totalStock={totalStock}
            soldOutCount={soldOutCount}
            lowStockCount={lowStockCount}
            isSupabaseConnected={isSupabaseConnected}
          />

          {/* Tab: Products Catalogue & Live Inventory Editor */}
          {activeTab === 'products' && (
            <AdminProductsTab
              products={products}
              filteredProducts={filteredProducts}
              productTypes={productTypes}
              selectedCategory={selectedCategory}
              onChangeSelectedCategory={setSelectedCategory}
              stockFilter={stockFilter}
              onChangeStockFilter={setStockFilter}
              searchQuery={searchQuery}
              onChangeSearchQuery={setSearchQuery}
              lowStockCount={lowStockCount}
              soldOutCount={soldOutCount}
              onTriggerCsvImport={() => csvFileInputRef.current?.click()}
              onExportCsv={handleExportCsv}
              getUnitLandedCost={getUnitLandedCost}
              getUnitMinSellPrice={getUnitMinSellPrice}
              getUnitNetProfit={getUnitNetProfit}
              onZoomImage={setZoomedImage}
              onToggleFeatured={handleToggleFeatured}
              onStockDelta={handleStockDelta}
              onMarkOneSold={handleMarkOneSold}
              onMarkSoldOut={handleMarkSoldOut}
              onQuickRestock={handleQuickRestock}
              onOpenEditModal={openEditModal}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {/* Tab: Manage Product Types */}
          {activeTab === 'types' && (
            <AdminProductTypesTab
              products={products}
              productTypes={productTypes}
              newTypeName={newTypeName}
              onChangeNewTypeName={setNewTypeName}
              newTypeDesc={newTypeDesc}
              onChangeNewTypeDesc={setNewTypeDesc}
              onAddProductType={handleAddProductType}
              onDeleteProductType={handleDeleteProductType}
            />
          )}

          {/* Tab: Orders & Manual bKash TrxID Verification */}
          {activeTab === 'orders' && (
            <AdminOrdersTab
              orders={orders}
              customers={customers}
              onOpenManualOrderModal={openManualOrderModal}
              onRefreshOrders={() => {
                void orderService.syncFromDatabase().then((o) => setOrders([...o]));
                void customerService.getAllCustomers().then((c) => setCustomers(c));
              }}
              onPaymentStatusChange={handlePaymentStatusChange}
              onOrderStatusChange={handleStatusChange}
              onUpdateOrderTracking={handleUpdateOrderTracking}
              onZoomImage={setZoomedImage}
            />
          )}

          {/* Tab: Profit, Cost & Revenue Analytics */}
          {activeTab === 'analytics' && (
            <AdminAnalyticsTab
              products={products}
              productTypes={productTypes}
              shippingCostPerPiece={shippingCostPerPiece}
              onChangeShippingCost={setShippingCostPerPiece}
              analyticsTimeframe={analyticsTimeframe}
              onChangeTimeframe={handleChangeTimeframe}
              analyticsOrderScope={analyticsOrderScope}
              onChangeOrderScope={setAnalyticsOrderScope}
              totalStock={totalStock}
              totalInventoryBaseCost={totalInventoryBaseCost}
              totalInventoryLandedCost={totalInventoryLandedCost}
              totalExpectedRevenue={totalExpectedRevenue}
              totalExpectedNetProfit={totalExpectedNetProfit}
              expectedMarginPercent={expectedMarginPercent}
              analyticsFilteredOrders={analyticsFilteredOrders}
              realizedOrderStats={realizedOrderStats}
              getUnitLandedCost={getUnitLandedCost}
            />
          )}

          {/* Tab: Storefront Chat & Social Links */}
          {activeTab === 'links' && (
            <AdminLinksTab
              storeLinks={storeLinks}
              onChangeStoreLinks={setStoreLinks}
              onUpdateStoreLink={handleUpdateStoreLink}
              onDeleteStoreLink={handleDeleteStoreLink}
              newLinkKey={newLinkKey}
              onChangeNewLinkKey={setNewLinkKey}
              newLinkLabel={newLinkLabel}
              onChangeNewLinkLabel={setNewLinkLabel}
              newLinkUrl={newLinkUrl}
              onChangeNewLinkUrl={setNewLinkUrl}
              newLinkCategory={newLinkCategory}
              onChangeNewLinkCategory={setNewLinkCategory}
              onAddNewStoreLink={handleAddNewStoreLink}
            />
          )}

          {/* Tab: Homepage & Hero Customizer */}
          {activeTab === 'homepage' && (
            <AdminHomepageTab products={products} onNotify={setSyncMessage} />
          )}
        </>
      )}

      {/* Add / Edit Product Modal */}
      <AdminProductModal
        isOpen={isModalOpen}
        editingId={editingId}
        form={form}
        productTypes={productTypes}
        onClose={() => setIsModalOpen(false)}
        onChangeForm={setForm}
        onSaveProduct={handleSaveProduct}
        onZoomImage={setZoomedImage}
      />

      {/* Create Manual Order Modal (WhatsApp / Facebook Messenger) */}
      <AdminManualOrderModal
        isOpen={isManualOrderOpen}
        onClose={() => setIsManualOrderOpen(false)}
        products={products}
        manualSource={manualSource}
        onChangeManualSource={setManualSource}
        manualCustName={manualCustName}
        onChangeManualCustName={setManualCustName}
        manualCustPhone={manualCustPhone}
        onChangeManualCustPhone={setManualCustPhone}
        manualCustAddress={manualCustAddress}
        onChangeManualCustAddress={setManualCustAddress}
        manualDeliveryZone={manualDeliveryZone}
        onChangeManualDeliveryZone={setManualDeliveryZone}
        manualPaymentMethod={manualPaymentMethod}
        onChangeManualPaymentMethod={setManualPaymentMethod}
        manualTrxId={manualTrxId}
        onChangeManualTrxId={setManualTrxId}
        manualSenderPhone={manualSenderPhone}
        onChangeManualSenderPhone={setManualSenderPhone}
        manualSelectedProductId={manualSelectedProductId}
        onChangeManualSelectedProductId={setManualSelectedProductId}
        manualSelectedQty={manualSelectedQty}
        onChangeManualSelectedQty={setManualSelectedQty}
        manualItems={manualItems}
        onAddManualItem={handleAddManualItem}
        onRemoveManualItem={handleRemoveManualItem}
        onSubmitManualOrder={handleSubmitManualOrder}
      />

      {/* Full Image Zoom Modal */}
      <AdminImageZoomModal
        isOpen={Boolean(zoomedImage)}
        image={zoomedImage}
        onClose={() => setZoomedImage(null)}
      />

      {/* Custom Delete Confirmation Modal */}
      <AdminDeleteProductModal
        product={productToDelete}
        onCancel={() => setProductToDelete(null)}
        onConfirmDelete={handleConfirmDeleteProduct}
      />
    </div>
  );
}

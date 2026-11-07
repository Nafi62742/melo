import { Order, OrderStatus, PaymentStatus } from '../models/order.model';
import { supabaseClient } from './supabase.client';

const ORDERS_STORAGE_KEY = 'melo_orders';
const BKASH_NUMBER_KEY = 'melo_bkash_number';
const DEFAULT_BKASH_NUMBER = process.env.NEXT_PUBLIC_BKASH_NUMBER || '01760887297';

export const isValidUuid = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

/**
 * OrderRepository — Handles all database (`public.orders`) and local storage
 * persistence for customer & manual orders.
 */
export class OrderRepository {
  private memoryOrders: Order[] = [];

  loadLocal(): Order[] {
    if (typeof window === 'undefined') return this.memoryOrders;
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as Order[];
      }
    } catch {
      // ignore storage errors
    }
    return this.memoryOrders;
  }

  saveLocal(orders: Order[]): void {
    this.memoryOrders = orders;
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // ignore storage errors
    }
  }

  getBkashNumber(): string {
    if (typeof window === 'undefined') return DEFAULT_BKASH_NUMBER;
    try {
      return localStorage.getItem(BKASH_NUMBER_KEY) || DEFAULT_BKASH_NUMBER;
    } catch {
      return DEFAULT_BKASH_NUMBER;
    }
  }

  setBkashNumber(phone: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(BKASH_NUMBER_KEY, phone.trim() || DEFAULT_BKASH_NUMBER);
    } catch {
      // ignore storage errors
    }
  }

  async fetchAllFromDb(): Promise<Order[] | null> {
    if (!supabaseClient.isConfigured()) return null;
    try {
      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/orders?select=*&order=createdAt.desc`,
        {
          headers: supabaseClient.getHeaders(),
          cache: 'no-store',
        }
      );
      if (!res.ok) return null;
      return (await res.json()) as Order[];
    } catch {
      return null;
    }
  }

  async insertInDb(order: Order): Promise<boolean> {
    if (!supabaseClient.isConfigured()) return false;
    try {
      const payload = {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        customerId: isValidUuid(order.customerId) ? order.customerId : null,
        customerPhone: order.customerPhone || order.customer.phone,
        customerName: order.customer.fullName,
        deliveryAddress: order.customer.address,
        deliveryZone: order.customer.deliveryZone,
        orderSource: order.customer.orderSource || 'website',
        customer: order.customer,
        items: order.items,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        paymentMethod: order.paymentMethod,
        status: order.status,
        paymentStatus: order.paymentStatus,
        trxId: order.trxId || null,
        bkashSenderNumber: order.bkashSenderNumber || null,
        cardLast4: order.cardLast4 || null,
        trackingNumber: order.trackingNumber || null,
        courierName: order.courierName || null,
        courierTrackingUrl: order.courierTrackingUrl || null,
        estimatedDelivery: order.estimatedDelivery || null,
        dispatchedAt: order.dispatchedAt || null,
        deliveredAt: order.deliveredAt || null,
      };

      const res = await fetch(`${supabaseClient.baseUrl}/rest/v1/orders`, {
        method: 'POST',
        headers: supabaseClient.getHeaders({
          Prefer: 'resolution=merge-duplicates',
        }),
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async updateCustomerIdInDb(orderId: string, customerId: string): Promise<boolean> {
    if (!supabaseClient.isConfigured() || !isValidUuid(customerId)) return false;
    try {
      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
        {
          method: 'PATCH',
          headers: supabaseClient.getHeaders(),
          body: JSON.stringify({ customerId }),
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  async updateStatusInDb(orderId: string, status: OrderStatus): Promise<boolean> {
    if (!supabaseClient.isConfigured()) return false;
    try {
      const patch: Record<string, unknown> = { status };
      if (status === 'dispatched') {
        patch.dispatchedAt = new Date().toISOString();
      } else if (status === 'delivered') {
        patch.deliveredAt = new Date().toISOString();
      }

      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
        {
          method: 'PATCH',
          headers: supabaseClient.getHeaders(),
          body: JSON.stringify(patch),
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  async updateTrackingInDb(
    orderId: string,
    tracking: {
      trackingNumber: string;
      courierName?: string;
      courierTrackingUrl?: string;
      estimatedDelivery?: string;
      status?: OrderStatus;
    }
  ): Promise<boolean> {
    if (!supabaseClient.isConfigured()) return false;
    try {
      const patch: Record<string, unknown> = {
        trackingNumber: tracking.trackingNumber,
        ...(tracking.courierName ? { courierName: tracking.courierName } : {}),
        ...(tracking.courierTrackingUrl ? { courierTrackingUrl: tracking.courierTrackingUrl } : {}),
        ...(tracking.estimatedDelivery ? { estimatedDelivery: tracking.estimatedDelivery } : {}),
        ...(tracking.status ? { status: tracking.status } : {}),
      };
      if (tracking.status === 'dispatched') {
        patch.dispatchedAt = new Date().toISOString();
      }

      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
        {
          method: 'PATCH',
          headers: supabaseClient.getHeaders(),
          body: JSON.stringify(patch),
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  async updatePaymentStatusInDb(orderId: string, paymentStatus: PaymentStatus): Promise<boolean> {
    if (!supabaseClient.isConfigured()) return false;
    try {
      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
        {
          method: 'PATCH',
          headers: supabaseClient.getHeaders(),
          body: JSON.stringify({ paymentStatus }),
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  async updateTrxIdInDb(
    orderId: string,
    trxId: string,
    bkashSenderNumber?: string
  ): Promise<boolean> {
    if (!supabaseClient.isConfigured()) return false;
    try {
      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
        {
          method: 'PATCH',
          headers: supabaseClient.getHeaders(),
          body: JSON.stringify({
            trxId,
            ...(bkashSenderNumber ? { bkashSenderNumber } : {}),
          }),
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const orderRepository = new OrderRepository();


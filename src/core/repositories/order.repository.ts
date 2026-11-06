import { Order, OrderStatus, PaymentStatus } from '../models/order.model';
import { supabaseClient } from './supabase.client';

const ORDERS_STORAGE_KEY = 'melo_orders';
const BKASH_NUMBER_KEY = 'melo_bkash_number';
const DEFAULT_BKASH_NUMBER = process.env.NEXT_PUBLIC_BKASH_NUMBER || '01760887297';

/**
 * OrderRepository — Handles all database (`public.orders`) and local storage
 * persistence for customer & manual orders.
 */
export class OrderRepository {
  loadLocal(): Order[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as Order[];
      }
    } catch {
      // ignore storage errors
    }
    return [];
  }

  saveLocal(orders: Order[]): void {
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
      const res = await fetch(`${supabaseClient.baseUrl}/rest/v1/orders`, {
        method: 'POST',
        headers: supabaseClient.getHeaders(),
        body: JSON.stringify(order),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async updateStatusInDb(orderId: string, status: OrderStatus): Promise<boolean> {
    if (!supabaseClient.isConfigured()) return false;
    try {
      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
        {
          method: 'PATCH',
          headers: supabaseClient.getHeaders(),
          body: JSON.stringify({ status }),
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


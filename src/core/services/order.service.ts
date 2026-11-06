import { Order, OrderStatus, PaymentStatus } from '../models/order.model';
import { supabaseService } from './supabase.service';

const STORAGE_KEY = 'melo_orders';
const BKASH_NUMBER_KEY = 'melo_bkash_number';
const DEFAULT_BKASH_NUMBER = process.env.NEXT_PUBLIC_BKASH_NUMBER || '01760887297';

class OrderService {
  getOrders(): Order[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  }

  async syncFromDatabase(): Promise<Order[]> {
    const remote = await supabaseService.fetchOrders();
    if (remote && Array.isArray(remote)) {
      if (typeof window !== 'undefined' && remote.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
      }
      return remote.length > 0 ? remote : this.getOrders();
    }
    return this.getOrders();
  }

  getOrderById(id: string): Order | undefined {
    const orders = this.getOrders();
    return orders.find((o) => o.id === id || o.orderNumber === id);
  }

  getOrdersByPhone(phone: string): Order[] {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone) return [];
    return this.getOrders().filter(
      (o) =>
        o.customer.phone.trim().replace(/\s+/g, '') === cleanPhone ||
        o.customerPhone?.trim().replace(/\s+/g, '') === cleanPhone
    );
  }

  saveOrder(order: Order): Order {
    const normalizedOrder: Order = {
      ...order,
      customerPhone: order.customer.phone.trim(),
    };
    const orders = this.getOrders();
    const updated = [normalizedOrder, ...orders];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    void supabaseService.insertOrder(normalizedOrder);
    return normalizedOrder;
  }

  updateOrderTrxId(orderId: string, trxId: string, bkashSenderNumber?: string): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return false;

    orders[index].trxId = trxId.trim().toUpperCase();
    if (bkashSenderNumber?.trim()) {
      orders[index].bkashSenderNumber = bkashSenderNumber.trim();
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
    void supabaseService.updateOrderTrxId(
      orderId,
      orders[index].trxId!,
      orders[index].bkashSenderNumber
    );
    return true;
  }

  updateOrderStatus(orderId: string, status: OrderStatus): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return false;

    orders[index].status = status;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
    void supabaseService.updateOrderStatus(orderId, status);
    return true;
  }

  updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return false;

    orders[index].paymentStatus = paymentStatus;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
    void supabaseService.updatePaymentStatus(orderId, paymentStatus);
    return true;
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
      // ignore
    }
  }
}

export const orderService = new OrderService();

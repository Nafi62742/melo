import { Order, OrderStatus } from '../models/order.model';

const STORAGE_KEY = 'melo_orders';

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

  getOrderById(id: string): Order | undefined {
    const orders = this.getOrders();
    return orders.find((o) => o.id === id || o.orderNumber === id);
  }

  saveOrder(order: Order): Order {
    const orders = this.getOrders();
    const updated = [order, ...orders];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return order;
  }

  updateOrderStatus(orderId: string, status: OrderStatus): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return false;

    orders[index].status = status;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
    return true;
  }
}

export const orderService = new OrderService();


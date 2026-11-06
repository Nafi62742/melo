import { Order, OrderStatus, PaymentStatus } from '../models/order.model';
import { orderRepository } from '../repositories/order.repository';

/**
 * OrderService — Domain service for website and manual (WhatsApp / Messenger) orders.
 * Delegates all DB & storage I/O to OrderRepository.
 */
class OrderService {
  getOrders(): Order[] {
    return orderRepository.loadLocal();
  }

  async syncFromDatabase(): Promise<Order[]> {
    const remote = await orderRepository.fetchAllFromDb();
    if (remote && Array.isArray(remote)) {
      if (remote.length > 0) {
        orderRepository.saveLocal(remote);
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
    orderRepository.saveLocal(updated);
    void orderRepository.insertInDb(normalizedOrder);
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
    orderRepository.saveLocal(orders);
    void orderRepository.updateTrxIdInDb(
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
    orderRepository.saveLocal(orders);
    void orderRepository.updateStatusInDb(orderId, status);
    return true;
  }

  updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return false;

    orders[index].paymentStatus = paymentStatus;
    orderRepository.saveLocal(orders);
    void orderRepository.updatePaymentStatusInDb(orderId, paymentStatus);
    return true;
  }

  getBkashNumber(): string {
    return orderRepository.getBkashNumber();
  }

  setBkashNumber(phone: string): void {
    orderRepository.setBkashNumber(phone);
  }
}

export const orderService = new OrderService();

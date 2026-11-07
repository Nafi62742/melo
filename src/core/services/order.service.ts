import { Order, OrderStatus, PaymentStatus } from '../models/order.model';
import { orderRepository, isValidUuid } from '../repositories/order.repository';
import { customerService } from './customer.service';
import { cleanPhoneNumber } from '../utils/tracking.util';

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
    const clean = id.trim().toLowerCase();
    return orders.find(
      (o) =>
        o.id.toLowerCase() === clean ||
        o.orderNumber.toLowerCase() === clean ||
        (o.trackingNumber && o.trackingNumber.toLowerCase() === clean)
    );
  }

  getOrdersByPhone(phone: string): Order[] {
    const cleanPhone = cleanPhoneNumber(phone);
    if (!cleanPhone) return [];
    return this.getOrders().filter(
      (o) =>
        cleanPhoneNumber(o.customer.phone) === cleanPhone ||
        (o.customerPhone && cleanPhoneNumber(o.customerPhone) === cleanPhone)
    );
  }

  trackOrders(query: string): Order[] {
    const q = query.trim();
    if (!q) return [];
    const cleanPhone = cleanPhoneNumber(q);

    // 1. If it looks like a phone number (digits >= 7)
    if (/^\d{7,15}$/.test(cleanPhone)) {
      const byPhone = this.getOrdersByPhone(cleanPhone);
      if (byPhone.length > 0) return byPhone;
    }

    // 2. Search by orderNumber, id, or trackingNumber
    const single = this.getOrderById(q);
    if (single) return [single];

    // 3. Fallback partial search
    const lower = q.toLowerCase();
    return this.getOrders().filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(lower) ||
        o.id.toLowerCase().includes(lower) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(lower)) ||
        (o.trxId && o.trxId.toLowerCase().includes(lower))
    );
  }

  saveOrder(order: Order): Order {
    const normalizedPhone = order.customer.phone.trim();
    const currentCustomer = customerService.getCurrentCustomer();

    const normalizedOrder: Order = {
      ...order,
      customerPhone: normalizedPhone,
      customerId: order.customerId || (currentCustomer ? currentCustomer.id : undefined),
    };

    const orders = this.getOrders();
    const updated = [normalizedOrder, ...orders];
    orderRepository.saveLocal(updated);
    void orderRepository.insertInDb(normalizedOrder);

    // Auto-link / update customer record
    void customerService
      .ensureCustomerFromOrder(normalizedOrder.customer, normalizedOrder.total)
      .then((profile) => {
        if (profile?.id && isValidUuid(profile.id)) {
          normalizedOrder.customerId = profile.id;
          const currentLocal = this.getOrders();
          const target = currentLocal.find((o) => o.id === normalizedOrder.id);
          if (target) {
            target.customerId = profile.id;
            orderRepository.saveLocal(currentLocal);
          }
          void orderRepository.updateCustomerIdInDb(normalizedOrder.id, profile.id);
        }
      });

    return normalizedOrder;
  }

  updateOrderTracking(
    orderId: string,
    trackingData: {
      trackingNumber: string;
      courierName?: string;
      courierTrackingUrl?: string;
      estimatedDelivery?: string;
      status?: OrderStatus;
    }
  ): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return false;

    orders[index] = {
      ...orders[index],
      trackingNumber: trackingData.trackingNumber.trim(),
      ...(trackingData.courierName ? { courierName: trackingData.courierName.trim() } : {}),
      ...(trackingData.courierTrackingUrl
        ? { courierTrackingUrl: trackingData.courierTrackingUrl.trim() }
        : {}),
      ...(trackingData.estimatedDelivery
        ? { estimatedDelivery: trackingData.estimatedDelivery.trim() }
        : {}),
      ...(trackingData.status ? { status: trackingData.status } : {}),
      dispatchedAt:
        trackingData.status === 'dispatched'
          ? orders[index].dispatchedAt || new Date().toISOString()
          : orders[index].dispatchedAt,
    };

    orderRepository.saveLocal(orders);
    void orderRepository.updateTrackingInDb(orderId, trackingData);
    return true;
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

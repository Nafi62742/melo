import { orderService } from './order.service';
import { Order } from '../models/order.model';

describe('OrderService', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should save a new order and retrieve it', () => {
    const testOrder: Order = {
      id: 'ord-test-1',
      orderNumber: 'MELO-123456',
      createdAt: new Date().toISOString(),
      customer: {
        fullName: 'Tanvir Ahmed',
        phone: '01711223344',
        address: 'Dhanmondi 27, Dhaka',
        deliveryZone: 'inside_dhaka',
      },
      items: [],
      subtotal: 500,
      deliveryFee: 60,
      total: 560,
      paymentMethod: 'cod',
      status: 'pending',
      paymentStatus: 'pending',
    };

    const saved = orderService.saveOrder(testOrder);
    expect(saved.id).toBe('ord-test-1');

    const retrieved = orderService.getOrderById('MELO-123456');
    expect(retrieved).toBeDefined();
    expect(retrieved?.customer.fullName).toBe('Tanvir Ahmed');
  });

  it('should update order status correctly', () => {
    const testOrder: Order = {
      id: 'ord-test-2',
      orderNumber: 'MELO-999888',
      createdAt: new Date().toISOString(),
      customer: {
        fullName: 'Nusrat Jahan',
        phone: '01811223344',
        address: 'Chittagong GEC',
        deliveryZone: 'outside_dhaka',
      },
      items: [],
      subtotal: 700,
      deliveryFee: 120,
      total: 820,
      paymentMethod: 'bkash',
      status: 'pending',
      paymentStatus: 'verified',
    };

    orderService.saveOrder(testOrder);
    const updated = orderService.updateOrderStatus('ord-test-2', 'dispatched');
    expect(updated).toBe(true);

    const retrieved = orderService.getOrderById('ord-test-2');
    expect(retrieved?.status).toBe('dispatched');
  });
});

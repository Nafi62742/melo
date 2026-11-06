import { CartItem } from './cart.model';

export type DeliveryZone = 'inside_dhaka' | 'outside_dhaka';
export type PaymentMethod = 'card' | 'bkash' | 'cod';
export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'verified' | 'failed';
export type OrderSource = 'website' | 'whatsapp' | 'messenger';

export interface OrderCustomerInfo {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  deliveryZone: DeliveryZone;
  notes?: string;
  orderSource?: OrderSource;
  customerId?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerId?: string;
  customerPhone?: string;
  customer: OrderCustomerInfo;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  trxId?: string;
  bkashSenderNumber?: string;
  cardLast4?: string;
  // Courier & Tracking Details
  trackingNumber?: string;
  courierName?: string;
  courierTrackingUrl?: string;
  estimatedDelivery?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
}

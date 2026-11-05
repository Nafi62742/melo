import { CartItem } from './cart.model';

export type DeliveryZone = 'inside_dhaka' | 'outside_dhaka';
export type PaymentMethod = 'cod' | 'bkash' | 'nagad';
export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';

export interface OrderCustomerInfo {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  deliveryZone: DeliveryZone;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: OrderCustomerInfo;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  paymentStatus: 'pending' | 'verified' | 'failed';
  trxId?: string;
}


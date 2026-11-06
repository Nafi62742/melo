import { DeliveryZone } from './order.model';

export interface CustomerProfile {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  password?: string;
  defaultAddress: string;
  deliveryZone: DeliveryZone;
  savedTrxIds: string[];
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
}


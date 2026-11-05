import { Product } from './product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  totalQuantity: number;
}


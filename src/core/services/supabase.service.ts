import { Product } from '../models/product.model';
import { ProductType } from '../models/product-type.model';
import { Order, OrderStatus, PaymentStatus } from '../models/order.model';
import { StoreLink } from '../models/store-link.model';
import { CustomerProfile } from '../models/customer.model';
import { supabaseClient } from '../repositories/supabase.client';
import { adminRepository } from '../repositories/admin.repository';
import { productRepository } from '../repositories/product.repository';
import { productTypeRepository } from '../repositories/product-type.repository';
import { orderRepository } from '../repositories/order.repository';
import { customerRepository } from '../repositories/customer.repository';
import { storeLinkRepository } from '../repositories/store-link.repository';

/**
 * SupabaseService — Facade delegating all database operations to their respective
 * domain repositories in `src/core/repositories/`.
 */
class SupabaseService {
  isConfigured(): boolean {
    return supabaseClient.isConfigured();
  }

  async checkConnection(): Promise<boolean> {
    return supabaseClient.checkConnection();
  }

  async verifyAdminCredentials(email: string, password: string): Promise<boolean> {
    return adminRepository.verifyCredentialsInDb(email, password);
  }

  async fetchProductTypes(): Promise<ProductType[] | null> {
    return productTypeRepository.fetchAllFromDb();
  }

  async upsertProductType(productType: ProductType): Promise<boolean> {
    return productTypeRepository.upsertInDb(productType);
  }

  async seedProductTypes(productTypes: ProductType[]): Promise<boolean> {
    return productTypeRepository.upsertBatchInDb(productTypes);
  }

  async deleteProductType(slug: string): Promise<boolean> {
    return productTypeRepository.deleteFromDb(slug);
  }

  async fetchProducts(): Promise<Product[] | null> {
    return productRepository.fetchAllFromDb();
  }

  async upsertProduct(product: Product): Promise<boolean> {
    return productRepository.upsertInDb(product);
  }

  async seedProducts(products: Product[]): Promise<boolean> {
    return productRepository.upsertBatchInDb(products);
  }

  async deleteProduct(productId: string): Promise<boolean> {
    return productRepository.deleteFromDb(productId);
  }

  async fetchOrders(): Promise<Order[] | null> {
    return orderRepository.fetchAllFromDb();
  }

  async insertOrder(order: Order): Promise<boolean> {
    return orderRepository.insertInDb(order);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    return orderRepository.updateStatusInDb(orderId, status);
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<boolean> {
    return orderRepository.updatePaymentStatusInDb(orderId, paymentStatus);
  }

  async updateOrderTrxId(
    orderId: string,
    trxId: string,
    bkashSenderNumber?: string
  ): Promise<boolean> {
    return orderRepository.updateTrxIdInDb(orderId, trxId, bkashSenderNumber);
  }

  async fetchStoreLinks(): Promise<StoreLink[] | null> {
    return storeLinkRepository.fetchAllFromDb();
  }

  async upsertStoreLink(link: StoreLink): Promise<boolean> {
    return storeLinkRepository.upsertInDb(link);
  }

  async seedStoreLinks(links: StoreLink[]): Promise<boolean> {
    return storeLinkRepository.upsertBatchInDb(links);
  }

  async deleteStoreLink(key: string): Promise<boolean> {
    return storeLinkRepository.deleteFromDb(key);
  }

  async upsertCustomer(
    customer: CustomerProfile,
    password?: string
  ): Promise<CustomerProfile | null> {
    return customerRepository.upsertInDb(customer, password);
  }

  async loginCustomer(phone: string, password: string): Promise<CustomerProfile | null> {
    return customerRepository.findByCredentialsInDb(phone, password);
  }
}

export const supabaseService = new SupabaseService();

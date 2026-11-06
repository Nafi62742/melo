import { CustomerProfile } from '../models/customer.model';
import { DeliveryZone, OrderCustomerInfo } from '../models/order.model';
import { customerRepository } from '../repositories/customer.repository';

/**
 * CustomerService — Domain service for customer registration, login, and profile management.
 * Delegates all DB & storage I/O to CustomerRepository.
 */
class CustomerService {
  getCurrentCustomer(): CustomerProfile | null {
    return customerRepository.loadCurrentLocal();
  }

  setCurrentCustomer(customer: CustomerProfile | null): void {
    customerRepository.saveCurrentLocal(customer);
  }

  async register(params: {
    phone: string;
    fullName: string;
    password: string;
    email?: string;
    defaultAddress: string;
    deliveryZone?: DeliveryZone;
  }): Promise<CustomerProfile> {
    const cleanPhone = params.phone.trim().replace(/\s+/g, '');
    const profile: CustomerProfile = {
      id: `cust-${Date.now()}`,
      phone: cleanPhone,
      email: params.email?.trim() || undefined,
      fullName: params.fullName.trim(),
      defaultAddress: params.defaultAddress.trim(),
      deliveryZone: params.deliveryZone || 'inside_dhaka',
      savedTrxIds: [],
      createdAt: new Date().toISOString(),
    };

    customerRepository.saveLocalCustomer({ ...profile, password: params.password.trim() });
    const remote = await customerRepository.upsertInDb(profile, params.password.trim());
    const finalProfile = remote || profile;
    this.setCurrentCustomer(finalProfile);
    return finalProfile;
  }

  async login(phone: string, password: string): Promise<CustomerProfile | null> {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanPass = password.trim();

    // 1. Check Supabase public.customers table via CustomerRepository
    const remote = await customerRepository.findByCredentialsInDb(cleanPhone, cleanPass);
    if (remote) {
      customerRepository.saveLocalCustomer({ ...remote, password: cleanPass });
      this.setCurrentCustomer(remote);
      return remote;
    }

    // 2. Fallback to demo customer (01700000000 / melo1234)
    if (cleanPhone === '01700000000' && cleanPass === 'melo1234') {
      const demo: CustomerProfile = {
        id: 'cust-demo',
        phone: '01700000000',
        email: 'customer@melo.com',
        fullName: 'Nusrat Jahan',
        defaultAddress: 'House 14, Road 27, Dhanmondi, Dhaka',
        deliveryZone: 'inside_dhaka',
        savedTrxIds: ['BKJ82910XY'],
        createdAt: new Date().toISOString(),
      };
      this.setCurrentCustomer(demo);
      return demo;
    }

    // 3. Fallback to local customer records
    const local = customerRepository
      .loadAllLocal()
      .find((c) => c.phone === cleanPhone && c.password === cleanPass);
    if (local) {
      this.setCurrentCustomer(local);
      return local;
    }

    return null;
  }

  async addTrxIdToCustomer(phone: string, trxId: string): Promise<void> {
    const cleanTrx = trxId.trim().toUpperCase();
    if (!cleanTrx) return;

    const current = this.getCurrentCustomer();
    if (current && current.phone === phone.trim().replace(/\s+/g, '')) {
      const nextTrxIds = Array.from(new Set([cleanTrx, ...(current.savedTrxIds || [])]));
      const updated: CustomerProfile = {
        ...current,
        savedTrxIds: nextTrxIds,
      };
      this.setCurrentCustomer(updated);
      customerRepository.saveLocalCustomer(updated);
      await customerRepository.upsertInDb(updated);
    }
  }

  logout(): void {
    this.setCurrentCustomer(null);
  }

  async ensureCustomerFromOrder(
    info: OrderCustomerInfo,
    orderTotal: number
  ): Promise<CustomerProfile> {
    const cleanPhone = info.phone.trim().replace(/\s+/g, '');

    // 1. Check if customer already exists in DB or local
    let existing = await customerRepository.findByPhoneInDb(cleanPhone);
    if (!existing) {
      existing = customerRepository.loadAllLocal().find((c) => c.phone === cleanPhone) || null;
    }

    if (existing) {
      const updated: CustomerProfile = {
        ...existing,
        fullName: info.fullName.trim() || existing.fullName,
        defaultAddress: info.address.trim() || existing.defaultAddress,
        deliveryZone: info.deliveryZone || existing.deliveryZone,
        totalOrders: (existing.totalOrders || 0) + 1,
        totalSpent: (existing.totalSpent || 0) + orderTotal,
      };
      customerRepository.saveLocalCustomer(updated);
      void customerRepository.upsertInDb(updated);

      const current = this.getCurrentCustomer();
      if (current && current.phone === cleanPhone) {
        this.setCurrentCustomer(updated);
      }
      return updated;
    }

    // 2. Auto-create guest customer profile so order is tied to them
    const newProfile: CustomerProfile = {
      id: `cust-${Date.now()}`,
      phone: cleanPhone,
      email: info.email?.trim() || undefined,
      fullName: info.fullName.trim(),
      defaultAddress: info.address.trim(),
      deliveryZone: info.deliveryZone,
      totalOrders: 1,
      totalSpent: orderTotal,
      savedTrxIds: [],
      createdAt: new Date().toISOString(),
    };

    customerRepository.saveLocalCustomer(newProfile);
    void customerRepository.upsertInDb(newProfile);
    return newProfile;
  }

  async getAllCustomers(): Promise<CustomerProfile[]> {
    const remote = await customerRepository.fetchAllFromDb();
    if (remote && Array.isArray(remote) && remote.length > 0) {
      return remote;
    }
    return customerRepository.loadAllLocal().map((c) => ({
      id: c.id,
      phone: c.phone,
      email: c.email,
      fullName: c.fullName,
      defaultAddress: c.defaultAddress,
      deliveryZone: c.deliveryZone,
      totalOrders: c.totalOrders ?? 0,
      totalSpent: c.totalSpent ?? 0,
      savedTrxIds: c.savedTrxIds || [],
      createdAt: c.createdAt,
    }));
  }
}

export const customerService = new CustomerService();

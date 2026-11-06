import { CustomerProfile } from '../models/customer.model';
import { DeliveryZone } from '../models/order.model';
import { supabaseService } from './supabase.service';

const CURRENT_CUSTOMER_KEY = 'melo_current_customer';
const CUSTOMERS_LIST_KEY = 'melo_customers_list';

class CustomerService {
  private getAllLocalCustomers(): Array<CustomerProfile & { password?: string }> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(CUSTOMERS_LIST_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return [];
  }

  private saveLocalCustomer(customer: CustomerProfile & { password?: string }): void {
    if (typeof window === 'undefined') return;
    try {
      const all = this.getAllLocalCustomers();
      const idx = all.findIndex((c) => c.phone === customer.phone);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...customer };
      } else {
        all.push(customer);
      }
      localStorage.setItem(CUSTOMERS_LIST_KEY, JSON.stringify(all));
    } catch {
      // ignore
    }
  }

  getCurrentCustomer(): CustomerProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(CURRENT_CUSTOMER_KEY);
      if (raw) {
        return JSON.parse(raw) as CustomerProfile;
      }
    } catch {
      // ignore
    }
    return null;
  }

  setCurrentCustomer(customer: CustomerProfile | null): void {
    if (typeof window === 'undefined') return;
    try {
      if (customer) {
        localStorage.setItem(CURRENT_CUSTOMER_KEY, JSON.stringify(customer));
      } else {
        localStorage.removeItem(CURRENT_CUSTOMER_KEY);
      }
    } catch {
      // ignore
    }
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

    this.saveLocalCustomer({ ...profile, password: params.password.trim() });
    const remote = await supabaseService.upsertCustomer(profile, params.password.trim());
    const finalProfile = remote || profile;
    this.setCurrentCustomer(finalProfile);
    return finalProfile;
  }

  async login(phone: string, password: string): Promise<CustomerProfile | null> {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanPass = password.trim();

    // 1. Check Supabase public.customers table first
    const remote = await supabaseService.loginCustomer(cleanPhone, cleanPass);
    if (remote) {
      this.saveLocalCustomer({ ...remote, password: cleanPass });
      this.setCurrentCustomer(remote);
      return remote;
    }

    // 2. Fallback to local customer records (or demo customer 01700000000 / melo1234)
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

    const local = this.getAllLocalCustomers().find(
      (c) => c.phone === cleanPhone && c.password === cleanPass
    );
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
      this.saveLocalCustomer(updated);
      await supabaseService.upsertCustomer(updated);
    }
  }

  logout(): void {
    this.setCurrentCustomer(null);
  }
}

export const customerService = new CustomerService();


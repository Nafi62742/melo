import { CustomerProfile } from '../models/customer.model';
import { DeliveryZone } from '../models/order.model';
import { supabaseClient } from './supabase.client';

const CURRENT_CUSTOMER_KEY = 'melo_current_customer';
const CUSTOMERS_LIST_KEY = 'melo_customers_list';

interface CustomerRow {
  id?: string;
  phone: string;
  email?: string | null;
  full_name: string;
  password?: string;
  default_address: string;
  delivery_zone: DeliveryZone;
  total_orders?: number;
  total_spent?: number;
  saved_trx_ids: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * CustomerRepository — Handles all database (`public.customers`) and local storage
 * persistence for customer accounts and sessions.
 */
export class CustomerRepository {
  loadAllLocal(): Array<CustomerProfile & { password?: string }> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(CUSTOMERS_LIST_KEY);
      if (raw) {
        return JSON.parse(raw) as Array<CustomerProfile & { password?: string }>;
      }
    } catch {
      // ignore
    }
    return [];
  }

  saveLocalCustomer(customer: CustomerProfile & { password?: string }): void {
    if (typeof window === 'undefined') return;
    try {
      const all = this.loadAllLocal();
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

  loadCurrentLocal(): CustomerProfile | null {
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

  saveCurrentLocal(customer: CustomerProfile | null): void {
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

  async upsertInDb(customer: CustomerProfile, password?: string): Promise<CustomerProfile | null> {
    if (!supabaseClient.isConfigured()) return null;
    try {
      const payload: CustomerRow = {
        phone: customer.phone,
        email: customer.email || null,
        full_name: customer.fullName,
        ...(password ? { password } : {}),
        default_address: customer.defaultAddress,
        delivery_zone: customer.deliveryZone,
        total_orders: customer.totalOrders ?? 0,
        total_spent: customer.totalSpent ?? 0,
        saved_trx_ids: customer.savedTrxIds,
        updated_at: new Date().toISOString(),
      };
      const res = await fetch(`${supabaseClient.baseUrl}/rest/v1/customers?on_conflict=phone`, {
        method: 'POST',
        headers: supabaseClient.getHeaders({
          Prefer: 'resolution=merge-duplicates,return=representation',
        }),
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      const rows = (await res.json()) as CustomerRow[];
      const row = rows[0];
      if (!row) return null;
      return {
        id: row.id || customer.id,
        phone: row.phone,
        email: row.email || undefined,
        fullName: row.full_name,
        defaultAddress: row.default_address,
        deliveryZone: row.delivery_zone,
        totalOrders: row.total_orders ?? customer.totalOrders ?? 0,
        totalSpent: row.total_spent ?? customer.totalSpent ?? 0,
        savedTrxIds: Array.isArray(row.saved_trx_ids) ? row.saved_trx_ids : [],
        createdAt: row.created_at || customer.createdAt,
      };
    } catch {
      return null;
    }
  }

  async fetchAllFromDb(): Promise<CustomerProfile[] | null> {
    if (!supabaseClient.isConfigured()) return null;
    try {
      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/customers?select=*&order=created_at.desc`,
        {
          headers: supabaseClient.getHeaders(),
          cache: 'no-store',
        }
      );
      if (!res.ok) return null;
      const rows = (await res.json()) as CustomerRow[];
      return rows.map((r) => ({
        id: r.id || `cust-${r.phone}`,
        phone: r.phone,
        email: r.email || undefined,
        fullName: r.full_name,
        defaultAddress: r.default_address,
        deliveryZone: r.delivery_zone,
        totalOrders: r.total_orders ?? 0,
        totalSpent: r.total_spent ?? 0,
        savedTrxIds: Array.isArray(r.saved_trx_ids) ? r.saved_trx_ids : [],
        createdAt: r.created_at || new Date().toISOString(),
      }));
    } catch {
      return null;
    }
  }

  async findByPhoneInDb(phone: string): Promise<CustomerProfile | null> {
    if (!supabaseClient.isConfigured()) return null;
    try {
      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/customers?phone=eq.${encodeURIComponent(
          phone.trim()
        )}&select=*`,
        {
          headers: supabaseClient.getHeaders(),
          cache: 'no-store',
        }
      );
      if (!res.ok) return null;
      const rows = (await res.json()) as CustomerRow[];
      const row = rows[0];
      if (!row) return null;
      return {
        id: row.id || `cust-${row.phone}`,
        phone: row.phone,
        email: row.email || undefined,
        fullName: row.full_name,
        defaultAddress: row.default_address,
        deliveryZone: row.delivery_zone,
        totalOrders: row.total_orders ?? 0,
        totalSpent: row.total_spent ?? 0,
        savedTrxIds: Array.isArray(row.saved_trx_ids) ? row.saved_trx_ids : [],
        createdAt: row.created_at || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  async findByCredentialsInDb(phone: string, password: string): Promise<CustomerProfile | null> {
    if (!supabaseClient.isConfigured()) return null;
    try {
      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/customers?phone=eq.${encodeURIComponent(
          phone.trim()
        )}&password=eq.${encodeURIComponent(password.trim())}&select=*`,
        {
          headers: supabaseClient.getHeaders(),
          cache: 'no-store',
        }
      );
      if (!res.ok) return null;
      const rows = (await res.json()) as CustomerRow[];
      const row = rows[0];
      if (!row) return null;
      return {
        id: row.id || `cust-${Date.now()}`,
        phone: row.phone,
        email: row.email || undefined,
        fullName: row.full_name,
        defaultAddress: row.default_address,
        deliveryZone: row.delivery_zone,
        savedTrxIds: Array.isArray(row.saved_trx_ids) ? row.saved_trx_ids : [],
        createdAt: row.created_at || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }
}

export const customerRepository = new CustomerRepository();


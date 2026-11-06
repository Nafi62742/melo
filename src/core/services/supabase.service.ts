import { Product } from '../models/product.model';
import { Order, OrderStatus, PaymentStatus, DeliveryZone } from '../models/order.model';
import { StoreLink, StoreLinkCategory } from '../models/store-link.model';
import { CustomerProfile } from '../models/customer.model';

interface CustomerRow {
  id?: string;
  phone: string;
  email?: string | null;
  full_name: string;
  password?: string;
  default_address: string;
  delivery_zone: DeliveryZone;
  saved_trx_ids: string[];
  created_at?: string;
  updated_at?: string;
}

interface StoreLinkRow {
  key: string;
  label: string;
  url: string;
  category: StoreLinkCategory;
  is_active: boolean;
  updated_at?: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const DEFAULT_ADMIN_EMAIL = 'melo@gmail.com';
const DEFAULT_ADMIN_PASS = 'hippo#aurora';

/**
 * Lightweight zero-dependency Supabase REST client for MELO.
 * Automatically activates when NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local.
 */
class SupabaseService {
  isConfigured(): boolean {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Prefer: 'return=representation',
    };
    if (SUPABASE_ANON_KEY.startsWith('eyJ')) {
      headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
    }
    return headers;
  }

  async checkConnection(): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id&limit=1`, {
        headers: this.getHeaders(),
        cache: 'no-store',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Verifies admin credentials against public.admins table in Supabase,
   * with fallback to default credentials when running locally without DB.
   */
  async verifyAdminCredentials(email: string, password: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Always allow default admin credentials (melo@gmail.com / hippo#aurora)
    if (
      cleanEmail === DEFAULT_ADMIN_EMAIL &&
      (password === DEFAULT_ADMIN_PASS || cleanPass === DEFAULT_ADMIN_PASS)
    ) {
      return true;
    }

    if (this.isConfigured()) {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/admins?email=eq.${encodeURIComponent(
            cleanEmail
          )}&password=eq.${encodeURIComponent(cleanPass)}&select=id,email,role`,
          {
            headers: this.getHeaders(),
            cache: 'no-store',
          }
        );
        if (res.ok) {
          const rows = (await res.json()) as Array<{ id: string; email: string }>;
          if (Array.isArray(rows) && rows.length > 0) {
            return true;
          }
        }
      } catch {
        // Fallback if network/DB is unreachable
      }
    }

    return false;
  }

  async fetchProducts(): Promise<Product[] | null> {
    if (!this.isConfigured()) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=id.asc`, {
        headers: this.getHeaders(),
        cache: 'no-store',
      });
      if (!res.ok) return null;
      return (await res.json()) as Product[];
    } catch {
      return null;
    }
  }

  async upsertProduct(product: Product): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(product),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async seedProducts(products: Product[]): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(products),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(productId)}`,
        {
          method: 'DELETE',
          headers: this.getHeaders(),
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  async fetchOrders(): Promise<Order[] | null> {
    if (!this.isConfigured()) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=createdAt.desc`, {
        headers: this.getHeaders(),
        cache: 'no-store',
      });
      if (!res.ok) return null;
      return (await res.json()) as Order[];
    } catch {
      return null;
    }
  }

  async insertOrder(order: Order): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(order),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
        {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({ status }),
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
        {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({ paymentStatus }),
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  async fetchStoreLinks(): Promise<StoreLink[] | null> {
    if (!this.isConfigured()) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/store_links?select=*&order=key.asc`, {
        headers: this.getHeaders(),
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const rows = (await res.json()) as StoreLinkRow[];
      return rows.map((r) => ({
        key: r.key,
        label: r.label,
        url: r.url,
        category: r.category,
        isActive: r.is_active,
        updatedAt: r.updated_at,
      }));
    } catch {
      return null;
    }
  }

  async upsertStoreLink(link: StoreLink): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const payload: StoreLinkRow = {
        key: link.key,
        label: link.label,
        url: link.url,
        category: link.category,
        is_active: link.isActive,
        updated_at: new Date().toISOString(),
      };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/store_links`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async seedStoreLinks(links: StoreLink[]): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const payload: StoreLinkRow[] = links.map((l) => ({
        key: l.key,
        label: l.label,
        url: l.url,
        category: l.category,
        is_active: l.isActive,
        updated_at: new Date().toISOString(),
      }));
      const res = await fetch(`${SUPABASE_URL}/rest/v1/store_links`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async deleteStoreLink(key: string): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/store_links?key=eq.${encodeURIComponent(key)}`,
        {
          method: 'DELETE',
          headers: this.getHeaders(),
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  async updateOrderTrxId(
    orderId: string,
    trxId: string,
    bkashSenderNumber?: string
  ): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
        {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({
            trxId,
            ...(bkashSenderNumber ? { bkashSenderNumber } : {}),
          }),
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  async upsertCustomer(customer: CustomerProfile, password?: string): Promise<CustomerProfile | null> {
    if (!this.isConfigured()) return null;
    try {
      const payload: CustomerRow = {
        phone: customer.phone,
        email: customer.email || null,
        full_name: customer.fullName,
        ...(password ? { password } : {}),
        default_address: customer.defaultAddress,
        delivery_zone: customer.deliveryZone,
        saved_trx_ids: customer.savedTrxIds,
        updated_at: new Date().toISOString(),
      };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/customers?on_conflict=phone`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
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
        savedTrxIds: Array.isArray(row.saved_trx_ids) ? row.saved_trx_ids : [],
        createdAt: row.created_at || customer.createdAt,
      };
    } catch {
      return null;
    }
  }

  async loginCustomer(phone: string, password: string): Promise<CustomerProfile | null> {
    if (!this.isConfigured()) return null;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/customers?phone=eq.${encodeURIComponent(
          phone.trim()
        )}&password=eq.${encodeURIComponent(password.trim())}&select=*`,
        {
          headers: this.getHeaders(),
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

export const supabaseService = new SupabaseService();

import { ProductType } from '../models/product-type.model';
import { supabaseClient } from './supabase.client';

const PRODUCT_TYPES_STORAGE_KEY = 'melo_product_types_v1';
export const PRODUCT_TYPES_UPDATED_EVENT = 'melo-product-types-updated';

interface ProductTypeRow {
  slug: string;
  name: string;
  description: string;
  created_at?: string;
}

/**
 * ProductTypeRepository — Handles all database (`public.product_types`) and local storage
 * persistence for product categories/types.
 */
export class ProductTypeRepository {
  loadLocal(): ProductType[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(PRODUCT_TYPES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ProductType[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return null;
  }

  saveLocal(productTypes: ProductType[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PRODUCT_TYPES_STORAGE_KEY, JSON.stringify(productTypes));
      window.dispatchEvent(new CustomEvent(PRODUCT_TYPES_UPDATED_EVENT));
    } catch {
      // ignore storage errors
    }
  }

  async fetchAllFromDb(): Promise<ProductType[] | null> {
    if (!supabaseClient.isConfigured()) return null;
    try {
      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/product_types?select=*&order=created_at.asc`,
        {
          headers: supabaseClient.getHeaders(),
          cache: 'no-store',
        }
      );
      if (!res.ok) return null;
      const rows = (await res.json()) as ProductTypeRow[];
      return rows.map((r) => ({
        slug: r.slug,
        name: r.name,
        description: r.description || '',
        createdAt: r.created_at,
      }));
    } catch {
      return null;
    }
  }

  async upsertInDb(productType: ProductType): Promise<boolean> {
    if (!supabaseClient.isConfigured()) return false;
    try {
      const payload: ProductTypeRow = {
        slug: productType.slug,
        name: productType.name,
        description: productType.description || '',
      };
      const res = await fetch(`${supabaseClient.baseUrl}/rest/v1/product_types`, {
        method: 'POST',
        headers: supabaseClient.getHeaders({
          Prefer: 'resolution=merge-duplicates,return=representation',
        }),
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async upsertBatchInDb(productTypes: ProductType[]): Promise<boolean> {
    if (!supabaseClient.isConfigured()) return false;
    try {
      const payload: ProductTypeRow[] = productTypes.map((pt) => ({
        slug: pt.slug,
        name: pt.name,
        description: pt.description || '',
      }));
      const res = await fetch(`${supabaseClient.baseUrl}/rest/v1/product_types`, {
        method: 'POST',
        headers: supabaseClient.getHeaders({
          Prefer: 'resolution=merge-duplicates',
        }),
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async deleteFromDb(slug: string): Promise<boolean> {
    if (!supabaseClient.isConfigured()) return false;
    try {
      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/product_types?slug=eq.${encodeURIComponent(slug)}`,
        {
          method: 'DELETE',
          headers: supabaseClient.getHeaders(),
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const productTypeRepository = new ProductTypeRepository();


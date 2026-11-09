import { Product } from '../models/product.model';
import { supabaseClient } from './supabase.client';

export const PRODUCTS_STORAGE_KEY = 'melo_products_catalogue_v3';
export const PRODUCTS_UPDATED_EVENT = 'melo-products-updated';

/**
 * ProductRepository — Handles all database (`public.products`) and local storage
 * persistence for catalogue products. Supabase is synced when configured, with
 * offline-first local storage fallback.
 */
export class ProductRepository {
  /** Notify listeners in the current tab that the catalogue changed. */
  notifyUpdated(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT));
  }

  loadLocal(): Product[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Product[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return null;
  }

  saveLocal(products: Product[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      this.notifyUpdated();
    } catch {
      // ignore storage errors
    }
  }

  async fetchAllFromDb(): Promise<Product[] | null> {
    if (!supabaseClient.isConfigured()) return null;
    try {
      const res = await fetch(`${supabaseClient.baseUrl}/rest/v1/products?select=*&order=id.asc`, {
        headers: supabaseClient.getHeaders(),
        cache: 'no-store',
      });
      if (!res.ok) return null;
      return (await res.json()) as Product[];
    } catch {
      return null;
    }
  }

  async fetchBySlugFromDb(slug: string): Promise<Product | null> {
    if (!supabaseClient.isConfigured()) return null;
    try {
      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/products?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`,
        {
          headers: supabaseClient.getHeaders(),
          next: { revalidate: 60 },
        }
      );
      if (!res.ok) return null;
      const rows = (await res.json()) as Product[];
      return rows[0] ?? null;
    } catch {
      return null;
    }
  }

  async fetchAllSlugsFromDb(): Promise<string[]> {
    if (!supabaseClient.isConfigured()) return [];
    try {
      const res = await fetch(`${supabaseClient.baseUrl}/rest/v1/products?select=slug`, {
        headers: supabaseClient.getHeaders(),
        next: { revalidate: 60 },
      });
      if (!res.ok) return [];
      const rows = (await res.json()) as Array<{ slug: string }>;
      return rows.map((r) => r.slug).filter(Boolean);
    } catch {
      return [];
    }
  }

  async upsertInDb(product: Product): Promise<boolean> {
    if (!supabaseClient.isConfigured()) return false;
    try {
      const res = await fetch(`${supabaseClient.baseUrl}/rest/v1/products`, {
        method: 'POST',
        headers: supabaseClient.getHeaders({
          Prefer: 'resolution=merge-duplicates,return=representation',
        }),
        body: JSON.stringify(product),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async upsertBatchInDb(products: Product[]): Promise<boolean> {
    if (!supabaseClient.isConfigured()) return false;
    try {
      const res = await fetch(`${supabaseClient.baseUrl}/rest/v1/products`, {
        method: 'POST',
        headers: supabaseClient.getHeaders({
          Prefer: 'resolution=merge-duplicates',
        }),
        body: JSON.stringify(products),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async deleteFromDb(productId: string): Promise<boolean> {
    if (!supabaseClient.isConfigured()) return false;
    try {
      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/products?id=eq.${encodeURIComponent(productId)}`,
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

export const productRepository = new ProductRepository();

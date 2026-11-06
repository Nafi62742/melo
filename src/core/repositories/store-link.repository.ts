import { StoreLink, StoreLinkCategory } from '../models/store-link.model';
import { supabaseClient } from './supabase.client';

const STORE_LINKS_STORAGE_KEY = 'melo_store_links';
export const STORE_LINKS_UPDATED_EVENT = 'melo-links-updated';

interface StoreLinkRow {
  key: string;
  label: string;
  url: string;
  category: StoreLinkCategory;
  is_active: boolean;
  updated_at?: string;
}

/**
 * StoreLinkRepository — Handles all database (`public.store_links`) and local storage
 * persistence for storefront chat and social links.
 */
export class StoreLinkRepository {
  loadLocal(): StoreLink[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORE_LINKS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoreLink[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return null;
  }

  saveLocal(links: StoreLink[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORE_LINKS_STORAGE_KEY, JSON.stringify(links));
      window.dispatchEvent(new CustomEvent(STORE_LINKS_UPDATED_EVENT));
    } catch {
      // ignore storage errors
    }
  }

  async fetchAllFromDb(): Promise<StoreLink[] | null> {
    if (!supabaseClient.isConfigured()) return null;
    try {
      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/store_links?select=*&order=key.asc`,
        {
          headers: supabaseClient.getHeaders(),
          cache: 'no-store',
        }
      );
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

  async upsertInDb(link: StoreLink): Promise<boolean> {
    if (!supabaseClient.isConfigured()) return false;
    try {
      const payload: StoreLinkRow = {
        key: link.key,
        label: link.label,
        url: link.url,
        category: link.category,
        is_active: link.isActive,
        updated_at: new Date().toISOString(),
      };
      const res = await fetch(`${supabaseClient.baseUrl}/rest/v1/store_links`, {
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

  async upsertBatchInDb(links: StoreLink[]): Promise<boolean> {
    if (!supabaseClient.isConfigured()) return false;
    try {
      const payload: StoreLinkRow[] = links.map((l) => ({
        key: l.key,
        label: l.label,
        url: l.url,
        category: l.category,
        is_active: l.isActive,
        updated_at: new Date().toISOString(),
      }));
      const res = await fetch(`${supabaseClient.baseUrl}/rest/v1/store_links`, {
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

  async deleteFromDb(key: string): Promise<boolean> {
    if (!supabaseClient.isConfigured()) return false;
    try {
      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/store_links?key=eq.${encodeURIComponent(key)}`,
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

export const storeLinkRepository = new StoreLinkRepository();


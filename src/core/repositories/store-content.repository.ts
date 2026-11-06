import { StoreContent } from '../models/store-content.model';
import { supabaseClient } from './supabase.client';

export const STORE_CONTENT_STORAGE_KEY = 'melo_store_content_v1';
export const STORE_CONTENT_UPDATED_EVENT = 'melo-store-content-updated';

/**
 * StoreContentRepository — Handles database (`public.store_content`) and localStorage
 * persistence for storefront customizable text, hero showcase, and banner copy.
 */
export class StoreContentRepository {
  loadLocal(): StoreContent | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORE_CONTENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoreContent;
        if (parsed && parsed.hero) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return null;
  }

  saveLocal(content: StoreContent): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORE_CONTENT_STORAGE_KEY, JSON.stringify(content));
      window.dispatchEvent(new CustomEvent(STORE_CONTENT_UPDATED_EVENT));
    } catch {
      // ignore storage errors
    }
  }

  async fetchFromDb(): Promise<StoreContent | null> {
    if (!supabaseClient.isConfigured()) return null;
    try {
      const res = await fetch(
        `${supabaseClient.baseUrl}/rest/v1/store_content?key=eq.home_content&select=content`,
        {
          headers: supabaseClient.getHeaders(),
          cache: 'no-store',
        }
      );
      if (!res.ok) return null;
      const data = (await res.json()) as Array<{ content: StoreContent }>;
      if (Array.isArray(data) && data.length > 0 && data[0].content) {
        return data[0].content;
      }
      return null;
    } catch {
      return null;
    }
  }

  async saveToDb(content: StoreContent): Promise<boolean> {
    if (!supabaseClient.isConfigured()) return false;
    try {
      const res = await fetch(`${supabaseClient.baseUrl}/rest/v1/store_content`, {
        method: 'POST',
        headers: supabaseClient.getHeaders({
          Prefer: 'resolution=merge-duplicates,return=representation',
        }),
        body: JSON.stringify({
          key: 'home_content',
          content,
          updated_at: new Date().toISOString(),
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const storeContentRepository = new StoreContentRepository();

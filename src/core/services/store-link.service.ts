import { DEFAULT_STORE_LINKS, StoreLink } from '../models/store-link.model';
import { supabaseService } from './supabase.service';

const STORE_LINKS_STORAGE_KEY = 'melo_store_links';
export const STORE_LINKS_UPDATED_EVENT = 'melo-links-updated';

class StoreLinkService {
  private links: StoreLink[] = [...DEFAULT_STORE_LINKS];
  private loadedFromStorage = false;

  private ensureLoaded(): void {
    if (this.loadedFromStorage || typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORE_LINKS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoreLink[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.links = parsed;
        }
      }
      this.loadedFromStorage = true;
    } catch {
      // ignore storage errors
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORE_LINKS_STORAGE_KEY, JSON.stringify(this.links));
      window.dispatchEvent(new CustomEvent(STORE_LINKS_UPDATED_EVENT));
    } catch {
      // ignore storage errors
    }
  }

  /**
   * Normalizes user-entered URLs so numbers, usernames, or full URLs all work seamlessly.
   */
  normalizeUrl(key: string, rawInput: string): string {
    const val = rawInput.trim();
    if (!val) return '';

    const lowerKey = key.toLowerCase();
    if (lowerKey === 'whatsapp') {
      if (val.startsWith('http://') || val.startsWith('https://')) {
        return val;
      }
      const digits = val.replace(/[^0-9]/g, '');
      const bdPhone = digits.startsWith('01') ? `88${digits}` : digits;
      return `https://wa.me/${bdPhone}`;
    }

    if (lowerKey === 'messenger') {
      if (val.startsWith('http://') || val.startsWith('https://')) {
        return val;
      }
      const cleanUser = val.replace(/^@/, '').replace(/^m\.me\//i, '');
      return `https://m.me/${cleanUser}`;
    }

    if (!val.startsWith('http://') && !val.startsWith('https://') && !val.startsWith('/')) {
      return `https://${val}`;
    }

    return val;
  }

  getAllLinks(): StoreLink[] {
    this.ensureLoaded();
    return this.links;
  }

  getActiveLinksByCategory(category: StoreLink['category']): StoreLink[] {
    this.ensureLoaded();
    return this.links.filter((l) => l.category === category && l.isActive && Boolean(l.url));
  }

  getLinkByKey(key: string): StoreLink | undefined {
    this.ensureLoaded();
    return this.links.find((l) => l.key.toLowerCase() === key.toLowerCase());
  }

  upsertLink(link: StoreLink): StoreLink {
    this.ensureLoaded();
    const cleanKey = link.key.trim().toLowerCase().replace(/\s+/g, '_');
    const normalized: StoreLink = {
      ...link,
      key: cleanKey,
      url: this.normalizeUrl(cleanKey, link.url),
      updatedAt: new Date().toISOString(),
    };

    const idx = this.links.findIndex((l) => l.key === cleanKey);
    if (idx >= 0) {
      this.links[idx] = normalized;
    } else {
      this.links = [...this.links, normalized];
    }

    this.persist();
    void supabaseService.upsertStoreLink(normalized);
    return normalized;
  }

  deleteLink(key: string): boolean {
    this.ensureLoaded();
    const prevLen = this.links.length;
    this.links = this.links.filter((l) => l.key !== key);
    if (this.links.length === prevLen) return false;
    this.persist();
    void supabaseService.deleteStoreLink(key);
    return true;
  }

  async syncFromDatabase(): Promise<StoreLink[]> {
    this.ensureLoaded();
    const remote = await supabaseService.fetchStoreLinks();
    if (remote && remote.length > 0) {
      this.links = remote;
      this.persist();
    }
    return this.links;
  }

  async pushAllToDatabase(): Promise<boolean> {
    this.ensureLoaded();
    return supabaseService.seedStoreLinks(this.links);
  }
}

export const storeLinkService = new StoreLinkService();


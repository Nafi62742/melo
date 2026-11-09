import { StoreLink } from '../models/store-link.model';
import { DEFAULT_STORE_LINKS } from '../data/store-links.data';
import {
  storeLinkRepository,
  STORE_LINKS_UPDATED_EVENT,
} from '../repositories/store-link.repository';

export { STORE_LINKS_UPDATED_EVENT };

/**
 * StoreLinkService — Domain service for storefront chat & social links.
 * Delegates all DB & storage I/O to StoreLinkRepository.
 */
class StoreLinkService {
  private links: StoreLink[] = [...DEFAULT_STORE_LINKS];
  private loadedFromStorage = false;

  private ensureLoaded(): void {
    if (this.loadedFromStorage) return;
    const stored = storeLinkRepository.loadLocal();
    if (stored && stored.length > 0) {
      this.links = stored.map((item) => {
        // Upgrade legacy placeholder URLs to current defaults
        if (
          item.url &&
          ((item.url.includes('melobangladesh') && (item.key === 'facebook' || item.key === 'messenger')) ||
            (item.key === 'whatsapp' && (item.url.includes('8801700000000') || item.url.includes('8801760887297'))))
        ) {
          const defaultItem = DEFAULT_STORE_LINKS.find((d) => d.key === item.key);
          if (defaultItem) {
            return { ...item, url: defaultItem.url };
          }
        }
        return item;
      });
    }
    if (typeof window !== 'undefined') {
      this.loadedFromStorage = true;
    }
  }

  private persist(): void {
    storeLinkRepository.saveLocal(this.links);
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
    void storeLinkRepository.upsertInDb(normalized);
    return normalized;
  }

  deleteLink(key: string): boolean {
    this.ensureLoaded();
    const prevLen = this.links.length;
    this.links = this.links.filter((l) => l.key !== key);
    if (this.links.length === prevLen) return false;
    this.persist();
    void storeLinkRepository.deleteFromDb(key);
    return true;
  }

  async syncFromDatabase(): Promise<StoreLink[]> {
    this.ensureLoaded();
    const remote = await storeLinkRepository.fetchAllFromDb();
    if (remote && remote.length > 0) {
      this.links = remote;
      this.persist();
    }
    return this.links;
  }

  async pushAllToDatabase(): Promise<boolean> {
    this.ensureLoaded();
    return storeLinkRepository.upsertBatchInDb(this.links);
  }
}

export const storeLinkService = new StoreLinkService();

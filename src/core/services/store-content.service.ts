import { StoreContent, HeroContent } from '../models/store-content.model';
import { DEFAULT_STORE_CONTENT } from '../data/store-content.data';
import {
  storeContentRepository,
  STORE_CONTENT_UPDATED_EVENT,
} from '../repositories/store-content.repository';

export { STORE_CONTENT_UPDATED_EVENT };

/**
 * StoreContentService — Domain service for storefront customizable copy,
 * hero showcase selections, trust metrics, and announcement tickers.
 * Delegates all DB & storage I/O to StoreContentRepository.
 */
class StoreContentService {
  private content: StoreContent = { ...DEFAULT_STORE_CONTENT };
  private loadedFromStorage = false;

  private ensureLoaded(): void {
    if (this.loadedFromStorage) return;
    const stored = storeContentRepository.loadLocal();
    if (stored && stored.hero) {
      this.content = {
        hero: {
          ...DEFAULT_STORE_CONTENT.hero,
          ...stored.hero,
          trustMetrics: stored.hero.trustMetrics || DEFAULT_STORE_CONTENT.hero.trustMetrics,
          tickerItems: stored.hero.tickerItems || DEFAULT_STORE_CONTENT.hero.tickerItems,
        },
      };
    }
    if (typeof window !== 'undefined') {
      this.loadedFromStorage = true;
    }
  }

  private persist(): void {
    storeContentRepository.saveLocal(this.content);
    void storeContentRepository.saveToDb(this.content);
  }

  getStoreContent(): StoreContent {
    this.ensureLoaded();
    return this.content;
  }

  getHeroContent(): HeroContent {
    this.ensureLoaded();
    return this.content.hero;
  }

  updateHeroContent(patch: Partial<HeroContent>): StoreContent {
    this.ensureLoaded();
    this.content = {
      ...this.content,
      hero: {
        ...this.content.hero,
        ...patch,
      },
    };
    this.persist();
    return this.content;
  }

  resetToDefaults(): StoreContent {
    this.content = JSON.parse(JSON.stringify(DEFAULT_STORE_CONTENT)) as StoreContent;
    this.persist();
    return this.content;
  }

  async syncFromDatabase(): Promise<StoreContent> {
    const remote = await storeContentRepository.fetchFromDb();
    if (remote && remote.hero) {
      this.content = {
        hero: {
          ...DEFAULT_STORE_CONTENT.hero,
          ...remote.hero,
          trustMetrics: remote.hero.trustMetrics || DEFAULT_STORE_CONTENT.hero.trustMetrics,
          tickerItems: remote.hero.tickerItems || DEFAULT_STORE_CONTENT.hero.tickerItems,
        },
      };
      this.loadedFromStorage = true;
      storeContentRepository.saveLocal(this.content);
    }
    return this.content;
  }
}

export const storeContentService = new StoreContentService();


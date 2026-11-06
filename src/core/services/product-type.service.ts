import { ProductType } from '../models/product-type.model';
import { supabaseService } from './supabase.service';
import { slugify } from '../utils/slug.util';

const PRODUCT_TYPES_STORAGE_KEY = 'melo_product_types_v1';

export const DEFAULT_PRODUCT_TYPES: ProductType[] = [
  {
    slug: 'earrings',
    name: 'Earrings',
    description: 'Hypoallergenic French-style ear clips and pearl earrings',
  },
  {
    slug: 'rings',
    name: 'Rings',
    description: 'Korean-style adjustable open rings and zircon bands',
  },
  {
    slug: 'bracelets',
    name: 'Bracelets',
    description: 'Light luxury crystal and four-leaf clover bracelets',
  },
];

class ProductTypeService {
  private productTypes: ProductType[] = [...DEFAULT_PRODUCT_TYPES];
  private loadedFromStorage = false;

  private ensureLoaded(): void {
    if (this.loadedFromStorage || typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(PRODUCT_TYPES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ProductType[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.productTypes = parsed;
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
      localStorage.setItem(PRODUCT_TYPES_STORAGE_KEY, JSON.stringify(this.productTypes));
    } catch {
      // ignore storage errors
    }
  }

  getAllProductTypes(): ProductType[] {
    this.ensureLoaded();
    return this.productTypes;
  }

  getProductTypeBySlug(slug: string): ProductType | undefined {
    this.ensureLoaded();
    return this.productTypes.find((pt) => pt.slug === slug);
  }

  addProductType(name: string, description = '', customSlug?: string): ProductType {
    this.ensureLoaded();
    const slug = (customSlug?.trim() || slugify(name.trim())).toLowerCase();
    const existing = this.getProductTypeBySlug(slug);
    const entry: ProductType = {
      slug,
      name: name.trim(),
      description: description.trim(),
    };

    if (existing) {
      this.productTypes = this.productTypes.map((pt) => (pt.slug === slug ? entry : pt));
    } else {
      this.productTypes = [...this.productTypes, entry];
    }

    this.persist();
    void supabaseService.upsertProductType(entry);
    return entry;
  }

  deleteProductType(slug: string): boolean {
    this.ensureLoaded();
    const prevLen = this.productTypes.length;
    this.productTypes = this.productTypes.filter((pt) => pt.slug !== slug);
    if (this.productTypes.length === prevLen) return false;
    this.persist();
    void supabaseService.deleteProductType(slug);
    return true;
  }

  async syncFromDatabase(): Promise<ProductType[]> {
    const remote = await supabaseService.fetchProductTypes();
    if (remote && remote.length > 0) {
      this.productTypes = remote;
      this.persist();
    }
    return this.productTypes;
  }

  async pushAllToDatabase(): Promise<boolean> {
    this.ensureLoaded();
    return supabaseService.seedProductTypes(this.productTypes);
  }
}

export const productTypeService = new ProductTypeService();


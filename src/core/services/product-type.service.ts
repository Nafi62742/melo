import { ProductType } from '../models/product-type.model';
import { DEFAULT_PRODUCT_TYPES } from '../data/product-types.data';
import {
  productTypeRepository,
  PRODUCT_TYPES_UPDATED_EVENT,
} from '../repositories/product-type.repository';
import { slugify } from '../utils/slug.util';

export { DEFAULT_PRODUCT_TYPES, PRODUCT_TYPES_UPDATED_EVENT };

/**
 * ProductTypeService — Domain service for managing product types (`public.product_types`).
 * Delegates all DB & storage I/O to ProductTypeRepository.
 */
class ProductTypeService {
  private productTypes: ProductType[] = [...DEFAULT_PRODUCT_TYPES];
  private loadedFromStorage = false;

  private ensureLoaded(): void {
    if (this.loadedFromStorage) return;
    const stored = productTypeRepository.loadLocal();
    if (stored && stored.length > 0) {
      this.productTypes = stored;
    }
    if (typeof window !== 'undefined') {
      this.loadedFromStorage = true;
    }
  }

  private persist(): void {
    productTypeRepository.saveLocal(this.productTypes);
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
    void productTypeRepository.upsertInDb(entry);
    return entry;
  }

  deleteProductType(slug: string): boolean {
    this.ensureLoaded();
    const prevLen = this.productTypes.length;
    this.productTypes = this.productTypes.filter((pt) => pt.slug !== slug);
    if (this.productTypes.length === prevLen) return false;
    this.persist();
    void productTypeRepository.deleteFromDb(slug);
    return true;
  }

  async syncFromDatabase(): Promise<ProductType[]> {
    const remote = await productTypeRepository.fetchAllFromDb();
    if (remote && remote.length > 0) {
      this.productTypes = remote;
      this.persist();
    }
    return this.productTypes;
  }

  async pushAllToDatabase(): Promise<boolean> {
    this.ensureLoaded();
    return productTypeRepository.upsertBatchInDb(this.productTypes);
  }
}

export const productTypeService = new ProductTypeService();

import { Product } from '../models/product.model';
import { productRepository, PRODUCTS_UPDATED_EVENT } from '../repositories/product.repository';

export { PRODUCTS_UPDATED_EVENT };

/**
 * ProductService — Domain service for catalogue management, pricing, stock,
 * and differential CSV synchronization. Supabase is the single source of truth:
 * the catalogue starts empty and is populated by `syncFromDatabase()`. Delegates
 * all DB I/O to ProductRepository.
 */
class ProductService {
  private products: Product[] = [];
  private legacyCacheCleared = false;

  /** Drop any catalogue copies older app versions stored in the browser. */
  private ensureLegacyCacheCleared(): void {
    if (this.legacyCacheCleared || typeof window === 'undefined') return;
    productRepository.clearLegacyLocalCache();
    this.legacyCacheCleared = true;
  }

  private notify(): void {
    productRepository.notifyUpdated();
  }

  getAllProducts(): Product[] {
    this.ensureLegacyCacheCleared();
    return this.products;
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.products.find((p) => p.slug === slug);
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  getProductsByCategory(category: string): Product[] {
    if (category === 'all' || !category) {
      return this.products;
    }
    return this.products.filter((p) => p.category === category);
  }

  getFeaturedProducts(): Product[] {
    return this.products.filter((p) => p.isFeatured);
  }

  getNewArrivals(): Product[] {
    return this.products.filter((p) => p.isNew);
  }

  searchProducts(query: string): Product[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.products;
    return this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  updateProductStock(id: string, delta: number): boolean {
    const product = this.getProductById(id);
    if (!product) return false;
    product.stock = Math.max(0, product.stock + delta);
    this.notify();
    void productRepository.upsertInDb(product);
    return true;
  }

  setProductStock(id: string, exactStock: number): boolean {
    const product = this.getProductById(id);
    if (!product) return false;
    product.stock = Math.max(0, Math.floor(exactStock));
    this.notify();
    void productRepository.upsertInDb(product);
    return true;
  }

  updateProductPricing(
    id: string,
    priceBDT: number,
    costPriceCNY?: number,
    originalPriceBDT?: number
  ): boolean {
    const product = this.getProductById(id);
    if (!product) return false;
    if (!Number.isNaN(priceBDT) && priceBDT > 0) {
      product.priceBDT = Math.round(priceBDT);
    }
    if (costPriceCNY !== undefined && !Number.isNaN(costPriceCNY) && costPriceCNY >= 0) {
      product.costPriceCNY = Number(costPriceCNY);
    }
    if (originalPriceBDT !== undefined && !Number.isNaN(originalPriceBDT) && originalPriceBDT > 0) {
      product.originalPriceBDT = Math.round(originalPriceBDT);
    }
    this.notify();
    void productRepository.upsertInDb(product);
    return true;
  }

  toggleProductFeatured(id: string): boolean {
    const product = this.getProductById(id);
    if (!product) return false;
    product.isFeatured = !product.isFeatured;
    this.notify();
    void productRepository.upsertInDb(product);
    return true;
  }

  setProductFeatured(id: string, isFeatured: boolean): boolean {
    const product = this.getProductById(id);
    if (!product) return false;
    product.isFeatured = Boolean(isFeatured);
    this.notify();
    void productRepository.upsertInDb(product);
    return true;
  }

  addProduct(newProduct: Product): Product {
    this.products = [newProduct, ...this.products];
    this.notify();
    void productRepository.upsertInDb(newProduct);
    return newProduct;
  }

  updateProduct(updatedProduct: Product): boolean {
    const idx = this.products.findIndex((p) => p.id === updatedProduct.id);
    if (idx === -1) return false;
    this.products[idx] = { ...updatedProduct };
    this.notify();
    void productRepository.upsertInDb(updatedProduct);
    return true;
  }

  deleteProduct(id: string): boolean {
    const prevLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    if (this.products.length === prevLen) return false;
    this.notify();
    void productRepository.deleteFromDb(id);
    return true;
  }

  async syncFromDatabase(): Promise<Product[]> {
    this.ensureLegacyCacheCleared();
    const remote = await productRepository.fetchAllFromDb();
    if (remote) {
      this.products = remote;
      this.notify();
    }
    return this.products;
  }

  async pushAllToDatabase(): Promise<boolean> {
    return productRepository.upsertBatchInDb(this.products);
  }

  async applyImportedProductsDiff(
    mergedProducts: Product[],
    changedProducts: Product[]
  ): Promise<boolean> {
    this.products = [...mergedProducts];
    this.notify();
    if (changedProducts.length === 0) {
      return true;
    }
    return productRepository.upsertBatchInDb(changedProducts);
  }
}

export const productService = new ProductService();

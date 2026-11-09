import { Product } from '../models/product.model';
import { INITIAL_PRODUCTS } from '../data/products.data';
import { productRepository, PRODUCTS_UPDATED_EVENT } from '../repositories/product.repository';

export { PRODUCTS_UPDATED_EVENT };

/**
 * ProductService — Domain service for catalogue management, pricing, stock,
 * and differential CSV synchronization. Delegates all DB & storage I/O to ProductRepository.
 * Uses INITIAL_PRODUCTS as a fallback when Supabase is unconfigured or offline.
 */
class ProductService {
  private products: Product[] = [...INITIAL_PRODUCTS];
  private loadedFromStorage = false;

  private ensureLoaded(): void {
    if (this.loadedFromStorage) return;
    const stored = productRepository.loadLocal();
    if (stored && stored.length > 0) {
      this.products = stored;
    }
    if (typeof window !== 'undefined') {
      this.loadedFromStorage = true;
    }
  }

  private persist(): void {
    productRepository.saveLocal(this.products);
  }

  getAllProducts(): Product[] {
    this.ensureLoaded();
    return this.products;
  }

  getProductBySlug(slug: string): Product | undefined {
    this.ensureLoaded();
    return this.products.find((p) => p.slug === slug);
  }

  getProductById(id: string): Product | undefined {
    this.ensureLoaded();
    return this.products.find((p) => p.id === id);
  }

  getProductsByCategory(category: string): Product[] {
    this.ensureLoaded();
    if (category === 'all' || !category) {
      return this.products;
    }
    return this.products.filter((p) => p.category === category);
  }

  getFeaturedProducts(): Product[] {
    this.ensureLoaded();
    return this.products.filter((p) => p.isFeatured);
  }

  getNewArrivals(): Product[] {
    this.ensureLoaded();
    return this.products.filter((p) => p.isNew);
  }

  searchProducts(query: string): Product[] {
    this.ensureLoaded();
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
    this.ensureLoaded();
    const product = this.getProductById(id);
    if (!product) return false;
    product.stock = Math.max(0, product.stock + delta);
    this.persist();
    void productRepository.upsertInDb(product);
    return true;
  }

  setProductStock(id: string, exactStock: number): boolean {
    this.ensureLoaded();
    const product = this.getProductById(id);
    if (!product) return false;
    product.stock = Math.max(0, Math.floor(exactStock));
    this.persist();
    void productRepository.upsertInDb(product);
    return true;
  }

  updateProductPricing(
    id: string,
    priceBDT: number,
    costPriceCNY?: number,
    originalPriceBDT?: number
  ): boolean {
    this.ensureLoaded();
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
    this.persist();
    void productRepository.upsertInDb(product);
    return true;
  }

  toggleProductFeatured(id: string): boolean {
    this.ensureLoaded();
    const product = this.getProductById(id);
    if (!product) return false;
    product.isFeatured = !product.isFeatured;
    this.persist();
    void productRepository.upsertInDb(product);
    return true;
  }

  setProductFeatured(id: string, isFeatured: boolean): boolean {
    this.ensureLoaded();
    const product = this.getProductById(id);
    if (!product) return false;
    product.isFeatured = Boolean(isFeatured);
    this.persist();
    void productRepository.upsertInDb(product);
    return true;
  }

  addProduct(newProduct: Product): Product {
    this.ensureLoaded();
    this.products = [newProduct, ...this.products];
    this.persist();
    void productRepository.upsertInDb(newProduct);
    return newProduct;
  }

  updateProduct(updatedProduct: Product): boolean {
    this.ensureLoaded();
    const idx = this.products.findIndex((p) => p.id === updatedProduct.id);
    if (idx === -1) return false;
    this.products[idx] = { ...updatedProduct };
    this.persist();
    void productRepository.upsertInDb(updatedProduct);
    return true;
  }

  deleteProduct(id: string): boolean {
    this.ensureLoaded();
    const prevLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    if (this.products.length === prevLen) return false;
    this.persist();
    void productRepository.deleteFromDb(id);
    return true;
  }

  async syncFromDatabase(): Promise<Product[]> {
    this.ensureLoaded();
    const remote = await productRepository.fetchAllFromDb();
    if (remote && remote.length > 0) {
      this.products = remote;
      this.persist();
    }
    return this.products;
  }

  async pushAllToDatabase(): Promise<boolean> {
    this.ensureLoaded();
    return productRepository.upsertBatchInDb(this.products);
  }

  async applyImportedProductsDiff(
    mergedProducts: Product[],
    changedProducts: Product[]
  ): Promise<boolean> {
    this.ensureLoaded();
    this.products = [...mergedProducts];
    this.persist();
    if (changedProducts.length === 0) {
      return true;
    }
    return productRepository.upsertBatchInDb(changedProducts);
  }
}

export const productService = new ProductService();

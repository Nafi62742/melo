import { Product } from '../models/product.model';
import { INITIAL_PRODUCTS } from '../data/products.data';
import { supabaseService } from './supabase.service';

const PRODUCTS_STORAGE_KEY = 'melo_products_catalogue_v2';

class ProductService {
  private products: Product[] = [...INITIAL_PRODUCTS];
  private loadedFromStorage = false;

  private ensureLoaded(): void {
    if (this.loadedFromStorage || typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Product[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.products = parsed;
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
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(this.products));
    } catch {
      // ignore storage errors
    }
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
    void supabaseService.upsertProduct(product);
    return true;
  }

  setProductStock(id: string, exactStock: number): boolean {
    this.ensureLoaded();
    const product = this.getProductById(id);
    if (!product) return false;
    product.stock = Math.max(0, Math.floor(exactStock));
    this.persist();
    void supabaseService.upsertProduct(product);
    return true;
  }

  addProduct(newProduct: Product): Product {
    this.ensureLoaded();
    this.products = [newProduct, ...this.products];
    this.persist();
    void supabaseService.upsertProduct(newProduct);
    return newProduct;
  }

  updateProduct(updatedProduct: Product): boolean {
    this.ensureLoaded();
    const idx = this.products.findIndex((p) => p.id === updatedProduct.id);
    if (idx === -1) return false;
    this.products[idx] = { ...updatedProduct };
    this.persist();
    void supabaseService.upsertProduct(updatedProduct);
    return true;
  }

  deleteProduct(id: string): boolean {
    this.ensureLoaded();
    const prevLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    if (this.products.length === prevLen) return false;
    this.persist();
    void supabaseService.deleteProduct(id);
    return true;
  }

  async syncFromDatabase(): Promise<Product[]> {
    const remote = await supabaseService.fetchProducts();
    if (remote && remote.length > 0) {
      this.products = remote;
      this.persist();
    }
    return this.products;
  }

  async pushAllToDatabase(): Promise<boolean> {
    this.ensureLoaded();
    return supabaseService.seedProducts(this.products);
  }
}

export const productService = new ProductService();

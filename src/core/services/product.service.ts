import { Product } from '../models/product.model';
import { INITIAL_PRODUCTS } from '../data/products.data';

class ProductService {
  private products: Product[] = [...INITIAL_PRODUCTS];

  getAllProducts(): Product[] {
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
    return true;
  }
}

export const productService = new ProductService();


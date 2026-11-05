import { productService } from './product.service';

describe('ProductService', () => {
  it('should load all products', () => {
    const products = productService.getAllProducts();
    expect(products.length).toBeGreaterThan(0);
    expect(products.length).toBe(54);
  });

  it('should filter products by category', () => {
    const earrings = productService.getProductsByCategory('earrings');
    expect(earrings.length).toBe(27);
    expect(earrings.every((p) => p.category === 'earrings')).toBe(true);

    const rings = productService.getProductsByCategory('rings');
    expect(rings.length).toBe(25);
    expect(rings.every((p) => p.category === 'rings')).toBe(true);

    const bracelets = productService.getProductsByCategory('bracelets');
    expect(bracelets.length).toBe(2);
    expect(bracelets.every((p) => p.category === 'bracelets')).toBe(true);
  });

  it('should find a product by slug', () => {
    const product = productService.getProductBySlug('earring-bud');
    expect(product).toBeDefined();
    expect(product?.name).toBe('Bud');
    expect(product?.category).toBe('earrings');
    expect(product?.imageUrl).toContain('.webp');
  });

  it('should search products by keyword', () => {
    const results = productService.searchProducts('pearl');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((p) => p.name.toLowerCase().includes('pearl'))).toBe(true);
  });

  it('should update product stock accurately', () => {
    const product = productService.getAllProducts()[0];
    const initialStock = product.stock;

    productService.updateProductStock(product.id, -1);
    expect(product.stock).toBe(initialStock - 1);

    // Revert
    productService.updateProductStock(product.id, 1);
    expect(product.stock).toBe(initialStock);
  });
});

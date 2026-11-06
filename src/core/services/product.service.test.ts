import { Product } from '../models/product.model';
import { productRepository } from '../repositories/product.repository';
import { productService } from './product.service';

const makeProduct = (overrides: Partial<Product>): Product => ({
  id: 'p1',
  name: 'Bud',
  slug: 'earring-bud',
  description: 'Pearl ear clip',
  category: 'earrings',
  categoryName: 'Earrings',
  priceBDT: 350,
  stock: 5,
  imageUrl: '/images/bud.webp',
  ...overrides,
});

const FIXTURES: Product[] = [
  makeProduct({}),
  makeProduct({ id: 'p2', name: 'Halo', slug: 'ring-halo', category: 'rings', categoryName: 'Rings', description: 'Steel ring' }),
  makeProduct({ id: 'p3', name: 'Chain', slug: 'bracelet-chain', category: 'bracelets', categoryName: 'Bracelets', description: 'Silver chain' }),
];

describe('ProductService', () => {
  beforeEach(async () => {
    jest
      .spyOn(productRepository, 'fetchAllFromDb')
      .mockResolvedValue(FIXTURES.map((p) => ({ ...p })));
    jest.spyOn(productRepository, 'upsertInDb').mockResolvedValue(true);
    await productService.syncFromDatabase();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should load all products from the database', () => {
    expect(productService.getAllProducts()).toHaveLength(3);
  });

  it('should filter products by category', () => {
    const earrings = productService.getProductsByCategory('earrings');
    expect(earrings).toHaveLength(1);
    expect(earrings.every((p) => p.category === 'earrings')).toBe(true);
  });

  it('should find a product by slug', () => {
    const product = productService.getProductBySlug('earring-bud');
    expect(product?.name).toBe('Bud');
  });

  it('should search products by keyword', () => {
    const results = productService.searchProducts('pearl');
    expect(results.some((p) => p.slug === 'earring-bud')).toBe(true);
  });

  it('should update product stock and persist to the database', () => {
    const product = productService.getAllProducts()[0];
    const initialStock = product.stock;

    productService.updateProductStock(product.id, -1);
    expect(product.stock).toBe(initialStock - 1);
    expect(productRepository.upsertInDb).toHaveBeenCalledWith(product);
  });
});

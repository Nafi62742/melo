export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'earrings' | 'rings' | 'bracelets';
  categoryName: string;
  priceBDT: number;
  originalPriceBDT?: number;
  costPriceCNY?: number;
  stock: number;
  imageUrl: string;
  images?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}


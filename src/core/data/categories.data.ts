import { Category } from '../models/category.model';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'earrings',
    name: 'Earrings',
    slug: 'earrings',
    description: 'French-style light luxury, pearl clips, hoops & delicate studs.',
    itemCount: 27,
    imageUrl: '/products/earrings/Love%20Cross-Link%20all%20with%20transparent%20silicone%20cushion.webp',
  },
  {
    id: 'rings',
    name: 'Rings',
    slug: 'rings',
    description: 'Minimalist bands, vintage accents & stackable stainless steel rings.',
    itemCount: 25,
    imageUrl: '/products/rings/J008%20gold.webp',
  },
  {
    id: 'bracelets',
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Delicate charm chains, pearls & sparkling adjustable wristwear.',
    itemCount: 2,
    imageUrl: '/products/bracelets/blue%20diamond.webp',
  },
];

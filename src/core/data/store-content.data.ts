import { StoreContent } from '../models/store-content.model';

export const DEFAULT_STORE_CONTENT: StoreContent = {
  hero: {
    badge: 'Curated Accessories for Bangladesh',
    titleLine1: 'Where Little Wonders',
    titleHighlight: 'Light Up.',
    subtitle:
      'Where little wonders light up. Handpicked, hypoallergenic, French-style light luxury earrings, dainty rings, and charming bracelets.',
    primaryCtaText: 'Explore Collection',
    primaryCtaLink: '/shop',
    secondaryCtaText: 'French Ear Clips',
    secondaryCtaLink: '/shop?category=earrings',
    trustMetrics: [
      { value: '54+', label: 'Curated Pieces' },
      { value: '100%', label: 'Painless Clips' },
      { value: 'COD', label: 'All Bangladesh' },
    ],
    primaryProductSlug: 'earring-wreath-flowers',
    primaryProductBadge: 'Signature Piece',
    secondaryProductSlug: 'ring-j008-gold',
    secondaryProductBadge: '316L Steel',
    tickerItems: [
      'Painless Silicone Cushion Ear Clips',
      'Tarnish-Free 316L Stainless Steel Rings',
      'Inspect Before You Pay (COD)',
    ],
  },
};


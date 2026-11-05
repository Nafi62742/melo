import { Suspense } from 'react';
import { CatalogFeature } from '@/features/catalog/catalog.feature';

export const metadata = {
  title: 'Shop All Jewellery & Accessories | MELO Bangladesh',
  description: 'Browse our full collection of French ear clips, stylish rings, and bracelets.',
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">Loading collection...</div>}>
      <CatalogFeature />
    </Suspense>
  );
}


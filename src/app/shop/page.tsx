import { Suspense } from 'react';
import { CatalogFeature } from '@/features/catalog/catalog.feature';

export const metadata = {
  title: 'Shop All Curated Finds, Gadgets & Gifts | MELO Bangladesh',
  description: 'Browse our full collection of lifestyle wonders, aesthetic gadgets, ear clips, and accessories.',
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">Loading collection...</div>}>
      <CatalogFeature />
    </Suspense>
  );
}


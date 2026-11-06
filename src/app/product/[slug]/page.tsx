import { notFound } from 'next/navigation';
import { cacheLife } from 'next/cache';
import { productRepository } from '@/core/repositories/product.repository';
import { ProductDetailFeature } from '@/features/product-detail/product-detail.feature';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/** Placeholder used when Supabase returns no slugs at build time (Cache Components needs ≥ 1 param). */
const PLACEHOLDER_SLUG = '__placeholder__';

async function getProductBySlug(slug: string) {
  'use cache';
  // Short cache — the client re-syncs from Supabase on mount, so prices stay fresh.
  cacheLife('minutes');
  if (slug === PLACEHOLDER_SLUG) return null;
  return productRepository.fetchBySlugFromDb(slug);
}

export async function generateStaticParams() {
  const slugs = await productRepository.fetchAllSlugsFromDb();
  if (slugs.length === 0) {
    return [{ slug: PLACEHOLDER_SLUG }];
  }
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found | MELO' };
  }

  return {
    title: `${product.name} | MELO Bangladesh`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailFeature product={product} />;
}

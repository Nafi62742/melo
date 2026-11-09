import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { productRepository } from '@/core/repositories/product.repository';
import { productService } from '@/core/services/product.service';
import { ProductDetailFeature } from '@/features/product-detail/product-detail.feature';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProductBySlug(slug: string) {
  // First try remote database if configured
  const remote = await productRepository.fetchBySlugFromDb(slug);
  if (remote) return remote;
  // Fall back to offline/local catalogue
  return productService.getProductBySlug(slug) || null;
}

export async function generateStaticParams() {
  const remoteSlugs = await productRepository.fetchAllSlugsFromDb();
  if (remoteSlugs.length > 0) {
    return remoteSlugs.map((slug) => ({ slug }));
  }
  return productService.getAllProducts().map((p) => ({ slug: p.slug }));
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

async function ProductPageContent({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailFeature product={product} />;
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-xs text-[#78716C]">
          Loading piece details...
        </div>
      }
    >
      <ProductPageContent params={params} />
    </Suspense>
  );
}

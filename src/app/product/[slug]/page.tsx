import { notFound } from 'next/navigation';
import { productService } from '@/core/services/product.service';
import { ProductDetailFeature } from '@/features/product-detail/product-detail.feature';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const products = productService.getAllProducts();
  return products.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = productService.getProductBySlug(slug);

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
  const product = productService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailFeature product={product} />;
}

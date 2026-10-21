import { getPublicReviewStats } from '@/lib/public-review-stats';
import { cache } from 'react';
import { Product } from '@/lib/data';
import { supabaseAdmin as supabase } from '@/lib/supabase-server';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamicParams = true;
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paradivine.ma';
const SITE_NAME = 'Para Divine';

function rowToProduct(item: any): Product {
  return {
    id: item.id as number,
    title: item.title as string,
    name: (item.name as string) || undefined,
    nameFr: (item.name_fr as string) || undefined,
    vendor: item.vendor as string,
    image: item.image as string,
    images: (item.images as string[]) || [],
    price: Number(item.price),
    comparePrice: Number(item.compare_price || item.price),
    category: item.category as string,
    tags: (item.tags as string[]) || [],
    rating: Number(item.rating || 0),
    reviews: Number(item.reviews || 0),
    description: (item.description as string) || '',
    ingredients: (item.ingredients as string) || '',
    usage: (item.usage as string) || '',
    stock: item.stock != null ? Number(item.stock) : 100,
    sku: (item.sku as string) || undefined,
    points: item.points != null ? Number(item.points) : 0,
    status: item.status === 'live' ? 'live' : 'draft',
    isFaceProduct: item.is_face_product === true || [item.category, ...(Array.isArray(item.categories) ? item.categories : [])]
      .filter(Boolean)
      .some((category: unknown) => /(^|\\s)(visage|face|skincare|soin visage)(\\s|$)/i.test(String(category))),
    recommendationStatus: item.recommendation_status === 'rejected'
      ? 'rejected'
      : item.recommendation_status === 'draft'
        ? 'draft'
        : 'approved',
    routineRoles: Array.isArray(item.routine_roles) ? item.routine_roles : [],
    suitableSkinTypes: Array.isArray(item.suitable_skin_types) ? item.suitable_skin_types : [],
    suitableConcerns: Array.isArray(item.suitable_concerns) ? item.suitable_concerns : [],
    sensitivityLevels: Array.isArray(item.sensitivity_levels) ? item.sensitivity_levels : [],
    activeStrength: item.active_strength || undefined,
    timeOfDay: Array.isArray(item.time_of_day) ? item.time_of_day : [],
  };
}

const getProduct = cache(async (id: string): Promise<Product | null> => {
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1 || Number(id) > 2147483647) notFound();
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', Number(id))
      .eq('status', 'live')
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    const stats = await getPublicReviewStats().catch(() => {
      console.error('[Reviews] Product review summary unavailable.');
      return {};
    });
    return { ...rowToProduct(data), ...((stats as Record<string, { rating: number; reviews: number }>)[String(data.id)] || { rating: 0, reviews: 0 }) };
  } catch {
    throw new Error('Unable to load product.');
  }
});

export async function generateStaticParams() {
  const { data, error } = await supabase.from('products').select('id').eq('status', 'live').limit(20);
  if (error) throw new Error('Unable to load product routes.');
  return (data || []).map((item: { id: number }) => ({ id: item.id.toString() }));
}

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);
  if (!product) return {};

  const productName = product.nameFr || product.title;
  const description = (product.description || '').substring(0, 160) ||
    `Achetez ${productName} de ${product.vendor} sur Para Divine`;
  const productUrl = `${SITE_URL}/products/${Number(resolvedParams.id)}`;
  // Resolve image: absolute URL if it starts with http, else prepend site URL
  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : `${SITE_URL}${product.image}`;

  return {
    title: productName,
    description,
    keywords: [productName, product.vendor, product.category, 'parapharmacie maroc', 'k-beauty'],
    alternates: { canonical: `/products/${Number(resolvedParams.id)}` },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'fr_MA',
      url: productUrl,
      siteName: SITE_NAME,
      title: `${productName} — ${product.vendor}`,
      description,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: productName,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${productName} — ${product.vendor}`,
      description,
      images: [imageUrl],
    },
  };
}

/** Build Product JSON-LD for Google Rich Results */
function buildProductJsonLd(product: Product, id: string) {
  const productName = product.nameFr || product.title;
  const productUrl = `${SITE_URL}/products/${id}`;
  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : `${SITE_URL}${product.image}`;
  const allImages = [imageUrl, ...(product.images || []).map((img) =>
    img.startsWith('http') ? img : `${SITE_URL}${img}`
  )];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    ...(product.description?.trim() ? { description: product.description.trim() } : {}),
    image: allImages,
    url: productUrl,
    sku: product.sku || `SKU-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: product.vendor,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'MAD',
      price: product.price.toFixed(2),
      availability: (product.stock ?? 100) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
    ...(product.reviews > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toFixed(1),
        reviewCount: product.reviews,
        bestRating: '5',
        worstRating: '1',
      },
    }),
  };
}

export default async function ProductPage({ params }: { params: any }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);
  
  if (!product) {
    notFound();
  }

  const jsonLd = buildProductJsonLd(product, resolvedParams.id);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}

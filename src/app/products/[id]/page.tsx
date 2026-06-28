import { PRODUCTS_DB, Product } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamicParams = true;
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paraofficinal.ma';
const SITE_NAME = 'Para Officinal S.A';

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
    rating: Number(item.rating || 5),
    reviews: Number(item.reviews || 0),
    description: (item.description as string) || '',
    ingredients: (item.ingredients as string) || '',
    usage: (item.usage as string) || '',
    stock: item.stock != null ? Number(item.stock) : 100,
    sku: (item.sku as string) || undefined,
    buyingCost: item.buying_cost != null ? Number(item.buying_cost) : undefined,
    points: item.points != null ? Number(item.points) : 0,
  };
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', parseInt(id))
      .single();
    
    if (error || !data) {
      return PRODUCTS_DB.find((p) => p.id.toString() === id) || null;
    }
    return rowToProduct(data);
  } catch (err) {
    return PRODUCTS_DB.find((p) => p.id.toString() === id) || null;
  }
}

export async function generateStaticParams() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(500);
    
    if (error || !data || data.length === 0) {
      return PRODUCTS_DB.map((product) => ({
        id: product.id.toString(),
      }));
    }
    return data.map((item: any) => ({
      id: item.id.toString(),
    }));
  } catch (err) {
    return PRODUCTS_DB.map((product) => ({
      id: product.id.toString(),
    }));
  }
}

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);
  if (!product) return {};

  const productName = product.nameFr || product.title;
  const description = (product.description || '').substring(0, 160) ||
    `Achetez ${productName} de ${product.vendor} sur Para Officinal S.A.`;
  const productUrl = `${SITE_URL}/products/${resolvedParams.id}`;
  // Resolve image: absolute URL if it starts with http, else prepend site URL
  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : `${SITE_URL}${product.image}`;

  return {
    title: productName,
    description,
    keywords: [productName, product.vendor, product.category, 'parapharmacie maroc', 'k-beauty'],
    alternates: { canonical: `/products/${resolvedParams.id}` },
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
    description: product.description || '',
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


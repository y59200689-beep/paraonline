import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Product } from '@/lib/data';
import ArticleDetailClient from './ArticleDetailClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamicParams = true;
export const revalidate = 3600; // 1 hour

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

async function getArticle(slug: string) {
  try {
    const { data: article, error } = await supabase
      .from('advice_articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error || !article) return null;

    let recommendedProducts: Product[] = [];
    if (article.recommended_products && article.recommended_products.length > 0) {
      const { data: prods, error: prodError } = await supabase
        .from('products')
        .select('*')
        .in('id', article.recommended_products);
      
      if (!prodError && prods) {
        recommendedProducts = prods.map(rowToProduct);
      }
    }

    return {
      article,
      recommendedProducts
    };
  } catch (err) {
    console.error("Error loading article detail on server:", err);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const { data, error } = await supabase
      .from('advice_articles')
      .select('slug')
      .eq('status', 'published');
    
    if (error || !data) return [];
    return data.map((item: any) => ({
      slug: item.slug
    }));
  } catch (err) {
    return [];
  }
}

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getArticle(resolvedParams.slug);
  if (!data) return {};

  const { article } = data;
  const title = article.title_fr || article.title_ar;
  const description = article.summary_fr || article.summary_ar || '';
  const url = `${SITE_URL}/advice/${resolvedParams.slug}`;

  return {
    title,
    description: description.substring(0, 160),
    alternates: { canonical: `/advice/${resolvedParams.slug}` },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: SITE_NAME,
      images: [{ url: article.image }],
    },
  };
}

export default async function ArticleDetailPage({ params }: { params: any }) {
  const resolvedParams = await params;
  const data = await getArticle(resolvedParams.slug);

  if (!data) {
    notFound();
  }

  return (
    <ArticleDetailClient 
      article={data.article} 
      initialRecommendedProducts={data.recommendedProducts} 
    />
  );
}

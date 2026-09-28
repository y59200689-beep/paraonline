import type { MetadataRoute } from 'next';
import { PRODUCTS_DB } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { BRANDS_DATA, slugify } from '@/lib/brands';

export const revalidate = 3600;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paradivine.ma').replace(/\/$/, '');
const PAGE_SIZE = 1000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/advice`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/a-propos`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/politiques/conditions-vente`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/politiques/confidentialite`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/politiques/retours-reclamations`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const brandPages: MetadataRoute.Sitemap = BRANDS_DATA.map((brand) => ({
    url: `${SITE_URL}/brand/${slugify(brand.name)}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  let advicePages: MetadataRoute.Sitemap = [];
  try {
    const { data, error } = await supabase
      .from('advice_articles')
      .select('slug, created_at')
      .eq('status', 'published');

    if (error) throw error;
    const articles = (data ?? []) as { slug: string | null; created_at: string | null }[];
    advicePages = articles.filter((article): article is { slug: string; created_at: string | null } => Boolean(article.slug)).map((article) => ({
      url: `${SITE_URL}/advice/${encodeURIComponent(article.slug)}`,
      ...(article.created_at ? { lastModified: new Date(article.created_at) } : {}),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error loading advice articles for sitemap:', error);
  }

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products: { id: number; updated_at: string | null }[] = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data, error } = await supabase
        .from('products')
        .select('id, updated_at')
        .eq('status', 'live')
        .order('id', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw error;
      products.push(...(data ?? []));
      if (!data || data.length < PAGE_SIZE) break;
    }

    productPages = products.map((product) => ({
      url: `${SITE_URL}/products/${product.id}`,
      ...(product.updated_at ? { lastModified: new Date(product.updated_at) } : {}),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error loading products for sitemap:', error);
    productPages = PRODUCTS_DB.filter((product) => product.status === 'live').map((product) => ({
      url: `${SITE_URL}/products/${product.id}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  }

  return [...staticPages, ...brandPages, ...advicePages, ...productPages];
}

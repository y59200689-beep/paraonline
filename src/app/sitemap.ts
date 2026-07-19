import type { MetadataRoute } from 'next';
import { PRODUCTS_DB } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { BRANDS_DATA, slugify } from '@/lib/brands';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paraofficinal.ma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Static pages ────────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/advice`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/politiques/conditions-vente`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/politiques/confidentialite`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/politiques/retours-reclamations`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // ── Dynamic brand pages ──────────────────────────────────────────────────────
  const brandPages: MetadataRoute.Sitemap = BRANDS_DATA.map((brand) => ({
    url: `${SITE_URL}/brand/${slugify(brand.name)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // ── Dynamic advice pages ─────────────────────────────────────────────────────
  let advicePages: MetadataRoute.Sitemap = [];
  try {
    const { data: articles, error: articlesError } = await supabase
      .from('advice_articles')
      .select('slug, created_at')
      .eq('status', 'published');

    if (!articlesError && articles && articles.length > 0) {
      advicePages = articles.map((article: any) => ({
        url: `${SITE_URL}/advice/${article.slug}`,
        lastModified: article.created_at ? new Date(article.created_at) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.error("Error loading advice articles for sitemap:", err);
  }

  // ── Dynamic product pages ────────────────────────────────────────────────────
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, updated_at')
      .limit(1000);

    if (!error && data && data.length > 0) {
      productPages = data.map((row: any) => ({
        url: `${SITE_URL}/products/${row.id}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    } else {
      // Fallback: use local PRODUCTS_DB
      productPages = PRODUCTS_DB.map((product) => ({
        url: `${SITE_URL}/products/${product.id}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Fallback: use local PRODUCTS_DB
    productPages = PRODUCTS_DB.map((product) => ({
      url: `${SITE_URL}/products/${product.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  }

  return [...staticPages, ...brandPages, ...advicePages, ...productPages];
}


import type { MetadataRoute } from 'next';
import { PRODUCTS_DB } from '@/lib/data';
import { supabase } from '@/lib/supabase';

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

  // ── Dynamic product pages ────────────────────────────────────────────────────
  let productIds: string[] = [];

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, updated_at')
      .limit(1000);

    if (!error && data && data.length > 0) {
      const productPages: MetadataRoute.Sitemap = data.map((row: any) => ({
        url: `${SITE_URL}/products/${row.id}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
      return [...staticPages, ...productPages];
    }
  } catch {
    // Fall back to static product DB
  }

  // Fallback: use local PRODUCTS_DB
  const fallbackProductPages: MetadataRoute.Sitemap = PRODUCTS_DB.map((product) => ({
    url: `${SITE_URL}/products/${product.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...fallbackProductPages];
}

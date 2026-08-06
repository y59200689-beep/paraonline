import { supabaseAdmin } from './supabase';
import { unstable_cache } from 'next/cache';
import type { BrandConfig } from './brands';

export const BRANDS_CACHE_TAG = 'cms-brands';

/**
 * Fetches a brand by slug from `cms_brands`.
 * Falls back to hardcoded BRANDS_DATA if not found in CMS or on query error.
 */
async function fetchBrandBySlug(slug: string, fallbackMap: Record<string, BrandConfig>): Promise<BrandConfig | undefined> {
  try {
    const { data, error } = await supabaseAdmin
      .from('cms_brands')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error || !data) {
      return fallbackMap[slug];
    }

    return {
      name: data.name,
      domain: data.domain || '',
      logoUrl: data.logo_url || '',
      taglineFr: data.tagline_fr || '',
      taglineAr: data.tagline_ar || '',
      descriptionFr: data.description_fr || '',
      descriptionAr: data.description_ar || '',
    };
  } catch {
    return fallbackMap[slug];
  }
}

export function getCmsBrandBySlug(slug: string, fallbackMap: Record<string, BrandConfig>) {
  return unstable_cache(
    () => fetchBrandBySlug(slug, fallbackMap),
    [`cms-brand-${slug}`],
    { tags: [BRANDS_CACHE_TAG, `cms-brand-${slug}`], revalidate: false }
  )();
}

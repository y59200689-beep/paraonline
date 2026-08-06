import { supabaseAdmin } from '@/lib/supabase';
import { unstable_cache } from 'next/cache';
import type { HomepageSectionItem } from '@/context/SettingsContext';

export const CMS_HOMEPAGE_CACHE_TAG = 'cms-homepage';

/**
 * Fetches the published homepage section order from cms_pages.
 *
 * This is the single authority for storefront homepage layout.
 * The admin controls section order, visibility, and settings entirely
 * through the CMS — no code changes needed.
 *
 * Falls back to `defaultSections` when:
 *   - No published cms_pages row exists for slug='home'
 *   - The DB query fails
 *   - section_order is empty
 */
async function fetchHomepageSections(
  defaultSections: HomepageSectionItem[]
): Promise<HomepageSectionItem[]> {
  try {
    // 1. Primary: fetch published section_order from cms_pages
    const { data: cmsData } = await supabaseAdmin
      .from('cms_pages')
      .select('section_order')
      .eq('slug', 'home')
      .eq('status', 'published')
      .maybeSingle();

    if (cmsData?.section_order && Array.isArray(cmsData.section_order) && cmsData.section_order.length > 0) {
      return cmsData.section_order as HomepageSectionItem[];
    }

    // 2. Secondary: fallback to store_settings table homepageSections.sectionOrder
    const { data: settingsData } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('id', 1)
      .maybeSingle();

    const settingsOrder = settingsData?.value?.homepageSections?.sectionOrder;
    if (settingsOrder && Array.isArray(settingsOrder) && settingsOrder.length > 0) {
      return settingsOrder as HomepageSectionItem[];
    }

    return defaultSections;
  } catch {
    // CMS tables may not exist yet on first deploy; fall back gracefully
    return defaultSections;
  }
}

/**
 * Cached wrapper — invalidate with `revalidateTag(CMS_HOMEPAGE_CACHE_TAG)`
 * from the API route after an admin publish.
 */
const getCachedHomepageSections = (defaultSections: HomepageSectionItem[]) =>
  unstable_cache(
    () => fetchHomepageSections(defaultSections),
    ['cms-homepage-sections'],
    { tags: [CMS_HOMEPAGE_CACHE_TAG], revalidate: false }
  )();

export async function getHomepageSections(
  defaultSections: HomepageSectionItem[]
): Promise<HomepageSectionItem[]> {
  return getCachedHomepageSections(defaultSections);
}

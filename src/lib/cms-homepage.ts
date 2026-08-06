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
    const { data, error } = await supabaseAdmin
      .from('cms_pages')
      .select('section_order')
      .eq('slug', 'home')
      .eq('status', 'published')
      .maybeSingle();

    if (error || !data?.section_order) return defaultSections;

    const sections = data.section_order as HomepageSectionItem[];
    if (!Array.isArray(sections) || sections.length === 0) return defaultSections;

    return sections;
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

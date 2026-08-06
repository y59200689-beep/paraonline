import { supabaseAdmin } from './supabase';
import { unstable_cache } from 'next/cache';
import { getPublicSettings as getBasePublicSettings, PUBLIC_SETTINGS_CACHE_TAG } from './get-public-settings';

export interface CmsGlobalSettings {
  storeName?: string;
  storeTaglineFr?: string;
  storeTaglineAr?: string;
  announcementFr?: string;
  announcementAr?: string;
  announcementEnabled?: boolean;
  announcementLink?: string;
  headerNav?: any[];
}

/**
 * Fetches merged public settings: base JSONB settings + cms_global table overrides.
 */
async function fetchMergedPublicSettings() {
  const base = await getBasePublicSettings();

  try {
    const { data: cmsGlobal } = await supabaseAdmin
      .from('cms_global')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (!cmsGlobal) return base;

    return {
      ...base,
      storeName: cmsGlobal.store_name || base.storeName,
      storeTaglineFr: cmsGlobal.store_tagline_fr || base.storeTaglineFr,
      storeTaglineAr: cmsGlobal.store_tagline_ar || base.storeTaglineAr,
      announcementFr: cmsGlobal.announcement_fr || base.announcementFr,
      announcementAr: cmsGlobal.announcement_ar || base.announcementAr,
      announcementEnabled: cmsGlobal.announcement_enabled ?? base.announcementEnabled,
      announcementLink: cmsGlobal.announcement_link || base.announcementLink,
      headerNav: cmsGlobal.header_nav?.length ? cmsGlobal.header_nav : base.headerNav,
    };
  } catch {
    return base;
  }
}

export function getMergedPublicSettings() {
  return unstable_cache(
    () => fetchMergedPublicSettings(),
    ['cms-merged-public-settings'],
    { tags: [PUBLIC_SETTINGS_CACHE_TAG], revalidate: false }
  )();
}

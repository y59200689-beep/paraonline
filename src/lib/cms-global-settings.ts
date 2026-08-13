import { supabaseAdmin } from './supabase';
import { unstable_cache } from 'next/cache';
import { getPublicSettings as getBasePublicSettings, PUBLIC_SETTINGS_CACHE_TAG } from './get-public-settings';

export interface CmsGlobalSettings {
  storeName?: string;
  storeTaglineFr?: string;
  storeTaglineAr?: string;
  storePhone?: string;
  storeWhatsapp?: string;
  announcementFr?: string;
  announcementAr?: string;
  announcementEnabled?: boolean;
  announcementLink?: string;
  headerNav?: any[];
  footerColumns?: any[];
  socialLinks?: any[];
  trustBadges?: any[];
  ctaLabels?: Record<string, any>;
  deliveryCopyFr?: string;
  deliveryCopyAr?: string;
  seoDefaultTitleFr?: string;
  seoDefaultTitleAr?: string;
  seoDefaultDescFr?: string;
  seoDefaultDescAr?: string;
  ogDefaultImage?: string;
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
      storePhone: cmsGlobal.store_phone || base.storePhone,
      storeWhatsApp: cmsGlobal.store_whatsapp || base.storeWhatsApp,
      announcementFr: cmsGlobal.announcement_fr || base.announcementFr,
      announcementAr: cmsGlobal.announcement_ar || base.announcementAr,
      announcementEnabled: cmsGlobal.announcement_enabled ?? base.announcementEnabled,
      announcementLink: cmsGlobal.announcement_link || base.announcementLink,
      headerNav: cmsGlobal.header_nav?.length ? cmsGlobal.header_nav : base.headerNav,
      footerColumns: cmsGlobal.footer_columns?.length ? cmsGlobal.footer_columns : [],
      socialLinks: cmsGlobal.social_links?.length ? cmsGlobal.social_links : [],
      trustBadges: cmsGlobal.trust_badges?.length ? cmsGlobal.trust_badges : [],
      ctaLabels: cmsGlobal.cta_labels || {},
      deliveryCopyFr: cmsGlobal.delivery_copy_fr || '',
      deliveryCopyAr: cmsGlobal.delivery_copy_ar || '',
      seoDefaultTitleFr: cmsGlobal.seo_default_title_fr || '',
      seoDefaultTitleAr: cmsGlobal.seo_default_title_ar || '',
      seoDefaultDescFr: cmsGlobal.seo_default_desc_fr || '',
      seoDefaultDescAr: cmsGlobal.seo_default_desc_ar || '',
      ogDefaultImage: cmsGlobal.og_default_image || '',
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

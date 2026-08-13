import { supabaseAdmin } from '@/lib/supabase';

export type CmsPageSection = {
  id: string;
  section_type?: string;
  type?: string;
  visible?: boolean;
  settings?: Record<string, unknown>;
};

export type CmsPublicPage = {
  id: string;
  slug: string;
  page_type: string;
  title_fr?: string | null;
  title_ar?: string | null;
  seo_title_fr?: string | null;
  seo_title_ar?: string | null;
  seo_description_fr?: string | null;
  seo_description_ar?: string | null;
  seo_social_image?: string | null;
  canonical_url?: string | null;
  section_order?: CmsPageSection[] | null;
};

const PREVIEW_TOKEN = /^[a-f0-9]{32,128}$/i;

/** Published page lookup with an optional, entity-bound preview snapshot. */
export async function getCmsPageBySlug(slug: string, previewToken?: string): Promise<CmsPublicPage | null> {
  try {
    let { data } = await supabaseAdmin.from('cms_pages').select('*').eq('slug', slug).eq('status', 'published').maybeSingle();
    if (previewToken && PREVIEW_TOKEN.test(previewToken)) {
      const { data: token } = await supabaseAdmin.from('cms_preview_tokens').select('entity_type,entity_id,snapshot,expires_at').eq('token', previewToken).eq('entity_type', 'page').maybeSingle();
      const snapshot = token?.snapshot as CmsPublicPage | undefined;
      if (snapshot && snapshot.slug === slug && new Date(token.expires_at).getTime() > Date.now()) data = snapshot;
    }
    return data ?? null;
  } catch {
    return null;
  }
}

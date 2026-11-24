import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { canManageSettings } from '@/lib/permissions';
import { PUBLIC_SETTINGS_CACHE_TAG } from '@/lib/get-public-settings';
import { DEFAULT_HOMEPAGE_SECTIONS } from '@/lib/default-homepage-sections';
import { BEST_SELLERS_LIMIT } from '@/lib/homepage-best-sellers';
import type { HomepageSectionItem } from '@/context/SettingsContext';
import { normalizeSettingsForPersistence } from '@/lib/settings-normalization';

export async function GET() {
  try {
    // Settings contain payment credentials — require a valid admin session
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, settings: data.value });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

async function saveBestSellersSection(input: HomepageSectionItem) {
  const productIds = input?.settings?.productIds;
  if (input?.type !== 'bestSellers' || typeof input.visible !== 'boolean'
    || typeof input.nameFr !== 'string' || !Array.isArray(productIds)
    || productIds.length > BEST_SELLERS_LIMIT
    || new Set(productIds).size !== productIds.length
    || productIds.some(id => !Number.isSafeInteger(id) || id <= 0)) {
    return NextResponse.json({ success: false, error: 'Sélection de produits invalide.' }, { status: 400 });
  }

  const { data: home, error } = await supabase.from('cms_pages')
    .select('id,status,section_order,updated_at').eq('slug', 'home').maybeSingle();
  if (error) throw error;
  if (home && home.status !== 'published') {
    return NextResponse.json({ success: false, error: 'La page d’accueil doit être publiée.' }, { status: 409 });
  }
  let sections: HomepageSectionItem[] = home?.section_order;
  if (!Array.isArray(sections) || !sections.length) {
    const { data: legacy, error: settingsError } = await supabase.from('settings')
      .select('value').eq('id', 1).maybeSingle();
    if (settingsError) throw settingsError;
    const legacySections = legacy?.value?.homepageSections?.sectionOrder;
    sections = Array.isArray(legacySections) && legacySections.length ? legacySections : DEFAULT_HOMEPAGE_SECTIONS;
  }

  const index = sections.findIndex(section => section.type === 'bestSellers');
  const current = sections[index];
  const updated: HomepageSectionItem = {
    id: current?.id ?? 'bestSellers-1',
    type: 'bestSellers',
    visible: input.visible,
    nameFr: input.nameFr,
    settings: { ...current?.settings, ...input.settings, productIds },
  };
  const next = [...sections];
  if (index === -1) next.push(updated);
  else next[index] = updated;

  const change = { section_order: next, updated_at: new Date().toISOString() };
  if (home) {
    const { data, error: updateError } = await supabase.from('cms_pages')
      .update(change).eq('id', home.id).eq('updated_at', home.updated_at).select('id').maybeSingle();
    if (updateError) throw updateError;
    if (!data) return NextResponse.json({ success: false, error: 'La page a changé. Rechargez-la puis réessayez.' }, { status: 409 });
  } else {
    const { error: insertError } = await supabase.from('cms_pages').insert({
      ...change, slug: 'home', page_type: 'home', title_fr: 'Page d’accueil', status: 'published',
    });
    if (insertError) throw insertError;
  }

  revalidateTag('cms-homepage', { expire: 0 });
  revalidatePath('/');
  return NextResponse.json({ success: true, sections: next });
}

export async function POST(request: Request) {
  try {
    // Only authenticated admins may modify settings (payment keys, courier credentials, etc.)
    const authorization = await authorizeAdminMutation({
      allow: canManageSettings,
      forbiddenMessage: 'Accès refusé. Propriétaire uniquement.',
    });
    if (!authorization.authorized) return authorization.response;

    const { settings, bestSellersSection } = await request.json();
    if (bestSellersSection !== undefined) return await saveBestSellersSection(bestSellersSection);
    if (!settings) {
      return NextResponse.json({ success: false, error: 'Settings object is required' }, { status: 400 });
    }

    // Preserve existing values when a partial settings document is submitted.
    let existingSettings: Record<string, any> = {};
    try {
      const { data: existingData } = await supabase
        .from('settings')
        .select('value')
        .eq('id', 1)
        .single();
      existingSettings = existingData?.value || {};
    } catch {}
    const mergedSettings = normalizeSettingsForPersistence(settings, existingSettings);

    const { error } = await supabase
      .from('settings')
      .upsert({ id: 1, value: mergedSettings }, { onConflict: 'id' });
    
    if (error) throw error;

    // Also sync section_order to cms_pages table if homepageSections contains sectionOrder
    if (mergedSettings.homepageSections?.sectionOrder && Array.isArray(mergedSettings.homepageSections.sectionOrder)) {
      try {
        await supabase
          .from('cms_pages')
          .upsert({
            slug: 'home',
            title_fr: 'Page d\'accueil',
            status: 'published',
            section_order: mergedSettings.homepageSections.sectionOrder,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'slug' });
      } catch (err) {
        console.warn('Could not sync section_order to cms_pages:', err);
      }
    }

    try {
      revalidateTag(PUBLIC_SETTINGS_CACHE_TAG, { expire: 0 });
      revalidateTag('cms-homepage', { expire: 0 });
      revalidatePath('/');
    } catch {}
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Save settings error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

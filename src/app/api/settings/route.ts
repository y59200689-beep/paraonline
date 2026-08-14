import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { canManageSettings } from '@/lib/permissions';
import { PUBLIC_SETTINGS_CACHE_TAG } from '@/lib/get-public-settings';
import { FREE_SHIPPING_SUBTOTAL_DH, isLegacyFreeShippingGiftRange } from '@/lib/pricing';

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

export async function POST(request: Request) {
  try {
    // Only authenticated admins may modify settings (payment keys, courier credentials, etc.)
    const authorization = await authorizeAdminMutation({
      allow: canManageSettings,
      forbiddenMessage: 'Accès refusé. Propriétaire uniquement.',
    });
    if (!authorization.authorized) return authorization.response;

    const { settings } = await request.json();
    if (!settings) {
      return NextResponse.json({ success: false, error: 'Settings object is required' }, { status: 400 });
    }

    // Preserve existing galleryOverrides stored in DB row id=1
    let galleryOverrides = settings.galleryOverrides || {};
    let existingSettings: Record<string, any> = {};
    try {
      const { data: existingData } = await supabase
        .from('settings')
        .select('value')
        .eq('id', 1)
        .single();
      existingSettings = existingData?.value || {};
      galleryOverrides = { ...(existingSettings.galleryOverrides || {}), ...galleryOverrides };
    } catch {}

    const requestedGiftRanges = Array.isArray(settings.giftRanges)
      ? settings.giftRanges
      : (Array.isArray(existingSettings.giftRanges) ? existingSettings.giftRanges : []);
    const giftRanges = requestedGiftRanges.filter((range: any) => !isLegacyFreeShippingGiftRange(range));
    const mergedSettings = {
      ...settings,
      galleryOverrides,
      freeShippingThreshold: FREE_SHIPPING_SUBTOTAL_DH,
      giftRanges,
    };

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

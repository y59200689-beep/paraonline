import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';

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
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }
    if (session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Accès refusé. Propriétaire uniquement.' }, { status: 403 });
    }

    const { settings } = await request.json();
    if (!settings) {
      return NextResponse.json({ success: false, error: 'Settings object is required' }, { status: 400 });
    }

    // Preserve existing galleryOverrides stored in DB row id=1
    let galleryOverrides = settings.galleryOverrides || {};
    try {
      const { data: existingData } = await supabase
        .from('settings')
        .select('value')
        .eq('id', 1)
        .single();
      const existingVal = existingData?.value || {};
      galleryOverrides = { ...(existingVal.galleryOverrides || {}), ...galleryOverrides };
    } catch {}

    const mergedSettings = { ...settings, galleryOverrides };

    const { error } = await supabase
      .from('settings')
      .upsert({ id: 1, value: mergedSettings }, { onConflict: 'id' });
    
    if (error) throw error;
    try { revalidatePath('/'); } catch {}
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Save settings error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

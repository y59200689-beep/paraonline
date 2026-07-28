import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Server error';
}

// ─── Public read-only endpoint: returns gallery overrides from Supabase DB ──
// No admin auth required — only exposes image keys and their public URLs.
export async function GET() {
  try {
    let dbOverrides1: Record<string, string> = {};
    let dbOverrides99: Record<string, string> = {};

    try {
      const { data: data1 } = await supabase
        .from('settings')
        .select('value')
        .eq('id', 1)
        .maybeSingle();
      dbOverrides1 = data1?.value?.galleryOverrides || {};
    } catch {}

    try {
      const { data: data99 } = await supabase
        .from('settings')
        .select('value')
        .eq('id', 99)
        .maybeSingle();
      dbOverrides99 = data99?.value || {};
    } catch {}

    const overrides = { ...dbOverrides1, ...dbOverrides99 };
    return NextResponse.json(
      { success: true, overrides },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (e: unknown) {
    return NextResponse.json(
      { success: false, overrides: {}, error: getErrorMessage(e) },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}

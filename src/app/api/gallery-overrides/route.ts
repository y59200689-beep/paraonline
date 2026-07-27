import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import path from 'path';
import fs from 'fs';

// ─── Public read-only endpoint: returns gallery overrides from Supabase DB + local file ──
// No admin auth required — only exposes image keys and their public URLs.
export async function GET() {
  try {
    let dbOverrides: Record<string, string> = {};
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('id', 1)
        .single();
      dbOverrides = data?.value?.galleryOverrides || {};
    } catch {}

    let fileOverrides: Record<string, string> = {};
    try {
      const overridesPath = path.join(process.cwd(), 'gallery-overrides.json');
      if (fs.existsSync(overridesPath)) {
        fileOverrides = JSON.parse(fs.readFileSync(overridesPath, 'utf-8'));
      }
    } catch {}

    const overrides = { ...dbOverrides, ...fileOverrides };
    return NextResponse.json({ success: true, overrides });
  } catch (e: any) {
    return NextResponse.json({ success: false, overrides: {}, error: e.message });
  }
}

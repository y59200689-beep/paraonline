import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import path from 'path';
import fs from 'fs';

// ─── Public read-only endpoint: returns gallery overrides from Supabase DB + local file ──
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

    let fileOverrides: Record<string, string> = {};
    try {
      const overridesPath = path.join(process.cwd(), 'gallery-overrides.json');
      if (fs.existsSync(overridesPath)) {
        fileOverrides = JSON.parse(fs.readFileSync(overridesPath, 'utf-8'));
      }
    } catch {}

    const overrides = { ...dbOverrides1, ...dbOverrides99, ...fileOverrides };
    return NextResponse.json({ success: true, overrides });
  } catch (e: any) {
    return NextResponse.json({ success: false, overrides: {}, error: e.message });
  }
}

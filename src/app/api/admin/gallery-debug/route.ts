import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import path from 'path';
import fs from 'fs';

// Temporary debug endpoint — returns raw DB state for gallery overrides troubleshooting
export async function GET() {
  const result: Record<string, any> = {};

  // 1. Read row id=1
  try {
    const { data: data1, error: err1 } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 1)
      .single();
    result['row_1_galleryOverrides'] = data1?.value?.galleryOverrides ?? null;
    result['row_1_error'] = err1?.message ?? null;
  } catch (e: any) {
    result['row_1_exception'] = e.message;
  }

  // 2. Read row id=99
  try {
    const { data: data99, error: err99 } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 99)
      .single();
    result['row_99_value'] = data99?.value ?? null;
    result['row_99_error'] = err99?.message ?? null;
  } catch (e: any) {
    result['row_99_exception'] = e.message;
  }

  // 3. Read gallery-overrides.json
  try {
    const filePath = path.join(process.cwd(), 'gallery-overrides.json');
    if (fs.existsSync(filePath)) {
      result['file_overrides'] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } else {
      result['file_overrides'] = 'FILE NOT FOUND';
    }
  } catch (e: any) {
    result['file_exception'] = e.message;
  }

  return NextResponse.json({ success: true, debug: result });
}

import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

// Admin-only debug endpoint — returns raw DB state for gallery overrides troubleshooting
export async function GET() {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
  }

  const result: Record<string, unknown> = {};

  // 1. Read row id=1
  try {
    const { data: data1, error: err1 } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 1)
      .single();
    result['row_1_galleryOverrides'] = data1?.value?.galleryOverrides ?? null;
    result['row_1_error'] = err1?.message ?? null;
  } catch (e: unknown) {
    result['row_1_exception'] = getErrorMessage(e);
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
  } catch (e: unknown) {
    result['row_99_exception'] = getErrorMessage(e);
  }

  return NextResponse.json({ success: true, debug: result });
}

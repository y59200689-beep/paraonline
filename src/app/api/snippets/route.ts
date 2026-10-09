import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-server';

export async function GET() {
  try {
    // Public route to fetch only active storefront client snippets
    const { data: snippets, error } = await supabase
      .from('code_snippets')
      .select('id, code, location')
      .eq('active', true)
      .eq('trigger_type', 'client');

    if (error) throw error;

    return NextResponse.json({ success: true, snippets });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

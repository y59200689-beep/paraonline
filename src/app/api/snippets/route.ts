import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

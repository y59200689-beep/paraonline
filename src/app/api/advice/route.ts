import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';

    let query = supabase
      .from('advice_articles')
      .select('*')
      .eq('status', 'published');

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    // Sort by created_at descending
    const { data: articles, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { success: true, articles },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: any) {
    console.error("Public advice listing GET error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

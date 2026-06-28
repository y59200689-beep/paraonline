import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { slug } = await params;

    const { data: article, error } = await supabase
      .from('advice_articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article non trouvé ou non publié.' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, article },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: any) {
    console.error("Public advice details GET error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

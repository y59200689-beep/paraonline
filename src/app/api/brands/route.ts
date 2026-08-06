import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { BRANDS_DATA } from '@/lib/brands';

// Public endpoint — no auth needed, only returns visible brands for the storefront
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('cms_brands')
      .select('name,slug,domain,logo_url,is_visible,card_link,display_order')
      .eq('is_visible', true)
      .eq('status', 'published')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      // Fallback to hardcoded defaults
      return NextResponse.json({
        brands: BRANDS_DATA.map(b => ({
          name: b.name,
          slug: b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          domain: b.domain,
          logo_url: b.logoUrl || null,
          is_visible: true,
          card_link: null,
        })),
      }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }

    return NextResponse.json({ brands: data }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch {
    return NextResponse.json({ brands: [] });
  }
}

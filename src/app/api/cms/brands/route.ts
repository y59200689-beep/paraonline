import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAdminSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('vendor')
      .eq('status', 'live');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const brandCounts: Record<string, number> = {};
    (products || []).forEach((p: { vendor: string }) => {
      const vendor = p.vendor?.trim();
      if (vendor) {
        brandCounts[vendor] = (brandCounts[vendor] || 0) + 1;
      }
    });

    const brands = Object.keys(brandCounts)
      .sort((a, b) => a.localeCompare(b))
      .map(name => ({
        name,
        count: brandCounts[name]
      }));

    return NextResponse.json({ success: true, brands });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/cron/cms_publish_scheduled
 *
 * Scans cms_pages and cms_brands for items with:
 *   status = 'scheduled' AND scheduled_at <= NOW()
 * Updates their status to 'published' and clears scheduled_at.
 * Protected by CRON_SECRET authorization header.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 503 });
  }
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date().toISOString();

  // Publish scheduled pages that have passed their approval gate.
  const { data: pages, error: pErr } = await supabaseAdmin
    .from('cms_pages')
    .update({ status: 'published', published_at: now, scheduled_at: null })
    .eq('status', 'scheduled')
    .eq('approval_status', 'approved')
    .lte('scheduled_at', now)
    .select('id, slug, title_fr');

  // Publish scheduled brands
  const { data: brands, error: bErr } = await supabaseAdmin
    .from('cms_brands')
    .update({ status: 'published', published_at: now, scheduled_at: null })
    .eq('status', 'scheduled')
    .eq('approval_status', 'approved')
    .lte('scheduled_at', now)
    .select('id, name, slug');

  return NextResponse.json({
    published_pages: pages ?? [],
    published_brands: brands ?? [],
    pages_error: pErr?.message,
    brands_error: bErr?.message,
  });
}

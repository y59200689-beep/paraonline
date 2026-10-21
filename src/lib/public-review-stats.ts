import 'server-only';
import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from './supabase-server';
import { approvedReviewStats } from './review-stats';

export const PUBLIC_REVIEWS_CACHE_TAG = 'public-approved-reviews';

export const getPublicReviewStats = unstable_cache(async () => {
  const rows: Array<{ product_id: unknown; rating: unknown }> = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabaseAdmin.from('reviews')
      .select('id,product_id,rating').eq('status', 'Approved')
      .order('id', { ascending: true }).range(from, from + 999);
    if (error) throw new Error('Approved review statistics unavailable');
    rows.push(...(data || []));
    if ((data || []).length < 1000) break;
  }
  return approvedReviewStats(rows);
}, ['approved-review-stats-v1', process.env.NEXT_PUBLIC_SUPABASE_URL || 'unconfigured'],
{ tags: [PUBLIC_REVIEWS_CACHE_TAG], revalidate: 60 });

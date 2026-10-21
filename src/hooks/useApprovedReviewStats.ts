'use client';

import { useEffect, useState } from 'react';
import type { ReviewStats } from '@/lib/review-stats';

let pending: Promise<Record<string, ReviewStats>> | null = null;
let cached: { at: number; stats: Record<string, ReviewStats> } | null = null;

// One small, public aggregate request is shared by every visible product card.
// Imported product.rating/reviews are never treated as customer-review proof.
export function useApprovedReviewStats(productId: number) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  useEffect(() => {
    let active = true;
    setStats(null);
    if (!pending) {
      pending = cached && Date.now() - cached.at < 60_000
        ? Promise.resolve(cached.stats)
        : fetch('/api/reviews?summary=true').then(async response => {
          const data = await response.json();
          if (!response.ok || !data.success || !data.stats) throw new Error('Review summary unavailable');
          cached = { at: Date.now(), stats: data.stats };
          return data.stats as Record<string, ReviewStats>;
        });
      pending.finally(() => { pending = null; }).catch(() => {});
    }
    pending.then(all => { if (active) setStats(all[productId] || { rating: 0, reviews: 0 }); })
      .catch(() => { if (active) setStats(null); });
    return () => { active = false; };
  }, [productId]);
  return stats;
}

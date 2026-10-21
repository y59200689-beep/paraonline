export type ReviewStats = { rating: number; reviews: number };

export function approvedReviewStats(rows: Array<{ product_id: unknown; rating: unknown }>): Record<string, ReviewStats> {
  const totals: Record<string, { sum: number; count: number }> = {};
  for (const row of rows) {
    const id = Number(row.product_id);
    const rating = Number(row.rating);
    if (!Number.isSafeInteger(id) || id < 1 || !Number.isFinite(rating) || rating < 1 || rating > 5) continue;
    const entry = totals[id] ||= { sum: 0, count: 0 };
    entry.sum += rating;
    entry.count++;
  }
  return Object.fromEntries(Object.entries(totals).map(([id, entry]) => [id, {
    rating: Math.round(entry.sum / entry.count * 10) / 10,
    reviews: entry.count,
  }]));
}

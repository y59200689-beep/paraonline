import type { Product } from './data';

/** Rank only products with published customer reviews, never imported catalogue scores. */
export function selectReviewedProducts(products: Product[], reviews: Array<{ productId: number; rating: number }>, selectedIds?: number[]) {
  const totals = new Map<number, { sum: number; count: number }>();
  for (const review of reviews) {
    if (!Number.isFinite(review.rating) || review.rating < 1 || review.rating > 5) continue;
    const total = totals.get(review.productId) || { sum: 0, count: 0 };
    total.sum += review.rating;
    total.count++;
    totals.set(review.productId, total);
  }
  return [...new Map(products.map(product => [product.id, product])).values()]
    .filter(product => totals.has(product.id) && (!selectedIds?.length || selectedIds.includes(product.id)))
    .map(product => {
      const total = totals.get(product.id)!;
      return { ...product, rating: total.sum / total.count, reviews: total.count };
    })
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, 7);
}

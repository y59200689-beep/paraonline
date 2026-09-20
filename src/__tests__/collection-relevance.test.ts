import { describe, expect, it } from 'vitest';
import { catalogCategoryFilter, matchesCatalogCategory, matchesCatalogCategoryPhrase } from '@/lib/catalog-categories';
import { selectReviewedProducts } from '@/lib/reviewed-products';
import type { Product } from '@/lib/data';

describe('concern collection relevance', () => {
  it('does not confuse visage with anti-age or allow blank categories', () => {
    for (const category of ['visage', '', 'Matériel médical']) {
      expect(matchesCatalogCategory({ category, categories: [category] }, 'anti age')).toBe(false);
      expect(matchesCatalogCategoryPhrase({ category, categories: [category] }, 'anti age')).toBe(false);
    }
    expect(catalogCategoryFilter('anti age')).not.toContain('category.ilike.%age%');
  });
  it('recognizes accented, hyphenated and wrinkle categories', () => {
    for (const category of ['Anti-Âge', 'Anti âge', 'Anti-rides', 'Rides']) {
      expect(matchesCatalogCategoryPhrase({ category, categories: [category] }, 'anti age')).toBe(true);
    }
  });
  it('keeps other concerns separate', () => {
    expect(matchesCatalogCategoryPhrase({ category: 'Anti taches' }, 'acne')).toBe(false);
    expect(matchesCatalogCategoryPhrase({ category: 'Acné' }, 'acne')).toBe(true);
    expect(matchesCatalogCategoryPhrase({ category: 'Protection solaire' }, 'solaire')).toBe(true);
    expect(matchesCatalogCategoryPhrase({ category: 'Anti-rougeurs' }, 'anti rougeur')).toBe(true);
  });
});

describe('published-review ranking', () => {
  const products = [1, 2, 3].map(id => ({ id, rating: 5, reviews: 99 } as Product));
  it('ignores imported scores and computes genuine averages', () => {
    const result = selectReviewedProducts(products, [{ productId: 1, rating: 3 }, { productId: 1, rating: 5 }, { productId: 2, rating: 5 }]);
    expect(result.map(p => p.id)).toEqual([2, 1]);
    expect(result[1]).toMatchObject({ rating: 4, reviews: 2 });
  });
  it('never lets curation or invalid ratings create a review claim', () => {
    expect(selectReviewedProducts(products, [], [1, 2])).toEqual([]);
    expect(selectReviewedProducts(products, [{ productId: 1, rating: 6 }, { productId: 2, rating: NaN }])).toEqual([]);
  });
});

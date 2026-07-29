import type { Product } from '@/lib/data';

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

/**
 * The storefront has one solar category. Source data may call it "solaire",
 * "protection solaire", or "solaire & protection", but all map to `solaire`.
 */
export function normalizeCatalogCategoryId(value: string) {
  const normalized = normalize(value);
  return normalized.includes('solaire') ? 'solaire' : normalized;
}

export function matchesCatalogCategory(product: Pick<Product, 'category' | 'categories'>, categoryId: string) {
  const categories = product.categories?.length ? product.categories : [product.category];
  const target = normalizeCatalogCategoryId(categoryId);

  return categories.some(category => normalizeCatalogCategoryId(String(category || '')) === target);
}

export function matchesCatalogCategoryPhrase(product: Pick<Product, 'category' | 'categories'>, phrase: string) {
  const categories = product.categories?.length ? product.categories : [product.category];
  const target = normalize(phrase);

  return categories.some(category => normalize(String(category || '')).includes(target));
}

export function catalogCategoryFilter(categoryId: string) {
  const category = normalizeCatalogCategoryId(categoryId);

  if (category === 'solaire') {
    return 'category.ilike.%solaire%,categories.cs.{"solaire"},categories.cs.{"protection solaire"},categories.cs.{"solaire & protection"}';
  }

  return `category.eq.${category},categories.cs.{"${category}"}`;
}

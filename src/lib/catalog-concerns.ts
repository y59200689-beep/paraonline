import type { Product } from '@/lib/data';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { matchesCatalogCategoryPhrase } from '@/lib/catalog-categories';

export type CatalogConcern = {
  id: string;
  keywords?: string[];
  ingredientKeywords?: string[];
  productIds?: number[];
};

const DEFAULT_CONCERNS: CatalogConcern[] = [
  { id: 'acne' },
  { id: 'spots' },
  { id: 'dryness' },
  { id: 'wrinkles' },
  { id: 'redness' },
];

// These shopper-facing concerns are intentionally category-backed. A product
// belongs to each only when the matching category is assigned in the catalogue.
const CATEGORY_BACKED_CONCERNS: Record<string, string> = {
  acne: 'acne',
  spots: 'anti tache',
  wrinkles: 'anti rides',
  redness: 'anti rougeur',
  suncare: 'solaire',
};

export function matchesCatalogConcern(product: Product, concernId: string, concerns: CatalogConcern[] = []) {
  const text = `${product.title} ${product.nameFr || ''} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase();
  const ingredients = (product.ingredients || '').toLowerCase();

  const categoryPhrase = CATEGORY_BACKED_CONCERNS[concernId];
  if (categoryPhrase) return matchesCatalogCategoryPhrase(product, categoryPhrase);

  const concern = concerns.find(item => item.id === concernId);
  if (concern) {
    if ((concern.productIds || []).includes(product.id)) return true;
    return (concern.keywords || []).some(keyword => text.includes(keyword.toLowerCase()))
      || (concern.ingredientKeywords || []).some(keyword => ingredients.includes(keyword.toLowerCase()) || text.includes(keyword.toLowerCase()));
  }

  if (concernId === 'dryness') return text.includes('déshydrat') || text.includes('sec') || text.includes('hydrat') || ingredients.includes('hyaluronic') || [5, 6, 7, 17].includes(product.id);
  return false;
}

export async function getCatalogConcerns(): Promise<CatalogConcern[]> {
  const { data } = await supabase.from('settings').select('value').eq('id', 1).single();
  const concerns = data?.value?.customConcerns;
  return Array.isArray(concerns) && concerns.length > 0 ? concerns : DEFAULT_CONCERNS;
}

export function countCatalogConcerns(products: Product[], concerns: CatalogConcern[]) {
  return Object.fromEntries(concerns.map(concern => [
    concern.id,
    products.reduce((count, product) => count + (matchesCatalogConcern(product, concern.id, concerns) ? 1 : 0), 0),
  ]));
}

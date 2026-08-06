import type { Product } from '@/lib/data';

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[-_]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const CATEGORY_FILTER_VARIANTS: Record<string, string[]> = {
  acne: ['acne', 'acné'],
  'anti tache': ['anti tache', 'anti-tache', 'tache', 'taches'],
  'anti age': ['anti age', 'anti-age', 'age', 'ride', 'rides'],
  'secheresse & hydratation': ['secheresse & hydratation', 'sécheresse & hydratation', 'secheresse', 'hydratation'],
  'anti rougeur': ['anti rougeur', 'anti-rougeur', 'rougeur', 'rougeurs'],
  ortopedique: ['ortopedique', 'orthopedique', 'ortopedie', 'orthopedie'],
  orthopedique: ['ortopedique', 'orthopedique', 'ortopedie', 'orthopedie'],
  ortopedie: ['ortopedique', 'orthopedique', 'ortopedie', 'orthopedie'],
  orthopedie: ['ortopedique', 'orthopedique', 'ortopedie', 'orthopedie'],
  corps: ['corps', 'corp'],
  corp: ['corps', 'corp'],
  bebe: ['bebe', 'bébé', 'baby', 'pediatrique', 'pédiatrique'],
  bébé: ['bebe', 'bébé', 'baby', 'pediatrique', 'pédiatrique'],
  appareils: ['appareils', 'appareil', 'accessories', 'accessoire', 'accessoires'],
  accessories: ['appareils', 'appareil', 'accessories', 'accessoire', 'accessoires'],
  complements: ['complements', 'complement', 'complément', 'compléments'],
  complement: ['complements', 'complement', 'complément', 'compléments'],
  dentaire: ['dentaire', 'dental'],
  dental: ['dentaire', 'dental'],
  visage: ['visage', 'face', 'peau'],
  cheveux: ['cheveux', 'cheveu', 'hair', 'capillaire'],
  maquillage: ['maquillage', 'makeup'],
  solaire: ['solaire', 'protection solaire', 'solaire & protection', 'sun'],
  pack: ['pack', 'packs', 'coffret', 'coffrets', 'giftbox'],
  serum: ['serum', 'sérum'],
};

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
  const synonyms = CATEGORY_FILTER_VARIANTS[target] || [target];
  const allTargets = Array.from(new Set([target, categoryId.trim().toLowerCase(), ...synonyms]));

  return categories.some(category => {
    const norm = normalizeCatalogCategoryId(String(category || ''));
    return allTargets.some(v => norm.includes(v) || v.includes(norm));
  });
}

export function matchesCatalogCategoryPhrase(product: Pick<Product, 'category' | 'categories'>, phrase: string) {
  const categories = product.categories?.length ? product.categories : [product.category];
  const target = normalize(phrase);

  return categories.some(category => normalize(String(category || '')).includes(target));
}

export function catalogCategoryFilter(categoryId: string) {
  const rawClean = categoryId.trim();
  const normalized = normalizeCatalogCategoryId(categoryId);

  if (normalized === 'solaire') {
    return 'category.ilike.%solaire%,categories.cs.{"solaire"},categories.cs.{"protection solaire"},categories.cs.{"solaire & protection"}';
  }

  const synonyms = CATEGORY_FILTER_VARIANTS[normalized] || CATEGORY_FILTER_VARIANTS[rawClean.toLowerCase()] || [normalized];
  const allVariants = Array.from(new Set([rawClean, normalized, rawClean.toLowerCase(), ...synonyms])).filter(Boolean);

  return allVariants
    .flatMap((variant) => {
      const lower = variant.toLowerCase();
      const upper = variant.toUpperCase();
      const title = lower.charAt(0).toUpperCase() + lower.slice(1);
      return [
        `category.ilike.%${lower}%`,
        `categories.cs.{"${lower}"}`,
        `categories.cs.{"${upper}"}`,
        `categories.cs.{"${title}"}`,
        `categories.cs.{"${variant}"}`
      ];
    })
    .join(',');
}

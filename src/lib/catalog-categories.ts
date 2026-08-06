import type { Product } from '@/lib/data';

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[-_]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

export const CANONICAL_CATEGORY_MAP: Record<string, string> = {
  ortopedique: 'orthopedique',
  orthopedique: 'orthopedique',
  ortopedie: 'orthopedique',
  orthopedie: 'orthopedique',
  dental: 'dentaire',
  dentaire: 'dentaire',
  corp: 'corps',
  corps: 'corps',
  accessories: 'appareils',
  accessoire: 'appareils',
  accessoires: 'appareils',
  appareil: 'appareils',
  appareils: 'appareils',
  complement: 'complements',
  complément: 'complements',
  compléments: 'complements',
  complements: 'complements',
  baby: 'bebe',
  bébé: 'bebe',
  bebe: 'bebe',
  'protection solaire': 'solaire',
  'solaire & protection': 'solaire',
  sun: 'solaire',
  solaire: 'solaire',
  makeup: 'maquillage',
  maquillage: 'maquillage',
  face: 'visage',
  visage: 'visage',
  hair: 'cheveux',
  cheveu: 'cheveux',
  capillaire: 'cheveux',
  cheveux: 'cheveux',
  pack: 'offers',
  packs: 'offers',
  coffret: 'offers',
  coffrets: 'offers',
  giftbox: 'offers',
};

const CATEGORY_FILTER_VARIANTS: Record<string, string[]> = {
  acne: ['acne', 'acné'],
  'anti tache': ['anti tache', 'anti-tache', 'tache', 'taches'],
  'anti age': ['anti age', 'anti-age', 'age', 'ride', 'rides'],
  'secheresse & hydratation': ['secheresse & hydratation', 'sécheresse & hydratation', 'secheresse', 'hydratation'],
  'anti rougeur': ['anti rougeur', 'anti-rougeur', 'rougeur', 'rougeurs'],
  orthopedique: ['ortopedique', 'orthopedique', 'ortopedie', 'orthopedie'],
  ortopedique: ['ortopedique', 'orthopedique', 'ortopedie', 'orthopedie'],
  corps: ['corps', 'corp'],
  bebe: ['bebe', 'bébé', 'baby', 'pediatrique', 'pédiatrique'],
  appareils: ['appareils', 'appareil', 'accessories', 'accessoire', 'accessoires'],
  complements: ['complements', 'complement', 'complément', 'compléments'],
  dentaire: ['dentaire', 'dental'],
  visage: ['visage', 'face', 'peau'],
  cheveux: ['cheveux', 'cheveu', 'hair', 'capillaire'],
  maquillage: ['maquillage', 'makeup'],
  solaire: ['solaire', 'protection solaire', 'solaire & protection', 'sun'],
  offers: ['offers', 'pack', 'packs', 'coffret', 'coffrets', 'giftbox'],
  serum: ['serum', 'sérum'],
};

export function getCanonicalCategory(category: string | null | undefined): string {
  if (!category || typeof category !== 'string') return 'visage';
  const clean = category.trim().toLowerCase();
  const normalized = normalize(clean);

  if (CANONICAL_CATEGORY_MAP[clean]) return CANONICAL_CATEGORY_MAP[clean];
  if (CANONICAL_CATEGORY_MAP[normalized]) return CANONICAL_CATEGORY_MAP[normalized];
  if (normalized.includes('orthop') || normalized.includes('ortop')) return 'orthopedique';
  if (normalized.includes('dent')) return 'dentaire';
  if (normalized.includes('solaire') || normalized.includes('sun')) return 'solaire';
  if (normalized.includes('cheve') || normalized.includes('capill')) return 'cheveux';
  if (normalized.includes('compl')) return 'complements';
  if (normalized.includes('apparel') || normalized.includes('access')) return 'appareils';
  if (normalized.includes('bebe') || normalized.includes('pedia')) return 'bebe';

  return clean;
}

export function normalizeCatalogCategoryId(value: string) {
  const canonical = getCanonicalCategory(value);
  const normalized = normalize(value);
  return canonical !== normalized && canonical ? canonical : normalized;
}

export function matchesCatalogCategory(product: Pick<Product, 'category' | 'categories'>, categoryId: string) {
  const categories = product.categories?.length ? product.categories : [product.category];
  const canonicalTarget = getCanonicalCategory(categoryId);
  const target = normalizeCatalogCategoryId(categoryId);
  const synonyms = CATEGORY_FILTER_VARIANTS[canonicalTarget] || CATEGORY_FILTER_VARIANTS[target] || [target];
  const allTargets = Array.from(new Set([canonicalTarget, target, categoryId.trim().toLowerCase(), ...synonyms]));

  return categories.some(category => {
    const norm = normalizeCatalogCategoryId(String(category || ''));
    const canon = getCanonicalCategory(String(category || ''));
    return allTargets.some(v => norm.includes(v) || v.includes(norm) || canon === v);
  });
}

export function matchesCatalogCategoryPhrase(product: Pick<Product, 'category' | 'categories'>, phrase: string) {
  const categories = product.categories?.length ? product.categories : [product.category];
  const target = normalize(phrase);

  return categories.some(category => normalize(String(category || '')).includes(target));
}

export function catalogCategoryFilter(categoryId: string) {
  const rawClean = categoryId.trim();
  const canonical = getCanonicalCategory(categoryId);
  const normalized = normalizeCatalogCategoryId(categoryId);

  if (canonical === 'solaire' || normalized === 'solaire') {
    return 'category.ilike.%solaire%,categories.cs.{"solaire"},categories.cs.{"protection solaire"},categories.cs.{"solaire & protection"}';
  }

  const synonyms = CATEGORY_FILTER_VARIANTS[canonical] || CATEGORY_FILTER_VARIANTS[normalized] || CATEGORY_FILTER_VARIANTS[rawClean.toLowerCase()] || [canonical];
  const allVariants = Array.from(new Set([rawClean, canonical, normalized, rawClean.toLowerCase(), ...synonyms])).filter(Boolean);

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

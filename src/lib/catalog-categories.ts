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
  orthepedique: 'orthopedique',
  ortopedie: 'orthopedique',
  orthopedie: 'orthopedique',
  orthopedia: 'orthopedique',
  ortopedia: 'orthopedique',

  dental: 'dentaire',
  dentaire: 'dentaire',
  dentisterie: 'dentaire',
  dents: 'dentaire',
  dent: 'dentaire',

  corp: 'corps',
  corps: 'corps',
  body: 'corps',

  accessories: 'appareils',
  accessoire: 'appareils',
  accessoires: 'appareils',
  appareil: 'appareils',
  appareils: 'appareils',
  materiel: 'appareils',
  matériel: 'appareils',

  complement: 'complements',
  complément: 'complements',
  compléments: 'complements',
  complements: 'complements',
  supplement: 'complements',
  supplements: 'complements',

  baby: 'bebe',
  bébé: 'bebe',
  bebe: 'bebe',
  pediatrique: 'bebe',
  pédiatrique: 'bebe',

  'protection solaire': 'solaire',
  'solaire & protection': 'solaire',
  sun: 'solaire',
  solaire: 'solaire',
  bronzage: 'solaire',

  makeup: 'maquillage',
  'make-up': 'maquillage',
  'make up': 'maquillage',
  maquillage: 'maquillage',

  face: 'visage',
  visage: 'visage',
  peau: 'visage',

  hair: 'cheveux',
  cheveu: 'cheveux',
  capillaire: 'cheveux',
  capillaires: 'cheveux',
  cheveux: 'cheveux',

  pack: 'offers',
  packs: 'offers',
  coffret: 'offers',
  coffrets: 'offers',
  giftbox: 'offers',
  offer: 'offers',
  offers: 'offers',
  promo: 'offers',
  promotions: 'offers',

  homme: 'homme',
  hommes: 'homme',
  men: 'homme',
  man: 'homme',

  secheresse: 'secheresse',
  sécheresse: 'secheresse',
  dryness: 'secheresse',

  serum: 'serum',
  sérum: 'serum',

  patch: 'patch',
  patches: 'patch',
};

const CATEGORY_FILTER_VARIANTS: Record<string, string[]> = {
  acne: ['acne', 'acné'],
  'anti tache': ['anti tache', 'anti-tache', 'tache', 'taches'],
  'anti age': ['anti age', 'anti-age', 'age', 'ride', 'rides'],
  'secheresse & hydratation': ['secheresse & hydratation', 'sécheresse & hydratation', 'secheresse', 'hydratation'],
  'anti rougeur': ['anti rougeur', 'anti-rougeur', 'rougeur', 'rougeurs'],
  orthopedique: ['orthopedique', 'ortopedique', 'orthepedique', 'ortopedie', 'orthopedie', 'orthopedia', 'ortopedia'],
  ortopedique: ['orthopedique', 'ortopedique', 'orthepedique', 'ortopedie', 'orthopedie', 'orthopedia', 'ortopedia'],
  orthepedique: ['orthopedique', 'ortopedique', 'orthepedique', 'ortopedie', 'orthopedie', 'orthopedia', 'ortopedia'],
  corps: ['corps', 'corp', 'body'],
  bebe: ['bebe', 'bébé', 'baby', 'pediatrique', 'pédiatrique'],
  appareils: ['appareils', 'appareil', 'accessories', 'accessoire', 'accessoires', 'materiel'],
  complements: ['complements', 'complement', 'complément', 'compléments', 'supplement'],
  dentaire: ['dentaire', 'dental', 'dentisterie', 'dents', 'dent'],
  visage: ['visage', 'face', 'peau'],
  cheveux: ['cheveux', 'cheveu', 'hair', 'capillaire', 'capillaires'],
  maquillage: ['maquillage', 'makeup', 'make-up', 'make up'],
  solaire: ['solaire', 'protection solaire', 'solaire & protection', 'sun', 'bronzage'],
  offers: ['offers', 'offer', 'pack', 'packs', 'coffret', 'coffrets', 'giftbox', 'promo', 'promotions'],
  homme: ['homme', 'hommes', 'men', 'man'],
  secheresse: ['secheresse', 'sécheresse', 'dryness'],
  serum: ['serum', 'sérum'],
  patch: ['patch', 'patches'],
};

export function getCanonicalCategory(category: string | null | undefined): string {
  if (!category || typeof category !== 'string') return 'visage';
  const clean = category.trim().toLowerCase();
  const normalized = normalize(clean);

  if (CANONICAL_CATEGORY_MAP[clean]) return CANONICAL_CATEGORY_MAP[clean];
  if (CANONICAL_CATEGORY_MAP[normalized]) return CANONICAL_CATEGORY_MAP[normalized];

  if (/orth|ort|eped|epedique|opedic|orthe/i.test(normalized)) return 'orthopedique';
  if (/dent/i.test(normalized)) return 'dentaire';
  if (/solair|sun|bronz/i.test(normalized)) return 'solaire';
  if (/chev|capill|hair/i.test(normalized)) return 'cheveux';
  if (/compl|suppl/i.test(normalized)) return 'complements';
  if (/appar|access|materiel|matériel/i.test(normalized)) return 'appareils';
  if (/bebe|bÉbÉ|pedia|baby/i.test(normalized)) return 'bebe';
  if (/maquill|makeup|make-up/i.test(normalized)) return 'maquillage';
  if (/pack|coffret|gift|offer|promo/i.test(normalized)) return 'offers';
  if (/homm|men/i.test(normalized)) return 'homme';
  if (/corp|body/i.test(normalized)) return 'corps';
  if (/visag|face|peau/i.test(normalized)) return 'visage';
  if (/serum|sérum/i.test(normalized)) return 'serum';
  if (/patch/i.test(normalized)) return 'patch';

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

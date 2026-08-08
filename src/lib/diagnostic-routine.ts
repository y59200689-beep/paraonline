import type { Product } from '@/lib/data';
import type { RoutineRole, SuitableConcern, SuitableSkinType } from '@/lib/product-recommendation-metadata';

export type DiagnosticAnswerField =
  | 'skinType'
  | 'concern'
  | 'sensitivity'
  | 'breakoutFrequency'
  | 'sunExposure'
  | 'spfHabit'
  | 'activeTolerance'
  | 'routineDepth';

export type DiagnosticAnswers = Record<DiagnosticAnswerField, string>;

export type RoutineStep = 'cleanser' | 'toner' | 'treatment' | 'moisturizer' | 'sunscreen';

export type RoutineRecommendation = {
  step: RoutineStep;
  product: Product;
  score: number;
};

export const ROUTINE_STEP_LABELS: Record<RoutineStep, { fr: string; ar: string }> = {
  cleanser: { fr: 'Nettoyer', ar: 'التنظيف' },
  toner: { fr: 'Préparer', ar: 'التحضير' },
  treatment: { fr: 'Traiter', ar: 'العلاج' },
  moisturizer: { fr: 'Hydrater', ar: 'الترطيب' },
  sunscreen: { fr: 'Protéger', ar: 'الحماية' },
};

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&(?:amp|nbsp);/g, ' ')
  .replace(/[^a-z0-9+]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function productText(product: Product) {
  return normalize([
    product.title,
    product.name,
    product.nameFr,
    product.category,
    ...(product.categories || []),
    ...(product.tags || []),
    product.description,
    product.ingredients,
    product.usage,
  ].filter(Boolean).join(' '));
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function countMatches(text: string, terms: string[]) {
  return terms.reduce((score, term) => score + Number(text.includes(term)), 0);
}

const EXCLUDED_CATEGORIES = [
  'bebe', 'cheveux', 'complement', 'corp', 'dentaire', 'orthopedique',
  'veterinaire', 'materiel medical',
];

const EXCLUDED_PRODUCT_TERMS = [
  // Body & hair
  'corps', 'body lotion', 'body cream', 'body butter', 'cheveux', 'shampoo', 'shampoing', 'apres shampoing',
  // Oral / dental
  'dent ', 'dentaire', 'dentifrice', 'bain de bouche', 'spray buccal', 'gencive', 'tartre',
  // Medications / supplements
  'gelule', 'gélule', 'capsule', 'comprime', 'sirop', 'cachet', 'ampoule buvable',
  // Extremities
  'creme main', 'creme mains', 'soin mains', 'hand cream', 'creme pied', 'soin pieds', 'foot cream',
  // Medical devices & orthopaedics
  'anneau ', 'claviculaire', 'attelle', 'minerve', 'manchon', 'semelle', 'genouillere',
  'chaussette de compression', 'contention', 'bandage', 'gilet', 'cervical',
  // Intimate / baby
  'intime', 'mamelon', 'sac a langer', 'abc derm', 'dermifant',
  // Deodorant / anti-perspirant
  'deodorant', 'anti transpirant', 'antitranspirant', 'deo bille', 'deo stick',
  // Baby / kids / massage
  'enfant', 'kids ', 'junior ', 'massage',
  // Bundles & packs
  'coffret', 'trousse', 'pack ',
];

export function isDiagnosticEligibleProduct(product: Product) {
  if (product.status === 'draft' || (product.stock !== undefined && product.stock <= 0)) return false;
  const category = normalize(product.category || '');
  const text = productText(product);
  if (EXCLUDED_CATEGORIES.some((excluded) => category.includes(excluded))) return false;
  return !includesAny(text, EXCLUDED_PRODUCT_TERMS.map(normalize));
}

function routineStepScores(product: Product): Record<RoutineStep, number> {
  if (product.routineRoles?.length) {
    const roleToStep: Partial<Record<RoutineRole, RoutineStep>> = {
      cleanser: 'cleanser',
      makeup_remover: 'cleanser',
      toner: 'toner',
      essence: 'toner',
      exfoliant: 'treatment',
      treatment: 'treatment',
      spot_treatment: 'treatment',
      eye_care: 'treatment',
      moisturizer: 'moisturizer',
      face_oil: 'moisturizer',
      mask: 'moisturizer',
      sunscreen: 'sunscreen',
      after_sun: 'moisturizer',
    };
    const scores: Record<RoutineStep, number> = { cleanser: 0, toner: 0, treatment: 0, moisturizer: 0, sunscreen: 0 };
    product.routineRoles.forEach(role => {
      const step = roleToStep[role];
      if (step) scores[step] = Math.max(scores[step], role === 'sunscreen' ? 25 : 20);
    });
    return scores;
  }
  const text = productText(product);
  const category = normalize(product.category || '');

  const sunscreen =
    (category.includes('solaire') ? 12 : 0)
    + countMatches(text, ['spf', 'solaire', 'ecran solaire', 'sun protection', 'sunscreen', 'uvmune', 'photoprotection']) * 5;
  const cleanser = countMatches(text, [
    'nettoy', 'cleanser', 'cleansing', 'moussant', 'mousse nettoy', 'micell',
    'demaquill', 'face wash', 'huile lavante', 'creme lavante', 'gelee purifiante',
    'gel nettoyant', 'gel lavant', 'lait nettoyant', 'eau nettoyante', 'nettoyant doux',
  ]) * 5;
  // Toner: must NOT be a sunscreen spray – exclude SPF-containing products from toner slot
  const tonerRaw = countMatches(text, ['toner', 'tonique', 'essence', 'lotion preparatrice', 'eau micellaire']) * 4
    + (text.includes('lotion') && !text.includes('spf') && !text.includes('solaire') ? 2 : 0);
  const toner = sunscreen >= 10 ? 0 : tonerRaw; // hard-block SPF products from toner slot
  const treatment =
    countMatches(text, [
      'serum', 'ampoule', 'concentre', 'traitement', 'correcteur', 'correctrice',
      'anti tache', 'depigment', 'anti acne', 'anti imperfection', 'anti ride', 'antiride',
      'retinol', 'retinal', 'peel', 'vitamine c', 'vitamin c', 'niacinamide', 'azelaic',
      'peptide', 'acide hyaluronique', 'filler', 'soin lissant', 'soin eclat',
    ]) * 4
    + (category.includes('acne') || category.includes('anti tache') || category.includes('anti age') ? 2 : 0)
    + countMatches(text, ['bouton', 'imperfection', 'eclat', 'rides', 'fermete', 'firmness']) * 2;
  const moisturizer =
    countMatches(text, [
      'hydrat', 'moistur', 'emollient', 'reparatrice', 'reparateur', 'barriere cutanee',
      'nourrissant', 'nourrissante', 'creme riche', 'baume', 'soothing cream',
      'gel hydratant', 'lait hydratant', 'soin hydratant', 'fluide hydratant',
    ]) * 5
    + countMatches(text, ['gel creme', 'creme visage', 'face cream', 'creme soin']) * 3
    + (text.includes('creme') || text.includes('cream') ? 1 : 0);

  return { cleanser, toner, treatment, moisturizer, sunscreen };
}

export function classifyRoutineStep(product: Product): RoutineStep | null {
  if (!isDiagnosticEligibleProduct(product)) return null;
  const scores = routineStepScores(product);
  const priority: RoutineStep[] = ['sunscreen', 'cleanser', 'toner', 'treatment', 'moisturizer'];
  const best = priority.reduce((winner, step) => scores[step] > scores[winner] ? step : winner, priority[0]);
  return scores[best] >= 3 ? best : null;
}

const CONCERN_TERMS: Record<string, string[]> = {
  acne: [
    'acne', 'acneique', 'imperfection', 'bouton', 'boutons', 'point noir', 'comedone', 'pore',
    'sebum', 'seborrhee', 'salicyl', 'acide salicylique', 'niacinamide', 'azelaic',
    'zinc', 'centella', 'anti acne', 'anti bouton', 'anti imperfection', 'purif', 'purifiant',
    'anti sebum', 'acniben', 'effaclar', 'acnilia', 'keracnyl', 'teen derm',
    'non comedogene', 'sebum control', 'mattifiant', 'matifiant',
  ],
  spots: [
    'tache', 'taches', 'anti tache', 'anti taches', 'depigment', 'depigmentant',
    'pigment', 'hyperpigment', 'eclat', 'luminosite', 'lumin', 'teint uniforme',
    'vitamin c', 'vitamine c', 'ascorb', 'tranexam', 'arbutin', 'kojic', 'niacinamide',
    'anti taches', 'correcteur taches', 'azlabright', 'clairial', 'melascreen',
    'pigmentclar', 'lumiactiv', 'unif', 'unifying', 'anti pigment', 'azelaic',
    'serum eclat', 'eclat immédiat', 'illuminat',
  ],
  wrinkles: [
    'ride', 'rides', 'anti ride', 'antiride', 'anti age', 'antiage', 'fermete',
    'liftant', 'lifting', 'lift', 'age lift', 'resurface', 'retinol', 'retinal',
    'peptide', 'collagen', 'collagene', 'hyaluron', 'acide hyaluronique',
    'jeunesse', 'jeunissant', 'rebondissant', 'raffermissant', 'ressourcant',
    'revitalisant', 'soin lissant', 'combleur', 'profond', 'densit',
    'merveillance', 'regenerat', 'renewal', 'regenerant',
  ],
  dryness: [
    'hydrat', 'seche', 'secheresse', 'dessecher', 'deshydrat', 'xero',
    'ceramide', 'hyaluron', 'glycerin', 'squalane', 'panthenol', 'uree',
    'nourri', 'nourrissant', 'nourrissante', 'emollient', 'baume', 'beurre',
    'barriere cutanee', 'barriere', 'reparateur', 'reparatrice', 'reconstruct',
    'creme riche', 'fluide hydratant', 'gel hydratant', 'intensif', 'aqua',
  ],
  redness: [
    'rougeur', 'rougeurs', 'rosace', 'rosacee', 'couperose', 'erythrose',
    'sensible', 'peau sensible', 'sensibilite', 'hypersensible', 'reactive',
    'cica', 'centella', 'madecassoside', 'panthenol', 'apaisant', 'apaisement',
    'apaisante', 'anti irritat', 'irritat', 'cicalfate', 'cicavit', 'cicaplast',
    'rosaliac', 'toleriane', 'tolederm', 'thermale', 'douceur',
  ],
};

// Strong signals that a product is specifically targeted at a given concern.
// When the user's concern differs, matching these terms causes a score penalty.
const CONCERN_ANTITERMS: Record<string, string[]> = {
  acne: [
    'acniben', 'acnilia', 'keracnyl', 'effaclar', 'acnewin', 'teen derm', 'neutrogena t gel',
    'anti bouton', 'anti acne', 'anti imperfection', 'purifiant pores', 'sebum control',
    'gel purifiant', 'soin purifiant', 'anti comedone', 'point noir',
  ],
  spots: [
    'azlabright', 'melascreen', 'pigmentclar', 'lumiactiv', 'depigment', 'depigmentant',
    'anti tache', 'anti taches', 'clairial', 'anti pigment', 'correcteur taches',
  ],
  wrinkles: [
    'anti ride', 'antiride', 'anti age', 'antiage', 'retinol', 'retinal', 'liftant',
    'age lift', 'merveillance', 'raffermissant', 'combleur rides', 'soin combleur',
  ],
  dryness: [
    'peau seche', 'tres seche', 'ultra seche', 'xerose', 'xeroderme',
    'baume nutritif', 'creme nourrissante', 'ultra riche', 'soin nutritif',
  ],
  redness: [
    'anti rougeur', 'rosacee', 'couperose', 'erythrose',
    'toleriane', 'rosaliac', 'tolederm', 'cicalfate', 'cicaplast', 'peau reactive',
  ],
};

const SKIN_TYPE_TERMS: Record<string, string[]> = {
  oily: ['matifiant', 'mattifiant', 'sebum', 'pore', 'oil control', 'purif', 'non comedogene', 'p grasses', 'peau grasse'],
  dry: ['hydrat', 'nourri', 'baume', 'ceramide', 'hyaluron', 'emollient', 'peau seche', 'seche', 'xero'],
  mixed: ['equilibr', 'niacinamide', 'matifiant', 'hydrat', 'mixte', 'peau mixte'],
  normal: ['daily', 'quotidien', 'doux', 'gentle', 'hydrat'],
};

const STRONG_ACTIVE_TERMS = ['retinol', 'retinal', 'peel', 'glycolic', 'aha ', 'bha ', 'forte concentration'];
const SOOTHING_TERMS = ['centella', 'cica', 'panthenol', 'madecassoside', 'ceramide', 'apais', 'barriere', 'doux', 'gentle'];

const ANSWER_SKIN_TYPE: Record<string, SuitableSkinType> = {
  oily: 'oily', dry: 'dry', mixed: 'combination', normal: 'normal',
};

const ANSWER_CONCERNS: Record<string, SuitableConcern[]> = {
  acne: ['acne', 'blackheads', 'excess_oil', 'enlarged_pores'],
  spots: ['dark_spots', 'dullness', 'uneven_tone'],
  wrinkles: ['wrinkles', 'loss_of_firmness', 'uneven_texture'],
  dryness: ['dryness', 'dehydration', 'barrier_damage'],
  redness: ['redness', 'sensitivity', 'barrier_damage'],
};

function isStructuredCompatibilitySafe(product: Product, answers: DiagnosticAnswers) {
  const skinType = ANSWER_SKIN_TYPE[answers.skinType];
  if (product.suitableSkinTypes?.length && skinType && !product.suitableSkinTypes.includes(skinType)) return false;
  if (product.sensitivityLevels?.length && !product.sensitivityLevels.includes(answers.sensitivity as 'low' | 'medium' | 'high')) return false;
  if (product.activeStrength === 'strong' && (answers.sensitivity === 'high' || answers.activeTolerance === 'beginner')) return false;
  if (product.activeStrength === 'moderate' && answers.sensitivity === 'high' && answers.activeTolerance === 'beginner') return false;
  return true;
}

function isTimeCompatible(product: Product, step: RoutineStep) {
  if (!product.timeOfDay?.length) return true;
  // A product explicitly marked evening-only must never fill the daytime SPF slot.
  return step !== 'sunscreen' || product.timeOfDay.includes('morning');
}

function productFitScore(product: Product, answers: DiagnosticAnswers, extraKeywords: string[]) {
  const text = productText(product);
  let score = 0;

  // Primary concern match — greatly boosted
  score += countMatches(text, CONCERN_TERMS[answers.concern] || []) * 9;
  // Cross-concern mismatch penalty — subtract if product strongly signals a different concern
  for (const [otherConcern, antiterms] of Object.entries(CONCERN_ANTITERMS)) {
    if (otherConcern === answers.concern) continue;
    const antiMatches = countMatches(text, (CONCERN_TERMS[otherConcern] || []));
    const antiSignal = countMatches(text, antiterms);
    if (antiSignal >= 2 || antiMatches >= 4) score -= 25; // heavy mismatch (e.g. acnewin acne cleanser for wrinkles user)
    else if (antiSignal >= 1 || antiMatches >= 2) score -= 12; // moderate mismatch (e.g. acnilia for spots user)
  }
  score += countMatches(text, SKIN_TYPE_TERMS[answers.skinType] || []) * 4;
  score += countMatches(text, extraKeywords.map(normalize)) * 3;

  const requestedConcerns = ANSWER_CONCERNS[answers.concern] || [];
  if (product.suitableConcerns?.length) {
    const concernMatches = product.suitableConcerns.filter(concern => requestedConcerns.includes(concern)).length;
    score += concernMatches * 18;
    if (requestedConcerns.length && concernMatches === 0) score -= 8;
  }
  const requestedSkinType = ANSWER_SKIN_TYPE[answers.skinType];
  if (requestedSkinType && product.suitableSkinTypes?.includes(requestedSkinType)) score += 10;
  if (product.sensitivityLevels?.includes(answers.sensitivity as 'low' | 'medium' | 'high')) score += 6;
  if (product.activeStrength === 'gentle' && (answers.sensitivity === 'high' || answers.activeTolerance === 'beginner')) score += 5;
  if (product.activeStrength === 'moderate' && answers.activeTolerance === 'intermediate') score += 3;
  if (product.activeStrength === 'strong' && answers.activeTolerance === 'advanced') score += 5;

  if (answers.breakoutFrequency === 'frequent') {
    score += countMatches(text, ['salicyl', 'niacinamide', 'azelaic', 'zinc', 'non comedogene']) * 3;
  }
  if (answers.sensitivity === 'high') {
    score += countMatches(text, SOOTHING_TERMS) * 4;
    score -= countMatches(text, STRONG_ACTIVE_TERMS) * 8;
  }
  if (answers.activeTolerance === 'beginner') {
    score -= countMatches(text, STRONG_ACTIVE_TERMS) * 5;
  } else if (answers.activeTolerance === 'advanced') {
    score += countMatches(text, ['retinol', 'retinal', 'peptide', 'vitamin c', 'vitamine c', 'acid']) * 2;
  }
  if (answers.spfHabit !== 'daily' || answers.sunExposure === 'intense') {
    score += countMatches(text, ['spf', 'solaire', 'ecran solaire', 'uv']) * 3;
  }

  score += Math.min(Math.max(product.rating || 0, 0), 5) * 0.35;
  score += Math.min(Math.log10((product.reviews || 0) + 1), 2);
  return score;
}

function routineStepsFor(answers: DiagnosticAnswers): RoutineStep[] {
  if (answers.routineDepth === 'complete') {
    return ['cleanser', 'toner', 'treatment', 'moisturizer', 'sunscreen'];
  }
  if (answers.routineDepth === 'balanced') {
    return ['cleanser', 'treatment', 'moisturizer', 'sunscreen'];
  }
  if (answers.concern === 'dryness' || answers.concern === 'redness') {
    return ['cleanser', 'moisturizer', 'sunscreen'];
  }
  return ['cleanser', 'treatment', 'sunscreen'];
}

type RoutineBuilderOptions = {
  configuredProductIds?: number[];
  extraKeywords?: string[];
  allowedBrands?: string[];
};

export function buildDiagnosticRoutine(
  products: Product[],
  answers: DiagnosticAnswers,
  options: RoutineBuilderOptions = {},
): RoutineRecommendation[] {
  let eligible = products.filter(isDiagnosticEligibleProduct);
  if (options.allowedBrands?.length) {
    const normalizedAllowed = options.allowedBrands.map(b => b.trim().toLowerCase());
    eligible = eligible.filter(p => {
      const v = (p.vendor || '').trim().toLowerCase();
      return normalizedAllowed.some(allowed => v === allowed || v.includes(allowed) || allowed.includes(v));
    });
  }
  const configuredIds = new Set(options.configuredProductIds || []);
  const selected: RoutineRecommendation[] = [];
  const usedIds = new Set<number>();
  const usedVendors = new Set<string>();

  for (const step of routineStepsFor(answers)) {
    const candidates = eligible
      .filter((product) => !usedIds.has(product.id)
        && isStructuredCompatibilitySafe(product, answers)
        && isTimeCompatible(product, step)
        // Prevent high-SPF sunscreen products from filling non-sunscreen steps
        && (step === 'sunscreen' || routineStepScores(product).sunscreen < 14)
        && routineStepScores(product)[step] >= 3)
      .map((product) => {
        const normalizedVendor = normalize(product.vendor || '');
        const roleConfidence = routineStepScores(product)[step];
        const configuredBoost = configuredIds.has(product.id) ? 10 : 0;
        const brandDiversityPenalty = normalizedVendor && usedVendors.has(normalizedVendor) ? 1.5 : 0;
        return {
          product,
          // roleConfidence * 1: step eligibility contributes, but does NOT dominate concern relevance
          score: productFitScore(product, answers, options.extraKeywords || [])
            + roleConfidence * 1
            + configuredBoost
            - brandDiversityPenalty,
        };
      })
      .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating || b.product.reviews - a.product.reviews || a.product.id - b.product.id);

    const winner = candidates[0];
    if (!winner) continue;
    selected.push({ step, product: winner.product, score: winner.score });
    usedIds.add(winner.product.id);
    if (winner.product.vendor) usedVendors.add(normalize(winner.product.vendor));
  }

  return selected;
}

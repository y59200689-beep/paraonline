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
];

const EXCLUDED_PRODUCT_TERMS = [
  'corps', 'body lotion', 'body cream', 'body butter', 'cheveux', 'shampoo', 'shampoing', 'apres shampoing',
  'dent ', 'dentaire', 'gelule', 'gélule', 'capsule', 'comprime', 'sirop',
  'creme main', 'creme mains', 'soin mains', 'hand cream', 'creme pied', 'soin pieds', 'foot cream',
  'intime', 'mamelon', 'massage',
  'pack ', 'coffret', 'trousse', 'sac a langer', 'abc derm', 'dermifant',
  'enfant', 'kids ', 'junior ',
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
  ]) * 5;
  const toner = countMatches(text, ['toner', 'tonique', 'essence', 'brume', 'mist', 'lotion preparatrice']) * 4
    + (text.includes('lotion') ? 2 : 0);
  const treatment =
    countMatches(text, [
      'serum', 'ampoule', 'concentre', 'traitement', 'correcteur', 'anti tache',
      'depigment', 'anti acne', 'anti imperfection', 'anti ride', 'retinol',
      'retinal', 'peel', 'vitamine c', 'vitamin c', 'niacinamide', 'azelaic',
    ]) * 4
    + (category.includes('acne') || category.includes('anti tache') ? 2 : 0)
    + countMatches(text, ['bouton', 'imperfection', 'eclat', 'rides', 'fermete']) * 2;
  const moisturizer =
    countMatches(text, [
      'hydrat', 'moistur', 'emollient', 'reparatrice', 'reparateur', 'barriere',
      'nourrissant', 'nourrissante', 'creme riche', 'baume', 'soothing cream',
    ]) * 5
    + countMatches(text, ['gel creme', 'creme visage', 'face cream']) * 3
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
  acne: ['acne', 'imperfection', 'bouton', 'pore', 'sebum', 'salicyl', 'niacinamide', 'azelaic', 'zinc', 'centella'],
  spots: ['tache', 'pigment', 'eclat', 'vitamin c', 'vitamine c', 'ascorb', 'tranexam', 'arbutin', 'kojic', 'niacinamide'],
  wrinkles: ['ride', 'anti age', 'fermete', 'retinol', 'retinal', 'peptide', 'collagen', 'hyaluron'],
  dryness: ['hydrat', 'secheresse', 'ceramide', 'hyaluron', 'glycerin', 'squalane', 'panthenol', 'uree', 'nourri'],
  redness: ['rougeur', 'sensible', 'apais', 'centella', 'cica', 'madecassoside', 'panthenol', 'ceramide', 'barriere'],
};

const SKIN_TYPE_TERMS: Record<string, string[]> = {
  oily: ['matifiant', 'sebum', 'pore', 'oil control', 'purif', 'non comedogene'],
  dry: ['hydrat', 'nourri', 'baume', 'ceramide', 'hyaluron', 'emollient'],
  mixed: ['equilibr', 'niacinamide', 'matifiant', 'hydrat'],
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

  score += countMatches(text, CONCERN_TERMS[answers.concern] || []) * 5;
  score += countMatches(text, SKIN_TYPE_TERMS[answers.skinType] || []) * 2;
  score += countMatches(text, extraKeywords.map(normalize)) * 3;

  const requestedConcerns = ANSWER_CONCERNS[answers.concern] || [];
  if (product.suitableConcerns?.length) {
    const concernMatches = product.suitableConcerns.filter(concern => requestedConcerns.includes(concern)).length;
    score += concernMatches * 14;
    if (requestedConcerns.length && concernMatches === 0) score -= 6;
  }
  const requestedSkinType = ANSWER_SKIN_TYPE[answers.skinType];
  if (requestedSkinType && product.suitableSkinTypes?.includes(requestedSkinType)) score += 8;
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
};

export function buildDiagnosticRoutine(
  products: Product[],
  answers: DiagnosticAnswers,
  options: RoutineBuilderOptions = {},
): RoutineRecommendation[] {
  const eligible = products.filter(isDiagnosticEligibleProduct);
  const configuredIds = new Set(options.configuredProductIds || []);
  const selected: RoutineRecommendation[] = [];
  const usedIds = new Set<number>();
  const usedVendors = new Set<string>();

  for (const step of routineStepsFor(answers)) {
    const candidates = eligible
      .filter((product) => !usedIds.has(product.id)
        && isStructuredCompatibilitySafe(product, answers)
        && isTimeCompatible(product, step)
        && routineStepScores(product)[step] >= 3)
      .map((product) => {
        const normalizedVendor = normalize(product.vendor || '');
        const roleConfidence = routineStepScores(product)[step];
        const configuredBoost = configuredIds.has(product.id) ? 10 : 0;
        const brandDiversityPenalty = normalizedVendor && usedVendors.has(normalizedVendor) ? 1.5 : 0;
        return {
          product,
          score: productFitScore(product, answers, options.extraKeywords || [])
            + roleConfidence * 3
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

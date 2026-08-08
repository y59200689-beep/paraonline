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

export type StepUsageInfo = {
  when: { fr: string; ar: string };
  tip: { fr: string; ar: string };
  icon: string;
};

export const ROUTINE_STEP_USAGE: Record<RoutineStep, StepUsageInfo> = {
  cleanser: {
    when: { fr: 'Matin & Soir', ar: 'صباحاً ومساءً' },
    tip: {
      fr: "Appliquer sur peau mouillée, masser en douceur 30 secondes, rincer à l'eau tiède.",
      ar: 'ضعيه على الوجه المبلل، دلّكي برفق 30 ثانية ثم اشطفي بالماء الدافئ.',
    },
    icon: '💧',
  },
  toner: {
    when: { fr: 'Matin & Soir', ar: 'صباحاً ومساءً' },
    tip: {
      fr: 'Après nettoyage, appliquer sur un coton ou dans le creux des mains, tapoter délicatement.',
      ar: 'بعد التنظيف، ضعيه بواسطة قطنة أو راحة اليد وانقريه برفق على البشرة.',
    },
    icon: '🌿',
  },
  treatment: {
    when: { fr: 'Soir (ou matin si non photosensibilisant)', ar: 'مساءً (أو صباحاً إذا لم يكن حساساً للضوء)' },
    tip: {
      fr: "Appliquer 2–3 gouttes ou une noisette sur peau propre et sèche. Laisser pénétrer 1 minute avant l'hydratant.",
      ar: 'ضعي 2–3 قطرات أو حبة بندق على البشرة النظيفة والجافة. انتظري دقيقة قبل المرطب.',
    },
    icon: '✨',
  },
  moisturizer: {
    when: { fr: 'Matin & Soir', ar: 'صباحاً ومساءً' },
    tip: {
      fr: "Appliquer sur peau légèrement humide, masser avec des mouvements ascendants jusqu'à absorption complète.",
      ar: 'ضعيه على بشرة رطبة قليلاً، دلّكي بحركات تصاعدية حتى الامتصاص الكامل.',
    },
    icon: '🧴',
  },
  sunscreen: {
    when: { fr: 'Chaque matin (dernier geste)', ar: 'كل صباح (آخر خطوة)' },
    tip: {
      fr: "Appliquer généreusement 15 min avant exposition. Renouveler toutes les 2 heures en cas d'exposition prolongée au soleil.",
      ar: 'ضعيه بكمية كافية قبل 15 دقيقة من التعرض للشمس. كرري التطبيق كل ساعتين عند التعرض المطوّل.',
    },
    icon: '☀️',
  },
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
  // Bulk chemical raw materials, industrial items & non-cosmetic products
  'condor', 'le condor', '1 kg', '250 ml', '500 ml', '1000 ml', 'litre',
  'alcool glycerine', 'acide borique', 'vaseline salicylee', 'solvant', 'matiere premiere',
  // Body itch/scratch sprays – not facial treatments
  'grattage', 'sos grattage', 'spray sos',
];

export function isDiagnosticEligibleProduct(product: Product) {
  if (product.status === 'draft' || (product.stock !== undefined && product.stock <= 0)) return false;
  const category = normalize(product.category || '');
  const text = productText(product);
  if (EXCLUDED_CATEGORIES.some((excluded) => category.includes(excluded))) return false;
  return !includesAny(text, EXCLUDED_PRODUCT_TERMS.map(normalize));
}

function productTitleText(product: Product) {
  return normalize([product.title, product.name, product.nameFr].filter(Boolean).join(' '));
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
  const titleText = productTitleText(product);
  const category = normalize(product.category || '');

  // TITLE-FIRST MATCHING: Terms in the product TITLE receive heavy priority
  const sunscreen =
    (category.includes('solaire') ? 12 : 0)
    + countMatches(titleText, ['spf', 'solaire', 'ecran', 'sunscreen', 'uvmune', 'photoprotection', 'uv ']) * 10
    + countMatches(text, ['spf', 'solaire', 'ecran solaire', 'sun protection', 'sunscreen', 'uvmune', 'photoprotection']) * 3;

  const cleanser =
    countMatches(titleText, [
      'nettoy', 'cleanser', 'cleansing', 'moussant', 'mousse', 'micell',
      'demaquill', 'face wash', 'huile lavante', 'creme lavante', 'gelee purifiante',
      'gel nettoyant', 'gel lavant', 'lait nettoyant', 'eau nettoyante', 'nettoyant',
    ]) * 10
    + countMatches(text, ['nettoy', 'cleanser', 'cleansing', 'moussant', 'micell', 'demaquill']) * 2;

  // Toner: must NOT be a sunscreen spray – exclude SPF-containing products from toner slot
  const tonerRaw = countMatches(titleText, ['toner', 'tonique', 'essence', 'lotion preparatrice', 'eau micellaire']) * 8
    + countMatches(text, ['toner', 'tonique', 'essence', 'lotion preparatrice']) * 2
    + (titleText.includes('lotion') && !titleText.includes('spf') && !titleText.includes('solaire') ? 4 : 0);
  const toner = sunscreen >= 10 ? 0 : tonerRaw;

  const treatment =
    countMatches(titleText, [
      'serum', 'ampoule', 'concentre', 'traitement', 'correcteur', 'correctrice',
      'anti tache', 'anti taches', 'depigment', 'anti acne', 'anti imperfection', 'anti ride', 'antiride',
      'retinol', 'retinal', 'peel', 'vitamine c', 'vitamin c', 'niacinamide', 'azelaic',
      'peptide', 'acide hyaluronique', 'filler', 'soin lissant', 'soin eclat', 'cica', 'cicalfate', 'cicaplast',
    ]) * 10
    + (category.includes('acne') || category.includes('anti tache') || category.includes('anti age') ? 4 : 0)
    + countMatches(text, ['serum', 'concentre', 'traitement', 'correcteur', 'rides', 'fermete']) * 2;

  const moisturizer =
    countMatches(titleText, [
      'hydrat', 'moistur', 'emollient', 'reparatrice', 'reparateur', 'barriere cutanee',
      'nourrissant', 'nourrissante', 'creme riche', 'baume', 'soothing cream',
      'gel hydratant', 'lait hydratant', 'soin hydratant', 'fluide hydratant', 'emulsion', 'creme',
    ]) * 8
    + countMatches(titleText, ['gel creme', 'creme visage', 'face cream', 'creme soin']) * 5
    + countMatches(text, ['hydrat', 'emollient', 'creme', 'baume', 'nourri']) * 2;

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
// When the user's concern differs, matching these terms causes a severe score penalty.
const CONCERN_ANTITERMS: Record<string, string[]> = {
  acne: [
    'acniben', 'acnilia', 'actipur', 'keracnyl', 'effaclar', 'acnewin', 'teen derm',
    'sebium', 'hyseac', 'zindaclin', 'dermo nettoyant', 'dermo-nettoyant', 'bactericide',
    'anti bouton', 'anti boutons', 'anti acne', 'anti imperfection', 'anti imperfections',
    'purifiant pores', 'sebum control', 'controle de la brillance', 'brillance et des boutons',
    'gel purifiant', 'soin purifiant', 'anti comedone', 'point noir', 'points noirs',
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

// Skin type mismatch penalties (e.g. oil-control / matifying products MUST NOT be given to dry skin)
const SKIN_TYPE_ANTITERMS: Record<string, string[]> = {
  dry: [
    'matifiant', 'mattifiant', 'controle de la brillance', 'brillance et des boutons',
    'anti brillance', 'p.grasses', 'peaux grasses', 'peau grasse', 'sebum control',
    'anti imperfection', 'anti boutons', 'desincrustant',
  ],
  normal: [
    'controle de la brillance', 'brillance et des boutons', 'p.grasses', 'peaux grasses',
  ],
  oily: [
    'ultra riche', 'creme riche', 'baume nutritif', 'beurre', 'peau tres seche',
  ],
};

const SKIN_TYPE_TERMS: Record<string, string[]> = {
  oily: ['matifiant', 'mattifiant', 'sebum', 'pore', 'oil control', 'purif', 'non comedogene', 'p grasses', 'peau grasse'],
  dry: ['hydrat', 'nourri', 'baume', 'ceramide', 'hyaluron', 'emollient', 'peau seche', 'seche', 'xero', 'confort'],
  mixed: ['equilibr', 'niacinamide', 'matifiant', 'hydrat', 'mixte', 'peau mixte'],
  normal: ['daily', 'quotidien', 'doux', 'gentle', 'hydrat', 'confort'],
};

const STRONG_ACTIVE_TERMS = ['retinol', 'retinal', 'peel', 'peeling', 'exfoliant', 'glycolic', 'aha ', 'bha ', 'forte concentration'];
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

/**
 * Returns true if this product has explicit, DB-stored AI Diagnostic metadata
 * (as opposed to inferred/enriched metadata). These products get a large priority bonus
 * because the store owner has manually verified their diagnostic suitability.
 */
function hasExplicitDiagnosticData(product: Product): boolean {
  return (
    Array.isArray(product.routineRoles) && product.routineRoles.length > 0 &&
    Array.isArray(product.suitableConcerns) && product.suitableConcerns.length > 0 &&
    Array.isArray(product.suitableSkinTypes) && product.suitableSkinTypes.length > 0
  );
}

function productFitScore(product: Product, answers: DiagnosticAnswers, extraKeywords: string[]) {
  const text = productText(product);
  const titleText = productTitleText(product);
  let score = 0;

  // AI DIAGNOSTIC METADATA PRIORITY: Products with explicit DB-tagged diagnostic data
  // are far more reliable than keyword-inferred ones. Give them a strong head-start.
  if (hasExplicitDiagnosticData(product)) {
    score += 35;
  }

  // TITLE-FIRST CONCERN BOOST: Heavy priority when the product TITLE explicitly names the concern
  const titleConcernMatches = countMatches(titleText, CONCERN_TERMS[answers.concern] || []);
  score += titleConcernMatches * 20;

  // Primary concern match in full product text
  score += countMatches(text, CONCERN_TERMS[answers.concern] || []) * 9;
  
  // Cross-concern mismatch penalty — subtract if product strongly signals a different concern
  for (const [otherConcern, antiterms] of Object.entries(CONCERN_ANTITERMS)) {
    if (otherConcern === answers.concern) continue;
    const antiMatches = countMatches(text, (CONCERN_TERMS[otherConcern] || []));
    const antiSignal = countMatches(text, antiterms);
    if (antiSignal >= 2 || antiMatches >= 4) score -= 35; // heavy mismatch
    else if (antiSignal >= 1 || antiMatches >= 2) score -= 20; // moderate mismatch
  }

  // Skin type mismatch penalty (e.g. oil-control products penalised for dry skin)
  const skinTypeAntiterms = SKIN_TYPE_ANTITERMS[answers.skinType] || [];
  const skinTypeAntiMatches = countMatches(text, skinTypeAntiterms);
  if (skinTypeAntiMatches >= 2) score -= 30;
  else if (skinTypeAntiMatches >= 1) score -= 15;

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
    score += countMatches(text, SOOTHING_TERMS) * 5;
    score -= countMatches(text, STRONG_ACTIVE_TERMS) * 12; // Harsh actives & exfoliants penalized for high sensitivity
  }
  if (answers.activeTolerance === 'beginner') {
    score -= countMatches(text, STRONG_ACTIVE_TERMS) * 8;
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

function isStrictlyEligibleForProfileAndStep(product: Product, answers: DiagnosticAnswers, step: RoutineStep): boolean {
  const titleAndCategory = normalize([product.title, product.name, product.nameFr, product.category].filter(Boolean).join(' '));
  const fullText = productText(product);

  // 1. HARD GATE: Non-acne profiles CANNOT receive explicit anti-acne line products
  const isAcneProfile = answers.concern === 'acne' || answers.breakoutFrequency === 'frequent';
  if (!isAcneProfile) {
    const acneLines = [
      'acniben', 'actipur', 'acnilia', 'keracnyl', 'effaclar', 'acnewin', 'teen derm',
      'sebium', 'hyseac', 'zindaclin', 'controle de la brillance', 'brillance et des boutons',
      'anti imperfection', 'anti-imperfections', 'anti bouton', 'anti-boutons',
    ];
    if (includesAny(titleAndCategory, acneLines)) return false;
  }

  // 2. HARD GATE: Dry skin CANNOT receive mattifying / anti-shine products
  if (answers.skinType === 'dry') {
    const dryAntiterms = [
      'matifiant', 'mattifiant', 'controle de la brillance', 'brillance et des boutons',
      'anti brillance', 'p.grasses', 'peaux grasses', 'peau grasse', 'sebum control',
    ];
    if (includesAny(titleAndCategory, dryAntiterms)) return false;
  }

  // 3. HARD GATE: High sensitivity CANNOT receive aggressive peels or scrubs
  if (answers.sensitivity === 'high') {
    const harshTerms = ['peel', 'peeling', 'scrub', 'exfoliant fort', 'acide glycolique fort'];
    if (includesAny(titleAndCategory, harshTerms)) return false;
  }

  // 3b. HARD GATE: Redness and dry skin concerns CANNOT receive peels/exfoliants in treatment slot
  if ((answers.concern === 'redness' || answers.skinType === 'dry') && step === 'treatment') {
    const peelTerms = ['peeling', 'peel', 'scrub', 'acide glycolique', 'glycolic acid', 'exfoliant', 'gommage'];
    if (includesAny(titleAndCategory, peelTerms)) return false;
  }

  // 4. HARD GATE: Step role purity
  if (step === 'sunscreen') {
    const isSunscreen = normalize(product.category || '').includes('solaire') || includesAny(fullText, ['spf', 'solaire', 'ecran solaire', 'sunscreen', 'uvmune', 'photoprotection']);
    if (!isSunscreen) return false;
  }

  if (step === 'cleanser') {
    const isCleanser = includesAny(fullText, [
      'nettoy', 'cleanser', 'cleansing', 'moussant', 'mousse nettoy', 'micell',
      'demaquill', 'face wash', 'huile lavante', 'creme lavante', 'gelee purifiante',
      'gel nettoyant', 'gel lavant', 'lait nettoyant', 'eau nettoyante', 'nettoyant',
    ]);
    if (!isCleanser) return false;
  }

  if (step === 'treatment') {
    // Exclude body sprays, itch sprays, eye contours and deodorant-style spray formats from face treatment slot
    const titleLower = productTitleText(product);
    const isBadTreatment = includesAny(titleLower, [
      'spray sos', 'sos grattage', 'grattage', 'spray corps', 'deodorant', 'deo spray',
      'spray buccal', 'spray nasal',
      'contour yeux', 'contour des yeux', 'eye contour', 'eye cream', 'contour eye',
      'creme yeux', 'soin yeux', 'regard', 'yeux fatigues',
    ]);
    if (isBadTreatment) return false;
    // Must have at least one proper facial treatment indicator in title or text
    const hasTreatmentIndicator = includesAny(titleLower, [
      'serum', 'ampoule', 'concentre', 'correcteur', 'filler', 'booster', 'eclat',
      'anti tache', 'anti ride', 'anti age', 'anti rougeur', 'cica', 'cicalfate', 'cicaplast',
      'sensibio', 'rosaliac', 'retinol', 'niacinamide', 'vitamine c', 'hyalur', 'peptide',
      'soin', 'traitement', 'solution', 'complexe',
    ]) || includesAny(fullText, ['serum', 'concentre', 'correcteur', 'traitement localise']);
    if (!hasTreatmentIndicator) return false;
  }

  return true;
}

import { enrichProductMetadata } from '@/lib/product-recommendation-metadata';

export function buildDiagnosticRoutine(
  rawProducts: Product[],
  answers: DiagnosticAnswers,
  options: RoutineBuilderOptions = {},
): RoutineRecommendation[] {
  const products = rawProducts.map((p) => {
    if (p.suitableSkinTypes?.length && p.suitableConcerns?.length && p.routineRoles?.length) return p;
    const enriched = enrichProductMetadata(p);
    return {
      ...p,
      routineRoles: enriched.routineRoles,
      suitableSkinTypes: enriched.suitableSkinTypes,
      suitableConcerns: enriched.suitableConcerns,
      sensitivityLevels: enriched.sensitivityLevels,
      activeStrength: enriched.activeStrength,
      timeOfDay: enriched.timeOfDay,
    } as Product;
  });

  const baseEligible = products.filter(isDiagnosticEligibleProduct);
  let brandEligible = baseEligible;
  if (options.allowedBrands?.length) {
    const normalizedAllowed = options.allowedBrands.map(b => b.trim().toLowerCase());
    brandEligible = baseEligible.filter(p => {
      const v = (p.vendor || '').trim().toLowerCase();
      return normalizedAllowed.some(allowed => v === allowed || v.includes(allowed) || allowed.includes(v));
    });
  }

  const configuredIds = new Set(options.configuredProductIds || []);
  const selected: RoutineRecommendation[] = [];
  const usedIds = new Set<number>();
  const usedVendors = new Set<string>();

  for (const step of routineStepsFor(answers)) {
    const filterCandidates = (sourcePool: Product[]) => sourcePool
      .filter((product) => !usedIds.has(product.id)
        && isStructuredCompatibilitySafe(product, answers)
        && isTimeCompatible(product, step)
        && isStrictlyEligibleForProfileAndStep(product, answers, step)
        && (step === 'sunscreen' || routineStepScores(product).sunscreen < 14)
        && routineStepScores(product)[step] >= 3)
      .map((product) => {
        const normalizedVendor = normalize(product.vendor || '');
        const roleConfidence = routineStepScores(product)[step];
        const configuredBoost = configuredIds.has(product.id) ? 10 : 0;
        const brandDiversityPenalty = normalizedVendor && usedVendors.has(normalizedVendor) ? 1.5 : 0;
        return {
          product,
          score: productFitScore(product, answers, options.extraKeywords || [])
            + roleConfidence * 1
            + configuredBoost
            - brandDiversityPenalty,
        };
      })
      .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating || b.product.reviews - a.product.reviews || a.product.id - b.product.id);

    let candidates = filterCandidates(brandEligible);

    // Fallback 1: If brand constraint yields 0 candidates, search full catalogue
    if (!candidates.length && brandEligible !== baseEligible) {
      candidates = filterCandidates(baseEligible);
    }

    // Fallback 2: If strict rules yield 0 candidates for step, relax minimum score threshold but STILL enforce strict profile safety
    if (!candidates.length) {
      candidates = baseEligible
        .filter((product) => !usedIds.has(product.id)
          && isStructuredCompatibilitySafe(product, answers)
          && isTimeCompatible(product, step)
          && isStrictlyEligibleForProfileAndStep(product, answers, step)
          && routineStepScores(product)[step] >= 1)
        .map((product) => ({
          product,
          score: productFitScore(product, answers, options.extraKeywords || []),
        }))
        .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating);
    }

    // Build a top-5 shortlist from the best candidates (prefer products with explicit diagnostic data)
    // Then apply weighted random selection so the same answers can produce different routines each time.
    const SHORTLIST_SIZE = 5;
    const topExplicit = candidates.filter(c => hasExplicitDiagnosticData(c.product)).slice(0, SHORTLIST_SIZE);
    const topFallback = candidates.filter(c => !hasExplicitDiagnosticData(c.product)).slice(0, SHORTLIST_SIZE);
    // Use explicit-data products if available (at least 3), otherwise mix
    const shortlist = topExplicit.length >= 3
      ? topExplicit.slice(0, SHORTLIST_SIZE)
      : [...topExplicit, ...topFallback].slice(0, SHORTLIST_SIZE);

    if (!shortlist.length) continue;

    // Weighted random selection: score is used as weight so higher-scored products
    // have a proportionally higher chance of being selected, but any of the top-5 can win.
    const minScore = Math.min(...shortlist.map(c => c.score));
    const weights = shortlist.map(c => Math.max(c.score - minScore + 1, 1));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let rand = Math.random() * totalWeight;
    let winner = shortlist[shortlist.length - 1]; // fallback to last if rounding error
    for (let i = 0; i < shortlist.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { winner = shortlist[i]; break; }
    }

    selected.push({ step, product: winner.product, score: winner.score });
    usedIds.add(winner.product.id);
    if (winner.product.vendor) usedVendors.add(normalize(winner.product.vendor));
  }

  return selected;
}

import type { Product } from '@/lib/data';

export const ROUTINE_ROLE_OPTIONS = [
  ['cleanser', 'Nettoyant'],
  ['makeup_remover', 'Démaquillant'],
  ['toner', 'Lotion tonique'],
  ['essence', 'Essence'],
  ['exfoliant', 'Exfoliant'],
  ['treatment', 'Soin ciblé / sérum'],
  ['spot_treatment', 'Soin localisé'],
  ['moisturizer', 'Hydratant'],
  ['face_oil', 'Huile visage'],
  ['eye_care', 'Contour des yeux'],
  ['mask', 'Masque'],
  ['sunscreen', 'Protection solaire'],
  ['lip_care', 'Soin des lèvres'],
  ['after_sun', 'Après-soleil'],
] as const;

export const SKIN_TYPE_OPTIONS = [
  ['normal', 'Normale'],
  ['dry', 'Sèche'],
  ['oily', 'Grasse'],
  ['combination', 'Mixte'],
] as const;

export const CONCERN_OPTIONS = [
  ['acne', 'Acné / imperfections'],
  ['blackheads', 'Points noirs'],
  ['excess_oil', 'Excès de sébum'],
  ['enlarged_pores', 'Pores dilatés'],
  ['dark_spots', 'Taches pigmentaires'],
  ['dullness', 'Teint terne'],
  ['uneven_tone', 'Teint irrégulier'],
  ['wrinkles', 'Rides et ridules'],
  ['loss_of_firmness', 'Perte de fermeté'],
  ['dehydration', 'Déshydratation'],
  ['dryness', 'Sécheresse'],
  ['barrier_damage', 'Barrière cutanée fragilisée'],
  ['redness', 'Rougeurs'],
  ['sensitivity', 'Sensibilité'],
  ['uneven_texture', 'Texture irrégulière'],
  ['dark_circles', 'Cernes'],
  ['puffiness', 'Poches'],
  ['sun_protection', 'Protection solaire'],
  ['post_sun_recovery', 'Réparation après-soleil'],
] as const;

export const SENSITIVITY_OPTIONS = [
  ['low', 'Faible'],
  ['medium', 'Moyenne'],
  ['high', 'Élevée'],
] as const;

export const ACTIVE_STRENGTH_OPTIONS = [
  ['none', 'Sans actif puissant'],
  ['gentle', 'Doux'],
  ['moderate', 'Modéré'],
  ['strong', 'Fort'],
] as const;

export const TIME_OF_DAY_OPTIONS = [
  ['morning', 'Matin'],
  ['evening', 'Soir'],
] as const;

type OptionValue<T extends readonly (readonly [string, string])[]> = T[number][0];

export type RoutineRole = OptionValue<typeof ROUTINE_ROLE_OPTIONS>;
export type SuitableSkinType = OptionValue<typeof SKIN_TYPE_OPTIONS>;
export type SuitableConcern = OptionValue<typeof CONCERN_OPTIONS>;
export type SensitivityLevel = OptionValue<typeof SENSITIVITY_OPTIONS>;
export type ActiveStrength = OptionValue<typeof ACTIVE_STRENGTH_OPTIONS>;
export type TimeOfDay = OptionValue<typeof TIME_OF_DAY_OPTIONS>;

export type ProductRecommendationMetadata = {
  routineRoles: RoutineRole[];
  suitableSkinTypes: SuitableSkinType[];
  suitableConcerns: SuitableConcern[];
  sensitivityLevels: SensitivityLevel[];
  activeStrength: ActiveStrength;
  timeOfDay: TimeOfDay[];
};

const normalizeKey = (value: unknown) => String(value ?? '')
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

function aliasMap<T extends readonly (readonly [string, string])[]>(options: T) {
  const aliases = new Map<string, OptionValue<T>>();
  options.forEach(([value, label]) => {
    aliases.set(normalizeKey(value), value);
    aliases.set(normalizeKey(label), value);
  });
  return aliases;
}

const EXTRA_ALIASES: Record<string, string> = {
  mixte: 'combination', grasse: 'oily', seche: 'dry', normale: 'normal',
  matin: 'morning', soir: 'evening',
  faible: 'low', moyen: 'medium', moyenne: 'medium', eleve: 'high', elevee: 'high',
  aucun: 'none', sans_actif: 'none', doux: 'gentle', modere: 'moderate', fort: 'strong',
  nettoyant: 'cleanser', demaquillant: 'makeup_remover', hydratant: 'moisturizer',
  serum: 'treatment', soin_cible: 'treatment', soin_localise: 'spot_treatment',
  protection_solaire: 'sunscreen', contour_des_yeux: 'eye_care',
  acne_imperfections: 'acne', imperfections: 'acne', exces_de_sebum: 'excess_oil',
  taches: 'dark_spots', taches_pigmentaires: 'dark_spots', rougeurs: 'redness',
  sensibilite: 'sensitivity', secheresse: 'dryness', deshydratation: 'dehydration',
  rides: 'wrinkles', rides_et_ridules: 'wrinkles', pores_dilates: 'enlarged_pores',
};

function splitSheetValues(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  // Accept the normal spreadsheet format ("cleanser | moisturizer") as well
  // as values copied from JSON or PostgreSQL text arrays.
  const normalized = String(value)
    .trim()
    .replace(/^\s*[\[{]\s*/, '')
    .replace(/\s*[\]}]\s*$/, '');
  return normalized
    .split(/[;,|\n]+/)
    .map(entry => entry.trim().replace(/^["']+|["']+$/g, ''));
}

export function parseOptionValues<T extends readonly (readonly [string, string])[]>(
  value: unknown,
  options: T,
): { values: OptionValue<T>[]; invalid: string[] } {
  const aliases = aliasMap(options);
  const values: OptionValue<T>[] = [];
  const invalid: string[] = [];

  splitSheetValues(value).forEach(raw => {
    const display = String(raw ?? '').trim();
    if (!display) return;
    const normalized = normalizeKey(display);
    const aliased = EXTRA_ALIASES[normalized] || normalized;
    const matched = aliases.get(aliased);
    if (!matched) {
      invalid.push(display);
    } else if (!values.includes(matched)) {
      values.push(matched);
    }
  });

  return { values, invalid };
}

export function parseSingleOption<T extends readonly (readonly [string, string])[]>(
  value: unknown,
  options: T,
  fallback: OptionValue<T>,
): { value: OptionValue<T>; invalid?: string } {
  if (value === undefined || value === null || String(value).trim() === '') return { value: fallback };
  const parsed = parseOptionValues(value, options);
  return parsed.values[0]
    ? { value: parsed.values[0] }
    : { value: fallback, invalid: String(value).trim() };
}

export function normalizeRecommendationMetadata(input: Record<string, unknown>): {
  metadata: ProductRecommendationMetadata;
  errors: Record<string, string>;
} {
  const fields = [
    ['routineRoles', input.routineRoles ?? input.routine_roles, ROUTINE_ROLE_OPTIONS],
    ['suitableSkinTypes', input.suitableSkinTypes ?? input.suitable_skin_types, SKIN_TYPE_OPTIONS],
    ['suitableConcerns', input.suitableConcerns ?? input.suitable_concerns, CONCERN_OPTIONS],
    ['sensitivityLevels', input.sensitivityLevels ?? input.sensitivity_levels, SENSITIVITY_OPTIONS],
    ['timeOfDay', input.timeOfDay ?? input.time_of_day, TIME_OF_DAY_OPTIONS],
  ] as const;
  const parsed = Object.fromEntries(fields.map(([field, raw, options]) => [field, parseOptionValues(raw, options)]));
  const strength = parseSingleOption(
    input.activeStrength ?? input.active_strength,
    ACTIVE_STRENGTH_OPTIONS,
    'none',
  );
  const errors: Record<string, string> = {};
  fields.forEach(([field]) => {
    const invalid = parsed[field].invalid;
    if (invalid.length) errors[field] = `Valeur(s) non reconnue(s) : ${invalid.join(', ')}`;
  });
  if (strength.invalid) errors.activeStrength = `Valeur non reconnue : ${strength.invalid}`;

  return {
    metadata: {
      routineRoles: parsed.routineRoles.values as RoutineRole[],
      suitableSkinTypes: parsed.suitableSkinTypes.values as SuitableSkinType[],
      suitableConcerns: parsed.suitableConcerns.values as SuitableConcern[],
      sensitivityLevels: parsed.sensitivityLevels.values as SensitivityLevel[],
      activeStrength: strength.value,
      timeOfDay: parsed.timeOfDay.values as TimeOfDay[],
    },
    errors,
  };
}

export const formatMetadataForSheet = (values: readonly string[] | undefined) => (values || []).join(' | ');

/**
 * Automatically infers and enriches diagnostic metadata (roles, suitable skin types,
 * suitable concerns, sensitivity levels, active strength, time of day) for any product
 * if DB values are missing.
 */
export function enrichProductMetadata(product: Partial<Product>): ProductRecommendationMetadata {
  const text = [
    product.title, product.name, product.nameFr, product.category,
    ...(product.categories || []), ...(product.tags || []),
    product.description, product.ingredients, product.usage,
  ].filter(Boolean).join(' ').toLowerCase();

  // 1. Infer Routine Roles
  const roles = new Set<RoutineRole>(product.routineRoles || []);
  if (!roles.size) {
    if (text.includes('solaire') || text.includes('spf') || text.includes('ecran')) roles.add('sunscreen');
    if (text.includes('nettoy') || text.includes('cleanser') || text.includes('mouss') || text.includes('micell')) roles.add('cleanser');
    if (text.includes('demaquill')) roles.add('makeup_remover');
    if (text.includes('tonique') || text.includes('toner') || text.includes('essence')) roles.add('toner');
    if (text.includes('serum') || text.includes('concentre') || text.includes('ampoule') || text.includes('traitement') || text.includes('anti ride') || text.includes('anti tache')) roles.add('treatment');
    if (text.includes('creme') || text.includes('hydrat') || text.includes('baume') || text.includes('emollient') || text.includes('fluide')) roles.add('moisturizer');
  }

  // 2. Infer Suitable Skin Types
  const skinTypes = new Set<SuitableSkinType>(product.suitableSkinTypes || []);
  if (!skinTypes.size) {
    if (text.includes('toutes peaux') || text.includes('tout type') || text.includes('tous types')) {
      skinTypes.add('normal'); skinTypes.add('dry'); skinTypes.add('oily'); skinTypes.add('combination');
    }
    if (text.includes('peau seche') || text.includes('seche') || text.includes('secheresse') || text.includes('nourri') || text.includes('baume')) skinTypes.add('dry');
    if (text.includes('peau grasse') || text.includes('p.grasses') || text.includes('matifiant') || text.includes('sebum') || text.includes('acne')) skinTypes.add('oily');
    if (text.includes('peau mixte') || text.includes('mixte') || text.includes('equilibr')) skinTypes.add('combination');
    if (!skinTypes.size) {
      skinTypes.add('normal'); skinTypes.add('dry'); skinTypes.add('oily'); skinTypes.add('combination');
    }
  }

  // 3. Infer Suitable Concerns
  const concerns = new Set<SuitableConcern>(product.suitableConcerns || []);
  if (!concerns.size) {
    if (text.includes('acne') || text.includes('imperfection') || text.includes('bouton') || text.includes('point noir')) concerns.add('acne');
    if (text.includes('tache') || text.includes('depigment') || text.includes('eclat') || text.includes('vitamin c') || text.includes('azlabright')) concerns.add('dark_spots');
    if (text.includes('ride') || text.includes('anti age') || text.includes('fermete') || text.includes('retinol') || text.includes('collagen')) concerns.add('wrinkles');
    if (text.includes('hydrat') || text.includes('deshydrat') || text.includes('secheresse') || text.includes('hyaluron')) concerns.add('dryness');
    if (text.includes('rougeur') || text.includes('rosace') || text.includes('couperose') || text.includes('cica') || text.includes('apais')) concerns.add('redness');
  }

  // 4. Infer Sensitivity Levels
  const sensitivity = new Set<SensitivityLevel>(product.sensitivityLevels || []);
  if (!sensitivity.size) {
    // Products explicitly formulated for sensitive / reactive skin include high sensitivity
    if (
      text.includes('haute tolerance') || text.includes('peau sensible') || text.includes('hypersensible')
      || text.includes('cica') || text.includes('apais') || text.includes('toleriane')
      || text.includes('sensibio') || text.includes('avene') || text.includes('thermal')
    ) {
      sensitivity.add('low'); sensitivity.add('medium'); sensitivity.add('high');
    } else if (
      // Products with known harsh/irritant ingredients are NOT suitable for high sensitivity
      text.includes('alcool denature') || text.includes('parfum puissant')
      || text.includes('retinol') || text.includes('retinal')
      || text.includes('acide glycolique') || text.includes('glycolic acid')
      || (text.includes('acide salicylique') && text.includes('fort'))
      || text.includes('peeling fort') || text.includes('exfoliant fort')
    ) {
      sensitivity.add('low'); sensitivity.add('medium');
    } else {
      // Default: most facial products are accessible to all sensitivity profiles
      sensitivity.add('low'); sensitivity.add('medium'); sensitivity.add('high');
    }
  }

  return {
    routineRoles: Array.from(roles),
    suitableSkinTypes: Array.from(skinTypes),
    suitableConcerns: Array.from(concerns),
    sensitivityLevels: Array.from(sensitivity),
    activeStrength: product.activeStrength || (text.includes('retinol') || text.includes('peel') ? 'strong' : 'gentle'),
    timeOfDay: product.timeOfDay?.length ? product.timeOfDay : ['morning', 'evening'],
  };
}

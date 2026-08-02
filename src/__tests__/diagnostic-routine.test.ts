import { describe, expect, it } from 'vitest';
import type { Product } from '@/lib/data';
import {
  buildDiagnosticRoutine,
  classifyRoutineStep,
  type DiagnosticAnswers,
} from '@/lib/diagnostic-routine';

const product = (overrides: Partial<Product> & Pick<Product, 'id' | 'title'>): Product => {
  const { id, title, ...rest } = overrides;
  return {
    id,
    title,
    nameFr: title,
    vendor: 'Test Brand',
    image: '/product.webp',
    images: ['/product.webp'],
    price: 100,
    comparePrice: 110,
    category: 'visage',
    categories: ['visage'],
    tags: [],
    rating: 4.8,
    reviews: 20,
    description: '',
    ingredients: '',
    usage: '',
    stock: 10,
    ...rest,
  };
};

const acneAnswers: DiagnosticAnswers = {
  skinType: 'oily',
  concern: 'acne',
  sensitivity: 'medium',
  breakoutFrequency: 'frequent',
  sunExposure: 'moderate',
  spfHabit: 'sometimes',
  activeTolerance: 'beginner',
  routineDepth: 'essential',
};

const catalogue = [
  product({ id: 1, title: 'Gel nettoyant purifiant', description: 'Nettoyant pores et imperfections' }),
  product({ id: 2, title: 'Mousse nettoyante anti-imperfections', ingredients: 'Acide salicylique' }),
  product({ id: 3, title: 'Sérum anti-imperfections niacinamide', category: 'acné', categories: ['acné'], ingredients: 'Niacinamide, Zinc' }),
  product({ id: 4, title: 'Crème hydratante barrière', ingredients: 'Céramides, Panthénol' }),
  product({ id: 5, title: 'Fluide solaire invisible SPF50+', category: 'solaire', categories: ['solaire'] }),
  product({ id: 6, title: 'Shampooing purifiant', category: 'cheveux', categories: ['cheveux'] }),
];

describe('diagnostic routine builder', () => {
  it('classifies catalogue metadata into skincare roles', () => {
    expect(classifyRoutineStep(catalogue[0])).toBe('cleanser');
    expect(classifyRoutineStep(catalogue[2])).toBe('treatment');
    expect(classifyRoutineStep(catalogue[3])).toBe('moisturizer');
    expect(classifyRoutineStep(catalogue[4])).toBe('sunscreen');
    expect(classifyRoutineStep(catalogue[5])).toBeNull();
    expect(classifyRoutineStep(product({ id: 7, title: 'ABC DERM LAIT DE TOILETTE 500 ML' }))).toBeNull();
    expect(classifyRoutineStep(product({ id: 8, title: 'GEL NETTOYANT PURIFIANT VISAGE' }))).toBe('cleanser');
  });

  it('returns one product per required step even when configured products are both cleansers', () => {
    const routine = buildDiagnosticRoutine(catalogue, acneAnswers, { configuredProductIds: [1, 2] });

    expect(routine.map((item) => item.step)).toEqual(['cleanser', 'treatment', 'sunscreen']);
    expect(new Set(routine.map((item) => item.step)).size).toBe(routine.length);
    expect(routine.filter((item) => item.step === 'cleanser')).toHaveLength(1);
    expect(routine.some((item) => item.product.id === 3)).toBe(true);
    expect(routine.some((item) => item.product.id === 5)).toBe(true);
  });

  it('uses moisturizer instead of a strong treatment for an essential sensitive-dry routine', () => {
    const routine = buildDiagnosticRoutine(catalogue, {
      ...acneAnswers,
      skinType: 'dry',
      concern: 'dryness',
      sensitivity: 'high',
    });

    expect(routine.map((item) => item.step)).toEqual(['cleanser', 'moisturizer', 'sunscreen']);
    expect(routine.find((item) => item.step === 'moisturizer')?.product.id).toBe(4);
  });

  it('uses structured roles instead of choosing a second cleanser by title', () => {
    const structuredCatalogue = [
      product({ id: 20, title: 'Gel nettoyant', routineRoles: ['cleanser'], suitableSkinTypes: ['oily'], suitableConcerns: ['acne'] }),
      product({ id: 21, title: 'Gel nettoyant anti-imperfections', routineRoles: ['treatment'], suitableSkinTypes: ['oily'], suitableConcerns: ['acne'], activeStrength: 'gentle' }),
      product({ id: 22, title: 'Protection quotidienne', routineRoles: ['sunscreen'], suitableSkinTypes: ['oily'], suitableConcerns: ['sun_protection'] }),
    ];

    const routine = buildDiagnosticRoutine(structuredCatalogue, acneAnswers);
    expect(routine.map(item => [item.step, item.product.id])).toEqual([
      ['cleanser', 20],
      ['treatment', 21],
      ['sunscreen', 22],
    ]);
  });

  it('excludes strong actives from a beginner routine with high sensitivity', () => {
    const candidates = [
      product({ id: 30, title: 'Nettoyant doux', routineRoles: ['cleanser'] }),
      product({ id: 31, title: 'Traitement fort', routineRoles: ['treatment'], suitableSkinTypes: ['oily'], suitableConcerns: ['acne'], sensitivityLevels: ['low'], activeStrength: 'strong' }),
      product({ id: 32, title: 'Traitement doux', routineRoles: ['treatment'], suitableSkinTypes: ['oily'], suitableConcerns: ['acne'], sensitivityLevels: ['high'], activeStrength: 'gentle' }),
      product({ id: 33, title: 'Solaire', routineRoles: ['sunscreen'] }),
    ];
    const routine = buildDiagnosticRoutine(candidates, { ...acneAnswers, sensitivity: 'high' });
    expect(routine.find(item => item.step === 'treatment')?.product.id).toBe(32);
    expect(routine.some(item => item.product.id === 31)).toBe(false);
  });
});

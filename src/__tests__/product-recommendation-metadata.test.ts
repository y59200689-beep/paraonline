import { describe, expect, it } from 'vitest';
import {
  ACTIVE_STRENGTH_OPTIONS,
  ROUTINE_ROLE_OPTIONS,
  normalizeRecommendationMetadata,
  parseOptionValues,
  parseSingleOption,
} from '@/lib/product-recommendation-metadata';

describe('product recommendation metadata', () => {
  it('accepts French labels and canonical values from spreadsheet cells', () => {
    expect(parseOptionValues('Nettoyant | sunscreen; Sérum', ROUTINE_ROLE_OPTIONS)).toEqual({
      values: ['cleanser', 'sunscreen', 'treatment'],
      invalid: [],
    });
  });

  it('accepts JSON and PostgreSQL-style arrays pasted into spreadsheet cells', () => {
    expect(parseOptionValues('["cleanser", "moisturizer"]', ROUTINE_ROLE_OPTIONS).values).toEqual(['cleanser', 'moisturizer']);
    expect(parseOptionValues('{morning, evening}', TIME_OF_DAY_OPTIONS).values).toEqual(['morning', 'evening']);
  });

  it('reports unknown spreadsheet values instead of silently storing them', () => {
    expect(parseOptionValues('cleanser | mystery_role', ROUTINE_ROLE_OPTIONS)).toEqual({
      values: ['cleanser'],
      invalid: ['mystery_role'],
    });
  });

  it('normalizes snake_case database payloads and a French strength label', () => {
    const result = normalizeRecommendationMetadata({
      routine_roles: ['moisturizer'],
      suitable_skin_types: 'Sèche | normale',
      suitable_concerns: 'Sécheresse; déshydratation',
      sensitivity_levels: 'Élevée',
      active_strength: 'Doux',
      time_of_day: 'Matin | soir',
    });

    expect(result.errors).toEqual({});
    expect(result.metadata).toMatchObject({
      routineRoles: ['moisturizer'],
      suitableSkinTypes: ['dry', 'normal'],
      suitableConcerns: ['dryness', 'dehydration'],
      sensitivityLevels: ['high'],
      activeStrength: 'gentle',
      timeOfDay: ['morning', 'evening'],
    });
  });

  it('uses the safe default for an empty active strength', () => {
    expect(parseSingleOption('', ACTIVE_STRENGTH_OPTIONS, 'none')).toEqual({ value: 'none' });
  });
});

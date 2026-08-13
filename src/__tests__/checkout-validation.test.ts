import { describe, expect, it } from 'vitest';
import { validateCheckoutFields } from '@/lib/checkout-validation';

const validFields = {
  name: 'Youssef Mahir',
  phone: '0625189798',
  address: '12 rue Exemple',
  city: 'Casablanca',
  note: '',
};

describe('validateCheckoutFields', () => {
  it('accepts a complete Moroccan checkout profile', () => {
    expect(validateCheckoutFields(validFields, 'FR')).toEqual({});
  });

  it('returns every invalid field in one pass', () => {
    const errors = validateCheckoutFields(
      { name: ' ', phone: '123', address: '', city: '', note: '' },
      'FR',
    );

    expect(Object.keys(errors).sort()).toEqual(['address', 'city', 'name', 'phone']);
  });

  it('provides Arabic validation copy when Arabic is active', () => {
    const errors = validateCheckoutFields({ ...validFields, phone: '12' }, 'AR');
    expect(errors.phone).toContain('رقم');
  });
});

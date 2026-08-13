import { describe, expect, it } from 'vitest';
import { customerStatusLabel, skinTypeLabel } from '@/lib/customer-presenters';

describe('customer panel presenters', () => {
  it('localises order states in French and Arabic', () => {
    expect(customerStatusLabel('in-transit', 'FR')).toBe('En transit');
    expect(customerStatusLabel('in transit', 'AR')).toBe('في الطريق');
  });

  it('localises skin types and preserves unknown values', () => {
    expect(skinTypeLabel('combination', 'FR')).toBe('Peau mixte');
    expect(skinTypeLabel('sensitive', 'AR')).toBe('بشرة حساسة');
    expect(skinTypeLabel('custom-profile', 'FR')).toBe('custom-profile');
  });
});

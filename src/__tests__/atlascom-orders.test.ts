import { describe, expect, it } from 'vitest';
import { atlascomOrderCode } from '@/lib/atlascom-orders';

describe('atlascomOrderCode', () => {
  it('removes letters and separators from storefront order references', () => {
    expect(atlascomOrderCode('PO-411010')).toBe('411010');
  });

  it('preserves an already numeric order reference', () => {
    expect(atlascomOrderCode('411010')).toBe('411010');
  });

  it('rejects a reference without any numeric order code', () => {
    expect(() => atlascomOrderCode('PO-ABC')).toThrow('ne contient aucun chiffre');
  });
});

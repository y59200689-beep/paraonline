import { describe, expect, it } from 'vitest';
import { formatPriceDH } from '@/lib/format-price';
import { CURRENCIES } from '@/context/CurrencyContext';

describe('storefront DH formatting', () => {
  it('uses two decimals for whole amounts, decimals and zero', () => {
    expect(formatPriceDH(170)).toBe('170.00 DH');
    expect(formatPriceDH(26.4)).toBe('26.40 DH');
    expect(formatPriceDH(0)).toBe('0.00 DH');
  });
  it('offers only DH without changing the ISO payment currency', () => {
    expect(CURRENCIES).toEqual([{ id: 'MAD', label: 'DH', symbol: 'DH', flag: '' }]);
  });
});

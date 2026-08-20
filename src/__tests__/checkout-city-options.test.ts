import { describe, expect, it } from 'vitest';
import { mapCourierZonesToCheckoutCities } from '../components/cart/CheckoutForm';
import { calculateShippingFee, type ShippingSettings } from '../lib/pricing';

describe('courier checkout city options', () => {
  const shippingSettings: ShippingSettings = {
    shippingFee: 35,
    shippingRules: [
      { city: 'Casablanca', fee: 20 },
      { city: 'Tanger', fee: 25 },
    ],
  };

  it('keeps municipality names as checkout values while retaining courier regions in labels', () => {
    const cities = mapCourierZonesToCheckoutCities(
      [{ id: '1', name: 'Casablanca-Settat' }, { id: '5', name: 'Tanger-Tétouan-Al Hoceïma' }],
      [{ id: '101', wilaya_id: '1', name: 'Casablanca' }, { id: '501', wilaya_id: '5', name: 'Tanger' }],
    );

    expect(cities).toEqual([
      { value: 'Casablanca', labelFr: 'Casablanca (Casablanca-Settat)', labelAr: 'Casablanca (Casablanca-Settat)' },
      { value: 'Tanger', labelFr: 'Tanger (Tanger-Tétouan-Al Hoceïma)', labelAr: 'Tanger (Tanger-Tétouan-Al Hoceïma)' },
    ]);
    expect(calculateShippingFee(26.4, cities[0].value, shippingSettings)).toBe(20);
    expect(calculateShippingFee(100, cities[1].value, shippingSettings)).toBe(25);
  });
});

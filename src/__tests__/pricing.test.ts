import { describe, it, expect } from 'vitest';
import {
  calculateSubtotal,
  calculateDiscount,
  calculateShippingFee,
  calculateAmountNeededForFreeShipping,
  calculateTotal,
  calculateCommerceSummary,
  FREE_SHIPPING_SUBTOTAL_DH,
  MinimalCartItem,
  MinimalCoupon,
  ShippingSettings
} from '../lib/pricing';

describe('Pricing Calculations', () => {
  describe('calculateSubtotal', () => {
    it('should return 0 for an empty cart', () => {
      expect(calculateSubtotal([])).toBe(0);
    });

    it('should calculate subtotal correctly for single item', () => {
      const cart: MinimalCartItem[] = [
        { product: { id: 1, price: 100 }, quantity: 2 }
      ];
      expect(calculateSubtotal(cart)).toBe(200);
    });

    it('should calculate subtotal correctly for multiple items', () => {
      const cart: MinimalCartItem[] = [
        { product: { id: 1, price: 50 }, quantity: 3 },
        { product: { id: 2, price: 120 }, quantity: 1 }
      ];
      expect(calculateSubtotal(cart)).toBe(270);
    });
  });

  describe('calculateDiscount', () => {
    it('should return 0 if no coupon is applied', () => {
      expect(calculateDiscount(200, null)).toBe(0);
    });

    it('should calculate percentage discount correctly', () => {
      const coupon: MinimalCoupon = { code: 'TEST10', discountPercent: 10, freeShipping: false };
      expect(calculateDiscount(200, coupon)).toBe(20);
    });

    it('should round percentage discount correctly', () => {
      const coupon: MinimalCoupon = { code: 'TEST15', discountPercent: 15, freeShipping: false };
      expect(calculateDiscount(105, coupon)).toBe(15.75);
    });

    it('should calculate fixed discount correctly', () => {
      const coupon: MinimalCoupon = { 
        code: 'FIXED50', 
        discountPercent: 0, 
        freeShipping: false, 
        discountType: 'fixed', 
        discountValue: 50 
      };
      expect(calculateDiscount(200, coupon)).toBe(50);
    });

    it('should limit fixed discount to subtotal if subtotal is smaller than discount value', () => {
      const coupon: MinimalCoupon = { 
        code: 'FIXED50', 
        discountPercent: 0, 
        freeShipping: false, 
        discountType: 'fixed', 
        discountValue: 50 
      };
      expect(calculateDiscount(30, coupon)).toBe(30);
    });
  });

  describe('calculateShippingFee', () => {
    const settings: ShippingSettings = {
      freeShippingThreshold: FREE_SHIPPING_SUBTOTAL_DH,
      shippingFee: 35,
      shippingRules: [
        { city: 'Casablanca', fee: 20 },
        { city: 'Tanger', fee: 0 }
      ]
    };

    it('should return 0 if shipping is free by coupon', () => {
      expect(calculateShippingFee(100, 'Rabat', settings, true)).toBe(0);
    });

    it.each([400, 400.01, 500, 600, 1000])(
      'should return 0 at or above the permanent threshold for subtotal %s',
      (subtotal) => {
        expect(calculateShippingFee(subtotal, 'Rabat', settings, false)).toBe(0);
      }
    );

    it.each([26.4, 100, 399.99])(
      'should charge delivery below the permanent threshold for subtotal %s',
      (subtotal) => {
        expect(calculateShippingFee(subtotal, 'Rabat', settings, false)).toBe(35);
      }
    );

    it('should ignore a stale configurable threshold above 400 DH', () => {
      expect(calculateShippingFee(400, 'Rabat', { ...settings, freeShippingThreshold: 600 }, false)).toBe(0);
    });

    it('should ignore the legacy free-delivery gift sentinel', () => {
      const legacySettings: ShippingSettings = {
        ...settings,
        giftRanges: [{
          minAmount: 0,
          maxAmount: 400,
          productId: -1,
          productName: 'Livraison Gratuite',
          isActive: true,
        }],
      };
      expect(calculateShippingFee(26.4, 'Rabat', legacySettings, false)).toBe(35);
    });

    it('should return 0 if subtotal is 0', () => {
      expect(calculateShippingFee(0, 'Rabat', settings, false)).toBe(0);
    });

    it('should return city override fee if city matches override rule', () => {
      expect(calculateShippingFee(200, 'Casablanca', settings, false)).toBe(20);
      expect(calculateShippingFee(200, 'Tanger', settings, false)).toBe(0);
    });

    it('should perform case-insensitive city match', () => {
      expect(calculateShippingFee(200, 'casablanca', settings, false)).toBe(20);
      expect(calculateShippingFee(200, 'TANGER', settings, false)).toBe(0);
    });

    it('should return default shipping fee if no city override matches', () => {
      expect(calculateShippingFee(200, 'Rabat', settings, false)).toBe(35);
    });

    it('should fallback to default fee of 35 if settings.shippingFee is missing', () => {
      const minimalSettings: ShippingSettings = { freeShippingThreshold: FREE_SHIPPING_SUBTOTAL_DH };
      expect(calculateShippingFee(200, 'Rabat', minimalSettings, false)).toBe(35);
    });
  });

  describe('calculateAmountNeededForFreeShipping', () => {
    it('should return false if subtotal is equal to or greater than the threshold', () => {
      expect(calculateAmountNeededForFreeShipping(400)).toBe(false);
      expect(calculateAmountNeededForFreeShipping(700)).toBe(false);
    });

    it('should return the difference if subtotal is below the threshold', () => {
      expect(calculateAmountNeededForFreeShipping(399.99)).toBeCloseTo(0.01);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total as subtotal - discount + shippingFee', () => {
      expect(calculateTotal(200, 20, 35)).toBe(215);
    });

    it('should handle zero shipping and zero discount', () => {
      expect(calculateTotal(300, 0, 0)).toBe(300);
    });
  });

  describe('calculateCommerceSummary', () => {
    const cart = [{ product: { price: 100 }, quantity: 4 }];
    const settings: ShippingSettings = {
      freeShippingThreshold: FREE_SHIPPING_SUBTOTAL_DH,
      shippingFee: 35,
      loyaltyPointsPerDh: 1,
      giftRanges: [
        { minAmount: 400, maxAmount: 599, productId: 12, productName: 'Cadeau 400', isActive: true },
        { minAmount: 600, maxAmount: 9999, productId: 13, productName: 'Cadeau 600', isActive: true },
      ],
    };

    it('handles below and exact free-delivery thresholds', () => {
      const belowThreshold = [{ product: { price: 399.99 }, quantity: 1 }];
      expect(calculateCommerceSummary({ cart: belowThreshold, coupon: null, settings }).shippingFee).toBe(35);
      const atThreshold = [{ product: { price: 200 }, quantity: 2 }];
      expect(calculateCommerceSummary({ cart: atThreshold, coupon: null, settings }).shippingFee).toBe(0);
    });

    it('uses the subtotal before discounts for the permanent threshold', () => {
      const summary = calculateCommerceSummary({
        cart,
        coupon: { code: 'SAVE50', discountType: 'fixed', discountValue: 50 },
        settings,
      });
      expect(summary).toMatchObject({
        subtotal: 400,
        discountAmount: 50,
        shippingFee: 0,
        total: 350,
      });
    });

    it('does not select or apply a legacy free-delivery pseudo-gift', () => {
      const summary = calculateCommerceSummary({
        cart: [{ product: { price: 26.4 }, quantity: 1 }],
        coupon: null,
        settings: {
          ...settings,
          giftRanges: [{
            minAmount: 0,
            maxAmount: 400,
            productId: -1,
            productName: 'Livraison Gratuite',
            isActive: true,
          }],
        },
      });
      expect(summary).toMatchObject({
        subtotal: 26.4,
        shippingFee: 35,
        total: 61.4,
        activeGiftRange: null,
        giftItem: null,
      });
    });

    it('selects the matching gift tier and excludes disabled gifts', () => {
      const eligible = calculateCommerceSummary({
        cart,
        coupon: null,
        settings,
        giftProducts: [{ id: 12, stock: 2, status: 'live' }],
      });
      expect(eligible.giftItem).toBe('Cadeau 400');

      const disabled = calculateCommerceSummary({
        cart,
        coupon: null,
        settings: { ...settings, giftRanges: [{ ...settings.giftRanges![0], isActive: false }] },
        giftProducts: [{ id: 12, stock: 2, status: 'live' }],
      });
      expect(disabled.giftItem).toBeNull();
    });

    it('excludes out-of-stock gifts', () => {
      const summary = calculateCommerceSummary({
        cart,
        coupon: null,
        settings,
        giftProducts: [{ id: 12, stock: 0, status: 'live' }],
      });
      expect(summary.giftItem).toBeNull();
    });

    it('recalculates coupon, shipping, savings and total together', () => {
      const summary = calculateCommerceSummary({
        cart: [{ product: { price: 99.95 }, quantity: 2 }],
        coupon: { code: 'SAVE10', discountPercent: 10, freeShipping: true },
        settings,
      });
      expect(summary).toMatchObject({
        subtotal: 199.9,
        discountAmount: 19.99,
        shippingFee: 0,
        total: 179.91,
        totalSavings: 19.99,
      });
    });
  });
});

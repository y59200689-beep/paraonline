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
        { city: 'Tanger', fee: 25 }
      ]
    };

    it.each([400, 401, 500, 600, 1000])(
      'should return 0 at or above the permanent threshold for discounted merchandise subtotal %s',
      (discountedSubtotal) => {
        expect(calculateShippingFee(discountedSubtotal, 'Rabat', settings)).toBe(0);
      }
    );

    it.each([26.4, 100, 399, 399.99])(
      'should charge delivery below the permanent threshold for discounted merchandise subtotal %s',
      (discountedSubtotal) => {
        expect(calculateShippingFee(discountedSubtotal, 'Rabat', settings)).toBe(35);
      }
    );

    it('should ignore a stale configurable threshold above 400 DH', () => {
      expect(calculateShippingFee(400, 'Rabat', { ...settings, freeShippingThreshold: 600 })).toBe(0);
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
      expect(calculateShippingFee(26.4, 'Rabat', legacySettings)).toBe(35);
    });

    it('charges the configured city fee when a promotion reduces merchandise to zero', () => {
      expect(calculateShippingFee(0, 'Rabat', settings)).toBe(35);
    });

    it('should return city override fee if city matches override rule', () => {
      expect(calculateShippingFee(200, 'Casablanca', settings)).toBe(20);
      expect(calculateShippingFee(200, 'Tanger', settings)).toBe(25);
    });

    it('should perform case-insensitive city match', () => {
      expect(calculateShippingFee(200, 'casablanca', settings)).toBe(20);
      expect(calculateShippingFee(200, 'TANGER', settings)).toBe(25);
    });

    it('should return default shipping fee if no city override matches', () => {
      expect(calculateShippingFee(200, 'Rabat', settings)).toBe(35);
    });

    it('does not let a zero city fee create a below-threshold free-shipping exception', () => {
      expect(calculateShippingFee(200, 'Tanger', { ...settings, shippingRules: [{ city: 'Tanger', fee: 0 }] })).toBe(35);
    });

    it('should fallback to default fee of 35 if settings.shippingFee is missing', () => {
      const minimalSettings: ShippingSettings = { freeShippingThreshold: FREE_SHIPPING_SUBTOTAL_DH };
      expect(calculateShippingFee(200, 'Rabat', minimalSettings)).toBe(35);
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
      shippingRules: [{ city: 'Casablanca', fee: 20 }],
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

    it('uses the discounted merchandise subtotal for the permanent threshold', () => {
      const summary = calculateCommerceSummary({
        cart: [{ product: { price: 420 }, quantity: 1 }],
        coupon: { code: 'SAVE10', discountPercent: 10 },
        settings,
        shippingCity: 'Casablanca',
      });
      expect(summary).toMatchObject({
        subtotal: 420,
        discountAmount: 42,
        discountedSubtotal: 378,
        shippingFee: 20,
        total: 398,
      });
    });

    it('keeps delivery free when a discount leaves the merchandise subtotal at or above 400 DH', () => {
      const summary = calculateCommerceSummary({
        cart: [{ product: { price: 500 }, quantity: 1 }],
        coupon: { code: 'SAVE10', discountPercent: 10 },
        settings,
        shippingCity: 'Casablanca',
      });
      expect(summary).toMatchObject({
        discountedSubtotal: 450,
        shippingFee: 0,
        total: 450,
      });
    });

    it('recalculates delivery as cart quantities and the selected city change', () => {
      const cartItem = { product: { price: 199.5 }, quantity: 2 };
      const belowThreshold = calculateCommerceSummary({
        cart: [cartItem],
        coupon: null,
        settings,
        shippingCity: 'Casablanca',
      });
      expect(belowThreshold).toMatchObject({ subtotal: 399, shippingFee: 20, total: 419 });

      const afterQuantityUpdate = calculateCommerceSummary({
        cart: [{ ...cartItem, quantity: 3 }],
        coupon: null,
        settings,
        shippingCity: 'Casablanca',
      });
      expect(afterQuantityUpdate).toMatchObject({ subtotal: 598.5, shippingFee: 0, total: 598.5 });

      expect(calculateCommerceSummary({
        cart: [cartItem],
        coupon: null,
        settings: { ...settings, shippingRules: [{ city: 'Tanger', fee: 12 }] },
        shippingCity: 'Tanger',
      }).shippingFee).toBe(12);
    });

    it('keeps gift eligibility independent from discounted-subtotal shipping eligibility', () => {
      const citySettings = {
        ...settings,
        giftRanges: [
          { minAmount: 600, maxAmount: 799, productId: 13, productName: 'Cadeau 600', isActive: true },
        ],
      };

      const freeShipping = calculateCommerceSummary({
        cart: [{ product: { price: 700 }, quantity: 1 }],
        coupon: { code: 'SAVE', discountType: 'fixed', discountValue: 200 },
        settings: citySettings,
        shippingCity: 'Casablanca',
      });
      expect(freeShipping).toMatchObject({ giftItem: 'Cadeau 600', discountedSubtotal: 500, shippingFee: 0 });

      const paidShipping = calculateCommerceSummary({
        cart: [{ product: { price: 700 }, quantity: 1 }],
        coupon: { code: 'SAVE', discountType: 'fixed', discountValue: 350 },
        settings: citySettings,
        shippingCity: 'Casablanca',
      });
      expect(paidShipping).toMatchObject({ giftItem: 'Cadeau 600', discountedSubtotal: 350, shippingFee: 20 });
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

    it('does not allow a legacy coupon free-shipping flag to bypass the discounted threshold', () => {
      const summary = calculateCommerceSummary({
        cart: [{ product: { price: 99.95 }, quantity: 2 }],
        coupon: { code: 'SAVE10', discountPercent: 10, freeShipping: true },
        settings,
        shippingCity: 'Rabat',
      });
      expect(summary).toMatchObject({
        subtotal: 199.9,
        discountAmount: 19.99,
        discountedSubtotal: 179.91,
        shippingFee: 35,
        total: 214.91,
        totalSavings: 19.99,
      });
    });
  });
});

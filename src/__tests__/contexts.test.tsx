// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart, CartProvider } from '../context/CartContext';
import { useLoyalty, LoyaltyProvider } from '../context/LoyaltyContext';
import { useSettings, SettingsProvider } from '../context/SettingsContext';
import { LanguageProvider } from '../context/LanguageContext';
import { UiProvider } from '../context/UiContext';
import { ThemeProvider } from '../context/ThemeContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { AmPmProvider } from '../context/AmPmContext';
import { CompareProvider } from '../context/CompareContext';
import { WishlistProvider } from '../context/WishlistContext';
import { ProductsProvider } from '../context/ProductsContext';
import { Product } from '../lib/data';

const mockShowToast = vi.fn();
const mockSetIsCartOpen = vi.fn();

vi.mock('../context/UiContext', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    useUi: () => ({
      showToast: mockShowToast,
      isCartOpen: false,
      setIsCartOpen: mockSetIsCartOpen,
    }),
  };
});

// Helper to wrap providers
const AllProvidersWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SettingsProvider>
      <ProductsProvider>
        <UiProvider>
          <LanguageProvider>
            <LoyaltyProvider>
              <ThemeProvider>
                <CartProvider>
                  <CurrencyProvider>
                    <AmPmProvider>
                      <CompareProvider>
                        <WishlistProvider>
                          {children}
                        </WishlistProvider>
                      </CompareProvider>
                    </AmPmProvider>
                  </CurrencyProvider>
                </CartProvider>
              </ThemeProvider>
            </LoyaltyProvider>
          </LanguageProvider>
        </UiProvider>
      </ProductsProvider>
    </SettingsProvider>
  );
};

describe('Context Hooks Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockShowToast.mockClear();
    mockSetIsCartOpen.mockClear();
  });

  describe('useCart Hook', () => {
    const mockProduct: Product = {
      id: 1,
      title: 'Test Skincare Product',
      price: 100,
      comparePrice: 120,
      image: '/test.jpg',
      images: ['/test.jpg'],
      category: 'visage',
      rating: 4.5,
      reviews: 10,
      stock: 5,
      description: 'Description',
      ingredients: 'Ingredients',
      usage: 'Usage',
      vendor: 'Test Vendor',
      tags: ['visage'],
    };

    it('should add items to cart and increment quantity', async () => {
      const { result } = renderHook(() => useCart(), { wrapper: AllProvidersWrapper });

      // Flush mounting effects
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      // Initially empty
      expect(result.current.cart).toEqual([]);

      // Add 2 items
      await act(async () => {
        result.current.addToCart(mockProduct, 2);
      });

      expect(result.current.cart.length).toBe(1);
      expect(result.current.cart[0].product.id).toBe(mockProduct.id);
      expect(result.current.cart[0].quantity).toBe(2);

      // Add 1 more item
      await act(async () => {
        result.current.addToCart(mockProduct, 1);
      });

      expect(result.current.cart[0].quantity).toBe(3);
    });

    it('should respect stock boundaries and block excess quantity additions', async () => {
      const { result } = renderHook(() => useCart(), { wrapper: AllProvidersWrapper });

      // Flush mounting effects
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      // Add 3 items (under limit of 5)
      await act(async () => {
        result.current.addToCart(mockProduct, 3);
      });
      expect(result.current.cart[0].quantity).toBe(3);
      expect(mockShowToast).not.toHaveBeenCalled();

      // Add 3 more items (exceeds limit of 5)
      await act(async () => {
        result.current.addToCart(mockProduct, 3);
      });

      // Should be capped at 5
      expect(result.current.cart[0].quantity).toBe(5);

      // Wait for the alert's setTimeout (50ms) to fire
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 80));
      });

      expect(mockShowToast).toHaveBeenCalled();
    });

    it('should validate and apply coupons correctly', async () => {
      const { result } = renderHook(() => useCart(), { wrapper: AllProvidersWrapper });

      // Flush mounting effects
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      // Add product to cart to have a subtotal
      await act(async () => {
        result.current.addToCart(mockProduct, 2); // 200 DH
      });

      // Subtotal should be 200, no discount initially
      expect(result.current.subtotal).toBe(200);
      expect(result.current.discountAmount).toBe(0);

      // Apply BEAUTY10 (10% discount)
      let couponResult: { success: boolean; message: string } | undefined;
      await act(async () => {
        couponResult = await result.current.applyCouponCode('BEAUTY10');
      });

      expect(couponResult?.success).toBe(true);
      expect(result.current.appliedCoupon?.code).toBe('BEAUTY10');
      expect(result.current.discountAmount).toBe(20); // 10% of 200
      expect(result.current.total).toBe(180 + result.current.shippingFee);

      // Remove coupon
      await act(async () => {
        result.current.removeCoupon();
      });
      expect(result.current.appliedCoupon).toBeNull();
      expect(result.current.discountAmount).toBe(0);

      // Apply CLINICAL15 (15% discount)
      await act(async () => {
        couponResult = await result.current.applyCouponCode('CLINICAL15') as typeof couponResult;
      });

      expect(couponResult?.success).toBe(true);
      expect(result.current.discountAmount).toBe(30); // 15% of 200
    });

    it('should initialize with COD payment method and allow updates', async () => {
      const { result } = renderHook(() => useCart(), { wrapper: AllProvidersWrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      expect(result.current.paymentMethod).toBe('cod');

      await act(async () => {
        result.current.setPaymentMethod('stripe');
      });
      expect(result.current.paymentMethod).toBe('stripe');

      await act(async () => {
        result.current.setPaymentMethod('cmi');
      });
      expect(result.current.paymentMethod).toBe('cmi');
    });
  });

  describe('useLoyalty Hook', () => {
    it('should map tier multipliers correctly based on totalEarned', async () => {
      // Mock local storage to simulate 800 total earned points (Gold Tier)
      localStorage.setItem('loyalty_total_earned', '800');

      const { result } = renderHook(() => useLoyalty(), { wrapper: AllProvidersWrapper });

      // Flush mounting effects
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      // Loyalty tier should resolve to Gold and multiplier to 1.5
      expect(result.current.tier).toBe('Gold');
      expect(result.current.tierMultiplier).toBe(1.5);
    });

    it('should deduct points correctly on rewards redemption', async () => {
      // Setup user with 100 points
      localStorage.setItem('loyalty_points', '100');

      const { result } = renderHook(() => useLoyalty(), { wrapper: AllProvidersWrapper });

      // Flush mounting effects
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      // Points should be 100 on start
      expect(result.current.points).toBe(100);

      // Redeem reward costing 50 points
      let redeemResult;
      await act(async () => {
        redeemResult = result.current.redeemReward(50, 'GIFT50', '50 DH Gift', 'هدية بقيمة 50 د.م.');
      });

      expect(redeemResult).toBe(true);
      expect(result.current.points).toBe(50);
      expect(result.current.pointsHistory[0].amount).toBe(-50);
      expect(result.current.pointsHistory[0].descriptionFr).toContain('50 DH Gift');
    });

    it('should reject rewards redemption if points are insufficient', async () => {
      // Setup user with 20 points
      localStorage.setItem('loyalty_points', '20');

      const { result } = renderHook(() => useLoyalty(), { wrapper: AllProvidersWrapper });

      // Flush mounting effects
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      let redeemResult;
      await act(async () => {
        redeemResult = result.current.redeemReward(50, 'GIFT50', '50 DH Gift', 'هدية بقيمة 50 د.م.');
      });

      expect(redeemResult).toBe(false);
      expect(result.current.points).toBe(20);
    });
  });

  describe('useSettings Hook', () => {
    it('should fall back to defaults during settings load network failure', async () => {
      // Mock fetch failure specifically for settings
      const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network outage'));

      const { result } = renderHook(() => useSettings(), { wrapper: AllProvidersWrapper });

      // Flush mounting effects
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      // Settings load should gracefully fall back to default values
      expect(result.current.settings.storeName).toBe('Para Officinal S.A');
      expect(result.current.settings.freeShippingThreshold).toBe(600);
      expect(result.current.settings.shippingFee).toBe(35);
      expect(fetchSpy).toHaveBeenCalled();
    });

    it('should include correct payment settings default configuration values', async () => {
      const { result } = renderHook(() => useSettings(), { wrapper: AllProvidersWrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      expect(result.current.settings.paymentSettings).toBeDefined();
      expect(result.current.settings.paymentSettings?.onlinePaymentEnabled).toBe(false);
      expect(result.current.settings.paymentSettings?.stripeEnabled).toBe(false);
      expect(result.current.settings.paymentSettings?.cmiEnabled).toBe(false);
      expect(result.current.settings.paymentSettings?.testMode).toBe(true);
    });

    it('should include correct delivery settings default configuration values', async () => {
      const { result } = renderHook(() => useSettings(), { wrapper: AllProvidersWrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      expect(result.current.settings.deliverySettings).toBeDefined();
      expect(result.current.settings.deliverySettings?.cutoffHour).toBe(14);
      expect(result.current.settings.deliverySettings?.defaultDaysMin).toBe(1);
      expect(result.current.settings.deliverySettings?.defaultDaysMax).toBe(2);
      expect(result.current.settings.deliverySettings?.cityRules).toEqual([]);
    });
  });
});

// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart, CartProvider } from '../context/CartContext';
import { useLoyalty, LoyaltyProvider } from '../context/LoyaltyContext';
import { useSettings, SettingsProvider } from '../context/SettingsContext';
import { useUi, UiProvider } from '../context/UiContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { AmPmProvider } from '../context/AmPmContext';
import { CompareProvider } from '../context/CompareContext';
import { WishlistProvider } from '../context/WishlistContext';
import { ProductsProvider } from '../context/ProductsContext';
import { PRODUCTS_DB } from '../lib/data';

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

// Custom hook to combine contexts for single-mount integration testing
const useCombinedContexts = () => {
  const cart = useCart();
  const loyalty = useLoyalty();
  const ui = useUi();
  return { cart, loyalty, ui };
};

describe('Skin Diagnostic to Checkout Flow Integration Test', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should successfully complete skin diagnostic, apply discount, submit order, and earn loyalty points', async () => {
    const { result } = renderHook(() => useCombinedContexts(), { wrapper: AllProvidersWrapper });

    // Flush mount effects
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    // 1. Assert initial state: empty cart, zero loyalty points, no diagnostic results
    expect(result.current.cart.cart).toEqual([]);
    expect(result.current.loyalty.points).toBe(0);
    expect(result.current.ui.diagnostic).toBeNull();

    // 2. Simulate completion of Skin Diagnostic flow (save results)
    act(() => {
      result.current.ui.setDiagnostic({
        skinType: 'Oily',
        concern: 'Acne',
        sunExposure: 'High'
      });
    });

    expect(result.current.ui.diagnostic).toEqual({
      skinType: 'Oily',
      concern: 'Acne',
      sunExposure: 'High'
    });
    expect(localStorage.getItem('skin_diagnostic_results')).toContain('Oily');

    // 3. Add routine products to the Cart with the 15% AI bundle discount enabled
    const prod1 = PRODUCTS_DB[0]; // Price: 49.00
    const prod2 = PRODUCTS_DB[1]; // Price: 69.00

    act(() => {
      result.current.cart.addToCart(prod1, 1, true); // apply 15% discount
    });
    act(() => {
      result.current.cart.addToCart(prod2, 1, true); // apply 15% discount
    });

    expect(result.current.cart.cart.length).toBe(2);

    // Verify 15% discount pricing (rounded as done in addToCart: Math.round(price * 0.85))
    const expectedPrice1 = Math.round(prod1.price * 0.85); // Math.round(49 * 0.85) = 42
    const expectedPrice2 = Math.round(prod2.price * 0.85); // Math.round(69 * 0.85) = 59
    
    expect(result.current.cart.cart[0].product.price).toBe(expectedPrice1);
    expect(result.current.cart.cart[1].product.price).toBe(expectedPrice2);

    const expectedSubtotal = expectedPrice1 + expectedPrice2; // 42 + 59 = 101
    expect(result.current.cart.subtotal).toBe(expectedSubtotal);

    // Shipping rules: subtotal 101 is below free shipping threshold of 600, city Casablanca shipping fee is 20 DH
    // Let's set city to Casablanca
    act(() => {
      result.current.cart.setShippingCity('Casablanca');
    });

    const expectedShippingFee = 20;
    expect(result.current.cart.shippingFee).toBe(expectedShippingFee);

    const expectedTotal = expectedSubtotal + expectedShippingFee; // 101 + 20 = 121
    expect(result.current.cart.total).toBe(expectedTotal);

    // 4. Submit checkout order
    let orderResult: { success: boolean; orderId?: string; whatsappUrl: string } | undefined;
    await act(async () => {
      orderResult = await result.current.cart.submitOrder({
        name: 'Imane Fassi',
        phone: '0661998877',
        address: 'Appt 4, Immeuble B, Boulevard d\'Anfa',
        city: 'Casablanca'
      });
    });

    // Check order submission result
    expect(orderResult?.success).toBe(true);
    expect(orderResult?.orderId).toBe('ORD-987654-TEST');
    expect(orderResult?.whatsappUrl).toContain('212660808080'); // check store whatsapp number
    expect(orderResult?.whatsappUrl).toContain('121%20DH'); // check url encoded total in whatsapp URL

    // Cart should be cleared after checkout
    expect(result.current.cart.cart).toEqual([]);

    // 5. Award loyalty points on client-side post-checkout (matching CartDrawer handleCheckoutSubmit)
    act(() => {
      result.current.loyalty.earnPoints(Math.round(expectedTotal), "Nouvelle commande", "طلب جديد");
    });

    // Check loyalty points calculation: total is 121, points multiplier is 1.0x (Bronze)
    // Points earned = 121 * 1.0 * 1.0 = 121
    expect(result.current.loyalty.points).toBe(121);
    expect(result.current.loyalty.totalEarned).toBe(121);
    expect(result.current.loyalty.pointsHistory.length).toBe(1);
    expect(result.current.loyalty.pointsHistory[0].amount).toBe(121);
    expect(result.current.loyalty.pointsHistory[0].descriptionFr).toBe("Nouvelle commande");
  });
});

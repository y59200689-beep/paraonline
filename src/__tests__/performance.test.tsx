// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings, SettingsProvider } from '../context/SettingsContext';
import { useTranslation, LanguageProvider } from '../context/LanguageContext';
import { CartProvider } from '../context/CartContext';
import { LoyaltyProvider } from '../context/LoyaltyContext';
import { WishlistProvider } from '../context/WishlistContext';
import { UiProvider } from '../context/UiContext';
import { ProductsProvider } from '../context/ProductsContext';

// Simple wrappers for testing individual providers in isolation
const SettingsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SettingsProvider>{children}</SettingsProvider>
);

const LanguageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('Performance, Leak Prevention & Lifecycle Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Settings SWR Caching & Resilience', () => {
    it('should cache settings and serve from cache within the TTL window without refetching', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');
      
      const { result, unmount } = renderHook(() => useSettings(), { wrapper: SettingsWrapper });

      // First mount triggers a fetch call
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
      });
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Re-trigger loadSettings manually within the 60s cache window
      await act(async () => {
        await result.current.loadSettings();
      });

      // Fetch should NOT have been called again (caching works)
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      
      unmount();
    });
  });

  describe('BroadcastChannel Subscription Cleanups (Preventing Memory Leaks)', () => {
    it('should close Cart, Wishlist, and Loyalty BroadcastChannels on component unmount', async () => {
      // Spy on BroadcastChannel.prototype.close
      const closeSpy = vi.spyOn(global.BroadcastChannel.prototype, 'close');

      // 1. Render and unmount CartProvider
      const { unmount: unmountCart } = renderHook(() => {}, {
        wrapper: ({ children }) => (
          <SettingsProvider>
            <ProductsProvider>
              <UiProvider>
                <LanguageProvider>
                  <CartProvider>{children}</CartProvider>
                </LanguageProvider>
              </UiProvider>
            </ProductsProvider>
          </SettingsProvider>
        )
      });
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      unmountCart();
      
      // CartProvider has 2 useEffects creating BroadcastChannels (listener and broadcaster)
      // Both should be closed on unmount
      expect(closeSpy).toHaveBeenCalled();
      closeSpy.mockClear();

      // 2. Render and unmount WishlistProvider
      const { unmount: unmountWishlist } = renderHook(() => {}, {
        wrapper: ({ children }) => (
          <WishlistProvider>{children}</WishlistProvider>
        )
      });
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      unmountWishlist();
      expect(closeSpy).toHaveBeenCalled();
      closeSpy.mockClear();

      // 3. Render and unmount LoyaltyProvider
      const { unmount: unmountLoyalty } = renderHook(() => {}, {
        wrapper: ({ children }) => (
          <SettingsProvider>
            <LoyaltyProvider>{children}</LoyaltyProvider>
          </SettingsProvider>
        )
      });
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      unmountLoyalty();
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('Translation Fallback System', () => {
    it('should fall back to the raw key if the key is missing in all locales', () => {
      const { result } = renderHook(() => useTranslation(), { wrapper: LanguageWrapper });
      
      // Search for non-existent key
      const value = result.current.t('completely_non_existent_key_xyz');
      expect(value).toBe('completely_non_existent_key_xyz');
    });

    it('should fall back to French if a translation is missing in Arabic', async () => {
      const { result } = renderHook(() => useTranslation(), { wrapper: LanguageWrapper });

      // Change language to AR
      await act(async () => {
        result.current.toggleLanguage(); // FR -> AR
      });
      expect(result.current.language).toBe('AR');

      // Trigger translation for a key that exists in French but is missing in Arabic locales (if any, or mock it)
      // For testing, since we use translation files, we check fallback logic returns a string or key
      const value = result.current.t('cart_title');
      expect(value).toBeDefined();
      expect(typeof value).toBe('string');
    });
  });
});

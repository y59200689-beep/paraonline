'use client';

/**
 * AppProviders
 *
 * Single composition boundary for all global React context providers.
 * Provider order is intentional — each layer may depend on contexts above it:
 *
 *  1. SettingsProvider   — fetches store config; no deps
 *  2. ProductsProvider   — fetches catalogue; no deps
 *  3. UiProvider         — toast / modal state; no deps
 *  4. LanguageProvider   — i18n; no deps
 *  5. LoyaltyProvider    — auth + points; depends on SettingsContext
 *  6. ThemeProvider      — locked to light; no deps (kept for future use)
 *  7. CartProvider       — cart math; depends on Settings, Language, Ui
 *  8. CurrencyProvider   — FX rates; no deps
 *  9. AmPmProvider       — routine toggle; no deps
 * 10. CompareProvider    — product comparison; no deps
 * 11. WishlistProvider   — wishlist; no deps
 *
 * To add or reorder a provider, edit only this file — layout.tsx stays untouched.
 */

import React from 'react';
import { SettingsProvider } from './SettingsContext';
import { ProductsProvider } from './ProductsContext';
import { UiProvider } from './UiContext';
import { LanguageProvider } from './LanguageContext';
import { LoyaltyProvider } from './LoyaltyContext';
import { ThemeProvider } from './ThemeContext';
import { CartProvider } from './CartContext';
import { CurrencyProvider } from './CurrencyContext';
import { AmPmProvider } from './AmPmContext';
import { CompareProvider } from './CompareContext';
import { WishlistProvider } from './WishlistContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
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
}

'use client';
import React, { createContext, useContext } from 'react';
import { formatPriceDH } from '@/lib/format-price';

// Keep ISO types compatible with payment integrations; storefront prices use DH only.
export type CurrencyCode = 'MAD' | 'EUR' | 'USD';
interface CurrencyOption { id: CurrencyCode; label: string; symbol: string; flag: string }
interface CurrencyContextProps {
  selectedCurrency: CurrencyCode;
  setSelectedCurrency: (currency: CurrencyCode) => void;
  currencies: CurrencyOption[];
  currentCurrency: CurrencyOption;
  convertPrice: (price: number) => string;
  rates: Record<CurrencyCode, number>;
  isLoading: boolean;
}
export const CURRENCIES: CurrencyOption[] = [{ id: 'MAD', label: 'DH', symbol: 'DH', flag: '' }];
const value: CurrencyContextProps = {
  selectedCurrency: 'MAD',
  setSelectedCurrency: () => {},
  currencies: CURRENCIES,
  currentCurrency: CURRENCIES[0],
  convertPrice: formatPriceDH,
  rates: { MAD: 1, EUR: 0.091, USD: 0.099 },
  isLoading: false,
};
const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);
export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}

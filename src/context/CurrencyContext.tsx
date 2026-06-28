/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type CurrencyCode = 'MAD' | 'EUR' | 'USD';

interface CurrencyOption {
  id: CurrencyCode;
  label: string;
  symbol: string;
  flag: string;
}

interface CurrencyContextProps {
  selectedCurrency: CurrencyCode;
  setSelectedCurrency: (c: CurrencyCode) => void;
  currencies: CurrencyOption[];
  currentCurrency: CurrencyOption;
  convertPrice: (madPrice: number) => string;
  rates: Record<CurrencyCode, number>;
  isLoading: boolean;
}

export const CURRENCIES: CurrencyOption[] = [
  { id: 'MAD', label: 'MAD (DH)', symbol: 'DH', flag: '' },
  { id: 'EUR', label: 'EUR (€)',  symbol: '€',  flag: '' },
  { id: 'USD', label: 'USD ($)',  symbol: '$',  flag: '' },
];

// Fallback rates in case the API call fails
const FALLBACK_RATES: Record<CurrencyCode, number> = {
  MAD: 1,
  EUR: 0.091,
  USD: 0.099,
};

const CACHE_KEY = 'bm_currency_rates';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrencyState] = useState<CurrencyCode>('MAD');
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved currency preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bm_selected_currency') as CurrencyCode | null;
      if (saved && ['MAD', 'EUR', 'USD'].includes(saved)) {
        setSelectedCurrencyState(saved);
      }
    } catch {}
  }, []);

  // Fetch live daily rates from frankfurter.app (free, no API key, ECB data)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Check cache first
        const cachedRaw = localStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const age = Date.now() - cached.timestamp;
          if (age < CACHE_TTL) {
            setRates({ MAD: 1, EUR: cached.EUR, USD: cached.USD });
            setIsLoading(false);
            return;
          }
        }

        // Fetch fresh rates from ExchangeRate-API (free, keyless, CORS-enabled, supports MAD base)
        const res = await fetch('https://open.er-api.com/v6/latest/MAD');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();

        if (data.result !== 'success' || !data.rates) throw new Error('API error response');

        const freshRates = {
          MAD: 1,
          EUR: data.rates.EUR as number,
          USD: data.rates.USD as number,
        };

        setRates(freshRates);

        // Cache with timestamp
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          EUR: freshRates.EUR,
          USD: freshRates.USD,
          timestamp: Date.now(),
        }));
      } catch {
        // Silently fall back to hardcoded rates
        setRates(FALLBACK_RATES);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
  }, []);

  const setSelectedCurrency = useCallback((c: CurrencyCode) => {
    setSelectedCurrencyState(c);
    try {
      localStorage.setItem('bm_selected_currency', c);
    } catch {}
  }, []);

  const currentCurrency = CURRENCIES.find(c => c.id === selectedCurrency) || CURRENCIES[0];

  // Converts a MAD price to the selected currency and returns a formatted string
  const convertPrice = useCallback((madPrice: number): string => {
    const converted = madPrice * rates[selectedCurrency];
    const { symbol } = currentCurrency;

    if (selectedCurrency === 'MAD') {
      return `${converted.toFixed(2)} ${symbol}`;
    }
    // EUR and USD — symbol before the number
    return `${symbol}${converted.toFixed(2)}`;
  }, [selectedCurrency, rates, currentCurrency]);

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      setSelectedCurrency,
      currencies: CURRENCIES,
      currentCurrency,
      convertPrice,
      rates,
      isLoading,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};

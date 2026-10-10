'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, PRODUCTS_DB } from '@/lib/data';

interface ProductsContextProps {
  /** Full live product catalogue from Supabase. Falls back to static PRODUCTS_DB on error. */
  products: Product[];
  /** True while the initial fetch is in-flight */
  isLoading: boolean;
  /** Look up a single product by its numeric ID */
  getProductById: (id: number) => Product | undefined;
  /** Manually re-fetch the catalogue (e.g. after an admin edit) */
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextProps | undefined>(undefined);



/**
 * Maps a raw Supabase row to a typed Product object.
 * Keeps the same shape transformation used in /api/products/route.ts.
 */


export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS_DB);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      // The public API deliberately caps a catalogue request at 100 products.
      // The API route already reads from Supabase and maps rows to Product objects.
      const res = await fetch('/api/products?limit=100&page=1', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
      } else {
        // API returned empty or error — keep static fallback
        console.warn('[ProductsContext] API returned no products, using static fallback.');
      }
    } catch (err) {
      // Network error or Supabase down — silently fall back
      console.warn('[ProductsContext] Failed to load products from Supabase, using static fallback.', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getProductById = useCallback(
    (id: number) => products.find((p) => p.id === id),
    [products]
  );

  return (
    <ProductsContext.Provider value={{ products, isLoading, getProductById, refreshProducts: fetchProducts }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = (): ProductsContextProps => {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return ctx;
};

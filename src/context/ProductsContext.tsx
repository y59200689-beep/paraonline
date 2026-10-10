'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from './SettingsContext';
import { sectionProductIds } from '@/lib/section-product-ids';
import { Product, PRODUCTS_DB } from '@/lib/data';

interface ProductsContextProps {
  /** Initial catalogue plus explicitly selected section products. Falls back to static PRODUCTS_DB on error. */
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
  const { settings } = useSettings();
  const selectedIds = sectionProductIds(settings).join(',');
  const [products, setProducts] = useState<Product[]>(PRODUCTS_DB);
  const [isLoading, setIsLoading] = useState(true);

  const requestGeneration = useRef(0);
  const fetchProducts = useCallback(async () => {
    const generation = ++requestGeneration.current;
    setIsLoading(true);
    try {
      // The public API deliberately caps a catalogue request at 100 products.
      // The API route already reads from Supabase and maps rows to Product objects.
      const res = await fetch('/api/products?limit=100&page=1', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        const selected: Product[] = [];
        const ids = selectedIds ? selectedIds.split(',') : [];
        for (let offset = 0; offset < ids.length; offset += 50) {
          const response = await fetch(`/api/products?limit=100&ids=${ids.slice(offset, offset + 50).join(',')}`, { cache: 'no-store' });
          if (!response.ok) throw new Error('Section products unavailable.');
          const result = await response.json();
          if (!result.success || !Array.isArray(result.products)) throw new Error('Section products unavailable.');
          selected.push(...result.products);
        }
        if (generation !== requestGeneration.current) return;
        setProducts([...new Map([...data.products, ...selected].map((product: Product) => [product.id, product])).values()]);
      } else {
        // API returned empty or error — keep static fallback
        console.warn('[ProductsContext] API returned no products, using static fallback.');
      }
    } catch (err) {
      // Network error or Supabase down — silently fall back
      console.warn('[ProductsContext] Failed to load products from Supabase, using static fallback.', err);
    } finally {
      if (generation === requestGeneration.current) setIsLoading(false);
    }
  }, [selectedIds]);

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
